import {payrollDefaults} from '../staffing/payroll.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {cameroonDefaults,workerDefaults,workerScenario,calculateCameroon,mergeCameroonDefaults} from '../staffing/scenarios.mjs';
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
 for(const [key,value] of Object.entries({...cameroonDefaults,...workerDefaults,...payrollDefaults}))assert.equal(merged.assumptions[key],value);
 assert.deepEqual(mergeCameroonDefaults(merged),merged);assert.ok(validData(merged));
});
test('partial saved Cameroon scenario retains explicit zero and intentionally blank assumptions',()=>{
 const merged=mergeCameroonDefaults({assumptions:{camBill:'60',camPay:'',camCosts:'0',camWorkers:'0'}});
 assert.deepEqual(merged.assumptions,{...cameroonDefaults,...workerDefaults,...payrollDefaults,camBill:'60',camPay:'',camCosts:'0',camWorkers:'0'});
});

test('USD to XAF pay converts hourly, per worker and whole-team amounts without changing USD estimates',()=>{
 const a={...cameroonDefaults,camUsdXaf:'600',camWorkers:'2'};
 const c=calculateCameroon(a);
 assert.equal(c.hourlyPayXaf,6000);assert.equal(c.monthlyPayPerWorkerXaf,960000);assert.equal(c.monthlyTeamPayXaf,1920000);
 assert.equal(c.grossSpread,11200);assert.equal(c.additionalCosts,null);
 assert.equal(calculateCameroon({...a,camUsdXaf:'587.9'}).monthlyPayPerWorkerXaf,940640);
 assert.equal(calculateCameroon({...a,camPay:'0'}).monthlyTeamPayXaf,0);
 assert.equal(calculateCameroon({...a,camBill:''}).monthlyTeamPayXaf,1920000);
});
test('unknown and invalid exchange rates cannot imply zero converted pay',()=>{
 for(const rate of ['',undefined,' ','0','-1','Infinity','bad']){
  const c=calculateCameroon({...cameroonDefaults,camUsdXaf:rate});
  assert.equal(c.hourlyPayXaf,null);assert.equal(c.monthlyPayPerWorkerXaf,null);assert.equal(c.monthlyTeamPayXaf,null);
 }
 const old=mergeCameroonDefaults({assumptions:{...cameroonDefaults,camUsdXaf:'590.25'}});
 assert.equal(old.assumptions.camUsdXaf,'590.25');
 const legacy=mergeCameroonDefaults({assumptions:{camPay:'12'}});
 assert.equal(legacy.assumptions.camUsdXaf,'');assert.equal(legacy.assumptions.camPay,'12');
 assert.ok(validData({...legacy,candidates:[],clients:[],placements:[],tasks:[]}));
});

test('worker switch uses independent saved rates, hours, costs and currencies',()=>{
 const workspace=mergeCameroonDefaults({assumptions:{camUsdXaf:'600'}}),a=workspace.assumptions;
 let selected=workerScenario(a),c=calculateCameroon(selected.assumptions);
 assert.equal(selected.isUS,false);assert.equal(c.grossSpreadPerWorker,5600);assert.equal(c.monthlyPayPerWorker,1600);
 a.workerUs='1';selected=workerScenario(a);c=calculateCameroon(selected.assumptions);
 assert.equal(selected.isUS,true);assert.equal(c.revenuePerWorker,10400);assert.equal(c.monthlyPayPerWorker,7200);assert.equal(c.hourlySpread,20);assert.equal(c.grossSpreadPerWorker,3200);
 a.usBill='70';a.usCosts='0';a.usWorkers='3';
 c=calculateCameroon(workerScenario(a).assumptions);assert.equal(c.grossSpreadPerWorker,4000);assert.equal(c.grossSpread,12000);assert.equal(c.contribution,12000);
 a.workerUs='0';c=calculateCameroon(workerScenario(a).assumptions);assert.equal(c.grossSpreadPerWorker,5600);assert.equal(c.additionalCosts,null);
 assert.equal(a.usBill,'70');assert.equal(a.camBill,'45');
 assert.deepEqual(mergeCameroonDefaults(workspace),workspace);
 assert.ok(validData({...workspace,candidates:[],clients:[],placements:[],tasks:[]}));
});

test('biweekly estimates reconcile to monthly estimates over a full year for both locations',()=>{
 const a=mergeCameroonDefaults({assumptions:{camUsdXaf:'600',camWorkers:'3',usWorkers:'2'}}).assumptions;
 for(const region of ['0','1']){
  const c=calculateCameroon(workerScenario({...a,workerUs:region}).assumptions);
  for(const [biweekly,monthly] of [['biweeklyPayPerWorker','monthlyPayPerWorker'],['biweeklyTeamPay','workerPay'],['biweeklyGrossSpreadPerWorker','grossSpreadPerWorker'],['biweeklyTeamGrossSpread','grossSpread']]){
   assert.ok(Math.abs(c[biweekly]*26-c[monthly]*12)<1e-8);
  }
  assert.ok(Math.abs(c.biweeklyHours-160*12/26)<1e-10);
  assert.equal(c.biweeklyPayPerWorker.toFixed(2),region==='1'?'3323.08':'738.46');
 }
});
test('biweekly pay preserves unknown inputs, explicit zero and negative spread',()=>{
 assert.equal(calculateCameroon({...cameroonDefaults,camPay:''}).biweeklyPayPerWorker,null);
 assert.equal(calculateCameroon({...cameroonDefaults,camHours:''}).biweeklyTeamPay,null);
 assert.equal(calculateCameroon({...cameroonDefaults,camPay:'0'}).biweeklyPayPerWorker,0);
 assert.equal(calculateCameroon({...cameroonDefaults,camWorkers:'0'}).biweeklyTeamPay,0);
 assert.ok(calculateCameroon({...cameroonDefaults,camPay:'50'}).biweeklyGrossSpreadPerWorker<0);
});
