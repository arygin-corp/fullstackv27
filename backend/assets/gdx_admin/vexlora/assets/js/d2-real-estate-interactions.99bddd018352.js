import { badgeClass, buttonClass } from "./components/component-styles.js";

const STORAGE_KEY="vexlora:real-estate-operations:v1";
const routes=new Set([
  "/real-estate/properties-listings",
  "/real-estate/leads-viewings",
  "/real-estate/applications-screening",
  "/real-estate/deals",
  "/real-estate/leases-tenants",
  "/real-estate/rent-collections",
  "/real-estate/maintenance-inspections",
  "/real-estate/partners",
  "/real-estate/documents-compliance",
]);

const defaults={
  properties:[
    {id:"PROP-ATL-184",name:"The Meridian Residences",address:"Atlanta, GA",market:"Atlanta",type:"Condo",price:865000,area:"1,420 sq ft",owner:"Helio Properties",agent:"Ava Mitchell",status:"Available",occupancy:94.2,image:"../../../images/real-estate/apartment.png",imageSource:"seed"},
    {id:"PROP-AUS-092",name:"Barton Creek Modern",address:"Austin, TX",market:"Austin",type:"Single family",price:1480000,area:"2,860 sq ft",owner:"Lone Star Residential",agent:"Lucas Bennett",status:"Viewing",occupancy:91.8,image:"../../../images/real-estate/villa.png",imageSource:"seed"},
    {id:"PROP-CHI-077",name:"West Loop Loft 9B",address:"Chicago, IL",market:"Chicago",type:"Loft",price:724000,area:"1,310 sq ft",owner:"Midwest Urban Fund",agent:"Nora Patel",status:"Negotiation",occupancy:90.1,image:"../../../images/real-estate/loft.png",imageSource:"seed"},
    {id:"PROP-MIA-211",name:"Bayline Office Suite",address:"Miami, FL",market:"Miami",type:"Commercial",price:2360000,area:"4,900 sq ft",owner:"Bayline Capital",agent:"Mateo Ruiz",status:"Available",occupancy:88.4,image:"../../../images/real-estate/office.png",imageSource:"seed"},
  ],
  leads:[
    {id:"LEAD-9018",name:"Charlotte Evans",email:"charlotte@example.com",source:"Website",budget:1500000,propertyId:"PROP-AUS-092",agent:"Lucas Bennett",status:"Viewing",nextAction:"Confirm financing notes"},
    {id:"LEAD-9007",name:"James Walker",email:"james@example.com",source:"Referral",budget:900000,propertyId:"PROP-ATL-184",agent:"Ava Mitchell",status:"Qualified",nextAction:"Send condo shortlist"},
    {id:"LEAD-8995",name:"Amelia Scott",email:"amelia@example.com",source:"Open house",budget:760000,propertyId:"PROP-CHI-077",agent:"Nora Patel",status:"Offer",nextAction:"Counter-offer review"},
  ],
  viewings:[
    {id:"VIEW-0821-01",leadId:"LEAD-9018",propertyId:"PROP-AUS-092",date:"Aug 21",time:"10:30",agent:"Lucas Bennett",status:"Confirmed"},
    {id:"VIEW-0821-02",leadId:"LEAD-9007",propertyId:"PROP-ATL-184",date:"Aug 21",time:"13:00",agent:"Ava Mitchell",status:"Confirmed"},
    {id:"VIEW-0821-03",leadId:"LEAD-8995",propertyId:"PROP-CHI-077",date:"Aug 21",time:"16:15",agent:"Nora Patel",status:"Follow-up"},
  ],
  applications:[
    {id:"APP-4412",applicant:"Olivia Harper",propertyId:"PROP-ATL-184",monthlyIncome:11800,screening:"Pass",documents:"Complete",status:"Approved"},
    {id:"APP-4408",applicant:"Mason Brooks",propertyId:"PROP-AUS-092",monthlyIncome:16200,screening:"Review",documents:"Complete",status:"Screening"},
    {id:"APP-4397",applicant:"Northlake Design Studio",propertyId:"PROP-MIA-211",monthlyIncome:54000,screening:"Pending",documents:"Missing",status:"Submitted"},
  ],
  deals:[
    {id:"DEAL-1842",propertyId:"PROP-AUS-092",client:"Charlotte Evans",agent:"Lucas Bennett",offer:1420000,stage:"Counter",closeDate:"Sep 04"},
    {id:"DEAL-1817",propertyId:"PROP-ATL-184",client:"James Walker",agent:"Ava Mitchell",offer:848000,stage:"Accepted",closeDate:"Aug 28"},
    {id:"DEAL-1789",propertyId:"PROP-MIA-211",client:"Evergreen Advisors",agent:"Mateo Ruiz",offer:2280000,stage:"Legal review",closeDate:"Sep 12"},
  ],
  leases:[
    {id:"LEASE-MER-12A",propertyId:"PROP-ATL-184",tenant:"Olivia Harper",unit:"12A",rent:3850,balance:3850,start:"2025-09-01",end:"2026-08-31",status:"Renewal due"},
    {id:"LEASE-BAY-3F",propertyId:"PROP-MIA-211",tenant:"Northlake Design Studio",unit:"3F",rent:18400,balance:0,start:"2024-11-01",end:"2027-10-31",status:"Active"},
    {id:"LEASE-MID-8W",propertyId:"PROP-CHI-077",tenant:"Vector Legal Partners",unit:"8W",rent:12600,balance:6300,start:"2025-02-01",end:"2027-01-31",status:"Overdue"},
  ],
  collections:[
    {id:"RCPT-1188",leaseId:"LEASE-BAY-3F",tenant:"Northlake Design Studio",property:"Bayline Office Suite · 3F",amount:18400,balance:0,due:"Aug 01",status:"Paid"},
    {id:"RCPT-1181",leaseId:"LEASE-MER-12A",tenant:"Olivia Harper",property:"The Meridian Residences · 12A",amount:3850,balance:3850,due:"Aug 05",status:"Overdue"},
    {id:"RCPT-1175",leaseId:"LEASE-MID-8W",tenant:"Vector Legal Partners",property:"West Loop Loft 9B · 8W",amount:12600,balance:6300,due:"Aug 10",status:"Partial"},
  ],
  maintenance:[
    {id:"WO-2401",propertyId:"PROP-CHI-077",issue:"HVAC inspection",priority:"Urgent",vendor:"Metro Mechanical",scheduled:"Today 14:00",cost:860,status:"Assigned"},
    {id:"WO-2396",propertyId:"PROP-ATL-184",issue:"Elevator service",priority:"High",vendor:"LiftPro Services",scheduled:"Aug 22",cost:1240,status:"Scheduled"},
    {id:"WO-2389",propertyId:"PROP-MIA-211",issue:"Water pressure",priority:"Normal",vendor:"AquaWorks",scheduled:"Today 17:00",cost:420,status:"In progress"},
  ],
  partners:[
    {id:"OWN-1001",name:"Helio Properties",type:"Owner",market:"Atlanta",contact:"owner@helio.example",status:"Active",metric:"$8.6M managed"},
    {id:"AGT-1007",name:"Ava Mitchell",type:"Agent",market:"Atlanta",contact:"ava@example.com",status:"Active",metric:"6 deals · $72K commission"},
    {id:"AGT-1011",name:"Lucas Bennett",type:"Agent",market:"Austin",contact:"lucas@example.com",status:"Active",metric:"5 deals · $61K commission"},
    {id:"VND-3012",name:"Metro Mechanical",type:"Vendor",market:"Chicago",contact:"dispatch@metro.example",status:"Active",metric:"94% SLA"},
  ],
  documents:[
    {id:"DOC-7001",title:"Meridian management agreement",propertyId:"PROP-ATL-184",type:"Management agreement",owner:"Legal",expires:"Dec 31, 2026",status:"Current"},
    {id:"DOC-7008",title:"Bayline insurance certificate",propertyId:"PROP-MIA-211",type:"Insurance",owner:"Risk",expires:"Sep 18, 2026",status:"Expiring"},
    {id:"DOC-7012",title:"West Loop inspection report",propertyId:"PROP-CHI-077",type:"Inspection",owner:"Operations",expires:"—",status:"Review"},
  ],
};

