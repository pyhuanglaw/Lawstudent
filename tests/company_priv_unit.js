// 旁邊有她的人時，私密的東西不出、等她一個人（COMPANY-PRIV-1028；AA 2026-10-28 06:14 定案，AA_503 第 13 節第 3 點）——不需要瀏覽器。
// src/privtalk3d.js（清單 PRIVTALK.LIST、各入口的接線）、src/story3d.js（STORY.privNow／crowdNow、offerInvite）、src/multirel3d.js（PRE_TALK 問 PRIVTALK.ok）。
//   0  載得到、index.html 順序；STORY.privNow＝COMPANY 的反面；清單每一筆都接上、涵蓋 AA 的每一類；呼叫的地方（offerInvite、multirel3d.js）
//   1  約會（「約她去…」）、各檔標 priv 的一次性選項：旁邊有人不出，交換聯絡方式、一般的選項照常；她一個人照常
//   2  坦白有別人（ROM.tellBy）：以安「我有件事要跟妳講。」、學姊「（下次見面，自己跟她講…的事）」——旁邊有人不出
//   3  她知情以後：MREL.meetAction（說話時的發現：不演、pend 留著；正式約會不擋；學姊正常見面照記）、吧檯的芷若、1A-02 攤牌以後那一句、沛珊「對一次」、子晴爸爸那一句
//   4  還沒公開的事：沒回的那一句（zq_dad、ps_plan：不說、不記說過）、事件（Z4、Z7、P3、Q8、Q8b：旁邊有人不成立、照常說話）、傅鐘那一個選項、
//      閒聊階梯（整層：Y-L7、Y7-L8；換進私密那一版才擋：Z3-L6、P3-L6、Z2-L6；原本那一版照播）、Y4-L6 的第二個選項、真的圈子（語彤和筱涵）、until／from
//   5  不會永久卡住：有期限的那幾筆，期限內照圈子的資料都有她一個人的時候（事件、閒聊階梯那幾層）
//   6  一般閒聊照常：旁邊有人時一般的階梯照播、照常前進；被擋下的那一層隔天她一個人時播
// 修改前（開發分支 c701f8b5e：git archive 那一版的 src、tests、index.html、白名單，放進這支測試實際跑，2026-10-28）：FAILED 19、PASS 7
//   （沒有 PRIVTALK，清單那 4 項沒跑；PASS＝原本就有的「約她去…」與兩個 priv 選項 4 項、學姊正常見面照記、事件期限的圈子資料、一般的那一層照播）。修改後 ALL PASS（30 項）。
// 第三輪（PRIV-AAFIX-1028：AA_503 第 14 節，企劃線 6bc3cd784——第一輪問的 12 項＋共同的保底）：
//   0  對稿（git show 劇情匯入白名單上 AA_503 那一版）：保底的旁白、第 9 項的旁白、第 10 項的兩句一字不差；S.DECIDED 12 項；呼叫的地方（offerInvite 每個選項問自己那一筆、選了 privLead）
//   7  共同的保底：沒有期限的（閒聊階梯 Y-L7、坦白的選項、知情的發現、1A-02 那一句、分開以後子晴那一句、傅鐘的選項、Y4-L6 的選項）第 1 天擋→第 7 天還擋→第 8 天照演＋旁白、
//      她一個人＝沒有旁白、演了就清掉等待；有期限的（P3 我要重考、Z7 她交件了、沒回的那一句）不照 7 天、到期那天照演＋旁白；沒有要演的時候不記（知情、1A-02）；舊存檔沒有 PRIVWAIT
//   8  第 1～12 項：1 芷若×子晴自己說（旁邊只有對方本人照演）、2 分開以後（子晴「嗨。」、吧檯的芷若）、3 學姊美國交換（11/9）、4 沛珊和柏翰分開（第 6 週週五）、5 明軒的事（9/5）、
//      6 語彤租約的選項不擋、7 交往中那一版改說一般版（階梯 extraIf／linesIf、招呼、回覆、沒回那一句；沒有一般版照演；不記等待）、8 子晴爸爸的階梯不擋、9 Q7 兩場開頭的旁白、
//      10 前任那兩句擋（其他招呼不擋）、11 到場就演的不改、12 例外只限三組（假的圈子＋真的圈子：麵店的阿姨）
//   修改前（開發分支 68944901f：git archive 那一版的 src、index.html、白名單，放進這支測試實際跑，對稿 PRIV_GIT_DIR＝這個 repo，2026-10-28）：FAILED 29、PASS 30
//   （FAIL＝第 0 段改寫的 3 項〔呼叫的地方、定案紀錄、對稿：舊白名單 d13ab3ab7 沒有第 14 節〕、第 7 段 14 項、第 8 段 12 項；PASS＝第 0～6 段原本的 28 項、第 8 段「不擋」的第 6、8 項）。修改後 ALL PASS（59 項）。
//   全部 Node 單元測試（tests/*_unit.js，686863145，2026-10-28）：714 支、失敗 0（第一次跑 two_hearts_unit 失敗＝1A-02 那一句的判斷取名 S.twoHeartsDue 蓋掉 11/10 法圖相遇那一個，改名 S.twoHeartsEchoDue 以後通過）。
// 第 14 節後補（PRIV-AAFIX-1028 後補：AA_503 第 14 節後補，企劃線 0e46fdc7e——AA 回 LAWWW-C 09:03 問的 4 點，1、2 照現在，3、4 改）：
//   3  學姊（沒有知情的流程要動）一般見面那一筆：旁邊有人＝不記（原本照記 sisMet）
//   7  (e) 選項出來了、玩家沒選＝不重新算：照舊從第一次擋下來那天算，第 4 天還擋、第 8 天旁邊有人也出（「我有件事要跟妳講。」、「約她去…」）
//   9  對稿（白名單上 AA_503 那一版的第 14 節後補）、PRIVTALK.LATER；第 3 項擋下來沒演的不算知情的次數：學姊一般見面（meets、sisMet）、兩次以後的結果（擋下來不記 sisMet）、
//      語彤被打擾（dist／distant：第一次、第二次旁邊有人都不算）、只有次數的那一次等了 7 天（STORY.talkCharacter：第一句旁白、照常說話、算一次）、類似的（可昕收回以後的 w）
//   修改前（開發分支 6d1863024＝上一輪合併以後：git archive 那一版的 src、index.html、白名單，放進這支測試實際跑，對稿 PRIV_GIT_DIR＝這個 repo，2026-10-28）：FAILED 8、PASS 57
//   （FAIL＝3 的學姊一般見面、7 (e) 不重算、9 的 6 項〔對稿：舊白名單 6bc3cd784 沒有後補〕；PASS＝其他原本的 57 項）。修改後 ALL PASS（65 項）。
// 第 14 節後補第 5 點（AA 09:34 回 LAWWW-C 09:33，企劃線 19b4307eb）：語彤在麵店，阿姨不算「旁邊有人」——清單 knows_talk 的 except 依人物 {heroine_03:['hc_ayi']}（S.exceptOf）：
//   9  第 5 點：麵店的發現（kind noodle）旁邊只有阿姨＝照演、不記等待；阿姨＋別的同伴＝擋（記等待、發現留著）；打擾（kind talk）只有阿姨＝算第一次，阿姨＋別人＝不算；對稿多三句、LATER 5 項
//   修改前（只拿掉 src/privtalk3d.js 的改動，白名單、測試用新的，2026-10-28 09:4x）：FAILED 2（9 對稿 LATER 5 項、9 第 5 點）；修改後 ALL PASS（66 項）
//   全部 Node 單元測試（15fca7b48＝合併開發分支 8a62128a5 以後，2026-10-28）：721 支、失敗 1——room_ceiling_unit（linze_interior.glb 的 ceiling、light_panel 有 12／70 個三角形不是單面朝下：
//   開發分支 ac2ab0ae9 霖澤館大廳第二版的 GLB，這一輪沒有動；只讀 GLB，不載 src）。
// 第 14 節後補第 6、7 點（PRIV-AUNT-1028：AA 回 LAWWW-C，企劃線 5ec2fe771；BB-C 11:41 在 v9.10.13 rc2 測出——2025-09-09 週二 18:12 麵店，語彤旁邊只有阿姨，知情場景照演，
//   演完「約她去…」「（下次見面，自己跟她講…的事）」被阿姨擋；週二、四 18:00～19:00 那一場她問「阿姨呢？」「去買東西。」，3D 的阿姨就站在旁邊）：
//   第 6 點：語彤在麵店，阿姨對她所有私密的都不算「旁邊有人」——src/privtalk3d.js S.PLACE_EXCEPT（S.crowd 依人物＋區域，和清單那一筆的 except 合起來，S.exceptAt）；
//   第 7 點：「今天很忙喔？」那一段的 auntIn 看 3D 的阿姨——src/multirel3d.js S.auntIn → src/hcircle3d.js HCIRCLE.labelIn（圈子表 c503_6_2 那幾列現在成立）。
//   8  第 12 項（假的圈子）：「阿姨只對媽媽的事例外（約她去…照擋）」只留麵店以外（校園，測試強制阿姨在旁邊；遊戲裡阿姨只在麵店）＝照舊；
//      第 12 項（真的圈子：麵店的阿姨）：「約她去…」照擋改成照出（後補第 6 點），旁邊再多一個別的同伴才擋
//   9  對稿：PRIVTALK.LATER 7 項、REF2 加 5ec2fe771
//   10 第 6、7 點：對稿（稿上的兩點、遊戲裡那一段的 auntIn）；
//      (A) 麵店（測試強制旁邊的人）：只有阿姨＝「約她去…」、tell_later 照出、不記等待；阿姨＋別的同伴、只有別的同伴＝照擋；校園強制阿姨＝照擋（照舊）；
//          第 7 項交往中那一版：麵店只有阿姨＝說交往中那一版、阿姨＋別人＝一般版、校園強制阿姨＝一般版（照舊）；
//          真的圈子（BB 那一天 2025-09-09 18:12，HCIRCLE.arrange 生出阿姨）：companyOf＝["hc_ayi"]，選單有「約她去…」和 tell_later，選了不加旁白；旁邊多一個同伴＝兩個都不出
//      (B) auntIn＝HCIRCLE.labelIn：2025-09-09 18:12 在（c503_6_2 那一天擲到）、2025-09-16 18:12 不在（那一天沒擲到，語彤照樣顧店）、17:00 和 20:30 以後不在；
//          發現那一場（MREL.dueAuto）：3D 的阿姨在（GM.npc.hc_ayi）＝沒有「阿姨呢？」，有「阿姨，我等一下自己收。」「好啦，你們年輕人。」；3D 的阿姨不在＝「阿姨呢？」「去買東西。」
//   修改前（只拿掉這一次 src 的改動：git archive 這一版的 src、tests、index.html、白名單，把 src/privtalk3d.js、src/hcircle3d.js、src/multirel3d.js、src/data/multirel_lines.js 換回開發分支 1db6e495c，
//   對稿 PRIV_GIT_DIR＝這個 repo，2026-10-28 實際跑）：FAILED 8、PASS 65（FAIL＝8 第 12 項真的圈子〔「約她去…」被阿姨擋〕、9 對稿〔LATER 5 項〕、10 的 6 項〔對稿、(A) 強制、(A) 第 7 項、(A) 真的圈子、
//   (B) auntIn〔沒有 HCIRCLE.labelIn〕、(B) 3D 的阿姨在那一場〔舊的 19:00 規則 18:12 問「阿姨呢？」＝BB 測出的〕〕；PASS＝原本的 64 項、10 (B) 阿姨不在那一場）。修改後 ALL PASS（73 項）
// 用法：node tests/company_priv_unit.js（對稿要 git 拿得到白名單上 AA_503 那一版；在別的資料夾跑舊版：PRIV_GIT_DIR=<有這個 commit 的 repo>）
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
for(const [f,n] of [['src/sideq3d.js',['SIDEQ']],['src/data/needed_msgs.js',['NEEDED_MSGS']],['src/data/y2b_events.js',['Y2B_EVENTS']],['src/y2r2_3d.js',['Y2R2']],['src/data/r2y3a_events.js',['R2Y3A_EVENTS']],
  ['src/data/zrzq_events.js',['ZRZQ_LINES','ZRZQ_FILM','ZRZQ_TOLINES','ZRZQ_EVENTS']],['src/zrzq3d.js',['ZRZQ']],['src/data/sis_y2y3_events.js',['SISY23_LINES','SISY23_EVENTS']],['src/sis_y2y3_3d.js',['SISY23']],
  ['src/data/multirel_lines.js',['MULTIREL_LINES']],['src/multirel3d.js',['MREL']],['src/data/v6ex_lines.js',['V6EX_LINES']],['src/v6ex3d.js',['V6EX']],['src/data/pool_story.js',['POOL_STORY']],['src/pool3d.js',['POOL']],
  ['src/data/sis_b13_events.js',['SISB13_LINES','SISB13_HAND','SISB13_EVENTS']],['src/sis_b13_3d.js',['SISB13']],['src/data/heroine_circle.js',['HCIRCLE_DATA']],['src/hcircle3d.js',['HCIRCLE']],['src/privtalk3d.js',['PRIVTALK']]]){   /* sis_b13：PRIV-SIS13-1028 那三筆要接得上 */
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const HAS=()=>typeof PRIVTALK!=='undefined'&&!!PRIVTALK.LIST;
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ').slice(0,300)); } };
/* 測試用的「旁邊有人」：COMPANY 多一個看 FORCE 的（真的圈子另外測）——true＝有人（不知道是誰）、陣列＝旁邊那幾個人的 id */
const FORCE={}; if(typeof STORY!=='undefined'&&Array.isArray(STORY.COMPANY)) STORY.COMPANY.push((G,id)=>Array.isArray(FORCE[id])?FORCE[id].slice():!!FORCE[id]);
const crowd=(id,on)=>{ FORCE[id]=Array.isArray(on)?on.slice():!!on; };
/* 對稿：劇情匯入白名單上 AA_503 那一版（第 14 節）*/
const SPEC503='docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md';
const SHA503=(()=>{ try{ const e=(JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files||[]).find(q=>q.path===SPEC503); return e&&e.status==='approved'?String(e.sha):''; }catch(e){ return ''; } })();
const DOC503=(()=>{ try{ return cp.execSync('git show '+SHA503+':"'+SPEC503+'"',{cwd:process.env.PRIV_GIT_DIR||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<24}); }catch(e){ return ''; } })();
const NARR='（她跟旁邊的人說了一聲，走到你這邊。）', Q7NARR='（她把吉他放下，朝門外偏了一下頭。你們走到社辦外面的走廊。）';
const DK=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd===0?7:wd);
const fresh=(d,h,zone,flags)=>{ if(typeof d==='string') d=DK(d); const G=H.fresh(CALENDAR.dateOf(d).key,h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.weekday=wdOf(d); G.hour=h;
  if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; G.invites=[]; for(const k in FORCE) delete FORCE[k]; STORY._bindGM(GM); if(typeof HCIRCLE!=='undefined') HCIRCLE.bind(GM); return G; };
const evOf=id=>STORY_EVENTS.find(e=>e.id===id);
const done=(...ids)=>{ for(const id of ids) H.G.events.done[id]=1; };
const said=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
const has=t=>H.said.some(s=>s.t===t||s.t==='「'+t+'」');
const npc=id=>{ const n={id,charId:id,name:SOCIAL.npcName(id),obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,pose:'idle',idlePose:'idle'}; GM.npc[id]=n; return n; };
const ladIdx=(G,id,sid)=>{ const D=STORY.ladData(G,id); const i=D?D.L.steps.findIndex(s=>s.id===sid):-1; const so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{}; if(D) so.ladder[D.key]=i; return D?D.key:null; };
const ladAt=(G,id)=>{ const D=STORY.ladData(G,id); return D?((G.social.ladder||{})[D.key]|0):null; };
const nextId=(G,id)=>{ const st=STORY.ladNext(G,id); return st?st.id:null; };

(async()=>{
/* ---------- 0 載入、清單、呼叫的地方 ---------- */
await sec('0',async()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=f=>html.indexOf('<script src="'+f);
  const iP=sc('src/privtalk3d.js'), iC=sc('src/hcircle3d.js'), iM=sc('src/multirel3d.js'), iS=sc('src/story3d.js'), iY=sc('src/data/y2b_events.js'), iR=sc('src/data/r2y3a_events.js'), iB=sc('src/data/bbpack_events.js');
  const later=['src/y2r2_3d.js','src/data/zrzq_events.js','src/zrzq3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/v6ex_lines.js','src/v6ex3d.js'].filter(f=>!(sc(f)>0&&sc(f)<iP));   /* 第三輪包的那幾個模組（芷若×子晴、學姊、前任、以安明軒）要先載 */
  check('0. 載得到；index.html：privtalk3d.js 在 hcircle3d.js、multirel3d.js、story3d.js、y2b／r2y3a 的事件、y2r2、芷若×子晴、學姊大二大三、前任的模組以後，bbpack_events.js 前面',!errs.length&&HAS()&&iP>iC&&iP>iM&&iP>iS&&iP>iY&&iP>iR&&iB>iP&&iC>0&&!later.length,J({errs,later}));
  const fn=typeof STORY.privNow==='function'&&typeof STORY.crowdNow==='function';
  let a=null, b=null; if(fn){ fresh('2025-10-07',12.5,'campus'); a=STORY.privNow(H.G,'heroine_03'); crowd('heroine_03',true); b=STORY.privNow(H.G,'heroine_03'); }
  check('0. STORY.privNow(G,id,n,GM)：COMPANY 任一個說旁邊有人＝false（crowdNow 是反面）',fn&&a===true&&b===false&&STORY.crowdNow(H.G,'heroine_03')===true,J({fn,a,b}));
  if(!HAS()) return;
  const L=PRIVTALK.LIST, keys=L.map(e=>e.key), bad=L.filter(e=>!e._wired||!e.cat||!e.desc||(e.gate!=='none'&&!e.note));   /* desc＝入口在哪、note＝旁邊有人時怎麼辦（給人看的說明欄，tests/sis_no_three_unit.js 不掃）*/
  check('0. 清單（'+L.length+' 筆）每一筆都接上、key 不重複、寫了類別／在哪／旁邊有人時怎麼辦（沒有入口的寫在哪裡）',!bad.length&&new Set(keys).size===keys.length&&L.length>=20,J(bad.map(e=>e.key)));
  const cats=new Set(L.map(e=>e.cat)), topics=new Set(L.map(e=>e.topic).filter(Boolean));
  const needC=['告白','心意邀約','約會','交往中才有的互動','坦白有別人','分開談話（AA_346）','她知情以後','還沒公開'], needT=['子晴爸爸','沛珊重考','芷若交換申請','語彤媽媽回診','學姊口試結果'];
  check('0. 清單涵蓋 AA 的每一類（告白、心意邀約、約會、交往中、坦白有別人、AA_346、她知情以後、還沒公開的五件）',needC.every(c=>cats.has(c))&&needT.every(t=>topics.has(t)),J({cats:[...cats],topics:[...topics]}));
  const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'), mr=fs.readFileSync(path.join(H.ROOT,'src/multirel3d.js'),'utf8'), y2=fs.readFileSync(path.join(H.ROOT,'src/y2r2_3d.js'),'utf8');
  check('0. 呼叫的地方：story3d.js offerInvite 每個選項問自己那一筆（invite、privKey）、選了先 privLead；multirel3d.js 問 PRIVTALK.ok（zq_dad_pre、ps_bterm、zz_after）再 privLead；坦白的兩個選項標 priv＋privKey；以安「明軒的事……」標 priv（an_mx）',
    /S\.privOk\(G,id,'invite',GM,n\)/.test(st)&&/!\(pk\(o\)&&!S\.privOk\(G,id,pk\(o\),GM,n\)\)/.test(st)&&/await S\.privLead\(GM,'invite',id\)/.test(st)&&/if\(o\.pk\) await S\.privLead\(GM,o\.pk,id\)/.test(st)
    &&/privOk\(G,ZQ,GM,'zq_dad_pre'\)\)\{ await privLead\(GM,'zq_dad_pre',ZQ\)/.test(mr)&&/privOk\(G,PS,GM,'ps_bterm'\)\)\{[^\n]*await privLead\(GM,'ps_bterm',PS\)/.test(mr)&&/PRIVTALK\.ok\(G,x,k,GM,sub\)/.test(mr)&&/privOk\(G,id,GM,'zz_after',k\)/.test(mr)
    &&(mr.match(/priv:true,run:/g)||[]).length===2&&/privKey:'tell_later'/.test(mr)&&/privKey:'tell_now'/.test(mr)&&/priv:true,privKey:'an_mx'/.test(y2));
  const D=PRIVTALK.DECIDED||[];
  check('0. 第一輪問 AA 的 12 項改成定案紀錄（PRIVTALK.DECIDED：第 1～12 項各一筆，問的、AA 定的、怎麼做；S.REF＝AA_503 第 14 節 6bc3cd784；ASK_AA 拿掉）',
    D.length===12&&D.every((x,i)=>x.n===i+1&&x.desc&&x.decided&&x.impl)&&/6bc3cd784/.test(PRIVTALK.REF||'')&&!('ASK_AA' in PRIVTALK),J(D.map(x=>x.n)));
  check('0. 對稿（git show 白名單上的 AA_503 '+SHA503+'）：保底的旁白、第 9 項的旁白、第 10 項的兩句、第 12 項三組都在第 14 節；遊戲裡一字不差',
    DOC503.indexOf('## 14. 私密的再補 12 項')>0&&DOC503.includes('> '+NARR)&&DOC503.includes(Q7NARR)&&DOC503.includes('`anOther`「理由我懂。不用解釋。」')&&DOC503.includes('`ytAfterAn`「嗯。……她會讓你說理由的。」')
    &&DOC503.includes('・語彤和阿姨（媽媽的事）')&&DOC503.includes('・芷若和子晴（交換申請）')&&PRIVTALK.NARR===NARR&&(PRIVTALK.SCENE_LEAD||[]).length===2&&PRIVTALK.SCENE_LEAD.every(q=>q.text===Q7NARR)
    &&V6EX_LINES.EX.anOther==='理由我懂。不用解釋。'&&V6EX_LINES.EX.ytAfterAn==='嗯。……她會讓你說理由的。'&&PRIVTALK.WAIT===7,'長度 '+DOC503.length); });

/* ---------- 1 約會、priv 的一次性選項 ---------- */
await sec('1',async()=>{ fresh('2025-10-09',15,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); const n=npc('heroine_03');
  const priv={t:'（私密的選項）',priv:true,run:async()=>{}}, pub={t:'（一般的選項）',run:async()=>{}}; const f0=(G,id)=>id==='heroine_03'?[priv,pub]:[]; STORY.TALK_OPTS.push(f0);
  const opts=async()=>{ H.opts=[]; H.picks=['就這樣']; await STORY.offerInvite(GM,'heroine_03',n); return (H.opts[0]||[]); };
  try{ crowd('heroine_03',true); const o1=await opts(); crowd('heroine_03',false); const o2=await opts();
    check('1. 旁邊有人：不出「約她去…」、priv 的選項；交換聯絡方式、一般的選項照常',!o1.some(t=>/^約她去/.test(t))&&!o1.includes('（私密的選項）')&&o1.includes('（一般的選項）')&&o1.includes('交換聯絡方式'),J(o1));
    check('1. 她一個人：「約她去…」、priv 的選項都出',o2.some(t=>/^約她去/.test(t))&&o2.includes('（私密的選項）')&&o2.includes('交換聯絡方式'),J(o2)); }
  finally{ STORY.TALK_OPTS.splice(STORY.TALK_OPTS.indexOf(f0),1); } });

/* ---------- 2 坦白有別人 ---------- */
await sec('2',async()=>{ if(typeof MREL==='undefined'){ check('2. MREL',false); return; }
  const opts=async(id)=>{ H.opts=[]; H.picks=['就這樣']; await STORY.offerInvite(GM,id,npc(id)); return (H.opts[0]||[]); };
  fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); }
  const y=MREL.confessAny(H.G,'heroine_01'); crowd('heroine_01',true); const o1=await opts('heroine_01'); crowd('heroine_01',false); const o2=await opts('heroine_01');
  check('2. 以安「我有件事要跟妳講。」（坦白和學姊交往，ROM.tellBy）：旁邊有人不出；她一個人才出',y==='heroine_05'&&!o1.includes('「我有件事要跟妳講。」')&&o2.includes('「我有件事要跟妳講。」'),J({y,o1,o2}));
  const y2=MREL.confLaterFor(H.G,'heroine_05'), t=y2&&MREL.confLaterOpt(H.G,'heroine_05',y2); crowd('heroine_05',true); const o3=await opts('heroine_05'); crowd('heroine_05',false); const o4=await opts('heroine_05');
  check('2. 學姊「（下次見面，自己跟她講以安的事）」（交往中才有）：旁邊有人不出；她一個人才出',!!t&&!o3.includes(t)&&o4.includes(t),J({t,o3,o4})); });

