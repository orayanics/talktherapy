import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SlotStatus = t.Union(
  [
    t.Literal("FREE"),
    t.Literal("PENDING"),
    t.Literal("ACCEPTED"),
    t.Literal("REJECT"),
    t.Literal("CANCELLED"),
    t.Literal("COMPLETED"),
  ],
  { additionalProperties: false },
);
