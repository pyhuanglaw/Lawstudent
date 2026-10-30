// 大五上（交換延畢）與畢業後篇的系統（AA_357，AA-C 2026-10-21 定稿 d07eb988；AA_353 第 3 節、AA_355 第 5 節第 2、3 題）——不需要瀏覽器。
//   G1 第 1-4 節＋第 2-1 節：資料頁年級 200 天懸崖（STORY.termAt）、畢業以後每個人「現在在做什麼」、延畢的玩家大五
//   G2 第 1-5 節：退宿以後家裡的選單「回宿舍」換成「出門」（校門口／公館／溫州街）；住家裡隨時回家、凌晨回家
//   G3 第 1-6 節：延畢 2029 不自動報名（7/14 沒報名那一版）、2030-05-10 問一次、沒回答＝不報名、舊存檔
//   G4 第 1-1 節：大五上的日期標籤、今日頁、美國路線補修一鍵上課、9/3 那一句分路線、LUNAR 2030
//   G5 第 1-2、2-2、3、4 節：接家教的錢、最後一次實習、2029 中秋、可昕第五年、大五上女朋友的期末約會、作息與閒聊、跳日期那一句（AA_355 5-2 一跳出最後一句）、
//      日本（三選一各一輪）、美國（和可昕交往）9/2→12/23 的模擬
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
    check('G1. 2-1 表「之後」那一欄：可昕 2029-12-14 起「律師（職前訓練）」、語彤 2030-07 起「準備國考」、以安 2030-08-11 起「紐約」、明軒 2030-08-01 以後照樣「德國」（AA_363 T4：畢業以後不退回「法律系・四年級」；修改前 FAIL）；還沒畢業（沒有 GRADUATED）照原本的規則（以安「法律系・四年級」）',
      a==='律師（職前訓練）'&&b==='準備國考'&&c==='紐約'&&m==='德國'&&pre==='法律系・四年級',[a,b,c,m,pre].join('｜')); }
  { const L=SOCIAL.PG_TAG.kai, n=L.length; L.push(['2030-03-01',null]); grad('2030-04-01',10); const k=tag('kai'); L.splice(n); grad('2029-08-20',10); const s=tag('heroine_01'); grad('2031-05-01',10); const y=tag('classmate_mingxuan'), z=tag('heroine_04');
    check('G1. AA_363 T4 通則：畢業以後表上沒有新的一列（或那一列是 null）就沿用最後一列，不回到學年的規則（所有在表上的人）；2029-06-02～08-31 表還沒開始＝照原本的年級（照現在）',
      k==='資工系畢業・上班'&&s==='法律系・四年級'&&y==='德國'&&z==='獨立遊戲工作室',[k,s,y,z].join('｜')); }
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
  /* AA_363 T7-2：住公館套房的（台灣路線準備國考，HOME_AFTER gongguan）已經退宿——凌晨回套房（公館），不走回宿舍；在套房醒來 */
  { const G=grad('2029-10-02',14,{HOME_AFTER:'gongguan',Y4_PATH:'bar'}); G.zone='campus'; G.hour=26.6; H.entered=[]; H.said=[]; H.cards=[]; let err=null; try{ await STORY.forceHome(GM); }catch(e){ err=e; }
    const L=H.said.map(x=>x.t), E1=H.entered.slice(), C1=H.cards.map(c=>c[0]);
    const G2=grad('2029-10-02',14,{HOME_AFTER:'gongguan',Y4_PATH:'bar',EPILOGUE_DONE:true}); G2.zone='gongguan'; G2.hour=23; H.entered=[]; let err2=null; try{ await STORY.sleepNow(GM); }catch(e){ err2=e; } const E2=H.entered.slice();
    const G3=grad('2029-06-20',14,{HOME_AFTER:undefined,MOVED_OUT:undefined}); G3.zone='campus'; G3.hour=26.6; H.entered=[]; H.said=[]; try{ await STORY.forceHome(GM); }catch(e){} const E3x=H.entered.slice(), L3=H.said.map(x=>x.t);
    check('G2. AA_363 T7-2 公館套房：凌晨 02:36 在校園＝「已經凌晨了。」→「公館的套房」→ 回到公館（不是「你的腳自己往宿舍走。」、不進宿舍）；在套房醒來＝公館；還沒退宿的照舊走回宿舍（修改前 FAIL）',
      !err&&typeof HOME.suite==='function'&&HOME.suite(G)&&L[0]==='已經凌晨了。'&&!L.includes('已經凌晨了。你的腳自己往宿舍走。')&&C1.includes('公館的套房')&&E1[0]==='gongguan'&&!E1.includes('dorm')&&!err2&&E2.includes('gongguan')&&!E2.includes('dorm')&&E3x.includes('dorm')&&L3.includes('已經凌晨了。你的腳自己往宿舍走。'),
      (err?err.stack:'')+(err2?err2.stack:'')+JSON.stringify({L,E1,C1,E2,E3x,L3})); }
  // ===== G3 2029 不自動報名、2030 問報名（AA_357 1-6）=====
  { const G=H.fresh('2029-05-10',20.5,'dorm',{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}); H.at('2029-05-10',22); H.tick(); const jp=G.flags.BAR_REG;
    const G2=H.fresh('2029-05-10',20.5,'dorm',{EXCHANGE_ROUTE:'TW',Y4_PATH:'bar'}); H.at('2029-05-10',22); H.tick(); const tw=G2.flags.BAR_REG;
    check('G3. 延畢（日本路線、Y4_PATH bar）2029-05-10 不自動報名（BAR_REG 不設，7/14 走「沒報名」那一版）；臺灣路線照舊自動報名',jp!==true&&tw===true,[jp,tw].join(',')); }
  { const G=grad('2030-05-10',20,{EXCHANGE_ROUTE:'US',Y4_PATH:'grad'}); const before=PG.sits(G,2030); H.at('2030-05-10',21); const s=PG.due(G); H.said=[]; H.picks=['報名']; if(s) await PG.runStep(GM,s);
    check('G3. 延畢 2030-05-10 21:00 問一次（選研究所的也問；句子、選項照 2029 那一場）；選「報名」＝BAR_REG_2030、2030 進考場；問之前不算報名',!before&&!!s&&s.id==='reg_2030'&&H.has(L_REG.text)&&JSON.stringify(H.opts[0])===JSON.stringify(L_REG.opts)&&G.flags.BAR_REG_2030===true&&PG.sits(G,2030)&&PG.byId('exam_2030').cond(G),[before,s&&s.id,G.flags.BAR_REG_2030,JSON.stringify(H.opts[0])].join('｜')); }
  { const G=grad('2030-05-10',20,{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}); H.at('2030-05-12',1); const p=PG.pending(G); H.at('2030-08-03',7.9);
    const G2=grad('2030-05-10',20.9,{EXCHANGE_ROUTE:'TW',Y4_PATH:'bar',BAR_REG:true}); H.at('2030-05-10',21.5); const tw=PG.due(G2);
    check('G3. 延畢沒回答（過了 5/12）＝不報名：8/3 不進考場；臺灣路線 2030 不問（錯過的當下記 BAR_REG_2030＝false，BUG-PG-REG2030-MIGRATE-1021；原本留 null、讀檔會變成有報名）',PG.done(G,'reg_2030')&&G.flags.BAR_REG_2030===false&&!PG.sits(G,2030)&&!PG.byId('exam_2030').cond(G)&&!(tw&&tw.id==='reg_2030'),[PG.rec(G).done.reg_2030,G.flags.BAR_REG_2030,PG.sits(G,2030),tw&&tw.id].join('｜')); }
  { const G=grad('2029-05-10',20.5,{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}); H.at('2029-05-10',22); H.tick(); OUT.plan(G,{id:'y4_july',ev:'ev_none',day:D('2029-07-14'),h:19,late:0.5,place:'x',title:'x'}); H.at('2029-07-14',10); const s=PG.due(G); H.said=[]; if(s) await PG.runStep(GM,s);
    check('G3. 延畢＋Y4_PATH bar：7/14 白天是「沒報名」那一版（AA_350 N2），不是「離一試還有二十一天」',!!s&&s.id==='r2y4b_july_day_nobar'&&H.has('（白天沒有排什麼事。畢業以後的第一個七月，一天變得很長。）')&&!H.has('（白天照樣在總圖。離一試還有二十一天。）'),(s&&s.id)+JSON.stringify(H.said.map(x=>x.t))); }
  { const mk=(key,fl)=>{ const s={day:D(key),hour:10,stage:'law',flags:Object.assign({EXCHANGE_ROUTE:'JP'},fl)}; if(typeof PG.migrate==='function') PG.migrate(s); return s.flags; };
    const a=mk('2029-08-01',{BAR_REG:true}), b=mk('2030-06-01',{BAR_REG:true}), c=mk('2030-06-01',{}), d=mk('2030-06-01',{BAR_REG:false}), e=(()=>{ const s={day:D('2029-08-01'),hour:10,stage:'law',flags:{EXCHANGE_ROUTE:'TW',BAR_REG:true}}; if(typeof PG.migrate==='function') PG.migrate(s); return s.flags; })();
    check('G3. 舊存檔：延畢、BAR_REG 被自動設成 true 的，2030 報名以前讀檔＝清掉（5/10 再問）；已經過了報名時間的照舊規則（報了名＝BAR_REG_2030，不讓準備中的國考消失）；臺灣路線不動',
      typeof PG.migrate==='function'&&a.BAR_REG==null&&a.BAR_REG_2030==null&&b.BAR_REG_2030===true&&c.BAR_REG_2030===true&&d.BAR_REG_2030===false&&e.BAR_REG===true&&e.BAR_REG_2030==null,JSON.stringify([a,b,c,d,e]));
    const f=mk('2030-06-01',{PG:{done:{reg_2030:'missed'}}}), g=mk('2030-06-01',{BAR_REG:true,PG:{done:{reg_2030:'missed'}}});
    { const G={day:D('2030-05-13'),hour:10,stage:'law',flags:{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}}; PG.pending(G); const F=G.flags;
      check('G3c. 2030 的報名問題時間過了沒演到（錯過）：當下就記 BAR_REG_2030＝false——日期卡（PG.reg2030）和考不考（PG.sits）都是不報名，不再照 Y4_PATH',F.PG&&F.PG.done&&F.PG.done.reg_2030==='missed'&&F.BAR_REG_2030===false&&PG.reg2030(G)===false&&!PG.sits(G,2030),JSON.stringify({done:F.PG&&F.PG.done,reg:F.BAR_REG_2030})); }
    check('G3b. 這一版錯過 2030 的報名問題（PG.done.reg_2030＝missed，沒回答＝不報名）：存檔再讀檔還是不報名（BAR_REG_2030＝false），不會變成有報名（BUG-PG-REG2030-MIGRATE-1021，BB 10-21）',f.BAR_REG_2030===false&&g.BAR_REG_2030===false,JSON.stringify([f,g])); }
  // ===== G4 大五上是一個學期：日期標籤、今日頁、美國路線補修（一鍵上課）、9/3 那一句分路線（AA_357 1-1）=====
  { const lab=(key,fl)=>{ grad(key,10,fl); return CLS.dayLabel(H.G); };
    const a=lab('2029-09-04',{EXCHANGE_ROUTE:'JP'}), b=lab('2029-10-16',{EXCHANGE_ROUTE:'US'}), c=lab('2029-12-24',{EXCHANGE_ROUTE:'JP'}), d=lab('2029-10-16',{EXCHANGE_ROUTE:'TW'}), e=lab('2029-12-23',{EXCHANGE_ROUTE:'JP'});
    check('G4. 日期標籤：延畢 9/4「大五上 第 1 週」、10/16「大五上 第 7 週」、12/23「大五上 第 16 週」（沒有期末考週）；12/24 起「寒假」；臺灣路線沒有大五',/・大五上 第 1 週$/.test(a)&&/・大五上 第 7 週$/.test(b)&&/・大五上 第 16 週$/.test(e)&&/寒假$/.test(c)&&!/大五/.test(d),[a,b,e,c,d].join('｜'));
    const tw=lab('2029-10-17',{EXCHANGE_ROUTE:'TW'}), twHol=lab('2029-10-10',{EXCHANGE_ROUTE:'TW'}), twSep=lab('2029-09-03',{EXCHANGE_ROUTE:'TW'}), twAug=lab('2029-09-02',{EXCHANGE_ROUTE:'TW'}), twLate=lab('2030-02-20',{EXCHANGE_ROUTE:'TW'}),
      jpJan20=lab('2030-01-20',{EXCHANGE_ROUTE:'JP'}), jpCert=lab('2030-01-21',{EXCHANGE_ROUTE:'JP'}), usMar=lab('2030-03-05',{EXCHANGE_ROUTE:'US'}), noGrad=(()=>{ H.fresh('2029-10-17',10,'dorm',{EXCHANGE_ROUTE:'TW'}); return CLS.dayLabel(H.G); })();
    check('G4. AA_363 T7-1 沒延畢的畢業生 2029-09-03 起：日期標籤只寫日期和星期（「10/17 週三」；國定假日照寫「10/10 週三・國慶日」，AA_363 第 4 節），不寫學期、不寫寒假（修改前「10/17 週三・寒假」）；9/2 以前照原本「暑假」；交換延畢的領證書（2030-01-21）起也一樣、1/20 以前照原本「寒假」',
      tw==='10/17 週三'&&twHol==='10/10 週三・國慶日'&&twSep==='9/3 週一'&&/・暑假$/.test(twAug)&&twLate==='2/20 週三'&&/・寒假$/.test(jpJan20)&&jpCert==='1/21 週一'&&usMar==='3/5 週二'&&/・寒假$/.test(noGrad),[tw,twHol,twSep,twAug,twLate,jpJan20,jpCert,usMar,noGrad].join('｜')); }
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
  { const h=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), y=h.indexOf('src/y5s1_3d.js');
    check('G4. 接線：index.html 載入 src/y5s1_3d.js（在 classes3d、home3d、termend3d、postgrad3d、r2y4b3d、us_life3d 之後、GAME.boot 之前）',
      y>0&&['src/classes3d.js','src/home3d.js','src/termend3d.js','src/postgrad3d.js','src/r2y4b3d.js','src/us_life3d.js'].every(f=>h.indexOf(f)>0&&h.indexOf(f)<y)&&y<h.indexOf('GAME.boot()')); }
  { check('G4. CALENDAR 有 2030 的農曆節日（除夕 2/2、初一 2/3；中秋 9/12）',CALENDAR.holiday(D('2030-02-02'))==='除夕'&&CALENDAR.holiday(D('2030-02-03'))==='春節'&&CALENDAR.holiday(D('2030-09-12'))==='中秋節',[CALENDAR.holiday(D('2030-02-02')),CALENDAR.holiday(D('2030-02-03')),CALENDAR.holiday(D('2030-09-12'))].join(',')); }
  // ===== G5-4 跳日期那一句（AA_357 第 4 節、AA_353 第 3 節；AA_355 第 5 節第 2 題：一跳出最後一句）=====
  { const cl=(fl,a,b)=>{ const G=grad(b,10,fl); return PG.cardLine(G,D(a),D(b)); };
    const s1=cl({EXCHANGE_ROUTE:'JP'},'2029-06-02','2029-06-28'), s2=cl({EXCHANGE_ROUTE:'JP'},'2029-06-28','2029-07-12'), s3=cl({EXCHANGE_ROUTE:'JP'},'2029-08-04','2029-09-03'), tw=cl({EXCHANGE_ROUTE:'TW',BAR_REG:false},'2029-06-02','2029-06-28');
    check('G5. 延畢的 2029 夏天三句（AA_353 第 3 節）：6/3～（美國路線「還差一門實習和兩門課」，AA_382 第 1 節第 2 項）、7 月、8 月；臺灣路線照原本的表',s1==='（同屆的人都畢業了。你還差一門實習，九月再回學校。）'&&PG.cardLine(grad('2029-06-28',10,{EXCHANGE_ROUTE:'US'}),D('2029-06-02'),D('2029-06-28'))==='（同屆的人都畢業了。你還差一門實習和兩門課，九月再回學校。）'&&s2==='（七月。退宿以後住在家裡。不用趕早八，反而醒得很早。）'&&s3==='（八月。同屆的人在考國考。你在群組裡傳了一句加油，很快就被洗下去了。）'&&tw==='（畢業以後的第一個禮拜，你每天睡到自然醒。……然後就睡不著了。）',JSON.stringify([s1,s2,s3,tw])); }
  { const one=(fl,a,b)=>{ const G=grad(b,10,fl); return PG.cardLine(G,D(a),D(b)); };
    const st=one({EXCHANGE_ROUTE:'JP',Y5_DAYS:'study'},'2029-09-03','2029-09-11'), wk=one({EXCHANGE_ROUTE:'JP',Y5_DAYS:'work'},'2029-09-03','2029-09-11'), br=one({EXCHANGE_ROUTE:'JP',Y5_DAYS:'bar'},'2029-09-03','2029-09-11');
    const G=grad('2029-09-11',10,{EXCHANGE_ROUTE:'US',Y5_DAYS:'work'}); const u1=PG.cardLine(G,D('2029-09-03'),D('2029-09-11')), u2=PG.cardLine(G,D('2029-09-11'),D('2029-09-22')), u3=PG.cardLine(G,D('2029-09-22'),D('2029-10-16'));
    check('G5. 大五上第一週：三選一各一句（總圖／家教／國考）；美國路線第一次跳先出「週一、週三補修兩門課……都是大四的學弟妹。」（AA_382 第 1 節第 4 項），下一次跳再出那一段的句子',
      st==='（開學第一週。總圖三樓的位子，坐的大多是不認識的臉。）'&&wk==='（你接了兩個家教。一個國三，一個高二。）'&&br==='（你把國考的書在書桌上排成一排。先從民法開始。）'&&u1==='（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）'&&u2==='（國三那個學生問你，法律系是不是要背很多。你說還好。他不信。）'&&u3==='（家教的錢第一次匯進來。你沒有馬上花。）',JSON.stringify([st,wk,br,u1,u2,u3])); }
  { const COMMON='（週二去法扶。其他的日子，一天和一天很像。）', BAR='（刑法的書，書邊都翻黑了。）';
    const G=grad('2029-11-20',10,{EXCHANGE_ROUTE:'JP',Y5_DAYS:'bar'}); const c1=PG.cardLine(G,D('2029-10-16'),D('2029-11-20')), c3=PG.cardLine(G,D('2029-12-18'),D('2029-12-24')), c4=PG.cardLine(G,D('2029-12-24'),D('2030-01-21'));
    const Gi=grad('2029-11-20',10,{EXCHANGE_ROUTE:'JP',Y5_DAYS:'bar'}); const i1=PG.cardLine(Gi,D('2029-10-16'),D('2029-11-01')), i2=PG.cardLine(Gi,D('2029-11-01'),D('2029-11-20'));
    const Ge=grad('2029-11-19',10,{EXCHANGE_ROUTE:'JP',Y5_DAYS:'bar'}); const e1=PG.cardLine(Ge,D('2029-10-16'),D('2029-11-19'));
    const Gn=grad('2029-11-20',10,{EXCHANGE_ROUTE:'JP'}); const n1=PG.cardLine(Gn,D('2029-10-16'),D('2029-11-20'));
    check('G5. AA_363 T3 同一段有共通和三選一：這一跳落在範圍最後一天以後（10/16 → 11/20，之後的跳不會再碰到 10/17～11/19）＝出三選一（「刑法的書……」），共通的不出（修改前先出共通）',
      c1===BAR,JSON.stringify([c1]));
    check('G5. AA_363 T3 落點還在範圍裡（10/16 → 11/01）照原本：共通先出，下一跳（11/01 → 11/20）出三選一；落在範圍最後一天（11/19）＝之後的跳碰不到這一段，也出三選一；9/3 沒有選（沒有三選一可出）照舊出共通',
      i1===COMMON&&i2===BAR&&e1===BAR&&n1===COMMON,JSON.stringify([i1,i2,e1,n1]));
    check('G5. 12/19～12/23「大五上結束了……」（這一段只有共通：照現在）；寒假「跨年那天晚上……」',
      c3==='（大五上結束了。這一次，沒有期末考。）'&&c4==='（跨年那天晚上，你在家。煙火是從電視上看的。）',JSON.stringify([c3,c4])); }
  { const r4=(fl,a,b)=>{ const G=grad(b,10,fl); return PG.cardLine(G,D(a),D(b)); };
    const bar=r4({EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'},'2030-03-15','2030-04-20'), gr=r4({EXCHANGE_ROUTE:'JP',Y4_PATH:'grad'},'2030-03-15','2030-04-20'), m1=r4({EXCHANGE_ROUTE:'US',Y4_PATH:'bar',BAR_REG_2030:false},'2030-05-10','2030-05-25'), m2=r4({EXCHANGE_ROUTE:'US',Y4_PATH:'grad',BAR_REG_2030:true},'2030-05-10','2030-05-25');
    const jan=r4({EXCHANGE_ROUTE:'JP'},'2030-01-21','2030-02-02'), cny=r4({EXCHANGE_ROUTE:'JP'},'2030-02-01','2030-02-11'), feb=r4({EXCHANGE_ROUTE:'JP'},'2030-02-16','2030-03-15');
    check('G5. 2030 年初：證書、過年、二月（AA_382 第 1 節第 6 項）；「報名」那兩列 5/10 以前照 Y4_PATH（bar＝報名），問過的照回答',
      jan==='（證書放在書桌上。你媽買了一個框，還沒裝進去。）'&&cny==='（過年。親戚問你什麼時候畢業。你說上個月。）'&&feb==='（二月。學弟妹開學了。這是你第一次，開學跟你沒有關係。）'&&bar==='（四月。你每天早上九點到總圖。這次是為了國考。）'&&gr==='（四月。你開始寫履歷。寫到「交換」那一欄，寫了很久。）'&&m1==='（五月。群組裡，去年畢業的人在聊上班。你看了，沒有回。）'&&m2==='（五月。國考報名的表格，你檢查了兩次才送出去。）',JSON.stringify([jan,cny,feb,bar,gr,m1,m2])); }
  // ===== G5 1-2 接家教的錢、3-3 最後一次實習 =====
  { const m0=GM.money; GM.money=n=>{ H.G.money+=n; };
    const G=grad('2029-09-03',10,{EXCHANGE_ROUTE:'JP',Y5_DAYS:'work'}); const a=G.money; H.at('2029-09-24',10); STORY.phoneRules(GM); const b=G.money; H.at('2029-12-30',10); STORY.phoneRules(GM); STORY.phoneRules(GM); const c=G.money;
    const G2=grad('2029-09-03',10,{EXCHANGE_ROUTE:'JP',Y5_DAYS:'study'}); const a2=G2.money; H.at('2029-12-30',10); STORY.phoneRules(GM); const c2=G2.money; GM.money=m0;
    check('G5. 1-2 接家教：大五上每週 +1,200（三週後 +3,600、學期結束共 16 週 19,200；重複跑不重複入帳）；去總圖的沒有',b-a===3600&&c-a===19200&&G.flags.Y5_PAY_WEEKS===16&&c2===a2,[b-a,c-a,G.flags.Y5_PAY_WEEKS,c2-a2].join(',')); }
  { const G=grad('2029-12-18',9.9,{EXCHANGE_ROUTE:'US',Y5_INTERN:[1,2,3]}); H.at('2029-12-18',10); const s=PG.due(G); H.said=[]; H.opts=[]; H.picks=['讀懂一半']; if(s) await PG.runStep(GM,s);
    const L=H.said.map(x=>(x.who?x.who+'：':'')+x.t);
    check('G5. 3-3 12/18 10:00 最後一次實習（延畢、不能錯過）：照 AA 稿；選「讀懂一半。」＝「一半，可以了。」；Y5_INTERN 加 4',!!s&&s.id==='y5_intern4'&&JSON.stringify(L)===JSON.stringify(['（最後一次實習。律師把你九月影印的第一份卷宗拿出來，還放在櫃子最下面。）','律師：這份你影的。第一頁，現在讀得懂嗎？','律師：一半，可以了。','（出去的時候，走廊的塑膠椅上坐著一個沒見過的阿伯。他在等。）'])&&JSON.stringify(H.opts[0])==='["「讀得懂。」","「讀懂一半。」"]'&&G.flags.Y5_INTERN.includes(4),(s&&s.id)+JSON.stringify(L)); }
  // ===== G5 3-1 2029 中秋（畢業後篇所有玩家、麵店團）=====
  const moonSetup=(fl,ppl)=>{ const G=grad('2029-09-20',20.9,fl); PHONE.join(G,'noodle_team','麵店團'); for(const id of ppl||[]) H.FRIEND(id); H.at('2029-09-20',21.05); H.tick(); return G; };
  { const G=moonSetup({EXCHANGE_ROUTE:'TW'},['classmate_bohan','heroine_03','heroine_01','yu','classmate_mingxuan']); const M=H.msgs('g:noodle_team'), m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='pg_moon29');
    if(m) PHONE.answer(G,'pg_moon29',0); STORY.phoneRules(GM); const q=OUT.get(G,'pg_moon29'); H.at('2029-09-22',17.5); H.said=[]; H.opts=[]; H.picks=['不知道']; if(q) await OUT.go(GM,q);
    const L=H.said.map(x=>(x.who?x.who+'：':'')+x.t), nm=id=>SOCIAL.displayName(id);
    const want=['（河濱。烤肉架是阿哲借的，和大一那年同一個。）',nm('classmate_bohan')+'：（手上拿著一本書）我只待一個小時。研究所的報告。',nm('heroine_03')+'：（拿出一顆柚子）……今年蛋糕店有開。我還是買柚子。',nm('heroine_01')+'：（到了以後先看一下手機，然後收進包包）……今天不讀。',
      nm('zhe')+'：（手機舉高）明軒，看。月亮。……他說德國現在是中午。','（螢幕裡，明軒那邊天很亮。他揮了一下手。）',nm('yu')+'：明年中秋，我們還湊得到這麼多人嗎？',nm('yu')+'：……我也不知道。所以今年要吃多一點。','（柚子皮後來被阿哲戴在頭上。這件事，每年都有人做。）'];
    check('G5. 3-1 9/20 21:00 麵店團阿哲三則＋「去。」／「這次不行。」；回「去。」＝9/22 18:00 河濱，照 AA 稿（認識的人各一句、明軒的視訊、Alison 的選擇），MIDAUTUMN_2029＝went',
      JSON.stringify(M)===JSON.stringify(['禮拜六中秋','河濱 六點 一樣','明軒那邊我開視訊 讓他看月亮'])&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["去。","這次不行。"]'&&!!q&&q.day===D('2029-09-22')&&q.h===18&&JSON.stringify(L)===JSON.stringify(want)&&JSON.stringify(H.opts[0])==='["「湊得到。」","「不知道。」"]'&&G.flags.MIDAUTUMN_2029==='went',JSON.stringify(M)+JSON.stringify(L)); }
  { const G=moonSetup({EXCHANGE_ROUTE:'JP'},[]); PHONE.answer(G,'pg_moon29',1); STORY.phoneRules(GM); H.at('2029-09-22',22.1); H.tick(); const ph=H.msgs('g:noodle_team').includes('📷（河濱，烤肉架，螢幕裡的明軒在揮手）');
    const G2=moonSetup({EXCHANGE_ROUTE:'US'},[]); PHONE.answer(G2,'pg_moon29',0); STORY.phoneRules(GM); const q=OUT.get(G2,'pg_moon29'); H.at('2029-09-22',17.5); H.said=[]; H.picks=[]; if(q) await OUT.go(GM,q); const L=H.said.map(x=>x.t);
    const G3=grad('2029-09-20',20.9,{EXCHANGE_ROUTE:'TW'}); H.at('2029-09-20',21.05); H.tick(); const none=!(G3.msgs||[]).some(x=>x.ask&&x.ask.id==='pg_moon29');
    check('G5. 3-1「這次不行。」＝9/22 22:00 群組照片（不扣關係）；延畢的也可以去；沒見過的人那一句不出、明軒不熟＝「（阿哲對著手機講了一下話。）」、沒有 Alison 的選擇；不在麵店團＝沒有',
      G.flags.MIDAUTUMN_2029==='no'&&ph&&JSON.stringify(L)===JSON.stringify(['（河濱。烤肉架是阿哲借的，和大一那年同一個。）','（阿哲對著手機講了一下話。）','（柚子皮後來被阿哲戴在頭上。這件事，每年都有人做。）'])&&G2.flags.MIDAUTUMN_2029==='went'&&none,[G.flags.MIDAUTUMN_2029,ph,JSON.stringify(L),none].join('｜')); }
  /* AA_363 T2：「這次不行。」那張照片是阿哲傳的（群組顯示「阿哲」）；T9：中秋出遊的交通「捷運＋走路 約 30 分鐘」（從家裡出發也是這一句）*/
  { const G=moonSetup({EXCHANGE_ROUTE:'TW'},[]); PHONE.answer(G,'pg_moon29',1); STORY.phoneRules(GM); H.at('2029-09-22',22.1); H.tick(); const m=(G.msgs||[]).find(x=>x.text==='📷（河濱，烤肉架，螢幕裡的明軒在揮手）');
    check('G5. AA_363 T2 中秋「這次不行。」那張照片：阿哲傳的，群組顯示「阿哲」（修改前沒有名字）',!!m&&m.th==='g:noodle_team'&&m.from==='zhe'&&PHONE.who(m)==='阿哲',JSON.stringify(m)); }
  { const G=moonSetup({EXCHANGE_ROUTE:'TW'},[]); PHONE.answer(G,'pg_moon29',0); STORY.phoneRules(GM); const q=OUT.get(G,'pg_moon29'), home=q?OUT.trip(G,q,true):null, out=q?OUT.trip(G,q):null;
    const G2=moonSetup({EXCHANGE_ROUTE:'TW'},[]); PHONE.answer(G2,'pg_moon29',0); OUT.plan(G2,{id:'pg_moon29',ev:'ev_pg_moon29',day:D('2029-09-22'),h:18,late:0.5,place:'河濱',title:'中秋：河濱',travel:'騎車約 15 分鐘',travelH:0.25}); STORY.phoneRules(GM); const q2=OUT.get(G2,'pg_moon29');   /* 舊版本已經排好的 */
    const other=OUT.trip(G2,{travel:'走過去約 15 分鐘',travelH:0.25},true);
    check('G5. AA_363 T9 中秋出遊的交通：「捷運＋走路 約 30 分鐘」（0.5 小時）——從家裡出發、在外面出發都是這一句；舊版本排好的「騎車約 15 分鐘」出發前換掉；別的出遊從家裡出發照舊「捷運＋公車 約 30 分鐘」（修改前 FAIL）',
      !!q&&q.travel==='捷運＋走路 約 30 分鐘'&&q.travelH===0.5&&home.travel==='捷運＋走路 約 30 分鐘'&&home.travelH===0.5&&out.travel==='捷運＋走路 約 30 分鐘'&&!!q2&&q2.travel==='捷運＋走路 約 30 分鐘'&&OUT.trip(G2,q2,true).travel==='捷運＋走路 約 30 分鐘'&&other.travel==='捷運＋公車 約 30 分鐘'&&other.travelH===0.5,
      JSON.stringify([q&&[q.travel,q.travelH],home,out,q2&&[q2.travel,q2.travelH],other])); }
  // ===== G5 3-2 可昕交往第五年（2029-10-17）=====
  const kx5=async(fl,picks)=>{ const G=grad('2029-10-10',20.9,fl); H.FRIEND('kexin'); H.date('kexin'); H.at('2029-10-10',21.05); STORY.phoneRules(GM); PHONE.tick(G); const K=(G.msgs||[]).filter(m=>m.tag==='kx_anniv_ask5'||(m.th==='p:kexin'&&/第五年|下午有空/.test(m.text)));
    const ask=K.find(m=>m.ask); if(ask) PHONE.answer(G,ask.ask.id,2); STORY.phoneRules(GM); const q=OUT.get(G,'kx_anniv5'); H.at('2029-10-17',18); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r0=Object.assign({},SOCIAL.rel('kexin')); if(q) await OUT.go(GM,q); return {G,K:K.map(m=>m.text),q,L:H.said.map(x=>x.t),O:H.opts.slice(),r0,r1:Object.assign({},SOCIAL.rel('kexin'))}; };
  { const a=await kx5({EXCHANGE_ROUTE:'TW'}), b=await kx5({EXCHANGE_ROUTE:'JP'});
    check('G5. 3-2 可昕第五年：10/10 21:00「下禮拜三。第五年。」「……地點你選。我那天下午有空。」（地點選單照第 2～4 年）；10/17 地點之後兩句，延畢「……你一月拿證書。……」、不延畢「我十二月放榜。你八月考。……」',
      JSON.stringify(a.K)===JSON.stringify(['下禮拜三。第五年。','……地點你選。我那天下午有空。'])&&!!a.q&&a.q.day===D('2029-10-17')&&a.L.includes('五年。我們認識的時候，你還在經濟系。')&&a.L.includes('我十二月放榜。你八月考。……我們兩個，同一年開始。')&&!a.L.includes('……你一月拿證書。我們兩個，同一年開始。')
      &&b.L.includes('……你一月拿證書。我們兩個，同一年開始。')&&!b.L.includes('我十二月放榜。你八月考。……我們兩個，同一年開始。')&&a.L.indexOf('五年。我們認識的時候，你還在經濟系。')<a.L.indexOf('我十二月放榜。你八月考。……我們兩個，同一年開始。')&&a.G.flags.KX_ANNIV&&a.G.flags.KX_ANNIV[5]==='river',JSON.stringify([a.K,a.L,b.L])); }
  /* AA_363 T1：第五年的卡片第一頁「（把卡片翻到第一頁）第五年。……明年的卡片，換你寫。」（smile）＋自己的一組選項（不用第三、四年那一組），之後照舊「後面幾頁，她說：『回去再看。』」*/
  { const P1='（把卡片翻到第一頁）第五年。……明年的卡片，換你寫。', END='後面幾頁，她說：『回去再看。』', R=['你說的喔。……錯字我會圈起來。','你自己想。……你想五年了吧。','（她看著你收好，嘴角動了一下。）'];
    const runs=[]; for(const k of [0,1,2]) runs.push(await kx5({EXCHANGE_ROUTE:k===1?'JP':'TW'},[k]));
    const ok=runs.every((r,k)=>{ const i=r.L.indexOf(P1); return i>0&&r.L[i+1]===R[k]&&r.L[i+2]===END&&r.L.length===i+3&&R.every((x,j)=>j===k||!r.L.includes(x))&&JSON.stringify(r.O[0])===JSON.stringify(['「好。」','「寫什麼？」','（把卡片收進外套口袋）'])
      &&r.L.indexOf('你人來了就好。')<i&&r.L.indexOf('五年。我們認識的時候，你還在經濟系。')<i&&r.G.flags.KX_ANNIV[5]==='river'; });
    const EV=STORY_EVENTS.find(e=>e.id==='ev_kexin_anniversary_yn'), ex=t=>{ const l=EV.dialogue.find(x=>x.text===t); return l?l.speaker+'/'+(l.expression||''):null; }, ch=EV.dialogue.find(x=>x.choice&&x.choice.some(c=>c.text==='「寫什麼？」'));
    const exprOk=ex(P1)==='kexin/smile'&&ex(R[0])==='kexin/teasing'&&ex(R[1])==='kexin/laugh'&&ex(R[2])==='null/'&&!!ch&&ch.choice.every(c=>Object.keys(c).sort().join()==='goto,text');
    check('G5. AA_363 T1 可昕第五年：卡片第一頁「第五年。……明年的卡片，換你寫。」（smile）→「好。」「寫什麼？」「（把卡片收進外套口袋）」→「你說的喔。……錯字我會圈起來。」（teasing）／「你自己想。……你想五年了吧。」（laugh）／「（她看著你收好，嘴角動了一下。）」→「後面幾頁，她說：『回去再看。』」；不出第三、四年那一組；數值、旗標照第二～四年（選項不加數值，KX_ANNIV {5}）（修改前 FAIL）',
      ok&&exprOk,JSON.stringify(runs.map(r=>[r.L.slice(-4),r.O[0]]))+' expr='+exprOk); }
  // ===== G5 3-4 大五上女朋友的學期末約會（延畢、交往中，12/19～12/23）=====
  const INV5={heroine_01:'你實習結束了吧。……今天我訂位子。',heroine_02:'禮拜五九點，等我下班。',heroine_03:'打烊以後。我煮。',heroine_04:'你實習完了吧 宵夜 我想吃兩份',heroine_05:'你實習結束了吧？今天晚上我空著。法圖旁邊那家。',classmate_peishan:'學期結束了吧！你下來，我們吃熱的。'};
  const TB5={heroine_01:['碩一的課，每一堂都要先讀一整本。','……我讀得完。只是睡得少。'],heroine_02:['回來以後，店長把週五晚上的班排回給我。','……我沒說要。她就排了。'],heroine_03:['我們都延畢。你一學期，我一年。','……阿姨說，這樣比較划算。'],heroine_04:['工作室接了新案子。這次第一關是我做的。','……我做得很慢。他們都在等我。'],heroine_05:['上班以後，計畫本裡都是公司的事。','……今天這一格，是我自己寫的。'],classmate_peishan:['台南的冬天不太冷。','……你下來的時候，不用帶外套。']};
  { const bad=[]; for(const id in INV5){ const G=grad('2029-12-19',20,{EXCHANGE_ROUTE:'JP'}); H.FRIEND(id); H.date(id); H.at('2029-12-19',20.6); STORY.phoneRules(GM); PHONE.tick(G);
      { const dd=((TERMEND.rec(G,'Y5S1').gfDay)||{})[id]; if(dd!=null&&dd>=0){ PG.setT(G,H.E,dd,12.1); STORY.phoneRules(GM); PHONE.tick(G); } else bad.push(id+' 沒排日子'); }   /* AA_378 #3：先排好那一天，當天 12:00 才傳 */ const got=H.msgs('p:'+id);
      if(!got.includes(INV5[id])) bad.push(id+' 邀約='+JSON.stringify(got)); const P=TERMEND.rec(G,'Y5S1').plan||{}; if((P.heart||[]).length||(P.friend||[]).length||P.fallback) bad.push(id+' 只能有女朋友的約');
      PHONE.answer(G,'te_gf_Y5S1_'+id,0); STORY.phoneRules(GM); const q=OUT.get(G,'te_gf_Y5S1_'+id); if(!q||q.day<D('2029-12-19')||q.day>D('2029-12-23')) bad.push(id+' 出遊='+JSON.stringify(q&&q.day));
      H.said=[]; await TERMEND.dinner(GM,{te:{term:'Y5S1',who:id,kind:'gf'}}); const L=H.said.map(x=>x.t); if(!(L.indexOf(TB5[id][0])>=0&&L.indexOf(TB5[id][1])===L.indexOf(TB5[id][0])+1)) bad.push(id+' 飯桌='+JSON.stringify(L)); }
    const G=grad('2029-12-19',20,{EXCHANGE_ROUTE:'US'}); H.FRIEND('kexin'); H.date('kexin'); H.at('2029-12-19',20.9); STORY.phoneRules(GM); PHONE.tick(G); const kx=H.msgs('p:kexin'); const qk=OUT.get(G,'te_kx_Y5S1');
    H.said=[]; await TERMEND.dinner(GM,{te:{term:'Y5S1',who:'kexin',kind:'kexin'}}); const LK=H.said.map(x=>x.t);
    const Gt=grad('2029-12-20',20,{EXCHANGE_ROUTE:'TW'}); H.date('heroine_01'); const wt=TERMEND.window(Gt);
    check('G5. 3-4 大五上女朋友的學期末約會：六位邀約照 AA 稿（芷若、語彤照原本）、只有女朋友的約、出遊在 12/19～12/23、飯桌是 Y5S1 那一句；可昕「學期結束了吧」三則、河堤、飯桌兩句；臺灣路線沒有大五上',
      !bad.length&&!!qk&&JSON.stringify(kx.slice(-3))===JSON.stringify(['學期結束了吧','你沒有期末考 我知道',TERMEND.dayWord(D('2029-12-19'),qk.day)+' 河堤 五點半'])/* AA_460 第 5 節：地點前寫約會那天（今天／明天／禮拜幾）*/&&LK.includes('十四號以後，我就是律師了。……還要受訓。')&&LK.includes('受訓的時候不能看手機。……你週末再打給我。')&&!wt,bad.join('｜')+JSON.stringify([kx,LK,wt])); }
  // ===== G5 2-2 人在哪裡（七處矛盾＋過時的閒聊）=====
  { const ent=(id,key,h)=>{ const G=grad(key,h,{EXCHANGE_ROUTE:'TW'}); return STORY.schedEnt(CHARACTERS[id],G); }, z=e=>e?e.zone:null;
    const k0=ent('kai','2029-06-20',20), kai0=k0?(k0.zone||k0.away||null):null, kai1=z(ent('kai','2029-07-02',20)), kai2=z(ent('kai','2029-07-06',22.5));   /* kai0：大二起他住別棟（BUG-KAI-Y2-SCHED-1022，c89f17df）＝「在他那棟宿舍」，不是你這棟的 dorm */
    grad('2029-07-02',20,{}); const kp=STORY.presence('kai',H.G), kAway=STORY.awayOnDate('kai',H.G);
    const sis0=z(ent('heroine_05','2029-06-20',10)), sis1=z(ent('heroine_05','2029-07-03',10)), sis2=z(ent('heroine_05','2029-07-04',20)), sis3=z(ent('heroine_05','2029-07-02',20)), sis4=z(ent('heroine_05','2029-07-07',11));   /* sis0（6/20 週三 10:00）：BB_206 第 2 節，大三起平日白天在研究室、法圖，不在總圖（原本 library）；7 月起照 AA_357 2-2 拿掉 */
    const zr1=z(ent('heroine_02','2029-09-04',11)), zr2=z(ent('heroine_02','2029-09-07',15)), zr3=z(ent('heroine_02','2029-09-05',20)), xc0=z(ent('classmate_xinci','2029-05-22',16)), xc1=z(ent('classmate_xinci','2029-06-05',16));
    grad('2028-08-01',10,{}); delete H.G.flags.GRADUATED; const fy=STORY.presence('npc_fangyt',H.G), fyR=STORY.reachable('npc_fangyt',H.G); grad('2028-07-10',10,{}); const fyT=STORY.presence('npc_fangyt',H.G).kind;
    grad('2029-07-01',10,{}); const p1=STORY.presence('pool_1',H.G), p4=STORY.presence('pool_4',H.G); grad('2029-06-20',10,{}); const p1b=STORY.presence('pool_1',H.G).here;
    const okAll=kai0==='在他那棟宿舍'&&kai1==null&&kai2==='gongguan'&&kp.kind==='taipei'&&kAway&&sis0==='lawlib'&&sis1==null&&sis2!=='lawlib'&&sis3==='cafe'&&sis4==='library'&&zr1!=='campus'&&zr2!=='campus'&&zr3==='cafe'&&xc0==='library'&&xc1!=='library'
      &&fy.here===false&&fy.city==='嘉義'&&!fyR&&fyT==='trip'&&p1.here===false&&p1.kind==='after'&&p1b===true;
    check('G5. 2-2 作息、presence：阿凱 6/28 起不在宿舍（6/20 還在他那棟宿舍；臺北上班、只留週五晚上公館）；學姊 7 月起平日白天、週三法圖拿掉（一二四晚上 Café、週六上午總圖）；芷若 9 月起校園兩筆拿掉；心慈 6 月起平日下午總圖拿掉；方奕廷 2028-07 起在嘉義；同屆不熟的同學 6/28 起畢業不在學校',
      okAll,JSON.stringify({kai0,kai1,kai2,kp,kAway,sis0,sis1,sis2,sis3,sis4,zr1,zr2,zr3,xc0,xc1,fy,fyR,fyT,p1,p4,p1b})); }
  { const okIf=(id,t)=>{ const e=(SMALLTALK[id]||[]).find(x=>typeof x==='object'&&x.t===t); return !!e&&(!e.if||EVENTS.cond(e.if)); };
    grad('2029-07-02',20,{}); const k1=okIf('kai','「宿舍網路又斷了。你們有教這個嗎？」'), z1=okIf('zhe','「系籃週五練球，來坐也可以。」'), z2=okIf('zhe','「總圖 B1 的冷氣，比去年冷。」');
    H.fresh('2029-03-01',10,'dorm',{}); const k0=okIf('kai','「宿舍網路又斷了。你們有教這個嗎？」'), z0=okIf('zhe','「系籃週五練球，來坐也可以。」'), z3=okIf('zhe','「總圖 B1 的冷氣，比去年冷。」');
    /* 2026-10-28 AA_519 第 6 節改：方奕廷「森林系的野外實習，下週去溪頭。」每學期一次同一句 → 照學年三句（大一溪頭、大二奧萬大、大三嘉義），大四以後（2028-07 起他在嘉義）一句都不說 */
    const FY=['「下週去溪頭。……第一次上山，我帶了太多襪子。」','「這學期去奧萬大。樣區要自己找。」','「畢業專題的樣區在嘉義。……我可能會留在那邊。」'];
    H.fresh('2028-05-01',10,'dorm',{}); const f0=okIf('npc_fangyt',FY[2])&&!okIf('npc_fangyt',FY[0])&&!okIf('npc_fangyt',FY[1]); H.fresh('2028-09-01',10,'dorm',{}); const f1=FY.some(t=>okIf('npc_fangyt',t));
    check('G5. 2-2 過時的閒聊：畢業以後阿凱不說「宿舍網路又斷了」、阿哲「系籃週五練球」換成「總圖 B1 的冷氣，比去年冷。」；方奕廷 2028 畢業以後不說野外實習（AA_519 第 6 節：照學年的三句，大三那句到 2028-06）',
      !k1&&!z1&&z2&&k0&&z0&&!z3&&f0&&!f1,[k1,z1,z2,k0,z0,z3,f0,f1].join(',')); }
  // ===== G5 模擬：日本、美國各一次，大五上從 9/2 一路「跳到下一件事」到 12/23（AA_357 第 6 節「測試」）=====
  const Y5LINES=new Set(Array.isArray(PG.CARDS_DELAY)?PG.CARDS_DELAY.map(r=>r[3]):[]);
  const simY5=async(fl,setup,dayPick)=>{ const G=grad('2029-09-02',10,fl); PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); for(const id of ['zhe','yu','classmate_bohan','heroine_01','heroine_03','classmate_mingxuan']) H.FRIEND(id); if(setup) setup(G);
    const Hm=HOME.rec(G); Hm.at=true; Hm.day=G.day; H.cards=[]; H.picks=[dayPick]; const until=D('2029-12-24'); let err=null; const stops=[];   /* 第一個選項是 9/3 那一場（三選一）*/
    try{ for(let it=0; it<120&&G.day<until; it++){
        if(OUT.due(G)){ const q=OUT.due(G); H.picks=[0]; await OUT.tick(GM); stops.push(q.id+'@'+CALENDAR.dateOf(G.day).key); continue; }
        const s=PG.due(G); if(s){ if(s.id==='r2y4b_y5_plan') H.picks=[dayPick]; await PG.runStep(GM,s); stops.push(s.id+'@'+CALENDAR.dateOf(G.day).key); continue; }
        if(!await PG.advance(GM)) break; } }catch(e){ err=e; }
    return {G,err,stops,lines:H.cards.filter(c=>Y5LINES.has(c[1])).map(c=>c[1]),cards:H.cards.map(c=>c[0]+' '+c[1])}; };
  { const C=PG.CARDS_DELAY||[], t=(a,cond)=>{ const r=C.find(x=>x[0]===a&&!(x[4]&&x[4].common)&&(cond?x[2]({flags:{Y5_DAYS:cond,EXCHANGE_ROUTE:'JP'},stage:'law'}):true)); return r?r[3]:'?'; };   /* 三選一那句（共通的不算）*/
    const L={us:'（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）',common:'（週二去法扶。其他的日子，一天和一天很像。）',end:'（大五上結束了。這一次，沒有期末考。）',nye:'（跨年那天晚上，你在家。煙火是從電視上看的。）',nyeDating:'（跨年那天晚上，你沒有在家。煙火很遠，她說這樣剛好。）'};   /* nyeDating：AA_471 第 7 節（企劃線 763993620），交往中的 2029 跨年 */
    const OCT={study:'（有一天，一個大一的跟你借延長線。他叫你學長。）',work:'（高二那個學生期中考進步了。他媽媽多塞了一袋橘子給你。）',bar:'（刑法的書，書邊都翻黑了。）'};   /* 10/17～11/19 的三選一（AA_357 第 4 節原文）*/
    const exp=v=>[t('2029-09-04',v),t('2029-09-12',v),t('2029-09-23',v),OCT[v],t('2029-11-21',v),L.nye];   /* 停在 9/7 放榜群組、9/11 實習、9/20 中秋群組、9/22 照片、10/15 明軒、10/16、11/20 實習、12/14 放榜群組、12/18 最後一次實習、2030-01-21 證書。10/16 → 11/20 落在 10/17～11/19 以後＝三選一（AA_363 T3）*/
    const R={}; for(const [v,pick] of [['study','去總圖讀書'],['work','接家教'],['bar','在家準備國考']]) R[v]=await simY5({EXCHANGE_ROUTE:'JP'},null,pick);
    const bad=Object.keys(R).filter(v=>R[v].err||JSON.stringify(R[v].lines)!==JSON.stringify(exp(v))||!PG.done(R[v].G,'y5_intern4')||R[v].G.flags.Y5_DAYS!==v||R[v].lines.includes(L.common));
    check('G5. 模擬 日本路線 9/2 跳到 12/23（總圖／家教／國考各一輪）：每一次跳過的那一段出那一段的一句（三選一照 9/3 的選擇）；10/16 一跳到 11/20＝出 10/17～11/19 的三選一（借延長線／橘子／刑法的書邊），共通的不出（AA_363 T3）；12/18 最後一次實習有停、不重複；12/19～23 那句在這條路上被下一段蓋過（照現在）',
      !bad.length,bad.map(v=>v+'='+(R[v].err?R[v].err.stack:JSON.stringify(R[v].lines))).join('｜'));
    const U=await simY5({EXCHANGE_ROUTE:'US'},()=>{ H.FRIEND('kexin'); H.date('kexin'); },'接家教');
    const ue=[L.us,t('2029-09-04','work'),t('2029-09-12','work'),t('2029-09-23','work'),OCT.work,t('2029-11-21','work'),L.end,L.nyeDating];   /* 和可昕交往中：跨年那一句是交往中那一版（AA_471 第 7 節）。10/16 實習 → 10/17 週年（隔一天，沒有句子）→ 11/20：落在範圍以後＝三選一（AA_363 T3）*/
    check('G5. 模擬 美國路線（和可昕交往、接家教）：第一次跳先出「週一、週三補修兩門課……」，下一次跳再出第一週那一句；10/17 → 11/20 出橘子那句（AA_363 T3）；可昕的學期末約會（12/21）有停、出「大五上結束了……」、跨年出交往中那一句（AA_471 第 7 節）',
      !U.err&&JSON.stringify(U.lines)===JSON.stringify(ue)&&U.stops.some(s=>/^te_kx_Y5S1@2029-12-2[123]$/.test(s))&&PG.done(U.G,'y5_intern4'),(U.err?U.err.stack:'')+JSON.stringify(U.lines)+JSON.stringify(U.stops)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
// 修改前（開發分支 f0dcc337，scratchpad 的乾淨副本）：37 項全部 FAIL（G1 8、G2 3、G3 5、G4 7、G5 14）。
// AA_363 T1～T9（2026-10-21；T1 第五年卡片、T2 中秋照片阿哲、T3 一跳落在範圍以後出三選一、T4 畢業後資料頁沿用最後一列、T7 日期標籤／公館套房、T9 中秋交通）：
//   在開發分支 6a47ff46 上 11 項 FAIL（G1 2、G2 1、G4 1、G5 7），改完全部 PASS。T7 的宿舍門口在 tests/dorm_moved_out_unit.js（要蓋校園）。
