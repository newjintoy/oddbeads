/* ODDBEADS custom studio — one connected workbench: 3D bench, wearing, strand strip and bead tray share the same state. */
(()=>{
const T=window.THREE,$=id=>document.getElementById(id);
const P={necklace:{name:'목걸이',base:13000,min:35,max:45,step:.5},bracelet:{name:'팔찌',base:7000,min:12,max:15,step:.5},ring:{name:'반지',base:5000}};
const S={product:'necklace',mode:'bench',size:{necklace:45,bracelet:15,ring:12},mm:{necklace:10,bracelet:10,ring:6},
  slots:{necklace:[],bracelet:[],ring:[]},hist:{necklace:[],bracelet:[],ring:[]},sel:-1,char:'f',view:'front'};
let category='전체',colors=new Set(),texture='',query='';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const won=n=>n.toLocaleString()+'원';
function notify(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(notify.t);notify.t=setTimeout(()=>e.style.display='none',2400)}
const ringDia=n=>12.97+(n-1)/3;
const cap=(p=S.product)=>{const m=S.mm[p];return p==='ring'?Math.max(5,Math.floor(Math.PI*(ringDia(S.size.ring)+m)/m)):Math.max(6,Math.floor(S.size[p]*10/m))};
const Rad=(p=S.product)=>p==='ring'?(ringDia(S.size.ring)+S.mm.ring)/20:S.size[p]/(2*Math.PI);
const all=(p=S.product)=>{const a=S.slots[p];while(a.length<120)a.push(null);return a};
const cur=()=>all().slice(0,cap());
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const backOut=t=>{const c1=1.9,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
function checkpoint(){const h=S.hist[S.product];h.push(all().slice());if(h.length>60)h.shift()}

/* ------------------------------------------------ white filler beads */
const whiteURL=[];
function whiteCanvas(v){const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');g.save();g.beginPath();g.arc(80,80,70,0,7);g.clip();
  let r=g.createRadialGradient(58,52,8,80,80,74);r.addColorStop(0,'#ffffff');r.addColorStop(.5,'#f3f0e8');r.addColorStop(1,'#c9c4b6');g.fillStyle=r;g.fillRect(0,0,160,160);
  if(v===1){g.strokeStyle='rgba(120,112,96,.26)';g.lineWidth=2.2;for(let k=-4;k<=4;k++){g.beginPath();g.ellipse(80,80,Math.abs(k)*16+2,72,0,0,7);g.stroke()}}
  if(v===2){let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let k=0;k<190;k++){g.fillStyle=`rgba(${120+rnd()*40|0},${110+rnd()*30|0},${95+rnd()*30|0},${.16+rnd()*.3})`;g.beginPath();g.arc(rnd()*160,rnd()*160,.8+rnd()*2.2,0,7);g.fill()}}
  if(v===0){g.strokeStyle='rgba(120,112,96,.18)';g.lineWidth=2;g.beginPath();g.arc(80,80,54,.3,2.2);g.stroke();g.beginPath();g.arc(80,80,40,3.6,5.4);g.stroke()}
  g.restore();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(55,48,17,10,-.6,0,7);g.fill();g.fillStyle='rgba(60,54,44,.16)';g.beginPath();g.arc(80,80,9,0,7);g.fill();
  g.strokeStyle='rgba(90,84,70,.35)';g.lineWidth=2.5;g.beginPath();g.arc(80,80,70,0,7);g.stroke();return c}
const whiteTex=[0,1,2].map(v=>{const c=whiteCanvas(v);whiteURL[v]=c.toDataURL();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t});
const whiteScale=160/140;

/* ------------------------------------------------ bead photo textures */
const texCache=new Map();
function beadRec(id){let r=texCache.get(id);if(r)return r;r={tex:null,asp:1,ready:true,cbs:[]};texCache.set(id,r);return r}

/* ------------------------------------------------ renderer / scene */
let gl=true,renderer;
try{renderer=new T.WebGLRenderer({canvas:$('gl'),antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace}catch(e){gl=false;$('gl-fail').hidden=false}
const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,1,.1,600);
scene.add(new T.HemisphereLight(0xffffff,0xd8cfc0,1.7));const sun=new T.DirectionalLight(0xffffff,2.1);sun.position.set(-20,40,50);scene.add(sun);
const pieceRoot=new T.Group();scene.add(pieceRoot);
const benchGroup=new T.Group();scene.add(benchGroup);
const wearRoot=new T.Group();scene.add(wearRoot);const neckRoot=new T.Group();wearRoot.add(neckRoot);
const handRoot=new T.Group();scene.add(handRoot);handRoot.visible=false;

/* bench decor: soft disc + cm ruler ring */
function radialTex(stops,size=256){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');const r=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);stops.forEach(([o,col])=>r.addColorStop(o,col));g.fillStyle=r;g.fillRect(0,0,size,size);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
const discTex=radialTex([[0,'rgba(255,253,247,.95)'],[.7,'rgba(255,253,247,.7)'],[1,'rgba(255,253,247,0)']]);
const disc=new T.Mesh(new T.CircleGeometry(1,64),new T.MeshBasicMaterial({map:discTex,transparent:true,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.y=-.62;disc.renderOrder=-3;benchGroup.add(disc);
const ruler=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({transparent:true,depthWrite:false}));ruler.rotation.x=-Math.PI/2;ruler.position.y=-.6;ruler.renderOrder=-2;benchGroup.add(ruler);
function buildRuler(){const p=S.product,Rr=Rad(p),Ro=Rr+1.9,half=Ro+.3,px=1024,k=px/2/half;const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d');g.translate(px/2,px/2);
  g.strokeStyle='rgba(32,32,30,.55)';g.fillStyle='rgba(32,32,30,.7)';g.lineWidth=2;g.beginPath();g.arc(0,0,(Rr+.85)*k,0,7);g.stroke();
  if(p==='ring'){g.font='600 30px Helvetica,Arial';g.textAlign='center';g.fillText(`${S.size.ring}호  Ø ${ringDia(S.size.ring).toFixed(1)}mm`,0,(Rr+1.55)*k+10)}
  else{const L=S.size[p];for(let i=0;i<=Math.floor(L);i++){const a=-Math.PI/2+i/L*Math.PI*2,big=i%5===0,r0=(Rr+.85)*k,r1=r0+(big?.5:.25)*k;g.lineWidth=big?3:1.6;g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);g.lineTo(Math.cos(a)*r1,Math.sin(a)*r1);g.stroke();
    if(big&&i<L-.1){g.font='600 26px Helvetica,Arial';g.textAlign='center';g.textBaseline='middle';const rr=r1+22;g.fillText(String(i),Math.cos(a)*rr,Math.sin(a)*rr)}}
    g.font='600 30px Helvetica,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(L+'cm',0,0)}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;if(ruler.material.map)ruler.material.map.dispose();ruler.material.map=t;ruler.material.needsUpdate=true;ruler.scale.setScalar(half);disc.scale.setScalar(Ro+2.2)}

/* ------------------------------------------------ characters + hand */
const CH={
 t:{name:'남성 · 티셔츠',s:29.6,nr:3.4,views:{front:{img:'necklace-character-male-tshirt-v1.png',cx:512,y0:822,yaw:0},side:{img:'necklace-character-male-tshirt-side-v1.png',cx:560,y0:806,yaw:-Math.PI/2},back:{img:'necklace-character-male-tshirt-back-v1.png',cx:516,y0:822,yaw:Math.PI}}},
 m:{name:'남성 · 민소매',s:29.6,nr:5.6,views:{front:{img:'necklace-character-male-v1.png',cx:512,y0:822,yaw:0}}},
 f:{name:'여성',s:27.2,nr:4.6,views:{front:{img:'tryon-woman-clean-v1.png',cx:512,y0:670,yaw:0}}}};
const VIEWNAME={front:'정면',side:'옆',back:'뒤'};
const charMesh=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({transparent:true,alphaTest:.5,side:T.DoubleSide}));wearRoot.add(charMesh);wearRoot.visible=false;
const charTex=new Map();
const domChar=document.createElement('img');domChar.className='local-tryon-character';domChar.alt='목걸이 착용 모델';$('stage').append(domChar);
function loadChar(){const c=CH[S.char],v=c.views[S.view]||c.views.front;neckRoot.rotation.y=v.yaw;charMesh.visible=false;const filename=(S.char==='t'&&S.view==='front')?'tryon-male-full-shoulders.png':v.img;domChar.src='assets/'+filename;domChar.onload=()=>{const full=filename==='tryon-male-full-shoulders.png';const cx=full?domChar.naturalWidth*.5:v.cx,y0=full?domChar.naturalHeight*.435:v.y0;charMesh.scale.set(domChar.naturalWidth/c.s,domChar.naturalHeight/c.s,1);charMesh.position.set((domChar.naturalWidth/2-cx)/c.s,(y0-domChar.naturalHeight/2)/c.s,0)}}
const skin=new T.MeshStandardMaterial({color:0xe9c0a3,roughness:.68});
const hand={fore:new T.Mesh(new T.CylinderGeometry(1.7,2,16,40),skin),palm:new T.Mesh(new T.SphereGeometry(1,40,28),skin),fing:[],thumb:null};
hand.palm.scale.set(3.4,4.2,1.45);hand.palm.position.set(0,4.3,0);handRoot.add(hand.fore,hand.palm);
const FX=[-2.4,-.8,.75,2.2],FL=[6.6,7.5,7.0,5.6],FA=[.16,.05,0,-.13];
FX.forEach((x,i)=>{const m=new T.Mesh(new T.CapsuleGeometry(.76,FL[i]-1.52,6,16),skin);const th=FA[i];m.rotation.z=th;m.position.set(x-Math.sin(th)*FL[i]/2,7.5+Math.cos(th)*FL[i]/2,0);handRoot.add(m);hand.fing.push(m)});
hand.thumb=new T.Mesh(new T.CapsuleGeometry(.85,4,6,16),skin);hand.thumb.rotation.z=.95;hand.thumb.position.set(-3-Math.sin(.95)*2.8,2.4+Math.cos(.95)*2.8,.15);handRoot.add(hand.thumb);
const RING_Y=10.3,RING_X=FX[2];
const handScale=()=>S.product==='bracelet'?.72:1;
function fitHand(){const p=S.product,hs=handScale();handRoot.scale.setScalar(hs);
  const wr=p==='bracelet'?Math.max(1.2,Math.min(2.7,(Rad('bracelet')-S.mm.bracelet/20-.1)/hs)):1.8;hand.fore.geometry.dispose();hand.fore.geometry=new T.CylinderGeometry(wr*.93,wr*1.12,16,40);hand.fore.position.y=-8;
  const fr=p==='ring'?Math.max(.55,Math.min(1.15,ringDia(S.size.ring)/20-.02)):.78;const L=FL[2];hand.fing[2].geometry.dispose();hand.fing[2].geometry=new T.CapsuleGeometry(fr,Math.max(.5,L-2*fr),6,16)}

/* ------------------------------------------------ bead sprites */
const ringTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.strokeStyle='#f03c27';g.lineWidth=7;g.beginPath();g.arc(64,64,56,0,7);g.stroke();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2;g.beginPath();g.arc(64,64,61,0,7);g.stroke();const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t})();
const selRing=new T.Sprite(new T.SpriteMaterial({map:ringTex,transparent:true,depthTest:false,depthWrite:false}));selRing.renderOrder=20;selRing.visible=false;pieceRoot.add(selRing);
const shadowTex=radialTex([[0,'rgba(40,34,24,.34)'],[.6,'rgba(40,34,24,.14)'],[1,'rgba(40,34,24,0)']],128);
const threadMat=new T.MeshBasicMaterial({color:0xb9a384,depthWrite:false});let thread=null,threadDirty=true;
let beads=[];const tmpV=new T.Vector3(),tmpV2=new T.Vector3(),tmpV3=new T.Vector3(),raycaster=new T.Raycaster();
const trans={k:1,dur:.9,fromXf:{p:new T.Vector3(),q:new T.Quaternion()}};
function clearBeads(){beads.forEach(b=>b.photo?.remove());beads.forEach(b=>{pieceRoot.remove(b.sp);b.sp.material.dispose();benchGroup.remove(b.sh)});beads=[];if(thread){pieceRoot.remove(thread);thread.geometry.dispose();thread=null}}
function rebuildBeads(){clearBeads();const n=cap();for(let i=0;i<n;i++){const sp=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false}));sp.renderOrder=2;pieceRoot.add(sp);
  const sh=new T.Mesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.renderOrder=-1;benchGroup.add(sh);
  beads.push({i,sp,sh,id:undefined,wv:(i*5+(i>>1)*3)%3,rot:Math.sin(i*12.9898)*.35,pos:new T.Vector3(),from:new T.Vector3(),to:new T.Vector3(),off:new T.Vector3(),pop:1,popAt:0,hv:0,hideUntil:0,sx:1,sy:1})}
  syncBeads(true);beads.forEach(b=>{const img=document.createElement('img');img.className='local-selected-bead';img.alt='';$('stage').append(img);b.photo=img})}
function skinBead(b){const id=cur()[b.i],m=b.sp.material,box=S.mm[S.product]/10;
  if(id==null){m.map=whiteTex[b.wv];m.rotation=b.rot;m.opacity=1;b.sx=b.sy=box*whiteScale;m.needsUpdate=true;return}
  // The exact catalog photo is displayed in a DOM layer, which also works from file://.
  m.map=whiteTex[0];m.opacity=0;m.needsUpdate=true;b.sx=b.sy=box;
}

function syncBeads(force){const ids=cur();beads.forEach(b=>{if(force||b.id!==ids[b.i]){const was=b.id!==undefined;b.id=ids[b.i];skinBead(b)}})}
function popBead(i,delay=0){const b=beads[i];if(!b)return;b.pop=0;b.popAt=performance.now()+delay}
function rebuildThread(){if(!beads.length)return;if(thread){pieceRoot.remove(thread);thread.geometry.dispose()}
  const wearing=S.mode==='wear'&&S.product==='necklace';
  const visible=wearing?beads.filter(b=>b.pos.z>=0):beads;
  if(visible.length<2)return;
  const curve=new T.CatmullRomCurve3(visible.map(b=>tmpV.clone().copy(b.pos).add(b.off)),!wearing,'centripetal');thread=new T.Mesh(new T.TubeGeometry(curve,visible.length*3,.035,5,!wearing),threadMat);thread.renderOrder=0;pieceRoot.add(thread)}

/* ------------------------------------------------ layouts (piece space, cm) */
function benchLayout(){const n=cap(),Rr=Rad();return Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i/n*Math.PI*2;return new T.Vector3(Math.cos(a)*Rr,0,Math.sin(a)*Rr)})}
function necklaceLayout(){
 const n=cap(),L=S.size.necklace,c=CH[S.char],rb=S.mm.necklace/20;
 // Calibrated to the actual portrait's neck sides and collarbone, not an unbounded drop solver.
 const stretch=Math.max(0,Math.min(1,(L-35)/10));
 const rx=c.nr + .05 + stretch*.45 + rb*.25;
 const rz=c.nr*.66+rb*.2;
 const drop=S.char==='f'?3+stretch*2:2.2+stretch*1.8;
 const P=a=>{const s=Math.sin(a);return new T.Vector3(rx*Math.cos(a),s>=0?-drop*Math.pow(s,.82):.35*(-s),rz*s)};
 // Equal-distance bead placement along the fitted curve.
 const table=[[0,-Math.PI/2]];let distance=0,prev=P(-Math.PI/2);
 for(let i=1;i<=720;i++){const angle=-Math.PI/2+i/720*Math.PI*2,next=P(angle);distance+=prev.distanceTo(next);table.push([distance,angle]);prev=next}
 return Array.from({length:n},(_,i)=>{const target=i/n*distance;let j=1;while(j<table.length-1&&table[j][0]<target)j++;const d=table[j][0]-table[j-1][0],t=d?(target-table[j-1][0])/d:0;return P(table[j-1][1]+(table[j][1]-table[j-1][1])*t)})
}
const wearAnchor=()=>S.product==='necklace'?neckRoot:handRoot;
function layoutTarget(){return (S.mode==='wear'&&S.product==='necklace')?necklaceLayout():benchLayout()}
const _r=new T.Object3D(),_off=new T.Matrix4(),_p=new T.Vector3(),_q=new T.Quaternion(),_s=new T.Vector3();_r.matrixAutoUpdate=false;
function anchorXf(){if(S.mode!=='wear'){_p.set(0,0,0);_q.identity();return{p:_p,q:_q}}
  if(S.product==='necklace')_r.matrixWorld.copy(neckRoot.matrixWorld);
  else{_off.makeTranslation(S.product==='ring'?RING_X:0,S.product==='ring'?RING_Y:.9,0);_r.matrixWorld.multiplyMatrices(handRoot.matrixWorld,_off)}
  _r.matrixWorld.decompose(_p,_q,_s);return{p:_p,q:_q}}
