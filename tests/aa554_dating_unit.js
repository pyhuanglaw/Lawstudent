// AA_554 芷若、子晴「和她交往中」的版本（企劃線 AA-B 2026-10-31；任務 AA554-ZRZQ-DATING-1031）——不需要瀏覽器。
// 台詞從企劃線 git show 讀 BB_187、BB_189、AA_554、AA_419 逐字比對（AA_554 第 2 節的五處修正：稿裡要有修正以後的字、原稿要有原字）；條件真的跑（EVENTS.check、手機規則、出遊）。
//   0 載入、index.html、讀稿（每一句都在稿裡）
//   1 大一下和芷若交往：Z3（多兩句、房間的點單紙）、Z4（前一晚 21:00 私訊、隔天 15:00、三個回應）、Z5 兩個人的版本（邀約、早場、「下次我早一點到，買票。」、午場兩個人）、
//     Z6 不觸發→方奕廷的訊息、摘要日三則（熱可可 22:07、拉花、2/14 前後在台中）
//   2 大一下和子晴交往：Q4（13:30 訊息、13:30 起在公館、三個回應、沒去的 17:50 兩則、之後不演不提）、Q5（第三排、拍手兩句「大廳」、貼紙貼手機殼）、Q6、摘要日三則（倒數私訊、cat_v0.3、00:40）
//   3 大二和芷若交往：Z7 電話（12/10 23:50、睡著也醒、三個選項、沒接＝原本三則）、Café 開頭與多一段、22:15 多一句、Z7b、Z8（子晴知道才說「你是男朋友，你先」、五個月）、
//     Z9（兩句、不加點法那句）、錯過最後一班（沒去送機三則／去了送機登機以後）、2027-09～2028-02 每週日 22:00 視訊（不算裂縫、話題和第二次共用）、摘要日三則
//   4 大二和子晴交往：Q7（多一句、三個回應、23:10 三則）、Q8（多兩句、回應、隔天 08:40 三則不演社課那一場）、Q9、摘要日三則
//   5 和別人交往中（和可昕交往、她知道）／單身：照現在的版本，不受影響
// 修改前（開發分支 9434cd4ac）：沒有 src/aa554_3d.js、和她交往中的句子都沒有——FAIL。用法：node tests/aa554_dating_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/data/y2b_events.js','src/y2b3d.js','src/y2r2_3d.js','src/zr_sendoff3d.js']) L3(f);
const okNew=L3('src/aa554_3d.js');
GM.toast=()=>{}; GM.caption=()=>{};
const ZR='heroine_02', ZQ='heroine_04', FY='npc_fangyt', KX='kexin';
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
/* [前置] 認識、聯絡方式（一個月前就有）；dh＝和她交往中（ROM.start）；gf＝和可昕交往、她們知道（ROM.learn）*/
const setup=(day,h,zone,o)=>{ o=o||{}; const G=H.fresh(keyOf(day),h,zone||'dorm',o.flags||{}); G.outings=[]; G.contacts={}; PHONE.rec(G); E.npcs=[];
  for(const id of (o.know||[ZR,ZQ,FY])){ (o.lv==='fam'?H.FAMILIAR:H.CLOSE)(id); G.contacts[id]=day-30; }
  for(const id of [].concat(o.dh||[])) H.date(id);
  if(o.gf){ H.date(KX); for(const id of [].concat(o.gf)) ROM.learn(G,id,KX,'test'); }
  return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); rules(); } };
const thread=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id&&m.from===id);
const txt=id=>thread(id).map(m=>m.text);
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag||(m.tag&&m.tag.indexOf(tag+'_')===0));
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const has=(L,want)=>{ for(let i=0;i+want.length<=L.length;i++) if(want.every((w,k)=>L[i+k]===w)) return true; return false; };   /* 連續出現 */
const rel=id=>{ const r=SOCIAL.rel(id); return {trust:+r.trust||0,aff:+r.aff||0,resp:+r.resp||0,comf:+r.comf||0,fam:+r.fam||0}; };
const dRel=(a,b)=>Object.fromEntries(Object.keys(b).map(k=>[k,+(b[k]-a[k]).toFixed(2)]).filter(([k,v])=>v));
const DP=id=>STORY.DAILY_PHONE.find(x=>x.id===id);
const dpRun=(id,day)=>{ const d=DP(id); if(!d) return null; const t=STORY.dpTerm(Object.assign({},H.G,{day})); return {term:!!(t&&d.term(t)),ok:!!d.ok(H.G,day),h:d.h(H.G),items:d.items(H.G,0).map(x=>x.text),dt:d.items(H.G,0).map(x=>+(x.dt||0).toFixed(3))}; };

