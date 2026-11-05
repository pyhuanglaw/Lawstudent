// 阿哲「宵夜？大口漢堡」（AA_621 第 3 節；AA_705 補「回 LAWWW-C 10:06」第 2 點，企劃線 2c62cdf1e；src/zhedakou3d.js、字在 src/data/shop_npc.js 的 SHOP_NPC.zheDakou）——不需要瀏覽器。
//   0  載得到、index.html 接在 shopnpc3d.js 後面、出遊事件、STORY.PHONE_RULES、OUT.STAGE 接上
//   1  照稿：git show 2c62cdf1e 讀 AA_705「補：回 LAWWW-C 10:06」第 2 點——私訊、兩個選項、旁白、阿哲那一句、「OK 下次」一字不差（私訊不打句號）；沒有明軒那兩句；AA_621 第 3 節是同一則
//   2  時間：每學期（大一上～大四下）第 11 週週五 22:30 一則、同一學期只一次；22:30 以前、23:00 以後、第 10／12 週週五、第 11 週週四＝不傳
//   3  不傳：考試週、經濟系那一年、不認識阿哲、祐廷不在臺北（交換出國、美國、日本、出國途中）、阿哲那一天不在、23:00 已經有別的約（邀約、出遊）
//   4  回「好。」＝排 23:00 大口漢堡的出遊（可以晚 30 分鐘，過了＝錯過）；出發＝地點字幕、旁白、阿哲那一句；回「今天不了。」＝阿哲「OK 下次」、不排；回之前才約了別的＝不排、系統字
//   5  演的地方（OUT.STAGE）：大口漢堡一樓那張雙人桌（配置裡真的座位），阿哲坐北邊、祐廷坐對面，演完回到原本的地方；在家、騎車、區域沒載入＝照舊 2D
//   6  舊存檔：沒有 ZHE_DK／ZHE_DK_GO＝照常；ZHE_DK 不是物件也不壞；手機裡已經有那一則（tag）就不再傳
// 修改前（開發分支 9b0071e12）：沒有 src/zhedakou3d.js、SHOP_NPC.zheDakou——FAIL。用法：node tests/zhe_dakou_msg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify, ZHE='zhe', TH='p:zhe';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
if(!ORDER.includes('src/zhedakou3d.js')&&fs.existsSync(path.join(H.ROOT,'src/zhedakou3d.js'))){ try{ vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/zhedakou3d.js'),'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:'src/zhedakou3d.js'}); }catch(e){} }
GM.toast=()=>{}; GM.caps=[]; GM.caption=(a,b)=>{ GM.caps.push(b); }; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},seat:o&&o.seat||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; };
GM.removeNPC=id=>{ delete GM.npc[id]; };
let pSeat=null; GM.sitAt=(n,s)=>{ if(n===E.player){ pSeat=s; n.seat=s; } }; GM.standUp=n=>{ if(n) n.seat=null; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const X=()=>typeof ZHEDK!=='undefined'?ZHEDK:null, L=()=>(typeof SHOP_NPC!=='undefined'&&SHOP_NPC.zheDakou)||{};
const keyOf=d=>CALENDAR.dateOf(d).key, wd=d=>CALENDAR.dateOf(d).wd%7;
const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
const dayOf=(t,w,dw)=>{ const r=CALENDAR.termDays(t); for(let d=r.from;d<=r.to;d++){ const T=CALENDAR.termOf(d); if(T&&T.id===t&&T.week===w&&wd(d)===dw) return d; } return null; };
const fresh=(d,h,flags,zone)=>{ const G=H.fresh(keyOf(d),h,zone||'dorm',Object.assign({MET_ZHE:true,afternoonDone:true},flags||{})); G.hour=h; G.weekday=wd(d); return G; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const tick=()=>{ for(let i=0;i<3;i++){ STORY.phoneRules(GM); PHONE.tick(H.G); } };
const zmsgs=()=>(H.G.msgs||[]).filter(m=>m.th===TH);
const mine=()=>zmsgs().filter(m=>m.tag&&/^zhe_dk_/.test(m.tag));
const answer=(tag,i)=>{ const m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask); if(!m) return false; return PHONE.answer(H.G,m.ask.id,i)!=null; };
const withStub=(obj,k,v,f)=>{ const had=Object.prototype.hasOwnProperty.call(obj,k), o=obj[k]; obj[k]=v; try{ return f(); } finally { if(had) obj[k]=o; else delete obj[k]; } };

(async()=>{
await sec(0,()=>{ const a=f=>html.indexOf(f);
  check('0. src/zhedakou3d.js 載得到（ZHEDK）、SHOP_NPC.zheDakou 有字',!!X()&&!!L().msg);
  check('0. index.html：zhedakou3d.js 在 shop_npc.js、shopnpc3d.js、outings3d.js、phone3d.js、invites3d.js、story3d.js 以後、GAME.boot() 以前',a('src/zhedakou3d.js')>0&&['src/data/shop_npc.js','src/shopnpc3d.js','src/outings3d.js','src/phone3d.js','src/invites3d.js','src/story3d.js'].every(f=>a(f)>0&&a(f)<a('src/zhedakou3d.js'))&&a('src/zhedakou3d.js')<a('GAME.boot()'));
  const ev=STORY_EVENTS.find(e=>e.id==='ev_zhe_dakou_supper');
  check('0. 出遊事件 ev_zhe_dakou_supper（trigger outing、阿哲）、STORY.PHONE_RULES、OUT.STAGE 接上',!!ev&&ev.trigger==='outing'&&J(ev.participants)===J([ZHE])&&!!STORY._zheDkPhone&&!!X()&&OUT.STAGE.includes(X().outingStage)); });
if(!X()){ H.done(); return; }

/* ---------- 1 照稿 ---------- */
await sec(1,()=>{ const DOC=git('2c62cdf1e','AA_705_新店面裡遇得到的人_第一批作息.md'), s=(DOC.split('## 補：回 LAWWW-C 10:06')[1]||'').split('\n## ')[0];
  const p2=(s.split('\n').find(l=>/^2\. \*\*阿哲「宵夜？大口漢堡」\*\*/.test(l))!=null)?s.slice(s.indexOf('2. **阿哲')):'';
  check('1. 讀得到 AA_705 2c62cdf1e「補：回 LAWWW-C 10:06」第 2 點（阿哲「宵夜？大口漢堡」）',!!p2,String(DOC.length));
  const A=L(), miss=[];
  if(!p2.includes('第 11 週週五 22:30（考試週以外；認識阿哲；人在臺北）。大一上～大四下。')) miss.push('時間與條件');
  if(!p2.includes('**每學期一次**')) miss.push('每學期一次');
  if(!p2.includes('私訊**（阿哲，不打句號，`AA_477`）：「'+A.msg+'」')) miss.push('私訊 '+A.msg);
  if(!p2.includes('選項：「'+A.yes+'」→ 23:00 大口漢堡一樓（出遊，可以錯過）：'+A.narr+'阿哲：'+A.zhe+'／「'+A.no+'」→ 阿哲：「'+A.noReply+'」')) miss.push('選項、旁白、阿哲兩句');
  if(!/明軒那兩句不要/.test(p2)) miss.push('明軒那兩句不要');
  if(/[。.]$/.test(A.msg)||/[。.]$/.test(A.noReply)) miss.push('私訊打了句號');
  check('1. 私訊「宵夜？大口漢堡」、選項「好。」「今天不了。」、旁白「（阿哲已經點好了，托盤上兩份雞塊。）」、阿哲「我先點了。你的我用猜的。」、「OK 下次」一字不差（私訊不打句號）',!miss.length,miss.join('｜'));
  const D621=git('52e3d83a8','AA_621_大口漢堡_24小時速食.md'); check('1. AA_621 第 3 節（52e3d83a8）的那一則就是「'+A.msg+'」',/## 3\. 平常[\s\S]*「宵夜？大口漢堡」/.test(D621));
  const ev=STORY_EVENTS.find(e=>e.id==='ev_zhe_dakou_supper'), tx=ev.dialogue.filter(l=>l.text!==undefined).map(l=>[l.speaker,l.text]);
  check('1. 出遊的台詞：旁白、阿哲各一句（一字不差），沒有別人（明軒那兩句不要）',J(tx)===J([[null,A.narr],[ZHE,A.zhe]])&&!ev.dialogue.some(l=>l.speaker==='classmate_mingxuan'),J(tx)); });

/* ---------- 2 時間 ---------- */
await sec(2,()=>{ const bad=[], info=[];
  for(const t of TERMS){ const d=X().dayOf(t); if(d==null){ bad.push(t+' 找不到第 11 週週五'); continue; } const T=CALENDAR.termOf(d); if(T.week!==11||wd(d)!==5) bad.push(t+' 不是第 11 週週五');
    /* 這一學期每一天 22:30～22:59 都跑一次手機規則：只有那一天傳一則 */
    const r=CALENDAR.termDays(t); fresh(r.from,22.5); for(let x=r.from;x<=r.to;x++){ at(x,22.5); tick(); at(x,22.95); tick(); }
    const M=mine(); if(M.length!==1) bad.push(t+' 傳了 '+M.length+' 則'); else { const m=M[0]; if(m.day!==d||Math.abs(m.h-22.5)>1e-6||m.from!==ZHE||m.text!==L().msg||m.tag!=='zhe_dk_'+t) bad.push(t+' '+J({d:m.day,h:m.h,from:m.from,text:m.text,tag:m.tag}));
      const o=m.ask&&m.ask.opts.map(q=>q.t); if(J(o)!==J([L().yes,L().no])) bad.push(t+' 選項 '+J(o)); info.push(t+' '+keyOf(d)); }
    if(!H.G.flags.ZHE_DK||H.G.flags.ZHE_DK[t]!==d) bad.push(t+' 沒記 ZHE_DK'); }
  check('2. 大一上～大四下每學期一則：第 11 週週五 22:30、阿哲私訊「宵夜？大口漢堡」、兩個選項；同一學期每天都跑也只有那一則（'+info.join('、')+'）',!bad.length&&info.length===8,bad.slice(0,4).join('｜'));
  const d=X().dayOf('Y1S2'), no=[];
  const none=(dd,h,w)=>{ fresh(dd,h); tick(); if(mine().length) no.push(w); };
  none(d,22.4,'22:24'); none(d,23.05,'23:03'); none(dayOf('Y1S2',10,5),22.6,'第 10 週週五'); none(dayOf('Y1S2',12,5),22.6,'第 12 週週五'); none(dayOf('Y1S2',11,4),22.6,'第 11 週週四');
  check('2. 22:30 以前、23:00 以後（過了不補）、第 10／12 週週五、第 11 週週四＝不傳',!no.length,no.join('、'));
  fresh(d,22.7); tick(); const m=mine()[0]; check('2. 22:42 才第一次算到（前面在演劇情）＝那時候傳',!!m&&Math.abs(m.h-22.7)<1e-6,J(m&&m.h));
  check('2. 回覆期限 23:30（最晚能出發的時間）',!!m&&m.ask.until===d*24+23.5); });

/* ---------- 3 不傳 ---------- */
await sec(3,()=>{ const d=X().dayOf('Y2S1'), no=[];
  const sent=(flags,pre)=>{ fresh(d,22.6,flags); if(pre) pre(); tick(); return mine().length>0; };
  if(!sent()) no.push('一般情況沒傳');
  withStub(CALENDAR,'termOf',(t0=>x=>{ const T=t0(x); return x===d&&T?Object.assign({},T,{exam:'mid'}):T; })(CALENDAR.termOf),()=>{ if(sent()) no.push('考試週'); });
  { fresh(d,22.6); H.G.stage='econ'; tick(); if(mine().length) no.push('經濟系'); }
  withStub(STORY,'knows',(k0=>(id,G)=>id===ZHE?false:k0(id,G))(STORY.knows),()=>{ if(sent()) no.push('不認識阿哲'); });
  { const w0=STORY.week1Start; STORY.week1Start=()=>true; try{ if(sent({MET_ZHE:false})) no.push('選 1 的局、還沒初遇阿哲（MET_ZHE）'); } finally { STORY.week1Start=w0; } }
  withStub(STORY,'abroad',()=>true,()=>{ if(sent()) no.push('交換出國（STORY.abroad）'); });
  withStub(STORY,'tzOffset',()=>-12,()=>{ if(sent()) no.push('出國途中（時差）'); });
  global.EXCH=global.EXCH||{}; withStub(EXCH,'inUS',()=>true,()=>{ if(sent()) no.push('美國（EXCH.inUS）'); });
  global.JP=global.JP||{}; withStub(JP,'inJapan',()=>true,()=>{ if(sent()) no.push('日本（JP.inJapan）'); });
  withStub(STORY,'presence',(p0=>(id,G)=>id===ZHE?{here:false,kind:'home'}:p0(id,G))(STORY.presence),()=>{ if(sent()) no.push('阿哲那一天不在'); });
  if(sent(null,()=>{ H.G.invites.push({id:'ivx',who:'heroine_01',place:'cafe',zone:'cafe',day:d,h:23,state:'accepted',accepted:true,by:'player'}); })) no.push('23:00 有邀約');
  if(sent(null,()=>{ OUT.plan(H.G,{id:'t_out',ev:'ev_kai_sunday_supper',day:d,h:22.9,late:0.5,place:'x',title:'x'}); })) no.push('23:00 前後有出遊');
  if(!sent(null,()=>{ OUT.plan(H.G,{id:'t_out2',ev:'ev_kai_sunday_supper',day:d,h:21,late:0.5,place:'x',title:'x'}); })) no.push('21:00 的出遊（21:30 就結束）也擋掉了');
  { const ex=[]; X().cond(fresh(d,22.6),ex); if(ex.length) no.push('cond 理由 '+ex.join(',')); }
  check('3. 不傳：考試週、經濟系、不認識阿哲、交換出國、出國途中、美國、日本、阿哲不在、23:00 有邀約／出遊；不重疊的出遊不擋',!no.length,no.join('｜')); });

/* ---------- 4 回覆、出遊 ---------- */
await sec(4,async()=>{ const t='Y3S1', d=X().dayOf(t), id='zhe_dk_'+t, A=L();
  fresh(d,22.5); tick(); const ok=answer(id,0); tick();
  const th=zmsgs().map(m=>[m.from||null,m.text]), q=OUT.get(H.G,id);
  check('4. 回「好。」：手機上祐廷「好。」、記 ZHE_DK_GO、排 23:00 大口漢堡的出遊（可以晚 30 分鐘）',ok&&J(th.slice(-2))===J([[ZHE,A.msg],['player',A.yes]])&&H.G.flags.ZHE_DK_GO===d&&!!q&&q.day===d&&q.h===23&&q.late===0.5&&q.place==='大口漢堡'&&q.ev==='ev_zhe_dakou_supper'&&q.state==='planned',J({th,q}));
  tick(); check('4. 同一則不排兩次',OUT.rec(H.G).filter(x=>x.id===id).length===1);
  H.said=[]; GM.caps=[]; at(d,22.85); const r=await OUT.prompt(GM,q);
  const said=H.said.map(s=>[s.who,s.t]);
  check('4. 出發：地點字幕「新生南路・大口漢堡」→ 旁白「'+A.narr+'」→ 阿哲「'+A.zhe+'」；演完出遊 done',r==='go'&&GM.caps.includes('新生南路・大口漢堡')&&J(said.slice(0,2))===J([[null,A.narr],['阿哲',A.zhe]])&&q.state==='done',J({r,said,caps:GM.caps}));
  /* 不去、過了時間 */
  { const t2='Y3S2', d2=X().dayOf(t2), id2='zhe_dk_'+t2; fresh(d2,22.5); tick(); answer(id2,0); tick(); at(d2,23.6); tick(); OUT.expire(H.G); const q2=OUT.get(H.G,id2);
    check('4. 答應了沒出發、過了 23:30＝錯過（不扣分）',!!q2&&q2.state==='missed'); }
  /* 不了 */
  { const t3='Y4S1', d3=X().dayOf(t3), id3='zhe_dk_'+t3; fresh(d3,22.5); tick(); const ok3=answer(id3,1); tick(); const th3=zmsgs().map(m=>[m.from||null,m.text]);
    check('4. 回「今天不了。」：祐廷「今天不了。」、阿哲「OK 下次」，不排出遊',ok3&&J(th3.slice(-3))===J([[ZHE,A.msg],['player',A.no],[ZHE,A.noReply]])&&!OUT.get(H.G,id3)&&H.G.flags.ZHE_DK_GO==null,J(th3)); }
  /* 回之前才約了別的 */
  { const t4='Y4S2', d4=X().dayOf(t4), id4='zhe_dk_'+t4; fresh(d4,22.5); tick(); H.G.invites.push({id:'ivy',who:'heroine_02',place:'cafe',zone:'cafe',day:d4,h:23,state:'accepted',accepted:true,by:'player'}); answer(id4,0); tick();
    check('4. 回「好。」以前 23:00 已經約了別人：不排（不會兩個約），系統字「那個時間你已經約了別人。」',!OUT.get(H.G,id4)&&(H.G.msgs||[]).some(m=>m.text==='那個時間你已經約了別人。'&&m.day===d4)); }
  /* 過了期限 */
  { const t5='Y2S2', d5=X().dayOf(t5), id5='zhe_dk_'+t5; fresh(d5,22.5); tick(); at(d5,23.55); const ok5=answer(id5,0); tick(); check('4. 23:30 以後才回：回不了、不排',!ok5&&!OUT.get(H.G,id5)); } });

/* ---------- 5 演的地方 ---------- */
await sec(5,async()=>{ const S=X().STAGE, seats=(DAKOU_LAYOUT.shop.floor1.seats||[]);
  const hit=(x,z)=>seats.some(s=>Math.abs(s.x-x)<1e-6&&Math.abs(s.z-z)<1e-6);
  check('5. 阿哲、祐廷的位子是大口漢堡一樓真的座位（同一張雙人桌、面對面）',hit(S.zhe[0],S.zhe[1])&&hit(S.me[0],S.me[1])&&S.zhe[0]===S.me[0]&&Math.abs(S.zhe[1]-S.me[1])<1.2&&Math.abs(Math.abs(S.zhe[2]-S.me[2])-Math.PI)<1e-6);
  const z0=global.Z3; global.Z3={ZONES:{xs_dakou:{},dorm:{},campus:{}}};
  try{ const d=X().dayOf('Y1S1'); fresh(d,23,null,'dorm'); E.player.obj.position.x=1; E.player.obj.position.z=2; pSeat=null;
    const ev=STORY_EVENTS.find(e=>e.id==='ev_zhe_dakou_supper'); const stg=await X().outingStage(GM,{id:'zhe_dk_Y1S1'},ev); const n=GM.npc[ZHE];
    check('5. 換到大口漢堡一樓（xs_dakou）演：阿哲坐在那張雙人桌、祐廷坐對面',!!stg&&H.entered.includes('xs_dakou')&&H.G.zone==='xs_dakou'&&!!n&&!!n.seat&&n.seat.x===S.zhe[0]&&n.seat.z===S.zhe[1]&&(n.seat.lv|0)===0&&!!pSeat&&pSeat.x===S.me[0]&&pSeat.z===S.me[1],J({ent:H.entered,n:n&&n.seat,pSeat}));
    await stg.restore(); check('5. 演完回到原本的地方（宿舍）',H.G.zone==='dorm'&&!X().staged);
    fresh(d,23,null,'dorm'); E.player.riding=true; check('5. 騎著車：照舊 2D',!(await X().outingStage(GM,{},ev))); E.player.riding=false;
    fresh(d,23,null,'dorm'); H.G.home={at:true}; check('5. 在家：照舊 2D',!(await X().outingStage(GM,{},ev))); H.G.home=null;
    check('5. 別的出遊不換',!(await X().outingStage(GM,{},{id:'ev_kai_sunday_supper'})));
    global.Z3={ZONES:{}}; fresh(d,23,null,'dorm'); check('5. 區域沒載入：照舊 2D',!(await X().outingStage(GM,{},ev)));
  } finally { global.Z3=z0; } });

/* ---------- 6 舊存檔 ---------- */
await sec(6,()=>{ const d=X().dayOf('Y2S1'), bad=[];
  { fresh(d,22.6); delete H.G.flags.ZHE_DK; delete H.G.flags.ZHE_DK_GO; tick(); if(mine().length!==1) bad.push('沒有 ZHE_DK 的舊存檔沒傳'); }
  { fresh(d,22.6,{ZHE_DK:true}); let err=null; try{ tick(); }catch(e){ err=e; } if(err||mine().length!==1||typeof H.G.flags.ZHE_DK!=='object') bad.push('ZHE_DK 不是物件 '+err); }
  { fresh(d,22.6); PHONE.postAt(H.G,{th:TH,from:ZHE,text:L().msg,tag:'zhe_dk_Y2S1'},d,22.5); tick(); if(mine().length!==1) bad.push('手機裡已經有那一則又傳一次'); }
  check('6. 舊存檔：沒有 ZHE_DK／ZHE_DK_GO＝照常傳；ZHE_DK 不是物件也不壞；手機裡已經有那一則就不再傳',!bad.length,bad.join('｜')); });

H.done();
})();
