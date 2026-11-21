import { badgeClass, buttonClass } from "./components/component-styles.js";
import { routeToHref } from "./ui.js";

const STORAGE_KEY="vexlora:hospital-operations:v1";
const routes=new Set([
  "/hospital/admissions-beds",
  "/hospital/billing-insurance",
  "/hospital/doctors-departments",
  "/hospital/laboratory",
  "/hospital/patients-appointments",
  "/hospital/pharmacy-supplies",
  "/hospital/records-documents",
  "/hospital/theatre-procedures",
]);

const defaults={
  patients:[
    {id:"PT-204881",name:"Olivia Bennett",age:52,phone:"+1 615 555 0134",payer:"Aetna",status:"Outpatient",department:"Cardiology",room:"Clinic C-12"},
    {id:"PT-198472",name:"Ethan Brooks",age:41,phone:"+1 615 555 0198",payer:"Blue Cross",status:"Observation",department:"Orthopedics",room:"OBS-08"},
    {id:"PT-210356",name:"Sophia Ramirez",age:9,phone:"+1 615 555 0109",payer:"United Health",status:"Outpatient",department:"Pediatrics",room:"Clinic P-04"},
    {id:"PT-192804",name:"Liam Carter",age:67,phone:"+1 615 555 0173",payer:"Medicare",status:"Inpatient",department:"Emergency",room:"ICU-04"},
  ],
  appointments:[
    {id:"APT-1850",patientId:"PT-204881",patient:"Olivia Bennett",doctor:"Dr. Maya Chen",department:"Cardiology",time:"18:50",type:"Follow-up",status:"Checked in"},
    {id:"APT-1900",patientId:"PT-198472",patient:"Ethan Brooks",doctor:"Dr. Daniel Ortiz",department:"Orthopedics",time:"19:00",type:"Consultation",status:"Waiting"},
    {id:"APT-1910",patientId:"PT-210356",patient:"Sophia Ramirez",doctor:"Dr. Aisha Patel",department:"Pediatrics",time:"19:10",type:"Consultation",status:"Confirmed"},
  ],
  doctors:[
    {id:"DR-1001",name:"Dr. Maya Chen",specialty:"Cardiology",department:"Cardiology",shift:"08:00–18:00",room:"C-12",status:"In clinic",appointments:12},
    {id:"DR-1002",name:"Dr. Daniel Ortiz",specialty:"Orthopedics",department:"Orthopedics",shift:"10:00–20:00",room:"O-07",status:"Available",appointments:9},
    {id:"DR-1003",name:"Dr. Aisha Patel",specialty:"Pediatrics",department:"Pediatrics",shift:"09:00–17:00",room:"P-04",status:"In clinic",appointments:14},
    {id:"DR-1004",name:"Dr. Noah Grant",specialty:"Emergency Medicine",department:"Emergency",shift:"18:00–06:00",room:"ER",status:"On call",appointments:7},
  ],
  departments:[
    {id:"DEP-ER",name:"Emergency",lead:"Dr. Noah Grant",doctors:12,patients:54,occupancy:86,status:"Busy"},
    {id:"DEP-CAR",name:"Cardiology",lead:"Dr. Maya Chen",doctors:8,patients:38,occupancy:74,status:"Stable"},
    {id:"DEP-PED",name:"Pediatrics",lead:"Dr. Aisha Patel",doctors:7,patients:42,occupancy:78,status:"Busy"},
    {id:"DEP-ORT",name:"Orthopedics",lead:"Dr. Daniel Ortiz",doctors:6,patients:29,occupancy:69,status:"Stable"},
  ],
  beds:[
    {id:"BED-A-101",unit:"Medical Ward A",room:"A-101",type:"General",status:"Available",patientId:""},
    {id:"BED-A-102",unit:"Medical Ward A",room:"A-102",type:"General",status:"Occupied",patientId:"PT-192804"},
    {id:"BED-B-204",unit:"Surgical Ward B",room:"B-204",type:"Surgical",status:"Cleaning",patientId:""},
    {id:"BED-ICU-04",unit:"ICU",room:"ICU-04",type:"Critical care",status:"Occupied",patientId:"PT-192804"},
    {id:"BED-ICU-05",unit:"ICU",room:"ICU-05",type:"Critical care",status:"Reserved",patientId:""},
  ],
  admissions:[
    {id:"ADM-260821-01",patientId:"PT-192804",patient:"Liam Carter",unit:"ICU",bed:"ICU-04",admittedAt:"Aug 21 · 16:28",status:"Admitted"},
    {id:"ADM-260821-02",patientId:"PT-198472",patient:"Ethan Brooks",unit:"Observation",bed:"OBS-08",admittedAt:"Aug 21 · 17:42",status:"Discharge ready"},
  ],
  labs:[
    {id:"LAB-7812",patient:"Ethan Brooks",test:"CBC + metabolic panel",priority:"Routine",department:"Laboratory",requestedAt:"18:06",eta:"24 min",status:"Processing"},
    {id:"LAB-7801",patient:"Liam Carter",test:"Troponin I",priority:"STAT",department:"Laboratory",requestedAt:"18:12",eta:"9 min",status:"Processing"},
    {id:"LAB-7790",patient:"Olivia Bennett",test:"Lipid panel",priority:"Routine",department:"Laboratory",requestedAt:"17:24",eta:"Ready",status:"Ready"},
  ],
  medicines:[
    {id:"RX-GLA",name:"Insulin Glargine",category:"Diabetes",onHand:96,reorderAt:120,unit:"pens",supplier:"MedSupply One",status:"Reorder"},
    {id:"RX-AMX",name:"Amoxicillin 500 mg",category:"Antibiotic",onHand:420,reorderAt:180,unit:"capsules",supplier:"NorthMed",status:"Healthy"},
    {id:"RX-SAL",name:"Salbutamol inhaler",category:"Respiratory",onHand:84,reorderAt:72,unit:"inhalers",supplier:"CareSource",status:"Watch"},
  ],
  procedures:[
    {id:"OR-260821-07",patient:"Mia Thompson",theatre:"OR-2",team:"Dr. Reyes · Team B",time:"20:00",duration:"90 min",status:"Ready"},
    {id:"OR-260821-08",patient:"Noah Wilson",theatre:"OR-4",team:"Dr. Kim · Team D",time:"21:20",duration:"120 min",status:"Scheduled"},
    {id:"OR-260821-06",patient:"Ava Brown",theatre:"OR-1",team:"Dr. Malik · Team A",time:"18:30",duration:"75 min",status:"Recovery"},
  ],
  claims:[
    {id:"CLM-88214",patient:"Olivia Bennett",payer:"Aetna",encounter:"Cardiology visit",amount:2840,patientBalance:220,status:"Submitted"},
    {id:"CLM-88196",patient:"Ethan Brooks",payer:"Blue Cross",encounter:"Orthopedic imaging",amount:4120,patientBalance:480,status:"Review"},
    {id:"CLM-88172",patient:"Sophia Ramirez",payer:"United Health",encounter:"Pediatrics visit",amount:1240,patientBalance:80,status:"Approved"},
  ],
  documents:[
    {id:"DOC-204881-01",patient:"Olivia Bennett",type:"Registration & consent",owner:"Front Desk",updatedAt:"Aug 21 · 17:55",status:"Current"},
    {id:"DOC-198472-02",patient:"Ethan Brooks",type:"Insurance authorization",owner:"Revenue Cycle",updatedAt:"Aug 21 · 17:31",status:"Review"},
    {id:"DOC-192804-03",patient:"Liam Carter",type:"Admission documents",owner:"Admissions",updatedAt:"Aug 21 · 16:42",status:"Current"},
  ],
};

