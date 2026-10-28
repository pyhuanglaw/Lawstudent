/* ===== 宿舍大二到大四：312、507、409 的房間日常（AA_517，AA-C 2026-10-28，第②級；DORM-Y24-1028、DORM203-MATES-1028 延伸、USER_WANTS X123）=====
   照 AA_502（大一 203，src/dorm203_3d.js）的做法往後延伸。台詞在 src/data/dorm_y24_lines.js（DORMY24_LINES，一字照稿）。
   誰幾點在房間照舊 story3d.js 的 S.dormMates（AA_208 第 7、8 節，稿第 4 節「作息不改」）：大二 312（ROOM_Y2）阿哲 L1 22:00（12/19 起 23:00）、柏翰 R1 22:30；
     大三 507（ROOM_Y3）、大四 409（ROOM_Y4）柏翰 R1 22:30；23:30 以後在上舖（看不到）；只在上課的學期。例外只有一個：3-3 那一晚柏翰在（S.lastNight，見下面）。
   ■ 第 1 節 走進房間的旁白（背景室友，沒有 3D、沒有名字）：玩家從門口走進房間（GM.enter → story3d.js 的 S.onEnter 叫 S.entered）才說——
       睡覺醒來（sleepNow 換房間的那一次，STORY._sleeping）、讀檔、搬進新房間（ROOM_Y*_MOVING）、劇情帶進房間（演出中）不算；待在房間裡跳時間本來就不換區域。
       走進來以後玩家空下來（淡入、進門的事件之後，S.WAIT_MS）才說，字幕；中間演了事件、走出房間、換一天、過了 15 分鐘（遊戲時間）＝不說了。
       那一間的句子照順序輪流（312 一個學弟三句；507、409 兩個人各一句＝兩個人輪流），同一天同一句不說第二次；「學弟在問阿哲」那一句阿哲在房間（STORY.dormWho）才說，不在就換下一句。
       背景室友只在那一間的上課學期（312＝大二、507＝大三、409＝大四；寒暑假回家、3-3「學弟們先走了」）、07:00～23:30（23:30 以後在上舖，同 S.dormWho）。
       背景室友沒有 3D 人物（稿第 4 節）；床上的新生手冊、紙箱、大耳機這類小東西是 3D 美術（LAWWW2，照 AA_208 第 7、8 節），這裡只有旁白。
   ■ 第 2 節 在房間講話（S.roomTalk：story3d.js talkCharacter 在 DORM203.roomTalk 後面問）：只在宿舍房間、跟那一間的室友（312 阿哲、柏翰；507、409 柏翰）；
       每句一次、照表的順序和條件（S.rowOpen）；一天最多一句新的，其他時候是稿「之後」那兩句輪流；這一間一句都還沒說過、現在也沒有能說的＝照原本的閒聊。房間外照各人原本的閒聊。
       「大二上」＝大二上起（之後的學期也算）；「第 1～4 週」只在那一學期那幾週；「第 12 週以後」＝那一學期第 12 週起（之後的學期也算）；
       「期末前」＝那一學期第 10 週到期末考前一週（16 週的學期第 10～15 週，稿 2-1；大四下 15 週、第 15 週是期末考週＝第 10～14 週）。
       柏翰、沛珊分開以後＝ev_peishan_split 演過（舊存檔合併前的 ev_peishan_bohan_split 也算，msg3d.js 同）、祐廷沒有和沛珊交往；
       507 感冒那晚＝ev_cold_week_night 演過（AA_180 2-5 的 2027-10-24 21:30；稿寫「主線 5」，AA_180 是主線 6 那一場）；12/19 以後看日期（S.dormMates 阿哲晚回來也看日期）。
       日本路線：大三下（2/20 退宿）507 那兩句不出。美國路線（稿 2-4 最後一點）：大四上人在美國——第 1 列照回來以後的日子算（12/23 返台起 28 天）；
       放榜那兩列看日期（第 2 列「放榜以前」12/23 已經過了＝不出；第 3 列照出）。
   ■ 第 3 節 三件小事（STORY_EVENTS，trigger auto，location dorm，一次）：條件＝祐廷在那一間、那個時間該在的人照作息在（正在走進來的等他坐下）。
       3-1 312 四份滷味：大二上第 11 週週四（2026-11-19）23:00～23:30，阿哲、柏翰。R312_SUPPER。
       3-2 507 阿哲上來借筆記：大三下第 15 週週二（2028-05-30）23:30～24:00，日本路線不演；柏翰「在」＝今晚照作息回來了（23:30 以後他在上舖、看不到：看 23:27 那一刻）。
         R507_ZHE；23:50「203（舊生）」群組兩則。
       3-3 409 最後一晚：宿舍退宿日（story3d.js Y4K.out＝2029-06-28，1A-15 宿舍期滿 10:00 收鑰匙）的前一晚 2029-06-27 23:00～23:30。
         那一晚已經放暑假（大四下 6/3 結束），S.dormMates 原本沒有柏翰：只有這一晚 22:30～23:30 他在書桌前（S.lastNight，story3d.js S.dormMates 問）。
         畢業後篇（postgrad3d.js）睡覺、站著不動＝跳到下一件事：人在 409、這一晚還沒演＝停在 23:00（S.pgStop，PG.stops），不然會直接跳到 6/28 10:00 的宿舍期滿。
         「（去關燈）」：2-4「最後一晚，燈你關」說過的，旁白多一句「（柏翰點了一下頭。）」。R409_LAST；23:40「203（舊生）」群組三則。
       那一晚祐廷不在房間（或他們照作息不在）：稿沒寫補的做法＝不補演、沒有旁白、不記旗標、不傳群組。
   ■ 群組（AA_502 第 4 節的 g:r203；名稱照 AA_502 第 6 節＝「203（舊生）」）：那一件演過才傳；不在群組（沒有 203 四人房的舊存檔）不傳。tag rt_ 開頭（例行訊息，不算手機的頻率上限）。
   存檔：G.flags.RY24＝{walk:{房間:{i,day,used}}, talk:{'房間:人物':[說過的鍵]}, tday:{'房間:人物':第幾天}, after:{'房間:人物':第幾次}, ev:{鍵:演的那一天}, g:{鍵:排進手機的那一天}}；
     第一次用到才建（舊存檔沒有＝照常，每一格缺的補 {}）。旗標照稿：R312_SUPPER、R507_ZHE、R409_LAST（true）。沒有新的鎖（不需要 LOADLOCKS）。
   測試：node tests/aa517_dorm_y24_unit.js */
