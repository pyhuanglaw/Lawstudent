// 旁邊有她的人時，私密的東西不出、等她一個人（COMPANY-PRIV-1028；AA 2026-10-28 06:14 定案，AA_503 第 13 節第 3 點）——不需要瀏覽器。
// src/privtalk3d.js（清單 PRIVTALK.LIST、各入口的接線）、src/story3d.js（STORY.privNow／crowdNow、offerInvite）、src/multirel3d.js（PRE_TALK 問 PRIVTALK.ok）。
//   0  載得到、index.html 順序；STORY.privNow＝COMPANY 的反面；清單每一筆都接上、涵蓋 AA 的每一類；呼叫的地方（offerInvite、multirel3d.js）
//   1  約會（「約她去…」）、各檔標 priv 的一次性選項：旁邊有人不出，交換聯絡方式、一般的選項照常；她一個人照常
//   2  坦白有別人（ROM.tellBy）：以安「我有件事要跟妳講。」、學姊「（下次見面，自己跟她講…的事）」——旁邊有人不出
//   3  她知情以後：MREL.meetAction（說話時的發現：不演、pend 留著；正式約會不擋；學姊正常見面照記）、吧檯的芷若、1A-02 攤牌以後那一句、沛珊「對一次」、子晴爸爸那一句
//   4  還沒公開的事：沒回的那一句（zq_dad、ps_plan：不說、不記說過）、事件（Z4、Z7、P3、Q8、Q8b：旁邊有人不成立、照常說話）、傅鐘那一個選項、
//      閒聊階梯（整層：Y-L7、Y7-L8；換進私密那一版才擋：Z3-L6、P3-L6、Z2-L6；原本那一版照播）、Y4-L6 的第二個選項、真的圈子（語彤和筱涵）、until／from
//   5  不會永久卡住：有期限的那幾筆，期限內照圈子的資料都有她一個人的時候（事件、閒聊階梯那幾層）
//   6  一般閒聊照常：旁邊有人時一般的階梯照播、照常前進；被擋下的那一層隔天她一個人時播
// 用法：node tests/company_priv_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/sideq3d.js',['SIDEQ']],['src/data/needed_msgs.js',['NEEDED_MSGS']],['src/data/y2b_events.js',['Y2B_EVENTS']],['src/data/r2y3a_events.js',['R2Y3A_EVENTS']],
  ['src/data/multirel_lines.js',['MULTIREL_LINES']],['src/multirel3d.js',['MREL']],['src/data/pool_story.js',['POOL_STORY']],['src/pool3d.js',['POOL']],
  ['src/data/heroine_circle.js',['HCIRCLE_DATA']],['src/hcircle3d.js',['HCIRCLE']],['src/privtalk3d.js',['PRIVTALK']]]){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const HAS=()=>typeof PRIVTALK!=='undefined'&&!!PRIVTALK.LIST;
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ').slice(0,300)); } };
/* 測試用的「旁邊有人」：COMPANY 多一個看 FORCE 的（真的圈子另外測）*/
const FORCE={}; if(typeof STORY!=='undefined'&&Array.isArray(STORY.COMPANY)) STORY.COMPANY.push((G,id)=>!!FORCE[id]);
const crowd=(id,on)=>{ FORCE[id]=!!on; };
const DK=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd===0?7:wd);
const fresh=(d,h,zone,flags)=>{ if(typeof d==='string') d=DK(d); const G=H.fresh(CALENDAR.dateOf(d).key,h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.weekday=wdOf(d); G.hour=h;
  if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; G.invites=[]; for(const k in FORCE) delete FORCE[k]; STORY._bindGM(GM); if(typeof HCIRCLE!=='undefined') HCIRCLE.bind(GM); return G; };
const evOf=id=>STORY_EVENTS.find(e=>e.id===id);
const done=(...ids)=>{ for(const id of ids) H.G.events.done[id]=1; };
const said=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
const has=t=>H.said.some(s=>s.t===t||s.t==='「'+t+'」');
const npc=id=>{ const n={id,charId:id,name:SOCIAL.npcName(id),obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,pose:'idle',idlePose:'idle'}; GM.npc[id]=n; return n; };
const ladIdx=(G,id,sid)=>{ const D=STORY.ladData(G,id); const i=D?D.L.steps.findIndex(s=>s.id===sid):-1; const so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{}; if(D) so.ladder[D.key]=i; return D?D.key:null; };
const ladAt=(G,id)=>{ const D=STORY.ladData(G,id); return D?((G.social.ladder||{})[D.key]|0):null; };
const nextId=(G,id)=>{ const st=STORY.ladNext(G,id); return st?st.id:null; };

(async()=>{
/* ---------- 0 載入、清單、呼叫的地方 ---------- */
await sec('0',async()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=f=>html.indexOf('<script src="'+f);
  const iP=sc('src/privtalk3d.js'), iC=sc('src/hcircle3d.js'), iM=sc('src/multirel3d.js'), iS=sc('src/story3d.js'), iY=sc('src/data/y2b_events.js'), iR=sc('src/data/r2y3a_events.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：privtalk3d.js 在 hcircle3d.js、multirel3d.js、story3d.js、y2b／r2y3a 的事件以後，bbpack_events.js 前面',!errs.length&&HAS()&&iP>iC&&iP>iM&&iP>iS&&iP>iY&&iP>iR&&iB>iP&&iC>0,J(errs));
  const fn=typeof STORY.privNow==='function'&&typeof STORY.crowdNow==='function';
  let a=null, b=null; if(fn){ fresh('2025-10-07',12.5,'campus'); a=STORY.privNow(H.G,'heroine_03'); crowd('heroine_03',true); b=STORY.privNow(H.G,'heroine_03'); }
  check('0. STORY.privNow(G,id,n,GM)：COMPANY 任一個說旁邊有人＝false（crowdNow 是反面）',fn&&a===true&&b===false&&STORY.crowdNow(H.G,'heroine_03')===true,J({fn,a,b}));
  if(!HAS()) return;
  const L=PRIVTALK.LIST, keys=L.map(e=>e.key), bad=L.filter(e=>!e._wired||!e.cat||!e.at||(e.gate!=='none'&&!e.defer));
  check('0. 清單（'+L.length+' 筆）每一筆都接上、key 不重複、寫了類別／在哪／旁邊有人時怎麼辦（沒有入口的寫在哪裡）',!bad.length&&new Set(keys).size===keys.length&&L.length>=20,J(bad.map(e=>e.key)));
  const cats=new Set(L.map(e=>e.cat)), topics=new Set(L.map(e=>e.topic).filter(Boolean));
  const needC=['告白','心意邀約','約會','交往中才有的互動','坦白有別人','分開談話（AA_346）','她知情以後','還沒公開'], needT=['子晴爸爸','沛珊重考','芷若交換申請','語彤媽媽回診','學姊口試結果'];
  check('0. 清單涵蓋 AA 的每一類（告白、心意邀約、約會、交往中、坦白有別人、AA_346、她知情以後、還沒公開的五件）',needC.every(c=>cats.has(c))&&needT.every(t=>topics.has(t)),J({cats:[...cats],topics:[...topics]}));
  const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'), mr=fs.readFileSync(path.join(H.ROOT,'src/multirel3d.js'),'utf8');
  check('0. 呼叫的地方：story3d.js offerInvite 問 privNow、priv 的選項旁邊有人不出；multirel3d.js PRE_TALK 問 PRIVTALK.ok（zq_dad_pre、ps_bterm）；告白（坦白）兩個選項標 priv',
    /const crowd=!S\.privNow\(G,id,n,GM\)/.test(st)&&/!\(crowd&&o\.priv\)/.test(st)&&/privOk\(G,ZQ,GM,'zq_dad_pre'\)/.test(mr)&&/privOk\(G,PS,GM,'ps_bterm'\)/.test(mr)&&/PRIVTALK\.ok\(G,x,k,GM\)/.test(mr)&&(mr.match(/priv:true,run:/g)||[]).length===2);
  check('0. 清單外、判斷不了的列給 AA（PRIVTALK.ASK_AA，不擋）',Array.isArray(PRIVTALK.ASK_AA)&&PRIVTALK.ASK_AA.length>=8&&PRIVTALK.ASK_AA.every(x=>x.what&&x.q)); });

/* ---------- 1 約會、priv 的一次性選項 ---------- */
await sec('1',async()=>{ fresh('2025-10-09',15,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); const n=npc('heroine_03');
  const priv={t:'（私密的選項）',priv:true,run:async()=>{}}, pub={t:'（一般的選項）',run:async()=>{}}; const f0=(G,id)=>id==='heroine_03'?[priv,pub]:[]; STORY.TALK_OPTS.push(f0);
  const opts=async()=>{ H.opts=[]; H.picks=['就這樣']; await STORY.offerInvite(GM,'heroine_03',n); return (H.opts[0]||[]); };
  try{ crowd('heroine_03',true); const o1=await opts(); crowd('heroine_03',false); const o2=await opts();
    check('1. 旁邊有人：不出「約她去…」、priv 的選項；交換聯絡方式、一般的選項照常',!o1.some(t=>/^約她去/.test(t))&&!o1.includes('（私密的選項）')&&o1.includes('（一般的選項）')&&o1.includes('交換聯絡方式'),J(o1));
    check('1. 她一個人：「約她去…」、priv 的選項都出',o2.some(t=>/^約她去/.test(t))&&o2.includes('（私密的選項）')&&o2.includes('交換聯絡方式'),J(o2)); }
  finally{ STORY.TALK_OPTS.splice(STORY.TALK_OPTS.indexOf(f0),1); } });

/* ---------- 2 坦白有別人 ---------- */
await sec('2',async()=>{ if(typeof MREL==='undefined'){ check('2. MREL',false); return; }
  const opts=async(id)=>{ H.opts=[]; H.picks=['就這樣']; await STORY.offerInvite(GM,id,npc(id)); return (H.opts[0]||[]); };
  fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); }
  const y=MREL.confessAny(H.G,'heroine_01'); crowd('heroine_01',true); const o1=await opts('heroine_01'); crowd('heroine_01',false); const o2=await opts('heroine_01');
  check('2. 以安「我有件事要跟妳講。」（坦白和學姊交往，ROM.tellBy）：旁邊有人不出；她一個人才出',y==='heroine_05'&&!o1.includes('「我有件事要跟妳講。」')&&o2.includes('「我有件事要跟妳講。」'),J({y,o1,o2}));
  const y2=MREL.confLaterFor(H.G,'heroine_05'), t=y2&&MREL.confLaterOpt(H.G,'heroine_05',y2); crowd('heroine_05',true); const o3=await opts('heroine_05'); crowd('heroine_05',false); const o4=await opts('heroine_05');
  check('2. 學姊「（下次見面，自己跟她講以安的事）」（交往中才有）：旁邊有人不出；她一個人才出',!!t&&!o3.includes(t)&&o4.includes(t),J({t,o3,o4})); });