const clone=(value)=>JSON.parse(JSON.stringify(value));
function currentRoute(){return document.body?.dataset?.currentRoute||"";}
function main(){return document.querySelector("#main-content");}
function readState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(!raw||typeof raw!=="object")return clone(defaults);
    const next=clone(defaults);
    Object.keys(next).forEach((key)=>{if(Array.isArray(raw[key]))next[key]=raw[key];});
    return next;
  }catch{return clone(defaults);}
}
function writeState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function mutate(fn){const state=readState();fn(state);writeState(state);return state;}
function byText(root,selector,text){return [...root.querySelectorAll(selector)].find((el)=>el.textContent.trim()===text)||null;}
function button(root,text){return byText(root,"button",text);}
function cardByTitle(root,title){const h=byText(root,"h3",title);return h?.parentElement?.parentElement||null;}
function cardContent(card){return card?.children?.[1]||null;}
function closeDialog(node){node?.closest("[data-dialog]")?.querySelector("[data-dialog-close]")?.click();}
function makeButton(text,variant="outline") {const b=document.createElement("button");b.type="button";b.className=buttonClass(variant,"sm");b.textContent=text;return b;}
function variantFor(value){
  if(["Available","Stable","Healthy","Approved","Paid","Released","Completed","Current","Checked in","Ready"].includes(value))return"success";
  if(["Waiting","Busy","Watch","Review","Reserved","Cleaning","Urgent","Discharge ready","Transfer pending"].includes(value))return"warning";
  if(["At risk","Denied","Missing","No show","Cancelled","STAT"].includes(value))return"destructive";
  if(["Processing","Submitted","Scheduled","In clinic","On call","Observation","Inpatient"].includes(value))return"info";
  return"neutral";
}
function styleBadge(el,value){if(!el)return;el.textContent=value;el.className=badgeClass(variantFor(value));}
function metricCards(root){const sec=[...root.querySelectorAll("section")].find((s)=>s.classList.contains("xl:grid-cols-4")&&s.querySelectorAll(":scope > div").length>=4);return sec?[...sec.children]:[];}
function setMetrics(root,values){metricCards(root).forEach((card,i)=>{const ps=card.querySelectorAll("p");if(ps[1]&&values[i]!==undefined)ps[1].textContent=String(values[i]);});}
function setNativeOptions(select,items,valueOf,labelOf,selected){
  if(!select)return;const previous=selected??select.value;select.innerHTML="";
  items.forEach((item)=>{const o=document.createElement("option");o.value=valueOf(item);o.textContent=labelOf(item);select.append(o);});
  const exists=items.some((item)=>valueOf(item)===previous);if(items.length)select.value=exists?previous:valueOf(items[0]);
}
function tableTemplate(tbody){return tbody?.rows?.[0]?.cloneNode(true)||null;}
function replaceTbody(tbody,items,fill){if(!tbody)return;const template=tableTemplate(tbody);if(!template)return;tbody.innerHTML="";items.forEach((item)=>{const row=template.cloneNode(true);fill(row,item);tbody.append(row);});}
function numberMoney(value){return `$${Number(value||0).toLocaleString()}`;}
function inputByLabel(scope,label){const target=[...scope.querySelectorAll("label")].find((l)=>l.textContent.trim().startsWith(label));return target?.querySelector("input,select,textarea")||null;}
function ensureNoDuplicateListener(el,key,fn,event="click"){if(!el||el.dataset[key])return;el.dataset[key]="true";el.addEventListener(event,fn);}

