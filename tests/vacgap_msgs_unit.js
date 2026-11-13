// 假期空白（BB198-VACB22；D99 ① 寒暑假系統）：過年訊息（AA_931、AA_928 1-3）、回家回臺北（AA_933）、Kevin 日本八天（AA_928 第 3 節）、招呼（AA_931 6-1、AA_933 第 6 節）。
// 用法：node tests/vacgap_msgs_unit.js（不需要瀏覽器）
// 檢查：每一則在它的日子、時間才到；FAMILIAR 不到、沒聯絡方式、聯絡不到（沛珊）就沒有；可昕（homeAway）回家、回臺北＝presence 切換那天 18:00（LAWWW-C 11-13，鎖住）；
//       交往中多一句；一天最多三則（交往中 > FRIEND > FAMILIAR）、擠掉的記 VACGAP_CUT；明軒每學期一次的招呼、方奕廷 2/19 以後的招呼；舊存檔（沒有新旗標）照常跑。
// 修改前（dd63a41a10）：沒有 src/vacgap3d.js，全部 FAIL。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr=''; for(const f of ['src/data/vacgap_lines.js','src/vacgap3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+(e&&e.message||e)+'　'; } }
check('0. 模組載得到、登記進 STORY.PHONE_RULES／PRE_TALK',!loadErr&&typeof VACGAP!=='undefined'&&STORY.PRE_TALK.includes(VACGAP.preTalk),loadErr);
{ const h=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=h.indexOf('src="src/data/vacgap_lines.js'), b=h.indexOf('src="src/vacgap3d.js'), s=h.indexOf('src="src/story3d.js'), p=h.indexOf('src="src/phone3d.js'), z=h.indexOf('GAME.boot()');
  check('0. index.html：data/vacgap_lines.js → vacgap3d.js（story3d、phone3d 之後，GAME.boot() 之前）',a>s&&a>p&&/vacgap_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/vacgap3d\.js/.test(h)&&b>a&&z>b,[s,p,a,b,z].join(',')); }
const L=VACGAP_LINES, D=H.D, T=(d,h)=>d*24+h, K=d=>CALENDAR.dateOf(d).key;
const wd=d=>CALENDAR.dateOf(d).wd%7;
const set=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const runTo=(key,h,step)=>{ step=step||1; const t1=T(D(key),h); let t=T(H.G.day,H.G.hour); while(t<t1-1e-9){ t=Math.min(t1,t+step); const d=Math.floor(t/24); set(d,t-d*24); STORY.phoneRules(GM); PHONE.tick(H.G); for(const m of H.G.msgs||[]) if(m.tag){ const A=LOG[m.tag]||(LOG[m.tag]=[]); if(!A.includes(m)) A.push(m); } } };   /* 手機只留 200 則：照收到的時候記下來 */
let LOG={};
const got=tag=>LOG[tag]||[];
const when=tag=>{ const m=got(tag)[0]; return m?K(m.day)+' '+(+m.h).toFixed(2):null; };
const texts=tag=>got(tag).map(m=>m.text);
const contact=(...ids)=>{ H.G.contacts=H.G.contacts||{}; for(const id of ids) H.G.contacts[id]=H.G.day; };
const start=(key,h)=>{ H.fresh(key,h||8,'dorm'); LOG={}; };

