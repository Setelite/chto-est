/* ЧТО ЕСТЬ? — пошаговый режим готовки v1.7.
   Работает для всех рецептов с этапами. Таймер справочный, не сигнал готовности еды. */
(function(){
 let activeId=null,activeStep=0,startAt=0,ticking=null,pausedElapsed=0,paused=true;
 const stamp=ms=>{let sec=Math.floor(Math.max(ms,0)/1000);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')};
 function timeline(){if(activeId==null)return [];return recipeTimeline(recipes[activeId])}
 function elapsed(){return paused?pausedElapsed:pausedElapsed+Date.now()-startAt}
 function header(){
  const r=recipes[activeId],steps=timeline(),current=steps[activeStep],el=document.querySelector('#cookContent');
  if(!el||!r||!current)return;
  const pct=Math.round((activeStep+1)/steps.length*100);
  el.innerHTML='<div class="cook-hero"><span class="cook-eyebrow">РЕЖИМ ГОТОВКИ · '+(activeStep+1)+' / '+steps.length+'</span><h2>'+esc(r.name)+'</h2><div class="cook-progress"><div style="width:'+pct+'%"></div></div><p class="cook-stage-time">'+timeLabel(current.start)+' – '+timeLabel(current.end)+'</p><div class="cook-step">'+esc(current.text)+'</div><p class="cook-hint">Указанные минуты — ориентир, не подтверждённый хронометраж. Для мяса и других потенциально опасных продуктов проверяй фактическую готовность.</p></div><div class="cook-control"><div><div class="cook-clock" id="cookClock">'+stamp(elapsed())+'</div><span class="cook-clock-caption">Таймер от начала готовки</span></div><button class="outline" id="cookPause">'+(paused?'▶ Продолжить':'Ⅱ Пауза')+'</button></div><div class="cook-actions"><button class="ghost" id="cookPrev" '+(activeStep===0?'disabled':'')+'>← Назад</button><button class="primary" id="cookNext">'+(activeStep===steps.length-1?'✓ Завершить':'Следующий шаг →')+'</button></div><button class="ghost" style="width:100%;margin-top:10px" id="cookStop">Закрыть режим готовки</button>';
 }
 function syncClock(){const n=document.querySelector('#cookClock');if(n)n.textContent=stamp(elapsed())}
 function stop(){if(ticking){clearInterval(ticking);ticking=null}if(document.querySelector('#cookDialog')?.open)document.querySelector('#cookDialog').close();activeId=null;pausedElapsed=0;paused=true}
 function begin(id){if(!recipes[id])return;stop();activeId=id;activeStep=0;pausedElapsed=0;startAt=Date.now();paused=false;const recipeModal=document.querySelector('#recipeDialog');if(recipeModal?.open)recipeModal.close();document.querySelector('#cookDialog').showModal();header();ticking=setInterval(syncClock,1000)}
 function toggle(){if(activeId===null)return;if(paused){startAt=Date.now();paused=false}else{pausedElapsed=elapsed();paused=true}header()}
 document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.startCook!==undefined){e.preventDefault();e.stopImmediatePropagation();begin(Number(button.dataset.startCook));return}
  if(activeId===null)return;
  if(button.id==='cookStop'){stop();return}
  if(button.id==='cookPause'){toggle();return}
  if(button.id==='cookPrev'){activeStep=Math.max(0,activeStep-1);header();return}
  if(button.id==='cookNext'){if(activeStep>=timeline().length-1){stop();return}activeStep++;header()}
 });
 const dlg=document.createElement('dialog');dlg.id='cookDialog';dlg.innerHTML='<div class="dialogBody"><div id="cookContent"></div></div>';document.body.append(dlg);
 dlg.addEventListener('close',()=>{if(activeId!==null)stop()});
 const style=document.createElement('style');
 style.textContent='.cook-hero{padding:4px 0 10px}.cook-eyebrow{font-size:11px;letter-spacing:1.7px;font-weight:850;color:#8665a8}.cook-hero h2{font-size:24px;line-height:1.17}.cook-progress{height:9px;background:#efe9f2;border-radius:99px;overflow:hidden;margin:18px 0}.cook-progress>div{height:100%;background:linear-gradient(90deg,#b89ce2,#8c73ca);border-radius:99px;transition:width .2s}.cook-stage-time{font-size:16px;font-weight:850;color:#7352a6;margin:4px 0 12px}.cook-step{padding:20px;border-radius:19px;background:linear-gradient(135deg,#f4eafa,#faf5ed);font-size:20px;line-height:1.45;font-weight:650;min-height:140px}.cook-hint{font-size:12px!important;color:#796d80!important}.cook-control{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-top:1px solid #eee5ed}.cook-clock{font-size:30px;font-weight:900;letter-spacing:-1px;font-variant-numeric:tabular-nums}.cook-clock-caption{display:block;color:#857b86;font-size:11px}.cook-actions{display:flex;gap:8px}.cook-actions>*{flex:1}.cook-actions .primary{margin:0}#cookDialog{width:min(480px,calc(100% - 20px))}#cookDialog::backdrop{background:#1d142cbd}';
 style.textContent+='.cook-launch{position:relative;z-index:4;display:block!important;min-height:56px;margin:16px 0 20px!important;border:2px solid #765bad!important;box-shadow:0 8px 20px #a995de50!important;font-size:15px!important}';document.head.append(style);
 const oldOpen=openRecipe;
 openRecipe=function(id){oldOpen(id);const parent=document.querySelector('#recipeDetail');if(parent&&!parent.querySelector('[data-start-cook]')){const b=document.createElement('button');b.className='primary cook-launch';b.type='button';b.id='cookLaunchBtn';b.dataset.startCook=id;b.textContent='▶ НАЧАТЬ ГОТОВИТЬ — ПОШАГОВО';b.setAttribute('aria-label','Запустить режим готовки с таймером');const h=parent.querySelector('h3');if(h)h.before(b);else parent.prepend(b)}};
})();