/* ---------- 3 她知情以後 ---------- */
await sec('3',async()=>{ if(typeof MREL==='undefined'){ check('3. MREL',false); return; }
  /* (a) 說話時的發現（以安：和她說話就演）*/
  { fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); }
    const R=MREL.rec(H.G); R.pend.heroine_01={y:'heroine_05',day:H.G.day-1,h:20};
    crowd('heroine_01',true); const a1=MREL.meetAction(H.G,'heroine_01','talk'), keep=!!MREL.rec(H.G).pend.heroine_01, a2=MREL.meetAction(H.G,'heroine_01','date');
    crowd('heroine_01',false); const a3=MREL.meetAction(H.G,'heroine_01','talk');
    check('3. 以安的發現（和她說話就演）：旁邊有人＝不演、pend 留著；正式約會（2D）不擋；她一個人＝演',a1===null&&keep&&!!a2&&a2.disc===true&&!!a3&&a3.disc===true,J({a1,keep,a2:!!a2,a3:!!a3}));
    const sm0=J((MREL.rec(H.G).sm||{}).heroine_05||null); crowd('heroine_05',true); const b1=MREL.meetAction(H.G,'heroine_05','talk'), sm1=(MREL.rec(H.G).sm||{}).heroine_05, w1=HAS()&&PRIVTALK.waitOf?PRIVTALK.waitOf(H.G,'knows_talk','heroine_05'):'no';
    crowd('heroine_05',false); const b2=MREL.meetAction(H.G,'heroine_05','talk'), sm2=(MREL.rec(H.G).sm||{}).heroine_05;
    check('3. 學姊（沒有知情的流程要動，只有一般見面那一筆 MREL.sisMet，AA_474 1-2）：旁邊有人＝不記（AA_503 第 14 節後補第 3 項：擋下來沒演的不算）、不記等待；她一個人＝記',
      b1===null&&sm1===undefined&&w1===null&&b2===null&&Array.isArray(sm2)&&sm2.includes(H.G.day),J({sm0,sm1,w1,sm2})); }
  /* (b) 吧檯的芷若（冷靜期：她上班時去 Café）*/
  { fresh('2026-10-14',20,'cafe'); for(const id of ['heroine_02','heroine_04']){ H.CLOSE(id); SOCIAL.meet(id,'cafe'); H.date(id); }
    const st=MREL.rec(H.G).st.heroine_02={y:'heroine_04',n:1,day:H.G.day-1,phase:'cool'};
    crowd('heroine_02',true); const c1=MREL.FLOW.heroine_02.meet(H.G,st,'cafe'); crowd('heroine_02',false); const c2=MREL.FLOW.heroine_02.meet(H.G,st,'cafe');
    check('3. 吧檯的芷若（冷靜期）：旁邊有人（同事）＝不演、照常點餐；她一個人＝演',c1===null&&!!c2&&c2.abort===true,J({c1,c2:!!c2})); }
  /* (c) 1A-02 攤牌以後第一次說話那一句 */
  { fresh('2027-11-15',16,'lawlib'); H.CLOSE('heroine_05'); SOCIAL.meet('heroine_05','lawlib'); H.date('heroine_05'); const F=H.G.flags; F.TWO_HEARTS_PICK='heroine_05'; F.TWO_HEARTS_DAY=H.G.day-3;
    crowd('heroine_05',true); H.said=[]; const e1=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'}); const s1=said().length, f1=!!F.TWO_HEARTS_ECHO;
    crowd('heroine_05',false); H.said=[]; const e2=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'});
    check('3. 1A-02 攤牌以後那一句：旁邊有人＝不說、不記；她一個人＝說「那天的事，我不會再提。可是我記得。」',e1===false&&s1===0&&!f1&&e2===true&&has('那天的事，我不會再提。可是我記得。')&&F.TWO_HEARTS_ECHO===true,J({e1,s1,f1,e2,said:said()})); }
  /* (d) 沛珊結果 B：每學期第一週「這學期還可以嗎？我們講好的那些。」（說話前接演）*/
  { const d=TD('Y2S1',1,2); fresh(d,16,'cafe'); H.FRIEND('classmate_peishan'); SOCIAL.meet('classmate_peishan','cafe'); done('ev_peishan_doubt','ev_peishan_syllogism');   /* 和她說話的事件（為什麼念法律…）先算演過 */
    const st=MREL.rec(H.G).st.classmate_peishan={y:'heroine_01',n:1,day:d-30,phase:'done',result:'B',bTerm:{}}; const n=npc('classmate_peishan'); const L='這學期還可以嗎？我們講好的那些。';
    crowd('classmate_peishan',true); H.said=[]; H.picks=[]; await STORY.talkCharacter('classmate_peishan',n); const p1=has(L), b1=!!st.bTerm.Y2S1;
    crowd('classmate_peishan',false); H.said=[]; H.picks=[]; await STORY.talkCharacter('classmate_peishan',n); const p2=has(L), b2=!!st.bTerm.Y2S1;
    check('3. 沛珊結果 B 的「對一次」：第一週旁邊有人＝這一次不問（不記）；她一個人＝問、記下這學期',!p1&&!b1&&p2&&b2,J({p1,b1,p2,b2})); }
  /* (e) 子晴：Q8 河堤沒遇到、說「改天講」→ 下一次見面她第一句（說話前接演）*/
  { fresh(TD('Y2S2',16,3),23,'gongguan'); H.FRIEND('heroine_04'); SOCIAL.meet('heroine_04','gongguan'); const F=H.G.flags; F.ZQ_DAD_HEARD=true; PHONE.rec(H.G); H.G.msgs.push({id:'zqd',th:'p:heroine_04',from:'heroine_04',text:'嗯',ask:{id:'y2_zq_dad_msg'},ans:0,day:H.G.day-2});
    const n=npc('heroine_04'), L='我爸那天說，做遊戲是在浪費時間。'; const due=MREL.zqDadDue(H.G);
    crowd('heroine_04',true); H.said=[]; await STORY.talkCharacter('heroine_04',n); const p1=has(L), s1=F.ZQ_DAD_SAID;
    crowd('heroine_04',false); H.said=[]; await STORY.talkCharacter('heroine_04',n); const p2=has(L), s2=F.ZQ_DAD_SAID;
    check('3. 子晴爸爸那一句（Q8 一類）：旁邊有人＝不說、不記；她一個人＝說、記 ZQ_DAD_SAID',due===true&&!p1&&s1==null&&p2&&s2===H.G.day,J({due,p1,s1,p2,s2})); } });