// ===== 1. 過年 2026（大一）=====
start('2026-02-15');
for(const id of ['kai','classmate_mingxuan','heroine_04','classmate_peishan']) H.FAMILIAR(id); contact('kai','classmate_mingxuan','heroine_04','classmate_peishan');
PHONE.join(H.G,'family_law','法律系家族');
runTo('2026-02-16',23.6);
check('1-1 子晴 2026 除夕 23:40 還沒到（23:36）',!got('msg_zq_lny_2026').length);
runTo('2026-02-19',23);
check('1-2 子晴 2026-02-16 23:40 三則（私訊已開、FAMILIAR）',when('msg_zq_lny_2026')==='2026-02-16 23.67'&&J(texts('msg_zq_lny_2026'))===J(L.lny.zq[2026].ms),when('msg_zq_lny_2026')+' '+J(texts('msg_zq_lny_2026')));
check('1-3 沛珊 初一 05:10、阿凱 初二 22:00、明軒 初二 20:00',when('msg_ps_lny_2026')==='2026-02-17 5.17'&&when('msg_kai_lny_2026')==='2026-02-18 22.00'&&when('msg_mx_lny_2026')==='2026-02-18 20.00',[when('msg_ps_lny_2026'),when('msg_kai_lny_2026'),when('msg_mx_lny_2026')].join('／'));
check('1-4 Kevin 初一 10:00、學姊 10:20 回一句（家族群組，沒交往）',when('msg_kevin_lny_2026')==='2026-02-17 10.00'&&when('msg_sis_lny_2026')==='2026-02-17 10.33'&&J(texts('msg_sis_lny_2026'))===J(['新年快樂。'])&&got('msg_sis_lny_2026')[0].th==='g:family_law');
check('1-5 私訊的 thread＝p:<人>；交往中多的那句沒有（沒交往）',got('msg_kai_lny_2026').every(m=>m.th==='p:kai')&&!texts('msg_zq_lny_2026').includes(L.lny.zq[2026].dt[0]));
// 不夠熟、沒聯絡方式、交往中的學姊
start('2026-02-15'); H.rel('kai',5,0,0); contact('kai'); PHONE.join(H.G,'family_law','法律系家族'); H.G.flags.dating_heroine_05=true; H.FAMILIAR('heroine_04');
runTo('2026-02-19',23);
check('1-6 FAMILIAR 不到（阿凱）＝沒有；子晴沒有私訊（沒聯絡方式）＝沒有；和學姊交往中＝群組那句沒有（Kevin 照有）',!got('msg_kai_lny_2026').length&&!got('msg_zq_lny_2026').length&&!got('msg_sis_lny_2026').length&&!!got('msg_kevin_lny_2026').length);
// 交往中多一句
start('2026-02-15'); H.FAMILIAR('heroine_04'); contact('heroine_04'); H.G.flags.dating_heroine_04=true; runTo('2026-02-17',1);
check('1-7 和子晴交往中：多「零點要不要通話……」',J(texts('msg_zq_lny_2026'))===J(L.lny.zq[2026].ms.concat(L.lny.zq[2026].dt)));

