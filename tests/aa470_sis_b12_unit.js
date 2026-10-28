// AA_470 學姊第十二批：三種玩家總檢查，大一暑假到大四寒假補七場（企劃線 5f54b6545，AA-B 2026-10-25 18:1x；SIS-LEAD-1021、D111、USER_WANTS C25）——不需要瀏覽器。
// 2026-10-28 改（AA_497 第 5 節，企劃線 7a38216ca）：Kevin 動物影片第 6 則（10/26）換成他自己的事、2027-03-08 學妹在群組問考古題那一段拿掉（改宜蓁私訊）、gradPost「學姊多講兩個字」換掉、家族的學妹叫宜蓁——第 0、2、6 項照新的寫（新句子在 tests/aa497_supporting_unit.js 對 AA_497 的稿）。
// 台詞逐字對 AA_470（從企劃線 git show 讀稿、解析「誰：台詞」與選項）。三種存檔：交往中、朋友（認識、熟悉／朋友以上、沒交往）、沒認識（沒有 met_sis）。
//   0  讀稿；新檔載得到、index.html 接在 sis_b11_3d.js 後面；第 3 節每一句、每個選項都在遊戲裡（{稱呼}＝學弟／名字兩版），遊戲裡每一句都在稿裡；人物頁七個記憶
//   1  12-1 學生證：7/6～7/31 平日 9～17 總圖閱覽區找她說話先演（SISY23.preTalk 鏈）；稱呼兩版；選項；熟悉 +1、信任 +1、SIS_BORROWED_CARD；窗口外、沒認識、前任、不熟不演；第 21 天 21:00 私訊兩則
//   2  12-2 大二的家族群組四則（沒認識的也收到；不在群組沒有）
//   3  12-3 大二寒假：1/12 群組（認識的才有「我也在。」）→ 1/13 19:00 火鍋（家族聖誕一句、助教考卷選項、交往中「妳」）→ 群組三句；沒回／沒有選項＝1/13 12:00；沒到＝missed
//   4  12-4 家族讀書會第一次：9/13 群組（選項所有人）→ 9/16 19:00；沒認識的開頭兩句＋記 met_sis／SIS_W1（之後晚到版 W1 不演）；21:40 群組
//   5  12-5 法圖的午休：週五 12～14 法圖找她說話先演（AA_490 第 1 節 SIS-B12-FIX-1027：2028-03-03～04-21 的週五、日本路線到 3/24；原本「3/1～3/24 平日」）；三條路線；交往中「妳」；週一～四、窗口外不演
//      （她真的在法圖的日子逐日查在 tests/aa490_sis_b12_fix_unit.js 第 1 節）
//   6  12-6 Kevin 畢業 6/3 群組（日本＝當地 14:00）；7/10 群組 → 7/13 讀書會最後一次（SIS_STUDY_ROOM；美國交往中最後一句）；日本「我在日本。」；沒認識的沒有選項
//   7  12-7 空白的一月：1/2～2/8 週一二四 19:00～21:30 Café（朋友版）；讀書計畫兩版、SIS_BOOK law／novel／both、寫一格「休息」；交往中、前任、窗口外不演
//   8  4-1 單身朋友版「每天傳一張照片給你」：當面、手機版都記 SIS_PHOTO_TO_YOU；8/3 起平日照片改私訊（第一張多「說好的。」）、週日照舊群組、只留最近 7 張；沒記號照舊
//   9  4-2 交往版「另外一本」：帶哪一本記 SIS_BOOK_WITH_YOU；大四上女朋友版學期末那一頓最後一段＋兩個選項；舊存檔照交往開始的日子判斷；朋友版在 7
//  10  4-3 直屬的午餐換句；4-4 摘要加一句旁白；4-5 日本路線 7/10 一張（九則；舊存檔傳過的不重傳）
//  11  5-1 家族四場（12/5、12/22、3/20、3/27）沒有 SIS_W1 的兩句、演完記 met_sis／SIS_W1；舊存檔讀檔（ROM.rec）補記號
//  12  5-2 Kevin 生日（2026、2027、2028）、口試兩則：在家族群組就收到（沒認識也收到；出遊、SIS_DEFENSE 照舊）
//  13  舊存檔：沒有新旗標照常跑、不丟例外
//  14  第 8 節②（企劃線 110a5b55c）：口試門口（M9 y4_m9）認識她、熟悉以上、在家族群組、不是前任也排；不熟、沒認識（met_sis）、前任、不在群組不排；沒去記 missed；交往中、朋友照舊；不在群組選了「那天我去門口等。」照 sis_b11
// 修改前（開發分支 1dacc06af）：沒有 src/sis_b12_3d.js、src/data/sis_b12_events.js——每一節至少一項 FAIL；第 14 節在 49aefbf15（第 8 節以前）FAIL。用法：node tests/aa470_sis_b12_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/group3d.js','src/y34b3d.js','src/sis_grad3d.js',
  'src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_jp_events.js','src/sis_jp3d.js','src/data/sis_b8_events.js','src/sis_b8_3d.js',
  'src/data/sis_b9_events.js','src/sis_b9_3d.js','src/data/sis_b10_events.js','src/sis_b10_3d.js','src/family_xmas3d.js','src/data/sis_b11_events.js','src/sis_b11_3d.js']) L3(f);   /* index.html 的順序 */
const pre=loadErr.slice(); loadErr.length=0;
const ok1=L3('src/data/sis_b12_events.js'), ok2=L3('src/sis_b12_3d.js');
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{};
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, now=()=>T(H.G.day,H.G.hour);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const X=()=>typeof SISB12!=='undefined'?SISB12:null;
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const evDone=id=>!!(H.G.events&&H.G.events.done&&H.G.events.done[id]);
const relNow=()=>Object.assign({},SOCIAL.rel(ID)), dRel=(a,b)=>({fam:b.fam-a.fam,trust:b.trust-a.trust,comf:b.comf-a.comf});
const ACQ=id=>H.rel(id,10,0,0);
/* 存檔：kind＝'none'（沒認識：沒有 met_sis、沒有 FIRST_MET）／'fam'（熟悉）／'friend'（朋友）／'dating'（交往中）／'ex'（前任）／'acq'（認識、不熟）*/
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; PHONE.rec(G); if(o.grp!==false) PHONE.join(G,'family_law','法律系直屬家族');
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='acq') ACQ(ID); else if(kind==='dating'){ H.FRIEND(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  H.at(key,h); E.player.busy=false; E.paused=false; return G; };
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const walk=(a,b,hs)=>{ for(let d=D(a);d<=D(b);d++) for(const h of (hs||[9,12.5,13.5,19,21.5,22.5])){ at(d,h); ph(); } };
const talk=async(zone,picks)=>{ H.G.zone=zone; H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return SISY23.preTalk(GM); };   /* 找她說話：talkSis 在說話前問 SISY23.preTalk（這一批包了一層）*/
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(STORY_EVENTS.find(e=>e.id===id)); };
const txt=th=>TH(th).map(m=>m.text);
const nm=()=>H.G.name||'祐廷';

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 5f54b6545:"docs/story_planning/AA_470_學姊第十二批_三種玩家總檢查_大一暑假到大四寒假補七場.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const NAMES='學姊|旁白|Kevin|家族的學妹|書瑀|\\{name\\}', QRE=new RegExp('(?:^|[\\s>→|])('+NAMES+')：(.+)$');
const quotes=t=>{ const out=[]; for(let line of t.split('\n')){ line=line.replace(/\s*\|\s*$/,''); for(const p of line.split('／')){ const m=p.match(QRE); if(m) out.push({who:m[1],t:m[2].trim()}); } } return out; };
const optsOf=t=>[...t.matchAll(/^\s*- (「[^」\n]+」|（[^）\n]+）)[^→\n]*→/mg)].map(m=>m[1]);
const S3=part('## 3.','## 4.'), S41=part('### 4-1.','### 4-2.'), S42=part('### 4-2.','### 4-3.'), S43=part('### 4-3.','### 4-4.'), S44=part('### 4-4.','### 4-5.'), S45=part('### 4-5.','### 4-6.'), S51=part('### 5-1.','### 5-2.');
/* 遊戲裡這一批的字：事件的 text、選項，SISB12_LINES 的群組句、私訊 */
const gameTexts=()=>{ const A=[]; const walkL=L=>{ for(const l of L){ if(typeof l.text==='string') A.push(l.text); if(l.choice) for(const c of l.choice) A.push(c.text); } }; for(const e of (typeof SISB12_EVENTS!=='undefined'?SISB12_EVENTS:[])) walkL(e.dialogue||[]);
  const Lx=typeof SISB12_LINES!=='undefined'?SISB12_LINES:{}; const pair=p=>A.push(p[1]); (Lx.cardBack||[]).forEach(t=>A.push(t)); (Lx.fam2||[]).forEach(x=>x.L.forEach(pair));
  for(const k of ['hotAsk','hotNone','hotAfter','studyAsk','studyAfter','gradPost','lastAsk']) (Lx[k]||[]).forEach(pair); for(const k of ['hotYes','gradOpt','lastJp']) if(Lx[k]){ A.push(Lx[k].t); Lx[k].say.forEach(pair); } for(const k of ['studyOpts','lastOpts']) (Lx[k]||[]).forEach(o=>A.push(o.t));
  return A; };

