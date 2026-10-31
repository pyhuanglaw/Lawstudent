// 芷若大一暑假在台中的五句（AA_550 第 4 節，企劃線 2664ed6f1；任務 ZR-SUMMER-LINES-1031）、AA_551 杯子上的字（企劃線 32772d7a4；ZR-CUP-AA551-1031）、
// 經濟系那一年的深色底改用現成的背景（BB_132 第 100 組，企劃線 9d5968c0b；BLACK-BG-AUDIT-1018）——不需要瀏覽器。台詞一字照稿（D100、D109）。
//   A1 七夕 2026-08-19 她在台中（開車去台中找她、背景 tc_cafe）：第 6 階、交往中都是「我在家裡的廚房試做了一杯特調。……」；2027 在臺北照原本
//   A2 出國期間她傳的池子：那一天她在台中＝「我媽在旁邊一直問我在跟誰傳訊息。」，在臺北照原本「我媽打來，問你回來了沒。」
//   A3 回覆池深夜那一則：2026-07-01～08-25「剛洗完澡。台中的晚上比臺北安靜。」，其他日子照原本（含 8/26 那一天）
//   A4 8/26 回臺北當天不上班（作息沒有 Café 的班）、重逢 8/26 21:00 約、8/27 22:00 見
//   A5 大一下期末飯她說的「暑假我回台中，八月二十六號回來。」
//   B  ev_zhiruo_ticket_again「我一直收著。」那一支的旁白補上杯子上的字；她說的那句不動
//   C  經濟系五段開頭（ev_y0_e26 玄關、ev_y0_e36r 房間、ev_y0_kh_bus／_h 夜裡的客運、ev_y0_rp 目的地）、左營站傍晚那一段改用現成的背景；
//      bus_day、market 這兩個代號遊戲裡沒有（不改，回報）
// 修改前（開發分支 22a2ba6dd）：19 項 FAIL（新句子、新背景、8/26 的班、重逢日子、盤點工具）；讀稿、照原本的對照組（在臺北、2027、沒有現成背景、bus_day／market 不在）PASS。用法：node tests/zr_summer_misc_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/zrzq_events.js','src/zrzq3d.js','src/data/zr_last_events.js','src/zr_last3d.js','src/data/fest_events.js','src/fest3d.js']){ try{ load(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
const git=(refs,f)=>{ for(const r of refs){ try{ const t=cp.execSync('git show '+r+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(t) return t; }catch(e){} } return ''; };
const doc550=git(['2664ed6f1','origin/claude/cool-heisenberg-o8kuqx'],'AA_550_假期人物不在臺北_跨年訊息_大三大四房間旁白順序.md'), sec4=(doc550.split('## 4.')[1]||'');
const doc551=git(['32772d7a4','origin/claude/cool-heisenberg-o8kuqx'],'AA_551_芷若九月一日杯子上的字_補在票根第二次.md');
const J=JSON.stringify, ZR='heroine_02', D=k=>H.D(k);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const QIXI_TC='我在家裡的廚房試做了一杯特調。很甜。……想給你喝。', QIXI_TP='七夕我們店有一款特調。很甜。我不喝，可是想做給你。';
const MOM_TC='我媽在旁邊一直問我在跟誰傳訊息。', MOM_TP='我媽打來，問你回來了沒。';
const BATH_TC='剛洗完澡。台中的晚上比臺北安靜。', BATH_TP='剛洗完澡。下班回來都這個時間。';
const TE_NEW='暑假我回台中，八月二十六號回來。', TE_OLD='暑假我回台中，到八月底。';
const KEEPN_NEW='（她做了一杯熱可可，加了一份濃縮，推到你面前。杯子上用麥克筆寫著：「熱可可＋濃縮」。下面一行小字：「不用還了。」）', KEEP='……那這杯，也是你的。';
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{};
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n==='dt'?6:n); if(n==='dt'){ G.flags['dating_'+id]=true; ROM.get(G,id).status='dating'; } G.contacts[id]=G.day-60; } if(STORY._bindGM) STORY._bindGM(GM); return G; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const said=()=>H.said.map(s=>s.t);
const img=b=>b&&b.image?b.image.replace('assets/bg/','').replace('.webp',''):b;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
GM.money=n=>{ H.G.money+=n; };
const runPhone=(h0,h1)=>{ for(let h=h0;h<=h1+1e-9;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const txt=th=>(H.G.msgs||[]).filter(m=>m.th===th).map(m=>m.text);
const queued=th=>[].concat(...(PHONE.rec(H.G).q||[]).map(q=>(q.items||[]).filter(m=>m.th===th).map(m=>m.text)));

(async()=>{
  /* ======================= 0 讀稿 ======================= */
  check('0. 讀稿 AA_550 第 4 節（2664ed6f1）：五處的新句子都在稿裡',[QIXI_TC,MOM_TC,BATH_TC,TE_NEW].every(t=>sec4.indexOf(t)>=0)&&/8\/26 回臺北當天不排班；第一個晚班 8\/27，重逢那一場改到 8\/27 22:00/.test(sec4),J(sec4.slice(0,80)));
  check('0. 讀稿 AA_551 第 2 節（32772d7a4）：keepN 改成杯子上的字那一句、她說的那句不動',doc551.indexOf('改成：「'+KEEPN_NEW+'」')>=0&&doc551.indexOf('她說的那句不動：「'+KEEP+'」')>=0);

  /* ======================= A1 七夕在台中 ======================= */
  await sec('A1',async()=>{
    if(typeof FEST==='undefined'){ check('A1. FEST 載得到',false); return; }
    const play=async(c)=>{ H.said=[]; H.opts=[]; H.bgs=[]; H.picks=[]; await FEST.play(GM,c); return said(); };
    setup('2026-08-19',12,{lv:{[ZR]:6}}); const p=STORY.presence(ZR,H.G);
    const a=await play({id:ZR,k:'qixi',y:2026,mode:'meet'});
    check('A1. 2026 七夕（8/19）她在台中（presence home 台中）、第 6 階：「'+QIXI_TC+'」（不說店裡的特調）',p.here===false&&p.kind==='home'&&J(a)===J([QIXI_TC]),J({p,a}));
    setup('2026-08-19',12,{lv:{[ZR]:'dt'}}); const b=await play({id:ZR,k:'qixi',y:2026,mode:'meet'});
    check('A1. 2026 七夕交往中（那一格只寫了 2028，其他年份照第 6 階）：也是台中那一句',J(b)===J([QIXI_TC]),J(b));
    setup('2027-08-08',12,{lv:{[ZR]:6}}); const c=await play({id:ZR,k:'qixi',y:2027,mode:'meet'});
    setup('2028-08-26',12,{lv:{[ZR]:'dt'}}); const d=await play({id:ZR,k:'qixi',y:2028,mode:'meet'});
    check('A1. 她在臺北的七夕照原本：2027 第 6 階「'+QIXI_TP+'」；2028 交往中「下個月我就走了。……」「……你取。」',J(c)===J([QIXI_TP])&&J(d)===J(['下個月我就走了。今天的特調還沒取名。','……你取。']),J({c,d}));
    /* 玩家約：8/18 約、開車去台中（背景 tc_cafe），到了演那一句 */
    setup('2026-08-18',10,{lv:{[ZR]:6}}); H.said=[]; H.opts=[]; H.picks=[0]; const q=await FEST.ask(GM,ZR,null); const O=H.opts.slice();
    check('A1. 8/18 約她過七夕：選項「開車去台中找她（一整天）」→ 排 8/19 開車去台中',!!q&&q.day===D('2026-08-19')&&q.fest&&q.fest.day&&O[0]&&O[0][0]==='開車去台中找她（一整天）',J({q,O}));
    if(q){ at('2026-08-19',8.8); H.said=[]; H.opts=[]; H.bgs=[]; H.picks=[]; await OUT.go(GM,OUT.get(H.G,q.id)); const L=said();
      check('A1. 到了台中：背景 tc_cafe、她說「'+QIXI_TC+'」',img(H.bgs.find(x=>x&&x.image))==='tc_cafe'&&L.includes(QIXI_TC)&&!L.includes(QIXI_TP),J({L,b:H.bgs.map(img)})); }
  });

  /* ======================= A2 出國期間她傳的池子 ======================= */
  await sec('A2',async()=>{
    const I8=VAC.inst('C08','Y1');
    const a=(()=>{ setup(CALENDAR.dateOf(I8.from).key,7,{flags:{dating_heroine_02:true}}); SOCIAL.remember(ZR,'FIRST_MET',''); VAC.tripMsgs(H.G,{key:'C08@Y1',with:null,A:I8.A,yk:'Y1'}); return queued('p:'+ZR); })();
    const inTc=STORY.presence(ZR,Object.assign({},H.G,{day:I8.from+3})).kind==='home';
    check('A2. 首爾交流（2026-07-13～24，她在台中）：池子那一則是「'+MOM_TC+'」，沒有「'+MOM_TP+'」',inTc&&a.includes(MOM_TC)&&!a.includes(MOM_TP),J(a));
    const I10=VAC.inst('C10','Y2');
    const b=(()=>{ setup(CALENDAR.dateOf(I10.from).key,7,{flags:{dating_heroine_02:true}}); SOCIAL.remember(ZR,'FIRST_MET',''); VAC.tripMsgs(H.G,{key:'C10@Y2',with:null,A:I10.A,yk:'Y2'}); return queued('p:'+ZR); })();
    const inTp=STORY.presence(ZR,Object.assign({},H.G,{day:I10.from+3})).here!==false;
    check('A2. 加州暑期課（2027-06-21～07-31，她在臺北、不上班）：照原本「'+MOM_TP+'」',inTp&&b.includes(MOM_TP)&&!b.includes(MOM_TC),J(b.filter(t=>/我媽/.test(t))));
  });

  /* ======================= A3 回覆池深夜那一則 ======================= */
  await sec('A3',async()=>{
    if(typeof MSG==='undefined'){ check('A3. MSG 載得到',false); return; }
    const e=((MSG_POOL.people[ZR]||{}).replies||[]).find(x=>x.variant==='深夜'&&J(x.msgs)===J([BATH_TP]));
    const m=k=>{ const G=H.fresh(k,23.4,'dorm',{}); return MSG.msgsOf(G,ZR,e); };
    check('A3. 回覆池原文不動（msg_pool.js 照產生器）：深夜那一則還是「'+BATH_TP+'」',!!e);
    check('A3. 2026-07-01、08-25（含頭尾）換「'+BATH_TC+'」；06-30、08-26、2027-07-15 照原本',!!e&&J(m('2026-07-01'))===J([BATH_TC])&&J(m('2026-08-25'))===J([BATH_TC])&&J(m('2026-06-30'))===J([BATH_TP])&&J(m('2026-08-26'))===J([BATH_TP])&&J(m('2027-07-15'))===J([BATH_TP]),e?J([m('2026-07-01'),m('2026-08-26')]):'');
    /* 實際傳訊息：23:24 傳「在幹嘛」，十天的回覆 */
    const run=k0=>{ const G=H.fresh(k0,23.4,'dorm',{}); H.FRIEND(ZR); G.contacts=G.contacts||{}; G.contacts[ZR]=G.day-30;
      for(let i=0;i<10;i++){ at(CALENDAR.dateOf(D(k0)+i).key,23.4); MSG.send(G,ZR,'chat'); G.hour=30; PHONE.tick(G); } return H.msgs('p:'+ZR).filter(t=>/洗完澡/.test(t)); };
    const s=run('2026-08-01'), w=run('2027-03-01');
    check('A3. 實際傳訊息（2026-08-01 起十天、23:24）：收到的是「'+BATH_TC+'」；2027-03 照原本',s.length>0&&s.every(t=>t===BATH_TC)&&w.length>0&&w.every(t=>t===BATH_TP),J({s,w}));
  });

  /* ======================= A4 8/26 不上班、重逢 8/27 22:00 ======================= */
  await sec('A4',async()=>{
    const shift=(k,h)=>{ const G=H.fresh(k,h,'dorm',{}); const e=STORY.schedEnt(CHARACTERS[ZR],G); return e?e.zone+'/'+e.act:null; };
    const w26=[11.5,13,19.5,21].map(h=>shift('2026-08-26',h)), w27=shift('2026-08-27',19.5), w28=[shift('2026-08-28',11.5),shift('2026-08-28',19.5)];
    check('A4. 作息：2026-08-26（三）回臺北那天沒有 Café 的班（早班、晚班都沒有）；8/27（四）19:00 晚班、8/28（五）早班晚班照常',w26.every(x=>x!=='cafe/barista')&&w27==='cafe/barista'&&w28.every(x=>x==='cafe/barista'),J({w26,w27,w28}));
    setup('2026-07-24',17.9,{flags:{dating_heroine_02:true}}); SOCIAL.remember(ZR,'FIRST_MET',''); VAC.rec(H.G).reg['C08@Y1']='done'; runPhone(17.9,21.2);
    check('A4. 7/24 回國當天：「回來了？……我 26 號回臺北。」，還沒約',txt('p:'+ZR).includes('回來了？……我 26 號回臺北。')&&!OUT.get(H.G,'vac_C08@Y1_re_heroine_02'));
    at('2026-08-25',20.9); runPhone(20.9,21.2); const q1=OUT.get(H.G,'vac_C08@Y1_re_heroine_02');
    check('A4. 8/25 21:00 不約（她還在台中）',!q1&&!txt('p:'+ZR).includes('明天我十點下班。'),J(q1));
    at('2026-08-26',20.9); runPhone(20.9,21.2); const q2=OUT.get(H.G,'vac_C08@Y1_re_heroine_02');
    check('A4. 8/26 21:00「明天我十點下班。」「……你來的話，我晚一點關燈。」→ 8/27 22:00 兩點半 Café 重逢',txt('p:'+ZR).includes('明天我十點下班。')&&txt('p:'+ZR).includes('……你來的話，我晚一點關燈。')&&!!q2&&q2.day===D('2026-08-27')&&q2.h===22&&q2.place==='兩點半 Café',J(q2));
    const R=VAC_DATA.TRIP_MSG.reunion[ZR];
    check('A4. 重逢的台詞照原本（倒扣椅子、「回來了。」「……第一杯，我還是做給你。坐。」、沒去的那句）',J(R.lines.map(l=>l.text||l.narr))===J(['（她把最後一張椅子倒扣在桌上。）','回來了。','……第一杯，我還是做給你。坐。'])&&J(R.miss)===J(['昨天的那杯，我自己喝了。']));
  });

  /* ======================= A5 大一下期末飯 ======================= */
  check('A5. 大一下期末飯芷若：「'+TE_NEW+'」「店裡暑假換人顧，我回來再上班。」（沒有「到八月底」）',J(TERMEND_LINES.POOL.Y1S2[ZR])===J([TE_NEW,'店裡暑假換人顧，我回來再上班。']),J(TERMEND_LINES.POOL.Y1S2[ZR]));

  /* ======================= B AA_551 杯子上的字 ======================= */
  { const A=(typeof ZRLAST_LINES!=='undefined'&&ZRLAST_LINES.again)||{}, D0=(ev('ev_zhiruo_ticket_again')||{}).dialogue||[], i=D0.findIndex(l=>l&&l.label==='k');
    check('B. 「我一直收著。」那一支：旁白「'+KEEPN_NEW+'」接她說「'+KEEP+'」（她那句不動）',A.keepN===KEEPN_NEW&&A.keep===KEEP&&i>=0&&D0[i+1]&&D0[i+1].text===KEEPN_NEW&&D0[i+1].speaker==null&&D0[i+2]&&D0[i+2].text===KEEP&&D0[i+2].speaker===ZR,J(D0.slice(i,i+3)));
    check('B. 「還給妳。」那一支、條件不到那一支不動',A.giveN==='（你把票根放在吧檯上。她把它夾進牆上班表的夾板裡。）'&&A.give==='……謝謝你幫我收了一年。'&&A.hiNo==='好久不見。'&&A.no==='……票根，你留著就好。'); }

  /* ======================= C 經濟系的深色底 ======================= */
  await sec('C',async()=>{
    const hasImg=k=>!!(OUT.BG[k]&&OUT.BG[k].image&&fs.existsSync(path.join(H.ROOT,OUT.BG[k].image)));
    const bgOf=id=>{ const e=ev(id); return e?img(e.background):null; };
    for(const [id,k] of [['ev_y0_e26','home_entry_night'],['ev_y0_e36r','home_room_day'],['ev_y0_kh_bus','bus_night'],['ev_y0_kh_bus_h','bus_night']])
      check('C. '+id+' 開頭（稿沒有地點字幕）的底圖＝'+k+'（OUT.BG 有圖）',hasImg(k)&&bgOf(id)===k,J(bgOf(id)));
    check('C. 在家看榜 ev_y0_e36rh 照舊 home_room（BB_216 B）',J((ev('ev_y0_e36rh').dialogue||[])[0])===J({scene:'臺北的家',bg:'home_room'}));
    /* 實際演：ADV.begin 拿到的背景 */
    { H.fresh('2025-08-13',10,'campus',{}); H.bgs=[]; H.said=[]; await EVENTS.run(ev('ev_y0_e36r')); const b=H.bgs.map(img);
      check('C. 演 ev_y0_e36r（8/13 10:00 不在家）：ADV 開場的背景是 home_room_day、兩句旁白照舊',b[0]==='home_room_day'&&said()[0]==='（八月十三日，早上十點。榜單公布了。）',J({b,L:said()})); }
    /* ev_y0_rp：那一句的目的地 */
    { const E=ev('ev_y0_rp'), out={};
      for(let i=0;i<STORY.RP.length;i++){ H.fresh('2025-06-05',10,'dorm',{RP_LAST:i,RP_TXT:STORY.RP[i][2]}); H.bgs=[]; H.said=[]; await EVENTS.runLines(E.dialogue,{id:'t',participants:['kexin']}); out[i]={bg:H.bgs.map(img),L:said()}; }
      check('C. ev_y0_rp：公館的二輪戲院＝gongguan_cinema、淡水看海＝d13_base_sunset（淡水），旁白那一句照舊',hasImg('gongguan_cinema')&&hasImg('d13_base_sunset')&&J(out[0].bg)===J(['gongguan_cinema'])&&J(out[3].bg)===J(['d13_base_sunset'])&&out[0].L[0]===STORY.RP[0][2]&&out[3].L[0]===STORY.RP[3][2],J([out[0],out[3]]));
      check('C. ev_y0_rp：溫州街、映月湖（白天）、公館的咖啡店、芒果冰沒有現成的背景＝不換（照舊深色底）',[1,2,4,5].every(i=>!out[i].bg.length&&out[i].L[0]===STORY.RP[i][2]),J([1,2,4,5].map(i=>out[i].bg))); }
    /* 左營站傍晚 */
    const block=(f,id)=>{ const t=fs.readFileSync(path.join(H.ROOT,f),'utf8'), i=t.indexOf("id:'"+id+"'"); if(i<0) return ''; const j=t.indexOf("id:'",i+5); return t.slice(i,j<0?t.length:j); };   /* 這兩個事件包 pg_harness 沒有載入：讀原始檔那一段 */
    { const b=block('src/data/r2y4a_events.js','ev_kexin_trip_winter_y4'), n=(b.match(/\{scene:'高雄・左營站',bg:'kh_station'\}/g)||[]).length;
      check('C. ev_kexin_trip_winter_y4：左營站兩段（開頭、傍晚）都是 kh_station',n===2&&!/\{scene:'高雄・左營站',bg:'dark'\}/.test(b)&&hasImg('kh_station'),String(n)); }
    /* BB 列的另外兩個代號遊戲裡沒有：不改 */
    check('C. bus_day、market 不在 OUT.BG（BB_132 第 100 組寫的這兩個代號遊戲裡沒有）：公車上（ev_sis_vday_y3）、小鎮的市場（ev_spring_y2_noodle）照舊',!OUT.BG.bus_day&&!OUT.BG.market&&block('src/data/sis_b4_events.js','ev_sis_vday_y3').includes("{scene:'公車上',bg:'dark'}")&&block('src/data/group_events.js','ev_spring_y2_noodle').includes("{scene:'小鎮的市場',bg:'dark'}"));
    /* 盤點工具：經濟系沒有深色底了 */
    { let out=''; try{ out=cp.execSync('node tools/story/black_bg_audit.js --stage econ',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ out=String(e.stdout||''); }
      const rows=(out.split('## 2.')[1]||'').split('## 3.')[0].split('\n').filter(l=>/^\| ev_/.test(l)), wrong=(out.split('## 3.')[1]||'').split('## 4.')[0].split('\n').filter(l=>/^\| ev_y0/.test(l));
      check('C. tools/story/black_bg_audit.js --stage econ：經濟系 0 段深色底；ev_y0_e26 不被當成「3D 模糊底」',!!out&&rows.length===0&&wrong.length===0,J({rows,wrong})); }
  });
  H.done();
})();
