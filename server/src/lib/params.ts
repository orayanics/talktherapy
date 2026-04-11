// reusable helper: string | string[] → string[]
export const toStringArray = (val: unknown): string[] | undefined => {
  if (typeof val === "string") {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }

  return undefined;
};

// normalize legacy query keys like role[] → role
export const normalizeKeys = (input: unknown) => {
  if (!input || typeof input !== "object") return input;

  const obj = { ...(input as Record<string, unknown>) };

  if (obj["role[]"] !== undefined && obj.role === undefined) {
    obj.role = obj["role[]"];
  }

  if (
    obj["account_status[]"] !== undefined &&
    obj.account_status === undefined
  ) {
    obj.account_status = obj["account_status[]"];
  }

  // Generic: map any param like `foo[]` → `foo` when base key missing
  for (const key of Object.keys(obj)) {
    if (key.endsWith("[]")) {
      const base = key.slice(0, -2);
      if (obj[base] === undefined) {
        obj[base] = obj[key];
      }
    }
  }

  return obj;
};
