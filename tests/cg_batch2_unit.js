// CG 第二批（2026-10-20）：企劃線 cg_approved/ README 其他「通過」的 CG 登錄、接進遊戲裡已經有的事件；CG-10 尾聲 8 張合成。不需要瀏覽器。
//   1. CG_REGISTRY 還是一行；這一批 48 個 key 都在、檔案都在、整個 CG_REGISTRY 沒有兩個 key 指同一個檔；40 張原檔、8 張合成都是 1672×941
//   2. CG-10：8 個 key 和尾聲 PG.epiCg（src/postgrad3d.js）對得上（單身＝阿凱、交往中＝那一位）
//   3. 插的 cg（位置與條件照 README）：
//      1B-24 以安新 20 交往版：CG-19 在「……第一個問我的人是你。這也是理由之一。」那一句；沒交往（朋友版）沒有
//      K10 互相出題：BCG-30 在山下小吃那一版「換她出題」那一拍（她舉起題目卡）；視訊版沒有
//      語彤事件 17 一起畢業：CG-21 只在交往中那一句「恭喜。……四年，我們都在總圖三樓。」，說完回到椰林大道；朋友版沒有
//      學姊學期末告白（AA_343 E1）：答應、她說兩支都有便條那一拍；BCG-44 在答應的「好。」、她說的「……我喜歡你。」；第二次沒有
//      已經寫好 cg 的（1B-12 CG-22、1B-15 BCG-03、1B-16 BCG-12、1B-20 CG-8、1B-25 BCG-10、學姊 2029 生日 BCG-39）：key 登錄了
//   4. LICENSES.md 記了這一批和 CG-10
// 修改前：48 個 key 都不在 CG_REGISTRY（第 1 項 FAIL）。用法：node tests/cg_batch2_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, ROOT=H.ROOT;
const webpSize=f=>{ const b=fs.readFileSync(f); if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP') return null; const t=b.toString('ascii',12,16);
  if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(t==='VP8L'){ const v=b.readUInt32LE(21); return [1+(v&0x3fff),1+((v>>>14)&0x3fff)]; } return null; };
// ---- 1. CG_REGISTRY ----
const adv=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=/^const CG_REGISTRY=(\{.*\});$/m.exec(adv);
check('1. CG_REGISTRY 還是一行',!!m); const REG=m?eval('('+m[1]+')'):{};
const BATCH2=['cg_study_group_rules_photo','cg_anniversary_23','cg_cup_words_heroine02','cg_whiteboard_why_peishan','cg_final_stage_heroine04','cg_defense_day_heroine05','cg_snow_steps_heroine05',
  'cg_answer_exe_heroine04','cg_last_row_kexin','cg_japan_konbini_heroine01','cg_bus_station_heroine05','cg_chicago_heroine05','cg_japan_notice_heroine01','cg_court_gallery_rise','cg_avenue_lamp_heroine05',
  'cg_flustered_heroine04','cg_results_day_peishan','cg_frozen_lake_heroine05','cg_sunday_hour_peishan','cg_azalea_fourth_heroine01','cg_first_to_ask_heroine01','cg_saved_seat_heroine03',
  'cg_one_umbrella_heroine03','cg_uk_rain_heroine02','cg_valentine_taichung_heroine01','cg_pomelo_moon_heroine03','cg_quiz_kexin','cg_us_kitchen_heroine05','cg_airport_send_heroine05',
  'cg_airport_pickup_heroine05','cg_depart_together_heroine01','cg_sakura_riverbank_heroine01','cg_last_dinner_heroine05','cg_our_car_kexin','cg_one_cup_heroine02','cg_savefile_heroine04',
  'cg_last_page_peishan','cg_three_things_heroine05','cg_this_time_heroine05','cg_doorbell'];
