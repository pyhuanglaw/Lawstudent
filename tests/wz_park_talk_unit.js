// 溫州街小公園的互動（AA_171 定稿；src/wzpark3d.js 的 PARK）——不需要瀏覽器。
// 檢查：坐在樹下四季×四時段 16 句、同一天第二次不重複、花 20 分鐘；公布欄（里民活動每月、二手市集日期照日曆、走失的貓只在大三上第 9 週、課輔班大三起、家教廣告兩種＋SAW_TUTOR_AD）；
//       象棋 08:00～11:00、前四盤「輸輸和贏」、大四起叫「律師」；鞦韆 20:00 以後、三句輪流；土地公一天一次（平常、考試週、大四下）；直飲台三種情境、一天第二次不說話；
//       貓：第一次取名三選一、之後旁白用那個名字、摸一天一次、沒有罐頭就沒有「餵」、便利商店買得到小罐罐頭、四年的句子、大三上第 9 週沒有貓；明軒家教事件的那句旁白；都不扣時段次數。
// 修改前：沒有 PARK（第 1 項就失敗）。用法：node tests/wz_park_talk_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''};
for(const f of ['src/data/calendar.js','src/wzpark3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|PARK)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 有 PARK.interact、notices、season、period',typeof PARK!=='undefined'&&['interact','notices','season','period','catLost'].every(k=>typeof PARK[k]==='function'));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const termDay=(id,wk,wd)=>{ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===wk&&CALENDAR.dateOf(d).wd%7===wd) return d; } return null; };
const mk=(day,hour,o)=>Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,flags:{},daily:{},zone:'wenzhou'},o||{});
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[],toasts:[],adv:0}; return {G,L,E:{player:{obj:{position:{x:0,z:0}}}},sceneBegin(){},sceneEnd(){},sleep:async()=>{},walkTo:async()=>true,sitAt(){},standUp(){},seatApproach:s=>[s.x,s.z],
  advance(h){ L.adv+=h; G.hour+=h; },toast(t){ L.toasts.push(t); },say:async(w,t)=>{ L.says.push((w?(w.name||w)+'：':'')+t); },choose:async o=>{ L.menus.push(o.map(x=>x.t+(x.dim?'〔灰〕':''))); const a=q.shift(); return a==null?o.length-1:(typeof a==='string'?o.findIndex(x=>x.t.includes(a)):a); } }; };