function retarget(animate=true,dur=.9){const lay=layoutTarget();beads.forEach((b,i)=>{b.from.copy(b.pos);b.to.copy(lay[i]||b.pos)});
  trans.fromXf.p.copy(pieceRoot.position);trans.fromXf.q.copy(pieceRoot.quaternion);trans.k=animate?0:1;trans.dur=dur;threadDirty=true}

/* ------------------------------------------------ camera rig */
const cam={t:new T.Vector3(),yaw:0,pitch:1.12,dist:30},goal={t:new T.Vector3(),yaw:0,pitch:1.12,dist:30};let zoom=1,lastTouch=0;
function aspect(){const e=$('stage');return Math.max(.4,e.clientWidth/Math.max(1,e.clientHeight))}
const tanH=Math.tan(15*Math.PI/180);
function fitR(r){return r*1.28/(tanH*Math.min(1,aspect()))}
function setGoals(snap){const p=S.product,w=S.mode==='wear';
  if(!w){goal.t.set(0,0,0);goal.pitch=Math.max(.5,Math.min(1.35,goal.pitch>.4?goal.pitch:1.12));goal.dist=fitR(Rad(p)+1.4+S.mm[p]/20)/zoom}
  else if(p==='necklace'){goal.t.set(0,4,0);goal.yaw=0;goal.pitch=0;goal.dist=Math.max(44/2/tanH,54/2/(tanH*aspect()))/zoom}
  else if(p==='bracelet'){goal.t.set(0,2.6,0);goal.yaw=.45;goal.pitch=.32;goal.dist=Math.max(15,(Rad(p)*2+5)/ (tanH*Math.min(1,aspect())))/zoom*1.05}
  else{goal.t.set(RING_X,RING_Y,0);goal.yaw=.4;goal.pitch=.34;goal.dist=Math.max(10,(Rad(p)*2+4)/(tanH*Math.min(1,aspect())))/zoom}
  if(snap){cam.t.copy(goal.t);cam.yaw=goal.yaw;cam.pitch=goal.pitch;cam.dist=goal.dist}}
