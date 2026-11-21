export function initFullscreen() {
  document.querySelectorAll("[data-fullscreen-toggle]").forEach((button)=>button.addEventListener("click",async()=>{
    try { if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch {}
  }));
}