/* ---------- 4 還沒公開的事 ---------- */
await sec('4',async()=>{
  /* (a) 沒回的那一句：zq_dad（子晴爸爸）、ps_plan（沛珊重考）*/
  { const E2=id=>NEEDED_MSGS.list.find(e=>e.id===id); const out=[];
    for(const [mid,who] of [['zq_dad','heroine_04'],['ps_plan','classmate_peishan']]){ fresh(TD('Y2S1',10,3),16,'campus'); const N=STORY.neededRec(H.G); const close=(H.G.day-1)*24+21;
      N.batches.push({d:H.G.day-8,ids:[[mid,who]],ans:[],said:{},closedAt:close});
      crowd(who,true); const m1=STORY.neededMissFor(H.G,E2(mid),who), l1=STORY.neededMissLine(H.G,who), s1=!!N.batches[0].said[who];
      crowd(who,false); const l2=STORY.neededMissLine(H.G,who), s2=!!N.batches[0].said[who];
      out.push([mid,m1===null&&l1===null&&!s1&&Array.isArray(l2)&&l2.length>0&&s2,J({m1,l1,s1,l2})]); }
    check('4. 沒回的那一句（zq_dad「我爸要來那則」、ps_plan「重考計畫那則」）：旁邊有人＝不說、不記說過；她一個人＝說',out.every(x=>x[1]),J(out)); }
  /* (b) 事件：旁邊有人＝不成立（照常說話）；她一個人＝成立 */
  { const R=[];
    const ev=(id,who,setup)=>{ const e=evOf(id); setup(); crowd(who,true); const c1=EVENTS.check(e); crowd(who,false); const c2=EVENTS.check(e); R.push([id,!c1&&c2,J({c1,c2})]); };
    ev('ev_zhiruo_secret','heroine_02',()=>{ fresh(TD('Y1S2',11,6),15,'wenzhou'); H.FAMILIAR('heroine_02'); });
    ev('ev_zhiruo_applied','heroine_02',()=>{ fresh('2026-12-15',15,'cafe'); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','SHARED_SECRET',''); done('ev_zhiruo_secret'); });   /* 12/10 截止以後（她自己的條件）*/
    ev('ev_peishan_decision','classmate_peishan',()=>{ fresh(TD('Y2S1',5,1),12.5,'linze',{dating_classmate_peishan:true}); H.FAMILIAR('classmate_peishan'); done('ev_peishan_doubt'); });
    ev('ev_ziqing_dad_visit','heroine_04',()=>{ fresh(TD('Y2S2',13,1),22.5,'gongguan'); H.FRIEND('heroine_04'); done('ev_ziqing_secret_game'); });
    ev('ev_ziqing_dad_stuck','heroine_04',()=>{ fresh('2027-10-06',22.5,'gongguan'); H.FAMILIAR('heroine_04'); E.player.obj.position={x:10,y:0,z:20}; E.player.lv=0;   /* 走到她旁邊才演（npcNear 3 m）*/
      const n=npc('heroine_04'); n.obj.position={x:11,y:0,z:20}; E.npcs=[n]; });
    check('4. 事件（芷若 Z4 十點的電話、Z7 她交件了、沛珊 P3 我要重考、子晴 Q8 爸爸來了、Q8b 爸爸卡關了）：旁邊有人＝不成立；她一個人＝成立',R.every(x=>x[1]),J(R));
    fresh(TD('Y1S2',11,6),15,'wenzhou'); H.FAMILIAR('heroine_02'); SOCIAL.meet('heroine_02','wenzhou'); crowd('heroine_02',true); const i1=EVENTS.onInteract('heroine_02'); await new Promise(r=>setTimeout(r,0));
    const d1=!!H.G.events.done.ev_zhiruo_secret; crowd('heroine_02',false); const i2=EVENTS.onInteract('heroine_02'); await new Promise(r=>setTimeout(r,20));
    check('4. 和芷若說話（大一下週六溫州街）：旁邊有人＝不演 Z4（照常說話）；她一個人＝演',i1===false&&!d1&&i2===true&&!!H.G.events.done.ev_zhiruo_secret,J({i1,d1,i2})); }
  /* (c) 傅鐘旁邊「妳的交換申請交了嗎？」*/
  { const run=async(on)=>{ fresh(TD('Y1S2',13,2),13,'campus'); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','SHARED_SECRET',''); crowd('heroine_02',on); H.opts=[]; H.picks=['發呆']; await EVENTS.run(evOf('ev_zhiruo_bell')); return H.opts[0]||[]; };
    const o1=await run(true), o2=await run(false), Q='「妳的交換申請交了嗎？」';
    check('4. 傅鐘旁邊的選項「妳的交換申請交了嗎？」：旁邊有人不出（其他照常）；她一個人才出',!o1.includes(Q)&&o1.includes('「妳上完課都在這裡發呆？」')&&o2.includes(Q),J({o1,o2})); }
  /* (d) 閒聊階梯：整層（語彤媽媽回診 Y-L7、Y7-L8）*/
  { const R=[]; for(const [term,w,wd,id,sid,lvl,zone] of [['Y1S1',6,2,'heroine_03','Y-L7','FAMILIAR','campus'],['Y4S1',16,2,'heroine_03','Y7-L8','FRIEND','campus']]){
      fresh(TD(term,w,wd),15,zone); H[lvl](id); SOCIAL.meet(id,zone); ladIdx(H.G,id,sid); crowd(id,true); const a=nextId(H.G,id); crowd(id,false); const b=nextId(H.G,id); R.push([sid,a===null&&b===sid,J({a,b})]); }
    check('4. 語彤媽媽回診（Y-L7「我媽每個月要回診一次」、Y7-L8「期末考完，我要陪我媽去回診」）：旁邊有人＝這一層不播；她一個人＝播',R.every(x=>x[1]),J(R)); }
  /* (e) 閒聊階梯：換進私密那一版才擋（Z3-L6 交換申請、P3-L6 重考、Z2-L6 extraIf）；原本那一版照播 */
  { const R=[]; const one=(lab,term,w,wd,id,sid,lvl,setPriv)=>{ fresh(TD(term,w,wd),15,'campus'); H[lvl](id); SOCIAL.meet(id,'campus'); ladIdx(H.G,id,sid);
      crowd(id,true); const base=nextId(H.G,id); setPriv(); const held=nextId(H.G,id); crowd(id,false); const alone=nextId(H.G,id); const st=STORY.ladNext(H.G,id), L=st?STORY.ladLines(st,H.G,id):[];
      R.push([lab,base===sid&&held===null&&alone===sid&&PRIVTALK.privText(st,PRIVTALK.byKey[lab].steps[sid]).some(t=>L.includes(t)),J({base,held,alone})]); };
    if(HAS()){ one('zr_exch_lad','Y2S1',11,3,'heroine_02','Z3-L6','FAMILIAR',()=>done('ev_zhiruo_applied'));
      one('ps_retake_lad','Y2S1',10,3,'classmate_peishan','P3-L6','FAMILIAR',()=>done('ev_peishan_decision'));
      one('zr_exch_lad','Y1S2',11,3,'heroine_02','Z2-L6','FAMILIAR',()=>SOCIAL.remember('heroine_02','SHARED_SECRET','')); }
    check('4. 換進私密那一版才擋（芷若 Z3-L6「交換申請送出去以後」、沛珊 P3-L6「重考的」、芷若 Z2-L6「交換的申請也是」）：原本那一版旁邊有人照播；私密那一版旁邊有人不播、她一個人播',R.length===3&&R.every(x=>x[1]),J(R)); }
  /* (f) Y4-L6 的第二個選項「妳媽媽身體還好嗎？」*/
  { fresh(TD('Y2S2',5,2),19,'noodle'); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','noodle'); const D=STORY.ladData(H.G,'heroine_03'), st=D&&D.L.steps.find(s=>s.id==='Y4-L6');
    crowd('heroine_03',true); const c1=st?STORY.ladChoices(st).map(c=>c.t):[]; crowd('heroine_03',false); const c2=st?STORY.ladChoices(st).map(c=>c.t):[];
    check('4. 語彤 Y4-L6 的「妳媽媽身體還好嗎？」：旁邊有人只出第一個選項；她一個人兩個都出',!!st&&J(c1)===J(['「跟妳小時候一樣。」'])&&c2.length===2,J({c1,c2})); }
  /* (g) 真的圈子：語彤和筱涵（大一上週二中午校園，一定同框）——筱涵在她旁邊＝Y-L7 不播；走遠＝播 */
  { const r=HCIRCLE.row('c503_6_1'); const d=TD('Y1S1',6,2); fresh(d,12.4,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); ladIdx(H.G,'heroine_03','Y-L7');
    E.zone={id:'campus',seats:[],spawn:{x:0,z:0}}; E.npcs=[]; GM.npc={}; E.canStand=()=>true; E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; }; E.moveTo=(n,x,z,cb)=>{ n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; };
    E.player.obj.position={x:500,y:0,z:500};
    const sp=(id,x,z)=>{ const n={id,charId:id,name:SOCIAL.npcName(id),obj:{position:{x,y:0,z},rotation:{y:0}},lv:0,beh:'wander',waypoints:[[x,z]],pose:'idle',idlePose:'idle',talk:nn=>STORY.talkCharacter(id,nn)}; GM.npc[id]=n; E.npcs.push(n); return n; };
    const yt=sp('heroine_03',0,7), xh=sp('npc_huangxh',1,7); HCIRCLE.bind(GM); HCIRCLE.arrange(GM,false); const on=HCIRCLE.on(r,H.G);
    const a=nextId(H.G,'heroine_03'); xh.obj.position.x=30; const b=nextId(H.G,'heroine_03');
    check('4. 真的圈子（語彤和筱涵，HCIRCLE.company）：筱涵在旁邊＝Y-L7 不播；筱涵走遠＝播',on===true&&a===null&&b==='Y-L7',J({on,a,b})); }
  /* (h) until／from：芷若交換申請 5/11 錄取以後、學姊口試結果只算 5/29 那一天 */
  if(HAS()){ const ok=(k,key,id)=>{ fresh(k,15,'campus'); crowd(id,true); return PRIVTALK.ok(H.G,id,key); };
    const a=ok('2027-05-10','zr_exch_lad','heroine_02'), b=ok('2027-05-11','zr_exch_lad','heroine_02'), c=ok('2029-05-28','sis_oral','heroine_05'), d=ok('2029-05-29','sis_oral','heroine_05'), e=ok('2029-05-30','sis_oral','heroine_05');
    check('4. 期限：芷若交換申請 5/10 旁邊有人＝擋、5/11 錄取以後不算私密；學姊口試結果只有 5/29 那一天算',a===false&&b===true&&c===true&&d===false&&e===true,J({a,b,c,d,e})); }
  else check('4. 期限（PRIVTALK）',false,'沒有 PRIVTALK'); });

/* ---------- 5 不會永久卡住：有期限的，期限內照圈子資料都有她一個人的時候 ---------- */
await sec('5',async()=>{ if(typeof HCIRCLE==='undefined'){ check('5. HCIRCLE',false); return; }
  /* 這個時間圈子會不會讓她旁邊一定有人（同框的列成立；70% 的列照那一天擲的結果）*/
  const blocked=(who,d,h,zone)=>{ fresh(d,h,zone); return (HCIRCLE.BY_WHO[who]||[]).some(r=>!r.alone&&r.with&&r.with.length&&HCIRCLE.on(r,H.G,zone)); };
  const span=(a,b,step)=>{ const o=[]; for(let x=a;x<b-1e-9;x+=step) o.push(+x.toFixed(4)); return o; };
  const termDays=(t,wks,wds)=>{ const r=CALENDAR.termDays(t), o=[]; for(let d=r.from;d<=r.to;d++){ const T=CALENDAR.termOf(d); if(!T||(wks&&!wks.includes(T.week))) continue; if(wds&&!wds.includes(wdOf(d))) continue; o.push(d); } return o; };
  const W={zq_dad_q8:{who:'heroine_04',days:termDays('Y2S2',[13,14],[1,2,3,4,5]),hrs:span(22,23,0.25),zones:['gongguan']},
    zq_dad_q8b:{who:'heroine_04',days:[DK('2027-10-06'),DK('2027-10-07'),DK('2027-10-08')],hrs:span(22,23.5,0.25),zones:['gongguan']},
    ps_retake_ev:{who:'classmate_peishan',days:termDays('Y2S1',[5],[1,2,3,4,5]),hrs:span(12,13,0.25),zones:['linze','campus']},
    zr_exch_ev:{who:'heroine_02',days:termDays('Y1S2',[11,12,13,14,15],[6]),hrs:span(14,18,0.5),zones:['wenzhou']},
    zr_exch_applied:{who:'heroine_02',days:termDays('Y2S1',null,null).filter(d=>d>DK('2026-12-10')),hrs:span(11,22,1),zones:['cafe']}};   /* Z7 自己的條件：12/10 截止以後 */
  const res=[]; for(const k in W){ const w=W[k]; let free=0, blk=0; for(const d of w.days) for(const h of w.hrs) for(const z of w.zones){ if(blocked(w.who,d,h,z)) blk++; else free++; } res.push([k,free,blk]); }
  check('5. 有期限的事件（Q8、Q8b、P3、Z4、Z7）：期限內照圈子資料都有她一個人的時候（[key, 一個人, 旁邊有人]）',res.every(x=>x[1]>0)&&res.find(x=>x[0]==='zr_exch_applied')[2]>0,J(res));
  /* 閒聊階梯擋下的那幾層：那一學期的週次裡，她在 3D（作息有區域）而且旁邊沒有圈子的人的時候 */
  const lad=[]; if(HAS()) for(const e of PRIVTALK.LIST.filter(x=>x.gate==='hold')) for(const sid in e.steps){ let term=null, st=null;
      for(const t in LADDER.byTerm){ const L=LADDER.byTerm[t][e.who]; const s=L&&(L.steps||[]).find(q=>q.id===sid); if(s){ term=t; st=s; break; } }
      if(!st){ lad.push([sid,0,'找不到']); continue; } const wk=st.week?Array.from({length:st.week[1]-st.week[0]+1},(_,i)=>st.week[0]+i).filter(x=>x<=16):null; let free=0;
      for(const d of termDays(term,wk,null).slice(0,40)){ for(const h of span(8,23,1)){ fresh(d,h,'campus'); const en=STORY.schedEnt(CHARACTERS[e.who],H.G); if(!en||!en.zone) continue; if(!blocked(e.who,d,h,en.zone)){ free++; break; } } if(free>=3) break; }
      lad.push([sid,free]); }
  check('5. 閒聊階梯擋下的那幾層：那幾週裡都有她在 3D、旁邊沒有圈子的人的時候',lad.length>=9&&lad.every(x=>x[1]>=1),J(lad)); });

/* ---------- 6 一般閒聊照常 ---------- */
await sec('6',async()=>{ const d=TD('Y1S1',6,2); fresh(d,15,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); const n=npc('heroine_03');
  H.said=[]; await STORY.talkCharacter('heroine_03',n); H.G.day+=1; H.G.weekday=wdOf(H.G.day);   /* 先說過一次（升到有點熟的那幾句先說掉）*/
  const D=STORY.ladData(H.G,'heroine_03'), i7=D.L.steps.findIndex(s=>s.id==='Y-L7'); ladIdx(H.G,'heroine_03',D.L.steps[i7-1].id);   /* Y-L7 前一層（一般的）*/
  crowd('heroine_03',true); H.said=[]; await STORY.talkCharacter('heroine_03',n); const s1=said(), at1=ladAt(H.G,'heroine_03');
  H.G.day+=1; H.G.weekday=wdOf(H.G.day); H.said=[]; await STORY.talkCharacter('heroine_03',n); const s2=said(), at2=ladAt(H.G,'heroine_03');
  crowd('heroine_03',false); H.G.day+=1; H.G.weekday=wdOf(H.G.day); H.said=[]; await STORY.talkCharacter('heroine_03',n); const s3=said(), at3=ladAt(H.G,'heroine_03');
  const L7='我媽每個月要回診一次，都排在週末，我陪她去。';
  check('6. 旁邊有人：一般的那一層照播、照常前進（'+D.L.steps[i7-1].id+'）',at1===i7&&s1.length>0&&!s1.some(t=>t.includes(L7)),J({at1,i7,s1:s1.slice(0,3)}));
  check('6. 隔天旁邊還是有人：Y-L7 不播、不前進，照常閒聊（有說話）',at2===i7&&s2.length>0&&!s2.some(t=>t.includes(L7)),J({at2,s2:s2.slice(0,3)}));
  check('6. 再隔一天她一個人：Y-L7 播、前進',at3===i7+1&&s3.some(t=>t.includes(L7)),J({at3,s3:s3.slice(0,3)})); });

/* ===================== 第三輪（PRIV-AAFIX-1028，AA_503 第 14 節）===================== */
const day=d=>{ H.G.day=d; H.G.weekday=wdOf(d); };
const W=(key,id,sub)=>HAS()&&PRIVTALK.waitOf?PRIVTALK.waitOf(H.G,key,id,sub):'no';
const narrFirst=()=>!!H.said[0]&&H.said[0].who===null&&H.said[0].t===NARR;
const noNarr=()=>!H.said.some(s=>s.t===NARR);
const L7='陳語彤：我媽每個月要回診一次，都排在週末，我陪她去。';
/* 語彤：先和她說過一次話（升到有點熟的那幾句先說掉），再把閒聊階梯放到 sid 那一層 */
const ytLad=async(d,h,zone,sid,lvl)=>{ fresh(d-1,h,zone); H[lvl||'FAMILIAR']('heroine_03'); SOCIAL.meet('heroine_03',zone); const n=npc('heroine_03'); H.said=[]; H.picks=['就這樣']; await STORY.talkCharacter('heroine_03',n); day(d); ladIdx(H.G,'heroine_03',sid); return n; };
const optsOf=async(id)=>{ H.opts=[]; H.picks=['就這樣']; await STORY.offerInvite(GM,id,npc(id)); return (H.opts[0]||[]); };

/* ---------- 7 共同的保底 ---------- */
/* (a) 沒有期限：閒聊階梯 Y-L7（筱涵在旁邊） */
await sec('7. (a) 沒有期限：閒聊階梯 Y-L7（筱涵在旁邊）',async()=>{ const d0=TD('Y1S1',6,1), n=await ytLad(d0,15,'campus','Y-L7'); crowd('heroine_03',['npc_huangxh']);
    const a1=nextId(H.G,'heroine_03'), w1=W('yt_mom_lad','heroine_03','Y-L7'); day(d0+6); const a7=nextId(H.G,'heroine_03');
    day(d0+7); H.said=[]; H.picks=['就這樣']; await STORY.talkCharacter('heroine_03',n); const s8=said(), nf=narrFirst(), w8=W('yt_mom_lad','heroine_03','Y-L7');
    check('7. 沒有期限（閒聊階梯 Y-L7，筱涵在旁邊）：第 1 天擋下來、記那一天；第 7 天還擋；第 8 天照播，第一句是旁白「（她跟旁邊的人說了一聲，走到你這邊。）」，播完清掉等待',
      a1===null&&w1===d0&&a7===null&&nf&&s8[1]===L7&&w8===null&&!Object.keys(H.G.flags.PRIVWAIT||{}).some(k=>/^yt_mom_lad/.test(k)),J({a1,w1,d0,a7,s8:s8.slice(0,2),w8})); });
/* (b) 擋下來以後她一個人：照播、沒有旁白、清掉 */
await sec('7. (b) 擋下來以後她一個人：照播、沒有旁白、清掉',async()=>{ const d0=TD('Y1S1',6,1), n=await ytLad(d0,15,'campus','Y-L7'); crowd('heroine_03',true); const a1=nextId(H.G,'heroine_03'), w1=W('yt_mom_lad','heroine_03','Y-L7');
    day(d0+2); crowd('heroine_03',false); H.said=[]; H.picks=['就這樣']; await STORY.talkCharacter('heroine_03',n); const s=said();
    check('7. 擋下來以後她一個人（第 3 天）：照播，沒有旁白；清掉等待',a1===null&&w1===d0&&s[0]===L7&&noNarr()&&W('yt_mom_lad','heroine_03','Y-L7')===null,J({a1,w1,s:s.slice(0,2)})); });
/* (c) 有期限：P3 我要重考（大二上第 5 週平日） */
await sec('7. (c) 有期限：P3 我要重考（大二上第 5 週平日）',async()=>{ const mon=TD('Y2S1',5,1), fri=TD('Y2S1',5,5), ev=evOf('ev_peishan_decision'); fresh(mon,12.5,'linze',{dating_classmate_peishan:true}); H.FAMILIAR('classmate_peishan'); done('ev_peishan_doubt'); crowd('classmate_peishan',true);
    const c1=EVENTS.check(ev), w1=W('ps_retake_ev','classmate_peishan'); day(TD('Y2S1',5,4)); const c4=EVENTS.check(ev); day(fri); const c5=EVENTS.check(ev); H.said=[]; H.picks=[]; await EVENTS.run(ev); const nf=narrFirst();
    check('7. 有期限（P3 我要重考，大二上第 5 週平日 12～13 點；期限＝週五）：週一擋下來、週四還擋；週五照演，第一句旁白；演完清掉',
      c1===false&&w1===mon&&c4===false&&c5===true&&nf&&W('ps_retake_ev','classmate_peishan')===null&&PRIVTALK.dueOf(H.G,PRIVTALK.byKey.ps_retake_ev)===fri,J({c1,w1,c4,c5,nf,s:said().slice(0,2)})); });
/* (d) 有期限的不照 7 天：Z7 她交件了（期限＝大二上最後一天 12/27） */
await sec('7. (d) 有期限的不照 7 天：Z7 她交件了（期限＝大',async()=>{ const ev=evOf('ev_zhiruo_applied'), due=PRIVTALK.evDue(ev), d1=DK('2026-12-12'); fresh(d1,15,'cafe'); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','SHARED_SECRET',''); done('ev_zhiruo_secret'); crowd('heroine_02',['hc_xt']);
    const c1=EVENTS.check(ev); day(d1+7); const c8=EVENTS.check(ev); day(due-1); const c9=EVENTS.check(ev); day(due); const c10=EVENTS.check(ev);
    check('7. 有期限的不照 7 天（Z7 她交件了，期限＝大二上最後一天 2026-12-27）：12/12 擋下來、第 8 天（12/19）還擋、12/26 還擋、12/27 照演',due===DK('2026-12-27')&&c1===false&&c8===false&&c9===false&&c10===true,J({due:due!=null&&CALENDAR.dateOf(due).key,c1,c8,c9,c10})); });
/* (e) 選項：以安「我有件事要跟妳講。」（沒有期限） */
await sec('7. (e) 選項：以安「我有件事要跟妳講。」（沒有期限）',async()=>{ const T='「我有件事要跟妳講。」'; fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); } const d0=H.G.day; crowd('heroine_01',['yu']);
    const o1=await optsOf('heroine_01'), w1=W('tell_now','heroine_01'); day(d0+6); const o7=await optsOf('heroine_01'); day(d0+7);
    H.opts=[]; H.said=[]; H.picks=['我有件事要跟妳講']; await STORY.offerInvite(GM,'heroine_01',npc('heroine_01')); const o8=H.opts[0]||[], nf=narrFirst(), w8=W('tell_now','heroine_01');
    check('7. 選項（以安「我有件事要跟妳講。」，沒有期限）：第 1 天、第 7 天不出；第 8 天旁邊有人也出；選了＝先一句旁白再講，清掉等待',
      !o1.includes(T)&&w1===d0&&!o7.includes(T)&&o8.includes(T)&&nf&&H.said.length>1&&w8===null,J({o1,w1,o7,o8,s:said().slice(0,2)}));
    fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); } const e0=H.G.day, I='約她去…'; crowd('heroine_01',['yu']);
    const p1=await optsOf('heroine_01'); day(e0+1); crowd('heroine_01',false); const p2=await optsOf('heroine_01'), x2=W('tell_now','heroine_01'), v2=W('invite','heroine_01');
    day(e0+3); crowd('heroine_01',['yu']); const p3=await optsOf('heroine_01'), x3=W('tell_now','heroine_01'); day(e0+7); const p4=await optsOf('heroine_01'), x4=W('tell_now','heroine_01'), v4=W('invite','heroine_01');
    check('7. 選項：她一個人時出來過、玩家沒選＝不重新算（AA_503 第 14 節後補第 4 項）——照舊從第一次擋下來那天算：第 4 天旁邊有人還不出；第 8 天旁邊有人也出（「約她去…」也一樣）',
      !p1.includes(T)&&!p1.includes(I)&&p2.includes(T)&&p2.includes(I)&&x2===e0&&v2===e0&&!p3.includes(T)&&!p3.includes(I)&&x3===e0&&p4.includes(T)&&p4.includes(I)&&x4===e0&&v4===e0,J({p1,p2,x2,v2,p3,x3,p4,x4,v4})); });
