import {companyTakeHomeDisplay} from './company-display.mjs';
export function profileSnapshotRows(payroll,company,exchangeRate){
 const takeHome=companyTakeHomeDisplay(company,1,exchangeRate);
 const rows=[['Gross worker pay',payroll.monthly?.gross??null],['Estimated worker take-home',payroll.monthly?.net??null],['Micky take-home after all listed costs and owner tax reserve',company.net]];
 if(company.net===null&&takeHome.monthly!==null)rows.push(['Micky provisional take-home after known costs and owner tax reserve',takeHome.monthly]);
 return rows.map(([label,monthly])=>({label,monthly,biweekly:monthly===null?null:monthly*12/26,monthlyUsd:monthly===null?null:company.isUS?monthly:Number.isFinite(exchangeRate)&&exchangeRate>0?monthly/exchangeRate:null})).map(row=>({...row,biweeklyUsd:row.monthlyUsd===null?null:row.monthlyUsd*12/26}));
}
