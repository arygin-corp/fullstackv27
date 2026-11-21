import { badgeClass, buttonClass } from "./components/component-styles.js";
import { routeToHref } from "./ui.js";

const STORAGE_KEY="vexlora:hr-operations:v1";
const routes=new Set(["/hr/assets","/hr/attendance","/hr/candidates","/hr/documents","/hr/employees","/hr/employees/[id]","/hr/employees/create","/hr/experience","/hr/inbox","/hr/learning","/hr/leave","/hr/lifecycle","/hr/organization","/hr/payroll","/hr/performance","/hr/recruitment"]);
const employeesMock=[
  {
    id: "EMP-1001",
    name: "Mia Chen",
    email: "mia@example.com",
    phone: "+1 415 555 0101",
    department: "Product",
    designation: "Director of Product",
    manager: "Olivia Reed",
    status: "active",
    location: "San Francisco",
    joinedAt: "2022-03-14",
    salaryBand: "L6",
    performance: 94,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "America/Los_Angeles",
  },
  {
    id: "EMP-1002",
    name: "Noah Williams",
    email: "noah@example.com",
    phone: "+1 212 555 0188",
    department: "Engineering",
    designation: "AI Platform Lead",
    manager: "Daniel Kim",
    status: "active",
    location: "New York",
    joinedAt: "2021-08-02",
    salaryBand: "L6",
    performance: 91,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "America/New_York",
  },
  {
    id: "EMP-1003",
    name: "Sophia Turner",
    email: "sophia@example.com",
    phone: "+44 20 7946 0103",
    department: "Finance",
    designation: "Finance Operations Lead",
    manager: "Avery Scott",
    status: "active",
    location: "London",
    joinedAt: "2023-01-09",
    salaryBand: "L5",
    performance: 96,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "Europe/London",
  },
  {
    id: "EMP-1004",
    name: "Oliver Smith",
    email: "oliver@example.com",
    phone: "+1 416 555 0121",
    department: "Design",
    designation: "Product Design Lead",
    manager: "Mia Chen",
    status: "active",
    location: "Toronto",
    joinedAt: "2022-11-21",
    salaryBand: "L5",
    performance: 89,
    employmentType: "Full time",
    workMode: "Remote",
    timezone: "America/Toronto",
  },
  {
    id: "EMP-1005",
    name: "Emma Davis",
    email: "emma@example.com",
    phone: "+49 30 555 0142",
    department: "Data",
    designation: "Analytics Manager",
    manager: "Daniel Kim",
    status: "on-leave",
    location: "Berlin",
    joinedAt: "2023-05-15",
    salaryBand: "L5",
    performance: 92,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "Europe/Berlin",
  },
  {
    id: "EMP-1006",
    name: "Liam Wilson",
    email: "liam@example.com",
    phone: "+1 512 555 0137",
    department: "Engineering",
    designation: "Staff Engineer",
    manager: "Noah Williams",
    status: "active",
    location: "Austin",
    joinedAt: "2020-10-12",
    salaryBand: "L6",
    performance: 95,
    employmentType: "Full time",
    workMode: "Remote",
    timezone: "America/Chicago",
  },
  {
    id: "EMP-1007",
    name: "Ava Brown",
    email: "ava@example.com",
    phone: "+61 2 5550 0122",
    department: "Quality",
    designation: "QA Lead",
    manager: "Daniel Kim",
    status: "active",
    location: "Sydney",
    joinedAt: "2022-06-06",
    salaryBand: "L5",
    performance: 90,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "Australia/Sydney",
  },
  {
    id: "EMP-1008",
    name: "Ethan Martin",
    email: "ethan@example.com",
    phone: "+1 312 555 0115",
    department: "Customer Success",
    designation: "CS Manager",
    manager: "Olivia Reed",
    status: "active",
    location: "Chicago",
    joinedAt: "2021-04-19",
    salaryBand: "L5",
    performance: 93,
    employmentType: "Full time",
    workMode: "Office",
    timezone: "America/Chicago",
  },
  {
    id: "EMP-1009",
    name: "Amelia Clark",
    email: "amelia@example.com",
    phone: "+65 6555 0148",
    department: "People",
    designation: "People Partner",
    manager: "Grace Hall",
    status: "active",
    location: "Singapore",
    joinedAt: "2024-02-12",
    salaryBand: "L4",
    performance: 88,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "Asia/Singapore",
  },
  {
    id: "EMP-1010",
    name: "Lucas Moore",
    email: "lucas@example.com",
    phone: "+49 30 555 0177",
    department: "Engineering",
    designation: "Frontend Engineer",
    manager: "Liam Wilson",
    status: "probation",
    location: "Berlin",
    joinedAt: "2026-06-01",
    salaryBand: "L3",
    performance: 84,
    employmentType: "Full time",
    workMode: "Hybrid",
    timezone: "Europe/Berlin",
  },
  {
    id: "EMP-1011",
    name: "Isla Young",
    email: "isla@example.com",
    phone: "+33 1 55 55 0129",
    department: "Marketing",
    designation: "Growth Manager",
    manager: "Olivia Reed",
    status: "active",
    location: "Paris",
    joinedAt: "2023-09-18",
    salaryBand: "L4",
    performance: 90,
    employmentType: "Full time",
    workMode: "Remote",
    timezone: "Europe/Paris",
  },
  {
    id: "EMP-1012",
    name: "Henry Walker",
    email: "henry@example.com",
    phone: "+1 617 555 0191",
    department: "Sales",
    designation: "Enterprise AE",
    manager: "Grace Hall",
    status: "inactive",
    location: "Boston",
    joinedAt: "2022-01-24",
    salaryBand: "L4",
    performance: 78,
    employmentType: "Full time",
    workMode: "Remote",
    timezone: "America/New_York",
  },
];
const departmentsMock=[
  { id: "DEP-01", name: "Engineering", lead: "Daniel Kim", headcount: 62, openRoles: 7, location: "Global", costCenter: "CC-ENG", status: "Hiring" },
  { id: "DEP-02", name: "Product", lead: "Olivia Reed", headcount: 24, openRoles: 2, location: "Global", costCenter: "CC-PROD", status: "Healthy" },
  { id: "DEP-03", name: "Customer Success", lead: "Ethan Martin", headcount: 31, openRoles: 3, location: "Americas", costCenter: "CC-CS", status: "Hiring" },
  { id: "DEP-04", name: "Finance", lead: "Avery Scott", headcount: 18, openRoles: 1, location: "Global", costCenter: "CC-FIN", status: "Healthy" },
  { id: "DEP-05", name: "Marketing", lead: "Olivia Reed", headcount: 22, openRoles: 2, location: "Global", costCenter: "CC-MKT", status: "Healthy" },
  { id: "DEP-06", name: "People", lead: "Grace Hall", headcount: 14, openRoles: 1, location: "Global", costCenter: "CC-HR", status: "Healthy" },
];
const designationsMock=[
  { id: "DSG-01", title: "Staff Engineer", family: "Engineering", level: "L6", department: "Engineering", employees: 7, track: "IC", status: "Active" },
  { id: "DSG-02", title: "Engineering Manager", family: "Engineering", level: "M2", department: "Engineering", employees: 8, track: "Manager", status: "Active" },
  { id: "DSG-03", title: "Product Manager", family: "Product", level: "L4–L5", department: "Product", employees: 8, track: "IC", status: "Active" },
  { id: "DSG-04", title: "People Partner", family: "People", level: "L4", department: "People", employees: 3, track: "IC", status: "Review" },
  { id: "DSG-05", title: "Customer Success Manager", family: "Customer Success", level: "M1", department: "Customer Success", employees: 5, track: "Manager", status: "Active" },
];
const attendanceMock=[
  { id: "ATT-1", employeeId: "EMP-1001", name: "Mia Chen", status: "Present", shift: "09:00–17:30", checkIn: "08:51", checkOut: "17:42", hours: "8h 51m", note: "Office" },
  { id: "ATT-2", employeeId: "EMP-1002", name: "Noah Williams", status: "Remote", shift: "09:00–18:00", checkIn: "09:06", checkOut: "18:04", hours: "8h 58m", note: "Remote" },
  { id: "ATT-3", employeeId: "EMP-1003", name: "Sophia Turner", status: "Present", shift: "08:30–17:00", checkIn: "08:44", checkOut: "17:31", hours: "8h 47m", note: "Office" },
  { id: "ATT-4", employeeId: "EMP-1005", name: "Emma Davis", status: "Leave", shift: "09:00–17:30", checkIn: "—", checkOut: "—", hours: "—", note: "Approved annual leave" },
  { id: "ATT-5", employeeId: "EMP-1006", name: "Liam Wilson", status: "Late", shift: "09:00–18:00", checkIn: "09:12", checkOut: "18:20", hours: "9h 08m", note: "12m late" },
  { id: "ATT-6", employeeId: "EMP-1008", name: "Ethan Martin", status: "Present", shift: "08:30–17:00", checkIn: "08:27", checkOut: "17:12", hours: "8h 45m", note: "Office" },
];
const leaveRequestsMock=[
  { id: "LEV-201", employeeId: "EMP-1005", employee: "Emma Davis", type: "Annual", dates: "Aug 17–21", days: 5, status: "Approved", approver: "Daniel Kim" },
  { id: "LEV-202", employeeId: "EMP-1010", employee: "Lucas Moore", type: "Sick", dates: "Aug 18", days: 1, status: "Pending", approver: "Liam Wilson" },
  { id: "LEV-203", employeeId: "EMP-1007", employee: "Ava Brown", type: "Personal", dates: "Aug 25–26", days: 2, status: "Pending", approver: "Daniel Kim" },
  { id: "LEV-204", employeeId: "EMP-1011", employee: "Isla Young", type: "Annual", dates: "Sep 01–05", days: 5, status: "Approved", approver: "Olivia Reed" },
];
const holidaysMock=[
  { id: "HOL-01", name: "National Day", date: "2026-08-26", region: "Singapore", type: "Regional" },
  { id: "HOL-02", name: "Labor Day", date: "2026-09-07", region: "United States", type: "Regional" },
  { id: "HOL-03", name: "Company Reset Day", date: "2026-09-18", region: "All regions", type: "Company" },
  { id: "HOL-04", name: "Year-end Closure", date: "2026-12-25", region: "All regions", type: "Global" },
];
const payrollMock=[
  { id: "PAYROLL-08-001", employeeId: "EMP-1001", employee: "Mia Chen", gross: 14800, deductions: 3120, net: 11680, variablePay: 1200, status: "Ready" },
  { id: "PAYROLL-08-002", employeeId: "EMP-1002", employee: "Noah Williams", gross: 15200, deductions: 3290, net: 11910, variablePay: 900, status: "Ready" },
  { id: "PAYROLL-08-003", employeeId: "EMP-1003", employee: "Sophia Turner", gross: 12100, deductions: 2440, net: 9660, variablePay: 650, status: "Review" },
  { id: "PAYROLL-08-004", employeeId: "EMP-1004", employee: "Oliver Smith", gross: 11800, deductions: 2360, net: 9440, variablePay: 500, status: "Ready" },
  { id: "PAYROLL-08-005", employeeId: "EMP-1006", employee: "Liam Wilson", gross: 14600, deductions: 3060, net: 11540, variablePay: 800, status: "Ready" },
];
const performanceReviewsMock=[
  { id: "PER-01", employeeId: "EMP-1001", employee: "Mia Chen", department: "Product", cycle: "H2 2026", rating: 4.6, goalProgress: 94, potential: "High", status: "Manager review" },
  { id: "PER-02", employeeId: "EMP-1002", employee: "Noah Williams", department: "Engineering", cycle: "H2 2026", rating: 4.4, goalProgress: 89, potential: "High", status: "Calibration" },
  { id: "PER-03", employeeId: "EMP-1010", employee: "Lucas Moore", department: "Engineering", cycle: "Probation 90d", rating: 4.0, goalProgress: 82, potential: "Medium", status: "Manager review" },
  { id: "PER-04", employeeId: "EMP-1007", employee: "Ava Brown", department: "Quality", cycle: "H2 2026", rating: 4.2, goalProgress: 88, potential: "High", status: "Self review" },
];
const recruitmentMock=[
  { id: "JOB-71", role: "Senior Backend Engineer", department: "Engineering", location: "Remote · EU", owner: "Amelia Clark", applicants: 48, stage: "Interviewing", targetHires: 2 },
  { id: "JOB-70", role: "Product Marketing Manager", department: "Marketing", location: "Paris / Remote", owner: "Isla Young", applicants: 36, stage: "Screening", targetHires: 1 },
  { id: "JOB-69", role: "Customer Success Specialist", department: "Customer Success", location: "Chicago", owner: "Ethan Martin", applicants: 29, stage: "Offer", targetHires: 2 },
  { id: "JOB-68", role: "Data Analyst", department: "Data", location: "Berlin", owner: "Amelia Clark", applicants: 54, stage: "Interviewing", targetHires: 1 },
];
const candidatesMock=[
  { id: "CAN-201", name: "Nora Patel", role: "Senior Backend Engineer", email: "nora@example.com", stage: "Interview", source: "Referral", score: 92, owner: "Amelia Clark", nextStep: "Panel · Aug 24" },
  { id: "CAN-202", name: "Evan Brooks", role: "Product Marketing Manager", email: "evan@example.com", stage: "Screen", source: "LinkedIn", score: 78, owner: "Isla Young", nextStep: "Hiring manager · Aug 23" },
  { id: "CAN-203", name: "Leah Kim", role: "Customer Success Specialist", email: "leah@example.com", stage: "Offer", source: "Careers page", score: 94, owner: "Ethan Martin", nextStep: "Offer expiry · Aug 25" },
  { id: "CAN-204", name: "Mateo Silva", role: "Data Analyst", email: "mateo@example.com", stage: "Applied", source: "Indeed", score: 71, owner: "Amelia Clark", nextStep: "Resume review" },
];
const lifecycleMock=[
  { id: "LIFE-01", employeeId: "EMP-1010", employee: "Lucas Moore", type: "Onboarding", startDate: "2026-06-01", owner: "Amelia Clark", progress: 88, status: "In progress", payrollReady: true, equipmentReady: true, documentsReady: true, accessReady: false },
  { id: "LIFE-02", employeeId: "EMP-1012", employee: "Henry Walker", type: "Offboarding", startDate: "2026-08-26", owner: "Amelia Clark", progress: 62, status: "In progress", payrollReady: true, equipmentReady: false, documentsReady: true, accessReady: false },
  { id: "LIFE-03", employeeId: "EMP-1009", employee: "Amelia Clark", type: "Onboarding", startDate: "2024-02-12", owner: "Grace Hall", progress: 100, status: "Complete", payrollReady: true, equipmentReady: true, documentsReady: true, accessReady: true },
];
const assetsMock=[
  { id: "AST-101", employeeId: "EMP-1001", employee: "Mia Chen", asset: "Laptop 14", type: "Laptop", serial: "MBP-24-0188", assignedAt: "2025-01-12", condition: "Excellent", status: "Assigned" },
  { id: "AST-102", employeeId: "EMP-1002", employee: "Noah Williams", asset: "ThinkPad P1", type: "Laptop", serial: "TP1-25-0081", assignedAt: "2025-02-18", condition: "Good", status: "Assigned" },
  { id: "AST-103", employeeId: "EMP-1010", employee: "Lucas Moore", asset: "MacBook Air 15", type: "Laptop", serial: "MBA-26-0107", assignedAt: "2026-05-29", condition: "Excellent", status: "Assigned" },
  { id: "AST-104", employeeId: "", employee: "Unassigned", asset: "iPhone 17", type: "Phone", serial: "IPH-26-0042", assignedAt: "—", condition: "Excellent", status: "Ready" },
  { id: "AST-105", employeeId: "EMP-1012", employee: "Henry Walker", asset: "Dell Latitude", type: "Laptop", serial: "DEL-23-0109", assignedAt: "2023-01-25", condition: "Fair", status: "Repair" },
];
const learningMock=[
  { id: "LRN-01", employeeId: "EMP-1010", employee: "Lucas Moore", course: "Secure development essentials", category: "Security", due: "Aug 29", progress: 75, status: "In progress" },
  { id: "LRN-02", employeeId: "EMP-1001", employee: "Mia Chen", course: "Manager calibration workshop", category: "Leadership", due: "Sep 02", progress: 100, status: "Complete" },
  { id: "LRN-03", employeeId: "EMP-1008", employee: "Ethan Martin", course: "Customer data handling", category: "Compliance", due: "Aug 24", progress: 42, status: "In progress" },
  { id: "LRN-04", employeeId: "EMP-1012", employee: "Henry Walker", course: "Annual code of conduct", category: "Compliance", due: "Aug 18", progress: 0, status: "Overdue" },
];
const employeeDocumentsMock=[
  { id: "DOC-01", employeeId: "EMP-1010", employee: "Lucas Moore", type: "Employment agreement", filename: "lucas-employment-agreement.pdf", status: "Signed", expiry: "—" },
  { id: "DOC-02", employeeId: "EMP-1001", employee: "Mia Chen", type: "Security policy acknowledgement", filename: "mia-security-policy.pdf", status: "Current", expiry: "2026-09-30" },
  { id: "DOC-03", employeeId: "EMP-1009", employee: "Amelia Clark", type: "Work authorization", filename: "amelia-work-authorization.pdf", status: "Expiring", expiry: "2026-10-12" },
  { id: "DOC-04", employeeId: "EMP-1008", employee: "Ethan Martin", type: "Compensation statement", filename: "ethan-comp-statement.pdf", status: "Pending signature", expiry: "—" },
];
const defaults={employees:employeesMock,departments:departmentsMock,designations:designationsMock,attendance:attendanceMock,leaveRequests:leaveRequestsMock,holidays:holidaysMock,payroll:payrollMock,reviews:performanceReviewsMock,jobs:recruitmentMock,candidates:candidatesMock,lifecycle:lifecycleMock,assets:assetsMock,learning:learningMock,documents:employeeDocumentsMock,payrollPreviewedAt:null};

