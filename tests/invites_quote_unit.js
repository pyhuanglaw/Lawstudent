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
  check('2. 沛珊第一次去法圖：（走出法圖）館員人好好……（AA_595 1-D10；她說的，第六批拿掉說的話那一對「」，TEXT-QUOTE-UNIFY-1108、tests/invites_quote_b6_unit.js）',has(D.lawlibLines,'（走出法圖）館員人好好。我以為法圖的人都很兇。')&&!has(D.lawlibLines,'（走出法圖）「館員人好好。我以為法圖的人都很兇。」'));
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
    check('5. 表上的句子對得到拿掉「」的句子、有「」的也對得到（舊存檔）：INV.replyRow 不看外面的「」',!!row&&row===row2&&row.id==='an1',J(row&&row.id));
    check('5. 「好。」輪流的比對（REPLY_OK_JSON、S.lineKey）不看外面的「」',typeof INV.lineKey==='function'&&INV.lineKey(['「好。」'])===INV.REPLY_OK_JSON&&INV.lineKey(['好。'])===INV.REPLY_OK_JSON&&INV.lineKey([{me:'「嗯。」'}])===INV.lineKey([{me:'嗯。'}])&&INV.lineKey(['「A」「B」'])!==INV.lineKey(['A」「B'])); }
  else check('5. src/data/invite_replies.js 載得進來',false);
  /* ---------- 第二批（AA-B 11-08 01:09）：和 BASE（c79414b00，拿掉「」以前）逐句比 ---------- */
  const BASE='c79414b00';
  const gitShow=f=>cp.execSync('git -C "'+ROOT+'" show '+BASE+':'+f,{encoding:'utf8',maxBuffer:1<<28});
  const evalIn=(src,names,extra)=>{ const c=vm.createContext(Object.assign({console},extra||{})); for(const n of names) src=src.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(src,c); return c; };
  const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const unq=t=>wrapped(t)?t.slice(1,-1):t;
  const isNarr=t=>INV.narrLine(t);   /* S.playLines：（ 開頭（（小聲）、（走出…）「 以外）＝旁白，其他＝有名字說的 */
  const sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
  /* 兩份一樣的結構逐格比：named(路徑)＝有名字說的格子（字串只能差外面那一對「」），其他一字不差。回傳 {n 比了幾句, ch 改了幾句, bad} */
  const cmpTree=(a,b,named,p,acc)=>{ acc=acc||{n:0,ch:0,bad:[]}; p=p||'';
    if(typeof a==='string'||typeof b==='string'){ if(typeof a!=='string'||typeof b!=='string'){ acc.bad.push(p+'：型別不同'); return acc; } if(named(p)){ acc.n++; if(a!==b){ if(unq(a)===b&&wrapped(a)) acc.ch++; else acc.bad.push(p+'：'+a+' → '+b); } } else if(a!==b) acc.bad.push(p+'（沒名字）：'+a+' → '+b); return acc; }
    if(typeof a==='function'||typeof b==='function'){ if(String(a)!==String(b)) acc.bad.push(p+'：函式不同'); return acc; }
    if(Array.isArray(a)!==Array.isArray(b)||(a&&typeof a)!==(b&&typeof b)){ acc.bad.push(p+'：結構不同'); return acc; }
    if(a&&typeof a==='object'){ const ks=new Set(Object.keys(a).concat(Object.keys(b))); for(const k of ks){ if(!(k in a)||!(k in b)){ acc.bad.push(p+'.'+k+'：只有一邊有'); continue; } cmpTree(a[k],b[k],named,p+(Array.isArray(a)?'['+k+']':'.'+k),acc); } return acc; }
    if(a!==b) acc.bad.push(p+'：'+a+' → '+b); return acc; };
  /* 6. invite_replies.js */
  { const NEW=ctx.INVITE_REPLIES, OLD=evalIn(gitShow('src/data/invite_replies.js'),['INVITE_REPLIES']).INVITE_REPLIES;
    const rows=o=>Object.keys(o.people).flatMap(id=>o.people[id].map(r=>[id,r]));
    const RN=rows(NEW), RO=rows(OLD); const strs=[], wr=[], me=[];
    for(const [id,r] of RN) for(const x of r.lines){ const t=typeof x==='string'?x:x&&x.me; if(typeof t!=='string') continue; strs.push(t); if(wrapped(t)) wr.push(id+' '+r.id+'：'+t); if(typeof x!=='string') me.push(t); }
    check('6. invite_replies.js：lines 裡有名字說的（她說的、{me} 祐廷說的）沒有一句外面還有「」（'+strs.length+' 句）',strs.length>=270&&wr.length===0,sample(wr));
    const r6=cmpTree(RO.map(x=>x[1]),RN.map(x=>x[1]),p=>/^\[\d+\]\.lines\[\d+\](\.me)?$/.test(p));
    check('6. 和 '+BASE+' 比：一樣的列（'+RN.length+'）、只有 lines 差外面的「」（改了 '+r6.ch+' 句），其他欄位（含 say 表上原文）一字不差',RN.length===RO.length&&RN.length>=250&&r6.bad.length===0&&r6.ch>=250,sample(r6.bad));
    const who=[]; RO.forEach(([id,r],i)=>r.lines.forEach((x,j)=>{ const y=RN[i][1].lines[j]; if(typeof x==='string'&&isNarr(x)!==isNarr(y)) who.push(r.id+'：'+x+' → '+y); }));
    const narr=strs.filter(isNarr);
    check('6. 誰說的（S.narrLine：旁白／她說）每一句都和 '+BASE+' 一樣；旁白照舊（'+narr.length+' 句，沛珊 ps30 裡面的「…」「…」照留）',who.length===0&&narr.length===7&&narr.includes('（「平日我在家念……」「書店六點打烊……」「七點下課……」）'),sample(who));
    check('6. 表上的列對得到 invites.js（S.replyRow）：以安「好啊。我本來就想去。」＝an1、「好。」輪流的比對照舊',!!INV.replyRow('heroine_01',['好啊。我本來就想去。'])&&INV.replyRow('heroine_01',['好啊。我本來就想去。']).id==='an1'&&RN.some(([id,r])=>id==='heroine_01'&&INV.lineKey(r.lines)===INV.REPLY_OK_JSON)); }
  /* 7. rel_lines.js */
  { const ENV={window:{},location:{search:''},document:{getElementById:()=>null,addEventListener(){}}};
    const sc=evalIn(cur('src/data/characters.js'),['CHARACTERS','UNFAMILIAR_POOL','SOCIAL_GRAPH','PORTRAITS'],ENV); vm.runInContext(cur('src/social3d.js').replace(/^const SOCIAL\s*=/m,'globalThis.SOCIAL='),sc);
    const SO=sc.SOCIAL, G7={rel:{},flags:{},social:null,day:30,weekday:1,hour:15,name:'祐廷',contacts:{},invites:[],msgs:[]}; SO.bind(G7);
    const NEW=evalIn(cur('src/data/rel_lines.js'),['REL_LINES']).REL_LINES, OLD=evalIn(gitShow('src/data/rel_lines.js'),['REL_LINES']).REL_LINES;
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
    if(mt) for(const [p,a,b] of cells){ const ta=typeof a==='string'?a:a.t, oldSay=/^「/.test(ta), m=mt(b); if(!m||m.say!==oldSay||m.t!==(oldSay?unq(ta):ta)) mBad.push(p+'：'+ta+' → '+JSON.stringify(m)); if(m&&m.say) says++; }
    check('7. 見面那一格（'+cells.length+' 格）：說的人和 '+BASE+' 一樣（原本看開頭的「，現在 {t,say:true}）、字只差外面的「」；她說的只有阿凱燒臘店「認識」那一格',!!mt&&cells.length>=140&&mBad.length===0&&says===1&&!!NEW.kai.meet.noodle.A.say&&NEW.kai.meet.noodle.A.t==='好，我餓了。',mt?sample(mBad):'沒有 SOCIAL.meetText');
    check('7. 舊的寫法（開頭是「的字串）照樣認得是她說的，外面整句的「」拿掉再顯示；旁白字串＝旁白',!!mt&&JSON.stringify(mt('「好，我餓了。」'))===JSON.stringify({t:'好，我餓了。',say:true})&&JSON.stringify(mt('她點了最甜的。'))===JSON.stringify({t:'她點了最甜的。',say:false})&&mt(null)===null);
    /* 演出來：阿凱「認識」約燒臘店（INV.meet） */
    const ec=vm.createContext(Object.assign({console,setTimeout,clearTimeout},ENV)); const run=(f,names)=>{ let s=cur(f); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInContext(s,ec,{filename:f}); };
    run('src/data/characters.js',['CHARACTERS','UNFAMILIAR_POOL','SOCIAL_GRAPH','PORTRAITS']); run('src/social3d.js',['SOCIAL']); run('src/data/rel_lines.js',['REL_LINES']); run('src/data/invites.js',['INVITE_DATA']); run('src/invites3d.js',['INV']);
    const G={rel:{},flags:{},social:null,day:30,weekday:1,hour:12,name:'祐廷',contacts:{},invites:[],msgs:[],zone:'noodle'}; ec.SOCIAL.bind(G); const rk=ec.SOCIAL.rel('kai'); rk.fam=10; rk.trust=0; rk.comf=0;
    const iv={id:'k1',who:'kai',place:'noodle',zone:'noodle',day:G.day,h:12,state:'going',by:'player'}; G.invites=[iv]; const said=[];
    const GMk={G,sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push({who:w?w.name:null,t}); },choose:async()=>0,fade:async()=>{},advance(dh){ G.hour+=dh; },caption(){},autosave(){},money(){},toast(){}};
    let err=null; try{ await ec.INV.meet(GMk,iv,null); }catch(e){ err=e; }
    const hit=said.find(s=>/好，我餓了。/.test(s.t));
    check('7. 阿凱「認識」約燒臘店（INV.meet）：見面那一句是阿凱說的「好，我餓了。」（有名字、外面沒有「」）',!err&&ec.SOCIAL.friendLevel('kai')==='ACQUAINTANCE'&&!!hit&&hit.who===ec.SOCIAL.npcName('kai')&&!!hit.who&&hit.t==='好，我餓了。',err?String(err.stack).slice(0,300):JSON.stringify(said)); }
  /* 8、9. 匯入工具產生的兩個檔：誰說的（S.playLines／S.narrLine）跟改以前一樣 */
  const genCheck=(no,f,glob,named,unnamedSample)=>{ const NEW=evalIn(cur(f),[glob])[glob], OLD=evalIn(gitShow(f),[glob])[glob];
    const r=cmpTree(OLD,NEW,named), strs=[]; (function w(v,p){ if(typeof v==='string'){ if(named(p)) strs.push([p,v]); return; } if(v&&typeof v==='object') for(const k of Object.keys(v)) w(v[k],p+(Array.isArray(v)?'['+k+']':'.'+k)); })(NEW,'');
    const wr=strs.filter(([p,t])=>wrapped(t)).map(([p,t])=>p+'：'+t);
    check(no+'. '+f+'：有名字說的（'+strs.length+' 句）沒有一句外面還有「」',strs.length>=50&&wr.length===0,sample(wr));
    check(no+'. 和 '+BASE+' 比：只有有名字說的差外面的「」（改了 '+r.ch+' 句）、其他一字不差（'+unnamedSample+'）',r.bad.length===0&&r.ch>=50,sample(r.bad));
    const who=[]; (function w(a,b,p){ if(typeof a==='string'){ if(named(p)&&isNarr(a)!==isNarr(b)) who.push(p+'：'+a+' → '+b); return; } if(a&&typeof a==='object') for(const k of Object.keys(a)) w(a[k],b[k],p+(Array.isArray(a)?'['+k+']':'.'+k)); })(OLD,NEW,'');
    check(no+'. 誰說的（S.narrLine）每一句都和 '+BASE+' 一樣（拿掉「」以後沒有一句變成（ 開頭）',who.length===0,sample(who));
    return NEW; };
  { const PL=genCheck('8','src/data/invite_place_lines.js','INVITE_PLACE_LINES',p=>/^\.places\.\w+\.\w+\.(acc|firstAt)\[\d+\]$/.test(p),'no：可昕不去好家自助餐那一句、src');
    check('8. no（選單灰掉的說明、GM.say(null,…)，沒名字）照留「」',PL.places.l118_self.kexin.no==='「平日我在木柵上課。……週末那間又沒開。」'&&INV.placeWhy({},'kexin',{noWho:{kexin:PL.places.l118_self.kexin.no}})===PL.places.l118_self.kexin.no);
    let rc=0, out=''; try{ out=cp.execSync('python3 "'+path.join(ROOT,'tools/story/import_place_acc.py')+'" --check',{encoding:'utf8'}); }catch(e){ rc=1; out=String(e.stdout||'')+String(e.stderr||e); }
    check('8. 匯入工具 import_place_acc.py --check：遊戲檔和稿（拿掉外面的「」）一致',rc===0&&/^OK/.test(out),out.slice(0,200)); }
  { const SP=genCheck('9','src/data/sport_invite_lines.js','SPORT_INVITE_LINES',p=>/^\.people\.\w+\.(acc\.\w+(\.\w+)?|firstAt\.\w+|sport\.\w+\.(during\[\d+\]|end)|beforeLearn\.\w+\.decline)\[\d+\]$/.test(p),'shared 兩個人一起的旁白');
    check('9. 學姊還沒學游泳的婉拒（beforeLearn）是她說的、外面沒有「」；shared 的旁白照舊是（…）',JSON.stringify(SP.people.heroine_05.beforeLearn.gym_pool.decline)===JSON.stringify(['游泳……我不會游。','換一個地方，好嗎？'])&&Object.values(SP.shared).every(o=>o.during.concat(o.end).every(t=>/^（.*）$/.test(t))),JSON.stringify(SP.people.heroine_05.beforeLearn));
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
