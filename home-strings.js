(() => {
  const stage = document.querySelector('.logo-stage');
  const beads = document.querySelector('.hero .beads');
  stage.append(beads);
  const letters = [...stage.querySelectorAll('.letter')];
  letters.forEach(letter => { const drop = document.createElement("span"); drop.className = "letter-drop"; drop.append(letter.querySelector("img")); letter.append(drop); });
  const widths = [16,12.5,12.5,12,10.3,13,12,11.7];
  let left = 0;
  letters.forEach((letter,i) => { letter.style.left = `${left}%`; left += widths[i]; });
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('thread-art'); svg.setAttribute('aria-hidden','true');
  stage.prepend(svg);
  const falling = [1,2,4,5,7];
  const anchors = [0,3,3,6,6];
  const rotations = [-5,4,0,-12,8];
  const floorShadows = falling.map(() => {
    const shadow = document.createElement('span');
    shadow.className = 'letter-floor-shadow';
    shadow.setAttribute('aria-hidden','true');
    stage.append(shadow); return shadow;
  });
  const beadEls = [...beads.querySelectorAll('.bead')];
  const paths = falling.map(() => {
    const cord = document.createElementNS(svg.namespaceURI,'g');
    ['cord-shadow','cord-body','cord-light','cord-fiber'].forEach(name => {
      const strand = document.createElementNS(svg.namespaceURI,'path');
      strand.classList.add(name); cord.append(strand);
    });
    svg.append(cord); return cord;
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let start;
  let pointerX=0,pointerY=0;
  const hero=document.querySelector('.hero');
  const motionReduced=()=>reduced.matches;
  let threadAnimations=[];
  let threadVisible=false;
  function showThread(){
    if(threadVisible)return;
    threadVisible=true;
    stage.classList.add('show-thread');
    threadAnimations.forEach(animation=>animation.cancel());
    const strands=paths[0].querySelectorAll('path');
    strands.forEach(path=>{
      // Normalize the whole open strand so it reveals from left to right.
      path.setAttribute('pathLength','1');
      threadAnimations.push(path.animate([
        {strokeDashoffset:'1',opacity:0},
        {strokeDashoffset:'.97',opacity:1,offset:.07},
        {strokeDashoffset:'.76',opacity:1,offset:.24},
        {strokeDashoffset:'.79',opacity:1,offset:.29},
        {strokeDashoffset:'.47',opacity:1,offset:.49},
        {strokeDashoffset:'.50',opacity:1,offset:.54},
        {strokeDashoffset:'.19',opacity:1,offset:.76},
        {strokeDashoffset:'.21',opacity:1,offset:.81},
        {strokeDashoffset:'0',opacity:1}
      ],{duration:reduced.matches?1:1050,easing:'ease-in-out',fill:'forwards'}));
    });
  }
  function hideThread(){
    threadVisible=false;
    stage.classList.remove('show-thread');
    threadAnimations.forEach(animation=>animation.cancel());
    threadAnimations=[];
  }
  stage.addEventListener('pointerover',event=>{if(event.target.closest('.bead,.letter-drop'))showThread()});
  stage.addEventListener('pointerout',event=>{
    const next=event.relatedTarget;
    if(!next || !stage.contains(next) || !next.closest('.bead,.letter-drop'))hideThread();
  });
  stage.addEventListener('pointerleave',hideThread);
  beads.addEventListener('focusin',showThread);
  beads.addEventListener('focusout',hideThread);
  function scrollMix(){return motionReduced()?0:Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/(innerHeight*.8)))}
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();pointerX=((e.clientX-r.left)/r.width-.5)*22;pointerY=((e.clientY-r.top)/r.height-.5)*16;draw(performance.now(),false)});
  hero.addEventListener('pointerleave',()=>{pointerX=pointerY=0;draw(performance.now(),false)});
  addEventListener('scroll',()=>draw(performance.now(),false),{passive:true});
  function draw(now,loop=true) {
    if(start === undefined) start=now;
    const t = reduced.matches ? 1 : Math.max(0, Math.min(1,(now-start-2400)/1800));
    const box=stage.getBoundingClientRect();
    const h=letters[0].offsetHeight;
    const beadOffset = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
    const baseHeight = box.height - beadOffset;
    svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    const necklacePoints=[];
    falling.forEach((index,k) => {
      const local = reduced.matches ? 1 : Math.max(0,Math.min(1,(t-k*.035)/.86));
      // A soft, damped landing leaves the letters hanging from their threads.
      const ease = local===1 ? 1 : 1-Math.exp(-6*local)*Math.cos(7*local);
      const floorY = box.height - h*.16;
      const scroll = scrollMix();
      const mix = scroll*scroll*(3-2*scroll);
      let dx = (box.width * [.23,.39,.55,.70,.84][k] - (letters[index].offsetLeft+letters[index].offsetWidth*.5))*mix + (motionReduced()?0:pointerX*.65*local);
      let dy = -baseHeight * [.08,.18,.04,.14,.06][k]*mix + (motionReduced()?0:pointerY*.65*local);
      const el=letters[index];
      // Match the finished letter's largest dimension to the nearby donut bead.
      const beadSize = beadEls[k].offsetWidth;
      const targetScale = Math.min(.58, beadSize / Math.max(el.offsetWidth, h)) / 1.3;
      const depth = floorY - h*.24 - h*targetScale*.20;
      const shrinkProgress = local * local * (3 - 2 * local);
      const scale = 1 + (targetScale - 1) * shrinkProgress;
      // Final small-letter locations follow the upright hand-drawn reference.
      // Red / D / yellow / D / green / E / blue / A / purple / S.
      const landingX = [.242,.424,.585,.762,.925][k];
      const landingY = [.75,.75,.72,.70,.76][k];
      const centerX = box.width*landingX + box.width*[.015,.005,0,-.045,-.05][k]*mix;
      const centerY = baseHeight*landingY + beadOffset - baseHeight*[.085,.075,.06,.08,.06][k]*mix;
      const artworkCenter = h*.24 + h*scale*.26;
      dx = (centerX - (el.offsetLeft+el.offsetWidth*.5))*shrinkProgress + (motionReduced()?0:pointerX*.65*local);
      dy = (centerY-artworkCenter-depth)*shrinkProgress + (motionReduced()?0:pointerY*.65*local);
      const groupedY = centerY + h*scale*.45;
      const rotation = rotations[k] * ease;
      const drop = el.querySelector('.letter-drop');
      // Resize the artwork box itself, so legacy transforms cannot cancel shrinking.
      const currentWidth = el.offsetWidth * scale;
      const currentHeight = h * scale;
      drop.style.width = currentWidth + 'px';
      drop.style.height = currentHeight + 'px';
      drop.style.left = (el.offsetWidth-currentWidth)*.5 + 'px';
      drop.style.top = (h-currentHeight)*.24 + 'px';
      const tilt = 0;
      drop.style.transform=`translate(${dx}px,${depth*ease+dy}px) rotate(${rotation + mix*[12,-16,10,-12,8][k]}deg)`;
      const shadow = floorShadows[k];
      shadow.style.left = (el.offsetLeft + el.offsetWidth*.5 + dx) + 'px';
      shadow.style.top = groupedY + 'px';
      shadow.style.width = (currentWidth*.94) + 'px';
      shadow.style.height = Math.max(7,currentHeight*.12) + 'px';
      shadow.style.opacity = String(.24 * shrinkProgress * (1-mix));
      shadow.style.transform = `translate(-50%,-50%) rotate(${rotation*.18}deg)`;
      const anchor=letters[anchors[k]];
      const x0=anchor.offsetLeft+anchor.offsetWidth*.52;
      const y0=h*.56;
      // Follow the same attachment point as the artwork scales and turns.
      const angle = rotation * Math.PI / 180;
      const attachmentOffset = h * .11 * scale;
      const x1=el.offsetLeft+el.offsetWidth*.5 - Math.sin(angle)*attachmentOffset;
      const y1=depth*ease+h*.24 + Math.cos(angle)*attachmentOffset;
      // Keep the reference's five bead positions independent of falling letters.
      const bx=box.width * [.164,.332,.5,.668,.836][k] + box.width*[.06,-.03,.04,-.04,-.05][k]*mix + (motionReduced()?0:pointerX*(.4+k*.08)*local);
      const beadCenterY=baseHeight * [ .61,.86,.61,.86,.61 ][k] + beadOffset - baseHeight*[.04,.13,.02,.1,.06][k]*mix + (motionReduced()?0:pointerY*(.4+k*.08)*local);
      const by=beadCenterY - beadSize*.12;
      beadEls[k].style.setProperty('--bead-x',`${bx}px`);
      beadEls[k].style.setProperty('--bead-y',`${beadCenterY}px`);
      beadEls[k].style.opacity="1";
      necklacePoints.push([bx,by]);
      necklacePoints.push([el.offsetLeft+el.offsetWidth*.5+dx,h*.24+h*scale*.26+depth*ease+dy]);
    });
    // One open strand passes through the alternating beads and small letters.
    const points=necklacePoints;
    let strand=`M ${points[0][0]-16} ${points[0][1]-8} L ${points[0][0]} ${points[0][1]}`;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],span=b[0]-a[0];
      strand+=` C ${a[0]+span*.32} ${a[1]+9} ${b[0]-span*.32} ${b[1]+9} ${b[0]} ${b[1]}`;
    }
    const last=points[points.length-1];
    strand+=` q 12 14 22 7`;
    paths.forEach((cord,i)=>{cord.style.opacity=i===0?'1':'0';if(i===0)cord.querySelectorAll('path').forEach(path=>path.setAttribute('d',strand))});
    if(t<1 && loop) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  new ResizeObserver(()=>draw(performance.now(),false)).observe(stage);
})();
