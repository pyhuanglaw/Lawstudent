// 芷若在英國：約好的視訊（每月、每週）、生日和新年的回覆（AA_419；USER_WANTS E07；src/zr_uk3d.js）——不需要瀏覽器。
//   0  src/zr_uk3d.js 載得到、index.html 緊接在 msg3d.js 後面；兩個事件進 STORY_EVENTS；STORY.phoneRules 會叫到（掛在 MSG.ukDaily）
//   1  每月（好朋友、曖昧＝第 5 階以上、兩人都單身）：第一個週日前一天 21:00「明天晚上十點？」→「好。」排 22:00 視訊；接起來＝開頭、話題、收尾三段
//   2  「這次不行。」→「好。下個月。」、那個月不打（排好的拿掉）；沒回＝照樣打
//   3  沒接（22:15 以前沒接、「先不接」）：22:20「沒接。……下個月見。」
//   4  話題照順序、用過的不再用、用完從頭；M6 只在冬令；2028-09 起 M1 換句；開頭、收尾輪流；M4、M8 的選項
//   5  每週（交往中、2028-09 起）：每個週日 22:00、不用前一天約；開頭四句輪流（第 2 句夏令／冬令、第 4 句接 W11）；話題不重複到用完；W12、W13 的條件
//   6  收尾：「早點睡。」連兩次＝ZR_CRACK +1、之後重新算；「再講十分鐘。」重新算
//   7  修補以後（ZR_WEEKLY_FIX）：17:00、開頭第 2 句和收尾換句、不算裂縫
//   8  每週沒接：22:20「沒接。……你在忙吧。」、連兩週「又沒接。……沒關係。」；不算裂縫
//   9  生日（9/28）、新年（1/1）按鈕：她在英國才開、只開這兩個；三種交情的回覆、回覆時間照英國作息；1/1 臺灣 00:00～08:00 當下就回
//   10 條件不成立不發：朋友、有點熟、不在英國、2028-09 那個月（9/2 她出發）、交往中不打每月的、沒交往沒有每週的、前任
//   11 祐廷在美國（美國路線 2028-08～12）：臺灣週日 22:00＝當地週日 10:00
// 修改前（開發分支 873ea4b9f）：沒有 src/zr_uk3d.js、英國的生日新年按鈕不開——FAIL。用法：node tests/aa419_zr_uk_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MSG|MSG_POOL|MSG2_POOL|ZRUK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js']) load(f);
let ok=true, err=''; try{ load('src/zr_uk3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof ZRUK!=='undefined'?ZRUK:null;
const ZR='heroine_02', TH='p:'+ZR, D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* lvl：fam（有點熟）／friend（朋友，第 3 階）／close（第 5 階、兩人都單身）／dating */
const zr=(key,h,lvl,flags)=>{ const G=H.fresh(key,h,'dorm',flags); G.outings=[]; INV.addContact(G,ZR);
  if(lvl==='fam') H.FAMILIAR(ZR); else if(lvl==='friend') H.FRIEND(ZR); else { H.CLOSE(ZR); SOCIAL.rel(ZR).npcRom=35; if(lvl==='dating') H.date(ZR); } return G; };
const setT=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const th=()=>H.msgs(TH);
const q0=id=>OUT.get(H.G,id);
const play=async(q,picks)=>{ H.said=[]; H.picks=(picks||[]).slice(); setT(q.day,q.h-1/6); await OUT.go(GM,q); return H.lines(); };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const zl=t=>'林芷若：'+t;
const nm=()=>SOCIAL.displayName(ZR);

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/zr_uk3d.js 載得到、index.html 緊接在 msg3d.js 後面',ok&&!!X()&&/src\/msg3d\.js\?v=[^"]+"><\/script>\n<script src="src\/zr_uk3d\.js\?v=[^"]+"><\/script>/.test(html),err);
  check('0. 兩個事件（每月、每週）進 STORY_EVENTS、trigger outing、背景 video',!!X()&&['ev_zr_uk_monthly','ev_zr_uk_weekly'].every(id=>{ const e=STORY_EVENTS.find(x=>x.id===id); return e&&e.trigger==='outing'&&e.dialogue[0].bg==='video'&&typeof e.outingMissed==='function'; }));
  check('0. msg3d.js 英國那一段叫 MSG.ukTopics2（只開生日、新年）',typeof MSG.ukTopics2==='function'&&/return out\.concat\(S\.ukTopics2\?S\.ukTopics2\(G,id,o\):\[\]\)/.test(fs.readFileSync(path.join(H.ROOT,'src/msg3d.js'),'utf8'))); });
if(!X()){ H.done(); return; }

