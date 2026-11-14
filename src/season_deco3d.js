/* 季節、節日的布置（LIFE-DETAILS-SEASONAL-1110，X317；LAWWW2 帳號 A 2026-11-11 第一批）：SD3。
   日期表 src/data/season_deco.js（SEASON_DECO）；模型 season_<區域>.glb 的節點 SEASON_<代號>_on（街景模型不動）。
   做法和溫州街小公園的杜鵑、楓香一樣（zones3d.js wzParkSeason）：進區域時照遊戲日期決定——
     SD3.on(代號, day)＝這一天這一組要不要顯示；SD3.active(區域, day)＝這一區今天要顯示的代號；
     那一天一組都沒有 → 不載入模型（平常日沒有任何成本）；有 → 載入、照代號顯示／隱藏、掛進區域的群組。
   布置都貼在門面上（春聯、花圈、燈串）：不佔地、不擋導航、沒有互動點。接法＝包住區域的 build（和 tz_shops3d.js 的 hookOut、flower_notes3d.js 同一個做法；不改 zones3d.js）。
   第三批（11-11，LAWWW 08:10 同意的做法）：有落地的東西了——
     ctx＝進區域那一刻的天氣、時間（GAME.G.weather／hour，沒有就 E 的）：規則可以寫 weather:'rain'（下雨天的傘架、地墊）、hours:[17,23]（中秋晚上的烤肉架）；
     blocks：那一組今天要顯示，就在區域建好的當下（玩家站上去以前）把 [x0,x1,z0,z1] 擋起來；模型載不到就把這一次擋的格子放回去（不留看不見的牆）；
     looks：看的互動點。hidden:true 的先不放進 E.interactables（還沒有 AA 的字；LAWWW 接字時把 hidden 拿掉），只記在 z.seasonLooks。
     stalls（季節攤販 A1～A6）：今天擺的那幾攤記在 z.seasonStalls（key、攤販、客人站的位置）；互動點這裡不放（接夜市那一套，LAWWW 接）。 */
