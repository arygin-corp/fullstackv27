const text=(row,index)=>row.cells[index]?.textContent.trim()||'';
const exactText=(root,re)=>[...root.querySelectorAll('div,span,p')].find((el)=>re.test(el.textContent.trim()) && ![...el.children].some((c)=>re.test(c.textContent.trim())));
function csvCell(value){return `"${String(value??'').replaceAll('"','""')}"`;}
function exactOperationalCsv(current,rows){
  const specs={
    '/hr/employees':{header:['Employee','Email','Department','Designation','Manager','Status','Location']},
    '/support/tickets':{header:['Ticket','Subject','Customer','Priority','Status','Assignee','SLA']},
  };
  const spec=specs[current];if(!spec)return null;
  const body=rows.map((row)=>{try{const parsed=JSON.parse(row.dataset.csvRow||'null');if(Array.isArray(parsed)&&parsed.length===spec.header.length)return parsed;}catch{}return null;}).filter(Boolean);
  return [spec.header,...body].map((line)=>line.map(csvCell).join(','));
}
function downloadCsv(root,rows){
  const table=root.querySelector('table'); if(!table)return;
  const current=document.body?.dataset?.currentRoute;
  let csv=exactOperationalCsv(current,rows);
  if(!csv){
    const visibleHeads=[...table.tHead?.rows?.[0]?.cells||[]].filter((c)=>!c.hidden);
    const indexes=visibleHeads.map((c)=>c.cellIndex).filter((i)=>i>=0);
    csv=[indexes.map((i)=>csvCell((table.tHead.rows[0].cells[i]?.textContent||'').trim())).join(',')];
    rows.filter((r)=>!r.hidden).forEach((r)=>csv.push(indexes.map((i)=>csvCell((r.cells[i]?.textContent||'').trim())).join(',')));
  }
  const blob=new Blob([csv.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;const filename=current==='/projects/tasks'?'vexlora-project-tasks.csv':current==='/crm/customers'?(root.dataset.d2CrmTable==='contacts'?'vexlora-crm-contacts.csv':'vexlora-customers.csv'):current==='/support/tickets'?'vexlora-support-tickets.csv':current?.startsWith('/finance/invoices')?'vexlora-invoices.csv':current==='/hr/employees'?'vexlora-employees.csv':current==='/ecommerce/orders'?'vexlora-orders.csv':current==='/ecommerce/products'?'vexlora-products.csv':'vexlora-export.csv';a.download=filename;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
}
function initTable(root){
  if(root.dataset.dataTableReady==='true')return; root.dataset.dataTableReady='true';
  const table=root.querySelector('table'),body=table?.tBodies[0];if(!table||!body)return;
  const rows=[...body.rows].filter((r)=>r.cells.length>1 && !r.querySelector('[colspan]'));
  const mobile=table.closest('.overflow-auto')?.previousElementSibling;
  const cards=mobile?.classList.contains('md:hidden')?[...mobile.children]:[];
  const mobileByRow=new Map(rows.map((row,i)=>[row,cards[i]]));
  const search=[...root.querySelectorAll('input')].find((i)=>i.placeholder?.toLowerCase().includes('search'));
  const selects=[...root.querySelectorAll('[data-select]')];
  const pageSize=selects.find((s)=>s.querySelector('[data-select-trigger]')?.getAttribute('aria-label')==='Rows per page');
  const filters=selects.filter((s)=>s!==pageSize);
  const status=exactText(root,/^\d+ rows?$/); const pageStatus=exactText(root,/^Page \d+ of \d+$/);
  const first=root.querySelector('button[aria-label="First page"]'),prev=root.querySelector('button[aria-label="Previous page"]'),next=root.querySelector('button[aria-label="Next page"]'),last=root.querySelector('button[aria-label="Last page"]');
  let page=0,sortIndex=-1,sortDir=1;
  const getPageSize=()=>Math.max(1,Number(pageSize?.dataset.value||10));
  const matchesFilters=(row)=>filters.every((sel)=>{const v=sel.dataset.value||'__all';return v==='__all'||row.textContent.toLowerCase().includes(v.toLowerCase());});
  const filtered=()=>{const q=(search?.value||'').trim().toLowerCase();return rows.filter((row)=>(!q||row.textContent.toLowerCase().includes(q))&&matchesFilters(row));};
  const ordered=()=>{const out=filtered();if(sortIndex<0)return out;return out.sort((a,b)=>text(a,sortIndex).localeCompare(text(b,sortIndex),undefined,{numeric:true,sensitivity:'base'})*sortDir);};
  const render=()=>{const all=ordered(),size=getPageSize(),pages=Math.max(1,Math.ceil(all.length/size));page=Math.min(page,pages-1);body.append(...all);rows.forEach((r)=>r.hidden=true);cards.forEach(c=>c.hidden=true);all.slice(page*size,(page+1)*size).forEach((r)=>{r.hidden=false;const card=mobileByRow.get(r);if(card){mobile.append(card);card.hidden=false;}});if(status)status.textContent=`${all.length} row${all.length===1?'':'s'}`;if(pageStatus)pageStatus.textContent=`Page ${all.length?page+1:1} of ${pages}`;[prev,first].forEach((b)=>{if(b)b.disabled=page<=0});[next,last].forEach((b)=>{if(b)b.disabled=page>=pages-1||!all.length});root.dataset.empty=String(!all.length);};
  search?.addEventListener('input',()=>{page=0;render()});
  filters.forEach((s)=>s.addEventListener('vexlora:select',()=>{page=0;render()}));pageSize?.addEventListener('vexlora:select',()=>{page=0;render()});
  prev?.addEventListener('click',()=>{page=Math.max(0,page-1);render()});next?.addEventListener('click',()=>{page++;render()});first?.addEventListener('click',()=>{page=0;render()});last?.addEventListener('click',()=>{page=Math.max(0,Math.ceil(ordered().length/getPageSize())-1);render()});
  [...table.querySelectorAll('thead th')].forEach((th,index)=>{const panel=th.querySelector('[data-popover-panel]');if(!panel)return;const asc=[...panel.querySelectorAll('button')].find((b)=>b.textContent.trim()==='Ascending'),desc=[...panel.querySelectorAll('button')].find((b)=>b.textContent.trim()==='Descending'),hide=[...panel.querySelectorAll('button')].find((b)=>b.textContent.trim()==='Hide column');asc?.addEventListener('click',()=>{sortIndex=index;sortDir=1;page=0;render()});desc?.addEventListener('click',()=>{sortIndex=index;sortDir=-1;page=0;render()});hide?.addEventListener('click',()=>{th.hidden=true;rows.forEach((r)=>{if(r.cells[index])r.cells[index].hidden=true;});});});
  const columnsButton=[...root.querySelectorAll('button')].find((b)=>b.textContent.trim()==='Columns');const columnPanel=columnsButton?document.querySelector(columnsButton.dataset.popoverTrigger||''):null;
  if(columnPanel){[...columnPanel.querySelectorAll('button[role="menuitemcheckbox"]')].forEach((b)=>{b.addEventListener('click',()=>{const label=b.textContent.trim(),headers=[...table.querySelectorAll('thead th')],index=headers.findIndex((h)=>h.textContent.trim().startsWith(label));if(index<0)return;const checked=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',String(checked));headers[index].hidden=!checked;rows.forEach((r)=>{if(r.cells[index])r.cells[index].hidden=!checked;});});});}
  const exportBtn=[...root.querySelectorAll('button')].find((b)=>b.textContent.trim()==='Export CSV');exportBtn?.addEventListener('click',()=>downloadCsv(root,rows));
  render();
}
function discoverGeneratedTables(){
  document.querySelectorAll('[data-data-table]').forEach(initTable);
  document.querySelectorAll('table').forEach((table)=>{const root=table.closest('.overflow-hidden.rounded-lg.border.border-border.bg-card');if(root&&root.querySelector('input[placeholder*="Search"]')){root.dataset.dataTable='generated';initTable(root);}});
}
export function initDataTables(){ discoverGeneratedTables(); }
