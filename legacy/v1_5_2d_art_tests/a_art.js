/* ===== A. 美術：色票、角色、頭像、貓 ===== */
'use strict';
const PAL={ out:'rgba(52,36,26,0.62)', shadow:'rgba(40,28,18,0.18)', cream:'#FBF3E4', cream2:'#F1E6D0', wood:'#C99A6B', wood2:'#A8744A', wood3:'#7C5233', grass:'#9CC47C', grass2:'#88B36C', path:'#E7DCC4', path2:'#D9CBB0', wall:'#F4EAD8', wall2:'#E6D8C2', brick:'#D9A98C', brick2:'#C3907A', glass:'#CFE7EE', glass2:'#B9D8E3', night:'#25304F', leaf:'#6DAA6E', leaf2:'#4E8C57', leaf3:'#8CC08A', board:'#2E4E44', chalk:'#F3EBD3', red:'#8C3B47', gold:'#E0B95B', ink:'#3B2A1E', metal:'#9EA6AE', white:'#FFFFFF' };
const HAIR_COLORS=['#2B1E17','#3B2A1E','#5A3B25','#7A4F2C','#A66B38','#1F2430','#8B5B4A'];
const SKIN_COLORS=['#FBE5D3','#F7DCC6','#EFCBAE','#E1B593','#C4915F'];
const TOP_COLORS=['#4A6C8C','#2F5D50','#8C3B47','#E0B95B','#7B6A5A','#3E5A48','#C46A4A','#5A5A7A','#D9D3C6'];
const HAIR_STYLES=[['short','短髮'],['bob','鮑伯頭'],['long','長直髮'],['pony','馬尾'],['curly','捲髮'],['part','中分']];
function rr(ctx,x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function fillRR(ctx,x,y,w,h,r,fill,stroke){ rr(ctx,x,y,w,h,r); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.strokeStyle=stroke===true?PAL.out:stroke; ctx.stroke(); } }
function ell(ctx,x,y,rx,ry,fill,stroke){ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.strokeStyle=stroke===true?PAL.out:stroke; ctx.stroke(); } }
function shadeOf(hex,amt){ // darken hex by amt (0..1)
  const c=hex.replace('#',''); const n=parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255; r=Math.round(r*(1-amt)); g=Math.round(g*(1-amt)); b=Math.round(b*(1-amt)); return 'rgb('+r+','+g+','+b+')'; }
function lightOf(hex,amt){ const c=hex.replace('#',''); const n=parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255; r=Math.round(r+(255-r)*amt); g=Math.round(g+(255-g)*amt); b=Math.round(b+(255-b)*amt); return 'rgb('+r+','+g+','+b+')'; }

