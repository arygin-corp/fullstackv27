import { setLocale } from "./locale.js";
import { getLayout, resetLayout, setLayout } from "./layout.js";
import { getPresentation, resetPresentation, setPresentation } from "./presentation.js";
import { setTheme } from "./theme.js";
import { initBrandingSettings } from "./branding.js";
import { readJson, writeJson } from "./storage.js";

const currentRoute=()=>document.body?.dataset?.currentRoute||"";
const main=()=>document.querySelector("#main-content");
const allButtons=(root=document)=>[...root.querySelectorAll("button")];
const button=(root,text)=>allButtons(root).find((b)=>b.textContent.trim()===text)||null;
const buttons=(root,text)=>allButtons(root).filter((b)=>b.textContent.trim()===text);
const validEmail=(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||""));

function setButtonActive(btn, active){
  if(!btn)return;
  const primary=["bg-primary","text-primary-foreground"];
  const outline=["border","border-border","bg-background"];
  [...primary,...outline].forEach((c)=>btn.classList.remove(c));
  (active?primary:outline).forEach((c)=>btn.classList.add(c));
}
function setCheckbox(btn,checked){
  if(!btn)return;
  btn.dataset.state=checked?"checked":"unchecked";
  btn.setAttribute("aria-checked",String(checked));
  const indicator=btn.querySelector("[data-indicator]");
  if(indicator)indicator.hidden=!checked;
}
function setSwitch(btn,checked){
  if(!btn)return;
  btn.dataset.state=checked?"checked":"unchecked";
  btn.setAttribute("aria-checked",String(checked));
  btn.querySelector("[data-switch-thumb]")?.setAttribute("data-state",checked?"checked":"unchecked");
}
function selectValue(root,value){
  if(!root)return;
  const option=[...root.querySelectorAll("[data-select-option]")].find((o)=>(o.dataset.value||o.textContent.trim())===value);
  root.dataset.value=value;
  root.querySelectorAll("[data-select-option]").forEach((o)=>o.setAttribute("aria-selected",String(o===option)));
  const label=root.querySelector("[data-select-value]");
  if(label&&option)label.textContent=option.dataset.label||option.textContent.trim();
}
function errorFor(control,message){
  if(!control)return false;
  const wrap=control.closest(".grid.gap-2")||control.parentElement;
  let node=wrap?.querySelector("[data-d2-admin-error]");
  if(message){
    control.setAttribute("aria-invalid","true");
    if(!node&&wrap){node=document.createElement("p");node.dataset.d2AdminError="true";node.className="text-xs font-medium text-destructive";node.setAttribute("role","alert");wrap.append(node);}
    if(node)node.textContent=message;
    return false;
  }
  control.setAttribute("aria-invalid","false");node?.remove();return true;
}
function sampleSuccess(root){
  if(root.querySelector("[data-d2-auth-success]"))return;
  const box=document.createElement("div");
  box.dataset.d2AuthSuccess="true";
  box.className="mb-5 rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-foreground";
  box.innerHTML='<p class="font-semibold text-success">Sample action complete</p><p class="mt-1 text-muted-foreground">No request was sent. Connect this action to your own authentication backend.</p>';
  const content=root.querySelector(".space-y-5,.space-y-3,form")?.parentElement||root;
  content.prepend(box);
}

