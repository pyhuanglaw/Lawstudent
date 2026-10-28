// 好感看得見：門檻台詞、見面結束的一句、手機聯絡人的名字、見面時的旁白（使用者 2026-10-14 試玩 v9.6：「約了朋友在溫州街散步，是不是沒有增加好感？
// 在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」；內容＝企劃分支 AA_124 1-6〔886ff09〕、BB_120 第 1 節〔6338153〕，第②級）。不需要瀏覽器：
//   1. 資料：13 個人都在 CHARACTERS、三階的門檻台詞、三種見面結束的一句；BB 的七位四個地點的旁白、聯絡人；台詞的格式（「」或（））
//   2. 門檻台詞：升到有點熟的下一次見面說一次、說過就不再說；跳階（認識 → 好朋友）只說最高的；學姊照一般階段（AA_219 A-11 拿掉 W8 上限）；小選擇照選的回答
//   3. 見面結束的一句照現在的階段；明軒二四六（家教的晚上）換一句；阿凱好朋友那句大一和大二以後不一樣；{name} 換成玩家的名字
//   4. 見面時的旁白：地點×階段；「—」的格子照舊（null）；明軒總圖朋友以上看 SAW_HIM_STUDY；說話的那種（「開頭）是那個人說的
//   5. 任一方有伴侶時，芷若好朋友那句的旁白拿掉
//   6. 約好的見面（INV.meet）：門檻台詞 → 地點的旁白 → 見面結束的一句；手機聯絡人的名字跟著關係改（phone3d.js 的 nm）
//   7. 接線：talkCharacter、舊的對話函式（以安、阿哲、學姊、阿凱、Alison）、index.html 載入 data/rel_lines.js
// 修正前（沒有 data/rel_lines.js、SOCIAL.playUp）這個測試會失敗。用法：node tests/rel_lines_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
const load=(f,re)=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(re||/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f});
load('src/data/characters.js',/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg);
load('src/social3d.js',/^const (SOCIAL)\s*=/m);
let W8=false; global.EVENTS={cond:c=>!!(c&&c.events&&c.events[0]==='ev_sis_collapse'&&W8),habit(){},onInteract:()=>false};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const hasRL=fs.existsSync(path.join(ROOT,'src/data/rel_lines.js'));
check('src/data/rel_lines.js 存在',hasRL); if(!hasRL){ console.log('FAILED: '+fails); process.exit(1); }
load('src/data/rel_lines.js'); load('src/data/invites.js'); load('src/invites3d.js'); load('src/phone3d.js');
check('SOCIAL.playUp／upLine／byeLine／meetLine／contactName 存在',['playUp','upLine','byeLine','meetLine','contactName','friendLevel','playSteps'].every(k=>typeof SOCIAL[k]==='function'));
// ---------- 1. 資料 ----------
const AA=['heroine_01','heroine_03','zhe','yu','classmate_bohan','classmate_xinci'], BB=['heroine_05','heroine_02','heroine_04','classmate_peishan','kai','classmate_mingxuan','npc_fangyt'];
const ids=Object.keys(REL_LINES);
check('1. 13 個人（AA 六位、BB 七位）都有資料、都在 CHARACTERS',AA.concat(BB).every(id=>REL_LINES[id]&&CHARACTERS[id])&&ids.length===13,ids.join(','));
const steps=v=>Array.isArray(v)?(v.length&&v[0]&&typeof v[0]==='object'&&('l' in v[0])?v.flatMap(x=>x.l):v):(v&&v.l)||[];
const fmtOK=st=>typeof st==='string'?/^[「（]/.test(st):(st&&typeof st.n==='string'&&/^（/.test(st.n));
/* 2026-10-28 改：AA_497 4-6（企劃線 7a38216ca）明軒的滷蛋只留 M1、M2、德文那三處——朋友階的道別「下次我請。……一顆滷蛋。」拿掉，朋友階照 base（SOCIAL.byeLine 往下找）；AA 要另外補一句再加回來 */
const BYE_NONE={classmate_mingxuan:['FRIEND']};
check('1. 每個人三階的門檻台詞、三種見面結束的一句（明軒朋友階的道別 AA_497 拿掉、照 base）；格式都是「」或（）',ids.every(id=>{ const d=REL_LINES[id]; return ['FAMILIAR','FRIEND','CLOSE_FRIEND'].every(k=>steps(d.up[k]).length&&steps(d.up[k]).every(fmtOK))&&['base','FRIEND','CLOSE_FRIEND'].every(k=>(BYE_NONE[id]||[]).includes(k)?!d.bye[k]:(steps(d.bye[k]).length&&steps(d.bye[k]).every(fmtOK))); }));
check('1. BB 的七位：Café、總圖、公館吃飯有旁白，溫州街只有朋友以上；聯絡人有 base 和朋友（阿凱開學就叫阿凱）',BB.every(id=>{ const M=REL_LINES[id].meet, C=REL_LINES[id].contact; return M&&['cafe','library','noodle'].every(p=>M[p]&&M[p].R)&&M.wenzhou&&M.wenzhou.R&&!M.wenzhou.A&&!M.wenzhou.F&&C&&C.base&&(C.FRIEND||id==='kai'); }));
check('1. AA 的六位：朋友以後的聯絡人；以安好朋友以後是「小安」',AA.every(id=>REL_LINES[id].contact&&REL_LINES[id].contact.FRIEND)&&REL_LINES.heroine_01.contact.CLOSE_FRIEND==='小安');
// ---------- 2. 門檻台詞 ----------
const G={rel:{},flags:{},social:null,day:30,weekday:1,hour:15,name:'祐廷',contacts:{},invites:[],msgs:[]}; SOCIAL.bind(G);
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
function mockGM(picks){ const out=[]; return {G,out,say:async(w,t)=>{ out.push((w?'S:':'N:')+t); },choose:async(o)=>{ out.push('C:'+o.map(x=>x.t).join('/')); return picks&&picks.length?picks.shift():0; }}; }
R('heroine_01',12); check('2. 以安「認識」：沒有門檻台詞',SOCIAL.upLine('heroine_01')===null);
R('heroine_01',25);
(async()=>{
  let gm=mockGM(); let ok1=await SOCIAL.playUp(gm,{name:"以安"},"heroine_01");
  check("2. 以安升到「有點熟」：下一次見面先說（手帳那一句）",ok1&&gm.out[0]==='N:（她把手帳翻到最後一頁）'&&gm.out[1]==='S:「你名字是哪個字？我上次好像寫錯了。」',gm.out.join('｜'));
  gm=mockGM(); ok1=await SOCIAL.playUp(gm,{name:"以安"},"heroine_01"); check("2. 說過就不再說",!ok1&&!gm.out.length);
  R('heroine_03',8); R('heroine_03',65,50,45); gm=mockGM(); await SOCIAL.playUp(gm,{name:'語彤'},'heroine_03');
  check('2. 語彤從「認識」直接跳到「好朋友」：只說最高的那一句，之後不補說低的',gm.out.join('｜')==='S:「阿姨問你這禮拜會不會來。」｜S:「她說她記得你都點什麼。」'&&SOCIAL.upLine('heroine_03')===null,gm.out.join('｜'));
  // 學姊：照一般階段（AA_219 A-11：W8 上限拿掉；「筆試前不想交往」只影響告白）
  R('heroine_05',45,30,10); W8=false;
  check('2. 學姊「朋友」、W8 還沒發生：照一般階段算「朋友」（聯絡人「溫學姊」），不再卡在「有點熟」',SOCIAL.friendLevel('heroine_05')==='FRIEND'&&SOCIAL.contactName('heroine_05')==='溫學姊',SOCIAL.friendLevel('heroine_05')+' '+SOCIAL.contactName('heroine_05'));
  gm=mockGM(); await SOCIAL.playUp(gm,{name:'溫學姊'},'heroine_05');
  check('2. 學姊 W8 以前就說朋友那句（筆電闔上；跳階只說最高的）',gm.out[0]==='N:（她把筆電闔上。）'&&SOCIAL.upLine('heroine_05')===null,gm.out.join('｜'));
  R('heroine_04',65,50,45); gm=mockGM([2]); await SOCIAL.playUp(gm,{name:'子晴'},'heroine_04');
  check('2. 子晴好朋友的小選擇：選「妳呢？」→ 兩句回答',gm.out.join('｜')==='S:「你最近還好嗎？看起來很累。」｜C:還好。/有點累。/妳呢？｜S:「我？還行啦。」｜S:「就最近都很晚睡。」',gm.out.join('｜'));
  // ---------- 3. 見面結束的一句 ----------
  R('classmate_mingxuan',10); G.weekday=2; const b2=steps(SOCIAL.byeLine('classmate_mingxuan')); G.weekday=1; const b1=steps(SOCIAL.byeLine('classmate_mingxuan'));
  check('3. 明軒「認識」：二四六（家教的晚上）「我去家教了，掰。」、其他天「好，下次見。」',b2[0]==='「我去家教了，掰。」'&&b1[0]==='「好，下次見。」',b2+' / '+b1);
  R('heroine_01',45,30,5); check('3. 以安「朋友」：見面結束「下次換我挑地方。」、聯絡人「以安」',steps(SOCIAL.byeLine('heroine_01'))[0]==='「下次換我挑地方。」'&&SOCIAL.contactName('heroine_01')==='以安');
  R('heroine_01',65,50,45); check('3. 以安「好朋友」：聯絡人「小安」',SOCIAL.contactName('heroine_01')==='小安');
  R('kai',65,50,45); const py=SOCIAL.playerYear; SOCIAL.playerYear=()=>1; const k1=SOCIAL.upLine('kai'); SOCIAL.playerYear=()=>2; const k2=SOCIAL.upLine('kai'); SOCIAL.playerYear=py;
  check('3. 阿凱好朋友那句（沒有 KAI_TAPE）：大一（宵夜）、大二以後（新房間）',k1&&k1.l[0]==='「欸，今天宵夜你要不要？我請。」'&&k2&&k2.l[0]==='「欸，你哪天來我新房間，我螢幕換大的了。」');
  R('npc_fangyt',25); G.name='小明'; gm=mockGM(); await SOCIAL.playUp(gm,{name:'方奕廷'},'npc_fangyt'); G.name='祐廷';
  check('3. 玩家的名字換進去（方奕廷有點熟那句；BB_169 F-1。阿哲好朋友那句 AA_194 改稿以後沒有 {name}）',gm.out[0]==='S:「小明，你等一下要去哪？」',gm.out[0]);
  // ---------- 4. 見面時的旁白 ----------
  R('heroine_02',10); check('4. 芷若「認識」約總圖：那一格是「—」，照舊（null）',SOCIAL.meetLine('heroine_02','library')===null);
  R('heroine_02',25); check('4. 芷若「有點熟」約總圖：「她讀英文小說，推過來一張便利貼。」',SOCIAL.meetLine('heroine_02','library')==='她讀英文小說，推過來一張便利貼。');
  R('classmate_mingxuan',45,30); check('4. 明軒朋友以上約總圖：沒看過他念書 → 漫畫',SOCIAL.meetLine('classmate_mingxuan','library')==='他在看漫畫，翻頁翻得很慢。');
  SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY','x'); check('4. 明軒朋友以上約總圖：看過他念書（SAW_HIM_STUDY）→「他沒有拿漫畫出來。」',SOCIAL.meetLine('classmate_mingxuan','library')==='他沒有拿漫畫出來。');
  R('heroine_04',10); check('4. 子晴「認識」約溫州街：沒有那一格（溫州街要朋友才約得到）',SOCIAL.meetLine('heroine_04','wenzhou')===null);
  // ---------- 5. 有伴侶時拿掉的旁白 ----------
  R('heroine_02',65,50,45); G.flags.dating_kexin=true; gm=mockGM(); await SOCIAL.playUp(gm,{name:'芷若'},'heroine_02');
  check('5. 祐廷交往中：芷若好朋友那句沒有「從來沒傳給誰」的旁白（BB_169 Z-3 已拿掉 solo 旁白：三句照說）',gm.out.length===3&&!gm.out.some(t=>t.indexOf('從來沒傳給誰')>=0),gm.out.join('｜'));
  G.flags.dating_kexin=false; G.social.relUp.heroine_02=0; gm=mockGM(); await SOCIAL.playUp(gm,{name:'芷若'},'heroine_02');
  check('5. 單身：一樣三句（BB_169 Z-3）',gm.out.length===3&&gm.out[2]==='S:「我覺得這張最好看。那杯沒有客人點，我自己喝掉了。」',gm.out.join('｜'));
  // ---------- 6. 約好的見面（INV.meet）、手機聯絡人 ----------
  R('heroine_04',25); G.social.relUp.heroine_04=0; const iv={id:'m1',who:'heroine_04',place:'cafe',zone:'cafe',day:G.day,h:15,state:'going',by:'player'}; G.invites=[iv];
  const said=[]; const GMm={G,sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push(t); },choose:async()=>0,fade:async()=>{},advance(dh){ G.hour+=dh; },caption(){},autosave(){}};
  await INV.meet(GMm,iv,null);
  check('6. 約好的見面：門檻台詞（有點熟）→ Café 的旁白（有點熟）→ 見面結束的一句',said[0]==='「喔你來了。」'&&said[1]==='「等我一下，我回個訊息。」'&&said[2]==='她寫程式，你念書。她偶爾念出一行錯誤訊息。'&&said[said.length-1]==='「好。掰。」',said.join('｜'));
  const titleR=()=>PHONE.title(G,'p:heroine_04'); G.social.mem.heroine_04=[]; R('heroine_04',25); const t0=titleR();
  check('6. 還沒見過（沒有 FIRST_MET）：手機上照舊「不認識的女生」，聯絡人名稱不提前露出名字',t0==='不認識的女生',t0);
  SOCIAL.remember('heroine_04','FIRST_MET','x'); const t1=titleR(); R('heroine_04',45,30); const t2=titleR();
  check('6. 手機的對話標題（聯絡人）：有點熟「高子晴（吉他社）」→ 朋友「子晴」',t1==='高子晴（吉他社）'&&t2==='子晴',t1+' → '+t2);
  check('6. 沒有資料的人照舊（可昕：phoneName「可昕」）',PHONE.title(G,'p:kexin')==='可昕',PHONE.title(G,'p:kexin'));
  // ---------- 7. 接線 ----------
  const s3=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), tc=s3.slice(s3.indexOf('S.talkCharacter=async function'),s3.indexOf('let GM_ref=null'));
  check('7. talkCharacter：閒聊之前先看門檻台詞',/SOCIAL\.playUp&&await SOCIAL\.playUp\(GM,who,id\)/.test(tc)&&tc.indexOf('SOCIAL.playUp')<tc.indexOf('S.smallTalk(G,id)'));
  const fn=name=>s3.slice(s3.indexOf('async function '+name+'(GM,n)'),s3.indexOf('\n',s3.indexOf('async function '+name+'(GM,n)')+40)+600);
  check('7. 舊的對話函式也先說門檻台詞：以安、阿哲、學姊、阿凱、Alison',[['talkAn','heroine_01'],['talkZhe','zhe'],['talkSis','heroine_05'],['talkKai','kai'],['talkYu','yu']].every(([f,id])=>fn(f).indexOf("relUp(GM,'"+id+"',n)")>=0));
  check('7. index.html 載入 data/rel_lines.js',/src\/data\/rel_lines\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