const transientImages=new Map();
const clone=(v)=>JSON.parse(JSON.stringify(v));
function route(){return document.body?.dataset?.currentRoute||"";}
function root(){return document.querySelector("#main-content");}
function readState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"),next=clone(defaults);
    if(raw&&typeof raw==="object")Object.keys(next).forEach((k)=>{if(Array.isArray(raw[k]))next[k]=raw[k];});
    next.properties=next.properties.map((p)=>transientImages.has(p.id)?{...p,image:transientImages.get(p.id),imageSource:"upload"}:p);
    return next;
  }catch{return clone(defaults);}
}
function persist(state){
  const out=clone(state);out.properties=out.properties.map((p)=>p.imageSource==="upload"&&String(p.image).startsWith("blob:")?{...p,image:"",imageSource:"none"}:p);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(out));
}
function mutate(fn){const s=readState();fn(s);persist(s);return s;}
function byText(scope,selector,text){return [...(scope?.querySelectorAll(selector)||[])].find((el)=>el.textContent.trim()===text)||null;}
function button(scope,text){return byText(scope,"button",text);}
function inputByLabel(scope,label){return [...(scope?.querySelectorAll("label")||[])].find((l)=>l.textContent.trim().startsWith(label))?.querySelector("input,select,textarea")||null;}
function dialogByTitle(scope,title){return byText(scope,"h2",title)?.closest("[data-dialog]")||null;}
function cardByTitle(scope,title){return byText(scope,"h3",title)?.closest(".rounded-lg.border.border-border.bg-card")||null;}
function cardContent(card){return card?.children?.[1]||null;}
function closeDialog(dialog){dialog?.querySelector("[data-dialog-close]")?.click();}
function money(v){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(v)||0);}
function variant(value){
  if(["Available","Active","Paid","Approved","Current","Completed","Closed","Pass","Lease ready"].includes(value))return"success";
  if(["Viewing","Qualified","Confirmed","Scheduled","Screening","Submitted","Legal review","Assigned","In progress","Partial","Renewal due","Expiring","Review"].includes(value))return"info";
  if(["Negotiation","Counter","Offer","Follow-up","Due","High","Nurture"].includes(value))return"warning";
  if(["Overdue","Urgent","Rejected","Missing","Cancelled","Inactive"].includes(value))return"destructive";
  return"neutral";
}
function styleBadge(el,value){if(!el)return;el.textContent=value;el.className=badgeClass(variant(value),el.classList.contains("absolute")?"absolute start-3 top-3":"");}
function metricCards(scope){const sec=[...(scope?.querySelectorAll("section")||[])].find((s)=>s.querySelectorAll(":scope > div").length===4&&s.className.includes("xl:grid-cols-4"));return sec?[...sec.children]:[];}
function setMetrics(scope,values){metricCards(scope).forEach((card,i)=>{const ps=card.querySelectorAll("p");if(ps[1]&&values[i]!==undefined)ps[1].textContent=String(values[i]);});}
function setOptions(select,items,valueOf,labelOf,selected){if(!select)return;const wanted=selected??select.value;select.innerHTML="";items.forEach((item)=>{const o=document.createElement("option");o.value=valueOf(item);o.textContent=labelOf(item);select.append(o);});if(items.length)select.value=items.some((x)=>valueOf(x)===wanted)?wanted:valueOf(items[0]);}
function templateRow(tbody){if(!tbody)return null;if(!tbody.__d2Template)tbody.__d2Template=tbody.rows[0]?.cloneNode(true)||null;return tbody.__d2Template;}
function renderRows(tbody,items,fill){const t=templateRow(tbody);if(!t)return;tbody.innerHTML="";items.forEach((item)=>{const row=t.cloneNode(true);fill(row,item);tbody.append(row);});}
function once(el,key,handler,event="click"){if(!el||el.dataset[key])return;el.dataset[key]="1";el.addEventListener(event,handler);}
function propertyName(state,id){return state.properties.find((x)=>x.id===id)?.name||id;}
function makeAdvance(handler,disabled=false,label="Advance"){const b=document.createElement("button");b.type="button";b.className=buttonClass("outline","sm");b.textContent=label;b.disabled=disabled;b.addEventListener("click",handler);return b;}
function resetBadge(cell,value){const badge=cell.querySelector("span")||document.createElement("span");styleBadge(badge,value);if(!badge.parentNode)cell.append(badge);}