/* ---- 0 ---- */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), at2=s=>html.indexOf(s);
  check('0. 讀得到稿（AA_470 5f54b6545）、前面的檔都載得到',!!doc&&doc.indexOf('## 3. 新場景')>0&&!pre.length,J(pre));
  check('0. 新檔載得到（SISB12、SISB12_LINES、SISB12_EVENTS）',ok1&&ok2&&!!X()&&!loadErr.length&&Array.isArray(typeof SISB12_EVENTS!=='undefined'?SISB12_EVENTS:null),J(loadErr));
  check('0. index.html：data/sis_b12_events.js → sis_b12_3d.js 接在 sis_b11_3d.js 後面、GAME.boot() 前面',/src\/sis_b11_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b12_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b12_3d\.js\?v=[^"]+"><\/script>/.test(html)&&at2('src/sis_b12_3d.js')<at2('<script>GAME.boot();</script>')&&at2('src/sis_b12_3d.js')>at2('src/family_xmas3d.js')&&at2('src/sis_b12_3d.js')>at2('src/y34b3d.js'));
  const mine=new Set(gameTexts().map(t=>String(t).replace(/^「|」$/g,''))), Q=quotes(S3);
  const lost=Q.filter(q=>q.t.indexOf('{稱呼}')>=0?!(mine.has(q.t.replace('{稱呼}','學弟'))&&mine.has(q.t.replace('{稱呼}','{name}'))):!mine.has(q.t)).map(q=>q.who+'：'+q.t);
  /* 2026-10-28 改：AA_497 第 5 節（企劃線 7a38216ca；tests/aa497_supporting_unit.js 5-2、5-4）換掉、拿掉的 AA_470 句子：Kevin 動物影片第 6 則（10/26）、2027-03-08 學妹在群組問考古題那一段（改成宜蓁私訊）、gradPost「學姊多講兩個字」 */
  const AA497_OUT=new Set(['Kevin：📹（一隻貓趴在鍵盤上睡著，螢幕上一整排 j）','Kevin：學姊這次有看完嗎','學姊：有。牠到最後都沒醒。','家族的學妹：請問民總的考古題在哪裡🙏','學姊：置頂第二個資料夾。去年的我也放進去了。','Kevin：學姊回得比我快','Kevin：我還在找置頂在哪','Kevin：學姊多講兩個字','學姊：恭喜畢業。']);
  check('0. 第 3 節每一句（'+Q.length+' 句，誰：台詞）都在遊戲裡（{稱呼}＝「學弟」「{name}」兩版；AA_497 換掉的 '+AA497_OUT.size+' 句除外、而且真的不在遊戲裡）',Q.length>=120&&!lost.filter(x=>!AA497_OUT.has(x)).length&&[...AA497_OUT].every(x=>lost.includes(x)),J(lost.filter(x=>!AA497_OUT.has(x))));
  const O=optsOf(S3), G0=new Set(gameTexts().map(t=>String(t))), lostO=O.filter(o=>!G0.has(o)&&!G0.has(o.replace(/^「|」$/g,'')));
  check('0. 第 3 節每個選項（'+O.length+' 個）都在遊戲裡',O.length>=25&&!lostO.length,J(lostO));
  const EXTRA=['「妳大一的時候呢？」','「妳以前不睡覺？」',   /* 交往中祐廷的選項用「妳」（AA_470 第 2 節稱呼）*/
    '家聚吃什麼 不要再吃咖哩了','學姊 八月國考 妳幫我集氣一次就好','好。日子跟我說。'];   /* AA_497 5-4 換上的句子（對 AA_497 的稿：tests/aa497_supporting_unit.js）*/
  const notIn=[...new Set(gameTexts())].filter(t=>!EXTRA.includes(t)&&doc.indexOf(String(t).replace(/^學弟。/,'{稱呼}。').replace(/^\{name\}。(你的學生證|坐。)/,'{稱呼}。$1'))<0);
  check('0. 遊戲裡這一批的每一句、選項、群組句都在稿裡（一字不差；交往中「妳」兩個選項除外）',!!doc&&!notIn.length,J(notIn));
  const ML=SOCIAL.MEMORY_LABEL||{};
  check('0. 人物頁：七個記憶的名稱照稿括號（SIS_BORROWED_CARD…SIS_BLANK_JAN）',ML.SIS_BORROWED_CARD==='暑假她用你的學生證借書'&&ML.SIS_HOTPOT_Y2==='寒假一起幫 Kevin 吃了一份'&&ML.SIS_FAM_STUDY==='去了家族讀書會的第一次'&&ML.SIS_LAWLIB_KEVIN==='法圖午休，看她把 Kevin 叫醒'&&ML.SIS_FAM_STUDY_LAST==='家族讀書會的最後一次'&&ML.SIS_STUDY_ROOM==='說要幫忙訂討論室'&&ML.SIS_BLANK_JAN==='她給你看過空白的一月'); });

/* ---- 1 12-1 ---- */
await sec(1,async()=>{
  fresh('2026-07-08',10,'fam'); const r0=relNow(); const ran=await talk('library',[1,1]); const r1=relNow(), d=dRel(r0,r1);
  check('1. 7/8（三）10:00 熟悉、在總圖閱覽區找她說話：先演「學生證」（SISY23.preTalk）；熟悉叫「學弟。你的學生證，借我一下。」',ran===true&&seq(['（總圖三樓靠窗的位子。她面前疊著五本書，最上面夾著一張手寫的書單。）','學弟。你的學生證，借我一下。','（你還沒回答，她已經把借書單推過來，書名都寫好了。）','我的學生證六月底停了。研究所的，九月才發。','這三本，用你的名字借。到期以前我還。']),J(said()));
  check('1. 選項一「好。」「妳不是畢業了嗎？」「逾期算誰的？」→「畢業了。書還是要讀。」；櫃台、書單；選項二「還沒想。」「民法。」「什麼都不讀。」→「哪一本。……那本可以。第三章慢慢讀。」；樓梯口收據',
    J(H.opts[0])===J(['「好。」','「妳不是畢業了嗎？」','「逾期算誰的？」'])&&J(H.opts[1])===J(['「還沒想。」','「民法。」','「什麼都不讀。」'])&&seq(['畢業了。書還是要讀。','（櫃台蓋完章，她把三本書抱在手上。最上面那本的書名，你只看得懂一半。）','許老師開的書單。開學以前要讀完。','你暑假讀什麼？','哪一本。……那本可以。第三章慢慢讀。','（走到樓梯口，她把借書的收據折好，夾進計畫本八月那一頁。）'])&&!has('算我的。……不會逾期。'),J({opts:H.opts,said:said()}));
  check('1. 熟悉 +1、信任 +1；記憶 SIS_BORROWED_CARD；SIS_CARD_DAY＝那一天；同一窗口不再演',d.fam===1&&d.trust===1&&SOCIAL.has(ID,'SIS_BORROWED_CARD')&&H.G.flags.SIS_CARD_DAY===D('2026-07-08')&&evDone('ev_sis_borrowed_card')&&X().preTalkEv(H.G)==null&&(at('2026-07-09',10),X().preTalkEv(H.G)==null),J(d));
  for(const [p,line] of [[0,'（她點了一下頭，把三本抽出來疊好。）'],[2,'算我的。……不會逾期。']]){ fresh('2026-07-20',15,'friend'); await talk('library',[p,p===0?0:2]);
    check('1. 朋友以上叫名字「'+nm()+'。你的學生證，借我一下。」；選項一 '+(p+1)+' →「'+line+'」',has(nm()+'。你的學生證，借我一下。')&&!has('學弟。你的學生證，借我一下。')&&has(line)&&has(p===0?'那先睡飽。九月以後就沒有了。':'……也可以。一個暑假而已。'),J(said())); }
  fresh('2026-07-31',16.5,'dating'); const rd=await talk('library',[0,0]);
  check('1. 交往中（大一下學期末）也演；叫名字',rd===true&&has(nm()+'。你的學生證，借我一下。'),J(said()));
  const no=[]; for(const [n,key,h,kind,zone,fl] of [['7/3（窗口前）','2026-07-03',10,'fam'],['8/3（窗口後）','2026-08-03',10,'fam'],['週六 7/11','2026-07-11',10,'fam'],['08:30','2026-07-08',8.5,'fam'],['17:00','2026-07-08',17,'fam'],['在 Café','2026-07-08',10,'fam','cafe'],
    ['沒認識她（met_sis 沒有）','2026-07-08',10,'none'],['前任','2026-07-08',10,'ex'],['認識、不熟','2026-07-08',10,'acq'],['日本路線的玩家（大一沒差，照演）','2026-07-08',10,'fam',null,{}]]){
    fresh(key,h,kind,fl); H.G.zone=zone||'library'; const e=X().preTalkEv(H.G); if(n.indexOf('照演')>=0){ if(e!=='ev_sis_borrowed_card') no.push(n); } else if(e) no.push(n); }
  check('1. 窗口外、週末、9 點前、17 點以後、不在閱覽區、沒認識、前任、不熟：不演',!no.length,J(no));
  fresh('2026-07-08',10,'fam'); await talk('library',[0,0]); const d8=D('2026-07-08');
  at(d8+20,21.5); ph(); const e20=byTag('sisb12_card_back').length; at(d8+21,20.5); ph(); const e21a=byTag('sisb12_card_back').length; at(d8+21,21); ph(); const M=byTag('sisb12_card_back');
  check('1. 演完第 21 天（7/29）21:00 私訊「書還了。三本。」「你的借閱紀錄，沒有逾期。」（不用回；第 20 天、21:00 以前沒有）',e20===0&&e21a===0&&J(M.map(m=>m.text))===J(['書還了。三本。','你的借閱紀錄，沒有逾期。'])&&M.every(m=>m.th==='p:'+ID&&!m.ask&&m.day===d8+21&&m.h===21)&&keyOf(d8+21)==='2026-07-29',J(M));
  at(d8+23,9); ph(); check('1. 不重傳',byTag('sisb12_card_back').length===2);
  fresh('2026-07-08',10,'fam'); await talk('library',[0,0]); at(d8+23,9); ph(); const late=byTag('sisb12_card_back');
  check('1. 跳過那一晚：照第 21 天 21:00 補進來（第 21～23 天讀到才補）',late.length===2&&late[0].day===d8+21&&late[0].h===21,J(late)); });