function initAuth(){
  if(!currentRoute().startsWith("/auth/"))return;
  const root=main();if(!root)return;
  const r=currentRoute();
  if(r==="/auth/verify-email"){
    button(root,"Resend verification email")?.addEventListener("click",()=>sampleSuccess(root));return;
  }
  if(r==="/auth/social-login"){
    allButtons(root).filter((b)=>b.textContent.includes("Continue with")).forEach((b)=>b.addEventListener("click",()=>sampleSuccess(root)));return;
  }
  if(r==="/auth/otp"||r==="/auth/two-factor"){
    const form=root.querySelector("form"), digits=[...root.querySelectorAll('input[aria-label^="Code digit"]')];
    digits.forEach((input)=>input.addEventListener("input",()=>{input.value=input.value.replace(/\D/g,"").slice(-1);errorFor(input,"");}));
    form?.addEventListener("submit",(e)=>{e.preventDefault();const ok=/^\d{6}$/.test(digits.map((x)=>x.value).join(""));digits.forEach((x)=>errorFor(x,ok?"":"Enter the complete six-digit code."));if(ok)sampleSuccess(root);});return;
  }
  const form=root.querySelector("form");if(!form)return;
  form.addEventListener("submit",(e)=>{
    e.preventDefault();let ok=true;
    const name=form.querySelector("#name"), email=form.querySelector("#email"), pass=form.querySelector("#password"), confirm=form.querySelector("#confirm"), terms=form.querySelector("#terms");
    if(r==="/auth/register")ok=errorFor(name,name?.value.trim().length>=2?"":"Enter your full name.")&&ok;
    if(!["/auth/reset-password"].includes(r))ok=errorFor(email,validEmail(email?.value)?"":"Enter a valid email address.")&&ok;
    if(!["/auth/forgot-password","/auth/magic-link"].includes(r)){
      let msg=""; const v=pass?.value||"";
      if(!v)msg="Password is required.";
      else if(["/auth/register","/auth/reset-password"].includes(r)&&(!/[a-z]/.test(v)||!/[A-Z]/.test(v)||!(/\d/.test(v))))msg="Use uppercase, lowercase and a number.";
      ok=errorFor(pass,msg)&&ok;
    }
    if(r==="/auth/reset-password")ok=errorFor(confirm,confirm?.value===pass?.value?"":"Passwords do not match.")&&ok;
    if(r==="/auth/register")ok=errorFor(terms,terms?.getAttribute("aria-checked")==="true"?"":"Accept the terms to continue.")&&ok;
    if(ok)sampleSuccess(root);
  });
}

function initRbac(){
  if(currentRoute()!=="/access/matrix")return;
  const root=main();if(!root)return;
  const roleNames=["Administrator","Manager","Analyst","Support"], roleButtons=roleNames.map((n)=>button(root,n)).filter(Boolean);
  const checks=[...root.querySelectorAll("[data-checkbox][aria-label]")];
  checks.forEach((c)=>c.dataset.d2BaseChecked=String(c.getAttribute("aria-checked")==="true"));
  const apply=(role)=>{
    roleButtons.forEach((b)=>setButtonActive(b,b.textContent.trim()===role));
    checks.forEach((c)=>{const action=(c.getAttribute("aria-label")||"").split(" ").at(-1);let checked=c.dataset.d2BaseChecked==="true";if(role==="Analyst"&&["create","edit","delete","approve"].includes(action))checked=false;setCheckbox(c,checked);});
  };
  roleButtons.forEach((b)=>b.addEventListener("click",()=>apply(b.textContent.trim())));apply("Manager");
}

