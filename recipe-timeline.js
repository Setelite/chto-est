/* ЧТО ЕСТЬ? v1.6 — все 94 рецепта: этапы с временными отметками и фотопоиск Wikimedia.
   Минуты ориентировочные; для точных технологических карт нужны замеры.
   Фото разрешено лишь с указанным источником, автором и лицензией. */
const photoQueries=["pasta cheese tomato","chicken rice","cheese omelette","fried potatoes mushrooms","buckwheat mushrooms","avocado toast","vegetable salad","syrniki cottage cheese pancakes","roast chicken potatoes","tuna pasta","banana oatmeal","egg fried rice","cheese lavash","tomato soup","fruit yogurt","chicken buckwheat","baked apples","tuna salad","mashed potatoes","creamy mushroom pasta","fried eggs tomatoes","egg cucumber salad","mushroom omelette","tomato omelette","grilled cheese sandwich","tomato cheese toast","cottage cheese banana","cottage cheese apple","yogurt oats","apple porridge","oatmeal pancakes","banana pancakes","egg toast","cottage cheese toast","buckwheat porridge","rice pudding","macaroni cheese","tomato pasta","cream pasta","tuna cheese pasta","chicken pasta","chicken alfredo pasta","buckwheat onions","mushroom rice","vegetable rice","tuna rice","boiled potatoes","fried potatoes","potato egg hash","cheesy potatoes","chicken potato skillet","creamy mushrooms","mushroom julienne","buckwheat cheese","cottage cheese casserole","lazy vareniki dumplings","carrot apple salad","cucumber salad","tomato salad","cucumber cheese salad","chicken cucumber salad","tomato egg salad","chicken wrap","cottage cheese wrap","egg cheese wrap","potato carrot soup","chicken rice soup","chicken potato soup","mushroom soup","buckwheat soup","vegetable stew","carrots onions stew","chicken mushrooms","chicken tomato skillet","chicken carrots","creamy chicken","chicken buckwheat skillet","tuna potatoes","tuna egg salad","tuna tomatoes","apple yogurt","banana smoothie","apple banana smoothie","apple fritters","avocado cucumber salad","tuna sandwich","egg sandwich","baked jacket potato","baked tomatoes cheese","egg pasta","warm mushroom salad","cheesy creamy rice","apple cottage cheese","chicken noodle soup"];
const photoMemory=new Map();
const photoInFlight=new Map();
const photoBlocked=new Set();
const photoSafe=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ').trim().slice(0,140);
function recipeTimeline(r){
 let steps=(refinedRecipes[r.name]?.steps||r.steps||[]).filter(Boolean);
 if(!steps.length)return [];
 const total=Math.max(steps.length,Number(r.min)||20),n=steps.length;
 // Неравные, но фиксированные этапы: подготовка, термообработка, соединение, подача.
 const raw=steps.map((_,i)=> i===0?1.25:i===n-1?.65:1.5);
 const sum=raw.reduce((a,b)=>a+b,0);
 let edges=[0],acc=0;
 for(let i=0;i<n-1;i++){acc+=raw[i]/sum*total;let rounded=Math.max(edges[i]+1,Math.round(acc));edges.push(Math.min(rounded,total-(n-1-i)))}
 edges.push(total);
 return steps.map((step,i)=>({start:edges[i],end:edges[i+1],text:step}));
}
const timeLabel=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
function recipeSafety(r){
 const hasChicken=r.need.includes('Курица'),hasEgg=r.need.includes('Яйца');
 if(hasChicken)return 'Время ориентировочное. Курицу готовь до температуры внутри не ниже 74 °C; если этого времени недостаточно, продолжай готовить.';
 if(hasEgg)return 'Яйца приготовь до безопасной готовности. Время указано приблизительно.';
 return 'Время зависит от плиты, толщины нарезки и количества порций; при необходимости продолжай готовить до готовности продукта.';
}
function photoQuery(r){return photoQueries[r.id]||r.name}
async function fetchCommonsPhoto(r){
 if(photoBlocked.has(r.id))return null;
 if(photoMemory.has(r.id))return photoMemory.get(r.id);
 if(photoInFlight.has(r.id))return photoInFlight.get(r.id);
 const query=photoQuery(r);
 const task=(async()=>{
  try{
   const p=new URLSearchParams({action:'query',generator:'search',gsrsearch:query+' food',gsrnamespace:'6',gsrlimit:'6',prop:'imageinfo',iiprop:'url|extmetadata|mime',iiextmetadatafilter:'LicenseShortName|LicenseUrl|Artist|UsageTerms|AttributionRequired',iiurlwidth:'700',format:'json',origin:'*'});
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
   let res;try{res=await fetch('https://commons.wikimedia.org/w/api.php?'+p,{signal:controller.signal,credentials:'omit'})}finally{clearTimeout(timeout)}
   if(!res.ok)throw Error('Photo API: '+res.status);
   const data=await res.json();
   const pages=Object.values(data.query?.pages||{});
   let choices=pages.filter(x=>{const info=x.imageinfo?.[0];return info&&String(info.mime||'').startsWith('image/')&&!(info.mime||'').includes('svg')});
   const words=query.toLowerCase().split(/\s+/).filter(w=>w.length>3);
   choices.sort((a,b)=>{
     const score=x=>{let title=x.title.toLowerCase();return words.reduce((n,w)=>n+(title.includes(w)?2:0),0)};
     return score(b)-score(a);
   });
   const best=choices.find(x=>words.some(w=>x.title.toLowerCase().includes(w)));
   if(!best){photoBlocked.add(r.id);return null}
   const info=best.imageinfo[0],meta=info.extmetadata||{};
   const license=photoSafe(meta.LicenseShortName?.value||meta.UsageTerms?.value||'');
   // Ограничение автоматически выбираемой лицензии: разрешаем только CC и Public Domain.
   if(!/^(CC|Public|PD-|PDM|CC0)/i.test(license)){photoBlocked.add(r.id);return null}
   const photo={url:info.thumburl||info.url,source:info.descriptionurl||'https://commons.wikimedia.org/',author:photoSafe(meta.Artist?.value)||'Автор указан на Wikimedia Commons',license,licenseUrl:String(meta.LicenseUrl?.value||''),label:best.title.replace(/^File:/,'')};
   photoMemory.set(r.id,photo);return photo
  }catch(e){photoBlocked.add(r.id);return null}
 })();
 photoInFlight.set(r.id,task);
 try{return await task}finally{photoInFlight.delete(r.id)}
}
function richFoodTile(r,large=false){
 const cls=large?'large':'';
 return '<div class="food-art '+cls+' dish-photo" data-dish-id="'+r.id+'"><span>'+r.emoji+'</span><i class="food-circle"></i><div class="dish-photo-credit" hidden></div></div>';
}
foodTile=richFoodTile;
const premiumCard=card;
card=function(r){return premiumCard(r)};
function loadPhotoElement(node){
 if(!node||node.dataset.photoDone)return;
 node.dataset.photoDone='1';
 const id=Number(node.dataset.dishId),r=recipes[id];if(!r)return;
 fetchCommonsPhoto(r).then(p=>{
  if(!p)return;
  const img=document.createElement('img');
  img.loading='lazy';img.decoding='async';img.alt='Фото похожего блюда из Wikimedia Commons — '+r.name;
  img.referrerPolicy='no-referrer';
  img.onerror=()=>{img.remove();node.classList.remove('photo');node.querySelector('.dish-photo-credit').hidden=true};
  img.onload=()=>{node.classList.add('photo');const emoji=node.querySelector('span');if(emoji)emoji.style.display='none';const c=node.querySelector('.dish-photo-credit');if(c){c.hidden=false;const a=document.createElement('a');a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent=(p.author+' · '+p.license).slice(0,90);a.title='Автор, лицензия и исходный файл на Wikimedia Commons';c.replaceChildren(a);}};
  img.src=p.url;node.prepend(img)
 });
}
const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const item of entries){if(item.isIntersecting){loadPhotoElement(item.target);observer.unobserve(item.target)}}},{rootMargin:'200px'}):null;
function scanPhotos(root=document){
 root.querySelectorAll('.dish-photo:not([data-photo-done])').forEach(node=>{if(observer)observer.observe(node);else loadPhotoElement(node)})
}
const prevCardRender=render;
render=function(){prevCardRender();scanPhotos()};
const prevSearch=typeof cheSearch==='function'?cheSearch:null;
if(prevSearch)cheSearch=function(){prevSearch();scanPhotos()};
const oldDetail=openRecipe;
openRecipe=function(id){
 oldDetail(id);
 const r=recipes[id],timeline=recipeTimeline(r);
 const parent=document.querySelector('#recipeDetail');
 const heading=[...parent.querySelectorAll('h3')].find(n=>n.textContent.includes('Пошаговое приготовление'));
 if(!heading)return;
 heading.textContent='Поминутный план приготовления';
 const list=heading.nextElementSibling;
 if(list&&list.tagName==='OL'){
  list.className='timeline-dish';
  list.innerHTML=timeline.map(t=>'<li><span class="timeline-range">'+timeLabel(t.start)+'–'+timeLabel(t.end)+'</span><span>'+esc(t.text)+'</span></li>').join('');
 }
 const note=document.createElement('p');note.className='hint';note.textContent='Время этапов рассчитано ориентировочно и не проверено замерами. '+recipeSafety(r);
 if(list)list.after(note);
 scanPhotos(parent);
}
const style=document.createElement('style');
style.textContent='.timeline-dish{list-style:none;padding:0;margin:13px 0;display:grid;gap:10px}.timeline-dish li{background:#faf6f0;border:1px solid #eee5dc;padding:15px;border-radius:17px;display:grid;gap:7px;line-height:1.5}.timeline-range{font-size:13px;font-weight:850;color:#664ba3;background:#eadff7;display:inline-block;border-radius:12px;padding:6px 10px;width:max-content;letter-spacing:.4px}.dish-photo-credit{position:absolute;bottom:7px;left:7px;z-index:3;background:#fffdf8e9;padding:4px 7px;border-radius:8px;font-size:9px;max-width:calc(100% - 14px)}.dish-photo-credit a{color:#453354;text-decoration:none}.dish-photo.photo:after{content:"Фото похожего блюда";position:absolute;top:7px;right:7px;background:#221a2599;color:white;font-size:9px;padding:5px 6px;border-radius:8px}';
document.head.append(style);
render();scanPhotos();if(typeof cheRenderWeek==='function')cheRenderWeek();
