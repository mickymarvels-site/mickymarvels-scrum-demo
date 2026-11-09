import test from 'node:test';
import assert from 'node:assert/strict';
import {cameroonDefaults,calculateCameroon,mergeCameroonDefaults} from '../staffing/scenarios.mjs';
import {validData} from '../lib/staffing-service.mjs';
test('one worker default scenario computes the requested gross spread, leaving costs unknown',()=>{
 const c=calculateCameroon(cameroonDefaults);
 assert.equal(c.revenue,7200);assert.equal(c.workerPay,1600);assert.equal(c.hourlySpread,35);
 assert.equal(c.grossSpread,5600);assert.equal(c.grossMargin.toFixed(1),'77.8');
 assert.equal(c.additionalCosts,null);assert.equal(c.contribution,null);
});
test('explicit zero differs from blank, missing, whitespace and invalid additional costs',()=>{
 for(const value of ['',undefined,null,' ','invalid','-1','Infinity']){
  const c=calculateCameroon({...cameroonDefaults,camCosts:value});
  assert.equal(c.additionalCosts,null);assert.equal(c.contribution,null);
 }
 assert.equal(calculateCameroon({...cameroonDefaults,camCosts:'0'}).contribution,5600);
});
test('team scaling, fractional rates, and team-wide costs are independent of worker count',()=>{
 const c=calculateCameroon({...cameroonDefaults,camBill:'45.50',camPay:'10.25',camWorkers:'3',camCosts:'450.50'});
 assert.equal(c.revenue,21840);assert.equal(c.workerPay,4920);assert.equal(c.hourlySpread,35.25);
 assert.equal(c.grossSpread,16920);assert.equal(c.contribution,16469.50);
});
test('zero revenue has no defined margin; losses remain negative; incomplete assumptions remain unknown',()=>{
 assert.equal(calculateCameroon({...cameroonDefaults,camBill:'0'}).grossMargin,null);
 assert.equal(calculateCameroon({...cameroonDefaults,camWorkers:'0',camCosts:'100'}).contribution,-100);
 assert.equal(calculateCameroon({...cameroonDefaults,camPay:'50'}).grossSpread,-800);
 assert.equal(calculateCameroon({...cameroonDefaults,camCosts:'6000'}).contribution,-400);
 for(const key of ['camBill','camPay','camHours','camWorkers']){
  const c=calculateCameroon({...cameroonDefaults,[key]:''});
  assert.equal(c.revenue,null);assert.equal(c.contribution,null);
 }
 assert.equal(calculateCameroon({...cameroonDefaults,camWorkers:'1.5'}).revenue,null);
});
test('legacy default merge is immutable, preserves records and all existing assumptions, and is idempotent',()=>{
 const legacy={candidates:[{id:'c1',name:'Existing candidate'}],clients:[{id:'o1',name:'Existing client'}],placements:[{id:'p1',candidate:'c1',client:'o1'}],tasks:[{id:'t1',name:'Existing task'}],assumptions:{bill:'80',pay:'35',hours:'120',headcount:'2',overhead:'250',burden:'',custom:'9'}};
 const before=structuredClone(legacy),merged=mergeCameroonDefaults(legacy);
 assert.deepEqual(legacy,before);
 for(const key of ['candidates','clients','placements','tasks'])assert.deepEqual(merged[key],legacy[key]);
 for(const [key,value] of Object.entries(legacy.assumptions))assert.equal(merged.assumptions[key],value);
 for(const [key,value] of Object.entries(cameroonDefaults))assert.equal(merged.assumptions[key],value);
 assert.deepEqual(mergeCameroonDefaults(merged),merged);assert.ok(validData(merged));
});
test('partial saved Cameroon scenario retains explicit zero and intentionally blank assumptions',()=>{
 const merged=mergeCameroonDefaults({assumptions:{camBill:'60',camPay:'',camCosts:'0',camWorkers:'0'}});
 assert.deepEqual(merged.assumptions,{...cameroonDefaults,camBill:'60',camPay:'',camCosts:'0',camWorkers:'0'});
});