function initAdmissions(){
  const root=main();if(!root)return;const dialog=byText(root,"h2","Admit patient")?.closest("[data-dialog]");const patientSelect=dialog?.querySelectorAll("select")[0],bedSelect=dialog?.querySelectorAll("select")[1];
  const command=cardContent(cardByTitle(root,"Admission command")),bedBoard=cardContent(cardByTitle(root,"Bed board"));
  const commandTemplate=command?.firstElementChild?.cloneNode(true),bedTemplate=bedBoard?.firstElementChild?.cloneNode(true);
  function render(){const state=readState();const availableBeds=state.beds.filter((x)=>x.status==="Available");setNativeOptions(patientSelect,state.patients,(x)=>x.id,(x)=>`${x.name} · ${x.id}`);setNativeOptions(bedSelect,availableBeds,(x)=>x.room,(x)=>`${x.unit} · ${x.room} · ${x.type}`);
    setMetrics(root,[state.admissions.filter((x)=>x.status!=="Discharged").length,availableBeds.length,state.beds.filter((x)=>x.status==="Occupied").length,state.beds.filter((x)=>x.status==="Cleaning").length]);
    if(command&&commandTemplate){command.innerHTML="";state.admissions.forEach((item)=>{const row=commandTemplate.cloneNode(true),ps=row.querySelectorAll("p"),badge=row.querySelector("span.inline-flex"),actions=row.querySelector(".mt-3.flex");if(ps[0])ps[0].textContent=item.patient;if(ps[1])ps[1].textContent=`${item.id} · ${item.unit} · ${item.bed} · ${item.admittedAt}`;styleBadge(badge,item.status);if(actions){actions.innerHTML="";let next="",label="",variant="outline";if(item.status==="Admitted"){next="Transfer pending";label="Transfer request";}else if(item.status==="Transfer pending"){next="Discharge ready";label="Mark discharge ready";}else if(item.status==="Discharge ready"){next="Discharged";label="Discharge";variant="default";}if(label){const b=makeButton(label,variant);b.addEventListener("click",()=>{mutate((s)=>{const admission=s.admissions.find((x)=>x.id===item.id);s.admissions=s.admissions.map((x)=>x.id===item.id?{...x,status:next}:x);if(admission&&next==="Discharged"){s.patients=s.patients.map((x)=>x.id===admission.patientId?{...x,status:"Discharged",room:"—"}:x);s.beds=s.beds.map((x)=>x.room===admission.bed?{...x,status:"Cleaning",patientId:""}:x);}});render();});actions.append(b);}}command.append(row);});}
    if(bedBoard&&bedTemplate){bedBoard.innerHTML="";state.beds.forEach((item)=>{const row=bedTemplate.cloneNode(true),ps=row.querySelectorAll("p"),badge=row.querySelector("span.inline-flex");if(ps[0])ps[0].textContent=`${item.room} · ${item.unit}`;if(ps[1])ps[1].textContent=`${item.type}${item.patientId?` · ${item.patientId}`:""}`;styleBadge(badge,item.status);bedBoard.append(row);});}
    root.dataset.d2HospitalState="ready";
  }
  button(dialog||root,"Confirm admission")?.addEventListener("click",(event)=>{const state=readState(),patient=state.patients.find((x)=>x.id===patientSelect?.value),target=state.beds.find((x)=>x.room===bedSelect?.value&&x.status==="Available");if(!patient||!target)return;mutate((s)=>{const id=`ADM-${Date.now().toString().slice(-8)}`;s.admissions=[{id,patientId:patient.id,patient:patient.name,unit:target.unit,bed:target.room,admittedAt:"Just now",status:"Admitted"},...s.admissions];s.patients=s.patients.map((x)=>x.id===patient.id?{...x,status:"Inpatient",room:target.room}:x);s.beds=s.beds.map((x)=>x.room===target.room?{...x,status:"Occupied",patientId:patient.id}:x);});closeDialog(event.currentTarget);render();});
  render();
}