const clone=x=>JSON.parse(JSON.stringify(x));
function route(){return document.body?.dataset.currentRoute||"";} function root(){return document.querySelector("#main-content");}
function read(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"),d=clone(defaults);if(raw&&typeof raw==="object"){Object.keys(d).forEach(k=>{if(Array.isArray(d[k])&&Array.isArray(raw[k]))d[k]=raw[k];});if(typeof raw.payrollPreviewedAt==="string")d.payrollPreviewedAt=raw.payrollPreviewedAt;}return d;}catch{return clone(defaults);}}
function write(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));} function mutate(fn){const s=read();fn(s);write(s);return s;}
function byText(scope,sel,text){return [...(scope?.querySelectorAll(sel)||[])].find(x=>x.textContent.trim()===text)||null;} function button(scope,text){return byText(scope,"button",text);} function hcard(title){const h=byText(root(),"h3",title);return h?.closest('.rounded-lg.border.border-border.bg-card')||h?.parentElement?.parentElement||null;} function content(title){const c=hcard(title);return c?.querySelector('.border-t')||c?.children?.[1]||null;} function dialog(title){return byText(root(),"h2",title)?.closest("[data-dialog]")||null;} function field(scope,label){const l=[...(scope?.querySelectorAll("label")||[])].find(x=>x.childNodes[0]?.textContent?.trim()===label||x.querySelector(':scope > span')?.textContent?.trim()===label||x.textContent.trim().startsWith(label));return l?.querySelector("input,select,textarea")||null;} function close(d){d?.querySelector("[data-dialog-close]")?.click();}
function once(el,key,fn,event="click"){if(!el||el.dataset[key])return;el.dataset[key]="1";el.addEventListener(event,fn);} function makeBtn(text,fn,variant="outline"){const b=document.createElement("button");b.type="button";b.className=buttonClass(variant,"sm");b.textContent=text;b.addEventListener("click",fn);return b;}
function variant(v){v=String(v);if(["active","Active","Present","Approved","Ready","Complete","Current","Signed","Hired","Assigned","Healthy"].includes(v))return"success";if(["Pending","Review","Late","Offer","Probation","probation","Expiring","In progress","Calibration","Self review","Manager review","Sourcing","Screening","Interviewing"].includes(v))return"warning";if(["Rejected","Overdue","inactive","Inactive","Repair"].includes(v))return"destructive";if(["Remote","Applied","Screen","Interview","Draft","Returned","On leave","on-leave"].includes(v))return"info";return"neutral";} function badge(el,v){if(el){el.textContent=v;el.className=badgeClass(variant(v));}}
function options(sel,items,val=x=>x.id,label=x=>x.name){if(!sel)return;const prev=sel.value;sel.innerHTML="";items.forEach(x=>{const o=document.createElement("option");o.value=val(x);o.textContent=label(x);sel.append(o);});if(items.length)sel.value=items.some(x=>String(val(x))===String(prev))?prev:val(items[0]);}
function tableBody(){return root()?.querySelector('table tbody')||null;} function rows(t,items,fill){if(!t)return;const tpl=t.rows[0]?.cloneNode(true);if(!tpl)return;t.innerHTML="";items.forEach(x=>{const r=tpl.cloneNode(true);fill(r,x);t.append(r);});}
function exportCsv(filename,head,body){const csv=[head,...body].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(',')).join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);}
function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0);} function employeeHref(id){return `${routeToHref('/hr/employees/[id]')}?id=${encodeURIComponent(id)}`;}
function addEmployeeOptions(d){const s=read();d?.querySelectorAll('label').forEach(l=>{const text=(l.childNodes[0]?.textContent||l.querySelector(':scope > span')?.textContent||'').trim();const sel=l.querySelector('select');if(!sel)return;if(text==='Employee')options(sel,s.employees,x=>x.id,x=>x.name);if(text==='Department')options(sel,s.departments,x=>x.name,x=>x.name);if(text==='Designation')options(sel,s.designations,x=>x.title,x=>x.title);if(text==='Manager')options(sel,s.employees.filter(x=>x.status!=='inactive'),x=>x.name,x=>x.name);if(text==='Role')options(sel,s.jobs,x=>x.role,x=>x.role);});}
function metrics(vals){const sec=[...root().querySelectorAll('section')].find(s=>s.classList.contains('xl:grid-cols-4')&&s.children.length>=4);if(!sec)return;[...sec.children].forEach((c,i)=>{const ps=c.querySelectorAll('p');if(ps[1]&&vals[i]!==undefined)ps[1].textContent=String(vals[i]);});}

