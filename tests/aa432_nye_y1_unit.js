// AA_432 第 4 節（企劃線 1ced2f8b3，白名單 6f0db4672）：大一跨年（2025-12-31）BB_171 第 3 節的台詞——子晴、芷若、沛珊、明軒、方奕廷的私訊（各兩個回覆）、
//   明軒在管制線的兩句（定稿）、阿凱在頂樓三句；BB_171 @7fca0df50：沒上頂樓的玩家 1/1 中午阿凱一則。不需要瀏覽器。
//   0 讀稿、每一句都在 AA_432／BB_171  1 五則私訊（時間、熟到多少才傳、回覆）  2 阿凱中午那則  3 頂樓的阿凱  4 管制線的明軒
// 修改前（開發分支 6f0db4672）：沒有這五則、沒有阿凱、明軒是「欸！你們也來喔！」那兩句——FAIL。用法：node tests/aa432_nye_y1_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let err=''; try{ load('src/data/bbpack_events.js'); load('src/bbpack3d.js'); }catch(e){ err=String(e); }
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const A432=git('1ced2f8b3','AA_432_回LAWWW_acceptsOpen待決_六個小問題_大一跨年訊息.md'), B171=git('7fca0df50','BB_171_BB人物假期所在地與跨年.md');
const SEC4=A432.slice(A432.indexOf('## 4. 大一跨年'));
const J=JSON.stringify, ev=id=>STORY_EVENTS.find(e=>e.id===id), X=()=>typeof BBPACK!=='undefined'?BBPACK:null;
const ZQ='heroine_04', ZR='heroine_02', PS='classmate_peishan', MX='classmate_mingxuan', FY='npc_fangyt';
const NY=H.D('2026-01-01'), NYE=H.D('2025-12-31');
const setT=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(d,h,flags)=>{ const G=H.fresh('2025-12-31',h,'dorm',flags||{}); setT(d,h); G.outings=[]; return G; };
const rules=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const th=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id);
const tx=id=>th(id).map(m=>m.text);
const askOf=id=>{ const m=th(id).find(x=>x.ask); return m?m.ask:null; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const MSG={
  [ZQ]:{min:'FRIEND',h:0,t:['📷（遊戲畫面：城堡上空放煙火，角落一排隊友的名字）','新年快樂','我們剛好在零點打贏'],o:[['新年快樂。恭喜。',['嗯','下一場要開了 先這樣']],['妳在家打一整晚？',['對啊','外面人那麼多 我又不是瘋了']]]},
  [ZR]:{min:'FAMILIAR',h:4/60,t:['剛下班。','手好痠。今天店裡賣了快兩百杯。','新年快樂。'],o:[['新年快樂。辛苦了。',['謝謝。','明天店休，我要睡到中午。']],['快兩百杯？',['對，大家都在等跨年，就一直點熱可可。','……新年快樂啦。']]]},
  [PS]:{min:'FRIEND',h:0,t:['新年快樂！！','今年第一個問題','你今年最想做的一件事是什麼？'],o:[['把書念好。',['好認真喔','我的還沒想好','想好再跟你說']],['妳呢？',['我先問的欸','……好啦 我還沒想好','想好再跟你說']]]},
  [MX]:{min:'FAMILIAR',h:6/60,t:['📷（從高處拍的人潮，一整片手機的光）','時薪兩倍','可是我從十點到現在都沒去廁所'],o:[['辛苦了。',['再一個小時','下班我要吃一碗很大的麵']],['CP 值還是很高。',['對','廁所不算進去的話']]]},
  [FY]:{min:'FAMILIAR',h:15+10/60,t:['📷（山上的日出，下面是一整片雲）','下山了，有訊號','山上零下三度，水壺結冰','明年要不要一起來'],o:[['好啊。',['那我先跟社長說','名額很少']],['我怕冷。',['會借你外套','……睡袋就沒辦法了']]]} };

(async()=>{
  check('0. 讀稿（企劃線 AA_432 @1ced2f8b3、BB_171 @7fca0df50）',SEC4.indexOf('### 4-6.')>=0&&B171.indexOf('昨天頂樓好吵 我在打團戰')>=0);
  check('0. 檔案載得到',!!X()&&!err,err);
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
    const all=[]; for(const id in MSG){ all.push(...MSG[id].t); for(const [o,r] of MSG[id].o){ all.push('「'+o+'」'); all.push(...r.map(x=>'「'+x+'」')); } }
    const bad=all.filter(t=>SEC4.indexOf(t)<0&&SEC4.indexOf(t.replace(/^「|」$/g,''))<0);
    check('0. 這個測試寫的五則（訊息、回覆選項、她們的回應）都在 AA_432 第 4 節',bad.length===0,bad.join('｜'));
    const roof=['（23:50，阿凱提著一袋鹹酥雞上來。）','所以你們都在這。','鹹酥雞，自己拿。','好，我回去打了。','欸？你們也來喔。','前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。'];
    check('0. 阿凱三句＋旁白、明軒兩句都在 AA_432 第 4 節',roof.every(t=>SEC4.indexOf(t)>=0),roof.filter(t=>SEC4.indexOf(t)<0).join('｜'));
  });

  /* ===== 1 五則私訊 ===== */
  await sec('1',async()=>{
    let G=fresh(NYE,23.9,{}); for(const id in MSG) H.FRIEND(id); rules();
    check('1. 12/31 23:59 以前沒有',Object.keys(MSG).every(id=>!th(id).length));
    setT(NYE,24+7/60); rules();   /* 過了午夜：G.hour 是 24 以上（同一天）*/
    for(const id of [ZQ,ZR,PS,MX]) check('1. '+SOCIAL.displayName(id)+'：'+MSG[id].t.join('／')+'（私訊、照稿一則一則；回覆兩個）',J(tx(id))===J(MSG[id].t)&&!!askOf(id)&&J(askOf(id).opts.map(o=>o.t))===J(MSG[id].o.map(x=>x[0]))&&!th(id).slice(0,-1).some(m=>m.ask),J([tx(id),askOf(id)&&askOf(id).opts.map(o=>o.t)]));
    { fresh(NYE,23.9,{}); for(const id in MSG) H.FRIEND(id); const has=()=>[ZQ,PS,ZR,MX].filter(id=>th(id).length);
      setT(NYE,24+1/60); rules(); const a=has(); setT(NYE,24+5/60); rules(); const b=has(); setT(NYE,24+7/60); rules(); const c=has();
      check('1. 時間：子晴、沛珊 00:00、芷若 00:04、明軒 00:06（BB_171 的 00:0x）',J(a)===J([ZQ,PS])&&J(b)===J([ZQ,PS,ZR])&&J(c)===J([ZQ,PS,ZR,MX]),J([a,b,c])); }
    check('1. 方奕廷 15:10 以前沒有（下山才有訊號）',!th(FY).length);
    setT(NY,15+11/60); rules(); check('1. 方奕廷 1/1 15:10：'+MSG[FY].t.join('／'),J(tx(FY))===J(MSG[FY].t)&&J(askOf(FY).opts.map(o=>o.t))===J(MSG[FY].o.map(x=>x[0])),J(tx(FY)));
    for(const id in MSG) for(const k of [0,1]){ fresh(NYE,24.2,{}); H.FRIEND(id); rules(); if(id===FY){ setT(NY,15.3); rules(); }
      const r=PHONE.answer(H.G,askOf(id).id,k); check('1. '+SOCIAL.displayName(id)+' 回「'+MSG[id].o[k][0]+'」→「'+MSG[id].o[k][1].join('」「')+'」',!!r&&J(tx(id).slice(-1-MSG[id].o[k][1].length))===J([MSG[id].o[k][0]].concat(MSG[id].o[k][1])),J(tx(id).slice(-4))); }
    G=fresh(NYE,24.2,{}); H.FAMILIAR(ZQ); H.FAMILIAR(PS); H.rel(ZR,10,0,0); H.rel(MX,10,0,0); H.rel(FY,10,0,0); rules(); setT(NY,15.3); rules();
    check('1. 熟到多少才傳（BB_171 第 3 節）：子晴、沛珊要朋友以上；芷若、明軒、方奕廷要有點熟以上',Object.keys(MSG).every(id=>!th(id).length),J(Object.keys(MSG).filter(id=>th(id).length)));
    G=fresh(NYE,24.2,{}); H.FAMILIAR(ZR); rules(); check('1. 芷若有點熟＝會傳；傳了＝有聯絡方式',tx(ZR).length===3&&G.contacts&&G.contacts[ZR]!=null);
    G=fresh(NYE,24.2,{}); H.FRIEND(ZQ); rules(); setT(NY+2,1); check('1. 不回也可以：1/2 以後就不能回（沒有後果）',!PHONE.answer(G,askOf(ZQ).id,0));
  });

  /* ===== 2 阿凱 1/1 中午 ===== */
  await sec('2',async()=>{
    let G=fresh(NY,11.9,{}); H.FAMILIAR('kai'); rules(); check('2. 12:00 以前沒有',!tx('kai').length);
    setT(NY,12.1); rules(); check('2. 沒上頂樓：1/1 12:00 阿凱「昨天頂樓好吵 我在打團戰」（BB_171 第 3 節）',J(tx('kai'))===J(['昨天頂樓好吵 我在打團戰']),J(tx('kai')));
    G=fresh(NY,12.1,{NYE_Y1:'roof'}); H.FAMILIAR('kai'); rules(); check('2. 上了頂樓：沒有',!tx('kai').length);
  });

  /* ===== 3 頂樓的阿凱 ===== */
  await sec('3',async()=>{
    const play=async(stage)=>{ fresh(NYE,23.7,{}); for(const id of ['zhe','yu',BH()]) H.FAMILIAR(id); if(stage) H.rel('kai',stage,0,0); H.said=[]; H.opts=[]; H.picks=[0]; await EVENTS.run(ev('ev_nye_roof')); return H.said.map(s=>s.t); };
    const f0=()=>SOCIAL.rel('kai').fam;
    let L=await play(25); const fam=f0();
    const i=L.indexOf('（23:50，阿凱提著一袋鹹酥雞上來。）');
    check('3. 和阿凱有點熟以上、在頂樓：阿哲的熱飲之後「（23:50，阿凱提著一袋鹹酥雞上來。）」「所以你們都在這。」「鹹酥雞，自己拿。」；倒數完（「……我們就說有看到。」）「好，我回去打了。」',
      i>0&&L[i-1]==='樓下販賣機買的。只剩這種。'&&L[i+1]==='所以你們都在這。'&&L[i+2]==='鹹酥雞，自己拿。'&&L[L.indexOf('……我們就說有看到。')+1]==='好，我回去打了。'&&L.indexOf('好，我回去打了。')>L.indexOf('（零點。很遠的地方，煙火亮了。只看得到上半截。）'),J(L));
    check('3. 阿凱也算在場：熟悉 +1',fam===26,String(fam));
    L=await play(10); check('3. 和阿凱不到有點熟：他整晚在房間打電動（頂樓沒有他）',!L.some(t=>/阿凱|所以你們都在這|鹹酥雞|我回去打了/.test(t)),J(L));
  });

  /* ===== 4 管制線的明軒 ===== */
  await sec('4',async()=>{
    fresh(NYE,19,{}); for(const id of ['zhe','yu',BH()]) H.FAMILIAR(id); H.rel(MX,10,0,0); H.said=[]; H.picks=[0,0]; await EVENTS.run(ev('ev_nye_dinner')); const L=H.said.map(s=>s.t);
    check('4. 認識明軒：管制線「欸？你們也來喔。」「前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。」（AA_432 4-4：BB_171 3-1 定稿）；舊的兩句不在',
      L.includes('欸？你們也來喔。')&&L.includes('前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。')&&L.indexOf('前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。')===L.indexOf('欸？你們也來喔。')+1&&!L.some(t=>/欸！你們也來喔！|這邊真的過不去了啦/.test(t)),J(L));
  });
  H.done();
})();
function BH(){ return 'classmate_bohan'; }
