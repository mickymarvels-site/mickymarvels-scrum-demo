import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateCameroonEmployee,progressiveIrpp,ravMonthly,localDevelopmentMonthly} from '../staffing/cameroon-payroll.mjs';
import {calculateWorkerPayroll,validAssumptions} from '../staffing/payroll.mjs';
import {mergeCameroonDefaults,calculateCameroon,workerScenario} from '../staffing/scenarios.mjs';
const a=overrides=>mergeCameroonDefaults({assumptions:{workerUs:'0',camUsdXaf:'600',camRiskRate:'1.75',camHealthWorkerXaf:'0',camHealthCompanyXaf:'0',camCosts:'0',...overrides}}).assumptions;
const near=(x,y)=>assert.ok(Math.abs(x-y)<.00001,`${x} != ${y}`);
const payroll=assumptions=>calculateWorkerPayroll(assumptions,calculateCameroon(workerScenario(assumptions).assumptions));
test('2026 ordinary employee fixture at 960,000 XAF gross applies IRPP, CAC, capped pensions and separate employer costs',()=>{
 const inputs=a({}),c=calculateCameroonEmployee(960000,inputs);
 assert.equal(c.workerPension,31500);assert.equal(c.professionalDeduction,3456000);assert.equal(c.annualTaxable,7186000);
 // First 2m at 10%, next 1m at 15%, next 2m at 25%, remaining 2.186m at 35%.
 near(c.irpp,1615100/12);near(c.cac,c.irpp*.1);
 assert.equal(c.workerHousing,9600);assert.equal(c.rav,12350);assert.equal(c.tdl,2500);
 near(c.automaticDeductions,204000.8333333333);
 assert.equal(c.employerPension,31500);assert.equal(c.employerFamily,52500);assert.equal(c.employerInjury,16800);
 assert.equal(c.employerHousing,14400);assert.equal(c.employerEmployment,9600);assert.equal(c.employerTotal,124800);
 const p=payroll(inputs);near(p.monthly.net,755999.1666666667);assert.equal(p.companyContributionTeamMonthly,3235200);
 near(p.biweekly.taxTotal*26,p.monthly.taxTotal*12);near(p.biweekly.net*26,p.monthly.net*12);
});
test('progressive IRPP boundaries and 4.8m professional-expense cap are applied',()=>{
 for(const [base,tax] of [[0,0],[2000000,200000],[3000000,350000],[5000000,850000],[6000000,1200000]])assert.equal(progressiveIrpp(base),tax);
 const c=calculateCameroonEmployee(2000000,a({}));assert.equal(c.professionalDeduction,4800000);assert.equal(c.annualTaxable,18322000);
 assert.equal(calculateCameroonEmployee(61000,a({})).irpp,0);
 assert.equal(calculateCameroonEmployee(62000,a({})).irpp,0);
});
test('pension and family caps do not cap the injury base; family schemes and risk rates remain selectable',()=>{
 const below=calculateCameroonEmployee(500000,a({}));assert.equal(below.workerPension,21000);assert.equal(below.employerFamily,35000);
 const at=calculateCameroonEmployee(750000,a({})),above=calculateCameroonEmployee(1000000,a({}));
 assert.equal(at.workerPension,above.workerPension);assert.equal(at.employerFamily,above.employerFamily);assert.equal(above.employerInjury,17500);
 assert.equal(calculateCameroonEmployee(1000000,a({camRiskRate:'2.5'})).employerInjury,25000);
 assert.equal(calculateCameroonEmployee(1000000,a({camRiskRate:'5'})).employerInjury,50000);
 near(calculateCameroonEmployee(1000000,a({camFamilyRate:'5.65'})).employerFamily,42375);
 assert.equal(calculateCameroonEmployee(1000000,a({camFamilyRate:'3.7'})).employerFamily,27750);
});
test('RAV and TDL tables respect inclusive thresholds; CFC/FNE bases round down to a thousand',()=>{
 assert.equal(ravMonthly(50000),0);assert.equal(ravMonthly(50001),750);assert.equal(ravMonthly(1000000),12350);assert.equal(ravMonthly(1000001),13000);
 assert.equal(localDevelopmentMonthly(61999),0);assert.equal(localDevelopmentMonthly(62000),250);assert.equal(localDevelopmentMonthly(75000),250);assert.equal(localDevelopmentMonthly(75001),500);assert.equal(localDevelopmentMonthly(500001),2500);
 const c=calculateCameroonEmployee(960999,a({}));assert.equal(c.workerHousing,9600);assert.equal(c.employerHousing,14400);
});
test('unknown risk leaves employer total and contribution unknown; verified explicit zero override is respected',()=>{
 const unknown=payroll(a({camRiskRate:''}));assert.equal(unknown.automatic.employerTotal,null);assert.equal(unknown.companyContributionTeamMonthly,null);assert.notEqual(unknown.monthly.taxTotal,null);
 const overridden=payroll(a({camRiskRate:'',camEmployerXaf:'0'}));assert.equal(overridden.automatic.employerTotal,0);assert.equal(overridden.companyContributionTeamMonthly,3360000);
 assert.equal(payroll(a({camHealthCompanyXaf:''})).companyContributionTeamMonthly,null);
});
test('manual deductions replace the entire automatic worker total, without double counting employer override or insurance',()=>{
 const inputs=a({camTaxXaf:'50000',camTaxMode:'1',camHealthWorkerXaf:'10000',camHealthCompanyXaf:'25000',camEmployerXaf:'100000',camWorkers:'2'}),p=payroll(inputs);
 assert.equal(p.monthly.taxTotal,50000);assert.equal(p.monthly.net,900000);assert.equal(p.companyChargesTeamMonthly,200000);
 assert.equal(p.companyContributionTeamMonthly,6470000); // 6,720,000 - 200,000 - 50,000.
 assert.notEqual(p.automatic.automaticDeductions,p.monthly.taxTotal);
});
test('legacy manual totals and explicit zero retain manual mode; blank legacy totals gain automatic mode without losing records',()=>{
 for(const value of ['50000','0']){
  const old={candidates:[{id:'c1',name:'Existing'}],clients:[],placements:[],tasks:[],assumptions:{camTaxXaf:value,camUsdXaf:'590',camHealthCompanyXaf:''}};
  const before=structuredClone(old),merged=mergeCameroonDefaults(old);
  assert.equal(merged.assumptions.camTaxMode,'1');assert.equal(merged.assumptions.camTaxXaf,value);assert.deepEqual(merged.candidates,old.candidates);assert.deepEqual(old,before);assert.deepEqual(mergeCameroonDefaults(merged),merged);
 }
 assert.equal(mergeCameroonDefaults({assumptions:{camTaxXaf:''}}).assumptions.camTaxMode,'0');
 assert.equal(mergeCameroonDefaults({assumptions:{camTaxXaf:'50000',camTaxMode:'0'}}).assumptions.camTaxMode,'0');
});
test('base overrides, missing FX, unsupported year and blank insurance do not silently become zero',()=>{
 const p=payroll(a({camCnpsBaseXaf:'500000',camBasicXaf:'75000'}));assert.equal(p.automatic.workerPension,21000);assert.equal(p.automatic.tdl,250);
 assert.equal(payroll(a({camUsdXaf:''})).monthly.taxTotal,null);
 assert.equal(payroll(a({camTaxYear:'2027'})).monthly.taxTotal,null);
 assert.equal(payroll(a({camHealthWorkerXaf:''})).monthly.net,null);
 const zero=payroll(a({camPay:'0'}));assert.equal(zero.monthly.net,0);assert.equal(zero.automatic.employerTotal,0);
});
test('Cameroon enums and numeric amounts are validated before storage',()=>{
 assert.ok(validAssumptions(a({})));
 for(const bad of [{camTaxMode:'9'},{camFamilyRate:'99'},{camRiskRate:'0'},{camEmployerXaf:'-1'},{camCnpsBaseXaf:'Infinity'}])assert.equal(validAssumptions(a(bad)),false);
});
