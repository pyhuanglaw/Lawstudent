/* ===== AA_118 第 5 節 L1～L3「有建築、沒有事件的地方」＋ AA_555 第 3 節改稿（任務 AA555-L123-SCENES-1101；企劃線 56c11668d）=====
   台詞一字不改（D109）；稿裡的舊名字一律換 Alison（AA_380、AA_555〔名〕；角色 id 照舊 yu）。稿的散文（場景描述）照原句當旁白，只把句首的「她」換成 Alison（單獨演的那一年沒有前文）。
   時間照 AA-B 11-01 回覆（稿沒寫的部分）；只在法律系（經濟系那一年 G.stage 'econ' 不演：事件引擎照 stage 擋、手機規則看 law）。
   ■ L1 法律系館A的電梯 ev_l1_elevator：
     上午第二節下課（12:10）、人在法律系館A一樓（zone linze、第 0 層），大一上第 1 週起每一學期（Y1S1～Y4S2）；平日、不是假日、不是開場那兩天（STORY.opening）。
     每學期最多兩次（G.flags.L1_ELEV.n[學期]），兩次至少隔兩週（cooldown_days 14）。玩家選「（等電梯）」「（走樓梯）」；沒有旗標、沒有後果（L1_ELEV 只是次數紀錄）。
     - 等電梯：「電梯來了……」旁白 → 阿哲那一段（「我很瘦。」「嗶——」「……好，我走樓梯。」；認識阿哲才有：新局 9/4 他才自我介紹）
       → 聽到別人的八卦：從摘要日的手機小事池（AA_118 第 3 節＝遊戲裡的 AA555.DP，src/aa555_3d.js）挑一則——當學期、那一則的條件成立、全部是文字（沒有照片／檔案／語音）、
         同一個人說的、還沒收過、電梯裡還沒聽過；旁白「（電梯裡，後面有人在講手機。）」接那一則的原句（每一段用「」）。沒有符合的＝保守旁白 S.GOSSIP_NONE。
     - 走樓梯：二樓迴廊遇到柏翰「走樓梯比電梯快四十秒。我算過。」；大三以後、翰 4 之後（BH4_DONE 或 ev_bohan_third_floor 演過）換「……可是今天我想等。」
     技術預設（稿沒寫，要問 AA）：時間窗 12:10～12:30（下課走到一樓要時間；宥辰的電梯支線是 12:10～12:20）；宥辰那一場（SUP497 ev_yc_elev_done）當天讓它；
       走樓梯不把人搬到二樓（ADV 小場景，演完人還在一樓）；選項的字、八卦的旁白、沒有八卦時的旁白都是補的。
   ■ L2 校史館門口 ev_l2_hist_door：只有大一那次（大四那次作廢，AA_555〔承〕）。大一上第 4 週週三 15:00 新生導覽走到校史館門口；那時人在校園（zone campus）就演，不在就不演。
     技術預設：時間窗 15:00～15:30（導覽在門口停一下）；不限在校園的哪裡、不搬位置；一次。
   ■ L3 圓窗館前的合照 ev_l3_photo_1～4：每學年一次（大一～大四上學期第 3 週週五 16:00），Alison 的位置和台詞照稿四個版本。
     當天 12:00 系學會在班群（law_class，系學會的公告都貼這裡：story3d.js lawClassJoinY1、r2y3a3d.js LC）約；不在班群＝有 Alison 聯絡方式就她私訊（同一句）。
     約了＝排進行程（OUT.plan goto：「出發」帶到圓窗館前，同 story3d.js 映月湖 E12）；16:00 前後人在圓窗館前（S.L3_AT 半徑 S.L3_R，trigger auto）＝在場演那一年的版本。
     沒去＝18:00 班群收到合照「📷（圓窗館前的系學會合照）」（不在班群＝Alison 私訊；晚三天以內補送）。人在國外（美國路線大四上）：群組照當地時間收，不排出發、Alison 不私訊約。
     技術預設：約的那一句、照片的說明、時間窗 15:50～16:30（出發早 5 分鐘到）、地點半徑都是補的；3D 沒有放合照的人群（只有 ADV）。
   存檔：G.flags.L1_ELEV＝{n:{學期:次數}, heard:[聽過的 a118_ id]}；舊存檔沒有＝沒演過。L2、L3 是 once 事件（G.events）。
   index.html：緊接在 aa187_3d.js 後面（bbpack3d.js 到 GAME.boot 之間的順序別的測試鎖住了：aa498、bbpack_unit、aa497）。
   測試：node tests/campus_l123_unit.js */
