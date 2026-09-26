// Explain horizontal panning without automatically moving the view.
(()=>{
 const pan=document.getElementById('pan'),canvas=document.getElementById('canvas'),viewer=pan.closest('.viewer');
 const guide=document.createElement('div');guide.className='pan-guide';guide.innerHTML='<span class="pan-tip">↔ Povuci za pogled</span><div class="pan-track" aria-hidden="true"><span class="pan-thumb"></span></div>';viewer.append(guide);
 const tip=guide.querySelector('.pan-tip'),thumb=guide.querySelector('.pan-thumb');
 const sides=['left','right'].map(side=>{const el=document.createElement('div');el.className='edge-links '+side;viewer.append(el);return el});
 let learned=false,startX=null,lastSignature='';
 try{learned=sessionStorage.getItem('v3-pan-learned')==='1'}catch(e){}
 tip.classList.toggle('dismissed',learned);
 function learn(){learned=true;tip.classList.add('dismissed');try{sessionStorage.setItem('v3-pan-learned','1')}catch(e){}}
 function update(){
  const mobile=matchMedia('(max-width:700px)').matches,max=pan.scrollWidth-pan.clientWidth;
  guide.hidden=!mobile||max<2;sides.forEach(s=>s.hidden=!mobile||max<2);
  if(!mobile||max<2){canvas.querySelectorAll('.hot').forEach(b=>b.style.visibility='');return}
  const ratio=pan.clientWidth/pan.scrollWidth;
  thumb.style.width=(ratio*100)+'%';thumb.style.transform='translateX('+(pan.scrollLeft/pan.clientWidth*100)+'%)';
  const off=[[],[]];
  canvas.querySelectorAll('.hot').forEach(b=>{const x=b.offsetLeft-pan.scrollLeft,margin=Math.max(24,b.querySelector('.label').offsetWidth/2+6),outside=x<margin||x>pan.clientWidth-margin;b.style.visibility=outside?'hidden':'';if(x<margin)off[0].push(b);else if(x>pan.clientWidth-margin)off[1].push(b)});
  const signature=off.map(items=>items.map(b=>b.dataset.go).join(',')).join('|');
  if(signature!==lastSignature){lastSignature=signature;sides.forEach((side,i)=>{side.replaceChildren();off[i].forEach(b=>{const proxy=document.createElement('button');proxy.dataset.go=b.dataset.go;const label=b.querySelector('.label').textContent;proxy.textContent=i?label+' ›':'‹ '+label;proxy.setAttribute('aria-label','Idi: '+label);side.append(proxy)})})}
 }
 pan.addEventListener('pointerdown',e=>{startX=e.clientX},{passive:true});
 pan.addEventListener('pointermove',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>10)learn()},{passive:true});
 pan.addEventListener('pointerup',()=>startX=null,{passive:true});
 pan.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null},{passive:true});
 pan.addEventListener('touchmove',e=>{if(startX!==null&&Math.abs(e.touches[0].clientX-startX)>10)learn()},{passive:true});
 pan.addEventListener('touchend',()=>startX=null,{passive:true});
 pan.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>2||e.shiftKey)learn()},{passive:true});
 pan.tabIndex=0;pan.setAttribute('aria-label','Pogled prostora. Povucite lijevo ili desno za pomicanje.');
 pan.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();learn();pan.scrollBy({left:e.key==='ArrowLeft'?-120:120,behavior:'auto'})}});
 pan.addEventListener('scroll',update,{passive:true});
 new ResizeObserver(update).observe(pan);
 new MutationObserver(update).observe(canvas,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
 update();
})();
