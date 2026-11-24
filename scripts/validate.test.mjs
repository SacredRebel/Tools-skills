import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {lintCatalog,loadSchema} from "./validate.mjs";
const schema=loadSchema();
const real=JSON.parse(fs.readFileSync("catalog/tools.json","utf8"));
// A tiny schema so single-record tests are not tripped by category-size rules.
const tiny={...schema,categories:["Design & UI"],limits:{...schema.limits,min_per_category:1}};
const good={id:"x",name:"X",url:"https://example.com/x",category:"Design & UI",kind:"app",description:"A tool.",tags:["a","b"],use_when:"Use when you need an example tool for testing.",source:"website",status:"unverified-active",added_at:"2026-11-24",last_reviewed:null,featured:false};
const lint=(...r)=>lintCatalog(r,tiny);
test("shipped catalog is valid",()=>assert.deepEqual(lintCatalog(real,schema),[]));
test("good record passes",()=>assert.deepEqual(lint(good),[]));
test("rejects unknown category, kind and status",()=>{
 const e=lint({...good,category:"Nope",kind:"nope",status:"nope"}).join("\n");
 assert.match(e,/category/);assert.match(e,/kind/);assert.match(e,/status/)});
test("rejects use_when that repeats description",()=>assert.match(lint({...good,description:"A tool for testing things.",use_when:"Use when: A tool for testing things."}).join(),/repeats/));
test("rejects bad dates and review before add",()=>{
 assert.match(lint({...good,added_at:"2026-13-40"}).join(),/added_at/);
 assert.match(lint({...good,last_reviewed:"2026-11-01"}).join(),/before added_at/)});
test("rejects duplicate id and url",()=>{
 const e=lint(good,{...good}).join();assert.match(e,/duplicate id/);assert.match(e,/duplicate url/)});
test("rejects source that disagrees with host",()=>assert.match(lint({...good,source:"github"}).join(),/source is github/));
test("rejects http urls, unknown fields, too few tags",()=>{
 const e=lint({...good,url:"http://example.com/x",extra:1,tags:["a"]}).join();
 assert.match(e,/https/);assert.match(e,/unknown field/);assert.match(e,/tags/)});
test("flags tiny categories",()=>assert.match(lintCatalog([good],{...tiny,limits:{...tiny.limits,min_per_category:3}}).join(),/minimum 3/));