/* ---------- 3 她知情以後 ---------- */
await sec('3',async()=>{ if(typeof MREL==='undefined'){ check('3. MREL',false); return; }
  /* (a) 說話時的發現（以安：和她說話就演）*/
  { fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); }
    const R=MREL.rec(H.G); R.pend.heroine_01={y:'heroine_05',day:H.G.day-1,h:20};
    crowd('heroine_01',true); const a1=MREL.meetAction(H.G,'heroine_01','talk'), keep=!!MREL.rec(H.G).pend.heroine_01, a2=MREL.meetAction(H.G,'heroine_01','date');
    crowd('heroine_01',false); const a3=MREL.meetAction(H.G,'heroine_01','talk');
    check('3. 以安的發現（和她說話就演）：旁邊有人＝不演、pend 留著；正式約會（2D）不擋；她一個人＝演',a1===null&&keep&&!!a2&&a2.disc===true&&!!a3&&a3.disc===true,J({a1,keep,a2:!!a2,a3:!!a3}));
    const sm0=J((MREL.rec(H.G).sm||{}).heroine_05||null); crowd('heroine_05',true); const b1=MREL.meetAction(H.G,'heroine_05','talk'), sm1=(MREL.rec(H.G).sm||{}).heroine_05;
    check('3. 學姊：旁邊有人＝知情的流程不演，但「正常見面」照記（MREL.sisMet，AA_474 1-2）',b1===null&&Array.isArray(sm1)&&sm1.includes(H.G.day),J({sm0,sm1})); }
  /* (b) 吧檯的芷若（冷靜期：她上班時去 Café）*/
  { fresh('2026-10-14',20,'cafe'); for(const id of ['heroine_02','heroine_04']){ H.CLOSE(id); SOCIAL.meet(id,'cafe'); H.date(id); }
    const st=MREL.rec(H.G).st.heroine_02={y:'heroine_04',n:1,day:H.G.day-1,phase:'cool'};
    crowd('heroine_02',true); const c1=MREL.FLOW.heroine_02.meet(H.G,st,'cafe'); crowd('heroine_02',false); const c2=MREL.FLOW.heroine_02.meet(H.G,st,'cafe');
    check('3. 吧檯的芷若（冷靜期）：旁邊有人（同事）＝不演、照常點餐；她一個人＝演',c1===null&&!!c2&&c2.abort===true,J({c1,c2:!!c2})); }
  /* (c) 1A-02 攤牌以後第一次說話那一句 */
  { fresh('2027-11-15',16,'lawlib'); H.CLOSE('heroine_05'); SOCIAL.meet('heroine_05','lawlib'); H.date('heroine_05'); const F=H.G.flags; F.TWO_HEARTS_PICK='heroine_05'; F.TWO_HEARTS_DAY=H.G.day-3;
    crowd('heroine_05',true); H.said=[]; const e1=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'}); const s1=said().length, f1=!!F.TWO_HEARTS_ECHO;
    crowd('heroine_05',false); H.said=[]; const e2=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'});
    check('3. 1A-02 攤牌以後那一句：旁邊有人＝不說、不記；她一個人＝說「那天的事，我不會再提。可是我記得。」',e1===false&&s1===0&&!f1&&e2===true&&has('那天的事，我不會再提。可是我記得。')&&F.TWO_HEARTS_ECHO===true,J({e1,s1,f1,e2,said:said()})); }
  /* (d) 沛珊結果 B：每學期第一週「這學期還可以嗎？我們講好的那些。」（說話前接演）*/
  { const d=TD('Y2S1',1,2); fresh(d,16,'cafe'); H.FRIEND('classmate_peishan'); SOCIAL.meet('classmate_peishan','cafe'); done('ev_peishan_doubt','ev_peishan_syllogism');   /* 和她說話的事件（為什麼念法律…）先算演過 */
    const st=MREL.rec(H.G).st.classmate_peishan={y:'heroine_01',n:1,day:d-30,phase:'done',result:'B',bTerm:{}}; const n=npc('classmate_peishan'); const L='這學期還可以嗎？我們講好的那些。';
    crowd('classmate_peishan',true); H.said=[]; H.picks=[]; await STORY.talkCharacter('classmate_peishan',n); const p1=has(L), b1=!!st.bTerm.Y2S1;
    crowd('classmate_peishan',false); H.said=[]; H.picks=[]; await STORY.talkCharacter('classmate_peishan',n); const p2=has(L), b2=!!st.bTerm.Y2S1;
    check('3. 沛珊結果 B 的「對一次」：第一週旁邊有人＝這一次不問（不記）；她一個人＝問、記下這學期',!p1&&!b1&&p2&&b2,J({p1,b1,p2,b2})); }
  /* (e) 子晴：Q8 河堤沒遇到、說「改天講」→ 下一次見面她第一句（說話前接演）*/
  { fresh(TD('Y2S2',16,3),23,'gongguan'); H.FRIEND('heroine_04'); SOCIAL.meet('heroine_04','gongguan'); const F=H.G.flags; F.ZQ_DAD_HEARD=true; PHONE.rec(H.G); H.G.msgs.push({id:'zqd',th:'p:heroine_04',from:'heroine_04',text:'嗯',ask:{id:'y2_zq_dad_msg'},ans:0,day:H.G.day-2});
    const n=npc('heroine_04'), L='我爸那天說，做遊戲是在浪費時間。'; const due=MREL.zqDadDue(H.G);
    crowd('heroine_04',true); H.said=[]; await STORY.talkCharacter('heroine_04',n); const p1=has(L), s1=F.ZQ_DAD_SAID;
    crowd('heroine_04',false); H.said=[]; await STORY.talkCharacter('heroine_04',n); const p2=has(L), s2=F.ZQ_DAD_SAID;
    check('3. 子晴爸爸那一句（Q8 一類）：旁邊有人＝不說、不記；她一個人＝說、記 ZQ_DAD_SAID',due===true&&!p1&&s1==null&&p2&&s2===H.G.day,J({due,p1,s1,p2,s2})); } });