'use strict';
const DORMY24=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof DORMY24_LINES==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const L=DORMY24_LINES, BH='classmate_bohan', GID='r203', TH='g:'+GID;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(t,w,wd)=>STORY.termDayIn?STORY.termDayIn(t,w,wd):null;   /* wd：1＝週一 … 7＝週日 */
  const now=G=>G.day*24+(+G.hour||0), hh=G=>{ const x=+G.hour||0; return ((x%24)+24)%24; };
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const busy=GM=>!!((GM.E&&GM.E.player&&GM.E.player.busy)||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||(typeof EVENTS!=='undefined'&&EVENTS.running));
  const term=d=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
  const route=G=>STORY.route?STORY.route(G):null;
  const out=F=>F.MOVED_OUT!=null&&F.MOVED_OUT!==false;   /* 1A-15 宿舍期滿搬走（同 home3d.js HOME.movedOut）*/
  const ROOM_TERM={r312:'Y2',r507:'Y3',r409:'Y4'};
  /* 現在住哪一間（dorm3d.js homeOf 的順序）：409（ROOM_Y4）、507（ROOM_Y3）、312（ROOM_Y2）；還在 203、經濟系、搬出宿舍、交換退宿到返台（STORY.movedOut）、日本路線退宿到搬進 409（JP.movedOut）＝null */
  S.room=function(G){ if(!law(G)) return null; const F=G.flags; if(out(F)) return null;
    if((STORY.movedOut&&STORY.movedOut(G))||(typeof JP!=='undefined'&&JP.movedOut&&JP.movedOut(G))) return null;
    return F.ROOM_Y4?'r409':F.ROOM_Y3?'r507':F.ROOM_Y2?'r312':null; };
  /* 紀錄：make＝沒有就建（舊存檔照常）；每一格缺的補 {} */
  S.rec=function(G,make){ const F=G&&G.flags; if(!F) return null; let R=F.RY24; if(!R||typeof R!=='object'){ if(!make) return null; R=F.RY24={}; }
    for(const k of ['walk','talk','tday','after','ev','g']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };

  /* ======================= 第 1 節：走進房間的旁白 ======================= */
  S.mates=function(G,room){ const T=term(G.day), x=hh(G); return !!T&&!!room&&T.id.slice(0,2)===ROOM_TERM[room]&&x>=7&&x<23.5; };   /* 背景室友在：那一間的上課學期、07:00～23:30 */
  S.walkLine=function(G){ const room=S.room(G), A=room&&L.walkIn[room]; if(!A||!A.length||!S.mates(G,room)) return null;
    const R=S.rec(G,true), w=R.walk[room]||(R.walk[room]={i:0,day:null,used:[]}); if(!Array.isArray(w.used)) w.used=[]; if(w.day!==G.day){ w.day=G.day; w.used=[]; }
    let W=[]; try{ W=STORY.dormWho(G)||[]; }catch(e){ W=[]; } const zheIn=W.some(x=>x[0]==='zhe');
    for(let j=0;j<A.length;j++){ const k=((w.i|0)+j)%A.length; if(w.used.includes(k)||(A[k].zhe&&!zheIn)) continue; w.used.push(k); w.i=k+1; return A[k].t; }   /* 輪到的那一句今天說過、或阿哲不在＝換下一句 */
    return null; };
  S._walk=null;   /* 走進房間的那一次（不存檔）：{k:'區域|第幾天', t:遊戲時間, ms:真實時間, n:那時候演過幾件事件} */
  S.WAIT_MS=1500;   /* 走進來、淡入以後等一下（進門的事件 EVENTS.onEnter 600 ms、HOME.back 的「回到宿舍。」字幕先）*/
  S.entered=function(GM,opts){ const G=GM&&GM.G; S._walk=null; opts=opts||{}; if(!G||G.zone!=='dorm'||!S.room(G)) return false; const F=G.flags||{};
    if(opts.fromLoad||STORY._sleeping||F.ROOM_Y2_MOVING||F.ROOM_Y3_MOVING||F.ROOM_Y4_MOVING||busy(GM)) return false;   /* 讀檔、睡覺醒來、搬進新房間、劇情帶進來的不算 */
    S._walk={k:G.zone+'|'+G.day,t:now(G),ms:Date.now(),n:(G.events&&G.events.count)|0}; return true; };
  /* 每一輪（STORY.TICKS；玩家空下來才會跑到）：走進來的那一句。字幕，不擋路，回傳 false */
  S.tick=function(GM){ const G=GM&&GM.G, w=S._walk; if(!w||!G) return false;
    if(G.zone!=='dorm'||w.k!==G.zone+'|'+G.day||now(G)<w.t||now(G)-w.t>0.25||((G.events&&G.events.count)|0)!==w.n){ S._walk=null; return false; }   /* 走出房間、換一天、過了 15 分鐘、中間演了事件：不說了 */
    if(busy(GM)||Date.now()-w.ms<S.WAIT_MS) return false;
    S._walk=null; const t=S.walkLine(G); if(t&&GM.caption) GM.caption('',t,4200); return false; };

  /* ======================= 第 2 節：在房間講話 ======================= */
  const TERMS=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const termWeeks=id=>{ const T=typeof CALENDAR!=='undefined'&&Array.isArray(CALENDAR.TERMS)?CALENDAR.TERMS.find(x=>x.id===id):null; return T?T.weeks:16; };
  S.split=G=>(done(G,'ev_peishan_split')||done(G,'ev_peishan_bohan_split'))&&!(G.flags&&G.flags.dating_classmate_peishan);
  S.cold=G=>done(G,'ev_cold_week_night')||!!(G.flags&&G.flags.COLD_WEEK_NIGHT!=null);
  S.usRet=()=>DK((STORY.ROUTE_DATES&&STORY.ROUTE_DATES.US&&STORY.ROUTE_DATES.US.ret)||'2028-12-23');
  S.rowOpen=function(G,r){ const T=term(G.day), cur=T?T.id:(STORY.termAt?STORY.termAt(G.day):null), wk=T?T.week:99, ci=TERMS.indexOf(cur), ri=TERMS.indexOf(r.term);   /* 寒暑假＝前一個學期的最後（wk 99）*/
    if(ci<0||ri<0||ci<ri) return false;
    if(r.noJP&&route(G)==='JP') return false;
    if(r.us==='ret'&&route(G)==='US'){ const d=S.usRet(); if(d==null||G.day<d||G.day>=d+28) return false; }   /* 美國路線：照回來以後的日子算（返台那天起四週）*/
    else if(r.weeks&&(!T||cur!==r.term||wk<r.weeks[0]||wk>r.weeks[1])) return false;
    if(r.after&&ci===ri&&wk<r.after) return false;
    if(r.prefinal&&(!T||cur!==r.term||wk<10||wk>termWeeks(r.term)-1)) return false;
    if(r.from){ const d=DK(r.from); if(d==null||G.day<d) return false; }
    if(r.need==='split'&&!S.split(G)) return false;
    if(r.need==='cold'&&!S.cold(G)) return false;
    return true; };
  const key=(room,id)=>room+':'+id;
  S.nextRow=function(G,room,id){ const T=L.room[room]&&L.room[room][id]; if(!T) return null; const R=S.rec(G), said=(R&&R.talk[key(room,id)])||[]; return T.rows.find(r=>!said.includes(r.k)&&S.rowOpen(G,r))||null; };
  S.said=(G,room,id,k)=>{ const R=S.rec(G); return !!R&&(R.talk[key(room,id)]||[]).includes(k); };
  const sayRow=async(GM,who,room,id,r)=>{ const R=S.rec(GM.G,true), kk=key(room,id); (R.talk[kk]||(R.talk[kk]=[])).push(r.k); R.tday[kk]=GM.G.day;
    if(r.pre) await GM.say(null,r.pre); await GM.say(who,r.t);   /* 「（旁白）「台詞」」那兩格：先旁白、再他說 */
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } };
  S.roomTalk=async function(GM,who,id){ const G=GM.G; if(!G||G.zone!=='dorm') return false; const room=S.room(G), T=room&&L.room[room]&&L.room[room][id]; if(!T) return false;
    const R=S.rec(G,true), kk=key(room,id), r=R.tday[kk]===G.day?null:S.nextRow(G,room,id); if(r){ await sayRow(GM,who,room,id,r); return true; }
    if(!(R.talk[kk]||[]).length) return false;   /* 這一間一句都還沒說過、現在也沒有能說的：照原本的閒聊 */
    const A=T.after, a=A[(R.after[kk]|0)%A.length]; R.after[kk]=(R.after[kk]|0)+1; await GM.say(a.speaker===null?null:who,a.text);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; };

  /* ======================= 第 3 節：三件小事 ======================= */
  /* 宿舍退宿日（story3d.js 的 Y4K.out：1A-15 宿舍期滿，2029-06-28 10:00 收鑰匙）的前一晚＝3-3 最後一晚 */
  S.lastDay=()=>{ const d=DK((STORY.Y4K&&STORY.Y4K.out)||'2029-06-28'); return d!=null?d-1:null; };
  /* 3-3 那一晚柏翰在 409（22:30～23:30，S.dormMates 問）：已經放暑假，作息原本沒有他；只有這一晚、還住 409 的 */
  S.lastNight=function(G){ const F=(G&&G.flags)||{}; if(!law(G)||!F.ROOM_Y4||out(F)) return false; const d=S.lastDay(); return d!=null&&G.day===d; };
  S.EVS=[
    {k:'sup312',id:'ev_r312_supper',title:'四份滷味',room:'r312',days:()=>[TD('Y2S1',11,4)],t:[23,23.5],need:['zhe',BH],part:['zhe',BH]},   /* 避開第 10 週週四 11/12「哲 2」*/
    {k:'zhe507',id:'ev_r507_zhe',title:'阿哲上來借筆記',room:'r507',days:()=>[TD('Y3S2',15,2)],t:[23.5,24],need:[BH],probe:23.45,noJP:true,part:['zhe',BH]},   /* probe：23:30 以後柏翰在上舖，看 23:27 那一刻在不在 */
    {k:'last409',id:'ev_r409_last',title:'最後一晚',room:'r409',days:()=>[S.lastDay()],t:[23,23.5],need:[BH],part:['zhe',BH]} ];
  S.ev=k=>S.EVS.find(e=>e.k===k)||null;
  /* 照作息，第 d 天 h 點，need 的人都在房間（不看玩家在哪；STORY.dormWho）*/
  S.allIn=function(G,need,d,h){ const G2=(d===G.day&&h===G.hour)?G:Object.assign({},G,{day:d,hour:h,weekday:typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday}); let W=[]; try{ W=STORY.dormWho(G2)||[]; }catch(e){ return false; } return need.every(id=>W.some(w=>w[0]===id)); };
  S.evDue=function(G,GM,e){ if(!G||G.zone!=='dorm'||S.room(G)!==e.room) return false; if(e.noJP&&route(G)==='JP') return false; const R=S.rec(G); if(R&&R.ev[e.k]!=null) return false;
    if(!e.days(G).includes(G.day)) return false; const x=hh(G); if(x<e.t[0]||x>=e.t[1]) return false;
    if(!S.allIn(G,e.need,G.day,e.probe!=null?Math.min(+G.hour||0,e.probe):G.hour)) return false;
    for(const id of e.need){ const n=GM&&GM.npc&&GM.npc[id]; if(n&&n.dormGo!=null) return false; }   /* 正在走進來（S.dormSpawn）：等他坐下 */
    return true; };
  S.nodDue=G=>S.said(G,'r409',BH,'d5');   /* 3-3「（去關燈）」：2-4「最後一晚，燈你關。……之前都是我。」說過的 */
  /* 群組（那一件演過才傳）：items 照 at 分批排進手機 */
  S.post=function(G,k,d){ const ph=typeof PHONE!=='undefined'?PHONE:null, items=L.group[k]; if(!ph||!items||d==null) return false; const R=S.rec(G,true); if(R.g[k]!=null) return false;
    if(!ph.inGroup(G,GID)){ R.g[k]='nogroup'; return false; }   /* 沒有 203 四人房的舊存檔：沒有這個群組 */
    const by={}; for(const it of items) (by[it.at]||(by[it.at]=[])).push({th:TH,from:it.from,text:it.text});
    let i=0; for(const h of Object.keys(by).map(Number).sort((a,b)=>a-b)) ph.at(G,d,h,by[h],'rt_r203_y24_'+k+'_'+(i++));
    R.g[k]=d; return true; };
  for(const e of S.EVS){ if(STORY_EVENTS.some(x=>x.id===e.id)) continue;
    const lines=L.ev[e.k].map(l=>l&&l.lightNod?{if:{custom:G=>S.nodDue(G)},speaker:null,text:l.text}:l);   /* 「（柏翰點了一下頭。）」：2-4 那一句說過才有 */
    STORY_EVENTS.push({ id:e.id, title:e.title, participants:e.part, location:'dorm', trigger:'auto', once:true, background:'blur', portraitLater:true, time:e.t, stage:'law',
      prereq:{custom:(G,GM)=>S.evDue(G,GM,e)}, dialogue:lines,
      after:G=>{ const R=S.rec(G,true); R.ev[e.k]=G.day; if(L.group[e.k]) S.post(G,e.k,G.day); } }); }
  /* 畢業後篇（postgrad3d.js）的「跳到下一件事」：人在 409 房間、最後一晚還沒演＝停在那一晚 23:00 */
  S.pgStop=function(G){ if(!G||G.zone!=='dorm'||S.room(G)!=='r409') return null; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;
    const R=S.rec(G); if((R&&R.ev.last409!=null)||done(G,'ev_r409_last')) return null; const d=S.lastDay(); return d!=null?d*24+23:null; };

  if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ return S.tick(GM); }catch(e){ console.warn('DORMY24.tick',e); return false; } });
  if(typeof PG!=='undefined'&&Array.isArray(PG.stops)) PG.stops.push(G=>S.pgStop(G));
  return S;
})();
