// AA_556 寒暑假第二批（企劃線 3d7ad0024；VAC-GAP2-1031；D99 第二優先）——不需要瀏覽器。用法：node tests/aa556_vacgap2_unit.js
//   1 C13 自己排的出國：中間那天目的地第二句後面——自己去＝當地的一段（七個目的地各一次）、和朋友去＝朋友的一段（五位各一次）；和女朋友去的不受影響；同一個目的地第二次不演
//   2 C10 加州：07-04 煙火、07-15 讀書小組、07-24 晚餐照日期插入（第一次 8 場）；第二次照 rep.keys2（新的三場不演）
//   3 C11 東京：01-20 便利商店（以安也在東京＝她那兩句；其他＝同團的學生＋兩個選項）、01-26 自由活動（第一次 5 場）；第二次以後不演
//   4 大一暑假 6/24 阿凱：回「我也來打。」＝當晚 22:00 線上語音（取代對話串的旁白）；沒回只有訊息
//   5 大二暑假 7/10→7/11 阿凱冰店、8/12→8/13 語彤修鞋店（FIELD_WITH_YT）；6 大二寒假 2/11→2/12 芯慈豆漿店：條件不到不傳、回了才演、不回不追
// 台詞一字不差照 AA_556（企劃線 3d7ad0024 的 git show）；修改前（6fa456c6b）除了第 0 節「稿讀得到」，每一節都會 FAIL。
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr='';
for(const f of ['src/holff3d.js','src/data/vacfill_events.js','src/vacfill3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+String(e&&e.message||e)+'　'; } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const A556='docs/story_planning/AA_556_寒暑假第二批_出國旅遊_加州東京_大二暑假寒假_阿凱624.md';
const doc=git('3d7ad0024',A556)||git('origin/claude/story-planning',A556);
check('0. AA_556（企劃線 3d7ad0024）讀得到；模組都載得到',doc.length>3000&&doc.indexOf('# AA_556')>=0&&!loadErr,loadErr||'git fetch origin claude/story-planning');
const inDoc=t=>!!doc&&(doc.includes(String(t))||doc.includes(require('./aa959_map.js').unmapText(String(t),'vac_activities.js')));   /* AA_959：遊戲的字照覆寫表改過（「……」開頭減量）＝換回稿上的字再找 */
const notIn=L=>L.filter(t=>!inDoc(t));
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const TV=VAC_DATA.TRAVEL, A=VAC_DATA.A, nm=id=>SOCIAL.displayName(id);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
GM.toast=()=>{};
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:D(k); G.day=d; G.hour=h; G.weekday=wd(d); E.hour=h; };
const lawG=(k,h,o)=>{ o=o||{}; const G=H.fresh(k,h,o.zone||'dorm',o.flags||{}); setT(k,h); G.outings=[]; G.contacts=G.contacts||{}; G.vacfill=undefined; if(!Array.isArray(G.trips)) G.trips=[];
  for(const id of (o.friend||[])) H.FRIEND(id); for(const id of (o.fam||[])) H.FAMILIAR(id); for(const id of (o.know||[])) H.rel(id,10,0,0); return G; };
const VF=()=>typeof VACFILL!=='undefined'?VACFILL:null;
const rules=()=>{ if(VF()) VF().phone(H.G); PHONE.tick(H.G); };
const tagged=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const optsOf=tag=>{ const m=tagged(tag).find(x=>x.ask); return m?m.ask.opts.map(o=>o.t):[]; };
const answer=(tag,k)=>{ const r=PHONE.answer(H.G,tag,k); return r?r.out.map(m=>(m.from||'-')+':'+m.text).slice(r.o.post===false?0:1):null; };
const out=id=>OUT.get(H.G,id);
const isAt=(q,k,h)=>!!q&&q.day===D(k)&&Math.abs(q.h-h)<1e-6&&q.state==='planned';
const thMsgs=th=>(H.G.msgs||[]).filter(m=>PHONE.th(m)===th);
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) return null; await EVENTS.run(e); return H.lines(); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* 人在不在臺北：暫時換掉 STORY.presence（那幾天本來都在臺北，測「不在」的分支）*/
const awayPres=async(id,f)=>{ const p0=STORY.presence; STORY.presence=(who,G)=>who===id?{here:false,away:'不在臺北',kind:'home'}:p0(who,G); try{ return await f(); } finally { STORY.presence=p0; } };
/* 排一趟自己排的出國（C13），涵蓋那一天（rec＋行事曆的出遊，同 plan13 排出來的樣子）*/
const t13Over=(k,days)=>{ const V=VAC.rec(H.G), n=(V.t13||(V.t13=[])).length+1, from=D(k); V.t13.push({n,dest:'kr',from,to:from+days-1,with:null,gf:false,season:'summer'}); OUT.plan(H.G,{id:'vac_t13_'+n,ev:'ev_vac_key',day:from,h:8,late:0.5,place:'韓國（首爾）',title:'出國旅遊：韓國（首爾）',travel:'去機場 約 1 小時',travelH:1,vac:{key:'T13#'+n,k:'trip'}}); };

