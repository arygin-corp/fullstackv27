document.addEventListener('DOMContentLoaded', function(){
  function getCookie(name){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  function renderToast(text){
    const container = document.getElementById('toast-container');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Notification</strong>
          <small>now</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${text}</div>
      </div>
    `;
    container.appendChild(wrapper);
    const toastEl = wrapper.querySelector('.toast');
    const bs = bootstrap.Toast.getOrCreateInstance(toastEl);
    bs.show();
  }
  if (!!window.EventSource){
    const es = new EventSource('/notifications/sse/');
    es.onmessage = function(e){
      try{
        const d = JSON.parse(e.data);
        if(d.unread_count !== undefined){
          if(d.unread_count > 0){
            renderToast('You have ' + d.unread_count + ' unread notifications');
          }
        }
      }catch(err){console.error(err)}
    };
    es.onerror = function(){
      setInterval(function(){
        fetch('/notifications/unread/').then(r=>r.json()).then(data=>{
          if(data.notifications && data.notifications.length){
            data.notifications.forEach(n=>renderToast(n.title || n.body || 'New'));
          }
        }).catch(()=>{});
      }, 20000);
    };
  }
});
