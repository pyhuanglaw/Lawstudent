// 有名字說的台詞拿掉外面的「」第四批（TEXT-QUOTE-UNIFY-1108，AA-B 2026-11-08 05:31）——不需要瀏覽器（D131）。第一、二批在 tests/invites_quote_unit.js，第三批 tests/invites_quote_b3_unit.js。
// 規則：在對話框「有名字」說出來的（GM.say(who,…) who 不是 null、GM.say({name:'店員'},…)）拿掉外面整句的一對「」，別的字一個都不改；
//   沒有名字的（toast、沒名字的字幕、旁白（…）、「A」「B」好幾段、選項字、手機訊息、系統字、房間物品 GM.say(null,…)）照留。
// 這一批的分類（誰讀 → 有沒有名字）：
//   1. 閒聊：src/data/events.js SMALLTALK（149 句）＝story3d.js S.smallTalk → talkCharacter 的 GM.say(who,L.say)＝有名字，全部拿掉；
//      story3d.js B_GREET（不熟同學的短招呼，greetB → GM.say(who,o.say)）拿掉；aa614_3d.js S.KAI_SMALL（原本程式包 '「'+…+'」'）、
//      sup519_3d.js smallYear／kaiTalk（SMALL_DAILY，原本 {say:'「'+o.t+'」'}）、sis_b13_3d.js smallQ 整句那兩句：不包；
//      法律系同學（pool）的閒聊：src/data/pool_story*.js 的 talk（t、old）、greet 說的話、zjwHand（加進 talk）、bhCopier（柏翰 GM.say(who,…)）＝src/pool3d.js GM.say(who,…)＝拿掉
//      照留：STORY.SMALL_AFTER、greetB 的點頭、facts 那一句（旁白）；pool 的選項（choice 的 text、…Opts）、greet 的整句旁白、房間物品 card／cordLook／noteLook（roomItems → GM.say(null,…)）；
//      動作在前面的（她點了一下頭。）「早。」（sis_b13）、us_life_events.js libTalk 的（…）「…」：不是整句外面的一對＝照舊（列給 AA-B 看）
//   2. src/mokuyobi_sys3d.js：雨天 S.RAIN 七句（GM.say(who,…)）、柏翰打烊 bhAsk、bhBye（GM.say(w,…)）拿掉；oldYes、oldNo、bhGo、bhHome、rainOpts 的 t＝GM.choose 的選項，照留
//   3. src/offbeat_sys3d.js：偶遇 enc（沛珊、Alison 兩句、阿哲）、zheOpts 選了以後的 say（明軒、阿哲）、找店員聊天 chat 四句（GM.say(CLERK,…)）拿掉；zheOpts 的 t（選項）、旁白裡的「」照留
//   4. src/ggshops_sys3d.js：店員（sayL → GM.say({name:'店員'},…)）七句拿掉；旁白裡的「」照留。src/gg2shops3d.js 已經沒有整句「」的字串（第三批做完 ACC0），不改
//   5. src/pool3d.js 的「考前補給包的小卡」：房間物品（story3d.js roomItems → GM.say(null,…)）＝沒有名字，pool_story.js card 照留
// 程式（說的人照舊）：pool3d.js 之後的招呼原本看開頭的（ 分旁白——何宇軒「（他按掉手機的計時器）時間到。」拿掉「」以後開頭是（，改成看整句是不是一對（）（S.narrWhole）；
//   閒聊記的「說過了」是句子本身（G.social.small[id] 的 used、last、once、greet.used；whois3d.js、aa614_3d.js 也照這個 key 查）：讀檔時 STORY.smallQuoteMigrate（game3d.js migrate）換成現在的句子
// 檢查（BASE＝565cf3fd6，拿掉「」以前的開發分支 head）：
//   15. 分類：每個檔有名字的沒有外面的「」、沒名字的照留（選項、旁白、房間物品）；gg2shops3d.js 和 BASE 一字不差
//   16. 資料和 BASE 逐句比：SMALLTALK、pool 的 talk／greet、sis_b13 的招呼：每一句原本整句「」、現在只差外面的「」，其他欄位（條件、once、when）一樣
//   17. 原始碼逐行比（第四批那一個 commit 本身：commit 前比 BASE 和現在的檔）：資料檔改到的每一行＝前一版那一行拿掉外面的「」（註解以外一字不差）；每個檔改幾行；程式改的地方照這裡寫的
//   18. 演出來（另開 node，一次用 BASE 的檔、一次用現在的檔）：閒聊（story3d 一般的、SMALL_DAILY、不熟同學的短招呼）、法律系同學的閒聊與之後的招呼、木曜日雨天、
//       日常失速偶遇／阿哲兩個選項／找店員聊天、公館三間店員——每一句說的人和 BASE 一樣、字只差外面的「」、有名字的沒有一句外面還有「」
//   19. 舊存檔：BASE 的程式先聊十天存起來，現在的程式讀檔（smallQuoteMigrate）接著聊——說的句子和 BASE 一路聊下去一樣；不換的話會不一樣（重說）；
//       使用者存檔（tests/fixtures）換得到；whois3d.js 柏翰「大二當法服社長」、aa614 阿凱那一句照舊認得；game3d.js migrate 有叫
//   20. 讀這些句子的程式沒動（說的人那個參數、選項 GM.choose 的 t、旁白 GM.say(null,…)）
// 修改前（BASE 的 src 檔換回來跑）：見 commit 訊息。用法：node tests/invites_quote_b4_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..'), BASE='565cf3fd6', TITLE='有名字說的台詞拿掉外面的「」第四批';
const CHANGED=['src/data/events.js','src/data/pool_story.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/story3d.js','src/pool3d.js','src/game3d.js',
  'src/aa614_3d.js','src/sis_b13_3d.js','src/sup519_3d.js','src/whois3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js','src/ggshops_sys3d.js'];
const DATAF=['src/data/events.js','src/data/pool_story.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js','src/ggshops_sys3d.js','src/whois3d.js'];
const gitShow=(r,f)=>cp.execFileSync('git',['-C',ROOT,'show',r+':'+f],{encoding:'utf8',maxBuffer:1<<28});
const cur=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* 外面整句一對「」（「A」「B」這種好幾段的不算）——和 src/invites3d.js 的 S.unq 同一把尺 */
const wrapped=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='「') d++; else if(c==='」'){ d--; if(d===0&&i!==t.length-1) return false; } } return d===0; };
const unq=t=>wrapped(t)?t.slice(1,-1):t;
/* TEXT-QUOTE-UNIFY-1108 第五批（AA-B 2026-11-08 11:05；tests/invites_quote_b5_unit.js）：第四批照留、列給 AA-B 看的兩種寫法也拿掉了——
   「說的話」（動作）→說的話（動作）（pool 之後的招呼四句）、（動作）「說的話」→（動作）說的話（學姊挽回中的短招呼一句、libTalk 三句）。
   這支測試和 BASE 比、讀現在的檔的地方，這八句照第五批以後的字比（B5：BASE 的字 → 第五批以後的字；只有這八句，其他照第四批的規則）*/
