/* ЧТО ЕСТЬ?: граммовки и умный список покупок. Примерные нормы на одну порцию. */
const unitBase={
"Курица":[150,"г"],"Яйца":[2,"шт"],"Картофель":[220,"г"],"Рис":[70,"г"],"Макароны":[80,"г"],"Помидоры":[120,"г"],"Сыр":[45,"г"],"Огурцы":[110,"г"],"Гречка":[70,"г"],"Лук":[50,"г"],"Морковь":[75,"г"],"Молоко":[150,"мл"],"Творог":[180,"г"],"Грибы":[150,"г"],"Хлеб":[2,"ломт."],"Масло":[10,"мл"],"Банан":[1,"шт"],"Яблоки":[1,"шт"],"Овсянка":[60,"г"],"Тунец":[100,"г"],"Сливки":[90,"мл"],"Лаваш":[1,"шт"],"Йогурт":[150,"г"],"Авокадо":[0.5,"шт"],"Мука":[40,"г"],"Мёд":[15,"г"]
};
const perDish={
"Омлет с сыром":{"Яйца":2,"Сыр":35,"Молоко":30},
"Яичница с помидорами":{"Яйца":2,"Помидоры":100},
"Сырники":{"Творог":180,"Яйца":0.5,"Мука":30},
"Ленивые вареники":{"Творог":160,"Яйца":0.5,"Мука":50},
"Творожная запеканка":{"Творог":180,"Яйца":0.5,"Мука":25},
"Картофельное пюре":{"Картофель":220,"Молоко":50,"Масло":10},
"Рис с курицей":{"Рис":70,"Курица":150,"Лук":35},
"Паста с курицей":{"Макароны":80,"Курица":140},
"Курица с картофелем":{"Курица":160,"Картофель":230},
"Салат из огурцов":{"Огурцы":180},
"Салат из помидоров":{"Помидоры":200},
"Банановый смузи":{"Банан":1,"Молоко":220},
"Овсянка с бананом":{"Овсянка":55,"Банан":1,"Молоко":180},
"Горячие бутерброды с сыром":{"Хлеб":2,"Сыр":50}
};
const qPortions=()=>Number(document.querySelector('#portions').value)||2;
function qFor(recipe,name){const base=unitBase[name]||[1,"шт"];return {qty:Math.round((perDish[recipe.name]?.[name]??base[0])*qPortions()*10)/10,unit:base[1]}}
const qFmt=(q,unit)=>Number(q).toLocaleString("ru-RU",{maximumFractionDigits:1})+" "+unit;
function addMeasured(name,amount){const original=shop.find(x=>canon(x.name)===canon(name));if(!original){shop.push({name,done:false,qty:amount.qty,unit:amount.unit});return}
if(original.qty==null){original.qty=amount.qty;original.unit=amount.unit;original.done=false;return}
if(original.unit===amount.unit){original.qty=Math.round((Number(original.qty)+amount.qty)*10)/10;original.done=false}
}
function qAddRecipe(recipe,all){const stock=new Set(have.map(canon)),optional=optionalByName[recipe.name]||[];
for(const ingredient of recipe.need){if(optional.includes(ingredient))continue;if(!all&&stock.has(ingredient))continue;addMeasured(ingredient,qFor(recipe,ingredient))}
save();render();document.querySelector('#recipeDialog').close();changeTab('shop')}
openRecipe=function(id){const r=recipes[id],optional=optionalByName[r.name]||[],stock=new Set(have.map(canon)),portions=qPortions();
document.querySelector('#recipeDetail').innerHTML='<div style="font-size:55px;margin-bottom:9px">'+r.emoji+'</div><span class="eyebrow">⏱ '+r.min+' мин · '+portions+' порц.</span><h2>'+esc(r.name)+'</h2><h3>Ингредиенты на '+portions+' порц.</h3><ul>'+r.need.map(n=>'<li><b>'+esc(n)+'</b> — '+esc(qFmt(qFor(r,n).qty,qFor(r,n).unit))+' '+(stock.has(n)?'✓ есть дома':optional.includes(n)?'· по желанию':'· докупить')+'</li>').join('')+'</ul><p class="hint">Количество ориентировочное, а не точная рецептура. Наличие дома не означает достаточный запас. Крупы и макароны — в сухом виде, мясо — в сыром виде.</p><h3>Как приготовить</h3><ol class="steps">'+r.steps.map(st=>'<li>'+esc(st)+'</li>').join('')+'</ol><button class="primary" data-qadd="'+r.id+'">🛍 Докупить недостающее</button><button class="ghost" style="width:100%;margin-top:8px" data-qall="'+r.id+'">Добавить все основные продукты</button>';
document.querySelector('#recipeDialog').showModal()};
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;const id=b.dataset.qadd??b.dataset.qall;if(id===undefined)return;event.stopImmediatePropagation();event.preventDefault();qAddRecipe(recipes[Number(id)],b.dataset.qall!==undefined)},true);
const qOldRender=render;
render=function(){qOldRender();document.querySelectorAll('#shopList .listitem').forEach((row,i)=>{const item=shop[i];if(item?.qty==null)return;const span=row.querySelector('.checkline span');if(!span)return;span.textContent=item.name+' — '+qFmt(item.qty,item.unit||'')});};
const qOldCopy=document.querySelector('#copyShop').onclick;
document.querySelector('#copyShop').onclick=async()=>{const message=shop.filter(x=>!x.done).map(x=>'• '+x.name+(x.qty!=null?' — '+qFmt(x.qty,x.unit||''):'')).join('\n')||'Список пуст';try{await navigator.clipboard.writeText(message);document.querySelector('#copyShop').textContent='✓ Скопировано'}catch{alert(message)}};
render();