function initBilling(){
  const root=main();if(!root)return;const table=root.querySelector("table"),tbody=table?.tBodies?.[0],template=tableTemplate(tbody);const dialog=byText(root,"h2","New billing claim")?.closest("[data-dialog]");const patient=inputByLabel(dialog,"Patient"),payer=inputByLabel(dialog,"Payer"),encounter=inputByLabel(dialog,"Encounter / billing context"),amount=inputByLabel(dialog,"Claim amount"),balance=inputByLabel(dialog,"Patient balance");
  function render(){const state=readState();setNativeOptions(patient,state.patients,(x)=>x.name,(x)=>x.name);const total=state.claims.reduce((s,x)=>s+x.amount,0),out=state.claims.filter((x)=>!["Paid","Approved"].includes(x.status)).reduce((s,x)=>s+x.amount,0);setMetrics(root,[state.claims.length,numberMoney(total),numberMoney(out),"78%"]);if(tbody&&template){tbody.innerHTML="";state.claims.forEach((item)=>{const row=template.cloneNode(true),c=row.cells;c[0].textContent=item.id;c[1].textContent=item.patient;c[2].textContent=item.payer;c[3].textContent=item.encounter;c[4].textContent=numberMoney(item.amount);c[5].textContent=numberMoney(item.patientBalance);styleBadge(c[6].querySelector("span"),item.status);c[7].innerHTML="";if(item.status==="Draft"){const b=makeButton("Submit claim");b.addEventListener("click",()=>{mutate((s)=>{s.claims=s.claims.map((x)=>x.id===item.id?{...x,status:"Submitted"}:x);});render();});c[7].append(b);}tbody.append(row);});}root.dataset.d2HospitalState="ready";}
  patient?.addEventListener("change",()=>{const match=readState().patients.find((x)=>x.name===patient.value);if(match&&payer)payer.value=match.payer;});
  button(dialog||root,"Create claim")?.addEventListener("click",(event)=>{if(!patient?.value.trim())return;mutate((s)=>{const id=`CLM-${String(88300+s.claims.length+1)}`;s.claims=[{id,patient:patient.value,payer:payer?.value||"",encounter:encounter?.value||"",amount:Number(amount?.value)||0,patientBalance:Number(balance?.value)||0,status:"Draft"},...s.claims];});closeDialog(event.currentTarget);render();});render();
}

