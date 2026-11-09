import test from 'node:test';
import assert from 'node:assert/strict';
import {persistWorkspace,workspaceSaveLabel} from '../staffing/workspace-save.mjs';
test('save is only confirmed after online read-back matches the submitted records and revision',async()=>{
 const data={candidates:[{id:'existing',name:'Existing candidate'}],assumptions:{pay:'10'}};let calls=0;
 const etag=await persistWorkspace(data,null,async(path,options)=>{calls++;if(options){assert.deepEqual(JSON.parse(options.body),{data,etag:null});return {etag:'revision1'};}return {etag:'revision1',data:{assumptions:{pay:'10'},candidates:[{name:'Existing candidate',id:'existing'}]}};});
 assert.equal(etag,'revision1');assert.equal(calls,2);
});
test('failed, missing and mismatched persisted data never report success',async()=>{
 const data={candidates:[{id:'a'}]};
 for(const response of [{etag:'v1',data:null},{etag:'v1',data:{candidates:[]}},{etag:'newer',data}])await assert.rejects(()=>persistWorkspace(data,null,async(path,options)=>options?{etag:'v1'}:response),error=>error.status===409);
 await assert.rejects(()=>persistWorkspace(data,null,async()=>({})),/no storage revision/);
 await assert.rejects(()=>persistWorkspace(data,null,async()=>{throw new Error('Network unavailable')}),/Network unavailable/);
});
test('starter workspace is never labeled saved online; failure and in-flight states remain explicit',()=>{
 assert.equal(workspaceSaveLabel({busy:false,dirty:false,stored:false,error:''}),'No saved workspace returned');
 assert.equal(workspaceSaveLabel({busy:false,dirty:false,stored:true,error:''}),'Saved online & verified');
 assert.equal(workspaceSaveLabel({busy:false,dirty:true,stored:true,error:'Failed'}),'Not saved — retry');
 assert.equal(workspaceSaveLabel({busy:true,dirty:true,stored:true,error:''}),'Saving online…');
});