const B5=new Map([['「……嗯。」（他點頭，比你預期的大聲一點。）','……嗯。（他點頭，比你預期的大聲一點。）'],['「先吃再說！」（塞給你一顆糖）','先吃再說！（塞給你一顆糖）'],
  ['「再一次。」（她說的是手上的和弦，不是對你）','再一次。（她說的是手上的和弦，不是對你）'],['「我先走了！」（他還沒停下來）','我先走了！（他還沒停下來）'],
  ['（她點了一下頭。）「早。」','（她點了一下頭。）早。'],['（她把螢幕轉過來給你看：第四章，第三節。）「……還差一節。」','（她把螢幕轉過來給你看：第四章，第三節。）……還差一節。'],
  ['（她小聲）「三明治店十二點人很多。你先去占位子。」','（她小聲）三明治店十二點人很多。你先去占位子。'],['（她指了一下桌上的紙杯）「圖書館的咖啡機又壞了。這杯是外面買的。」','（她指了一下桌上的紙杯）圖書館的咖啡機又壞了。這杯是外面買的。']]);
const b5=t=>B5.has(t)?B5.get(t):t, isB5=(a,b)=>B5.has(a)&&B5.get(a)===b;
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const LIT=/'((?:[^'\\\n]|\\.)*)'/g;
const POOL_FILES=['src/data/pool_story.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js'];

