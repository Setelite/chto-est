/* Enhanced recipe cards v1.5. External photographs are illustrative, not exact plated recipes.
   Non-photographed recipes use illustrated emoji tiles; no fabricated photos. */
const foodPhotos={}; // Фотографии подбираются с указанием открытой лицензии в recipe-timeline.js.
const refinedRecipes={
'Рис с курицей':{
 note:'Рис взвешивай сухим, курицу — до приготовления. Лук можно исключить.',
 steps:['Промой сухой рис 2–3 раза, залей водой в соответствии с инструкцией на упаковке и отвари до готовности.','Нарежь курицу одинаковыми небольшими кусочками. Сырой продукт держи отдельно от готовых ингредиентов.','Если есть лук, нарежь его и слегка припусти на сковороде с небольшим количеством воды или масла.','Добавь курицу и готовь до полной готовности; внутри мясо должно достичь не менее 74 °C.','Соедини с готовым рисом, прогрей и подавай сразу.']},
'Омлет с сыром':{note:'Молоко добавляется по желанию. Яйца необходимо полностью приготовить.',steps:['Разбей яйца в миску, взбей вилкой до однородности.','Если используешь молоко, добавь его к яйцам.','Натри сыр на мелкой тёрке.','Вылей смесь на предварительно разогретую сковороду с антипригарным покрытием.','Когда омлет начнёт схватываться, посыпь сыром, накрой крышкой и готовь до полной готовности яиц.']},
'Макароны с сыром':{steps:['Вскипяти воду в кастрюле, при желании немного посоли.','Отвари макароны согласно инструкции на упаковке до нужной мягкости.','Слей воду, оставив 1–2 столовые ложки жидкости от варки.','Добавь натёртый сыр и немного оставленной воды, перемешивай до кремовой текстуры.','Подавай сразу после приготовления.']},
'Сырники':{note:'Указанные количества — ориентир. Количество муки зависит от влажности творога.',steps:['Разомни творог вилкой.','Добавь яйцо и муку понемногу: тесто должно держать форму, но не быть слишком плотным.','Смоченными руками сформируй небольшие сырники.','Выложи на сковороду с небольшим количеством масла и готовь на умеренном огне.','Переверни и доведи до полной готовности внутри.']},
'Картофельное пюре':{steps:['Очисти картофель и нарежь на приблизительно равные кусочки.','Выложи в кастрюлю, залей водой и доведи до кипения.','Вари до мягкости: картофель должен легко протыкаться вилкой.','Слей воду, хорошо разомни картофель.','Подливай понемногу подогретое молоко до нужной консистенции; масло добавь по желанию.']},
'Курица с картофелем':{note:'Время в духовке зависит от размера кусочков. Контролируй готовность курицы термометром.',steps:['Разогрей духовку до 200 °C.','Нарежь картофель на некрупные дольки, курицу — на равные части.','Выложи продукты в форму в один слой, при желании добавь немного масла и специи.','Запекай, проверяя мягкость картофеля и температуру курицы.','Подавай после достижения внутри курицы как минимум 74 °C.']},
'Творог с бананом':{steps:['Вымой и очисти банан.','Нарежь кружочками или разомни вилкой.','Добавь к творогу и перемешай.','При желании охлади 5 минут перед подачей.']},
'Овсянка с бананом':{steps:['Налей в кастрюлю воду или молоко, доведи до слабого кипения.','Всыпь овсяные хлопья и готовь время, указанное на упаковке, помешивая.','Нарежь банан небольшими кусочками.','Добавь банан к готовой каше и перемешай.']},
'Яичница с помидорами':{steps:['Вымой помидоры и нарежь небольшими кубиками.','Прогрей помидоры на сковороде, чтобы часть жидкости выпарилась.','Разбей яйца поверх помидоров.','Готовь до полной готовности белков и желтков.']},
'Салат из огурцов':{steps:['Тщательно промой огурцы.','Нарежь тонкими кружочками или полукольцами.','При желании добавь укроп, немного масла или натурального йогурта.','Перемешай и подавай свежим.']},
'Омлет с грибами':{steps:['Промой и нарежь грибы.','Приготовь грибы на сковороде до полной готовности.','Взбей яйца и вылей поверх грибов.','Готовь на умеренном огне под крышкой до полной готовности яиц.']},
'Гречка с грибами':{steps:['Промой гречку и отвари до готовности.','Нарежь грибы и лук; лук можно не добавлять.','Прогрей грибы на сковороде до полной готовности.','Смешай с гречкой и прогрей ещё 1–2 минуты.']},
'Паста с курицей':{steps:['Свари макароны согласно времени на упаковке.','Нарежь курицу одинаковыми кусочками, не смешивай сырое мясо с готовой пастой.','Готовь курицу на сковороде до внутренней температуры не менее 74 °C.','Смешай курицу с пастой, при необходимости добавь немного воды от варки.']},
'Рис с овощами':{steps:['Промой рис и отвари по инструкции на упаковке.','Очисти и нарежь морковь и лук небольшими кусочками.','Туши овощи с небольшим количеством воды до мягкости.','Соедини овощи с рисом, прогрей и подавай.']}
};
function foodTile(r,large=false){
 const pic=foodPhotos[r.name],sz=large?'large':'';
 if(!pic)return '<div class="food-art '+sz+'" aria-hidden="true"><span>'+r.emoji+'</span><i class="food-circle"></i></div>';
 return '<div class="food-art photo '+sz+'"><img src="'+esc(pic.url)+'" loading="lazy" decoding="async" alt="Иллюстрация блюда: '+esc(r.name)+'" onerror="this.style.display=&#39;none&#39;;this.parentNode.classList.remove(&#39;photo&#39;);this.parentNode.querySelector(&#39;span&#39;).style.display=&#39;block&#39;"><span style="display:none">'+r.emoji+'</span></div>';
}
card=function(r){
 const missing=r.missing||cheNeedsFallback(r),needed=missing.length;
 return '<article class="recipe recipe-upgraded">'+foodTile(r)+'<div class="recipe-main"><div class="recipe-brow">ИДЕЯ ДЛЯ СЕГОДНЯ</div><h3 class="rtitle">'+esc(r.name)+'</h3><div class="meta">⏱ '+r.min+' минут · '+document.querySelector('#portions').value+' порц.</div><span class="pill '+(needed?'missing':'')+'">'+(needed?'Не хватает: '+esc(missing.join(', ')):'Все основные продукты отмечены')+'</span><div class="rbuttons"><button class="outline" data-open="'+r.id+'">Смотреть рецепт</button><button class="fav '+(favs.includes(r.id)?'on':'')+'" data-fav="'+r.id+'" aria-label="Избранное">'+(favs.includes(r.id)?'♥':'♡')+'</button></div></div></article>'
};
function cheNeedsFallback(r){const optional=optionalByName[r.name]||[];return r.need.filter(n=>!have.map(canon).includes(n)&&!optional.includes(n))}
openRecipe=function(id){
 const r=recipes[id],stock=new Set(have.map(canon)),optional=optionalByName[r.name]||[],good=refinedRecipes[r.name],steps=good?.steps||r.steps,photo=foodPhotos[r.name];
 document.querySelector('#recipeDetail').innerHTML=
 foodTile(r,true)+'<span class="eyebrow" style="display:block;margin-top:16px">⏱ '+r.min+' мин · '+qPortions()+' порц.</span><h2>'+esc(r.name)+'</h2>'+
 (photo?'<p class="hint">'+esc(photo.by)+'</p>':'<p class="hint">Стилизованная иллюстрация, не фото готового блюда.</p>')+
 '<h3>Ингредиенты на '+qPortions()+' порц.</h3><ul class="ingredients-expanded">'+r.need.map(n=>'<li><b>'+esc(n)+'</b><span>'+esc(qFmt(qFor(r,n).qty,qFor(r,n).unit))+'</span><small>'+(stock.has(n)?'Отмечено дома':optional.includes(n)?'Необязательно':'Докупить')+'</small></li>').join('')+'</ul>'+
 '<p class="hint"><strong>Важно:</strong> ориентировочные количества, не проверенная технологическая карта. Наличие продукта дома не означает достаточное количество. Крупы и макароны указаны в сухом виде, курица — в сыром. '+esc(good?.note||'')+'</p>'+
 '<h3>Пошаговое приготовление</h3><ol class="steps steps-expanded">'+steps.map(st=>'<li>'+esc(st)+'</li>').join('')+'</ol>'+
 '<button class="primary" data-qadd="'+id+'">🛍 Докупить недостающее</button><button class="ghost" style="width:100%;margin-top:8px" data-qall="'+id+'">Добавить все основные продукты</button>';
 document.querySelector('#recipeDialog').showModal()
};
const foodCardStyle=document.createElement('style');
foodCardStyle.textContent='.recipe-upgraded{padding:9px;overflow:hidden}.recipe-upgraded .food-art{height:150px;width:100%;border-radius:18px}.food-art{position:relative;background:radial-gradient(circle at 28% 32%,#fffdf2 0 12%,transparent 13%),linear-gradient(125deg,#ece1fa,#f4e4d4 45%,#dfeee2);display:grid;place-items:center;overflow:hidden}.food-art>span{font-size:76px;position:relative;z-index:2;filter:drop-shadow(0 9px 7px #48301d21)}.food-art .food-circle{position:absolute;width:145px;height:145px;border-radius:50%;background:#fff9f0b0;box-shadow:0 8px 24px #4e35441a}.food-art.photo img{width:100%;height:100%;object-fit:cover}.food-art.large{height:180px;border-radius:20px}.food-art.large>span{font-size:92px}.recipe-main{padding:13px 9px 7px}.recipe-brow{font-size:10px;letter-spacing:1.6px;color:#8a76a3;font-weight:800;margin-bottom:7px}.recipe-main .rtitle{font-size:19px}.recipe-main .rbuttons{margin-top:13px}.ingredients-expanded{padding:0;list-style:none}.ingredients-expanded li{display:flex;justify-content:space-between;gap:5px;align-items:center;padding:11px 0;border-bottom:1px solid #ede6de;flex-wrap:wrap}.ingredients-expanded li small{width:100%;color:#89808b;font-size:11px}.steps-expanded{counter-reset:steps;list-style:none;padding:0}.steps-expanded li{counter-increment:steps;position:relative;padding:12px 12px 12px 48px;background:#f8f4ef;border-radius:14px;margin:9px 0}.steps-expanded li:before{content:counter(steps);position:absolute;left:10px;top:11px;width:27px;height:27px;display:grid;place-items:center;border-radius:10px;background:#e6dbf8;color:#5f4988;font-weight:800}';
document.head.append(foodCardStyle);
render();
if(typeof cheSearch==='function')cheSearch();
