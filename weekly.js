/* ЧТО ЕСТЬ? — меню на 7 дней, поиск по рецептам и общая корзина.
   Количества ориентировочные, не подтверждены технологическими картами. */
const cheDays=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
let cheWeek=load('week',[]);let cheAddedSignature=load('week_added_signature','');
const cheSignature=()=>cheWeek.join('-')+'|'+chePortions()+'|'+[...cheStock()].sort().join(',');
const cheSaveWeek=()=>localStorage.setItem('che_week',JSON.stringify(cheWeek));
const chePortions=()=>Number(document.querySelector('#portions').value)||2;
const cheNeeds=r=>{const opt=optionalByName[r.name]||[];return r.need.filter(n=>!opt.includes(n))};
const cheStock=()=>new Set(have.map(canon));
function chePlan(){
 const stock=cheStock(),veg=document.querySelector('#vegetarian').checked,maxTime=Number(document.querySelector('#minutes').value)||30;
 let candidates=recipes.filter(r=>!veg||r.veg).map(r=>{
 const required=cheNeeds(r),matching=required.filter(x=>stock.has(x)).length,missing=required.length-matching;
 return {r,matching,missing,score:matching*7-missing*3+(r.min<=maxTime?5:0)-r.min/100}
 });
 // При непустой корзине предпочтение рецептам из имеющихся продуктов, затем 1-2 докупки.
 if(stock.size)candidates.sort((a,b)=>(a.missing===0?-1:0)-(b.missing===0?-1:0)||b.score-a.score||a.r.id-b.r.id);
 else candidates.sort((a,b)=>a.r.min-b.r.min||a.r.id-b.r.id);
 let chosen=[],lastKey='';
 for(let day=0;day<7;day++){
   const scored=candidates.filter(x=>!chosen.includes(x.r.id)).sort((a,b)=>{
    const variant=x=>x.score-(x.r.need[0]===lastKey?5:0)+((x.r.min<=30)?1:0);
    return variant(b)-variant(a)||a.r.id-b.r.id;
   });
   if(!scored.length)break;
   const pick=scored[0].r;chosen.push(pick.id);lastKey=pick.need[0];
 }
 cheWeek=chosen;cheAddedSignature='';cheSaveWeek();cheRenderWeek();
}
function cheWeekMissing(){
 const stock=cheStock(),qty=new Map();
 cheWeek.forEach(id=>{let r=recipes[id];if(!r)return;for(const ingredient of cheNeeds(r)){
   if(stock.has(ingredient))continue;
   const q=qFor(r,ingredient),key=canon(ingredient)+'|'+q.unit;
   const old=qty.get(key)||{name:canon(ingredient),qty:0,unit:q.unit};
   old.qty=Math.round((old.qty+q.qty)*10)/10;qty.set(key,old);
 }});
 return [...qty.values()].sort((a,b)=>a.name.localeCompare(b.name,'ru'));
}
function cheRenderWeek(){
 const target=document.querySelector('#weekResults');if(!target)return;
 if(!cheWeek.length){target.innerHTML='<div class="empty">Нажми «Составить меню», чтобы получить 7 разных блюд.</div>';return}
 target.innerHTML=cheWeek.map((id,day)=>{const r=recipes[id];if(!r)return '';
 const missing=cheNeeds(r).filter(n=>!cheStock().has(n));
 return '<article class="recipe"><div class="rtop"><div class="emoji">'+r.emoji+'</div><div style="flex:1;min-width:0"><div class="eyebrow">'+cheDays[day]+'</div><h3 class="rtitle">'+esc(r.name)+'</h3><div class="meta">'+r.min+' мин · '+chePortions()+' порц.</div><span class="pill '+(missing.length?'missing':'')+'">'+(missing.length?'Докупить '+missing.length+' ингредиент(а)':'Ингредиенты есть')+'</span></div></div><div class="rbuttons"><button class="outline" data-open="'+id+'">Рецепт →</button><button class="fav" data-weekreplace="'+day+'" title="Заменить блюдо">↻</button></div></article>'
 }).join('');
 const missing=cheWeekMissing();
 target.innerHTML+='<div class="panel" style="margin-top:14px"><h2 style="margin-top:0">Общая корзина на неделю</h2><p class="hint">Суммируются основные ингредиенты, которых нет в отмеченных продуктах. Запасы в граммах не учитываются.</p>'+(missing.length?'<ul>'+missing.map(i=>'<li>'+esc(i.name)+' — '+esc(qFmt(i.qty,i.unit))+'</li>').join('')+'</ul>':'<p>Все основные продукты отмечены как имеющиеся дома.</p>')+'<button class="primary" id="weekAddShop" '+(cheAddedSignature===cheSignature()?'disabled style="opacity:.55"':'')+'>'+(cheAddedSignature===cheSignature()?'✓ Список уже добавлен':'Добавить в покупки')+'</button><button class="ghost" id="weekCopy" style="width:100%;margin-top:8px">Скопировать меню</button></div>';
}
function cheReplaceDay(day){
 const veg=document.querySelector('#vegetarian').checked,already=new Set(cheWeek);
 const candidates=recipes.filter(r=>(!veg||r.veg)&&!already.has(r.id));
 if(!candidates.length)return;
 let r=candidates.map(r=>({r,missing:cheNeeds(r).filter(x=>!cheStock().has(x)).length})).sort((a,b)=>a.missing-b.missing||a.r.min-b.r.min)[0].r;
 cheWeek[day]=r.id;cheAddedSignature='';cheSaveWeek();cheRenderWeek();
}
function cheAddShop(){
 if(cheAddedSignature===cheSignature())return;
 const missing=cheWeekMissing();for(const item of missing)addMeasured(item.name,{qty:item.qty,unit:item.unit});
 cheAddedSignature=cheSignature();localStorage.setItem('che_week_added_signature',JSON.stringify(cheAddedSignature));save();render();changeTab('shop');
}
function cheCopyWeek(){
 return cheWeek.map((id,i)=>cheDays[i]+': '+recipes[id].name).join('\n')+'\n\nДокупить:\n'+cheWeekMissing().map(x=>'• '+x.name+' — '+qFmt(x.qty,x.unit)).join('\n');
}
function cheSearch(){
 const input=document.querySelector('#recipeSearch'),target=document.querySelector('#searchResults');
 if(!input||!target)return;
 const term=norm(input.value),stock=cheStock(),veg=document.querySelector('#vegetarian').checked;
 if(!term){target.innerHTML='<div class="empty">Введи название блюда или ингредиента.</div>';return}
 const matches=recipes.filter(r=>(!veg||r.veg)&&(norm(r.name).includes(term)||r.need.some(n=>norm(n).includes(term))))
 .map(r=>({...r,missing:cheNeeds(r).filter(n=>!stock.has(n))}))
 .sort((a,b)=>a.missing.length-b.missing.length||a.min-b.min).slice(0,30);
 target.innerHTML='<p class="hint">Найдено: '+matches.length+(matches.length===30?' (первые 30)':'')+'</p>'+(matches.length?matches.map(card).join(''):'<div class="empty">Совпадений нет. Попробуй другое название.</div>');
}
function cheTab(id){document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!==id);document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));window.scrollTo({top:0,behavior:'smooth'});if(id==='week')cheRenderWeek();if(id==='search')cheSearch()}
document.querySelectorAll('.tab').forEach(b=>{b.onclick=()=>cheTab(b.dataset.tab)});
document.querySelector('#makeWeek').onclick=chePlan;
document.querySelector('#recipeSearch').addEventListener('input',cheSearch);
document.querySelector('#portions').addEventListener('change',cheRenderWeek);
document.querySelector('#vegetarian').addEventListener('change',()=>{cheRenderWeek();cheSearch()});
document.addEventListener('click',event=>{
 const el=event.target.closest('button');
 if(!el)return;
 if(el.dataset.weekreplace!==undefined){cheReplaceDay(Number(el.dataset.weekreplace))}
 if(el.id==='weekAddShop')cheAddShop();
 if(el.id==='weekCopy'){const message=cheCopyWeek();navigator.clipboard?.writeText(message).then(()=>{el.textContent='✓ Скопировано'}).catch(()=>alert(message))||alert(message)}
});
cheRenderWeek();cheSearch();
