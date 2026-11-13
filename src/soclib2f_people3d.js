/* ===== 社科院圖書館東側館（soclib_2f）的背景人物：二樓自習室讀書的人、偶爾在討論室的人、走動的人（SOCLIB-2F-1104）=====
   來源：LAWWW2-C 交件（d393b6f3c）README「給 LAWWW-C」第 1 點；LAWWW-C 11-04 17:4x 轉 LAWWW2-C、BB-C 的補充（平常三到四成、期末週和前一週約八成五、老位子不放人、走 SL2.WALK_ROUTE）；
   AA_669 第 6 節（企劃線 468a1d0b9）「期末那一段以外：二樓照一般自習的地方用（坐下讀書、總複習）；人比較少」。
   都是路人：沒有名字、沒有台詞（有名字的人照各自的作息；期末那一段語彤、舊序章的人在這裡，src/examlib3d.js）。
   ■ 自習室（長桌 36＋靠窗 13＝49 位）：開館的時候平常坐三到四成（照日期 30～40%，15～20 位）；期末週和前一週（日曆 exam==='final' 那一週和前一週）八成五（42 位左右）；
     不上課的日子（寒暑假、國定假日：CALENDAR.kind 不是 term）減半（同 LB1、LZUP）；畫質「低」再減半（手機效能：和使用者合作的規則第 6 條「降低 NPC 數量」）。
     期末那一段（第 14 週起到期末考考完）的「滿」是 EXLIB 的 fill／syncSeats：沒人坐的位子照時間標「有人了」（桌上放東西、人不在）——這裡只放真的坐著的人。
     不坐的位子：老位子（seat.old，靠窗那排北往南第三個）、玩家記下的老位子（G.flags.SOCLIB_2F_SEAT）、EXLIB.keepSeats（4-1 占的、4-2 留的、表上的人常坐的）、已經有人的（含 taken）。
     坐哪幾個：日期當種子洗牌（出去再進來是同一批人坐同樣的位子；人數變了只多幾個或少幾個）。
   ■ 討論室（三間 × 4 位）：上課的日子一半的機會，其中一間 10:00～21:00 有 2～4 個人（照日期）。
   ■ 走動的人：SL2.WALK_ROUTE（一樓門廳 → 電梯前 → 影印區 → 樓梯下 → 二樓走廊 → 南北向走廊 → 自習室 → 電梯廳 → 回門廳；tests/soclib2f_unit.js 檢查每一段走得到）；開館時 18:00 以前兩個、以後一個。
   進來的時候已經坐著；待著的時候時段到了：從一樓西牆的門（SL2.ENTRY）走進來、上樓坐下，該走的起身離開（until：story3d.js refreshSchedule 下面路人離開的那一段）。同 LB1、LZUP 的做法。
   接線：story3d.js 的 populate 叫 SL2P.populate(GM,true)、refreshSchedule 叫 SL2P.populate(GM,false)。開放時間跟著閱覽室（places.js 的 soclib）。
   還沒在瀏覽器、手機上看過（人數多的時候的 fps 要在電腦上量，D131）。測試：node tests/exam_lib_crowd_unit.js（第 12 節） */
