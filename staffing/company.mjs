import {calculateOwnerTax} from './owner-tax.mjs';
import {workerScenario,calculateCameroon} from './scenarios.mjs';
import {calculateWorkerPayroll} from './payroll.mjs';
const amount=value=>typeof value==='string'&&value.trim()!==''&&Number.isFinite(+value)&&+value>=0?+value:null;
export function calculateCompanyTakeHome(a){
 const {isUS,assumptions}=workerScenario(a),c=calculateCameroon(assumptions),p=calculateWorkerPayroll(a,c),rate=isUS?1:c.exchangeRate;
 const convert=value=>value===null||rate===null?null:value*rate;
 const revenue=convert(c.revenue),workerPay=convert(c.workerPay),spread=convert(c.grossSpread),costs=convert(c.additionalCosts);
 const employer=isUS?amount(a.usEmployerCosts):p.companyChargesTeamMonthly,insurance=isUS?0:p.companyHealthTeamMonthly;
 const workers=amount(assumptions.camWorkers),components=p.automatic||{};
 const knownComponents=['employerPension','employerFamily','employerInjury','employerHousing','employerEmployment'].map(key=>components[key]).filter(value=>value!==null&&value!==undefined);
 const knownEmployer=employer!==null?employer:!isUS&&workers!==null&&Number.isInteger(workers)&&knownComponents.length?knownComponents.reduce((sum,value)=>sum+value,0)*workers:null;
 const beforeTax=spread===null?null:spread-[knownEmployer,insurance,costs].filter(value=>value!==null).reduce((sum,value)=>sum+value,0);
 const ownerTax=calculateOwnerTax(beforeTax!==null&&rate!==null&&rate>0?beforeTax/rate:null,a),automaticTax=a[isUS?'usOwnerMode':'camOwnerMode']==='0';
 const tax=convert(automaticTax?ownerTax.monthly:amount(a[isUS?'usCompanyTax':'camCompanyTax']));
 const values={revenue,workerPay,spread,employer,insurance,costs,tax};
 const names={revenue:'client revenue / exchange rate',workerPay:'worker pay / exchange rate',employer:'employer charges (confirm CNPS risk group for Cameroon)',insurance:'company-paid insurance premium and share',costs:'additional operating expenses',tax:automaticTax?'owner tax assumptions (automatic supports default single-owner LLC, 2026 only)':'company tax provision'};
 const missing=Object.entries(names).filter(([key])=>values[key]===null).map(([,label])=>label);
 const net=missing.length?null:revenue-workerPay-employer-insurance-costs-tax;
 const subtotal=beforeTax===null?null:beforeTax-(tax??0);
 return {isUS,...values,net,knownEmployer,subtotal,beforeTax,ownerTax,automaticTax,taxProvisional:automaticTax&&[employer,insurance,costs].includes(null),subtotalPerWorker:subtotal!==null&&workers!==null&&workers>0?subtotal/workers:null,perWorker:net!==null&&workers!==null&&workers>0?net/workers:null,missing};
}
