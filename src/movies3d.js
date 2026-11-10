/* ===== 南洋戲院：真的進 1 廳看、片單、海報（MOVIE-REAL-1110；USER_WANTS X274）=====
   使用者 11-10 01:1x（對 LAWWW-B）：「約看電影 根本沒進場 還在買票區的椅子上就看完了? 而且應該要有什麼電影的資訊吧 至少你可以規定大幾的幾月到幾月是什麼電影?
   再跟我要電影海報 請AA寫是什麼電影 BB跟我要電影海報」
   片單 AA_730（src/data/nanyang_movies.js，tools/movie/import_nanyang_movies.py 產生；AA 定稿 D109）；海報 BB 照 D97 跟使用者要的第一批 10 張（assets/posters/<id>.webp，圖上沒字、上面四分之一留白給片名）。
   1. 約看電影（INV.meet，地點 xs_nanyang）：在大廳會合（開場句照舊，不先坐大廳的長椅）→ 淡出、一起走進 1 廳、坐在一起（你坐走道那一張、她坐你左手邊那一張）→ 淡入 →
      坐下的句子（AA_708 第 N 場的 seat／AA_649 第 4 節）→ 場燈關掉、燈暗那一句換成 dimTitle（片名）→ 中途那件事 → 場燈打開、散場那一句 → 淡出、走出 1 廳回大廳 → 道別（bye）。
      進不去（不是在大廳開演、沒有 1 廳、換區域失敗）＝照舊在大廳演（不卡住）。
   2. 片單（AA_730 pick）：約的那天落在哪一段（兩個月一段）就是那一段的兩部；挑哪一部照 AA_708 這一次會演的那一場（sceneFilm：want／not／billHas），
      沒寫照 fits（她喜歡的那一部；兩部都是或都不是＝第一部）。約的時候就定（iv.film，跟著存檔），邀約的系統字寫「看《片名》」；
      到了開演那天，那一場和片對不上（中間階段變了）＝這一次照一般句（AA_708 _meta 第 1 條）、下次再演；輪換（rot）對不上＝跳過那一則演別則。
      舊存檔的約（沒有 iv.film）＝開演時才挑。
   3. 大廳：右牆海報燈下面兩張海報＝那一段的兩部（有海報的才貼）；黑板「看今日放映」＝nowBoard＋兩部的一句話。1 廳的銀幕：這一場看的那部（一個人看＝第一部）的海報。
      片名照 AA_730 的 title 由遊戲寫在海報上面那四分之一。
   4. 一個人坐下看（src/aa614_3d.js S.watch）：AA_615 的隨機旁白換成 solo 三句（片名照那一段）。
   選約地點的選單：南洋戲院那一項的說明寫今日放映（nowBoard）。
   測試：node tests/movie_real_1110_unit.js */