// ===== 2. 過年 2027～2029 =====
start('2027-02-04'); for(const id of ['kai','classmate_mingxuan','heroine_04','classmate_peishan']) H.FAMILIAR(id); contact('kai','classmate_mingxuan','heroine_04','classmate_peishan'); PHONE.join(H.G,'family_law','法律系家族');
runTo('2027-02-09',12);
check('2-1 2027：沛珊沒有（消失期）；子晴 2/6 14:30、明軒 2/8 20:00、阿凱 2/7 22:00、Kevin、學姊',!got('msg_ps_lny_2027').length&&when('msg_zq_lny_2027')==='2027-02-06 14.50'&&when('msg_mx_lny_2027')==='2027-02-08 20.00'&&when('msg_kai_lny_2027')==='2027-02-07 22.00'&&J(texts('msg_sis_lny_2027'))===J(['新年快樂。大家都好。']),[when('msg_zq_lny_2027'),when('msg_mx_lny_2027'),when('msg_kai_lny_2027')].join('／'));
start('2028-01-24'); for(const id of ['heroine_04','classmate_peishan']) H.FAMILIAR(id); contact('heroine_04','classmate_peishan');
runTo('2028-01-26',1);
check('2-2 2028 子晴除夕：沒有 DAD_PLAYS＝「我爸今天問我畢業要做什麼」那一版；沛珊放榜後沒重新聯絡上（lost）＝沒有',J(texts('msg_zq_lny_2028'))===J(L.lny.zq[2028].noDad)&&!got('msg_ps_lny_2028').length,J(texts('msg_zq_lny_2028')));
start('2028-01-24'); for(const id of ['heroine_04','classmate_peishan']) H.FAMILIAR(id); contact('heroine_04','classmate_peishan'); H.G.flags.DAD_PLAYS=true; H.G.flags.PS_RECONNECT=true;
runTo('2028-01-26',1);
check('2-3 2028：有 DAD_PLAYS＝客廳背影那一版；沛珊重新聯絡上了＝除夕 13:30',J(texts('msg_zq_lny_2028'))===J(L.lny.zq[2028].ms)&&when('msg_ps_lny_2028')==='2028-01-25 13.50',when('msg_ps_lny_2028'));
start('2029-02-11'); for(const id of ['kai','classmate_mingxuan','heroine_04']) H.FAMILIAR(id); contact('kai','classmate_mingxuan','heroine_04'); PHONE.join(H.G,'family_law','法律系家族');
runTo('2029-02-16',1);
check('2-4 2029：子晴 2/12 23:30、明軒 2/14 20:00、阿凱 初三 2/15 22:00、Kevin「不准踢我」',when('msg_zq_lny_2029')==='2029-02-12 23.50'&&when('msg_mx_lny_2029')==='2029-02-14 20.00'&&when('msg_kai_lny_2029')==='2029-02-15 22.00'&&texts('msg_kevin_lny_2029').includes('我畢業了還是要在這個群組拜年 不准踢我'));

// ===== 3. Kevin 日本八天（2026-01-24～01-31 18:00）=====
start('2026-01-23'); PHONE.join(H.G,'family_law','法律系家族'); runTo('2026-01-24',17.9);
check('3-1 1/24 17:54 還沒有',!got('msg_kevin_jp_photo_1').length);
runTo('2026-02-01',12);
const jp=[1,2,3,4,5,6,7,8].map(i=>when('msg_kevin_jp_photo_'+i));
check('3-2 一天一則、都在 18:00',J(jp)===J(L.kevinJp.map(r=>r[0]+' 18.00')),J(jp));
check('3-3 1/29 學姊回「謝謝」（只有這一則）',J(texts('msg_kevin_jp_photo_6'))===J([L.kevinJp[5][1],L.kevinJp[5][2],'謝謝'])&&[1,2,3,4,5,7,8].every(i=>texts('msg_kevin_jp_photo_'+i).length===2));
start('2026-01-23'); runTo('2026-02-01',12); check('3-4 不在家族群組＝沒有',!got('msg_kevin_jp_photo_1').length);

// ===== 4. 回家、回臺北（固定日子的四位）=====
start('2026-01-20'); for(const id of ['heroine_02','kai','classmate_mingxuan','npc_fangyt']) H.FAMILIAR(id); contact('heroine_02','kai','classmate_mingxuan','npc_fangyt');
runTo('2026-02-23',8);
check('4-1 大一寒假：方奕廷 1/24 18:00、芷若 1/26 18:00、阿凱 2/13 18:00、明軒 2/13 19:00、芷若回臺北 2/19 20:30',
  when('msg_fy_home_Y1W_go')==='2026-01-24 18.00'&&when('msg_zr_home_Y1W_go')==='2026-01-26 18.00'&&when('msg_kai_home_Y1W_go')==='2026-02-13 18.00'&&when('msg_mx_home_Y1W_go')==='2026-02-13 19.00'&&when('msg_zr_home_Y1W_back')==='2026-02-19 20.50',
  ['msg_fy_home_Y1W_go','msg_zr_home_Y1W_go','msg_kai_home_Y1W_go','msg_mx_home_Y1W_go','msg_zr_home_Y1W_back'].map(when).join('／'));
