// 期末飯給玩家選項（TERMEND-OPTS-1110；使用者 X324／X325「期末飯要有選項」）——不需要瀏覽器（D131）。
// 稿：企劃線 AA_749_termend_gf_v2.json（女朋友版）、AA_748_termend_heart_v2.json（心意邀約的飯桌選項、祐廷說出來的選項）@da2f67faa、AA_749_termend_kx_v2.json（可昕）@1cf434dee（選項的 set）；
//     tools/story/import_termend_opts.py → src/data/termend_opts.js（TERMEND_OPTS），播放 src/termend3d.js。
//   1. 匯入：--check 通過；只有白名單 people 列的人（女朋友版：以安、語彤、學姊、芷若、子晴；心意：以安、語彤、學姊、子晴；可昕六頓）；沛珊、芷若的心意邀約不在
//   2. 女朋友版五位每一頓都有選項、字照稿；祐廷不自動回「嗯。」；不接朋友的話題池
//   3. 選項的效果、共用上限（一頓飯她的戀愛最多 +2；心意的飯＝告白那一晚 +3）
//   4. 顯示順序洗過：同一天（讀檔以後）一樣、效果跟著選項走；+2 不再幾乎都排第一個
//   5. 子晴通用那一格 Q6／noQ6 兩組各三個；學姊大四上 snow 分支（SNOWQ）、XM3 兩句照舊；學姊大二上她請的那一句；語彤 sayByKind、YT_DINNER_YES
//   6. 心意的邀約：飯桌句之後的選項（學姊大四上換句的那一頓沒有）；說出來的三句（子晴兩組、語彤沒有 YT_MET_JOB 照原本）、yesLead 接在 yes 前面
//   7. 可昕：say＋選項＋then；有選項稿的學期不再接 KX_ASK 的二選一（AA 11-10），KX_KHH／KX_Y5_CALL 照選項的 set 記；美國路線那一組
//   9. 鉤子（AA 11-10 回 LAWWW）：以安女朋友版大二下（京都）不念鉤子的 say、直接出選項；子晴女朋友版大一下 Q6 通用格——選「（現在玩。）」鉤子整個不出、另外兩個不念 say 直接出選項、沒有 Q6 照常念
//   8. 沒匯入的人照現在的字：沛珊女朋友版（一句＋話題池）、芷若心意邀約（沒有飯桌選項、通用三句）；沒有 TERMEND_OPTS（舊資料）＝全部照原本；舊存檔（沒有 G.termend）照演
// 修改前（b99dfd4dd）：沒有 TERMEND_OPTS、女朋友版沒有選項——第 1～7 節 FAIL。用法：node tests/termend_opts_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); for(const w of WANT){ const k=T.indexOf(w); if(k>=0) return k; } return 0; };
const TOx=typeof TERMEND_OPTS!=='undefined'?TERMEND_OPTS:null, Lx=TERMEND_LINES, ok0=!!TOx&&typeof TERMEND.optEntry==='function';
const DAY={Y1S1:'2026-01-16',Y1S2:'2026-06-20',Y2S1:'2027-01-15',Y2S2:'2027-06-19',Y3S1:'2028-01-14',Y3S2:'2028-06-17',Y4S1:'2028-12-24',Y5S1:'2029-12-20'};
const said=()=>H.said.map(s=>s.t), idx=t=>said().indexOf(t), has=t=>idx(t)>=0;
const love=id=>+SOCIAL.rel(id).npcRom||0;
const flat=a=>[].concat(...(a||[]).map(x=>typeof x==='string'?[x]:(x&&x.narr?[x.narr]:[])));
const dinner=async(who,term,kind,want,flags,pre)=>{ const G=H.fresh(DAY[term],18.5,null,flags); H.rel(who,65,50,45); SOCIAL.adjust(who,{npcRom:40}); if(kind==='gf') G.flags['dating_'+who]=true; if(pre) pre(G); H.said=[]; CH=[]; WANT=want||[]; const l0=love(who);
  await TERMEND.dinner(GM,{te:{term,who,kind}}); return {G,dl:love(who)-l0}; };
const poolOf=(term,who)=>flat(((Lx.POOL[term]||{})[who]||[]).map(x=>typeof x==='function'?null:x).filter(Boolean));
const GFP=['heroine_01','heroine_03','heroine_05','heroine_02','heroine_04'], HP=['heroine_01','heroine_03','heroine_05','heroine_04'];

