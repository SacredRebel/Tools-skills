import fs from "node:fs";
const file="catalog/tools.json";
export function checkCatalog(){
const data=JSON.parse(fs.readFileSync(file,"utf8"));
if(!Array.isArray(data))throw Error("Catalog must be an array");
const ids=new Set(),urls=new Set();
for(const t of data){
for(const key of ["id","name","url","description","category","kind"])if(typeof t[key]!=="string"||!t[key].trim())throw Error("Missing "+key);
if(!Array.isArray(t.tags)||t.tags.some(x=>typeof x!=="string"))throw Error("Invalid tags in "+t.id);
const u=new URL(t.url);if(u.protocol!=="https:"||u.username||u.password)throw Error("Unsafe URL: "+t.url);
if(ids.has(t.id)||urls.has(u.href.replace(/\/$/,"")))throw Error("Duplicate id or URL: "+t.id);
ids.add(t.id);urls.add(u.href.replace(/\/$/,""));
}
console.log("Validated "+data.length+" resources in "+new Set(data.map(x=>x.category)).size+" categories");return data;
}
if(process.argv[1]?.endsWith("validate.mjs"))checkCatalog();