check('4-2 2/19 明軒、方奕廷不傳（改招呼）；阿凱回臺北那則不是訊息',!got('msg_mx_home_Y1W_back').length&&!got('msg_fy_home_Y1W_back').length&&!got('msg_kai_home_Y1W_back').length);
check('4-3 HOMEMSG 記了日子（BB_198 7-3）',H.G.flags.HOMEMSG&&H.G.flags.HOMEMSG.kai.Y1W.go===D('2026-02-13')&&H.G.flags.HOMEMSG.heroine_02.Y1W.back===D('2026-02-19'));
check('4-4 每一則回家的日子＝那個人在 presence 上第一天不在臺北（芷若、阿凱、明軒、方奕廷）',['heroine_02','kai','classmate_mingxuan','npc_fangyt'].every(id=>{ const tag=VACGAP.homeTag(id,'Y1W','go'), m=got(tag)[0]; return m&&!STORY.presence(id,Object.assign({},H.G,{day:m.day})).here&&STORY.presence(id,Object.assign({},H.G,{day:m.day-1})).here; }));
// 每一列固定日子的「回家」都和 presence 對得上（全部假期）
{ const bad=[]; const G0={v:3,stage:'law',day:1,hour:12,flags:{},events:{done:{}}};
  for(const who of ['heroine_02','kai','classmate_mingxuan','npc_fangyt']) for(const r of L.home[who]){ const [key,kind,dk]=r; if(dk==='flip') continue; const d=D(dk), p=x=>STORY.presence(who,Object.assign({},G0,{day:x})).here, hm=x=>{ const k=STORY.presence(who,Object.assign({},G0,{day:x})).kind; return k==='home'||k==='trip'; };
    if(kind==='go'&&!(hm(d)&&!hm(d-1))) bad.push(who+' '+key+' go '+dk);   /* 芷若 2028-02-12：前一天在英國（abroad），那天回台中 */
    if(kind==='back'&&!((p(d)&&!p(d-1))||(!p(d)&&p(d+1)))) bad.push(who+' '+key+' back '+dk); }
  check('4-5 固定日子：回家那天＝在老家（home／trip）的第一天；回臺北那天＝不在的最後一天（晚上回來）或回來的第一天',!bad.length,bad.join('、')); }
start('2026-01-20'); H.rel('heroine_02',5,0,0); contact('heroine_02'); runTo('2026-01-27',8);
check('4-6 芷若 FAMILIAR 不到＝沒有',!got('msg_zr_home_Y1W_go').length);