function placeCam(){const cp=Math.cos(cam.pitch);camera.position.set(cam.t.x+Math.sin(cam.yaw)*cp*cam.dist,cam.t.y+Math.sin(cam.pitch)*cam.dist,cam.t.z+Math.cos(cam.yaw)*cp*cam.dist);camera.lookAt(cam.t)}

/* ------------------------------------------------ visibility per mode */
function applyMode(animate=true){const w=S.mode==='wear',p=S.product;
  benchGroup.visible=!w;wearRoot.visible=w&&p==='necklace';handRoot.visible=w&&p!=='necklace';$('stage').dataset.mode=S.mode;
  document.querySelectorAll('#mode-seg button').forEach(b=>b.classList.toggle('on',b.dataset.mode===S.mode));
  $('wear-bar').hidden=!(w&&p==='necklace');$('hint').textContent=w?(p==='necklace'?'마우스를 움직이면 캐릭터가 살짝 따라 돌아 · 비즈를 누르면 그 자리를 바꿀 수 있어':'드래그해서 손을 돌려봐 · 비즈를 누르면 그 자리를 바꿀 수 있어'):'드래그로 돌려보고 · 비즈를 눌러 자리를 고른 뒤 · 아래 비즈를 눌러 끼워봐';
  if(w&&p==='necklace')loadChar();if(w&&p!=='necklace')fitHand();buildWearBar();setGoals(!animate);retarget(animate)}
