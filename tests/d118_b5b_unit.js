// D118-B5b 法服固定日期的四場（AA_604，企劃線 23581d5b6，AA-C 定稿 D109；docs/handoff/D118_PLAN.md 第 4 節 B5b）——不需要瀏覽器。
//   0  STORY.FAFU_STORY 逐字對 AA_604（場次表的日期、新個案、回訪、提醒；收尾旁白；共同開頭；沒看過上一場那一句；八件都演過那一句；第 4 場兩週以後的群組那一則）
//   1  非社員：0 則提醒、0 個出發選單、0 場
//   2  社員：四場各演一次——前一天 20:00 法服群組一則（照稿）＋一次性的出發選單（字照原本值班的）；到萬才館坐圓桌＝共同開頭 → 回訪（第 2～4 場，對到上一場的人）→ 新個案（照 fafuShift 的流程與字）
//      → 收尾；12:00；FAFU_STORY_<k>＝那天、FAFU_STORY_SEEN 累計；同一天不能再演；柏翰的記憶 FAFU_STORY；不加關係數值；第 4 場兩週以後 22:00 群組那一則
//   3  錯過不補、不追問、不扣分：第 2 場選「這週請假」＝之後沒有任何法服的訊息、SEEN 不變、關係不變；第 3 場的回訪只剩一句旁白；過了日期不再演
//   4  人在國外不排（美國路線大四上：第 4 場沒有提醒、沒有選單、不能演）
//   5  FAFU_STORY_SEEN ≤4
//   6  舊存檔（AA_604 第 4 節）：那一件演過＝換下一件還沒演過的、回訪照同一人；八件都演過＝開頭＋FAFU_LOG 第 1 句＋收尾；已經過了日期的不補
//   7  自己走進去坐圓桌的輪替：跳過固定場次演過的民眾和回訪（不重複演）
//   8  careerLean：看過幾場就加幾分（最多 4）；錯過不扣
//   9  溫州街線同一個週六（大二上 10/24 陪阿德）：一個出發選單（標題照溫州街線），阿德那一場和法服第 1 場都演得到、去過只算一次
//  10  SQ02（帝大紅茶的店員，sideq3d.js）：社員排法服初談時避開還沒演的固定場次那天（那天坐圓桌就是那一場、演到 12:00，會錯過初談）；不是社員照舊
// 修改前（開發分支 530a72ff4）：沒有 STORY.FAFU_STORY——第 0 項 FAIL、其他整段跳過＝FAILED 1。修改後 ALL PASS。用法：node tests/d118_b5b_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const L=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f); return; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,160)); } };
global.CG_REGISTRY=global.CG_REGISTRY||{};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js','src/sideq3d.js']) L(f);
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const MEM={CLUB_lawclub_study:true,lawclub:true,SIS_CLUB_EXPO:true};
const fresh=(d,h,zone,flags,route)=>{ const G=H.fresh(keyOf(d),h,zone||'dorm',Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1,FAFU_PURE:1,FAFU_STORY_SEEN:0},flags||{})); G.outings=[]; G.acts={att:{}}; at(d,h,zone||'dorm'); GM.npc={}; return G; };
const member=(d,h,flags,route)=>{ const G=fresh(d,h,'dorm',Object.assign({},MEM,flags||{}),route); H.FRIEND('classmate_bohan'); PHONE.join(G,'lawclub_study','法服'); return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:lawclub_study');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const dayOf=s=>D(s.key);
/* 前一天 20:30 到當天：出發（picks 給 OUT.prompt），回傳是不是到了萬才館 */
const goDay=async(s,pick)=>{ const d=dayOf(s); at(d-1,20.5); rules(); at(d,7); rules(); at(d,8.67); const q=OUT.due(H.G); if(!q) return {q:null}; H.picks=[pick||'出發']; await OUT.prompt(GM,q); return {q}; };
const sit=async picks=>{ H.said=[]; H.opts=[]; H.picks=(picks||[0]).slice(); const r=await STORY.fafuShift(GM); return {r,L:H.lines()}; };
(async()=>{
  const S=STORY.FAFU_STORY;
  check('0. 程式都載得到（溫州街線、SQ02）',!loadErr.length,loadErr.join(' | '));
  if(!Array.isArray(S)){ check('0. 有 STORY.FAFU_STORY（D118-B5b）',false); H.done(); return; }
  // ---------- 0 對稿 ----------
  await sec(0,async()=>{ const doc=cp.execSync('git -c core.quotepath=false show 23581d5b6:"docs/story_planning/AA_604_法服純劇情_FAFU_STORY場次與台詞.md"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24});
    const rows=doc.split('\n').filter(l=>/^\|\s*\d\s*\|\s*\d{4}-\d\d-\d\d\s*\|/.test(l)).map(l=>l.split('|').slice(1,-1).map(c=>c.trim()));
    const ends=doc.split('\n').filter(l=>/^\|\s*\d\s*\|\s*（/.test(l)).map(l=>l.split('|').slice(1,-1).map(c=>c.trim()));
    const num=c=>{ const m=/^(\d+)\s+(.+)$/.exec(c); return m?{n:+m[1],t:m[2]}:null; }, rem=c=>{ const m=/^([^：]+)：「(.+)」$/.exec(c); return m?{who:m[1],t:m[2]}:null; };
    const bad=[];
    for(const r of rows){ const k=+r[0], s=S.find(x=>x.k===k), cs=num(r[3]), bk=num(r[4]), rm=rem(r[5]); if(!s){ bad.push(k+' 沒有'); continue; }
      if(s.key!==r[1]) bad.push(k+' 日期 '+s.key+'≠'+r[1]); if(!cs||s.c+1!==cs.n||s.note!==cs.t) bad.push(k+' 新個案 '+J([s.c,s.note,cs]));
      if(r[4]==='—'?s.b!=null:(!bk||s.b+1!==bk.n)) bad.push(k+' 回訪 '+J([s.b,r[4]]));
      if(!rm||rm.t!==s.msg||(rm.who==='柏翰'?s.from!=='classmate_bohan':!(rm.who===s.name))) bad.push(k+' 提醒 '+J([s.from,s.name,s.msg,rm]));
      if(k>1&&S[k-2].c!==s.b) bad.push(k+' 回訪不是上一場的那個人'); }
    for(const r of ends){ const s=S.find(x=>x.k===+r[0]); if(!s||s.end!==r[1]) bad.push(r[0]+' 收尾 '+J([s&&s.end,r[1]])); }
    check('0a. 場次表四列、收尾四句逐字對 AA_604（日期、新個案、回訪＝上一場的人、提醒的人和字）',rows.length===4&&ends.length===4&&S.length===4&&!bad.length,bad.join(' ／ '));
    const open=(doc.split('\n').find(l=>/^（週六上午九點/.test(l))||'').trim(), miss=(/改一句旁白「(（[^」]+）)」/.exec(doc)||[])[1], all=(/＋一句「(（今天來的都是第一次來的人[^」]*）)」/.exec(doc)||[])[1];
    check('0b. 共同開頭、沒看過上一場的一句、八件都演過的一句（＝FAFU_LOG 第 1 句）照稿',STORY.FAFU_STORY_OPEN===open&&STORY.FAFU_STORY_BACK_MISS===miss&&STORY.FAFU_LOG[0]===all,J([open,miss,all]));
    const a4=(/雅筑學姊：「(上次那位太太[^」]*)」/.exec(doc)||[])[1], A=STORY.FAFU_STORY_AFTER4;
    check('0c. 第 4 場兩週以後（2028-11-04 22:00）雅筑學姊在法服群組那一則照稿',!!A&&A.text===a4&&A.name==='雅筑學姊'&&dayOf(S[3])+A.days===D('2028-11-04')&&A.h===22&&/2028-11-04 22:00/.test(doc),J([A,a4]));
    check('0d. 四場都是大二上、大二下、大三上、大四上第 7 週的週六（單週值班日）',S.map(s=>{ const t=CALENDAR.termOf(dayOf(s)); return t.id+'w'+t.week+'d'+CALENDAR.dateOf(dayOf(s)).wd; }).join()==='Y2S1w7d6,Y2S2w7d6,Y3S1w7d6,Y4S1w7d6'&&S.every(s=>STORY.fafuDuty({day:dayOf(s),flags:{},stage:'law'}))); });
  // ---------- 1 非社員 ----------
  await sec(1,async()=>{ let bad=[]; for(const s of S){ const d=dayOf(s); fresh(d-1,19,'dorm',{}); PHONE.join(H.G,'lawclub_study','法服');   /* 舊存檔只看過公告還在群組裡的，也不收 */
      at(d-1,20.5); rules(); at(d,8.67); rules(); if(OUT.get(H.G,'fafu_'+d)||grp().length) bad.push(s.k+' 有提醒或選單'); at(d,9.5,'wancai'); if(STORY.fafuStoryDue(H.G)) bad.push(s.k+' 可以演');
      const r=await sit([0]); if(H.G.flags['FAFU_STORY_'+s.k]!=null) bad.push(s.k+' 演了'); }
    check('1. 非社員：四場都沒有提醒（0 則）、沒有出發選單、坐不到那一場（0 場）',!bad.length,bad.join(' ')); });
  // ---------- 2 社員：四場都去 ----------
  await sec(2,async()=>{ member(dayOf(S[0])-1,19); const R0={bh:J(SOCIAL.rel('classmate_bohan')),sis:J(SOCIAL.rel('heroine_05'))};
    const res=[];
    for(const s of S){ const d=dayOf(s), n0=grp().length; at(d-1,19.9); rules(); const early=grp().length===n0; at(d-1,20.5); rules(); const m=grp().slice(n0);
      const q=OUT.get(H.G,'fafu_'+d); const okMsg=early&&m.length===1&&m[0].text===s.msg&&(s.name?m[0].name===s.name&&m[0].from===s.from:m[0].from==='classmate_bohan')&&m[0].h===20&&m[0].day===d-1;
      const okQ=!!q&&q.title==='法服值班（法律系館B一樓 9:00）'&&q.no==='這週請假'&&q.h===9&&q.goto&&q.goto.zone==='wancai';
      at(d,8.67); const dq=OUT.due(H.G); H.picks=['出發']; await OUT.prompt(GM,dq);
      const pk=[[0],[1],[2],[0]][s.k-1]; const {r,L:lines}=await sit(pk); const again=await STORY.fafuShift(GM);
      const ci=s.c, c=STORY.FAFU_CASES[ci], resp=[['雅筑學姊：好。先聽完。','（他講了十五分鐘。最重要的那一句，在最後。）'],['研究所學長：時間寫在最上面。對。'],['研究所學長：有的話，下次帶來，會快很多。'],['雅筑學姊：好。先聽完。','（他講了十五分鐘。最重要的那一句，在最後。）']][s.k-1];   /* 「你先問什麼？」三個選項各選一次（原本 fafuShift 的回應）*/
      const back=s.b!=null?[STORY.FAFU_BACK[s.b][0],'民眾：'+STORY.FAFU_BACK[s.b][1],STORY.FAFU_BACK[s.b][2]+'：'+STORY.FAFU_BACK[s.b][3]]:[];
      const want=[STORY.FAFU_STORY_OPEN].concat(back,['（'+c[0]+'。）','你先問什麼？'],resp,['民眾：'+c[1],c[2]+'：'+c[3],s.end]);
      res.push({k:s.k,okMsg,okQ,zone:H.G.zone,r,again,lines:J(lines)===J(want),opts:J(H.opts[0])===J(['「先請他從頭講一次。」','「先問什麼時候發生的。」','「先問手上有什麼資料。」']),hour:H.G.hour,flag:H.G.flags['FAFU_STORY_'+s.k]===d,seen:H.G.flags.FAFU_STORY_SEEN, want:J(want), got:J(lines)}); }
    for(const x of res) check('2. 第 '+x.k+' 場：前一天 20:00 法服群組一則（照稿）、出發選單（法服值班 9:00／這週請假）；到萬才館坐圓桌＝開頭'+(x.k>1?'→回訪（上一場那位）':'')+'→新個案→收尾；12:00；FAFU_STORY_'+x.k+'；SEEN＝'+x.k+'；同一天不能再演',
      x.okMsg&&x.okQ&&x.zone==='wancai'&&x.r===true&&x.again===false&&x.lines&&x.opts&&x.hour===12&&x.flag&&x.seen===x.k,x.lines?J({okMsg:x.okMsg,okQ:x.okQ,again:x.again,hour:x.hour,seen:x.seen}):x.got+' ≠ '+x.want);
    const mem=(H.G.social.mem.classmate_bohan||[]).filter(m=>m.tag==='FAFU_STORY').map(m=>m.note);
    check('2. 記憶 FAFU_STORY 每場一筆（柏翰；note＝那件個案）',J(mem)===J(S.map(s=>s.note)),J(mem));
    check('2. 不給關係數值（柏翰、學姊的關係不變；純劇情）',J(SOCIAL.rel('classmate_bohan'))===R0.bh&&J(SOCIAL.rel('heroine_05'))===R0.sis);
    const n4=grp().length; at(dayOf(S[3])+14,21.9); rules(); const pre=grp().length===n4; at(dayOf(S[3])+14,22.1); rules(); const a4=grp().slice(n4);
    check('2. 第 4 場（第 8 件太太）兩週以後 22:00 法服群組：雅筑學姊「上次那位太太，律師那一週她們全家都來了。坐下來講了。」',pre&&a4.length===1&&a4[0].text===STORY.FAFU_STORY_AFTER4.text&&a4[0].name==='雅筑學姊',J(a4.map(m=>m.text)));
    check('2. 去過一次（LAWCLUB_SAT_VISITS、FAFU_SHIFT_N 各 4）、careerLean A＝加入 2＋四場 4',H.G.flags.LAWCLUB_SAT_VISITS===4&&H.G.flags.FAFU_SHIFT_N===4&&STORY.careerLean(Object.assign(H.G,{stats:{study:0},vac:{reg:{}},courses:{grades:{}}})).A===6,J([H.G.flags.LAWCLUB_SAT_VISITS,STORY.careerLean(H.G)])); });
  // ---------- 3 錯過 ----------
  await sec(3,async()=>{ const s1=S[0], s2=S[1], s3=S[2]; member(dayOf(s1)-1,19); await goDay(s1); await sit([0]);
    const R0=J(SOCIAL.rel('classmate_bohan')), seen0=H.G.flags.FAFU_STORY_SEEN, lean0=STORY.careerLean(Object.assign(H.G,{stats:{study:0},vac:{reg:{}},courses:{grades:{}}})).A;
    const {q}=await goDay(s2,'這週請假'); const d2=dayOf(s2); const st=q&&OUT.get(H.G,q.id).state;
    const n=(H.G.msgs||[]).length; for(let d=d2;d<d2+21;d++) for(const h of [9.5,12.5,21]){ at(d,h); rules(); }
    const after=(H.G.msgs||[]).slice(n).filter(m=>m.th==='g:lawclub_study'||m.th==='p:classmate_bohan');
    check('3. 第 2 場選「這週請假」＝missed；之後三週沒有任何法服群組、柏翰的訊息（不追問）；SEEN、關係、careerLean 都不變（不扣分）',st==='missed'&&!after.length&&H.G.flags.FAFU_STORY_SEEN===seen0&&J(SOCIAL.rel('classmate_bohan'))===R0&&STORY.careerLean(H.G).A===lean0,J({st,after:after.map(m=>m.text)}));
    at(d2+14,9.5,'wancai'); check('3. 過了日期不補（第 2 場那天以後的值班週六坐圓桌＝一般的值班，不是那一場）',!STORY.fafuStoryDue(H.G)&&H.G.flags.FAFU_STORY_2==null);
    await goDay(s3); const {L:l3}=await sit([1]);
    check('3. 第 3 場：沒看過上一場＝回訪只剩一句「（上次來過的一位民眾又來了，學長去接。）」，接著第 7 件高中生',l3[0]===STORY.FAFU_STORY_OPEN&&l3[1]===STORY.FAFU_STORY_BACK_MISS&&l3[2]==='（'+STORY.FAFU_CASES[6][0]+'。）'&&!l3.some(t=>t===STORY.FAFU_BACK[3][0]),J(l3.slice(0,3))); });
  // ---------- 4 人在國外 ----------
  await sec(4,async()=>{ const s4=S[3], d=dayOf(s4); member(d-1,19,{},'US'); at(d-1,20.5); rules(); at(d,8.67); rules();
    const a=!OUT.get(H.G,'fafu_'+d)&&!grp().some(m=>m.text===s4.msg)&&STORY.abroad(H.G); at(d,9.5); const b=!STORY.fafuStoryDue(H.G);
    member(d-1,19,{},'JP'); at(d-1,20.5); rules(); const c=!!OUT.get(H.G,'fafu_'+d);
    check('4. 美國路線大四上人在國外：第 4 場沒有提醒、沒有出發選單、不能演；日本路線（8/5 回來）照排',a&&b&&c,J([a,b,c])); });
  // ---------- 5 SEEN ≤4 ----------
  await sec(5,async()=>{ const s2=S[1], d=dayOf(s2); member(d,9.5,{FAFU_STORY_SEEN:4,FAFU_STORY_1:1}); at(d,9.5,'wancai'); const {r}=await sit([0]);
    check('5. FAFU_STORY_SEEN 最多 4（已經 4、又演一場＝還是 4）',r===true&&H.G.flags.FAFU_STORY_SEEN===4,J(H.G.flags.FAFU_STORY_SEEN)); });
  // ---------- 6 舊存檔 ----------
  await sec(6,async()=>{ const s1=S[0], s2=S[1], s3=S[2];
    member(dayOf(s2)-1,19,{FAFU_STORY_1:dayOf(s1),FAFU_STORY_SEEN:1,FAFU_STORY_REC:{c:{1:1},b:[]},FAFU_ROT:{open:5,cs:5,stay:0,yt:0,bh:0,bk:0,lg:0}}); await goDay(s2); const {L:l2}=await sit([2]);
    const ok2=l2[1]===STORY.FAFU_BACK[1][0]&&l2[4]==='（'+STORY.FAFU_CASES[5][0]+'。）'&&H.G.flags.FAFU_STORY_REC.c[2]===5;
    await goDay(s3); const {L:l3}=await sit([2]);
    const ok3=l3[1]===STORY.FAFU_BACK[5][0]&&l3[4]==='（'+STORY.FAFU_CASES[6][0]+'。）';
    check('6a. 舊存檔第一輪已經演過 5 件（FAFU_ROT.cs 5）：第 2 場的第 4 件演過＝換第 6 件（替媽媽來的女兒），回訪照第 1 場的阿姨；第 3 場的回訪＝那位女兒（照同一人）',ok2&&ok3,J([l2.slice(0,5),l3.slice(0,5)]));
    member(dayOf(s2)-1,19,{FAFU_ROT:{open:6,cs:12,stay:0,yt:0,bh:0,bk:4,lg:0}}); await goDay(s2); const {L:la}=await sit([0]);
    check('6b. 八件都演過的舊存檔：只演開頭、「（今天來的都是第一次來的人，學長一個一個接。你把紀錄抄完。）」、收尾（沒有回訪、沒有「你先問什麼？」）',J(la)===J([STORY.FAFU_STORY_OPEN,STORY.FAFU_LOG[0],s2.end])&&H.G.flags.FAFU_STORY_REC.c[2]===-1&&H.G.flags.FAFU_STORY_SEEN===1,J(la));
    member(dayOf(s1)+8,10,{}); delete H.G.flags.FAFU_STORY_SEEN; delete H.G.flags.FAFU_PURE; STORY.fafuMigrate(H.G); for(let d=dayOf(s1)+8;d<dayOf(s1)+30;d++){ at(d,21); rules(); }
    check('6c. 第 1 場的日期過了才讀進來（舊存檔）：不補提醒、不補選單、不能演；SEEN＝0',!OUT.get(H.G,'fafu_'+dayOf(s1))&&!grp().some(m=>m.text===s1.msg)&&H.G.flags.FAFU_STORY_SEEN===0&&H.G.flags.FAFU_STORY_1==null); });
  // ---------- 7 自己走進去坐圓桌 ----------
  await sec(7,async()=>{ const s1=S[0]; member(dayOf(s1)-1,19); await goDay(s1); await sit([0]);
    const w=TD('Y2S1',11,6); at(w,9.5,'wancai'); const {L:a}=await sit([1,1]); at(TD('Y2S1',13,6),9.5,'wancai'); const {L:b}=await sit([1,1]);
    const has=(Ls,i)=>Ls.includes('（'+STORY.FAFU_CASES[i][0]+'。）');
    check('7a. 第 1 場演過第 2 件阿姨：之後自己走進去坐圓桌＝第 1 件、第 3 件（跳過阿姨，不重複）',has(a,0)&&has(b,2)&&!has(a,1)&&!has(b,1),J([a.find(t=>/^（一/.test(t)),b.find(t=>/^（一/.test(t))]));
    member(dayOf(S[1])-1,19,{FAFU_STORY_1:dayOf(s1),FAFU_STORY_2:dayOf(S[1]),FAFU_STORY_SEEN:2,FAFU_STORY_REC:{c:{1:1,2:3},b:[1]},FAFU_ROT:{open:6,cs:8,stay:0,yt:0,bh:0,bk:0,lg:0}}); at(TD('Y2S2',11,6),9.5,'wancai'); const {L:c}=await sit([1,1]);
    check('7b. 第二輪（回訪）：固定場次演過的回訪（阿姨）跳過＝從第 1 位的大學生開始，第 2 位阿姨不再演',c.includes(STORY.FAFU_BACK[0][0])&&!c.includes(STORY.FAFU_BACK[1][0])&&H.G.flags.FAFU_ROT.bk===1,J(c.slice(0,3)));
    at(TD('Y2S2',13,6),9.5,'wancai'); const {L:d}=await sit([1,1]); check('7b. 再下一次：跳過阿姨＝第 3 位冰箱先生',d.includes(STORY.FAFU_BACK[2][0])&&!d.includes(STORY.FAFU_BACK[1][0]),J(d.slice(0,3))); });
  // ---------- 8 careerLean ----------
  await sec(8,async()=>{ const G=member(dayOf(S[0])-1,19); Object.assign(G,{stats:{study:0},vac:{reg:{}},courses:{grades:{}}}); const a0=STORY.careerLean(G).A;
    await goDay(S[0]); await sit([0]); const a1=STORY.careerLean(G).A; await goDay(S[1],'這週請假'); const a2=STORY.careerLean(G).A; G.flags.LAWCLUB_SAT_VISITS=30; const a3=STORY.careerLean(G).A;
    check('8. careerLean：加入 2；看過 1 場＝3；錯過第 2 場照舊 3（不扣）；週六去過 30 次也一樣',a0===2&&a1===3&&a2===3&&a3===3,J([a0,a1,a2,a3])); });
  // ---------- 9 溫州街線同一天 ----------
  await sec(9,async()=>{ const s1=S[0], d=dayOf(s1); if(typeof WZL==='undefined'){ check('9. 溫州街線載得到',false); return; }
    member(TD('Y2S1',6,2),21,{WZ_COPY_LEASE:1,WZ_C_L1:TD('Y2S1',6,2)}); WZL.phone(H.G); const R=H.G.flags.WZ_LINE_L;
    at(d-1,20.5); rules(); at(d,7); rules(); const q=OUT.get(H.G,'fafu_'+d), n=(H.G.outings||[]).filter(x=>x.day===d&&x.h===9).length;
    check('9. 溫州街線 1-3 那天＝法服第 1 場那天（10/24）：只有一個出發選單，標題照溫州街線「法服值班（今天陪阿德）」',!!R&&R.day===d&&!!q&&q.title==='法服值班（今天陪阿德）'&&n===1,J([R,q&&q.title,n]));
    at(d,8.67); H.picks=['出發']; await OUT.prompt(GM,OUT.due(H.G)); H.said=[]; WZL.tick(GM); for(let i=0;i<30&&WZL.playing;i++) await new Promise(r=>setTimeout(r,0));
    const wz=H.G.flags.WZ_COPY_LEASE===2; const {r,L:l}=await sit([0]);
    check('9. 到萬才館：阿德那一場先演（WZ_COPY_LEASE 2），坐圓桌＝法服第 1 場照演；那天去過只算一次（LAWCLUB_SAT_VISITS 1）',wz&&r===true&&l[0]===STORY.FAFU_STORY_OPEN&&H.G.flags.FAFU_STORY_1===d&&H.G.flags.LAWCLUB_SAT_VISITS===1,J([wz,r,l[0],H.G.flags.LAWCLUB_SAT_VISITS])); });
  // ---------- 10 SQ02 ----------
  await sec(10,async()=>{ if(typeof SIDEQ==='undefined'||!SIDEQ.planFafu){ check('10. sideq3d.js 載得到',false); return; } const d0=D('2026-10-05');
    member(d0,15); const r1={day:d0,state:'open'}; SIDEQ.planFafu(H.G,r1); const q1=(H.G.outings||[]).find(x=>x.ev==='ev_sq02_fafu');
    fresh(d0,15,'dorm',{}); const r2={day:d0,state:'open'}; SIDEQ.planFafu(H.G,r2); const q2=(H.G.outings||[]).find(x=>x.ev==='ev_sq02_fafu');
    member(d0,15,{FAFU_STORY_1:1,FAFU_STORY_SEEN:1}); const r3={day:d0,state:'open'}; SIDEQ.planFafu(H.G,r3); const q3=(H.G.outings||[]).find(x=>x.ev==='ev_sq02_fafu');
    check('10. SQ02：社員避開法服第 1 場（10/24）排到下一個值班週六（11/21）；不是社員、或那一場已經演過＝照舊 10/24',!!q1&&q1.day===TD('Y2S1',11,6)&&r1.fafuDay===q1.day&&!!q2&&q2.day===dayOf(S[0])&&!!q3&&q3.day===dayOf(S[0]),J([q1&&keyOf(q1.day),q2&&keyOf(q2.day),q3&&keyOf(q3.day)])); });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