function renderProperties(){
  const scope=root(),state=readState(),card=cardByTitle(scope,"Property command"),content=cardContent(card);if(!scope||!content)return;
  if(!content.__d2Template)content.__d2Template=content.firstElementChild?.cloneNode(true)||null;const t=content.__d2Template;if(!t)return;
  const search=scope.querySelector('input[placeholder="Search properties, owner or agent"]');const q=(search?.value||"").toLowerCase();
  const items=state.properties.filter((p)=>`${p.name} ${p.address} ${p.type} ${p.owner} ${p.agent}`.toLowerCase().includes(q));content.innerHTML="";
  items.forEach((p)=>{const node=t.cloneNode(true);node.dataset.propertyId=p.id;const hero=node.children[0],info=node.children[1];
    let img=hero.querySelector("img");const existingPlaceholder=hero.querySelector(".grid.place-items-center");
    if(p.image){if(!img){img=document.createElement("img");img.className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]";hero.prepend(img);}img.src=p.image;img.alt=p.name;existingPlaceholder?.remove();if(!hero.querySelector(".bg-gradient-to-t")){const g=document.createElement("div");g.className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent";img.after(g);}}
    else{img?.remove();hero.querySelector(".bg-gradient-to-t")?.remove();if(!existingPlaceholder){const ph=document.createElement("div");ph.className="absolute inset-0 grid place-items-center bg-card text-muted-foreground";ph.innerHTML='<span class="grid justify-items-center gap-2 text-center"><span class="text-xs font-medium">No property image</span></span>';hero.prepend(ph);}}
    const badge=hero.querySelector("span.inline-flex");styleBadge(badge,p.status);const title=hero.querySelector("p");if(title){title.textContent=p.name;title.classList.toggle("text-white",!!p.image);title.classList.toggle("text-foreground",!p.image);}
    const direct=[...info.children];if(direct[0])direct[0].textContent=`${p.address} · ${p.type}`;const row=direct[1]?.querySelectorAll("p,span");if(row?.[0])row[0].textContent=money(p.price);if(row?.[1])row[1].textContent=p.area;const ownerPs=direct[2]?.querySelectorAll("p");if(ownerPs?.[0])ownerPs[0].textContent=p.owner;if(ownerPs?.[1])ownerPs[1].textContent=`Agent · ${p.agent}`;content.append(node);
  });
  const available=state.properties.filter((p)=>p.status==="Available").length,markets=new Set(state.properties.map((p)=>p.market)).size,total=state.properties.reduce((a,p)=>a+p.price,0);setMetrics(scope,[state.properties.length,available,markets,money(total)]);
}

