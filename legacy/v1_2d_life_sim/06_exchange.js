/* ===== 06 交換學生：申請、出發前、海外學期、返台 ===== */
const EXCH_DEST = {
  us:{ id:'us', name:'Lakeside University', country:'美國', city:'一個湖邊的大學城', lang:'en', langReq:55, gpaReq:78, cost:420000, living:18000, quota:2,
    style:'蘇格拉底式問答，教授會直接點名，先讀完 60 頁判決再上課', vibe:'校園很大，什麼都要開車，超市一次買一週', credits:0.7 },
  jp:{ id:'jp', name:'青葉大學', country:'日本', city:'仙台附近的城市', lang:'ja', langReq:35, gpaReq:74, cost:260000, living:11000, quota:2, altLang:'en', altReq:60,
    style:'講義為主，研討課（ゼミ）要輪流報告', vibe:'腳踏車、便利商店、很安靜的圖書館', credits:0.8 },
  eu:{ id:'eu', name:'Rijnstad University', country:'荷蘭', city:'萊茵河邊的大學城', lang:'en', langReq:50, gpaReq:72, cost:300000, living:13000, quota:3,
    style:'小組討論與報告，英語授課，同學來自二十幾個國家', vibe:'腳踏車、風、廉價航空到處飛', credits:0.8 },
};
const EXCH_BLOCKS=[
  {id:'e1', label:'抵達第1週', weeks:1, tag:'剛到'},
  {id:'e2', label:'第2–3週', weeks:2},
  {id:'e4', label:'第4–5週', weeks:2},
  {id:'e6', label:'第6–7週', weeks:2},
  {id:'e8', label:'第8週', weeks:1, tag:'期中'},
  {id:'e10', label:'第10–11週', weeks:2},
  {id:'e12', label:'第12–13週', weeks:2},
  {id:'e14', label:'最後兩週', weeks:2, tag:'快結束了'},
  {id:'e16', label:'期末與離開', weeks:1, tag:'離開'},
];
const EXCH_ACTS={
  eread:{ id:'eread', name:'讀外語教材', cat:'學習', scene:'abroadClass', pose:'read', desc:'讀得慢，但每週都在變快', energy:-8, stress:3 },
  egroup:{ id:'egroup', name:'小組報告準備', cat:'學習', scene:'abroadClass', pose:'type', desc:'和同學一起，跟不跟得上看語言', energy:-7, stress:4 },
  espeak:{ id:'espeak', name:'課堂發言', cat:'學習', scene:'abroadClass', pose:'stand', desc:'用外語講出自己的法律觀點', energy:-4, stress:6 },
  eevent:{ id:'eevent', name:'法律講座／活動', cat:'學習', scene:'abroadClass', pose:'stand', desc:'探索未來的研究或工作興趣', energy:-4, stress:1 },
  ecity:{ id:'ecity', name:'熟悉城市', cat:'生活', scene:'abroadStreet', pose:'walk', desc:'找教室、搭車、辦手續', energy:-5, stress:-2 },
  ecook:{ id:'ecook', name:'超市與煮飯', cat:'生活', scene:'abroadHome', pose:'sit', desc:'外食太貴了', energy:-3, stress:-3, money:-1200 },
  eout:{ id:'eout', name:'外食與咖啡店', cat:'生活', scene:'abroadStreet', pose:'stand', desc:'貴，但快樂', energy:0, stress:-5, money:-3200 },
  efriend:{ id:'efriend', name:'認識同學', cat:'人際', scene:'abroadStreet', pose:'stand', desc:'當地同學與其他交換生', energy:-3, stress:-4, money:-800 },
  etravel:{ id:'etravel', name:'週末旅行', cat:'人際', scene:'abroadTravel', pose:'walk', desc:'很花錢，但只有現在能去', energy:-6, stress:-10, money:-9000 },
  ecall:{ id:'ecall', name:'半夜和台灣朋友聊天', cat:'人際', scene:'abroadHome', pose:'sit', desc:'時差剛好', energy:-4, stress:-5 },
  ehome:{ id:'ehome', name:'打電話回家', cat:'人際', scene:'abroadHome', pose:'sit', desc:'媽媽問你有沒有吃飽', energy:2, stress:-4 },
  erest:{ id:'erest', name:'什麼都不做', cat:'生活', scene:'abroadHome', pose:'sleep', desc:'看窗外', energy:16, stress:-8 },
  esport:{ id:'esport', name:'運動', cat:'生活', scene:'abroadStreet', pose:'walk', desc:'河邊跑步', energy:5, stress:-6 },
};
const EXCH_ACT_ORDER=['eread','egroup','espeak','eevent','ecity','ecook','eout','efriend','etravel','ecall','ehome','erest','esport'];
function exchTimeLabel(){ const b=EXCH_BLOCKS[G.exch.block]; return '交換・'+EXCH_DEST[G.exch.dest].country+'・'+(b?b.label:''); }
function exchScore(){ const p=G.player; const gpa=gpaAll(); return {gpa, en:p.skills.lang.en, ja:p.skills.lang.ja, app:G.exch.app}; }
function exchEligible(d){ const s=exchScore(); const p=G.player; const langOK= (p.skills.lang[d.lang]||0)>=d.langReq || (d.altLang&&(p.skills.lang[d.altLang]||0)>=d.altReq); return {gpa:s.gpa>=d.gpaReq, lang:langOK}; }
function exchDecideApply(prefs){ G.exch.decided='yes'; G.exch.prefs=prefs; G.exch.applied=false; setFlag('exch_interest'); G.sched=[]; G.screen='plan'; save(); }
function exchDecideSkip(){ G.exch.decided='no'; setFlag('exch_skip'); diary('決定不申請交換，把大三留給台灣的生活。'); G.sched=[]; G.screen='plan'; save(); }
function exchSubmit(){ G.exch.applied=true; setFlag('exch_applied'); diary('送出交換申請：'+G.exch.prefs.map(k=>EXCH_DEST[k].name).join(' → ')); }
function exchResolveApplication(){
  G.exch.resultShown=true; const p=G.player; const gpa=gpaAll();
  const strength=gpa*0.5+Math.max(p.skills.lang.en,p.skills.lang.ja)*0.25+G.exch.app*0.25;
  let got=null; const notes=[];
  for(const k of G.exch.prefs){ const d=EXCH_DEST[k]; const el=exchEligible(d); if(!el.gpa){ notes.push(d.name+'：成績未達門檻。'); continue; } if(!el.lang){ notes.push(d.name+'：語言未達門檻。'); continue; }
    const need=d.gpaReq*0.5+d.langReq*0.25+40*0.25; const pr=clamp(0.55+(strength-need)/40,0.15,0.95)*(d.quota>=3?1:0.9);
    if(chance(pr)){ got=k; notes.push(d.name+'：錄取。'); break; } else notes.push(d.name+'：名額有限，這次沒有排到。'); }
  G.exch.result=got; G.exch.notes=notes; G.exch.scholar= gpa>=85?150000:gpa>=80?60000:0;
  if(got){ G.exch.dest=got; }
}
function exchAccept(financing){
  const d=EXCH_DEST[G.exch.dest]; G.exch.going=true; setFlag('exch_go'); G.player.money+=G.exch.scholar||0;
  if(financing==='loan'){ G.exch.loan=Math.round(d.cost*0.6); G.player.money+=G.exch.loan; }
  if(financing==='family'){ G.player.money+=Math.round(d.cost*0.7); addRel('mom',-2); }
  G.player.money-=Math.round(d.cost*0.45); // 學費／機票／保證金
  diary('決定去'+d.country+'交換。'); G.screen='grades'; G.pendingEvent=null; save();
}
function exchDecline(){ G.exch.going=false; setFlag('exch_skip'); diary('錄取了，但決定不去。'); G.screen='grades'; G.pendingEvent=null; save(); }
// 出發前
const EXCH_PREP=[
  { id:'house', q:'住宿', opts:[
    {t:'學校宿舍：貴，但第一天就有床', fx:g=>{ g.exch.house='dorm'; g.player.money-=25000; g.exch.adapt+=10; } },
    {t:'和其他交換生分租：便宜，但要自己找', fx:g=>{ g.exch.house='share'; g.player.money-=8000; g.exch.friends+=8; g.exch.adapt-=5; } },
    {t:'寄宿家庭：語言進步最快，自由最少', fx:g=>{ g.exch.house='host'; g.player.money-=15000; g.player.skills.lang[EXCH_DEST[g.exch.dest].lang]+=6; g.exch.homesick+=5; } } ]},
  { id:'course', q:'選課', opts:[
    {t:'法律課為主：回來比較好抵免，但很硬', fx:g=>{ g.exch.courseMix='law'; g.exch.creditPlan+=0.15; } },
    {t:'語言與文化課為主：輕鬆，抵免少', fx:g=>{ g.exch.courseMix='lang'; g.exch.creditPlan-=0.15; g.exch.adapt+=5; } },
    {t:'混搭：一門法律研討課加兩門通識', fx:g=>{ g.exch.courseMix='mix'; } } ]},
  { id:'credit', q:'學分抵免', opts:[
    {t:'出發前先把抵免申請表跑完，找教授簽名', fx:g=>{ g.exch.creditPlan+=0.15; g.player.energy-=6; } },
    {t:'回來再說', fx:g=>{ g.exch.creditPlan-=0.1; } } ]},
  { id:'pack', q:'行李', opts:[
    {t:'帶電鍋和一整盒台灣泡麵', fx:g=>{ g.exch.homesick-=8; g.exch.adapt+=3; } },
    {t:'輕裝，到了再買', fx:g=>{ g.player.money-=6000; } } ]},
  { id:'bye', q:'告別', opts:[
    {t:'和小安、阿哲吃一頓很長的飯', fx:g=>{ addRel('an',5); addRel('zhe',5); } },
    {t:'回家住一週', fx:g=>{ addRel('mom',8); g.player.energy+=10; } },
    {t:'和小語談遠距要怎麼過', when:g=>!!g.flags.yu_partner, fx:g=>{ addRel('yu',6); g.exch.ldr=true; } } ]},
];
function exchBegin(){
  G.phase='exch'; G.ctx='exch'; G.exch.block=0; G.exch.adapt=(G.exch.adapt||0)+15; G.exch.homesick=(G.exch.homesick||0)+20; G.exch.friends=G.exch.friends||0; G.exch.course=10; G.exch.creditPlan=G.exch.creditPlan||0; G.exch.memories=[]; G.exch.prepIdx=0;
  G.enrolled=[]; G.screen='exchPrep'; save();
}
function exchPrepChoose(optIdx){
  const step=EXCH_PREP[G.exch.prepIdx]; const opt=step.opts.filter(o=>!o.when||o.when(G))[optIdx]; if(opt) opt.fx(G);
  G.exch.prepIdx++; while(G.exch.prepIdx<EXCH_PREP.length&&EXCH_PREP[G.exch.prepIdx].opts.filter(o=>!o.when||o.when(G)).length===0) G.exch.prepIdx++;
  if(G.exch.prepIdx>=EXCH_PREP.length){ G.screen='exchDepart'; }
  save();
}
function exchStart(){ G.sched=[]; G.screen='plan'; save(); }
function exchActs(){ return EXCH_ACT_ORDER.map(k=>EXCH_ACTS[k]); }
function exchFreeSlots(){ return 6; }
function exchPreview(){
  const lines=[]; let en=0,st=0,mo=0; const d=EXCH_DEST[G.exch.dest];
  for(const s of G.sched){ const a=EXCH_ACTS[s.act]; if(!a) continue; en+=a.energy; st+=a.stress; mo+=a.money||0; }
  const acts=G.sched.map(s=>s.act);
  if(acts.some(a=>['eread','egroup','espeak'].includes(a))) lines.push('課業進度 <span class="arrow">↑</span>，'+(d.lang==='ja'?'日文':'英文')+' <span class="arrow">↑</span>');
  if(acts.some(a=>['ecity','ecook','efriend','etravel'].includes(a))) lines.push('適應 <span class="arrow">↑</span>');
  if(acts.some(a=>['ecall','ehome','etravel','ecook'].includes(a))) lines.push('想家 <span class="arrow d">↓</span>');
  if(!acts.some(a=>['eread','egroup','espeak'].includes(a))&&G.sched.length>=3) lines.push('<span class="arrow d">這段時間完全沒碰課業。</span>');
  lines.push('精力 '+(en>=0?'+':'')+en+'　壓力 '+(st>=0?'+':'')+st+'　金錢 '+money(mo)+'（生活費另計 −'+money(d.living)+'）');
  if(G.player.money+mo-d.living<20000) lines.push('<span class="arrow d">預算開始不足。</span>');
  return lines;
}
function exchResolve(){
  const b=EXCH_BLOCKS[G.exch.block]; const d=EXCH_DEST[G.exch.dest]; const p=G.player; const x=G.exch; const L=d.lang; G.log=[];
  pushLog({kind:'n',scene:'abroadStreet',pose:'walk',t:exchTimeLabel()+(b.tag?'（'+b.tag+'）':'')});
  const langLv=p.skills.lang[L]||0;
  pushLog({kind:'n',scene:'abroadClass',pose:'sit',t:'上課：'+(langLv<45?'聽得懂七成，講義要回家重讀。':langLv<70?'跟得上，偶爾要查字。':'已經可以邊聽邊記筆記了。')+' '+d.style+'。'});
  x.course=clamp(x.course+2*(b.weeks||2),0,100); p.skills.lang[L]=clamp(langLv+1.5*(b.weeks||2),0,100);
  for(const s of G.sched){ const a=EXCH_ACTS[s.act]; if(!a) continue; let t='';
    switch(a.id){
      case 'eread': p.skills.lang[L]=clamp(p.skills.lang[L]+2.5,0,100); x.course=clamp(x.course+6,0,100); p.skills.research+=0.8; t= langLv<40?'一頁讀了二十分鐘。你把不懂的字寫在旁邊，第二次看到的時候居然認得。':'讀教材的速度變快了。'; break;
      case 'egroup': x.course=clamp(x.course+7,0,100); x.friends=clamp(x.friends+4,0,100); t= langLv<45?'小組討論你只聽懂一半，負責做投影片。':'你負責報告的一段，同學說你講得很清楚。'; if(langLv<45) x.homesick+=3; break;
      case 'espeak': if(langLv>=50){ p.skills.express+=2; x.course+=4; p.skills.lang[L]+=2; if(!G.flags.exch_speak){ setFlag('exch_speak'); t='今天你第一次用外語完整講出自己的法律觀點。講完的時候手在抖，但教授說「Good point」。'; } else t='課堂發言。你發現自己已經不用先在心裡翻譯了。'; } else { p.stress+=4; p.skills.lang[L]+=1.5; t='舉了手，講到一半找不到那個字。教授等你，全班等你。你說了「sorry」然後坐下。下次再來。'; } break;
      case 'eevent': p.skills.research+=1.5; p.skills.judgment+=1; x.friends+=2; if(!x.interest&&chance(.5)){ x.interest=pick(['國際商務','人權與難民','比較憲法','科技與法律']); t='去聽了一場關於'+x.interest+'的講座。你走出來的時候，覺得未來好像多了一種可能。'; setFlag('exch_interest_'+x.interest); } else t='講座。內容一半聽懂，另一半靠投影片。'; break;
      case 'ecity': x.adapt=clamp(x.adapt+8,0,100); t= x.adapt<40?'你找教室找了二十分鐘，還搭錯一次公車。':'你已經知道哪一班車比較不擠了。'; break;
      case 'ecook': x.adapt=clamp(x.adapt+4,0,100); x.homesick=clamp(x.homesick-4,0,100); t='超市。你認出了三種蔬菜，煮了一鍋自己也說不上來是什麼的東西。很好吃。'; break;
      case 'eout': x.adapt=clamp(x.adapt+2,0,100); t='咖啡店坐了一下午。帳單讓你決定下週開始自己煮。'; if(!G.flags.exch_broke&&p.money<40000){ setFlag('exch_broke'); } break;
      case 'efriend': x.friends=clamp(x.friends+7,0,100); x.adapt+=3; x.homesick=clamp(x.homesick-3,0,100); if(x.friends>=30&&!G.flags.exch_friend){ setFlag('exch_friend'); t='你和一個來自另一個國家的交換生變成固定一起吃飯的人。你們的共同語言都是第二語言，反而講得很開。'; } else t='認識了新的人。名字唸了三次才對。'; break;
      case 'etravel': x.adapt+=4; x.homesick=clamp(x.homesick-8,0,100); x.course=clamp(x.course-3,0,100); { const place=pick(d.id==='us'?['另一個州的國家公園','一座大城市','湖邊'] : d.id==='jp'?['京都','一個溫泉小鎮','東京']:['巴黎','柏林','一個聽不出名字的小鎮']); x.memories.push(place); t='週末去了'+place+'。回來的火車上你想，這件事以後大概會常常想起。'; } break;
      case 'ecall': x.homesick=clamp(x.homesick-7,0,100); addRel('an',2); addRel('zhe',2); if(G.flags.yu_partner) addRel('yu',4); p.energy-=2; t='半夜兩點，台灣是早上九點。你們聊了一小時完全沒有意義的事情。很好。'; break;
      case 'ehome': addRel('mom',4); x.homesick=clamp(x.homesick-5,0,100); t='媽媽問你有沒有吃飽，然後把手機轉給每一個在場的親戚。'; break;
      case 'erest': t='什麼都不做。窗外的光跟台灣不一樣。'; break;
      case 'esport': t='河邊跑步。跑步的時候不需要語言。'; break;
    }
    p.energy=clamp(p.energy+a.energy,0,100); p.stress=clamp(p.stress+a.stress,0,100); if(a.money) p.money+=a.money;
    pushLog({kind:['eread','egroup','espeak','eevent'].includes(a.id)?'gain':'line',scene:a.scene,pose:a.pose,t});
  }
  // 被動
  p.energy=clamp(p.energy+7*(b.weeks||2),0,100); p.stress=clamp(p.stress-2*(b.weeks||2),0,100); p.money-=d.living*(b.weeks||2)/2; x.homesick=clamp(x.homesick+2*(b.weeks||2)-(x.friends>40?2:0),0,100);
  if(G.flags.yu_partner&&!G.sched.some(s=>s.act==='ecall')) addRel('yu',-3);
  for(const cid in G.courses){ const c=G.courses[cid]; c.r=clamp(c.r-0.5*(b.weeks||2),0,100); }
  G.time.absWeek+=(b.weeks||2);
  pushLog({kind:'n',scene:'abroadHome',pose:'sit',t:'生活費 −'+money(d.living*(b.weeks||2)/2)+'。餘額 '+money(p.money)+' 元。'+(p.money<30000?' 預算開始不足了。':'')});
  G.pendingEvent=pickEvent(EXCH_EVENTS); save();
}
function exchReport(){
  const x=G.exch; x.adapt=clamp(x.adapt,0,100); x.homesick=clamp(x.homesick,0,100); x.friends=clamp(x.friends,0,100); x.course=clamp(x.course,0,100); const d=EXCH_DEST[G.exch.dest]; const lines=[]; const goals=[];
  lines.push('適應：'+(x.adapt>=70?'已經像住在這裡的人':x.adapt>=40?'慢慢習慣中':'還在狼狽')+'　想家：'+(x.homesick>=60?'很想':x.homesick>=30?'偶爾':'還好'));
  lines.push('課業：'+(x.course>=70?'跟得上，還有餘裕':x.course>=40?'勉強跟上':'落後了')+'　'+(d.lang==='ja'?'日文':'英文')+'：'+Math.round(G.player.skills.lang[d.lang]));
  if(x.friends>=30) lines.push('這裡有了固定一起吃飯的人。');
  if(x.memories.length) lines.push('去過的地方：'+x.memories.join('、'));
  const left=EXCH_BLOCKS.length-1-G.exch.block; if(left<=3) goals.push('只剩 '+left+' 段時間。想去的地方、想見的人、還沒交的報告。'); else goals.push('期末報告和考試佔成績大半，課業進度不要掉。');
  if(G.player.money<40000) goals.push('錢不多了。自己煮、少旅行，或打電話回家。');
  return {lines,goals};
}
function exchNext(){
  G.exch.block++; if(G.exch.block>=EXCH_BLOCKS.length){ exchFinish(); return; }
  G.sched=[]; G.screen='plan'; save();
}
function exchFinish(){
  const x=G.exch; const d=EXCH_DEST[x.dest]; const p=G.player;
  const grade=clamp(55+x.course*0.4+(p.skills.lang[d.lang]||0)*0.1+rnd(-3,5),40,100);
  const creditRatio=clamp(d.credits+x.creditPlan+(x.course>=60?0:-0.15),0.3,1);
  x.finalGrade=Math.round(grade); x.creditRatio=creditRatio; x.done=true; x.langAtReturn=p.skills.lang[d.lang];
  if(creditRatio<0.7) { G.retake.push('exchMakeup'); }
  G.semesters.push({y:3,s:1,avg:x.finalGrade,rows:[{name:'交換學期（'+d.name+'）',g:x.finalGrade}]});
  diary('交換結束：'+d.country+'一個學期，'+(x.friends>=30?'交到了朋友，':'')+(x.memories.length?'去了'+x.memories.length+'個地方，':'')+'學分抵免約 '+Math.round(creditRatio*100)+'%。');
  G.screen='exchReturn'; save();
}
function exchReturnDone(){
  G.phase='uni'; G.ctx='uni'; G.time.year=3; G.time.sem=2; G.enrolled=[]; const ri=G.retake.indexOf('exchMakeup'); if(ri>=0){ G.retake.splice(ri,1); G.retake.push('makeup'); }
  G.screen='enroll'; save();
}
// 交換事件
const EXCH_EVENTS=[
  { id:'x_market', title:'第一次去超市', scene:'abroadStreet', once:true, weight:100, when:()=>G.phase==='exch'&&G.exch.block===0,
    lines:[L('n','超市很大。你站在牛奶區前面，有六種你分不出差別的牛奶。'),L('n','結帳的時候店員問了一句話，你沒聽懂，說了「yes」。她給了你一個很大的袋子。')],
    options:[ {label:'買了一週的份量，回去研究標籤', do:()=>{ G.exch.adapt+=6; return [L('n','你回住處用翻譯 App 看了每一個標籤。其中一罐是優格，不是牛奶。')]; }},
      {label:'先買泡麵和水，之後再說', do:()=>{ G.exch.homesick-=3; G.player.money-=500; return [L('n','泡麵的味道不對。但夠了。')]; }} ]},
  { id:'x_bus', title:'搭錯車', scene:'abroadStreet', once:true, weight:80, when:()=>G.phase==='exch'&&G.exch.block<=1,
    lines:[L('n','上課第一天。你搭了跟昨天一樣號碼的車，往反方向開。'),L('n','二十分鐘後你在一個完全不認識的地方。手機只剩 12%。')],
    options:[ {label:'下車，問路，用走的', do:()=>{ G.exch.adapt+=8; G.player.energy-=6; return [L('n','你問了三個人。第三個人剛好也是要去學校的學生。你遲到了四十分鐘，但認識了一條路。')]; }},
      {label:'坐回終點站再搭回來', do:()=>{ G.exch.adapt+=3; return [L('n','你錯過了第一堂課。教授說沒關係，然後給你一份 40 頁的補充閱讀。')]; }} ]},
  { id:'x_roommate', title:'室友', scene:'abroadHome', once:true, weight:80, when:()=>G.phase==='exch'&&G.exch.block>=1&&G.exch.block<=2&&G.exch.house!=='host',
    lines:[L('n','室友在廚房煮東西，味道很重。'),L('n','「你也是交換生？」他問。你說是。他說他來自另一個大陸，念經濟，也不知道為什麼會來這裡。')],
    options:[ {label:'一起吃，交換各自國家的事', do:()=>{ G.exch.friends+=10; G.exch.homesick-=4; return [L('n','你們聊到凌晨一點。他說他也想家。你發現想家是一個國際共通的東西。')]; }},
      {label:'客氣地聊兩句，回房間', do:()=>{ G.exch.friends+=2; return [L('n','你們之後在廚房遇到會點頭。也不錯。')]; }} ]},
  { id:'x_group_lost', title:'小組討論', scene:'abroadClass', once:true, weight:90, when:()=>G.phase==='exch'&&G.exch.block>=2&&G.exch.block<=3,
    lines:[L('n','小組討論。四個人講話都很快，你聽懂大意，但每次想插話的時候，話題已經到下一個了。'),L('n','有人問你：「你們國家怎麼處理這個問題？」')],
    options:[ {label:'慢慢講，講不完整也講', do:()=>{ const L2=EXCH_DEST[G.exch.dest].lang; G.player.skills.lang[L2]+=3; G.player.skills.express+=1.5; G.exch.friends+=4; G.player.stress+=3; return [L('n','你講了三句，中間停了兩次。組員等你講完，然後有人說「that\'s interesting」。你不確定是客套還是真的，但你講完了。')]; }},
      {label:'「我下次再整理給你們。」然後真的回去整理', do:()=>{ G.exch.course+=5; G.player.skills.research+=1; return [L('n','你回去寫了一頁英文，下週帶去。組員真的看了。')]; }} ]},
  { id:'x_travel_vs_report', title:'週末', scene:'abroadStreet', once:true, weight:80, when:()=>G.phase==='exch'&&G.exch.block>=3&&G.exch.block<=5,
    lines:[L('n','同學邀你週末去另一個城市。「只有這個週末有便宜車票。」'),L('n','下週三要交報告，你寫了三分之一。')],
    options:[ {label:'去，在火車上寫報告', do:()=>{ G.exch.memories.push('和同學一起去的城市'); G.exch.friends+=6; G.exch.homesick-=6; G.player.money-=7000; G.player.energy-=8; G.exch.course-=2; return [L('n','火車上寫了兩段，其他時間在看窗外。報告交出去的時候，你覺得沒有很好，但你記得那個週末。')]; }},
      {label:'留下來把報告寫完', do:()=>{ G.exch.course+=8; G.exch.friends-=2; return [L('n','報告寫得很完整。週日晚上你看到他們的照片。你告訴自己下次會去。')]; }} ]},
  { id:'x_broke', title:'帳戶', scene:'abroadHome', once:true, weight:100, when:()=>G.phase==='exch'&&G.player.money<45000&&G.exch.block>=3,
    linesFn:()=>[L('n','你看了一下帳戶：'+money(G.player.money)+' 元。'),L('n','還有 '+(EXCH_BLOCKS.length-1-G.exch.block)+' 段時間。你把這週的外食全部劃掉。')],
    options:[ {label:'開始自己煮，取消下一趟旅行', do:()=>{ setFlag('exch_broke'); G.exch.adapt+=5; G.player.money+=3000; return [L('n','你學會了三道菜。室友說你煮的比餐廳好吃，你知道他在客氣，但還是很高興。')]; }},
      {label:'打電話回家', do:()=>{ addRel('mom',3); G.player.money+=25000; G.player.stress+=3; return [L('mom','你要早講啊。'),L('n','匯款進來的時候，你在超市裡把剛放回去的水果又拿了回來。')]; }} ]},
  { id:'x_used_to', title:'某一天', scene:'abroadStreet', once:true, weight:90, when:()=>G.phase==='exch'&&G.exch.block>=5&&G.exch.adapt>=50,
    lines:[L('n','某一天下課，你走到車站，上車，坐下，拿出書。'),L('n','過了兩站你才發現，剛才你完全沒有想這件事。你已經習慣這座城市了。')],
    options:[ {label:'把這件事記下來', do:()=>{ G.exch.homesick=clamp(G.exch.homesick-10,0,100); setFlag('exch_settled'); return [L('n','你在手機備忘錄寫了一句話。多年後你還會偶爾翻到它。')]; }} ]},
  { id:'x_ldr', title:'時差', scene:'abroadHome', once:true, weight:90, when:()=>G.phase==='exch'&&G.flags.yu_partner&&G.exch.block>=3,
    lines:[L('yu','你最近都很晚回訊息。'),L('you','這裡是白天的時候你在睡。'),L('yu','我知道。我只是說一下。'),L('n','螢幕上「輸入中」出現又消失。')],
    options:[ {label:'訂一個固定通話時間，每週兩次', do:()=>{ addRel('yu',8); G.exch.ldr=true; return [L('yu','好。'),L('n','週三和週日。有時候沒什麼好講，還是講了。')]; }},
      {label:'「等我回去再說。」', do:()=>{ addRel('yu',-12); return [L('yu','好。'),L('n','這個「好」你看了很久。')]; }} ]},
  { id:'x_ending_soon', title:'快結束了', scene:'abroadStreet', once:true, weight:100, when:()=>G.phase==='exch'&&G.exch.block>=7,
    lines:[L('n','還有兩週。你開始算：想去的地方、想見的人、還沒交的報告。'),L('n','室友問你要不要最後再去一趟哪裡。')],
    options:[ {label:'去，錢再想辦法', do:()=>{ G.exch.memories.push('最後一趟旅行'); G.player.money-=8000; G.exch.homesick-=5; G.exch.friends+=4; return [L('n','那趟旅行你幾乎沒拍照。你想記住的東西不在照片裡。')]; }},
      {label:'留下來，把報告寫好，和這裡的人多吃幾頓飯', do:()=>{ G.exch.course+=8; G.exch.friends+=6; return [L('n','最後一週你們每天一起煮飯。有一天大家都沒說話，只是在吃。')]; }} ]},
  { id:'x_souvenir', title:'紀念品', scene:'abroadStreet', once:true, weight:100, when:()=>G.phase==='exch'&&G.exch.block>=8,
    lines:[L('n','你在市集買了紀念品。給小安一個很實用的東西，給阿哲一個很沒用的東西，給媽媽一個她會放在櫃子上的東西。'),L('n','行李箱關不起來。你把一本書拿出來，決定留在這裡。')],
    options:[ {label:'把書留給室友', do:()=>{ G.exch.friends+=5; setFlag('exch_left_book'); return [L('n','他說他不會讀，但會放在書架上。你們約好以後有機會再見。你們都知道「有機會」是什麼意思，也都希望是真的。')]; }} ]},
];
