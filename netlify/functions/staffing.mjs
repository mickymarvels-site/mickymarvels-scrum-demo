import { getStore } from '@netlify/blobs';
import { createHandler } from '../../lib/staffing-service.mjs';
export default createHandler({getStore:()=>getStore({name:'mm-staffing-owner-workspace',consistency:'strong'})});
export const config={rateLimit:{action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:30}};