const EPI=['kai','heroine01','heroine02','heroine03','heroine04','heroine05','kexin','peishan'].map(k=>'cg_reunion_window_table_'+k);
const missing=BATCH2.concat(EPI).filter(k=>!REG[k]||!fs.existsSync(path.join(ROOT,REG[k].file))||!REG[k].title);
check('1. 這一批 48 個 key 都登錄、檔案都在、有標題（40 張＋CG-10 8 張）',BATCH2.length===40&&missing.length===0,missing.join(' '));
const byFile={}; for(const k in REG){ (byFile[REG[k].file]=byFile[REG[k].file]||[]).push(k); } const dup=Object.entries(byFile).filter(([f,ks])=>ks.length>1);
check('1. 整個 CG_REGISTRY 沒有兩個 key 指同一個檔（'+Object.keys(REG).length+' 個 key）',dup.length===0,JSON.stringify(dup));
check('1. README 的 cg_no_plan_heroine05（BCG-39）用程式已經寫好的 key cg_this_time_heroine05，不另外登錄',!REG.cg_no_plan_heroine05&&REG.cg_this_time_heroine05&&REG.cg_this_time_heroine05.file==='assets/cg/heroine_05/cg_no_plan.webp');
check('1. 作廢的 BCG-36 吧檯是一道線（cg_bar_line）沒有登錄；同一張圖已經用別的 key 的（cg_decision_peishan＝cg_peishan_decision、cg_study_group_rules＝cg_plg_rules）不重複',!REG.cg_bar_line&&!REG.cg_decision_peishan&&!REG.cg_study_group_rules&&!!REG.cg_peishan_decision&&!!REG.cg_plg_rules);
const bad=BATCH2.concat(EPI).filter(k=>REG[k]&&fs.existsSync(path.join(ROOT,REG[k].file))&&JSON.stringify(webpSize(path.join(ROOT,REG[k].file)))!=='[1672,941]');
check('1. 40 張原檔、8 張合成都是 1672×941（原樣，不放大）',bad.length===0,bad.map(k=>k+' '+JSON.stringify(webpSize(path.join(ROOT,REG[k].file)))).join(' '));
check('1. 標題是 README「CG」欄的名字（例：CG-19 第一個問我的人、BCG-30 兩校互考，正式開打、CG-10 五年後的窗邊長桌）',REG.cg_first_to_ask_heroine01.title==='第一個問我的人'&&REG.cg_quiz_kexin.title==='兩校互考，正式開打'&&EPI.every(k=>REG[k].title==='五年後的窗邊長桌'));
// ---- 2. CG-10 和尾聲 ----
{ const G=H.fresh('2034-06-03',19,'cafe'); const a=PG.epiCg(G); H.date('heroine_03'); const b=PG.epiCg(G);
  check('2. 尾聲 PG.epiCg：單身＝'+a+'、和語彤交往＝'+b+'，都登錄、檔案在 assets/cg/epilogue/',a==='cg_reunion_window_table_kai'&&b==='cg_reunion_window_table_heroine03'&&REG[a].file==='assets/cg/epilogue/cg_reunion_kai.webp'&&REG[b].file==='assets/cg/epilogue/cg_reunion_heroine03.webp');
  check('2. PG.CG_ID 的 8 個值都登錄（沒有一個伴侶的 CG-10 會找不到圖）',Object.values(PG.CG_ID).every(v=>!!REG['cg_reunion_window_table_'+v])&&Object.values(PG.CG_ID).length===8); }
