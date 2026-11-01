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
  const S={}, ZONE='l118_cafe2';
  S.ZONE=ZONE;
  const W16=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  const ent=(o)=>Object.assign({zone:ZONE,act:'read',weeks:W16,noHoliday:true,slowread:true},o);
  S.REGULARS=[
    {id:'heroine_01',ent:ent({days:[6],from:14,to:17,terms:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'],label:'在慢讀咖啡念書',note:'AA_535 3-1：窗邊有插座那張'}),hi:'「你也來慢讀？窗邊那張我先坐了。」'},
    {id:'heroine_03',ent:ent({days:[1],from:14,to:16,terms:['Y2S1','Y2S2','Y3S1','Y3S2'],label:'在慢讀咖啡寫報告',note:'AA_535 3-1：寫社會系的報告；那兩個小時是麵店的班（help）照麵店'}),hi:'「我在寫報告。……美式七十，坐一下午，店長不會趕人。」'},
    {id:'classmate_xinci',ent:ent({days:[4],from:15.5,to:17.5,terms:['Y1S1','Y1S2','Y2S1','Y2S2'],label:'在慢讀咖啡整理講義',note:'AA_535 3-1：三支螢光筆排一排'}),hi:'「這裡的插座比總圖多。……我數過。」'},
    {id:'pool_17',ent:ent({days:[5],from:10,to:12,terms:['Y1S1','Y1S2','Y2S1','Y2S2'],label:'在慢讀咖啡整理筆記',note:'AA_535 3-1：蕭乃文（她的大二、大三），整理筆記、拍照存檔'}),hi:'「這裡的桌子比較大。筆記攤得開。」'}];
  /* ① 接到作息的最後面（只接一次；乃文的作息由 src/pool3d.js 的 POOL.apply 重建，包一層：重建以後再接）*/
  const add=r=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[r.id]; if(!c) return false; const L=c.daily_schedule||(c.daily_schedule=[]); if(L.some(e=>e&&e.slowread)) return false; L.push(Object.assign({},r.ent)); return true; };
  S.apply=function(){ let n=0; for(const r of S.REGULARS) if(add(r)) n++; return n; };
  if(typeof POOL!=='undefined'&&POOL.apply&&!POOL._slowread){ POOL._slowread=true; const a0=POOL.apply; POOL.apply=function(){ const k=a0.apply(this,arguments); S.apply(); return k; }; }
  S.apply();
  /* ② 當面招呼：她現在照作息在慢讀（常客那一筆）、這學期還沒說過 */
  S.slotNow=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.slowread?e:null; };
  S.greet=async function(GM,who,id){ const G=GM&&GM.G; if(!G||G.zone!==ZONE) return false; const R=S.REGULARS.find(r=>r.id===id); if(!R||!S.slotNow(G,id)) return false;
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, key=t?t.id:'-', F=G.flags||(G.flags={}), H=F.SLOWREAD_HI||(F.SLOWREAD_HI={}); if(H[id]===key) return false;
    H[id]=key; await GM.say(who,R.hi); return true; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PRE_TALK)&&!STORY.PRE_TALK.includes(S.greet)) STORY.PRE_TALK.push(S.greet);
  /* ③ 路人兩到三位（營業時間、不是週二）：坐桌位看書；同一次待在店裡只補一次 */
  S.open=(G,day,h)=>{ const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day).wd%7:G.weekday; return wd!==2&&h>=9&&h<18; };
  S.extraN=G=>2+(Math.abs(G.day|0)%2);
  S.addExtras=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.zone||G.zone!==ZONE||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||!S.open(G,G.day,G.hour%24)) return 0;
    if((E.npcs||[]).some(n=>n&&n.slowExtra)) return 0;
    const taken=st=>(E.npcs||[]).some(q=>q&&(q.seat===st||q.seatTarget===st||(q.seat&&Math.hypot(q.seat.x-st.x,q.seat.z-st.z)<0.35)))||(E.player&&E.player.seat===st);
    const free=(E.zone.seats||[]).filter(st=>!st.lift&&!st.label&&!taken(st)), n=Math.min(S.extraN(G),Math.max(0,free.length-2)); let k=0;
    for(let i=0;i<n;i++){ const st=free[free.length-1-i]; const spec=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(60+((G.day|0)%7)+i):{}; const o=CHAR.build(spec); if(!o) continue;
      o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0; const x=E.addNPC({obj:o,name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,slowExtra:true,seat:st}); if(x) k++; }
    return k; };
  if(typeof L118!=='undefined'&&L118.populateShop&&!L118._slowread){ L118._slowread=true; const p0=L118.populateShop; L118.populateShop=function(GM,shopId){ const r=p0.apply(this,arguments); if(shopId==='cafe2'){ try{ S.addExtras(GM); }catch(e){ console.warn('SLOWREAD.addExtras',e); } } return r; }; }
  /* ④ 讀完的旁白：四句輪流 */
  S.NARR=['（店長把你的杯子收走，換了一杯水。你沒注意到她什麼時候來的。）','（窗外有人牽著腳踏車經過。你翻到下一章。）','（隔壁桌的人在畫刑法的體系圖，畫得比你的整齊。）','（你多坐了一會兒，把上午的筆記看完。）'];
  S.narr=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE) return null; const F=G.flags||(G.flags={}), n=F.SLOWREAD_NARR|0; F.SLOWREAD_NARR=n+1; return S.NARR[n%S.NARR.length]; };
  if(typeof STORY!=='undefined'&&!STORY._slowreadNarr){ STORY._slowreadNarr=true; const n0=STORY.studyNarr; STORY.studyNarr=GM=>S.narr(GM)||(typeof n0==='function'?n0(GM):null); }
  return S;
})();
