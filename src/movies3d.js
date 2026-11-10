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
  const PL=()=>typeof MOVIE_PLOTS!=='undefined'?MOVIE_PLOTS:null;   /* AA_745（src/data/movie_plots.js，tools/movie/import_movie_plots.py 產生）*/
  const LAY=()=>typeof NANYANG_LAYOUT!=='undefined'?NANYANG_LAYOUT:null;
  const ZL='xs_nanyang', ZH='xs_nanyang_hall'; S.ZL=ZL; S.ZH=ZH;
  const ENTER_O={noFade:true,deferStory:true,noAutosave:true};   /* 同 closed2_3d.js：換區域不觸發劇情、不自動存檔（見面演完 INV.meet 自己存）*/
  /* 第一批海報（BB-B 11-10，claude/elegant-brown-fcos7n e4eea1c780；法律系大一那一年 5 段 10 部）。之後的海報到了加進來 */
  S.POSTERS=['m2409a','m2409b','m2411a','m2411b','m2501a','m2501b','m2503a','m2503b','m2505a','m2505b','m2507a','m2507b','m2509a','m2509b','m2511a','m2511b','m2601a','m2601b','m2603a','m2603b','m2605a','m2605b','m2607a','m2607b','m2609a','m2609b','m2611a','m2611b','m2701a','m2701b','m2703a','m2703b','m2705a','m2705b','m2707a','m2707b','m2709a','m2709b','m2711a','m2711b','m2801a','m2801b','m2803a','m2803b','m2805a','m2805b','m2807a','m2807b','m2809a','m2809b','m2811a','m2811b','m2901a','m2901b','m2903a','m2903b','m2905a','m2905b','m2907a','m2907b','m2909a','m2909b','m2911a','m2911b','m3001a','m3001b','m3003a','m3003b','m3005a','m3005b','m3007a','m3007b'];   /* BB 檢查通過、放進 assets/posters 的（11-10 17:5x：40 張；片單 72 張，其餘 BB 跟使用者要；使用者：「等所有電影海報都放進去，才發佈最新版」X314）*/
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
  S.choose=function(G,who,day){ const p=S.billAt(G,day); if(!p) return null; const key=S.sceneKey(S.preview(G,who)), R=S.rule(who,key), r=S.pickFrom(p.bill,who,R);
    const a=S.pickAdj(p.bill,who,r.film,R); return {id:a.film.id,key,ok:a.film===r.film?r.ok:S.fitsRule(a.film,R,p.bill),say:a.say||null,forced:!!a.forced}; };
  /* AA_745 v2：with.kind 'pick'＝她一定挑這部（lines＝她答應時說的）；'skip'＝她不看（舊稿 m2801b 把「一定挑」寫在 skip＋need 的照舊認）。
     AA_745 with.skip（AA 11-10 20:11）：她不看的片（子晴不看黑白片）＝選到那一部就換同一段的另一部，她說 lines（不是拒絕、不扣好感，約好的那一筆存換過的片）；
     她一定挑的片（子晴《貓咪咖啡館的星期三》《第八關》、芷若《黑白的城市》——芷若那一部只在 AA_708 那一場沒指定片的時候）＝那一段約她一定是這部（有 lines＝她答應時說的）*/
  S.pickAdj=function(bill,who,film,R){ const P=PL(), K=(P&&P.pick)||{}, rule=id=>(K[id]||{})[who]||null, line=id=>{ const x=S.withOf(id,who); return x&&(x.kind==='skip'||x.kind==='pick')&&Array.isArray(x.lines)&&x.lines.length?x.lines.slice():null; };   /* 只有 skip 欄的 lines 是約的時候說的（芷若、子晴《第八關》的 with 是散場後、之後的訊息）*/
    const f=bill.find(b=>{ const k=rule(b.id); return k&&k.mode==='force'&&!(k.noRule&&R); }); if(f) return {film:f,say:line(f.id)||null,forced:true};   /* 她一定挑的片：本來就選到這部也說她那幾句（BB 11-10：原本只有換片的時候才說，選到同一部＝播一般的答應句）*/
    const k=rule(film.id); if(k&&k.mode==='skip'){ const o=bill.find(b=>b!==film&&!((rule(b.id)||{}).mode==='skip')); if(o) return {film:o,say:line(film.id)}; }
    return {film}; };
  S.ensure=function(G,iv){ if(!iv||iv.place!==ZL) return null; if(iv.film&&S.film(iv.film)) return iv.film; const c=S.choose(G,iv.who); if(c){ iv.film=c.id; if(c.say&&iv.by==='player'){ iv.filmSay=c.say; if(c.forced) iv.filmForced=true; } } return iv.film||null; };   /* filmForced：她指定的片——她那幾句取代一般的答應句（invites3d.js）*/   /* filmSay：約的時候她換片的那一句（玩家約她的才有；她自己約的就是她挑的）*/
  /* 約的時候她說換片那一句（約的選單答應以後；電話約、別的路徑約的＝見面時先說）。說完就拿掉 */
  S.sayPick=async function(GM,iv,who){ if(!iv||!Array.isArray(iv.filmSay)||!iv.filmSay.length) return false; const L=iv.filmSay; delete iv.filmSay; delete iv.filmForced; for(const t of L) await S.sayLine(GM,who,t); return true; };
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
      /* 淺色底的海報白字看不見（BB 11-10 19:15 P2，cc-testing shots/poster_all72.jpg：m2801b、m2809b、m3007b、m2611a、m2509b、m2601a）：
         先畫深色描邊（3 px 寬的外框＝lineWidth 6，圓角）＋陰影，再填字；72 張一樣處理，不一張一張調 */
      x.lineJoin='round'; x.miterLimit=2; x.shadowColor='rgba(0,0,0,0.6)'; x.shadowBlur=8; x.lineWidth=Math.max(4,Math.round(fs/10)); x.strokeStyle='rgba(0,0,0,0.72)'; if(x.strokeText) x.strokeText(title,256,96);
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
    const L=LAY()&&LAY().lobby, ch=L&&(L.interact||[]).find(q=>q.kind==='chalk'); if(ch&&E&&E.interactables) E.interactables.push({x:ch.x,z:ch.z,radius:0.9,lv:0,label:ch.label||'看今日放映',movieBoard:true});
    const po=L&&(L.interact||[]).find(q=>q.kind==='posters'); if(po&&PL()&&E&&E.interactables) E.interactables.push({x:po.x,z:po.z,radius:0.9,lv:0,label:'看這部在演什麼',movieInfo:true}); };   /* 海報牆（AA_745 plot：手機「電影」那一頁、海報牆「看這部在演什麼」）*/
  S.decorHall=function(E,z){ const L=LAY()&&LAY().hall, sc=L&&L.screen; S._scr=null; if(!z||!z.group||!sc) return; const h=sc.h-0.2, w=h*2/3;
    S._scr={z,w,h,x:sc.x,y:sc.y+sc.h/2,zz:sc.z+0.01,mesh:null}; S.showScreen(S.nowFilm); };
  S.showScreen=function(id){ const s=S._scr; if(!s) return false; const G=typeof GAME!=='undefined'&&GAME.G?GAME.G:null, p=S.billAt(G), fid=id||(p&&p.bill[0].id);
    if(s.mesh&&s.mesh.userData.poster===fid) return true; if(s.mesh&&s.mesh.parent) s.mesh.parent.remove(s.mesh); s.mesh=null;
    const m=S.posterMesh(fid,s.w,s.h,true); if(!m) return false; m.position.set(s.x,s.y,s.zz); s.z.group.add(m); s.mesh=m; return true; };
  /* 黑板「看今日放映」：nowBoard，接著兩部各一句（片名＋類型＋AA 寫的一句話）*/
  S.boardLines=function(G){ const p=S.billAt(G); if(!p) return []; return [S.board(G)].concat(p.bill.map((b,j)=>'①②'[j]+'《'+b.title+'》（'+b.genre+'）'+b.line)); };
  S.boardLook=async function(GM){ const L=S.boardLines(GM.G); if(!L.length) return false; if(GM.sceneBegin) GM.sceneBegin(); try{ for(const t of L) await GM.say(null,t); } finally { if(GM.sceneEnd) GM.sceneEnd(); } return true; };
  /* ---------- AA_745：每部片的情節、那一幕、散場聊什麼、和誰看多出來的（MOVIE-TALK-1110；使用者 X324）----------
     使用者 11-10 20:0x（對 AA）：「所有的電影……你要認真寫電影的情節，然後會影響劇情，跟誰看對誰有不同影響，但不要每個人都有，這樣會太像一個模板」
     1. plot：大廳海報牆「看這部在演什麼」（看過以前只有第一句，看過＝全部；一個人看、和誰看都算看過）。
     2. scene：看到一半的那一幕——AA_708 那一場有寫自己的 mid（第 N 場）就照 AA_708；輪換（rot）、一般句、她的故事線那幾次＝演這一幕（故事線那一拍照演，接在這一幕後面）。
        with.mid（這部和她看）取代 scene（第一次和她看這部才有）。
     3. talk：散場走出 1 廳以後（散場那一句之後、道別以前）。by：her＝她先問、me／none＝旁白（q）；三個選項；她的回答 re（她、她2、她3＝第一、二、三句；
        沒寫到她＝不加句子，接著照 AA_708 的道別）；fx：fr＝熟悉、信任、自在各加這麼多（在一起活動的加法以外），love＝她的戀愛（npcRom，照現行規則 SOCIAL.romOk）。
        一次看電影只出一次、同一個人一天一次（G.daily.mvTalk_<人>）。
     4. 同一部片和同一個人第二次看：talk 不出、with 不出，改一句旁白（喜劇片／其他片，AA_745 _meta rules 第 2 條）。一個人看：solo 三句中間接兩部的那一幕，沒有 talk。
     5. with：after＝talk 以後多一段（可以有選項，選項的效果只給她）；mid＝取代 scene；later＝之後她傳訊息（msg）、下次見面說（meet，INV.ON_SEATED）、
        接在別的劇情（hook：那一場的接點還沒有＝只記旗標 G.flags.MOVIE_LATER_DUE["片:人"]＝那一天）；skip＝約的時候換片（S.pickAdj）。
        set＝旗標（G.flags[名字]＝那一天）；need、note 裡的條件照匯入工具的對照表（MOVIE_PLOTS.need／cond）。
     存檔：G.flags.MOVIE_SEEN＝{人物 id 或 me:{片 id:那一天}}、G.flags.MOVIE_TALK＝{人物:{片:選第幾個}}、G.flags.MOVIE_LATER＝[{f,w,d}]（下次見面說的）、G.flags.FX_CAP[人]['movie:<片>']＝這部片已經加了多少她的戀愛（舊存檔的 G.flags.MOVIE_LOVE 照讀）、G.flags.MOVIE_FB＝{人:{kind:n}}（fallback 輪到第幾句）；
     舊存檔沒有＝{}（第一次寫的時候建），讀檔不用遷移。測試：node tests/movie_talk_1110_unit.js */
  S.info=id=>{ const P=PL(); return P&&P.films&&id?P.films[id]||null:null; };
  /* override＝AA 之後改的句子（匯入工具的 OVERRIDE 表，寫出處）；不認得的 kind、lines 不是陣列＝當作沒有（不演空的） */
  S.withOf=(id,who)=>{ const f=S.info(id), x=f&&f.with&&f.with[who]||null; if(!x||typeof x!=='object'||!Array.isArray(x.lines)) return null; const o=((PL()||{}).override||{})[id+':'+who]; return o?Object.assign({},x,{lines:o.lines,choice:o.choice}):x; };
  const FL=G=>G.flags||(G.flags={});
  const objOf=(F,k)=>{ let r=F[k]; if(!r||typeof r!=='object'||Array.isArray(r)) r=F[k]={}; return r; };
  S.seenRec=G=>objOf(FL(G),'MOVIE_SEEN');
  S.seenDay=(G,who,id)=>{ const r=G&&G.flags&&G.flags.MOVIE_SEEN, x=r&&typeof r==='object'?r[who]:null; return x&&typeof x==='object'&&x[id]!=null?x[id]:null; };
  S.seenWith=(G,who,id)=>S.seenDay(G,who,id)!=null;
  S.markSeen=(G,who,id)=>{ if(!G||!who||!id) return; const R=S.seenRec(G), r=objOf(R,who); if(r[id]==null) r[id]=G.day; };
  S.firstSentence=t=>{ const s=String(t||''), i=s.indexOf('。'); return i>=0?s.slice(0,i+1):s; };
  S.plotText=(G,id)=>{ const f=S.info(id); if(!f||!f.plot) return null; return S.seenWith(G,'me',id)?f.plot:S.firstSentence(f.plot); };
  const narr=t=>typeof INV!=='undefined'&&INV.narrLine?INV.narrLine(t):/^（.*）$/.test(String(t));
  S.sayLine=async(GM,who,t)=>{ const s=String(t).replace(/\{name\}/g,(GM.G&&GM.G.name)||'祐廷'); if(narr(s)) await GM.say(null,s); else await GM.say(who,s); };
  /* ----- 條件（AA 寫在 need、note 裡的；字 → 條件的對照在匯入工具）----- */
  const frLvl=id=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return 0; const r=SOCIAL.rel(id), n=v=>+v||0; return n(r.fam)>=60&&n(r.trust)>=45&&n(r.comf)>=40?4:(n(r.fam)>=40&&n(r.trust)>=25?3:(n(r.fam)>=20?2:1)); };   /* 友情的階（同 DATE.stageNum 的 fr）：3 朋友、4 好朋友 */
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]);
  const flagOn=(G,f)=>!!(G&&G.flags&&G.flags[f]!=null&&G.flags[f]!==false);
  S.dayOfDate=(y,m,d)=>typeof CALENDAR!=='undefined'&&CALENDAR.tOf?Math.round((Date.UTC(y,m-1,d)-CALENDAR.tOf(1))/864e5)+1:null;
  S.COND=function(G,c,who){ if(!c) return true; const F=(G&&G.flags)||{};
    if(c==='friend') return dating(G,who)||frLvl(who)>=3;
    if(c==='close') return dating(G,who)||frLvl(who)>=4;
    if(c==='dating') return dating(G,who);
    if(c==='intern') return !!(F.INTERN_LEGALAID||F.INTERN_FIRM);   /* 大三暑假去過法扶（C16）或事務所（C17）實習（src/data/vac_activities.js）*/
    if(c==='zrKeep') return dating(G,who)||frLvl(who)>=4;   /* 芷若出國前後一直有聯絡（AA_276 第 2 節交情四級的前兩級）：還沒有那個分級的紀錄，先用交往中或好朋友（待 AA 確認）*/
    if(c==='zrBoring'){ const T=F.MOVIE_TALK&&F.MOVIE_TALK[who]; return !!T&&T.m2511b===2; }   /* 和芷若看《m2511b》那次選的是第三個（「老實說，蠻悶的。」）：《m3007b》她那句「第一部你說很悶。」才說完整 */
    if(c==='kxZq') return false;   /* 可昕和子晴互相認識：遊戲裡沒有兩個 NPC 互相認識的紀錄＝一律照「否則」（句子到「先活過今晚再說。」）*/
    if(c==='giftBookmark'){ const g=F.GIFTH&&F.GIFTH.given&&F.GIFTH.given[who]; return Array.isArray(g)&&typeof GIFTH!=='undefined'&&GIFTH.item?g.some(id=>{ const it=GIFTH.item(id); return !!it&&/書籤/.test(it.name||''); }):false; }   /* 送過她書籤（AA_732 禮物紀錄，src/gifthol3d.js）*/
    let m=/^flag:(\w+)$/.exec(c); if(m) return flagOn(G,m[1]);
    m=/^from:(\d{4})-(\d{2})$/.exec(c); if(m){ const k=S.ym(G); return k!=null&&k>=(+m[1])*100+(+m[2]); }
    m=/^ev:(\w+)$/.exec(c); if(m) return !!(G.events&&G.events.done&&G.events.done[m[1]]);
    m=/^seen:(m\d{4}[ab]):(\w+)$/.exec(c); if(m) return S.seenWith(G,m[2],m[1]);
    return false; };
  S.needOk=function(G,who,x){ if(!x||!x.need) return true; const N=((PL()||{}).need||{})[x.need]; if(!N) return false; if(N.force) return true;
    if(N.stage&&!(dating(G,who)||frLvl(who)>=N.stage)) return false;
    if(N.hourMin!=null&&((+G.hour||0)%24)<N.hourMin) return false;
    if(N.flag&&!flagOn(G,N.flag)) return false;
    if(N.psLink){ const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(who,G):null; if(!(dating(G,who)||(pr&&pr.lost===false&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,who))))) return false; }   /* 交往中，或重聚以前已經重新聯絡上（AA_282：presence 的 lost）*/
    return true; };
  /* ----- talk：這部片、這個人的三個選項（note 的條件套上去）----- */
  /* reBy（AA_745 m3007b）：這個選項她的句子照「之前另一部片那次 talk 選了哪一個」整句換（MOVIE_PLOTS.reBy[片][第幾個選項]＝{film, by:{當時選第幾個:稿上 reBy 的那一格}}；
     對照表在匯入工具的 REBY）。當時沒有 talk 的紀錄（那次沒聊到、舊存檔）＝照稿上原本的 re */
  S.reOf=function(G,who,id,o,k){ const re=o.re||{}, M=(((PL()||{}).reBy||{})[id]||{})[String(k)]; if(!M||!o.reBy) return re;
    const T=G&&G.flags&&G.flags.MOVIE_TALK&&G.flags.MOVIE_TALK[who], was=T&&typeof T==='object'?T[M.film]:null, alt=was!=null?o.reBy[(M.by||{})[String(was)]]:null;
    return alt&&typeof alt==='object'?Object.assign({},re,alt):re; };
  S.reLines=function(G,who,id,o,k){ const re=S.reOf(G,who,id,o,k), C=((PL()||{}).cond||{})[id]||{}, CR=C.re||{}, out=[];
    for(const key of [who,who+'2',who+'3']){ let t=re[key]; if(typeof t!=='string'||!t.trim()) continue; const c=CR[key];
      if(c&&(c.opt==null||+c.opt===k)){
        if(c.sub){ const T=objOf(objOf(FL(G),'MOVIE_TALK'),who), was=T[c.sub.film], to=was!=null?(c.sub.by||{})[String(was)]:null; if(to) t=t.replace(c.sub.from,to); }
        if(c.dating&&dating(G,who)) t=c.dating;
        else if(c.if&&!S.COND(G,c.if,who)){ if(c.cut){ const i=t.indexOf(c.cut); if(i>=0) t=t.slice(0,i+c.cut.length); } else if(c.else) t=c.else; else continue; } }
      out.push(t); }
    return out; };
  /* ----- 沒有專屬回答時她怎麼回（AA_745_fallback；MOVIE-FALLBACK-1110）-----
     現在關著（S.CFG.fallback＝false；LAWWW 11-10：BB_311 審稿中，AA 還在改 fallback 的句子和 kind 的分類——機制和匯入先做好，稿定了：白名單加 AA_745_fallback.json、重匯、這裡改 true）。
     關著＝和原本一樣：這部片稿上完全沒寫到她＝不問，直接道別；ask 的選項照出。
     開了以後：她在選的那個選項沒有專屬的 re＝照那個選項的 kind 拿 MOVIE_PLOTS.fallback[她][kind] 的下一句（re＋fx）；每個人、每個 kind 各一個計數
     （G.flags.MOVIE_FB＝{人:{kind:已經用了幾句}}，選了才往後數＝同一句不會連續兩次出現；舊存檔沒有＝從第一句）；kind 是 ask 而她沒有專屬的 re＝不出這個選項；
     有專屬的 re 照專屬的；選項自己有她的 fx 照選項的。剩不到兩個選項＝不問（保險）。 */
  S.CFG={fallback:false};
  S.fbOn=who=>{ const P=PL(), F=P&&P.fallback; return !!(S.CFG.fallback&&F&&F[who]&&typeof F[who]==='object'); };
  S.hasRe=(o,who)=>{ const re=(o&&o.re)||{}; return [who,who+'2',who+'3'].some(k=>typeof re[k]==='string'&&re[k].trim()); };
  S.fbN=(G,who,kind)=>{ const R=G&&G.flags&&G.flags.MOVIE_FB, x=R&&typeof R==='object'?R[who]:null; return x&&typeof x==='object'?Math.max(0,x[kind]|0):0; };
  S.fbPeek=function(G,who,kind){ const L=kind&&S.fbOn(who)?PL().fallback[who][kind]:null; if(!Array.isArray(L)) return null; const OK=L.filter(e=>e&&(typeof e.re==='string'||Array.isArray(e.re))); return OK.length?OK[S.fbN(G,who,kind)%OK.length]:null; };
  S.fbLines=e=>[].concat(e.re).filter(t=>typeof t==='string'&&t.trim());
  S.fbUse=(G,who,kind)=>{ const R=objOf(objOf(FL(G),'MOVIE_FB'),who); R[kind]=(R[kind]|0)+1; };
  S.talkFor=function(G,who,id){ const f=S.info(id); if(!f||!f.talk) return null; const T=f.talk, C=((PL()||{}).cond||{})[id]||{}, CO=C.opt||{}, opts=[], FB=S.fbOn(who);
    (T.opts||[]).forEach((o,k)=>{ const c=CO[String(k)]; if(c&&!S.COND(G,c.if,who)){ if(c.else) opts.push({k,t:c.else.t,lines:[],fx:c.else.fx||{},set:null}); return; }
      const own=S.hasRe(o,who), kind=o.kind||null;
      if(FB&&!own){ if(kind==='ask') return;   /* 直接問她、講到她的選項：她沒有專屬的回答＝不出這個選項 */
        const e=S.fbPeek(G,who,kind); if(e){ opts.push({k,t:o.t,lines:S.fbLines(e),fx:(o.fx||{})[who]||e.fx||null,set:o.set||null,fb:kind}); return; } }
      opts.push({k,t:o.t,lines:S.reLines(G,who,id,o,k),fx:(o.fx||{})[who]||null,set:o.set||null}); });
    const noQ=((PL()||{}).noQ||[]).includes(id)||typeof T.q!=='string'||!T.q.trim();   /* noQ＝稿上 q 那一格寫的是給程式的說明（匯入工具的 NOQ 表）：不說 */
    const OK=opts.filter(o=>typeof o.t==='string'&&o.t.trim());
    /* 這部片稿上完全沒寫到她（三個選項都沒有她的回答、也沒有她的效果）＝不問，直接照 AA_708 的道別（BB 11-10：原本選項照出、選了什麼都沒發生）*/
    if(FB){ if(OK.length<2) return null; }   /* fallback 開著：每個選項都有她的回答；剩不到兩個＝不問 */
    else if(!OK.some(o=>(o.lines&&o.lines.length)||S.fxHas(o.fx))) return null;
    return {by:T.by,q:noQ?null:T.q,opts:OK}; };
  S.fxHas=fx=>!!fx&&typeof fx==='object'&&(!!Math.trunc(+fx.fr||0)||!!Math.trunc(+fx.love||0));
  /* 稿上沒有 talk 的片×人（給 AA 看缺口）：people 不給＝可以攻略的七位。條件用空的存檔算（要條件才有的句子不算） */
  S.noTalkPairs=function(people){ const P=PL(); if(!P) return []; const G0={flags:{},day:0,hour:0}, out=[]; for(const id of Object.keys(P.films)) for(const w of (people||['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'])){
      if(S.fbOn(w)){ if(!S.talkFor(G0,w,id)) out.push(id+':'+w); continue; }   /* fallback 開著：照實際會不會問算 */
      const o=(P.films[id].talk||{}).opts||[]; if(!o.some(x=>['',2,3].some(n=>typeof (x.re||{})[w+n]==='string')||S.fxHas((x.fx||{})[w]))) out.push(id+':'+w); } return out; };
  /* 效果：fr＝熟悉、信任、自在各 +n；love＝她的戀愛 npcRom（只有可以攻略的對象，SOCIAL.romOk；朋友以下也算，ROM-PRIVATE-DATE-1110 以後的現行規則）*/
  S.fx=function(G,who,fx){ return typeof SOCIAL!=='undefined'&&SOCIAL.applyFx?SOCIAL.applyFx(G,who,fx):null; };   /* 共用 SOCIAL.applyFx（DLG-FX-MECH-1110；0、負的照算）*/
  /* 一次看電影（那部片×那個人：talk＋with 的選項，之後傳訊息／下次見面的那一段也算）她的戀愛最多一共 +2（LAWWW 11-10；扣的不限、也不補回額度）。
     已經拿了多少記在 G.flags.MOVIE_LOVE＝{人:{片:n}}（舊存檔沒有＝0）*/
  /* FX-LOVE-CAP-1110：改用共用的上限（SOCIAL.applyFx 的 cap；鍵 movie:<片>、keep＝不清掉，之後傳訊息／下次見面那一段也算同一次；同一次約的路上選項、AA_708 那一場的選項也用這個鍵，invites3d.js S.fxCap）。
     記在 G.flags.FX_CAP[人]['movie:<片>']；舊存檔記在 G.flags.MOVIE_LOVE 的＝第一次用到時當作已經拿的（base），MOVIE_LOVE 不再寫、也不刪 */
  S.LOVE_CAP=2;
  S.capOf=function(G,who,id){ const R=G&&G.flags&&G.flags.MOVIE_LOVE, x=R&&typeof R==='object'?R[who]:null; return {cap:'movie:'+id,max:S.LOVE_CAP,keep:true,base:x&&typeof x==='object'?Math.max(0,+x[id]||0):0}; };
  S.loveGot=function(G,who,id){ const R=G&&G.flags&&G.flags.FX_CAP, e=R&&R[who]&&R[who]['movie:'+id]; return e&&typeof e==='object'?Math.max(0,+e.n||0):S.capOf(G,who,id).base; };
  S.fxFilm=function(G,who,id,fx){ if(!fx||typeof fx!=='object') return null; if(!id||typeof SOCIAL==='undefined'||!SOCIAL.applyFx) return S.fx(G,who,fx); return SOCIAL.applyFx(G,who,fx,S.capOf(G,who,id)); };
  S.seedOf=(day,id,who)=>{ let h=2166136261; for(const c of String(day)+'|'+id+'|'+who){ h^=c.charCodeAt(0); h=Math.imul(h,16777619)>>>0; } return h; };
  S.shuffle=function(L,seed){ const a=L.slice(); let x=seed>>>0||1; const rnd=()=>{ x^=x<<13; x>>>=0; x^=x>>>17; x^=x<<5; x>>>=0; return x/4294967296; }; for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  S.setFlag=(G,f)=>{ if(f&&typeof f==='string') FL(G)[f]=G.day; };
  S.talk=async function(GM,iv,who){ const G=GM.G, id=iv.film, T=S.talkFor(G,iv.who,id); if(!T||!T.opts.length||!GM.choose) return false;
    if(T.q){ if(T.by==='her'&&!narr(T.q)) await GM.say(who,T.q); else await GM.say(null,T.q); }
    const SH=S.shuffle(T.opts,S.seedOf(G.day,id,iv.who));   /* 三個選項每次看順序不一樣（BB 11-10：最好的那一個有一半排第一個）；同一天同一部同一個人順序固定（讀檔重來一樣），效果跟著選項走 */
    const k=await GM.choose(SH.map(o=>({t:o.t}))); const o=SH[k]||SH[0];
    for(const t of o.lines) await S.sayLine(GM,who,t);
    S.fxFilm(G,iv.who,id,o.fx); S.setFlag(G,o.set); objOf(objOf(FL(G),'MOVIE_TALK'),iv.who)[id]=o.k; if(o.fb) S.fbUse(G,iv.who,o.fb);
    return true; };
  /* ----- with ----- */
  S.withLines=function(G,who,id,x){ let L=(x.lines||[]).slice(); const c=(((PL()||{}).cond||{}).with||{})[id+':'+who];
    if(c){ if(c.line&&L[c.line.i]!=null&&S.COND(G,c.line.if,who)) L[c.line.i]=c.line.text;
      if(c.subs&&c.if&&S.COND(G,c.if,who)) L=L.map(t=>c.subs.reduce((s,[a,b])=>s.split(a).join(b),t)); }
    return L; };
  S.playWith=async function(GM,who,w,id,x){ const G=GM.G; for(const t of S.withLines(G,w,id,x)) await S.sayLine(GM,who,t);
    if(Array.isArray(x.choice)&&x.choice.length&&GM.choose){ const k=await GM.choose(x.choice.map(c=>({t:c.t}))), c=x.choice[k]||x.choice[0];
      for(const t of c.say||[]) await S.sayLine(GM,who,t); S.fxFilm(G,w,id,c.fx); S.setFlag(G,c.set);
      const m=/^\+(\d+) 分鐘$/.exec(c.time||''); if(m&&GM.advance){ if(GM.fade) await GM.fade(true); GM.advance((+m[1])/60); if(GM.fade) await GM.fade(false); } }
    S.setFlag(G,x.set); return true; };
  /* 看到一半：這一次演哪一幕（null＝照 AA_708 第 N 場自己的 mid）*/
  S.midLines=function(G,iv,AX){ if(!G||!iv||iv.place!==ZL||!iv.film||!PL()) return null; if(AX&&AX.k!=null) return null; const f=S.info(iv.film); if(!f) return null;
    const x=S.withOf(iv.film,iv.who); if(x&&x.kind==='mid'&&!S.seenWith(G,iv.who,iv.film)&&S.needOk(G,iv.who,x)) return S.withLines(G,iv.who,iv.film,x);
    return f.scene?[f.scene]:null; };
  S.playMid=async function(GM,who,L){ for(const t of L||[]) await GM.say(narr(t)||!/^（/.test(t)?null:who,t); return true; };   /* 那一幕是旁白（稿上沒有括號）；with.mid 照括號分 */
  /* ----- later ----- */
  const T24=(d,h)=>d*24+h;
  S.laterAt=function(G,L){ if(L.at){ const a=L.at.split('-').map(Number), d=S.dayOfDate(a[0],a[1],a[2]); if(d==null) return null; return d>G.day?{d,h:L.h}:{d:G.day+1,h:L.h}; }
    let d=G.day+(L.d|0), h=L.h; if(T24(d,h)<=T24(G.day,(+G.hour||0)+0.25)) d=G.day+1; return {d,h}; };
  S.msgItems=(w,lines)=>(lines||[]).map(t=>{ const it={th:'p:'+w,from:w,text:t}; if(narr(t)) it.narr=true; return it; });
  S.askOf=(w,id,x)=>({opts:x.choice.map((c,i)=>{ const o={t:c.t,say:S.msgItems(w,c.say),mvx:{w,id,i}}; if(narr(c.t)) o.post=false; return o; })});
  S.pastBefore=(G,L)=>{ if(!L||!L.before) return false; const a=L.before.split('-').map(Number), d=S.dayOfDate(a[0],a[1],a[2]); return d!=null&&G.day>=d; };
  S.fromOk=(G,L)=>!L||!L.from||S.pastBefore(G,{before:L.from});   /* from＝這一天起才演（子晴《m2805b》：她畢業以後）；還沒到＝留著 */
  S.later=function(G,w,id,x){ const P=PL(), L=P&&P.later&&P.later[id+':'+w]; if(!L) return false; const F=FL(G);
    S.setFlag(G,x.set);
    if(L.needFlag&&!flagOn(G,L.needFlag)) return false;
    if(L.stage&&!(dating(G,w)||frLvl(w)>=L.stage)) return false;
    if(!S.needOk(G,w,x)) return false;
    if(L.mode==='hook'){ objOf(F,'MOVIE_LATER_DUE')[id+':'+w]=G.day; return true; }   /* 要接的那一場還沒有接點：只記（之後那一場讀這一筆）*/
    if(L.mode==='meet'&&S.pastBefore(G,L)) return false;   /* 期限已經過了（before 那一天起不演）*/
    if(L.mode==='meet'){ const Q=Array.isArray(F.MOVIE_LATER)?F.MOVIE_LATER:(F.MOVIE_LATER=[]); if(!Q.some(q=>q.f===id&&q.w===w)) Q.push({f:id,w,d:G.day}); return true; }
    if(L.mode!=='msg'||typeof PHONE==='undefined'||!PHONE.at) return false;
    if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,w)) return false;
    const at=S.laterAt(G,L); if(!at) return false; const tag='mv745_'+id+'_'+w, lines=S.withLines(G,w,id,x), ask=Array.isArray(x.choice)&&x.choice.length?S.askOf(w,id,x):null;
    if(L.series){ let ok=false; lines.forEach((t,i)=>{ const it=S.msgItems(w,[t]); if(ask&&i===lines.length-1) it[it.length-1].ask=ask; ok=PHONE.at(G,at.d+i,at.h,it,tag+'_'+i)||ok; }); return ok; }
    const it=S.msgItems(w,lines); if(ask&&it.length) it[it.length-1].ask=ask; return PHONE.at(G,at.d,at.h,it,tag); };
  S.onAnswer=function(G,m,o){ const x=o&&o.mvx; if(!x) return; const W=S.withOf(x.id,x.w), c=W&&W.choice&&W.choice[x.i]; if(!c) return; S.fxFilm(G,x.w,x.id,c.fx); S.setFlag(G,c.set); };
  /* 下次見面說（INV.ON_SEATED）：她的下一次見面（at：地點；days：看完以後幾天內，沒寫＝不限；before：這一天起不演；from：這一天起才演——AA 11-10 20:35、AA_745 第二版）*/
  S.atOk=(at,P)=>{ if(!at) return true; const id=P&&P.id||'', cats=typeof INV!=='undefined'&&INV.catsOf&&P?INV.catsOf(P):[];
    if(at==='library') return /^(library|lawlib|lib_b1|soclib)/.test(id)||/^library/.test(String(P&&P.zone||''));
    if(at==='teahouse') return id==='teahouse'||String(P&&P.zone||'')==='wz_teahouse';
    if(at==='teaOrMeal') return id==='teahouse'||(P&&P.kind==='meal')||cats.includes('meal');
    return false; };
  S.onSeated=async function(GM,iv,who,P){ const G=GM.G, F=(G&&G.flags)||{}, Q=Array.isArray(F.MOVIE_LATER)?F.MOVIE_LATER:null; if(!Q||!Q.length||!iv) return false; const LT=(PL()||{}).later||{};
    for(let i=Q.length-1;i>=0;i--){ const q=Q[i], L=LT[q.f+':'+q.w]; if(!L||(L.days!=null&&G.day-q.d>L.days)||S.pastBefore(G,L)) Q.splice(i,1); }   /* 過了期限＝不說了 */
    const i=Q.findIndex(q=>q.w===iv.who&&G.day>q.d&&S.atOk((LT[q.f+':'+q.w]||{}).at,P)&&S.fromOk(G,LT[q.f+':'+q.w])); if(i<0) return false; const q=Q.splice(i,1)[0], x=S.withOf(q.f,q.w); if(!x) return false;
    await S.playWith(GM,who,q.w,q.f,Object.assign({},x,{set:null})); return true; };   /* set 在看完那天就記了 */
  /* 不在一起看也算（沛珊 2028 夏天《鯨魚唱歌的地方》：你自己或和別人看過以後，她傳訊息）*/
  S.anyView=function(G,id,comp){ const P=PL(); if(!P||!P.later) return; for(const k in P.later){ const L=P.later[k], [f,w]=k.split(':'); if(f!==id||!L.anyView||w===comp) continue; const x=S.withOf(f,w); if(x&&!S.seenWith(G,w,'_any_'+f)){ if(S.later(G,w,f,x)) S.markSeen(G,w,'_any_'+f); } } };
  S.againLine=id=>{ const P=PL(), f=S.film(id); if(!P||!P.again) return null; return f&&/喜劇/.test(f.genre||'')?P.again.comedy:P.again.other; };
  /* 散場以後（走出 1 廳、道別以前）：第二次看＝一句旁白；不然 talk → with.after → with.later；最後記看過 */
  S.after=async function(GM,iv,who){ const G=GM.G; if(!G||!iv||iv.place!==ZL||!iv.film||!PL()||!S.info(iv.film)) return false; const id=iv.film, w=iv.who;
    try{
      if(S.seenWith(G,w,id)){ const t=S.againLine(id); if(t) await GM.say(null,t); return true; }
      const DY=G.daily||(G.daily={}), dk='mvTalk_'+w; if(DY[dk]===G.day) return false; DY[dk]=G.day;
      await S.talk(GM,iv,who);
      const x=S.withOf(id,w);
      if(x&&x.kind==='after'&&S.needOk(G,w,x)) await S.playWith(GM,who,w,id,x);
      else if(x&&x.kind==='mid') S.setFlag(G,x.set);
      else if(x&&x.kind==='later'&&!(PL().later[id+':'+w]||{}).anyView) S.later(G,w,id,x);
      S.anyView(G,id,w);
      return true; }
    finally { S.markSeen(G,w,id); S.markSeen(G,'me',id); } };
  /* 一個人看（AA_730 solo 三句；src/aa614_3d.js S.watch）：第一句、第一部的那一幕、第二句、第二部的那一幕、第三句；兩部都算看過 */
  S.soloPlay=async function(GM){ const G=GM.G, SL=S.soloLines(G), p=S.billAt(G); if(!SL||!SL.length||!p) return false;
    for(let i=0;i<SL.length;i++){ await GM.say(null,SL[i]); const b=p.bill[i], f=b&&S.info(b.id); if(f&&f.scene) await GM.say(null,f.scene); }
    for(const b of p.bill){ S.markSeen(G,'me',b.id); S.anyView(G,b.id,null); } return true; };
  /* 大廳海報牆「看這部在演什麼」：兩部片名＋情節（看過以前只有第一句）*/
  S.infoLines=function(G){ const p=S.billAt(G); if(!p) return []; const out=[]; for(const b of p.bill){ const t=S.plotText(G,b.id); if(t) out.push('《'+b.title+'》'+t); } return out; };
  S.infoLook=async function(GM){ const L=S.infoLines(GM.G); if(!L.length) return false; if(GM.sceneBegin) GM.sceneBegin(); try{ for(const t of L) await GM.say(null,t); } finally { if(GM.sceneEnd) GM.sceneEnd(); } return true; };
  /* ---------- 接線 ---------- */
  if(typeof INV!=='undefined'&&!INV._movies){
    if(INV.accept){ const a0=INV.accept; INV.accept=function(G){ const iv=a0.apply(this,arguments); try{ S.onInvite(G,iv,true); }catch(e){ console.warn('MOVIES.accept',e); } return iv; }; }
    if(INV.offer){ const o0=INV.offer; INV.offer=function(G,who,pid,day,h,text){ const iv=o0.apply(this,arguments); try{ S.onInvite(G,iv,!text); }catch(e){ console.warn('MOVIES.offer',e); } return iv; }; }
    if(INV.ON_SEATED&&!INV.ON_SEATED.includes(S.onSeated)) INV.ON_SEATED.push(S.onSeated);   /* AA_745 with.later 的「下次見面」*/
    INV._movies=true; }
  if(typeof PHONE!=='undefined'&&PHONE.ON_ANSWER&&!PHONE._movies){ PHONE.ON_ANSWER.push((G,m,o)=>{ try{ S.onAnswer(G,m,o); }catch(e){ console.warn('MOVIES.onAnswer',e); } }); PHONE._movies=true; }   /* AA_745 with.later 傳訊息的選項：效果、旗標 */
  if(typeof NY3!=='undefined'&&!NY3._movies){
    if(NY3.lobby&&NY3.lobby.build){ const b0=NY3.lobby.build; NY3.lobby.build=function(E){ const z=b0.apply(this,arguments); try{ S.decorLobby(E,z); }catch(e){ console.warn('MOVIES.decorLobby',e); } return z; }; }
    if(NY3.hall&&NY3.hall.build){ const b1=NY3.hall.build; NY3.hall.build=function(E){ const z=b1.apply(this,arguments); try{ S.decorHall(E,z); }catch(e){ console.warn('MOVIES.decorHall',e); } return z; }; }
    NY3._movies=true; }
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._movies){ const i0=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.movieBoard&&GM&&GM.G) return S.boardLook(GM); if(it&&it.movieInfo&&GM&&GM.G) return S.infoLook(GM); return i0.apply(this,arguments); }; STORY._movies=true; }
  return S;
})();