/* (f) 知情的發現（以安，沒有期限）：沒有要演的時候不記 */
await sec('7. (f) 知情的發現（以安，沒有期限）：沒有要演的時候不',async()=>{ fresh('2026-10-14',16,'campus'); for(const id of ['heroine_01','heroine_05']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); } const d0=H.G.day; crowd('heroine_01',['yu']);
    const a0=MREL.meetAction(H.G,'heroine_01','talk'), w0=W('knows_talk','heroine_01'); MREL.rec(H.G).pend.heroine_01={y:'heroine_05',day:d0-1,h:20};
    const a1=MREL.meetAction(H.G,'heroine_01','talk'), w1=W('knows_talk','heroine_01'); day(d0+6); const a7=MREL.meetAction(H.G,'heroine_01','talk');
    day(d0+7); const a8=MREL.meetAction(H.G,'heroine_01','talk'); H.said=[]; H.picks=[]; if(a8) await a8.run(GM); const nf=narrFirst();
    check('7. 知情的發現（和以安說話）：沒有要演的時候旁邊有人也不記；要演的時候擋下來記第一天、第 7 天還擋；第 8 天照演，第一句旁白、清掉',
      a0===null&&w0===null&&a1===null&&w1===d0&&a7===null&&!!a8&&a8.disc===true&&nf&&W('knows_talk','heroine_01')===null,J({a0,w0,a1,w1,a7,a8:!!a8,s:said().slice(0,2)})); });
/* (g) 1A-02 攤牌以後那一句：只在要說的時候問 */
await sec('7. (g) 1A-02 攤牌以後那一句：只在要說的時候問',async()=>{ fresh('2027-11-15',16,'lawlib'); H.CLOSE('heroine_05'); SOCIAL.meet('heroine_05','lawlib'); H.date('heroine_05'); const F=H.G.flags, d0=H.G.day; crowd('heroine_05',['npc_ta_chen']);
    const e0=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'}), w0=W('knows_echo','heroine_05'); F.TWO_HEARTS_PICK='heroine_05'; F.TWO_HEARTS_DAY=d0-3;
    const e1=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'}), w1=W('knows_echo','heroine_05'); day(d0+7); H.said=[]; const e8=await STORY.twoHeartsEcho(GM,'heroine_05',{name:'學姊'});
    check('7. 1A-02 攤牌以後那一句：不用說的時候不記；要說的時候擋下來記第一天；第 8 天照說，第一句旁白',e0===false&&w0===null&&e1===false&&w1===d0&&e8===true&&narrFirst()&&(H.said[1]||{}).t==='那天的事，我不會再提。可是我記得。',J({e0,w0,e1,w1,e8,s:said()})); });
/* (h) 有期限：子晴「我爸要來那則，你沒回。」（關閉後 14 天） */
await sec('7. (h) 有期限：子晴「我爸要來那則，你沒回。」（關閉後',async()=>{ const d=TD('Y2S1',10,3); fresh(d,16,'campus'); const N=STORY.neededRec(H.G); N.batches.push({d:d-8,ids:[['zq_dad','heroine_04']],ans:[],said:{},closedAt:(d-1)*24+21}); crowd('heroine_04',['kai']);
    const due=PRIVTALK.missDue(H.G,'zq_dad','heroine_04'), l0=STORY.neededMissLine(H.G,'heroine_04'); day(d+8); const l8=STORY.neededMissLine(H.G,'heroine_04'); day(due); H.said=[]; const r=await STORY.neededMiss(GM,{name:'高子晴'},'heroine_04');
    check('7. 有期限（子晴「我爸要來那則，你沒回。」，關閉後 14 天）：擋下來以後第 9 天還擋；最後一天照說，第一句旁白',due===d+13&&l0===null&&l8===null&&r===true&&narrFirst()&&(H.said[1]||{}).t==='「我爸要來那則，你沒回。」',J({due,d,l0,l8,r,s:said()})); });
/* (i) 事件裡的選項：傅鐘「妳的交換申請交了嗎？」（沒有期限） */
await sec('7. (i) 事件裡的選項：傅鐘「妳的交換申請交了嗎？」（沒',async()=>{ const Q='「妳的交換申請交了嗎？」', d0=TD('Y1S2',13,2); const run=async()=>{ H.opts=[]; H.said=[]; H.picks=['交換申請']; await EVENTS.run(evOf('ev_zhiruo_bell')); return H.opts[0]||[]; };
    fresh(d0,13,'campus'); H.FAMILIAR('heroine_02'); SOCIAL.remember('heroine_02','SHARED_SECRET',''); crowd('heroine_02',['hc_xt']);
    const o1=await run(), w1=W('zr_exch_ask','heroine_02'); day(d0+7); const o8=await run(), s8=H.said.map(s=>s.t), i=s8.indexOf(NARR);
    check('7. 事件裡的選項（傅鐘「妳的交換申請交了嗎？」）：第 1 天不出、第 8 天旁邊有人也出；選了那一個＝她回答以前先一句旁白',!o1.includes(Q)&&w1===d0&&o8.includes(Q)&&i>0&&H.said[i].who===null&&!!H.said[i+1]&&H.said[i+1].who!==null,J({o1,w1,o8,s8})); });
/* (j) 階梯那一層的選項：語彤 Y4-L6「妳媽媽身體還好嗎？」 */
await sec('7. (j) 階梯那一層的選項：語彤 Y4-L6「妳媽媽身體',async()=>{ const d0=TD('Y2S2',5,3), n=await ytLad(d0,15,'campus','Y4-L6','FRIEND');   /* 週三下午校園（週二、四傍晚麵店有麵店的事件）*/ crowd('heroine_03',['npc_huangxh']); const D=STORY.ladData(H.G,'heroine_03'), st=D&&D.L.steps.find(s=>s.id==='Y4-L6');
    const c1=st?STORY.ladChoices(st).map(c=>c.t):[], w1=W('yt_mom_ask','heroine_03'); day(d0+7); H.opts=[]; H.said=[]; H.picks=['妳媽媽身體還好嗎']; await STORY.talkCharacter('heroine_03',n);
    const o8=(H.opts.find(o=>o.includes('「跟妳小時候一樣。」'))||[]), s=said(), i=s.indexOf(NARR);
    check('7. 階梯那一層的選項（語彤 Y4-L6「妳媽媽身體還好嗎？」）：第 1 天只出第一個；第 8 天兩個都出；選了那一個＝她回答以前先一句旁白',
      J(c1)===J(['「跟妳小時候一樣。」'])&&w1===d0&&o8.length===2&&i>0&&s[i+1]==='陳語彤：……嗯。剝蒜頭可以。她很高興。',J({c1,w1,o8,s})); });
/* (k) 分開以後子晴第一次「嗨。」（沒有期限） */
await sec('7. (k) 分開以後子晴第一次「嗨。」（沒有期限）',async()=>{ const d0=DK('2027-03-08'); fresh(d0,15,'campus'); for(const id of ['heroine_02','heroine_04']){ H.FRIEND(id); SOCIAL.meet(id,'campus'); } H.G.flags.ZQ_ZR_ENDED_DAY=d0-10; crowd('heroine_04',['kai']);
    const r1=await MREL.zzPreTalk(GM,{name:'高子晴'},'heroine_04'), w1=W('zz_after','heroine_04','first'), f1=!!(MREL.rec(H.G).zz.o||{}).first_heroine_04;
    day(d0+7); H.said=[]; const r8=await MREL.zzPreTalk(GM,{name:'高子晴'},'heroine_04');
    check('7. 分開以後子晴第一次「嗨。」（沒有期限）：旁邊有人＝不演、不記演過；第 8 天照演，第一句旁白',r1===false&&w1===d0&&!f1&&r8==='abort'&&narrFirst()&&H.said.some(x=>/嗨/.test(x.t)),J({r1,w1,f1,r8,s:said()})); });
/* (l) 舊存檔：沒有 PRIVWAIT、PRIVWAIT 壞掉 */
await sec('7. (l) 舊存檔：沒有 PRIVWAIT、PRIVWAI',async()=>{ fresh(TD('Y1S1',6,1),15,'campus'); const before=H.G.flags.PRIVWAIT; crowd('heroine_03',true); const a=PRIVTALK.ok(H.G,'heroine_03','yt_mom_ask'), w=W('yt_mom_ask','heroine_03'); H.G.flags.PRIVWAIT='壞掉'; const b=PRIVTALK.ok(H.G,'heroine_03','yt_mom_ask');
    check('7. 舊存檔沒有 G.flags.PRIVWAIT：第一次擋下來才建；壞掉的（不是物件）重新建',before===undefined&&a===false&&w===H.G.day&&b===false&&typeof H.G.flags.PRIVWAIT==='object'&&H.G.flags.PRIVWAIT['yt_mom_ask|heroine_03']===H.G.day,J({before,a,w,b,pw:H.G.flags.PRIVWAIT})); });