/* ---- 2 12-2 ---- */
await sec(2,()=>{ const want=[['2026-09-07',['新學期！！下禮拜新的學弟妹進群組','置頂的東西 老人們先整理一下','置頂的筆記我換過了。去年的錯字也改了。','學姊連錯字都改']],
    ['2026-09-14',['歡迎新學弟妹！！（貼圖）','上面那位是溫學姊 碩一 有問題問她 她回很快','學姊好🙏','學妹好。先問你們的直屬，問不到再問我。']],
    ['2026-10-26',['家聚吃什麼 不要再吃咖哩了','期中加油各位','收到。']]];   /* AA_497 5-4：影片第 6 則換成他自己的事、跟著影片的兩句拿掉；5-2：2027-03-08 那一段拿掉（宜蓁改私訊）*/
  fresh('2026-09-06',20,'none'); for(const [k] of want){ at(k,20.5); ph(); at(k,21.2); ph(); at(k,22); ph(); }
  const got=want.map(([k],i)=>byTag('sisb12_fam2_'+i));
  check('2. 沒認識學姊、在家族群組：三則（AA_497 拿掉 2027-03-08 那一則）照稿、照日子 21:00、在「法律系直屬家族」群組',got.every((M,i)=>J(M.map(m=>m.text))===J(want[i][1])&&M.every(m=>m.th==='g:family_law'&&keyOf(m.day)===want[i][0]&&m.h>=21&&m.h<21.25&&!m.ask)),J(got.map(M=>M.map(m=>keyOf(m.day)+' '+m.h+' '+m.text))));
  check('2. 說話的人：Kevin／溫學姊／家族的學妹（family_junior，第一次出現在 9/14；AA_497 5-2 起叫「宜蓁」）',got[1][2].from==='family_junior'&&got[1][2].name==='宜蓁'&&got[0][0].from==='kevin'&&got[0][0].name==='Kevin'&&got[0][2].from===ID,J(got[1].map(m=>[m.from,m.name])));
  const n0=(H.G.msgs||[]).filter(m=>/^sisb12_fam2_/.test(m.tag||'')).length; at('2026-10-26',23); ph(); ph();
  check('2. 不重傳',(H.G.msgs||[]).filter(m=>/^sisb12_fam2_/.test(m.tag||'')).length===n0&&n0===11);
  fresh('2026-09-06',20,'friend',{},{grp:false}); for(const [k] of want){ at(k,21.5); ph(); }
  check('2. 不在家族群組：沒有',!(H.G.msgs||[]).some(m=>/^sisb12_fam2_/.test(m.tag||''))); });

/* ---- 3 12-3 ---- */
await sec(3,async()=>{ const a=D('2027-01-12'), b=D('2027-01-13');
  fresh('2027-01-12',20,'none'); ph(); const e0=byTag('sisb12_hot_ask').length; at(a,21); ph(); const M=byTag('sisb12_hot_ask');
  check('3. 沒認識學姊：1/12 21:00 群組「寒假還有誰在台北的」「我回家第三天 已經被我媽唸兩次了」「我在。」；沒有選項',e0===0&&J(M.map(m=>m.text))===J(['寒假還有誰在台北的','我回家第三天 已經被我媽唸兩次了','我在。'])&&M.every(m=>!m.ask&&m.th==='g:family_law'&&m.h===21)&&M[2].from===ID,J(M));
  at(b,11.9); ph(); const n1=byTag('sisb12_hot_none').length; at(b,12); ph(); const N=byTag('sisb12_hot_none');
  check('3. 沒有選項的：1/13 12:00「好吧 那學姊幫大家吃一份」「不要。」（12:00 以前沒有）；不排出遊',n1===0&&J(N.map(m=>m.text))===J(['好吧 那學姊幫大家吃一份','不要。'])&&N[0].h===12&&!OUT.get(H.G,'sisb12_hotpot'),J(N));
  fresh('2027-01-12',21,'fam'); ph(); const m=byTag('sisb12_hot_ask').find(x=>x.ask);
  check('3. 認識她（熟悉）：「我在。」那一則有選項「我也在。」（回到 1/13 12:00）',!!m&&m.text==='我在。'&&J(m.ask.opts.map(o=>o.t))===J(['我也在。'])&&m.ask.until===T(b,12),J(m));
  PHONE.answer(H.G,'sisb12_hot_ask',0); ph(); const after=TH('g:family_law').slice(-5).map(x=>x.text), q=OUT.get(H.G,'sisb12_hotpot');
  check('3. 回「我也在。」→ Kevin「那你們兩個去吃火鍋 幫我吃一份」、學姊「……明天七點。去年聖誕節那家。」、Kevin「要拍照給我看」、學姊「不要。」；排出遊 1/13（三）19:00「公館的火鍋店（幫 Kevin 吃一份）」',
    J(after)===J(['我也在。','那你們兩個去吃火鍋 幫我吃一份','……明天七點。去年聖誕節那家。','要拍照給我看','不要。'])&&!!q&&q.day===b&&q.h===19&&q.title==='公館的火鍋店（幫 Kevin 吃一份）'&&q.ev==='ev_sis_hotpot_y2',J({after,q}));
  at(b,12.5); ph(); check('3. 回了：12:00 那兩則不傳',!byTag('sisb12_hot_none').length);
  H.G.flags.SIS_FAMXMAS_Y1='pencil'; H.G.events.done.ev_sis_ta_papers=1; const r0=relNow(); at(b,18.8); await goOut('sisb12_hotpot',[2,1]); const r1=relNow(), d=dRel(r0,r1);
  check('3. 火鍋：開場照稿；去過家族聖誕多「（她點了兩盤肉。去年聖誕節，她的碗裡只有白飯和青菜。）」；「期末考得怎樣。」',seq(['（公館那家火鍋。去年聖誕節，家族坐的是裡面那張長桌。今天店員帶你們到靠窗的兩人桌。）','Kevin 說要幫他吃一份。','我們吃兩份就好。','（她點了兩盤肉。去年聖誕節，她的碗裡只有白飯和青菜。）','期末考得怎樣。']),J(said()));
  check('3. 選項一（演過助教的考卷）三個 →「昨天改完。紅筆用完一支。」；湯滾了；選項二「他現在也這樣嗎？」「學姊大一的時候呢？」「（笑出來）」→「我坐最旁邊，負責算錢。……算到現在。」；結帳拍空鍋',
    J(H.opts[0])===J(['「還可以。」','「有一科不太好。」','「妳改的考卷改完了？」'])&&J(H.opts[1])===J(['「他現在也這樣嗎？」','「學姊大一的時候呢？」','（笑出來）'])&&seq(['昨天改完。紅筆用完一支。','（湯滾了。她伸手把你那一鍋的火轉小。）','Kevin 大一的時候，家聚吃到一半睡著。','醒來以後說他在想事情。','我坐最旁邊，負責算錢。……算到現在。','（結帳的時候，她拿手機拍了兩個空鍋子。）']),J({opts:H.opts,said:said()}));
  ph(); const G3=byTag('sisb12_hot_after');
  check('3. 熟悉 +2、自在 +2；記憶 SIS_HOTPOT_Y2；SIS_HOTPOT_Y2 went；演完群組「（照片：兩個空的鍋子）」「我的那份呢？？」「吃掉了。」',d.fam===2&&d.comf===2&&SOCIAL.has(ID,'SIS_HOTPOT_Y2')&&H.G.flags.SIS_HOTPOT_Y2==='went'&&J(G3.map(x=>x.text))===J(['（照片：兩個空的鍋子）','我的那份呢？？','吃掉了。'])&&G3.every(x=>x.th==='g:family_law')&&G3[1].from==='kevin',J({d,G3}));
  fresh('2027-01-12',21,'dating'); ph(); PHONE.answer(H.G,'sisb12_hot_ask',0); ph(); at(b,18.8); await goOut('sisb12_hotpot',[0,1]);
  check('3. 交往中也演：沒去家族聖誕的沒有「兩盤肉」；沒演助教考卷的只有兩個選項；選項二用「妳大一的時候呢？」',has('嗯。考完的就不講了。')&&!has('（她點了兩盤肉。去年聖誕節，她的碗裡只有白飯和青菜。）')&&J(H.opts[0])===J(['「還可以。」','「有一科不太好。」'])&&J(H.opts[1])===J(['「他現在也這樣嗎？」','「妳大一的時候呢？」','（笑出來）']),J(H.opts));
  fresh('2027-01-12',21,'friend'); ph(); at(b,12.2); ph();
  check('3. 認識她、沒回：1/13 12:00 那兩則；不排',byTag('sisb12_hot_none').length===2&&!OUT.get(H.G,'sisb12_hotpot'));
  fresh('2027-01-12',21,'ex'); ph(); check('3. 前任：沒有選項',byTag('sisb12_hot_ask').length===3&&!byTag('sisb12_hot_ask').some(x=>x.ask));
  fresh('2027-01-12',21,'friend',{},{grp:false}); ph(); check('3. 不在家族群組：沒有',!byTag('sisb12_hot_ask').length);
  fresh('2027-01-12',21,'friend'); ph(); PHONE.answer(H.G,'sisb12_hot_ask',0); ph(); at(b,19.5); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); at(b,22); ph();
  check('3. 回了「我也在。」沒到：SIS_HOTPOT_Y2 missed；沒有空鍋照片（錯過不補）',H.G.flags.SIS_HOTPOT_Y2==='missed'&&!byTag('sisb12_hot_after').length&&!byTag('sisb12_hot_none').length); });