if(process.env.QUOTE_B4_PROBE) (async()=>{
  /* ===================== 演出來（子程序）：QUOTE_B4_PROBE=old 讀 BASE 的 CHANGED，=new 讀現在的 ===================== */
  const mode=process.env.QUOTE_B4_PROBE;
  if(mode==='old'){ const OLD={}; for(const f of CHANGED) OLD[path.join(ROOT,f)]=gitShow(BASE,f); const real=fs.readFileSync;
    fs.readFileSync=function(p){ if(typeof p==='string'){ const k=path.resolve(p); if(OLD[k]!=null) return OLD[k]; } return real.apply(fs,arguments); }; }
  const IN=mode==='new'?JSON.parse(fs.readFileSync(0,'utf8')||'{}'):{};
  const out={errs:[]};
  const H=require('./pg_harness.js'); const {GM,E}=H;
  const RE=/^(MSG|MSG_POOL|MSG2_POOL|EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|L118_REDO|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SISY23|SISY23_LINES|SISY23_EVENTS|SIDEQ|GROUP|GROUP_EVENTS|Y2R2|R2Y3A_EVENTS|R2Y4B_EVENTS|PRACTICE|POOL|POOL_STORY|POOL_STORY_B2|POOL_STORY_B3|POOL_STORY_B4|POOL_MORE|HCIRCLE|HCIRCLE_DATA|AA519_LINES|SUP519|AA614|SISB13_LINES|SISB13_HAND|SISB13_EVENTS|SISB13|US_LIFE_EVENTS|WHOIS|MOKS|OFFB|GGS)$/;
  const load=f=>{ if(!fs.existsSync(path.join(ROOT,f))){ out.errs.push('沒有 '+f); return; } try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/mg,(m,n)=>RE.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(s,{filename:f}); }catch(e){ out.errs.push(f+'：'+String(e&&e.message||e).slice(0,200)); } };
  global.Z3=global.Z3||{ZONES:{}};
  for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js',
    'src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/sideq3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/data/r2y4b_events.js','src/practice3d.js',
    'src/data/pool_story.js','src/pool3d.js','src/data/pool_story_b2.js','src/data/pool_story_b3.js','src/data/pool_story_b4.js','src/pool_more3d.js','src/data/heroine_circle.js','src/hcircle3d.js',
    'src/data/aa519_lines.js','src/sup519_3d.js','src/aa614_3d.js','src/data/sis_b13_events.js','src/sis_b13_3d.js','src/data/us_life_events.js','src/whois3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js','src/ggshops_sys3d.js']) load(f);
  if(typeof EAT!=='undefined') global.EAT=undefined;   /* 店裡買東西不登記吃過（這裡只看說的話）*/
  if(typeof GGS!=='undefined') GGS.rand=()=>0;   /* 青木熱茶點完的旁白隨機一句：兩次都挑第一句 */
  const keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
  const P=(k,a)=>{ out[k]=(out[k]||[]).concat(a); };
  const rec=()=>H.said.map(s=>[s.who,s.t]);
  const sec=async(k,f)=>{ try{ await f(); }catch(e){ out.errs.push(k+'：'+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ').slice(0,400)); } };
  const setDay=(G,d,h,zone)=>{ G.day=d; G.weekday=wdOf(d); if(h!=null) G.hour=h; if(zone) G.zone=zone; };
  const bindAll=()=>{ SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); STORY._bindGM(GM); if(typeof POOL!=='undefined') POOL.bind(GM); };
  const POOLIDS=typeof POOL!=='undefined'?Object.keys(POOL.LINES).filter(id=>POOL.LINES[id]&&(POOL.LINES[id].talk||[]).length):[];
  const who=id=>({name:SOCIAL.displayName(id),charId:id});
  /* 一個人聊一次：pool 的同學（POOL.smallTalk，GM.say）、其他人（STORY.smallTalk 回 say／narr，照 talkCharacter 的寫法 GM.say(who,…)／GM.say(null,…)）*/
  const chat=async id=>{ const G=H.G; if(POOLIDS.includes(id)){ H.said=[]; await POOL.smallTalk(GM,who(id),id); return rec(); }
    const L=STORY.smallTalk(G,id); return L.say?[[who(id).name,L.say]]:[[null,L.narr]]; };
  const IDS=Object.keys(SMALLTALK).concat(['kai','npc_ta_chen','npc_huangxh']).filter((x,i,a)=>a.indexOf(x)===i);
  /* ---------- 18a 閒聊（story3d.js、SMALL_DAILY、greetB）：八個學期、四種地方和時間，每個人每天聊一次 ---------- */
  const SCN=[['Y1S1',1,9,'campus'],['Y1S1',6,15,'library'],['Y1S2',1,21,'dorm'],['Y1S2',8,10,'cafe'],['Y2S1',1,13,'campus'],['Y2S2',12,17.5,'campus'],['Y3S1',7,9.5,'library'],['Y3S2',13,15,'campus'],['Y4S1',5,15,'campus'],['Y4S2',10,15,'campus']];
  await sec('story',async()=>{ for(const id of IDS){ if(POOLIDS.includes(id)) continue; for(const [t,w,h,z] of SCN){ const d0=TD(t,w,1); if(d0==null) continue; H.fresh(keyOf(d0),h,z,{afternoonDone:true,classDone:true,introDone:true}); bindAll(); H.FAMILIAR(id);
      for(let k=0;k<12;k++){ setDay(H.G,d0+k,h,z); P('story',(await chat(id)).map(x=>[id,t+'w'+w+'+'+k].concat(x))); } } } });
  /* ---------- 18b 法律系同學（pool3d.js 的閒聊、之後的招呼、greetB）：每學期第 1 週起每天一次 ---------- */
  await sec('pool',async()=>{ for(const id of POOLIDS){ for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']){ const d0=TD(t,1,1); if(d0==null) continue; H.fresh(keyOf(d0),12.5,'campus',{afternoonDone:true}); bindAll(); H.FAMILIAR(id);
      for(let k=0;k<45;k++){ setDay(H.G,d0+k,12.5,'campus'); P('pool',(await chat(id)).map(x=>[id,t+'+'+k].concat(x))); } } } });
  /* ---------- 19 舊存檔：先聊十天（大一上第 1～2 週）存起來，再接著聊；old 回傳存檔（BASE 的程式寫的），new 讀它（換或不換）---------- */
  const MIG_IDS=IDS.filter(id=>!['kai'].includes(id)).concat(POOLIDS).filter((x,i,a)=>a.indexOf(x)===i);
  const migRun=async(d0,from,to)=>{ const L=[]; for(let k=from;k<to;k++){ setDay(H.G,d0+k,12.5,'campus'); for(const id of MIG_IDS) L.push(...(await chat(id)).map(x=>[id,k].concat(x))); } return L; };
  await sec('mig',async()=>{ const d0=TD('Y1S1',1,1);
    if(mode==='old'){ H.fresh(keyOf(d0),12.5,'campus',{afternoonDone:true}); bindAll(); for(const id of MIG_IDS) H.FAMILIAR(id); await migRun(d0,0,10); out.snap=JSON.stringify(H.G); out.migNext=await migRun(d0,10,60); }
    else if(IN.snap){ for(const doMig of [true,false]){ H.G=JSON.parse(IN.snap); bindAll(); let n=null; if(doMig) n=STORY.smallQuoteMigrate?STORY.smallQuoteMigrate(H.G):null; const L=await migRun(d0,10,60); if(doMig){ out.migN=n; out.migNext=L; out.migKeys=JSON.stringify(H.G.social.small).length; } else out.migNoFix=L; } } });
  /* ---------- 18c 木曜日雨天（S.rainScene）、日常失速（偶遇、阿哲兩個選項、找店員聊天）、公館三間（GGS.buy、包裹）---------- */
  await sec('shops',async()=>{ const d0=TD('Y2S1',5,3);
    for(const id of Object.keys(MOKS.RAIN)){ H.fresh(keyOf(d0),20,'wz_mokuyobi',{['dating_'+id]:true}); bindAll(); H.FAMILIAR(id); H.said=[]; H.picks=[0]; await MOKS.rainScene(GM,{who:id}); P('shops',rec().map(x=>['rain:'+id].concat(x))); }
    for(const [id,pk] of [['classmate_peishan',null],['yu',null],['zhe',0],['zhe',1]]){ H.fresh(keyOf(d0),20,'wz_offbeat'); bindAll(); H.FAMILIAR(id); H.said=[]; H.picks=pk==null?[]:[pk]; await OFFB.enc(GM,id); P('shops',rec().map(x=>['enc:'+id+(pk==null?'':'#'+pk)].concat(x))); }
    { const R0=[0.05,0.3,0.55,0.8]; H.fresh(keyOf(d0),20,'wz_offbeat'); bindAll(); for(let i=0;i<4;i++){ setDay(H.G,d0+i,20); OFFB.rand=()=>R0[i]; H.said=[]; await OFFB.chat(GM); P('shops',rec().map(x=>['chat#'+i].concat(x))); } }
    for(const [z,key] of [['cvs','cvs.hotfood'],['cvs','cvs.coffee'],['bookstore','bookstore.cafe_order'],['aoki','aoki.order']]){ H.fresh(keyOf(d0),15,z); bindAll(); H.G.money=5000; H.said=[]; H.picks=[0]; await GGS.buy(GM,key); P('shops',rec().map(x=>['buy:'+key].concat(x))); }
    { H.fresh(keyOf(d0),15,'aoki'); bindAll(); H.G.money=0; H.said=[]; H.picks=[0]; await GGS.buy(GM,'aoki.order'); P('shops',rec().map(x=>['poor'].concat(x))); }
    for(const has of [true,false]){ H.fresh(keyOf(d0),15,'cvs',{CVS_PARCEL:has?1:null}); bindAll(); H.said=[]; await GGS.interact({ggs:'parcel'},GM); P('shops',rec().map(x=>['parcel:'+has].concat(x))); } });
  /* ---------- 19 使用者存檔、whois、aa614（只有 new）---------- */
  if(mode==='new') await sec('fixture',async()=>{ const R={}; for(const f of ['user_save_day36_1105.json','user_save_day36_afar_1105.json','user_save_day37_1105.json']){ const s=JSON.parse(fs.readFileSync(path.join(ROOT,'tests/fixtures',f),'utf8')); const before=JSON.stringify(s.social.small); const n=STORY.smallQuoteMigrate(s); R[f]={n,small:s.social.small,before}; } out.fixture=R;
    /* whois：柏翰「法服的值班表」說過了（舊存檔 once 的 key 有「」）→ 換過以後照舊有「大二當法服社長。」*/
    const BH='classmate_bohan', d2=TD('Y2S2',3,1); const W={};
    for(const [k,key] of [['old','「法服的值班表，我排到十二月了。」'],['new','法服的值班表，我排到十二月了。']]){ H.fresh(keyOf(d2),12,'campus'); bindAll(); H.G.social.small={[BH]:{day:0,used:[key],last:key,once:{[key]:'Y2S1'}}}; const s={social:H.G.social}; STORY.smallQuoteMigrate(s); W[k]=WHOIS.lines(H.G,BH).map(x=>typeof x==='string'?x:(x&&(x.t||x.text))||''); }
    out.whois=W;
    /* aa614：阿凱那一句說過了（舊存檔的 key 有「」）→ 換過以後照舊認得（S.KAI_SMALL.t）*/
    { const kt=AA614.KAI_SMALL&&AA614.KAI_SMALL.t, s={social:{small:{kai:{day:0,used:['「'+kt+'」'],last:'「'+kt+'」',once:{['「'+kt+'」']:true}}}}}; STORY.smallQuoteMigrate(s); out.kai={t:kt,once:s.social.small.kai.once,used:s.social.small.kai.used}; } });
  process.stdout.write('@@B4@@'+JSON.stringify(out)+'\n',()=>process.exit(0));   /* 結果很長：寫完（pipe 清空）才結束 */
})().catch(e=>{ process.stdout.write('@@B4@@'+JSON.stringify({errs:['例外：'+String(e&&e.stack||e).slice(0,600)]})+'\n',()=>process.exit(0)); });
else main();

/* ===================== 主程式 ===================== */
function main(){
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, sample=L=>L.slice(0,6).join('／')+(L.length>6?'…（共 '+L.length+'）':'');
const lits=s=>{ const t=noComments(s), o=[]; let m; LIT.lastIndex=0; while((m=LIT.exec(t))) o.push({t:m[1],pre:t.slice(Math.max(0,m.index-40),m.index)}); return o; };
const wrappedLits=s=>lits(s).filter(x=>wrapped(x.t));
/* 資料檔載進來（BASE／現在）*/
const loadData=(files,names,rd)=>{ const c=vm.createContext({console}); c.globalThis=c; for(const f of files) vm.runInContext(rd(f).replace(/^const (\w+)\s*=/mg,(m,n)=>names.test(n)?'globalThis.'+n+'=':m),c,{filename:f}); return c; };
const rdBase=f=>gitShow(BASE,f);
const ST={old:loadData(['src/data/events.js'],/^(STORY_EVENTS|SMALLTALK)$/,rdBase).SMALLTALK,now:loadData(['src/data/events.js'],/^(STORY_EVENTS|SMALLTALK)$/,cur).SMALLTALK};
const PSN=/^(POOL_STORY|POOL_STORY_B2|POOL_STORY_B3|POOL_STORY_B4)$/;
const PS={old:loadData(POOL_FILES,PSN,rdBase),now:loadData(POOL_FILES,PSN,cur)};
const PSK=['POOL_STORY','POOL_STORY_B2','POOL_STORY_B3','POOL_STORY_B4'];
const isNarr=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let d=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='（') d++; else if(c==='）'){ d--; if(d===0) return i===t.length-1; } } return false; };