/* ======================= 1. 每月 ======================= */
await sec(1,async()=>{ const sat=D('2027-10-02'), sun=D('2027-10-03'); zr('2027-10-02',12,'close'); const nm0=nm();
  check('1. 前提：2027-10 她在英國、第 5 階、兩人都單身＝ukRow close',MSG.inUK(H.G,ZR)&&MSG.ukRow(H.G,ZR)==='close'&&wdOf(sun)===0,MSG.ukRow(H.G,ZR));
  rules(); check('1. 週六 12:00：私訊排在 21:00（還沒到）',!th().length&&PHONE.rec(H.G).q.some(q=>q.tag==='zruk_m_ask_2027-10'&&q.day===sat&&q.h===21),J(PHONE.rec(H.G).q));
  setT(sat,21); rules(); const m=PHONE.byAsk(H.G,'zruk_m_ask_2027-10');
  check('1. 週六 21:00：「明天晚上十點？」選項「好。」「這次不行。」',J(th())===J(['明天晚上十點？'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','這次不行。']),J({t:th(),m}));
  check('1. 還沒回、還沒到週日：不排',!q0('zruk_m_2027-10'));
  PHONE.answer(H.G,'zruk_m_ask_2027-10',0); rules(); const q=q0('zruk_m_2027-10');
  check('1. 回「好。」：排週日 22:00 視訊（接起來／先不接、late 0.25、不用出門）',!!q&&q.day===sun&&q.h===22&&q.late===0.25&&q.place==='視訊'&&q.verb==='接起來'&&q.no==='先不接'&&q.travelH===0&&q.title==='和芷若視訊（英國下午 3:00）',J(q));
  setT(sun,21.8); check('1. 週日 21:48：問「接起來」',OUT.due(H.G)===q);
  const L=await play(q);
  check('1. 接起來：開頭「聽得到嗎？……我這邊網路有點慢。」→ 話題 M1 兩句 → 收尾「好。我要去上課了。……下個月見。」',J(L)===J([zl('聽得到嗎？……我這邊網路有點慢。'),zl('來的第一個禮拜，傘就被風吹壞了。好看的那一把。'),zl('現在用的是超市買的。很醜，可是不會壞。'),zl('好。我要去上課了。……下個月見。')]),J(L));
  check('1. 演完：done、22:00 開始（不早於約好的時間）、背景是視訊那張',q.state==='done'&&H.bgs.some(b=>b&&b.image==='assets/bg/video.webp'),J(H.bgs));
  setT(sun,23); expire(); PHONE.tick(H.G); check('1. 接了：沒有「沒接」那則',!th().includes('沒接。……下個月見。'));
  check('1. 說話框寫她的名字',nm0==='林芷若'); });

/* ======================= 2. 這次不行／沒回 ======================= */
await sec(2,async()=>{ const sat=D('2027-11-06'), sun=D('2027-11-07'); zr('2027-11-06',21,'close'); rules();
  PHONE.answer(H.G,'zruk_m_ask_2027-11',1); rules();
  check('2. 「這次不行。」→ 她「好。下個月。」',J(th())===J(['明天晚上十點？','這次不行。','好。下個月。']),J(th()));
  setT(sun,12); rules(); setT(sun,21.9); rules(); check('2. 那個月不打（週日沒有排）、記 no',!q0('zruk_m_2027-11')&&X().rec(H.G).m.log.some(e=>e.ym==='2027-11'&&e.ans==='no'),J(H.G.outings));
  setT(sun,22.5); expire(); PHONE.tick(H.G); check('2. 不打也沒有「沒接」',!th().includes('沒接。……下個月見。'));
  zr('2027-11-06',21,'close'); rules(); setT(sun,10); rules(); const q=q0('zruk_m_2027-11');
  check('2. 沒回她：週日照樣排 22:00',!!q&&q.state==='planned'&&q.h===22,J(q));
  setT(sun,12); PHONE.answer(H.G,'zruk_m_ask_2027-11',1); rules(); check('2. 週日中午才回「這次不行。」：排好的拿掉',!q0('zruk_m_2027-11'),J(H.G.outings)); });

/* ======================= 3. 沒接 ======================= */
await sec(3,async()=>{ const sun=D('2027-12-05'); zr('2027-12-04',21,'close'); rules(); PHONE.answer(H.G,'zruk_m_ask_2027-12',0); rules();
  const q=q0('zruk_m_2027-12'); setT(sun,22.2); expire(); PHONE.tick(H.G); check('3. 22:12 還能接：還沒 missed',q.state==='planned');
  setT(sun,22.3); expire(); check('3. 22:18（過了 22:15）：missed',q.state==='missed'); PHONE.tick(H.G);
  check('3. 22:20 以前還沒傳',!th().includes('沒接。……下個月見。')); setT(sun,22+20/60); PHONE.tick(H.G);
  check('3. 22:20「沒接。……下個月見。」',th().slice(-1)[0]==='沒接。……下個月見。'&&(H.G.msgs||[]).find(m=>m.text==='沒接。……下個月見。').h===22.33,J(th()));
  zr('2027-12-04',21,'close'); rules(); PHONE.answer(H.G,'zruk_m_ask_2027-12',0); rules(); const q2=q0('zruk_m_2027-12'); setT(sun,21.8);
  H.picks=['先不接']; const r=await OUT.prompt(GM,q2); setT(sun,22.4); PHONE.tick(H.G);
  check('3. 「先不接」：一樣 22:20「沒接。……下個月見。」',r==='no'&&q2.state==='missed'&&th().slice(-1)[0]==='沒接。……下個月見。',J({r,t:th()})); });

/* ======================= 4. 話題順序 ======================= */
await sec(4,async()=>{ zr('2027-09-04',12,'close'); const Z=X();
  const suns=['2027-09-05','2027-10-03','2027-11-07','2027-12-05','2028-01-02','2028-02-06'].map(D);
  const got=suns.map(d=>{ Z.monthLines(H.G,d); return Z.rec(H.G).m.log.slice(-1)[0].topic; });
  check('4. 大三上六次（好朋友從九月起）：M1～M6 照順序（M6 在二月＝冬令）',J(got)===J(['M1','M2','M3','M4','M5','M6']),J(got));
  check('4. 看過 M6 記下來（每週的 W12 冬令那句不再講）',Z.rec(H.G).m.seenM6===true);
  const L7=Z.monthLines(H.G,D('2028-10-01')), L8=Z.monthLines(H.G,D('2028-11-05')), L9=Z.monthLines(H.G,D('2028-12-03'));
  check('4. 接著 M7、M8；用完從頭：M1，2028-09 起是第二次去英國那一句',J(Z.rec(H.G).m.log.slice(-3).map(e=>e.topic))===J(['M7','M8','M1'])&&L9.some(l=>l.text==='這個城市的風比倫敦還大。我這次先買了醜的傘。')&&!L9.some(l=>/來的第一個禮拜/.test(l.text||'')),J(L9));
  check('4. 開頭三句輪流（第 1、4、7 次同一句）、收尾三句輪流',L7[0].text==='聽得到嗎？……我這邊網路有點慢。'&&L8[0].text==='你那邊很晚了吧。我這邊剛吃完午餐。'&&L9[0].text==='我換了一個房間打給你。原本那間有人在練琴。'
    &&L7.slice(-1)[0].text==='好。我要去上課了。……下個月見。'&&L8.slice(-1)[0].text==='你那邊快十一點了。去睡覺。'&&L9.slice(-1)[0].text==='下個月同一個時間。我會記得。',J([L7[0],L8[0],L9[0]]));
  zr('2027-09-04',12,'close'); const R=Z.rec(H.G).m; R.used=['M1','M2','M3','M4','M5'];
  Z.monthLines(H.G,D('2027-10-03')); check('4. 夏令（2027-10-03）輪到 M6：跳過、先講 M7（M6 留著）',R.log.slice(-1)[0].topic==='M7'&&!R.used.includes('M6'),J(R));
  Z.monthLines(H.G,D('2027-11-07')); check('4. 冬令（2027-11-07）：M6「這裡下午四點天就黑了。」',R.log.slice(-1)[0].topic==='M6');
  zr('2027-09-04',12,'close'); const seen=[]; for(const k of ['2027-11-07','2027-12-05','2028-01-02','2028-02-06','2027-11-14','2027-11-21','2027-11-28','2027-12-12','2027-12-19']){ Z.monthLines(H.G,D(k)); seen.push(Z.rec(H.G).m.log.slice(-1)[0].topic); }
  check('4. 冬令連續九次：前八次不重複（八個都用完）、第九次從頭 M1',new Set(seen.slice(0,8)).size===8&&seen[8]==='M1',J(seen));
  zr('2027-09-04',12,'close'); Z.rec(H.G).m.used=['M1','M2','M3']; H.said=[]; H.picks=['還沒']; await EVENTS.runLines(Z.monthLines(H.G,D('2027-10-03')),{id:'t',participants:[ZR]});
  check('4. M4：「收到了。」「還沒。」；選「還沒。」→「郵局說要兩個禮拜。……我寄太早了。」',J(H.opts[0])===J(['「收到了。」','「還沒。」'])&&H.has('郵局說要兩個禮拜。……我寄太早了。')&&!H.has('好。下一張是下雨的。這裡每一張都可以是下雨的。'),J(H.lines()));
  zr('2027-09-04',12,'close'); Z.rec(H.G).m.used=['M1','M2','M3','M4','M5','M6','M7']; H.said=[]; H.opts=[]; H.picks=['我現在就去']; await EVENTS.runLines(Z.monthLines(H.G,D('2027-10-03')),{id:'t',participants:[ZR]});
  check('4. M8：「好。」→「要拍到滷蛋。」／「我現在就去。」→「現在十點了。……明天啦。」',J(H.opts[0])===J(['「好。」','「我現在就去。」'])&&H.has('我好想吃阿鳳的乾麵。這裡的麵都是軟的。')&&H.has('你替我吃一碗。拍給我看。')&&H.has('現在十點了。……明天啦。')&&!H.has('要拍到滷蛋。'),J(H.lines())); });

/* ======================= 5. 每週 ======================= */
await sec(5,async()=>{ const s1=D('2028-10-01'); zr('2028-09-30',12,'dating');
  check('5. 前提：2028-10 交往中、她在英國＝ukRow dating',MSG.ukRow(H.G,ZR)==='dating'&&MSG.inUK(H.G,ZR));
  rules(); check('5. 週六：不用前一天約（沒有「明天晚上十點？」、沒有排；交往中每天那一則照舊）',!th().includes('明天晚上十點？')&&!H.G.outings.length,J(th()));
  setT(s1,9); rules(); const q=q0('zruk_w_2028-10-01');
  check('5. 週日：排 22:00 視訊（英國下午 3:00，夏令）',!!q&&q.day===s1&&q.h===22&&q.late===0.25&&q.title==='和芷若視訊（英國下午 3:00）'&&q.verb==='接起來',J(q));
  const L=await play(q,['早點睡']);
  check('5. 第一次：開頭「聽得到嗎？……好，看到你了。」→ W1 → 收尾「你那邊很晚了吧。」選項',J(L.slice(0,4))===J([zl('聽得到嗎？……好，看到你了。'),zl('上課有個同學每次都坐同一排。他問我臺灣的冬天冷不冷。'),zl('我說很濕。……他聽不懂。'),zl('你那邊很晚了吧。')])&&J(H.opts.slice(-1)[0])===J(['「早點睡。」','「再講十分鐘。」']),J(L));
  check('5. 「早點睡。」→「好。……晚安。」（視訊結束。）',H.has('好。……晚安。')&&H.has('（視訊結束。）')&&!H.has('好。……我泡一杯茶，你看我泡。'));
  setT(s1+1,21); rules(); check('5. 週一：沒有',H.G.outings.filter(x=>/^zruk_w_/.test(x.id)).length===1);
  setT(s1+7,8); rules(); const q2=q0('zruk_w_2028-10-08'); check('5. 下一個週日又排',!!q2&&q2.h===22);
  const L2=await play(q2,['再講十分鐘']);
  check('5. 第二次：開頭第 2 句夏令「你那邊十點了吧。我這邊太陽還很大。」、話題 W2',L2[0]===zl('你那邊十點了吧。我這邊太陽還很大。')&&L2[1]===zl('室友煮了一鍋湯，叫我喝。很鹹。'),J(L2));
  check('5. 「再講十分鐘。」→「好。……我泡一杯茶，你看我泡。」（十分鐘以後，她先說了晚安。）',H.has('好。……我泡一杯茶，你看我泡。')&&H.has('（十分鐘以後，她先說了晚安。）'));
  const Z=X(); zr('2028-09-02',12,'dating'); const seq=[]; for(let i=0;i<15;i++){ const d=D('2028-09-03')+7*i; Z.weekLines(H.G,d,false); seq.push(Z.rec(H.G).w.log.slice(-1)[0].topic); }
  check('5. 從 2028-09-03 起：前 13 週不重複（W13 2029-03 以後才有），第 14 週從頭（新的一輪：輪到第 4 句＝W11，接著 W1）',new Set(seq.slice(0,13)).size===13&&!seq.slice(0,13).includes('W13')&&seq[13]==='W11'&&seq[14]==='W1',J(seq));
  check('5. 第 4 週開頭「今天換你先講。」接 W11；W11 這一輪講過以後第 4 句跳過（第 8、11 週不重複 W11）',seq[3]==='W11'&&seq.slice(0,13).filter(x=>x==='W11').length===1,J(seq));
  zr('2028-09-02',12,'dating'); const W=Z.rec(H.G).w; W.o=3; const L4=Z.weekLines(H.G,D('2028-10-22'),false);
  check('5. 「今天換你先講。」→「你那邊呢？這週有什麼？」選項「讀書。」「想妳。」',L4[0].text==='今天換你先講。'&&L4[1].text==='你那邊呢？這週有什麼？'&&J(L4[2].choice.map(c=>c.text))===J(['「讀書。」','「想妳。」']),J(L4.slice(0,3)));
  zr('2028-09-02',12,'dating'); Z.rec(H.G).w.o=1; const Lw=Z.weekLines(H.G,D('2028-11-05'),false);
  check('5. 冬令（2028-11-05）開頭第 2 句「你那邊十點了吧。我這邊天快黑了。」',Lw[0].text==='你那邊十點了吧。我這邊天快黑了。',J(Lw[0]));
  zr('2028-09-02',12,'dating'); const W2=Z.rec(H.G).w; W2.used=Z.W_ORDER.filter(x=>x!=='W12'&&x!=='W13');
  let Lx=Z.weekLines(H.G,D('2028-11-19'),false); check('5. W12 冬令、沒看過 M6：「這裡四點天就黑了。我還是會在四點想：Café 要開燈了。」',Lx.some(l=>l.text==='這裡四點天就黑了。我還是會在四點想：Café 要開燈了。'),J(Lx));
  zr('2028-09-02',12,'dating'); Z.rec(H.G).m.seenM6=true; Z.rec(H.G).w.used=Z.W_ORDER.filter(x=>x!=='W12'&&x!=='W13'); Lx=Z.weekLines(H.G,D('2028-11-19'),false);
  check('5. 看過 M6、冬令：不講 W12 冬令那句（W12 留到夏令；W13 還沒到＝從頭 W1）',!Lx.some(l=>/四點/.test(l.text||''))&&Z.rec(H.G).w.log.slice(-1)[0].topic==='W1',J(Z.rec(H.G).w.log.slice(-1)));
  zr('2028-09-02',12,'dating'); Z.rec(H.G).m.seenM6=true; Z.rec(H.G).w.used=Z.W_ORDER.filter(x=>x!=='W12'&&x!=='W13'); Lx=Z.weekLines(H.G,D('2029-04-01'),false);
  check('5. 看過 M6、夏令（2029-04-01）：W12 夏令「這裡晚上九點天還是亮的。……我常常忘記吃晚餐。」',Lx.some(l=>l.text==='這裡晚上九點天還是亮的。……我常常忘記吃晚餐。'),J(Lx));
  zr('2028-09-02',12,'dating'); Z.rec(H.G).w.used=Z.W_ORDER.filter(x=>x!=='W13'); Lx=Z.weekLines(H.G,D('2029-03-04'),false);
  check('5. 2029-03 以後有 W13「我在看八月的機票。」',Lx.some(l=>l.text==='我在看八月的機票。')&&Lx.some(l=>l.text==='……還很久。我只是看看。'),J(Lx));
  zr('2028-09-02',12,'dating'); Z.rec(H.G).w.used=['W1','W2','W3','W5','W6','W7','W8','W9','W10','W11','W12','W13','W14']; H.said=[]; H.opts=[]; H.picks=[0,'早點睡']; await EVENTS.runLines(Z.weekLines(H.G,D('2029-03-04'),false),{id:'t',participants:[ZR]});
  check('5. W4 選項「妳回來再看。」→「嗯。我回去，第一個看它。」',J(H.opts[0])===J(['「妳回來再看。」'])&&H.has('嗯。我回去，第一個看它。'),J(H.lines())); });

/* ======================= 6. 裂縫 ======================= */
await sec(6,async()=>{ zr('2028-09-30',12,'dating'); const s=D('2028-10-01'); const cr=()=>+H.G.flags.ZR_CRACK||0;
  const wk=async(i,pick)=>{ setT(s+7*i,9); rules(); const q=q0('zruk_w_'+CALENDAR.dateOf(s+7*i).key); await play(q,[pick,pick]); return cr(); };   /* 第 4 週是 W11（有選項）：第一個選項的字對不到＝選第一個，收尾才是 pick */
  check('6. 前提：交往開始 ZR_CRACK 0',cr()===0);
  const a=await wk(0,'早點睡'), b=await wk(1,'早點睡'), c=await wk(2,'早點睡'), d=await wk(3,'再講十分鐘'), e=await wk(4,'早點睡'), f=await wk(5,'早點睡');
  check('6. 「早點睡。」第一次 0、連兩次 +1（ZR_CRACK_DAY 記那天）',a===0&&b===1&&H.G.flags.ZR_CRACK_DAY!=null,J([a,b]));
  check('6. 之後重新算：第三次還是 1',c===1,J(c));
  check('6. 「再講十分鐘。」重新算：之後一次「早點睡。」不加、再一次才 +1',d===1&&e===1&&f===2,J([d,e,f])); });

/* ======================= 7. 修補以後 17:00 ======================= */
await sec(7,async()=>{ const s=D('2028-11-05'); zr('2028-11-05',9,'dating',{ZR_WEEKLY_FIX:true}); const Z=X(); Z.rec(H.G).w.o=1; rules(); const q=q0('zruk_w_2028-11-05');
  check('7. 修補以後：週日 17:00（英國早上 9:00，冬令）',!!q&&q.h===17&&q.title==='和芷若視訊（英國早上 9:00）'&&q.zr.fix===true,J(q));
  const L=await play(q,[]);
  check('7. 開頭第 2 句換成「早安。……我這邊是早上。你那邊吃晚餐了沒？」',L[0]===zl('早安。……我這邊是早上。你那邊吃晚餐了沒？'),J(L));
  check('7. 收尾「你要去吃晚餐了吧。……去吧。」、不問「你那邊很晚了吧。」、沒有選項',L.slice(-1)[0]===zl('你要去吃晚餐了吧。……去吧。')&&!H.has('你那邊很晚了吧。')&&!H.opts.length,J(L));
  setT(s+7,9); rules(); await play(q0('zruk_w_2028-11-12'),[]); setT(s+14,9); rules(); await play(q0('zruk_w_2028-11-19'),[]);
  check('7. 連三次都不算裂縫',!(+H.G.flags.ZR_CRACK>0));
  setT(s+21,9); rules(); const q4=q0('zruk_w_2028-11-26'); setT(s+21,17.3); expire(); setT(s+21,18); PHONE.tick(H.G);
  check('7. 17:00 版沒接：17:20「沒接。……你在忙吧。」',q4.state==='missed'&&th().slice(-1)[0]==='沒接。……你在忙吧。'&&H.G.msgs.find(m=>m.text==='沒接。……你在忙吧。').h===17.33,J(th()));
  check('7. 修補以後接了幾次（BB_119 八週六次的判斷用）：4 次裡接了 3 次',J(Z.fixAnswered(H.G))===J({n:3,of:4}),J(Z.fixAnswered(H.G))); });

/* ======================= 8. 每週沒接 ======================= */
await sec(8,async()=>{ const s=D('2028-10-01'); zr('2028-10-01',9,'dating'); const miss=i=>{ setT(s+7*i,9); rules(); setT(s+7*i,22.3); expire(); setT(s+7*i,23); PHONE.tick(H.G); return th().slice(-1)[0]; };
  const a=miss(0); check('8. 沒接：22:20「沒接。……你在忙吧。」',a==='沒接。……你在忙吧。'&&H.G.msgs.slice(-1)[0].h===22.33,J(th()));
  const b=miss(1); check('8. 連兩週沒接：「又沒接。……沒關係。」',b==='又沒接。……沒關係。',b);
  const c=miss(2); check('8. 連三週：還是「又沒接。……沒關係。」',c==='又沒接。……沒關係。',c);
  check('8. 不算裂縫',!(+H.G.flags.ZR_CRACK>0));
  setT(s+21,9); rules(); await play(q0('zruk_w_2028-10-22'),['再講十分鐘']); const d=miss(4);
  check('8. 接了一次以後再沒接：重新「沒接。……你在忙吧。」',d==='沒接。……你在忙吧。',d); });

/* ======================= 9. 生日、新年按鈕 ======================= */
await sec(9,()=>{ const tk=()=>MSG.topics(H.G,ZR).map(q=>q.k); const Q=()=>PHONE.rec(H.G).q.slice(-1)[0];
  zr('2027-09-28',20,'friend'); const t=tk();
  check('9. 2027-09-28（她在英國，朋友）：有「生日快樂」，沒有新年、謝謝、還好嗎',t.includes('bday')&&!t.includes('newyear')&&!t.includes('thanks')&&!t.includes('ok'),J(t));
  let r=MSG.send(H.G,ZR,'bday'); let q=Q(); const wed=D('2027-09-29');
  check('9. 朋友：「謝謝。……你怎麼知道。」照英國作息（一週回一兩次：週三 22:00 以後，前面「抱歉，這週比較忙。」）',r.ok&&r.text==='生日快樂'&&q.day===wed&&q.h>=22&&J(q.items.map(i=>i.text))===J(['抱歉，這週比較忙。','謝謝。……你怎麼知道。']),J(q));
  zr('2027-09-28',20,'close'); r=MSG.send(H.G,ZR,'bday'); q=Q();
  check('9. 好朋友、曖昧：當天回「謝謝！今天我給自己放假，一個人去看電影。」（AA_419 第 5 節第 1 點換句）',r.ok&&q.day===H.G.day&&q.h>20&&q.h<21&&J(q.items.map(i=>i.text))===J(['謝謝！今天我給自己放假，一個人去看電影。']),J(q));
  zr('2028-09-28',20,'dating'); check('9. 2028-09-28 交往中：有「生日快樂」',tk().includes('bday'),J(tk())); r=MSG.send(H.G,ZR,'bday'); q=Q();
  check('9. 交往中：「謝謝。……晚上視訊的時候再說一次。」',r.ok&&J(q.items.map(i=>i.text))===J(['謝謝。……晚上視訊的時候再說一次。']),J(q));
  zr('2028-09-28',10,'close'); MSG.send(H.G,ZR,'bday'); q=Q();
  check('9. 她那邊半夜（夏令：臺灣 06:00～15:00）傳的：15:00 以後她起床回，不接「我剛起床。」（AA_419 第 5 節第 1 點）',q.day===H.G.day&&q.h>=15&&q.h<16&&q.items.length===1&&q.items[0].text==='謝謝！今天我給自己放假，一個人去看電影。',J(q));
  zr('2028-01-01',1,'friend'); check('9. 2028-01-01（她在英國）：有「新年快樂」',tk().includes('newyear')&&!tk().includes('bday'),J(tk()));
  r=MSG.send(H.G,ZR,'newyear'); q=Q();
  check('9. 1/1 臺灣 01:00、朋友：當下就回「新年快樂。你們先跨了。」（不等週三週日、不加「抱歉」）',r.ok&&q.day===H.G.day&&q.h>1&&q.h<1.1&&J(q.items.map(i=>i.text))===J(['新年快樂。你們先跨了。']),J(q));
  zr('2028-01-01',7.5,'close'); MSG.send(H.G,ZR,'newyear'); q=Q();
  check('9. 1/1 臺灣 07:30、好朋友：當下就回「你們先跨了。……我這邊還有八個小時。新年快樂。」',q.day===H.G.day&&q.h<7.6&&J(q.items.map(i=>i.text))===J(['你們先跨了。……我這邊還有八個小時。新年快樂。']),J(q));
  zr('2028-01-01',10,'close'); MSG.send(H.G,ZR,'newyear'); q=Q();
  check('9. 1/1 臺灣 10:00（08:00 以後）、好朋友：照英國作息回，不接「我剛起床。」；08:00 以後那兩句「新年快樂！這邊也過了。」「昨天跨年，街上好多人。」（AA_419 第 5 節第 1、2 點）',q.day===H.G.day&&q.h>=16&&J(q.items.map(i=>i.text))===J(['新年快樂！這邊也過了。','昨天跨年，街上好多人。']),J(q));
  zr('2028-01-01',10,'friend'); MSG.send(H.G,ZR,'newyear'); q=Q();
  check('9. 1/1 臺灣 10:00、朋友：照英國作息（週日 22:00 以後）、08:00 以後那一句「新年快樂。」（AA_419 第 5 節第 2 點）',q.day===D('2028-01-02')&&q.h>=22&&q.items[1].text==='新年快樂。',J(q));
  zr('2029-01-01',3,'dating'); MSG.send(H.G,ZR,'newyear'); q=Q();
  check('9. 2029-01-01 交往中、臺灣 03:00：當下就回「我這邊還沒。……等一下視訊再說。」',q.day===H.G.day&&q.h<3.1&&J(q.items.map(i=>i.text))===J(['我這邊還沒。……等一下視訊再說。']),J(q));
  zr('2027-10-20',15,'close'); check('9. 平常日子（2027-10-20）：沒有生日、新年按鈕（照舊只有在幹嘛、分享…）',!tk().includes('bday')&&!tk().includes('newyear')&&tk().includes('chat'),J(tk()));
  zr('2028-01-25',15,'close'); const cny=MSG.lunarNY(H.G); check('9. 農曆年（她在英國）：不開「新年快樂」',cny&&!tk().includes('newyear'),J({cny,t:tk()}));
  zr('2027-09-28',20,'fam'); check('9. 有點熟（她在英國只寄明信片）：沒有按鈕',!tk().length,J(tk()));
  zr('2026-09-28',20,'friend'); const p=MSG.pick2(H.G,ZR,'bday',true);
  check('9. 她不在英國（2026-09-28 在臺北）：照原本的回覆池（不用英國那幾句）',!MSG.inUK(H.G,ZR)&&!!p&&!p.e.zrUk&&!Object.values(X().T2.bday).includes(p.e.msgs[0]),J(p&&p.e.msgs)); });

/* ======================= 10. 條件不成立不發 ======================= */
await sec(10,()=>{ const zt=t=>/^zruk_/.test(String(t||'')), none=()=>!H.G.outings.some(q=>zt(q.id))&&!PHONE.rec(H.G).q.some(q=>zt(q.tag))&&!(H.G.msgs||[]).some(m=>zt(m.tag));   /* 交往中每天那一則（MSG.ukDaily）不算 */
  zr('2027-10-02',12,'friend'); rules(); setT(D('2027-10-03'),20); rules(); check('10. 朋友（第 3 階）：沒有每月的視訊',none(),J(H.G.outings));
  zr('2027-10-02',12,'fam'); rules(); setT(D('2027-10-03'),20); rules(); check('10. 有點熟：沒有',none());
  zr('2027-10-02',12,'close',{dating_kexin:true}); rules(); setT(D('2027-10-03'),20); rules(); check('10. 祐廷和別人交往中（不是兩人都單身）：沒有',none());
  zr('2028-05-06',12,'close'); rules(); setT(D('2028-05-07'),20); rules(); check('10. 她不在英國（2028-05）：沒有',none());
  zr('2028-09-02',12,'close'); rules(); setT(D('2028-09-03'),20); rules(); check('10. 2028-09（9/2 她才出發）：九月不打',none());
  zr('2028-09-30',12,'close'); rules(); check('10. 十月第一個週日是 10/1：前一天 9/30（九月）私訊',PHONE.rec(H.G).q.some(q=>q.tag==='zruk_m_ask_2028-10'&&q.day===D('2028-09-30')&&q.h===21),J(PHONE.rec(H.G).q));
  zr('2027-10-02',12,'dating'); rules(); setT(D('2027-10-03'),20); rules(); check('10. 交往中：不打每月的；2028-09 以前也沒有每週的',none(),J(H.G.outings));
  zr('2028-10-01',9,'close'); rules(); check('10. 沒交往（好朋友）：週日沒有每週的視訊',!H.G.outings.some(q=>/^zruk_w_/.test(q.id)));
  zr('2028-10-01',9,'close',{EX_heroine_02:true}); rules(); check('10. 前任：都沒有',none()); });

/* ======================= 11. 祐廷在美國 ======================= */
await sec(11,()=>{ const s=D('2028-10-01'); zr('2028-10-01',6,'dating',{EXCHANGE_ROUTE:'US'});
  check('11. 前提：美國路線、人在美國（臺灣 −12）',STORY.abroad(H.G)&&STORY.tzOffset(H.G)===-12);
  rules(); const q=q0('zruk_w_2028-10-01'); check('11. 臺灣週日 22:00＝當地週日 10:00',!!q&&q.day===s&&q.h===10,J(q));
  zr('2028-09-30',6,'close',{EXCHANGE_ROUTE:'US'}); rules(); check('11. 每月：臺灣週六 21:00 的私訊＝當地週六 09:00',PHONE.rec(H.G).q.some(x=>x.tag==='zruk_m_ask_2028-10'&&x.day===D('2028-09-30')&&x.h===9),J(PHONE.rec(H.G).q)); });

/* ======================= 12. AA_419 第 5 節（AA-B 18:5x，企劃線 e24de240c）：美國那學期的時間與六句、2028 交往中的生日視訊 ======================= */
await sec(12,async()=>{ zr('2028-11-05',6,'dating',{EXCHANGE_ROUTE:'US'}); const d=D('2028-11-05'); rules(); const q=q0('zruk_w_2028-11-05');
  check('12. 美國那學期（英國冬令）：英國週日 15:00＝印第安納 10:00',!!q&&q.day===d&&q.h===10&&/15:00|下午 3:00/.test(q.title),J(q));
  ZRUK.rec(H.G).w.o=0; ZRUK.rec(H.G).w.used=[]; const L1=ZRUK.weekLines(H.G,d,false), L2=ZRUK.weekLines(H.G,d,false), T2=L2.map(x=>x.text||'').join('|'), C2=JSON.stringify(L2);
  check('12. 每週開頭 2：「你那邊才早上吧。我這邊下午了。」',L2[0].text==='你那邊才早上吧。我這邊下午了。',L2[0].text);
  check('12. 收尾「你那邊才早上吧。……要去上課了？」、選項「要去了。」',T2.includes('你那邊才早上吧。……要去上課了？')&&C2.includes('「要去了。」')&&!C2.includes('「早點睡。」'));
  /* AA_428 第 1 節（企劃線 1b33efe8e，寫回 AA_419 第 4 點的表）：美國那學期的三列 */
  check('12b. 「要去了。」→「好。……去吧。」（視訊結束。）；「再講十分鐘。」→「（十分鐘以後，她先說了再見。）」；沒有「晚安」',T2.includes('好。……去吧。')&&T2.includes('（十分鐘以後，她先說了再見。）')&&!T2.includes('好。……晚安。')&&!T2.includes('她先說了晚安'),T2);
  { const LF=ZRUK.weekLines(H.G,d,true), TF=LF.map(x=>x.text||'').join('|'); check('12b. 修補以後的版本（美國）：收尾「你要去吃午餐了吧。……去吧。」、不問、不出選項',LF[LF.length-1].text==='你要去吃午餐了吧。……去吧。'&&!JSON.stringify(LF).includes('choice')&&!TF.includes('要去上課了'),TF);
    H.G.flags.ZR_WEEKLY_FIX=true; ZRUK.rec(H.G).w.o=0; const pq0=OUT.get(H.G,'zruk_w_2028-11-12'); H.G.day=D('2028-11-12'); H.G.hour=5; rules(); const qf=q0('zruk_w_2028-11-12'); delete H.G.flags.ZR_WEEKLY_FIX;
    check('12b. 修補以後的時間（美國）：英國 17:00＝印第安納 12:00',!pq0&&!!qf&&qf.h===12&&qf.zr.fix===true,J(qf)); }
  zr('2028-11-04',6,'close',{EXCHANGE_ROUTE:'US'}); rules(); const m=(PHONE.rec(H.G).q.find(x=>x.tag==='zruk_m_ask_2028-11')||{items:[]}).items[0];
  check('12. 每月前一天的私訊：「明天你那邊早上十點？」',!!m&&m.text==='明天你那邊早上十點？',JSON.stringify(m));
  ZRUK.rec(H.G).m.o=1; ZRUK.rec(H.G).m.c=1; const ML=ZRUK.monthLines(H.G,D('2028-11-05')); check('12. 每月開頭 2、收尾 2 換成美國那學期的',ML[0].text==='你那邊才早上吧。我這邊剛吃完午餐。'&&ML[ML.length-1].text==='你那邊快中午了。去吃飯。',JSON.stringify([ML[0],ML[ML.length-1]]));
  zr('2028-10-08',9,'dating'); const d2=D('2028-10-08'); ZRUK.rec(H.G).w.o=1; const L3=ZRUK.weekLines(H.G,d2,false); check('12. 人在臺灣：照原本「你那邊十點了吧。……」',/^你那邊十點了吧。/.test(L3[0].text),L3[0].text);
  zr('2028-09-28',12,'dating'); rules(); const b=q0('zruk_bday28'); check('12. 2028-09-28（四）臺灣 21:00：她的生日視訊',!!b&&b.day===D('2028-09-28')&&b.h===21,J(b));
  const lines=await play(b,[1]); const r=SOCIAL.rel(ZR);
  check('12. 「你先說。」「生日快樂。」「……嗯。聽到了。」……「……明年的生日，我要回去過。」',['你先說。','生日快樂。','……嗯。聽到了。','（她把手機靠在一疊書上，鏡頭有點歪。）','今天一個人去看了一部片。這裡的戲院，沒有倒數第三排。','……明年的生日，我要回去過。'].every(t=>H.has(t)),J(lines));
  check('12. 「明年我去找妳。」→「……機票很貴喔。」「好。」；記憶 HOL_BDAY_2028',H.has('……機票很貴喔。')&&H.has('好。')&&SOCIAL.has(ZR,'HOL_BDAY_2028'));
  zr('2028-09-28',12,'close'); rules(); check('12. 沒交往：沒有生日視訊',!q0('zruk_bday28')); });

H.done();
})();
