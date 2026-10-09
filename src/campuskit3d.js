// ===== campuskit3d.js — 校園建築套件（v9.3）=====
// 台大日治時期建築的語彙：褐色十三溝面磚、一樓連續拱廊（騎樓式迴廊）、拱窗（石材窗框、窗台）、樓層間的石材腰帶與簷口、
// 寄棟屋頂、中央入口門廊；總圖加中央塔樓。取代 W3.building 的貼圖方盒——只換外觀，佔地尺寸不變（導航格與碰撞不受影響）。
// 本地座標：建築中心在原點、地面 y=0，正面朝 +z。全部是程式產生的幾何與 Canvas 貼圖（沒有外部素材）。
const CK=(function(){ 'use strict';
  // TK（townkit3d.js）是全域 const，不是 window 的屬性：直接用名字
  // ---------- 貼圖 ----------
  // 十三溝面磚：二丁掛尺寸的磚、順砌、每塊磚上有細的直溝；一張貼圖代表 1.2 m × 1.2 m
  function tileTex(hex){ return TK.tex('ckTile'+hex,256,256,(x,w,h)=>{ const b=new THREE.Color(hex); x.fillStyle='#'+b.clone().multiplyScalar(1.12).getHexString(); x.fillRect(0,0,w,h); const tw=48, th=12.8; let s=7;
    const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
    for(let r=0;r<20;r++){ for(let c=-1;c<6;c++){ const x0=c*tw+(r%2)*tw/2+1, y0=r*th+1; const k=0.86+rnd()*0.24; x.fillStyle='#'+b.clone().multiplyScalar(k).getHexString(); x.fillRect(x0,y0,tw-2,th-2);
      x.fillStyle='rgba(0,0,0,0.10)'; for(let gi=1;gi<13;gi++){ const gx=x0+gi*(tw-2)/13; x.fillRect(gx,y0+1,0.8,th-4); } } }
    x.fillStyle='rgba(0,0,0,0.05)'; for(let i=0;i<60;i++) x.fillRect((i*67)%w,(i*131)%h,4,2); }); }
  function stoneTex(hex){ return TK.tex('ckStone'+hex,128,128,(x,w,h)=>{ x.fillStyle=hex; x.fillRect(0,0,w,h); let s=11; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<500;i++){ const v=Math.round(rnd()*40-20); x.fillStyle=v>0?'rgba(255,255,255,'+(v/200)+')':'rgba(0,0,0,'+(-v/200)+')'; x.fillRect(rnd()*w,rnd()*h,2,2); } x.fillStyle='rgba(0,0,0,0.12)'; x.fillRect(0,h-2,w,2); x.fillRect(w-2,0,2,h); }); }
  function roofTex(hex){ return TK.tex('ckRoof'+hex,128,128,(x,w,h)=>{ const b=new THREE.Color(hex); x.fillStyle='#'+b.getHexString(); x.fillRect(0,0,w,h); for(let r=0;r<8;r++){ x.fillStyle='rgba(0,0,0,0.28)'; x.fillRect(0,r*16+13,w,3); for(let c=0;c<8;c++){ x.fillStyle='#'+b.clone().multiplyScalar(0.9+((r*5+c*3)%7)/30).getHexString(); x.fillRect(c*16+(r%2)*8+1,r*16,14,13); } } }); }
  function glassTex(){ return TK.tex('ckGlass',64,128,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#5c6f7c'); g.addColorStop(0.5,'#33424d'); g.addColorStop(1,'#2a333b'); x.fillStyle=g; x.fillRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.10)'; x.beginPath(); x.moveTo(0,h*0.3); x.lineTo(w,h*0.1); x.lineTo(w,h*0.2); x.lineTo(0,h*0.4); x.fill(); }); }
  // 夜間：窗戶透出室內暖光（setNight 控制）
  function glassEmit(){ return TK.tex('ckGlassE',64,128,(x,w,h)=>{ x.fillStyle='#000'; x.fillRect(0,0,w,h); const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'#ffcf8a'); g.addColorStop(1,'#d89a58'); x.fillStyle=g; x.fillRect(2,2,w-4,h-4); }); }
  const rep=(t,rx,ry)=>{ const c=t.clone(); c.needsUpdate=true; c.wrapS=c.wrapT=THREE.RepeatWrapping; c.repeat.set(rx,ry); return c; };
  function wallMat(hex){ return TK.M('ckWall'+hex,()=>{ const t=tileTex(hex); t.wrapS=t.wrapT=THREE.RepeatWrapping; return TK.std({map:t,roughness:0.92}); }); }
  function trimMat(hex){ return TK.M('ckTrim'+hex,()=>{ const t=stoneTex(hex); t.wrapS=t.wrapT=THREE.RepeatWrapping; return TK.std({map:t,roughness:0.85}); }); }
  function roofMat(hex){ return TK.M('ckRoofM'+hex,()=>{ const t=roofTex(hex); t.wrapS=t.wrapT=THREE.RepeatWrapping; return TK.std({map:t,roughness:0.88,side:THREE.DoubleSide}); }); }
  const GLASS=()=>TK.glowMat('ckGlass',glassTex(),{nightI:0.9,emap:glassEmit(),mat:{roughness:0.25,metalness:0.1}});
  // 晚上不亮的窗（約三成；沒有這個的話傍晚、晚上整棟每扇窗都一起亮，像每間教室都開燈）
  const GLASS_DARK=()=>TK.M('ckGlassDark',()=>TK.std({map:glassTex(),roughness:0.25,metalness:0.1}));
  const winLit=(x,y,z)=>{ const h=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453; return h-Math.floor(h)>0.3; };
  // ---------- 幾何零件 ----------
  // 拱形（矩形＋半圓頂），底邊在 y=0
  function archShape(w,h,cx,cy){ cx=cx||0; cy=cy||0; const r=w/2, s=new THREE.Shape(); s.moveTo(cx-r,cy); s.lineTo(cx-r,cy+h-r); s.absarc(cx,cy+h-r,r,Math.PI,0,true); s.lineTo(cx+r,cy); s.lineTo(cx-r,cy); return s; }
  function archPath(w,h,cx,cy){ const r=w/2, p=new THREE.Path(); p.moveTo(cx-r,cy); p.lineTo(cx+r,cy); p.lineTo(cx+r,cy+h-r); p.absarc(cx,cy+h-r,r,0,Math.PI,false); p.lineTo(cx-r,cy); return p; }
  // 拱窗：石材窗框（環狀擠出）＋玻璃＋窗台＋中間直櫺與橫櫺；回傳要加進 Bin 的零件（本地座標，窗的正面朝 +z）
  const winCache={};
  // 方窗（戰後新建的系館：面磚＋方窗＋一樓拱廊）
  function rectShape(w,h){ const s=new THREE.Shape(); s.moveTo(-w/2,0); s.lineTo(w/2,0); s.lineTo(w/2,h); s.lineTo(-w/2,h); s.lineTo(-w/2,0); return s; }
  function rectPath(w,h){ const p=new THREE.Path(); p.moveTo(-w/2,0); p.lineTo(-w/2,h); p.lineTo(w/2,h); p.lineTo(w/2,0); p.lineTo(-w/2,0); return p; }
  function windowParts(w,h,f,rect){ const key=w+'_'+h+'_'+f+(rect?'_r':''); if(winCache[key]) return winCache[key];
    const ring=rect?rectShape(w+2*f,h+f):archShape(w+2*f,h+f); ring.holes.push(rect?rectPath(w,h):archPath(w,h,0,0));
    // 手機效能：拱的曲線 6 段就夠圓（第六批用 10 段，校園畫面多了約 10 萬個三角形）
    const frame=new THREE.ExtrudeGeometry(ring,{depth:0.12,bevelEnabled:false,curveSegments:6});
    const glass=new THREE.ShapeGeometry(rect?rectShape(w,h):archShape(w,h),6); { const uv=glass.attributes.uv, p=glass.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,(p.getX(i)+w/2)/w,p.getY(i)/h); }
    const sill=TK.boxG(w+2*f+0.18,0.1,0.26);
    const mull=TK.boxG(0.06,h-0.1,0.05), tran=TK.boxG(w,0.06,0.05);
    return (winCache[key]={frame,glass,sill,mull,tran,w,h,f,ty:rect?h*0.72:h-w/2}); }
  function addWindow(bin,M,wp,x,y,z,ry){ const c=Math.cos(ry), s=Math.sin(ry); const at=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];
    let p=at(0,0,-0.02); bin.add(M.trim,wp.frame.clone(),p[0],p[1],p[2],ry,{noShadow:true}); // 窗框、窗台很薄，不投影（陰影圖少畫很多三角形）
    p=at(0,0,0.02); bin.add(winLit(p[0],p[1],p[2])?M.glass:M.glassDark,wp.glass.clone(),p[0],p[1],p[2],ry,{noShadow:true});
    p=at(0,-0.05,0.1); bin.add(M.trim,wp.sill.clone(),p[0],p[1],p[2],ry,{noShadow:true});
    p=at(0,(wp.h-0.1)/2,0.05); bin.add(M.frameDark,wp.mull.clone(),p[0],p[1],p[2],ry,{noShadow:true});
    p=at(0,wp.ty,0.05); bin.add(M.frameDark,wp.tran.clone(),p[0],p[1],p[2],ry,{noShadow:true}); }
  // 寄棟屋頂（四坡）：W×D 的範圍、屋脊高 Hr
  function hipRoof(W,D,Hr){ const r=(W-D)/2>0?(W-D)/2:0; const hw=W/2, hd=D/2; const P=[]; const UV=[];
    const tri=(a,b,c)=>{ P.push(...a,...b,...c); for(const v of [a,b,c]) UV.push(v[0]/2.4,(v[1]+Math.abs(v[2]))/1.8); };
    const A=[-hw,0,hd], B=[hw,0,hd], C=[hw,0,-hd], Dd=[-hw,0,-hd], R1=[-r,Hr,0], R2=[r,Hr,0];
    tri(A,B,R2); tri(A,R2,R1); tri(C,Dd,R1); tri(C,R1,R2); tri(B,C,R2); tri(Dd,A,R1);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); g.computeVertexNormals(); return g; }
  // 拱廊的拱圈牆（一個開間）：bw 寬、從 ys（起拱線）到 top，挖掉半徑 r 的半圓
  function spandrel(bw,ys,top,r){ const s=new THREE.Shape(); s.moveTo(-bw/2,ys); s.lineTo(-r,ys); s.absarc(0,ys,r,Math.PI,0,true); s.lineTo(bw/2,ys); s.lineTo(bw/2,top); s.lineTo(-bw/2,top); s.lineTo(-bw/2,ys); return s; }
  // ---------- 建築 ----------
  // o: {w,d,floors,gfh,fh,bay,wall,trim,roof,roofH,roofType:'flat',win:'rect',arcade,arcDepth,porch:{bays,depth,pediment,style:'flat',h,ys,pedH},tower:{w,h},sign,signColor,winW}
  function hall(o){ const g=new THREE.Group(); const bin=new TK.Bin(); const blocks=[];
    const w=o.w, d=o.d, nf=o.floors||2, gfh=o.gfh||4.6, fh=o.fh||4.0, H=gfh+(nf-1)*fh, bayT=o.bay||3.8;
    const M={wall:wallMat(o.wall||'#a8664a'), trim:trimMat(o.trim||'#d8d0c0'), roof:roofMat(o.roof||'#4f3a32'), glass:GLASS(), glassDark:GLASS_DARK(), frameDark:TK.col('#3a2e28'), ceil:TK.col(o.ceilCol||'#cfc6b6'), dark:TK.col('#2e2a26'), door:TK.col('#4a3426')};
    const arc=o.arcade!==false, ad=arc?(o.arcDepth||2.6):0;
    // 正面開間；有門廊時，開間數和門廊的拱數同奇偶，門廊兩側的牆才會剛好落在拱廊的柱子上（不會有柱子擋在拱的正中間）
    let nb=Math.max(3,Math.round(w/bayT)); if(arc&&o.porch&&(nb-(o.porch.bays||3))%2){ nb+=(w/bayT>nb?1:-1); if(nb<3) nb+=2; } const bw=w/nb, apw=Math.max(0.7,bw*0.22);
    const nbs=Math.max(2,Math.round(d/bayT)), bws=d/nbs; // 側面開間
    // 主體：上面幾層是完整的盒子；一樓有拱廊時正面往內縮 ad
    bin.add(M.wall,TK.boxG(w,H-gfh,d,1.2),0,gfh+(H-gfh)/2,0);
    bin.add(M.wall,TK.boxG(w,gfh,d-ad,1.2),0,gfh/2,-ad/2);
    // 勒腳（石材基座）、樓層腰帶、簷口
    bin.add(M.trim,TK.boxG(w+0.16,0.7,d-ad+0.16,1.0),0,0.35,-ad/2);
    for(let i=1;i<nf;i++){ const y=gfh+(i-1)*fh; bin.add(M.trim,TK.boxG(w+0.24,0.22,d+0.24,1.0),0,y,0); }
    bin.add(M.trim,TK.boxG(w+0.7,0.5,d+0.7,1.0),0,H+0.25,0); bin.add(M.trim,TK.boxG(w+0.4,0.25,d+0.4,1.0),0,H-0.08,0);
    // 窗：上面各層四面都有拱窗；一樓背面、側面也有
    const rw=o.win==='rect', ww=Math.min(o.winW||1.5,bw*0.48), wh=Math.min(fh*(rw?0.55:0.62),2.7), wpU=windowParts(ww,wh,0.16,rw);
    const wwS=Math.min(o.winW||1.5,bws*0.48), wpS=windowParts(wwS,wh,0.16,rw);
    const sillY=(fl)=> (fl===0?1.2:gfh+(fl-1)*fh+0.75);
    for(let fl=0;fl<nf;fl++){ const y=sillY(fl);
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5);
        const door=!arc&&fl===0&&Math.abs(i-(nb-1)/2)<0.6; // 沒有拱廊（宿舍）：一樓正面中間是大門
        if(fl>0||(!arc&&!door)) addWindow(bin,M,wpU,x,y,d/2+0.01,0); // 正面（有拱廊時一樓是拱廊）
        if(door){ bin.add(M.door,TK.boxG(1.9,2.7,0.08),x,1.35,d/2+0.12); bin.add(M.trim,TK.boxG(2.4,0.22,0.2),x,2.85,d/2+0.12); /* 門在勒腳前面（勒腳正面在 d/2+0.08，同一平面會閃爍）*/ bin.add(M.trim,TK.boxG(2.6,0.12,0.9,1.0),x,0.06,d/2+0.45); }
        if(fl>0||!o.backArcade) addWindow(bin,M,wpU,x,y,-d/2-0.01,Math.PI); }
      for(let j=0;j<nbs;j++){ const z=-d/2+bws*(j+0.5); if(fl===0&&z>d/2-ad-0.8) continue; addWindow(bin,M,wpS,w/2+0.01,y,z,Math.PI/2); addWindow(bin,M,wpS,-w/2-0.01,y,z,-Math.PI/2); } }
    // 一樓拱廊：柱墩＋拱圈＋天花板＋地坪＋裡面的門窗
    // 碰撞（本地座標 [x,z,寬,深,外擴]）：有拱廊時只擋建築本體＋每根柱子，拱廊底下可以走
    if(arc){ blocks.push([0,-ad/2,w,d-ad,0.3]); for(let i=0;i<=nb;i++) blocks.push([-w/2+bw*i,d/2-0.3,apw,0.6,0.15]); } else blocks.push([0,0,w,d,0.3]);
    if(arc){ const pw=apw, r=(bw-pw)/2, ys=Math.min(gfh-r-0.5,2.6), fz=d/2-0.3;
      for(let i=0;i<=nb;i++){ const x=-w/2+bw*i; bin.add(M.wall,TK.boxG(pw,ys,0.6,1.2),x,ys/2,fz); bin.add(M.trim,TK.boxG(pw+0.16,0.22,0.72,1.0),x,ys,fz); bin.add(M.trim,TK.boxG(pw+0.12,0.4,0.7,1.0),x,0.2,fz); }
      const sp=new THREE.ExtrudeGeometry(spandrel(bw,ys,gfh,r),{depth:0.6,bevelEnabled:false,curveSegments:8}); { const uv=sp.attributes.uv; for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)/1.2,uv.getY(k)/1.2); }
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5); bin.add(M.wall,sp.clone(),x,0,fz-0.3); }
      // 拱圈石材收邊（拱頂一圈）
      const ring=new THREE.Shape(); ring.absarc(0,0,r+0.14,0,Math.PI,false); ring.lineTo(-r,0); ring.absarc(0,0,r,Math.PI,0,true); ring.lineTo(r+0.14,0);
      const ringG=new THREE.ExtrudeGeometry(ring,{depth:0.08,bevelEnabled:false,curveSegments:8});
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5); bin.add(M.trim,ringG.clone(),x,ys,fz+0.3); }
      sp.dispose(); ringG.dispose();
      bin.add(M.ceil,TK.boxG(w,0.1,ad-0.6,1),0,gfh-0.25,d/2-0.6-(ad-0.6)/2,0,{noShadow:true}); // 天花板只到拱圈背面（和拱圈正面同一平面會閃爍）
      bin.add(M.trim,TK.boxG(w,0.06,ad+0.2,1),0,0.03,d/2-ad/2);
      // 廊內的門與窗（背牆）
      const iw=windowParts(Math.min(1.4,bw*0.4),rw?2.2:2.5,0.12,rw);
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5); const center=Math.abs(i-(nb-1)/2)<0.6;
        if(center){ bin.add(M.door,TK.boxG(1.8,2.9,0.08),x,1.45,d/2-ad+0.04); bin.add(M.trim,TK.boxG(2.2,0.2,0.16),x,3.0,d/2-ad+0.08); }
        else addWindow(bin,M,iw,x,0.9,d/2-ad+0.01,0); } }
    // 屋頂
    if(o.roofType==='flat'){ bin.add(M.trim,TK.boxG(w+0.2,0.9,0.3,1.0),0,H+0.95,d/2-0.05); bin.add(M.trim,TK.boxG(w+0.2,0.9,0.3,1.0),0,H+0.95,-d/2+0.05); bin.add(M.trim,TK.boxG(0.3,0.9,d,1.0),w/2-0.05,H+0.95,0); bin.add(M.trim,TK.boxG(0.3,0.9,d,1.0),-w/2+0.05,H+0.95,0); bin.add(M.dark,TK.boxG(w-0.4,0.1,d-0.4),0,H+0.55,0,0,{noShadow:true}); }
    else { const rh=o.roofH||Math.min(5,d*0.28); const rg=hipRoof(w+1.6,d+1.6,rh); bin.add(M.roof,rg,0,H+0.5,0); const ridge=Math.max(0.5,w-d); bin.add(TK.col('#3b2c26'),TK.boxG(ridge+0.3,0.22,0.32),0,H+0.5+rh,0); }
    // 中央入口門廊：往前突出、三連拱（較高）、上面是陽台欄杆或山牆
    if(o.porch){ const pb=o.porch.bays||3, pd=o.porch.depth||3.2, pwid=arc?pb*bw:Math.min(w*0.4,pb*bw), ph=o.porch.h||gfh+0.6, z0=d/2, pbw=pwid/pb, pw=0.9, r=(pbw-pw)/2, ys=Math.min(ph-r-0.6,o.porch.ys||3.2);
      for(let i=1;i<pb;i++){ const x=-pwid/2+pbw*i; bin.add(M.trim,TK.boxG(pw,ys,0.9,1.0),x,ys/2,z0+pd-0.45); if(!arc) bin.add(M.trim,TK.boxG(pw,ys,0.9,1.0),x,ys/2,z0+0.2); } // 兩端由側牆代替（重疊的面會閃爍）；有拱廊時後排由拱廊的柱子撐（不擋住門廊通到拱廊的路）
      const sp=new THREE.ExtrudeGeometry(spandrel(pbw,ys,ph,r),{depth:0.9,bevelEnabled:false,curveSegments:12}); { const uv=sp.attributes.uv; for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)/1.0,uv.getY(k)/1.0); }
      for(let i=0;i<pb;i++){ const x=-pwid/2+pbw*(i+0.5); bin.add(M.trim,sp.clone(),x,0,z0+pd-0.9); }
      sp.dispose();
      for(const sx of [-1,1]) bin.add(M.trim,TK.boxG(0.9,ph,pd,1.0),sx*(pwid/2+0.0),ph/2,z0+pd/2);
      blocks.push([-pwid/2,z0+pd/2,0.9,pd,0.15],[pwid/2,z0+pd/2,0.9,pd,0.15]); for(let i=1;i<pb;i++) blocks.push([-pwid/2+pbw*i,z0+pd-0.45,pw,0.9,0.15]);
      bin.add(M.trim,TK.boxG(pwid+1.2,0.45,pd+0.3,1.0),0,ph+0.22,z0+pd/2);
      bin.add(M.ceil,TK.boxG(pwid,0.1,pd-0.9,1),0,ph-0.1,z0+(pd-0.9)/2,0,{noShadow:true});
      bin.add(M.trim,TK.boxG(pwid+0.6,0.08,pd+1.2,1.0),0,0.04,z0+pd/2+0.3);
      if(o.porch.style==='flat'){ /* 平頂門廊：頂板上再一道細的石材線 */ bin.add(M.trim,TK.boxG(pwid+1.3,0.12,pd+0.4,1.0),0,ph+0.5,z0+pd/2); }
      else if(o.porch.pediment){ const sh=new THREE.Shape(); const hw=pwid/2+0.6; sh.moveTo(-hw,0); sh.lineTo(hw,0); sh.lineTo(0,o.porch.pedH||2.0); sh.lineTo(-hw,0); const ped=new THREE.ExtrudeGeometry(sh,{depth:pd+0.3,bevelEnabled:false}); { const uv=ped.attributes.uv; for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)/1.0,uv.getY(k)/1.0); } bin.add(M.trim,ped,0,ph+0.45,z0); }
      else { for(let i=0;i<=Math.round(pwid/0.5);i++){ const x=-pwid/2+i*pwid/Math.round(pwid/0.5); bin.add(M.trim,TK.boxG(0.12,0.75,0.12),x,ph+0.45+0.37,z0+pd-0.1); } bin.add(M.trim,TK.boxG(pwid+0.3,0.12,0.22,1.0),0,ph+0.45+0.8,z0+pd-0.1); }
      if(o.sign){ const st=TK.signTex(o.sign,{bg:o.signBg||'#d8d0c0',color:o.signColor||'#3b2a1e',serif:true,size:80}); const sm=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(pwid*0.7,o.sign.length*1.25),0.9),new THREE.MeshStandardMaterial({map:st,roughness:0.8})); sm.position.set(0,ys+r+(ph-ys-r)/2+0.05,z0+pd+0.02); g.add(sm); } }
    else if(o.sign){ const st=TK.signTex(o.sign,{bg:o.signBg||'#d8d0c0',color:o.signColor||'#3b2a1e',serif:true,size:80}); const sm=new THREE.Mesh(new THREE.PlaneGeometry(o.sign.length*1.1,0.8),new THREE.MeshStandardMaterial({map:st,roughness:0.8})); sm.position.set(0,gfh-0.45,d/2+0.32); g.add(sm); }
    // 塔樓（總圖）：中央、在正面門廊上方，四面拱窗、四坡屋頂
    if(o.tower){ const tw=o.tower.w||8, th=o.tower.h||10, tz=o.tower.z!=null?o.tower.z:d/2-tw/2-0.5, ty=H;
      bin.add(M.wall,TK.boxG(tw,th,tw,1.2),0,ty+th/2,tz); bin.add(M.trim,TK.boxG(tw+0.5,0.5,tw+0.5,1.0),0,ty+th+0.25,tz); bin.add(M.trim,TK.boxG(tw+0.3,0.25,tw+0.3,1.0),0,ty+0.6,tz);
      const twp=windowParts(1.3,3.2,0.16); for(const [ox,oz,ry] of [[0,tw/2+0.01,0],[0,-tw/2-0.01,Math.PI],[tw/2+0.01,0,Math.PI/2],[-tw/2-0.01,0,-Math.PI/2]]){ for(const k of [-1,1]){ const lx=k*tw*0.22; const c=Math.cos(ry), s=Math.sin(ry); addWindow(bin,M,twp,ox+lx*c,ty+th-4.6,tz+oz-lx*s,ry); } }
      const trg=hipRoof(tw+1.2,tw+1.2,3.2); bin.add(M.roof,trg,0,ty+th+0.5,tz); }
    bin.build(g);
    g.traverse(m=>{ if(m.isMesh){ m.castShadow=m.castShadow!==false; } });
    g.userData.ck={w,d,H,gfh,ad,blocks,doorZ:d/2-ad}; return g; }
  // ---------- 現代系館（社會科學院）----------
  // 白色粉光牆、每層一條橫向長窗（細直櫺）、樓板邊緣一道白色水平線、一樓正面是玻璃大廳＋薄雨遮、平屋頂細女兒牆。
  // 和 hall() 一樣：本地座標建築中心在原點、正面朝 +z；回傳 userData.ck（導航阻擋、鏡頭碰撞給 zones3d 的 ckPlace 用）。
  function modern(o){ const g=new THREE.Group(); const bin=new TK.Bin(); const blocks=[];
    const w=o.w, d=o.d, nf=o.floors||4, gfh=o.gfh||4.4, fh=o.fh||3.8, H=gfh+(nf-1)*fh;
    const wall=TK.M('ckModWall'+(o.wall||'#eeebe4'),()=>TK.std({map:TK.plasterTex(o.wall||'#eeebe4','ckMod'),roughness:0.9}));
    const slab=TK.col(o.slab||'#f7f5f0'), mull=TK.col('#5f656c'), dark=TK.col('#2e2a26');
    const glass=GLASS(), glassDark=GLASS_DARK();
    const lobbyD=1.2; // 一樓玻璃往內退
    bin.add(wall,TK.boxG(w,H-gfh,d,1.6),0,gfh+(H-gfh)/2,0);
    bin.add(wall,TK.boxG(w,gfh,d-lobbyD,1.6),0,gfh/2,-lobbyD/2);
    // 樓板邊緣（水平白線）、屋頂薄簷＋女兒牆
    for(let i=1;i<nf;i++){ bin.add(slab,TK.boxG(w+0.3,0.28,d+0.3,1.0),0,gfh+(i-1)*fh,0); }
    bin.add(slab,TK.boxG(w+0.3,0.28,d+0.3,1.0),0,gfh,0);
    bin.add(slab,TK.boxG(w+1.2,0.2,d+1.2,1.0),0,H+0.1,0); bin.add(slab,TK.boxG(w+0.2,0.7,0.25,1.0),0,H+0.55,d/2-0.02); bin.add(slab,TK.boxG(w+0.2,0.7,0.25,1.0),0,H+0.55,-d/2+0.02); bin.add(slab,TK.boxG(0.25,0.7,d,1.0),w/2-0.02,H+0.55,0); bin.add(slab,TK.boxG(0.25,0.7,d,1.0),-w/2+0.02,H+0.55,0); bin.add(dark,TK.boxG(w-0.4,0.05,d-0.4),0,H+0.22,0,0,{noShadow:true});
    // 長窗：每層前、後、左右；一段一段（約 1.4 m）分開，方便晚上有亮有暗
    const band=(len,y,z,ry,seg)=>{ const n=Math.max(1,Math.round(len/seg)), sw=len/n, wh=1.45; for(let k=0;k<n;k++){ const lx=-len/2+sw*(k+0.5); const c=Math.cos(ry), sn=Math.sin(ry); const px=lx*c+z*sn, pz=-lx*sn+z*c; bin.add(winLit(px,y,pz)?glass:glassDark,TK.planeG(sw-0.08,wh,[0,0,1,1]),px,y,pz,ry,{noShadow:true}); const mx=(lx+sw/2)*c+z*sn, mz=-(lx+sw/2)*sn+z*c; if(k<n-1) bin.add(mull,TK.boxG(0.07,wh,0.06),mx,y,mz,ry,{noShadow:true}); }
      const c=Math.cos(ry), sn=Math.sin(ry); bin.add(mull,TK.boxG(len,0.07,0.08),z*sn,y-wh/2,z*c,ry,{noShadow:true}); bin.add(mull,TK.boxG(len,0.07,0.08),z*sn,y+wh/2,z*c,ry,{noShadow:true}); };
    for(let f=1;f<nf;f++){ const y=gfh+(f-1)*fh+0.95+0.72; band(w-1.6,y,d/2+0.01,0,1.4); band(w-1.6,y,d/2+0.01,Math.PI,1.4); band(d-1.6,y,w/2+0.01,Math.PI/2,1.4); band(d-1.6,y,w/2+0.01,-Math.PI/2,1.4); }
    // 一樓玻璃大廳（正面）：整片玻璃＋直櫺；入口在中間：門框＋薄雨遮
    const gz=d/2-lobbyD+0.02, lw=w-0.6; { const n=Math.round(lw/1.5), sw=lw/n; for(let k=0;k<n;k++){ const x=-lw/2+sw*(k+0.5); bin.add(winLit(x,1.8,gz)?glass:glassDark,TK.planeG(sw-0.06,gfh-0.5,[0,0,1,1]),x,(gfh-0.5)/2+0.1,gz,0,{noShadow:true}); if(k<n-1) bin.add(mull,TK.boxG(0.08,gfh-0.4,0.08),x+sw/2,(gfh-0.4)/2+0.1,gz+0.02,0,{noShadow:true}); } }
    bin.add(slab,TK.boxG(w,0.1,lobbyD+0.2,1.0),0,0.05,d/2-lobbyD/2);
    bin.add(dark,TK.boxG(2.6,2.8,0.06),0,1.4,gz+0.03,0,{noShadow:true}); bin.add(slab,TK.boxG(6.0,0.18,2.6,1.0),0,3.4,d/2+1.0); // 入口雨遮
    // 一樓兩端的實牆（玻璃大廳兩側收邊）
    for(const sx of [-1,1]) bin.add(wall,TK.boxG(0.6,gfh,lobbyD,1.6),sx*(w/2-0.3),gfh/2,d/2-lobbyD/2);
    blocks.push([0,0,w,d,0.3]);
    if(o.sign){ const st=TK.signTex(o.sign,{bg:o.signBg||'#f7f5f0',color:o.signColor||'#3b3b3b',size:72}); const sm=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(8,o.sign.length*1.1),0.8),new THREE.MeshStandardMaterial({map:st,roughness:0.8})); sm.position.set(0,gfh+0.55,d/2+0.16); g.add(sm); }
    bin.build(g);
    g.traverse(m=>{ if(m.isMesh){ m.castShadow=m.castShadow!==false; } });
    g.userData.ck={w,d,H,gfh,ad:0,blocks,doorZ:d/2}; return g; }
  // ---------- 洞洞館（農業陳列館）：上層四面是一格一格圓洞的鏤空牆，一樓玻璃＋方柱，平屋頂寬屋簷；晚上圓洞透出暖光 ----------
  function holeTex(){ return TK.tex('ckHoles',256,256,(x,w,h)=>{ x.fillStyle='#e7e4d6'; x.fillRect(0,0,w,h); const n=6, cs=w/n; for(let j=0;j<n;j++) for(let i=0;i<n;i++){ const cx=(i+0.5)*cs, cy=(j+0.5)*cs; x.fillStyle='rgba(0,0,0,0.10)'; x.beginPath(); x.arc(cx+2,cy+3,cs*0.33,0,7); x.fill(); x.fillStyle='#2d3133'; x.beginPath(); x.arc(cx,cy,cs*0.3,0,7); x.fill(); } }); }
  function holeEmit(){ return TK.tex('ckHolesE',256,256,(x,w,h)=>{ x.fillStyle='#000'; x.fillRect(0,0,w,h); const n=6, cs=w/n; for(let j=0;j<n;j++) for(let i=0;i<n;i++){ if(((i*7+j*3)%5)===0) continue; x.fillStyle='#ffc888'; x.beginPath(); x.arc((i+0.5)*cs,(j+0.5)*cs,cs*0.3,0,7); x.fill(); } }); }
  function pavilion(o){ const g=new THREE.Group(); const bin=new TK.Bin(); const blocks=[];
    const w=o.w, d=o.d, gfh=o.gfh||4.0, H=o.h||9, inset=0.6;
    const wall=TK.M('ckPavWall',()=>TK.std({map:TK.plasterTex('#ece8dc','ckPav'),roughness:0.9}));
    const screen=TK.glowMat('ckHoleScreen',holeTex(),{nightI:0.8,emap:holeEmit(),mat:{roughness:0.85}});
    const slab=TK.col('#f2efe6'), colM=TK.col('#dcd6c8'), dark=TK.col('#2e2a26'), glass=GLASS(), glassDark=GLASS_DARK();
    // 一樓：往內退的玻璃（前後）＋實牆（左右）＋方柱
    bin.add(wall,TK.boxG(w-2*inset,gfh,d-2*inset,1.6),0,gfh/2,0);
    const gw=w-2*inset-0.4; { const n=Math.round(gw/1.6), sw=gw/n; for(const zs of [1,-1]) for(let k=0;k<n;k++){ const x=-gw/2+sw*(k+0.5); bin.add(winLit(x,1.5,zs)?glass:glassDark,TK.planeG(sw-0.08,gfh-0.6,[0,0,1,1]),x,(gfh-0.6)/2+0.15,zs*(d/2-inset+0.02),zs>0?0:Math.PI,{noShadow:true}); } }
    const nc=Math.max(3,Math.round(w/4)); for(let i=0;i<=nc;i++){ const x=-w/2+0.3+(w-0.6)*i/nc; for(const zs of [1,-1]) bin.add(colM,TK.boxG(0.5,gfh,0.5,1.0),x,gfh/2,zs*(d/2-0.3)); }
    for(const xs of [1,-1]) for(const zz of [-d/2+0.3+ (d-0.6)/2]) bin.add(colM,TK.boxG(0.5,gfh,0.5,1.0),xs*(w/2-0.3),gfh/2,zz);
    // 二樓：牆＋外面一圈鏤空洞洞牆
    bin.add(wall,TK.boxG(w-2*inset,H-gfh,d-2*inset,1.6),0,gfh+(H-gfh)/2,0);
    const sh=H-gfh-0.4, tile=2.4; // 一張貼圖 6×6 個洞＝2.4 m：洞的間距 0.4 m、直徑約 0.24 m
    for(const [len,px,pz,ry] of [[w,0,d/2,0],[w,0,-d/2,Math.PI],[d,w/2,0,Math.PI/2],[d,-w/2,0,-Math.PI/2]]){ bin.add(screen,TK.boxG(len,sh,0.12,tile),px,gfh+0.2+sh/2,pz,ry); }
    bin.add(slab,TK.boxG(w+0.3,0.35,d+0.3,1.0),0,gfh,0);
    bin.add(slab,TK.boxG(w+2.2,0.4,d+2.2,1.0),0,H+0.2,0); bin.add(dark,TK.boxG(w-0.6,0.05,d-0.6),0,H+0.42,0,0,{noShadow:true});
    // 入口：正面中間的門＋台階
    bin.add(dark,TK.boxG(2.2,2.8,0.06),0,1.4,d/2-inset+0.05,0,{noShadow:true}); bin.add(slab,TK.boxG(4.0,0.15,1.6,1.0),0,0.075,d/2+0.2);
    blocks.push([0,0,w,d,0.3]);
    if(o.sign){ const st=TK.signTex(o.sign,{bg:'#f2efe6',color:'#3b3b3b',size:72}); const sm=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(6,o.sign.length*1.0),0.7),new THREE.MeshStandardMaterial({map:st,roughness:0.8})); sm.position.set(0,gfh-0.65,d/2-inset+0.08); g.add(sm); }
    bin.build(g);
    g.traverse(m=>{ if(m.isMesh){ m.castShadow=m.castShadow!==false; } });
    g.userData.ck={w,d,H,gfh,ad:0,blocks,doorZ:d/2}; return g; }
  // ---------- 校門（v9.3 第十四批）：面磚門柱（石材柱基、柱頭、門燈）、往內打開的鑄鐵門、兩側矮牆（石材壓頂）、門房；校名刻在石牌上（校外、校內各一面）----------
  /* 取代 W3.gate（磚盒子＋飄在兩根柱子中間的校名板，門房還放在校外）。本地座標：門口中心在原點，+z 是校外、-z 是校內；開口 x ∈ [-4.2, 4.2]（和舊版一樣寬）。
     g.userData.gate.blocks：[x,z,w,d,pad]（本地座標），區域放好之後轉成導航阻擋。不是照真實台大校門建模。 */
  function gate(o){ o=o||{}; const g=new THREE.Group(); const bin=new TK.Bin(); const blocks=[];
    const wall=wallMat(o.wall||'#a8604a'), trim=trimMat(o.trim||'#d8cfbd'), roof=roofMat(o.roof||'#43342e'), iron=TK.col('#1f2124',{roughness:0.5,metalness:0.6});
    const PW=1.4, PH=4.0, PX=4.9;
    for(const sx of [-1,1]){ const x=sx*PX;
      bin.add(trim,TK.boxG(PW+0.24,0.6,PW+0.24,1.2),x,0.3,0); bin.add(wall,TK.boxG(PW,PH-0.6,PW,1.2),x,0.6+(PH-0.6)/2,0);
      bin.add(trim,TK.boxG(PW+0.3,0.22,PW+0.3,1.2),x,PH+0.11,0); bin.add(trim,TK.boxG(PW+0.1,0.16,PW+0.1,1.2),x,PH+0.3,0);
      bin.add(trim,TK.boxG(0.5,0.22,0.5,1.2),x,PH+0.49,0);   // 門燈的座
      bin.add(TK.glowMat('ckGateLamp',TK.tex('ckGateLampT',32,32,(c,w,h)=>{ c.fillStyle='#f3e6c8'; c.fillRect(0,0,w,h); c.fillStyle='#2a2c2f'; c.fillRect(0,0,w,3); c.fillRect(0,h-3,w,3); c.fillRect(0,0,3,h); c.fillRect(w-3,0,3,h); c.fillRect(w/2-1,0,2,h); },false),{nightI:1.1,dayI:0.05}),TK.boxG(0.38,0.5,0.38),x,PH+0.85,0,0,{noShadow:true});
      bin.add(iron,TK.boxG(0.46,0.06,0.46),x,PH+1.13,0,0,{noShadow:true});
      blocks.push([x,0,PW+0.24,PW+0.24,0.15]);
      // 兩側矮牆（門柱到 |x|=10，接上區域原本的圍牆；比圍牆高 10 cm，壓頂不和圍牆頂面重疊）
      const wx0=PX+PW/2, wx1=10.0, wl=wx1-wx0, wc=sx*(wx0+wl/2); bin.add(trim,TK.boxG(wl,0.4,0.7,1.2),wc,0.2,0); bin.add(wall,TK.boxG(wl,1.5,0.6,1.2),wc,0.4+0.75,0); bin.add(trim,TK.boxG(wl+0.06,0.12,0.74,1.2),wc,1.96,0);
      blocks.push([wc,0,wl,0.74,0.15]);
      // 鑄鐵門：一邊一扇（2 m），往校內打開、靠在門柱內側
      const lx=sx*(PX-PW/2-0.08), L=2.0, Hh=2.3;
      for(const y of [0.12,Hh*0.55,Hh]) bin.add(iron,TK.boxG(0.06,0.06,L),lx,y,-L/2,0,{noShadow:true});
      for(let k=0;k<=10;k++){ const z=-0.05-(L-0.1)*k/10; bin.add(iron,TK.boxG(0.035,Hh+(k%2?0.12:0.22),0.035),lx,(Hh+(k%2?0.12:0.22))/2,z,0,{noShadow:true}); }
      blocks.push([lx,-L/2,0.2,L,0.05]); }
    // 校名石牌（校外一面在 +x 的矮牆、校內一面在 -x 的矮牆）
    const nameT=TK.signTex(o.name||'國立臺灣大學',{bg:'#e6e0d2',color:'#3a2f28',serif:true,size:84});
    for(const [sx,zs] of [[1,1],[-1,-1]]){ const x=sx*7.8; bin.add(trim,TK.boxG(3.1,0.95,0.12,1.2),x,1.25,zs*0.36); const pl=new THREE.Mesh(new THREE.PlaneGeometry(2.9,0.75),new THREE.MeshStandardMaterial({map:nameT,roughness:0.8})); pl.position.set(x,1.25,zs*0.425); if(zs<0) pl.rotation.y=Math.PI; g.add(pl); }
    // 門房：校內、開口旁邊（面磚、石材腰帶、四坡瓦屋頂、面向通道的窗、校內一側的門）
    { const hx=7.6, hz=-3.4, W=3.6, D=3.0, H=2.8;
      bin.add(trim,TK.boxG(W+0.1,0.45,D+0.1,1.2),hx,0.225,hz); bin.add(wall,TK.boxG(W,H-0.45,D,1.2),hx,0.45+(H-0.45)/2,hz); bin.add(trim,TK.boxG(W+0.16,0.14,D+0.16,1.2),hx,H+0.07,hz);
      const rf=new THREE.ConeGeometry(Math.hypot(W,D)/2+0.55,1.35,4,1); rf.rotateY(Math.PI/4); rf.scale(1,1,(D+0.8)/(W+0.8)); bin.add(roof,rf,hx,H+0.14+0.675,hz);
      const glass=GLASS(); bin.add(glass,TK.planeG(1.5,1.0),hx-W/2-0.01,1.65,hz+0.2,-Math.PI/2,{noShadow:true}); bin.add(trim,TK.boxG(0.12,1.16,1.66,1.2),hx-W/2-0.02,1.65,hz+0.2,0,{noShadow:true});
      bin.add(glass,TK.planeG(1.2,0.9),hx+0.5,1.7,hz+D/2+0.01,0,{noShadow:true});
      bin.add(TK.col('#4a3426',{roughness:0.7}),TK.planeG(0.9,2.0),hx-0.6,1.0+0.45,hz-D/2-0.01,Math.PI,{noShadow:true});
      blocks.push([hx,hz,W+0.2,D+0.2,0.15]); }
    bin.build(g); g.traverse(m=>{ if(m.isMesh) m.castShadow=m.castShadow!==false; });
    g.userData.gate={blocks}; return g; }
  // 傅鐘（v9.3 第十六批）：原本是 LEVEL_BLOCKOUT 的小鐘亭（圓台、四根細圓柱、綠色四角錐）。改成校園套件同一套語彙的鐘亭：
  // 兩層石材台基、四根方柱（柱礎、柱頭）、四面的梁、四坡瓦屋頂＋屋簷封板＋寶頂、梁下木橫梁吊著銅鐘、正面的石碑。
  // 不是照真實傅鐘建模，只是概略的樣子。+z 是正面（石碑那一側）。blocks＝導航阻擋（區域座標換算見 zones3d 的 placeGate）
  function bell(o){ o=o||{}; const g=new THREE.Group(); const bin=new TK.Bin(); const blocks=[];
    const trim=trimMat(o.trim||'#d8cfbd'), colm=trimMat(o.col||'#ebe5d8'), roof=roofMat(o.roof||'#3f4842'), wood=TK.col('#4a3426',{roughness:0.7}), bronze=TK.col('#6b6a4c',{roughness:0.5,metalness:0.2,side:THREE.DoubleSide});
    bin.add(trim,TK.boxG(4.8,0.2,4.8,1.2),0,0.1,0); bin.add(trim,TK.boxG(4.0,0.2,4.0,1.2),0,0.3,0);
    const F=0.4, C=1.3, CW=0.34, CH=2.9;
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const x=sx*C, z=sz*C;
      bin.add(trim,TK.boxG(CW+0.14,0.14,CW+0.14,1.2),x,F+0.07,z); bin.add(colm,TK.boxG(CW,CH,CW,1.2),x,F+0.14+CH/2,z); bin.add(trim,TK.boxG(CW+0.16,0.14,CW+0.16,1.2),x,F+0.14+CH+0.07,z); }
    const BT=F+0.14+CH+0.14, BL=2*C+CW+0.2;
    for(const s of [-1,1]){ bin.add(trim,TK.boxG(BL,0.34,0.4,1.2),0,BT+0.17,s*C); bin.add(trim,TK.boxG(0.4,0.34,BL-0.8,1.2),s*C,BT+0.17,0); }
    // 屋頂：屋簷封板＋四坡瓦＋寶頂
    const RW=4.5, RH=1.3, RY=BT+0.34; bin.add(TK.col('#3b2f2a',{roughness:0.8}),TK.boxG(RW,0.12,RW),0,RY+0.06,0); bin.add(roof,hipRoof(RW+0.1,RW+0.1,RH),0,RY+0.12,0);
    bin.add(trim,TK.boxG(0.3,0.16,0.3,1.2),0,RY+0.12+RH+0.02,0); bin.add(bronze,new THREE.SphereGeometry(0.13,12,8),0,RY+0.12+RH+0.2,0);
    // 吊鐘：木橫梁、吊環、銅鐘（外擴的鐘口、裡面看得到鐘舌）
    bin.add(wood,TK.boxG(2*C,0.24,0.26),0,BT-0.07,0); const by=BT-0.19;
    bin.add(bronze,new THREE.TorusGeometry(0.07,0.025,6,12),0,by-0.06,0);
    const prof=[[0.001,0.62],[0.2,0.58],[0.33,0.36],[0.4,0.12],[0.44,0.0],[0.475,0.02],[0.47,0.07],[0.41,0.17],[0.335,0.38],[0.305,0.58],[0.29,0.76],[0.25,0.88],[0.15,0.95],[0.001,0.97]].map(([x,y])=>new THREE.Vector2(x,y));
    const bh=0.97; bin.add(bronze,new THREE.LatheGeometry(prof,20),0,by-0.12-bh,0); bin.add(bronze,new THREE.SphereGeometry(0.08,10,8),0,by-0.12-bh+0.12,0);
    // 正面石碑
    const st=TK.signTex(o.name||'傅鐘',{bg:'#e3dccd',color:'#3a2f28',serif:true,size:96}); bin.add(trim,TK.boxG(1.5,0.86,0.28,1.2),0,0.43,3.05); bin.add(trim,TK.boxG(1.62,0.1,0.36,1.2),0,0.9,3.05);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.36,0.34),new THREE.MeshStandardMaterial({map:st,roughness:0.85})); pl.position.set(0,0.52,3.196); g.add(pl);   /* 招牌貼圖是 4:1 */
    // 夜間投光：前面兩根柱子腳下的地燈（燈罩玻璃晚上亮）＋柱面一道由下往上淡出的暖光（加法混合的黑色面：白天看不到，晚上只有自發光）
    { const lampT=TK.tex('ckBellUpT',16,16,(c,w,h)=>{ c.fillStyle='#fff1d6'; c.fillRect(0,0,w,h); },false); const lens=TK.glowMat('ckBellUp',lampT,{nightI:1.6,dayI:0});
      const washT=TK.tex('ckWashK',8,8,(c,w,h)=>{ c.fillStyle='#000'; c.fillRect(0,0,w,h); },false), washE=TK.tex('ckWashE',8,64,(c,w,h)=>{ const gr=c.createLinearGradient(0,h,0,0); gr.addColorStop(0,'#ffd7a0'); gr.addColorStop(0.55,'#7a5a38'); gr.addColorStop(1,'#000000'); c.fillStyle=gr; c.fillRect(0,0,w,h); },false);
      const wash=TK.glowMat('ckBellWash',washT,{emap:washE,nightI:0.75,dayI:0,mat:{transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,roughness:1}});
      for(const sx of [-1,1]){ bin.add(TK.col('#2a2c2f',{roughness:0.5}),TK.boxG(0.18,0.07,0.14),sx*C,F+0.035,C+0.42,0,{noShadow:true}); bin.add(lens,TK.planeG(0.14,0.1),sx*C,F+0.072,C+0.42,0,{rx:-Math.PI/2,noShadow:true});
        bin.add(wash,TK.planeG(CW+0.04,CH),sx*C,F+0.14+CH/2,C+CW/2+0.012,0,{noShadow:true}); const sp=TK.glowSprite('rgba(255,214,160,1)',0.7,0,0.55); sp.position.set(sx*C,F+0.14,C+0.42); g.add(sp); } }
    blocks.push([0,0,4.8,4.8,0.15],[0,3.05,1.62,0.36,0.1]);
    bin.build(g); g.traverse(m=>{ if(m.isMesh) m.castShadow=m.castShadow!==false; });
    g.userData.gate={blocks}; return g; }
  function setNight(on){ TK.setNight(on?1:0); }
  return {hall,modern,pavilion,gate,bell,setNight,tileTex};
})();