'use strict';
const MOVIES=(function(){
  const S={};
  const D=()=>typeof NANYANG_MOVIES!=='undefined'?NANYANG_MOVIES:null;
  const LAY=()=>typeof NANYANG_LAYOUT!=='undefined'?NANYANG_LAYOUT:null;
  const ZL='xs_nanyang', ZH='xs_nanyang_hall'; S.ZL=ZL; S.ZH=ZH;
  const ENTER_O={noFade:true,deferStory:true,noAutosave:true};   /* 同 closed2_3d.js：換區域不觸發劇情、不自動存檔（見面演完 INV.meet 自己存）*/
  /* 第一批海報（BB-B 11-10，claude/elegant-brown-fcos7n e4eea1c780；法律系大一那一年 5 段 10 部）。之後的海報到了加進來 */
  S.POSTERS=['m2409a','m2409b','m2411a','m2411b','m2501a','m2501b','m2503a','m2503b','m2505a','m2505b','m2507a','m2507b','m2509a','m2509b','m2511a','m2511b','m2601a','m2601b','m2603a','m2603b','m2605a','m2605b','m2607a','m2607b','m2609a','m2609b','m2611a','m2611b','m2701a','m2701b','m2703a','m2703b','m2705a','m2705b','m2707a','m2707b','m2709a','m2709b','m2711a','m2711b','m2801a','m2801b','m2803a','m2803b','m2805a','m2805b','m2807a','m2807b','m2809a','m2809b','m2811a','m2811b','m2901a','m2901b','m2903a','m2903b','m2905a','m2905b','m2907a','m2907b','m2909a','m2909b'];   /* BB 檢查通過、放進 assets/posters 的（11-10 17:5x：40 張；片單 72 張，其餘 BB 跟使用者要；使用者：「等所有電影海報都放進去，才發佈最新版」X314）*/
  S.posterUrl=id=>id&&S.POSTERS.includes(id)?'assets/posters/'+id+'.webp':null;
  const ymOf=s=>{ const a=String(s).split('-'); return (+a[0])*100+(+a[1]); };
  S.ym=function(G,day){ const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day!=null?day:(G?G.day:0)):null; return d&&d.y?d.y*100+d.m:null; };
  /* 那一天是哪一段（2024-09 以前＝第一段、2030-08 以後＝最後一段）*/
  S.billAt=function(G,day){ const M=D(); if(!M||!M.periods||!M.periods.length) return null; const P=M.periods, k=S.ym(G,day); if(k==null) return P[0];
    for(const p of P) if(k>=ymOf(p.from)&&k<=ymOf(p.to)) return p; return k<ymOf(P[0].from)?P[0]:P[P.length-1]; };
  S.film=function(id){ const M=D(); if(!M||!id) return null; for(const p of M.periods) for(const b of p.bill) if(b.id===id) return b; return null; };
  S.periodOf=function(id){ const M=D(); if(!M||!id) return null; for(const p of M.periods) if(p.bill.some(b=>b.id===id)) return p; return null; };
  S.fmt=(t,o)=>String(t).replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?o[k]:m);
  S.board=function(G,day){ const M=D(), p=S.billAt(G,day); return M&&p?S.fmt(M.nowBoard,{big:p.bill[0].title,small:p.bill[1].title}):''; };
  S.dimLine=function(G,iv){ const M=D(), f=iv&&S.film(iv.film); return M&&f?S.fmt(M.dimTitle,{title:f.title}):null; };
  S.soloLines=function(G){ const M=D(), p=S.billAt(G); if(!M||!p) return null; return M.solo.map(t=>S.fmt(t,{big:p.bill[0].title,small:p.bill[1].title})); };
  /* ---------- 挑片（AA_730 pick 第 2～5 條）---------- */
  const has=(f,tags)=>!!f&&tags.some(t=>(f.tags||[]).includes(t));
  S.rule=(who,key)=>{ const M=D(); return key&&M&&M.sceneFilm&&M.sceneFilm[who]?M.sceneFilm[who][key]||null:null; };
  S.sceneKey=sc=>!sc||sc.generic?null:(sc.k!=null?String(sc.k):(sc.rot!=null?'rot.'+sc.rot:null));
  S.preview=function(G,who){ if(typeof STUDYN==='undefined'||!STUDYN.act) return null; try{ return STUDYN.act('movie').pick(G,who); }catch(e){ return null; } };   /* 這一次會演 AA_708 movie 的哪一場（pick 不改記錄）*/
  S.fitsRule=function(f,R,bill){ if(!R) return true; if(R.billHas&&!(bill||[]).some(b=>has(b,R.billHas))) return false; if(R.want&&!has(f,R.want)) return false; if(R.not&&has(f,R.not)) return false; return true; };
  const tie=(L,who)=>{ const m=L.filter(b=>(b.fits||[]).includes(who)); return m.length===1?m[0]:L[0]; };   /* fits 只有一部有她＝那一部；兩部都有、都沒有＝第一部 */
  S.pickFrom=function(bill,who,R){ if(R){ const ok=bill.filter(b=>S.fitsRule(b,R,bill)); if(ok.length) return {film:tie(ok,who),ok:true}; return {film:tie(bill,who),ok:false}; } return {film:tie(bill,who),ok:true}; };
  S.choose=function(G,who,day){ const p=S.billAt(G,day); if(!p) return null; const key=S.sceneKey(S.preview(G,who)), r=S.pickFrom(p.bill,who,S.rule(who,key)); return {id:r.film.id,key,ok:r.ok}; };
  S.ensure=function(G,iv){ if(!iv||iv.place!==ZL) return null; if(iv.film&&S.film(iv.film)) return iv.film; const c=S.choose(G,iv.who); if(c) iv.film=c.id; return iv.film||null; };
  /* 開演時：這一場和約好的片對不上＝一般句（null）；輪換對不上＝跳過那一則（AA_730 pick 第 3 條）*/
  S.fitScene=function(G,iv,AX){ if(!AX||AX.generic||!iv) return AX; const f=S.film(iv.film); if(!f) return AX; const bill=(S.periodOf(f.id)||{bill:[f]}).bill;
    const R=S.rule(iv.who,S.sceneKey(AX)); if(S.fitsRule(f,R,bill)) return AX;
    if(AX.rot==null) return null;
    const T=typeof ACTIVITY_SCENES!=='undefined'&&ACTIVITY_SCENES.kinds&&ACTIVITY_SCENES.kinds.movie&&ACTIVITY_SCENES.kinds.movie.people[iv.who], L=(T&&T.rot)||[], F=(G&&G.flags)||{};
    for(let s=1;s<L.length;s++){ const i=(AX.rot+s)%L.length, x=L[i]; if(!x||(x.if&&(F[x.if]==null||F[x.if]===false))) continue; if(S.fitsRule(f,S.rule(iv.who,'rot.'+i),bill)) return Object.assign({rot:i,kind:'movie'},x); }
    return null; };
  /* 邀約的系統字（AA_730 pick 第 5 條「邀約句寫『看《片名》』」）：約好的那一則訊息、約的標籤。她自己傳的那一句（offer 有 text）不動 */
  S.onInvite=function(G,iv,sys){ if(!G||!iv||iv.place!==ZL) return; S.ensure(G,iv); const f=S.film(iv.film); if(!f) return; const see='看《'+f.title+'》';
    if(iv.label&&iv.label.indexOf(see)<0) iv.label+=see;
    if(!sys) return; const m=(G.msgs||[]).slice().reverse().find(q=>q&&q.iv===iv.id); if(!m||typeof m.text!=='string'||m.text.indexOf(see)>=0) return;
    if(m.text.indexOf('看電影')>=0) m.text=m.text.replace('看電影',see); else if(m.text.indexOf('南洋戲院（')>=0) m.text=m.text.replace('南洋戲院（','南洋戲院'+see+'（'); };
  /* ---------- 1 廳 ---------- */
  S.hallOk=GM=>!!(GM&&GM.enter&&typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[ZH]&&LAY()&&LAY().hall&&(LAY().hall.seats||[]).length);
  S.useHall=(GM,G,iv,P)=>!!(G&&iv&&P&&P.id===ZL&&G.zone===ZL&&!iv.ev&&!iv.te&&S.hallOk(GM));
  S.lights=on=>{ if(typeof NY3!=='undefined'&&NY3.houseLights) try{ NY3.houseLights(on); }catch(e){ console.warn('MOVIES.lights',e); } };
  S.ROWS=[4,3,5,2,6,1,7,0,8];   /* 第 5 排先（中間），前後輪流 */
  S.seatPair=function(GM){ const H=LAY().hall, E=GM.E, pitch=(H.seatBlock&&H.seatBlock.pitch)||0.58, zs=(E&&E.zone&&E.zone.seats)||[];
    const taken=(x,z)=>((E&&E.npcs)||[]).some(m=>{ const s=m&&(m.seat||m.seatTarget); return s&&Math.abs(s.x-x)<0.3&&Math.abs(s.z-z)<0.3; });
    for(const r of S.ROWS){ const s=H.seats[r]; if(!s) continue; const hx=+(s.x-pitch).toFixed(3); if(taken(s.x,s.z)||taken(hx,s.z)) continue;
      const me=zs.find(q=>q&&q.kind==='cinema'&&Math.abs(q.x-s.x)<0.05&&Math.abs(q.z-s.z)<0.05)||{kind:'cinema',row:s.row,x:s.x,z:s.z,y:s.y,yaw:s.yaw,lv:0,ap:[s.approach.x,s.approach.z]};
      return {me,her:{kind:'cinema',row:s.row,x:hx,z:s.z,y:s.y,yaw:s.yaw,lv:0,mate:true}}; }
    return null; };
  S.nowFilm=null;   /* 1 廳銀幕上的那一部（約的那一場）；null＝那一段的第一部 */
  /* 換區域用 noFade（畫面已經是黑的）＝game3d.js enter 不等正式模型：這裡照 enter 平常的做法等一下（最多那一區的上限），淡入時不先露出方塊備用模型（PERF-ZONE-POPIN-1103）*/
  const waitZone=async(GM,z)=>{ try{ if(typeof ASSETS!=='undefined'&&ASSETS.waitLoaded&&GM._zoneReq) await ASSETS.waitLoaded(GM._zoneReq,GM.zoneWaitCap?GM.zoneWaitCap(z):3000); if(GM.E&&GM.E.update) GM.E.update(0.016); }catch(e){ console.warn('MOVIES.waitZone',e); } };
  S.enterHall=async function(GM,iv,n){ const G=GM.G, E=GM.E, P=E&&E.player, L=LAY().hall; let m=null, ok=false;
    if(GM.fade) await GM.fade(true);
    try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); if(n&&n.seat&&GM.standUp) GM.standUp(n);
      S.nowFilm=iv.film||null;
      await GM.enter(ZH,Object.assign({lv:0},L.enterAt),ENTER_O);
      if(G.zone!==ZH){ S.nowFilm=null; return null; }
      await waitZone(GM,ZH);
      (G.flags||(G.flags={})).NY_WATCHED=G.day;   /* 今天的票這一場用掉（之後自己坐下不會再看一次；src/aa614_3d.js S.canWatch）*/
      ok=true; S.showScreen(iv.film);
      const pr=S.seatPair(GM), L1=L.enterAt, at=pr?pr.her:{x:L1.x-0.8,z:L1.z,yaw:L1.yaw||0};   /* 整廳坐滿（不會發生：1 廳只有約的人和你）＝站在門口演 */
      m=(GM.npc&&GM.npc[iv.who])||null;
      if(!m&&GM.spawnCharacter) m=GM.spawnCharacter(iv.who,at.x,at.z,{yaw:at.yaw,lv:0});
      if(m&&pr){ m.path=null; m.seatTarget=null; if(GM.sitAt) GM.sitAt(m,pr.her); m.pose=m.idlePose='sit'; m.frozen=true; m.beh='idle'; }
      if(P&&pr&&GM.sitAt) GM.sitAt(P,pr.me); }
    finally { if(GM.fade) await GM.fade(false); }
    return ok?{n:m||n}:null; };   /* null＝沒進去（照舊在大廳演）*/
  S.leaveHall=async function(GM,iv,n){ const G=GM.G, E=GM.E, P=E&&E.player; if(G.zone!==ZH) return n; const out=Object.assign({lv:0},(LAY().lobby||{}).hallOut||{x:2.2,z:-5.2,yaw:0});
    if(GM.fade) await GM.fade(true);
    try{ S.lights(true); if(P&&P.seat&&GM.standUp) GM.standUp(P); if(n&&n.seat&&GM.standUp) GM.standUp(n); S.nowFilm=null;
      await GM.enter(ZL,out,ENTER_O); if(G.zone!==ZL) return n;
      await waitZone(GM,ZL);
      const y=out.yaw||0, sx=+(out.x+Math.cos(y)*0.75).toFixed(3), sz=+(out.z-Math.sin(y)*0.75).toFixed(3);   /* 站在你旁邊（大廳往 1 廳那組門前面）*/
      let m=(GM.npc&&GM.npc[iv.who])||null;
      if(!m&&GM.spawnCharacter) m=GM.spawnCharacter(iv.who,sx,sz,{yaw:y+Math.PI/2,lv:0}); else if(m&&E&&E.placeAt) E.placeAt(m,sx,sz,0);
      if(m){ m.frozen=true; m.beh='idle'; m.path=null; m.pose=m.idlePose='idle'; }
      if(GM.face&&m&&m.obj&&P&&P.obj){ GM.face(m,P.obj.position.x,P.obj.position.z); GM.face(P,sx,sz); }
      return m||n; }
    finally { if(GM.fade) await GM.fade(false); } };
  /* ---------- 海報（片名寫在上面四分之一）---------- */
  const IMG={};
  const canDraw=()=>typeof document!=='undefined'&&typeof document.createElement==='function'&&typeof THREE!=='undefined'&&!!THREE.CanvasTexture&&!!THREE.Mesh&&!!THREE.PlaneGeometry;
  S.drawPoster=function(img,title){ const c=document.createElement('canvas'); c.width=512; c.height=768; const x=c.getContext('2d'); if(!x) return null; x.drawImage(img,0,0,512,768);
    if(title){ let fs=64; x.textAlign='center'; x.textBaseline='middle'; const font=s=>'bold '+s+'px "Noto Serif TC","Noto Sans TC","PingFang TC","Microsoft JhengHei",serif';
      x.font=font(fs); while(fs>28&&x.measureText(title).width>460){ fs-=4; x.font=font(fs); }
      x.shadowColor='rgba(0,0,0,0.75)'; x.shadowBlur=10; x.fillStyle='#fbf6ea'; x.fillText(title,256,96); }
    return c; };
  S.posterMesh=function(id,w,h,lit){ const url=S.posterUrl(id), f=S.film(id); if(!url||!canDraw()) return null;
    const mat=new THREE.MeshBasicMaterial({color:lit?0xffffff:0xddd6ca}), mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); mesh.visible=false; mesh.userData.poster=id; mesh.userData.dyn=true;
    const put=img=>{ const c=S.drawPoster(img,f&&f.title); if(!c) return; const t=new THREE.CanvasTexture(c); if(THREE.SRGBColorSpace) t.colorSpace=THREE.SRGBColorSpace; mat.map=t; mat.needsUpdate=true; mesh.visible=true; };
    const I=IMG[url]; if(I&&I.done) put(I.img); else { const q=I||(IMG[url]={img:new Image(),done:false,wait:[]}); q.wait.push(put); if(!I){ q.img.onload=()=>{ q.done=true; for(const p of q.wait.splice(0)) try{ p(q.img); }catch(e){ console.warn('MOVIES.poster',e); } }; q.img.onerror=()=>console.warn('MOVIES 海報載入失敗',url); q.img.src=url; } }
    return mesh; };
  S.LOBBY_POS=[[4.39,2.05,-4.8],[4.39,2.05,-3.35]];   /* 右牆前兩盞海報燈（nanyang_layout.js lobby.posters z0 −4.8、間距 1.45；牆面 x 4.41～4.5）*/
  S.decorLobby=function(E,z){ const G=typeof GAME!=='undefined'&&GAME.G?GAME.G:null, p=S.billAt(G); if(!z) return;
    if(p&&z.group) p.bill.forEach((b,j)=>{ const at=S.LOBBY_POS[j], m=at?S.posterMesh(b.id,0.8,1.2,false):null; if(!m) return; m.position.set(at[0],at[1],at[2]); m.rotation.y=-Math.PI/2; z.group.add(m); });
    const L=LAY()&&LAY().lobby, ch=L&&(L.interact||[]).find(q=>q.kind==='chalk'); if(ch&&E&&E.interactables) E.interactables.push({x:ch.x,z:ch.z,radius:0.9,lv:0,label:ch.label||'看今日放映',movieBoard:true}); };
  S.decorHall=function(E,z){ const L=LAY()&&LAY().hall, sc=L&&L.screen; S._scr=null; if(!z||!z.group||!sc) return; const h=sc.h-0.2, w=h*2/3;
    S._scr={z,w,h,x:sc.x,y:sc.y+sc.h/2,zz:sc.z+0.01,mesh:null}; S.showScreen(S.nowFilm); };
  S.showScreen=function(id){ const s=S._scr; if(!s) return false; const G=typeof GAME!=='undefined'&&GAME.G?GAME.G:null, p=S.billAt(G), fid=id||(p&&p.bill[0].id);
    if(s.mesh&&s.mesh.userData.poster===fid) return true; if(s.mesh&&s.mesh.parent) s.mesh.parent.remove(s.mesh); s.mesh=null;
    const m=S.posterMesh(fid,s.w,s.h,true); if(!m) return false; m.position.set(s.x,s.y,s.zz); s.z.group.add(m); s.mesh=m; return true; };
  /* 黑板「看今日放映」：nowBoard，接著兩部各一句（片名＋類型＋AA 寫的一句話）*/
  S.boardLines=function(G){ const p=S.billAt(G); if(!p) return []; return [S.board(G)].concat(p.bill.map((b,j)=>'①②'[j]+'《'+b.title+'》（'+b.genre+'）'+b.line)); };
  S.boardLook=async function(GM){ const L=S.boardLines(GM.G); if(!L.length) return false; if(GM.sceneBegin) GM.sceneBegin(); try{ for(const t of L) await GM.say(null,t); } finally { if(GM.sceneEnd) GM.sceneEnd(); } return true; };
  /* ---------- 接線 ---------- */
  if(typeof INV!=='undefined'&&!INV._movies){
    if(INV.accept){ const a0=INV.accept; INV.accept=function(G){ const iv=a0.apply(this,arguments); try{ S.onInvite(G,iv,true); }catch(e){ console.warn('MOVIES.accept',e); } return iv; }; }
    if(INV.offer){ const o0=INV.offer; INV.offer=function(G,who,pid,day,h,text){ const iv=o0.apply(this,arguments); try{ S.onInvite(G,iv,!text); }catch(e){ console.warn('MOVIES.offer',e); } return iv; }; }
    INV._movies=true; }
  if(typeof NY3!=='undefined'&&!NY3._movies){
    if(NY3.lobby&&NY3.lobby.build){ const b0=NY3.lobby.build; NY3.lobby.build=function(E){ const z=b0.apply(this,arguments); try{ S.decorLobby(E,z); }catch(e){ console.warn('MOVIES.decorLobby',e); } return z; }; }
    if(NY3.hall&&NY3.hall.build){ const b1=NY3.hall.build; NY3.hall.build=function(E){ const z=b1.apply(this,arguments); try{ S.decorHall(E,z); }catch(e){ console.warn('MOVIES.decorHall',e); } return z; }; }
    NY3._movies=true; }
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._movies){ const i0=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.movieBoard&&GM&&GM.G) return S.boardLook(GM); return i0.apply(this,arguments); }; STORY._movies=true; }
  return S;
})();