const SD3=(function(){ const S={}; const DAYMS=86400000;
  const DATA=()=>typeof SEASON_DECO!=='undefined'?SEASON_DECO:null;
  S.ctx=function(E){ const G=typeof GAME!=='undefined'&&GAME.G; return {weather:(G&&G.weather)||(E&&E.weather)||null, hour:G&&typeof G.hour==='number'?G.hour:(E&&typeof E.hour==='number'?E.hour:null)}; };
  S.on=function(code,day,ctx){ const D=DATA(), R=D&&D.rules&&D.rules[code]; if(!R) return false;
    if(R.weather) return !!ctx&&ctx.weather===R.weather;   /* 照天氣（不管日期）*/
    if(R.hours){ const h=ctx&&ctx.hour; if(typeof h!=='number'||h<R.hours[0]||h>=R.hours[1]) return false; }
    if(day==null||typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return false; const x=CALENDAR.dateOf(day);
    if(R.unlessFlag){ const G=typeof GAME!=='undefined'&&GAME.G, F=(G&&G.flags)||{}; for(const k of Object.keys(R.unlessFlag)) if(F[k]===R.unlessFlag[k]) return false; }   /* 劇情狀態（例：阿德影印搬走了）*/
    if(R.md||R.mds){ const k=(x.m<10?'0':'')+x.m+'-'+(x.d<10?'0':'')+x.d; return (R.mds||[R.md]).some(r=>{ const a=r[0], b=r[1]; return a<=b?(k>=a&&k<=b):(k>=a||k<=b); }); }
    if(R.termWeek){ const t=CALENDAR.termOf&&CALENDAR.termOf(day); return !!t&&t.week>=R.termWeek[0]&&t.week<=R.termWeek[1]; }   /* 開學第幾週（季節攤販 A6 二手教科書）*/
    if(R.term){ if(!CALENDAR.termOf) return false; const hit=d=>{ const t=CALENDAR.termOf(d); return !!t&&t.exam===R.term; }; if(hit(day)) return true; const bf=R.before|0; return bf>0&&!hit(day)&&hit(day+bf)&&!!CALENDAR.termOf(day); }
    if(R.lunar){ const t=Date.UTC(x.y,x.m-1,x.d); for(const yy of [x.y-1,x.y,x.y+1]){ const Ly=CALENDAR.LUNAR&&CALENDAR.LUNAR[yy], s=Ly&&Ly[R.lunar], m=s&&/^(\d+)-(\d+)-(\d+)$/.exec(s); if(!m) continue;
        const dd=Math.round((t-Date.UTC(+m[1],+m[2]-1,+m[3]))/DAYMS); if(dd>=R.from&&dd<=R.to) return true; } return false; }
    return false; };
  S.active=function(zid,day,ctx){ const D=DATA(), Z=D&&D.zones&&D.zones[zid]; return Z?Z.codes.filter(c=>S.on(c,day,ctx)):[]; };
  /* 導航阻擋：回傳這一次新擋起來的格子（原本就擋著的不算），S.unblock 只放回這些 */
  S.block=function(nav,rects){ if(!nav||!nav.b||!rects||!rects.length) return []; const before=nav.b.slice(); for(const r of rects) nav.blockRect((r[0]+r[1])/2,(r[2]+r[3])/2,r[1]-r[0],r[3]-r[2],0,0);
    const got=[]; for(let i=0;i<nav.b.length;i++) if(nav.b[i]&&!before[i]) got.push(i); nav._cm=null; return got; };
  S.unblock=function(nav,cells){ if(!nav||!cells||!cells.length) return 0; for(const i of cells) nav.b[i]=0; nav._cm=null; return cells.length; };
  S.looks=function(zid,codes){ const D=DATA(), Z=D&&D.zones&&D.zones[zid], L=(Z&&Z.looks)||{}, out=[], seen=new Set(); for(const c of codes) for(const q of (L[c]||[])){ const k=q.id+'@'+q.x+','+q.z; if(seen.has(k)) continue; seen.add(k); out.push(Object.assign({code:c},q)); } return out; };
  /* 模型的節點照代號顯示／隱藏；回傳看到幾個季節節點 */
  /* 會發光的小東西（紅燈籠、聖誕燈串、南瓜燈）：顏色在頂點色。模型匯出以後發光是固定的白色（glTF 的發光不會乘頂點色），遊戲裡紅燈籠變成白的
     （BB／CC 11-11 04:4x 雲端自檢）。載入時把 season_glow 換成不受光的頂點色材質：顏色＝頂點色、白天晚上一樣亮 */
  S.glowFix=function(o){ if(typeof THREE==='undefined'||!THREE.MeshBasicMaterial||!o||!o.material) return false; const arr=Array.isArray(o.material), ms=arr?o.material:[o.material]; let ch=false;
    const out=ms.map(m=>{ if(m&&m.name==='season_glow'&&!m.isMeshBasicMaterial){ ch=true; return S._glowMat||(S._glowMat=new THREE.MeshBasicMaterial({vertexColors:true,name:'season_glow'})); } return m; });
    if(ch) o.material=arr?out:out[0]; return ch; };
  S.apply=function(root,codes){ let n=0; root.traverse(o=>{ const m=/^SEASON_([A-Z0-9]+)_on$/.exec(o.name||''); if(m){ o.visible=codes.indexOf(m[1])>=0; n++; } }); return n; };
  S.day=function(){ const G=typeof GAME!=='undefined'&&GAME.G; return G&&typeof G.day==='number'?G.day:null; };
  S.attach=function(E,z,zid){ const D=DATA(), Z=D&&D.zones[zid]; if(!Z||!z) return null; const codes=S.active(zid,S.day(),S.ctx(E)); z.seasonCodes=codes; z.seasonRoot=null; z.seasonBlocked=[]; z.seasonLooks=[]; z.seasonStalls=((Z.stalls)||[]).filter(q=>codes.includes(q.code));   /* 季節攤販：今天擺的那幾攤（位置、key；「看」「買」接夜市那一套，LAWWW 接）*/
    if(!codes.length||typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[Z.asset]) return null;
    const rects=[]; for(const c of codes) for(const r of ((Z.blocks||{})[c]||[])) rects.push(r); z.seasonBlocked=S.block(z.nav,rects);
    z.seasonLooks=S.looks(zid,codes); if(E&&Array.isArray(E.interactables)) for(const q of z.seasonLooks) if(!q.hidden) E.interactables.push({x:q.x,z:q.z,radius:q.r||1.0,label:q.label,seasonLook:q.id});
    const undo=()=>{ if(E.zone===z) S.unblock(z.nav,z.seasonBlocked); z.seasonBlocked=[]; };
    return ASSETS.loadOne(Z.asset).then(c=>{ if(!c||!c.scene){ undo(); return null; } if(E.zone!==z||!z.group) return null; const root=c.scene.clone(true); root.name='season_'+zid+'_glb'; root.userData.dyn=true;
      root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; S.glowFix(o); } }); S.apply(root,codes); z.group.add(root); z.seasonRoot=root; return root; }).catch(e=>{ console.warn('季節布置模型載入失敗（沒有布置，其他照舊）',e); undo(); return null; }); };
  S.hook=function(){ const D=DATA(); if(!D||typeof Z3==='undefined'||!Z3.ZONES) return 0; let n=0;
    for(const zid of Object.keys(D.zones)){ const zd=Z3.ZONES[zid], Z=D.zones[zid]; if(!zd||zd._sd3) continue;
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&!ASSETS.manifest[Z.asset]) ASSETS.manifest[Z.asset]={url:Z.glb,type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/season_deco.py（wz_street.py --set '+zid+' --season；過年的春聯、橫批、福字、燈籠，聖誕的花圈、燈串、雪花貼紙；字是本作用文泉驛正黑畫的常見吉祥話）',license:'本作；字型 WenQuanYi Zen Hei（GPL v2 with font embedding exception）只用來畫貼圖'};
      const b0=zd.build; zd.build=function(E){ const z=b0.call(this,E); try{ S.attach(E,z,zid); }catch(e){ console.warn('季節布置',e); } return z; }; zd._sd3=true; n++; }
    return n; };
  S.hook(); return S; })();
if(typeof window!=='undefined') window.SD3=SD3;