/* ---------- 15. 分類 ---------- */
{ const all=[]; for(const id of Object.keys(ST.now)) for(const e of ST.now[id]) all.push(typeof e==='string'?e:e.t);
  check('15. events.js SMALLTALK：'+all.length+' 句（閒聊，GM.say(who,…)）沒有一句外面還有「」',all.length===147/* （CANON-NO-ECON-1112 第四批：照 AA_886）*/&&all.every(t=>!wrapped(t)),sample(all.filter(wrapped)));
  const B=[], narr=[], room=[];
  const poolOpts=C=>{ const o=[]; for(const k of PSK){ const LN=(C[k]||{}).LINES||{}; for(const id of Object.keys(LN)) (function w(v,p){ if(v==null||typeof v==='function') return; if(typeof v==='string'){ if(/(Opts\.\d+$|\.choice\.\d+\.text$)/.test(p)) o.push(v); return; } if(typeof v==='object') for(const kk of Object.keys(v)) w(v[kk],p+'.'+kk); })(LN[id],id); } return o; };
  const opts=poolOpts(PS.now), optsW=opts.filter(wrapped);
  const other=[];   /* 「說的話」（動作）：第四批照留（不是整句外面的一對）；第五批拿掉說的話那一對＝說的話（動作） */
  for(const k of PSK){ const LN=(PS.now[k]||{}).LINES||{}; for(const id of Object.keys(LN)){ const P=LN[id];
      for(const e of (P.talk||[])){ B.push(e.t); if(e.old) B.push(e.old); }
      for(const g of (P.greet||[])){ if(isNarr(g)) narr.push(g); else if([...B5.values()].includes(g)) other.push(g); else B.push(g); }
      for(const x of ['zjwHand','bhCopier']) if(P[x]) B.push(P[x]);
      for(const x of ['card','cordLook','noteLook']) if(P[x]) room.push(P[x]); } }
  check('15. pool 的閒聊與之後的招呼：'+B.length+' 句（talk 的 t、old，greet 說的話，zjwHand、bhCopier）沒有一句外面還有「」',B.length===180&&B.every(t=>!wrapped(t)),sample(B.filter(wrapped)));
  check('15. pool 之後的招呼「說的話」（動作）'+other.length+' 句：第四批照留（列給 AA-B 看）；第五批拿掉說的話那一對、順序照舊＝'+other.join('／'),other.length===4&&other.every(t=>!/[「」]/.test(t)));
  check('15. pool 照留：greet 的整句旁白 '+narr.length+' 句、選項 '+opts.length+' 個（choice 的 text、…Opts；整句「」的 '+optsW.length+' 個）和 BASE 一字不差、房間物品 '+room.length+' 個（GM.say(null,…)）外面的「」都還在',
    narr.length===20&&optsW.length>=140&&J(opts)===J(poolOpts(PS.old))&&room.length===3&&room.every(wrapped),sample(room.filter(t=>!wrapped(t))));
  const st=noComments(cur('src/story3d.js')), bg=/const B_GREET=(\[[^;]*\]);/.exec(st), BG=bg?vm.runInNewContext('('+bg[1]+')'):[];
  const bgL=[].concat(...BG.map(p=>p.L.concat(p.law||[])));
  check('15. story3d.js B_GREET（不熟同學的短招呼）'+bgL.length+' 句沒有外面的「」',bgL.length===8&&bgL.every(t=>!wrapped(t)),J(bgL));
  check('15. pool3d.js 的「考前補給包的小卡」：房間物品（roomItems → GM.say(null,…)）＝沒有名字，pool_story.js 的 card 照留「第三題不會就先寫第四題。」',
    PS.now.POOL_STORY.LINES.pool_4.card==='「第三題不會就先寫第四題。」'&&/Lst\.push\(\['考前補給包的小卡',L\[Y\]\.card\]\)/.test(noComments(cur('src/pool3d.js')))&&/for\(const t of \[\]\.concat\(L\[i\]\[1\]\)\) await GM\.say\(null,t\);/.test(st));
  const MK=cur('src/mokuyobi_sys3d.js'), mw=wrappedLits(MK);
  check('15. mokuyobi_sys3d.js：剩下整句「」的 '+mw.length+' 個都是選項（oldYes、oldNo、bhGo、bhHome、rainOpts 的 t）',mw.length===6&&mw.every(x=>/(oldYes|oldNo|bhGo|bhHome|\bt):\s*$/.test(x.pre)),sample(mw.map(x=>x.pre.slice(-10)+'|'+x.t)));
  const OB=cur('src/offbeat_sys3d.js'), ow=wrappedLits(OB);
  check('15. offbeat_sys3d.js：剩下整句「」的 '+ow.length+' 個都是選項（zheOpts 的 t）',ow.length===2&&ow.every(x=>/\bt:\s*$/.test(x.pre)),sample(ow.map(x=>x.pre.slice(-10)+'|'+x.t)));
  const GS=cur('src/ggshops_sys3d.js'), gw=wrappedLits(GS);
  check('15. ggshops_sys3d.js：沒有整句「」的字串了（店員說的七句都拿掉；旁白裡的「剛出爐」「三十秒就好……」照留）',gw.length===0&&/店員說：「三十秒就好，不要泡太久。」/.test(GS)&&/寫著「剛出爐」/.test(GS),sample(gw.map(x=>x.t)));
  /* 2026-11-10 改期望（GIFT-HOLIDAY-1110 d4ea487b7：afar 的「選物…」、轉角唱片的「買禮物…」在 gg2shops3d.js 加了 GIFTH 兩段）：舊期望「和 BASE 一字不差」→ 新期望「拿掉含 GIFTH 的行以後和 BASE 一字不差」，沒有整句「」的字串照舊 */
  const noGH=t=>t.split('\n').filter(l=>!/GIFTH|\bhO\b|\bgO\b|const opts=D\.menu\.map|const gs=S\.CR_GENRES, k=await/.test(l)).join('\n');   /* 送禮那幾行（GIFTH、hO，和被改成接 hO 的兩行選單 opts／gs；2026-11-12 GIFT-ALL-DRINK-SHOPS-1112 加 gO＝「買一份帶走送人…」那幾行，舊期望沒有 gO）；其他行照舊要一字不差 */
  check('15. gg2shops3d.js 除了送禮（GIFTH、hO）那幾行，和 '+BASE+' 一字不差（第三批做完 ACC0 以後沒有整句「」的字串）',noGH(cur('src/gg2shops3d.js'))===noGH(gitShow(BASE,'src/gg2shops3d.js'))&&wrappedLits(cur('src/gg2shops3d.js')).length===0);
  const libOf=t=>{ const m=/libTalk:(\[[^\]]*\])/.exec(noComments(t)); return m?vm.runInNewContext('('+m[1]+')'):null; }, lib=libOf(cur('src/data/us_life_events.js')), lib0=libOf(gitShow(BASE,'src/data/us_life_events.js')), sb=noComments(cur('src/sis_b13_3d.js'));
  check('15. 動作在前面的（…）「…」：第四批照留（不是整句外面的一對）；第五批拿掉說的話那一對——us_life_events.js libTalk＝BASE 的三句拿掉那一對；sis_b13 不再包（沒有 smallQ，S.greetTexts＝稿上的字）',
    !!lib&&!!lib0&&lib0.length===3&&lib0.every(t=>B5.has(t))&&J(lib)===J(lib0.map(b5))&&!/const smallQ=/.test(sb)&&/S\.greetTexts=\(\)=>\(L\.repairGreet\|\|\[\]\)\.slice\(\);/.test(sb),J([lib0,lib])); }