/* ---- 4 12-4 ---- */
await sec(4,async()=>{ const a=D('2027-09-13'), d=D('2027-09-16');
  fresh('2027-09-13',20,'none'); ph(); at(a,21); ph(); const M=byTag('sisb12_study_ask'), m=M.find(x=>x.ask);
  check('4. 9/13（一）21:00 群組五則照稿；選項（所有人，沒認識的也有）「我去。」／「這週不行。」',J(M.map(x=>x.text))===J(['大四了 國考倒數 家族讀書會開張！！','每週四晚上七點 法圖討論室 學姊帶','我只負責訂討論室。','還有出題','還有出題。'])&&!!m&&m.text==='還有出題。'&&J(m.ask.opts.map(o=>o.t))===J(['我去。','這週不行。'])&&M.every(x=>x.h===21),J(M));
  PHONE.answer(H.G,'sisb12_study_ask',0); ph(); const q=OUT.get(H.G,'sisb12_famstudy');
  check('4. 「我去。」→ 排出遊 9/16（四）19:00「法圖・討論室（家族讀書會）」',!!q&&q.day===d&&q.h===19&&q.title==='法圖・討論室（家族讀書會）'&&q.ev==='ev_sis_fam_study',J(q));
  const r0=relNow(); at(d,18.8); await goOut('sisb12_famstudy',[2]); const r1=relNow(), dd=dRel(r0,r1);
  check('4. 沒認識學姊：開頭多兩句「學姊好，我是'+nm()+'。我是妳的直屬。」「我知道。群組裡那個名字。……坐。」；之後照稿',seq(['（法圖的討論室。白板上寫著今天的日期，下面一行小字：「九點半前離開」。Kevin、家族的學妹，還有兩個你叫不出名字的大四。）','學姊好，我是'+nm()+'。我是妳的直屬。','我知道。群組裡那個名字。……坐。','今天一題。讀完再講。','（她發下來一張 A4，題目只有四行。Kevin 讀到第二行就開始抓頭。）','學姊，這題是陷阱吧。','陷阱在你沒讀的那一行。','（看了 Kevin 一眼）你們兩個坐一起。','（九點二十五分，她把白板擦乾淨。角落已經寫好下週四的日期。）','題目我週三傳。'])&&J(H.opts[0])===J(['「先找爭點。」','「先看條文。」','「我也覺得是陷阱。」']),J(said()));
  const late=STORY_EVENTS.find(e=>e.id==='ev_sis_w1_late'), w1=STORY_EVENTS.find(e=>e.id==='ev_sis_w1');
  check('4. 演完記 met_sis、SIS_W1、FIRST_MET（第一次見面的熟悉照 SOCIAL.meet）；信任 +1；記憶 SIS_FAM_STUDY；之後晚到版 W1 不演',H.G.flags.met_sis===true&&H.G.flags.SIS_W1===true&&SOCIAL.has(ID,'FIRST_MET')&&dd.fam>=1&&dd.trust===1&&SOCIAL.has(ID,'SIS_FAM_STUDY')&&H.G.flags.SIS_FAM_STUDY==='went'&&!!late&&!EVENTS.cond(late.prereq)&&!EVENTS.cond(w1.prereq),J(dd));
  at(d,21.7); ph(); const A=byTag('sisb12_study_after');
  check('4. 9/16 21:40 群組「第一次讀書會 存活」「（照片：擦乾淨的白板，角落寫著下週四的日期）」',J(A.map(x=>x.text))===J(['第一次讀書會 存活','（照片：擦乾淨的白板，角落寫著下週四的日期）'])&&A[0].day===d&&A[0].h>=21.66&&A[0].h<21.95&&A.every(x=>x.from==='kevin'),J(A));
  for(const [p,line] of [[0,'找到幾個？……一個就夠，先寫那一個。'],[1,'條文最後看。先看這個人要什麼。']]){ fresh('2027-09-13',21,'friend'); ph(); PHONE.answer(H.G,'sisb12_study_ask',0); ph(); at(d,18.8); const q0=relNow(); await goOut('sisb12_famstudy',[p]); const qd=dRel(q0,relNow());
    check('4. 認識她的：沒有那兩句自我介紹；選項 '+(p+1)+' →「'+line+'」；熟悉 +1、信任 +1',!has('學姊好，我是'+nm()+'。我是妳的直屬。')&&has(line)&&has('今天一題。讀完再講。')&&qd.fam===1&&qd.trust===1,J({s:said(),qd})); }
  fresh('2027-09-13',21,'friend'); ph(); PHONE.answer(H.G,'sisb12_study_ask',1); ph(); at(d,18.5); ph(); at(d,21.8); ph();
  check('4. 「這週不行。」：不排；21:40 群組照樣收到',!OUT.get(H.G,'sisb12_famstudy')&&byTag('sisb12_study_after').length===2);
  fresh('2027-09-13',21,'none',{},{grp:false}); ph(); at(d,21.8); ph(); check('4. 不在家族群組：都沒有',!byTag('sisb12_study_ask').length&&!byTag('sisb12_study_after').length);
  fresh('2027-09-13',21,'none'); ph(); PHONE.answer(H.G,'sisb12_study_ask',0); ph(); at(d,19.6); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x);
  check('4. 說要去沒到：SIS_FAM_STUDY missed、還是沒認識',H.G.flags.SIS_FAM_STUDY==='missed'&&!H.G.flags.met_sis); });

/* ---- 5 12-5 ---- */
await sec(5,async()=>{
  fresh('2028-03-03',12.5,'fam'); const r0=relNow(); const ran=await talk('lawlib',[2,0]); const r1=relNow(), d=dRel(r0,r1);
  check('5. 3/3（五）12:30 熟悉、法圖找她說話：先演「法圖的午休」；Kevin 同框照稿',ran===true&&seq(['（法圖最裡面那張桌子。她對面坐著 Kevin，額頭貼在一疊考古題上。）','學弟……救我。','他沒事。他在休息。','學姊，妳當年怎麼撐過來的。','我沒有撐。（她把保溫瓶的蓋子轉開）……後來我學會睡覺。'])&&H.said[1].who==='Kevin',J(H.said));
  check('5. 選項一「學姊以前不睡覺？」「Kevin 學長加油。」「那我不吵你們。」→「不吵。坐。這裡有位子。」；「你大三下了。」；選項二 →「嗯。……我會檢查。」；一點五十分叫醒 Kevin、研究小間冷氣',
    J(H.opts[0])===J(['「學姊以前不睡覺？」','「Kevin 學長加油。」','「那我不吵你們。」'])&&J(H.opts[1])===J(['「我會記得睡覺。」','「我還沒想要不要考。」'])&&seq(['不吵。坐。這裡有位子。','（看了你一眼）你大三下了。','明年這個時候，坐在這裡的可能是你。','嗯。……我會檢查。','（一點五十分，她收好計畫本，把 Kevin 叫醒。）','兩點了。我去研究小間。','學姊妳的研究小間有冷氣嗎','有。不借你。']),J({o:H.opts,s:said()}));
  check('5. 熟悉 +1、自在 +2；記憶 SIS_LAWLIB_KEVIN；只演一次',d.fam===1&&d.comf===2&&SOCIAL.has(ID,'SIS_LAWLIB_KEVIN')&&evDone('ev_sis_lawlib_kevin')&&(at('2028-03-10',12.5),X().preTalkEv(H.G)==null),J(d));   /* 下一個週五 3/10 不再演 */
  fresh('2028-03-17',13,'dating'); await talk('lawlib',[1,1]);
  check('5. 交往中也演：選項一換「妳以前不睡覺？」；「Kevin 學長加油。」→ Kevin「學弟好溫暖。學姊妳學一下。」學姊「加油。」Kevin「……謝謝喔。」；「那先不要想。大四上再想也來得及。」',J(H.opts[0])===J(['「妳以前不睡覺？」','「Kevin 學長加油。」','「那我不吵你們。」'])&&seq(['學弟好溫暖。學姊妳學一下。','加油。','……謝謝喔。','那先不要想。大四上再想也來得及。']),J({o:H.opts,s:said()}));
  fresh('2028-03-24',12,'friend',{},{route:'JP'}); await talk('lawlib',[0,0]);
  check('5. 日本路線（3/25 才走）3/24 也演；「以前覺得睡覺很浪費。……後來倒下過一次。」',has('以前覺得睡覺很浪費。……後來倒下過一次。'),J(said()));
  const yes=[]; for(const route of ['TW','US','JP']){ fresh('2028-03-10',12.1,'fam',{},{route}); H.G.zone='lawlib'; if(X().preTalkEv(H.G)==='ev_sis_lawlib_kevin') yes.push(route); }
  check('5. 三條路線都有',yes.length===3,J(yes));
  const no=[]; for(const [n,key,h,kind,zone] of [['3/1（三）','2028-03-01',12.5,'fam'],['3/6（一）','2028-03-06',12.5,'fam'],['2/25（五，窗口前）','2028-02-25',12.5,'fam'],['4/28（五，窗口後）','2028-04-28',12.5,'fam'],['週六 3/4','2028-03-04',12.5,'fam'],['11:50','2028-03-03',11.84,'fam'],['14:00','2028-03-03',14,'fam'],['在 Café','2028-03-03',12.5,'fam','cafe'],['前任','2028-03-03',12.5,'ex'],['不熟','2028-03-03',12.5,'acq'],['沒認識','2028-03-03',12.5,'none']]){
    fresh(key,h,kind); H.G.zone=zone||'lawlib'; if(X().preTalkEv(H.G)) no.push(n); }
  check('5. 週一～週四、窗口外的週五、週末、12 點前、14 點以後、不在法圖、前任、不熟、沒認識：不演',!no.length,J(no)); });

