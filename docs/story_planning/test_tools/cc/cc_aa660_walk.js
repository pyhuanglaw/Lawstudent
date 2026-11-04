#!/usr/bin/env node
/* CC-C（帳號 C）11-04：AA660-VAC-GAP-1104 交換路線在臺灣的空白日子——「照日期走一遍」（BB-C 16:27；P3；雲端 Node，不佔電腦）。
   和 LAWWW 的 tests/aa660_vac_gap_unit.js（每一項自己設好狀態再測）不同：這支從出發前一路照時間往前推（每 15 分鐘一次手機規則＋PHONE.tick），
   把路上出現的每一則 aa660 訊息（連同 heard_h509_kevin、y3_an_farewell_ask）照時間收起來，再逐字對 AA_660。抓得到順序、重複、漏掉、時間錯。
   - 美國：7/26 08:00 → 8/2 出發（US_DEPARTED）→ 美國第一週（G1-5，臺灣 21:00＝當地 09:00）→ 12/23 回國（US_RETURNED）→ 12/26。7/31 照 OUT 出門餞行（OUT.go）。
     摘要日（7/29、12/25、1/13）在那天之前用 HOLFF.sums 讀（1/12～1/14 沒有訊息，沒走）。
     問句三種回法：不回（掃描的 strict）／選第一個／選第二個。
   - 日本：3/22～3/24（G4 阿哲那則）；8/5 JP.returnHome 回國 → 8/31（G5、G6 摘要日 JP.dueStop／playStop）。和以安交往中、沒交往兩種。
   - 臺灣：同樣的日子走一遍，aa660 的東西一則都不能有。
   - 舊存檔：7/28 10:00 才讀進來（隔天）＝G1-1 照補；7/29 10:00 才讀進來（第三天）＝不補。
   預期台詞照 AA_660 第 2 節抄（EXP_090981 ＝ 程式照的那一版；LATEST ＝ 企劃線 0777c92ac 16:28 AA 回 LAWWW-C 五件以後的版本）；兩版不一樣的句子分開報：
     和 090981ebe 一致、和 0777c92ac 不一致＝「稿已更新、程式還沒接」（INFO，不算 FAIL；BB 判）。
   【前置／捷徑】pg_harness 的假 GM（不需要瀏覽器）、直接設 G 的日期時間和路線旗標（出發、到達、回國照 AA_660 第 1 節與 ROUTE_DATES 的日子手動設）。
   用法：LW_ROOT=<開發分支 worktree> node cc_aa660_walk.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM,E}=H, J=JSON.stringify;
let FAILS=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
/* 載入順序照 index.html（和 LAWWW 的測試同一份清單；pg_harness 已經載了其他的）*/
const FILES=['src/exchange3d.js','src/holff3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js',
  'src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/us_layouts.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/us_life_events.js','src/us_life3d.js','src/data/heard_lines.js','src/heard3d.js','src/data/heroine_asks.js','src/aa660_3d.js'];