/* ---------- 16. 資料和 BASE 逐句比 ---------- */
const B5HIT=[]; const A799=require('./aa799_expect.js');   /* AA_799（X324 G 區）：pool secret「其實……」12 句換了字——那幾格照稿算對（原本外面有「」的照樣算一句拿掉「」）*/   /* 第五批改的（B5 那八句）：另外記，不算第四批的 */
const deepSame=(a,b,bad,p)=>{ if(typeof a==='string'&&typeof b==='string'){ if(a===b) return 0; if(wrapped(a)&&unq(a)===b) return 1; if(A799.isAA799(a,b)) return wrapped(a)?1:0; if(isB5(a,b)){ B5HIT.push(p); return 0; } bad.push(p+'：'+a+' → '+b); return 0; }
  if(typeof a==='function'||typeof b==='function'){ if(String(a)!==String(b)) bad.push(p+'：函式不同'); return 0; }
  if(a===null||b===null||typeof a!=='object'||typeof b!=='object'){ if(a!==b) bad.push(p+'：'+J(a)+' → '+J(b)); return 0; }
  const ka=Object.keys(a), kb=Object.keys(b); if(J(ka)!==J(kb)){ bad.push(p+'：欄位不同'); return 0; } let n=0; for(const k of ka) n+=deepSame(a[k],b[k],bad,p+'.'+k); return n; };
{ const bad=[]; /* （CANON-NO-ECON-1112 第四批：照 AA_886 換字）芯慈雙主修三個版本只留第一句、拿掉條件——BASE 那兩句不比、第一句的 unless 拿掉；句數 149→147 */
  { const X=ST.old.classmate_xinci; if(Array.isArray(X)){ ST.old.classmate_xinci=X.filter(e=>!(e&&typeof e==='object'&&/自學過一點|我只問一件事/.test(e.t))).map(e=>{ if(e&&typeof e==='object'&&/^「?雙主修要多修好多學分/.test(e.t)&&e.unless){ const o=Object.assign({},e); delete o.unless; return o; } return e; }); } }
  const n=deepSame(ST.old,ST.now,bad,'SMALLTALK');
  check('16. SMALLTALK 和 '+BASE+' 逐句比：'+n+' 句只差外面的「」，條件（if、term、week、location、once、prio…）一字不差',n===147&&bad.length===0,sample(bad));
  for(const k of PSK){ const b2=[]; const m=deepSame(PS.old[k],PS.now[k],b2,k); const W={POOL_STORY:49,POOL_STORY_B2:52,POOL_STORY_B3:46,POOL_STORY_B4:33}[k], W5={POOL_STORY:0,POOL_STORY_B2:1,POOL_STORY_B3:3,POOL_STORY_B4:0}[k], h5=B5HIT.filter(p=>p.startsWith(k+'.'));
    check('16. '+k+' 和 '+BASE+' 逐句比：'+m+' 句只差外面的「」（talk、greet、zjwHand、bhCopier）'+(W5?'、'+h5.length+' 句是第五批的「說的話」（動作）→說的話（動作）（greet）':'')+'，其他（旁白、選項、場景、條件）一字不差',
      m===W&&b2.length===0&&h5.length===W5&&h5.every(p=>/\.greet\.\d+$/.test(p)),sample(b2.concat(h5))); }
  /* 拿掉的都是說的話：BASE 那一句在 talk／greet（說的話）／zjwHand／bhCopier */
  const ok=[], ok5=[], miss=[]; for(const k of PSK){ const LO=(PS.old[k]||{}).LINES||{}, LN=(PS.now[k]||{}).LINES||{}; for(const id of Object.keys(LO)){ const A=LO[id], Bn=LN[id];
      (function w(a,b,p){ if(typeof a==='string'){ if(a!==b&&!A799.isAA799(a,b)){ if(isB5(a,b)){ if(/^greet\.\d+$/.test(p)) ok5.push(p); else miss.push(id+'.'+p); } else if(/^(talk\.\d+\.(t|old)|greet\.\d+|zjwHand|bhCopier)$/.test(p)) ok.push(p); else miss.push(id+'.'+p); } return; } if(a&&typeof a==='object'&&typeof a!=='function') for(const kk of Object.keys(a)) w(a[kk],b&&b[kk],p?p+'.'+kk:kk); })(A,Bn,''); } }
  check('16. pool 改到的 '+ok.length+' 句都在 talk（t、old）、greet、zjwHand、bhCopier（選項、旁白、場景、房間物品沒有一句動）；第五批另外改了 greet 的 '+ok5.length+' 句',ok.length===180&&ok5.length===4&&miss.length===0,sample(miss));
  /* S.greetTexts 照原始碼那幾行算（BASE：smallQ 包「」；第五批以後沒有 smallQ＝稿上的字）*/
  const sg=t=>{ t=noComments(t); const m=/const smallQ=t=>\{[^\n]*\};/.exec(t), g=/S\.greetTexts=\(\)=>([^\n;]*);/.exec(t); const L=vm.runInNewContext('('+/repairGreet:(\[[^\]]*\])/.exec(noComments(cur('src/data/sis_b13_events.js')))[1]+')');
    return g?vm.runInNewContext('(function(L){ '+(m?m[0]:'')+' return ('+g[1]+'); })')({repairGreet:L}):null; };
  const so=sg(gitShow(BASE,'src/sis_b13_3d.js')), sn=sg(cur('src/sis_b13_3d.js'))||[];
  check('16. sis_b13 挽回中的短招呼：整句那兩句只差外面的「」（第四批），動作在前面的那一句第五批拿掉說的話那一對（'+J(sn)+'）',J(so.map((t,i)=>i===0?b5(t):unq(t)))===J(sn)&&wrapped(so[1])&&wrapped(so[2])&&B5.has(so[0])&&b5(so[0])===sn[0],J(so)+' → '+J(sn)); }

