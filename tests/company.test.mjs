import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateCompanyTakeHome} from '../staffing/company.mjs';
import {mergeCameroonDefaults} from '../staffing/scenarios.mjs';
import {validAssumptions} from '../staffing/payroll.mjs';
const inputs=overrides=>mergeCameroonDefaults({assumptions:{camUsdXaf:'600',camRiskRate:'1.75',camCosts:'100',camCompanyTax:'50',camHealthPremiumXaf:'75000',camHealthEmployerShare:'60',...overrides}}).assumptions;
test('Micky Cameroon cash flow deducts gross wages and each company expense once',()=>{
 const p=calculateCompanyTakeHome(inputs({}));
 assert.equal(p.revenue,4320000);assert.equal(p.workerPay,960000);assert.equal(p.employer,124800);assert.equal(p.insurance,45000);assert.equal(p.costs,60000);assert.equal(p.tax,30000);assert.equal(p.net,3100200);assert.equal(p.perWorker,p.net);
 // Worker deductions change take-home pay, not company gross payroll expense.
 assert.equal(calculateCompanyTakeHome(inputs({camTaxMode:'1',camTaxXaf:'50000'})).net,p.net);
});
test('Micky US expenses remain separate from employee deductions and Cameroon settings',()=>{
 const p=calculateCompanyTakeHome(inputs({workerUs:'1',usCosts:'200',usEmployerCosts:'700',usCompanyTax:'300'}));
 assert.equal(p.revenue,10400);assert.equal(p.workerPay,7200);assert.equal(p.net,2000);assert.equal(p.insurance,0);
 assert.equal(calculateCompanyTakeHome(inputs({workerUs:'1',usCosts:'0',usEmployerCosts:'0',usCompanyTax:'0'})).net,3200);
});
test('missing expenses do not silently become zero; negative contribution remains visible',()=>{
 for(const override of [{camCompanyTax:''},{camCosts:''},{camHealthPremiumXaf:''},{camRiskRate:''},{camUsdXaf:''}])assert.equal(calculateCompanyTakeHome(inputs(override)).net,null);
 assert.ok(calculateCompanyTakeHome(inputs({camCosts:'10000'})).net<0);
 const p=calculateCompanyTakeHome(inputs({camWorkers:'2'}));assert.equal(p.perWorker,p.net/2);
});
test('old workspaces retain records and saved assumptions while new expense defaults stay unknown',()=>{
 const old={candidates:[{id:'1',name:'Existing'}],clients:[],tasks:[],placements:[],assumptions:{camCosts:'0',usCompanyTax:'25'}},before=structuredClone(old),merged=mergeCameroonDefaults(old);
 assert.deepEqual(old,before);assert.deepEqual(merged.candidates,old.candidates);assert.equal(merged.assumptions.camCosts,'0');assert.equal(merged.assumptions.usCompanyTax,'25');assert.equal(merged.assumptions.camCompanyTax,'');assert.equal(merged.assumptions.usEmployerCosts,'');assert.ok(validAssumptions(merged.assumptions));assert.deepEqual(mergeCameroonDefaults(merged),merged);
});

test('automatic subtotal includes known employer components while missing costs remain unknown',()=>{
 const a=inputs({camUsdXaf:'550',camRiskRate:'',camCosts:'',camCompanyTax:'',camHealthPremiumXaf:'60000',camHealthEmployerShare:'100'}),p=calculateCompanyTakeHome(a);
 assert.equal(p.spread,3080000);assert.equal(p.employer,null);assert.equal(p.costs,null);assert.equal(p.tax,null);assert.equal(p.net,null);
 assert.equal(p.knownEmployer,106000);assert.equal(p.subtotal,2914000);assert.equal(p.subtotalPerWorker,2914000);
 assert.equal(a.camCosts,'');assert.equal(a.camCompanyTax,'');
 const complete=calculateCompanyTakeHome({...a,camRiskRate:'1.75',camCosts:'0',camCompanyTax:'0'});
 assert.equal(complete.subtotal,complete.net);assert.equal(complete.net,2898600);
});
test('subtotal updates with expense changes, respects overrides, and requires revenue/pay',()=>{
 const a=inputs({camEmployerXaf:'100000'}),p=calculateCompanyTakeHome(a);
 assert.equal(p.knownEmployer,100000);assert.equal(p.subtotal,p.net);
 assert.equal(calculateCompanyTakeHome({...a,camCosts:'200'}).subtotal,p.subtotal-60000);
 assert.equal(calculateCompanyTakeHome({...a,camUsdXaf:''}).subtotal,null);
 assert.equal(calculateCompanyTakeHome({...a,camPay:''}).subtotal,null);
 const us=calculateCompanyTakeHome(inputs({workerUs:'1'}));assert.equal(us.subtotal,3200);assert.equal(us.net,null);
});
