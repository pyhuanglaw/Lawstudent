// AA_611 學姊和 Alison 是姊妹（企劃線 3f85566f4，使用者 11-03 直接對 AA、D109 AA 定稿；接 AA_609 第 8 節 615e981b5）——11-07 稽核還沒做的幾項，不需要瀏覽器。
//   1   礁溪 ENC_D24_SIS 稿改兩處：旁白「（你想起 Alison 說過，她姊姊考上法研所了。原來就是學姊。）」、Alison「他是我們班的啊！……姊，他是妳直屬？」
//   1a  AA_609 8-1（AA_606 第 4 節，企劃線 7b9fee50b）：大一上第 13 週「考完吃哪家」Alison 多「我姊二月要考研究所，法律的。……」，記 HEARD_YU_SISTER（礁溪那句旁白讀它）
//   2   礁溪以後在學校的那一句：有 KNOWS_SIS_ALISON＝「Alison 回家講了一整晚。」；沒有（舊存檔看過舊版）＝照舊「礁溪那天以後，我媽問了你好幾次。……」
//   8   人物頁 Alison：有 KNOWS_SIS_ALISON 多一行「學姊的妹妹。」
//   11  阿公奶奶家搬家：C2 房間 7/11「阿公奶奶要搬到小一點的房子。我在幫忙打包。」（原本旁白「家裡要搬家」）；2027 初一私訊「新家的廚房比較小，奶奶說初三以後再整理。」
//   12  2027-02-24 搬家前「搬去哪？」→「學校附近。一個人住。……研究室比較近。」
//   13  祐廷畢業典禮奶奶「奶奶怎麼也來了？」→「今天我孫女也畢業，我就來了。」；有 KNOWS_SIS_ALISON＝「今天我們家要拍兩張畢業照。」
//   14  2029-06-02：有 KNOWS_SIS_ALISON＝學姊訂位那句後「晚上要先陪 Alison 拍照，我七點才到。」（那頓飯排 19:00）；Café 那場 Alison「我姊今天生日喔。你知道吧。」
//   15  2029 國考：有 KNOWS_SIS_ALISON＝學姊便利商店那句後「Alison 也在裡面考。我等你們兩個。」（2030 不加）
//   每一句都對企劃線的稿（git show）。第 16 列（二十三週年 Alison「這張是我拍的。……她不知道。」）沒有做：那張照片是學姊在美國（2028-08-02～12-23）傳來的，Alison 在臺北，見交接。
// 用法：node tests/aa611_sisters_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, SIS='heroine_05';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就略過 */ } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=()=>H.said.map(s=>s.t);
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const doc=(sha,p)=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'show',sha+':'+p],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const AA611=doc('3f85566f4','docs/story_planning/AA_611_學姊和Alison是姊妹_全遊戲修正.md'), AA609=doc('615e981b5','docs/story_planning/AA_609_學姊的奶奶_取代爸爸.md'), AA606=doc('7b9fee50b','docs/story_planning/AA_606_好朋友的自動劇情_大一上.md');
const inDoc=(D,t)=>!!D&&D.includes(t);
const row611=n=>{ const m=AA611.split('\n').find(l=>l.startsWith('| '+n+' |')); return m||''; };   /* AA_611 第 1 節那一列 */
const setup=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); G.name='祐廷'; if(STORY._bindGM) STORY._bindGM(GM); return G; };
/* 記下說話的人物 id（ENC.meet 用 {name,charId}）*/
const sayIds=[]; const say0=GM.say; GM.say=async(who,t,o)=>{ sayIds.push({id:who&&who.charId||null,t:String(t).replace('{name}',H.G&&H.G.name||'祐廷')}); return say0(who,t,o); };

