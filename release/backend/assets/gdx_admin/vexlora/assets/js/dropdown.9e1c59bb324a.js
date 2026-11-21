export function initDropdowns() {
  document.addEventListener("click", (event) => {
    const trigger=event.target.closest("[data-dropdown-trigger]");
    document.querySelectorAll("[data-dropdown-panel]").forEach((panel)=>{
      const owner=panel.closest("[data-dropdown]");
      if(!trigger || trigger.closest("[data-dropdown]")!==owner) panel.hidden=true;
    });
    if(trigger){ const panel=trigger.closest("[data-dropdown]")?.querySelector("[data-dropdown-panel]"); if(panel) panel.hidden=!panel.hidden; }
  });
  document.addEventListener("keydown",(event)=>{ if(event.key==="Escape") document.querySelectorAll("[data-dropdown-panel]").forEach((p)=>p.hidden=true); });
}
