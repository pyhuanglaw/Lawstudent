// 手機訊息頁像 LINE（PHONE-LINE-UI-1018，使用者 2026-10-18 15:0x：「參考 line 每個人物的對話框點進去才看得到……最新的訊息在上面」）：
//   1. PHONE.threads(G)：照舊不含通知（sys）；
//   2. PHONE.threads(G,{sys:true})：通知也是一串（標題「通知」），列表才看得到新聞、教授的信；
//   3. 最新的對話排最上面（照最後一則的時間）；
//   4. 未讀＝別人說的、在上次看過之後；看過（markSeen）就歸零；自己傳的不算未讀；
//   5. 有要回的訊息的串 pending>0（列表上的「待回覆」）。
// 修改前：threads 不收第二個參數，第 2 項失敗。用法：node tests/phone_line_list_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
global.CHARACTERS={kexin:{name:'林可昕',phoneName:'可昕'},heroine_01:{name:'沈以安',phoneName:'以安'}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].phoneName)||id};
{ const src=fs.readFileSync(path.join(ROOT,'src/phone3d.js'),'utf8').replace(/^const PHONE=/m,'globalThis.PHONE=');
  vm.runInThisContext(src,{filename:'src/phone3d.js'}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const G={day:10,hour:20,flags:{},msgs:[]};
const at=(day,h,m)=>PHONE.postAt(G,m,day,h);
at(8,9,{who:null,text:'明天停止上班上課。',name:'新聞'});                                    // 沒有 th、沒有 who＝通知（sys）
at(9,21,{th:'p:heroine_01',from:'heroine_01',text:'筆記我放你桌上了。'});
at(10,18,{th:'p:kexin',from:'kexin',text:'週末來政大？我當導遊。',ask:{opts:[{t:'好'},{t:'這週末不行'}]}});
at(10,19,{th:'p:kexin',from:'player',who:null,text:'我再看看。'});
at(10,19.5,{who:null,text:'張教授（信）：明日停課。'});                                       // 最新的一則是通知

const a=PHONE.threads(G);
check('1 不帶參數：照舊不含通知', !a.some(t=>t.th==='sys'), a.map(t=>t.th).join(','));
const b=PHONE.threads(G,{sys:true});
check('2 {sys:true}：通知也是一串、標題「通知」', b.some(t=>t.th==='sys'&&t.title==='通知'), b.map(t=>t.th+'/'+t.title).join(','));
check('3 最新的對話在最上面（通知 19:30 → 可昕 19:00 → 以安昨天）', b.map(t=>t.th).join(',')==='sys,p:kexin,p:heroine_01', b.map(t=>t.th).join(','));
const kx=b.find(t=>t.th==='p:kexin');
check('4a 未讀：可昕那串 1 則（自己傳的不算）', kx&&kx.unread===1, JSON.stringify(kx&&{unread:kx.unread,n:kx.n}));
check('5 有要回的訊息：pending 1', kx&&kx.pending===1, JSON.stringify(kx&&kx.pending));
check('列表的最後一句是那一串最新的一則', kx&&kx.last.text==='我再看看。', kx&&kx.last.text);
PHONE.markSeen(G,'p:kexin');
const kx2=PHONE.threads(G,{sys:true}).find(t=>t.th==='p:kexin');
check('4b 點進去看過（markSeen）：未讀歸零', kx2&&kx2.unread===0, JSON.stringify(kx2&&kx2.unread));
console.log(fails?`結果：${fails} 項 FAIL`:'結果：ALL PASS');
process.exit(fails?1:0);
