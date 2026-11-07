// AA_625「語彤約一起念書」「15 一盞茶屋十週年」（企劃線 claude/cool-heisenberg-o8kuqx 0787572c6；任務 AA624-YT-BACKGROUND-1103；src/aa625_3d.js）——不需要瀏覽器（D131）。
//   0 讀稿、模組、index.html 的順序、白名單（AA_625、AA_11）、每一句都在稿裡（一字不差、說的人照稿）
//   1 第一次：大一下第 3 週（週二 21:40 私訊三句、「好。」／「這週不行。」、期限週三 13:30）；沒認識她（YT_MET_JOB）＝沒有；第 2 週＝還沒有
//     「好。」＝當週週三 14:00 木曜日（她約的、念書）；「這週不行。」＝「嗯。下次。」；沒回＝當成不行
//   2 見面：木曜日（她多一句、念的時候輪流一則、讀書算時數、讀完木曜日那一句旁白、照一起念書第 N 場）
//   3 之後的約：兩週一次、考試前兩週和考試週每週一次、平日下午或晚上、地點（木曜日／2:30 AM／大口漢堡）、四則輪流、刑總那一則只在隔天考刑總
//     拒絕、改天不扣分、改天不打開自己選時間、下一次照樣約；寒暑假、週末、國外不約
//   4 一般的約念書（別人、木曜日）：原本第 N 場被跳過、讀書不算——現在照演、照算（invites3d.js SCN）；別人的見面不演語彤的句子
//   5 十週年：12/16（六）19:00 一盞茶屋（出遊，12/11 起排）；四句、散場下雨三個版本、記憶、天氣；美國路線＝照片；沒去＝missed
// 修改前（開發分支 87aef2873）：模組不存在——FAIL。用法：node tests/aa625_yt_study_unit.js（先 git fetch origin claude/cool-heisenberg-o8kuqx）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
for(const f of ['src/data/study_scenes.js','src/studyn3d.js','src/mokuyobi_sys3d.js','src/aa625_3d.js']){ if(!fs.existsSync(path.join(H.ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const SHA='0787572c6', DOC625='docs/story_planning/AA_625_語彤新版事件台詞.md', DOC11='docs/story_planning/AA_11_事件書_陳語彤.md';
const doc=git(SHA,DOC625), doc11=git(SHA,DOC11);
const A=()=>typeof AA625!=='undefined'&&AA625&&AA625.L?AA625:null;
const YT='heroine_03', ZHE='zhe';
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7, key=d=>CALENDAR.dateOf(d).key, TD=(t,w,w7)=>STORY.termDayIn(t,w,w7);
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const runAt=(d,h)=>{ at(d,h); phone(); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const fresh=(d,h,zone,fl)=>{ const G=H.fresh(key(d),h,zone||'dorm',fl||{}); G.contacts=G.contacts||{}; G.invites=[]; G.outings=[]; G.stats=G.stats||{}; G.stats.study=0; G.acts=G.acts||{att:{}};
  E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; GM.npc={}; INV._now=()=>Date.now()+1e9; return G; };
const ytOffers=()=>(H.G.invites||[]).filter(iv=>iv.who===YT&&iv.yts);
const npcOf=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(s=>s.t);
(async()=>{
  /* ================= 0 ================= */
  check('0. AA_625、AA_11（0787572c6）讀得到',doc.length>5000&&doc.includes('## 語彤約一起念書')&&doc.includes('## 15 一盞茶屋十週年')&&doc11.includes('### 事件 15　一盞茶屋十週年'),doc?'':'git fetch origin claude/cool-heisenberg-o8kuqx');
  check('0. 模組載得到（AA625、STUDYN、MOKS）',!loadErr.length&&!!A()&&typeof STUDYN!=='undefined'&&typeof MOKS!=='undefined',J(loadErr));
  if(!A()){ H.done(); return; }
  const S=A(), L=S.L, L11=S.L11;
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...html.matchAll(/<script src="([^"?]+)\?v=([^"]+)"/g)].map(m=>m[1]), ia=sc.indexOf('src/aa625_3d.js');
    check('0. index.html：aa625_3d.js（?v=9.10.22）緊接在 aa614_3d.js 後面，在 invites3d、studyn3d、phone3d、outings3d、story3d、heroine_asks3d 之後',ia>0&&html.includes('<script src="src/aa625_3d.js?v=9.10.22"></script>')&&sc[ia-1]==='src/aa614_3d.js'&&['src/invites3d.js','src/studyn3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/heroine_asks3d.js','src/ytjob3d.js','src/classes3d.js'].every(f=>sc.indexOf(f)>=0&&sc.indexOf(f)<ia),J(sc.slice(ia-2,ia+2))); }
  { let W=null; try{ W=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')); }catch(e){}
    const e=W&&W.files&&W.files.filter(x=>x.path===DOC625), e11=W&&W.files&&W.files.filter(x=>x.path===DOC11);
    check('0. 劇情匯入白名單：AA_625 只有一列、0787572c6、approved、AA（D109）、note 寫 AA624-YT-BACKGROUND-1103；舊的 65a1b2fe9 在 history',!!e&&e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&/AA/.test(e[0].approvedBy)&&/D109/.test(e[0].approvedBy)&&e[0].kind==='text'&&e[0].note.includes('AA624-YT-BACKGROUND-1103')&&(e[0].history||[]).some(h=>h.sha==='65a1b2fe9'),J(e));
    check('0. 劇情匯入白名單：AA_11 一列（0787572c6、approved、AA（D109）、AA624-YT-BACKGROUND-1103）',!!e11&&e11.length===1&&e11[0].sha===SHA&&e11[0].status==='approved'&&e11[0].approvedBy==='AA（D109）'&&e11[0].task==='AA624-YT-BACKGROUND-1103'&&e11[0].kind==='text',J(e11));
    check('0. 0787572c6 和 AA_625 的上一版 65a1b2fe9 在這兩段一樣（第 17 節 FB→社群 以外）',(()=>{ const o=git('65a1b2fe9',DOC625), cut=s=>s.slice(s.indexOf('## 語彤約一起念書'),s.indexOf('## 茶屋平常的班'))+s.slice(s.indexOf('## 15 一盞茶屋十週年'),s.indexOf('## 15b')); return !!o&&cut(o)===cut(doc); })()); }
  /* 每一句都在稿裡 */
  { const nm={[YT]:'語彤','蘇姨':'蘇姨'};
    const yt=t=>doc.includes('語彤：「'+t+'」'), nar=t=>/^（.*）$/.test(t)&&doc.includes(t);
    check('0. 第一次三句：「語彤：「…」」照稿、順序照稿',L.first.every(yt)&&doc.indexOf(L.first[0])<doc.indexOf(L.first[1])&&doc.indexOf(L.first[1])<doc.indexOf(L.first[2]),J(L.first.filter(t=>!yt(t))));
    check('0. 選項「好。」／「這週不行。」、「嗯。下次。」、她多一句照稿',doc.includes('  - 「'+L.firstOpts[0]+'」→ 那天 14:00 木曜日')&&doc.includes('  - 「'+L.firstOpts[1]+'」→ 語彤：「'+L.firstNo+'」')&&doc.includes('她多一句：「'+L.firstExtra+'」'));
    check('0. 之後的約四則照稿（刑總那一則標「考試週」）',L.next.length===4&&L.next.every(t=>doc.includes('  - 「'+t+'」'))&&doc.includes('「'+L.next[2]+'」（考試週）'),J(L.next.filter(t=>!doc.includes(t))));
    const dl=L.during, flat=dl.map(g=>g.map(([w,t])=>w===YT?'語彤：「'+t+'」':t).join(''));
    check('0. 念的時候四則：照稿（她一句＋旁白、旁白、她一句、旁白），說的人照稿',dl.length===4&&flat.every(t=>doc.includes('  - '+t+'\n'))&&dl.every(g=>g.every(([w,t])=>(w===YT&&!/^（/.test(t))||(w===null&&/^（.*）$/.test(t)))),J(flat.filter(t=>!doc.includes(t))));
    const tl=L.tea10.map(([w,t])=>w==null?t:(nm[w]||w)+'：'+t.replace('{name}','祐廷'));
    check('0. 十週年四句＋開頭旁白：照稿、順序照稿（「還有你（祐廷）」的祐廷＝{name}）',tl.every(t=>doc.includes(t+'\n'))&&tl.every((t,i)=>i===0||doc.indexOf(t)>doc.indexOf(tl[i-1]))&&L.tea10[4][1].includes('（{name}）'),J(tl.filter(t=>!doc.includes(t))));
    check('0. 雨天的回聲「這次我有帶兩把。」照稿',doc.includes('語彤遞給你一把傘：「'+L.rain+'」'));
    check('0. AA_11 事件 15：和別人交往中「兩把。你們自己分。」、交往版旁白＋兩句照稿',doc11.includes('：「'+L11.other+'」')&&doc11.includes('  > '+L11.rainOpen+'\n')&&L11.dt.every(t=>doc11.includes('  > 語彤：'+t+'\n')));
    check('0. 模組裡語彤說的、旁白、蘇姨說的都在這兩份稿裡（沒有自己寫的句子）',(()=>{ const all=[...L.first,...L.firstOpts,L.firstNo,L.firstExtra,...L.next,...dl.flat().map(x=>x[1]),...L.tea10.map(x=>x[1].replace('{name}','祐廷')),L.rain,L11.other,L11.rainOpen,...L11.dt]; return all.every(t=>doc.includes(t)||doc11.includes(t)); })()); }

  const w3=TD('Y1S2',3,3), tue3=w3-1, mon3=w3-2;
  /* ================= 1 第一次 ================= */
  { fresh(TD('Y1S2',2,1),10); runAt(TD('Y1S2',2,4),22); check('1. 大一下第 2 週：還沒約',!byTag(S.FIRST_TAG).length&&!PHONE.sent(H.G,S.FIRST_TAG));
    runAt(mon3,10); check('1. 第 3 週週一：還沒排',!PHONE.sent(H.G,S.FIRST_TAG)&&key(w3)==='2026-03-11'&&wd(w3)===3);
    runAt(tue3,10); check('1. 第 3 週週二：排好、還沒傳（21:40 才傳）、聯絡方式那時候才加',PHONE.sent(H.G,S.FIRST_TAG)&&!byTag(S.FIRST_TAG).length&&!INV.hasContact(H.G,YT));
    runAt(tue3,21.5); check('1. 週二 21:30 還沒',!byTag(S.FIRST_TAG).length);
    runAt(tue3,21+41/60); const M=byTag(S.FIRST_TAG);
    check('1. 週二 21:40 私訊三句、語彤的私訊串',J(M.map(m=>m.text))===J(L.first)&&M.every(m=>m.th==='p:'+YT&&m.from===YT&&m.day===tue3),J(M.map(m=>[m.text,m.th,m.day])));
    const q=M[2]&&M[2].ask; check('1. 最後一句掛「好。」／「這週不行。」，期限週三 13:30',!!q&&J(q.opts.map(o=>o.t))===J(L.firstOpts)&&q.until===T(w3,13.5),J(q));
    check('1. 有她的聯絡方式（一起在茶屋上班）',INV.hasContact(H.G,YT));
    at(tue3,22); const r=PHONE.answer(H.G,S.FIRST_TAG,0); const iv=ytOffers()[0];
    check('1. 「好。」＝當週週三 14:00 木曜日、她約的、念書、第一次',!!r&&!!iv&&iv.place==='mokuyobi'&&iv.day===w3&&iv.h===14&&iv.state==='accepted'&&iv.by==='npc'&&iv.cat==='study'&&!!iv.yts.first,J(iv));
    check('1. 存檔：YTSTUDY.first yes、fday 週三',H.G.flags.YTSTUDY.first==='yes'&&H.G.flags.YTSTUDY.fday===w3,J(H.G.flags.YTSTUDY)); }
  { fresh(mon3,10); runAt(tue3,22); PHONE.answer(H.G,S.FIRST_TAG,1); const th=(H.G.msgs||[]).filter(m=>m.th==='p:'+YT).map(m=>m.text);
    check('1. 「這週不行。」＝她回「嗯。下次。」、沒有約、記 no',th.slice(-2).join('|')===L.firstOpts[1]+'|'+L.firstNo&&!ytOffers().length&&H.G.flags.YTSTUDY.first==='no',J(th.slice(-3))); }
  { fresh(mon3,10); runAt(tue3,22); runAt(w3,13.6); check('1. 沒回、過了週三 13:30＝當成不行（late）、不能再回',H.G.flags.YTSTUDY.first==='late'&&PHONE.answer(H.G,S.FIRST_TAG,0)===null&&!ytOffers().length); }
  { fresh(mon3,10,'dorm',{YT_MET_JOB:false}); runAt(tue3,22); check('1. 還沒在茶屋認識她（YT_MET_JOB）＝沒有這一則',!PHONE.sent(H.G,S.FIRST_TAG)&&!byTag(S.FIRST_TAG).length);
    H.G.flags.YT_MET_JOB=true; runAt(TD('Y1S2',5,1),10); runAt(TD('Y1S2',5,2),22); const M=byTag(S.FIRST_TAG);
    check('1. 第 4 週才認識：下一個可以的週三照第一次約（第 5 週週二 21:40 傳）',M.length===3&&M[0].day===TD('Y1S2',5,2)&&H.G.flags.YTSTUDY.fday===TD('Y1S2',5,3),J(M.map(m=>m.day))); }
  { fresh(TD('Y2S1',3,1),10); runAt(TD('Y2S1',3,2),22); check('1. 大一下都沒認識、大二上才開始：沒有第一次（skip），之後的約照常',H.G.flags.YTSTUDY&&H.G.flags.YTSTUDY.first==='skip'&&!byTag(S.FIRST_TAG).length,J(H.G.flags.YTSTUDY)); }

  /* ================= 2 見面（木曜日）================= */
  { fresh(mon3,10); runAt(tue3,22); PHONE.answer(H.G,S.FIRST_TAG,0); const iv=ytOffers()[0]; at(w3,14); H.G.zone='wz_mokuyobi'; const n=npcOf(YT); H.said=[]; const st0=H.G.stats.study, R0=STUDYN.count(H.G,YT);
    await INV.meet(GM,iv,n,{}); const got=said(), S1=STUDY_SCENES.people[YT].scenes['1'];
    const ia=got.indexOf(MOKS.S_meet||'（語彤坐在窗邊那桌，已經點好了。）'), ib=got.indexOf(MOKS.DATE[YT].first), ic=got.indexOf(S1.seat[0]), id=got.indexOf(L.firstExtra), ie=got.indexOf(L.during[0][0][1]), ig=got.indexOf(L.during[0][1][1]), ih=got.indexOf(MOKS.L.narr[0]), ii=got.indexOf(S1.bye[0]);
    check('2. 第一次（木曜日）：進門旁白、她第一次來木曜日那一句 → 一起念書第 1 場坐下 → 她多一句 → 念的時候第一則（她一句＋旁白）→ 讀完木曜日那一句旁白 → 收書、道別',ia>=0&&ib>ia&&ic>ib&&id>ic&&ie>id&&ig===ie+1&&ih>ig&&ii>ih,J(got));
    check('2. 「我只是週末打工。平常其實很閒。」是她說的、只有一次',H.said.filter(s=>s.t===L.firstExtra).length===1&&/語彤$/.test(H.said.find(s=>s.t===L.firstExtra).who),J(H.said.filter(s=>s.t===L.firstExtra)));
    check('2. 念的時候那一則旁白不是她說的',H.said.find(s=>s.t===L.during[0][1][1]).who===null);
    check('2. 讀書照算（時數 +1、一起念書第 N 場 +1）、她的記憶「一起去木曜日」',H.G.stats.study===st0+1&&STUDYN.count(H.G,YT)===R0+1&&SOCIAL.has(YT,'MOKUYOBI_TOGETHER'),J({st:H.G.stats.study,n:STUDYN.count(H.G,YT)}));
    check('2. 輪到念的時候第二則',H.G.flags.YTSTUDY.dur===1); }
  { /* 一起念書第 N 場還沒到（階段不夠＝一般句）：讀書照算、念的時候那一則照演 */
    fresh(mon3,10); const DS=DATE.stageNum; DATE.stageNum=id=>id===YT?0:DS(id); STUDYN.of(H.G,YT).k=2;
    runAt(tue3,22); PHONE.answer(H.G,S.FIRST_TAG,0); const iv=ytOffers()[0]; at(w3,14); H.G.zone='wz_mokuyobi'; const n=npcOf(YT); H.said=[]; H.G.flags.YTSTUDY.dur=2;
    await INV.meet(GM,iv,n,{}); DATE.stageNum=DS; const got=said();
    check('2. 第 N 場還沒到（一般句）：讀書照算 1 小時、念的時候第三則、讀完那一句旁白',H.G.stats.study===1&&got.includes(L.during[2][0][1])&&got.includes(L.firstExtra)&&MOKS.L.narr.some(t=>got.includes(t)),J(got)); }

  /* ================= 3 之後的約 ================= */
  const simTerm=async(d0,d1,o)=>{ o=o||{}; const out=[]; for(let d=d0;d<=d1;d++){ for(const h of [8,12,14.5,15,16,17,17.25,18,19,21,22]){ runAt(d,h);
        for(const iv of ytOffers()) if(iv.state==='offered'&&!iv._seen){ iv._seen=1; const m=(H.G.msgs||[]).find(x=>x.iv===iv.id); out.push({iv,text:m&&m.text,mday:m&&m.day,mh:m&&m.h}); INV.answer(H.G,iv.id,o.ans||'no'); } } }
    return out; };
  { fresh(mon3,10); runAt(tue3,22); PHONE.answer(H.G,S.FIRST_TAG,1);
    const end=TD('Y1S2',16,7), got=await simTerm(tue3,end);
    const days=got.map(x=>x.iv.day), wk=d=>CALENDAR.termOf(d).week;
    check('3. 大一下（第一次之後）：之後的約 '+got.length+' 次',got.length>=6&&got.length<=9,J(days.map(key)));
    check('3. 都是平日（週一～五）、下午或晚上（15:30／17:30／19:00）、她約的、念書',got.every(x=>wd(x.iv.day)>=1&&wd(x.iv.day)<=5&&[15.5,17.5,19].includes(x.iv.h)&&x.iv.by==='npc'&&x.iv.cat==='study'),J(got.map(x=>[key(x.iv.day),wd(x.iv.day),x.iv.h])));
    const gaps=days.slice(1).map((d,i)=>[d-days[i],wk(d)]);
    const crimI=got.findIndex(x=>x.text===L.next[2]);
    check('3. 大約兩週一次（12～16 天輪流）；考試前兩週和考試週（第 14～16 週）每週一次（刑總那一則照考試日）',gaps.every(([g,w],i)=>(g>=12&&g<=17)||(w>=14&&(g>=7||i+1===crimI)))&&gaps.some(([g,w])=>w>=14&&g<12)&&days[0]-w3>=12,J(gaps));
    check('3. 不會每次都同一天、同一個時間',new Set(got.map(x=>wd(x.iv.day))).size>=3&&new Set(got.map(x=>x.iv.h)).size>=2,J(got.map(x=>[wd(x.iv.day),x.iv.h])));
    check('3. 地點：交往前只有木曜日、2:30 AM、大口漢堡',got.every(x=>['mokuyobi','cafe','xs_dakou'].includes(x.iv.place)),J(got.map(x=>x.iv.place)));
    const ks=got.map(x=>L.next.indexOf(x.text));
    check('3. 私訊是那四則之一、傳在她的私訊串（輪流：債總 → 兩點半 → 不用排班 …）',ks.every(k=>k>=0)&&J(ks.filter(k=>k!==2).slice(0,4))===J([0,1,3,0]),J(ks));
    const c=got.find(x=>x.text===L.next[2]); const ex=CLS.examList(H.G,'Y1S2').find(e=>e.c.id==='crim_gen2');
    check('3. 「明天考刑總…」：只有一次、刑總期末考前一天（6/9 週二）17:00 傳、19:00 大口漢堡',!!c&&got.filter(x=>x.text===L.next[2]).length===1&&!!ex&&c.iv.day===ex.day-1&&c.mday===ex.day-1&&c.mh===17&&c.iv.h===19&&c.iv.place==='xs_dakou'&&wk(c.iv.day)===16,J(c&&{d:key(c.iv.day),m:[c.mday,c.mh],ex:ex&&key(ex.day)}));
    check('3. 大口漢堡只出現在刑總那一則',got.filter(x=>x.iv.place==='xs_dakou').every(x=>x.text===L.next[2]));
    const tp=got.find(x=>x.text===L.next[1]); check('3. 「兩點半還有位子…」＝當天、約的時間前 30 分鐘傳、2:30 AM',!!tp&&tp.iv.place==='cafe'&&tp.mday===tp.iv.day&&Math.abs(tp.mh-(tp.iv.h-0.5))<0.02,J(tp&&{d:tp.iv.day,m:[tp.mday,tp.mh],h:tp.iv.h}));
    const nb=got.filter(x=>x.text===L.next[0]||x.text===L.next[3]); check('3. 「債總…」「不用排班…」＝前一天 21:40 傳、約隔天',nb.length>=2&&nb.every(x=>x.mday===x.iv.day-1&&Math.abs(x.mh-(21+40/60))<0.02),J(nb.map(x=>[x.mday,x.mh,x.iv.day])));
    check('3. 拒絕不扣分：之後照樣約（每一次都回「不了」）',got.length>=6);
    /* 寒暑假、週末不約 */
    const v=await simTerm(end+1,TD('Y2S1',1,1)-1); check('3. 暑假不約',!v.length,J(v.map(x=>key(x.iv.day)))); }
  { fresh(TD('Y1S2',6,1),10); H.G.flags.YTSTUDY={first:'no',fday:w3,last:w3,rot:0,dur:0}; runAt(TD('Y1S2',6,1),10); runAt(TD('Y1S2',6,2),21+41/60); const iv=ytOffers()[0];
    check('3. 改天：不打開「自己選時間」（noFlow）、不扣分',!!iv&&J(INV.answer(H.G,iv.id,'later'))===J({res:'later',noFlow:true}),J(iv&&INV.answer(H.G,iv.id,'later')));
    const r0=J(SOCIAL.rel(YT)); fresh(TD('Y1S2',6,1),10); H.G.flags.YTSTUDY={first:'no',fday:w3,last:w3,rot:0,dur:0}; runAt(TD('Y1S2',6,2),21+41/60); const iv2=ytOffers()[0]; INV.answer(H.G,iv2.id,'no');
    check('3. 不了：關係不變',J(SOCIAL.rel(YT))===r0); }
  { fresh(TD('Y1S2',6,1),10); H.G.flags.YTSTUDY={first:'no',fday:w3,last:w3,rot:0,dur:0}; runAt(TD('Y1S2',6,2),21+41/60); const iv=ytOffers()[0]; INV.answer(H.G,iv.id,'yes');
    at(iv.day,iv.h); H.G.zone=iv.zone; const n=npcOf(YT); H.said=[]; H.G.flags.YTSTUDY.dur=1; await INV.meet(GM,iv,n,{}); const got=said();
    check('3. 答應以後見面：念的時候第二則（旁白）、沒有「我只是週末打工」那一句（只有第一次）',got.includes(L.during[1][0][1])&&!got.includes(L.firstExtra)&&H.G.stats.study>=1,J(got)); }
  { /* 美國路線：在國外的那一學期不約 */
    fresh(TD('Y4S1',3,1),10,'dorm',{EXCHANGE_ROUTE:'US',EXCH_RULE:1}); H.G.flags.YTSTUDY={first:'skip',rot:0,dur:0}; const got=await simTerm(TD('Y4S1',3,1),TD('Y4S1',6,7));
    check('3. 美國路線（大四上在國外）：不約',!got.length&&!!STORY.abroad(H.G),J(got.map(x=>key(x.iv.day)))); }
  { /* 她自己的刑總（大三上，雙主修修刑法總則（一））：前一天也是那一則 */
    fresh(TD('Y3S1',13,1),10); H.G.flags.YTSTUDY={first:'skip',rot:0,dur:0,last:TD('Y3S1',13,3)}; const got=await simTerm(TD('Y3S1',13,1),TD('Y3S1',16,5)); const c=got.find(x=>x.text===L.next[2]);
    const cx=CLS.examDay(H.G,CLS.byId('crim_gen1'),'Y3S1','final');
    check('3. 大三上（她修刑法總則（一））：她的刑總期末考前一天「明天考刑總…」',!!c&&!!cx&&c.iv.day===cx.day-1&&c.iv.place==='xs_dakou',J({c:c&&key(c.iv.day),ex:cx&&key(cx.day),all:got.map(x=>[key(x.iv.day),L.next.indexOf(x.text)])})); }

  /* ================= 4 一般的約念書 ================= */
  { const id='heroine_01'; fresh(TD('Y1S2',6,3),14); H.G.zone='wz_mokuyobi'; H.FRIEND(id); H.said=[]; const S1=STUDY_SCENES.people[id].scenes['1'];
    const iv=INV.accept(H.G,id,'mokuyobi',H.G.day,14,{by:'player',cat:'study'}); const n=npcOf(id); await INV.meet(GM,iv,n,{}); const got=said();
    check('4. 以安在木曜日約念書（念書那一類）：先進門那一段，再演一起念書第 1 場（坐下、中途、收書、道別），讀書照算',got.includes(MOKS.DATE[id].first)&&got.indexOf(S1.seat[0])>got.indexOf(MOKS.DATE[id].first)&&got.includes(S1.mid[0])&&got.includes(S1.bye[0])&&STUDYN.count(H.G,id)===1&&H.G.stats.study===1,J(got));
    check('4. 別人的見面不演語彤的句子',!L.during.flat().some(([w,t])=>got.includes(t))&&!got.includes(L.firstExtra)); }
  { const id='heroine_01'; fresh(TD('Y1S2',6,3),14); H.G.zone='wz_mokuyobi'; H.FRIEND(id); H.said=[];
    const iv=INV.accept(H.G,id,'mokuyobi',H.G.day,14,{by:'player'}); const n=npcOf(id); await INV.meet(GM,iv,n,{}); const got=said(), S1=STUDY_SCENES.people[id].scenes['1'];
    check('4. 對照：在木曜日喝咖啡那一類：照舊（只有進門那一段，沒有念書的戲、不算次數）',got.includes(MOKS.DATE[id].first)&&!got.includes(S1.seat[0])&&STUDYN.count(H.G,id)===0,J(got)); }

  /* ================= 5 十週年 ================= */
  const d10=D(S.TEA10_DAY), ev=STORY_EVENTS.find(e=>e.id===S.TEA10_EVID);
  check('5. 2028-12-16 是週六、大四上、十二月',wd(d10)===6&&CALENDAR.termOf(d10).id==='Y4S1'&&key(d10)==='2028-12-16');
  check('5. 事件登錄（出遊、一盞茶屋的背景 wenzhou_teahouse 有圖）',!!ev&&ev.trigger==='outing'&&ev.dialogue[0].bg==='wenzhou_teahouse'&&!!OUT.BG.wenzhou_teahouse&&!!OUT.BG.wenzhou_teahouse.image&&fs.existsSync(path.join(H.ROOT,OUT.BG.wenzhou_teahouse.image)));
  check('5. 沒有出 CG（茶屋的 CG 還沒有；cg_anniversary_23 的圖是麵店）',!!ev&&!ev.dialogue.some(l=>l.cg!==undefined)&&S.TEA10_CG===null);
  { fresh(d10-6,12); runAt(d10-6,12); check('5. 12/10 還沒排',!OUT.get(H.G,S.TEA10_ID));
    runAt(d10-5,9); const q=OUT.get(H.G,S.TEA10_ID); check('5. 12/11 起排進行程：12/16 19:00 一盞茶屋十週年',!!q&&q.day===d10&&q.h===19&&q.ev===S.TEA10_EVID&&q.place==='一盞茶屋'&&q.title==='一盞茶屋十週年',J(q));
    at(d10,19.9); const ms=OUT.expire(H.G); for(const x of ms) OUT.onMissed(GM,x); check('5. 沒去（過了 19:45）＝missed、不記記憶',H.G.flags.YT_TEA10==='missed'&&!SOCIAL.has(YT,'ANNIVERSARY_23')); }
  { fresh(d10-5,12,'dorm',{YT_MET_JOB:false}); runAt(d10-5,12); runAt(d10,12); check('5. 沒在茶屋認識她：沒有這一場',!OUT.get(H.G,S.TEA10_ID)); }
  const runEv=async(fl,setup)=>{ fresh(d10,19,'dorm',fl); H.G.weather='clear'; if(setup) setup(); H.said=[]; await EVENTS.run(ev); return H.lines().map(t=>t.replace(/^陳語彤：/,'語彤：')); };   /* 說的人：語彤（顯示的名字照關係，全名或短名）*/
  { const got=await runEv(); const nm={'蘇姨':'蘇姨'};
    const want=[L.tea10[0][1],'蘇姨：'+L.tea10[1][1],'蘇姨：'+L.tea10[2][1],'語彤：'+L.tea10[3][1],'蘇姨：'+L.tea10[4][1].replace('{name}','祐廷'),L11.rainOpen,'語彤：'+L.rain];
    check('5. 一般：四句照稿 → 散場下雨 → 「這次我有帶兩把。」',J(got)===J(want),J(got));
    check('5. 散場那一刻下雨、記 ANNIVERSARY_23（在場）、YT_TEA10 there',H.G.weather==='rain'&&SOCIAL.has(YT,'ANNIVERSARY_23')&&H.G.flags.YT_TEA10==='there'); }
  { const got=await runEv({},()=>{ H.G.name='宥辰'; }); check('5. 「還有你（{name}）」照玩家的名字',got.includes('蘇姨：還有你（宥辰）。第一天把杯子洗破兩個。'),J(got)); }
  { const got=await runEv({dating_heroine_01:true}); check('5. 和別人交往中：「兩把。你們自己分。」，沒有「這次我有帶兩把。」',got.includes('語彤：'+L11.other)&&!got.includes('語彤：'+L.rain)&&got.includes(L11.rainOpen),J(got.slice(-3))); }
  { const got=await runEv({dating_heroine_03:true},()=>{ H.FRIEND(ZHE); }); check('5. 和她交往中：AA_11 交往版（給阿哲那一把、這把是我們的），沒有另外兩句',J(got.slice(-3))===J([L11.rainOpen,'語彤：'+L11.dt[0],'語彤：'+L11.dt[1]]),J(got.slice(-3))); }
  { const got=await runEv({dating_heroine_03:true,dating_heroine_01:true},()=>{ H.FRIEND(ZHE); }); check('5. 同時和她、別人交往：照和她交往的版本',got.includes('語彤：'+L11.dt[1])&&!got.includes('語彤：'+L11.other),J(got.slice(-3))); }
  { fresh(d10,19); H.G.weather='typhoon'; H.said=[]; await EVENTS.run(ev); check('5. 颱風天不改天氣',H.G.weather==='typhoon'); }
  { /* 美國路線：遠端版 */
    fresh(d10-5,12,'dorm',{EXCHANGE_ROUTE:'US',EXCH_RULE:1}); INV.addContact(H.G,YT); runAt(d10-5,12); check('5. 美國路線：不排出遊',!OUT.get(H.G,S.TEA10_ID)&&STORY.abroad(Object.assign({},H.G,{day:d10})));
    const lh=19.5+STORY.tzOffset(H.G,d10); runAt(d10,lh-0.2); check('5. 美國路線：臺灣 19:30 以前還沒有',!byTag('yt_tea10_photo').length&&H.G.flags.YT_TEA10==null);
    runAt(d10,lh+0.1); const M=byTag('yt_tea10_photo');
    check('5. 美國路線：臺灣 19:30（當地 '+lh+'）語彤私訊一張照片、記 ANNIVERSARY_23「聽說」、YT_TEA10 remote',M.length===1&&M[0].text===S.PHOTO&&M[0].th==='p:'+YT&&M[0].from===YT&&SOCIAL.memories(YT).some(m=>m.tag==='ANNIVERSARY_23'&&m.note==='聽說')&&H.G.flags.YT_TEA10==='remote',J(M)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
