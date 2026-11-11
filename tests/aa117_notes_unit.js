// 朋友的案子：手機筆記畫面（AA117-CASE-NOTES-1031；AA_117 第 1 節「畫面上是祐廷的手機筆記，四行」，照 C1 阿凱的鍵盤的做法）——不需要瀏覽器。
//   0 讀稿：AA_117 第 1 節四行、C1 的四行（BB_154）、C2／C5／C7 自動填好的格子（BB_70 8b-1）、C3 誰／向誰（AA_325）
//   1 C2 芷若的試譯稿費（手機）：11/11 那一則的回覆帶手機筆記四行；回覆選項照舊；選了以後照舊
//   2 game3d.js 的 noteHint：回覆按鈕上面放「手機筆記」和那幾行（從 game3d.js 抽那一行跑；沒有 note 的訊息＝空字串）；threadHTML 有接
//   3 C3 押金（當面）：「手機筆記」四行，玩家選的「依據什麼：」「請求什麼：」各自緊接那一組選項；旁白「先寫了兩行」拿掉（AA-B 2026-11-01）；其他台詞、旗標照舊
//   4 C1 照舊（四行在、字不變）
//   5 2026-11-01 AA-B 回覆（D109，經 LAWWW-B 轉）補的六件，每件都是四格（誰／向誰／依據什麼／請求什麼，玩家選的那一行寫到「：」為止）：
//     C0 韋綸（當面＝事件、沒去＝群組）、C4 阿哲的機車（手機）、C5 子晴的配樂（當面；補「誰」的選項，照 BB_70 8b-1）、C6 Alison 的社團經費（當面、手機）、
//     C7 阿凱的 bug（手機）、C8 子晴的合約（手機）；回覆選項、原本的台詞照舊；格子旁邊寫 LEGAL_REVIEW_REQUIRED
//   6 九件總表（C0～C8）：每件四格、順序對、玩家選的一到兩行寫到「：」為止、其他格子填好
// 修改前：開發分支 bfafd1a62＝1、2、3、5、6 FAIL；aa639795a（只有 C2、C3 那一版）＝3（旁白還在）、5、6 FAIL。用法：node tests/aa117_notes_unit.js
//   （稿用 git show 讀；在沒有 .git 的目錄跑時，設環境變數 XC_GIT_DIR＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js','src/game3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{};
const GITDIR=process.env.XC_GIT_DIR||H.ROOT;
const doc=(refs,f)=>{ for(const r of refs){ try{ const t=cp.execSync('git -c core.quotepath=false show "'+r+':docs/story_planning/'+f+'"',{cwd:GITDIR,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); if(t) return t; }catch(e){} } return ''; };
const B='origin/claude/story-planning';
const DOC117=doc(['4618aed21',B],'AA_117_朋友的案子_四個問題.md'), DOC70=doc(['4618aed21',B],'BB_70_日常與邀約_芷若_子晴_溫學姊_配角.md'),
  DOC154=doc(['968473469',B],'BB_154_AB27_大一下缺口_學姊傳書_阿凱鍵盤.md'), DOC325=doc([B],'AA_325_事件包_第2輪之一_大二.md'), DOC98=doc([B],'BB_98_交接包v4_大三.md');
const D=k=>STORY.dayOfKey(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
/* 照順序記下台詞和選項（看「依據什麼：」是不是緊接在那一組選項前面）*/
let LOG=[]; const say0=GM.say, choose0=GM.choose;
GM.say=async(who,t)=>{ LOG.push({who:who?(who.name||String(who)):null,t:String(t)}); return say0(who,t); };
GM.choose=async o=>{ LOG.push({choice:o.map(q=>q.t||q.text)}); return choose0(o); };
const NOTE_C2=['誰：芷若','向誰：出版社','依據什麼：','請求什麼：照用的部分付稿費，或不要用'];
/* 九件的四格。自動填好的字：C1 BB_154；C2、C5 向誰、C7 誰／請求什麼 BB_70 8b-1；C3 AA_325；其他照 AA-B 2026-11-01 回覆（D109，經 LAWWW-B 轉：C0 誰／向誰／請求什麼、C4 誰／依據什麼／請求什麼、
   C5 請求什麼、C6 誰／向誰／依據什麼、C7 依據什麼、C8 誰／向誰／依據什麼）。寫到「：」為止的＝玩家選的那一行 */
const NOTE={
  C0:['誰：韋綸（買到別人被偷的車）','向誰：賣家（原車主會來要車）','依據什麼：','請求什麼：跟賣家把錢要回來（車還給原車主）'],
  C1:['誰：阿凱','向誰：賣家','依據什麼：（還不知道。民總的課本？）','請求什麼：'],
  C2:NOTE_C2,
  C3:['誰：阿哲的學長','向誰：房東','依據什麼：','請求什麼：'],
  C4:['誰：阿哲（被擦撞的人）','向誰：','依據什麼：對方不小心造成的損壞','請求什麼：照修車行的估價付修車費'],
  C5:['誰：','向誰：學妹','依據什麼：','請求什麼：請學妹同意，講清楚怎麼用（能不能放進要賣的遊戲、要不要寫名字）'],
  C6:['誰：社團（她是負責人）','向誰：經手的學弟，和社團大家','依據什麼：社團的規則、收支表和單據','請求什麼：'],
  C7:['誰：阿凱','向誰：','依據什麼：公司和玩家之間的使用規定','請求什麼：玩家要道具回來'],
  C8:['誰：子晴（要簽約的人）','向誰：發行商','依據什麼：合約本身（權利歸誰、錢怎麼分、怎麼解約）','請求什麼：'] };
const GOT={};   /* 遊戲裡實際看到的四行（第 6 節總表用）*/
const C3_NARR='（你打開手機的筆記，先寫了兩行：誰——阿哲的學長；向誰——房東。）';

(async()=>{
  check('0. 載入（index.html 上的 src 檔，game3d.js 另外讀）',!loadErr.length,loadErr.join(' / '));
  /* ======================= 0 讀稿 ======================= */
  check('0. AA_117 第 1 節：手機筆記四行（誰、向誰、依據什麼、請求什麼）、每件只有一到兩行要玩家選、其他自動填好',DOC117.includes('畫面上是祐廷的手機筆記，四行')&&['   - 誰：','   - 向誰：','   - 依據什麼：','   - 請求什麼：'].every(k=>DOC117.includes(k))&&DOC117.includes('每件只有一到兩行要玩家選'));
  check('0. C1 的四行（BB_154）：誰：阿凱／向誰：賣家／依據什麼：（還不知道。民總的課本？）／請求什麼：← 玩家選',['  - 誰：阿凱','  - 向誰：賣家','  - 依據什麼：（還不知道。民總的課本？）','  - 請求什麼：'].every(k=>DOC154.includes(k)));
  { const row=(DOC70.split('\n').find(l=>l.startsWith('| C2 芷若的試譯稿費'))||'');
    check('0. C2（BB_70 8b-1）：自動填好的「誰＝芷若；向誰＝出版社；請求什麼＝照用的部分付稿費，或不要用」、玩家選「依據什麼」；AA_117 C2 請求什麼同一句',row.includes('| 誰＝芷若；向誰＝出版社；請求什麼＝照用的部分付稿費，或不要用 | **依據什麼** |')&&DOC117.includes('- 請求什麼：照用的部分付稿費，或不要用。'),row.slice(0,120)); }
  check('0. C3（AA_325）：旁白「'+C3_NARR+'」；AA_117 C3 重點一依據什麼、重點二請求什麼',DOC325.includes('> '+C3_NARR)&&DOC117.includes('- 重點一：**依據什麼**。')&&DOC117.includes('- 重點二：**請求什麼**。'));

  /* ======================= 1 C2 芷若的試譯稿費（手機）======================= */
  await sec('1',async()=>{
  const run=(G,d,h0,h1)=>{ G.day=d; for(let h=h0;h<=h1+1e-9;h+=0.25){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
  const setup=flags=>{ const d=D('2026-11-11'); const G=H.fresh('2026-11-11',21,'dorm',Object.assign({introDone:true},flags||{})); H.FAMILIAR('heroine_02'); G.contacts=G.contacts||{}; G.contacts.heroine_02=0; return {G,d}; };
  { const {G,d}=setup({}); run(G,d,21,22.5); const m=PHONE.byAsk(G,'r3_zr_fee');
    GOT.C2=m&&m.ask&&m.ask.note;
    check('1. 沒有 U_CONTRACT：11/11 22:07 那一則的回覆帶手機筆記四行（字照 BB_70 8b-1）；選項照舊一個',!!m&&J(m.ask.note)===J(NOTE_C2)&&J(m.ask.opts.map(o=>o.t))===J(['妳先把你們的對話拍給我看。']),J(m&&m.ask)); }
  { const {G,d}=setup({U_CONTRACT:true}); run(G,d,21,22.5); const m=PHONE.byAsk(G,'r3_zr_fee');
    check('1. 有 U_CONTRACT：一樣四行；選項照舊兩個',!!m&&J(m.ask.note)===J(NOTE_C2)&&J(m.ask.opts.map(o=>o.t))===J(['妳先把你們的對話拍給我看。','先看你們說好了什麼。']),J(m&&m.ask));
    PHONE.answer(G,'r3_zr_fee',1); const T=(G.msgs||[]).filter(x=>x.th==='p:heroine_02').map(x=>(x.from||'')+':'+x.text);
    check('1. 選了以後照舊（祐廷接著傳「說好試譯不付錢，是試譯。……」、ZR_FEE contract）；筆記不是訊息（對話串裡沒有「誰：芷若」）',G.flags.ZR_FEE==='contract'&&T.includes('player:說好試譯不付錢，是試譯。拿去用，就不是試譯了。')&&!T.some(t=>/誰：|向誰：|依據什麼：|請求什麼：/.test(t)),J(T)); }
  });

  /* ======================= 2 game3d.js noteHint ======================= */
  await sec('2',async()=>{ const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); const mm=/\n  const noteHint=(m=>\{.*\});\n/.exec(src);
    check('2. game3d.js 有 noteHint、threadHTML 在回覆按鈕前面接（needHint→noteHint→askBtns）',!!mm&&src.includes('(needHint(m)+noteHint(m)+askBtns(m))'));
    if(!mm) return; const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); const f=new Function('escH','return ('+mm[1]+');')(escH);
    const h=f({ask:{note:NOTE_C2.concat(['<b>'])}}), z=f({ask:{opts:[]}}), z2=f({text:'x'});
    check('2. noteHint：有 note＝「手機筆記」＋每一行（逐行、跳脫）；沒有 note＝空字串',h.includes('<b>手機筆記</b><br>誰：芷若<br>向誰：出版社<br>依據什麼：<br>請求什麼：照用的部分付稿費，或不要用<br>&lt;b&gt;')&&z===''&&z2==='',h); });

  /* ======================= 3 C3 押金（當面）======================= */
  await sec('3',async()=>{
  const dep=async(flags,picks)=>{ const G=H.fresh('2027-03-23',18,'noodle',Object.assign({introDone:true},flags||{})); SOCIAL.remember('zhe','FIRST_MET',''); LOG=[]; H.said=[]; H.opts=[]; H.picks=picks.slice(); await EVENTS.run(ev('ev_zhe_deposit')); return G; };
  { const G=await dep({U_LEASE:true},['押金是擔保','合理']); const nt=LOG.filter(x=>x.who==='手機筆記').map(x=>x.t), c=LOG.map((x,k)=>x.choice?k:-1).filter(k=>k>=0); GOT.C3=nt;
    const iA=LOG.findIndex(x=>x.who==='手機筆記'&&x.t==='依據什麼：'), iR=LOG.findIndex(x=>x.who==='手機筆記'&&x.t==='請求什麼：'), i0=LOG.findIndex(x=>x.who==='手機筆記');
    check('3. 「手機筆記」：誰：阿哲的學長／向誰：房東／依據什麼：（緊接依據的選項）……請求什麼：（緊接請求的選項）；接在阿哲「兩個月的押金耶。」後面',J(nt)===J(NOTE.C3)&&c.length===2&&iA===c[0]-1&&iR===c[1]-1&&i0>0&&LOG[i0-1].t==='兩個月的押金耶。他本來要拿去買系籃鞋。',J(LOG.slice(Math.max(0,i0-1),i0+5)));
    check('3. 旁白「'+C3_NARR+'」拿掉（AA-B 2026-11-01：和筆記重複）；y2r2_3d.js 也沒有這一句的資料',!LOG.some(x=>x.t===C3_NARR)&&!fs.readFileSync(path.join(H.ROOT,'src/y2r2_3d.js'),'utf8').includes("text:'"+C3_NARR+"'"));
    check('3. 依據的選項（有 U_LEASE 三個）、請求的選項（兩個）照舊；其他台詞、旗標照舊（ZHE_DEPOSIT lease／fair、ZHE_PHOTOS）',J(LOG[c[0]].choice)===J(['「先把租約和搬進來的照片給我看。」','「押金是擔保，扣要說得出理由。」','「我不確定。週六去法服問。」'])&&J(LOG[c[1]].choice)===J(['「全部退。」','「退押金，牆要補就扣合理的錢。」'])&&H.has('押金是擔保。房東要扣，要說得出弄壞了什麼、修要多少。正常住的痕跡不一樣。')&&H.has('……好啦，那個洞是他掛球衣的。')&&H.has('好。你寫的那幾行傳給我，我轉給他。')&&G.flags.ZHE_DEPOSIT&&G.flags.ZHE_DEPOSIT.basis==='lease'&&G.flags.ZHE_DEPOSIT.ask==='fair'&&SOCIAL.has('zhe','ZHE_PHOTOS'),J(LOG.filter(x=>x.choice))); }
  { await dep({},[]); const c=LOG.filter(x=>x.choice); check('3. 沒有 U_LEASE：依據的選項照舊兩個；筆記一樣四行',c.length===2&&c[0].choice.length===2&&J(LOG.filter(x=>x.who==='手機筆記').map(x=>x.t))===J(NOTE.C3),J(c)); }
  });

  /* ======================= 4 C1 照舊 ======================= */
  { const e=ev('ev_kai_keyboard'), N=(e&&e.dialogue||[]).filter(l=>l&&l.speaker==='手機筆記').map(l=>l.text);
    GOT.C1=N;
    check('4. C1 阿凱的鍵盤照舊：四行（誰：阿凱／向誰：賣家／依據什麼：（還不知道。民總的課本？）／請求什麼：）',J(N)===J(['誰：阿凱','向誰：賣家','依據什麼：（還不知道。民總的課本？）','請求什麼：']),J(N)); }
  /* ======================= 5 AA-B 回覆補的六件（2026-11-01，D109）======================= */
  const notesIn=()=>LOG.filter(x=>x.who==='手機筆記').map(x=>x.t);
  const firstNote=()=>LOG.findIndex(x=>x.who==='手機筆記');
  await sec('5',async()=>{
  /* ---- C0 韋綸：當面（ev_y0_p2b 腳踏車那一段，經濟系大一上 11/7）---- */
  { const G=H.fresh('2024-11-07',12,'campus',{introDone:true}); G.stage='econ'; const bd=STORY.bikeDay&&STORY.bikeDay(); LOG=[]; H.said=[]; H.opts=[]; H.picks=['跟去']; await EVENTS.run(ev('ev_y0_p2b'));
    const i=firstNote(), nt=notesIn(); GOT.C0=nt;
    check('5. C0 當面：腳踏車那一段走到總圖，「手機筆記」四行連著、接著選從哪裡翻（「買賣」「所有權」「從目錄翻」照舊）',bd===G.day&&J(nt)===J(NOTE.C0)&&i>0&&LOG.slice(i,i+4).every(x=>x.who==='手機筆記')&&!!LOG[i+4]&&J(LOG[i+4].choice)===J(['「買賣」','「所有權」','「從目錄翻」'])&&/^…….+，你不是在看法律的書嗎？$/.test(LOG[i-1].t),J(LOG.slice(Math.max(0,i-1),i+5)));
    check('5. C0 當面：查完以後祐廷說的三件事照舊（LEGAL_REVIEW_REQUIRED 的字不動）、記 BIKE_LOOKED_UP',H.has('被偷的東西，就算你是花錢買的，原主在被偷以後兩年內都可以要回去。')&&H.has('可是你可以去找賣你的人。他賣的不是自己的東西，要負責。對話和交易紀錄都留著。')&&G.flags.BIKE_LOOKED_UP===true); }
  /* ---- C0 韋綸：沒去版（群組 11/7 17:30）---- */
  { const G=H.fresh('2024-11-07',17.4,'dorm',{introDone:true}); G.stage='econ'; for(const h of [17.5,17.6]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } const m=PHONE.byAsk(G,'y0_bike');
    check('5. C0 群組版：「我的車被認走了。有沒有人懂法律？」的回覆帶同樣四行；選項照舊（查完再回）（不回）',!!m&&J(m.ask.note)===J(NOTE.C0)&&J(m.ask.opts.map(o=>o.t))===J(['（查完再回）','（不回）']),J(m&&m.ask)); }
  /* ---- C4 阿哲的機車（手機 2027-11-19 21:00）---- */
  for(const U of [false,true]){ const G=H.fresh('2027-11-19',21.05,'dorm',Object.assign({introDone:true},U?{U_TORT:true}:{})); H.FAMILIAR('zhe'); (G.contacts||(G.contacts={})).zhe=0; R2Y3A.c4Phone(G); PHONE.tick(G); const m=PHONE.byAsk(G,'y3_c4'); if(!U) GOT.C4=m&&m.ask&&m.ask.note;
    check('5. C4'+(U?'（有 U_TORT）':'')+'：「要簽嗎」的回覆帶四行；向誰的選項照舊（'+(U?'兩個':'一個')+'）',!!m&&J(m.ask.note)===J(NOTE.C4)&&m.ask.opts.length===(U?2:1)&&m.ask.opts[0].t==='找對方談。後面怎麼賠，我們去法服問。',J(m&&{note:m.ask.note,opts:m.ask.opts.map(o=>o.t)})); }
  /* ---- C5 子晴的配樂（當面，Q10 那一場的後半）---- */
  { const G=H.fresh('2027-11-09',19.5,'cafe',{introDone:true}); H.FRIEND('heroine_04'); LOG=[]; H.said=[]; H.opts=[]; H.picks=[0,1,0]; await EVENTS.run(ev('ev_ziqing_capstone'));
    const i=firstNote(), nt=notesIn(); GOT.C5=nt; const c=LOG.map((x,k)=>x.choice?k:-1).filter(k=>k>i);
    check('5. C5：子晴「我要簽什麼？我會不會被告？」後面「手機筆記」四行，接著選「誰」（BB_70 8b-1 兩個選項）',J(nt)===J(NOTE.C5)&&i>0&&LOG[i-1].t==='我要簽什麼？我會不會被告？'&&c[0]===i+4&&J(LOG[c[0]].choice)===J(['「妳會不會被告，我不確定。我們問法服。」','「這件事的主角是學妹。那是她的歌，是妳要請她同意。」']),J(LOG.slice(Math.max(0,i-1),i+6)));
    check('5. C5：選正解「是妳要請她同意」→「……對耶。我一直在想我自己。」；再選「依據什麼」（沒有 U_COPYRIGHT 只有原本那一句）→ 後面照舊、記 ZQ_C5_WHO her',LOG[c[0]+1].t==='……對耶。我一直在想我自己。'&&J(LOG[c[1]].choice)===J(['「法律上大概是：要她同意、講清楚怎麼用。……可是妳真正想要的是什麼？」'])&&LOG[c[1]+1].t==='（她想了很久。）'&&H.has('……我想要她的歌在我的遊戲裡，而且她很開心。')&&H.has('那妳們先把說好的事寫下來。誰做什麼、做完歸誰、可不可以放在別的地方。')&&G.flags.ZQ_MUSIC_CREDIT===true&&G.flags.ZQ_C5_WHO==='her'&&!H.said.some(s=>/第.+條|違法|合法|著作權法/.test(s.t)),J(LOG.slice(c[0],c[1]+2))); }
  { const G=H.fresh('2027-11-09',19.5,'cafe',{introDone:true,U_COPYRIGHT:true}); H.FRIEND('heroine_04'); LOG=[]; H.said=[]; H.opts=[]; H.picks=[0,0,1]; await EVENTS.run(ev('ev_ziqing_capstone'));
    const i=firstNote(), c=LOG.map((x,k)=>x.choice?k:-1).filter(k=>k>i);
    check('5. C5（自學過著作權）：選老實的「誰」→「……好。可是我比較想知道，她會不會開心。」；「依據什麼」多一個「要講清楚：……」，選了祐廷接著問「可是妳真正想要的是什麼？」',LOG[c[0]+1].t==='……好。可是我比較想知道，她會不會開心。'&&J(LOG[c[1]].choice)===J(['「法律上大概是：要她同意、講清楚怎麼用。……可是妳真正想要的是什麼？」','「要講清楚：能不能放進要賣的遊戲、能不能改編、要不要寫名字。」'])&&LOG[c[1]+1].t==='可是妳真正想要的是什麼？'&&LOG[c[1]+2].t==='（她想了很久。）'&&G.flags.ZQ_C5_WHO==='honest',J(LOG.slice(c[0],c[1]+3))); }
  { const row=(DOC70.split('\n').find(l=>l.startsWith('| C5 子晴的遊戲配樂'))||'');
    check('5. C5 的選項、反應、接的那一句都在 BB_70 8b-1 C5 那一列（一字不差）；原本那一句在 BB_98 4-2',['| 向誰＝學妹 |','「妳會不會被告，我不確定。我們問法服。」','「這件事的主角是學妹。那是她的歌，是妳要請她同意。」','「要講清楚：能不能放進要賣的遊戲、能不能改編、要不要寫名字。」','「……好。可是我比較想知道，她會不會開心。」','「……對耶。我一直在想我自己。」','「可是妳真正想要的是什麼？」'].every(t=>row.includes(t))&&DOC98.includes('祐廷：「法律上大概是：要她同意、講清楚怎麼用。……可是妳真正想要的是什麼？」'),row.slice(0,80)); }
  /* ---- C6 Alison 的社團經費：當面（3/16 12:30 A館一樓）、手機（3/15 選「現在說？」）---- */
  { const G=H.fresh('2028-03-16',12.6,'linze',{introDone:true,met_yu:true}); H.FAMILIAR('yu'); LOG=[]; H.said=[]; H.opts=[]; H.picks=['把帳攤開']; await EVENTS.run(ev('ev_yu_club_money'));
    const i=firstNote(), nt=notesIn(); GOT.C6=nt;
    check('5. C6 當面：她說完兩句，「手機筆記」四行，「請求什麼：」緊接請求的選項（照舊兩個）；後面照舊',J(nt)===J(NOTE.C6)&&LOG[i-1].t==='我不想讓他覺得我在懷疑他。可是三千塊。'&&J(LOG[i+4].choice)===J(['「要學弟賠。」','「把帳攤開，請大家補單據。」'])&&H.has('……好。這樣比較不像在抓人。')&&H.has('那先找社團的指導老師。這個不用去法服。')&&G.flags.YU_C6==='open',J(LOG.slice(Math.max(0,i-1),i+5))); }
  { const G=H.fresh('2028-03-15',21.05,'dorm',{introDone:true,met_yu:true}); H.FAMILIAR('yu'); (G.contacts||(G.contacts={})).yu=0; R2Y3B.c6Phone(G); PHONE.tick(G); const r=PHONE.answer(G,'y3_yu_c6',1); PHONE.tick(G); const m=PHONE.byAsk(G,'y3_yu_c6_phone');
    check('5. C6 手機（選「現在說？」）：她的訊息最後一則的回覆帶同樣四行；選項照舊',!!r&&!!m&&J(m.ask.note)===J(NOTE.C6)&&J(m.ask.opts.map(o=>o.t))===J(['要學弟賠。','把帳攤開，請大家補單據。']),J(m&&m.ask)); }
  /* ---- C7 阿凱的 bug（手機 2028-11-22 23:40）---- */
  { const G=H.fresh('2028-11-22',23.75,'dorm',{introDone:true}); H.FAMILIAR('kai'); R3.kaiK5(G); PHONE.tick(G); const m=PHONE.byAsk(G,'r3_kai_k5'); GOT.C7=m&&m.ask&&m.ask.note;
    check('5. C7：「這次不是開玩笑」的回覆帶四行；向誰的選項照舊（三個語氣）',!!m&&J(m.ask.note)===J(NOTE.C7)&&J(m.ask.opts.map(o=>o.t))===J(['先寫下來，明天問法務。','我不能給正式意見。','先修 bug。']),J(m&&m.ask&&{note:m.ask.note,opts:m.ask.opts.map(o=>o.t)})); }
  /* ---- C8 子晴的合約（手機 2028-10-11 21:00）---- */
  { const G=H.fresh('2028-10-11',21.05,'dorm',{introDone:true}); H.FRIEND('heroine_04'); (G.contacts||(G.contacts={})).heroine_04=0; Y34B.q14Phone(G); PHONE.tick(G); const m=PHONE.byAsk(G,'y4_q14'); GOT.C8=m&&m.ask&&m.ask.note;
    check('5. C8：「你看得懂嗎」的回覆帶四行；請求什麼的選項照舊',!!m&&J(m.ask.note)===J(NOTE.C8)&&J(m.ask.opts.map(o=>o.t))===J(['我陪妳去找律師。我先幫妳把看不懂的地方標起來。','我還是學生，不能給妳正式的法律意見。']),J(m&&m.ask&&{note:m.ask.note,opts:m.ask.opts.map(o=>o.t)})); }
  /* ---- 程式註解：法律方向標 LEGAL_REVIEW_REQUIRED（專案慣例）---- */
  { const F=['src/data/events.js','src/story3d.js','src/r2y3a3d.js','src/data/y2b_events.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/r3_3d.js','src/y34b3d.js'], bad=F.filter(f=>!/手機筆記（AA_117 C\d[^\n]*(\n[^\n]*)?LEGAL_REVIEW_REQUIRED/.test(fs.readFileSync(path.join(H.ROOT,f),'utf8')));
    check('5. 六件補的格子旁邊都寫了 LEGAL_REVIEW_REQUIRED（只寫方向、不寫結論）',!bad.length,J(bad)); }
  });

  /* ======================= 6 八件總表 ======================= */
  { const K=['C0','C1','C2','C3','C4','C5','C6','C7','C8'], H4=['誰：','向誰：','依據什麼：','請求什麼：'], bad=[];
    for(const k of K){ const L=GOT[k], blank=(L||[]).filter((t,i)=>t===H4[i]).length;
      if(!Array.isArray(L)||L.length!==4||!L.every((t,i)=>String(t).startsWith(H4[i]))||J(L)!==J(NOTE[k])||blank<1||blank>2) bad.push(k+'：'+J(L)); }
    check('6. 九件（C0～C8：C1 原本就有，另外八件這次接）在遊戲裡都看得到四格：順序 誰／向誰／依據什麼／請求什麼、玩家選的一到兩行寫到「：」為止、其他格子都填好',!bad.length,bad.join(' / ')); }
  H.done();
})();
