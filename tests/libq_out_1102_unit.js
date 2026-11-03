// 圖書館小聲講：「走出館外」的旁白＋libOut（AA_595 1-B 表「建議改法」欄＋AA 2026-11-02 22:30 定稿；D127；任務 AA595-LIB-NOD-THERMOS-1102）——不需要瀏覽器。
//   1  20 場事件（1-B1、B2、B4、B6、B7、B11、B13、B14、B22、B23、B29、B35、B36、B44、B45、B46、B47、B51、B52、B55）：走出去那句在；那句之前說話的照加（小聲），之後的不加；LIBQ 配對
//   2  1-D10（invites.js 沛珊第一次去法圖的 firstAt 字串）：「（走出法圖）「館員人好好……」」是她說的、不加（小聲）；之後到道別都不加；字串版 LIBQ.isOut／scope、needsPrefix
//   3  Q16（rel_lines.js 以安約總圖朋友以上的見面旁白「閉館音樂響了……」）：之後的道別那句不加；有點熟（別句旁白）道別照加
// 修改前（libq2 38d65bd27）：第 1～3 節 FAIL。用法：node tests/libq_out_1102_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/libq_aa_1102_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就跳過 */ } }
GM.toast=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
check('0. LIBQ 載得進來',typeof LIBQ!=='undefined'&&typeof LIBQ.gate==='function');
const say0=GM.say; GM.say=async(who,t,o)=>say0(who,LIBQ.whisper(GM,who,t),o);   /* game3d.js 的 say */
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const P=H.E.player; const at=(zone,lv,x,z)=>{ H.G.zone=zone; P.lv=lv|0; P.obj.position.x=x||0; P.obj.position.z=z||0; };
const npc=id=>({id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x:1,y:0,z:1},rotation:{y:0}},pose:'read',idlePose:'read'});
const PRE='（小聲）';
const isQuiet=t=>t.startsWith(PRE)||/^（[^（）]*小聲。?）/.test(t);
const isAct=t=>/^（[^）]*）$/.test(String(t).trim());   /* 整句動作：本來就不加 */
const spoken=a=>a.filter(s=>s.who&&String(s.who).indexOf('手機')<0);
const balanced=()=>{ at('library',0,0,0); return LIBQ.quietNow(GM)===true; };

/* 演一場：在讀書區（LIBQ.quietNow＝true）演，找到走出去那句旁白；之前說話的都加了（小聲）、之後的都沒加 */
const runOut=async(lab,id,zone,lv,picks,outText,o)=>{ o=o||{};
  H.fresh(o.date||'2026-03-04',o.h||19,zone,o.flags); for(const f of o.friends||[]) H.FRIEND(f); at(zone,lv,0,0); LIBQ.reset();
  const e=ev(id); if(!e){ check(lab+'：找得到事件 '+id,false); return null; }
  check(lab+'：前置：在讀書區（不改的話會加（小聲））',LIBQ.quietNow(GM)===true);
  H.said=[]; H.picks=picks.slice(); let err=null; try{ await EVENTS.run(e); }catch(x){ err=String(x&&x.stack||x).split('\n').slice(0,2).join(' / '); }
  const S=H.said, k=S.findIndex(s=>!s.who&&s.t===outText), before=spoken(S.slice(0,Math.max(0,k))), after=spoken(S.slice(k+1));
  check(lab+'：演得完，走出去那句「'+outText+'」在',!err&&k>=0,err||J(H.lines()));
  if(o.nBefore!=null) check(lab+'：那句之前說話的 '+o.nBefore+' 句都加（小聲）',k>=0&&before.length===o.nBefore&&before.every(s=>isQuiet(s.t)||isAct(s.t))&&(o.nBefore===0||before.some(s=>isQuiet(s.t))),J(before));
  check(lab+'：那句之後說話的都不加（小聲）（至少一句）',k>=0&&after.length>0&&after.every(s=>!isQuiet(s.t)),J(after));
  check(lab+'：LIBQ 配對（之後讀書區又會加）',balanced());
  return {S,k,lines:H.lines()}; };

