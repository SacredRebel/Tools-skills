import fs from "node:fs";
const CATALOG="catalog/tools.json",SCHEMA="catalog/schema.json";
const REQUIRED=["id","name","url","category","kind","description","tags","use_when","source","status","added_at","last_reviewed","featured"];
const OPTIONAL=["language","license","homepage","comparison","access","verification_note"];
const ID_RE=/^[a-z0-9][a-z0-9-]*$/,TAG_RE=/^[a-z0-9][a-z0-9.+#-]*$/,DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const isDate=s=>{if(typeof s!=="string"||!DATE_RE.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
const norm=u=>{const x=new URL(u);return (x.host+x.pathname).replace(/\/$/,"").toLowerCase()};
export const loadSchema=()=>JSON.parse(fs.readFileSync(SCHEMA,"utf8"));
// Returns an array of human-readable problems; empty means the catalog is valid.
export function lintCatalog(data,schema=loadSchema()){
const errs=[],L=schema.limits,ids=new Set(),urls=new Set(),perCategory={};
if(!Array.isArray(data))return ["Catalog must be an array"];
const cats=new Set(schema.categories),kinds=new Set(schema.kinds),statuses=new Set(schema.statuses),sources=new Set(schema.sources);
const allowed=new Set([...REQUIRED,...OPTIONAL]);
for(const t of data){
 const at=t&&t.id?t.id:"(no id)",e=m=>errs.push(at+": "+m);
 if(!t||typeof t!=="object"||Array.isArray(t)){errs.push("Entry is not an object");continue}
 for(const k of REQUIRED)if(t[k]===undefined||(t[k]===null&&k!=="last_reviewed"))e("missing "+k);
 for(const k of Object.keys(t))if(!allowed.has(k))e("unknown field "+k);
 for(const k of ["id","name","url","description","category","kind","use_when","source","status"])if(t[k]!==undefined&&(typeof t[k]!=="string"||!t[k].trim()))e(k+" must be a non-empty string");
 if(typeof t.id==="string"){ if(!ID_RE.test(t.id))e("id must be a lowercase slug");
  if(ids.has(t.id))e("duplicate id");ids.add(t.id)}
 if(typeof t.name==="string"&&t.name.length>L.name)e("name longer than "+L.name);
 if(typeof t.description==="string"&&t.description.length>L.description)e("description longer than "+L.description);
 if(typeof t.url==="string"){let u;try{u=new URL(t.url)}catch{e("invalid url");u=null}
  if(u){ if(u.protocol!=="https:"||u.username||u.password)e("url must be https without credentials");
   const key=norm(t.url);if(urls.has(key))e("duplicate url");urls.add(key);
   const gh=u.host==="github.com";
   if(t.source==="github"&&!gh)e("source is github but url is not github.com");
   if(t.source==="website"&&gh)e("source is website but url is github.com")}}
 if(t.category!==undefined&&!cats.has(t.category))e("category not in schema.json: "+t.category);
 if(t.kind!==undefined&&!kinds.has(t.kind))e("kind not in schema.json: "+t.kind);
 if(t.status!==undefined&&!statuses.has(t.status))e("status not in schema.json: "+t.status);
 if(t.source!==undefined&&!sources.has(t.source))e("source not in schema.json: "+t.source);
 if(typeof t.category==="string")perCategory[t.category]=(perCategory[t.category]||0)+1;
 if(t.tags!==undefined){ if(!Array.isArray(t.tags))e("tags must be an array");else{
  if(t.tags.length<L.tags_min||t.tags.length>L.tags_max)e("needs "+L.tags_min+"-"+L.tags_max+" tags");
  if(new Set(t.tags).size!==t.tags.length)e("duplicate tags");
  for(const x of t.tags)if(typeof x!=="string"||!TAG_RE.test(x)||x.length>L.tag)e("bad tag "+JSON.stringify(x))}}
 if(typeof t.use_when==="string"){
  const squash=x=>x.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  if(/^(use when|relevant when):/i.test(t.use_when)||(typeof t.description==="string"&&squash(t.description).length>=40&&squash(t.use_when).includes(squash(t.description))))e("use_when just repeats description");
  if(t.use_when.length<25||t.use_when.length>L.use_when)e("use_when must be 25-"+L.use_when+" characters")}
 if(t.featured!==undefined&&typeof t.featured!=="boolean")e("featured must be boolean");
 if(t.added_at!==undefined&&!isDate(t.added_at))e("added_at must be a real YYYY-MM-DD date");
 if(t.last_reviewed!==undefined&&t.last_reviewed!==null&&!isDate(t.last_reviewed))e("last_reviewed must be YYYY-MM-DD or null");
 if(isDate(t.added_at)&&isDate(t.last_reviewed)&&t.last_reviewed<t.added_at)e("last_reviewed is before added_at");
 for(const k of ["language","license","homepage","access","verification_note"])if(t[k]!==undefined&&typeof t[k]!=="string")e(k+" must be a string");
 if(typeof t.homepage==="string"){try{if(new URL(t.homepage).protocol!=="https:")e("homepage must be https")}catch{e("invalid homepage")}}
 if(t.comparison!==undefined&&(typeof t.comparison!=="object"||t.comparison===null||Array.isArray(t.comparison)))e("comparison must be an object");
}
for(const[c,n]of Object.entries(perCategory))if(n<L.min_per_category)errs.push("Category '"+c+"' has "+n+" entries; merge it or add more (minimum "+L.min_per_category+")");
for(const c of cats)if(!perCategory[c])errs.push("Category '"+c+"' is in schema.json but unused");
return errs;
}
export function checkCatalog(){
const data=JSON.parse(fs.readFileSync(CATALOG,"utf8")),errs=lintCatalog(data);
if(errs.length)throw Error(errs.length+" catalog problem(s):\n - "+errs.slice(0,40).join("\n - ")+(errs.length>40?"\n ...and "+(errs.length-40)+" more":""));
console.log("Validated "+data.length+" resources in "+new Set(data.map(x=>x.category)).size+" categories");return data;
}
if(process.argv[1]?.endsWith("validate.mjs")){try{checkCatalog()}catch(e){console.error(e.message);process.exit(1)}}
