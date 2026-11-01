/* ===== 社團博覽會照實際（CLUBFAIR-REAL-1027＋CLUBFAIR-HINT-1027；AA_485 第 3 節，企劃線 5aaa71d6a；資料、位置表在 src/data/club_fair.js）=====
   - 日子：activities.js club_expo_y1s1（新局 2025-09-06（六）10:00～16:00；舊局照舊 9/30、10/1）。帳篷照 ACTIVITIES.on 擺（zones3d.js isFairDay）。
   - 攤位（3-3）：位置表上有座標的攤位各一個互動點（帳篷前面）；服務台（博覽會的集合點，classes3d.js S.fairMenu）＝十五攤的選單，還沒有帳篷的攤位從這裡去。
       能加入的五攤：顧攤的人兩句 →「填表」＝加入（CLUB_<id>，照現在）；法服＝第一次是學姊那一段（ev_sis_club_expo，照現在），演過以後學長一句。
       只能看看的十攤：每一攤演一次（G.flags.FAIR_LOOK），之後再點只出招牌名。
   - 顧攤的人（路人模型）站在帳篷後面；人流比平常多（走路的新生、停在攤位前的人）。
   - 路過時顧攤的人喊的話（畫面上方小字，不停下來）；舞台 10:30～15:30，走到前面每種表演一次旁白（G.flags.FAIR_STAGE）。
   - 錯過社博（3-4）：第一次去吉他、辯論、登山、系籃的社課，旁白多一句「（你在門口填了表。）」（包住 CLS.attendActivity；記 CLUB_<id> 照現在由那裡記）。
     法服：萬才館一樓公告欄最後一句改（story3d.js 的 notice:'lawclub'）。
   - 提示（3-5，只給社博在 9/6 週六的局）：9/1 08:00 手機行事曆、9/1～9/5 傅鐘旁的公告欄、9/4 21:00 系學會群組、9/5 21:00 家族群組 Kevin、9/6 起床提示框（包住 CLS.morning）。
   載入順序：classes3d.js、semff3d.js 之後（包住 CLS.attendActivity、CLS.morning）。測試：node tests/clubfair_1027_unit.js */
