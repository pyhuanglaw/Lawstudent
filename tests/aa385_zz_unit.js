// AA_385（企劃線 028dc128，AA 2026-10-22 09:31 回 LAWWW 09:25）：芷若×子晴（AA_232）實作後七題——不需要瀏覽器。
//   0 讀稿逐字（每一句新台詞都在 AA_385 裡）、白名單（AA_385@028dc128、AA_232@088556ed、兩個階梯檔@088556ed，舊版本在 history）
//   1 4-4 結局 C 那一句「……可是我九月要去英國了。」（後兩句照舊）
//   2 結局 C、芷若選了方奕廷：尾聲子晴那一句後面多一句旁白；芷若、奕廷照 zr.fy、fy.zr；CG 以後不加；英國版、非方奕廷版照舊；奕廷不在那一桌＝不加旁白
//   3 閒聊階梯：大一下子晴 Q2-L3 的 4-1 第 5 句（認識芷若／「我室友」、4-2 以後、還沒在一起、沒和祐廷交往過、只說一次、記 ZQ_ZR_FILM_DAY）；
//     ZZ_DATING 旗標跟著狀態；大一上 NO_DATE_ZZ、大一下 NO_ZZ_YET 加 ZZ_DATING（大一上也加「4-2 以後不說」）；階梯照白名單匯入
//   4 其中一人自己告訴祐廷（ZZ_TOLD_YT）：找她說話時先演、演完照常閒聊；芷若在吧檯上班也一樣（演完照常點餐）；誰先遇到誰講、只講一次；條件
//   5 4-6 祐廷在場的那一則改到公館宵夜（22:00～24:00；原本臺灣凌晨四點）
//   6 互斥：她們交往中只擋 L2／L3（校外約會、告白），吃飯、散步、一盞照常；婉拒用系統現成的句子；別人的伴侶照舊擋
//   7 日本路線：芷若婉拒方奕廷改回國以後在 Café 當面說（8/5～9/1，同 AA_296 ⑤），第一句加「你不在的時候，」；訊息版拿掉（舊存檔收到的照算、排著的收回）
// 修改前（開發分支 3740c127）：30 項 FAILED 24（通過的 6 項是對照：讀得到稿、英國版／非方奕廷版／B 的尾聲、旁白不加的兩種、4-1 第 5 句不說的四種、校外約會照擋、別人的伴侶照擋）。用法：node tests/aa385_zz_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|DATE|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES|VAC|VAC_DATA|R2Y3B|R2Y3B_EVENTS|POSTGRAD_LINES|PG|SYLLABUS|ZRZQ|ZRZQ_LINES|ZRZQ_EVENTS|ZRZQ_TOLINES|ZRZQ_FILM)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/data/postgrad_lines.js','src/postgrad3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/zrzq_events.js','src/zrzq3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const chk=async(name,fn)=>{ let r; try{ r=await fn(); }catch(e){ return check(name,false,'例外：'+(e&&e.message||e)); } if(Array.isArray(r)) check(name,!!r[0],r[1]); else check(name,!!r); };
let said=[], opts=[], picks=[], G=null, entered=[], caps=[];
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
/* 選項：picks 裡第一個對得上的字就選那一個（用掉）；都對不上＝「就這樣」（當面約的選單）或第一個 */
const GM={get G(){ return G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z,sp)=>{ entered.push([z,sp]); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t:String(t)}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(T); for(let p=0;p<picks.length;p++){ const k=T.findIndex(t=>t.includes(picks[p])); if(k>=0){ picks.splice(p,1); return k; } } const j=T.indexOf('就這樣'); return j>=0?j:0; }};
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[],courses:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; entered=[]; caps=[]; GM.npc={}; E.npcs=[]; E.player.busy=false; ADV.active=false; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const both=lv=>{ R('heroine_02',lv); R('heroine_04',lv); };
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const zz=o=>{ const Z=ZRZQ.rec(G); Object.assign(Z,o||{}); G.flags.ZZ_STATE=Z.state; return Z; };
const tick=async()=>{ said=[]; opts=[]; entered=[]; STORY.phoneRules(GM); PHONE.tick(G); const r=ZRZQ.tick(GM); if(r) await ZRZQ._p; return r; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const txt=()=>said.map(s=>s.t), has=t=>said.some(s=>s.t===t), idx=t=>said.findIndex(s=>s.t===t);
const L=typeof ZRZQ_LINES!=='undefined'?ZRZQ_LINES:null;
const exp=arr=>ZRZQ_TOLINES(arr).map(l=>l.text.replace(/\{name\}/g,'祐廷'));
const seq=arr=>{ const want=exp(arr), got=txt(); for(let i=0;i+want.length<=got.length;i++) if(want.every((w,k)=>got[i+k]===w)) return true; return false; };   /* 一整段照順序連著出現 */
const show=(refs,p)=>{ for(const r of refs){ try{ return cp.execSync('git show "'+r+':'+p+'"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<26}); }catch(e){} } return null; };
const A385=show(['028dc128'],'docs/story_planning/AA_385_芷若子晴_實作後七題.md');
const A232=show(['088556ed'],'docs/story_planning/AA_232_芷若子晴_摯友到戀人_核對與台詞.md');
const LJ=p=>{ const s=show(['088556ed'],'docs/story_planning/ladder/'+p); return s?JSON.parse(s):null; };
const ZR='heroine_02', ZQ='heroine_04', FY='npc_fangyt';
const WHO={zr:'芷若',zq:'子晴'};
const datingZZ=o=>zz(Object.assign({state:'dating',since:0,datingDay:D('2026-06-05'),datingTerm:'Y1S2',lastDay:D('2026-06-05')},o||{}));
const npcOf=(id,o)=>Object.assign({charId:id,name:'',talkLabel:'',obj:{position:{x:0,y:0,z:0},rotation:{y:0}},pose:'idle'},o||{});
const stepOf=(term,who,id)=>((LADDER.byTerm[term]||{})[who]||{steps:[]}).steps.find(s=>s.id===id)||null;

(async()=>{
  /* ===================== 0 讀稿、白名單 ===================== */
  await chk('0. 稿讀得到：AA_385@028dc128（第 1～8 項＋第 9 節）、AA_232@088556ed（跟著改的版本）',()=>[!!A385&&/## 7\. 日本路線/.test(A385)&&/## 9\./.test(A385)&&!!A232&&A232.includes('……可是我九月要去英國了。'),'']);
  await chk('0. 新台詞每一句都在 AA_385 裡（4-4 那一句、選奕廷的旁白、自己告訴祐廷的兩組＋選項＋回答、4-6 宵夜那五句、日本路線那四句）',()=>{
    if(!A385||!L) return [false,'讀不到稿']; const bad=[]; const say=(w,t)=>{ const lab=WHO[w.slice(0,2)]; const ok=lab?A385.includes(lab+'「'+t+'」'):(A385.includes('旁白「'+t+'」')||A385.includes('「'+t+'」')); if(!ok) bad.push(w+' '+t); };
    if(!A385.includes('改：「'+L.SERIOUS.HELD[0][1]+'」')) bad.push('HELD[0]'); for(const [w,t] of L.SERIOUS.HELD.slice(1)) if(!A385.includes('「'+t+'」')) bad.push('HELD '+t);
    if(!A385.includes('「'+L.END.C_FY+'」')) bad.push('C_FY');
    for(const k of ['zr','zq']){ const T=L.TOLD&&L.TOLD[k]; if(!T){ bad.push('TOLD.'+k); continue; } for(const [w,t] of T.lines) say(w,t);
      for(const [o,rep] of T.opts){ const [w,t]=rep[0]; if(!A385.includes(o+'→ '+WHO[w]+'「'+t+'」')) bad.push('opt '+o); } }
    for(const [w,t] of L.UK[0]) say(w,t);
    for(const [w,t] of (L.F3_TOLD_JP||[])) say(w,t);
    return [!bad.length&&!!L.F3_TOLD_JP&&L.F3_TOLD_JP.length===4,bad.join('；')]; });
  await chk('0. 不重複另寫：日本路線那四句只有第一句不同（「你不在的時候，」＋臺灣那一版），其他三句和第三節一字不差；訊息版（F3_TOLD_MSG）拿掉了',()=>{
    const P=L.F3_TOLD_JP||[], T=L.F3_TOLD; return [P.length===4&&P[0][1]==='你不在的時候，'+T[0][1]&&J(P.slice(1))===J(T.slice(1))&&L.F3_TOLD_MSG===undefined,''] });
  await chk('0. 白名單：AA_385@028dc128（kind text）、AA_232@088556ed（afebee54 在 history）、ladder_bb.json@088556ed（49ed7e6a 在 history）、ladder_bb_y1s2.json@088556ed（2e255e9a 在 history）',()=>{
    const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, f=p=>A.filter(e=>e.path===p);
    const a385=f('docs/story_planning/AA_385_芷若子晴_實作後七題.md'), a232=f('docs/story_planning/AA_232_芷若子晴_摯友到戀人_核對與台詞.md'), lb=f('docs/story_planning/ladder/ladder_bb.json'), l2=f('docs/story_planning/ladder/ladder_bb_y1s2.json');
    const hist=(e,s)=>!!e&&(e.history||[]).some(h=>h.sha===s);
    const ok=a385.length===1&&a385[0].sha==='028dc128'&&a385[0].status==='approved'&&a385[0].kind==='text'&&!!a385[0].approvedBy
      &&a232.length===1&&a232[0].sha==='088556ed'&&hist(a232[0],'afebee54')&&lb.length===1&&lb[0].sha==='088556ed'&&hist(lb[0],'49ed7e6a')&&l2.length===1&&l2[0].sha==='088556ed'&&hist(l2[0],'2e255e9a');
    return [ok,J({a385:a385.map(e=>e.sha),a232:a232.map(e=>e.sha),lb:lb.map(e=>e.sha),l2:l2.map(e=>e.sha)})]; });
  await chk('0. tests/zrzq_line_unit.js 對 AA_232@088556ed（不是 afebee54）',()=>{ const t=fs.readFileSync(path.join(ROOT,'tests/zrzq_line_unit.js'),'utf8'); return [/const SPEC=show\(\['088556ed'/.test(t)&&!/afebee54/.test(t),'']; });

  /* ===================== 1 4-4 結局 C 那一句 ===================== */
  await chk('1. 大二下 6/4（她出國前、最後一個班以後）4-4「那就先這樣」：芷若「……可是我九月要去英國了。」，子晴「我知道。」「那就先這樣。妳回來再說。」照舊；沒有「下個月」',async()=>{
    fresh('2027-06-04',14.6,'campus'); both('FAM'); zz({state:'mutual_interest',since:0,lastDay:D('2027-04-29')}); await tick();
    return [has('……可是我九月要去英國了。')&&seq([['zr','……可是我九月要去英國了。'],['zq','我知道。'],['zq','那就先這樣。妳回來再說。']])&&!txt().some(t=>/下個月/.test(t))&&G.flags.ZZ.state==='held',J(txt().slice(-8))]; });

  /* ===================== 2 結局 C、芷若選了方奕廷 ===================== */
  const epi=async(setup)=>{ fresh('2034-06-03',18,'dorm',{FIRST_DAY_SEEN:true}); PG.rec(G).done.first=1; setup(); said=[]; await PG.runStep(GM,PG.byId('epi')); return txt(); };
  const fyHeld=()=>zz({state:'held',held:'fy',fy:'seeing',f3:'first',since:0});
  await chk('2. 尾聲（結局 C、芷若看完電影選了方奕廷）：子晴那一句後面緊接著「（芷若和奕廷坐在一起。……芷若沒有阻止她。）」；CG 以後不再加 C 那一行',async()=>{
    const t=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); R(FY,'FAM'); fyHeld(); });
    const zq=POSTGRAD_LINES.EPI.zq.nine, i=t.indexOf(zq[zq.length-1]);
    return [i>=0&&t[i+1]===L.END.C_FY&&t.filter(x=>x===L.END.C_FY).length===1&&!t.includes(L.END.C)&&!t.includes(L.END.C_UK)&&G.flags.ZZ.ending==='C',J(t.slice(Math.max(0,i-3),i+3))]; });
  await chk('2. 同一場：芷若、奕廷照他們自己那一版（zr.fy「（他去倒水的時候）…」、fy.zr「我下個月調回台北。」「她說戲院週末缺一個人顧門口。」）；存檔的 ZR_FY 不改',async()=>{
    const t=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); R(FY,'FAM'); fyHeld(); });
    const E=POSTGRAD_LINES.EPI;
    return [E.zr.fy.every(x=>t.includes(x))&&E.fy.zr.every(x=>t.includes(x))&&!E.zr.main.some(x=>t.includes(x))&&!E.fy.base.some(x=>t.includes(x))&&!('ZR_FY' in G.flags),J(t.filter(x=>/戲院|倒水|山上/.test(x)))]; });
  await chk('2. 對照：英國那一版（held uk，就算之後 F3 照原本的方奕廷路線）＝「她回來再說」、沒有新旁白；非方奕廷的 C＝第七節第 5 點那一行；結局 B＝明信片',async()=>{
    const a=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); R(FY,'FAM'); zz({state:'held',held:'uk',fy:'seeing',since:0}); });
    const b=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); R(FY,'FAM'); zz({state:'mutual_interest',since:0}); });
    const c=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); zz({state:'dating',since:0}); });
    return [a.includes(L.END.C_UK)&&!a.includes(L.END.C_FY)&&b.includes(L.END.C)&&!b.includes(L.END.C_FY)&&c.includes(L.END.B)&&!c.includes(L.END.C_FY),J({a:a.includes(L.END.C_UK),b:b.includes(L.END.C),c:c.includes(L.END.B)})]; });
  await chk('2. 旁白寫的是三個人坐在一起：奕廷不在那一桌（祐廷和他不熟）＝不加；芷若是祐廷的前任（在店的另一頭）＝不加',async()=>{
    const a=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); fyHeld(); });
    const b=await epi(()=>{ R(ZR,'FAM'); R(ZQ,'FAM'); R(FY,'FAM'); G.flags.EX_heroine_02=true; fyHeld(); });
    return [!a.includes(L.END.C_FY)&&!b.includes(L.END.C_FY),J({a:a.includes(L.END.C_FY),b:b.includes(L.END.C_FY)})]; });

  /* ===================== 3 閒聊階梯 ===================== */
  await chk('3. ZZ_DATING 跟著狀態（每一輪 S.sync）：交往中＝true、其他＝false；舊存檔沒有這個旗標＝第一次跑到時補',()=>{
    fresh('2026-09-10',12,'campus'); both('FAM'); datingZZ(); delete G.flags.ZZ_DATING; rules(); const a=G.flags.ZZ_DATING===true;
    zz({state:'mutual_interest'}); rules(); const b=G.flags.ZZ_DATING===false;
    fresh('2026-09-10',12,'campus'); rules(); const c=G.flags.ZZ_DATING===false&&G.flags.ZZ_STATE==='friends';
    return [a&&b&&c,J({a,b,c})]; });
  await chk('3. 匯入的階梯和企劃線 088556ed 一樣：大一下子晴 Q2-L3 的 extraIf（4-1 第 5 句兩版）、大一上 NO_DATE_ZZ／大一下 NO_ZZ_YET 都有 ZZ_DATING',()=>{
    const J1=LJ('ladder_bb_y1s2.json'), J0=LJ('ladder_bb.json'); if(!J1||!J0) return [false,'讀不到企劃線的階梯檔'];
    const st=stepOf('Y1S2',ZQ,'Q2-L3'), src=J1.characters[ZQ].steps.find(s=>s.id==='Q2-L3');
    const ex=x=>J(((x&&x.extraIf)||[]).map(e=>({if:e.if,unless:e.unless,mem:e.mem,lines:e.lines})));
    const zzIf=chars=>{ let n=0, bad=0; for(const id of [ZR,ZQ]) for(const s of ((chars[id]||{}).steps||[])) for(const e of [...(s.extraIf||[]),...(s.linesIf||[])]){ const c=e.if||{}; if((c.notFlags||[]).includes('dating_heroine_02')){ n++; if(!(c.notFlags||[]).includes('ZZ_DATING')) bad++; } } return {n,bad}; };
    const y1=zzIf(LADDER.byTerm.Y1S1), y2=zzIf(LADDER.byTerm.Y1S2);
    const notEv=LADDER.byTerm.Y1S1[ZR].steps.filter(s=>(s.extraIf||[]).some(e=>(e.if||{}).notFlags&&(e.if.notFlags||[]).includes('ZZ_DATING')&&(e.if.notEvents||[]).includes('ev_zz_home_together'))).length;
    return [!!st&&ex(st)===ex(src)&&(st.extraIf||[]).length===2&&y1.n>=6&&!y1.bad&&y2.n>=6&&!y2.bad&&notEv>=2,J({y1,y2,notEv,ex:ex(st).slice(0,120)})]; });
  const ladAt=(flags,setup)=>{ fresh('2026-03-20',15,'campus',flags||{}); R(ZQ,'FAM'); if(setup) setup(); rules(); const st=stepOf('Y1S2',ZQ,'Q2-L3'); return {st,L:STORY.ladLines(st,G,ZQ)}; };
  const L5=['……芷若這禮拜跟她們系上的人去看了電影。','幹嘛，我又沒怎樣。'], L5b=['……我室友這禮拜跟她們系上的人去看了電影。','幹嘛，我又沒怎樣。'];
  const tail=(arr,n)=>J(arr.slice(-n).map(x=>typeof x==='string'?x:x.t));
  await chk('3. 4-1 第 5 句：4-2 演過、還沒在一起、兩個都沒和祐廷交往過＝Q2-L3 自己系上的話後面多這兩句；還不認識芷若＝「我室友」那一版',()=>{
    const a=ladAt({},()=>{ R(ZR,'FAM'); zz({state:'feelings_emerging',since:0}); G.events.done.ev_zz_home_together=1; });
    const b=ladAt({},()=>{ zz({state:'feelings_emerging',since:0}); G.events.done.ev_zz_home_together=1; });
    const own=a.st.lines;
    return [tail(a.L,2)===J(L5)&&J(a.L.slice(0,own.length))===J(own)&&tail(b.L,2)===J(L5b),J({a:a.L,b:b.L})]; });
  await chk('3. 4-1 第 5 句不說：4-2 還沒演、她們已經在一起（ZZ_DATING）、其中一人和祐廷交往中或交往過（dating_／EX_）',()=>{
    const r=[ladAt({},()=>{ R(ZR,'FAM'); zz({state:'friends',since:0}); }),
      ladAt({},()=>{ R(ZR,'FAM'); datingZZ(); G.events.done.ev_zz_home_together=1; }),
      ladAt({EX_heroine_04:true},()=>{ R(ZR,'FAM'); zz({state:'feelings_emerging',since:0}); G.events.done.ev_zz_home_together=1; }),
      ladAt({dating_heroine_02:true},()=>{ R(ZR,'FAM'); zz({state:'feelings_emerging',since:0}); G.events.done.ev_zz_home_together=1; })];
    return [r.every(x=>!x.L.includes(L5[0])&&!x.L.includes(L5b[0])),J(r.map(x=>x.L.length))]; });
  await chk('3. 只說一次：播了這一層＝子晴記 ZQ_ZR_FILM_DAY（人物頁有中文名稱），之後同一層不再多這兩句',async()=>{
    const a=ladAt({},()=>{ R(ZR,'FAM'); zz({state:'feelings_emerging',since:0}); G.events.done.ev_zz_home_together=1; }); said=[];
    await STORY.ladPlay(GM,{name:'高子晴',charId:ZQ},ZQ,a.st); const heard=has(L5[0])&&SOCIAL.has(ZQ,'ZQ_ZR_FILM_DAY'); const again=STORY.ladLines(a.st,G,ZQ);
    return [heard&&!again.includes(L5[0])&&!!SOCIAL.MEMORY_LABEL.ZQ_ZR_FILM_DAY,J({heard,again:again.length,label:SOCIAL.MEMORY_LABEL.ZQ_ZR_FILM_DAY})]; });
  await chk('3. 大一上的鋪陳句（芷若 Z-L4 子晴週三沒來）：4-2 以後、她們交往中都不說；之前照常',()=>{
    const go=f=>{ fresh('2025-10-20',15,'cafe'); both('FAM'); f(); rules(); const st=LADDER.byTerm.Y1S1[ZR].steps.find(s=>(s.extraIf||[]).some(e=>e.mem==='ZR_ZQ_SETUP_DOOR')); return STORY.ladLines(st,G,ZR).some(t=>/這禮拜三她沒來/.test(typeof t==='string'?t:t.t)); };
    const a=go(()=>zz({state:'friends',since:0})), b=go(()=>{ zz({state:'friends',since:0}); G.events.done.ev_zz_home_together=1; }), c=go(()=>datingZZ());
    return [a&&!b&&!c,J({a,b,c})]; });

  /* ===================== 4 其中一人自己告訴祐廷 ===================== */
  const zqTalk=async(o)=>{ o=o||{}; fresh(o.day||'2026-09-21',o.h||15,o.zone||'campus',o.flags||{}); R(ZR,o.zr||'FRI'); R(ZQ,o.zq||'FRI'); datingZZ(o.zz); if(o.setup) o.setup(); rules(); said=[]; opts=[]; picks=(o.picks||[]).slice();
    await STORY.talkCharacter(o.id||ZQ,npcOf(o.id||ZQ,o.npc)); return txt(); };
  await chk('4. 子晴（交往中、祐廷還不知道、朋友以上）：找她說話先演「欸，跟你講一件事。」「我跟芷若在一起了。……」，選項「恭喜。」／「真的假的？」，選「真的假的？」＝「真的啦。你很煩耶。」；演完照常閒聊',async()=>{
    const t=await zqTalk({picks:['真的假的']}); const T=L.TOLD.zq;
    const i=idx(T.lines[0][1]), ok=i===0&&t[1]===T.lines[1][1]&&J(opts[0])===J(['「恭喜。」','「真的假的？」'])&&t[2]==='真的啦。你很煩耶。'&&!t.includes('謝啦。……先不要跟阿凱講，我要自己講。')&&t.length>3;
    return [ok,J({t,opts})]; });
  await chk('4. 講完＝記在子晴（ZZ_TOLD_YT，人物頁有名稱）、祐廷知道（confirmed）、人物頁兩人各一條；4-7 就不演；下一次說話不再講；芷若也不再講（只講一次）',async()=>{
    await zqTalk({picks:['恭喜']}); const a=has('謝啦。……先不要跟阿凱講，我要自己講。')&&SOCIAL.has(ZQ,'ZZ_TOLD_YT')&&!SOCIAL.has(ZR,'ZZ_TOLD_YT')&&G.flags.ZZ.yt==='confirmed'&&SOCIAL.has(ZR,'ZR_WITH_ZQ')&&SOCIAL.has(ZQ,'ZQ_WITH_ZR')&&!!SOCIAL.MEMORY_LABEL.ZZ_TOLD_YT;
    at('2026-09-25',14.6); const b=!ZRZQ.next(G); said=[]; await STORY.talkCharacter(ZQ,npcOf(ZQ)); const c=!has(L.TOLD.zq.lines[0][1]); said=[]; await STORY.talkCharacter(ZR,npcOf(ZR)); const d=!has(L.TOLD.zr.lines[0][1]);
    return [a&&b&&c&&d,J({a,b,c,d})]; });
  await chk('4. 芷若先遇到（在外面）：「跟你說一件事。」「我跟子晴在一起了。……她說要自己講，我想說，我先講好了。」，選「我好像早就知道了。」＝「（笑）她也說你一定知道。」；之後子晴不再講',async()=>{
    const t=await zqTalk({id:ZR,day:'2026-10-12',zone:'wenzhou',picks:['早就知道']}); const T=L.TOLD.zr; const a=t[0]===T.lines[0][1]&&t[1]===T.lines[1][1]&&J(opts[0])===J(['「恭喜。」','「我好像早就知道了。」'])&&t[2]==='（笑）她也說你一定知道。'&&SOCIAL.has(ZR,'ZZ_TOLD_YT');
    said=[]; await STORY.talkCharacter(ZQ,npcOf(ZQ)); return [a&&!has(L.TOLD.zq.lines[0][1]),J({t,opts})]; });
  await chk('4. 芷若在 Café 吧檯上班（店員）：她的事件先（那天第一次是「兩點半的店員」點餐，現有的）；之後找她＝一樣先講，演完照常點餐（點餐的選單）',async()=>{
    const cool=()=>{ G.flags.CAFE_VISITS=6; G.events.done.ev_cafe_barista_zhiruo=1; G.events.last.ev_cafe_barista_zhiruo=G.day; };
    fresh('2026-10-13',20,'cafe',{CAFE_VISITS:6}); R(ZR,'FRI'); R(ZQ,'FRI'); datingZZ(); rules(); const first=EVENTS.check(STORY_EVENTS.find(e=>e.id==='ev_cafe_barista_zhiruo'))&&ZRZQ.toldDue(G,ZR);
    const t=await zqTalk({id:ZR,day:'2026-10-13',h:20,zone:'cafe',npc:{staff:'cafe'},setup:cool,picks:['恭喜','不用了']});
    return [first&&t[0]===L.TOLD.zr.lines[0][1]&&has('謝謝。……她知道我先講，一定會生氣。')&&opts.length>=2&&opts[1].includes('不用了')&&SOCIAL.has(ZR,'ZZ_TOLD_YT'),J({first,t,opts})]; });
  await chk('4. 不講：只是有點熟（FAMILIAR）、還沒在一起（mutual_interest）、祐廷已經知道（4-7 演過＝confirmed）、兩人一起被祐廷傷害過（ZQ_ZR_ENDED_DAY）、祐廷不認識芷若',async()=>{
    const r=[];
    r.push(await zqTalk({zq:'FAM'}));
    r.push(await zqTalk({zz:{state:'mutual_interest'}}));
    r.push(await zqTalk({zz:{yt:'confirmed'}}));
    r.push(await zqTalk({flags:{ZQ_ZR_ENDED_DAY:D('2025-12-01')}}));
    r.push(await zqTalk({setup:()=>{ const m=G.social.mem[ZR]; if(m) G.social.mem[ZR]=m.filter(x=>x.tag!=='FIRST_MET'); }}));
    return [r.every(t=>!t.includes(L.TOLD.zq.lines[0][1]))&&!SOCIAL.has(ZQ,'ZZ_TOLD_YT'),J(r.map(t=>t.slice(0,1)))]; });
  await chk('4. 接線：talkCharacter 在一般說話（說話前面）和吧檯店員（點餐前面）都問 ZRZQ.preTalk',()=>{
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), tc=st.slice(st.indexOf('S.talkCharacter=async function'),st.indexOf('let GM_ref=null'));
    const a=tc.indexOf("n.staff==='cafe'&&typeof ZRZQ!=='undefined'&&ZRZQ.preTalk) await ZRZQ.preTalk(GM_ref,id,{scene:true})"), b=tc.indexOf("n.staff==='cafe'){ await counter("), c=tc.indexOf("(id==='heroine_02'||id==='heroine_04')&&typeof ZRZQ!=='undefined'&&ZRZQ.preTalk) await ZRZQ.preTalk(GM,id)"), d=tc.indexOf('S.ladderTalk(GM,who,id)');
    return [a>0&&b>a&&c>b&&d>c,J([a,b,c,d])]; });

  /* ===================== 5 4-6 改宵夜 ===================== */
  await chk('5. 4-6 祐廷在場那一則：芷若在英國、交往中，祐廷和子晴在公館的宵夜時段（22:00～24:00）＝這一則（宵夜那五句）；原本的臺灣凌晨四點、公館以外的地方不是',async()=>{
    fresh('2027-10-18',23,'gongguan'); both('FRI'); datingZZ({yt:'confirmed'}); const e1=STORY_EVENTS.find(x=>x.id==='ev_zz_uk_1');
    const a=EVENTS.check(e1)&&ZRZQ.ukOk(G,1); at('2027-10-18',21.5); const b=!ZRZQ.ukOk(G,1); at('2027-10-19',4.3); G.zone='dorm'; const c=!ZRZQ.ukOk(G,1); at('2027-10-18',23); G.zone='campus'; const d=!ZRZQ.ukOk(G,1);
    G.zone='gongguan'; said=[]; await EVENTS.run(e1);
    return [a&&b&&c&&d&&seq(L.UK[0])&&has('（打字，念出來）「在吃宵夜。第二份。」')&&!has('想妳。'),J({a,b,c,d,t:txt()})]; });

  /* ===================== 6 互斥 ===================== */
  await chk('6. 她們交往中：祐廷約子晴吃飯（麵店、半熟）、散步（溫州街）、一盞都照常（不是「兩個人單獨去…不太好」）',()=>{
    fresh('2026-10-05',12,'campus'); both('CLO'); datingZZ(); rules(); INV.addContact(G,ZQ); INV.addContact(G,ZR);
    const out={}; for(const p of ['noodle','brunch','wenzhou','teahouse']) out[p]=[INV.partnerBlock(G,ZQ,INV.place(p)),INV.placeWhy(G,ZQ,INV.place(p))];
    for(const p of ['noodle','teahouse']) out['zr_'+p]=[INV.partnerBlock(G,ZR,INV.place(p)),INV.placeWhy(G,ZR,INV.place(p))];
    return [Object.values(out).every(([b,w])=>b===false&&w===''),J(out)]; });
  await chk('6. 只擋 L2／L3：校外約會（DATE）婉拒用系統現成的「她現在有交往的對象」、告白不出現（willing partner）；互相喜歡（還沒交往）時照常',()=>{
    fresh('2026-10-05',12,'campus'); both('CLO'); datingZZ(); rules(); const r=SOCIAL.rel(ZQ); r.npcRom=60; r.rom=40;
    const a=DATE.canAskCore(G,ZQ), w=DATE.willing(G,ZQ); zz({state:'mutual_interest'}); rules(); const b=DATE.canAskCore(G,ZQ), w2=DATE.willing(G,ZQ);
    return [!a.ok&&a.why==='她現在有交往的對象'&&!w.ok&&w.why==='partner'&&b.ok&&w2.ok,J({a,w,b,w2})]; });
  await chk('6. 對照：別人的伴侶照舊擋（沛珊大一下有伴侶：約她吃飯「兩個人單獨去吃飯不太好…」）',()=>{
    fresh('2026-05-04',15,'campus'); R('classmate_peishan','CLO'); return [INV.partnerBlock(G,'classmate_peishan',INV.place('noodle'))===true,'']; });

  /* ===================== 7 日本路線當面說 ===================== */
  const jp=()=>{ fresh('2028-05-29',21.2,'dorm',{EXCHANGE_ROUTE:'JP'}); both('FAM'); R(FY,'FAM'); G.contacts[ZR]=1; datingZZ(); R2Y3B.f3Go(G,G.day); rules(); at('2028-05-29',23.5); rules(); at('2028-05-30',22.5); rules(); };
  const told=()=>STORY_EVENTS.find(e=>e.id==='ev_zz_f3_told');
  await chk('7. 日本路線（F3 那天在日本）：芷若不傳那四則訊息；8/4 還在日本＝不說；8/5 回國以後在 Café 找她說話＝「你不在的時候，奕廷約我去看《秋天的晚飯》。」＋臺灣那一版後三句；祐廷知道',async()=>{
    jp(); const m=(G.msgs||[]).filter(x=>x.th==='p:heroine_02'), q=PHONE.rec(G).q.some(x=>x.tag==='zz_f3_jp');
    at('2028-08-04',15); G.zone='cafe'; rules(); const a=!ZRZQ.f3ToldDue(G); at('2028-08-05',15); rules(); const b=EVENTS.check(told())&&ZRZQ.f3Away(G);
    said=[]; await EVENTS.run(told());
    const want=['你不在的時候，奕廷約我去看《秋天的晚飯》。','我說不行。……我跟子晴在一起。','他說「好」，然後跟我講了十分鐘那部電影的導演。','他人很好。'];
    return [!m.length&&!q&&a&&b&&J(txt())===J(want)&&G.flags.ZZ.yt==='confirmed',J({m:m.length,q,a,b,t:txt()})]; });
  await chk('7. 日本路線：9/1 以前都沒在 Café 找她＝就沒有這一段（9/2 不說、不補訊息）',()=>{ jp(); at('2028-09-02',15); G.zone='cafe'; rules(); return [!ZRZQ.f3ToldDue(G)&&!EVENTS.check(told())&&!(G.msgs||[]).some(x=>x.th==='p:heroine_02'),'']; });
  await chk('7. 對照：臺灣路線（F3 那天在臺灣）＝臺灣那一版（沒有「你不在的時候，」）',async()=>{
    fresh('2028-05-30',15,'cafe'); both('FAM'); datingZZ(); Object.assign(G.flags,{FANG_F3_DAY:D('2028-05-29'),FANG_F3:'bought'}); rules(); said=[]; await EVENTS.run(told());
    return [txt()[0]==='奕廷約我去看《秋天的晚飯》。'&&!txt().some(t=>/你不在的時候/.test(t))&&!ZRZQ.f3Away(G),J(txt())]; });
  await chk('7. 舊存檔：已經收到那四則訊息（訊息版拿掉以前）＝她已經說了：Café 不再當面說、祐廷知道；排著還沒收到的那四則收回',()=>{
    jp(); G.msgs.push({th:'p:heroine_02',from:ZR,text:'奕廷約我去看《秋天的晚飯》。',tag:'zz_f3_jp',day:D('2028-05-29')}); G.flags.ZZ.yt='mutual'; at('2028-08-05',15); G.zone='cafe'; rules();
    const a=!ZRZQ.f3ToldDue(G)&&G.flags.ZZ.yt==='confirmed';
    fresh('2028-05-29',21.2,'dorm',{EXCHANGE_ROUTE:'JP'}); both('FAM'); datingZZ(); Object.assign(G.flags,{FANG_F3_DAY:D('2028-05-29'),FANG_F3:'bought'});
    PHONE.at(G,G.day,23,[{th:'p:heroine_02',from:ZR,text:'奕廷約我去看《秋天的晚飯》。'}],'zz_f3_jp'); const q0=PHONE.rec(G).q.some(x=>x.tag==='zz_f3_jp'); rules(); const q1=PHONE.rec(G).q.some(x=>x.tag==='zz_f3_jp');
    return [a&&q0&&!q1,J({a,q0,q1})]; });

  console.log(fails?('FAILED: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
