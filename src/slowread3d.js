/* ===== 慢讀咖啡（118 巷）：誰平常在那裡念書、玩家念書的旁白（AA_535 第 3 節，AA-B 定稿，企劃線 dbd49dca7；第②級；INVITE-OPTS-1030）=====
   使用者 10-30 04:4x：「慢讀咖啡為什麼不能念書 也沒有NPC去念書 也不能約NPC」。桌位可以讀書是 l118_shops3d.js（L118-CAFE2-STUDY-1030）；邀約地點 slowread 與七位的台詞在 src/data/invites.js、見面旁白在 src/data/rel_lines.js。這個檔：
   ① 常客作息（3-1）：以安大一下～大三下週六 14:00～17:00、語彤大二上～大三下週一 14:00～16:00、芯慈大一上～大二下週四 15:30～17:30、乃文（pool_17）大一上～大二下週五 10:00～12:00。
      學期中、上課日（第 1～16 週、noHoliday），寒暑假和國定假日不來；接在各人作息的最後面而且寫學期（terms）：她原本有寫學期的作息照原本的（上課、麵店的班、出遊、活動…），
      沒寫學期的平常作息（以安週末下午在兩點半、芯慈平日下午在總圖）這幾個時段換成慢讀。以安大一上週三午餐照 lane118.js 的 H3。學姊不排（她念書在法圖、研究小間、總圖三樓、晚上的兩點半）。
   ② 當面招呼（3-1）：常客時段在慢讀點她，第一句（一學期最多一次：G.flags.SLOWREAD_HI＝{人物: 學期}），之後照她平常的招呼（STORY.PRE_TALK）。
   ③ 路人兩到三位（營業時間都在；看書、打電腦，不說話、不用名字）：走進慢讀時坐在桌位（L118.populateShop 之後補；吧檯高腳椅不坐、至少留兩個桌位給你和約的人）。
   ④ 玩家一個人在慢讀讀書：讀完的旁白四句輪流（原本 done 那一句也在裡面；G.flags.SLOWREAD_NARR；game3d.js studySession 讀完問 STORY.studyNarr）。
   存檔欄位都在 G.flags（舊存檔沒有＝從頭開始）。測試：node tests/aa535_slowread_unit.js */