(async()=>{
  if(!VF()||!doc){ H.done(); return; }
  /* ======================= 1 C13 ======================= */
  await sec(1,async()=>{
    const trip=async(dest,from,days,who,gf,prev)=>{ const G=H.fresh(from,7,'dorm'); if(gf) G.flags['dating_'+who]=true; const V=VAC.rec(G); V.t13=(prev||[]).concat([{n:(prev||[]).length+1,dest,from:D(from),to:D(from)+days-1,with:who||null,gf:!!gf,season:'summer'}]); H.said=[]; await VAC.trip13(GM,'T13#'+V.t13.length,null); return H.lines(); };
    const kv=(x)=>typeof x==='function'?x(H.G):x;
    const LOCAL={jp:['（你問站務員怎麼轉車。他拿出一張紙，畫了一張很醜的地圖。）','站務員：まっすぐ。……まっすぐ。','（他比了三次直走。你照著走，真的到了。）'],
      kr:['（租腳踏車的櫃台，大學生看了你的護照。）','大學生：謝謝。','（他笑了一下，說他只會這一句中文。）'],
      th:['（嘟嘟車停紅燈。司機回頭。）','司機：First time?','（你點頭。他把音樂開大聲：「Welcome!」）'],
      vn:['（咖啡店的老闆娘端來一杯上面有一層蛋的咖啡。你看了很久。）','老闆娘：Stir. Stir.','（她比了一個攪拌的手勢。很甜。）'],
      hk:['（茶餐廳客滿。阿姐把你帶到一張已經坐了兩個人的桌子。）','阿姐：搭枱啊，坐。','（對面的大叔把報紙收起來一半，讓出位子。）'],
      eu:['（火車上，對面的老太太問你從哪裡來。）','老太太：Taiwan? ……Far.','（她從包包拿出一顆蘋果，切了一半給你。）'],
      us:['（公路旁的餐廳。服務生第三次走過來。）','服務生：Refill?','（你的咖啡還是滿的。她還是幫你加了一點。）']};
    /* 稿上的寫法：說話的一句是「誰：「…」」、旁白照抄 */
    const docForm=t=>{ const m=/^([^（：]{1,6})：(.*)$/.exec(t); return m?m[1]+'：「'+m[2]+'」':t; };
    const res=[]; for(const dest of Object.keys(TV.dest)){ const De=TV.dest[dest], L=await trip(dest,'2026-07-06',5,null,false); const want=[kv(De.keys[0]),kv(De.keys[1])].concat(LOCAL[dest],[kv(De.keys[2])]); res.push([dest,J(L)===J(want),L]); }
    check('1-1. 自己去，七個目的地各一次（5 天）：中間那天目的地第二句後面接當地的一段（旁白、當地的人一句、旁白），其他兩天照舊',res.length===7&&res.every(r=>r[1]),J(res.filter(r=>!r[1])));
    check('1-1. 當地的一段 21 句都在 AA_556 第 1-1 節（說話的照稿「誰：「…」」）',!notIn([].concat(...Object.values(LOCAL)).map(docForm)).length,J(notIn([].concat(...Object.values(LOCAL)).map(docForm))));
    { const L=await trip('jp','2026-07-06',3,null,false), De=TV.dest.jp;
      check('1-1. 三天的（中間那天＝最後一晚那天）：14:00 目的地第二句＋當地的一段、20:00 第三句',J(L)===J([De.keys[0],De.keys[1]].concat(LOCAL.jp,[De.keys[2]])),J(L)); }
    const FR={kai:['所以我們今天走了兩萬步。我的腳在抗議。','可是那家拉麵要排一個小時。……我還是要排。'],zhe:['我們中午吃了三餐。早餐、早午餐、午餐。','……晚餐吃什麼？'],
      yu:['你幫我拍一張。不對，蹲下來拍，這樣我比較高。',{narr:'（你蹲下來。她看了照片：「……好，你以後都這樣拍。」）'}],classmate_bohan:['今天的行程延誤了四十分鐘。','……可是你走錯路才找到那家店。很好吃。我寫進明天的行程了。'],
      classmate_xinci:['每天花多少我都記在手機裡。今天超支一百二十塊。','是那杯咖啡。值得。']};
    const SPN={kai:'阿凱',zhe:'阿哲',yu:'Alison',classmate_bohan:'柏翰',classmate_xinci:'芯慈'};
    const fr=[]; for(const id of Object.keys(FR)){ const De=TV.dest.kr, L=await trip('kr','2027-07-01',4,id,false); const mid=FR[id].map(x=>typeof x==='string'?nm(id)+'：'+x:x.narr); const want=[De.keys[0],De.keys[1]].concat(mid,[De.keys[2],nm(id)+'：'+TV.friend[id]]); fr.push([id,J(L)===J(want),L]); }
    check('1-2. 和朋友去，五位各一次：中間那天目的地第二句後面接朋友的一段（Alison 第二句是旁白）；最後一晚朋友那一句照舊；沒有當地的一段',fr.length===5&&fr.every(r=>r[1]),J(fr.filter(r=>!r[1])));
    const frDoc=[]; for(const id in FR) for(const x of FR[id]) frDoc.push(typeof x==='string'?SPN[id]+'：「'+x+'」':x.narr);
    check('1-2. 朋友的一段 10 句都在 AA_556 第 1-2 節',frDoc.length===10&&!notIn(frDoc).length,J(notIn(frDoc)));
    { const L=await trip('eu','2027-07-12',10,'heroine_01',true), De=TV.dest.eu, g=TV.gf.heroine_01, n1=nm('heroine_01');
      check('1-3. 和女朋友去不受影響（以安歐洲十天：到了→目的地第二句＋她的中間→最後一晚＋last→燈關了；沒有當地、朋友的一段）',J(L)===J([g.arr[0],n1+'：'+g.arr[1],De.keys[1],g.mid[0],n1+'：'+g.mid[1],De.keys[2],n1+'：'+g.last,'（燈關了。）']),J(L)); }
    { const prev=[{n:1,dest:'th',from:D('2026-07-06'),to:D('2026-07-10'),with:null,season:'summer',done:true}], AG=TV.again[2];
      const L=await trip('th','2027-07-06',5,null,false,prev), L2=await trip('th','2027-07-06',5,'kai',false,prev);
      check('1-4. 同一個目的地第二次（again）：自己去、和朋友去都不演當地／朋友的一段',J(L)===J([AG.dep,AG.arr,AG.mid,AG.last])&&J(L2)===J([AG.dep,AG.arr,AG.mid,AG.last,nm('kai')+'：'+TV.friend.kai]),J([L,L2])); }
    { const G2=H.fresh('2027-01-05',7,'dorm'); VAC.rec(G2).reg['C05@Y1']='done'; VAC.rec(G2).t13=[{n:1,dest:'jp',from:D('2027-01-05'),to:D('2027-01-07'),with:null,season:'winter'}]; H.said=[]; await VAC.trip13(GM,'T13#1',null); const L3=H.lines();
      check('1-4. 阿凱那一團去過日本（C05）再自己去東京＝第二次：不演站務員那一段',!L3.some(t=>t.includes('站務員'))&&L3[0]===TV.again[2].dep,J(L3)); }
    /* 真的從手機排（plan13 → 行事曆的出遊 → 出發）：自己去韓國 */
    { const G=lawG('2027-07-01',10); H.picks=['韓國','5 天',0,'自己去']; const ok=await VAC.plan13(GM); const q=out('vac_t13_1'); H.said=[]; H.picks=[]; if(q){ setT(q.day,8); await VAC.outing(GM,q); }
      check('1-5. 從手機排的（plan13→出發）：自己去韓國，中間那天有租腳踏車櫃台的大學生「謝謝。」',ok===true&&!!q&&H.lines().includes('大學生：謝謝。')&&H.lines().includes(TV.dest.kr.keys[1])&&H.lines().indexOf('大學生：謝謝。')===H.lines().indexOf(TV.dest.kr.keys[1])+2,J(H.lines())); }
  });

  /* ======================= 2 C10 加州 ======================= */
  await sec(2,async()=>{
    const K=A.C10.keys, ks=K.map(k=>k.day+' '+k.h+' '+k.title);
    check('2-0. C10 keys 照日期 8 場：抵達、第一堂課、第一次報告、07-04 21:00 國慶日的煙火、週末、07-15 16:00 圖書館的讀書小組、07-24 20:00 最後一週的晚餐、期末考',
      J(ks)===J(['06-21 7 抵達','06-23 9 第一堂課','07-02 10 第一次報告','07-04 21 國慶日的煙火','07-11 13 週末','07-15 16 圖書館的讀書小組','07-24 20 最後一週的晚餐','07-30 9 期末考'])&&K[3].bg==='intl_ca_beach'&&K[5].bg==='intl_ca_classroom'&&K[6].bg==='intl_ca_classroom',J(ks));
    const FW=['（七月四號。宿舍頂樓，大家等煙火。）','Priya：In Mumbai we have Diwali. Louder than this.'], SG=['（期中前，Priya 找了兩個美國同學一起讀。休息的時候，其中一個問你。）','同學：Law in Taiwan is four years? And then the bar?','祐廷：Then the bar.','同學：……Respect. I\'m still deciding my major.'],
      DN=['（每個人帶一道家鄉的菜。你帶的是一包從臺灣帶來的泡麵，煮好放在中間，最後只剩湯。）','Priya：Next summer, Taiwan?'];
    const G=lawG('2027-06-21',7); VAC.signup(G,'C10@Y2','yes'); const q=out('vac_C10@Y2'); H.said=[]; H.opts=[]; H.picks=[0,0,0,0]; if(q) await VAC.outing(GM,q); const L=H.lines(), O=H.opts.slice();
    const at=t=>L.indexOf(t), seq=[at('（輪到你報告。講到第二張投影片，你忘了一個字。教授等了三秒，幫你接下去。）'),at(FW[0]),at('（風很大。Priya 說她第一次看到太平洋的另一邊。）'),at(SG[0]),at(DN[0]),at('（考卷四題，三小時。你寫完第三題的時候，旁邊的 Priya 已經在檢查了。）')];
    check('2-1. 第一次去（大二暑假）：8 場照日期演——第一次報告 → 煙火 → 週末 → 讀書小組 → 晚餐 → 期末考',!!q&&seq.every((x,i)=>x>=0&&(i===0||x>seq[i-1]))&&G.day===D('2027-07-31'),J(seq));
    const i4=at(FW[0]), i15=at(SG[0]), i24=at(DN[0]);
    check('2-2. 07-04 煙火：（七月四號。…）Priya「In Mumbai we have Diwali. Louder than this.」→ 選項「「Taiwan has New Year fireworks.」」「（安靜看煙火）」→ 選第一個：Priya「Show me.」＋（你找了一段跨年煙火的影片…「OK. That\'s louder.」）',
      J(L.slice(i4,i4+4))===J(FW.concat(['Priya：Show me.','（你找了一段跨年煙火的影片給她看。她看完說：「OK. That\'s louder.」）']))&&O.some(o=>J(o.slice(0,2))===J(['「Taiwan has New Year fireworks.」','（安靜看煙火）'])),J([L.slice(i4,i4+4),O]));
    check('2-3. 07-15 讀書小組：旁白、同學、祐廷「Then the bar.」、同學「……Respect. I\'m still deciding my major.」（沒有選項）',J(L.slice(i15,i15+4))===J(SG),J(L.slice(i15,i15+4)));
    check('2-4. 07-24 晚餐：旁白、Priya「Next summer, Taiwan?」→「「Come to Taiwan.」」→ Priya「I\'ll come for the food. Not for you.」（她笑了。）',J(L.slice(i24,i24+4))===J(DN.concat(['Priya：I\'ll come for the food. Not for you.','（她笑了。）']))&&O.some(o=>J(o.slice(0,2))===J(['「Come to Taiwan.」','「Maybe.」'])),J([L.slice(i24,i24+4),O]));
    { const I=VAC.inst('C10','Y2'); H.fresh('2027-07-04',21,'dorm'); H.said=[]; H.picks=[1]; await VAC.key(GM,K[3],I); const a=H.lines(); H.said=[]; H.picks=[1]; await VAC.key(GM,K[6],I); const b=H.lines();
      check('2-5. 另一個選項：「（安靜看煙火）」→（煙火放完，有人開始唱歌。你只聽得懂最後一句。）；「「Maybe.」」→ Priya「Maybe is a yes in economics.」',J(a)===J(FW.concat(['（煙火放完，有人開始唱歌。你只聽得懂最後一句。）']))&&J(b)===J(DN.concat(['Priya：Maybe is a yes in economics.'])),J([a,b])); }
    const all=[]; for(const k of [K[3],K[5],K[6]]){ for(const x of k.lines) all.push(x.narr||x.text); for(const c of (k.choice||[])){ all.push(c.t); for(const x of c.say) all.push(x.narr||x.text); } }
    check('2-6. 新三場的句子（'+all.length+' 句）都在 AA_556 第 2 節',all.length===18&&!notIn(all).length,J(notIn(all)));
    /* 第二次（大三暑假）：照 rep.keys2，新的三場不演 */
    { const G2=lawG('2028-06-21',7); VAC.rec(G2).reg['C10@Y2']='done'; VAC.signup(G2,'C10@Y3','yes'); const q2=out('vac_C10@Y3'); H.said=[]; H.opts=[]; if(q2) await VAC.outing(GM,q2); const L2=H.lines();
      check('2-7. 第二次（大三）：只有 rep.keys2 的五句（第二次飛加州…期末考），沒有煙火、讀書小組、晚餐、沒有選項',!!q2&&J(L2)===J(A.C10.rep.keys2.filter(x=>x!=null))&&!H.opts.length&&A.C10.rep.keys2.length===K.length,J(L2));
      const I3=VAC.inst('C10','Y3'); check('2-7. repKey：第二次那三場是 null（不演）',[3,5,6].every(i=>VAC.repKey(G2,I3,i,K[i])===null)); }
  });

  /* ======================= 3 C11 東京 ======================= */
  await sec(3,async()=>{
    const K=A.C11.keys, ks=K.map(k=>k.day+' '+k.h+' '+k.title);
    check('3-0. C11 keys 照日期 5 場：第一堂、01-20 07:40（AA-B 11-01 回第 1 題）宿舍樓下的便利商店、參訪、01-26 15:00 自由活動、最後一晚',J(ks)===J(['01-18 9 第一堂','01-20 '+(7+40/60)+' 宿舍樓下的便利商店','01-23 14 參訪','01-26 15 自由活動','01-29 20 最後一晚'])&&K[1].bg==='intl_tokyo_classroom'&&K[3].bg==='intl_tokyo_shotengai',J(ks));
    const CV='（早上七點多。你和同團的學生各拿了一個熱的飯糰，站在店門口吃。）', BK='（一整條街的舊書店。你在一間店裡看到一本很舊的日文六法，封面是綠色的。你翻了一下，又放回去。）', SN='（錢湯的牆上畫著一座很大的山。旁邊的伯伯泡到臉紅，對你點了一下頭。你也點頭。）';
    /* 大二、認識以安：她也在東京 */
    { const G=lawG('2027-01-17',7); SOCIAL.remember('heroine_01','FIRST_MET',''); VAC.signup(G,'C11@Y2','yes'); const q=out('vac_C11@Y2'); H.said=[]; H.opts=[]; H.picks=[0]; if(q) await VAC.outing(GM,q); const L=H.lines(), O=H.opts.slice(), an=nm('heroine_01');
      const i=L.indexOf(CV), seq=[L.findIndex(t=>t.includes('好像通識課')),i,L.findIndex(t=>t.includes('五十年前的照片')),L.indexOf(BK),L.findIndex(t=>t.includes('交誼廳煮泡麵'))];
      check('3-1. 大二第一次去（認識以安）：5 場照日期——第一堂 → 便利商店 → 參訪 → 自由活動 → 最後一晚',!!q&&seq.every((x,k)=>x>=0&&(k===0||x>seq[k-1])),J(seq));
      check('3-2. 01-20 以安也在東京：旁白→以安「書我帶了兩本。……打開了一本。」「另一本是用來壓行李的。」，沒有同團的學生、沒有那一題選項',J(L.slice(i,i+3))===J([CV,an+'：書我帶了兩本。……打開了一本。',an+'：另一本是用來壓行李的。'])&&!L.includes('同團的學生：你們法律系寒假不用念書嗎？')&&!O.some(o=>o.includes('「要啊。書在行李箱裡。」')),J([L.slice(i,i+3),O]));
      check('3-3. 01-26 自由活動：選項「舊書店街」「錢湯」→ 選舊書店街＝（一整條街的舊書店。…又放回去。）',O.some(o=>J(o.slice(0,2))===J(['舊書店街','錢湯']))&&L.includes(BK)&&!L.includes(SN),J(O)); }
    /* 大二、不認識以安：同團的學生＋兩個選項 */
    { const G=lawG('2027-01-17',7); VAC.signup(G,'C11@Y2','yes'); const q=out('vac_C11@Y2'); H.said=[]; H.opts=[]; H.picks=[1,1]; if(q) await VAC.outing(GM,q); const L=H.lines(), O=H.opts.slice(), i=L.indexOf(CV);
      check('3-4. 01-20 其他（不認識以安）：旁白→同團的學生「你們法律系寒假不用念書嗎？」→「「這就是在念書。」」→「……好，我回去跟我媽這樣說。」',i>=0&&J(L.slice(i,i+3))===J([CV,'同團的學生：你們法律系寒假不用念書嗎？','同團的學生：……好，我回去跟我媽這樣說。'])&&J(O[0])===J(['「要啊。書在行李箱裡。」','「這就是在念書。」']),J([L.slice(i,i+3),O[0]]));
      check('3-5. 01-26 選錢湯＝（錢湯的牆上畫著一座很大的山。…你也點頭。）',L.includes(SN)&&!L.includes(BK),J(O)); }
    { const I=VAC.inst('C11','Y3'); H.fresh('2028-01-20',8,'dorm'); SOCIAL.remember('heroine_01','FIRST_MET',''); H.said=[]; H.opts=[]; H.picks=[0]; await VAC.key(GM,K[1],I); const L=H.lines();
      check('3-6. 大三（以安沒去，AN_C11 不成立）第一次去：同團的學生那一版；「「要啊。書在行李箱裡。」」→「我的也是。還沒打開過。」',J(L)===J([CV,'同團的學生：你們法律系寒假不用念書嗎？','同團的學生：我的也是。還沒打開過。']),J(L)); }
    /* 第二次以後：照 rep.keys2／keys3，新的兩場不演 */
    { const G=lawG('2028-01-17',7); VAC.rec(G).reg['C11@Y2']='done'; VAC.signup(G,'C11@Y3','yes'); const q=out('vac_C11@Y3'); H.said=[]; H.opts=[]; if(q) await VAC.outing(GM,q); const L=H.lines();
      const I4=VAC.inst('C11','Y4'), V=VAC.rec(G); V.nth=V.nth||{}; V.nth[I4.key]=3;
      check('3-7. 第二次（大三）：只有 rep.keys2 的兩句（第一堂、參訪），便利商店、自由活動、最後一晚不演；第三次（keys3）也一樣',!!q&&J(L)===J(['第一堂。這次你聽得懂老師的玩笑。','參訪。去年那間法院的導覽員換人了。'])&&!H.opts.length&&[1,3,4].every(i=>VAC.repKey(G,I4,i,K[i])===null)&&VAC.repKey(G,I4,2,K[2]).lines[0].narr==='參訪。你在同一個地方等大家集合。',J(L)); }
    /* 上面比對遊戲輸出用的句子（照稿抄的）都在 AA_556 第 3 節（說話的照稿「以安：…」「同團的學生：…」，選項照稿的「」）*/
    const all=[CV,'以安：書我帶了兩本。……打開了一本。','以安：另一本是用來壓行李的。','同團的學生：你們法律系寒假不用念書嗎？','「要啊。書在行李箱裡。」','「這就是在念書。」','我的也是。還沒打開過。','……好，我回去跟我媽這樣說。','舊書店街',BK,'錢湯',SN];
    check('3-8. 新兩場的句子（'+all.length+' 句）都在 AA_556 第 3 節',!notIn(all).length,J(notIn(all)));
  });

  /* ======================= 4 大一暑假 6/24 阿凱 ======================= */
  await sec(4,async()=>{
    let G=lawG('2026-06-24',21.05,{know:['kai']}); rules();
    check('4-1. 6/24 21:00 阿凱私訊照舊（「所以你暑假在幹嘛」「我在打一款很難的遊戲 打不過」＋「我也來打。」）',J(tagged('vf_y1s_0624').map(m=>m.text))===J(['所以你暑假在幹嘛','我在打一款很難的遊戲 打不過'])&&J(optsOf('vf_y1s_0624'))===J(['我也來打。']));
    const rep=answer('vf_y1s_0624',0); rules(); const q=out('vf_y1s_0624');
    check('4-2. 「我也來打。」→ 阿凱「所以今晚 線上」（對話串裡不再有「那天晚上你們打到兩點」那一句旁白）',J(rep)===J(['kai:所以今晚 線上']),J(rep));
    check('4-3. 回了＝當晚 22:00 排一場線上語音（電話式：不用出門；背景 dorm_desk 的事件 ev_vf_y1s_0624）',isAt(q,'2026-06-24',22)&&q.ev==='ev_vf_y1s_0624'&&q.call===true&&(q.travelH|0)===0&&OUT.trip(G,q,true).travelH===0,J(q));
    const WANT=['（耳機裡，阿凱那邊有泡麵的聲音。）','阿凱：所以第三關的王，要先打牠的尾巴。','阿凱：……我也是剛剛才知道。我已經死了四十次。','（凌晨一點半，你們第一次打到牠剩一半的血。）','阿凱：所以我們差一半。……明天再打。','（那天晚上你們打到兩點。還是打不過。）'];
    const L=await runEv('ev_vf_y1s_0624'), e=ev('ev_vf_y1s_0624'), sc=e?e.dialogue.find(x=>x.scene):null;
    check('4-4. 22:00 那一段：照稿六句（泡麵的聲音 → 第三關的王 → 死了四十次 → 凌晨一點半 → 明天再打 → 打到兩點）；背景 dorm_desk；演完 2:00（hours 4）',J((L||[]).map(t=>t.replace(nm('kai')+'：','阿凱：')))===J(WANT)&&!!sc&&sc.bg==='dorm_desk'&&e.hours===4,J(L));
    check('4-5. 那一段的句子都在 AA_556 第 4 節',!notIn(WANT.map(t=>t.replace(/^阿凱：/,'阿凱：'))).length&&!notIn(['所以今晚 線上']).length,J(notIn(WANT)));
    G=lawG('2026-06-24',21.05,{know:['kai']}); rules(); setT('2026-06-24',23.5); rules(); setT('2026-06-25',12); rules();
    check('4-6. 沒回：只有訊息，沒有 22:00 那一段（沒排出遊、對話串裡也沒有旁白）',tagged('vf_y1s_0624').length===2&&!out('vf_y1s_0624')&&!thMsgs('p:kai').some(m=>/打到兩點/.test(m.text)));
    G=lawG('2026-06-24',22.6,{know:['kai']}); rules(); answer('vf_y1s_0624',0); rules();
    check('4-7. 22:00 以後（23:00 以前）才回的也排得到（late 1）',!!out('vf_y1s_0624')&&out('vf_y1s_0624').state==='planned');
  });

  /* ======================= 5、6 私訊約隔天 ======================= */
  const DM=[
    {n:'5-1',tag:'vf_y2s_0710',th:'p:kai',who:'kai',lv:'friend',low:'fam',day:'2027-07-10',h:20,oid:'vf_y2s_0711',evd:'2027-07-11',evh:15,ev:'ev_vf_y2s_0711',bg:'wenzhou_ice',   /* 11-02 起溫州街冰店用使用者生成的 wenzhou_ice */
      ms:['所以溫州街那家冰店開了','明天下午三點','我請 我的泡麵評鑑表滿一百家了 慶祝'],head:['（冰店的電風扇轉得很慢。阿凱點了兩碗，說一碗是評鑑用的。）','阿凱：所以這家要寫進表裡嗎。它不是泡麵。'],
      opts:['「開一張新的表。」','「好吃就寫進去。」'],tail:[['阿凱：……所以我暑假有事做了。'],['阿凱：好。那它是第一百零一家。雖然它是冰。']],sp:'阿凱',
      abroad:G=>{ t13Over('2027-07-11',3); }},   /* 7/10 在臺灣、7/11 出發（自己排的出國）＝那一天不在臺灣 */
    {n:'5-2',tag:'vf_y2s_0812',th:'p:heroine_03',who:'heroine_03',lv:'fam',low:'know',day:'2027-08-12',h:21,oid:'vf_y2s_0813',evd:'2027-08-13',evh:16,ev:'ev_vf_y2s_0813',bg:'gongguan',
      ms:['明天下午我要去訪問修鞋店的老闆。','……你要不要一起。你負責拿錄音筆就好。'],head:['（修鞋店很小，只放得下一張板凳。語彤坐板凳，你站在門口拿錄音筆。）','老闆：這雙鞋，我修過三次了。客人每次都說是最後一次。','（他把鞋底翻過來給你們看，上面有三種顏色的線。）','（回程的路上。）','語彤：我問了十個問題，他回答了一個。','語彤：……可是那一個很好。'],
      opts:null,tail:[[]],sp:'語彤',abroad:G=>{ VAC.rec(G).reg['C12@Y2']='yes'; }},
    {n:'6',tag:'vf_y2w_0211',th:'p:classmate_xinci',who:'classmate_xinci',lv:'fam',low:'know',day:'2027-02-11',h:21,oid:'vf_y2w_0212',evd:'2027-02-12',evh:10,ev:'ev_vf_y2w_0212',bg:'soymilk_shop',
      ms:['我爸媽的事務所今天開工。我去幫忙。','明天早上十點，永和的豆漿店。我請。'],head:['（永和的豆漿店，早上十點還是滿的。芯慈已經點好了，桌上兩碗鹹豆漿。）','芯慈：我爸說開工第一天要吃熱的。我覺得他只是想吃。'],
      opts:['「事務所開工忙嗎？」','「妳寒假都在幫忙？」'],tail:[['芯慈：忙。我負責發紅包。……我發錯一包，給了我媽。'],['芯慈：一個禮拜。剩下的時間在追劇。……第八集很好看。']],sp:'芯慈',
      abroad:G=>{ t13Over('2027-02-12',3); }} ];   /* 2/11 在臺灣、2/12 出發 */
  const lvSet=(c)=>c.lv==='friend'?{friend:[c.who]}:{fam:[c.who]}, lowSet=c=>c.low==='fam'?{fam:[c.who]}:{know:[c.who]};
  const fixNm=(c,L)=>(L||[]).map(t=>t.replace(nm(c.who)+'：',c.sp+'：'));
  for(const c of DM) await sec(c.n,async()=>{
    let G=lawG(c.day,c.h-3,lvSet(c)); const stop=(VF().stops(G,-1e9)||[]).includes(T(D(c.day),c.h)); setT(c.day,c.h+0.05); rules();
    check(c.n+'. '+c.day+' '+c.h+':00 '+c.sp+'私訊（照稿）＋回覆「好。」；快轉會停在那一刻',J(tagged(c.tag).map(m=>m.from+':'+m.text))===J(c.ms.map(t=>c.who+':'+t))&&J(optsOf(c.tag))===J(['好。'])&&tagged(c.tag).every(m=>PHONE.th(m)===c.th)&&stop,J([tagged(c.tag).map(m=>m.text),stop]));
    answer(c.tag,0); rules(); const q=out(c.oid);
    check(c.n+'. 回「好。」＝排進行事曆：'+c.evd+' '+c.evh+':00（'+c.ev+'）',isAt(q,c.evd,c.evh)&&q.ev===c.ev,J(q));
    const e=ev(c.ev), sc=e?e.dialogue.find(x=>x.scene):null;
    const ks=c.opts?[0,1]:[0]; const res=[]; for(const k of ks){ H.G.flags=Object.assign({},H.G.flags); const L=fixNm(c,await runEv(c.ev,[k])); res.push([J(L)===J(c.head.concat(c.tail[k])),L,H.opts[0]]); }
    check(c.n+'. 場景照稿'+(c.opts?'（兩個選項各一次）':'')+'；背景 '+c.bg,!!e&&res.every(r=>r[0])&&(!c.opts||J(res[0][2])===J(c.opts))&&!!sc&&sc.bg===c.bg,J(res.map(r=>[r[1],r[2]])));
    const words=c.ms.concat(c.head,[].concat(...c.tail),c.opts||[]).map(t=>t.replace(/^(阿凱|語彤|芯慈|老闆)：/,''));
    check(c.n+'. 私訊、場景的句子都在 AA_556',!notIn(words).length,J(notIn(words)));
    /* 條件不到不傳 */
    G=lawG(c.day,c.h+0.05,lowSet(c)); rules(); const a=tagged(c.tag).length;
    G=lawG(c.day,c.h+0.05,lvSet(c)); await awayPres(c.who,async()=>{ rules(); }); const b=tagged(c.tag).length;   /* 芯慈也看（AA-B 11-01 回第 3 題：她那天在臺北才傳）*/
    G=lawG(c.day,c.h-2,lvSet(c)); c.abroad(G); setT(c.day,c.h+0.05); rules(); const d=tagged(c.tag).length; const dOk=c.who==='heroine_03'||!VAC.abroadOn(G,D(c.day));   /* 自己排的出國：私訊那天人在臺灣 */
    check(c.n+'. 條件不到不傳：'+(c.lv==='friend'?'只有有點熟（不到朋友）':'不到有點熟')+(b===null?'':'、那天'+c.sp+'不在臺北')+'、祐廷那天不在臺灣（'+(c.who==='heroine_03'?'京都語言課':'隔天出發的自己排的出國')+'）',a===0&&(b===null||b===0)&&d===0&&dOk,J([a,b,d]));
    if(c.who==='classmate_xinci'){ G=lawG(c.day,c.h+0.05,lvSet(c)); rules();
      check(c.n+'. 芯慈在臺北＝照傳（AA-B 11-01 回第 3 題：她那天在臺北才傳；不在臺北見上一項）',tagged(c.tag).length===2); }
    /* 不回＝不去，不追 */
    G=lawG(c.day,c.h+0.05,lvSet(c)); rules(); const n0=thMsgs(c.th).length; for(const [dd,hh] of [[1,c.evh-1],[1,c.evh+2],[2,12],[5,12]]){ setT(D(c.day)+dd,hh); rules(); }
    check(c.n+'. 不回：不排、不追（之後沒有第二則）',!out(c.oid)&&thMsgs(c.th).length===n0,J(thMsgs(c.th).map(m=>m.text)));
  });
  /* 5-2 記憶、6 不讀寫芯慈戀愛線的旗標 */
  await sec('5-2b',async()=>{
    lawG('2027-08-13',16,{fam:['heroine_03']}); const h0=SOCIAL.has('heroine_03','FIELD_WITH_YT'); await runEv('ev_vf_y2s_0813');
    check('5-2. 演完記 FIELD_WITH_YT（記在語彤身上；人物面板有中文名稱）',!h0&&SOCIAL.has('heroine_03','FIELD_WITH_YT')&&!!(SOCIAL.MEMORY_LABEL||{}).FIELD_WITH_YT);
  });
  await sec('6b',async()=>{
    const G=lawG('2027-02-11',21.05,{fam:['classmate_xinci']}); rules(); answer('vf_y2w_0211',0); rules(); const f0=J(G.flags), r0=J(G.flags.romance||null); setT('2027-02-12',10); await runEv('ev_vf_y2w_0212',[0]);
    const added=Object.keys(G.flags).filter(k=>!(k in JSON.parse(f0)));
    check('6. 芯慈那一場不寫戀愛線的旗標（演完沒有新的 dating／XC／romance 旗標，romance 紀錄不變）',!added.some(k=>/dating|XC|xinci|XINCI|romance|ROM/i.test(k))&&J(G.flags.romance||null)===r0&&!G.flags.dating_classmate_xinci,J(added));
    const src=fs.readFileSync(path.join(H.ROOT,'src/vacfill3d.js'),'utf8'), i=src.indexOf("tag:'vf_y2w_0211'"), seg=i>=0?src.slice(i,src.indexOf('}',src.indexOf('ask:',i))+1):'';
    check('6. 芯慈那一則的條件不讀戀愛線（沒有 dating_、XC、ROM）',!!seg&&!/dating_|XC_|ROM\./.test(seg),seg.slice(0,120));
  });

  /* ======================= 7 其他 ======================= */
  await sec(7,async()=>{
    const ids=['ev_vf_y1s_0624','ev_vf_y2s_0711','ev_vf_y2s_0813','ev_vf_y2w_0212'];
    check('7. 四個新事件都進了 STORY_EVENTS（trigger outing、演一次）',ids.every(id=>{ const e=ev(id); return !!e&&e.trigger==='outing'&&e.once===true; }));
    const X2=typeof VACFILL_LINES2!=='undefined'?J(VACFILL_LINES2):'', X3=J([TV.local||null,TV.friendMid||null]);
    check('7. 新台詞沒有「小語」、沒有真實校名（D115）',!!X2&&!!TV.local&&!/小語|[臺台]大|霖澤|萬才|政大/.test(X2+X3));
  });
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
