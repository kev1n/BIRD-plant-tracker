export function isValidParam(param: string) {
  return /^\d+$/.test(param);
}

export function isValidPatch(param: string) {
  return /^[A-Z]\d+$/.test(param);