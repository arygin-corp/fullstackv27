import {line, area, curveMonotoneX, curveMonotoneY, curveLinear, curveStep, curveStepAfter, curveStepBefore, curveBasis, curveNatural, arc} from '../vendor/chart-math.js';

const NS='http://www.w3.org/2000/svg';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attrs=p=>Object.entries(p).filter(([,v])=>v!==undefined&&v!==null&&v!==false).map(([k,v])=>`${k}="${esc(v)}"`).join(' ');
const tag=(name,p,body='')=>`<${name} ${attrs(p)}>${body}</${name}>`;
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const percent=(v,full,fallback)=>typeof v==='string'&&v.endsWith('%')?parseFloat(v)*full/100:finite(v)?Number(v):fallback;
const flat=x=>Array.isArray(x)?x.flatMap(flat):x?[x]:[];
const svgNames={stopColor:'stop-color',stopOpacity:'stop-opacity',strokeWidth:'stroke-width',fillOpacity:'fill-opacity'};
function defsNode(node,prefix){
 if(!node||!['defs','linearGradient','radialGradient','stop','filter','feDropShadow'].includes(node.type))return '';
 const {children,...p}=node.props||{};if(p.id)p.id=prefix+p.id;
 return tag(node.type,Object.fromEntries(Object.entries(p).map(([k,v])=>[svgNames[k]||k,v])),flat(children).map(n=>defsNode(n,prefix)).join(''));
}
function color(value,prefix){return typeof value==='string'?value.replace(/url\(#([^)]*)\)/g,(_,id)=>`url(#${prefix}${id})`):value}
function legendColor(series,spec){
 const value=series.props.stroke||series.props.fill,id=value?.match(/url\(#([^)]*)\)/)?.[1];
 if(!id)return value;
 const gradients=spec.defs.flatMap(d=>flat(d.props.children));
 return flat(gradients.find(d=>d.props.id===id)?.props.children)[0]?.props.stopColor||'var(--chart-1)';
}
function curve(type,vertical){return ({monotone:vertical?curveMonotoneY:curveMonotoneX,linear:curveLinear,step:curveStep,stepAfter:curveStepAfter,stepBefore:curveStepBefore,basis:curveBasis,natural:curveNatural})[type]||curveLinear}
function text(x,y,value,p={}){return tag('text',{x,y,fill:'var(--muted-foreground)','font-size':12,'text-anchor':'middle',...p},esc(value))}
function categoryText(x,y,value,width,size,props={}){
 const words=String(value).split(/\s+/),lines=[''];
 const context=document.createElement('canvas').getContext('2d'),font=getComputedStyle(document.body);context.font=`${font.fontSize} ${font.fontFamily}`;
 for(const word of words){const last=lines.length-1,next=lines[last]?lines[last]+' '+word:word;if(lines[last]&&context.measureText(next).width>width)lines.push(word);else lines[last]=next;}
 return tag('text',{x,y,fill:'var(--muted-foreground)','font-size':size,'text-anchor':'end',...props},lines.map((line,i)=>tag('tspan',{x,dy:i===0?`${.355-(lines.length-1)*.5}em`:'1em'},esc(line))).join(''));
}
function legend(root,cfg,margin){
 let el=root.querySelector('[data-chart-legend]');
 if(!cfg.source.legend){el?.remove();return 0}
 if(!el){el=document.createElement('div');el.dataset.chartLegend='';root.prepend(el)}
 const props=cfg.source.legend.props||{},top=props.verticalAlign!=='bottom';
 Object.assign(el.style,{position:'absolute',left:`${margin.left}px`,right:`${margin.right}px`,top:top?`${margin.top}px`:'auto',bottom:top?'auto':`${margin.bottom}px`,fontSize:'13px',lineHeight:'18px',textAlign:props.align||'right',pointerEvents:'none',zIndex:'1'});
 el.className='text-muted-foreground';
 const series=[...cfg.source.series].sort((a,b)=>{const x=String(a.props.name||a.props.dataKey),y=String(b.props.name||b.props.dataKey);return x<y?-1:x>y?1:0});
 el.innerHTML=series.map(s=>`<span style="display:inline-block;margin-right:10px;white-space:nowrap"><span style="display:inline-block;width:7px;height:7px;margin-right:4px;border-radius:50%;background:${esc(legendColor(s,cfg.source))}"></span><span class="text-compact font-medium">${esc(s.props.name||s.props.dataKey)}</span></span>`).join('');
 return cfg.source.legend.type==='ChartSeriesLegend'?28:(props.height||el.offsetHeight);
}
function renderCartesian(root,cfg,w,h,prefix){
 const spec=cfg.source,data=cfg.data||[],vertical=spec.layout==='vertical';
 const margin={top:5,right:5,bottom:5,left:5,...spec.margin};
 const legendHeight=legend(root,cfg,margin);
 const axes=spec.axes||[],xAxes=axes.filter(a=>a.type==='XAxis'),yAxes=axes.filter(a=>a.type==='YAxis');
 const left=margin.left+yAxes.filter(a=>!a.props.hide&&a.props.orientation!=='right').reduce((n,a)=>n+(a.props.width??60),0);
 const right=margin.right+yAxes.filter(a=>!a.props.hide&&a.props.orientation==='right').reduce((n,a)=>n+(a.props.width??60),0);
 const top=margin.top+(spec.legend?.props?.verticalAlign==='bottom'?0:legendHeight);
 const bottom=margin.bottom+xAxes.filter(a=>!a.props.hide).reduce((n,a)=>n+(a.props.height??30),0)+(spec.legend?.props?.verticalAlign==='bottom'?legendHeight:0);
 const iw=Math.max(1,w-left-right),ih=Math.max(1,h-top-bottom);
 const bars=spec.series.filter(s=>s.type==='Bar'),band=(vertical?ih:iw)/Math.max(1,data.length);
 const category=(i)=>bars.length?(vertical?top:left)+(i+.5)*band:(vertical?top:left)+(data.length<=1?(vertical?ih:iw)/2:i*(vertical?ih:iw)/Math.max(1,data.length-1));
 const axisId=p=>String(vertical?(p.xAxisId??'__default'):(p.yAxisId??'__default'));
 const numericAxes=vertical?xAxes:yAxes;
 const axisFor=p=>numericAxes.find(a=>axisId(a.props)===axisId(p))||numericAxes[0];
 const domainFor=p=>axisFor(p)?.domain||cfg.axisDomains?.[axisId(p)]||cfg.axisDomains?.__default||[0,1];
 const number=(v,p)=>{const dom=domainFor(p),t=(Number(v)-dom[0])/(dom[1]-dom[0]||1);return vertical?left+t*iw:top+ih-t*ih};
 let out=spec.defs.map(d=>defsNode(d,prefix)).join('');
 out+=tag('defs',{},tag('clipPath',{id:prefix+'plot'},tag('rect',{x:left,y:top,width:iw,height:ih})));
 cfg.viewBox={w,h,left,right,top,bottom};cfg.vertical=vertical;cfg.pointCoordinates=data.map((_,i)=>category(i));
 const grid=spec.grid,primaryAxis=numericAxes[0],ticks=primaryAxis?.ticks||Array.from({length:5},(_,i)=>{const d=domainFor({});return d[0]+(d[1]-d[0])*i/4});
 if(grid){
  const style={stroke:grid.stroke||'var(--border)','stroke-width':1,'stroke-opacity':grid.strokeOpacity??1,'stroke-dasharray':grid.strokeDasharray};
  const gridAxis=numericAxes.find(a=>String(vertical?(a.props.xAxisId??0):(a.props.yAxisId??0))===String(vertical?(grid.xAxisId??0):(grid.yAxisId??0)));
  const numericPositions=gridAxis?(gridAxis.ticks||ticks).map(v=>number(v,gridAxis.props)):(vertical?[left,left+iw]:[top,top+ih]);
  if(vertical?grid.vertical!==false:grid.horizontal!==false)for(const pos of numericPositions){out+=tag('line',{...style,x1:vertical?pos:left,x2:vertical?pos:left+iw,y1:vertical?top:pos,y2:vertical?top+ih:pos})}
  if(vertical?grid.horizontal!==false:grid.vertical!==false)for(let i=0;i<data.length;i++){const pos=category(i);out+=tag('line',{...style,x1:vertical?left:pos,x2:vertical?left+iw:pos,y1:vertical?pos:top,y2:vertical?pos:top+ih})}
 }
 for(const a of axes){
  const p=a.props;if(p.hide||p.axisLine===false)continue;
  const horizontal=a.type==='XAxis',x=p.orientation==='right'?left+iw:left,y=p.orientation==='top'?top:top+ih;
  out+=tag('line',{x1:horizontal?left:x,x2:horizontal?left+iw:x,y1:horizontal?y:top,y2:horizontal?y:top+ih,stroke:p.axisLine?.stroke||'var(--border)'});
 }
 for(const a of numericAxes){
  const p=a.props;if(p.hide||p.tick===false)continue;const values=a.ticks||ticks;
  values.forEach((v,i)=>{const pos=number(v,p),label=a.labels?.[i]??v;
   out+=vertical?text(pos,top+ih+16,label):text(p.orientation==='right'?left+iw+8:left-8,pos,label,{'text-anchor':p.orientation==='right'?'start':'end','dominant-baseline':'middle'});
  });
 }
 const cat=(vertical?yAxes:xAxes).find(a=>a.props.type!=='number')||(vertical?yAxes:xAxes)[0];
 if(cat&&!cat.props.hide&&cat.props.tick!==false){
  const labels=data.map((row,i)=>row[cat.props.dataKey||cfg.labelKey]??i),size=cat.props.tick?.fontSize||12;
  const minGap=cat.props.minTickGap??5;
  let lastEdge=-Infinity;
  for(let i=0;i<labels.length;i++){
   const pos=category(i),extent=vertical?size:String(labels[i]).length*size*.55;
   const force=cat.props.interval===0;
   if(!force&&pos-extent/2<lastEdge+minGap)continue;
   lastEdge=pos+extent/2;
   out+=vertical?categoryText(left-8,pos,labels[i],cat.props.width||60,size):text(pos,top+ih+16,labels[i],{'font-size':size});
  }
 }
 let marks='',points='';
 const groups=[...new Set(bars.map(s=>s.props.stackId??s.props.dataKey))];
 const categoryGap=percent(spec.barCategoryGap,band,band*.1),gap=percent(spec.barGap,band,4);
 const groupWidth=Math.max(1,Math.round((band-2*categoryGap-gap*(groups.length-1))/Math.max(1,groups.length)));
 const stacks=new Map();
 const layer=s=>s.props.zIndex??({Area:100,Bar:300,Line:400}[s.type]||0);
 spec.series.map((series,si)=>({series,si})).sort((a,b)=>layer(a.series)-layer(b.series)).forEach(({series,si})=>{
  const p=series.props,domain=domainFor(p),base=Math.max(domain[0],Math.min(domain[1],0));
  if(series.type==='Bar'){
   const group=groups.indexOf(p.stackId??p.dataKey),groupProps=bars.find(s=>(s.props.stackId??s.props.dataKey)===(p.stackId??p.dataKey)).props,barSize=groupProps.barSize??p.barSize,size=Math.max(1,barSize??Math.min(groupWidth,groupProps.maxBarSize??p.maxBarSize??Infinity));
   data.forEach((row,i)=>{const v=row[p.dataKey];if(!finite(v))return;const key=`${p.stackId}|${i}|${Number(v)<0?'negative':'positive'}`;
    const from=p.stackId===undefined?base:(stacks.get(key)??0),to=p.stackId===undefined?Number(v):from+Number(v);if(p.stackId!==undefined)stacks.set(key,to);
    const offset=barSize!==undefined?Math.round((band-(size*groups.length+gap*(groups.length-1)))/2)+group*(size+gap):categoryGap+groups.length*(groupWidth-size)/2+group*(size+gap);
    const c=category(i)-band/2+offset;
    const a=number(from,p),b=number(to,p),cell=flat(p.children).filter(x=>x.type==='Cell')[i]?.props;
    const x=vertical?Math.min(a,b):c,y=vertical?c:Math.min(a,b),width=vertical?Math.abs(b-a):size,height=vertical?size:Math.abs(b-a);
    let radii=Array.isArray(p.radius)?p.radius:[p.radius||0,p.radius||0,p.radius||0,p.radius||0];
    if(Number(v)<0)radii=vertical?[radii[1],radii[0],radii[3],radii[2]]:[radii[3],radii[2],radii[1],radii[0]];
    const r=radii.map(v=>Math.min(v,width/2,height/2)),d=`M${x+r[0]},${y}H${x+width-r[1]}Q${x+width},${y} ${x+width},${y+r[1]}V${y+height-r[2]}Q${x+width},${y+height} ${x+width-r[2]},${y+height}H${x+r[3]}Q${x},${y+height} ${x},${y+height-r[3]}V${y+r[0]}Q${x},${y} ${x+r[0]},${y}Z`;
    if(p.background)marks+=tag('rect',{x:vertical?left:x,y:vertical?y:top,width:vertical?iw:width,height:vertical?height:ih,rx:Math.min(Number(p.background.radius)||0,(vertical?height:width)/2),fill:p.background.fill||'#eee'});
    marks+=tag('path',{d,fill:color(cell?.fill||p.fill,prefix),'fill-opacity':p.fillOpacity,'data-point-index':i,'data-series-index':si});
    flat(p.children).filter(n=>n.type==='LabelList').forEach(label=>{const q=label.props,offset=q.offset??5,value=q.labels?.[i]??row[q.dataKey||p.dataKey];marks+=text(vertical?x+width+offset:x+width/2,vertical?y+height/2:y-offset,value,{'text-anchor':vertical?'start':'middle','dominant-baseline':vertical?'middle':'auto',fill:'var(--foreground)',class:q.className,'font-size':q.fontSize||12});});
   });return;
  }
  if(!['Area','Line'].includes(series.type))return;
  let arr=data.map((row,i)=>{const v=row[p.dataKey];return {i,x:vertical?number(v,p):category(i),y:vertical?category(i):number(v,p),defined:finite(v)}});
  if(p.connectNulls)arr=arr.filter(d=>d.defined);
  const cur=curve(p.type,vertical),draw=line().defined(d=>d.defined).x(d=>d.x).y(d=>d.y).curve(cur);
  if(series.type==='Area'){
   const fill=area().defined(d=>d.defined).curve(cur);
   if(vertical)fill.y(d=>d.y).x0(number(base,p)).x1(d=>d.x);else fill.x(d=>d.x).y0(number(base,p)).y1(d=>d.y);
   marks+=tag('path',{d:fill(arr)||'',fill:color(p.fill||p.stroke,prefix),'fill-opacity':p.fillOpacity??.6,'data-chart-area':'','data-series-index':si});
  }
  marks+=tag('path',{d:draw(arr)||'',fill:'none',stroke:color(p.stroke,prefix),'stroke-width':p.strokeWidth??1,'stroke-dasharray':p.strokeDasharray,'data-chart-line':'','data-series-index':si});
  arr.filter(d=>d.defined).forEach(d=>{const dot=p.dot!==false&&(series.type==='Line'||p.dot),radius=typeof p.dot==='object'?p.dot.r||3:3;
   if(dot)marks+=tag('circle',{cx:d.x,cy:d.y,r:radius,fill:typeof p.dot==='object'?p.dot.fill||'var(--card)':'var(--card)',stroke:p.stroke,'stroke-width':p.strokeWidth||1});
   points+=tag('circle',{cx:d.x,cy:d.y,r:4,fill:p.stroke,stroke:'var(--card)','stroke-width':2,opacity:0,'data-chart-point':'','data-point-index':d.i,'data-series-index':si});
  });
 });
 out+=tag('g',{'clip-path':axes.some(a=>a.props.allowDataOverflow)?`url(#${prefix}plot)`:undefined},marks+points);
 out+=tag('g',{'data-chart-hover':'',hidden:true},tag('line',{'data-chart-cursor':'',x1:left,x2:left,y1:top,y2:top+ih,stroke:'var(--border)','stroke-width':1}));
 return out;
}
function renderPie(root,cfg,w,h,prefix){
 const spec=cfg.source,margin={top:5,right:5,bottom:5,left:5,...spec.margin};
 let legendEl=root.querySelector('[data-chart-legend]');
 if(spec.legend){
  if(!legendEl){legendEl=document.createElement('div');legendEl.dataset.chartLegend='';root.prepend(legendEl)}
  const p=spec.legend.props||{},series=spec.series.find(s=>s.type==='Pie').props,cells=flat(series.children).filter(c=>c.type==='Cell'),top=p.verticalAlign==='top';
  const items=cfg.data.map((row,i)=>({label:row[series.nameKey||'name']??i,color:cells[i]?.props.fill||row.fill||series.fill})).sort((a,b)=>String(a.label)<String(b.label)?-1:1);
  Object.assign(legendEl.style,{position:'absolute',left:`${margin.left}px`,right:`${margin.right}px`,top:top?`${margin.top}px`:'auto',bottom:top?'auto':`${margin.bottom}px`,fontSize:`${p.wrapperStyle?.fontSize||14}px`,lineHeight:'normal',textAlign:p.align||'center',pointerEvents:'none'});
  legendEl.innerHTML=items.map(item=>`<span style="display:inline-block;margin-right:10px;white-space:nowrap;color:${esc(item.color)}"><span style="display:inline-block;vertical-align:middle;width:${p.iconSize||14}px;height:${p.iconSize||14}px;border-radius:50%;margin-right:4px;background:${esc(item.color)}"></span>${esc(item.label)}</span>`).join('');
  margin[top?'top':'bottom']+=p.height||legendEl.offsetHeight;
 }else legendEl?.remove();
 const iw=w-margin.left-margin.right,ih=h-margin.top-margin.bottom;
 let out=spec.defs.map(d=>defsNode(d,prefix)).join('');
 spec.series.filter(s=>s.type==='Pie').forEach(s=>{
  const p=s.props,data=cfg.data,key=p.dataKey||'value',max=Math.min(iw,ih)/2,cx=margin.left+percent(p.cx,iw,iw/2),cy=margin.top+percent(p.cy,ih,ih/2),inner=percent(p.innerRadius,max,0),outer=percent(p.outerRadius,max,max*.8),start=p.startAngle??0,end=p.endAngle??360,gap=p.paddingAngle||0,total=data.reduce((sum,d)=>sum+Math.abs(Number(d[key])||0),0),direction=Math.sign(end-start)||1,available=Math.abs(end-start)-gap*data.length;
  let angle=start;
  const cells=flat(p.children).filter(c=>c.type==='Cell');
  data.forEach((d,i)=>{const delta=(Math.abs(Number(d[key])||0)/Math.max(1,total))*available,next=angle+direction*delta;
   const shape=arc().innerRadius(inner).outerRadius(outer).startAngle(Math.PI/2-angle*Math.PI/180).endAngle(Math.PI/2-next*Math.PI/180).cornerRadius(p.cornerRadius||0)();
   out+=tag('path',{d:shape,transform:`translate(${cx},${cy})`,fill:cells[i]?.props.fill||p.fill||`var(--chart-${i%5+1})`,stroke:p.stroke??'var(--card)','stroke-width':p.strokeWidth??1,'data-chart-slice':'','data-point-index':i});
   angle=next+direction*gap;
  });
 });
 return out;
}
function renderRadar(root,cfg,w,h,prefix){
 const s=cfg.source,margin={top:5,right:5,bottom:5,left:5,...s.margin};legend(root,cfg,margin);
 const polar=s.polar||{},cx=percent(polar.cx,w,w/2),cy=percent(polar.cy,h,h/2),r=percent(polar.outerRadius,Math.min(w-margin.left-margin.right,h-margin.top-margin.bottom)/2,Math.min(w-margin.left-margin.right,h-margin.top-margin.bottom)*.4),n=cfg.data.length,radial=s.axes.find(a=>a.type==='PolarRadiusAxis'),dom=radial?.props.domain||polar.domain||[0,100],point=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(a)*r*v,cy+Math.sin(a)*r*v]};
 let out='';for(let ring=1;ring<=4;ring++)out+=tag('polygon',{points:cfg.data.map((_,i)=>point(i,ring/4).join(',')).join(' '),fill:'none',stroke:'var(--border)'});
 const angle=s.axes.find(a=>a.type==='PolarAngleAxis')?.props||{},labelKey=angle.dataKey||cfg.labelKey;
 cfg.data.forEach((d,i)=>{const end=point(i,1),p=point(i,(r+8)/r);if(s.polarGrid?.radialLines!==false)out+=tag('line',{x1:cx,y1:cy,x2:end[0],y2:end[1],stroke:s.polarGrid?.stroke||'var(--border)'});out+=text(p[0],p[1],d[labelKey],{'dominant-baseline':'middle','text-anchor':Math.abs(p[0]-cx)<1?'middle':p[0]>cx?'start':'end','font-size':angle.tick?.fontSize||12})});
 s.series.forEach(series=>{const p=series.props;out+=tag('polygon',{points:cfg.data.map((d,i)=>point(i,(Number(d[p.dataKey])-dom[0])/(dom[1]-dom[0]||1)).join(',')).join(' '),fill:p.fill,stroke:p.stroke,'fill-opacity':p.fillOpacity??.6,'stroke-width':p.strokeWidth??1})});
 cfg.viewBox={w,h,cx,cy};return out;
}
function renderRadial(root,cfg,w,h){
 root.querySelector('[data-chart-legend]')?.remove();const s=cfg.source,p=s.polar||{},series=s.series[0].props,m={top:5,right:5,bottom:5,left:5,...s.margin},max=Math.min(w-m.left-m.right,h-m.top-m.bottom)/2,cx=w/2,cy=h/2,inner=percent(p.innerRadius,max,max*.3),outer=percent(p.outerRadius,max,max),band=(outer-inner)/Math.max(1,cfg.data.length),size=p.barSize||band*.8,start=p.startAngle??0,end=p.endAngle??360,dom=p.domain||[0,100];let out='';
 cfg.data.forEach((row,i)=>{const radius=inner+band*(i+.5),make=angle=>arc().innerRadius(radius-size/2).outerRadius(radius+size/2).startAngle(Math.PI/2-start*Math.PI/180).endAngle(Math.PI/2-angle*Math.PI/180).cornerRadius(series.cornerRadius||0)();if(series.background)out+=tag('path',{d:make(end),transform:`translate(${cx},${cy})`,fill:series.background.fill||'var(--muted)'});const value=Number(row[series.dataKey])||0,angle=start+(end-start)*(value-dom[0])/(dom[1]-dom[0]||1);out+=tag('path',{d:make(angle),transform:`translate(${cx},${cy})`,fill:row.fill||series.fill||'var(--chart-1)','data-chart-slice':'','data-point-index':i});});cfg.viewBox={w,h,cx,cy};return out;
}
function renderScatter(root,cfg,w,h){
 root.querySelector('[data-chart-legend]')?.remove();const s=cfg.source,m={top:5,right:5,bottom:5,left:5,...s.margin},xa=s.axes.find(a=>a.type==='XAxis'),ya=s.axes.find(a=>a.type==='YAxis'),left=m.left+(ya.props.width||60),top=m.top,iw=w-left-m.right,ih=h-top-m.bottom-(xa.props.height||30),scale=(v,a,range)=>((v-a.domain[0])/(a.domain[1]-a.domain[0]||1))*range;let out='';
 for(const a of [xa,ya]){const horizontal=a===xa;for(let i=0;i<a.ticks.length;i++){const value=a.ticks[i],pos=horizontal?left+scale(value,a,iw):top+ih-scale(value,a,ih);if(s.grid)out+=tag('line',{x1:horizontal?pos:left,x2:horizontal?pos:left+iw,y1:horizontal?top:pos,y2:horizontal?top+ih:pos,stroke:s.grid.stroke||'var(--border)','stroke-dasharray':s.grid.strokeDasharray});out+=text(horizontal?pos:left-8,horizontal?top+ih+16:pos,`${a.labels?.[i]??value}${a.props.unit||''}`,{'text-anchor':horizontal?'middle':'end','dominant-baseline':horizontal?'auto':'middle'});}}
 if(xa.props.axisLine!==false)out+=tag('line',{x1:left,x2:left+iw,y1:top+ih,y2:top+ih,stroke:'var(--border)'});
 cfg.pointCoordinates=[];cfg.data.forEach((row,i)=>{const x=left+scale(row[xa.props.dataKey],xa,iw),y=top+ih-scale(row[ya.props.dataKey],ya,ih);cfg.pointCoordinates.push(x);out+=tag('circle',{cx:x,cy:y,r:4.5,fill:s.series[0].props.fill,'data-point-index':i});});cfg.viewBox={w,h,left,right:m.right,top,bottom:m.bottom+30};return out;
}
function renderFunnel(root,cfg,w,h){
 root.querySelector('[data-chart-legend]')?.remove();
 const spec=cfg.source,p=spec.series.find(s=>s.type==='Funnel').props,data=p.data||cfg.data,m={top:5,right:5,bottom:5,left:5,...spec.margin},width=w-m.left-m.right,height=h-m.top-m.bottom,row=height/data.length,max=Math.max(1,...data.map(d=>Number(d[p.dataKey])||0));
 const label=flat(p.children).find(c=>c.type==='LabelList')?.props;
 let out='';
 data.forEach((d,i)=>{const upper=width*(Number(d[p.dataKey])||0)/max,lower=width*(Number(data[i+1]?.[p.dataKey])||0)/max,x=m.left+(width-upper)/2,y=m.top+row*i,inset=(upper-lower)/2;
  out+=tag('path',{d:`M${x},${y}H${x+upper}L${x+upper-inset},${y+row}H${x+inset}Z`,fill:flat(p.children).filter(c=>c.type==='Cell')[i]?.props.fill||p.fill,stroke:p.stroke||'#fff','data-chart-slice':'','data-point-index':i});
  if(label){const lx=x+(3*upper+lower)/4+(label.offset??5);out+=categoryText(lx,y+row/2,d[label.dataKey],m.left+width-lx,label.fontSize||12,{'text-anchor':'start',fill:label.fill});}
 });
 cfg.viewBox={w,h,left:m.left,right:m.right,top:m.top,bottom:m.bottom};cfg.vertical=true;cfg.pointCoordinates=data.map((_,i)=>m.top+row*(i+.5));return out;
}
export function renderChart(root,cfg){
 if(!cfg.source)return false;
 // Resolve percentage heights against the original ChartContainer, including
 // containers whose responsive size is supplied by min-height or a flex row.
 if(root.classList.contains('vex-chart')&&root.parentElement?.classList.contains('h-full')){
  const holder=root.parentElement;holder.parentElement.style.position='relative';
  Object.assign(holder.style,{position:'absolute',inset:'0'});
 }
 const w=root.clientWidth,h=root.clientHeight;
 if(w<1||h<1)return false;
 let svg=root.querySelector('[data-chart-svg]');if(!svg){svg=document.createElementNS(NS,'svg');svg.dataset.chartSvg='';root.append(svg)}
 const prefix=(root.dataset.vexChart||'chart')+'-';
 // Use real container pixels so type and strokes keep their source size at every breakpoint.
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('preserveAspectRatio','xMidYMid meet');
 Object.assign(svg.style,{position:'absolute',inset:'0',display:'block',width:'100%',height:'100%',overflow:'visible',fontFamily:'inherit'});svg.setAttribute('role','img');svg.setAttribute('aria-label',root.getAttribute('aria-label')||`${cfg.kind} chart`);
 if(cfg.source.series.some(s=>s.type==='RadialBar'))svg.innerHTML=renderRadial(root,cfg,w,h);
 else if(cfg.source.series.some(s=>s.type==='Scatter'))svg.innerHTML=renderScatter(root,cfg,w,h);
 else if(cfg.kind==='pie')svg.innerHTML=renderPie(root,cfg,w,h,prefix);
 else if(cfg.kind==='radar')svg.innerHTML=renderRadar(root,cfg,w,h,prefix);
 else if(cfg.source.series.some(s=>s.type==='Funnel'))svg.innerHTML=renderFunnel(root,cfg,w,h);
 else svg.innerHTML=renderCartesian(root,cfg,w,h,prefix);
 root.dataset.chartRendered='true';return true;
}
