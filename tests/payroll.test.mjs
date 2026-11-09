import test from 'node:test';
import assert from 'node:assert/strict';
import {US_STATES,payrollDefaults,calculateWorkerPayroll,federalWithholding2026,stateTaxEstimate2026,validAssumptions} from '../staffing/payroll.mjs';
import {mergeCameroonDefaults,workerScenario,calculateCameroon} from '../staffing/scenarios.mjs';
import {validData} from '../lib/staffing-service.mjs';
const assumptions=overrides=>mergeCameroonDefaults({assumptions:{workerUs:'1',usState:'FL',...overrides}}).assumptions;
const calculate=a=>calculateWorkerPayroll(a,calculateCameroon(workerScenario(a).assumptions));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.00001,`${actual} != ${expected}`);
test('selector includes all 50 US states and DC exactly once',()=>{
 assert.equal(US_STATES.length,51);assert.equal(new Set(US_STATES.map(([code])=>code)).size,51);
 for(const code of ['AL','AK','CA','FL','HI','TX','WY','DC'])assert.ok(US_STATES.some(([c])=>c===code));
});
test('2026 standard W-4 federal fixture: $86,400 annual single, IRS Worksheet 1A',()=>{
 const a=assumptions({});
 // Adjusted wages = 86,400 - 8,600 = 77,800. Table: 5,800 + (77,800 - 57,900) * 22%.
 assert.equal(federalWithholding2026(86400,a),10178);
 assert.equal(federalWithholding2026(16100,a),0);
 assert.equal(federalWithholding2026(86400,{...a,usFiling:'married'}),6008);
 // Step 2 checkbox: 8,983 + (86,400 - 60,900) * 24%.
 assert.equal(federalWithholding2026(86400,{...a,usW4Multiple:'1'}),15103);
 assert.equal(federalWithholding2026(86400,{...a,usTaxCredits:'2000',usExtraTax:'600'}),8778);
 assert.equal(federalWithholding2026(86400,{...a,usOtherIncome:'1000',usDeductions:'1000'}),10178);
});
test('Florida W-2 pay deducts federal income, employee SS and Medicare but no health insurance',()=>{
 const p=calculate(assumptions({}));
 assert.equal(p.monthly.gross,7200);near(p.monthly.federal,10178/12);
 assert.equal(p.monthly.state,0);near(p.monthly.socialSecurity,446.4);near(p.monthly.medicare,104.4);
 assert.equal(p.monthly.workerInsurance,0);near(p.monthly.net,5801.033333333);
 near(p.biweekly.net*26,p.monthly.net*12);assert.equal(p.companyHealthTeamMonthly,0);
});
test('FICA respects annual SS wage cap and $200,000 employer Additional Medicare threshold for all statuses',()=>{
 const a=assumptions({usPay:'200',usHours:'160',usFiling:'married'}),p=calculate(a);
 near(p.monthly.socialSecurity,184500*.062/12);
 near(p.monthly.medicare,(384000*.0145+184000*.009)/12);
});
test('automatic state estimates are nonnegative; unverified schedules stay unknown rather than use stale rates',()=>{
 for(const [code] of US_STATES){
  const value=stateTaxEstimate2026(86400,code,'single');
  if(['CA','AR','OH'].includes(code))assert.equal(value,null);
  else assert.ok(Number.isFinite(value)&&value>=0,code);
 }
 assert.equal(stateTaxEstimate2026(86400,'PA','single'),86400*.0307);
 assert.equal(stateTaxEstimate2026(86400,'XX','single'),null);
 for(const code of ['AK','FL','NV','NH','SD','TN','TX','WA','WY'])assert.equal(stateTaxEstimate2026(86400,code,'single'),0);
});
test('missing state, unverified state and unsupported years cannot display a misleading known take-home',()=>{
 for(const overrides of [{usState:''},{usState:'CA'},{usTaxYear:'2027'},{usTaxYear:''},{usFiling:''},{usTaxCredits:''}]){
  const p=calculate(assumptions(overrides));assert.equal(p.monthly?.net??null,null);
 }
});
test('state override is tied to state and filing status, and explicitly entered zero is respected',()=>{
 const a=assumptions({usState:'CA',usStateOverride:'250',usOverrideState:'CA',usOverrideFiling:'single'});
 assert.equal(calculate(a).monthly.state,250);
 assert.equal(calculate({...a,usState:'OH'}).monthly.state,null);
 assert.equal(calculate({...a,usFiling:'married'}).monthly.state,null);
 assert.equal(calculate({...a,usStateOverride:'0'}).monthly.state,0);
 assert.equal(calculate({...a,usStateOverride:''}).monthly.state,null);
});
test('Cameroon manual taxes and split health insurance affect the correct party',()=>{
 const a=assumptions({workerUs:'0',camUsdXaf:'600',camTaxXaf:'50000',camHealthWorkerXaf:'10000',camHealthCompanyXaf:'25000',camWorkers:'2',camCosts:'0'}),p=calculate(a);
 assert.equal(p.monthly.gross,960000);assert.equal(p.monthly.net,900000);
 near(p.biweekly.net,900000*12/26);assert.equal(p.companyHealthTeamMonthly,50000);assert.equal(p.companyContributionTeamMonthly,6670000);
 // Worker deductions do not increase gross spread. Company insurance is a separate company expense.
 const c=calculateCameroon(workerScenario(a).assumptions);assert.equal(c.grossSpread,11200);
});
test('Cameroon unknown versus explicit zero, exchange rate and zero headcount are preserved',()=>{
 const a=assumptions({workerUs:'0',camUsdXaf:'600',camTaxXaf:'0',camHealthWorkerXaf:'0',camHealthCompanyXaf:'0'});
 assert.equal(calculate(a).monthly.net,960000);
 for(const overrides of [{camTaxXaf:''},{camHealthWorkerXaf:''},{camUsdXaf:''},{camUsdXaf:'0'}])assert.equal(calculate({...a,...overrides}).monthly.net,null);
 assert.equal(calculate({...a,camHealthCompanyXaf:''}).companyHealthTeamMonthly,null);assert.equal(calculate({...a,camHealthCompanyXaf:''}).companyContributionTeamMonthly,null);
 assert.equal(calculate({...a,camWorkers:'0'}).companyHealthTeamMonthly,0);
});
test('deductions greater than gross pay remain visible as a negative amount with a review note',()=>{
 const p=calculate(assumptions({usStateOverride:'9000',usOverrideState:'FL',usOverrideFiling:'single'}));
 assert.ok(p.monthly.net<0);assert.ok(p.notes.some(note=>note.includes('exceed gross')));
});
test('legacy merge safely adds tax fields without changing records, blank costs, rates or saved choices',()=>{
 const legacy={candidates:[{id:'c1',name:'Existing'}],clients:[],placements:[],tasks:[],assumptions:{bill:'70',pay:'45',hours:'160',headcount:'1',burden:'',benefits:'',contractorCost:'',overhead:'',days:'30',camTaxXaf:'0',usState:'TX',usFiling:'married',camHealthCompanyXaf:'',camPay:'12'}};
 const before=structuredClone(legacy),merged=mergeCameroonDefaults(legacy);
 assert.deepEqual(legacy,before);assert.deepEqual(merged.candidates,legacy.candidates);
 for(const [key,value] of Object.entries(legacy.assumptions))assert.equal(merged.assumptions[key],value);
 assert.ok(validData(merged));assert.ok(Object.keys(merged.assumptions).length>30);
 assert.deepEqual(mergeCameroonDefaults(merged),merged);
});
test('backend schema accepts valid state/filing values and rejects forged values, oversized input and invalid numbers',()=>{
 const a=assumptions({});assert.ok(validAssumptions(a));
 for(const bad of [{usState:'XX'},{usFiling:'invalid'},{usTaxCredits:'-1'},{camTaxXaf:'Infinity'},{usW4Multiple:'2'},{usState:17},{usPay:' '}])assert.equal(validAssumptions({...a,...bad}),false);
 assert.equal(validAssumptions(Object.fromEntries(Array.from({length:65},(_,i)=>['x'+i,'0']))),false);
});
