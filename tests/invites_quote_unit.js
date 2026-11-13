// 邀約有名字說話的台詞不加外面的「」（AA-B 2026-11-08 00:21）——不需要瀏覽器（D131）。
// 規則：src/data/invites.js 裡在對話框「有名字」說出來的台詞（GM.say(who,…) 說話的人不是 null：INV.S.playLines、一起走路的字幕 GM.caption(名字,…)、
//   交換聯絡方式 GM.say(who,l.say)、約念書的道別 GM.say(who,…)、{me} 祐廷說的）拿掉外面那一對「」；
//   沒有名字的（toast、沒有名字的字幕、引用她的話的旁白、系統訊息）照留「」；整句（…）的旁白、選項、手機訊息不動。
//   LIBQ.quiet：「好。」→（小聲）好。（不是（小聲）「好。」）
// 檢查：
//   1. invites.js 有名字的格子（下面 SPEAKER 的清單；函式裡的句子照原始碼找）沒有一句外面還有「」；原始碼全檔也沒有（invites.js 沒有「沒名字」又整句「」的格子）
//   2. 沒名字的、旁白裡引用她的話的照留「」：旁白裡的「…」、好幾個人一來一往的「…」「…」；選項字不動（（走出法圖）「…」第六批拿掉裡面的「」＝（走出法圖）…，她說的）
//   3. 演出來：INV.S.playLines 有名字的句子 who 不是 null（含（小聲）開頭、（走出法圖）…這兩種括號開頭的；第六批起 S.narrLine＝整句一對（）才是旁白），整句旁白 who＝null；
//      有名字的格子裡（ 開頭的句子，不是（小聲）（走出）那兩種的，都要整句是動作（不然拿掉「」以後會被當成旁白）
//   4. LIBQ.quiet('「好。」')==='（小聲）好。'；動作括號合成、已經小聲的不動
//   5. 表上的句子對得到 invites.js 拿掉「」的句子，有沒有「」都一樣（INV.replyRow／S.lineKey；第二批 invite_replies.js 也拿掉了，舊存檔 m.t 記的還有「」）
// 修改前：1、4 FAIL（invites.js 還有「」；quiet 回（小聲）「好。」）。
// 第二批（AA-B 11-08 01:09，TEXT-QUOTE-UNIFY-1108）：四個檔也拿掉有名字說的台詞外面的「」，和改之前的版本（BASE＝c79414b00）逐句比：
//   6. src/data/invite_replies.js（AA_415，build_replies.py 產生）：lines 裡她說的、{me} 沒有外面的「」；和 BASE 比只差外面的「」（其他欄位、say 表上原文一字不差）；誰說的（S.narrLine）每一句都和 BASE 一樣
//   7. src/data/rel_lines.js：up／bye／cafe 的台詞（SOCIAL.playSteps 播，有名字）沒有外面的「」；選項字、便條、見面旁白（裡面引用的「…」）照舊；
//      SOCIAL.playSteps 播 BASE 和現在的每一串台詞：說的人、畫面上的字一句一句都一樣（playSteps 原本就把整句「」拿掉）；
//      見面那一格（meet）：BASE 用開頭的「判斷是她說的（src/invites3d.js 舊的 /^「/），現在 {t,say:true}（SOCIAL.meetText／meetPick）：每一格說的人一樣、字只差外面的「」；
//      阿凱燒臘店「認識」那一格演出來（INV.meet）：阿凱說「好，我餓了。」
//   8. src/data/invite_place_lines.js（AA_714／AA_721，import_place_acc.py 產生）：acc、firstAt 沒有外面的「」、no（灰掉的說明，沒名字）照留；和 BASE 比只差外面的「」；誰說的一樣；--check 通過
//   9. src/data/sport_invite_lines.js（AA_715，import_sport_invites.py 產生）：people 的 acc／firstAt／sport／beforeLearn 沒有外面的「」、shared（旁白）一字不差；和 BASE 比只差外面的「」；誰說的一樣；--check 通過
//  10. src/invites3d.js：見面旁白用 meetPick 的 say、afterMeet 用 S.narrLine 分（不再看開頭的「）；程式自己不在有名字的台詞外面加「」（前任學姊「最近忙。」、期末飯婉拒）
// 第二批修改前：6、7（沒有外面「」、meetText、阿凱）、8、9（沒有外面「」）、10 FAIL。用法：node tests/invites_quote_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const ctx=vm.createContext({console,setTimeout,clearTimeout});
const load=(f,names)=>{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(s,ctx,{filename:f}); };
const SRC=fs.readFileSync(path.join(ROOT,'src/data/invites.js'),'utf8');
load('src/data/l118_redo772.js',['L118_REDO']); load('src/data/invites.js',['INVITE_DATA']); load('src/invites3d.js',['INV']); load('src/libquiet3d.js',['LIBQ']);
if(fs.existsSync(path.join(ROOT,'src/data/invite_replies.js'))) load('src/data/invite_replies.js',['INVITE_REPLIES']);
const D=ctx.INVITE_DATA, INV=ctx.INV, LIBQ=ctx.LIBQ;
/* 外面整句一對「」（「A」「B」這種好幾段的不算）*/
const wrapped=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0&&i!==t.length-1) return false; } } return d===0; };
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const literals=s=>{ const out=[]; const re=/'((?:[^'\\\n]|\\.)*)'/g; let m; while((m=re.exec(noComments(s)))) out.push(m[1]); return out; };
/* 一個格子裡所有的字串：陣列、物件、{me}、{say}、函式（原始碼裡的字串常值）*/
const strings=(v,out)=>{ out=out||[]; if(v==null) return out; if(typeof v==='string') out.push(v); else if(typeof v==='function') out.push(...literals(String(v))); else if(Array.isArray(v)) for(const x of v) strings(x,out); else if(typeof v==='object') for(const k of Object.keys(v)) if(k!=='if'&&k!=='onlyAt') strings(v[k],out); return out; };
/* ---------- 分類（key → 誰讀 → 有沒有名字）----------
   有名字（拿掉「」）：
     people.*.acc／first／plan／here／rule：INV.personal → INV.flow 的 S.playLines(GM,who,…)（who＝{name}／{name:名字（手機）}）
     people.*.partnerSay：INV.flow S.playLines(GM,{name},ps)
     people.*.firstAt：INV.firstAt → S.playLines；people.*.sport：INV.sportLines → S.playLines
     people.*.walk：INV.walkChat 的 GM.caption(名字,…)（S.narrLine＝旁白才沒有名字）；選項句 INV.walkAsk → S.playLines，{me} → GM.say({name:祐廷})
     mrelL2：INV.personal → S.playLines；exchange[].say：story3d.js talkCharacter GM.say(who,l.say)
     libStudy.bye、first.*.bye、sit：GM.say(who,…)；libStudy.lead／full／mid／pack／close：S.playLines
     seatOpen.*：INV.seatOpenLines、movieEnd → S.playLines
     mokuyobiAcc、offbeatAcc、afarAcc、daybreakAcc、yangyangAcc、cornerAcc、aokiAcc（併進 people.*.acc）、aokiAcc0（src/ggshops_sys3d.js → lines）
     walk118、slowreadLines、lawlibLines、lakeLines（併進 people.*）
   沒有名字（照留）：why（系統字）、sport（共用旁白）、libStudy.seated（GM.say(null,…)）、people.*.afterMeet（旁白；invites3d.js 用 /^「/ 判斷）、places[].lateNote（旁白）*/
