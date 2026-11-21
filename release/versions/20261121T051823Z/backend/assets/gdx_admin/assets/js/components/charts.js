import { renderChart } from './chart-renderer.js';

function state(root,name){ root.querySelectorAll('[data-chart-state]').forEach(el=>el.hidden=el.dataset.chartState!==name); }

function parseConfig(root){
  const node=root.querySelector('[data-vex-chart-config]');
  if(!node)return null;
  try{const cfg=JSON.parse(node.textContent||'{}');root.__vexChartConfig=cfg;return cfg}catch{return null}
}

function showTooltip(root,html,event){
  const tip=root.querySelector('[data-vex-chart-tooltip]');
  if(!tip)return;
  tip.innerHTML=html||'';
  if(!html){tip.hidden=true;tip.classList.add('hidden');return;}
  tip.hidden=false;tip.classList.remove('hidden');
  const box=root.getBoundingClientRect();
  const x=Math.min(Math.max(8,event.clientX-box.left+12),Math.max(8,box.width-tip.offsetWidth-8));
  const y=Math.min(Math.max(8,event.clientY-box.top+12),Math.max(8,box.height-tip.offsetHeight-8));
  tip.style.left=`${x}px`; tip.style.top=`${y}px`;
}
function hideTooltip(root){const tip=root.querySelector('[data-vex-chart-tooltip]');if(tip){tip.hidden=true;tip.classList.add('hidden')}}
function svgPoint(svg,event){const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;return {x:(event.clientX-r.left)/Math.max(1,r.width)*vb.width,y:(event.clientY-r.top)/Math.max(1,r.height)*vb.height}}
function nearestIndexCartesian(cfg,p){const {left=28,right=28,w=640}=cfg.viewBox||{};const n=cfg.data?.length||0;if(!n)return -1;if(cfg.pointCoordinates){const value=cfg.vertical?p.y:p.x;return cfg.pointCoordinates.reduce((best,v,i)=>Math.abs(v-value)<Math.abs(cfg.pointCoordinates[best]-value)?i:best,0)}if(cfg.vertical){const {top=12,bottom=28,h=280}=cfg.viewBox||{};const ih=h-top-bottom;return Math.min(n-1,Math.max(0,Math.floor((p.y-top)/Math.max(1,ih)*n)))}const iw=w-left-right;const t=Math.min(1,Math.max(0,(p.x-left)/Math.max(1,iw)));return Math.round(t*(n-1))}
function activateIndex(root,cfg,index,event){
  root.querySelectorAll('[data-point-index]').forEach(el=>{const active=Number(el.dataset.pointIndex)===index; if(el.hasAttribute('data-chart-point'))el.style.opacity=active?'1':'0'; else el.style.opacity=active?'1':'0.78';});
  const cursor=root.querySelector('[data-chart-cursor]');
  if(cursor&&cfg.kind==='cartesian'&&!cfg.vertical){const {left=28,right=28,w=640}=cfg.viewBox||{};const n=cfg.data?.length||0;const x=cfg.pointCoordinates?.[index]??left+(n<=1?(w-left-right)/2:index*(w-left-right)/Math.max(1,n-1));cursor.setAttribute('x1',x);cursor.setAttribute('x2',x);cursor.parentElement.removeAttribute('hidden');}
  showTooltip(root,cfg.tooltips?.[index]||'',event);
}
function resetChart(root){root.querySelectorAll('[data-point-index]').forEach(el=>{if(el.hasAttribute('data-chart-point'))el.style.opacity='0';else el.style.opacity='1'});const hover=root.querySelector('[data-chart-hover]');if(hover)hover.setAttribute('hidden','');hideTooltip(root)}
function bindCartesian(root,cfg){const svg=root.querySelector('[data-chart-svg]');if(!svg)return;svg.addEventListener('pointermove',e=>{const i=nearestIndexCartesian(cfg,svgPoint(svg,e));if(i>=0)activateIndex(root,cfg,i,e)});svg.addEventListener('pointerleave',()=>resetChart(root));svg.addEventListener('focusout',()=>resetChart(root));}
function bindPie(root,cfg){const svg=root.querySelector('[data-chart-svg]');if(!svg)return;svg.addEventListener('pointermove',e=>{const slice=e.target.closest('[data-chart-slice]');if(!slice){resetChart(root);return}const i=Number(slice.dataset.pointIndex);root.querySelectorAll('[data-chart-slice]').forEach(s=>s.style.opacity=s===slice?'1':'0.55');showTooltip(root,cfg.tooltips?.[i]||'',e)});svg.addEventListener('pointerleave',()=>resetChart(root));}
function bindRadar(root,cfg){const svg=root.querySelector('[data-chart-svg]');if(!svg)return;svg.addEventListener('pointermove',e=>{const p=svgPoint(svg,e),{cx=180,cy=138}=cfg.viewBox||{},n=cfg.data?.length||0;if(!n)return;let a=Math.atan2(p.y-cy,p.x-cx)+Math.PI/2;if(a<0)a+=Math.PI*2;const i=Math.round(a/(Math.PI*2)*n)%n;activateIndex(root,cfg,i,e)});svg.addEventListener('pointerleave',()=>resetChart(root));}