/* ---- 6 12-6 ---- */
await sec(6,async()=>{ const g6=D('2028-06-03'), a=D('2028-07-10'), d=D('2028-07-13');
  fresh('2028-06-03',12,'none'); ph(); const e0=byTag('sisb12_grad').length; at(g6,13); ph(); const M=byTag('sisb12_grad'), m=M.find(x=>x.ask);
  check('6. 6/3（六）13:00 群組（沒認識的也收到）：Kevin 學士服照片、「我畢業了！！！」、「恭喜。」、（AA_497 5-4 換）「學姊 八月國考 妳幫我集氣一次就好」「好。日子跟我說。」；選項「學長恭喜！」',e0===0&&J(M.map(x=>x.text))===J(['（照片：學士服，站在霖澤館門口，比了一個 V）','我畢業了！！！','恭喜。','學姊 八月國考 妳幫我集氣一次就好','好。日子跟我說。'])&&M[0].h===13&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['學長恭喜！']),J(M));
  PHONE.answer(H.G,'sisb12_grad',0); const last=TH('g:family_law').slice(-2).map(x=>x.text);
  check('6. 「學長恭喜！」→ Kevin「學弟明年換你！！」',J(last)===J(['學長恭喜！','學弟明年換你！！']),J(last));
  fresh('2028-06-03',12,'friend',{},{route:'JP'}); H.G.flags.JP_DEPARTED=D('2028-03-25'); at(g6,15); ph(); const J6=byTag('sisb12_grad');
  check('6. 日本路線（人在日本）：當地 14:00（臺灣 13:00）',J6.length===5&&J6[0].h===14,J(J6.map(x=>x.h)));
  fresh('2028-07-10',20,'friend'); ph(); at(a,21); ph(); const L7=byTag('sisb12_last_ask'), m7=L7.find(x=>x.ask);
  check('6. 7/10（一）21:00 群組「最後一次家族讀書會 這週四」「學姊下個月就飛了 我下個月就考了」「題目我出好了。」；人在臺灣「我去。」／「這週不行。」',J(L7.map(x=>x.text))===J(['最後一次家族讀書會 這週四','學姊下個月就飛了 我下個月就考了','題目我出好了。'])&&L7[0].h===21&&!!m7&&J(m7.ask.opts.map(o=>o.t))===J(['我去。','這週不行。']),J(L7));
  PHONE.answer(H.G,'sisb12_last_ask',0); ph(); const q=OUT.get(H.G,'sisb12_famstudy_last');
  check('6. 「我去。」→ 排出遊 7/13（四）19:00「法圖・討論室（讀書會最後一次）」',!!q&&q.day===d&&q.h===19&&q.title==='法圖・討論室（讀書會最後一次）',J(q));
  const r0=relNow(); at(d,18.8); await goOut('sisb12_famstudy_last',[0]); const r1=relNow(), dd=dRel(r0,r1);
  check('6. 讀書會最後一次照稿；「我可以訂討論室。」→「……好。題目我從那邊寄。」；最後「八月二號。……群組會說。」',seq(['（法圖的討論室。白板只寫了一題，下面沒有寫「九點半前離開」。）','最後一題。寫完的先走。','（九點，桌上只剩你和 Kevin。Kevin 寫完，把筆一丟，趴在桌上。）','學姊，下學期誰帶？','你考完就畢業了。你不用管。','學弟他們那一屆啊。','（她看了你一眼，沒有回答，把白板擦乾淨。）','……好。題目我從那邊寄。','（走出法圖，Kevin 說他要去吃宵夜。她說她要回家收行李。）','八月二號。……群組會說。'])&&J(H.opts[0])===J(['「我可以訂討論室。」','「讀書會還要繼續嗎？」','（幫她擦白板）']),J(said()));
  check('6. 熟悉 +1、自在 +1；記憶 SIS_FAM_STUDY_LAST；選第一個記 SIS_STUDY_ROOM（旗標＋記憶）',dd.fam===1&&dd.comf===1&&SOCIAL.has(ID,'SIS_FAM_STUDY_LAST')&&SOCIAL.has(ID,'SIS_STUDY_ROOM')&&H.G.flags.SIS_STUDY_ROOM===true&&H.G.flags.SIS_FAM_STUDY_LAST==='went',J(dd));
  fresh('2028-07-10',21,'dating',{},{route:'US'}); ph(); PHONE.answer(H.G,'sisb12_last_ask',0); ph(); at(d,18.8); await goOut('sisb12_famstudy_last',[2]);
  check('6. 美國路線、交往中：最後一句「八月二號。……你不用送，我們同一班。」；（幫她擦白板）→ 板擦；沒有 SIS_STUDY_ROOM',has('八月二號。……你不用送，我們同一班。')&&!has('八月二號。……群組會說。')&&has('（她把板擦遞給你，自己去收桌上的考卷。）')&&!H.G.flags.SIS_STUDY_ROOM,J(said()));
  fresh('2028-07-10',20,'friend',{},{route:'JP'}); H.G.flags.JP_DEPARTED=D('2028-03-25'); at(a,22.5); ph(); const mj=byTag('sisb12_last_ask').find(x=>x.ask);
  check('6. 日本路線（人在日本）：當地 22:00；選項「我在日本。」',!!mj&&Math.floor(mj.h)===22&&mj.day===a&&J(mj.ask.opts.map(o=>o.t))===J(['我在日本。']),J(mj));
  PHONE.answer(H.G,'sisb12_last_ask',0); ph(); const lj=TH('g:family_law').slice(-3).map(x=>x.text);
  check('6. 「我在日本。」→ Kevin「對齁 學弟在日本」、學姊「題目傳給你。」；沒有出遊',J(lj)===J(['我在日本。','對齁 學弟在日本','題目傳給你。'])&&!OUT.get(H.G,'sisb12_famstudy_last'),J(lj));
  fresh('2028-07-10',21,'none'); ph(); check('6. 沒認識她：7/10 三則照收、沒有選項（選項要認識她，AA_470 5-2）',byTag('sisb12_last_ask').length===3&&!byTag('sisb12_last_ask').some(x=>x.ask)); });

