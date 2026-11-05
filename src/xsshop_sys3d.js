/* ===== 大步球鞋（xs_dabu）、好拍運動（xs_haopai）的按鈕、旁白、買東西（區域＝src/xsshop3d.js 的 XSS，配置 src/data/dabu_layout.js、haopai_layout.js 是 LAWWW2 的）=====
   企劃：AA_698（企劃線 481cf075d，AA 定稿 D109：每個互動點的字）＋AA_620 第 2 節（企劃線 bf0efded8：價錢、店員／老闆的話、試穿、穿線等二十分鐘）。字一字照抄（S.L）；稿裡沒有的句子不寫。
   做法照山嵐（src/shanlan_sys3d.js：包住區域的 build 加按鈕、STORY.interact 接旁白）、同弦（src/guitar3d.js：買東西、錢不夠、旗標、STORY.onSeat）。
   - 介面字只用遊戲裡已經有的：選單「○○　1,200 元」「不用了」、錢不夠＝「錢不夠」（同弦的做法：選項變灰，按了只出「錢不夠」，不扣錢；AA_698「不能買，不另外出字」）、
     打烊＝PLACES.closedText（店門 story3d.js 照開放時間擋；人已經在店裡、過了打烊時間按按鈕＝寫開放時間，不演）。
   大步球鞋（6 個互動點，照配置 interact 的 kind 對）：
     看看（籃球鞋）look_basketball／看看（左牆後段 跑鞋、右牆 復古低筒：照位置對）＝旁白一句；照鏡子 mirror＝旁白一句；
     試穿 try_on＝坐上長凳 A（seats[0]；有人坐就站著）→ 店員「你幾號？」→ 旁白（AA_620 原句）→ 起身；長凳四個位子「坐下試穿」（STORY.onSeat）＝同一段（坐著，不起身）。
     買東西 cashier＝店員的話輪流一句（一次進店說一句）→ 選單：籃球鞋 2,800／3,600、跑鞋 2,500、休閒鞋 1,900、球襪 150、不用了 → 買了：扣錢、時間 +0.15 小時（照同弦的櫃台）、旁白一句；
       籃球鞋＝旗標 SHOES_BB（'bb2800'｜'bb3600'；AA_620 3-1 系籃旁白看它）。
   好拍運動（3 個互動點＋兩張凳子）：
     看看 browse＝旁白一句（AA_620 原句）。
     買東西 shop＝老闆的話輪流一句 → 選單：羽球拍 入門 1,200／中階 2,800、羽球一筒 450、桌球拍 成品拍 800／自己組 2,600、桌球一盒 150、護腕 120、不用了 → 買了：旁白一句；
       羽球拍＝旗標 OWN_RACKET（'entry'｜'mid'；AA_620 3-3 打羽球的旁白看它）＋老闆「要穿線嗎？等二十分鐘。」＝在等穿線（這一次進店；不存檔）。
     穿線 string：有自己的羽球拍（OWN_RACKET）＝老闆「穿線三百。等二十分鐘。」→ 300 元（錢不夠＝「錢不夠」、不演）→ 轉暗、時間過二十分鐘 → 旁白（AA_620 原句）；
       沒有＝老闆「拍子呢？」→ 旁白。
     高腳凳「坐著等穿線」（STORY.onSeat）：在等穿線＝上面那一段（有拍子那一版）；沒在等＝旁白一句。紅色圓凳「坐一下」＝旁白一句。
   存檔：只有旗標——SHOES_BB、OWN_RACKET、XSS_TALK＝{dabu,haopai:店員／老闆說過幾句（輪到第幾句）}；舊存檔沒有＝0。
   測試：node tests/xsshop_act_unit.js */
