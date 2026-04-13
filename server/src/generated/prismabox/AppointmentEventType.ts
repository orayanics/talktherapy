import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AppointmentEventType = t.Union([t.Literal("STATUS_CHANGE")], {
  additionalProperties: false,
});