for(const f of FILES){ if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); if(typeof HEARD!=='undefined'&&HEARD.phone) HEARD.phone(H.G); PHONE.tick(H.G); };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; if(!G.acts) G.acts={att:{}}; G.visited=G.visited||{}; HOME.rec(G); return G; };
const atHome=G=>{ const Hm=HOME.rec(G); Hm.at=true; Hm.day=G.day; Hm.lbreak=HOME.lawBreak(G)?HOME.lawBreak(G).key:null; Hm.brk=Hm.lbreak; Hm.bskip=Hm.lbreak?{key:Hm.lbreak,n:0,last:-1}:null; };
const NM={yu:'Alison',classmate_mingxuan:'明軒',classmate_xinci:'芯慈',zhe:'阿哲',heroine_01:'以安',mom:'媽媽',dad:'爸爸',sister:'姊姊',player:'你（自動）'};
const hm=h=>String(Math.floor(h+1e-6)).padStart(2,'0')+':'+String(Math.round((h-Math.floor(h+1e-6))*60)).padStart(2,'0');
const dk=d=>{ const c=CALENDAR.dateOf(d); return c.m+'/'+c.d; };
const WANT=/^(aa660_|heard_h509_kevin|y3_an_farewell)/;
/* 收訊息：照物件記，不靠索引（PHONE 可能照時間插入）*/
function collector(){ const seen=new Set(), out=[];
  const take=()=>{ for(const m of (H.G.msgs||[])){ if(seen.has(m)) continue; seen.add(m); if(!WANT.test(m.tag||'')) continue;
    out.push({day:m.day,h:m.h,date:m.day!=null?dk(m.day):'?',time:m.h!=null?hm(m.h):'?',th:m.th,from:m.from||m.who||null,who:NM[m.from||m.who]||m.from||m.who||'',text:m.text,tag:m.tag,quiet:!!m.quiet,ask:m.ask?m.ask.opts.map(o=>o.t):null}); } };
  const push=(L,tag)=>{ for(const m of (L||[])){ seen.add(m); out.push({day:m.day,h:m.h,date:m.day!=null?dk(m.day):'?',time:m.h!=null?hm(m.h):'?',th:m.th,from:m.from||m.who||null,who:NM[m.from||m.who]||(m.from==='player'?NM.player:(m.from||m.who||'')),text:m.text,tag,quiet:!!m.quiet,ask:null}); } };
  return {take,out,push}; }
/* 回問句：PHONE.answer 回傳的 out（玩家那則＋對方的回覆）沒有 tag，收進來時標 <問句 id>_ans（11-04 第一輪漏收＝探針的 bug）*/
const answer=(C,id,k)=>{ const m=PHONE.byAsk&&PHONE.byAsk(H.G,id); if(!m||m.ans!=null) return false; const r=PHONE.answer(H.G,id,k); if(r&&r.out) C.push(r.out,id+'_ans'); return !!r; };
const show=(title,L)=>{ info(title+'（'+L.length+' 則）'); for(const m of L) console.log('     '+m.date+' '+m.time+' ['+(m.th||'')+'] '+m.who+'：'+m.text+(m.quiet?'（quiet）':'')+(m.ask?'　選項 '+J(m.ask):'')+'　<'+m.tag+'>'); };
const seq=(L,tagRe)=>L.filter(m=>tagRe.test(m.tag)).map(m=>m.who+'：'+m.text);
const eqSeq=(name,got,exp,extra)=>check(name,J(got)===J(exp),(J(got)===J(exp)?'':'實際 '+J(got)+'；預期 '+J(exp))+(extra?'　'+extra:''));

