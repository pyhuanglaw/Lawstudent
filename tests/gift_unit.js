// 送早餐、飲料（GIFT-FLIRT-1107，USER_WANTS X262；台詞 AA_710 第二版 be775af69；只配某一樣的組、早餐、可昕微糖照 AA_728 7ac7380ff _meta）——不需要瀏覽器（D131）。
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
//  11. AA_728 _meta.itemOnly（AA-B 11-08 08:24）：五筆都對到那幾組（only／hour）；只在送那一樣（「再喝我晚上會睡不著」：咖啡、21 點以後）才出，不然跳過、輪到下一組；
//      匯入工具：位置對不到、那一組沒提到那一樣、句子改了、item 寫法不認得、kexinSugar／早餐那一句改了 → 停下來
//  12. 早餐＝豆漿、米漿、飯糰、三明治（AA_728 notes；不加早餐店）：送她豆漿算早餐（同一天再送飯糰＝no）；以安的豆漿、沛珊的米漿 AA_710 寫在飲料（她最喜歡的）＝對她算飲料
//  13. 挑反應的順序 fav＞opinion＞ctx＞yes；opinion、ctx 沒寫 rel＝用她這時候 yes 那一格的 rel
//  14. STALE-SOURCES-1112（AA_710 335301d353，X350「所有飲料店賣的飲料都可以買一份帶走送人」新增八格 opinion）：品名綁各店菜單上的飲料（在哪一間買的都算、舊存檔沒記店名也算）、
//      「一盞茶屋的茶（任何一樣）」＝照店（shopAny；舊存檔沒記店名＝不算；一盞現在還不能買來送人＝匯入工具印提醒）；
//      匯入工具：品名對不到 → 一次列完再停；沒有那間店 → 停；店的菜單讀不到 → 停（不放行）
//  朋友（AA_728 people）：tests/gift_friends_unit.js
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
    /* 2026-11-12 STALE-SOURCES-1112：舊期望 @31c1c4e2c（X324 G 區）；AA-C 11-12 04:18 改了源稿（335301d353，X350 新增八格 opinion），白名單換版 */
    check('0. src/data/gift_lines.js 和白名單上的 AA_710 一致（import_gifts.py --check；335301d353＝X350 新增八格 opinion，AA-C 11-12 04:18；舊期望 31c1c4e2c）',ok1&&ok2&&ok&&/@335301d353$/.test(src),out.trim().slice(0,200)+' '+src); }
  if(!ok1||!ok2){ H.done(); return; }
  const LN=GIFT_LINES.people;
  const ITEMN=Object.keys(GIFT.TEMP);
  /* 各店菜單上的飲料（tools/story/gift_shop_menus.js：載入各店的資料和點餐程式問 GIFT.menu；匯入工具用的同一份）*/
  let MENUS={shops:{},unreadable:['沒跑'],loadErr:[]}; try{ MENUS=JSON.parse(cp.execFileSync('node',[path.join(H.ROOT,'tools/story/gift_shop_menus.js')],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop()); }catch(e){ MENUS.loadErr.push(String(e).slice(0,160)); }
  const shopsOf=n=>Object.keys(MENUS.shops).filter(s=>MENUS.shops[s].includes(n));
  const catOf=n=>{ for(const it of GIFT.ITEMS) for(const o of it.opt||[['','']]) if(it.n+o[1]===n) return it.cat; return null; };
  const kindOf=(id,n)=>((LN[id]&&LN[id].sec)||{})[n]||catOf(n);   /* 這一樣對她算哪一種（以安的豆漿、沛珊的米漿寫在飲料）*/
  { const bad=[];
    for(const id of IDS) for(const c of ['drink','breakfast']){ const E=LN[id]&&LN[id][c]; if(!E){ bad.push(id+'.'+c+' 沒有'); continue; }
      const norm=E.yes.filter(y=>!y.dating); if(!norm.length||norm[0].need!==1) bad.push(id+'.'+c+' 沒有 need 1');
      if(!E.yes.some(y=>y.dating)) bad.push(id+'.'+c+' 沒有交往中那一格');
      for(const y of E.yes){ if(!Array.isArray(y.pool)||!y.pool.length||!same(y.lines,y.pool[0].lines)) bad.push(id+'.'+c+' yes lines≠pool[0]'); }
      if(!E.no.length||!E.no.every(g=>g.lines&&g.lines.length)) bad.push(id+'.'+c+' no');
      /* 舊期望：fav／opinion 的品項都在 S.ITEMS。335301d353（X350）起 opinion 也可以是某一間可以買來送人的店菜單上的飲料（只能寫在 drink）、或整間店（shopAny，只能寫在 drink）；fav 照舊只能是 S.ITEMS */
      for(const e of [E.fav].concat(E.opinion||[]).filter(Boolean)){ const inItems=ITEMN.includes(e.n)&&kindOf(id,e.n)===c, onMenu=e!==E.fav&&c==='drink'&&!e.shopAny&&!!e.n&&shopsOf(e.n).length>0, byShop=e!==E.fav&&c==='drink'&&typeof e.shopAny==='string'&&!!e.shopAny&&e.n===undefined;
        if(!inItems&&!onMenu&&!byShop) bad.push(id+'.'+c+' 品項 '+e.item+'→'+e.n); }
      for(const k in E.ctx||{}) if(!GIFT.CTX.includes(k)) bad.push(id+'.'+c+' ctx '+k); }
    check('0. 七位都有飲料、早餐：need 1、交往中那一格、pool（lines＝第一組）、no；fav／opinion 的品項都是遊戲買得到的（S.ITEMS、各店菜單上的飲料，或整間店）',!bad.length&&!MENUS.unreadable.length&&!MENUS.loadErr.length,bad.join('；')+J([MENUS.unreadable,MENUS.loadErr]));
    check('0. 七位都有最喜歡的（fav；以安豆漿、語彤鮮奶茶（2026-11-11 AA_772 第 95 列：品項「紅茶拿鐵」改名「鮮奶茶」，舊期望 紅茶拿鐵）、沛珊米漿是第二版新的）',IDS.every(id=>LN[id].drink.fav)&&LN.heroine_01.drink.fav.n==='豆漿'&&LN.heroine_03.drink.fav.n==='鮮奶茶'&&LN.classmate_peishan.drink.fav.n==='米漿',J(IDS.map(id=>(LN[id].drink.fav||{}).n)));
    const py=(code)=>{ try{ cp.execFileSync('python3',['-c',code],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); return 'ran'; }catch(e){ return String(e.stderr||''); } };
    const pre="import sys,json,subprocess;sys.path.insert(0,'tools/story');import import_gifts as M;d=json.loads(subprocess.check_output(['git','show','be775af69:'+M.PATH]).decode());I=M.game_items();m2=json.loads(subprocess.check_output(['git','show','7ac7380ff:'+M.PATH2]).decode())['_meta'];";
    const e1=py(pre+"d['heroine_01']['drink']['fav']['item']='珍珠奶茶';M.build(d,'x',I,m2)");
    const e2=py(pre+"d['heroine_01']['drink']['ctx']['night']=[['x']];M.build(d,'x',I,m2)");
    const e3=py(pre+"d['heroine_01']['drink']['yes'][0]['lines']=['x'];M.build(d,'x',I,m2)");
    const e4=py(pre+"M.build(d,'x',I,m2)");
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
  const mk=(G,n,shop)=>{ G.carry=[]; const c={n,cat:catOf(n)||'drink',day:G.day,shop:shop||'便利商店'}; G.carry.push(c); return c; };   /* 各店菜單上的飲料（不在 S.ITEMS）＝drink */
  const split=ls=>[].concat(...ls.map(t=>{ const s=GIFT.text(H.G,t), m=/^(（[^）]*）)(.+)$/.exec(s); return m?[m[1],m[2]]:[s]; }));
  const give=async(G,id,n,shop)=>{ const c=mk(G,n,shop); H.said=[]; const r=await GIFT.give(GM,who(id),id,c); const s=said(); return {r,s:r==='no'?s:s.slice(1),first:s[0],pick:GIFT.lastPick,c}; };
  const E_=(id,c)=>LN[id][c];
  const onlyItems=(id,c)=>{ const E=E_(id,c), o=new Set(); const add=gs=>(gs||[]).forEach(g=>(g.only||[]).forEach(n=>o.add(n))); E.yes.forEach(y=>add(y.pool)); add(E.no); (E.opinion||[]).forEach(x=>add(x.pool)); for(const k in E.ctx||{}) add(E.ctx[k]); return o; };
  /* 「中性」的品項：不是她最喜歡的、她沒意見、沒有句子講到它 */
  const neutral=(id,c)=>{ const E=E_(id,c), O=onlyItems(id,c); return ITEMN.filter(n=>kindOf(id,n)===c&&!(E.fav&&E.fav.n===n)&&!(E.opinion||[]).some(o=>o.n===n)&&!O.has(n)); };
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
      const okI=E.no.map((g,i)=>(!g.only||g.only.includes(N[0]))&&(!g.hour||(G.hour>=g.hour[0]&&G.hour<g.hour[1]))?i:-1).filter(i=>i>=0);   /* 只配某一樣／幾點以後的組（11）不算 */
      const want=seq.map((_,k)=>okI[k%okI.length]); if(!same(seq,want)) bad.push(id+'.'+c+' no '+J(seq)+' 要 '+J(want)); }
    check('3. 同一種一天第二次：她不收（no）、東西留著；no 輪流（七位 × 兩種；只配某一樣的組跳過）',!bad.length,bad.join('；')); }
  /* 4 fav */
  { const bad=[];
    for(const id of IDS){ const G=fresh(); stageOf[id]=3; const FV=E_(id,'drink').fav; const r0=Object.assign({},SOCIAL.rel(id)); const g=await give(G,id,FV.n); const r1=SOCIAL.rel(id);
      if(g.r!=='fav'||!same(g.s,split(FV.lines))||!SOCIAL.has(id,'REMEMBERED_HER')) bad.push(id+' 第一次 '+g.r+' '+J(g.s));
      for(const k of Object.keys(FV.rel)) if((r1[k]|0)-(r0[k]|0)!==FV.rel[k]) bad.push(id+' 好感 '+k);
      G.day+=2; const g2=await give(G,id,FV.n); if(g2.r==='fav') bad.push(id+' 第二次還是 fav'); }
    check('4. 七位：第一次送到她最喜歡的＝fav、記 REMEMBERED_HER、好感照 fav；隔幾天再送對不是 fav',!bad.length,bad.join('；')); }
  /* 5 opinion */
  { const bad=[];
    /* 舊寫法：give(G,id,o.n,o.shop||'便利商店')。335301d353 起：各店菜單上的品名＝在賣它的那一間買；整間店（shopAny）＝在那間店買的一樣她沒有別的意見的東西（無糖綠茶）*/
    for(const id of IDS) for(const c of ['drink','breakfast']) for(const o of E_(id,c).opinion||[]){ const G=fresh(); const g=o.shopAny?await give(G,id,'無糖綠茶',o.shopAny):await give(G,id,o.n,o.shop||(ITEMN.includes(o.n)?'便利商店':shopsOf(o.n)[0]));
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
    { const G=fresh(); G.flags.romance={heroine_02:{status:'dating'}}; stageOf.heroine_02=6; const D=E_('heroine_02','drink').yes.find(y=>y.dating); const h=await give(G,'heroine_02','無糖綠茶');
      check('7. 交往中也認 G.flags.romance[id].status＝dating',same(h.s,split(D.pool[0].lines)),J(h.s)); } }
  /* 8 講到品項／稱呼的組 */
  { const bad=[]; for(const c of ['drink','breakfast']){ const G=fresh(); stageOf.heroine_05=1; const P=E_('heroine_05',c).yes[0].pool, N=neutral('heroine_05',c), ls=[];
      for(let k=0;k<5;k++){ const h=await give(G,'heroine_05',N[k%N.length]); ls.push(h.s); G.day+=2; }
      const nm=G.name||'祐廷', sw=g=>split(g.lines.map(t=>t.split('學弟').join(nm)));
      const want=[split(P[0].lines),split(P[1].lines),sw(P[0]),sw(P[1]),sw(P[0])];
      if(!/學弟/.test(P[0].lines.join(''))||!P[0].swap||!same(ls,want)||ls.slice(2).some(s=>/學弟/.test(s.join('')))) bad.push(c+' '+J(ls)); }
    check('8. 學姊（飲料、早餐）：第 1～2 次叫「學弟」，第 3 次起那一句的「學弟」換成名字（notes「之後 {name}」）、照樣輪流',!bad.length,bad.join('；')); }
  { const G=fresh(); stageOf.heroine_04=2; await give(G,'heroine_04','青茶'); G.day+=1; const h=await give(G,'heroine_04','青茶'); const G2=fresh('2025-12-10'); const h2=await give(G2,'heroine_04','鮮奶茶');
    check('8. 子晴：連續兩天送青茶不說「又是冰美式」；冬天送鮮奶茶（2026-11-11 AA_772 第 95 列改名，舊期望「紅茶拿鐵」）不說「冬天的冰美式」',h.r==='yes'&&!/冰美式/.test(h.s.join(''))&&h2.r==='yes'&&!/冰美式/.test(h2.s.join('')),J([h.r,h.s,h2.r,h2.s])); }
  { const bad=[]; for(const n of ['拿鐵','熱可可（加一份濃縮）','美式咖啡']) for(let k=0;k<4;k++){ const G=fresh(); stageOf.heroine_04=6; G.flags.dating_heroine_04=true; G.flags.GIFT={pool:{'heroine_04|drink|yes2':k%2}}; const h=await give(G,'heroine_04',n); if(/冰你一下/.test(h.s.join(''))) bad.push(n+' '+k); }
    const G=fresh(); stageOf.heroine_04=6; G.flags.dating_heroine_04=true; G.flags.GIFT={pool:{'heroine_04|drink|yes2':0}}; const h=await give(G,'heroine_04','無糖綠茶');
    check('8. 子晴交往中：「冰你一下」不配熱的（拿鐵、熱可可、熱美式）；冰的（無糖綠茶）可以',!bad.length&&/冰你一下/.test(h.s.join('')),bad.join('；')+' '+J(h.s)); }
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
  /* 11 只配某一樣（AA_728 _meta.itemOnly，AA-B 11-08 08:24）*/
  const py2=(code)=>{ try{ cp.execFileSync('python3',['-c',code],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); return 'ran'; }catch(e){ return String(e.stderr||''); } };
  const PRE="import sys,json,subprocess;sys.path.insert(0,'tools/story');import import_gifts as M;d=json.loads(subprocess.check_output(['git','show','be775af69:'+M.PATH]).decode());s2=json.loads(subprocess.check_output(['git','show','7ac7380ff:'+M.PATH2]).decode());m2=s2['_meta'];I=M.game_items();";
  const A728=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show','7ac7380ff:docs/story_planning/AA_728_gifts_friends.json'],{encoding:'utf8'}));
  { const io=A728._meta.itemOnly, bad=[], has=(g,re)=>re.test(g.lines.join(''));
    const an_bf=E_('heroine_01','breakfast').yes.find(y=>y.dating).pool, yt_bf=E_('heroine_03','breakfast').yes.find(y=>!y.dating&&y.need===4).pool, zq_bf=E_('heroine_04','breakfast').yes.find(y=>y.dating).pool, zq_dr=E_('heroine_04','drink'), an_no=E_('heroine_01','drink').no;
    if(!(same(an_bf[0].only,['三明治'])&&has(an_bf[0],/三明治分成兩半/)&&!an_bf[1].only)) bad.push('以安早餐交往中 '+J(an_bf));
    if(!(same(yt_bf[1].only,['飯糰'])&&has(yt_bf[1],/這個飯糰/)&&!yt_bf[0].only)) bad.push('語彤早餐 need 4 '+J(yt_bf));
    if(!(same(zq_bf[0].only,['飯糰'])&&has(zq_bf[0],/把飯糰吃完/))) bad.push('子晴早餐交往中 '+J(zq_bf));
    if(!(same(zq_dr.ctx.winterCold[0].only,['美式咖啡（冰的）'])&&same(zq_dr.ctx.again[0].only,['美式咖啡（冰的）']))) bad.push('子晴 ctx '+J(zq_dr.ctx));
    const sl=an_no.find(g=>g.lines.includes('再喝我晚上會睡不著。你喝。'));
    if(!(sl&&same(sl.only,['美式咖啡','美式咖啡（冰的）','拿鐵'])&&sl.hour&&sl.hour[0]===21&&sl.hour[1]>=27&&an_no.filter(g=>g.only||g.hour).length===1)) bad.push('以安 no '+J(an_no));
    let n=0; for(const id of IDS) for(const c of ['drink','breakfast']) n+=onlyItems(id,c).size?[].concat(...E_(id,c).yes.map(y=>y.pool),E_(id,c).no,...(E_(id,c).opinion||[]).map(o=>o.pool),...Object.values(E_(id,c).ctx||{})).filter(g=>g.only).length:0;
    check('11. AA_728 itemOnly 五筆（AA-B 7ac7380ff）都對到：以安三明治、語彤飯糰、子晴飯糰、子晴冰美式（winterCold、again）、以安「再喝我晚上會睡不著」（咖啡、21 點以後）；加上子晴「冰你一下」只有這 7 組有 only',
      io.list.length===5&&!bad.length&&n===7,bad.join('；')+' 有 only 的組 '+n); }
  { const seqNo=async(hour,items)=>{ const G=fresh('2025-09-16',hour); stageOf.heroine_01=2; const E=E_('heroine_01','drink'); await give(G,'heroine_01',items[0]); const out=[];
      for(let k=0;k<3;k++){ const h=await give(G,'heroine_01',items[(k+1)%items.length]); out.push(h.r==='no'?E.no.findIndex(p=>same(split(p.lines),h.s)):'x'); } return out.join(''); };
    const a=await seqNo(21,['美式咖啡','拿鐵']), b=await seqNo(20,['美式咖啡','拿鐵']), c=await seqNo(21,['無糖綠茶','熱可可']), d=await seqNo(25,['美式咖啡（冰的）','拿鐵']);
    check('11. 以安「再喝我晚上會睡不著。你喝。」：送咖啡（美式、拿鐵）而且 21 點以後才輪得到（21 點 010、過了午夜 010）；20 點、送綠茶熱可可都跳過（000）',a==='010'&&d==='010'&&b==='000'&&c==='000',J({h21:a,h20:b,tea21:c,h25:d})); }
  { const G=fresh(); stageOf.heroine_03=4; const P=E_('heroine_03','breakfast').yes.find(y=>!y.dating&&y.need===4).pool, s1=[], s2=[];
    for(let k=0;k<3;k++){ const h=await give(G,'heroine_03','飯糰'); s1.push(P.findIndex(p=>same(split(p.lines),h.s))); G.day+=2; }
    const G2=fresh(); stageOf.heroine_03=4; for(let k=0;k<3;k++){ const h=await give(G2,'heroine_03','三明治'); s2.push(P.findIndex(p=>same(split(p.lines),h.s))); G2.day+=2; }
    check('11. 語彤（熟了）送飯糰：輪流 010（「這個飯糰…」在第 1 組）；送三明治跳過那一組：000',s1.join('')==='010'&&s2.join('')==='000',J([s1,s2])); }
  { const G=fresh(); stageOf.heroine_04=6; G.flags.dating_heroine_04=true; const D=E_('heroine_04','breakfast').yes.find(y=>y.dating); const h=await give(G,'heroine_04','飯糰');
    check('11. 子晴交往中送飯糰＝「把飯糰吃完」那一組（送三明治跳過，見 7）',h.r==='yes'&&same(h.s,split(D.pool[0].lines)),J(h.s)); }
  { const G=fresh('2025-12-10'); stageOf.heroine_04=2; await give(G,'heroine_04','美式咖啡（冰的）'); G.day+=2; const a=await give(G,'heroine_04','美式咖啡（冰的）'); G.day+=1; const b=await give(G,'heroine_04','美式咖啡（冰的）');
    const G2=fresh('2025-12-10'); stageOf.heroine_04=2; const c=await give(G2,'heroine_04','無糖綠茶'); G2.day+=1; const d=await give(G2,'heroine_04','無糖綠茶'); const G3=fresh(); stageOf.heroine_04=2; await give(G3,'heroine_04','美式咖啡'); G3.day+=1; const e=await give(G3,'heroine_04','美式咖啡');
    check('11. 子晴：冬天送冰美式＝winterCold「冬天的冰美式」、連續兩天＝again「又是冰美式」；冬天送冰的綠茶、連續兩天送熱美式都不說「冰美式」',a.r==='winterCold'&&b.r==='again'&&c.r==='yes'&&d.r==='yes'&&e.r==='yes'&&![c,d,e].some(x=>/冰美式/.test(x.s.join(''))),J([a.r,b.r,c.r,d.r,e.r])); }
  { const e1=py2(PRE+"m2['itemOnly']['list'][0]['where']='breakfast.yes[9]';M.build(d,'x',I,m2)");
    const e2=py2(PRE+"m2['itemOnly']['list'][0]['item']='三明治（大）';M.build(d,'x',I,m2)");
    const e3=py2(PRE+"d['heroine_01']['drink']['no'][1]=['再喝我會睡不著。'];M.build(d,'x',I,m2)");
    const e4=py2(PRE+"y=d['heroine_03']['breakfast']['yes'][1];y['pool'][1]=['這個，我上次在便利商店看到，一直想試。'];M.build(d,'x',I,m2)");
    const e5=py2(PRE+"m2['itemOnly']['list'][3]['where']='drink.ctx.night';M.build(d,'x',I,m2)");
    const e6=py2(PRE+"d['heroine_01']['drink']['no'][0]=['「今天已經喝過了。」'];M.build(d,'x',I,m2)");
    const e7=py2(PRE+"M.build(d,'x',I,m2)");
    check('11. 匯入工具：位置對不到、item 寫法不認得、句子改了、那一組沒提到那一樣、ctx 沒有那一格、有名字的句子外面加「」 → 停下來；原稿通過',
      /只有 \d+ 格/.test(e1)&&/ONLY_ITEM 沒有/.test(e2)&&/有這一句的組有 0 組/.test(e3)&&/沒有提到「飯糰」/.test(e4)&&/沒有 ctx\.night/.test(e5)&&/TEXT-QUOTE-UNIFY/.test(e6)&&e7==='ran',[e1,e2,e3,e4,e5,e6,e7].map(s=>s.trim().split('\n').pop()).join(' | ')); }
  { const o=E_('kexin','drink').opinion.find(x=>x.item==='青茶（有加糖）'); const G=fresh(); const a=await give(G,'kexin','青茶'); G.day+=2; const b=await give(G,'kexin','青茶（無糖）');
    const e1=py2(PRE+"m2['itemOnly']['kexinSugar']='可昕的青茶要有糖';M.build(d,'x',I,m2)");
    check('11. 可昕 kexinSugar：「青茶（有加糖）」＝青茶不是無糖的每一種（ns：遊戲的微糖）；微糖＝opinion、無糖＝fav；kexinSugar 那一句改了 → 匯入停下來',!!o&&same(o.ns,['青茶'])&&a.r==='opinion'&&b.r==='fav'&&/kexinSugar/.test(e1),J([o&&o.ns,a.r,b.r,e1.trim().split('\n').pop()])); }
  /* 12 早餐＝飯糰、三明治；豆漿、米漿算飲料（AA_728 notes 7ac7380ff，AA-B 11-08 08:49 更正：照 AA_710 原本的分法；不加早餐店）*/
  { const m=/breakfast＝([^；。]+)/.exec(A728._meta.notes.join('\n')), want=m?m[1].split('、').sort():[];
    const bf=GIFT.ITEMS.filter(it=>it.cat==='breakfast').map(it=>it.n).sort();
    check('12. 早餐（S.ITEMS cat breakfast）＝AA_728 notes「breakfast＝飯糰、三明治」；豆漿、米漿和其他都是飲料',same(bf,want)&&same(want,['三明治','飯糰'].sort())&&['飯糰','三明治'].every(n=>GIFT.CAT[n]==='breakfast')&&['豆漿','米漿'].every(n=>GIFT.CAT[n]==='drink')&&Object.keys(GIFT.CAT).filter(n=>GIFT.CAT[n]==='drink').length===ITEMN.length-2,J({bf,want}));
    const e1=py2(PRE+"k=[i for i,x in enumerate(s2['_meta']['notes']) if 'breakfast＝' in x][0];s2['_meta']['notes'][k]=s2['_meta']['notes'][k].replace('breakfast＝飯糰','breakfast＝豆漿、飯糰');M.build_friends(s2,'x',I)");
    const e2=py2(PRE+"M.build_friends(s2,'x',I)");
    check('12. 匯入工具：AA_728 的早餐那一句和遊戲的早餐對不上 → 停下來；原稿通過',/不一樣/.test(e1)&&e2==='ran',[e1,e2].map(s=>s.trim().split('\n').pop()).join(' | '));
    const G=fresh(); stageOf.heroine_02=2; const a=await give(G,'heroine_02','豆漿'); const b=await give(G,'heroine_02','無糖綠茶'); const c=await give(G,'heroine_02','飯糰');
    const y=E_('heroine_02','drink').yes.find(q=>!q.dating&&q.need===1);
    check('12. 芷若：豆漿＝飲料（飲料那一格的話）；同一天再送綠茶＝no（飲料的 no）；再送飯糰（早餐）照收',a.r==='yes'&&y.pool.some(p=>same(split(p.lines),a.s))&&b.r==='no'&&E_('heroine_02','drink').no.some(p=>same(split(p.lines),b.s))&&c.r==='yes',J([a.r,a.s,b.r,b.s,c.r]));
    const G2=fresh('2025-09-16',18); stageOf.heroine_02=2; const n=await give(G2,'heroine_02','飯糰');
    check('12. 芷若晚上收到飯糰＝晚上送早餐（night）',n.r==='night'&&same(n.s,split(E_('heroine_02','breakfast').ctx.night[0].lines)),J([n.r,n.s]));
    const G3=fresh(); stageOf.heroine_01=2; const f=await give(G3,'heroine_01','豆漿'); const g=await give(G3,'heroine_01','飯糰'); const h=await give(G3,'heroine_01','無糖綠茶');
    check('12. 以安：豆漿（飲料，她最喜歡的）＝fav；同一天再送飯糰（早餐）照收、再送綠茶（飲料）＝no；沒有 sec',!LN.heroine_01.sec&&f.r==='fav'&&g.r==='yes'&&h.r==='no'&&E_('heroine_01','drink').no.some(p=>same(split(p.lines),h.s)),J([f.r,g.r,h.r,h.s]));
    const G4=fresh(); stageOf.classmate_peishan=2; const p1=await give(G4,'classmate_peishan','米漿'); G4.day+=1; const p2=await give(G4,'classmate_peishan','米漿');
    check('12. 沛珊：米漿（飲料）第一次＝fav、隔天再送＝again「你昨天也買這個！」',!LN.classmate_peishan.sec&&p1.r==='fav'&&p2.r==='again'&&same(p2.s,split(E_('classmate_peishan','drink').ctx.again[0].lines)),J([p1.r,p2.r,p2.s]));
    const G5=fresh(); mk(G5,'豆漿'); G5.carry.push({n:'米漿',cat:'drink',day:G5.day,shop:'便利商店'});
    check('12. 當面說話：以安、芷若都有「送她豆漿」「送她米漿」',same(GIFT.talkOpts(G5,'heroine_01').map(x=>x.t),['送她豆漿','送她米漿'])&&same(GIFT.talkOpts(G5,'heroine_02').map(x=>x.t),['送她豆漿','送她米漿']),J(GIFT.talkOpts(G5,'heroine_01').map(x=>x.t))); }
  /* 13 順序與好感 */
  { const G=fresh('2025-12-15'); stageOf.heroine_01=2; const a=await give(G,'heroine_01','豆漿');
    check('13. fav 先於情境（以安期末週第一次收到豆漿：fav，不是 exam）',(CALENDAR.termOf(G.day)||{}).exam==='final'&&a.r==='fav',a.r);
    const bad=[];
    for(const [id,n,st] of [['heroine_02','美式咖啡',2],['heroine_02','美式咖啡',4],['heroine_05','鮮奶茶',4],['kexin','青茶',2]]){ const G2=fresh(); stageOf[id]=st; const r0=Object.assign({},SOCIAL.rel(id)); const h=await give(G2,id,n); const r1=SOCIAL.rel(id);
      const y=E_(id,'drink').yes.filter(q=>!q.dating&&q.need<=st).sort((p,q)=>q.need-p.need)[0], d={fam:r1.fam-(r0.fam|0),comf:r1.comf-(r0.comf|0),trust:r1.trust-(r0.trust|0),npcRom:r1.npcRom-(r0.npcRom|0)};
      const want={fam:y.rel.fam|0,comf:y.rel.comf|0,trust:y.rel.trust|0,npcRom:st>=3?(y.rel.npcRom|0):0}; if(h.r!=='opinion'||!same(d,want)) bad.push(id+' '+n+' '+st+' '+h.r+' '+J(d)+' 要 '+J(want)); }
    { const G3=fresh(); stageOf.heroine_01=2; await give(G3,'heroine_01','無糖綠茶'); G3.day+=1; const r0=Object.assign({},SOCIAL.rel('heroine_01')); const h=await give(G3,'heroine_01','無糖綠茶'); const r1=SOCIAL.rel('heroine_01'); const y=E_('heroine_01','drink').yes.find(q=>!q.dating&&q.need===1);
      if(h.r!=='again'||r1.fam-r0.fam!==(y.rel.fam|0)||r1.comf-r0.comf!==(y.rel.comf|0)) bad.push('以安 again '+h.r); }
    check('13. opinion、ctx 稿裡沒寫 rel：好感照她這時候 yes 那一格（階段 2＝need 1、階段 4＝need 4，npcRom 朋友以上才算）',!bad.length,bad.join('；')); }
  /* 14 STALE-SOURCES-1112：AA_710 335301d353 新增八格（品名綁各店菜單、整間店）*/
  { const NEW=[['heroine_01','檸檬綠茶'],['heroine_02','珍珠奶茶'],['heroine_03','冬瓜茶'],['heroine_04','檸檬多多'],['heroine_05','紅茶'],['classmate_peishan','葡萄柚多多'],['kexin','百香果綠茶']];
    const A710=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show','335301d353:docs/story_planning/AA_710_gifts.json'],{encoding:'utf8'}));
    const bad=[]; let n=0;
    for(const [id,nm] of NEW){ const o=(E_(id,'drink').opinion||[]).find(x=>x.n===nm), src=(A710[id].drink.opinion||[]).find(x=>x.item===nm);
      /* 2026-11-12 AA_710 lawww_1112b：學姊的紅茶任何一家都算＝那一格有 ns（紅茶、紅茶（中）、紅茶（大））；其他六格照舊沒有 ns */ const nsOk=(id==='heroine_05'&&nm==='紅茶')?same((o&&o.ns||[]).slice().sort(),['紅茶','紅茶（中）','紅茶（大）'].sort()):!(o&&o.ns);
      if(!o||!src||o.shop||!nsOk||o.shopAny||!same(o.pool.map(g=>g.lines),[src.lines])){ bad.push(id+' '+nm+' 資料 '+J(o)); continue; }
      const at=shopsOf(nm); if(!at.length) bad.push(nm+' 不在任何一間店的菜單');
      for(const shop of at.concat([undefined])){ const G=fresh(); stageOf[id]=2; G.carry=[]; const c={n:nm,cat:'drink',day:G.day}; if(shop) c.shop=shop; G.carry.push(c); H.said=[]; let r=null; try{ r=await GIFT.give(GM,who(id),id,c); }catch(e){ r='例外 '+e; } n++;
        if(r!=='opinion'||!same(said().slice(1),split(src.lines))||G.carry.length) bad.push(id+' '+nm+'＠'+shop+' '+r+' '+J(said())); } }
    check('14. 新增七格（以安檸檬綠茶、芷若珍珠奶茶、語彤冬瓜茶、子晴檸檬多多、學姊紅茶、沛珊葡萄柚多多、可昕百香果綠茶）：句子＝稿 335301d353 那幾句；在賣它的每一間店買的都算、舊存檔沒記店名的也算（'+n+' 次）',!bad.length&&n>=16&&same(shopsOf('紅茶').sort(),['喝不喝咖啡','洋洋鹹酥雞','頁間書屋'].sort()),bad.join('；')+' '+J(shopsOf('紅茶')));
    /* 品名要一字不差：帝大紅茶的「紅茶（中）」不是「紅茶」；別人收到那一樣＝一般句子 */
    { const G=fresh(); stageOf.heroine_05=2; const a=await give(G,'heroine_05','紅茶（中）','帝大紅茶'); const G2=fresh(); stageOf.heroine_01=2; const b=await give(G2,'heroine_01','珍珠奶茶','喝不喝咖啡');
      const G3=fresh(); stageOf.heroine_05=2; const c3=await give(G3,'heroine_05','檸檬紅茶（中）','帝大紅茶');
      /* 2026-11-12 改期望（AA_710 lawww_1112b）：學姊的紅茶任何一家都算，帝大紅茶的「紅茶（中）」也是那一格；水果紅茶（檸檬紅茶）不算。舊期望：品名一字不差才算、紅茶（中）不是那一格 */
      check('14. 學姊的紅茶任何一家都算：帝大紅茶的「紅茶（中）」＝那一格；檸檬紅茶（水果紅茶）不算；以安收到珍珠奶茶（芷若的那一樣）＝一般句子',a.r==='opinion'&&c3.r!=='opinion'&&b.r==='yes',J([a.r,c3.r,b.r])); }
    /* 整間店 */
    const oy=(E_('heroine_03','drink').opinion||[]).find(x=>x.shopAny), sy=A710.heroine_03.drink.opinion.find(x=>x.item==='一盞茶屋的茶（任何一樣）');
    { const G=fresh(); stageOf.heroine_03=2; const a=await give(G,'heroine_03','無糖綠茶','一盞茶屋'); const G2=fresh(); stageOf.heroine_03=2; const b=await give(G2,'heroine_03','無糖綠茶','便利商店');
      const G3=fresh(); stageOf.heroine_03=2; G3.carry=[{n:'無糖綠茶',cat:'drink',day:G3.day}]; H.said=[]; let c=null; try{ c=await GIFT.give(GM,who('heroine_03'),'heroine_03',G3.carry[0]); }catch(e){ c='例外 '+e; }
      const G4=fresh(); stageOf.heroine_03=2; const d=await give(G4,'heroine_03','凍頂烏龍（附一碟茶點）','一盞茶屋'); const G5=fresh(); stageOf.heroine_03=3; const f=await give(G5,'heroine_03','鮮奶茶','一盞茶屋');
      check('14. 語彤「一盞茶屋的茶（任何一樣）」＝照店（shopAny）：一盞茶屋買的任何一樣＝那兩句（稿 335301d353）；同一樣在便利商店買的不是；舊存檔沒記店名的不是、不丟例外；她最喜歡的（鮮奶茶）還是 fav 先',
        !!oy&&!!sy&&oy.shopAny==='一盞茶屋'&&oy.item===sy.item&&oy.n===undefined&&same(oy.pool.map(g=>g.lines),[sy.lines])&&a.r==='opinion'&&same(a.s,split(sy.lines))&&d.r==='opinion'&&same(d.s,split(sy.lines))&&b.r==='yes'&&c==='yes'&&f.r==='fav',J([oy,a.r,a.s,b.r,c,d.r,f.r])); }
    /* 一盞現在還不能買來送人（盤點表第 2 節；AA_710 _meta 寫「也開」——等 LAWWW、AA 定）：匯入工具照匯、印提醒，不默默放行 */
    { let out=''; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_gifts.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ out=String(e.stderr||e.message); }
      const G=fresh(), sells=!!GIFT.shopOpt(G,'溫州街・一盞')||Object.keys(MENUS.shops).includes('一盞茶屋');
      check('14. 一盞茶屋現在不能買來送人 → import_gifts.py 印「[提醒] …一盞茶屋 現在不能買來送人，這一格送不到」（哪天 GIFT.SHOPS 加了這間、記的店名是「一盞茶屋」，提醒就沒了）',sells?!/\[提醒\]/.test(out):/\[提醒\] heroine_03\.drink\.opinion\[\d\]\.item「一盞茶屋的茶（任何一樣）」：一盞茶屋 現在不能買來送人/.test(out),out.trim().split('\n').pop().slice(0,160)); }
    /* 匯入工具的把關 */
    const P14="import sys,json,subprocess;sys.path.insert(0,'tools/story');import import_gifts as M;d=json.loads(subprocess.check_output(['git','show','335301d353:'+M.PATH]).decode());m2=json.loads(subprocess.check_output(['git','show','bb3bdad7df:'+M.PATH2]).decode())['_meta'];I=M.game_items();";
    const e0=py2(P14+"M.build(d,'x',I,m2,M.shop_menus(),[])");
    const e1=py2(P14+"d['heroine_01']['drink']['opinion'][-1]['item']='檸檬綠';d['kexin']['drink']['opinion'][-1]['item']='火龍果冰沙';M.build(d,'x',I,m2,M.shop_menus(),[])");
    const e2=py2(P14+"[o for o in d['heroine_03']['drink']['opinion'] if '任何一樣' in o['item']][0]['item']='兩盞茶屋的茶（任何一樣）';M.build(d,'x',I,m2,M.shop_menus(),[])");
    const e3=py2(P14+"M.MENUS_JS='tools/story/no_such_file.js';M.build(d,'x',I,m2,M.shop_menus(),[])");
    const e4=py2(P14+"d['heroine_01']['breakfast'].setdefault('opinion',[]).append({'item':'檸檬綠茶','lines':['x']});M.build(d,'x',I,m2,M.shop_menus(),[])");
    const e5=py2(P14+"M.build(d,'x',I,m2)");
    const e6=py2(P14+"p=[];d['heroine_03']['drink']['opinion'].append({'item':'果茶社的茶（任何一樣）','lines':['x']});r,_=M.build(d,'x',I,m2,M.shop_menus(),p);o=r['people']['heroine_03']['drink']['opinion'][-1];assert o.get('shopAny')=='果茶社' and 'n' not in o and len(p)==1,(o,p)");
    check('14. 匯入工具：原稿（附各店菜單）通過；兩個品名對不到 → 兩個都列出來再停（交給 AA）；沒有那間店 → 停；菜單讀不到 → 停（不放行）；各店的飲料寫在早餐 → 停；不給菜單（舊的呼叫法）＝照舊只認 S.ITEMS、停下來；可以買來送人的店（果茶社）的整間店寫法＝shopAny、沒有提醒',
      e0==='ran'&&/有 2 個品名對不到/.test(e1)&&/「檸檬綠」/.test(e1)&&/「火龍果冰沙」/.test(e1)&&/沒有「兩盞茶屋」這間可以買來送人的店/.test(e2)&&/跑不起來/.test(e3)&&/不能寫在 breakfast/.test(e4)&&/遊戲沒有這個品項/.test(e5)&&e6==='ran',[e0,e1,e2,e3,e4,e5,e6].map(s=>s.trim().split('\n').pop().slice(0,90)).join(' | ')); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
