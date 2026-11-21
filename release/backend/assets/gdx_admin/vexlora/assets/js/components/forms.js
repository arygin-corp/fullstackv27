function formatSize(bytes){ if(bytes<1024)return `${bytes} B`; if(bytes<1024**2)return `${(bytes/1024).toFixed(1)} KB`; return `${(bytes/1024**2).toFixed(1)} MB`; }
function initFileUpload(root){
  const input=root.querySelector('input[type="file"]'),list=root.querySelector('[data-file-list]'),error=root.querySelector('[data-file-error]'); if(!input)return;
  const max=Number(root.dataset.maxBytes||10485760); const accept=(root.dataset.accept||"").split(',').map(x=>x.trim()).filter(Boolean);
  const render=(files)=>{ if(error)error.textContent=""; const accepted=[]; for(const file of files){const ext='.'+file.name.split('.').pop().toLowerCase();const okType=!accept.length||accept.includes(file.type)||accept.includes(ext);if(!okType){if(error)error.textContent=`${file.name}: unsupported file type`;continue;}if(file.size>max){if(error)error.textContent=`${file.name}: exceeds ${formatSize(max)}`;continue;}accepted.push(file);} if(list)list.innerHTML=accepted.map(f=>`<li class="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"><span class="min-w-0 truncate text-sm font-medium">${f.name.replace(/[&<>"']/g,'')}</span><span class="shrink-0 text-xs text-muted-foreground">${formatSize(f.size)}</span></li>`).join('');root.dataset.fileCount=String(accepted.length);};
  input.addEventListener('change',()=>render([...input.files]));
  ['dragenter','dragover'].forEach(type=>root.addEventListener(type,e=>{e.preventDefault();root.dataset.dragging='true';}));
  ['dragleave','drop'].forEach(type=>root.addEventListener(type,e=>{e.preventDefault();delete root.dataset.dragging;}));
  root.addEventListener('drop',e=>{if(e.dataTransfer?.files)render([...e.dataTransfer.files]);});
}
function initValidation(form){
  form.addEventListener('submit',event=>{let valid=true;form.querySelectorAll('[data-field]').forEach(field=>{const control=field.querySelector('input,select,textarea');const message=field.querySelector('[data-field-error]');if(!control)return;const bad=!control.checkValidity();field.dataset.invalid=String(bad);control.setAttribute('aria-invalid',String(bad));if(message)message.textContent=bad?(control.validationMessage||'Please check this field.'):'';valid=valid&&!bad;});if(!valid){event.preventDefault();form.querySelector('[aria-invalid="true"]')?.focus();}});
  form.addEventListener('input',e=>{const field=e.target.closest('[data-field]');if(!field)return;field.dataset.invalid='false';e.target.setAttribute('aria-invalid','false');const msg=field.querySelector('[data-field-error]');if(msg)msg.textContent='';});
}
export function initForms(){ document.querySelectorAll('[data-file-upload]').forEach(initFileUpload); document.querySelectorAll('form[data-vexlora-form]').forEach(initValidation); }
