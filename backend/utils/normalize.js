export const normalize = (val) => {
  if (!val) return "";
  const cleaned = val.toString().replace(/\s+/g, "").trim().toUpperCase();
  return cleaned === "N/A" ? "" : cleaned;
};
