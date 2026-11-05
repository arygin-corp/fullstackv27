
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const prefix=location.pathname.includes('/pages/')?'../':'';
qsa('.nav-group-toggle').forEach(b=>b.addEventListener('click',()=>{const g=b.closest('.nav-group');g.classList.toggle('open');b.setAttribute('aria-expanded',g.classList.contains('open'))}));
qs('#expand-all').onclick=()=>qsa('.nav-group').forEach(x=>x.classList.add('open'));
qs('#collapse-all').onclick=()=>qsa('.nav-group').forEach(x=>x.classList.remove('open'));
qs('.theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('masterApifyTheme',document.body.classList.contains('dark')?'dark':'light')};
if(localStorage.getItem('masterApifyTheme')==='dark')document.body.classList.add('dark');
qs('.mobile-menu').onclick=()=>{qs('.sidebar').classList.add('open');qs('.overlay').classList.add('open')};
qs('.overlay').onclick=()=>{qs('.sidebar').classList.remove('open');qs('.overlay').classList.remove('open')};
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
qs('#site-search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase(),box=qs('#search-results');if(!q){box.hidden=true;return}const hits=HELP_SEARCH_INDEX.map(x=>({...x,score:(x.title.toLowerCase().includes(q)?10:0)+(x.text.toLowerCase().includes(q)?1:0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,14);box.innerHTML=hits.length?hits.map(x=>`<a href="${prefix}${x.url}"><strong>${escapeHtml(x.title)}</strong><br><small>${escapeHtml(x.text.slice(0,140))}...</small></a>`).join(''):'<div style="padding:10px">No results</div>';box.hidden=false});
document.addEventListener('click',e=>{if(!e.target.closest('.search-box'))qs('#search-results').hidden=true});
