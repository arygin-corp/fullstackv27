export function initSharedComponents(){
  document.querySelectorAll('[data-stepper]').forEach(root=>{const current=Number(root.dataset.currentStep||1);root.querySelectorAll('[data-step]').forEach((step,index)=>{const n=index+1;step.dataset.state=n<current?'complete':n===current?'current':'upcoming';step.setAttribute('aria-current',n===current?'step':'false');});});
}