/* ---- 讀稿 ---- */
const show=f=>{ try{ return cp.execSync('git show origin/claude/cool-heisenberg-o8kuqx:"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const B7=show('BB_187_大一下交往中_芷若子晴.md'), B9=show('BB_189_大二交往中_芷若子晴.md'), A554=show('AA_554_芷若子晴和她交往中的版本_現行稿確認與時間線修正.md'), A419=show('AA_419_芷若在英國_約好的視訊與按鈕句.md');
const bare=t=>t.replace(/^（|）$/g,'').replace(/^「|」$/g,'');
const inD=(doc,t)=>!!doc&&doc.indexOf(bare(t))>=0;
const allIn=(doc,L)=>L.filter(t=>!inD(doc,t));
/* ---- 稿的台詞（逐字；第 2 節修正過的另外對 AA_554）---- */
const Z3x=['……我答應你那天，本來想寫這個。','寫一寫覺得太丟臉，就改寫座位了。'];
const Z4inv='明天下午我在溫州街。……有一件事，我想當面講。';
const Z4want='我本來想先問你。結果你先問了。', Z4do=['你們法律系都這樣講話嗎？','……交了以後，你要陪我等。'], Z4fam=['……我以為你會叫我去。','也好。我也這樣跟自己說了兩個月。'];
const Z5inv=['明天我沒班。我要去看《進城的那一週》的重映，早場。','……一起去吧。很早喔。'], Z5opt='「下次我早一點到，買票。」', Z5r='好。……我今天其實八點就到了。';
const FYm=['我去 Café。她今天笑了三次。','……你的關係吧。黃金葛記得澆。'];
const COCOA=['今天有人點熱可可加濃縮。不是你。','……害我嚇一跳。'], ART='今天的拉花。……老闆說及格。你說呢。', TC=['我媽問我今天為什麼一直看手機。','我說，在看天氣。'];
const Q4m=['我在公館騎樓。不要問為什麼。','……好啦，你要來就來。'], Q4brave=['……你是我男朋友，你當然這樣講。','她把頭靠在你肩上一秒。','……可是我想聽。我只是怕輸。'],
  Q4late=['來不及了。第一輪結束了。','她把手機蓋在長椅上。','……好爽。好爛。兩個都有。你都看到了。'], Q4drink=['欸不是，你也喝？','嗯。','……你很奇怪。','我喜歡奇怪的。'], Q4miss=['第四罐我自己喝了。','……沒事。真的。'];
const Q6x=['沒有人知道。……除了阿凱。他是工程師，不算。','還有你。你現在知道了。你也不算客人。'], Q6b='你不要突然講這種話。……我會為了你把它做完。不對，為了它。為了它啦。';
const Q5a='……你坐第三排。我剛剛看到了。不要換位子。', Q5b=['你拍超大聲欸。整個大廳都聽到了。','……好啦。我很高興。'];
const CD='你也不能請假喔', CAT='這版有兩隻貓。', BUG=['我修好一個 bug。','你睡了吧。','……那早上再說一次。早安。預約的。'];
const Z7call=['你在幹嘛。','……等妳打來。','我在看著那個送出鍵。……你不用講話。我只是想要有人在。','電話那頭很安靜。只有她店裡冰箱的聲音。','……按了。','十一點五十九分。手在抖。你聽得出來嗎？'];
const Z7c=[['「聽得出來。」','……好丟臉。'],['「明天我去店裡。」','好。早一點來，比較不忙。'],['（不講話，等她）','……謝謝你沒有掛。']];
const Z7cafe=['（看到你，放下手上的杯子）那天晚上，謝謝你沒有掛電話。','如果沒錄取，就永遠不用跟我媽說。……很膽小吧。'], Z7no='……你每次都這樣講。好啦，謝謝。';
const Z7mom='她還問，你是不是也要去。我說不是。……她說，那你要常常打電話。', Z7sem='……如果錄取，明年九月我就不在了。一學期。';
const Z7s=[['「一學期而已。」',['嗯。……一學期而已。','她重複了一次，像是在練習。']],['「我會寫信給妳。」',['真的信？要貼郵票的那種？','對。','……好。那我回明信片。']],['「那這學期我多來店裡。」',['你已經每天來了。','那就每天來兩次。','……老闆會以為你是股東。']]];
const Z7b='……好。五月我應該會很煩，先跟你說。';
const Z8zq=['……她是不是已經跟你說了。','可惡。我以為我是第一個。……好啦，你是男朋友，你先。'], Z8five=['九月我就走了。五個月。','「五個月很快。」','五個月欸。……好啦，你這樣講我比較安心。'];
const Z9=['我不在的時候，你去看一部電影。看完傳一句話給我。','還有，每個星期天晚上十點我打給你。台灣時間。我媽那邊，我改早上打。'], Z9miss=['今天出發了。','櫃台有一張票根，你的，跟老闆拿。','星期天晚上十點。不要忘記。'];
const ZRY2=['今天第三個客人點錯。我記得他上週點什麼。我沒說。'], ZRCAL=['Café 的月曆，五月那一頁折了一個角。','還沒到。我先折起來。'], ZRPACK=['我在列要帶的東西。','外套。我媽說的。','還有你推薦的那三部片。飛機上看。'];
const Q7x='欸不是，你是我男朋友，你會偏心。……算了，你判。', Q7a=['但如果我不想的理由只是因為我爸，那我很蠢。','……你不要說我不蠢。你一定會說。'], Q7b=['男朋友的稱讚要打七折。','打完還是很強。','她沉默，然後很快地說：','好，C 和弦，你按給我看。'],
  Q7c='……今天晚上講給你聽。不是改天。', Q7m=['他說教授是他同學沒錯','可是信是教授自己寫的','……我還是不想去'];
const Q8x=['他剛剛問我，有沒有男朋友。','我說有。他問：「會打電動嗎？」……我說會，很爛。他笑了。'], Q8a=['……可以嗎？','可以。','……欸不是，你好會講話。','（她把頭靠在你肩上一秒，就拿開。）'], Q8m=['我昨天很兇。','……但你不要再說『一定』。','男朋友也不行。'];
const LAB=['實驗室那封信 我回了','說不要','教授說好','就這樣','好簡單喔','……晚上要慶祝。你請。'], LAB2='你說對了。不是我爸。', LEVEL=['今天寫了一個新的關卡。','小孩等的那個人，回家了。','……還沒想好要不要留。'], CATS=['這隻很爛。','……你自己猜。'];

(async()=>{
/* ======================= 0 ======================= */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/aa554_3d.js 載得到（AA554）、index.html 有接（排在 story3d.js、y2b3d.js、zr_uk3d.js、zr_sendoff3d.js 之後）、其他檔載入沒有錯',okNew&&typeof AA554!=='undefined'&&!loadErr.length&&
    ['story3d','y2b3d','zr_uk3d','zr_sendoff3d','y2r2_3d'].every(f=>html.indexOf('src/'+f+'.js')>=0&&html.indexOf('src/'+f+'.js')<html.indexOf('src/aa554_3d.js')),J(loadErr));
  check('0. 讀得到 BB_187、BB_189、AA_554、AA_419（企劃線）',!!B7&&!!B9&&!!A554&&!!A419);
  check('0. AA_554 第 2 節五處修正：稿裡是修正以後的字（片名、「我沒班」、21:00／15:00、「整個大廳」、「五個月」、去／沒去送機），原稿是原字',
    inD(A554,'明天我沒班。我要去看《進城的那一週》的重映，早場。')&&inD(B7,'明天店休。我要去看《東京物語》的重映，早場。')&&/前一晚 21:00 傳；隔天 15:00/.test(A554)&&inD(A554,'你拍超大聲欸。整個大廳都聽到了。')&&inD(B7,'整個B館都聽到了')&&/「五個月」（三處都換）/.test(A554)&&inD(B9,'九月我就走了。四個月。')&&/去了送機的：登機以後傳後兩則/.test(A554));
  const b7=allIn(B7,[].concat(Z3x,[Z4want],Z4do,Z4fam,[Z5inv[1],'下次我早一點到，買票。',Z5r],FYm,[COCOA[0],COCOA[1],ART],TC,Q4m,Q4brave,Q4late,Q4drink,Q4miss,Q6x,[Q6b,Q5a,Q5b[1],CD,CAT],BUG));
  check('0. 大一下的句子都在 BB_187（「明天下午我在溫州街。……」也在）',!b7.length&&inD(B7,Z4inv),J(b7));
  const b9=allIn(B9,[].concat(Z7call,[].concat(...Z7c),Z7cafe,[Z7no,Z7mom,Z7sem],[].concat(...Z7s.map(x=>[x[0]].concat(x[1]))),[Z7b,Z8zq[0],Z8zq[1]],Z9,Z9miss,ZRY2,[ZRCAL[1]],ZRPACK,[Q7x],Q7a,Q7b,[Q7c],Q7m,Q8x,Q8a,Q8m,LAB,[LAB2],LEVEL,CATS));
  check('0. 大二的句子都在 BB_189（「五個月」那三句是 AA_554 改的，原稿「四個月」）',!b9.length&&inD(B9,'四個月很快。')&&inD(B9,'四個月欸。……好啦，你這樣講我比較安心。'),J(b9));
  check('0. AA_419 第 2 節（每週的視訊）、AA_554 第 3 節：2027-09-05～2028-02-06 每週日臺灣 22:00、W13 不用、早點睡不算裂縫、話題共用',/2027-09-05（她到的第一個週日）～2028-02-06（回國前最後一個週日），每週日臺灣 22:00/.test(A554)&&/W13（2029-03 以後的機票）不用/.test(A554)&&/這段不算裂縫/.test(A554)&&/話題順序跟第二次在英國共用/.test(A554)&&/## 2\. 每週的視訊（交往中）/.test(A419));
});
if(typeof AA554==='undefined'){ H.done(); return; }

/* ======================= 1 大一下和芷若交往 ======================= */
await sec('1-Z3',async()=>{ const d=STORY.termDay('Y1S2',3,2);
  setup(d,21.75,'cafe',{dh:ZR}); const L=await play('ev_zhiruo_own_drink');
  check('1. Z3 和她交往中：照原文到「……不要笑。」，之後多兩句（AA_230 Z-14）；記 ZR_Z3_DH',has(L,['……不要笑。'].concat(Z3x))&&H.G.flags.ZR_Z3_DH===true,J(L.slice(-4)));
  const R=STORY.roomItemList(H.G).find(x=>x[0]==='吧檯的點單紙');
  check('1. Z3 和她交往中：宿舍房間多一張「熱可可＋濃縮」的點單紙（STORY.ROOM_EXTRA）',!!R&&/熱可可＋濃縮/.test(R[1])&&inD(B7,'熱可可＋濃縮'),J(R));
  setup(d,21.75,'cafe',{}); const L2=await play('ev_zhiruo_own_drink');
  check('1. Z3 單身：最後一句是「……不要笑。」、沒有那兩句、沒有點單紙',L2[L2.length-1]==='……不要笑。'&&!H.G.flags.ZR_Z3_DH&&!STORY.roomItemList(H.G).some(x=>x[0]==='吧檯的點單紙'),J(L2.slice(-2)));
});
await sec('1-Z4',async()=>{ const fri=STORY.termDay('Y1S2',11,5), sat=fri+1, z4=ev('ev_zhiruo_secret');
  setup(fri,20,'dorm',{dh:ZR,lv:'fam'}); run(20,21.2);
  const m=thread(ZR).filter(x=>x.tag==='aa554_z4_inv');
  check('1. Z4 和她交往中：前一晚（第 11 週週五）21:00 她私訊「'+Z4inv+'」、記 ZR_Z4_INV_DAY',m.length===1&&m[0].text===Z4inv&&m[0].day===fri&&Math.abs(m[0].h-21)<0.01&&H.G.flags.ZR_Z4_INV_DAY===fri,J(m));
  at(sat,14.5); H.G.zone='wenzhou'; const c14=EVENTS.check(z4); at(sat,15); const c15=EVENTS.check(z4);
  check('1. Z4 和她交往中：隔天週六 15:00 起在溫州街（14:30 還不演）',!c14&&c15,J([c14,c15]));
  setup(sat,15.5,'wenzhou',{dh:ZR,lv:'fam'}); const noInv=EVENTS.check(z4);
  setup(sat,14.5,'wenzhou',{lv:'fam'}); const single=EVENTS.check(z4);
  check('1. Z4：和她交往中但還沒收到前一晚那則＝那個週六不演；單身照原本 14:00 起',!noInv&&single,J([noInv,single]));
  const pickRun=async(pick)=>{ setup(fri,20,'dorm',{dh:ZR,lv:'fam'}); run(20,21.2); at(sat,15.5); H.G.zone='wenzhou'; const r0=rel(ZR); const L=await play('ev_zhiruo_secret',[pick]); return {L,d:dRel(r0,rel(ZR))}; };
  let r=await pickRun('妳想去嗎');
  check('1. Z4「妳想去嗎？」：「她沉默很久。」「……想。」「她用手指捲頭髮，捲了三圈。」「'+Z4want+'」；trust+8、aff+3（照原本）',has(r.L,['她沉默很久。','……想。','她用手指捲頭髮，捲了三圈。',Z4want])&&!r.L.includes('好可怕。說出來就變成真的了。')&&r.d.trust===8&&r.d.aff===3,J([r.L.slice(-4),r.d]));
  r=await pickRun('先交件');
  check('1. Z4「先交件再說」：「'+Z4do[0]+'」「她笑了。」「'+Z4do[1]+'」；trust+5、resp+4',has(r.L,[Z4do[0],'她笑了。',Z4do[1]])&&r.d.trust===5&&r.d.resp===4,J([r.L.slice(-3),r.d]));
  r=await pickRun('家裡');
  check('1. Z4「家裡的事比較重要吧。」：不扣分「嗯。」「她點頭。」「'+Z4fam.join('」「')+'」；trust+2',has(r.L,['嗯。','她點頭。'].concat(Z4fam))&&r.d.trust===2&&!Object.values(r.d).some(v=>v<0),J([r.L.slice(-4),r.d]));
});
await sec('1-Z5',async()=>{ const FRI=STORY.termDay('Y1S2',12,5);
  const prep=(o)=>{ setup(FRI,20,'cafe',Object.assign({lv:'fam'},o)); SOCIAL.remember(ZR,'SHARED_SECRET','十點的電話'); H.G.events.done.ev_zhiruo_secret=1; };
  prep({dh:ZR}); const r0=rel(ZR); const L=await play('ev_zhiruo_film_night',['幾點']);
  check('1. Z5 邀約（和她交往中）：「'+Z5inv.join('」「')+'」（AA_554：片名照遊戲、「我沒班」）；「幾點？」＝答應（zhiruo_film_date），沒有方奕廷',L[0]===Z5inv[0]&&L[1]===Z5inv[1]&&!L.some(t=>/方奕廷/.test(t))&&H.G.flags.zhiruo_film_date===true&&dRel(r0,rel(ZR)).aff===6,J([L,dRel(r0,rel(ZR))]));
  run(20,20.2); const q=OUT.get(H.G,'zr_early_show'); check('1. Z5：隔天 09:40 的早場照排（出遊 ev_zhiruo_early_show）',!!q&&q.day===FRI+1);
  setup(FRI+1,10,'dorm',{dh:ZR,lv:'fam'}); H.cgs=[]; const L2=await play('ev_zhiruo_early_show',['早一點到']);
  check('1. Z5 早場（和她交往中）＝兩個人的版本：「九點四十，巷子裡的二輪戲院。她已經到了。」、BCG-21、「誰？」（不是方奕廷）、記 WATCHED_FILM（不是 GROUP）',L2[0]==='九點四十，巷子裡的二輪戲院。她已經到了。'&&H.cgs.includes('cg_two_tickets_heroine02')&&L2.includes('誰？')&&SOCIAL.has(ZR,'WATCHED_FILM')&&!SOCIAL.has(ZR,'WATCHED_FILM_GROUP'),J(L2.slice(0,2)));
  check('1. Z5 早場：「我下次帶我室友來。」拿掉、換成'+Z5opt+'→「'+Z5r+'」',J(H.opts[0])===J(['「下次妳挑。」','「下次我挑。」',Z5opt])&&L2[L2.length-1]===Z5r,J([H.opts[0],L2.slice(-1)]));
  /* 「早場我起不來。」：照原文不扣分，午場照約、兩個人 */
  prep({dh:ZR}); const r1=rel(ZR); const L3x=await play('ev_zhiruo_film_night',['起不來']); const dd=dRel(r1,rel(ZR));
  const ms=H.G.flags.zrDeclineDay+21+1; at(ms,9.6); run(9.6,9.7); const mt=txt(ZR);
  check('1. Z5「早場我起不來。」：不扣分；三週後週六 09:30 午場的私訊沒有「方奕廷也去。」',L3x[L3x.length-1]==='好。那下次有午場再說。'&&!Object.values(dd).some(v=>v<0)&&mt.includes('十一點四十。這個時間，你總起得來了吧。')&&!mt.includes('方奕廷也去。'),J([dd,mt.slice(-3)]));
  setup(ms,13,'dorm',{dh:ZR,lv:'fam'}); const L4=await play('ev_zhiruo_matinee',['下午要做什麼']);
  check('1. 午場（和她交往中）＝兩個人：沒有方奕廷、「你們沿著新生南路慢慢走到溫州街。…」、記 WATCHED_FILM',!L4.some(t=>/被騙/.test(t))&&L4.some(t=>/^你們沿著新生南路/.test(t))&&SOCIAL.has(ZR,'WATCHED_FILM')&&!SOCIAL.has(ZR,'WATCHED_FILM_GROUP'),J(L4.slice(0,3)));
});
await sec('1-Z6',async()=>{ const d=STORY.termDay('Y1S2',13,2);
  setup(d,12.5,'campus',{dh:ZR}); SOCIAL.remember(ZR,'WATCHED_FILM',''); const c=EVENTS.check(ev('ev_fangyt_hint'));
  const r=dpRun('aa554_fy_smile',d);
  check('1. Z6 和她交往中：方奕廷的事件不觸發；改成摘要日方奕廷的一則「'+FYm.join('」「')+'」（大一下第 13～15 週、有他的聯絡方式）',!c&&!!r&&r.term&&r.ok&&J(r.items)===J(FYm),J([c,r]));
  H.G.contacts[FY]=null; const r2=dpRun('aa554_fy_smile',d); setup(d,12.5,'campus',{}); SOCIAL.remember(ZR,'WATCHED_FILM',''); const c2=EVENTS.check(ev('ev_fangyt_hint')); const r3=dpRun('aa554_fy_smile',d);
  check('1. Z6：沒有他的聯絡方式＝沒有那則；單身照原本觸發 Z6、沒有那則',!r2.ok&&c2&&!r3.ok,J([r2.ok,c2,r3.ok]));
});
await sec('1-摘要日',async()=>{ const d=STORY.termDay('Y1S2',5,2);
  setup(d,9,'dorm',{dh:ZR}); SOCIAL.remember(ZR,'ASKED_HER_DRINK','');
  const a=dpRun('zr_cocoa_y1s2',d), b=dpRun('zr_art_y1s2',d);
  check('1. 摘要日（和她交往中、ASKED_HER_DRINK）：22:07「'+COCOA.join('」「')+'」（AA_230 Z-18）',a.ok&&Math.abs(a.h-(22+7/60))<0.01&&J(a.items)===J(COCOA),J(a));
  check('1. 摘要日（和她交往中）：拉花照片「📷（拉花）」＋「'+ART+'」',b.ok&&J(b.items)===J(['📷（拉花）',ART]),J(b));
  setup(d,9,'dorm',{}); SOCIAL.remember(ZR,'ASKED_HER_DRINK',''); const a2=dpRun('zr_cocoa_y1s2',d), b2=dpRun('zr_art_y1s2',d);
  check('1. 摘要日（單身）照原本：「今天有客人點熱可可加濃縮欸」「我還以為只有我會這樣喝」、拉花沒有字',J(a2.items)===J(['今天有客人點熱可可加濃縮欸','我還以為只有我會這樣喝'])&&J(b2.items)===J(['📷（拉花）']),J([a2.items,b2.items]));
  const tc=D('2026-02-15'); setup(tc-20,12,'dorm',{dh:ZR}); at(tc,21); run(21,22.3);
  const m=thread(ZR).filter(x=>x.tag==='aa554_zr_tc');
  check('1. 摘要日（和她交往中、2/14 前後她在台中）：2/15 22:07「'+TC.join('」「')+'」（日子、時間是技術預設，避開 2/14 當天）',J(m.map(x=>x.text))===J(TC)&&m[0].day===tc&&Math.abs(m[0].h-(22+7/60))<0.06,J(m.map(x=>[x.text,x.day,x.h])));
  setup(tc-20,12,'dorm',{}); at(tc,21); run(21,22.3); check('1. 2/15 那則只給和她交往中的',!thread(ZR).some(x=>x.tag==='aa554_zr_tc'));
});

/* ======================= 2 大一下和子晴交往 ======================= */
await sec('2-Q4',async()=>{ const sat=STORY.termDay('Y1S2',8,6), q4=ev('ev_ziqing_contest_day');
  const prep=(o)=>{ setup(sat,12,'dorm',o); SOCIAL.remember(ZQ,'ARGUED_ABOUT_CAREER',''); };
  prep({dh:ZQ}); run(12,13.6);
  const m=thread(ZQ).filter(x=>x.tag==='aa554_q4_msg');
  check('2. Q4 和她交往中：13:30 她先傳「'+Q4m.join('」「')+'」',J(m.map(x=>x.text))===J(Q4m)&&Math.abs(m[0].h-13.5)<0.01,J(m.map(x=>[x.text,x.h])));
  const sx=STORY.schedEnt(CHARACTERS[ZQ],H.G); H.G.zone='gongguan'; at(sat,14); const c14=EVENTS.check(q4);
  check('2. Q4：13:30～15:00 她在公館（作息）、14:00 在公館跟她說話就演',!!sx&&sx.zone==='gongguan'&&c14,J([sx,c14]));
  const pr=async(pick)=>{ prep({dh:ZQ}); run(12,13.6); at(sat,14.2); H.G.zone='gongguan'; return play('ev_ziqing_contest_day',[pick]); };
  let L=await pr('不想去'); check('2. Q4「妳不想去，就不是爛。」（和她交往中）：「'+Q4brave.join('」「')+'」→「……第四罐。你請。」',has(L,Q4brave.map(t=>t==='她把頭靠在你肩上一秒。'?'（她把頭靠在你肩上一秒。）':t).concat(['……第四罐。你請。'])),J(L.slice(-4)));
  L=await pr('來得及'); check('2. Q4「現在去還來得及嗎？」：「'+Q4late.join('」「')+'」',has(L,Q4late.map(t=>t==='她把手機蓋在長椅上。'?'（她把手機蓋在長椅上。）':t)),J(L.slice(-4)));
  L=await pr('第四罐'); check('2. Q4「陪她喝第四罐」：「'+Q4drink.join('」「')+'」（「她第一次沒有吐槽下去」換成「我喜歡奇怪的。」）',has(L,Q4drink)&&!L.includes('（她第一次沒有吐槽下去。）'),J(L.slice(-5)));
  prep({dh:ZQ}); run(12,17.9); const mm=thread(ZQ).filter(x=>x.tag==='aa554_q4_miss'); H.G.zone='gongguan'; at(sat,17.9); const late=EVENTS.check(q4);
  check('2. Q4 沒來：17:50「'+Q4miss.join('」「')+'」；之後不演',J(mm.map(x=>x.text))===J(Q4miss)&&Math.abs(mm[0].h-(17+50/60))<0.06&&!late,J([mm.map(x=>x.text),late]));
  at(STORY.termDay('Y1S2',9,1),12); check('2. Q4 沒來（傳了 17:50 那兩則）：下一次見面她不提（不說「那個比賽，我沒去。」）',!STORY.contestHeardDue(H.G,ZQ));
  prep({}); H.G.zone='gongguan'; at(sat,14); const s14=EVENTS.check(q4); at(sat,15); const s15=EVENTS.check(q4); const L5=await play('ev_ziqing_contest_day',['不想去']);
  check('2. Q4 單身：照原本 15:00 起、沒有私訊、原本的回應',!s14&&s15&&!thread(ZQ).length&&has(L5,['……你這樣講，好像我很勇敢。','（她笑。）','我只是怕輸。']),J([s14,s15,L5.slice(-4)]));
});
await sec('2-Q6',async()=>{ const d=STORY.termDay('Y1S2',11,1);
  setup(d,19.5,'wancai',{dh:ZQ}); SOCIAL.remember(ZQ,'CONTEST_DAY',''); const L=await play('ev_ziqing_secret_game',['比比賽有用']);
  check('2. Q6 和她交往中：第三句換「'+Q6x.join('」「')+'」；第二個選項「'+Q6b+'」',has(L,Q6x)&&!L.includes('還沒給別人玩過。阿凱看過，可是他是工程師，不算。')&&L.includes(Q6b),J(L));
  setup(d,19.5,'wancai',{}); SOCIAL.remember(ZQ,'CONTEST_DAY',''); const L2=await play('ev_ziqing_secret_game',['比比賽有用']);
  check('2. Q6 單身照原本',L2.includes('還沒給別人玩過。阿凱看過，可是他是工程師，不算。')&&L2.includes('……真的？那第二關做好，你再幫我玩。')&&!L2.includes(Q6b));
});
await sec('2-Q5',async()=>{ const d=STORY.termDay('Y1S2',14,3);
  setup(d,19.5,'wancai',{dh:ZQ}); const L=await play('ev_ziqing_show',['拍手']);
  check('2. Q5 和她交往中：後台那句之後多「'+Q5a+'」；拍手：謝幕後、貼紙之前多「'+Q5b.join('」「')+'」（AA_554：B館→大廳）；貼紙直接貼在手機殼上',has(L,['我寫程式從來不抖。',Q5a])&&has(L,Q5b.concat(['（她把一張插座貓貼紙，直接貼在你的手機殼上。）']))&&!L.some(t=>/B館都聽到/.test(t))&&SOCIAL.has(ZQ,'CLAPPED'),J(L));
  setup(d,19.5,'wancai',{gf:ZQ}); const L2=await play('ev_ziqing_show',['拍手']);
  check('2. Q5 和別人交往中：沒有那三句、貼紙遞給你（照舊）',!L2.includes(Q5a)&&!L2.includes(Q5b[0])&&L2.includes('（她遞給你一張插座貓貼紙。）'),J(L2.slice(-3)));
});
await sec('2-摘要日',async()=>{ const dShow=STORY.termDay('Y1S2',14,3), d0=dShow-14;
  setup(d0,20,'dorm',{dh:ZQ}); PHONE.join(H.G,'guitar','吉他社'); run(20,21.2);
  const g=(H.G.msgs||[]).filter(m=>m.tag==='zq_show_cd').map(m=>m.text), p=thread(ZQ).filter(m=>m.tag==='zq_show_cd_dh');
  check('2. 摘要日（和她交往中、吉他社群組）：群組照原文到「都要來」，三分鐘後私訊「'+CD+'」',J(g)===J(['成發','倒數','十四天','不能請假','都要來'])&&p.length===1&&p[0].text===CD&&Math.abs(p[0].h-(21+3/60))<0.01,J([g,p.map(x=>[x.text,x.h])]));
  setup(d0,20,'dorm',{}); PHONE.join(H.G,'guitar','吉他社'); run(20,21.2); check('2. 倒數那則的私訊只給和她交往中的',!thread(ZQ).some(m=>m.tag==='zq_show_cd_dh'));
  const d=STORY.termDay('Y1S2',6,2); setup(d,9,'dorm',{dh:ZQ}); SOCIAL.remember(ZQ,'PLAYTESTED',''); let r=dpRun('zq_cat03_y1s2',d);
  check('2. 摘要日（和她交往中、PLAYTESTED）：「📎 cat_v0.3」三分鐘後「'+CAT+'」',J(r.items)===J(['📎 cat_v0.3',CAT])&&Math.abs(r.dt[1]-0.05)<0.01,J(r));
  H.G.flags.FIRST_BUG=true; r=dpRun('zq_cat03_y1s2',d);
  check('2. 摘要日（和她交往中、FIRST_BUG）：後面接原文那兩則「總圖二樓靠窗那排插座」「遊戲裡也改成壞的了」（BB_96 第 5 節）',J(r.items)===J(['📎 cat_v0.3',CAT,'總圖二樓靠窗那排插座','遊戲裡也改成壞的了']),J(r.items));
  r=dpRun('aa554_zq_bug',d); check('2. 摘要日（和她交往中）：凌晨 00:40「'+BUG.join('」「')+'」',r.term&&r.ok&&Math.abs(r.h-(24+40/60))<0.01&&J(r.items)===J(BUG),J(r));
  setup(d,9,'dorm',{}); SOCIAL.remember(ZQ,'PLAYTESTED',''); r=dpRun('zq_cat03_y1s2',d); const r2=dpRun('aa554_zq_bug',d);
  check('2. 摘要日（單身）：cat_v0.3 照原本、沒有 00:40 那則',J(r.items)===J(['📎 cat_v0.3','這版比較不會當機'])&&!r2.ok,J([r.items,r2.ok]));
});

await part3();
await part4();
await part5();
H.done();
})();

/* ======================= 3 大二和芷若交往 ======================= */
async function part3(){
await sec('3-Z7',async()=>{ const d=D('2026-12-10');
  const prep=(o)=>{ setup(d,20,'dorm',Object.assign({dh:ZR},o)); H.G.events.done.ev_zhiruo_secret=1; SOCIAL.remember(ZR,'SHARED_SECRET',''); };
  prep(); run(20,20.2); const q=OUT.get(H.G,'aa554_z7_call');
  check('3. Z7 和她交往中：12/10 23:50 她打來（出遊：電話、只有「接起來」）',!!q&&q.day===d&&Math.abs(q.h-(23+50/60))<0.01&&q.call===true&&q.must===true&&q.verb==='接起來'&&q.ev==='ev_zhiruo_applied_call',J(q));
  at(d,22); const w=STORY.lawWakeAt?STORY.lawWakeAt(H.G):AA554.wake(H.G);
  check('3. Z7：睡著也會在 23:50 醒來（STORY.WAKE_AT）',Math.abs(w-(23+50/60))<0.01,J(w));
  for(const [k,[opt,rep]] of Z7c.entries()){ prep(); run(20,20.2); const q2=OUT.get(H.G,'aa554_z7_call'); H.said=[]; H.picks=[opt]; at(d,23+50/60-1/6); await OUT.go(GM,q2); const L=said();
    check('3. Z7 電話（'+opt+'）：「'+Z7call.join('」「')+'」→「'+rep+'」；記 ZR_Z7_CALL took',has(L,Z7call.map(t=>t==='電話那頭很安靜。只有她店裡冰箱的聲音。'?'（'+t+'）':t))&&L[L.length-1]===rep&&H.G.flags.ZR_Z7_CALL==='took'&&(k!==2||L.includes('（過了一分鐘。）')),J(L)); }
  at(d+1,1); run(1,1.1); check('3. Z7 接了電話：沒有 23:59 那三則',!byTag('zr_z7_msg').length);
  prep(); run(20,20.2); at(d+1,0.3); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); run(0.3,0.4);
  check('3. Z7 那通沒接到（過了 10 分鐘）：ZR_Z7_CALL missed、照原本補 23:59 那三則（技術預設）',H.G.flags.ZR_Z7_CALL==='missed'&&J(byTag('zr_z7_msg').map(m=>m.text))===J(['交換申請，剛剛按了送出。英國那一間。','截止是十二點。我在十一點五十九分按的。','……手還在抖。下次你來店裡，再跟你說。']),J(byTag('zr_z7_msg').map(m=>m.text)));
  /* Café */
  const cafe=async(picks,o)=>{ prep(o); H.G.flags.ZR_Z7_CALL='took'; at(d+1,15); H.G.zone='cafe'; return play('ev_zhiruo_applied',picks); };
  let L=await cafe(['不會',Z7s[0][0]]);
  check('3. Z7 Café（和她交往中、接了電話）：開頭換「'+Z7cafe.join('」「')+'」（沒有「十一點五十九分」「抖到十二點半」）',L[0]===Z7cafe[0]&&L[1]===Z7cafe[1]&&!L.some(t=>/抖到十二點半/.test(t)),J(L.slice(0,3)));
  check('3. Z7 Café「不會。」：「'+Z7no+'」',L.includes(Z7no)&&!L.includes('……你說的喔。'),J(L));
  for(const [opt,rep] of Z7s){ L=await cafe(['不會',opt]); check('3. Z7 Café 多一段：「'+Z7sem+'」→ '+opt+'：「'+rep.join('」「')+'」→「今天的咖啡我請。」',has(L,[Z7sem])&&has(L,rep.concat(['今天的咖啡我請。']))&&J(H.opts[1])===J(Z7s.map(x=>x[0])),J([L.slice(-5),H.opts[1]])); }
  L=await cafe(['妳跟妳媽說了嗎',Z7s[0][0]]); at(d+1,22.3); run(22.3,22.4);
  check('3. Z7 Café「妳跟妳媽說了嗎？」：原文照用；當晚 22:15 那則多一句「'+Z7mom+'」',L.includes('還沒。今天十點，她會打來。')&&J(byTag('zr_z7_mom').map(m=>m.text))===J(['我說了。她說『那妳要穿暖一點』。',Z7mom]),J(byTag('zr_z7_mom').map(m=>m.text)));
  setup(d,20,'dorm',{}); H.G.events.done.ev_zhiruo_secret=1; SOCIAL.remember(ZR,'SHARED_SECRET',''); run(20,20.2); const noCall=!OUT.get(H.G,'aa554_z7_call'); at(d+1,0.1); run(0.1,0.2);
  at(d+1,15); H.G.zone='cafe'; const L2=await play('ev_zhiruo_applied',['不會']);
  check('3. Z7 單身照原本：沒有電話、23:59 三則、Café 開頭「那天晚上那則，你看到了吧。」、沒有多一段',noCall&&byTag('zr_z7_msg').length===3&&/那天晚上那則/.test(L2[0])&&!L2.includes(Z7sem)&&L2.includes('……你說的喔。'),J([noCall,L2]));
});
await sec('3-Z7b',async()=>{ const nb=D('2027-01-28');
  setup(nb,20,'dorm',{dh:ZR}); H.G.events.done.ev_zhiruo_applied=1; run(20,21.1); const m=PHONE.byAsk(H.G,'zr_z7b');
  const L=thread(ZR).filter(x=>x.tag==='zr_z7b').map(x=>x.text);
  check('3. Z7b 和她交往中：三句照用（「……所以先不哭。五月再說。」也在）',J(L)===J(['學校那一關過了。','還要等英國那邊。他們說五月。','……所以先不哭。五月再說。']),J(L));
  const o=m&&m.ask&&m.ask.opts.find(x=>x.t==='恭喜。五月我陪妳一起等。');
  check('3. Z7b「恭喜。五月我陪妳一起等。」→「'+Z7b+'」；貼圖照原文「……這隻貓的杯子拿反了。」',!!o&&o.say[0].text===Z7b&&m.ask.opts.some(x=>x.say&&x.say[0].text==='……這隻貓的杯子拿反了。'),J(m&&m.ask.opts));
});
await sec('3-Z8',async()=>{ const z8a=D('2027-05-12'), zq8=D('2027-05-17');
  setup(zq8,19.5,'wancai',{dh:ZR}); ROM.learn(H.G,ZQ,ZR,'test'); let L=await play('ev_zhiruo_concert');
  check('3. Z8 子晴（她知道祐廷和芷若交往）：「'+Z8zq.join('」…「')+'」',L[0]==='欸，你知道芷若在演唱會哭嗎？'&&has(L,[Z8zq[0]])&&L[L.length-1]===Z8zq[1]&&!SOCIAL.has(ZR,'HEARD_FROM_ZIQING'),J(L));
  setup(zq8,19.5,'wancai',{dh:[ZR,ZQ]}); L=await play('ev_zhiruo_concert');
  check('3. Z8 兩位都和祐廷交往中（子晴不知道）：子晴說原文「……她還沒跟你說吧。她要自己說。你裝不知道。」',L.includes('……她還沒跟你說吧。她要自己說。你裝不知道。')&&!L.includes(Z8zq[1]),J(L));
  setup(z8a,15,'cafe',{dh:ZR}); H.G.flags.ZR_ADMIT_CALL='stayed'; L=await play('ev_zhiruo_admitted',['五個月很快']);
  check('3. ev_zhiruo_admitted（和她交往中）：「'+Z8five[0]+'」、選項'+Z8five[1]+'→「'+Z8five[2]+'」（AA_554：四個月→五個月，三處）',L.includes(Z8five[0])&&H.opts[0].includes(Z8five[1])&&L[L.length-1]===Z8five[2]&&!L.some(t=>/五個多月|四個月/.test(t)),J([L,H.opts]));
});
await sec('3-Z9',async()=>{ const d9=D('2027-06-03'), dep=D('2027-09-02');
  setup(d9,21,'cafe',{dh:ZR}); H.G.flags.CAFE_VISITS=5; SOCIAL.remember(ZR,'ASKED_HER_DRINK',''); H.G.events.done.ev_zhiruo_applied=1; H.cgs=[]; CG_REGISTRY.cg_last_shift_heroine02={}; const L=await play('ev_zhiruo_last_shift',['會去看']);
  check('3. Z9 和她交往中：「幫我做一件事。」之後換「'+Z9.join('」「')+'」；BCG-15 照放；ASKED_HER_DRINK 不另加句子',has(L,['（從包包拿出一張電影票根）幫我做一件事。'].concat(Z9))&&H.cgs.includes('cg_last_shift_heroine02')&&!L.some(t=>/我的那杯/.test(t))&&H.G.flags.ZR_LAST_SHIFT==='seen',J(L));
  delete CG_REGISTRY.cg_last_shift_heroine02;
  setup(dep-1,20,'dorm',{dh:ZR}); at(dep,9); run(9,10.1); const m=thread(ZR).filter(x=>x.tag==='y2_zr_depart').map(x=>x.text);
  check('3. 錯過最後一班、9/2 沒去送機（和她交往中）：早上（10:00）三則「'+Z9miss.join('」「')+'」',J(m)===J(Z9miss),J(m));
  setup(dep-1,20,'dorm',{dh:ZR}); H.G.flags.ZR_SENDOFF_2027='met'; H.G.flags.ZR_LAST_SHIFT='airport'; SOCIAL.remember(ZR,'TICKET_STUB',''); at(dep,10); run(10,10.6);
  const m2=thread(ZR).map(x=>x.text);
  check('3. 錯過最後一班、去了送機（機場拿到票根）：登機以後（10:30）只傳「星期天晚上十點。不要忘記。」——「櫃台有一張票根」和機場給的票根對不上（已列給 AA）、「今天出發了。」不傳',J(m2)===J([Z9miss[2]])&&thread(ZR)[0].tag==='aa554_z9_board'&&Math.abs(thread(ZR)[0].h-10.5)<0.01,J(m2));
});
await sec('3-視訊',async()=>{ const s1=D('2027-09-05'), s2=D('2028-02-06');
  const dh=(day)=>{ setup(day,12,'dorm',{dh:ZR}); };
  dh(s1); run(12,12.1); let q=OUT.get(H.G,'zruk_w_2027-09-05');
  check('3. 每週視訊（和她交往中、第一次交換）：2027-09-05（週日）臺灣 22:00、不用前一天約',!!q&&q.day===s1&&Math.abs(q.h-22)<0.01&&q.ev==='ev_zr_uk_weekly',J(q));
  dh(s2); run(12,12.1); q=OUT.get(H.G,'zruk_w_2028-02-06'); dh(s1-7); run(12,12.1); const before=OUT.get(H.G,'zruk_w_'+keyOf(s1-7)); dh(s2+7); run(12,12.1); const after=OUT.get(H.G,'zruk_w_'+keyOf(s2+7));
  check('3. 每週視訊：最後一次 2028-02-06；2027-08-29、2028-02-13 沒有',!!q&&!before&&!after,J([!!q,!!before,!!after]));
  setup(D('2027-10-02'),12,'dorm',{}); SOCIAL.rel(ZR).npcRom=35; run(12,21.2); const mon=thread(ZR).some(x=>/^zruk_m_ask_/.test(x.tag||'')); at(D('2027-10-03'),12); run(12,12.1); const wk=OUT.get(H.G,'zruk_w_2027-10-03');
  check('3. 每月的照舊只給兩人都單身的（第 5 階以上）：有每月的約、沒有每週的',mon&&!wk,J([mon,!!wk]));
  dh(s1); const crack0=+H.G.flags.ZR_CRACK||0; const P=async(day,pick)=>{ at(day,12); run(12,12.1); const q2=OUT.get(H.G,'zruk_w_'+keyOf(day)); H.said=[]; H.picks=[pick]; at(day,22-1/6); await OUT.go(GM,q2); return said(); };
  const L1=await P(s1,'早點睡'), L2=await P(s1+7,'早點睡'), L3=await P(s1+14,'早點睡');
  check('3. 每週視訊（第一次交換）：開頭→話題 W1、W2、W3→收尾「你那邊很晚了吧。」；「早點睡。」連三次都不算裂縫（ZR_CRACK 不動）',L1.includes('上課有個同學每次都坐同一排。他問我臺灣的冬天冷不冷。')&&L2.includes('室友煮了一鍋湯，叫我喝。很鹹。')&&L3.includes('學校旁邊有一家咖啡店，店員記得我點什麼了。')&&L1.includes('你那邊很晚了吧。')&&(+H.G.flags.ZR_CRACK||0)===crack0&&ZRUK.rec(H.G).w.sleep===0,J([L1,H.G.flags.ZR_CRACK]));
  const used=ZRUK.rec(H.G).w.used.slice(); const L4=await P(D('2028-09-10'),'讀書'), L5=await P(D('2028-09-17'),'早點睡');
  check('3. 話題和第二次在英國共用（同一個紀錄）：2028-09 接著往下——開頭第 4 句「今天換你先講。」接 W11、下一週 W4（不從 W1 重來）；第二次「早點睡。」連兩次＝ZR_CRACK +1（照原本）',
    J(used)===J(['W1','W2','W3'])&&L4[0]==='今天換你先講。'&&L4.includes('你那邊呢？這週有什麼？')&&L5.includes('店長傳照片給我，吧檯換了新的燈。')&&!L5.includes('上課有個同學每次都坐同一排。他問我臺灣的冬天冷不冷。')&&(+H.G.flags.ZR_CRACK||0)===crack0+1,J([used,L4.slice(0,2),L5.slice(0,2),H.G.flags.ZR_CRACK]));
  check('3. W13（2029-03 以後的機票）不在第一次交換的話題裡',!ZRUK.W.W13||D(ZRUK.W.W13.from)>s2);
});
await sec('3-摘要日',async()=>{ const d=D('2026-12-15');
  setup(d,9,'dorm',{dh:ZR}); H.G.events.done.ev_zhiruo_applied=1; let r=dpRun('y2_zr_order',d);
  check('3. 摘要日（和她交往中、Z7 之後 Z9 之前）：22:07「'+ZRY2[0]+'」（AA_230 Z-30 只留這一則）',r.ok&&Math.abs(r.h-(22+7/60))<0.01&&J(r.items)===J(ZRY2),J(r));
  setup(d,9,'dorm',{}); H.G.events.done.ev_zhiruo_applied=1; r=dpRun('y2_zr_order',d); check('3. 單身照原本（熱美式那兩則）',J(r.items)===J(['今天有個常客點了熱美式。','他上禮拜都點拿鐵。我差點問他怎麼了。']),J(r.items));
  const d2=D('2027-03-09'); setup(d2,9,'dorm',{dh:ZR}); PHONE.at(H.G,D('2027-01-28'),21,[{th:'p:'+ZR,from:ZR,text:'學校那一關過了。'}],'zr_z7b'); PHONE.tick(H.G); r=dpRun('aa554_zr_cal',d2); const late=dpRun('aa554_zr_cal',D('2027-05-12'));
  check('3. 摘要日（和她交往中、Z7b 之後）：「📷（Café 的月曆，五月那一頁折了一個角）」「還沒到。我先折起來。」；錄取信（5/11）以後不傳（技術預設）',r.term&&r.ok&&J(r.items)===J(['📷（Café 的月曆，五月那一頁折了一個角）',ZRCAL[1]])&&!late.ok,J([r,late.ok]));
  const d3=D('2027-05-20'); setup(d3,9,'dorm',{dh:ZR}); H.G.flags.ZR_ADMITTED=true; r=dpRun('aa554_zr_pack',d3);
  check('3. 摘要日（和她交往中、Z8 之後）：「'+ZRPACK.join('」「')+'」',r.term&&r.ok&&J(r.items)===J(ZRPACK),J(r));
  setup(d3,9,'dorm',{}); H.G.flags.ZR_ADMITTED=true; check('3. Z8 之後那則只給和她交往中的',!dpRun('aa554_zr_pack',d3).ok);
});
}

