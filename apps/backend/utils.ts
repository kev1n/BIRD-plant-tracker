export function isValidParam(param: string){
  return (!/^\d+$/.test(param))
}