const PEOPLE_KEYS=['acc','first','plan','here','rule','partnerSay','firstAt','sport','walk','beforeLearn','scene'];
const SPEAKER=[];
for(const id of Object.keys(D.people||{})) for(const k of PEOPLE_KEYS) if(D.people[id][k]!=null) SPEAKER.push(['people.'+id+'.'+k,D.people[id][k]]);
SPEAKER.push(['mrelL2',D.mrelL2],['exchange.say',Object.values(D.exchange||{}).map(L=>L.map(x=>x.say||null))]);
const LSd=D.libStudy||{}; for(const k of ['lead','full','mid','pack','close','sit','bye']) SPEAKER.push(['libStudy.'+k,LSd[k]]); for(const id in (LSd.first||{})) SPEAKER.push(['libStudy.first.'+id,LSd.first[id]]);
for(const k of Object.keys(D.seatOpen||{})) if(k!=='byPlace') SPEAKER.push(['seatOpen.'+k,D.seatOpen[k]]);
for(const k of ['mokuyobiAcc','offbeatAcc','afarAcc','daybreakAcc','yangyangAcc','cornerAcc','aokiAcc','aokiAcc0','walk118','slowreadLines','lawlibLines','lakeLines']) SPEAKER.push([k,D[k]]);
const NOSPEAKER=[['why',D.why],['sport',D.sport],['libStudy.seated',LSd.seated]];
for(const id of Object.keys(D.people||{})) if(D.people[id].afterMeet) NOSPEAKER.push(['people.'+id+'.afterMeet',D.people[id].afterMeet]);
/* 1 */
{ const bad=[]; let n=0; for(const [k,v] of SPEAKER) for(const t of strings(v)){ n++; if(wrapped(t)) bad.push(k+'：'+t); }
  check('1. 有名字的格子（'+SPEAKER.length+' 格、'+n+' 個字串）沒有一句外面還有「」',n>600&&bad.length===0,bad.slice(0,8).join('／')+(bad.length>8?'…（共 '+bad.length+'）':''));
  const all=literals(SRC).filter(wrapped); check('1. invites.js 原始碼（註解以外）沒有整句「」的字串（這個檔沒有「沒名字又整句「」」的格子）',all.length===0,all.slice(0,8).join('／'));
  const ns=[]; for(const [k,v] of NOSPEAKER) for(const t of strings(v)) if(wrapped(t)) ns.push(k+'：'+t);
  check('1. 分類：沒名字的格子本來就沒有整句「」的句子（有的話要照留，這支測試要改）',ns.length===0,ns.join('／')); }
/* 2 */
{ const has=(L,t)=>strings(L).includes(t);
  const P=D.people||{};
  check('2. 旁白裡引用她的話照留「」（子晴答應總圖、沛珊的便條、約念書中途的便利貼）',
    has(P.heroine_04&&P.heroine_04.acc,'（她答應了，條件是「二樓靠窗，有插座的那一排」。）')&&has(P.classmate_peishan&&P.classmate_peishan.afterMeet,'（她遞過來一張便條：「今天念了 42 頁。你呢？」）')
    &&strings(LSd.mid).some(t=>/^（她把一張便利貼推過來：「這一題你會嗎？」/.test(t)));
  check('2. 好幾個人一來一往的「…」「…」照留（阿哲、柏翰一起走路的句子）',has(D.walk118,'「宵夜是讀書的一部分。這叫補充體力的權利。」「沒有這個權利。」「先有。」')&&has(D.walk118,require('./overlay_expect.js').fwd('invites','classmate_bohan','「考完了，我在總圖門口站了五分鐘，不知道要去哪。……你要去哪？」「燒臘店。」「……喔。好。那你去。」'))   /* 2026-11-11（X324 D 區，AA_784）：柏翰這一句拿掉刪節號，一來一往的「…」「…」照留——舊期望＝fwd 裡面的字 */);
  check('2. 沛珊第一次去法圖：（走出法圖）館員人好好……（AA_595 1-D10；她說的，第六批拿掉說的話那一對「」，TEXT-QUOTE-UNIFY-1108、tests/invites_quote_b6_unit.js）',has(D.lawlibLines,'（走出法圖）館員人好好。我以為法圖的人都很兇。')&&!has(D.lawlibLines,'（走出法圖）「館員人好好。我以為法圖的人都很兇。」'));
  const chT=[]; (function w(v){ if(Array.isArray(v)) v.forEach(w); else if(v&&typeof v==='object'){ if(Array.isArray(v.ch)) for(const c of v.ch) chT.push(c.t); for(const k of Object.keys(v)) if(k!=='ch') w(v[k]); } })(Object.values(P).map(p=>p.walk));
  check('2. 選項字不動（芷若猜電影、阿凱、子晴、沛珊的選項）',chT.length>=9&&chT.includes('愛情片。')&&!chT.includes('（說換方向的事）')/* （CANON-NO-ECON-1112 第四批：照 AA_894 第 4 節，子晴那一段拿掉）*/&&chT.includes('不一定是告，可以請警察來看'),JSON.stringify(chT)); }
