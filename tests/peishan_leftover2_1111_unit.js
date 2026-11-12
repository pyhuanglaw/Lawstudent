// 沛珊還剩的兩筆早餐店／蛋餅（PEISHAN-VOICE-1110；使用者 X327 沛珊重寫；2026-11-11）——不需要瀏覽器（D131）。
//   稿：AA_766_peishan_leftover2.json@1e647bb05（26 列 old→new；BB 看過）。工具 tools/story/ps766.py（只認這一版）
//   1. 白名單；稿 26 列＝bbpack_events.js 25 列（D4c「沛珊的問題」ev_d4c_question 女舍門口四題的 D4CQ）＋gift_lines.js 1 列（最愛的米漿第二句）
//   2. bbpack_events.js：D4CQ 四題、每題三個選項（題數、選項數、流程不變）；每一列的 new 在 D4CQ 剛好一處、old 整個檔都不在了；沒換的三個選項照舊；整個檔的字串和 BASE 比只差這 25 句
//   3. 事件實際跑：四題各選三個選項，她的問句、選項、回覆照稿；開頭兩句、結尾旁白、熟悉 +1 照舊
//   4. gift_lines.js：沛珊最愛的米漿「米漿！」＋新的第二句；import_gifts.py --check 一樣；整份資料和 BASE 比只差這一格
//   5. D4CQ、沛珊送禮的句子裡沒有早餐店、蛋餅
//   6. AA 回覆 LAWWW 的三件小事（字是 AA 給的）：大四下早上的招呼換字、新年快樂回問兩個選項的回覆換字、y2b3d.js 的舊副本 S.PS_TAINAN 刪掉
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/peishan_leftover2_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', AN='heroine_01', SHA='1e647bb05', BASE='7bb6f6311', DOC='docs/story_planning/AA_766_peishan_leftover2.json', BB='src/data/bbpack_events.js', GF='src/data/gift_lines.js';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const noCom=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
const lit=s=>{ const out=[]; noCom(s).replace(/'((?:[^'\\]|\\.)*)'/g,(m,t)=>{ out.push(t); return m; }); return out; };
const load=f=>{ let src=read(f); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
load(BB); load('src/bbpack3d.js'); load(GF);
const raw=show(SHA,DOC), A=raw?JSON.parse(raw):null, RB=A?A.rows.filter(r=>r.file===BB):[], RG=A?A.rows.filter(r=>r.file===GF):[];
const cur=read(BB), seg=cur.slice(cur.indexOf('  const D4CQ=['),cur.indexOf("  EV.push({ id:'ev_d4c_question'"));
const D4CQ=vm.runInNewContext(noCom(seg).replace('const D4CQ=','D4CQ=')+';D4CQ');
/* 稿的字（寫死一份：讀不到企劃線的時候也照這個比）：[題號, 問句, [[選項, 回覆]×3]] */
const WANT=[[1,'你也提早到。我們系是不是遲到會被寫進判決書？',[['「會，還會公告。」','那我完了。我的前科可以出一本。'],['「我只是剛好早。」','剛好早二十分鐘。好，我相信你。'],['「妳自己呢？」','我是被以安訓練的。她說六點半，就是六點二十五到。']]],
  [2,'讀書會到底是去讀書，還是去吃飯順便讀書？',[['「讀書。」','好乖。我跟我媽也是這樣講的。'],['「吃飯。」','誠實。我喜歡跟誠實的人一桌。'],['「都有。」','兩說併陳。你期末考一定也這樣寫。']]],
  [3,'以安說六點半下來。她一定是六點半整，不會早一秒。要不要賭？',[['「賭她準時。」','那沒得賭，我也押這邊。'],['「賭她提早。」','你輸了。她提早會先傳訊息報備。'],['「賭什麼？」','輸的人等一下幫大家倒茶。先說好，我不會輸。']]],
  [4,'公法你讀到哪？不要講頁數，我會有壓力。',[['「讀完了。」','好，等一下你坐我對面，我要抄。'],['「還沒開始。」','太好了，我們是同一國的。'],['「妳呢？」','我讀到目錄。目錄寫得不錯。']]]];
const ev=id=>STORY_EVENTS.find(e=>e.id===id);

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===DOC);
    check('1. 白名單 AA_766_peishan_leftover2.json@'+SHA+' 一筆、approved；tools/story/ps766.py 只認這一版',e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&read('tools/story/ps766.py').includes("SHA = '"+SHA+"'"));
    console.log(A?'（稿讀得到：逐字比對）':'（這份 checkout 讀不到企劃線 '+SHA+' 的稿：照寫死的那一份比）');
    if(A) check('1. 稿 26 列：bbpack_events.js 25 列、gift_lines.js 1 列；每一列 old、new 都有字、不一樣',A.rows.length===26&&RB.length===25&&RG.length===1&&A.rows.every(r=>r.old&&r.new&&r.old!==r.new)); });

  await sec(2,async()=>{
    check('2. D4CQ 四題、每題三個選項（題數、選項數不變）',D4CQ.length===4&&J(D4CQ.map(q=>q[0]))===J([1,2,3,4])&&D4CQ.every(q=>q[2].length===3&&q[2].every(o=>o.length===2&&/^「.*」$/.test(o[0]))),J(D4CQ.map(q=>q[2].length)));
    check('2. D4CQ 的字和稿一字不差（四個問句、十二個選項、十二句回覆）',J(D4CQ)===J(WANT),J(D4CQ.map((q,i)=>J(q)===J(WANT[i]))));
    check('2. 沒換的三個選項照舊：第 1 題③「妳自己呢？」、第 2 題①「讀書。」③「都有。」',D4CQ[0][2][2][0]==='「妳自己呢？」'&&D4CQ[1][2][0][0]==='「讀書。」'&&D4CQ[1][2][2][0]==='「都有。」');
    const L=lit(cur), Ls=lit(seg), n=(X,t)=>X.filter(x=>x===t).length;
    if(A){ const bad=RB.filter(r=>n(Ls,r.new)!==1||n(L,r.new)!==1||n(L,r.old)!==0||cur.includes(r.old));
      check('2. 逐字：25 列每一列的 new 在 D4CQ 剛好一處（整個檔也只有這一處）、old 整個檔都不在了（註解裡也沒有）',bad.length===0,J(bad.map(r=>[r.old,n(L,r.old),n(Ls,r.new)])));
      const flat=[].concat(...WANT.map(q=>[q[1]].concat(...q[2]))); check('2. 寫死的那一份（28 格）＝稿的 25 個 new＋沒換的三個選項',flat.length===28&&RB.every(r=>flat.includes(r.new))&&flat.filter(t=>!RB.some(r=>r.new===t)).sort().join()===['「妳自己呢？」','「讀書。」','「都有。」'].sort().join());
      const ob=show(BASE,BB); if(ob){ const O=lit(ob), d=O.map((t,i)=>[t,L[i]]).filter(([x,y])=>x!==y&&!require('./kx_rewrite_1112.js').pair(x,y)), set=new Set(RB.map(r=>r.old+'→'+r.new));   /* 2026-11-12（X324 可昕續改，AA_827_kx_triple_short_2.json@07d50af2f7，bbpack_events.js:504）：可昕來找品妤那一句後來換了字（清單在 tests/kx_rewrite_1112.js、逐列對稿 tests/kx_triple2_1112_unit.js）——那一句先不算再比。舊期望：直接和 BASE 比 */
        check('2. 整個檔的字串和 BASE（'+BASE+'）逐個比：一樣多，不一樣的剛好是稿上這 25 句（別的事件、條件、流程沒動）',O.length===L.length&&d.length===25&&d.every(([x,y])=>set.has(x+'→'+y)),J(d.filter(([x,y])=>!set.has(x+'→'+y)).slice(0,3)));
        const sk=t=>noCom(t).replace(/'(?:[^'\\]|\\.)*'/g,"''").replace(/\s+/g,' '); check('2. 骨架（把字串、註解拿掉、空白收成一格以後的程式）和 BASE 一樣',sk(ob)===sk(cur)); } }
    check('2. 檔裡寫了來源（AA_766_peishan_leftover2.json@'+SHA+'）',cur.includes('AA_766_peishan_leftover2.json@'+SHA)); });

  await sec(3,async()=>{ const e=ev('ev_d4c_question'), D=e.dialogue, X=BBPACK;
    check('3. ev_d4c_question：大一上第 10～15 週週四 18:20～18:30、女舍門口、參加者沛珊（時間、地點、條件沒動）',!!e&&J(e.term)===J(['Y1S1'])&&J(e.weeks)===J([10,11,12,13,14,15])&&J(e.weekday)===J([4])&&e.building==='fdorm'&&J(e.participants)===J([PS])&&Math.abs(e.time[0]-(18+20/60))<1e-9&&e.time[1]===18.5);
    const ch=D.filter(l=>l.choice), lab=D.filter(l=>l.label).map(l=>l.label);
    check('3. 流程不變：四個三選一、十二個回覆的標籤 d1_1～d4_3＋end',ch.length===4&&ch.every(c=>c.choice.length===3)&&J(lab)===J([].concat(...[1,2,3,4].map(n=>[1,2,3].map(i=>'d'+n+'_'+i))).concat(['end'])),J(lab));
    const said=()=>H.said.map(s=>s.t); const bad=[];
    for(const [n,q,opts] of WANT) for(let i=0;i<3;i++){ const G=H.fresh('2026-01-01',18.4,'campus',{}); H.FAMILIAR(PS); H.FAMILIAR(AN); const fam0=SOCIAL.rel(PS).fam;
      const pick=X.d4cPick; X.d4cPick=()=>n; H.said=[]; H.opts=[]; H.picks=[i]; try{ await EVENTS.run(e); } finally { X.d4cPick=pick; }
      const L=said(), want=['（沛珊站在門口的路燈下，抱著講義。）','他們還沒下來。等人的時候，我會想一些問題。',q,opts[i][1],'門開了，以安下來了。'];
      if(J(L)!==J(want)||J(H.opts[0])!==J(opts.map(o=>o[0]))||SOCIAL.rel(PS).fam!==fam0+1||J(G.flags.D4C_USED)!==J([n])||G.flags.D4C_Q!==undefined) bad.push('第 '+n+' 題選 '+(i+1)+'：'+J(L)+' '+J(H.opts[0])); }
    check('3. 實際演：四題 × 三個選項＝12 種，每一種都是「路燈下 → 等人的時候 → 她的問句 → 三個選項 → 她的回覆 → 以安下來」，字照稿；熟悉 +1、記這一題問過',bad.length===0,bad.slice(0,2).join(' ／ ')); });

  await sec(4,async()=>{ const fav=GIFT_LINES.people[PS].drink.fav;
    check('4. gift_lines.js 沛珊最愛的米漿：「米漿！」＋「你怎麼知道我喝這個？我國中福利社每天一瓶。」（品項、加的分數沒動）',fav.item==='米漿'&&J(fav.lines)===J(['米漿！','你怎麼知道我喝這個？我國中福利社每天一瓶。'])&&J(fav.rel)===J({trust:2,comf:2,npcRom:1}),J(fav));
    if(A) check('4. 逐字：稿的那一列 new 在沛珊的句子裡剛好一處、old 整個檔都不在了',J(GIFT_LINES.people[PS]).split(J(RG[0].new)).length-1===1&&!read(GF).includes(RG[0].old)&&RG[0].new===fav.lines[1]);
    let ok=false, out=''; try{ out=cp.execFileSync('python3',['tools/story/import_gifts.py','--check'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK /.test(out); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
    if(A) check('4. tools/story/import_gifts.py --check：照白名單重匯的結果＝現在的 gift_lines.js（AA_766 那一層疊在 AA_710 上）；檔頭寫了來源',ok&&read(GF).includes('AA_766_peishan_leftover2.json@'+SHA),out.slice(0,200));
    const ob=show(BASE,GF); if(ob){ const P=t=>JSON.parse(t.slice(t.indexOf('const GIFT_LINES=')+17,t.lastIndexOf(';'))), lv=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv(x[k],p+'/'+k,o); else o[p]=x; return o; };
      /* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：AA_772 第 95～97 列把品項「紅茶拿鐵」改名「鮮奶茶」（語彤、學姊那幾格）——BASE 先照白名單上的 AA_772 換過再比（tests/l118_redo772_expect.js）。舊期望：直接和 BASE 比 */
      const a=lv(P(require('./l118_redo772_expect.js').fixFile(GF,ob)),'',{}), b=lv(P(read(GF)),'',{}), d0=Object.keys(b).filter(k=>a[k]!==b[k]);
      /* 2026-11-11（X324 G 區，AA 31c1c4e2c）：AA_710 源稿改了句首「……」18 處、可昕一句（白名單換 SHA 重匯）——那幾格照 AA_710 be775af69→31c1c4e2c 逐格的改動算對，/src 跟著換；讀不到那兩版＝照舊期望。舊期望：和 BASE 只差沛珊這一格 */
      const o710=show('be775af69','docs/story_planning/AA_710_gifts.json'), n710=show('31c1c4e2c','docs/story_planning/AA_710_gifts.json'), ch=new Set();
      if(o710&&n710&&/AA_710_gifts\.json@31c1c4e2c/.test(b['/src']||'')){ const x=lv(JSON.parse(o710),'',{}), y=lv(JSON.parse(n710),'',{}); for(const k in y) if(x[k]!==y[k]) ch.add(x[k]+'→'+y[k]); }
      const d=d0.filter(k=>!(ch.size&&(k==='/src'||(k!=='/people/'+PS+'/drink/fav/lines/1'&&ch.has(a[k]+'→'+b[k])))));
      check('4. 整份資料和 BASE 比：格子一樣多，只差沛珊這一格（別人的、朋友六位的沒動；AA_710 31c1c4e2c 改的那幾格照源稿的改動）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/people/'+PS+'/drink/fav/lines/1'])&&a[d[0]]==='……我家早餐店也有賣。我從小喝到大的。',J(d)); } });

  await sec(5,async()=>{
    check('5. D4CQ、沛珊送禮的句子裡沒有早餐店、蛋餅、煎',!/早餐店|蛋餅|煎/.test(J(D4CQ))&&!/早餐店|蛋餅|煎台/.test(J(GIFT_LINES.people[PS])),J(D4CQ).match(/.{0,10}(早餐店|蛋餅|煎).{0,10}/g)); });
  await sec(6,async()=>{ const OLDG='早。我八點的課，七點就到了。', NEWG='早。八點的課我還是修了，不要問我為什麼。';
    const w=LADDER.byTerm.Y4S2[PS].greet.when, hit=w.filter(x=>x.t===NEWG);
    check('6a. 沛珊大四下早上的招呼：「'+NEWG+'」剛好一則、06～08 點（只換字）；舊句整份階梯都不在了；大四上那一則照舊是「早。我八點的課，今天居然趕上了。」',hit.length===1&&J(hit[0].time)===J([6,8])&&!J(LADDER).includes(OLDG)&&LADDER.byTerm.Y4S1[PS].greet.when.filter(x=>x.t==='早。我八點的課，今天居然趕上了。').length===1,J(w.map(x=>x.t)));
    const gc=read('src/data/greet_classday.js'), GC=JSON.parse(gc.slice(gc.indexOf('const GREET_CLASSDAY=')+21,gc.lastIndexOf(';'))), L=GC.classDay[PS]||[];
    check('6a. 「只在上課日說」跟著新句子走：大四上、大四下兩句都在 greet_classday.js 的 classDay，舊句不在；匯入工具 --check 一樣',L.includes(NEWG)&&L.includes('早。我八點的課，今天居然趕上了。')&&!L.includes(OLDG)&&(()=>{ try{ return /OK\s*$/.test(cp.execFileSync('python3',['tools/story/import_greet_classday.py','--check'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']})); }catch(e){ return false; } })(),J(L));
    /* 2026-11-11（X324，AA_781 閒聊階梯通用層，tests/ladder_aa781_1111_unit.js 逐列對稿＋零差異）：AA_781 有稿的那幾格（人×學期）另外換了字——比之前兩邊都拿掉那幾格。
       舊期望：整份 ladder.js（除了這一句和來源說明）一字不差。沛珊沒有 AA_781 的稿，她的每一格照樣整格比 */
    const ob=show(BASE,'src/data/ladder.js'); if(ob){ const a=ob.split(OLDG).length-1, b=read('src/data/ladder.js').split(NEWG).length-1;
      const W781={an:'heroine_01',kx:'kexin',zr:'heroine_02',zq:'heroine_04',sis:'heroine_05',yt:'heroine_03'}, C781=JSON.parse(read('docs/handoff/story_import_allow.json')).files.map(e=>/AA_781_([a-z]+)_ladder_(Y\dS[12])\.json$/.exec(e.path)).filter(Boolean).map(m=>[m[2],W781[m[1]]]);
      /* 2026-11-12（X324 最後一塊，AA_816 閒聊階梯選項 fx 694 個，tests/ladder_fx_aa816_1111_unit.js 逐格對稿）：AA_816 只加 fx、台詞不動——現在這一邊用「不疊 AA_816」重匯的結果比（--no-aa816）；重匯不了＝照舊拿現在的檔比 */
      let no816=null; try{ const o2=require('path').join(require('os').tmpdir(),'ladder_no816_'+process.pid+'.js'); cp.execFileSync('python3',['tools/ladder/import_ladder.py','--out',o2,'--no-aa816'],{cwd:H.ROOT,stdio:'ignore'}); no816=read(o2.startsWith('/')?require('path').relative(H.ROOT,o2):o2); require('fs').unlinkSync(o2); }catch(x){ no816=null; }
      const strip=t=>{ const o=new Function(t+';return LADDER;')(); delete o.source; for(const [term,who] of C781){ if(term==='Y1S1'){ delete o.characters[who]; } else if(o.byTerm[term]) delete o.byTerm[term][who]; } delete o.byTerm.Y1S1; return JSON.stringify(o); };
      check('6a. ladder.js 和 BASE 比：舊句原本剛好一處（大四下），現在新句剛好一處；除了這一句、來源說明、AA_781 有稿的 '+C781.length+' 格以外一字不差',a===1&&b===1&&C781.every(([t,w])=>!!w&&w!==PS)&&strip(ob.split(OLDG).join(NEWG))===strip(no816||read('src/data/ladder.js'))); }
    const m2=read('src/data/msg2_pool.js'), R=new Function(m2.replace(/^'use strict';/m,'')+';return MSG2_POOL;')().people[PS].replies, ny=R.filter(e=>e.topic==='newyear'&&e.ask);
    check('6b. 沛珊新年快樂（交往中）的回問「今年你想做什麼？」：選「把書念完。」→「好無聊的答案。我記下來了，年底驗收。」；選「還沒想好。」→「那我過幾天再問一次。你躲不掉。」（選項的字、回問那一句、那一則的字不動）',ny.length===1&&ny[0].tier==='L'&&ny[0].ask.q==='今年你想做什麼？'&&J(ny[0].ask.opts)===J([{t:'把書念完。',r:['好無聊的答案。我記下來了，年底驗收。']},{t:'還沒想好。',r:['那我過幾天再問一次。你躲不掉。']}])&&J(ny[0].msgs)===J(['新年快樂。新的一年第一件事：你今年想做什麼？我要聽認真的。'])&&!!ny[0].aaReply,J(ny.map(e=>e.ask)));
    const camp=read('src/data/camp_y1.js'), mr=read('src/data/msg_replies.js');
    check('6b. 別的檔的「好。我記下來了。」沒動到：宿營關主學姊三處（camp_y1.js）、msg_replies.js 一處',camp.split("{speaker:'關主學姊',text:'好。我記下來了。'}").length-1===3&&mr.split('"好。我記下來了。"').length-1===1);
    /* 2026-11-11（X324 D 區，AA_709 企劃線 c4772dc7e）：msg_replies.js 後來照 AA_709 重匯，八個人的回話（say）換字——和 BASE 比改成「拿掉 say 和來源以後一樣」（text、選項的字、rel 沒動）。舊期望：整檔和 BASE 一樣 */
    const MR=s=>{ const o=new Function(s.replace(/^'use strict';/m,'')+';return MSG_REPLIES;')(); delete o.src; for(const k in o.people) for(const e of o.people[k]) for(const q of e.opts||[]) delete q.say; return J(o); };
    /* 2026-11-11（X324 D 區，AA_785_msg_pools.json）：msg2_pool.js 照覆蓋層換了幾格（換過的那一則多一格 "ov"）——和 BASE 比的時候那幾行不算（逐格在 tests/msg_overlay_1111_unit.js）。舊期望：只有沛珊新年快樂那一行不同 */
    const ob2=show(BASE,'src/data/msg2_pool.js'), obm=show(BASE,'src/data/msg_replies.js'); if(ob2){ const a=m2.split('\n'), b=ob2.split('\n'), d=a.filter((l,i)=>l!==b[i]&&!/"ov": \[/.test(l));
      check('6b. msg2_pool.js 和 BASE 比：一樣多行，只有沛珊新年快樂那一行不同；camp_y1.js 和 BASE 一樣；msg_replies.js 和 BASE 比只有回話（say，AA_709 X324 D 區）不同',a.length===b.length&&d.length===1&&/"topic": ?"newyear"/.test(d[0])&&d[0].includes('年底驗收')&&!!obm&&MR(obm.split('媽媽來了。她坐最後一排。……就是我叫你坐的那個位子。').join('媽媽來了。不進來，站在門外從小窗看了兩節，以為我沒發現。').split('可是這樣期中就不用讀了。').join('可是這樣也算在讀民總了。'))/* 2026-11-11 20:5x（AA_709@addac77bb，D118 沒有期中考）：芯慈一個選項字也換了。舊期望：選項字和 BASE 一樣 *//* 2026-11-11（AA_709@31f1a4aca 跟 AA_810 公開課媽媽在門外）：沛珊那一則的原文 text 也換了（回覆靠它對私訊）。舊期望：text 和 BASE 一樣 */===MR(mr)&&show(BASE,'src/data/camp_y1.js')===camp,String(d.length)); }
    const y2=read('src/y2b3d.js').replace(/\/\*[\s\S]*?\*\//g,'');
    check('6c. src/y2b3d.js 的舊副本 S.PS_TAINAN 刪掉了（程式裡沒有 PS_TAINAN、沒有舊句「這邊的紅茶很甜喔」）；現行的台南資料在 hometown_lines.js（tests/bg107_unit.js 第 3 項）',!/PS_TAINAN\b(?!_)/.test(y2)&&!y2.includes('這邊的紅茶很甜喔')&&read('src/data/hometown_lines.js').includes("first:{scene:'台南・她的學校',bg:'tn_school'")); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
