import test from 'node:test';
import assert from 'node:assert/strict';
import {ownerTaxDefaults,calculateOwnerTax,ownerIncomeTax2026} from '../staffing/owner-tax.mjs';
import {mergeCameroonDefaults} from '../staffing/scenarios.mjs';
import {calculateCompanyTakeHome} from '../staffing/company.mjs';
import {validAssumptions} from '../staffing/payroll.mjs';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.00001,`${actual} != ${expected}`);
test('2026 Schedule C fixture includes SE adjustment, half-SE deduction and progressive income tax',()=>{
 const t=calculateOwnerTax(5000,ownerTaxDefaults);
 near(t.selfEmployment,8477.73);near(t.incomeTax,4511.3362);near(t.annual,12989.0662);near(t.monthly,t.annual/12);assert.equal(t.additionalMedicare,0);
 assert.equal(ownerIncomeTax2026(12400,'0'),1240);assert.equal(ownerIncomeTax2026(50400,'0'),5800);
 assert.equal(ownerIncomeTax2026(100800,'1'),11600);assert.equal(ownerIncomeTax2026(67450,'2'),7740);assert.equal(ownerIncomeTax2026(384350,'3'),103291.75);
});
test('own wages consume the SS cap; spouse wages only enter joint-return income and Medicare threshold',()=>{
 const a={...ownerTaxDefaults,ownerWages:'180000'},t=calculateOwnerTax(5000,a);
 near(t.selfEmployment,4500*.124+55410*.029);near(t.additionalMedicare,35410*.009);
 const joint=calculateOwnerTax(5000,{...ownerTaxDefaults,ownerFiling:'1',ownerSpouseWages:'230000'});
 near(joint.selfEmployment,8477.73);near(joint.additionalMedicare,35410*.009);
 assert.deepEqual(calculateOwnerTax(5000,{...ownerTaxDefaults,ownerSpouseWages:'230000'}),calculateOwnerTax(5000,ownerTaxDefaults));
 assert.ok(calculateOwnerTax(5000,{...ownerTaxDefaults,ownerOtherIncome:'100000'}).incomeTax>calculateOwnerTax(5000,ownerTaxDefaults).incomeTax);
});
test('losses, zero and below-threshold earnings do not create SE tax or assumed tax refunds',()=>{
 for(const monthly of [-500,0,400/12]){const t=calculateOwnerTax(monthly,ownerTaxDefaults);assert.equal(t.selfEmployment,0);assert.equal(t.annual,0);}
 assert.ok(calculateOwnerTax(500/12,ownerTaxDefaults).selfEmployment>0);
});
test('unsupported elections, years and incomplete assumptions remain unknown',()=>{
 for(const override of [{ownerTreatment:'1'},{ownerTreatment:'2'},{ownerTreatment:'3'},{ownerYear:'2027'},{ownerFiling:'7'},{ownerOtherIncome:''},{ownerWages:''},{ownerSpouseWages:''}])assert.equal(calculateOwnerTax(5000,{...ownerTaxDefaults,...override}).monthly,null);
 assert.equal(calculateOwnerTax(null,ownerTaxDefaults).monthly,null);
 for(const override of [{ownerTreatment:'5'},{ownerFiling:'9'},{camOwnerMode:'2'},{ownerWages:'-1'}])assert.equal(validAssumptions({...ownerTaxDefaults,...override}),false);
});
test('automatic reserve feeds company take-home once, converts USD to XAF, and marks partial expenses provisional',()=>{
 const a=mergeCameroonDefaults({assumptions:{camUsdXaf:'600',camCosts:'0',camHealthPremiumXaf:'0',camRiskRate:'1.75'}}).assumptions;
 const p=calculateCompanyTakeHome(a);assert.equal(p.automaticTax,true);assert.equal(p.taxProvisional,false);
 near(p.tax,calculateOwnerTax(5392,a).monthly*600);near(p.net,3235200-p.tax);near(p.subtotal,p.net);
 const changed=calculateCompanyTakeHome({...a,camCosts:'100'});assert.ok(changed.tax<p.tax);assert.ok(changed.net<p.net);
 const partial=calculateCompanyTakeHome({...a,camRiskRate:''});assert.equal(partial.net,null);assert.equal(partial.taxProvisional,true);assert.ok(partial.tax>0);assert.ok(partial.subtotal>0);
 assert.equal(calculateCompanyTakeHome({...a,ownerTreatment:'1'}).tax,null);
});
test('legacy manual reserves including zero migrate independently and no records are changed',()=>{
 const old={candidates:[{id:'existing',name:'Existing'}],clients:[],placements:[],tasks:[],assumptions:{camCompanyTax:'0',usCompanyTax:'250'}},before=structuredClone(old),merged=mergeCameroonDefaults(old);
 assert.deepEqual(old,before);assert.equal(merged.assumptions.camOwnerMode,'1');assert.equal(merged.assumptions.usOwnerMode,'1');assert.equal(merged.assumptions.camCompanyTax,'0');assert.equal(merged.assumptions.usCompanyTax,'250');assert.deepEqual(merged.candidates,old.candidates);assert.deepEqual(mergeCameroonDefaults(merged),merged);
 assert.equal(mergeCameroonDefaults({assumptions:{camCompanyTax:''}}).assumptions.camOwnerMode,'0');
 const manual=calculateCompanyTakeHome({...merged.assumptions,camUsdXaf:'600',camCosts:'0',camRiskRate:'1.75',camHealthPremiumXaf:'0'});assert.equal(manual.tax,0);
});