function genericTooltip(label,series,row){
  const items=(series||[]).map(s=>`<div class="flex items-center justify-between gap-4 text-compact"><span class="text-muted-foreground">${String(s.name||s.dataKey||'Value')}</span><span class="font-semibold tabular-nums text-foreground">${String(row?.[s.dataKey]??'')}</span></div>`).join('');
  return `<div class="min-w-36"><p class="mb-2 text-compact font-semibold text-foreground">${String(label??'')}</p><div class="space-y-1.5">${items}</div></div>`;
}
function smoothPath(points){if(!points.length)return'';if(points.length===1)return`M ${points[0][0]} ${points[0][1]}`;let d=`M ${points[0][0]} ${points[0][1]}`;for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+=` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;}return d}
function updateCartesian(root,newData){
  const cfg=root.__vexChartConfig||parseConfig(root); if(!cfg||cfg.kind!=='cartesian'||cfg.vertical)return;
  cfg.data=newData; const {w=640,left=36,right=12,top=12,bottom=28,h=280}=cfg.viewBox||{}; const iw=w-left-right,ih=h-top-bottom;
  if(cfg.source){cfg.tooltips=newData.map(row=>genericTooltip(row?.[cfg.labelKey],cfg.series,row));renderChart(root,cfg);return;}
  const x=i=>left+(newData.length<=1?iw/2:i*iw/Math.max(1,newData.length-1));
  const domainFor=s=>cfg.axisDomains?.[String(s.axisId??'__default')]||cfg.axisDomains?.__default||[0,1];
  const y=(v,dom)=>top+ih-(Number(v)-dom[0])/(dom[1]-dom[0]||1)*ih;
  (cfg.series||[]).forEach((s,si)=>{
    if(s.kind==='Bar')return;
    const dom=domainFor(s),arr=newData.map((d,i)=>[x(i),y(Number(d[s.dataKey])||0,dom)]),pts=arr.map(p=>`${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const line=root.querySelector(`[data-chart-line][data-series-index="${si}"]`); if(line){if(line.tagName.toLowerCase()==='path')line.setAttribute('d',smoothPath(arr));else line.setAttribute('points',pts);}
    const circles=[...root.querySelectorAll(`circle[data-chart-point][data-series-index="${si}"]`)];circles.forEach((c,i)=>{if(!newData[i])return;c.setAttribute('cx',x(i).toFixed(1));c.setAttribute('cy',y(Number(newData[i][s.dataKey])||0,dom).toFixed(1));});
  });
  cfg.tooltips=newData.map(row=>genericTooltip(row?.[cfg.labelKey],cfg.series,row));
}
export function updateChartData(root,newData){if(root&&Array.isArray(newData))updateCartesian(root,newData)}

function initLiveChart(root){
  if(root.dataset.chartReady==='true')return;const cfg=parseConfig(root);if(!cfg)return;
  root.dataset.chartReady='true';renderChart(root,cfg);
  if(cfg.kind==='pie')bindPie(root,cfg);else if(cfg.kind==='radar')bindRadar(root,cfg);else bindCartesian(root,cfg);
  if(cfg.source){let frame=0,lastSize='';const redraw=()=>{const size=`${root.clientWidth}x${root.clientHeight}`;if(size===lastSize)return;lastSize=size;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>renderChart(root,cfg))};const observer=new ResizeObserver(redraw);observer.observe(root);root.__vexChartObserver=observer;document.fonts.ready.then(()=>renderChart(root,cfg));}
}

export function initChartPrimitives(){
  document.querySelectorAll('[data-chart]').forEach(root=>{state(root,root.dataset.chartState||'ready');});
  document.querySelectorAll('[data-vex-chart]').forEach(initLiveChart);
  window.VexloraCharts={updateChartData};
  document.addEventListener('vexlora:chart-state',event=>{const root=document.querySelector(event.detail?.target);if(root)state(root,event.detail?.state||'ready');});
}
