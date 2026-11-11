// 沛珊重寫的期末飯其他段（PEISHAN-VOICE-1110；使用者 X327「有趣、聰明、會接梗」、11-10「不是看到食物就要評論」）——不需要瀏覽器（D131）。
// 稿：企劃線 33a1769f8 的 AA_751_peishan_termend.json（只認這一版）；tools/story/import_termend_opts.py → TERMEND_OPTS（GF／FRIEND／LINES）、tools/movie/import_movie_plots.py → MOVIE_PLOTS.fallback。
//   1. 匯入：兩支工具 --check；沛珊的來源只有 AA_751@33a1769f8
//   2. 單句：FRIEND.y1s1、手機句（NOPE.partner／knows、玩家婉拒的回覆、ENDED；low 不變）——termend_lines.js 和稿一字相同
//   3. 女朋友版：通用一頓（大一下）＋大三上、大三下、大四上、大五上，每頓 say＋三個選項、字和效果照稿；不接話題池、祐廷不自動回
//   4. 大三下「那我留到明天。」：時間跳到隔天早上、演那幾行、中午回臺北；隔天有考試／排好的出遊／答應的邀約＝改出「下次我留到隔天。」、不過夜
//   5. 朋友版五頓（大一上、大一下、大三上、大三下、大四上）：say＋選項＋then；大三上鉤子不念 say、直接出選項；{name}同學 換成玩家的名字
//   6. 交往中她 2026-12-18～2027-08-06 聯絡不到：2026-12（大二上）、2027-06（大二下）兩次期末不發她的邀約；大一下、大三上照發
//   7. 心意的飯不再抽舊的話題池；舊存檔（已經交往）照演、存檔沒有新欄位
//   8. 電影通用回話：整組換成稿上的、fallbackOff 沒有她
// 修改前（任務 A 的 commit）：沒有 TERMEND_OPTS.GF／FRIEND 的沛珊、沒有 LINES——第 1～5、7、8 節 FAIL。用法：node tests/peishan_termend_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const SHA='768b9a131', PS='classmate_peishan';   /* 2026-11-11：33a1769f8 → 768b9a131（AA 補大四下 6/8 台南那一頓 GF.tableByTerm.Y4S2，第 12 節；其他段兩版一樣）*/
let A=null; try{ A=JSON.parse(cp.execFileSync('git',['show',SHA+':docs/story_planning/AA_751_peishan_termend.json'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26})); }catch(e){ A=null; }
const TOx=typeof TERMEND_OPTS!=='undefined'?TERMEND_OPTS:null, Lx=TERMEND_LINES;
let WANT=[], CH=[], caps=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); const w=WANT.shift(); const k=typeof w==='number'?w:T.indexOf(w); return k>=0?k:0; };
GM.caption=(a,b)=>{ caps.push(b); };
const DAY={Y1S1:'2026-01-16',Y1S2:'2026-06-20',Y3S1:'2027-12-28',Y3S2:'2028-06-17',Y4S1:'2028-12-24',Y5S1:'2029-12-20'};
const said=()=>H.said.map(s=>s.t), has=t=>said().indexOf(t)>=0;
const nm=s=>String(s).replace(/\{name\}/g,'祐廷');
const flat=a=>[].concat(...[].concat(a||[]).map(x=>typeof x==='string'?[nm(x)]:(x&&x.narr?[nm(x.narr)]:[])));
const seq=(a,b)=>{ const k=a.indexOf(b[0]); return k>=0&&J(a.slice(k,k+b.length))===J(b); };
const love=id=>+SOCIAL.rel(id).npcRom||0;
const poolOf=term=>flat(((Lx.POOL[term]||{})[PS]||[]).filter(x=>typeof x==='string'));
const dinner=async(term,kind,want,pre)=>{ const G=H.fresh(DAY[term],18.5,null,null); H.rel(PS,65,50,45); SOCIAL.adjust(PS,{npcRom:40}); if(kind==='gf') ROM.start(G,PS); if(pre) pre(G); H.said=[]; CH=[]; caps=[]; WANT=(want||[]).slice(); TERMEND.SHUFFLE=false; const l0=love(PS), d0=G.day;
  try{ await TERMEND.dinner(GM,{te:{term,who:PS,kind}}); } finally{ TERMEND.SHUFFLE=true; } return {G,dl:love(PS)-l0,dd:G.day-d0}; };