// ===== 5. 可昕：homeAway 切換那天 18:00（LAWWW-C 11-13）=====
const kxFlips=()=>{ const out=[]; const G0=Object.assign({},H.G); let prev=null; for(let d=D('2025-12-01'); d<=D('2029-03-01'); d++){ const h=STORY.presence('kexin',Object.assign({},G0,{day:d})).kind==='home'; if(prev!==null&&h!==prev) out.push([h?'go':'back',d]); prev=h; } return out; };
{ start('2025-12-15'); H.FAMILIAR('kexin'); H.G.flags.KX_MET=true; contact('kexin');
  const F=kxFlips(); runTo('2029-02-20',12,6);
  const bad=[], seen=[];
  for(const [kind,d] of F){ const B=kind==='go'?HOME.breakOf(d):HOME.breakOf(d-1); if(!B) continue; const tag=VACGAP.homeTag('kexin',B.key,kind), row=L.home.kexin.find(r=>r[0]===B.key&&r[1]===kind);
    if(!row){ if(got(tag).length) bad.push(tag+' 不該有'); continue; } seen.push(tag); const m=got(tag)[0];
    if(!m||m.day!==d||m.h!==18) bad.push(tag+' '+(m?K(m.day)+' '+m.h:'沒有')+' ≠ '+K(d)+' 18'); else if(J(texts(tag))!==J(row[4])) bad.push(tag+' 字'); }
  check('5-1 可昕每一則回家、回臺北都在 presence 切換那天 18:00（寒假、暑假；大三暑假先不播）',!bad.length&&seen.length===L.home.kexin.length,bad.join('、')+'｜'+seen.length);
  check('5-2 大一寒假：回家＝寒假第一天（2025-12-22）、回臺北＝2026-02-21（不是稿上的 1/2、2/19）',when('msg_kx_home_Y1W_go')==='2025-12-22 18.00'&&when('msg_kx_home_Y1W_back')==='2026-02-21 18.00',when('msg_kx_home_Y1W_go')+'／'+when('msg_kx_home_Y1W_back'));
  check('5-3 大一暑假：回家＝暑假第一天 2026-06-15（不是稿上的 7/27）',when('msg_kx_home_Y1S_go')==='2026-06-15 18.00',when('msg_kx_home_Y1S_go'));
  check('5-4 大三暑假（AA_930 回家兩週，和 presence 整個暑假在高雄對不上）不傳',!got('msg_kx_home_Y3S_go').length&&!got('msg_kx_home_Y3S_back').length); }
{ start('2026-12-20'); H.FAMILIAR('kexin'); H.G.flags.KX_MET=true; H.G.flags.dating_kexin=true; contact('kexin'); runTo('2027-02-22',8,3);
  check('5-5 交往中：大二寒假回臺北多一句「明天見」',J(texts('msg_kx_home_Y2W_back'))===J(['回臺北了','宿舍沒人，好安靜','明天見'])&&J(texts('msg_kx_home_Y2W_go'))===J(['到家了','我爸的嗓門比去年還大']),J(texts('msg_kx_home_Y2W_back'))); }
{ start('2026-12-20'); H.rel('kexin',5,0,0); H.G.flags.KX_MET=true; contact('kexin'); runTo('2027-02-22',8,3);
  check('5-6 可昕 FAMILIAR 不到、沒交往＝沒有',!got('msg_kx_home_Y2W_go').length&&!got('msg_kx_home_Y2W_back').length); }
{ start('2026-06-10'); H.FAMILIAR('kexin'); H.G.flags.KX_MET=true; contact('kexin');
  // 切換那天快轉過去（一次跳 3 天）也補得到（看前兩天）
  runTo('2026-06-17',20,72);
  check('5-7 一次跳過三天：切換那天的那則照樣補（時間照切換那天 18:00）',when('msg_kx_home_Y1S_go')==='2026-06-15 18.00',when('msg_kx_home_Y1S_go')); }
// 沛珊（也走 homeAway）
{ start('2025-12-15'); H.FAMILIAR('classmate_peishan'); contact('classmate_peishan'); runTo('2026-09-07',8,6);
  const p=x=>STORY.presence('classmate_peishan',Object.assign({},H.G,{day:x})).kind==='home';
  const ok=['msg_ps_home_Y1W_go','msg_ps_home_Y1W_back','msg_ps_home_Y1S_go','msg_ps_home_Y1S_back'].every(t=>{ const m=got(t)[0]; if(!m) return false; return /_go$/.test(t)?(p(m.day)&&!p(m.day-1)):(!p(m.day)&&p(m.day-1)); });
  check('5-8 沛珊大一寒暑假四則都在 presence 切換那天（回宿舍那則 21:30）',ok&&when('msg_ps_home_Y1W_back')==='2026-02-21 21.50',['msg_ps_home_Y1W_go','msg_ps_home_Y1W_back','msg_ps_home_Y1S_go','msg_ps_home_Y1S_back'].map(when).join('／')); }

