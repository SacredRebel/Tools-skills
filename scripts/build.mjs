import fs from "node:fs";
import path from "node:path";
import {checkCatalog} from "./validate.mjs";
checkCatalog();
fs.rmSync("dist",{recursive:true,force:true});fs.mkdirSync("dist/catalog",{recursive:true});
for(const f of ["index.html","app.js","styles.css","favicon.svg","robots.txt","llms.txt","AGENTS.md"])fs.copyFileSync(f,path.join("dist",f));
for(const f of ["tools.json","schema.json"])fs.copyFileSync("catalog/"+f,"dist/catalog/"+f);
console.log("Production files generated in dist/");
