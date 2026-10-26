(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const scenes=[...document.querySelectorAll('.scroll-scene')];let dirty=true;addEventListener('scroll',()=>dirty=true,{passive:true});addEventListener('resize',()=>dirty=true);function bridgeIntroToGlass(){
  const intro=document.querySelector('.about-experience');
  const glass=document.querySelector('.material-scene[data-tone="glass"]');
  if(!intro||!glass)return;
  const top=glass.getBoundingClientRect().top;
  const phase=Math.max(0,Math.min(1,(innerHeight-top)/(innerHeight*.8)));
  const mix=phase*phase*(3-2*phase);
  const blend=(a,b)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*mix)).join(',')+')';
  if(top<innerHeight){
    intro.style.setProperty('--glass-bridge-bg',blend([204,204,204],[19,45,57]));
    intro.style.setProperty('--glass-bridge-ink',blend([32,32,30],[242,244,235]));
    intro.style.setProperty('--glass-bridge-muted',blend([78,78,76],[211,224,225]));
    intro.style.setProperty('--glass-bridge-accent',blend([243,72,53],[255,136,111]));
  }else{
    ['--glass-bridge-bg','--glass-bridge-ink','--glass-bridge-muted','--glass-bridge-accent'].forEach(key=>intro.style.removeProperty(key));
  }
  if(top<innerHeight&&top>0){
    document.body.style.backgroundColor=blend([204,204,204],[19,45,57]);
    document.body.style.color=blend([32,32,30],[242,244,235]);
    document.body.classList.add('glass-bridge-active');
  }else{
    document.body.style.removeProperty('background-color');
    document.body.style.removeProperty('color');
    document.body.classList.remove('glass-bridge-active');
  }
}
function bridgeWoodToFinale(){
  const finale=document.querySelector('.finale-playground');
  if(!finale)return;
  const top=finale.getBoundingClientRect().top;
  const p=Math.max(0,Math.min(1,(innerHeight-top)/(innerHeight*.8)));
  const mix=p*p*(3-2*p);
  const rgb=[230,218,199].map(v=>Math.round(v+(255-v)*mix));
  if(top<innerHeight){finale.style.setProperty('--finale-bridge-bg','rgb('+rgb.join(',')+')')}
  else{finale.style.removeProperty('--finale-bridge-bg')}
  if(top<innerHeight&&top>0){
    document.body.style.backgroundColor='rgb('+rgb.join(',')+')';
    document.body.style.color='#3f3023';
    document.body.classList.add('finale-bridge-active');
  }else{document.body.classList.remove('finale-bridge-active')}
}
function tone(){const center=innerHeight*.48;let best=scenes[0];for(const s of scenes){const r=s.getBoundingClientRect();if(r.top<=center&&r.bottom>=center)best=s}if(scenes[0]&&scenes[0].getBoundingClientRect().top>center){document.body.dataset.tone='intro'}else if(best){document.body.dataset.tone=best.dataset.tone}bridgeIntroToGlass();bridgeWoodToFinale();const orb=document.querySelector('.intro-orbit');if(orb&&!reduced){const r=orb.parentElement.getBoundingClientRect();orb.style.transform=`rotate(${r.top*.08}deg) translateY(${r.top*.08}px)`}}const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';const fs=`precision highp float;uniform vec2 res;uniform float time;uniform float progress;uniform vec2 mouse;uniform float mat;float sd(vec3 p){float c=cos(progress*2.6+mouse.x*.6),s=sin(progress*2.6+mouse.x*.6);p.xz=mat2(c,-s,s,c)*p.xz;c=cos(-.55+mouse.y*.45);s=sin(-.55+mouse.y*.45);p.yz=mat2(c,-s,s,c)*p.yz;if(mat>0.5&&mat<1.5){float ball=length(p)-.92;float hole=length(p.xz)-.22;return max(ball,-hole);}float ring=length(vec2(length(p.xy)-.68,p.z))-.27;if(mat>1.5&&mat<2.5){float angle=atan(p.y,p.x);ring+=.035*sin(angle*18.);}return ring;}vec3 norm(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(sd(p+e.xyy)-sd(p-e.xyy),sd(p+e.yxy)-sd(p-e.yxy),sd(p+e.yyx)-sd(p-e.yyx)));}float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy*2.-res)/min(res.x,res.y);vec3 ro=vec3(0.,0.,3.7);vec3 rd=normalize(vec3(uv,-2.7));float d=0.;float dist=0.;vec3 p;for(int i=0;i<80;i++){p=ro+rd*d;dist=sd(p);if(dist<.001||d>7.)break;d+=dist*.85;}if(d>7.){gl_FragColor=vec4(0.);return;}vec3 n=norm(p),v=-rd;vec3 l=normalize(vec3(-2.+mouse.x,3.,4.));float diffuse=max(dot(n,l),0.);float spec=pow(max(dot(reflect(-l,n),v),0.),mat>1.5?95.:mat<.5?110.:26.);float rim=pow(1.-max(dot(n,v),0.),3.);vec3 col;if(mat<.5){col=vec3(.025,.48,.65)*(.22+diffuse*.8);col+=vec3(.1,.5,.6)*rim*.9;col+=vec3(.9,1.,1.)*spec*1.8;col+=.13*pow(max(0.,sin(p.x*11.+p.y*7.)),6.);}else if(mat<1.5){float grain=hash(floor(p*160.));vec3 base=mix(vec3(.77,.48,.25),vec3(.33,.36,.22),smoothstep(.77,.95,grain));col=base*(.35+diffuse*.7)+spec*.55;}else if(mat>2.5){float grain=sin(p.y*39.+sin(p.x*8.+p.z*5.)*3.+sin(p.y*8.)*.8);float fine=sin(p.y*128.+p.x*16.)*.09;vec3 base=mix(vec3(.30,.13,.055),vec3(.72,.43,.19),.5+.34*grain+fine);col=base*(.45+diffuse*.65)+vec3(.95,.77,.51)*spec*.13+rim*.035;}else{vec3 r=reflect(rd,n);float strip=pow(max(0.,sin(r.x*4.+r.y*2.)),16.);col=vec3(.22,.24,.26)*(.3+diffuse*.5)+vec3(.85,.9,.96)*(strip*.9+spec*1.5)+rim*.4;}gl_FragColor=vec4(col,1.);}`;const renderers=[];document.querySelectorAll('canvas[data-material]').forEach(canvas=>{try{const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('no webgl');function shader(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh}const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);const uniforms={};['res','time','progress','mouse','mat'].forEach(k=>uniforms[k]=gl.getUniformLocation(program,k));let mouse=[0,0];canvas.addEventListener('pointermove',e=>{if(reduced)return;const r=canvas.getBoundingClientRect();mouse=[(e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2]});canvas.addEventListener('pointerleave',()=>mouse=[0,0]);renderers.push(t=>{const r=canvas.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const dpr=Math.min(devicePixelRatio,1.4);const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}const scene=canvas.closest('.material-scene').getBoundingClientRect();const progress=reduced?.3:Math.max(0,Math.min(1,(innerHeight-scene.top)/(scene.height+innerHeight)));gl.useProgram(program);gl.uniform2f(uniforms.res,w,h);gl.uniform1f(uniforms.time,t/1000);gl.uniform1f(uniforms.progress,progress);gl.uniform2f(uniforms.mouse,...mouse);gl.uniform1f(uniforms.mat,Number(canvas.dataset.material));gl.drawArrays(gl.TRIANGLES,0,6)})}catch(e){canvas.parentElement.classList.add('no-webgl');canvas.hidden=true}});let last=0;function frame(t){if(dirty){tone();dirty=false}if(t-last>33){renderers.forEach(r=>r(t));last=t}requestAnimationFrame(frame)}requestAnimationFrame(frame);document.addEventListener('visibilitychange',()=>dirty=true)})();
