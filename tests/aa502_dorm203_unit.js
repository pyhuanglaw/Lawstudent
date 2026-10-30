// AA_502 203 室友日常（DORM203-MATES-1028 第二部分；USER_WANTS X123；使用者 2026-10-28 01:3x「203 四人宿舍，認識阿凱、阿哲、柏翰 但我室友根本只有阿凱 第一天之後」）——不需要瀏覽器。
//   稿：企劃線 claude/magical-albattani-bk7b4n d13ab3ab7 docs/story_planning/AA_502_203室友日常_阿哲_柏翰_阿凱.md（git show 對稿；拿不到＝第 0 項 FAIL）
//     （第一輪對 4071fdb9a；第二輪 d13ab3ab7＝AA-C 回 LAWWW-C 的 8 點，稿多了第 6 節「實作時定的」，3-2、3-5、3-6、第 4 節改名那一列改了）
//   0  新檔載得到；index.html：rom1016_3d.js → data/dorm203_lines.js → dorm203_3d.js → bbpack_events.js；
//      遊戲裡的每一句（旁白、台詞、選項、群組訊息）都在稿裡、一字不差、說話的人對；反過來，稿第 1～4 節的每一句遊戲裡都有
//   1  作息（第 1 節，STORY.dormWho／r203Plan）：平日 07:00 柏翰在、07:30 不在；阿哲 08:35 在、08:45 不在；週五 22:30 阿哲還沒回來、23:00 回來；
//      週六、週日、考試週（柏翰 00:30 回來、考前一晚 22:30、阿哲 21:00）、颱風天、阿凱第一節、洗衣間、阿哲週六晚上西門町、回老家、6/15 搬出 203、沒有 DORM_FOUR／大二照舊
//   2  待在房間：起床從自己的梯子下來（不說旁白）、開門進來說一句旁白（每人輪流、同一天不重複、阿凱一天一次）、跳時間直接坐好不說；照作息上床、出門
//   3  房間閒聊（第 2 節）：照順序一天一句新的、之後兩句輪流；解鎖條件（第 1～4 週、期中前後、期末前、認識阿凱、ZHE_CALLS_GE、沛珊和柏翰交往）；房間外照原本；阿凱三句、說完照原本
//   4  六件小事（第 3 節）：日子、時間、該在的人都在才演（走進來的等坐下）、玩家不在不演；選項記號；3-2 開演時鐘到 23:30；3-5 三個週六；3-6 四個人
//   5  稿第 5 節第 7 點的五項：冷氣選 25 → 一週一次的旁白；期中前一晚選檯燈 → 隔天那一句；宵夜選謝謝阿凱 → 阿凱換句；借襯衫 → 12/19 Alison 那一句；群組 9/1 三則、第 5 週改名
//   6  3-7 不在房間：隔天一句旁白（只有隔天）；3-1 結果照 25、3-5 也記 R203_SHIRT；他們自己不在＝什麼都沒有；3-6 不補
//   7  群組（第 4 節）：照日子、名稱、一週最多兩次、rt_ 不算手機上限；大二以後兩則
//   8  舊存檔（第 5 節第 6 點）：已經過了的週不補；群組在讀檔當天建立、以前的訊息不補；沒有 DORM_FOUR 什麼都沒有
//   9  第二輪（稿第 6 節，2026-10-28 AA-C 定）：3-2 柏翰「明天考試」；3-5 柏翰不在、阿哲自己答、借完就出門（22:00 回來）；3-6 暑假只剩祐廷和阿凱的新旁白、阿凱那句、膠帶放進抽屜；
//      暑假 203 只剩阿凱、9/6 才搬；群組 6/15 不改名、9/6 21:00 改「203（舊生）」（第一輪 6/15 就改過的存檔不再改）；ev_dorm_late_kai 23:30 以後、四人房那一行照誰在床上；
//      ev_kai_late_screen 台詞不動、演的那一晚阿凱到 03:30（演之前今晚會演＝也到 03:30；演過以後只有那一晚）；手機朋友頁的阿凱照新作息（週二、四到 08:00，其他天到 10:30、上舖寫睡覺）
//   10 （HEROINE-LIFE-1028 第三輪，AA_502 第 6 節第 9 點，企劃線 795fbecfd）2-3 阿凱「上次宵夜……」那一句只看 3-3 宵夜那晚有沒有算到他（R203_SUPPER_KAI），
//      不看 KAI_COUNTED（AA_503 7-2 練習賽也會記）；舊存檔沒有這個記號：KAI_COUNTED 而且不是練習賽「他沒講。」的才算——第 5 段 ③b 四項
//      第三輪修改前（開發分支 5df39fd7d 的 src、index.html 實際跑過）：FAILED 3（③b 練習賽＋（吃）、練習賽＋肩膀濕了〔沒有 R203_SUPPER_KAI〕、舊存檔練習賽記的；
//      只有 KAI_COUNTED 的舊存檔本來就是換的那句）。修改後 ALL PASS
// 第一輪修改前（開發分支 2de1047e1：把第一輪的這個檔放進那一版的程式跑過，AA502_GIT_DIR 指到這個 repo 對稿 4071fdb9a）：FAILED 37、PASS 18、結束碼 1——
//   第 0 項新檔、index.html、對稿（兩個方向）3 項 FAIL；
//   第 1 項作息 13 項 FAIL（平日 07:00 柏翰、06:45 起床、08:35 阿哲、週五 22:30 阿哲、平日 02:00 阿凱上床、阿凱第一節、週六、週日、考試週兩項、颱風天、寒假、鑰匙那天）；
//   第 4 項六件小事「該演」的 9 項 FAIL（事件不存在）；第 2、3、4、5、6、7、8 項接著因為沒有 DORM203 丟例外。
//   舊程式剛好也對的 18 項：拿得到稿；週六 19～22 阿哲不在、考完那晚 21:30 阿哲不在、6/14 四個人在與 6/15 只剩阿凱、沒有 DORM_FOUR、大二 312；第 4 項「不演」的 12 項（事件不存在）。
// 第二輪修改前（開發分支 a57127ab4＝第一輪的程式：把這個檔放進那一版跑過，AA502_GIT_DIR 指到這個 repo 對稿 d13ab3ab7）：FAILED 25、PASS 136、結束碼 1——
//   第 0 項對稿兩個方向 2 項 FAIL（3-2、3-5、3-6 的舊句子不在新稿；新稿的句子遊戲裡沒有）；
//   第 4 項 3-5「去哪？」1 項、第 7 項 6/15 不改名、大一一整年 18 則 2 項 FAIL（照新稿改了的第一輪測試：柏翰「（沒有抬頭）會。」拿掉、「203（舊生）」改到大二 9/6，稿第 6 節第 1、7 點）；
//   第 9 項 20 項 FAIL：3-2 柏翰、3-5 柏翰不在、借完出門兩項、球衣也出門、3-6 新稿、群組 6/15 與 9/6 兩項、ev_dorm_late_kai 23:30、四人房那一行五項、阿凱 03:30 三項、朋友頁三項；
//   第 9 項舊程式也對的 9 項（回歸）：3-5 演之前阿哲在、沒演照作息、暑假只剩阿凱、第一輪改過名的存檔、ev_kai_late_screen 台詞、找得到會演的晚上、演過以後別的晚上 02:00、週五 02:00、洗衣間／寒假／沒有 DORM_FOUR。
// 修改後：ALL PASS（161 項）
// 用法：node tests/aa502_dorm203_unit.js（對稿要 git 拿得到 d13ab3ab7；在別的資料夾跑舊版：AA502_GIT_DIR=<有這個 commit 的 repo>）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=(f,n)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
let ok=false, err='';
try{ load('src/data/dorm_room_layout.js','DORM_ROOM'); }catch(e){ err+=String(e); }
try{ ok=load('src/data/dorm203_lines.js','DORM203_LINES')&&load('src/dorm203_3d.js','DORM203'); }catch(e){ err+=' '+String(e); }
const X=()=>typeof DORM203!=='undefined'?DORM203:null, LL=()=>typeof DORM203_LINES!=='undefined'?DORM203_LINES:null;
let DOC='';
try{ DOC=cp.execSync('git show 7ad5fee84:"docs/story_planning/AA_502_203室友日常_阿哲_柏翰_阿凱.md"',{cwd:process.env.AA502_GIT_DIR||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ DOC=''; }
const NAME={kai:'阿凱',zhe:'阿哲',classmate_bohan:'柏翰',yu:'Alison'};
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. （丟例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
/* 假的生人物、坐下、走路（同 tests/dorm_mates_live_unit.js；E.moveTo 先記下來，測試決定走到了沒有）*/
let walks=[], caps=[];
const mkN=(id,x,z,o)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},pose:'idle',idlePose:'idle',lv:0,talk:o&&o.talk}; GM.npc[id]=n; E.npcs.push(n); if(o&&o.seat) GM.sitAt(n,o.seat); return n; };
GM.spawnNPC=(id,spec,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.spawnCharacter=(id,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs.splice(E.npcs.indexOf(n),1); delete GM.npc[id]; } };
GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; n.pose='sit'; };
GM.standUp=n=>{ n.seat=null; n.pose='idle'; };
GM.caption=(w,t)=>{ caps.push([w||'',t]); };
GM.say=async(who,t)=>{ H.said.push({who:who?(who.name||String(who)):null,id:who&&who.charId||null,t:String(t).replace('{name}',H.G&&H.G.name||'祐廷')}); };
E.canStand=()=>true; E.moveTo=(n,x,z,cb)=>{ walks.push({n,x,z,cb}); return true; };
STORY._bindGM(GM);
const U=id=>DORM_ROOM.units.find(q=>q.id===id);
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const F4={DORM_FOUR:true,introDone:true,MET_KAI:true,MET_ZHE:true};
const room=(k,h,flags,zone)=>{ const G=H.fresh(k,h,zone||'dorm',Object.assign({},F4,flags||{})); walks=[]; caps=[]; return G; };
const at=(k,h)=>{ const d=D(k); H.G.day=d; H.G.weekday=wdOf(d); H.G.hour=h; };
const who=()=>STORY.dormWho(H.G).map(w=>w[0]).sort();
const whoAt=(k,h,flags)=>{ room(k,h,flags); return who(); };
const live=h=>{ if(h!=null) H.G.hour=h; return STORY.dormLive(GM); };
const ids=()=>Object.keys(GM.npc).sort();
const arrive=n=>{ const w=walks.find(q=>q.n===n); if(w){ walks.splice(walks.indexOf(w),1); w.cb(); } return !!w; };
const seated=(id,u)=>{ const n=GM.npc[id], s=STORY.dormSeat(u); return !!n&&n.pose==='sit'&&!!n.seat&&Math.abs(n.seat.x-s.x)<1e-6&&Math.abs(n.seat.z-s.z)<1e-6; };
const EV=id=>STORY_EVENTS.find(e=>e.id===id);
const txt=()=>H.said.map(s=>s.t);
const has=t=>H.said.some(s=>s.t===t);
const tick=()=>{ const x=X(); return x&&x.tick?x.tick(GM):false; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:r203');
const sweep=(k0,h0,k1,h1,step)=>{ step=step||0.25; const a=D(k0)*24+h0, b=D(k1)*24+h1; for(let t=a;t<=b+1e-9;t+=step){ const d=Math.floor(t/24); H.G.day=d; H.G.weekday=wdOf(d); H.G.hour=+(t-d*24).toFixed(4); phone(); tick(); } };
const evCheck=(id)=>{ const e=EV(id); return !!e&&EVENTS.check(e); };
const runEv=async(id,picks)=>{ H.said=[]; H.picks=(picks||[]).slice(); await EVENTS.run(EV(id)); return txt(); };
const knowAll=()=>{ for(const id of ['kai','zhe','classmate_bohan']){ H.rel(id,20,10,10); SOCIAL.markUp(id,9); } };   /* 門檻台詞（relUp／playUp）都說過了：測的是房間閒聊 */

(async()=>{
  const L=LL();
  /* ================= 0 載入、index.html、對稿 ================= */
  await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=html.indexOf('src/rom1016_3d.js'), b=html.indexOf('src/data/dorm203_lines.js'), c=html.indexOf('src/dorm203_3d.js'), d=html.indexOf('src/data/bbpack_events.js');
    check('0. 新檔載得到（DORM203_LINES、DORM203）；index.html：rom1016_3d.js → data/dorm203_lines.js → dorm203_3d.js（兩個新檔相鄰）→ bbpack_events.js（順序；中間可以有別的新模組，例 heroine_asks；bbpack3d 緊接 GAME.boot 由 bbpack_unit 查）',ok&&!!X()&&!!L&&a>0&&b>a&&c>b&&d>c&&html.slice(b,c).split('<script').length===2,err); });
  await sec(0,()=>{ check('0. 拿得到稿（git show 7ad5fee84＝AA_528 第 3 節改字以後的版本；有第 6 節「實作時定的」）',DOC.length>1000&&DOC.indexOf('## 4. 203 群組')>0&&DOC.indexOf('## 6. 實作時定的')>0,'長度 '+DOC.length);
    if(!L||!DOC){ for(const n of ['0. 遊戲裡的每一句都在稿裡','0. 反過來：稿第 1～4 節的每一句遊戲裡都有']) check(n,false,!L?'沒有 DORM203_LINES':'拿不到稿'); return; }
    const bad=[], inDoc=t=>DOC.indexOf(t)>=0;
    /* 遊戲 → 稿：每一句都在稿裡；說話的人對（「名字：」接在前面，或在那個人的表裡）*/
    for(const id in L.walkIn) for(const t of L.walkIn[id]) if(!inDoc('- '+t)) bad.push('walkIn '+t);
    for(const id in L.room){ const sect=DOC.slice(DOC.indexOf('### 2-'+({zhe:1,classmate_bohan:2,kai:3})[id]),DOC.indexOf(id==='kai'?'## 3.':'### 2-'+({zhe:2,classmate_bohan:3})[id]));
      for(const r of L.room[id].rows) if((r.needFlag?DOC:sect).indexOf('「'+r.t+'」')<0) bad.push('room '+id+' '+r.t);   /* k2c（KAI_COUNTED 換的那句）在 3-3 */
      for(const a of (L.room[id].after||[])) if(sect.indexOf(a.speaker===null?a.text:'「'+a.text+'」')<0) bad.push('after '+id+' '+a.text); }
    const s3=DOC.slice(DOC.indexOf('## 3.'),DOC.indexOf('### 3-7'));
    for(const k in L.ev) for(const l of L.ev[k]){ if(l.text!==undefined){ const want=l.speaker===null?'> '+l.text:'> '+NAME[l.speaker]+'：'+l.text; if(s3.indexOf(want)<0) bad.push('ev '+k+' '+want); }
      if(l.choice) for(const c of l.choice) if(s3.indexOf('- '+c.text+'→')<0&&s3.indexOf('- '+c.text+' →')<0) bad.push('choice '+k+' '+c.text); }
    for(const k in L.acWeekly) if(!inDoc('`'+k+'`：'+L.acWeekly[k])) bad.push('acWeekly '+k);
    if(!inDoc('> 阿哲：'+L.acNewTerm)) bad.push('acNewTerm');
    for(const k in L.walkout) if(!inDoc('`'+k+'`：阿哲：'+L.walkout[k])) bad.push('walkout '+k);
    if(!inDoc('> Alison：'+L.shirtYu)) bad.push('shirtYu');
    const s37=DOC.slice(DOC.indexOf('### 3-7'),DOC.indexOf('## 4.')), M37={ac:'3-1',light:'3-2',supper:'3-3',gifts:'3-4',shirt:'3-5'};
    for(const k in L.miss) if(s37.indexOf('- '+M37[k]+'：'+L.miss[k])<0) bad.push('miss '+k);
    /* 第 4 節的每一則：表格「名字：a／b」、沒有「名字：」＝系統的一行（改名）、大二以後的引文「> 名字：a」 */
    const s4=DOC.slice(DOC.indexOf('## 4.'),DOC.indexOf('## 5.')), E4=[];
    for(const ln of s4.split('\n')){ const m=ln.match(/^\| ([^|]+) \| (.+) \|$/); if(m&&m[1]!=='時候'&&!/^-+$/.test(m[1])){ const cell=m[2].trim(), sp=cell.match(/^(阿凱|阿哲|柏翰)：(.+)$/); if(sp) for(const p of sp[2].split('／')) E4.push({sp:sp[1],t:p.trim()}); else E4.push({sp:null,t:cell}); }
      const b=ln.match(/^\s*> (阿凱|阿哲|柏翰)：(.+)$/); if(b) for(const p of b[2].split('／')) E4.push({sp:b[1],t:p.trim()}); }
    const GI=[]; for(const k in L.group){ const v=L.group[k]; for(const it of [].concat(Array.isArray(v)?v:(v&&v.text?[v]:[]))) GI.push(it); }
    for(const it of GI) if(!E4.some(e=>e.t===it.text&&e.sp===(it.from?NAME[it.from]:null))) bad.push('group '+(it.from||'')+' '+it.text);
    for(const n of [L.group.name,L.group.nameKey,L.group.nameOld]) if(!inDoc('「'+n+'」')) bad.push('group name '+n);
    check('0. 遊戲裡的每一句都在稿裡、一字不差、說話的人對（旁白照稿的（）、對話框寫說話的人時拿掉外層「」）',!bad.length,J(bad.slice(0,6)));
    /* 稿 → 遊戲：第 3 節每一句、每個選項；第 1 節走進來的旁白；第 2 節每一列；第 4 節每一則 */
    const all=[]; const pushEv=(l)=>{ if(l.text!==undefined) all.push((l.speaker?NAME[l.speaker]+'：':'')+l.text); if(l.choice) for(const c of l.choice) all.push('#'+c.text); };
    for(const k in L.ev) for(const l of L.ev[k]) pushEv(l);
    const miss=[];
    for(const ln of s3.split('\n')){ const m=ln.match(/^\s*> (.+)$/); if(m){ const t=m[1].trim(); if(/^（/.test(t)){ if(!all.includes(t)&&!Object.values(L.acWeekly).includes(t)) miss.push(t); } else { const q=t.match(/^(阿凱|阿哲|柏翰|Alison)：(.+)$/); if(!q) miss.push('?'+t); else if(!all.includes(q[1]+'：'+q[2])&&!(q[1]==='阿哲'&&q[2]===L.acNewTerm)&&!(q[1]==='Alison'&&q[2]===L.shirtYu)) miss.push(t); } }
      const c=ln.match(/^\s*- (「[^」]*」|（[^）]*）) ?→/); if(c&&!all.includes('#'+c[1])) miss.push('選項 '+c[1]); }
    const s1=DOC.slice(DOC.indexOf('## 1.'),DOC.indexOf('## 2.')); for(const ln of s1.split('\n')){ const m=ln.match(/^\s+- (（.+）)$/); if(m&&!Object.values(L.walkIn).some(A=>A.includes(m[1]))) miss.push('走進來 '+m[1]); }
    for(const id of ['zhe','classmate_bohan','kai']){ const n=({zhe:1,classmate_bohan:2,kai:3})[id], sect=DOC.slice(DOC.indexOf('### 2-'+n),DOC.indexOf(n===3?'## 3.':'### 2-'+(n+1)));
      for(const ln of sect.split('\n')){ const m=ln.match(/^\| ([^|]+) \| (.+) \|$/); if(!m||m[1]==='解鎖'||/^-+$/.test(m[1])) continue;
        for(const part of m[2].split('／')){ const p=part.trim(), q=p.match(/^「(.*)」/), t=q?q[1]:(p.match(/^（[^）]*）$/)?p:null); if(!t) continue;
          if(!L.room[id].rows.some(r=>r.t===t)&&!(L.room[id].after||[]).some(a=>a.text===t)) miss.push('房間 '+id+' '+t); } } }
    for(const e of E4) if(!GI.some(it=>it.text===e.t&&(it.from?NAME[it.from]:null)===e.sp)) miss.push('群組 '+(e.sp||'')+' '+e.t);
    if(E4.length<25) miss.push('第 4 節只讀到 '+E4.length+' 則');
    check('0. 反過來：稿第 1～4 節的每一句（走進來、房間、六件小事和選項、3-7、群組）遊戲裡都有',!miss.length,J(miss.slice(0,6))); });

  /* ================= 1 作息 ================= */
  await sec(1,()=>{
    const w=(k,h,f)=>J(whoAt(k,h,f));
    /* 2025-10-08 週三、10-09 週四（阿凱第一節有課：週二、週四）、10-10 週五、10-11 週六、10-12 週日（大一上第 6 週）*/
    check('1. 平日（週四 10/9）07:00 柏翰在書桌前、07:30 不在（07:20 出門）',w('2025-10-09',7).includes('classmate_bohan')&&!w('2025-10-09',7.5).includes('classmate_bohan'),w('2025-10-09',7)+' '+w('2025-10-09',7.5));
    check('1. 平日 06:30 柏翰還在上舖（看不到）；06:45 起床在書桌前',!w('2025-10-09',6.5).includes('classmate_bohan')&&w('2025-10-09',6.75).includes('classmate_bohan'));
    check('1. 阿哲 08:35 在、08:45 不在（08:30 起、08:40 衝出去）；08:25 還在上舖',w('2025-10-09',8+35/60).includes('zhe')&&!w('2025-10-09',8.75).includes('zhe')&&!w('2025-10-09',8+25/60).includes('zhe'));
    check('1. 週五（10/10）22:30 阿哲還沒回來、23:00 回來；柏翰 22:30 回來',!w('2025-10-10',22.5).includes('zhe')&&w('2025-10-10',23).includes('zhe')&&w('2025-10-10',22.5).includes('classmate_bohan'),w('2025-10-10',22.5)+' '+w('2025-10-10',23));
    check('1. 平日晚上：阿哲 22:00、柏翰 22:30 回來，23:30 以後都在上舖；阿凱 18:00～02:00',w('2025-10-08',22.1)===J(['kai','zhe'])&&w('2025-10-08',22.6)===J(['classmate_bohan','kai','zhe'])&&w('2025-10-08',23.6)===J(['kai'])&&w('2025-10-08',24+1.9)===J(['kai'])&&w('2025-10-08',24+2.1)===J([])&&w('2025-10-08',17.9)===J([]));
    check('1. 阿凱第一節有課（週四）07:00～08:00 在書桌前；沒有（週三）睡到 10:00、10:30 出門',w('2025-10-09',7.2).includes('kai')&&!w('2025-10-09',8.1).includes('kai')&&!w('2025-10-08',7.5).includes('kai')&&w('2025-10-08',10.2).includes('kai')&&!w('2025-10-08',10.6).includes('kai'));
    check('1. 週六（10/11）：柏翰 08:00 出門、22:30 回來；阿哲睡到 11:00、下午球場、17:00 回來；阿凱下午出門、晚上在',w('2025-10-11',7.9).includes('classmate_bohan')&&!w('2025-10-11',8.1).includes('classmate_bohan')&&!w('2025-10-11',10.9).includes('zhe')&&w('2025-10-11',11.2).includes('zhe')&&!w('2025-10-11',14).includes('zhe')&&w('2025-10-11',17.2).includes('zhe')&&w('2025-10-11',11).includes('kai')&&!w('2025-10-11',15).includes('kai')&&w('2025-10-11',18.2).includes('kai')&&w('2025-10-11',22.6).includes('classmate_bohan'));
    check('1. 週六 19:00～22:00 阿哲照作息在西門町（D04）＝不在房間，22:00 回來',!w('2025-10-11',20).includes('zhe')&&w('2025-10-11',22.1).includes('zhe'));
    check('1. 週日（10/12）：柏翰 13:00～17:00 在書桌前、22:30 回來；阿哲下午在房間（12～13 在 118 巷）、17:30 去麵店、22:00 回來；阿凱在（21～22 洗衣間）',
      w('2025-10-12',14).includes('classmate_bohan')&&!w('2025-10-12',17.5).includes('classmate_bohan')&&w('2025-10-12',14).includes('zhe')&&!w('2025-10-12',12.5).includes('zhe')&&!w('2025-10-12',18).includes('zhe')&&w('2025-10-12',22.1).includes('zhe')&&w('2025-10-12',15).includes('kai')&&!w('2025-10-12',21.5).includes('kai')&&w('2025-10-12',22.1).includes('kai'),w('2025-10-12',12.5)+' '+w('2025-10-12',21.5));
    /* 考試週：大一上期中 10/20（一）憲法、10/22（三）刑總、10/23（四）民總 */
    check('1. 考試週：10/20（隔天沒考、後面還有）柏翰 23:00 不在、00:30 回來、01:00 上床；阿哲 21:00 回來、00:00 上床',!w('2025-10-20',23).includes('classmate_bohan')&&w('2025-10-20',24.6).includes('classmate_bohan')&&!w('2025-10-20',25.1).includes('classmate_bohan')&&w('2025-10-20',21.1).includes('zhe')&&w('2025-10-20',23.8).includes('zhe')&&!w('2025-10-20',24.1).includes('zhe'));
    check('1. 考試週：考前一晚（10/22，隔天民總）柏翰照平常 22:30 回來（3-2）；考試週早上柏翰 06:00 起床',w('2025-10-22',23.2).includes('classmate_bohan')&&w('2025-10-22',6.2).includes('classmate_bohan')&&!w('2025-10-09',6.2).includes('classmate_bohan'));
    check('1. 考完了（10/23 晚上，後面沒有考試）照平常：阿哲 21:30 還沒回來',!w('2025-10-23',21.5).includes('zhe')&&w('2025-10-23',22.1).includes('zhe'));
    check('1. 颱風天（10/13 停課）大家整天在房間（颱風泡麵夜 18:00 三個都在）',w('2025-10-13',18.5)===J(['classmate_bohan','kai','zhe']));
    check('1. 寒假：12/25 三個都在；1/2 起阿哲回高雄、1/9 起柏翰回新竹（週四搭客運上來總圖也不住宿舍）、2/13～2/20 阿凱回宜蘭',w('2025-12-25',22.6)===J(['classmate_bohan','kai','zhe'])&&w('2026-01-05',22.6)===J(['classmate_bohan','kai'])&&w('2026-01-15',22.6)===J(['kai'])&&w('2026-02-15',22.6)===J([]));
    check('1. 6/14（大一下最後一天）23:00 四個人都在；6/15 搬出 203 以後只剩阿凱（照原本 18:00～08:00）',w('2026-06-14',23.1)===J(['classmate_bohan','kai','zhe'])&&w('2026-06-15',23.1)===J(['kai'])&&w('2026-06-16',7)===J(['kai']));
    check('1. 對照：沒有 DORM_FOUR（舊存檔、兩人房）照原本：阿凱 18:00～08:00',w('2025-10-09',7,{DORM_FOUR:false})===J(['kai'])&&w('2025-10-08',22.6,{DORM_FOUR:false})===J(['kai']));
    check('1. 對照：大二 312（ROOM_Y2）照原本：阿哲 22:00、柏翰 22:30',w('2026-10-07',22.75,{ROOM_Y2:D('2026-09-06')})===J(['classmate_bohan','zhe']));
    check('1. 阿哲忘記帶鑰匙那天（10/1，群組 22:10）22:11 阿凱開門才進來',!w('2025-10-01',22.1).includes('zhe')&&w('2025-10-01',22.2).includes('zhe')); });

  /* ================= 2 待在房間：起床、走進來、旁白 ================= */
  await sec(2,()=>{ const A=L.walkIn;
    room('2025-10-08',21.95); live(); live(22.01); const z=GM.npc.zhe, wz=walks.find(q=>q.n===z);
    check('2. 22:00 阿哲開門走進來（門口、往 L1 走），字幕一句旁白＝他的第一句',!!z&&Math.abs(z.obj.position.x)<0.1&&z.obj.position.z>=2.3&&!!wz&&J(caps)===J([['',A.zhe[0]]]),J(caps));
    arrive(z); live(22.51); const b=GM.npc.classmate_bohan; check('2. 22:30 柏翰走進來，旁白是柏翰的第一句',!!b&&J(caps.slice(1))===J([['',A.classmate_bohan[0]]]),J(caps));
    arrive(b); live(23.52); check('2. 23:30 阿哲、柏翰走到自己的梯子（上床）',walks.some(q=>q.n===z&&Math.abs(q.x-U('L1').sleep[0])<1e-6&&Math.abs(q.z-U('L1').sleep[1])<1e-6)&&walks.some(q=>q.n===b&&Math.abs(q.x-U('R1').sleep[0])<1e-6&&Math.abs(q.z-U('R1').sleep[1])<1e-6));
    for(const n of [z,b]) arrive(n); live(24+2.02); const k=GM.npc.kai, wk=walks.find(q=>q.n===k);
    check('2. 02:00 阿凱上床（走到 R2 的梯子）',!!wk&&Math.abs(wk.x-U('R2').sleep[0])<1e-6&&Math.abs(wk.z-U('R2').sleep[1])<1e-6,J(wk&&[wk.x,wk.z]));
    room('2025-10-09',6.6); live(); live(6.68); const b2=GM.npc.classmate_bohan, wb=walks.find(q=>q.n===b2);
    check('2. 06:40 柏翰起床：從自己的梯子下來、走到書桌，不說旁白',!!b2&&Math.abs(b2.obj.position.x-U('R1').sleep[0])<1e-6&&Math.abs(b2.obj.position.z-U('R1').sleep[1])<1e-6&&!!wb&&Math.abs(wb.x-U('R1').seat_approach[0])<1e-6&&caps.length===0,J(caps));
    arrive(b2); live(7.34); const wb2=walks.find(q=>q.n===b2); check('2. 07:20 柏翰出門（走向門口）',!!wb2&&wb2.z>2.5);
    room('2025-10-09',21); live(); live(23); check('2. 跳時間（21:00 → 23:00）：阿哲、柏翰直接坐好，不演走路、不說旁白',seated('zhe','L1')&&seated('classmate_bohan','R1')&&walks.length===0&&caps.length===0);
    room('2025-10-12',11.5); live(); live(12.02); const z3=GM.npc.zhe, wz3=walks.find(q=>q.n===z3); check('2. 週日 12:00 阿哲去 118 巷（作息表）：起身走向門口',!!wz3&&wz3.z>2.5);
    arrive(z3); live(13.02); check('2. 13:00 阿哲吃完回來、柏翰回來念書：都開門進來，各說自己的第一句',!!GM.npc.zhe&&!!GM.npc.classmate_bohan&&J(caps)===J([['',A.zhe[0]],['',A.classmate_bohan[0]]]),J(caps));
    arrive(GM.npc.zhe); arrive(GM.npc.classmate_bohan); live(17.52); arrive(GM.npc.zhe); live(22.02);
    check('2. 同一天晚上 22:00 阿哲再進來：輪到他的下一句（同一天不重複）',caps.length===3&&caps[2][1]===A.zhe[1],J(caps));
    room('2025-10-12',20.5); live(); live(21.02); const k2=GM.npc.kai, wk2=walks.find(q=>q.n===k2); check('2. 週日 21:00 阿凱去洗衣間（作息表）：起身走向門口',!!wk2&&wk2.z>2.5);
    arrive(k2); live(22.02); check('2. 22:00 從洗衣間回來：開門進來，旁白「又一袋」（一句）',!!GM.npc.kai&&caps.filter(c=>c[1]===A.kai[0]).length===1,J(caps));
    check('2. 阿凱只有一句：同一天第二次走進來不說',X().walkInLine(H.G,'kai')===null);
    room('2025-10-08',22.6); for(const [id,u] of STORY.dormWho(H.G)) STORY.dormSpawn(GM,id,u,false);   /* S.populate 的宿舍房間同一行（tests/dorm_mates_live_unit.js 第 0 項對過）*/
    check('2. 走進房間看到已經在的人：直接坐好，不說旁白',seated('zhe','L1')&&seated('classmate_bohan','R1')&&seated('kai','R2')&&caps.length===0); });

  /* ================= 3 房間閒聊 ================= */
  const OI=EVENTS.onInteract;   /* 和這一項無關的互動事件（例：阿凱「室友的同學」ev_kai_mentions_ziqing）先不演，測的是閒聊 */
  const talk=async(id)=>{ H.said=[]; H.picks=['就這樣']; const n=GM.npc[id]||mkN(id,0,0,{seat:STORY.dormSeat(STORY.R203_SEAT[id])}); EVENTS.onInteract=()=>false; try{ await STORY.talkCharacter(id,n); } finally { EVENTS.onInteract=OI; }
    const s=H.said.find(x=>x.t!=='你明天有空嗎？'); return s?((s.who?s.who+'：':'')+s.t):''; };
  const talkKai=async()=>{ H.said=[]; H.picks=['就這樣']; let n=GM.npc.kai; if(!n){ STORY.dormSpawn(GM,'kai','R2',false); n=GM.npc.kai; } EVENTS.onInteract=()=>false; try{ await n.talk(n); } finally { EVENTS.onInteract=OI; } return H.said.map(s=>s.t); };
  await sec(3,async()=>{ const R=L.room, Z=R.zhe, B=R.classmate_bohan, KR=R.kai.rows, BN=()=>SOCIAL.displayName('classmate_bohan')+'：';
    const isAfter=(x,T)=>x===T.after[0].text||x.endsWith('：'+T.after[1].text);
    room('2025-09-02',22.6); knowAll(); const a1=await talk('zhe'), a2=await talk('zhe');
    check('3. 大一上第 1 週在房間跟阿哲講話：第一句「床中間那條縫」；同一天再講＝稿「之後」的招呼',a1==='阿哲：'+Z.rows[0].t&&isAfter(a2,Z),J([a1,a2]));
    at('2025-09-03',22.6); const a3=await talk('zhe'); at('2025-09-04',22.6); const a4=await talk('zhe');
    check('3. 一天一句新的、照稿的順序：鬧鐘、阿凱打字（認識阿凱）',a3==='阿哲：'+Z.rows[1].t&&a4==='阿哲：'+Z.rows[2].t,J([a3,a4]));
    at('2025-09-05',23.2); const a5=await talk('zhe'), a6=await talk('zhe'), a7=await talk('zhe');
    check('3. 現在能說的都說完了：「之後」兩句輪流（旁白、「明天第一節幾點？……好，叫我。」）',isAfter(a5,Z)&&isAfter(a6,Z)&&a5!==a6&&a7===a5,J([a5,a6,a7]));
    at('2025-10-27',22.6); const a8=await talk('zhe'); at('2025-11-03',22.6); const a9=await talk('zhe');
    check('3. 期中後（大一上第 10 週起）才有「我媽打電話問我室友好不好」：第 9 週還是招呼、第 10 週說',isAfter(a8,Z)&&a9==='阿哲：'+Z.rows[3].t,J([a8,a9]));
    H.G.flags.ZHE_CALLS_GE=true; at('2026-02-24',22.6); const b1=await talk('zhe'); at('2026-02-25',22.6); const b2=await talk('zhe'); at('2026-02-26',22.6); const b3=await talk('zhe');
    check('3. 大一下：洗澡唱歌、（ZHE_CALLS_GE）「哥，你的床最靠門」；「期末前」那句（第 10～15 週）第 1 週還沒有',b1==='阿哲：'+Z.rows[4].t&&b2==='阿哲：'+Z.rows[5].t&&isAfter(b3,Z),J([b1,b2,b3]));
    at('2026-05-05',22.6); const b4=await talk('zhe'); check('3. 大一下第 11 週：「下學期抽籤，我們會不會還住同一間？」',b4==='阿哲：'+Z.rows[6].t,b4);
    room('2025-10-01',22.6); knowAll(); const c1=await talk('zhe'); check('3. 第一次在房間講話已經是第 5 週：第 1～4 週那句過了＝不補，從「鬧鐘」開始',c1==='阿哲：'+Z.rows[1].t,c1);
    for(const d of ['2026-02-24','2026-02-25','2026-02-26','2026-02-27']){ at(d,22.6); await talk('zhe'); }
    check('3. 沒有 ZHE_CALLS_GE：沒有「哥」那一句',!X().rec(H.G).talk.zhe.includes('z6')&&X().rec(H.G).talk.zhe.includes('z5'),J(X().rec(H.G).talk.zhe));
    room('2025-09-02',22.6); knowAll(); const p1=await talk('classmate_bohan'); at('2025-09-03',22.6); const p2=await talk('classmate_bohan'); at('2025-09-04',22.6); const p3=await talk('classmate_bohan');
    check('3. 柏翰：第 1～4 週「早上出門會盡量小聲」、「桌腳墊高」、期中前「黃色的耳塞」',p1===BN()+B.rows[0].t&&p2===BN()+B.rows[1].t&&p3===BN()+B.rows[2].t,J([p1,p2,p3]));
    room('2025-10-27',22.6); knowAll(); const q1=await talk('classmate_bohan'); at('2025-10-28',22.6); const q2=await talk('classmate_bohan'); at('2025-11-03',22.6); const q3=await talk('classmate_bohan');
    check('3. 第 9 週才第一次講：第 1～4 週、期中前（第 1～7 週）那兩句過了不補；「桌腳墊高」，期中後（第 10 週）才有「轉筆」',q1===BN()+B.rows[1].t&&isAfter(q2,B)&&q3===BN()+B.rows[3].t,J([q1,q2,q3]));
    room('2026-04-20',22.6); knowAll(); H.rel('classmate_peishan',20,5,5); for(const d of ['2026-04-20','2026-04-21','2026-04-22','2026-04-23','2026-04-24']){ at(d,22.6); await talk('classmate_bohan'); }
    check('3. 大一下第 9 週：認識沛珊、她和柏翰交往中（4/6 起）＝講電話那一列（照順序在米粉之後）',J(X().rec(H.G).talk.classmate_bohan)===J(['b2','b4','b5','b6']),J(X().rec(H.G).talk.classmate_bohan));
    room('2026-04-20',22.6,{dating_classmate_peishan:true}); knowAll(); H.rel('classmate_peishan',20,5,5); for(const d of ['2026-04-20','2026-04-21','2026-04-22','2026-04-23','2026-04-24']){ at(d,22.6); await talk('classmate_bohan'); }
    check('3. 玩家和沛珊交往＝沒有講電話那一列',!X().rec(H.G).talk.classmate_bohan.includes('b6'),J(X().rec(H.G).talk.classmate_bohan));
    room('2025-09-02',22.6,{},'campus'); knowAll(); const o1=await talk('zhe'); check('3. 房間外（校園）照原本的閒聊',!!o1&&!Z.rows.some(r=>o1.endsWith(r.t))&&!isAfter(o1,Z),o1);
    room('2025-08-30',22.6); knowAll(); const o2=await talk('zhe'); check('3. 8/30（開學以前）房間裡還沒有能說的：照原本的閒聊',!!o2&&!Z.rows.some(r=>o2.endsWith(r.t))&&!isAfter(o2,Z),o2);
    room('2025-09-02',19); knowAll(); const k1=await talkKai(); at('2025-09-03',19); const k2=await talkKai();
    check('3. 阿凱（房間）：第一句「冷氣遙控器我收在抽屜裡」；隔天沒有新的（期中後才有下一句）＝原本的房間句',k1[0]===KR[0].t&&k2.length===1&&!KR.some(r=>r.t===k2[0]),J([k1,k2]));
    at('2025-11-03',19); const k3a=await talkKai(); at('2025-11-28',19); const k3=await talkKai(); check('3. 期中後、第 13 週 3-3 宵夜（11/27）以前還沒有；宵夜那一晚以後：「上次宵夜是我下去拿的。……就這樣。」（AA_528 2-3）',k3a.length===1&&!KR.some(r=>r.t===k3a[0])&&k3[0]===KR[1].t,J([k3a,k3]));
    at('2026-02-24',19); const k4=await talkKai(); at('2026-02-25',19); const k5=await talkKai();
    check('3. 大一下：「你們三個都念法律」；三句說完照原本的房間句',k4[0]===KR[3].t&&k5.length===1&&!KR.some(r=>r.t===k5[0]),J([k4,k5])); });

  /* ================= 4 六件小事 ================= */
  await sec(4,async()=>{
    room('2025-09-16',22.4); knowAll(); check('4. 3-1 冷氣：9/16（大一上第 3 週週二）22:24 還不演（柏翰 22:30 才回來）',!evCheck('ev_r203_ac'));
    H.G.hour=22.55; check('4. 22:33 三個人都在、祐廷在房間：演',evCheck('ev_r203_ac'));
    H.G.zone='campus'; check('4. 祐廷不在房間：不演',!evCheck('ev_r203_ac')); H.G.zone='dorm';
    STORY.dormSpawn(GM,'classmate_bohan','R1',true,'door'); check('4. 柏翰正在走進來：等他坐下才演',!evCheck('ev_r203_ac')); arrive(GM.npc.classmate_bohan); check('4. 坐下了：演',evCheck('ev_r203_ac'));
    at('2025-09-23',22.55); check('4. 別的週二不演',!evCheck('ev_r203_ac'));
    at('2025-09-16',23.6); check('4. 23:36 阿哲、柏翰上床了：不演',!evCheck('ev_r203_ac'));
    room('2025-10-22',23.1); knowAll(); check('4. 3-2 誰關燈：民總期中考前一晚（10/22）23:06 演',evCheck('ev_r203_light'));
    at('2025-10-21',23.1); check('4. 前一天（10/21）不演',!evCheck('ev_r203_light'));
    room('2025-11-27',23.1); knowAll(); check('4. 3-3 宵夜：11/27（第 13 週週四）23:06 演',evCheck('ev_r203_supper'));
    { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id==='classmate_bohan'?true:aw(id,G); try{ check('4. 柏翰那天不在（回家）：不演',!evCheck('ev_r203_supper')); } finally { STORY.awayOnDate=aw; } }
    room('2026-02-23',22.6); knowAll(); check('4. 3-4 帶回來的東西：大一下開學那天（2/23）22:36 演',evCheck('ev_r203_gifts'));
    at('2026-02-23',22.2); check('4. 22:12 柏翰還沒回來：不演',!evCheck('ev_r203_gifts'));
    room('2026-05-23',17.1); knowAll(); check('4. 3-5 借襯衫：大一下第 13 週週六 17:06 阿哲在，演',evCheck('ev_r203_shirt'));
    at('2026-05-30',17.1); check('4. 第 14 週週六也可以',evCheck('ev_r203_shirt')); at('2026-06-06',18.9); check('4. 第 15 週週六 18:54 也可以',evCheck('ev_r203_shirt'));
    at('2026-05-16',17.1); check('4. 第 12 週週六不演',!evCheck('ev_r203_shirt')); at('2026-05-23',19.2); check('4. 19:00 以後（他出門了）不演',!evCheck('ev_r203_shirt'));
    room('2026-06-14',23.1); knowAll(); check('4. 3-6 最後一晚：6/14 23:06 四個人都在，演',evCheck('ev_r203_last'));
    at('2026-06-13',23.1); check('4. 6/13 不演',!evCheck('ev_r203_last'));
    room('2025-09-16',22.55,{DORM_FOUR:false}); knowAll(); check('4. 沒有 DORM_FOUR（兩人房）：都不演',!evCheck('ev_r203_ac'));
    room('2025-09-16',22.55); knowAll(); let t=await runEv('ev_r203_ac',['「24。」']); check('4. 3-1 選「24。」：阿凱「（按下去）謝謝。」阿哲「……我去拿外套。」，R203_AC＝24',H.G.flags.R203_AC===24&&t.includes('（按下去）謝謝。')&&t.includes('……我去拿外套。')&&!t.includes('讚！'),J(t));
    check('4. 演過一次就不再演',!evCheck('ev_r203_ac'));
    room('2025-09-16',22.55); knowAll(); t=await runEv('ev_r203_ac',['「26。」']); check('4. 選「26。」：R203_AC＝26',H.G.flags.R203_AC===26&&t.includes('讚！'));
    room('2025-10-22',23.1); knowAll(); t=await runEv('ev_r203_light',['再給他十分鐘']); check('4. 3-2：開演時鐘到 23:30；選「再給他十分鐘。」R203_LIGHT＝wait',Math.abs(H.G.hour-23.5)<1e-6&&H.G.flags.R203_LIGHT==='wait'&&t[0]===L.ev.light[0].text,J({h:H.G.hour,t:t.slice(0,2)}));
    room('2025-10-22',23.1); knowAll(); await runEv('ev_r203_light',['我也要睡了']); check('4. 選「我也要睡了，關。」R203_LIGHT＝off',H.G.flags.R203_LIGHT==='off');
    room('2025-11-27',23.1); knowAll(); t=await runEv('ev_r203_supper',['（吃）']); check('4. 3-3 選（吃）：沒有 KAI_COUNTED',!H.G.flags.KAI_COUNTED&&t.includes('（四個人吃完，阿哲把袋子綁好。垃圾是阿凱拿去丟的。）'));
    room('2025-11-27',23.1); knowAll(); t=await runEv('ev_r203_supper',['肩膀濕了']); check('4. 選「阿凱，你的肩膀濕了。」也記 KAI_COUNTED',H.G.flags.KAI_COUNTED===true&&t.includes('咦，是阿凱去的？……阿凱，謝啦！'));
    room('2026-02-23',22.6); knowAll(); t=await runEv('ev_r203_gifts',['什麼都沒帶']); check('4. 3-4 選「……我什麼都沒帶。」：柏翰的貢丸；最後阿凱「……我下次帶別的。」',t.includes('沒關係。貢丸很多。')&&t[t.length-1]==='……我下次帶別的。',J(t.slice(-3)));
    room('2026-05-23',17.1); knowAll(); t=await runEv('ev_r203_shirt',['去哪？']); check('4. 3-5 選「去哪？」：麵店團還有 Alison，然後一樣借（接「拿去。」那一段）、R203_SHIRT（第二輪：「拿去。」那一段照新稿，阿哲自己答「……會。」）',H.G.flags.R203_SHIRT===true&&t.includes('麵店團啦！……還有 Alison。好，你知道就好。')&&t.includes('……會。（他沒有脫下來。）'),J(t.slice(3)));
    room('2026-05-23',17.1); knowAll(); t=await runEv('ev_r203_shirt',['球衣']); check('4. 選「你穿你的球衣就好。」：沒有 R203_SHIRT',!H.G.flags.R203_SHIRT&&t.includes('……也對。（他換了三件，最後穿了球衣出門。）'));
    room('2026-06-14',23.1); knowAll(); t=await runEv('ev_r203_last',['幫他一起撕']); check('4. 3-6 選（幫他一起撕）：柏翰把燈關了一半',t.includes('（你們兩個蹲在地上撕了十分鐘。柏翰把燈關了一半，留你們那一邊的。）')); });

  /* ================= 5 稿第 5 節第 7 點的五項 ================= */
  await sec(5,async()=>{ const KR=L.room.kai.rows;
    /* ① 冷氣選 25 → 之後一週一次的旁白 */
    room('2025-09-16',22.55); knowAll(); await runEv('ev_r203_ac',['「25。」']);
    check('5①. 大一上第 3 週週二 22:30 在房間 → 選 25：R203_AC＝25',H.G.flags.R203_AC===25&&X().rec(H.G).ev.ac==='played');
    at('2025-09-17',19); X()._visit=null; caps=[]; tick(); const c1=caps.slice(); at('2025-09-18',20); X()._visit=null; caps=[]; tick();
    check('5①. 隔天晚上走進房間：一句「冷氣很安靜。大家都不滿意，可是都沒說。」；同一週再走進來不說',J(c1)===J([['',L.acWeekly[25]]])&&caps.length===0,J([c1,caps]));
    at('2025-09-22',21); X()._visit=null; caps=[]; tick(); check('5①. 下一週（第 4 週）第一次晚上走進房間：再一句',J(caps)===J([['',L.acWeekly[25]]]));
    at('2025-09-29',14); X()._visit=null; caps=[]; tick(); H.G.hour=19; tick(); check('5①. 白天走進房間不說、待到晚上也不說（要晚上走進來）',caps.length===0);
    at('2026-02-24',21); X()._visit=null; caps=[]; tick(); check('5①. 大一下不再說（稿：這一學期）',!caps.some(c=>c[1]===L.acWeekly[25]));
    at('2026-02-23',22.2); GM.npc={}; E.npcs=[]; walks=[]; X()._visit=null; caps=[]; live(); arrive(GM.npc.zhe); H.G.hour=22.3; tick();
    check('5①. 大一下第 1 週，阿哲在房間（坐好以後）：字幕「新的學期，冷氣要不要重新投票？……算了，照舊。」',caps.some(c=>c[0]==='阿哲'&&c[1]===L.acNewTerm),J(caps));
    at('2026-02-24',22.6); X()._visit=null; caps=[]; live(); tick(); check('5①. 只說一次',!caps.some(c=>c[1]===L.acNewTerm));
    /* ② 期中前一晚選「阿哲用我的檯燈」→ 隔天那一句 */
    room('2025-10-22',23.1); knowAll(); H.rel('classmate_bohan',30,10,10); await runEv('ev_r203_light',['檯燈']);
    check('5②. 期中前一晚選「關吧，阿哲用我的檯燈。」：R203_LIGHT＝lamp',H.G.flags.R203_LIGHT==='lamp');
    at('2025-10-23',15.3); H.G.zone='linze'; let t=await runEv('ev_midterm_walkout',[0,'去。']);
    check('5②. 隔天考完走出教室（ev_midterm_walkout）最後：阿哲「昨天那盞檯燈救了我。第二題剛好在那兩頁。」',H.said.length>0&&H.said[H.said.length-1].t===L.walkout.lamp&&H.said[H.said.length-1].id==='zhe'&&!t.includes(L.walkout.wait)&&!t.includes(L.walkout.off),J(t.slice(-3)));
    room('2025-10-23',15.3,{},'linze'); knowAll(); t=await runEv('ev_midterm_walkout',[0,'去。']); check('5②. 對照：沒有 3-2 的記號＝沒有這一句',![L.walkout.lamp,L.walkout.wait,L.walkout.off].some(x=>t.includes(x)));
    /* ③ 宵夜選「謝謝阿凱」→ 阿凱閒聊換句 */
    room('2025-11-27',23.1); knowAll(); await runEv('ev_r203_supper',['謝謝阿凱']); check('5③. 宵夜選「謝謝阿凱。」：KAI_COUNTED',H.G.flags.KAI_COUNTED===true);
    const ka=[]; for(const d of ['2025-11-28','2025-11-29','2025-11-30']){ at(d,19); ka.push((await talkKai())[0]); }
    check('5③. 之後阿凱的閒聊：「上次宵夜是我下去拿的」不出現、換成「上次宵夜，你說了謝謝。……就這樣。」',ka[0]===KR[0].t&&ka[1]===KR[2].t&&!ka.includes(KR[1].t),J(ka));
    room('2025-11-27',23.1); knowAll(); await runEv('ev_r203_supper',['（吃）']); const kb=[]; for(const d of ['2025-11-28','2025-11-29','2025-11-30']){ at(d,19); kb.push((await talkKai())[0]); }
    check('5③. 對照：選（吃）＝原本那一句「上次宵夜是我下去拿的」，沒有換的那句',kb[1]===KR[1].t&&!kb.includes(KR[2].t),J(kb));
    room('2025-11-03',19); knowAll(); await talkKai(); at('2025-11-04',19); const kc0=(await talkKai())[0]; at('2025-11-27',23.1); await runEv('ev_r203_supper',['謝謝阿凱']); at('2025-11-28',19); const kc1=(await talkKai())[0]; at('2025-11-29',19); const kc2=(await talkKai())[0];
    check('5③. 宵夜以前（期中後）沒有「上次宵夜……」那一句（AA_528 2-3；原本這裡先聽到原句）；宵夜算到他以後聽到換的那句（一次）',!KR.some(r=>r.t===kc0)&&kc1===KR[2].t&&!KR.some(r=>r.t===kc2),J([kc0,kc1,kc2]));
    /* ③b AA_502 第 6 節第 9 點（企劃線 795fbecfd）：KAI_COUNTED 有兩個來源（3-3 宵夜、AA_503 7-2 子晴練習賽選「他沒講。」）；2-3 那一句只看宵夜那晚有沒有算到他（R203_SUPPER_KAI）*/
    room('2025-11-27',23.1,{KAI_COUNTED:true,ZQ_PRACTICE:'tell'}); knowAll(); await runEv('ev_r203_supper',['（吃）']); const kd=[]; for(const d of ['2025-11-28','2025-11-29','2025-11-30']){ at(d,19); kd.push((await talkKai())[0]); }
    check('5③b. 練習賽已經記了 KAI_COUNTED、宵夜選（吃）（R203_SUPPER_KAI false）＝原句「上次宵夜是我下去拿的」，沒有換的那句；KAI_COUNTED 照舊在',kd[1]===KR[1].t&&!kd.includes(KR[2].t)&&H.G.flags.KAI_COUNTED===true&&H.G.flags.R203_SUPPER_KAI===false,J(kd));
    room('2025-11-27',23.1,{KAI_COUNTED:true,ZQ_PRACTICE:'tell'}); knowAll(); await runEv('ev_r203_supper',['肩膀濕了']); const kf=[]; for(const d of ['2025-11-28','2025-11-29']){ at(d,19); kf.push((await talkKai())[0]); }
    check('5③b. 練習賽記過、宵夜也算到他（「阿凱，你的肩膀濕了。」）＝換的那句「上次宵夜，你說了謝謝。……」',H.G.flags.R203_SUPPER_KAI===true&&kf[1]===KR[2].t,J(kf));
    for(const [fl,want,why] of [[{KAI_COUNTED:true},KR[2].t,'宵夜記的'],[{KAI_COUNTED:true,ZQ_PRACTICE:'tell'},KR[1].t,'分不出是不是練習賽記的：照沒算到']]){ room('2025-11-28',19,fl); knowAll(); const kg=[]; for(const d of ['2025-11-28','2025-11-29']){ at(d,19); kg.push((await talkKai())[0]); }
      check('5③b. 舊存檔（宵夜演過、還沒有 R203_SUPPER_KAI）'+J(fl)+'＝'+why,kg[1]===want,J(kg)); }
    /* ④ 借襯衫 → 12/19 Alison 那一句 */
    room('2026-05-23',17.1); knowAll(); H.rel('yu',30,10,10); H.G.flags.met_yu=true; await runEv('ev_r203_shirt',['拿去']);
    check('5④. 借襯衫選「拿去。」：R203_SHIRT',H.G.flags.R203_SHIRT===true);
    at('2026-12-19',19); H.G.zone='noodle'; t=await runEv('ev_yu_together');
    { const i=t.indexOf(L.shirtYu), j=t.findIndex(x=>/^（看了一眼正在跟阿姨點菜的阿哲）/.test(x)), k=t.findIndex(x=>/^反正就這樣/.test(x));
      check('5④. 大二上 12/19 ev_yu_together：Alison「阿哲那天穿了一件白襯衫。很不像他。……我那天就覺得怪怪的。」（「哪有人這樣告白的」之後、「反正就這樣」之前）',i>0&&H.said[i].id==='yu'&&i===j+1&&k===i+1,J(t)); }
    room('2026-12-19',19,{},'noodle'); knowAll(); H.G.flags.met_yu=true; t=await runEv('ev_yu_together'); check('5④. 對照：沒有借襯衫＝沒有這一句',!t.includes(L.shirtYu));
    room('2026-05-23',17.1); knowAll(); H.rel('yu',30,10,10); H.G.flags.met_yu=true; await runEv('ev_r203_shirt',['拿去']); at('2026-06-01',21); H.G.zone='wancai'; H.G.flags.CLUB_club_guitar=true; H.G.flags.yu2SoymilkDay=D('2026-05-26');
    t=await runEv('ev_yu_sign_question_club',[0]); check('5④. 語 2 第三個徵兆在借襯衫以後：她開頭多這一句（「欸，阿哲是不是對每個人都這麼好？」之前）',t[0]===L.shirtYu&&t[1]==='欸，阿哲是不是對每個人都這麼好？',J(t.slice(0,2)));
    at('2026-12-19',19); H.G.zone='noodle'; t=await runEv('ev_yu_together'); check('5④. 說過了：12/19 不再說一次',!t.includes(L.shirtYu));
    { const e1=EV('ev_yu_sign_question_arcade'); check('5④. 騎樓那一版（沒參加吉他社）也接了',!!e1&&e1.dialogue[0].text===L.shirtYu&&e1.dialogue[1].text==='欸，阿哲是不是對每個人都這麼好？'); }
    /* ⑤ 群組 9/1 三則、第 5 週改名 */
    room('2025-08-29',22); knowAll(); sweep('2025-08-29',22,'2025-09-01',20.75,0.5); check('5⑤. 9/1 21:00 以前沒有 203 群組',!PHONE.inGroup(H.G,'r203')&&grp().length===0);
    sweep('2025-09-01',20.75,'2025-09-01',21.5,0.02); const g1=grp().map(m=>[m.from,m.text,+(m.h.toFixed(3))]);
    check('5⑤. 9/1 21:00 阿哲建立「203」：阿哲兩則（21:00）、柏翰（21:02）、阿凱（21:05）',PHONE.inGroup(H.G,'r203')&&PHONE.rec(H.G).groups.r203.name==='203'&&J(g1.map(x=>[x[0],x[1]]))===J([['zhe','203 的群組'],['zhe','誰帶了吹風機'],['classmate_bohan','我有。在第二個抽屜。'],['kai','所以吹風機要排隊嗎']])&&Math.abs(g1[2][2]-(21+2/60))<0.03&&Math.abs(g1[3][2]-(21+5/60))<0.03,J(g1));
    sweep('2025-09-30',21,'2025-10-01',22,0.25); sweep('2025-10-01',22,'2025-10-01',22.4,0.02); const g2=grp().filter(m=>K(m.day)==='2025-10-01').map(m=>[m.from||'',m.text]);
    check('5⑤. 第 5 週（10/1）22:10 阿哲忘記帶鑰匙、22:11 阿凱「在」「（門開了）」、22:15 改名「203（不要再忘記帶鑰匙）」',J(g2)===J([['zhe','我忘記帶鑰匙'],['zhe','誰在房間'],['kai','在'],['kai','（門開了）'],['','阿凱 把群組名稱改成「203（不要再忘記帶鑰匙）」']])&&PHONE.rec(H.G).groups.r203.name==='203（不要再忘記帶鑰匙）',J(g2)); });

  /* ================= 6 3-7 不在房間 ================= */
  await sec(6,async()=>{
    room('2025-09-15',20,{},'campus'); knowAll(); sweep('2025-09-15',20,'2025-09-17',6,0.25);
    check('6. 3-1 那一晚（9/16）祐廷不在房間：不演；結果照 25（R203_AC＝25）',!H.G.events.done.ev_r203_ac&&H.G.flags.R203_AC===25&&X().rec(H.G).ev.ac==='missed');
    at('2025-09-17',6); H.G.zone='dorm'; X()._visit=null; caps=[]; tick(); check('6. 隔天早上在房間：一句「（冷氣遙控器貼了一張紙：「25 度。投票結果。」）」',J(caps)===J([['',L.miss.ac]]),J(caps));
    H.G.hour=6.5; tick(); check('6. 只說一次（同一個早上也不接著說一週一次的那句）',caps.length===1,J(caps));
    sweep('2025-09-17',6.5,'2025-09-17',7.6,0.05); check('6. 群組：3-1 隔天 07:25 柏翰「冷氣遙控器在阿凱的抽屜。請用完放回去。」',grp().some(m=>m.from==='classmate_bohan'&&m.text===L.group.ac[0].text&&K(m.day)==='2025-09-17'&&m.h>=7.41&&m.h<7.5),J(grp().map(m=>[K(m.day),m.h,m.text])));
    room('2025-10-22',20,{},'campus'); knowAll(); sweep('2025-10-22',20,'2025-10-23',6,0.25); at('2025-10-24',7.5); H.G.zone='dorm'; X()._visit=null; caps=[]; tick();
    check('6. 3-2 不在：隔天（10/23）沒進房間、10/24 才進來＝不說（只有隔天）',caps.length===0&&X().rec(H.G).ev.light==='missed'&&!H.G.flags.R203_LIGHT);
    room('2025-11-27',20,{},'campus'); knowAll(); { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id==='kai'&&G.day===D('2025-11-27')?true:aw(id,G); try{ sweep('2025-11-27',20,'2025-11-28',6,0.25); } finally { STORY.awayOnDate=aw; } }
    at('2025-11-28',7.5); H.G.zone='dorm'; X()._visit=null; caps=[]; tick();
    check('6. 3-3 那天阿凱自己不在（回家）：那一件沒有發生，沒有旁白',X().rec(H.G).ev.supper==='none'&&caps.length===0);
    room('2026-02-23',20,{},'campus'); knowAll(); sweep('2026-02-23',20,'2026-02-24',6,0.25); at('2026-02-24',7.5); H.G.zone='dorm'; X()._visit=null; caps=[]; tick();
    check('6. 3-4 不在：隔天「（你的桌上放著一顆貢丸、一隻雞腳、一包泡麵。）」',J(caps)===J([['',L.miss.gifts]]),J(caps));
    room('2026-05-22',20,{},'campus'); knowAll(); sweep('2026-05-22',20,'2026-06-07',6,1); at('2026-06-07',8); H.G.zone='dorm'; X()._visit=null; caps=[]; tick();
    check('6. 3-5 三個週六都不在房間：第 15 週週六的隔天（6/7）「白襯衫不見了……借一下——哲」，也記 R203_SHIRT',J(caps)===J([['',L.miss.shirt]])&&H.G.flags.R203_SHIRT===true,J(caps));
    room('2026-06-14',20,{},'campus'); knowAll(); sweep('2026-06-14',20,'2026-06-15',8,0.25); at('2026-06-15',9); H.G.zone='dorm'; X()._visit=null; caps=[]; tick();
    check('6. 3-6 不在：不補（沒有旁白）',X().rec(H.G).ev.last==='missed'&&caps.length===0); });

  /* ================= 7 群組 ================= */
  await sec(7,()=>{
    room('2025-08-29',22); knowAll(); sweep('2025-08-29',22,'2026-06-16',0,1);
    const g=grp(), T=t=>g.find(m=>m.text===t), day=m=>m?K(m.day):null;
    check('7. 大一上第 15 週週日（12/14）20:00 阿凱「所以垃圾今天誰倒」、20:30「我倒了」',day(T('所以垃圾今天誰倒'))==='2025-12-14'&&Math.abs(T('所以垃圾今天誰倒').h-20)<0.05&&Math.abs(T('我倒了').h-20.5)<0.05);
    check('7. 大一下第 1 週（開學前一天 2/22 21:00）阿哲「明天大家幾點到」「我帶雞腳」',day(T('明天大家幾點到'))==='2026-02-22'&&day(T('我帶雞腳'))==='2026-02-22');
    check('7. 大一下第 9 週（4/20）柏翰「今天晚上十一點熄燈。期中。」、23:01 阿哲的照片',day(T('今天晚上十一點熄燈。期中。'))==='2026-04-20'&&day(T('（照片：黑暗中一支手機的燈照著筆記）'))==='2026-04-20'&&Math.abs(T('（照片：黑暗中一支手機的燈照著筆記）').h-(23+1/60))<0.05);
    check('7. 搬出 203 那天（6/15）：阿哲「203 解散」「（貼圖）」；這一天不改名（第二輪：「203（舊生）」改到大二 9/6，見第 9 項）',day(T('203 解散'))==='2026-06-15'&&!!T('（貼圖）')&&!g.some(m=>/203（舊生）/.test(m.text))&&PHONE.rec(H.G).groups.r203.name==='203（不要再忘記帶鑰匙）');
    check('7. 3-1（這一局祐廷在房間但事件沒演＝missed）隔天照樣傳冷氣那一則',day(T(L.group.ac[0].text))==='2025-09-17');
    check('7. 大一一整年 18 則（9/1 四、鑰匙四＋改名、冷氣隔天一、垃圾二、開學前二、期中二、搬出二；第二輪「203（舊生）」改到大二 9/6）；tag 都是 rt_r203_ 開頭（例行訊息，不算手機的頻率上限）、都不用回（沒有 ask）',g.length===18&&g.every(m=>/^rt_r203_/.test(m.tag||'')&&!m.ask),g.length);
    { const R=X().rec(H.G), by={}; for(const k in R.g) if(typeof R.g[k]==='number'){ const w=R.g[k]-(CALENDAR.dateOf(R.g[k]).wd-1); by[w]=(by[w]||0)+1; } check('7. 同一週最多兩次',Object.values(by).every(n=>n<=2),J(R.g)); }
    sweep('2027-11-19',22.5,'2027-11-19',23.2,0.1); const a=grp().filter(m=>K(m.day)==='2027-11-19').map(m=>[m.from,m.text]);
    check('7. 大二以後：2027-11-19 23:00 阿凱「所以阿哲還好嗎」、柏翰「還好。我在旁邊。」',J(a)===J([['kai','所以阿哲還好嗎'],['classmate_bohan','還好。我在旁邊。']]),J(a));
    sweep('2029-06-02',21.5,'2029-06-02',22.2,0.1); const b=grp().filter(m=>K(m.day)==='2029-06-02').map(m=>[m.from,m.text]);
    check('7. 2029-06-02 畢業典禮晚上：阿哲三則、阿凱「我在了」、柏翰「我也在。」',J(b)===J([['zhe','203 的人'],['zhe','畢業了'],['zhe','出來吃宵夜'],['kai','我在了'],['classmate_bohan','我也在。']]),J(b));
    room('2025-09-29',20); knowAll(); sweep('2025-09-29',20,'2025-09-29',20.5,0.25); const R2=X().rec(H.G); R2.g.t1=D('2025-09-29'); R2.g.t2=D('2025-09-30'); sweep('2025-09-30',20,'2025-10-01',22.5,0.25);
    check('7. 同一週（9/29～10/5）已經兩次：第三次（10/1 鑰匙）不送',R2.g.key==='cap'&&!grp().some(m=>m.text==='我忘記帶鑰匙'),J(R2.g)); });

  /* ================= 8 舊存檔 ================= */
  await sec(8,()=>{
    room('2025-10-10',20); knowAll(); sweep('2025-10-10',20,'2025-10-10',21,0.25); const R=X().rec(H.G);
    check('8. 10/10 才讀到（舊存檔）：紀錄從今天開始；群組今天建立、9/1 和第 5 週的訊息不補',!!R&&K(Math.floor(R.from/24))==='2025-10-10'&&PHONE.inGroup(H.G,'r203')&&grp().length===0&&R.g['0901']==='pre'&&R.g.key==='pre');
    check('8. 已經過了的週不補：3-1（9/16）＝pre，不記 R203_AC、隔天不說旁白',R.ev.ac==='pre'&&H.G.flags.R203_AC==null);
    sweep('2025-10-10',21,'2025-10-23',0,1); check('8. 之後的照常：3-2（10/22）不在房間＝missed',R.ev.light==='missed');
    room('2025-09-16',22.55,{DORM_FOUR:false}); knowAll(); sweep('2025-09-16',22.55,'2025-09-20',0,1); check('8. 沒有 DORM_FOUR（兩人房的舊存檔）：沒有紀錄、沒有群組',!H.G.flags.R203&&!PHONE.inGroup(H.G,'r203'));
    room('2026-10-07',22.75,{ROOM_Y2:D('2026-09-06')}); knowAll(); X().phone(H.G); check('8. 大二才第一次讀到：不建 203 群組（203 的時期已經過了）',!H.G.flags.R203&&!PHONE.inGroup(H.G,'r203')); });

  /* ================= 9 第二輪：稿第 6 節（AA-C 2026-10-28 回 LAWWW-C 的 8 點）================= */
  const OLDN='阿凱 把群組名稱改成「203（舊生）」';
  await sec(9,async()=>{ let t;
    /* 第 5 點：3-2 柏翰那句 */
    room('2025-10-22',23.1); knowAll(); t=await runEv('ev_r203_light',['檯燈']);
    check('9. 3-2（第 5 點）：柏翰「我要睡了。明天考試。」（民總 13:20 考；原本「明天八點考試」）',t[1]==='我要睡了。明天考試。'&&H.said[1].id==='classmate_bohan'&&!t.includes('我要睡了。明天八點考試。'),J(t.slice(0,2)));
    /* 第 7 點：3-5 柏翰週六在總圖，阿哲自己答 */
    room('2026-05-23',17.1); knowAll(); t=await runEv('ev_r203_shirt',['拿去']); const e5=EV('ev_r203_shirt');
    check('9. 3-5（第 7 點）：「會不會太正式？」→（他看著鏡子，自己點了點頭。）→ 阿哲「……會。（他沒有脫下來。）」；柏翰不在場、沒有他的句子（原本柏翰「（沒有抬頭）會。」）',
      J(t.slice(-3))===J(['會不會太正式？','（他看著鏡子，自己點了點頭。）','……會。（他沒有脫下來。）'])&&H.said[H.said.length-1].id==='zhe'&&H.said[H.said.length-2].who===null&&!H.said.some(x=>x.id==='classmate_bohan')&&!t.includes('（沒有抬頭）會。')&&!!e5&&J(e5.participants)===J(['zhe']),J({t:t.slice(-3),p:e5&&e5.participants}));
    /* 第 4 點：借完就出門（三個選項都是），19:00～22:00 照作息在西門町、22:00 回來 */
    room('2026-05-23',16.9); knowAll(); live(); live(17.02); const z0=GM.npc.zhe; if(z0) arrive(z0); H.G.hour=17.1;
    check('9. 3-5 那天：演之前阿哲在房間（17:00 開門回來、坐好）',!!z0&&who().includes('zhe'));
    await runEv('ev_r203_shirt',['拿去']); walks=[]; live(17.11); const wz=walks.find(q=>q.n===z0);
    check('9. 3-5（第 4 點）演完：阿哲起身走向門口（借完就出門）',!!wz&&wz.z>2.5,J(wz&&[wz.x,wz.z]));
    const out1=[17.5,18.5,20,21.9].map(h=>{ H.G.hour=h; return who().includes('zhe'); }); H.G.hour=22.1; const back1=who().includes('zhe');
    check('9. 之後 17:30、18:30（出門了）、20:00、21:54（西門町）都不在；22:00 回來',out1.every(x=>!x)&&back1,J([out1,back1]));
    room('2026-05-23',17.1); knowAll(); const ctl=[17.5,18.5].map(h=>{ H.G.hour=h; return who().includes('zhe'); });
    check('9. 對照：那天沒演（祐廷沒看到）＝照作息 17:00～19:00 在房間',ctl.every(x=>x),J(ctl));
    room('2026-05-30',17.1); knowAll(); await runEv('ev_r203_shirt',['球衣']); H.G.hour=17.5; const j1=who().includes('zhe'); H.G.hour=22.1; const j2=who().includes('zhe');
    check('9. 選「你穿你的球衣就好。」也一樣（他最後穿了球衣出門）：17:30 不在、22:00 回來',!j1&&j2,J([j1,j2]));
    /* 第 1 點：3-6 最後一晚的新稿 */
    room('2026-06-14',23.1); knowAll(); t=await runEv('ev_r203_last',['週日宵夜照舊']);
    check('9. 3-6（第 1 點）：旁白「紙箱疊到天花板，都是阿哲和柏翰的……」、阿凱「暑假只剩我們兩個。用不到了。」、膠帶「放進自己的抽屜」（原本「這個要撕乾淨，不然扣押金。」「放進自己的紙箱」）',
      t[0]==='（紙箱疊到天花板，都是阿哲和柏翰的。阿凱蹲在地上，在撕書桌底下那一截國界膠帶。）'&&t[1]==='暑假只剩我們兩個。用不到了。'&&H.said[1].id==='kai'&&t.includes('（他把撕下來的膠帶捲成一團，沒有丟，放進自己的抽屜。）')&&!t.includes('這個要撕乾淨，不然扣押金。')&&!t.some(x=>/放進自己的紙箱/.test(x)),J(t.slice(0,5)));
    check('9. 暑假 203 只剩祐廷和阿凱（6/15 阿哲、柏翰搬出；阿凱照原本 18:00～08:00）、9/5 還在；9/6 搬去 312（ROOM_Y2）以後阿凱不在（第一輪就是這樣，回歸）',
      J(whoAt('2026-07-15',23))===J(['kai'])&&J(whoAt('2026-09-05',23))===J(['kai'])&&J(whoAt('2026-09-06',23,{ROOM_Y2:D('2026-09-06')}))===J([]));
    /* 第 1 點：群組 6/15 不改名、9/6 21:00 改「203（舊生）」*/
    room('2026-06-14',20); knowAll(); sweep('2026-06-14',20,'2026-06-16',0,0.5); const g15=grp().filter(m=>K(m.day)==='2026-06-15').map(m=>[m.from||'',m.text]);
    check('9. 群組（第 1 點）：搬出 203 那天（6/15）阿哲「203 解散」「（貼圖）」、不改名，群組名還是「203」',J(g15)===J([['zhe','203 解散'],['zhe','（貼圖）']])&&PHONE.rec(H.G).groups.r203.name==='203',J([g15,PHONE.rec(H.G).groups.r203&&PHONE.rec(H.G).groups.r203.name]));
    sweep('2026-09-06',20,'2026-09-06',21.5,0.05); const g96=grp().filter(m=>K(m.day)==='2026-09-06');
    check('9. 大二 9/6 晚上（阿凱搬去別棟那天）21:00：系統一行「阿凱 把群組名稱改成「203（舊生）」」、群組名改成「203（舊生）」',g96.length===1&&g96[0].text===OLDN&&!g96[0].from&&Math.abs(g96[0].h-21)<0.06&&/^rt_r203_/.test(g96[0].tag||'')&&PHONE.rec(H.G).groups.r203.name==='203（舊生）',J(g96.map(m=>[m.h,m.text,m.tag])));
    room('2026-06-14',20); knowAll(); sweep('2026-06-14',20,'2026-06-16',0,0.5); { const R=X().rec(H.G); R.outName=true; PHONE.rec(H.G).groups.r203.name='203（舊生）'; }
    sweep('2026-09-06',20,'2026-09-06',21.5,0.25); check('9. 第一輪（f26164cea）6/15 就改過名的存檔：9/6 不再改一次（回歸）',!grp().some(m=>K(m.day)==='2026-09-06')&&PHONE.rec(H.G).groups.r203.name==='203（舊生）');
    /* 第 8 點：ev_dorm_late_kai 23:30 以後、四人房那一行照誰在床上 */
    room('2025-10-08',23.2); knowAll(); const lk0=evCheck('ev_dorm_late_kai'); H.G.hour=23.6; const lk1=evCheck('ev_dorm_late_kai');
    check('9. ev_dorm_late_kai（第 8 點）：23:30 以後——10/8（三）23:12 不演、23:36 可以（原本 23:00 起）',J(EV('ev_dorm_late_kai').time)===J([23.5,26])&&!lk0&&lk1,J([EV('ev_dorm_late_kai').time,lk0,lk1]));
    const late=async(k,h)=>{ room(k,h); knowAll(); return (await runEv('ev_dorm_late_kai',['去睡啦']))[0]; };
    const KF=['（頭沒回）欸，你回來了。我這個 bug 追到第三小時。','在等編譯，你先洗澡。'];
    const l1=await late('2025-10-08',23.75), l2=await late('2025-10-20',24+10/60), l3=await late('2025-10-20',23+40/60), l4=await late('2025-10-20',25.2);
    check('9. 四人房那一行：平日 23:45 阿哲、柏翰都上床了＝「（阿哲和柏翰都上床了。柏翰戴著耳塞。）」',l1==='（阿哲和柏翰都上床了。柏翰戴著耳塞。）',l1);
    check('9. 考試週 00:10（阿哲 00:00 上床、柏翰 00:30 才回來）＝「（阿哲已經上床了。柏翰的床還是空的。）」',l2==='（阿哲已經上床了。柏翰的床還是空的。）',l2);
    check('9. 考試週 23:40（阿哲還在書桌前、柏翰還沒回來）＝都不在床上，不說（第一句就是阿凱）',KF.includes(l3),l3);
    check('9. 考試週 01:12（柏翰 01:00 上床）＝兩個都在',l4==='（阿哲和柏翰都上床了。柏翰戴著耳塞。）',l4);
    { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id==='zhe'?true:aw(id,G); let l5; try{ l5=await late('2025-10-08',23.75); } finally { STORY.awayOnDate=aw; }
      check('9. 只有柏翰在床上（阿哲那天不在宿舍）：稿沒寫＝不說',KF.includes(l5),l5); }
    /* 第 8 點：ev_kai_late_screen 台詞不動、演的那一晚阿凱到 03:30 */
    { const e=EV('ev_kai_late_screen');
      check('9. ev_kai_late_screen（第 8 點）：台詞不改（第一句、四人房那一句照舊）',e.dialogue[0].text==='凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天第一堂就有課。'&&e.dialogue[1].text==='（阿哲已經睡了，柏翰戴著耳塞。）');
      const cand=[]; for(let d=D('2025-09-07');d<=D('2025-09-21');d++){ const T=CALENDAR.termOf(d); if(!T||T.id!=='Y1S1'||!e.weeks.includes(T.week)||!e.weekday.includes(wdOf(d))) continue; room(K(d),22); if(e.prereq.custom(H.G)) cand.push(d); }
      check('9. 找得到這個事件會演的晚上（大一上第 2～3 週、週日～週四、隔天早上有課）',cand.length>=2,J(cand.map(K)));
      const d1=cand[0], d2=cand[1];
      room(K(d1),25.9); knowAll(); const a1=who().includes('kai'); H.G.hour=26.4; const a2=who().includes('kai');
      check('9. 還沒演過、今晚去睡演的就是它（'+K(d1)+'）：02:00 以後阿凱還在書桌前（01:54、02:24 都在；原本 02:00 上床）',a1&&a2,J([a1,a2]));
      let inEv=null; const sy=GM.say; GM.say=async(w,tx)=>{ if(inEv==null) inEv=who().includes('kai'); return sy(w,tx); };
      H.G.hour=27; try{ H.said=[]; H.picks=['戴耳塞']; await EVENTS.run(e); } finally { GM.say=sy; }   /* 睡著以後 03:00 演（story3d.js 的 nightEvent：G.hour＝27）*/
      check('9. 03:00 演的時候阿凱在書桌前；事件記下那一晚（kaiScreenDay）',inEv===true&&H.G.flags.kaiScreenDay===d1&&!!H.G.events.done.ev_kai_late_screen,J({inEv,ks:H.G.flags.kaiScreenDay,d1}));
      const b1=[27.25,27.6].map(h=>{ H.G.hour=h; return who().includes('kai'); });
      check('9. 演完：那一晚 03:15 阿凱還在、03:36 上床了（到 03:30）',b1[0]&&!b1[1],J(b1));
      at(K(d2),26.4); const b2=who().includes('kai'); check('9. 只有那一晚：之後的晚上（'+K(d2)+'，事件的條件也對）照平常 02:00 上床',!b2);
      room('2025-09-12',26.4); knowAll(); check('9. 對照：事件不會演的晚上（9/12 週五）照平常 02:00 上床（回歸）',!who().includes('kai')); }
    /* 第 8 點：手機朋友頁的阿凱照新作息 */
    const WT=w=>!w?'':(w.away?w.away:((PLACES.names[w.zone]||w.zone)+(w.act?'（'+w.act+'，到 '+w.until+'）':'')));   /* 同 game3d.js 的 whereText（手機「朋友」的「現在大概在」）*/
    const wk=(k,h,f)=>{ room(k,h,Object.assign({afternoonDone:true},f||{})); knowAll(); return WT(STORY.whereIs(GM,'kai')); }, P=PLACES.names.dorm;
    const f1=wk('2025-10-06',22), f2=wk('2025-10-07',22), f3=wk('2025-10-08',9), f4=wk('2025-10-09',7.5), f5=wk('2025-10-09',22), f6=wk('2025-10-10',22), f7=wk('2025-10-19',15), f8=wk('2025-10-12',21.5), f9=wk('2026-01-20',22), f10=wk('2025-10-07',22,{DORM_FOUR:false}), f11=wk('2025-10-08',9,{DORM_FOUR:false});
    check('9. 手機朋友頁（第 8 點）：週一晚上 22:00＝「…（在書桌前，到 08:00）」（隔天週二第一節）；週二晚上＝到 10:30（原本每天都「到 08:00」）',f1===P+'（在書桌前，到 08:00）'&&f2===P+'（在書桌前，到 10:30）',J([f1,f2]));
    check('9. 週三 09:00 阿凱在上舖睡覺＝「…（睡覺，到 10:30）」（原本 08:00 以後就沒有）；週四 07:30 第一節前在書桌前＝到 08:00',f3===P+'（睡覺，到 10:30）'&&f4===P+'（在書桌前，到 08:00）',J([f3,f4]));
    check('9. 隔天放假（10/10 國慶）＝到 10:30；週五晚上＝到 13:00（週六下午才出門）；週日下午＝到隔天 10:30',f5===P+'（在書桌前，到 10:30）'&&f6===P+'（在書桌前，到 13:00）'&&f7===P+'（在書桌前，到 10:30）',J([f5,f6,f7]));
    check('9. 週日 21:30 在洗衣間照作息表（不寫宿舍）；寒假照原本（到 08:00）；沒有 DORM_FOUR 照原本（到 08:00、早上沒有）',f8.indexOf(P)!==0&&/坐著，到 22:00/.test(f8)&&f9===P+'（在書桌前，到 08:00）'&&f10===P+'（在書桌前，到 08:00）'&&f11.indexOf(P)!==0,J([f8,f9,f10,f11])); });

  H.done();
})();