function buildWearBar(){const c=CH[S.char];$('char-seg').innerHTML=Object.entries(CH).map(([k,v])=>`<button data-char="${k}" class="${S.char===k?'on':''}">${v.name}</button>`).join('');
  $('view-seg').innerHTML=['front','side','back'].map(v=>`<button data-view="${v}" class="${S.view===v?'on':''}" ${c.views[v]?'':'disabled'}>${VIEWNAME[v]}</button>`).join('')}

/* ------------------------------------------------ editing */
function setSlot(i,id,delay=0){const a=all();if(i<0||i>=cap())return;a[i]=id;syncBeads();popBead(i,delay);threadDirty=true}
function firstWhite(from=0){const a=cur();for(let k=0;k<a.length;k++){const j=(from+k)%a.length;if(a[j]==null)return j}return -1}
function select(i){S.sel=i;refreshUI()}
function placeFromTray(id,rect){const n=cap();let i=S.sel>=0&&S.sel<n?S.sel:firstWhite(0);
  if(i<0){notify('모든 자리가 채워졌어 · 바꾸고 싶은 자리를 먼저 눌러줘');return}
  checkpoint();setSlot(i,id,0);const nx=firstWhite(i+1);S.sel=nx>=0?nx:i;refreshUI()}
function flyTo(id,rect,i,dur){const img=document.createElement('img');img.className='fly';img.src=`assets/cutouts/${id}.png`;const sx=rect.left+rect.width/2,sy=rect.top+rect.height/2;img.style.left=(sx-22)+'px';img.style.top=(sy-22)+'px';document.body.appendChild(img);
  const q=screenOf(i);const dx=q.x-sx,dy=q.y-sy;img.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.5}px,${dy*.5-70}px) scale(1.25)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(.75)`,opacity:.9}],{duration:dur,easing:'cubic-bezier(.25,.6,.25,1)'}).onfinish=()=>img.remove()}
function clearSlot(i){if(i<0||i>=cap()||all()[i]==null)return;checkpoint();setSlot(i,null);refreshUI()}
function mutate(fn){checkpoint();fn(all());syncBeads();threadDirty=true;refreshUI()}
function currentPool(){const l=filtered();return l.length?l:catalog}
const tools={
 shuffle(){const pool=currentPool(),n=cap();mutate(a=>{const hasW=a.slice(0,n).some(x=>x==null);for(let i=0;i<n;i++)if(!hasW||a[i]==null){a[i]=pool[Math.random()*pool.length|0].id;popBead(i,i*38)}})},
 repeat(){const a=all(),n=cap();let k=0;while(k<n&&a[k]!=null)k++;if(!k)return notify('첫 자리부터 비즈를 몇 개 끼워두면 그 패턴을 반복해줄게');if(k>=n)return notify('이미 모든 자리가 채워져 있어');mutate(x=>{for(let i=k;i<n;i++){x[i]=x[i%k];popBead(i,(i-k)*30)}})},
 mirror(){const n=cap();if(all().slice(0,n).every(x=>x==null))return notify('먼저 비즈를 몇 개 끼워줘');mutate(a=>{for(let i=1;i<=Math.floor((n-1)/2);i++){const j=n-i;if(a[i]!=null){a[j]=a[i];popBead(j,i*30)}else if(a[j]!=null){a[i]=a[j];popBead(i,i*30)}}})},
 rotate(d){const n=cap();if(all().slice(0,n).every(x=>x==null))return;checkpoint();const a=all(),old=a.slice(0,n);for(let i=0;i<n;i++)a[i]=old[(i-d+n)%n];if(S.sel>=0)S.sel=(S.sel+d+n)%n;syncBeads();
  const lay=layoutTarget();beads.forEach((b,i)=>{b.from.copy(beads[(i-d+n)%n].to);b.to.copy(lay[i])});trans.k=0;trans.dur=.38;trans.fromXf.p.copy(pieceRoot.position);trans.fromXf.q.copy(pieceRoot.quaternion);threadDirty=true;refreshUI()},
 undo(){const h=S.hist[S.product];if(!h.length)return;S.slots[S.product]=h.pop();syncBeads();threadDirty=true;refreshUI()},
 clear(){if(cur().every(x=>x==null))return;mutate(a=>{for(let i=0;i<a.length;i++)a[i]=null})},
 swap(d){const n=cap(),i=S.sel,j=i+d;if(i<0||j<0||j>=n)return;checkpoint();const a=all();[a[i],a[j]]=[a[j],a[i]];S.sel=j;syncBeads();popBead(i);popBead(j);threadDirty=true;refreshUI()}
};

/* ------------------------------------------------ UI refresh */
function chipImg(id){return id==null?whiteURL[0]:`assets/cutouts/${id}.png`}
function refreshUI(){const p=S.product,n=cap(),ids=cur();if(S.sel>=n)S.sel=n-1;
  $('counter').textContent=`${ids.filter(x=>x!=null).length} / ${n}`;$('fit-status').innerHTML=`<b>${p.toUpperCase()}</b> / ${p==='ring'?S.size.ring+'호':S.size[p]+'cm'} · 최대 ${p==='ring'?'24호':P[p].max+'cm'} · ${ids.filter(x=>x!=null).length} / ${n}개`;
  document.querySelector('.selection-box .label').textContent=ids.some(x=>x!=null)?'MY STRAND / 순서대로':'아직 비어 있는 너의 조합';
  $('count').textContent=`${n}개 자리 · 흰 비즈 ${ids.filter(x=>x==null).length}개 · 바꾼 비즈 ${ids.filter(x=>x!=null).length}개`;
  const sw=ids.filter(x=>x!=null),sum=sw.reduce((s,id)=>s+(beadUnitPrices[byId.get(id)?.cat]||0),0);
  $('base-label').textContent=P[p].name+' 기본가';$('base-price').textContent=won(P[p].base);$('swapped').textContent=sw.length+'개';$('bead-total').textContent=won(sum);$('total').textContent=won(P[p].base+sum);
  const b=ids[S.sel]!=null?byId.get(ids[S.sel]):null;$('slot-no').textContent=S.sel>=0?`${S.sel+1} / ${n}`:'—';$('slot-name').textContent=S.sel<0?'자리를 골라봐':ids[S.sel]==null?'기본 흰 비즈':`${b.color} ${b.name}${b.meaning?' · '+b.meaning:''}`;
  $('s-clear').disabled=!(S.sel>=0&&ids[S.sel]!=null);$('s-prev').disabled=S.sel<=0;$('s-next').disabled=S.sel<0||S.sel>=n-1;$('t-undo').disabled=!S.hist[p].length;$('t-clear').disabled=!sw.length;
  $('strip').innerHTML=ids.map((id,i)=>`<button class="chip ${id==null?'w':''} ${S.sel===i?'sel':''}" data-slot="${i}" role="option" aria-selected="${S.sel===i}" aria-label="${i+1}번째 ${id==null?'흰 비즈':byId.get(id).color+' '+byId.get(id).name}"><img src="${chipImg(id)}" alt=""><i>${i+1}</i></button>`).join('');
  const sel=$('strip').querySelector('.sel');if(sel&&sel.scrollIntoView)sel.scrollIntoView({block:'nearest',inline:'center',behavior:reduce?'auto':'smooth'});
  document.querySelectorAll('#prod-seg button').forEach(x=>{x.classList.toggle('on',x.dataset.product===p)});
  try{document.querySelectorAll('.cart-count,#cart-count').forEach(e=>e.textContent=cartList().reduce((s,x)=>s+(x.quantity||1),0))}catch{}}
function syncSizeUI(){const p=S.product;$('ring-row').hidden=p!=='ring';$('size-row').hidden=p==='ring';
  if(p==='ring'){$('ring-size').value=S.size.ring;$('ring-out').textContent='Ø'+ringDia(S.size.ring).toFixed(1)}
  else{const s=$('size');s.min=P[p].min;s.max=P[p].max;s.step=P[p].step;s.value=S.size[p];$('size-label').textContent=p==='necklace'?'목걸이 길이':'팔찌 길이';$('size-out').textContent=S.size[p]+'cm'}
  $('mm').value=S.mm[p];$('mm-out').textContent=S.mm[p]+'mm'}
function relayout(animate){rebuildBeads();buildRuler();if(S.mode==='wear'&&S.product!=='necklace')fitHand();setGoals(false);retarget(animate,.5);refreshUI()}
function setProduct(p){if(p===S.product)return;S.product=p;S.sel=-1;syncSizeUI();applyMode(true);relayout(true)}

/* ------------------------------------------------ tray */
const swatchMap=swatches;
function filtered(){return catalog.filter(b=>(category==='전체'||b.cat===category)&&(!colors.size||colors.has(b.color))&&(!texture||b.texture===texture)&&(!query||`${b.name} ${b.color} ${b.texture} ${b.meaning}`.includes(query)))}
function controls(){const av=catalog.filter(b=>category==='전체'||b.cat===category);
  $('categories').innerHTML=cats.map(c=>`<button class="filter-button ${category===c?'on':''}" data-cat="${c}" aria-pressed="${category===c}">${c}${c==='전체'?'':' <small>'+catalog.filter(b=>b.cat===c).length+'</small>'}</button>`).join('');
  $('colors').innerHTML=Object.keys(swatchMap).filter(c=>av.some(b=>b.color===c)).map(c=>`<button class="color ${colors.has(c)?'on':''}" data-color="${c}" aria-pressed="${colors.has(c)}"><i class="swatch" style="background:${swatchMap[c]}"></i>${c} <small>${av.filter(b=>b.color===c).length}</small></button>`).join('');
  $('textures').innerHTML=['',...new Set(av.map(b=>b.texture))].map(t=>`<button class="filter-button ${texture===t?'on':''}" data-texture="${t}" aria-pressed="${texture===t}">${t||'전체 질감'}</button>`).join('')}
let page=1;const PER=18;
function results(keep){const l=filtered(),pages=Math.max(1,Math.ceil(l.length/PER));if(!keep)page=1;page=Math.min(page,pages);
  $('results').textContent=`${l.length}개의 조각 · ${page} / ${pages} 페이지`;
  $('grid').innerHTML=l.length?l.slice((page-1)*PER,page*PER).map(b=>`<button class="card" data-id="${b.id}" aria-label="${b.color} ${b.name} 끼우기"><div class="card-art"><img src="assets/cutouts/${b.id}.png" alt="" loading="lazy" draggable="false"></div><div class="card-label"><b>${b.color}</b> ${b.name}<small>${b.texture}</small><em>개당 ${(beadUnitPrices[b.cat]||0).toLocaleString()}원</em></div></button>`).join(''):'<div class="empty-note">조건에 맞는 비즈가 없어 · 필터를 초기화해봐</div>';
  $('pagination').innerHTML=pages>1?`<button data-pg="${page-1}" ${page<=1?'disabled':''}>이전</button>`+Array.from({length:pages},(_,i)=>`<button data-pg="${i+1}" class="${i+1===page?'on':''}">${i+1}</button>`).join('')+`<button data-pg="${page+1}" ${page>=pages?'disabled':''}>다음</button>`:''}
$('pagination').onclick=e=>{const b=e.target.closest('[data-pg]');if(!b||b.disabled)return;page=Number(b.dataset.pg);results(true)};
function updateTray(){controls();results()}

/* ------------------------------------------------ pointer interaction */
const stage=$('stage'),canvas=$('gl');const ptr={x:-999,y:-999,in:false,nx:0,ny:0};let hoverI=-1,down=null,dragBead=null,suppressClick=false,idleAt=performance.now();
function ndc(e){const r=canvas.getBoundingClientRect();return{x:((e.clientX-r.left)/r.width)*2-1,y:-((e.clientY-r.top)/r.height)*2+1,px:e.clientX-r.left,py:e.clientY-r.top}}
function pick(e){if(!gl)return -1;const n=ndc(e);raycaster.setFromCamera({x:n.x,y:n.y},camera);const hits=raycaster.intersectObjects(beads.filter(b=>b.sp.visible).map(b=>b.sp),false);return hits.length?beads.findIndex(b=>b.sp===hits[0].object):-1}
function screenOf(i){const b=beads[i];const v=b.sp.getWorldPosition(tmpV2.clone()).project(camera);const r=canvas.getBoundingClientRect();return{x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height}}
function nearestSlot(cx,cy,maxPx=70){let best=-1,bd=maxPx;beads.forEach((b,i)=>{const s=screenOf(i),d=Math.hypot(s.x-cx,s.y-cy);if(d<bd){bd=d;best=i}});return best}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.setPointerCapture(e.pointerId);const i=pick(e);down={x:e.clientX,y:e.clientY,i,moved:false,yaw:goal.yaw,pitch:goal.pitch};idleAt=performance.now()});
canvas.addEventListener('pointermove',e=>{const n=ndc(e);ptr.x=n.px;ptr.y=n.py;ptr.in=true;ptr.nx=n.x;ptr.ny=n.y;
  if(down){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!down.moved&&Math.hypot(dx,dy)>5)down.moved=true;
    if(down.moved&&(S.mode==='bench'||S.product!=='necklace')){goal.yaw=down.yaw-dx*.0085;goal.pitch=Math.max(S.mode==='bench'?.35:-.2,Math.min(S.mode==='bench'?1.45:1.2,down.pitch+dy*.006));cam.yaw=goal.yaw;cam.pitch=goal.pitch;idleAt=performance.now()}}
  else{const i=pick(e);if(i!==hoverI){hoverI=i;canvas.style.cursor=i>=0?'pointer':'grab';showTip(i)}}});
canvas.addEventListener('pointerup',e=>{if(!down)return;const d=down;down=null;if(!d.moved){const i=pick(e);if(i>=0)select(i===S.sel?-1:i);else if(S.sel>=0)select(-1)}});
canvas.addEventListener('pointercancel',()=>{down=null});
canvas.addEventListener('pointerleave',()=>{ptr.in=false;hoverI=-1;showTip(-1)});
canvas.addEventListener('dblclick',e=>{const i=pick(e);if(i>=0)clearSlot(i);else{zoom=1;setGoals(false)}});
canvas.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoom=Math.max(.45,Math.min(3,zoom*(e.deltaY>0?.92:1.08)));setGoals(false)},{passive:false});
canvas.style.cursor='grab';
function showTip(i){const t=$('tip');if(i<0||dragBead){t.hidden=true;return}const id=cur()[i],b=id==null?null:byId.get(id);t.innerHTML=b?`${b.color} ${b.name}<small>${b.cat} · ${b.texture} · ${won(beadUnitPrices[b.cat]||0)}</small>`:`기본 흰 비즈<small>${i+1}번째 자리 · 기본가에 포함</small>`;t.hidden=false}
function placeTip(){if(hoverI<0||$('tip').hidden)return;const s=screenOf(hoverI),r=stage.getBoundingClientRect();const t=$('tip');t.style.left=(s.x-r.left)+'px';t.style.top=(s.y-r.top-beads[hoverI].sy*30)+'px'}
/* tray -> strand drag (mouse / pen); touch uses tap */
const ghost=$('ghost');
$('grid').addEventListener('pointerdown',e=>{const c=e.target.closest('.card');if(!c||e.pointerType==='touch'||e.button!==0)return;dragBead={id:c.dataset.id,x:e.clientX,y:e.clientY,on:false,el:c}});
addEventListener('pointermove',e=>{if(!dragBead)return;if(!dragBead.on){if(Math.hypot(e.clientX-dragBead.x,e.clientY-dragBead.y)<8)return;dragBead.on=true;ghost.innerHTML=`<img src="assets/cutouts/${dragBead.id}.png" alt="">`;ghost.hidden=false;document.body.style.userSelect='none';showTip(-1)}
  ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';const r=stage.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  const i=inside?nearestSlot(e.clientX,e.clientY):-1;if(i!==dragBead.hover){dragBead.hover=i;hoverI=i;if(i>=0){S.sel=i;refreshUI()}}});
addEventListener('pointerup',e=>{if(!dragBead)return;const d=dragBead;dragBead=null;document.body.style.userSelect='';ghost.hidden=true;if(!d.on)return;suppressClick=true;setTimeout(()=>suppressClick=false,0);
  const i=d.hover!=null&&d.hover>=0?d.hover:-1;hoverI=-1;if(i>=0){checkpoint();setSlot(i,d.id);const nx=firstWhite(i+1);S.sel=nx>=0?nx:i;refreshUI()}else notify('끼우고 싶은 자리 위에서 놓아줘')});
$('grid').addEventListener('click',e=>{if(suppressClick)return;const c=e.target.closest('.card');if(!c)return;placeFromTray(c.dataset.id,c.querySelector('.card-art').getBoundingClientRect())});

/* ------------------------------------------------ control wiring */
$('prod-seg').onclick=e=>{const b=e.target.closest('[data-product]');if(b)setProduct(b.dataset.product)};
$('mode-seg').onclick=e=>{const b=e.target.closest('[data-mode]');if(!b||b.dataset.mode===S.mode)return;S.mode=b.dataset.mode;applyMode(true);if(S.mode==='wear')notify(S.product==='necklace'?'목걸이를 캐릭터에게 걸어봤어':S.product==='bracelet'?'팔찌를 손목에 걸어봤어':'반지를 손가락에 끼워봤어')};
$('char-seg').onclick=e=>{const b=e.target.closest('[data-char]');if(!b)return;S.char=b.dataset.char;if(!CH[S.char].views[S.view])S.view='front';buildWearBar();loadChar();retarget(true,.6)};
$('view-seg').onclick=e=>{const b=e.target.closest('[data-view]');if(!b||b.disabled)return;S.view=b.dataset.view;buildWearBar();loadChar();retarget(true,.6)};
$('zoom-in').onclick=()=>{zoom=Math.min(3,zoom*1.2);setGoals(false)};$('zoom-out').onclick=()=>{zoom=Math.max(.45,zoom/1.2);setGoals(false)};
function sizeChanged(){const n0=beads.length;syncSizeUI();buildRuler();if(cap()!==n0)relayout(false);else{if(S.mode==='wear'&&S.product!=='necklace')fitHand();syncBeads(true);setGoals(false);retarget(false);refreshUI()}}
$('size').oninput=e=>{S.size[S.product]=Number(e.target.value);sizeChanged()};
$('mm').oninput=e=>{S.mm[S.product]=Number(e.target.value);sizeChanged()};
$('ring-size').innerHTML=Array.from({length:19},(_,i)=>`<option value="${i+6}">${i+6}호 · Ø${ringDia(i+6).toFixed(1)}mm</option>`).join('');
$('ring-size').onchange=e=>{S.size.ring=Number(e.target.value);sizeChanged()};
$('t-shuffle').onclick=tools.shuffle;$('t-repeat').onclick=tools.repeat;$('t-mirror').onclick=tools.mirror;$('t-rotL').onclick=()=>tools.rotate(-1);$('t-rotR').onclick=()=>tools.rotate(1);$('t-undo').onclick=tools.undo;$('t-clear').onclick=tools.clear;
$('s-prev').onclick=()=>tools.swap(-1);$('s-next').onclick=()=>tools.swap(1);$('s-clear').onclick=()=>clearSlot(S.sel);
$('strip').onclick=e=>{const c=e.target.closest('[data-slot]');if(c)select(Number(c.dataset.slot))};
$('categories').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;category=b.dataset.cat;colors.clear();texture='';updateTray()};
$('colors').onclick=e=>{const b=e.target.closest('[data-color]');if(!b)return;const c=b.dataset.color;colors.has(c)?colors.delete(c):colors.add(c);updateTray()};
$('textures').onclick=e=>{const b=e.target.closest('[data-texture]');if(!b)return;texture=b.dataset.texture;updateTray()};
$('reset').onclick=()=>{colors.clear();texture='';query='';$('search').value='';updateTray()};
$('search').oninput=e=>{query=e.target.value.trim();results()};
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||''))return;const n=cap();
  if(e.key==='ArrowRight'){select(Math.min(n-1,S.sel+1));e.preventDefault()}else if(e.key==='ArrowLeft'){select(Math.max(0,S.sel<0?0:S.sel-1));e.preventDefault()}
  else if((e.key==='Delete'||e.key==='Backspace')&&S.sel>=0){clearSlot(S.sel);e.preventDefault()}else if(e.key==='Escape')select(-1);else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){tools.undo();e.preventDefault()}});

/* ------------------------------------------------ cart / save */
function cartList(){try{const a=JSON.parse(localStorage.getItem('oddbeads-cart-v1')||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function addCart(go){const p=S.product,ids=cur(),sw=ids.filter(x=>x!=null);const total=sw.reduce((s,id)=>s+(beadUnitPrices[byId.get(id)?.cat]||0),0);const list=cartList();
  list.push({key:Date.now().toString(36)+Math.random().toString(36).slice(2,7),product:p,name:P[p].name,length:S.size[p],unit:p==='ring'?'호':'cm',beadMM:S.mm[p],basePrice:P[p].base,beadTotal:total,unitTotal:P[p].base+total,quantity:1,provisional:true,
    items:ids.map(id=>{if(id==null)return{id:'white',name:'기본 흰 비즈',color:'화이트·크림',category:'기본 비즈',unitPrice:0,image:''};const b=byId.get(id);return{id,name:b.name,color:b.color,category:b.cat,unitPrice:beadUnitPrices[b.cat],image:`assets/cutouts/${id}.png`}})});
  try{localStorage.setItem('oddbeads-cart-v1',JSON.stringify(list));refreshUI();if(go)location.href='checkout.html';else notify('커스텀 조합을 장바구니에 담았어')}catch{notify('장바구니를 저장할 공간이 부족해')}}
$('add-cart').onclick=()=>addCart(false);$('buy-now').onclick=()=>addCart(true);
$('save').onclick=()=>{try{localStorage.setItem('oddbeads-studio-v2',JSON.stringify({product:S.product,size:S.size,mm:S.mm,slots:S.slots}));notify('이 브라우저에 조합을 저장했어')}catch{notify('저장 공간을 사용할 수 없어')}};
$('load').onclick=()=>{try{const s=JSON.parse(localStorage.getItem('oddbeads-studio-v2')||'null');if(!s||!s.slots)return notify('아직 저장한 조합이 없어');
  ['necklace','bracelet','ring'].forEach(p=>{if(Array.isArray(s.slots[p]))S.slots[p]=s.slots[p].map(id=>byId.has(id)?id:null);if(s.size?.[p]!=null)S.size[p]=s.size[p];if(s.mm?.[p]!=null)S.mm[p]=s.mm[p]});
  S.product=P[s.product]?s.product:'necklace';S.sel=-1;syncSizeUI();applyMode(false);relayout(false);notify('저장한 조합을 불러왔어')}catch{notify('저장한 조합을 불러올 수 없어')}};
$('price-table').innerHTML='<table><thead><tr><th>비즈 카테고리</th><th>1개 기준 제안 단가</th></tr></thead><tbody>'+Object.entries(beadUnitPrices).map(([c,v])=>`<tr><td>${c}</td><td>${v.toLocaleString()}원 / 개</td></tr>`).join('')+'</tbody></table>';

/* ------------------------------------------------ resize + loop */
function resize(){const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);if(gl)renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();setGoals(false)}
new ResizeObserver(resize).observe(stage);
let last=performance.now(),tAll=0;const wearTilt={x:0,y:0};
function renderLocalPhotos(){
 const stage=$('stage'),w=stage.clientWidth,h=stage.clientHeight;
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 const wearing=S.mode==='wear'&&S.product==='necklace';domChar.style.display=wearing?'block':'none';
 if(wearing&&domChar.naturalWidth){const lo=charMesh.localToWorld(new T.Vector3(-.5,-.5,0)).project(camera),hi=charMesh.localToWorld(new T.Vector3(.5,.5,0)).project(camera);domChar.style.left=(lo.x+1)*.5*w+'px';domChar.style.top=(1-hi.y)*.5*h+'px';domChar.style.width=Math.abs(hi.x-lo.x)*.5*w+'px';domChar.style.height=Math.abs(hi.y-lo.y)*.5*h+'px'}
 beads.forEach(b=>{const id=cur()[b.i],img=b.photo;if(!img)return;const shown=id!=null&&b.sp.visible;img.style.display=shown?'block':'none';if(!shown)return;const src='assets/cutouts/'+id+'.png';if(img.dataset.src!==src){img.src=src;img.dataset.src=src}const world=b.sp.getWorldPosition(new T.Vector3());const dist=world.clone().applyMatrix4(camera.matrixWorldInverse);const screen=world.clone().project(camera);const pixels=h/(2*Math.tan(camera.fov*Math.PI/360)*Math.max(.1,-dist.z));img.style.left=(screen.x+1)*.5*w+'px';img.style.top=(1-screen.y)*.5*h+'px';img.style.width=b.sp.scale.x*pixels+'px';img.style.height=b.sp.scale.y*pixels+'px';img.style.zIndex=String(10+Math.round(1000/Math.max(.1,-dist.z)))});
}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;tAll+=dt;if(!gl||document.hidden)return;
  const r=stage.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
  /* idle spin on the bench */
  if(S.mode==='bench'&&!down&&!reduce&&now-idleAt>3500&&hoverI<0&&S.sel<0&&!dragBead){goal.yaw+=dt*.09;cam.yaw=goal.yaw}
  const k=1-Math.exp(-dt*6);cam.t.lerp(goal.t,k);cam.dist+=(goal.dist-cam.dist)*k;if(S.mode==='wear'){cam.yaw+=(goal.yaw-cam.yaw)*k;cam.pitch+=(goal.pitch-cam.pitch)*k}else{cam.pitch+=(goal.pitch-cam.pitch)*k}placeCam();
  /* character parallax */
  const tx=ptr.in?ptr.ny*-.05:0,ty=ptr.in?ptr.nx*.2:0;wearTilt.x+=(tx-wearTilt.x)*k*.6;wearTilt.y+=(ty-wearTilt.y)*k*.6;wearRoot.rotation.set(wearTilt.x,wearTilt.y,0);
  /* layout transition */
  let active=false;if(trans.k<1){trans.k=Math.min(1,trans.k+dt/trans.dur);active=true}const e=ease(trans.k);
  scene.updateMatrixWorld(true);const ax=anchorXf();pieceRoot.position.lerpVectors(trans.k<1?trans.fromXf.p:ax.p,ax.p,trans.k<1?e:1);pieceRoot.quaternion.copy(trans.k<1?trans.fromXf.q.clone().slerp(ax.q,e):ax.q);
  const invQ=pieceRoot.quaternion.clone().invert();const rv=new T.Vector3(),uv=new T.Vector3();camera.matrixWorld.extractBasis(rv,uv,tmpV);
  const bench=S.mode==='bench';
  beads.forEach((b,i)=>{if(trans.k<1){b.pos.lerpVectors(b.from,b.to,e);b.pos.y+=Math.sin(Math.PI*e)*(trans.dur>.5?1.6:0)}else b.pos.copy(b.to);
    /* cursor repel + spring */
    let moved=false;if(ptr.in&&!down&&trans.k>=1){b.sp.getWorldPosition(tmpV2);const s=tmpV3.copy(tmpV2).project(camera);const bx=(s.x+1)/2*canvas.clientWidth,by=(1-s.y)/2*canvas.clientHeight,dx=bx-ptr.x,dy=by-ptr.y,d=Math.hypot(dx,dy);
      if(d<95&&d>.1){const f=(1-d/95)*.22;const wv=rv.clone().multiplyScalar(dx/d*f).add(uv.clone().multiplyScalar(-dy/d*f)).applyQuaternion(invQ);b.off.add(wv.multiplyScalar(.6))}}
    b.off.multiplyScalar(.86);if(b.off.lengthSq()>1e-7){moved=true;if(b.off.length()>.7)b.off.setLength(.7)}else b.off.set(0,0,0);if(moved)threadDirty=true;
    const bob=bench&&!reduce?Math.sin(tAll*1.4+i*.5)*.035:0;b.sp.position.copy(b.pos).add(b.off);b.sp.position.y+=bob;
    /* pop + hover */
    let pf=1;if(b.pop<1){const tt=(now-b.popAt)/450;if(tt<0)pf=0;else{b.pop=Math.min(1,tt);pf=Math.max(0,backOut(b.pop))}}if(now<b.hideUntil)pf=0;
    b.hv+=(((hoverI===i)||(S.sel===i&&false)?1:0)-b.hv)*.25;const sc=pf*(1+b.hv*.14);b.sp.scale.set(b.sx*sc,b.sy*sc,1);b.sp.visible=sc>.01;
    if(S.mode==='wear'&&S.product==='necklace'){const occlusion=b.sp.getWorldPosition(new T.Vector3());b.sp.visible=b.sp.visible&&occlusion.z>-.08;}
    b.sh.visible=bench;if(bench){b.sh.position.set(b.sp.position.x,-.58,b.sp.position.z);b.sh.scale.set(b.sx*.55*sc,b.sx*.5*sc,1)}});
  if(S.sel>=0&&beads[S.sel]){const b=beads[S.sel];selRing.visible=true;selRing.position.copy(b.sp.position);const pu=1.55+Math.sin(tAll*4)*.05;selRing.scale.setScalar(Math.max(b.sx,b.sy)*pu*(b.sp.visible?1:0))}else selRing.visible=false;
  if(threadDirty||active){rebuildThread();threadDirty=false}
  placeTip();renderer.render(scene,camera);renderLocalPhotos()}

/* ------------------------------------------------ init */
function init(){
  const mat={glass:'도넛 유리',ceramic:'도자기',metal:'메탈릭'}[new URLSearchParams(location.search).get('material')];if(mat)category=mat;
  try{const pr=sessionStorage.getItem('oddbeads-emotion-product');if(pr&&P[pr]){S.product=pr;sessionStorage.removeItem('oddbeads-emotion-product')}}catch{}
  try{const inc=JSON.parse(sessionStorage.getItem('oddbeads-emotion-design')||'null');if(Array.isArray(inc)&&inc.every(id=>byId.has(id))){const a=all();inc.forEach((id,i)=>{if(i<cap())a[i]=id});sessionStorage.removeItem('oddbeads-emotion-design');setTimeout(()=>notify('감정 조합을 첫 자리부터 끼워뒀어'),600)}}catch{}
  syncSizeUI();buildRuler();updateTray();if(gl){resize();rebuildBeads();applyMode(false);beads.forEach(b=>b.pos.copy(b.to));setGoals(true);requestAnimationFrame(frame)}else{refreshUI()}
  refreshUI()}
init();
window.__studio={S,beads:()=>beads,tools,placeFromTray,select,setProduct};
})();
