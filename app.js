(function browserApp(){
"use strict";
const REPO="https://github.com/SacredRebel/Tools-skills";
const $=s=>document.querySelector(s);
const html=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cleanURL=u=>{try{const x=new URL(u);return x.protocol==="https:"&&!x.username&&!x.password?x.href:"#"}catch{return"#"}};
const labels={"component-library":"UI components",gallery:"Gallery",platform:"Platform",app:"Application",repository:"Repository",library:"Code library","agent-skill":"Agent skill","agent-tool":"Agent tool",utility:"Utility",example:"Example",model:"Model",dataset:"Dataset",research:"Research",sdk:"SDK",website:"Website",collection:"Collection",api:"API",template:"Template"};
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
let entries=[],drafts=read("ts-drafts",[]),stars=read("ts-stars",[]),view="overview",category="all",kind="all",sort="featured",search="",limit=12;
function persist(){try{localStorage.setItem("ts-drafts",JSON.stringify(drafts));localStorage.setItem("ts-stars",JSON.stringify(stars))}catch{}}
function list(){return [...drafts,...entries.filter(t=>!drafts.some(d=>d.url===t.url))]}
function cats(){return [...new Set(list().map(x=>x.category))].sort()}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("visible");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("visible"),2500)}
async function copy(s){try{await navigator.clipboard.writeText(s);toast("Copied to clipboard")}catch{toast("Clipboard access unavailable")}}
function prompt(){return `Use this Tools & Skills Library to equip yourself for my workflow:\n${REPO}\n\n1. Read ${REPO}/blob/main/AGENTS.md.\n2. Search ${REPO}/blob/main/catalog/tools.json for capabilities that match my goal.\n3. Recommend the smallest useful set of tools with URLs, reasoning and required accounts/installations.\n4. Verify current official docs, license, price, compatibility and security. Never automatically install or execute unfamiliar code without approval.\n5. Use connected tools only with their available permissions. If missing, explain the integration needed.\n6. Suggest catalog additions when useful.\n\nMy workflow: [describe task here]`}
function kinds(){return [...new Set(list().map(t=>t.kind))].sort()}
function renderSide(){
$("#category-side").innerHTML=cats().map(c=>`<button class="side-category ${c===category?"active":""}" data-category="${html(c)}"><span>${html(c)}</span><b>${list().filter(t=>t.category===c).length}</b></button>`).join("");
$("#category").innerHTML='<option value="all">All categories</option>'+cats().map(c=>`<option value="${html(c)}">${html(c)}</option>`).join("");
$("#category").value=category;
$("#kind").innerHTML='<option value="all">All types</option>'+kinds().map(k=>`<option value="${html(k)}">${html(labels[k]||k)}</option>`).join("");
$("#kind").value=kind;
$("#add-category").innerHTML=cats().map(c=>`<option value="${html(c)}">${html(c)}</option>`).join("");
$("#add-kind").innerHTML=[...new Set(["website",...kinds()])].sort().map(k=>`<option value="${html(k)}">${html(labels[k]||k)}</option>`).join("");$("#add-kind").value="website";
}
function tag(s){return `<span class="tag">${html(s)}</span>`}
function thumb(t){if(t.source==="github"&&t.url.startsWith("https://github.com/"))return "https://opengraph.githubassets.com/1/"+t.url.slice(19);if(t.source==="website")return "https://s.wordpress.com/mshots/v1/"+encodeURIComponent(t.url)+"?w=600";return ""}
function shown(){let a=list();if(view==="favorites")a=a.filter(t=>stars.includes(t.id));if(category!=="all")a=a.filter(t=>t.category===category);if(kind!=="all")a=a.filter(t=>t.kind===kind);if(search.trim()){const q=search.toLowerCase().trim().split(/\s+/);a=a.filter(t=>q.every(w=>[t.name,t.url,t.category,t.kind,t.description,t.use_when,t.language,t.license,t.status,...(t.tags||[])].join(" ").toLowerCase().includes(w)))}a.sort((x,y)=>sort==="az"?x.name.localeCompare(y.name):sort==="newest"?String(y.added_at).localeCompare(x.added_at):Number(!!y.featured)-Number(!!x.featured)||x.name.localeCompare(y.name));return a}
function renderPills(){const picks=["all","Design & UI","AI Agents & Skills","SEO & Analytics","Video & Motion","Audio & Music","3D & Immersive","CAD & Parametric Design","Calendar & Scheduling","Email & Outreach","Visual Development & OCR","Developer Tools","Research & Data"];$("#pills").innerHTML=picks.filter(c=>c==="all"||cats().includes(c)).map(c=>`<button class="pill ${category===c?"active":""}" data-category="${html(c)}">${c==="all"?"All resources":html(c)}</button>`).join("")}
function card(t){
const image=thumb(t),f=stars.includes(t.id);
return `<article class="card"><div class="preview" data-detail="${html(t.id)}"><div class="fallback">${html(t.name.slice(0,2).toUpperCase())}</div>${image?`<img src="${html(image)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="" onerror="this.style.display='none'">`:""}<span class="source-pill">${t.source==="github"?"GITHUB":"WEB RESOURCE"}</span><span class="inspect">Inspect ↗</span></div><div class="card-content"><div class="card-head"><h3><button data-detail="${html(t.id)}">${html(t.name)}</button></h3><button class="favorite ${f?"on":""}" data-star="${html(t.id)}" aria-label="${f?"Remove favorite":"Add favorite"}">${f?"★":"☆"}</button></div><div class="metadata">${html(t.category)} · ${html(labels[t.kind]||t.kind)}${t.local?" · Personal draft":""}${t.status==="archived"?" · Archived":""}</div><p class="description">${html(t.description)}</p><div class="tags">${(t.tags||[]).slice(0,3).map(tag).join("")}</div><div class="card-foot"><a href="${html(cleanURL(t.url))}" target="_blank" rel="noopener noreferrer">Open resource ↗</a><button data-detail="${html(t.id)}">Details →</button></div></div></article>`;
}
function render(){
const found=shown(),title=view==="favorites"?"Favorite resources":category!=="all"?category:view==="all"?"All resources":"Resource library";
$("#list-title").textContent=title+"  ·  "+found.length;
$("#cards").innerHTML=found.length?found.slice(0,limit).map(card).join(""):'<div class="empty">No matching resources. Try a different search or add a new one.</div>';
$("#more").hidden=found.length<=limit;
$("#count-all").textContent=list().length;$("#count-categories").textContent=cats().length;$("#count-github").textContent=list().filter(t=>t.source==="github").length;$("#count-favorites").textContent=stars.length;
renderPills();
document.querySelectorAll("[data-nav]").forEach(el=>el.classList.toggle("active",el.dataset.nav===view));
document.querySelectorAll(".side-category").forEach(el=>el.classList.toggle("active",el.dataset.category===category));
}
function nav(next){view=next;category="all";kind="all";search="";limit=12;$("#search").value="";renderSide();render();$("#sidebar").classList.remove("open");(next==="agents"?$("#agents"):$("#library")).scrollIntoView({behavior:"smooth"})}
function toggleStar(id){stars=stars.includes(id)?stars.filter(x=>x!==id):[...stars,id];persist();render()}
function details(id){
const t=list().find(x=>x.id===id);if(!t)return;
$("#detail-content").innerHTML=`<div class="detail-top"><button class="close" id="detail-close" style="float:right" aria-label="Close">✕</button><div class="eyebrow">${html(t.category)} / ${html(labels[t.kind]||t.kind)}</div><h2>${html(t.name)}</h2><p>${html(t.description)}</p></div><div class="detail-body"><h3>When to use</h3><p>${html(t.use_when||t.description)}</p><h3>Tags and capabilities</h3><div class="tags">${(t.tags||[]).map(tag).join("")}</div><h3>Source URL</h3><p>${html(t.url)}${t.status==="archived"?" (archived repository)":""}</p><div class="detail-actions"><a class="btn primary" target="_blank" rel="noopener noreferrer" href="${html(cleanURL(t.url))}">Open source ↗</a><button class="btn secondary" id="detail-copy">Copy for agent</button><button class="btn secondary" id="detail-star">${stars.includes(id)?"★ Starred":"☆ Favorite"}</button></div></div>`;
$("#details").showModal();
$("#detail-copy").onclick=()=>copy([t.name,t.url,t.description,"Use when: "+(t.use_when||""),"Tags: "+(t.tags||[]).join(", ")].join("\n"));
$("#detail-star").onclick=()=>{toggleStar(id);$("#details").close();details(id)};
$("#detail-close").onclick=()=>$("#details").close();
}
function slug(s){return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function entryFromForm(){
const f=new FormData($("#add-form"));
const t={name:String(f.get("name")||"").trim(),url:String(f.get("url")||"").trim(),category:String(f.get("category")||"").trim(),kind:String(f.get("kind")||"website"),description:String(f.get("description")||"").trim(),tags:String(f.get("tags")||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean).slice(0,12)};
if(!t.name||!t.category||!t.description||cleanURL(t.url)==="#"){toast("Complete all fields and use a valid HTTPS URL");return null}
return {...t,id:slug(t.name),source:t.url.startsWith("https://github.com/")?"github":"website",use_when:t.description,local:true,status:"pending",added_at:new Date().toISOString().slice(0,10)};
}
function save(t){
if(!t)return false;
if(entries.some(x=>x.url.replace(/\/$/,"")===t.url.replace(/\/$/,""))){toast("Already in the main catalog");return false}
drafts=[t,...drafts.filter(x=>x.id!==t.id&&x.url!==t.url)];persist();renderSide();render();toast("Saved as a local draft");return true;
}
function github(t){
if(!t)return;
save(t);
const payload={name:t.name,url:t.url,category:t.category,kind:t.kind,description:t.description,tags:t.tags};
const body="Catalog proposal. Review the JSON before submitting the GitHub issue.\n\n```json\n"+JSON.stringify(payload,null,2)+"\n```";
const url=REPO+"/issues/new?title="+encodeURIComponent("Add tool: "+t.name)+"&body="+encodeURIComponent(body);
window.open(url,"_blank","noopener,noreferrer");
$("#save-note").textContent="Submit the GitHub issue in the opened tab to request permanent catalog storage. Local drafts are browser-only.";
}
function exportJSON(){
const blob=new Blob([JSON.stringify(list(),null,2)+"\n"],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="tools-skills-catalog.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Exported JSON");
}
document.addEventListener("click",e=>{const el=e.target.closest("[data-category],[data-nav],[data-detail],[data-star]");if(!el)return;if(el.dataset.category!==undefined){category=el.dataset.category;view="all";limit=12;renderSide();render()}else if(el.dataset.nav)nav(el.dataset.nav);else if(el.dataset.detail)details(el.dataset.detail);else if(el.dataset.star)toggleStar(el.dataset.star)});
$("#search").oninput=e=>{search=e.target.value;limit=12;render()};
$("#category").onchange=e=>{category=e.target.value;limit=12;render()};
$("#kind").onchange=e=>{kind=e.target.value;limit=12;render()};
$("#sort").onchange=e=>{sort=e.target.value;render()};
$("#more").onclick=()=>{limit+=12;render()};
$("#export").onclick=exportJSON;
$("#menu").onclick=()=>$("#sidebar").classList.toggle("open");
document.querySelectorAll(".add-trigger").forEach(b=>b.onclick=()=>$("#add").showModal());
document.querySelectorAll(".copy-agent").forEach(b=>b.onclick=()=>copy(prompt()));
$("#add-form").onsubmit=e=>{e.preventDefault();const t=entryFromForm();if(save(t)){$("#add").close();$("#add-form").reset()}};
$("#save-github").onclick=()=>github(entryFromForm());
$("#add .close").onclick=()=>$("#add").close();
for(const id of ["#add","#details"])$(id).addEventListener("click",e=>{if(e.target===$(id))$(id).close()});
document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();$("#search").focus()}});
(async()=>{try{const response=await fetch("/catalog/tools.json");if(!response.ok)throw Error(response.status);entries=await response.json();if(!Array.isArray(entries))throw Error("Not an array");renderSide();render()}catch(err){$("#cards").innerHTML='<div class="empty">Could not load the catalog. Please refresh or open the GitHub source.</div>';console.error(err)}})();
})();
