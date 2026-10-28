// 配角第二批（AA_519：企劃線 873b670c0 → d75cd0228 加第 8 節；麵店阿姨（阿鳳）、陳助教、兩點半 Café、黃筱涵、阿凱；AA-C 2026-10-28 定稿 D109；任務 NPC-STORY2-1028、USER_WANTS X119）——不需要瀏覽器。
// 台詞逐字對稿（git show d75cd0228，兩個方向）：稿 → 遊戲＝每一節的表、引文、「改成」的句子都在遊戲裡（位置、順序、條件），換掉的舊句不在；
//   遊戲 → 稿＝src/data/aa519_lines.js 的每一句、各檔帶 AA_519 註解的行、src/sup519_3d.js 裡玩家看得到的字都在稿裡（照舊的半句、系統字、別份稿的句子逐一列出原因）。
//   0  讀稿、劇情匯入白名單、index.html 順序、載入
//   1  麵店阿姨：1-1 旁白第一次「阿姨（阿鳳）」、門口那張紙、不再寫「老闆娘」、3D 櫃台是阿姨（中年底模＋圍裙）能說話；1-2 一天一句（十二個時期，出國回來照 YT_AUNT_PHOTO）、
//      短句輪流、過了時期不補；1-3「吃好一點」只留大一上、送小菜八處的順序、大二上期末的下雨版；1-4 店名由來（大二上起、15～17 點、一個人、一次、AUNT_NAME）；
//      1-5 二十三週年那一張讀 ANNIV23、沒有麵店打工、一百元清單
//   2  陳助教：2-1 年級、博士班、第五章；2-2 照學年一年兩句、和天氣交替、不認識學姊換一句；2-3 6/16 公館那一列、6/20 21:00「過了。」
//   3  Café：3-1 老闆（男、馬克杯）在櫃台能說話、店名由來、照時期；3-2 打工五句＋拉花（第 4 班以後一次、CAFE_LATTE_TRY）；3-3 2027-06-04 起點餐那兩句、別人說起芷若的七句；3-4 小禾
//   4  黃筱涵：4-1 照學年、「語彤最近很累」只在大一大二；4-2 當受試者（大二上第 8～12 週週一 21:00 → 週四 15:00、兩個選項、HXH_SUBJECT、人物頁）；PG_TAG
//   5  阿凱：5-1 週五 17:00～18:00 資工系館前、照時期（K5 以後照 KAI_K5）；5-2 宵夜三句；5-3 颱風夜；5-4 期末那一句、去年也是我、宿舍旁邊那攤、寫 code 好難／上班好難
//   6  順手修的：立衡版腳踏車 4/7、方奕廷照學年、予樂第二場那一句
//   7  第 7 節給 BB 的六項（照遊戲的流程跑）
//   8  第 8 節：8-1 語彤顧店的時段阿姨一定在廚房（寒暑假週二四晚上、大二下起週六早上；過年店休、2029-04-19～25 出國才不在）、8-2 一個人吃麵的旁白、
//      8-3 麵店的 2D 事件那一天阿姨那幾列一定成立、8-4 出國那一週（語彤在總圖、不排新的麵店出遊和邀約、舊存檔排好的照演、麵店團沒有麵店日、4/23 21:00 群組四則）
//   9  舊存檔：沒有新旗標、舊的閒聊紀錄、存讀檔以後照樣接、壞掉的 AA519 紀錄
//   10 遊戲 → 稿
// 修改前（只拿掉這一次 src 的改動：git archive 開發分支 493bf3c4f 的 src、index.html，tests 和劇情匯入白名單用新的，稿從這個 repo 讀＝AA519_DOCREPO，2026-10-28 實際跑）：FAILED 45、PASS 4
//   （PASS＝讀稿、白名單、第 7 節和第 8 節第 1 點的對稿——只看稿本身；FAIL＝其他全部：沒有 SUP519、AA519_LINES、HCIRCLE.auntAway，1-2 以後各段第一個檢查就丟出例外中斷）。修改後 ALL PASS（95 項）。
// 子代理解讀（AA 可以改）：測試名稱寫「子代理解讀」的那幾項——經濟系那一年阿姨只有短句；送小菜第八處「回到第一句」＝燙青菜；pool_story_b2 冠廷學長那一句跟著換第五章／第六章；
//   日本路線腳踏車 4/7（稿寫「第一個週六」，4/7 是週五）；其他寫在交付報告。
// 用法：node tests/aa519_support2_unit.js（在沒有 .git 的目錄跑，設環境變數 AA519_DOCREPO＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa516_sis_b14_unit.js：pg_harness 已經載過的不再載；畫 3D 的幾支在 Node 載不進來，跳過）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
if(typeof ASSETS!=='undefined'&&ASSETS.loadOne) ASSETS.loadOne=()=>Promise.resolve(null);
const SRC=f=>{ try{ return fs.readFileSync(path.join(H.ROOT,f),'utf8'); }catch(e){ return ''; } };
const CODE=f=>SRC(f).replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'])\/\/[^\n]*/g,'$1');   /* 去掉註解（註解裡寫了「原本…」的舊句）*/
const X=()=>typeof SUP519!=='undefined'?SUP519:null, LN=()=>typeof AA519_LINES!=='undefined'?AA519_LINES:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd===0?7:wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.lines();
const ev=id=>STORY_EVENTS.find(e=>e&&e.id===id)||null;
const evText=id=>{ const e=ev(id); try{ return e?JSON.stringify(e.dialogue||[]):''; }catch(x){ return ''; } };
const evLines=id=>{ const e=ev(id), out=[]; for(const l of ((e&&e.dialogue)||[])) if(l&&typeof l.text==='string') out.push({who:l.speaker==null?null:l.speaker,t:l.text,l}); return out; };
const nar=(id,t)=>evLines(id).some(x=>x.who===null&&x.t===t);
/* 存檔（o.nar：旁白第一次「阿姨（阿鳳）」那一條要測的時候才不先記；其他段先當作已經出現過，免得每一段第一句旁白都多三個字）*/
const fresh=(key,h,zone,flags,o)=>{ o=o||{}; const k=typeof key==='number'?keyOf(key):key;
  const G=H.fresh(k,h,zone||'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  if(!o.nar&&!o.raw) (G.flags.AA519||(G.flags.AA519={})).nar=-1;
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.obj.position={x:0,y:0,z:0}; E.npcs.length=0; GM.npc={}; ADV.active=false;
  GM.spawnNPC=()=>null; STORY._bindGM(GM); if(X()) X().bind(GM); H.at(k,h); G.zone=zone||'dorm'; return G; };
const at=(key,h,zone)=>{ H.at(typeof key==='number'?keyOf(key):key,h); if(zone) H.G.zone=zone; };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(key,h)=>{ at(key,h); ph(); };
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); return said(); };
const npcAt=(x,z)=>({obj:{position:{x,y:0,z},rotation:{y:0}},frozen:true});
const aunt=async()=>{ H.said=[]; await X().auntTalk(GM,npcAt(-2,-2.75)); return said(); };
const boss=async()=>{ H.said=[]; await X().bossTalk(GM,npcAt(-0.6,-5.25)); return said(); };
const small=id=>{ const o=STORY.smallTalk(H.G,id); return o?(o.say||o.narr||null):null; };
const dayOn=(key,h)=>{ const d=D(key)+1; at(d,h); return d; };
/* 3D 的店：populate 照遊戲生店員（CHAR.build 記下 spec）*/
const built=[]; CHAR.build=spec=>{ built.push(spec); return {position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},visible:true}; };
const populate=zone=>{ built.length=0; E.q=E.q||{level:'high'}; E.interactables=[]; E.zone={id:zone,seats:Array.from({length:16},(_,i)=>({x:i*0.1,z:0,yaw:0}))}; E.npcs.length=0; GM.npc={};
  E.addNPC=n=>{ E.npcs.push(n); return n; }; GM.spawnExtra=()=>null; GM.spawnRider=()=>null; STORY.populate(zone,GM); return E.npcs.find(n=>n.clerk)||null; };
/* 麵店（3D，同 tests/company_priv_unit.js 的 noodleK）：原本那位店員在廚房 (-2,-2.75)；withYt＝語彤顧店的人在這一區；HCIRCLE.arrange 照圈子表生阿姨、藏店員 */
const noodleK=(d,h,withYt,flags)=>{ fresh(d,h,'noodle',flags); E.zone={id:'noodle',seats:[],spawn:{x:0,z:3.5}}; E.npcs.length=0; GM.npc={}; E.canStand=()=>true; E.indoor=true;
  E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; }; E.moveTo=(n,x,z,cb)=>{ n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; }; E.player.obj.position={x:500,y:0,z:500};
  GM.spawnNPC=(id,spec,x,z,o)=>{ o=o||{}; const n={id,spec,name:spec&&spec.name,obj:{position:{x,y:0,z},rotation:{y:0},userData:{}},lv:o.lv|0,beh:'idle',pose:'idle',idlePose:'idle'}; GM.npc[id]=n; E.npcs.push(n); return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); delete GM.npc[id]; } };
  const ck={clerk:true,isExtra:true,name:'',obj:{position:{x:-2.0,y:0,z:-2.75},rotation:{y:Math.PI},visible:true},lv:0}; E.npcs.push(ck); let yt=null;
  if(withYt){ yt={id:'heroine_03',charId:'heroine_03',name:'語彤',obj:{position:{x:2.6,y:0,z:-3.6},rotation:{y:-Math.PI/2}},lv:0,frozen:true,beh:'idle',pose:'idle',idlePose:'idle'}; GM.npc.heroine_03=yt; E.npcs.push(yt); }
  STORY._bindGM(GM); HCIRCLE.bind(GM); HCIRCLE.arrange(GM,false); return {ck,yt}; };
const ckVis=ck=>ck.hidden!==true&&ck.obj.visible!==false;
const ytEnt=()=>STORY.schedEnt(CHARACTERS.heroine_03,H.G);
const minding=()=>{ const e=ytEnt(); return !!e&&e.zone==='noodle'&&e.act==='help'; };

/* ---------- 讀稿 ---------- */
const SHA='d75cd0228', DOCF='docs/story_planning/AA_519_配角第二批_麵店阿姨_陳助教_Café_黃筱涵_阿凱.md';
const gitShow=(sha,f)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+sha+':"'+f+'"',{cwd:process.env.AA519_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const DOC=gitShow(SHA,DOCF);
const part=(a,b,src)=>{ const S=src==null?DOC:src, i=S.indexOf(a); if(i<0) return ''; const j=b?S.indexOf(b,i+a.length):-1; return S.slice(i,j<0?S.length:j); };
const qs=s=>[...String(s).matchAll(/「([^「」]*)」/g)].map(m=>m[1]);   /* 最裡面那一層「」 */
const quotes=s=>String(s).split('\n').map(l=>/^\s*>\s*(.+)$/.exec(l)).filter(Boolean).map(m=>m[1].trim());   /* 「> 說話的人：句子」「> （旁白）」 */
const one=(re,src)=>{ const m=re.exec(src==null?DOC:src); return m?m[1]:null; };
const table=s=>String(s).split('\n').filter(l=>/^\|/.test(l)&&!/^\|\s*-/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim())).slice(1);
const S1=part('## 1. 麵店阿姨','## 2. '), S11=part('### 1-1','### 1-2',S1), S12=part('### 1-2','### 1-3',S1), S13=part('### 1-3','### 1-4',S1), S14=part('### 1-4','### 1-5',S1), S15=part('### 1-5',null,S1);
const S2=part('## 2. 陳助教','## 3. '), S21=part('### 2-1','### 2-2',S2), S22=part('### 2-2','### 2-3',S2), S23=part('### 2-3',null,S2);
const S3=part('## 3. 兩點半 Café','## 4. '), S31=part('### 3-1','### 3-2',S3), S32=part('### 3-2','### 3-3',S3), S33=part('### 3-3','### 3-4',S3), S34=part('### 3-4',null,S3);
const S4=part('## 4. 黃筱涵','## 5. '), S41=part('### 4-1','### 4-2',S4), S42=part('### 4-2',null,S4);
const S5=part('## 5. 阿凱','## 6. '), S51=part('### 5-1','### 5-2',S5), S52=part('### 5-2','### 5-3',S5), S53=part('### 5-3','### 5-4',S5), S54=part('### 5-4',null,S5);
const S6=part('## 6. ','## 7. '), S7=part('## 7. ','## 8. '), S8=part('## 8. ',null);
const pairDoc=(w,t,nm)=>w==null?t:((nm&&nm[w])||w)+'：'+t;   /* 遊戲的 [說話的人, 字] → 稿的「> 說話的人：字」 */
const NM={zhe:'阿哲',yu:'Alison',heroine_03:'語彤',npc_huangxh:'黃筱涵',npc_ta_chen:'陳助教'};