function initProperties(){
  const scope=root();if(!scope)return;let pendingImage="";const dialog=dialogByTitle(scope,"Add property"),create=button(dialog,"Create property"),search=scope.querySelector('input[placeholder="Search properties, owner or agent"]'),file=dialog?.querySelector('input[type="file"]');
  once(search,"d2RealSearch",renderProperties,"input");
  once(file,"d2RealImage",()=>{const f=file.files?.[0];if(!f||!f.type.startsWith("image/"))return;if(pendingImage.startsWith("blob:"))URL.revokeObjectURL(pendingImage);pendingImage=URL.createObjectURL(f);const box=file.closest(".flex.flex-wrap.items-center.gap-3.rounded-lg")?.firstElementChild;if(box){box.innerHTML="";const img=document.createElement("img");img.src=pendingImage;img.alt="Property preview";img.className="h-full w-full rounded-md object-cover";box.append(img);}let remove=byText(dialog,"button","Remove image");if(!remove){remove=document.createElement("button");remove.type="button";remove.className=buttonClass("ghost","default");remove.textContent="Remove image";file.closest(".flex.min-w-0")?.append(remove);remove.addEventListener("click",()=>{if(pendingImage.startsWith("blob:"))URL.revokeObjectURL(pendingImage);pendingImage="";const box=file.closest(".flex.flex-wrap.items-center.gap-3.rounded-lg")?.firstElementChild;if(box)box.innerHTML='<span class="text-xs font-medium text-muted-foreground">No property image</span>';remove.remove();file.value="";});}},"change");
  once(create,"d2RealCreate",()=>{const name=inputByLabel(dialog,"Property name")?.value.trim(),address=inputByLabel(dialog,"Address")?.value.trim();if(!name||!address)return;const market=inputByLabel(dialog,"Market")?.value||"Atlanta",type=inputByLabel(dialog,"Property type")?.value||"Residential",price=Number(inputByLabel(dialog,"List / asset value")?.value)||0,owner=inputByLabel(dialog,"Owner")?.value.trim()||"Unassigned owner",agent=inputByLabel(dialog,"Assigned agent")?.value||"Ava Mitchell";let createdId="";mutate((s)=>{createdId=`PROP-${market.slice(0,3).toUpperCase()}-${String(300+s.properties.length+1)}`;s.properties.unshift({id:createdId,name,address,market,type,price,area:"TBD",owner,agent,status:"Available",occupancy:0,image:pendingImage,imageSource:pendingImage?"upload":"none"});});if(pendingImage)transientImages.set(createdId,pendingImage);inputByLabel(dialog,"Property name").value="";inputByLabel(dialog,"Address").value="";inputByLabel(dialog,"Owner").value="";pendingImage="";closeDialog(dialog);renderProperties();});
  if(location.hash==="#new-property")queueMicrotask(()=>button(scope,"Add property")?.click());renderProperties();
}

