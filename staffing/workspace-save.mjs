const canonical=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
export async function persistWorkspace(data,etag,request){
 const saved=await request('',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,etag})});
 if(typeof saved.etag!=='string'||!saved.etag)throw new Error('Save response has no storage revision. Changes are not confirmed saved.');
 const verified=await request();
 if(verified.etag!==saved.etag||canonical(verified.data)!==canonical(data)){
  const error=new Error('Online verification did not match these changes. Keep this page open and export a backup; do not overwrite another device’s changes.');error.status=409;throw error;
 }
 return saved.etag;
}
export function workspaceSaveLabel({busy,dirty,stored,error}){return busy?'Saving online…':error?'Not saved — retry':dirty?'Unsaved changes':stored?'Saved online & verified':'No saved workspace returned'}
