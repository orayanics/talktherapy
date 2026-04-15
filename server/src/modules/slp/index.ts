import Elysia from "elysia";

import { betterAuthPlugin } from "@/plugin/better-auth";
import { ApiError, ApiSuccess, error, ok } from "@/lib/response";

const SLP_SERVICE_URL = process.env.SLP_SERVICE_URL;

export const slpModule = new Elysia({ prefix: "/slp" })
  .use(betterAuthPlugin)
  .post(
    "/assess",
    async ({ request, status }) => {
      let formData: FormData;

      try {
        formData = await request.formData();
      } catch {
        return status(400, error("Invalid multipart form payload"));
      }

      const audio = formData.get("audio");
      const referenceText = formData.get("referenceText");

      if (!(audio instanceof File)) {
        return status(400, error("audio file is required"));
      }

      if (typeof referenceText !== "string" || !referenceText.trim()) {
        return status(400, error("referenceText is required"));
      }

      const upstreamForm = new FormData();
      upstreamForm.set("audio", audio, audio.name || "recording.webm");
      upstreamForm.set("referenceText", referenceText);

      let upstreamResponse: Response;
      try {
        upstreamResponse = await fetch(`${SLP_SERVICE_URL}/assess`, {
          method: "POST",
          body: upstreamForm,
        });
      } catch {
        return status(502, error("SLP service is unavailable"));
      }

      if (!upstreamResponse.ok) {
        const raw = await upstreamResponse.text();
        const message = raw?.trim() || "SLP assessment failed";
        return status(502, error(message));
      }

      const payload = await upstreamResponse.json();
      return status(200, ok(payload));
    },
    {
      auth: true,
      response: {
        200: ApiSuccess(),
        400: ApiError,
        401: ApiError,
        502: ApiError,
      },
    },
  );
