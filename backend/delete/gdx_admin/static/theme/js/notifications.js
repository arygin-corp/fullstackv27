document.querySelector('[data-sidebar-toggle]')?.addEventListener('click',()=>document.getElementById('sidebar')?.classList.toggle('open'));
document.querySelectorAll('[data-dialog-open]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.dialogOpen)?.showModal()));
document.querySelectorAll('[data-dialog-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.dialogClose)?.close()));
