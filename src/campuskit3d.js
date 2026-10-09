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
  // ---------- 幾何零件 ----------
  // 拱形（矩形＋半圓頂），底邊在 y=0
  function archShape(w,h,cx,cy){ cx=cx||0; cy=cy||0; const r=w/2, s=new THREE.Shape(); s.moveTo(cx-r,cy); s.lineTo(cx-r,cy+h-r); s.absarc(cx,cy+h-r,r,Math.PI,0,true); s.lineTo(cx+r,cy); s.lineTo(cx-r,cy); return s; }
  function archPath(w,h,cx,cy){ const r=w/2, p=new THREE.Path(); p.moveTo(cx-r,cy); p.lineTo(cx+r,cy); p.lineTo(cx+r,cy+h-r); p.absarc(cx,cy+h-r,r,0,Math.PI,false); p.lineTo(cx-r,cy); return p; }
  // 拱窗：石材窗框（環狀擠出）＋玻璃＋窗台＋中間直櫺與橫櫺；回傳要加進 Bin 的零件（本地座標，窗的正面朝 +z）
  const winCache={};
  function windowParts(w,h,f){ const key=w+'_'+h+'_'+f; if(winCache[key]) return winCache[key];
    const ring=archShape(w+2*f,h+f); ring.holes.push(archPath(w,h,0,0));
    const frame=new THREE.ExtrudeGeometry(ring,{depth:0.12,bevelEnabled:false,curveSegments:10});
    const glass=new THREE.ShapeGeometry(archShape(w,h),10); { const uv=glass.attributes.uv, p=glass.attributes.position; for(let i=0;i<uv.count;i++) uv.setXY(i,(p.getX(i)+w/2)/w,p.getY(i)/h); }
    const sill=TK.boxG(w+2*f+0.18,0.1,0.26);
    const mull=TK.boxG(0.06,h-0.1,0.05), tran=TK.boxG(w,0.06,0.05);
    return (winCache[key]={frame,glass,sill,mull,tran,w,h,f}); }
  function addWindow(bin,M,wp,x,y,z,ry){ const c=Math.cos(ry), s=Math.sin(ry); const at=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];
    let p=at(0,0,-0.02); bin.add(M.trim,wp.frame.clone(),p[0],p[1],p[2],ry);
    p=at(0,0,0.02); bin.add(M.glass,wp.glass.clone(),p[0],p[1],p[2],ry,{noShadow:true});
    p=at(0,-0.05,0.1); bin.add(M.trim,wp.sill.clone(),p[0],p[1],p[2],ry);
    p=at(0,(wp.h-0.1)/2,0.05); bin.add(M.frameDark,wp.mull.clone(),p[0],p[1],p[2],ry,{noShadow:true});
    p=at(0,wp.h-wp.w/2,0.05); bin.add(M.frameDark,wp.tran.clone(),p[0],p[1],p[2],ry,{noShadow:true}); }
  // 寄棟屋頂（四坡）：W×D 的範圍、屋脊高 Hr
  function hipRoof(W,D,Hr){ const r=(W-D)/2>0?(W-D)/2:0; const hw=W/2, hd=D/2; const P=[]; const UV=[];
    const tri=(a,b,c)=>{ P.push(...a,...b,...c); for(const v of [a,b,c]) UV.push(v[0]/2.4,(v[1]+Math.abs(v[2]))/1.8); };
    const A=[-hw,0,hd], B=[hw,0,hd], C=[hw,0,-hd], Dd=[-hw,0,-hd], R1=[-r,Hr,0], R2=[r,Hr,0];
    tri(A,B,R2); tri(A,R2,R1); tri(C,Dd,R1); tri(C,R1,R2); tri(B,C,R2); tri(Dd,A,R1);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); g.computeVertexNormals(); return g; }
  // 拱廊的拱圈牆（一個開間）：bw 寬、從 ys（起拱線）到 top，挖掉半徑 r 的半圓
  function spandrel(bw,ys,top,r){ const s=new THREE.Shape(); s.moveTo(-bw/2,ys); s.lineTo(-r,ys); s.absarc(0,ys,r,Math.PI,0,true); s.lineTo(bw/2,ys); s.lineTo(bw/2,top); s.lineTo(-bw/2,top); s.lineTo(-bw/2,ys); return s; }
  // ---------- 建築 ----------
  // o: {w,d,floors,gfh,fh,bay,wall,trim,roof,roofH,arcade,arcDepth,porch:{bays,depth,pediment},tower:{w,h},sign,signColor,winW}
  function hall(o){ const g=new THREE.Group(); const bin=new TK.Bin(); const blocks=[];
    const w=o.w, d=o.d, nf=o.floors||2, gfh=o.gfh||4.6, fh=o.fh||4.0, H=gfh+(nf-1)*fh, bayT=o.bay||3.8;
    const M={wall:wallMat(o.wall||'#a8664a'), trim:trimMat(o.trim||'#d8d0c0'), roof:roofMat(o.roof||'#4f3a32'), glass:GLASS(), frameDark:TK.col('#3a2e28'), ceil:TK.col(o.ceilCol||'#cfc6b6'), dark:TK.col('#2e2a26'), door:TK.col('#4a3426')};
    const arc=o.arcade!==false, ad=arc?(o.arcDepth||2.6):0;
    const nb=Math.max(3,Math.round(w/bayT)), bw=w/nb; // 正面開間
    const nbs=Math.max(2,Math.round(d/bayT)), bws=d/nbs; // 側面開間
    // 主體：上面幾層是完整的盒子；一樓有拱廊時正面往內縮 ad
    bin.add(M.wall,TK.boxG(w,H-gfh,d,1.2),0,gfh+(H-gfh)/2,0);
    bin.add(M.wall,TK.boxG(w,gfh,d-ad,1.2),0,gfh/2,-ad/2);
    // 勒腳（石材基座）、樓層腰帶、簷口
    bin.add(M.trim,TK.boxG(w+0.16,0.7,d-ad+0.16,1.0),0,0.35,-ad/2);
    for(let i=1;i<nf;i++){ const y=gfh+(i-1)*fh; bin.add(M.trim,TK.boxG(w+0.24,0.22,d+0.24,1.0),0,y,0); }
    bin.add(M.trim,TK.boxG(w+0.7,0.5,d+0.7,1.0),0,H+0.25,0); bin.add(M.trim,TK.boxG(w+0.4,0.25,d+0.4,1.0),0,H-0.08,0);
    // 窗：上面各層四面都有拱窗；一樓背面、側面也有
    const ww=Math.min(o.winW||1.5,bw*0.48), wh=Math.min(fh*0.62,2.7), wpU=windowParts(ww,wh,0.16);
    const wwS=Math.min(o.winW||1.5,bws*0.48), wpS=windowParts(wwS,wh,0.16);
    const sillY=(fl)=> (fl===0?1.2:gfh+(fl-1)*fh+0.75);
    for(let fl=0;fl<nf;fl++){ const y=sillY(fl);
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5);
        if(fl>0) addWindow(bin,M,wpU,x,y,d/2+0.01,0); // 正面（一樓是拱廊）
        if(fl>0||!o.backArcade) addWindow(bin,M,wpU,x,y,-d/2-0.01,Math.PI); }
      for(let j=0;j<nbs;j++){ const z=-d/2+bws*(j+0.5); if(fl===0&&z>d/2-ad-0.8) continue; addWindow(bin,M,wpS,w/2+0.01,y,z,Math.PI/2); addWindow(bin,M,wpS,-w/2-0.01,y,z,-Math.PI/2); } }
    // 一樓拱廊：柱墩＋拱圈＋天花板＋地坪＋裡面的門窗
    if(arc){ const pw=Math.max(0.7,bw*0.22), r=(bw-pw)/2, ys=Math.min(gfh-r-0.5,2.6), fz=d/2-0.3;
      for(let i=0;i<=nb;i++){ const x=-w/2+bw*i; bin.add(M.wall,TK.boxG(pw,ys,0.6,1.2),x,ys/2,fz); bin.add(M.trim,TK.boxG(pw+0.16,0.22,0.72,1.0),x,ys,fz); bin.add(M.trim,TK.boxG(pw+0.12,0.4,0.7,1.0),x,0.2,fz); }
      const sp=new THREE.ExtrudeGeometry(spandrel(bw,ys,gfh,r),{depth:0.6,bevelEnabled:false,curveSegments:12}); { const uv=sp.attributes.uv; for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)/1.2,uv.getY(k)/1.2); }
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5); bin.add(M.wall,sp.clone(),x,0,fz-0.3); }
      // 拱圈石材收邊（拱頂一圈）
      const ring=new THREE.Shape(); ring.absarc(0,0,r+0.14,0,Math.PI,false); ring.lineTo(-r,0); ring.absarc(0,0,r,Math.PI,0,true); ring.lineTo(r+0.14,0);
      const ringG=new THREE.ExtrudeGeometry(ring,{depth:0.08,bevelEnabled:false,curveSegments:12});
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5); bin.add(M.trim,ringG.clone(),x,ys,fz+0.3); }
      sp.dispose(); ringG.dispose();
      bin.add(M.ceil,TK.boxG(w,0.1,ad-0.6,1),0,gfh-0.25,d/2-0.6-(ad-0.6)/2,0,{noShadow:true}); // 天花板只到拱圈背面（和拱圈正面同一平面會閃爍）
      bin.add(M.trim,TK.boxG(w,0.06,ad+0.2,1),0,0.03,d/2-ad/2);
      // 廊內的門與窗（背牆）
      const iw=windowParts(Math.min(1.4,bw*0.4),2.5,0.12);
      for(let i=0;i<nb;i++){ const x=-w/2+bw*(i+0.5); const center=Math.abs(i-(nb-1)/2)<0.6;
        if(center){ bin.add(M.door,TK.boxG(1.8,2.9,0.08),x,1.45,d/2-ad+0.04); bin.add(M.trim,TK.boxG(2.2,0.2,0.16),x,3.0,d/2-ad+0.08); }
        else addWindow(bin,M,iw,x,0.9,d/2-ad+0.01,0); } }
    // 屋頂
    if(o.roofType==='flat'){ bin.add(M.trim,TK.boxG(w+0.2,0.9,0.3,1.0),0,H+0.95,d/2-0.05); bin.add(M.trim,TK.boxG(w+0.2,0.9,0.3,1.0),0,H+0.95,-d/2+0.05); bin.add(M.trim,TK.boxG(0.3,0.9,d,1.0),w/2-0.05,H+0.95,0); bin.add(M.trim,TK.boxG(0.3,0.9,d,1.0),-w/2+0.05,H+0.95,0); bin.add(M.dark,TK.boxG(w-0.4,0.1,d-0.4),0,H+0.55,0,0,{noShadow:true}); }
    else { const rh=o.roofH||Math.min(5,d*0.28); const rg=hipRoof(w+1.6,d+1.6,rh); bin.add(M.roof,rg,0,H+0.5,0); const ridge=Math.max(0.5,w-d); bin.add(TK.col('#3b2c26'),TK.boxG(ridge+0.3,0.22,0.32),0,H+0.5+rh,0); }
    // 中央入口門廊：往前突出、三連拱（較高）、上面是陽台欄杆或山牆
    if(o.porch){ const pb=o.porch.bays||3, pd=o.porch.depth||3.2, pwid=Math.min(w*0.4,pb*bw), ph=o.porch.h||gfh+0.6, z0=d/2, pbw=pwid/pb, pw=0.9, r=(pbw-pw)/2, ys=Math.min(ph-r-0.6,o.porch.ys||3.2);
      for(let i=1;i<pb;i++){ const x=-pwid/2+pbw*i; bin.add(M.trim,TK.boxG(pw,ys,0.9,1.0),x,ys/2,z0+pd-0.45); bin.add(M.trim,TK.boxG(pw,ys,0.9,1.0),x,ys/2,z0+0.2); } // 兩端由側牆代替（重疊的面會閃爍）
      const sp=new THREE.ExtrudeGeometry(spandrel(pbw,ys,ph,r),{depth:0.9,bevelEnabled:false,curveSegments:12}); { const uv=sp.attributes.uv; for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)/1.0,uv.getY(k)/1.0); }
      for(let i=0;i<pb;i++){ const x=-pwid/2+pbw*(i+0.5); bin.add(M.trim,sp.clone(),x,0,z0+pd-0.9); }
      sp.dispose();
      for(const sx of [-1,1]) bin.add(M.trim,TK.boxG(0.9,ph,pd,1.0),sx*(pwid/2+0.0),ph/2,z0+pd/2);
      blocks.push([-pwid/2,z0+pd/2,0.9,pd],[pwid/2,z0+pd/2,0.9,pd]); for(let i=1;i<pb;i++) blocks.push([-pwid/2+pbw*i,z0+pd-0.45,pw,0.9]);
      bin.add(M.trim,TK.boxG(pwid+1.2,0.45,pd+0.3,1.0),0,ph+0.22,z0+pd/2);
      bin.add(M.ceil,TK.boxG(pwid,0.1,pd-0.9,1),0,ph-0.1,z0+(pd-0.9)/2,0,{noShadow:true});
      bin.add(M.trim,TK.boxG(pwid+0.6,0.08,pd+1.2,1.0),0,0.04,z0+pd/2+0.3);
      if(o.porch.pediment){ const sh=new THREE.Shape(); const hw=pwid/2+0.6; sh.moveTo(-hw,0); sh.lineTo(hw,0); sh.lineTo(0,o.porch.pedH||2.0); sh.lineTo(-hw,0); const ped=new THREE.ExtrudeGeometry(sh,{depth:pd+0.3,bevelEnabled:false}); { const uv=ped.attributes.uv; for(let k=0;k<uv.count;k++) uv.setXY(k,uv.getX(k)/1.0,uv.getY(k)/1.0); } bin.add(M.trim,ped,0,ph+0.45,z0); }
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
    g.userData.ck={w,d,H,blocks}; return g; }
  function setNight(on){ TK.setNight(on?1:0); }
  return {hall,setNight,tileTex};
})();