/* ---- 7 12-7 ---- */
await sec(7,async()=>{
  fresh('2029-01-08',19.5,'friend',{SIS_PLAN_POSTED:true,SIS_BOOK:'law'}); const r0=relNow(); const ran=await talk('cafe',[1,1]); const r1=relNow(), d=dRel(r0,r1);
  check('7. 1/8（一）19:30 朋友、Café 找她說話：先演「空白的一月」；叫名字；貼過讀書計畫＝「十月那份讀書計畫。後來照著做了多少？」',ran===true&&seq(['（兩點半 Café。她坐在老位子，桌上一杯熱水、一本新的計畫本。）',nm()+'。坐。','十月那份讀書計畫。後來照著做了多少？'])&&!has('寒假你怎麼排的？'),J(said()));
  check('7. 「每一天都照做。」→「……休息日呢。」（你沒有回答。）「那就是沒有。」；空白的一月；「我幫妳寫一格？」→「（看了你一眼）……寫什麼。」寫了「休息」；law＝小說那兩句；結尾＋「休息」還在上面',
    J(H.opts[0])===J(['「大概一半。」','「每一天都照做。」','「沒照做。」'])&&J(H.opts[1])===J(['「空著不好嗎？」','「我幫妳寫一格？」','「美國好玩嗎？」'])&&seq(['……休息日呢。','（你沒有回答。）','那就是沒有。','（她把自己的計畫本翻開，推到你面前。一月那一頁，大部分格子是空的。）','在美國，最後一格寫的是回臺灣。','回來以後，這本一直空著。','（看了你一眼）……寫什麼。','（你在下個禮拜那一格寫了「休息」。她看了一下，沒有擦掉。）','（計畫本旁邊是那本小說。書籤還在快一半的地方。）','回來以後開始看。……還沒看完。','下學期要的書，開學以前跟我說。法圖寒假開得很短。','（她把計畫本收起來。那一格「休息」還在上面。）'])&&!has('回來第一個禮拜翻完了。問號少了一點。'),J({o:H.opts,s:said()}));
  check('7. 自在 +2、信任 +1；記憶 SIS_BLANK_JAN；只演一次',d.comf===2&&d.trust===1&&SOCIAL.has(ID,'SIS_BLANK_JAN')&&evDone('ev_sis_blank_jan')&&(at('2029-01-09',19.5),X().preTalkEv(H.G)==null),J(d));
  fresh('2029-02-08',21,'fam',{SIS_BOOK:'novel'}); await talk('cafe',[0,2]);
  check('7. 熟悉叫「學弟。坐。」；沒貼讀書計畫＝「寒假你怎麼排的？」；novel＝刑訴那兩句；「美國好玩嗎？」→「好玩。……照片你都看過了。」；沒寫一格就沒有最後那句',seq(['學弟。坐。','寒假你怎麼排的？','一半很多了。','好玩。……照片你都看過了。','（計畫本旁邊是那本舊的刑訴，書背的膠帶換了新的。）','回來第一個禮拜翻完了。問號少了一點。','下學期要的書，開學以前跟我說。法圖寒假開得很短。'])&&!has('（她把計畫本收起來。那一格「休息」還在上面。）'),J(said()));
  for(const bk of ['both',undefined]){ fresh('2029-01-02',19,'friend',bk?{SIS_BOOK:bk}:{}); await talk('cafe',[2,0]);
    check('7. SIS_BOOK '+(bk||'沒演過 1-2')+'：沒有「另外一本」那段；「嗯。至少你說實話。」「……我還在習慣。」',has('嗯。至少你說實話。')&&has('……我還在習慣。')&&!said().some(t=>/計畫本旁邊/.test(t)),J(said())); }
  const no=[]; for(const [n,key,h,kind,zone] of [['交往中','2029-01-08',19.5,'dating'],['前任','2029-01-08',19.5,'ex'],['不熟','2029-01-08',19.5,'acq'],['沒認識','2029-01-08',19.5,'none'],['週三 1/10','2029-01-10',19.5,'friend'],['週五 1/12','2029-01-12',19.5,'friend'],['21:30','2029-01-08',21.5,'friend'],['18:55','2029-01-08',18.92,'friend'],['2/12（窗口後）','2029-02-12',19.5,'friend'],['12/28（窗口前）','2028-12-28',19.5,'friend'],['在法圖','2029-01-08',19.5,'friend','lawlib']]){
    fresh(key,h,kind); H.G.zone=zone||'cafe'; if(X().preTalkEv(H.G)) no.push(n); }
  check('7. 交往中、前任、不熟、沒認識、週三週五、21:30 以後、19:00 以前、窗口外、不在 Café：不演',!no.length,J(no)); });

/* ---- 8 4-1 ---- */
await sec(8,async()=>{ const d17=D('2027-11-17');
  fresh('2027-11-17',21.2,'friend',{},{zone:'lawlib'}); H.said=[]; await STORY.sisFormFace(GM);
  check('8. 11/17 雙方單身、朋友、法圖當面：「好。那我明年在美國，每天傳一張照片給你。」→ 記 SIS_PHOTO_TO_YOU',has('好。那我明年在美國，每天傳一張照片給你。')&&H.G.flags.SIS_PHOTO_TO_YOU===true,J(said()));
  fresh('2027-11-17',21.2,'friend',{},{zone:'lawlib'}); H.date('heroine_01'); H.said=[]; await STORY.sisFormFace(GM);
  check('8. 祐廷在交往中（其他人）：「……你們要回。」那一版，不記',has('好。那我明年在美國，每天在家族群組放一張照片。……你們要回。')&&!H.G.flags.SIS_PHOTO_TO_YOU,J(said()));
  fresh('2027-11-17',19,'friend'); for(let h=19;h<=22.6;h+=0.1){ at(d17,+h.toFixed(2)); ph(); } const qa=TH('p:'+ID).find(x=>x.ask&&x.text==='Kevin 說交換志願明天截止。你填了嗎？');
  const f0=!!H.G.flags.SIS_PHOTO_TO_YOU; if(qa) PHONE.answer(H.G,qa.ask.id,0);
  check('8. 沒去法圖：22:30 手機版回了才說出那一句＝記 SIS_PHOTO_TO_YOU（回之前沒有）',!!qa&&!f0&&TH('p:'+ID).some(x=>x.text==='好。那我明年在美國，每天傳一張照片給你。')&&H.G.flags.SIS_PHOTO_TO_YOU===true,J(qa));
  const sweep=()=>{ const out={dm:[],grp:[],sun:[]}; for(let d=D('2028-08-01');d<D('2028-09-10');d++){ at(d,9.5); ph(); if(CALENDAR.dateOf(d).wd===7){ at(d,20.5); ph(); } } return out; };
  fresh('2028-08-01',9,'friend',{SIS_PHOTO_TO_YOU:true}); sweep();
  const dm=TH('p:'+ID).filter(m=>/^y4_m6_d\d+$/.test(m.tag||'')), gw=TH('g:family_law').filter(m=>/^y4_m6_d\d+$/.test(m.tag||'')), sun=TH('g:family_law').filter(m=>/^y4_m6_sun_/.test(m.tag||''));
  const days=[...new Set(dm.map(m=>m.tag))];
  check('8. 有記號：8/3 起平日的照片在私訊（家族群組一張都沒有）；週日的爭論題照舊在家族群組',dm.length>0&&gw.length===0&&sun.length>0&&sun.some(m=>/^今天的爭論題：/.test(m.text)),J({dm:dm.length,gw:gw.length,sun:sun.length}));
  check('8. 只留最近 7 張（私訊也照用；一天算一張）',days.length===7&&!dm.some(m=>m.text==='說好的。'),J(days));
  fresh('2028-08-01',9,'friend',{SIS_PHOTO_TO_YOU:true}); at('2028-08-03',8.9); ph(); const b0=TH('p:'+ID).filter(m=>/^y4_m6_d/.test(m.tag||'')).length; at('2028-08-03',9.5); ph(); at('2028-08-04',9.5); ph(); const dm2=TH('p:'+ID).filter(m=>/^y4_m6_d/.test(m.tag||''));
  check('8. 8/3（四）09:00 第一張「（照片：一片沒有雲的天空）」＋「說好的。」；8/4 那張沒有；都不用回',b0===0&&J(dm2.map(m=>keyOf(m.day)+' '+m.text))===J(['2028-08-03 （照片：一片沒有雲的天空）','2028-08-03 說好的。','2028-08-04 （照片：一張空的桌子）'])&&dm2.every(m=>!m.ask&&Math.floor(m.h)===9),J(dm2.map(m=>keyOf(m.day)+' '+m.h+' '+m.text)));
  at('2028-08-09',9.5); ph(); const w9=TH('p:'+ID).find(m=>m.tag==='y4_m6_d'+D('2028-08-09'));
  check('8. 週三那個月的那一張也改私訊（8/9「（照片：一張手畫的校園地圖）」）',!!w9&&w9.text===Y34B.m6Wed(D('2028-08-09')),J(w9));
  fresh('2028-08-01',9,'friend'); at('2028-08-03',9.5); ph(); const g0=TH('g:family_law').filter(m=>/^y4_m6_d/.test(m.tag||''));
  check('8. 沒記號：照舊在家族群組，沒有「說好的。」',g0.length===1&&g0[0].text==='（照片：一片沒有雲的天空）'&&!TH('p:'+ID).some(m=>m.text==='說好的。'),J(g0)); });

/* ---- 9 4-2 ---- */
await sec(9,async()=>{ const wb=STORY_EVENTS.find(e=>e.id==='ev_sis_which_book');
  fresh('2028-05-18',20,'dating'); H.G.zone='cafe'; H.picks=[0]; await EVENTS.runLines(wb.dialogue,wb);
  check('9. 帶哪一本（交往中、law）：「另外一本，放你那邊。……回來跟你拿。」→ SIS_BOOK_WITH_YOU true',has('另外一本，放你那邊。……回來跟你拿。')&&H.G.flags.SIS_BOOK==='law'&&H.G.flags.SIS_BOOK_WITH_YOU===true);
  fresh('2028-05-18',20,'friend'); H.G.zone='cafe'; H.said=[]; H.picks=[1]; await EVENTS.runLines(wb.dialogue,wb);
  check('9. 朋友：「另外一本，回來再看。」→ SIS_BOOK_WITH_YOU false',has('另外一本，回來再看。')&&H.G.flags.SIS_BOOK_WITH_YOU===false);
  const dinner=async(flags,kind,picks)=>{ fresh('2028-12-24',18.5,kind||'dating',flags); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await TERMEND.dinner(GM,{te:{term:'Y4S1',who:ID,kind:'gf'}}); };
  await dinner({SIS_BOOK:'law',SIS_BOOK_WITH_YOU:true},'dating',[0]);
  const close=(TERMEND_LINES&&TERMEND_LINES.PLACE&&TERMEND_LINES.PLACE.eatery_lib&&TERMEND_LINES.PLACE.eatery_lib.closeGf)||null;
  check('9. 大四上女朋友版那一頓（12/24）的最後：「（你把那本書推過去。…）」「（翻到書籤那一頁）……你沒有往後翻。」；選項「我翻了一頁。」「沒有。」→「哪一頁。……算了，不要講。」',
    seq(['時差還沒調好。我現在很想睡。','（你把那本書推過去。這半年，它一直放在你書桌最上面那一格。）','（翻到書籤那一頁）……你沒有往後翻。','哪一頁。……算了，不要講。'])&&H.opts.some(o=>J(o)===J(['「我翻了一頁。」','「沒有。」']))&&(!close||idx(close)>idx('哪一頁。……算了，不要講。')),J({o:H.opts,s:said()}));
  await dinner({SIS_BOOK:'novel',SIS_BOOK_WITH_YOU:true},'dating',[1]);
  check('9. 「沒有。」→「嗯。」',has('（翻到書籤那一頁）……你沒有往後翻。')&&has('嗯。'),J(said()));
  const none=[]; for(const [n,f] of [['both',{SIS_BOOK:'both',SIS_BOOK_WITH_YOU:false}],['聽的是朋友版',{SIS_BOOK:'law',SIS_BOOK_WITH_YOU:false}],['沒演過 1-2',{}]]){ await dinner(f,'dating'); if(has('（翻到書籤那一頁）……你沒有往後翻。')) none.push(n); }
  check('9. both、聽的是朋友版、沒演過 1-2：沒有那一段',!none.length,J(none));
  fresh('2028-12-24',18,'dating',{SIS_BOOK:'law'}); H.G.events.last.ev_sis_which_book=D('2028-05-18'); H.G.flags.romance[ID].sinceDay=D('2028-04-01'); const leg1=X().bookWithYou(H.G); H.G.flags.romance[ID].sinceDay=D('2028-09-01'); const leg2=X().bookWithYou(H.G);
  check('9. 舊存檔（沒有 SIS_BOOK_WITH_YOU）：帶哪一本那天已經在交往＝算聽過；之後才交往＝沒有',leg1===true&&leg2===false,J([leg1,leg2])); });

