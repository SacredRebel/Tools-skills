import fs from "node:fs";
import {checkCatalog,lintCatalog,loadSchema} from "./validate.mjs";
const evt=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,"utf8"));
const issue=evt.issue;
if(!issue||!issue.title?.startsWith("Add tool: ")||issue.user?.login!==evt.repository?.owner?.login){console.log("Skipping unrelated/non-owner issue");process.exit(0)}
const body=issue.body||"",start=body.indexOf("```json"),end=body.indexOf("```",start+7);
if(start<0||end<0)throw Error("Issue must contain fenced JSON");
const p=JSON.parse(body.slice(start+7,end).trim());
for(const k of ["name","url","category","kind","description"])if(typeof p[k]!=="string"||!p[k].trim())throw Error("Missing "+k);
const schema=loadSchema(),records=checkCatalog();
if(!schema.categories.includes(p.category))throw Error("Category is not in catalog/schema.json: "+p.category+". Add the category to schema.json in a PR first.");
if(!schema.kinds.includes(p.kind))throw Error("Kind is not in catalog/schema.json: "+p.kind);
const u=new URL(p.url);
const id=p.name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const tags=[...new Set((Array.isArray(p.tags)?p.tags:[]).map(s=>String(s).trim().toLowerCase()).filter(Boolean))];
const description=p.description.trim();
const today=new Date().toISOString().slice(0,10);
// use_when must differ from description; fall back to a neutral, honest sentence a human can improve later.
const useWhen=typeof p.use_when==="string"&&p.use_when.trim().length>=25?p.use_when.trim():"Use when you need: "+description.replace(/\.$/,"").slice(0,300).toLowerCase()+".";
const entry={id,name:p.name.trim(),url:u.href,category:p.category,kind:p.kind,description,tags,use_when:useWhen,source:u.host==="github.com"?"github":"website",status:"unverified-active",added_at:today,last_reviewed:null,featured:false};
const next=[entry,...records],errs=lintCatalog(next,schema);
if(errs.length)throw Error("Submission rejected:\n - "+errs.join("\n - "));
fs.writeFileSync("catalog/tools.json",JSON.stringify(next,null,2)+"\n");
console.log("Added "+entry.name);
