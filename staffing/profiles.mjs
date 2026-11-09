import {mergeCameroonDefaults} from './scenarios.mjs';
import {validAssumptions} from './payroll.mjs';
const safeKey=id=>typeof id==='string'&&id.length>0&&!['__proto__','constructor','prototype'].includes(id);
export function candidateContext(workspace,id){
 const candidate=workspace.candidates.find(row=>row.id===id)||null;
 const placements=workspace.placements.filter(row=>row.candidate===id);
 const placementIds=new Set(placements.map(row=>row.id)),clientIds=new Set(placements.map(row=>row.client));
 return {candidate,placements,clients:workspace.clients.filter(row=>clientIds.has(row.id)),tasks:workspace.tasks.filter(row=>row.candidate?row.candidate===id:placementIds.has(row.placement))};
}
export function ensureCandidateProfile(workspace,id){
 const candidate=workspace.candidates.find(row=>row.id===id);if(!candidate||!safeKey(id))throw new Error('Candidate not found');
 workspace.candidateProfiles??={};
 if(!Object.hasOwn(workspace.candidateProfiles,id)){
  const assumptions=mergeCameroonDefaults({assumptions:{}}).assumptions;
  Object.assign(assumptions,{bill:'',pay:'',hours:'',headcount:'1',burden:'',benefits:'',contractorCost:'',overhead:'',days:'',camBill:'',camPay:'',camHours:'',camWorkers:'1',usBill:'',usPay:'',usHours:'',usWorkers:'1',workerUs:candidate.workerUs||'0',usState:candidate.usState||''});
  // Only company owner assumptions and the exchange rate are reusable, never another person's pay/tax details.
  for(const key of ['ownerTreatment','ownerYear','ownerFiling','ownerWages','ownerSpouseWages','ownerOtherIncome','camUsdXaf'])if(Object.hasOwn(workspace.assumptions,key))assumptions[key]=workspace.assumptions[key];
  workspace.candidateProfiles[id]={assumptions,placementId:''};
 }
 return workspace.candidateProfiles[id];
}
export function profileAssumptions(workspace,id){
 const candidate=workspace.candidates.find(row=>row.id===id),profile=workspace.candidateProfiles?.[id];
 if(!candidate||!profile)return null;
 const a=mergeCameroonDefaults({assumptions:profile.assumptions}).assumptions;
 if(['0','1'].includes(candidate.workerUs))a.workerUs=candidate.workerUs;
 if(Object.hasOwn(candidate,'usState'))a.usState=candidate.usState;
 const placement=workspace.placements.find(row=>row.id===profile.placementId&&row.candidate===id);
 const prefix=a.workerUs==='1'?'us':'cam';
 if(placement)for(const [field,suffix] of [['bill','Bill'],['pay','Pay'],['hours','Hours']]){a[field]=placement[field]??'';a[prefix+suffix]=placement[field]??'';}
 else for(const [field,suffix] of [['bill','Bill'],['pay','Pay'],['hours','Hours']])a[field]=a[prefix+suffix]??'';
 a.headcount='1';a.camWorkers='1';a.usWorkers='1';
 return a;
}
export function setProfileAssumption(workspace,id,key,value){
 const profile=ensureCandidateProfile(workspace,id),candidate=workspace.candidates.find(row=>row.id===id),a=profileAssumptions(workspace,id);
 if(['headcount','camWorkers','usWorkers'].includes(key))return;
 profile.assumptions[key]=value;
 if(key==='workerUs')candidate.workerUs=value;
 if(key==='usState')candidate.usState=value;
 const prefix=a.workerUs==='1'?'us':'cam';
 for(const [field,suffix] of [['bill','Bill'],['pay','Pay'],['hours','Hours']])if(key===field||key===prefix+suffix){
  profile.assumptions[field]=value;profile.assumptions[prefix+suffix]=value;
  const placement=workspace.placements.find(row=>row.id===profile.placementId&&row.candidate===id);if(placement)placement[field]=value;
 }
}
export function validCandidateProfiles(workspace){
 if(workspace.candidateProfiles===undefined)return true;
 const profiles=workspace.candidateProfiles;if(!profiles||typeof profiles!=='object'||Array.isArray(profiles)||Object.keys(profiles).length>5000)return false;
 return Object.entries(profiles).every(([id,p])=>safeKey(id)&&workspace.candidates.some(row=>row.id===id)&&p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(key=>['assumptions','placementId'].includes(key))&&validAssumptions(p.assumptions)&&typeof p.placementId==='string'&&(p.placementId===''||workspace.placements.some(row=>row.id===p.placementId&&row.candidate===id)));
}
export function saveLinkedRecord(workspace,key,row){
 const record={...row};
 if(key==='placements'){
  if(!workspace.candidates.some(c=>c.id===record.candidate)||!workspace.clients.some(c=>c.id===record.client))throw new Error('Choose an existing candidate and client opportunity.');
  for(const profile of Object.values(workspace.candidateProfiles||{}))if(profile.placementId===record.id)profile.placementId='';
 }
 if(key==='tasks'){
  const placement=record.placement?workspace.placements.find(p=>p.id===record.placement):null;
  if(record.placement&&!placement)throw new Error('Choose an existing placement.');
  if(record.candidate&&!workspace.candidates.some(c=>c.id===record.candidate))throw new Error('Choose an existing candidate.');
  if(placement&&record.candidate&&placement.candidate!==record.candidate)throw new Error('The task candidate must match the selected placement.');
  if(placement&&!record.candidate)record.candidate=placement.candidate;
 }
 const index=workspace[key].findIndex(r=>r.id===record.id);
 if(index<0)workspace[key].push(record);else workspace[key][index]=record;
 if(key==='candidates')ensureCandidateProfile(workspace,record.id);
 if(key==='placements')ensureCandidateProfile(workspace,record.candidate).placementId=record.id;
 return record;
}