/* ---- 10 4-3、4-4、4-5 ---- */
await sec(10,async()=>{
  fresh('2026-11-06',12.3,'fam'); await runEv('ev_sis_lunch_y2',[0]);
  check('10. 4-3 直屬的午餐（朋友版）：最後「我大一的時候，我的學姊也請過我。」；原句「下次你當直屬的時候，記得也要請。」不再出現',has('我大一的時候，我的學姊也請過我。')&&!has('下次你當直屬的時候，記得也要請。')&&idx('我大一的時候，我的學姊也請過我。')>idx('（結帳的時候她已經付好了。）'),J(said()));
  fresh('2026-11-06',12.3,'dating'); await runEv('ev_sis_lunch_y2',[0]); check('10. 4-3 交往版「……下次你請。」照舊',has('……下次你請。')&&!has('我大一的時候，我的學姊也請過我。'));
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/sis_b8_events.js'),'utf8'); check('10. 4-3 原句在 src 裡只剩註解',!/text:'下次你當直屬的時候，記得也要請。'/.test(src));
  fresh('2029-03-21',12.5,'fam'); await runEv('ev_sis_abstract',[1]);
  check('10. 4-4 摘要：「……謝謝。樓下的自助餐，我請。」之後、結尾那句旁白之前加「（樓下的自助餐。她付錢的時候，摘要的資料夾一直夾在手臂下面。）」',seq(['……謝謝。樓下的自助餐，我請。','（樓下的自助餐。她付錢的時候，摘要的資料夾一直夾在手臂下面。）','（她把兩張紙收進資料夾。資料夾的封面貼著一張便利貼：「5/29」。）'])&&idx('（她把兩張紙收進資料夾。資料夾的封面貼著一張便利貼：「5/29」。）')-idx('（樓下的自助餐。她付錢的時候，摘要的資料夾一直夾在手臂下面。）')===1,J(said()));
  const Q44=quotes(S44).map(q=>q.t), Q43=quotes(S43).map(q=>q.t), Q45=quotes(S45).map(q=>q.t);
  const Q45_508=['（照片：研究小間的窗，外面是午後的雷陣雨）','七月每天三點下雨。第三章寫到一半。'];   /* AA_508 0-2 第 3 點（31a4c4002）：「第五章寫到一半。」改「第三章寫到一半。」（對齊 S6-L2、AA_258）；稿 4-5 本身沒改，遊戲照 AA_508 */
  check('10. AA_508 0-2 第 3 點的「改成」在稿裡',(()=>{ try{ return cp.execSync('git show 31a4c4002:"docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md"',{cwd:H.ROOT,encoding:'utf8'}).includes('7/10「第五章寫到一半。」改「第三章寫到一半。」'); }catch(e){ return false; } })());
  check('10. 稿 4-3、4-4、4-5 的句子讀得到、和遊戲一樣',Q43.includes('我大一的時候，我的學姊也請過我。')&&Q44.includes('（樓下的自助餐。她付錢的時候，摘要的資料夾一直夾在手臂下面。）')&&J(Q45)===J(['（照片：研究小間的窗，外面是午後的雷陣雨）','七月每天三點下雨。第五章寫到一半。'])&&J(SISJP_LINES.msgs.find(x=>x.day==='2028-07-10').L)===J(Q45_508),J({Q43,Q44,Q45}));
  fresh('2028-03-24',10,'friend',{},{route:'JP'}); for(let d=D('2028-03-24');d<=D('2028-08-04');d++){ at(d,20); ph(); at(d,22.5); ph(); }
  const M=TH('p:'+ID).filter(m=>/^sisjp_m_/.test(m.tag||'')&&/^（照片/.test(m.text)), m10=TH('p:'+ID).filter(m=>m.tag==='sisjp_m_0710');
  check('10. 4-5 日本路線：九則照順序（6/26、7/10、7/24），7/10（一）臺灣 20:00＝當地 21:00「（照片：研究小間的窗，外面是午後的雷陣雨）」「七月每天三點下雨。第五章寫到一半。」',J(M.map(m=>keyOf(m.day)))===J(['2028-04-03','2028-04-17','2028-05-01','2028-05-15','2028-05-29','2028-06-12','2028-06-26','2028-07-10','2028-07-24'])&&J(m10.map(m=>m.text))===J(Q45_508)&&m10[0].h===21&&H.G.flags.SIS_JP_MSG===9,J(M.map(m=>keyOf(m.day)+' '+m.tag)));
  check('10. 4-5 7/24 那一則照舊 tag sisjp_m_7',TH('p:'+ID).some(m=>m.tag==='sisjp_m_7'&&m.text==='（照片：打開的行李箱，裡面只有一件外套）'));
  fresh('2028-07-24',22,'friend',{},{route:'JP'}); PHONE.at(H.G,D('2028-07-24'),21,[{th:'p:'+ID,from:ID,text:'（照片：打開的行李箱，裡面只有一件外套）'},{th:'p:'+ID,from:ID,text:'收了三天。只收了一件。'}],'sisjp_m_7'); PHONE.tick(H.G); at('2028-07-25',9); ph();
  check('10. 4-5 舊存檔：7/24 那一則已經傳過（sisjp_m_7）不重傳、7/10 過了不補',TH('p:'+ID).filter(m=>m.text==='收了三天。只收了一件。').length===1&&!TH('p:'+ID).some(m=>m.tag==='sisjp_m_0710')); });

