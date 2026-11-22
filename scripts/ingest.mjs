import fs from "node:fs";
import {checkCatalog} from "./validate.mjs";
const evt=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,"utf8"));
const issue=evt.issue;
if(!issue||!issue.title?.startsWith("Add tool: ")||issue.user?.login!==evt.repository?.owner?.login){console.log("Skipping unrelated/non-owner issue");process.exit(0)}
const body=issue.body||"",start=body.indexOf("```json"),end=body.indexOf("```",start+7);
if(start<0||end<0)throw Error("Issue must contain fenced JSON");
const p=JSON.parse(body.slice(start+7,end).trim());
for(const k of ["name","url","category","kind","description"])if(typeof p[k]!=="string"||!p[k].trim())throw Error("Missing "+k);
const records=checkCatalog();
const allowed=new Set(records.map(x=>x.category));const kinds=new Set([...records.map(x=>x.kind),"website","utility"]);
if(!allowed.has(p.category)||!kinds.has(p.kind))throw Error("Unrecognized category or kind");
const u=new URL(p.url);if(u.protocol!=="https:"||u.username||u.password)throw Error("HTTPS required");
if(p.name.length>90||p.description.length>350)throw Error("Too long");
if(!Array.isArray(p.tags)||p.tags.length>12||p.tags.some(t=>typeof t!=="string"||t.length>35))throw Error("Invalid tags");
const id=p.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
if(!id||records.some(t=>t.id===id||t.url.replace(/\/$/,"")===u.href.replace(/\/$/,"")))throw Error("Duplicate/invalid id or URL");
records.unshift({id,name:p.name.trim(),url:u.href,category:p.category,kind:p.kind,description:p.description.trim(),tags:p.tags.map(s=>s.trim().toLowerCase()).filter(Boolean),use_when:"Use when: "+p.description.trim(),source:u.href.startsWith("https://github.com/")?"github":"website",status:"unverified-active",added_at:new Date().toISOString().slice(0,10),last_reviewed:"not-yet-reviewed",featured:false});
fs.writeFileSync("catalog/tools.json",JSON.stringify(records,null,2)+"\n");checkCatalog();console.log("Added "+p.name);
