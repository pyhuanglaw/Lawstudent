// 「她先說」的告白模式（SHE-FIRST-1110；LAWWW 2026-11-10 23:26；使用者 X327 沛珊重寫、11-10 芷若「寫在杯子上」）——不需要瀏覽器（D131）。
// 稿：企劃線 33a1769f8 的 AA_748_termend_heart_v2.json（芷若 HEART／tableOpts／confessOpts）、AA_751_peishan_termend.json（沛珊 HEART）；
//     tools/story/import_termend_opts.py → src/data/termend_opts.js 的 TERMEND_OPTS.HEART，播放 src/termend3d.js 的 S.sheFirst。
//   1. 匯入：--check 通過；HEART 只有芷若、沛珊；字和稿一樣（沛珊只認 33a1769f8）
//   2. 沛珊第一次：飯桌兩句＋選項 → 回家路上 → 三個入口都接到「你猜是誰」→ 她說 → 三個回應；答應＝yesLead 接 yes、交往；後面沒有「好。／讓我想想。」
//   3. 沛珊選「是我嗎？」：she 從「我真的很喜歡你。」開始（旁白照演、「是你啦。」不重講）
//   4. 沛珊「……讓我想一下，好不好。」＝她的回話、不交往、記 think；下學期 invite2、she2 →「好。」＝yes2、交往；第二次再想＝再記一次
//   5. 沛珊大四上：she 換那三句、兩個選項
//   6. 芷若：在吧台（不念打烊的開場收尾、不走路）、杯套；兩個答應＋一個想一下；收尾旁白；第二次；各學期邀約的星期和時間
//   7. 其他人（玩家先說的原本流程）沒有壞：子晴「（先不說）」→ 她說 →「好。／讓我想想。」
//   8. 舊存檔：已經交往＝不發心意邀約；上學期（舊流程）選過讓我想想＝這學期走第二次；沒有 TERMEND_OPTS（舊資料）＝這兩位不發心意邀約、其他人照舊
//   9. 玩家自己約芷若吃飯（心意條件到齊）＝照一般的吃飯（她那一場在店裡）
// 修改前（5e1dd3494）：沒有 TERMEND_OPTS.HEART、沒有 S.sheFirst——第 1～6、9 節 FAIL。用法：node tests/te_shefirst_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const SHA='33a1769f8', PS='classmate_peishan', ZR='heroine_02';
const show=f=>{ try{ return JSON.parse(cp.execFileSync('git',['show',SHA+':docs/story_planning/'+f],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26})); }catch(e){ return null; } };
const show748=f=>{ try{ return JSON.parse(cp.execFileSync('git',['show','5d48cae98f:docs/story_planning/'+f],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26})); }catch(e){ return null; } };   /* 2026-11-12（CANON-NO-ECON-1112 第五批）：AA_748 白名單換 6dbfe10d7e（芷若 yes 第二句拿掉句首刪節號），芷若照這一版比；沛珊 AA_751 照舊；2026-11-13 AA_947 再換 5d48cae98f（「店長明天一定會看出來。」→「老闆…」）。舊：6dbfe10d7e */
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：匯入最後一步照覆寫表換了字——稿先照表換成遊戲的字再比 */
const A751=M959.mapDeep(show('AA_751_peishan_termend.json'),'termend_opts.js','classmate_peishan'), A748=M959.mapDeep(show748('AA_748_termend_heart_v2.json'),'termend_opts.js');
const TOx=typeof TERMEND_OPTS!=='undefined'?TERMEND_OPTS:null, Lx=TERMEND_LINES;
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); if(T.includes(TERMEND_LINES.HOOK_NO)) return 1;   /* 邀約鉤子（營隊…）：不接，不算在這裡數的選項裡 */ CH.push(T); const w=WANT.shift(); const k=typeof w==='number'?w:T.indexOf(w); return k>=0?k:0; };
const DAY={Y1S1:'2026-01-16',Y1S2:'2026-06-20',Y2S1:'2027-01-15',Y2S2:'2027-06-19',Y3S1:'2028-01-14',Y3S2:'2028-06-17',Y4S1:'2028-12-24'};
const said=()=>H.said.map(s=>s.t), idx=t=>said().indexOf(t), has=t=>idx(t)>=0;
const flat=a=>[].concat(...[].concat(a||[]).map(x=>typeof x==='string'?[x]:(x&&x.narr?[x.narr]:[])));
const love=id=>+SOCIAL.rel(id).npcRom||0;
const sub=(a,b)=>{ let i=0; for(const t of a){ if(i<b.length&&t===b[i]) i++; } return i===b.length; };   /* b 照順序出現在 a 裡 */
const seq=(a,b)=>{ const k=a.indexOf(b[0]); return k>=0&&J(a.slice(k,k+b.length))===J(b); };   /* b 連續出現在 a 裡 */
const dinner=async(who,term,want,pre)=>{ const G=H.fresh(DAY[term],18.5,null,null); H.rel(who,65,50,45); SOCIAL.adjust(who,{npcRom:40}); if(pre) pre(G); H.said=[]; CH=[]; WANT=(want||[]).slice(); TERMEND.SHUFFLE=false; const l0=love(who);
  let r; try{ await TERMEND.dinner(GM,{te:{term,who,kind:'heart'}}); r=(TERMEND.rec(G,term)||{}).result; } finally{ TERMEND.SHUFFLE=true; } return {G,r,dl:love(who)-l0}; };
