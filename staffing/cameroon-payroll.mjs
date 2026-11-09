// 2026 Cameroon salaried-employee planning model, ordinary private-sector pay.
// Sources and scope are documented in README; not a filing or payroll execution service.
export const CAMEROON_TAX_SOURCE='https://impots.cm/sites/default/files/documents/CODE%20GENERAL%20DES%20IMPOTS%202026%20DGI%20VERSION%20ANGLAISE.pdf';
export const CAMEROON_CNPS_SOURCE='https://www.cnps.cm/images/documentutile/annuairestat2025.pdf';
export const cameroonPayrollDefaults=Object.freeze({camTaxMode:'0',camTaxYear:'2026',camFamilyRate:'7',camRiskRate:'',camBasicXaf:'',camCnpsBaseXaf:'',camEmployerXaf:''});
const amount=v=>typeof v==='string'&&v.trim()!==''&&Number.isFinite(+v)&&+v>=0?+v:null;
export function progressiveIrpp(annualTaxable){
 const bands=[[2000000,.10],[3000000,.15],[5000000,.25],[Infinity,.35]];
 let lower=0,tax=0;for(const [upper,rate] of bands){tax+=Math.max(0,Math.min(annualTaxable,upper)-lower)*rate;lower=upper;if(annualTaxable<=upper)break;}return tax;
}
export function ravMonthly(gross){return [[50000,0],[100000,750],[200000,1950],[300000,3250],[400000,4550],[500000,5850],[600000,7150],[700000,8450],[800000,9750],[900000,11050],[1000000,12350],[Infinity,13000]].find(([ceiling])=>gross<=ceiling)[1];}
export function localDevelopmentMonthly(basic){
 if(basic<62000)return 0;
 return [[75000,3000],[100000,6000],[125000,9000],[150000,12000],[200000,15000],[250000,18000],[300000,24000],[500000,27000],[Infinity,30000]].find(([ceiling])=>basic<=ceiling)[1]/12;
}
export function calculateCameroonEmployee(gross,a){
 const blank={irpp:null,cac:null,workerPension:null,workerHousing:null,rav:null,tdl:null,automaticDeductions:null,employerPension:null,employerFamily:null,employerInjury:null,employerHousing:null,employerEmployment:null,employerTotal:null,annualTaxable:null,professionalDeduction:null};
 if(gross===null||!Number.isFinite(gross)||gross<0||a.camTaxYear!=='2026')return blank;
 const basic=a.camBasicXaf===''?gross:amount(a.camBasicXaf),cnpsBase=a.camCnpsBaseXaf===''?gross:amount(a.camCnpsBaseXaf);
 const pension=cnpsBase===null?null:Math.min(cnpsBase,750000)*42/1000;
 const professionalDeduction=Math.min(gross*12*.30,4800000);
 const annualTaxable=pension===null?null:Math.max(0,gross*12-professionalDeduction-pension*12-500000);
 const irpp=annualTaxable===null?null:gross<62000?0:progressiveIrpp(annualTaxable)/12;
 const cac=irpp===null?null:irpp*.10;
 // Housing/FNE bases are rounded down to the next thousand (2026 Code, Appendix I sec. 6).
 const housingBase=Math.floor(gross/1000)*1000;
 const workerHousing=housingBase*.01,rav=ravMonthly(gross),tdl=basic===null?null:localDevelopmentMonthly(basic);
 const familyRate=amount(a.camFamilyRate),riskRate=amount(a.camRiskRate);
 const employerPension=pension,employerFamily=cnpsBase!==null&&[7,5.65,3.7].includes(familyRate)?Math.min(cnpsBase,750000)*familyRate/100:null;
 const employerInjury=cnpsBase!==null&&[1.75,2.5,5].includes(riskRate)?cnpsBase*riskRate/100:null;
 const employerHousing=housingBase*.015,employerEmployment=housingBase*.01;
 const override=amount(a.camEmployerXaf);
 const employerTotal=override!==null?override:[employerPension,employerFamily,employerInjury].includes(null)?null:employerPension+employerFamily+employerInjury+employerHousing+employerEmployment;
 const automaticDeductions=[irpp,cac,pension,tdl].includes(null)?null:irpp+cac+pension+workerHousing+rav+tdl;
 return {irpp,cac,workerPension:pension,workerHousing,rav,tdl,automaticDeductions,employerPension,employerFamily,employerInjury,employerHousing,employerEmployment,employerTotal,annualTaxable,professionalDeduction};
}
