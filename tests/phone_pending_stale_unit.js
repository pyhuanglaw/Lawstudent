// 過期的問句不算「待回覆」（PHONE-PENDING-STALE-1028；使用者 2026-10-28 01:1x「爸爸訊息一直有待回復 也沒有回復的選項」）——不需要瀏覽器。
//   週四 20:00 家人群組媽媽問「這週回來嗎」（ask until 22:00），沒回＝22:00 爸爸「？」（home3d.js）。過了 22:00 回不了（PHONE.askOpen false，點進去沒有選項），
//   可是對話串列表（PHONE.threads 的 pending）原本只看「有 ask、沒回」，那一串一直標「待回覆」。
//   1  20:30（還回得了）：家人那一串 pending 1、PHONE.pending 有那一則
//   2  23:00（過期、爸爸已經「？」）：pending 0、PHONE.pending 沒有那一則；未讀照舊算
//   3  回了：pending 0
//   4  群組次數用完（ask.grp／max）：pending 0
//   5  沒有期限的問句（可昕「週末來政大？」）照舊 pending 1
// 修改前（開發分支 64d33ea2d）：第 2、4 項 FAIL。用法：node tests/phone_pending_stale_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.CHARACTERS={kexin:{name:'林可昕',phoneName:'可昕'}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].phoneName)||id};
{ const src=fs.readFileSync(path.join(ROOT,'src/phone3d.js'),'utf8').replace(/^const PHONE=/m,'globalThis.PHONE=');
  vm.runInThisContext(src,{filename:'src/phone3d.js'}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, D=40;
const mk=()=>{ const G={day:D,hour:20,flags:{},msgs:[]}; PHONE.rec(G); PHONE.join(G,'home','家人');
  PHONE.postAt(G,{th:'g:home',from:'mom',name:'媽媽',text:'這週末回來嗎？',ask:{id:'home_ask_'+D,until:D*24+22,opts:[{t:'會回去'},{t:'這週不回'}]}},D,20); return G; };
const th=(G,id)=>PHONE.threads(G).find(t=>t.th===id)||{pending:-1,unread:-1};
{ const G=mk(); G.hour=20.5; check('1. 20:30 還回得了：家人那一串「待回覆」、PHONE.pending 有那一則',th(G,'g:home').pending===1&&PHONE.pending(G).length===1,J(th(G,'g:home'))); }
{ const G=mk(); PHONE.postAt(G,{th:'g:home',from:'dad',name:'爸爸',text:'？'},D,22); G.hour=23;
  const t=th(G,'g:home'); check('2. 23:00 過期、爸爸已經「？」：不再標「待回覆」（點進去也沒有選項）、PHONE.pending 沒有；未讀照舊',t.pending===0&&PHONE.pending(G).length===0&&t.unread>=1,J(t)); }
{ const G=mk(); G.hour=20.5; PHONE.answer(G,'home_ask_'+D,0); check('3. 回了：不標「待回覆」',th(G,'g:home').pending===0,J(th(G,'g:home'))); }
{ const G=mk(); const m=PHONE.byAsk(G,'home_ask_'+D); m.ask.grp='tst'; m.ask.max=0; G.hour=20.5; check('4. 群組次數用完（grp／max）：不標「待回覆」',th(G,'g:home').pending===0,J(th(G,'g:home'))); }
{ const G=mk(); PHONE.postAt(G,{th:'p:kexin',from:'kexin',text:'週末來政大？我當導遊。',ask:{opts:[{t:'好'},{t:'這週末不行'}]}},D,18); G.hour=23.5; check('5. 沒有期限的問句：照舊「待回覆」',th(G,'p:kexin').pending===1,J(th(G,'p:kexin'))); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