/* 3 */
(async()=>{
  const said=[]; const GM={G:{name:'祐廷',day:10,hour:15},say:async(who,t)=>{ said.push({who:who?who.name:null,t}); }};
  const play=async(lines,who)=>{ said.length=0; await INV.playLines(GM,who||{name:'以安'},lines); return said.slice(); };
  const J=x=>JSON.stringify(x);
  { const a=await play(D.people.heroine_01.acc.cafe.A);
    check('3. 答應句：有名字、外面沒有「」（以安 Café「好啊。我本來就想去。」）',a.length===1&&a[0].who==='以安'&&a[0].t==='好啊。我本來就想去。',J(a)); }
  { const a=await play(LSd.pack,{name:'學姊'});
    check('3. 約念書收書：旁白沒名字、（小聲）開頭的是她說的（括號開頭的台詞）',a.length===2&&a[0].who===null&&a[1].who==='學姊'&&a[1].t==='（小聲）走吧。',J(a)); }
  { const a=await play(D.lawlibLines.classmate_peishan.firstAt,{name:'沛珊'});
    check('3. 沛珊第一次去法圖：櫃台那句旁白沒名字、（走出法圖）「……」是她說的',a.length===2&&a[0].who===null&&a[1].who==='沛珊',J(a)); }
  { const e=strings(D.people.heroine_04.walk).length&&(function f(v){ if(Array.isArray(v)){ for(const x of v){ const r=f(x); if(r) return r; } } else if(v&&typeof v==='object'){ if(v.once==='ZQ_CHANGE_ASK') return v; for(const k of Object.keys(v)){ const r=f(v[k]); if(r) return r; } } return null; })(D.people.heroine_04.walk);
    const a=e?await play(e.ch[0].r,{name:'子晴'}):[];
    check('3. 子晴「你為什麼換」那一段拿掉（CANON-NO-ECON-1112 第四批：照 AA_894 第 4 節）',!e,J(a)); if(false) check('',
      a.length===7&&a[0].who==='祐廷'&&a[0].t==='念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。'&&a[1].who==='子晴'&&a[1].t===require('./overlay_expect.js').fwd('invites','heroine_04','……你換過？')   /* 2026-11-11（X324 D 區，AA_784）：拿掉刪節號——舊期望「……你換過？」*/&&a[5].who===null,J(a)); }
  { const a=await play(D.seatOpen.meal[0],{name:'芷若'});
    check('3. 一起坐下的開場句：旁白沒名字、她那句有名字',a.length===2&&a[0].who===null&&a[1].who==='芷若'&&a[1].t==='你先點。',J(a)); }
  { const a=await play(D.sport.gym_badminton.during,{name:'阿哲'});
    check('3. 一起運動的共用旁白：沒名字',a.length===1&&a[0].who===null,J(a)); }
  { const zr=D.people.heroine_02.walk.wenzhou[0]; const a=await play(zr.l,{name:'芷若'}).then(async x=>x.concat(await play(zr.ch[2].r,{name:'芷若'})));
    check('3. 一起走路的句子（字幕用 S.narrLine 判斷名字）：她說的不是旁白',a.every(s=>s.who==='芷若')&&strings(D.people.heroine_02.walk).filter(t=>!/^（/.test(t)).every(t=>!INV.narrLine(t)),J(a)); }
  { const rest=t=>{ let r=t; while(r.startsWith('（')){ let d=0,k=-1; for(let i=0;i<r.length;i++){ const c=r[i]; if(c==='（') d++; else if(c==='）'){ d--; if(d===0){ k=i; break; } } } if(k<0) break; r=r.slice(k+1).trim(); } return r; };
    const bad=[]; for(const [k,v] of SPEAKER) for(const t of strings(v)) if(/^（/.test(t)&&INV.narrLine(t)&&rest(t)) bad.push(k+'：'+t);
    check('3. 有名字的格子裡（ 開頭、被當成旁白的，都是整句動作（沒有「（笑）好啊。」這種拿掉「」以後會變成旁白的台詞）',bad.length===0,bad.join('／')); }
  /* 4 */
  check('4. LIBQ.quiet：「好。」→（小聲）好。',LIBQ.quiet('「好。」')==='（小聲）好。',LIBQ.quiet('「好。」'));
  check('4. LIBQ.quiet 其他照舊：沒有「」的加前綴、動作括號合成、已經小聲的不動、整句旁白不動、（走出…）「……」不動',
    LIBQ.quiet('好。')==='（小聲）好。'&&LIBQ.quiet('（抬頭）喔，hi。')==='（抬頭，小聲）喔，hi。'&&LIBQ.quiet('「（抬頭）喔，hi。」')==='（抬頭，小聲）喔，hi。'
    &&LIBQ.quiet('（小聲）走吧。')==='（小聲）走吧。'&&LIBQ.needsPrefix('「（小聲）二樓靠窗那排比較安靜。」')===false&&LIBQ.quiet('（他翻了一頁。）')==='（他翻了一頁。）'
    &&LIBQ.quiet('（走出法圖）「館員人好好。」')==='（走出法圖）「館員人好好。」'&&LIBQ.quiet('「A。」「B。」')==='（小聲）「A。」「B。」');
  /* 5 */
  if(ctx.INVITE_REPLIES){ const row=INV.replyRow('heroine_01',['好啊。我本來就想去。']), row2=INV.replyRow('heroine_01',['「好啊。我本來就想去。」']);
    check('5. 表上的句子對得到拿掉「」的句子、有「」的也對得到（舊存檔）：INV.replyRow 不看外面的「」',!!row&&row===row2&&row.id==='an1',J(row&&row.id));
    check('5. 「好。」輪流的比對（REPLY_OK_JSON、S.lineKey）不看外面的「」',typeof INV.lineKey==='function'&&INV.lineKey(['「好。」'])===INV.REPLY_OK_JSON&&INV.lineKey(['好。'])===INV.REPLY_OK_JSON&&INV.lineKey([{me:'「嗯。」'}])===INV.lineKey([{me:'嗯。'}])&&INV.lineKey(['「A」「B」'])!==INV.lineKey(['A」「B'])); }
  else check('5. src/data/invite_replies.js 載得進來',false);
  /* ---------- 第二批（AA-B 11-08 01:09）：和 BASE（c79414b00，拿掉「」以前）逐句比 ---------- */
  const BASE='c79414b00'; let A715N=0;
  /* 11-10 AA_731（企劃線 94ab0865e，BUG-INV-ACC-TIME-1110）：答應句不寫幾點、週末、早上——這十句和來源 commit（AA_415 c71772fbc、AA_721 b782e2c08）的改變不算「多改」 */
  const A731=[["好。九點，不要遲到。", "好。不要遲到。"], ["早上？……十點以後可以。", "Daybreak？……好。我會起來。"], ["好。週末早上我剛好有空。", "好。那天我空下來。"], ["SUNNY SIDE。好。我九點到。", "SUNNY SIDE。好。我會準時到。"], ["SUNNY SIDE？我從木柵大學過來要四十分鐘。好，我十點到。", "SUNNY SIDE？我從木柵大學過來要四十分鐘。好，我早一點出門。"], ["十二點？好，那是我的早餐。", "早午餐？好，那是我的早餐。"], ["十二點 好 那是我的早餐", "早午餐 好 那是我的早餐"], ["好。我九點以前要回店裡。", "好。……我跟店裡說一聲。"], ["好。週末的話。", "好啊。我想找一張老唱片。"], ["蛋包飯？好。週末的話。", "蛋包飯？好。我坐捷運過去。"],
  /* 2026-11-11 改期望（X327 沛珊重寫，AA_755_peishan_feed_misc@c5094495d）：沛珊 invites.js 四處五句（firstAt.brunch 兩句、acc.brunch.A／R、acc.run_avenue）和 invite_replies.js 同句的 ps5、ps9 換了字——和 BASE 比的時候這五句照新稿算（逐字比對 tests/peishan_feed_misc_1111_unit.js） */
  ["她翻蛋的時候手腕都不動耶。我媽也是。", "你看她翻蛋，手腕都不動欸。"], ["我到現在還學不會。", "我在家試過一次，蛋飛到抽油煙機上，我媽到現在還會講。"], ["早餐店的女兒，去吃別人的早午餐。……好，我去研究。", "早午餐！好啊，那種不用太早起的我最可以。"], ["好。我想看他們的蛋怎麼翻。", "好啊。我想坐吧台，可以看他們做。"], ["好啊！早上我很習慣，在家的時候四點半就要起來幫忙開店。", "好啊！可是你要打給我，我鬧鐘要響三次才起得來。"]];
  A731.push(...require('./peishan_rewrite_1111.js').PAIRS);   /* 2026-11-11（X327 沛珊重寫第四批以後：AA_759、AA_761、AA_762、AA_763；清單在 tests/peishan_rewrite_1111.js 的 PAIRS）：rel_lines.js 一起念書的旁白等換了字，和 BASE 比的時候照新稿算 */
  /* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：AA_772 的 fix 列（慢讀→木曜日的台詞、見面旁白等；白名單上的版本，tests/l118_redo772_expect.js 讀，不手抄）和 BASE 比的時候照新稿算 */
  A731.push(...require('./l118_redo772_expect.js').rows);
  /* 2026-11-11（X324 D 區）：覆蓋層（白名單 overlay:true 的稿：AA_783 invite_replies／invites、AA_784 invites；tests/overlay_expect.js 讀，不手抄）換的字，和 BASE 比的時候照稿算；
     invite_replies.js 換過的列多一格 ov（稿的來源），比之前拿掉。逐列對稿在 tests/invite_overlay_1111_unit.js */
  const OE=require('./overlay_expect.js'); A731.push(...['invites','invite_replies'].flatMap(f=>OE.rows(f).map(r=>[r.old,r.new])));
  /* 2026-11-11（X324 G 區，AA_715_sport_gym_pool_invites.json 2205d6058→3f1569379）：運動邀約源稿換版重匯（「游泳？……」「健身房？……」開頭八句、芷若「店長」→「老闆」一句）——兩版稿逐格比出來的 old→new（拿掉外面的「」）和來源 commit 照稿算，不手抄。舊期望：sport_invite_lines.js 和 BASE 只差外面的「」 */
  { const P715='docs/story_planning/AA_715_sport_gym_pool_invites.json', g=sha=>{ try{ return JSON.parse(cp.execSync('git -C "'+ROOT+'" show '+sha+':'+P715,{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']})); }catch(e){ return null; } }, d0=g('2205d6058'), d1=g('3f1569379'), u=t=>t.replace(/^「|」$/g,''), P=[];
    if(d0&&d1){ (function w(a,b){ if(typeof a==='string'){ if(typeof b==='string'&&a!==b) P.push([u(a),u(b)]); return; } if(a&&typeof a==='object'&&b&&typeof b==='object') for(const k of Object.keys(a)) w(a[k],b[k]); })(d0,d1); P.push([P715+'@2205d6058',P715+'@3f1569379']); }
    A715N=P.length; A731.push(...P); }
  const aa731=(a,b)=>{ if(typeof a!=='string'||typeof b!=='string') return false; const s=t=>t.replace(/^「|」$/g,''); if(A731.some(([o,n])=>s(a)===o&&s(b)===n||(a.includes(o)&&a.split(o).join(n)===b))) return true; const r=t=>t.replace(/@(b782e2c08|c71772fbc|94ab0865e|ef7280917)/g,'@AA'); return r(a)===r(b)||(a==='c71772fbc'&&b==='94ab0865e'); };   /* 2026-11-11：AA_721 白名單換 ef7280917（118 巷改版），來源 commit 的字不算多改 */
  /* （CANON-NO-ECON-1112 第四批：照 AA_897 第 2 節換字）BASE 先照 AA_897 的整句表（tools/story/canon897_fix.json）和 rel_lines 可昕 bye 的 FRIEND 那一句換過再比 */
  const C897=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/story/canon897_fix.json'),'utf8')).pairs.concat([["走到湖心亭，她停下來說，這裡的風比山上小。","走到湖心亭，她停下來說，這裡的風比河堤小。"]/* CANON-NO-ECON-1112 收尾：AA_932 §2 rel_lines 湖心亭旁白 */,["FRIEND:['\u300c\u4e0b\u6b21\u63db\u4f60\u4f86\u3002\u300d']","FRIEND:['「走了。」']"],["\u5979\u5728\u9580\u53e3\u63db\u4e86\u8a2a\u5ba2\u8b49\uff0c\u9032\u53bb\u4ee5\u5f8c\u4e00\u76f4\u628a\u8b49\u62ff\u5728\u624b\u4e0a\u3002", "\u5979\u5728\u9580\u53e3\u5237\u4e86\u5b78\u751f\u8b49\uff0c\u627e\u4e86\u9760\u7a97\u7684\u4f4d\u5b50\u3002"], ["\u5979\u8aaa\u4f60\u5011\u7684\u7e3d\u5716\u6bd4\u8f03\u5927\uff0c\u5979\u5011\u7684\u6bd4\u8f03\u5b89\u975c\u3002", "\u5979\u8aaa\u7e3d\u5716\u665a\u4e0a\u6bd4\u767d\u5929\u597d\u5ff5\u3002"], ["\u5979\u5ff5\u5230\u9589\u9928\uff0c\u8d70\u7684\u6642\u5019\u8aaa\uff0c\u4e0b\u6b21\u63db\u4f60\u4f86\u6728\u67f5\u3002", "\u5979\u5ff5\u5230\u9589\u9928\uff0c\u8d70\u7684\u6642\u5019\u8aaa\uff0c\u660e\u5929\u5979\u8981\u5360\u9760\u7a97\u90a3\u4e00\u6392\u3002"], ["\u5979\u8ddf\u963f\u9cf3\u963f\u59e8\u8aaa\u5979\u5f9e\u6728\u67f5\u4f86\uff0c\u963f\u59e8\u591a\u7d66\u4e86\u4e00\u7897\u6e6f\u3002", "\u5979\u8ddf\u963f\u9cf3\u963f\u59e8\u8aaa\u5979\u662f\u9ad8\u96c4\u4f86\u7684\uff0c\u963f\u59e8\u591a\u7d66\u4e86\u4e00\u7897\u6e6f\u3002"], ["\u5979\u5403\u5b8c\u8aaa\uff0c\u6728\u67f5\u6c92\u6709\u9019\u7a2e\u71d2\u81d8\u3002", "\u5979\u5403\u5b8c\u8aaa\uff0c\u9ad8\u96c4\u7684\u71d2\u81d8\u6bd4\u8f03\u751c\u3002"], ["\u6211\u56de\u6728\u67f5\u4e86\u3002\u5230\u4e86\u50b3\u4f60\u3002", "\u6211\u56de\u5bbf\u820d\u4e86\u3002\u5230\u4e86\u50b3\u4f60\u3002"]]);   /* rel_lines 可昕 library、noodle、bye 那幾句（手寫檔，AA_897 第 2 節 rel_lines 158、159、161）*/
  const gitShow=f=>C897.reduce((a,[o,n])=>a.split(o).join(n),cp.execSync('git -C "'+ROOT+'" show '+BASE+':'+f,{encoding:'utf8',maxBuffer:1<<28}));
  const evalIn=(src,names,extra)=>{ const c=vm.createContext(Object.assign({console},extra||{})); for(const n of names) src=src.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(src,c); return c; };
  const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const unq=t=>wrapped(t)?t.slice(1,-1):t;
  const isNarr=t=>INV.narrLine(t);   /* S.playLines：（ 開頭（（小聲）、（走出…）「 以外）＝旁白，其他＝有名字說的 */
  const sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
  /* 兩份一樣的結構逐格比：named(路徑)＝有名字說的格子（字串只能差外面那一對「」），其他一字不差。回傳 {n 比了幾句, ch 改了幾句, bad} */
  const cmpTree=(a,b,named,p,acc)=>{ acc=acc||{n:0,ch:0,bad:[]}; p=p||'';
    if(typeof a==='string'||typeof b==='string'){ if(typeof a!=='string'||typeof b!=='string'){ acc.bad.push(p+'：型別不同'); return acc; } if(a!==b&&aa731(a,b)) return acc; if(a!==b&&require('./canon_b5_expect.js').rows('sport_invite_lines.js').some(([x,y])=>(unq(a)===x||a===x)&&b===y)) return acc;   /* 2026-11-12（CANON-NO-ECON-1112 第五批 AA_920 ⑩）：可昕健身房三句照 canon_b5_rows 換 */ if(named(p)){ acc.n++; if(a!==b){ if(unq(a)===b&&wrapped(a)) acc.ch++; else acc.bad.push(p+'：'+a+' → '+b); } } else if(a!==b) acc.bad.push(p+'（沒名字）：'+a+' → '+b); return acc; }
    if(typeof a==='function'||typeof b==='function'){ if(String(a)!==String(b)) acc.bad.push(p+'：函式不同'); return acc; }
    if(Array.isArray(a)!==Array.isArray(b)||(a&&typeof a)!==(b&&typeof b)){ acc.bad.push(p+'：結構不同'); return acc; }
    if(a&&typeof a==='object'){ const ks=new Set(Object.keys(a).concat(Object.keys(b))); for(const k of ks){ if(!(k in a)||!(k in b)){ acc.bad.push(p+'.'+k+'：只有一邊有'); continue; } cmpTree(a[k],b[k],named,p+(Array.isArray(a)?'['+k+']':'.'+k),acc); } return acc; }
    if(a!==b) acc.bad.push(p+'：'+a+' → '+b); return acc; };
  /* 6. invite_replies.js */
  { const NEW=require('./aa959_map.js').unmapDeep(ctx.INVITE_REPLIES,'invite_replies.js')/* AA_959（DLG-FULL-REVIEW-1110）：build_replies.py 最後一步照覆寫表換的字先換回來再和舊版比 */, OLD=evalIn(gitShow('src/data/invite_replies.js'),['INVITE_REPLIES']).INVITE_REPLIES;
    const rows=o=>Object.keys(o.people).flatMap(id=>o.people[id].map(r=>[id,r]));
    const RN=rows(NEW), RO=rows(OLD).filter(([id,r])=>!['kx36','kx38'].includes(r.id)); const strs=[], wr=[], me=[];   /* 可昕 kx36、kx38（CANON-NO-ECON-1112 第三批：這一項拿掉）：BASE 那兩列不比 */
    for(const [id,r] of RN) for(const x of r.lines){ const t=typeof x==='string'?x:x&&x.me; if(typeof t!=='string') continue; strs.push(t); if(wrapped(t)) wr.push(id+' '+r.id+'：'+t); if(typeof x!=='string') me.push(t); }
    check('6. invite_replies.js：lines 裡有名字說的（她說的、{me} 祐廷說的）沒有一句外面還有「」（'+strs.length+' 句）',strs.length>=270&&wr.length===0,sample(wr));
    const noOv=r=>{ const y=Object.assign({},r); delete y.ov; return y; }, nOv=RN.filter(x=>x[1].ov).length;
    const A891=require('./canon891_1112.js');   /* （CANON-NO-ECON-1112 第四批：照 AA_891 換字）BASE 的可昕那幾列先照 AA_891 換過再比 */
    const r6=cmpTree(RO.map(x=>x[0]==='kexin'?A891.apply(x[1]):x[1]),RN.map(x=>noOv(x[1])),p=>/^\[\d+\]\.lines\[\d+\](\.me)?$/.test(p));
    check('6. 和 '+BASE+' 比：一樣的列（'+RN.length+'）、只有 lines 差外面的「」（改了 '+r6.ch+' 句；X324 覆蓋層換過的 '+nOv+' 列照稿），其他欄位（含 say 表上原文）一字不差',RN.length===RO.length&&RN.length>=248/* 可昕少兩列（CANON-NO-ECON-1112 第三批）*/&&r6.bad.length===0&&r6.ch+OE.rows('invite_replies').length+A891.n>=250/* （CANON-NO-ECON-1112 第四批）AA_891 換掉的 17 句先照新字換過，不算在「只差「」」裡 */,sample(r6.bad));   /* 覆蓋層換過的那幾格不算在「只差「」」裡（舊期望 r6.ch>=250）*/
    const who=[]; RO.forEach(([id,r],i)=>r.lines.forEach((x,j)=>{ const y=RN[i][1].lines[j]; if(typeof x==='string'&&isNarr(x)!==isNarr(y)) who.push(r.id+'：'+x+' → '+y); }));
    const narr=strs.filter(isNarr);
    check('6. 誰說的（S.narrLine：旁白／她說）每一句都和 '+BASE+' 一樣；旁白照舊（'+narr.length+' 句，沛珊 ps30 裡面的「…」「…」照留）',who.length===0&&narr.length===7&&narr.includes('（「平日我在家念……」「書店六點打烊……」「七點下課……」）'),sample(who));
    check('6. 表上的列對得到 invites.js（S.replyRow）：以安「好啊。我本來就想去。」＝an1、「好。」輪流的比對照舊',!!INV.replyRow('heroine_01',['好啊。我本來就想去。'])&&INV.replyRow('heroine_01',['好啊。我本來就想去。']).id==='an1'&&RN.some(([id,r])=>id==='heroine_01'&&INV.lineKey(r.lines)===INV.REPLY_OK_JSON)); }
  /* 7. rel_lines.js */
  { const ENV={window:{},location:{search:''},document:{getElementById:()=>null,addEventListener(){}}};
    const sc=evalIn(cur('src/data/characters.js'),['CHARACTERS','UNFAMILIAR_POOL','SOCIAL_GRAPH','PORTRAITS'],ENV); vm.runInContext(cur('src/social3d.js').replace(/^const SOCIAL\s*=/m,'globalThis.SOCIAL='),sc);
    const SO=sc.SOCIAL, G7={rel:{},flags:{},social:null,day:30,weekday:1,hour:15,name:'祐廷',contacts:{},invites:[],msgs:[]}; SO.bind(G7);
    const NEW=evalIn(cur('src/data/rel_lines.js'),['REL_LINES']).REL_LINES, OLD=evalIn(require('./line_rows_expect.js').fixFile('src/data/rel_lines.js',gitShow('src/data/rel_lines.js')),['REL_LINES']).REL_LINES;   /* X324 G 區 AA_794（店長→老闆，見面旁白兩句）：BASE 先照逐行改稿換過再比（tests/line_rows_expect.js）*/
    /* 有名字說的格子：SOCIAL.playSteps 播的一串台詞（up 的 l、ch 的 r、bye、Café 的學姊 again／hello／tired／today.ask／opts 的 r／small 的 l、lGrad、ch 的 r）；
       沒名字的：meet（見面旁白；另外比）、cafe.note（便條，story3d.js sisCafe 用旁白說）、contact（手機聯絡人的名字）、選項字（ch／opts 的 t、tDating）*/
    const STEP=/\.(l|r|lGrad|again|ask|tired)\[\d+\]$|\.bye\.\w+\[\d+\]$|\.cafe\.hello\.\w+\[\d+\]$/;
    const named=p=>!/\.meet\./.test(p)&&STEP.test(p);
    const lists=[]; const walkL=(a,b,p)=>{ if(Array.isArray(a)&&Array.isArray(b)&&a.length&&a.every(x=>typeof x==='string')&&named(p+'[0]')){ lists.push([p,a,b]); return; } if(a&&b&&typeof a==='object'&&typeof b==='object') for(const k of Object.keys(a)) if(k in b) walkL(a[k],b[k],p+(Array.isArray(a)?'['+k+']':'.'+k)); };
    walkL(OLD,NEW,'');
    const steps=lists.flatMap(([p,a,b])=>b.map((t,i)=>[p+'['+i+']',t])), wr=steps.filter(([p,t])=>wrapped(t)).map(([p,t])=>p+'：'+t);
    check('7. rel_lines.js：SOCIAL.playSteps 播的台詞（'+lists.length+' 串、'+steps.length+' 句）沒有一句外面還有「」',lists.length>=100&&steps.length>=150&&wr.length===0,sample(wr));
    const r7=cmpTree(OLD,NEW,named), r7b=r7.bad.filter(x=>!/^\.kai\.meet\.noodle\.A：/.test(x));
    check('7. 和 '+BASE+' 比：只有那幾串台詞差外面的「」（改了 '+r7.ch+' 句）；選項字、便條、見面旁白、聯絡人、函式一字不差（阿凱燒臘店「認識」那一格另外比）',r7b.length===0&&r7.ch>=150,sample(r7b));
    check('7. 旁白裡引用的話照留「」：學姊的便條、以安見面旁白「這裡會考。」；選項字不動',NEW.heroine_05.cafe.note.ACQUAINTANCE==='便條只有一行：「第二題的爭點抓錯了。」字很小。'&&NEW.heroine_01.meet.cafe.F==='她把整理好的筆記推過來，指著一段說：「這裡會考。」'&&NEW.zhe.up.CLOSE_FRIEND.ch[0].t==='好啊。'&&NEW.heroine_05.cafe.today.opts[0].t==='（說今天念的那一科）');
    /* 演出來：BASE 和現在的每一串都用 SOCIAL.playSteps（這支沒有改）播，說的人、畫面上的字一句一句比 */
    const play=async L=>{ const out=[]; await SO.playSteps({G:G7,say:async(w,t)=>{ out.push((w?'W:':'N:')+t); }},{name:'她'},'x',L); return out; };
    const diff=[]; let nW=0, nN=0; for(const [p,a,b] of lists){ const A=await play(a), B=await play(b); if(JSON.stringify(A)!==JSON.stringify(B)) diff.push(p+'：'+A.join('｜')+' → '+B.join('｜')); nW+=B.filter(x=>x[0]==='W').length; nN+=B.filter(x=>x[0]==='N').length; }
    check('7. SOCIAL.playSteps 播 '+BASE+' 和現在的：說的人、畫面上的字每一句都一樣（她說 '+nW+' 句、旁白 '+nN+' 句）',diff.length===0&&nW>=130&&nN>=15,sample(diff));
    /* 見面那一格：BASE＝src/invites3d.js 舊的 GM.say(/^「/.test(ml)?who:null,ml)；現在＝SOCIAL.meetText（meetPick 用的）*/
    const cells=[]; const walkM=(a,b,p)=>{ if(typeof a==='string'||(a&&typeof a==='object'&&!Array.isArray(a)&&typeof a.t==='string')){ cells.push([p,a,b]); return; } if(Array.isArray(a)){ a.forEach((x,i)=>walkM(x,b&&b[i],p+'['+i+']')); return; } if(a&&typeof a==='object') for(const k of Object.keys(a)) if(k!=='if') walkM(a[k],b&&b[k],p+'.'+k); };
    for(const id of Object.keys(OLD)) if(OLD[id].meet) walkM(OLD[id].meet,NEW[id]&&NEW[id].meet,id+'.meet');
    const mt=typeof SO.meetText==='function'?SO.meetText:null, mBad=[]; let says=0;
    if(mt) for(const [p,a,b] of cells){ const ta=typeof a==='string'?a:a.t, oldSay=/^「/.test(ta), m=mt(b); if(!m||m.say!==oldSay||(m.t!==(oldSay?unq(ta):ta)&&!aa731(ta,m.t))) mBad.push(p+'：'+ta+' → '+JSON.stringify(m)); if(m&&m.say) says++; }
    check('7. 見面那一格（'+cells.length+' 格）：說的人和 '+BASE+' 一樣（原本看開頭的「，現在 {t,say:true}）、字只差外面的「」；她說的只有阿凱燒臘店「認識」那一格',!!mt&&cells.length>=140&&mBad.length===0&&says===1&&!!NEW.kai.meet.noodle.A.say&&NEW.kai.meet.noodle.A.t==='好，我餓了。',mt?sample(mBad):'沒有 SOCIAL.meetText');
    check('7. 舊的寫法（開頭是「的字串）照樣認得是她說的，外面整句的「」拿掉再顯示；旁白字串＝旁白',!!mt&&JSON.stringify(mt('「好，我餓了。」'))===JSON.stringify({t:'好，我餓了。',say:true})&&JSON.stringify(mt('她點了最甜的。'))===JSON.stringify({t:'她點了最甜的。',say:false})&&mt(null)===null);
    /* 演出來：阿凱「認識」約燒臘店（INV.meet） */
    const ec=vm.createContext(Object.assign({console,setTimeout,clearTimeout},ENV)); const run=(f,names)=>{ let s=cur(f); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(s,ec,{filename:f}); };
    run('src/data/characters.js',['CHARACTERS','UNFAMILIAR_POOL','SOCIAL_GRAPH','PORTRAITS']); run('src/social3d.js',['SOCIAL']); run('src/data/rel_lines.js',['REL_LINES']); run('src/data/l118_redo772.js',['L118_REDO']); run('src/data/invites.js',['INVITE_DATA']); run('src/invites3d.js',['INV']);
    const G={rel:{},flags:{},social:null,day:30,weekday:1,hour:12,name:'祐廷',contacts:{},invites:[],msgs:[],zone:'noodle'}; ec.SOCIAL.bind(G); const rk=ec.SOCIAL.rel('kai'); rk.fam=10; rk.trust=0; rk.comf=0;
    const iv={id:'k1',who:'kai',place:'noodle',zone:'noodle',day:G.day,h:12,state:'going',by:'player'}; G.invites=[iv]; const said=[];
    const GMk={G,sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push({who:w?w.name:null,t}); },choose:async()=>0,fade:async()=>{},advance(dh){ G.hour+=dh; },caption(){},autosave(){},money(){},toast(){}};
    let err=null; try{ await ec.INV.meet(GMk,iv,null); }catch(e){ err=e; }
    const hit=said.find(s=>/好，我餓了。/.test(s.t));
    check('7. 阿凱「認識」約燒臘店（INV.meet）：見面那一句是阿凱說的「好，我餓了。」（有名字、外面沒有「」）',!err&&ec.SOCIAL.friendLevel('kai')==='ACQUAINTANCE'&&!!hit&&hit.who===ec.SOCIAL.npcName('kai')&&!!hit.who&&hit.t==='好，我餓了。',err?String(err.stack).slice(0,300):JSON.stringify(said)); }
  /* 8、9. 匯入工具產生的兩個檔：誰說的（S.playLines／S.narrLine）跟改以前一樣 */
  const genCheck=(no,f,glob,named,unnamedSample,drop,chPlus)=>{   /* chPlus：稿換版、照稿算（aa731）的那幾句原本也是拿掉「」的句子，不算進 r.ch——門檻加回來（X324 G 區 AA_715 九句） */ const NEW=require('./aa959_map.js').unmapDeep(evalIn(cur(f),[glob])[glob],path.basename(f))/* AA_959（1243649c23 起有 invite_place_lines.js 的列：D158-KX-SAMESCHOOL 可昕社科圖三句）：匯入工具最後一步照覆寫表換的字先換回來再和 BASE 比；舊期望：現在的檔直接比 */, OLD=evalIn(gitShow(f),[glob])[glob]; if(drop){ drop(OLD); drop(NEW); }
    const r=cmpTree(OLD,NEW,named), strs=[]; (function w(v,p){ if(typeof v==='string'){ if(named(p)) strs.push([p,v]); return; } if(v&&typeof v==='object') for(const k of Object.keys(v)) w(v[k],p+(Array.isArray(v)?'['+k+']':'.'+k)); })(NEW,'');
    const wr=strs.filter(([p,t])=>wrapped(t)).map(([p,t])=>p+'：'+t);
    check(no+'. '+f+'：有名字說的（'+strs.length+' 句）沒有一句外面還有「」',strs.length>=50&&wr.length===0,sample(wr));
    check(no+'. 和 '+BASE+' 比：只有有名字說的差外面的「」（改了 '+r.ch+' 句'+(chPlus?'＋稿換版照稿算 '+chPlus+' 句':'')+'）、其他一字不差（'+unnamedSample+'）',r.bad.length===0&&r.ch+(chPlus||0)>=50,sample(r.bad));
    const who=[]; (function w(a,b,p){ if(typeof a==='string'){ if(named(p)&&isNarr(a)!==isNarr(b)) who.push(p+'：'+a+' → '+b); return; } if(a&&typeof a==='object') for(const k of Object.keys(a)) w(a[k],b[k],p+(Array.isArray(a)?'['+k+']':'.'+k)); })(OLD,NEW,'');
    check(no+'. 誰說的（S.narrLine）每一句都和 '+BASE+' 一樣（拿掉「」以後沒有一句變成（ 開頭）',who.length===0,sample(who));
    return NEW; };
  { const PL=genCheck('8','src/data/invite_place_lines.js','INVITE_PLACE_LINES',p=>/^\.places\.\w+\.\w+\.(acc|firstAt)\[\d+\]$/.test(p),'no：可昕不去的那一句、src',
     /* 2026-11-11（L118-SHOPS-REDO-1111）：118 巷那幾格（places.l118_*）AA_721 整份重寫了（十個位置、新店的句子，企劃線 ef7280917），和 BASE 比不了——不比這幾格；
        它們的字由下面 import_place_acc.py --check 對稿，有名字的句子外面沒有「」另外在 8c 驗。舊期望：118 巷七格也逐句和 BASE 比 */
     o=>{ for(const k of Object.keys(o.places||{})) if(/^l118_/.test(k)) delete o.places[k]; delete o.src2; });   /* AA_941（11-13）：AA_721 白名單換 4158dae820，src2 跟著換 */
    { const NOW=evalIn(cur('src/data/invite_place_lines.js'),['INVITE_PLACE_LINES']).INVITE_PLACE_LINES, bad=[]; let n=0; for(const k of Object.keys(NOW.places)) if(/^l118_/.test(k)) for(const id of Object.keys(NOW.places[k])) for(const f of ['acc','firstAt']) for(const t of [].concat(NOW.places[k][id][f]||[])){ if(typeof t!=='string') continue; n++; if(wrapped(t)&&!isNarr(t)) bad.push(k+'.'+id+'：'+t); }
      check('8c. 118 巷十個位置的答應句、第一次那一句（'+n+' 句）：有名字說的外面沒有「」',n>=100&&bad.length===0,sample(bad)); }
    check('8. no：AA_941 起沒有人寫 no（可昕和大家一樣會去大學食堂；舊期望：可昕那一句「平日我要上課。……週末那間又沒開。」照留「」）',(()=>{ const NOW=evalIn(cur('src/data/invite_place_lines.js'),['INVITE_PLACE_LINES']).INVITE_PLACE_LINES; return Object.values(NOW.places).every(pl=>Object.values(pl).every(e=>!e||e.no===undefined))&&J(NOW.places.l118_cafe2.kexin.acc)===J(['好。我今天沒吃早餐。']); })());
    let rc=0, out=''; try{ out=cp.execSync('python3 "'+path.join(ROOT,'tools/story/import_place_acc.py')+'" --check',{encoding:'utf8'}); }catch(e){ rc=1; out=String(e.stdout||'')+String(e.stderr||e); }
    check('8. 匯入工具 import_place_acc.py --check：遊戲檔和稿（拿掉外面的「」）一致',rc===0&&/^OK/.test(out),out.slice(0,200)); }
  { const SP=genCheck('9','src/data/sport_invite_lines.js','SPORT_INVITE_LINES',p=>/^\.people\.\w+\.(acc\.\w+(\.\w+)?|firstAt\.\w+|sport\.\w+\.(during\[\d+\]|end)|beforeLearn\.\w+\.decline)\[\d+\]$/.test(p),'shared 兩個人一起的旁白',null,A715N?A715N-1:0);   /* 2026-11-11（X324 G 區，AA_715@3f1569379）：九句照稿換版算（不算在 r.ch），門檻加回這九句。舊期望：r.ch>=50 */
    check('9. 學姊還沒學游泳的婉拒（beforeLearn）是她說的、外面沒有「」；shared 的旁白照舊是（…）（AA_715@3f1569379：「我不會游泳耶。」）；兩版稿的差（X324 G 區）剛好 9 格＋來源',A715N===10&&JSON.stringify(SP.people.heroine_05.beforeLearn.gym_pool.decline)===JSON.stringify(['我不會游泳耶。','換一個地方，好嗎？'])/* 2026-11-11（X324 G 區，AA_715_sport_gym_pool_invites.json@3f1569379）：學姊 beforeLearn 第一句「「游泳……我不會游。」」→「「我不會游泳耶。」」。舊期望：'游泳……我不會游。' */&&Object.values(SP.shared).every(o=>o.during.concat(o.end).every(t=>/^（.*）$/.test(t))),JSON.stringify(SP.people.heroine_05.beforeLearn));
    let rc=0, out=''; try{ out=cp.execSync('python3 "'+path.join(ROOT,'tools/story/import_sport_invites.py')+'" --check',{encoding:'utf8'}); }catch(e){ rc=1; out=String(e.stdout||'')+String(e.stderr||e); }
    check('9. 匯入工具 import_sport_invites.py --check：遊戲檔和稿（拿掉外面的「」）一致',rc===0&&/^OK/.test(out),out.slice(0,200)); }
  /* 10. src/invites3d.js */
  { const S3=noComments(cur('src/invites3d.js'));
    check('10. 見面旁白（meet）照 SOCIAL.meetPick 的 say 分說的人，不再看開頭的「',/SO\.meetPick\(iv\.who,P\.id\)/.test(S3)&&/GM\.say\(mp\.say\?who:null,ml\)/.test(S3)&&!/\/\^「\/\.test\(ml\)/.test(S3));
    check('10. 見面之後那一句（afterMeet，沛珊的便條）照 S.narrLine 分，不再看開頭的「',/afterMeet[\s\S]{0,200}GM\.say\(S\.narrLine\(t\)\?null:who,t\)/.test(S3)&&!/GM\.say\(\/\^「\/\.test\(t\)/.test(S3));
    const wrapSay=S3.match(/GM\.say\(\s*(?!null\b)[A-Za-z_$][\w$]*\s*,\s*'「'\s*\+[^;]*/g)||[];   /* GM.say(null,'「'+…) 沒名字的照留 */
    check('10. 程式自己不在有名字的台詞外面加「」（前任學姊「最近忙。」、期末飯婉拒 te.refuse）',wrapSay.length===0&&/GM\.say\(w0,V6EX\.SIS_EX_BUSY\)/.test(S3)&&/GM\.say\(who,te\.refuse\)/.test(S3),wrapSay.join('／')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); console.log('FAILED（例外）'); process.exit(1); });
