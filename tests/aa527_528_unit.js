// AA_527＋AA_528（劇情總監 AA-B 2026-10-30 讀稿：企劃線 5b9d33d05；任務 AA527-FIX-1030、AA528-FIX-1030；D109）——不需要瀏覽器。
//   AA_527 讀 AA_496～523 的實作：第 1 節稿的口氣七處（學姊四句、Kevin 明信片三則、13-1 {name}、AA_515 三位、芷若格言、宥辰模擬法庭、蘇○○→蘇維倫）、
//          第 2 節程式七處（別人說起她本人在旁邊不說、陳助教四句改時段；繃帶只在大一下第 8～9 週；C6 三列；阿哲句號兩處；地點日子五處；學妹那句、沛珊營隊；清晨訊息停 07:30）。
//   AA_528 讀 AA_499～502 的實作：入口（二十位大二起還能認識、佳蓉萬才館值班、同框不算認識、晨希吉他社、佳蓉「其實……」、乃文借筆記）、時間（宗霖在日本、畢業私訊一天兩人、阿凱宵夜）、八句口氣、立群秘密、白名單。
//   台詞照劇情匯入白名單 docs/handoff/story_import_allow.json 上「現在」那一版（AA_527 bfede0a62、AA_528 7ad5fee84）的原稿逐字對（git show）。
// 修改前（基準 3035cc66b）：見回報（FAILED 數）。修改後 ALL PASS。
// 用法：node tests/aa527_528_unit.js（在沒有 .git 的目錄跑，設環境變數 AA527_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa523_sis_b16_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.studySession=async()=>{}; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
const caps=[]; GM.caption=(a,b)=>{ caps.push([a,b]); };
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const BASE={introDone:true,afternoonDone:true,classDone:true,metAn:true,met_an:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true};
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({},BASE,flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  E.player.busy=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; GM.spawnNPC=()=>null; ADV.active=false; caps.length=0;
  if(typeof SUP497!=='undefined'&&SUP497.bind) SUP497.bind(GM); if(STORY._bindGM) STORY._bindGM(GM); if(typeof HEARD!=='undefined'&&HEARD.bind) HEARD.bind(GM); if(typeof HCIRCLE!=='undefined'&&HCIRCLE.bind) HCIRCLE.bind(GM); if(typeof POOL!=='undefined'&&POOL.bind) POOL.bind(GM); return G; };