(async()=>{
  await sec(1,async()=>{ let out=''; try{ out=cp.execFileSync('python3',['tools/story/import_termend_opts.py','--check'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ out=String(e.stderr||e.message); }
    check('1. 匯入工具 --check：src/data/termend_opts.js 和白名單的稿一樣',/^OK /.test(out),out.slice(0,200));
    /* 2026-11-11 改期望（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；AA_751@33a1769f8）：女朋友版多了沛珊（來源 AA_751，不是 AA_749 那一份）——原本期望「只有五位（沒有沛珊）」。芷若、沛珊的心意邀約在 TERMEND_OPTS.HEART（她先說），不在 TABLE／CONFESS */
    check('1. 女朋友版六位（AA_749 的五位＋AA_751 的沛珊；沒有芯慈）；心意邀約的飯桌選項、說出來的選項只有四位（芷若、沛珊在 HEART）；可昕六頓',ok0&&J(Object.keys(TOx.GF).sort())===J(GFP.concat(['classmate_peishan']).sort())&&J(Object.keys(TOx.TABLE).sort())===J(HP.slice().sort())&&J(Object.keys(TOx.CONFESS).sort())===J(HP.slice().sort())&&J(Object.keys(TOx.KX))===J(['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y5S1']),ok0?J([Object.keys(TOx.GF),Object.keys(TOx.TABLE),Object.keys(TOx.CONFESS),Object.keys(TOx.KX)]):'沒有 TERMEND_OPTS');
    const txt=require('fs').readFileSync(require('path').join(H.ROOT,'src/data/termend_opts.js'),'utf8');
    /* 2026-11-11 改期望（PEISHAN-VOICE-1110／SHE-FIRST-1110）：沛珊重寫好了（AA_751@33a1769f8）、匯進這個檔——原本整個檔不能出現 peishan；現在查的是重寫前的句子一句都沒有 */
    check('1. 檔裡沒有沛珊重寫前的句子、沒有不該帶進來的欄位（note、sayMore）',ok0&&!/蛋餅|早餐店|我有問題想問你|那我問最後一個問題|我可以問一個奇怪的問題嗎|我有一堆問題想問你|下次再問你問題|"note"|sayMore/.test(txt)); });

  await sec(2,async()=>{ if(!ok0){ check('2. 女朋友版五位每一頓都有選項',false,'沒有 TERMEND_OPTS'); return; }
    const bad=[]; let n=0;
    for(const who of GFP){ const g=TOx.GF[who], spec=Lx.GF[who];
      const terms=Object.keys(DAY).filter(t=>!(who==='heroine_05'&&t==='Y1S1'));
      for(const term of terms){ const E=g.tableByTerm[term]||g.table; n++;
        const {G}=await dinner(who,term,'gf'); const S0=said();
        const vis=E.opts.filter(o=>TERMEND.optIf(G,o.if,term)), grp=CH.find(c=>c.length===vis.length&&vis.every(o=>c.includes(o.t)));
        const say=(E.says.find(s=>TERMEND.optIf(G,s.if,term))||{}).say, sayOk=flat(say).every(t=>S0.includes(t.replace('{name}','祐廷')));
        const picked=grp&&vis.find(o=>o.t===grp[0]), reOk=picked&&flat(picked.re).every(t=>S0.includes(t.replace('{name}','祐廷')));
        const auto=H.said.some(s=>s.who==='祐廷'&&Lx.REPLY.includes(s.t)), pool=poolOf(term,who).filter(t=>S0.includes(t)&&!flat(say).includes(t));
        if(!grp||vis.length<3||!sayOk||!reOk||auto||pool.length) bad.push([who,term,{grp:!!grp,n:vis.length,sayOk,reOk:!!reOk,auto,pool}]); } }
    check('2. 女朋友版五位 '+n+' 頓：她說的開頭照稿、三個選項照稿、選了以後她的回答照稿；祐廷不自動回「嗯。」；不接朋友的話題池',n>=38&&bad.length===0,J(bad.slice(0,4)));
    /* 逐字抽樣（每個人一頓） */
    const S1=[['heroine_01','Y2S1','寒假我去東京兩個禮拜。','「我每天晚上打給妳。」','十點以後。我十點以前在上課。'],['heroine_03','Y3S1','一杯是你的。我幫你喝了。','「那妳欠我一杯。」','我有多買。'],
      ['heroine_05','Y3S2','你幫我看。我總覺得少了什麼。','「少了我。」','那個超重。帶不了。'],['heroine_02','Y2S1',null,null,null],['heroine_04','Y3S1','期末專題，我挑了一個可能做不完的題目。','「需要人測試的時候找我。」','你本來就是。你沒有選擇。']];
    const b2=[]; for(const [who,term,s,t,r] of S1){ if(!s) continue; await dinner(who,term,'gf',[t]); if(!(has(s)&&CH.some(c=>c.includes(t))&&has(r)&&idx(r)>idx(s))) b2.push([who,term,said().slice(0,8)]); }
    check('2. 逐字抽樣（以安大二上、語彤大三上、學姊大三下、子晴大三上）：開頭 → 選項 → 她的回答',b2.length===0,J(b2));
    await dinner('heroine_05','Y3S2','gf',['「少了我。」']); check('2. 學姊交往中叫「林祐廷」（稿寫 林{name}）、旁白照旁白',has('林祐廷。')&&H.said.some(s=>s.who===null&&s.t==='（她低頭笑了很久。）'),J(H.said.slice(0,8)));
    const z=TOx.GF.heroine_02; await dinner('heroine_02','Y2S2','gf',[z.tableByTerm.Y2S2.opts[0].t]); check('2. 芷若女朋友版（大二下）也有選項',has(flat(z.tableByTerm.Y2S2.says[0].say)[0])&&has(flat(z.tableByTerm.Y2S2.opts[0].re)[0]),J(said().slice(0,6))); });

  await sec(3,async()=>{ if(!ok0){ check('3. 選項的效果',false,'沒有 TERMEND_OPTS'); return; }
    const a=await dinner('heroine_01','Y2S1','gf',['「我每天晚上打給妳。」']), b=await dinner('heroine_01','Y2S1','gf',['「兩個禮拜很快。」']); const r0=H.G;
    const c=await dinner('heroine_01','Y2S1','gf',['「要我幫妳顧什麼嗎？」']);
    check('3. 以安大二上：+2 的選項＝她的戀愛 +2、+1 的 +1、fr -1 的不加戀愛（熟悉扣）',a.dl===2&&c.dl===1&&b.dl===0,J([a.dl,b.dl,c.dl]));
    /* 學姊大四上美國路線 SNOWQ：兩組選項都 +2＝這頓飯一共 +2 */
    const us=G=>{ G.flags.EXCHANGE_ROUTE='US'; G.flags.US_SNOW_QUIET=G.day-20; };
    const s=await dinner('heroine_05','Y4S1','gf',['「那吃快一點，我送妳回去睡。」','「妳現在想知道嗎？」'],null,us);
    const snowOn=Lx.COND.SNOWQ(s.G);
    check('3. 共用上限：學姊大四上（SNOWQ）兩組選項各 +2＝這頓飯她的戀愛一共 +2（鍵 termend:<天>）',snowOn&&has('我在飛機上想了十四個小時要點什麼。')&&has('可是我想先把那兩章改完。改完再想。')&&s.dl===2,J({snowOn,dl:s.dl,ch:CH}));
    /* 心意的飯＝告白那一晚：飯桌選項 +2、說出來的選項 +2 ＝ +3 */
    const hz=await dinner('heroine_04','Y1S2','heart',['「現在玩。手機拿來。」','「妳的關卡，以後都給我先玩。」'],null,G=>{ G.events.done.ev_ziqing_secret_game=G.day-30; });
    check('3. 心意的飯（告白那一晚）上限 +3：子晴飯桌選項 +2、說出來的選項 +2＝一共 +3',has('第五次你有進步。')&&hz.dl===3,J({dl:hz.dl,ch:CH,said:said().slice(-8)})); });

  await sec(4,async()=>{ if(!ok0){ check('4. 選項順序',false,'沒有 TERMEND_OPTS'); return; }
    const O=TOx.GF.heroine_05.tableByTerm.Y2S2.opts, G1={day:500}, G2={day:500};
    const p1=TERMEND.shuffled(G1,'heroine_05',O,'Y2S2|gf'), p2=TERMEND.shuffled(JSON.parse(J(G2)),'heroine_05',O,'Y2S2|gf');
    check('4. 同一天、同一個人、同一組：順序一樣（存檔讀回來也一樣）；洗的是整個選項（效果跟著走）、不多不少',J(p1)===J(p2)&&p1.length===O.length&&O.every(o=>p1.includes(o)));
    const seen=new Set(); for(let d=500;d<540;d++) seen.add(TERMEND.shuffled({day:d},'heroine_05',O,'Y2S2|gf').map(o=>O.indexOf(o)).join('')); check('4. 不同天順序會不一樣（40 天裡至少 4 種排法）',seen.size>=4,[...seen].join(' '));
    /* 實際演：同一天演兩次，選項順序一樣；選第二個顯示的＝那個選項自己的回答和效果 */
    await dinner('heroine_05','Y2S2','gf'); const g1=CH[0].slice(); const r=await dinner('heroine_05','Y2S2','gf',[g1[1]]); const g2=CH[0].slice(), o=O.find(x=>x.t===g1[1]);
    check('4. 同一天演兩次順序一樣；選顯示的第二個＝它自己的回答、自己的效果',J(g1)===J(g2)&&flat(o.re).every(has)&&r.dl===((o.fx&&o.fx.love)||0),J({g1,g2,dl:r.dl}));
    /* +2 排第一個的頓數：稿上 29／36；洗過以後明顯變少 */
    let first=0, raw=0, n=0; for(const who of GFP){ const g=TOx.GF[who]; for(const [k,E] of [['table',g.table]].concat(Object.entries(g.tableByTerm))){ const term=k==='table'?'Y1S2':k, G={day:H.D(DAY[term]),flags:{},events:{done:{}}};
      const vis=E.opts.filter(o=>TERMEND.optIf(G,o.if,term)), mx=Math.max(...vis.map(o=>(o.fx&&o.fx.love)||0)), sh=TERMEND.shuffled(G,who,vis,term+'|gf'); n++;
      if(((vis[0].fx&&vis[0].fx.love)||0)===mx) raw++; if(((sh[0].fx&&sh[0].fx.love)||0)===mx) first++; } }
    check('4. '+n+' 頓裡加最多的選項排第一個：稿上 '+raw+' 頓，洗過以後 '+first+' 頓（不到七成）',first<raw&&first<=n*0.7,J({n,raw,first}));
    const k0=TERMEND.SHUFFLE; TERMEND.SHUFFLE=false; await dinner('heroine_05','Y2S2','gf'); TERMEND.SHUFFLE=k0; check('4. TERMEND.SHUFFLE=false＝照稿的順序',J(CH[0])===J(O.map(o=>o.t))); });

  await sec(5,async()=>{ if(!ok0){ check('5. 特別的結構',false,'沒有 TERMEND_OPTS'); return; }
    const NQ=['「那是在幹嘛？」','「妳要睡覺。」','「我以為妳都在打電動。」'], Q=['（現在玩。）','「改了哪裡？」','「吃完再玩。」'];
    await dinner('heroine_04','Y1S1','gf',['「那是在幹嘛？」']); const a={say:has('這學期熬了很多夜。')&&has('有幾個晚上不是在寫程式。'),grp:J(CH[0].slice().sort())===J(NQ.slice().sort()),re:has('最後都只傳「睡了嗎」。')};
    await dinner('heroine_04','Y1S2','gf',['（現在玩。）'],null,G=>{ G.events.done.ev_ziqing_secret_game=G.day-30; }); const b={say:has('你測過的那一關，我改完了。')&&has('（她把手機推過來，螢幕已經開好了。）')&&!has('這學期熬了很多夜。'),grp:J(CH[0].slice().sort())===J(Q.slice().sort()),re:has('只加寬一點。不是放水。')};
    check('5. 子晴通用那一格：還不知道她在做遊戲（noQ6）＝熬夜那一組三個；知道（Q6）＝關卡那一組三個、開頭換 sayQ6',a.say&&a.grp&&a.re&&b.say&&b.grp&&b.re,J({a,b,ch:CH[0]}));
    /* 學姊大四上：snow 分支只在 SNOWQ；XM3 兩句照舊接在第一組選項後面；BK470 照舊 */
    const us=G=>{ G.flags.EXCHANGE_ROUTE='US'; G.flags.US_SNOW_QUIET=G.day-20; G.flags.SIS_XMAS_Y3='there'; };
    await dinner('heroine_05','Y4S1','gf',['「妳黑眼圈很重。」','（把她放下的筷子擺好，等她。）'],null,us);
    const i={o1:idx('謝謝你的觀察。'),xm:idx('去年在研究室說的。剛回來一天。'),xm2:idx('……我們做到了。'),sn:idx('下雪那天，我說回來再跟你講。'),sn2:idx('我其實不知道。'),re:idx('講出來沒有我想的那麼可怕。'),old:idx('美國下雪那天，我說回去再跟你說。'),n:CH.filter(c=>c.length===3).length};
    check('5. 學姊大四上美國路線（SNOWQ）：開頭 → 選項 → XM3 兩句 → 下雪那一段五行 → 第二組選項 → 她的回答；舊的三句不再說',i.o1>=0&&i.xm>i.o1&&i.xm2===i.xm+1&&i.sn>i.xm2&&i.sn2>i.sn&&i.re>i.sn2&&i.old<0&&i.n===2,J(i));
    await dinner('heroine_05','Y4S1','gf'); check('5. 臺灣路線（沒有 SNOWQ）：只有一組選項、沒有下雪那一段',CH.filter(c=>c.length===3).length===1&&!has('下雪那天，我說回來再跟你講。')&&has('可是這頓我不想錯過。'),J(CH));
    await dinner('heroine_05','Y2S1','gf',['「所以今天是慶祝。」']); const p1={she:idx('這頓我請。你不要搶。'),re:idx('我要點甜的。兩個。'),old:has('……第三次他說可以。這一頓我請。')};
    await dinner('heroine_05','Y2S1','gf',['「所以今天是慶祝。」'],{SIS15_YOUPAY:true}); const p2={she:has('這頓我請。你不要搶。'),last:has('說好你請。')};
    check('5. 學姊大二上：她請（沒有 YOUPAY）＝選項後面多「這頓我請。你不要搶。」；你請（YOUPAY）＝不說，收尾照舊「說好你請。」',p1.she>p1.re&&p1.re>=0&&!p1.old&&!p2.she&&p2.last,J({p1,p2}));
    /* 語彤 sayByKind */
    const w=await dinner('heroine_03','Y1S1','gf',['「我去。哪一天？」']); const k1={say:has('秀琴姨說，放假以前要煮一桌給你吃。')&&has('（打烊後的茶屋只開了吧檯上面那一盞燈。她把茶推過來。）'),flag:w.G.flags.YT_DINNER_YES===w.G.day&&w.G.flags.YT_MOM_ASKED===w.G.day,re:has('我明天再跟她講。今天先不要。')};
    const s=await dinner('heroine_03','Y1S2','gf',['「我真的很忙啊。」']); const k2={say:has('我媽問你暑假要不要來吃飯。')&&has('我說你暑假很忙。')&&!has('秀琴姨說，放假以前要煮一桌給你吃。'),noFlag:s.G.flags.YT_DINNER_YES==null&&s.G.flags.YT_MOM_ASKED===s.G.day};
    await dinner('heroine_03','Y2S1','gf'); const k3={say:has('秀琴姨又問了。')&&has('我說再等等。')&&!has('我媽問你暑假要不要來吃飯。')}, same=CH[0]&&CH[0].length===3&&CH[0].includes('「妳想要我去嗎？」');
    check('5. 語彤通用那一格 sayByKind：大一上＝預設、大一下（夏天）、大二上各自的開頭，三個選項都一樣；聽過記 YT_MOM_ASKED、選「我去」多記 YT_DINNER_YES',k1.say&&k1.flag&&k1.re&&k2.say&&k2.noFlag&&k3.say&&same,J({k1,k2,k3})); });

  await sec(6,async()=>{ if(!ok0){ check('6. 心意的邀約',false,'沒有 TERMEND_OPTS'); return; }
    const T=TOx.TABLE; const bad=[];
    for(const who of HP){ const term=who==='heroine_05'?'Y1S2':'Y1S2'; const {G}=await dinner(who,term,'heart'); const tl=TERMEND.heart(who,term).table, t=typeof tl==='function'?tl(G):tl;
      const vis=T[who].opts.filter(o=>TERMEND.optIf(G,o.if,term)), grp=CH.find(c=>vis.length===c.length&&vis.every(o=>c.includes(o.t)));
      if(!T[who].after.includes(t)||!grp||idx(t)<0||!flat(vis.find(o=>o.t===grp[0]).re).every(has)) bad.push([who,t,CH]); }
    check('6. 以安、語彤、學姊、子晴的心意的飯：飯桌那一句（和稿的 after 一字不差）之後接選項、她的回答照稿',bad.length===0,J(bad).slice(0,400));
    await dinner('heroine_05','Y1S2','heart'); const g1=CH[0]; await dinner('heroine_05','Y2S1','heart'); const g2=CH[0];
    check('6. 學姊第三個選項：大四那年（2026-09 以前）「又是考古題？」、上法研所以後「又是論文？」',g1.includes('「又是考古題？」')&&!g1.includes('「又是論文？」')&&g2.includes('「又是論文？」')&&!g2.includes('「又是考古題？」'),J([g1,g2]));
    await dinner('heroine_05','Y1S2','heart',['「又是考古題？」']); check('6. 「又是考古題？」→「不是。考古題我都送人了。」',has('不是。考古題我都送人了。')&&!has('你怎麼什麼都猜論文。'));
    await dinner('heroine_05','Y4S1','heart'); check('6. 學姊大四上飯桌句換了（不是稿的 after）＝那一頓沒有飯桌選項',has('這學期過完了。……下學期的事，我還沒想。')&&!CH.some(c=>c.includes('「什麼事？」')),J(CH));
    const nq=await dinner('heroine_04','Y1S1','heart',['「什麼時候可以看？」']); const tq=CH.find(c=>c.includes('「什麼時候可以看？」'));
    check('6. 子晴還不知道（noQ6）：飯桌選項兩個、說出來的第二句「我們可以不只是朋友嗎？」',!!tq&&tq.length===2&&has('等我覺得它不丟臉的時候。')&&CH.some(c=>J(c)===J(['「我喜歡妳。」','「我們可以不只是朋友嗎？」','「我喜歡妳。妳不用現在回答。」','（先不說）'])),J(CH));
    const q=await dinner('heroine_04','Y1S2','heart',['「現在玩。手機拿來。」','「妳的關卡，以後都給我先玩。」'],null,G=>{ G.events.done.ev_ziqing_secret_game=G.day-30; });
    const cq=CH.find(c=>c.includes('（先不說）')), yl=idx('這是告白嗎？'), yl2=idx('……算是。好。');
    check('6. 子晴知道（Q6）：說出來的三句＝「我喜歡妳。」「妳的關卡，以後都給我先玩。」「我喜歡妳。妳不用現在回答。」＋（先不說）第四個（不洗）；選第二句＝她答應前多兩句；交往',J(cq)===J(['「我喜歡妳。」','「妳的關卡，以後都給我先玩。」','「我喜歡妳。妳不用現在回答。」','（先不說）'])&&yl>=0&&yl2===yl+1&&q.G.flags.dating_heroine_04===true&&TERMEND.rec(q.G,'Y1S2').result==='yes',J({cq,yl,res:TERMEND.rec(q.G,'Y1S2').result,tail:said().slice(-6)}));
    check('6. 「現在玩」＝時間多走 15 分鐘（稿的 time）',Math.abs(q.G.hour-18.75)<1e-6,String(q.G.hour));
    const an=await dinner('heroine_01','Y1S2','heart',['「這家妳怎麼找到的？」','「那一頁最下面，可以寫我的名字嗎？」']); const ca=CH.find(c=>c.includes('（先不說）'));
    check('6. 以安：第二句換「那一頁最下面，可以寫我的名字嗎？」，選了＝「……已經寫了。」「「和你」就是。」接在她答應前面',J(ca)===J(['「我喜歡妳。」','「那一頁最下面，可以寫我的名字嗎？」','「我喜歡妳。妳不用現在回答。」','（先不說）'])&&idx('「和你」就是。')===idx('……已經寫了。')+1&&idx('……已經寫了。')>=0&&an.G.flags.dating_heroine_01===true,J({ca,tail:said().slice(-6)}));
    await dinner('heroine_03','Y1S2','heart',['「下次上班，我可以坐妳旁邊嗎？」']); const c3=CH.find(c=>c.includes('（先不說）')), y3=idx('下班可以。'), y3ok=y3>=0&&idx('上班的時候不行。蘇姨會看。')===y3-1;
    const o3=CONFESS_LINES.heroine_03.choice.map(x=>x.t);
    await dinner('heroine_03','Y1S2','heart',[],null,G=>{ G.flags.YT_MET_JOB=false; }); const c3b=CH.find(c=>c.includes('（先不說）'));
    check('6. 語彤：在茶屋認識的（YT_MET_JOB）第二句「下次上班，我可以坐妳旁邊嗎？」＋答應前兩句；沒有那個旗標＝第二句照遊戲原本的',!!c3&&c3[1]==='「下次上班，我可以坐妳旁邊嗎？」'&&y3ok&&!!c3b&&c3b[1]===o3[1]&&c3b.length===4,J({c3,c3b,o3}));
    await dinner('heroine_05','Y1S2','heart',['「又是考古題？」','「學姊，我不想只當直屬。」']); const y5=idx('我知道。'), n5=idx('（她手上拿著一張摺過的小便條。從吃飯的時候就一直拿著。）');
    check('6. 學姊：「學姊，我不想只當直屬。」＝「我知道。」「你今天一口飯嚼了很久。」接在便條那一句旁白前面',y5>=0&&idx('你今天一口飯嚼了很久。')===y5+1&&n5===y5+2,J(said().slice(-8)));
    await dinner('heroine_04','Y1S2','heart',['（先不說）']); check('6. （先不說）＝照原本她先說、沒有 yesLead',has('……你不講，那我講喔。')&&!has('這是告白嗎？')); });

  await sec(7,async()=>{ if(!ok0){ check('7. 可昕',false,'沒有 TERMEND_OPTS'); return; }
    const kx=async(term,want,pre)=>{ const G=H.fresh(DAY[term],18); H.rel('kexin',65,50,45); G.flags.dating_kexin=true; if(pre) pre(G); H.said=[]; CH=[]; WANT=want||[]; const l0=love('kexin'); await TERMEND.dinner(GM,{te:{term,who:'kexin',kind:'kexin'}}); return {G,dl:love('kexin')-l0}; };
    const a=await kx('Y2S1',['「我去。妳排哪幾天？」','「好。哪幾天？」']);
    /* 2026-11-10 改期望（AA 11-10 經 LAWWW）：有選項稿的學期 KX_ASK 的二選一不再接在後面；KX_KHH.Y2W 由選項「我去。妳排哪幾天？」記 */
    /* 2026-11-11 改期望（AA 改斷句、意思不變；企劃線 bd1a6fda3：芷若、可昕、Alison、阿哲說的字改成一口氣講的寫法，113 處）：開頭兩句併成一句「寒假你來高雄，我家附近那個夜市你還沒去過，我已經跟我媽說了。」、回答「你住旅館喔，我家沒有多的房間，有也不給你住。」
       （原本「寒假你來高雄。」「我家附近那個夜市你還沒去過。我已經跟我媽說了。」「你住旅館喔，我家沒有多的房間。有也不給你住。」）*/
    check('7. 可昕大二上：開頭 → 三個選項 → 她的回答（+2）；不再接 KX_ASK 的二選一；選「我去。妳排哪幾天？」＝記 KX_KHH.Y2W yes',has('寒假你來高雄，我家附近那個夜市你還沒去過，我已經跟我媽說了。')&&CH.length===1&&CH[0].length===3&&has('你住旅館喔，我家沒有多的房間，有也不給你住。')&&a.dl===2&&a.G.flags.KX_KHH&&a.G.flags.KX_KHH.Y2W==='yes'&&!has('我們期末考完，你寒假來高雄。')&&!has('你自己挑。我那幾天都在。'),J({ch:CH,dl:a.dl,khh:a.G.flags.KX_KHH}));
    const a2=await kx('Y2S1',['「寒假我可能要打工。」']); /* 2026-11-10 三改期望（AA 回 LAWWW，企劃線 1cf434dee）：每個選項照稿的 set 記——false＝原本的「沒空」（KX_KHH.Y2W no，寒假第 5 天夜市照片那條）*/
    check('7. 選「寒假我可能要打工。」（set KX_KHH false）＝記 KX_KHH.Y2W no；只有一組選項',!!a2.G.flags.KX_KHH&&a2.G.flags.KX_KHH.Y2W==='no'&&CH.length===1,J({ch:CH,khh:a2.G.flags.KX_KHH||null}));
    const a3=await kx('Y2S1',['「妳跟妳媽說什麼？」']); check('7. 選「妳跟妳媽說什麼？」（set KX_KHH true）＝記 KX_KHH.Y2W yes',!!a3.G.flags.KX_KHH&&a3.G.flags.KX_KHH.Y2W==='yes',J(a3.G.flags.KX_KHH||null));
    const s1=await kx('Y3S2',['「那晚上講電話。」']), s2=await kx('Y3S2',['「那我去高雄找妳。」']), s3=await kx('Y3S2',['「幾天？」'],G=>{ G.flags.EXCHANGE_ROUTE='US'; }), usK=Lx.COND.US(H.G);
    /* 2026-11-11 改期望（AA 2026-11-10 23:4x 回 LAWWW）：大三下美國路線那一組三個選項都記 KX_KHH.Y3S yes（他八月才出發，七月「七月你空哪天。」照舊發；匯入工具 KX_US_YES）——原本期望「美國路線那一組不記」。其他學期的美國路線照舊不記 */
    check('7. 大三下：臺灣路線「那晚上講電話。」＝Y3S no、打上名字＝Y3S yes；美國路線那一組都記 Y3S yes（AA 11-10 23:4x）',s1.G.flags.KX_KHH.Y3S==='no'&&s2.G.flags.KX_KHH.Y3S==='yes'&&(!usK||(!!s3.G.flags.KX_KHH&&s3.G.flags.KX_KHH.Y3S==='yes')),J([s1.G.flags.KX_KHH,s2.G.flags.KX_KHH,s3.G.flags.KX_KHH||null,usK]));
    const y5=[]; for(const t of TOx.KX.Y5S1.opts.map(o=>o.t)){ const r=await kx('Y5S1',[t]); y5.push(r.G.flags.KX_Y5_CALL); } check('7. 大五上三個選項都記 KX_Y5_CALL（sat＝原本「週末一定打。」的值）、不記 KX_KHH',y5.length===3&&y5.every(v=>v==='sat')&&!H.G.flags.KX_KHH,J(y5));
    check('7. 資料：臺灣路線每個選項都有 khh 或 y5、美國路線那一組沒有（大三下例外：三個都是 Y3S yes）；沒有稿上的 set 原樣留著',Object.keys(TOx.KX).every(t=>TOx.KX[t].opts.every(o=>o.set===undefined&&(o.if==='US'?(t==='Y3S2'?(J(o.khh)===J(['Y3S','yes'])&&!o.y5):(!o.khh&&!o.y5)):(t==='Y5S1'?o.y5==='sat'&&!o.khh:Array.isArray(o.khh)&&['yes','no'].includes(o.khh[1]))))));
    const one=[]; for(const t of ['Y2S2','Y3S1','Y3S2','Y4S1','Y5S1']){ await kx(t,[]); if(CH.length!==1||CH[0].length!==3) one.push([t,CH]); } check('7. 大二下～大五上：各一組三個選項、後面沒有二選一',one.length===0,J(one));
    await kx('Y3S1',['「所以能不能？」']); /* 2026-11-11 改期望（AA 改斷句、意思不變；bd1a6fda3）：then「寒假你來高雄，去我們兩個都沒去過的地方。」（原本「寒假你來高雄。我們都沒去過的地方，我來排。」）*/ check('7. 大三上：選項之後接 then「寒假你來高雄，去我們兩個都沒去過的地方。」',idx('寒假你來高雄，去我們兩個都沒去過的地方。')>idx('系上一個學姊租的房子，房東每個月都自己開門進來。我聽她講完，就決定寫這個。')&&idx('系上一個學姊租的房子，房東每個月都自己開門進來。我聽她講完，就決定寫這個。')>=0,J(said().slice(0,9)));
    await kx('Y3S2',[]); const tw={say:has('下禮拜我回高雄。兩個禮拜，七月二號就回來實習。')/* rc2c（AA_1015，110b0fd990）：舊「暑假你在臺北，我在高雄。」＋行事曆旁白 */,g:CH[0].includes('「那晚上講電話。」')&&CH[0].length===3};
    await kx('Y3S2',[],G=>{ G.flags.EXCHANGE_ROUTE='US'; }); const usOn=Lx.COND.US(H.G), us={say:has('八月你就去美國了，我們分開最久就是這次。')/* 2026-11-11 改期望（AA 改斷句、意思不變；bd1a6fda3）：原本「八月你就去美國了。」「我算過了。我們分開最久就是這次。」兩句 */&&!has('下禮拜我回高雄。兩個禮拜，七月二號就回來實習。'),g:CH[0].includes('「幾天？」')&&CH[0].length===3};
    check('7. 大三下：臺灣路線、美國路線各自的開頭和三個選項',tw.say&&tw.g&&(!usOn||(us.say&&us.g)),J({tw,us,usOn,ch:CH[0]}));
    check('7. 美國路線的條件在測試裡有打開',usOn===true,'STORY.route');
    const f=await kx('Y1S2',[]); check('7. 大一下第一次那一頓照現有的（不在稿裡）',!TOx.KX.Y1S2); });

  await sec(8,async()=>{ const ps='classmate_peishan', g=Lx.GF[ps];
    /* 2026-11-11 改期望（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；AA_751@33a1769f8）：沛珊女朋友版匯入了（兩句＋三個選項、不接話題池）——原本期望「照現在的字：一句＋話題池、沒有選項；大三上『台南我還沒找到喜歡的早餐店。』」。逐句比對在 tests/peishan_termend_1110_unit.js */
    await dinner(ps,'Y1S2','gf'); const a={tbl:has('這學期有幾次我想打給你。')&&!has('這學期有幾次我想打給你，後來沒打。怕你在讀書。'),pool:poolOf('Y1S2',ps).filter(has).length,opt3:CH.some(c=>c.length===3)};
    await dinner(ps,'Y3S1','gf'); const b={tbl:has('台南的人講話好慢。')&&!has('台南我還沒找到喜歡的早餐店。'),opt3:CH.some(c=>c.length===3)};
    check('8. 沛珊女朋友版（AA_751）：兩句＋三個選項、不接話題池；大三上換成「台南的人講話好慢。」；termend_lines.js 的 tableByTerm 拿掉了',a.tbl&&a.pool===0&&a.opt3&&b.tbl&&b.opt3&&!g.tableByTerm,J({a,b}));
    /* 2026-11-11 改期望（SHE-FIRST-1110；芷若 AA_748、沛珊 AA_751@33a1769f8）：這兩位的心意邀約重寫好了、改成「她先說」——原本期望「照現在的字：沒有飯桌選項、說出來＝通用三句＋（先不說）」。
       細節在 tests/te_shefirst_1110_unit.js；這裡只看：有飯桌選項、她說完直接出稿上的回應、沒有「（先不說）」 */
    await dinner('heroine_02','Y1S2','heart');
    check('8. 芷若心意邀約（她先說）：飯桌句後面有選項、她寫在杯套上以後直接三個回應、沒有「（先不說）」',has('你坐著。我今天最後一杯做給你。')&&has('不要念出來！')&&CH.length===2&&CH.every(c=>c.length===3)&&!CH.some(c=>c.includes('（先不說）'))&&J(CH[1])===J(TOx.HEART.heroine_02.confessOpts.map(o=>o.t)),J(CH));
    await dinner(ps,'Y1S2','heart'); check('8. 沛珊心意邀約（她先說）：飯桌兩句＋選項、她說完直接三個回應、沒有「（先不說）」',has('你今天話好少。')&&has('我真的很喜歡你。')&&!CH.some(c=>c.includes('（先不說）'))&&J(CH[CH.length-1])===J(TOx.HEART[ps].confessOpts.map(o=>o.t)),J(CH));
    /* 沒有 TERMEND_OPTS（舊資料）＝全部照原本 */
    const keep=globalThis.TERMEND_OPTS; globalThis.TERMEND_OPTS=null;
    try{ await dinner('heroine_01','Y2S1','gf'); const o={tbl:has('寒假東京那兩個禮拜，時差一個小時。……你那邊比較早，我知道。'),noOpt:!CH.some(c=>c.length===3)};
      const us=G=>{ G.flags.EXCHANGE_ROUTE='US'; G.flags.SIS_XMAS_Y3='there'; }; await dinner('heroine_05','Y4S1','gf',[],null,us); o.xm=idx('……我們做到了。')===idx('去年在研究室說的。剛回來一天。')+1&&idx('去年在研究室說的。剛回來一天。')===idx('……可是這頓我不想錯過。')+1;
      check('8. 沒有 TERMEND_OPTS：女朋友版照原本的一句、沒有選項；學姊大四上 XM3 兩句的位置和字都沒變',o.tbl&&o.noOpt&&o.xm,J(o)); } finally { globalThis.TERMEND_OPTS=keep; }
    /* 舊存檔：沒有 G.termend、沒有新旗標 */
    const G=H.fresh(DAY.Y2S2,18.5); delete G.termend; H.rel('heroine_05',65,50,45); G.flags.dating_heroine_05=true; H.said=[]; CH=[]; WANT=[]; let err=null; try{ await TERMEND.dinner(GM,{te:{term:'Y2S2',who:'heroine_05',kind:'gf'}}); }catch(e){ err=String(e); }
    const back=JSON.parse(J(G)); check('8. 舊存檔（沒有 G.termend）照演、存檔可以序列化；存檔沒有新欄位（只有原本的 done）',!err&&(!ok0||CH.length>=1)&&J(Object.keys(back.termend.Y2S2))===J(['done']),err||J(Object.keys(back.termend.Y2S2)));
    check('8. 讀檔時放開（LOADLOCKS termend3d:_heart）',typeof LOADLOCKS==='object'&&typeof LOADLOCKS['termend3d:_heart']==='function'&&(TERMEND._heart='x',LOADLOCKS['termend3d:_heart'](),TERMEND._heart===null)); });
  await sec(9,async()=>{ if(!ok0){ check('9. 鉤子',false,'沒有 TERMEND_OPTS'); return; }
    const hkG=t=>CH.find(c=>c.length===2&&c[0]===t&&c[1]===Lx.HOOK_NO);
    /* ④ 以安女朋友版大二下（京都）：飯桌已經講了京都那三個禮拜，鉤子「八月去京都上語言課。」不念、直接出選項 */
    await dinner('heroine_01','Y2S2','gf'); const on=true;
    check('9. 以安女朋友版大二下：鉤子「八月去京都上語言課。」不念、直接出選項「我也想報。」',on&&has('京都那三個禮拜，我每天晚上會傳訊息。')&&!has('八月去京都上語言課。')&&!!hkG('「我也想報。」')&&CH.length===2,J({on,ch:CH,said:said()}));
    await dinner('heroine_01','Y3S1','gf'); check('9. 以安女朋友版其他學期照常念（大三上「三月二十五號出發。」）',!TERMEND.hookFor(H.G,'Y3S1','heroine_01')||has('三月二十五號出發。'),J(said()));
    /* ③ 子晴女朋友版大一下（Q6 通用格）：鉤子「要不要玩？」（玩過測試版 PLAYTESTED 才有）*/
    const pt=G=>{ G.events.done.ev_ziqing_secret_game=G.day-30; (G.social.mem.heroine_04||(G.social.mem.heroine_04=[])).push({tag:'PLAYTESTED',day:G.day-20}); };
    const pt0=G=>{ (G.social.mem.heroine_04||(G.social.mem.heroine_04=[])).push({tag:'PLAYTESTED',day:G.day-20}); };
    const E=TOx.GF.heroine_04.table, q=E.opts.filter(o=>o.if==='Q6');
    check('9. 資料：子晴通用格 Q6 三個選項——「（現在玩。）」hook skip、另外兩個 nosay；沒有 Q6 的三個沒有 hook；hookTerm 大一下',E.hookTerm==='Y1S2'&&J(q.map(o=>[o.t,o.hook]))===J([['（現在玩。）','skip'],['「改了哪裡？」','nosay'],['「吃完再玩。」','nosay']])&&E.opts.filter(o=>o.if==='noQ6').every(o=>o.hook===undefined),J(q.map(o=>[o.t,o.hook])));
    const a=await dinner('heroine_04','Y1S2','gf',['（現在玩。）'],null,pt), hookOn=!!TERMEND.hookFor(a.G,'Y1S2','heroine_04');
    check('9. 子晴大一下選「（現在玩。）」：鉤子整個不出（不念「要不要玩？」、沒有鉤子的選項、沒記 hook）',hookOn&&has('你上次卡住的那個地方，我把平台加寬了。')&&!has('要不要玩？')&&CH.length===1&&!hkG('「好。」')&&!(a.G.termend.Y1S2&&a.G.termend.Y1S2.hook),J({hookOn,ch:CH,said:said()}));
    for(const t of ['「改了哪裡？」','「吃完再玩。」']){ const b=await dinner('heroine_04','Y1S2','gf',[t],null,pt);
      check('9. 子晴大一下選'+t+'：鉤子不念「要不要玩？」、直接出選項「好。」',!has('要不要玩？')&&CH.length===2&&!!hkG('「好。」')&&!!(b.G.termend.Y1S2&&b.G.termend.Y1S2.hook&&b.G.termend.Y1S2.hook.ok===true),J({ch:CH,said:said(),hk:b.G.termend.Y1S2&&b.G.termend.Y1S2.hook})); }
    const c=await dinner('heroine_04','Y1S2','gf',[],null,pt0), noq=!Lx.COND.Q6(c.G);
    check('9. 子晴大一下沒有 Q6（另外三個選項）：鉤子照常念「要不要玩？」再出選項',noq&&has('這學期熬了很多夜。')&&has('要不要玩？')&&!!hkG('「好。」'),J({noq,ch:CH,said:said()}));
    const k=globalThis.TERMEND_OPTS; globalThis.TERMEND_OPTS=Object.assign({},k,{GF:Object.assign({},k.GF,{heroine_04:Object.assign({},k.GF.heroine_04,{table:Object.assign({},E,{hookTerm:'Y9S9'})})})});
    try{ await dinner('heroine_04','Y1S2','gf',['（現在玩。）'],null,pt); check('9. hookTerm 不是這個學期＝選項的 hook 不算（鉤子照常）',has('要不要玩？')&&!!hkG('「好。」'),J(said())); } finally{ globalThis.TERMEND_OPTS=k; } });
  H.done();
})();
