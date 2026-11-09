// Only call an amount "after tax" when a tax reserve has actually been calculated/entered.
export function companyTakeHomeDisplay(result,workers,exchangeRate){
 const monthly=result.beforeTax!==null&&result.tax!==null?result.beforeTax-result.tax:null;
 const perWorker=monthly!==null&&Number.isFinite(workers)&&workers>0?monthly/workers:null;
 const monthlyUsd=monthly===null?null:result.isUS?monthly:Number.isFinite(exchangeRate)&&exchangeRate>0?monthly/exchangeRate:null;
 return {monthly,biweekly:monthly===null?null:monthly*12/26,perWorker,
  monthlyUsd,biweeklyUsd:monthlyUsd===null?null:monthlyUsd*12/26,perWorkerUsd:monthlyUsd!==null&&Number.isFinite(workers)&&workers>0?monthlyUsd/workers:null,
  provisional:result.missing.length>0,
  message:result.tax===null?'Owner tax reserve is missing. Choose Automatic federal estimate under LLC tax treatment, or enter a verified manual reserve.':result.missing.length?'After the owner tax reserve and known expenses. Unconfirmed expenses are excluded; this is provisional.':'After all listed expenses and the owner tax reserve.'};
}