/* (m) 期限表：有期限的每一筆到期那天；沒有期限的＝null（照 7 天）*/
await sec('7. (m) 期限表',async()=>{ const B=PRIVTALK.byKey, due=(k,d)=>{ fresh(d,15,'campus'); return PRIVTALK.dueOf(H.G,B[k],[].concat(B[k].who)[0]); };
  const wk1=TD('Y2S1',1,3), bt=due('ps_bterm',wk1), T=d=>CALENDAR.termOf(d)||{};
  const want={zq_dad_q8:TD('Y2S2',14,5),zq_dad_q8b:DK('2027-10-08'),ps_retake_ev:TD('Y2S1',5,5),zr_exch_ev:TD('Y1S2',15,6),zr_exch_applied:DK('2026-12-27'),ps_split:TD('Y2S1',6,5),sis_us_told:DK('2027-11-09'),an_mx:DK('2027-09-05')};
  const bad=Object.keys(want).filter(k=>due(k,DK('2026-10-01'))!==want[k]).map(k=>k+':'+due(k,DK('2026-10-01')));
  const none=['invite','opt_priv','tell_now','tell_later','knows_talk','knows_cafe','knows_echo','zq_dad_pre','ps_retake_lad','zr_exch_ask','zr_exch_lad','yt_mom_lad','yt_mom_ask','zz_told_zr','zz_told_zq','zz_after','ex_an_other','ex_yt_an'].filter(k=>due(k,DK('2026-10-01'))!==null);
  check('7. 期限表：Q8＝大二下第 14 週週五、Q8b＝10/8、P3＝大二上第 5 週週五、Z4＝大一下第 15 週週六、Z7＝12/27、沛珊和柏翰＝第 6 週週五、學姊美國交換＝11/9、明軒＝9/5、沛珊「對一次」＝那學期第一週最後一天；其他沒有期限（照 7 天）',
    !bad.length&&!none.length&&bt!=null&&T(bt).id==='Y2S1'&&T(bt).week===1&&(T(bt+1).week|0)!==1,J({bad,none,bt:bt!=null&&CALENDAR.dateOf(bt).key})); });

/* ---------- 8 第 1～12 項 ---------- */
/* 第 1 項 芷若×子晴自己說 */
await sec('8. 第 1 項 芷若×子晴自己說',async()=>{ const zz=(d,zone)=>{ fresh(d,15,zone||'campus'); for(const id of ['heroine_02','heroine_04']){ H.FRIEND(id); SOCIAL.meet(id,zone||'campus'); } const Z=ZRZQ.rec(H.G); Object.assign(Z,{state:'dating',since:0,datingDay:d-30,datingTerm:'Y1S2',lastDay:d-30}); H.G.flags.ZZ_STATE='dating'; };
    const d0=DK('2026-09-21'); zz(d0); crowd('heroine_02',['heroine_04']); H.said=[]; H.picks=['恭喜']; const r1=await ZRZQ.preTalk(GM,'heroine_02'), ok1=r1===true&&noNarr()&&H.said.length>1&&SOCIAL.has('heroine_02','ZZ_TOLD_YT');
    zz(d0); crowd('heroine_02',['hc_xt']); const r2=await ZRZQ.preTalk(GM,'heroine_02'), w2=W('zz_told_zr','heroine_02'); crowd('heroine_02',['heroine_04','hc_xt']); const r3=await ZRZQ.preTalk(GM,'heroine_02');
    day(d0+7); H.said=[]; H.picks=['恭喜']; const r4=await ZRZQ.preTalk(GM,'heroine_02'), nf=narrFirst();
    zz(d0); crowd('heroine_04',['heroine_02']); H.said=[]; H.picks=['恭喜']; const r5=await ZRZQ.preTalk(GM,'heroine_04'); zz(d0); crowd('heroine_04',['kai']); const r6=await ZRZQ.preTalk(GM,'heroine_04');
    check('8. 第 1 項 芷若×子晴交往中、自己告訴祐廷：旁邊只有對方本人＝照演、沒有旁白（芷若、子晴都一樣）；旁邊有別人（或對方＋別人）＝不演；第 8 天照演、第一句旁白',
      ok1&&r2===false&&w2===d0&&r3===false&&r4===true&&nf&&r5===true&&r6===false,J({ok1,r1,r2,w2,r3,r4,nf,r5,r6}));
    fresh(DK('2027-10-20'),15,'cafe'); H.FAMILIAR('heroine_02'); H.FAMILIAR('heroine_04'); SOCIAL.meet('heroine_02','cafe'); Object.assign(ZRZQ.rec(H.G),{state:'dating',fy:'declined',f3:'dating'}); H.G.flags.FANG_F3_DAY=H.G.day-3;
    const ev=evOf('ev_zz_f3_told'); crowd('heroine_02',['heroine_04']); const c1=EVENTS.check(ev); crowd('heroine_02',['hc_xt']); const c2=EVENTS.check(ev);
    const f0=ZRZQ.f3Away; let du=null; ZRZQ.f3Away=()=>true; try{ du=PRIVTALK.dueOf(H.G,PRIVTALK.byKey.zz_f3_told); } finally{ ZRZQ.f3Away=f0; } const du2=PRIVTALK.dueOf(H.G,PRIVTALK.byKey.zz_f3_told);
    check('8. 第 1 項 F3 婉拒以後「我跟子晴在一起。」（ev_zz_f3_told）：旁邊只有子晴＝照演、有小婷＝不演；日本路線期限 9/1，臺灣沒有期限（7 天）',c1===true&&c2===false&&du===DK('2028-09-01')&&du2===null,J({c1,c2,du,du2})); });
/* 第 2 項 分開以後：吧檯的芷若第一句 */
await sec('8. 第 2 項 分開以後：吧檯的芷若第一句',async()=>{ const d=DK('2027-03-10'); fresh(d,20,'cafe'); H.FRIEND('heroine_02'); SOCIAL.meet('heroine_02','cafe'); H.G.flags.ZQ_ZR_ENDED_DAY=d-10; MREL._gm=GM; const n=npc('heroine_02'); n.staff='cafe'; crowd('heroine_02',['hc_xt']);
    H.said=[]; H.picks=[]; await STORY.talkCharacter('heroine_02',n); const s1=said().some(t=>t.includes('你要點什麼？')), f1=!!(MREL.rec(H.G).zz.o||{}).first_heroine_02;
    crowd('heroine_02',false); H.said=[]; H.picks=[]; await STORY.talkCharacter('heroine_02',n); const s2=said().some(t=>t.includes('你要點什麼？')), f2=!!(MREL.rec(H.G).zz.o||{}).first_heroine_02;
    check('8. 第 2 項 分開以後吧檯的芷若第一句「你要點什麼？」：旁邊有同事＝這一次不說（照常點餐）；她一個人＝說',!s1&&!f1&&s2&&f2,J({s1,f1,s2,f2})); });
/* 第 3 項 學姊的美國交換（期限 11/9） */
await sec('8. 第 3 項 學姊的美國交換（期限 11/9）',async()=>{ const d=DK('2027-11-03'); fresh(d,19,'lawlib',{met_sis:true}); H.FAMILIAR('heroine_05'); SOCIAL.meet('heroine_05','lawlib'); crowd('heroine_05',['npc_ta_chen']);
    const p1=SISY23.preTalkEv(H.G), w1=W('sis_us_told','heroine_05'); crowd('heroine_05',false); const p2=SISY23.preTalkEv(H.G); crowd('heroine_05',['npc_ta_chen']); day(DK('2027-11-08')); const p8=SISY23.preTalkEv(H.G);
    day(DK('2027-11-09')); H.said=[]; H.picks=[]; const r9=await SISY23.preTalk(GM);
    check('8. 第 3 項 學姊說要去美國交換（11/1～11/9 說話前接演）：旁邊有人＝不演、她一個人＝演；11/8 還擋；11/9（期限）照演、第一句旁白',p1===null&&w1===d&&p2==='ev_sis_us_told'&&p8===null&&r9===true&&narrFirst()&&H.G.flags.SIS_US_TOLD==='here',J({p1,w1,p2,p8,r9,s:said().slice(0,2)})); });
/* 第 4 項 沛珊說和柏翰分開了（第 6 週的週五） */
await sec('8. 第 4 項 沛珊說和柏翰分開了（第 6 週的週五）',async()=>{ const mon=TD('Y2S1',6,1), fri=TD('Y2S1',6,5), ev=evOf('ev_peishan_split'); fresh(mon,12.3,'linze'); SOCIAL.meet('classmate_peishan','linze'); crowd('classmate_peishan',['classmate_bohan']);
    const c1=EVENTS.check(ev); crowd('classmate_peishan',false); const c2=EVENTS.check(ev); crowd('classmate_peishan',['classmate_bohan']); day(fri); const c5=EVENTS.check(ev); H.said=[]; H.picks=[]; await EVENTS.run(ev);
    check('8. 第 4 項 沛珊說和柏翰分開了（大二上第 6 週平日中午）：旁邊有人＝不演、她一個人＝演；週五（期限）照演、第一句旁白',c1===false&&c2===true&&c5===true&&narrFirst()&&PRIVTALK.dueOf(H.G,PRIVTALK.byKey.ps_split)===fri,J({c1,c2,c5,s:said().slice(0,2)})); });
/* 第 5 項 以安「明軒的事……」（期限 9/5） */
await sec('8. 第 5 項 以安「明軒的事……」（期限 9/5）',async()=>{ const T='明軒的事……'; fresh(DK('2027-06-10'),15,'campus',{MX_HEARD:true}); H.FAMILIAR('heroine_01'); SOCIAL.meet('heroine_01','campus'); crowd('heroine_01',['yu']);
    const o1=await optsOf('heroine_01'); crowd('heroine_01',false); const o2=await optsOf('heroine_01'); crowd('heroine_01',['yu']); day(DK('2027-06-20')); const o3=await optsOf('heroine_01'); day(DK('2027-06-28')); const o4=await optsOf('heroine_01');
    day(DK('2027-09-05')); H.opts=[]; H.said=[]; H.picks=['明軒的事']; await STORY.offerInvite(GM,'heroine_01',npc('heroine_01')); const o5=H.opts[0]||[];
    check('8. 第 5 項 以安「明軒的事……」：旁邊有人不出、她一個人出；有期限 9/5：之後再有人＝第 9 天（6/28）還不出；9/5 照出，選了先一句旁白再「他問了，我答了。我們還是朋友。」',
      !o1.includes(T)&&o2.includes(T)&&!o3.includes(T)&&!o4.includes(T)&&o5.includes(T)&&narrFirst()&&(H.said[1]||{}).t==='他問了，我答了。我們還是朋友。'&&!!H.G.flags.AN_MX_ASKED,J({o1,o2,o3,o4,o5,s:said()})); });
/* 第 6 項 語彤租約「幫她」三個選項：不擋 */
await sec('8. 第 6 項 語彤租約「幫她」三個選項：不擋',async()=>{ fresh(DK('2027-05-20'),18,'noodle'); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','noodle'); SOCIAL.remember('heroine_03','RENT_CONSULTATION',''); crowd('heroine_03',['hc_ayi','npc_huangxh']); const o=await optsOf('heroine_03');
    check('8. 第 6 項 語彤麵店租約「幫她」三個選項：旁邊有人（阿姨、筱涵）照出（不擋）',['要不要我問問看有沒有打工？','需要的話，我可以先借妳。','我找了一些資料。'].every(t=>o.includes(t)),J(o)); });
/* 第 7 項 交往中的那一版：旁邊有人說一般版 */
await sec('8. 第 7 項 交往中的那一版：旁邊有人說一般版',async()=>{ const R7=[];
    fresh(TD('Y3S1',15,2),15,'campus'); H.CLOSE('heroine_01'); SOCIAL.meet('heroine_01','campus'); H.date('heroine_01'); const s1=PRIVTALK.ladStep(H.G,'heroine_01','A5-L8');
    crowd('heroine_01',['yu']); const a1=STORY.ladLines(s1,H.G,'heroine_01'); crowd('heroine_01',false); const b1=STORY.ladLines(s1,H.G,'heroine_01');
    R7.push(['extraIf A5-L8',!!s1&&J(a1)===J(s1.lines)&&J(b1)===J(s1.lines.concat(s1.extraIf[0].lines))]);
    fresh(TD('Y4S2',2,2),15,'campus'); H.CLOSE('heroine_03'); SOCIAL.meet('heroine_03','campus'); H.date('heroine_03'); const s2=PRIVTALK.ladStep(H.G,'heroine_03','Y8-L0');
    crowd('heroine_03',['npc_huangxh']); const a2=STORY.ladLines(s2,H.G,'heroine_03'); crowd('heroine_03',false); const b2=STORY.ladLines(s2,H.G,'heroine_03');
    R7.push(['linesIf Y8-L0',!!s2&&J(a2)===J(s2.lines)&&J(b2)===J(s2.linesIf[0].lines)]);
    fresh(TD('Y4S1',2,2),15,'campus'); H.CLOSE('heroine_05'); SOCIAL.meet('heroine_05','campus'); H.date('heroine_05'); const GT='{name}。……沒事。叫一下。';
    crowd('heroine_05',['npc_ta_chen']); const g1=STORY.ladGreet(H.G,'heroine_05'); crowd('heroine_05',false); const g2=STORY.ladGreet(H.G,'heroine_05');
    R7.push(['招呼',g1!==GT&&!!g1&&g2===GT]);
    fresh(TD('Y2S2',5,2),15,'campus'); H.CLOSE('heroine_01'); SOCIAL.meet('heroine_01','campus'); H.date('heroine_01'); const s4=PRIVTALK.ladStep(H.G,'heroine_01','A4-L5'), ch=s4&&s4.choices.find(c=>c.t==='「妳跟我講話好像也是。」');
    crowd('heroine_01',['yu']); const r1=ch&&STORY.ladReply(s4,ch,H.G,'heroine_01'); crowd('heroine_01',false); const r2=ch&&STORY.ladReply(s4,ch,H.G,'heroine_01');
    R7.push(['回覆 A4-L5',r1==='真的？我自己沒發現。'&&r2==='真的？……跟你講話本來就不用敬語啊。']);
    const e=NEEDED_MSGS.list.find(x=>x.who==='heroine_01'&&x.missDating&&x.miss); crowd('heroine_01',['yu']); const m1=STORY.neededMissFor(H.G,e,'heroine_01'); crowd('heroine_01',false); const m2=STORY.neededMissFor(H.G,e,'heroine_01');
    R7.push(['沒回那一句',!!e&&J(m1)===J(e.miss)&&J(m2)===J(e.missDating)]);
    crowd('heroine_01',['yu']); const syn={id:'T7-X',lines:[],linesIf:[{if:{flags:['dating_heroine_01']},lines:['（交往中才有的那一版）']}]}, m3=STORY.neededMissFor(H.G,{id:'t7',missDating:['MD']},'heroine_01');
    R7.push(['沒有一般版的照演',J(STORY.ladLines(syn,H.G,'heroine_01'))===J(['（交往中才有的那一版）'])&&J(m3)===J(['MD'])]);
    R7.push(['不記等待',J(H.G.flags.PRIVWAIT||{})==='{}']);
    check('8. 第 7 項 交往中的那一版：旁邊有人說一般版（以安 A5-L8 extraIf、語彤 Y8-L0 linesIf、學姊的招呼、A4-L5 的回覆、沒回訊息那一句的 missDating）；沒有一般版的照演；不擋、不記等待',R7.every(x=>x[1]),J(R7.filter(x=>!x[1]))); });
/* 第 8 項 子晴隨口講爸爸的階梯：不擋 */
await sec('8. 第 8 項 子晴隨口講爸爸的階梯：不擋',async()=>{ const Q=['Q-L6','Q2-L1','Q2-L8','Q3-L1','Q3-L6','Q4-L6','Q5-L3','Q5-L8','Q6-L1'];
    check('8. 第 8 項 子晴隨口講爸爸的閒聊階梯（Q-L6、Q2-L1…）：清單沒有、不擋',Q.every(s=>!(PRIVTALK.HOLD_BY||{})[s])&&!PRIVTALK.LIST.some(e=>e.steps&&Q.some(s=>s in e.steps))); });
/* 第 9 項 子晴 Q7 兩場：開頭的旁白 */
await sec('8. 第 9 項 子晴 Q7 兩場：開頭的旁白',async()=>{ const e1=evOf('ev_ziqing_lab_letter'), e2=evOf('ev_ziqing_dad_sorry'), d0=e=>e&&e.dialogue&&e.dialogue[0]; const ok0=[e1,e2].every(e=>d0(e)&&d0(e).speaker===null&&d0(e).text===Q7NARR);
    fresh(TD('Y2S1',3,1),19.5,'wancai'); H.FAMILIAR('heroine_04'); const R9=[]; for(const on of [false,['kai']]){ crowd('heroine_04',on); H.said=[]; H.picks=[]; await EVENTS.run(e1); R9.push(H.said[0]&&H.said[0].who===null&&H.said[0].t===Q7NARR&&noNarr()&&H.said.length>2); }
    check('8. 第 9 項 子晴 Q7「實驗室的信」「那天」：不擋，對話最前面一句旁白「（她把吉他放下，朝門外偏了一下頭。你們走到社辦外面的走廊。）」，旁邊有沒有人都一樣',ok0&&R9.every(Boolean),J({ok0,R9})); });
