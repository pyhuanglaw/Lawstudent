// AA_497 五位配角改稿（企劃線 60fc3b9a3＝7a38216ca＋第 8 節；任務 NPC-STORY-1028、USER_WANTS X119）：宥辰、芯慈、Alison、明軒、Kevin——不需要瀏覽器。
//   0  稿：src/data/sup497_lines.js 每一句、改在各檔的句子都在稿裡（一字不差；地下室照 BB_70 7b、大四兩則照 BB_113）；稿的每一句（> 那幾行、表格）都在遊戲裡
//   1  宥辰：1-1 personality；1-3 認識（課堂那一句後面＋下課；晚十分鐘到）；1-4 週五的歌 13 則（日子、私訊／班群、回覆、輪流、曾靖雯那一句、第 13 則）；
//      1-5 電梯（順手的事：開口、期限、12:10 做完、婉拒、過期那一則）；1-6 地下室（邀請、出發、站哪裡、電梯那一句、立群、散場三個回答、沒去的錄影、五年後）；
//      1-7 被當一科、叫起床三次、大三上過了；1-8 合約三條路、大三下第 4 週、BB_113 兩則；1-9 沛珊 n1、明軒路口；1-10 閒聊；1-11 DJ 第二次以後
//   2  芯慈：2-1 開學那天；2-2 影印機；2-3 慈 3 的 B1 版、提示、補救（INV 約 Café、白天版）；2-4 她爸爸＋當晚；2-5 慈 6 多一行＋沒演到的私訊；
//      2-6 她約（慈 1 隔天、慈 3 當晚、讀書、期末飯、日本、讀書會、挑筆記）；2-7 讀書會；2-8 房間物品；2-9 閒聊、換句、追劇減量
//   3  Alison：3-1 第 3 週保證認識；3-2 YU2_PICK；3-3 一個人的早餐＋語 4；3-4 退社（舊的 yu_clubs 不發）；3-5 車禍那晚＋11/23 旁白；3-6 C6 的後果（熊拿掉）；3-7 法圖＋美國＋第 10 週＋尾聲；3-8 三個社團
//   4  明軒：4-1 B1 版 M1、作息、提示；4-2 傘、咖啡、位子、M2；4-3 德文（INV 約 B1 討論室）；4-4 存摺；4-5 閒聊；4-6 梗（哈哈、滷蛋、CP 值）
//   5  Kevin：5-2 交棒（9/14 揪、回「去。」、9/17 家聚、KV_HANDOVER、沒去 9/18、宜蓁私訊、群組那一段拿掉、宜蓁改名＋讀檔）；5-3 國考、錯題本、事務所；5-4 梗
//   6  陳助教；7 舊存檔（過了的不補、沒有記號照「沒選」）
//   8  第 8 節（AA-C 回 LAWWW-C 7bd68b7cf 的問題）：2-1 還沒認識以安的旁白與名字（在 2-1 節）；芯慈追劇八處換句、照留五處；明軒的滷蛋；學妹改名佳穎、姊姊宜蓁不動
// 第一輪修改前（開發分支 ff9f54209，2026-10-28 開工時；git archive 那一版的 index.html、src/、tests/、lib/ 放進這支測試真的跑過，稿從這個 repo 的 git 讀）：PASS 2、FAIL 46——
//   36 節沒有 SUP497／SUP497_LINES，丟例外中斷（0a、0b、1-3～1-11、2-1～2-9、3-1～3-7、4-1～4-5、5-2～5-4、7）；
//   直接 FAIL 的 10 項：新檔、index.html 沒有；稿的 195 行「>」遊戲都沒有；1-1 personality 沒有「在錄音室待過一年」；1-5 沒有兩場；3-8「三個社團」（兩項）；
//   4-6 fit3d 當面的「哈哈」、明軒朋友階道別的滷蛋；6 陳助教大一、大二週二上午還在教室。
//   本來就對的 2 項：0 讀得到稿；6 三個社團的社長標籤已經是全名（AA_496 時改的）。
// 第二輪（第 8 節）修改前（開發分支 a8cba7618＝已經有第一輪；同樣 git archive 那一版放進這支測試真的跑過）：PASS 259、FAIL 24——
//   0a 遊戲的句子不在新稿（第一輪的句子在；新稿的「佳穎」遊戲裡沒有）、0b 稿的「佳穎」遊戲裡沒有；2-1 還沒認識以安的旁白與名字兩項＋一節丟例外（沒有 day1Pre）；
//   5-2 六項、5-3 兩項、7 一項（學妹還叫宜蓁）；8 十項（追劇八處、滷蛋、清單、佳穎都還是舊的）。本來就對的：照留的五處追劇、M1／M2／德文的滷蛋、姊姊叫宜蓁。
// 修改後：ALL PASS（284 項）。用法：node tests/aa497_supporting_unit.js（稿用 git show 讀：在沒有 .git 的目錄跑時，設環境變數 AA497_DOCREPO＝這個 repo 的目錄）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（pg_harness 已經載過的不再載；畫 3D 的五支在 Node 載不進來，跳過）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);   /* adv3d.js 要 DOM：留 pg_harness 的 ADV（記下說的話）*/
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
const S=()=>typeof SUP497!=='undefined'?SUP497:null, L=()=>typeof SUP497_LINES!=='undefined'?SUP497_LINES:null;
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const YC='classmate_youchen', XC='classmate_xinci', AN='heroine_01', YU='yu', MX='classmate_mingxuan', ZHE='zhe', SIS='heroine_05';
const BASE={introDone:true,afternoonDone:true,classDone:true,metAn:true,met_an:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true};
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({},BASE,flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  E.player.busy=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false; if(S()) S().bind(GM); STORY._bindGM(GM); return G; };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const play=async(id,pk)=>{ H.said=[]; H.opts=[]; H.picks=(pk||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const has=t=>H.said.some(s=>s.t===t), said=(who,t)=>H.said.some(s=>s.who===who&&s.t===t), idx=t=>H.said.findIndex(s=>s.t===t);
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const ruleAt=(d,h)=>{ at(d,h); rules(); };
const thread=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const texts=th=>thread(th).map(m=>m.text);
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const fam=id=>H.rel(id,25,0,0), friend=id=>H.rel(id,45,30,0), acq=id=>H.rel(id,8,0,0);
const contact=id=>INV.addContact(H.G,id);
const answer=(tag,k)=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===tag); if(!m) return null; return PHONE.answer(H.G,tag,k); };
const askOpts=tag=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id===tag); return m?m.ask.opts.map(o=>o.t):null; };
const wait=()=>new Promise(r=>setTimeout(r,0));
const NM=id=>SOCIAL.displayName(id);

