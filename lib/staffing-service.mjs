import {validCandidateProfiles} from '../staffing/profiles.mjs';
import {validAssumptions} from '../staffing/payroll.mjs';
import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
const COOKIE='__Host-mm_staffing';
const digest=x=>createHash('sha256').update(x).digest();
const safe=(a,b)=>timingSafeEqual(digest(a),digest(b));
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff',...headers}});
const sign=(value,password)=>createHmac('sha256',password).update('mm-session-v1:'+value).digest('base64url');
export function validData(d){if(!d||typeof d!=='object'||Array.isArray(d))return false;for(const key of ['candidates','clients','placements','tasks']){if(!Array.isArray(d[key])||d[key].length>5000)return false;const ids=new Set();for(const r of d[key]){if(!r||typeof r!=='object'||Array.isArray(r)||!r.id||ids.has(r.id))return false;ids.add(r.id);if(Object.keys(r).length>30||Object.values(r).some(v=>typeof v!=='string'||v.length>10000))return false;}}return validAssumptions(d.assumptions)&&validCandidateProfiles(d);}

export function createHandler({getStore,password=()=>process.env.STAFFING_ADMIN_PASSWORD,now=()=>Date.now()}={}){return async function handler(req){try{
const secret=password();if(!secret||secret.length<20)return json({error:'Owner setup required. Set STAFFING_ADMIN_PASSWORD (at least 20 characters) in the Netlify project’s Functions environment, then redeploy.',setup:true},503);
const method=req.method;const url=new URL(req.url);
if(!['GET','POST','PUT','DELETE'].includes(method))return json({error:'Method not allowed'},405,{'Allow':'GET, POST, PUT, DELETE'});
if(method!=='GET'&&req.headers.get('origin')!==url.origin)return json({error:'Request origin not allowed'},403);
const action=url.searchParams.get('action');
if(method==='POST'&&action==='login'){
 const raw=await req.text();if(raw.length>2048)return json({error:'Invalid login'},400);let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid login'},400)}
 if(typeof body.password!=='string'||!safe(body.password,secret))return json({error:'Password not recognized'},401);
 const token=Buffer.from(JSON.stringify({expires:now()+8*60*60*1000})).toString('base64url');return json({ok:true},200,{'Set-Cookie':`${COOKIE}=${token}.${sign(token,secret)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`});
}
if(method==='POST'&&action==='logout')return json({ok:true},200,{'Set-Cookie':`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
const cookie=req.headers.get('cookie')||'';const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);let authorized=false;
if(token&&token.length<1000){const [value,mac]=token.split('.');if(value&&mac&&safe(sign(value,secret),mac)){try{authorized=JSON.parse(Buffer.from(value,'base64url').toString()).expires>now()}catch{}}}
if(!authorized)return json({error:'Sign in to access this workspace'},401);
const store=await getStore();const key='workspace-v1';
if(method==='GET'){const row=await store.getWithMetadata(key,{type:'json',consistency:'strong'});return json({data:row?.data||null,etag:row?.etag||null});}
if(method!=='PUT')return json({error:'Method not allowed'},405);
if(req.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'JSON required'},415);
const raw=await req.text();if(raw.length>500000)return json({error:'Workspace is too large; export a backup and archive older records.'},413);let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
if(!validData(body.data)||!(body.etag===null||typeof body.etag==='string'))return json({error:'Invalid workspace data'},400);
const result=await store.setJSON(key,body.data,body.etag?{onlyIfMatch:body.etag}:{onlyIfNew:true});
if(!result.modified)return json({error:'Another tab or device saved newer changes. Export your unsaved work, then reload before editing again.'},409);
return json({ok:true,etag:result.etag});
}catch{return json({error:'Workspace service is unavailable. Your unsaved changes remain on this page. Please retry.'},500)}}}
