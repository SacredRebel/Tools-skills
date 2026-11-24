// Checks that every catalog URL still resolves. 404/410 fail the run; timeouts, 429 and 5xx only warn.
// Usage: node scripts/linkcheck.mjs [--limit N]
import fs from "node:fs";
const data=JSON.parse(fs.readFileSync("catalog/tools.json","utf8"));
const limit=Number(process.argv[process.argv.indexOf("--limit")+1])||data.length;
const queue=data.slice(0,limit),dead=[],warn=[];
const headers={"user-agent":"tools-skills-linkcheck"};
async function check(t){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const r=await fetch(t.url,{method:"GET",redirect:"follow",headers,signal:AbortSignal.timeout(20000)});
   await r.body?.cancel();
   if(r.status===404||r.status===410)return dead.push(t.id+" "+r.status+" "+t.url);
   if(r.status>=400)return warn.push(t.id+" "+r.status+" "+t.url);
   return;
  }catch(e){ if(attempt===1)warn.push(t.id+" "+(e.name||"error")+" "+t.url);else await new Promise(r=>setTimeout(r,1500)) }
 }
}
await Promise.all(Array.from({length:6},async()=>{while(queue.length)await check(queue.shift())}));
const out=["## Link check","Checked "+Math.min(limit,data.length)+" URLs.",
 "### Dead ("+dead.length+")",...dead.map(x=>"- "+x),"### Warnings ("+warn.length+")",...warn.map(x=>"- "+x)].join("\n");
console.log(out);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,out+"\n");
process.exit(dead.length?1:0);