'use strict';
const CLUBFAIR=(function(){
  const S={};
  const D=()=>typeof CLUB_FAIR!=='undefined'?CLUB_FAIR:null;
  const hr=G=>G.hour%24;
  const law=G=>!!G&&(G.stage||'law')==='law';
  S.expo=()=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list?ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1')||null:null;
  S.today=G=>{ const A=S.expo(); return !!A&&law(G)&&ACTIVITIES.on(A,G.day,G); };   /* 今天有大一的社博 */
  S.open=G=>{ const A=S.expo(); return S.today(G)&&hr(G)>=A.t0&&hr(G)<A.t1; };      /* 攤位開著（10:00～16:00）*/
  /* 這一局大一的社博是哪一天（新局 9/6、舊局 9/30）；hintOn＝社博在週六（提示的句子寫「9/6（六）」）*/
  S.fairDay=function(G){ const A=S.expo(); if(!A||typeof STORY==='undefined'||!STORY.dayOfKey) return null; const keys=[].concat(A.dates||[],A.datesOld||[],A.datesW1||[]);
    const ds=keys.map(k=>STORY.dayOfKey(k)).filter(d=>d!=null&&ACTIVITIES.on(A,d,G)).sort((a,b)=>a-b); return ds.length?ds[0]:null; };
  S.hintOn=G=>{ const d=S.fairDay(G); return law(G)&&d!=null&&typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(d).wd===6; };
  S.booths=()=>(D()&&D().BOOTHS)||[];
  S.byId=id=>S.booths().find(b=>b.id===id)||null;
  S.pos=id=>{ const P=D()&&D().POS; return P&&P[id]?P[id]:null; };
  const staff=b=>({name:'顧攤的'+(b.who||'學長')});
  const clubOf=b=>b&&b.club&&typeof ACTIVITIES!=='undefined'?ACTIVITIES.list.find(q=>q.id===b.club)||null:null;
  const nameOf=b=>{ const c=clubOf(b); return (c&&(c.clubName||c.title))||b.sign; };
  const flags=G=>G.flags||(G.flags={});
  S.lookRec=G=>{ const F=flags(G); if(!F.FAIR_LOOK||typeof F.FAIR_LOOK!=='object') F.FAIR_LOOK={}; return F.FAIR_LOOK; };
  /* ---------- 一攤 ---------- 回傳這一次加入了幾個社團（0／1）*/
  S.booth=async function(GM,id){ const G=GM.G, F=flags(G), b=S.byId(id); if(!b) return 0;
    if(!S.open(G)){ if(GM.caption) GM.caption('',b.sign,2400); return 0; }   /* 收攤以後、還沒開始：只有招牌 */
    { const A=S.expo(); if(A&&!ACTIVITIES.attendedAny(G,A.id,G.day)) ACTIVITIES.markAttended(G,A); }   /* 走到任何一攤＝去過博覽會（出席紀錄，同服務台）*/
    if(b.event){   /* 法服：學姊那一段（照現在）；演過以後學長一句 */
      if(!F.SIS_CLUB_EXPO){ const e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(q=>q.id===b.event):null; if(e&&EVENTS.check(e)){ await EVENTS.run(e); return 1; } if(GM.caption) GM.caption('',b.sign,2400); return 0; }
      GM.sceneBegin(); try{ for(const t of (b.after||[])) await GM.say(staff(b),t); } finally { GM.sceneEnd(); } return 0; }
    if(b.club){ const k='CLUB_'+b.club; let n=0; GM.sceneBegin(); try{
        if(F[k]){ await GM.say(null,'「'+nameOf(b)+'」的表你已經填過了。'); return 0; }
        for(const t of (b.say||[])) await GM.say(staff(b),t);
        const i=await GM.choose([{t:'填表'},{t:'先不要'}]);
        if(i===0){ F[k]=true; F.FAIR_JOIN=true; if(b.club==='lawclub_study') F.lawclub=true; n=1; await GM.say(null,'你在「'+nameOf(b)+'」的攤位填了表。'); }
      } finally { GM.sceneEnd(); }
      if(n&&GM.autosave) GM.autosave(); return n; }
    const L=S.lookRec(G); if(L[b.id]!=null){ if(GM.caption) GM.caption('',b.sign,2400); return 0; }   /* 看過了：只出招牌名 */
    L[b.id]=G.day; GM.sceneBegin(); try{ for(const [k,t] of (b.look||[])) await GM.say(k==='narr'?null:staff(b),t); } finally { GM.sceneEnd(); } return 0; };
  /* ---------- 服務台：十五攤的選單（classes3d.js S.fairMenu 叫這裡）---------- */
  S.menu=async function(GM){ const G=GM.G, F=flags(G), B=S.booths(); let k=-1;
    GM.sceneBegin(); try{ await GM.say(null,'椰影大道上一整排攤位。公告欄貼著今天擺攤的社團。');
      const opts=B.map(b=>{ const c=clubOf(b), j=!!(b.club&&F['CLUB_'+b.club]); return {t:b.sign+(j?'（已加入）':''),hint:c&&typeof CLS!=='undefined'&&CLS.clubWhen?CLS.clubWhen(c):undefined}; }); opts.push({t:'逛完了'});
      k=await GM.choose(opts); } finally { GM.sceneEnd(); }
    if(!(k>=0&&k<B.length)) return 0; return S.booth(GM,B[k].id); };
  /* ---------- 校園：攤位的互動點、顧攤的人、人流、公告欄（STORY.populate 之後）---------- */
  /* 大二的社博（2026-09-12，zones3d.js EXPO_DAYS；祐廷站攤位那一段在 events.js ev_y2_club_expo）：一樣 36 頂、有人顧攤、有人走，攤位不能互動（不是新生了）*/
  S.expoY2=G=>law(G)&&!S.today(G)&&typeof Z3!=='undefined'&&!!Z3.isExpoDay&&!!Z3.isExpoDay();
  /* 顧攤的人照距離藏（FAIR-STAFF-LOD-1027，LAWWW2-C 量：大道往西看中畫質三角形 +48%、模擬 fps −29%，35 m 內才畫：畫面裡 15→4、fps +27%；
     35 m 外的帳篷在手機上只有幾個像素寬）：engine3d.js NPC 距離 LOD 的 n.lodLim，比一般路人短（低畫質本來就 34 m）*/
  S.STAFF_LOD={low:34,medium:35,high:55};
  S.populate=function(zoneId,GM){ if(zoneId!=='campus'||!GM||!GM.E||!GM.G) return; const E=GM.E, G=GM.G, X=D(); if(!X) return;
    const y1=S.today(G), y2=!y1&&S.expoY2(G);
    if(y1||y2){ const A=S.expo();
      if(y1) for(const b of S.booths()){ const p=S.pos(b.id); if(!p) continue;
        E.interactables.push({x:p.x,z:p.z,radius:X.R||1.3,lv:0,label:b.sign,fairBooth:b.id,get hidden(){ return !S.open(GM.G); },onInteract:()=>S.booth(GM,b.id)}); }
      const h=hr(G); if(h>=A.t0-0.5&&h<A.t1&&typeof CHAR!=='undefined'&&CHAR.build&&E.addNPC&&typeof STORY!=='undefined'&&STORY.extraSpec){ const q=E.q&&E.q.level==='low'?0.5:(E.q&&E.q.level==='medium'?0.75:1); let i=0;
        const T=typeof CLUB_FAIR_EXPO!=='undefined'?CLUB_FAIR_EXPO.tents:[]; let nb=0;
        for(const t of T){ if(t.kind==='bg'&&(nb++%4)>=Math.round(4*q)) continue;   /* 顧攤的人：每一頂第一張椅子（帳篷裡 (−0.45, +0.2)），面向帳篷正面；背景攤照畫質少放幾個 */
          const c=Math.cos(t.ry), sn=Math.sin(t.ry), lx=-0.45, lz=0.2; const o=CHAR.build(STORY.extraSpec(400+i++)); o.position.set(t.x+c*lx+sn*lz,0,t.z-sn*lx+c*lz); o.rotation.y=t.ry;
          E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,fairStaff:t.id,lodLim:S.STAFF_LOD}); }
        if(GM.spawnExtra){ const R=X.ROUTES||[], n=Math.max(2,Math.round(8*q)); for(let k=0;k<n&&R.length;k++){ const r=R[k%R.length]; const nn=GM.spawnExtra(STORY.extraSpec(420+k),r.map(p=>[p[0],p[1]])); if(nn) nn.fairCrowd=true; } }   /* 拿著傳單走的新生（大道中間）*/
        for(const [x,z,ry] of (X.FILL||[]).slice(0,q<1?2:3)){ const o=CHAR.build(STORY.extraSpec(440+i++)); o.position.set(x,0,z); o.rotation.y=ry; E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,fairCrowd:true}); } } }   /* 停在攤位前填表的人（站在互動點旁邊，不擋）*/
    else if(S.hintOn(G)){ const d6=S.fairDay(G), B=X.BOARD; if(B&&G.day>=d6-5&&G.day<d6) E.interactables.push({x:B.x,z:B.z,radius:B.r||1.3,lv:0,label:'公告欄',look:X.HINTS.board,fairBoard:true}); } };   /* 9/1～9/5 傅鐘旁的公告欄 */
  /* ---------- 喊話、舞台（STORY.TICKS；不停下來、不擋別的事）---------- */
  let shoutN=0, shoutK=0;
  S.stageAct=function(G){ const X=D(), h=hr(G); if(!X||h<X.STAGE_T[0]||h>=X.STAGE_T[1]) return null; const i=Math.floor((h-X.STAGE_T[0])*2)%X.STAGE_ORDER.length; return X.STAGE_ORDER[i]; };
  S.tick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||G.zone!=='campus'||!S.open(G)||!E||!E.player||!GM.caption) return false; const X=D(), P=E.player.obj.position; if(!X) return false;
    const st=X.STAGE; if(st&&Math.hypot(P.x-st.x,P.z-st.z)<st.r){ const a=S.stageAct(G), F=flags(G), seen=Array.isArray(F.FAIR_STAGE)?F.FAIR_STAGE:(F.FAIR_STAGE=[]);
      if(a&&!seen.includes(a)){ seen.push(a); GM.caption('',X.STAGE_LINES[a],4600); shoutN=0; return false; } }
    let near=false; for(const b of S.booths()){ const p=S.pos(b.id); if(p&&Math.hypot(P.x-p.x,P.z-p.z)<6){ near=true; break; } }
    if(!near){ shoutN=Math.min(shoutN,30); return false; }
    if(++shoutN>=36){ shoutN=0; const L=X.SHOUTS||[]; if(L.length){ GM.caption('',L[shoutK%L.length],2600); shoutK++; } }   /* 攤位附近：大約每 18 秒一句，四句輪流 */
    return false; };
  /* ---------- 提示：手機（STORY.PHONE_RULES）---------- */
  S.phone=function(G){ if(typeof PHONE==='undefined'||!S.hintOn(G)) return; const d6=S.fairDay(G), X=D(), F=flags(G); if(G.day>d6) return;
    if(!PHONE.sent(G,'fair_y1_cal')) PHONE.at(G,d6-5,8,[{th:'sys',name:'行事曆',text:X.HINTS.cal}],'fair_y1_cal');   /* 9/1（一）08:00 */
    if(PHONE.inGroup(G,'law_class')&&!PHONE.sent(G,'fair_y1_dept')&&G.day<=d6-2) PHONE.at(G,d6-2,21,[{th:'g:law_class',from:'law_assoc',name:'系學會',text:X.HINTS.dept}],'fair_y1_dept');   /* 9/4（四）21:00 */
    if(F.FAM_GROUP_SENT&&PHONE.inGroup(G,'family_law')&&!PHONE.sent(G,'fair_y1_kevin')&&G.day<=d6-1) PHONE.at(G,d6-1,21,[{th:'g:family_law',from:'kevin',name:'Kevin',text:X.HINTS.kevin}],'fair_y1_kevin'); };   /* 9/5（五）21:00，加入家族群組的局 */
  /* 起床（CLS.morning 之後）：社博那天「今天椰林大道有社團博覽會（10:00～16:00）。」*/
  S.wake=function(GM){ const G=GM&&GM.G; if(!G||!S.today(G)||hr(G)>=S.expo().t1) return false; const F=flags(G); if(F.FAIR_WAKE===G.day) return false; F.FAIR_WAKE=G.day; if(GM.toast) GM.toast(D().HINTS.wake,4800); return true; };
  /* 錯過社博：第一次去社課（吉他、辯論、登山、系籃）旁白多一句 */
  S.doorLine=function(G,a){ const A=S.expo(); return !!(a&&a.kind==='club'&&A&&(A.clubs||[]).includes(a.id)&&law(G)&&!flags(G)['CLUB_'+a.id]&&typeof ACTIVITIES!=='undefined'&&!ACTIVITIES.attended(G,a.id,G.day)); };
  /* ---------- 掛勾 ---------- */
  if(typeof STORY!=='undefined'){
    if(STORY.populate&&!STORY._fairPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.populate(zoneId,GM); }catch(e){ console.warn('CLUBFAIR.populate',e); } return r; }; STORY._fairPop=true; }
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ return S.tick(GM); }catch(e){ console.warn('CLUBFAIR.tick',e); return false; } });
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); }
  if(typeof CLS!=='undefined'){
    if(CLS.attendActivity&&!CLS.attendActivity._fair){ const a0=CLS.attendActivity; CLS.attendActivity=Object.assign(async function(GM,a,o){ try{ if(GM&&GM.G&&S.doorLine(GM.G,a)){ flags(GM.G).CLUB_DOOR=true; GM.sceneBegin(); try{ await GM.say(null,(D().DOOR_LINE_BY||{})[a.id]||D().DOOR_LINE); } finally { GM.sceneEnd(); } }   /* CLUB_DOOR：大二社博的開場句（AA_491 B）*/ }catch(e){ console.warn('CLUBFAIR.door',e); } return a0.apply(this,arguments); },a0,{_fair:true}); }
    if(CLS.morning&&!CLS.morning._fair){ const m0=CLS.morning; CLS.morning=Object.assign(async function(GM){ const r=await m0.apply(this,arguments); try{ S.wake(GM); }catch(e){ console.warn('CLUBFAIR.wake',e); } return r; },m0,{_fair:true}); } }
  return S;
})();
if(typeof window!=='undefined') window.CLUBFAIR=CLUBFAIR;