function initUserDirectory(){
  if(currentRoute()!=="/users")return;
  const root=main();if(!root)return;
  const search=root.querySelector('input[aria-label="Search users"]'), selects=[...root.querySelectorAll("[data-select]")];
  const table=root.querySelector("tbody"), rows=table?[...table.querySelectorAll("tr")]:[];
  const statusSel=selects[0],roleSel=selects[1];
  function apply(){
    const q=(search?.value||"").trim().toLowerCase(), status=statusSel?.dataset.value||"all", role=roleSel?.dataset.value||"all";let visible=0;
    rows.forEach((tr)=>{const t=tr.textContent.toLowerCase();const statusOk=status==="all"||t.includes(` ${status} `)||t.includes(status);const roleOk=role==="all"||t.includes(role.toLowerCase());const show=(!q||t.includes(q))&&statusOk&&roleOk;tr.hidden=!show;if(show)visible++;});
    let empty=table?.parentElement?.querySelector("[data-d2-users-empty]");
    if(visible===0&&!empty){empty=document.createElement("div");empty.dataset.d2UsersEmpty="true";empty.className="p-8 text-center text-sm text-muted-foreground";empty.textContent="No users match the current filters.";table?.parentElement?.append(empty);}else if(visible>0)empty?.remove();
  }
  search?.addEventListener("input",apply);statusSel?.addEventListener("vexlora:select",apply);roleSel?.addEventListener("vexlora:select",apply);apply();
}
function initUserApiKeys(){
  if(currentRoute()!=="/users/api-keys")return;
  const root=main();if(!root)return;
  buttons(root,"Revoke").forEach((b)=>b.addEventListener("click",()=>{const card=b.closest(".rounded-lg.border.border-border")||b.closest("li")||b.parentElement?.parentElement;b.closest(".rounded-lg")?.remove()||card?.remove();}));
}
function initUserForm(){
  if(!["/users/create","/users/edit"].includes(currentRoute()))return;
  const root=main(), form=root?.querySelector("form");if(!root||!form)return;
  const sels=[...form.querySelectorAll("[data-select]")];
  const onboarding=sels.find((s)=>[...s.querySelectorAll("[data-select-option]")].some((o)=>o.dataset.value==="invite"));
  const status=sels.find((s)=>[...s.querySelectorAll("[data-select-option]")].some((o)=>o.dataset.value==="invited"));
  const submit=[...form.querySelectorAll('button[type="submit"],button')].find((b)=>["Send invitation","Save changes","Save user"].some((x)=>b.textContent.includes(x)))||form.querySelector('button[type="submit"]');
  const description=[...form.querySelectorAll("p")].find((p)=>p.textContent.includes("Create the identity in an invited state")||p.textContent.includes("Provision"));
  const sync=()=>{
    const invite=(onboarding?.dataset.value||"invite")==="invite";
    if(submit&&currentRoute()==="/users/create")submit.childNodes.forEach(()=>{}),submit.lastChild && (submit.lastChild.nodeType===3?submit.lastChild.textContent=invite?"Send invitation":"Provision user":null);
    if(submit&&currentRoute()==="/users/create"){
      const svg=submit.querySelector("svg");submit.textContent="";if(svg)submit.append(svg);submit.append(document.createTextNode(invite?"Send invitation":"Provision user"));
    }
    if(description)description.textContent=invite?"Create the identity in an invited state and send the user through the connected sign-in flow.":"Create the identity immediately; authentication still remains with the connected identity provider.";
    if(invite&&status&&currentRoute()==="/users/create")selectValue(status,"invited");
  };
  onboarding?.addEventListener("vexlora:select",sync);sync();
  form.addEventListener("submit",(e)=>{e.preventDefault();const inputs=[...form.querySelectorAll("input")];const name=inputs.find((i)=>i.placeholder==="Full name"), email=inputs.find((i)=>i.type==="email");let ok=true;ok=errorFor(name,name?.value.trim().length>=2?"":"Enter the user's full name.")&&ok;ok=errorFor(email,validEmail(email?.value)?"":"Enter a valid work email address.")&&ok;if(ok)form.dataset.d2Submitted="true";});
}