'use strict';
const SLOWREAD=(function(){
  /* 2026-11-11 AA_772 slowread_to_mokuyobi（L118-SHOPS-REDO-1111；使用者：慢讀咖啡的念書、常客、邀約整套搬到別區現有的咖啡店，AA 挑溫州街的木曜日）：
     區域從 l118_cafe2（現在是大學食堂，不再有人念書、桌位不能讀書）換成 wz_mokuyobi；常客作息照舊四位，乃文週五改 14:00～16:00（木曜日 13:00 才開）；當面招呼照稿換字（tools/story/l118_fix772.py）；
     ③ 路人：木曜日有自己的客人（src/crowd3d.js），這裡不再另外補；④ 讀完的旁白：用木曜日原本的四句（src/mokuyobi_sys3d.js），慢讀那四句拿掉，G.flags.SLOWREAD_NARR 不再用。
     以安窗邊的位子（AA_311 H3）搬來這裡：S.h3（下面）。這個檔的名字、SLOWREAD、旗標 SLOWREAD_HI 不改（舊存檔照認）*/
  const S={}, ZONE='wz_mokuyobi';
  S.ZONE=ZONE;
  const W16=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  const ent=(o)=>Object.assign({zone:ZONE,act:'read',weeks:W16,noHoliday:true,slowread:true},o);
  S.REGULARS=[
    {id:'heroine_01',ent:ent({days:[6],from:14,to:17,terms:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'],label:'在木曜日念書',note:'AA_535 3-1：窗邊有插座那張'}),hi:'「（小聲）你也來木曜日？窗邊那桌我先坐了。」'},
    {id:'heroine_03',ent:ent({days:[1],from:14,to:16,terms:['Y2S1','Y2S2','Y3S1','Y3S2'],label:'在木曜日寫報告',note:'AA_535 3-1：寫社會系的報告；那兩個小時是麵店的班（help）照麵店'}),hi:'「（小聲）我在寫報告。……這裡坐一下午，老闆不會趕人。」'},
    {id:'classmate_xinci',ent:ent({days:[4],from:15.5,to:17.5,terms:['Y1S1','Y1S2','Y2S1','Y2S2'],label:'在木曜日整理講義',note:'AA_535 3-1：三支螢光筆排一排'}),hi:'「這裡的插座比總圖多。……我數過。」'},
    {id:'pool_17',ent:ent({days:[5],from:14,to:16,terms:['Y1S1','Y1S2','Y2S1','Y2S2'],label:'在木曜日整理筆記',note:'AA_535 3-1：蕭乃文（她的大二、大三），整理筆記、拍照存檔'}),hi:'「這裡的桌子比較大。筆記攤得開。」'}];
  /* ① 接到作息的最後面（只接一次；乃文的作息由 src/pool3d.js 的 POOL.apply 重建，包一層：重建以後再接）*/
  const add=r=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[r.id]; if(!c) return false; const L=c.daily_schedule||(c.daily_schedule=[]); if(L.some(e=>e&&e.slowread)) return false; L.push(Object.assign({},r.ent)); return true; };
  S.apply=function(){ let n=0; for(const r of S.REGULARS) if(add(r)) n++; return n; };
  if(typeof POOL!=='undefined'&&POOL.apply&&!POOL._slowread){ POOL._slowread=true; const a0=POOL.apply; POOL.apply=function(){ const k=a0.apply(this,arguments); S.apply(); return k; }; }
  S.apply();
  /* ② 當面招呼：她現在照作息在慢讀（常客那一筆）、這學期還沒說過 */
  S.slotNow=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.slowread?e:null; };
  S.greet=async function(GM,who,id){ const G=GM&&GM.G; if(!G||G.zone!==ZONE) return false; const R=S.REGULARS.find(r=>r.id===id); if(!R||!S.slotNow(G,id)) return false;
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, key=t?t.id:'-', F=G.flags||(G.flags={}), H=F.SLOWREAD_HI||(F.SLOWREAD_HI={}); if(H[id]===key) return false;
    if(await S.h3(GM,who,id)) return true;   /* 以安窗邊的位子：那一次用這三句，這學期的那一句招呼留到下一次 */
    H[id]=key; await GM.say(who,R.hi); return true; };
  /* 以安窗邊的位子（AA_772 slowread_to_mokuyobi.H3，取代 AA_311 H3 大一上週三午餐在慢讀那一段）：大一下起週六 14:00～17:00 她在木曜日念書（常客那一筆）、玩家有 REPORT_PARTNER、只演一次。
     在木曜日點她的時候演（代替那一次的當面招呼）；三句照 src/data/l118_redo772.js 的 h3.lines（老闆、旁白、以安），不加數值。演過的記號沿用 G.l118.once.H3（在慢讀演過的舊存檔不再演）*/
  S.h3Due=function(G,id){ if(id!=='heroine_01'||!G||(G.stage||'law')!=='law'||G.zone!==ZONE) return false; const H3=typeof L118_REDO!=='undefined'&&L118_REDO.h3; if(!H3||!Array.isArray(H3.lines)) return false;
    const o=G.l118&&G.l118.once; if(o&&typeof o==='object'&&o.H3!=null) return false; if(!S.slotNow(G,id)) return false;
    return typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_01','REPORT_PARTNER'); };
  S.h3=async function(GM,who,id){ const G=GM&&GM.G; if(!S.h3Due(G,id)) return false; const R=G.l118&&typeof G.l118==='object'&&!Array.isArray(G.l118)?G.l118:(G.l118={}); if(!R.once||typeof R.once!=='object') R.once={}; R.once.H3=G.day;
    for(const [w,t] of L118_REDO.h3.lines) await GM.say(w==null?null:(w===id?who:{name:w}),t); return true; };
  /* 讀檔（game3d.js migrate）：已經排好、地點是 slowread 的邀約（G.invites）改去木曜日（zone）；npc 約的那一則標題裡的舊店名換掉；
     還沒見面的（offered／changed／accepted／going）時間不在木曜日開的時段（13:00～20:30 開始、週二休）＝取消（cancelled：之後可以再約），不出錯是底線。做幾次都一樣 */
  S.migrate=function(s){ const A=s&&Array.isArray(s.invites)?s.invites:null; if(!A) return 0; let n=0; const M=(typeof L118_REDO!=='undefined'&&L118_REDO.sideq&&L118_REDO.sideq.rename)||{}; let old=null; for(const k in M) if(M[k]==='木曜日') old=k;
    for(const iv of A){ if(!iv||iv.place!=='slowread') continue; if(iv.zone!==ZONE){ iv.zone=ZONE; n++; } if(old&&typeof iv.label==='string'&&iv.label.indexOf(old)>=0) iv.label=iv.label.split(old).join('木曜日');
      if(['offered','changed','accepted','going'].includes(iv.state)&&typeof iv.h==='number'&&typeof iv.day==='number'){ const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(iv.day).wd%7:null; if(iv.h<13||iv.h>20.5||wd===2){ iv.state='cancelled'; n++; } } }
    return n; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PRE_TALK)&&!STORY.PRE_TALK.includes(S.greet)) STORY.PRE_TALK.push(S.greet);
  /* ③ 路人兩到三位（營業時間、不是週二）：坐桌位看書；同一次待在店裡只補一次 */
  S.open=(G,day,h)=>{ const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day).wd%7:G.weekday; return wd!==2&&h>=13&&h<22; };
  S.extraN=G=>2+(Math.abs(G.day|0)%2);
  S.addExtras=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.zone||G.zone!==ZONE||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||!S.open(G,G.day,G.hour%24)) return 0;
    if((E.npcs||[]).some(n=>n&&n.slowExtra)) return 0;
    const taken=st=>(E.npcs||[]).some(q=>q&&(q.seat===st||q.seatTarget===st||(q.seat&&Math.hypot(q.seat.x-st.x,q.seat.z-st.z)<0.35)))||(E.player&&E.player.seat===st);
    const free=(E.zone.seats||[]).filter(st=>!st.lift&&!st.label&&!taken(st)), n=Math.min(S.extraN(G),Math.max(0,free.length-2)); let k=0;
    for(let i=0;i<n;i++){ const st=free[free.length-1-i]; const spec=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(60+((G.day|0)%7)+i):{}; const o=CHAR.build(spec); if(!o) continue;
      o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0; const x=E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,slowExtra:true,seat:st}); if(x) k++; }
    return k; };
  /* （AA_772）原本接在 L118.populateShop 後面、走進 cafe2 補路人的那一段拿掉：cafe2 現在是大學食堂；木曜日的客人照 src/crowd3d.js */
  /* ④ 讀完的旁白：AA_772 study_narr——慢讀的四句拿掉，木曜日用它原本的四句（src/mokuyobi_sys3d.js 的 STORY.studyNarr）*/
  return S;
})();
