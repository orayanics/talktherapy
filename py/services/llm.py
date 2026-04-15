from __future__ import annotations

import json
import logging
import re
from typing import Optional

import httpx

from models.dto import LLMFeedback, StructuredAssessment

OLLAMA_BASE_URL = "http://localhost:11434"
log = logging.getLogger("phoneme_service")

_SCHEMA_HINT = {
    "overallSummary": "string (1-2 short sentences)",
    "needsWork": [{"unit": "string", "note": "string"}],
    "accurate": [{"unit": "string", "note": "string"}],
    "nextPractice": ["string", "string"],
}

_SYSTEM = (
    "You are a speech-language pathology assistant. "
    "Return only strict JSON with constructive coaching and no markdown. "
    "Do not include numeric score fields. Schema:\n"
    + json.dumps(_SCHEMA_HINT, indent=2)
)

_STRICT_SCHEMA_SYSTEM = (
    "You are a speech-language pathology assistant. "
    "Return ONLY valid JSON. No markdown fences, no commentary, no trailing text. "
    "Do not invent units, words, or metrics not present in the analysis. "
    "Keep overallSummary to 1-2 short coaching sentences and keep notes concise. "
    "The JSON must match this exact shape:\n"
    + json.dumps(_SCHEMA_HINT, indent=2)
)


def _strip_json_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _extract_json_from_text(text: str) -> Optional[str]:
    if not text:
        return None
    start = next((i for i, c in enumerate(text) if c in "[{"), None)
    if start is None:
        return None

    opening = text[start]
    closing = "}" if opening == "{" else "]"
    depth = 0
    for i in range(start, len(text)):
        c = text[i]
        if c == opening:
            depth += 1
        elif c == closing:
            depth -= 1
            if depth == 0:
                return text[start : i + 1]

    return None


def _sanitize_text(value: str) -> str:
    # Remove explicit numeric score leakage from generated coaching text.
    cleaned = re.sub(r"\b\d+(?:\.\d+)?%\b", "", value)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    return cleaned.strip()


def _sanitize_llm_obj(obj: dict) -> dict:
    out = {
        "overallSummary": _sanitize_text(str(obj.get("overallSummary", ""))),
        "needsWork": [],
        "accurate": [],
        "nextPractice": [],
    }

    for key in ("needsWork", "accurate"):
        rows = obj.get(key, [])
        if not isinstance(rows, list):
            continue
        for row in rows[:10]:
            if not isinstance(row, dict):
                continue
            unit = str(row.get("unit", "")).strip()
            note = _sanitize_text(str(row.get("note", "")))
            if unit and note:
                out[key].append({"unit": unit, "note": note})

    next_practice = obj.get("nextPractice", [])
    if isinstance(next_practice, list):
        for item in next_practice[:5]:
            text = _sanitize_text(str(item))
            if text:
                out["nextPractice"].append(text)

    return out


async def _request_chat(
    client: httpx.AsyncClient,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
    read_timeout: float,
) -> str:
    response = await client.post(
        f"{OLLAMA_BASE_URL}/api/chat",
        json={
            "model": "qwen2.5:3b",
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
            "stream": False,
            "options": {"temperature": temperature, "top_p": 1, "seed": 42},
        },
        timeout=httpx.Timeout(connect=10.0, read=read_timeout, write=20.0, pool=10.0),
    )
    response.raise_for_status()
    return response.json().get("message", {}).get("content", "")


def _parse_llm_json(content: str) -> Optional[dict]:
    try:
        parsed = json.loads(_strip_json_fences(content))
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        candidate = _extract_json_from_text(content)
        if not candidate:
            return None
        try:
            parsed = json.loads(candidate)
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None


def _validate_feedback(parsed: dict) -> Optional[LLMFeedback]:
    sanitized = _sanitize_llm_obj(parsed)
    try:
        return LLMFeedback.model_validate(sanitized)
    except Exception:
        return None


async def fetch_llm_feedback(structured: StructuredAssessment) -> tuple[Optional[LLMFeedback], Optional[str]]:
    prompt = (
        "Use this as ground-truth pronunciation analysis. Do not invent units.\n"
        + structured.model_dump_json(indent=2)
    )

    retry_prompt = (
        "You MUST return ONLY valid JSON matching the schema exactly. "
        "No explanation, no markdown, no extra keys, no trailing text.\n\n"
        "Use this as ground-truth pronunciation analysis. Do not invent units.\n"
        + structured.model_dump_json(indent=2)
    )

    try:
        async with httpx.AsyncClient() as client:
            first_content = await _request_chat(
                client=client,
                system_prompt=_SYSTEM,
                user_prompt=prompt,
                temperature=0.2,
                read_timeout=45.0,
            )
    except httpx.HTTPError as exc:
        status = getattr(getattr(exc, "response", None), "status_code", "unknown")
        log.warning("LLM HTTP error on first pass: %s status=%s", type(exc).__name__, status)
        return None, f"LLM HTTP error: {type(exc).__name__} status={status}"

    first_parsed = _parse_llm_json(first_content)
    if isinstance(first_parsed, dict):
        first_model = _validate_feedback(first_parsed)
        if first_model is not None:
            return first_model, None
        log.warning("LLM first-pass JSON failed schema validation; attempting strict retry")
    else:
        log.warning("LLM first-pass output was not valid JSON; attempting strict retry")

    try:
        async with httpx.AsyncClient() as client:
            second_content = await _request_chat(
                client=client,
                system_prompt=_STRICT_SCHEMA_SYSTEM,
                user_prompt=retry_prompt,
                temperature=0.0,
                read_timeout=120.0,
            )
    except httpx.HTTPError as exc:
        status = getattr(getattr(exc, "response", None), "status_code", "unknown")
        log.warning("LLM HTTP error on retry pass: %s status=%s", type(exc).__name__, status)
        return None, f"LLM retry HTTP error: {type(exc).__name__} status={status}"

    second_parsed = _parse_llm_json(second_content)
    if not isinstance(second_parsed, dict):
        return None, "LLM retry response was not valid JSON"

    second_model = _validate_feedback(second_parsed)
    if second_model is None:
        return None, "LLM retry response did not match expected schema"

    return second_model, None
