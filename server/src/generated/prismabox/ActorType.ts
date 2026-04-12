import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ActorType = t.Union(
  [t.Literal("patient"), t.Literal("clinician")],
  { additionalProperties: false },
);