/* ======================= 4 大二和子晴交往 ======================= */
async function part4(){
await sec('4-Q7',async()=>{ const d=STORY.termDay('Y2S1',3,1);
  const pr=async(pick,o)=>{ setup(d,19.5,'wancai',Object.assign({dh:ZQ},o)); return play('ev_ziqing_lab_letter',[pick]); };
  let L=await pr('想進實驗室');
  check('4. Q7 和她交往中：第五句之後多「'+Q7x+'」',has(L,['……好，這題我不會。你是法律系的，你幫我判。',Q7x]),J(L.slice(0,6)));
  check('4. Q7「妳想進實驗室嗎？」：「……不想。」「她想了很久。」「'+Q7a.join('」「')+'」',has(L,['……不想。','她想了很久。'].concat(Q7a))&&SOCIAL.has(ZQ,'LAB_LETTER'),J(L.slice(-4)));
  L=await pr('都很強'); check('4. Q7「不管是哪一個，妳都很強。」：「'+Q7b.join('」「')+'」（「打完還是很強。」照表當祐廷說的，已列給 AA）',has(L,Q7b)&&H.said.find(s=>s.t==='打完還是很強。').who===H.G.name,J(L.slice(-4)));
  L=await pr('接妳爸'); at(d,23); run(23,23.3); const m=thread(ZQ).filter(x=>x.tag==='aa554_q7_dad').map(x=>x.text);
  check('4. Q7「接妳爸的電話。」：「不要。」「她把手機調成靜音。」「'+Q7c+'」；當晚 23:10 三則「'+Q7m.join('」「')+'」',has(L,['不要。','她把手機調成靜音。',Q7c])&&J(m)===J(Q7m)&&H.G.flags.LAB_LETTER_DAD===true,J([L.slice(-3),m]));
  setup(d,19.5,'wancai',{}); L=await play('ev_ziqing_lab_letter',['接妳爸']); at(d,23); run(23,23.3);
  check('4. Q7 單身照原本：「……改天講給你聽。」、沒有 23:10 那三則',L.includes('……改天講給你聽。')&&!L.includes(Q7x)&&!thread(ZQ).length,J(L));
});
await sec('4-Q8',async()=>{ const d=STORY.termDay('Y2S2',13,2);
  const pr=async(pick,o)=>{ setup(d,22.2,'gongguan',Object.assign({dh:ZQ},o)); H.G.events.done.ev_ziqing_secret_game=1; return play('ev_ziqing_dad_visit',[pick]); };
  let L=await pr('可以不給他看');
  check('4. Q8 和她交往中：河堤那段第一句前多兩句「'+Q8x.join('」「')+'」',has(L,Q8x.concat(['他說：「妳在做遊戲？……做好了，給我玩。」'])),J(L.slice(5,9)));
  check('4. Q8「做完了，可以不給他看。」：「'+Q8a.join('」「')+'」',has(L,Q8a)&&!L.includes('（她停下來。）'),J(L.slice(-5)));
  L=await pr('我想玩玩看'); check('4. Q8「我想玩玩看。」：原文照用、TESTER',L.some(t=>/阿凱抓 bug，你抓劇情的漏洞/.test(t))&&H.G.flags.TESTER===true);
  L=await pr('一定會懂'); const F=H.G.flags; at(d+1,8); run(8,8.8); const m=thread(ZQ).filter(x=>x.tag==='aa554_q8_dad').map(x=>x.text);
  const sorry=ev('ev_ziqing_dad_sorry'); at(d+3,19.5); const sc=EVENTS.check(sorry);
  check('4. Q8「妳很有天分。他一定會懂。」（和她交往中）：不扣分、那天沒有先走（一起走到捷運站）；隔天 08:40「'+Q8m.join('」「')+'」；不記 ZQ_DAD_ARGUED_DAY（社課那一場不演）',
    L.includes('……『一定會』。')&&L.includes('（那天她不說話，可是沒有先走，兩個人一起走到捷運站。）')&&!L.includes('（她把耳機戴上。那天沒有再說話。）')&&J(m)===J(Q8m)&&F.ZQ_DAD_ARGUED_DAY==null&&!sc,J([L.slice(-4),m,F.ZQ_DAD_ARGUED_DAY]));
  setup(d,22.2,'gongguan',{}); H.G.events.done.ev_ziqing_secret_game=1; L=await play('ev_ziqing_dad_visit',['一定會懂']); at(d+1,9); run(9,9.1);
  check('4. Q8 單身照原本：耳機戴上、記 ZQ_DAD_ARGUED_DAY、沒有隔天那三則',L.includes('（她把耳機戴上。那天沒有再說話。）')&&H.G.flags.ZQ_DAD_ARGUED_DAY===d&&!L.some(t=>/男朋友/.test(t))&&!thread(ZQ).length,J(L.slice(-3)));
});
await sec('4-Q9',async()=>{ const d=D('2027-05-28');
  setup(d,19.5,'wancai',{dh:ZQ}); SOCIAL.remember(ZQ,'INVITED_CLUB',''); H.G.flags.ZQ_SHOW='clap'; let L=await play('ev_ziqing_show2');
  check('4. Q9 和她交往中（Q5 去過）：「去年那個 bug 修好了。」、貼在手機殼上「第二張。明年還有第三張。」',L.includes('去年那個 bug 修好了。')&&L[L.length-1]==='第二張。明年還有第三張。'&&L.some(t=>/直接貼在你的手機殼上/.test(t)),J(L.slice(-3)));
  setup(d,19.5,'wancai',{dh:ZQ}); SOCIAL.remember(ZQ,'INVITED_CLUB',''); H.G.flags.ZQ_SHOW='absent'; L=await play('ev_ziqing_show2');
  check('4. Q9 和她交往中、Q5 沒去：「去年的份。」多一句「……今年你有來。我看到了。不要換位子。」',has(L,['去年的份。','……今年你有來。我看到了。不要換位子。']),J(L.slice(-3)));
});
await sec('4-摘要日',async()=>{ const d=STORY.termDay('Y2S1',13,2);
  const lab=(note,dad)=>{ setup(d,9,'dorm',{dh:ZQ}); SOCIAL.remember(ZQ,'LAB_LETTER',note); if(dad) H.G.flags.LAB_LETTER_DAD=true; return dpRun('y2_zq_lab',d); };
  let r=lab('問她想不想進實驗室');
  check('4. 摘要日（和她交往中、LAB_LETTER、Q7 選第一個）：原本五則＋「……晚上要慶祝。你請。」＋「'+LAB2+'」（1-1「最後多一則」照字面排最後）',r.ok&&J(r.items)===J(LAB.concat([LAB2])),J(r.items));
  r=lab('叫她接爸爸的電話',true); check('4. 摘要日（Q7 選「接妳爸的電話」）：沒有「你說對了。不是我爸。」',J(r.items)===J(LAB),J(r.items));
  setup(d,9,'dorm',{}); SOCIAL.remember(ZQ,'LAB_LETTER',''); r=dpRun('y2_zq_lab',d); check('4. 單身照原本五則',J(r.items)===J(LAB.slice(0,5)),J(r.items));
  const d2=STORY.termDay('Y2S2',15,2); setup(d2,9,'dorm',{dh:ZQ}); let r2=dpRun('aa554_zq_level',d2); H.G.events.done.ev_ziqing_dad_visit=1; let r3=dpRun('aa554_zq_level',d2);
  check('4. 摘要日（和她交往中、Q8 之後）：凌晨 00:20「'+LEVEL.join('」「')+'」；沒看過河堤那一場不傳',!r2.ok&&r3.ok&&r3.term&&Math.abs(r3.h-(24+20/60))<0.01&&J(r3.items)===J(LEVEL),J([r2.ok,r3]));
  r=dpRun('aa554_zq_cats',d2); check('4. 摘要日（和她交往中）：截圖「遊戲裡兩隻插座貓，一隻在打電動，一隻在旁邊看」＋「'+CATS.join('」「')+'」（AA_230 D-4「你自己猜」）',r.ok&&r.term&&/兩隻插座貓，一隻在打電動，一隻在旁邊看/.test(r.items[0])&&J(r.items.slice(1))===J(CATS),J(r));
  setup(d2,9,'dorm',{}); H.G.events.done.ev_ziqing_dad_visit=1; check('4. 那兩則只給和她交往中的',!dpRun('aa554_zq_level',d2).ok&&!dpRun('aa554_zq_cats',d2).ok);
});
}