/* 第 10 項 前任那兩句 */
await sec('8. 第 10 項 前任那兩句',async()=>{ const AN='heroine_01', YT='heroine_03'; fresh(DK('2026-10-14'),20,'campus'); for(const id of [AN,YT]) SOCIAL.remember(id,'FIRST_MET',''); H.CLOSE(AN); ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); day(H.G.day+8); H.CLOSE(YT); ROM.start(H.G,YT); ROM.learn(H.G,AN,YT,'test');
    const d0=H.G.day; crowd(AN,['yu']); H.said=[]; await V6EX.preTalk(GM,{name:'沈以安'},AN); const s1=H.said.length, w1=W('ex_an_other',AN), f1=H.G.flags.V6EX_AN_OTHER;
    day(d0+7); H.said=[]; await V6EX.preTalk(GM,{name:'沈以安'},AN); const nf=narrFirst(), t=(H.said[1]||{}).t;
    fresh(DK('2026-10-14'),20,'campus'); H.G.flags.EX_heroine_04=true; SOCIAL.remember('heroine_04','FIRST_MET',''); crowd('heroine_04',['kai']); H.said=[]; await V6EX.preTalk(GM,{name:'高子晴'},'heroine_04'); const zq=H.said.map(x=>x.t);
    check('8. 第 10 項 前任以安「理由我懂。不用解釋。」：旁邊有人＝不說（不記說過）；第 8 天照說、第一句旁白；其他第一次見面的招呼（子晴 zqFirst）旁邊有人照說',
      s1===0&&w1===d0&&f1==null&&nf&&t==='理由我懂。不用解釋。'&&J(zq)===J(['好久不見。你看起來有睡飽。']),J({s1,w1,f1,nf,t,zq})); });
/* 第 11 項 到場就演的：不改 */
await sec('8. 第 11 項 到場就演的：不改',async()=>{ check('8. 第 11 項 到場就演的知情場景（MREL.dueAuto）、裂縫談話：不改（清單沒有、MREL.dueAuto 沒有包）',!PRIVTALK.LIST.some(e=>/dueAuto|cracktalk/.test(e.desc||''))&&!/PRIVTALK/.test(String(MREL.dueAuto))&&/不改/.test(PRIVTALK.DECIDED[10].impl)); });
/* 第 12 項 例外只限三組（假的圈子） */
await sec('8. 第 12 項 例外只限三組（假的圈子）',async()=>{ const R12=[];
    { const d0=TD('Y1S1',6,1); await ytLad(d0,15,'campus','Y-L7'); crowd('heroine_03',['hc_ayi']); const a=nextId(H.G,'heroine_03'); crowd('heroine_03',['hc_ayi','npc_huangxh']); const b=nextId(H.G,'heroine_03'); crowd('heroine_03',['heroine_04']); const c=nextId(H.G,'heroine_03');
      R12.push(['語彤和阿姨（Y-L7）',a==='Y-L7'&&b===null&&c===null]); }
    { fresh(TD('Y1S2',11,6),15,'wenzhou'); H.FAMILIAR('heroine_02'); const ev=evOf('ev_zhiruo_secret'); crowd('heroine_02',['heroine_04']); const a=EVENTS.check(ev); crowd('heroine_02',['heroine_04','hc_xt']); const b=EVENTS.check(ev);
      R12.push(['芷若和子晴（Z4）',a===true&&b===false]); }
    { fresh(TD('Y2S1',5,1),12.5,'linze',{dating_classmate_peishan:true}); H.FAMILIAR('classmate_peishan'); done('ev_peishan_doubt'); crowd('classmate_peishan',['classmate_bohan']); R12.push(['其他組沒有例外（沛珊和柏翰：P3）',EVENTS.check(evOf('ev_peishan_decision'))===false]); }
    { fresh(TD('Y1S1',6,1),15,'campus'); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','campus'); crowd('heroine_03',['hc_ayi']); R12.push(['麵店以外（校園，強制阿姨在旁邊）：阿姨只對媽媽的事例外（約她去…照擋，照舊；麵店裡＝第 10 段）',!(await optsOf('heroine_03')).some(t=>/^約她去/.test(t))]); }
    check('8. 第 12 項 例外只限三組：語彤和阿姨（媽媽的事）、芷若和子晴（交換申請）照出，旁邊多一個別人照擋；別的組、別的事沒有例外（麵店以外；語彤在麵店＝後補第 6 點，第 10 段）',R12.every(x=>x[1]),J(R12.filter(x=>!x[1]))); });
/* 真的圈子：麵店（d 那一天 h 點，語彤顧店站在 (2.6,−3.6)；E、GM 換成測試用的 3D，HCIRCLE.arrange 照圈子表生阿姨、站好）。社交的設定在 fresh 之後才做，這裡不動 */
const noodle3D=(d,h)=>{ fresh(d,h,'noodle'); E.zone={id:'noodle',seats:[],spawn:{x:0,z:3.5}}; E.npcs=[]; GM.npc={}; E.canStand=()=>true; E.indoor=true;
  E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; }; E.moveTo=(n,x,z,cb)=>{ n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; }; E.player.obj.position={x:500,y:0,z:500};
  GM.spawnNPC=(id,spec,x,z,o)=>{ o=o||{}; const n={id,spec,name:spec&&spec.name,obj:{position:{x,y:0,z},rotation:{y:0},userData:{}},lv:o.lv|0,beh:'idle',pose:'idle',idlePose:'idle'}; GM.npc[id]=n; E.npcs.push(n); return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete GM.npc[id]; } };
  const yt={id:'heroine_03',charId:'heroine_03',name:'語彤',obj:{position:{x:2.6,y:0,z:-3.6},rotation:{y:-Math.PI/2}},lv:0,frozen:true,beh:'idle',pose:'idle',idlePose:'idle'}; GM.npc.heroine_03=yt; E.npcs.push(yt);
  STORY._bindGM(GM); HCIRCLE.bind(GM); HCIRCLE.arrange(GM,false); return yt; };
const noodle3Dend=()=>{ try{ delete GM.spawnNPC; delete GM.removeNPC; }catch(e){} };
/* 大一上週二：c503_6_2（語彤和阿姨）那一天擲到（on true）／沒擲到（on false）、語彤照樣顧店的第一天 */
const ayiDay=on=>{ const r=HCIRCLE.row('c503_6_2'); for(let w=2;w<=15;w++){ const x=TD('Y1S1',w,2); fresh(x,18,'noodle'); if(HCIRCLE.on(r,H.G)===on&&MREL.ytShift(H.G)) return x; } return null; };
/* 第 12 項 真的圈子：麵店的阿姨（HCIRCLE.withNow 回傳旁邊那幾個人的 id）；後補第 6 點起，麵店只有阿姨＝「約她去…」也照出，旁邊再多一個同伴才擋 */
await sec('8. 第 12 項 真的圈子：麵店的阿姨（HCIRCLE.w',async()=>{ const d=ayiDay(true);
    const yt=noodle3D(d,18); H.FAMILIAR('heroine_03'); SOCIAL.meet('heroine_03','noodle'); const who=STORY.companyOf(H.G,'heroine_03',yt,GM);
    const a=PRIVTALK.ok(H.G,'heroine_03','yt_mom_ask',GM), b=PRIVTALK.ok(H.G,'heroine_03','invite',GM); crowd('heroine_03',['npc_huangxh']); const c=PRIVTALK.ok(H.G,'heroine_03','invite',GM), who2=STORY.companyOf(H.G,'heroine_03',yt,GM);
    noodle3Dend();
    check('8. 第 12 項 真的圈子（語彤顧店、阿姨在旁邊，HCIRCLE）：STORY.companyOf＝["hc_ayi"]；媽媽的事（Y4-L6 的選項）照出；「約她去…」也照出（後補第 6 點：麵店只有阿姨），旁邊再多一個同伴（筱涵）＝照擋',
      d!=null&&J(who)===J(['hc_ayi'])&&a===true&&b===true&&J(who2)===J(['hc_ayi','npc_huangxh'])&&c===false,J({d,who,a,b,who2,c})); });

/* ===================== 第 14 節後補（AA_503 第 14 節後補，企劃線 0e46fdc7e）：第 3 項擋下來沒演的不算知情的次數（第 4 項不重算＝第 7 段 (e)）===================== */
await sec('9. 對稿：第 14 節後補',async()=>{ const L=(HAS()&&PRIVTALK.LATER)||[];
  check('9. 對稿（白名單上 AA_503 那一版有第 14 節後補）：第 3 項「擋下來沒演的不算」「只有真的演出來的才算一次」、第 4 項「不重新算」「7 天從這一項第一次被擋那天起算，到第 8 天照演」、第 5 點三句；PRIVTALK.LATER 9 項（第 6、7 點＝第 10 段，第 8、9 點＝第 11 段）、REF2＝0e46fdc7e、19b4307eb、5ec2fe771',
    /### 14-後補/.test(DOC503)&&DOC503.includes('**擋下來沒演的不算**')&&DOC503.includes('只有真的演出來的才算一次')&&DOC503.includes('**不重新算**')&&DOC503.includes('7 天從這一項第一次被擋那天起算，到第 8 天照演')
    &&DOC503.includes('語彤在麵店，阿姨不算「旁邊有人」')&&DOC503.includes('只有阿姨在的時候照演，不加旁白。')&&DOC503.includes('旁邊還有別的圈子同伴的，照規則擋。')
    &&L.length===9&&L.every((x,i)=>x.n===i+1&&x.desc&&x.decided&&x.impl)&&/0e46fdc7e/.test(PRIVTALK.REF2||'')&&/19b4307eb/.test(PRIVTALK.REF2||'')&&/5ec2fe771/.test(PRIVTALK.REF2||''),J({sha:SHA503,n:L.length})); });
/* 學姊：知情對話以後（phase talked），一般見面的次數 meets（兩次以後，下一次見面演結果）*/
const sisTalked=(d,meets)=>{ fresh(d,16,'lawlib'); E.zone={roomAt:()=>null,seats:[]}; for(const id of ['heroine_05','heroine_01']){ H.CLOSE(id); SOCIAL.meet(id,'lawlib'); H.date(id); }
  return (MREL.rec(H.G).st.heroine_05={y:'heroine_01',n:1,day:H.G.day-20,phase:'talked',meets:meets|0,intent:'unsure',talkDay:H.G.day-10}); };
const sm5=()=>((MREL.rec(H.G).sm||{}).heroine_05||null);
await sec('9. 第 3 項 學姊一般見面（meets）',async()=>{ const st=sisTalked('2027-10-12',0), d0=H.G.day; crowd('heroine_05',['npc_ta_chen']);
  const a1=MREL.meetAction(H.G,'heroine_05','talk'), m1=st.meets, s1=sm5(), w1=W('knows_talk','heroine_05');
  day(d0+1); crowd('heroine_05',false); const a2=MREL.meetAction(H.G,'heroine_05','talk'), m2=st.meets, s2=sm5(), w2=W('knows_talk','heroine_05');
  check('9. 第 3 項（學姊一般見面）：知情對話以後和她說話，旁邊有陳助教＝擋下來，不算一次（meets 不加、一般見面 MREL.sisMet 不記）、記等待；她一個人＝算一次、記一般見面、清掉等待',
    a1===null&&m1===0&&s1===null&&w1===d0&&a2===null&&m2===1&&J(s2)===J([d0+1])&&w2===null,J({a1,m1,s1,w1,a2,m2,s2,w2})); });
await sec('9. 第 3 項 學姊的結果（兩次一般見面以後）',async()=>{ const st=sisTalked('2027-10-12',2), d0=H.G.day; crowd('heroine_05',['npc_ta_chen']); const b0=J(st);
  const a1=MREL.meetAction(H.G,'heroine_05','talk'), s1=sm5(), same=J(st)===b0; day(d0+7); const a8=MREL.meetAction(H.G,'heroine_05','talk'); H.said=[]; H.picks=[]; if(a8) await a8.run(GM); const nf=narrFirst();
  check('9. 第 3 項（學姊，兩次一般見面以後演結果）：旁邊有人＝擋下來，她那一段流程不動、一般見面不記（原本擋下來也記 sisMet）；第 8 天照演，第一句旁白',a1===null&&s1===null&&same&&!!a8&&a8.abort===true&&nf&&H.said.length>1,J({a1,s1,same,a8:!!a8,s:said().slice(0,2)})); });
/* 語彤：她說要時間（talk1 的 disturb）以後 14 天內和她說話＝打擾（dist；第一次疏遠，第二次演結果 D）*/
const ytWaiting=d=>{ fresh(d,16,'campus'); E.zone={roomAt:()=>null,seats:[]}; for(const id of ['heroine_03','heroine_01']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); }
  return (MREL.rec(H.G).st.heroine_03={y:'heroine_01',n:1,day:H.G.day-3,phase:'waiting',disturb:true,talk1Day:H.G.day-1}); };
await sec('9. 第 3 項 語彤被打擾（dist）',async()=>{ const st=ytWaiting('2027-10-12'), d0=H.G.day, P=()=>[st.dist|0,!!st.distant]; crowd('heroine_03',['npc_huangxh']);
  const a1=MREL.meetAction(H.G,'heroine_03','talk'), t1=P(), w1=W('knows_talk','heroine_03');
  day(d0+1); crowd('heroine_03',false); const a2=MREL.meetAction(H.G,'heroine_03','talk'), t2=P(), w2=W('knows_talk','heroine_03');
  day(d0+2); crowd('heroine_03',['npc_huangxh']); const a3=MREL.meetAction(H.G,'heroine_03','talk'), t3=P(), w3=W('knows_talk','heroine_03');
  day(d0+3); crowd('heroine_03',false); const a4=MREL.meetAction(H.G,'heroine_03','talk'), t4=st.dist|0;
  check('9. 第 3 項（語彤被打擾）：旁邊有人＝擋下來，不算打擾（dist、distant 不動）、記等待；她一個人＝算第一次（疏遠）、清掉；第二次旁邊有人＝還是不算（不會變 2、不演結果 D）；她一個人＝第二次，演結果 D',
    a1===null&&J(t1)===J([0,false])&&w1===d0&&a2===null&&J(t2)===J([1,true])&&w2===null&&a3===null&&J(t3)===J([1,true])&&w3===d0+2&&!!a4&&a4.abort===true&&t4===2,J({a1,t1,w1,a2,t2,w2,a3,t3,w3,a4:!!a4,t4})); });
/* 只有次數的那一次，等了 7 天：照算，第一句旁白，接著照常說話（STORY.talkCharacter 整段）*/
/* 第 5 點（AA 19b4307eb）：語彤在麵店，阿姨不算旁邊有人——麵店的發現（kind noodle：她在麵店顧店、玩家走進去）、打擾（kind talk）；旁邊還有別的同伴照擋 */
await sec('9. 第 5 點 語彤在麵店：阿姨不算旁邊有人',async()=>{ let d=null; for(let w=2;w<=15&&d==null;w++){ const x=TD('Y1S1',w,2); fresh(x,18,'noodle'); if(MREL.ytShift&&MREL.ytShift(H.G)) d=x; }
  const setDisc=()=>{ fresh(d,18,'noodle'); E.zone={roomAt:()=>null,seats:[]}; for(const id of ['heroine_03','heroine_01']){ H.CLOSE(id); SOCIAL.meet(id,'noodle'); H.date(id); } MREL.rec(H.G).pend.heroine_03={y:'heroine_01',day:H.G.day-1,h:0}; };
  setDisc(); crowd('heroine_03',['hc_ayi']); const a1=MREL.meetAction(H.G,'heroine_03','noodle'), w1=W('knows_talk','heroine_03');
  setDisc(); crowd('heroine_03',['hc_ayi','npc_huangxh']); const a2=MREL.meetAction(H.G,'heroine_03','noodle'), w2=W('knows_talk','heroine_03'), p2=!!MREL.rec(H.G).pend.heroine_03;
  const st=ytWaiting('2027-10-12'), P=()=>[st.dist|0,!!st.distant]; crowd('heroine_03',['hc_ayi']); const a3=MREL.meetAction(H.G,'heroine_03','talk'), t3=P(), w3=W('knows_talk','heroine_03');
  const sj=ytWaiting('2027-10-12'), Q=()=>[sj.dist|0,!!sj.distant]; crowd('heroine_03',['hc_ayi','npc_huangxh']); const a4=MREL.meetAction(H.G,'heroine_03','talk'), t4=Q(), w4=W('knows_talk','heroine_03');
  check('9. 第 5 點（語彤在麵店）：麵店的發現，旁邊只有阿姨＝照演（不擋、不記等待）；阿姨＋別的同伴＝擋（記等待、發現留著）；打擾也一樣：只有阿姨＝算第一次，阿姨＋別人＝不算',
    d!=null&&!!a1&&w1==null&&a2===null&&w2!=null&&p2&&a3===null&&J(t3)===J([1,true])&&w3==null&&a4===null&&J(t4)===J([0,false])&&w4!=null,J({d,a1:!!a1,w1,a2,w2,p2,a3,t3,w3,a4,t4,w4})); });
