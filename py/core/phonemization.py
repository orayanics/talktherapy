from __future__ import annotations

import logging
import re
from functools import lru_cache

from phonemizer import phonemize

IPA_REPLACEMENTS: list[tuple[str, str]] = [
    ("tʃ", "ch"),
    ("dʒ", "j"),
    ("ʃ", "sh"),
    ("ʒ", "zh"),
    ("θ", "th"),
    ("ð", "dh"),
    ("ŋ", "ng"),
    ("ɑ", "a"),
    ("æ", "a"),
    ("ɒ", "o"),
    ("ɔ", "o"),
    ("ɛ", "e"),
    ("ɪ", "i"),
    ("ʊ", "u"),
    ("ə", "e"),
    ("ɜ", "e"),
    ("ɹ", "r"),
    ("ɾ", "r"),
    ("ʌ", "u"),
    ("ː", ""),
    ("ˈ", ""),
    ("ˌ", ""),
]

DIGRAPHS: frozenset[str] = frozenset({"ch", "sh", "zh", "th", "dh", "ng"})
WORD_RE = re.compile(r"[A-Za-z0-9']+")

_ALLOWED_ALIGNMENT_CHARS: set[str] = set()
log = logging.getLogger("phoneme_service")


def configure_allowed_alignment_chars(characters: set[str]) -> None:
    global _ALLOWED_ALIGNMENT_CHARS
    _ALLOWED_ALIGNMENT_CHARS = set(characters)
    _cached_word_tokens.cache_clear()


def normalize_words(text: str) -> list[str]:
    return WORD_RE.findall(text.lower())


def normalize_text(text: str) -> str:
    return " ".join(normalize_words(text))


def _ipa_to_tokens(ipa: str) -> list[str]:
    for src, tgt in IPA_REPLACEMENTS:
        ipa = ipa.replace(src, tgt)
    return [c for c in ipa if c in _ALLOWED_ALIGNMENT_CHARS]


@lru_cache(maxsize=4096)
def _cached_word_tokens(word: str) -> tuple[str, ...]:
    ipa: str = phonemize(
        word,
        backend="espeak",
        language="en-us",
        with_stress=False,
    ).lower()
    tokens = _ipa_to_tokens(ipa)
    if not tokens:
        raise ValueError(f"No valid alignment tokens for word: {word!r}")
    return tuple(tokens)


def tokenize_text_with_word_map(text: str) -> tuple[list[str], list[int], list[str]]:
    words = normalize_words(text)

    tokens: list[str] = []
    token_word_indices: list[int] = []
    kept_words: list[str] = []

    for word in words:
        try:
            word_tokens = list(_cached_word_tokens(word))
        except Exception:
            log.warning("Skipping un-phonemizable word: %r", word)
            continue

        word_index = len(kept_words)
        kept_words.append(word)
        tokens.extend(word_tokens)
        token_word_indices.extend([word_index] * len(word_tokens))

    if not tokens:
        raise ValueError("No valid alignment tokens")

    return tokens, token_word_indices, kept_words