/* ---------- 預期（AA_660 第 2 節照抄；090981ebe 和 0777c92ac 不一樣的地方兩個都寫）---------- */
const X={
  g11ask:['媽媽：八月二號幾點的飛機'],
  g11opt:{v0909:['早上九點半。','我自己搭機捷。'], latest:['早上九點半。','不用載，我自己去。']},
  g11say:{v0909:[['媽媽：那六點要出門','媽媽：我載你'],['媽媽：那我五點起來煮早餐']], latest:[['媽媽：那六點要出門','媽媽：我載你'],['媽媽：我要去。我要看你進去。']]},
  g11after:['姊姊：記得帶轉接頭','姊姊：……不用 美國插座跟我們一樣 我剛查了','爸爸：？'],
  g13grp:['Alison：禮拜一幫祐廷餞行','Alison：七點 燒臘店','阿哲：我在高雄 幫我多吃一盤','明軒：會到。'],
  g13ev:{a:['（燒臘店最裡面那張長桌。Alison 把一張折成四折的紙推到你面前。）','Alison：這是我們列的。你到了以後要拍給我們看的東西。','（紙上寫著：校園的松鼠、超市最大包的洋芋片、教室、你的房間。最後一行是明軒的字：「你自己」。）',
      '明軒：最後那個是我寫的。……拍你自己，不要只拍風景。','芯慈：時差幾個小時？'],
    optA:'芯慈：那你睡覺的時候我們剛起床。……訊息不用馬上回。', optB:'芯慈：十二個小時。我剛剛查了。', close:'（吃完，Alison 把那張紙折好，塞進你的護照套裡。）'},
  g14:['媽媽：明天五點我叫你','爸爸：到了在群組說一聲','姊姊：一路平安'],
  g15:['你（自動）：📷（校園的松鼠，站在垃圾桶的蓋子上）','Alison：打勾！！','Alison：剩下三個'],
  g21latest:['媽媽：接到了','媽媽：📷（餐桌上一鍋蘿蔔排骨湯，旁邊一碗已經盛好了）','爸爸：平安就好','姊姊：先讓他睡'],
  g22list:['Alison：回來了？？','Alison：清單最後一項 你一直沒拍','明軒：現在拍也可以。'],
  g22opt:{v0909:['（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）','回去當面給你們看。'], latest:['（傳一張自己的照片：背景是機場的行李轉盤，你看起來很睏。）','見面再給你們看。']},
  g22say:{v0909:[['明軒：好。這張可以。','Alison：打勾！！清單完成'],['Alison：……好啦 那也算']], latest:[['明軒：好。這張可以。','Alison：打勾！！清單完成'],['Alison：好啦 那也算']]},
  g22noList:['Alison：回來了？？','Alison：桌遊夜幫你留位子'],
  g23first:'學姊跟學弟都回來了',
  g12:'（宿舍搬空了。家裡你的房間多了幾個紙箱，最上面那個用奇異筆寫著「美國」。）',
  g31:'（凌晨四點就醒了。外面還是黑的，你躺著聽樓下的機車一台一台騎過去。）',
  g32:{v0909:'（臺灣這學期的課你都沒修。大家在準備期末，你在總圖把美國的筆記重新整理一遍，有些字你一時想不起中文怎麼說。）', latest:'（寒假的總圖人很少。你把美國的筆記重新整理一遍，有些字你一時想不起中文怎麼說。）'},
  g4:'明天 幫以安跟祐廷餞行',
  g51:['你（自動）：到了','媽媽：好','媽媽：冰箱有切好的芒果','爸爸：平安就好'],
  g52an:['Alison：你們兩個回來了？？','以安：回來了。','以安：排隊入境的時候，祐廷站著睡著了。'],
  g52opt:['那叫閉眼睛。','……妳也有。'], g52say:[['以安：閉到輪到我們。'],['以安：我是在想事情。']], g52only:['Alison：回來了？？'],
  g6:{'8/12':'（你在超商結帳的時候，差一點用日文說了謝謝。店員看了你一眼。）','8/22':'（你把日本帶回來的筆記一本一本貼上標籤：比較行政法、日文、研討課。）','8/29':'（晚上的溫州街有一點涼了。你走到巷口買了一杯冰的，站在路燈下面喝完。）'} };
const both=(name,got,v0909,latest)=>{ const a=J(got)===J(v0909), b=J(got)===J(latest);
  if(b) return check(name+'（和 AA_660 最新版 0777c92ac 一致）',true);
  if(a){ info(name+'：和程式照的 090981ebe 一致，但 AA_660 16:28（0777c92ac，AA 回 LAWWW-C 五件）改過——稿已更新、程式還沒接：實際 '+J(got)+'；最新稿 '+J(latest)); return true; }
  return check(name,false,'實際 '+J(got)+'；090981ebe '+J(v0909)+'；最新稿 '+J(latest)); };