function initDoctors(){
  const root=main();if(!root)return;const tbody=root.querySelector("table")?.tBodies?.[0],rowTemplate=tableTemplate(tbody);const deptCard=cardContent(cardByTitle(root,"Department load")),deptTemplate=deptCard?.firstElementChild?.cloneNode(true);const deptDialog=byText(root,"h2","Add department")?.closest("[data-dialog]"),doctorDialog=byText(root,"h2","Add doctor")?.closest("[data-dialog]");const deptName=inputByLabel(deptDialog,"Department name"),deptLead=inputByLabel(deptDialog,"Department lead"),doctorName=inputByLabel(doctorDialog,"Doctor name"),specialty=inputByLabel(doctorDialog,"Specialty"),doctorDept=inputByLabel(doctorDialog,"Department"),shift=inputByLabel(doctorDialog,"Shift"),room=inputByLabel(doctorDialog,"Room");
  function render(){const state=readState();setNativeOptions(doctorDept,state.departments,(x)=>x.name,(x)=>x.name);setMetrics(root,[state.doctors.length,state.doctors.filter((x)=>x.status!=="Off duty").length,state.departments.length,state.departments.filter((x)=>x.status==="Busy").length]);if(tbody&&rowTemplate){tbody.innerHTML="";state.doctors.forEach((item)=>{const row=rowTemplate.cloneNode(true),c=row.cells,ps=c[0].querySelectorAll("p");if(ps[0])ps[0].textContent=item.name;if(ps[1])ps[1].textContent=`${item.specialty} · ${item.room}`;c[1].textContent=item.department;c[2].textContent=item.shift;styleBadge(c[3].querySelector("span"),item.status);c[4].textContent=String(item.appointments);const a=c[5].querySelector("a");if(a)a.href=routeToHref(`/hospital/doctors/${item.id}`);tbody.append(row);});}
    if(deptCard&&deptTemplate){deptCard.innerHTML="";state.departments.forEach((item)=>{const row=deptTemplate.cloneNode(true),ps=row.querySelectorAll("p"),badge=row.querySelector("span.inline-flex"),bottom=row.querySelectorAll(".mt-2 span");if(ps[0])ps[0].textContent=item.name;if(ps[1])ps[1].textContent=`${item.lead} · ${item.doctors} doctors`;styleBadge(badge,item.status);if(bottom[0])bottom[0].textContent=`${item.patients} patients`;if(bottom[1])bottom[1].textContent=`${item.occupancy}% occupancy`;deptCard.append(row);});}root.dataset.d2HospitalState="ready";}
  button(deptDialog||root,"Add department")?.addEventListener("click",(event)=>{const name=deptName?.value.trim();if(!name)return;mutate((s)=>{const letters=name.toUpperCase().replace(/[^A-Z]/g,"").slice(0,3),id=`DEP-${letters||s.departments.length+1}`;s.departments=[...s.departments,{id,name,lead:deptLead?.value||"Unassigned",doctors:0,patients:0,occupancy:0,status:"Stable"}];});if(deptName)deptName.value="";if(deptLead)deptLead.value="";closeDialog(event.currentTarget);render();});
  button(doctorDialog||root,"Add doctor")?.addEventListener("click",(event)=>{const name=doctorName?.value.trim();if(!name)return;mutate((s)=>{const department=doctorDept?.value||s.departments[0]?.name||"Emergency",id=`DR-${String(1000+s.doctors.length+1)}`;s.doctors=[{id,name,specialty:specialty?.value||department,department,shift:shift?.value||"09:00–17:00",room:room?.value||"Clinic 01",status:"Available",appointments:0},...s.doctors];});if(doctorName)doctorName.value="";if(specialty)specialty.value="";closeDialog(event.currentTarget);render();});render();
}

