import test from 'node:test';import assert from 'node:assert/strict';import {createHandler} from '../lib/staffing-service.mjs';
const password='local-test-password-not-a-real-secret';
const origin='https://example.test';
const request=(method='GET',body,cookie='',action='',otherOrigin=origin)=>new Request(origin+'/.netlify/functions/staffing'+action,{method,headers:{origin:otherOrigin,'content-type':'application/json',cookie},...(body===undefined?{}:{body:JSON.stringify(body)})});
function fixture(){let value=null,version=0;const store={getWithMetadata:async()=>value?{data:value,etag:String(version)}:null,setJSON:async(k,d,options)=>{if((options.onlyIfNew&&value)||options.onlyIfMatch&&options.onlyIfMatch!==String(version))return {modified:false};value=d;return {modified:true,etag:String(++version)}}};return createHandler({password:()=>password,getStore:()=>store})}
const data={candidates:[],clients:[],placements:[],tasks:[],assumptions:{bill:'65'}};
async function login(handler){const r=await handler(request('POST',{password},'','?action=login'));assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]}
test('unconfigured workspace fails closed',async()=>{const h=createHandler({password:()=>'',getStore:()=>{throw Error('should never access store')}});assert.equal((await h(request())).status,503)});
test('rejects unsigned access, bad password, forged origin and forged cookie',async()=>{const h=fixture();assert.equal((await h(request())).status,401);assert.equal((await h(request('POST',{password:'wrong'},'','?action=login'))).status,401);assert.equal((await h(request('POST',{password},'','?action=login','https://evil.test'))).status,403);assert.equal((await h(request('GET',undefined,'__Host-mm_staffing=forged.bad'))).status,401)});
test('owner session saves and reloads records; stale updates cannot overwrite',async()=>{const h=fixture(),cookie=await login(h);assert.match(cookie,/^__Host-mm_staffing=/);let r=await h(request('PUT',{data,etag:null},cookie));assert.equal(r.status,200);assert.equal((await r.json()).etag,'1');r=await h(request('GET',undefined,cookie));assert.deepEqual((await r.json()).data,data);assert.equal((await h(request('PUT',{data,etag:null},cookie))).status,409);assert.equal((await h(request('PUT',{data,etag:'1'},cookie))).status,200);assert.equal((await h(request('PUT',{data,etag:'1'},cookie))).status,409)});
test('rejects invalid data and expired sessions',async()=>{const h=fixture(),cookie=await login(h);assert.equal((await h(request('PUT',{data:{...data,candidates:[{id:'x',name:123}]},etag:null},cookie))).status,400);const expired=createHandler({password:()=>password,now:()=>Date.now()+9*3600000,getStore:()=>{throw Error('should never access store')}});assert.equal((await expired(request('GET',undefined,cookie))).status,401)});
test('cookie security attributes and password rotation',async()=>{const h=fixture();const r=await h(request('POST',{password},'','?action=login'));const c=r.headers.get('set-cookie');for(const a of ['HttpOnly','Secure','SameSite=Strict','Path=/'])assert.ok(c.includes(a));const rotated=createHandler({password:()=>password+'rotated',getStore:()=>{throw Error('unreachable')}});assert.equal((await rotated(request('GET',undefined,c.split(';')[0]))).status,401)});

test('legacy workspace and Cameroon additions round-trip through authenticated storage without record loss',async()=>{
 const {mergeCameroonDefaults}=await import('../staffing/scenarios.mjs');
 const h=fixture(),cookie=await login(h);
 const legacy={candidates:[{id:'c1',name:'Existing candidate'}],clients:[{id:'cl1',name:'Existing client'}],placements:[{id:'p1',candidate:'c1',client:'cl1'}],tasks:[{id:'t1',name:'Existing task'}],assumptions:{bill:'80',pay:'40',overhead:'',headcount:'2'}};
 assert.equal((await h(request('PUT',{data:legacy,etag:null},cookie))).status,200);
 const loaded=await (await h(request('GET',undefined,cookie))).json();
 const merged=mergeCameroonDefaults(loaded.data);merged.assumptions.camBill='48';merged.assumptions.camCosts='0';
 assert.equal((await h(request('PUT',{data:merged,etag:loaded.etag},cookie))).status,200);
 const reloaded=await (await h(request('GET',undefined,cookie))).json();
 assert.deepEqual(reloaded.data,merged);
 for(const key of ['candidates','clients','placements','tasks'])assert.deepEqual(reloaded.data[key],legacy[key]);
 for(const [key,value] of Object.entries(legacy.assumptions))assert.equal(reloaded.data.assumptions[key],value);
 assert.equal((await h(request('PUT',{data:legacy,etag:loaded.etag},cookie))).status,409);
});

test('tax states, filing choices and manual Cameroon insurance save and reload without losing legacy records',async()=>{
 const {mergeCameroonDefaults}=await import('../staffing/scenarios.mjs');
 const h=fixture(),cookie=await login(h);
 const saved=mergeCameroonDefaults({candidates:[{id:'c1',name:'Existing'}],clients:[],placements:[],tasks:[],assumptions:{usState:'TX',usFiling:'married',camTaxMode:'0',camTaxYear:'2026',camRiskRate:'2.5',camFamilyRate:'7',camHealthWorkerXaf:'0',camHealthCompanyXaf:'35000',camTaxXaf:'25000',usStateOverride:'0',usOverrideState:'TX',usOverrideFiling:'married'}});
 const r=await h(request('PUT',{data:saved,etag:null},cookie));assert.equal(r.status,200);
 const reloaded=await(await h(request('GET',undefined,cookie))).json();assert.deepEqual(reloaded.data,saved);
 const wrong={...saved,assumptions:{...saved.assumptions,usState:'INVALID'}};
 assert.equal((await h(request('PUT',{data:wrong,etag:reloaded.etag},cookie))).status,400);
 assert.equal((await h(request('PUT',{data:saved,etag:null},cookie))).status,409);
});

test('custom insurance quote and share persist through authenticated storage',async()=>{
 const {mergeCameroonDefaults}=await import('../staffing/scenarios.mjs');
 const h=fixture(),cookie=await login(h),saved=mergeCameroonDefaults({...data,assumptions:{camHealthMode:'0',camHealthPremiumXaf:'75000',camHealthEmployerShare:'60'}});
 assert.equal((await h(request('PUT',{data:saved,etag:null},cookie))).status,200);
 const loaded=await(await h(request('GET',undefined,cookie))).json();assert.deepEqual(loaded.data,saved);
 assert.equal((await h(request('PUT',{data:{...saved,assumptions:{...saved.assumptions,camHealthEmployerShare:'101'}},etag:loaded.etag},cookie))).status,400);
});