const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]);
const ANS=Lx.ANSWER;

(async()=>{
  const ok0=!!TOx&&!!TOx.HEART&&typeof TERMEND.sheFirst==='function'&&!!A751&&!!A748;
  await sec(1,async()=>{ let out=''; try{ out=cp.execFileSync('python3',['tools/story/import_termend_opts.py','--check'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ out=String(e.stderr||e.message); }
    check('1. 匯入工具 --check：src/data/termend_opts.js 和白名單的稿一樣',/^OK /.test(out),out.slice(0,200));
    check('1. 讀得到企劃線 '+SHA+' 的兩份稿（讀不到＝這個檔後面的逐字比對都做不了）',!!A751&&!!A748);
    check('1. TERMEND_OPTS.HEART 只有芷若、沛珊，都是「她先說」',ok0&&J(Object.keys(TOx.HEART).sort())===J([PS,ZR].sort())&&Object.values(TOx.HEART).every(h=>h.mode==='sheFirst'),ok0?J(Object.keys(TOx.HEART)):'沒有 TERMEND_OPTS.HEART');
    /* 2026-11-11 改期望：AA_751 改讀 768b9a131（AA 補大四下 6/8 台南那一頓；HEART 這一段和 33a1769f8 一樣，下面照舊用 33a1769f8 的稿逐字比）；AA_748 照舊 33a1769f8 */
    check('1. 沛珊的稿來源＝AA_751@768b9a131（只認這一版）',ok0&&TOx.src.ps==='docs/story_planning/AA_751_peishan_termend.json@768b9a131',ok0?TOx.src.ps:'');
    if(!ok0) return; const p=TOx.HEART[PS], a=A751.HEART, z=TOx.HEART[ZR], b=A748.HEART[ZR];
    check('1. 沛珊：invite、decline、table、walk、she、yes、invite2、she2、yes2、大四上 she／answer 一字照稿',p.invite===a.invite&&p.decline===a.decline&&p.invite2===a.invite2&&['table','walk','she','yes','she2','yes2'].every(k=>J(p[k])===J(a[k]))&&J(p.byTerm.Y4S1.she)===J(a.over_Y4S1.she)&&J(p.byTerm.Y4S1.answer)===J(a.over_Y4S1.answer));
    check('1. 沛珊：tableOpts、walkOpts、guess、confessOpts 的字、效果、result 照稿',J(p.tableOpts)===J(a.tableOpts)&&J(p.walkOpts.map(o=>[o.t,o.re,o.fx||null]))===J(a.walkOpts.opts.map(o=>[o.t,o.re,o.fx||null]))&&J(p.guess.say)===J(a.guess.say)&&J(p.guess.opts.map(o=>[o.t,o.re,o.fx||null,o.sheFrom||null]))===J(a.guess.opts.map(o=>[o.t,o.re,o.fx||null,o.sheFrom||null]))
      &&J(p.confessOpts.map(o=>[o.t,o.result,o.yesLead||null,o.re||null,o.fx||null]))===J(a.confessOpts.map(o=>[o.t,o.result,o.yesLead||null,o.re||null,o.fx||null])));
    check('1. 芷若：table、she、yes、she2、yes2、飯桌選項、三個回應一字照稿；邀約＝inviteHeart、第二次＝invite2；收尾旁白＝inviteNote 那一句',['table','she','yes','she2','yes2'].every(k=>J(z[k])===J(b[k]))&&J(z.tableOpts)===J(A748.tableOpts[ZR].opts)&&J(z.confessOpts.map(o=>[o.t,o.result,o.yesLead||null,o.re||null,o.fx||null]))===J(A748.confessOpts[ZR].opts.map(o=>[o.t,o.result,o.yesLead||null,o.re||null,o.fx||null]))
      &&z.invite.gen===b.inviteHeart&&z.invite2.gen===b.invite2&&b.inviteNote.indexOf('收尾旁白加一句：'+z.closeAdd)>=0&&z.atBar===true);
    const src=require('fs').readFileSync(require('path').join(H.ROOT,'src/data/termend_lines.js'),'utf8');
    check('1. termend_lines.js 的 HEART 沒有留這兩位的舊句（「那我問最後一個問題」「我可以問一個奇怪的問題嗎」「你不說的話……那我說好了」「不想吃店裡的東西」）',!/那我問最後一個問題|我可以問一個奇怪的問題嗎|你不說的話……那我說好了|不想吃店裡的東西|就我們兩個。我有問題想問你/.test(src)); });

  await sec(2,async()=>{ if(!ok0){ check('2. 沛珊第一次',false,'沒有 TERMEND_OPTS.HEART／S.sheFirst'); return; } const a=A751.HEART, c0=a.confessOpts[0];
    const s=await dinner(PS,'Y1S2',[a.tableOpts[1].t,a.walkOpts.opts[0].t,a.guess.opts[0].t,c0.t]); const T=said();
    check('2. 飯桌兩句 → 選項（三個）→ 她的回答',seq(T,flat(a.table).concat(flat(a.tableOpts[1].re)))&&CH[0].length===3&&a.tableOpts.every(o=>CH[0].includes(o.t)),J([CH[0],T.slice(0,8)]));
    check('2. 回家路上兩句 → 入口三個選項 →「有啊。」→「你猜是誰。猜錯要請我喝飲料。」→ 猜（三個）→ 她的回話 → 她說四句',seq(T,flat(a.walk).concat(flat(a.walkOpts.opts[0].re),flat(a.guess.say),flat(a.guess.opts[0].re),flat(a.she)))&&J(CH[1])===J(a.walkOpts.opts.map(o=>o.t))&&J(CH[2])===J(a.guess.opts.map(o=>o.t)),J(T.slice(-16)));
    check('2. 她說完直接出三個回應（照稿的順序）',J(CH[3])===J(a.confessOpts.map(o=>o.t)),J(CH[3]));
    check('2. 選「我也喜歡妳。」＝yesLead 接 yes，最後一句是 yes 的最後一句',seq(T,flat(a.she).concat(flat(c0.yesLead),flat(a.yes)))&&T[T.length-1]===flat(a.yes).pop(),J(T.slice(-7)));
    check('2. 交往（照原本答應的那一條：dating、confessed、不記 think；結果 sheSaid）',dating(s.G,PS)&&s.G.flags.confessed&&s.G.flags.confessed[PS]===s.G.day&&TERMEND.rec(s.G).think[PS]==null&&s.r==='sheSaid'&&ROM.get(s.G,PS).status==='dating',J([s.r,ROM.get(s.G,PS).status]));
    check('2. 後面沒有「好。／讓我想想。」那一組；整頓只出四組選項',CH.length===4&&!CH.some(c=>c.includes(ANS[0])||c.includes(ANS[1])||c.includes(Lx.NOT_YET_OPT)),J(CH.map(c=>c.length)));
    check('2. 選項的效果：這一晚她的戀愛有加、最多 +3（告白那一晚的上限）',s.dl>0&&s.dl<=3,'+'+s.dl);
    for(const k of [1,2]){ const s2=await dinner(PS,'Y1S2',[0,a.walkOpts.opts[k].t,2,1]); const T2=said();
      check('2. 入口第 '+(k+1)+' 個「'+a.walkOpts.opts[k].t+'」也接到「你猜是誰」→ 她說；第二個回應（牽手）也是答應',seq(T2,flat(a.walkOpts.opts[k].re).concat(flat(a.guess.say),flat(a.guess.opts[2].re),flat(a.she),flat(a.confessOpts[1].yesLead),flat(a.yes)))&&dating(s2.G,PS),J(T2.slice(-14))); }
    const s3=await dinner(PS,'Y1S2',[0,0,0,0]); check('2. {name}同學不在這一場；台詞裡沒有沒換掉的 {name}',!said().some(t=>/\{name\}/.test(t))); });

  await sec(3,async()=>{ if(!ok0){ check('3. 是我嗎',false); return; } const a=A751.HEART, g=a.guess.opts[1];
    const s=await dinner(PS,'Y1S2',[0,0,g.t,0]); const T=said(), she2=a.she.filter((x,i)=>typeof x!=='string'||i>=a.she.indexOf(g.sheFrom));
    check('3. 選「是我嗎？」：「對啦。」之後＝旁白照演、從「我真的很喜歡你。」開始',g.sheFrom==='我真的很喜歡你。'&&seq(T,flat(g.re).concat(flat(she2)))&&flat(she2)[0]===a.she[0].narr&&flat(she2)[1]==='我真的很喜歡你。',J(T.slice(-12)));
    check('3. 「是你啦。」不重講',!has('是你啦。')); });

  await sec(4,async()=>{ if(!ok0){ check('4. 讓我想一下',false); return; } const a=A751.HEART, tk=a.confessOpts[2];
    const s=await dinner(PS,'Y1S2',[0,0,0,tk.t]); const T=said();
    check('4. 選「……讓我想一下，好不好。」＝她的回話兩句，就結束（沒有 yes、沒有另外一組選項）',tk.result==='think'&&J(T.slice(-2))===J(tk.re)&&!has(flat(a.yes)[0])&&CH.length===4,J(T.slice(-4)));
    check('4. 這學期不交往、記 think[沛珊]＝這學期、結果 think',!dating(s.G,PS)&&TERMEND.rec(s.G).think[PS]==='Y1S2'&&s.r==='think',J([TERMEND.rec(s.G).think,s.r]));
    const h=TERMEND.heart(PS,'Y3S1'); check('4. 下學期的邀約句＝invite2「…你上次欠我一杯飲料，還有一個答案。」',h.invite2===a.invite2&&h.invite===a.invite);
    const s2=await dinner(PS,'Y3S1',[0,ANS[0]],G=>{ TERMEND.rec(G).think[PS]='Y1S2'; }); const T2=said();
    check('4. 第二次：回家路上 → she2 →（稿沒有寫這裡的選項＝共用的「好。／讓我想想。」）→「好。」＝yes2、交往、think 清掉',seq(T2,flat(a.walk).concat(flat(a.she2),flat(a.yes2)))&&J(CH[CH.length-1])===J(ANS)&&dating(s2.G,PS)&&TERMEND.rec(s2.G).think[PS]==null&&s2.r==='sheSaid',J([T2.slice(-8),CH[CH.length-1],s2.r]));
    check('4. 第二次不再演「你猜是誰」、不演第一次的 she、不演 yesLead',!has(flat(a.guess.say)[0])&&!has('是你啦。')&&!has(flat(a.confessOpts[0].yesLead)[1]));
    const s3=await dinner(PS,'Y3S1',[0,ANS[1]],G=>{ TERMEND.rec(G).think[PS]='Y1S2'; });
    check('4. 第二次選「讓我想想。」＝她照 think 那個選項的回話、不交往、think 改記這學期',J(said().slice(-2))===J(tk.re)&&!dating(s3.G,PS)&&TERMEND.rec(s3.G).think[PS]==='Y3S1'&&s3.r==='think',J(said().slice(-3))); });

  await sec(5,async()=>{ if(!ok0){ check('5. 大四上',false); return; } const a=A751.HEART, y=a.over_Y4S1;
    const s=await dinner(PS,'Y4S1',[0,y.answer[0]]); const T=said();
    check('5. 大四上第一次：回家路上 → she 換成那三句 → 兩個選項（不演猜、不出三個回應）',seq(T,flat(a.walk).concat(flat(y.she)))&&J(CH[CH.length-1])===J(y.answer)&&CH.length===2&&!has(flat(a.guess.say)[0]),J([T.slice(-8),CH]));
    check('5. 「好。從這頓飯開始。」＝接 yes、交往',J(T.slice(-flat(a.yes).length))===J(flat(a.yes))&&dating(s.G,PS)&&s.r==='sheSaid');
    const s2=await dinner(PS,'Y4S1',[0,y.answer[1]]);
    check('5. 「……讓我想一下。」＝不交往、記 think（稿沒寫她這時候回什麼：不說話）',!dating(s2.G,PS)&&TERMEND.rec(s2.G).think[PS]==='Y4S1'&&said()[said().length-1]===flat(y.she).pop(),J(said().slice(-2)));
    const h=TERMEND.heart(PS,'Y4S1'); check('5. 大四上在台南（地點照 AA_282：over 照舊）',h.place==='eatery_tn'&&h.fare===2700&&h.walkCaption==='台南・往她租的地方'); });

  await sec(6,async()=>{ if(!ok0){ check('6. 芷若',false); return; } const b=A748.HEART[ZR], co=A748.confessOpts[ZR].opts, to=A748.tableOpts[ZR].opts, P=Lx.PLACE.cafe;
    const s=await dinner(ZR,'Y1S2',[to[1].t,co[0].t]); const T=said();
    check('6. 開場＝她飯桌的旁白（店還開著、還有兩桌客人、沒有脫圍裙回吧台）；不念打烊的開場、收尾',T[0]===b.table[0].narr&&!has(P.open)&&!has(P.close),J(T.slice(0,3)));
    check('6. 飯桌句 → 選項 → 她的回答',seq(T,flat(b.table).concat(flat(to[1].re)))&&CH[0].length===3,J(CH[0]));
    check('6. 她寫在杯套上（she 六句）→ 直接三個回應',sub(T,flat(b.she))&&J(CH[CH.length-1])===J(co.map(o=>o.t)),J(CH[CH.length-1]));
    check('6. 選「（拿起筆…寫：好。）」＝yesLead 接 yes，交往；最後是收尾旁白「（她脫下圍裙。你們去吃了宵夜。）」',seq(T,flat(b.she).concat(flat(co[0].yesLead),flat(b.yes),['（她脫下圍裙。你們去吃了宵夜。）']))&&T[T.length-1]==='（她脫下圍裙。你們去吃了宵夜。）'&&dating(s.G,ZR)&&s.r==='sheSaid',J(T.slice(-6)));
    check('6. 沒有「好。／讓我想想。」「（先不說）」；不走路（沒有換到巷口：背景都是店裡那一張）',!CH.some(c=>c.includes(ANS[0])||c.includes(Lx.NOT_YET_OPT))&&H.bgs.every(x=>x===H.bgs[0]),J(H.bgs));
    const s1=await dinner(ZR,'Y1S2',[0,co[1].t]); check('6. 第二個回應也是答應（yesLead 兩句接 yes）',seq(said(),flat(co[1].yesLead).concat(flat(b.yes)))&&dating(s1.G,ZR),J(said().slice(-5)));
    const s2=await dinner(ZR,'Y1S2',[0,co[2].t]); const T2=said();
    check('6. 「……讓我想一下。這杯我先喝完。」＝她的回話兩句、不交往、記 think；收尾旁白照演',co[2].result==='think'&&seq(T2,flat(co[2].re).concat(['（她脫下圍裙。你們去吃了宵夜。）']))&&!dating(s2.G,ZR)&&TERMEND.rec(s2.G).think[ZR]==='Y1S2'&&s2.r==='think',J(T2.slice(-4)));
    const s3=await dinner(ZR,'Y2S1',[0,ANS[0]],G=>{ TERMEND.rec(G).think[ZR]='Y1S2'; });
    check('6. 第二次：she2（杯套上「一樣。」）→「好。」＝yes2、交往',seq(said(),flat(b.she2).concat(flat(b.yes2)))&&dating(s3.G,ZR)&&!sub(said(),flat(b.she))&&J(CH[CH.length-1])===J(ANS),J(said().slice(-6)));
    const hv=t=>{ const h=TERMEND.heart(ZR,t), r=x=>typeof x==='function'?x({flags:{}}):x; return [r(h.invite),r(h.invite2),h.h,h.wd,h.place]; };
    check('6. 邀約的星期和時間照各學期她的班：大一上～大二上 22:00（第二次「禮拜五十點。老地方。」）；大三下週四 22:00（「這禮拜四…」「禮拜四十點。老地方。」）',
      ['Y1S1','Y1S2','Y2S1'].every(t=>J(hv(t))===J([b.inviteHeart,'禮拜五十點。老地方。',22,5,'cafe']))&&J(hv('Y3S2'))===J(['這禮拜四你來店裡等我下班。先不要吃太飽。','禮拜四十點。老地方。',22,4,'cafe']),J([hv('Y1S2'),hv('Y3S2')]));
    check('6. 大二下（她不排班了＝那天回來代班）：一樣在店裡 21:00、週五；邀約週五晚上才到＝「下禮拜五…」（照 AA_689 同一格的處理）',J(hv('Y2S2'))===J(['下禮拜五你來店裡等我下班。先不要吃太飽。',b.invite2,21,5,'cafe']),J(hv('Y2S2')));
    check('6. 婉拒句照現有的（AA_748 沒有換）',TERMEND.heart(ZR,'Y1S2').decline==='好啊。那來店裡，我請你一杯。'); });

  await sec(7,async()=>{ const ZQ='heroine_04', h=TERMEND.heart(ZQ,'Y1S2');
    const s=await dinner(ZQ,'Y1S2',[0,Lx.NOT_YET_OPT,ANS[0]]); const pre=CH[CH.length-2];
    check('7. 子晴（玩家先說的原本流程）：說出來的三句＋「（先不說）」四個選項',h.mode!=='sheFirst'&&pre.length===4&&pre[3]===Lx.NOT_YET_OPT,J(pre));
    check('7. 選「（先不說）」→ 她說 →「好。／讓我想想。」→ 好＝交往',sub(said(),flat(h.she))&&J(CH[CH.length-1])===J(ANS)&&dating(s.G,ZQ)&&s.r==='sheSaid',J([CH[CH.length-1],s.r]));
    const s2=await dinner(ZQ,'Y1S2',[0,0]); check('7. 子晴玩家先說出來＝答應（yes）',dating(s2.G,ZQ)&&s2.r==='yes',s2.r); });

  await sec(8,async()=>{ if(!ok0){ check('8. 舊存檔',false); return; } const w=TERMEND.windowOf('Y1S2');
    const mk=(who,f)=>{ const G=H.fresh(DAY.Y1S2,18.5,null,f||null); H.rel(who,65,50,45); SOCIAL.adjust(who,{npcRom:40}); const Lg=DATE.log(G,who); Lg.count=4; Lg.wish=true; return G; };
    for(const who of [PS,ZR]){ const G=mk(who); const a=TERMEND.heartWhy(G,who,w); ROM.start(G,who); const b=TERMEND.heartWhy(G,who,w);
      check('8. '+who+'：條件到齊＝發心意邀約；已經交往的存檔＝不發（走女朋友的學期末約會）',a===true&&b===false,J([a,b])); }
    { const G=mk(PS); TERMEND.rec(G).think[PS]='Y1S1'; H.said=[]; CH=[]; WANT=[ANS[0]]; const r=await TERMEND.walkHome(GM,PS,'Y1S2');
      check('8. 上學期（舊流程）選過「讓我想想」的存檔：這學期直接走第二次（she2 →「好。」＝交往）',sub(said(),flat(A751.HEART.she2).concat(flat(A751.HEART.yes2)))&&r==='sheSaid'&&dating(G,PS),J([r,said().slice(-4)])); }
    const keep=globalThis.TERMEND_OPTS; globalThis.TERMEND_OPTS=null;
    try{ const G=mk(PS), G2=mk(ZR), G3=mk('heroine_04');
      check('8. 沒有 TERMEND_OPTS（舊資料）：這兩位沒有邀約句＝不發心意邀約（不會傳出空白訊息）；其他人照舊發',TERMEND.heartWhy(G,PS,w)===false&&TERMEND.heartWhy(G2,ZR,w)===false&&TERMEND.heartWhy(G3,'heroine_04',w)===true); }
    finally{ globalThis.TERMEND_OPTS=keep; } });

  await sec(9,async()=>{ if(!ok0){ check('9. 玩家自己約芷若',false); return; } const w=TERMEND.windowOf('Y1S2'), day=H.D(DAY.Y1S2);   /* 6/20：沛珊這時候沒有交往對象（大一下她 4/6 起和柏翰在一起的那一段已經結束）*/
    const mk=who=>{ const G=H.fresh(DAY.Y1S2,12,null,null); H.rel(who,65,50,45); SOCIAL.adjust(who,{npcRom:40}); const Lg=DATE.log(G,who); Lg.count=4; Lg.wish=true; return G; };
    const G=mk(ZR), r=TERMEND.playerInvite(G,ZR,{kind:'meal',id:'noodle'},{day,h:18.5});
    const G2=mk('heroine_04'), r2=TERMEND.playerInvite(G2,'heroine_04',{kind:'meal',id:'noodle'},{day,h:18.5});
    const G3=mk(PS), r3=TERMEND.playerInvite(G3,PS,{kind:'meal',id:'noodle'},{day,h:18.5});
    check('9. 心意條件到齊時自己約芷若吃飯＝照一般的吃飯（不算期末飯、不佔名額，她那一則照常會傳）；子晴、沛珊照舊＝心意的期末飯',r===null&&!!r2&&r2.kind==='heart'&&!!r3&&r3.kind==='heart',J([r,r2&&r2.kind,r3&&r3.kind])); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
