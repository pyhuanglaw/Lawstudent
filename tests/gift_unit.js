// 送早餐、飲料（GIFT-FLIRT-1107，USER_WANTS X262；台詞 AA_710 第二版 be775af69）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」；AA-B 05:39「AA_710 第二版，請重匯」。
// 句子一律從 src/data/gift_lines.js 讀來比對（不寫死台詞）。檢查：
//   0. gift_lines.js 和白名單上的 AA_710 一致（import_gifts.py --check）；七位都有飲料、早餐、fav；每格 pool、lines＝pool 第一組；品項都是遊戲買得到的
//      匯入工具：品項名對不到、ctx 不認得、lines≠pool 第一組 → 停下來
//   1. 便利商店、2:30 AM 的點餐選單多「買一份帶走送人…」；買了扣錢、帶在身上（記店名）；有的品項再選一次；最多 3 樣；隔天就沒了
//   2. 當面說話多「送她○○」；一般 yes：照階段（need 1／4）、好感照那一格、朋友以下她的戀愛不加；pool 輪流、同一組不連續（七位 × 兩種）
//   3. 同一種一天第二次：no、東西留著；no 也輪流
//   4. fav（七位）：第一次送對＝fav、記 REMEMBERED_HER、好感照 fav；之後再送對照一般
//   5. opinion：每一樣都測；芷若的拿鐵只算便利商店買的；可昕「有加糖的青茶」＝青茶微糖；opinion 優先於情境
//   6. ctx：again（連續兩天同一樣）、exam（期末週；期中週不算）、night（17 點以後送早餐；以安那句「晚上九點」只在 21 點）、winterCold（12～2 月冰的）、summerHot（6～8 月熱的）
//   7. 交往中：dating 那一格優先；沒交往（就算第 6 階）不用；講到品項的那一組（以安三明治、子晴飯糰）對不上就跳過
//   8. 講到品項／稱呼的組：學姊送到第 3 次起「學弟」換成名字；子晴「冰美式」那兩句只在送冰美式；「冰你一下」不配熱的
//   9. 舊存檔（沒有 G.carry、G.flags.GIFT 只有第一版的 day／fav／n、帶著的東西沒有店名）照樣能送
//  10. 一句開頭是（動作）、後面接著講話的：拆成旁白＋她說的，字不改
// 用法：node tests/gift_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/gift_lines.js',['GIFT_LINES']), ok2=loadG('src/gift3d.js',['GIFT']);
const said=()=>H.said.map(s=>s.t);
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
let money=0; GM.money=d=>{ H.G.money+=d; money+=d; };
const toasts=[]; GM.toast=t=>toasts.push(t);
const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const NAME={heroine_01:'沈以安',heroine_02:'林芷若',heroine_03:'陳語彤',heroine_04:'高子晴',heroine_05:'溫書瑀',classmate_peishan:'沛珊',kexin:'可昕'};
const who=id=>({name:NAME[id],charId:id});
const J=x=>JSON.stringify(x);
const same=(a,b)=>J(a)===J(b);
(async()=>{
  /* 0 資料 */
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_gifts.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    const src=ok1?GIFT_LINES.src:'';
    check('0. src/data/gift_lines.js 和白名單上的 AA_710 一致（import_gifts.py --check；第二版 be775af69）',ok1&&ok2&&ok&&/@be775af69$/.test(src),out.trim().slice(0,200)+' '+src); }
  if(!ok1||!ok2){ H.done(); return; }
  const LN=GIFT_LINES.people;
  const ITEMN=Object.keys(GIFT.TEMP);
  const catOf=n=>{ for(const it of GIFT.ITEMS) for(const o of it.opt||[['','']]) if(it.n+o[1]===n) return it.cat; return null; };
  { const bad=[];
    for(const id of IDS) for(const c of ['drink','breakfast']){ const E=LN[id]&&LN[id][c]; if(!E){ bad.push(id+'.'+c+' 沒有'); continue; }
      const norm=E.yes.filter(y=>!y.dating); if(!norm.length||norm[0].need!==1) bad.push(id+'.'+c+' 沒有 need 1');
      if(!E.yes.some(y=>y.dating)) bad.push(id+'.'+c+' 沒有交往中那一格');
      for(const y of E.yes){ if(!Array.isArray(y.pool)||!y.pool.length||!same(y.lines,y.pool[0].lines)) bad.push(id+'.'+c+' yes lines≠pool[0]'); }
      if(!E.no.length||!E.no.every(g=>g.lines&&g.lines.length)) bad.push(id+'.'+c+' no');
      for(const e of [E.fav].concat(E.opinion||[]).filter(Boolean)) if(!ITEMN.includes(e.n)||catOf(e.n)!==c) bad.push(id+'.'+c+' 品項 '+e.item+'→'+e.n);
      for(const k in E.ctx||{}) if(!GIFT.CTX.includes(k)) bad.push(id+'.'+c+' ctx '+k); }
    check('0. 七位都有飲料、早餐：need 1、交往中那一格、pool（lines＝第一組）、no；fav／opinion 的品項都是遊戲買得到的',!bad.length,bad.join('；'));
    check('0. 七位都有最喜歡的（fav；以安豆漿、語彤紅茶拿鐵、沛珊米漿是第二版新的）',IDS.every(id=>LN[id].drink.fav)&&LN.heroine_01.drink.fav.n==='豆漿'&&LN.heroine_03.drink.fav.n==='紅茶拿鐵'&&LN.classmate_peishan.drink.fav.n==='米漿',J(IDS.map(id=>(LN[id].drink.fav||{}).n)));
    const py=(code)=>{ try{ cp.execFileSync('python3',['-c',code],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); return 'ran'; }catch(e){ return String(e.stderr||''); } };
    const pre="import sys,json,subprocess;sys.path.insert(0,'tools/story');import import_gifts as M;d=json.loads(subprocess.check_output(['git','show','be775af69:'+M.PATH]).decode());I=M.game_items();";
    const e1=py(pre+"d['heroine_01']['drink']['fav']['item']='珍珠奶茶';M.build(d,'x',I)");
    const e2=py(pre+"d['heroine_01']['drink']['ctx']['night']=[['x']];M.build(d,'x',I)");
    const e3=py(pre+"d['heroine_01']['drink']['yes'][0]['lines']=['x'];M.build(d,'x',I)");
    const e4=py(pre+"M.build(d,'x',I)");
    check('0. 匯入工具：品項名對不到、飲料寫 night、lines≠pool 第一組 → 停下來；原稿通過',/遊戲沒有這個品項/.test(e1)&&/不認得/.test(e2)&&/pool 第一組/.test(e3)&&e4==='ran',[e1,e2,e3,e4].map(s=>s.trim().split('\n').pop()).join(' | ')); }
  /* 1 買 */
  { const G=H.fresh('2025-09-16',9,'cvs'); G.money=500; money=0;
    const o=GIFT.shopOpt(G,'便利商店'); check('1. 便利商店：點餐選單多「買一份帶走送人…」',!!o&&o.t==='買一份帶走送人…'&&!o.dim,J(o));
    check('1. 2:30 AM 也有；麵店沒有',!!GIFT.shopOpt(G,'兩點半 Café')&&!GIFT.shopOpt(G,'公館燒臘'));
    H.picks=['熱可可','加一份濃縮']; H.said=[]; const c=await GIFT.buy(GM,'便利商店');
    check('1. 買熱可可、加一份濃縮：扣 70 元（50＋20）、帶在身上、品項名「熱可可（加一份濃縮）」、記店名',!!c&&c.n==='熱可可（加一份濃縮）'&&c.cat==='drink'&&c.shop==='便利商店'&&money===-70&&G.carry.length===1,J({c,money,carry:G.carry}));
    H.picks=['美式咖啡','冰的']; const c2=await GIFT.buy(GM,'兩點半 Café');
    check('1. 2:30 AM 買美式、冰的：100 元、「美式咖啡（冰的）」、冰的（temp cold）、記 2:30 AM',!!c2&&c2.n==='美式咖啡（冰的）'&&c2.shop==='兩點半 Café'&&money===-170&&GIFT.TEMP[c2.n]==='cold'&&GIFT.TEMP['美式咖啡']==='hot',J({c2,money}));
    H.picks=['三明治']; await GIFT.buy(GM,'便利商店');
    check('1. 最多 3 樣：第 4 樣灰掉',G.carry.length===3&&GIFT.shopOpt(G,'便利商店').dim===true,J(G.carry));
    G.day+=1; check('1. 隔天：帶著的東西沒了',GIFT.carry(G).length===0); }
  /* 送的共用：直接放進手上（買在 1 測過）*/
  const mk=(G,n,shop)=>{ G.carry=[]; const c={n,cat:catOf(n),day:G.day,shop:shop||'便利商店'}; G.carry.push(c); return c; };
  const split=ls=>[].concat(...ls.map(t=>{ const s=GIFT.text(H.G,t), m=/^(（[^）]*）)(.+)$/.exec(s); return m?[m[1],m[2]]:[s]; }));
  const give=async(G,id,n,shop)=>{ const c=mk(G,n,shop); H.said=[]; const r=await GIFT.give(GM,who(id),id,c); const s=said(); return {r,s:r==='no'?s:s.slice(1),first:s[0],pick:GIFT.lastPick,c}; };
  const E_=(id,c)=>LN[id][c];
  const onlyItems=(id,c)=>{ const E=E_(id,c), o=new Set(); const add=gs=>(gs||[]).forEach(g=>(g.only||[]).forEach(n=>o.add(n))); E.yes.forEach(y=>add(y.pool)); add(E.no); (E.opinion||[]).forEach(x=>add(x.pool)); for(const k in E.ctx||{}) add(E.ctx[k]); return o; };
  /* 「中性」的品項：不是她最喜歡的、她沒意見、沒有句子講到它 */
  const neutral=(id,c)=>{ const E=E_(id,c), O=onlyItems(id,c); return ITEMN.filter(n=>catOf(n)===c&&!(E.fav&&E.fav.n===n)&&!(E.opinion||[]).some(o=>o.n===n)&&!O.has(n)); };
  const cond=g=>!!(g.only||g.swap||g.hour);
  const fresh=(key,hour)=>{ const G=H.fresh(key||'2025-09-16',hour==null?9:hour,'campus'); G.money=5000; for(const k in stageOf) delete stageOf[k]; return G; };
  /* 2 一般 yes：階段、好感、輪流 */
  { const bad=[], rot=[];
    for(const id of IDS) for(const c of ['drink','breakfast']){ const G=fresh(); stageOf[id]=2; const N=neutral(id,c); if(!N.length){ bad.push(id+'.'+c+' 沒有中性品項'); continue; }
      const y1=E_(id,c).yes.filter(y=>!y.dating&&y.need<=2).sort((a,b)=>b.need-a.need)[0];
      const r0=Object.assign({},SOCIAL.rel(id)); const g=await give(G,id,N[0]); const r1=SOCIAL.rel(id);
      if(g.r!=='yes'||!same(g.s,split(y1.pool[0].lines))) bad.push(id+'.'+c+' 第一次='+g.r+' '+J(g.s));
      if((r1.fam-(r0.fam||0))!==(y1.rel.fam|0)||(r1.comf-(r0.comf||0))!==(y1.rel.comf|0)||(r1.npcRom|0)!==(r0.npcRom|0)) bad.push(id+'.'+c+' 好感 '+J([r0,r1,y1.rel]));
      if(g.first!=='你把'+N[0]+'遞給'+NAME[id]+'。'||G.carry.length) bad.push(id+'.'+c+' 遞給／手上 '+g.first);
      /* 輪流：隔一天送（不算連續），送 pool 長度＋1 次 */
      if(y1.pool.some(cond)) continue;
      const seq=[0]; for(let k=1;k<=y1.pool.length;k++){ G.day+=2; const h=await give(G,id,N[k%N.length]); seq.push(y1.pool.findIndex(p=>same(split(p.lines),h.s))); }
      const want=seq.map((_,k)=>k%y1.pool.length); rot.push(id+'.'+c+':'+seq.join(''));
      if(!same(seq,want)) bad.push(id+'.'+c+' 輪流 '+J(seq)+' 要 '+J(want)); }
    check('2. 一般 yes（七位 × 兩種，階段 2）：need 1 那一格、好感照那一格、npcRom 不加、東西遞出去了',!bad.filter(s=>!/輪流/.test(s)).length,bad.join('；'));
    check('2. pool 輪流、同一組不連續（每格送 pool 長度＋1 次：0,1,…,0）',!bad.filter(s=>/輪流/.test(s)).length&&rot.length>=10,rot.join(' ')+' '+bad.join('；'));
    const G=fresh(); const O=GIFT.talkOpts(G,'heroine_01'); mk(G,'青茶'); G.carry.push({n:'飯糰',cat:'breakfast',day:G.day,shop:'便利商店'});
    const O2=GIFT.talkOpts(G,'heroine_01'); check('2. 當面說話：帶著的每一樣一個「送她○○」、掛在 STORY.TALK_OPTS',!O.length&&same(O2.map(x=>x.t),['送她青茶','送她飯糰'])&&STORY.TALK_OPTS.some(f=>{ try{ return (f(G,'heroine_01',GM)||[]).some(x=>x.t==='送她青茶'); }catch(e){ return false; } }),J(O2.map(x=>x.t)));
    { const badR=[], rr=[]; for(const id of IDS) for(const c of ['drink','breakfast']) for(const which of ['need4','dating']){ const E=E_(id,c), y=which==='dating'?E.yes.find(q=>q.dating):E.yes.find(q=>!q.dating&&q.need===4); if(y.pool.length<2||y.pool.some(cond)) continue;
        const G=fresh(); stageOf[id]=which==='dating'?6:4; if(which==='dating') G.flags['dating_'+id]=true; const N=neutral(id,c), seq=[];
        for(let k=0;k<=y.pool.length;k++){ const h=await give(G,id,N[k%N.length]); seq.push(y.pool.findIndex(p=>same(split(p.lines),h.s))); G.day+=2; }
        rr.push(id+'.'+c+'.'+which+':'+seq.join('')); if(!same(seq,seq.map((_,k)=>k%y.pool.length))) badR.push(id+'.'+c+'.'+which+' '+J(seq)); }
      check('2. 階段 4、交往中那一格也輪流（以安飲料 need 4 有三組：0120）',!badR.length&&rr.includes('heroine_01.drink.need4:0120'),rr.join(' ')+' '+badR.join('；')); }
    const bad4=[]; for(const id of IDS) for(const c of ['drink','breakfast']){ const G2=fresh(); stageOf[id]=4; const N=neutral(id,c), y4=E_(id,c).yes.find(y=>!y.dating&&y.need===4); const r0=Object.assign({},SOCIAL.rel(id)); const g=await give(G2,id,N[0]); const r1=SOCIAL.rel(id); const ok=y4.pool.filter(p=>!cond(p)||(!p.only||p.only.includes(N[0])))[0];
      if(g.r!=='yes'||!same(g.s,split(ok.lines))||(r1.npcRom-(r0.npcRom||0))!==(y4.rel.npcRom|0)) bad4.push(id+'.'+c+' '+g.r+' '+J(g.s)); }
    check('2. 熟了（階段 4）：need 4 那一格、她的戀愛照稿加（朋友以上）',!bad4.length,bad4.join('；')); }
  /* 3 no */
  { const bad=[];
    for(const id of IDS) for(const c of ['drink','breakfast']){ const G=fresh(); const N=neutral(id,c), E=E_(id,c); await give(G,id,N[0]);
      const seq=[]; for(let k=0;k<=E.no.length;k++){ const h=await give(G,id,N[0]); seq.push(h.r==='no'?E.no.findIndex(p=>same(split(p.lines),h.s)):'x'); if(G.carry.length!==1) bad.push(id+'.'+c+' 東西沒留著'); }
      const want=seq.map((_,k)=>k%E.no.length); if(!same(seq,want)) bad.push(id+'.'+c+' no '+J(seq)+' 要 '+J(want)); }
    check('3. 同一種一天第二次：她不收（no）、東西留著；no 輪流（七位 × 兩種）',!bad.length,bad.join('；')); }
  /* 4 fav */
  { const bad=[];
    for(const id of IDS){ const G=fresh(); stageOf[id]=3; const FV=E_(id,'drink').fav; const r0=Object.assign({},SOCIAL.rel(id)); const g=await give(G,id,FV.n); const r1=SOCIAL.rel(id);
      if(g.r!=='fav'||!same(g.s,split(FV.lines))||!SOCIAL.has(id,'REMEMBERED_HER')) bad.push(id+' 第一次 '+g.r+' '+J(g.s));
      for(const k of Object.keys(FV.rel)) if((r1[k]|0)-(r0[k]|0)!==FV.rel[k]) bad.push(id+' 好感 '+k);
      G.day+=2; const g2=await give(G,id,FV.n); if(g2.r==='fav') bad.push(id+' 第二次還是 fav'); }
    check('4. 七位：第一次送到她最喜歡的＝fav、記 REMEMBERED_HER、好感照 fav；隔幾天再送對不是 fav',!bad.length,bad.join('；')); }
  /* 5 opinion */
  { const bad=[];
    for(const id of IDS) for(const c of ['drink','breakfast']) for(const o of E_(id,c).opinion||[]){ const G=fresh(); const g=await give(G,id,o.n,o.shop||'便利商店');
      if(g.r!=='opinion'||!same(g.s,split(o.pool[0].lines))) bad.push(id+' '+o.item+' '+g.r+' '+J(g.s)); }
    check('5. 每一樣她有意見的（opinion）：送了就是那幾句',!bad.length,bad.join('；'));
    { const G=fresh(); const a=await give(G,'heroine_02','拿鐵','便利商店'); G.day+=2; const b=await give(G,'heroine_02','拿鐵','兩點半 Café');
      check('5. 芷若：便利商店的拿鐵＝opinion；2:30 AM 買的拿鐵不是',a.r==='opinion'&&b.r==='yes',J([a.r,b.r])); }
    { const G=fresh(); const a=await give(G,'kexin','青茶'); G.day+=2; const b=await give(G,'kexin','青茶（無糖）');
      check('5. 可昕：「有加糖的青茶」＝青茶（微糖）＝opinion；無糖的＝fav',E_('kexin','drink').opinion[0].item==='青茶（有加糖）'&&a.r==='opinion'&&b.r==='fav',J([a.r,b.r])); }
    { const G=fresh('2025-12-15'); const a=await give(G,'heroine_01','拿鐵');
      check('5. opinion 優先於情境（以安期末週收到拿鐵：opinion，不是 exam）',(CALENDAR.termOf(G.day)||{}).exam==='final'&&a.r==='opinion',a.r); } }
  /* 6 ctx */
  { const bad=[], seen={};
    const pickItem=(id,c,g,f)=>g.only?g.only.find(f||(()=>true)):neutral(id,c).find(f||(()=>true));
    for(const id of IDS) for(const c of ['drink','breakfast']){ const E=E_(id,c), X=E.ctx||{};
      if(X.again){ const g=X.again[0], n=pickItem(id,c,g); const G=fresh(); await give(G,id,n); G.day+=1; const h=await give(G,id,n); seen.again=(seen.again||0)+1;
        if(h.r!=='again'||!same(h.s,split(g.lines))) bad.push(id+'.'+c+' again '+n+' '+h.r);
        G.day+=2; const h2=await give(G,id,n); if(h2.r==='again') bad.push(id+'.'+c+' 隔一天也算 again'); }
      if(X.exam){ const G=fresh('2025-12-15'); const n=pickItem(id,c,X.exam[0]); const h=await give(G,id,n); seen.exam=(seen.exam||0)+1;
        if(h.r!=='exam'||!same(h.s,split(X.exam[0].lines))) bad.push(id+'.'+c+' exam '+n+' '+h.r);
        const G2=fresh('2025-10-20'); const h2=await give(G2,id,n); if(h2.r==='exam') bad.push(id+'.'+c+' 期中週也算 exam'); }
      if(X.night){ const g=X.night[0], hr=g.hour?g.hour[0]:18; const G=fresh('2025-09-16',hr); const n=pickItem(id,c,g); const h=await give(G,id,n); seen.night=(seen.night||0)+1;
        if(h.r!=='night'||!same(h.s,split(g.lines))) bad.push(id+'.'+c+' night '+hr+' '+h.r);
        const G2=fresh('2025-09-16',9); const h2=await give(G2,id,n); if(h2.r==='night') bad.push(id+'.'+c+' 早上也算 night'); }
      if(X.winterCold){ const g=X.winterCold[0], n=pickItem(id,c,g,x=>GIFT.TEMP[x]==='cold'); const G=fresh('2025-12-10'); if(E.fav&&E.fav.n===n){ G.day-=3; await give(G,id,n); G.day+=3; } const h=await give(G,id,n); seen.winterCold=(seen.winterCold||0)+1;
        if(!n||h.r!=='winterCold'||!same(h.s,split(g.lines))) bad.push(id+'.'+c+' winterCold '+n+' '+h.r);
        const hot=neutral(id,c).find(x=>GIFT.TEMP[x]==='hot'); if(hot){ const G2=fresh('2025-12-10'); const h2=await give(G2,id,hot); if(h2.r==='winterCold') bad.push(id+'.'+c+' 冬天送熱的也算 winterCold'); }
        const G3=fresh('2025-10-02'); const h3=await give(G3,id,n); if(h3.r==='winterCold') bad.push(id+'.'+c+' 十月也算 winterCold'); }
      if(X.summerHot){ const g=X.summerHot[0], n=pickItem(id,c,g,x=>GIFT.TEMP[x]==='hot'); const G=fresh('2026-07-10'); const h=await give(G,id,n); seen.summerHot=(seen.summerHot||0)+1;
        if(!n||h.r!=='summerHot'||!same(h.s,split(g.lines))) bad.push(id+'.'+c+' summerHot '+n+' '+h.r);
        const cold=neutral(id,c).find(x=>GIFT.TEMP[x]==='cold'); if(cold){ const G2=fresh('2026-07-10'); const h2=await give(G2,id,cold); if(h2.r==='summerHot') bad.push(id+'.'+c+' 夏天送冰的也算 summerHot'); } } }
    check('6. 情境（ctx）：每一位每一種都測（again 連續兩天、exam 期末週不含期中週、night 晚上送早餐、winterCold 冬天冰的、summerHot 夏天熱的）',!bad.length&&GIFT.CTX.every(k=>seen[k]>0),J(seen)+' '+bad.join('；'));
    { const G=fresh('2025-09-16',18); const h=await give(G,'heroine_01','飯糰'); const G2=fresh('2025-09-16',21); const h2=await give(G2,'heroine_01','飯糰');
      check('6. 以安晚上送早餐（AA_710 be775af69 改成「……這個時間買早餐？」，不限幾點）：18 點、21 點都是 night',h.r==='night'&&h2.r==='night',J([h.r,h2.r])); }
    { const G=fresh('2025-12-15'); stageOf.heroine_01=2; const h=await give(G,'heroine_01','無糖綠茶');
      check('6. 期末週又是冬天：exam 先於 winterCold（照 notes 的順序）',h.r==='exam',h.r); } }
  /* 7 交往中 */
  { const bad=[];
    for(const id of IDS) for(const c of ['drink','breakfast']){ const E=E_(id,c), D=E.yes.find(y=>y.dating); const N=neutral(id,c);
      const G=fresh(); stageOf[id]=6; const h0=await give(G,id,N[0]); if(h0.r!=='yes'||D.pool.some(p=>same(split(p.lines),h0.s))) bad.push(id+'.'+c+' 沒交往也用了交往中那一格');
      const G2=fresh(); stageOf[id]=6; G2.flags['dating_'+id]=true; const r0=Object.assign({},SOCIAL.rel(id)); const h=await give(G2,id,N[0]); const r1=SOCIAL.rel(id); const ok=D.pool.find(p=>!p.only||p.only.includes(N[0]));
      if(ok){ if(h.r!=='yes'||!same(h.s,split(ok.lines))||(r1.npcRom-(r0.npcRom|0))!==(D.rel.npcRom|0)) bad.push(id+'.'+c+' 交往中 '+J(h.s)); }
      else if(h.r!=='yes'||D.pool.some(p=>same(split(p.lines),h.s))) bad.push(id+'.'+c+' 交往中那一格都對不上，應該照階段'); }
    check('7. 交往中（dating_<id>）：dating 那一格優先、好感照它；沒交往就算第 6 階也不用',!bad.length,bad.join('；'));
    { const G=fresh(); stageOf.heroine_01=6; G.flags.dating_heroine_01=true; const D=E_('heroine_01','breakfast').yes.find(y=>y.dating);
      const a=await give(G,'heroine_01','三明治'); const G2=fresh(); stageOf.heroine_01=6; G2.flags.dating_heroine_01=true; const b=await give(G2,'heroine_01','飯糰');
      check('7. 以安交往中：送三明治＝「三明治分成兩半」那組；送飯糰跳過那組',same(a.s,split(D.pool[0].lines))&&/三明治/.test(a.s.join(''))&&same(b.s,split(D.pool[1].lines)),J([a.s,b.s])); }
    { const G=fresh(); stageOf.heroine_04=6; G.flags.dating_heroine_04=true; const h=await give(G,'heroine_04','三明治'); const y4=E_('heroine_04','breakfast').yes.find(y=>!y.dating&&y.need===4);
      check('7. 子晴交往中送三明治：交往中那一格只有「飯糰」那組 → 照階段那一格',h.r==='yes'&&same(h.s,split(y4.pool[0].lines)),J(h.s)); }
    { const G=fresh(); G.flags.romance={heroine_02:{status:'dating'}}; stageOf.heroine_02=6; const D=E_('heroine_02','drink').yes.find(y=>y.dating); const h=await give(G,'heroine_02','豆漿');
      check('7. 交往中也認 G.flags.romance[id].status＝dating',same(h.s,split(D.pool[0].lines)),J(h.s)); } }
  /* 8 講到品項／稱呼的組 */
  { const bad=[]; for(const c of ['drink','breakfast']){ const G=fresh(); stageOf.heroine_05=1; const P=E_('heroine_05',c).yes[0].pool, N=neutral('heroine_05',c), ls=[];
      for(let k=0;k<5;k++){ const h=await give(G,'heroine_05',N[k%N.length]); ls.push(h.s); G.day+=2; }
      const nm=G.name||'祐廷', sw=g=>split(g.lines.map(t=>t.split('學弟').join(nm)));
      const want=[split(P[0].lines),split(P[1].lines),sw(P[0]),sw(P[1]),sw(P[0])];
      if(!/學弟/.test(P[0].lines.join(''))||!P[0].swap||!same(ls,want)||ls.slice(2).some(s=>/學弟/.test(s.join('')))) bad.push(c+' '+J(ls)); }
    check('8. 學姊（飲料、早餐）：第 1～2 次叫「學弟」，第 3 次起那一句的「學弟」換成名字（notes「之後 {name}」）、照樣輪流',!bad.length,bad.join('；')); }
  { const G=fresh(); stageOf.heroine_04=2; await give(G,'heroine_04','青茶'); G.day+=1; const h=await give(G,'heroine_04','青茶'); const G2=fresh('2025-12-10'); const h2=await give(G2,'heroine_04','紅茶拿鐵');
    check('8. 子晴：連續兩天送青茶不說「又是冰美式」；冬天送紅茶拿鐵不說「冬天的冰美式」',h.r==='yes'&&!/冰美式/.test(h.s.join(''))&&h2.r==='yes'&&!/冰美式/.test(h2.s.join('')),J([h.r,h.s,h2.r,h2.s])); }
  { const bad=[]; for(const n of ['拿鐵','熱可可（加一份濃縮）','豆漿']) for(let k=0;k<4;k++){ const G=fresh(); stageOf.heroine_04=6; G.flags.dating_heroine_04=true; G.flags.GIFT={pool:{'heroine_04|drink|yes2':k%2}}; const h=await give(G,'heroine_04',n); if(/冰你一下/.test(h.s.join(''))) bad.push(n+' '+k); }
    const G=fresh(); stageOf.heroine_04=6; G.flags.dating_heroine_04=true; G.flags.GIFT={pool:{'heroine_04|drink|yes2':0}}; const h=await give(G,'heroine_04','無糖綠茶');
    check('8. 子晴交往中：「冰你一下」不配熱的、沒寫冷熱的（拿鐵、熱可可、豆漿）；冰的（無糖綠茶）可以',!bad.length&&/冰你一下/.test(h.s.join('')),bad.join('；')+' '+J(h.s)); }
  /* 9 舊存檔 */
  { const G=fresh(); delete G.carry; delete G.flags.GIFT; let err=null; try{ GIFT.talkOpts(G,'heroine_01'); GIFT.shopOpt(G,'便利商店'); }catch(e){ err=e; }
    check('9. 舊存檔（沒有 carry、GIFT）不丟例外',!err,String(err));
    const G2=fresh(); G2.flags.GIFT={day:{'heroine_02|drink':G2.day-1},fav:{},n:{heroine_02:1}}; G2.carry=[{n:'拿鐵',cat:'drink',day:G2.day}]; H.said=[]; let r=null, e2=null;
    try{ r=await GIFT.give(GM,who('heroine_02'),'heroine_02',G2.carry[0]); }catch(e){ e2=e; }
    const R=G2.flags.GIFT;
    check('9. 第一版的 G.flags.GIFT（只有 day／fav／n）、帶著的東西沒有店名：照樣送（不算便利商店的拿鐵）、補上 last／pool',!e2&&r==='yes'&&R.n.heroine_02===2&&R.last['heroine_02|drink']&&R.last['heroine_02|drink'].n==='拿鐵'&&typeof R.pool==='object',String(e2)+' '+r+' '+J(R)); }
  /* 10 拆旁白 */
  { const G=fresh(); stageOf.heroine_02=2; const o=E_('heroine_02','drink').opinion.find(x=>x.n==='拿鐵'); const raw=o.pool[0].lines.find(t=>/^（[^）]*）./.test(t));
    H.said=[]; const c=mk(G,'拿鐵','便利商店'); await GIFT.give(GM,who('heroine_02'),'heroine_02',c); const m=/^(（[^）]*）)(.+)$/.exec(raw||''); const i=H.said.findIndex(s=>m&&s.t===m[1]);
    check('10. 「（動作）講的話」拆成旁白＋她說的、字不改',!!m&&i>0&&H.said[i].who===null&&H.said[i+1].t===m[2]&&H.said[i+1].who==='林芷若'&&H.said[i].t+H.said[i+1].t===raw,J(H.said)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
