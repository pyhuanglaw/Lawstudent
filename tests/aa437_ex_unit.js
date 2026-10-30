// AA_437（企劃線 0c97c3c05＝fc6f20bc0＋第 10 節，AA-B 2026-10-24）第 4、5、6、10 節——不需要瀏覽器。台詞逐字從稿讀出來比對（git show fc6f20bc0:…；B／C 的旁白讀同一個 commit 的 AA_315 2-2）。
//   4 以安新 15 前任版＝麵店長桌（story3d.js S.an15Noodle）：11/16 21:00 麵店團群組兩則（不是私訊）、11/17 18:15～19:30 阿鳳麵店長桌、阿哲／Alison 照 STORY.knows
//     （兩個都不認識＝從阿哲到「可以。……先等我上。」整段拿掉）、祐廷寫了什麼＝AA_315 2-2 的 B／C 第一句；新 16 送機前任版「……到了我傳給麵店團。」、AN_PAGE_GIVEN 不記。
//   5 新 21／事件 17：抓包以後分手、還沒重建（AA_227 的 D）＝以安只有「（她和媽媽站在傅鐘前面。看到你，點了一下頭。）」、語彤不說話；好好分開的照舊（友情版）。
//   6 主線 10 拆箱：前任的紙箱（CLEANUP_BOX）在第二步之後、第三步之前；打開＝每位一句（照分開的先後、最多最近兩位）＋蓋起來；不打開＝推到床底下、BOX_KEPT_Y4 'exbox'；
//     重新交往的不算；子晴照 D03 扭蛋；第三步選單不列；美國路線 12/23 一樣；主線 11 收拾遇到 'exbox' 跳過第一件（AA_318 第 4 節沒有那一句）。
// 修改前（開發分支 HEAD）：S.an15Noodle、S.exBoxWho、PG.exCaught 都沒有、送機還是「……理由欄，我自己寫。」——FAIL。用法：node tests/aa437_ex_unit.js
require('./alison.js');   // 讀稿的測試照慣例：git show 讀到的「小語」照匯入工具換成 Alison（這份稿沒有，照樣掛上）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const EXPORT=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|Y34B|V6EX|V6EX_LINES)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.Z3={ZONES:{}};
const loadErr=[]; for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/y34b3d.js','src/data/v6ex_lines.js','src/v6ex3d.js']){ try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
/* ---------- 稿 ---------- */
const SPEC_SHA='de83f9af2', P437='docs/story_planning/AA_437_回LAWWW_九題_新15前任長桌版_主線10前任紙箱.md', P315='docs/story_planning/AA_315_事件包_第一批_1A01到1A05.md';
const gitShow=p=>{ try{ return cp.execSync('git -c core.quotepath=false show '+SPEC_SHA+':"'+p+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const S437=gitShow(P437), S315=gitShow(P315);
const part=(s,a,b)=>{ const i=s.indexOf(a); if(i<0) return ''; const j=b?s.indexOf(b,i+a.length):-1; return s.slice(i,j<0?s.length:j); };
const quoteLines=s=>s.split('\n').map(l=>/^\s*>\s*(.+?)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]).map(t=>{ const k=t.indexOf('：'); return {sp:t.slice(0,k),text:t.slice(k+1)}; });
const SEC4=part(S437,'## 4.','## 5.'), SEC5=part(S437,'## 5.','## 6.'), SEC6=part(S437,'## 6.','## 7.');
const INVITE=quoteLines(part(SEC4,'**邀約**','**11/17'));
const TABLE=quoteLines(part(SEC4,'**11/17','- 阿哲、Alison'));
const SENDOFF=(quoteLines(part(SEC4,'**同一節的新 16',null))[0]||{}).text;
const NOD=(/只有旁白：(（[^（）]*）)/.exec(SEC5)||[])[1];
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l)&&!/^\|[-| :]+\|\s*$/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const BOX={top:(quoteLines(SEC6)[0]||{}).text,who:{}};
for(const r of rows(SEC6)){ const ch=/^「(.*)」$/.exec(r[0]||'');
  if(ch&&/最後一句旁白/.test(r[1])){ BOX.openOpt=ch[1]; BOX.close=(/最後一句旁白：(（[^（）]*）)/.exec(r[1])||[])[1]; }
  else if(ch){ BOX.keptOpt=ch[1]; BOX.kept=(/旁白：(（[^（）]*）)/.exec(r[1])||[])[1]; }
  else { const id={以安:'heroine_01',語彤:'heroine_03',芷若:'heroine_02',子晴:'heroine_04',學姊:'heroine_05',可昕:'kexin',沛珊:'classmate_peishan'}[r[0]]; if(!id) continue;
    BOX.who[id]=(/（[^（）]*）/.exec(r[1])||[])[0]; if(id==='heroine_04') BOX.zqNo=(/〔[^〕]*：(（[^（）]*）)〕/.exec(r[1])||[])[1]; } }
const F315=k=>{ const s=part(S315,'**'+k+'.','\n**'); const m=/^>\s*(（[^（）]*）)\s*$/m.exec(s); return m&&m[1]; };
const FORM={US:F315('B'),TW:F315('C')};
/* ---------- 共用 ---------- */
const AN='heroine_01', YT='heroine_03', ZR='heroine_02', ZQ='heroine_04', SIS='heroine_05', KX='kexin', PS='classmate_peishan';
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
GM.toast=()=>{};
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'dorm',flags); G.outings=[]; G.acts=G.acts||{att:{}}; E.player.busy=false; E.paused=false; E.interactables=[]; ROM.rec(G); return G; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const said=()=>H.said.map(s=>s.t);
const clear=p=>{ H.said=[]; H.opts=[]; H.cgs=[]; H.picks=(p||[]).slice(); };
const exAn=(how,key)=>{ const G=H.G; H.CLOSE(AN); const ok=ROM.start(G,AN); const e=ROM.end(G,AN,how||'apart_talk'); G.flags.CLEANUP_DONE=true; G.flags.cleanupDue=null; return ok&&e; };
const runPhone=(day,h0,h1)=>{ const G=H.G; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=0.05){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const name=id=>SOCIAL.displayName(id);
const SPK={以安:AN,阿哲:'zhe',Alison:'yu',旁白:null};
const want=(list)=>list.map(x=>({who:SPK[x.sp]==null?null:name(SPK[x.sp]),t:x.text}));
const got=()=>H.said.map(s=>({who:s.who,t:s.t}));
const d16=D('2027-11-16'), d17=D('2027-11-17'), d18=D('2027-11-18');
/* 前任、在麵店團：11/16 21:00 收到群組；回傳 G */
const exPlayer=(flags,how)=>{ const G=fresh('2027-11-10',12,'dorm',flags); exAn(how); PHONE.join(G,'noodle_team','麵店團'); return G; };
const noodle=async(p)=>{ at(d17,18.5); H.G.zone='noodle'; clear(p); return STORY.an15Noodle?STORY.an15Noodle(GM):false; };

(async()=>{
/* ======================= 0 稿 ======================= */
await sec(0,()=>{
  check('0. 讀得到稿（AA_437、AA_315 @ fc6f20bc0）、程式檔都載得到',!!S437&&!!S315&&!loadErr.length,loadErr.join('；'));
  check('0. 稿裡讀出來：邀約兩句、長桌 10 句、新 16 一句、新 21 旁白、紙箱（開頭、兩個選項、兩句旁白、七位＋子晴另一句）、B／C 旁白',
    INVITE.length===2&&TABLE.length===10&&!!SENDOFF&&!!NOD&&!!BOX.top&&!!BOX.openOpt&&!!BOX.keptOpt&&!!BOX.close&&!!BOX.kept&&Object.keys(BOX.who).length===7&&Object.values(BOX.who).every(Boolean)&&!!BOX.zqNo&&!!FORM.US&&!!FORM.TW,
    J({INVITE,n:TABLE.length,SENDOFF,NOD,BOX,FORM}));
});

/* ======================= 4 以安新 15 前任版 ======================= */
await sec('4a',async()=>{
  exPlayer(); runPhone(d16,20.9,21.1);
  const g=TH('g:noodle_team').filter(m=>m.from===AN).map(m=>m.text);
  check('4a. 前任、在麵店團：11/16 21:00 麵店團群組以安兩則（稿逐字），沒有私訊',J(g)===J(INVITE.map(x=>x.text))&&INVITE.every(x=>x.sp==='以安')&&!TH('p:heroine_01').length,J([g,TH('p:heroine_01').map(m=>m.text)]));
  at(d17,15.5); H.G.zone='cafe'; check('4a. 前任：Café（15:15～）不演',!STORY.an15Due(H.G));
  at(d17,18.2); H.G.zone='noodle'; const a=!!(STORY.an15ExDue&&STORY.an15ExDue(H.G)); at(d17,18.25); const b=!!(STORY.an15ExDue&&STORY.an15ExDue(H.G)); at(d17,19.45); const c=!!(STORY.an15ExDue&&STORY.an15ExDue(H.G)); at(d17,19.5); const d=!!(STORY.an15ExDue&&STORY.an15ExDue(H.G));
  check('4a. 窗口 18:15～19:30 人在麵店',!a&&b&&c&&!d,J([a,b,c,d]));
  at(d17,18.4); H.G.zone='noodle'; H.G.zone='gongguan'; check('4a. 不在麵店不演',!(STORY.an15ExDue&&STORY.an15ExDue(H.G)));
  fresh('2027-11-10',12,'dorm'); exAn(); runPhone(d16,20.9,21.1);
  check('4a. 前任、不在麵店團：沒有群組、也沒有私訊、長桌不演',!TH('g:noodle_team').some(m=>m.from===AN)&&!TH('p:heroine_01').length&&(at(d17,18.5),H.G.zone='noodle',!(STORY.an15ExDue&&STORY.an15ExDue(H.G))));
  fresh('2027-11-10',12,'dorm'); H.FAMILIAR(AN); PHONE.join(H.G,'noodle_team','麵店團'); runPhone(d16,20.9,21.1);
  check('4a. 沒有分手（FAMILIAR）：照舊私訊（Café），麵店團沒有那兩則',TH('p:heroine_01').length===1&&!TH('g:noodle_team').some(m=>m.from===AN));
  /* 出遊：11/17 不在麵店＝排「阿鳳麵店」18:30 */
  exPlayer(); runPhone(d16,20.9,21.1); at(d17,9); H.G.zone='dorm'; STORY.phoneRules(GM); const q=OUT.get(H.G,'y3_an15_ex');
  check('4a. 11/17 不在麵店：出遊「阿鳳麵店」18:30（late 1 小時＝19:30）、帶到麵店',!!q&&q.day===d17&&q.h===18.5&&q.late===1&&q.goto&&q.goto.zone==='noodle',J(q));
});
await sec('4b',async()=>{
  exPlayer({met_yu:true}); runPhone(d16,20.9,21.1);
  const r=await noodle(); const L=got();
  const W=want(TABLE.slice(0,8)).concat([{who:null,t:FORM.TW}],want(TABLE.slice(8)));
  check('4b. 阿哲、Alison 都認識、留在臺灣：稿的十句照順序逐字，C 的旁白在「她把志願表收回去」之前；沒有選項',r===true&&J(L)===J(W)&&!H.opts.length,J(L));
  check('4b. 旗標：AN15_SEEN＝那天、AN15_MODE noodle、ev_an_why_japan；不再演',H.G.flags.AN15_SEEN===d17&&H.G.flags.AN15_MODE==='noodle'&&!!H.G.events.done.ev_an_why_japan&&!STORY.an15ExDue(H.G));
  check('4b. 沒有 Café 那幾句（「你的呢？」「你不填？」、溫州街）',!said().some(t=>/你的呢|你不填|溫州街/.test(t)));
  at(d18,8); H.G.zone='dorm'; clear(); await STORY.routeNarr(GM); check('4b. 11/18 截止旁白（TW）照舊',J(said())===J(['（志願表你拿了一張，放在書包裡一個禮拜。最後沒有交。）','（你想，大四還沒開始。你想在這裡過。）']),J(said()));
});
await sec('4c',async()=>{
  const zheOnly=TABLE.filter(x=>x.sp!=='Alison'), yuOnly=TABLE.filter(x=>x.sp!=='阿哲'), none=TABLE.filter(x=>x.sp==='旁白'||x.sp==='以安').filter(x=>x.text!==TABLE[7].text);
  const ins=(arr,form)=>{ const i=arr.findIndex(x=>x.text===TABLE[8].text); return want(arr.slice(0,i)).concat([{who:null,t:form}],want(arr.slice(i))); };
  exPlayer({LAW_START_DAY:0,MAIN_D1:5,met_yu:true}); runPhone(d16,20.9,21.1); await noodle();
  check('4c. 只認識 Alison（阿哲還沒初遇）：沒有阿哲那句，Alison 和「可以。……先等我上。」照說',J(got())===J(ins(yuOnly,FORM.TW)),J(got()));
  exPlayer(); runPhone(d16,20.9,21.1); await noodle();
  const ZR10='申請不用想太久。明天中午截止。', zheOnly10=zheOnly.map(x=>x.text===TABLE[7].text?{sp:'以安',text:ZR10}:x);
  check('4c. 只認識阿哲：沒有 Alison 那句；以安回阿哲「'+ZR10+'」（AA_437 第 10 節第 2 點，稿裡有這一句）',S437.indexOf('以安：'+ZR10)>=0&&J(got())===J(ins(zheOnly10,FORM.TW)),J(got()));
  exPlayer({LAW_START_DAY:0,MAIN_D1:5}); runPhone(d16,20.9,21.1); await noodle();
  check('4c. 兩個都不認識：從「阿哲：」到「以安：可以。……先等我上。」整段拿掉',TABLE[7].sp==='以安'&&TABLE[5].sp==='阿哲'&&J(got())===J(ins(none,FORM.TW))&&!said().includes(TABLE[7].text),J(got()));
});
await sec('4d',async()=>{
  exPlayer(); H.date(SIS); runPhone(d16,20.9,21.1); await noodle();
  check('4d. 和學姊交往（US）：B 的旁白（AA_315 2-2 第一句），沒有「美國。好遠。」「理由欄」',said().includes(FORM.US)&&!said().some(t=>/好遠|學姊也去|理由欄/.test(t))&&said().indexOf(FORM.US)===said().indexOf(TABLE[8].text)-1,J(said()));
  at(d18,8); H.G.zone='dorm'; clear(); await STORY.routeNarr(GM); check('4d. 11/18（US、演過長桌）：不重複第一句，只有系辦那句',J(said())===J(['（你把表交到系辦。助理蓋了章，沒有抬頭。）']),J(said()));
  check('4d. 前任不會是日本路線（routeFor 只看交往中）',STORY.routeFor(H.G)==='US');
});
await sec('4e',async()=>{
  /* 新 16 送機前任版 */
  const ev=STORY_EVENTS.find(e=>e.id==='ev_an_sendoff'), so=ev.dialogue, i=so.findIndex(l=>l&&l.text===SENDOFF), j=so.findIndex(l=>l&&Array.isArray(l.choice)&&l.choice[0]&&l.choice[0].text==='「好。」');
  fresh('2028-03-25',10); exAn(); const exOK=i>=0&&EVENTS.cond(so[i].if); fresh('2028-03-25',10); H.FRIEND(AN); const noEx=i>=0&&EVENTS.cond(so[i].if);
  check('4e. 新 16 送機前任版：「'+SENDOFF+'」（稿逐字）在「好。」／揮手前面、只給前任；沒有「……理由欄，我自己寫。」',SENDOFF==='……到了我傳給麵店團。'&&i>=0&&j===i+1&&so[i].speaker===AN&&exOK&&!noEx&&!so.some(l=>l&&l.text==='……理由欄，我自己寫。'),J([i,j]));
  fresh('2028-03-25',10,'dorm'); exAn(); H.FRIEND(AN); clear(['「好。」']); await EVENTS.run(ev);
  check('4e. 前任演一次：說了那一句、AN_PAGE_GIVEN 不記、AN_SENDOFF went',said().includes(SENDOFF)&&!H.G.flags.AN_PAGE_GIVEN&&H.G.flags.AN_SENDOFF==='went',J(said()));
  const nd=(V6EX.NOT_DONE||[]).join('\n'); check('4e. V6EX.NOT_DONE 不再寫「新 15 志願表……問 AA」「S4 紙箱……沒有接」',!/新 15 志願表（story3d\.js 1A-05/.test(nd)&&!/拆箱「會看到」那一段（AA_123 2-3、AA_182 第 2 節）沒有接/.test(nd));
});

/* ======================= 5 新 21／事件 17 ======================= */
const grad=async(setup)=>{ const G=H.fresh('2029-06-02',12,'dorm'); ROM.rec(G); ['zhe','yu','classmate_bohan','classmate_xinci'].forEach(H.FAMILIAR); G.flags.GRADUATED=PG.gradDay(); G.events.done.ev_grad_family=1; setup(G); clear(); await H.run('grad'); return G; };
const endWith=(id,how)=>{ H.FRIEND(id); ROM.start(H.G,id); ROM.end(H.G,id,how); H.G.flags.CLEANUP_DONE=true; H.G.flags.cleanupDue=null; H.FRIEND(id); };
await sec(5,async()=>{
  check('5. PG.exCaught 有（抓包以後分手、還沒重建）',typeof PG.exCaught==='function');
  await grad(()=>{ endWith(AN,'mrel'); });
  check('5. 以安抓包以後分手（mrel）：只有「'+NOD+'」（稿逐字），沒有媽媽、沒有 CG-9、不記 IMPORTANT_CONVERSATION',H.has(NOD)&&!H.has('（以安的媽媽站在晨思鐘旁邊。）')&&!H.has('這是我媽。她是法官。')&&!H.cgs.includes('cg_graduation_mother_heroine01')&&!SOCIAL.has(AN,'IMPORTANT_CONVERSATION'),J(H.lines()));
  await grad(()=>{ endWith(AN,'two_hearts'); });
  check('5. 以安 two_hearts（11/11 攤牌）也是抓包',H.has(NOD)&&!H.has('（以安的媽媽站在晨思鐘旁邊。）'));
  await grad(()=>{ endWith(AN,'apart_talk'); });
  check('5. 以安好好分開：照舊友情版（介紹媽媽、CG-9，沒有「媽，這是祐廷」），沒有點頭那句',!H.has(NOD)&&H.has('（以安的媽媽站在晨思鐘旁邊。）')&&H.cgs.includes('cg_graduation_mother_heroine01')&&!H.has('媽，這是祐廷。'));
  await grad(()=>{ endWith(AN,'mrel'); H.CLOSE(AN); ROM.start(H.G,AN); });
  check('5. 抓包以後又重新交往（伴侶）：照伴侶那一段（「媽，這是祐廷。」），沒有點頭那句',!H.has(NOD)&&H.said.some(s=>/^媽，這是/.test(s.t)));
  await grad(()=>{ endWith(AN,'mrel'); ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); H.G.flags.CLEANUP_DONE=true; H.FRIEND(AN); });
  check('5. 抓包、重新交往、後來好好分開：照最近那一次（友情版）',!H.has(NOD)&&H.has('（以安的媽媽站在晨思鐘旁邊。）'));
  await grad(()=>{ endWith(YT,'two_hearts'); });
  check('5. 語彤抓包以後分手：事件 17 不說話（沒有傘那一段、沒有「恭喜」）',!H.has('（語彤穿著學士服，手上拿著一把深藍色的長柄傘。外面在飄雨。）')&&!H.said.some(s=>/^恭喜/.test(s.t)&&s.who===name(YT)),J(H.lines()));
  await grad(()=>{ endWith(YT,'apart_talk'); });
  check('5. 語彤好好分開：照舊事件 17 前任版（友情那一句）',H.has('（語彤穿著學士服，手上拿著一把深藍色的長柄傘。外面在飄雨。）')&&H.has('恭喜。……我還要一年，今天先穿一次學士服。'));
  await grad(()=>{ endWith(ZQ,'zq_zr'); });
  check('5. 子晴抓包以後分手：照舊不說話（AA_319「點頭，不說話」，⑥ 不演）',!H.has('欸不是，今天禮拜六欸，我本來要睡到中午。'));
});

/* ======================= 6 主線 10 前任的紙箱 ======================= */
const Y2=['civ','noodle','pothos','y1_0','y1_1','y1_2','y1_3','y1_4'];
const room=(flags)=>{ const d3=D('2028-09-03'); const G=fresh('2028-09-03',9,'dorm',Object.assign({EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW',ROOM_Y2:D('2026-09-06'),ROOM_Y2_ITEMS:Y2.slice(),POTHOS:true,pothosWaterN:2,
  ROOM_Y3:D('2027-09-05'),ROOM_Y3_ITEMS:['notes_y2','zq_usb'],ROOM_Y3_DISCARD:'noodle',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},flags||{})); G.day=d3; return G; };
const box=(...ids)=>ids.map((id,i)=>({id,day:D('2027-01-10')+i*40}));
const POTHOS='黃金葛。第四個窗台。它已經垂到書桌了。', KEEP_LAST='（全部拿出來。）', END='（三年。這個房間，你只會住一年。）';
await sec('6a',async()=>{
  room({CLEANUP_BOX:box(AN)}); clear([0,'（打開）','全部拿出來']); await STORY.unboxY4(GM); const T=said(), p=T.indexOf(POTHOS), top=T.indexOf(BOX.top);
  const o2=H.opts.find(o=>o.includes(BOX.openOpt)), keep=H.opts[H.opts.length-1];
  check('6a. 收過以安的紙箱：第二步（黃金葛）之後，「'+BOX.top+'」→「（打開）」「（不打開，放到床底下）」（稿逐字）',p>=0&&top===p+1&&J(o2)===J([BOX.openOpt,BOX.keptOpt]),J(T));
  check('6a. 打開：以安那一句、「'+BOX.close+'」；接著第三步、收尾',T[top+1]===BOX.who[AN]&&T[top+2]===BOX.close&&T[T.length-1]===END&&H.opts.indexOf(o2)===H.opts.length-2,J(T.slice(top)));
  check('6a. 第三步的選單不列紙箱；BOX_KEPT_Y4 null、EXBOX_Y4 open',!keep.some(t=>/紙箱，膠帶|前任|exbox|床底下/.test(t))&&keep[keep.length-1]===KEEP_LAST&&H.G.flags.BOX_KEPT_Y4===null&&H.G.flags.EXBOX_Y4==='open',J(keep));
  room({CLEANUP_BOX:box(AN)}); clear([0,'不打開','全部拿出來']); await STORY.unboxY4(GM); const T2=said(), t2=T2.indexOf(BOX.top);
  check('6a. 不打開：「'+BOX.kept+'」，不唸東西；「全部拿出來」以後 BOX_KEPT_Y4＝exbox、EXBOX_Y4 kept',T2[t2+1]===BOX.kept&&!T2.includes(BOX.who[AN])&&!T2.includes(BOX.close)&&H.G.flags.BOX_KEPT_Y4==='exbox'&&H.G.flags.EXBOX_Y4==='kept',J(T2.slice(t2)));
  room({CLEANUP_BOX:box(AN)}); clear([0,'不打開','隨身碟']); await STORY.unboxY4(GM);
  check('6a. 不打開、第三步又留了隨身碟：BOX_KEPT_Y4＝那一件（zq_usb），EXBOX_Y4 kept',H.G.flags.BOX_KEPT_Y4==='zq_usb'&&H.G.flags.EXBOX_Y4==='kept');
  room({}); clear([0,'全部拿出來']); await STORY.unboxY4(GM);
  check('6a. 沒有 CLEANUP_BOX：沒有這一步（照舊）',!said().includes(BOX.top)&&H.G.flags.EXBOX_Y4==null&&H.G.flags.BOX_KEPT_Y4===null);
});
await sec('6b',async()=>{
  const lineOf=(id,G)=>STORY.exBoxLine?STORY.exBoxLine(G,id):null;
  room({}); const bad=[]; for(const id of [AN,YT,ZR,SIS,KX,PS]) if(lineOf(id,H.G)!==BOX.who[id]) bad.push(id+'：'+lineOf(id,H.G));
  check('6b. 七位的那一句（稿的表逐字；可昕不帶「AA_185 3-4 那三件」的註）',!bad.length,bad.join(' / '));
  check('6b. 子晴：沒有在 D03 轉過扭蛋＝「'+BOX.zqNo+'」',lineOf(ZQ,H.G)===BOX.zqNo);
  H.G.dateMemory={heroine_04:{D03:{picks:['D03.demo','D03.gacha'],last:[],recent:[]}}}; check('6b. 子晴：D03 轉過扭蛋（dateMemory picks）＝「'+BOX.who[ZQ]+'」',lineOf(ZQ,H.G)===BOX.who[ZQ]);
  room({}); H.G.trips=[{who:ZQ,status:'done',locs:['D03'],spots:['D03.gacha']}]; check('6b. 子晴：做完的那一趟 spots 有 D03.gacha 也算',lineOf(ZQ,H.G)===BOX.who[ZQ]);
  /* 三位以上：最近兩位、照分開的先後 */
  room({CLEANUP_BOX:box(ZR,ZQ,SIS)}); clear([0,'（打開）','全部拿出來']); await STORY.unboxY4(GM); let T=said(), t=T.indexOf(BOX.top);
  check('6b. 三位（芷若→子晴→學姊）：只出最近兩位，子晴、學姊照先後；芷若不出',J(T.slice(t+1,t+4))===J([BOX.zqNo,BOX.who[SIS],BOX.close])&&!T.includes(BOX.who[ZR]),J(T.slice(t)));
  room({CLEANUP_BOX:box(AN,YT,AN)}); clear([0,'（打開）','全部拿出來']); await STORY.unboxY4(GM); T=said(); t=T.indexOf(BOX.top);
  check('6b. 同一位收過兩次（以安→語彤→以安）：照最後那一次＝語彤、以安',J(T.slice(t+1,t+4))===J([BOX.who[YT],BOX.who[AN],BOX.close]),J(T.slice(t)));
  room({CLEANUP_BOX:box(YT,AN)}); H.CLOSE(AN); H.G.flags.CLEANUP_DONE=true; ROM.start(H.G,AN); clear([0,'（打開）','全部拿出來']); await STORY.unboxY4(GM); T=said(); t=T.indexOf(BOX.top);
  check('6b. 已經和以安重新交往：她不算，只有語彤',J(T.slice(t+1,t+3))===J([BOX.who[YT],BOX.close]),J(T.slice(t)));
  room({CLEANUP_BOX:box(AN)}); H.CLOSE(AN); H.G.flags.CLEANUP_DONE=true; ROM.start(H.G,AN); clear([0,'全部拿出來']); await STORY.unboxY4(GM);
  check('6b. 紙箱裡只有重新交往的那一位：沒有這一步',!said().includes(BOX.top));
  room({CLEANUP_BOX:[{id:null,day:1},{id:'yu',day:2}]}); clear([0,'全部拿出來']); await STORY.unboxY4(GM);
  check('6b. 表上七位以外（或沒有 id）：沒有這一步',!said().includes(BOX.top));
});
await sec('6c',async()=>{
  /* 收拾的時刻 → CLEANUP_BOX（v6ex3d.js 的格式）→ 拆箱 */
  const G=room({}); G.day=D('2028-06-20'); G.hour=20; G.weekday=wdOf(G.day); H.CLOSE(KX); ROM.start(G,KX); ROM.end(G,KX,'drift'); clear(['還東西、收紙箱']); await V6EX.menu(GM,'dorm');
  check('6c. 收拾的時刻選「還東西、收紙箱」＝CLEANUP_BOX 有她',(G.flags.CLEANUP_BOX||[]).some(b=>b.id===KX));
  G.day=D('2028-09-03'); G.hour=9; clear([0,'（打開）','全部拿出來']); await STORY.unboxY4(GM); const T=said(), t=T.indexOf(BOX.top);
  check('6c. 拆箱：可昕那一句',t>=0&&T[t+1]===BOX.who[KX]&&T[t+2]===BOX.close,J(T.slice(t)));
  /* 美國路線 12/23 晚上 */
  room({EXCHANGE_ROUTE:'US',CLEANUP_BOX:box(PS)}); at('2028-12-23',19); clear([0,'（打開）','全部拿出來']); await STORY.roomY4FromAirport(GM); const U=said(), u=U.indexOf(BOX.top);
  check('6c. 美國路線 12/23 晚上的拆箱一樣（沛珊那一句；收尾「半年」）',u>=0&&U[u+1]===BOX.who[PS]&&U[U.length-1]==='（三年。這個房間，你只會住半年。）',J(U.slice(u)));
  /* 主線 11 收拾：BOX_KEPT_Y4＝exbox */
  const d61=D('2029-06-01'); fresh('2029-06-01',20,'dorm',{EXCH_RULE:1,EXCHANGE_ROUTE:'TW',ROOM_Y2:D('2026-09-06'),ROOM_Y2_ITEMS:Y2.slice(),ROOM_Y3:D('2027-09-05'),ROOM_Y3_ITEMS:['notes_y2','zq_usb'],ROOM_Y3_DISCARD:'noodle',ROOM_Y4:D('2028-09-03'),ROOM_Y4_ITEMS:['form'],BOX_KEPT_Y4:'exbox',EXBOX_Y4:'kept'});
  check('6c. roomItemName(exbox) 沒有名字（AA_318 第 4 節沒有那一句）',STORY.roomItemName(H.G,'exbox')===null);
  clear(['剩下的一起裝']); let ok=true; try{ await STORY.packY4(GM); }catch(e){ ok=false; } const P=said();
  const PK=['（床底下最裡面那個紙箱。膠帶還貼著。）','（你沒有打開，把它放進要帶回家的那一堆。）'];
  check('6c. 主線 11：EXBOX_Y4 kept＝第一個拿起來的是那個紙箱（AA_437 第 10 節第 3 點兩句旁白、稿裡逐字）；沒有「你從紙箱裡拿出…」那一步，其他照舊、最後「冬天的衣服」',ok&&PK.every(t=>S437.indexOf('旁白：'+t)>=0)&&J(P.slice(1,3))===J(PK)&&!P.some(t=>/從紙箱裡拿出|一年都沒有拿出來|null|undefined/.test(t))&&P[0]==='（明天畢業典禮。房間裡的東西，要一件一件裝回紙箱。）'&&P.includes('（床底下最後一個紙箱。上面是媽媽的字：「冬天的衣服」。）')&&!H.opts[0].some(t=>/exbox|null/.test(t)),J(P));
});
H.done();
})();