/* ======================= 5 和別人交往中：照現在的版本 ======================= */
async function part5(){
await sec('5',async()=>{ const fri=STORY.termDay('Y1S2',11,5);
  setup(fri,20,'dorm',{gf:ZR,lv:'fam'}); run(20,21.2); at(fri+1,14.5); H.G.zone='wenzhou'; const c=EVENTS.check(ev('ev_zhiruo_secret')); const r0=rel(ZR); const L=await play('ev_zhiruo_secret',['妳想去嗎']);
  check('5. Z4 和別人交往中：沒有前一晚的私訊、14:00 起照原本、「妳想去嗎？」只有 trust+8（沒有 aff）、原本的回應',!thread(ZR).length&&c&&dRel(r0,rel(ZR)).trust===8&&!dRel(r0,rel(ZR)).aff&&L.includes('好可怕。說出來就變成真的了。'),J([c,dRel(r0,rel(ZR)),L.slice(-2)]));
  const FRI=STORY.termDay('Y1S2',12,5); setup(FRI,20,'cafe',{gf:ZR,lv:'fam'}); SOCIAL.remember(ZR,'SHARED_SECRET',''); H.G.events.done.ev_zhiruo_secret=1; let L2=await play('ev_zhiruo_film_night',['幾點']);
  check('5. Z5 和別人交往中：三個人的邀約「…方奕廷也去。……你要來嗎？」',L2[0]==='明天我沒班。我要去看《進城的那一週》的重映，早場。方奕廷也去。……你要來嗎？',J(L2[0]));
  setup(FRI+1,10,'dorm',{gf:ZR,lv:'fam'}); L2=await play('ev_zhiruo_early_show',['室友']);
  check('5. Z5 早場和別人交往中：三個人（方奕廷「哪一個爸爸？」）、選項還有「我下次帶我室友來。」、記 WATCHED_FILM_GROUP',L2.includes('哪一個爸爸？')&&H.opts[0].includes('「我下次帶我室友來。」')&&!H.opts[0].includes(Z5opt)&&SOCIAL.has(ZR,'WATCHED_FILM_GROUP'),J(H.opts[0]));
  const sat=STORY.termDay('Y1S2',8,6); setup(sat,12,'dorm',{gf:ZQ}); SOCIAL.remember(ZQ,'ARGUED_ABOUT_CAREER',''); run(12,15.1); H.G.zone='gongguan'; const L3=await play('ev_ziqing_contest_day',['第四罐']);
  check('5. Q4 和別人交往中：沒有 13:30 的私訊、原本的回應（「她第一次沒有吐槽下去」）',!thread(ZQ).length&&L3.includes('（她第一次沒有吐槽下去。）')&&!L3.includes('我喜歡奇怪的。'),J(L3.slice(-3)));
  const d6=STORY.termDay('Y1S2',11,1); setup(d6,19.5,'wancai',{gf:ZQ}); SOCIAL.remember(ZQ,'CONTEST_DAY',''); const L4=await play('ev_ziqing_secret_game',['比比賽有用']);
  check('5. Q6 和別人交往中照原本：「好，那我把它做完。做完你再玩一次。」',L4.includes('好，那我把它做完。做完你再玩一次。')&&!L4.includes(Q6b));
  const d=D('2026-12-10'); setup(d,20,'dorm',{gf:ZR}); H.G.events.done.ev_zhiruo_secret=1; run(20,20.2); const noCall=!OUT.get(H.G,'aa554_z7_call'); at(d+1,0.2); run(0.2,0.3);
  check('5. Z7 和別人交往中（她知道）：沒有電話、也沒有 23:59 那三則（照原本 AA_112 8-1）',noCall&&!byTag('zr_z7_msg').length);
  const d9=D('2027-06-03'); setup(d9,21,'cafe',{gf:ZR}); H.G.flags.CAFE_VISITS=5; H.G.events.done.ev_zhiruo_applied=1; const L5=await play('ev_zhiruo_last_shift',['會去看']);
  check('5. Z9 和別人交往中：一疊票根給常客（照舊）',L5.includes('常客一人一張。我不在的時候，去看一部電影。看完寫一句話，寄到店裡。我會回。')&&!L5.includes(Z9[1]),J(L5));
  const dep=D('2027-09-02'); setup(dep-1,20,'dorm',{gf:ZR}); at(dep,9); run(9,10.1);
  check('5. 錯過最後一班、和別人交往中：一疊票根那三則（照舊）',J(thread(ZR).filter(x=>x.tag==='y2_zr_depart').map(x=>x.text))===J(['今天出發去英國了。','櫃台有一疊電影票根，常客一人一張，跟老闆拿。','看完寫一句話，寄到店裡。我會回。']));
  const dc=STORY.termDay('Y1S2',5,2); setup(dc,9,'dorm',{gf:ZR}); SOCIAL.remember(ZR,'ASKED_HER_DRINK',''); const a=dpRun('zr_cocoa_y1s2',dc);
  check('5. 摘要日和別人交往中：熱可可那則照原本 15:10「今天有人點熱可可加濃縮。我以為只有我會喝這個。」',Math.abs(a.h-(15+10/60))<0.01&&J(a.items)===J(['今天有人點熱可可加濃縮。我以為只有我會喝這個。']),J(a));
  setup(D('2027-10-03'),12,'dorm',{gf:ZR}); run(12,12.1); check('5. 和別人交往中：第一次交換沒有每週的視訊',!OUT.get(H.G,'zruk_w_2027-10-03'));
  const dz=STORY.termDay('Y1S2',3,2); setup(dz,21.75,'cafe',{gf:ZR}); const L6=await play('ev_zhiruo_own_drink');
  check('5. Z3 和別人交往中照原本（最後「……不要笑。」）',L6[L6.length-1]==='……不要笑。'&&!H.G.flags.ZR_Z3_DH);
});
}