function employeeCsv(e){return[e.name,e.email,e.department,e.designation,e.manager,e.status,e.location];}
function employeeExpansion(e){return `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div><p class="text-compact text-muted-foreground">Joined</p><p class="mt-1 text-sm font-semibold">${e.joinedAt}</p></div><div><p class="text-compact text-muted-foreground">Employment</p><p class="mt-1 text-sm font-semibold">${e.employmentType} · ${e.workMode}</p></div><div><p class="text-compact text-muted-foreground">Salary band</p><p class="mt-1 text-sm font-semibold">${e.salaryBand}</p></div><div><p class="text-compact text-muted-foreground">Timezone</p><p class="mt-1 text-sm font-semibold">${e.timezone}</p></div></div>`;}
function mobileEmployees(){const tbody=tableBody(),wrap=tbody?.closest('.overflow-auto'),mobile=wrap?.previousElementSibling;return mobile?.classList.contains('divide-y')&&mobile.classList.contains('divide-border')&&mobile.classList.contains('md:hidden')?mobile:null;}
function hydrateEmployeeRow(r,e){if(!r||!e)return;const c=r.cells;r.dataset.hrEmployeeId=e.id;r.dataset.csvRow=JSON.stringify(employeeCsv(e));r.dataset.d2Expansion=employeeExpansion(e);const select=c[0]?.querySelector('[aria-label]');if(select)select.setAttribute('aria-label',`Select row ${e.id}`);const expand=c[1]?.querySelector('button');if(expand){expand.setAttribute('aria-expanded','false');expand.setAttribute('aria-label',`Expand ${e.name} details`);}const a=c[2]?.querySelector('a'),p=c[2]?.querySelector('p');if(a){a.textContent=e.name;a.href=employeeHref(e.id)}if(p)p.textContent=`${e.designation} · ${e.email}`;if(c[3])c[3].textContent=e.department;if(c[4])c[4].textContent=e.manager;if(c[5])badge(c[5].querySelector('span'),e.status);if(c[6])c[6].textContent=e.location;if(c[7])c[7].textContent=e.performance?`${e.performance}%`:'New';c[8]?.querySelectorAll('a').forEach(a=>{a.href=employeeHref(e.id);a.setAttribute('aria-label',`Open ${e.name} details`);});}
function hydrateEmployeeMobile(card,e){if(!card||!e)return;card.dataset.hrEmployeeId=e.id;card.dataset.csvRow=JSON.stringify(employeeCsv(e));card.dataset.d2Expansion=employeeExpansion(e);const buttons=card.querySelectorAll('button'),select=buttons[0],expand=[...buttons].find(b=>b.getAttribute('aria-label')?.startsWith('Expand'));if(select)select.setAttribute('aria-label',`Select row ${e.id}`);if(expand){expand.setAttribute('aria-expanded','false');expand.setAttribute('aria-label',`Expand ${e.name} details`);}const links=card.querySelectorAll('a');if(links[0]){links[0].textContent=e.name;links[0].href=employeeHref(e.id)}if(links[1])links[1].href=employeeHref(e.id);const grid=card.querySelector('.grid.gap-3'),ps=grid?.querySelectorAll('p'),spans=grid?.querySelectorAll('span');if(ps?.[0])ps[0].textContent=e.designation;const status=[...card.querySelectorAll('span')].find(x=>x.classList.contains('rounded-full'));badge(status,e.status);const pair=grid?.querySelector('.flex.justify-between.gap-3.text-sm');if(pair){const pairSpans=pair.querySelectorAll('span');if(pairSpans[0])pairSpans[0].textContent=e.department;if(pairSpans[1])pairSpans[1].textContent=e.location;}}
function prepareEmployees(){if(route()!=='/hr/employees')return;const s=read(),tbody=tableBody(),mobile=mobileEmployees();if(!tbody)return;const baseRows=[...tbody.rows],baseCards=mobile?[...mobile.children]:[];baseRows.forEach((r,i)=>hydrateEmployeeRow(r,defaults.employees[i]));baseCards.forEach((card,i)=>hydrateEmployeeMobile(card,defaults.employees[i]));const existing=new Set(baseRows.map(r=>r.dataset.hrEmployeeId));const tpl=baseRows[0],mobileTpl=baseCards[0];s.employees.forEach(e=>{if(existing.has(e.id)||!tpl)return;const r=tpl.cloneNode(true);hydrateEmployeeRow(r,e);if(defaults.employees.some(d=>d.id===e.id))tbody.append(r);else tbody.prepend(r);if(mobile&&mobileTpl){const card=mobileTpl.cloneNode(true);hydrateEmployeeMobile(card,e);if(defaults.employees.some(d=>d.id===e.id))mobile.append(card);else mobile.prepend(card);}});}
function bindExpansion(scope,type){scope?.querySelectorAll('[data-d2-expansion]').forEach(item=>{const button=[...item.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')?.startsWith('Expand'));once(button,`d2${type}Expand`,()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));if(item.tagName==='TR'){let detail=item.nextElementSibling;if(detail?.dataset.d2ExpansionRow!=='true'){detail=document.createElement('tr');detail.dataset.d2ExpansionRow='true';detail.hidden=true;const td=document.createElement('td');td.colSpan=item.cells.length;td.className='px-4 pb-4';detail.append(td);item.after(detail);}detail.firstElementChild.innerHTML=`<div class="rounded-lg border border-border bg-muted/20 p-4">${item.dataset.d2Expansion}</div>`;detail.hidden=open;}else{let detail=item.querySelector(':scope > [data-d2-mobile-expansion]');if(!detail){detail=document.createElement('div');detail.dataset.d2MobileExpansion='true';detail.className='mt-4 rounded-lg border border-border bg-muted/20 p-4';item.append(detail);}detail.innerHTML=item.dataset.d2Expansion;detail.hidden=open;}});});}
function initEmployees(){const s=read(),r=root();r?.querySelectorAll('tbody tr[data-hr-employee-id]').forEach(tr=>{const id=tr.dataset.hrEmployeeId;if(id)tr.querySelectorAll('a[href*="employees/[id]"]').forEach(a=>a.href=employeeHref(id));});bindExpansion(r?.querySelector('table tbody'),'HrDesktop');bindExpansion(mobileEmployees(),'HrMobile');const card=r?.querySelector('[data-data-table-ready="true"],[data-data-table]');if(card)card.dataset.d2HrTable='employees';metrics([s.employees.length,s.employees.filter(x=>x.status==='active').length,s.employees.filter(x=>x.status==='probation').length,s.employees.filter(x=>x.status==='on-leave').length]);document.documentElement.dataset.d2HrEmployeesReady='true';}
function initEmployeeCreate(){const r=root(),s=read();addEmployeeOptions(r);const dep=field(r,'Department'),des=field(r,'Designation');once(dep,'d2HrDep',()=>{const st=read(),matches=st.designations.filter(x=>x.department===dep.value);options(des,matches.length?matches:st.designations,x=>x.title,x=>x.title);},'change');const save=button(r,'Create employee');const update=()=>{if(save)save.disabled=!(field(r,'Full name')?.value.trim()&&field(r,'Work email')?.value.trim());};['Full name','Work email'].forEach(x=>once(field(r,x),'d2HrRequired',update,'input'));once(save,'d2HrCreate',()=>{const name=field(r,'Full name')?.value.trim(),email=field(r,'Work email')?.value.trim();if(!name||!email)return;let created;mutate(st=>{const id=`EMP-${1100+Date.now()%8000}`;created=id;const e={id,name,email,phone:field(r,'Phone')?.value.trim()||'Not provided',department:dep?.value||st.departments[0]?.name,designation:des?.value||st.designations[0]?.title,manager:field(r,'Manager')?.value||'Unassigned',status:'probation',location:field(r,'Location')?.value.trim()||'Remote',joinedAt:field(r,'Start date')?.value||new Date().toISOString().slice(0,10),salaryBand:field(r,'Salary band')?.value||'L3',performance:0,employmentType:field(r,'Employment type')?.value||'Full time',workMode:field(r,'Work mode')?.value||'Hybrid',timezone:field(r,'Timezone')?.value.trim()||'UTC'};st.employees.unshift(e);st.lifecycle.unshift({id:`LIFE-${Date.now()}`,employeeId:id,employee:name,type:'Onboarding',startDate:e.joinedAt,owner:e.manager,progress:10,status:'In progress',payrollReady:false,equipmentReady:false,documentsReady:false,accessReady:false});});r.dataset.d2HrCreated=created;const href=employeeHref(created);if(location.protocol==='http:'||location.protocol==='https:'||location.protocol==='file:')location.href=href;});update();}
function hydrateEmployeeDetails(){const r=root(),s=read(),id=document.body?.dataset.d2HrEmployee||new URL(location.href).searchParams.get('id')||'EMP-1001',e=s.employees.find(x=>x.id===id)||s.employees[0];if(!r||!e)return;const h1=r.querySelector('h1'),eye=h1?.previousElementSibling,desc=h1?.nextElementSibling;if(h1)h1.textContent=e.name;if(eye)eye.textContent=e.id;if(desc)desc.textContent=`${e.designation} · ${e.department} · Manager ${e.manager}`;const metricSec=[...r.querySelectorAll('section')].find(x=>x.classList.contains('xl:grid-cols-4'));const vals=[e.department,e.location,e.joinedAt,e.performance?`${e.performance}%`:'New'];metricSec?.querySelectorAll(':scope > div').forEach((c,i)=>{const ps=c.querySelectorAll('p');if(ps[1])ps[1].textContent=vals[i]});const prof=hcard('Employee profile')?.querySelector('.grid.border-t');const pvals=[e.email,e.phone,e.designation,e.manager,`${e.employmentType} · ${e.workMode}`,e.salaryBand,e.timezone,e.status];prof?.querySelectorAll(':scope > div').forEach((d,i)=>{const ps=d.querySelectorAll('p');if(ps[1])ps[1].textContent=pvals[i]});const d=dialog('Edit employee');if(d){field(d,'Location').value=e.location;field(d,'Manager').value=e.manager;field(d,'Salary band').value=e.salaryBand;once(button(d,'Save changes'),'d2HrEdit',()=>{mutate(st=>{const x=st.employees.find(x=>x.id===e.id);if(x){x.location=field(d,'Location').value;x.manager=field(d,'Manager').value;x.salaryBand=field(d,'Salary band').value;}});close(d);hydrateEmployeeDetails();});}r.dataset.d2HrEmployee=e.id;}

function renderAssets(){const s=read(),tbody=tableBody();rows(tbody,s.assets,(r,x)=>{const c=r.cells,ps=c[0].querySelectorAll('p');if(ps[0])ps[0].textContent=x.asset;if(ps[1])ps[1].textContent=x.type;c[1].textContent=x.employee;c[2].textContent=x.serial;c[3].textContent=x.assignedAt;c[4].textContent=x.condition;badge(c[5].querySelector('span'),x.status);c[6].innerHTML='';if(x.status==='Assigned')c[6].append(makeBtn('Return',()=>{mutate(st=>{const a=st.assets.find(a=>a.id===x.id);if(a)a.status='Returned'});renderAssets();}));else if(x.status==='Returned')c[6].append(makeBtn('Ready stock',()=>{mutate(st=>{const a=st.assets.find(a=>a.id===x.id);if(a)a.status='Ready'});renderAssets();}));else if(x.status==='Repair')c[6].append(makeBtn('Mark repaired',()=>{mutate(st=>{const a=st.assets.find(a=>a.id===x.id);if(a)a.status='Ready'});renderAssets();}));});metrics([s.assets.length,s.assets.filter(x=>x.status==='Assigned').length,s.assets.filter(x=>x.status==='Ready').length,s.assets.filter(x=>x.status==='Repair').length]);addEmployeeOptions(dialog('Assign employee equipment'));}
function initAssets(){const d=dialog('Assign employee equipment'),nameField=field(d,'Asset name'),save=button(d,'Assign asset');const sync=()=>{if(save)save.disabled=!nameField?.value.trim();};once(nameField,'d2HrAssetRequired',sync,'input');once(save,'d2HrAssetCreate',()=>{const name=nameField?.value.trim();if(!name)return;mutate(s=>{const id=field(d,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;s.assets.unshift({id:`AST-${Date.now()}`,employeeId:id,employee:e.name,asset:name,type:field(d,'Asset type')?.value||'Equipment',serial:field(d,'Serial / tag')?.value.trim()||'Pending',assignedAt:new Date().toISOString().slice(0,10),condition:'Excellent',status:'Assigned'});});if(nameField)nameField.value='';field(d,'Serial / tag').value='';sync();close(d);renderAssets();});renderAssets();sync();}
function renderAttendance(){const s=read(),tbody=tableBody();rows(tbody,s.attendance,(r,x)=>{const c=r.cells,ps=c[0].querySelectorAll('p');if(ps[0])ps[0].textContent=x.name;else if(c[0].querySelector('a')){c[0].querySelector('a').textContent=x.name;c[0].querySelector('a').href=employeeHref(x.employeeId);}else c[0].textContent=x.name;if(ps[1])ps[1].textContent=x.employeeId;badge(c[1].querySelector('span'),x.status);c[2].textContent=x.shift;c[3].textContent=x.checkIn;c[4].textContent=x.checkOut;c[5].textContent=x.hours;c[6].textContent=x.note;});metrics([s.attendance.filter(x=>x.status==='Present').length,s.attendance.filter(x=>x.status==='Remote').length,s.attendance.filter(x=>x.status==='Leave').length,s.attendance.filter(x=>x.status==='Late').length]);addEmployeeOptions(dialog('Attendance correction'));}
function initAttendance(){const d=dialog('Attendance correction');once(button(root(),'Export CSV'),'d2HrAttExport',()=>{const s=read();exportCsv('vexlora-attendance.csv',['Employee','Status','Shift','Check in','Check out','Hours'],s.attendance.map(x=>[x.name,x.status,x.shift,x.checkIn,x.checkOut,x.hours]));});once(button(d,'Save correction'),'d2HrAttSave',()=>{mutate(s=>{const id=field(d,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;const status=field(d,'Status')?.value||'Present';s.attendance=[{id:`ATT-${Date.now()}`,employeeId:id,name:e.name,status,shift:'09:00–17:30',checkIn:['Leave','Absent'].includes(status)?'—':'09:00',checkOut:['Leave','Absent'].includes(status)?'—':'17:30',hours:['Leave','Absent'].includes(status)?'—':'8h 30m',note:field(d,'Reason / note')?.value.trim()||'Manual HR correction'},...s.attendance.filter(x=>x.employeeId!==id)];});field(d,'Reason / note').value='';close(d);renderAttendance();});renderAttendance();}

const candidateStages=['Applied','Screen','Interview','Offer','Hired','Rejected'];
function renderCandidates(){const s=read(),q=root().querySelector('input[placeholder="Search candidate, role or source"]')?.value.toLowerCase()||'',sel=[...root().querySelectorAll('select')].find(x=>x.closest('[data-dialog]')==null),stage=sel?.value||'All',items=s.candidates.filter(x=>`${x.name} ${x.role} ${x.email} ${x.source}`.toLowerCase().includes(q)&&(stage==='All'||x.stage===stage)),tbody=tableBody();rows(tbody,items,(r,x)=>{const c=r.cells,ps=c[0].querySelectorAll('p');ps[0].textContent=x.name;ps[1].textContent=x.email;c[1].textContent=x.role;badge(c[2].querySelector('span'),x.stage);c[3].textContent=x.source;c[4].textContent=x.score||'—';c[5].textContent=x.owner;c[6].textContent=x.nextStep;c[7].innerHTML='';if(!['Hired','Rejected'].includes(x.stage)){const i=candidateStages.indexOf(x.stage),next=candidateStages[Math.min(i+1,candidateStages.indexOf('Hired'))];c[7].append(makeBtn('Advance',()=>{mutate(st=>{const a=st.candidates.find(a=>a.id===x.id);if(a)a.stage=next});renderCandidates();}));}});addEmployeeOptions(dialog('Add candidate'));}
function initCandidates(){const d=dialog('Add candidate'),search=root().querySelector('input[placeholder="Search candidate, role or source"]'),stage=[...root().querySelectorAll('select')].find(x=>x.closest('[data-dialog]')==null),nameField=field(d,'Candidate name'),roleField=field(d,'Role'),save=button(d,'Create candidate');const sync=()=>{if(save)save.disabled=!(nameField?.value.trim()&&roleField?.value.trim());};once(nameField,'d2HrCandRequired',sync,'input');once(roleField,'d2HrCandRole',sync,'change');once(search,'d2HrCandSearch',renderCandidates,'input');once(stage,'d2HrCandStage',renderCandidates,'change');once(save,'d2HrCandCreate',()=>{const name=nameField?.value.trim(),role=roleField?.value;if(!name||!role)return;mutate(s=>s.candidates.unshift({id:`CAN-${Date.now().toString().slice(-5)}`,name,role,email:field(d,'Email')?.value.trim(),stage:'Applied',source:field(d,'Source')?.value.trim()||'Careers page',score:0,owner:'People team',nextStep:'Resume review'}));if(nameField)nameField.value='';field(d,'Email').value='';sync();close(d);renderCandidates();});renderCandidates();sync();}
function renderDocuments(){const s=read(),tbody=tableBody();rows(tbody,s.documents,(r,x)=>{const c=r.cells,ps=c[0].querySelectorAll('p');if(ps[0])ps[0].textContent=x.type;else c[0].textContent=x.type;if(ps[1])ps[1].textContent=x.id;c[1].textContent=x.employee;c[2].textContent=x.filename;c[3].textContent=x.expiry;badge(c[4].querySelector('span'),x.status);});metrics([s.documents.length,s.documents.filter(x=>x.status==='Signed').length,s.documents.filter(x=>x.status==='Pending signature').length,s.documents.filter(x=>x.status==='Expiring').length]);addEmployeeOptions(dialog('Add employee document'));}
function initDocuments(){const d=dialog('Add employee document'),typeField=field(d,'Document type'),save=button(d,'Add document');const sync=()=>{if(save)save.disabled=!typeField?.value.trim();};once(typeField,'d2HrDocRequired',sync,'input');once(save,'d2HrDocCreate',()=>{const type=typeField?.value.trim();if(!type)return;mutate(s=>{const id=field(d,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;s.documents.unshift({id:`DOC-${Date.now()}`,employeeId:id,employee:e.name,type,filename:field(d,'Filename')?.value.trim()||`${e.name.toLowerCase().replaceAll(' ','-')}-document.pdf`,status:'Current',expiry:field(d,'Expiry (optional)')?.value||'—'});});['Document type','Filename','Expiry (optional)'].forEach(x=>{const f=field(d,x);if(f)f.value=''});sync();close(d);renderDocuments();});renderDocuments();sync();}
function initExperience(){const b=button(root(),'Launch pulse');once(b,'d2HrPulse',()=>{let p=root().querySelector('[data-d2-hr-pulse]');if(!p){p=document.createElement('div');p.dataset.d2HrPulse='true';p.className='rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm';p.innerHTML='<span class="font-semibold text-success">Pulse launched.</span> A browser-local sample pulse is now marked active for this session; connect the action to your survey provider when integrating the template.';root().insertBefore(p,[...root().children].find(x=>x.tagName==='SECTION')||root().children[1]);}root().dataset.d2HrPulse='true';});}

function renderLearning(){const s=read(),c=hcard('Learning assignments')?.querySelector('.grid.gap-4')||hcard('Learning assignments')?.children?.[1],tpl=c?.firstElementChild?.cloneNode(true);if(c&&tpl){c.innerHTML='';s.learning.forEach(x=>{const n=tpl.cloneNode(true),ps=n.querySelectorAll('p');ps[0].textContent=x.course;const bd=n.querySelector('span.inline-flex');badge(bd,x.status);if(ps[1])ps[1].textContent=`${x.employee} · ${x.category} · Due ${x.due}`;const pct=n.querySelector('.text-lg.font-bold');if(pct)pct.textContent=`${x.progress}%`;const bar=n.querySelector('[role="progressbar"],[data-progress]');if(bar){bar.dataset.value=x.progress;bar.setAttribute('aria-valuenow',x.progress);bar.querySelector('svg rect')?.setAttribute('width',x.progress);const indicator=bar.querySelector('[data-progress-indicator]');if(indicator)indicator.style.width=x.progress+'%';}
const actions=n.querySelector('.mt-3.flex.flex-wrap.gap-2');if(actions){actions.innerHTML='';const advance=status=>{mutate(st=>{const a=st.learning.find(a=>a.id===x.id);if(a){a.status=status;if(status==='Complete')a.progress=100;}});renderLearning();};if(x.status!=='Complete')actions.append(makeBtn('Mark complete',()=>advance('Complete')));if(x.status==='Overdue')actions.append(makeBtn('Acknowledge',()=>advance('In progress'),'ghost'));}c.append(n);});}addEmployeeOptions(dialog('Assign learning'));metrics([s.learning.length,s.learning.filter(x=>x.status==='Complete').length,s.learning.filter(x=>x.status==='In progress').length,s.learning.filter(x=>x.status==='Overdue').length]);}
function initLearning(){const d=dialog('Assign learning'),courseField=field(d,'Course / requirement'),save=button(d,'Assign course');const sync=()=>{if(save)save.disabled=!courseField?.value.trim();};once(courseField,'d2HrLearnRequired',sync,'input');once(save,'d2HrLearnCreate',()=>{const course=courseField?.value.trim();if(!course)return;mutate(s=>{const id=field(d,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;s.learning.unshift({id:`LRN-${Date.now()}`,employeeId:id,employee:e.name,course,category:field(d,'Category')?.value.trim()||'Learning',due:field(d,'Due date')?.value||'TBD',progress:0,status:'Assigned'});});if(courseField)courseField.value='';field(d,'Due date').value='';sync();close(d);renderLearning();});renderLearning();sync();}

function renderLeave(){const s=read(),lc=hcard('Leave requests')?.querySelector('.divide-y')||hcard('Leave requests')?.children?.[1],lt=lc?.firstElementChild?.cloneNode(true);if(lc&&lt){lc.innerHTML='';s.leaveRequests.forEach(x=>{const n=lt.cloneNode(true),ps=n.querySelectorAll('p');ps[0].textContent=x.employee;ps[1].textContent=`${x.type} · ${x.dates} · Approver ${x.approver}`;badge(n.querySelector('span.inline-flex'),x.status);const wrap=n.querySelector('.flex.gap-2');if(wrap){wrap.querySelectorAll('button').forEach(b=>b.remove());const days=wrap.querySelector('span:not(.inline-flex)');if(days)days.textContent=`${x.days}d`;if(x.status==='Pending'){wrap.append(makeBtn('Approve',()=>{mutate(st=>{const a=st.leaveRequests.find(a=>a.id===x.id);if(a)a.status='Approved'});renderLeave();}),makeBtn('Reject',()=>{mutate(st=>{const a=st.leaveRequests.find(a=>a.id===x.id);if(a)a.status='Rejected'});renderLeave();},'ghost'));}}lc.append(n);});}const hc=hcard('Holiday calendar')?.querySelector('.divide-y')||hcard('Holiday calendar')?.children?.[1],ht=hc?.firstElementChild?.cloneNode(true);if(hc&&ht){hc.innerHTML='';s.holidays.forEach(x=>{const n=ht.cloneNode(true),ps=n.querySelectorAll('p');ps[0].textContent=x.name;ps[1].textContent=`${x.region} · ${x.type}`;const date=n.querySelector('span.inline-flex');if(date)date.textContent=x.date;hc.append(n);});}addEmployeeOptions(dialog('New leave request'));metrics([s.leaveRequests.filter(x=>x.status==='Pending').length,s.leaveRequests.filter(x=>x.status==='Approved').length,s.employees.filter(x=>x.status==='on-leave').length,s.holidays.length]);}
function initLeave(){const ld=dialog('New leave request'),hd=dialog('Add holiday'),datesField=field(ld,'Dates / period'),leaveSave=button(ld,'Submit request'),holidayName=field(hd,'Holiday name'),holidayDate=field(hd,'Date'),holidaySave=button(hd,'Create holiday');const syncLeave=()=>{if(leaveSave)leaveSave.disabled=!datesField?.value.trim();},syncHoliday=()=>{if(holidaySave)holidaySave.disabled=!(holidayName?.value.trim()&&holidayDate?.value);};once(datesField,'d2HrLeaveRequired',syncLeave,'input');once(holidayName,'d2HrHolidayName',syncHoliday,'input');once(holidayDate,'d2HrHolidayDate',syncHoliday,'input');once(leaveSave,'d2HrLeaveCreate',()=>{const dates=datesField?.value.trim();if(!dates)return;mutate(s=>{const id=field(ld,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;s.leaveRequests.unshift({id:`LEV-${Date.now().toString().slice(-6)}`,employeeId:id,employee:e.name,type:field(ld,'Leave type')?.value||'Annual',dates,days:Math.max(1,Number(field(ld,'Days')?.value)||1),status:'Pending',approver:e.manager});});if(datesField)datesField.value='';field(ld,'Days').value=1;syncLeave();close(ld);renderLeave();});once(holidaySave,'d2HrHolidayCreate',()=>{const name=holidayName?.value.trim(),date=holidayDate?.value;if(!name||!date)return;mutate(s=>s.holidays.unshift({id:`HOL-${Date.now()}`,name,date,region:field(hd,'Region')?.value.trim()||'All regions',type:field(hd,'Type')?.value||'Regional'}));if(holidayName)holidayName.value='';if(holidayDate)holidayDate.value='';syncHoliday();close(hd);renderLeave();});renderLeave();syncLeave();syncHoliday();}

function renderLifecycle(){const s=read(),c=hcard('Lifecycle control board')?.querySelector('.grid.gap-4')||hcard('Lifecycle control board')?.children?.[1],tpl=c?.firstElementChild?.cloneNode(true);if(c&&tpl){c.innerHTML='';s.lifecycle.forEach(x=>{const n=tpl.cloneNode(true),ps=n.querySelectorAll('p');ps[0].textContent=x.employee;const badges=n.querySelectorAll('span.inline-flex');badge(badges[0],x.type);badge(badges[1],x.status);if(ps[1])ps[1].textContent=`Owner ${x.owner} · Started ${x.startDate}`;const pct=n.querySelector('.text-lg.font-bold');if(pct)pct.textContent=`${x.progress}%`;const bs=[...n.querySelectorAll('button')];[['Payroll','payrollReady'],['Equipment','equipmentReady'],['Documents','documentsReady'],['Access','accessReady']].forEach(([label,key],i)=>{const b=bs[i];if(!b)return;const bd=b.querySelector('span.inline-flex');badge(bd,x[key]?'Ready':'Pending');b.addEventListener('click',()=>{mutate(st=>{const a=st.lifecycle.find(a=>a.id===x.id);if(!a)return;a[key]=!a[key];const vals=['payrollReady','equipmentReady','documentsReady','accessReady'].map(k=>a[k]);a.progress=vals.filter(Boolean).length*25;a.status=a.progress===100?'Complete':a.progress>0?'In progress':'Not started';});renderLifecycle();});});c.append(n);});}addEmployeeOptions(dialog('Open employee lifecycle'));metrics([s.lifecycle.filter(x=>x.type==='Onboarding'&&x.status!=='Complete').length,s.lifecycle.filter(x=>x.type==='Offboarding'&&x.status!=='Complete').length,s.lifecycle.filter(x=>x.status==='Blocked').length,s.lifecycle.filter(x=>x.status==='Complete').length]);}
function initLifecycle(){const d=dialog('Open employee lifecycle');once(button(d,'Create workflow'),'d2HrLifeCreate',()=>{mutate(s=>{const id=field(d,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;s.lifecycle.unshift({id:`LIFE-${Date.now()}`,employeeId:id,employee:e.name,type:field(d,'Lifecycle')?.value||'Onboarding',startDate:field(d,'Start date')?.value||new Date().toISOString().slice(0,10),owner:field(d,'Owner')?.value.trim()||e.manager,progress:0,status:'Not started',payrollReady:false,equipmentReady:false,documentsReady:false,accessReady:false});});close(d);renderLifecycle();});renderLifecycle();}

function renderOrganization(){const s=read(),tbody=tableBody();rows(tbody,s.departments,(r,x)=>{const c=r.cells,ps=c[0].querySelectorAll('p');ps[0].textContent=x.name;ps[1].textContent=x.location;c[1].textContent=x.lead;c[2].textContent=x.headcount;c[3].textContent=x.openRoles;c[4].textContent=x.costCenter;badge(c[5].querySelector('span'),x.status);});const jc=hcard('Job architecture')?.querySelector('.grid.border-t'),tpl=jc?.firstElementChild?.cloneNode(true);if(jc&&tpl){jc.innerHTML='';s.designations.forEach(x=>{const n=tpl.cloneNode(true),ps=n.querySelectorAll('p'),sp=n.querySelectorAll('.mt-4 span');ps[0].textContent=x.title;ps[1].textContent=`${x.family} · ${x.department}`;badge(n.querySelector('span.inline-flex'),x.status);if(sp[0])sp[0].textContent=`${x.track} · ${x.level}`;if(sp[1])sp[1].textContent=`${x.employees} employees`;jc.append(n);});}addEmployeeOptions(dialog('Add designation'));metrics([s.departments.length,s.designations.length,new Set(s.employees.map(x=>x.manager)).size,s.departments.reduce((a,x)=>a+x.openRoles,0)]);}
function initOrganization(){const dd=dialog('Add department'),gd=dialog('Add designation'),deptName=field(dd,'Department name'),deptSave=button(dd,'Create department'),desigTitle=field(gd,'Job title')||field(gd,'Title'),desigSave=button(gd,'Create designation');const syncDept=()=>{if(deptSave)deptSave.disabled=!deptName?.value.trim();},syncDesig=()=>{if(desigSave)desigSave.disabled=!desigTitle?.value.trim();};once(deptName,'d2HrDeptRequired',syncDept,'input');once(desigTitle,'d2HrDesigRequired',syncDesig,'input');once(deptSave,'d2HrDeptCreate',()=>{const name=deptName?.value.trim();if(!name)return;mutate(s=>s.departments.unshift({id:`DEP-${Date.now().toString().slice(-5)}`,name,lead:field(dd,'Department lead')?.value.trim()||'Unassigned',headcount:0,openRoles:0,location:(field(dd,'Primary location')||field(dd,'Location'))?.value.trim()||'Global',costCenter:field(dd,'Cost center')?.value.trim()||'Unassigned',status:'Healthy'}));['Department name','Department lead','Primary location','Location','Cost center'].forEach(x=>{const f=field(dd,x);if(f)f.value=''});syncDept();close(dd);renderOrganization();});once(desigSave,'d2HrDesigCreate',()=>{const title=desigTitle?.value.trim();if(!title)return;mutate(s=>s.designations.unshift({id:`DSG-${Date.now().toString().slice(-5)}`,title,family:field(gd,'Job family')?.value.trim()||'General',level:field(gd,'Level')?.value||'L1',department:field(gd,'Department')?.value||'General',employees:0,track:'IC',status:'Active'}));if(desigTitle)desigTitle.value='';const fam=field(gd,'Job family');if(fam)fam.value='';syncDesig();close(gd);renderOrganization();});renderOrganization();syncDept();syncDesig();}
function renderPayroll(){const s=read(),tbody=tableBody();rows(tbody,s.payroll,(r,x)=>{const c=r.cells,ps=c[0].querySelectorAll('p');ps[0].textContent=x.employee;ps[1].textContent=x.id;c[1].textContent=money(x.gross);c[2].textContent=money(x.variablePay);c[3].textContent=`-${money(x.deductions)}`;c[4].textContent=money(x.net);badge(c[5].querySelector('span'),x.status);c[6].innerHTML='';c[6].append(makeBtn(x.status==='Review'?'Mark ready':'Review',()=>{mutate(st=>{const a=st.payroll.find(a=>a.id===x.id);if(a)a.status=x.status==='Review'?'Ready':'Review'});renderPayroll();},x.status==='Review'?'outline':'ghost'));});metrics([money(s.payroll.reduce((a,x)=>a+x.gross,0)),money(s.payroll.reduce((a,x)=>a+x.net,0)),money(s.payroll.reduce((a,x)=>a+x.variablePay,0)),`${s.payroll.filter(x=>x.status==='Ready').length} / ${s.payroll.length}`]);const ph=byText(root(),'h3','Payroll preview')?.parentElement?.parentElement;const bd=ph?.querySelector('span.inline-flex');badge(bd,s.payrollPreviewedAt?`Previewed ${s.payrollPreviewedAt}`:'Not previewed');}
function initPayroll(){once(button(root(),'Run payroll preview'),'d2HrPayrollPreview',()=>{mutate(s=>s.payrollPreviewedAt=new Date().toLocaleString());renderPayroll();});renderPayroll();}
const reviewStages=['Draft','Self review','Manager review','Calibration','Complete'];
function renderPerformance(){const s=read(),c=hcard('Review cycle')?.querySelector('.grid.gap-4')||hcard('Review cycle')?.children?.[1],tpl=c?.firstElementChild?.cloneNode(true);if(c&&tpl){c.innerHTML='';s.reviews.forEach(x=>{const n=tpl.cloneNode(true),ps=n.querySelectorAll('p');ps[0].textContent=x.employee;badge(n.querySelector('span.inline-flex'),x.status);ps[1].textContent=`${x.department} · ${x.cycle} · Goals ${x.goalProgress}% · Potential ${x.potential}`;const rate=n.querySelector('.text-lg.font-bold');if(rate)rate.textContent=x.rating?`${x.rating}/5`:'—';const b=button(n,'Advance'),i=reviewStages.indexOf(x.status);if(b){b.disabled=i>=reviewStages.length-1;b.addEventListener('click',()=>{mutate(st=>{const a=st.reviews.find(a=>a.id===x.id);if(a)a.status=reviewStages[Math.min(i+1,reviewStages.length-1)]});renderPerformance();});}c.append(n);});}addEmployeeOptions(dialog('Start performance review'));const rated=s.reviews.filter(x=>x.rating>0),avg=rated.reduce((a,x)=>a+x.rating,0)/Math.max(1,rated.length),goals=Math.round(s.reviews.reduce((a,x)=>a+x.goalProgress,0)/Math.max(1,s.reviews.length));metrics([s.reviews.length,`${avg.toFixed(1)} / 5`,`${goals}%`,s.reviews.filter(x=>x.potential==='High').length]);}
function initPerformance(){const d=dialog('Start performance review');once(button(d,'Create review'),'d2HrReviewCreate',()=>{mutate(s=>{const id=field(d,'Employee')?.value,e=s.employees.find(x=>x.id===id);if(!e)return;s.reviews.unshift({id:`PER-${Date.now()}`,employeeId:id,employee:e.name,department:e.department,cycle:field(d,'Cycle')?.value.trim()||'H2 2026',rating:0,goalProgress:0,potential:'Medium',status:'Draft'});});close(d);renderPerformance();});renderPerformance();}
function renderRecruitment(){const s=read(),c=hcard('Hiring portfolio')?.querySelector('.grid.border-t'),tpl=c?.firstElementChild?.cloneNode(true);if(c&&tpl){c.innerHTML='';s.jobs.forEach(x=>{const n=tpl.cloneNode(true),ps=n.querySelectorAll('p');ps[0].textContent=x.role;ps[1].textContent=`${x.department} · ${x.location}`;badge(n.querySelector('span.inline-flex'),x.stage);const stats=n.querySelectorAll('.mt-4 .p-3 p');if(stats[1])stats[1].textContent=x.applicants;if(stats[3])stats[3].textContent=x.targetHires;if(stats[5])stats[5].textContent=x.owner;c.append(n);});}addEmployeeOptions(dialog('Open role'));metrics([s.jobs.length,s.candidates.filter(x=>!['Rejected','Hired'].includes(x.stage)).length,s.candidates.filter(x=>x.stage==='Interview').length,s.candidates.filter(x=>x.stage==='Offer').length]);}
function initRecruitment(){const d=dialog('Open role'),roleField=field(d,'Role'),save=button(d,'Create role');const sync=()=>{if(save)save.disabled=!roleField?.value.trim();};once(roleField,'d2HrJobRequired',sync,'input');once(save,'d2HrJobCreate',()=>{const role=roleField?.value.trim();if(!role)return;mutate(s=>s.jobs.unshift({id:`JOB-${Date.now().toString().slice(-5)}`,role,department:field(d,'Department')?.value||'General',location:field(d,'Location')?.value.trim()||'Remote',owner:field(d,'Recruiting owner')?.value.trim()||'People team',applicants:0,stage:'Sourcing',targetHires:1}));if(roleField)roleField.value='';sync();close(d);renderRecruitment();});renderRecruitment();sync();}
function initInbox(){const s=read(),r=root();r?.querySelectorAll('button').forEach(b=>{const text=b.textContent.trim();if(!['Approve','Reject','Mark ready','Mark hired','Acknowledge'].includes(text))return;once(b,'d2HrInbox',()=>{const card=b.closest('.border-b.border-border.p-4'),title=card?.querySelector('p.text-sm.font-semibold')?.textContent||'';mutate(st=>{if(title.startsWith('Leave · ')){const name=title.slice(8),x=st.leaveRequests.find(a=>a.employee===name&&a.status==='Pending');if(x)x.status=text==='Approve'?'Approved':'Rejected';}else if(title.startsWith('Payroll · ')){const name=title.slice(10),x=st.payroll.find(a=>a.employee===name&&a.status==='Review');if(x)x.status='Ready';}else if(title.startsWith('Offer · ')){const name=title.slice(8),x=st.candidates.find(a=>a.name===name&&a.stage==='Offer');if(x)x.stage='Hired';}else if(title.startsWith('Compliance · ')){const name=title.slice(13),x=st.learning.find(a=>a.employee===name&&a.status==='Overdue');if(x)x.status='In progress';}});card?.remove();r.dataset.d2HrInboxAction=text;});});}

export function prepareD2HrInteractions(){prepareEmployees();}
export function initD2HrInteractions(){if(!routes.has(route()))return;({
 '/hr/assets':initAssets,'/hr/attendance':initAttendance,'/hr/candidates':initCandidates,'/hr/documents':initDocuments,'/hr/employees':initEmployees,'/hr/employees/[id]':hydrateEmployeeDetails,'/hr/employees/create':initEmployeeCreate,'/hr/experience':initExperience,'/hr/inbox':initInbox,'/hr/learning':initLearning,'/hr/leave':initLeave,'/hr/lifecycle':initLifecycle,'/hr/organization':initOrganization,'/hr/payroll':initPayroll,'/hr/performance':initPerformance,'/hr/recruitment':initRecruitment,
 }[route()]?.());document.documentElement.dataset.d2HrReady='true';}