(async()=>{
/* ===================== 0 讀稿、載入 ===================== */
await sec('0',async()=>{
  const A=(()=>{ try{ return (JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files||[]).find(q=>q.path===DOCF)||null; }catch(e){ return null; } })();
  check('0. 讀稿（git show '+SHA+'）：八節都讀得到（第 8 節＝實作時定的麵店四件）',DOC.length>8000&&[S1,S2,S3,S4,S5,S6,S7,S8].every(s=>s.length>200)&&S8.includes('實作時定的'),J({len:DOC.length}));
  check('0. 劇情匯入白名單：AA_519 那一筆 sha '+SHA+'、approved、AA-C 定稿、任務 NPC-STORY2-1028',!!A&&A.sha===SHA&&A.status==='approved'&&/AA-C/.test(A.approvedBy||'')&&A.task==='NPC-STORY2-1028',J(A));
  const sc=f=>html.indexOf('<script src="'+f), iL=sc('src/data/aa519_lines.js'), iS=sc('src/sup519_3d.js');
  const BEFORE=['src/story3d.js','src/eat3d.js','src/noodle_closed3d.js','src/y34b3d.js','src/r2y4b3d.js','src/jobs3d.js','src/multirel3d.js','src/msg3d.js','src/data/msg_pool.js','src/heard3d.js','src/hcircle3d.js','src/invites3d.js','src/outings3d.js','src/phone3d.js','src/r3_3d.js'];
  check('0. index.html：aa519_lines.js → sup519_3d.js，排在它包的模組（STORY、EAT、NOODLE_CLOSED、R2Y4B、JOBS、MREL、MSG、HEARD、HCIRCLE、INV、OUT…）以後、bbpack_events.js 前面；全部載入沒有錯、接線一次',
    iL>0&&iS>iL&&BEFORE.every(f=>sc(f)>0&&sc(f)<iL)&&sc('src/data/bbpack_events.js')>iS&&!loadErr.length&&!!X()&&!!LN()&&X()._wired===true&&LN().src.AA_519===SHA,J({iL,iS,loadErr})); });

/* ===================== 1 麵店阿姨（阿鳳）===================== */
/* 1-1 */
await sec('1-1',async()=>{
  const door=one(/改成「(（麵店門口貼著一張紙：「[^」]+」）)」/,S11);
  check('1-1 門口那張紙＝稿上「改成」那一句（r2y4b3d.js S.AUNT_DOOR）；舊的「老闆出國，休息七天」不在遊戲裡',!!door&&R2Y4B.AUNT_DOOR===door&&!CODE('src/r2y4b3d.js').includes('老闆出國，休息七天'),J({door,game:R2Y4B.AUNT_DOOR}));
  /* 不再用「老闆娘」：稿上三處（story3d.js 一個人吃麵、events.js 聖誕交換禮物、跨年）*/
  const OLD={ev_xmas_exchange:'（麵店最裡面那張桌子。老闆娘多拿了兩張椅子過來。）',ev_nye_dinner:'（十二月三十一日，晚上七點。麵店比平常擠，老闆娘把門口那張桌子也搬了進來。）'};
  const bad=Object.keys(OLD).filter(id=>evText(id).includes('老闆娘')||!nar(id,OLD[id].split('老闆娘').join('阿姨')));
  const nEv=X()?[...X().noodleEvs()].filter(id=>id!=='ev_yt_essay'&&evText(id).includes('老闆娘')):['（沒有 SUP519）'];
  check('1-1 不再用「老闆娘」：story3d.js 一個人吃麵、events.js 聖誕交換禮物、跨年的旁白改「阿姨」（其他字照舊）；麵店的事件都沒有「老闆娘」（語彤的系刊文章 ev_yt_essay 是她文章裡的稱呼，照舊）',
    S11.includes('不再用「老闆娘」')&&!bad.length&&!nEv.length&&!SRC('src/story3d.js').includes('老闆娘多給了一匙肉燥'),J({bad,nEv}));
  /* 3D：麵店營業時間，櫃台和廚房那位一律是阿姨（中年底模 npc_nf3＋圍裙，和 hc_ayi 同一個人）*/
  fresh(TD('Y1S1',2,2),12,'noodle'); const ck=populate('noodle'), sp=built.find(s=>s&&s.id==='clerk_noodle')||null, P=HCIRCLE.PEOPLE.hc_ayi||{};
  const mdl=one(/中年底模 `(npc_\w+)`/,S11), t1=ck&&ck.talk?(H.said=[],await ck.talk(ck),said()):null;
  check('1-1 3D：麵店的店員＝阿姨（spec 用 hc_ayi：女、中年底模 '+mdl+'、圍裙；名字「阿姨」、「和阿姨說話」），不再用年輕女性路人；說得出話（大一上第 2 週＝表的第一句）',
    !!ck&&!!sp&&sp.sex==='f'&&sp.model==='char.'+mdl&&P.model===sp.model&&(sp.props||[]).some(q=>q&&q.name==='apron')&&ck.name==='阿姨'&&ck.talkLabel==='和阿姨說話'&&ck.yieldIt===true&&J(t1)===J(['阿姨：坐。……你們法律系的，都坐長桌那邊。']),J({sp:sp&&{model:sp.model,sex:sp.sex},name:ck&&ck.name,t1}));
  /* 圈子表的阿姨、老闆（HCIRCLE.spawnLabel 生的）＝同一個人、同一份紀錄，也能說話；按鈕最後才算（yieldIt：不擋點餐、坐下、出口、旁邊的語彤；老闆是 Café 的 staff 也一樣）*/
  fresh(TD('Y1S1',2,2),18,'noodle'); const la={id:'hc_ayi',name:'阿姨',obj:{position:{x:1.8,y:0,z:-2.75},rotation:{y:0}}}, lb={id:'hc_boss',name:'老闆',staff:'cafe',obj:{position:{x:-0.6,y:0,z:-5.25},rotation:{y:0}}};
  X().afterSpawnLabel(GM,'hc_ayi',la); X().afterSpawnLabel(GM,'hc_boss',lb); H.said=[]; await la.talk(la); const tl=said();
  check('1-1 圈子表的阿姨、老闆（3D 標籤人物）也能說話（同一份紀錄：大一上第 2 週＝表的第一句）；按鈕最後才算（yieldIt：旁邊有點餐、座位、出口、語彤或芷若時不擋，老闆是 staff 也不比吧檯優先）',
    typeof la.talk==='function'&&la.talkLabel==='和阿姨說話'&&la.yieldIt===true&&typeof lb.talk==='function'&&lb.talkLabel==='和老闆說話'&&lb.yieldIt===true&&J(tl)===J(['阿姨：坐。……你們法律系的，都坐長桌那邊。']),J(tl));
  /* 旁白第一次「阿姨（阿鳳）」 */
  fresh(TD('Y1S1',2,2),18,'noodle',{},{nar:true}); H.said=[]; await GM.say(null,'（阿姨看了你一眼。）'); await GM.say(null,'（阿姨看了你一眼。）'); await GM.say({name:'阿姨'},'坐。'); const r1=said();
  fresh(TD('Y1S1',2,2),18,'campus',{},{nar:true}); H.said=[]; await GM.say(null,'（阿姨看了你一眼。）'); const r2=said();
  fresh(TD('Y1S1',2,2),18,'noodle',{},{nar:true}); H.said=[]; await GM.say(null,'阿鳳阿姨講了店名的由來。她說她要記下來。'); await GM.say(null,'（阿姨看了你一眼。）'); const r3=said();
  fresh(D('2025-12-20'),19,'dorm',{},{nar:true}); const r4=await runEv('ev_xmas_exchange',[0,0,0,0]);
  check('1-1 旁白第一次寫「阿姨（阿鳳）」、之後「阿姨」；對話框照舊「阿姨」；麵店以外不算；已經寫了「阿鳳」的那一句不動；正在演麵店的 2D 事件（人不在麵店）也算',
    S11.includes('旁白第一次寫「阿姨（阿鳳）」，之後寫「阿姨」')&&J(r1)===J(['（阿姨（阿鳳）看了你一眼。）','（阿姨看了你一眼。）','阿姨：坐。'])&&J(r2)===J(['（阿姨看了你一眼。）'])
    &&J(r3)===J(['阿鳳阿姨講了店名的由來。她說她要記下來。','（阿姨（阿鳳）看了你一眼。）'])&&r4.includes('（麵店最裡面那張桌子。阿姨（阿鳳）多拿了兩張椅子過來。）'),J({r1,r2,r3,r4:r4.slice(0,3)})); });
/* 1-2 */
await sec('1-2',async()=>{
  const T12=table(S12), docRows=T12.map(r=>{ if(/YT_AUNT_PHOTO/.test(r[1])){ const m={}; for(const x of r[1].matchAll(/`(\w+)`：「([^」]+)」/g)) m[x[1]]=x[2]; const n=one(/沒有選的：「([^」]+)」/,r[1]); if(n) m.none=n; return {photo:m}; } return {t:qs(r[1])[0]}; });
  const gameRows=LN().aunt.rows.map(r=>r.photo?{photo:r.photo}:{t:r.t}), SH=qs(part('- **規則**','| 時期',S12));
  check('1-2 對稿：表的十二列（照順序）＝aunt.rows；出國回來那一列照 YT_AUNT_PHOTO 的四種；短句三句',T12.length===12&&J(docRows)===J(gameRows)&&SH.length===3&&J(SH)===J(LN().aunt.shorts),J({n:T12.length,SH}));
  const T=k=>(LN().aunt.rows.find(r=>r.k===k)||{}).t;
  /* 每一列在自己的時期：一個新的存檔（沒說過）＝那一列 */
  const CASE=[['y1s1_w1_6',TD('Y1S1',2,2),{}],['y1_customer',TD('Y1S1',8,2),{done:['ev_yutong_customer']}],['y1_fafu',TD('Y1S1',9,2),{done:['ev_yutong_customer','ev_yutong_customer_after']}],
    ['y1s2_w8_9',TD('Y1S2',8,2),{}],['y1s2_rent',TD('Y1S2',11,2),{done:['ev_yutong_landlord']}],['y2s1',TD('Y2S1',3,2),{}],['y2s2_fafu',D('2027-05-25'),{}],
    ['y3s1_lease',TD('Y3S1',13,2),{flags:{RENT_RENEWED:true}}],['y3s2',TD('Y3S2',3,2),{}],['y4s1_23rd',D('2028-12-19'),{}],['y4s2_last',D('2029-06-26'),{}]];
  const R=[]; for(const [k,d,o] of CASE){ fresh(d,18,'noodle',o.flags); for(const id of (o.done||[])) H.G.events.done[id]=1; const s=await aunt(); R.push([k,keyOf(d),J(s)===J(['阿姨：'+T(k)]),s[0]]); }
  check('1-2 十一個時期各自那一句（新的存檔、18:00 在店裡）：大一上第 1～6 週、賠三萬那件以後、那週六法服以後、大一下第 8～9 週、第 10 週以後房東量過、大二上、大二下 5/22 以後、大三上續約以後、大三下、大四上二十三週年以後、最後一頓以後',
    R.every(x=>x[2]),J(R.filter(x=>!x[2])));
  const P=[]; for(const v of ['happy','noodle','you',undefined]){ fresh(D('2029-04-27'),18,'noodle',v?{YT_AUNT_PHOTO:v}:{}); const s=await aunt(); P.push([v||'none',s[0]]); }
  const PH=LN().aunt.rows.find(r=>r.k==='y4s2_back').photo;
  check('1-2 大四下 4/26 起（出國回來）：照 YT_AUNT_PHOTO（4/19 那則的回覆）happy／noodle／you，沒有選的＝「第一次坐飛機。腳一直沒放下來。」',J(P.map(x=>x[1]))===J(['happy','noodle','you','none'].map(k=>'阿姨：'+PH[k])),J(P));
  /* 一天一句、之後短句輪流；隔天沒有新的時期＝短句接著輪；過了時期沒說到的不補 */
  fresh(TD('Y1S1',2,2),18,'noodle'); const a=[]; for(let i=0;i<5;i++) a.push((await aunt())[0]); at(TD('Y1S1',2,3),18); a.push((await aunt())[0]);
  at(TD('Y1S2',8,2),18); a.push((await aunt())[0]); at(TD('Y1S2',8,4),18); a.push((await aunt())[0]);
  const W=['阿姨：'+T('y1s1_w1_6'),'阿姨：坐。','阿姨：老樣子？','阿姨：今天的湯比較鹹，你多喝水。','阿姨：坐。','阿姨：老樣子？','阿姨：'+T('y1s2_w8_9'),'阿姨：今天的湯比較鹹，你多喝水。'];
  fresh(TD('Y1S2',8,2),18,'noodle'); const b=await aunt();
  check('1-2 一天一句新的、說完當天換短句輪流（坐。→老樣子？→今天的湯比較鹹…）；隔天沒有新的＝短句接著輪；到了下一個時期＝那一句；同一個時期的只說一次',J(a)===J(W),J(a));
  check('1-2 過了那個時期沒說到的就不說：大一上沒來過，大一下第 8 週第一次來＝「手沒事。……」（不補大一上那幾句）',J(b)===J(['阿姨：'+T('y1s2_w8_9')]),J(b));
  fresh(TD('Y2S1',3,2),18,'noodle'); H.G.stage='econ'; const c=await aunt();
  check('1-2（子代理解讀）經濟系那一年在店裡：只有短句（表是祐廷在法律系的時期）',J(c)===J(['阿姨：坐。']),J(c)); });
/* 1-3 */
await sec('1-3',async()=>{
  const PAIRS=[...S13.matchAll(/`[^`]+`(?:（[^）]+）)?「([^」]+)」→「([^」]+)」/g)].map(m=>[m[1],m[2]]), DRY=one(/不下雨的那一版：「([^」]+)」/,S13);
  const AT=[['ev_term_last_meal_y1s2'],['ev_term_last_meal_y2s1'],['ev_y4_xmas']];
  const okP=PAIRS.length===3&&PAIRS.every((p,i)=>{ const L=evLines(AT[i][0]); return L.some(x=>x.who==='阿姨'&&x.t===p[1])&&!L.some(x=>x.t===p[0]); });
  const keep=STORY_EVENTS.filter(e=>e&&evLines(e.id).some(x=>x.who==='阿姨'&&/吃好一點/.test(x.t))).map(e=>e.id);
  check('1-3「吃好一點」四處只留第一次（大一上期末 ev_term_last_meal「考完了，吃好一點。」）；大一下期末、大二上期末、大四上期末照稿換（舊句不在）',okP&&J(keep)===J(['ev_term_last_meal'])&&!!DRY,J({PAIRS,keep}));
  fresh(D('2027-01-15'),19,'noodle'); H.G.weather='rain'; const r=await runEv('ev_term_last_meal_y2s1'); fresh(D('2027-01-15'),19,'noodle'); H.G.weather='clear'; const c=await runEv('ev_term_last_meal_y2s1');
  check('1-3 大二上期末：下雨＝「吃完再走。外面在下雨。」、不下雨＝「'+DRY+'」（只出一句）',r.includes('阿姨：'+PAIRS[1][1])&&!r.includes('阿姨：'+DRY)&&c.includes('阿姨：'+DRY)&&!c.includes('阿姨：'+PAIRS[1][1]),J({r:r.filter(x=>/阿姨/.test(x)),c:c.filter(x=>/阿姨/.test(x))}));
  /* 送小菜的旁白八處：第一次照原句，其他照順序換六句，第八處回到第一句（＝燙青菜：子代理解讀）*/
  const SIX=[...part('- **送小菜的旁白**','- 順序照',S13).matchAll(/^\s*\d+\. (（[^）]+）)/mg)].map(m=>m[1]), ORDER=[...part('- 順序照','\n',S13).matchAll(/`([^`]+)`/g)].map(m=>m[1]);
  const PLACE=['ev_term_last_meal','ev_revisit_y1_noodle','ev_term_last_meal_y1s2','ev_term_last_meal_y2s1','ev_r1_jetlag','ev_an_farewell_dinner','ev_vf_y2w_0116','ev_y4_xmas'];   /* 稿的順序（events.js:1525、1698、1873、3814、4634、y34b3d.js:487、vacfill_events.js:96、r2y4a_events.js:390）在遊戲裡是這八個事件 */
  const WANT=[null].concat(SIX,[SIX[0]]), got=PLACE.map((id,i)=>[id,i===0?nar(id,'阿姨多送了一盤小菜。'):nar(id,WANT[i])]);
  const where=SIX.map(s=>[s,STORY_EVENTS.filter(e=>e&&nar(e.id,s)).map(e=>e.id)]);
  const OLDD=['（期末最後一科考完。長桌已經併好了，阿姨多送了一盤小菜。）','（阿姨這次多送了兩盤小菜。）','（阿姨端出一盤小菜，放在正中間，沒說話。）','（九點。阿姨把最後一盤小菜放在長桌中間，說是送的。）','（麵店的長桌。阿姨多煮了一鍋湯，說是送的。）','（長桌只坐了一半。阿姨多送了一盤小菜：「人少，吃多一點。」）','（阿姨把剩下的小菜全部端過來。）'];
  const allT=J(STORY_EVENTS.map(e=>e&&e.dialogue)), left=OLDD.filter(s=>allT.includes(s.slice(1,-1)));
  check('1-3 送小菜的旁白：稿的六句、八處（'+ORDER.length+'）——第一處照原句、第二～七處照順序、第八處回到第一句；每一句只在它那一處（燙青菜：第二處＝重訪日已取消＋第八處）；原本「多送一盤小菜／多煮一鍋湯，說是送的」那七句不在',
    SIX.length===6&&ORDER.length===8&&got.every(x=>x[1])&&J(where.map(x=>x[1]))===J([['ev_revisit_y1_noodle','ev_y4_xmas'],['ev_term_last_meal_y1s2'],['ev_term_last_meal_y2s1'],['ev_r1_jetlag'],['ev_an_farewell_dinner'],['ev_vf_y2w_0116']])&&!left.length,J({got:got.filter(x=>!x[1]),where,left})); });
/* 1-4 */
await sec('1-4',async()=>{
  const NS=quotes(S14), G5=LN().aunt.nameScene.map(([w,t])=>pairDoc(w,t));
  check('1-4 對稿：店名由來五句＝aunt.nameScene；沛珊出遊的旁白「阿鳳阿姨講了店名的由來。她說她要記下來。」照舊',NS.length===5&&J(NS)===J(G5)&&J(REL_LINES).includes('阿鳳阿姨講了店名的由來。她說她要記下來。'),J(NS));
  fresh(TD('Y2S1',3,2),15.5,'noodle'); const b1=await aunt(), f1=H.G.flags.AUNT_NAME, b2=await aunt(); at(TD('Y2S1',3,3),15.5); const b3=await aunt();
  check('1-4 大二上起、15:00～17:00、一個人在店裡：第一次說話＝店名由來五句、記 AUNT_NAME；算今天那一句（之後短句）；隔天照時期（大二上那一句），不再演',
    J(b1)===J(NS)&&f1===TD('Y2S1',3,2)&&J(b2)===J(['阿姨：坐。'])&&J(b3)===J(['阿姨：大二了。……大二也要吃飯。']),J({b1,b2,b3}));
  const no=[]; { fresh(TD('Y2S1',3,2),15.5,'noodle'); E.npcs.push({obj:{position:{x:1,y:0,z:1}},name:'',isExtra:true}); no.push(['店裡有別的客人',await aunt(),H.G.flags.AUNT_NAME]); }
  { fresh(TD('Y1S2',3,2),15.5,'noodle'); no.push(['大一',await aunt(),H.G.flags.AUNT_NAME]); }
  { fresh(TD('Y2S1',3,2),17.2,'noodle'); no.push(['17:12',await aunt(),H.G.flags.AUNT_NAME]); }
  { fresh(TD('Y2S1',3,2),15.5,'noodle',{companion:'an'}); no.push(['帶著以安',await aunt(),H.G.flags.AUNT_NAME]); }
  check('1-4 不演店名由來：店裡有別的客人（店員、阿姨不算）、大一、17:00 以後、有人跟著＝照常一句、不記 AUNT_NAME',no.every(x=>x[1].length===1&&!x[1].some(t=>/店名/.test(t))&&x[2]==null),J(no)); });
/* 1-5 */
await sec('1-5',async()=>{
  const C=(evLines('ev_last_meal_y4').length?ev('ev_last_meal_y4').dialogue:[]).find(l=>l&&l.choice), o=C&&C.choice.find(x=>x.text==='「二十三週年那一張。」');
  check('1-5 最後一頓的選項「二十三週年那一張。」讀 ANNIV23（y34b3d.js 設的；那天在場＝there），不再讀沒有人設的 ANNIVERSARY_23',S15.includes('`ANNIV23`')&&!!o&&J(o.if)===J({flagIs:{ANNIV23:'there'}})&&!SRC('src/data/r2y4b_events.js').includes("flags:['ANNIVERSARY_23']")&&/ANNIV23:'there'/.test(SRC('src/y34b3d.js')),J(o&&o.if));
  check('1-5 遊戲沒有麵店打工（JOB_NOODLE）：宿舍期滿那一段（阿姨「暑假你還要來的話，週二一樣。」）、語彤事件 13 那一句（「……你週二來切蔥，週四來陪我發呆。很忙喔。」）都刪掉；不再寫 JOB_NOODLE_SUMMER',
    S15.includes('遊戲沒有麵店打工')&&!SRC('src/story3d.js').includes('暑假你還要來的話')&&!J(R2Y3A_EVENTS).includes('你週二來切蔥')&&!/JOB_NOODLE_SUMMER\s*=/.test(SRC('src/story3d.js'))&&!/\bJOB_NOODLE\b/.test(SRC('src/data/r2y3a_events.js').replace(/\/\*[\s\S]*?\*\//g,'')));
  let want=null; try{ want=JSON.parse(one(/改成 `(\['阿鳳麵店'[^`]+\])`/,S15).replace(/'/g,'"')); }catch(e){}
  const row=STORY.MX_FM1.rows.find(r=>r[0]==='阿鳳麵店');
  check('1-5 公館一百元清單（明軒）阿鳳麵店那一列＝稿上「改成」的四格（不再是「乾麵＋餛飩湯 85」）',!!want&&J(row)===J(want)&&!J(STORY.MX_FM1).includes('乾麵＋餛飩湯'),J({want,row})); });

/* ===================== 2 陳助教（陳冠廷）===================== */
await sec('2-1',async()=>{
  const T=CHARACTERS.npc_ta_chen.tagByPY, Y=['碩二','碩三','碩四'];
  check('2-1 年級：2025 碩二、2026 碩三、2027 碩四、2028-09 起法研所博士班（characters.js tagByPY 照祐廷的學年）；畢業以後 PG_TAG「法研所博士班」',
    S21.includes('2025 碩二、2026 碩三、2027 碩四')&&S21.includes('2028-09 起法研所博士班')&&T[0]==null&&Y.every((y,i)=>T[i+1]==='法研所（刑事法組）・'+y)&&T[4]==='法研所博士班'&&J(SOCIAL.PG_TAG.npc_ta_chen)===J([['2029-09-01','法研所博士班']]),J({T,pg:SOCIAL.PG_TAG.npc_ta_chen}));
  const all=J(SMALLTALK)+J(POOL_STORY_B2)+J(LN().ta);
  check('2-1 他的論文卡在第五章：不再用「第三章」（閒聊、別人說起他：pool_story_b2「冠廷學長在寫論文的第五章。他說不要問第六章。」；第四章跟著換第六章＝子代理解讀）',
    S21.includes('他的論文卡在**第五章**')&&!/冠廷學長在寫論文的第三章|論文寫到第三章/.test(all)&&J(POOL_STORY_B2).includes('「冠廷學長在寫論文的第五章。他說不要問第六章。」'),''); });
await sec('2-2',async()=>{
  const T22=table(S22), Y={}; T22.forEach((r,i)=>{ Y[i+1]=qs(r[1]); }); const NOSIS=one(/換成「([^」]+)」/,part('- 「我口試那天',null,S22));
  check('2-2 對稿：四個學年各兩句＝ta.years；不認識學姊的那一句＝ta.noSis；取代 events.js 原本那兩句（SMALLTALK.npc_ta_chen 空了，原本「論文寫到第三章…」不在）',
    T22.length===4&&J(Y)===J(LN().ta.years)&&NOSIS===LN().ta.noSis&&J(SMALLTALK.npc_ta_chen)==='[]',J({Y,NOSIS}));
  fresh('2025-10-07',15,'campus'); H.FAMILIAR('npc_ta_chen'); const s=[]; for(let i=0;i<6;i++){ at(D('2025-10-07')+i,15); s.push(small('npc_ta_chen')); if(i===0) s.push(small('npc_ta_chen')); }
  const Q=t=>'「'+t+'」', WX='（陳助教跟你打了個招呼，聊了兩句天氣。）', AG='（陳助教跟你打了個招呼，又忙自己的事。）', y1=LN().ta.years[1];
  check('2-2 一年兩句照順序、一天一句（同一天第二次＝照舊「又忙自己的事」）；用完那一年＝和「聊了兩句天氣」交替（天氣、一句、天氣、另一句）',
    J(s)===J([Q(y1[0]),AG,Q(y1[1]),WX,Q(y1[0]),WX,Q(y1[1])]),J(s));
  const yr=[]; for(const [k,y] of [['2026-10-07',2],['2027-10-07',3]]){ fresh(k,15,'campus'); H.FAMILIAR('npc_ta_chen'); const a=small('npc_ta_chen'); at(D(k)+1,15); yr.push([y,a,small('npc_ta_chen')]); }
  fresh('2028-10-02',15,'campus'); H.FAMILIAR('npc_ta_chen'); const n1=small('npc_ta_chen'); at(D('2028-10-03'),15); const n2=small('npc_ta_chen');
  fresh('2028-10-02',15,'campus'); H.FAMILIAR('npc_ta_chen'); H.FAMILIAR('heroine_05'); small('npc_ta_chen'); at(D('2028-10-03'),15); const n3=small('npc_ta_chen');
  check('2-2 大二、大三各兩句（大三第二句「六月口試。……」）；大四以後「博士班第一年。……」，第二句認識學姊＝「我口試那天，書瑀坐在最後一排。…」、不認識＝換「口試那天，我講到一半忘了第二點。…」',
    J(yr)===J([[2,Q(LN().ta.years[2][0]),Q(LN().ta.years[2][1])],[3,Q(LN().ta.years[3][0]),Q(LN().ta.years[3][1])]])&&n1===Q(LN().ta.years[4][0])&&n2===Q(LN().ta.noSis)&&n3===Q(LN().ta.years[4][1]),J({yr,n1,n2,n3})); });
await sec('2-3',async()=>{
  const PASS=quotes(part('- 6/20 當天','- 2028-06-20 學姊',S23));
  check('2-3 對稿：6/20 21:00 他的私訊兩則＝ta.pass（「陳助教：」）；不用回',PASS.length===2&&J(PASS)===J(LN().ta.pass.map(t=>'陳助教：'+t))&&S23.includes('不用回'),J(PASS));
  fresh('2028-06-20',20,'dorm'); H.FAMILIAR('npc_ta_chen'); ph(); const m0=txt('p:npc_ta_chen').length; phAt('2028-06-20',21.1); const M=TH('p:npc_ta_chen');
  fresh('2028-06-20',20,'dorm'); phAt('2028-06-20',21.1); const m2=txt('p:npc_ta_chen').length;
  check('2-3 2028-06-20 21:00 認識他的人收到「過了。」「委員說第五章可以再寫一年。我說不要。」（20:00 還沒有；沒有選項）；不認識他＝沒有',m0===0&&J(M.map(m=>m.text))===J(LN().ta.pass)&&M.every(m=>!m.ask)&&m2===0,J({m0,M:M.map(m=>m.text),m2}));
  fresh('2028-06-16',19,'gongguan',{met_sis:true}); const ids=HCIRCLE.rowsIn(H.G,'gongguan').map(r=>r.id), r=HCIRCLE.row('c519_2_3'); fresh('2028-06-23',19,'gongguan',{met_sis:true}); const ids2=HCIRCLE.rowsIn(H.G,'gongguan').map(r=>r.id);
  check('2-3 6/16（五）週五公館和學姊吃飯那一列（c519_2_3）那天成立、走近聽到稿上那四句；學期的那一列（c508_5_2）那天沒有；下週五沒有',
    !!r&&ids.includes('c519_2_3')&&!ids.includes('c508_5_2')&&!ids2.includes('c519_2_3')&&J(r.lines.map(l=>l.label+'：'+l.t))===J(quotes(part('- 6/16','- 6/20',S23))),J({ids,ids2})); });

/* ===================== 3 兩點半 Café ===================== */
await sec('3-1',async()=>{
  const T31=table(S31), docR=T31.map(r=>qs(r[1])[0]), SH=qs(part('之後短句輪流：','| 時期',S31)), NS=quotes(part('- 店名由來','- 3D 可以跟他說話',S31));
  check('3-1 對稿：老闆的表六列（照順序）＝cafe.rows、短句三句、店名由來兩句；大一上「……我沒看白板。」（圈子表）照舊',T31.length===6&&J(docR)===J(LN().cafe.rows.map(r=>r.t))&&J(SH)===J(LN().cafe.shorts)&&J(NS)===J(LN().cafe.nameScene.map(([w,t])=>pairDoc(w,t)))&&/……我沒看白板。/.test((HCIRCLE.row('c503_5_2')||{}).heard||''),J({docR,SH,NS}));
  fresh('2025-10-07',15,'cafe'); const ck=populate('cafe'), sp=built.find(s=>s&&s.id==='clerk_cafe')||null;
  check('3-1 3D：Café 櫃台（芷若不在班）＝老闆（spec 用 hc_boss：男、'+((HCIRCLE.PEOPLE.hc_boss||{}).model)+'、馬克杯），不再用年輕女性路人；名字「老闆」、能說話',
    !!ck&&!!sp&&sp.sex==='m'&&sp.model===HCIRCLE.PEOPLE.hc_boss.model&&(sp.props||[]).includes('mug')&&ck.name==='老闆'&&ck.talkLabel==='和老闆說話'&&ck.yieldIt===true,J({sp:sp&&{sex:sp.sex,model:sp.model,props:sp.props}}));
  const R=LN().cafe.rows, T=k=>'老闆：'+R.find(r=>r.k===k).t, s=[];
  fresh('2025-10-07',15,'cafe'); s.push((await boss())[0],(await boss())[0],(await boss())[0],(await boss())[0]); H.FAMILIAR('heroine_02'); at(D('2025-10-08'),15); s.push((await boss())[0]);
  check('3-1 大一：一天一句新的（「豆子我自己烘。…」）、之後短句輪流（今天的豆子比較酸。→坐窗邊…→……嗯。）；見過芷若以後隔天＝「芷若比我早記住客人的名字。…」',
    J(s)===J([T('y1'),'老闆：今天的豆子比較酸。','老闆：坐窗邊，那裡光好。','老闆：……嗯。',T('y1_zr')]),J(s));
  const y=[]; fresh('2026-10-07',15,'cafe'); y.push((await boss())[0]); fresh('2027-06-10',15,'cafe'); y.push((await boss())[0]); at(D('2027-06-11'),15); y.push((await boss())[0]);
  fresh('2027-10-07',15,'cafe'); y.push((await boss())[0]); fresh('2029-09-10',15,'cafe'); y.push((await boss())[0]);
  check('3-1 大二「拉花比賽，我贏了。…」、大二下 2027-06 芷若去英國以後「她的班，我排給小婷。…」（同一年先說大二那句）、大三「店開第十年了。…」、2029-09 芷若回來以後「她回來上班第一天…」',
    J(y)===J([T('y2'),T('y2'),T('y2s2_uk'),T('y3'),T('pg_back')]),J(y));
  fresh('2025-10-07',15,'cafe'); H.G.eat={n:{'兩點半 Café':3},last:{},l5:{}}; const n1=await boss(), c1=X().rec(H.G).cafeName, n2=await boss(); at(D('2025-10-08'),15); const n3=await boss();
  fresh('2025-10-07',15,'cafe'); H.G.eat={n:{'兩點半 Café':2},last:{},l5:{}}; const n4=await boss();
  check('3-1 店名由來：點餐第 3 次以後，第一次和老闆說話＝那兩句（算今天那一句、之後短句；只一次）；點兩次還沒有',J(n1)===J(NS)&&c1===D('2025-10-07')&&J(n2)===J(['老闆：今天的豆子比較酸。'])&&n3.length===1&&!/兩點半？/.test(n3[0])&&J(n4)===J([T('y1')]),J({n1,n2,n3,n4})); });
await sec('3-2',async()=>{
  const M={}; for(const m of S32.matchAll(/- (第一班|沒去|放假|出國回來|離職)：「([^」]+)」/g)) M[m[1]]=m[2];
  const W=WZ_JOBS_DATA, g={第一班:(W.first.cafe||[])[0], 沒去:((W.x.cafe.miss||[])[0]||[])[0], 放假:W.brk.cafe&&W.brk.cafe.dm, 出國回來:((W.back.cafe||{}).lines||[])[0], 離職:(W.quitLines||{}).cafe};
  check('3-2 對稿：Café 打工五句（第一班、沒去、放假、出國回來、離職；說話的人老闆）＝wz_jobs.js；拉花那一場四句＝cafe.latte',Object.keys(M).length===5&&J(g)===J({第一班:['老闆',M.第一班],沒去:['老闆',M.沒去],放假:M.放假,出國回來:['老闆',M.出國回來],離職:M.離職})
    &&J(quotes(part('- 打工第 4 班以後','- 記 `CAFE_LATTE_TRY`',S32)))===J(LN().cafe.latte.map(([w,t])=>pairDoc(w,t))),J({M,g}));
  const hire=(o)=>{ const J0=JOBS.rec(H.G); J0.cafe=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:[4,6],shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0.cafe; };
  const shift=async(d)=>{ const h0=JOBS.hrs('cafe',d)[0]; at(d,h0-0.1,'cafe'); H.said=[]; H.opts=[]; H.picks=[]; await JOBS.runShift(GM,'cafe'); return said(); };
  const d0=TD('Y1S2',3,6); fresh(d0,14,'cafe'); hire(); const s1=await shift(d0), i1=s1.indexOf('老闆：'+M.第一班);
  const j=JOBS.job(H.G,'cafe'); j.missPend=true; const s2=await shift(d0+7);
  const L5=[]; let at4=null; for(let w=2;w<=6&&at4==null;w++){ const s=await shift(d0+7*w); if(s.includes('老闆：拉一個。')) at4=JOBS.job(H.G,'cafe').shifts; L5.push(s.filter(x=>/拉一個|奶壺|一坨/.test(x)).length); }
  const s6=await shift(d0+7*8), LT=LN().cafe.latte.map(([w,t])=>pairDoc(w,t));
  check('3-2 第一班開頭＝老闆「圍裙在後面。先洗杯子，洗一個禮拜。」（第二班沒有）；上次沒去＝下一班開頭老闆「昨天沒來。下次先講。」',i1===0&&!s2.includes('老闆：'+M.第一班)&&s2[0]==='老闆：'+M.沒去,J({s1:s1.slice(0,2),s2:s2.slice(0,2)}));
  check('3-2 打工第 4 班以後打烊時一次（不用芷若在班）：拉花四句、記 CAFE_LATTE_TRY；之後不再演',at4!=null&&at4>=4&&H.G.flags.CAFE_LATTE_TRY!=null&&!s6.some(x=>/拉一個/.test(x))&&L5.filter(n=>n>0).length===1,J({at4,L5,flag:H.G.flags.CAFE_LATTE_TRY}));
  /* 放假：放假第一天 12:00 老闆私訊一句（不問來不來）、這個假照舊先停 */
  fresh(TD('Y1S2',16,1),10,'dorm'); hire({shifts:2}); let b=null, d=H.G.day; for(;d<H.G.day+40&&!b;d++) b=JOBS.breakAt(H.G,d); at(b.from,12.5); JOBS.phone(H.G); PHONE.tick(H.G);
  const dm=(H.G.msgs||[]).filter(m=>m.text===M.放假), jb=JOBS.job(H.G,'cafe');
  check('3-2 放假：放假第一天 12:00 老闆私訊「'+M.放假+'」（沒有選項）、這個假先停',dm.length===1&&!dm[0].ask&&jb.brk[b.key]==='stop',J({b:b&&b.key,dm:dm.length,brk:jb.brk}));
  /* 出國回來：第一次走進店裡＝老闆一句；「先不了。」＝離職那一句 */
  fresh(TD('Y2S1',3,2),15,'cafe'); hire({shifts:3,back:true}); H.said=[]; H.picks=['「先不了。」']; await JOBS.onEnter(GM,'cafe'); const s7=said();
  fresh(TD('Y2S1',3,2),15,'cafe'); hire({shifts:3}); H.said=[]; await JOBS.quit(GM,'cafe'); const s8=said();
  check('3-2 出國回來第一次走進店裡＝老闆「回來了。杯子還是你洗。」，「先不了。」＝「好。……告示我再貼回去。」；離職＝「好。……告示我再貼回去。」（不是「有空回來看看」）',
    s7[0]==='老闆：'+M.出國回來&&s7.includes('老闆：'+M.離職)&&s8.includes('老闆：'+M.離職)&&!s8.some(x=>/有空回來看看/.test(x)),J({s7,s8})); });
await sec('3-3',async()=>{
  const L5=one(/第 5 次：「([^」]+)」/,S33), SAME=one(/之後「老樣子」：「([^」]+)」/,S33);
  fresh('2027-06-01',15,'cafe'); H.FAMILIAR('heroine_02'); const a=EAT.staffOn(GM,'兩點半 Café'); at(D('2027-06-10'),15); const b=EAT.staffOn(GM,'兩點半 Café'), nm=EAT.staffName(H.G,'兩點半 Café',b);
  check('3-3 2027-06-04 起點餐那兩句的名字照現有是小婷、字換成她自己的（第 5 次「'+L5+'」、之後老樣子「'+SAME+'」）；6/4 以前照舊',!!a&&!!b&&b.line5===L5&&b.same===SAME&&a.line5!==L5&&a.same!==SAME&&nm==='小婷',J({a:a&&[a.line5,a.same],b:b&&[b.line5,b.same],nm}));
  /* 別人說起芷若：原本 heard_lines.js 擋住的小婷三句、小禾四句（AA_504～AA_509 那幾份稿的原句）*/
  const PATH={AA_504:'docs/story_planning/AA_504_女主角自己的生活_大一下與暑假.md',AA_505:'docs/story_planning/AA_505_女主角自己的生活_大二上與寒假.md',AA_506:'docs/story_planning/AA_506_女主角自己的生活_大二下與暑假.md',
    AA_507:'docs/story_planning/AA_507_女主角自己的生活_大三上與寒假.md',AA_508:'docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md',AA_509:'docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md'};
  const SRCS=HEARD_LINES.src, cache={}, docOf=k=>cache[k]!=null?cache[k]:(cache[k]=gitShow(SRCS[k],PATH[k])), HE=LN().cafe.heard;
  /* AA_507 那一句：AA_509 0-2 把「問店裡的貓」改「問公園的貓」（src 寫了 AA_509 0-2）——照 AA_507 原句換這三個字，AA_509 上要有這一條 */
  const fix509=e=>/AA_509 0-2/.test(e.src||'')?(docOf('AA_509').includes('「問店裡的貓」改「問公園的貓」')?e.t.split('公園的貓').join('店裡的貓'):null):e.t;
  const badH=HE.filter(e=>{ const ks=[...(e.src||'').matchAll(/AA_50\d/g)].map(m=>m[0]), t=fix509(e); return !t||!ks.length||!ks.some(k=>docOf(k).includes(t)); });
  check('3-3 別人說起芷若七句（小婷三句、小禾四句）每一句都在它那一份稿裡（git show heard_lines.js 的 src 版本）；稿上說「照原稿接上」',HE.length===7&&HE.filter(e=>e.who==='小婷').length===3&&HE.filter(e=>e.who==='小禾').length===4&&!badH.length&&S33.includes('照原稿接上'),J(badH.map(e=>e.id)));
  /* 點餐以後一句：要認識芷若；說的人在（6/4 以前：圈子那一列的小婷在店裡；之後：芷若不在班）；一天一句、每句一次；時間照 from／until */
  const fri=TD('Y1S2',8,5); fresh(fri,19.5,'cafe'); H.FAMILIAR('heroine_02'); GM.npc.hc_xt={id:'hc_xt',obj:{position:{x:-1,y:0,z:-5}}}; H.said=[]; await X().cafeAfterOrder(GM); const h1=said(); H.said=[]; await X().cafeAfterOrder(GM); const h2=said();
  at(fri+1,19.5); delete GM.npc.hc_xt; H.said=[]; await X().cafeAfterOrder(GM); const h3=said();
  fresh(TD('Y1S2',5,5),19.5,'cafe'); H.FAMILIAR('heroine_02'); GM.npc.hc_xt={id:'hc_xt',obj:{position:{x:-1,y:0,z:-5}}}; H.said=[]; await X().cafeAfterOrder(GM); const h4=said();
  fresh(fri,19.5,'cafe'); GM.npc.hc_xt={id:'hc_xt',obj:{position:{x:-1,y:0,z:-5}}}; H.said=[]; await X().cafeAfterOrder(GM); const h5=said();
  check('3-3 大一下第 7 週起（AA_504）：認識芷若、小婷在店裡＝點餐以後小婷一句；同一天不再；小婷不在＝沒有；第 7 週以前沒有；不認識芷若沒有',
    J(h1)===J(['小婷：'+HE[0].t])&&!h2.length&&!h3.length&&!h4.length&&!h5.length,J({h1,h2,h3,h4,h5}));
  /* 3-4：芷若走以後第一次點餐＝小婷「她叫小禾。……」，之後照 from 一天一句 */
  const NP=quotes(S34);
  fresh('2027-06-10',15,'cafe'); H.FAMILIAR('heroine_02'); const o=[]; for(let i=0;i<4;i++){ at(D('2027-06-10')+i,15); H.said=[]; await X().cafeAfterOrder(GM); o.push(said()); }
  check('3-4 對稿「小婷：她叫小禾。……不要再叫新來的了。」；2027-06-04 起第一次在 Café 點餐＝這一句；隔天起小婷「學姊把吧檯的抽屜整理好了。…」、小禾「學姊現在來當客人。…」（芷若不在班＝她們在櫃台），說完就沒有',
    J(NP)===J([pairDoc(LN().cafe.npIntro[0],LN().cafe.npIntro[1])])&&J(o)===J([[NP[0]],['小婷：'+HE[2].t],['小禾：'+HE[3].t],[]]),J(o));
  fresh('2027-06-10',15,'cafe'); H.FAMILIAR('heroine_02'); X().rec(H.G).npIntro=1; GM.npc.heroine_02={id:'heroine_02',staff:'cafe',obj:{position:{x:-2.5,y:0,z:-5.15}}}; H.said=[]; await X().cafeAfterOrder(GM); const z=said();
  check('3-3 芷若在班（她站吧檯）＝小婷、小禾不在櫃台＝沒有那一句',!z.length,J(z));
  /* 3-4 名字：圈子、對話框 2027-06-04 起「小禾」，以前「新來的工讀生」；AA_508 2-1 那兩列的說話人改小禾 */
  fresh('2027-05-20',15,'cafe'); const w1=HCIRCLE.who(GM,{id:'hc_np',label:'新來的工讀生'}); at(D('2027-06-10'),15); const w2=HCIRCLE.who(GM,{id:'hc_np',label:'新來的工讀生'});
  const n={id:'hc_np',name:'新來的工讀生'}; X().afterSpawnLabel(GM,'hc_np',n);
  check('3-4 新來的工讀生：2026-09～2027-06 照舊「新來的工讀生」、2027-06-04 起圈子和對話框都叫「小禾」（HCIRCLE.who、3D 名字）；heroine_circle.js 那兩列（c508_2_1、c508_2_2）說話人「小禾」',
    w1==='新來的工讀生'&&w2==='小禾'&&n.name==='小禾'&&['c508_2_1','c508_2_2'].every(id=>/^小禾：/.test(HCIRCLE.row(id).heard)&&!/新來的工讀生/.test(HCIRCLE.row(id).heard))&&S34.includes('2027-06-04 起'),J({w1,w2,n:n.name})); });

/* ===================== 4 黃筱涵 ===================== */
await sec('4-1',async()=>{
  const T41=table(S41), Y={}; T41.forEach((r,i)=>{ Y[i+1]=qs(r[1]); }); const TIRED=one(/「(語彤最近很累，你有注意到嗎？)」只在大一、大二出/,S41), PGT=one(/`PG_TAG`：2029-09 起「([^」]+)」/,S41);
  check('4-1 對稿：四個學年各兩句＝hxh.years；「語彤最近很累」＝hxh.tired；PG_TAG 2029-09 起「臨床心理所」；取代 events.js 原本那一句（SMALLTALK.npc_huangxh 空了）',
    T41.length===4&&J(Y)===J(LN().hxh.years)&&TIRED===LN().hxh.tired&&J(SOCIAL.PG_TAG.npc_huangxh)===J([['2029-09-01',PGT]])&&J(SMALLTALK.npc_huangxh)==='[]',J({Y,TIRED,PGT}));
  const run=(k,n,yt)=>{ fresh(k,15,'campus'); H.FAMILIAR('npc_huangxh'); if(yt) H.FAMILIAR('heroine_03'); const s=[]; for(let i=0;i<n;i++){ at(D(k)+i,15); s.push(small('npc_huangxh')); } return s; };
  const Q=t=>'「'+t+'」', WX='（黃筱涵跟你打了個招呼，聊了兩句天氣。）', Yy=LN().hxh.years;
  const a=run('2025-10-07',4,true), b=run('2025-10-07',3,false), c=run('2027-10-07',3,true), d=run('2027-10-07',2,false), e=run('2028-10-07',2,true);
  check('4-1 大一（認識語彤）：兩句、再「語彤最近很累…」、再天氣；不認識語彤沒有那一句；大三（認識語彤）第二句「語彤最近比較好了。…」、不認識＝只有第一句再天氣；大四兩句（「很累」大三起不出）',
    J(a)===J([Q(Yy[1][0]),Q(Yy[1][1]),Q(LN().hxh.tired),WX])&&J(b)===J([Q(Yy[1][0]),Q(Yy[1][1]),WX])&&J(c)===J([Q(Yy[3][0]),Q(Yy[3][1]),WX])&&J(d)===J([Q(Yy[3][0]),WX])&&J(e)===J([Q(Yy[4][0]),Q(Yy[4][1])]),J({a,b,c,d,e})); });
await sec('4-2',async()=>{
  const ASK=quotes(part('週一 21:00 她私訊','- 「好。」',S42)), YES=one(/- 「(好。)」→ 週四 15:00 心理系實驗室/,S42), NO=one(/- 「(那天不行。)」→「/,S42), NOR=one(/- 「那天不行。」→「([^」]+)」/,S42);
  const SC=quotes(part('- 2D：','- 選項',S42)), OP=[...part('- 選項','- 記 `HXH_SUBJECT`',S42).matchAll(/^\s*- (「[^」]+」)→\s*\n\s*>\s*(.+)$/mg)].map(m=>[m[1],m[2].trim()]), HX=LN().hxh;
  check('4-2 對稿：私訊、「好。」「那天不行。」→「好。下一個。」、2D 五句、兩個選項和她的回答、人物頁「當過她的受試者」',J(ASK)===J(['黃筱涵：'+HX.ask])&&YES===HX.yes&&NO===HX.no&&NOR===HX.noReply
    &&J(SC)===J(HX.scene.map(([w,t])=>pairDoc(w,t,NM)))&&J(OP)===J(HX.opts.map(o=>[o.t,pairDoc(o.say[0][0],o.say[0][1],NM)]))&&S42.includes('人物頁「'+HX.mem+'」'),J({ASK,SC,OP}));
  const mon=TD('Y2S1',8,1), setup=(o)=>{ o=o||{}; fresh(mon-1,20,'dorm'); if(o.fam!==false) H.FAMILIAR('npc_huangxh'); if(o.contact!==false) INV.addContact(H.G,'npc_huangxh'); ph(); const m0=txt('p:npc_huangxh').length; phAt(mon,21.1); return m0; };
  const m0=setup(), M=TH('p:npc_huangxh'), m=M[0];
  check('4-2 大二上第 8 週週一 21:00（有點熟、有她的聯絡方式）她私訊一則、兩個選項（前一天沒有）',m0===0&&M.length===1&&m.text===HX.ask&&!!m.ask&&J(m.ask.opts.map(x=>x.t))===J([HX.yes,HX.no]),J(M.map(x=>x.text)));
  PHONE.answer(H.G,X().HXH_ASK,0); ph(); const q=OUT.get(H.G,X().HXH_OUT);
  check('4-2「好。」＝週四 15:00 心理系實驗室（2D、出遊 0.5 小時）',!!q&&q.day===mon+3&&q.h===15&&q.place==='心理系實驗室'&&(ev('ev_hxh_subject')||{}).hours===0.5,J(q));
  const s1=await goOut(X().HXH_OUT,['剩下四個']).then(()=>said()), o1=H.opts[0], f1=H.G.flags.HXH_SUBJECT, mem=SOCIAL.has('npc_huangxh','HXH_SUBJECT');
  check('4-2 2D：五句、兩個選項；「剩下四個呢？」＝「我自己在總圖門口問的。……被拒絕了二十幾次。」；記 HXH_SUBJECT、人物頁「當過她的受試者」',
    J(s1)===J(SC.concat([OP[0][1]]))&&J(o1)===J(OP.map(x=>x[0]))&&f1===true&&mem&&SOCIAL.MEMORY_LABEL.HXH_SUBJECT===HX.mem,J({s1,o1}));
  setup(); PHONE.answer(H.G,X().HXH_ASK,0); ph(); const s2=await goOut(X().HXH_OUT,['阿姨也幫忙']).then(()=>said());
  check('4-2「阿姨也幫忙？」＝「她說：「坐著按按鈕而已，又不是捐血。」然後押著客人來。」',s2[s2.length-1]===OP[1][1],J(s2.slice(-1)));
  setup(); PHONE.answer(H.G,X().HXH_ASK,1); PHONE.tick(H.G); ph(); const r=txt('p:npc_huangxh'), q2=OUT.get(H.G,X().HXH_OUT);
  const nf=setup({fam:false}), n1=txt('p:npc_huangxh').length; const nc=setup({contact:false}), n2=txt('p:npc_huangxh').length;
  fresh(TD('Y2S1',13,1),20,'dorm'); H.FAMILIAR('npc_huangxh'); INV.addContact(H.G,'npc_huangxh'); phAt(TD('Y2S1',13,1),21.1); const n3=txt('p:npc_huangxh').length;
  fresh(mon,20,'dorm'); H.FAMILIAR('npc_huangxh'); INV.addContact(H.G,'npc_huangxh'); phAt(mon,21.1); phAt(mon+7,21.1); const n4=txt('p:npc_huangxh').length;
  check('4-2「那天不行。」＝她回「好。下一個。」、沒有出遊；不熟、沒有聯絡方式、第 13 週＝沒有；只問一次（第 9 週不再問）',r[r.length-1]===HX.noReply&&!q2&&nf===0&&n1===0&&nc===0&&n2===0&&n3===0&&n4===1,J({r,n1,n2,n3,n4})); });

/* ===================== 5 阿凱（大二以後）===================== */
await sec('5-1',async()=>{
  const T51=table(S51), K5={}; for(const m of (T51.find(r=>/KAI_K5/.test(r[1]))||['',''])[1].matchAll(/`(\w+)`：「([^」]+)」/g)) K5[m[1]]=m[2];
  const docR=T51.map(r=>/KAI_K5/.test(r[1])?{k5:K5}:{t:qs(r[1])[0]}), gameR=LN().kai.rows.map(r=>r.k5?{k5:r.k5}:{t:r.t}), SH=qs(part('之後短句：','| 時期',S51));
  check('5-1 對稿：表七列（照順序；K5 以後照 KAI_K5 五種）＝kai.rows；短句兩句',T51.length===7&&J(docR)===J(gameR)&&J(SH)===J(LN().kai.shorts),J({SH}));
  const e0=CHARACTERS.kai.daily_schedule[0];
  check('5-1 作息：大二下～大四下每學期週五 17:00～18:00 在校園（資工系館前＝醉月湖南岸那張長椅，抱著筆電坐著；放在作息最前面）；大二上照現有和子晴同框（不另外排）',
    !!e0&&e0.aa519===true&&J(e0.days)===J([5])&&e0.from===17&&e0.to===18&&e0.zone==='campus'&&e0.act==='sit'&&J(e0.terms)===J(['Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'])&&e0.label==='資工系館前',J(e0));
  const atCs=[]; for(const [t,w,wd,h,z] of [['Y2S1',3,5,17.1,'campus'],['Y2S1',2,5,17.1,'campus'],['Y2S1',16,5,17.1,'campus'],['Y2S2',3,5,17.5,'campus'],['Y4S2',3,5,17.9,'campus'],['Y3S1',3,4,17.5,'campus'],['Y3S1',3,5,18,'campus'],['Y3S1',3,5,17.5,'cafe']]){
    fresh(TD(t,w,wd),h,z); atCs.push(X().kaiAtCs(H.G)); }
  check('5-1 資工系館前那一個小時：大二上第 3～15 週週五、大二下～大四週五 17:00～18:00 在校園＝是；第 2 週、第 16 週、週四、18:00、不在校園＝不是',J(atCs)===J([true,false,false,true,true,false,false,false]),J(atCs));
  const R=LN().kai.rows, T=k=>'「'+R.find(r=>r.k===k).t+'」', s=[];
  const one5=(t,w,fl,mem)=>{ fresh(TD(t,w,5),17.1,'campus',fl); H.FAMILIAR('kai'); if(mem) SOCIAL.remember('kai',mem,''); return small('kai'); };
  s.push(one5('Y2S1',5),one5('Y2S2',3,{},'KAI_BOT'),one5('Y2S2',3),one5('Y3S1',3),one5('Y3S2',3),one5('Y4S1',3),one5('Y4S2',3));
  check('5-1 照時期：大二上「新室友十點就睡…」、大二下有 KAI_BOT「我的作業會頂嘴了…」（沒有＝短句）、大三上、大三下、大四上 K5 以前「公司九點上班…」、大四下「名單第二行，是我…」',
    J(s)===J([T('y2s1'),T('y2s2_bot'),'「吃了嗎。」',T('y3s1'),T('y3s2'),T('y4s1_pre'),T('y4s2')]),J(s));
  const k5=R.find(r=>r.k==='y4s1_k5').k5, v=[]; for(const f of ['write','bug','company','awake','none',null]){ fresh('2028-11-24',17.1,'campus',f?{KAI_K5:f}:{}); H.FAMILIAR('kai'); v.push(small('kai')); }
  fresh('2028-11-24',17.1,'campus',{KAI_K5:'bug'}); H.FAMILIAR('kai'); const w=[small('kai'),small('kai'),small('kai')];
  check('5-1 大四上 K5（2028-11-22）以後照 KAI_K5：write／bug／company／awake／none（沒回）五句；當天之後短句「吃了嗎。」「我在等 build。」輪流',
    J(v)===J(['write','bug','company','awake','none','none'].map(k=>'「'+k5[k]+'」'))&&J(w)===J(['「'+k5.bug+'」','「吃了嗎。」','「我在等 build。」']),J({v,w}));
  fresh(TD('Y3S1',3,4),15,'campus'); H.FAMILIAR('kai'); const o=small('kai');
  check('5-1 不在資工系館前那一個小時：照原本的閒聊（不是這張表）',!Object.values(LN().kai.rows).some(r=>r.t&&o==='「'+r.t+'」'),J(o)); });
await sec('5-2',async()=>{
  const NEW=qs(part('大二下起換成這三句輪：','- 「新室友」那句',S52)), ROOM=one(/第二次起換「([^」]+)」/,S52);
  const L=(ev('ev_kai_sunday_supper')||{dialogue:[]}).dialogue.find(l=>l&&l.pick&&l.pick.flag==='KAI_SUP_LINE'), seq=(key,n,fl)=>{ fresh(key,23,'dorm',fl); const out=[]; for(let i=1;i<=n;i++){ H.G.flags.KAI_SUP_N=i; out.push(L.pick.from(H.G)[0]); } return out; };
  const a=seq(TD('Y2S1',5,7),6), b=seq('2027-01-24',2), c=seq(TD('Y2S2',3,7),4), d=seq(TD('Y3S1',3,7),1);
  check('5-2 大二上照舊三句輪，「新室友說我話很多。……真的很多嗎？」只出一次、第二次起「我說話很多，他說還好。」（寒假算大二上）；大二下起換三句新的輪',
    NEW.length===3&&!!ROOM&&J(a)===J(['今天我多夾了一顆貢丸。','新室友說我話很多。……真的很多嗎？','這週你們考什麼？……算了，先吃。','今天我多夾了一顆貢丸。',ROOM,'這週你們考什麼？……算了，先吃。'])
    &&J(b)===J(['今天我多夾了一顆貢丸。','新室友說我話很多。……真的很多嗎？'])&&J(c)===J(NEW.concat([NEW[0]]))&&J(d)===J([NEW[0]]),J({a,b,c,d})); });
await sec('5-3',async()=>{
  const y2=S53.match(/大二（[^）]+）「([^」]+)」→「([^」]+)」/), y3=S53.match(/大三（[^）]+）「([^」]+)」→「([^」]+)」/);
  const t2=evLines('ev_y2_typhoon_kai').map(x=>x.t).join('|'), t3=evLines('ev_typhoon_y3_noodle').map(x=>x.t).join('|');
  check('5-3 颱風夜：大一照原句；大二「…手上這次是一袋滷味。」、大三「…手上兩杯熱豆漿。……泡麵，他說他不想再吃了。」（舊的「抱著一箱泡麵站在門口」不在）',
    !!y2&&!!y3&&t2.includes(y2[2])&&!t2.includes(y2[1])&&t3.includes(y3[2])&&!t3.includes(y3[1]),J({y2:y2&&y2.slice(1),y3:y3&&y3.slice(1)})); });
await sec('5-4',async()=>{
  const TE=one(/→「(八月想回宜蘭，待久一點。)」/,S54), LAST=one(/開頭多一句「(（阿凱說：「去年也是我。」）)」/,S54);
  check('5-4 大二下期末「八月想回宜蘭，待久一點。」（舊的「八月想再出國一次」不在）',!!TE&&J(TERMEND_LINES).includes('暑假我在打工。'+TE)&&!J(TERMEND_LINES).includes('八月想再出國一次'),TE);
  const L=ev('ev_typhoon_y3_noodle').dialogue, i=L.findIndex(l=>l&&l.text===LAST);
  check('5-4 TYPHOON_Y2_KAI 讀了：大二颱風那晚有來的，大三颱風那一場開頭多「（阿凱說：「去年也是我。」）」（第二句；大二那一場記這個旗標）',!!LAST&&i===1&&J(L[i].if)===J({flags:['TYPHOON_Y2_KAI']})&&J((ev('ev_y2_typhoon_kai')||{}).consequences||{}).includes('TYPHOON_Y2_KAI'),J({i}));
  const SUP=one(/他那句「[^」]+」改「([^」]+)」/,S54);
  check('5-4 宵夜地點：「宿舍旁邊那攤滷味比較好吃」（訊息不打標點，後半照舊）；舊的「我這棟樓下的滷味比較好吃」不在',!!SUP&&SRC('src/story3d.js').includes("A('"+SUP+" 老闆會多給豆干')")&&!SRC('src/story3d.js').includes("A('我這棟樓下的"),SUP);
  const HW=qs(part('一般聊天池','\n',S54)), pool=(key,fl)=>{ fresh(key,15,'dorm',fl); H.FAMILIAR('kai'); const s=new Set(); for(let i=0;i<60;i++){ const r=MSG.pick(H.G,'kai','chat',null,{}); if(r) s.add(r.msgs.join('|')); } return [...s]; };
  const p2=pool('2027-03-10'), p4=pool('2028-10-03'), pg=pool('2029-09-10',{GRADUATED:D('2029-06-02')});
  const E0=MSG_POOL.people.kai.replies.find(e=>e.msgs&&e.msgs[0]==='寫作業 好難');
  check('5-4 一般聊天池：大四以後不回「寫作業 好難」——大四起「寫 code 好難」、畢業以後「上班好難」；大二照舊；產生器的檔（msg_pool.js）不改、挑完 tags 還原',
    J(HW)===J(['寫作業 好難','寫 code 好難','上班好難'])&&p2.includes('寫作業 好難')&&!p2.includes('寫 code 好難')&&p4.includes('寫 code 好難')&&!p4.includes('寫作業 好難')&&pg.includes('上班好難')&&!pg.includes('寫作業 好難')&&J(E0.tags)===J(['學期中']),J({p2,p4,pg})); });

/* ===================== 6 順手修的 ===================== */
await sec('6',async()=>{
  const BK=one(/腳踏車那天移到 (\d+\/\d+)/,S6), JPS=SRC('src/jp_blank3d.js'), ent=(JPS.match(/\{k:'jpb_1_2r',d:'([\d-]+)'/)||[])[1];
  let lh=null; (function walk(o){ if(!o||typeof o!=='object'||lh) return; if(o.bikeLH){ lh=o.bikeLH; return; } for(const k in o) walk(o[k]); })(JP_BLANK_LINES);
  check('6 日本路線立衡版的腳踏車移到 4/7（重逢 4/2 以後；字不改）：jp_blank3d.js 那一格、立衡那則私訊的日子都是 2028-04-07（子代理解讀：稿寫「第一個週六」，4/7 是週五＝和原本 3/31 同一個星期幾，照稿的日子）',
    BK==='4/7'&&ent==='2028-04-07'&&!!lh&&lh.ask==='2028-04-07'&&J(lh.msg)===J(['腳踏車要買嗎 我知道一間二手的']),J({BK,ent,lh}));
  const FY=qs(part('- **方奕廷**','- **予樂**',S6)).slice(1), S=[]; for(const k of ['2025-10-07','2026-10-07','2027-10-07','2028-10-07']){ fresh(k,15,'campus'); H.FAMILIAR('npc_fangyt'); S.push(small('npc_fangyt')); }
  check('6 方奕廷：大一、大二、大三各一句（每學期一次），大四以後不說（2028-07 起在嘉義）；舊的「森林系的野外實習，下週去溪頭。」不在',FY.length===3&&J(S.slice(0,3))===J(FY.map(t=>'「'+t+'」'))&&!FY.includes(String(S[3]).replace(/^「|」$/g,''))&&!J(SMALLTALK.npc_fangyt).includes('森林系的野外實習'),J({FY,S}));
  const YL=one(/第二場改成：「([^」]+)」/,S6), L=evLines('ev_kexin_two_circles'), y=L.find(x=>x.t===YL);
  check('6 予樂：兩邊的朋友（第二場）三句改成「'+YL+'」（YL_IMPRESSION 三種都說這一句）；電影夜那一場（y2r2_3d.js）照舊',!!y&&y.who==='予樂'&&J(y.l.if)===J({flagIs:{YL_IMPRESSION:['funny','honest','polite']}})&&!L.some(x=>/這是很(好笑|老實|客氣)的司機。/.test(x.t))&&SRC('src/y2r2_3d.js').includes('這是很好笑的司機。'),J(y&&y.l)); });

/* ===================== 7 第 7 節給 BB 的六項 ===================== */
await sec('7',async()=>{
  const T7=[...part('- **測試（BB）**',null,S7).matchAll(/^\s*- (.+)$/mg)].map(m=>m[1]).filter(x=>!/測試（BB）/.test(x));
  check('7 對稿：第 7 節給 BB 的測試六項、新旗標 AUNT_NAME、CAFE_LATTE_TRY、HXH_SUBJECT',T7.length===6&&['AUNT_NAME','CAFE_LATTE_TRY','HXH_SUBJECT'].every(f=>S7.includes('`'+f+'`')),J(T7));
  /* ① 大一上去麵店，櫃台是阿姨（中年），能說話 */
  fresh(TD('Y1S1',3,4),12,'noodle'); const ck=populate('noodle'), sp=built.find(s=>s&&s.id==='clerk_noodle'); H.said=[]; if(ck&&ck.talk) await ck.talk(ck); const t1=said();
  check('7① 大一上去麵店：櫃台是阿姨（中年女性底模）、能說話',!!ck&&!!sp&&sp.sex==='f'&&sp.model===HCIRCLE.PEOPLE.hc_ayi.model&&ck.name==='阿姨'&&t1.length===1&&/^阿姨：/.test(t1[0]),J(t1));
  /* ② 大四上二十三週年在場 → 大四下最後一頓「二十三週年那一張。」 */
  fresh('2028-12-14',19,'noodle'); for(const id of ['heroine_01','zhe','yu','classmate_bohan','heroine_03']) H.FAMILIAR(id); PHONE.join(H.G,'noodle_team','麵店團'); H.picks=[0,0,0,0]; await Y34B.a23Run(GM); const a23=H.G.flags.ANNIV23;
  at('2028-12-19',18,'noodle'); const ay=await aunt();
  H.G.flags.GRADUATED=D('2029-06-02'); at('2029-06-22',16); at('2029-06-22',17); PG.rules(GM); PHONE.tick(H.G); at('2029-06-22',18.8); await goOut('y4_last_meal',[1]); const o2=H.opts[0]||[];
  check('7② 二十三週年（2028-12-14）在場＝ANNIV23 there、之後阿姨那一句「照片我挑了好久。…」；大四下最後一頓「二十三週年那一張。」這個選項出現',
    a23==='there'&&J(ay)===J(['阿姨：照片我挑了好久。……你在第幾排，自己找。'])&&o2.includes('「二十三週年那一張。」'),J({a23,ay,o2}));
  /* ③ 陳助教大三說「六月口試」，2028-06-20 收到「過了。」 */
  fresh('2027-10-07',15,'campus'); H.FAMILIAR('npc_ta_chen'); small('npc_ta_chen'); at(D('2027-10-08'),15); const t3=small('npc_ta_chen'); at('2028-06-20',20.9); ph(); at('2028-06-20',21.1); ph(); const m3=txt('p:npc_ta_chen');
  check('7③ 陳助教大三說「六月口試。……」，2028-06-20 收到「過了。」',/^「六月口試。/.test(t3||'')&&m3[0]==='過了。',J({t3,m3}));
  /* ④ 芷若不在班時，Café 櫃台是男老闆 */
  fresh(TD('Y1S2',3,2),15,'cafe'); const zr=STORY.schedEnt(CHARACTERS.heroine_02,H.G), c4=populate('cafe'), s4=built.find(s=>s&&s.id==='clerk_cafe');
  check('7④ 芷若不在班（週二下午她在總圖）：Café 櫃台是男老闆',!(zr&&zr.zone==='cafe')&&!!c4&&!!s4&&s4.sex==='m'&&c4.name==='老闆',J({zr:zr&&zr.zone}));
  /* ⑤ 筱涵受試者：「剩下四個呢？」那一支 */
  const mon=TD('Y2S1',9,1); fresh(mon,20,'dorm'); H.FAMILIAR('npc_huangxh'); INV.addContact(H.G,'npc_huangxh'); phAt(mon,21.1); PHONE.answer(H.G,X().HXH_ASK,0); ph(); at(mon+3,14.9); await goOut(X().HXH_OUT,['剩下四個呢？']); const s5=said();
  check('7⑤ 筱涵受試者（第 9 週）：「好。」→ 週四 15:00 →「剩下四個呢？」→「我自己在總圖門口問的。……被拒絕了二十幾次。」',s5[s5.length-1]==='黃筱涵：我自己在總圖門口問的。……被拒絕了二十幾次。'&&H.G.flags.HXH_SUBJECT===true,J(s5.slice(-2)));
  /* ⑥ 阿凱大四上 K5 選「先修 bug。」→ 之後在資工系館前聽到「修好那天晚上……」 */
  fresh('2028-11-22',23,'dorm'); H.FRIEND('kai'); INV.addContact(H.G,'kai'); at('2028-11-22',23.7); R3.kaiK5(H.G); PHONE.tick(H.G); const k=(PHONE.byAsk(H.G,'r3_kai_k5')||{ask:{opts:[]}}).ask.opts.findIndex(o=>o.t==='先修 bug。'); PHONE.answer(H.G,'r3_kai_k5',k);
  at('2028-11-24',17.1,'campus'); const s6=small('kai');
  check('7⑥ 阿凱 K5（2028-11-22 23:40）選「先修 bug。」→ KAI_K5 bug；之後週五 17:00 資工系館前「你說先修 bug。……修好那天晚上，我睡了十個小時。」',k>=0&&H.G.flags.KAI_K5==='bug'&&s6==='「你說先修 bug。……修好那天晚上，我睡了十個小時。」',J({k,s6})); });

/* ===================== 8 第 8 節（d75cd0228）===================== */
await sec('8-1',async()=>{
  check('8-1 對稿：語彤顧店的時段阿姨一定在廚房（寒暑假週二、四晚上、大二下起週六早上）；例外過年店休、2029-04-19～25 出國；「去買東西」留著當備用',
    S8.includes('**語彤顧店的時段，阿姨一定在廚房**')&&S8.includes('寒暑假週二、四晚上，大二下起週六早上')&&S8.includes('過年店休（`NOODLE_CLOSED` 的日子）、2029-04-19～25 阿姨出國')&&S8.includes('「去買東西」那句可以留著當備用')
    &&J((((MULTIREL_LINES.DISC||{}).heroine_03||{}).base||[]).find(x=>x&&x.if==='auntIn'&&x.else).else)===J([{p:'阿姨呢？'},'去買東西。']));
  /* 語彤照作息顧店、阿姨那幾列不成立（寒暑假、週六早上、學期中沒擲到的那一天）＝廚房那位（阿姨）照常在 */
  const dOff=(()=>{ const r=HCIRCLE.row('c503_6_2'); for(let w=2;w<=15;w++){ const x=TD('Y1S1',w,2); fresh(x,18.2,'noodle'); if(!HCIRCLE.on(r,H.G)&&minding()) return x; } return null; })();
  const vac=(a,b)=>{ for(let d=D(a);d<=D(b);d++){ const wd=wdOf(d); if(wd!==2&&wd!==4) continue; fresh(d,18.5,'noodle'); if(minding()&&!NOODLE_CLOSED.closed(H.G)) return d; } return null; };   /* 寒假裡第一個她照作息顧店的週二、四晚上（不是過年店休）*/
  const wv=vac('2028-01-15','2028-02-20');
  const C=[['大二暑假週二晚上','2027-07-06',18.5],['大三寒假週二、四晚上',wv,18.5],['大二下週六早上',TD('Y2S2',3,6),10],['大三上週六早上',TD('Y3S1',4,6),10.5],['大一上週二沒擲到',dOff,18.2]], R=[];
  for(const [lab,d,h] of C){ if(d==null){ R.push([lab,'找不到那一天']); continue; } const k=noodleK(D(d),h,true); R.push([lab,minding(),HCIRCLE.labelIn(H.G,'hc_ayi','noodle'),ckVis(k.ck),HCIRCLE.auntOut(GM),MREL.auntIn(H.G),EAT.staffAway(GM,'阿鳳麵店')]); }
  check('8-1 語彤照作息顧店、阿姨那幾列不成立（大二暑假週二晚上、大三寒假週二四晚上（'+(wv!=null?keyOf(wv):'?')+'）、大二下起週六早上、大一上週二沒擲到的那一天）：廚房那位（阿姨）照常在、不是 auntOut、MREL.auntIn 在、點餐阿姨的話照說',
    R.every(x=>x[1]===true&&x[2]===false&&x[3]===true&&x[4]===false&&x[5]===true&&x[6]===false),J(R));
  /* 例外：過年店休、出國那一週（店沒開）＝阿姨不在（HCIRCLE.auntAway）；出國那一週語彤在總圖，廚房那位也不在 */
  const cny=D('2027-02-02'); noodleK(cny,18.5,true); const c1=[NOODLE_CLOSED.closed(H.G),HCIRCLE.auntAway(H.G),MREL.auntIn(H.G)];
  const k2=noodleK(D('2029-04-24'),18.5,false); const c2=[R2Y4B.aunTrip(H.G),HCIRCLE.auntAway(H.G),ckVis(k2.ck),MREL.auntIn(H.G)];
  const k3=noodleK(D('2029-04-26'),18.5,true); const c3=[HCIRCLE.auntAway(H.G),ckVis(k3.ck)||!!GM.npc.hc_ayi,MREL.auntIn(H.G)];
  check('8-1 例外：過年店休（2027-02-02）＝auntAway、auntIn 不在；出國那一週（2029-04-24）＝auntAway、廚房那位不在（語彤不在也一樣）、auntIn 不在；回來（4/26）照常在',
    J(c1)===J([true,true,false])&&J(c2)===J([true,true,false,false])&&J(c3)===J([false,true,true]),J({c1,c2,c3}));
  /* 「去買東西」留著當備用：阿姨真的不在（強制 auntAway）＝語彤顧店時店員藏起來、auntOut */
  const a0=HCIRCLE.auntAway; HCIRCLE.auntAway=()=>true; let f=null; try{ const k=noodleK(D('2027-07-06'),18.5,true); f=[ckVis(k.ck),HCIRCLE.auntOut(GM),MREL.auntIn(H.G)]; } finally { HCIRCLE.auntAway=a0; }
  check('8-1 備用：阿姨真的不在（測試強制 auntAway）＝廚房沒有人（店員藏起來、auntOut）、auntIn 不在（「阿姨呢？」「去買東西。」那一支還接得上）',J(f)===J([false,true,false]),J(f)); });
await sec('8-2',async()=>{
  const IN=one(/阿姨在：「([^」]+)」/,S8), OUTL=one(/阿姨不在：「([^」]+)」/,S8);
  const eat=async(d,h,yt)=>{ noodleK(D(d),h,yt); H.G.eat={}; H.said=[]; H.picks=[0]; await STORY.interact({eat:'noodle',seat:{x:0,z:0}},GM); return said(); };
  const a=await eat('2027-07-06',18.5,true), b=await eat(TD('Y1S1',3,3),12.5,false);
  const a0=HCIRCLE.auntAway; HCIRCLE.auntAway=()=>true; let c; try{ c=await eat('2027-07-06',18.5,true); } finally { HCIRCLE.auntAway=a0; }
  check('8-2 一個人吃麵（乾麵）：阿姨在＝「'+IN+'」（語彤顧店的暑假晚上、平常的中午都是）；阿姨不在（測試強制）＝「'+OUTL+'」；不再寫「老闆娘」',
    !!IN&&!!OUTL&&a.includes(IN)&&b.includes(IN)&&c.includes(OUTL)&&!c.includes(IN)&&![...a,...b,...c].some(x=>/老闆娘/.test(x)),J({a:a.slice(-1),b:b.slice(-1),c:c.slice(-1)}));
  fresh(TD('Y1S1',3,3),12.5,'noodle',{},{nar:true}); noodleK(TD('Y1S1',3,3),12.5,false); delete H.G.flags.AA519; H.G.eat={}; H.said=[]; H.picks=[0]; await STORY.interact({eat:'noodle',seat:{x:0,z:0}},GM); const n=said();
  check('8-2 新的存檔第一次在麵店：第一句提到阿姨的旁白寫「阿姨（阿鳳）」（1-1），之後照原文',n.filter(x=>/阿姨（阿鳳）/.test(x)).length===1&&n.includes(IN),J(n)); });
await sec('8-3',async()=>{
  const S=X().auntEvs(), NAMED=['ev_zhe_long_table','ev_yutong_landlord','ev_term_last_meal','ev_term_last_meal_y1s2','ev_term_last_meal_y2s1','ev_y3_tue_noodle'];
  const bad=[...S].filter(id=>!X().noodleEvs().has(id)||!/阿姨/.test(evText(id)));
  check('8-3 麵店的 2D 事件（阿姨在場或說話：在麵店、台詞提到阿姨的，載入後掃）：'+S.size+' 個（稿「約 25 個」），含 LAWWW 點名的那幾個；每一個都在麵店、都提到阿姨',S.size>=25&&NAMED.every(id=>S.has(id)&&!!ev(id))&&!bad.length,J({n:S.size,bad}));
  const r=HCIRCLE.row('c503_6_2'); let d=null; for(let w=2;w<=15&&d==null;w++){ const x=TD('Y1S1',w,2); fresh(x,18.2,'noodle'); if(!HCIRCLE.on(r,H.G)&&minding()) d=x; }
  fresh(d,18.2,'noodle'); const a=HCIRCLE.on(r,H.G); H.G.events.last.ev_zhe_long_table=H.G.day; const b=HCIRCLE.on(r,H.G);
  fresh(d,18.2,'noodle'); OUT.rec(H.G).push({id:'t_ndl',day:d,h:19,state:'planned',place:'阿鳳麵店',title:'麵店'}); const c=HCIRCLE.on(r,H.G);
  fresh(d,18.2,'noodle'); H.G.events.last.ev_zhe_long_table=d-7; const e=HCIRCLE.on(r,H.G);
  check('8-3 那一天演了麵店的 2D 事件（ev_zhe_long_table）或排了麵店的出遊＝阿姨那幾列擲骰當成功（3D 一定有阿姨）；別天照原本擲的',a===false&&b===true&&c===true&&e===false,J({d:keyOf(d),a,b,c,e})); });
await sec('8-4',async()=>{
  const GRP=quotes(part('4/23（一）21:00 群組換這四則','- 沒有麵店日的就不用',S8));
  check('8-4 對稿：群組四則（阿哲兩則、Alison、語彤）＝aunt.tripGroup；語彤那一週在總圖（4/19 那則的回覆）；門口那張紙照第 1 節',
    GRP.length===4&&J(GRP)===J(LN().aunt.tripGroup.map(([w,t])=>pairDoc(w,t,NM)))&&S8.includes('「我在總圖。期中考，店剛好也沒開。」')&&S8.includes('「出國，休息七天。——阿鳳」'),J(GRP));
  /* 語彤：那一週顧店的時段在總圖 */
  const Y=[]; for(const [k,h] of [['2029-04-19',18],['2029-04-21',10],['2029-04-24',18.5],['2029-04-28',10],['2029-05-01',18.5],['2029-04-17',18.5]]){ fresh(k,h,'dorm'); const e=ytEnt(); Y.push([k,e&&e.zone]); }
  check('8-4 語彤那一週（4/19～4/25）週二、四晚上、週六早上在總圖；回來以後（4/28 週六早上、5/1 週二晚上）、出國前（4/17）在麵店',J(Y.map(x=>x[1]))===J(['library','library','library','noodle','noodle','noodle']),J(Y));
  /* 麵店團：那一週沒有麵店日（阿哲不揪）；4/23 21:00 四則（那一週本來有麵店日才發；不在群組沒有）*/
  const nd=['2029-04-19','2029-04-24','2029-04-26'].map(k=>[k,STORY.noodleDay(D(k)),X()._nd0.call(STORY,D(k))]);
  fresh('2029-04-23',20.5,'dorm',{noodleTableDay:D('2028-09-06')}); for(const id of ['zhe','yu','heroine_03']) H.FAMILIAR(id); PHONE.join(H.G,'noodle_team','麵店團'); ph(); const g0=txt('g:noodle_team').length; phAt('2029-04-23',21.1);
  const g1=TH('g:noodle_team').filter(m=>m.tag==='aa519_ndl_trip'); phAt('2029-04-24',17.6); const ping=PHONE.sent(H.G,'rt_zhe_ndl_'+D('2029-04-24'));
  fresh('2029-04-23',20.5,'dorm'); phAt('2029-04-23',21.1); const g2=(H.G.msgs||[]).filter(m=>m.tag==='aa519_ndl_trip').length;
  check('8-4 STORY.noodleDay：4/24（週二）原本是麵店日、那一週不是；4/26 照常；4/23（一）21:00 麵店團四則（20:30 還沒有；阿哲的揪那一週沒有）；不在群組沒有',
    J(nd)===J([['2029-04-19',false,false],['2029-04-24',false,true],['2029-04-26',true,true]])&&g0===0&&J(g1.map(m=>[m.from,m.text]))===J(LN().aunt.tripGroup)&&!ping&&g2===0,J({nd,g0,g1:g1.map(m=>m.text),ping,g2}));
  /* 不排新的麵店出遊、邀約；舊存檔已經排好的照演 */
  fresh('2029-04-20',10,'dorm'); const p1=OUT.plan(H.G,{id:'t_ndl1',day:D('2029-04-24'),h:19,place:'阿鳳麵店',title:'麵店',travel:'',travelH:0}), p2=OUT.plan(H.G,{id:'t_ndl2',day:D('2029-04-27'),h:19,place:'阿鳳麵店',title:'麵店',travel:'',travelH:0}), p3=OUT.plan(H.G,{id:'t_lib',day:D('2029-04-24'),h:19,place:'總圖',title:'總圖',travel:'',travelH:0});
  const q1=!!OUT.get(H.G,'t_ndl1'), q2=!!OUT.get(H.G,'t_ndl2'), q3=!!OUT.get(H.G,'t_lib');
  const P=INVITE_DATA.places.find(p=>p.id==='noodle'), v1=P.avail(H.G,D('2029-04-24')), v2=P.avail(H.G,D('2029-05-01'));
  fresh('2029-04-24',18.5,'gongguan'); OUT.rec(H.G).push({id:'old_ndl',day:D('2029-04-24'),h:19,state:'planned',place:'阿鳳麵店',title:'麵店'}); H.said=[]; const dr=await NOODLE_CLOSED.door(GM);
  fresh('2029-04-24',18.5,'gongguan'); H.said=[]; const dr2=await NOODLE_CLOSED.door(GM), dl=said();
  check('8-4 那一週不排新的麵店出遊（OUT.plan 擋下；別的地方、下一週照常）、麵店邀約那天不能選；舊存檔已經排好的照演（門照常開）；沒有約＝門口那張紙「出國，休息七天。——阿鳳」',
    p1===false&&!q1&&p2===true&&q2&&p3===true&&q3&&v1===false&&v2!==false&&dr===false&&dr2===true&&J(dl)===J(['（麵店門口貼著一張紙：「出國，休息七天。——阿鳳」）']),J({p1,p2,p3,v1,v2,dr,dr2,dl})); });

/* ===================== 9 舊存檔 ===================== */
await sec('9',async()=>{
  fresh('2025-10-07',15,'campus',{},{raw:true}); H.FAMILIAR('npc_ta_chen'); (H.G.social.small||(H.G.social.small={})).npc_ta_chen={day:D('2025-10-06'),used:['「論文寫到第三章。……別問我第四章。」'],last:'「論文寫到第三章。……別問我第四章。」'};
  const s1=small('npc_ta_chen'), had=H.G.flags.AA519!=null;
  check('9 舊存檔（沒有 AA519、閒聊紀錄是舊的兩句）：照新的句子從頭開始、不丟例外；AA519 紀錄用到才建',s1==='「'+LN().ta.years[1][0]+'」'&&had,J(s1));
  fresh(TD('Y2S1',3,2),18,'noodle',{AA519:true,ANNIVERSARY_23:true,JOB_NOODLE:true,JOB_NOODLE_SUMMER:true},{raw:true}); const s2=await aunt(); const R=H.G.flags.AA519;
  check('9 壞掉或舊的旗標（AA519 不是物件、舊的 ANNIVERSARY_23、JOB_NOODLE、JOB_NOODLE_SUMMER）：照常說話、紀錄修好',J(s2)===J(['阿姨：大二了。……大二也要吃飯。'])&&!!R&&typeof R==='object'&&!!R.talk,J(s2));
  /* 存讀檔：說過的、短句輪到哪裡都記在 G.flags.AA519 */
  fresh(TD('Y1S1',2,2),18,'noodle'); await aunt(); await aunt(); const snap=JSON.parse(JSON.stringify(H.G)); H.G=snap; SOCIAL.bind(H.G); EVENTS.bind(GM); STORY._bindGM(GM); const s3=await aunt(); at(TD('Y1S1',2,3),18); const s4=await aunt();
  check('9 存讀檔以後照樣接：說過的那一句不再說、短句接著輪（坐。之後＝老樣子？、今天的湯比較鹹…）',J(s3)===J(['阿姨：老樣子？'])&&J(s4)===J(['阿姨：今天的湯比較鹹，你多喝水。']),J({s3,s4}));
  fresh('2025-10-07',15,'campus',{},{raw:true}); let err=null; try{ X().phone(H.G); STORY.phoneRules(GM); PHONE.tick(H.G); }catch(e){ err=String(e); }
  check('9 新的局、什麼都沒有：手機規則照常跑、不丟例外',err==null,err); });

/* ===================== 10 遊戲 → 稿 ===================== */
await sec('10',async()=>{
  /* (a) aa519_lines.js 的每一句（不含 src、別份稿的「別人說起芷若」、k／id／who 這種鍵）都在稿裡 */
  const out=[]; (function walk(v,key){ if(v==null) return; if(typeof v==='string'){ if(/[一-鿿]/.test(v)) out.push(v); return; }
    if(Array.isArray(v)){ if(v.length===2&&(v[0]==null||typeof v[0]==='string')&&typeof v[1]==='string'&&!/[，。？！]/.test(v[0]||'')){ out.push(v[1]); return; } v.forEach(x=>walk(x)); return; }
    if(typeof v==='object') for(const k in v){ if(['src','k','id','who','from','until','heard'].includes(k)) continue; walk(v[k],k); } })(LN());
  const miss=out.filter(s=>!DOC.includes(s));
  check('10 遊戲 → 稿：aa519_lines.js 的每一句（'+out.length+' 句）都在稿裡',out.length>=90&&!miss.length,J(miss.slice(0,6)));
  /* (b) 各檔帶 AA_519 註解的行、sup519_3d.js：程式裡玩家看得到的字（去掉註解以後的字串）都在稿裡；照舊的半句、系統字、別份稿的句子列出原因 */
  const WHY={
    '林家乾麵（溫州街）':'一百元清單同一行的第一列（照舊）','小碗乾麵＋貢丸湯':'同上','飽足感除以價錢，第一名。沒有之一。':'同上',
    '餛飩湯上面漂著一點油蔥。':'一個人吃麵點餛飩湯的那一句（8-2 只改乾麵那一句）',
    '（麵店的長桌。）':'1-3 送小菜第六處：原句前半照舊（拆成兩句）','（期末最後一科考完。長桌已經併好了。）':'1-3 第二處：原句前半照舊','（大一最後一科考完。長桌又併起來了。）':'1-3 第三處：同一行的第一句照舊',
    '（大二上最後一科考完。長桌的位子，大家已經不用講就會坐。）':'1-3 第四處：同一行的第一句照舊','（九點。）':'1-3 第五處：原句前半照舊','（長桌只坐了一半。）':'1-3 第七處：原句前半照舊',
    '寒假還有誰在臺北':'vacfill 同一行的群組訊息（照舊）','我在。店裡':'同上','我！！':'同上','我也在。':'同上',
    '（十二月三十一日，晚上七點。麵店比平常擠，阿姨把門口那張桌子也搬了進來。）':'1-1 原句的「老闆娘」改「阿姨」（第 1 段查）',
    '（二十分鐘後，阿凱全身濕，站在門口，手上這次是一袋滷味。）':'5-3 稿上「→」右邊那一句加原句的開頭「（二十分鐘後，」（第 5 段查）',
    '（二十分鐘後，阿凱站在門口，雨衣在滴水，手上兩杯熱豆漿。……泡麵，他說他不想再吃了。柏翰在靠窗那張桌子念書，看了一眼，戴上耳塞。）':'5-3 同上，加原句的後半（柏翰…）',
    '（打開筆電）你看，我的作業會頂嘴了。':'5-2 大二上照舊的那一句（AA_328）','新室友說我話很多。……真的很多嗎？':'5-2 大二上照舊三句之一',
    '「芷若跟你講過我嗎？她高中就這樣，什麼都不講。」':'方奕廷同一行原本的第二句（照舊）','照片我貼起來了。你們自己找，找不到的下次帶一張來。':'最後一頓同一行原本的句子（只改選項的條件）',
    '暑假我在打工。八月想回宜蘭，待久一點。':'5-4「→」右邊那一句，前面「暑假我在打工。」照舊','還要做嗎？':'wz_jobs.js 同一行原本的欄位','有空回來看看':'同上（溫州街三家、書店的離職照舊）',
    '腳踏車要買嗎 我知道一間二手的':'第 6 節只改日子，字不改','「冠廷學長在寫論文的第五章。他說不要問第六章。」':'2-1「論文卡在第五章」的推論（子代理解讀）','「我在幫老師整理判決。一份判決讀完，我多了三個問題。」':'pool_story_b2 同一行原本的第二句',
    '法研所（刑事法組）・碩二':'2-1 年級（稿：2025 碩二）','法研所（刑事法組）・碩三':'2-1（2026 碩三）','法研所（刑事法組）・碩四':'2-1（2027 碩四）','法研所（刑事法組）':'characters.js 同一行原本的欄位',
    '刑訴助教；講話慢、喜歡反問；準備寫論文寫到懷疑人生':'同上','博士班或律師':'同上',
    '小禾：學姊，三號桌說要「跟上次一樣」。／芷若：……上次是誰點的？／小禾：我。／芷若：那妳去。':'AA_508 2-1 的句子，說話人照 3-4 換小禾（tests/heroine_circle3d_unit.js 對稿）',
    '小禾：學姊，一樣嗎？／芷若：一樣。……妳不用每次都問。／小禾：要問。學姊教的。':'同上',
    '窗邊的位子＝她當客人坐的位子（作息 19:00～21:30），工讀生站在桌邊（AA_519 3-4：說話人改小禾）':'圈子表的說明欄（玩家看不到）',
    '陳助教：下禮拜二口試。／學姊：幾點。／陳助教：……妳要來？／學姊：最後一排。不講話。':'2-3 的四句用「／」接起來（第 2 段查）',
    'AA_519 2-3：6/16（五）週五公館和學姊吃飯那一列（放暑假了，學期的列不成立；只有這一天）；口試 2028-06-20（二），學姊沒有別的事':'圈子表的說明欄（玩家看不到）',
    '跟你打了個招呼，聊了兩句天氣。）':'2-2、4-1「照現有規則」的天氣那一句（story3d.js 原本的字）','和':'按鈕「和阿姨說話」「和老闆說話」（系統字）','說話':'同上',
    '心理系的實驗室':'4-2 2D 的地點字幕（系統字）','當受試者（筱涵）':'4-2 出遊的標題（系統字）','走過去約 10 分鐘':'4-2 出遊的路程（系統字）','心理系・實驗室':'4-2 底圖的名字（BB 要圖，系統字）','當受試者':'4-2 事件的標題（系統字）',
    '學期中':'msg_pool.js 的 tag（不是台詞）','寫作業 好難':'msg_pool.js 原本那一則（5-4 換掉的就是它）',
    'AA_519 第 8 節第 4 點：2029-04-19～25 阿姨出國、店沒開，語彤那一週在總圖（顧店的時段）':'作息的說明欄（玩家看不到）','AA_519 第 8 節第 4 點：同上，週六早上的備料不去':'同上',
    'AA_519 5-1：大二下～大四每學期週五 17:00～18:00 資工系館前（遊戲沒有資工系館：醉月湖南岸東邊那張長椅），一個人抱著筆電坐著':'同上' };
  const files=[]; (function walk(dir){ for(const n of fs.readdirSync(path.join(H.ROOT,dir))){ const f=dir+'/'+n, st=fs.statSync(path.join(H.ROOT,f)); if(st.isDirectory()) walk(f); else if(/\.js$/.test(n)&&!/aa519_lines\.js$/.test(n)&&SRC(f).includes('AA_519')) files.push(f); } })('src');
  const lits=[], CJK=/[一-鿿]/;
  for(const f of files){ const all=/sup519_3d\.js$/.test(f); const L=SRC(f).split('\n'); L.forEach((l,i)=>{ if(!all&&!/AA_519/.test(l)) return; const code=l.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\*.*$/,'').replace(/\/\/.*$/,'');
      for(const m of code.matchAll(/'((?:[^'\\]|\\.)*)'/g)) if(CJK.test(m[1])) lits.push([f+':'+(i+1),m[1]]); }); }
  const un=lits.filter(([w,s])=>!DOC.includes(s)&&!(s in WHY)), stale=Object.keys(WHY).filter(s=>!lits.some(x=>x[1]===s));
  check('10 遊戲 → 稿：各檔帶 AA_519 註解的行、sup519_3d.js 程式裡的字（'+lits.length+' 個字串）都在稿裡；不在的逐一列了原因（'+Object.keys(WHY).length+' 個；照舊的半句、說明欄、系統字），清單沒有多餘的',
    files.length>=20&&lits.length>=80&&!un.length&&!stale.length,J({un:un.slice(0,8),stale})); });

H.done();
})();
