import {workerScenario,calculateCameroon} from './scenarios.mjs';
import {calculateWorkerPayroll} from './payroll.mjs';
const amount=value=>typeof value==='string'&&value.trim()!==''&&Number.isFinite(+value)&&+value>=0?+value:null;
export function calculateCompanyTakeHome(a){
 const {isUS,assumptions}=workerScenario(a),c=calculateCameroon(assumptions),p=calculateWorkerPayroll(a,c),rate=isUS?1:c.exchangeRate;
 const convert=value=>value===null||rate===null?null:value*rate;
 const revenue=convert(c.revenue),workerPay=convert(c.workerPay),spread=convert(c.grossSpread),costs=convert(c.additionalCosts);
 const employer=isUS?amount(a.usEmployerCosts):p.companyChargesTeamMonthly,insurance=isUS?0:p.companyHealthTeamMonthly,tax=convert(amount(a[isUS?'usCompanyTax':'camCompanyTax']));
 const values={revenue,workerPay,spread,employer,insurance,costs,tax};
 const names={revenue:'client revenue / exchange rate',workerPay:'worker pay / exchange rate',employer:'employer charges (confirm CNPS risk group for Cameroon)',insurance:'company-paid insurance premium and share',costs:'additional operating expenses',tax:'company tax provision'};
 const missing=Object.entries(names).filter(([key])=>values[key]===null).map(([,label])=>label);
 const net=missing.length?null:revenue-workerPay-employer-insurance-costs-tax,workers=amount(assumptions.camWorkers);
 return {isUS,...values,net,perWorker:net!==null&&workers!==null&&workers>0?net/workers:null,missing};
}
