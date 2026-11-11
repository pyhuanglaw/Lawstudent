// 沛珊還剩的兩筆早餐店／蛋餅（PEISHAN-VOICE-1110；使用者 X327 沛珊重寫；2026-11-11）——不需要瀏覽器（D131）。
//   稿：AA_766_peishan_leftover2.json@6325e4b98（26 列 old→new；BB 看過）。工具 tools/story/ps766.py（只認這一版）
//   1. 白名單；稿 26 列＝bbpack_events.js 25 列（D4c「沛珊的問題」ev_d4c_question 女舍門口四題的 D4CQ）＋gift_lines.js 1 列（最愛的米漿第二句）
//   2. bbpack_events.js：D4CQ 四題、每題三個選項（題數、選項數、流程不變）；每一列的 new 在 D4CQ 剛好一處、old 整個檔都不在了；沒換的三個選項照舊；整個檔的字串和 BASE 比只差這 25 句
//   3. 事件實際跑：四題各選三個選項，她的問句、選項、回覆照稿；開頭兩句、結尾旁白、熟悉 +1 照舊
//   4. gift_lines.js：沛珊最愛的米漿「米漿！」＋新的第二句；import_gifts.py --check 一樣；整份資料和 BASE 比只差這一格
//   5. D4CQ、沛珊送禮的句子裡沒有早餐店、蛋餅
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/peishan_leftover2_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', AN='heroine_01', SHA='6325e4b98', BASE='7bb6f6311', DOC='docs/story_planning/AA_766_peishan_leftover2.json', BB='src/data/bbpack_events.js', GF='src/data/gift_lines.js';
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
  [2,'讀書會到底是去讀書，還是去吃飯順便讀書？',[['「讀書。」','好乖。我跟我媽也是這樣講的。'],['「吃飯。」','誠實。我喜歡跟誠實的人一桌。'],['「都有。」','兩說併陳。你期中考一定也這樣寫。']]],
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
      const ob=show(BASE,BB); if(ob){ const O=lit(ob), d=O.map((t,i)=>[t,L[i]]).filter(([x,y])=>x!==y), set=new Set(RB.map(r=>r.old+'→'+r.new));
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
      const a=lv(P(ob),'',{}), b=lv(P(read(GF)),'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);
      check('4. 整份資料和 BASE 比：格子一樣多，只差沛珊這一格（別人的、朋友六位的沒動）',J(Object.keys(a))===J(Object.keys(b))&&J(d)===J(['/people/'+PS+'/drink/fav/lines/1'])&&a[d[0]]==='……我家早餐店也有賣。我從小喝到大的。',J(d)); } });

  await sec(5,async()=>{
    check('5. D4CQ、沛珊送禮的句子裡沒有早餐店、蛋餅、煎',!/早餐店|蛋餅|煎/.test(J(D4CQ))&&!/早餐店|蛋餅|煎台/.test(J(GIFT_LINES.people[PS])),J(D4CQ).match(/.{0,10}(早餐店|蛋餅|煎).{0,10}/g)); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