(async()=>{
  check('載入：模組都在（src/aa660_3d.js：AA660）',!loadErr.length&&typeof AA660!=='undefined'&&typeof AA660.phone==='function',J(loadErr));
  const US0={EXCHANGE_ROUTE:'US',EXCH_RULE:1}, JP0={EXCHANGE_ROUTE:'JP',EXCH_RULE:1}, TW0={EXCHANGE_ROUTE:'TW',EXCH_RULE:1};
  const PRE=()=>{ for(const id of ['yu','classmate_mingxuan','classmate_xinci','zhe']) H.FRIEND(id); PHONE.join(H.G,'noodle_team','桌遊團'); PHONE.join(H.G,'family_law','法律系直屬家族'); };
  const STEP=0.25;
  const walk=async(C,d0,h0,d1,h1,hook)=>{ for(let t=T(d0,h0);t<=T(d1,h1)+1e-9;t+=STEP){ const d=Math.floor(t/24+1e-9), h=+(t-d*24).toFixed(4); at(d,h); if(hook) await hook(d,h); phone(); C.take(); } };

  /* ================= 美國 ================= */
  const usWalk=async(mode,fl)=>{ const route=fl||US0; fresh('2028-07-26',8,'dorm',Object.assign({},route)); atHome(H.G); PRE(); const C=collector(); let ev=null, lists={}; const sums={};
    const ans=(id,k)=>{ if(mode==='none') return; answer(C,id,k); };
    /* 摘要日：要在那天之前問（HOLFF.sums 只列還沒過的；11-04 第一輪走完才問，7/29 已經過了＝探針的 bug）*/
    const grab=()=>{ if(typeof HOLFF==='undefined'||!HOLFF.sums) return; for(const q of HOLFF.sums(H.G)) if([D('2028-07-29'),D('2028-12-25'),D('2029-01-13')].includes(q.day)&&!sums[dk(q.day)]) sums[dk(q.day)]=typeof q.s.line==='function'?q.s.line(H.G):q.s.line; };
    await walk(C,D('2028-07-26'),8,D('2028-08-01'),23.75,async(d,h)=>{
      if(h===8) grab();
      ans('aa660_us_flight',mode==='b'?1:0);
      if(d===D('2028-07-31')&&h>=19&&!ev&&typeof OUT!=='undefined'){ const q=OUT.get(H.G,'aa660_us_farewell'); if(q){ H.said=[]; H.picks=[mode==='b'?1:0]; await OUT.go(GM,q,{fromHome:true}); ev={lines:H.lines(),list:!!H.G.flags.US_PHOTO_LIST,at:dk(d)+' '+hm(h)}; } } });
    lists.afterFarewell=!!H.G.flags.US_PHOTO_LIST;
    /* 8/2 出發（09:30 起飛；到達當地 8/2）；之後的鐘是美國當地時間 */
    Object.assign(H.G.flags,{US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together'}); H.G.zone='us_apartment';
    await walk(C,D('2028-08-02'),12,D('2028-08-07'),23.75);
    /* 12/23 回國（05:40 落地；媽媽接機） */
    Object.assign(H.G.flags,{US_RETURNED:D('2028-12-23'),US_TRIP_DONE:true,ROOM_Y4:D('2028-12-23')}); H.G.zone='dorm';
    await walk(C,D('2028-12-23'),5,D('2028-12-26'),0,async(d,h)=>{ if(h===8) grab(); ans('aa660_us_back_photo',mode==='b'?1:0); }); grab();   /* HOLFF.sums 只列這一段假期的（12/24 還是期末週，12/25 起才是寒假）*/
    return {C,ev,sums,flags:{US_PHOTO_LIST:!!H.G.flags.US_PHOTO_LIST}}; };

  for(const mode of ['none','a','b']){
    const tagM={none:'不回',a:'選第一個',b:'選第二個'}[mode], r=await usWalk(mode), L=r.C.out;
    show('美國路線（問句'+tagM+'）走一遍收到的 aa660 訊息',L);
    const g11=L.filter(m=>m.tag==='aa660_us_flight'), g11s=L.filter(m=>m.tag==='aa660_us_flight_sis');
    eqSeq('[美國/'+tagM+'] G1-1 7/27 21:00 家人群組第一則',g11.slice(0,1).map(m=>m.who+'：'+m.text),X.g11ask,g11[0]?g11[0].date+' '+g11[0].time+' '+g11[0].th:'');
    check('[美國/'+tagM+'] G1-1 在 7/27 21:00、家人群組',!!g11[0]&&g11[0].date==='7/27'&&g11[0].time==='21:00'&&/home/.test(g11[0].th||''),g11[0]?J([g11[0].date,g11[0].time,g11[0].th]):'沒有');
    if(g11[0]) both('[美國/'+tagM+'] G1-1 兩個回法',g11[0].ask,X.g11opt.v0909,X.g11opt.latest);
    if(mode==='none'){
      eqSeq('[美國/不回] G1-1 兩個小時沒回：姊姊兩則、爸爸「？」照樣傳（23:00、quiet＝快轉不停）',g11s.map(m=>m.who+'：'+m.text),X.g11after,g11s[0]?g11s[0].date+' '+g11s[0].time:'');
      check('[美國/不回] G1-1 那三則都是 quiet、在 7/27 23:00～23:15',g11s.length===3&&g11s.every(m=>m.quiet&&m.date==='7/27'&&m.h>=23&&m.h<23.3),J(g11s.map(m=>[m.time,m.quiet])));
    } else {
      const k=mode==='a'?0:1, rep=L.filter(m=>m.tag==='aa660_us_flight_ans'), got=g11.slice(1).concat(rep.filter(m=>m.from!=='player')).map(m=>m.who+'：'+m.text);
      info('[美國/'+tagM+'] G1-1 玩家回的那則：'+J(rep.filter(m=>m.from==='player').map(m=>m.text)));
      both('[美國/'+tagM+'] G1-1 回了以後媽媽的回答＋姊姊兩則、爸爸「？」',got,X.g11say.v0909[k].concat(X.g11after),X.g11say.latest[k].concat(X.g11after));
      check('[美國/'+tagM+'] G1-1 回了就不再補傳那三則',!g11s.length,J(g11s.length));
    }
    const g13=L.filter(m=>m.tag==='aa660_us_farewell_grp');
    eqSeq('[美國/'+tagM+'] G1-3 7/30 21:00 桌遊團群組（Alison 揪、阿哲在高雄、明軒會到）',seq(g13,/./),X.g13grp,g13[0]?g13[0].date+' '+g13[0].time+' '+g13[0].th:'');
    check('[美國/'+tagM+'] G1-3 群組在 7/30 21:00',!!g13[0]&&g13[0].date==='7/30'&&g13[0].time==='21:00',g13[0]?J([g13[0].date,g13[0].time]):'沒有');
    if(r.ev){ const exp=X.g13ev.a.concat([mode==='b'?X.g13ev.optB:X.g13ev.optA,X.g13ev.close]);
      const got=r.ev.lines.filter(l=>!/^(公館燒臘|——)/.test(l));
      eqSeq('[美國/'+tagM+'] G1-3 7/31 19:00 公館燒臘的台詞（逐字、順序）',got,exp,'出門 '+r.ev.at);
      check('[美國/'+tagM+'] G1-3 演完記 US_PHOTO_LIST',r.ev.list,J(r.ev.list)); }
    else check('[美國/'+tagM+'] G1-3 7/31 有餞行可以出門（OUT.get aa660_us_farewell）',false,'沒有排');
    const g14=L.filter(m=>m.tag==='aa660_us_eve_fam');
    eqSeq('[美國/'+tagM+'] G1-4 8/1 22:00 家人群組',seq(g14,/./),X.g14,g14[0]?g14[0].date+' '+g14[0].time:'');
    const g15=L.filter(m=>/^aa660_us_photo1/.test(m.tag));
    eqSeq('[美國/'+tagM+'] G1-5 美國第一週週末 臺灣 21:00（當地 09:00）桌遊團：松鼠照片＋Alison 兩則',seq(g15,/./),X.g15,g15[0]?g15[0].date+' '+g15[0].time+'（遊戲鐘＝當地）':'');
    check('[美國/'+tagM+'] G1-5 在 8/5 當地 09:00',!!g15[0]&&g15[0].date==='8/5'&&g15[0].time==='09:00',g15[0]?J([g15[0].date,g15[0].time]):'沒有');
    const g21=L.filter(m=>/^aa660_us_back_(fam|me)$/.test(m.tag));
    check('[美國/'+tagM+'] G2-1 12/23 家人群組沒出現（S.G21_ON＝'+AA660.G21_ON+'，等 AA 確認）',!g21.length,J(seq(g21,/./)));
    if(mode==='none') info('G2-1：AA_660 16:28 已定稿（媽媽接到以後約 10:30 在群組報：'+J(X.g21latest)+'），程式還是舊稿、而且關著（G21_ON=false）——稿已更新、程式還沒接');
    const g22=L.filter(m=>m.tag==='aa660_us_back_grp'||m.tag==='aa660_us_back_photo');
    eqSeq('[美國/'+tagM+'] G2-2 12/23 21:00 桌遊團（有清單）前三則',seq(g22,/^aa660_us_back_grp$/).slice(0,3),X.g22list,g22[0]?g22[0].date+' '+g22[0].time:'');
    if(g22.length){ const askM=g22.find(m=>m.ask); if(askM) both('[美國/'+tagM+'] G2-2 兩個回法',askM.ask,X.g22opt.v0909,X.g22opt.latest);
      if(mode!=='none'){ const k=mode==='a'?0:1, rep=L.filter(m=>m.tag==='aa660_us_back_photo_ans');
        info('[美國/'+tagM+'] G2-2 玩家回的那則：'+J(rep.filter(m=>m.from==='player').map(m=>m.text)));
        both('[美國/'+tagM+'] G2-2 回了以後',rep.filter(m=>m.from!=='player').map(m=>m.who+'：'+m.text),X.g22say.v0909[k],X.g22say.latest[k]); } }
    const kev=L.filter(m=>m.tag==='heard_h509_kevin');
    check('[美國/'+tagM+'] G2-3 12/24 Kevin 那則第一句＝「'+X.g23first+'」',!!kev[0]&&kev[0].text===X.g23first,kev.length?J(kev.map(m=>m.date+' '+m.time+' '+m.text)):'沒有收到 heard_h509_kevin');
    if(r.sums){ const s=k=>r.sums[k];
      check('[美國/'+tagM+'] G1-2 7/29 摘要日旁白',s('7/29')===X.g12,J(s('7/29')));
      check('[美國/'+tagM+'] G3-1 12/25 摘要日旁白',s('12/25')===X.g31,J(s('12/25')));
      both('[美國/'+tagM+'] G3-2 1/13 摘要日旁白',s('1/13'),X.g32.v0909,X.g32.latest); }
    else check('[美國/'+tagM+'] HOLFF.sums 拿得到',false);
    const dup=L.filter((m,i)=>L.findIndex(q=>q.tag===m.tag&&q.text===m.text)!==i);
    check('[美國/'+tagM+'] 一路上沒有重複的訊息',!dup.length,J(dup.map(m=>m.tag+' '+m.text)));
  }
  /* 沒有清單（Alison 從沒認識）：照 090981ebe＝明軒揪、沒有清單；最新稿＝芯慈拿清單、一樣記 US_PHOTO_LIST */
  { fresh('2028-07-26',8,'dorm',Object.assign({},US0)); atHome(H.G); for(const id of ['classmate_mingxuan','classmate_xinci','zhe']) H.FRIEND(id); PHONE.join(H.G,'noodle_team','桌遊團'); const C=collector(); let ev=null;
    await walk(C,D('2028-07-30'),20,D('2028-07-31'),20,async(d,h)=>{ if(d===D('2028-07-31')&&h>=19&&!ev){ const q=OUT.get(H.G,'aa660_us_farewell'); if(q){ H.said=[]; H.picks=[0]; await OUT.go(GM,q,{fromHome:true}); ev=H.lines(); } } });
    show('美國路線（沒認識 Alison）7/30～7/31',C.out); info('沒認識 Alison 的餞行台詞：'+J(ev));
    const grp=seq(C.out,/^aa660_us_farewell_grp$/);
    both('[美國/沒認識 Alison] G1-3 群組',grp,['明軒：禮拜一幫祐廷餞行','明軒：七點 燒臘店','阿哲：我在高雄 幫我多吃一盤'],['明軒：禮拜一幫祐廷餞行','明軒：七點 燒臘店','阿哲：我在高雄 幫我多吃一盤']);
    const lst=!!H.G.flags.US_PHOTO_LIST;
    if(!lst) info('[美國/沒認識 Alison] 沒有 US_PHOTO_LIST、燒臘店沒有拿清單那幾句：和 090981ebe 一致；AA_660 16:28 最新稿改成芯慈拿清單、一樣記 US_PHOTO_LIST——稿已更新、程式還沒接');
    else check('[美國/沒認識 Alison] 照最新稿：芯慈拿清單、記 US_PHOTO_LIST',ev&&ev.some(l=>/芯慈把一張折成四折的紙/.test(l)),J(ev)); }

  /* ================= 美國：舊存檔 ================= */
  for(const [k,h,exp] of [['2028-07-28',10,true],['2028-07-29',10,false]]){ fresh(k,h,'dorm',Object.assign({},US0)); atHome(H.G); PRE(); const C=collector(); at(D(k),h); phone(); C.take();
    const got=C.out.filter(m=>/^aa660_us_flight/.test(m.tag));
    check('[美國/舊存檔] '+k.slice(5)+' '+hm(h)+' 才讀進來：G1-1（7/27）'+(exp?'照補（隔天以內）':'不補（過了隔天）'),exp?got.length>0:got.length===0,J(seq(got,/./))); }

  /* ================= 臺灣路線：一則都不能有 ================= */
  { fresh('2028-07-26',8,'dorm',Object.assign({},TW0)); atHome(H.G); PRE(); const C=collector();
    await walk(C,D('2028-07-26'),8,D('2028-08-07'),23.75); await walk(C,D('2028-12-23'),5,D('2028-12-26'),0);
    const bad=C.out.filter(m=>/^aa660_/.test(m.tag)), kv=C.out.filter(m=>m.tag==='heard_h509_kevin');
    check('[臺灣] 7/26～8/7、12/23～12/26 走一遍：aa660 的訊息一則都沒有',!bad.length,J(bad.map(m=>m.date+' '+m.tag+' '+m.text)));
    check('[臺灣] Kevin 那則（如果有）第一句不是美國路線那一版',!kv.some(m=>m.text===X.g23first),J(kv.map(m=>m.text)));
    const s=HOLFF.sums(H.G).filter(q=>q.s&&q.s.aa660); check('[臺灣] 摘要日沒有 AA_660 那三句',!s.length,J(s.map(q=>dk(q.day))));
    check('[臺灣] 沒有 7/31 餞行',!OUT.get(H.G,'aa660_us_farewell')); }

  /* ================= 日本 ================= */
  { /* G4 3/23 阿哲那則：日本路線＝「明天 幫以安跟祐廷餞行」；臺灣路線＝原本的 */
    const g4=async fl=>{ fresh('2028-03-22',8,'dorm',Object.assign({},fl,{X1_JP:D('2028-02-20')})); atHome(H.G); PRE(); H.FAMILIAR('heroine_01'); const C=collector(); await walk(C,D('2028-03-22'),8,D('2028-03-24'),12); return C.out.filter(m=>/^y3_an_farewell/.test(m.tag)); };
    const j=await g4(JP0), t=await g4(TW0); show('日本路線 3/22～3/24 阿哲那則',j); show('臺灣路線 3/22～3/24 阿哲那則',t);
    check('[日本] G4 3/23 阿哲那則第一句＝「'+X.g4+'」',!!j[0]&&j[0].text===X.g4&&j[0].date==='3/23',J(j.map(m=>m.date+' '+m.time+' '+m.who+'：'+m.text)));
    check('[日本] G4 第二句「七點 燒臘店」照舊',!!j[1]&&j[1].text==='七點 燒臘店',J(j.map(m=>m.text)));
    check('[臺灣] 3/23 阿哲那則不是日本路線的版本',!t.some(m=>m.text===X.g4),J(t.map(m=>m.text))); }
  for(const [datingAn,tagD] of [[true,'和以安交往中'],[false,'沒和以安交往']]){
    fresh('2028-08-05',8,'jp_hub',Object.assign({},JP0,{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together',Y4_PATH:'bar'})); H.FAMILIAR('heroine_01'); H.date('heroine_01'); if(!datingAn) ROM.end(H.G,'heroine_01','test');
    PRE(); at(D('2028-08-05'),8); H.said=[]; await JP.returnHome(GM); const F=H.G.flags; const C=collector(); const land=F.JP_RETURN_H;
    info('[日本/'+tagD+'] JP.returnHome 以後：JP_RETURNED='+(F.JP_RETURNED!=null?dk(F.JP_RETURNED):F.JP_RETURNED)+'、JP_RETURN_H='+land+'、遊戲鐘 '+dk(H.G.day)+' '+hm(H.G.hour));
    check('[日本/'+tagD+'] 回國記 JP_RETURN_H（落地時間）',typeof land==='number',J(land));
    const said6=[]; let y=H.G.day, hh=H.G.hour; atHome(H.G);
    await walk(C,y,hh,D('2028-08-31'),0,async(d,h)=>{ if(Math.abs(h-18.5)<1e-6){ for(let i=0;i<3;i++){ const st=JP.dueStop(H.G,'home'); if(!st) break; H.said=[]; await JP.playStop(GM,st,'home'); for(const s of H.said) said6.push({date:dk(d),t:s.t}); } }
      if(datingAn===true) answer(C,'aa660_jp_back_an',0); });
    show('日本路線（'+tagD+'）8/5～8/31',C.out);
    const g51=C.out.filter(m=>/^aa660_jp_back_(me|fam)$/.test(m.tag));
    eqSeq('[日本/'+tagD+'] G5-1 回國當天家人群組',seq(g51,/./),X.g51,g51[0]?g51[0].date+' '+g51[0].time:'');
    check('[日本/'+tagD+'] G5-1 照落地時間（JP_RETURN_H）',!!g51[0]&&g51[0].date==='8/5'&&Math.abs(g51[0].h-land)<0.26,g51[0]?J([g51[0].date,g51[0].time,land]):'沒有');
    const g52=C.out.filter(m=>m.tag==='aa660_jp_back_grp'||m.tag==='aa660_jp_back_an');
    if(datingAn){ eqSeq('[日本/'+tagD+'] G5-2 8/5 21:00 桌遊團：Alison＋以安兩則',seq(g52,/^aa660_jp_back_grp$/),X.g52an,g52[0]?g52[0].date+' '+g52[0].time:'');
      const askM=g52.find(m=>m.ask); check('[日本/'+tagD+'] G5-2 以安那句兩個回法',!!askM&&J(askM.ask)===J(X.g52opt),askM?J(askM.ask):'沒有問句');
      const rep=C.out.filter(m=>m.tag==='aa660_jp_back_an_ans'); info('[日本/'+tagD+'] G5-2 玩家回的那則：'+J(rep.filter(m=>m.from==='player').map(m=>m.text)));
      eqSeq('[日本/'+tagD+'] G5-2 選第一個以後以安回',rep.filter(m=>m.from!=='player').map(m=>m.who+'：'+m.text),X.g52say[0]); }
    else eqSeq('[日本/'+tagD+'] G5-2 8/5 21:00 桌遊團只有 Alison「回來了？？」',seq(g52,/./),X.g52only,g52[0]?g52[0].date+' '+g52[0].time:'');
    check('[日本/'+tagD+'] G5-2 在 8/5 21:00',!!g52[0]&&g52[0].date==='8/5'&&g52[0].time==='21:00',g52[0]?J([g52[0].date,g52[0].time]):'沒有');
    info('[日本/'+tagD+'] 18:30 停點的旁白：'+J(said6));
    for(const k of ['8/12','8/22','8/29']) check('[日本/'+tagD+'] G6 '+k+' 摘要日旁白',said6.some(s=>s.date===k&&s.t===X.g6[k]),J(said6.filter(s=>s.date===k).map(s=>s.t)));
    { const i12=said6.findIndex(s=>s.date==='8/12'&&s.t===X.g6['8/12']), o12=said6.findIndex(s=>s.date==='8/12'&&s.t!==X.g6['8/12']);
      info('[日本/'+tagD+'] 8/12 停點的順序：'+J(said6.filter(s=>s.date==='8/12').map(s=>s.t))+'（AA660：G6 那句排在 jp3d.js 原本的 s_0812 後面）');
      if(o12>=0) check('[日本/'+tagD+'] 8/12 G6 那句在原本那句後面',i12>o12,J([o12,i12])); }
    const us=C.out.filter(m=>/^aa660_us_/.test(m.tag)); check('[日本/'+tagD+'] 美國路線的訊息一則都沒有',!us.length,J(us.map(m=>m.tag)));
  }
  console.log(FAILS?('FAILED '+FAILS):'ALL PASS'); process.exit(FAILS?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
