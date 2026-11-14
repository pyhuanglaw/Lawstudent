// 還沒認識語彤時她的訊息不送（ytjob3d.js gatePhone，AA_610），但群組的回覆選項不能跟著不見（CC 11-11 20:48 AA_814 H23b）——不需要瀏覽器（D131）。
// CC：讀檔到 2027-07-20 20:50（C09、C12 答應），21:00 桌遊團群組 VA10 揪香港十則送出，**沒有任何一則有 ask**——
// vac3d.js 把 ask 掛在最後一則（語彤「禮拜六我要上班。……」），沒認識語彤＝那一則被拿掉，ask 跟著不見；玩家只能等 8/1 阿哲私訊催才回得了。
// 修法：群組裡她那則拿掉時，ask 移到同一個對話串留下來的最後一則別人的話（系統字「會撞到：…」、旁白不算）；她自己的私訊串照舊整則不送。
// 檢查：
//   1. 實際 VA10（vac3d.js va10Phone）、沒認識語彤：群組沒有語彤那則；欣慈那則（留下來的最後一則）有 ask（va10_ask、兩個選項）；回「我也去。」＝VA10 yes
//   2. 同一批最後多一行系統字（AA_814 2-3 撞期提示）：ask 掛在欣慈那則、不掛系統字
//   3. 認識語彤：ask 照舊在語彤那則（不動）
//   4. 她自己的私訊（p:heroine_03）帶 ask、沒認識：整則不送、記 cut，也不會跑到別的對話串
// 修改前（d7fe9c9ca）：第 1、2 項 FAIL。用法：node tests/ytjob_gate_ask_1111_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const fs=require('fs'), vm=require('vm'), path=require('path');
console.warn=()=>{};
if(typeof YTJOB==='undefined'){ let s=fs.readFileSync(path.join(H.ROOT,'src/ytjob3d.js'),'utf8'); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:'src/ytjob3d.js'}); }
check('0. 語彤的手機閘門裝上了（PHONE._ytjob）',typeof YTJOB!=='undefined'&&!!PHONE._ytjob);
const YT='heroine_03', XC='classmate_xinci';
const setup=met=>{ const G=H.fresh('2027-07-20',20.8,'campus',{YT_MET_JOB:met}); G.stage='law'; PHONE.rec(G).groups.noodle_team={name:'桌遊團'}; return G; };
const va10=G=>{ VAC.phone({G}); G.hour=21.0; VAC.phone({G}); G.hour=21.05; PHONE.tick(G); return G.msgs.filter(m=>m.tag==='va10_ask'); };
// 1
{ const G=setup(false), ms=va10(G), asks=ms.filter(m=>m.ask), last=ms.filter(m=>m.th==='g:noodle_team').pop();
  check('1. 沒認識語彤：群組沒有語彤那則；回覆選項在留下來的最後一則（欣慈）',ms.length>0&&!ms.some(m=>m.from===YT)&&asks.length===1&&asks[0]===last&&last.from===XC&&asks[0].ask.id==='va10_ask'&&asks[0].ask.opts.length===2,J(ms.map(m=>[m.from,!!m.ask])));
  const r=PHONE.answer(G,'va10_ask',0); check('1. 群組回「我也去。」＝VA10 yes',!!r&&G.flags.VA10==='yes',J({r:!!r,VA10:G.flags.VA10})); }
// 2
{ const G=setup(false); G.hour=10; const g='g:noodle_team';
  PHONE.at(G,G.day,10,[{th:g,from:'zhe',text:'甲'},{th:g,from:XC,text:'乙'},{th:g,from:YT,text:'丙',ask:{id:'t_ask',opts:[{t:'好'}]}},{th:'sys',text:'會撞到：某某 8/25'}],'t_ask'); G.hour=10.05; PHONE.tick(G);
  const ms=G.msgs.filter(m=>m.tag==='t_ask');
  check('2. 最後多一行系統字：ask 掛在欣慈那則、不掛系統字；語彤那則不送',J(ms.map(m=>[m.from||m.th,!!m.ask]))===J([['zhe',false],[XC,true],['sys',false]]),J(ms.map(m=>[m.from||m.th,!!m.ask]))); }
// 3
{ const G=setup(true), ms=va10(G), asks=ms.filter(m=>m.ask);
  check('3. 認識語彤：ask 照舊在語彤那則',asks.length===1&&asks[0].from===YT&&ms.some(m=>m.from===XC&&!m.ask),J(ms.map(m=>[m.from,!!m.ask]))); }
// 4
{ const G=setup(false); G.hour=10; const ok=PHONE.at(G,G.day,10,[{th:'p:'+YT,from:YT,text:'私訊',ask:{id:'yt_dm',opts:[{t:'嗯'}]}}],'yt_dm'); G.hour=10.05; PHONE.tick(G);
  check('4. 她自己的私訊帶 ask、沒認識：整則不送、記 cut，ask 沒有跑到別的地方',ok===false&&!G.msgs.some(m=>m.tag==='yt_dm'||(m.ask&&m.ask.id==='yt_dm'))&&(PHONE.rec(G).cut||[]).includes('yt_dm')); }
H.done();