// ---- 3. 插的 cg ----
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG2_POOL|Y2B_EVENTS|Y2B|Y2R2)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/exchange3d.js','src/data/msg2_pool.js','src/msg3d.js','src/y34b3d.js','src/data/y2b_events.js','src/y2b3d.js','src/y2r2_3d.js']) load(f);
const cg0=ADV.cg; ADV.cg=function(id){ H.said.push({who:'CG',t:id}); return cg0.call(this,id); };   // CG 也排進台詞的順序
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const idx=t=>H.said.findIndex(s=>s.t===t), cgAt=id=>H.said.findIndex(s=>s.who==='CG'&&s.t===id);
const run=async(id,picks)=>{ H.said=[]; H.cgs=[]; H.picks=picks||[]; await EVENTS.run(ev(id)); };
(async()=>{
  // 1B-24 以安新 20（y34b3d.js AN20_BODY）
  { const G=H.fresh('2029-05-03',16,'cafe',{EXCHANGE_ROUTE:'TW',EXCH_RULE:1}); G.acts={att:{}}; G.outings=[]; H.FRIEND('heroine_01'); H.date('heroine_01'); await run('ev_an_your_turn',[0]);
    const c=cgAt('cg_first_to_ask_heroine01'), l=idx('……第一個問我的人是你。這也是理由之一。');
    check('3. 1B-24 和以安交往：CG-19 就在「……第一個問我的人是你。這也是理由之一。」那一句（前一拍），之後才是三個選項',c>=0&&l===c+1&&H.opts.length>0,JSON.stringify(H.said.slice(Math.max(0,c-1),c+2))); }
  { const G=H.fresh('2029-05-03',16,'cafe',{EXCHANGE_ROUTE:'TW',EXCH_RULE:1}); G.acts={att:{}}; G.outings=[]; H.FRIEND('heroine_01'); await run('ev_an_your_turn',[0]);
    check('3. 1B-24 沒交往（朋友版）：沒有 CG-19、也沒有那一句',cgAt('cg_first_to_ask_heroine01')<0&&idx('……第一個問我的人是你。這也是理由之一。')<0&&idx('所以我念法律，是為了把地圖畫好。')>=0); }
  // K10 互相出題（y2r2_3d.js quizEv）
  { const G=H.fresh('2026-10-23',18.5,'any'); H.date('kexin'); await run('ev_kexin_quiz_y2',[0]);   /* K10 改到 10/23（五）18:30（AA_343 E4：BCG-30 是十月星期五晚上的圖）*/
    const c=cgAt('cg_quiz_kexin'), l=idx('（換她出題。三題都是物權：誰的房子、誰的地、誰先登記。）');
    check('3. K10 山下小吃：BCG-30 在「換她出題」那一拍（她舉起題目卡），在玩家出完題之後',c>0&&l===c+1&&idx('定義？……你在暖身。')<c,JSON.stringify(H.said.map(s=>s.t))); }
  { const G=H.fresh('2026-10-23',18.5,'any'); H.date('kexin'); await run('ev_kexin_quiz_y2_video',[0]);
    check('3. K10 視訊：沒有 BCG-30（README：視訊互考的不放）',cgAt('cg_quiz_kexin')<0&&idx('（換她出題。三題都是物權：誰的房子、誰的地、誰先登記。）')>=0); }
  // 語彤事件 17（postgrad3d.js S.yt17）
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_03'); H.date('heroine_03'); H.said=[]; H.bgs=[]; await PG.yt17(GM);
    const c=cgAt('cg_one_umbrella_heroine03'), l=idx('恭喜。……四年，我們都在總圖三樓。你都坐我斜對面。');
    check('3. 語彤事件 17 交往中：CG-21 在「恭喜。……四年，我們都在總圖三樓。你都坐我斜對面。」那一句，說完回到椰林大道（setBg graduation_avenue）',c>=0&&l===c+1&&JSON.stringify(H.bgs[H.bgs.length-1]||null).includes('graduation_avenue'),JSON.stringify(H.said)+' '+JSON.stringify(H.bgs)); }
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_03'); H.said=[]; H.bgs=[]; await PG.yt17(GM);
    check('3. 語彤事件 17 朋友版：沒有 CG-21、不換背景',cgAt('cg_one_umbrella_heroine03')<0&&idx('恭喜。……我還要一年，今天先穿一次學士服。')>=0&&H.bgs.length===0); }
  // 學姊的學期末告白（termend3d.js walkHome）：AA_343 E1 便條那一拍＋BCG-44「沒有念的便條」
  { const N1='（她手上拿著一張摺過的小便條。從吃飯的時候就一直拿著。）', NY='（她把便條摺好，收進口袋。上面寫的字，她一句都沒有念。）', NS='（便條上寫滿了字。她一句都沒有照著念。）', W='時間差不多了。……你剛剛好像一直想講什麼。', C44='cg_three_things_heroine05';
    const walk=async(term,picks,think)=>{ const G=H.fresh('2027-06-25',20,'campus'); H.FRIEND('heroine_05'); if(think) TERMEND.rec(G).think.heroine_05=think; H.said=[]; H.picks=picks; return TERMEND.walkHome(GM,'heroine_05',term); };
    { const r=await walk('Y1S2',[0]), c=cgAt(C44), w=idx(W), n=idx(N1), a=idx('……我知道。'), ok=idx('好。'), e=idx(NY);
      check('3. 學姊答應（玩家先說）：回家路上第一句 → 便條旁白 →「……我知道。」……BCG-44 在「好。」（前一拍）→「（她把便條摺好……她沒有念。）」；兩句旁白沒有說話的人',r==='yes'&&w>=0&&n===w+1&&a===n+1&&c>=0&&ok===c+1&&e===ok+1&&H.said[n].who===null&&H.said[e].who===null&&!H.has(NS),JSON.stringify(H.said)); }
    { const r=await walk('Y1S2',[3,0]), c=cgAt(C44), s0=idx('你不講，那我講。'), n=idx(N1), s1=idx('這件事我想了一個禮拜。'), l=idx('……我喜歡你。'), s3=idx('……我原本想講得比較好。'), e=idx(NS);
      check('3. 學姊她說：「你不講，那我講。」→ 便條旁白 →「這件事我想了一個禮拜。」→ BCG-44 在「……我喜歡你。」→「……我原本想講得比較好。」→「（便條上寫滿了字。她一句都沒有照著念。）」',r==='sheSaid'&&s0>=0&&n===s0+1&&s1===n+1&&c===s1+1&&l===c+1&&s3===l+1&&e===s3+1&&!H.has(NY),JSON.stringify(H.said)); }
    { await walk('Y2S1',[0],'Y1S2'); const a=cgAt(C44)<0&&!H.has(N1)&&!H.has(NY)&&H.has('……這次是你先說。');
      await walk('Y2S1',[3,0],'Y1S2'); const b=cgAt(C44)<0&&!H.has(N1)&&!H.has(NS)&&H.has('上學期那件事，我到現在還是一樣。……你呢？');
      check('3. 學姊第二次（上次選「讓我想想」）：答應、她說都沒有便條、沒有 BCG-44（一個玩家只看到一次）',a&&b); }
    { const r=await walk('Y4S2',[0]);
      check('3. 學姊畢業那天傍晚（大四下）答應：一樣有便條那一拍、BCG-44 在「好。」',r==='yes'&&idx(N1)>=0&&cgAt(C44)===idx('好。')-1&&idx(NY)===idx('好。')+1,JSON.stringify(H.said)); } }
  // 已經寫好 cg 的事件：key 都登錄了（之前 ADV.cg 找不到就不顯示）
  { const src=['src/y34b3d.js','src/data/postgrad_lines.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
    const ids=['cg_depart_together_heroine01','cg_final_stage_heroine04','cg_last_row_kexin','cg_anniversary_23','cg_defense_day_heroine05','cg_this_time_heroine05'];
    check('3. 已經寫好的 cg 步驟（1B-12 CG-22、1B-15 BCG-03、1B-16 BCG-12、1B-20 CG-8、1B-25 BCG-10、學姊 2029 生日 BCG-39）都登錄了',ids.every(id=>src.includes("cg:'"+id+"'")&&!!REG[id]),ids.filter(id=>!REG[id]).join(' ')); }
  // 遊戲裡寫了 cg 步驟、還沒有圖的 id：只列出來（先寫 cg 步驟、圖之後才登錄是允許的做法，ADV.cg 找不到就不顯示）
  { const all=new Set(); const walk=d=>{ for(const f of fs.readdirSync(d)){ const p=path.join(d,f); if(fs.statSync(p).isDirectory()) walk(p); else if(/\.js$/.test(f)&&f!=='adv3d.js') for(const mm of fs.readFileSync(p,'utf8').matchAll(/cg:'(cg_[a-z0-9_]+)'/g)) all.add(mm[1]); } }; walk(path.join(ROOT,'src'));
    const no=[...all].filter(id=>!REG[id]); console.log('INFO src/ 裡寫的 cg 步驟 '+all.size+' 個 id；還沒有圖：'+(no.join(' ')||'（沒有）')); }
  // ---- 4. LICENSES ----
  { const L=fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8');
    check('4. LICENSES.md 記了這一批（第二批 40 張）和 CG-10 的 8 張合成',/CG 第二批 40 張/.test(L)&&/assets\/cg\/epilogue\/cg_reunion_/.test(L)&&/compose_reunion\.py/.test(L)); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
