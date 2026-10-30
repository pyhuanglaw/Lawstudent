// 手機人物頁「你們」那一段（CHAR-WHOIS-1030；AA_543 企劃線 d483ecbbf；使用者 2026-10-30 X145「我甚至玩這麼久搞不清楚阿哲是誰」）——不需要瀏覽器。
//   0  稿（企劃線 f726507f7＝d483ecbbf＋第 5 節）：src/whois3d.js 每一行的字都在稿裡（一字不差；5-1 合併的兩句照稿接起來、柏翰沒有 DORM_FOUR 的室友那幾句照第 1-3 節「從有的那一年寫起」組，列在 COMPOSED）；稿的每一列遊戲裡都有；
//      index.html 載 src/whois3d.js；game3d.js 的 personHTML 接 WHOIS.lines／WHOIS.desc；個性那一行 8 人照第 3 節
//   1  第 4 節：新遊戲（宿營認識）大一上第 1 週阿哲那一頁；叫哥的有「哥」那一行
//   2  同一份存檔到大二上 12/19 以後：阿哲、Alison 都有「在一起了」，Alison 照怎麼知道的（麵店、電話、照片）
//   3  沒發生的不出現：大一上沒有「大二」開頭的；沒演 ev_zhe_game_y2 沒有「17 號」；Alison 大二下以前（沒有 YU_BKF）個性沒有「其實很怕一個人」、退社以後沒有辯論社
//   4  從法律系開始的局：阿勳「他傳訊息來：『是我，阿勳。』」、沒有「412，住了兩個月」；玩過經濟系的相反
//   5  經濟系開局：9/2 晚上韋綸、唐睿搬進 412（E412_MOVEIN）記 FIRST_MET，朋友清單（knownIds 同一個條件）有他們（2-3 程式缺口）
//   6  一頁最多 8 行（第 5 節 5-1，原本 6 行）：①②、哥、在一起那一行永遠不擠掉，其他從最舊的拿掉；合併三行（宿營＋遊覽車、室友＋大三搬走、系籃＋17 號＋隊長）；同一件事換說法（203 → 312、打系籃 → 17 號、雙主修 → 輔系、沛珊在一起 → 分開過、阿凱大二搬走）
//   7  其他人抽查：柏翰室友四年、芯慈舊開局不重複借筆記、明軒遊覽車（宿營旗標 'mx'）、宥辰週五的歌只算私訊、阿凱宜蘭（大二下期末飯）、筱涵「跟語彤高中同班」、方奕廷大二搬走
// 修改前（開發分支 90f0f1f84＝只有 src/whois3d.js 的骨架、個性那一行已改）：PASS 13、FAIL 38（每個人都沒有列；9/2 搬進 412 沒有記韋綸唐睿 FIRST_MET）。
// 修改後：ALL PASS。用法：node tests/whois_unit.js（稿用 git show 讀：在沒有 .git 的目錄跑時，設環境變數 WHOIS_GIT_DIR＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{};
const W=()=>typeof WHOIS!=='undefined'?WHOIS:null;
const D=k=>STORY.dayOfKey(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
let DOC='';
try{ DOC=cp.execSync('git show 30e7b0311:"docs/story_planning/AA_543_手機人物頁_他跟你_分段稿.md"',{cwd:process.env.WHOIS_GIT_DIR||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ DOC=''; }
/* AA_547 2-6（企劃線 e9504c889；使用者 10-30 19:2x 點選）改了芯慈的人物頁、個性那一行（AA_543 還沒跟著改）：新句在 X547 裡也算在稿裡，被取代的舊列另外列 */
let X547=''; try{ X547=cp.execSync('git -c core.quotepath=false show e9504c889:"docs/story_planning/AA_547_芯慈新個性_各場怎麼改.md"',{cwd:process.env.WHOIS_GIT_DIR||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ X547=''; }
/* 一份存檔：日子、旗標；camp＝宿營認識的人（FIRST_MET note camp）*/
const save=(key,flags,camp)=>{ const G=H.fresh(key,20,'dorm',Object.assign({introDone:true},flags||{})); for(const id of (camp||[])) SOCIAL.remember(id,'FIRST_MET','camp'); return G; };
const L=id=>W().lines(H.G,id);
const has=(id,t)=>L(id).includes(t);
const done=(id,n)=>{ H.G.events.done[id]=n||1; (H.G.events.last||(H.G.events.last={}))[id]=H.G.day; };

(async()=>{
  await sec(0,()=>{ check('0. 全部的檔載入沒有錯誤；WHOIS 載得到（lines、desc）',!loadErr.length&&!!W()&&typeof W().lines==='function'&&typeof W().desc==='function',J(loadErr));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=s=>html.indexOf(s);
    check('0. index.html：whois3d.js 在 story3d.js、phone3d.js 以後、GAME.boot() 以前',a('src/whois3d.js')>Math.max(a('src/story3d.js'),a('src/phone3d.js'))&&a('src/whois3d.js')<a('GAME.boot()'));
    const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), ph=g.slice(g.indexOf('function personHTML'),g.indexOf('function friendsHTML'));
    check('0. personHTML：WHOIS.desc 換個性那一行、WHOIS.lines 一行一句「· 」，放在「現在大概在」和個性中間',/WHOIS\.desc\(G,id,desc0\)/.test(ph)&&/WHOIS\.lines\(G,id\)/.test(ph)&&/現在大概在：'\+esc\(wt\)\+'<\/div>':''\)\+\(who\.length\?[^\n]*'<div>· '\+esc\(x\)\+'<\/div>'[^\n]*\+'<div>'\+esc\(desc\)/.test(ph)); });

  await sec(0,()=>{ check('0. 拿得到稿（git show 30e7b0311＝d483ecbbf＋第 5 節實作確認＋芯慈兩行拿掉（D116）＋第 6 節經濟系那一年；有第 1、2、3、4、5 節）＋AA_547（e9504c889，有 2-6）',X547.indexOf('### 2-6')>0&&DOC.length>3000&&DOC.indexOf('## 1. 法律系')>0&&DOC.indexOf('## 3. 個性那一行')>0&&DOC.indexOf('## 4. 測試')>0&&DOC.indexOf('### 5-1')>0,'長度 '+DOC.length);
    if(!DOC||!W()) return;
    /* 遊戲 → 稿：每一行（字串）都在稿的表格裡；函式的幾種結果另外列 */
    const COMPOSED=new Set(['室友：大二 312。','室友：大二 312、大三 507。','室友：大二 312、大三 507、大四 409。',   /* 柏翰沒有 DORM_FOUR：1-3「從有的那一年寫起」*/
      '大二同住 312。大三起他搬去別間。','打系籃。大三當上隊長。','宿營同一小隊。去程的遊覽車上，他坐你旁邊。']);   /* 5-1 合併：兩句照稿接起來（沒有 203 的阿哲、沒演 17 號那場就當上隊長、明軒「同樣」）*/
    const FN={zhe:{camp:['宿營同一小隊，第一天就認識了。','宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。'],room:['大一同住 203。','室友：大一 203、大二 312。','大二同住 312。','室友：大一 203、大二 312。大三起他搬去別間。','大二同住 312。大三起他搬去別間。'],
        grp:['常揪大家吃飯。群組「（當學年的名字）」是他建的。'],ball:['打系籃。','打系籃，17 號。','打系籃，17 號。大三當上隊長。','打系籃。大三當上隊長。']},
      classmate_mingxuan:{camp:['宿營同一小隊。','宿營同一小隊。去程的遊覽車上，他坐你旁邊。']},
      classmate_bohan:{room:['大一同住 203，他比你先搬進去。','室友：大一 203、大二 312。','室友：大一 203、大二 312、大三 507。','四年都是室友：203、312、507、409。','室友：大二 312。','室友：大二 312、大三 507。','室友：大二 312、大三 507、大四 409。']}};
    const bad=[];
    for(const id of Object.keys(W().R)) for(const r of W().R[id]){ const ts=typeof r.t==='function'?((FN[id]||{})[r.id]||['（沒列）'+r.id]):[r.t];
      for(const t of ts){ if(COMPOSED.has(t)) continue; if(DOC.indexOf(t)<0&&X547.indexOf(t)<0) bad.push(id+' '+r.id+' '+t); } }
    check('0. 遊戲 → 稿：每一行一字不差（柏翰沒有 203 的三句照 1-3 組，列在 COMPOSED）',bad.length===0,bad.join('｜'));
    /* 稿 → 遊戲：第 1、2 節表格「顯示」那一欄（括號開頭的說明、群組名那一句除外）都在遊戲裡 */
    const all=new Set(); for(const id of Object.keys(W().R)) for(const r of W().R[id]) for(const t of (typeof r.t==='function'?((FN[id]||{})[r.id]||[]):[r.t])) all.add(t);
    const SUPERSEDED=new Set(['大三當上系籃隊長。','雙主修經濟。她說是家裡要的。','原本雙主修經濟，大三下改成輔系。']);   /* 5-1：單獨的隊長那一行不要了（併進系籃那一行）；AA_547 2-6：芯慈雙主修那一行換、改輔系那一行拿掉 */
    const miss=[]; const s12=DOC.slice(DOC.indexOf('## 1. 法律系'),DOC.indexOf('## 3. 個性那一行'));
    for(const ln of s12.split('\n')){ const m=ln.match(/^\| [^|]+ \| (.+) \|$/); if(!m) continue; let c=m[1].trim(); if(c==='顯示'||/^-+$/.test(c)) continue;
      c=c.replace(/^（把上一行換成）/,''); if(/<br>/.test(c)){ for(const x of c.split('<br>')){ const q=x.match(/「(.+?)」$/); if(q&&!all.has(q[1])) miss.push(q[1]); } continue; }
      c=c.replace(/（沒有 `DORM_FOUR` 的寫「(.+?)」）$/,(z,b)=>{ if(!all.has(b)) miss.push(b); return ''; }).trim();
      if(!all.has(c)&&!SUPERSEDED.has(c)&&![...all].some(t=>t.includes(c))) miss.push(c); }   /* 合併成一行的（5-1）：那一句在合併的那一行裡 */
    check('0. 稿 → 遊戲：第 1、2 節每一列都做了（5-1 拿掉的「大三當上系籃隊長。」除外）',miss.length===0,miss.join('｜'));
    check('0. 稿 → 遊戲：5-1 合併的三行照稿',all.has('宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。')&&all.has('室友：大一 203、大二 312。大三起他搬去別間。')&&all.has('打系籃，17 號。大三當上隊長。')&&DOC.indexOf('宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。')>0&&DOC.indexOf('室友：大一 203、大二 312。大三起他搬去別間。')>0&&DOC.indexOf('打系籃，17 號。大三當上隊長。')>0); });

  await sec(0,()=>{ const P=id=>CHARACTERS[id].personality;
    const want={zhe:'總是笑著、講義氣；吃過一次的店都記得',classmate_xinci:'筆記做得像印刷；雙主修財金；穿得俐落、跟大人說話不怯場；私下追劇追到凌晨',   /* 芯慈照 AA_547 2-6 */classmate_youchen:'考前才出現；晚上在公館當 DJ；對法條的記憶力出奇好',kai:'不是打遊戲就是寫程式；對法律的理解停留在「所以可以告嗎」',
      econ_pinyu:'可昕大一的室友。最毒舌、不帶表情、會算；打工是補習班櫃台',npc_fangyt:'愛爬山、講植物講不停',npc_huangxh:'問問題很直接'};
    const bad=Object.keys(want).filter(id=>P(id)!==want[id]);
    check('0. 第 3 節個性那一行（characters.js）：阿哲、芯慈（AA_547 2-6）、宥辰、阿凱、品妤、方奕廷、筱涵照稿；Alison 平常那段「精力旺盛；吉他社、辯論社、系學會都有她」',bad.length===0&&P('yu')==='精力旺盛；吉他社、辯論社、系學會都有她',J(bad.map(id=>[id,P(id)])));
    check('0. 第 3 節：柏翰、明軒、阿勳、韋綸、唐睿的個性照舊',P('classmate_bohan').length>0&&P('classmate_mingxuan').length>0&&P('econ_zhengxun').length>0&&P('econ_weilun').length>0&&P('econ_tangrui').length>0); });

  /* ===== 第 1 節：新遊戲大一上第 1 週，阿哲那一頁 ===== */
  await sec(1,()=>{ save('2025-09-03',{DORM_FOUR:true,CAMP_BUS:'zhe',PLAYED_Y0:true},['zhe']); const z=L('zhe');
    check('1. 宿營認識、大一上第 1 週：「張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。」「宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。」（5-1 合成一行）「大一同住 203。」「打系籃。」',
      J(z)===J(['張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。','宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。','大一同住 203。','打系籃。']),J(z));
    H.G.flags.ZHE_CALLS_GE=true; check('1. 叫哥的：有「知道你比大家大一歲以後，他都叫你「哥」。」',has('zhe','知道你比大家大一歲以後，他都叫你「哥」。'),J(L('zhe')));
    save('2025-09-03',{DORM_FOUR:true}); done('ev_zhe_w1_meet');
    check('1. 沒有宿營、演過開學第一堂（ev_zhe_w1_meet）：全名那一行＋「開學第一堂課，他從後面戳你肩膀……」，沒有宿營那兩行',J(L('zhe').slice(0,2))===J(['張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。','開學第一堂課，他從後面戳你肩膀，問附近中午吃什麼。'])&&!has('zhe','宿營同一小隊，第一天就認識了。'),J(L('zhe')));
    save('2025-09-03',{}); check('1. 舊開局、從來沒講過全名：「阿哲。法律系，跟你同班。」（沒有 DORM_FOUR＝沒有 203）',J(L('zhe'))===J(['阿哲。法律系，跟你同班。','打系籃。']),J(L('zhe'))); });

  /* ===== 第 2 節：大二上 12/19 以後 ===== */
  await sec(2,()=>{ const base={DORM_FOUR:true,ROOM_Y2:D('2026-09-06'),met_yu:true};
    for(const [v,t] of [['here','大二上學期末，她和阿哲在一起了。是她在麵店親口跟你說的。'],['call','大二上學期末，她和阿哲在一起了。她打電話跟你說的。'],['photo','大二上學期末，她和阿哲在一起了。你是看到群組的照片才知道的。']]){
      save('2026-12-21',Object.assign({YU_ZHE_TOLD:v},base),['zhe']);
      check('2. 12/19 以後（YU_ZHE_TOLD '+v+'）：阿哲「大二上學期末，他和 Alison 在一起了。」；Alison「'+t+'」（另外兩種沒有）',has('zhe','大二上學期末，他和 Alison 在一起了。')&&has('yu',t)&&L('yu').filter(x=>/她和阿哲在一起了/.test(x)).length===1,J([L('zhe'),L('yu')])); }
    save('2026-12-18',base,['zhe']); check('2. 還沒（沒有 YU_ZHE_TOLD）：兩頁都沒有「在一起了」',!L('zhe').some(x=>/在一起了/.test(x))&&!L('yu').some(x=>/在一起了/.test(x)));
    check('2. 大二（ROOM_Y2 搬進 312 以後）：阿哲的室友那一行換成「室友：大一 203、大二 312。」（「大一同住 203。」不在了）',has('zhe','室友：大一 203、大二 312。')&&!has('zhe','大一同住 203。'),J(L('zhe')));
    save('2026-09-05',Object.assign({},base,{ROOM_Y2:D('2026-09-06')}),['zhe']); check('2. 搬進 312 的前一天：還是「大一同住 203。」',has('zhe','大一同住 203。'),J(L('zhe')));
    save('2026-12-21',{ROOM_Y2:D('2026-09-06')},['zhe']); check('2. 沒有 DORM_FOUR（舊開局）大二：「大二同住 312。」',has('zhe','大二同住 312。'),J(L('zhe'))); });

  /* ===== 第 3 節：沒發生的不出現 ===== */
  await sec(3,()=>{ save('2025-10-20',{DORM_FOUR:true,met_yu:true,CAMP_BUS:'mx',PLAYED_Y0:true},['zhe','classmate_bohan','classmate_xinci','classmate_mingxuan']); done('ev_yu_breakfast');
    const ids=Object.keys(W().R), all=[].concat(...ids.map(id=>L(id)));
    check('3. 大一上（一般的開局）：沒有任何一行是「大二」開頭',!all.some(t=>/^大二/.test(t)),J(all.filter(t=>/^大二/.test(t))));
    check('3. 沒演 ev_zhe_game_y2：沒有「17 號」；演了：「打系籃。」換成「打系籃，17 號。」',!L('zhe').some(t=>/17 號/.test(t))&&(done('ev_zhe_game_y2'),has('zhe','打系籃，17 號。')&&!has('zhe','打系籃。')),J(L('zhe')));
    save('2027-02-25',{met_yu:true}); check('3. Alison 大二下第 1 週（沒有 YU_BKF、還沒退社）：個性「精力旺盛；吉他社、辯論社、系學會都有她」，沒有「其實很怕一個人」',W().desc(H.G,'yu',CHARACTERS.yu.personality)==='精力旺盛；吉他社、辯論社、系學會都有她');
    H.G.msgs=(H.G.msgs||[]).concat([{tag:'yu_quit',th:'p:yu',from:'yu',text:'x',day:H.G.day,h:21}]); check('3. 退社那則（yu_quit）收到以後：「精力旺盛；吉他社、系學會都有她」',W().desc(H.G,'yu',CHARACTERS.yu.personality)==='精力旺盛；吉他社、系學會都有她');
    H.G.flags.YU_BKF='ALONE'; check('3. 一個人的早餐（YU_BKF）以後：後面加「其實很怕一個人」；「大二下有一陣子，她一個人吃早餐。」',W().desc(H.G,'yu',CHARACTERS.yu.personality)==='精力旺盛；吉他社、系學會都有她；其實很怕一個人'&&has('yu','大二下有一陣子，她一個人吃早餐。'),J(L('yu')));
    save('2027-02-25',{met_yu:true}); H.G.needed={shown:{yu_clubs:D('2027-02-21')}}; check('3. 舊存檔收過舊的 yu_clubs：也算退了辯論社',W().desc(H.G,'yu','')==='精力旺盛；吉他社、系學會都有她'); });

  /* ===== 第 4 節：從法律系開始的局（沒有 PLAYED_Y0）===== */
  await sec(4,()=>{ save('2025-10-20',{}); const x=L('econ_zhengxun');
    check('4. 從法律系開始：阿勳「你經濟系那年的室友。回到法律系以後，他傳訊息來：「是我，阿勳。」」，沒有「412，住了兩個月」',has('econ_zhengxun','你經濟系那年的室友。回到法律系以後，他傳訊息來：「是我，阿勳。」')&&!x.some(t=>/住了兩個月/.test(t)),J(x));
    check('4. 從法律系開始：品妤「回到法律系以後才說上話。」、韋綸「……在法學院廣場遇到他。」',has('econ_pinyu','回到法律系以後才說上話。')&&has('econ_weilun','你經濟系那年的室友。回到法律系以後，在法學院廣場遇到他。'));
    save('2025-10-20',{PLAYED_Y0:true,ECON_CAMP_DONE:true});
    check('4. 玩過經濟系那一年：阿勳「你經濟系那年的室友，男宿 412，住了兩個月。」「經濟系宿營同一小隊。」，沒有「是我，阿勳」',has('econ_zhengxun','你經濟系那年的室友，男宿 412，住了兩個月。')&&has('econ_zhengxun','經濟系宿營同一小隊。')&&!L('econ_zhengxun').some(t=>/是我，阿勳/.test(t)),J(L('econ_zhengxun'))); });

  /* ===== 第 5 節：經濟系開局，9/2 韋綸、唐睿搬進 412 ===== */
  await sec(5,()=>{ const d1=STORY.y0Day1(); const G=H.fresh(CALENDAR.dateOf(d1+1).key,18,'dorm',{E01_DONE:true,E01_NIGHT:'unpack',E01_MORNING:true}); G.stage='econ'; SOCIAL.bind(G);
    const before=['econ_weilun','econ_tangrui'].map(id=>SOCIAL.has(id,'FIRST_MET')); const r=STORY.y0Tick(GM);
    check('5. 9/2 17:00 以後回 412（E412_MOVEIN）：韋綸、唐睿記 FIRST_MET（note dorm）；朋友清單的條件（SOCIAL.has FIRST_MET）成立',r===true&&!!G.flags.E412_MOVEIN&&J(before)===J([false,false])&&SOCIAL.has('econ_weilun','FIRST_MET')&&SOCIAL.has('econ_tangrui','FIRST_MET')&&!!G.flags.met_econ_weilun&&!!G.flags.met_econ_tangrui,J([r,before]));
    { const xs=['econ_zhengxun','econ_weilun','econ_tangrui','econ_pinyu'].map(id=>[id,WHOIS.lines(G,id)]);
      check('5. 經濟系那一年本身（stage econ，BB-B BUG-WHOIS-ECONYEAR-1030）：沒有「回到法律系以後」「那年的室友」「住了兩個月」「宿營同一小隊」（宿營還沒去）這些回頭看的列',xs.every(([id,a])=>!a.some(t=>/回到法律系以後|那年的室友|住了兩個月|宿營同一小隊|走啦」群組/.test(t))),J(xs));
      const W6=id=>WHOIS.lines(G,id);
      check('5. AA_543 第 6 節：9/2 搬進 412 以後（現在式）：阿勳「…經濟系，跟你同班。」「男宿 412 的室友。」；韋綸、唐睿「男宿 412 的室友，九月二號搬進來的。」；品妤「曾品妤。經濟系，跟你同班。」',
        J(W6('econ_zhengxun'))===J(['盧正勳，大家叫他阿勳。經濟系，跟你同班。','男宿 412 的室友。'])&&J(W6('econ_weilun'))===J(['邱韋綸。經濟系，跟你同班。口頭禪「走啦！」','男宿 412 的室友，九月二號搬進來的。'])&&J(W6('econ_tangrui'))===J(['唐睿。經濟系，跟你同班。','男宿 412 的室友，九月二號搬進來的。'])&&W6('econ_pinyu')[0]==='曾品妤。經濟系，跟你同班。',J(xs));
      G.flags.ECON_CAMP_DONE=true;
      check('5. 經濟系宿營過了：阿勳、韋綸「經濟系宿營同一小隊。」（在室友那一行前面，照表）',J(W6('econ_zhengxun'))===J(['盧正勳，大家叫他阿勳。經濟系，跟你同班。','經濟系宿營同一小隊。','男宿 412 的室友。'])&&J(W6('econ_weilun').slice(0,3))===J(['邱韋綸。經濟系，跟你同班。口頭禪「走啦！」','經濟系宿營同一小隊。','男宿 412 的室友，九月二號搬進來的。']),J([W6('econ_zhengxun'),W6('econ_weilun')]));
      PHONE.join(G,'econ_friends','走啦');
      check('5. 在「走啦」群組：韋綸「「走啦」群組是他建的。」、品妤「「走啦」群組裡也有她。」',W6('econ_weilun').includes('「走啦」群組是他建的。')&&W6('econ_pinyu').includes('「走啦」群組裡也有她。'),J([W6('econ_weilun'),W6('econ_pinyu')]));
      G.flags.Y0_MOVED_OUT=true;
      check('5. 退宿以後（Y0_MOVED_OUT）：三個人都換成「男宿 412 的室友，住了兩個月。」，原本那一行拿掉',['econ_zhengxun','econ_weilun','econ_tangrui'].every(id=>W6(id).includes('男宿 412 的室友，住了兩個月。')&&!W6(id).some(t=>/^男宿 412 的室友(。|，九月)/.test(t))),J(['econ_zhengxun','econ_weilun','econ_tangrui'].map(W6)));
      G.stage='law'; G.flags.PLAYED_Y0=true;
      check('5. 轉進法律系以後（stage law）：照第 2 節（「你經濟系那年的室友，男宿 412，住了兩個月。」、名字那一行「經濟系。」），沒有「_e」那幾列',J(W6('econ_zhengxun').slice(0,3))===J(['盧正勳，大家叫他阿勳。經濟系。','你經濟系那年的室友，男宿 412，住了兩個月。','經濟系宿營同一小隊。'])&&!['econ_zhengxun','econ_weilun','econ_tangrui','econ_pinyu'].some(id=>W6(id).some(t=>/跟你同班。|九月二號搬進來|^男宿 412 的室友/.test(t))),J(['econ_zhengxun','econ_weilun','econ_tangrui','econ_pinyu'].map(W6)));
      G.stage='econ'; for(const k of ['ECON_CAMP_DONE','Y0_MOVED_OUT','PLAYED_Y0']) delete G.flags[k]; }
    const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); check('5. knownIds 認 FIRST_MET（朋友清單）',/function knownIds\(\)\{[^\n]*SOCIAL\.has\(id,'FIRST_MET'\)/.test(g)); });

  /* ===== 第 6 節：最多 8 行、不擠掉的、換說法 ===== */
  await sec(6,()=>{ save('2028-06-10',{DORM_FOUR:true,ROOM_Y2:D('2026-09-06'),ROOM_Y3:D('2027-09-05'),CAMP_BUS:'zhe',ZHE_CALLS_GE:true,noodleTableDay:D('2025-09-11'),ZHE2:'study',YU_ZHE_TOLD:'here',ZHE3:true,FINAL_GAME_Y3:'went',CLUB_dept_basketball:true},['zhe']); done('ev_zhe_game_y2');
    const z=L('zhe');
    check('6. 阿哲到大三下什麼都發生了（5-1）：8 行＝全名、宿營（含遊覽車）、室友（含大三搬走）、哥、系籃（17 號、隊長）、陪念、和 Alison 在一起、冠軍賽；最舊的「群組是他建的」「你也在系籃」被擠掉',
      z.length===8&&J(z)===J(['張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。','宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。','室友：大一 203、大二 312。大三起他搬去別間。','知道你比大家大一歲以後，他都叫你「哥」。','打系籃，17 號。大三當上隊長。','大二上他民法差點被當，你陪他念了四個禮拜。','大二上學期末，他和 Alison 在一起了。','大三下的冠軍賽贏了。你在場邊。']),J(z));
    W().MAX=99; const all=L('zhe'); W().MAX=8;
    check('6. 不限行數時的順序（照稿）：…室友 → 哥 → 群組（名字照當學年：大三＝法三吃飯）→ 系籃 → 你也在系籃 → 陪念 → Alison → 冠軍賽；沒有單獨的「大三當上系籃隊長。」',J(all.slice(3))===J(['知道你比大家大一歲以後，他都叫你「哥」。','常揪大家吃飯。群組「法三吃飯」是他建的。','打系籃，17 號。大三當上隊長。','你也在系籃，幫忙記分。','大二上他民法差點被當，你陪他念了四個禮拜。','大二上學期末，他和 Alison 在一起了。','大三下的冠軍賽贏了。你在場邊。'])&&!all.includes('大三當上系籃隊長。'),J(all));
    W().MAX=3; const k3=L('zhe'); W().MAX=8;
    check('6. 永遠不擠掉（5-1）：上限再小，①②、哥、在一起那一行都還在（能擠的擠完就全部顯示）',J(k3)===J(['張哲維，大家叫他阿哲。法律系，跟你同班。高雄人。','宿營同一小隊，第一天就認識了。去程的遊覽車上，他坐你旁邊。','室友：大一 203、大二 312。大三起他搬去別間。','知道你比大家大一歲以後，他都叫你「哥」。','大二上學期末，他和 Alison 在一起了。']),J(k3));
    save('2027-03-10',{ZHE3:false},['zhe']); done('ev_zhe_game_y2'); check('6. 演過 ev_zhe_game_y2、還沒當隊長：「打系籃，17 號。」',has('zhe','打系籃，17 號。'),J(L('zhe')));
    save('2025-09-11',{noodleTableDay:D('2025-09-11')}); H.G.hour=19; check('6. 群組那天 21:00 以前還沒建：沒有群組那一行',!L('zhe').some(t=>/群組/.test(t)),J(L('zhe')));
    save('2026-10-20',{PEISHAN_BOHAN_SPLIT:true},['classmate_bohan']); check('6. 柏翰：沛珊分開以後只有「大一下他和沛珊在一起過，大二上分開了。」',has('classmate_bohan','大一下他和沛珊在一起過，大二上分開了。')&&!has('classmate_bohan','大一下，他和沛珊在一起了。'),J(L('classmate_bohan')));
    /* AA_547 2-6：雙主修那一行換、改輔系拿掉；新加「爸媽都是律師」（她說過＝TALKED_FAMILY）、慈 6 以後的暑期實習 */
    save('2028-04-10',{},['classmate_xinci']); done('ev_xinci_double'); check('6. 芯慈：雙主修財金（AA_547 2-6）；還沒聽她說過爸媽＝沒有律師那一行',has('classmate_xinci','雙主修財金。她說看財報比看小說好看。')&&!L('classmate_xinci').some(t=>/律師/.test(t)),J(L('classmate_xinci')));
    SOCIAL.remember('classmate_xinci','TALKED_FAMILY',''); done('ev_xinci_first_place');
    check('6. 芯慈：她說過爸媽（TALKED_FAMILY）＝「爸媽都是律師，在永和開事務所。」；慈 6 以後「大三下，她申請上國際所的暑期實習，金融那一組。」；雙主修那一行照留、沒有改輔系',has('classmate_xinci','爸媽都是律師，在永和開事務所。')&&has('classmate_xinci','大三下，她申請上國際所的暑期實習，金融那一組。')&&has('classmate_xinci','雙主修財金。她說看財報比看小說好看。')&&!L('classmate_xinci').some(t=>/輔系|第一/.test(t)),J(L('classmate_xinci')));
    save('2025-10-20',{}); check('6. 阿凱大一：「大一的室友，搬宿舍那天認識的。」',has('kai','大一的室友，搬宿舍那天認識的。'));
    save('2026-10-20',{ROOM_Y2:D('2026-09-06')}); check('6. 阿凱大二（搬進第二個房間以後）：換「大一的室友。大二他搬去別棟。」',has('kai','大一的室友。大二他搬去別棟。')&&!has('kai','大一的室友，搬宿舍那天認識的。'),J(L('kai'))); });

  /* ===== 第 7 節：其他人抽查 ===== */
  await sec(7,()=>{ const four={DORM_FOUR:true,ROOM_Y2:D('2026-09-06'),ROOM_Y3:D('2027-09-05'),ROOM_Y4:D('2028-09-03')};
    save('2028-10-01',four,['classmate_bohan']); check('7. 柏翰大四（四年都同房）：「四年都是室友：203、312、507、409。」',has('classmate_bohan','四年都是室友：203、312、507、409。'),J(L('classmate_bohan')));
    save('2028-10-01',Object.assign({},four,{DORM_FOUR:false})); check('7. 柏翰沒有 DORM_FOUR：從有的那一年寫起「室友：大二 312、大三 507、大四 409。」；舊開局「第一排那個」',has('classmate_bohan','室友：大二 312、大三 507、大四 409。')&&has('classmate_bohan','許柏翰。法律系，跟你同班，第一排那個。'),J(L('classmate_bohan')));
    save('2026-10-20',{}); SOCIAL.remember('classmate_bohan','FIRST_MET',''); H.G.social.small={classmate_bohan:{once:{'「法服的值班表，我排到十二月了。」':'Y2S1'}}};
    check('7. 柏翰：大二起、聽過法服值班表那一句＝「大二當法服社長。」',has('classmate_bohan','大二當法服社長。'),J(L('classmate_bohan')));
    save('2025-10-20',{}); done('ev_xinci_notes'); SOCIAL.remember('classmate_xinci','LENT_NOTES','');
    check('7. 芯慈舊開局（演過借筆記、沒有宿營）：第一行「……大一上借筆記那次說上話。」，不再另外寫「她的筆記借過你。」',J(L('classmate_xinci'))===J(['吳芯慈。法律系，跟你同班。大一上借筆記那次說上話。']),J(L('classmate_xinci')));
    save('2025-10-20',{CAMP_BUS:'mx',WHY_RETAKE_ASKED:true},['classmate_mingxuan']);
    check('7. 明軒：宿營的遊覽車旗標是 \'mx\'＝「宿營同一小隊。去程的遊覽車上，他坐你旁邊。」（5-1 合成一行，「明軒同樣」）；「宿營夜談，是他問你為什麼重考。」；「打系籃，是阿哲的隊友。」',has('classmate_mingxuan','宿營同一小隊。去程的遊覽車上，他坐你旁邊。')&&has('classmate_mingxuan','宿營夜談，是他問你為什麼重考。')&&has('classmate_mingxuan','打系籃，是阿哲的隊友。'),J(L('classmate_mingxuan')));
    save('2025-10-20',{}); done('ev_mingxuan_ball'); check('7. 明軒舊開局（演過 ev_mingxuan_ball）：「江明軒。法律系，跟你同班。阿哲的系籃隊友。」，不重複「打系籃，是阿哲的隊友。」',has('classmate_mingxuan','江明軒。法律系，跟你同班。阿哲的系籃隊友。')&&!has('classmate_mingxuan','打系籃，是阿哲的隊友。'),J(L('classmate_mingxuan')));
    save('2025-10-20',{}); H.G.msgs=[{tag:'yc_song_1',th:'g:law_class',text:'x',day:H.G.day,h:20}]; const g1=has('classmate_youchen','每個月傳一首歌給你。');
    H.G.msgs.push({tag:'yc_song_2',th:'p:classmate_youchen',text:'x',day:H.G.day,h:20}); check('7. 宥辰：週五的歌只在班群（沒有聯絡方式）不算；私訊收過＝「每個月傳一首歌給你。」',!g1&&has('classmate_youchen','每個月傳一首歌給你。'));
    save('2027-06-20',{}); H.G.termend={Y2S2:{done:{who:'kai',kind:'friend',day:H.G.day}}}; check('7. 阿凱：大二下期末飯和他吃（八月想回宜蘭）＝「宜蘭人。」',has('kai','宜蘭人。'));
    H.G.termend={Y2S2:{done:{who:'zhe',kind:'friend',day:H.G.day}}}; check('7. 對照：大二下期末飯和別人吃＝沒有「宜蘭人。」',!has('kai','宜蘭人。'));
    save('2025-10-20',{}); H.G.flags.AA519={talk:{npc_huangxh:{said:{y1_1:H.G.day}}}}; check('7. 筱涵：聽過「我跟語彤高中同班。」（AA519 閒聊大一第 2 句）＝「跟語彤高中同班。」',J(L('npc_huangxh'))===J(['黃筱涵。心理系。','大一上通識「電影與敘事」同一班。','跟語彤高中同班。']),J(L('npc_huangxh')));
    save('2025-10-20',{}); const f1=has('npc_fangyt','大二他搬出宿舍了。'); save('2026-10-20',{}); check('7. 方奕廷：大一沒有、大二起「大二他搬出宿舍了。」',!f1&&has('npc_fangyt','大二他搬出宿舍了。'));
    save('2028-06-10',{}); H.G.msgs=[{tag:'b106_42_photo',th:'g:econ',text:'x',day:H.G.day,h:21}]; check('7. 品妤、唐睿：收過畢業照那則（b106_42_photo）＝「她和唐睿在一起了。」「他和品妤在一起了。」',has('econ_pinyu','她和唐睿在一起了。')&&has('econ_tangrui','他和品妤在一起了。')); });

  H.done();
})();
