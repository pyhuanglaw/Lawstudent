// 邀約有名字說話的台詞不加外面的「」（AA-B 2026-11-08 00:21）——不需要瀏覽器（D131）。
// 規則：src/data/invites.js 裡在對話框「有名字」說出來的台詞（GM.say(who,…) 說話的人不是 null：INV.S.playLines、一起走路的字幕 GM.caption(名字,…)、
//   交換聯絡方式 GM.say(who,l.say)、約念書的道別 GM.say(who,…)、{me} 祐廷說的）拿掉外面那一對「」；
//   沒有名字的（toast、沒有名字的字幕、引用她的話的旁白、系統訊息）照留「」；整句（…）的旁白、選項、手機訊息不動。
//   LIBQ.quiet：「好。」→（小聲）好。（不是（小聲）「好。」）
// 檢查：
//   1. invites.js 有名字的格子（下面 SPEAKER 的清單；函式裡的句子照原始碼找）沒有一句外面還有「」；原始碼全檔也沒有（invites.js 沒有「沒名字」又整句「」的格子）
//   2. 沒名字的、旁白裡引用她的話的照留「」：旁白裡的「…」、好幾個人一來一往的「…」「…」、（走出法圖）「…」；選項字不動
//   3. 演出來：INV.S.playLines 有名字的句子 who 不是 null（含（小聲）開頭、（走出法圖）「…」這兩種括號開頭的），整句旁白 who＝null；
//      有名字的格子裡（ 開頭的句子，不是（小聲）（走出）那兩種的，都要整句是動作（不然拿掉「」以後會被當成旁白）
//   4. LIBQ.quiet('「好。」')==='（小聲）好。'；動作括號合成、已經小聲的不動
//   5. 表上的句子（src/data/invite_replies.js 還有「」）對得到 invites.js 拿掉「」的句子（INV.replyRow／S.lineKey）
// 修改前：1、4 FAIL（invites.js 還有「」；quiet 回（小聲）「好。」）。用法：node tests/invites_quote_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const ctx=vm.createContext({console,setTimeout,clearTimeout});
const load=(f,names)=>{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(s,ctx,{filename:f}); };
const SRC=fs.readFileSync(path.join(ROOT,'src/data/invites.js'),'utf8');
load('src/data/invites.js',['INVITE_DATA']); load('src/invites3d.js',['INV']); load('src/libquiet3d.js',['LIBQ']);
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
  check('2. 好幾個人一來一往的「…」「…」照留（阿哲、柏翰一起走路的句子）',has(D.walk118,'「宵夜是讀書的一部分。這叫補充體力的權利。」「沒有這個權利。」「先有。」')&&has(D.walk118,'「考完了，我在總圖門口站了五分鐘，不知道要去哪。……你要去哪？」「燒臘店。」「……喔。好。那你去。」'));
  check('2. 沛珊第一次去法圖：（走出法圖）「館員人好好……」照留（AA_595 1-D10）',has(D.lawlibLines,'（走出法圖）「館員人好好。我以為法圖的人都很兇。」'));
  const chT=[]; (function w(v){ if(Array.isArray(v)) v.forEach(w); else if(v&&typeof v==='object'){ if(Array.isArray(v.ch)) for(const c of v.ch) chT.push(c.t); for(const k of Object.keys(v)) if(k!=='ch') w(v[k]); } })(Object.values(P).map(p=>p.walk));
  check('2. 選項字不動（芷若猜電影、阿凱、子晴、沛珊的選項）',chT.length>=10&&chT.includes('愛情片。')&&chT.includes('（說換方向的事）')&&chT.includes('不一定是告，可以請警察來看'),JSON.stringify(chT)); }
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
    check('3. 子晴「你為什麼換」：祐廷說的 {me} 有名字（祐廷）、外面沒有「」；她回的有名字；（她走了好幾步沒說話。）沒名字',
      a.length===7&&a[0].who==='祐廷'&&a[0].t==='念了一個多月經濟，後來重考到法律。考之前很怕，考完就不怕了。'&&a[1].who==='子晴'&&a[1].t==='……你換過？'&&a[5].who===null,J(a)); }
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
    check('5. 表上的句子（invite_replies.js 還有「」）對得到拿掉「」的句子：INV.replyRow 不看外面的「」',!!row&&row===row2&&row.id==='an1',J(row&&row.id));
    check('5. 「好。」輪流的比對（REPLY_OK_JSON、S.lineKey）不看外面的「」',typeof INV.lineKey==='function'&&INV.lineKey(['「好。」'])===INV.REPLY_OK_JSON&&INV.lineKey(['好。'])===INV.REPLY_OK_JSON&&INV.lineKey([{me:'「嗯。」'}])===INV.lineKey([{me:'嗯。'}])&&INV.lineKey(['「A」「B」'])!==INV.lineKey(['A」「B'])); }
  else check('5. src/data/invite_replies.js 載得進來',false);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); console.log('FAILED（例外）'); process.exit(1); });