function closeDialog(dialog){if(!dialog)return;dialog.hidden=true;dialog.dispatchEvent(new CustomEvent("vexlora:layer-close"));}
function initOrganization(){
  const r=currentRoute();if(!r.startsWith("/organization"))return;const root=main();if(!root)return;
  if(r==="/organization/members"){
    const input=root.querySelector('input[aria-label="Search organization members"]'), rows=[...root.querySelectorAll("tbody tr")];input?.addEventListener("input",()=>{const q=input.value.toLowerCase();rows.forEach((tr)=>tr.hidden=!tr.textContent.toLowerCase().includes(q));});return;
  }
  if(r==="/organization/settings"){
    const save=button(root,"Save changes");save?.addEventListener("click",()=>{const svg=save.querySelector("svg");save.textContent="";if(svg)save.append(svg);save.append("Saved");save.dataset.saved="true";});return;
  }
  if(r==="/organization"){
    const title=[...root.querySelectorAll("h2")].find((h)=>h.textContent.trim()==="Create organization"), dialog=title?.closest("[data-dialog]");if(!dialog)return;
    const inputs=[...dialog.querySelectorAll("input")], sel=dialog.querySelector("[data-select]"), create=buttons(dialog,"Create organization").at(-1), cancel=button(dialog,"Cancel");
    const grid=[...root.querySelectorAll(".grid")].find((g)=>g.textContent.includes("Northstar Labs")&&g.textContent.includes("Atlas Commerce"));
    const update=()=>{if(create)create.disabled=!(inputs[0]?.value.trim()&&inputs[1]?.value.trim());};inputs.forEach((i)=>i.addEventListener("input",update));cancel?.addEventListener("click",()=>closeDialog(dialog));
    create?.addEventListener("click",()=>{if(create.disabled)return;const card=grid?.children[0]?.cloneNode(true);if(card&&grid){const name=inputs[0].value.trim(), owner=inputs[1].value.trim(),region=sel?.dataset.value||"US East";const h=card.querySelector("h3");if(h)h.textContent=name;const desc=[...card.querySelectorAll("p")].find((p)=>p.textContent.includes("·"));if(desc)desc.textContent=`${name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")} · ${region}`;const badge=card.querySelector("span.inline-flex.rounded-full");if(badge)badge.textContent="trial";grid.append(card);}inputs.forEach((i)=>i.value="");selectValue(sel,"US East");update();closeDialog(dialog);});update();return;
  }
  if(r==="/organization/workspaces"){
    const title=[...root.querySelectorAll("h2")].find((h)=>h.textContent.trim()==="New workspace"),dialog=title?.closest("[data-dialog]");if(!dialog)return;
    const input=dialog.querySelector("input"),sel=dialog.querySelector("[data-select]"),create=button(dialog,"Create workspace"),cancel=button(dialog,"Cancel");const grid=[...root.querySelectorAll(".grid")].find((g)=>g.textContent.includes("Core Platform")&&g.textContent.includes("Growth Lab"));
    const update=()=>{if(create)create.disabled=(input?.value.trim().length||0)<=1;};input?.addEventListener("input",update);cancel?.addEventListener("click",()=>closeDialog(dialog));create?.addEventListener("click",()=>{if(create.disabled)return;const card=grid?.children[0]?.cloneNode(true);if(card&&grid){const h=card.querySelector("h3");if(h)h.textContent=input.value.trim();const desc=[...card.querySelectorAll("p")].find((p)=>["Production","Staging","Development"].includes(p.textContent.trim()));if(desc)desc.textContent=sel?.dataset.value||"Production";const metrics=[...card.querySelectorAll("p.font-semibold")];if(metrics[0])metrics[0].textContent="1";if(metrics[1])metrics[1].textContent="0";grid.append(card);}input.value="";selectValue(sel,"Production");update();closeDialog(dialog);});update();return;
  }
  if(r==="/organization/invitations"){
    const title=[...root.querySelectorAll("h2")].find((h)=>h.textContent.trim()==="Invite organization member"),dialog=title?.closest("[data-dialog]");if(!dialog)return;
    const email=dialog.querySelector('input[type="email"]'), workspace=[...dialog.querySelectorAll("input")].find((i)=>i!==email),sel=dialog.querySelector("[data-select]"),send=buttons(dialog,"Send invitation").at(-1),cancel=button(dialog,"Cancel");const list=[...root.querySelectorAll(".divide-y.divide-border")].find((x)=>x.textContent.includes("sara@example.com"));
    const update=()=>{if(send)send.disabled=!String(email?.value||"").includes("@");};email?.addEventListener("input",update);cancel?.addEventListener("click",()=>closeDialog(dialog));send?.addEventListener("click",()=>{if(send.disabled)return;const row=list?.children[0]?.cloneNode(true);if(row&&list){const ps=row.querySelectorAll("p");if(ps[0])ps[0].textContent=email.value.trim();if(ps[1])ps[1].textContent=`${sel?.dataset.value||"Member"} · ${workspace?.value||"All workspaces"} · invited by Alex Morgan`;const time=[...row.querySelectorAll("span")].find((s)=>s.textContent.includes("days")||s.textContent.includes("Expired"));if(time)time.textContent="7 days";list.append(row);}email.value="";if(workspace)workspace.value="All workspaces";selectValue(sel,"Member");update();closeDialog(dialog);});update();
  }
}

