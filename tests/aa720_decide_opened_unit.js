// AA_720 決定拍打開的場景＋尾聲分版本（企劃線 075eae472；AA720-DECIDE-OPENED-1108、SIS1-QUIET-LIB-1108、AA720-WIRING-1108）——不需要瀏覽器（D131）。
// 使用者 11-07 對 BB-B：「我想要的是我的選項會改變故事」；Q3「要分版本」；Q4 沛珊 before「可以 但前提是有交往」。
// 檢查：
//   0 匯入：src/data/aa720.js 和 AA_720@ee689cfb8 一致（import_aa720.py --check；內容逐字＝稿照 read_fix）；白名單 approved；index.html 有兩支；19 場都有事件或加段
//   1 打開：每一場只在她的決定拍記了那個值才演（別的值、沒演到的預設值、過了 before 的 late＝不演）
//   2 邀約 → 回答應／不去 → 排出遊（時間照稿）→ 那一場逐句（scene、選項她回的、end、opts2）、記 set、mem；答應了沒到＝missed 的訊息照稿的時間、記 missed
//   3 接在決定拍 say 後面的三個選項（說明會、店後門、模擬面試）：當面＝說完接著選；三天沒見面＝最後一則訊息掛選項
//   4 兩場加段：以安送機（3/24 22:30 她私訊、SENDOFF 兩處「商法」）、芷若送機（沒有 HOOK 也傳、第二句換、第一封信、之後回房間讀信）
//   5 語彤 tell：取代 10'、事件 4（ytjob3d）、21:30 三則、不在場＝週日 21:00、第 6 拍 beat6
//   6 區塊時間：zr_call 週二／五 22:25、zr_letters 到了以後第一次進 Café、ps_result 2027-08-06 10:00、kx_quiet 決定＋8 天 21:00、kx_eat、kx_slot 週三 18:00、
//     zq_intern 暑假六則＋假實習動態不傳、學姊考前一晚之後那則取代 sisg_exam_done、Alison 猜到（決定＋5 天 22:00／不知道＝下次見面）、阿哲被問（讀書會散場）、奶奶家（第三個週日）、可昕等了一個小時
//   7 沛珊 PS-2 ruleIf：future=seen＋support＋信任高，還要交往中才是 before
//   8 尾聲：每位照 order 取第一個符合的一句（friend／partner）、交往中＋CONF_FAIL＝再加 confFail、學姊 guess 要 KNOWS_SIS_ALISON、都不符合＝照原本
//   9 quietMove：學姊第 6 拍在總圖安靜區（平日 1/27）＝樓梯間版、樓梯間不加（小聲）、SIS-1 照記；週末慢讀照原本；1/31 以後才演到＝late
//  10 wiringAnswers（ee689cfb8，AA-B 回 LAWWW-B 02:39）：ps_result 09:58 兩則→10:00→10:02→12:00 照原本；交往中＋信＝第四封多一句、12/25 視訊照舊；AA_719 after 四處；
//     可昕 waited 之後兩天只回一句（六句輪流、第三天照常）；子晴 1/9 demo intern 版、動態說明文字；AA_717 子晴第 13 則改字、第 14／15 則 altIntern、ZQ_PL_CAT_CO 照關
//  11 an1_later＋wiringAnswers2（075eae472，AA-B 回 LAWWW-B 03:16）：以安 AN-1 later（含預設值）3/19 21:00 桌遊團群組 Alison、21:20 以安私訊三選項（不在群組＝只有私訊、第一句換）；
//     1/9 demo intern 版三處照 ZQ-2（沒有值＝cat）；沒交往 Café 當面版加「……獎學金拿到一半。」；選信的 9/28 生日電話照原本（明信片的照舊）；ev_zq_dad_angry 沒有、intern 只關 zq_intern.closes
//     wiringAnswers3（3e6a7ff71，AA-B 回 LAWWW-B 03:33）：選信的 9/28 開頭旁白「（台灣晚上十點，手機響了。）」；選信又和別人交往中＝沒有這通；1/9 demo 第一句保留「資工系館的電腦教室。」
// 修改前全部 FAIL（沒有 AA720P）。用法：node tests/aa720_decide_opened_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const VER=((fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8').match(/版本 v([0-9.]+)（/)||[])[1]||'?');   /* ?v= 和標題的版號一樣：不寫死 9.10.22（發布樹會換版號，同 bike_shop_park_unit.js）*/
const loadErr=[];
const loadG=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有'); return false; } try{ const s=fs.readFileSync(p,'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); return false; } };
for(const f of ['src/data/heroine_arcs.js','src/data/arc_rot.js','src/data/decide_rules.js','src/decide3d.js','src/arcs3d.js','src/libquiet3d.js',
  'src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/data/y2b_events.js','src/y2b3d.js','src/zr_sendoff3d.js','src/y34b3d.js',
  'src/ytjob3d.js','src/sis_grad3d.js','src/psresults3d.js','src/data/feed_y1s2.js','src/data/feed_y2s1.js','src/feed3d.js','src/data/aa723.js','src/confess723_3d.js',
  'src/y2r2_3d.js','src/aa555_3d.js','src/zq_testbuild3d.js']) loadG(f);
const okD=loadG('src/data/aa720.js'), okP=loadG('src/aa720_3d.js');
const SHA='6ada48974', DOC='docs/story_planning/AA_720_decide_opened_scenes.json';
const dk=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7, key=d=>CALENDAR.dateOf(d).key;
const P=()=>typeof AA720P!=='undefined'?AA720P:null, DT=()=>AA720.data, EV=k=>AA720.data.events[k];
const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const fresh=(k,h,zone,fl)=>{ const G=H.fresh(k,h,zone||'dorm',fl||{}); G.invites=[]; G.outings=[]; G.msgs=G.msgs||[]; G.acts=G.acts||{att:{}};
  for(const id of [AN,ZR,YT,ZQ,SIS,PS,KX,'yu','zhe']){ H.FRIEND(id); INV.addContact(G,id); } G.msgs=[]; return G; };
const dec=(G,who,keyN,v,day,x)=>{ const D=G.flags.DECIDE||(G.flags.DECIDE={}); (D[who]||(D[who]={}))[keyN]=Object.assign({v,day:day!=null?day:G.day},x||{}); };
const at=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wd(d); E.hour=h; };
const tick=G=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const run=(G,d,h)=>{ at(G,d,h); tick(G); };
const ask=(G,k)=>PHONE.byAsk(G,'aa720:'+k);
const texts=G=>(G.msgs||[]).map(m=>m.text);
const said=()=>H.said.map(s=>s.t);
const rx=(G,t)=>String(t).replace(/\{name\}/g,G.name||'祐廷');
const flat=(G,L)=>(L||[]).map(t=>rx(G,Array.isArray(t)?t[1]:t));
const goOut=async(G,id,picks)=>{ const q=OUT.get(G,id); H.said=[]; H.picks=(picks||[]).slice(); if(!q) return null; at(G,q.day,q.h-(q.travelH||0)-0.1); await OUT.go(GM,q); return q; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).slice(0,400)); } };
/* 稿（照 read_fix；CANON-NO-ECON-1112 第四批：再照 AA_897 第 2 節換整句，同 import_aa720.py 的 IG.use_canon897()）*/
let SRC=null; try{ SRC=JSON.parse(cp.execFileSync('python3',['-c',"import json,subprocess,sys; sys.path.insert(0,'tools/story'); import import_guard as IG\nIG.use_canon897()\n"+
  "def fx(x):\n  return IG.read_fix(x) if isinstance(x,str) else ([fx(v) for v in x] if isinstance(x,list) else ({k:fx(v) for k,v in x.items()} if isinstance(x,dict) else x))\n"+
  "d=json.loads(subprocess.check_output(['git','show','"+SHA+":"+DOC+"']).decode('utf-8')); d.pop('_meta',None); d.pop('wiringAnswers',None); d.pop('wiringAnswers2',None); d.pop('wiringAnswers3',None); print(json.dumps(fx(d),ensure_ascii=False))"],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26})); }catch(e){ SRC=null; }
