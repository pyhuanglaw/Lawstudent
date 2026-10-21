// 大五上（交換延畢）與畢業後篇的系統（AA_357，AA-C 2026-10-21 定稿 d07eb988；AA_353 第 3 節、AA_355 第 5 節第 2、3 題）——不需要瀏覽器。
//   G1 第 1-4 節＋第 2-1 節：資料頁年級 200 天懸崖（STORY.termAt）、畢業以後每個人「現在在做什麼」、延畢的玩家大五
// 每一項都在修改前的程式（開發分支 f0dcc337）跑過、都是 FAIL（見檔尾）。用法：node tests/y5_delay_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H;
const D=k=>PG.DK(k);
const tag=id=>SOCIAL.yearTag(id);
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
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
// 修改前（開發分支 f0dcc337）：G1 8 項全部 FAIL；G2 3 項全部 FAIL。
