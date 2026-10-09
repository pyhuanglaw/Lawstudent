/* ===== 台北巷弄街景套件（TOWN KIT）：溫州街用 =====
   台北老公寓（二丁掛／馬賽克磁磚、鐵窗、冷氣室外機、陽台、雨遮、頂樓水塔與加蓋）、店面（玻璃＋室內景深卡、招牌、夜間燈光）、
   日式宿舍（黑瓦、木雨淋板、圍牆）、電線桿與電線、巷道路燈、轉角反光鏡、機車、盆栽、排水溝、路面標線。
   全部用程式產生幾何與畫布貼圖（沒有外部素材），同材質的零件合併成一個 mesh（手機 draw call 才不會爆）。
   夜間：店面與窗戶用 emissive，路燈有燈具本體＋地面光暈，少量真實點光源（數量固定，避免換燈數重編 shader）。 */
'use strict';
const TK = (function(){
  const BGU = THREE_JSM.BufferGeometryUtils;
  const texCache = {};
  function tex(key, w, h, fn, rep){ if(texCache[key]) return texCache[key]; const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); fn(x,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=rep===false?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping; t.anisotropy=4; texCache[key]=t; return t; }
  const rnd=(()=>{ let s=12345; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })();
  function shadeHex(hex, f){ const c=new THREE.Color(hex); c.multiplyScalar(f); return '#'+c.getHexString(); }

  // ---------------- 貼圖 ----------------
  // 二丁掛磁磚（227×60mm），一張貼圖＝ 1m × 1m
  function tileTex(base, grout, key){ return tex('tile_'+(key||base),256,256,(x,w,h)=>{ x.fillStyle=grout||'#b9b2a6'; x.fillRect(0,0,w,h); const tw=58, th=15; const b=new THREE.Color(base); for(let r=0;r*th<h;r++){ const off=(r%2)*tw/2; for(let c=-1;c*tw<w+tw;c++){ const v=0.9+rnd()*0.18; const col=b.clone().multiplyScalar(v); x.fillStyle='#'+col.getHexString(); x.fillRect(c*tw+off+1.5,r*th+1.5,tw-3,th-3); } } // 污漬：由上往下的水痕
      const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(60,55,50,0.0)'); g.addColorStop(1,'rgba(60,55,50,0.10)'); x.fillStyle=g; x.fillRect(0,0,w,h); }); }
  // 馬賽克小方磚（25mm）
  function mosaicTex(base, key){ return tex('mosaic_'+(key||base),256,256,(x,w,h)=>{ x.fillStyle='#d8d4cc'; x.fillRect(0,0,w,h); const s=12.8; const b=new THREE.Color(base); for(let i=0;i<20;i++) for(let j=0;j<20;j++){ const col=b.clone().multiplyScalar(0.88+rnd()*0.22); x.fillStyle='#'+col.getHexString(); x.fillRect(i*s+1,j*s+1,s-2,s-2); } }); }
  function plasterTex(base, key){ return tex('plaster_'+(key||base),256,256,(x,w,h)=>{ x.fillStyle=base; x.fillRect(0,0,w,h); for(let i=0;i<2200;i++){ x.fillStyle=rnd()<0.5?'rgba(0,0,0,0.035)':'rgba(255,255,255,0.05)'; x.fillRect(rnd()*w,rnd()*h,2+rnd()*3,2+rnd()*3); } for(let i=0;i<5;i++){ const sx=rnd()*w; const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(70,65,60,0.12)'); g.addColorStop(1,'rgba(70,65,60,0)'); x.fillStyle=g; x.fillRect(sx,0,6+rnd()*14,h*(0.3+rnd()*0.6)); } }); }
  function woodSidingTex(){ return tex('woodSiding',256,256,(x,w,h)=>{ for(let r=0;r<16;r++){ const v=0.85+rnd()*0.2; x.fillStyle='#'+new THREE.Color('#6b4a32').multiplyScalar(v).getHexString(); x.fillRect(0,r*16,w,16); x.fillStyle='rgba(0,0,0,0.35)'; x.fillRect(0,r*16+14,w,2); for(let k=0;k<6;k++){ x.fillStyle='rgba(30,20,10,0.12)'; x.fillRect(rnd()*w,r*16+2,30+rnd()*60,1); } } }); }
  function roofTileTex(){ return tex('kawara',256,256,(x,w,h)=>{ x.fillStyle='#4a4d52'; x.fillRect(0,0,w,h); for(let c=0;c<16;c++){ const g=x.createLinearGradient(c*16,0,c*16+16,0); g.addColorStop(0,'#3a3d42'); g.addColorStop(0.5,'#62666c'); g.addColorStop(1,'#33363a'); x.fillStyle=g; x.fillRect(c*16,0,16,h); } for(let r=0;r<8;r++){ x.fillStyle='rgba(0,0,0,0.35)'; x.fillRect(0,r*32+30,w,2); } }); }
  function asphaltTex(){ return tex('asphalt2',512,512,(x,w,h)=>{ x.fillStyle='#5f5d5a'; x.fillRect(0,0,w,h); for(let i=0;i<9000;i++){ const v=rnd(); x.fillStyle=v<0.5?'rgba(30,30,30,0.18)':'rgba(200,200,195,0.10)'; x.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2); } for(let i=0;i<6;i++){ x.strokeStyle='rgba(25,25,25,0.35)'; x.lineWidth=1.5; x.beginPath(); let px=rnd()*w, py=rnd()*h; x.moveTo(px,py); for(let k=0;k<8;k++){ px+=(rnd()-0.5)*60; py+=(rnd()-0.5)*60; x.lineTo(px,py); } x.stroke(); } for(let i=0;i<5;i++){ x.fillStyle='rgba(40,40,40,0.25)'; x.fillRect(rnd()*w,rnd()*h,40+rnd()*80,30+rnd()*60); } }); }
  function concreteTex(){ return tex('concrete2',256,256,(x,w,h)=>{ x.fillStyle='#a9a6a0'; x.fillRect(0,0,w,h); for(let i=0;i<3000;i++){ x.fillStyle=rnd()<0.5?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.06)'; x.fillRect(rnd()*w,rnd()*h,2,2); } x.fillStyle='rgba(0,0,0,0.25)'; x.fillRect(0,0,w,2); x.fillRect(0,0,2,h); }); }
  function sidewalkTex(base){ return tex('swalk_'+base,256,256,(x,w,h)=>{ x.fillStyle='#8f877c'; x.fillRect(0,0,w,h); const b=new THREE.Color(base); for(let r=0;r<8;r++) for(let c=0;c<4;c++){ x.fillStyle='#'+b.clone().multiplyScalar(0.88+rnd()*0.2).getHexString(); x.fillRect(c*64+(r%2)*32+1,r*32+1,62,30); } }); }
  function grateTex(){ return tex('grate',128,64,(x,w,h)=>{ x.fillStyle='#3a3936'; x.fillRect(0,0,w,h); x.fillStyle='#1d1c1a'; for(let i=4;i<w;i+=8) x.fillRect(i,6,4,h-12); x.fillStyle='#55534f'; x.fillRect(0,0,w,3); x.fillRect(0,h-3,w,3); }); }
  // 鐵窗（透明格柵）
  function grilleTex(color){ return tex('grille_'+color,128,128,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle=color; x.lineWidth=5; for(let i=8;i<w;i+=20){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,h); x.stroke(); } x.lineWidth=7; x.strokeRect(3,3,w-6,h-6); x.lineWidth=4; x.beginPath(); x.moveTo(0,h*0.5); x.lineTo(w,h*0.5); x.stroke(); x.lineWidth=2.5; for(let i=0;i<4;i++){ x.beginPath(); x.arc(w/2,h*0.5,10+i*12,Math.PI,0); x.stroke(); } }, true); }
  function railTex(){ return tex('rail',128,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#5b5f63'; x.fillRect(0,0,w,6); x.fillRect(0,h-5,w,5); for(let i=4;i<w;i+=12) x.fillRect(i,0,4,h); }); }
  function acTex(){ return tex('acunit',128,96,(x,w,h)=>{ x.fillStyle='#e9e7e2'; x.fillRect(0,0,w,h); x.fillStyle='#cfcbc4'; x.fillRect(0,h-8,w,8); const cx=w*0.38, cy=h*0.5, r=h*0.36; x.fillStyle='#3c3d3f'; x.beginPath(); x.arc(cx,cy,r,0,7); x.fill(); x.strokeStyle='#d8d5cf'; x.lineWidth=2; for(let i=1;i<6;i++){ x.beginPath(); x.arc(cx,cy,r*i/6,0,7); x.stroke(); } for(let i=0;i<8;i++){ x.beginPath(); x.moveTo(cx,cy); x.lineTo(cx+Math.cos(i*0.785)*r,cy+Math.sin(i*0.785)*r); x.stroke(); } x.fillStyle='#bdb8b0'; for(let i=0;i<6;i++) x.fillRect(w*0.74,12+i*12,w*0.2,5); }); }
  function shutterTex(){ return tex('shutter',128,128,(x,w,h)=>{ for(let r=0;r<h;r+=8){ const g=x.createLinearGradient(0,r,0,r+8); g.addColorStop(0,'#b9bcbf'); g.addColorStop(0.5,'#e2e4e6'); g.addColorStop(1,'#8f9295'); x.fillStyle=g; x.fillRect(0,r,w,8); } x.fillStyle='rgba(60,50,40,0.12)'; x.fillRect(0,h*0.8,w,h*0.2); }); }
  function ironDoorTex(color){ return tex('irondoor_'+color,128,256,(x,w,h)=>{ x.fillStyle=color; x.fillRect(0,0,w,h); x.strokeStyle='rgba(0,0,0,0.35)'; x.lineWidth=3; x.strokeRect(10,10,w-20,h*0.42); x.strokeRect(10,h*0.5,w-20,h*0.45); x.fillStyle='rgba(255,255,255,0.15)'; for(let i=0;i<6;i++) x.fillRect(20,20+i*16,w-40,3); x.fillStyle='#c9a24f'; x.fillRect(w-26,h*0.47,10,14); x.fillStyle='#2b2b2b'; x.fillRect(w*0.3,h*0.62,w*0.4,6); }); }
  function corrugatedTex(color){ return tex('corr_'+color,128,64,(x,w,h)=>{ for(let i=0;i<w;i+=8){ const g=x.createLinearGradient(i,0,i+8,0); g.addColorStop(0,shadeHex(color,0.78)); g.addColorStop(0.5,shadeHex(color,1.08)); g.addColorStop(1,shadeHex(color,0.78)); x.fillStyle=g; x.fillRect(i,0,8,h); } }); }
  // 窗戶圖集：8 種（白天：窗簾、百葉、反光；晚上：暖光、冷光、電視光、沒開燈）
  function windowAtlas(night){ return tex('winAtlas'+(night?'N':'D'),512,256,(x,w,h)=>{ const cw=w/4, ch=h/2; for(let i=0;i<8;i++){ const ox=(i%4)*cw, oy=Math.floor(i/4)*ch; let g=x.createLinearGradient(ox,oy,ox+cw,oy+ch);
        if(!night){ g.addColorStop(0,'#8fa7b5'); g.addColorStop(0.5,'#5f7584'); g.addColorStop(1,'#3e4c56'); x.fillStyle=g; x.fillRect(ox,oy,cw,ch); x.fillStyle='rgba(255,255,255,0.18)'; x.beginPath(); x.moveTo(ox+cw*0.1,oy); x.lineTo(ox+cw*0.35,oy); x.lineTo(ox+cw*0.05,oy+ch); x.lineTo(ox-cw*0.2,oy+ch); x.fill();
          if(i%3===0){ x.fillStyle='rgba(235,228,214,0.9)'; x.fillRect(ox,oy,cw*0.42,ch); x.fillRect(ox+cw*0.6,oy,cw*0.4,ch); } else if(i%3===1){ x.fillStyle='rgba(225,225,220,0.85)'; for(let k=0;k<ch;k+=6) x.fillRect(ox,oy+k,cw,3.5); } }
        else { const lit=[1,1,0,1,0,1,1,0][i]; if(lit){ const warm=i%2===0; g=x.createRadialGradient(ox+cw/2,oy+ch*0.3,4,ox+cw/2,oy+ch*0.4,cw*0.8); g.addColorStop(0,warm?'#ffe2a8':'#e8f0ff'); g.addColorStop(1,warm?'#d98f45':'#7f93b0'); x.fillStyle=g; x.fillRect(ox,oy,cw,ch); if(i%3===0){ x.fillStyle='rgba(120,70,30,0.55)'; x.fillRect(ox,oy,cw*0.38,ch); x.fillRect(ox+cw*0.66,oy,cw*0.34,ch); } if(i===5){ x.fillStyle='rgba(60,90,160,0.5)'; x.fillRect(ox+cw*0.2,oy+ch*0.4,cw*0.5,ch*0.35); } } else { x.fillStyle='#141820'; x.fillRect(ox,oy,cw,ch); x.fillStyle='rgba(120,130,150,0.08)'; x.fillRect(ox,oy,cw*0.5,ch); } }
        x.strokeStyle=night?'#2a2a2a':'#c8ccd0'; x.lineWidth=6; x.strokeRect(ox+3,oy+3,cw-6,ch-6); x.lineWidth=4; x.beginPath(); x.moveTo(ox+cw/2,oy); x.lineTo(ox+cw/2,oy+ch); x.stroke(); } }, false); }
  // 店面內部景深卡（玻璃後面的室內）：type 決定內容
  function interiorTex(type){ return tex('int_'+type,512,256,(x,w,h)=>{ const P={
      cafe:{wall:'#b88a5e',floor:'#7a5a40',light:'#ffd9a0'}, books:{wall:'#5a4030',floor:'#3a2a20',light:'#ffe2b0'}, cvs:{wall:'#eef2f0',floor:'#d9dcd8',light:'#ffffff'}, noodle:{wall:'#e8dcc4',floor:'#8a7a66',light:'#fff0d0'}, print:{wall:'#e6e8ea',floor:'#a9adb2',light:'#f4f8ff'}, laundry:{wall:'#dfe8ee',floor:'#b9c2c8',light:'#f0f6ff'}, tea:{wall:'#f1e6d0',floor:'#b89a7a',light:'#fff3d8'}, teishoku:{wall:'#d9c7a8',floor:'#6b5440',light:'#ffe6b8'}, fruit:{wall:'#e9e2d3',floor:'#7d7468',light:'#fff6e0'} }[type]||{wall:'#ccc',floor:'#888',light:'#fff'};
      x.fillStyle=P.wall; x.fillRect(0,0,w,h); x.fillStyle=P.floor; x.fillRect(0,h*0.72,w,h*0.28); const g=x.createRadialGradient(w/2,h*0.1,10,w/2,h*0.4,w*0.6); g.addColorStop(0,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(0,0,0,0.25)'); x.fillStyle=g; x.fillRect(0,0,w,h);
      const shelf=(sx,sy,sw,sh,cols)=>{ x.fillStyle='rgba(60,40,25,0.9)'; x.fillRect(sx,sy,sw,sh); for(let r=0;r<4;r++){ let px=sx+3; while(px<sx+sw-6){ const bw=4+rnd()*7; x.fillStyle=cols[(rnd()*cols.length)|0]; x.fillRect(px,sy+4+r*(sh/4),bw,sh/4-7); px+=bw+1; } } };
      if(type==='cafe'||type==='teishoku'){ for(let i=0;i<5;i++){ const px=50+i*100; x.strokeStyle='rgba(30,20,10,0.8)'; x.lineWidth=2; x.beginPath(); x.moveTo(px,0); x.lineTo(px,h*0.22); x.stroke(); x.fillStyle=P.light; x.beginPath(); x.arc(px,h*0.25,10,0,7); x.fill(); } shelf(w*0.62,h*0.18,w*0.3,h*0.4,['#d9d3c6','#8c3b47','#2f5d50','#e0b95b','#ffffff']); x.fillStyle='rgba(50,32,20,0.95)'; x.fillRect(w*0.05,h*0.55,w*0.5,h*0.2); x.fillStyle='#d9c7a8'; x.fillRect(w*0.05,h*0.53,w*0.5,h*0.03); x.fillStyle='rgba(30,20,15,0.7)'; for(let i=0;i<3;i++){ x.beginPath(); x.arc(w*0.12+i*w*0.16,h*0.5,12,0,7); x.fill(); x.fillRect(w*0.1+i*w*0.16,h*0.5,8,30); } if(type==='teishoku'){ x.fillStyle='#f4ead8'; x.fillRect(w*0.15,h*0.08,w*0.35,h*0.18); x.fillStyle='#3b2a1e'; x.font='bold 22px sans-serif'; x.fillText('本日定食　鯖魚・豚汁',w*0.17,h*0.2); } }
      else if(type==='books'){ for(let i=0;i<4;i++) shelf(10+i*126,h*0.08,116,h*0.62,['#2f5d50','#8c3b47','#e0b95b','#4a6c8c','#7b6a5a','#c46a4a','#d9d3c6','#3e5a48']); x.fillStyle='rgba(80,55,35,0.95)'; x.fillRect(w*0.3,h*0.62,w*0.4,h*0.14); }
      else if(type==='cvs'){ x.fillStyle='#ffffff'; x.fillRect(0,0,w,h*0.06); for(let i=0;i<5;i++){ const sx=8+i*102; x.fillStyle='#cfd6d6'; x.fillRect(sx,h*0.2,92,h*0.52); for(let r=0;r<4;r++) for(let c=0;c<7;c++){ x.fillStyle=['#e05a4a','#f2c14e','#4a90c2','#5aa86a','#ffffff','#f08a3c'][(rnd()*6)|0]; x.fillRect(sx+4+c*12.5,h*0.23+r*h*0.12,9,h*0.08); } } x.fillStyle='rgba(180,220,240,0.6)'; x.fillRect(w*0.82,h*0.15,w*0.16,h*0.57); }
      else if(type==='noodle'){ x.fillStyle='#b8a68a'; x.fillRect(0,h*0.5,w*0.55,h*0.24); x.fillStyle='#c0392b'; for(let i=0;i<4;i++){ x.beginPath(); x.ellipse(60+i*90,h*0.16,16,22,0,0,7); x.fill(); } x.fillStyle='#f4ead8'; x.fillRect(w*0.6,h*0.08,w*0.36,h*0.4); x.fillStyle='#3b2a1e'; x.font='bold 18px sans-serif'; ['乾麵 50','餛飩湯 40','滷味 隨意','小菜 30'].forEach((t,i)=>x.fillText(t,w*0.63,h*0.15+i*24)); for(let i=0;i<3;i++){ x.fillStyle='rgba(255,255,255,0.25)'; x.beginPath(); x.arc(80+i*40,h*0.42,18,0,7); x.fill(); } }
      else if(type==='print'){ for(let i=0;i<3;i++){ x.fillStyle='#d4d8dc'; x.fillRect(30+i*140,h*0.36,110,h*0.38); x.fillStyle='#8f969c'; x.fillRect(30+i*140,h*0.36,110,10); x.fillStyle='#4a90c2'; x.fillRect(40+i*140,h*0.42,24,10); } x.fillStyle='#ffffff'; for(let i=0;i<10;i++) x.fillRect(rnd()*w,h*0.1+rnd()*h*0.15,30,40); }
      else if(type==='laundry'){ for(let i=0;i<6;i++){ x.fillStyle='#f4f6f7'; x.fillRect(12+i*84,h*0.34,74,h*0.4); x.fillStyle='#5f6b72'; x.beginPath(); x.arc(49+i*84,h*0.56,22,0,7); x.fill(); x.fillStyle='rgba(150,190,220,0.8)'; x.beginPath(); x.arc(49+i*84,h*0.56,16,0,7); x.fill(); } }
      else if(type==='tea'){ x.fillStyle='#f4ead8'; x.fillRect(w*0.05,h*0.08,w*0.9,h*0.22); x.fillStyle='#5c3a21'; x.font='bold 20px sans-serif'; ['紅茶 30','綠茶 30','珍珠奶茶 55','冬瓜檸檬 45'].forEach((t,i)=>x.fillText(t,w*0.08+i*w*0.23,h*0.22)); x.fillStyle='#d8c4a6'; x.fillRect(0,h*0.48,w,h*0.26); for(let i=0;i<8;i++){ x.fillStyle=['#c98a4a','#e8d2a8','#7a9a5a'][i%3]; x.fillRect(30+i*58,h*0.36,14,h*0.12); } }
      else if(type==='fruit'){ for(let i=0;i<6;i++){ x.fillStyle='#8a6a48'; x.fillRect(10+i*84,h*0.5,76,h*0.22); for(let k=0;k<14;k++){ x.fillStyle=['#e05a3a','#f2b33e','#7ab04a','#c0392b','#f4d03f'][i%5]; x.beginPath(); x.arc(18+i*84+rnd()*60,h*0.5+rnd()*10,7,0,7); x.fill(); } } }
      // 玻璃反光
      x.fillStyle='rgba(255,255,255,0.08)'; x.beginPath(); x.moveTo(w*0.1,0); x.lineTo(w*0.3,0); x.lineTo(w*0.15,h); x.lineTo(0,h); x.fill(); }, false); }
  function signTex(text, o){ o=o||{}; const vertical=!!o.vertical; const W=vertical?128:512, H=vertical?512:128; return tex('sg_'+text+JSON.stringify(o),W,H,(x,w,h)=>{ x.fillStyle=o.bg||'#ffffff'; x.fillRect(0,0,w,h); if(o.border){ x.strokeStyle=o.border; x.lineWidth=8; x.strokeRect(4,4,w-8,h-8); } if(o.band){ x.fillStyle=o.band; x.fillRect(0,vertical?0:h*0.78,vertical?w*0.18:w,vertical?h:h*0.22); } x.fillStyle=o.color||'#222'; x.textAlign='center'; x.textBaseline='middle'; const font=o.serif?'"Noto Serif TC","Songti TC",serif':'"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
      if(vertical){ const chars=[...text]; const fs=Math.min(96,(h-30)/chars.length*0.9); x.font=(o.weight||'bold')+' '+fs+'px '+font; chars.forEach((ch,i)=>x.fillText(ch,w/2+(o.band?8:0),20+fs*0.55+i*(h-40)/chars.length)); }
      else { let fs=o.size||72; x.font=(o.weight||'bold')+' '+fs+'px '+font; while(x.measureText(text).width>w-30&&fs>20){ fs-=4; x.font=(o.weight||'bold')+' '+fs+'px '+font; } x.fillText(text,w/2,h*(o.band?0.42:0.52)); if(o.sub){ x.font='500 22px '+font; x.fillText(o.sub,w/2,h*0.86); } } }, false); }
  function radialTex(key, inner, outer){ return tex('rad_'+key,128,128,(x,w,h)=>{ const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); g.addColorStop(0,inner); g.addColorStop(1,outer); x.fillStyle=g; x.fillRect(0,0,w,h); }, false); }

  // ---------------- 材質 ----------------
  const matCache={};
  function M(key, make){ if(!matCache[key]) matCache[key]=make(); return matCache[key]; }
  const std=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.9,metalness:0},o));
  // 純色零件用「代理材質」：同一組粗糙度/金屬度共用一個 vertexColors 材質，顏色烘進頂點 → 整條街的純色零件可以合併成很少的 draw call
  const col=(hex,o)=>({isPaint:true,color:new THREE.Color(hex),key:JSON.stringify(o||{}),o:o||{}});
  const paintMat=(key,o)=>M('paint'+key,()=>std(Object.assign({vertexColors:true},o)));
  const colMat=(hex,o)=>M('c'+hex+JSON.stringify(o||{}),()=>std(Object.assign({color:new THREE.Color(hex)},o||{})));
  // 夜間會亮的材質（emissive 由 setNight 控制）
  const nightMats=[];
  function glowMat(key, map, o){ return M('g'+key,()=>{ const m=std(Object.assign({map,emissive:new THREE.Color(0xffffff),emissiveMap:(o&&o.emap)||map,emissiveIntensity:0,roughness:0.6},o&&o.mat||{})); m.userData.nightI=(o&&o.nightI)||1.0; m.userData.dayI=(o&&o.dayI)||0; nightMats.push(m); return m; }); }

  // ---------------- 合併工具 ----------------
  // 同一個材質的幾何收集起來，最後合併成一個 mesh
  const WHITE=new THREE.Color(1,1,1);
  function Bin(){ this.list=new Map(); }
  Bin.prototype.add=function(mat, geom, x, y, z, ry, opts){ opts=opts||{}; let g=geom; if(!g.index){ const n=g.attributes.position.count; const idx=new Array(n); for(let i=0;i<n;i++) idx[i]=i; g.setIndex(idx); } for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k); if(!g.attributes.uv){ g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2)); } g.clearGroups();
    const cnt=g.attributes.position.count; const c=(mat&&mat.isPaint)?mat.color:WHITE; const ca=new Float32Array(cnt*3); for(let i=0;i<cnt;i++){ ca[i*3]=c.r; ca[i*3+1]=c.g; ca[i*3+2]=c.b; } g.setAttribute('color',new THREE.Float32BufferAttribute(ca,3)); if(mat&&mat.isPaint) mat=mat.mat||paintMat(mat.key,mat.o); const m=new THREE.Matrix4().compose(new THREE.Vector3(x||0,y||0,z||0),new THREE.Quaternion().setFromEuler(new THREE.Euler(opts.rx||0,ry||0,opts.rz||0,'YXZ')),new THREE.Vector3(1,1,1)); g.applyMatrix4(m); const key=mat.uuid+(opts.noShadow?'n':'s'); if(!this.list.has(key)) this.list.set(key,{mat,geoms:[],noShadow:!!opts.noShadow}); this.list.get(key).geoms.push(g); return this; };
  Bin.prototype.build=function(group){ for(const [k,e] of this.list){ const merged=BGU.mergeGeometries(e.geoms,false); if(!merged) continue; merged.computeBoundingSphere(); const mesh=new THREE.Mesh(merged,e.mat); mesh.castShadow=!e.noShadow; mesh.receiveShadow=true; group.add(mesh); for(const g of e.geoms) g.dispose(); } this.list.clear(); return group; };
  // 方塊，UV 依實際尺寸（每 uvm 公尺重複一次）
  function boxG(w,h,d,uvm){ const g=new THREE.BoxGeometry(w,h,d); if(uvm){ const uv=g.attributes.uv, n=g.attributes.normal; for(let i=0;i<uv.count;i++){ const nx=Math.abs(n.getX(i)), ny=Math.abs(n.getY(i)); let su=w, sv=h; if(nx>0.5){ su=d; sv=h; } else if(ny>0.5){ su=w; sv=d; } uv.setXY(i,uv.getX(i)*su/uvm,uv.getY(i)*sv/uvm); } } return g; }
  function planeG(w,h,uv){ const g=new THREE.PlaneGeometry(w,h); if(uv){ const a=g.attributes.uv; for(let i=0;i<a.count;i++) a.setXY(i,uv[0]+a.getX(i)*uv[2],uv[1]+a.getY(i)*uv[3]); } return g; }

  // ---------------- 建築：台北老公寓 ----------------
  /* spec: {w 寬（沿街）, d 深, floors, fh 樓高, wall:'tile'|'mosaic'|'plaster', color, ground:{type:'shop'|'door'|'shutter'|'arcade', shop:{type,name,sub,signBg,signColor,vertical,awning}}, roofAdd:bool, tank:bool, balcony:bool, setback}
     座標：建築正面朝 +z（之後整棟旋轉放到街邊），原點在正面中央地面。 */
  function apartment(spec){ const g=new THREE.Group(); const bin=new Bin(); const W=spec.w, D=spec.d||12, F=spec.floors||4, FH=spec.fh||3.1, H=F*FH; const gh=spec.groundH||3.4; const totalH=gh+(F-1)*FH;
    const wallT=spec.wall==='mosaic'?mosaicTex('#ece8e0','base'):(spec.wall==='plaster'?plasterTex('#f2eee6','base'):tileTex('#ece6da','#c9c2b6','base'));
    const wallM={isPaint:true,color:new THREE.Color(spec.color).multiplyScalar(1.08),key:'wall'+wallT.uuid,mat:M('wall'+wallT.uuid,()=>std({map:wallT,vertexColors:true}))};
    // 本體（一樓以上）
    bin.add(wallM,boxG(W,totalH-gh,D,1.0),0,gh+(totalH-gh)/2,-D/2);
    // 一樓牆面（較深色的石材或磁磚）
    // 一樓牆體：店面要退縮（玻璃在立面、室內景深卡在 1.2m 後面，牆體從那後面開始）
    const gt=(spec.ground||{}).type; const rec=(gt==='shop'?((spec.ground.shop||{}).type==='cafe'?3.5:1.3):(gt==='arcade'?4.3:0.2)); /* Café 有 3.4m 深的室內，一樓實心牆往後退 */ const gm=col(spec.groundWall||'#8a8278'); bin.add(gm,boxG(W,gh,D-rec,1.0),0,gh/2,-rec-(D-rec)/2);
    if(gt==='shop'||gt==='arcade'){ for(const sx of [-1,1]) bin.add(gm,boxG(0.3,gh,rec),sx*(W/2-0.15),gh/2,-rec/2); }
    // 樓板線
    const slab=col(shadeHex(spec.color,0.82)); for(let f=1;f<F;f++){ bin.add(slab,boxG(W+0.06,0.18,0.12),0,gh+(f-1)*FH,0.03,0,{noShadow:true}); }
    // 女兒牆＋屋頂
    bin.add(wallM,boxG(W,0.9,0.18,1.0),0,totalH+0.45,-0.09); bin.add(wallM,boxG(0.18,0.9,D),-W/2+0.09,totalH+0.45,-D/2); bin.add(wallM,boxG(0.18,0.9,D),W/2-0.09,totalH+0.45,-D/2);
    bin.add(col('#7d7a74'),boxG(W,0.1,D),0,totalH+0.05,-D/2,0,{noShadow:true});
    // 窗戶：每層 n 扇
    const winD=M('winD',()=>glowMat('winAtlas',windowAtlas(false),{emap:windowAtlas(true),nightI:0.95,mat:{roughness:0.25,metalness:0.1}}));
    const frameM=col('#c9ccd0',{roughness:0.5,metalness:0.3}); const grilleColor=spec.grille||['#2f3a34','#3a3d42','#5b4a3a','#e6e6e6'][Math.floor(rnd()*4)];
    const grM={isPaint:true,color:new THREE.Color(grilleColor).multiplyScalar(1.6),key:'grille',mat:M('grille',()=>std({map:grilleTex('#9a9a9a'),alphaTest:0.5,side:THREE.DoubleSide,roughness:0.6,metalness:0.4,vertexColors:true}))};
    const acM=M('ac',()=>std({map:acTex(),roughness:0.7}));
    const n=Math.max(1,Math.round(W/3.6)); const ww=Math.min(2.2,W/n-0.9), wh=1.5;
    for(let f=1;f<F;f++){ const y=gh+(f-1)*FH+FH*0.52; for(let i=0;i<n;i++){ const x=-W/2+(i+0.5)*W/n; const vi=Math.floor(rnd()*8); const u0=(vi%4)/4, v0=1-(Math.floor(vi/4)+1)/2;
        bin.add(winD,planeG(ww,wh,[u0,v0,0.25,0.5]),x,y,0.02,0,{noShadow:true}); bin.add(frameM,boxG(ww+0.12,0.08,0.14),x,y-wh/2-0.04,0.05,0,{noShadow:true});
        if(spec.detail===false) continue;
        const kind=spec.balcony&&i===Math.floor(n/2)?'balcony':(rnd()<0.75?'grille':'plain');
        if(kind==='grille'){ // 鐵窗：外凸的籠子（正面、兩側、上蓋）
          const gw=ww+0.3, gd=0.45, gh2=wh+0.3; bin.add(grM,planeG(gw,gh2,[0,0,gw/1.2,gh2/1.2]),x,y,gd,0,{noShadow:true}); for(const s of [-1,1]) bin.add(grM,planeG(gd,gh2,[0,0,gd/1.2,gh2/1.2]),x+s*gw/2,y,gd/2,Math.PI/2,{noShadow:true}); bin.add(col(grilleColor),boxG(gw+0.04,0.05,gd+0.02),x,y+gh2/2,gd/2,0,{noShadow:true}); bin.add(col(grilleColor),boxG(gw+0.04,0.05,gd+0.02),x,y-gh2/2,gd/2,0,{noShadow:true});
          if(rnd()<0.6){ // 鐵窗裡的盆栽
            const pc=['#5f9a5e','#4f8a4e','#7aa860'][Math.floor(rnd()*3)]; bin.add(col('#a8573a'),new THREE.CylinderGeometry(0.12,0.09,0.2,8),x-gw*0.25,y-gh2/2+0.13,gd*0.6); bin.add(col(pc),new THREE.SphereGeometry(0.2,7,5),x-gw*0.25,y-gh2/2+0.36,gd*0.6,0,{noShadow:true}); } }
        else if(kind==='balcony'){ bin.add(col('#bdb5a8'),boxG(ww+1.2,0.15,1.1),x,y-wh/2-0.2,0.55); bin.add(M('rail',()=>std({map:railTex(),alphaTest:0.5,side:THREE.DoubleSide,metalness:0.4,roughness:0.5})),planeG(ww+1.2,1.0,[0,0,(ww+1.2)/0.8,1]),x,y-wh/2+0.35,1.1,0,{noShadow:true}); bin.add(col('#d9d3c6'),new THREE.BoxGeometry(0.5,0.02,0.02),x+0.3,y+0.5,0.8,0,{noShadow:true}); }
        // 雨遮（波浪板）
        if(rnd()<0.45&&kind!=='grille'){ const awc=['#cfd9cf','#d9d3c6','#9fb6c4'][Math.floor(rnd()*3)]; bin.add({isPaint:true,color:new THREE.Color(awc).multiplyScalar(1.15),key:'corr',mat:M('corrN',()=>std({map:corrugatedTex('#d8d8d8'),side:THREE.DoubleSide,roughness:0.6,vertexColors:true}))},planeG(ww+0.6,0.7,[0,0,(ww+0.6)/0.3,1]),x,y+wh/2+0.35,0.32,0,{rx:-1.1,noShadow:true}); }
        // 冷氣室外機（窗下，有的掛在鐵架上）
        if(rnd()<0.7){ const ax=x+(rnd()<0.5?-1:1)*(ww/2+0.15); bin.add(acM,boxG(0.82,0.58,0.3),ax,y-wh/2-0.45,0.2,0,{noShadow:true}); bin.add(col('#6b6f73'),boxG(0.9,0.04,0.36),ax,y-wh/2-0.76,0.2,0,{noShadow:true}); } } }
    // 頂樓水塔與加蓋
    if(spec.tank!==false){ const tx=(rnd()-0.5)*(W-3); bin.add(col('#c9ced4',{metalness:0.6,roughness:0.35}),new THREE.CylinderGeometry(0.55,0.55,1.2,14),tx,totalH+0.95,-D*0.4); for(const s of [-1,1]) bin.add(col('#6b6f73'),boxG(0.08,0.4,0.08),tx+s*0.4,totalH+0.25,-D*0.4,0,{noShadow:true}); }
    if(spec.roofAdd){ const aw=W*0.7, ad=D*0.55; bin.add(M('corRoof',()=>std({map:corrugatedTex('#7f8a86'),roughness:0.6,metalness:0.3})),boxG(aw,2.4,ad,0.6),0,totalH+1.2,-D*0.5); bin.add(col('#a9b3ae'),boxG(aw+0.3,0.1,ad+0.3),0,totalH+2.45,-D*0.5); }
    // 一樓
    const gr=spec.ground||{type:'door'}; const shopBins=groundFloor(bin,gr,W,gh,spec,winD);
    bin.build(g); for(const extra of shopBins) g.add(extra);
    g.userData.footprint={w:W,d:D}; g.userData.h=totalH; return g; }

  // 一樓：店面、鐵門、鐵捲門、騎樓
  function groundFloor(bin,gr,W,gh,spec,winD){ const extras=[]; const t=gr.type;
    if(t==='shop'&&gr.shop&&gr.shop.type==='cafe'){ cafeFront(bin,extras,W,gh,gr.shop); return extras; }
    if(t==='shop'||t==='arcade'){ const s=gr.shop||{}; const dep=t==='arcade'?3.0:0; const iw=W-0.6, ih=gh-0.9;
      // 室內景深卡（後退 1.2m）＋玻璃框
      const im=glowMat('int_'+s.type,interiorTex(s.type),{nightI:1.15,dayI:0.6}); bin.add(im,planeG(iw,ih),0,ih/2+0.15,-1.2-dep,0,{noShadow:true}); bin.add(col('#d9d3c6'),boxG(iw,0.15,1.3),0,0.08,-0.6-dep,0,{noShadow:true});
      for(const sx of [-1,1]) bin.add(col('#d9d3c6'),boxG(0.05,ih,1.2),sx*iw/2,ih/2+0.15,-0.6-dep,0,{noShadow:true});
      const fr=col(s.frame||'#3b2a1e',{roughness:0.55}); bin.add(fr,boxG(W,0.25,0.25),0,ih+0.27,-dep,0,{noShadow:true}); for(const sx of [-0.5,-0.17,0.17,0.5]) bin.add(fr,boxG(0.1,ih,0.12),sx*iw,ih/2+0.15,-dep,0,{noShadow:true});
      bin.add(M('glass',()=>std({color:0xa8c4d0,transparent:true,opacity:0.18,roughness:0.05,metalness:0.2,depthWrite:false})),planeG(iw,ih),0,ih/2+0.15,-dep+0.01,0,{noShadow:true});
      // 招牌（橫）
      const sg=glowMat('sign'+s.name,signTex(s.name,{bg:s.signBg||'#3b2a1e',color:s.signColor||'#f4ead8',sub:s.sub,serif:s.serif,band:s.band}),{nightI:0.9,dayI:0.0}); bin.add(sg,boxG(Math.min(W-0.4,6.5),0.75,0.12),0,gh-0.3,0.08-dep*0,0,{noShadow:true});
      // 直立招牌（突出）
      if(s.vertical){ const vg=glowMat('vsign'+s.vertical,signTex(s.vertical,{vertical:true,bg:s.vBg||'#ffffff',color:s.vColor||'#b0332a',band:s.vBand||'#b0332a'}),{nightI:1.0}); bin.add(vg,boxG(0.16,2.6,0.75),W/2-0.5,gh+1.6,0.55,0,{noShadow:true}); }
      if(s.awning){ const aw=s.awning; bin.add({isPaint:true,color:new THREE.Color(aw).multiplyScalar(1.25),key:'awn',mat:M('awnN',()=>std({map:awningTex('#cccccc'),side:THREE.DoubleSide,roughness:0.85,vertexColors:true}))},planeG(W-0.4,1.3,[0,0,(W-0.4)/1.2,1]),0,gh-0.95,0.55,0,{rx:-1.15}); }
      if(t==='arcade'){ // 騎樓：上方樓板延伸到街邊，柱子
        bin.add(col('#cfc7b8'),boxG(W,0.35,dep),0,gh-0.17,-dep/2); for(const sx of [-W/2+0.3,W/2-0.3]) bin.add(M('pillar',()=>std({map:tileTex('#b8aa96','#a09482','pillar')})),boxG(0.55,gh,0.55,1),sx,gh/2,-0.3); bin.add(M('swalkA',()=>std({map:sidewalkTex('#9a8f84')})),boxG(W,0.12,dep,2),0,0.06,-dep/2,0,{noShadow:true}); } }
    else if(t==='shutter'){ bin.add(M('shut',()=>std({map:shutterTex(),roughness:0.5,metalness:0.4})),planeG(W-0.8,gh-0.6,[0,0,1,(gh-0.6)/1.2]),0,(gh-0.6)/2+0.05,0.02,0,{noShadow:true}); bin.add(col('#8f9295'),boxG(W-0.6,0.35,0.3),0,gh-0.45,0.12,0,{noShadow:true}); if(gr.sign){ const sg=glowMat('sign'+gr.sign,signTex(gr.sign,{bg:'#f4f1ea',color:'#2b2b2b'}),{nightI:0.6}); bin.add(sg,boxG(Math.min(W-1,4),0.6,0.1),0,gh-0.05,0.1,0,{noShadow:true}); } }
    else { // 住家：紅色或墨綠鐵門＋信箱＋門燈
      const dc=gr.color||['#9c2f2a','#2f4a3a','#8a3a2a','#5b4a3a'][Math.floor(rnd()*4)]; bin.add({isPaint:true,color:new THREE.Color(dc).multiplyScalar(2.2),key:'door',mat:M('doorN',()=>std({map:ironDoorTex('#7a7a7a'),roughness:0.5,metalness:0.35,vertexColors:true}))},planeG(1.4,2.3),-W*0.2,1.15+0.05,0.03,0,{noShadow:true}); bin.add(col('#d9d3c6'),boxG(1.7,0.12,0.4),-W*0.2,0.06,0.2,0,{noShadow:true}); bin.add(glowMat('doorLamp',radialTex('dl','#fff2c8','#e0a050')),new THREE.SphereGeometry(0.09,8,6),-W*0.2+0.95,2.25,0.1,0,{noShadow:true}); if(gr.window!==false) bin.add(winD,planeG(1.8,1.1,[0.25,0.5,0.25,0.5]),W*0.18,1.6,0.02,0,{noShadow:true}); bin.add(col('#c9ccd0'),boxG(2.0,1.3,0.06),W*0.18,1.6,0.0,0,{noShadow:true}); }
    return extras; }
  // ---------------- 植物叢（葉片卡，和行道樹共用材質 → 合併成同一個 draw call）----------------
  function plantClump(bin,x,y,z,size,n,tint){ const leafM={isPaint:true,color:new THREE.Color(1,1,1),key:'leaf',mat:M('leafCard',()=>std({map:leafTex(),alphaTest:0.45,side:THREE.DoubleSide,roughness:0.85,vertexColors:true}))}; n=n||5;
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+rnd()*0.6, rr=size*0.18*rnd(); const sz=size*(0.55+rnd()*0.45); const sh=0.82+rnd()*0.25; const c=new THREE.Color(sh*(tint?tint[0]:1),sh*(tint?tint[1]:1),sh*(tint?tint[2]:0.92));
      bin.add({isPaint:true,color:c,key:'leaf',mat:leafM.mat},planeG(sz,sz),x+Math.cos(a)*rr,y+sz*0.42+rnd()*size*0.15,z+Math.sin(a)*rr,a,{rx:(rnd()-0.5)*0.5,noShadow:true}); } }
  // 夜間光暈（燈泡、壁燈）：Sprite，透明度跟著 setNight 變（白天淡、晚上亮）
  const nightSprites=[];
  function glowSprite(color,scale,dayO,nightO){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:radialTex('glow'+color,color,'rgba(0,0,0,0)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:dayO})); sp.scale.set(scale,scale,1); sp.userData.dayO=dayO; sp.userData.nightO=nightO; nightSprites.push(sp); return sp; }
  // ---------------- 兩點半 Café 店面（v9.2）----------------
  // 玻璃後面是有深度的室內（後牆書架與黑板菜單、吊燈、窗邊小桌、吧檯、植物），木窗框、木門、兩側壁燈、爬藤；
  // 室內燈從傍晚就亮（dayI 偏高），站在對街也看得出店內空間；和 cafe 區域（店內）的配置一致：吧檯在左後、窗邊雙人桌、書架在右後
  function cafeBackTex(){ return tex('cafeBack',1024,288,(x,w,h)=>{ x.fillStyle='#d9b98f'; x.fillRect(0,0,w,h); const g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(255,236,200,0.35)'); g.addColorStop(1,'rgba(90,50,20,0.25)'); x.fillStyle=g; x.fillRect(0,0,w,h);
      x.fillStyle='#6b4a2e'; x.fillRect(0,h*0.62,w,h*0.38); for(let i=0;i<w;i+=26){ x.fillStyle='rgba(30,15,5,0.25)'; x.fillRect(i,h*0.62,2,h*0.38); }
      const shelf=(sx,sy,sw,sh,rows)=>{ x.fillStyle='#4a301c'; x.fillRect(sx,sy,sw,sh); for(let r=0;r<rows;r++){ const yy=sy+6+r*(sh-6)/rows; x.fillStyle='#2e1d10'; x.fillRect(sx+4,yy+(sh-6)/rows-8,sw-8,4); let px=sx+8; while(px<sx+sw-14){ const kind=rnd(); if(kind<0.7){ const bw=6+rnd()*9, bh=(sh-6)/rows-16-rnd()*10; x.fillStyle=['#e8dcc4','#8c3b47','#2f5d50','#c9a24f','#f4f1ea','#4a6c8c','#7b5a3a'][(rnd()*7)|0]; x.fillRect(px,yy+(sh-6)/rows-8-bh,bw,bh); px+=bw+1; } else { x.fillStyle='rgba(240,230,210,0.9)'; x.beginPath(); x.ellipse(px+9,yy+(sh-6)/rows-20,9,12,0,0,7); x.fill(); x.fillStyle='#3a2414'; x.fillRect(px+3,yy+(sh-6)/rows-34,12,5); px+=22; } } } };
      shelf(w*0.56,h*0.08,w*0.4,h*0.5,4); shelf(w*0.04,h*0.1,w*0.14,h*0.46,3);
      x.fillStyle='#2b2f2c'; x.fillRect(w*0.22,h*0.08,w*0.28,h*0.36); x.strokeStyle='#8a6a48'; x.lineWidth=8; x.strokeRect(w*0.22,h*0.08,w*0.28,h*0.36);
      x.fillStyle='#f2efe6'; x.font='bold 30px "Noto Sans TC","PingFang TC",sans-serif'; x.fillText('今日手沖',w*0.245,h*0.2); x.font='22px "Noto Sans TC","PingFang TC",sans-serif'; ['衣索比亞　耶加雪菲','瓜地馬拉　安提瓜','拿鐵　120　・　檸檬塔　90'].forEach((t,i)=>x.fillText(t,w*0.245,h*0.29+i*28));
      for(const fx of [0.53,0.2]){ x.fillStyle='#3a2a1e'; x.fillRect(w*fx-26,h*0.5,52,40); x.fillStyle='#c9b48a'; x.fillRect(w*fx-21,h*0.5+5,42,30); } }, false); }
  function cafeFront(bin,extras,W,gh,s){ const iw=W-0.6, ih=gh-0.9, D=3.4; const doorW=1.2;
    const wood=col('#5a3a22',{roughness:0.6}), woodL=col('#8a5e3c',{roughness:0.7}), metal=col('#2e2b28',{roughness:0.4,metalness:0.6});
    // 室內：地板、後牆、側牆、天花板（會發光的材質：傍晚起就有暖光）
    const floorT=tex('cafeFloor',256,256,(x,w,h)=>{ x.fillStyle='#8a5e3c'; x.fillRect(0,0,w,h); for(let j=0;j<h;j+=32){ x.fillStyle=(j/32)%2?'rgba(0,0,0,0.1)':'rgba(255,230,200,0.06)'; x.fillRect(0,j,w,32); x.fillStyle='rgba(40,20,10,0.4)'; x.fillRect(0,j,w,2); for(let i=((j/32)%2)*64;i<w;i+=128) x.fillRect(i,j,2,32); } });
    bin.add(glowMat('cafeFloor',floorT,{dayI:0.6,nightI:0.8,mat:{emissive:new THREE.Color(0xffd0a0)}}),planeG(iw,D,[0,0,iw/2.5,D/2.5]),0,0.03,-D/2,0,{rx:-Math.PI/2,noShadow:true});
    bin.add(glowMat('cafeBackW',cafeBackTex(),{dayI:0.95,nightI:1.2,mat:{emissive:new THREE.Color(0xffdcae)}}),planeG(iw,gh),0,gh/2,-D,0,{noShadow:true});
    const sideT=plasterTex('#d8b98e','cafeSide'); for(const sx of [-1,1]) bin.add(glowMat('cafeSide',sideT,{dayI:0.8,nightI:1.0,mat:{emissive:new THREE.Color(0xffd6a0)}}),planeG(D,gh),sx*iw/2,gh/2,-D/2,-sx*Math.PI/2,{noShadow:true});
    bin.add(col('#3a2616',{roughness:0.8}),planeG(iw,D),0,gh-0.05,-D/2,0,{rx:Math.PI/2,noShadow:true});
    // 吊燈 ×5（燈罩、燈泡、光暈）
    const bulbM=glowMat('cafeBulb',radialTex('cbulb','#fff4d6','#ffb45a'),{dayI:0.9,nightI:2.2});
    for(let i=0;i<5;i++){ const lx=-iw/2+1.4+i*(iw-2.8)/4, lz=-1.5, ly=2.3; bin.add(metal,boxG(0.015,gh-ly-0.1,0.015),lx,(gh+ly)/2,lz,0,{noShadow:true}); bin.add(col('#c9a24f',{roughness:0.35,metalness:0.7}),new THREE.CylinderGeometry(0.06,0.26,0.24,16,1,true),lx,ly,lz,0,{noShadow:true}); bin.add(bulbM,new THREE.SphereGeometry(0.08,10,8),lx,ly-0.1,lz,0,{noShadow:true}); const sp=glowSprite('rgba(255,200,130,1)',1.5,0.55,1.0); sp.position.set(lx,ly-0.12,lz); extras.push(sp); }
    // 吧檯（左後）＋咖啡機＋磨豆機＋杯子
    const cx=-iw/2+2.6; bin.add(wood,boxG(4.2,1.0,0.6),cx,0.5,-2.75); bin.add(col('#d9cbb0',{roughness:0.4}),boxG(4.3,0.05,0.68),cx,1.03,-2.75,0,{noShadow:true}); bin.add(col('#a9adb2',{roughness:0.3,metalness:0.6}),boxG(0.62,0.45,0.42),cx-1.2,1.28,-2.8,0,{noShadow:true}); bin.add(col('#2b2b2b'),new THREE.CylinderGeometry(0.08,0.1,0.38,10),cx-0.6,1.24,-2.8,0,{noShadow:true}); for(let i=0;i<4;i++) bin.add(col('#f4f1ea'),new THREE.CylinderGeometry(0.04,0.035,0.08,10),cx+0.2+i*0.18,1.09,-2.62,0,{noShadow:true});
    // 窗邊雙人小桌 ×4（避開門）
    for(const tx of [-iw/2+1.5,-iw/2+4.0,iw/2-4.0,iw/2-1.5]){ bin.add(col('#c9a57a',{roughness:0.5}),new THREE.CylinderGeometry(0.34,0.34,0.04,18),tx,0.74,-0.85,0,{noShadow:true}); bin.add(metal,new THREE.CylinderGeometry(0.035,0.16,0.72,10),tx,0.36,-0.85,0,{noShadow:true}); for(const s2 of [-1,1]){ const chx=tx+s2*0.58; bin.add(woodL,boxG(0.38,0.05,0.38),chx,0.46,-0.85,0,{noShadow:true}); bin.add(woodL,boxG(0.05,0.48,0.36),chx+s2*0.17,0.72,-0.85,0,{noShadow:true}); bin.add(metal,boxG(0.04,0.44,0.04),chx,0.22,-0.85,0,{noShadow:true}); } bin.add(col('#f4f1ea'),new THREE.CylinderGeometry(0.045,0.04,0.09,10),tx+0.1,0.8,-0.85,0,{noShadow:true}); }
    // 室內植物
    for(const [px,pz,sz] of [[iw/2-0.5,-0.5,1.3],[-iw/2+0.45,-1.8,1.1],[iw/2-0.6,-3.0,1.5]]){ bin.add(col('#e6e3de'),new THREE.CylinderGeometry(0.2,0.16,0.4,12),px,0.2,pz,0,{noShadow:true}); plantClump(bin,px,0.35,pz,sz,6); }
    // 立面：窗下的木作矮牆、木窗框（上下框、直櫺、橫條）、木門（玻璃＋把手）
    const glassM=M('glassWarm',()=>std({color:0xe8dcc8,transparent:true,opacity:0.08,roughness:0.05,metalness:0.1,depthWrite:false}));
    const paneW=(iw-doorW)/2; for(const sx of [-1,1]){ const pc=sx*(doorW/2+paneW/2); bin.add(M('cafePanel',()=>std({map:woodSidingTex(),roughness:0.7})),boxG(paneW,0.5,0.16,0.6),pc,0.25,0.0); bin.add(glassM,planeG(paneW,ih-0.4),pc,0.5+(ih-0.4)/2,0.02,0,{noShadow:true}); bin.add(wood,boxG(paneW,0.07,0.12),pc,0.5+(ih-0.4)*0.74,0.03,0,{noShadow:true}); for(const k of [0.5]) bin.add(wood,boxG(0.08,ih-0.4,0.12),pc+(k-0.5)*paneW,0.5+(ih-0.4)/2,0.03,0,{noShadow:true}); bin.add(wood,boxG(0.14,ih+0.15,0.16),sx*(iw/2),(ih+0.15)/2,0.02); bin.add(wood,boxG(0.14,ih+0.15,0.16),sx*(doorW/2+0.04),(ih+0.15)/2,0.02); bin.add(woodL,boxG(paneW,0.06,0.26),pc,0.53,0.1,0,{noShadow:true}); }
    bin.add(wood,boxG(iw+0.3,0.22,0.22),0,ih+0.2,0.02); bin.add(glassM,planeG(doorW-0.2,ih-0.35),0,(ih-0.35)/2+0.1,0.03,0,{noShadow:true}); bin.add(wood,boxG(doorW-0.12,0.1,0.1),0,ih*0.45,0.04,0,{noShadow:true}); bin.add(col('#c9a24f',{roughness:0.3,metalness:0.8}),boxG(0.03,0.32,0.05),doorW/2-0.22,1.05,0.08,0,{noShadow:true});
    // 店名招牌：深色木底＋米白字（傍晚起字會亮）；木製雨遮
    const sg=glowMat('sign'+s.name,signTex(s.name,{bg:s.signBg||'#3b2a1e',color:s.signColor||'#f4ead8',sub:s.sub,serif:s.serif}),{nightI:1.1,dayI:0.15}); bin.add(sg,boxG(Math.min(W-0.6,7.2),0.66,0.14),0,ih+0.62,0.12,0,{noShadow:true});
    bin.add(wood,boxG(W-0.2,0.1,0.32),0,ih+0.24,0.12,0,{noShadow:true});
    // 壁燈 ×2（門兩側）
    const lampM=glowMat('cafeLamp',radialTex('clamp','#fff2cc','#ffb050'),{dayI:0.35,nightI:2.0}); for(const sx of [-1,1]){ const lx=sx*(doorW/2+0.55); bin.add(metal,boxG(0.05,0.05,0.24),lx,2.55,0.14,0,{noShadow:true}); bin.add(metal,boxG(0.2,0.04,0.2),lx,2.73,0.28,0,{noShadow:true}); bin.add(lampM,boxG(0.15,0.24,0.15),lx,2.58,0.28,0,{noShadow:true}); const sp=glowSprite('rgba(255,205,140,1)',1.6,0.25,1.0); sp.position.set(lx,2.58,0.32); extras.push(sp); }
    // 爬藤（兩側壁柱往上爬到二樓）＋窗台小盆栽
    for(const sx of [-1,1]){ for(let k=0;k<9;k++){ plantClump(bin,sx*(W/2-0.12)+(rnd()-0.5)*0.25,0.2+k*0.55,0.12,0.75+rnd()*0.3,2,[0.85,1,0.85]); } }
    for(const sx of [-1,1]) for(let k=0;k<3;k++){ const px=sx*(doorW/2+0.6+k*((paneW-1.2)/2)); plantClump(bin,px,0.56,0.12,0.42,3); }
  }
  function awningTex(color){ return tex('awn2'+color,128,64,(x,w,h)=>{ x.fillStyle=color; x.fillRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.75)'; for(let i=0;i<w;i+=32) x.fillRect(i,0,16,h); x.fillStyle='rgba(0,0,0,0.15)'; x.fillRect(0,h-6,w,6); }); }

  // ---------------- 日式宿舍（黑瓦木造）＋圍牆 ----------------
  function japaneseHouse(w,d){ const g=new THREE.Group(); const bin=new Bin(); const wh=3.0;
    bin.add(col('#8a8278'),boxG(w+0.4,0.5,d+0.4),0,0.25,0); // 基座
    bin.add(M('siding',()=>std({map:woodSidingTex()})),boxG(w,wh,d,1.2),0,0.5+wh/2,0);
    // 窗：橫向木格窗，夜間微亮
    const shoji=glowMat('shoji',tex('shoji',128,64,(x,ww,hh)=>{ x.fillStyle='#efe6cf'; x.fillRect(0,0,ww,hh); x.strokeStyle='#5a3e28'; x.lineWidth=3; for(let i=0;i<=ww;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,hh); x.stroke(); } for(let j=0;j<=hh;j+=16){ x.beginPath(); x.moveTo(0,j); x.lineTo(ww,j); x.stroke(); } x.lineWidth=6; x.strokeRect(0,0,ww,hh); }),{nightI:0.7});
    for(const sx of [-0.3,0.25]){ bin.add(shoji,planeG(w*0.32,1.3),sx*w,0.5+wh*0.55,d/2+0.02,0,{noShadow:true});
      // 深色木窗框＋窗台（窗戶不再是貼在牆上的一張紙）
      const fw=w*0.32, cy=0.5+wh*0.55, fz=d/2+0.06; const fr=col('#3b2a1e');
      bin.add(fr,boxG(fw+0.16,0.1,0.1),sx*w,cy+0.7,fz); bin.add(fr,boxG(fw+0.24,0.08,0.22),sx*w,cy-0.69,fz+0.05); bin.add(fr,boxG(0.08,1.4,0.1),sx*w-fw/2-0.04,cy,fz); bin.add(fr,boxG(0.08,1.4,0.1),sx*w+fw/2+0.04,cy,fz); }
    // 玄關：往前突出的小門廊（小三角屋頂、木格拉門、門燈、踏石）
    { const px=-0.025*w, pw=2.2, pd=1.3, ph=2.5, fz=d/2; const wood=col('#4a3424'), dark=col('#2e221a');
      bin.add(M('siding',()=>std({map:woodSidingTex()})),boxG(0.16,ph,pd,1.2),px-pw/2,0.5+ph/2,fz+pd/2); bin.add(M('siding',()=>std({map:woodSidingTex()})),boxG(0.16,ph,pd,1.2),px+pw/2,0.5+ph/2,fz+pd/2);
      bin.add(col('#8a8278'),boxG(pw+0.4,0.5,pd+0.2),px,0.25,fz+pd/2);   // 玄關的石基座
      const door=M('koshido',()=>std({map:tex('koshido',128,128,(x,ww,hh)=>{ x.fillStyle='#d9d2c0'; x.fillRect(0,0,ww,hh); x.fillStyle='#3e2c1e'; for(let i=0;i<ww;i+=9) x.fillRect(i,0,3,hh); x.fillRect(0,0,ww,8); x.fillRect(0,hh-8,ww,8); x.fillRect(0,hh*0.62,ww,5); x.fillRect(ww/2-3,0,6,hh); }),roughness:0.75}));
      bin.add(door,planeG(pw-0.2,ph-0.3),px,0.5+(ph-0.3)/2,fz+pd+0.01,0,{noShadow:true});
      bin.add(wood,boxG(pw,0.18,0.16),px,0.5+ph-0.15,fz+pd);   // 門楣
      const ang=0.42, rl=(pw/2+0.35)/Math.cos(ang); for(const sgn of [-1,1]) bin.add(M('roof',()=>std({map:roofTileTex(),roughness:0.8})),boxG(rl,0.12,pd+0.7,0.5),px+sgn*(pw/2+0.35)/2,0.5+ph+0.08+Math.tan(ang)*(pw/2+0.35)/2,fz+pd/2+0.15,0,{rz:-sgn*ang});
      bin.add(dark,boxG(0.14,0.16,pd+0.8),px,0.5+ph+0.1+Math.tan(ang)*(pw/2+0.35),fz+pd/2+0.15);   // 屋脊
      bin.add(col('#9a948a'),boxG(0.9,0.14,0.55),px,0.07,fz+pd+0.5);   // 沓脫石
      const lamp=glowMat('genkanLamp',null,{dayI:0.15,nightI:1.6,mat:{color:new THREE.Color('#f7e3b8'),emissive:new THREE.Color('#ffcf8a')}}); bin.add(lamp,boxG(0.2,0.26,0.2),px+pw/2-0.25,0.5+ph-0.55,fz+pd+0.12,0,{noShadow:true});
      g.userData.genkan={x:px,z:fz+pd+0.12,y:0.5+ph-0.55}; }
    // 寄棟屋頂（四坡）：用壓扁的四角錐
    const roof=new THREE.ConeGeometry(Math.hypot(w,d)/2+0.9,1.9,4,1); roof.rotateY(Math.PI/4); roof.scale(1,1,(d+1.6)/(w+1.6)); const rt=roofTileTex(); const rm=M('roof',()=>std({map:rt,roughness:0.8})); const uv=roof.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*6,uv.getY(i)*3);
    bin.add(rm,roof,0,0.5+wh+0.95,0); bin.add(col('#2e3034'),boxG(w*0.5,0.18,0.25),0,0.5+wh+1.85,0,0,{noShadow:true});
    bin.add(col('#3a2a1e'),boxG(w+1.4,0.12,d+1.4),0,0.5+wh+0.02,0,0,{noShadow:true}); // 屋簷
    bin.build(g); g.userData.footprint={w,d}; return g; }
  function wall(len,h,o){ o=o||{}; const g=new THREE.Group(); const bin=new Bin(); const gx=o.gateX||0, gw=o.gate||0;
    const seg=(x0,x1)=>{ if(x1-x0<0.05) return; bin.add(M('wallC',()=>std({map:plasterTex('#cfc8bb','jpwall')})),boxG(x1-x0,h,0.25,1.2),(x0+x1)/2,h/2,0); bin.add(M('wallTop',()=>std({map:roofTileTex(),roughness:0.8})),boxG(x1-x0+0.1,0.16,0.5,0.5),(x0+x1)/2,h+0.08,0); };
    if(gw&&o.openGate){ seg(-len/2,gx-gw/2); seg(gx+gw/2,len/2); } else seg(-len/2,len/2);
    if(gw){ const gh=Math.max(h+0.4,2.1); for(const sx of [-1,1]) bin.add(col('#5a3e28'),boxG(0.22,gh,0.22),gx+sx*(gw/2+0.11),gh/2,0.01);   // 門柱（開著的門：只有柱子＋冠木＋小屋頂）
      bin.add(col('#4a3424'),boxG(gw+0.7,0.2,0.24),gx,gh-0.15,0.01);
      if(!o.openGate) bin.add(M('gateWood',()=>std({map:woodSidingTex()})),planeG(gw-0.3,h-0.2,[0,0,1,1.5]),gx,h/2,0.17,0,{noShadow:true});
      bin.add(M('roof',()=>std({map:roofTileTex(),roughness:0.8})),boxG(gw+1.0,0.22,0.9,0.5),gx,gh+0.1,0); }
    bin.build(g); return g; }


  // ---------------- 行道樹（葉片卡：交叉的透明葉叢面片，會投下斑駁樹影）----------------
  function leafTex(){ return tex('leafCluster',256,256,(x,w,h)=>{ x.clearRect(0,0,w,h); const cols=['#3f6e3a','#4f8a44','#5f9a4e','#6fa85a','#3a5f34','#7cb064']; for(let i=0;i<420;i++){ const a=rnd()*Math.PI*2, r=Math.pow(rnd(),0.6)*w*0.46; const px=w/2+Math.cos(a)*r, py=h/2+Math.sin(a)*r*0.92; x.save(); x.translate(px,py); x.rotate(rnd()*Math.PI*2); x.fillStyle=cols[(rnd()*cols.length)|0]; x.beginPath(); x.ellipse(0,0,4+rnd()*4,8+rnd()*6,0,0,7); x.fill(); x.restore(); } }, false); }
  function tree(height, seed){ const g=new THREE.Group(); const bin=new Bin(); const H=height||7; const r=(a,b)=>a+(b-a)*rnd();
    // 樹幹（略彎）＋主枝
    const bark=M('bark',()=>std({map:tex('bark',64,256,(x,w,hh)=>{ x.fillStyle='#5a4a3c'; x.fillRect(0,0,w,hh); for(let i=0;i<120;i++){ x.fillStyle=rnd()<0.5?'rgba(30,22,16,0.35)':'rgba(140,125,105,0.25)'; x.fillRect(rnd()*w,rnd()*hh,2+rnd()*3,8+rnd()*20); } }),roughness:0.95}));
    const th=H*0.45; let px=0, pz=0; for(let i=0;i<3;i++){ const seg=new THREE.CylinderGeometry(0.16-i*0.03,0.22-i*0.03,th/3+0.05,8); const nx=px+r(-0.12,0.12), nz=pz+r(-0.12,0.12); bin.add(bark,seg,(px+nx)/2,th/6+i*th/3,(pz+nz)/2,0,{rx:(nz-pz)*0.8,rz:-(nx-px)*0.8}); px=nx; pz=nz; }
    const leafM={isPaint:true,color:new THREE.Color(1,1,1),key:'leaf',mat:M('leafCard',()=>std({map:leafTex(),alphaTest:0.45,side:THREE.DoubleSide,roughness:0.85,vertexColors:true}))};
    const crownY=th+H*0.22, cr=H*0.32; const n=Math.round(14+H*2.2);
    for(let i=0;i<n;i++){ const a=rnd()*Math.PI*2, rr=Math.sqrt(rnd())*cr, yy=crownY+r(-0.35,0.45)*H*0.35; const cx=px+Math.cos(a)*rr, cz=pz+Math.sin(a)*rr; const sz=r(1.6,2.4)*(H/7); const shade=0.78+rnd()*0.3+(yy-crownY)*0.05; const c=new THREE.Color(shade,shade*(0.98+rnd()*0.06),shade*0.92);
      if(i%4===0){ const br=new THREE.CylinderGeometry(0.04,0.07,Math.hypot(cx-px,yy-th),5); const ang=Math.atan2(cx-px,cz-pz); bin.add(bark,br,(px+cx)/2,(th+yy)/2,(pz+cz)/2,ang,{rx:Math.atan2(Math.hypot(cx-px,cz-pz),yy-th)}); }
      for(let k=0;k<3;k++){ const pl=new THREE.PlaneGeometry(sz,sz*0.85); const lm=Object.assign({},leafM,{color:c}); bin.add(lm,pl,cx,yy,cz,a+k*Math.PI/3,{rx:r(-0.35,0.35)}); } }
    bin.build(g); g.userData.trunk={x:px,z:pz}; return g; }

  // 大王椰子（台大椰林大道、小椰林道）：灰白筆直的樹幹（基部略寬、中段微鼓、淡淡的環紋）、
  // 頂端一段光滑的綠色葉鞘、十幾片拱形下垂的羽狀葉（葉片卡帶 V 形斷面）。h＝總高（公尺）
  function frondTex(){ return tex('palmFrond',128,512,(x,w,h)=>{ x.clearRect(0,0,w,h); const c=w/2;
    for(let y=10;y<h-4;y+=4){ const t=y/h; const L=(c-4)*(0.25+0.75*Math.sin(Math.PI*Math.min(1,0.15+t*0.95))); for(const s of [-1,1]){ const g=150+((y*7)%34), gg=0.78+((y*13)%20)/100; x.strokeStyle='rgb('+Math.round(70*gg)+','+Math.round(g*gg)+','+Math.round(58*gg)+')'; x.lineWidth=2.2; x.beginPath(); x.moveTo(c+s*2,y); x.quadraticCurveTo(c+s*(2+L*0.6),y-L*0.18,c+s*(2+L),y-L*0.5); x.stroke(); } }
    x.fillStyle='#b8b48a'; x.fillRect(c-2,0,4,h); }, false); }
  function royalPalm(h, seed){ const g=new THREE.Group(); const bin=new Bin(); const H=h||12; let s=(seed||1)*9301+49297; const r=()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
    const trunkH=H*0.78, shaftH=H*0.1;
    const bark=M('palmTrunk',()=>std({map:tex('palmTrunk',64,256,(x,w,hh)=>{ x.fillStyle='#c4bfb3'; x.fillRect(0,0,w,hh); for(let y=0;y<hh;y+=6+((y*7)%5)){ x.fillStyle='rgba(120,112,98,0.2)'; x.fillRect(0,y,w,1.5); } for(let i=0;i<90;i++){ x.fillStyle=rnd()<0.5?'rgba(90,84,74,0.12)':'rgba(240,236,226,0.18)'; x.fillRect(rnd()*w,rnd()*hh,3+rnd()*6,2+rnd()*5); } }),roughness:0.92}));
    // 樹幹：lathe 斷面（半徑隨高度變化）
    const prof=[]; const R0=H*0.026; for(let i=0;i<=10;i++){ const t=i/10; const rr=R0*(1.25-0.3*Math.min(1,t*5)+0.12*Math.sin(Math.PI*Math.min(1,t*1.4))-0.12*t); prof.push(new THREE.Vector2(Math.max(0.05,rr),t*trunkH)); }
    const trunk=new THREE.LatheGeometry(prof,10); const uvA=trunk.attributes.uv; for(let i=0;i<uvA.count;i++) uvA.setY(i,uvA.getY(i)*trunkH/3); bin.add(bark,trunk,0,0,0);
    const lean=(r()-0.5)*0.05;
    const shaft=new THREE.CylinderGeometry(R0*0.82,R0*0.95,shaftH,10); bin.add(col('#5f8a4a',{roughness:0.55}),shaft,0,trunkH+shaftH/2,0);
    const topY=trunkH+shaftH; bin.add(col('#4f6e3c',{roughness:0.7}),new THREE.ConeGeometry(R0*0.7,H*0.05,8),0,topY+H*0.02,0);
    const frondM=M('palmFrondMat',()=>std({map:frondTex(),alphaTest:0.4,side:THREE.DoubleSide,roughness:0.8,vertexColors:true}));
    const nF=13+((r()*4)|0); const pos=[], uv=[], colA=[], idx=[];
    for(let f=0;f<nF;f++){ const a=f/nF*Math.PI*2+r()*0.35; const up=0.55+r()*0.5-(f%3===0?0.45:0); const L=H*(0.3+r()*0.06); const W=H*0.12; const dx=Math.cos(a), dz=Math.sin(a); const sx=-dz, sz=dx; const seg=8; const base=pos.length/3; const shade=0.82+r()*0.3;
      for(let i=0;i<=seg;i++){ const t=i/seg; const hor=L*t*(1-0.18*t); const vert=L*(up*1.1*t-1.0*t*t); const px=dx*hor, py=topY+H*0.015+vert, pz=dz*hor; const w=W*(0.18+0.82*Math.sin(Math.PI*Math.min(1,0.12+t*0.95)))*0.5; const dr=w*0.55;
        for(const [k,u] of [[-1,0],[0,0.5],[1,1]]){ pos.push(px+sx*w*k, py-(k?dr:0), pz+sz*w*k); uv.push(u,1-t); const sh=shade*(k?0.92:1); colA.push(sh,sh,sh); } }
      for(let i=0;i<seg;i++){ const a0=base+i*3, a1=base+(i+1)*3; idx.push(a0,a1,a0+1, a1,a1+1,a0+1, a0+1,a1+1,a0+2, a1+1,a1+2,a0+2); } }
    const fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); fg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); fg.setAttribute('color',new THREE.Float32BufferAttribute(colA,3)); fg.setIndex(idx); fg.computeVertexNormals();
    bin.build(g); const fm=new THREE.Mesh(fg,frondM); fm.castShadow=true; fm.receiveShadow=true; g.add(fm); g.rotation.z=lean; return g; }

  // ---------------- 街道小物 ----------------
  // 電線桿（水泥）＋橫擔＋變壓器；arm:true 時附巷道路燈
  function utilityPole(o){ o=o||{}; const g=new THREE.Group(); const bin=new Bin(); const h=9;
    bin.add(col('#b9b5ad'),new THREE.CylinderGeometry(0.12,0.17,h,10),0,h/2,0); bin.add(col('#6b6f73'),boxG(1.8,0.12,0.12),0,h-0.6,0,0,{noShadow:true}); bin.add(col('#6b6f73'),boxG(1.4,0.1,0.1),0,h-1.2,0,0,{noShadow:true});
    for(const s of [-0.75,0,0.75]) bin.add(col('#e6e3de'),new THREE.CylinderGeometry(0.05,0.05,0.16,6),s,h-0.48,0,0,{noShadow:true});
    if(o.transformer) bin.add(col('#8f969c',{metalness:0.4,roughness:0.5}),new THREE.CylinderGeometry(0.35,0.35,0.9,12),0.42,h-2.4,0);
    bin.add(col('#2b2b2b'),boxG(0.36,0.06,0.36),0,2.4,0,0,{noShadow:true}); // 黃黑反光帶
    bin.add(M('poleStripe',()=>std({map:tex('pstripe',32,64,(x,w,hh)=>{ for(let i=0;i<8;i++){ x.fillStyle=i%2?'#2b2b2b':'#e8c23a'; x.fillRect(0,i*8,w,8); } })})),new THREE.CylinderGeometry(0.175,0.18,1.2,10,1,true),0,0.6,0,0,{noShadow:true});
    let lampHead=null; if(o.arm){ const ax=o.armDir||1; bin.add(col('#7d8286',{metalness:0.5,roughness:0.4}),boxG(1.9,0.07,0.07),ax*0.95,6.2,0,0,{noShadow:true}); bin.add(col('#7d8286',{metalness:0.5,roughness:0.4}),boxG(0.07,0.6,0.07),ax*0.1,5.95,0,0,{noShadow:true}); bin.add(col('#5b6064',{metalness:0.5,roughness:0.45}),boxG(0.62,0.12,0.28),ax*1.9,6.16,0,0,{noShadow:true}); lampHead={x:ax*1.9,y:6.08,z:0}; bin.add(glowMat('lampLens',radialTex('lens','#ffffff','#ffe0a0'),{nightI:2.2}),boxG(0.5,0.03,0.2),ax*1.9,6.09,0,0,{noShadow:true}); }
    if(o.sign){ // 路牌（藍底白字）
      bin.add(M('rs'+o.sign,()=>std({map:signTex(o.sign,{bg:'#1f4e8c',color:'#ffffff',border:'#ffffff',size:64})})),boxG(1.3,0.32,0.04),0.6,3.3,0,0,{noShadow:true}); bin.add(col('#6b6f73'),boxG(0.08,0.4,0.08),0.08,3.3,0,0,{noShadow:true}); }
    bin.build(g); g.userData.top={x:0,y:h-0.48,z:0}; g.userData.lamp=lampHead; return g; }
  // 轉角反光鏡（橘色柱＋凸面鏡）
  function trafficMirror(){ const g=new THREE.Group(); const bin=new Bin(); bin.add(col('#e07a2a'),new THREE.CylinderGeometry(0.05,0.05,3.2,8),0,1.6,0); bin.add(col('#e07a2a'),new THREE.TorusGeometry(0.42,0.05,6,20),0,3.3,0.12,0,{noShadow:true}); const mir=new THREE.CircleGeometry(0.4,20); bin.add(M('mirror',()=>std({color:0xd8e2ea,metalness:0.9,roughness:0.12})),mir,0,3.3,0.13,0,{noShadow:true}); bin.add(col('#2b2b2b'),new THREE.CircleGeometry(0.42,20),0,3.3,0.1,Math.PI,{noShadow:true}); bin.build(g); return g; }
  // 機車（台灣常見速克達）：側面輪廓擠出＋輪子＋把手＋後照鏡
  function scooter(color){ const g=new THREE.Group(); const bin=new Bin(); const sh=new THREE.Shape(); sh.moveTo(-0.72,0.32); sh.lineTo(-0.78,0.55); sh.quadraticCurveTo(-0.7,0.8,-0.35,0.82); sh.lineTo(0.12,0.8); sh.lineTo(0.2,0.42); sh.lineTo(0.38,0.42); sh.quadraticCurveTo(0.55,0.9,0.6,1.05); sh.lineTo(0.72,1.02); sh.quadraticCurveTo(0.7,0.6,0.62,0.32); sh.lineTo(-0.72,0.32);
    const body=new THREE.ExtrudeGeometry(sh,{depth:0.42,bevelEnabled:true,bevelThickness:0.04,bevelSize:0.04,bevelSegments:2,curveSegments:8}); body.translate(0,0,-0.21); body.rotateY(-Math.PI/2);
    bin.add(col(color,{roughness:0.35,metalness:0.2}),body,0,0,0); bin.add(col('#2b2b2b',{roughness:0.6}),boxG(0.34,0.1,0.62),0,0.88,-0.32); // 座墊
    for(const zz of [-0.62,0.6]){ bin.add(col('#1e1e1e',{roughness:0.8}),new THREE.TorusGeometry(0.2,0.075,8,16),0,0.24,zz,Math.PI/2); bin.add(col('#9aa0a6',{metalness:0.7,roughness:0.3}),new THREE.CylinderGeometry(0.11,0.11,0.1,10),0,0.24,zz,0,{rz:Math.PI/2,noShadow:true}); }
    bin.add(col('#3a3d42'),boxG(0.62,0.05,0.05),0,1.12,0.66,0,{noShadow:true}); for(const s of [-1,1]){ bin.add(col('#3a3d42'),boxG(0.02,0.2,0.02),s*0.25,1.24,0.66,0,{noShadow:true}); bin.add(col('#cfd6dc',{metalness:0.8,roughness:0.15}),new THREE.CircleGeometry(0.06,10),s*0.27,1.36,0.67,0,{noShadow:true}); }
    bin.add(glowMat('headlamp',radialTex('hl','#ffffff','#fff3c0'),{nightI:0.5}),new THREE.CircleGeometry(0.07,10),0,0.98,0.76,0,{noShadow:true}); bin.add(glowMat('taillamp',radialTex('tl','#ff6a5a','#a01a10'),{nightI:0.5}),boxG(0.18,0.06,0.03),0,0.62,-0.82,0,{noShadow:true});
    bin.add(col('#f4f1ea'),boxG(0.22,0.12,0.01),0,0.45,-0.84,0,{noShadow:true});
    bin.build(g); return g; }
  // 盆栽群（住家門口常見的一排盆栽、保麗龍箱種菜）
  function pots(n,seed){ const g=new THREE.Group(); const bin=new Bin(); const potC=['#a8573a','#8f9399','#e6e3de','#5a4636']; const leaf=['#5f9a5e','#4f8a4e','#7aa860','#3f7a4a']; let x=0; for(let i=0;i<n;i++){ const r=0.12+rnd()*0.16, h=0.18+rnd()*0.3; if(rnd()<0.25){ bin.add(col('#f4f4f2'),boxG(0.5,0.28,0.35),x+0.25,0.14,0); bin.add(col(leaf[i%4]),boxG(0.46,0.12,0.3),x+0.25,0.33,0,0,{noShadow:true}); x+=0.55; continue; } bin.add(col(potC[(i+(seed||0))%4]),new THREE.CylinderGeometry(r,r*0.75,h,10),x+r,h/2,(rnd()-0.5)*0.2); const big=rnd()<0.35; plantClump(bin,x+r,h-0.05,0,big?0.9+rnd()*0.5:0.45+r*1.4,big?6:4); x+=r*2+0.05; } bin.build(g); g.userData.len=x; return g; }
  // 郵筒（綠：限時、紅：普通）
  function mailbox(){ const g=new THREE.Group(); const bin=new Bin(); for(const [s,c] of [[-0.3,'#2f7d4a'],[0.3,'#c0392b']]){ bin.add(col(c,{roughness:0.5}),boxG(0.5,1.0,0.45),s,0.55,0); bin.add(col(c,{roughness:0.5}),new THREE.CylinderGeometry(0.25,0.25,0.45,12,1,false,0,Math.PI),s,1.05,0,0,{rx:Math.PI/2,rz:Math.PI/2}); bin.add(col('#2b2b2b'),boxG(0.3,0.05,0.02),s,0.85,0.23,0,{noShadow:true}); } bin.build(g); return g; }
  // 路面：柏油＋白邊線＋排水溝＋人孔＋「慢」字
  function road(len,width,o){ o=o||{}; const g=new THREE.Group(); const at=asphaltTex().clone(); at.needsUpdate=true; at.repeat.set(len/8,width/8); const m=new THREE.Mesh(new THREE.PlaneGeometry(len,width),std({map:at,roughness:0.95})); m.rotation.x=-Math.PI/2; m.receiveShadow=true; g.add(m);
    const bin=new Bin(); const white=col('#e8e6e0',{roughness:0.8}); for(const s of [-1,1]) bin.add(white,planeG(len,0.12),0,0.012,s*(width/2-0.5),0,{rx:-Math.PI/2,noShadow:true});
    const gt=grateTex(); const gm=M('grate',()=>std({map:gt,roughness:0.7,metalness:0.4})); for(const s of [-1,1]){ const gg=planeG(len,0.32,[0,0,len/0.5,1]); bin.add(gm,gg,0,0.008,s*(width/2-0.18),0,{rx:-Math.PI/2,noShadow:true}); }
    for(const p of (o.manholes||[])) bin.add(M('manhole',()=>std({map:tex('manhole',64,64,(x,w,h)=>{ x.fillStyle='#3a3936'; x.beginPath(); x.arc(32,32,31,0,7); x.fill(); x.strokeStyle='#55534f'; x.lineWidth=2; for(let i=6;i<30;i+=6){ x.beginPath(); x.arc(32,32,i,0,7); x.stroke(); } },false),transparent:true,alphaTest:0.5,metalness:0.4,roughness:0.6})),planeG(0.8,0.8),p[0],0.01,p[1],0,{rx:-Math.PI/2,noShadow:true});
    for(const p of (o.slow||[])) bin.add(M('slow',()=>std({map:tex('slowtxt',128,128,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(240,238,232,0.92)'; x.font='bold 110px "Noto Sans TC",sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('慢',64,68); },false),transparent:true,alphaTest:0.3,roughness:0.8})),planeG(1.6,2.6),p[0],0.013,p[1],p[2]||0,{rx:-Math.PI/2,noShadow:true});
    bin.build(g); return g; }
  function sidewalk(len,width,color){ const t=sidewalkTex(color||'#a49a8e').clone(); t.needsUpdate=true; t.repeat.set(len/2,width/2); const m=new THREE.Mesh(new THREE.BoxGeometry(len,0.12,width),std({map:t,roughness:0.9})); m.position.y=0.06; m.receiveShadow=true; return m; }
  // 地面光暈（路燈照到的地方）：夜間顯示
  function lightPool(r,color){ const m=new THREE.Mesh(new THREE.CircleGeometry(r,24),new THREE.MeshBasicMaterial({map:radialTex('pool'+color,color,'rgba(0,0,0,0)'),transparent:true,opacity:0.0,depthWrite:false,blending:THREE.AdditiveBlending})); m.rotation.x=-Math.PI/2; m.position.y=0.03; m.userData.poolMax=0.55; return m; }
  // 電線：兩點之間的下垂曲線（細線，夜裡也看得到剪影）
  function wires(pairs){ const pos=[]; for(const [a,b,sag] of pairs){ const N=14; for(let i=0;i<N;i++){ const t0=i/N, t1=(i+1)/N; const p0=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0-(sag||0.6)*4*t0*(1-t0),a[2]+(b[2]-a[2])*t0]; const p1=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1-(sag||0.6)*4*t1*(1-t1),a[2]+(b[2]-a[2])*t1]; pos.push(...p0,...p1); } } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); return new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x26282a,transparent:true,opacity:0.85})); }
  // 立牌（黑板 A 字架）
  function aBoard(lines){ const g=new THREE.Group(); const bin=new Bin(); const t=tex('ab'+lines.join(),128,160,(x,w,h)=>{ x.fillStyle='#2e3a33'; x.fillRect(0,0,w,h); x.strokeStyle='#8a6a48'; x.lineWidth=8; x.strokeRect(4,4,w-8,h-8); x.fillStyle='#f4ead8'; x.font='bold 18px "Noto Sans TC",sans-serif'; x.textAlign='center'; lines.forEach((l,i)=>x.fillText(l,w/2,34+i*28)); },false); const m=M('ab'+lines.join(),()=>std({map:t})); for(const s of [-1,1]) bin.add(m,boxG(0.5,0.75,0.03),0,0.4,s*0.12,s>0?0:Math.PI,{rx:-0.2}); bin.build(g); return g; }

  // 夜間：所有 emissive 材質、光暈、點光源一起調
  function setNight(k){ for(const m of nightMats){ m.emissiveIntensity=(m.userData.dayI||0)*(1-k)+(m.userData.nightI||1)*k; } for(const sp of nightSprites){ const o=sp.userData.dayO*(1-k)+sp.userData.nightO*k; sp.material.opacity=o; sp.visible=o>0.02; } }
  return {tex,tileTex,mosaicTex,plasterTex,Bin,boxG,planeG,col:colMat,paint:col,M,std,tree,royalPalm,glowMat,plantClump,glowSprite,apartment,japaneseHouse,wall,utilityPole,trafficMirror,scooter,pots,mailbox,road,sidewalk,lightPool,wires,aBoard,signTex,interiorTex,setNight,nightMats,rnd};
})();
