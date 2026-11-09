// Flat string assumptions share the existing authenticated workspace save contract.
export const cameroonDefaults = Object.freeze({camBill:'45',camPay:'10',camHours:'160',camWorkers:'1',camCosts:''});
export function mergeCameroonDefaults(workspace) {
  const assumptions = {...workspace.assumptions};
  for (const [key,value] of Object.entries(cameroonDefaults)) {
    if (!Object.hasOwn(assumptions,key)) assumptions[key] = value;
  }
  return {...workspace,assumptions};
}
const amount = value => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export function calculateCameroon(a) {
  const [bill,pay,hours,workers,costs] = ['camBill','camPay','camHours','camWorkers','camCosts'].map(key=>amount(a[key]));
  const ratesKnown = bill !== null && pay !== null;
  const baseKnown = ratesKnown && hours !== null && workers !== null && Number.isInteger(workers);
  const revenue = baseKnown ? bill * hours * workers : null;
  const workerPay = baseKnown ? pay * hours * workers : null;
  const grossSpread = baseKnown ? revenue - workerPay : null;
  return {revenue,workerPay,hourlySpread:ratesKnown ? bill-pay : null,grossSpread,
    grossMargin:baseKnown && revenue > 0 ? grossSpread/revenue*100 : null,
    additionalCosts:costs,contribution:grossSpread !== null && costs !== null ? grossSpread-costs : null};
}