const canon=x=>Array.isArray(x)?x.map(canon):(x&&typeof x==='object'?Object.keys(x).sort().reduce((o,k)=>(o[k]=canon(x[k]),o),{}):x);
(async()=>{
  check('0. 載入（AA720、AA720P 和它要包的那幾支）',okD&&okP&&!loadErr.length,J(loadErr));
  if(!okD||!okP||!P()){ H.done(); return; }
  /* ---------------- 0 匯入 ---------------- */
  await sec(0,async()=>{ let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_aa720.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/aa720.js 和 AA_720@'+SHA+' 一致（import_aa720.py --check）',ok&&AA720.src===DOC+'@'+SHA,out.trim().slice(0,200));
    check('0. 內容逐字：events、七個區塊、endings、quietMove、kx_waited_after、an1_later＝稿（只照 read_fix 換名；wiringAnswers、wiringAnswers2 是說明、不進遊戲）',!!SRC&&J(require('./canon_b5_expect.js').fwd(canon(SRC),'aa720.js'))===J(canon(DT()))/* 2026-11-12 第五批：AA_921 第 3-3 節兩句（canon_b5_rows） */,SRC?'':'讀不到稿');
    const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===DOC);
    check('0. 匯入白名單：一筆、approved、sha '+SHA+'、task AA720-DECIDE-OPENED-1108、approvedBy 含「AA-B D109（11-08 01:39 AA_720 第一批）」、ee689cfb8、075eae472 和 3e6a7ff71、history 留 4f37a68bb、ee689cfb8、075eae472',allow.length===1&&allow[0].status==='approved'&&allow[0].sha===SHA&&allow[0].task==='AA720-DECIDE-OPENED-1108'&&allow[0].approvedBy.includes('AA-B D109（11-08 01:39 AA_720 第一批）')&&allow[0].approvedBy.includes('ee689cfb8（AA-B 11-08 02:4x wiringAnswers')&&allow[0].approvedBy.includes('075eae472（AA-B 11-08 03:2x an1_later＋wiringAnswers2')&&allow[0].approvedBy.includes('3e6a7ff71（AA-B 11-08 03:3x wiringAnswers3')&&allow[0].history.some(h=>h.sha==='075eae472')&&allow[0].history.some(h=>h.sha==='4f37a68bb')&&allow[0].history.some(h=>h.sha==='ee689cfb8'),J(allow));
    check('0. wiringAnswers／wiringAnswers2／wiringAnswers3 不在遊戲資料裡（要演的句子在 cfg：quotes、demo3）',!('wiringAnswers' in DT())&&!('wiringAnswers2' in DT())&&!('wiringAnswers3' in DT())&&AA720.cfg.quotes.zrBdayLetterNarr==='（台灣晚上十點，手機響了。）'&&AA720.cfg.quotes.zqDemoKeep==='資工系館的電腦教室。'&&!!AA720.cfg.demo3&&!!AA720.cfg.quotes.zrScholarCafe&&!!AA720.cfg.quotes.anLaterNoGroup);
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), i1=html.indexOf('src/data/aa720.js?v='+VER), i2=html.indexOf('src/aa720_3d.js?v='+VER);
    const after=['src/y34b3d.js','src/zr_sendoff3d.js','src/ytjob3d.js','src/y2b3d.js','src/feed3d.js','src/sis_grad3d.js','src/postgrad3d.js','src/arcs3d.js','src/invites3d.js','src/zr_uk3d.js'].every(f=>{ const j=html.indexOf(f+'?'); return j>=0&&j<i2; });
    check('0. index.html：資料在 decide_rules.js 旁邊、播放在它要包的那幾支後面',i1>0&&i2>i1&&html.indexOf('src/data/decide_rules.js')<i1&&after);
    const ids=['ev_an_expo_together','ev_an_grad_think','ev_zr_call_mom','ev_zr_scholar_1','ev_zr_scholar_2','ev_zr_return_airport','ev_yt_result_together','ev_zq_quit_intern','ev_sis_last_night','ev_sis_alison_asks_zhe','ev_sis_grandma_dinner','ev_ps_before_leave','ev_ps_station_sendoff','ev_kx_mock_interview','ev_kx_waited'];
    check('0. 新的 15 場都在 STORY_EVENTS（ev_an_airport、ev_zr_sendoff_airport＝現有事件加段；ev_yt_tell_mom＝茶屋的班／手機；ev_sis_alison_guess＝手機／見面）',ids.every(id=>STORY_EVENTS.some(e=>e.id===id)),J(ids.filter(id=>!STORY_EVENTS.some(e=>e.id===id))));
    const bad=Object.entries(AA720.cfg.bg).filter(([k,b])=>!['dark','blur'].includes(b)&&!(OUT.BG[b]&&OUT.BG[b].image&&fs.existsSync(path.join(H.ROOT,OUT.BG[b].image))));
    check('0. 背景都在 OUT.BG、圖檔存在（沒有 3D、沒有圖＝dark）',!bad.length,J(bad)); });

  /* ---------------- 1 打開只照決定 ---------------- */
  await sec(1,async()=>{ const CASES=[['ev_an_grad_think',AN,'grad','together','alone','2027-10-04',21],['ev_zr_scholar_1',ZR,'fund','scholar','tell','2027-03-01',21],['ev_zr_return_airport',ZR,'distance','visit','call','2028-02-14',21],
      ['ev_yt_result_together',YT,'dm','with','alone','2026-07-02',21],['ev_zq_quit_intern',ZQ,'summer','intern','game','2026-10-16',22+10/60],['ev_sis_last_night',SIS,'exam','stay','alone','2026-02-01',16],['ev_ps_before_leave',PS,'tell','before','after','2026-12-17',20.5]];
    const out=[];
    for(const [k,who,kk,yes,no,day,h] of CASES){ const r=[];
      for(const mode of ['yes','no','default','late']){ const G=fresh(day,h-0.5); if(k==='ev_ps_before_leave') H.date(PS); const dd=k==='ev_zr_scholar_1'?dk(day)-2:(k==='ev_an_grad_think'?dk(day):dk(day)-20);
        if(mode==='yes') dec(G,who,kk,yes,dd); if(mode==='no') dec(G,who,kk,no,dd); if(mode==='late') dec(G,who,kk,yes,dd,{late:true});
        run(G,dk(day),h+0.01); r.push(!!ask(G,k)); }
      out.push([k,r]); }
    check('1. 七場的邀約：記了打開的值＝傳；別的值、沒演到（預設值）、過了 before 的 late＝不傳',out.every(([k,r])=>J(r)===J([true,false,false,false])),J(out)); });

  /* ---------------- 2 邀約 → 那一場 ---------------- */
  await sec(2,async()=>{ const k='ev_an_grad_think', E2=EV(k); const G=fresh('2027-10-04',20); const d=G.day; dec(G,AN,'grad','together',d); run(G,d,21.05);
    const m=ask(G,k); check('2. 以安 AN-2 together：決定那天 21:00 傳兩則（照稿），最後一則三個選項',!!m&&E2.invite.msgs.every(t=>texts(G).includes(t))&&m.ask.opts.length===3&&J(m.ask.opts.map(o=>o.t))===J(E2.invite.opts.map(o=>o.t)),J(texts(G)));
    PHONE.answer(G,m.ask.id,1); const q=OUT.get(G,'aa720_'+k);
    check('2. 回「要帶什麼嗎？」：她回「剪刀。……我忘了借。」、排隔天 19:00 總圖 B1 討論室',!!q&&q.day===d+1&&q.h===19&&q.place==='總圖 B1 討論室'&&texts(G).includes('剪刀。……我忘了借。'),J(q));
    const r0=Object.assign({},SOCIAL.rel(AN)); await goOut(G,'aa720_'+k,[1]); const s=said();
    const want=flat(G,E2.scene).concat(flat(G,E2.opts[1].say),flat(G,E2.end));
    check('2. 那一場逐句：scene → 選第 2 個（她回的三句）→ end（最後留「商法」）',J(s)===J(want),J(s.slice(-6)));
    check('2. 記 AN_GRAD_THINK、記憶 AN_GRAD_SLIPS、選項的 rel（自在 +2）',G.flags.AN_GRAD_THINK===true&&SOCIAL.has(AN,'AN_GRAD_SLIPS')&&SOCIAL.rel(AN).comf-r0.comf===2,J({f:G.flags.AN_GRAD_THINK,c:[r0.comf,SOCIAL.rel(AN).comf]}));
    /* +1天 */
    { const G2=fresh('2027-10-04',20); dec(G2,AN,'grad','together',G2.day); run(G2,G2.day,21.05); PHONE.answer(G2,ask(G2,k).ask.id,2); const q2=OUT.get(G2,'aa720_'+k);
      check('2. 回「明天不行。後天可以嗎？」＝排後天 19:00',!!q2&&q2.day===G2.day+2&&q2.h===19,J(q2)); }
    /* missed */
    { const G3=fresh('2027-10-04',20); const d3=G3.day; dec(G3,AN,'grad','together',d3); run(G3,d3,21.05); PHONE.answer(G3,ask(G3,k).ask.id,0); at(G3,d3+1,21); OUT.tick(GM); PHONE.tick(G3); run(G3,d3+1,21.6);
      const mm=G3.msgs.find(x=>x.text==='我先開始了。')||{}, mn=G3.msgs.find(x=>x.text==='商法。我自己選的。')||{};
      check('2. 答應了沒到：19:20「我先開始了。」21:30「商法。我自己選的。」、AN_GRAD_THINK＝missed',G3.flags.AN_GRAD_THINK==='missed'&&mm.day===d3+1&&Math.abs(mm.h-(19+20/60))<0.02&&mn.day===d3+1&&Math.abs(mn.h-21.5)<0.12,J({f:G3.flags.AN_GRAD_THINK,mm:[mm.day,mm.h],mn:[mn.day,mn.h],d:d3+1})); }
    /* declined：芷若 scholar_1「那週我不行。」*/
    { const G4=fresh('2027-03-01',20); dec(G4,ZR,'fund','scholar',G4.day-2); run(G4,G4.day,21.05); const m4=ask(G4,'ev_zr_scholar_1'); PHONE.answer(G4,m4.ask.id,2);
      check('2. 芷若 scholar：決定＋2 天 21:00；回「那週我不行。」＝ZR_SCHOLAR1 declined、不排',!!m4&&G4.flags.ZR_SCHOLAR1==='declined'&&!OUT.get(G4,'aa720_ev_zr_scholar_1'),J(G4.flags.ZR_SCHOLAR1));
      const d4=G4.day, s1=P().r(G4,'ev_zr_scholar_1').slot; run(G4,s1.d+10,20.9); const m5a=ask(G4,'ev_zr_scholar_2'); run(G4,s1.d+10,21.05); const m5=ask(G4,'ev_zr_scholar_2');
      check('2. _1 沒去也會寫好：_1 那週四＋10 天 21:00 傳「寫好了。」「明天七點，同一間。」',wd(s1.d)===4&&s1.d>d4&&s1.d<=d4+7&&!m5a&&!!m5&&texts(G4).includes('寫好了。'),J({s1,m5:!!m5}));
      PHONE.answer(G4,m5.ask.id,0); const q5=OUT.get(G4,'aa720_ev_zr_scholar_2'); check('2. 回「好。」＝隔天 19:00',!!q5&&q5.day===s1.d+11&&q5.h===19,J(q5)); }
    /* both：altFirst */
    { const G5=fresh('2027-03-01',21); const d5=G5.day; dec(G5,ZR,'fund','both',d5-1); P().r(G5,'ev_zr_call_mom').st='missed'; P().r(G5,'ev_zr_call_mom').plan={d:d5-7,h:17.5}; run(G5,d5,21.05);
      check('2. 芷若 both：店後門那一場那天＋7 天 21:00，第一則換 altFirst（「我跟我媽說我也會申請獎學金。」）',texts(G5).includes(EV('ev_zr_scholar_1').invite.altFirst.msgs[0])&&!texts(G5).includes(EV('ev_zr_scholar_1').invite.msgs[0]),J(texts(G5))); }
    /* 接機 datingInsert */
    { const G6=fresh('2028-02-14',20); dec(G6,ZR,'distance','visit',G6.day-300); H.date(ZR); run(G6,G6.day,21.05); PHONE.answer(G6,ask(G6,'ev_zr_return_airport').ask.id,0); const E6=EV('ev_zr_return_airport');
      const q6=OUT.get(G6,'aa720_ev_zr_return_airport'); await goOut(G6,'aa720_ev_zr_return_airport',[0]); const s6=said(); const i0=s6.indexOf(rx(G6,E6.scene[1]));
      check('2. 芷若接機（交往中）：2/15 15:00、機場捷運 1 小時；第 2 句後面加「抱住你」那一句；ZR_RETURN met、記憶 ZR_PICKUP',!!q6&&q6.day===dk('2028-02-15')&&q6.h===15&&q6.travelH===1&&s6[i0+1]===E6.datingInsert.lines[0]&&G6.flags.ZR_RETURN==='met'&&SOCIAL.has(ZR,'ZR_PICKUP'),J({q6,s:s6.slice(0,4)})); }
    /* opts2：店後門 */
    { const G7=fresh('2027-03-10',15,'cafe'); dec(G7,ZR,'fund','both',G7.day-1); const x={who:ZR,key:'fund',due:G7.day,say:['我想了一個晚上。……我們都要學開口。我先打，你陪我。'],played:false}; G7.flags.DECIDE_SAY=[x];
      H.said=[]; H.picks=[1]; await DECIDE.playDue(GM,{name:'芷若',charId:ZR},ZR,x); const q7=OUT.get(G7,'aa720_ev_zr_call_mom'); const V=EV('ev_zr_call_mom').variants.both;
      check('3. 店後門（both）：say 說完當面接三個選項、回「現在嗎？」＝她回、排隔天 17:30',J(said())===J(x.say.concat(V.invite.opts[1].say))&&!!q7&&q7.day===G7.day+1&&q7.h===17.5,J({s:said(),q7}));
      await goOut(G7,'aa720_ev_zr_call_mom',[1,2]); const s7=said(); const want=flat(G7,V.scene).concat(flat(G7,V.opts[1].say),flat(G7,V.end),flat(G7,V.opts2[2].say));
      check('2. 店後門那一場：scene → 選項 → end（電話）→ opts2（遞面紙）；ZR_FUND_TOLD both、ZR_TOLD_FAMILY',J(s7)===J(want)&&G7.flags.ZR_FUND_TOLD==='both'&&G7.flags.ZR_TOLD_FAMILY===true&&SOCIAL.has(ZR,'ZR_BACKDOOR_CALL'),J(s7.slice(-4))); }
  });

  /* ---------------- 3 接在 say 後面（說明會；傳訊息版）---------------- */
  await sec(3,async()=>{ const E3=EV('ev_an_expo_together'); const G=fresh('2027-03-08',20); dec(G,AN,'jp_tell','first',dk('2026-04-20')); G.flags.DECIDE_SAY=[{who:AN,key:'jp_tell',due:dk('2027-03-08'),say:DECIDE.byKey(AN,'jp_tell').rules[0].say.slice(),played:false}];
    run(G,dk('2027-03-11'),21); const m=ask(G,'ev_an_expo_together');
    check('3. 以安說明會：revealAt 以後三天沒見面＝傳訊息（只傳她說的），最後一則掛三個選項',!!m&&m.text==='不是要你去日本。我只是想有人坐旁邊。'&&m.ask.opts.length===3,J(m&&m.text));
    PHONE.answer(G,m.ask.id,1); const q=OUT.get(G,'aa720_ev_an_expo_together');
    check('3. 回「我去。可是我不去日本喔。」＝她回兩句、排 3/18 18:30 博思 101（late 15 分）',!!q&&q.day===dk('2027-03-18')&&q.h===18.5&&q.late===0.25&&E3.invite.opts[1].say.every(t=>texts(G).includes(t)),J(q));
    await goOut(G,'aa720_ev_an_expo_together',[2]); check('3. 那一場：scene → 選「第一頁那條石板路很好看。」→ end；AN_EXPO went、記憶 AN_EXPO_SAT',J(said())===J(flat(G,E3.scene).concat(flat(G,E3.opts[2].say),flat(G,E3.end)))&&G.flags.AN_EXPO==='went'&&SOCIAL.has(AN,'AN_EXPO_SAT'));
    { const G2=fresh('2027-03-08',20); dec(G2,AN,'jp_tell','first',dk('2026-04-20')); const x={who:AN,key:'jp_tell',due:G2.day,say:['我要申請日本交換。'],played:false}; G2.flags.DECIDE_SAY=[x]; H.said=[]; H.picks=[2]; await DECIDE.playDue(GM,{name:'沈以安',charId:AN},AN,x);
      check('3. 當面說、回「那天我有事。」＝她回兩句、AN_EXPO declined、不排',G2.flags.AN_EXPO==='declined'&&!OUT.get(G2,'aa720_ev_an_expo_together')&&J(said().slice(1))===J(E3.invite.opts[2].say),J(said())); }
    { const G3=fresh('2027-03-08',20); dec(G3,AN,'jp_tell','later',dk('2026-04-20')); const x={who:AN,key:'jp_tell',due:G3.day,say:['……'],played:false}; G3.flags.DECIDE_SAY=[x]; H.said=[]; H.picks=[0]; await DECIDE.playDue(GM,{name:'沈以安',charId:AN},AN,x);
      check('3. later 的玩家：say 之後沒有選項、沒有排',H.opts.length===0&&!OUT.get(G3,'aa720_ev_an_expo_together')); }
    /* 模擬面試 */
    { const G4=fresh('2027-04-05',20); dec(G4,KX,'after_fail','rehearse',G4.day-3); const x={who:KX,key:'after_fail',due:G4.day,say:['我想了想。','下次面試前，你當面試官。你問得比較兇。'],played:false}; G4.flags.DECIDE_SAY=[x]; H.said=[]; H.picks=[0]; await DECIDE.playDue(GM,{name:'可昕',charId:KX},KX,x);
      const q=OUT.get(G4,'aa720_ev_kx_mock_interview'); check('3. 可昕 rehearse：say 之後三個選項；排 say 那天以後第一個週四 19:30 交誼廳',!!q&&wd(q.day)===4&&q.day>G4.day&&q.day<=G4.day+7&&q.h===19.5,J(q));
      await goOut(G4,'aa720_ev_kx_mock_interview',[0]); run(G4,q.day+5,17.05); const R=EV('ev_kx_mock_interview').result;
      check('2. 模擬面試演完：KX_MOCK、plan 那天＋5 天 17:00「過了。」三則（可以回）',G4.flags.KX_MOCK===true&&R.msgs.every(t=>texts(G4).includes(t))&&!!ask(G4,'kx_mock_result'),J(texts(G4).slice(-3))); } });

  /* ---------------- 4 加段 ---------------- */
  await sec(4,async()=>{ const I=EV('ev_an_airport'); const G=fresh('2028-03-24',22); dec(G,AN,'grad','together',dk('2027-10-01')); run(G,dk('2028-03-24'),22.55); const m=ask(G,'ev_an_airport');
    check('4. 以安 together（不是日本路線）：3/24 22:30「明天十點。」「……你會來嗎。」三個選項',!!m&&I.dm.msgs.every(t=>texts(G).includes(t))&&m.h>=22.5&&m.h<22.6&&m.ask.opts.length===3,J(m&&m.h));
    PHONE.answer(G,m.ask.id,0); const q=OUT.get(G,'y3_an_sendoff');
    check('4. 回「會。」＝HOOK_AN_SENDOFF、排現有的 y3_an_sendoff（3/25 10:00 桃園機場）',G.flags.HOOK_AN_SENDOFF!=null&&!!q&&q.ev==='ev_an_sendoff'&&q.day===dk('2028-03-25')&&q.h===10,J(q));
    { const Gj=fresh('2028-03-24',22); Gj.flags.EXCHANGE_ROUTE='JP'; dec(Gj,AN,'grad','together',dk('2027-10-01')); run(Gj,dk('2028-03-24'),22.55); check('4. 日本路線：不傳（3/25 一起出發照原本）',!ask(Gj,'ev_an_airport')); }
    const ev=STORY_EVENTS.find(e=>e.id==='ev_an_sendoff'), D=ev&&ev.dialogue||[]; const iF=D.findIndex(l=>l&&l.text===I.insert.friend.lines[0]), iC=D.findIndex(l=>l&&Array.isArray(l.choice)&&l.choice.some(c=>c.goto==='so_ok')), iD=D.findIndex(l=>l&&l.text===I.insert.dating.lines[0]), iP=D.findIndex(l=>l&&l.text==='你想去的地方，我不在的時候寫上去。回來我要看。');
    check('4. SENDOFF：非交往版三句在 so_ok／so_wave 那個選項之前；交往版一句在「回來我要看。」之後',iF>0&&iC===iF+3&&iD===iP+1,J({iF,iC,iD,iP}));
    const cnd=(i,G2)=>!!(D[i].if&&D[i].if.custom(G2)); { const G2=fresh('2028-03-25',10); dec(G2,AN,'grad','together',1); G2.flags.AN_GRAD_THINK=true; const a=cnd(iF,G2)&&!cnd(iD,G2); G2.flags.AN_GRAD_THINK='missed'; const b=!cnd(iF,G2); G2.flags.AN_GRAD_THINK=true; H.date(AN); const c=!cnd(iF,G2)&&cnd(iD,G2);
      check('4. 紙條只給演過 ev_an_grad_think 的（missed 的不加）；交往中用交往版那一句',a&&b&&c,J({a,b,c})); }
    /* 芷若送機 */
    const Z=ZRSENDOFF; { const G3=fresh('2027-09-01',20); dec(G3,ZR,'distance','letters',dk('2027-05-01')); at(G3,dk('2027-09-01'),21.05); const c3=Z.cond(G3); run(G3,dk('2027-09-01'),21.05); const L=texts(G3);
      check('4. 芷若 letters：沒有 HOOK_ZR_SENDOFF 也傳 9/1 21:00；第二句「你說要來的。」換成「……你要來嗎？」',c3&&L.includes('明天八點半，第二航廈。')&&L.includes('……你要來嗎？')&&!L.includes('你說要來的。'),J(L));
      const G4=fresh('2027-09-01',20); G4.flags.HOOK_ZR_SENDOFF=1; dec(G4,ZR,'distance','letters',1); run(G4,dk('2027-09-01'),21.05); check('4. 有 HOOK 的照原本「你說要來的。」',texts(G4).includes('你說要來的。'));
      const G5=fresh('2027-09-01',20); dec(G5,ZR,'distance','call',1); check('4. 不是 letters、沒有 HOOK＝照原本不演',!Z.cond(G5)); }
    { const G6=fresh('2027-09-02',8); dec(G6,ZR,'distance','letters',1); G6.flags.ZR_LAST_SHIFT='done'; H.said=[]; H.picks=[0,0]; await EVENTS.run(Z.EVENT); const s=said(), I2=EV('ev_zr_sendoff_airport'), ia=s.indexOf('電影看完，寫的那一句寄這裡。'), il=s.indexOf(I2.insert.lines[0]);
      check('4. 送機那一場：地址那段之後、選項之前三句「第一封。」；ZR_LETTERS＝1',ia>=0&&il>ia&&J(s.slice(il,il+3))===J(I2.insert.lines)&&G6.flags.ZR_LETTERS===1,J(s.slice(ia,il+3)));
      G6.flags.ZR_SENDOFF_2027='met'; at(G6,G6.day,14); G6.zone='dorm'; H.said=[]; await P().sceneTick(GM); const s2=said();
      check('4. 演完以後第一次回到宿舍房間：讀第一封信（{name}換名字、到「芷若」）、只讀一次',J(s2)===J(flat(G6,I2.letter1.text))&&P().r(G6,'zr_letters').l1===G6.day,J(s2));
      H.said=[]; await P().sceneTick(GM); check('4. 第一封只讀一次',H.said.length===0); } });

  /* ---------------- 5 語彤 tell ---------------- */
  await sec(5,async()=>{ const E5=EV('ev_yt_tell_mom'), d=dk('2026-04-25'); const G=fresh('2026-04-25',15,'wz_teahouse'); dec(G,YT,'mom','tell',d-10);
    check('5. 事件 4（第 9 週週日她請假）不演：tell 的玩家週日她照常上班',YTJOB.absentDay(Object.assign({},G,{day:d+1}))===false);
    H.said=[]; H.picks=[1]; await YTJOB.midShift(GM,'tea'); const s=said(); const want=flat(G,E5.live.scene).concat(flat(G,E5.live.opts[1].say));
    check('5. 那天的班（15:00 一盞）：不演 10\'（媽媽站在門口），演她自己泡茶、自己說',J(s)===J(want)&&!s.includes('（門口的風鈴響了。一位穿著套裝的女士站在門口，沒有進來。）'),J(s.slice(0,3)));
    check('5. YT_PARENTS_KNOW told、記憶 YT_TOLD_MOM；之後的班不演「上禮拜那個是我媽」',G.flags.YT_PARENTS_KNOW==='told'&&SOCIAL.has(YT,'YT_TOLD_MOM')&&G.flags.YT_MOM_BACK!=null);
    run(G,d,21.55); check('5. 21:30 三則（取代 10\' 那通）',E5.night.msgs.every(t=>texts(G).includes(t)));
    run(G,d+1,21.05); check('5. 在場的：週日 21:00 那幾則不傳',!E5.phone.msgs.some(t=>texts(G).includes(t)));
    const G2=fresh('2026-04-25',14,'dorm'); dec(G2,YT,'mom','tell',d-10); run(G2,d+1,21.05); const m=ask(G2,'ev_yt_tell_mom');
    check('5. 不在場的：週日 21:00 四則＋三個選項',!!m&&E5.phone.msgs.every(t=>texts(G2).includes(t))&&m.ask.opts.length===3);
    const G3=fresh('2026-04-25',15.2,'wz_teahouse'); dec(G3,YT,'mom','tell',d-10); H.said=[]; H.picks=[0]; await P().sceneTick(GM); check('5. 沒有班、自己走進一盞（15:00～16:00）也演',said()[0]===E5.live.scene[0]);
    const G4=fresh('2026-05-10',15); dec(G4,YT,'mom','tell',dk('2026-04-10')); const B6=HEROINE_ARCS.people[YT].beats[5]; const o=ARCS.resolve(G4,YT,B6);
    check('5. 第 6 拍：lines 換 beat6 三句；ask、選項不變',J(o.lines)===J(E5.beat6.lines)&&J(o.ask)===J(B6.ask)&&o.opts.length===B6.opts.length,J(o.lines));
    const G5=fresh('2026-05-10',15); dec(G5,YT,'mom','found',1); check('5. found 照原本',J(ARCS.resolve(G5,YT,B6).lines)===J(B6.lines)); });

  /* ---------------- 6 區塊的時間 ---------------- */
  await sec(6,async()=>{ /* zr_call */ { const G=fresh('2027-09-07',22); dec(G,ZR,'distance','call',dk('2027-05-01')); const B=DT().zr_call; const got=[];
      for(let d=dk('2027-09-06');d<=dk('2027-09-12');d++){ run(G,d,22.5); got.push([key(d),wd(d),P().r(G,'zr_call').last===d]); }
      const tue=dk('2027-09-07'), m=(G.msgs||[]).find(x=>x.tag==='aa720_zrcall_'+tue);
      check('6. zr_call：2027-09-07 起每週二、週五 22:25 她傳（照順序輪：第一則「現在十點半了嗎？」、第二則「…我剛下課。」）',got.filter(x=>x[2]).map(x=>x[1]).join()==='2,5'&&!!m&&m.h>=22+25/60&&m.h<=22.51&&m.text===B.msgs[0]&&texts(G).includes(B.msgs[1]),J(got));
      const q=OUT.get(G,'aa720_zrcall_'+tue); check('6. 22:30 那通電話（接起來）',!!q&&q.h===22.5&&q.call===true);
      H.said=[]; await goOut(G,'aa720_zrcall_'+tue); check('6. 接起來＝旁白一句（照順序）',J(said())===J([B.callLine[0]]));
      const G2=fresh('2028-02-12',22); dec(G2,ZR,'distance','call',1); run(G2,dk('2028-02-15'),22.5); check('6. 2/11 以後不傳',!P().r(G2,'zr_call').last); }
    /* zr_letters */ { const B=DT().zr_letters; const G=fresh('2027-10-08',14,'cafe'); dec(G,ZR,'distance','letters',dk('2027-05-01')); G.flags.ZR_LETTERS=1; G.flags.ZR_SENDOFF_2027='missed';
      H.said=[]; await P().sceneTick(GM); const s=said();
      check('6. zr_letters：10/8 以後第一次進 Café，店員「有你的信。」；9/2 沒拿到第一封＝店員「她出國前放的。」、第一封、再來 10/8 那一封、旁白',s[0]===B.pickup[1]&&s.includes(AA720.cfg.quotes.zrClerkLeft)&&s.includes(rx(G,EV('ev_zr_sendoff_airport').letter1.text[0]))&&s.includes(B.letters[0].text[0])&&s[s.length-1]===B.after,J(s));
      at(G,dk('2027-11-12'),12); H.said=[]; await P().sceneTick(GM); check('6. 第二封：店員換「又一封。」',said()[0]===B.pickupAlt[1]&&said()[1]===B.letters[1].text[0]);
      check('6. letters 的玩家不寄明信片（Y2B.pcCards 空的）',typeof Y2B!=='undefined'&&Y2B.pcCards(Object.assign({},G,{day:dk('2027-09-25')})).length===0);
      const G2=fresh('2027-10-01',14,'cafe'); dec(G2,ZR,'distance','letters',1); H.said=[]; await P().sceneTick(GM); check('6. 還沒到日期＝沒有',H.said.length===0); }
    /* ps_result（ee689cfb8 起：09:58 兩則、原本照演；細節在第 10 節）*/ { const G=fresh('2027-08-06',9); dec(G,PS,'tell','before',dk('2026-12-10')); H.date(PS); run(G,dk('2027-08-06'),10.02); const B=DT().ps_result;
      check('6. ps_result：2027-08-06 09:58「上了。」「台南。教育系。」（沒有選項）；原本 10:00「你現在在哪？」照傳',B.msgs.every(t=>texts(G).includes(t))&&texts(G).includes('你現在在哪？')&&!ask(G,'ps_result'),J(texts(G))); }
    /* kx_quiet */ { const G=fresh('2027-04-01',20); const d=G.day; dec(G,KX,'after_fail','quiet',d); run(G,d+7,21.5); const a=!ask(G,'kx_quiet'); run(G,d+8,21.05);
      check('6. kx_quiet：決定那天＋8 天 21:00（第 7 天還沒有）',a&&!!ask(G,'kx_quiet')&&DT().kx_quiet.msgs.every(t=>texts(G).includes(t))); }
    /* kx_eat */ { const B=DT().kx_eat; const G=fresh('2027-04-01',18); dec(G,KX,'after_fail','eat',G.day); const m0=G.money=1000; tick(G); const q=OUT.get(G,'aa720_kx_eat');
      check('6. kx_eat：決定那天、現在＋1 小時（19:00）公館麵店',!!q&&q.day===G.day&&q.h===19&&q.place===B.plan.place,J(q));
      await goOut(G,'aa720_kx_eat',[2]); check('6. 那一場：scene（老闆的兩句）→ 選項 → end；KX_EAT、祐廷付三碗',J(said())===J(flat(G,B.scene).concat(flat(G,B.opts[2].say),flat(G,B.end)))&&G.flags.KX_EAT===true&&G.money===m0-P().EAT_COST,J(said().slice(0,3)));
      const G2=fresh('2027-04-01',20.5); dec(G2,KX,'after_fail','eat',G2.day); tick(G2); check('6. 晚上 20:30 決定＝最晚 21:00',(OUT.get(G2,'aa720_kx_eat')||{}).h===21); }
    /* kx_slot */ { const B=DT().kx_slot; const G=fresh('2027-05-01',12); dec(G,KX,'slot','wed',G.day); let wed=G.day+1; while(wd(wed)!==3) wed++; run(G,wed,17.9); const a=!ask(G,'kx_slot_wed'); run(G,wed,18.05); const m=ask(G,'kx_slot_wed');
      check('6. kx_slot wed：每週三 18:00「今天週三。」',a&&!!m&&m.text===B.wed.ask.msgs[0]);
      PHONE.answer(G,m.ask.id,0); const iv=(G.invites||[]).find(x=>x.who===KX&&x.day===wed); check('6. 回「我知道。七點？」＝約好那天 19:00（一般的約）',!!iv&&iv.h===19&&iv.state==='accepted',J(iv));
      const G2=fresh('2027-05-01',12); dec(G2,KX,'slot','wed',G2.day); INV.accept(G2,KX,'cafe',wed-1,15,{by:'player'}); run(G2,wed,18.05); check('6. 那週已經約了她＝不傳',!ask(G2,'kx_slot_wed'));
      const r=INV.personal(G,KX,INV.place('cafe'),wed+7,19.5,{res:'accept'}); check('6. 自己約到那一格：她答應那一句照 accept 輪流',!!r&&J(r.lines)===J([B.wed.accept[0]]),J(r&&r.lines)); }
    /* zq_intern */ { const B=DT().zq_intern; const G=fresh('2026-06-30',20); dec(G,ZQ,'summer','intern',dk('2026-06-10')); run(G,dk('2026-07-01'),22.05); run(G,dk('2026-07-08'),12.7);
      check('6. zq_intern：7/1 22:00「第一天。」、7/8 12:40 午休（兩個選項）',B.summerMsgs[0].msgs.every(t=>texts(G).includes(t))&&!!ask(G,'zq_s1'));
      const zq5=FEED.post('zq5b',G); check('6. 假實習的動態（7/3 騎樓咖啡店、7/17 公司在哪、8/28 實習結束）intern 版不傳',['zq5b','zq6b','zq8b'].every(id=>FEED.blocked(G,FEED.post(id,G),{day:dk('2026-07-03'),h:14})==='aa720')&&FEED.blocked(G,FEED.post('zq7b',G),{day:dk('2026-08-07'),h:23})!=='aa720',J(!!zq5));
      const w5=FEED.post('zq1c',G), j9=FEED.post('zq4c',G); dec(G,ZQ,'level','shop',dk('2026-12-01'));
      check('6. 大二上第 5 週那則：圖換「截圖：第一關的地圖，還是灰色的」、私訊換「第二關呢？」「還沒」「延長實習的錯」；1/9：第二關＋ZQ-2 的畫面、留言「好漂亮。」→「第二關。比第一關難」',w5.pic==='截圖：第一關的地圖，還是灰色的'&&J(w5.dm)===J(['第二關呢？','還沒','延長實習的錯'])&&FEED.post('zq4c',G).pic==='截圖：第二關，一間五金行，鐵門拉起來一半'&&J(FEED.post('zq4c',G).cm)===J(['好漂亮。','第二關。比第一關難']),J([w5.pic,FEED.post('zq4c',G).pic]));
      { const Gj=Object.assign({},G,{day:dk('2026-07-01')}); const iCat=ARC_ROT.rot[ZQ].findIndex(x=>x.if==='ans:ZQ_PL_CAT_CO');
        check('6. life：intern 版第 4、5 階照稿；ZQ_PL_CAT_CO 那一則（「公司叫貓」）照關；life 4 那一則不關了（ee689cfb8：改說 altIntern，第 10 節）',ARCS.lifeState(Gj,ZQ)===B.life.s4.state&&ARCS.rotTier(Gj,ZQ,ARC_ROT.rot[ZQ][iCat])===-1&&ARCS.rotTier(Gj,ZQ,ARC_ROT.rot[ZQ][13])>=0,J({iCat})); }
      const G2=fresh('2026-06-30',20); dec(G2,ZQ,'summer','game',1); check('6. game 照原本（動態、輪換句）',FEED.blocked(G2,FEED.post('zq5b',G2),{day:dk('2026-07-03'),h:14})!=='aa720'&&FEED.post('zq1c',G2).pic==='截圖：第二關的地圖，還是灰色的');
      const G3=fresh('2026-10-16',22); dec(G3,ZQ,'summer','intern',1); run(G3,dk('2026-10-16'),22.2); PHONE.answer(G3,ask(G3,'ev_zq_quit_intern').ask.id,2); run(G3,dk('2026-10-17'),20.05);
      check('6. 辭掉實習：10/16 22:10；回「我今天不行。」＝ZQ_QUIT_SEEN msg、10/17 20:00 前面先加「我辭掉實習了。」',G3.flags.ZQ_QUIT_SEEN==='msg'&&texts(G3).indexOf('我辭掉實習了。')>=0&&texts(G3).indexOf('我辭掉實習了。')<texts(G3).indexOf('我爸知道了。')); }
    /* 學姊考前一晚 */ { const E6=EV('ev_sis_last_night'); const G=fresh('2026-02-01',15); dec(G,SIS,'exam','stay',dk('2026-01-10')); run(G,dk('2026-02-01'),16.05); PHONE.answer(G,ask(G,'ev_sis_last_night').ask.id,1); const q=OUT.get(G,'aa720_ev_sis_last_night');
      check('6. 學姊 stay：2/1 16:00「今天可以坐到閉館嗎。」；回「我帶綠茶。」＝17:00 總圖 3F（late 1 小時）',!!q&&q.h===17&&q.late===1&&texts(G).includes('去冰。'),J(q));
      G.zone='library'; E.player.lv=0; const sayQ=GM.say; GM.say=async(who,t)=>sayQ(who,typeof LIBQ!=='undefined'?LIBQ.whisper(GM,who,t):t);   /* 從總圖 3F 出發（照 game3d.js 的 say）*/
      try{ await goOut(G,'aa720_ev_sis_last_night',[2]); } finally { GM.say=sayQ; }
      check('6. 考前一晚照稿：（小聲）只有 AA 寫的那幾句；出了總圖那幾句不加（從 3F 出發也一樣）',J(said())===J(flat(G,E6.scene).concat(flat(G,E6.opts[2].say),flat(G,E6.end))),J(said().filter(t=>/小聲/.test(t))));
      check('6. 演完時間到閉館（22:00）',Math.abs(G.hour-22)<0.01,String(G.hour)); G.flags.SIS_STUDY=true; run(G,dk('2026-02-02'),17.55);
      check('6. 2/2 17:30「考完了。」「……謝謝你昨天坐到閉館。」取代 alone 那則',E6.after.msgs.every(t=>texts(G).includes(t))&&!texts(G).some(t=>/^我想吃一碗很燙的東西，然後睡十二個小時。?$/.test(t)),J(texts(G).slice(-3))); }
    /* Alison 猜到 */ { const E7=EV('ev_sis_alison_guess'); const G=fresh('2027-11-01',12); const d=G.day; dec(G,SIS,'tell_sis','guess',d); G.flags.KNOWS_SIS_ALISON=true; run(G,d+5,21.9); const a=!ask(G,'ev_sis_alison_guess'); run(G,d+5,22.05); const m=ask(G,'ev_sis_alison_guess');
      check('6. guess＋知道 Alison 是她妹妹：決定＋5 天 22:00 Alison 私訊三則（她的對話串）',a&&!!m&&m.th==='p:yu'&&E7.withKnows.dm.msgs.every(t=>texts(G).includes(t))&&G.flags.SIS_FAMILY_KNOWS==='guess');
      const G2=fresh('2027-11-01',12); dec(G2,SIS,'tell_sis','guess',G2.day); run(G2,G2.day+5,22.05); H.said=[]; await P().sisNextSay(GM,{name:'學姊',charId:SIS},SIS);
      check('6. 還不知道：不傳；下一次和學姊見面她先說「我妹猜到了。」兩句（一次）',!ask(G2,'ev_sis_alison_guess')&&J(said())===J(E7.noKnows.lines)&&!(await P().sisNextSay(GM,{name:'學姊'},SIS))); }
    /* 阿哲被問 */ { const E8=EV('ev_sis_alison_asks_zhe'), ev=STORY_EVENTS.find(e=>e.id==='ev_sis_alison_asks_zhe'); const G=fresh('2027-11-01',21); dec(G,SIS,'tell_sis','zhe',G.day-1); G.flags.KNOWS_SIS_ALISON=true; SOCIAL.remember('zhe','FIRST_MET','');
      const ok=ev.afterActivity==='public_law_group'&&EVENTS.check(ev,{chain:true}); H.said=[]; H.picks=[1]; await EVENTS.run(ev);
      check('6. zhe：讀書會散場（afterActivity public_law_group）；知道的版本 Alison 問阿哲；選「是我叫她這樣說的。」＝zhe_told',ok&&J(said())===J(flat(G,E8.withKnows.scene).concat(flat(G,E8.withKnows.opts[1].say)))&&G.flags.SIS_FAMILY_KNOWS==='zhe_told',J(said().slice(0,2)));
      const G2=fresh('2027-11-01',21); dec(G2,SIS,'tell_sis','zhe',G2.day); SOCIAL.remember('zhe','FIRST_MET',''); check('6. 決定那天當天不演（「決定那天以後」）',!EVENTS.check(ev,{chain:true})); }
    /* 奶奶家 */ { const G=fresh('2027-11-03',12); const d=G.day; dec(G,SIS,'tell_sis','wait',d); H.date(SIS); const sun=[]; let x=d; for(let i=0;i<3;i++){ x++; while(wd(x)!==0) x++; } const fri=x-2;
      run(G,fri,20.9); const a=!ask(G,'ev_sis_grandma_dinner'); run(G,fri,21.05); const m=ask(G,'ev_sis_grandma_dinner');
      check('6. wait＋交往中：決定那天以後第三個週日、週五 21:00 她問',a&&!!m&&wd(fri)===5);
      PHONE.answer(G,m.ask.id,2); const q=OUT.get(G,'aa720_ev_sis_grandma_dinner'); check('6. 回「下次可以嗎？」＝下一週的週日 18:00',!!q&&q.day===x+7&&q.h===18,J(q));
      const G2=fresh('2027-11-03',12); dec(G2,SIS,'tell_sis','wait',G2.day); run(G2,fri,21.05); check('6. 沒交往＝不問',!ask(G2,'ev_sis_grandma_dinner')); }
    /* 可昕等了一個小時 */ { const E9=EV('ev_kx_waited'); const G=fresh('2027-01-05',12); dec(G,KX,'slot','show',G.day); const d=P().kxWaitDay(G), T2=CALENDAR.termOf(d);
      check('6. show：決定那天的下一個學期第 3 週週六',wd(d)===6&&!!T2&&T2.week===3&&T2.id==='Y2S2',J({k:key(d),t:T2}));
      run(G,d,10.05); const q=OUT.get(G,'aa720_kx_waited'); check('6. 那週六 10:00「今天下午四點，公館捷運站。」、排 16:00（16:15 以前）',texts(G).includes(E9.ask.msgs[0])&&!!q&&q.h===16&&q.late===0.25);
      at(G,d,16.3); OUT.tick(GM); run(G,d,17.05); const m=ask(G,'ev_kx_waited'); check('6. 16:15 沒到：17:00「我等了一個小時。」兩則＋三個選項',!!m&&E9.late.msgs.every(t=>texts(G).includes(t))&&m.ask.opts.length===3);
      PHONE.answer(G,m.ask.id,0); await goOut(G,'aa720_kx_waited_late',[1]); check('6. 「我現在過去」＝現在＋20 分鐘、到了演那一場；選「排一個固定的時間」＝KX_SLOT_LATE sat；KX_WAITED late',J(said())===J(flat(G,E9.scene.lines).concat(flat(G,E9.scene.opts[1].say)))&&G.flags.KX_SLOT_LATE==='sat'&&G.flags.KX_WAITED==='late'&&P().slotOf(G)==='sat',J(said().slice(0,2)));
      const G2=fresh('2027-01-05',12); dec(G2,KX,'slot','show',G2.day); INV.accept(G2,KX,'cafe',d-3,15,{by:'player'}); G2.invites[G2.invites.length-1].state='done'; run(G2,d,10.05); check('6. 那一週約過她＝不演、KX_WAITED skip',G2.flags.KX_WAITED==='skip'&&!OUT.get(G2,'aa720_kx_waited'));
      H.said=[]; at(G2,d+1,15); await P().kxShownSay(GM,{name:'可昕',charId:KX},KX); check('6. skip：下一次見面她多一句「這週你有出現。」',J(said())===J(['這週你有出現。']));
      const G3=fresh('2027-01-05',12); dec(G3,KX,'slot','show',G3.day); run(G3,d,10.05); at(G3,d,16.3); OUT.tick(GM); run(G3,d,17.05); run(G3,d,19.05); check('6. 一直沒回＝19:00「算了。」、信任 −3、KX_WAITED nothing',texts(G3).includes('算了。')&&G3.flags.KX_WAITED==='nothing'); } });

  /* ---------------- 6b 沛珊兩場、語彤放榜 ---------------- */
  await sec('6b',async()=>{ const EB=EV('ev_ps_before_leave'), ES=EV('ev_ps_station_sendoff'); const G=fresh('2026-12-17',20); dec(G,PS,'tell','before',dk('2026-12-01')); H.date(PS); run(G,dk('2026-12-17'),20.55); const m=ask(G,'ev_ps_before_leave');
    check('6b. 沛珊 before（交往中）：12/17 20:30「你可以來課輔班門口嗎？」；回「今天很晚了，明天可以嗎？」也排 21:00',!!m&&EB.invite.msgs.every(t=>texts(G).includes(t)));
    PHONE.answer(G,m.ask.id,2); const q=OUT.get(G,'aa720_ev_ps_before_leave'); await goOut(G,'aa720_ev_ps_before_leave',[0]);
    check('6b. 課輔班門口那一場；選「我明天去車站送妳。」＝排 12/18 09:40 臺北車站（不再問）；PS_TOLD_BEFORE',!!q&&q.h===21&&J(said())===J(flat(G,EB.scene).concat(flat(G,EB.opts[0].say),flat(G,EB.end)))&&G.flags.PS_TOLD_BEFORE===true&&(OUT.get(G,'aa720_ev_ps_station_sendoff')||{}).day===dk('2026-12-18'),J(OUT.get(G,'aa720_ev_ps_station_sendoff')));
    run(G,dk('2026-12-17'),23.05); check('6b. 選了車站的：23:00 那兩則不傳',!ask(G,'ev_ps_station_sendoff'));
    await goOut(G,'aa720_ev_ps_station_sendoff',[2]); check('6b. 臺北車站那一場；PS_STATION went',G.flags.PS_STATION==='went'&&J(said())===J(flat(G,ES.scene).concat(flat(G,ES.opts[2].say))));
    const G2=fresh('2026-12-17',20); dec(G2,PS,'tell','before',dk('2026-12-01')); H.date(PS); run(G2,dk('2026-12-17'),20.55); PHONE.answer(G2,ask(G2,'ev_ps_before_leave').ask.id,0); at(G2,dk('2026-12-17'),21.6); OUT.tick(GM); run(G2,dk('2026-12-17'),23.05); const m2=ask(G2,'ev_ps_station_sendoff');
    check('6b. 答應了沒到：21:30、23:00、23:01 三則；23:00 再問車站（「明天十點的高鐵。」兩則＋兩個選項）',['沒關係～','我明天回台中。要休學重考。','……本來想當面說的。'].every(t=>texts(G2).includes(t))&&!!m2&&m2.ask.opts.length===2,J(texts(G2).slice(-6)));
    const G3=fresh('2026-12-17',20); dec(G3,PS,'tell','before',dk('2026-12-01')); run(G3,dk('2026-12-17'),20.55); check('6b. 沒交往（舊存檔有 before 也一樣）＝PS-2 規則本來就不會給；這裡照決定演',!!ask(G3,'ev_ps_before_leave'));
    const EY=EV('ev_yt_result_together'); const G4=fresh('2026-07-02',20); dec(G4,YT,'dm','with',dk('2026-06-20')); run(G4,dk('2026-07-02'),21.05); PHONE.answer(G4,ask(G4,'ev_yt_result_together').ask.id,0); const q4=OUT.get(G4,'aa720_ev_yt_result_together');
    dec(G4,YT,'mom','tell',dk('2026-04-01')); await goOut(G4,'aa720_ev_yt_result_together',[2]);
    check('6b. 語彤 with：7/2 21:00、7/3 13:50 總圖門口；「要不要打給妳媽？」mom=tell＝alt 那一版（「這次也是。」）；YT_DM_RESULT with',!!q4&&q4.day===dk('2026-07-03')&&Math.abs(q4.h-(13+50/60))<1e-6&&said().includes(EY.opts[2].alt.say[1])&&G4.flags.YT_DM_RESULT==='with',J(said().slice(-3)));
    { const q=FEED.dmOf('yt_pass').q; const a=FEED.dmBlocked(G4,q); const G5=fresh('2026-07-03',20); dec(G5,YT,'dm','alone',1); const b=FEED.dmBlocked(G5,q);
      check('6b. with：原本 7/3 那則私訊（feed yt_pass「上了。」「雙主修。」）不傳；alone 照傳',a==='aa720'&&b!=='aa720',J([a,b])); }
    const G6=fresh('2026-07-02',20); dec(G6,YT,'dm','with',dk('2026-06-20')); run(G6,dk('2026-07-02'),21.05); PHONE.answer(G6,ask(G6,'ev_yt_result_together').ask.id,1); at(G6,dk('2026-07-03'),14.2); OUT.tick(GM); at(G6,dk('2026-07-03'),14.4); PHONE.tick(G6);
    check('6b. 答應了沒到：14:20「上了。」「雙主修。」、YT_DM_RESULT alone（原本那則照貼）',G6.flags.YT_DM_RESULT==='alone'&&texts(G6).includes('上了。')&&texts(G6).includes('雙主修。'),J(texts(G6).slice(-2))); });

  /* ---------------- 6c 芷若 tell（滷肉的作法）、E07 ---------------- */
  await sec('6c',async()=>{ const V=EV('ev_zr_call_mom').variants.tell; const G=fresh('2027-03-20',15,'cafe'); dec(G,ZR,'fund','tell',dk('2027-03-01')); G.flags.DECIDE_SAY=[{who:ZR,key:'fund',due:dk('2027-03-05'),say:['我想了想，還是打了。'],played:dk('2027-03-06')}];
    const C0=EVENTS.npcOf; EVENTS.npcOf=id=>id===ZR?{staff:'cafe'}:(C0?C0(id):null); at(G,dk('2027-03-15'),15); H.said=[]; await P().sceneTick(GM); const a=H.said.length===0;
    at(G,dk('2027-03-16'),15); H.picks=[1]; H.said=[]; await P().sceneTick(GM); const s=said(); EVENTS.npcOf=C0;
    check('6c. 芷若 tell：say 那天＋10 天起、進 Café 她在班：演滷肉的作法（之前不演）；ZR_RECIPE',a&&J(s)===J(flat(G,V.scene).concat(flat(G,V.opts[1].say)))&&G.flags.ZR_RECIPE===true,J(s.slice(0,2)));
    H.said=[]; await P().sceneTick(GM); check('6c. 只演一次',H.said.length===0);
    const G2=fresh('2027-11-01',21); dec(G2,ZR,'distance','call',1); P().r(G2,'zr_call').calls=2; const L=ZRUK.monthLines(G2,G2.day), L2=ZRUK.monthLines(G2,G2.day);
    check('6c. E07（每月的視訊）：電話講過兩次以上＝開頭之後多一句（一次）',Array.isArray(L)&&L[1]&&L[1].text===AA720.cfg.quotes.zrCallE07&&!L2.some(x=>x&&x.text===AA720.cfg.quotes.zrCallE07),J(L&&L.slice(0,2))); });

  /* ---------------- 7 沛珊 ruleIf ---------------- */
  await sec(7,async()=>{ const K=DECIDE.byKey(PS,'tell'); const G=fresh('2026-12-10',15); dec(G,PS,'future','seen',G.day-30); const R=SOCIAL.rel(PS); R.trust=80; const DS=DATE.stageNum; DATE.stageNum=()=>4; const sup=K.opts.find(o=>o.stance==='support').i;
    const a=DECIDE.pickRule(G,K,sup).r; H.date(PS); const b=DECIDE.pickRule(G,K,sup).r; DATE.stageNum=DS;
    check('7. PS-2 before：future=seen＋support＋信任高，沒交往＝after（沒有符合＝default）；交往中＝before',(!a||a.result==='after')&&!!b&&b.result==='before',J({a:a&&a.result,b:b&&b.result}));
    check('7. 規則表：第一條的 if＝[future=seen, dating]',J(K.rules[0].if)===J(['dec:classmate_peishan.future=seen','dating'])); });

  /* ---------------- 8 尾聲 ---------------- */
  await sec(8,async()=>{ const EN=DT().endings, base=(G,id)=>{ const save=PG.epiLine; return save; };
    const ep=(G,id)=>PG.epiLine(G,id)||[], extra=(G,id)=>{ const L=ep(G,id); return L.slice(-2).map(x=>x[1]); };
    const G=fresh('2034-06-03',19); const b0=ep(G,AN).length; dec(G,AN,'grad','together',100); dec(G,AN,'jp_tell','first',50); const L1=ep(G,AN);
    check('8. 以安 friend：together 和 first 都有＝只取第一個（商法紙條）一句，接在原本的後面',L1.length===b0+1&&L1[L1.length-1][1]===EN.heroine_01.friend[0].line&&L1[L1.length-1][0]===AN,J(L1));
    const G2=fresh('2034-06-03',19); dec(G2,AN,'jp_tell','first',50); dec(G2,AN,'grad','alone',100,{late:true}); check('8. late 不算（往下找到 first）',ep(G2,AN).slice(-1)[0][1]===EN.heroine_01.friend[2].line);
    const G3=fresh('2034-06-03',19); const n3=ep(G3,AN).length; check('8. 都不符合（沒演到、舊存檔）＝照原本',J(ep(G3,AN))===J(PG.epiLine(G3,AN))&&!ep(G3,AN).some(x=>EN.heroine_01.friend.some(f=>f.line===x[1])),String(n3));
    const G4=fresh('2034-06-03',19); H.date(AN); dec(G4,AN,'grad','alone',100); G4.flags.CONF_FAIL={[AN]:{day:10,cnt:1,done:20}}; const L4=ep(G4,AN);
    check('8. 以安 partner（交往中）：alone 那句；第一次告白失敗過＝partner 那句之後再加 confFail',L4[L4.length-2][1]===EN.heroine_01.partner[1].line&&L4[L4.length-1][1]===EN.heroine_01.confFail,J(L4.slice(-2)));
    const G5=fresh('2034-06-03',19); dec(G5,ZR,'fund','both',100); check('8. 芷若 friend：「fund=tell 或 both」兩個都認',ep(G5,ZR).slice(-1)[0][1]===EN.heroine_02.friend[3].line);
    const G6=fresh('2034-06-03',19); H.date(ZR); dec(G6,ZR,'distance','call',100); const L6=ep(G6,ZR); check('8. 芷若 partner：加的那句寫成 [heroine_02, 字]',J(L6[L6.length-1])===J([ZR,EN.heroine_02.partner[1].line]),J(L6.slice(-1)));
    const G7=fresh('2034-06-03',19); H.date(SIS); dec(G7,SIS,'tell_sis','guess',100); dec(G7,SIS,'exam','stay',50); const L7=ep(G7,SIS).slice(-1)[0][1]; G7.flags.KNOWS_SIS_ALISON=true; const L7b=ep(G7,SIS).slice(-1)[0][1];
    check('8. 學姊 partner guess：沒有 KNOWS_SIS_ALISON＝跳過、往下找（exam=stay）；有＝Alison 那句',L7===EN.heroine_05.partner[3].line&&L7b===EN.heroine_05.partner[1].line,J([L7,L7b]));
    const G8=fresh('2034-06-03',19); H.date(KX); dec(G8,KX,'slot','show',100); G8.flags.KX_WAITED='came'; const a8=ep(G8,KX).some(x=>x[1]===EN.kexin.partner[2].line); G8.flags.KX_WAITED='late'; const b8=ep(G8,KX).slice(-1)[0][1]===EN.kexin.partner[2].line;
    check('8. 可昕 partner：「slot=show 而且 KX_WAITED＝late」兩個條件都要',!a8&&b8);
    const G9=fresh('2034-06-03',19); G9.flags.PS_REUNION=dk('2028-12-29'); G9.msgs.push({th:'p:'+PS,from:'player',text:'在嗎',day:dk('2027-02-01'),h:21}); const L9=ep(G9,PS); G9.msgs=[]; const L9b=ep(G9,PS);
    check('8. 沛珊 friend：PS_REUNION 有值、而且沉默期傳過私訊＝那句；沒傳過＝照原本',L9.slice(-1)[0][1]===EN.classmate_peishan.friend[0].line&&!L9b.some(x=>x[1]===EN.classmate_peishan.friend[0].line));
    const G10=fresh('2034-06-03',19); dec(G10,KX,'slot','sat',100); check('8. 可昕沒交往＝不在那一桌（epiLine null，不加）',PG.epiLine(G10,KX)==null); });

  /* ---------------- 9 quietMove ---------------- */
  await sec(9,async()=>{ const M=DT().quietMove.sis_beat6, B6=HEROINE_ARCS.people[SIS].beats[5], K=DECIDE.byKey(SIS,'exam');
    const sayQ=GM.say; GM.say=async(who,t)=>{ const x=typeof LIBQ!=='undefined'?LIBQ.whisper(GM,who,t):t; return sayQ(who,x); };   /* 照 game3d.js 的 say：讀書區小聲講 */
    const play=async(k,zone,quiet,picks)=>{ const G=fresh(k,15,zone); G.flags.LIBQ_OK=1; const r=ARCS.rec(G,SIS); r.k=6; r.last=null; const R=SOCIAL.rel(SIS); R.trust=80; const DS=DATE.stageNum; DATE.stageNum=()=>4; E.player.lv=0; E.player.obj.position.x=0; E.player.obj.position.z=0;
      if(typeof LIBQ!=='undefined'&&LIBQ.mark) LIBQ.mark(G,SIS); const b=ARCS.pick(G,SIS,{kind:'study',quiet}); H.said=[]; H.picks=picks.slice(); if(b) await ARCS.run(GM,{name:'學姊',charId:SIS},SIS,b); DATE.stageNum=DS; return {G,b,s:said()}; };
    const sup=K.opts.find(o=>o.stance==='support').i;
    { const {G,b,s}=await play('2026-01-27','library',true,[sup,0]); const o=B6.opts[sup];
      const want=M.open.concat([M.replaceFirst.to],B6.lines.slice(1),B6.ask,[rx(G,o.t)],o.reply.map(t=>rx(G,t)),M.close);   /* 選完先說祐廷選的那一句（ROM-PRIVATE-DATE-1110，使用者 11-10「沒顯示我說什麼」）*/
      check('9. 平日 1/27 總圖安靜區：第 6 拍照 quietMove 演（open 兩句 → 樓梯間那一句 → 原稿第 2 句起、ask、reply → close）',!!b&&b.quietMove&&J(s)===J(want),J(s));
      { const c0=LIBQ.whisper(GM,{name:'學姊',charId:SIS},'對不起，不是對你。'); check('9. （對照）同一個地方、不是樓梯間：她的一句會加（小聲）',/^（小聲）/.test(c0),c0); }
      check('9. 樓梯間那幾句不加（小聲）',!s.some(t=>/小聲/.test(t)&&!/^（小聲）/.test(M.open.join('')))&&s.includes('對不起，不是對你。'),J(s.filter(t=>/小聲/.test(t))));
      check('9. SIS-1 照記（不是 late）：support＋信任高＝stay',DECIDE.get(G,SIS,'exam')==='stay'&&!G.flags.DECIDE[SIS].exam.late,J(G.flags.DECIDE[SIS])); }
    /* 樓梯間還沒有 2D 背景（BB-B 11-08 04:13 SIS1 小事 1）：open 兩句還在原本的底，樓梯間那一句到 close 是深色底，回座位換回原本的 */
    { const A0={active:ADV.active,setBg:ADV.setBg,bgMode:ADV.bgMode}; const seq=[]; let cur='blur'; ADV.active=true; ADV.bgMode='blur'; ADV.setBg=function(m){ cur=m; this.bgMode=m; };
      const sayB=GM.say; GM.say=async(who,t)=>{ seq.push([t,cur]); return sayB(who,t); };
      try{ const {s}=await play('2026-01-27','library',true,[sup,0]); const bgOf=t=>(seq.find(x=>x[0]===t||x[0]==='（小聲）'+t)||[])[1];
        check('9. 樓梯間那一段換深色底：open 兩句＝原本的底（blur）、「樓梯間的門一關上…」到 close＝dark、演完換回 blur',bgOf(M.open[0])==='blur'&&bgOf(M.open[1])==='blur'&&bgOf(M.replaceFirst.to)==='dark'&&M.close.every(t=>bgOf(t)==='dark')&&cur==='blur'&&ADV.bgMode==='blur',J({seq:seq.map(x=>[x[0].slice(0,10),x[1]]),cur})); }
      finally{ GM.say=sayB; ADV.active=A0.active; ADV.setBg=A0.setBg; ADV.bgMode=A0.bgMode; } }
    { const {G,b,s}=await play('2026-01-31','l118_cafe2',false,[sup,0]); check('9. 週末慢讀（不是安靜區）：照原本第一句「（她把筆摔在桌上，筆滾到地上。）」、沒有 open／close',!!b&&!b.quietMove&&s[0]===B6.lines[0]&&!s.includes(M.close[0])&&DECIDE.get(G,SIS,'exam')==='stay',J(s.slice(0,2))); }
    { const {G,b}=await play('2026-02-05','library',true,[sup,0]); check('9. 1/31 以後才演到：照演，SIS-1 記 late（alone）',!!b&&DECIDE.get(G,SIS,'exam')==='alone'&&G.flags.DECIDE[SIS].exam.late===true,J(G.flags.DECIDE[SIS])); }
    { const G=fresh('2026-01-27',15,'library'); const r=ARCS.rec(G,SIS); r.k=8; r.last=null; const DS=DATE.stageNum; DATE.stageNum=()=>4; const b=ARCS.pick(G,SIS,{kind:'study',quiet:true}); DATE.stageNum=DS; check('9. 別的 quietOk:false 的拍（學姊第 8 拍）在安靜區照舊不演',b==null); }
    GM.say=sayQ; });
  /* ---------------- 10 wiringAnswers（ee689cfb8）---------------- */
  const SHA717='e622a59148';   /* 2026-11-13（CANON-NO-ECON-1112 收尾，AA_932 §1 可昕輪換句七則）：白名單 033b5150a → e622a59148；子晴第 13～15 則兩版一樣（舊期望 033b5150a，現在進 history，下面第 10 項也驗）*/
  let RAW=null; try{ RAW=JSON.parse(cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26})); }catch(e){ RAW=null; }
  let R719=null; try{ R719=JSON.parse(cp.execFileSync('git',['show','963afea74:docs/story_planning/AA_719_decide_rules.json'],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26})); }catch(e){ R719=null; }
  let R717=null; try{ R717=JSON.parse(cp.execFileSync('git',['show',SHA717+':docs/story_planning/AA_717_rot_life.json'],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26})); }catch(e){ R717=null; }
  const WA=RAW&&RAW.wiringAnswers||{};   /* AA_717 是 033b5150a（ee689cfb8 的子晴 rot 13～15＋芷若 life 第 5 階 state 改字）*/
  const tagT=(G,tag)=>(G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.text);
  await sec(10,async()=>{ const B=DT().ps_result, d=dk('2027-08-06'), H58=9+58/60;
    /* 10a ps_result：09:58 → 10:00 → 10:02 → 12:00 */
    { const G=fresh('2027-08-06',9); dec(G,PS,'tell','before',dk('2026-12-10')); H.date(PS);
      run(G,d,9.9); const a=!B.msgs.some(t=>texts(G).includes(t));
      run(G,d,H58+0.002); const m1=G.msgs.filter(x=>B.msgs.includes(x.text));
      check('10. ps_result：09:58 以前沒有；09:58「上了。」「台南。教育系。」（照稿、照順序；不用回＝沒有選項）；10:00 那則還沒到',a&&J(m1.map(x=>x.text))===J(B.msgs)&&J(B.msgs)===J(['上了。','台南。教育系。'])&&m1.every(x=>!x.ask&&Math.abs(x.h-H58)<0.01&&x.th==='p:'+PS)&&!texts(G).includes(PSR.LINES.where),J(m1));
      run(G,d,10.01); const w=G.msgs.find(x=>x.text===PSR.LINES.where);
      check('10. 10:00 原本那則「你現在在哪？」照傳（兩個回覆選項照舊）、在那兩則後面',!!w&&!!w.ask&&w.ask.opts.length===2&&G.msgs.indexOf(w)>G.msgs.indexOf(m1[1]),J(w&&w.ask));
      PHONE.answer(G,w.ask.id,0); run(G,d,10.05); const bus=G.msgs.find(x=>x.text===PSR.LINES.bus);
      check('10. 10:02 客運兩則照傳（在「你現在在哪？」後面）',!!bus&&G.msgs.indexOf(bus)>G.msgs.indexOf(w)&&texts(G).includes(PSR.LINES.steps),J(texts(G).slice(-3)));
      const q=OUT.get(G,'ps_results'); check('10. 12:00 總圖外面的台階那一場照排（psresults3d.js）',!!q&&q.day===d&&q.h===12&&q.ev==='ev_peishan_results',J(q));
      check('10. 4f37a68bb 的「……我可以打給你嗎？」、三個選項、選項 3 的灰字旁白都沒有；原本 10:00 那則不再記成傳過（cut）',!texts(G).includes('……我可以打給你嗎？')&&!texts(G).some(t=>/晚上九點，她又傳了一次/.test(t))&&!ask(G,'ps_result')&&!(PHONE.rec(G).cut||[]).includes('ps_results_where')&&!B.opts&&!G.msgs.some(m=>m.narr&&m.th==='p:'+PS),J(texts(G)));
      check('10. 稿（wiringAnswers 2）：ps_result.at 09:58、rule「只加這兩則」',/^2027-08-06 09:58/.test(B.at)&&/^只加這兩則（不用回、沒有選項）/.test(B.rule)&&/ps_result/.test(WA['2']||''),J([B.at,WA['2']])); }
    { const G=fresh('2027-08-06',9); dec(G,PS,'tell','before',dk('2026-12-10')); run(G,d,10.05); check('10. 沒交往（psresults3d.js 那一版沒有）＝09:58 也不傳',!B.msgs.some(t=>texts(G).includes(t))); }
    { const G=fresh('2027-08-06',9); dec(G,PS,'tell','after',dk('2026-12-10')); H.date(PS); run(G,d,10.05); check('10. after 的玩家＝不傳兩則、10:00 照原本',!B.msgs.some(t=>texts(G).includes(t))&&texts(G).includes(PSR.LINES.where)); }
    { const G=fresh('2027-08-06',7); dec(G,PS,'tell','before',dk('2026-12-10')); H.date(PS); run(G,d,10.01); const L=G.msgs.filter(x=>x.th==='p:'+PS).map(x=>x.text);
      check('10. 睡過 09:58（10:00 才醒）：兩則還是在「你現在在哪？」前面',J(L.slice(0,3))===J(B.msgs.concat([PSR.LINES.where])),J(L)); }

    /* 10b 交往中＋信：第四封多一句、12/25 視訊照舊 */
    { const ZB=DT().zr_letters, add=AA720.cfg.quotes.zrLetter4Video;
      const mk=(date,dating)=>{ const G=fresh(date,14,'cafe'); dec(G,ZR,'distance','letters',dk('2027-05-01')); G.flags.ZR_LETTERS=1; G.flags.ZR_SENDOFF_2027='met'; if(dating) H.date(ZR); const r=P().r(G,'zr_letters'); r.l1=dk('2027-09-02'); return {G,r}; };
      check('10. 稿（wiringAnswers 6）：「二十五號晚上視訊。時間寫在這裡，你不要忘記。」逐字',add==='二十五號晚上視訊。時間寫在這裡，你不要忘記。'&&String(WA['6']||'').includes('「'+add+'」'),J(WA['6']));
      { const {G,r}=mk('2027-12-10',true); r.n=2; H.said=[]; await P().sceneTick(GM); const s=said();
        check('10. 交往中＋信：第四封（12/10，第一封是送機那一封）最後多一句、接旁白',J(s.slice(1))===J(ZB.letters[2].text.map(t=>rx(G,t)).concat([add,ZB.after]))&&P().r(G,'zr_letters').xmas===G.day,J(s));
        const q=OUT.get(G,'y3_zr_xmas_video'); check('10. 12/25 20:00 視訊照排（同明信片那一版：ev_zhiruo_xmas_video、倫敦中午 12:00）',!!q&&q.day===dk('2027-12-25')&&q.h===20&&q.ev==='ev_zhiruo_xmas_video'&&q.state==='planned',J(q));
        check('10. 明信片照樣不寄（12/17 那張沒有）',Y2B.pcCards(Object.assign({},G,{day:dk('2027-12-18')})).length===0); }
      { const {G,r}=mk('2027-12-10',false); r.n=2; H.said=[]; await P().sceneTick(GM); const s=said(); check('10. 沒交往：第四封照原本、沒有視訊',!s.includes(add)&&s[s.length-1]===ZB.after&&!OUT.get(G,'y3_zr_xmas_video'),J(s.slice(-2))); }
      { const {G,r}=mk('2027-11-12',true); r.n=1; H.said=[]; await P().sceneTick(GM); check('10. 交往中的第三封（11/12）不加',!said().includes(add)&&!OUT.get(G,'y3_zr_xmas_video')); }
      { const {G,r}=mk('2028-01-14',true); r.n=2; H.said=[]; await P().sceneTick(GM); check('10. 12/25 過了才去拿第四封：那一句照信上寫的，視訊不排（已經過了）',said().includes(add)&&!OUT.get(G,'y3_zr_xmas_video')); }
      { const G=fresh('2027-12-17',13,'dorm'); dec(G,ZR,'distance','call',1); H.date(ZR); H.FRIEND(ZR); const c=Y2B.pcCards(G).find(x=>x.key==='2027-12-17'); check('10. 不是 letters 的交往中：12/17 那張照舊（背面那一行）',!!c&&c.ver==='gf'&&Y2B.pcLines(G,c).includes('12/25，台灣晚上八點。打給我。')); } }

    /* 10c AA_719 after 的句子 */
    { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_decide_rules.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
      const AQ=DECIDE_RULES.afterQ||{}, by={}; for(const k of (R719&&R719.keys)||[]) by[k.id]=k;
      const W={anExpoFirst:['AN-1','first'],anPlane:['AN-2','alone'],zrScholarHalf:['ZR-1','scholar'],zqTbShop:['ZQ-2','all'],zqTbTainan:['ZQ-2','all']};
      check('10. AA_719 after 的五句：decide_rules.js afterQ 和 963afea74 一致（import_decide_rules.py --check），每一句都在那一個 after 裡（「」逐字）',ok&&Object.keys(W).every(k=>AQ[k]&&String(((by[W[k][0]]||{}).after||{})[W[k][1]]||'').includes('「'+AQ[k]+'」'))&&/AA_719 的 after／closes 句/.test(WA.afterLines||''),out.trim().slice(0,160)); }
    { const src=fs.readFileSync(path.join(H.ROOT,'src/aa555_3d.js'),'utf8'); const tagOk=src.includes("['y2s2_an_expo',AN,")&&src.includes("'a118_'+id+'_'+j"); const orig='說明會的資料四十頁，我讀完了。有三頁是同一頁印兩次。';
      const one=(v,exp)=>{ const G=fresh('2027-03-25',20); dec(G,AN,'jp_tell',v,dk('2026-04-20')); if(exp) G.flags.AN_EXPO=exp; PHONE.at(G,G.day,21,[{th:'p:'+AN,from:AN,text:orig}],'a118_y2s2_an_expo_0'); run(G,G.day,21.05); return tagT(G,'a118_y2s2_an_expo_0'); };
      const a=one('first','went'), b=one('first','missed'), c=one('first','declined'), e=one('later',null);
      check('10. 以安 AN-1 first＋說明會有去：aa555 y2s2_an_expo 那則換成「…你那天坐我旁邊，第三頁的時候睡著了。」',tagOk&&J(a)===J([DECIDE_RULES.afterQ.anExpoFirst]),J(a));
      check('10. missed／declined／later：那則照原本',J(b)===J([orig])&&J(c)===J([orig])&&J(e)===J([orig]),J([b,c,e])); }
    { const one=v=>{ const G=fresh('2028-03-25',11.5); if(v) dec(G,AN,'grad',v,dk('2027-10-01')); run(G,dk('2028-03-25'),11.75); return tagT(G,'y3_an_sendoff_miss'); };
      const a=one('alone'), b=one('together'), c=one(null);
      check('10. 以安 AN-2 alone：出國那天（3/25，沒去送機）只有一則「我上飛機了。」',J(a)===J([DECIDE_RULES.afterQ.anPlane]),J(a));
      check('10. together、沒決定：11:40 登機證那三則照原本',J(b)===J(['（照片：登機證）','要登機了。','到了再傳。'])&&J(c)===J(b),J([b,c])); }
    { const one=v=>{ const G=fresh('2027-05-11',22); H.date(ZR); if(v) dec(G,ZR,'fund',v,dk('2027-03-01')); run(G,dk('2027-05-11'),22.7); return G.msgs.filter(m=>m.tag==='y2r2_zr_admit'); };
      const a=one('scholar'), b=one('both'), c=one('tell');
      check('10. 芷若 ZR-1 scholar（交往中 5/11 22:40 錄取那則）：「……錄取了。」後面多一句「獎學金拿到一半。」、最後一則照樣可以回（打給她）',J(a.map(m=>m.text))===J(['信來了。','……錄取了。',DECIDE_RULES.afterQ.zrScholarHalf,'我現在不想打字。你可以打給我嗎。'])&&!!a[3].ask&&!a[2].ask,J(a.map(m=>m.text)));
      check('10. both 也多那一句（兩個都有）；tell 照原本三則',J(b.map(m=>m.text))===J(a.map(m=>m.text))&&J(c.map(m=>m.text))===J(['信來了。','……錄取了。','我現在不想打字。你可以打給我嗎。']),J(c.map(m=>m.text))); }
    { const one=async v=>{ const G=fresh('2028-03-08',12.2,'library'); if(v) dec(G,ZQ,'level',v,dk('2028-02-20')); H.said=[]; H.picks=['第一關好難']; await EVENTS.run(ZQTB.EVENT); return said(); };
      const s1=await one('shop'), s2=await one('tainan'), s3=await one('cat'), s4=await one(null), i=s1.indexOf('你坐。用我的筆電，玩第一關就好。');
      check('10. 子晴 ZQ-2 測試版那一場（2028-03-08）：shop＝「你說的五金行，我放在第二關的角落。不是因為你說的。」（在第一關的畫面之後、選項之前）',s1.includes(DECIDE_RULES.afterQ.zqTbShop)&&s1.indexOf(DECIDE_RULES.afterQ.zqTbShop)>i&&s1.indexOf(DECIDE_RULES.afterQ.zqTbShop)<s1.indexOf('欸不是，你才玩兩分鐘。'),J(s1.slice(0,5)));
      check('10. tainan＝「第二關有一條巷子。我沒去過台南，照你說的畫。」；cat、沒決定＝原本（沒有那一句）',s2.includes(DECIDE_RULES.afterQ.zqTbTainan)&&!s2.includes(DECIDE_RULES.afterQ.zqTbShop)&&J(s3)===J(s4)&&!s3.includes(DECIDE_RULES.afterQ.zqTbShop)&&!s3.includes(DECIDE_RULES.afterQ.zqTbTainan)&&s3.length===s1.length-1,J([s2.length,s3.length,s1.length])); }

    /* 10d 可昕等了一個小時以後兩天：她回訊息只回一句（六句輪流，用完從頭）；第三天起照常 */
    { const KA=DT().kx_waited_after.lines; check('10. 稿：kx_waited_after 六句照稿（嗯。／好。／知道了。／……嗯。／再說。／喔。）',J(KA)===J(['嗯。','好。','知道了。','……嗯。','再說。','喔。'])&&!!RAW&&J(RAW.kx_waited_after.lines)===J(KA),J(KA));
      const setup=(pick)=>{ const G=fresh('2027-01-05',12); dec(G,KX,'slot','show',G.day); H.date(KX); const d=P().kxWaitDay(G); run(G,d,10.05); at(G,d,16.3); OUT.tick(GM); run(G,d,17.05); if(pick!=null) PHONE.answer(G,ask(G,'ev_kx_waited').ask.id,pick); else run(G,d,19.05); return {G,d}; };
      const send=(G,dd,hh)=>{ at(G,dd,hh); const tp=(MSG.topics(G,KX)[0]||{}).k; const r=MSG.send(G,KX,tp); return r; };
      { const {G,d}=setup(1); const got=[[d,21],[d+1,15],[d+2,15],[d+3,15]].map(([dd,hh])=>send(G,dd,hh));
        const q=PHONE.rec(G).q.filter(x=>x.items.some(it=>it.from===KX)).map(x=>x.items.map(it=>it.text));
        check('10. 「我忘了。對不起。」（KX_WAITED nothing）：那天晚上、隔天、後天傳訊息給她＝她只回一句，照順序「嗯。」「好。」「知道了。」',G.flags.KX_WAITED==='nothing'&&got.slice(0,3).every((r,i)=>r.ok&&r.override===KA[i])&&q.slice(0,3).every((L,i)=>J(L)===J([KA[i]])),J({g:got.map(r=>r.override),q}));
        check('10. 第三天起照常（不是那六句）',got[3].ok&&!got[3].override&&!(q[3]&&q[3].length===1&&KA.includes(q[3][0])),J(q[3]));
        at(G,d+2,20); const more=[0,1,2,3,4].map(()=>P().kxAfterLine(G,KX)); check('10. 用完從頭：接著「……嗯。」「再說。」「喔。」「嗯。」「好。」',J(more)===J([KA[3],KA[4],KA[5],KA[0],KA[1]]),J(more)); }
      { const {G,d}=setup(null); const r=send(G,d+1,15); check('10. 不回（19:00「算了。」）也一樣',G.flags.KX_WAITED==='nothing'&&r.override===KA[0],J(r)); }
      { const {G,d}=setup(0); await goOut(G,'aa720_kx_waited_late',[0]); const r=send(G,d+1,15); check('10. 「我現在過去」、到了（KX_WAITED late）也一樣',G.flags.KX_WAITED==='late'&&r.override===KA[0],J(r)); }
      { const G=fresh('2027-01-05',12); dec(G,KX,'slot','show',G.day); H.date(KX); const d=P().kxWaitDay(G); run(G,d,10.05); await goOut(G,'aa720_kx_waited',[]); const r=send(G,d+1,15);
        check('10. 16:15 以前到（came，她沒說什麼）＝照常',G.flags.KX_WAITED==='came'&&r.ok&&!r.override,J({w:G.flags.KX_WAITED,r})); }
      { const G=fresh('2027-01-05',12); H.date(ZQ); const r=P().kxAfterLine(G,ZQ); check('10. 別人＝不換',r==null); } }

    /* 10e 子晴 1/9 demo intern 版、動態說明文字（075eae472 wiringAnswers2 3：三處也照 ZQ-2 換）*/
    { const DJ=DT().zq_intern.demoJan9, C=TERMEND_LINES.C15.zq_demo, orig='第三關。橋是新的。', W3=(RAW&&RAW.wiringAnswers2||{})['3']||{}, D3=AA720.cfg.demo3;
      const L=(intern,v,late)=>{ const G=fresh('2027-01-09',13); dec(G,ZQ,'summer',intern?'intern':'game',dk('2026-06-10')); if(v) dec(G,ZQ,'level',v,dk('2026-12-01'),late?{late:true}:null); const x=typeof C.lines==='function'?C.lines(G):C.lines; return x; };
      const base=L(false,null), T2=x=>x.map(l=>l.narr!=null?l.narr:l.text);
      check('10. 稿：demoJan9 shop／tainan／cat／default 照稿',J(DJ.intern)===J({shop:'第二關。五金行是新的。',tainan:'第二關。巷子是新的。',cat:'第二關。貓會自己找路了。',default:'第二關。貓會自己找路了。'})&&!!RAW&&J(RAW.zq_intern.demoJan9.intern)===J(DJ.intern),J(DJ.intern));
      check('10. 稿（wiringAnswers2 3）：三個值各三句逐字（cfg.demo3＝稿）、default「沒有 ZQ-2 值＝cat」、rule 寫的三處',J(D3)===J({shop:W3.shop,tainan:W3.tainan,cat:W3.cat})
        &&J(D3.shop)===J(['（畫面上是一間五金行，鐵門拉起來一半。）','（你在兩排貨架中間卡住了，怎麼走都出不去。）','……第二關太難了。我回去改。'])
        &&J(D3.tainan)===J(['（畫面上是一條很窄的巷子，兩邊是紅磚牆。）','（你在巷子的轉角走錯了好幾次。）','……第二關太難了。我回去改。'])
        &&J(D3.cat)===J(['（畫面上是一隻貓走在溫州街上。）','（你在路口跟丟了那隻貓。）','……第二關太難了。我回去改。'])
        &&W3.default==='沒有 ZQ-2 值＝cat'&&['一隻貓站在一座橋上','你在橋的一半掉下去','……第三關太難了。我回去改。'].every(t=>String(W3.rule).includes('「'+t+'」')),J(D3));
      check('10. 原本的四句（game 版照原本）：旁白「…一隻貓站在一座橋上。」、「第三關。橋是新的。」、旁白「（你在橋的一半掉下去。）」、「……第三關太難了。我回去改。」',J(T2(base))===J(['（資工系館的電腦教室。螢幕上，一隻貓站在一座橋上。）',orig,'（你在橋的一半掉下去。）','……第三關太難了。我回去改。']),J(T2(base)));
      const want=v=>['（資工系館的電腦教室。'+D3[v][0].slice(1),DJ.intern[v],D3[v][1],D3[v][2]];   /* 3e6a7ff71 wiringAnswers3 3：第一句保留「資工系館的電腦教室。」再接 AA 那一句 */
      const W3b=(RAW&&RAW.wiringAnswers3||{})['3']||'';
      check('10. 稿（wiringAnswers3 3）：不要整句換、保留「資工系館的電腦教室。」；例句「（資工系館的電腦教室。畫面上是一間五金行，鐵門拉起來一半。）」＝遊戲 shop 版第一句',/^不要整句換/.test(W3b)&&W3b.includes('「（資工系館的電腦教室。畫面上是一間五金行，鐵門拉起來一半。）」')&&T2(L(true,'shop'))[0]==='（資工系館的電腦教室。畫面上是一間五金行，鐵門拉起來一半。）'&&T2(L(true,'cat'))[0]==='（資工系館的電腦教室。畫面上是一隻貓走在溫州街上。）'&&T2(L(true,'tainan'))[0]==='（資工系館的電腦教室。畫面上是一條很窄的巷子，兩邊是紅磚牆。）',J([W3b,T2(L(true,'shop'))[0]]));
      const ok=(v,w,late)=>{ const x=L(true,v,late); return J(T2(x))===J(want(w))&&x[0].narr!=null&&x[2].narr!=null&&x[1].who===ZQ&&x[3].who===ZQ&&!x[0].who&&!x[2].who; };
      check('10. intern 版 1/9 demo：照 ZQ-2 換四句——shop（五金行）、tainan（巷子）、cat（溫州街的貓）；旁白還是旁白、她說的還是她說',ok('shop','shop')&&ok('tainan','tainan')&&ok('cat','cat'),J([T2(L(true,'shop')),T2(L(true,'tainan'))]));
      check('10. 還沒決定 ZQ-2（沒有值）＝cat 版四句；過了 before 才演到（late）也是 cat',ok(null,'cat')&&ok('shop','cat',true),J(T2(L(true,null))));
      check('10. game 版照原本（決定了 shop 也一樣）',J(T2(L(false,'shop')))===J(T2(base)));
      const G=fresh('2026-10-01',20); dec(G,ZQ,'summer','intern',dk('2026-06-10')); const G2=fresh('2026-10-01',20); dec(G2,ZQ,'summer','game',dk('2026-06-10'));
      check('10. 動態說明文字（demoJan9.captions）：intern 版 zq1c「第一關」、zq4c「第二關」；圖和選項照之前；game 版照原本（第二關／第三關）',FEED.post('zq1c',G).say===DJ.captions.zq1c&&DJ.captions.zq1c==='第一關'&&FEED.post('zq4c',G).say===DJ.captions.zq4c&&DJ.captions.zq4c==='第二關'&&FEED.post('zq1c',G).pic===AA720.cfg.quotes.zqW5Pic&&FEED.post('zq1c',G2).say==='第二關'&&FEED.post('zq4c',G2).say==='第三關',J([FEED.post('zq1c',G).say,FEED.post('zq4c',G).say,FEED.post('zq1c',G2).say])); }

    /* 10f AA_717：子晴第 13 則改字、第 14／15 則 altIntern、ZQ_PL_CAT_CO 照關 */
    { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_arc_rot.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
      const A=ARC_ROT.rot[ZQ], S7=(R717&&R717.rot&&R717.rot[ZQ])||[];
      check('10. arc_rot.js 和 AA_717@'+SHA717+' 一致；第 13 則每一版「第一關的畫面做出來了。還不能玩。」「我自己按了很多次，每次都卡在同一個地方。」',ok&&ARC_ROT.src==='docs/story_planning/AA_717_rot_life.json@'+SHA717&&J(A[12].lines)===J(['第一關的畫面做出來了。還不能玩。','我自己按了很多次，每次都卡在同一個地方。'])&&!A[12].altIntern&&J(S7[12]&&S7[12].lines)===J(A[12].lines),out.trim().slice(0,160));
      check('10. 第 14、15 則的 altIntern 逐字照稿（第 15 則兩段：辭掉前／後）',!!S7[13]&&J(A[13].altIntern.map(a=>a.lines))===J([S7[13].altIntern.lines])&&J(A[14].altIntern.map(a=>a.lines))===J(S7[14].altIntern.map(a=>a.lines))&&J(A[14].altIntern.map(a=>a.if))===J([['dec:heroine_04.summer=intern','!zqQuitIntern'],['dec:heroine_04.summer=intern','zqQuitIntern']]),J(A[14].altIntern));
      const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path==='docs/story_planning/AA_717_rot_life.json');
      check('10. 匯入白名單：AA_717 一筆、sha '+SHA717+'、history 留 963afea74、ee689cfb8',allow.length===1&&allow[0].sha===SHA717&&allow[0].status==='approved'&&allow[0].history.some(h=>h.sha==='963afea74')&&allow[0].history.some(h=>h.sha==='ee689cfb8')&&allow[0].history.some(h=>h.sha==='033b5150a'),J(allow.map(e=>e.sha)));
      const pick=(G,i)=>{ const save=ARC_ROT.rot[ZQ]; ARC_ROT.rot[ZQ]=[A[i]]; try{ const r=ARCS.rec(G,ZQ); r.k=1; r.rot=[]; const p=ARCS.rotPick(G,ZQ); return p&&Object.assign({},p,{rot:i}); } finally { ARC_ROT.rot[ZQ]=save; } };   /* 只留那一則（其他則不干擾），看 rotPick 說哪幾句 */
      const mk=(date,v,fl)=>{ const G=fresh(date,15); dec(G,ZQ,'summer',v,dk('2026-06-10')); Object.assign(G.flags,fl||{}); return G; };
      { const p1=pick(mk('2026-07-20','intern'),13), p2=pick(mk('2026-07-20','game'),13);
        check('10. 第 14 則（life 4，暑假）：intern＝「暑假我在我爸介紹的公司實習。測試組。」「午休的時候，我在寫第一關。」；game＝原本「公司叫貓」',!!p1&&p1.rot===13&&J(p1.lines)===J(S7[13].altIntern.lines)&&!!p2&&J(p2.lines)===J(A[13].lines),J([p1,p2])); }
      { const G=mk('2026-09-20','intern'), p1=pick(G,14); G.flags.ZQ_QUIT_INTERN=true; const p2=pick(G,14); const G3=mk('2026-10-20','intern'); PHONE.at(G3,dk('2026-10-17'),20,[{th:'p:'+ZQ,from:ZQ,text:'我辭掉實習了。'}],'aa720_zq_next'); const p3=pick(G3,14); const p4=pick(mk('2026-09-20','game'),14);
        check('10. 第 15 則（life 5，大三上）：intern 還沒辭＝「實習延長到學期中，每週兩天。」…；演過騎樓那一場（ZQ_QUIT_INTERN）＝「延長的實習我辭掉了。」…',!!p1&&J(p1.lines)===J(S7[14].altIntern[0].lines)&&!!p2&&J(p2.lines)===J(S7[14].altIntern[1].lines),J([p1,p2]));
        check('10. 沒去騎樓（10/17 20:00「我辭掉實習了。」傳了）也算辭了；game＝原本',!!p3&&J(p3.lines)===J(S7[14].altIntern[1].lines)&&!!p4&&J(p4.lines)===J(A[14].lines),J([p3,p4])); }
      { const G=mk('2026-07-20','intern'); const iCat=A.findIndex(x=>x.if==='ans:ZQ_PL_CAT_CO'); ARCS.rec(G,ZQ).k=9; ARCS.rec(G,ZQ).ans.ZQ_PL_CAT_CO=1; const G2=mk('2026-07-20','game'); ARCS.rec(G2,ZQ).k=9; ARCS.rec(G2,ZQ).ans.ZQ_PL_CAT_CO=1;
        check('10. ZQ_PL_CAT_CO（「…在『貓』公司實習」）intern 照關（wiringAnswers「關掉照你」）、game 照出',ARCS.rotTier(G,ZQ,A[iCat])===-1&&ARCS.rotTier(G2,ZQ,A[iCat])>=0&&/ZQ_PL_CAT_CO 關掉照你/.test((RAW&&RAW.zq_intern&&RAW.zq_intern.rot)||'')); } }
  });
  /* ---------------- 11 an1_later＋wiringAnswers2（075eae472）---------------- */
  await sec(11,async()=>{ const AL=DT().an1_later, W2=(RAW&&RAW.wiringAnswers2)||{}, Q=AA720.cfg.quotes, d=dk('2027-03-19'), H20=21+20/60;
    /* 11a 稿 */
    check('11. 稿：an1_later 照稿（群組 Alison 一則、私訊一則＋三個選項她各回兩句；不在群組的第一句「我要申請日本交換。……先跟你說一聲。」）',!!RAW&&J(RAW.an1_later)===J(AL)
      &&J(AL.group.msgs)===J([['yu','以安要去日本交換了！她自己都不講！']])&&AL.group.th==='g:noodle_team'&&J(AL.dm.msgs)===J(['……你應該已經聽 Alison 說了。'])
      &&J(AL.dm.opts.map(o=>o.t))===J(['聽說了。恭喜。','妳怎麼沒跟我說？','日本很適合妳。'])&&J(AL.dm.opts.map(o=>o.say))===J([['還沒申請上。','……謝謝。'],['我想申請上了再說。','……結果 Alison 先說了。'],['你又知道了。','……我也覺得。']])
      &&J(AL.dm.opts.map(o=>o.rel))===J([{comf:1},{trust:1},{fam:1}])&&Q.anLaterNoGroup==='我要申請日本交換。……先跟你說一聲。'&&AL.noGroup.includes('「'+Q.anLaterNoGroup+'」')
      &&/^2027-03-19（五）21:00/.test(AL.group.at)&&/^2027-03-19 21:20/.test(AL.dm.at)&&/^dec:heroine_01\.jp_tell=later（含預設/.test(AL.if)&&wd(d)===5,J(AL));
    const mk=(o)=>{ o=o||{}; const G=fresh('2027-03-19',20,'dorm'); if(o.grp!==false) PHONE.join(G,'noodle_team','桌遊團'); if(o.v) dec(G,AN,'jp_tell',o.v,dk('2027-01-10'),o.late?{late:true}:null); if(o.fam===false) H.rel(AN,10,0,0); return G; };
    const grp=G=>G.msgs.filter(m=>m.tag==='aa720_an_later_grp'), dmL=G=>G.msgs.filter(m=>m.th==='p:'+AN);
    /* 11b 在群組（later 記了） */
    { const G=mk({v:'later'}); run(G,d,20.95); const a=grp(G).length+dmL(G).length; run(G,d,21.01); const g1=grp(G), dm1=dmL(G).length; run(G,d,21.3); const dm2=dmL(G).length; run(G,d,21.34); const m=dmL(G);
      check('11. later、在桌遊團群組：21:00 以前沒有；21:00（手機開著＝到的那個時候）群組（g:noodle_team）Alison「以安要去日本交換了！她自己都不講！」；21:20 以前沒有私訊',a===0&&g1.length===1&&g1[0].th==='g:noodle_team'&&g1[0].from==='yu'&&g1[0].text===AL.group.msgs[0][1]&&g1[0].day===d&&g1[0].h>=21&&g1[0].h<21.26&&!g1[0].ask&&dm1===0&&dm2===0,J({a,g1,dm1,dm2}));
      check('11. 21:20 以安私訊「……你應該已經聽 Alison 說了。」一則、三個選項（照稿）',m.length===1&&m[0].from===AN&&m[0].text===AL.dm.msgs[0]&&m[0].day===d&&m[0].h>=H20&&m[0].h<H20+0.26&&!!m[0].ask&&J(m[0].ask.opts.map(o=>o.t))===J(AL.dm.opts.map(o=>o.t)),J(m));
      const r0=Object.assign({},SOCIAL.rel(AN)); PHONE.answer(G,m[0].ask.id,1); const L=dmL(G).map(x=>x.text);
      check('11. 回「妳怎麼沒跟我說？」：她回「我想申請上了再說。」「……結果 Alison 先說了。」、信任 +1',J(L.slice(-2))===J(AL.dm.opts[1].say)&&dmL(G).slice(-2).every(x=>x.from===AN)&&SOCIAL.rel(AN).trust-r0.trust===1&&P().r(G,'an1_later').k===1,J({L,t:[r0.trust,SOCIAL.rel(AN).trust]}));
      run(G,d+1,21.5); check('11. 只傳一次（隔天不再傳）',grp(G).length===1&&dmL(G).filter(x=>x.text===AL.dm.msgs[0]).length===1); }
    { const res=[0,1,2].map(i=>{ const G=mk({v:'later'}); run(G,d,21.4); const m=dmL(G)[0]; const r0=Object.assign({},SOCIAL.rel(AN)); PHONE.answer(G,m.ask.id,i); const r1=SOCIAL.rel(AN), k=Object.keys(AL.dm.opts[i].rel)[0];
        return J(dmL(G).slice(-2).map(x=>x.text))===J(AL.dm.opts[i].say)&&r1[k]-r0[k]===1; });
      check('11. 三個選項她回的兩句、rel（自在／信任／熟悉 +1）都照稿',res.every(Boolean),J(res)); }
    /* 11c 預設值（沒演到第 6 拍）、late＝later；first＝不傳 */
    { const G=mk({}); run(G,d,21.4); const G2=mk({v:'later',late:true}); run(G2,d,21.4); const G3=mk({v:'first'}); run(G3,d,21.4);
      check('11. 沒決定（預設值 later、舊存檔）也一樣：群組＋私訊；過了 before 才演到（late）也一樣',grp(G).length===1&&dmL(G).length===1&&dmL(G)[0].text===AL.dm.msgs[0]&&grp(G2).length===1&&dmL(G2).length===1,J([texts(G),texts(G2)]));
      check('11. first（真的記了：她先說、說明會那一版）＝都不傳',!grp(G3).length&&!dmL(G3).some(x=>x.text===AL.dm.msgs[0]||x.text===Q.anLaterNoGroup),J(texts(G3))); }
    /* 11d 不在群組 */
    { const G=mk({v:'later',grp:false}); run(G,d,21.01); const a=grp(G).length+dmL(G).length; run(G,d,21.4); const m=dmL(G);
      check('11. 不在桌遊團群組：沒有群組那則；只有 21:20 私訊，第一句換成「我要申請日本交換。……先跟你說一聲。」、選項一樣',a===0&&!grp(G).length&&!G.msgs.some(x=>x.th==='g:noodle_team')&&m.length===1&&m[0].text===Q.anLaterNoGroup&&m[0].h>=H20&&m[0].h<H20+0.26&&J(m[0].ask.opts.map(o=>o.t))===J(AL.dm.opts.map(o=>o.t)),J(texts(G)));
      PHONE.answer(G,m[0].ask.id,2); check('11. 不在群組的回「日本很適合妳。」＝她回「你又知道了。」「……我也覺得。」',J(dmL(G).slice(-2).map(x=>x.text))===J(AL.dm.opts[2].say)); }
    /* 11e 不熟（FAMILIAR 以下）＝只有群組；睡過頭（隔天早上才看手機）＝照稿的時間、群組在前 */
    { const G=mk({v:'later',fam:false}); run(G,d,21.4); check('11. 和以安還不到 FAMILIAR：只有群組那則、沒有私訊',grp(G).length===1&&!dmL(G).length,J(texts(G))); }
    { const G=mk({v:'later'}); run(G,d+1,8); const g=grp(G)[0], m=dmL(G)[0];
      check('11. 3/19 晚上沒開手機（3/20 早上才 tick）：兩則照稿的時間（21:00、21:20），群組在私訊前面',!!g&&!!m&&g.day===d&&m.day===d&&Math.abs(g.h-21)<0.01&&Math.abs(m.h-H20)<0.01&&G.msgs.indexOf(g)<G.msgs.indexOf(m),J([g,m])); }
    { const G=mk({v:'later'}); run(G,d+4,21.4); check('11. 過了三天才第一次 tick＝不補',!grp(G).length&&!dmL(G).length); }

    /* 11f 子晴 ev_zq_dad_angry：遊戲裡沒有就不用關；intern 只關 zq_intern.closes；ev_ziqing_dad_sorry 不動 */
    { const src=fs.readFileSync(path.join(H.ROOT,'src/aa720_3d.js'),'utf8'); let hits=''; try{ hits=cp.execFileSync('git',['grep','-l','ev_zq_dad_angry','--','src'],{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ hits=''; }
      const files=hits.trim().split('\n').filter(Boolean), ds=STORY_EVENTS.find(e=>e&&e.id==='ev_ziqing_dad_sorry');
      check('11. 稿（wiringAnswers2 zqDadAngry）：遊戲裡沒有 ev_zq_dad_angry（只在 decide_rules.js 的 opens／closes 說明裡）、不用關；aa720_3d.js 沒碰它、也沒碰 ev_ziqing_dad_sorry',/ev_zq_dad_angry/.test(W2.zqDadAngry||'')&&/ev_ziqing_dad_sorry/.test(W2.zqDadAngry||'')&&J(files)===J(['src/data/decide_rules.js'])&&!STORY_EVENTS.some(e=>e&&e.id==='ev_zq_dad_angry')&&!src.includes('ev_zq_dad_angry')&&!src.includes('ev_ziqing_dad_sorry')&&!!ds&&!ds.aa720,J({files}));
      const Gi=fresh('2026-07-20',15); dec(Gi,ZQ,'summer','intern',dk('2026-06-10')); const Gg=fresh('2026-07-20',15); dec(Gg,ZQ,'summer','game',dk('2026-06-10'));
      const ids=['zq4b','zq5b','zq6b','zq7b','zq8b'], w={day:Gi.day,h:15}, bi=ids.map(id=>FEED.blocked(Gi,FEED.post(id,Gi),w)==='aa720'), bg=ids.map(id=>FEED.blocked(Gg,FEED.post(id,Gg),w)==='aa720');
      check('11. intern 關的只有 zq_intern.closes（AA_504 假實習：騎樓咖啡店 7/3、8/28、7/17 爸爸問公司在哪）；別則、game 版照原本',J(P().ZQ_CLOSED)===J(['zq5b','zq6b','zq8b'])&&J(bi)===J([false,true,true,false,true])&&bg.every(x=>!x),J({bi,bg})); }

    /* 11g 沒交往 Café 當面版：scholar／both＝「我錄取了。英國那邊的信來了。」後面加「……獎學金拿到一半。」 */
    { const ev=STORY_EVENTS.find(e=>e&&e.id==='ev_zhiruo_admitted');
      const one=async(v,o)=>{ o=o||{}; const G=fresh('2027-05-12',15,'cafe'); if(v) dec(G,ZR,'fund',v,dk('2027-03-01'),o.late?{late:true}:null); if(!o.noApply) G.events.done.ev_zhiruo_applied=1; if(o.dating) H.date(ZR); H.said=[]; H.picks=[0,0]; await EVENTS.run(ev); return said(); };
      const sS=await one('scholar'), sB=await one('both'), sT=await one('tell'), sN=await one(null), sL=await one('scholar',{late:true}), sD=await one('scholar',{dating:true}), sA=await one('scholar',{noApply:true});
      const i=sS.indexOf(Q.zrCafeAdmit);
      check('11. 稿（wiringAnswers2 5）：「我錄取了。英國那邊的信來了。」「……獎學金拿到一半。」逐字',Q.zrCafeAdmit==='我錄取了。英國那邊的信來了。'&&Q.zrScholarCafe==='……獎學金拿到一半。'&&String(W2['5']||'').includes('「'+Q.zrScholarCafe+'」')&&String(W2['5']||'').includes('「'+Q.zrCafeAdmit+'」'),J(W2['5']));
      check('11. 沒交往、scholar：Café 當面「我錄取了。英國那邊的信來了。」的下一句是她說「……獎學金拿到一半。」，之後照原本',!!ev&&i===0&&sS[1]===Q.zrScholarCafe&&J(sS.filter((t,j)=>j!==1))===J(sT),J(sS.slice(0,4)));
      check('11. both 也加；tell、沒決定、late＝照原本（沒有那一句）',J(sB)===J(sS)&&!sT.includes(Q.zrScholarCafe)&&J(sN)===J(sT)&&J(sL)===J(sT)&&sT[0]===Q.zrCafeAdmit,J([sT.slice(0,2),sN.slice(0,2)]));
      check('11. 交往中（交往版）、沒申請過（「下學期我要去英國交換。…」那一版）＝不加',!sD.includes(Q.zrScholarCafe)&&!sD.includes(Q.zrCafeAdmit)&&!sA.includes(Q.zrScholarCafe)&&!sA.includes(Q.zrCafeAdmit),J([sD.slice(0,2),sA.slice(0,2)])); }

    /* 11h 選信的玩家：9/28 生日電話照原本（不用 9/24 明信片）；明信片的玩家照舊 */
    { check('11. 稿（wiringAnswers2 7）：「照舊打：選信的玩家 9/28 生日電話照原本來（不用明信片帶出來；同 12/25 視訊）」',/^照舊打：選信的玩家 9\/28 生日電話照原本來（不用明信片帶出來；同 12\/25 視訊）/.test(W2['7']||''),J(W2['7']));
      const bd=dk('2027-09-28');
      const one=(dist,o)=>{ o=o||{}; const G=fresh('2027-09-28',21,'dorm'); if(dist) dec(G,ZR,'distance',dist,dk('2027-05-01')); if(o.card){ const R=Y2B.pcRec(G); R.read['2027-09-24']=dk('2027-09-24'); R.ver['2027-09-24']=o.card; } if(o.done) G.flags.ZR_BDAY_CALL={2027:false}; at(G,o.d!=null?o.d:bd,o.h!=null?o.h:21.96); return G; };
      const Gl=one('letters');
      check('11. 選信（letters）：沒有明信片（Y2B.pcCards 空的）、9/28 21:55～22:30 生日電話照樣來',Y2B.pcCards(Gl).length===0&&Y2B.bdayCard(Gl)===true&&Y2B.bdayDue(Gl)===true&&Y2B.bdayDue(one('letters',{h:21.9}))===false&&Y2B.bdayDue(one('letters',{h:22.5}))===false&&Y2B.bdayDue(one('letters',{d:bd-1}))===false&&Y2B.bdayDue(one('letters',{done:true}))===false);
      const Gc=one('letters'); H.said=[]; H.picks=[0]; await Y2B.bdayCall(GM); const s=said(), V=STORY_EVENTS.find(e=>e&&e.id==='ev_zhiruo_bday_video'), want=V?V.dialogue.filter(l=>l&&l.text).map(l=>l.text):[];
      check('11. 選信的打給她：開頭旁白換「（台灣晚上十點，手機響了。）」（3e6a7ff71 wiringAnswers3 1）＋「打給她。」→ 22:00 視訊（ev_zhiruo_bday_video 三句）、記 ZR_BDAY_CALL 2027',s[0]==='（台灣晚上十點，手機響了。）'&&J(s.slice(-3))===J(want)&&want.length===3&&!!Gc.flags.ZR_BDAY_CALL&&Gc.flags.ZR_BDAY_CALL[2027]===true&&(OUT.get(Gc,'y3_zr_bday_call')||{}).ev==='ev_zhiruo_bday_video',J(s));
      check('11. 明信片的玩家照舊：沒讀過 9/24 那張＝沒有；讀過（寄給他本人：宿舍／交往）＝有；寄到 Café（常客版）＝沒有',Y2B.bdayDue(one('call'))===false&&Y2B.bdayDue(one(null))===false&&Y2B.bdayDue(one('call',{card:'dorm'}))===true&&Y2B.bdayDue(one('call',{card:'gf'}))===true&&Y2B.bdayDue(one('call',{card:'cafe'}))===false&&Y2B.bdayDue(one('visit',{card:'dorm'}))===true);
      const W3=(RAW&&RAW.wiringAnswers3)||{};
      check('11. 稿（wiringAnswers3 1、2）：選信版旁白、選信又和別人交往中的排除',W3['1']&&W3['1'].includes('「（台灣晚上十點，手機響了。）」')&&W3['1'].includes('明信片版照原本')&&/^排除：選信、但那時和別人交往中的玩家，9\/28 沒有這通電話/.test(W3['2']||''),J([W3['1'],W3['2']]));
      const Go=one('letters'); Go.flags.dating_heroine_01=true; const Gz=one('letters'); Gz.flags.dating_heroine_02=true;
      check('11. 選信、那時和別人交往中＝沒有這通（同明信片寄 Café 的常客版）；和芷若交往中照樣有',Y2B.bdayCard(Go)===false&&Y2B.bdayDue(Go)===false&&Y2B.bdayDue(Gz)===true,J([Y2B.pcVer(Go),Y2B.pcVer(Gz)]));
      const Gp=one('call',{card:'dorm'}); H.said=[]; H.picks=[1]; await Y2B.bdayCall(GM); const sp=said();
      check('11. 明信片的玩家開頭旁白照原本「（明信片背面寫著：台灣晚上十點。）」',sp[0]==='（明信片背面寫著：台灣晚上十點。）',J(sp)); }
  });
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
