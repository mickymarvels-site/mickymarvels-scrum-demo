import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureCandidateProfile,profileAssumptions,setProfileAssumption,candidateContext,saveLinkedRecord} from '../staffing/profiles.mjs';
import {validData} from '../lib/staffing-service.mjs';
import {calculateCameroon,workerScenario,mergeCameroonDefaults} from '../staffing/scenarios.mjs';
const fixture=()=>mergeCameroonDefaults({candidates:[{id:'a',name:'Candidate A',workerUs:'0',notes:'Keep me',custom:'Legacy field'},{id:'b',name:'Candidate B',workerUs:'1',usState:'FL'}],clients:[{id:'client',name:'Existing client'}],placements:[{id:'pa',candidate:'a',client:'client',status:'Active',bill:'45',pay:'10',hours:'160'},{id:'pb',candidate:'b',client:'client',status:'Ended',bill:'65',pay:'45',hours:'80'}],tasks:[{id:'ta',name:'Candidate task',candidate:'a'},{id:'tp',name:'Placement task',placement:'pa'},{id:'global',name:'Unassigned task'}],assumptions:{bill:'90',pay:'70',headcount:'20',hours:'160',camHealthWorkerXaf:'20000',usState:'TX',camUsdXaf:'550'}});
test('old workspaces remain valid and creating a profile never copies team pay, costs or worker tax assumptions',()=>{
 const w=fixture(),before=structuredClone(w);assert.ok(validData(w));
 const p=ensureCandidateProfile(w,'a');assert.equal(p.assumptions.camPay,'');assert.equal(p.assumptions.bill,'');assert.equal(p.assumptions.camCosts,'');assert.equal(p.assumptions.camHealthWorkerXaf,'');assert.equal(p.assumptions.headcount,'1');assert.equal(p.assumptions.camUsdXaf,'550');
 for(const key of ['candidates','clients','placements','tasks','assumptions'])assert.deepEqual(w[key],before[key]);assert.ok(validData(w));
 assert.strictEqual(ensureCandidateProfile(w,'a'),p);
});
test('profile edits are isolated from workspace and other candidates',()=>{
 const w=fixture(),global=structuredClone(w.assumptions);ensureCandidateProfile(w,'a');ensureCandidateProfile(w,'b');const b=structuredClone(w.candidateProfiles.b);
 setProfileAssumption(w,'a','camPay','12');setProfileAssumption(w,'a','camBill','45');setProfileAssumption(w,'a','camHours','160');setProfileAssumption(w,'a','camCosts','0');
 const a=profileAssumptions(w,'a');assert.equal(a.pay,'12');assert.equal(a.bill,'45');assert.equal(a.hours,'160');assert.equal(a.headcount,'1');assert.equal(calculateCameroon(workerScenario(a).assumptions).workerPay,1920);
 assert.deepEqual(w.assumptions,global);assert.deepEqual(w.candidateProfiles.b,b);assert.equal(w.placements[0].pay,'10');assert.ok(validData(w));
});
test('selected placement is the single rate source for both calculators and rate edits update only that assignment',()=>{
 const w=fixture();ensureCandidateProfile(w,'a').placementId='pa';const before=structuredClone(w);
 let a=profileAssumptions(w,'a');assert.equal(a.bill,'45');assert.equal(a.camPay,'10');assert.equal(a.hours,'160');
 setProfileAssumption(w,'a','pay','15');setProfileAssumption(w,'a','camHours','120');
 a=profileAssumptions(w,'a');assert.equal(w.placements[0].pay,'15');assert.equal(a.camPay,'15');assert.equal(a.pay,'15');assert.equal(a.camHours,'120');assert.equal(a.hours,'120');
 assert.deepEqual(w.placements[1],before.placements[1]);assert.deepEqual(w.assumptions,before.assumptions);assert.ok(validData(w));
});
test('region/state are explicit and both US rate and one-worker projections stay synchronized',()=>{
 const w=fixture();ensureCandidateProfile(w,'b').placementId='pb';
 setProfileAssumption(w,'b','usState','NC');setProfileAssumption(w,'b','usPay','50');setProfileAssumption(w,'b','headcount','30');
 const a=profileAssumptions(w,'b');assert.equal(a.usState,'NC');assert.equal(a.usPay,'50');assert.equal(a.pay,'50');assert.equal(a.headcount,'1');assert.equal(a.usWorkers,'1');assert.equal(w.candidates[1].usState,'NC');
 setProfileAssumption(w,'b','workerUs','0');assert.equal(w.candidates[1].workerUs,'0');assert.equal(profileAssumptions(w,'b').camPay,'50');
});
test('blank and explicit zero placement fields remain distinct and never fall back to a global rate',()=>{
 const w=fixture();w.placements[0].pay='0';w.placements[0].bill='';delete w.placements[0].hours;ensureCandidateProfile(w,'a').placementId='pa';
 const a=profileAssumptions(w,'a');assert.equal(a.pay,'0');assert.equal(a.bill,'');assert.equal(a.hours,'');assert.equal(calculateCameroon(workerScenario(a).assumptions).revenue,null);
});
test('candidate relationships follow IDs through rename and include historical placements and placement-linked tasks',()=>{
 const w=fixture();w.candidates[0].name='Renamed';const c=candidateContext(w,'a');
 assert.equal(c.candidate.name,'Renamed');assert.deepEqual(c.placements.map(p=>p.id),['pa']);assert.deepEqual(c.clients.map(p=>p.id),['client']);assert.deepEqual(c.tasks.map(t=>t.id),['ta','tp']);
 assert.equal(candidateContext(w,'b').placements[0].status,'Ended');
});
test('new candidate immediately gets a profile and existing extra details survive round-trip updates',()=>{
 const w=fixture();saveLinkedRecord(w,'candidates',{id:'new',name:'New candidate',email:'example@example.test'});assert.ok(w.candidateProfiles.new);
 const old=w.candidates[0];saveLinkedRecord(w,'candidates',{...old,name:'Updated'});assert.equal(w.candidates[0].custom,'Legacy field');assert.ok(validData(w));
});
test('reassigning a placement safely clears the old profile reference and tasks validate candidate linkage',()=>{
 const w=fixture();ensureCandidateProfile(w,'a').placementId='pa';saveLinkedRecord(w,'placements',{...w.placements[0],candidate:'b'});
 assert.equal(w.candidateProfiles.a.placementId,'');assert.equal(w.candidateProfiles.b.placementId,'pa');assert.ok(validData(w));
 saveLinkedRecord(w,'tasks',{id:'newtask',name:'Linked',candidate:'',placement:'pa'});assert.equal(w.tasks.at(-1).candidate,'b');
 assert.throws(()=>saveLinkedRecord(w,'tasks',{id:'bad',candidate:'a',placement:'pa'}),/must match/);
 assert.throws(()=>saveLinkedRecord(w,'placements',{id:'bad',candidate:'missing',client:'client'}),/existing/);
});
test('profile schema rejects invalid, cross-candidate, orphan and oversized data but accepts missing legacy profiles',()=>{
 const w=fixture();ensureCandidateProfile(w,'a');assert.ok(validData(w));
 for(const bad of [null,[],{orphan:{assumptions:{},placementId:''}},{a:{assumptions:{camPay:'-1'},placementId:''}},{a:{assumptions:{},placementId:'pb'}},{a:{assumptions:{},placementId:'',extra:'bad'}}])assert.equal(validData({...w,candidateProfiles:bad}),false);
 assert.throws(()=>ensureCandidateProfile(w,'missing'),/not found/);
 const legacy={...w};delete legacy.candidateProfiles;assert.ok(validData(legacy));
});

test('placement reassignment does not expose another candidate’s explicitly linked task',()=>{
 const w=fixture();w.tasks.push({id:'historical',name:'Old follow-up',candidate:'a',placement:'pa'});
 saveLinkedRecord(w,'placements',{...w.placements[0],candidate:'b'});
 assert.ok(candidateContext(w,'a').tasks.some(t=>t.id==='historical'));
 assert.equal(candidateContext(w,'b').tasks.some(t=>t.id==='historical'),false);
});