function renderLeads(){
  const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!scope||!tbody)return;const q=(scope.querySelector('input[placeholder="Search leads"]')?.value||"").toLowerCase();const items=state.leads.filter((l)=>`${l.name} ${l.email} ${l.source} ${l.agent}`.toLowerCase().includes(q));
  renderRows(tbody,items,(row,l)=>{row.dataset.leadId=l.id;const c=row.cells,p0=c[0].querySelectorAll("p");p0[0].textContent=l.name;p0[1].textContent=`${l.id} · ${l.source}`;c[1].textContent=propertyName(state,l.propertyId);c[2].textContent=l.agent;resetBadge(c[3],l.status);c[4].innerHTML="";c[4].append(makeAdvance(()=>{mutate((s)=>{const x=s.leads.find((z)=>z.id===l.id);if(x)x.status=x.status==="New"?"Qualified":x.status==="Qualified"?"Viewing":x.status==="Viewing"?"Offer":x.status;});renderLeads();}));});
  const qualified=state.leads.filter((l)=>["Qualified","Viewing","Offer"].includes(l.status)).length;setMetrics(scope,[state.leads.length,qualified,state.viewings.length,"36%"]);
  const viewingCard=cardByTitle(scope,"Viewing calendar"),content=cardContent(viewingCard);if(content){if(!content.__d2Template)content.__d2Template=content.firstElementChild?.cloneNode(true)||null;const t=content.__d2Template;content.innerHTML="";state.viewings.forEach((v)=>{const n=t.cloneNode(true),lead=state.leads.find((l)=>l.id===v.leadId),p=state.properties.find((x)=>x.id===v.propertyId),ps=n.querySelectorAll("p"),badge=n.querySelector("span.inline-flex");ps[0].textContent=`${v.date} · ${v.time}`;ps[1].textContent=`${p?.name||""} · ${lead?.name||""}`;ps[2].textContent=`Agent · ${v.agent}`;styleBadge(badge,v.status);content.append(n);});}
  const leadDialog=dialogByTitle(scope,"Add real-estate lead"),viewDialog=dialogByTitle(scope,"Schedule viewing");setOptions(inputByLabel(leadDialog,"Property"),state.properties,(x)=>x.id,(x)=>x.name);setOptions(inputByLabel(viewDialog,"Lead"),state.leads,(x)=>x.id,(x)=>x.name);setOptions(inputByLabel(viewDialog,"Property"),state.properties,(x)=>x.id,(x)=>x.name);
}
function initLeads(){const scope=root(),leadDialog=dialogByTitle(scope,"Add real-estate lead"),viewDialog=dialogByTitle(scope,"Schedule viewing");once(scope.querySelector('input[placeholder="Search leads"]'),"d2RealLeadSearch",renderLeads,"input");once(button(leadDialog,"Create lead"),"d2RealLeadCreate",()=>{const name=inputByLabel(leadDialog,"Name")?.value.trim();if(!name)return;mutate((s)=>s.leads.unshift({id:`LEAD-${String(9100+s.leads.length+1)}`,name,email:inputByLabel(leadDialog,"Email")?.value||"—",source:"Website",budget:Number(inputByLabel(leadDialog,"Budget")?.value)||0,propertyId:inputByLabel(leadDialog,"Property")?.value||s.properties[0]?.id,agent:inputByLabel(leadDialog,"Agent")?.value||"Ava Mitchell",status:"New",nextAction:"Initial qualification"}));inputByLabel(leadDialog,"Name").value="";inputByLabel(leadDialog,"Email").value="";closeDialog(leadDialog);renderLeads();});once(button(viewDialog,"Schedule viewing"),"d2RealViewCreate",()=>{const leadId=inputByLabel(viewDialog,"Lead")?.value,propertyId=inputByLabel(viewDialog,"Property")?.value;mutate((s)=>{const l=s.leads.find((x)=>x.id===leadId),p=s.properties.find((x)=>x.id===propertyId);if(!l||!p)return;s.viewings.unshift({id:`VIEW-${Date.now().toString().slice(-7)}`,leadId:l.id,propertyId:p.id,date:inputByLabel(viewDialog,"Date")?.value||"2026-08-22",time:inputByLabel(viewDialog,"Time")?.value||"10:30",agent:l.agent,status:"Scheduled"});l.status="Viewing";});closeDialog(viewDialog);renderLeads();});renderLeads();}

