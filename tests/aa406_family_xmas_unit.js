// AA_406 家族的聖誕交換禮物：直屬送直屬（大一 2025-12-22；企劃線 895496a7 改版；任務 SIS-XMAS-GIFT-L-1023）——不需要瀏覽器。
//   0  逐字對稿、新檔載得到
//   1  12/15 21:00 家族群組三則、排 12/22 18:30 出遊；不在家族群組沒有
//   2  禮物五選一（手機；扣錢；手寫券要演過熱水那一場）；五樣各自的反應、關係；沒準備；她送的鉛筆
//   3  手寫券 2026-01-18 私訊；房間物件；回聲：大一下 ev_grad_reading「用我給你的那支。」、大二聖誕夜她先拿紙袋；大三聖誕夜沒有「去年的禮物」
// 修改前（大二版 9dcbb19d6）：日子、事件、旗標都不同（全部 FAIL）。用法：node tests/aa406_family_xmas_unit.js
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
const fresh=(key,h,lv,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({met_sis:true},flags||{})); (H[lv||'FAMILIAR'])(ID); G.outings=[]; G.acts={att:{}}; G.money=5000; PHONE.join(G,'family_law','法律系直屬家族'); H.at(key,h); return G; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:family_law').map(m=>m.text);
const pick=k=>{ const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y1_gift'); PHONE.answer(H.G,'famx_y1_gift',m.ask.opts.findIndex(o=>o.set.SIS_FAMXMAS_BUY===k)); ph(); };
const setup=(gift,hot)=>{ fresh('2025-12-15',20); if(hot) H.G.events.done.ev_sis_hot_water=1; H.at('2025-12-15',21.1); ph(); if(gift!=null) pick(gift); H.at('2025-12-22',18.4); ph(); };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 895496a7:"docs/story_planning/AA_406_家族的聖誕交換禮物_直屬送直屬.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 sis_b10_3d.js 後面；沒有大二版（ev_family_xmas_y2）',ok&&!!X()&&/sis_b10_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/family_xmas3d\.js\?v=[^"]+"><\/script>/.test(html)&&!STORY_EVENTS.some(e=>e.id==='ev_family_xmas_y2'));
  const q=[...J(X().EVENT).matchAll(/"text":"([^"]+)"/g)].map(m=>m[1]).concat(['家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。','我用了。昨天。'],X().GIFTS.map(g=>g.t));   /* 12/15 第一句 AA_458 3-3 改成「期末考完，12/22」（稿在企劃線 b01e32018，逐字對在 tests/aa458_y1s1_unit.js）*/
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!['公館・火鍋店','學姊好，我是{name}。','我知道。直屬送直屬，我準備的是你的。'].includes(t));   /* 後兩句：AA_470 5-1（企劃線 5f54b6545）還沒認識她的兩句自我介紹，對字在 tests/aa470_sis_b12_unit.js */
  check('0. 每一句台詞、禮物名都在稿裡（一字不差）',!!doc&&!notIn.length,J(notIn)); });
/* ---- 1 ---- */
await sec(1,()=>{ fresh('2025-12-15',20); H.at('2025-12-15',21); ph(); const q=OUT.get(H.G,'famx_y1');
  check('1. 12/15 21:00 家族群組：Kevin 兩則（第一句照 AA_458 3-3）＋溫學姊「收到。」（沒有「聖誕節晚三天」）；排 12/22（一）18:30「家族聖誕：公館的火鍋店」',J(grp())===J(['家族聖誕交換禮物！期末考完，12/22 晚上六點半，公館那家火鍋。','家族的規矩齁：直屬送直屬。一百五以內，超過的自己吞。','收到。'])&&!!q&&keyOf(q.day)==='2025-12-22'&&CALENDAR.dateOf(q.day).wd===1&&q.h===18.5&&q.title==='家族聖誕：公館的火鍋店',J({g:grp(),q}));
  const G=H.fresh('2025-12-15',21,'dorm',{met_sis:true}); H.FAMILIAR(ID); G.outings=[]; ph(); check('1. 不在家族群組：沒有',!grp().length&&!OUT.get(G,'famx_y1')); });
