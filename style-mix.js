(()=>{
const $=id=>document.getElementById(id);
const STYLES=[
 ['스트릿','STREET','거칠고 반짝이는 도시의 무드',['블랙','회색','실버','빨강'],['메탈릭','도넛 유리','포인트 참']],
 ['빈티지','VINTAGE','오래된 서랍 속 보물 같은 무드',['베이지','골드','초록','주황'],['앤티크 실버','도자기','원석 느낌']],
 ['모던','MODERN','차갑고 정돈된 도시의 무드',['블랙','실버','회색','화이트·크림'],['메탈릭','도넛 유리']],
 ['깔끔','CLEAN','맑고 단정한 하루의 무드',['화이트·크림','투명','실버','민트'],['도자기','도넛 유리']],
 ['심플','SIMPLE','과하지 않게, 한 끗만 남기는 무드',['화이트·크림','블랙','실버'],['메탈릭','도자기']],
 ['러블리','LOVELY','말랑하고 다정한 무드',['분홍','보라','화이트·크림'],['도자기','포인트 참','도넛 유리']],
 ['펑키','FUNKY','색을 다 꺼내 쓰는 신나는 무드',['빨강','노랑','파랑','초록','주황'],['소용돌이','도넛 유리','포인트 참']],
 ['내추럴','NATURAL','숲과 돌, 흙의 차분한 무드',['초록','베이지','민트','회색'],['원석 느낌','도자기']],
 ['클래식','CLASSIC','오래 두고 차는 단정한 무드',['골드','블랙','화이트·크림'],['앤티크 실버','메탈릭']],
 ['큐티','CUTE','작고 귀여운 것들만 모은 무드',['분홍','노랑','민트','화이트·크림'],['포인트 참','도자기','도넛 유리']]
];
const N=15,BASE=7000,won=n=>n.toLocaleString()+'원';
let cur=null,round=0;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function pool(st){let l=catalog.filter(b=>st[3].includes(b.color)&&st[4].includes(b.cat));if(l.length<12)l=catalog.filter(b=>st[3].includes(b.color));return l}
function make(st,k){const r=rng((STYLES.indexOf(st)+1)*997+round*131+k*7919),p=pool(st);
  const accent=p.filter(b=>b.cat==='포인트 참'),base=p.filter(b=>b.cat!=='포인트 참');
  const pickN=(a,n)=>{const c=a.slice(),o=[];while(o.length<n&&c.length)o.push(c.splice(r()*c.length|0,1)[0]);return o};
  const cols=[...new Set(p.map(b=>b.color))];const main=pickN(cols,Math.min(3,cols.length));
  const fav=base.filter(b=>main.includes(b.color));const src=fav.length>=6?fav:base.length?base:p;
  const seed=pickN(src,Math.min(5,src.length));const out=[];
  for(let i=0;i<N;i++){out.push(seed[i%seed.length])}
  if(accent.length){const a=pickN(accent,2);out[3]=a[0];if(a[1])out[10]=a[1]}
  return out}
function render(){const st=cur;$('empty').hidden=true;$('result').hidden=false;
  $('result-title').innerHTML=`<em>${st[0]}</em> 팔찌 추천`;$('result-desc').textContent=`${st[2]} · 팔찌 15cm / 10mm / 비즈 ${N}개 기준`;
  $('recs').innerHTML=[0,1,2].map(k=>{const beads=make(st,k),tot=beads.reduce((s,b)=>s+(beadUnitPrices[b.cat]||0),0);
    const ring=beads.map((b,i)=>{const a=i/N*Math.PI*2-Math.PI/2;return `<i style="left:${50+38*Math.cos(a)}%;top:${50+38*Math.sin(a)}%;animation-delay:${i*35+k*60}ms"><img src="assets/cutouts/${b.id}.png" alt="${b.color} ${b.name}"></i>`}).join('');
    const cols=[...new Set(beads.map(b=>b.color))],cats=[...new Set(beads.map(b=>b.cat))];
    return `<article class="rec" data-k="${k}"><div class="rec-top"><span>${st[1]} / 0${k+1}</span><span>${won(BASE+tot)}</span></div><div class="rec-ring">${ring}<b>${st[0]}</b></div>
    <div class="rec-chips">${cols.map(c=>`<span>${c}</span>`).join('')}${cats.map(c=>`<span>${c}</span>`).join('')}</div>
    <div class="rec-price"><span>팔찌 기본 ${won(BASE)} + 비즈 ${won(tot)}</span><strong>${won(BASE+tot)}</strong></div>
    <div class="rec-btns"><button data-act="cart">장바구니 담기</button><button data-act="custom">직접 더 다듬기 ↗</button></div></article>`}).join('');
  recipes=[0,1,2].map(k=>make(st,k))}
let recipes=[];
$('style-chips').innerHTML=STYLES.map((s,i)=>`<button data-i="${i}" aria-pressed="false">${s[0]}<small>${s[1]}</small></button>`).join('');
$('style-chips').onclick=e=>{const b=e.target.closest('[data-i]');if(!b)return;cur=STYLES[+b.dataset.i];round=0;document.querySelectorAll('#style-chips button').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});render();$('result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'})};
$('more').onclick=()=>{if(!cur)return;round++;render()};
function notify(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(notify.t);notify.t=setTimeout(()=>e.style.display='none',2400)}
$('recs').onclick=e=>{const b=e.target.closest('[data-act]');if(!b)return;const k=+b.closest('.rec').dataset.k,beads=recipes[k];
  if(b.dataset.act==='custom'){try{sessionStorage.setItem('oddbeads-emotion-design',JSON.stringify(beads.map(x=>x.id)));sessionStorage.setItem('oddbeads-emotion-product','bracelet');location.href='custom.html'}catch{notify('브라우저 저장을 허용한 뒤 다시 눌러줘')}return}
  try{let cart=JSON.parse(localStorage.getItem('oddbeads-cart-v1')||'[]');if(!Array.isArray(cart))cart=[];const total=beads.reduce((s,x)=>s+beadUnitPrices[x.cat],0);
   cart.push({key:Date.now().toString(36)+Math.random().toString(36).slice(2,7),product:'bracelet',name:'팔찌',length:15,unit:'cm',beadMM:10,basePrice:BASE,beadTotal:total,unitTotal:BASE+total,quantity:1,provisional:true,style:cur[0],items:beads.map(x=>({id:x.id,name:x.name,color:x.color,category:x.cat,unitPrice:beadUnitPrices[x.cat],image:`assets/cutouts/${x.id}.png`}))});
   localStorage.setItem('oddbeads-cart-v1',JSON.stringify(cart));document.querySelectorAll('.cart-count,#cart-count').forEach(el=>el.textContent=cart.reduce((s,x)=>s+(x.quantity||1),0));notify(`${cur[0]} 팔찌를 장바구니에 담았어`)}catch{notify('장바구니를 저장할 수 없어')}};
})();