const at=(d,h)=>{ const G=H.G; G.day=D(d); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const ruleAt=(d,h)=>{ at(d,h); rules(); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag), thread=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const fam=id=>H.rel(id,25,0,0), contact=id=>INV.addContact(H.G,id);
const SRC=f=>fs.readFileSync(path.join(H.ROOT,'src',f),'utf8');
const npcAt=(id,x,z,o)=>{ const n=Object.assign({obj:{position:{x,y:0,z},rotation:{y:0}},lv:0,name:id},o||{}); GM.npc[id]=n; return n; };
const OLD_CE='\u627f\u6069';   /* pool_19 的舊名（使用者刪掉的直屬學弟的名字；寫成 \u 跳脫：src/、tests/ grep 不到）*/

/* ---------- 原稿：白名單上現在那一版 ---------- */
const ALLOW=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8'));
const allowOf=n=>ALLOW.files.find(f=>f.path.indexOf('/'+n+'_')>=0)||null;
const DOCREPO=process.env.AA527_DOCREPO||H.ROOT, docCache={};
const docOf=n=>{ if(n in docCache) return docCache[n]; const a=allowOf(n); let s=''; if(a){ try{ s=cp.execFileSync('git',['show',a.sha+':'+a.path],{cwd:DOCREPO,encoding:'utf8',maxBuffer:64<<20}); }catch(e){ s=''; } } return docCache[n]=s; };
const inDoc=(n,t)=>docOf(n).indexOf(t)>=0;
const docRe=(n,re)=>re.test(docOf(n));

(async()=>{
  check('0. 新檔、src/ 都載得到',!loadErr.length,J(loadErr));

  /* ===================== 白名單（AA_527 第 5 節、AA_528 第 5 節最後一列）===================== */
  await sec('W',()=>{ const want={AA_497:'bfede0a62',AA_498:'7ad5fee84',AA_499:'7ad5fee84',AA_500:'7ad5fee84',AA_501:'7ad5fee84',AA_502:'7ad5fee84',AA_503:'bfede0a62',AA_511:'bfede0a62',AA_512:'bfede0a62',AA_514:'bfede0a62',AA_515:'bfede0a62',AA_518:'bfede0a62',AA_523:'bfede0a62'};
    const bad=Object.keys(want).filter(n=>{ const a=allowOf(n); return !a||a.sha!==want[n]||a.status!=='approved'; });
    check('W. 白名單：這兩份讀稿改過的原稿換成企劃線最後一次修改的 commit（AA_527 bfede0a62、AA_528 7ad5fee84），補 AA_502',!bad.length,J(bad.map(n=>[n,allowOf(n)&&allowOf(n).sha])));
    const keep={AA_504:'62849944b',AA_505:'795fbecfd',AA_508:'ce6e87a99',AA_509:'28f981438',AA_510:'28f981438',AA_519:'e5835610d'};
    check('W. 沒改的照舊（AA_504、505、508、509、510、519）',Object.keys(keep).every(n=>allowOf(n)&&allowOf(n).sha===keep[n]));
    check('W. 讀得到原稿（git show 白名單的 sha）',['AA_497','AA_502','AA_512','AA_515','AA_523'].every(n=>docOf(n).length>1000)); });

  /* ===================== AA_527 第 1 節：稿的口氣 ===================== */
  await sec('1-1',()=>{ const L13=SISB13_LINES, L15s=SRC('data/sis_b15_events.js'), L16s=SRC('data/sis_b16_events.js'), F=SRC('data/fest_events.js');
    check('1-1. AA_512 學姊論文：「一本給我爸了。……」「另一本。……你說過要的。」（不編號）',J(L13.thesisMsg)===J(['修正本印好了。','一本給我爸了。他放在辦公室書架最上面。','另一本。……你說過要的。'])&&inDoc('AA_512','學姊：一本給我爸了。他放在辦公室書架最上面。')&&inDoc('AA_512','學姊：另一本。……你說過要的。'),J(L13.thesisMsg));
    const a='這一段我改了很久。一開始寫得像判決書。', b='……你剛剛讀的，是不像判決書的那一版。';
    check('1-1. AA_523 2-2 學姊：兩句不編號；舊的「我改了三次。第一次……」「……第三次」拿掉',L16s.indexOf("SIS('"+a+"')")>=0&&L16s.indexOf("SIS('"+b+"')")>=0&&L16s.indexOf('我改了三次')<0&&L16s.indexOf('第三次，就是你剛剛讀的')<0&&inDoc('AA_523','學姊：'+a)&&inDoc('AA_523','學姊：'+b));
    check('1-1. AA_523 6-14 2029 白色情人節便條：「上班以後也要。」（便條一張一句）',F.indexOf('（背面寫著：「上班以後也要。」）')>=0&&F.indexOf('明年也要。上班以後也要。')<0&&docRe('AA_523',/\| 6-14 \|.*「上班以後也要。」/));
    const c='嗯。我自己錯了三次，才出得出來。';
    check('1-1. AA_518 2-2 學姊：拿掉格言「出題的人要比答題的人先想錯一次。」',L15s.indexOf("SIS('"+c+"')")>=0&&L15s.indexOf('出題的人要比答題的人先想錯一次')<0&&inDoc('AA_518','學姊：'+c)); });
  await sec('1-2',()=>{ const P=SISB16_LINES.postcard;
    check('1-2. AA_523 3-1 明信片：前三則＋學姊照舊；後兩則換成 Kevin「背面是一題民法」、佳穎「我還以為是問候」、學姊「問候在正面。」（Kevin、佳穎不加句號）',J(P)===J([['k','📷（一張美國寄來的明信片，郵戳是十一月）'],['k','學姊的明信片到了！'],['k','人比明信片早到'],['s','寄的時候說要十天。'],['k','背面是一題民法'],['j','我還以為是問候'],['s','問候在正面。']]),J(P));
    check('1-2. 稿：AA_523 3-1 三則一字不差；「四行」「三行半」不在遊戲',inDoc('AA_523','Kevin：背面是一題民法')&&inDoc('AA_523','佳穎：我還以為是問候')&&inDoc('AA_523','學姊：問候在正面。')&&SRC('data/sis_b16_events.js').indexOf('三行半')<0);
    fresh('2029-01-10',20,'dorm'); PHONE.join(H.G,'family_law','法律直屬家族'); ruleAt('2029-01-10',21.05); const m=byTag('sisb16_postcard');
    check('1-2. 1/10 21:00 家族群組照送：最後三則是 Kevin、佳穎、學姊',m.length===7&&m[4].name==='Kevin'&&m[5].name==='佳穎'&&m[5].text==='我還以為是問候'&&m[6].text==='問候在正面。',J(m.map(x=>[x.name,x.text]))); });
  await sec('1-3',()=>{ const o=SISB13_HAND.open.find(l=>/群組裡的照片/.test(l.text||''));
    check('1-3. AA_512 13-1：「你是{name}吧。」（名字不寫死；口氣表 0-2）',!!o&&o.text==='你是{name}吧。群組裡的照片，看起來比本人緊張。'&&inDoc('AA_512','學姊：你是{name}吧。群組裡的照片，看起來比本人緊張。'),o&&o.text);
    const src=SRC('data/sis_b13_events.js'); check('1-3. 「你是祐廷吧」不在遊戲',src.indexOf('你是祐廷吧')<0); });
  await sec('1-4',()=>{ const W=FEED_DATES.who;
    check('1-4. 子晴：走了一整天／今天沒寫程式／回家就睡（不用遊戲講感情）、又來「第二次 路記得了」',J(W.heroine_04.say.slice(0,3))===J(['走了一整天','今天沒寫程式','回家就睡'])&&W.heroine_04.again==='第二次 路記得了'&&J(W.heroine_04.cm[0])===J(['妳還沒睡？','剛到家','等一下就睡']),J([W.heroine_04.say,W.heroine_04.again,W.heroine_04.cm[0]]));
    check('1-4. 以安第 2 句「今天沒有照計畫走。」；芷若第 1 句「買了一張明信片。」',W.heroine_01.say[1]==='今天沒有照計畫走。'&&W.heroine_02.say[0]==='買了一張明信片。');
    const all=J(W); check('1-4. 「存檔」「讀檔」「這一關」「……也很好。」「今天的光很好。」不在遊戲',!/存檔|讀檔|這一關|也很好。|今天的光很好/.test(all));
    check('1-4. 稿（AA_515）',['| 1 | 走了一整天 |','| 2 | 今天沒寫程式 |','| 3 | 回家就睡 |','| 又來 | 第二次 路記得了 |','「妳還沒睡？」→「剛到家」「等一下就睡」','| 2 | 今天沒有照計畫走。 |','| 1 | 買了一張明信片。 |'].every(t=>inDoc('AA_515',t))); });
  await sec('1-5',()=>{ const s=SRC('data/feed_pg.js');
    check('1-5. AA_511 芷若 zr3i 私訊：「一個月一次。老闆說可以改兩次。我說不要。兩次我排不出片。」（不用格言收尾）',s.indexOf("'一個月一次。老闆說可以改兩次。我說不要。兩次我排不出片。'")>=0&&s.indexOf('一次比較珍惜')<0&&inDoc('AA_511','「一個月一次。老闆說可以改兩次。我說不要。兩次我排不出片。」')); });
  await sec('1-6',()=>{ const r=SUP497_LINES.yc.songs.find(x=>x.n===7);
    check('1-6. AA_497 宥辰第 7 則：「這週：法槌的聲音。其實是我用課本敲桌子。」（模擬法庭是使用者刪掉的設定）；點開、回覆照舊',!!r&&r.say[0]==='這週：法槌的聲音。其實是我用課本敲桌子。'&&r.where==='我房間。課本是民法，最厚的那本。'&&inDoc('AA_497','| 7 | 大二下 3 月 | 這週：法槌的聲音。其實是我用課本敲桌子。'),J(r)); });
  await sec('1-7',()=>{ check('1-7. pool_19 改名「蘇維倫」',CHARACTERS.pool_19.name==='蘇維倫'&&inDoc('AA_499','我叫蘇維倫。')&&inDoc('AA_498','**蘇維倫**'),CHARACTERS.pool_19.name);
    const hits=[]; const scan=dir=>{ for(const f of fs.readdirSync(path.join(H.ROOT,dir))){ const p=path.join(dir,f), st=fs.statSync(path.join(H.ROOT,p)); if(st.isDirectory()){ scan(p); continue; } if(!/\.js$/.test(f)) continue; if(fs.readFileSync(path.join(H.ROOT,p),'utf8').indexOf(OLD_CE)>=0) hits.push(p); } };
    scan('src'); check('1-7. src/ 沒有舊名（使用者刪掉的直屬學弟的名字；讀檔換字表、稿的檔名寫成 \\u 跳脫）',!hits.length,J(hits));
    const L2=POOL_STORY_B2.LINES.pool_19, flat=J(L2);
    check('1-7. 台詞、旁白裡叫他的換「維倫」（我叫蘇維倫、維倫在隔壁桌、你和維倫坐在最後一排）',/我叫蘇維倫/.test(flat)&&/維倫在隔壁桌/.test(flat)&&/你和維倫坐在最後一排/.test(flat)&&inDoc('AA_499','（維倫在隔壁桌，手上的筆停住了。）'));
    const old={msgs:[{text:'\u675c\u5b87\u6046：週六有活動',name:'\u675c\u5b87\u6046'},{text:'蘇'+OLD_CE+'：週六有活動',name:'蘇'+OLD_CE}],outings:[{title:'蘇'+OLD_CE+'：週六的課輔（社福中心 10:00）',place:'社福中心'}],invites:[{label:'週六 10:00 陪'+OLD_CE+'去社福中心的課輔'}],flags:{}};
    const n=POOL.migrate(old), s=J(old);
    check('1-7. 舊存檔讀檔：杜○○、蘇○○都換成蘇維倫（邀約那一句「陪○○」一起換）；換過的再讀一次不變',n===6&&s.indexOf(OLD_CE)<0&&s.indexOf('\u675c\u5b87\u6046')<0&&old.msgs[1].text==='蘇維倫：週六有活動'&&old.invites[0].label==='週六 10:00 陪維倫去社福中心的課輔'&&POOL.migrate(old)===0,n+' '+s); });

  /* ===================== AA_527 第 2 節：程式 ===================== */
  await sec('2-1',async()=>{
    /* 子晴說芷若：12/11（五）14～16 兩個人同框（c505_2_3）*/
    fresh('2026-12-11',15,'campus'); fam('heroine_02'); fam('heroine_04');
    const a=HEARD.talkDue(H.G,'heroine_04'); at('2026-12-11',17); const b=HEARD.talkDue(H.G,'heroine_04');
    check('2-1. 子晴說芷若（h505_zq_zr）：12/11 14～16 和芷若同一個圈子＝不說；17:00（不同框）＝說',a===null&&!!b&&b.id==='h505_zq_zr',J([a&&a.id,b&&b.id]));
    /* 筱涵說語彤：大三上週二、四 12～13（c507_3_3）*/
    const d=TD('Y3S1',5,2); fresh(d,12.5,'campus'); fam('heroine_03'); const c=HEARD.talkDue(H.G,'npc_huangxh'); at(d,14); const e=HEARD.talkDue(H.G,'npc_huangxh');
    check('2-1. 筱涵說語彤（h507_xh_yt）：大三上週二 12:30 和語彤同框＝不說；14:00＝說',c===null&&!!e&&e.id==='h507_xh_yt',J([c&&c.id,e&&e.id]));
    /* 她本人在玩家 4 m 內 */
    fresh(d,14,'campus'); fam('heroine_03'); npcAt('heroine_03',3.5,0); const f=HEARD.talkDue(H.G,'npc_huangxh',GM); GM.npc.heroine_03.obj.position.x=4.5; const g=HEARD.talkDue(H.G,'npc_huangxh',GM);
    GM.npc.heroine_03.obj.position.x=2; GM.npc.heroine_03.lv=1; const g2=HEARD.talkDue(H.G,'npc_huangxh',GM);
    check('2-1. 她本人在玩家 4 m 內（同一層）＝不說；4.5 m＝說；不同層＝說',f===null&&!!g&&!!g2,J([f&&f.id,g&&g.id,g2&&g2.id]));
    /* 3D 裡她跟著說的人（配對、_hcWith）*/
    fresh(d,14,'campus'); fam('heroine_03'); const yt=npcAt('heroine_03',20,0), xh=npcAt('npc_huangxh',21,0); yt.paired=xh; const h1=HEARD.talkDue(H.G,'npc_huangxh',GM); yt.paired=null; yt._hcWith='npc_huangxh'; const h2=HEARD.talkDue(H.G,'npc_huangxh',GM);
    check('2-1. 3D 裡她和說的人配對、或跟著說的人（_hcWith）＝不說',h1===null&&h2===null);
    /* preTalk 不記說過：等下一次 */
    fresh(d,14,'campus'); fam('heroine_03'); npcAt('heroine_03',1,0); H.said=[]; let pre=false; await (async()=>{ pre=await HEARD.preTalk(GM,{name:'筱涵'},'npc_huangxh'); })();
    const R=H.G.flags.HEARD||{said:{}}; check('2-1. 不說的那一次不記說過（等下一次）',pre===false&&!(R.said&&R.said.h507_xh_yt!=null)&&!H.said.length);
    /* 陳助教：稿寫「公館」的五句改在他自己的時段（不在公館）*/
    fresh('2028-07-03',15,'library'); fam('heroine_05'); const t1=HEARD.talkDue(H.G,'npc_ta_chen'); H.G.zone='gongguan'; H.G.hour=19; H.G.day=D('2028-07-07'); H.G.weekday=5; const t2=HEARD.talkDue(H.G,'npc_ta_chen');
    check('2-1. 陳助教 h508_ta_sis：平日下午總圖（他自己的時段）＝說；週五公館（和學姊吃飯那一格）＝不說',!!t1&&t1.id==='h508_ta_sis'&&t2===null,J([t1&&t1.id,t2&&t2.id]));
    const NZ=HEARD_LINES.talk.filter(x=>x.who==='npc_ta_chen'&&x.notZone==='gongguan').map(x=>x.id);
    check('2-1. 陳助教稿寫「公館」的五句都加 notZone（h506～h510_ta_sis）；沒寫公館的（h503、h504、h505）照舊',J(NZ)===J(['h506_ta_sis','h507_ta_sis','h508_ta_sis','h509_ta_sis','h510_ta_sis']),J(NZ));
    /* 麵店長桌（noodle）：阿哲說語彤 */
    const ndl=HEARD_LINES.noodle.Y1; check('2-1. 麵店長桌那兩則（阿哲說語彤）加 about（她本人在旁邊就不說）',ndl.every(x=>x.about==='heroine_03'));
    const w9=TD('Y1S2',9,2); fresh(w9,18,'noodle'); fam('zhe'); fam('heroine_03'); const k=STORY.ndlTalkPick(H.G); npcAt('heroine_03',1,1); const k2=STORY.ndlTalkPick(H.G);
    check('2-1. 麵店：大一下第 9 週阿哲那一則（h504_zhe_hand）——語彤在 4 m 內就換別則／不說',!!k&&k.e.once==='h504_zhe_hand'&&!(k2&&k2.e.once==='h504_zhe_hand'),J([k&&k.e.once,k2&&k2.e.once])); });

  await sec('2-2',()=>{ const sp=G=>J((HCIRCLE.specOf('hc_ayi',G).props||[]).map(p=>typeof p==='object'?p.name:p)), w=(t,k)=>{ fresh(TD(t,k,2),18,'noodle'); return H.G; };
    const r=[w('Y1S2',8),w('Y1S2',9),w('Y1S2',7),w('Y1S2',10),w('Y1S1',8),w('Y2S1',8)].map(G=>{ H.G=G; return sp(G).indexOf('bandage')>=0; });
    check('2-2. 麵店阿姨的繃帶只在大一下第 8～9 週（第 7、10 週、大一上、大二上都沒有）',J(r)===J([true,true,false,false,false,false]),J(r));
    H.G=w('Y1S2',8); const c8=J(SUP519.clerkSpec('noodle',H.G).props); H.G=w('Y1S2',12); const c12=J(SUP519.clerkSpec('noodle',H.G).props);
    check('2-2. 廚房那位（店員，src/sup519_3d.js clerkSpec）也一樣',/bandage/.test(c8)&&!/bandage/.test(c12)&&!/when/.test(c8),J([c8,c12])); });

  await sec('2-3',()=>{ const C=SUP497_LINES.yu.c6, d0=D('2028-03-16');
    const run=v=>{ fresh(d0,13,'linze',{YU_C6:v,YU_C6_DAY:d0}); fam('yu'); contact('yu'); ruleAt(d0+14,20); ruleAt(d0+14,21); return byTag('yu_c6_after').map(m=>m.text); };
    const a=run('pay'), b=run('open'), c=run('rule');
    check('2-3. C6 之後第 14 天：要學弟賠＝第 1 列、把帳攤開＝第 3 列（指導老師）、社團的規則＝第 2 列',J(a)===J(C.soft)&&J(b)===J(C.teacher)&&J(c)===J(C.rule),J([a,b,c]));
    check('2-3. 第 3 列在稿（AA_497 3-6）',inDoc('AA_497','指導老師陪我們對了一次帳')); });

  await sec('2-4',()=>{ check('2-4. 阿哲的群組訊息「這週麵店沒開」不加句號（口氣表 2-1）',AA519_LINES.cafe&&J(AA519_LINES).indexOf("這週麵店沒開。")<0&&J(AA519_LINES).indexOf('["zhe","這週麵店沒開"]')>=0);
    const g=D('2026-11-09'); fresh(g,12,'dorm'); PHONE.join(H.G,'law_class','法律系（全班）'); PHONE.join(H.G,'noodle_team','麵店團'); ruleAt(g,21.1);
    const z=thread('g:noodle_team').filter(m=>m.from==='zhe').map(m=>m.text), y=thread('g:law_class').map(m=>m.text);
    check('2-4. 麵店團阿哲再貼一次＝「（轉貼宥辰）週六晚上八點。公館。地下室。不用買票，有捐款箱。」（原文的句號照留）；班級群組宥辰照原文',z.includes('（轉貼宥辰）週六晚上八點。公館。地下室。不用買票，有捐款箱。')&&y.includes('週六晚上八點。公館。地下室。不用買票，有捐款箱。'),J([z,y])); });

  await sec('2-5',()=>{ const row=id=>HCIRCLE.row(id);
    check('2-5. 沛珊「總圖二樓」三列（c504_6_1、c505_6_1、c505_6_2）＝總圖大廳二樓自習區（library_hall）',['c504_6_1','c505_6_1','c505_6_2'].every(id=>row(id)&&row(id).zone==='library_hall'));
    const z=(k,h)=>{ fresh(k,h,'library_hall'); const e=STORY.schedEnt(CHARACTERS.classmate_peishan,H.G); return e&&e.zone; };
    const r=[z('2026-04-06',16.5),z('2026-04-07',16.5),z('2026-04-07',18.5),z('2026-09-14',16.5),z('2025-09-15',16.5),z('2026-03-23',16.5)];
    check('2-5. 沛珊作息：4/6～6/14 週一 16:30 總圖大廳；週二 16:30 溫州街課輔班（照舊）、18:30 總圖大廳；大二上總圖大廳；大一上、4/6 以前照舊三樓閱覽區',J(r)===J(['library_hall','wenzhou','library_hall','library_hall','library','library']),J(r));
    fresh('2026-09-14',16.5,'library_hall'); const rows=HCIRCLE.rowsIn(H.G,'library_hall').map(x=>x.id), bh=STORY.schedEnt(CHARACTERS.classmate_bohan,H.G);
    check('2-5. 大二上第 2 週週一 16:30：圈子 c505_6_1 在總圖大廳成立，柏翰跟著她（在 library_hall）',rows.includes('c505_6_1')&&!!bh&&bh.zone==='library_hall',J([rows,bh&&bh.zone]));
    const on=k=>{ fresh(k,19,'gongguan'); return HCIRCLE.rowsIn(H.G,'gongguan').map(x=>x.id); };
    const g=[on('2028-03-17'),on('2028-06-09'),on('2028-06-16'),on('2028-06-23'),on('2028-06-30'),on('2028-07-28'),on('2028-08-04')].map(a=>a.includes('c508_5_2')?'Y':(a.includes('c519_2_3')?'O':'-'));
    check('2-5. 學姊＋陳助教週五 18:30（c508_5_2）：演到 7/28；6/16 是口試那一列、6/23 不演、8/4 不演',J(g)===J(['Y','Y','O','-','Y','Y','-']),J(g));
    check('2-5. 晨希大四下的錄音：2029-05-12（六）22:00（成發那天）',SRC('pool_more3d.js').indexOf("DK('2029-05-12'),22,[L[CX].recY4b]")>=0&&SRC('pool_more3d.js').indexOf('2029-05-13')<0&&inDoc('AA_514','2029-05-12（六）22:00'));
    const kx=KX_MOOT3_LINES.opts?J(KX_MOOT3_LINES):J(KX_MOOT3_LINES), t='（山下小吃街的麵店。她吃得很快，一句話都沒說，吃完才抬頭。）';
    check('2-5. 可昕模擬法庭後去吃：旁白「（山下小吃街的麵店。……）」（對齊字幕）；底圖的判斷跟著換',kx.indexOf(t)>=0&&kx.indexOf('政大後門')<0&&KXMOOT3.FOOD_RE.test(t)&&inDoc('AA_514',t));
    const R=row('c504_1_1'), tm=k=>{ fresh(k,18.3,'campus'); return HCIRCLE.timeOk(R,H.G); };
    check('2-5. 以安＋Alison（c504_1_1）：5/11、5/13（第 12 週、還沒吵架）照稿成立；5/18 不成立（一個人那一列）',tm('2026-05-11')&&tm('2026-05-13')&&!tm('2026-05-18')&&tm('2026-04-29'),J([tm('2026-05-11'),tm('2026-05-13'),tm('2026-05-18')])); });

  await sec('2-6',()=>{ const e=(HEARD_LINES.label||[]).find(x=>x.id==='h505_fr_yt'), t='民總最後一排那個社會系的學姊，都不講話。可是她的筆記比我們少一半，都是重點。';
    check('2-6. AA_505 3-4 大一的學妹那一句接上（說的人是圈子的 hc_fr1／hc_fr2）',!!e&&e.t===t&&J(e.who)===J(['hc_fr1','hc_fr2'])&&e.about==='heroine_03'&&inDoc('AA_505','大一的學妹（霖澤館門口，第 6 週起）：「'+t+'」'),J(e));
    const w6=TD('Y2S1',6,4), on=(d,h)=>{ fresh(d,h,'campus'); return HEARD.labelOn(H.G,e); };
    check('2-6. 時間：大二上第 6 週起週四 15:30～15:40（語彤 15:30 走了以後；第 2～5 週、考試週、15:20 都沒有）',!!e&&on(w6,15.6)&&!on(w6,15.2)&&!on(TD('Y2S1',5,4),15.6)&&!on(TD('Y2S1',8,4),15.6)&&on(TD('Y2S1',15,4),15.6));
    /* 3D：站好、走近聽到；她本人在旁邊不說 */
    fresh(w6,15.6,'campus'); const spawned=[]; GM.spawnNPC=(id,spec,x,z,o)=>{ const n={obj:{position:{x,y:0,z},rotation:{y:0},visible:true,children:[],userData:{}},lv:o&&o.lv||0,name:''}; GM.npc[id]=n; spawned.push(id); return n; };
    E.player.obj.position.x=30; E.player.obj.position.z=-97; HEARD.labelTick(GM); const far=caps.length;
    check('2-6. 兩個學妹站在霖澤館門口（HCIRCLE.spawnLabel）；離 5 m 以上不出字幕',J(spawned.sort())===J(['hc_fr1','hc_fr2'])&&far===0&&GM.npc.hc_fr1.name==='大一的學妹',J(spawned));
    check('2-6. HCIRCLE.arrange 不放開她們（HEARD.labelWant）',J(HEARD.labelWant(GM).sort())===J(['hc_fr1','hc_fr2']));
    npcAt('heroine_03',37,-97.5); E.player.obj.position.x=36; E.player.obj.position.z=-97; HEARD.labelTick(GM); const near=caps.length;
    delete GM.npc.heroine_03; HEARD.labelTick(GM);
    check('2-6. 語彤在旁邊（4 m 內）＝不說；她走了＝字幕「大一的學妹：……」一次',near===0&&caps.length===1&&caps[0][0]==='大一的學妹'&&caps[0][1]===t,J(caps));
    HEARD.labelTick(GM); check('2-6. 說過了不再說、也不再站（labelWant 空）',caps.length===1&&!HEARD.labelWant(GM).length);
    const ps=k=>{ fresh(k,10,'wenzhou'); const x=STORY.schedEnt(CHARACTERS.classmate_peishan,H.G); return x&&x.zone; };
    check('2-6. 沛珊課輔班營隊 6/22～6/26（一～五）白天在溫州街；6/19、6/29 不在',ps('2026-06-22')==='wenzhou'&&ps('2026-06-26')==='wenzhou'&&ps('2026-06-19')!=='wenzhou'&&ps('2026-06-29')!=='wenzhou',J([ps('2026-06-22'),ps('2026-06-26'),ps('2026-06-19'),ps('2026-06-29')])); });

  await sec('2-7',async()=>{ const k='2029-11-20', d=D(k);
    fresh(k,1,'dorm',{GRADUATED:true}); PHONE.at(H.G,d,5+7/60,[{th:'p:heroine_02',from:'heroine_02',text:'測試：清晨'}],'t527_quiet'); const r=PG.jumpTo(GM,d*24+5+7/60), m=byTag('t527_quiet')[0];
    check('2-7. 00:00～07:00 送到、不用回的訊息：跳的時候停在 07:30；訊息上的時間照原本（05:07）',r==='msg'&&H.G.day===d&&Math.abs(H.G.hour-7.5)<1e-6&&!!m&&Math.abs(m.h-5.12)<0.02,J({r,day:H.G.day-d,h:H.G.hour,mh:m&&m.h}));
    fresh(k,1,'dorm',{GRADUATED:true}); PHONE.at(H.G,d,5+7/60,[{th:'p:heroine_02',from:'heroine_02',text:'測試：要回',ask:{id:'t527_ask',opts:[{t:'好'}]}}],'t527_ask'); const r2=PG.jumpTo(GM,d*24+5+7/60);
    check('2-7. 要回的照現在：送到就停（05:07）',r2==='msg'&&Math.abs(H.G.hour-(5+7/60))<0.02,J({r2,h:H.G.hour}));
    fresh(k,1,'dorm',{GRADUATED:true}); PHONE.at(H.G,d,5+7/60,[{th:'p:heroine_02',from:'heroine_02',text:'清晨'}],'t527_q2'); PHONE.at(H.G,d,6.5,[{th:'p:kexin',from:'kexin',text:'要回',ask:{id:'t527_a2',opts:[{t:'好'}]}}],'t527_a2'); const r3=PG.jumpTo(GM,d*24+5+7/60);
    check('2-7. 等到 07:30 的途中又送到要回的（06:30）＝當場停在 06:30',r3==='msg'&&Math.abs(H.G.hour-6.5)<1e-6,J({r3,h:H.G.hour}));
    fresh(k,1,'dorm',{GRADUATED:true}); PHONE.at(H.G,d,8,[{th:'p:heroine_02',from:'heroine_02',text:'白天'}],'t527_day'); const r4=PG.jumpTo(GM,d*24+8);
    check('2-7. 07:00 以後的照現在（08:00 送到就停）',r4==='msg'&&Math.abs(H.G.hour-8)<1e-6,J({r4,h:H.G.hour}));
    check('2-7. 芷若 6/3 05:07 那一則本身沒有回覆（不用回）',PG.MSGS.some(x=>x.tag==='pg_zr_photo'&&Math.abs(x.at[1]-(5+7/60))<1e-6)); });

  /* ===================== AA_528 ===================== */
  await sec('528-1-1',()=>{ const mv=(k,h,z,id)=>{ fresh(k,h,z); return POOL.meetVersion(H.G,id); };
    const r={h:mv('2026-09-14',14.5,'library','pool_10'),sc:mv('2026-09-15',10.5,'soclib','pool_19'),tz:mv('2026-09-14',11,'library_hall','pool_2'),nw:mv('2026-09-14',20,'library_b1','pool_17'),ys:mv('2026-09-14',13.5,'library','pool_18'),yh:mv('2026-09-14',16.5,'campus','pool_6'),qjq:mv('2026-09-15',21.5,'dorm_hall','pool_3')};
    check('2-1… AA_528 1-1：大一沒認識的，大二起照他平常的地點、時段還是可以第一次說話（何宇軒、維倫、宗霖、乃文、嚴守誠、鄭元碩、邱家齊）',Object.values(r).every(v=>v==='meet'),J(r));
    const g={tz:mv('2028-09-13',11,'library_hall','pool_2'),yh:mv('2027-09-15',16.5,'campus','pool_6'),ys:mv('2027-09-14',13.5,'library','pool_18')};
    check('AA_528 1-1：他已經畢業的不能再認識（大二六位 2028-06、大三四位 2027-06 以後）',Object.values(g).every(v=>v===null),J(g));
    fresh('2026-09-15',10.5,'soclib'); const L=POOL_STORY_B2.LINES.pool_19.meet; check('AA_528 1-1：第一場照演（維倫的「民總，你坐我斜前面」照原本的版本）',J(L).indexOf('民總，你坐我斜前面')>=0&&POOL.meetVersion(H.G,'pool_19')==='meet');
    fresh('2027-04-14',11,'library_hall'); const pr=STORY.presence('pool_2',H.G);
    check('AA_528 2-1：宗霖大二下在日本（2027-03～07）＝presence 不在、地點「日本」；不能在總圖認識',pr.here===false&&pr.away==='日本'&&POOL.meetVersion(H.G,'pool_2')===null,J(pr));
    fresh('2027-08-10',11,'library_hall'); check('AA_528 2-1：8 月回來了',STORY.presence('pool_2',H.G).here!==false); });

  await sec('528-1-2',()=>{ let sat=null; for(let k=0;k<12;k++){ const d=TD('Y2S1',1,6)+k*7; fresh(d,10,'wancai'); if(STORY.fafuDuty(H.G)){ sat=d; break; } }
    const v=sat!=null?POOL.meetVersion(H.G,'pool_20'):null, L=POOL_STORY_B2.LINES.pool_20;
    check('AA_528 1-2：馬佳蓉隔週六萬才館法服值班的時段可以認識（第 9 點起是專用版本 meetB）',v==='meetB',J({sat:sat&&keyOf(sat),v}));
    check('AA_528 第 9 點（2026-10-30 AA-B 04:55）：萬才館那一場用專用版本 meetB（值班桌、柱子、檯燈），不再借社博那一場（meetDuty 拿掉）；社博的 meet 照舊',!!L.meetB&&!L.meetDuty&&J(L.meetB.map(l=>l.text||null)).indexOf('值班桌')>=0&&J(L.meet.map(l=>l.text||null)).indexOf('帳篷後面')>=0);
    fresh(TD('Y2S1',2,6),10,'wancai'); check('AA_528 1-2：不是值班的週六沒有',STORY.fafuDuty(H.G)||POOL.meetVersion(H.G,'pool_20')===null); });

  await sec('528-1-3',()=>{ const r=HCIRCLE.row('c503_7_1'), d=TD('Y1S1',5,3); fresh(d,19.5,'wancai'); const zq=npcAt('heroine_04',0,4), cx=npcAt('pool_11',1,4), ly=npcAt('pool_5',-1,4); cx.talk=()=>{};
    const nm0=SOCIAL.npcName('pool_11'); HCIRCLE.intro(GM,r,zq);
    check('AA_528 1-3：吉他社同框（c503_7_1）只換名牌：晏如、晨希不記 FIRST_MET、不算認識；頭上、按鈕寫名字',!SOCIAL.has('pool_11','FIRST_MET')&&!SOCIAL.has('pool_5','FIRST_MET')&&nm0!=='葉晨希'&&cx.name==='葉晨希'&&SOCIAL.npcName('pool_11')==='葉晨希'&&cx.talkLabel==='和葉晨希說話'&&H.G.flags.HCIRCLE.intro.pool_11===H.G.day,J([nm0,cx.name,SOCIAL.npcName('pool_11')]));
    const d2=TD('Y1S1',8,1); fresh(d2,19.5,'campus'); H.G.flags.HCIRCLE={intro:{pool_11:d},heard:{},once:{}};
    check('AA_528 1-3：看過名牌的，她自己的第一場（4-1「……很難聽嗎？」，萬才館旁邊）照演',POOL.meetVersion(H.G,'pool_11')==='meet'&&SOCIAL.npcName('pool_11')==='葉晨希');
    const where=(day,h)=>{ fresh(day,h,'wancai'); const e=STORY.schedEnt(CHARACTERS.pool_11,H.G); return e&&e.zone+'/'+e.act; };
    const a=where(TD('Y1S1',5,3),19.5), b=where(TD('Y1S1',2,3),19.5), c=where(TD('Y3S1',5,3),19.5);
    check('AA_528 1-3：晨希週一、三 19～21：吉他社有課＝在吉他社（萬才館社課），同一時段不在萬才館旁邊；沒課（第 2 週、大三）＝萬才館旁邊',a==='wancai/club'&&b==='campus/linger'&&c==='campus/linger',J([a,b,c])); });

  await sec('528-1-4',async()=>{ const M='pool_20', F=POOL.FLOW[M], gen=F[1];
    const tryG=async(day,flags,did)=>{ fresh(day,10,'wancai',flags||{}); fam(M); if(did) POOL.mark(H.G,'jrHand'); H.said=[]; const ok=await gen(GM,{name:'馬佳蓉'}); return ok&&SOCIAL.has(M,'SHARED_SECRET'); };
    const y3=await tryG(TD('Y3S1',3,2)), y2w8=await tryG(TD('Y2S2',8,2)), y2w7=await tryG(TD('Y2S2',7,2));
    check('AA_528 1-4：佳蓉一般的「其實……」大二下第 8 週起一直有（大三上也有）；第 7 週以前沒有',y3&&y2w8&&!y2w7,J([y3,y2w8,y2w7]));
    const fm=await tryG(TD('Y3S1',3,2),{lawclub:true}), fd=await tryG(TD('Y3S1',3,2),{lawclub:true},true);
    check('AA_528 1-4：法服的玩家錯過交接（大二下第 15 週六）＝之後見到她也能說；演過交接的不再出一般的',fm&&!fd,J([fm,fd]));
    const hd=TD('Y2S2',15,6); const msg=(flags,did)=>{ fresh(hd,8,'dorm',flags); fam(M); contact(M); if(did) POOL.mark(H.G,'jrHand'); ruleAt(hd,13); ruleAt(hd,20.05); return byTag('pool_jr_hand').map(m=>m.text); };
    const n=msg({}), f1=msg({lawclub:true}), f2=msg({lawclub:true},true), hm=POOL_STORY_B2.LINES[M].handMsg;
    check('AA_528 1-4：「器材組交出去了」私訊：不是法服的照舊；法服的錯過交接也收（同一個時間 20:00）；演過交接的沒有',J(n)===J(hm)&&J(f1)===J(hm)&&!f2.length,J([n,f1,f2])); });

  await sec('528-1-5',async()=>{ const NW='pool_17', L=POOL_STORY_B3.LINES[NW];
    check('AA_528 1-5：乃文的認識那一場：選「我自己做筆記就好。」記 NW_SELF',J(L.meet).indexOf('"NW_SELF":true')>=0);
    check('AA_528 1-5：「（借筆記）」兩句照稿',L.borrowOpt==='（借筆記）'&&J(L.borrowLater.map(l=>l.text))===J(['（翻開小本子）改變主意了？','（在小本子上寫下你的名字和日期）好。週五以前還我。'])&&inDoc('AA_500','蕭乃文：（翻開小本子）改變主意了？')&&inDoc('AA_500','蕭乃文：（在小本子上寫下你的名字和日期）好。週五以前還我。'));
    const opt=(day,h,zone,o)=>{ o=o||{}; fresh(day,h,zone,{NW_SELF:true}); SOCIAL.meet(NW,'library_b1'); POOL.rec(H.G).nwSelf=o.term||'Y2S1'; if(o.borrow) H.G.flags.NW_BORROW=true; const out=[]; for(const f of STORY.TALK_OPTS){ try{ for(const x of (f(H.G,NW,GM)||[])) out.push(x); }catch(e){} } return out.filter(x=>x.t==='（借筆記）'); };
    const ok=opt(TD('Y2S1',3,2),20,'library_b1'), w8=opt(TD('Y2S1',8,7),20,'library_b1'), w9=opt(TD('Y2S1',9,2),20,'library_b1'), sat=opt(TD('Y2S1',3,6),20,'library_b1'), am=opt(TD('Y2S1',3,2),15,'library_b1'), out=opt(TD('Y2S1',3,2),20,'library'), nx=opt(TD('Y2S2',3,2),20,'library_b1'), bw=opt(TD('Y2S1',3,2),20,'library_b1',{borrow:true});
    check('AA_528 1-5：那學期第 8 週週日以前、平日 19～22、在 B1 和她說話＝多一個「（借筆記）」；第 9 週、週末、下午、不在 B1、下一學期、已經借過都沒有',ok.length===1&&w8.length===0&&w9.length===0&&sat.length===0&&am.length===0&&out.length===0&&nx.length===0&&bw.length===0,J([ok.length,w8.length,w9.length,sat.length,am.length,out.length,nx.length,bw.length]));
    const w7=opt(TD('Y2S1',8,5),20,'library_b1'); check('AA_528 1-5：第 8 週週五還有',w7.length===1);
    const o=opt(TD('Y2S1',3,2),20,'library_b1')[0]; H.said=[]; await o.run(GM,{name:'蕭乃文'});
    const R=POOL.rec(H.G).nw; check('AA_528 1-5：借了：照「謝謝學姊。」那一支——記 NW_BORROW、加聯絡方式、週五以前還（R.nw）',H.G.flags.NW_BORROW===true&&!!R&&R.back==null&&CALENDAR.dateOf(R.due).wd===5&&INV.hasContact(H.G,NW)&&H.said.map(x=>x.t).join('|')===L.borrowLater.map(l=>l.text).join('|'),J({R,said:H.said})); });

  await sec('528-2-2',()=>{ const d=TD('Y3S2',16,6), all=['pool_20','pool_2','pool_5','pool_8','pool_11','pool_14','pool_17'];
    const run=(jp,skip)=>{ const ab=STORY.abroad; STORY.abroad=G=>!!jp; try{ fresh(d-2,12,'dorm'); for(const id of all) if(id!==skip){ contact(id); fam(id); } return POOL_MORE.gradSlots(H.G).map(o=>[o.id,o.day-d,o.h]); } finally { STORY.abroad=ab; } };
    const jp=run(true), tw=run(false), nb=run(true,'pool_2');
    check('AA_528 2-2：日本路線的畢業私訊從 6/10 起一天最多兩個人：佳蓉、宗霖、晏如、書豪、晨希、振宇、乃文；第一個 20:00、第二個 21:30',J(jp)===J([['pool_20',0,20],['pool_2',0,21.5],['pool_5',1,20],['pool_8',1,21.5],['pool_11',2,20],['pool_14',2,21.5],['pool_17',3,20]]),J(jp));
    check('AA_528 2-2：人在臺灣的玩家也一樣（只有佳蓉那一則：6/10 20:00）',J(tw)===J([['pool_20',0,20]]),J(tw));
    check('AA_528 2-2：沒有聯絡方式的不佔位子（沒有宗霖＝晏如補上 21:30）',J(nb.slice(0,3))===J([['pool_20',0,20],['pool_5',0,21.5],['pool_8',1,20]]),J(nb));
    const ab=STORY.abroad; STORY.abroad=()=>true; try{ fresh(d-1,12,'dorm'); for(const id of all){ contact(id); fam(id); } for(let k=0;k<4;k++){ ruleAt(d+k,12); ruleAt(d+k,23); } } finally { STORY.abroad=ab; }
    const tags=['pool_jr_grad','pool_tzl_gradjp','pool_lyr_gradjp','pool_ysh_gradjp','pool_ycx_gradjp','pool_yzy_gradjp','pool_nw_gradjp'].map(t=>{ const m=byTag(t)[0]; return m?[m.day-d,m.h]:null; });
    check('AA_528 2-2：真的照時間送（同一分鐘最多一個人）',J(tags)===J([[0,20],[0,21.5],[1,20],[1,21.5],[2,20],[2,21.5],[3,20]]),J(tags)); });

  await sec('528-2-3',()=>{ const T=DORM203_LINES.room.kai.rows, k2=T.find(r=>r.k==='k2'), k2c=T.find(r=>r.k==='k2c');
    const open=(t,w,wd,h,r,f)=>{ fresh(TD(t,w,wd),h,'dorm',f||{}); return DORM203.rowOpen(H.G,'kai',r); };
    const a=open('Y1S1',11,2,22,k2), b=open('Y1S1',13,4,22,k2), c=open('Y1S1',13,4,23.6,k2), e=open('Y1S1',14,1,22,k2), f=open('Y1S2',2,1,22,k2);
    check('AA_528 2-3：阿凱「上次宵夜是我下去拿的。」第 13 週 3-3 宵夜那一晚（週四 23:00～23:30）以後才出；大一下照舊',!a&&!b&&c&&e&&f,J([a,b,c,e,f]));
    const g=open('Y1S1',11,2,22,k2c,{KAI_COUNTED:true,R203_SUPPER_KAI:true}), h=open('Y1S1',14,1,22,k2c,{KAI_COUNTED:true,R203_SUPPER_KAI:true});
    check('AA_528 2-3：宵夜那晚算到他的換 k2c（照現在），一樣在宵夜以後',!g&&h);
    check('AA_528 第 3 節：阿凱兩句收尾「……就這樣。」',k2.t==='上次宵夜是我下去拿的。……就這樣。'&&k2c.t==='上次宵夜，你說了謝謝。……就這樣。'&&inDoc('AA_502','「上次宵夜是我下去拿的。……就這樣。」')&&inDoc('AA_502','「上次宵夜，你說了謝謝。……就這樣。」')); });

  await sec('528-3',()=>{ const B2=POOL_STORY_B2.LINES, B3=POOL_STORY_B3.LINES, B4=POOL_STORY_B4.LINES;
    const rows=[[B2.pool_10.greet,'「為什麼你今天這麼早？……算了，你不用回答。」','AA_499','為什麼你今天這麼早？……算了，你不用回答。'],
      [B2.pool_19.greet,'「這週六中心有活動。……你不用來。」','AA_499','這週六中心有活動。……你不用來。'],
      [B3.pool_8.greet,'「（他按掉手機的計時器）時間到。」','AA_500','（他按掉手機的計時器）時間到。'],
      [B3.pool_8.greet,'「你今天走得比較慢。」','AA_500','你今天走得比較慢。'],
      [B3.pool_17.greet,'「我拍一下。……拍筆記，不是拍你。」','AA_500','我拍一下。……拍筆記，不是拍你。']];
    const bad=rows.filter(([a,t,n,dt])=>!a.includes(t)||!inDoc(n,dt)).map(r=>r[1]);
    check('AA_528 第 3 節：宇軒、維倫、書豪兩句、乃文的招呼換字（照稿）',!bad.length,J(bad));
    const flat=J([B2,B3,B4]); check('AA_528 第 3 節：舊句（「……沒事，我只是想問。」「……沒事，習慣了。」「慢十秒」「……沒事，我在拍我的筆記」）不在遊戲',!/沒事，我只是想問|沒事，習慣了|慢十秒|沒事，我在拍我的筆記|沒事，我只是說一下/.test(flat));
    check('AA_528 第 3 節：芸萱「好。……那我先問別人。」（不留下次）',B4.pool_15.inviteNo==='好。……那我先問別人。'&&inDoc('AA_501','廖芸萱：好。……那我先問別人。'));
    check('AA_528 第 3 節：晨希的人物頁「背吉他袋的學姊」',CHARACTERS.pool_11.cardBefore==='背吉他袋的學姊'&&inDoc('AA_498','「背吉他袋的學姊」'),CHARACTERS.pool_11.cardBefore); });

  await sec('528-3-1',async()=>{ const LQ='pool_16', L=POOL_STORY_B2.LINES[LQ], one='其實……我背法條是配節奏的。……你不要叫我唱，我會害羞。', nt='「刑法那幾條比較好押韻。……不要問我押什麼。」';
    check('AA_528 3-1：立群秘密那一場一句說完；閒聊「說過秘密以後」那一格換新句',L.secret.length===1&&L.secret[0].text===one&&L.talk.some(x=>x.when==='secret'&&x.t===nt)&&inDoc('AA_499','詹立群：'+one)&&inDoc('AA_499',nt.replace(/^「|」$/g,'')));
    fresh(TD('Y1S1',11,5),20,'gongguan'); fam(LQ); H.said=[]; H.picks=[0]; const ok=await POOL.FLOW[LQ][0](GM,{name:'詹立群'}); const s=H.said.map(x=>x.t);
    check('AA_528 3-1：秘密那一場只聽到一次「我背法條是配節奏的」，新的閒聊句不在同一場',ok&&s.filter(t=>/我背法條是配節奏的/.test(t)).length===1&&!s.includes(nt)&&SOCIAL.has(LQ,'SHARED_SECRET'),J(s)); });

  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); console.log('FAILED 1'); process.exit(1); });