/* ---- 2 ---- */
await sec(2,async()=>{ fresh('2025-12-15',21.1); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='famx_y1_gift');
  check('2. 手機「買給學姊的聖誕禮物」：沒演過熱水那一場＝四樣（沒有手寫券），寫多少錢',!!m&&m.th==='sys'&&m.ask.opts.length===4&&m.ask.opts[0].t==='一盒鉛筆（2B）（60 元）'&&!m.ask.opts.some(o=>/今天先不改了/.test(o.t)),J(m&&m.ask.opts.map(o=>o.t)));
  const W={pencil:['……鉛筆。','我讀判決都用鉛筆。這盒夠我用到考完。'],notebook:['我有很多本了。……這本我留著，考完再用。'],lemon:['考前喝這個。……你很懂。'],coupon:['……這是什麼。','好。我收下。不保證會用。']};
  for(const k of Object.keys(W)){ setup(k,k==='coupon'); const r0=Object.assign({},SOCIAL.rel(ID)); await goOut('famx_y1',[0]); const r1=SOCIAL.rel(ID);
    check('2. 送「'+k+'」：「'+W[k].join('」「')+'」；合適＝熟悉 +2、她的戀愛 +2；SIS_FAMXMAS_Y1 '+k,seq(['（長桌，六個人，一鍋。Kevin 坐在中間，負責下肉。）','（學姊坐在你對面。她的碗裡只有白飯和青菜。）','她二月要考試，不吃辣，不吃肉丸。不要問。','好，交換！直屬送直屬，學弟先！'].concat(W[k],['（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）','鉛筆。寫錯可以擦。','刻壞了兩支。這是第三支。','好！大家都送完了，吃！','（她九點就先走了。說要回去念書。走到門口，又回頭跟你說了一句。）','鉛筆用完了，再跟我說。']))&&r1.npcRom-r0.npcRom===2&&r1.fam-r0.fam===2&&H.G.flags.SIS_FAMXMAS_Y1===k&&SOCIAL.has(ID,'SIS_XMAS_PENCIL'),J({s:H.said.map(x=>x.t),d:[r1.npcRom-r0.npcRom,r1.fam-r0.fam]})); }
  setup('pencil'); check('2. 買了就扣錢（鉛筆 60）',H.G.money===5000-60,H.G.money);
  setup('flowers'); const r0=Object.assign({},SOCIAL.rel(ID)); await goOut('famx_y1',[1]); const r1=SOCIAL.rel(ID);
  check('2. 送花：「……謝謝。」＋旁白（Kevin「齁——」、花放在腳邊）；普通＝只加信任 +1；「謝謝學姊。」→「嗯。」（她低頭吃了一口青菜。）',has('……謝謝。')&&has('（Kevin：「齁——」她把花放在腳邊，整晚沒有再看它。）')&&r1.trust-r0.trust===1&&r1.npcRom===r0.npcRom&&has('嗯。')&&has('（她低頭吃了一口青菜。）'),J(H.said.map(x=>x.t)));
  setup(null); await goOut('famx_y1',[0]); check('2. 沒準備：「（你兩手空空。…）」「學弟——」「沒關係。剛考完，忘記很正常。」；none；鉛筆照送',seq(['（你兩手空空。桌上的人都看著你。）','學弟——','沒關係。剛考完，忘記很正常。','（牛皮紙裡是一支木頭鉛筆，筆身刻著你的名字。）'])&&!has('……下次補。')&&H.G.flags.SIS_FAMXMAS_Y1==='none'); });
/* ---- 3 ---- */
await sec(3,async()=>{ setup('coupon',true); await goOut('famx_y1',[0]); H.at('2026-01-18',21.1); ph(); check('3. 手寫券：2026-01-18 21:00 她私訊「我用了。昨天。」',(H.G.msgs||[]).some(m=>m.th==='p:'+ID&&m.text==='我用了。昨天。'));
  const Lr=[]; for(const f of STORY.ROOM_EXTRA) f(H.G,Lr); check('3. 房間多一件「學姊送的鉛筆（刻了你的名字）」',Lr.some(r=>r[0]==='學姊送的鉛筆（刻了你的名字）'),J(Lr));
  setup('pencil'); await goOut('famx_y1',[0]); H.at('2026-01-18',21.1); ph(); check('3. 不是手寫券：沒有那則',!(H.G.msgs||[]).some(m=>m.text==='我用了。昨天。'));
  const gr=STORY_EVENTS.find(e=>e.id==='ev_grad_reading'), gi=gr.dialogue.findIndex(n=>n.text==='不要用螢光筆。用鉛筆，寫你不同意的地方。'), gn=gr.dialogue[gi+1];
  check('3. 大一下 ev_grad_reading：有那支鉛筆的（去了那一場，沒準備也算）多「用我給你的那支。」',!!gn&&gn.text==='用我給你的那支。'&&gn.if.custom({flags:{SIS_FAMXMAS_Y1:'none'}})&&gn.if.custom({flags:{SIS_FAMXMAS_Y1:'lemon'}})&&!gn.if.custom({flags:{}})&&!gn.if.custom({flags:{SIS_FAMXMAS_Y1:'missed'}}));
  const play=async(flags)=>{ fresh('2026-12-24',22,'FRIEND',flags); H.date(ID); OUT.plan(H.G,{id:'t_x2',ev:'ev_sis_xmas_y2',day:H.G.day,h:22,place:'x',title:'x',travel:'',travelH:0}); await goOut('t_x2',[1]); return H.said.map(x=>x.t); };
  const a=await play({SIS_FAMXMAS_Y1:'pencil'}), b=await play({SIS_FAMXMAS_Y1:'none'});
  check('3. 大二聖誕夜（AA_386 3-1）送過禮物的：她先拿紙袋「去年是你先送。今年換我先拿出來。」→ 計畫本 → 你的螢光筆',a.indexOf('去年是你先送。今年換我先拿出來。')>=0&&a.indexOf('明年的計畫本。第一頁我寫了。回去再看。')<a.indexOf('（你把準備好的禮物給她。一盒綠色螢光筆。）')&&a.indexOf('去年是你先送。今年換我先拿出來。')<a.indexOf('明年的計畫本。第一頁我寫了。回去再看。'),J(a));
  check('3. none 的照 3-1 原本的順序、沒有那一句',b.indexOf('去年是你先送。今年換我先拿出來。')<0&&b.indexOf('（你把準備好的禮物給她。一盒綠色螢光筆。）')<b.indexOf('明年的計畫本。第一頁我寫了。回去再看。'),J(b));
  check('3. 大三聖誕夜沒有「去年的禮物，我還在用。」',!J(STORY_EVENTS.find(e=>e.id==='ev_sis_xmas_y3')).includes('去年的禮物，我還在用。')); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