/* ---- 11 5-1 ---- */
await sec(11,async()=>{ const T51=[['ev_sis_family_dinner','2025-12-05',18.3,['一分鐘也是遲到。','學姊好，我是{n}。我是妳的直屬。','我知道。群組裡那個名字。','她坐下，從包包拿出一個資料夾。']],
    ['ev_family_xmas_y1','2025-12-22',18.5,['（學姊坐在你對面。她的碗裡只有白飯和青菜。）','學姊好，我是{n}。','我知道。直屬送直屬，我準備的是你的。','她二月要考試，不吃辣，不吃肉丸。不要問。']],
    ['ev_family_dinner','2026-03-20',18.5,['學姊好，我是{n}。','……我知道。家聚你都沒來。今天來了就好。','（看菜單三十秒）我要辣的。今天我請。']],
    ['ev_sis_results_dinner_y1','2026-03-27',19,['學姊好，我是{n}。','……我知道。家聚你都沒來。今天來了就好。','你們真的不用請我。']]];
  const rows=S51.split('\n').filter(l=>/^\|/.test(l.trim())&&/：/.test(l)).map(l=>quotes(l).map(q=>q.t));
  check('11. 稿 5-1 的表讀得到（三列有台詞；3/27 那一列「同 3/20」）',rows.length===3&&/3\/27[^\n]*同 3\/20/.test(S51)&&J(rows[0])===J(['學姊好，我是{name}。我是妳的直屬。','我知道。群組裡那個名字。'])&&J(rows[1])===J(['學姊好，我是{name}。','我知道。直屬送直屬，我準備的是你的。'])&&J(rows[2])===J(['學姊好，我是{name}。','……我知道。家聚你都沒來。今天來了就好。']),J(rows));
  for(const [id,key,h,want] of T51){ const w=want.map(t=>t.replace('{n}',nm()));
    fresh(key,h,'none',{},{zone:id==='ev_sis_family_dinner'?'gongguan':'dorm'}); await runEv(id,[0,0]);
    check('11. '+id+'（'+key+'）沒有 SIS_W1：兩句自我介紹在對的地方；演完記 met_sis、SIS_W1；W1、晚到版不再演',seq(w)&&H.G.flags.met_sis===true&&H.G.flags.SIS_W1===true&&!EVENTS.cond(STORY_EVENTS.find(e=>e.id==='ev_sis_w1').prereq)&&!EVENTS.cond(STORY_EVENTS.find(e=>e.id==='ev_sis_w1_late').prereq),J(said()));
    fresh(key,h,'friend',{},{zone:id==='ev_sis_family_dinner'?'gongguan':'dorm'}); await runEv(id,[0,0]);
    check('11. '+id+' 已經有 SIS_W1：沒有那兩句',!said().some(t=>/^學姊好，我是/.test(t)),J(said())); }
  const save=(flags,mem,done)=>({stage:'law',flags:Object.assign({},flags),social:{rel:{},mem:mem?{[ID]:mem}:{}},events:{done:done||{},last:{},count:0}});
  const cases=[['FAMILY_DINNER 記憶',save({},[{tag:'FAMILY_DINNER'}]),true],['家族聖誕 pencil',save({SIS_FAMXMAS_Y1:'pencil'}),true],['家族聖誕 none（去了沒準備）',save({SIS_FAMXMAS_Y1:'none'}),true],['家族聖誕 missed',save({SIS_FAMXMAS_Y1:'missed'}),false],
    ['12/5 家族聚餐演過',save({},null,{ev_sis_family_dinner:1}),true],['上榜聚餐 ev_sis_results_dinner',save({},null,{ev_sis_results_dinner:1}),true],['上榜聚餐 ev_sis_results_dinner_y1',save({},null,{ev_sis_results_dinner_y1:1}),true],['都沒有',save({},[{tag:'SHARED_MEAL'}]),false]];
  const bad=[]; for(const [n,s,want] of cases){ ROM.rec(s); const got=s.flags.met_sis===true&&s.flags.SIS_W1===true; if(got!==want||(!want&&(s.flags.met_sis||s.flags.SIS_W1))) bad.push(n); }
  check('11. 舊存檔讀檔（game3d.js migrate 叫 ROM.rec）：FAMILY_DINNER、去過家族聖誕、12/5 或上榜聚餐演過＝補 met_sis、SIS_W1；聖誕 missed、都沒有＝不補',!bad.length,J(bad));
  const s2=save({SIS_FAMXMAS_Y1:'pencil',met_sis:true,SIS_W1:true}); ROM.rec(s2); ROM.rec(s2); check('11. 補過、本來就有：讀幾次都一樣',s2.flags.met_sis===true&&s2.flags.SIS_W1===true); });

/* ---- 12 5-2 ---- */
await sec(12,async()=>{
  for(const [y,key,tag] of [['2026','2026-06-02','sisy23_bday_kevin_y1'],['2027','2027-06-02','sisy23_bday_kevin_y2']]){ fresh(key,11,'none'); at(key,12.5); ph(); const M=byTag(tag);
    check('12. '+y+' Kevin 生日貼文：沒認識學姊、在家族群組也收到',M.length===1&&M[0].from==='kevin'&&M[0].th==='g:family_law',J(M)); }
  fresh('2028-06-02',11,'none'); at('2028-06-02',12.5); ph(); const B=byTag('y3_sis_bday');
  check('12. 2028 生日（「學姊今天生日！」「收到。」）：沒認識也收到',J(B.map(m=>m.text))===J(['學姊今天生日！','收到。']),J(B));
  fresh('2028-06-02',11,'acq'); at('2028-06-02',12.5); ph(); check('12. 2028 生日：認識、不熟也收到',byTag('y3_sis_bday').length===2);
  fresh('2028-06-02',11,'none',{},{grp:false}); at('2028-06-02',12.5); ph(); check('12. 不在家族群組：沒有',!byTag('y3_sis_bday').length&&!byTag('sisy23_bday_kevin_y1').length);
  fresh('2029-05-28',20,'none'); at('2029-05-28',21); ph(); const g1=byTag('y4_m9_grp'); at('2029-05-29',18.6); ph(); const g2=byTag('y4_m9_grp_after');
  check('12. 口試：沒認識學姊也收到 5/28 21:00「學姊明天下午四點口試！大家去門口等！」「……不用來。」、5/29 18:30「學姊過了！！（一張研究室門口的照片）」「過了。謝謝大家。」',J(g1.map(m=>m.text))===J(['學姊明天下午四點口試！大家去門口等！','……不用來。'])&&J(g2.map(m=>m.text))===J(['學姊過了！！（一張研究室門口的照片）','過了。謝謝大家。'])&&g2[0].day===D('2029-05-29')&&g2[0].h>=18.5&&g2[0].h<18.75,J({g1,g2}));
  check('12. 口試：沒認識的不排出遊、不記 SIS_DEFENSE',!OUT.get(H.G,'y4_m9')&&H.G.flags.SIS_DEFENSE==null);
  fresh('2029-05-28',20,'friend'); at('2029-05-28',21); ph(); const q=OUT.get(H.G,'y4_m9'); at('2029-05-29',18.6); ph();
  check('12. 朋友照舊：排 5/29 16:00「學姊的口試」、沒到記 missed、18:30 群組',!!q&&q.h===16&&H.G.flags.SIS_DEFENSE==='missed'&&byTag('y4_m9_grp_after').length===2); });

/* ---- 14 第 8 節② ---- */
await sec(14,async()=>{ const a=D('2029-05-28'), d=D('2029-05-29');
  const m9=(kind,flags,o)=>{ fresh('2029-05-28',20,kind,flags,o); at(a,21); ph(); return OUT.get(H.G,'y4_m9'); };
  let q=m9('fam');
  check('14. 熟悉、認識她、在家族群組：5/28 21:00 Kevin「學姊明天下午四點口試！大家去門口等！」＋排 5/29 16:00「學姊的口試」（y4_m9、霖澤館・研究室的走廊、ev_sis_defense）',byTag('y4_m9_grp').length===2&&!!q&&q.day===d&&q.h===16&&q.ev==='ev_sis_defense'&&q.title==='學姊的口試'&&q.place==='霖澤館・研究室的走廊',J(q));
  const r0=relNow(); at(d,15.8); await goOut('y4_m9'); const dd=dRel(r0,relNow());
  check('14. 去了＝演 M9（「（研究室門口的長椅，門上貼著「口試中」。）」…「等妳。大家都是。」「……好。我請大家喝飲料。販賣機的。」）；SIS_DEFENSE there；熟悉 +2',seq(['（研究室門口的長椅，門上貼著「口試中」。）','過了。','……你們怎麼都還在？','等妳。大家都是。','……好。我請大家喝飲料。販賣機的。'])&&H.G.flags.SIS_DEFENSE==='there'&&dd.fam===2,J({s:said(),dd}));
  m9('fam'); at(d,18.6); ph();
  check('14. 熟悉、在群組、沒去：18:30 記 SIS_DEFENSE missed、群組「學姊過了！！」照收',H.G.flags.SIS_DEFENSE==='missed'&&byTag('y4_m9_grp_after').length===2);
  q=m9('fam',{SIS_DEF_DATE:'wait'}); at(a,22); ph();
  check('14. 熟悉、在群組、選了「那天我去門口等。」：排同一趟（只一趟），sis_b11 不另外私訊',!!q&&OUT.rec(H.G).filter(x=>x.id==='y4_m9').length===1&&!byTag('sisb11_m9_dm').length);
  const no=[]; for(const [n,kind,flags,o] of [['認識、不熟','acq'],['沒認識（沒有 met_sis，有 FIRST_MET、熟悉）','fam',{met_sis:false,SIS_W1:false}],['沒認識（陌生）','none'],['前任','ex'],['熟悉、不在家族群組','fam',{},{grp:false}]]){ if(m9(kind,flags,o)) no.push(n); }
  check('14. 不熟、沒認識（met_sis）、前任、不在家族群組：不排（沒認識的看得到群組那一則）',!no.length&&(m9('none'),byTag('y4_m9_grp').length===2),J(no));
  m9('fam',{SIS_DEF_DATE:'wait'},{grp:false}); const dm=byTag('sisb11_m9_dm'), qb=OUT.get(H.G,'y4_m9');
  check('14. 不在家族群組、選了「那天我去門口等。」：照 sis_b11（5/28 21:00「明天四點。……你說要來的。」＋同一趟）',dm.length===1&&dm[0].text==='明天四點。……你說要來的。'&&!!qb&&qb.h===16,J({dm,qb}));
  q=m9('dating'); const qf=(m9('friend'),OUT.get(H.G,'y4_m9'));
  check('14. 交往中（私訊「明天四點口試。……你坐在外面就好。」＋排）、朋友在群組（排）：照舊',!!q&&!!qf&&(m9('dating'),byTag('y4_m9_dm').some(x=>x.text==='明天四點口試。……你坐在外面就好。')),J({q,qf})); });

/* ---- 13 ---- */
await sec(13,async()=>{ const errs=[]; const ow=console.warn; console.warn=(...a)=>{ if(/SISB12/.test(String(a[0]))) errs.push(a.map(String).join(' ')); };
  try{ for(const key of ['2026-07-10','2026-09-07','2027-01-12','2027-09-16','2028-03-02','2028-07-10','2029-01-08','2029-02-10']){ const G=fresh(key,21,'friend'); delete G.outings; delete G.phone; G.msgs=[]; ph(); H.G.zone='cafe'; X().preTalkEv(H.G); } } finally { console.warn=ow; }
  check('13. 舊存檔（沒有 outings、phone、新旗標）：照常跑、不丟例外',!!X()&&!errs.length,J(errs)); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
