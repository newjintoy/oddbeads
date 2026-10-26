(() => {
  const section=document.querySelector('.finale-playground');
  if(!section)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const beads=[...section.querySelectorAll('.finale-bead')];
  const running=new Map();
  function bounce(bead,index,delay=0){
    if(reduced.matches)return;
    (running.get(bead)||[]).forEach(animation=>animation.cancel());
    const amplitude=Math.min(85,innerWidth*.055)*(1+(index%3)*.13);
    const img=bead.querySelector('img'),shadow=bead.querySelector('.finale-bead-shadow');
    const frames=[
      {transform:'translateY(0) rotate(0deg) scale(1.06,.91)',offset:0},
      {transform:`translateY(${-amplitude}px) rotate(${index%2?-10:10}deg) scale(.98,1.03)`,offset:.26},
      {transform:'translateY(0) rotate(0deg) scale(1.09,.88)',offset:.5},
      {transform:`translateY(${-amplitude*.40}px) rotate(${index%2?4:-4}deg) scale(1)`,offset:.67},
      {transform:'translateY(0) rotate(0deg) scale(1.04,.95)',offset:.81},
      {transform:`translateY(${-amplitude*.12}px) scale(1)`,offset:.9},
      {transform:'translateY(0) rotate(0deg) scale(1)',offset:1}
    ];
    const options={duration:1350,delay,easing:'ease-in-out',fill:'backwards'};
    running.set(bead,[img.animate(frames,options),shadow.animate([
      {transform:'scale(1)',opacity:.8,offset:0},{transform:'scale(.58)',opacity:.2,offset:.26},
      {transform:'scale(1.12)',opacity:.9,offset:.5},{transform:'scale(.78)',opacity:.4,offset:.67},
      {transform:'scale(1)',opacity:.8,offset:1}
    ],options)]);
  }
  beads.forEach((bead,i)=>{bead.addEventListener('pointerenter',()=>bounce(bead,i));bead.addEventListener('click',()=>bounce(bead,i));bead.addEventListener('focus',()=>bounce(bead,i))});
  let visible=false;
  new IntersectionObserver(entries=>{const next=entries[0].isIntersecting;if(next&&!visible)beads.forEach((bead,i)=>bounce(bead,i,i*110));visible=next},{threshold:.25}).observe(section);
})();
