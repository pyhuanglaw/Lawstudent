// AA_406 家族的聖誕交換禮物：直屬送直屬（企劃線 2408bcf09；任務 SIS-XMAS-GIFT-L-1023）——不需要瀏覽器。
//   0  逐字對稿、新檔載得到
//   1  12/14 21:00 家族群組四則、排 12/28 18:30 出遊；不在家族群組沒有
//   2  禮物五選一（手機；扣錢；手寫券要演過熱水那一場）；五樣各自的反應、關係；沒準備；她送的鉛筆兩版；交往中、前任
//   3  手寫券 2027-01-10 私訊；大三聖誕夜多一句；房間物件
// 修改前（開發分支 6682f6a2b）：沒有 src/family_xmas3d.js（全部 FAIL）。用法：node tests/aa406_family_xmas_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js']) L3(f);
const ok=L3('src/family_xmas3d.js');
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const X=()=>typeof FAMXMAS!=='undefined'?FAMXMAS:null;
const fresh=(key,h,lv,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,met_sis:true},flags||{})); (H[lv||'FRIEND'])(ID); G.outings=[]; G.acts={att:{}}; G.money=5000; PHONE.join(G,'family_law','法律系直屬家族'); H.at(key,h); return G; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:family_law').map(m=>m.text);
const setup=(gift,flags,lv)=>{ fresh('2026-12-14',20,lv,flags); H.at('2026-12-14',21.1); ph(); if(gift!=null){ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y2_gift'); const k=m.ask.opts.findIndex(o=>o.set.SIS_FAMXMAS_BUY===gift); PHONE.answer(H.G,'famx_y2_gift',k); ph(); } H.at('2026-12-28',18.4); ph(); };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 2408bcf09:"docs/story_planning/AA_406_家族的聖誕交換禮物_直屬送直屬.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 sis_b10_3d.js 後面',ok&&!!X()&&/sis_b10_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/family_xmas3d\.js\?v=[^"]+"><\/script>/.test(html));
  const q=[...J(X().EVENT).matchAll(/"text":"([^"]+)"/g)].map(m=>m[1]).concat(['家族聖誕交換禮物！期末考完那天，12/28 晚上六點半，公館那家火鍋。','聖誕節晚三天過沒差啦，考試比較重要。','家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。','我用了。昨天。'],X().GIFTS.map(g=>g.t));
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!['公館・火鍋店'].includes(t));
  check('0. 每一句台詞、禮物名都在稿裡（一字不差）',!!doc&&!notIn.length,J(notIn)); });
/* ---- 1 ---- */
await sec(1,()=>{ fresh('2026-12-14',20); H.at('2026-12-14',21); ph(); const q=OUT.get(H.G,'famx_y2');
  check('1. 12/14 21:00 家族群組：Kevin 三則＋溫學姊「收到。」；排 12/28（一）18:30「家族聖誕：公館的火鍋店」',J(grp())===J(['家族聖誕交換禮物！期末考完那天，12/28 晚上六點半，公館那家火鍋。','聖誕節晚三天過沒差啦，考試比較重要。','家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。','收到。'])&&!!q&&keyOf(q.day)==='2026-12-28'&&q.h===18.5&&q.title==='家族聖誕：公館的火鍋店',J({g:grp(),q}));
  const G=H.fresh('2026-12-14',21,'dorm',{EXCHANGE_ROUTE:'TW',met_sis:true}); H.FRIEND(ID); G.outings=[]; ph(); check('1. 不在家族群組：沒有',!grp().length&&!OUT.get(G,'famx_y2')); });
