import test from 'node:test';
import assert from 'node:assert/strict';
import {profileSnapshotRows} from '../staffing/profile-snapshot.mjs';
const company={isUS:false,beforeTax:3000000,tax:600000,net:2400000,missing:[]};
test('profile snapshot converts worker gross, worker net and Micky after-tax take-home to USD',()=>{
 const rows=profileSnapshotRows({monthly:{gross:880000,net:679659}},company,550);
 assert.equal(rows[0].monthlyUsd,1600);assert.equal(rows[1].monthlyUsd,679659/550);assert.equal(rows[2].monthlyUsd,2400000/550);
 for(const row of rows){assert.equal(row.biweekly,row.monthly*12/26);assert.equal(row.biweeklyUsd,row.monthlyUsd*12/26);}
});
test('provisional Micky amount is separately labeled and final incomplete total stays unknown',()=>{
 const rows=profileSnapshotRows({monthly:{gross:880000,net:679659}},{...company,net:null,missing:['operating costs']},550);
 assert.equal(rows[2].monthly,null);assert.equal(rows[2].monthlyUsd,null);assert.match(rows[3].label,/provisional/);assert.equal(rows[3].monthly,2400000);
 assert.equal(profileSnapshotRows({}, {...company,tax:null,net:null,missing:['tax']},550).length,3);
});
test('missing exchange rates stay unknown and US amounts do not get converted twice',()=>{
 for(const rate of [0,null,-1,NaN,Infinity])assert.equal(profileSnapshotRows({monthly:{gross:880000}},company,rate)[0].monthlyUsd,null);
 const rows=profileSnapshotRows({monthly:{gross:1600,net:1200}},{...company,isUS:true},550);assert.equal(rows[0].monthlyUsd,1600);assert.equal(rows[1].monthlyUsd,1200);
});
