import {stateTaxData} from './state-tax-data.mjs';
export const US_STATES=Object.entries(stateTaxData).map(([code,s])=>[code,s.name]).sort((a,b)=>a[1].localeCompare(b[1]));
export const FILING_STATUSES=[['single','Single / married filing separately'],['married','Married filing jointly'],['head_of_household','Head of household']];
export const payrollDefaults=Object.freeze({usState:'',usTaxYear:'2026',usFiling:'single',usW4Multiple:'0',usTaxCredits:'0',usOtherIncome:'0',usDeductions:'0',usExtraTax:'0',usStateOverride:'',usOverrideState:'',usOverrideFiling:'',camTaxXaf:'',camHealthWorkerXaf:'',camHealthCompanyXaf:''});
export function validAssumptions(a){
 if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).length>64)return false;
 return Object.entries(a).every(([key,v])=>{
  if(typeof v!=='string'||v.length>=100)return false;
  if(['usState','usOverrideState'].includes(key))return v===''||Object.hasOwn(stateTaxData,v);
  if(['usFiling','usOverrideFiling'].includes(key))return v===''||FILING_STATUSES.some(([id])=>id===v);
  if(key==='usW4Multiple')return ['0','1',''].includes(v);
  return v===''||(v.trim()!==''&&Number.isFinite(Number(v))&&Number(v)>=0);
 });
}
const number=v=>typeof v==='string'&&v.trim()!==''&&Number.isFinite(+v)&&+v>=0?+v:null;
// IRS Publication 15-T (2026), Worksheet 1A, annual percentage tables.
// Each row: adjusted annual wage lower bound, base withholding, marginal rate.
const federalTables={
 single:{standard:[[0,0,0],[7500,0,.10],[19900,1240,.12],[57900,5800,.22],[113200,17966,.24],[209275,41024,.32],[263725,58448,.35],[648100,192979.25,.37]],multiple:[[0,0,0],[8050,0,.10],[14250,620,.12],[33250,2900,.22],[60900,8983,.24],[108938,20512,.32],[136163,29224,.35],[328350,96489.63,.37]]},
 married:{standard:[[0,0,0],[19300,0,.10],[44100,2480,.12],[120100,11600,.22],[230700,35932,.24],[422850,82048,.32],[531750,116896,.35],[788000,206583.50,.37]],multiple:[[0,0,0],[16100,0,.10],[28500,1240,.12],[66500,5800,.22],[121800,17966,.24],[217875,41024,.32],[272325,58448,.35],[400450,103291.75,.37]]},
 head_of_household:{standard:[[0,0,0],[15550,0,.10],[33250,1770,.12],[83000,7740,.22],[121250,16155,.24],[217300,39207,.32],[271750,56631,.35],[656150,191171,.37]],multiple:[[0,0,0],[12075,0,.10],[20925,885,.12],[45800,3870,.22],[64925,8077.50,.24],[112950,19603.50,.32],[140175,28315.50,.35],[332375,95585.50,.37]]}
};
export function federalWithholding2026(annual,a){
 const table=federalTables[a.usFiling];
 const [credits,other,deductions,extra]=['usTaxCredits','usOtherIncome','usDeductions','usExtraTax'].map(k=>number(a[k]));
 if(!table||!['0','1'].includes(a.usW4Multiple)||[credits,other,deductions,extra].includes(null))return null;
 const multiple=a.usW4Multiple==='1';
 const adjusted=Math.max(0,annual+other-deductions-(multiple?0:a.usFiling==='married'?12900:8600));
 const row=(multiple?table.multiple:table.standard).findLast(([lower])=>adjusted>=lower);
 return Math.max(0,row[1]+(adjusted-row[0])*row[2]-credits)+extra;
}
export function stateTaxEstimate2026(annual,code,filing){
 const state=stateTaxData[code];
 if(!state)return null;
 if(!state.hasIncomeTax)return 0;
 if(state.figureYear!==2026||state.requiresOverride)return null;
 const t=state.tax,standard=t.standardDeduction?.[filing];
 // All figures are annual planning estimates, with each source's limitations shown in the UI.
 const taxable=Math.max(0,annual-(standard??0));
 if(t.type==='flat')return taxable*t.rate;
 const bands=t.brackets?.[filing];if(!bands)return null;
 let lower=0,tax=0;
 for(const {rate,upTo} of bands){const upper=upTo??Infinity;tax+=Math.max(0,Math.min(taxable,upper)-lower)*rate;lower=upper;if(taxable<=upper)break;}
 return tax;
}
export function calculateWorkerPayroll(a,scenario){
 const isUS=a.workerUs==='1',gross=scenario.monthlyPayPerWorker,workers=number(isUS?a.usWorkers:a.camWorkers);
 const empty={grossMonthly:gross,monthly:null,biweekly:null,companyHealthMonthly:null,companyHealthTeamMonthly:null,companyContributionTeamMonthly:null,notes:[],state:null};
 if(gross===null)return empty;
 if(isUS){
  const state=stateTaxData[a.usState];
  const notes=['Annualized W-2 planning estimate, not a payroll run. One resident/work state assumed. Local taxes, state disability/paid-leave deductions, reciprocity, credits and special adjustments are not fully modeled. No US health insurance is included.'];
  if(a.usTaxYear!=='2026')return {...empty,notes:['Automatic calculations support 2026 only. Entering another year leaves estimates unknown until its tables are added.']};
  const annual=gross*12,federal=federalWithholding2026(annual,a),socialSecurity=Math.min(annual,184500)*.062/12,medicare=(annual*.0145+Math.max(0,annual-200000)*.009)/12;
  const override=a.usOverrideState===a.usState&&a.usOverrideFiling===a.usFiling?number(a.usStateOverride):null;
  const stateMonthly=state&&FILING_STATUSES.some(([id])=>id===a.usFiling)?(override!==null?override:stateTaxEstimate2026(annual,a.usState,a.usFiling)===null?null:stateTaxEstimate2026(annual,a.usState,a.usFiling)/12):null;
  if(!state)notes.push('Choose the state in which the worker works and resides to estimate state income tax.');
  if(state){notes.push(...(state.disclaimer||[]));if(stateMonthly===null)notes.push('Automatic state amount is unverified for this selection. Enter a verified monthly state withholding amount to calculate take-home.');}
  if(override!==null&&state)notes.push('Using your manually entered monthly state withholding amount instead of the automatic estimate.');
  const monthly={gross,federal:federal===null?null:federal/12,state:stateMonthly,socialSecurity,medicare,workerInsurance:0};
  monthly.taxTotal=monthly.federal!==null&&stateMonthly!==null?monthly.federal+stateMonthly+socialSecurity+medicare:null;
  monthly.net=monthly.taxTotal===null?null:gross-monthly.taxTotal;
  if(monthly.net!==null&&monthly.net<0)notes.push('Deductions exceed gross pay; review the inputs before using this estimate.');
  return {...empty,state,monthly,biweekly:scale(monthly,12/26),notes,companyHealthMonthly:0,companyHealthTeamMonthly:0,companyContributionTeamMonthly:scenario.contribution};
 }
 const rate=number(a.camUsdXaf),tax=number(a.camTaxXaf),insurance=number(a.camHealthWorkerXaf),companyHealth=number(a.camHealthCompanyXaf);
 const converted=rate!==null&&rate>0?gross*rate:null;
 const monthly={gross:converted,manualTax:tax,workerInsurance:insurance,taxTotal:tax,net:converted!==null&&tax!==null&&insurance!==null?converted-tax-insurance:null};
 const notes=['Cameroon deductions are manual monthly XAF amounts per worker. Confirm local employment, tax, CNPS/social contributions and insurance obligations with a Cameroon payroll adviser. IRS rules do not determine these obligations. Blank means unknown; enter an explicit 0 when confirmed. Insurance is treated as an after-tax deduction.'];
 if(monthly.net!==null&&monthly.net<0)notes.push('Deductions exceed gross pay; review the inputs.');
 const companyHealthTeamMonthly=companyHealth!==null&&workers!==null&&Number.isInteger(workers)?companyHealth*workers:null;
 return {...empty,monthly,biweekly:scale(monthly,12/26),companyHealthMonthly:companyHealth,companyHealthTeamMonthly,companyContributionTeamMonthly:scenario.contribution!==null&&rate!==null&&rate>0&&companyHealthTeamMonthly!==null?scenario.contribution*rate-companyHealthTeamMonthly:null,notes};
}
function scale(object,factor){return Object.fromEntries(Object.entries(object).map(([key,value])=>[key,value===null?null:value*factor]));}
