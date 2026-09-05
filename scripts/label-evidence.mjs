export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function evidenceTermMatches(text, term) {
  const pattern = escapeRegExp(term.toLowerCase()).replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, "i").test(text);
}