function renderApplicationTable(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.applications,(row,a)=>{const c=row.cells,p=c[0].querySelectorAll("p");p[0].textContent=a.applicant;p[1].textContent=a.id;c[1].textContent=propertyName(state,a.propertyId);c[2].textContent=money(a.monthlyIncome);resetBadge(c[3],a.screening);resetBadge(c[4],a.documents);resetBadge(c[5],a.status);c[6].innerHTML="";c[6].append(makeAdvance(()=>{mutate((s)=>{const x=s.applications.find((z)=>z.id===a.id);if(!x||x.status==="Rejected")return;const order=["Submitted","Screening","Approved","Lease ready"],i=order.indexOf(x.status);x.status=order[Math.min(i+1,order.length-1)];});renderApplicationTable();},["Lease ready","Rejected"].includes(a.status)));});setMetrics(scope,[state.applications.length,state.applications.filter((x)=>x.status==="Screening").length,state.applications.filter((x)=>["Approved","Lease ready"].includes(x.status)).length,"Controlled"]);setOptions(inputByLabel(dialogByTitle(scope,"New rental application"),"Property"),state.properties,(x)=>x.id,(x)=>x.name);}
function initApplications(){const scope=root(),dialog=dialogByTitle(scope,"New rental application");once(button(dialog,"Submit application"),"d2RealAppCreate",()=>{const applicant=inputByLabel(dialog,"Applicant")?.value.trim();if(!applicant)return;mutate((s)=>s.applications.unshift({id:`APP-${String(4500+s.applications.length+1)}`,applicant,propertyId:inputByLabel(dialog,"Property")?.value||s.properties[0]?.id,monthlyIncome:Number(inputByLabel(dialog,"Monthly income")?.value)||0,screening:"Pending",documents:"Missing",status:"Submitted"}));inputByLabel(dialog,"Applicant").value="";closeDialog(dialog);renderApplicationTable();});renderApplicationTable();}

function renderDeals(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.deals,(row,d)=>{const c=row.cells;c[0].textContent=d.id;c[1].textContent=propertyName(state,d.propertyId);const ps=c[2].querySelectorAll("p");ps[0].textContent=d.client;ps[1].textContent=d.agent;c[3].textContent=money(d.offer);c[4].textContent=d.closeDate;resetBadge(c[5],d.stage);c[6].innerHTML="";c[6].append(makeAdvance(()=>{mutate((s)=>{const x=s.deals.find((z)=>z.id===d.id);if(!x)return;const order=["Offer","Counter","Accepted","Legal review","Closing","Closed"],i=order.indexOf(x.stage);x.stage=order[Math.min(i+1,order.length-1)];});renderDeals();},d.stage==="Closed"));});const active=state.deals.filter((x)=>x.stage!=="Closed");setMetrics(scope,[active.length,money(active.reduce((a,x)=>a+x.offer,0)),state.deals.filter((x)=>["Accepted","Legal review","Closing"].includes(x.stage)).length,"Live"]);setOptions(inputByLabel(dialogByTitle(scope,"Create deal / offer"),"Property"),state.properties,(x)=>x.id,(x)=>x.name);}
function initDeals(){const scope=root(),dialog=dialogByTitle(scope,"Create deal / offer");once(button(dialog,"Create deal"),"d2RealDealCreate",()=>{const client=inputByLabel(dialog,"Client")?.value.trim();if(!client)return;mutate((s)=>s.deals.unshift({id:`DEAL-${String(1900+s.deals.length+1)}`,propertyId:inputByLabel(dialog,"Property")?.value||s.properties[0]?.id,client,agent:inputByLabel(dialog,"Agent")?.value||"Ava Mitchell",offer:Number(inputByLabel(dialog,"Offer")?.value)||0,stage:"Offer",closeDate:inputByLabel(dialog,"Target close")?.value||"2026-09-15"}));inputByLabel(dialog,"Client").value="";closeDialog(dialog);renderDeals();});renderDeals();}

