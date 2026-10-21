// 「程式讀了、卻沒有地方設」的機制缺口（LAWWW-C 派的子代理，2026-10-21）——不需要瀏覽器。
//   1. BB194-YTFLAGS（BB_194 §24）：她問到祐廷的感情狀態，選項標 yt → YT_HONEST／YT_DODGED／YT_LIED；期末飯的知情門檻（TERMEND.KNOWS_OK）因此過得了。
//   2. U_COPYRIGHT／U_CONTRACT（AA_337 第 6 題）：討論課的「理解」旗標（原本已做：classes3d.js discuss；這裡留回歸）→ 子晴 Q14「三件事」。
//   3. AA294-SKIPCLASS-1018（AA_294）：①考試（期中、期末）帶進考場、不能翹、跳過時間停在考試前；開學第二天民總 12:30 帶到 201；
//      ②課堂事件延到下一次出席（事件的 carryTo）：柏翰你考幾分到第 15 週、便利貼第一張到第 12 週、P4d 第一次出席、沛珊的表到第 14 週＋信箱版；③「你不在」的兩處回想。
//   4. VAC-ZR-UK-1017（AA_276 第 2 節、BB_178 1-E）：芷若在英國照交情聯絡。
//   5. CALLED_SHUYU（AA_243 第 5 節第 6 題、AA_262 第 5 節第 3 件、AA_327）：學姊開始交往那天就記；讀它＝對話框、按鈕上她的名字叫「書瑀」。
// 修改前：ROM.ytAnswer、CLS.day2Due、事件的 carryTo、…都沒有（第 1、3、4、5 節失敗；第 2 節原本就通過）。用法：node tests/never_set_flags_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
load('src/exchange3d.js'); load('src/data/msg_pool.js'); load('src/data/msg2_pool.js'); load('src/msg3d.js'); load('src/y34b3d.js');   // index.html 的順序：msg3d.js 在 y34b3d.js 前面
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k), wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,flags); G.acts={att:{}}; G.outings=[]; G.weekday=wdOf(G.day); GM.npc={}; E.player.obj.position.x=0; E.player.obj.position.z=0; E.player.busy=false; E.paused=false; GM.D.active=false; return G; };
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const lines=()=>H.lines();
const has=t=>H.said.some(s=>s.t===t||String(s.t).endsWith(t));
const itemOf=(term,w,cid)=>{ for(let wd=1;wd<=5;wd++){ const d=STORY.termDay(term,w,wd); if(d==null) continue; const it=CLS.dayItems(H.G,d).find(q=>q.c.id===cid); if(it) return it; } return null; };
let caps=[], toasts=[]; GM.caption=(a,b)=>{ caps.push(b); }; GM.toast=t=>{ toasts.push(t); };
(async()=>{
  /* ======================= 1. BB194-YTFLAGS ======================= */
  { const G=fresh('2026-06-11',9,'campus'); ROM.rec(G);
    check('1-0. 有 ROM.ytAnswer、EVENTS.yt（選項的 yt 標記）',typeof ROM.ytAnswer==='function'&&typeof EVENTS.yt==='function');
    G.flags.dating_kexin=true; ROM.rec(G); ROM.learn(G,'heroine_04','kexin','test');
    H.rel('heroine_04',70,50,45); SOCIAL.rel('heroine_04').npcRom=40; const lg=DATE.log(G,'heroine_04'); lg.count=4; lg.wish=true;
    const w0=TERMEND.willing(G,'heroine_04');
    check('1-1. 前提：子晴知道祐廷和可昕交往、沒有 YT_HONEST＝期末飯的知情門檻不過（why knows）',!w0.ok&&w0.why==='knows',JSON.stringify(w0));
    const ask={id:'t_yt_ask',participants:['heroine_04'],dialogue:[{speaker:'heroine_04',text:'（測試）'},{choice:[{text:'（照實）',yt:'honest'},{text:'（岔開）',yt:'dodge'},{text:'（不標）'}]}]};
    H.picks=[2]; await EVENTS.runLines(ask.dialogue,ask);
    check('1-2. 條件不成立不設：選了沒有標 yt 的選項，三個旗標都沒有',!G.flags.YT_HONEST&&!G.flags.YT_DODGED&&!G.flags.YT_LIED,JSON.stringify([G.flags.YT_HONEST,G.flags.YT_DODGED,G.flags.YT_LIED]));
    H.picks=[0]; await EVENTS.runLines(ask.dialogue,ask);
    check('1-3. 選了標 honest 的選項：YT_HONEST.heroine_04（問的那一位＝事件的第一位人物）',!!G.flags.YT_HONEST&&G.flags.YT_HONEST.heroine_04===true,JSON.stringify(G.flags.YT_HONEST));
    const w1=TERMEND.willing(G,'heroine_04');
    check('1-4. 讀的地方因此改變：子晴的知情門檻過了（KNOWS_OK）、她願意（期末飯心意邀約照發）',!!TERMEND.KNOWS_OK.heroine_04&&TERMEND.KNOWS_OK.heroine_04(G)===true&&w1.ok,JSON.stringify(w1));
    H.picks=[1]; await EVENTS.runLines(ask.dialogue,ask);
    check('1-5. 之後又被問、選了 dodge：YT_DODGED.heroine_04 → 子晴的門檻又不過（BB_194 §6）',!!G.flags.YT_DODGED&&G.flags.YT_DODGED.heroine_04===true&&!TERMEND.KNOWS_OK.heroine_04(G)&&TERMEND.willing(G,'heroine_04').why==='knows');
    /* claimEnded／claimNone 和事實比 */
    const r1=ROM.ytAnswer(G,'heroine_01','claimEnded','kexin');
    check('1-6. 「說已經分了」可是可昕還在交往中＝YT_LIED.heroine_01.kexin，不記 YT_HONEST',r1==='lied'&&!!G.flags.YT_LIED&&!!G.flags.YT_LIED.heroine_01&&G.flags.YT_LIED.heroine_01.kexin===true&&!(G.flags.YT_HONEST||{}).heroine_01,JSON.stringify(G.flags.YT_LIED));
    ROM.learn(G,'classmate_peishan','kexin','test'); H.rel('classmate_peishan',70,50,45); SOCIAL.rel('classmate_peishan').npcRom=75;
    ROM.ytAnswer(G,'classmate_peishan','honest');
    const okPs=TERMEND.KNOWS_OK.classmate_peishan(G); ROM.ytAnswer(G,'classmate_peishan','claimNone');
    check('1-7. 沛珊：照實過一次（門檻過）→ 之後說「沒有女朋友」＝說謊（YT_LIED.classmate_peishan.kexin）→ 門檻不過（!YT_LIED）',okPs===true&&G.flags.YT_LIED.classmate_peishan.kexin===true&&TERMEND.KNOWS_OK.classmate_peishan(G)===false);
    ROM.end(G,'kexin','apart_talk'); const r2=ROM.ytAnswer(G,'heroine_01','claimEnded','kexin');
    check('1-8. 分手以後再說「分了」＝照實：YT_HONEST.heroine_01；之前的說謊紀錄留著',r2==='honest'&&G.flags.YT_HONEST.heroine_01===true&&G.flags.YT_LIED.heroine_01.kexin===true);
    const r3=ROM.ytAnswer(G,'heroine_05','claimNone');
    check('1-9. 都沒有在交往時說「沒有女朋友」＝照實（YT_HONEST.heroine_05）',r3==='honest'&&G.flags.YT_HONEST.heroine_05===true&&!(G.flags.YT_LIED.heroine_05));
    ROM.cleanup(G); ROM.start(G,'heroine_03'); ROM.start(G,'heroine_02'); const r4=ROM.ytAnswer(G,'heroine_01','claimNone');
    check('1-10. 和兩個人交往中說「沒有女朋友」：兩個都記（YT_LIED.heroine_01.heroine_03、.heroine_02）',r4==='lied'&&G.flags.YT_LIED.heroine_01.heroine_03===true&&G.flags.YT_LIED.heroine_01.heroine_02===true,JSON.stringify(G.flags.YT_LIED.heroine_01));
    const fixed={id:'t_yt_line',participants:['heroine_01'],dialogue:[{speaker:'heroine_01',text:'（測試）'},{speaker:'player',text:'（測試：劇本固定照實的那一句）',yt:'honest',ytHer:'heroine_03'}]};
    await EVENTS.runLines(fixed.dialogue,fixed);
    check('1-11. 劇本固定照實的那一句（行上的 yt、ytHer）直接記 YT_HONEST',G.flags.YT_HONEST.heroine_03===true);
    const before=JSON.stringify([G.flags.YT_HONEST,G.flags.YT_DODGED,G.flags.YT_LIED]); const bad=ROM.ytAnswer(G,'heroine_04','maybe'); check('1-12. 認不得的標記不記',bad===null&&JSON.stringify([G.flags.YT_HONEST,G.flags.YT_DODGED,G.flags.YT_LIED])===before);
    const snap=JSON.parse(JSON.stringify(G.flags)); check('1-13. 存檔：三個旗標都是一般物件（JSON 來回不變）',JSON.stringify(snap.YT_LIED)===JSON.stringify(G.flags.YT_LIED)&&snap.YT_HONEST.heroine_04===true); }

  /* ======================= 2. U_COPYRIGHT／U_CONTRACT（原本已做）======================= */
  { const G=fresh('2025-12-04',13.3,'classroom'); const it=itemOf('Y1S1',14,'civ_general'); let ok=false;
    if(it){ setDay(it.day,it.t0); H.picks=[0,0,0,0,0,0]; try{ await CLS.attend(GM,it,{door:true}); ok=true; }catch(e){ console.log(e); } }
    check('2-1. 民總第 14 週的討論課（網拍標錯價）去了＝U_CONTRACT（AA_337 第 6 題）',ok&&G.flags.U_CONTRACT===true&&!G.flags.U_COPYRIGHT); }
  { const G=fresh('2028-09-27',9,'campus'); const it=itemOf('Y4S1',4,'ip_law'); let ok=false;
    if(it){ setDay(it.day,it.t0); H.picks=[0,0,0,0,0,0]; try{ await CLS.attend(GM,it,{door:true}); ok=true; }catch(e){ console.log(e); } }
    check('2-2. 大四上智財法第 4 週的討論課（合理使用）去了＝U_COPYRIGHT',ok&&G.flags.U_COPYRIGHT===true); }
  { const G=fresh('2028-09-27',9,'campus'); const it=itemOf('Y4S1',4,'ip_law'); setDay(it.day,it.t1+0.5); const n=CLS.skipNotes(GM);
    check('2-3. 條件不成立不設：沒去那一堂（下課後只有翹課的轉述）＝沒有 U_COPYRIGHT',n>=0&&!G.flags.U_COPYRIGHT&&!CLS.rec(G).done[it.key]); }
  const q14=flags=>{ const G=fresh('2028-10-11',21,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); H.FRIEND('heroine_04'); H.at('2028-10-11',21); G.zone='dorm'; Y34B.phone(G); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14'); return m?m.ask.opts.map(o=>o.t):null; };
  { const both=q14({U_COPYRIGHT:true,U_CONTRACT:true}), one=q14({U_COPYRIGHT:true});
    check('2-4. 讀的地方：兩個都有＝子晴 Q14 多「先看三件事：…」；只有一個＝沒有',!!both&&both.some(t=>/^先看三件事/.test(t))&&!!one&&!one.some(t=>/^先看三件事/.test(t)),JSON.stringify([both,one])); }

  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