/* ---------- 讀稿 ---------- */
const git=(sha,f)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+sha+':"docs/story_planning/'+f+'"',{cwd:process.env.AA497_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const DOC0=git('60fc3b9a3','AA_497_五位配角改稿_宥辰_芯慈_Alison_明軒_Kevin.md'), BB70=git('60fc3b9a3','BB_70_日常與邀約_芷若_子晴_溫學姊_配角.md'), BB113=git('60fc3b9a3','BB_113_BB角色的同行聊天與手機小事池.md');
const DOC=DOC0.split('宜蓁').join('佳穎');   /* 第 8 節第 5 點：學妹改名「佳穎」（稿的 5-2、5-3 還寫宜蓁；整份稿只有學妹叫宜蓁）*/
const S8=(()=>{ const i=DOC0.indexOf('## 8.'); return i<0?'':DOC0.slice(i); })();   /* 第 8 節原文（換句的新舊兩邊都要在這裡）*/
const part=(doc,a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const B7B=part(BB70,'## 7b.','## 7c.');
const inDoc=t=>DOC.indexOf(t)>=0;

(async()=>{
  check('0. 讀稿：AA_497（60fc3b9a3，有第 8 節）、BB_70 7b、BB_113',S8.length>500&&DOC.length>15000&&B7B.length>500&&BB113.indexOf('週五的歌')>=0);
  check('0. 新檔載得到：src/data/sup497_lines.js、src/sup497_3d.js（index.html 在 bbpack3d.js 後面、GAME.boot() 前面）',!!S()&&!!L()&&!loadErr.length,loadErr.join('｜'));
  { const h=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=h.indexOf('src/data/sup497_lines.js'), b=h.indexOf('src/sup497_3d.js');
    check('0. index.html：bbpack3d.js → data/sup497_lines.js → sup497_3d.js → GAME.boot()',a>h.indexOf('src/bbpack3d.js')&&b>a&&b<h.indexOf('GAME.boot()')); }

  /* ===== 0 稿：遊戲 → 稿（一字不差）===== */
  await sec('0a',()=>{ if(!L()) throw new Error('沒有 SUP497_LINES');
    const out=[]; const SKIPK=new Set(['src','ym','day','n']); const walk=(v,k)=>{ if(v==null||SKIPK.has(k)) return; if(typeof v==='string'){ if(!/^(yc|xc|an|yu|mx|zhe|dad|kv|yz|k|s|player)$/.test(v)&&!/^Y\dS\d$/.test(v)) out.push(v); return; } if(typeof v==='number'||typeof v==='boolean') return; if(Array.isArray(v)){ v.forEach(x=>walk(x,k)); return; } if(typeof v==='object') for(const kk in v) walk(v[kk],kk); };
    walk(L(),'');
    /* 推導出來的（稿寫的是描述或規則，遊戲照規則組成一句）：每一項寫明從稿的哪裡來 */
    const DERIVED={
      '（錄音 3:12）':'第 13 則「點開聽到」那一格的「（錄音 3:12。」（手機上照「（錄音 0:30）」的寫法）',
      '起床':'1-7「回「（傳：起床）」」（傳出去的字）',
      '十二點半了，我要回去了，明天早八。':'2-3「結尾「十二點四十了」改「十二點半了」」（原句的其他字照舊）',
      '（一段 30 秒的錄影，電梯「叮」一聲。）':'BB_70 7b「群組裡一段 30 秒的錄影，電梯「叮」一聲」',
      '你錯過了法律系最好聽的電梯':'BB_70 7b 阿哲那一句（第 0 節：阿哲手機不加句號）',
      '（他用霖澤館的聲音做了一首歌：電梯的「叮」、教室椅子收起來的聲音、周教授說「下一個」。）':'BB_70 7b「他的那一首」那一格（旁白）',
      '（聽出來的人會笑。）':'BB_70 7b「聽出來的人會笑」（旁白）',
      '（照片）':'2-6 第一列「拍給你。（照片）」（訊息分兩則）',
      '筆記第 7 頁的圖畫反了。我改好了，拍給你。':'2-6 第一列（同上）',
      '走出總圖。':'4-1「「走到校門口」改「走出總圖」」（原句的句號照舊）','宥辰：霖澤館的電梯':'順手的事的標題（介面的字）','總圖 B1 討論室':'介面的字' };
    const QUOTED=t=>inDoc('「'+t+'」')||(/^「[^「」]+」$/.test(t)&&inDoc(t.slice(1,-1)));   /* 手機的回覆選項：稿寫成「…」，遊戲的按鈕不加引號；閒聊（SMALLTALK 的寫法是「…」）稿寫成「> 芯慈：…」 */
    const bad=[...new Set(out)].filter(t=>!(inDoc(t)||B7B.indexOf(t)>=0||BB113.indexOf(t)>=0||QUOTED(t)||DERIVED[t]));
    check('0a. sup497_lines.js 每一句（台詞、旁白、選項、手機訊息）都在稿裡：AA_497 60fc3b9a3（學妹照第 8 節第 5 點叫佳穎）／BB_70 7b／BB_113（一字不差；推導的 '+Object.keys(DERIVED).length+' 句另外列）',out.length>350&&!bad.length,out.length+' 句；不在稿裡：'+J(bad));
    const dv=Object.keys(DERIVED).filter(t=>t.length>4&&!/總圖 B1|順手/.test(t)).filter(t=>!out.includes(t));
    check('0a. 推導的句子都真的用到（沒有多餘的例外）',!dv.length,J(dv));
    check('0a. 地下室那一場照 BB_70 7b：邀請、三個站位的那一句、散場的問題和三個回答一字不差',['週六晚上八點。公館。地下室。不用買票，有捐款箱。','……前排。好。不能出錯了。','站這裡最好，看得到所有人的臉。','一千二。夠付場地費。你顧得很好。','聽得出來是哪裡嗎？','對。法律系唯一有節奏的地方。','我錄了三天。要等到沒有人的時候，才錄得到那一聲。','萬才館太安靜。我要錄的是吵。','那首用霖澤館電梯做的歌，版權是我自己的。我查過了。'].every(t=>B7B.indexOf(t)>=0&&out.includes(t)));
    check('0a. 大四的兩則照 BB_113 原句（第 1-8 節「之後接 BB_113 原句」）',BB113.indexOf(L().yc.deal.y4a)>=0&&BB113.indexOf(L().yc.deal.y4b)>=0&&inDoc(L().yc.deal.y4a)&&inDoc(L().yc.deal.y4b));
    /* 改在其他檔的句子 */
    const SRC=['src/data/events.js','src/data/r2y3b_events.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/data/multirel_lines.js','src/story3d.js','src/data/sis_b12_events.js','src/y34b3d.js','src/data/y1fill_events.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8')).join('\n');
    const MOVED=['你說他對每個人都好。我後來偷偷看了一個禮拜。……對我比較多。','你說他對我比較好。我回去想了一整個晚上。','你叫我自己問他。我就問了。',
      '我上一次贏她，是大一在影印機前面猜拳。','我打電話跟我爸說了。他問：那沈以安第幾？','我打電話跟我爸說了。他說，你那個同學早就說了。','（她看著手機很久，最後沒有打給任何人。）',
      '你大二陪我吃過一次早餐。我那時候就在想，不能一直等別人來。','阿哲現在起得來了。……可是我還是想要一個晚上，只有我。','你大二說一個人吃也不錯。我那時候覺得你很怪。',
      '她說，那把傘，她一直知道是我的。','她說，那把傘，她後來才知道是我的。','（Alison 坐在旁邊剝橘子，剝好了也沒有吃。）','（宥辰坐在長桌最後面。那一天他難得醒著。）',
      '這週的歌比較慢。適合下雨。','你又來了。阿姨說你是常客。','明天早上的課，你幫我看一下有沒有點名。',
      '補習班的學生問我律師是不是很賺 我說等我考上再告訴你','今天在法圖趴著睡 醒來臉上印著考古題 民法第一百八十四條','考古題資料夾我整理了一個晚上 發現有一份是我大一自己寫錯的答案 已刪除','家聚吃什麼 不要再吃咖哩了',
      '學姊 八月國考 妳幫我集氣一次就好','好。日子跟我說。','天空有多大 拍給我們看啦','（照片：停車場上面的天空）','大家保重。'];
    const mb=MOVED.filter(t=>!(SRC.indexOf(t)>=0&&inDoc(t)));
    check('0a. 改在現有事件裡的句子（語 2、慈 6、語 4、M2、11/23、沛珊 n1、DJ、Kevin 的群組）都在遊戲裡、也都在稿裡（一字不差）',!mb.length,J(mb)); });

  /* ===== 0 稿 → 遊戲：稿的每一句（> 那幾行）都在遊戲裡 ===== */
  await sec('0b',()=>{ const ALL=[L()?JSON.stringify(L()):''].concat(['src/data/events.js','src/data/r2y3b_events.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/data/multirel_lines.js','src/story3d.js','src/data/sis_b12_events.js','src/y34b3d.js','src/data/y1fill_events.js','src/data/characters.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8'))).join('\n');
    const lines=[]; for(const raw of DOC.split('\n')){ const m=/^\s*>\s*(.+)$/.exec(raw); if(!m) continue; let t=m[1].trim(); if(/^（/.test(t)){ lines.push(t); continue; } const k=t.indexOf('：'); if(k>0&&k<10) lines.push(t.slice(k+1)); }
    const doc2=lines.filter(t=>!/^[-\s]*$/.test(t)&&!/^AA-C|^依據|^使用者|^寫「|^-/.test(t)&&t.length>1);
    /* 稿的 > 行有兩處是說明（不是台詞）：開頭的說明區塊 */
    const miss=doc2.filter(t=>ALL.indexOf(t)<0&&ALL.indexOf(t.replace(/\{name\}/g,'{name}'))<0);
    check('0b. 稿裡「>」的每一行（台詞、旁白、手機訊息）都在遊戲裡',doc2.length>150&&!miss.length,doc2.length+' 行；遊戲沒有：'+J(miss.slice(0,12)));
    /* 表格：週五的歌 13 列、閒聊三張表、C6 的三列、她約的表、動物影片 */
    const songRows=part(DOC,'| # | 大約什麼時候','- 第 1、2、4').split('\n').filter(l=>/^\| \d+ \|/.test(l));
    const sm=[]; for(const r of songRows){ const c=r.split('|').map(x=>x.trim()); const n=+c[1], row=(L().yc.songs||[]).find(q=>q.n===n); if(!row){ sm.push(n+':沒有'); continue; }
      if(!row.say.every(t=>c[3].indexOf(t)>=0)) sm.push(n+':傳的'); if(row.hear&&c[4].indexOf(row.hear)<0) sm.push(n+':聽到'); if(row.where&&c[5].indexOf(row.where)<0) sm.push(n+':這是哪裡'); }
    check('0b. 週五的歌：表的 13 列（傳的、點開聽到、「這是哪裡？」他回）都在 sup497_lines.js',songRows.length===13&&!sm.length,J(sm));
    const tbl=(a,b)=>part(DOC,a,b).split('\n').filter(l=>/^\| (大|之後)/.test(l)).map(l=>l.split('|')[2].replace(/（\*\*[^）]*）/g,'')).join(' ');   /* 「（**取代**現在的「…」，接上…）」是說明，不是台詞 */
    const q=s=>[...s.matchAll(/「([^」]+)」/g)].map(m=>'「'+m[1]+'」');
    const SM=JSON.stringify(SMALLTALK)+JSON.stringify(L());
    const st=[['1-10',tbl('### 1-10.','### 1-11.')],['2-9',tbl('### 2-9.','- 「以安不在')],['4-5',tbl('### 4-5.','### 4-6.')]].map(([n,s])=>[n,q(s).filter(t=>SM.indexOf(t)<0)]);
    check('0b. 閒聊三張表（1-10、2-9、4-5）的每一句都在 SMALLTALK',st.every(x=>!x[1].length),J(st));
    const c6=part(DOC,'### 3-6.','### 3-7.').split('\n').filter(l=>/^\| 「/.test(l)).map(l=>l.split('|')[2].trim().split('／'));
    check('0b. C6 的後果三列（一則一則分開）都在 sup497_lines.js',c6.length===3&&J(c6)===J([L().yu.c6.soft,L().yu.c6.rule,L().yu.c6.teacher]),J(c6));
    const vids=part(DOC,'**動物影片 6 則**','- 第 2 則').split('\n').filter(l=>/^\s+\d\. Kevin：/.test(l)).map(l=>l.replace(/^\s+\d\. Kevin：/,'').trim());
    check('0b. 動物影片後 4 則換成的 4 句',J(vids)===J(L().kv.vids),J(vids)); });

  /* ===================== 1 宥辰 ===================== */
  await sec('1-1',()=>{ check('1-1. characters.js 的 personality 補一句「在錄音室待過一年」',CHARACTERS[YC].personality==='考前才出現；晚上在公館當 DJ；對法條的記憶力出奇好；在錄音室待過一年',CHARACTERS[YC].personality); });

  await sec('1-3',async()=>{ const SPLIT='ev_an_report_split', NEW={MAIN_D1:-13,LAW_START_DAY:-18};   /* 新局＝story3d.js startLawWeek1 寫的兩個旗標 */
    /* 新局（8/29 搬進宿舍、主線第一天 9/3 週三）：第 1 週週四的民總是第二天的劇情課；第 2 週週四下課＝學姊問家聚（ev_sis_fam_hall2：收過邀請、沒在走廊問過的才有）→ 那樣的話第 3 週。
       舊存檔（9/17 開局，沒有 MAIN_D1）：第 3 週週四是劇情課；第 4 週週四＝周教授借書（loans3d.js L1，課堂中）＋以安的報告分工（下課）→ 第 5 週 */
    const fr=(w,h,o)=>{ o=o||{}; fresh(TD('Y1S1',w,4),h,'classroom',Object.assign({},o.old?{}:NEW,o.flags||{})); if(o.split) H.G.events.done[SPLIT]=1; if(o.met) SOCIAL.remember(YC,'FIRST_MET','');
      if(o.sisInv) H.G.msgs.push({th:'p:heroine_05',from:'heroine_05',text:'（家聚的邀請）',tag:'sis_fam_inv',day:H.G.day-2,h:21}); return CLS.dayItems(H.G).find(q=>q.c.id==='civ_general'); };
    const due=(w,o)=>{ const x=fr(w,13.5,o); return !!x&&S().ycMeetDue(H.G,x); };
    { const x=fr(1,13.5); check('1-3. 新局：第 1 週週四的民總是劇情課（CLS.storyClass）＝不演',!!x&&CLS.storyClass(H.G,x)&&!S().ycMeetDue(H.G,x)); }
    check('1-3. 新局：第 2 週週四的民總（13:20，第 2 週起第一堂他在的下午必修）要演',due(2));
    { const x=fr(2,13.5,{flags:{SIS_W1:true},sisInv:true}); check('1-3. 新局：第 2 週那一堂下課是學姊問家聚（收過邀請、沒在走廊問過）＝不演，第 3 週演',!!x&&S().classBusy(H.G,x)&&!S().ycMeetDue(H.G,x)&&due(3,{flags:{SIS_W1:true},sisInv:true})); }
    { const x=fr(2,13.5,{flags:{SIS_W1:true,SIS_FAM_HALL:true},sisInv:true}); check('1-3. 新局：學姊已經在走廊問過（SIS_FAM_HALL）＝第 2 週照演',!!x&&!S().classBusy(H.G,x)&&S().ycMeetDue(H.G,x)); }
    { const x=fr(3,13.5,{old:true}); check('1-3. 舊存檔：第 3 週週四（開局第二天）的民總是劇情課＝不演',!!x&&CLS.storyClass(H.G,x)&&!S().ycMeetDue(H.G,x)); }
    { const x=fr(4,13.5,{old:true}); check('1-3. 舊存檔：第 4 週週四＝周教授借書（L1）＋以安的報告分工已經在這一堂＝不演（S.classBusy；同一堂下課只演一件）',!!x&&S().classBusy(H.G,x)&&!S().ycMeetDue(H.G,x)); }
    check('1-3. 舊存檔：以安在第 4 週分工過了＝第 5 週演；第 4 週沒上到（分工移到第 5 週）＝第 5 週不演、第 6 週演',due(5,{old:true,split:true})&&!due(5,{old:true})&&due(6,{old:true}));
    check('1-3. 第 1 週、已經認識（週五先在公館遇到）、已經演過＝不演',!due(1)&&!due(2,{met:true})&&!due(2,{flags:{YC_MEET:1}}));
    { fresh(TD('Y1S1',4,1),9.5,'classroom',NEW); const x=CLS.dayItems(H.G).find(q=>q.c.id==='const_1'); check('1-3. 上午的課（憲法）不演',!!x&&!S().ycMeetDue(H.G,x)); }
    /* 以安的報告分工照舊在第 4 週下課（宥辰的沒有搶走那一堂）*/
    { const x=fr(4,13.4,{old:true}); const n={name:NM(AN),charId:AN,obj:{position:{x:0,y:0,z:0}},pose:'sit'}; GM.npc[AN]=n; E.npcs.push(n); at(x.day,x.t1); H.said=[]; H.picks=[1]; await CLS.afterClassEvent(GM,x); E.npcs.length=0; GM.npc={};
      check('1-3. 舊存檔第 4 週下課照舊是以安的報告分工（宥辰的沒有搶）',!!H.G.events.done[SPLIT]&&!H.G.events.done.ev_yc_meet_after); }
    /* 他晚十分鐘到：那一堂上課前、上課十分鐘內座位空著 */
    fr(2,13.4); const a=STORY.classmateClass(CHARACTERS[YC],H.G); at(TD('Y1S1',2,4),13.5+0.05); const b=STORY.classmateClass(CHARACTERS[YC],H.G);
    SOCIAL.remember(YC,'FIRST_MET',''); at(TD('Y1S1',2,4),13.4); const c=STORY.classmateClass(CHARACTERS[YC],H.G);
    check('1-3. 認識的那一堂他晚十分鐘到（上課前不在教室、上課十分鐘以後在）；認識以後照常（上課前就在）',!a&&!!b&&b.cls&&!!c,J([a,b&&b.from,c&&c.from]));
    /* 課堂那一句後面（CLS.IN_CLASS，所有到期的鉤子照順序）＋下課 */
    const run=async k=>{ const x=fr(2,13.4); at(x.day,13.5); H.said=[]; H.opts=[]; H.picks=[k]; const fs0=CLS.IN_CLASS.filter(q=>q.due&&q.due(H.G,x)); for(const f of fs0) await f(GM,x);
      const inClass=H.said.map(s=>s.t); H.said=[]; at(x.day,x.t1); await CLS.afterClassEvent(GM,x); return {inClass,after:H.said.map(s=>(s.who?s.who+'：':'')+s.t),f:fs0.length===1&&!!fs0[0].sup497,x}; };
    const M=L().yc.meet; let r=await run(0);
    check('1-3. 課堂中（IN_CLASS，有 due；那一堂只有這一段）：「（上課十分鐘，後門開了一條縫。……）」「（小聲）講到哪了？」三個選項',r.f&&r.inClass[0]===M.open[0][1]&&r.inClass[1]===M.open[1][1]&&J(H.opts[0])===J(M.opts),J(r.inClass));
    check('1-3. 選「意思表示。」：「（小聲）八十六條到九十八條那一段？……好。」＋旁白（第八十八條）；下課「賴宥辰。……」「剛剛那一下救了我。……手機給我。」；記 YC_OWE_SONG、交換聯絡方式、認識',
      r.inClass.includes(M.r[0][0][1])&&r.inClass.includes(M.r[0][1][1])&&J(r.after)===J(M.after12.map(([w,t])=>NM(YC)+'：'+t))&&H.G.flags.YC_OWE_SONG===true&&INV.hasContact(H.G,YC)&&SOCIAL.has(YC,'FIRST_MET'),J(r.after));
    r=await run(1);
    check('1-3. 選（把筆記推過去）：三句（「我背起來了」、你那一條沒抄完）＋同一段下課；有聯絡方式',r.inClass.includes(M.r[1][2][1])&&r.after.length===2&&INV.hasContact(H.G,YC)&&H.G.flags.YC_OWE_SONG===true);
    r=await run(2);
    check('1-3. 選「剛開始。」：他趴下去；下課「下課了？……你人很好，沒叫我。」「賴宥辰。……」；不交換聯絡方式、沒有 YC_OWE_SONG',r.inClass.includes(M.r[2][1][1])&&J(r.after)===J(M.after3.map(([w,t])=>NM(YC)+'：'+t))&&!INV.hasContact(H.G,YC)&&!H.G.flags.YC_OWE_SONG,J(r.after));
    check('1-3. 演過以後不再演（同一堂、下一週）',!S().ycMeetDue(H.G,r.x)&&(at(TD('Y1S1',3,4),13.5),!S().ycMeetDue(H.G,CLS.dayItems(H.G).find(q=>q.c.id==='civ_general'))));
    check('1-3. 學期中的快轉看得到這一堂有戲（semff3d.js classEventful）',typeof SEMFF==='undefined'||!SEMFF.classEventful||(()=>{ fresh(TD('Y1S1',2,4),9,'dorm',NEW); const x=CLS.dayItems(H.G).find(q=>q.c.id==='civ_general'); return !!SEMFF.classEventful(H.G,x); })()); });

  await sec('1-4',async()=>{ const SG=L().yc.songs, day=n=>S().songDay(SG.find(r=>r.n===n));
    const want={1:'2026-03-06',2:'2026-04-03',3:'2026-05-01',4:'2026-09-11',5:'2026-10-02',6:'2026-12-04',7:'2027-03-05',8:'2027-05-07',9:'2027-10-01',10:'2028-03-03',11:'2028-10-06',12:'2029-03-02',13:'2029-06-01'};
    const got={}; for(const n in want) got[n]=keyOf(day(+n));
    check('1-4. 13 則的日子：表上那個月的第一個週五（大二上 9/4 還沒開學＝開學後第一個週五 9/11）；第 13 則畢業典禮前一天 6/1',J(got)===J(want),J(got));
    check('1-4. 都不在考試週、寒暑假（第 13 則固定在典禮前一天）',[1,2,3,4,5,6,7,8,9,10,11,12].every(n=>{ const t=CALENDAR.termOf(day(n)); return t&&!t.exam&&CALENDAR.dateOf(day(n)).wd===5; }));
    /* 私訊：有聯絡方式 */
    fresh(day(1),12,'dorm'); contact(YC); ruleAt(day(1),22); ruleAt(day(1),23.5); const T1=thread('p:'+YC).filter(m=>m.tag==='yc_song_1');
    check('1-4. 第 1 則：週五 23:30 私訊「（錄音 0:30）」（點開＝那一句旁白）＋「週五的歌。這週：公館捷運站的廣播。」',T1.length===2&&T1[0].text==='（錄音 0:30）'&&J(T1[0].fold)===J([SG[0].hear])&&T1[0].play===true&&T1[1].text===SG[0].say[0]&&Math.abs(T1[0].h-23.5)<0.02,J(T1.map(m=>[m.text,m.h,m.fold])));
    check('1-4. 可以回三選一：「（聽完）好聽。」「這是哪裡？」「（貼一張耳機的貼圖）」',J(askOpts('yc_song_1'))===J(L().yc.songOpts));
    answer('yc_song_1',1); check('1-4. 「這是哪裡？」→ 那一則自己的一句（二號出口……）',texts('p:'+YC).slice(-2)[1]===SG[0].where&&texts('p:'+YC).slice(-2)[0]==='這是哪裡？',J(texts('p:'+YC).slice(-3)));
    /* 「好聽」輪流 */
    const good=[]; for(const n of [2,3,4]){ ruleAt(day(n)-1,22); ruleAt(day(n),23.6); answer('yc_song_'+n,0); good.push(texts('p:'+YC).slice(-1)[0]); }
    check('1-4. 回「（聽完）好聽。」輪流：「謝了。」「下個月見。」「你有聽完喔。」',J(good)===J(L().yc.goodRot),J(good));
    ruleAt(day(5)-1,22); ruleAt(day(5),23.6); const m5=byTag('yc_song_5');
    check('1-4. 第 5 則不是錄音、不用回（沒有點開、沒有選項）',m5.length===1&&!m5[0].fold&&!m5[0].ask&&m5[0].text===SG[4].say[0]);
    ruleAt(day(7)-1,22); ruleAt(day(7),23.6); answer('yc_song_7',2); check('1-4. 貼圖：「（貼圖：一隻戴耳機的貓）」',texts('p:'+YC).slice(-1)[0]==='（貼圖：一隻戴耳機的貓）');
    /* 曾靖雯那一句 */
    fresh(day(3)-1,22,'dorm'); contact(YC); SOCIAL.remember('pool_7','FIRST_MET',''); ruleAt(day(3),23.6); answer('yc_song_3',1);
    check('1-4. 第 3 則認識曾靖雯的：「這是哪裡？」→「曾靖雯。她每天早上都在那裡。」',texts('p:'+YC).slice(-1)[0]==='曾靖雯。她每天早上都在那裡。');
    /* 第 13 則 */
    fresh(day(13),12,'dorm'); contact(YC); ruleAt(day(13),23.6); const T13=byTag('yc_song_13');
    check('1-4. 第 13 則（6/1 23:30）：先說「畢業典禮我會到。……你可以不用聽完。」再「（錄音 3:12）」；兩個選項（「這是哪裡？」那一格是說明）；回「好聽」＝「謝了。這首不賣。」',
      T13.length===2&&T13[0].text===SG[12].say[0]&&T13[1].text==='（錄音 3:12）'&&J(T13[1].fold)===J([SG[12].hear])&&J(askOpts('yc_song_13'))===J([L().yc.songOpts[0],L().yc.songOpts[2]])&&(answer('yc_song_13',0),texts('p:'+YC).slice(-1)[0]==='謝了。這首不賣。'),J(T13.map(m=>m.text)));
    /* 沒有聯絡方式：第 1、4、7、12、13 則貼班級群組，其他不發 */
    const grp=[]; for(const n of [1,2,4,5,7,12,13]){ fresh(day(n),12,'dorm'); PHONE.join(H.G,'law_class','法律系（全班）'); ruleAt(day(n),23.6); grp.push([n,texts('g:law_class').filter(t=>SG.find(r=>r.n===n).say.includes(t)||t===(SG.find(r=>r.n===n).rec||L().yc.rec)).length>0,thread('p:'+YC).length]); }
    check('1-4. 沒有聯絡方式：第 1、4、7、12、13 則貼在班級群組（不能回），第 2、5 則不發',J(grp)===J([[1,true,0],[2,false,0],[4,true,0],[5,false,0],[7,true,0],[12,true,0],[13,true,0]]),J(grp));
    { fresh(day(1),12,'dorm'); PHONE.join(H.G,'law_class','法律系（全班）'); ruleAt(day(1),23.6); check('1-4. 班級群組那一則沒有回覆的按鈕',!thread('g:law_class').some(m=>m.ask&&/^yc_song/.test(m.ask.id))); }
    /* 第 6 則：地下室那場之後，沒去的也收得到 */
    fresh(day(6),12,'dorm'); contact(YC); ruleAt(day(6),23.6); check('1-4. 第 6 則（12/4）：沒去地下室也收得到；不是錄音',byTag('yc_song_6').length===1&&!byTag('yc_song_6')[0].fold);
    /* 交換中照時差：第 11 則美國路線 */
    fresh(day(11),8,'dorm',{EXCHANGE_ROUTE:'US'}); contact(YC); ruleAt(day(11),12); const m11=byTag('yc_song_11');
    check('1-4. 交換中照時差：美國路線的第 11 則＝臺灣 23:30 ＝ 當地 11:30',m11.length===2&&Math.abs(m11[0].h-11.5)<0.02&&m11[0].day===day(11),J(m11.map(m=>[keyOf(m.day),m.h])));
    /* 過了的不補（舊存檔）*/
    fresh(day(2)+3,12,'dorm'); contact(YC); rules(); check('1-4. 過了三天才有聯絡方式／讀舊存檔：那一則不補',!byTag('yc_song_2').length); });

  await sec('1-5',async()=>{ const e=ev('ev_yc_elev_ask'), dn=ev('ev_yc_elev_done');
    check('1-5. 兩場：開口（霖澤館一樓電梯前，auto）、做完（12:10～12:20 霖澤館一樓，auto）；順手的事登記在 SIDEQ（YQ_ELEV）',!!e&&!!dn&&e.location==='linze'&&dn.location==='linze'&&!!SIDEQ.Q.YQ_ELEV);
    const setup=(w,wd,h,o)=>{ o=o||{}; fresh(TD('Y2S1',w,wd),h,'linze'); if(!o.noFam) fam(YC); if(!o.noContact) contact(YC); if(!o.noSong) PHONE.postAt(H.G,{th:'p:'+YC,from:YC,text:'x',tag:'yc_song_5'},TD('Y2S1',4,5),23.5); E.player.obj.position.x=4.6; E.player.obj.position.z=-4.4; E.player.lv=0; return EVENTS.check(e); };
    const r={ok:setup(7,2,15.5),w5:setup(5,2,15.5),w10:setup(10,2,15.5),fri:setup(7,5,15.5),noon:setup(7,2,13),noFam:setup(7,2,15.5,{noFam:true}),noC:setup(7,2,15.5,{noContact:true}),noSong:setup(7,2,15.5,{noSong:true})};
    { setup(7,2,15.5); E.player.lv=1; r.lv1=EVENTS.check(e); setup(7,2,15.5); E.player.obj.position.x=-10; r.far=!!(EVENTS.check(e)&&Math.hypot(-10-4.6,-4.4+4.3)<=3); }
    check('1-5. 開口：大二上第 6～9 週、週一～四下午課下課（15:10 以後）、有點熟以上、有聯絡方式、收過第 5 則、一樓電梯前',r.ok&&!r.w5&&!r.w10&&!r.fri&&!r.noon&&!r.noFam&&!r.noC&&!r.noSong&&!r.lv1&&!r.far,J(r));
    setup(7,2,15.5); await play('ev_yc_elev_ask',[0]); const q=SIDEQ.get(H.G,'YQ_ELEV'), fri=TD('Y2S1',7,5);
    check('1-5. 「（電梯門開了。……）」三句＋兩個選項；「我幫你擋。」＝掛順手的事，期限那一週的週五',H.said[0].t===L().yc.elev.open[0][1]&&J(H.opts[0])===J(L().yc.elev.opts)&&!!q&&q.state==='open'&&q.by===fri,J(q));
    check('1-5. 手機「今天」那一格的字',/12:10～12:20/.test(SIDEQ.hint('YQ_ELEV',q))&&SIDEQ.openIds(H.G).includes('YQ_ELEV'));
    at(TD('Y2S1',7,3),12+12/60); H.G.zone='linze'; E.player.lv=0; check('1-5. 那一週任何一天 12:10～12:20 到霖澤館一樓（12:25、週六、隔週都不算）',EVENTS.check(dn)&&(at(TD('Y2S1',7,3),12.42),!EVENTS.check(dn))&&(at(TD('Y2S1',7,6),12.2),!EVENTS.check(dn))&&(at(TD('Y2S1',8,2),12.2),!EVENTS.check(dn)));
    at(TD('Y2S1',7,3),12+12/60); await play('ev_yc_elev_done');
    check('1-5. 做完：四句（「電梯在維修」、叮、錄到了、「我會剪掉。……大概。」）；記 YC_ELEVATOR、順手的事做完',J(H.said.map(s=>s.t))===J(L().yc.elev.done.map(x=>x[1]))&&H.G.flags.YC_ELEVATOR===true&&SIDEQ.get(H.G,'YQ_ELEV').state==='done');
    setup(7,2,15.5); await play('ev_yc_elev_ask',[1]); check('1-5. 「我等一下有課。」：「好。那我再錄三天。」；不掛',has('好。那我再錄三天。')&&SIDEQ.get(H.G,'YQ_ELEV').state==='declined');
    setup(7,2,15.5); await play('ev_yc_elev_ask',[0]); ruleAt(fri,22.9); ruleAt(fri,23.1);
    check('1-5. 答應了、過期沒去：那個週五 23:00 他傳「錄到了。有一個學姊瞪了我很久。」（順手的事記過期）',texts('p:'+YC).includes('錄到了。有一個學姊瞪了我很久。')&&SIDEQ.get(H.G,'YQ_ELEV').state==='lapsed',J(texts('p:'+YC)));
    setup(7,2,15.5); await play('ev_yc_elev_ask',[0]); at(TD('Y2S1',7,3),12.2); await play('ev_yc_elev_done'); ruleAt(fri,23.5); check('1-5. 做完的沒有那一則',!texts('p:'+YC).includes('錄到了。有一個學姊瞪了我很久。')); });

  await sec('1-6',async()=>{ const g=D('2026-11-14'), d=D('2026-11-09'); const G0=L().yc.gig;
    check('1-6. 日子：2026-11-14 是期中考後的週六；邀請 11/9（一）',CALENDAR.dateOf(g).wd===6&&CALENDAR.dateOf(d).wd===1&&!CALENDAR.termOf(g).exam&&CALENDAR.termOf(g-7).exam);
    fresh(d,12,'dorm'); PHONE.join(H.G,'law_class','法律系（全班）'); PHONE.join(H.G,'noodle_team','麵店團'); ruleAt(d,21.1);
    const q=OUT.get(H.G,'yc_gig');
    check('1-6. 11/9 21:00 班級群組宥辰貼「週六晚上八點。……」、麵店團阿哲再貼一次；排進行程 11/14 20:00（時間到才問出發）',texts('g:law_class').includes(G0.invite)&&thread('g:noodle_team').some(m=>m.from===ZHE&&m.text===G0.invite)&&!!q&&q.day===g&&q.h===20&&q.ev==='ev_yc_gig',J(q));
    { fresh(d,12,'dorm'); ruleAt(d,21.1); check('1-6. 兩個群組都不在：沒有邀請、不排',!OUT.get(H.G,'yc_gig')&&!byTag('yc_gig_ask').length); }
    const gig=async(pk,flags,mem)=>{ fresh(g,20,'gongguan',flags); if(mem) for(const m of mem) SOCIAL.remember(m,'FIRST_MET',''); await play('ev_yc_gig',pk); return H.said.map(s=>(s.who?s.who+'：':'')+s.t); };
    let r=await gig([0,0]);
    check('1-6. 前排：「……前排。好。不能出錯了。」；他那一首（旁白兩句＋阿哲「十二點十分！」）；散場「聽得出來是哪裡嗎？」「霖澤館。」→「對。法律系唯一有節奏的地方。」；記 YC_GIG、有聯絡方式、認識',
      r.includes(NM(YC)+'：'+G0.front[1])&&r.includes(NM(ZHE)+'：十二點十分！')&&r.includes(NM(YC)+'：'+G0.rep[0][1])&&J(H.opts[0])===J(G0.pos)&&J(H.opts[1])===J(G0.ans)&&H.G.flags.YC_GIG===true&&INV.hasContact(H.G,YC)&&SOCIAL.has(YC,'FIRST_MET'),J(r));
    check('1-6. 沒有 YC_ELEVATOR、不認識詹立群：沒有那兩句',!has(G0.elev[1])&&!has(G0.lq[1]));
    r=await gig([1,1],{YC_ELEVATOR:true},['pool_16']);
    check('1-6. 後面靠牆：阿哲「站這裡最好，看得到所有人的臉。」；有 YC_ELEVATOR：他上台前「電梯那一段，有你擋的那五分鐘。」；認識詹立群：開場的旁白；第 ② 個回答',
      r.includes(NM(ZHE)+'：'+G0.back[1])&&r.includes(NM(YC)+'：'+G0.elev[1])&&r[0]===G0.lq[1]&&r.includes(NM(YC)+'：'+G0.rep[1][1])&&!r.includes(NM(YC)+'：'+G0.front[1]),J(r));
    r=await gig([2,2]); check('1-6. 顧捐款箱：散場他數錢「一千二。夠付場地費。你顧得很好。」在問題前面；第 ③ 個回答',r.indexOf(NM(YC)+'：'+G0.count[1])>=0&&r.indexOf(NM(YC)+'：'+G0.count[1])<r.indexOf(NM(YC)+'：'+G0.ask[1])&&r.includes(NM(YC)+'：'+G0.rep[2][1]),J(r));
    /* 沒去 */
    fresh(g,20,'dorm'); PHONE.join(H.G,'noodle_team','麵店團'); ev('ev_yc_gig').outingMissed(H.G,GM,{day:g}); ruleAt(g,22.6);
    check('1-6. 沒去：當天 22:30 麵店團一段 30 秒的錄影＋阿哲「你錯過了法律系最好聽的電梯」（手機不加句號）；不記 YC_GIG',J(texts('g:noodle_team'))===J([G0.video,G0.missed])&&!H.G.flags.YC_GIG,J(texts('g:noodle_team')));
    fresh(g,20,'dorm'); PHONE.join(H.G,'law_class','法律系（全班）'); ev('ev_yc_gig').outingMissed(H.G,GM,{day:g}); ruleAt(g,22.6); check('1-6. 不在麵店團：貼在班級群組',J(texts('g:law_class'))===J([G0.video,G0.missed]));
    /* 五年後 */
    const epi=f=>{ const G=fresh('2034-06-03',19,'cafe',f); fam(YC); return PG.epiLine(G,YC); };
    check('1-6. 五年後（尾聲，有點熟以上在桌上）：「法條我還是背得很熟。……」；YC_GIG 多一句「那首用霖澤館電梯做的歌，……」',J(epi({}))===J([[YC,G0.epi]])&&J(epi({YC_GIG:true}))===J([[YC,G0.epi],[YC,G0.epiGig]])&&PG.EPI_ORDER.includes(YC),J([epi({}),epi({YC_GIG:true})]));
    { const G=fresh('2034-06-03',19,'cafe'); check('1-6. 不熟（有點熟以下）不在桌上',!PG.epiPresent(G,YC)); } });

  await sec('1-7',async()=>{ const A=L().yc.fail, d=TD('Y2S1',1,3);
    fresh(d,12,'dorm'); fam(YC); contact(YC); ruleAt(d,21.1);
    check('1-7. 大二上第 1 週週三 21:00（有點熟以上、有聯絡方式）：「我被當了一科。債總。」「重修的時候坐我旁邊的人，要負責叫我起床。」三選一',J(byTag('yc_fail').map(m=>m.text))===J(A.msg)&&J(askOpts('yc_fail'))===J(A.opts));
    { fresh(d,12,'dorm'); contact(YC); ruleAt(d,21.1); check('1-7. 不熟（有聯絡方式但不到有點熟）：不發',!byTag('yc_fail').length); }
    fresh(d,12,'dorm'); fam(YC); contact(YC); ruleAt(d,21.1); answer('yc_fail',0); rules();
    check('1-7. 「我叫你。」→「你又沒有重修。……好啦，你傳訊息叫我也算。」，記 YC_WAKE',texts('p:'+YC).slice(-1)[0]===A.rep[0][0]&&H.G.flags.YC_WAKE===true);
    const W=S().wakeDays(); check('1-7. 大二下三個週四（第 1～3 週）',W.length===3&&W.every(x=>CALENDAR.dateOf(x).wd===4&&CALENDAR.termOf(x).id==='Y2S2'),J(W.map(keyOf)));
    const rep=[]; for(let k=0;k<3;k++){ ruleAt(W[k]-1,22); ruleAt(W[k],7+40/60); const m=byTag('yc_wake_'+(k+1))[0]; if(!m){ rep.push('沒有'); continue; } if(k===0) check('1-7. 07:40 手機（通知）跳一則「要叫宥辰起床嗎？」，回「（傳：起床）」',m.th==='sys'&&m.text===A.wakeAsk&&J(askOpts('yc_wake_1'))===J([A.wakeOpt])&&Math.abs(m.h-(7+40/60))<0.02);
      answer('yc_wake_'+(k+1),0); const T=texts('p:'+YC); rep.push(T.slice(-2)); }
    check('1-7. 回了＝傳「起床」，他依序回「起了。」「……起了。」「我在路上了。你下禮拜不用傳了。」',J(rep)===J(A.wakeRep.map(t=>[A.wakePost,t])),J(rep));
    fresh(d,12,'dorm'); fam(YC); contact(YC); ruleAt(d,21.1); answer('yc_fail',1); rules(); check('1-7. 「債總哪裡卡住？」→「全部。……」，記 YC_WHEN；沒有叫起床',texts('p:'+YC).slice(-1)[0]===A.rep[1][0]&&H.G.flags.YC_WHEN===true&&!H.G.flags.YC_WAKE);
    const p=TD('Y3S1',1,3); ruleAt(p-1,22); ruleAt(p,21.1);
    check('1-7. 大三上第 1 週：「被當的那一科過了。老師說我的答案「很有節奏」。」；有 YC_WHEN 多一則「我後來把每一條都當成一首歌。……」',J(byTag('yc_passed').map(m=>m.text))===J(A.passed.concat([A.passedWhen])));
    fresh(d,12,'dorm'); fam(YC); contact(YC); ruleAt(d,21.1); answer('yc_fail',2); ruleAt(p,21.1); check('1-7. 「重修加油。」→「嗯。」；大三上那一則只有一句',texts('p:'+YC).includes('嗯。')&&byTag('yc_passed').length===1); });

  await sec('1-8',async()=>{ const e=ev('ev_yc_deal'), A=L().yc.deal;
    check('1-8. 合約：公館（他去上班前）、週五 20:30～21:00、大三上第 6～10 週、一次、有點熟以上',!!e&&e.location==='gongguan'&&J(e.weekday)===J([5])&&J(e.time)===J([20.5,21])&&J(e.weeks)===J([6,7,8,9,10])&&J(e.term)===J(['Y3S1'])&&e.once);
    const ok=(w,h,lv)=>{ fresh(TD('Y3S1',w,5),h,'gongguan'); if(lv) H.rel(YC,lv,0,0); return EVENTS.check(e); };
    check('1-8. 條件：有點熟以上才有（不熟、第 5 週、21:10 都沒有）',ok(7,20.6,25)&&!ok(7,20.6,8)&&!ok(5,20.6,25)&&!ok(7,21.2,25));
    const res={}; for(const [k,f] of [[0,'KEY'],[1,'NO'],[2,'LAWYER']]){ fresh(TD('Y3S1',7,5),20.6,'gongguan'); fam(YC); contact(YC); await play('ev_yc_deal',[k]); res[f]=[H.G.flags.YC_CONTRACT,!!H.G.flags['YC_CONTRACT_'+f],H.said.map(s=>s.t)];
      const d=TD('Y3S2',4,3); ruleAt(d-1,22); ruleAt(d,21.1); res[f].push(byTag('yc_deal_after').map(m=>m.text)); if(f==='NO'){ res[f].push(askOpts('yc_deal_no')); answer('yc_deal_no',0); res[f].push(texts('p:'+YC).slice(-1)[0]); } }
    check('1-8. 開頭四句（第十二條）照稿；三個選項',J(res.KEY[2].slice(0,4))===J(A.open.map(x=>x[1]))&&J(H.opts[0])===J(A.opts));
    check('1-8. 「要看是讓與，還是授權。」＝YC_CONTRACT_KEY；大三下第 4 週「樂團的合約改了。……燒肉。」',res.KEY[0]==='KEY'&&res.KEY[1]&&J(res.KEY[3])===J(A.after.KEY),J(res.KEY[3]));
    check('1-8. 「不能簽。」＝YC_CONTRACT_NO；大三下「樂團最後沒簽。……」，可以回「你讓他們看懂了。」→「……嗯。」',res.NO[0]==='NO'&&res.NO[1]&&J(res.NO[3])===J(A.after.NO)&&J(res.NO[4])===J(A.noOpts.map(x=>x[0]))&&res.NO[5]==='……嗯。',J(res.NO.slice(3)));
    check('1-8. 「找律師看。」＝YC_CONTRACT_LAWYER；大三下「樂團找了律師。……」',res.LAWYER[0]==='LAWYER'&&J(res.LAWYER[3])===J(A.after.LAWYER));
    fresh(TD('Y4S1',3,3),12,'dorm'); fam(YC); contact(YC); ruleAt(TD('Y4S1',3,3),21.1); ruleAt(TD('Y4S2',6,3)-1,22); ruleAt(TD('Y4S2',6,3),21.1);
    check('1-8. 之後接 BB_113 原句：大四上第 3 週、大四下第 6 週各一則（有點熟以上、有聯絡方式）',J(byTag('yc_y4a').map(m=>m.text))===J([A.y4a])&&J(byTag('yc_y4b').map(m=>m.text))===J([A.y4b])); });

  await sec('1-9',async()=>{ check('1-9. 沛珊 n1（大一下期中後的晚餐）開頭補一句旁白',MREL&&MULTIREL_LINES?J(MULTIREL_LINES.YC.n1[0])===J({n:L().yc.psN1}):(()=>{ const s=fs.readFileSync(path.join(H.ROOT,'src/data/multirel_lines.js'),'utf8'); return s.indexOf("n1:[ N('"+L().yc.psN1+"'),")>=0; })());
    const e=ev('ev_mx_yc_nod');
    check('1-9. 明軒路口：大一下起、週二四 20:45～21:30、公館、宥辰也在（npcZone）、點明軒（interact）、一次',!!e&&e.trigger==='interact'&&e.participants[0]===MX&&e.npcZone===YC&&J(e.weekday)===J([2,4])&&e.once&&!e.term.includes('Y1S1'));
    fresh(TD('Y1S2',3,2),21,'gongguan'); SOCIAL.remember(YC,'FIRST_MET',''); SOCIAL.remember(MX,'FIRST_MET',''); await play('ev_mx_yc_nod');
    check('1-9. 「（明軒剛下家教，宥辰剛要去上班。……）」＋明軒「他每次要出門，我剛好要回家。」',J(H.said.map(s=>(s.who?s.who+'：':'')+s.t))===J([L().yc.mxNod[0][1],NM(MX)+'：'+L().yc.mxNod[1][1]])); });

  await sec('1-10',async()=>{ const run=(term,w,h,mem)=>{ const out=[]; const d0=TD(term,w,2); fresh(d0,h||14,'gongguan'); fam(YC); if(mem) for(const m of mem) SOCIAL.remember(m,'FIRST_MET','');
      for(let i=0;i<10;i++){ at(d0+i,h||14); const r=STORY.smallTalk(H.G,YC); out.push(r.say||r.narr); } return out; };
    const T=L().yc.talk;
    let o=run('Y1S2',3); check('1-10. 大一下：「期中考前一週我會出現。這是我和學分的約定。」說一次（還有兩句原句）；說完＝「（他把一邊的耳機拿下來，算是打招呼。）」',o.filter(t=>t===T[2].t).length===1&&o.slice(-1)[0]===L().yc.after&&!o.some(t=>/聊兩句天氣/.test(t)),J(o));
    o=run('Y3S1',3,14,['pool_16']); check('1-10. 大三上認識詹立群：「立群背刑訴是用唱的。……」；沒認識：照 BB_113「刑訴的筆記有人用唱的背。……」',o.includes(T[5].t)&&!o.includes(T[6].t)&&(o=run('Y3S1',3),o.includes(T[6].t)&&!o.includes(T[5].t)));
    o=run('Y3S2',3); check('1-10. 大三下沒認識詹立群：沒有那一句',!o.includes(T[7].t));
    o=run('Y1S1',4,9); check('1-10. 原句：「……現在幾點？我昨天四點才睡。」（8～13 點）、「公館那間週五我放歌，來嗎？」（DJ 那段之前）各一次',o.filter(t=>t===T[0].t).length===1&&o.filter(t=>t===T[1].t).length===1,J(o));
    check('1-10. 舊的「公館那間 bar 週五我放歌，來嗎？」不在了（稿上那一句沒有 bar）',!JSON.stringify(SMALLTALK[YC]).includes('那間 bar')); });

  await sec('1-11',async()=>{ const e=ev('ev_youchen_dj'); const run=async n=>{ fresh(TD('Y1S1',5,5),22,'gongguan'); SOCIAL.remember(YC,'FIRST_MET',''); H.G.events.done.ev_youchen_dj=n; await play('ev_youchen_dj',[1]); return H.said.map(s=>s.t); };
    const last=[]; for(const n of [0,1,2,3,4]){ const s=await run(n); last.push(s[s.length-1]); }
    check('1-11. DJ 最後一句：第一次「考前我就會消失，別找我。」；第二次以後輪流「這週的歌比較慢。適合下雨。」「你又來了。阿姨說你是常客。」「明天早上的課，……」',J(last)===J(['考前我就會消失，別找我。'].concat(L().yc.djRot,[L().yc.djRot[0]])),J(last));
    fresh(TD('Y1S1',5,5),22,'gongguan'); await play('ev_youchen_dj',[0]); check('1-11. 第一次（還沒認識）照全文；「去。」＝交換聯絡方式（收得到週五的歌）',has('你……民總同班的？賴宥辰。你大概沒看過我，我通常在睡覺。')&&INV.hasContact(H.G,YC)); });

  /* ===================== 2 芯慈 ===================== */
  const NEWG={MAIN_D1:-13,LAW_START_DAY:-18};
  const spawnAt=(id,x,z,lv)=>{ const n={name:NM(id),charId:id,obj:{position:{x,y:0,z}},pose:'idle',lv:lv|0}; GM.npc[id]=n; E.npcs.push(n); return n; };
  const pos=(x,z,lv)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=lv|0; };
  /* 自動觸發（EVENTS.tick 的判斷）：條件＋近不近 */
  const ready=id=>{ const e=ev(id); if(!e||!EVENTS.check(e)) return false; if(e.near){ const P=E.player.obj.position; if(e.near.npc){ const n=EVENTS.npcOf(e.near.npc); if(!n||Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)>(e.near.r||4)) return false; } else if(Math.hypot(e.near.x-P.x,e.near.z-P.z)>(e.near.r||5)) return false; } return true; };
  const sched=id=>STORY.schedEnt(CHARACTERS[id],H.G);
  const meetIv=async(iv,pk)=>{ H.said=[]; H.opts=[]; H.picks=(pk||[]).slice(); return INV.meetEv(GM,iv,null); };
  const metAN=()=>SOCIAL.remember(AN,'FIRST_MET',''), metXC=()=>SOCIAL.remember(XC,'FIRST_MET','');
  const lt=a=>a.map(([w,t])=>t);   /* [誰, 字] 的字 */

  await sec('2-1',async()=>{ const X=L().xc.day1, e=S().DAY1;
    const first=(k,flags)=>{ fresh(D(k),8.9,'classroom',Object.assign({},NEWG,flags||{})); return CLS.dayItems(H.G).filter(q=>q.c.kind==='required'&&!q.exam)[0]||null; };
    let it=first('2025-09-01');
    check('2-1. 新局 9/1（一）第 1 週第一堂必修（憲法）上課前：演（課前事件，CLS.beforeClassEvent 真的挑到它）',!!it&&it.c.id==='const_1'&&e.beforeClass(it)&&(await (async()=>{ H.said=[]; await CLS.beforeClassEvent(GM,it); return !!H.G.events.done.ev_xc_day1; })()));
    const pre=[L().xc.day1Pre].concat(lt(X).slice(1));
    check('2-1. 還沒認識以安（新局 9/1）：旁白「（第一排。一個坐得很直的女生轉過頭，……）」（第 8 節第 2 點）、其餘照稿；沒有選項',J(H.said.map(x=>x.t))===J(pre)&&!H.said[0].t.includes('以安')&&!H.opts.length,J(H.said.map(x=>x.t)));
    check('2-1. 還沒認識以安：她那一句說話的人顯示「坐第一排的女生」；說了「妳好，我是沈以安。」以後最後一句旁白才用「以安」',H.said[1].who==='坐第一排的女生'&&H.said[1].t==='妳好，我是沈以安。'&&H.said[4].t.indexOf('以安')>=0&&L().xc.day1Who==='坐第一排的女生',J(H.said.map(x=>[x.who,x.t])));
    check('2-1. 只是看到：不算認識以安、芯慈（noMeet）',!SOCIAL.has(AN,'FIRST_MET')&&!SOCIAL.has(XC,'FIRST_MET'));
    it=first('2025-09-01',null); H.G.events.done.ev_xc_day1=1; check('2-1. 一次（演過不再演）',!EVENTS.check(e,{chain:true}));
    { fresh(D('2025-09-08'),8.9,'classroom',NEWG); const x=CLS.dayItems(H.G).find(q=>q.c.kind==='required'); check('2-1. 第 2 週不演',!!x&&!e.beforeClass(x)); }
    { fresh(D('2025-09-02'),13,'classroom',NEWG); const x=CLS.dayItems(H.G).find(q=>q.c.id==='ge_film_y1s1'); check('2-1. 通識（不是必修）不演',!!x&&!e.beforeClass(x)); }
    { fresh(D('2025-09-17'),8,'classroom'); check('2-1. 舊存檔（9/17 開局）：第 1 週在開局以前，不演',!CLS.dayItems(H.G).some(q=>q.week===1)); }
    /* 宿營已經認識芯慈：「那個女生」改「芯慈」 */
    fresh(D('2025-09-01'),8.9,'classroom',NEWG); metXC(); await play('ev_xc_day1');
    check('2-1. 宿營已經認識芯慈：「那個女生」改「芯慈」（兩句旁白）',J(H.said.map(x=>x.t))===J(pre.map(t=>t.split('那個女生').join('芯慈')))&&lt(X).filter(t=>t.indexOf('那個女生')>=0).length===2,J(H.said.map(x=>x.t)));
    fresh(D('2025-09-01'),8.9,'classroom',NEWG); metAN(); await play('ev_xc_day1');
    check('2-1. 宿營已經認識以安：照原稿（「（第一排。以安轉過頭，……）」、說話的人是以安）',J(H.said.map(x=>x.t))===J(lt(X))&&H.said[1].who===NM(AN)&&H.said[1].who!=='坐第一排的女生',J(H.said.map(x=>[x.who,x.t]))); });

  await sec('2-2',async()=>{ const C=L().xc.copy, d=TD('Y1S2',7,3);
    const setup=(day,h,o)=>{ o=o||{}; fresh(day,h,'library_hall'); if(o.an!==false) metAN(); if(o.xc!==false) metXC(); pos(8.0,2.6,0); return H.G; };
    setup(d,12.5); const a=sched(AN), x=sched(XC);
    check('2-2. 大一下第 7～9 週週一、三、四、五中午：以安、芯慈的作息在總圖一樓的影印機前（看得到兩個人站在那裡）',!!a&&a.zone==='library_hall'&&!!x&&x.zone==='library_hall'&&Math.hypot(a.at[0]-8,a.at[1]-2.6)<1&&Math.hypot(x.at[0]-8,x.at[1]-2.6)<1,J([a,x].map(q=>q&&[q.zone,q.at])));
    check('2-2. 走到影印機前（12:10～13:00、兩個人都認識）＝演',ready('ev_xc_copy'));
    const no=[];
    setup(TD('Y1S2',7,2),12.5); if(ready('ev_xc_copy')||(sched(AN)||{}).zone==='library_hall') no.push('週二（以安在 118 巷）');
    setup(d,13.1); if(ready('ev_xc_copy')) no.push('13:00 以後');
    setup(d,12.5); pos(0,6.6,0); if(ready('ev_xc_copy')) no.push('沒走近');
    setup(TD('Y1S2',6,3),12.5); if(ready('ev_xc_copy')||(sched(AN)||{}).zone==='library_hall') no.push('第 6 週');
    setup(TD('Y1S2',10,3),12.5); if(ready('ev_xc_copy')) no.push('第 10 週');
    setup(d,12.5,{xc:false}); if(ready('ev_xc_copy')) no.push('不認識芯慈');
    setup(d,12.5); H.G.events.done.ev_xc_copy=1; if(ready('ev_xc_copy')||(sched(AN)||{}).zone==='library_hall') no.push('演過還在');
    setup(d,12.5); E.player.lv=1; if(ready('ev_xc_copy')) no.push('二樓');
    check('2-2. 不演：週二、13:00 以後、沒走近、第 6／10 週、不認識芯慈、二樓；演過以後兩個人不再站在影印機前',!no.length,J(no));
    const run=async k=>{ setup(d,12.5); await play('ev_xc_copy',[k]); return H.said.map(q=>q.t); };
    let r=await run(0); check('2-2. 開場六行一字不差；三個選項',J(r.slice(0,6))===J(lt(C.open))&&J(H.opts[0])===J(C.opts),J(H.opts[0]));
    check('2-2. 「我幫妳們一起印。」→ 旁白＋芯慈「……你很會處理這種事。」，記 XC_COPY',J(r.slice(6))===J(lt(C.r[0]))&&H.G.flags.XC_COPY===true&&!H.G.flags.XC_RPS);
    r=await run(1); check('2-2. （排到她們後面）→ 一句旁白；沒有旗標',J(r.slice(6))===J(lt(C.r[1]))&&!H.G.flags.XC_COPY&&!H.G.flags.XC_RPS);
    r=await run(2); check('2-2. 「猜拳？」→ 以安「（看了芯慈一眼）……好。」、芯慈出布、「……我贏了。」，記 XC_RPS',J(r.slice(6))===J(lt(C.r[2]))&&H.G.flags.XC_RPS===true); });

  await sec('2-3',async()=>{ const B=ev('ev_xinci_second_b1'), O=ev('ev_xinci_second'), X=L().xc;
    check('2-3. B1 的版本：總圖 B1、同一段時間的 00:00～00:15（大二上第 12～15 週、週一～四）、芯慈在旁邊',!!B&&B.location==='library_b1'&&J(B.time)===J([0,0.25])&&J(B.weeks)===J([12,13,14,15])&&J(B.weekday)===J([1,2,3,4])&&J(B.term)===J(['Y2S1'])&&B.near&&B.near.npc===XC);
    const bt=B.dialogue.filter(l=>l.text).map(l=>l.text), ot=O.dialogue.filter(l=>l.text).map(l=>l.text);
    check('2-3. B1 版：前兩句旁白換成「（B1 的自習室。……）」「（她背包背上了，看到你，停了一下。）」；後面照原文',bt[0]===X.secondB1[0]&&bt[1]===X.secondB1[1]&&J(bt.slice(2).filter(t=>t.indexOf('十二點')!==0))===J(ot.slice(2).filter(t=>t.indexOf('十二點')!==0)),J(bt.slice(0,3)));
    check('2-3. B1 版的結尾「十二點四十了」改「十二點半了，我要回去了，明天早八。」；便利商店那一版照舊',bt.includes(X.secondB1End)&&!bt.some(t=>t.indexOf('十二點四十了')===0)&&ot.some(t=>t.indexOf('十二點四十了')===0)&&ot[0]==='（芯慈在買咖啡，手機在放韓劇，沒有關聲音。）');
    { const d=TD('Y2S1',12,1); fresh(d,24.08,'library_b1'); const x=sched(XC); check('2-3. 芯慈的作息：週一～四深夜 00:00～00:15 在 B1 自習室、00:15 起在便利商店',!!x&&x.zone==='library_b1'&&(at(d,24.4),(sched(XC)||{}).zone==='cvs'),J(x&&[x.zone,x.seatAt]));
      fresh(d,24.08,'library_b1'); metXC(); spawnAt(XC,-3.2,-7.77,0); pos(-3.2,-6.5,0); check('2-3. B1 走到她旁邊＝演 B1 版',ready('ev_xinci_second_b1')&&!ready('ev_xinci_second'));
      H.G.events.done.ev_xinci_second_b1=1; at(d,24.4); H.G.zone='cvs'; check('2-3. 兩個版本只演一個（B1 演過＝便利商店不演；反過來也一樣）',!EVENTS.check(O)&&(H.G.events.done.ev_xinci_second_b1=0,H.G.events.done.ev_xinci_second=1,H.G.zone='library_b1',at(d,24.08),!EVENTS.check(B))); }
    /* 提示：第 11 週週一 00:20（週一深夜）*/
    { const d=TD('Y2S1',11,1); fresh(d,22,'dorm'); fam(XC); contact(XC); ruleAt(d,23); ruleAt(d,24+20/60); const m=byTag('xc_second_hint');
      check('2-3. 提示：大二上第 11 週週一深夜 00:20 私訊兩則（「你還醒著嗎。不用回。」「我在溫州街的便利商店。……」）',J(m.map(q=>q.text))===J(X.hint)&&m[0].day===d+1&&Math.abs(m[0].h-(20/60))<0.02,J(m.map(q=>[q.day-d,q.h,q.text])));
      fresh(d,22,'dorm'); contact(XC); ruleAt(d,24.4); check('2-3. 提示要有點熟以上＋聯絡方式',!byTag('xc_second_hint').length); }
    /* 慈 3 當晚 01:05 */
    { const d=TD('Y2S1',13,2); fresh(d,24.6,'cvs'); fam(XC); contact(XC); H.G.events.done.ev_xinci_second=1; H.G.events.last.ev_xinci_second=d; ruleAt(d,24.7); ruleAt(d,25.1);
      check('2-6. 慈 3 當晚 01:05：「剛剛講的那些，你明天就忘了吧。……劇的部分可以記得。」（不用回）',J(byTag('xc_second_night').map(q=>q.text))===J(X.ask.night)&&!byTag('xc_second_night')[0].ask); }
    /* 補救：大二下第 2 週週一 21:00 */
    const fixSet=(o)=>{ o=o||{}; const mon=TD('Y2S2',2,1); fresh(mon,20,'dorm'); if(o.fam!==false) fam(XC); contact(XC); if(o.done) H.G.events.done.ev_xinci_second=1; ruleAt(mon,20.5); ruleAt(mon,21.05); return mon; };
    let mon=fixSet(); let m=byTag('xc_fix')[0];
    check('2-3. 補救：慈 3 沒演到、大二下第 2 週週一 21:00 她約「明天下午四點，你有空嗎。兩點半 Café。……」（「好。」「明天不行。」）',!!m&&m.text===X.fix.ask&&J(askOpts('xc_fix'))===J(X.fix.opts));
    { fixSet({done:true}); const a=!byTag('xc_fix').length; fixSet({fam:false}); check('2-3. 慈 3 演過了、或不到有點熟＝不約',a&&!byTag('xc_fix').length); }
    mon=fixSet(); answer('xc_fix',1); check('2-3. 「明天不行。」→「好。那就不說了。」；沒有約、之後不記 XINCI_SECOND',texts('p:'+XC).slice(-1)[0]===X.fix.no&&!(H.G.invites||[]).some(iv=>iv.who===XC)&&H.G.flags.XC_FIX==='no');
    mon=fixSet(); answer('xc_fix',0); const iv=(H.G.invites||[]).find(q=>q.who===XC);
    check('2-3. 「好。」→ 約好週二 16:00 兩點半 Café（INV，答應了），見面演白天版',!!iv&&iv.state==='accepted'&&iv.place==='cafe'&&iv.day===mon+1&&iv.h===16&&iv.ev==='ev_xinci_second_day',J(iv));
    at(mon+1,16); H.G.zone='cafe'; await meetIv(iv,[1]); const dt=H.said.map(q=>q.t);
    check('2-3. 白天版：前兩句換成「（芯慈坐在靠窗的位子，……）」、拿掉「（把手機轉靜音）……」、結尾「四點半了。我要去上經濟。」；記 XINCI_SECOND',dt[0]===X.fix.open&&!dt.some(t=>/^（把手機轉靜音）/.test(t))&&dt.includes(X.fix.end)&&!dt.some(t=>t.indexOf('十二點')===0)&&SOCIAL.has(XC,'XINCI_SECOND')&&!!H.G.events.done.ev_xinci_second_day,J(dt.slice(0,3).concat(dt.slice(-3))));
    check('2-3. 白天版其他照原文（中間每一句都在便利商店版裡）',dt.slice(1).filter(t=>t!==X.fix.end).every(t=>ot.includes(t))); });

  await sec('2-4',async()=>{ const A=L().xc.dad, d=D('2027-04-23');
    check('2-4. 日子：2027-04-23 是週五、大二下第 9 週',CALENDAR.dateOf(d).wd===5&&CALENDAR.termOf(d).id==='Y2S2'&&CALENDAR.termOf(d).week===9);
    const setup=(day,h,o)=>{ o=o||{}; fresh(day,h,'campus'); if(o.fam!==false) fam(XC); pos(34,-109,0); return H.G; };
    setup(d,17.75); const x=sched(XC); check('2-4. 那一天 17:30～18:00 芯慈的作息在霖澤館門口',!!x&&x.zone==='campus'&&Math.hypot(x.at[0]-34,x.at[1]+109)<2,J(x&&[x.zone,x.at]));
    check('2-4. 17:30～18:00 霖澤館門口、有點熟以上＝演',ready('ev_xc_dad'));
    const no=[]; setup(d,18.1); if(ready('ev_xc_dad')) no.push('18:00 以後'); setup(d-7,17.75); if(ready('ev_xc_dad')) no.push('別的週五'); setup(d,17.75,{fam:false}); if(ready('ev_xc_dad')) no.push('不熟');
    check('2-4. 不演：18:00 以後、別的日子、不到有點熟',!no.length,J(no));
    const run=async k=>{ setup(d,17.75); contact(XC); await play('ev_xc_dad',[k]); const r=H.said.map(q=>(q.who?q.who+'：':'')+q.t); ruleAt(d,21.5); ruleAt(d,22.05); return r; };
    let r=await run(0);
    check('2-4. 開場：銀色的車、「芯慈的爸爸：這是同學？」「芯慈：……嗯。祐廷。」「法律系的同學。你們系上誰最強？」；三個選項',J(r.slice(0,4))===J(A.open.map(([w,t])=>(w==='dad'?'芯慈的爸爸：':w==='xc'?NM(XC)+'：':'')+t.replace('{name}','祐廷')))&&J(H.opts[0])===J(A.opts),J(r.slice(0,4)));
    const night=v=>J(byTag('xc_dad_night').map(q=>q.text))===J([A.night[v]]);
    check('2-4. 「以安。」→「那妳要跟人家學。」，記 XC_DAD_AN；當晚 22:00「你答得很誠實。……」',J(r.slice(4).map(t=>t.replace(/^.*?：/,'')))===J(lt(A.r[0]))&&H.G.flags.XC_DAD_AN===true&&night('AN'),J(r.slice(4)));
    r=await run(1); check('2-4. 「芯慈。」→「她？……好，好。」，記 XC_DAD_XC；當晚「你不用幫我講話。……」',r.some(t=>t.endsWith(A.r[1][1][1]))&&H.G.flags.XC_DAD_XC===true&&!H.G.flags.XC_DAD_AN&&night('XC'));
    r=await run(2); check('2-4. 「不知道。我們不比這個。」→「不比，怎麼知道自己在哪裡。」，記 XC_DAD_NO；當晚「「我們不比這個」。……」',r.some(t=>t.endsWith(A.r[2][0][1]))&&H.G.flags.XC_DAD_NO===true&&night('NO'));
    setup(d,17.75); await play('ev_xc_dad',[0]); ruleAt(d,22.05); check('2-4. 沒有聯絡方式：當晚不傳',!byTag('xc_dad_night').length); });

  await sec('2-5',async()=>{ const F=L().xc.first, d=D('2028-05-04');
    const run=async flags=>{ fresh(d,19.2,'noodle',flags); fam(XC); await play('ev_xinci_first_place',[0]); return H.said.map(q=>q.t); };
    let r=await run({}); const i=r.indexOf('一點都不好玩。');
    check('2-5. 沒有記號：「一點都不好玩。」後面直接接原文（雙主修改輔系）',i>0&&r[i+1]==='我把雙主修改成輔系了。經濟我還是喜歡。只是不用拿第一了。');
    r=await run({XC_RPS:true,XC_DAD_AN:true}); const j=r.indexOf('一點都不好玩。');
    check('2-5. XC_RPS＋XC_DAD_AN：照順序疊兩句（猜拳、「那沈以安第幾？」）',J(r.slice(j+1,j+3))===J([F.RPS[1],F.DAD_AN[1]])&&r[j+3]==='我把雙主修改成輔系了。經濟我還是喜歡。只是不用拿第一了。',J(r.slice(j,j+4)));
    r=await run({XC_DAD_XC:true}); check('2-5. XC_DAD_XC：「我打電話跟我爸說了。他說，你那個同學早就說了。」',r[r.indexOf('一點都不好玩。')+1]===F.DAD_XC[1]);
    r=await run({XC_DAD_NO:true}); check('2-5. XC_DAD_NO：旁白「（她看著手機很久，最後沒有打給任何人。）」',r[r.indexOf('一點都不好玩。')+1]===F.DAD_NO[1]&&H.said[r.indexOf('一點都不好玩。')+1].who===null);
    { fresh(d,22,'dorm'); fam(XC); contact(XC); ruleAt(d,22); ruleAt(d+1,11); ruleAt(d+1,12); const m=byTag('xc_first_miss');
      check('2-5. 沒演到慈 6：隔天 12:00「排名出來了。我第一。」「……一點都不好玩。」三個回覆',J(m.map(q=>q.text))===J(F.miss)&&Math.abs(m[0].h-12)<0.02&&J(askOpts('xc_first_miss'))===J(F.missOpts.map(o=>o[0])),J(m.map(q=>[q.h,q.text])));
      const reps=[]; for(let k=0;k<3;k++){ fresh(d,22,'dorm'); fam(XC); contact(XC); ruleAt(d,22); ruleAt(d+1,12.05); answer('xc_first_miss',k); reps.push(texts('p:'+XC).slice(-1)[0]); }
      check('2-5. 「恭喜。」「為什麼不好玩？」「以安知道嗎？」各自的回覆',J(reps)===J(F.missOpts.map(o=>o[1])),J(reps));
      fresh(d,22,'dorm'); fam(XC); contact(XC); H.G.events.done.ev_xinci_first_place=1; ruleAt(d+1,12.05); const a=!byTag('xc_first_miss').length;
      fresh(d,22,'dorm'); contact(XC); ruleAt(d+1,12.05); check('2-5. 演過慈 6、或不到有點熟：沒有那兩則',a&&!byTag('xc_first_miss').length); } });

  await sec('2-6',async()=>{ const A=L().xc.ask;
    { const d=TD('Y1S1',8,2); fresh(d,15,'library'); contact(XC); SOCIAL.remember(XC,'LENT_NOTES',''); H.G.events.done.ev_xinci_notes=1; H.G.events.last.ev_xinci_notes=d; ruleAt(d+1,20); ruleAt(d+1,21.05);
      check('2-6. 大一上慈 1 隔天 21:00（借過筆記）：「筆記第 7 頁的圖畫反了。我改好了，拍給你。」「（照片）」，不用回',J(byTag('xc_notes_fix').map(m=>m.text))===J(A.notes)&&byTag('xc_notes_fix').every(m=>!m.ask)); }
    const offerAt=(t,w,wd,o)=>{ o=o||{}; const d=TD(t,w,wd); fresh(d,20,'dorm',o.flags); if(o.fam!==false) fam(XC); if(o.contact!==false) contact(XC); if(o.pre) o.pre(); at(d,21.05); rules(); return {d,iv:(H.G.invites||[]).find(q=>q.who===XC)}; };
    let r=offerAt('Y3S1',4,3);
    check('2-6. 大三上第 4 週週三 21:00：「明天晚上要不要一起讀？我有兩章還沒看。」＝INV 約總圖、週四 19:00',!!r.iv&&r.iv.state==='offered'&&r.iv.place==='library'&&r.iv.day===r.d+1&&r.iv.h===19&&(H.G.msgs||[]).some(m=>m.text===A.read&&m.iv===r.iv.id),J(r.iv));
    { const a=offerAt('Y3S1',4,3,{fam:false}), b=offerAt('Y3S1',4,3,{contact:false}); check('2-6. 不到有點熟、沒有聯絡方式：不約',!a.iv&&!b.iv); }
    r=offerAt('Y3S1',15,7); const ex=CLS.lastExamEnd(H.G,'Y3S1','final');
    check('2-6. 大三上第 15 週週日 21:00：「期末考完那天晚上有空嗎？……」＝INV 約麵店、考完那天 18:30',!!r.iv&&r.iv.place==='noodle'&&!!ex&&r.iv.day===ex.day&&r.iv.h===18.5&&(H.G.msgs||[]).some(m=>m.text===A.dinner),J([r.iv,ex]));
    r=offerAt('Y3S1',15,7,{pre:()=>{ H.G.termend={Y3S1:{plan:{heart:[XC]}}}; }}); check('2-6. 現有的期末飯邀約已經是她：這則不發',!r.iv&&!(H.G.msgs||[]).some(m=>m.text===A.dinner));
    r=offerAt('Y4S1',3,2);
    check('2-6. 大四上第 3 週週二 21:00：「這學期的讀書會我來排。禮拜三晚上，總圖 B1。你要來嗎？」＝INV 約 B1 討論室、週三 19:00（見面演 2-7）',!!r.iv&&r.iv.place==='lib_b1'&&r.iv.day===r.d+1&&r.iv.h===19&&r.iv.ev==='ev_xc_y4_group'&&(H.G.msgs||[]).some(m=>m.text===A.group));
    check('2-6. 「總圖 B1 討論室」是 INV 的地點（不在玩家自己約的清單）',!!INV.place('lib_b1')&&INV.place('lib_b1').zone==='library_b1'&&INVITE_DATA.places.find(p=>p.id==='lib_b1').show()===false);
    { const d=D('2028-04-19'); fresh(d,20,'dorm',{EXCHANGE_ROUTE:'JP'}); fam(XC); contact(XC); const ab=STORY.abroad(H.G); ruleAt(d,21); ruleAt(d,23.1); const m=byTag('xc_jp')[0];
      check('2-6. 大三下（日本路線、祐廷在日本）：「你那邊的筆記本長什麼樣子？……」；「（拍一頁給她）」→「……你在國外也畫得這麼歪。」',ab&&!!m&&m.text===A.jp&&J(askOpts('xc_jp'))===J([A.jpOpt])&&(answer('xc_jp',0),texts('p:'+XC).slice(-1)[0]===A.jpRep),J(m));
      fresh(d,20,'dorm',{EXCHANGE_ROUTE:'TW'}); fam(XC); contact(XC); ruleAt(d,23.1); check('2-6. 臺灣路線沒有日本那一則',!byTag('xc_jp').length); } });

  await sec('2-7',async()=>{ const G7=L().xc.group;
    const run=async flags=>{ const d=TD('Y4S1',3,2); fresh(d,20,'dorm',flags); fam(XC); contact(XC); at(d,21.05); rules(); const iv=(H.G.invites||[]).find(q=>q.who===XC); INV.answer(H.G,iv.id,'yes'); at(d+1,19); H.G.zone='library_b1'; await meetIv(iv); return H.said.map(q=>q.t); };
    let r=await run({}); check('2-7. 讀書會（B1 討論室）：白板上的表、「表是我做的。……習慣。」；記 XC_Y4_GROUP；沒有 XC5_RECONCILE＝沒有以安那一句',J(r)===J(lt(G7))&&H.G.flags.XC_Y4_GROUP===true,J(r));
    r=await run({XC5_RECONCILE:true}); check('2-7. 有 XC5_RECONCILE、以安在臺灣：多一句「（以安在表上看到自己的名字排在芯慈旁邊，……）」',J(r)===J(lt(G7).concat([L().xc.groupAn[1]])),J(r)); });

  await sec('2-8',async()=>{ const P=L().xc.pick, d=D('2029-05-27');
    const run=(k,flags)=>{ fresh(d,20,'dorm',flags); fam(XC); contact(XC); ruleAt(d,20.5); ruleAt(d,21.05); const o=askOpts('xc_notes4'); if(k!=null) answer('xc_notes4',k); return o; };
    let o=run(null);
    check('2-8. 大四下畢業前一週（5/27 週日）21:00：「我把四年的筆記裝了三箱。……你要不要挑一本？」；沒有 XC5_RECONCILE＝兩個選項（沒有刑訴那本）',!!byTag('xc_notes4')[0]&&byTag('xc_notes4')[0].text===L().xc.ask.notes4&&J(o)===J([P.opts[0],P.opts[2]].map(t=>t.slice(1,-1))),J(o));
    o=run(null,{XC5_RECONCILE:true}); check('2-8. 有 XC5_RECONCILE：三個選項',J(o)===J(P.opts.map(t=>t.slice(1,-1))),J(o));
    run(0); check('2-8. 「民總那本。」→「那本第 7 頁的圖畫反了。……我後來改了。」；房間多「芯慈的民總筆記」',texts('p:'+XC).slice(-1)[0]===P.r[0]&&H.G.flags.XC_NOTE_PICK==='civ'&&STORY.roomItemList(H.G).some(x=>J(x)===J(P.room[0])));
    run(1,{XC5_RECONCILE:true}); check('2-8. 「刑訴那本。」→「那本是我跟以安一起對過答案的。……好，給你。」；房間多「芯慈的刑訴筆記」',texts('p:'+XC).slice(-1)[0]===P.r[1]&&H.G.flags.XC_NOTE_PICK==='crimpro'&&STORY.roomItemList(H.G).some(x=>J(x)===J(P.room[1])));
    run(1); check('2-8. 「都不用，留著吧。」→「好。那我留著。」；房間沒有筆記',texts('p:'+XC).slice(-1)[0]===P.r[2]&&H.G.flags.XC_NOTE_PICK==='keep'&&!STORY.roomItemList(H.G).some(x=>/芯慈的/.test(x[0]))); });

  await sec('2-9',async()=>{ const X=L().xc;
    const run=(term,w,flags,n)=>{ const out=[]; const d0=TD(term,w,2); fresh(d0,14,'library',flags); fam(XC); for(let i=0;i<(n||14);i++){ at(d0+i,14); const r=STORY.smallTalk(H.G,XC); out.push(r.say||r.narr); } return out; };
    let o=run('Y2S2',3); check('2-9. 大二下：「永和到這裡要換一次車。……」一次；句子用完＝「（芯慈點了一下頭，筆沒有停。）」（不是「聊兩句天氣」）',o.filter(t=>t===X.talk[0].t).length===1&&o.slice(-1)[0]===X.after&&!o.some(t=>/天氣/.test(t||'')),J(o));
    o=run('Y3S1',3); check('2-9. 大三上：「這學期雙主修的課沒有撞堂。……」',o.filter(t=>t===X.talk[1].t).length===1);
    o=run('Y3S2',6); const o2=run('Y3S2',6,{XC5_RECONCILE:true});
    check('2-9. 大三下：「以安的手帳跟我用的是同一款。……」只有 XC5_RECONCILE',!o.includes(X.talk[2].t)&&o2.includes(X.talk[2].t));
    check('2-9. 大三下以安去日本以後：「以安不在，她的位子一直空著。我想把書放上去，又沒放。」（取代「以安不在，第一排的位子我坐了。」）',o.includes(X.emptySeat)&&!JSON.stringify(SMALLTALK[XC]).includes('第一排的位子我坐了'));
    o=run('Y4S1',3); check('2-9. 大四上：「國考跟研究所，我兩個都報了。本來想先實習再說的。」（取代短的那一句）；追劇那一句拿掉',o.includes(X.talk[3].t)&&!SMALLTALK[XC].some(q=>q.t==='「國考跟研究所，我兩個都報了。」')&&!JSON.stringify(SMALLTALK[XC]).includes('我最近在追一部日劇'));
    o=run('Y4S2',3,{XC5_RECONCILE:true}); check('2-9. 大四下有 XC5_RECONCILE：「最後一堂課，我坐第一排。以安坐我旁邊。」',o.includes(X.talk[4].t)&&!run('Y4S2',3).includes(X.talk[4].t)); });

  /* ===================== 3 Alison ===================== */
  await sec('3-1',async()=>{ const e=ev('ev_yu_meet_w3'), I=STORY.YU_INTRO;
    const setup=(w,wd,dh,o)=>{ o=o||{}; const d=TD('Y1S1',w,wd); fresh(d,8,'campus',Object.assign({},NEWG,o.flags||{})); const it=CLS.dayItems(H.G).find(q=>q.c.kind==='required'&&q.room&&q.room.zone==='classroom'); if(!it) return null;
      if(o.done!==false) CLS.rec(H.G).done[it.key]=1; if(o.abs) CLS.rec(H.G).abs[it.key]=1; at(d,it.t1+dh); H.G.zone='campus'; return it; };
    let it=setup(3,1,0.1); check('3-1. 第 3 週、還沒認識她：第一次上完霖澤館 201 的必修、走出來（進校園）自動演',!!it&&EVENTS.check(e),J(it&&[it.c.id,it.t1]));
    const no=[]; it=setup(3,1,-0.5); if(EVENTS.check(e)) no.push('還沒下課'); it=setup(3,1,1); if(EVENTS.check(e)) no.push('下課一小時以後');
    it=setup(3,1,0.1,{done:false}); if(EVENTS.check(e)) no.push('沒上那一堂'); it=setup(3,1,0.1,{flags:{met_yu:true}}); if(EVENTS.check(e)) no.push('已經認識');
    it=setup(4,1,0.1); if(EVENTS.check(e)) no.push('第 4 週'); it=setup(2,1,0.1); if(EVENTS.check(e)) no.push('第 2 週');
    check('3-1. 不演：還沒下課、下課一小時以後、沒上那一堂、已經認識、第 2／4 週',!no.length,J(no));
    setup(3,1,0.1); await play('ev_yu_meet_w3');
    check('3-1. 「（下課，有人從後面拍了你的肩膀。）」＋talkYu 的自我介紹原文（「你是周老師點的那個！我是 Alison……」）；記認識（met_yu）',J(H.said.map(x=>x.t))===J([L().yu.tap].concat(I.lines))&&H.said[1].who==='Alison'&&H.G.flags.met_yu===true&&H.G.flags.metYuDay===H.G.day&&STORY.knows(YU,H.G),J(H.said.map(x=>x.t)));
    setup(3,1,0.1,{flags:{CAMP_SEEN:['yu']}}); await play('ev_yu_meet_w3'); check('3-1. 宿營見過：自我介紹前多一句旁白（同 talkYu）',!!H.said[1]&&H.said[1].t===I.camp&&H.said[2].t===I.lines[0]); });

  await sec('3-2',async()=>{ const P=L().yu.pick, KEY='（看了一眼正在跟阿姨點菜的阿哲）他說「沒事啦，就在一起啊」。哪有人這樣告白的。', CALL='……跟你說一件事。我跟阿哲在一起了。';
    const run=async(id,pick)=>{ fresh(D('2026-12-19'),19,'noodle',pick?{YU2_PICK:pick}:{}); await play(id,[0]); return H.said.map(x=>x.t); };
    const rows=[]; for(const [k,t] of [['everyone',P.everyone],['you',P.you],['ask',P.ask]]){ const a=await run('ev_yu_together',k), b=await run('ev_yu_together_call',k); rows.push([a[a.indexOf(KEY)-1]===t,b[b.indexOf(CALL)+1]===t]); }
    check('3-2. 語 2 的選擇（YU2_PICK）：當面版在「他說『沒事啦，就在一起啊』」前面、電話版在「我跟阿哲在一起了。」後面，各多一句',rows.every(r=>r[0]&&r[1]),J(rows));
    const a=await run('ev_yu_together'), b=await run('ev_yu_together_call');
    check('3-2. 沒有 YU2_PICK（舊存檔）：照舊',a[a.indexOf(KEY)-1]==='我跟阿哲在一起了。'&&b[b.indexOf(CALL)+1]==='你不要笑。我聽得到。'); });

  await sec('3-3',async()=>{ const B=L().yu.bkf, d=TD('Y2S2',4,4);
    const setup=(day,h,o)=>{ o=o||{}; fresh(day,h,'campus'); if(o.zy!==false) H.G.events.done.ev_yu_together=1; if(o.fam!==false) fam(YU); spawnAt(YU,-30,20.94,0); pos(-30,19.6,0); return H.G; };
    setup(d,8.6); const y=sched(YU); check('3-3. 大二下第 4～6 週週四、五 08:20～09:05：Alison 的作息在傅鐘旁的長椅（吃早餐）；和阿哲在一起以後',!!y&&y.zone==='campus'&&y.act==='eat'&&J(y.seatAt)===J([-30,21]),J(y&&[y.zone,y.act,y.seatAt]));
    { setup(d,8.6,{zy:false}); const a=sched(YU); setup(TD('Y2S2',4,1),8.6); const b=sched(YU); check('3-3. 還沒在一起：不在長椅；週一早上她有課',!(a&&a.zone==='campus'&&a.act==='eat')&&!(b&&b.zone==='campus'&&b.act==='eat'),J([a&&a.zone,b&&b.zone])); }
    setup(d,8.6); check('3-3. 走到長椅旁（有點熟以上、在一起以後）＝演',ready('ev_yu_bkf'));
    const no=[]; setup(d,9.2); if(ready('ev_yu_bkf')) no.push('09:05 以後'); setup(d,8.6,{zy:false}); if(ready('ev_yu_bkf')) no.push('還沒在一起'); setup(d,8.6,{fam:false}); if(ready('ev_yu_bkf')) no.push('不熟'); setup(TD('Y2S2',7,4),8.6); if(ready('ev_yu_bkf')) no.push('第 7 週');
    check('3-3. 不演：09:05 以後、還沒在一起、不熟、第 7 週',!no.length,J(no));
    const run=async k=>{ setup(d,8.6); await play('ev_yu_bkf',[k]); return H.said.map(x=>x.t); };
    let r=await run(0); check('3-3. 開場三行；「那我陪妳吃。」→「欸，你好好喔。」…「可是你不能每天都來。」，記 YU_BKF_STAY',J(r)===J(lt(B.open).concat(lt(B.r[0])))&&J(H.opts[0])===J(B.opts)&&H.G.flags.YU_BKF_STAY===true&&H.G.flags.YU_BKF==='STAY');
    r=await run(1); check('3-3. 「妳可以叫他起來。」→「叫了。他說「五分鐘」。……」，記 YU_BKF_WAKE',J(r.slice(3))===J(lt(B.r[1]))&&H.G.flags.YU_BKF_WAKE===true);
    r=await run(2); check('3-3. 「一個人吃也不錯吧。」→「（看了你一眼）……你很怪。」＋旁白，記 YU_BKF_ALONE',J(r.slice(3))===J(lt(B.r[2]))&&H.G.flags.YU_BKF_ALONE===true);
    /* 語 4 的第一句前面 */
    const y4=[]; for(const v of ['STAY','WAKE','ALONE']){ fresh(D('2028-03-08'),8.6,'campus',{YU_BKF:v}); await play('ev_yu_alone_breakfast',[0]); const a=H.said.map(x=>x.t); fresh(D('2028-03-08'),21,'dorm',{YU_BKF:v}); await play('ev_yu_alone_call',[0]); const b=H.said.map(x=>x.t); y4.push([a[1]===B.yu4[v],b[0]===B.yu4[v]&&b[1]==='欸，我在練習。今天早上一個人吃早餐。']); }
    fresh(D('2028-03-08'),8.6,'campus'); await play('ev_yu_alone_breakfast',[0]); const a0=H.said.map(x=>x.t);
    check('3-3. 語 4（當面、電話）她第一句前面照 YU_BKF 多一句；沒有＝照舊',y4.every(x=>x[0]&&x[1])&&!Object.values(B.yu4).some(t=>a0.includes(t)),J(y4)); });

  await sec('3-4',async()=>{ const Q=L().yu.quit, d=TD('Y2S2',3,3);
    const run=(k,o)=>{ o=o||{}; fresh(d,20,'dorm'); if(o.fam!==false) fam(YU); contact(YU); ruleAt(d,20.5); ruleAt(d,21); if(k!=null) answer('yu_quit',k); };
    run(); const m=byTag('yu_quit');
    check('3-4. 大二下第 3 週週三 21:00 私訊三則「我退辯論社了！！」「禮拜三晚上突然空下來」「好長喔」；三個回覆',J(m.map(x=>x.text))===J(Q.msg)&&Math.abs(m[0].h-21)<0.02&&J(askOpts('yu_quit'))===J(Q.opts.map(o=>o[0])));
    const reps=[]; for(let k=0;k<3;k++){ run(k); reps.push(texts('p:'+YU).slice(-1)[0]); }
    check('3-4. 「要不要去麵店？」→「好！！我叫阿哲」（不排約）／「好好休息。」→「我不會休息啦 我會去找事做」／「（貼圖）」→「（貼圖：熊拍熊）」',J(reps)===J(Q.opts.map(o=>o[1]))&&!(H.G.invites||[]).length,J(reps));
    run(null,{fam:false}); check('3-4. 不到有點熟：不發',!byTag('yu_quit').length);
    check('3-4. 舊的「這學期我只剩兩個社團了。你猜我退了哪一個？」（needed_msgs yu_clubs）不再發',NEEDED_MSGS.list.find(x=>x.id==='yu_clubs').cond(H.G)===false); });

  await sec('3-5',async()=>{ const C=L().yu.c4, d=D('2027-11-19');
    const run=(k,o)=>{ o=o||{}; fresh(d,22,'dorm'); if(o.fam!==false) fam(YU); contact(YU); if(o.c4!==false) H.G.msgs.push({th:'g:noodle_team',from:ZHE,text:'（阿哲的機車）',tag:'y3_c4',day:d,h:22}); ruleAt(d,23); ruleAt(d,23+40/60); if(k!=null) answer('yu_c4',k); };
    run(); const m=byTag('yu_c4');
    check('3-5. 2027-11-19 C4（阿哲的機車那則）之後，當晚 23:40 私訊四則；三個回覆',J(m.map(x=>x.text))===J(C.msg)&&Math.abs(m[0].h-(23+40/60))<0.02&&J(askOpts('yu_c4'))===J(C.opts.map(o=>o[0])));
    const reps=[], fl=[]; for(let k=0;k<3;k++){ run(k); reps.push(texts('p:'+YU).slice(-C.opts[k][1].length)); fl.push(H.G.flags.YU_C4); }
    check('3-5. 「我明天去看他。」→「好！！……他會假裝很煩」／「妳還好嗎？」→三則／「他說沒事就讓他沒事吧。」→「……好 那我再看看」；記 YU_C4',J(reps)===J(C.opts.map(o=>o[1]))&&J(fl)===J(['visit','her','leave']),J([reps,fl]));
    { run(null,{c4:false}); const a=!byTag('yu_c4').length; run(null,{fam:false}); check('3-5. 沒有 C4 那則、或不到有點熟：不發',a&&!byTag('yu_c4').length); }
    const sc=async v=>{ fresh(D('2027-11-23'),19,'noodle',v?{YU_C4:v}:{}); await play('ev_zhe_scooter',[0]); return H.said[0]&&H.said[0].t; };
    check('3-5. 回「我明天去看他。」：11/23 ev_zhe_scooter 開頭多一句旁白「（Alison 坐在旁邊剝橘子，剝好了也沒有吃。）」；其他兩個回答沒有',(await sc('visit'))===C.scooter&&(await sc('her'))!==C.scooter&&(await sc(null))!==C.scooter); });

  await sec('3-6',async()=>{ const C=L().yu.c6, d0=D('2028-03-16');
    const run=(v,o)=>{ o=o||{}; fresh(d0,13,'linze',{YU_C6:v,YU_C6_DAY:d0}); fam(YU); contact(YU); if(o.bear) H.G.msgs.push({th:'p:'+YU,from:YU,text:'（熊）',tag:'y3_yu_c6_bear',day:d0+7,h:21}); ruleAt(d0+7,20); ruleAt(d0+7,21.5); const bear=(H.G.msgs||[]).filter(m=>m.tag==='y3_yu_c6_bear'&&m.text!=='（熊）').length; ruleAt(d0+14,20); ruleAt(d0+14,21); return {rows:byTag('yu_c6_after').map(m=>m.text),bear}; };
    const a=run('pay'), b=run('open'), c=run('rule');
    check('3-6. C6 之後第 14 天 21:00，一則一則：「要學弟賠」（我先不要這樣）、「把帳攤開」（不像在抓人）＝第 1 列；「社團的規則」＝第 2 列',J(a.rows)===J(C.soft)&&J(b.rows)===J(C.soft)&&J(c.rows)===J(C.rule),J([a.rows,c.rows]));
    check('3-6. 第 7 天那一則熊（y3_yu_c6_bear）拿掉了',a.bear===0&&c.bear===0);
    check('3-6. 舊存檔已經收過熊：不再收第 14 天那幾則（不留兩份）',!run('pay',{bear:true}).rows.length); });

  await sec('3-7',async()=>{ const B=L().yu.lib, d=TD('Y4S1',5,1);
    const setup=(day,h,o)=>{ o=o||{}; fresh(day,h,'lawlib',o.flags); if(o.fam!==false) fam(YU); spawnAt(YU,-4.8,-5.2,0); pos(-4.8,-4.0,0); return H.G; };
    setup(d,15); const y=sched(YU); check('3-7. 大四上第 5～8 週平日 14:00～17:00：Alison 的作息在法圖二樓最角落',!!y&&y.zone==='lawlib'&&J(y.seatAt)===J([-4.8,-5.2]));
    setup(d,15); check('3-7. 走到她旁邊（有點熟以上、人在臺灣）＝演',ready('ev_yu_lawlib'));
    const no=[]; setup(d,17.2); if(ready('ev_yu_lawlib')) no.push('17:00 以後'); setup(d,15,{fam:false}); if(ready('ev_yu_lawlib')) no.push('不熟'); setup(TD('Y4S1',9,1),15); if(ready('ev_yu_lawlib')) no.push('第 9 週');
    setup(D('2028-10-02'),15,{fam:true,flags:{EXCHANGE_ROUTE:'US'}}); if(ready('ev_yu_lawlib')) no.push('在美國');
    check('3-7. 不演：17:00 以後、不熟、第 9 週、人在美國',!no.length,J(no));
    const run=async k=>{ setup(d,15); await play('ev_yu_lawlib',[k]); return H.said.map(x=>x.t); };
    let r=await run(0); check('3-7. 開場三行；「練習得怎麼樣？」→「今天三個小時，沒有傳訊息給任何人。……我的紀錄。」',J(r)===J(lt(B.open).concat(lt(B.r[0])))&&J(H.opts[0])===J(B.opts)&&!H.G.flags.YU_Y4_LIB);
    r=await run(1); check('3-7. 「要不要一起？」→「不要。（她笑了一下）我在練習。」',J(r.slice(3))===J(lt(B.r[1]))&&!H.G.flags.YU_Y4_LIB);
    r=await run(2); check('3-7. （在她對面坐下，不說話）→ 旁白，記 YU_Y4_LIB',J(r.slice(3))===J(lt(B.r[2]))&&H.G.flags.YU_Y4_LIB===true);
    { const u=D('2028-10-14'); fresh(u,10,'dorm',{EXCHANGE_ROUTE:'US'}); fam(YU); contact(YU); const ab=STORY.abroad(H.G); const l=CALENDAR.dateOf(u); ruleAt(u-1,20); for(const hh of [0.5,1,1.5,2,2.5,3,3.5]) ruleAt(u,hh); const m=byTag('yu_lib_us');
      check('3-7. 美國路線：2028-10-14（六）臺灣時間 15:00 私訊三則（當地時間 15:00−12＝03:00）',ab&&J(m.map(x=>x.text))===J(B.us)&&m[0].day===u&&Math.abs(m[0].h-3)<0.6,J(m.map(x=>[x.day-u,x.h])));
      fresh(u,10,'dorm',{EXCHANGE_ROUTE:'TW'}); fam(YU); contact(YU); ruleAt(u,15.1); check('3-7. 臺灣路線沒有那三則（當面演）',!byTag('yu_lib_us').length); }
    { const w=TD('Y4S1',10,3); fresh(w,21,'dorm'); fam(YU); contact(YU); ruleAt(w,22); ruleAt(w,22.5); const m=byTag('yu_lib_w10');
      check('3-7. 大四上第 10 週（週三）22:30 私訊「補習班的影片可以開兩倍速」「開兩倍速 老師講話就跟我一樣快了」',J(m.map(x=>x.text))===J(B.w10)&&Math.abs(m[0].h-22.5)<0.02); }
    const epi=f=>{ const G=fresh('2034-06-03',19,'cafe',f); fam(YU); return PG.epiLine(G,YU); };
    const e1=epi({YU4_ALONE:true,YU_Y4_LIB:true}), e2=epi({YU4_ALONE:true}), e3=epi({YU_Y4_LIB:true});
    check('3-7. 尾聲：「一個人吃滷肉飯」那一段之後，有 YU_Y4_LIB 多一句「大四我在法圖練一個人念書。你坐對面那天，我念得最久。」',J(e1.slice(-1))===J([[YU,B.epi]])&&e1.length===e2.length+1&&!JSON.stringify(e3).includes(B.epi),J([e1,e3])); });

  await sec('3-8',async()=>{ const SRC=['src/story3d.js','src/data/events.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8')).join('\n');
    const strs=[...SRC.matchAll(/'([^'\n]*三個社團[^'\n]*)'/g)].map(m=>m[1]);
    const KEEP=['參加了三個社團。常在傅鐘旁邊的長椅吃早餐。','我參加了三個社團，吉他社、辯論社，還有系學會。你要不要來吉他社？不用會彈。','她講了十五分鐘，關於三個社團。','Alison 自我介紹講了三分鐘她的三個社團。','我要拿來寫三個社團的行事曆！'];
    check('3-8. 「三個社團」只留：人物頁、第一次自我介紹、語 1「她講了十五分鐘」、迎新那一句旁白、聖誕禮物那一句',J([...new Set(strs)].sort())===J(KEEP.slice().sort()),J(strs));
    check('3-8. 換掉的兩處：語 1 的選項「「辯論社不會累嗎？」」、平常閒聊「我這禮拜辯論社都要開會，快死了。」',SRC.includes("'「辯論社不會累嗎？」'")&&SRC.includes("'我這禮拜辯論社都要開會，快死了。'")); });

  /* ===================== 4 明軒 ===================== */
  const metMX=()=>SOCIAL.remember(MX,'FIRST_MET','');
  await sec('4-1',async()=>{ const M=L().mx, B=ev('ev_mingxuan_notes_b1'), O=ev('ev_mingxuan_notes');
    check('4-1. B1 的入口：總圖 B1、週二、四 22:00～23:30、大一上～大一下、點明軒（同 M1，interact）',!!B&&B.location==='library_b1'&&B.trigger==='interact'&&J(B.weekday)===J([2,4])&&J(B.time)===J([22,23.5])&&J(B.term)===J(['Y1S1','Y1S2'])&&B.participants[0]===MX);
    const bt=B.dialogue.filter(l=>l.text!=null).map(l=>l.text), ot=O.dialogue.filter(l=>l.text!=null).map(l=>l.text);
    check('4-1. 前兩句換成「（B1 自習室最角落。……）」「（他看到你，把筆記蓋起來。）」；「走到校門口。」改「走出總圖。」；其他照 M1',bt[0]===M.b1[0]&&bt[1]===M.b1[1]&&!bt.includes('走到校門口。')&&bt.includes(M.b1Out)&&J(bt.slice(2).map(t=>t===M.b1Out?'走到校門口。':t))===J(ot.slice(2)),J(bt.slice(0,3)));
    check('4-1. 後果同 M1（SAW_HIM_STUDY、聯絡方式、MX_M1_DAY），日誌寫 B1',J(B.consequences.mem)===J(O.consequences.mem)&&B.consequences.contact===O.consequences.contact&&J(B.consequences.stamp)===J(O.consequences.stamp)&&B.consequences.memo==='在總圖 B1 的自習室遇到明軒');
    const ok=(t,w,wd,h,o)=>{ o=o||{}; fresh(TD(t,w,wd),h,'library_b1'); if(o.acq!==false) acq(MX); if(o.done) H.G.events.done[o.done]=1; return EVENTS.check(B); };
    check('4-1. 大一上第 7 週～大一下第 16 週，週二、四 22:00～23:30、認識他＝點得到',ok('Y1S1',7,2,22.5)&&ok('Y1S2',16,4,23)&&ok('Y1S1',16,4,22.1));
    const no=[]; if(ok('Y1S1',6,2,22.5)) no.push('大一上第 6 週'); if(ok('Y1S1',8,3,22.5)) no.push('週三'); if(ok('Y1S1',8,2,21.5)) no.push('22:00 以前'); if(ok('Y2S1',3,2,22.5)) no.push('大二');
    if(ok('Y1S1',8,2,22.5,{done:'ev_mingxuan_notes'})) no.push('公車站那一場演過'); if(ok('Y1S1',8,2,22.5,{acq:false})) no.push('不認識');
    { fresh(TD('Y1S1',8,2),21.5,'gongguan'); acq(MX); H.G.events.done.ev_mingxuan_notes_b1=1; if(EVENTS.check(O)) no.push('B1 演過以後公車站還演'); }
    check('4-1. 不演：第 6 週、週三、22:00 以前、大二、公車站那一場演過、不認識；B1 演過以後公車站也不演（同一場只演一次）',!no.length,J(no));
    { fresh(TD('Y1S1',8,2),22.5,'library_b1'); const x=sched(MX); fresh(TD('Y1S1',6,2),22.5,'library_b1'); const y=sched(MX);
      check('4-1. 明軒的作息：那幾週週二、四 22:00～23:30 在 B1 自習室最角落（北牆那一排最東邊）',!!x&&x.zone==='library_b1'&&J(x.seatAt)===J([6.6,-7.77])&&!(y&&y.zone==='library_b1')); }
    fresh(TD('Y1S1',8,2),22.5,'library_b1'); acq(MX); await play('ev_mingxuan_notes_b1',[0]);
    check('4-1. 演完：SAW_HIM_STUDY、交換聯絡方式',SOCIAL.has(MX,'SAW_HIM_STUDY')&&INV.hasContact(H.G,MX)&&H.said.some(x=>x.t===M.b1Out));
    { const d=TD('Y1S1',9,2); const run=o=>{ o=o||{}; fresh(d,20,'dorm'); if(o.grp!==false) PHONE.join(H.G,'noodle_team','麵店團'); if(o.saw) SOCIAL.remember(MX,'SAW_HIM_STUDY',''); ruleAt(d,22); ruleAt(d,23.5); return thread('g:noodle_team').filter(m=>m.tag==='mx_b1_hint'); };
      const m=run(); check('4-1. 提示：大一上第 9 週週二 23:30 麵店團，阿哲「明軒說他今天很早睡」「結果我剛剛在總圖門口看到他的腳踏車」',J(m.map(x=>[x.from,x.text]))===J(M.hint.map(t=>[ZHE,t]))&&Math.abs(m[0].h-23.5)<0.02);
      check('4-1. 已經看過他念書（SAW_HIM_STUDY）、不在麵店團：沒有提示',!run({saw:true}).length&&!run({grp:false}).length); } });

  await sec('4-2',async()=>{ const M=L().mx;
    /* (a) 傘：大一下第 6～10 週、下雨的平日、霖澤館 201 的必修下課 15 分鐘內、在穿堂 */
    const dayWith=(t,w)=>{ for(let wd=1;wd<=5;wd++){ const d=TD(t,w,wd); fresh(d,8,'campus'); const it=CLS.dayItems(H.G).find(q=>q.c.kind==='required'&&!q.exam&&q.room&&q.room.zone==='classroom'); if(it) return {d,it}; } return null; };
    const u=dayWith('Y1S2',6);
    const setup=(o)=>{ o=o||{}; const x=o.at||u; fresh(x.d,8,'campus'); H.G.weather=o.weather||'rain'; metAN(); if(o.mx!==false) metMX(); at(x.d,x.it.t1+(o.dh!=null?o.dh:0.1)); pos(33,-110,0); return H.G; };
    setup(); check('4-2. (a) 傘：大一下第 6 週下雨的平日、201 的必修剛下課（15 分鐘內）、在霖澤館的穿堂＝演',!!u&&ready('ev_mx_umbrella'),J(u&&[keyOf(u.d),u.it.c.id,u.it.t1]));
    const no=[]; setup({weather:'clear'}); if(ready('ev_mx_umbrella')) no.push('沒下雨'); setup({dh:0.4}); if(ready('ev_mx_umbrella')) no.push('下課 24 分鐘'); setup({mx:false}); if(ready('ev_mx_umbrella')) no.push('不認識明軒');
    { const u5=dayWith('Y1S2',5); setup({at:u5}); if(ready('ev_mx_umbrella')) no.push('第 5 週'); const u11=dayWith('Y1S2',11); if(u11){ setup({at:u11}); if(ready('ev_mx_umbrella')) no.push('第 11 週'); } }
    check('4-2. (a) 不演：沒下雨、下課超過 15 分鐘、不認識明軒、第 5／11 週',!no.length,J(no));
    const run=async k=>{ setup(); await play('ev_mx_umbrella',[k]); return H.said.map(x=>x.t); };
    let r=await run(0); check('4-2. (a) 開場三行；「明軒的。」→「（往雨裡看了一眼）……嗯。」「（她撐開傘走了。）」，記 MX_UMB_TOLD',J(r)===J(lt(M.umb.open).concat(lt(M.umb.r[0])))&&J(H.opts[0])===J(M.umb.opts)&&H.G.flags.MX_UMB_TOLD===true&&H.G.flags.MX_UMB==='TOLD');
    const s1=await run(1), f1=H.G.flags.MX_UMB_SILENT, s2=await run(2), f2=H.G.flags.MX_UMB_SILENT;
    check('4-2. (a) 「不知道。」或（不說話）→「（她等了一下，最後撐開傘走了。）」，記 MX_UMB_SILENT',J(s1.slice(3))===J(lt(M.umb.r[1]))&&J(s2.slice(3))===J(lt(M.umb.r[1]))&&f1===true&&f2===true);
    /* (b) 咖啡 */
    const cf=(w,o)=>{ o=o||{}; fresh(TD('Y2S1',w,3),15,'library'); metAN(); if(o.mx!==false) metMX(); spawnAt(AN,2,2,0); pos(2,3.2,0); return ready('ev_mx_coffee'); };
    check('4-2. (b) 咖啡：大二上第 8 週（期中考週）、總圖三樓、走到以安旁邊＝演；第 9 週、不認識明軒＝不演',cf(8)&&!cf(9)&&!cf(8,{mx:false}));
    { fresh(TD('Y2S1',8,3),15,'library'); const a=sched(AN); check('4-2. (b) 以安的作息：期中考週（週一、三、四、五）下午在總圖三樓',!!a&&a.zone==='library',J(a&&a.zone)); }
    fresh(TD('Y2S1',8,3),15,'library'); metAN(); metMX(); await play('ev_mx_coffee'); check('4-2. (b) 兩句旁白、沒有選項',J(H.said.map(x=>x.t))===J(lt(M.coffee))&&!H.opts.length);
    /* (c) 位子 */
    const st=(w,o)=>{ o=o||{}; for(let wd=1;wd<=5;wd++){ fresh(TD('Y2S2',w,wd),8,'classroom'); if(o.an!==false) metAN(); metMX(); const it=CLS.dayItems(H.G).find(q=>q.c.id==='oblig_spec'||q.c.id==='family_law'); if(it) return it; } return null; };
    let it=st(3); check('4-2. (c) 位子：大二下第 3～8 週，民法課（債各、身分法）上課前＝演（CLS.beforeClassEvent 挑到它）',!!it&&S().SEAT.beforeClass(it)&&(await (async()=>{ at(it.day,it.t0-0.1); H.said=[]; await CLS.beforeClassEvent(GM,it); return !!H.G.events.done.ev_mx_seat; })()),J(it&&it.c.id));
    check('4-2. (c) 旁白＋明軒「（對你，小聲）你什麼都沒看到。」',J(H.said.map(x=>x.t))===J(lt(M.seat))&&H.said[1].who===NM(MX));
    it=st(10); check('4-2. (c) 第 10 週不演（第 8～9 週是期中考）',!!it&&!S().SEAT.beforeClass(it));
    /* M2 */
    const m2=async v=>{ fresh(TD('Y2S2',15,1),21.5,'dorm_hall',v?{MX_UMB:v}:{}); await play('ev_mx_m2_walk',[0]); const t=H.said.map(x=>x.t); return t[t.indexOf('……她講得很清楚。我只回了一句「好」。')+1]; };
    check('4-2. M2：他說完（「……她講得很清楚。我只回了一句「好」。」）以後，TOLD／SILENT 各多一句；沒看到傘＝照舊',(await m2('TOLD'))===M.m2.TOLD&&(await m2('SILENT'))===M.m2.SILENT&&(await m2(null))==='還好。你看，我還吃得下滷蛋。'); });

  await sec('4-3',async()=>{ const G3=L().mx.german, d=TD('Y3S1',12,1);
    const setup=(day,h,o)=>{ o=o||{}; fresh(day,h,'campus'); if(o.fam!==false) fam(MX); else acq(MX); spawnAt(MX,10,10,0); pos(10,11.5,0); contact(MX); return H.G; };
    setup(d,16); check('4-3. 大三上第 12 週、校園、走到明軒旁邊（有點熟以上）＝演',ready('ev_mx_german_ask'));
    { fresh(d,16,'campus'); const x=sched(MX); check('4-3. 那一週下午明軒的作息在校園',!!x&&x.zone==='campus'); }
    const no=[]; setup(d,16,{fam:false}); if(ready('ev_mx_german_ask')) no.push('不熟'); setup(TD('Y3S1',11,1),16); if(ready('ev_mx_german_ask')) no.push('第 11 週'); setup(TD('Y3S1',12,4),20.5); if(ready('ev_mx_german_ask')) no.push('週四 20:00 以後（約不到當天 21:00）'); setup(TD('Y3S1',12,5),16); if(ready('ev_mx_german_ask')) no.push('週五');
    check('4-3. 不演：不熟、第 11 週、週四晚上、週五',!no.length,J(no));
    setup(d,16); await play('ev_mx_german_ask',[0]); const iv=(H.G.invites||[]).find(q=>q.who===MX);
    check('4-3. 兩句（「欸，我德文要考口說。……」「紙條上是德文，我有寫注音。」）；「好。」＝約好這一週週四 21:00 總圖 B1 討論室（INV）',J(H.said.map(x=>x.t))===J(lt(G3.ask))&&J(H.opts[0])===J(G3.opts)&&!!iv&&iv.state==='accepted'&&iv.place==='lib_b1'&&iv.day===TD('Y3S1',12,4)&&iv.h===21&&iv.ev==='ev_mx_german',J(iv));
    at(iv.day,21); H.G.zone='library_b1'; await meetIv(iv);
    check('4-3. 見面：「（你照著紙條上的注音念：「古騰塔格。」）」……「好，下禮拜考。過了請你。……不是滷蛋。」；記 MX_GERMAN',J(H.said.map(x=>x.t))===J(lt(G3.scene))&&H.G.flags.MX_GERMAN===true);
    const w13=TD('Y3S1',13,3); ruleAt(w13-1,22); ruleAt(w13,21); check('4-3. 第 13 週（週三 21:00）私訊「德文口說過了」「考官說我的對話對象發音很有特色 哈哈」',J(byTag('mx_german_after').map(m=>m.text))===J(G3.passed));
    setup(d,16); await play('ev_mx_german_ask',[1]); check('4-3. 「我念不出來。」→「好啦。我去找阿哲。」；沒有約',H.said.slice(-1)[0].t===G3.no[0][1]&&!(H.G.invites||[]).some(q=>q.who===MX));
    ruleAt(w13-1,22); ruleAt(w13,21); check('4-3. 第 13 週：「德文口說過了 阿哲念得比你想的還爛 哈哈」',J(byTag('mx_german_after').map(m=>m.text))===J(G3.zhe)); });

  await sec('4-4',async()=>{ const B=L().mx.bank, d=TD('Y4S1',10,3);
    const run=(k,o)=>{ o=o||{}; fresh(d,20,'dorm'); if(o.fam!==false) fam(MX); contact(MX); ruleAt(d,21); ruleAt(d,22); if(k!=null) answer('mx_bank',k); };
    run(); const m=byTag('mx_bank');
    check('4-4. 大四上第 10 週 22:00 私訊「（照片：一本存摺，數字被手指擋住）」「還差一點」；三個回覆',J(m.map(x=>x.text))===J(B.msg)&&Math.abs(m[0].h-22)<0.02&&J(askOpts('mx_bank'))===J(B.opts.map(o=>o[0])));
    const reps=[]; for(let k=0;k<3;k++){ run(k); reps.push(texts('p:'+MX).slice(-1)[0]); } check('4-4. 「差多少？」→「不講 哈哈」／「加油。」→「嗯」／「要不要我幫你介紹家教？」→「不用 我自己來」',J(reps)===J(B.opts.map(o=>o[1])),J(reps));
    run(null,{fam:false}); check('4-4. 不到有點熟：不發',!byTag('mx_bank').length); });

  await sec('4-5',async()=>{ const M=L().mx;
    const run=(term,w,o)=>{ o=o||{}; const out=[]; const d0=TD(term,w,2); fresh(d0,14,'campus'); fam(MX); for(let i=0;i<(o.n||12);i++){ at(d0+i,14); const r=STORY.smallTalk(H.G,MX); out.push(r.say||r.narr); } return out; };
    const res=[]; for(const T of M.talk){ if(T.m3) continue; const o=run(T.term,3); res.push([T.term,o.filter(t=>t===T.t).length===1,o.slice(-1)[0]===M.after]); }
    check('4-5. 每學期一句（大一下～大四下），每句一次；說完＝「（明軒比了一下手上的綠色螢光筆。）」',res.every(r=>r[1]&&r[2]),J(res));
    { const T=M.talk.find(q=>q.m3), a=run('Y3S2',3), b=run('Y3S2',12); check('4-5. 大三下「冠軍賽那天，……」在 M3（2028-04-29 冠軍賽）以後',!a.includes(T.t)&&b.includes(T.t)); }
    { const a=run('Y1S1',8), b=run('Y2S1',3); check('4-5. 「阿哲說週五練球。」只限大一（原句）',a.filter(t=>t==='「阿哲說週五練球。」').length===1&&!b.includes('「阿哲說週五練球。」')); } });

  await sec('4-6',async()=>{ const fit=fs.readFileSync(path.join(H.ROOT,'src/fit3d.js'),'utf8'), rl=fs.readFileSync(path.join(H.ROOT,'src/data/rel_lines.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');   /* 註解拿掉（註解裡寫了拿掉的那一句）*/
    const mx=[...fit.matchAll(/\['classmate_mingxuan','([^']*)'\]/g)].map(m=>m[1]);
    check('4-6. fit3d.js 明軒當面的「哈哈」拿掉（口氣表：「哈哈」只在訊息裡）',mx.length>=3&&!mx.some(t=>/哈哈/.test(t))&&mx.includes('健身房？學校的？學生月票很便宜吧？CP 值很高。')&&mx.includes('系籃缺人。你不要拒絕。')&&mx.includes('最近有在動喔？學校的球場不用錢吧？CP 值最高。'),J(mx));
    check('4-6. 滷蛋：朋友階道別「下次我請。……一顆滷蛋。」拿掉；德文「……不是滷蛋。」、M2「我還吃得下滷蛋」照舊',!rl.includes('下次我請。……一顆滷蛋。')&&L().mx.german.scene.some(x=>x[1].endsWith('不是滷蛋。'))&&JSON.stringify(ev('ev_mx_m2_walk').dialogue).includes('我還吃得下滷蛋')); });

  /* ===================== 5 Kevin ===================== */
  const KVID='kevin', YZID='family_junior';   /* 手機上的 id（ADV 的立繪是 npc_kevin）*/
  const joinFam=()=>PHONE.join(H.G,'family_law','法律直屬家族');
  const noCmt=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  await sec('5-2',async()=>{ const K=L().kv, ask=D('2026-09-14'), h=D(S().HAND);
    check('5-2. 日子：2026-09-14（一）揪、2026-09-17（四）家聚（大二上第 2 週）',keyOf(h)==='2026-09-17'&&CALENDAR.dateOf(h).wd===4&&CALENDAR.dateOf(ask).wd===1&&CALENDAR.termOf(h).id==='Y2S1');
    const setup=(o)=>{ o=o||{}; fresh(ask,20,'dorm'); if(o.fam!==false) joinFam(); ruleAt(ask,21+10/60); return byTag('kv_hand_ask'); };
    let m=setup();
    check('5-2. 9/14 21:10 家族群組 Kevin「禮拜四家聚！！新的學弟妹來報到」；回「去。」（9/17 18:00 前）',m.length===1&&m[0].th==='g:family_law'&&m[0].name==='Kevin'&&m[0].text===K.invite&&J(askOpts('kv_hand'))===J([K.go])&&!!H.G.flags.KV_HAND_ASKED,J(m));
    check('5-2. 不在家族群組：沒有',!setup({fam:false}).length);
    setup(); answer('kv_hand',0); const q=OUT.get(H.G,'kv_hand');
    check('5-2. 回「去。」＝排進行程：9/17 18:30 118 巷的定食店（時間到問出發）',!!q&&q.day===h&&q.h===18.5&&q.ev==='ev_kv_handover'&&q.place==='118 巷・定食店',J(q));
    const run=async k=>{ fresh(h,18.5,'l118'); joinFam(); await play('ev_kv_handover',[k]); return H.said.map(x=>(x.who?x.who+'：':'')+x.t); };
    let r=await run(0);
    check('5-2. 開場：定食店、Kevin「學弟，這是佳穎。……」（第 8 節第 5 點）、佳穎「學、學長好。」、Kevin「考古題的資料夾，……交給你。」；三個選項',K.hand.open[1][1]==='學弟，這是佳穎。你的直屬學妹。……對，你現在是學長了。'&&J(r.slice(0,4))===J(K.hand.open.map(([w,t])=>(w==='kv'?'Kevin：':w==='yz'?'佳穎：':'')+t))&&J(H.opts[0])===J(K.hand.opts),J(r.slice(0,4)));
    const reps=[r.slice(4)]; for(const k of [1,2]){ reps.push((await run(k)).slice(4)); }
    check('5-2. 三個回答各自 Kevin 的一句；記 KV_HANDOVER',J(reps)===J(K.hand.r.map(x=>x.map(t=>'Kevin：'+t)))&&H.G.flags.KV_HANDOVER===true,J(reps));
    check('5-2. 背景 dark（118 巷的定食店在 2D）、佳穎與 Kevin 用名字（PORTRAIT_ONLY：不是 CHARACTERS 的人物）',ev('ev_kv_handover').background==='dark'&&NM(KVID)==='Kevin'&&NM(YZID)==='佳穎'&&K.junior==='佳穎');
    /* 沒去 */
    { fresh(h,22,'dorm'); joinFam(); ruleAt(h+1,20); ruleAt(h+1,21.05); const a=byTag('kv_hand_missed'); fresh(h,22,'dorm',{KV_HANDOVER:true}); joinFam(); ruleAt(h+1,21.05);
      check('5-2. 沒去：9/18 21:00 Kevin 在群組貼「考古題資料夾交給學弟了 有問題找他」；去了＝沒有',a.length===1&&a[0].text===K.missed&&a[0].th==='g:family_law'&&!byTag('kv_hand_missed').length); }
    /* 佳穎私訊（2027-03-08；去了、沒去都傳）*/
    for(const went of [true,false]){ const d=D('2027-03-08'); fresh(d,20,'dorm',went?{KV_HANDOVER:true}:{}); joinFam(); ruleAt(d,20.5); ruleAt(d,21.05); const m2=byTag('kv_yz_ask');
      check('5-2. 2027-03-08 佳穎私訊祐廷「學長，民總的考古題在資料夾的哪裡？」（'+(went?'去了':'沒去')+'）；回「（傳給她）」→「謝謝學長！！」；對話框標題「佳穎」',m2.length===1&&m2[0].th==='p:'+YZID&&m2[0].text===K.yz.ask&&J(askOpts('kv_yz'))===J([K.yz.opt])&&PHONE.title(H.G,'p:'+YZID)==='佳穎'&&(answer('kv_yz',0),texts('p:'+YZID).slice(-1)[0]===K.yz.rep),J(m2)); }
    { const d=D('2027-03-08'); fresh(d,20,'dorm'); ruleAt(d,21.05); check('5-2. 不在家族群組：佳穎沒有你的帳號、不傳',!byTag('kv_yz_ask').length); }
    check('5-2. 原本 2027-03-08 家族群組學妹問考古題那一段拿掉',!SISB12_LINES.fam2.some(x=>x.day==='2027-03-08')&&!noCmt('src/data/sis_b12_events.js').includes('請問民總的考古題在哪裡🙏'));
    const NAMES=['src/sis_b12_3d.js','src/r3_3d.js','src/y34b3d.js'].map(noCmt).join('\n');
    check('5-2. 家族的學妹（family_junior）全部叫佳穎（第 8 節第 5 點；不再有「家族的學妹」「學妹」「宜蓁」）',!/from:'family_junior',name:'(家族的學妹|學妹|宜蓁)'/.test(NAMES)&&(NAMES.match(/from:'family_junior',name:'佳穎'/g)||[]).length===3);
    { const s={msgs:[{th:'g:family_law',from:YZID,name:'家族的學妹',text:'學姊好🙏'},{th:'g:family_law',from:KVID,name:'Kevin',text:'x'},{th:'g:family_law',from:YZID,name:'宜蓁',text:'學長加油🙏'},{th:'p:sister',from:'sister',name:'宜蓁',text:'這週又加班'}],phone:{q:[{day:1,h:1,items:[{th:'g:family_law',from:YZID,name:'學妹',text:'我也要！'}]}]}};
      const n=S().migrate(s); check('5-2. 讀舊存檔：手機裡的學妹（已經收到的、排著的；開發版叫「宜蓁」的也是）名字換成佳穎；姊姊宜蓁（from sister）不動',n===3&&s.msgs[0].name==='佳穎'&&s.msgs[2].name==='佳穎'&&s.phone.q[0].items[0].name==='佳穎'&&s.msgs[1].name==='Kevin'&&s.msgs[3].name==='宜蓁',J(s)); } });

  await sec('5-3',async()=>{ const K=L().kv;
    const grp=(k,h)=>{ const d=D(k); fresh(d,h-1,'dorm'); joinFam(); ruleAt(d,h-0.5); ruleAt(d,h+0.05); return d; };
    let d=grp('2028-09-22',21); let m=thread('g:family_law').filter(x=>x.tag==='kv_bar1');
    check('5-3. 2028 年 9 月（一試放榜那一週）家族群組：「一試過了！！！」「二試十月 大家幫我集氣」',J(m.map(x=>[x.name,x.text]))===J(K.bar1.map(t=>['Kevin',t])));
    d=grp('2028-12-15',21); m=thread('g:family_law').filter(x=>x.tag==='kv_bar2');
    check('5-3. 2028 年 12 月（二試放榜）：Kevin 三則、學姊「明年。」、佳穎「學長加油🙏」',J(m.map(x=>[x.name,x.text]))===J(K.bar2.map(t=>['Kevin',t]).concat([['溫學姊',K.bar2Sis],['佳穎',K.bar2Yz]])),J(m.map(x=>[x.name,x.text])));
    d=grp('2029-12-14',21); m=thread('g:family_law').filter(x=>x.tag==='kv_bar3'); check('5-3. 2029 年 12 月：「上了！！！！」「各位 我是律師了（還要受訓）」',J(m.map(x=>x.text))===J(K.bar3));
    d=grp('2030-10-01',21); m=thread('g:family_law').filter(x=>x.tag==='kv_firm'); check('5-3. 2030-10-01（第一份工作那一天）：「各位 我們事務所在找實習生」「家族的人優先」「佳穎 說妳」',J(m.map(x=>x.text))===J(K.firm)&&K.firm[2]==='佳穎 說妳');
    { fresh(D('2028-09-22'),20,'dorm'); ruleAt(D('2028-09-22'),21.05); check('5-3. 不在家族群組：收不到',!byTag('kv_bar1').length); }
    const book=flags=>{ const b=D('2029-03-11'); fresh(b,20,'dorm',flags); joinFam(); ruleAt(b,20.5); ruleAt(b,21.05); return byTag('kv_book'); };
    m=book({Y4_PATH:'bar'});
    check('5-3. 走國考的（Y4_PATH bar／both、報名了國考）：2029-03 第 2 週週日（3/11）21:00 Kevin 私訊三則',CALENDAR.dateOf(D('2029-03-11')).wd===7&&J(m.map(x=>x.text))===J(K.book)&&m[0].th==='p:'+KVID&&book({Y4_PATH:'both'}).length===3&&book({BAR_REG:true}).length===3);
    book({Y4_PATH:'bar'}); check('5-3. 房間物品「Kevin 的錯題本」：「（每一頁的角落都寫著：『這題我錯過。』）」',STORY.roomItemList(H.G).some(x=>J(x)===J(K.bookRoom)));
    check('5-3. 沒走國考（研究所）：沒有錯題本',!book({Y4_PATH:'grad'}).length&&!STORY.roomItemList(H.G).some(x=>x[0]==='Kevin 的錯題本')); });

  await sec('5-4',async()=>{ const K=L().kv, src=noCmt('src/story3d.js');
    check('5-4. 「學姊多講兩個字」：大四 gradPost 第 4、5 則換成「學姊 八月國考 妳幫我集氣一次就好」「好。日子跟我說。」',J(SISB12_LINES.gradPost.slice(3))===J(K.gradPost45)&&!JSON.stringify(SISB12_LINES.gradPost).includes('多講兩個字'));
    { const y=noCmt('src/y34b3d.js'); check('5-4. 學姊到美國：第 2、3 則換成「天空有多大 拍給我們看啦」「（照片：停車場上面的天空）」「大家保重。」（第一則「到了。天空很大。」照舊）',y.includes("[GSIS('到了。天空很大。'),GKEV('天空有多大 拍給我們看啦'),GSIS('（照片：停車場上面的天空）'),GSIS('大家保重。')]")&&!y.includes('學姊妳可以多講兩個字')); }
    { const sg=noCmt('src/sis_grad3d.js'); check('5-4. 第一次（2026-03 學姊上榜）的「多講兩個字」保留',/多講兩個字/.test(sg)); }
    { const m=/const DAILY_KEVIN=\[([^\]]*)\]/.exec(src), arr=m?[...m[1].matchAll(/'([^']*)'/g)].map(x=>x[1]):[];
      check('5-4. 動物影片：每日那四則保留前 2 則（貓、柯基），第 3、4 則換成他自己的事第 1、2 則',arr.length===4&&/^📹/.test(arr[0])&&/^📹/.test(arr[1])&&arr[2]===K.vids[0]&&arr[3]===K.vids[1],J(arr));
      check('5-4. 跟著影片的「學姊妳到底有沒有看」「有。三分十二秒。」拿掉',!src.includes('學姊妳到底有沒有看')&&!src.includes('有。三分十二秒。')); }
    check('5-4. 第 5 則（鸚鵡）換成「考古題資料夾我整理了一個晚上 ……已刪除」，學姊的「七八五十六。」拿掉',typeof Y1FILL_LINES!=='undefined'&&J(Y1FILL_LINES.dp.kevin_parrot)===J([['kevin',K.vids[2]]])&&!noCmt('src/data/y1fill_events.js').includes('七八五十六。'));
    { const e=SISB12_LINES.fam2.find(x=>x.day==='2026-10-26'); check('5-4. 第 6 則（2026-10-26）換成「家聚吃什麼 不要再吃咖哩了」；「期中加油各位」「收到。」照留',!!e&&J(e.L)===J([['k',K.vids[3]],['k','期中加油各位'],['s','收到。']]),J(e&&e.L)); }
    check('5-4. 民法第 184 條（侵權行為）的那一則條號照實',K.vids[1].includes('民法第一百八十四條')); });

  /* ===================== 6 陳助教 ===================== */
  await sec('6',async()=>{ const TA='npc_ta_chen';
    const w=(t,wk,wd,h)=>{ fresh(TD(t,wk,wd),h,'classroom'); return STORY.schedEnt(CHARACTERS[TA],H.G); };
    const a=w('Y1S1',5,2,10.5), b=w('Y2S1',5,2,10.5), c=w('Y3S1',5,2,10.5), p=w('Y1S1',5,3,15);
    check('6. 陳助教：大一、大二週二上午不在教室助教位（拿掉）；大三上照舊；平日下午照舊在總圖',!(a&&a.zone==='classroom')&&!(b&&b.zone==='classroom')&&!!c&&c.zone==='classroom'&&c.act==='ta'&&!!p&&p.zone==='library',J([a,b,c,p].map(x=>x&&x.zone)));
    check('6. 法服、吉他社、即興劇社的社長：說話人標籤寫全名（「法服的社長」「吉他社社長」「即興劇社社長」，不寫「社長」）',!/speaker:'社長'|name:'社長'/.test(['src/story3d.js','src/data/events.js'].map(noCmt).join('\n'))&&STORY.fafuLead({day:TD('Y1S1',5,1)})==='法服的社長'); });

  /* ===================== 7 舊存檔 ===================== */
  await sec('7',async()=>{
    /* 已經過了的不補 */
    const past=[];
    { fresh(TD('Y1S2',3,4),13.5,'classroom'); const x=CLS.dayItems(H.G).find(q=>q.c.kind==='required'&&q.t0>=12); if(x&&S().ycMeetDue(H.G,x)) past.push('1-3 認識（大一下）'); }
    { fresh(TD('Y1S1',5,1),12.3,'campus',NEWG); const it=CLS.dayItems(H.G).find(q=>q.c.kind==='required'&&q.room&&q.room.zone==='classroom'); if(it){ CLS.rec(H.G).done[it.key]=1; at(it.day,it.t1+0.1); if(EVENTS.check(ev('ev_yu_meet_w3'))) past.push('3-1 保證認識（第 5 週）'); } }
    { const d=D('2026-10-05'); fresh(d,20,'dorm'); joinFam(); ruleAt(d,21.2); if(byTag('kv_hand_ask').length||byTag('kv_hand_missed').length) past.push('5-2 家聚的揪、沒去那一句（10/5 才讀）'); }
    { const d=TD('Y2S2',5,1); fresh(d,20,'dorm'); fam(XC); contact(XC); ruleAt(d,21.1); if(byTag('xc_fix').length) past.push('2-3 補救（第 5 週才讀）'); }
    { const d=D('2027-04-30'); fresh(d,17.75,'campus'); fam(XC); pos(34,-109,0); if(ready('ev_xc_dad')) past.push('2-4 爸爸（過了那一天）'); }
    { const d=TD('Y2S2',4,3); fresh(d,20,'dorm'); fam(YU); contact(YU); ruleAt(d,21.1); if(byTag('yu_quit').length) past.push('3-4 退社（下一週才讀）'); }
    check('7. 已經過了的場景、訊息不補（1-3、2-3、2-4、3-1、3-4、5-2）',!past.length,J(past));
    /* 記號沒有的照「沒選」：各節已經測過（2-5 沒有 XC_*、3-2 沒有 YU2_PICK、3-3 沒有 YU_BKF、3-5 沒有 YU_C4、4-2 沒有 MX_UMB、1-6 沒有 YC_GIG）——這裡再跑一次舊存檔的旗標全空 */
    { fresh(D('2028-05-04'),19.2,'noodle'); fam(XC); await play('ev_xinci_first_place',[0]); const r=H.said.map(x=>x.t), i=r.indexOf('一點都不好玩。'); const a=r[i+1]==='我把雙主修改成輔系了。經濟我還是喜歡。只是不用拿第一了。';
      fresh(D('2028-03-08'),8.6,'campus'); await play('ev_yu_alone_breakfast',[0]); const b=H.said[1]&&!Object.values(L().yu.bkf.yu4).includes(H.said[1].t);
      fresh(D('2027-11-23'),19,'noodle'); await play('ev_zhe_scooter',[0]); const c=H.said[0]&&H.said[0].t!==L().yu.c4.scooter;
      check('7. 舊存檔沒有新記號（XC_RPS、XC_DAD_*、YU_BKF、YU_C4）：慈 6、語 4、阿哲的機車照原本',a&&b&&c,J([a,b,c])); }
    /* 舊存檔收過舊版本的訊息：新的不再發（不留兩份）*/
    { const d=TD('Y2S2',3,3); fresh(d,20,'dorm'); fam(YU); contact(YU); H.G.needed={shown:{yu_clubs:d-7}}; ruleAt(d,21.1); const a=!byTag('yu_quit').length;
      const e=D('2027-03-08'); fresh(e,20,'dorm'); joinFam(); H.G.msgs.push({th:'g:family_law',from:YZID,name:'家族的學妹',text:'請問民總的考古題在哪裡🙏',day:e,h:20.9}); ruleAt(e,21.1); const b=!byTag('kv_yz_ask').length;
      check('7. 舊存檔收過舊的「這學期我只剩兩個社團了……」＝不發退社三則；收過群組裡學妹問考古題＝佳穎不再私訊',a&&b,J([a,b])); }
    /* 學妹改名佳穎：讀檔換字（game3d.js migrate 叫 SUP497.migrate；同 Alison 改名的做法）*/
    { const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); const s={msgs:[{from:YZID,name:'家族的學妹',text:'學姊好🙏'}]}; const n1=S().migrate(s), n2=S().migrate(s);
      check('7. 學妹改名佳穎：game3d.js 讀檔（migrate）叫 SUP497.migrate；換一次就好（第二次 0 筆）',/SUP497\.migrate\(s\)/.test(g)&&n1===1&&n2===0&&s.msgs[0].name==='佳穎'); } });

  /* ===================== 8 第 8 節（企劃線 60fc3b9a3，AA-C 回 LAWWW-C 7bd68b7cf）：芯慈追劇減量、明軒的滷蛋、學妹改名佳穎（2-1 在上面 2-1 節）===================== */
  await sec('8',async()=>{ const in8=t=>S8.indexOf(t)>=0;
    /* [檔, 舊句, 新句]：新舊兩邊都照第 8 節原文；遊戲檔（註解拿掉）只有新句。msg_pool、eat_lines 是產生器重產的（tools/msg/build_pool.py、tools/eat/import_eat_lines.py 的 FIX）*/
    const SW=[
      ['src/data/events.js','你抽到芯慈的禮物：一張劇單。','你抽到芯慈的禮物：一本空白的筆記本，第一頁的格線已經畫好了。'],
      ['src/data/needed_msgs.js','那部劇大結局了。你不准爆雷。','永和的公車今天提早到了。……我多讀了一章。'],
      ['src/data/noodle_table.js','昨天追劇追到兩點。……麵來了再叫我。','昨天讀書讀到兩點。……麵來了再叫我。'],
      ['src/data/msg_pool.js','在追劇，這集好扯。','在讀書。等我一章。'],
      ['src/data/encounters.js','我來看一個劇的特展。周邊買太多了，在對收據。','我來看一個設計展。周邊買太多了，在對收據。'],
      ['src/data/encounters.js','她和高中同學在一間茶樓的窗邊，拿著手機比對一部韓劇的截圖。','她和高中同學在一間茶樓的窗邊，兩個人在對一份旅遊的帳。'],
      ['src/data/eat_lines.js','剛好。我昨天看了一部劇，沒有人可以講。','剛好。我昨天把筆記重抄了一遍，沒有人可以講。'],
      ['src/data/wz_jobs.js','她手機在放劇：「這是一部很重要的劇。」','她把耳機拿下來：「我在等永和的末班車。……沒等到。」'],
      ['src/data/group_events.js','好。請你吃滷蛋。一顆。','好。請你吃一碗大的。'],
      ['src/data/group_events.js','（他把一顆滷蛋夾到你碗裡。）','（他把一碗大碗的乾麵推到你面前。）'],
      ['src/data/group_events.js','冠軍那天欠的。一顆。','冠軍那天欠的。大碗。'],
      ['src/group3d.js','回來請你吃滷蛋。一顆。','回來請你吃一碗大的。'],
      ['src/data/msg_pool.js','一家多一顆滷蛋 哈哈','一家多送一碗湯 哈哈'] ];
    const bad=SW.filter(([f,a,b])=>{ const t=noCmt(f); return !(in8(a)&&in8(b)&&t.includes(b)&&!t.includes(a)); }).map(x=>x[0]+'：'+x[2]);
    check('8. 第 3、4 點換句（'+SW.length+' 句）：新舊兩邊都是第 8 節原文；遊戲裡只有新句（註解不算）',S8.length>0&&!bad.length,J(bad));
    /* 資料真的是新句（不是只有字串在檔裡）*/
    { const xd=NEEDED_MSGS.list.find(e=>e.id==='xc_drama'); fresh(TD('Y2S1',14,7),21,'dorm');
      check('8. needed_msgs xc_drama：訊息、回覆、她回三句照稿換（「恭喜？」「謝謝。很少發生。」）；沒回的那一句稿沒給新句＝不說（miss:null）',J([xd.msg,xd.reply,xd.resp,xd.miss])===J([['永和的公車今天提早到了。……我多讀了一章。'],'恭喜？',['謝謝。很少發生。'],null])&&in8('「恭喜？」')&&in8('「謝謝。很少發生。」')&&STORY.neededMissFor(H.G,xd,XC)===null,J(xd)); }
    { const P=MSG_POOL.people, xc=P[XC].replies.map(e=>J(e.msgs)), mx=P[MX].replies.map(e=>J(e.msgs));
      check('8. 回覆池（產生器重產）：芯慈「在讀書。等我一章。」、明軒「在比兩家便當」「一家多送一碗湯 哈哈」',xc.includes(J(['在讀書。等我一章。']))&&!xc.includes(J(['在追劇，這集好扯。']))&&mx.includes(J(['在比兩家便當','一家多送一碗湯 哈哈']))&&!mx.some(t=>t.includes('滷蛋'))); }
    check('8. 一起吃（產生器重匯）：芯慈朋友以上「剛好。我昨天把筆記重抄了一遍，沒有人可以講。」',(EAT_LINES.together[XC].FRI||[]).some(x=>x[1]==='剛好。我昨天把筆記重抄了一遍，沒有人可以講。')&&!JSON.stringify(EAT_LINES).includes('我昨天看了一部劇'));
    { const e=ENCOUNTERS.find?ENCOUNTERS.find(x=>x.who===XC&&x.spot==='D18'):null; const all=JSON.stringify(ENCOUNTERS);
      check('8. 偶遇：松菸 D02「我來看一個設計展。……」、九份 D18 why「……兩個人在對一份旅遊的帳。」',all.includes('我來看一個設計展。周邊買太多了，在對收據。')&&(!e||e.why==='她和高中同學在一間茶樓的窗邊，兩個人在對一份旅遊的帳。')&&!/劇的特展|韓劇的截圖/.test(all)); }
    check('8. 麵店長桌、溫州街打工、聖誕禮物照稿換',JSON.stringify(NOODLE_TABLE).includes('昨天讀書讀到兩點。……麵來了再叫我。')&&JSON.stringify(WZ_JOBS_DATA).includes('她把耳機拿下來：「我在等永和的末班車。……沒等到。」')&&STORY_EVENTS.some(e=>(e.dialogue||[]).some(l=>l&&l.text==='你抽到芯慈的禮物：一本空白的筆記本，第一頁的格線已經畫好了。')));
    /* 照留：慈 3、慈 6、R1、尾聲、大一的 y1fill */
    { const t=[['慈 3','她眼睛亮起來，講了十分鐘的劇情。然後停住：','src/data/events.js'],['慈 6','昨天晚上追劇追到兩點。……那部劇真的很好看。','src/data/r2y3b_events.js'],['R1','我跟妳說一部劇。','src/data/events.js'],
        ['尾聲','我在會計師事務所做法遵。昨天追劇追到三點，今天早上差點起不來。','src/data/postgrad_lines.js'],['大一 y1fill','最近在追《檔案室的燈》。','src/data/y1fill_events.js']].filter(([n,s,f])=>!noCmt(f).includes(s)).map(x=>x[0]);
      check('8. 追劇照留的五處：慈 3、慈 6、R1、尾聲、大一的 y1fill',!t.length,J(t)); }
    /* 明軒的滷蛋 */
    { await play('ev_mx_egg_y3'); check('8. ev_mx_egg_y3：「（他把一碗大碗的乾麵推到你面前。）」「冠軍那天欠的。大碗。」',J(H.said.map(x=>x.t))===J(['（他把一碗大碗的乾麵推到你面前。）','冠軍那天欠的。大碗。']),J(H.said.map(x=>x.t))); }
    check('8. 公館一百元清單（明軒寫的）：「滷蛋另外算。」改「豆干另外算。」；旗標名 MX_EGG* 不改',STORY.MX_FM1.rows[1][3]==='豆干另外算。阿姨有時候多給一顆，這個不能算進排名。'&&in8('「滷蛋」改「豆干」')&&!JSON.stringify(STORY.MX_FM1).includes('滷蛋')&&/MX_EGG_PAID/.test(noCmt('src/data/group_events.js'))&&/MX_EGG_JP/.test(noCmt('src/group3d.js')));
    check('8. 明軒的滷蛋只留 M1「他有念啦」那一晚、M2 推滷蛋、德文「不是滷蛋」',noCmt('src/data/events.js').includes('然後請你一顆滷蛋。')&&noCmt('src/y2r2_3d.js').includes('（明軒把自己碗裡的滷蛋，推到你碗裡。）')&&L().mx.german.scene.some(x=>x[1].endsWith('……不是滷蛋。')));
    /* 學妹改名佳穎：family_junior 全部換；姊姊宜蓁不動 */
    { const files=fs.readdirSync(path.join(H.ROOT,'src')).filter(f=>f.endsWith('.js')).map(f=>'src/'+f).concat(fs.readdirSync(path.join(H.ROOT,'src/data')).filter(f=>f.endsWith('.js')).map(f=>'src/data/'+f));
      const SIS_OK=/^src\/(home3d|jpprep3d|vacfill3d)\.js$|^src\/data\/(vacfill_events|jpprep_events)\.js$/;
      const where=files.filter(f=>noCmt(f).includes('宜蓁')), bad=where.filter(f=>!SIS_OK.test(f));
      check('8. 學妹改名佳穎（第 8 節第 5 點）：遊戲裡（註解不算）「宜蓁」只剩姊姊（家裡、寒暑假、日本行前），學妹那幾處都換了',!bad.length&&where.length>0,J({bad,where}));
      check('8. 佳穎：交棒那一場、報到桌的旁白（AA_498）、她私訊的對話框、群組名字都是佳穎',L().kv.junior==='佳穎'&&noCmt('src/data/pool_story.js').includes('（排在隊伍中間的，是佳穎。她看到你，比你還緊張。）')&&NM('family_junior')==='佳穎'&&!(PORTRAIT_ONLY.family_junior.alias||[]).includes('宜蓁'));
      const home=noCmt('src/home3d.js'), vf=noCmt('src/data/vacfill_events.js');
      check('8. 祐廷的姊姊照舊叫宜蓁（home3d.js 的 SIS、寒暑假的對話框；讀檔不換 from sister 的）',/SIS=\{name:'宜蓁'\}/.test(home)&&(vf.match(/speaker:'宜蓁',name:'宜蓁'/g)||[]).length>=7&&(()=>{ const s={msgs:[{th:'p:sister',from:'sister',name:'宜蓁',text:'x'}]}; S().migrate(s); return s.msgs[0].name==='宜蓁'; })()); } });

  H.done();
})();
