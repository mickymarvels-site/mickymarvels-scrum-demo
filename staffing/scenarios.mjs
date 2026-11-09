// Flat string assumptions share the existing authenticated workspace save contract.
export const cameroonDefaults = Object.freeze({camBill:'45',camPay:'10',camHours:'160',camWorkers:'1',camCosts:'',camUsdXaf:''});
export const workerDefaults=Object.freeze({workerUs:'0',usBill:'65',usPay:'45',usHours:'160',usWorkers:'1',usCosts:''});
export function workerScenario(a){
  const isUS=a.workerUs==='1';
  return {isUS,assumptions:isUS?{camBill:a.usBill,camPay:a.usPay,camHours:a.usHours,camWorkers:a.usWorkers,camCosts:a.usCosts,camUsdXaf:a.camUsdXaf}:a};
}
export function mergeCameroonDefaults(workspace) {
  const assumptions = {...workspace.assumptions};
  for (const [key,value] of Object.entries({...cameroonDefaults,...workerDefaults})) {
    if (!Object.hasOwn(assumptions,key)) assumptions[key] = value;
  }
  return {...workspace,assumptions};
}
const amount = value => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export function calculateCameroon(a) {
  const [bill,pay,hours,workers,costs] = ['camBill','camPay','camHours','camWorkers','camCosts'].map(key=>amount(a[key]));
  const exchangeRate=amount(a.camUsdXaf);
  const fxKnown=exchangeRate !== null && exchangeRate > 0;
  const monthlyPayPerWorker=pay !== null && hours !== null ? pay*hours : null;
  const totalPay=monthlyPayPerWorker !== null && workers !== null && Number.isInteger(workers) ? monthlyPayPerWorker*workers : null;
  const ratesKnown = bill !== null && pay !== null;
  const baseKnown = ratesKnown && hours !== null && workers !== null && Number.isInteger(workers);
  const revenue = baseKnown ? bill * hours * workers : null;
  const workerPay = baseKnown ? pay * hours * workers : null;
  const grossSpread = baseKnown ? revenue - workerPay : null;
  // Annualize monthly hours, then divide across 26 two-week periods.
  const biweekly = value => value === null ? null : value*12/26;
  const grossSpreadPerWorker=ratesKnown && hours !== null ? (bill-pay)*hours : null;
  return {revenue,workerPay,monthlyPayPerWorker,
    biweeklyHours:biweekly(hours),biweeklyPayPerWorker:biweekly(monthlyPayPerWorker),
    biweeklyTeamPay:biweekly(totalPay),biweeklyGrossSpreadPerWorker:biweekly(grossSpreadPerWorker),
    biweeklyTeamGrossSpread:biweekly(grossSpread),
    revenuePerWorker:bill !== null && hours !== null ? bill*hours : null,
    grossSpreadPerWorker,exchangeRate:fxKnown?exchangeRate:null,
    hourlyPayXaf:fxKnown && pay !== null ? pay*exchangeRate : null,
    monthlyPayPerWorkerXaf:fxKnown && monthlyPayPerWorker !== null ? monthlyPayPerWorker*exchangeRate : null,
    monthlyTeamPayXaf:fxKnown && totalPay !== null ? totalPay*exchangeRate : null,hourlySpread:ratesKnown ? bill-pay : null,grossSpread,
    grossMargin:baseKnown && revenue > 0 ? grossSpread/revenue*100 : null,
    additionalCosts:costs,contribution:grossSpread !== null && costs !== null ? grossSpread-costs : null};
}