// 角色規格
function makeSpec(o){ return Object.assign({ skin:SKIN_COLORS[1], hair:HAIR_COLORS[1], hairStyle:'short', eye:'#2C2420', top:{style:'tee',color:'#4A6C8C',inner:'#FFFFFF'}, bottom:{style:'pants',color:'#3B3F4A'}, shoes:'#F4F1EA', acc:{} }, o); }
const NPC_SPECS={
  an: makeSpec({ skin:SKIN_COLORS[1], hair:'#2B1E17', hairStyle:'long', top:{style:'cardigan',color:'#2F5D50',inner:'#FFFFFF'}, bottom:{style:'skirt',color:'#2E3A55'}, shoes:'#F7F7F4', acc:{glasses:true,bag:'tote',bagColor:'#D9D3C6'} }),
  zhe: makeSpec({ skin:SKIN_COLORS[2], hair:'#5A3B25', hairStyle:'short', top:{style:'hoodie',color:'#E0B95B',inner:'#FFFFFF'}, bottom:{style:'pants',color:'#4A5A78'}, shoes:'#3A6FB0', acc:{bag:'backpack',bagColor:'#3B3F4A'} }),
  sis: makeSpec({ skin:SKIN_COLORS[0], hair:'#3B2A1E', hairStyle:'pony', top:{style:'shirt',color:'#FFFFFF',inner:'#FFFFFF'}, bottom:{style:'pants',color:'#C9B28C'}, shoes:'#8B5E3C', acc:{watch:true,cup:true} }),
  may: makeSpec({ skin:SKIN_COLORS[1], hair:'#4A3527', hairStyle:'curly', top:{style:'apron',color:'#7B6A5A',inner:'#F1E6D0',apron:'#2F5D50'}, bottom:{style:'pants',color:'#3B3F4A'}, shoes:'#2B2118', acc:{} }),
  long: makeSpec({ skin:SKIN_COLORS[2], hair:'#1F2430', hairStyle:'part', top:{style:'apron',color:'#3E5A48',inner:'#F1E6D0',apron:'#2F5D50'}, bottom:{style:'pants',color:'#2B2B3A'}, shoes:'#FFFFFF', acc:{} }),
  lee: makeSpec({ skin:SKIN_COLORS[2], hair:'#C9C3B8', hairStyle:'short', top:{style:'vest',color:'#7B6A5A',inner:'#F4F1EA'}, bottom:{style:'pants',color:'#4A4A4A'}, shoes:'#3B2A1E', acc:{glasses:true} }),
  chen: makeSpec({ skin:SKIN_COLORS[1], hair:'#2B1E17', hairStyle:'bob', top:{style:'shirt',color:'#4A6C8C',inner:'#FFFFFF'}, bottom:{style:'pants',color:'#2B2B3A'}, shoes:'#2B2118', acc:{glasses:true} }),
  lin: makeSpec({ skin:SKIN_COLORS[2], hair:'#3B2A1E', hairStyle:'part', top:{style:'shirt',color:'#7B6A5A',inner:'#FFFFFF'}, bottom:{style:'pants',color:'#2B2B3A'}, shoes:'#2B2118', acc:{} }),
  huang: makeSpec({ skin:SKIN_COLORS[1], hair:'#5A3B25', hairStyle:'short', top:{style:'vest',color:'#3E5A48',inner:'#FFFFFF'}, bottom:{style:'pants',color:'#4A4A4A'}, shoes:'#2B2118', acc:{glasses:true} }),
};
function randomSpec(seed){ const r=(n)=>Math.floor((Math.sin(seed*9301+n*49297)*0.5+0.5)*1000)%n; return makeSpec({ skin:SKIN_COLORS[r(5)], hair:HAIR_COLORS[r(7)], hairStyle:HAIR_STYLES[r(6)][0], top:{style:['tee','hoodie','shirt','cardigan'][r(4)],color:TOP_COLORS[r(9)],inner:'#FFFFFF'}, bottom:{style:['pants','skirt','shorts'][r(3)],color:['#3B3F4A','#4A5A78','#C9B28C','#2E3A55','#6B4E3D'][r(5)]}, shoes:['#F4F1EA','#3A6FB0','#2B2118','#8B5E3C'][r(4)], acc:{glasses:r(3)===0, bag:['tote','backpack',null][r(3)]} }); }

