/* ===== BB 事件包的時間、條件、手機訊息（事件在 src/data/bbpack_events.js；規格版本寫在那個檔的開頭）=====
   一天擲一次的機率（偶遇）：照「日子＋名字」算（同一天重進場景結果一樣，存讀檔也一樣）。
   手機（STORY.PHONE_RULES）：
     B6  大二上第 5 週週六 20:00 芯慈私訊（有她的聯絡方式）；講座 18:30 以前都會補上
     SK09 沒去：B6 那天 21:00 麵店團群組芯慈兩則（有 ECON_LAW_BRIDGE、沒看到 SK09）
     B7  大二下第 6 週週一 21:00 語彤在麵店團群組轉海報（認識她）
     B12 大三上第 10 週週一 21:00 以安在麵店團群組
     SK08 大二上第 1 週週三 12:00 阿勳私訊；沒去＝21:00 大合照
     SK10 每學期第 6、15 週週一 21:00 芯慈在「一題換一題」小群組（ECON_LAW_BRIDGE 以後建立）；那一場沒去＝SK10_MISSED（下一次唐睿一句）
     G4c 日文上、日文下第 15 週週日 20:00 日文班群組；沒去＝第 16 週週一 12:00 采蓁一句
     D5  公法讀書會的前一天（週三）20:00 公法讀書會群組，冷卻四週（大一上第 10 週～大二上，沛珊 12/17 休學以前）
   課堂（CLS.IN_CLASS）：G1 第一次去上日文那一堂、G6 日文下第 10 週那一堂。
   測試：node tests/bbpack_unit.js */