const TREE={park:'tree',seat:{x:26,z:19.65,yaw:Math.PI}};
(async()=>{
  // 坐在樹下
  { const cases=[['2025-10-04',9,'autumn',0],['2025-12-13',15,'winter',1],['2026-04-04',19,'spring',2],['2026-07-04',23.5,'summer',3]]; let ok=true, info=[];
    for(const [d,h,se,sl] of cases){ const G=mk(dayOf(d),h); const gm=mkGM(G); await PARK.interact(gm,TREE); const want=PARK.LINES.TREE[se][sl].replace(/\{cat\}/g,'那隻貓'); if(gm.L.says[0]!==want) ok=false; info.push(se+sl+':'+gm.L.says[0]); if(Math.abs(gm.L.adv-1/3)>1e-6) ok=false; }
    check('2. 坐在樹下：秋早上、冬下午、春晚上、夏深夜各對到那一句（還沒取名＝「那隻貓」）、花 20 分鐘',ok,info.join(' / '));
    const G=mk(dayOf('2025-10-04'),9); const a=mkGM(G); await PARK.interact(a,TREE); G.hour=9.5; const b=mkGM(G); await PARK.interact(b,TREE);
    check('2. 同一天第二次：換同一季的另一句，不重複',a.L.says[0]!==b.L.says[0]&&PARK.LINES.TREE.autumn.includes(b.L.says[0])&&b.L.says[0]!==PARK.LINES.TREE.autumn[3],b.L.says[0]);
    check('2. 16 句都有字',Object.values(PARK.LINES.TREE).every(L=>L.length===4&&L.every(t=>t.length>4))); }
  // 公布欄
  { const G=mk(dayOf('2025-10-04'),10); const n=PARK.notices(G).map(q=>q[0]+'：'+q[1]);
    check('3. 10 月：里民活動是「社區清掃日」；二手市集「這個月是 10/4」；家教廣告（還沒開始家教）；沒有走失的貓、沒有課輔班',/社區清掃日/.test(n[0])&&/這個月是 10\/4/.test(n[1])&&n.some(t=>/徵國中家教/.test(t))&&!n.some(t=>/走失|課輔班/.test(t)),n.join(' | '));
    const G9=mk(dayOf('2025-09-20'),10); check('3. 9 月：中秋聯歡晚會',/中秋聯歡晚會/.test(PARK.notices(G9)[0][1]));
    const L9=termDay('Y3S1',9,3), L10=termDay('Y3S1',10,3); const n9=PARK.notices(mk(L9,10)).map(q=>q[0]), n10=PARK.notices(mk(L10,10)).map(q=>q[0]);
    check('3. 大三上第 9 週：走失的貓；第 10 週：已找到；大三起有課輔班招生',n9.includes('走失的貓')&&!n9.includes('已找到')&&n10.includes('已找到')&&n9.includes('課輔班招生'),n9.join(',')+' | '+n10.join(','));
    const gm=mkGM(G,['家教廣告']); await PARK.interact(gm,{park:'notice'}); check('3. 看了家教廣告：記 SAW_TUTOR_AD（G.daily.park.sawTutorAd，不是劇情旗標）；明軒那句旁白讀得到',G.daily.park.sawTutorAd===true&&PARK.tutorAdEcho(G)&&!G.flags.SAW_TUTOR_AD);
    const G2=mk(dayOf('2026-03-10'),10,{flags:{JOB_TUTOR:true}}); const gm2=mkGM(G2,['家教廣告']); await PARK.interact(gm2,{park:'notice'});
    check('3. 開始家教以後：「電話號碼全被撕掉了」＋「其中一條，在你的手機裡。」',gm2.L.says.join('|')==='「這張廣告的電話號碼，全被撕掉了。」|其中一條，在你的手機裡。',gm2.L.says.join('|'));
    const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); check('3. 明軒介紹家教的事件：看過廣告的多一句「你想起公園公布欄的那張紙。」',/text:'你想起公園公布欄的那張紙。',if:\{custom:G=>typeof PARK!=='undefined'&&PARK\.tutorAdEcho\(G\)\}/.test(ev)); }
  // 象棋
  { const G=mk(dayOf('2025-10-04'),9); const res=[]; for(let i=0;i<4;i++){ G.hour=9; res.push(await PARK.interact(mkGM(G),{park:'chess'})); }
    check('4. 前四盤：輸、輸、和、贏',res.join()==='lose,lose,draw,win',res.join());
    const G2=mk(dayOf('2025-10-04'),14); const gm=mkGM(G2); const r=await PARK.interact(gm,{park:'chess'}); check('4. 14:00：沒有人下棋（08:00～11:00）',r==='closed'&&gm.L.toasts.length===1);
    const G3=mk(dayOf('2025-10-04'),9); const g3=mkGM(G3); await PARK.interact(g3,{park:'chess'}); check('4. 開局第一句「年輕人，紅的給你。」、輸的那句「年輕人，車不要亂走。」、30 分鐘',g3.L.says[0]==='阿伯：年輕人，紅的給你。'&&g3.L.says[1]==='阿伯：年輕人，車不要亂走。'&&Math.abs(g3.L.adv-0.5)<1e-6,g3.L.says.join('|'));
    const Y4=termDay('Y4S1',5,6); const G4=mk(Y4,9); const out=[]; for(let i=0;i<4;i++){ G4.hour=9; const g=mkGM(G4); await PARK.interact(g,{park:'chess'}); out.push(g.L.says[1]); }
    check('4. 大四起叫「律師」：輸、和、贏三種都是律師版',/^阿伯：律師，車不要亂走。$/.test(out[0])&&out[2]==='阿伯：和。律師最喜歡和解。'&&out[3]==='阿伯：律師，再一盤。',out.join(' / ')); }
  // 鞦韆、土地公、直飲台
  { const G=mk(dayOf('2025-10-04'),19); const gm=mkGM(G); check('5. 鞦韆 19:00 不能盪',await PARK.interact(gm,{park:'swing',seat:{x:31.7,z:24.2,yaw:Math.PI}})==='closed');
    G.hour=20.5; const a=[]; for(let i=0;i<4;i++){ const g=mkGM(G); await PARK.interact(g,{park:'swing',seat:{x:31.7,z:24.2,yaw:Math.PI}}); a.push(g.L.says[0]); }
    check('5. 20:00 以後：三句輪流',a[0]===PARK.LINES.SWING[0]&&a[1]===PARK.LINES.SWING[1]&&a[2]===PARK.LINES.SWING[2]&&a[3]===PARK.LINES.SWING[0]);
    const s1=mkGM(G); await PARK.interact(s1,{park:'shrine'}); const s2=mkGM(G); await PARK.interact(s2,{park:'shrine'});
    check('5. 土地公：平常那句；當天再拜「你已經拜過了。」',s1.L.says[0]===PARK.LINES.SHRINE.normal&&s2.L.says[0]==='你已經拜過了。');
    const Ge=mk(termDay('Y1S1',16,3),10); const s3=mkGM(Ge); await PARK.interact(s3,{park:'shrine'}); const Gl=mk(termDay('Y4S2',5,3),10); const s4=mkGM(Gl); await PARK.interact(s4,{park:'shrine'});
    check('5. 考試週、大四下各自那一句',s3.L.says[0]===PARK.LINES.SHRINE.exam&&s4.L.says[0]===PARK.LINES.SHRINE.last);
    const f1=mkGM(mk(dayOf('2025-10-04'),10)); await PARK.interact(f1,{park:'fountain'}); const Gs=mk(dayOf('2026-07-04'),15); const f2=mkGM(Gs); await PARK.interact(f2,{park:'fountain'}); const f3=mkGM(Gs); await PARK.interact(f3,{park:'fountain'}); const f4=mkGM(mk(dayOf('2025-10-04'),22.5)); await PARK.interact(f4,{park:'fountain'});
    check('5. 直飲台：平常、夏天、22:00 以後；一天第二次不說話、0 分鐘',f1.L.says[0]===PARK.LINES.FOUNTAIN.normal&&f2.L.says[0]===PARK.LINES.FOUNTAIN.summer&&!f3.L.says.length&&f4.L.says[0]===PARK.LINES.FOUNTAIN.night&&f1.L.adv===0); }
  // 貓
  { const G=mk(dayOf('2025-10-04'),15); const g=mkGM(G,['麻糬']); const r=await PARK.interact(g,{park:'cat'});
    check('6. 第一次摸：兩句旁白、三個名字（所長、麻糬、常客）；選「麻糬」那一句',r==='named'&&g.L.menus[0].join()==='「所長。」,「麻糬。」,「常客。」'&&g.L.says[2]==='牠翻了一個身，肚子是白的。確實像麻糬。'&&PARK.catName(G)==='麻糬',JSON.stringify(g.L));
    G.day+=1; const t=mkGM(G); await PARK.interact(t,TREE); check('6. 之後旁白用那個名字（坐在樹下的 {cat}）',!t.L.says[0].includes('那隻貓')||!/\{cat\}/.test(PARK.LINES.TREE[PARK.season(G)][PARK.slot(G)]),t.L.says[0]);
    const g2=mkGM(G,['摸摸']); await PARK.interact(g2,{park:'cat'}); check('6. 沒有罐頭：選單只有「摸摸麻糬」「算了」；大一那句',g2.L.menus[0].join()==='摸摸麻糬,算了'&&g2.L.says[0]==='麻糬跟著你走了一段，走到巷口又回去。',JSON.stringify(g2.L));
    const g3=mkGM(G,['摸摸']); await PARK.interact(g3,{park:'cat'}); check('6. 同一天第二次摸：灰掉「今天摸過了」',g3.L.menus[0][0]==='摸摸麻糬〔灰〕'&&g3.L.toasts[0]==='今天摸過了');
    G.daily.catCans=2; const g4=mkGM(G,['餵']); await PARK.interact(g4,{park:'cat'}); check('6. 有罐頭：「餵麻糬（小罐罐頭）」→ 用掉一罐、大一那句',g4.L.says[0]==='你才打開罐頭，麻糬已經坐好了。'&&G.daily.catCans===1);
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('6. 便利商店：取了名字以後有「小罐貓罐頭 35 元」，買了 catCans +1',/\['小罐貓罐頭',35,0,G=>\{ G\.daily=G\.daily\|\|\{\}; G\.daily\.catCans=\(G\.daily\.catCans\|0\)\+1; \}\]/.test(st)&&/if\(typeof items\[i\]\[3\]==='function'\) items\[i\]\[3\]\(G\)/.test(st));
    const per=[['Y2S1','{cat}胖了。你摸摸看，都是肉。'],['Y2S2','{cat}瘦了一點。……一點點。'],['Y3S2','脖子上的名牌寫著：請不要再餵我，我很胖。——里長'],['Y4S1','{cat}在你的背包上睡著了。你等牠醒。']]; let ok=true;
    for(const [id,line] of per){ const Gx=mk(termDay(id,5,6),15); Gx.daily.park={catName:'所長'}; const gx=mkGM(Gx,['摸摸']); await PARK.interact(gx,{park:'cat'}); if(gx.L.says[0]!==line.replace('{cat}','所長')) ok=false; }
    check('6. 四年的樣子：大二上胖、大二下瘦一點、大三名牌、大四睡在背包上',ok);
    const Gl=mk(termDay('Y3S1',9,3),15); check('6. 大三上第 9 週沒有貓',PARK.catLost(Gl)&&await PARK.interact(mkGM(Gl),{park:'cat'})==='lost'); }
  { const src=fs.readFileSync(path.join(ROOT,'src/wzpark3d.js'),'utf8'); check('7. 都不扣時段次數（PARK 不呼叫 slotUse／slotPlan）',!/slotUse|slotPlan/.test(src)); }
  { const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=st.match(/key:'park',from:16,to:21,lines:(G=>\{.*?\})\}\];/); let f=null; try{ f=m&&eval('(PARK=>'+m[1]+')')(PARK); }catch(e){}
    const Gn=mk(dayOf('2025-10-08'),17), Gc=mk(dayOf('2025-10-08'),17); Gc.daily.park={catName:'常客'}; const Gl=mk(termDay('Y3S1',9,3),17);
    check('8. 公園的路過旁白（AA 定稿）：「老樹下的圓椅上有隻貓在睡覺。有人蹲在旁邊拍照。」；取名後用名字；大三上第 9 週不出現',!!f&&f(Gn)[0]==='老樹下的圓椅上有隻貓在睡覺。有人蹲在旁邊拍照。'&&f(Gc)[0]==='老樹下的圓椅上常客在睡覺。有人蹲在旁邊拍照。'&&f(Gl)===null,m?'':'找不到'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
