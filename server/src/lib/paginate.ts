export interface Meta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export const buildMeta = (
  total: number,
  page: number,
  per_page: number,
  count: number,
): Meta => {
  const last_page = Math.ceil(total / per_page);

  return {
    current_page: page,
    from: total === 0 ? null : (page - 1) * per_page + 1,
    to: total === 0 ? null : (page - 1) * per_page + count,
    last_page,
    per_page,
    total,
  };
};