// ---- 角色繪製：原點在腳底中心；dir: down/up/left/right；pose: stand/walk/sit/read；t 時間；phase 0..1
function drawChar(ctx,x,y,spec,o){
  o=o||{}; const dir=o.dir||'down', pose=o.pose||'stand', s=o.scale||1, t=o.t||0; const walk=pose==='walk'; const ph=(o.phase||0)*Math.PI*2; const sw=walk?Math.sin(ph):0; const bob=walk?-Math.abs(Math.sin(ph))*1.6:Math.sin(t*2.2)*0.5;
  const blink=o.blink!=null?o.blink:((t+ (o.seed||0))%4.3<0.13);
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.lineWidth=1.25; ctx.lineJoin='round'; ctx.lineCap='round';
  if(!o.noShadow){ ell(ctx,0,1,pose==='sit'||pose==='read'?12:14,4.5,PAL.shadow); }
  const side= dir==='left'||dir==='right'; const back=dir==='up';
  if(dir==='left'){ ctx.scale(-1,1); }
  const H=spec.hair, HD=shadeOf(H,0.22), SK=spec.skin, SKD=shadeOf(SK,0.12), TC=spec.top.color, TD=shadeOf(TC,0.18), BC=spec.bottom.color, BD=shadeOf(BC,0.2);
  const sit=pose==='sit'||pose==='read'; const by=sit?8:0; // body lowered when seated
  ctx.translate(0,bob);
  // ---- 後髮（長髮、馬尾、鮑伯）在身體之前
  const hs=spec.hairStyle;
  const drawBackHair=()=>{
    if(side){ if(hs==='long'){ fillRR(ctx,-17,-80+by,14,46,7,H,true); } if(hs==='pony'){ ctx.save(); ctx.translate(-14,-62+by); ctx.rotate(0.35+sw*0.05); ell(ctx,0,10,5.5,15,H,true); ctx.restore(); } if(hs==='bob'){ fillRR(ctx,-16,-76+by,10,26,5,H,true); } if(hs==='curly'){ ell(ctx,-12,-62+by,8,10,H,true); } }
    else if(back){ }
    else { if(hs==='long'){ fillRR(ctx,-19,-78+by,38,52,12,H,true); } if(hs==='pony'){ ctx.save(); ctx.translate(15,-64+by); ctx.rotate(0.5); ell(ctx,0,10,5,15,H,true); ctx.restore(); } if(hs==='bob'){ fillRR(ctx,-20,-74+by,40,28,10,H,true); } if(hs==='curly'){ ell(ctx,-15,-62+by,7,10,H,true); ell(ctx,15,-62+by,7,10,H,true); } }
  };
  drawBackHair();
  // ---- 腿與鞋
  const drawLegs=()=>{
    if(sit){ if(side){ fillRR(ctx,-2,-20,16,8,3.5,BC,true); fillRR(ctx,8,-14,7,12,2.5,BC,true); fillRR(ctx,7,-6,11,6,2.5,spec.shoes,true); } else { const skirt=spec.bottom.style==='skirt'; fillRR(ctx,-12,-22,11,10,4,skirt?BC:BC,true); fillRR(ctx,1,-22,11,10,4,skirt?BC:BD,true); fillRR(ctx,-11,-15,8,13,3,skirt?SK:BC,true); fillRR(ctx,3,-15,8,13,3,skirt?SKD:BD,true); fillRR(ctx,-12,-5,10,5,2.5,spec.shoes,true); fillRR(ctx,2,-5,10,5,2.5,shadeOf(spec.shoes,0.12),true); } return; }
    if(side){ const f=sw*5, lift=Math.max(0,sw)*3, lift2=Math.max(0,-sw)*3; // back leg then front leg
      fillRR(ctx,-7-f,-26,8,22-lift2,3,BD,true); fillRR(ctx,-9-f,-6+lift2,11,6,2.5,shadeOf(spec.shoes,0.15),true);
      fillRR(ctx,-1+f,-26,8,22-lift,3,BC,true); fillRR(ctx,-2+f,-6+lift,12,6,2.5,spec.shoes,true); }
    else { const lL=Math.max(0,sw)*4, lR=Math.max(0,-sw)*4; if(spec.bottom.style==='skirt'){ ctx.beginPath(); ctx.moveTo(-12,-30); ctx.lineTo(12,-30); ctx.quadraticCurveTo(15,-13,15,-13); ctx.lineTo(-15,-13); ctx.closePath(); ctx.fillStyle=BC; ctx.fill(); ctx.strokeStyle=PAL.out; ctx.stroke(); fillRR(ctx,-9,-16,7,10-lL,2,SK,true); fillRR(ctx,2,-16,7,10-lR,2,SKD,true); }
      else if(spec.bottom.style==='shorts'){ fillRR(ctx,-10,-27,8.5,12,3,BC,true); fillRR(ctx,1.5,-27,8.5,12,3,BD,true); fillRR(ctx,-9,-16,7,10-lL,2,SK,true); fillRR(ctx,2,-16,7,10-lR,2,SKD,true); }
      else { fillRR(ctx,-10,-27,8.5,23-lL,3,BC,true); fillRR(ctx,1.5,-27,8.5,23-lR,3,BD,true); }
      fillRR(ctx,-11,-6+lL,10,6,2.5,spec.shoes,true); fillRR(ctx,1,-6+lR,10,6,2.5,shadeOf(spec.shoes,0.12),true);
      ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.moveTo(-9,-1+lL); ctx.lineTo(-3,-1+lL); ctx.moveTo(3,-1+lR); ctx.lineTo(9,-1+lR); ctx.stroke(); }
  };
  drawLegs();
  // ---- 軀幹
  const torso=()=>{ ctx.beginPath(); if(side){ ctx.moveTo(-10,-47+by); ctx.quadraticCurveTo(0,-50+by,10,-47+by); ctx.lineTo(9,-26+by); ctx.quadraticCurveTo(0,-24+by,-9,-26+by); } else { ctx.moveTo(-15,-47+by); ctx.quadraticCurveTo(0,-51+by,15,-47+by); ctx.lineTo(13,-26+by); ctx.quadraticCurveTo(0,-24+by,-13,-26+by); } ctx.closePath(); };
  const st=spec.top.style;
  if(st==='hoodie'&&!back){ ell(ctx,side?2:0,-49+by,side?9:14,6,TD,true); }
  torso(); ctx.fillStyle=TC; ctx.fill(); ctx.strokeStyle=PAL.out; ctx.stroke();
  // 簡單陰影（右側）
  ctx.save(); torso(); ctx.clip(); ctx.fillStyle='rgba(60,40,30,0.10)'; ctx.fillRect(side?3:5,-52+by,20,30); ctx.restore();
  if(!back){
    if(st==='shirt'){ ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.moveTo(side?4:-6,-47+by); ctx.lineTo(side?8:0,-42+by); ctx.lineTo(side?11:6,-47+by); ctx.closePath(); ctx.fill(); ctx.stroke(); if(!side){ ctx.fillStyle=shadeOf(TC,0.35); for(let i=0;i<3;i++) ell(ctx,0,-40+by+i*6,1.1,1.1,shadeOf(TC,0.4)); } }
    if(st==='cardigan'){ fillRR(ctx,side?4:-4,-47+by,side?6:8,21,2,spec.top.inner||'#FFF',true); }
    if(st==='vest'){ fillRR(ctx,side?4:-4,-47+by,side?6:8,21,2,spec.top.inner||'#FFF',true); ctx.strokeStyle=PAL.out; ctx.beginPath(); ctx.moveTo(side?4:-4,-47+by); ctx.lineTo(side?10:4,-40+by); ctx.stroke(); }
    if(st==='apron'){ const ap=spec.top.apron||'#2F5D50'; ctx.beginPath(); if(side){ ctx.moveTo(-6,-40+by); ctx.lineTo(9,-40+by); ctx.lineTo(10,-22+by); ctx.lineTo(-8,-22+by); } else { ctx.moveTo(-10,-40+by); ctx.lineTo(10,-40+by); ctx.lineTo(13,-22+by); ctx.lineTo(-13,-22+by); } ctx.closePath(); ctx.fillStyle=ap; ctx.fill(); ctx.stroke(); ctx.strokeStyle=ap; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(side?0:-6,-40+by); ctx.lineTo(side?2:-2,-48+by); if(!side){ ctx.moveTo(6,-40+by); ctx.lineTo(2,-48+by); } ctx.stroke(); ctx.lineWidth=1.25; }
    if(st==='hoodie'&&!side){ fillRR(ctx,-7,-34+by,14,7,2,TD,true); ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.moveTo(-2,-47+by); ctx.lineTo(-2,-40+by); ctx.moveTo(2,-47+by); ctx.lineTo(2,-40+by); ctx.stroke(); }
    if(st==='tee'&&!side){ ctx.strokeStyle=PAL.out; ctx.beginPath(); ctx.arc(0,-48+by,4,0.15*Math.PI,0.85*Math.PI); ctx.stroke(); }
  } else { if(spec.acc.bag==='backpack'){ fillRR(ctx,-11,-46+by,22,20,5,spec.acc.bagColor||'#3B3F4A',true); fillRR(ctx,-8,-44+by,16,6,3,shadeOf(spec.acc.bagColor||'#3B3F4A',0.2),true); } }
  // ---- 手臂
  const arm=(ax,ay,rot,dark)=>{ ctx.save(); ctx.translate(ax,ay); ctx.rotate(rot); fillRR(ctx,-3.5,0,7,19,3.5,dark?TD:TC,true); ell(ctx,0,20,3.6,3.6,SK,true); ctx.restore(); };
  if(pose==='read'){ // 拿書
    if(side){ arm(1,-45+by,-1.2,false); fillRR(ctx,6,-40+by,12,14,2,'#FBF3E4',true); }
    else { arm(-14,-45+by,0.9,true); arm(14,-45+by,-0.9,false); fillRR(ctx,-11,-41+by,22,13,2,'#FBF3E4',true); ctx.strokeStyle=PAL.out; ctx.beginPath(); ctx.moveTo(0,-41+by); ctx.lineTo(0,-28+by); ctx.stroke(); ctx.strokeStyle='rgba(60,40,30,0.25)'; ctx.beginPath(); for(let i=0;i<3;i++){ ctx.moveTo(-8,-37+by+i*3); ctx.lineTo(-3,-37+by+i*3); ctx.moveTo(3,-37+by+i*3); ctx.lineTo(8,-37+by+i*3); } ctx.stroke(); }
  } else if(side){ arm(1,-45+by,sw*0.5,false); if(spec.acc.cup){ fillRR(ctx,7,-30+by,7,8,1.5,'#FFFFFF',true); ctx.fillStyle='#6B4423'; ctx.fillRect(8,-29+by,5,2); } }
  else { arm(-14,-45+by,sit?0.15:sw*0.45,true); arm(14,-45+by,sit?-0.15:-sw*0.45,false); if(spec.acc.cup&&!sit){ fillRR(ctx,12,-30+by,7,8,1.5,'#FFFFFF',true); } }
  // 包包
  if(!back&&spec.acc.bag==='tote'&&!sit){ ctx.strokeStyle=spec.acc.bagColor||'#D9D3C6'; ctx.lineWidth=3; ctx.beginPath(); if(side){ ctx.moveTo(-6,-46+by); ctx.lineTo(-6,-30+by); } else { ctx.moveTo(-9,-46+by); ctx.lineTo(12,-32+by); } ctx.stroke(); ctx.lineWidth=1.25; fillRR(ctx,side?-14:9,-32+by,12,14,2,spec.acc.bagColor||'#D9D3C6',true); }
  if(!back&&spec.acc.bag==='backpack'&&!sit){ ctx.strokeStyle=spec.acc.bagColor||'#3B3F4A'; ctx.lineWidth=3; ctx.beginPath(); if(side){ ctx.moveTo(-2,-46+by); ctx.lineTo(-4,-32+by); } else { ctx.moveTo(-9,-46+by); ctx.lineTo(-8,-32+by); ctx.moveTo(9,-46+by); ctx.lineTo(8,-32+by); } ctx.stroke(); ctx.lineWidth=1.25; if(side){ fillRR(ctx,-15,-46+by,8,20,4,spec.acc.bagColor||'#3B3F4A',true); } }
  // ---- 頸與頭
  fillRR(ctx,side?-1:-3.5,-54+by,side?6:7,8,2,SKD,false);
  const hx= side?3:0, hy=-67+by;
  const headPath=()=>{ ctx.beginPath(); ctx.moveTo(hx-16,hy-3); ctx.bezierCurveTo(hx-16,hy+9,hx-8,hy+17,hx,hy+17); ctx.bezierCurveTo(hx+8,hy+17,hx+16,hy+9,hx+16,hy-3); ctx.bezierCurveTo(hx+16,hy-17,hx-16,hy-17,hx-16,hy-3); ctx.closePath(); };
  if(back){ headPath(); ctx.fillStyle=SK; ctx.fill(); ctx.stroke(); ell(ctx,-16,hy+1,3,3.2,SK,true); ell(ctx,16,hy+1,3,3.2,SK,true); }
  else { headPath(); ctx.fillStyle=SK; ctx.fill(); ctx.strokeStyle=PAL.out; ctx.stroke(); if(side){ ell(ctx,hx-12,hy+1,3,3.4,SK,true); ctx.beginPath(); ctx.moveTo(hx+15,hy+1); ctx.quadraticCurveTo(hx+19,hy+3,hx+15,hy+6); ctx.strokeStyle=PAL.out; ctx.stroke(); } else { ell(ctx,-16,hy+1,3,3.4,SK,true); ell(ctx,16,hy+1,3,3.4,SK,true); }
    drawFace(ctx,hx,hy,spec,{side,blink,expr:o.expr||'normal'}); }
  drawFrontHair(ctx,hx,hy,spec,{side,back,sw});
  if(spec.acc.glasses&&!back){ ctx.strokeStyle='rgba(50,45,60,0.85)'; ctx.lineWidth=1.3; if(side){ ctx.beginPath(); ctx.ellipse(hx+8,hy+2,5.2,4.6,0,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(hx+3,hy+1); ctx.lineTo(hx-11,hy-1); ctx.stroke(); } else { ctx.beginPath(); ctx.ellipse(-6,hy+2,5.4,4.8,0,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(6,hy+2,5.4,4.8,0,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-0.6,hy+2); ctx.lineTo(0.6,hy+2); ctx.stroke(); } ctx.lineWidth=1.25; }
  if(spec.acc.cap){ ctx.fillStyle=spec.acc.capColor||'#2E3A55'; ctx.beginPath(); ctx.moveTo(hx-16,hy-6); ctx.bezierCurveTo(hx-16,hy-20,hx+16,hy-20,hx+16,hy-6); ctx.closePath(); ctx.fill(); ctx.stroke(); if(!back){ fillRR(ctx,side?hx+10:hx-6,hy-8,side?14:22,4,2,spec.acc.capColor||'#2E3A55',true); } }
  if(spec.acc.watch&&!sit&&!back){ ctx.fillStyle='#3B2A1E'; ctx.fillRect(side?-2:12,-29+by,5,3); }
  if(o.item){ drawItem(ctx,side?10:12,-38+by,o.item); }
  ctx.restore();
}
function drawFace(ctx,hx,hy,spec,o){
  const side=o.side; const E=spec.eye; const ex= side?[hx+8]:[-6,6]; const ey=hy+2; const expr=o.expr||'normal';
  ctx.lineWidth=1.4; ctx.strokeStyle='rgba(50,35,25,0.8)';
  // 眉
  for(const x of ex){ ctx.beginPath(); if(expr==='worried'){ ctx.moveTo(x-3.5,hy-5); ctx.lineTo(x+3.5,hy-6.5); } else if(expr==='surprise'){ ctx.moveTo(x-3.5,hy-7); ctx.quadraticCurveTo(x,hy-9.5,x+3.5,hy-7); } else { ctx.moveTo(x-3.5,hy-5.5); ctx.quadraticCurveTo(x,hy-7.5,x+3.5,hy-5.5); } ctx.stroke(); }
  // 眼
  for(const x of ex){ if(o.blink||expr==='laugh'){ ctx.beginPath(); if(expr==='laugh'){ ctx.arc(x,ey+1,3,Math.PI*1.1,Math.PI*1.9); } else { ctx.moveTo(x-3,ey+1); ctx.lineTo(x+3,ey+1); } ctx.stroke(); }
    else { const rx= expr==='surprise'?3.4:2.9, ry= expr==='surprise'?5:4.3; ell(ctx,x,ey,rx,ry,E); ell(ctx,x-1,ey-1.5,1.1,1.3,'#FFFFFF'); ell(ctx,x+0.8,ey+1.4,0.6,0.7,'rgba(255,255,255,0.7)'); } }
  // 腮紅
  const bl= expr==='shy'?0.42:0.22; if(side){ ell(ctx,hx+10,hy+7,3.2,2,'rgba(235,120,120,'+bl+')'); } else { ell(ctx,-9.5,hy+7,3.2,2,'rgba(235,120,120,'+bl+')'); ell(ctx,9.5,hy+7,3.2,2,'rgba(235,120,120,'+bl+')'); }
  // 嘴
  ctx.strokeStyle='rgba(120,50,50,0.85)'; ctx.lineWidth=1.3; const mx= side?hx+11:0, my=hy+10;
  ctx.beginPath();
  if(expr==='smile'||expr==='shy'){ ctx.arc(mx,my-1,3,0.15*Math.PI,0.85*Math.PI); ctx.stroke(); }
  else if(expr==='laugh'){ ctx.moveTo(mx-3.5,my-1); ctx.quadraticCurveTo(mx,my+5,mx+3.5,my-1); ctx.closePath(); ctx.fillStyle='#8C3B47'; ctx.fill(); ctx.stroke(); }
  else if(expr==='surprise'){ ctx.ellipse(mx,my,2,2.8,0,0,Math.PI*2); ctx.fillStyle='#8C3B47'; ctx.fill(); ctx.stroke(); }
  else if(expr==='worried'){ ctx.moveTo(mx-3,my+1); ctx.quadraticCurveTo(mx-1.5,my-1.5,mx,my+0.5); ctx.quadraticCurveTo(mx+1.5,my+2.5,mx+3,my+0.5); ctx.stroke(); }
  else { ctx.moveTo(mx-2.2,my); ctx.quadraticCurveTo(mx,my+1.6,mx+2.2,my); ctx.stroke(); }
  ctx.lineWidth=1.25;
}
function drawFrontHair(ctx,hx,hy,spec,o){
  const H=spec.hair, HD=shadeOf(H,0.25), hs=spec.hairStyle; const side=o.side, back=o.back;
  ctx.fillStyle=H; ctx.strokeStyle=PAL.out; ctx.lineWidth=1.25;
  if(back){ // 後腦
    ctx.beginPath(); ctx.moveTo(hx-17,hy+2); ctx.bezierCurveTo(hx-18,hy-18,hx+18,hy-18,hx+17,hy+2); if(hs==='long'){ ctx.lineTo(hx+18,hy+40); ctx.quadraticCurveTo(hx,hy+46,hx-18,hy+40); } else if(hs==='bob'){ ctx.lineTo(hx+18,hy+14); ctx.quadraticCurveTo(hx,hy+20,hx-18,hy+14); } else if(hs==='curly'){ ctx.lineTo(hx+17,hy+8); ctx.arc(hx+10,hy+9,6,0,Math.PI); ctx.arc(hx,hy+11,6,0,Math.PI); ctx.arc(hx-10,hy+9,6,0,Math.PI); } else { ctx.lineTo(hx+16,hy+7); ctx.quadraticCurveTo(hx,hy+12,hx-16,hy+7); } ctx.closePath(); ctx.fill(); ctx.stroke();
    if(hs==='pony'){ ctx.save(); ctx.translate(hx,hy+4); ell(ctx,0,10,5.5,14,H,true); ctx.restore(); ell(ctx,hx,hy+2,3,2.2,shadeOf(H,0.3)); }
    ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(hx-8,hy-10); ctx.quadraticCurveTo(hx,hy-14,hx+8,hy-10); ctx.stroke(); ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(hx-6,hy+2); ctx.quadraticCurveTo(hx-2,hy+8,hx-7,hy+14); ctx.moveTo(hx+5,hy+1); ctx.quadraticCurveTo(hx+9,hy+7,hx+4,hy+13); ctx.stroke(); ctx.lineWidth=1.25; ctx.strokeStyle=PAL.out;
    return; }
  if(side){ // 側面：後腦到瀏海
    ctx.beginPath(); ctx.moveTo(hx-16,hy+4); ctx.bezierCurveTo(hx-18,hy-16,hx+8,hy-20,hx+17,hy-8);
    // 瀏海鋸齒（前方）
    ctx.lineTo(hx+17,hy-1); ctx.quadraticCurveTo(hx+13,hy-5,hx+10,hy-2); ctx.quadraticCurveTo(hx+8,hy-6,hx+5,hy-4);
    if(hs==='bob'||hs==='long'||hs==='curly'){ ctx.lineTo(hx-2,hy-6); ctx.lineTo(hx-14,hy-6); ctx.lineTo(hx-16,hy+6); } else { ctx.lineTo(hx-1,hy-8); ctx.lineTo(hx-12,hy-5); ctx.lineTo(hx-16,hy+4); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if(hs==='bob'){ fillRR(ctx,hx-17,hy-4,7,20,3,H,true); }
    if(hs==='long'){ fillRR(ctx,hx-17,hy-4,7,30,3,H,true); }
    if(hs==='part'){ ctx.strokeStyle=HD; ctx.beginPath(); ctx.moveTo(hx+8,hy-14); ctx.lineTo(hx+12,hy-3); ctx.stroke(); }
    ctx.strokeStyle='rgba(255,255,255,0.32)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(hx-8,hy-12); ctx.quadraticCurveTo(hx-1,hy-16,hx+6,hy-13); ctx.stroke(); ctx.lineWidth=1.25; ctx.strokeStyle=PAL.out;
    return; }
  // 正面
  ctx.beginPath(); ctx.moveTo(-17,hy+1); ctx.bezierCurveTo(-18,hy-19,18,hy-19,17,hy+1);
  if(hs==='part'){ ctx.quadraticCurveTo(14,hy-4,10,hy-2); ctx.quadraticCurveTo(6,hy-4,2,hy-9); ctx.quadraticCurveTo(-2,hy-9,-2,hy-9); ctx.quadraticCurveTo(-6,hy-4,-10,hy-2); ctx.quadraticCurveTo(-14,hy-4,-17,hy+1); }
  else if(hs==='curly'){ ctx.arc(12,hy-1,5,0,Math.PI); ctx.arc(2,hy,5,0,Math.PI); ctx.arc(-8,hy-1,5,0,Math.PI); ctx.lineTo(-17,hy+1); }
  else { ctx.quadraticCurveTo(13,hy-6,9,hy-2); ctx.quadraticCurveTo(6,hy-7,2,hy-3); ctx.quadraticCurveTo(-2,hy-8,-5,hy-3); ctx.quadraticCurveTo(-9,hy-7,-12,hy-2); ctx.quadraticCurveTo(-15,hy-5,-17,hy+1); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 高光
  ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-9,hy-12); ctx.quadraticCurveTo(-2,hy-15,4,hy-13); ctx.stroke(); ctx.lineWidth=1.25; ctx.strokeStyle=PAL.out;
  if(hs==='bob'){ fillRR(ctx,-20,hy-2,6.5,20,3,H,true); fillRR(ctx,13.5,hy-2,6.5,20,3,H,true); }
  if(hs==='long'){ fillRR(ctx,-20,hy-2,6.5,32,3,H,true); fillRR(ctx,13.5,hy-2,6.5,32,3,H,true); }
  if(hs==='short'){ ell(ctx,-16,hy+1,2.5,5,H,true); ell(ctx,16,hy+1,2.5,5,H,true); }
  if(hs==='pony'){ ell(ctx,-16,hy+2,2.5,6,H,true); }
  ctx.fillStyle='rgba(120,70,40,0.10)'; ctx.beginPath(); ctx.moveTo(-15,hy-1); ctx.quadraticCurveTo(0,hy+3,15,hy-1); ctx.quadraticCurveTo(0,hy+7,-15,hy-1); ctx.closePath(); ctx.fill();
}
function drawItem(ctx,x,y,item){ ctx.save(); ctx.translate(x,y); if(item==='latte'||item==='americano'){ fillRR(ctx,-5,-6,10,10,2,'#FFFFFF',true); ctx.fillStyle=item==='latte'?'#C9A57A':'#5A3B25'; ctx.fillRect(-4,-5,8,3); } else if(item==='tea'){ fillRR(ctx,-4,-7,8,12,2,'rgba(255,255,255,0.85)',true); ctx.fillStyle='#C7793A'; ctx.fillRect(-3,-4,6,8); } else if(item==='sandwich'){ ctx.fillStyle='#F1D9A6'; ctx.beginPath(); ctx.moveTo(-7,4); ctx.lineTo(7,4); ctx.lineTo(0,-6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#8CC08A'; ctx.fillRect(-4,1,8,2); } else if(item==='guitar'){ ctx.rotate(-0.6); ell(ctx,0,4,7,9,'#B0793E',true); ell(ctx,0,-6,5,6,'#B0793E',true); ell(ctx,0,2,2.5,2.5,'#3B2A1E'); ctx.fillStyle='#3B2A1E'; ctx.fillRect(-1.2,-24,2.4,16); } else if(item==='book'){ fillRR(ctx,-6,-4,12,9,1.5,'#2F5D50',true); } ctx.restore(); }
// 半身頭像
function drawPortrait(ctx,spec,expr,w,h){
  w=w||120; h=h||140; ctx.clearRect(0,0,w,h); ctx.save(); ctx.translate(w/2,h+38); ctx.scale(2.35,2.35);
  drawChar(ctx,0,0,spec,{dir:'down',pose:'stand',expr:expr||'normal',noShadow:true,blink:false,t:0});
  ctx.restore();
}
// 貓
function drawCat(ctx,x,y,o){ o=o||{}; const t=o.t||0; const c=o.color||'#8B8378', c2=shadeOf(c,0.2); ctx.save(); ctx.translate(x,y); if(o.dir==='left') ctx.scale(-1,1); ell(ctx,0,1,12,3,PAL.shadow);
  if(o.pose==='sit'){ ell(ctx,0,-8,9,8,c,true); ell(ctx,3,-20,7,6.5,c,true); ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(-3,-24); ctx.lineTo(-1,-30); ctx.lineTo(2,-24); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(5,-24); ctx.lineTo(8,-30); ctx.lineTo(9,-23); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle=c; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-8,-4); ctx.quadraticCurveTo(-16,-6+Math.sin(t*3)*2,-14,-16); ctx.stroke(); ctx.lineWidth=1.25; ctx.strokeStyle=PAL.out; ell(ctx,1,-21,1.2,1.5,'#2B2118'); ell(ctx,6,-21,1.2,1.5,'#2B2118'); ell(ctx,4,-18,1,0.8,'#D98A8A'); }
  else { const w=o.pose==='walk'?Math.sin(t*10):0; ell(ctx,0,-9,13,7,c,true); ell(ctx,12,-14,7,6.5,c,true); ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(8,-18); ctx.lineTo(9,-25); ctx.lineTo(13,-19); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14,-19); ctx.lineTo(17,-25); ctx.lineTo(18,-18); ctx.closePath(); ctx.fill(); ctx.stroke();
    fillRR(ctx,-9+w*2,-6,4,7,1.5,c2,true); fillRR(ctx,-3-w*2,-6,4,7,1.5,c,true); fillRR(ctx,4+w*2,-6,4,7,1.5,c2,true); fillRR(ctx,9-w*2,-6,4,7,1.5,c,true);
    ctx.strokeStyle=c; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-12,-11); ctx.quadraticCurveTo(-20,-14+Math.sin(t*3)*3,-18,-24); ctx.stroke(); ctx.lineWidth=1.25; ctx.strokeStyle=PAL.out; ell(ctx,11,-15,1.2,1.5,'#2B2118'); ell(ctx,15,-15,1.2,1.5,'#2B2118'); ell(ctx,17,-12,1,0.8,'#D98A8A'); }
  ctx.restore(); }