function initLaboratory(){
  const root=main();if(!root)return;const tbody=root.querySelector("table")?.tBodies?.[0],template=tableTemplate(tbody);const dialog=byText(root,"h2","Add lab request")?.closest("[data-dialog]"),patient=inputByLabel(dialog,"Patient"),test=inputByLabel(dialog,"Requested test / service"),priority=inputByLabel(dialog,"Priority");
  function render(){const state=readState();setNativeOptions(patient,state.patients,(x)=>x.name,(x)=>x.name);setMetrics(root,[state.labs.filter((x)=>x.status!=="Released").length,state.labs.filter((x)=>x.status==="Processing").length,state.labs.filter((x)=>x.status==="Ready").length,"28 min"]);if(tbody&&template){tbody.innerHTML="";state.labs.forEach((item)=>{const row=template.cloneNode(true),c=row.cells;c[0].textContent=item.id;c[1].textContent=item.patient;c[2].textContent=item.test;styleBadge(c[3].querySelector("span"),item.priority);c[4].textContent=item.eta;styleBadge(c[5].querySelector("span"),item.status);c[6].innerHTML="";if(item.status==="Ready"){const b=makeButton("Release record");b.addEventListener("click",()=>{mutate((s)=>{s.labs=s.labs.map((x)=>x.id===item.id?{...x,status:"Released",eta:"Released"}:x);});render();});c[6].append(b);}tbody.append(row);});}root.dataset.d2HospitalState="ready";}
  button(dialog||root,"Add request")?.addEventListener("click",(event)=>{const service=test?.value.trim();if(!service)return;mutate((s)=>{const p=priority?.value||"Routine",id=`LAB-${String(7900+s.labs.length+1)}`;s.labs=[{id,patient:patient?.value||"",test:service,priority:p,department:"Laboratory",requestedAt:"Just now",eta:p==="STAT"?"10 min":p==="Urgent"?"20 min":"45 min",status:"Collected"},...s.labs];});if(test)test.value="";closeDialog(event.currentTarget);render();});render();
}