const tool=(f,args)=>{ try{ return cp.execFileSync('python3',[f].concat(args),{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ return String(e.stderr||e.message); } };

(async()=>{
  const ok0=!!A&&!!TOx&&!!TOx.GF&&!!TOx.GF[PS]&&!!TOx.LINES&&!!TOx.LINES[PS];
  await sec(1,async()=>{ const o1=tool('tools/story/import_termend_opts.py',['--check']), o2=tool('tools/movie/import_movie_plots.py',['--check']);
    check('1. tools/story/import_termend_opts.py --check OK',/^OK /.test(o1),o1.slice(0,160)); check('1. tools/movie/import_movie_plots.py --check OK',/^OK /.test(o2),o2.slice(0,160));
    check('1. 讀得到企劃線 '+SHA+' 的 AA_751（讀不到＝後面的逐字比對都做不了）',!!A);
    check('1. 沛珊的來源只有 AA_751@'+SHA+'；四段都匯了（heart、gf、friend、lines）',!!TOx&&TOx.src.ps==='docs/story_planning/AA_751_peishan_termend.json@'+SHA&&!!TOx.ps&&J(TOx.ps.heart)===J([PS])&&J(TOx.ps.gf)===J([PS])&&J(TOx.ps.friend)===J([PS])&&TOx.ps.lines===true,TOx?J([TOx.src.ps,TOx.ps]):'');
    const tsrc=fs.readFileSync(path.join(H.ROOT,'tools/story/import_termend_opts.py'),'utf8'), msrc=fs.readFileSync(path.join(H.ROOT,'tools/movie/import_movie_plots.py'),'utf8');
    check('1. 兩支工具都寫死只認 '+SHA+'（PS_SHA）；AA_749 那幾個檔的白名單列沛珊＝停下來',tsrc.includes("PS_SHA = '"+SHA+"'")&&msrc.includes("PS_SHA = '"+SHA+"'")&&/沛珊不從這個檔匯入/.test(tsrc));
    const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_751_peishan_termend/.test(e.path));
    check('1. 白名單只有一筆 AA_751、sha '+SHA+'、approved',allow.length===1&&allow[0].sha===SHA&&allow[0].status==='approved'&&!!allow[0].approvedBy); });

  await sec(2,async()=>{ if(!ok0){ check('2. 單句',false,'沒有 TERMEND_OPTS.LINES／稿'); return; } const f=A.FRIEND, p=A.phone, L=TOx.LINES[PS], F=Lx.FRIEND[PS];
    check('2. FRIEND：大一上那一句換成「…我發現一家，我覺得你會喜歡。」；gen、no 照舊（稿上同字）',F.y1s1===f.y1s1&&F.gen===f.gen&&F.no===f.no&&L.FRIEND.y1s1===f.y1s1&&f.y1s1==='期末考完了！吃飯好不好？我發現一家，我覺得你會喜歡。',J([F.y1s1,F.gen,F.no]));
    const np=TERMEND.nopeText(Lx,'partner',PS,'Y1S2'), nk=TERMEND.nopeText(Lx,'knows',PS,'Y1S2'), nl=TERMEND.nopeText(Lx,'low',PS,'Y1S2');
    check('2. 手機：她自己有交往對象「…下次換你請喔。」、她知道你有女朋友「…你知道為什麼啦。」；低潮那一句不變',np===p['NOPE.partner']&&nk===p['NOPE.knows']&&nl===p['NOPE.low']&&nl==='我這禮拜想回家。下次約！'&&L.NOPE.partner===np&&L.NOPE.knows===nk,J([np,nk,nl]));
    check('2. 玩家婉拒以後她回「好喔！那你欠我一頓。」（別人先約了的自動婉拒、心意邀約的婉拒都是這一句）；關係結束時「謝謝你約我。這次我先不去。」',Lx.AUTO_NO[PS]===p['REPLY（玩家婉拒）']&&TERMEND.heart(PS,'Y1S2').decline===p['REPLY（玩家婉拒）']&&Lx.ENDED[PS]===p.ENDED&&L.AUTO_NO===Lx.AUTO_NO[PS]&&L.ENDED===Lx.ENDED[PS],J([Lx.AUTO_NO[PS],Lx.ENDED[PS]]));
    const src=fs.readFileSync(path.join(H.ROOT,'src/data/termend_lines.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
    const old=['我有一堆問題想問你','下次再問你問題喔','我有問題想問你','那我下次再問','那我問最後一個問題','我可以問一個奇怪的問題嗎','早餐店'].filter(t=>src.includes(t));
    check('2. termend_lines.js（註解以外）沒有留她重寫前的句子',old.length===0,J(old)); });

  await sec(3,async()=>{ if(!ok0){ check('3. 女朋友版',false); return; } const g=A.GF, bad=[];
    for(const term of ['Y1S2','Y3S1','Y3S2','Y4S1','Y5S1']){ const e=term==='Y1S2'?g.table:g.tableByTerm[term];
      for(let i=0;i<e.opts.length;i++){ const o=e.opts[i]; if(o.nextMorning&&term==='Y3S2') continue;   /* 第 4 節 */
        const hkS=(()=>{ const h=(Lx.HOOK[term]||{})[PS]; return h&&typeof h.say==='string'?h.say:null; })();   /* 邀約鉤子自己的那一句（照舊接在後面）不算話題池 */
        const s=await dinner(term,'gf',[o.t,1]), T=said(), pl=poolOf(term).filter(t=>has(t)&&t!==hkS), auto=H.said.some(x=>x.who==='祐廷'&&Lx.REPLY.includes(x.t));
        const fxl=(o.fx&&o.fx.love)||0;
        if(!seq(T,flat(e.say).concat(flat(o.re)))||CH[0].length!==3||!e.opts.every(q=>CH[0].includes(q.t))||pl.length||auto||s.dl!==Math.min(2,fxl)) bad.push([term,o.t,s.dl,pl,auto,T.slice(0,6)]); } }
    check('3. 通用（大一下）＋大三上、大三下、大四上、大五上：她說的兩句 → 三個選項 → 選的那個的回答；字照稿；她的戀愛照 fx（一頓最多 +2）；不接話題池、祐廷不自動回',bad.length===0,J(bad.slice(0,2)));
    check('3. 通用那一頓只給大一下：稿寫的四個學期各用自己的（TERMEND.gfEntry）',TERMEND.gfEntry(PS,'Y1S2',TERMEND.gf(PS,'Y1S2')).generic===true&&['Y3S1','Y3S2','Y4S1','Y5S1'].every(t=>TERMEND.gfEntry(PS,t,TERMEND.gf(PS,t)).generic===false));
    check('3. 邀約句照現有各學期的（稿：不動）',TERMEND.gf(PS,'Y1S2').invite==='期末考完了！今天吃飯，吃冰的也可以。夏天了。'&&TERMEND.gf(PS,'Y3S1').invite==='學期結束了！你下來，我帶你吃台南的。'); });

  await sec(4,async()=>{ if(!ok0){ check('4. 留到明天',false); return; } const e=A.GF.tableByTerm.Y3S2, o=e.opts.find(x=>x.nextMorning), nmx=o.nextMorning, alt=o.alt;
    const s=await dinner('Y3S2','gf',[o.t]); const T=said();
    check('4. 隔天沒事：選項是「那我留到明天。」（沒有 alt 那一個）',CH[0].includes(o.t)&&!CH[0].includes(alt.t),J(CH[0]));
    check('4. 選了：她的回答 → 這頓飯的收尾 → 隔天早上那幾行（旁白、狗、月台）照稿、照順序',seq(T,flat(o.re))&&seq(T,flat(nmx.lines))&&T.indexOf(flat(nmx.lines)[0])>T.indexOf(flat(o.re).pop())&&T[T.length-1]===flat(nmx.lines).pop(),J(T.slice(-7)));
    check('4. 時間跳到隔天（日期 +1、星期跟著走）、演完是中午 12:00（接著出遊收尾＝回臺北）；地點字幕「台南・她學校附近的巷子」',s.dd===1&&s.G.hour===12&&s.G.weekday===CALENDAR.dateOf(s.G.day).wd%7&&caps.includes('台南・她學校附近的巷子')&&nmx.where.indexOf('台南・她學校附近的巷子')===0,J([s.dd,s.G.hour,s.G.weekday,caps]));
    check('4. 存檔沒有新欄位（這學期只記原本的 done）',J(Object.keys(JSON.parse(J(s.G)).termend.Y3S2))===J(['done']),J(Object.keys(s.G.termend.Y3S2)));
    const busy={
      '隔天排好了出遊':G=>{ OUT.rec(G).push({id:'x_busy',ev:'ev_x',day:G.day+1,h:10,state:'planned'}); },
      '隔天有答應的邀約':G=>{ (G.invites||(G.invites=[])).push({id:9001,who:'zhe',day:G.day+1,h:12,state:'accepted',accepted:true}); },
      '隔天有考試':G=>{ const d0=CLS.dayItems; CLS.dayItems=function(g,d){ return d===G.day+1?[{exam:true,t0:9,t1:11,c:{name:'x'}}]:d0.apply(this,arguments); }; G.__undo=()=>{ CLS.dayItems=d0; }; } };
    for(const k in busy){ let G0=null; const s2=await dinner('Y3S2','gf',[alt.t],G=>{ G0=G; busy[k](G); }); if(G0&&G0.__undo){ G0.__undo(); delete G0.__undo; } const T2=said();
      check('4. '+k+'：改出「下次我留到隔天。」（沒有「那我留到明天。」）、她的回答照 alt、不過夜（日期、時間不跳）、沒有隔天早上那幾行',CH[0].includes(alt.t)&&!CH[0].includes(o.t)&&CH[0].length===3&&seq(T2,flat(alt.re))&&s2.dd===0&&s2.G.hour===18.5&&!has(flat(nmx.lines)[0])&&s2.dl===2,J([CH[0],s2.dd,s2.G.hour])); }
    const s3=await dinner('Y3S2','gf',[e.opts[2].t]); check('4. 選別的（「隔天有課啊。」）＝不過夜',s3.dd===0&&!has(flat(nmx.lines)[0])&&seq(said(),flat(e.opts[2].re)));
    const G=H.fresh(DAY.Y3S2,18.5,null,null); check('4. 查不了（資料壞掉）＝當作有事，不過夜',TERMEND.morningFree({G:Object.assign({},G,{invites:[null,{day:G.day+1,state:'accepted'}]})},G.day+1)===false&&TERMEND.morningFree({G},G.day+1)===true); });

  await sec(5,async()=>{ if(!ok0){ check('5. 朋友版',false); return; } const fv=A.friend_v2, bad=[]; let n=0;
    check('5. 朋友版五頓：大一上、大一下、大三上、大三下、大四上',J(Object.keys(fv))===J(['Y1S1','Y1S2','Y3S1','Y3S2','Y4S1'])&&Object.keys(fv).every(t=>!!TOx.FRIEND[t][PS])&&!TOx.FRIEND.Y2S1[PS]&&!TOx.FRIEND.Y2S2[PS]);
    for(const term of Object.keys(fv)){ const e=fv[term];
      for(const o of e.opts){ n++; await dinner(term,'friend',[o.t,1]); const T=said(), pl=poolOf(term).filter(t=>has(t)&&!flat(e.say).concat(flat(e.then||[])).includes(t)), auto=H.said.some(x=>x.who==='祐廷'&&Lx.REPLY.includes(x.t));
        if(!seq(T,flat(e.say).concat(flat(o.re),flat(e.then||[])))||CH[0].length!==3||pl.length||auto||T.some(t=>/\{name\}/.test(t))) bad.push([term,o.t,pl,auto,T.slice(0,8)]); } }
    check('5. 每一頓、每個選項（'+n+' 個）：她說的兩句 → 三個選項 → 回答 →（有的話）then；字照稿；不抽話題池、祐廷不自動回',n===15&&bad.length===0,J(bad.slice(0,2)));
    await dinner('Y1S1','friend',[fv.Y1S1.opts[2].t,1]); check('5. 「{name}同學。」的 {name} 換成玩家的名字（遊戲裡 GM.say 換；這裡是「祐廷同學。」）',has('祐廷同學。')&&fv.Y1S1.opts[2].re[0]==='{name}同學。'&&/function subst\(t\)\{ return t\.replace\(\/\\\{name\\\}\/g,G\.name\); \}/.test(fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8')),J(said().slice(2,5)));
    check('5. 大四上 then 照稿（沒有「再去店裡幫忙」）',J(TOx.FRIEND.Y4S1[PS].then)===J(fv.Y4S1.then)&&fv.Y4S1.then[0]==='寒假回台中，先在家附近的國小代課兩個禮拜。');
    { const G=H.fresh(DAY.Y3S1,18.5,null,null); H.rel(PS,65,50,45); ROM.start(G,PS); const hk=TERMEND.hookFor(G,'Y3S1',PS);
      H.said=[]; CH=[]; WANT=[0,0]; await TERMEND.dinner(GM,{te:{term:'Y3S1',who:PS,kind:'friend'}}); const hs=Lx.HOOK.Y3S1[PS];
      check('5. 大三上：鉤子那一句「去國小看課那幾次，我是真的很喜歡。」不念（飯桌已經講了）、直接出選項「哪天去看你們上課？」',TOx.FRIEND.Y3S1[PS].hookNoSay===true&&(!hk||(!has(hs.say)&&CH.some(c=>J(c)===J([hs.ok,Lx.HOOK_NO])))),J([!!hk,CH,said().slice(-3)])); } });

  await sec(6,async()=>{ const rows={}; const P=(term,dating)=>{ const w=TERMEND.windowOf(term), G=H.fresh(CALENDAR.dateOf(w.from).key,12,null,null); H.rel(PS,65,50,45); SOCIAL.adjust(PS,{npcRom:40}); const Lg=DATE.log(G,PS); Lg.count=4; Lg.wish=true; if(dating) ROM.start(G,PS);
      for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1']){ const C=G.termend&&G.termend.contact||((TERMEND.rec(G).contact={})); (C[t]||(C[t]={}))[PS]={pts:20,k:{}}; }
      const p=TERMEND.plan(G,w); return {from:CALENDAR.dateOf(w.from).key,to:CALENDAR.dateOf(w.to).key,gf:p.gf.includes(PS),heart:p.heart.includes(PS),friend:p.friend.includes(PS),nope:!!p.nope[PS],G,w}; };
    const a=P('Y2S1',true), b=P('Y2S2',true), c=P('Y1S2',true), d=P('Y3S1',true);
    check('6. 時段：大二上期末 2026-12-24～2027-01-03、大二下期末 2027-06-10～06-20，都在她聯絡不到的 2026-12-18～2027-08-06 裡面',a.from==='2026-12-24'&&a.to==='2027-01-03'&&b.from==='2027-06-10'&&b.to==='2027-06-20'&&[a,b].every(x=>{ for(let dd=x.w.from;dd<=x.w.to;dd++){ const p=STORY.presence(PS,Object.assign({},x.G,{day:dd})); if(p.here||p.kind!=='unreachable') return false; } return true; }),J([a.from,a.to,b.from,b.to]));
    check('6. 交往中：2026-12（大二上）、2027-06（大二下）兩次期末不排她的學期末約會，也沒有別的期末邀約',!a.gf&&!b.gf&&!a.heart&&!b.heart&&!a.friend&&!b.friend&&!a.nope&&!b.nope,J([a,b].map(x=>[x.gf,x.heart,x.friend,x.nope])));
    for(const x of [a,b]){ const G=x.G; for(let dd=x.w.from;dd<=x.w.to;dd++) for(const h of [12,20.6,21]){ G.day=dd; G.hour=h; G.weekday=CALENDAR.dateOf(dd).wd%7; TERMEND.phone(GM); PHONE.tick(G); } }
    check('6. 整個時段跑過手機規則：她一則期末的訊息都沒有傳（te_ 開頭、她的對話串）',[a,b].every(x=>!(x.G.msgs||[]).some(m=>m&&m.th==='p:'+PS&&/^te_/.test(m.tag||''))),J([a,b].map(x=>(x.G.msgs||[]).filter(m=>m&&m.th==='p:'+PS).map(m=>m.text))));
    check('6. 對照：大一下（2026-06）、大三上（2027-12）交往中照排她的學期末約會',c.gf&&d.gf,J([c.gf,d.gf]));
    const e=P('Y2S1',false), f=P('Y2S2',false); check('6. 沒交往的線：這兩次也不發（心意、朋友都沒有）',!e.heart&&!e.friend&&!f.heart&&!f.friend,J([e,f].map(x=>[x.heart,x.friend]))); });

  await sec(7,async()=>{ if(!ok0){ check('7. 心意的飯',false); return; }
    WANT=[]; const G=H.fresh(DAY.Y1S2,18.5,null,null); H.rel(PS,65,50,45); SOCIAL.adjust(PS,{npcRom:40}); H.said=[]; CH=[]; WANT=[0,1,0,0,0]; await TERMEND.dinner(GM,{te:{term:'Y1S2',who:PS,kind:'heart'}});
    check('7. 心意的飯不再抽朋友的話題池（她有朋友版的稿了）、祐廷不自動回',poolOf('Y1S2').filter(has).length===0&&!H.said.some(x=>x.who==='祐廷'&&Lx.REPLY.includes(x.t))&&has('你今天話好少。'),J(said().slice(0,5)));
    /* 舊存檔：交往很久、G.termend 是舊的形狀 */
    const G2=H.fresh(DAY.Y3S1,18.5,null,null); H.rel(PS,65,50,45); ROM.start(G2,PS); G2.termend={think:{},contact:{},Y1S2:{plan:{heart:[PS],friend:[],gf:[],nope:{}},picked:{who:PS,kind:'heart',day:1},done:{who:PS,kind:'heart',day:2},result:'sheSaid'}};
    H.said=[]; CH=[]; WANT=[0]; let err=null; try{ await TERMEND.dinner(GM,{te:{term:'Y3S1',who:PS,kind:'gf'}}); }catch(e){ err=String(e); }
    check('7. 舊存檔（已經和沛珊交往）大三上的學期末約會照演（新的兩句＋選項）、存檔可以序列化、沒有新欄位',!err&&has(A.GF.tableByTerm.Y3S1.say[0])&&CH.length>=1&&J(Object.keys(JSON.parse(J(G2)).termend.Y3S1).filter(k=>k!=='hook'))===J(['done'])   /* hook：邀約鉤子原本就會記的那一格 */,err||J(Object.keys(G2.termend.Y3S1||{})));
    const keep=globalThis.TERMEND_OPTS; globalThis.TERMEND_OPTS=null; try{ const G3=H.fresh(DAY.Y3S1,18.5,null,null); H.rel(PS,65,50,45); ROM.start(G3,PS); H.said=[]; CH=[]; let e2=null; try{ await TERMEND.dinner(GM,{te:{term:'Y3S1',who:PS,kind:'gf'}}); }catch(e){ e2=String(e); }
      check('7. 沒有 TERMEND_OPTS（舊資料）：她的學期末約會不丟例外（開場、收尾照演；飯桌只剩留著的那一句通用的）',!e2&&said().length>=2,e2||J(said())); } finally{ globalThis.TERMEND_OPTS=keep; } });

  await sec(8,async()=>{ let M=null; try{ M=new Function(fs.readFileSync(path.join(H.ROOT,'src/data/movie_plots.js'),'utf8')+'; return MOVIE_PLOTS;')(); }catch(e){ M=null; }
    const K=['feel','notice','wonder','self','joke','crit'], f=A&&A.fallback;
    check('8. MOVIE_PLOTS.fallback 的沛珊＝AA_751 fallback 整組（六種 kind 各三句，字、順序、效果照稿）',!!M&&!!f&&J(K.map(k=>M.fallback[PS][k]))===J(K.map(k=>f[k]))&&K.every(k=>f[k].length===3)&&J(Object.keys(M.fallback[PS]).sort())===J(K.slice().sort()));
    check('8. 來源有寫 AA_751@'+SHA,!!M&&M.src.some(s=>s.indexOf('AA_751_peishan_termend.json@'+SHA)>=0),M?J(M.src.slice(-2)):'');
    check('8. src/movies3d.js：MOVIES.CFG.fallbackOff 沒有她',/S\.CFG=\{fallback:true,fallbackOff:\[\]\}/.test(fs.readFileSync(path.join(H.ROOT,'src/movies3d.js'),'utf8')));
    check('8. 其他六位的通用回話沒有動（還是 AA_745_fallback 的）',!!M&&['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin'].every(p=>M.fallback[p]&&K.every(k=>M.fallback[p][k].length>=1))); });

  /* 12 大四下 6/8 台南那一頓（2026-11-11；AA_751@768b9a131 多的 GF.tableByTerm.Y4S2；演在 src/r2y4b3d.js R2Y4B.psDinner → TERMEND.gfTable）*/
  await sec(12,async()=>{ const TOx=globalThis.TERMEND_OPTS, E=TOx&&TOx.GF&&TOx.GF[PS]&&TOx.GF[PS].tableByTerm.Y4S2, a=A&&A.GF&&A.GF.tableByTerm&&A.GF.tableByTerm.Y4S2;
    check('12. TERMEND_OPTS.GF 沛珊有大四下那一頓（兩組開頭：延畢的、一般的；三個選項）',!!E&&E.says.length===2&&E.says[0].if==='DELAYED'&&E.says[1].if===undefined&&E.opts.length===3,J(E&&E.says));
    if(a&&E){ const m=/改用「([^」]+)」/.exec(a.note||'');
      check('12. 一般的兩句、三個選項的字／回答／fx 一字照稿',J(E.says[1].say)===J(a.say)&&E.opts.length===a.opts.length&&a.opts.every((o,i)=>E.opts[i].t===o.t&&J(E.opts[i].re)===J(o.re)&&J(E.opts[i].fx)===J(o.fx)),J(E.says[1]));
      check('12. 延畢的開頭：第一句＝稿 note 裡那一句「大四要結束了欸，我還有兩年。」、第二句照 say',!!m&&J(E.says[0].say)===J([m[1],a.say[1]])&&m[1]==='大四要結束了欸，我還有兩年。',J(E.says[0])); }
    if(!E||!TERMEND.gfTable){ check('12. TERMEND.gfTable',false); return; }
    const spec=TERMEND.gf(PS,'Y4S2'), go=async(setup,pick)=>{ const G=H.fresh('2029-06-08',18.5,null,null); H.rel(PS,65,50,45); ROM.start(G,PS); if(setup) setup(G); H.said=[]; CH=[]; WANT=[pick]; const r0=SOCIAL.rel(PS).npcRom||0; const r=await TERMEND.gfTable(GM,PS,'Y4S2',spec); return {r,d:(SOCIAL.rel(PS).npcRom||0)-r0}; };
    const x=await go(null,'「兩年很快。我會常下來。」'); const s1=said();
    check('12. 演出來（沒有延畢）：「你要畢業了欸，我還有兩年。」→ 第二句 → 三個選項 → 選的那一個的兩句回答；戀愛有加',x.r===true&&J(s1.slice(0,2))===J(E.says[1].say)&&CH.length===1&&CH[0].length===3&&J(CH[0].slice().sort())===J(E.opts.map(o=>o.t).sort())&&J(s1.slice(2))===J(E.opts[1].re)&&x.d>0,J([s1,CH,x.d]));
    const y=await go(G=>{ G.flags.FAIL_DELAY=true; },0); const s2=said();
    check('12. 演出來（祐廷延畢）：第一句換成「大四要結束了欸，我還有兩年。」，不說「你要畢業了欸」',y.r===true&&s2[0]==='大四要結束了欸，我還有兩年。'&&s2[1]===E.says[1].say[1]&&!s2.includes('你要畢業了欸，我還有兩年。'),J(s2));
    check('12. 稿沒有的學期（只有通用的 table）＝gfTable 回 false、不演（呼叫的地方照原本那一句）',await (async()=>{ H.fresh('2026-06-20',18.5,null,null); H.said=[]; const r=await TERMEND.gfTable(GM,PS,'Y1S2',TERMEND.gf(PS,'Y1S2')); return r===false&&said().length===0; })());
    const src=fs.readFileSync(path.join(H.ROOT,'src/r2y4b3d.js'),'utf8');
    check('12. r2y4b3d.js psDinner：女朋友版走 TERMEND.gfTable(…,\'Y4S2\',…)，沒演到才念原本那一句',src.includes("if(!(kind==='gf'&&TERMEND.gfTable&&await TERMEND.gfTable(GM,id,'Y4S2',spec))&&tbl) await play(GM,id,[tbl]);")); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