'use strict';
const SL2P=(function(){
  const S={};
  S.ZONE='soclib_2f';
  S.NORMAL=[0.30,0.40]; S.FINAL=0.85; S.LOW=0.5;
  S.DISC={p:0.5,n:[2,4],from:10,to:21};
  S.SPEC0=1600;   /* STORY.extraSpec 的編號（別的地方用到 1500 以內）*/
  const prng=seed=>{ let s=(seed>>>0)%2147483646+1; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; };
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  S.open=(G,h)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen('soclib',h==null?hr(G):h,G.day);
  const termDay=G=>typeof CALENDAR==='undefined'||CALENDAR.kind(G.day)==='term';
  /* 期末週和前一週：日曆 exam==='final' 那一週，或七天後是同一學期的期末週 */
  S.finalWeeks=function(day){ if(typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(day); if(!t) return false; if(t.exam==='final') return true; const t7=CALENDAR.termOf(day+7); return !!t7&&t7.id===t.id&&t7.exam==='final'; };
  S.frac=function(G){ const day=G.day|0; if(S.finalWeeks(day)) return S.FINAL; return S.NORMAL[0]+(S.NORMAL[1]-S.NORMAL[0])*prng(day*7919+211)(); };
  S.studySeat=q=>!!q&&(q.lv|0)===1&&(q.kind==='study'||q.kind==='window');
  S.count=function(G,total,level){ let n=Math.round(S.frac(G)*total); if(!termDay(G)) n=Math.floor(n/2); if(level==='low') n=Math.floor(n*S.LOW); return n; };
  const isOld2f=(G,q)=>typeof EXLIB!=='undefined'&&!!EXLIB.isOld2f&&EXLIB.isOld2f(G,q);
  /* 自習室：哪幾號坐人（keep：不要坐的位子，Set）*/
  S.want=function(G,seats,keep,level){ if(!S.open(G)) return []; const ok=[]; seats.forEach((q,i)=>{ if(S.studySeat(q)) ok.push(i); }); const n=S.count(G,ok.length,level); if(!n) return [];
    const r=prng((G.day|0)*7919+53), pool=ok.slice(); for(let k=pool.length-1;k>0;k--){ const j=Math.floor(r()*(k+1)); [pool[k],pool[j]]=[pool[j],pool[k]]; }
    const out=[]; for(const i of pool){ if(out.length>=n) break; const q=seats[i]; if(q.old||isOld2f(G,q)||(keep&&keep.has(q))) continue; out.push(i); } return out; };
  /* 討論室：上課的日子一半的機會，其中一間有 2～4 個人（10:00～21:00）*/
  S.discWant=function(G,seats){ const h=hr(G), D=S.DISC; if(!S.open(G,h)||!termDay(G)||h<D.from||h>=D.to) return []; const r=prng((G.day|0)*104729+17); if(r()>=D.p) return [];
    const rooms=[...new Set(seats.filter(q=>q&&q.kind==='discuss').map(q=>q.table))].sort(); if(!rooms.length) return [];
    const room=rooms[Math.floor(r()*rooms.length)], n=D.n[0]+Math.floor(r()*(D.n[1]-D.n[0]+1)), out=[];
    seats.forEach((q,i)=>{ if(q&&q.kind==='discuss'&&q.table===room&&out.length<n) out.push(i); }); return out; };
  /* entering＝剛進來（已經坐著）；false＝待著的時候（story3d.js refreshSchedule 每 3 秒）：該來的從一樓的門走進來、該走的起身離開 */
  S.populate=function(GM,entering){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||G.zone!==S.ZONE||!E.zone||!Array.isArray(E.zone.seats)||!E.player||typeof CHAR==='undefined'||typeof STORY==='undefined'||!STORY.extraSpec||!E.addNPC) return 0;
    const seats=E.zone.seats, h=hr(G), level=E.q&&E.q.level, keep=typeof EXLIB!=='undefined'&&EXLIB.keepSeats?EXLIB.keepSeats(GM):new Set();
    const want=S.want(G,seats,keep,level).concat(S.discWant(G,seats)), mine=E.npcs.filter(n=>n&&n.sl2Seat!=null&&!n.leaving); let k=0;
    for(const n of mine) if(!want.includes(n.sl2Seat)&&(n.until==null||n.until>h)){ n.until=h; n.seatTarget=null; k++; }
    const near=(q,st)=>!!q&&(q.lv==null||(q.lv|0)===(st.lv|0))&&Math.hypot(q.x-st.x,q.z-st.z)<0.35;
    const busy=st=>!!st.taken||(!!E.player&&near(E.player.seat,st))||E.npcs.some(q=>q&&(near(q.seat,st)||near(q.seatTarget,st)));
    const dr=typeof SL2!=='undefined'&&SL2.ENTRY?SL2.ENTRY():(E.zone.spawn||{x:0,z:0,yaw:0});   /* 從閱覽室進來的門（一樓西牆）*/
    for(const i of want){ if(mine.some(n=>n.sl2Seat===i)) continue; const st=seats[i]; if(!st||busy(st)) continue; const lv=st.lv|0, pose=st.kind==='discuss'?'sit':'read';
      const o=CHAR.build(STORY.extraSpec(S.SPEC0+(((G.day|0)*13+i)%80)));
      if(entering){ o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0; E.addNPC({obj:o,name:'',beh:'idle',pose,idlePose:pose,frozen:true,isExtra:true,sl2Seat:i,lv,seat:{x:st.x,z:st.z,yaw:st.yaw||0,lv}}); k++; continue; }
      o.position.set(dr.x,0,dr.z); o.rotation.y=dr.yaw||0; const n=E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',isExtra:true,sl2Seat:i,lv:dr.lv|0}); if(!n) continue; n.seatTarget=st; k++;
      const sit=()=>{ n.seatTarget=null; if(n.leaving) return; if(busy(st)){ n.until=hr(G); return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pose; };   /* 走到了位子被坐走（玩家先坐了）：站一下就走 */
      const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!(E.moveTo&&E.moveTo(n,ap[0],ap[1],sit,lv))) sit(); }
    if(entering&&S.open(G,h)&&GM.spawnExtra&&typeof SL2!=='undefined'&&Array.isArray(SL2.WALK_ROUTE)){ const nW=h<18?2:1;   /* 走動的人（同 soclib 閱覽室的 spawnExtra）*/
      for(let w=0;w<nW;w++){ const n=GM.spawnExtra(STORY.extraSpec(S.SPEC0+90+(((G.day|0)*3+w)%10)),SL2.WALK_ROUTE.map(p=>p.slice()),{}); if(n){ n.sl2Walk=true; k++; } } }
    return k; };
  return S;
})();
if(typeof window!=='undefined') window.SL2P=SL2P;