await sec('9. 第 3 項 只有次數的那一次，等了 7 天',async()=>{ const st=sisTalked('2027-10-12',0), d0=H.G.day, n=npc('heroine_05'); crowd('heroine_05',['npc_ta_chen']);
  H.said=[]; H.picks=['就這樣']; await STORY.talkCharacter('heroine_05',n); const m1=st.meets, w1=W('knows_talk','heroine_05'), nn1=noNarr();
  day(d0+7); H.said=[]; H.picks=['就這樣']; await STORY.talkCharacter('heroine_05',n); const m8=st.meets, nf=narrFirst(), w8=W('knows_talk','heroine_05'), s8=said();
  check('9. 第 3 項（只有次數的那一次，和學姊說話）：第 1 天陳助教在旁邊＝不算、記等待、沒有旁白；第 8 天旁邊有人也算一次：第一句旁白，接著照常說話，清掉等待',
    m1===0&&w1===d0&&nn1&&m8===1&&nf&&s8.length>1&&w8===null,J({m1,w1,nn1,m8,nf,s8:s8.slice(0,3),w8})); });
/* 類似的：可昕收回以後（thinking）第一次見面的紀錄 w（隔天以後見面她說那一段）*/
await sec('9. 第 3 項 可昕收回以後第一次見面（w）',async()=>{ fresh('2027-10-12',16,'campus'); for(const id of ['kexin','heroine_01']){ H.CLOSE(id); SOCIAL.meet(id,'campus'); H.date(id); } const d0=H.G.day;
  const st=MREL.rec(H.G).st.kexin={y:'heroine_01',n:1,day:d0-5,phase:'thinking'}; crowd('kexin',['npc_huangxh']);
  const a1=MREL.meetAction(H.G,'kexin','talk'), w1=!!st.w; day(d0+1); crowd('kexin',false); const a2=MREL.meetAction(H.G,'kexin','talk'), wd=st.w&&st.w.day;
  check('9. 第 3 項（類似的：可昕收回以後第一次見面的紀錄 w）：旁邊有人＝不記（她那一段流程不動）；她一個人那天才記',a1===null&&!w1&&a2===null&&wd===d0+1,J({a1,w1,a2,wd})); });

/* ===================== 第 14 節後補第 6、7 點（PRIV-AUNT-1028，企劃線 5ec2fe771；BB-C 11:41 在 v9.10.13 rc2 測出）===================== */
const INV_T=/^約她去/;
/* 語彤和以安都在交往、語彤還不知道以安（tell_later 的選項「（下次見面，自己跟她講以安的事）」）*/
const ytTwo=zone=>{ for(const id of ['heroine_03','heroine_01']){ H.CLOSE(id); SOCIAL.meet(id,zone); H.date(id); } const y=MREL.confLaterFor(H.G,'heroine_03'); return y?MREL.confLaterOpt(H.G,'heroine_03',y):null; };
await sec('10. 對稿：第 6、7 點',async()=>{ const L=(HAS()&&PRIVTALK.LATER)||[], B=((MULTIREL_LINES.DISC||{}).heroine_03||{}).base||[];
  const if1=B.find(x=>x&&x.if==='auntIn'&&x.else), if2=B.find(x=>x&&(x.if==='auntIn'||x.if==='auntLate')&&x.then);   /* 最後那三句：第 8 點（f6069e42d）起看 auntLate（阿姨在、19:00 以後），第 11 段 */
  check('10. 對稿（白名單上 AA_503 那一版有後補第 6、7 點）：第 6 點「麵店只有阿姨在」、包含麵店裡所有私密的選項、「約她去…照擋」只限旁邊還有別的圈子同伴；第 7 點「阿姨在不在店裡，看 3D」、在／不在、3D 的時間不改；'
    +'PRIVTALK.LATER 第 6、7 項、PLACE_EXCEPT＝語彤在麵店不算阿姨；遊戲裡「今天很忙喔？」那一段：auntIn 不在＝「阿姨呢？」「去買東西。」、在＝「阿姨，我等一下自己收。」「好啦，你們年輕人。」（阿姨先上樓）（第 8 點起這三句還要 19:00 以後＝auntLate，第 11 段）',
    DOC503.includes('**麵店只有阿姨在：「約她去…」和 tell_later 也照出**')&&DOC503.includes('第 5 點「阿姨不算旁邊有人」包含麵店裡所有私密的選項：知情場景、「約她去…」、「（下次見面，自己跟她講…的事）」。')
    &&DOC503.includes('第 14 節第 12 項那句「『約她去…』照擋」，只限旁邊還有別的圈子同伴的時候。')&&DOC503.includes('**阿姨在不在店裡，看 3D**')
    &&DOC503.includes('`auntIn` 改看阿姨的 3D 人物現在在不在麵店（圈子表 `c503_6_2` 那幾列）。')&&DOC503.includes('- 在：不問「阿姨呢？」；')&&DOC503.includes('- 不在：「阿姨呢？」「去買東西。」。')&&DOC503.includes('3D 的時間不改（`AA_503` 第 6 節圈子表照舊）。')
    &&L.length>=7&&L[5].n===6&&L[6].n===7&&/PLACE_EXCEPT/.test(L[5].impl)&&/labelIn/.test(L[6].impl)&&J(PRIVTALK.PLACE_EXCEPT)===J([{who:'heroine_03',zone:'noodle',except:['hc_ayi']}])
    &&!!if1&&J(if1.else)===J([{p:'阿姨呢？'},'去買東西。'])&&!!if2&&J(if2.then)===J(['阿姨，我等一下自己收。',{s:{name:'阿姨'},t:'好啦，你們年輕人。'},{n:'（阿姨先上樓）'}]),J({sha:SHA503,n:L.length})); });
/* (A) 第 6 點：麵店只有阿姨＝「約她去…」、tell_later 照出（測試強制旁邊的人）；阿姨＋別的同伴、只有別的同伴＝照擋；校園強制阿姨＝照擋（照舊） */
await sec('10. (A) 麵店只有阿姨：「約她去…」、tell_later',async()=>{ const d=ayiDay(true), R=[];
  fresh(d,18.2,'noodle'); const t=ytTwo('noodle');
  crowd('heroine_03',['hc_ayi']); const o1=await optsOf('heroine_03'); R.push(['只有阿姨＝兩個都出、不記等待',o1.some(x=>INV_T.test(x))&&o1.includes(t)&&W('invite','heroine_03')===null&&W('tell_later','heroine_03')===null,J(o1)]);
  H.opts=[]; H.said=[]; H.picks=['自己跟她講']; await STORY.offerInvite(GM,'heroine_03',npc('heroine_03')); R.push(['選了 tell_later＝不加旁白（阿姨不算旁邊有人）、記下次見面講',noNarr()&&!!MREL.rec(H.G).cpend.heroine_03,J(said())]); delete MREL.rec(H.G).cpend.heroine_03;
  crowd('heroine_03',['hc_ayi','npc_huangxh']); const o2=await optsOf('heroine_03'); R.push(['阿姨＋筱涵＝兩個都擋、記等待',!o2.some(x=>INV_T.test(x))&&!o2.includes(t)&&W('invite','heroine_03')===H.G.day&&W('tell_later','heroine_03')===H.G.day,J(o2)]);
  fresh(d,18.2,'noodle'); ytTwo('noodle'); crowd('heroine_03',['npc_huangxh']); const o3=await optsOf('heroine_03'); R.push(['只有筱涵＝照擋',!o3.some(x=>INV_T.test(x))&&!o3.includes(t),J(o3)]);
  fresh(d,18.2,'campus'); ytTwo('campus'); crowd('heroine_03',['hc_ayi']); const o4=await optsOf('heroine_03'); R.push(['校園（強制阿姨在旁邊）＝照擋（麵店以外照舊）',!o4.some(x=>INV_T.test(x))&&!o4.includes(t),J(o4)]);
  check('10. (A) 第 6 點（麵店，強制旁邊的人）：只有阿姨＝「約她去…」、「'+t+'」照出、不記等待，選了不加旁白；阿姨＋別的同伴＝照擋（記等待）；只有別的同伴＝照擋；麵店以外（校園強制阿姨）照舊擋',
    !!t&&R.every(x=>x[1]),J(R.filter(x=>!x[1]))); });
await sec('10. (A) 第 7 項交往中那一版：麵店只有阿姨',async()=>{ const one=(zone,on)=>{ fresh(TD('Y4S2',2,2),15,zone); H.CLOSE('heroine_03'); SOCIAL.meet('heroine_03',zone); H.date('heroine_03'); const s=PRIVTALK.ladStep(H.G,'heroine_03','Y8-L0'); crowd('heroine_03',on); return {s,L:s?STORY.ladLines(s,H.G,'heroine_03'):null}; };
  const a=one('noodle',['hc_ayi']), b=one('noodle',['hc_ayi','npc_huangxh']), c=one('campus',['hc_ayi']);
  check('10. (A) 第 7 項交往中那一版（語彤 Y8-L0 的 linesIf）也走 S.crowd：麵店只有阿姨＝說交往中那一版；阿姨＋筱涵＝一般版；校園強制阿姨＝一般版（照舊）；不記等待',
    !!a.s&&J(a.L)===J(a.s.linesIf[0].lines)&&J(b.L)===J(b.s.lines)&&J(c.L)===J(c.s.lines)&&J(H.G.flags.PRIVWAIT||{})==='{}',J({a:a.L,b:b.L,c:c.L})); });
/* (A) 真的圈子：BB 那一天（2025-09-09 週二 18:12 麵店，c503_6_2 那一天擲到＝HCIRCLE.arrange 生出阿姨，站在語彤旁邊）*/
await sec('10. (A) 真的圈子：BB 那一天的麵店',async()=>{ const d=DK('2025-09-09'), r=HCIRCLE.row('c503_6_2'); const yt=noodle3D(d,18.2); const t=ytTwo('noodle'), on=HCIRCLE.on(r,H.G,'noodle'), ay=GM.npc.hc_ayi, who=STORY.companyOf(H.G,'heroine_03',yt,GM);
  const opts=async(pick)=>{ H.opts=[]; H.said=[]; H.picks=[pick||'就這樣']; await STORY.offerInvite(GM,'heroine_03',yt); return H.opts[0]||[]; };
  const o1=await opts(); const o2=await opts('自己跟她講'), cp=!!MREL.rec(H.G).cpend.heroine_03, nn=noNarr(); delete MREL.rec(H.G).cpend.heroine_03;
  crowd('heroine_03',['npc_huangxh']); const o3=await opts(); noodle3Dend();
  check('10. (A) 真的圈子（BB 那一天 2025-09-09 18:12：c503_6_2 成立、3D 生出阿姨，companyOf＝["hc_ayi"]）：選單有「約她去…」和「'+t+'」；選了 tell_later 不加旁白；旁邊再多一個同伴（筱涵）＝兩個都不出',
    on===true&&!!ay&&J(who)===J(['hc_ayi'])&&!!t&&o1.some(x=>INV_T.test(x))&&o1.includes(t)&&o2.includes(t)&&cp&&nn&&!o3.some(x=>INV_T.test(x))&&!o3.includes(t),J({on,ay:!!ay,who,o1,o3,cp,nn})); });
/* (B) 第 7 點：auntIn 看 3D 的阿姨（HCIRCLE.labelIn：c503_6_2 那幾列現在成立）*/
await sec('10. (B) auntIn 看 3D 的阿姨',async()=>{ const dOn=ayiDay(true), dOff=ayiDay(false);
  const A=(d,h)=>{ fresh(d,h,'noodle'); return [HCIRCLE.labelIn(H.G,'hc_ayi','noodle'),MREL.auntIn(H.G),MREL.ctx(H.G,'heroine_03','heroine_01').cond.auntIn()]; };
  const a=A(dOn,18.2), b=A(dOff,18.2), c=A(dOn,17), e=A(dOn,20.6), f=A(dOn,19.5), key=x=>x!=null&&CALENDAR.dateOf(x).key;
  check('10. (B) auntIn＝HCIRCLE.labelIn＝MREL.auntIn（c503_6_2 那一列現在成立）：'+key(dOn)+' 18:12 在、19:30 在；'+key(dOff)+' 18:12 不在（那一天沒擲到，語彤照樣顧店）；17:00、20:36 不在（那一列 17:30～20:30）',
    key(dOn)==='2025-09-09'&&dOff!=null&&J(a)===J([true,true,true])&&J(f)===J([true,true,true])&&J(b)===J([false,false,false])&&J(c)===J([false,false,false])&&J(e)===J([false,false,false]),J({dOn:key(dOn),dOff:key(dOff),a,b,c,e,f})); });
await sec('10. (B) 發現那一場：3D 的阿姨在／不在',async()=>{ const dOn=ayiDay(true), dOff=ayiDay(false);
  const disc=async(d,h)=>{ noodle3D(d,h); ytTwo('noodle'); MREL.rec(H.G).pend.heroine_03={y:'heroine_01',day:H.G.day-1,h:0}; const ay=!!GM.npc.hc_ayi, a=MREL.dueAuto(H.G);
    H.said=[]; H.picks=[]; if(a&&a.x==='heroine_03') await MREL.play(GM,a); noodle3Dend(); return {ay,x:a&&a.x,s:H.lines()}; };
  const hasL=(r,t)=>r.s.some(l=>l===t||l.endsWith('：'+t));
  const r1=await disc(dOn,18.2), r2=await disc(dOff,18.2), r3=await disc(dOn,19.5);
  check('10. (B) 語彤《等我下班一下》（MREL.dueAuto，18:12 走進麵店）：3D 的阿姨在（GM.npc.hc_ayi）＝沒有「阿姨呢？」「去買東西。」；最後那三句照原本 19:00 以後（第 8 點，f6069e42d）＝18:12 沒有，19:30 那一場有「阿姨，我等一下自己收。」「好啦，你們年輕人。」（阿姨先上樓）',
    r1.ay===true&&r1.x==='heroine_03'&&hasL(r1,'今天很忙喔？')&&!hasL(r1,'阿姨呢？')&&!hasL(r1,'去買東西。')&&!hasL(r1,'阿姨，我等一下自己收。')&&!r1.s.includes('阿姨：好啦，你們年輕人。')
    &&r3.ay===true&&r3.x==='heroine_03'&&!hasL(r3,'阿姨呢？')&&hasL(r3,'阿姨，我等一下自己收。')&&r3.s.includes('阿姨：好啦，你們年輕人。')&&r3.s.includes('（阿姨先上樓）'),J({r1,r3}));
  check('10. (B) 3D 的阿姨不在（那一天沒擲到，語彤照樣顧店）＝「阿姨呢？」「去買東西。」，沒有「阿姨，我等一下自己收。」',
    r2.ay===false&&r2.x==='heroine_03'&&hasL(r2,'阿姨呢？')&&hasL(r2,'去買東西。')&&!hasL(r2,'阿姨，我等一下自己收。')&&!r2.s.includes('阿姨：好啦，你們年輕人。'),J(r2)); });