'use strict';
const BBPACK=(function(){
  const S={};
  const PS='classmate_peishan', AN='heroine_01', YT='heroine_03', ZR='heroine_02', XC='classmate_xinci';
  const law=G=>!!G&&(G.stage||'law')==='law';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const knows=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const stageAt=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return false; const L=SOCIAL.STAGES; return L.indexOf(SOCIAL.stage(id))>=L.indexOf(min); };
  const term=G=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
  const TD=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDayIn?STORY.termDayIn(t,w,wd):null;   /* wd：1＝週一 … 7＝週日 */
  const now=G=>G.day*24+(+G.hour||0);
  const hash=s=>{ let x=2166136261; for(let i=0;i<s.length;i++){ x^=s.charCodeAt(i); x=Math.imul(x,16777619); } x^=x>>>13; x=Math.imul(x,1274126177); x^=x>>>16; return (x>>>0)/4294967296; };
  S.roll=(G,salt)=>hash(G.day+':'+salt);
  S.here=(id,G)=>{ const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,G):null; return !(p&&p.here===false); };
  S.away=(id,G)=>!!(typeof STORY!=='undefined'&&STORY.awayNow&&STORY.awayNow(id,G));
  S.abroad=G=>!!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G));
  S.beforeKey=(G,k)=>{ const d=D(k); return d!=null&&G.day<d; };
  S.knowXun=G=>!!(G.flags.MET_XUN||G.flags.PLAYED_Y0);   /* 認識阿勳：法律系時期見過，或玩過經濟系那一年（室友）*/
  S.attendN=(G,cid)=>{ const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):(G.courses||{}); return ((R&&R.attend)||{})[cid]|0; };
  S.tookJp=G=>S.attendN(G,'japanese_1')>0||S.attendN(G,'japanese_2')>0;
  S.famZR=G=>knows(ZR)&&stageAt(ZR,'FAMILIAR')&&S.here(ZR,G);
  S.bowled=G=>done(G,'ev_y0_r7');   /* R7 保齡球再戰（BB_104 E33）打過 */
  S.coupleOn=G=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[PS]; return !!(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn&&STORY.partnerOn(G,c.partner))&&S.here(PS,G)&&S.here('classmate_bohan',G); };
  /* ---------------- 日文班 ---------------- */
  S.g3Next=G=>{ const L=Array.isArray(G.flags.JP_G3_USED)?G.flags.JP_G3_USED:[]; for(let n=1;n<=5;n++) if(!L.includes(n)) return n; return null; };
  S.jpJoin=G=>{ if(typeof PHONE!=='undefined') PHONE.join(G,'jp_class','日文班'); };
  S.jpPost=(G,name,text)=>{ if(typeof PHONE==='undefined') return; S.jpJoin(G); const t=term(G); PHONE.at(G,G.day,(+G.hour||0)+0.5,[{th:'g:jp_class',name,text}],'jp_g4b_no_'+(t?t.id:G.day)); };
  /* ---------------- 博雅 ---------------- */
  S.b10Open=G=>{ const L=[['zhe','zhe'],['yu','yu'],['classmate_bohan','bohan']].filter(([id])=>knows(id)).map(x=>x[1]); return L.length?L[(G.flags.B10_N|0)%L.length]:null; };
  S.bohanIn=G=>{ const t=term(G); return !!t&&(t.id==='Y4S2'||(t.id==='Y4S1'&&t.week>=12)); };   /* 推甄放榜（大四上第 12 週）以後 */
  const RATE={two:'一換二',one:'一換一',snack:'宵夜本位'}, NUM=['一','二','三','四','五','六','七','八','九','十'];
  /* SK10 的匯率紀錄 → B10 那一句（AA_153 第 6 節：「以前這張桌子，經濟系那幾個也在。一題民法換 {rate} 題微積分。」；只有一筆＝「那一次是一換二。」照那一筆換字；
     不一樣的好幾筆＝照 BB_106 SK10 的例子只講變的那幾次：「第一次一換二，第三次一換一，最後是宵夜本位。」）*/
  S.rateLine=G=>{ const R=(Array.isArray(G.flags.STUDY_EXCHANGE_RATE)?G.flags.STUDY_EXCHANGE_RATE:[]).map(x=>x&&x.r).filter(r=>RATE[r]); if(!R.length) return null;
    const head='以前這張桌子，經濟系那幾個也在。';
    if(R.length===1) return head+'那一次是'+RATE[R[0]]+'。';
    if(R.every(r=>r===R[0])) return head+(R[0]==='snack'?'每一次都是宵夜本位。':'一題民法換'+(R[0]==='two'?'兩':'一')+'題微積分。');
    const parts=['第一次'+RATE[R[0]]]; for(let i=1;i<R.length;i++){ if(R[i]===R[i-1]) continue; parts.push((i===R.length-1?'最後是':'第'+NUM[i]+'次')+RATE[R[i]]); } return head+parts.join('，')+'。'; };
  S.b4State=G=>{ if(typeof ACTIVITIES==='undefined') return 'missed'; return ACTIVITIES.attended(G,'B4')?'full':(ACTIVITIES.attendedAny(G,'B4')?'partial':'missed'); };
  const B5T={ask_them:'最小，要問被限制的人',trade:'最小，要看大家換到了什麼',where:'我還不知道。我想知道他最後去了哪裡'};
  S.b5Text=G=>B5T[G.flags.B5_THOUGHT]||null;
  S.b12Who=G=>(knows(AN)&&stageAt(AN,'FAMILIAR'))?'an':(knows('yu')?'yu':null);
  S.b12Due=G=>law(G)&&!!S.b12Who(G)&&(S.b4State(G)!=='full'||!!S.b5Text(G));
  S.b13Due=G=>{ if(!law(G)) return false; const t=term(G); if(!t||t.exam) return false; if(t.id==='Y2S1'&&!S.beforeKey(G,'2026-12-17')) return false; return S.here(PS,G)&&S.roll(G,'b13')<0.2; };
  S.b13Line=G=>{ const t=term(G)||{}, plgA=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list.find(a=>a.id==='public_law_group'), plg=!!(plgA&&ACTIVITIES.on(plgA,G.day+1,G));
    const L=['quiet'].concat(plg?['plg']:[],t.id==='Y1S1'?['phil']:['edu']).filter(k=>k!==G.flags.B13_LAST); return L[Math.floor(S.roll(G,'b13l')*L.length)%L.length]; };
  /* ---------------- 女舍門口 ---------------- */
  S.d4cUsed=G=>Array.isArray(G.flags.D4C_USED)?G.flags.D4C_USED:[];
  S.d4cDue=G=>{ if(!law(G)) return false; const U=S.d4cUsed(G); if(U.length>=3) return false;
    const went=done(G,'ev_b105_d4_notes')||(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny(G,'public_law_group'));
    return went&&knows(AN)&&S.here(PS,G)&&S.here(AN,G)&&S.roll(G,'d4c')<0.5; };
  S.d4cPick=G=>{ const U=S.d4cUsed(G), L=[1,2,3,4].filter(n=>!U.includes(n)); return L.length?L[Math.floor(S.roll(G,'d4cq')*L.length)%L.length]:1; };
  S.d8Due=G=>law(G)&&!!term(G)&&!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday&&CALENDAR.holiday(G.day))&&S.roll(G,'d8')<0.1;
  /* ---------------- 普通教學館前（P5）---------------- */
  const P5ID={wl:'econ_weilun',py:'econ_pinyu',xun:'econ_zhengxun',tr:'econ_tangrui'};
  S.p5Pick=G=>{ const used=Array.isArray(G.flags.P5_USED)?G.flags.P5_USED:[]; const L=['wl','py','xun','tr'].filter(k=>!used.includes(k)&&S.here(P5ID[k],G)&&!S.away(P5ID[k],G)); return L.length?L[Math.floor(S.roll(G,'p5w')*L.length)%L.length]:null; };
  S.p5Due=G=>{ if(!law(G)) return false; const t=term(G); if(!t||t.exam) return false; const T=Array.isArray(G.flags.P5_TERMS)?G.flags.P5_TERMS:[]; if(T.includes(t.id)) return false; return S.roll(G,'p5')<0.3&&!!S.p5Pick(G); };
  S.p5Done=(G,who)=>{ const t=term(G); if(!who||!t) return; const U=Array.isArray(G.flags.P5_USED)?G.flags.P5_USED:(G.flags.P5_USED=[]), T=Array.isArray(G.flags.P5_TERMS)?G.flags.P5_TERMS:(G.flags.P5_TERMS=[]); if(!U.includes(who)) U.push(who); if(!T.includes(t.id)) T.push(t.id); };
  /* ---------------- SK10 ---------------- */
  const skKey=G=>{ const t=term(G); return t?t.id+'_'+t.week:null; };
  S.sk10Rec=G=>Array.isArray(G.flags.STUDY_EXCHANGE_RATE)?G.flags.STUDY_EXCHANGE_RATE:[];
  S.sk10Neg=G=>{ const t=term(G); return !!t&&!S.sk10Rec(G).some(x=>x&&x.t===t.id); };
  S.sk10Due=G=>{ if(!law(G)||S.abroad(G)) return false; const k=skKey(G); if(!k||typeof PHONE==='undefined'||!PHONE.sent(G,'bb_sk10_'+k)) return false; const DN=Array.isArray(G.flags.SK10_DONE)?G.flags.SK10_DONE:[]; if(DN.includes(k)) return false;
    return S.sk10Neg(G)||!!(G.flags.STICKY_NOTES||G.flags.TRANSLATOR||G.flags.SK10_MISSED); };
  S.sk10Done=G=>{ const k=skKey(G), t=term(G); const DN=Array.isArray(G.flags.SK10_DONE)?G.flags.SK10_DONE:(G.flags.SK10_DONE=[]); if(k&&!DN.includes(k)) DN.push(k);
    if(G.flags.SK10_RATE&&t){ const R=Array.isArray(G.flags.STUDY_EXCHANGE_RATE)?G.flags.STUDY_EXCHANGE_RATE:(G.flags.STUDY_EXCHANGE_RATE=[]); if(!R.some(x=>x&&x.t===t.id)) R.push({t:t.id,r:G.flags.SK10_RATE}); } delete G.flags.SK10_RATE; };
  /* ---------------- 可昕和品妤在社科院門口（BB_106 第 389 行）---------------- */
  S.l389Q=G=>typeof OUT==='undefined'?null:OUT.rec(G).find(q=>/^kx_od_/.test(q.id)&&q.state==='planned'&&q.odPlace==='ntu'&&q.day===G.day&&q.h-(+G.hour||0)>=0.25-1e-6&&q.h-(+G.hour||0)<=1+1e-6)||null;
  S.l389Due=G=>law(G)&&G.flags.dating_kexin===true&&!done(G,'ev_kx_pinyu_soc')&&S.beforeKey(G,'2028-07-01')&&!!S.l389Q(G)&&S.here('econ_pinyu',G)&&!S.away('econ_pinyu',G);

  /* ---------------- 手機 ---------------- */
  const P=()=>typeof PHONE!=='undefined'?PHONE:null;
  const win=(G,d,h0,d1,h1)=>d!=null&&now(G)>=d*24+h0&&now(G)<(d1!=null?d1:d)*24+h1;
  S.phone=function(G){ const ph=P(); if(!ph||!law(G)||!G.flags) return; const F=G.flags;
    /* B6：芯慈私訊（BB_137 2-1）*/
    { const sat=TD('Y2S1',5,6), tue=TD('Y2S1',6,2); if(win(G,sat,20,tue,18.5)&&knows(XC)&&typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,XC))
        ph.at(G,sat,20,[{th:'p:'+XC,from:XC,text:'週二晚上博雅有一場講座。「經濟和法律，在同一張桌子上」。'},{th:'p:'+XC,from:XC,text:'這場你應該會想聽。阿勳也會去。'}],'bb_b6_dm');
      /* SK09 沒去（BB_106 SK09「沒去時」）*/
      if(win(G,tue,21,tue+3,0)&&F.ECON_LAW_BRIDGE&&!done(G,'ev_sk09')&&ph.inGroup(G,'noodle_team'))
        ph.at(G,tue,21,[{th:'g:noodle_team',from:XC,text:'我和統計課那個人在博雅吵了一小時，違約只要賠錢就好嗎。'},{th:'g:noodle_team',from:XC,text:'結論：活大的吸管太細。'}],'bb_sk09_miss'); }
    /* B7：語彤轉海報（稿：「語彤在麵店團群組轉了一張海報」；照片的說明是這裡寫的）*/
    { const mon=TD('Y2S2',6,1); if(win(G,mon,21,mon+2,19)&&knows(YT)&&ph.inGroup(G,'noodle_team')) ph.at(G,mon,21,[{th:'g:noodle_team',from:YT,text:'📷（海報：「老房子、租屋與城市」）'}],'bb_b7_poster'); }
    /* B12：同一個講者又來了（稿寫「群組」，沒寫誰：以安揪的，和 B4 一樣在麵店團）*/
    { const mon=TD('Y3S1',10,1); if(win(G,mon,21,mon+1,18.5)&&knows(AN)&&ph.inGroup(G,'noodle_team')) ph.at(G,mon,21,[{th:'g:noodle_team',from:AN,text:'大一那場『政府可以為了大家，限制一個人嗎』，同一個講者又來了。'}],'bb_b12_invite'); }
    /* SK08：阿勳私訊；沒去＝當晚的大合照 */
    { const wed=TD('Y2S1',1,3); if(win(G,wed,12,wed,17)&&(S.knowXun(G)||(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'econ_zhengxun')))) ph.at(G,wed,12,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'我在帶迎新。你在對面，走過來就好。神秘嘉賓。'}],'bb_sk08_dm');
      if(win(G,wed,21,wed+3,0)&&ph.sent(G,'bb_sk08_dm')&&!done(G,'ev_sk08_guest')) ph.at(G,wed,21,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'📷（一張大合照）'},{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'今年有一個學弟說他是『看不見的手』，然後一直揮手。'}],'bb_sk08_miss'); }
    /* SK10：芯慈在小群組貼時間地點（稿沒有寫訊息的字：只寫時間、地點）；上一場沒去 */
    if(F.ECON_LAW_BRIDGE) for(const t of ['Y2S1','Y2S2','Y3S1','Y3S2']) for(const w of [6,15]){ const mon=TD(t,w,1), wed=TD(t,w,3); if(mon==null||wed==null) continue; const k=t+'_'+w;
      if(win(G,mon,21,wed,21)&&!S.abroad(Object.assign({},G,{day:wed}))){ ph.join(G,'swap_study','一題換一題'); ph.at(G,mon,21,[{th:'g:swap_study',from:XC,text:'週三晚上七點，博雅小桌子。'}],'bb_sk10_'+k); }
      if(now(G)>=wed*24+21&&ph.sent(G,'bb_sk10_'+k)&&!(F.SK10_CHK||[]).includes(k)){ if(!Array.isArray(F.SK10_CHK)) F.SK10_CHK=[]; F.SK10_CHK.push(k); if(!(Array.isArray(F.SK10_DONE)&&F.SK10_DONE.includes(k))) F.SK10_MISSED=true; } }
    /* G4c：口試前一晚；沒去＝隔天中午 */
    if(F.JP_MET) for(const [t,ev,topic] of [['Y2S1','ev_jp_g4c1','點餐'],['Y2S2','ev_jp_g4c2','問路']]){ const sun=TD(t,15,7), mon=TD(t,16,1); if(sun==null) continue;
      if(win(G,sun,20,sun,21.5)){ S.jpJoin(G); ph.at(G,sun,20,[{th:'g:jp_class',name:'采蓁',text:'明天口試，今晚要不要一起練？博雅小桌，九點。'}],'jp_g4c_'+t); }
      if(mon!=null&&win(G,mon,12,mon+2,0)&&ph.sent(G,'jp_g4c_'+t)&&!done(G,ev)) ph.at(G,mon,12,[{th:'g:jp_class',name:'采蓁',text:'我們昨天練了'+topic+'那題。'}],'jp_g4c_no_'+t); }
    /* D5：沛珊的講義（公法讀書會的前一天；冷卻四週）*/
    { const t=term(G), wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:0;
      if(t&&!t.exam&&wd===3&&(+G.hour||0)>=20&&(+G.hour||0)<22&&['Y1S1','Y1S2','Y2S1'].includes(t.id)&&(t.id!=='Y1S1'||t.week>=10)&&S.beforeKey(G,'2026-12-17')&&ph.inGroup(G,'public_law')&&knows(PS)&&S.here(PS,G)
        &&(F.D5_LAST==null||G.day-F.D5_LAST>=28)&&!ph.sent(G,'bb_d5_'+G.day)){
        const plgA=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list.find(a=>a.id==='public_law_group');
        if(plgA&&ACTIVITIES.on(plgA,G.day+1,G)){ F.D5_LAST=G.day;
          ph.at(G,G.day,20,[{th:'g:public_law',from:PS,text:'講義我先印了，放在女舍一樓的櫃子，誰要拿？',ask:{id:'bb_d5_'+G.day,until:G.day*24+22,opts:[{t:'我去拿。',set:{D5_GO:G.day}},{t:'請別人幫我拿。',say:[{from:PS,text:'好，明天直接給你。'}]}]}}],'bb_d5_'+G.day); } } }
  };

  /* ---------------- 課堂（CLS.IN_CLASS）---------------- */
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const lateAbs=(G,it)=>!!(typeof CLS!=='undefined'&&CLS.isLateAbsent&&CLS.isLateAbsent(G,it));
  S._g1w1=false;
  /* G1：第一次去上日文（日文上；沒上過日文上的，日文下第一次去）。第 1 週那一堂的點名（課表的自我介紹選項）換成 G1 */
  const g1=async function(GM,it,prof,ct){ const G=GM.G; if(!g1.due(G,it)||lateAbs(G,it)) return false; const ev=evOf('ev_jp_g1'); if(!ev||typeof EVENTS==='undefined') return false;
    const w1=it.c.id==='japanese_1'&&it.week===1; S._g1w1=w1; try{ await EVENTS.run(ev); } finally { S._g1w1=false; }
    if(!done(G,'ev_jp_g1')) return false; G.flags.JP_MET=true; S.jpJoin(G); if(w1&&ct){ ct.call=null; if(ct.tpl==='C') ct.tpl='A'; } return true; };
  g1.due=(G,it)=>!!it&&!!it.c&&(it.c.id==='japanese_1'||it.c.id==='japanese_2')&&!it.exam&&law(G)&&!!G.flags&&!G.flags.JP_MET&&!done(G,'ev_jp_g1');
  /* G6：日文下第 10 週。課表的提問（三個讀法）先問，接著 AA-C 審過的五句；點名的收尾（課表 follow）不再演 */
  const g6=async function(GM,it,prof,ct){ const G=GM.G; if(!g6.due(G,it)||lateAbs(G,it)) return false; const ev=evOf('ev_jp_g6'); if(!ev||typeof EVENTS==='undefined') return false;
    const opts=ct&&ct.call&&Array.isArray(ct.call.options)?ct.call.options:[]; const pre=opts.length?[{speaker:null,text:'老師點到你。'},{choice:opts.map(o=>({text:'「'+o+'」'}))}]:[];
    await EVENTS.run(Object.assign({},ev,{dialogue:pre.concat(ev.dialogue)})); if(ct&&done(G,'ev_jp_g6')){ ct.call=null; if(ct.tpl==='C') ct.tpl='A'; } return true; };
  g6.due=(G,it)=>!!it&&!!it.c&&it.c.id==='japanese_2'&&!it.exam&&it.week===10&&law(G)&&!done(G,'ev_jp_g6');
  S.inClass={g1,g6};

  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)) CLS.IN_CLASS.push(g1,g6);
  return S;
})();
