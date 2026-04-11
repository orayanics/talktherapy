import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AccountStatus = t.Union(
  [
    t.Literal("pending"),
    t.Literal("active"),
    t.Literal("suspended"),
    t.Literal("inactive"),
  ],
  { additionalProperties: false },
);
