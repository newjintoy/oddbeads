(()=>{
const groups=[
['기쁨','노랑','도넛 유리','기쁨 즐거움 행복 환희 신남 유쾌함 만족 뿌듯함 흐뭇함 황홀함'],
['사랑','분홍','원석 느낌','사랑 애정 설렘 다정함 애틋함 따뜻함 친밀함 그리움 감사 소중함'],
['평온','초록','도넛 유리','평온 안정 편안함 안도 여유 느긋함 고요함 담담함 차분함 포근함'],
['희망','주황','도자기','희망 기대 자신감 용기 의욕 열정 활력 낙관 결심 당당함'],
['호기심','보라','소용돌이','호기심 놀라움 경이로움 감탄 흥미 신비로움 두근거림 몰입 영감 생동감'],
['슬픔','파랑','도넛 유리','슬픔 외로움 쓸쓸함 서운함 아쉬움 허전함 상실감 우울함 애잔함 먹먹함'],
['불안','청록','원석 느낌','불안 걱정 초조함 긴장 두려움 조바심 망설임 혼란 당혹감 막막함'],
['분노','빨강','도자기','분노 짜증 답답함 억울함 불쾌함 불만 분함 원망 질투 경계심'],
['지침','화이트·크림','도넛 유리','피로 지침 무기력 무료함 공허함 무력감 부담 압박감 체념 회의감'],
['회복','실버','메탈릭','위로 해방감 후련함 홀가분함 충만함 자부심 존중 신뢰 연대감 너그러움']
];
const emotions=groups.flatMap(([group,color,cat,words])=>words.split(' ').map((name,i)=>({name,group,color,cat,i})));

const picks=new Set();let recipe=[],built=false;const $=id=>document.getElementById(id);
function match(e){let list=catalog.filter(b=>b.color===e.color&&b.cat===e.cat);if(!list.length)list=catalog.filter(b=>b.color===e.color);return list[e.i%list.length]}
$('feeling-filters').innerHTML=['전체',...groups.map(g=>g[0])].map((g,i)=>`<button data-group="${g}" aria-pressed="${i===0}" class="${i===0?'on':''}">${g}</button>`).join('');
$('feeling-options').innerHTML=emotions.map((e,i)=>`<button data-emotion="${i}" data-group="${e.group}" aria-pressed="false"><i style="background:${swatches[e.color]}"></i>${e.name}</button>`).join('');
$('feeling-filters').onclick=e=>{const b=e.target.closest('[data-group]');if(!b)return;$('feeling-filters').querySelectorAll('button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});$('feeling-options').querySelectorAll('button').forEach(x=>x.hidden=b.dataset.group!=='전체'&&x.dataset.group!==b.dataset.group)};
function sync(){recipe=[...picks].map(i=>({emotion:emotions[i],bead:match(emotions[i])}));built=false;document.querySelector('.bracelet-panel').hidden=true;document.querySelector('.feeling-workspace').classList.remove('has-bracelet');$('result-details').hidden=true;$('bracelet-title').textContent='PIECES OF ME';$('feeling-count').textContent=String(picks.size).padStart(2,'0');$('build-bracelet').disabled=picks.size!==10;$('feeling-options').querySelectorAll('button').forEach(b=>{const on=picks.has(+b.dataset.emotion);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.disabled=picks.size===10&&!on});$('selection-list').innerHTML=recipe.map(({emotion:e},i)=>`<button data-remove="${[...picks][i]}" aria-label="${e.name} 선택 해제">${e.name} ×</button>`).join('')||'<span>서로 다른 마음도 함께 골라도 좋아</span>';
$('bracelet-beads').innerHTML=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2;const x=50+40*Math.cos(a),y=50+40*Math.sin(a);const item=recipe[i];return `<div class="bracelet-slot ${item?'filled':''}" style="left:${x}%;top:${y}%;--turn:${a*180/Math.PI+90}deg;--delay:${i*45}ms">${item?`<img src="assets/cutouts/${item.bead.id}.png" alt="${item.emotion.name} · ${item.bead.color} 비즈">`:'<span>+</span>'}</div>`}).join('');$('preview-caption').textContent=picks.size?`${picks.size}개의 조각이 모였어 · 10개를 골라 완성해봐`:'요즘의 너를 닮은 조각이 여기에 모일 거야';$('status').textContent='';}
$('feeling-options').onclick=e=>{const b=e.target.closest('[data-emotion]');if(!b)return;const id=+b.dataset.emotion;if(picks.has(id))picks.delete(id);else if(picks.size<10)picks.add(id);sync()};
$('selection-list').onclick=e=>{const b=e.target.closest('[data-remove]');if(b){picks.delete(+b.dataset.remove);sync()}};
$('reset-feelings').onclick=()=>{picks.clear();sync()};
$('build-bracelet').onclick=showBracelet;function showBracelet(){if(picks.size!==10)return;document.querySelector('.bracelet-panel').hidden=false;document.querySelector('.feeling-workspace').classList.add('has-bracelet');built=true;$('bracelet-title').textContent='MY ODD BRACELET';$('bracelet-preview').classList.remove('celebrate');void $('bracelet-preview').offsetWidth;$('bracelet-preview').classList.add('celebrate');$('result-details').hidden=false;$('preview-caption').textContent='요즘의 나를 담은 10개의 조각';$('recipe-list').innerHTML=recipe.map(({emotion:e,bead:b},i)=>`<li><span>${String(i+1).padStart(2,'0')} / ${e.name}</span><small>${b.color} · ${b.cat}</small></li>`).join('');const total=recipe.reduce((s,x)=>s+beadUnitPrices[x.bead.cat],0);$('beads-price').textContent=total.toLocaleString()+'원';$('bracelet-price').textContent=(7000+total).toLocaleString()+'원';$('status').textContent='너를 닮은 팔찌가 완성됐어';document.querySelector('.bracelet-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});};
function addToCart(go){if(!built||recipe.length!==10)return;try{let cart=JSON.parse(localStorage.getItem('oddbeads-cart-v1')||'[]');if(!Array.isArray(cart))cart=[];const total=recipe.reduce((s,x)=>s+beadUnitPrices[x.bead.cat],0);cart.push({key:Date.now().toString(36)+Math.random().toString(36).slice(2,7),product:'bracelet',name:'팔찌',length:16,unit:'cm',beadMM:10,basePrice:7000,beadTotal:total,unitTotal:7000+total,quantity:1,provisional:true,emotions:recipe.map(x=>x.emotion.name),items:recipe.map(({bead:b})=>({id:b.id,name:b.name,color:b.color,category:b.cat,unitPrice:beadUnitPrices[b.cat],image:`assets/cutouts/${b.id}.png`}))});localStorage.setItem('oddbeads-cart-v1',JSON.stringify(cart));if(go)location.href='checkout.html';else $('status').textContent='팔찌를 장바구니에 담았어'}catch{$('status').textContent='브라우저 저장 공간을 확인해줘'}}
$('bracelet-cart').onclick=()=>addToCart(false);$('bracelet-buy').onclick=()=>addToCart(true);
$('bracelet-custom').onclick=()=>{try{sessionStorage.setItem('oddbeads-emotion-design',JSON.stringify(recipe.map(x=>x.bead.id)));sessionStorage.setItem('oddbeads-emotion-product','bracelet');location.href='custom.html'}catch{$('status').textContent='브라우저 저장을 허용한 뒤 다시 눌러줘'}};
sync();
})();