/* ---- 2 ---- */
await sec(2,async()=>{ fresh('2026-12-14',21.1); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y2_gift');
  check('2. 手機「買給學姊的聖誕禮物」：四樣（沒演過熱水那一場沒有手寫券），寫哪裡買、多少錢',!!m&&m.th==='sys'&&m.ask.opts.length===4&&m.ask.opts[0].t==='一盒鉛筆（2B）（舊路書房，60 元）',J(m&&m.ask.opts.map(o=>o.t)));
  fresh('2026-12-14',21.1,'FRIEND'); H.G.events.done.ev_sis_hot_water=1; ph(); const m2=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y2_gift'); check('2. 演過熱水那一場：多「手寫的「今天先不改了」券（不用錢）」',m2.ask.opts.length===5&&m2.ask.opts.some(o=>o.t==='手寫的「今天先不改了」券（不用錢）'));
  const W={pencil:['……鉛筆。','我說過用鉛筆，你記得。這盒夠我用到畢業。'],notebook:['我有很多本了。……這本我留著，不排東西。'],lemon:['考完了才喝得到。……很好，我現在終於有時間喝。'],coupon:['……這是什麼。','好。我收下。不保證會用。']};
  for(const k of Object.keys(W)){ setup(k,k==='coupon'?{}:{}); if(k==='coupon'){ fresh('2026-12-14',21.1); H.G.events.done.ev_sis_hot_water=1; ph(); const mm=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y2_gift'); PHONE.answer(H.G,'famx_y2_gift',mm.ask.opts.findIndex(o=>o.set.SIS_FAMXMAS_BUY==='coupon')); ph(); H.at('2026-12-28',18.4); ph(); }
    const money0=H.G.money, r0=Object.assign({},SOCIAL.rel(ID)); await goOut('famx_y2',[0]); const r1=SOCIAL.rel(ID);
    check('2. 送「'+k+'」：「'+W[k].join('」「')+'」；合適＝她的戀愛 +2、熟悉 +2；SIS_FAMXMAS_Y2 '+k,seq(['（長桌，六個人，一鍋。Kevin 坐在中間，負責下肉。）','好，交換！直屬送直屬，學弟先！'].concat(W[k],['（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）','鉛筆。寫錯可以擦。','刻壞了兩支。這是第三支。','好！大家都送完了，吃！','明年也是直屬送直屬。……你記得。']))&&r1.npcRom-r0.npcRom===2&&r1.fam-r0.fam===2&&H.G.flags.SIS_FAMXMAS_Y2===k&&SOCIAL.has(ID,'SIS_XMAS_PENCIL'),J({s:H.said.map(x=>x.t),d:[r1.npcRom-r0.npcRom,r1.fam-r0.fam]})); }
  setup('pencil'); check('2. 買了就扣錢（鉛筆 60）',H.G.money===5000-60,H.G.money);
  setup('flowers'); const r0=Object.assign({},SOCIAL.rel(ID)); await goOut('famx_y2',[1]); const r1=SOCIAL.rel(ID);
  check('2. 朋友送花：「……謝謝。」Kevin「齁——」；普通＝只加信任 +1；「謝謝學姊。」→「嗯。」（耳朵有一點紅）',has('……謝謝。')&&has('齁——')&&r1.trust-r0.trust===1&&r1.npcRom===r0.npcRom&&has('嗯。')&&has('（她低頭吃了一口菜。耳朵有一點紅。）')&&H.opts.some(o=>o.includes('「謝謝學姊。」')),J(H.said.map(x=>x.t)));
  fresh('2026-12-14',21.1); H.date(ID); ph(); { const mm=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y2_gift'); PHONE.answer(H.G,'famx_y2_gift',mm.ask.opts.findIndex(o=>o.set.SIS_FAMXMAS_BUY==='flowers')); ph(); H.at('2026-12-28',18.4); ph(); }
  await goOut('famx_y2',[1]); check('2. 交往中送花：「我第一次收到不是畢業典禮的花。」；選項是「謝謝。」',has('我第一次收到不是畢業典禮的花。')&&H.opts.some(o=>o.includes('「謝謝。」'))&&!H.opts.some(o=>o.includes('「謝謝學姊。」')),J(H.opts));
  setup(null); await goOut('famx_y2',[0]); check('2. 沒準備：「（你兩手空空。…）」「學弟——」「沒關係。剛考完，忘記很正常。」「……下次補。」；none',seq(['（你兩手空空。桌上的人都看著你。）','學弟——','沒關係。剛考完，忘記很正常。','……下次補。'])&&H.G.flags.SIS_FAMXMAS_Y2==='none');
  setup('notebook'); H.G.events.done.ev_grad_reading=1; await goOut('famx_y2',[0]); check('2. 演過 ev_grad_reading：「用鉛筆寫你不同意的地方。我說過。」',has('用鉛筆寫你不同意的地方。我說過。')&&!has('鉛筆。寫錯可以擦。'));
  setup('lemon'); H.G.flags.EX_heroine_05=true; await goOut('famx_y2',[0]);
  check('2. 前任：反應一律「……謝謝。」；「（牛皮紙裡是一支鉛筆。）」；沒有「名字是妳刻的？」；最後「……回去小心。」',has('……謝謝。')&&!has('考完了才喝得到。……很好，我現在終於有時間喝。')&&has('（牛皮紙裡是一支鉛筆。）')&&!H.opts.some(o=>o.includes('名字是妳刻的'))&&has('……回去小心。')&&!has('明年也是直屬送直屬。……你記得。'),J({s:H.said.map(x=>x.t),o:H.opts})); });
/* ---- 3 ---- */
await sec(3,async()=>{ fresh('2026-12-14',21.1); H.G.events.done.ev_sis_hot_water=1; ph(); { const mm=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y2_gift'); PHONE.answer(H.G,'famx_y2_gift',mm.ask.opts.findIndex(o=>o.set.SIS_FAMXMAS_BUY==='coupon')); ph(); H.at('2026-12-28',18.4); ph(); }
  await goOut('famx_y2',[0]); H.at('2027-01-10',21.1); ph(); check('3. 手寫券：2027-01-10 21:00 她私訊「我用了。昨天。」',(H.G.msgs||[]).some(m=>m.th==='p:'+ID&&m.text==='我用了。昨天。'));
  const Lr=[]; for(const f of STORY.ROOM_EXTRA) f(H.G,Lr); check('3. 房間多一件「學姊送的鉛筆（刻了你的名字）」',Lr.some(r=>r[0]==='學姊送的鉛筆（刻了你的名字）'),J(Lr));
  setup('pencil'); await goOut('famx_y2',[0]); H.at('2027-01-10',21.1); ph(); check('3. 不是手寫券：沒有那則',!(H.G.msgs||[]).some(m=>m.text==='我用了。昨天。'));
  const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_xmas_y3'); const i=ev.dialogue.findIndex(n=>n.text==='隔壁的學妹放的。她回家了，叫我幫她顧。');
  check('3. 大三聖誕夜：送過禮物的（不是 none）第一句後面多「去年的禮物，我還在用。」',ev.dialogue[i+1]&&ev.dialogue[i+1].text==='去年的禮物，我還在用。'&&ev.dialogue[i+1].if.custom({flags:{SIS_FAMXMAS_Y2:'pencil'}})&&!ev.dialogue[i+1].if.custom({flags:{SIS_FAMXMAS_Y2:'none'}})&&!ev.dialogue[i+1].if.custom({flags:{SIS_XMAS_Y2:'there'}})); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