(async()=>{
await sec('1',async()=>{
  /* 1-B1 直屬學姊（閱覽室、大廳自習區）；台階、Café 不插 */
  await runOut('1-B1 ev_sis_w1（閱覽室）','ev_sis_w1','library',0,[],'（你們走到樓梯間。）',{date:'2025-09-10',h:15,nBefore:0});
  const r1=await runOut('1-B1 ev_sis_w1（大廳二樓自習區）','ev_sis_w1','library_hall',1,[],'（你們走到樓梯間。）',{date:'2025-09-10',h:15,nBefore:0});
  check('1-B1：先「（她抬頭看到你，點了一下頭，指了指門外。）」再「（你們走到樓梯間。）」，再接「學姊好……」',!!r1&&(r1.S[r1.k-1]||{}).t==='（她抬頭看到你，點了一下頭，指了指門外。）'&&/^學姊好/.test((r1.S[r1.k+1]||{}).t),r1&&J(r1.lines));
  H.fresh('2025-09-10',12.5,'cafe'); at('cafe',0,0,0); H.said=[]; await EVENTS.run(ev('ev_sis_w1'));
  check('1-B1：Café 版不插（不走樓梯間）',!H.said.some(s=>/樓梯間|指了指門外/.test(s.t)),J(H.lines()));
  /* 1-B2 晚到版（法圖、閱覽室、大廳自習區）；Café 不插 */
  await runOut('1-B2 ev_sis_w1_late（法圖）','ev_sis_w1_late','lawlib',1,['我不知道去哪裡找學姊'],'（你們走到樓梯間。）',{date:'2026-09-15',nBefore:0});
  await runOut('1-B2 ev_sis_w1_late（閱覽室）','ev_sis_w1_late','library',0,['我不知道去哪裡找學姊'],'（你們走到樓梯間。）',{date:'2026-09-15',nBefore:0});
  H.fresh('2026-09-15',19,'cafe'); at('cafe',0,0,0); H.said=[]; H.picks=['我不知道去哪裡找學姊']; await EVENTS.run(ev('ev_sis_w1_late'));
  check('1-B2：Café 版不插',!H.said.some(s=>/樓梯間|指了指門外/.test(s.t)),J(H.lines()));
  await runOut('1-B4 ev_sis_walk_alone','ev_sis_walk_alone','lawlib',1,[0],'（走到法圖門口，她才開口。）',{date:'2025-12-15',h:21.7,nBefore:0});
  await runOut('1-B6 ev_an_dorm_appeal','ev_an_dorm_appeal','library',0,[0],'（她把兩份草稿收起來，指了指外面。你們走到樓梯間。）',{nBefore:0});
  await runOut('1-B7 ev_an_dorm_appeal_result','ev_an_dorm_appeal_result','library',0,[],'（她指了指外面。你們走到樓梯間。）',{nBefore:0});
  await runOut('1-B11 ev_bohan_exam_group','ev_bohan_exam_group','library',0,[1],'（他收書出來，在總圖門口叫住你。）',{date:'2026-10-20',nBefore:0});
  const r13=await runOut('1-B13 ev_yutong_thanks（交往中）','ev_yutong_thanks','library',0,[1],'（你們走到樓梯間。）',{h:21.5,flags:{yutong_hospital:true,dating_heroine_03:true},nBefore:0});
  check('1-B13：開頭「（她看到你，闔上書，指了指外面。）」；結尾「閉館的時候叫我。」改旁白「（她趴在桌上，指了指手錶。）」',!!r13&&(r13.S[0]||{}).t==='（她看到你，闔上書，指了指外面。）'&&!r13.S.some(s=>s.t.includes('閉館的時候叫我'))&&(r13.S[r13.S.length-1]||{}).t==='（她趴在桌上，指了指手錶。）'&&!r13.S[r13.S.length-1].who,r13&&J(r13.lines));
  const r14=await runOut('1-B14 ev_xinci_double','ev_xinci_double','library',0,[0],'（她在便利貼上寫：『出去一下？』你們走到樓梯間。）',{nBefore:0});
  check('1-B14：「（總圖裡，她壓低聲音。）」換掉了',!!r14&&!r14.S.some(s=>s.t.includes('壓低聲音')));
  await runOut('1-B22 ev_yt_ta_news_lib','ev_yt_ta_news_lib','library_hall',1,[0],'（她收書出來，在門口叫住你。）',{date:'2027-09-13',nBefore:0});
  await runOut('1-B23 ev_kexin_study_really_lib','ev_kexin_study_really_lib','library',0,[0],'（閉館音樂響了。你們走出總圖。）',{date:'2028-09-23',h:14,nBefore:0});
  await runOut('1-B29 ev_sis_econ_graph','ev_sis_econ_graph','lawlib',1,['我也忘得差不多了'],'（她把筆電轉過來，指了指門外。）',{nBefore:0});
  const r35=await runOut('1-B35 ev_sis_lawlib_kevin','ev_sis_lawlib_kevin','lawlib',1,['那我不吵你們',0],'（法圖外的走廊。Kevin 趴在長椅上。）',{date:'2028-03-03',h:12.5,nBefore:0});
  check('1-B35：搬到走廊（「法圖最裡面那張桌子」那句換掉）',!!r35&&!r35.S.some(s=>s.t.includes('法圖最裡面那張桌子')));
  const r36=await runOut('1-B36 ev_sis15_flask','ev_sis15_flask','library',0,[0],'（她指了指外面。你們走到樓梯間。）',{date:'2026-01-14',h:15,nBefore:0});
  check('1-B36：「幫我看一下東西。……我去裝熱水。」改便利貼「（她在便利貼上寫：『幫我看一下東西。我去裝水。』）」；樓梯間在「她回來的時候」之後',!!r36&&r36.S.some(s=>!s.who&&s.t==='（她在便利貼上寫：『幫我看一下東西。我去裝水。』）')&&!r36.S.some(s=>s.t.includes('我去裝熱水'))&&(r36.S[r36.k-1]||{}).t==='（她回來的時候，你還坐在旁邊。）',r36&&J(r36.lines));
  await runOut('1-B44 ev_vf_y3_0214','ev_vf_y3_0214','lawlib',1,[1],'（借完書出來，在法圖門口。）',{date:'2028-02-14',h:19,nBefore:0});
  const r45=await runOut('1-B45 ev_an_sis_meet_lawlib','ev_an_sis_meet_lawlib','lawlib',1,[],'（閉館以後，你們在法圖門口又遇到。）',{date:'2027-11-10',h:20,nBefore:2});
  check('1-B45：借六法改便利貼「（便利貼：六法借我一下。）」',!!r45&&r45.S.some(s=>!s.who&&s.t==='（便利貼：六法借我一下。）')&&!r45.S.some(s=>s.t.includes('可以借一下六法嗎')),r45&&J(r45.lines));
  const r46=await runOut('1-B46 ev_sk01_soc','ev_sk01_soc','soclib',0,[0],'（社科圖門口。）',{date:'2025-09-18',h:12.5,nBefore:0});
  check('1-B46：「（他把統計課本拿起來，用下巴指了指位子。）」之後、對話之前',!!r46&&(r46.S[r46.k-1]||{}).t==='（他把統計課本拿起來，用下巴指了指位子。）'&&(r46.S[r46.k+1]||{}).t==='坐。課本是佔位用的，我沒在讀。',r46&&J(r46.lines));
  const r47=await runOut('1-B47 ev_sk12_soclib_table（陪她讀到閉館）','ev_sk12_soclib_table','soclib',0,[0],'（你們讀到十點。閉館的音樂響起來的時候，她出了一題機率題考你。你算錯了。）',{date:'2027-12-20',h:19.5,nBefore:6});
  check('1-B47：開頭「（她沒抬頭，用筆指了指對面的位子。）」',!!r47&&(r47.S[1]||{}).t==='（她沒抬頭，用筆指了指對面的位子。）',r47&&J(r47.lines));
  H.fresh('2027-12-20',19.5,'soclib'); at('soclib',0,0,0); LIBQ.reset(); H.said=[]; H.picks=[1]; await EVENTS.run(ev('ev_sk12_soclib_table'));
  check('1-B47：沒有陪到閉館的那幾支（沒走出去）：整場照加（小聲）',spoken(H.said).length>0&&spoken(H.said).every(s=>isQuiet(s.t)||isAct(s.t))&&balanced(),J(H.lines()));
  await runOut('1-B51 ev_yt_thursday_free','ev_yt_thursday_free','library',0,[0],'（她看到你，闔上書，指了指外面。）',{date:'2027-12-16',h:18.5,friends:['heroine_03'],nBefore:0});
  await runOut('1-B52 ev_yt_share_time','ev_yt_share_time','library',0,[0],'（讀完，你們走出總圖。）',{date:'2028-12-21',h:17.5,friends:['heroine_03'],nBefore:1});   /* AA_625 第 16 節：她在三樓先小聲問「我可以給你看一個東西嗎。」（一句加（小聲）），讀完才走出去 */
  /* 1-B55：B1 版前兩句改便條；選「我什麼都沒看到」走出總圖以後不加；#where／#sit 沒走出去，整場照加 */
  const r55=await runOut('1-B55 ev_mingxuan_notes_b1（我什麼都沒看到）','ev_mingxuan_notes_b1','library',0,[0],'走出總圖。',{date:'2025-11-04',h:22.5,nBefore:1});
  const NOTE=['（他在便利貼上寫：你沒看到。）','（又補一行：我在看漫畫啦。）'];
  check('1-B55：B1 版前兩句改便條（旁白）',!!r55&&NOTE.every(t=>r55.S.some(s=>!s.who&&s.t===t))&&!r55.S.some(s=>/……你沒看到。$|我在看漫畫啦。$/.test(s.t)&&s.who),r55&&J(r55.lines));
  for(const [k,lab] of [[1,'#where'],[2,'#sit']]){ H.fresh('2025-11-04',22.5,'library'); at('library',0,0,0); LIBQ.reset(); H.said=[]; H.picks=[k]; await EVENTS.run(ev('ev_mingxuan_notes_b1'));
    const sp=spoken(H.said);
    check('1-B55 '+lab+'：前兩句是便條、他之後說的照加（小聲）（沒走出去）',NOTE.every(t=>H.said.some(s=>!s.who&&s.t===t))&&sp.length>0&&sp.every(s=>isQuiet(s.t)||isAct(s.t))&&balanced(),J(H.lines())); }
  const base=ev('ev_mingxuan_notes');
  check('1-B55：公館原本那一場（M1）不受影響（前兩句照舊是他說的）',base.dialogue.some(l=>l.speaker==='classmate_mingxuan'&&l.text==='……你沒看到。')&&base.dialogue.some(l=>l.text==='（笑）我在看漫畫啦。'));
});

await sec('2',async()=>{
  check('2. LIBQ.isOut：「（走出法圖）「……」」、Q16 那句是；其他不是',LIBQ.isOut&&LIBQ.isOut('（走出法圖）「館員人好好。」')&&LIBQ.isOut('閉館音樂響了，她才抬頭問你晚餐吃什麼。')&&!LIBQ.isOut('「走出去。」')&&!LIBQ.isOut('閉館的廣播響了，她才抬頭。'));
  H.fresh('2026-10-07',15,'lawlib'); at('lawlib',1,0,0); LIBQ.reset();
  check('2. needsPrefix：開頭「（走出」的那一句本身不加',LIBQ.needsPrefix('（走出法圖）「館員人好好。」')===false&&LIBQ.whisper(GM,{name:'沛珊'},'（走出法圖）「館員人好好。」')==='（走出法圖）「館員人好好。」');
  /* INV.playLines＋scope：之前加、走出去那句起不加、結束配對 */
  const LQ=LIBQ.scope(); H.said=[]; const who={name:'沛珊',charId:'classmate_peishan'};
  try{ await INV.playLines(GM,who,['「前面。」','（走出法圖）「後面。」','「再後面。」'],undefined,LQ); await GM.say(who,'「道別。」'); } finally { LQ.end(); }
  check('2. INV.playLines 帶 scope：走出去以前的加（小聲）、那句是她說的、之後到道別都不加',J(H.said)===J([{who:'沛珊',t:PRE+'「前面。」'},{who:'沛珊',t:'（走出法圖）「後面。」'},{who:'沛珊',t:'「再後面。」'},{who:'沛珊',t:'「道別。」'}]),J(H.said));
  check('2. scope.end 以後配對（讀書區又會加）',balanced());
  /* 真的走一次：和沛珊第一次約法圖（INV.meet）*/
  const PS='classmate_peishan';
  H.fresh('2026-10-07',15,'lawlib'); H.FRIEND(PS); at('lawlib',1,0,0); LIBQ.reset();
  const iv=INV.accept(H.G,PS,'lawlib',H.G.day,15); const n=npc(PS);
  H.said=[]; let err=null; try{ await INV.meet(GM,iv,n); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  const S=H.said, k=S.findIndex(s=>s.t==='（走出法圖）「館員人好好。我以為法圖的人都很兇。」');
  check('2. 1-D10：櫃台那句旁白照留，下一句「（走出法圖）「館員人好好。我以為法圖的人都很兇。」」是沛珊說的、不加（小聲）',!err&&k>0&&S[k-1].t==='（她在借書櫃台問了館員三個問題，館員都回答了。）'&&!S[k-1].who&&S[k].who===SOCIAL.displayName(PS),err||J(H.lines()));
  const after=spoken(S.slice(k+1)), by=SOCIAL.byeLine(PS);
  check('2. 1-D10：之後的道別那句也不加（小聲）',k>0&&after.length>0&&after.every(s=>!isQuiet(s.t))&&(!by||after.some(s=>[].concat(by).some(b=>String(b.t||b).replace(/^「|」$/g,'')&&s.t.includes(String(b.t||b).replace(/^「|」$/g,''))))),J(after)+' bye='+J(by));
  check('2. 1-D10：見面結束 LIBQ 配對',balanced());
  /* 同一個地方第二次（firstAt 不演）：道別照加（小聲）＝只有走出去的那一次不加 */
  H.said=[]; H.G.hour=19; const iv2=INV.accept(H.G,PS,'lawlib',H.G.day,19); await INV.meet(GM,iv2,n);
  const sp2=spoken(H.said);
  check('2. 1-D10：第二次去法圖（沒有那句）：道別照加（小聲）',!H.said.some(s=>s.t.includes('走出法圖'))&&sp2.length>0&&sp2.every(s=>isQuiet(s.t)||isAct(s.t))&&balanced(),J(H.lines()));
});

await sec('3',async()=>{
  const AN='heroine_01', ML='閉館音樂響了，她才抬頭問你晚餐吃什麼。';
  H.fresh('2025-10-07',15,'library_hall'); H.FRIEND(AN); at('library_hall',1,0,0); LIBQ.reset();
  check('3. 前置：以安朋友以上，約總圖的見面旁白是 Q16 那句',SOCIAL.meetLine(AN,'library')===ML,J(SOCIAL.meetLine(AN,'library')));
  const iv=INV.accept(H.G,AN,'library',H.G.day,15), n=npc(AN);
  H.said=[]; let err=null; try{ await INV.meet(GM,iv,n); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  const S=H.said, k=S.findIndex(s=>!s.who&&s.t===ML), after=spoken(S.slice(k+1));
  check('3. Q16：閉館音樂那句之後的道別不加（小聲）',!err&&k>=0&&after.length>0&&after.every(s=>!isQuiet(s.t)),err||J(H.lines()));
  check('3. Q16：見面結束 LIBQ 配對',balanced());
  /* 對照：有點熟（見面旁白是別句）——道別照加 */
  H.fresh('2025-10-07',15,'library_hall'); H.FAMILIAR(AN); at('library_hall',1,0,0); LIBQ.reset();
  const ml2=SOCIAL.meetLine(AN,'library'); const iv2=INV.accept(H.G,AN,'library',H.G.day,15);
  H.said=[]; await INV.meet(GM,iv2,npc(AN)); const sp=spoken(H.said);
  check('3. 對照：有點熟（「'+ml2+'」不是走出去）：道別照加（小聲）',ml2!==ML&&sp.length>0&&sp.every(s=>isQuiet(s.t)||isAct(s.t))&&balanced(),J(H.lines()));
});

H.done();
})();
