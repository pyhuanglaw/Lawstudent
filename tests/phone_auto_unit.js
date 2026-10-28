// 要回覆的訊息到了自動打開手機（D103；使用者 2026-10-18：「我根本不會看手機，不能都用手機說」）——story3d.js S.phoneAuto，不需要瀏覽器。
// 檢查：有新的要回覆的訊息、玩家空下來 → 打開手機的訊息列表（msg 分頁；使用者 22:4x 選 B：先停在列表，那一列看得到最新一句、標「待回覆」，點進去才回）；同一則只開一次；對話中、劇情中、在家的 2D 畫面、手機已經開著 → 不開。
const fs=require('fs'), path=require('path'), vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'..','src/story3d.js'),'utf8'); const m=/  S\.phoneAuto=function\(GM\)\{[\s\S]*?GM\.openPhone\('msg'\); \};/.exec(src);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
check('story3d.js 有 S.phoneAuto（打開 msg 分頁）',!!m); if(!m){ console.log('FAILED '+fails); process.exit(1); }
const S={PHONE_AUTO_STILL:1.5}; let pend=[], opened=[], home=false, phoneOpen=false; const ctx={S,PHONE:{pending:()=>pend},EVENTS:{running:null},HOME:{at:()=>home}}; vm.runInNewContext(m[0].trim(),ctx);
const G={flags:{}}; const GM={G,E:{paused:false,player:{busy:false}},D:{active:false},titleIdle:false,openPhone:(tab,th)=>opened.push([tab,th]),phoneIsOpen:()=>phoneOpen};
S.phoneAuto(GM); check('沒有要回的：不開',opened.length===0);
pend=[{id:'y0_e10_ask',th:'p:kexin'}]; S.phoneAuto(GM); check('新的要回覆的訊息、空下來：打開手機的訊息列表（不直接進那個對話）',opened.length===1&&opened[0][0]==='msg'&&!opened[0][1],JSON.stringify(opened));
S.phoneAuto(GM); check('同一則只自動開一次',opened.length===1);
pend.push({id:'y0_e12_ask',th:'p:kexin'}); GM.D.active=true; S.phoneAuto(GM); check('對話中：不開',opened.length===1); GM.D.active=false;
ctx.EVENTS.running='ev_x'; S.phoneAuto(GM); check('劇情事件中：不開',opened.length===1); ctx.EVENTS.running=null;
home=true; S.phoneAuto(GM); check('在家（2D 畫面，家裡那一輪自己會打開）：不開',opened.length===1); home=false;
GM.isEntering=()=>true; S.phoneAuto(GM); check('換區域途中（推門以後變黑、載入）：不開（PHONE-AUTO-ENTER-1028）',opened.length===1); GM.isEntering=()=>false;
phoneOpen=true; S.phoneAuto(GM); check('手機已經開著：不再開',opened.length===1); phoneOpen=false;
S.phoneAuto(GM); check('空下來：開第二則',opened.length===2);
// 2026-10-21（v9.10.3 發布前 smoke_release：新遊戲收起手機以後搖桿只走 0.33 m）：同時有兩三則要回的，打開一次就把當下所有待回的都記成開過——列表上本來就都看得到；原本一次只記一則，收起來下一格又自己打開（一則跳一次）
{ const G2={flags:{}}, GM2=Object.assign({},GM,{G:G2}); opened.length=0; pend=[{id:'a1',th:'p:kexin'},{id:'a2',th:'g:fam'},{id:'a3',th:'p:zhe'}];
  S.phoneAuto(GM2); S.phoneAuto(GM2); S.phoneAuto(GM2); check('同時三則要回的：只自動開一次（收起來不會一則跳一次）',opened.length===1,String(opened.length));
  pend.push({id:'a4',th:'p:yu'}); S.phoneAuto(GM2); check('之後又來一則新的：再開一次',opened.length===2,String(opened.length)); }
// UX-PHONE-AUTO-WALK-1021（v9.10.3 發布前 smoke_release：推搖桿走到一半手機跳出來、遊戲暫停）：走路中不開，停下來 1.5 秒才開
{ const G3={flags:{}}, P3={busy:false}, E3={paused:false,player:P3,time:100,input:{joy:{active:false}}}, GM3=Object.assign({},GM,{G:G3,E:E3}); opened.length=0; pend=[{id:'w1',th:'p:kexin'}];
  E3.input.joy.active=true; P3.lastMoveT=100; S.phoneAuto(GM3); check('推著搖桿走路中：不開',opened.length===0);
  E3.input.joy.active=false; P3.path=[[3,4]]; S.phoneAuto(GM3); check('點地面走路中（還有路線）：不開',opened.length===0); P3.path=null;
  E3.time=100.5; S.phoneAuto(GM3); check('剛停下來 0.5 秒：不開',opened.length===0);
  E3.time=101.6; S.phoneAuto(GM3); check('停下來 1.5 秒以後：打開（同一則只開一次）',opened.length===1&&opened[0][0]==='msg'); S.phoneAuto(GM3); check('再一格：不重開',opened.length===1); }
/* 打開手機的捲動位置（BB 10-22 13:4x）：game3d.js openPhone——有 th（直接進那段對話）＝捲到最下面（最新）；沒有 th（列表）＝回到最上面（待回覆、最新的在最上面）。修改前（開發分支 cd262656）列表留著上一次的位置 */
{ const gsrc=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8'); const mo=/  function openPhone\(tab,th\)\{[\s\S]*?\n/.exec(gsrc);
  const pb={scrollTop:0,scrollHeight:900}, el={classList:{remove(){},add(){}}};
  const c2={G:{},GM:{titleIdle:false},menuOpen:false,closeMenu(){},phoneOpen:false,phoneTab:'msg',phoneThread:null,phonePerson:null,E:{paused:false},$:id=>id==='phoneBody'?pb:el,renderPhone(){},phoneBadge(){}};
  let ok=!!mo; if(mo){ vm.runInNewContext(mo[0]+';this.openPhone=openPhone;',c2);
    pb.scrollTop=0; c2.openPhone('msg','p:kexin'); const a=pb.scrollTop; pb.scrollTop=850; c2.openPhone('msg',null); const b=pb.scrollTop;
    check('打開手機：直接進對話＝捲到最新（最下面）；打開列表＝回到最上面（不留著上一次看對話的位置）',a===900&&b===0,JSON.stringify({a,b})); } else check('game3d.js 找得到 openPhone',false); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