function renderLeases(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.leases,(row,l)=>{const c=row.cells,p=c[0].querySelectorAll("p");p[0].textContent=l.tenant;p[1].textContent=l.id;c[1].textContent=`${propertyName(state,l.propertyId)} · ${l.unit}`;c[2].textContent=money(l.rent);c[3].textContent=money(l.balance);c[4].textContent=`${l.start} → ${l.end}`;resetBadge(c[5],l.status);});setMetrics(scope,[state.leases.length,money(state.leases.reduce((a,x)=>a+x.rent,0)),state.leases.filter((x)=>x.status==="Renewal due").length,state.leases.filter((x)=>x.status==="Overdue").length]);setOptions(inputByLabel(dialogByTitle(scope,"Create lease record"),"Property"),state.properties,(x)=>x.id,(x)=>x.name);}
function initLeases(){const scope=root(),dialog=dialogByTitle(scope,"Create lease record");once(button(dialog,"Create lease"),"d2RealLeaseCreate",()=>{const tenant=inputByLabel(dialog,"Tenant")?.value.trim();if(!tenant)return;mutate((s)=>{const propertyId=inputByLabel(dialog,"Property")?.value||s.properties[0]?.id,unit=inputByLabel(dialog,"Unit")?.value||"1A",rent=Number(inputByLabel(dialog,"Monthly rent")?.value)||0,id=`LEASE-${Date.now().toString().slice(-7)}`;s.leases.unshift({id,propertyId,tenant,unit,rent,balance:rent,start:inputByLabel(dialog,"Start")?.value||"2026-09-01",end:inputByLabel(dialog,"End")?.value||"2027-08-31",status:"Active"});s.collections.unshift({id:`RCPT-${Date.now().toString().slice(-6)}`,leaseId:id,tenant,property:`${propertyName(s,propertyId)} · ${unit}`,amount:rent,balance:rent,due:"Next cycle",status:"Due"});});inputByLabel(dialog,"Tenant").value="";closeDialog(dialog);renderLeases();});renderLeases();}

function renderRent(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.collections,(row,x)=>{const c=row.cells,p=c[0].querySelectorAll("p");p[0].textContent=x.tenant;p[1].textContent=x.leaseId;c[1].textContent=x.property;c[2].textContent=money(x.amount);c[3].textContent=money(x.balance);c[4].textContent=x.due;resetBadge(c[5],x.status);c[6].innerHTML="";c[6].append(makeAdvance(()=>{mutate((s)=>{const item=s.collections.find((z)=>z.id===x.id);if(item){item.balance=0;item.status="Paid";}const lease=s.leases.find((l)=>l.id===x.leaseId);if(lease){lease.balance=0;lease.status="Active";}});renderRent();},x.status==="Paid","Record sample payment"));});const billed=state.collections.reduce((a,x)=>a+x.amount,0),out=state.collections.reduce((a,x)=>a+x.balance,0);setMetrics(scope,[money(billed),money(billed-out),money(out),state.collections.filter((x)=>x.status==="Overdue").length]);}
function initRent(){renderRent();}

function renderMaintenance(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.maintenance,(row,x)=>{const c=row.cells,p=c[0].querySelectorAll("p");p[0].textContent=x.issue;p[1].textContent=x.id;c[1].textContent=propertyName(state,x.propertyId);c[2].textContent=x.vendor;resetBadge(c[3],x.priority);c[4].textContent=x.scheduled;c[5].textContent=money(x.cost);resetBadge(c[6],x.status);c[7].innerHTML="";c[7].append(makeAdvance(()=>{mutate((s)=>{const item=s.maintenance.find((z)=>z.id===x.id);if(!item)return;const order=["Open","Assigned","Scheduled","In progress","Completed"],i=order.indexOf(item.status);item.status=order[Math.min(i+1,order.length-1)];});renderMaintenance();},x.status==="Completed"));});const open=state.maintenance.filter((x)=>x.status!=="Completed");setMetrics(scope,[open.length,open.filter((x)=>x.priority==="Urgent").length,money(open.reduce((a,x)=>a+x.cost,0)),"Tracked"]);const dialog=dialogByTitle(scope,"Create maintenance work order");setOptions(inputByLabel(dialog,"Property"),state.properties,(x)=>x.id,(x)=>x.name);}
function initMaintenance(){const scope=root(),dialog=dialogByTitle(scope,"Create maintenance work order");once(button(dialog,"Create work order"),"d2RealMaintCreate",()=>{const issue=inputByLabel(dialog,"Issue")?.value.trim();if(!issue)return;mutate((s)=>s.maintenance.unshift({id:`WO-${String(2500+s.maintenance.length+1)}`,propertyId:inputByLabel(dialog,"Property")?.value||s.properties[0]?.id,issue,priority:inputByLabel(dialog,"Priority")?.value||"Normal",vendor:inputByLabel(dialog,"Vendor")?.value||"Unassigned",scheduled:inputByLabel(dialog,"Schedule")?.value||"Tomorrow",cost:Number(inputByLabel(dialog,"Expected cost")?.value)||0,status:"Open"}));inputByLabel(dialog,"Issue").value="";closeDialog(dialog);renderMaintenance();});renderMaintenance();}