'use strict';
const CL123=(function(){
  const S={}, ZHE='zhe', BH='classmate_bohan', YU='yu';
  if(typeof STORY==='undefined'||typeof STORY_EVENTS==='undefined'||typeof CALENDAR==='undefined') return S;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const termOf=d=>CALENDAR.termOf(d);
  const yearOf=G=>{ const t=termOf(G.day); return t&&/^Y[1-4]S[12]$/.test(t.id)?+t.id[1]:0; };
  const knows=(id,G)=>!!STORY.knows&&!!STORY.knows(id,G);
  const abroad=G=>typeof STORY.abroad==='function'&&!!STORY.abroad(G);
  const tz=(G,d)=>STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;
  const opening=G=>!!STORY.opening&&!!STORY.opening(G);
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const nar=t=>({speaker:null,text:t}), zhe=t=>({speaker:ZHE,text:t}), bh=t=>({speaker:BH,text:t}), yu=t=>({speaker:YU,text:t});
  const iff=(l,c)=>Object.assign(l,{if:{custom:c}}), unl=(l,c)=>Object.assign(l,{unless:{custom:c}});

  /* ===================== L1 法律系館A的電梯，十二點十分 ===================== */
  S.L1_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.L1_MAX=2; S.L1_GAP=14;
  S.l1Rec=G=>{ const F=G.flags; let R=F.L1_ELEV; if(!R||typeof R!=='object') R=F.L1_ELEV={n:{},heard:[]}; if(!R.n||typeof R.n!=='object') R.n={}; if(!Array.isArray(R.heard)) R.heard=[]; return R; };
  S.l1Count=G=>{ const t=termOf(G.day), R=G.flags&&G.flags.L1_ELEV; return t&&R&&R.n?(R.n[t.id]|0):0; };   /* 只讀（檢查條件不替舊存檔建紀錄）*/
  S.l1Mark=G=>{ const t=termOf(G.day); if(!t) return; const R=S.l1Rec(G); R.n[t.id]=(R.n[t.id]|0)+1; };
  S.l1Ok=function(G,GM){ if(!law(G)||opening(G)) return false; const t=termOf(G.day); if(!t||!S.L1_TERMS.includes(t.id)||CALENDAR.holiday(G.day)) return false;
    const P=GM&&GM.E&&GM.E.player; if(P&&(P.lv|0)!==0) return false;   /* 一樓（二樓迴廊不算）*/
    if(S.l1Count(G)>=S.L1_MAX) return false;
    if(typeof SUP497!=='undefined'&&SUP497.elevDoneDue&&SUP497.elevDoneDue(G)) return false; if(G.events&&G.events.last&&G.events.last.ev_yc_elev_done===G.day) return false;   /* 宥辰的電梯（同一個時段、同一個電梯口）那天讓它 */
    return true; };
  /* 聽到的八卦：AA_118 第 3 節的手機小事池（AA555.DP）挑一則 */
  S.GOSSIP_PRE='（電梯裡，後面有人在講手機。）';
  S.GOSSIP_NONE='（電梯裡很擠，大家都在滑手機。）';   /* 沒有符合的那一則：保守旁白（補的，要問 AA）*/
  const plain=t=>typeof t==='string'&&t.length>0&&!t.startsWith('📷')&&!t.startsWith('📎')&&!t.startsWith('（');
  S.gossipCands=function(G){ if(typeof AA555==='undefined'||!Array.isArray(AA555.DP)) return []; const Tm=termOf(G.day), R=G.flags.L1_ELEV, heard=R&&Array.isArray(R.heard)?R.heard:[], N=G.flags.dpN||{}, out=[];
    for(const d of AA555.DP){ try{ if(heard.includes(d.id)||(N[d.id]|0)>0) continue; if(!d.term||!d.term(Tm)||!d.ok(G,G.day)) continue;
        const its=d.items(G)||[]; if(!its.length||!its.every(m=>plain(m.text))||new Set(its.map(m=>m.from)).size>1) continue;
        out.push({id:d.id,text:its.map(m=>'「'+m.text+'」').join('')}); }catch(e){ console.warn('CL123 gossip',d&&d.id,e); } }
    return out; };
  S.gossip=function(G){ const C=S.gossipCands(G); if(!C.length) return [S.GOSSIP_NONE]; const c=C[Math.min(C.length-1,Math.floor(Math.random()*C.length))]; S.l1Rec(G).heard.push(c.id); return [S.GOSSIP_PRE,c.text]; };
  const ZK=G=>knows(ZHE,G);
  S.bhWaits=G=>yearOf(G)>=3&&(!!G.flags.BH4_DONE||done(G,'ev_bohan_third_floor'));   /* 大三以後、翰 4 之後：他開始會等人 */
  S.EV_L1={id:'ev_l1_elevator',participants:[],location:'linze',trigger:'auto',weekday:[1,2,3,4,5],time:[12+10/60,12.5],cooldown_days:S.L1_GAP,background:'blur',   /* 沒有標題（只是生活：不出字卡、不進日誌）*/
    prereq:{custom:(G,GM)=>S.l1Ok(G,GM)},
    dialogue:[ {call:G=>{ S.l1Mark(G); }},
      nar('（中午下課，電梯門口擠滿人。）'),
      {choice:[{text:'（等電梯）',goto:'wait'},{text:'（走樓梯）',goto:'stairs'}]},   /* 選項的字是補的（稿：「玩家選等電梯或走樓梯」）*/
      {label:'wait'},
      nar('（電梯來了，進去八個人，門關不上，「嗶——」。）'),
      iff(nar('（阿哲永遠是最後擠進去的那一個。）'),ZK), iff(zhe('我很瘦。'),ZK), iff(nar('「嗶——」'),ZK), iff(zhe('……好，我走樓梯。'),ZK),
      {call:async(G,GM)=>{ for(const t of S.gossip(G)) await GM.say(null,t); }},
      {goto:'end'},
      {label:'stairs'},
      unl(bh('走樓梯比電梯快四十秒。我算過。'),S.bhWaits),
      iff(bh('走樓梯比電梯快四十秒。可是今天我想等。'),S.bhWaits),
      {label:'end'} ]};

  /* ===================== L2 校史館門口（大一）===================== */
  S.EV_L2={id:'ev_l2_hist_door',participants:[YU,ZHE],noMeet:[YU,ZHE],location:'campus',trigger:'auto',once:true,term:['Y1S1'],weeks:[4],weekday:[3],time:[15,15.5],background:'blur',
    prereq:{custom:G=>law(G)&&!opening(G)},
    dialogue:[ nar('（系上的新生導覽走到校史館。看完出來，Alison 站在門口。）'),
      yu('欸，老照片上的椰子樹好矮。'),
      zhe('椰子樹也當過新生。') ]};

  /* ===================== L3 圓窗館前的合照（每學年一次）===================== */
  S.L3_AT={x:-104,z:-19.5}; S.L3_R=6;   /* 圓窗館（zones3d.js CK.pavilion，中心 (-104,-30)、深 14 m，正門朝 +z）門前台階外 */
  S.L3_GOTO={zone:'campus',x:-104,z:-17,yaw:Math.PI};   /* 「出發」的落點：門前、面向圓窗館 */
  S.L3_H=16;
  S.INV='今天下午四點，圓窗館前拍系學會合照。';   /* 約的那一句：稿沒寫，補的（要問 AA）*/
  S.PHOTO='📷（圓窗館前的系學會合照）';
  S.L3=[
    {y:1,lines:[nar('（系學會每年在圓窗館前拍一張合照。）'),nar('（Alison 站最後一排，跳起來才拍得到。）'),yu('欸再一張，我剛剛眨眼。')]},
    {y:2,lines:[nar('（系學會每年在圓窗館前拍一張合照。）'),nar('（Alison 站中間，負責喊「一、二、三」。）')]},
    {y:3,lines:[nar('（系學會每年在圓窗館前拍一張合照。）'),nar('（Alison 把系學會交出去了，站在攝影師旁邊，負責拿器材。）'),yu('我第一次在照片外面。……還不錯。')]},
    {y:4,lines:[nar('（系學會每年在圓窗館前拍一張合照。）'),nar('（學弟妹請 Alison 回來拍。她站最邊邊，笑得最開心。）')]} ];
  S.l3Day=y=>STORY.termDay?STORY.termDay('Y'+y+'S1',3,5):null;   /* 那一學年上學期第 3 週週五 */
  S.l3Went=function(G,y){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'l123_l3_'+y):null; if(q&&q.state==='planned') q.state='done'; };   /* 自己走過去演了＝行程不再問「出發」*/
  S.EV_L3=S.L3.map(o=>({id:'ev_l3_photo_'+o.y,title:'圓窗館前的合照',participants:[YU],noMeet:[YU],location:'campus',trigger:'auto',once:true,term:['Y'+o.y+'S1'],weeks:[3],weekday:[5],time:[15+50/60,16.5],
    near:{x:S.L3_AT.x,z:S.L3_AT.z,r:S.L3_R},background:'blur',
    prereq:{custom:G=>law(G)},
    dialogue:o.lines.slice(),
    after:G=>S.l3Went(G,o.y) }));
  const hasYu=G=>typeof INV!=='undefined'&&INV.hasContact?!!INV.hasContact(G,YU):!!(G.contacts&&G.contacts[YU]!=null);
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return;
    for(const o of S.L3){ const d=S.l3Day(o.y); if(d==null||G.day<d||G.day>d+3) continue;
      const inG=PHONE.inGroup(G,'law_class'), away=abroad(G), GRP=t=>({th:'g:law_class',from:'law_assoc',name:'系學會',text:t}), DM=t=>({th:'p:'+YU,from:YU,text:t});
      const it=G.day===d&&now(G)>=T(d,12)?(inG?GRP(S.INV):(hasYu(G)&&!away?DM(S.INV):null)):null;
      if(it&&PHONE.at(G,d,12+tz(G,d),[it],'l123_l3_inv_'+o.y)&&!away&&typeof OUT!=='undefined'&&OUT.plan&&now(G)<T(d,S.L3_H+0.25))
        OUT.plan(G,{id:'l123_l3_'+o.y,goto:S.L3_GOTO,early:1/12,day:d,h:S.L3_H,late:0.25,place:'圓窗館前',title:'圓窗館前 16:00：系學會合照',travel:'走過去',travelH:1/6});
      if(now(G)>=T(d,18)&&!done(G,'ev_l3_photo_'+o.y)){ const p=inG?GRP(S.PHOTO):(hasYu(G)?DM(S.PHOTO):null); if(p) PHONE.at(G,d,18+tz(G,d),[p],'l123_l3_photo_'+o.y); } } };

  /* ===================== 掛勾 ===================== */
  S.EVENTS=[S.EV_L1,S.EV_L2].concat(S.EV_L3);
  for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);   /* 載入時排在已經有的事件後面：同一時間別的劇情先演（之後才載入的 bbpack／sup497／aa524 排在它後面；宥辰的電梯由 l1Ok 讓它）*/
  if(Array.isArray(STORY.PHONE_RULES)&&!STORY._cl123pr){ STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('CL123 phone',e); } }); STORY._cl123pr=true; }
  return S;
})();
if(typeof window!=='undefined') window.CL123=CL123;