function initPatientsAppointments(){
  const root=main();if(!root)return;const table=root.querySelector("table"),tbody=table?.tBodies?.[0],rowTemplate=tableTemplate(tbody);const tracker=cardContent(cardByTitle(root,"Today's appointment tracker")),trackerTemplate=tracker?.firstElementChild?.cloneNode(true);const patientDialog=byText(root,"h2","Register patient")?.closest("[data-dialog]"),apptDialog=byText(root,"h2","Schedule appointment")?.closest("[data-dialog]");const fullName=inputByLabel(patientDialog,"Full name"),age=inputByLabel(patientDialog,"Age"),phone=inputByLabel(patientDialog,"Phone"),payer=inputByLabel(patientDialog,"Payer / financial responsibility"),apptPatient=inputByLabel(apptDialog,"Patient"),apptDoctor=inputByLabel(apptDialog,"Provider"),apptTime=inputByLabel(apptDialog,"Time"),apptType=inputByLabel(apptDialog,"Type"),search=root.querySelector('input[placeholder="Search patients"]');
  function render(){const state=readState(),q=(search?.value||"").toLowerCase();setNativeOptions(apptPatient,state.patients,(x)=>x.id,(x)=>`${x.name} · ${x.id}`);setNativeOptions(apptDoctor,state.doctors,(x)=>x.id,(x)=>`${x.name} · ${x.department}`);setMetrics(root,[state.patients.length,state.appointments.length,state.appointments.filter((x)=>x.status==="Checked in").length,state.appointments.filter((x)=>x.status==="Waiting").length]);if(tbody&&rowTemplate){tbody.innerHTML="";state.patients.filter((x)=>`${x.name} ${x.id} ${x.phone} ${x.department}`.toLowerCase().includes(q)).forEach((item)=>{const row=rowTemplate.cloneNode(true),c=row.cells,ps=c[0].querySelectorAll("p");if(ps[0])ps[0].textContent=item.name;if(ps[1])ps[1].textContent=`${item.id} · ${item.phone}`;styleBadge(c[1].querySelector("span"),item.status);c[2].textContent=item.department;c[3].textContent=item.payer;const a=c[4].querySelector("a");if(a)a.href=routeToHref(`/hospital/patients/${item.id}`);tbody.append(row);});}
    if(tracker&&trackerTemplate){tracker.innerHTML="";state.appointments.forEach((item)=>{const row=trackerTemplate.cloneNode(true),ps=row.querySelectorAll("p"),badge=row.querySelector("span.inline-flex");if(ps[0])ps[0].textContent=`${item.time} · ${item.patient}`;if(ps[1])ps[1].textContent=`${item.doctor} · ${item.type}`;styleBadge(badge,item.status);[...row.children].filter((x)=>x.tagName==="BUTTON").forEach((x)=>x.remove());if(["Confirmed","Waiting"].includes(item.status)){const b=makeButton(item.status==="Confirmed"?"Check in":"Complete visit");b.classList.add("mt-2");b.addEventListener("click",()=>{mutate((s)=>{s.appointments=s.appointments.map((x)=>x.id===item.id?{...x,status:item.status==="Confirmed"?"Checked in":"Completed"}:x);});render();});row.append(b);}tracker.append(row);});}root.dataset.d2HospitalState="ready";}
  search?.addEventListener("input",render);
  button(patientDialog||root,"Register patient")?.addEventListener("click",(event)=>{const name=fullName?.value.trim();if(!name)return;mutate((s)=>{const id=`PT-${String(211000+s.patients.length+1)}`;s.patients=[{id,name,age:Number(age?.value)||0,phone:phone?.value||"—",payer:payer?.value||"Self-pay",status:"Outpatient",department:"Unassigned",room:"Front desk"},...s.patients];});if(fullName)fullName.value="";if(phone)phone.value="";closeDialog(event.currentTarget);render();});
  button(apptDialog||root,"Schedule")?.addEventListener("click",(event)=>{const state=readState(),patient=state.patients.find((x)=>x.id===apptPatient?.value),doctor=state.doctors.find((x)=>x.id===apptDoctor?.value);if(!patient||!doctor)return;mutate((s)=>{const id=`APT-${String(2000+s.appointments.length+1)}`;s.appointments=[{id,patientId:patient.id,patient:patient.name,doctor:doctor.name,department:doctor.department,time:apptTime?.value||"09:30",type:apptType?.value||"Consultation",status:"Confirmed"},...s.appointments];});closeDialog(event.currentTarget);render();});
  render();if(location.hash==="#new-appointment")queueMicrotask(()=>button(root,"New appointment")?.click());
}

function initPharmacy(){
  const root=main();if(!root)return;const tbody=root.querySelector("table")?.tBodies?.[0],template=tableTemplate(tbody);function render(){const state=readState();setMetrics(root,[state.medicines.length,state.medicines.filter((x)=>x.status==="Reorder").length,state.medicines.filter((x)=>x.status==="Watch").length,"96%"]);if(tbody&&template){tbody.innerHTML="";state.medicines.forEach((item)=>{const row=template.cloneNode(true),c=row.cells,ps=c[0].querySelectorAll("p");if(ps[0])ps[0].textContent=item.name;if(ps[1])ps[1].textContent=item.id;c[1].textContent=item.category;c[2].textContent=`${item.onHand} ${item.unit}`;c[3].textContent=`${item.reorderAt} ${item.unit}`;c[4].textContent=item.supplier;styleBadge(c[5].querySelector("span"),item.status);c[6].innerHTML="";if(item.status!=="Healthy"){const b=makeButton("Sample reorder");b.addEventListener("click",()=>{mutate((s)=>{s.medicines=s.medicines.map((x)=>x.id===item.id?{...x,status:"Healthy",onHand:Math.max(x.onHand,x.reorderAt*2)}:x);});render();});c[6].append(b);}tbody.append(row);});}root.dataset.d2HospitalState="ready";}render();
}

