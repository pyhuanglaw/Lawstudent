/* ===== A2. 對話立繪（較自然比例的半身像） ===== */
function drawBust(ctx,spec,expr,W,H,o){
  W=W||220; H=H||260; o=o||{}; expr=expr||'normal'; ctx.clearRect(0,0,W,H); ctx.save();
  const cx=W/2, fy=118; // 臉中心 y
  const SK=spec.skin, SKD=shadeOf(SK,0.13), SKD2=shadeOf(SK,0.22), H_=spec.hair, HD=shadeOf(H_,0.22), HL=lightOf(H_,0.28), TC=spec.top.color, TD=shadeOf(TC,0.18), hs=spec.hairStyle;
  ctx.lineJoin='round'; ctx.lineCap='round'; ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)';
  const facePath=()=>{ ctx.beginPath(); ctx.moveTo(cx-38,fy-12); ctx.bezierCurveTo(cx-40,fy+18,cx-20,fy+50,cx,fy+54); ctx.bezierCurveTo(cx+20,fy+50,cx+40,fy+18,cx+38,fy-12); ctx.bezierCurveTo(cx+38,fy-50,cx-38,fy-50,cx-38,fy-12); ctx.closePath(); };
  // 後髮
  ctx.fillStyle=H_;
  if(hs==='long'){ rr(ctx,cx-50,fy-54,100,190,40); ctx.fill(); ctx.stroke(); }
  else if(hs==='bob'){ rr(ctx,cx-50,fy-54,100,116,40); ctx.fill(); ctx.stroke(); }
  else if(hs==='curly'){ ctx.beginPath(); ctx.ellipse(cx,fy-4,54,64,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); }
  else if(hs==='pony'){ ctx.save(); ctx.translate(cx+44,fy+2); ctx.rotate(0.55); ctx.beginPath(); ctx.ellipse(0,26,14,42,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); ctx.beginPath(); ctx.ellipse(cx,fy-8,46,50,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.ellipse(cx,fy-8,46,50,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); }
  // 頸與身體
  fillRR(ctx,cx-15,fy+40,30,44,8,SKD,true);
  ctx.beginPath(); ctx.moveTo(cx-95,H+20); ctx.lineTo(cx-70,fy+92); ctx.quadraticCurveTo(cx-40,fy+74,cx-16,fy+70); ctx.lineTo(cx+16,fy+70); ctx.quadraticCurveTo(cx+40,fy+74,cx+70,fy+92); ctx.lineTo(cx+95,H+20); ctx.closePath(); ctx.fillStyle=TC; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx-95,H+20); ctx.lineTo(cx-70,fy+92); ctx.quadraticCurveTo(cx-40,fy+74,cx-16,fy+70); ctx.lineTo(cx+16,fy+70); ctx.quadraticCurveTo(cx+40,fy+74,cx+70,fy+92); ctx.lineTo(cx+95,H+20); ctx.closePath(); ctx.clip(); ctx.fillStyle='rgba(60,40,30,0.10)'; ctx.fillRect(cx+10,fy+60,120,140); ctx.restore();
  const st=spec.top.style;
  if(st==='shirt'||st==='vest'||st==='cardigan'){ ctx.fillStyle=st==='shirt'?'#FFFFFF':(spec.top.inner||'#fff'); ctx.beginPath(); ctx.moveTo(cx-16,fy+70); ctx.lineTo(cx-12,fy+96); ctx.lineTo(cx,fy+88); ctx.lineTo(cx+12,fy+96); ctx.lineTo(cx+16,fy+70); ctx.closePath(); ctx.fill(); ctx.stroke(); if(st==='shirt'){ ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.moveTo(cx-34,fy+78); ctx.lineTo(cx-16,fy+70); ctx.lineTo(cx-8,fy+92); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx+34,fy+78); ctx.lineTo(cx+16,fy+70); ctx.lineTo(cx+8,fy+92); ctx.closePath(); ctx.fill(); ctx.stroke(); } if(st==='cardigan'||st==='vest'){ fillRR(ctx,cx-14,fy+86,28,60,4,spec.top.inner||'#fff',true); } }
  if(st==='hoodie'){ ctx.fillStyle=TD; ctx.beginPath(); ctx.moveTo(cx-40,fy+84); ctx.quadraticCurveTo(cx,fy+52,cx+40,fy+84); ctx.quadraticCurveTo(cx,fy+100,cx-40,fy+84); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(cx-6,fy+92); ctx.lineTo(cx-8,fy+130); ctx.moveTo(cx+6,fy+92); ctx.lineTo(cx+8,fy+130); ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)'; }
  if(st==='tee'){ ctx.strokeStyle='rgba(52,36,26,0.6)'; ctx.beginPath(); ctx.moveTo(cx-20,fy+72); ctx.quadraticCurveTo(cx,fy+92,cx+20,fy+72); ctx.stroke(); }
  if(st==='apron'){ const ap=spec.top.apron||'#2F5D50'; ctx.fillStyle=ap; ctx.beginPath(); ctx.moveTo(cx-30,fy+120); ctx.lineTo(cx+30,fy+120); ctx.lineTo(cx+40,H+20); ctx.lineTo(cx-40,H+20); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle=ap; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(cx-20,fy+120); ctx.lineTo(cx-12,fy+80); ctx.moveTo(cx+20,fy+120); ctx.lineTo(cx+12,fy+80); ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)'; }
  // 臉
  facePath(); ctx.fillStyle=SK; ctx.fill(); ctx.stroke();
  ctx.save(); facePath(); ctx.clip(); ctx.fillStyle='rgba(120,70,40,0.10)'; ctx.fillRect(cx+18,fy-60,60,140); ctx.fillStyle='rgba(120,70,40,0.12)'; ctx.beginPath(); ctx.ellipse(cx,fy+48,30,10,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  // 耳
  ell(ctx,cx-40,fy+8,7,10,SK,true); ell(ctx,cx+40,fy+8,7,10,SK,true); ell(ctx,cx-40,fy+8,3.5,5,SKD2); ell(ctx,cx+40,fy+8,3.5,5,SKD2);
  // 眼睛
  const eyeC=spec.eye||'#2C2420'; const iris=spec.iris||'#5A3A2A'; const lookX= expr==='shy'?3:0;
  const eye=(x,dirn)=>{ const w=13, h= expr==='surprise'?10:8; ctx.beginPath(); ctx.moveTo(x-w,fy+2); ctx.quadraticCurveTo(x,fy-h-2,x+w,fy+2); ctx.quadraticCurveTo(x,fy+h-1,x-w,fy+2); ctx.closePath(); ctx.fillStyle='#FFFDFB'; ctx.fill();
    ctx.save(); ctx.clip(); ell(ctx,x+lookX*dirn,fy+2,6.5,7.5,iris); ell(ctx,x+lookX*dirn,fy+2,5,5.8,shadeOf(iris,0.35)); ell(ctx,x+lookX*dirn,fy+3,3,3.4,'#1F1714'); ell(ctx,x-2+lookX*dirn,fy-1,2,2.2,'#FFFFFF'); ell(ctx,x+2.5+lookX*dirn,fy+5,1.1,1.2,'rgba(255,255,255,0.8)'); ctx.fillStyle='rgba(60,40,30,0.18)'; ctx.fillRect(x-w,fy-h-4,2*w,5); ctx.restore();
    ctx.strokeStyle='rgba(45,30,22,0.9)'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(x-w,fy+2); ctx.quadraticCurveTo(x,fy-h-2,x+w,fy+2); ctx.stroke(); ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(x-w+3,fy+5); ctx.quadraticCurveTo(x,fy+h,x+w-3,fy+5); ctx.stroke();
    ctx.lineWidth=1.8; ctx.beginPath(); ctx.moveTo(x+w*dirn,fy+1); ctx.lineTo(x+(w+4)*dirn,fy-2); ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)'; };
  const closedEye=(x)=>{ ctx.strokeStyle='rgba(45,30,22,0.9)'; ctx.lineWidth=2.2; ctx.beginPath(); if(expr==='laugh'){ ctx.moveTo(x-12,fy+4); ctx.quadraticCurveTo(x,fy-6,x+12,fy+4); } else { ctx.moveTo(x-12,fy+1); ctx.quadraticCurveTo(x,fy+6,x+12,fy+1); } ctx.stroke(); ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)'; };
  if(expr==='laugh'||o.blink){ closedEye(cx-17); closedEye(cx+17); } else { eye(cx-17,-1); eye(cx+17,1); }
  // 眉毛
  ctx.strokeStyle=shadeOf(H_,0.1); ctx.lineWidth=3; const brow=(x,d)=>{ ctx.beginPath(); if(expr==='worried'){ ctx.moveTo(x-12*d,fy-20); ctx.quadraticCurveTo(x-2*d,fy-24,x+10*d,fy-16); } else if(expr==='surprise'){ ctx.moveTo(x-12*d,fy-22); ctx.quadraticCurveTo(x,fy-30,x+12*d,fy-24); } else { ctx.moveTo(x-12*d,fy-19); ctx.quadraticCurveTo(x,fy-25,x+12*d,fy-21); } ctx.stroke(); }; brow(cx-17,-1); brow(cx+17,1); ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)';
  // 鼻
  ctx.strokeStyle='rgba(120,70,50,0.55)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cx+2,fy+14); ctx.quadraticCurveTo(cx+5,fy+22,cx,fy+24); ctx.stroke(); ctx.fillStyle='rgba(120,70,50,0.12)'; ctx.beginPath(); ctx.ellipse(cx+3,fy+22,5,3,0,0,Math.PI*2); ctx.fill();
  // 腮紅
  const bl= expr==='shy'?0.45:expr==='laugh'||expr==='smile'?0.3:0.2; ell(ctx,cx-26,fy+22,9,5,'rgba(235,120,120,'+bl+')'); ell(ctx,cx+26,fy+22,9,5,'rgba(235,120,120,'+bl+')');
  // 嘴
  ctx.strokeStyle='rgba(150,60,60,0.85)'; ctx.lineWidth=1.8; const my=fy+38; ctx.beginPath();
  if(expr==='smile'||expr==='shy'){ ctx.moveTo(cx-9,my-1); ctx.quadraticCurveTo(cx,my+6,cx+9,my-1); ctx.stroke(); ctx.strokeStyle='rgba(200,110,110,0.5)'; ctx.beginPath(); ctx.moveTo(cx-5,my+4); ctx.quadraticCurveTo(cx,my+6,cx+5,my+4); ctx.stroke(); }
  else if(expr==='laugh'){ ctx.moveTo(cx-10,my-2); ctx.quadraticCurveTo(cx,my+12,cx+10,my-2); ctx.quadraticCurveTo(cx,my,cx-10,my-2); ctx.closePath(); ctx.fillStyle='#8C3B47'; ctx.fill(); ctx.stroke(); ctx.fillStyle='#FFFFFF'; ctx.fillRect(cx-6,my-1,12,3); }
  else if(expr==='surprise'){ ctx.ellipse(cx,my+2,5,7,0,0,Math.PI*2); ctx.fillStyle='#8C3B47'; ctx.fill(); ctx.stroke(); }
  else if(expr==='worried'){ ctx.moveTo(cx-8,my+2); ctx.quadraticCurveTo(cx-4,my-3,cx,my+1); ctx.quadraticCurveTo(cx+4,my+5,cx+8,my+1); ctx.stroke(); }
  else { ctx.moveTo(cx-7,my); ctx.quadraticCurveTo(cx,my+3,cx+7,my); ctx.stroke(); ctx.strokeStyle='rgba(200,110,110,0.45)'; ctx.beginPath(); ctx.moveTo(cx-4,my+4); ctx.quadraticCurveTo(cx,my+5.5,cx+4,my+4); ctx.stroke(); }
  ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)';
  // 前髮
  ctx.fillStyle=H_;
  ctx.beginPath(); ctx.moveTo(cx-42,fy-6); ctx.bezierCurveTo(cx-46,fy-64,cx+46,fy-64,cx+42,fy-6);
  if(hs==='part'){ ctx.quadraticCurveTo(cx+34,fy-22,cx+22,fy-14); ctx.quadraticCurveTo(cx+10,fy-16,cx+4,fy-34); ctx.quadraticCurveTo(cx-4,fy-34,cx-4,fy-34); ctx.quadraticCurveTo(cx-10,fy-16,cx-22,fy-14); ctx.quadraticCurveTo(cx-34,fy-22,cx-42,fy-6); }
  else if(hs==='curly'){ for(let i=0;i<5;i++){ ctx.arc(cx+30-i*15,fy-14,8,0,Math.PI); } ctx.lineTo(cx-42,fy-6); }
  else if(hs==='short'){ ctx.quadraticCurveTo(cx+30,fy-30,cx+18,fy-20); ctx.quadraticCurveTo(cx+8,fy-30,cx-2,fy-20); ctx.quadraticCurveTo(cx-12,fy-32,cx-24,fy-18); ctx.quadraticCurveTo(cx-34,fy-24,cx-42,fy-6); }
  else { ctx.quadraticCurveTo(cx+32,fy-22,cx+24,fy-12); ctx.quadraticCurveTo(cx+14,fy-28,cx+6,fy-14); ctx.quadraticCurveTo(cx-4,fy-30,cx-12,fy-14); ctx.quadraticCurveTo(cx-22,fy-26,cx-30,fy-12); ctx.quadraticCurveTo(cx-36,fy-18,cx-42,fy-6); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // 髮絲與高光
  ctx.strokeStyle=HD; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(cx+10,fy-56); ctx.quadraticCurveTo(cx+16,fy-40,cx+12,fy-22); ctx.moveTo(cx-14,fy-56); ctx.quadraticCurveTo(cx-18,fy-40,cx-16,fy-22); ctx.stroke();
  ctx.strokeStyle=HL; ctx.lineWidth=3; ctx.globalAlpha=0.7; ctx.beginPath(); ctx.moveTo(cx-24,fy-46); ctx.quadraticCurveTo(cx-4,fy-56,cx+16,fy-48); ctx.stroke(); ctx.globalAlpha=1; ctx.lineWidth=1.6; ctx.strokeStyle='rgba(52,36,26,0.6)';
  if(hs==='bob'||hs==='long'){ fillRR(ctx,cx-50,fy-14,16,hs==='long'?150:70,8,H_,true); fillRR(ctx,cx+34,fy-14,16,hs==='long'?150:70,8,H_,true); }
  if(hs==='pony'){ fillRR(ctx,cx-48,fy-10,12,40,6,H_,true); }
  // 瀏海下的陰影
  ctx.fillStyle='rgba(120,70,40,0.10)'; ctx.beginPath(); ctx.ellipse(cx,fy-11,34,7,0,0,Math.PI*2); ctx.fill();
  // 眼鏡
  if(spec.acc.glasses){ ctx.strokeStyle='rgba(50,45,60,0.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(cx-17,fy+2,16,12,0,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx+17,fy+2,16,12,0,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx-1,fy+2); ctx.lineTo(cx+1,fy+2); ctx.moveTo(cx-33,fy+1); ctx.lineTo(cx-42,fy-1); ctx.moveTo(cx+33,fy+1); ctx.lineTo(cx+42,fy-1); ctx.stroke(); ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.ellipse(cx-17,fy+2,16,12,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx+17,fy+2,16,12,0,0,Math.PI*2); ctx.fill(); ctx.lineWidth=1.6; }
  if(spec.acc.cap){ ctx.fillStyle=spec.acc.capColor||'#2E3A55'; ctx.beginPath(); ctx.moveTo(cx-44,fy-22); ctx.bezierCurveTo(cx-44,fy-70,cx+44,fy-70,cx+44,fy-22); ctx.closePath(); ctx.fill(); ctx.stroke(); fillRR(ctx,cx-30,fy-26,60,9,4,spec.acc.capColor||'#2E3A55',true); }
  ctx.restore();
}