// ===== 6. 一天最多三則 =====
{ const save=JSON.stringify(L.home); const add=(who,h)=>L.home[who].push(['Y1W','go','2026-01-05',h,['（測試）'+who]]);
  add('heroine_02',18); add('kai',19); add('classmate_mingxuan',20); add('npc_fangyt',21);
  // 同一個 tag 會和真的那幾列重複：換 key
  for(const who of ['heroine_02','kai','classmate_mingxuan','npc_fangyt']){ const r=L.home[who][L.home[who].length-1]; r[0]='YTEST'; }
  start('2026-01-04'); for(const id of ['heroine_02','classmate_mingxuan','npc_fangyt']) H.FAMILIAR(id); H.FRIEND('kai'); contact('heroine_02','kai','classmate_mingxuan','npc_fangyt');
  runTo('2026-01-06',8);
  const tg=w=>VACGAP.homeTag(w,'YTEST','go');
  check('6-1 同一天四則：只收到三則，FRIEND（阿凱）先、FAMILIAR 照表的順序（方奕廷被擠掉）',!!got(tg('kai')).length&&!!got(tg('heroine_02')).length&&!!got(tg('classmate_mingxuan')).length&&!got(tg('npc_fangyt')).length,['heroine_02','kai','classmate_mingxuan','npc_fangyt'].map(w=>got(tg(w)).length).join(''));
  check('6-2 擠掉的記在 VACGAP_CUT、不補發（之後也不會再來）',(H.G.flags.VACGAP_CUT||[]).includes(tg('npc_fangyt'))&&(runTo('2026-01-09',8),!got(tg('npc_fangyt')).length));
  start('2026-01-04'); for(const id of ['heroine_02','kai','classmate_mingxuan']) H.FAMILIAR(id); H.FRIEND('npc_fangyt'); contact('heroine_02','kai','classmate_mingxuan','npc_fangyt'); runTo('2026-01-06',8);
  check('6-3 方奕廷 FRIEND＝留下，最後一個 FAMILIAR（明軒）被擠掉',!!got(tg('npc_fangyt')).length&&!got(tg('classmate_mingxuan')).length);
  const o=JSON.parse(save); for(const k in o) L.home[k]=o[k]; }

// ===== 7. 招呼 =====
(async()=>{
  start('2026-02-24',10); H.FAMILIAR('classmate_mingxuan'); H.FAMILIAR('npc_fangyt');
  await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan'); await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan');
  check('7-1 明軒大一下第一次說話：「寒假我教了五堂家教……」一次（第二次不說）',H.said.filter(s=>s.t===L.mxBack.Y1S2).length===1);
  await VACGAP.preTalk(GM,{name:'方奕廷'},'npc_fangyt'); await VACGAP.preTalk(GM,{name:'方奕廷'},'npc_fangyt');
  check('7-2 方奕廷 2/19 以後第一次：「學弟。寒假那三盆都活下來了。」一次',H.said.filter(s=>s.t===L.fyBackGreet).length===1);
  start('2026-09-08',10); H.FAMILIAR('classmate_mingxuan'); H.G.flags.VACGAP_GREET={mx_Y1S2:D('2026-02-24')}; await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan');
  check('7-3 大二上又一次（每學期一次）',H.has(L.mxBack.Y2S1));
  start('2026-02-24',10); H.rel('classmate_mingxuan',5,0,0); await VACGAP.preTalk(GM,{name:'明軒'},'classmate_mingxuan');
  check('7-4 不熟（FAMILIAR 不到）＝不說',!H.said.length);
  start('2026-01-10',10); H.FAMILIAR('npc_fangyt'); await VACGAP.preTalk(GM,{name:'方奕廷'},'npc_fangyt');
  check('7-5 方奕廷 2/19 以前＝不說',!H.said.length);
  // ===== 8. 舊存檔 =====
  start('2026-02-12'); delete H.G.flags.HOMEMSG; delete H.G.flags.VACGAP_CAP; let err=null; try{ H.FAMILIAR('kai'); contact('kai'); runTo('2026-02-14',8); }catch(e){ err=e; }
  check('8-1 舊存檔（沒有 HOMEMSG、VACGAP_CAP）照常跑、照常收到',!err&&!!got('msg_kai_home_Y1W_go').length,err&&err.message);
  H.done();
})();