function initRecords(){
  const root=main();if(!root)return;const tbody=root.querySelector("table")?.tBodies?.[0],template=tableTemplate(tbody);const dialog=byText(root,"h2","Add administrative record")?.closest("[data-dialog]"),patient=inputByLabel(dialog,"Patient"),type=inputByLabel(dialog,"Document type"),owner=inputByLabel(dialog,"Operational owner");function render(){const state=readState();setNativeOptions(patient,state.patients,(x)=>x.name,(x)=>x.name);const review=state.documents.filter((x)=>x.status!=="Current").length;setMetrics(root,[state.documents.length,state.documents.filter((x)=>x.status==="Current").length,review,"Shared"]);if(tbody&&template){tbody.innerHTML="";state.documents.forEach((item)=>{const row=template.cloneNode(true),c=row.cells;c[0].textContent=item.id;c[1].textContent=item.patient;c[2].textContent=item.type;c[3].textContent=item.owner;c[4].textContent=item.updatedAt;styleBadge(c[5].querySelector("span"),item.status);tbody.append(row);});}root.dataset.d2HospitalState="ready";}
  button(dialog||root,"Add record")?.addEventListener("click",(event)=>{mutate((s)=>{const id=`DOC-${Date.now().toString().slice(-8)}`;s.documents=[{id,patient:patient?.value||"",type:type?.value||"Registration document",owner:owner?.value||"Front Desk",updatedAt:"Just now",status:"Current"},...s.documents];});closeDialog(event.currentTarget);render();});render();
}

function initTheatre(){
  const root=main();if(!root)return;const tbody=root.querySelector("table")?.tBodies?.[0],template=tableTemplate(tbody);const dialog=byText(root,"h2","Schedule procedure")?.closest("[data-dialog]"),patient=inputByLabel(dialog,"Patient"),theatre=inputByLabel(dialog,"Theatre"),time=inputByLabel(dialog,"Time"),team=inputByLabel(dialog,"Team"),duration=inputByLabel(dialog,"Planned duration");const order=["Scheduled","Ready","In progress","Recovery","Completed"];
  function render(){const state=readState();setNativeOptions(patient,state.patients,(x)=>x.name,(x)=>x.name);setMetrics(root,[state.procedures.filter((x)=>x.status!=="Completed").length,state.procedures.filter((x)=>x.status==="Ready").length,"6 / 7","91%"]);if(tbody&&template){tbody.innerHTML="";state.procedures.forEach((item)=>{const row=template.cloneNode(true),c=row.cells;c[0].textContent=item.id;c[1].textContent=item.patient;c[2].textContent=item.theatre;c[3].textContent=item.team;c[4].textContent=`${item.time} · ${item.duration}`;styleBadge(c[5].querySelector("span"),item.status);c[6].innerHTML="";if(item.status!=="Completed"){const b=makeButton("Advance");b.addEventListener("click",()=>{mutate((s)=>{s.procedures=s.procedures.map((x)=>{if(x.id!==item.id)return x;const i=order.indexOf(x.status);return{...x,status:order[Math.min(i+1,order.length-1)]};});});render();});c[6].append(b);}tbody.append(row);});}root.dataset.d2HospitalState="ready";}
  button(dialog||root,"Schedule")?.addEventListener("click",(event)=>{if(!patient?.value.trim())return;mutate((s)=>{const id=`OR-${Date.now().toString().slice(-8)}`;s.procedures=[{id,patient:patient.value,theatre:theatre?.value||"OR-3",team:team?.value||"Dr. Maya Chen · Team C",time:time?.value||"22:00",duration:duration?.value||"90 min",status:"Scheduled"},...s.procedures];});closeDialog(event.currentTarget);render();});render();
}

export function initD2HospitalInteractions(){
  const r=currentRoute();if(!routes.has(r))return;
  if(r==="/hospital/admissions-beds")initAdmissions();
  else if(r==="/hospital/billing-insurance")initBilling();
  else if(r==="/hospital/doctors-departments")initDoctors();
  else if(r==="/hospital/laboratory")initLaboratory();
  else if(r==="/hospital/patients-appointments")initPatientsAppointments();
  else if(r==="/hospital/pharmacy-supplies")initPharmacy();
  else if(r==="/hospital/records-documents")initRecords();
  else if(r==="/hospital/theatre-procedures")initTheatre();
}