(async()=>{
await sec(0,()=>{ check('0. 載得到 ENC、ENCOUNTERS、WHOIS、SISB10、PG、POSTGRAD_LINES；AA_611、AA_609、AA_606 讀得到（git show）',typeof ENC!=='undefined'&&typeof ENCOUNTERS!=='undefined'&&typeof WHOIS!=='undefined'&&typeof SISB10!=='undefined'&&typeof PG!=='undefined'&&!!AA611&&!!AA609&&!!AA606); });

/* ---------- 1 礁溪：稿改兩處 ---------- */
const N_OLD='（你想起 Alison 說過，她姊姊在考法研所。原來就是學姊。）', N_NEW='（你想起 Alison 說過，她姊姊考上法研所了。原來就是學姊。）';
const Y_OLD='他是阿哲的同學啊！……姊，他是妳直屬？', Y_NEW='他是我們班的啊！……姊，他是妳直屬？';
await sec(1,async()=>{
  check('1. 稿：AA_611 第 1 列「她姊姊在考法研所」→「她姊姊考上法研所了」、「他是阿哲的同學啊！」→「他是我們班的啊！」；AA_609 第 8 節原句在',/「她姊姊考上法研所了」/.test(row611(1))&&/「他是我們班的啊！」/.test(row611(1))&&inDoc(AA609,N_OLD)&&inDoc(AA609,'Alison：'+Y_OLD),row611(1).slice(0,80));
  const row=ENCOUNTERS.rows.find(r=>r.who===SIS&&r.spot==='D24'), TX=x=>typeof x==='string'?x:(x.narr||x.t);
  const all=[].concat(row.lines.acq,row.lines.friend).map(TX);
  check('1. 認識、朋友兩版都換了：旁白「'+N_NEW+'」、Alison「'+Y_NEW+'」；舊的兩句不在（註解以外）',all.filter(t=>t===N_NEW).length===2&&all.filter(t=>t===Y_NEW).length===2&&!all.includes(N_OLD)&&!all.includes(Y_OLD)&&!strip(src('src/data/encounters.js')).includes('阿哲的同學啊')&&!strip(src('src/data/encounters.js')).includes('她姊姊在考法研所'),J(all));
  const SUN=STORY.termDayIn('Y3S1',3,7);
  const meet=async(tier,flags)=>{ H.fresh('2025-09-01',11,'dorm',flags); H.G.day=SUN; H.G.weekday=CALENDAR.dateOf(SUN).wd%7; H.G.name='祐廷'; H.G.trip={id:'D24'};
    if(tier==='friend') H.FRIEND(SIS); else H.FAMILIAR(SIS); H.FAMILIAR('yu'); sayIds.length=0; H.said=[]; H.picks=['打招呼']; await ENC.meet(GM,row,ENC.tier(H.G,SIS)); return sayIds.slice(); };
  for(const tier of ['acq','friend']){ const L=await meet(tier,{HEARD_YU_SISTER:true}); const iY=L.findIndex(x=>x.id==='yu'&&x.t===Y_NEW), iN=L.findIndex(x=>x.id==null&&x.t===N_NEW);
    check('1. '+tier+'＋聽過 Alison 說姊姊（HEARD_YU_SISTER）：旁白「'+N_NEW+'」在 Alison「'+Y_NEW+'」之前，用她的立繪（charId yu）',iN>0&&iY>iN&&!L.some(x=>x.t===N_OLD||x.t===Y_OLD)&&H.G.flags.KNOWS_SIS_ALISON===true,J(L)); }
});

/* ---------- 1a AA_609 8-1：考完吃哪家 ---------- */
const HEARD='我姊二月要考研究所，法律的。她最近都在讀書，我傳訊息她都沒回。';
await sec('1a',async()=>{
  check('1a. 稿：AA_606 第 4 節「Alison：她說要提前一天約才算數。我幫她約了！」的下一行就是「Alison：'+HEARD+'」（AA_609 8-1，記 HEARD_YU_SISTER）',inDoc(AA606,'Alison：她說要提前一天約才算數。我幫她約了！\nAlison：'+HEARD)&&inDoc(AA609,'`Alison：'+HEARD+'`'));
  const G=setup('2025-11-25',12,'linze'); H.FRIEND('zhe'); H.said=[]; H.picks=[0]; await EVENTS.run(ev('ev_friends_exam_meal')); const L=said(), i=L.indexOf('她說要提前一天約才算數。我幫她約了！');
  check('1a. 「考完吃哪家」：Alison「她說要提前一天約才算數。我幫她約了！」→「'+HEARD+'」→ 柏翰「最後一科考完是下午三點十分。」；記 HEARD_YU_SISTER',i>=0&&L[i+1]===HEARD&&L[i+2]==='最後一科考完是下午三點十分。'&&H.said[i+1].who===H.said[i].who&&G.flags.HEARD_YU_SISTER===true,J(L));
});

/* ---------- 2 礁溪以後在學校 ---------- */
const S_OLD='礁溪那天以後，我媽問了你好幾次。我跟她說你很好。', S_NEW='Alison 回家講了一整晚。';
await sec(2,async()=>{
  check('2. 稿：AA_611 第 2 列「有 KNOWS_SIS_ALISON：改學姊「'+S_NEW+'」；沒有：照舊」',inDoc(row611(2),'「'+S_NEW+'」')&&/沒有：照舊/.test(row611(2)),row611(2).slice(0,80));
  for(const k of [true,false]){ const G=setup('2027-09-20',12,'campus',k?{KNOWS_SIS_ALISON:true}:{}); H.FRIEND(SIS); SOCIAL.remember(SIS,'ENC_D24_SIS',''); G.day+=1; G.weekday=CALENDAR.dateOf(G.day).wd%7;
    const q=ENC.schoolLine(G,SIS); H.said=[]; const ok=await ENC.schoolTalk(GM,{name:'溫書瑀',charId:SIS},SIS);
    check('2. '+(k?'有':'沒有')+' KNOWS_SIS_ALISON：下一次聊天說「'+(k?S_NEW:S_OLD)+'」（只說一次）',!!q&&J(q.lines)===J([k?S_NEW:S_OLD])&&ok&&J(said())===J([k?S_NEW:S_OLD])&&!ENC.schoolLine(G,SIS),J(q)); }
});

/* ---------- 8 人物頁 ---------- */
await sec(8,()=>{
  check('8. 稿：AA_611 第 8 列「有 KNOWS_SIS_ALISON：多一行「學姊的妹妹。」」',inDoc(row611(8),'多一行「學姊的妹妹。」'),row611(8));
  for(const k of [true,false]){ const G=setup('2028-01-10',12,'campus',Object.assign({met_yu:true},k?{KNOWS_SIS_ALISON:true}:{})); const L=WHOIS.lines(G,'yu');
    check('8. Alison 的人物頁'+(k?'（KNOWS_SIS_ALISON）：名字那一行之後有「學姊的妹妹。」':'（還不知道）：沒有「學姊的妹妹。」'),k?(L[0]==='Alison。法律系，跟你同班，坐你前面右邊。'&&L.includes('學姊的妹妹。')):!L.some(t=>/妹妹/.test(t)),J(L)); }
  { const G=setup('2028-01-10',12,'campus',{met_yu:true,KNOWS_SIS_ALISON:true}); G.events=G.events||{}; G.events.done=Object.assign(G.events.done||{},{ev_yu_breakfast:G.day-400}); const L=WHOIS.lines(G,'yu');
    check('8. 演過一起吃早餐：「從板橋通勤。」的下一行是「學姊的妹妹。」（第 ① 類，不會被擠掉）',L.indexOf('學姊的妹妹。')===L.indexOf('從板橋通勤。')+1,J(L)); }
});

/* ---------- 11 阿公奶奶家搬家 ---------- */
const C2_NEW='阿公奶奶要搬到小一點的房子。我在幫忙打包。', CNY_NEW='新家的廚房比較小，奶奶說初三以後再整理。';
await sec(11,async()=>{
  check('11. 稿：AA_611 第 11 列「「'+C2_NEW+'」／「'+CNY_NEW+'」（媽媽那句改奶奶）」',inDoc(row611(11),'「'+C2_NEW+'」／「'+CNY_NEW+'」'),row611(11).slice(0,80));
  const c2=ev('ev_sis_c2_room');
  { const G=setup('2026-07-11',15,'dorm',{SIS_FESTIVAL_MET:true}); H.date(SIS); H.said=[]; await EVENTS.run(c2); const L=said();
    check('11. 7/11 房間：第一句是學姊「'+C2_NEW+'」，接著筆記本那一句旁白；沒有「家裡要搬家」',L[0]===C2_NEW&&!!H.said[0].who&&L[1]==='（書架最下面一層，一本封面有點皺的筆記本。大一的通識課。她翻開，停在一頁，笑了一下，拿起手機拍照。）'&&L.length===2&&!L.some(t=>/家裡要搬家/.test(t))&&!strip(src('src/data/events.js')).includes('家裡要搬家'),J(H.said)); }
  { const G=setup('2026-07-25',15,'dorm',{SIS_FESTIVAL_MET:true}); H.date(SIS); H.said=[]; await EVENTS.run(c2); const L=said();
    check('11. 7/11 以後才補演：第一句照舊「（搬家後還有幾箱沒拆。）」',L[0]==='（搬家後還有幾箱沒拆。）'&&!L.includes(C2_NEW),J(L)); }
  { const G=setup('2027-02-06',9.5,'dorm'); H.date(SIS); SISB10.cny1(G); PHONE.tick(G); const M=(G.msgs||[]).filter(m=>m.th==='p:'+SIS).map(m=>m.text);
    check('11. 2027 初一 09:00 私訊第二則「'+CNY_NEW+'」；沒有「我媽說初三以後再找」',M.includes(CNY_NEW)&&M.indexOf(CNY_NEW)===M.indexOf('新年快樂。……今年想第一個跟你說，所以先傳了。')+1&&!M.some(t=>/我媽說初三/.test(t))&&!strip(src('src/sis_b10_3d.js')).includes('我媽說初三以後再找'),J(M)); }
});

/* ---------- 12 搬去學校附近 ---------- */
const MOVE_NEW='學校附近。一個人住。……研究室比較近。';
await sec(12,async()=>{
  check('12. 稿：AA_611 第 12 列「「'+MOVE_NEW+'」」',inDoc(row611(12),'「'+MOVE_NEW+'」'),row611(12).slice(0,80));
  setup('2027-02-24',19.5,'lawlib'); H.FRIEND(SIS); H.said=[]; H.picks=[1]; await EVENTS.run(ev('ev_sis15_move')); const L=said();
  check('12. 2/24 搬家前選「搬去哪？」：「'+MOVE_NEW+'」；沒有「遠一點的地方」',J(H.opts[0])===J(['「我幫妳搬。」','「搬去哪？」'])&&L[L.length-1]===MOVE_NEW&&!L.some(t=>/遠一點的地方/.test(t))&&!strip(src('src/data/sis_b15_events.js')).includes('遠一點的地方'),J(L));
});

/* ---------- 13 祐廷畢業典禮的奶奶 ---------- */
const GM_NEW='今天我孫女也畢業，我就來了。', GM_KNOW='今天我們家要拍兩張畢業照。';
await sec(13,async()=>{
  check('13. 稿：AA_611 第 13 列「改「'+GM_NEW+'」……；有 KNOWS_SIS_ALISON：「'+GM_KNOW+'」」',inDoc(row611(13),'改「'+GM_NEW+'」')&&inDoc(row611(13),'有 `KNOWS_SIS_ALISON`：「'+GM_KNOW+'」'),row611(13).slice(0,80));
  for(const k of [false,true]){ setup('2029-06-02',12,'campus',Object.assign({MET_SIS_FATHER:true,SIS_FATHER_ASKED:'face'},k?{KNOWS_SIS_ALISON:true}:{})); H.CLOSE(SIS); H.date(SIS); H.said=[]; H.opts=[]; H.picks=[1];
    await PG.fatherGrad(GM); const L=said(), t=k?GM_KNOW:GM_NEW;
    check('13. 「奶奶怎麼也來了？」→ 書瑀奶奶「'+t+'」'+(k?'（KNOWS_SIS_ALISON）':'（還不知道：不點名）'),J(H.opts[0])===J(['「謝謝奶奶。」','「奶奶怎麼也來了？」'])&&L[L.length-1]===t&&H.said[H.said.length-1].who==='書瑀奶奶'&&!L.some(x=>/書瑀說你今天畢業/.test(x)),J(L)); }
});

/* ---------- 14 畢業那天：學姊的晚飯、Café ---------- */
const INV='晚上一起吃飯？我訂好位子了。', INV_SIS='晚上要先陪 Alison 拍照，我七點才到。', CAFE_SIS='我姊今天生日喔。你知道吧。';
await sec(14,async()=>{
  check('14. 稿：AA_611 第 14 列 學姊（訂位那句後）「'+INV_SIS+'」；Café 那場 Alison「'+CAFE_SIS+'」',inDoc(row611(14),'（訂位那句後）「'+INV_SIS+'」')&&inDoc(row611(14),'Alison「'+CAFE_SIS+'」'),row611(14).slice(0,80));
  for(const k of [false,true]){ const G=setup('2029-06-02',13,'campus',k?{KNOWS_SIS_ALISON:true}:{}); H.CLOSE(SIS); H.date(SIS); H.said=[]; H.opts=[]; H.picks=[0,0,0];
    await PG.invites(GM); const L=said(), i=L.indexOf(INV), q=OUT.get(G,'te_gf_Y4S2_'+SIS);
    check('14. 和學姊交往中、拍照最後當面約：「'+INV+'」'+(k?'的下一句是「'+INV_SIS+'」；答應＝那頓飯 19:00':'之後沒有 Alison 那一句；答應＝那頓飯照舊 17:30'),i>=0&&(k?L[i+1]===INV_SIS:!L.includes(INV_SIS))&&!!q&&q.h===(k?19:17.5)&&q.day===PG.gradDay(),J({L:L.slice(Math.max(0,i-1),i+3),h:q&&q.h})); }
  for(const k of [false,true]){ setup('2029-06-02',17.5,'cafe',k?{KNOWS_SIS_ALISON:true}:{}); H.FRIEND(SIS); H.said=[]; await H.run('cafe'); const L=said(), i=L.indexOf('我剛剛看到明軒戴兩頂。');
    check('14. Café 併桌：'+(k?'開頭三句之後 Alison「'+CAFE_SIS+'」':'沒有 Alison 那一句'),i>=0&&(k?(L[i+1]===CAFE_SIS&&H.said[i+1].who===H.said[i-1].who):!L.includes(CAFE_SIS))&&L.includes('（有人點的蛋糕來了，上面插了一根蠟燭，不知道是誰的。）'),J(L)); }
});

/* ---------- 15 國考那天 ---------- */
const STORE='我在對面的便利商店等。考完先傳訊息。', STORE_SIS='Alison 也在裡面考。我等你們兩個。';
await sec(15,async()=>{
  check('15. 稿：AA_611 第 15 列「學姊在便利商店那句後加「'+STORE_SIS+'」」',inDoc(row611(15),'學姊在便利商店那句後加「'+STORE_SIS+'」'),row611(15).slice(0,80));
  for(const [k,y] of [[false,2029],[true,2029],[true,2030]]){ setup(y===2029?'2029-08-04':'2030-08-03',8,'dorm',Object.assign({BAR_REG:true},k?{KNOWS_SIS_ALISON:true}:{})); H.FRIEND(SIS); H.date(SIS); H.said=[];
    await PG.noteScene(GM,y); const L=said(), i=L.indexOf(STORE);
    check('15. '+y+(k?'、KNOWS_SIS_ALISON':'、還不知道')+'：'+(k&&y===2029?'「'+STORE+'」的下一句「'+STORE_SIS+'」':'沒有 Alison 那一句'),i>=0&&(k&&y===2029?L[i+1]===STORE_SIS:!L.includes(STORE_SIS)),J(L)); }
});

H.done();
})();