/* ---------- 4 還沒公開的事 ---------- */
await sec('4',async()=>{
  /* (a) 沒回的那一句：zq_dad（子晴爸爸）、ps_plan（沛珊重考）*/
  { const E2=id=>NEEDED_MSGS.list.find(e=>e.id===id); const out=[];
    for(const [mid,who] of [['zq_dad','heroine_04'],['ps_plan','classmate_peishan']]){ fresh(TD('Y2S1',10,3),16,'campus'); const N=STORY.neededRec(H.G); const close=(H.G.day-1)*24+21;
      N.batches.push({d:H.G.day-8,ids:[[mid,who]],ans:[],said:{},closedAt:close});
      crowd(who,true); const m1=STORY.neededMissFor(H.G,E2(mid),who), l1=STORY.neededMissLine(H.G,who), s1=!!N.batches[0].said[who];
      crowd(who,false); const l2=STORY.neededMissLine(H.G,who), s2=!!N.batches[0].said[who];
      out.push([mid,m1===null&&l1===null&&!s1&&Array.isArray(l2)&&l2.length>0&&s2,J({m1,l1,s1,l2})]); }
    check('4. 沒回的那一句（zq_dad「我爸要來那則」、ps_plan「重考計畫那則」）：旁邊有人＝不說、不記說過；她一個人＝說',out.every(x=>x[1]),J(out)); }
  /* (b) 事件：旁邊有人＝不成立（照常說話）；她一個人＝成立 */
  { const R=[];
    const ev=(id,who,setup)=>{ const e=evOf(id); setup(); crowd(who,true); const c1=EVENTS.check(e); crowd(who,false); const c2=EVENTS.check(e); R.push([id,!c1&&c2,J({c1,c2})]); };
    ev('ev_zhiruo_secret','heroine_02',()=>{ fresh(TD('Y1S2',11,6),15,'wenzhou'); H.FAMILIAR('heroine_02'); });
    ev('ev_zhiruo_applied','heroine_02',()=>{ fresh('2026-12-15',15,'cafe'); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','SHARED_SECRET',''); done('ev_zhiruo_secret'); });   /* 12/10 截止以後（她自己的條件）*/
    ev('ev_peishan_decision','classmate_peishan',()=>{ fresh(TD('Y2S1',5,1),12.5,'linze',{dating_classmate_peishan:true}); H.FAMILIAR('classmate_peishan'); done('ev_peishan_doubt'); });
    ev('ev_ziqing_dad_visit','heroine_04',()=>{ fresh(TD('Y2S2',13,1),22.5,'gongguan'); H.FRIEND('heroine_04'); done('ev_ziqing_secret_game'); });
    ev('ev_ziqing_dad_stuck','heroine_04',()=>{ fresh('2027-10-06',22.5,'gongguan'); H.FAMILIAR('heroine_04'); E.player.obj.position={x:10,y:0,z:20}; E.player.lv=0;   /* 走到她旁邊才演（npcNear 3 m）*/
      const n=npc('heroine_04'); n.obj.position={x:11,y:0,z:20}; E.npcs=[n]; });
    check('4. 事件（芷若 Z4 十點的電話、Z7 她交件了、沛珊 P3 我要重考、子晴 Q8 爸爸來了、Q8b 爸爸卡關了）：旁邊有人＝不成立；她一個人＝成立',R.every(x=>x[1]),J(R));
    fresh(TD('Y1S2',11,6),15,'wenzhou'); H.FAMILIAR('heroine_02'); SOCIAL.meet('heroine_02','wenzhou'); crowd('heroine_02',true); const i1=EVENTS.onInteract('heroine_02'); await new Promise(r=>setTimeout(r,0));
    const d1=!!H.G.events.done.ev_zhiruo_secret; crowd('heroine_02',false); const i2=EVENTS.onInteract('heroine_02'); await new Promise(r=>setTimeout(r,20));
    check('4. 和芷若說話（大一下週六溫州街）：旁邊有人＝不演 Z4（照常說話）；她一個人＝演',i1===false&&!d1&&i2===true&&!!H.G.events.done.ev_zhiruo_secret,J({i1,d1,i2})); }
  /* (c) 傅鐘旁邊「妳的交換申請交了嗎？」*/
  { const run=async(on)=>{ fresh(TD('Y1S2',13,2),13,'campus'); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','SHARED_SECRET',''); crowd('heroine_02',on); H.opts=[]; H.picks=['發呆']; await EVENTS.run(evOf('ev_zhiruo_bell')); return H.opts[0]||[]; };
    const o1=await run(true), o2=await run(false), Q='「妳的交換申請交了嗎？」';
    check('4. 傅鐘旁邊的選項「妳的交換申請交了嗎？」：旁邊有人不出（其他照常）；她一個人才出',!o1.includes(Q)&&o1.includes('「妳上完課都在這裡發呆？」')&&o2.includes(Q),J({o1,o2})); }
  /* (d) 閒聊階梯：整層（語彤媽媽回診 Y-L7、Y7-L8）*/
  { const R=[]; for(const [term,w,wd,id,sid,lvl,zone] of [['Y1S1',6,2,'heroine_03','Y-L7','FAMILIAR','campus'],['Y4S1',16,2,'heroine_03','Y7-L8','FRIEND','campus']]){
      fresh(TD(term,w,wd),15,zone); H[lvl](id); SOCIAL.meet(id,zone); ladIdx(H.G,id,sid); crowd(id,true); const a=nextId(H.G,id); crowd(id,false); const b=nextId(H.G,id); R.push([sid,a===null&&b===sid,J({a,b})]); }
    check('4. 語彤媽媽回診（Y-L7「我媽每個月要回診一次」、Y7-L8「期末考完，我要陪我媽去回診」）：旁邊有人＝這一層不播；她一個人＝播',R.every(x=>x[1]),J(R)); }
  /* (e) 閒聊階梯：換進私密那一版才擋（Z3-L6 交換申請、P3-L6 重考、Z2-L6 extraIf）；原本那一版照播 */
  { const R=[]; const one=(lab,term,w,wd,id,sid,lvl,setPriv)=>{ fresh(TD(term,w,wd),15,'campus'); H[lvl](id); SOCIAL.meet(id,'campus'); ladIdx(H.G,id,sid);
      crowd(id,true); const base=nextId(H.G,id); setPriv(); const held=nextId(H.G,id); crowd(id,false); const alone=nextId(H.G,id); const st=STORY.ladNext(H.G,id), L=st?STORY.ladLines(st,H.G,id):[];
      R.push([lab,base===sid&&held===null&&alone===sid&&PRIVTALK.privText(st,PRIVTALK.byKey[lab].steps[sid]).some(t=>L.includes(t)),J({base,held,alone})]); };
    if(HAS()){ one('zr_exch_lad','Y2S1',11,3,'heroine_02','Z3-L6','FAMILIAR',()=>done('ev_zhiruo_applied'));
      one('ps_retake_lad','Y2S1',10,3,'classmate_peishan','P3-L6','FAMILIAR',()=>done('ev_peishan_decision'));
      one('zr_exch_lad','Y1S2',11,3,'heroine_02','Z2-L6','FAMILIAR',()=>SOCIAL.remember('heroine_02','SHARED_SECRET','')); }
    check('4. 換進私密那一版才擋（芷若 Z3-L6「交換申請送出去以後」、沛珊 P3-L6「重考的」、芷若 Z2-L6「交換的申請也是」）：原本那一版旁邊有人照播；私密那一版旁邊有人不播、她一個人播',R.length===3&&R.every(x=>x[1]),J(R)); }
  /* (f) Y4-L6 的第二個選項「妳媽媽身體還好嗎？」*/
  { fresh(TD('Y2S2',5,2),19,'noodle'); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','noodle'); const D=STORY.ladData(H.G,'heroine_03'), st=D&&D.L.steps.find(s=>s.id==='Y4-L6');
    crowd('heroine_03',true); const c1=st?STORY.ladChoices(st).map(c=>c.t):[]; crowd('heroine_03',false); const c2=st?STORY.ladChoices(st).map(c=>c.t):[];
    check('4. 語彤 Y4-L6 的「妳媽媽身體還好嗎？」：旁邊有人只出第一個選項；她一個人兩個都出',!!st&&J(c1)===J(['「跟妳小時候一樣。」'])&&c2.length===2,J({c1,c2})); }
  /* (g) 真的圈子：語彤和筱涵（大一上週二中午校園，一定同框）——筱涵在她旁邊＝Y-L7 不播；走遠＝播 */
  { const r=HCIRCLE.row('c503_6_1'); const d=TD('Y1S1',6,2); fresh(d,12.4,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); ladIdx(H.G,'heroine_03','Y-L7');
    E.zone={id:'campus',seats:[],spawn:{x:0,z:0}}; E.npcs=[]; GM.npc={}; E.canStand=()=>true; E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; }; E.moveTo=(n,x,z,cb)=>{ n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; };
    E.player.obj.position={x:500,y:0,z:500};
    const sp=(id,x,z)=>{ const n={id,charId:id,name:SOCIAL.npcName(id),obj:{position:{x,y:0,z},rotation:{y:0}},lv:0,beh:'wander',waypoints:[[x,z]],pose:'idle',idlePose:'idle',talk:nn=>STORY.talkCharacter(id,nn)}; GM.npc[id]=n; E.npcs.push(n); return n; };
    const yt=sp('heroine_03',0,7), xh=sp('npc_huangxh',1,7); HCIRCLE.bind(GM); HCIRCLE.arrange(GM,false); const on=HCIRCLE.on(r,H.G);
    const a=nextId(H.G,'heroine_03'); xh.obj.position.x=30; const b=nextId(H.G,'heroine_03');
    check('4. 真的圈子（語彤和筱涵，HCIRCLE.company）：筱涵在旁邊＝Y-L7 不播；筱涵走遠＝播',on===true&&a===null&&b==='Y-L7',J({on,a,b})); }
  /* (h) until／from：芷若交換申請 5/11 錄取以後、學姊口試結果只算 5/29 那一天 */
  if(HAS()){ const ok=(k,key,id)=>{ fresh(k,15,'campus'); crowd(id,true); return PRIVTALK.ok(H.G,id,key); };
    const a=ok('2027-05-10','zr_exch_lad','heroine_02'), b=ok('2027-05-11','zr_exch_lad','heroine_02'), c=ok('2029-05-28','sis_oral','heroine_05'), d=ok('2029-05-29','sis_oral','heroine_05'), e=ok('2029-05-30','sis_oral','heroine_05');
    check('4. 期限：芷若交換申請 5/10 旁邊有人＝擋、5/11 錄取以後不算私密；學姊口試結果只有 5/29 那一天算',a===false&&b===true&&c===true&&d===false&&e===true,J({a,b,c,d,e})); }
  else check('4. 期限（PRIVTALK）',false,'沒有 PRIVTALK'); });

/* ---------- 5 不會永久卡住：有期限的，期限內照圈子資料都有她一個人的時候 ---------- */
await sec('5',async()=>{ if(typeof HCIRCLE==='undefined'){ check('5. HCIRCLE',false); return; }
  /* 這個時間圈子會不會讓她旁邊一定有人（同框的列成立；70% 的列照那一天擲的結果）*/
  const blocked=(who,d,h,zone)=>{ fresh(d,h,zone); return (HCIRCLE.BY_WHO[who]||[]).some(r=>!r.alone&&r.with&&r.with.length&&HCIRCLE.on(r,H.G,zone)); };
  const span=(a,b,step)=>{ const o=[]; for(let x=a;x<b-1e-9;x+=step) o.push(+x.toFixed(4)); return o; };
  const termDays=(t,wks,wds)=>{ const r=CALENDAR.termDays(t), o=[]; for(let d=r.from;d<=r.to;d++){ const T=CALENDAR.termOf(d); if(!T||(wks&&!wks.includes(T.week))) continue; if(wds&&!wds.includes(wdOf(d))) continue; o.push(d); } return o; };
  const W={zq_dad_q8:{who:'heroine_04',days:termDays('Y2S2',[13,14],[1,2,3,4,5]),hrs:span(22,23,0.25),zones:['gongguan']},
    zq_dad_q8b:{who:'heroine_04',days:[DK('2027-10-06'),DK('2027-10-07'),DK('2027-10-08')],hrs:span(22,23.5,0.25),zones:['gongguan']},
    ps_retake_ev:{who:'classmate_peishan',days:termDays('Y2S1',[5],[1,2,3,4,5]),hrs:span(12,13,0.25),zones:['linze','campus']},
    zr_exch_ev:{who:'heroine_02',days:termDays('Y1S2',[11,12,13,14,15],[6]),hrs:span(14,18,0.5),zones:['wenzhou']},
    zr_exch_applied:{who:'heroine_02',days:termDays('Y2S1',null,null).filter(d=>d>DK('2026-12-10')),hrs:span(11,22,1),zones:['cafe']}};   /* Z7 自己的條件：12/10 截止以後 */
  const res=[]; for(const k in W){ const w=W[k]; let free=0, blk=0; for(const d of w.days) for(const h of w.hrs) for(const z of w.zones){ if(blocked(w.who,d,h,z)) blk++; else free++; } res.push([k,free,blk]); }
  check('5. 有期限的事件（Q8、Q8b、P3、Z4、Z7）：期限內照圈子資料都有她一個人的時候（[key, 一個人, 旁邊有人]）',res.every(x=>x[1]>0)&&res.find(x=>x[0]==='zr_exch_applied')[2]>0,J(res));
  /* 閒聊階梯擋下的那幾層：那一學期的週次裡，她在 3D（作息有區域）而且旁邊沒有圈子的人的時候 */
  const lad=[]; if(HAS()) for(const e of PRIVTALK.LIST.filter(x=>x.gate==='hold')) for(const sid in e.steps){ let term=null, st=null;
      for(const t in LADDER.byTerm){ const L=LADDER.byTerm[t][e.who]; const s=L&&(L.steps||[]).find(q=>q.id===sid); if(s){ term=t; st=s; break; } }
      if(!st){ lad.push([sid,0,'找不到']); continue; } const wk=st.week?Array.from({length:st.week[1]-st.week[0]+1},(_,i)=>st.week[0]+i).filter(x=>x<=16):null; let free=0;
      for(const d of termDays(term,wk,null).slice(0,40)){ for(const h of span(8,23,1)){ fresh(d,h,'campus'); const en=STORY.schedEnt(CHARACTERS[e.who],H.G); if(!en||!en.zone) continue; if(!blocked(e.who,d,h,en.zone)){ free++; break; } } if(free>=3) break; }
      lad.push([sid,free]); }
  check('5. 閒聊階梯擋下的那幾層：那幾週裡都有她在 3D、旁邊沒有圈子的人的時候',lad.length>=9&&lad.every(x=>x[1]>=1),J(lad)); });

/* ---------- 6 一般閒聊照常 ---------- */
await sec('6',async()=>{ const d=TD('Y1S1',6,2); fresh(d,15,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); const n=npc('heroine_03');
  H.said=[]; await STORY.talkCharacter('heroine_03',n); H.G.day+=1; H.G.weekday=wdOf(H.G.day);   /* 先說過一次（升到有點熟的那幾句先說掉）*/
  const D=STORY.ladData(H.G,'heroine_03'), i7=D.L.steps.findIndex(s=>s.id==='Y-L7'); ladIdx(H.G,'heroine_03',D.L.steps[i7-1].id);   /* Y-L7 前一層（一般的）*/
  crowd('heroine_03',true); H.said=[]; await STORY.talkCharacter('heroine_03',n); const s1=said(), at1=ladAt(H.G,'heroine_03');
  H.G.day+=1; H.G.weekday=wdOf(H.G.day); H.said=[]; await STORY.talkCharacter('heroine_03',n); const s2=said(), at2=ladAt(H.G,'heroine_03');
  crowd('heroine_03',false); H.G.day+=1; H.G.weekday=wdOf(H.G.day); H.said=[]; await STORY.talkCharacter('heroine_03',n); const s3=said(), at3=ladAt(H.G,'heroine_03');
  const L7='我媽每個月要回診一次，都排在週末，我陪她去。';
  check('6. 旁邊有人：一般的那一層照播、照常前進（'+D.L.steps[i7-1].id+'）',at1===i7&&s1.length>0&&!s1.some(t=>t.includes(L7)),J({at1,i7,s1:s1.slice(0,3)}));
  check('6. 隔天旁邊還是有人：Y-L7 不播、不前進，照常閒聊（有說話）',at2===i7&&s2.length>0&&!s2.some(t=>t.includes(L7)),J({at2,s2:s2.slice(0,3)}));
  check('6. 再隔一天她一個人：Y-L7 播、前進',at3===i7+1&&s3.some(t=>t.includes(L7)),J({at3,s3:s3.slice(0,3)})); });

H.done();
})();