const settingsResourceRoutes=new Set(["/settings","/settings/advanced","/settings/data-privacy","/settings/email","/settings/feature-flags","/settings/notifications","/settings/security","/settings/storage","/settings/upload-policy"]);
function initSettingsResource(){
  const r=currentRoute();if(!settingsResourceRoutes.has(r))return;const root=main();if(!root)return;
  const save=button(root,"Save changes"), reset=button(root,"Reset"), status=[...root.querySelectorAll("span")].find((s)=>["Settings are up to date.","You have unsaved changes.","Changes saved"].includes(s.textContent.trim()))||[...root.querySelectorAll("div")].find((d)=>d.textContent.trim()==="Settings are up to date.");
  const inputs=[...root.querySelectorAll("input")], switches=[...root.querySelectorAll("[data-switch]")], selects=[...root.querySelectorAll("[data-select]")];
  const initial={inputs:inputs.map((x)=>x.value),switches:switches.map((x)=>x.getAttribute("aria-checked")==="true"),selects:selects.map((x)=>x.dataset.value||"")};
  const storageKey=`vexlora.settings.${r.split('/').at(-1)==='settings'?'general':r.split('/').at(-1)}`;
  const capture=()=>({inputs:inputs.map(x=>x.value),switches:switches.map(x=>x.getAttribute('aria-checked')==='true'),selects:selects.map(x=>x.dataset.value||'')});
  const restore=value=>{inputs.forEach((x,i)=>{if(typeof value.inputs?.[i]==='string')x.value=value.inputs[i];});switches.forEach((x,i)=>{if(typeof value.switches?.[i]==='boolean')setSwitch(x,value.switches[i]);});selects.forEach((x,i)=>{if(typeof value.selects?.[i]==='string')selectValue(x,value.selects[i]);});};
  restore(readJson(storageKey,initial));
  const mark=()=>{if(status)status.textContent="You have unsaved changes.";if(save)save.disabled=false;if(reset)reset.disabled=false;};
  inputs.forEach((x)=>x.addEventListener("input",mark));switches.forEach((x)=>x.addEventListener("vexlora:change",mark));selects.forEach((x)=>x.addEventListener("vexlora:select",mark));
  save?.addEventListener("click",()=>{const ok=writeJson(storageKey,capture());if(status)status.textContent=ok?"Changes saved":"Unable to save settings in browser storage.";save.disabled=ok;if(reset)reset.disabled=false;root.dataset.d2SettingsSaved=String(ok);});
  reset?.addEventListener("click",()=>{restore(initial);writeJson(storageKey,initial);if(status)status.textContent="Settings are up to date.";if(save)save.disabled=true;if(reset)reset.disabled=true;root.dataset.d2SettingsSaved="false";});
}
function initAccountProfile(){
  if(currentRoute()!=="/settings/account")return;const root=main();if(!root)return;
  const inputs=[...root.querySelectorAll('input:not([type="file"])')], bio=root.querySelector("textarea"), save=button(root,"Save profile"), reset=button(root,"Reset");const defaults={inputs:inputs.map((i)=>i.value),bio:bio?.value||""};
  const status=[...root.querySelectorAll("div")].find((d)=>d.textContent.trim().startsWith("Profile changes stay in this frontend sample"));
  save?.addEventListener("click",()=>{if(status)status.textContent="Profile changes saved";root.dataset.d2ProfileSaved="true";});
  reset?.addEventListener("click",()=>{inputs.forEach((i,n)=>i.value=defaults.inputs[n]);if(bio)bio.value=defaults.bio;if(status)status.textContent="Profile changes stay in this frontend sample until a buyer connects an account API.";root.dataset.d2ProfileSaved="false";});
}
function initLocalization(){
  if(currentRoute()!=="/settings/localization")return;const root=main();if(!root)return;
  const map=[
    ["English","en","en-US","USD","ltr"],["العربية","ar","ar-SA","SAR","rtl"],["Deutsch","de","de-DE","EUR","ltr"],["Français","fr","fr-FR","EUR","ltr"]
  ];
  const infoRows=()=>[...root.querySelectorAll("div")].filter((d)=>d.children.length===2&&[...d.children].some((c)=>c.textContent.trim()==="Locale"));
  function update(code,intl,currency,dir){setLocale(code);setPresentation({direction:dir});map.forEach(([label,c])=>setButtonActive(allButtons(root).find((b)=>b.textContent.trim().startsWith(label)),c===code));["LTR","RTL"].forEach((x)=>setButtonActive(button(root,x),x.toLowerCase()===dir));const text=root.querySelector("#main-content")||root;text.dataset.d2Locale=intl;text.dataset.d2Currency=currency;}
  map.forEach(([label,code,intl,currency,dir])=>allButtons(root).find((b)=>b.textContent.trim().startsWith(label))?.addEventListener("click",()=>update(code,intl,currency,dir)));
  ["LTR","RTL"].forEach((x)=>button(root,x)?.addEventListener("click",()=>{setPresentation({direction:x.toLowerCase()});["LTR","RTL"].forEach((y)=>setButtonActive(button(root,y),x===y));}));
}
function initAppearance(){
  if(currentRoute()!=="/settings/appearance")return;const root=main();if(!root)return;
  ["Light","Dark","System"].forEach((name)=>button(root,name)?.addEventListener("click",()=>{setTheme(name.toLowerCase());["Light","Dark","System"].forEach((x)=>setButtonActive(button(root,x),x===name));}));
  const accents={GDX:"violet","Data Marketplace":"indigo",Toyota:"rose"};Object.entries(accents).forEach(([label,value])=>button(root,label)?.addEventListener("click",()=>setPresentation({accent:value})));
  const selects=[...root.querySelectorAll("[data-select]")]; const mapping=["navigation","sidebar","header","contentWidth","radius","font","density","direction"];
  selects.forEach((sel,i)=>sel.addEventListener("vexlora:select",(e)=>{const key=mapping[i],value=e.detail?.value;if(!key)return;if(["navigation","sidebar","header","contentWidth"].includes(key))setLayout({[key]:value});else setPresentation({[key]:value});if(key==="navigation"&&selects[1])selects[1].querySelector("[data-select-trigger]").disabled=value==="horizontal";}));
  const layout=getLayout(),presentation=getPresentation();
  mapping.forEach((key,i)=>selectValue(selects[i],layout[key]??presentation[key]));
  if(selects[1])selects[1].querySelector('[data-select-trigger]').disabled=layout.navigation==='horizontal';
  button(root,"Reset customizer")?.addEventListener("click",()=>{resetLayout();resetPresentation();setTheme("system");const l=getLayout(),p=getPresentation();[l.navigation,l.sidebar,l.header,l.contentWidth,p.radius,p.font,p.density,p.direction].forEach((v,i)=>selectValue(selects[i],v));});
}

export function initD2AdminInteractions(){
  initAuth();initRbac();initUserDirectory();initUserApiKeys();initUserForm();initOrganization();initSettingsResource();initAccountProfile();initLocalization();initAppearance();initBrandingSettings();
}