'use strict';
const XSSA=(function(){
  const S={};
  S.ZONES={xs_dabu:'dabu',xs_haopai:'haopai'};
  const CLERK={name:'店員'}, BOSS={name:'老闆'};
  const fmt=n=>Number(n).toLocaleString('en-US');
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  /* ---------- 台詞（AA_698、AA_620，一字照抄；說話的人寫「店員」「老闆」，引號「」拿掉＝對話框）---------- */
  S.L={
    dabu:{
      look:[{x:-2.75,z:-0.2,text:'（籃球鞋排成兩格，高筒的放在上面。有一雙的標籤寫「系隊推薦」。）'},   /* 看看（籃球鞋）：左牆籃球鞋那兩格 */
            {x:-2.75,z:-3.4,text:'（跑鞋這一格顏色最亮。每一雙都把鞋底翻過來，給人看紋路。）'},   /* 看看：左牆後段（跑鞋）*/
            {x:2.75,z:-1.45,text:'（復古低筒那一格，有一雙的鞋帶是兩種顏色。）'}],   /* 看看：右牆（跑鞋、復古低筒）*/
      tryAsk:'你幾號？', tryNarr:'（你試了一雙。店員蹲下來按了一下鞋頭：「前面留一指，剛好。」）',
      talk:['打室外場的話，鞋底要選耐磨的。','這雙這個月很多人買，系隊的。','跑鞋不要拿去打籃球，會扭到。'],
      bought:'（店員把鞋盒裝進紙袋。）',
      mirror:'（你在鏡子前面站了一下，左右各轉了一次。）' },
    haopai:{
      browse:'（天花板也掛滿球拍。穿線機在角落嗒嗒響，老闆一邊穿線一邊看電視上的比賽。）',
      talk:['第一支不要買太硬的，手會受傷。','線磅數拉二十二就好，你們學生都拉太緊。','桌球的膠皮三個月換一次，看起來沒壞也要換。'],
      bought:'（老闆把東西裝進塑膠袋，袋子上印著店名。）',
      askString:'要穿線嗎？等二十分鐘。',
      string:'穿線三百。等二十分鐘。', stringNarr:'（你坐在門口的小板凳上，看老闆把線一條一條拉緊。）',
      noRacket:'拍子呢？', noRacketNarr:'（你兩手空空。老闆搖搖頭，回去穿他的線。）',
      stoolIdle:'（高腳凳有點晃。老闆看了你一眼：「等人喔？」）',
      roundStool:'（你在紅色圓凳上坐了一下。電視上的比賽打到第三局。）' } };
  S.ITEMS={
    dabu:[{id:'bb2800',name:'籃球鞋',price:2800,flag:'SHOES_BB'},{id:'bb3600',name:'籃球鞋',price:3600,flag:'SHOES_BB'},{id:'run',name:'跑鞋',price:2500},{id:'casual',name:'休閒鞋',price:1900},{id:'socks',name:'球襪',price:150}],
    haopai:[{id:'entry',name:'羽球拍 入門',price:1200,flag:'OWN_RACKET'},{id:'mid',name:'羽球拍 中階',price:2800,flag:'OWN_RACKET'},{id:'shuttle',name:'羽球一筒',price:450},
            {id:'tt_ready',name:'桌球拍 成品拍',price:800},{id:'tt_custom',name:'桌球拍 自己組',price:2600},{id:'tt_ball',name:'桌球一盒',price:150},{id:'wrist',name:'護腕',price:120}] };
  S.STRING_PRICE=300; S.STRING_H=20/60; S.BUY_H=0.15;   /* 穿線 300（AA_620）、等二十分鐘；買了的時間照同弦的櫃台 */
  S.BTN={dabu:{try_on:'try',look_basketball:'look',look:'look',cashier:'shop',mirror:'mirror'},haopai:{browse:'browse',shop:'shop',string:'string'}};
  /* ---------- 共用 ---------- */
  const shopOf=G=>G&&S.ZONES[G.zone];
  const zoneOf=k=>k==='dabu'?'xs_dabu':(k==='haopai'?'xs_haopai':null);
  S.isOpen=function(k,G){ return typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(zoneOf(k),hr(G),G.day); };
  S.closedText=(k,G)=>typeof PLACES!=='undefined'&&PLACES.closedText?PLACES.closedText(zoneOf(k),hr(G),G.day):'';
  S.layout=k=>typeof XSS!=='undefined'&&XSS.SHOPS&&XSS.SHOPS[k]?XSS.SHOPS[k].lay():null;
  S.talkRec=function(G){ const F=G.flags||(G.flags={}); let r=F.XSS_TALK; if(!r||typeof r!=='object'||Array.isArray(r)) r=F.XSS_TALK={}; for(const k of ['dabu','haopai']) if(typeof r[k]!=='number'||!(r[k]>=0)) r[k]=0; return r; };
  S.lookText=function(q){ const L=S.L.dabu.look, m=q&&L.find(o=>Math.abs(o.x-q.x)<0.05&&Math.abs(o.z-q.z)<0.05); return m?m.text:null; };
  /* 這一次進店（GM.enterN；讀檔以後從頭算）：店員／老闆說過了、在等穿線 */
  const visit={dabu:null,haopai:null}; S.wait=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['xsshop_sys3d:busy']=()=>{ busy=false; visit.dabu=visit.haopai=null; S.wait=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.waiting=GM=>!!GM&&S.wait!=null&&S.wait===(GM.enterN|0)&&!!GM.G&&GM.G.zone==='xs_haopai';
  S.talkLine=async function(GM,k){ const G=GM.G, n=GM.enterN|0; if(n>0&&visit[k]===n) return null; visit[k]=n; const r=S.talkRec(G), L=S.L[k].talk, t=L[r[k]%L.length]; r[k]++;
    await GM.say(k==='dabu'?CLERK:BOSS,t); return t; };
  /* ---------- 買東西 ---------- */
  S.menu=(k,G)=>S.ITEMS[k].map(it=>({t:it.name+'　'+fmt(it.price)+' 元',dim:(G.money|0)<it.price,id:it.id}));
  /* 資料層（測試直接用）：'poor'＝錢不夠（不扣錢）、true＝買了、false＝沒有這一樣 */
  S.buy=function(G,k,id,pay){ const it=(S.ITEMS[k]||[]).find(q=>q.id===id); if(!it) return false; if((G.money|0)<it.price) return 'poor';
    if(pay) pay(-it.price); else G.money=(G.money|0)-it.price;
    if(it.flag) (G.flags||(G.flags={}))[it.flag]=id; return true; };
  S.shop=async function(GM,k){ const G=GM.G; await S.talkLine(GM,k);
    const opts=S.menu(k,G), i=await GM.choose(opts.concat([{t:'不用了'}])), o=opts[i]; if(!o) return null;
    const res=S.buy(G,k,o.id,GM.money?d=>GM.money(d):null);
    if(res==='poor'){ if(GM.toast) GM.toast('錢不夠'); return 'poor'; } if(res!==true) return null;
    if(GM.advance) GM.advance(S.BUY_H);
    await GM.say(null,S.L[k].bought);
    if(k==='haopai'&&S.ITEMS.haopai.find(q=>q.id===o.id).flag==='OWN_RACKET'){ await GM.say(BOSS,S.L.haopai.askString); S.wait=GM.enterN|0; }   /* AA_620：買羽球拍 → 老闆「要穿線嗎？等二十分鐘。」＝在等穿線 */
    if(GM.autosave) GM.autosave(); return o.id; };
  /* ---------- 好拍：穿線 ---------- */
  S.hasRacket=G=>!!(G&&G.flags&&G.flags.OWN_RACKET);
  S.stringIt=async function(GM){ const G=GM.G, H=S.L.haopai;
    if(!S.hasRacket(G)){ await GM.say(BOSS,H.noRacket); await GM.say(null,H.noRacketNarr); return 'none'; }
    await GM.say(BOSS,H.string);
    if((G.money|0)<S.STRING_PRICE){ if(GM.toast) GM.toast('錢不夠'); return 'poor'; }
    if(GM.money) GM.money(-S.STRING_PRICE); else G.money=(G.money|0)-S.STRING_PRICE;
    if(GM.fade) await GM.fade(true); if(GM.advance) GM.advance(S.STRING_H); if(GM.fade) await GM.fade(false);
    await GM.say(null,H.stringNarr); S.wait=null;
    if(GM.autosave) GM.autosave(); return 'strung'; };
  /* ---------- 大步：試穿 ---------- */
  S.tryLines=async GM=>{ await GM.say(CLERK,S.L.dabu.tryAsk); await GM.say(null,S.L.dabu.tryNarr); };
  S.tryOn=async function(GM){ const E=GM.E, P=E&&E.player, L=S.layout('dabu'), s0=L&&L.seats&&L.seats[0];
    let seat=null; if(s0&&P&&!P.seat){ const it=(E.interactables||[]).find(q=>q.seat&&Math.abs(q.seat.x-s0.x)<0.05&&Math.abs(q.seat.z-s0.z)<0.05); if(it) seat=GM.freeSeat?GM.freeSeat(it.seat):it.seat; }
    if(seat&&GM.walkTo&&GM.sitAt){ const ap=GM.seatApproach?GM.seatApproach(seat):[seat.x+Math.sin(seat.yaw)*0.6,seat.z+Math.cos(seat.yaw)*0.6]; await GM.walkTo(P,ap[0],ap[1],{lv:0}); GM.sitAt(P,seat); }
    await S.tryLines(GM);
    if(seat&&P&&P.seat&&GM.standUp) GM.standUp(P); return !!seat; };
  /* ---------- 坐下（STORY.onSeat）：大步的長凳＝試穿那一段；好拍的高腳凳、圓凳 ---------- */
  S.seatOf=function(k,seat){ const L=S.layout(k); if(!L||!seat) return null; let b=null, bd=k==='dabu'?0.5:0.6; for(const s of (L.seats||[])){ const d=Math.hypot(s.x-seat.x,s.z-seat.z); if(d<bd){ bd=d; b=s; } } return b; };
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G, k=shopOf(G); if(!k||!S.isOpen(k,G)) return false; const s=S.seatOf(k,seat); if(!s) return false;
    if(k==='dabu'){ await S.tryLines(GM); return true; }
    if(s.kind==='stool_high'){ if(S.waiting(GM)) await S.stringIt(GM); else await GM.say(null,S.L.haopai.stoolIdle); return true; }
    if(s.kind==='stool_round'){ await GM.say(null,S.L.haopai.roundStool); return true; }
    return false; };
  /* ---------- 按鈕（區域建好的時候加；位置照 XSS.INTERACT＝配置的 interact）---------- */
  S.buttons=function(E,k){ if(!E||!Array.isArray(E.interactables)||typeof XSS==='undefined'||!XSS.INTERACT) return 0; let n=0;
    for(const q of XSS.INTERACT(k)){ const act=S.BTN[k]&&S.BTN[k][q.kind]; if(!act) continue; const it={x:q.x,z:q.z,lv:0,radius:0.9,label:q.label,xssa:{shop:k,act,kind:q.kind}};
      if(act==='look'){ const t=S.lookText(q); if(!t) continue; it.xssa.text=t; }
      E.interactables.push(it); n++; }
    return n; };
  let busy=false;
  S.interact=async function(GM,it){ const G=GM.G, a=it.xssa, k=a.shop; if(busy) return true;
    if(!S.isOpen(k,G)){ if(GM.caption) GM.caption('',S.closedText(k,G),3600); else if(GM.toast) GM.toast(S.closedText(k,G),3600); return true; }
    busy=true; GM.sceneBegin(); try{
      if(a.act==='look') await GM.say(null,a.text);
      else if(a.act==='mirror') await GM.say(null,S.L.dabu.mirror);
      else if(a.act==='browse') await GM.say(null,S.L.haopai.browse);
      else if(a.act==='try') await S.tryOn(GM);
      else if(a.act==='shop') await S.shop(GM,k);
      else if(a.act==='string') await S.stringIt(GM);
    } finally { busy=false; GM.sceneEnd(); } return true; };
  /* ---------- 接到遊戲 ---------- */
  for(const zid of Object.keys(S.ZONES)){ const k=S.ZONES[zid], ZB=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[zid];
    if(ZB&&!ZB._xssa){ ZB._xssa=true; const b0=ZB.build; ZB.build=function(E){ const z=b0.apply(this,arguments); try{ S.buttons(E,k); }catch(e){ console.warn('XSSA.buttons',e); } return z; }; } }
  if(typeof STORY!=='undefined'&&!STORY._xssa){ STORY._xssa=true;
    if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.xssa&&GM&&GM.G){ await S.interact(GM,it); return true; } return oi.apply(this,arguments); }; }
    { const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&S.ZONES[GM.G.zone]) await S.onSeat(GM,seat); }catch(e){ console.warn('XSSA.onSeat',e); } return r; }; } }
  return S;
})();