/* ---------- 17. 原始碼逐行比 ---------- */
const strip=line=>{ let s=line.replace(/\s+$/,'');
  s=s.replace(/'「'\+/g,'').replace(/\+'」'/g,'');   /* 程式自己包的 '「'+…+'」' */
  return s.replace(LIT,(m,t)=>wrapped(t)?"'"+unq(t)+"'":m); };
/* 註解拿掉（換行留著，行號對得上）*/
const blankComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,''));
const findC4=()=>{ try{ const L=cp.execFileSync('git',['-C',ROOT,'log','--format=%H %s','-F','--grep='+TITLE],{encoding:'utf8',maxBuffer:1<<26}).split('\n'); const x=L.find(l=>l.slice(41).startsWith(TITLE)); return x?x.slice(0,40):null; }catch(e){ return null; } };   /* 標題開頭是 TITLE 的那一個 commit（不限幾筆以內）；找不到（commit 以前）＝比 BASE 和現在的檔 */
{ const C4=findC4(), A_=f=>C4?gitShow(C4+'^',f):gitShow(BASE,f), B_=f=>C4?gitShow(C4,f):cur(f);
  console.log('（17. 比的是 '+(C4?'第四批那一個 commit '+C4.slice(0,9)+'^ → '+C4.slice(0,9):'commit 以前：'+BASE+' → 現在的檔')+'）');
  /* 資料檔：去掉註解以後的非空白行一行對一行；改到的那一行＝前一版拿掉外面的「」 */
  const WANT={'src/data/events.js':76,'src/data/pool_story.js':25,'src/data/pool_story_b2.js':28,'src/data/pool_story_b3.js':25,'src/data/pool_story_b4.js':17,'src/mokuyobi_sys3d.js':3,'src/offbeat_sys3d.js':5,'src/ggshops_sys3d.js':6,'src/whois3d.js':1};
  const per={}, bad=[], nlit={};
  /* 一行拆成程式和字串常值：程式一字不差；字串常值一樣、或前一版整句「」現在拿掉外面那一對 */
  const split=l=>{ const code=[], lit=[]; let last=0, m; LIT.lastIndex=0; while((m=LIT.exec(l))){ code.push(l.slice(last,m.index)); lit.push(m[1]); last=m.index+m[0].length; } code.push(l.slice(last).replace(/\s+$/,'')); return {code,lit}; };
  const lineSame=(a,b)=>{ const A=split(a), B=split(b); if(J(A.code)!==J(B.code)) return '程式（字串以外）不一樣'; if(A.lit.length!==B.lit.length) return '字串個數不一樣';
    for(let i=0;i<A.lit.length;i++){ const x=A.lit[i], y=B.lit[i]; if(x===y) continue; if(!(wrapped(x)&&unq(x)===y)) return '字串「'+x.slice(0,20)+'」→「'+y.slice(0,20)+'」不是只拿掉外面的「」'; } return null; };
  const litCount=(a,b)=>{ const A=split(a).lit, B=split(b).lit; let n=0; A.forEach((x,i)=>{ if(x!==B[i]) n++; }); return n; };
  for(const f of DATAF){ const A=blankComments(A_(f)).split('\n').filter(l=>l.trim()), B=blankComments(B_(f)).split('\n').filter(l=>l.trim());
    if(A.length!==B.length){ bad.push(f+'：註解以外的行數不同 '+A.length+' → '+B.length); continue; }
    let k=0; A.forEach((a,i)=>{ const b=B[i]; if(a===b) return; k++; const e=lineSame(a,b); if(e) bad.push(f+'：「'+a.trim().slice(0,50)+'」'+e); else nlit[f]=(nlit[f]|0)+litCount(a,b); });
    per[f]=k; }
  check('17. 資料檔每個檔改了幾行（註解以外）：'+J(per),J(per)===J(WANT),J(per));
  const WANTL={'src/data/events.js':149,'src/data/pool_story.js':49,'src/data/pool_story_b2.js':52,'src/data/pool_story_b3.js':46,'src/data/pool_story_b4.js':33,'src/mokuyobi_sys3d.js':9,'src/offbeat_sys3d.js':10,'src/ggshops_sys3d.js':7,'src/whois3d.js':1};
  check('17. 資料檔改到的每一行：字串以外一字不差，改到的字串都是前一版整句「」拿掉外面那一對（說話的人、選項、旁白那幾格沒動）；每個檔拿掉幾個字串：'+J(nlit),bad.length===0&&J(nlit)===J(WANTL),sample(bad)||J(nlit));
  /* 程式檔：改到的地方照這裡寫的，其他（註解以外）一字不差 */
  const codeOk=(f,pairs,adds)=>{ let A=blankComments(A_(f)).split('\n').filter(l=>l.trim()), B=blankComments(B_(f)).split('\n').filter(l=>l.trim());
    const errs=[]; for(const [o,n] of pairs){ const i=A.findIndex(l=>l.includes(o)); if(i<0){ errs.push('前一版沒有 '+o); continue; } A[i]=A[i].split(o).join(n); }
    let from=0; for(const re of adds){ const i=B.findIndex((l,j)=>j>=from&&re.test(l)); if(i<0){ errs.push('現在沒有 '+re); continue; } B.splice(i,1); from=i; }   /* 加的程式是連在一起的一段：照順序往下找 */
    if(A.length!==B.length) errs.push('行數不同 '+A.length+' → '+B.length); else A.forEach((a,i)=>{ if(a.replace(/\s+$/,'')!==B[i].replace(/\s+$/,'')) errs.push('第 '+(i+1)+' 行：'+a.trim().slice(0,50)+' → '+B[i].trim().slice(0,50)); });
    return errs; };
  const BGo="const B_GREET=[{w:[1,3],L:['「開學了。」','「這學期修了什麼？」']},{w:[7,9],L:['「期中加油。」','「你也在趕報告嗎？」'],law:['「加油。」','「你也在趕報告嗎？」']},";
  const C={
    'src/story3d.js':codeOk('src/story3d.js',[[BGo,strip(BGo)],["{w:[14,16],L:['「期末了，撐住。」','「考完了嗎？我還有一科。」']}]","{w:[14,16],L:['期末了，撐住。','考完了嗎？我還有一科。']}]"]],
      [/^\s*S\.smallUnq=k=>\{ if\(typeof k!=='string'\|\|k\.length<2\|\|k\[0\]!=='「'/,/^\s*S\.smallKnown=function\(\)\{/,/^\s*if\(typeof SMALLTALK!=='undefined'\) for/,/^\s*if\(typeof POOL!=='undefined'&&POOL\.LINES\) for/,/^\s*for\(const p of B_GREET\)/,/^\s*return K; \};$/,
       /^\s*S\.smallQuoteMigrate=function\(s\)\{/,/^\s*const fix=k=>\{/,/^\s*for\(const id of Object\.keys\(R\)\)\{ const r=R\[id\]/,/^\s*if\(Array\.isArray\(r\.used\)\) r\.used=r\.used\.map\(fix\)/,/^\s*if\(r\.once&&typeof r\.once==='object'/,/^\s*if\(r\.greet&&typeof r\.greet==='object'/,/^\s*return n; \};$/]),
    'src/pool3d.js':codeOk('src/pool3d.js',[["const sayAny=async(GM,who,t)=>{ if(/^（/.test(t))","const sayAny=async(GM,who,t)=>{ if(S.narrWhole(t))"]],[/^\s*S\.narrWhole=t=>\{ if\(typeof t!=='string'\|\|t\[0\]!=='（'\) return false;/]),
    'src/game3d.js':codeOk('src/game3d.js',[],[/^\s*if\(typeof STORY!=='undefined'&&STORY\.smallQuoteMigrate&&s\.social&&typeof s\.social==='object'\)\{ try\{ STORY\.smallQuoteMigrate\(s\); \}/]),
    'src/aa614_3d.js':codeOk('src/aa614_3d.js',[["t:'「'+S.L.talk.kai+'」'","t:S.L.talk.kai"]],[]),
    'src/sis_b13_3d.js':codeOk('src/sis_b13_3d.js',[[":'「'+t+'」'; };",":t; };"]],[]),
    'src/sup519_3d.js':codeOk('src/sup519_3d.js',[["return {say:'「'+o.t+'」',fresh:true}; };","return {say:o.t,fresh:true}; };"],["return {say:'「'+o.t+'」',fresh:!!o.fresh}; };","return {say:o.t,fresh:!!o.fresh}; };"]],[]) };
  for(const f of Object.keys(C)) check('17. '+f+'：程式只改了這幾處（註解以外一字不差）',C[f].length===0,sample(C[f])); }

/* ---------- 18、19. 演出來：BASE 和現在各跑一次 ---------- */
const runProbe=(m,input)=>{ let o=''; try{ o=cp.execFileSync(process.execPath,[__filename],{env:Object.assign({},process.env,{QUOTE_B4_PROBE:m}),encoding:'utf8',maxBuffer:1<<29,input:input||'',stdio:['pipe','pipe','pipe']}); }catch(e){ o=String(e.stdout||''); }
  const line=o.split('\n').find(l=>l.startsWith('@@B4@@')); return line?JSON.parse(line.slice(6)):{errs:['子程序沒有結果：'+o.slice(-300)]}; };
const O=runProbe('old'), N=runProbe('new',J({snap:O.snap||null}));
check('18. 兩次都跑得起來（'+BASE+' 的檔、現在的檔；沒有例外）',!O.errs.length&&!N.errs.length,sample(O.errs.concat(N.errs)));
const cmp=(A,B,cut)=>{ const bad=[], nw=[]; let ch=0, named=0; A=A||[]; B=B||[];
  if(A.length!==B.length) bad.push('句數 '+A.length+' → '+B.length);
  else A.forEach((a,i)=>{ const b=B[i], ta=a[a.length-1], tb=b[b.length-1];
    if(J(a.slice(0,-1))!==J(b.slice(0,-1))) bad.push('說的人不一樣：'+J(a)+' → '+J(b));
    else if(ta!==tb){ if((wrapped(ta)&&unq(ta)===tb||isB5(ta,tb))&&b[b.length-2]!=null) ch++; else bad.push(J(a)+' → '+J(b)); }   /* isB5：第五批的八句 */
    if(b[b.length-2]!=null){ named++; if(wrapped(tb)) nw.push(J(b)); } });
  return {bad,nw,ch,named}; };
{ const KEYS={story:['閒聊（story3d.js S.smallTalk；SMALL_DAILY；不熟同學的短招呼）',150],pool:['法律系同學的閒聊、之後的招呼、短招呼（pool3d.js）',150],shops:['木曜日雨天、日常失速、公館三間店員',25]};
  for(const k of Object.keys(KEYS)){ const r=cmp(O[k],N[k]);
    check('18. '+KEYS[k][0]+'：'+(N[k]||[]).length+' 句，說的人和 '+BASE+' 一樣、字只差外面的「」（拿掉 '+r.ch+' 句）',(N[k]||[]).length>0&&r.bad.length===0&&r.ch>=KEYS[k][1],sample(r.bad));
    check('18. '+KEYS[k][0]+'：有名字說的 '+r.named+' 句沒有一句外面還有「」',r.named>=KEYS[k][1]&&r.nw.length===0,sample(r.nw)); }
  const has=(k,f)=>(N[k]||[]).some(f), said=(N.story||[]).concat(N.pool||[]);
  const distinct=new Set(said.filter(x=>x[x.length-2]!=null).map(x=>x[x.length-1]));
  const stAll=[]; for(const id of Object.keys(ST.now)) for(const e of ST.now[id]) stAll.push(typeof e==='string'?e:e.t);
  check('18. 演到的閒聊有 '+distinct.size+' 種不同的句子（SMALLTALK 的 '+stAll.length+' 句演到 '+stAll.filter(t=>distinct.has(t)).length+' 句）',distinct.size>=150&&stAll.filter(t=>distinct.has(t)).length>=60);
  check('18. 何宇軒「（他按掉手機的計時器）時間到。」：他說的（有名字），不是旁白（原本「（他按掉……）時間到。」靠開頭的「；現在看整句是不是一對（））',has('pool',r=>r[r.length-2]&&r[r.length-1]==='（他按掉手機的計時器）時間到。')&&!has('pool',r=>r[r.length-2]==null&&/他按掉手機的計時器/.test(r[r.length-1])));
  check('18. 之後的招呼的整句旁白照舊是旁白（沒有名字）',has('pool',r=>r[r.length-2]==null&&/^（.*）$/.test(r[r.length-1])));
  check('18. 不熟同學的短招呼（greetB）：有名字說「開學了。」「這學期修了什麼？」（外面沒有「」）',has('pool',r=>r[r.length-2]&&r[r.length-1]==='開學了。')&&has('pool',r=>r[r.length-2]&&r[r.length-1]==='這學期修了什麼？'));
  check('18. SMALL_DAILY（陳助教、筱涵一年兩句）：有名字、外面沒有「」',has('story',r=>r[0]==='npc_ta_chen'&&r[2]&&!wrapped(r[3])&&!/^（/.test(r[3]))&&has('story',r=>r[0]==='npc_huangxh'&&r[2]&&!wrapped(r[3])&&!/^（/.test(r[3])));
  check('18. 木曜日雨天：七位各一句有名字、外面沒有「」；兩個選項以後的旁白照舊',['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'].every(id=>has('shops',r=>r[0]==='rain:'+id&&r[1]&&!wrapped(r[2]))));
  check('18. 日常失速：沛珊、Alison（兩句中間「（三分鐘後）」旁白）、阿哲「練完好餓。你要不要一起？」；選了以後明軒「他每次都這樣。」、阿哲「好，下次。」；店員四句',
    has('shops',r=>r[0]==='enc:yu'&&r[1]===null&&r[2]==='（三分鐘後）')&&has('shops',r=>r[0]==='enc:zhe#0'&&r[2]==='他每次都這樣。')&&has('shops',r=>r[0]==='enc:zhe#1'&&r[2]==='好，下次。')&&new Set((N.shops||[]).filter(r=>/^chat#/.test(r[0])&&r[1]==='店員').map(r=>r[2])).size===4);
  check('18. 公館三間：店員「要加熱嗎？……那幫你裝袋。」「大杯還是中杯？」「書可以帶到位子上看喔。……」「第一泡我幫你泡……」「冷泡的柚香綠茶比較便宜喔。」「末三碼？」「……查不到耶。可能還沒到。」',
    ['要加熱嗎？……那幫你裝袋。','大杯還是中杯？','書可以帶到位子上看喔。……沒買的看完放回去就好。','第一泡我幫你泡，之後可以自己加熱水。','冷泡的柚香綠茶比較便宜喔。','末三碼？','……查不到耶。可能還沒到。'].every(t=>has('shops',r=>r[1]==='店員'&&r[2]===t))); }
/* 19. 舊存檔 */
{ const r=cmp(O.migNext,N.migNext), r0=cmp(O.migNext,N.migNoFix);
  check('19. 舊存檔（'+BASE+' 的程式聊了十天存起來）讀進現在的程式（smallQuoteMigrate 換了 '+N.migN+' 個記號）接著聊五十天：'+(N.migNext||[]).length+' 句和 BASE 一路聊下去一樣（說的人一樣、字只差外面的「」）',
    (N.migN|0)>=20&&(N.migNext||[]).length>500&&r.bad.length===0&&r.nw.length===0,sample(r.bad.concat(r.nw)));
  check('19. 不換記號的話會不一樣（說過一次的句子又說、輪流的順序亂掉：'+r0.bad.length+' 處）——這一項確定上面那一項真的有在比',r0.bad.length>0);
  const F=N.fixture||{}, fk=Object.keys(F);
  check('19. 使用者存檔（tests/fixtures 三份）：閒聊記號換成現在的句子（換了 '+fk.map(f=>F[f].n).join('、')+' 個）；明軒「阿哲說週五練球。」、阿哲「公館那家滷味晚上十點後半價。」',
    fk.length===3&&fk.every(f=>F[f].n>0&&/「阿哲說週五練球。」/.test(F[f].before))&&fk.every(f=>{ const S=F[f].small; return S.classmate_mingxuan&&S.classmate_mingxuan.once&&S.classmate_mingxuan.once['阿哲說週五練球。']===true&&!('「阿哲說週五練球。」' in S.classmate_mingxuan.once)&&S.zhe.used.includes('公館那家滷味晚上十點後半價。'); }),
    J(fk.map(f=>F[f].n)));
  check('19. 使用者存檔：對不到現在閒聊表的舊句子照留（陳助教「「論文寫到第三章。……別問我第四章。」」是改稿前的句子）',fk.every(f=>{ const S=F[f].small; return !S.npc_ta_chen||S.npc_ta_chen.used.includes('「論文寫到第三章。……別問我第四章。」'); }));
  const W=N.whois||{};
  check('19. whois3d.js：柏翰「法服的值班表」說過了（舊存檔的 key 有「」、換過；新存檔沒有「」）→ 人物頁都有「大二當法服社長。」',(W.old||[]).includes('大二當法服社長。')&&(W.new||[]).includes('大二當法服社長。'),J(W));
  const K=N.kai||{};
  check('19. aa614_3d.js：阿凱那一句（S.KAI_SMALL.t 不加「」）說過了的舊記號換成現在的句子',!!K.t&&!wrapped(K.t)&&K.once&&K.once[K.t]===true&&J(K.used)===J([K.t]),J(K));
  check('19. game3d.js 讀檔（migrate）叫 STORY.smallQuoteMigrate；在 POOL.migrate 後面',/POOL\.migrate\(s\);[^\n]*\n[^\n]*STORY\.smallQuoteMigrate\(s\)/.test(cur('src/game3d.js'))); }

/* ---------- 20. 讀這些句子的程式沒動 ---------- */
{ const st=noComments(cur('src/story3d.js')), po=noComments(cur('src/pool3d.js')), mk=noComments(cur('src/mokuyobi_sys3d.js')), ob=noComments(cur('src/offbeat_sys3d.js')), gs=noComments(cur('src/ggshops_sys3d.js')), pm=noComments(cur('src/pool_more3d.js'));
  check('20. story3d.js：閒聊 GM.say(who,L.say)、旁白 GM.say(null,L.narr)；greetB 回 {say:line}',/const L=S\.smallTalk\(G,id\); if\(L\.say\) await GM\.say\(who,L\.say,\{expr:'smile'\}\); else await GM\.say\(null,L\.narr\);/.test(st)&&/return \{say:line,fresh:false\};/.test(st));
  check('20. pool3d.js：閒聊 GM.say(who,e.t)、greetB 的 o.say GM.say(who,o.say)、之後的招呼 sayAny；秘密以後那一句 GM.say(who,e.t)；pool_more3d.js 同',/r\.once\|\|\(r\.once=\{\}\)\)\[e\.t\]=true; await GM\.say\(who,e\.t,\{expr:'smile'\}\);/.test(po)&&/if\(o&&o\.say\)\{ await GM\.say\(who,o\.say\);/.test(po)&&/await sayAny\(GM,who,gL\[k\]\);/.test(po)&&/r\.day=G\.day; await GM\.say\(who,e\.t\);/.test(po)&&/await GM\.say\(who,e\.t\); \}/.test(pm)&&/await GM\.say\(who,L\[M\]\.bhCopier,\{expr:'smile'\}\);/.test(pm));
  check('20. mokuyobi_sys3d.js：雨天 GM.say(who,S.RAIN[id])、柏翰 GM.say(w,S.L.bhAsk)／GM.say(w,S.L.bhBye)；選項 GM.choose 的 t 照舊',/await GM\.say\(who,S\.RAIN\[id\]\);/.test(mk)&&/await GM\.say\(w,S\.L\.bhAsk\);/.test(mk)&&/await GM\.say\(w,S\.L\.bhBye\);/.test(mk)&&/GM\.choose\(\[\{t:S\.L\.bhGo\},\{t:S\.L\.bhHome\}\]\)/.test(mk)&&/GM\.choose\(\[\{t:S\.L\.oldYes\},\{t:S\.L\.oldNo\}\]\)/.test(mk)&&/GM\.choose\(S\.L\.rainOpts\.map\(o=>\(\{t:o\.t\}\)\)\)/.test(mk));
  check('20. offbeat_sys3d.js：sayAll（店員＝{name:\'店員\'}、其他＝whoOf）、找店員聊天 GM.say(CLERK,…)、阿哲的選項 GM.choose(O.map(o=>({t:o.t})))',/const sayAll=async\(GM,L\)=>\{ for\(const \[w,t\] of L\) await GM\.say\(w==null\?null:\(w==='店員'\?CLERK:whoOf\(GM,w\)\),t\); \};/.test(ob)&&/await GM\.say\(CLERK,S\.L\.chat\[i\]\);/.test(ob)&&/GM\.choose\(O\.map\(o=>\(\{t:o\.t\}\)\)\)/.test(ob));
  check('20. ggshops_sys3d.js：sayL（店員＝{name:\'店員\'}）',/const sayL=async\(GM,L\)=>\{ for\(const \[w,t\] of L\) await GM\.say\(w==null\?null:\(w==='店員'\?CLERK:\{name:w\}\),t\); \};/.test(gs)&&/CLERK=\{name:'店員'\}/.test(gs)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}
