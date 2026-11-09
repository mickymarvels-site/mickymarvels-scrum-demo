// Federal owner reserve, not employee withholding or a tax-return calculation.
export const ownerTaxDefaults=Object.freeze({ownerTreatment:'0',ownerYear:'2026',ownerFiling:'0',ownerWages:'0',ownerSpouseWages:'0',ownerOtherIncome:'0',camOwnerMode:'0',usOwnerMode:'0'});
const amount=value=>typeof value==='string'&&value.trim()!==''&&Number.isFinite(+value)&&+value>=0?+value:null;
const tables={
 '0':{deduction:16100,threshold:200000,bands:[12400,50400,105700,201775,256225,640600]},
 '1':{deduction:32200,threshold:250000,bands:[24800,100800,211400,403550,512450,768700]},
 '2':{deduction:24150,threshold:200000,bands:[17700,67450,105700,201750,256200,640600]},
 '3':{deduction:16100,threshold:125000,bands:[12400,50400,105700,201775,256225,384350]}
};
export function ownerIncomeTax2026(taxable,filing){
 const table=tables[filing];if(!table)return null;
 let lower=0,total=0;[...table.bands,Infinity].forEach((upper,index)=>{total+=Math.max(0,Math.min(taxable,upper)-lower)*[.1,.12,.22,.24,.32,.35,.37][index];lower=upper;});return total;
}
export function calculateOwnerTax(monthlyProfit,a){
 const empty={monthly:null,annual:null,selfEmployment:null,incomeTax:null,additionalMedicare:null};
 const t=tables[a.ownerFiling],wages=amount(a.ownerWages),spouse=amount(a.ownerSpouseWages),other=amount(a.ownerOtherIncome);
 if(a.ownerTreatment!=='0'||a.ownerYear!=='2026'||!t||monthlyProfit===null||!Number.isFinite(monthlyProfit)||[wages,spouse,other].includes(null))return empty;
 const profit=Math.max(0,monthlyProfit*12),netEarnings=profit*.9235;
 const taxableSE=netEarnings>=400?netEarnings:0;
 const selfEmployment=Math.min(taxableSE,Math.max(0,184500-wages))*.124+taxableSE*.029;
 const jointSpouse=a.ownerFiling==='1'?spouse:0;
 const baseline=wages+jointSpouse+other;
 const incomeTax=Math.max(0,ownerIncomeTax2026(Math.max(0,baseline+profit-selfEmployment/2-t.deduction),a.ownerFiling)-ownerIncomeTax2026(Math.max(0,baseline-t.deduction),a.ownerFiling));
 const additionalMedicare=Math.max(0,taxableSE-Math.max(0,t.threshold-wages-jointSpouse))*.009;
 const annual=selfEmployment+incomeTax+additionalMedicare;
 return {monthly:annual/12,annual,selfEmployment,incomeTax,additionalMedicare};
}
