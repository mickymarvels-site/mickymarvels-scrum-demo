import {cp,mkdir,rm} from 'node:fs/promises';
await rm('public',{recursive:true,force:true});await mkdir('public',{recursive:true});
for(const path of ['index.html','styles.css','script.js','thank-you.html','robots.txt','assets','staffing'])await cp(path,`public/${path}`,{recursive:true});
