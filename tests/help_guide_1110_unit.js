// HELP-GUIDE-1110（USER_WANTS X268）：選單「說明」頁＋第一次遇到時的一行提示——不需要瀏覽器。
//   使用者 2026-11-10：「遊戲中應該要有說明?簡單說明如何約人一天可以做幾件事情這些??」（選擇題：說明頁＋第一次提示）。
//   字：src/data/help_text.js；程式：src/hints3d.js；接點：src/game3d.js（tick、打開手機、花錢、存檔、設定）、index.html（#helpBox、#setHints）。
//   1 說明頁：該有的幾節都在、每一節有字；署名那一行一字不差；index.html 的保底也有署名；舊的原型字、不再載入的模型不在說明頁裡
//   2 字的規則：不用「妳」、沒有表情符號、提示一行不太長、提示不是任何人物說的話（沒有人名）
//   3 每一種提示遇到了出一次、只出一次
//   4 設定關掉＝都不出、也不記成看過；再打開照樣會出
//   5 玩了一陣子的舊存檔：基本的幾種直接記成看過，一則都不跳出來；剛開始的舊存檔照新遊戲
//   6 劇情中不出，空下來才出；一次一則、兩則之間有間隔；剛讀檔先等一下
//   7 存檔 JSON 來回：HINT_SEEN 還在、看過的不再出
//   8 讀檔時放開排著的提示（LOADLOCKS）；存檔那一種先記成看過再存
//   9 接點：game3d.js、index.html 真的接上了
// 用法：node tests/help_guide_1110_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, ROOT=H.ROOT;
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
for(const f of ['src/data/help_text.js','src/hints3d.js']){ const src=rd(f).replace(/^const (HELP_TEXT|HINTS)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const T=HELP_TEXT, HI=HINTS;
const toasts=[]; GM.toast=t=>{ toasts.push(t); }; GM.S={}; GM.sceneDepth=()=>depth; GM.isEntering=()=>false; let depth=0;
let clock=1e6; HI._now=()=>clock;
const KINDS=Object.keys(T.hints);
let examOn=false; globalThis.STUDY={reviewOpt:()=>examOn?{t:'考前總複習'}:null};   /* 考前總複習開了沒（study3d.js 的 STUDY.reviewOpt；這裡用假的）*/
/* 一份剛開始的存檔（開場那兩天已經過了、什麼都還沒做）*/
const fresh=key=>{ const G=H.fresh(key||'2025-09-10',10,'campus',{introDone:true});   /* 9/10（三）這一天沒有課 */ G.visited={dorm:true}; G.stats={steps:0,classes:0,study:0}; G.notes=[]; G.invites=[]; G.money=22000; delete G.slots; toasts.length=0; depth=0; E.player.busy=false; GM.D.active=false; GM.S={}; for(const k in globalThis.LOADLOCKS) if(/^hints3d:/.test(k)) globalThis.LOADLOCKS[k](); clock+=1e7; return G; };
const ready=G=>{ HI.tick(GM); clock+=HI.FIRST_MS+1; };   /* 這一局第一次 tick 以後過了開頭的等待 */
const gap=()=>{ clock+=HI.GAP_MS+1; };
const hintToasts=()=>toasts.filter(t=>KINDS.some(k=>T.hints[k]===t));
/* 讓某一種的情況成立（其他種盡量不成立）*/
const MAKE={
  free:G=>{},
  slot:G=>{ G.slots={day:G.day,used:{am:1,pm:0,ev:0}}; },
  cls:G=>{ const it=CLS.next(G); if(!it||it.day!==G.day) return false; G.hour=it.t0-0.5; },
  phone:G=>{ HI.fire(GM,'phone'); },
  invite:G=>{ H.FRIEND('zhe'); },   /* 有聯絡方式（開場就有）而且不是只打過招呼＝可以約 */
  invited:G=>{ G.invites.push({id:'t1',who:'zhe',state:'offered',day:G.day,h:18}); },
  travel:G=>{ G.visited={dorm:true,campus:true,cafe:true}; },
  buy:G=>{ HI.fire(GM,'buy'); },
  exam:G=>{ examOn=true; },
  money:G=>{ G.money=100; },
  save:G=>{ HI.fire(GM,'save',{later:true}); }
};

/* ======================= 1 說明頁 ======================= */
{ const ids=T.sections.map(s=>s.id), need=['about','move','day','class','exam','invite','phone','travel','money','save','hints','credits'];
  check('1-1 說明頁有 8～12 節，該有的都在',T.sections.length>=8&&T.sections.length<=12&&need.every(k=>ids.includes(k)),ids.join(','));
  check('1-2 每一節有標題、1 句以上、每句不超過 60 字',T.sections.every(s=>s.title&&Array.isArray(s.body)&&s.body.length>=1&&s.body.every(b=>typeof b==='string'&&b.length>0&&b.length<=60)),T.sections.map(s=>s.id+':'+Math.max(...s.body.map(b=>b.length))).join(' '));
  const html=HI.helpHTML();
  check('1-3 畫出來的說明頁每一節都在（data-help）',need.every(k=>html.includes('data-help="'+k+'"'))&&T.sections.every(s=>html.includes(s.title)));
  check('1-4 署名「Seed-san by VirtualCast, Inc.」一字不差（資料、畫出來的頁、index.html 的保底）',T.credits[0].startsWith('Seed-san by VirtualCast, Inc.')&&html.includes('Seed-san by VirtualCast, Inc.')&&rd('index.html').includes('Seed-san by VirtualCast, Inc.'));
  check('1-5 指到 LICENSES.md',html.includes('LICENSES.md'));
  const all=JSON.stringify(T);
  check('1-6 舊的原型字、不再載入的模型不在說明裡',!/3D 原型|placeholder|暫代|VRM1_Constraint|小安 3D 模型/.test(all));
  const day=T.sections.find(s=>s.id==='day').body.join('');
  check('1-7 「一天可以做幾件事」和程式一樣：三個時段各一件（CLS.SLOT_BASE）、吃飯聊天不算',CLS.SLOT_BASE.am===1&&CLS.SLOT_BASE.pm===1&&CLS.SLOT_BASE.ev===1&&/上午、下午、晚上三段/.test(day)&&/每一段可以做一件主要的事/.test(day)&&/吃飯、聊天/.test(day));
  const inv=T.sections.find(s=>s.id==='invite').body.join('');
  check('1-8 「怎麼約人」寫了當面、手機兩種，和回覆的三個選項',/當面約/.test(inv)&&/「朋友」頁按「約」/.test(inv)&&/答應、改天、不了/.test(inv));
  check('1-9 說明頁寫了提示可以在設定關掉',/設定/.test(T.sections.find(s=>s.id==='hints').body.join('')));
  check('1-10 手機那一節的頁名和 index.html 的分頁一樣',['今天','課表','地點','活動','訊息','動態','朋友','相簿'].every(n=>T.sections.find(s=>s.id==='phone').body.some(b=>b.startsWith(n+'：'))&&rd('index.html').includes('>'+n+'</button>')));
}
/* ======================= 2 字的規則 ======================= */
{ const strs=[].concat(...T.sections.map(s=>[s.title].concat(s.body)),T.credits,[T.creditsTitle,T.settingLabel],KINDS.map(k=>T.hints[k]));
  check('2-1 不用「妳」',strs.every(s=>!s.includes('妳')));
  check('2-2 沒有表情符號',strs.every(s=>!/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s)));
  check('2-3 提示每一則一行、50 字以內',KINDS.every(k=>!/\n/.test(T.hints[k])&&T.hints[k].length<=50),KINDS.map(k=>k+':'+T.hints[k].length).join(' '));
  const names=Object.keys(CHARACTERS).map(id=>CHARACTERS[id].name).filter(n=>n&&n.length>=2);
  check('2-4 說明和提示裡沒有任何人物的名字（不是人物說的話、不劇透）',strs.every(s=>!names.some(n=>s.includes(n))),names.filter(n=>strs.some(s=>s.includes(n))).join(','));
  check('2-5 校名照 WORLD_NAMING（首都帝大；沒有真實校名）',strs.some(s=>s.includes('首都帝大'))&&strs.every(s=>!/台大|臺大|臺灣大學|政大/.test(s)));
  check('2-6 至少九種提示',KINDS.length>=9,String(KINDS.length));
}
/* ======================= 3 每一種出一次、只出一次 ======================= */
for(const k of KINDS){ const G=fresh(k==='cls'?'2025-09-24':null);   /* 9/24（三）早上有課 */ G.flags.HINT_SEEN={}; for(const o of KINDS) if(o!==k) G.flags.HINT_SEEN[o]=1;   /* 其他種都看過：只看這一種 */
  ready(G);
  { const r=MAKE[k](G); if(r===false){ check('3 '+k+'：這一天沒有課可以測',false); continue; } HI.tick(GM); }
  const a=hintToasts().slice();
  for(let i=0;i<4;i++){ gap(); MAKE[k](G); HI.tick(GM); }
  examOn=false;
  check('3 '+k+'：遇到了出一次、之後不再出',a.length===1&&a[0]===T.hints[k]&&hintToasts().length===1&&G.flags.HINT_SEEN[k]===1,JSON.stringify(hintToasts())); }
/* 沒遇到就不出 */
{ const G=fresh(); G.flags.HINT_SEEN={free:1,invite:1}; ready(G); for(let i=0;i<5;i++){ gap(); HI.tick(GM); }
  check('3-x 什麼都沒遇到（沒有課快開始、沒人約、錢夠、沒考試）＝不出',hintToasts().length===0,JSON.stringify(hintToasts())); }
/* ======================= 4 設定關掉 ======================= */
{ const G=fresh(); GM.S={hints:false}; ready(G); for(const k of KINDS){ if(k!=='cls'&&k!=='exam') MAKE[k](G); gap(); HI.tick(GM); }
  check('4-1 提示關掉＝一則都不出',hintToasts().length===0,JSON.stringify(hintToasts()));
  check('4-2 關掉的時候不記成看過、不排隊',Object.keys(G.flags.HINT_SEEN||{}).length===0&&HI._pending().length===0,JSON.stringify(G.flags.HINT_SEEN));
  GM.S={hints:true}; ready(G); HI.tick(GM);
  check('4-3 再打開：照樣會出',hintToasts().length===1,JSON.stringify(hintToasts()));
  GM.S={}; check('4-4 舊的設定檔沒有這一項＝開著',HI.on(GM)===true&&HI.on({S:{hints:false}})===false); }
/* ======================= 5 舊存檔 ======================= */
{ const G=fresh(); delete G.flags.HINT_SEEN; G.visited={dorm:true,campus:true,cafe:true,library:true,noodle:true,cvs:true}; G.stats={steps:9000,classes:14,study:6}; G.slots={day:G.day,used:{am:1,pm:1,ev:0}}; G.invites.push({id:'o1',who:'zhe',state:'offered',day:G.day,h:18});
  check('5-1 看得出來玩了一陣子（pastStart）',HI.pastStart(G)===true);
  ready(G); HI.fire(GM,'phone'); HI.fire(GM,'buy'); HI.fire(GM,'save',{later:true}); for(let i=0;i<12;i++){ gap(); HI.tick(GM); }
  check('5-2 玩了一陣子的舊存檔：基本的幾種一則都不跳',hintToasts().length===0,JSON.stringify(hintToasts()));
  check('5-3 基本的幾種都記成看過；考試、沒錢那兩種留著（之後真的遇到才出一次）',HI.BASIC.every(k=>G.flags.HINT_SEEN[k]===1)&&!G.flags.HINT_SEEN.exam&&!G.flags.HINT_SEEN.money);
  check('5-4 BASIC 都是真的有的種類',HI.BASIC.every(k=>KINDS.includes(k)));
  const G2=fresh(); delete G2.flags.HINT_SEEN;
  check('5-5 剛開始的存檔（沒有 HINT_SEEN）＝照新遊戲，不預先記',HI.pastStart(G2)===false&&Object.keys(HI.rec(G2)).length===0);
  const G3=fresh(); delete G3.flags; check('5-6 連 flags 都沒有的存檔不丟例外',(()=>{ try{ HI.tick(GM); return typeof G3.flags.HINT_SEEN==='object'; }catch(e){ return false; } })()); }
/* ======================= 6 劇情中不出、間隔 ======================= */
{ const G=fresh(); ready(G); depth=1; for(let i=0;i<3;i++){ gap(); HI.tick(GM); }
  check('6-1 劇情中（sceneDepth>0）不出',hintToasts().length===0);
  HI.fire(GM,'buy'); check('6-2 劇情中遇到的排著、沒有丟掉',hintToasts().length===0&&HI._pending().includes('buy')&&!G.flags.HINT_SEEN.buy);
  depth=0; E.player.busy=true; gap(); HI.tick(GM); const n1=hintToasts().length; E.player.busy=false; GM.D.active=true; gap(); HI.tick(GM); const n2=hintToasts().length; GM.D.active=false;
  ADV.active=true; gap(); HI.tick(GM); const n3=hintToasts().length; ADV.active=false; GM.titleIdle=true; gap(); HI.tick(GM); const n4=hintToasts().length; GM.titleIdle=false;
  GM.isEntering=()=>true; gap(); HI.tick(GM); const n5=hintToasts().length; GM.isEntering=()=>false;
  check('6-3 玩家被鎖住、對話框開著、2D 畫面、標題畫面、換場的時候都不出',n1===0&&n2===0&&n3===0&&n4===0&&n5===0,[n1,n2,n3,n4,n5].join(','));
  HI.tick(GM); check('6-4 空下來：排著的那一則先出',hintToasts().length===1&&hintToasts()[0]===T.hints.buy);
  for(let i=0;i<10;i++) HI.tick(GM); check('6-5 一次一則：間隔還沒到，連續 tick 不再出',hintToasts().length===1);
  clock+=HI.GAP_MS-1000; HI.tick(GM); const before=hintToasts().length; clock+=2000; HI.tick(GM);
  check('6-6 過了間隔才出下一則',before===1&&hintToasts().length===2);
  const G2=fresh(); HI.tick(GM); clock+=HI.FIRST_MS-500; HI.tick(GM); const b0=hintToasts().length; clock+=1000; HI.tick(GM);
  check('6-7 剛開始（剛讀檔、剛開新遊戲）先等一下再出',b0===0&&hintToasts().length===1&&hintToasts()[0]===T.hints.free); }
/* 新遊戲全部走一遍：每一種最多一次、不會同時兩則 */
{ const G=fresh(); ready(G); const perTick=[]; for(let i=0;i<40;i++){ const n=hintToasts().length; if(i===3) MAKE.slot(G); if(i===5) MAKE.invited(G); if(i===7) MAKE.travel(G); if(i===9) MAKE.money(G); if(i===11){ MAKE.phone(G); MAKE.buy(G); MAKE.save(G); } HI.tick(GM); perTick.push(hintToasts().length-n); gap(); }
  const L=hintToasts(); check('6-8 一路玩下去：每一種最多一次、每次 tick 最多一則',new Set(L).size===L.length&&perTick.every(n=>n<=1)&&L.length>=8,L.length+' 則'); }
/* ======================= 7 存檔來回 ======================= */
{ const G=fresh(); ready(G); HI.tick(GM); gap(); MAKE.slot(G); HI.tick(GM); const seen=Object.assign({},G.flags.HINT_SEEN);
  const G2=JSON.parse(JSON.stringify(G)); H.G=G2; toasts.length=0; for(const k in globalThis.LOADLOCKS) if(/^hints3d:/.test(k)) globalThis.LOADLOCKS[k](); clock+=1e7; ready(G2); HI.tick(GM);
  check('7-1 JSON 來回以後 HINT_SEEN 一樣',JSON.stringify(G2.flags.HINT_SEEN)===JSON.stringify(seen)&&seen.free===1&&seen.slot===1,JSON.stringify(G2.flags.HINT_SEEN));
  check('7-2 讀回來：看過的不再出',!hintToasts().includes(T.hints.free)&&!hintToasts().includes(T.hints.slot),JSON.stringify(hintToasts()));
  check('7-3 HINT_SEEN 只有種類→1（可以放進存檔）',Object.keys(G2.flags.HINT_SEEN).every(k=>KINDS.includes(k)&&G2.flags.HINT_SEEN[k]===1)); }
/* ======================= 8 讀檔放開、存檔那一種 ======================= */
{ const G=fresh(); G.flags.HINT_SEEN={}; for(const o of KINDS) if(o!=='buy'&&o!=='save') G.flags.HINT_SEEN[o]=1; ready(G); depth=1; HI.fire(GM,'buy');
  check('8-1 LOADLOCKS 登記了 hints3d:pend、hints3d:lastAt',typeof globalThis.LOADLOCKS['hints3d:pend']==='function'&&typeof globalThis.LOADLOCKS['hints3d:lastAt']==='function');
  globalThis.LOADLOCKS['hints3d:pend'](); check('8-2 讀檔：上一局排著的提示不帶到新的一局',HI._pending().length===0);
  depth=0; const r=HI.fire(GM,'save',{later:true}); const snap=JSON.parse(JSON.stringify(G));
  check('8-3 存檔那一種：存之前已經記成看過（存進去的檔讀回來不會再出一次）',r===true&&snap.flags.HINT_SEEN.save===1&&hintToasts().length===0);
  gap(); HI.tick(GM); check('8-4 字等一下才出，出一次',hintToasts().length===1&&hintToasts()[0]===T.hints.save&&HI.fire(GM,'save',{later:true})===false); }
/* ======================= 9 接點 ======================= */
{ const g=rd('src/game3d.js'), ix=rd('index.html');
  check('9-1 game3d.js：每 30 格叫 HINTS.tick',/HINTS\.tick\(GM\)/.test(g));
  check('9-2 game3d.js：打開手機、花錢、存檔（欄位、快速存檔）叫 HINTS.fire',/HINTS\.fire\(GM,'phone'\)/.test(g)&&/HINTS\.fire\(GM,'buy'\)/.test(g)&&(g.match(/HINTS\.fire\(GM,'save',\{later:true\}\)/g)||[]).length===2);
  check('9-3 game3d.js：設定「提示」讀、寫（S.hints，和其他設定一起存）',/\$\('setHints'\)\.checked=S\.hints!==false/.test(g)&&/\$\('setHints'\)\.onchange=e=>\{ S\.hints=e\.target\.checked; saveSettings\(\); \}/.test(g));
  check('9-4 index.html：#helpBox、#setHints、設定那一行的字和資料一樣',ix.includes('id="helpBox"')&&ix.includes('id="setHints"')&&ix.includes('<span id="setHintsLabel">'+T.settingLabel+'</span>'));
  const a=ix.indexOf('<script src="src/data/help_text.js'), b=ix.indexOf('<script src="src/hints3d.js'), c=ix.indexOf('GAME.boot()'), m=ix.indexOf('id="helpBox"');
  check('9-5 index.html：help_text.js 在 hints3d.js 前面，都在 #helpBox 後面、GAME.boot 前面',m>0&&a>m&&b>a&&c>b);
  check('9-6 index.html：說明頁不再寫死舊的字',!/3D 原型。你是首都帝大法律系一年級/.test(ix)&&!/多數 NPC 模型為程序化生成的暫代模型/.test(ix)); }
H.done();
