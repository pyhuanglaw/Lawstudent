// 大五上（交換延畢）與畢業後篇的系統（AA_357，AA-C 2026-10-21 定稿 d07eb988；AA_353 第 3 節、AA_355 第 5 節第 2、3 題）——不需要瀏覽器。
//   G1 第 1-4 節＋第 2-1 節：資料頁年級 200 天懸崖（STORY.termAt）、畢業以後每個人「現在在做什麼」、延畢的玩家大五
// 每一項都在修改前的程式（開發分支 f0dcc337）跑過、都是 FAIL（見檔尾）。用法：node tests/y5_delay_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);   /* 大四下、畢業後篇的事件包（2-Y4-52 的 9/3、實習）；大五上（修改前沒有 y5s1_3d.js）*/
const hasY5=typeof Y5!=='undefined';
const D=k=>PG.DK(k);
const tag=id=>SOCIAL.yearTag(id);
const L_REG=POSTGRAD_LINES.REG;
/* 畢業後篇的存檔（6/2 撥穗、6/28 退宿回臺北的家、1A-08 選過；大四的事件都演過）*/
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };
(async()=>{
  // ===== G1 資料頁年級（AA_357 1-4、2-1）=====
  { H.fresh('2029-12-21',10,'dorm',{});
    check('G1. STORY.termAt：大四下結束 200 天以後（2029-12-21、2030-08-11）還是大四下，不是 null（原本往回只找 200 天）；學期中、寒暑假照舊（2027-07-20＝大二下、2025-09-17＝大一上、第一個學期以前＝null）',
      STORY.termAt(D('2029-12-21'))==='Y4S2'&&STORY.termAt(D('2030-08-11'))==='Y4S2'&&STORY.termAt(D('2029-06-10'))==='Y4S2'&&STORY.termAt(D('2027-07-20'))==='Y2S2'&&STORY.termAt(D('2025-09-17'))==='Y1S1'&&STORY.termAt(D('2024-06-01'))===null,
      [STORY.termAt(D('2029-12-21')),STORY.termAt(D('2030-08-11'))].join(',')); }
  { grad('2029-12-21',10);
    check('G1. 畢業以後 2029-12-21：以安「台大法研所・碩一」（原本變回「法律系・一年級」）',tag('heroine_01')==='台大法研所・碩一',tag('heroine_01'));
    check('G1. 畢業以後 2029-12-21：子晴的 presence 是工作室（taipei，不在台大）——原本 termAt＝null 變成「在」',STORY.presence('heroine_04',H.G).here===false&&STORY.presence('heroine_04',H.G).kind==='taipei',JSON.stringify(STORY.presence('heroine_04',H.G)));
    check('G1. 畢業以後 2029-12-21：不熟的同學不再寫「一年級」',!/一年級/.test(tag('pool_1')),tag('pool_1')); }
  { grad('2029-10-01',10);
    const want={heroine_01:'台大法研所・碩一',heroine_02:'兩點半 Café',heroine_03:'社會系・延畢（修法律必修）',heroine_04:'獨立遊戲工作室',heroine_05:'研究單位',kexin:'政大法律系畢業',zhe:'準備國考',classmate_bohan:'台大法研所・碩一',kai:'資工系畢業・上班',classmate_mingxuan:'德國',yu:'準備司法官',classmate_xinci:'事務所',npc_fangyt:'嘉義'};
    const bad=Object.keys(want).filter(id=>tag(id)!==want[id]), ps=tag('classmate_peishan');
    check('G1. 2-1 表：畢業以後 2029-10-01，十三個人照表寫「現在在做什麼」；沛珊「照現在（台南）」不換',!bad.length&&ps==='法律系・二年級',bad.map(id=>id+'='+tag(id)).join('、')+'｜沛珊='+ps); }
  { grad('2029-12-14',10); const a=tag('kexin'); grad('2030-07-02',10); const b=tag('heroine_03'); grad('2030-08-11',10); const c=tag('heroine_01'), m=tag('classmate_mingxuan');
    const G0=H.fresh('2029-08-20',10,'dorm',{}); const pre=tag('heroine_01');
    check('G1. 2-1 表「之後」那一欄：可昕 2029-12-14 起「律師（職前訓練）」、語彤 2030-07 起「準備國考」、以安 2030-08-11 起「紐約」、明軒 8/1 回來以後照原本的規則（不是德國）；還沒畢業（沒有 GRADUATED）照原本的規則（以安「法律系・四年級」）',
      a==='律師（職前訓練）'&&b==='準備國考'&&c==='紐約'&&m!=='德國'&&!!m&&pre==='法律系・四年級',[a,b,c,m,pre].join('｜')); }
  { grad('2029-10-01',10,{EXCHANGE_ROUTE:'JP'}); const y1=SOCIAL.playerYear(); grad('2029-08-20',10,{EXCHANGE_ROUTE:'US'}); const y0=SOCIAL.playerYear(); grad('2030-02-01',10,{EXCHANGE_ROUTE:'JP'}); const y2=SOCIAL.playerYear(); grad('2029-10-01',10,{EXCHANGE_ROUTE:'TW'}); const y3=SOCIAL.playerYear();
    check('G1. 延畢的玩家大五上（2029-09-03 起）算大五（SOCIAL.playerYear()＝5）；9/3 以前照大四；臺灣路線照大四',y1===5&&y0===4&&y2===5&&y3===4,[y1,y0,y2,y3].join(','));
    check('G1. CALENDAR：大五上 2029-09-03～12-23、16 週，只給延畢的玩家（termOf 不出現）',!!CALENDAR.termOfDelayed&&CALENDAR.termOfDelayed(D('2029-09-03')).week===1&&CALENDAR.termOfDelayed(D('2029-12-23')).week===16&&CALENDAR.termOfDelayed(D('2029-12-24'))===null&&CALENDAR.termOf(D('2029-10-01'))===null); }
  // ===== G2 退宿以後：家裡的選單「回宿舍」換成「出門」（AA_357 1-5）=====
  { const G=grad('2029-10-02',10); const Hm=HOME.rec(G); Hm.at=true; Hm.day=G.day; H.picks=['出門','公館商圈']; H.opts=[]; H.entered=[];
    let err=null; try{ await HOME.loop(GM); }catch(e){ err=e; }
    const menu=H.opts[0]||[], sub=H.opts[1]||[];
    check('G2. 退宿以後（MOVED_OUT）家裡的選單：沒有「回宿舍」，有「出門」',!err&&!menu.includes('回宿舍')&&menu.includes('出門'),(err?err.stack:'')+JSON.stringify(menu));
    check('G2. 「出門」三選一：校門口／公館／溫州街（＋不用了）；選公館＝進 3D 的公館、不在家了',JSON.stringify(sub)===JSON.stringify(['校門口','公館商圈','溫州街','不用了'])&&H.entered.includes('gongguan')&&!HOME.at(G),JSON.stringify(sub)+' '+JSON.stringify(H.entered)); }
  { const G=grad('2029-10-02',14); const can=!!HOME.canGo(G), lives=!!(HOME.livesHome&&HOME.livesHome(G)); G.zone='gongguan'; G.hour=26.6; H.entered=[];
    const go0=HOME.go; let went=0; HOME.go=async()=>{ went++; return true; }; let err=null; try{ await STORY.forceHome(GM); }catch(e){ err=e; } finally{ HOME.go=go0; }
    const G2=grad('2029-10-02',14,{HOME_AFTER:'gongguan'}); const can2=!!HOME.canGo(G2); const G3=grad('2029-06-20',14,{MOVED_OUT:undefined}); const can3=!!HOME.canGo(G3);
    check('G2. 退宿以後住臺北的家：週二也可以回家（手機「回臺北的家」）、從家裡出發；凌晨＝回家，不回宿舍；公館套房、還沒退宿的照原本的規則',can&&lives&&went===1&&!H.entered.includes('dorm')&&!err&&!can2&&!can3,[can,lives,went,JSON.stringify(H.entered),can2,can3].join(',')+(err?err.stack:'')); }
  // ===== G3 2029 不自動報名、2030 問報名（AA_357 1-6）=====
  { const G=H.fresh('2029-05-10',20.5,'dorm',{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}); H.at('2029-05-10',22); H.tick(); const jp=G.flags.BAR_REG;
    const G2=H.fresh('2029-05-10',20.5,'dorm',{EXCHANGE_ROUTE:'TW',Y4_PATH:'bar'}); H.at('2029-05-10',22); H.tick(); const tw=G2.flags.BAR_REG;
    check('G3. 延畢（日本路線、Y4_PATH bar）2029-05-10 不自動報名（BAR_REG 不設，7/14 走「沒報名」那一版）；臺灣路線照舊自動報名',jp!==true&&tw===true,[jp,tw].join(',')); }
  { const G=grad('2030-05-10',20,{EXCHANGE_ROUTE:'US',Y4_PATH:'grad'}); const before=PG.sits(G,2030); H.at('2030-05-10',21); const s=PG.due(G); H.said=[]; H.picks=['報名']; if(s) await PG.runStep(GM,s);
    check('G3. 延畢 2030-05-10 21:00 問一次（選研究所的也問；句子、選項照 2029 那一場）；選「報名」＝BAR_REG_2030、2030 進考場；問之前不算報名',!before&&!!s&&s.id==='reg_2030'&&H.has(L_REG.text)&&JSON.stringify(H.opts[0])===JSON.stringify(L_REG.opts)&&G.flags.BAR_REG_2030===true&&PG.sits(G,2030)&&PG.byId('exam_2030').cond(G),[before,s&&s.id,G.flags.BAR_REG_2030,JSON.stringify(H.opts[0])].join('｜')); }
  { const G=grad('2030-05-10',20,{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}); H.at('2030-05-12',1); const p=PG.pending(G); H.at('2030-08-03',7.9);
    const G2=grad('2030-05-10',20.9,{EXCHANGE_ROUTE:'TW',Y4_PATH:'bar',BAR_REG:true}); H.at('2030-05-10',21.5); const tw=PG.due(G2);
    check('G3. 延畢沒回答（過了 5/12）＝不報名：8/3 不進考場；臺灣路線 2030 不問',PG.done(G,'reg_2030')&&G.flags.BAR_REG_2030==null&&!PG.sits(G,2030)&&!PG.byId('exam_2030').cond(G)&&!(tw&&tw.id==='reg_2030'),[PG.rec(G).done.reg_2030,G.flags.BAR_REG_2030,PG.sits(G,2030),tw&&tw.id].join('｜')); }
  { const mk=(key,fl)=>{ const s={day:D(key),hour:10,stage:'law',flags:Object.assign({EXCHANGE_ROUTE:'JP'},fl)}; if(typeof PG.migrate==='function') PG.migrate(s); return s.flags; };
    const a=mk('2029-08-01',{BAR_REG:true}), b=mk('2030-06-01',{BAR_REG:true}), c=mk('2030-06-01',{}), d=mk('2030-06-01',{BAR_REG:false}), e=(()=>{ const s={day:D('2029-08-01'),hour:10,stage:'law',flags:{EXCHANGE_ROUTE:'TW',BAR_REG:true}}; if(typeof PG.migrate==='function') PG.migrate(s); return s.flags; })();
    check('G3. 舊存檔：延畢、BAR_REG 被自動設成 true 的，2030 報名以前讀檔＝清掉（5/10 再問）；已經過了報名時間的照舊規則（報了名＝BAR_REG_2030，不讓準備中的國考消失）；臺灣路線不動',
      typeof PG.migrate==='function'&&a.BAR_REG==null&&a.BAR_REG_2030==null&&b.BAR_REG_2030===true&&c.BAR_REG_2030===true&&d.BAR_REG_2030===false&&e.BAR_REG===true&&e.BAR_REG_2030==null,JSON.stringify([a,b,c,d,e])); }
  // ===== G4 大五上是一個學期：日期標籤、今日頁、美國路線補修（一鍵上課）、9/3 那一句分路線（AA_357 1-1）=====
  { const lab=(key,fl)=>{ grad(key,10,fl); return CLS.dayLabel(H.G); };
    const a=lab('2029-09-04',{EXCHANGE_ROUTE:'JP'}), b=lab('2029-10-16',{EXCHANGE_ROUTE:'US'}), c=lab('2029-12-24',{EXCHANGE_ROUTE:'JP'}), d=lab('2029-10-16',{EXCHANGE_ROUTE:'TW'}), e=lab('2029-12-23',{EXCHANGE_ROUTE:'JP'});
    check('G4. 日期標籤：延畢 9/4「大五上 第 1 週」、10/16「大五上 第 7 週」、12/23「大五上 第 16 週」（沒有期末考週）；12/24 起「寒假」；臺灣路線照原本',/・大五上 第 1 週$/.test(a)&&/・大五上 第 7 週$/.test(b)&&/・大五上 第 16 週$/.test(e)&&/寒假$/.test(c)&&!/大五/.test(d),[a,b,e,c,d].join('｜')); }
  { const line=(key,fl)=>{ grad(key,10,fl); return CLS.todayLine(H.G); };
    const tue=line('2029-09-04',{EXCHANGE_ROUTE:'JP',Y5_DAYS:'study'}), usMon=line('2029-09-10',{EXCHANGE_ROUTE:'US',Y5_DAYS:'work'}), usWed=line('2029-09-12',{EXCHANGE_ROUTE:'US'}),
      jpMon=line('2029-09-10',{EXCHANGE_ROUTE:'JP',Y5_DAYS:'work'}), jpThu=line('2029-09-13',{EXCHANGE_ROUTE:'JP',Y5_DAYS:'study'}), jpFri=line('2029-09-14',{EXCHANGE_ROUTE:'JP',Y5_DAYS:'bar'}), hol=line('2029-10-10',{EXCHANGE_ROUTE:'US'});
    check('G4. 今日頁：週二「法律實習　10:00（法扶）」；美國路線週一「補修：強制執行法」、週三「補修：法律倫理」；其他日子照 9/3 的選擇（家教／總圖／在家讀書）；國慶日放假',
      tue==='今天：法律實習　10:00（法扶）'&&usMon==='今天的課：09:10 補修：強制執行法'&&usWed==='今天的課：09:10 補修：法律倫理'&&jpMon==='今天：家教'&&jpThu==='今天：總圖'&&jpFri==='今天：在家讀書'&&/^今天放假（國慶日）/.test(hol),[tue,usMon,usWed,jpMon,jpThu,jpFri,hol].join('｜')); }
  { const G=grad('2029-09-10',8.5,{EXCHANGE_ROUTE:'US'}); G.zone='gongguan'; const html=CLS.todayHTML(G); H.said=[]; H.cards=[];
    const ok=hasY5&&/data-y5go="[^"]*enforcement"/.test(html)&&/補修：強制執行法/.test(html); let went=false; if(hasY5) went=await Y5.goClass(GM,D('2029-09-10')+':enforcement');
    check('G4. 美國路線週一：今日頁有「補修：強制執行法」和「直接去上課」；一鍵上課＝字卡、教授一句（大四上強制執行法那一週的內容）、時間到下課（12:10）、記上過了',
      ok&&went&&H.cards.some(c=>c[0]==='補修：強制執行法')&&H.said.some(s=>/^蔡老師：/.test(s.t))&&Math.abs(G.hour-(12+10/60))<0.02&&hasY5&&Y5.status(G,Y5.classItems(G)[0])==='done',[ok,went,JSON.stringify(H.cards),JSON.stringify(H.said.slice(0,2)),G.hour].join('｜')); }
  { const G=grad('2029-09-12',8.5,{EXCHANGE_ROUTE:'US'}); const Hm=HOME.rec(G); Hm.at=true; Hm.day=G.day; const html=CLS.todayHTML(G); H.picks=['直接去上課：補修：法律倫理','出門','不用了']; H.opts=[]; H.said=[];
    let err=null; const loop=HOME.loop(GM).catch(e=>{ err=e; }); await Promise.race([loop,new Promise(r=>setTimeout(r,3000))]);
    check('G4. 人在家（退宿以後住家裡）：手機的今日頁不放按鈕，家裡的選單有「直接去上課：補修：法律倫理」；上完回到家的選單',!err&&!/data-y5go/.test(html)&&(H.opts[0]||[]).includes('直接去上課：補修：法律倫理')&&hasY5&&Y5.status(G,Y5.classItems(G)[0])==='done'&&(H.opts[1]||[]).includes('出門'),(err?err.stack:'')+JSON.stringify(H.opts.slice(0,2))); }
  { const run=async route=>{ grad('2029-09-03',9,{EXCHANGE_ROUTE:route}); H.said=[]; H.picks=[0]; await R2Y4B.y5Plan(GM); return H.said.map(s=>s.t); };
    const us=await run('US'), jp=await run('JP');
    check('G4. 9/3 那一句分路線：美國「（這學期，週二去實習，週一、週三補兩門課。其他的日子——）」；日本照原句',us[0]==='（這學期，週二去實習，週一、週三補兩門課。其他的日子——）'&&jp[0]==='（這學期，只有週二要去實習。其他的日子——）',JSON.stringify([us[0],jp[0]])); }
  { check('G4. CALENDAR 有 2030 的農曆節日（除夕 2/2、初一 2/3；中秋 9/12）',CALENDAR.holiday(D('2030-02-02'))==='除夕'&&CALENDAR.holiday(D('2030-02-03'))==='春節'&&CALENDAR.holiday(D('2030-09-12'))==='中秋節',[CALENDAR.holiday(D('2030-02-02')),CALENDAR.holiday(D('2030-02-03')),CALENDAR.holiday(D('2030-09-12'))].join(',')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
// 修改前（開發分支 f0dcc337）：G1 8 項全部 FAIL；G2 3 項全部 FAIL；G3 4 項全部 FAIL；G4 6 項全部 FAIL。