function renderPartners(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.partners,(row,x)=>{const c=row.cells,p=c[0].querySelectorAll("p");p[0].textContent=x.name;p[1].textContent=x.id;c[1].textContent=x.type;c[2].textContent=x.market;c[3].textContent=x.contact;c[4].textContent=x.metric;resetBadge(c[5],x.status);});setMetrics(scope,[state.partners.filter((x)=>x.type==="Owner").length,state.partners.filter((x)=>x.type==="Agent").length,state.partners.filter((x)=>x.type==="Vendor").length,"Governed"]);}
function initPartners(){const scope=root(),dialog=dialogByTitle(scope,"Add owner, agent or vendor");once(button(dialog,"Add partner"),"d2RealPartnerCreate",()=>{const name=inputByLabel(dialog,"Name")?.value.trim();if(!name)return;mutate((s)=>{const type=inputByLabel(dialog,"Type")?.value||"Owner";s.partners.unshift({id:`${type==="Owner"?"OWN":type==="Agent"?"AGT":"VND"}-${String(4000+s.partners.length+1)}`,name,type,market:inputByLabel(dialog,"Market")?.value||"Atlanta",contact:inputByLabel(dialog,"Contact")?.value||"—",status:"Active",metric:type==="Agent"?"New agent":type==="Owner"?"New owner":"New vendor"});});inputByLabel(dialog,"Name").value="";inputByLabel(dialog,"Contact").value="";closeDialog(dialog);renderPartners();});renderPartners();}

function renderDocuments(){const scope=root(),state=readState(),tbody=scope?.querySelector("table tbody");if(!tbody)return;renderRows(tbody,state.documents,(row,x)=>{const c=row.cells,p=c[0].querySelectorAll("p");p[0].textContent=x.title;p[1].textContent=x.id;c[1].textContent=propertyName(state,x.propertyId);c[2].textContent=x.type;c[3].textContent=x.owner;c[4].textContent=x.expires;resetBadge(c[5],x.status);});setMetrics(scope,[state.documents.length,state.documents.filter((x)=>x.status==="Current").length,state.documents.filter((x)=>["Review","Expiring","Missing"].includes(x.status)).length,"Connected"]);setOptions(inputByLabel(dialogByTitle(scope,"Add property document record"),"Property"),state.properties,(x)=>x.id,(x)=>x.name);}
function initDocuments(){const scope=root(),dialog=dialogByTitle(scope,"Add property document record");once(button(dialog,"Add record"),"d2RealDocumentCreate",()=>{const title=inputByLabel(dialog,"Title")?.value.trim();if(!title)return;mutate((s)=>s.documents.unshift({id:`DOC-${String(7200+s.documents.length+1)}`,title,propertyId:inputByLabel(dialog,"Property")?.value||s.properties[0]?.id,type:inputByLabel(dialog,"Document type")?.value||"Lease / agreement",owner:inputByLabel(dialog,"Operational owner")?.value||"Operations",expires:inputByLabel(dialog,"Expiry / review date")?.value||"—",status:"Current"}));inputByLabel(dialog,"Title").value="";closeDialog(dialog);renderDocuments();});renderDocuments();}

export function initD2RealEstateInteractions(){
  if(!routes.has(route()))return;
  const init={
    "/real-estate/properties-listings":initProperties,
    "/real-estate/leads-viewings":initLeads,
    "/real-estate/applications-screening":initApplications,
    "/real-estate/deals":initDeals,
    "/real-estate/leases-tenants":initLeases,
    "/real-estate/rent-collections":initRent,
    "/real-estate/maintenance-inspections":initMaintenance,
    "/real-estate/partners":initPartners,
    "/real-estate/documents-compliance":initDocuments,
  }[route()];
  init?.();document.documentElement.dataset.d2RealEstateReady="true";
}
