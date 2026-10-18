// 要回覆的訊息到了自動打開手機（D103；使用者 2026-10-18：「我根本不會看手機，不能都用手機說」）——story3d.js S.phoneAuto，不需要瀏覽器。
// 檢查：有新的要回覆的訊息、玩家空下來 → 打開手機到那個對話（msg 分頁）；同一則只開一次；對話中、劇情中、在家的 2D 畫面、手機已經開著 → 不開。
const fs=require('fs'), path=require('path'), vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'..','src/story3d.js'),'utf8'); const m=/  S\.phoneAuto=function\(GM\)\{[\s\S]*?GM\.openPhone\('msg',m\.th\); \};/.exec(src);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
check('story3d.js 有 S.phoneAuto（打開 msg 分頁）',!!m); if(!m){ console.log('FAILED '+fails); process.exit(1); }
const S={}; let pend=[], opened=[], home=false, phoneOpen=false; const ctx={S,PHONE:{pending:()=>pend},EVENTS:{running:null},HOME:{at:()=>home}}; vm.runInNewContext(m[0].trim(),ctx);
const G={flags:{}}; const GM={G,E:{paused:false,player:{busy:false}},D:{active:false},titleIdle:false,openPhone:(tab,th)=>opened.push([tab,th]),phoneIsOpen:()=>phoneOpen};
S.phoneAuto(GM); check('沒有要回的：不開',opened.length===0);
pend=[{id:'y0_e10_ask',th:'p:kexin'}]; S.phoneAuto(GM); check('新的要回覆的訊息、空下來：打開那個對話',opened.length===1&&opened[0][0]==='msg'&&opened[0][1]==='p:kexin',JSON.stringify(opened));
S.phoneAuto(GM); check('同一則只自動開一次',opened.length===1);
pend.push({id:'y0_e12_ask',th:'p:kexin'}); GM.D.active=true; S.phoneAuto(GM); check('對話中：不開',opened.length===1); GM.D.active=false;
ctx.EVENTS.running='ev_x'; S.phoneAuto(GM); check('劇情事件中：不開',opened.length===1); ctx.EVENTS.running=null;
home=true; S.phoneAuto(GM); check('在家（2D 畫面，家裡那一輪自己會打開）：不開',opened.length===1); home=false;
phoneOpen=true; S.phoneAuto(GM); check('手機已經開著：不再開',opened.length===1); phoneOpen=false;
S.phoneAuto(GM); check('空下來：開第二則',opened.length===2);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
