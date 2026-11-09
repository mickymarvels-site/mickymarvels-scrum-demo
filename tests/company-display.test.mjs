import test from 'node:test';
import assert from 'node:assert/strict';
import {companyTakeHomeDisplay} from '../staffing/company-display.mjs';
import {calculateCompanyTakeHome} from '../staffing/company.mjs';
import {mergeCameroonDefaults} from '../staffing/scenarios.mjs';
test('prominent take-home subtracts the owner reserve and matches final company amount',()=>{
 const a=mergeCameroonDefaults({assumptions:{camUsdXaf:'600',camCosts:'0',camRiskRate:'1.75',camHealthPremiumXaf:'0'}}).assumptions;
 const result=calculateCompanyTakeHome(a),display=companyTakeHomeDisplay(result,1,600);
 assert.equal(display.monthly,result.net);assert.equal(display.monthly,result.beforeTax-result.tax);assert.equal(display.biweekly,result.net*12/26);assert.equal(display.monthlyUsd,result.net/600);assert.equal(display.perWorker,result.net);assert.equal(display.provisional,false);
});
test('known-expense provisional take-home still deducts calculated tax without zeroing unknown costs',()=>{
 const result={isUS:false,beforeTax:3000000,tax:600000,missing:['operating expenses']},display=companyTakeHomeDisplay(result,2,600);
 assert.equal(display.monthly,2400000);assert.equal(display.perWorker,1200000);assert.equal(display.monthlyUsd,4000);assert.equal(display.provisional,true);assert.match(display.message,/excluded/);
});
test('missing owner reserve never presents a pre-tax subtotal as after-tax take-home',()=>{
 const display=companyTakeHomeDisplay({isUS:true,beforeTax:5000,tax:null,missing:['tax']},1,null);
 assert.equal(display.monthly,null);assert.equal(display.biweekly,null);assert.equal(display.monthlyUsd,null);assert.match(display.message,/Automatic federal estimate/);
 assert.equal(companyTakeHomeDisplay({isUS:true,beforeTax:5000,tax:0,missing:[]},0,null).monthly,5000);
});