/* ===================== 第 14 節後補第 8、9 點（PRIV-AUNT-1028 第二輪，企劃線 38a74680d、f6069e42d）===================== */
/* 那一學期阿姨那一列（rid）擲到（on true）／沒擲到（on false）、語彤照樣顧店的週二或週四（h 點）*/
const ayiDayT=(rid,on,h)=>{ const r=HCIRCLE.row(rid), q=r&&CALENDAR.termDays(r.terms[0]); if(!q) return null; for(let x=q.from;x<=q.to;x++){ const wd=wdOf(x); if(wd!==2&&wd!==4) continue; fresh(x,h||18.5,'noodle'); if(MREL.ytShift(H.G)&&HCIRCLE.on(r,H.G)===on) return x; } return null; };
/* 發現那一場（《等我下班一下》）：d 那一天 h 點走進麵店（3D：HCIRCLE.arrange 照圈子表生不生阿姨）*/
const ytDisc=async(d,h)=>{ noodle3D(d,h); ytTwo('noodle'); MREL.rec(H.G).pend.heroine_03={y:'heroine_01',day:H.G.day-1,h:0}; const ay=!!GM.npc.hc_ayi, a=MREL.dueAuto(H.G);
  H.said=[]; H.picks=[]; if(a&&a.x==='heroine_03') await MREL.play(GM,a); noodle3Dend(); return {ay,x:a&&a.x,s:H.lines()}; };
const hasS=(r,t)=>r.s.some(l=>l===t||l.endsWith('：'+t));
/* 麵店（3D）＋原本那位無名的店員（story3d.js S.populate 的 clerk，廚房工作台前 (-2,-2.75)）；withYt＝語彤顧店的人在這一區 */
const noodleK=(d,h,withYt)=>{ fresh(d,h,'noodle'); E.zone={id:'noodle',seats:[],spawn:{x:0,z:3.5}}; E.npcs=[]; GM.npc={}; E.canStand=()=>true; E.indoor=true;
  E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; }; E.moveTo=(n,x,z,cb)=>{ n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; }; E.player.obj.position={x:500,y:0,z:500};
  GM.spawnNPC=(id,spec,x,z,o)=>{ o=o||{}; const n={id,spec,name:spec&&spec.name,obj:{position:{x,y:0,z},rotation:{y:0},userData:{}},lv:o.lv|0,beh:'idle',pose:'idle',idlePose:'idle'}; GM.npc[id]=n; E.npcs.push(n); return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete GM.npc[id]; } };
  const ck={clerk:true,isExtra:true,name:'',obj:{position:{x:-2.0,y:0,z:-2.75},rotation:{y:Math.PI},visible:true},lv:0}; E.npcs.push(ck); let yt=null;
  if(withYt){ yt={id:'heroine_03',charId:'heroine_03',name:'語彤',obj:{position:{x:2.6,y:0,z:-3.6},rotation:{y:-Math.PI/2}},lv:0,frozen:true,beh:'idle',pose:'idle',idlePose:'idle'}; GM.npc.heroine_03=yt; E.npcs.push(yt); }
  STORY._bindGM(GM); HCIRCLE.bind(GM); HCIRCLE.arrange(GM,false); return {ck,yt}; };
const ckVis=ck=>ck.hidden!==true&&ck.obj.visible!==false, ayiHere=()=>{ const a=GM.npc.hc_ayi; return !!a&&!a.leaving&&!a.hidden; };
await sec('11. 對稿：第 8、9 點',async()=>{ const L=(HAS()&&PRIVTALK.LATER)||[], B=((MULTIREL_LINES.DISC||{}).heroine_03||{}).base||[], if1=B.find(x=>x&&x.if==='auntIn'&&x.else), if2=B.find(x=>x&&x.if==='auntLate'&&x.then);
  const T9={'大二下':'c503_14_1','大三上':'c503_14_2','大三下':'c503_14_3','大四上':'c503_14_4','大四下':'c503_14_5'}, rows=[];
  for(const l of DOC503.split('\n')){ const m=/^\| (大二下|大三上|大三下|大四上|大四下) \| (.+) \|$/.exec(l); if(m) rows.push([m[1],m[2]]); }
  const bad=rows.filter(([t,hd])=>{ const r=HCIRCLE.row(T9[t]); return !r||r.heard!==hd; });
  check('11. 對稿（白名單上 AA_503 那一版 '+SHA503+' 有後補第 8、9 點）：交往中那一版照說、廚房那位就是阿姨（沒擲到的三成、17:30 以前、20:30 以後）、大二下以後每學期阿姨那一列（到 2029-09 畢業以後篇以前）、最後那三句照原本 19:00 以後出、只在語彤人在麵店的時候套用；'
    +'第 9 點的表五個學期＝遊戲裡 c503_14_1～5 的「走近時聽到」逐字；PRIVTALK.LATER 第 8、9 項、REF2 加 38a74680d、f6069e42d；「今天很忙喔？」那一段：「阿姨呢？」看 auntIn、最後那三句看 auntLate',
    DOC503.includes('語彤在麵店、旁邊只有阿姨的時候，交往中那一版的句子照說（第 14 節第 7 項的「改說一般版」不套用）。')&&DOC503.includes('**廚房那位就是阿姨**')
    &&DOC503.includes('阿姨不在店裡的時候（那天沒擲到的三成、17:30 以前、20:30 以後），廚房那位也不出現（請 LAWWW2 跟著藏）。')&&DOC503.includes('這樣「阿姨呢？」「去買東西。」才對得上。')
    &&DOC503.includes('**大二下以後也要有阿姨那一列**：週二、四 17:30～20:30 在麵店，同 `c503_6_2` 的做法，每學期都有（到 2029-09 畢業以後篇以前）。')&&DOC503.includes('「阿姨，我等一下自己收。」「好啦，你們年輕人。」照原本 19:00 以後出。')
    &&DOC503.includes('「廚房那位不出現」只在語彤人在麵店的時候套用，照 LAWWW。語彤不在的平常時段，店員照常在，玩家照常吃麵。')&&DOC503.includes('那學期語彤週二、四晚上不在麵店的就不加')
    &&rows.length===5&&!bad.length&&L.length===9&&L[7].n===8&&L[8].n===9&&L.slice(7).every(x=>x.desc&&x.decided&&x.impl)&&/38a74680d/.test(PRIVTALK.REF2||'')&&/f6069e42d/.test(PRIVTALK.REF2||'')
    &&!!if1&&J(if1.else)===J([{p:'阿姨呢？'},'去買東西。'])&&!!if2&&J(if2.then)===J(['阿姨，我等一下自己收。',{s:{name:'阿姨'},t:'好啦，你們年輕人。'},{n:'（阿姨先上樓）'}]),J({sha:SHA503,rows:rows.length,bad,n:L.length,if2:!!if2})); });
/* ① 第 8 點第 1 項：交往中那一版照說——真的圈子（大四下 c503_14_5 擲到的週二 18:30，HCIRCLE.arrange 生出阿姨）*/
await sec('11. ① 交往中那一版（真的圈子）',async()=>{ const d=ayiDayT('c503_14_5',true,18.5);
  const one=extra=>{ const yt=noodle3D(d,18.5); H.CLOSE('heroine_03'); SOCIAL.meet('heroine_03','noodle'); H.date('heroine_03'); if(extra) crowd('heroine_03',extra);
    const s=PRIVTALK.ladStep(H.G,'heroine_03','Y8-L0'), who=STORY.companyOf(H.G,'heroine_03',yt,GM), L=s?STORY.ladLines(s,H.G,'heroine_03'):null, w=J(H.G.flags.PRIVWAIT||{}); noodle3Dend(); return {s,L,who,w}; };
  const a=one(), b=one(['npc_huangxh']);
  check('11. ① 交往中那一版照說（第 8 點第 1 項）：大四下 '+(d!=null?CALENDAR.dateOf(d).key:'?')+' 18:30 麵店（c503_14_5 那一天擲到、3D 生出阿姨，companyOf＝["hc_ayi"]）＝Y8-L0 說交往中那一版、不記等待；旁邊多一個同伴（筱涵）＝一般版',
    d!=null&&!!a.s&&J(a.who)===J(['hc_ayi'])&&J(a.L)===J(a.s.linesIf[0].lines)&&a.w==='{}'&&!!b.s&&J(b.who)===J(['hc_ayi','npc_huangxh'])&&J(b.L)===J(b.s.lines),J({d,a:a.L,aw:a.who,b:b.L,bw:b.who})); });
/* ② 第 8 點第 2 項：廚房那位就是阿姨——「阿姨呢？」「去買東西。」對得上、點餐（阿姨不在＝阿姨的話不說）*/
await sec('11. ② 廚房那位就是阿姨',async()=>{ const dOff=ayiDay(false), dOn=ayiDay(true), K=[];
  { const s=noodleK(dOff,18.2,true); const out=HCIRCLE.auntOut(GM); const r=await ytDisc(dOff,18.2);
    K.push(['沒擲到 18:12：店員不在、阿姨不在（廚房沒有人，auntOut）；她問「阿姨呢？」「去買東西。」',!ckVis(s.ck)&&!ayiHere()&&out===true&&r.ay===false&&hasS(r,'阿姨呢？')&&hasS(r,'去買東西。'),J({out,s:r.s.slice(0,4)})]); }
  { const s=noodleK(dOn,18.2,true); const out=HCIRCLE.auntOut(GM); K.push(['擲到 18:12：阿姨在、店員藏起來（只有一個），不是 auntOut',!ckVis(s.ck)&&ayiHere()&&out===false]); }
  { const s=noodleK(dOff,17,true), a=ckVis(s.ck); const s2=noodleK(dOff,20.6,true), b=ckVis(s2.ck); K.push(['沒擲到那一天 17:00、20:36（語彤的人還在這一區，作息不是顧店）＝店員在',a&&b,J({a,b})]); }
  { const s=noodleK(dOff,18.2,false); K.push(['語彤不在麵店（她的人不在這一區）＝店員照常在、不是 auntOut',ckVis(s.ck)&&!ayiHere()&&HCIRCLE.auntOut(GM)===false]); }
  { const s=noodleK(dOff,18.2,true); s.yt.leaving=true; HCIRCLE.arrange(GM,true); K.push(['語彤走開（leaving）＝店員回來',ckVis(s.ck)]); }
  /* 點餐：老樣子那一句（阿姨）、阿姨請的那一碗（FEED.ytTreat；這支測試沒有載 FEED，用假的）*/
  if(typeof EAT==='undefined') for(const [f,n] of [['src/data/eat_lines.js',['EAT_LINES']],['src/eat3d.js',['EAT']]]) loadG(f,n);
  const SAME=((EAT_LINES.staff||{})['阿鳳麵店']||{}).same, OPTS=()=>[{t:'乾麵　60 元'},{t:'餛飩湯　70 元'},{t:'先不吃'}];
  const order=async(d,withYt)=>{ noodleK(d,18.2,withYt); H.G.eat={n:{'阿鳳麵店':4},last:{'阿鳳麵店':'乾麵'},l5:{'阿鳳麵店':1}}; H.said=[]; H.picks=['老樣子']; const k=await EAT.choose(GM,'阿鳳麵店',OPTS(),['乾麵','餛飩湯'],[60,70]); return {k,said:said(),away:EAT.staffAway(GM,'阿鳳麵店')}; };
  const o1=await order(dOff,true), o2=await order(dOn,true), o3=await order(dOff,false);
  K.push(['點「老樣子」：阿姨不在店裡（沒擲到、語彤顧店）＝阿姨那一句「'+SAME+'」不說（EAT.staffAway）；阿姨在、語彤不在店裡（店員＝阿姨）＝照說',!!SAME&&o1.k===0&&o1.away===true&&!o1.said.some(t=>t.endsWith(SAME))&&o2.k===0&&o2.away===false&&o2.said.includes('阿姨：'+SAME)&&o3.away===false&&o3.said.includes('阿姨：'+SAME),J({o1,o2,o3})]);
  const F0=typeof FEED!=='undefined'?FEED:undefined, TL='語彤上了！今天你的麵我請。', m0=GM.money;
  const treat=async(d)=>{ let doneN=0; const paid=[]; globalThis.FEED={ytTreatDue:()=>true,ytTreatOf:()=>({after:'yt_pass',line:TL}),ytTreatDone:()=>{ doneN++; }}; GM.money=x=>{ paid.push(x); };
    try{ noodleK(d,18.2,true); H.G.eat={}; H.said=[]; H.picks=[0]; await STORY.interact({eat:'noodle',seat:{x:0,z:0}},GM); return {paid,doneN,said:said()}; } finally { GM.money=m0; if(F0===undefined) delete globalThis.FEED; else globalThis.FEED=F0; } };
  const t1=await treat(dOff), t2=await treat(dOn);
  K.push(['阿姨請的那一碗（雙主修放榜以後第一次點餐）：阿姨不在店裡＝這一次照常付錢、不說、留到下一次；阿姨在＝「'+TL+'」、不用錢',
    !t1.said.some(t=>t.endsWith(TL))&&J(t1.paid)===J([-60])&&t1.doneN===0&&t2.said.includes('阿姨：'+TL)&&!t2.paid.length&&t2.doneN===1,J({t1,t2})]);
  check('11. ② 廚房那位就是阿姨（第 8 點第 2 項、第 9 點範圍）：語彤在麵店顧店、阿姨不在＝店員也不在（「阿姨呢？」「去買東西。」對得上）；阿姨在＝阿姨換掉店員；17:30 以前、20:30 以後、語彤不在或走開＝店員照常在；阿姨不在的時候點餐沒有人替阿姨回話',
    dOff!=null&&dOn!=null&&K.every(x=>x[1]),J(K.filter(x=>!x[1]))); });
/* ③ 第 8 點第 3 項：大二下以後每學期阿姨那一列——擲到那一天 18:30 在、19:30 那一場最後有「阿姨，我等一下自己收。」；18:30 那一場沒有；沒擲到＝「阿姨呢？」；2029-09 以後沒有 */
await sec('11. ③ 每學期阿姨那一列',async()=>{ const R3=[];
  for(const [rid,T] of [['c503_14_1','Y2S2'],['c503_14_2','Y3S1'],['c503_14_3','Y3S2'],['c503_14_4','Y4S1'],['c503_14_5','Y4S2']]){ const dOn=ayiDayT(rid,true,18.5), dOff=ayiDayT(rid,false,19.5);
    if(dOn==null||dOff==null){ R3.push([T,false,'找不到那一天']); continue; }
    fresh(dOn,18.5,'noodle'); const li=HCIRCLE.labelIn(H.G,'hc_ayi','noodle'), ai=MREL.auntIn(H.G), al=MREL.ctx(H.G,'heroine_03','heroine_01').cond.auntLate();
    const r18=await ytDisc(dOn,18.5), r19=await ytDisc(dOn,19.5), rOff=await ytDisc(dOff,19.5);
    const ok=li&&ai&&!al&&r18.ay&&r18.x==='heroine_03'&&!hasS(r18,'阿姨呢？')&&!hasS(r18,'阿姨，我等一下自己收。')
      &&r19.ay&&r19.x==='heroine_03'&&!hasS(r19,'阿姨呢？')&&hasS(r19,'阿姨，我等一下自己收。')&&r19.s.includes('阿姨：好啦，你們年輕人。')&&r19.s.includes('（阿姨先上樓）')
      &&!rOff.ay&&rOff.x==='heroine_03'&&hasS(rOff,'阿姨呢？')&&hasS(rOff,'去買東西。')&&!hasS(rOff,'阿姨，我等一下自己收。');
    R3.push([T+' '+CALENDAR.dateOf(dOn).key+'／'+CALENDAR.dateOf(dOff).key,ok,J({li,ai,al,r18:r18.s.slice(0,3),r19:r19.s.filter(l=>/阿姨/.test(l)),rOff:rOff.s.slice(0,4)})]); }
  const after=[]; for(const k of ['2029-06-05','2029-09-04','2029-10-16','2029-12-18']){ fresh(DK(k),18.5,'noodle'); after.push([k,MREL.ytShift(H.G),HCIRCLE.labelIn(H.G,'hc_ayi','noodle')]); }
  check('11. ③ 大二下以後每學期（大二下、大三上、大三下、大四上、大四下）：阿姨那一列擲到的那一天 18:30＝labelIn、auntIn 在，那一場沒有「阿姨呢？」、也還沒有最後那三句；19:30 那一場最後有「阿姨，我等一下自己收。」「好啦，你們年輕人。」（阿姨先上樓）；沒擲到＝「阿姨呢？」「去買東西。」',
    R3.length===5&&R3.every(x=>x[1]),J(R3.filter(x=>!x[1])));
  check('11. ③ 2029-09 畢業以後篇以後（大五上）、畢業那年夏天沒有阿姨那一列（她照作息週二照樣顧店）',after.every(x=>x[1]===true&&x[2]===false),J(after)); });

H.done();
})();
