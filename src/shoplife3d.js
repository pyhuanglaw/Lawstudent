/* ===== 每一間店都要有人（SHOP-LIFE-AUDIT-1112，USER_WANTS X356；使用者 2026-11-12：「泰米沒有店員」「你要每一家店都看他有沒有店員、有沒有安排客人在裡面、
   有沒有讓我巧遇同學的機會、有沒有打工」「118 巷就是要很容易遇到同學，現在店裡甚至都沒有人」）=====
   盤點表：docs/handoff/SHOP_LIFE_AUDIT_1112.md。**這個檔沒有任何一句台詞**（玩家看得到的字一個都沒有加）；AA 11-12 補的句子（AA_826）在 src/shopmeet3d.js。
   三件事（index.html 裡排在所有會放店員、會加作息的模組後面——campus_l123_3d.js 前面（它和 bbpack 那幾支的順序別的測試鎖住了）；包住 STORY.populate、永遠排在 STORY.SCHED_X 的最後一個）：

   1 店員（S.placeClerk）：換到一間店（STORY.populate 全部做完以後）、店開著（PLACES.isOpen；沒寫營業時間的店＝整天）、店裡還沒有任何店員（n.clerk；別的模組放的優先）、
     找得到店員站的位置（S.clerkSpot）＝放一個路人底模站在那裡（不說話、不放按鈕；結帳照原本的互動點）。位置都讀配置，不另外寫座標：
       汀州路／公館的室內（tz_shops3d.js 的 zone.shopClerk：客居雲南、越好吃小館……之後新加的店自動有）、花序（zone.fnClerk）、
       大步球鞋（DABU_LAYOUT.staff.counter）、好拍運動（HAOPAI_LAYOUT.haopai.npc.owner 站櫃台後面的那一筆）、新生運動廣場（XINSHENG_SPORTS_LAYOUT.clerk）、
       山嵐書店（配置沒有店員的位置：取結帳櫃檯（items 的 cashier）店員那一側——櫃檯東邊 0.45 m、面向櫃檯；LAWWW2 請確認，見盤點表）。
     不放的（S.NO_CLERK，寫原因）：洗樂洗衣坊（自助洗衣店，AA_742 沒有店員）、禮貌生財（只有上師一個人，他在騎樓的算命桌，src/limao3d.js）。
     每 0.5 秒（S.tick）：別的模組後來又放了一位店員、和這裡放的站同一格＝拿掉這裡放的。

   2 座位（S.attachSeats）：tz_shops3d.js 建的室內（zone.shopLayout）還沒有 zone.seats 的（客居雲南、越好吃小館；六間舊的 GG3.attach 已經補了）＝照同一個做法補上
     （「坐下」互動點的 seat）。路人客人（src/crowd3d.js 的 S.shopDefs 最後一段，同一個任務加的）、有名字的人（story3d.js populateSchedule）都靠它找位子。

   3 吃飯時間在店裡遇得到同學（S.sched；STORY.SCHED_X 的最後一個＝別的作息全部優先）：
     誰：118 巷課後午餐那八位同班同學（L118_LUNCH_DATA.who）＋學姊（weight 0.6）、語彤（weight 0.4；S.EXTRA——AA_826 lawww_answers 第 4 點，AA 11-12 D79 過目：
       「加學姊（使用者 11-12：學姊是真正的女主角）weight 0.6、加語彤 weight 0.4（她住學校對面、常外帶），都照『只填沒有作息的空檔』」）＋118 巷的熟客（LANE118_SHOPS.regulars 裡其他的人，現在沒有別人）。
     什麼時候：法律系那幾年、學期中（大一上第 2 週起）、不是考試週（照店內偶遇 AA_632 的規則：考試週不排）、不是颱風假；午餐 11:45～13:30、晚餐 17:45～19:30。
       每個人每一餐：平日午餐七成半、平日晚餐六成、週末四成的機會出現在某一間店（S.CFG；再乘上那個人的 weight（S.weight）：AA_771 芯慈 0.7、宥辰 0.4；AA_826 學姊 0.6、語彤 0.4；只在熟客表裡、S.EXTRA 沒有的人從他成為熟客的那一學期起，S.since；亂數＝日期＋餐＋人，同一天存讀檔、進出結果一樣），待 36～54 分鐘。
     哪一間：八成是 118 巷的九間餐廳（照他在 L118_LUNCH_DATA.who 的 prefs 加權；沒寫的人九間平均），兩成是其他吃飯的店（S.CFG.other：汀州路的泰米村食、越好吃小館、客居雲南、
       大口漢堡、林家乾麵、SUNNY SIDE／Daybreak（午餐）、洋洋鹹酥雞、小路（晚餐））；那個時段沒開的照順序換下一間。一間店同一餐最多兩位（S.CFG.perShop）。
     **原本的作息優先**（和 SHOPNPC 同一把尺；店內偶遇 AA_632、新店面遇得到人 AA_705 的每一列也都比這裡優先：S.wrapOthers）：他這個時間原本有事（上課、社課、打工、約好的、在別的店……）＝這一餐不出現；**只填完全沒有作息的空檔**（S.CFG.overWander=false：連作息表裡「在公館走走」那種也不蓋掉——AA_684 這類稿寫明了他那時候在哪；改 true＝走走也算空檔）。
       那一天跟玩家有約（SHOPNPC.planDay）、那個時段是他 118 巷熟客的時段（照舊站在店門口，lane118.js）、阿哲約的午餐／當面約的 118 巷午餐成行的那一天中午（照那一場）＝不排。
       人不在臺北、離校、畢業照 presence（schedFor 先看；S.why 也擋一次＝'presence'）：學姊在美國那學期（2028-08-02～12-23）、每個人回老家／出國／畢業以後不在臺北的日子都不排（AA_826 meal_hello.note）；語彤認識以前不在（STORY.schedEnt 的規則）。
       **同一個人同一天最多在店裡遇到一次**（S.CFG.oncePerDay；AA_826 lawww_answers 第 4 點 ②「同一個人同一天最多在店裡遇到一次（午餐遇到，晚餐就不排）」）：
         玩家在店裡遇到他了（S.markMet，每 0.5 秒：玩家在那間店、他照這裡排的那一餐也在店裡）＝記 G.flags.SHOP_MEAL_MET＝{人物: [那天, 哪一餐]}；同一天別的那一餐他就不排（S.why 回 'once'）。
         遇到的那一餐照舊（他不會因為被遇到就消失）。沒遇到的人午餐、晚餐照原本的機會各算各的（118 巷晚餐一樣容易遇到人）。
       **分手後的前任不排**（S.exBlock；SHOP-AA826B-1112，AA_826 meal_hello.note @ f231f0514：「分手後的前任不排進店裡遇到（學姊、以安分手後不會主動找祐廷；其他人也一樣，
         免得一句普通招呼演在分手隔天）；回到朋友（挽回或和好的旗標）以後照舊。」）：
         前任＝ROM.exOf（romance3d.js：沒在交往，而且 EX_<她>，或 status 是 ex／paused／friend_after_catch——和 V6EX.noContact「前任不主動約」同一把尺，只是這裡七位都算、不只以安和學姊）。
         回到朋友（S.reconciled，讀現有的旗標，這裡不記東西）：以安、語彤＝「重新開始」那一場做完（MREL.rb(G,她).step==='done'，multirel3d.js AA_434 第 4 節）；
           學姊＝這一次分開以後「她要的時間」演過（SISB4.rebuild(G).done，G.flags.SIS_REBUILD；HASK 收不收她的邀約也看這一個）；重新交往＝ROM.exOf 本來就不算前任。
           其他人（沛珊、芯慈、芷若、子晴、可昕）現在沒有「和好」的旗標＝分手以後到重新交往以前都不排；之後 AA 給了旗標加在 S.reconciled。
         S.why 回 'ex'。沒排進店裡＝SHOPMEET 的第一句（meal_hello）也不會說（那邊另外再擋一次）。
     怎麼出現：作息那一筆（zone＝那間店、act eat、seatAt＝配置的座位）→ 照現有的 populateSchedule 坐在店裡吃飯；手機「找人」、地圖也看得到他在那間店。
     遇到以後＝他先說一句（AA_826 meal_hello，在 src/shopmeet3d.js：這個檔照規定不放台詞），再照現有的「和他說話」（閒聊階梯）；這裡不演任何東西、不加數值。
     店員的進門招呼（AA_826 staff_greet、花序 AA_792）也在 src/shopmeet3d.js；越好吃小館、客居雲南的在 src/gg3shops3d.js。
   存檔：只多 G.flags.SHOP_MEAL_MET（今天在店裡遇到誰；舊存檔沒有＝今天還沒遇到任何人，不用遷移）；名單、座位全部從日期算，不記。
   測試：node tests/shop_life_audit_1112_unit.js */
'use strict';
const SHOPLIFE=(function(){
  const S={};
  const P=Math.PI;
  const hash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const prng=seed=>{ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; };
  const dayHour=G=>{ const raw=+G.hour||0; return {day:(G.day|0)+(raw>=24?Math.floor(raw/24):0),h:((raw%24)+24)%24}; };
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:null;
  const placeOpen=(z,h,d)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(z,h,d);

  /* ---------- 1 店員 ---------- */
  S.NO_CLERK={tz_xile:'洗衣店是自助的，沒有店員（AA_742）',tz_limao:'只有上師一個人，他在騎樓的算命桌（src/limao3d.js）'};
  /* 路人底模（STORY.extraSpec：偶數＝女性、奇數＝男性）；沒寫的照區域名字算一個固定的 */
  S.CLERK_I={tz_yuehaochi:66,tz_keju:64,flower_notes:68,xs_shanlan:70,xs_dabu:71,xs_xsports:72,xs_haopai:73};
  S.clerkSpot=function(zoneId,E){ const z=E&&E.zone; if(!z||S.NO_CLERK[zoneId]) return null; const at=(c,lv)=>c&&typeof c.x==='number'&&typeof c.z==='number'?{x:c.x,z:c.z,yaw:c.yaw||0,lv:(c.lv!=null?c.lv:lv)|0}:null;
    if(z.shopClerk) return at(z.shopClerk,0);
    if(z.fnClerk) return at(z.fnClerk,0);
    if(zoneId==='xs_dabu'){ const L=typeof DABU_LAYOUT!=='undefined'?DABU_LAYOUT:null; return at(L&&L.staff&&L.staff.counter,0); }
    if(zoneId==='xs_haopai'){ const L=typeof HAOPAI_LAYOUT!=='undefined'&&HAOPAI_LAYOUT.haopai?HAOPAI_LAYOUT.haopai:null, ow=L&&L.npc&&L.npc.owner; return at(Array.isArray(ow)?(ow.find(q=>q.act==='stand')||ow[0]):null,0); }
    if(zoneId==='xs_xsports'){ const L=typeof XINSHENG_SPORTS_LAYOUT!=='undefined'?XINSHENG_SPORTS_LAYOUT:null; return at(L&&L.clerk,0); }
    if(zoneId==='xs_shanlan'){ const L=typeof SHANLAN_LAYOUT!=='undefined'?SHANLAN_LAYOUT:null, c=L&&(L.items||[]).find(q=>q.kind==='cashier'); return c?{x:+(c.x+(c.w||0.8)/2+0.45).toFixed(2),z:c.z,yaw:-P/2,lv:c.lv|0}:null; }   /* 配置沒有店員的位置：櫃檯東邊（note「店員在東邊」）、面向櫃檯 */
    return null; };
  S.isOpen=function(zoneId,G){ const t=dayHour(G); return placeOpen(zoneId,t.h,t.day); };
  S.placeClerk=function(zoneId,GM){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!E.zone||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||typeof STORY==='undefined'||!STORY.extraSpec) return null;
    if((E.npcs||[]).some(n=>n&&n.clerk)) return null;   /* 別的模組已經放了店員 */
    const c=S.clerkSpot(zoneId,E); if(!c||!S.isOpen(zoneId,G)) return null;
    const sp=Object.assign({},STORY.extraSpec(S.CLERK_I[zoneId]||(60+hash('clerk|'+zoneId)%30))); sp.bag=null;   /* 站櫃台不背包（照同弦 guitar3d.js）*/
    const o=CHAR.build(sp); if(!o) return null; o.position.set(c.x,0,c.z); o.rotation.y=c.yaw||0;
    return E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,shopLifeClerk:zoneId,lv:c.lv|0}); };
  /* 夜市攤販每一攤有人顧（店面標準 §12 第 3 點，SHOP-STANDARD-BACKFILL-1112；使用者 2026-11-12「夜市攤販也沒有店員阿」）：
     站在攤體後半（客人那一面的反方向）、面向客人；不說話（沒有名字、點不到）；那一攤收攤（q.isOpen＝false：時間、星期、颱風）就不在（S.tendSync，每 0.5 秒對一次）。*/
  S.tenderSpot=function(q,L){ const b=(typeof TZ3!=='undefined'&&TZ3.stallBlock)?TZ3.stallBlock(q,L):{d:1.5,back:0.25}, sn=Math.sin(q.yaw), c=Math.cos(q.yaw), e=(b.back||0)+b.d/2-0.3;
    return {x:+(q.x-sn*e).toFixed(2),z:+(q.z-c*e).toFixed(2),yaw:q.yaw}; };
  S.placeTenders=function(zoneId,GM){ const E=GM&&GM.E, z=E&&E.zone; if(!z||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||typeof STORY==='undefined'||!STORY.extraSpec) return 0;
    const list=(z.tzStalls||[]).concat(z.ggStalls||[]); if(!list.length) return 0; const L=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:undefined; let k=0;
    for(const q of list){ if(!q||q.id==null||(E.npcs||[]).some(n=>n&&n.stallKeeper===q.id)) continue; const c=S.tenderSpot(q,L);
      if((E.npcs||[]).some(n=>n&&(n.clerk||n.vendor)&&Math.hypot(n.obj.position.x-c.x,n.obj.position.z-c.z)<1.2)) continue;   /* 別的模組已經放了人 */
      const sp=Object.assign({},STORY.extraSpec(40+hash('tend|'+zoneId+'|'+q.id)%50)); sp.bag=null; const o=CHAR.build(sp); if(!o) continue; o.position.set(c.x,0,c.z); o.rotation.y=c.yaw||0; o.visible=q.isOpen!==false;
      E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,stallKeeper:q.id,_stall:q}); k++; }
    return k; };
  /* 118 巷兩間外帶（沒有室內）的櫃台後面有人（站位 LAWWW2-C 2026-11-12 照街景模型量的，還沒在畫面上驗）；沒開（L118.isOpen）就不在 */
  S.L118_TENDER={drink_a:{x:6.05,z:-3.6,yaw:-P/2},drink_b:{x:-6.05,z:-6.9,yaw:P/2}};
  S.placeL118Tenders=function(zoneId,GM){ const E=GM&&GM.E; if(zoneId!=='lane118'||!E||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||typeof STORY==='undefined'||!STORY.extraSpec) return 0; let k=0;
    for(const id of Object.keys(S.L118_TENDER)){ if((E.npcs||[]).some(n=>n&&n.stallKeeper===id)) continue; const c=S.L118_TENDER[id];
      const sp=Object.assign({},STORY.extraSpec(40+hash('tend|lane118|'+id)%50)); sp.bag=null; const o=CHAR.build(sp); if(!o) continue; o.position.set(c.x,0,c.z); o.rotation.y=c.yaw;
      const q={get isOpen(){ try{ return typeof L118==='undefined'||!L118.isOpen||!GM.G||!!L118.isOpen(id,GM.G); }catch(e){ return true; } }}; o.visible=q.isOpen!==false;
      E.addNPC({obj:o,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,stallKeeper:id,_stall:q}); k++; }
    return k; };
  S.tendSync=function(GM){ const E=GM&&GM.E; if(!E||!E.npcs) return; for(const n of E.npcs) if(n&&n.stallKeeper!=null&&n._stall&&n.obj) n.obj.visible=n._stall.isOpen!==false; };
  /* 沒開的時候店裡不站店員（店面標準 §12 第 1 點「打烊看得出來關了」，L118-CLOSED-LOOKS-OPEN-1112）：進區域的時候、之後每 0.5 秒對一次；
     只拿掉店員（n.clerk、不是登場人物；登場人物照自己的作息）；店再開的時候下一次進店會照原本的做法放回來。*/
  S.closeClerks=function(zoneId,GM){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!E.npcs||!E.removeNPC||!zoneId) return 0; const m=/^l118_(.+)$/.exec(zoneId); let open=S.isOpen(zoneId,G);
    if(open&&m&&typeof L118!=='undefined'&&L118.isOpen){ try{ open=!!L118.isOpen(m[1],G); }catch(e){} }   /* 118 巷的店：營業時間在 LANE118_SHOPS（公休日、老闆開刀也算）*/
    if(open) return 0; let k=0;
    for(const n of E.npcs.slice()) if(n&&n.clerk&&!n.charId){ E.removeNPC(n); k++; } return k; };
  /* 別的模組後來在同一格又放了一位＝拿掉這裡放的 */
  S.dedupClerk=function(GM){ const E=GM&&GM.E; if(!E||!E.npcs) return 0; const mine=E.npcs.filter(n=>n&&n.shopLifeClerk); let k=0;
    for(const m of mine){ const p=m.obj.position; if(E.npcs.some(n=>n&&n!==m&&n.clerk&&!n.shopLifeClerk&&(n.lv|0)===(m.lv|0)&&Math.hypot(n.obj.position.x-p.x,n.obj.position.z-p.z)<0.6)){ if(E.removeNPC) E.removeNPC(m); k++; } }
    return k; };

  /* ---------- 2 座位 ---------- */
  S.attachSeats=function(E){ const z=E&&E.zone; if(!z||!z.shopLayout||Array.isArray(z.seats)) return 0; z.seats=(E.interactables||[]).filter(i=>i&&i.tzSeat&&i.seat).map(i=>i.seat); return z.seats.length; };

  /* ---------- 3 吃飯時間遇得到同學 ---------- */
  S.CFG={ slots:[{id:'lunch',from:11.75,to:13.5,p:0.75,pEnd:0.4},{id:'dinner',from:17.75,to:19.5,p:0.6,pEnd:0.4}],   /* p＝平日、pEnd＝週末和國定假日 */
    lane118:0.8,   /* 去 118 巷的比例（使用者：118 巷就是要很容易遇到同學）*/
    other:{lunch:['tz_taimi','tz_yuehaochi','tz_keju','xs_dakou','wz_lin','daybreak','wz_brunch'],dinner:['tz_taimi','tz_yuehaochi','tz_keju','xs_dakou','wz_lin','yangyang','wz_teishoku']},
    overWander:false, perShop:2, start:0.5, stay:[0.6,0.9], weekMin:2, weekMinTerms:['Y1S1'], oncePerDay:true };
  /* AA 指定加進名單的人（AA_826 lawww_answers 第 4 點；weight＝出現的機會照比例少）。他們不在午餐那八位裡：沒有 prefs＝118 巷九間平均 */
  S.EXTRA={heroine_05:{weight:0.6},heroine_03:{weight:0.4}};
  S.weight=function(id){ const w=LD()[id]; if(w&&typeof w.weight==='number') return w.weight; const x=S.EXTRA[id]; return x&&typeof x.weight==='number'?x.weight:1; };
  S.TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const LD=()=>typeof L118_LUNCH_DATA!=='undefined'&&L118_LUNCH_DATA&&L118_LUNCH_DATA.who?L118_LUNCH_DATA.who:{};
  const L8=()=>typeof LANE118_SHOPS!=='undefined'&&LANE118_SHOPS?LANE118_SHOPS:{shops:[],regulars:[]};
  /* 會出現的人（都是現有資料裡的人）*/
  S.people=function(){ const out=Object.keys(LD()); for(const id of Object.keys(S.EXTRA)) if(!out.includes(id)) out.push(id); for(const r of L8().regulars||[]) if(r&&r.id&&!out.includes(r.id)) out.push(r.id); return out.filter(id=>typeof CHARACTERS==='undefined'||!!CHARACTERS[id]); };
  /* 從什麼時候開始算：午餐那八位、AA 指定的學姊和語彤（S.EXTRA）＝大一上第 2 週起（S.dayOk）；只在熟客表裡的人＝他最早那一列熟客開始的學期、週次（AA_280 第 3 節；在那以前他還不是 118 巷的常客）*/
  S.since=function(id,day){ if(LD()[id]||S.EXTRA[id]) return true; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(day):null; if(!T) return false; const i=S.TERMS.indexOf(T.id); let ok=false;
    for(const r of L8().regulars||[]){ if(r.id!==id) continue; const i0=S.TERMS.indexOf(r.term); if(i0<0) continue; if(i>i0||(i===i0&&T.week>=(r.week|0))) ok=true; } return ok; };
  /* 118 巷有室內、不是外帶的餐廳（區域 l118_<id> 在、路人客人那一套有它）*/
  S.laneShops=function(){ return (L8().shops||[]).filter(s=>s&&!s.takeout&&!s.drink&&S.zoneOk('l118_'+s.id)).map(s=>s.id); };
  S.zoneOk=z=>(typeof Z3==='undefined'||!Z3.ZONES||!!Z3.ZONES[z])&&(typeof CROWD==='undefined'||!CROWD.SHOP_ZONES||!!CROWD.SHOP_ZONES[z]);
  S.shopOpen=function(zone,day,t0,t1){ const m=/^l118_(.+)$/.exec(zone);
    if(m){ if(typeof L118==='undefined'||!L118.isOpen) return false; const g=h=>({day,hour:h,weekday:wdOf(day),flags:{}}); return L118.isOpen(m[1],g(t0))&&L118.isOpen(m[1],g(t1-0.01)); }
    if(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(zone,day)) return false;
    return placeOpen(zone,t0,day)&&placeOpen(zone,t1-0.01,day); };
  /* 這一天能不能排（只看日曆和存檔的階段，不看個人）*/
  S.dayOk=function(G,day){ if(typeof CALENDAR==='undefined'||!G) return false; if((G.stage||'law')!=='law') return false;
    const T=CALENDAR.termOf(day); if(!T||!S.TERMS.includes(T.id)||T.exam) return false; if(S.CFG.weekMinTerms.includes(T.id)&&T.week<S.CFG.weekMin) return false;
    if(CALENDAR.typhoon&&CALENDAR.typhoon(day)) return false; return true; };
  /* 這一天這一餐的名單：[{id, zone, t0, t1}]（只看日期；一天算一次）*/
  const planMemo=new Map();
  S.plan=function(day,slotId){ const key=day+'|'+slotId; if(planMemo.has(key)) return planMemo.get(key); const C=S.CFG, slot=C.slots.find(s=>s.id===slotId), out=[]; if(!slot){ return out; }
    const wk=typeof CALENDAR!=='undefined'&&(CALENDAR.weekend(day)||CALENDAR.holiday(day)), lane=S.laneShops(), W=LD(), cnt={};
    const ppl=S.people().map(id=>({id,k:hash('shopmeal-order|'+day+'|'+slotId+'|'+id)})).sort((a,b)=>a.k-b.k||(a.id<b.id?-1:1));
    for(const {id} of ppl){ if(!S.since(id,day)) continue; const r=prng(hash('shopmeal|'+day+'|'+slotId+'|'+id)); if(r()>=(wk?slot.pEnd:slot.p)*Math.min(1,S.weight(id))) continue;   /* weight：AA_771 芯慈 0.7、宥辰 0.4（考前才出現）、AA_826 學姊 0.6、語彤 0.4＝出現的機會照比例少 */
      const t0=+(slot.from+r()*C.start).toFixed(3), t1=+Math.min(slot.to,t0+C.stay[0]+r()*(C.stay[1]-C.stay[0])).toFixed(3);
      const inLane=r()<C.lane118, prefs=(W[id]&&W[id].prefs)||{};
      const order=(list,wOf)=>{ const L=list.map(z=>({z,w:Math.max(0.01,wOf(z))})), o=[]; while(L.length){ let tot=0; for(const q of L) tot+=q.w; let x=r()*tot, i=0; for(;i<L.length-1;i++){ x-=L[i].w; if(x<0) break; } o.push(L.splice(i,1)[0].z); } return o; };
      const hasPref=lane.some(s=>prefs[s]>0);
      const a=order(lane,s=>hasPref?(prefs[s]||0.3):1).map(s=>'l118_'+s), b=order((C.other[slotId]||[]).filter(S.zoneOk),()=>1);
      const cand=inLane?a.concat(b):b.concat(a);
      const zone=cand.find(z=>(cnt[z]|0)<C.perShop&&S.shopOpen(z,day,t0,t1)); if(!zone) continue;
      cnt[zone]=(cnt[zone]|0)+1; out.push({id,zone,t0,t1,slot:slotId}); }
    if(planMemo.size>60) planMemo.clear(); planMemo.set(key,out); return out; };
  /* 這個人這個時刻照名單在哪（不看他原本的作息）*/
  S.planNow=function(G,id){ const t=dayHour(G); for(const slot of S.CFG.slots){ if(t.h<slot.from||t.h>=slot.to) continue; if(!S.dayOk(G,t.day)) return null; const p=S.plan(t.day,slot.id).find(q=>q.id===id); if(p&&t.h>=p.t0&&t.h<p.t1) return p; } return null; };   /* 先看時段（一天裡大部分的時間在這裡就結束，不算日曆）*/
  /* 原本的作息（不算這裡加的）*/
  let guard=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shoplife3d:guard']=()=>{ guard=false; };
  S.base=function(c,G){ if(typeof STORY==='undefined'||!STORY.schedEnt||!c) return null; const g=guard; guard=true; try{ return STORY.schedEnt(c,G); }catch(e){ return null; } finally { guard=g; } };
  const soft=(c,b)=>typeof SHOPNPC!=='undefined'&&SHOPNPC.soft?SHOPNPC.soft(c,b):false;   /* 作息表裡單純「在某一區走走」＝空檔（同一把尺）*/
  /* 分手以後有沒有回到朋友（挽回／和好；只讀現有的旗標）*/
  S.reconciled=function(G,id){ if(!G||!G.flags) return false;
    if(typeof MREL!=='undefined'&&MREL.rb){ let r=null; try{ r=MREL.rb(G,id); }catch(e){ r=null; } if(r&&r.step==='done') return true; }   /* 以安、語彤：「重新開始」那一場做完 */
    if(id==='heroine_05'&&typeof SISB4!=='undefined'&&SISB4.rebuild){ let rb=null; try{ rb=SISB4.rebuild(G); }catch(e){ rb=null; } if(rb&&rb.done) return true; }   /* 學姊：「她要的時間」演過 */
    /* AA_826 lawww_answers 9（AA-C 11-12）：沒有和好劇情的人（沛珊、芯慈、可昕…）＝分手那個學期結束、下一個學期開學起恢復（寒暑假不算，開學才算）；
       被發現劈腿而分開的（任何人）不恢復，除非重新交往（重新交往 ROM.exOf 本來就是 false）。只讀現有的紀錄：ROM 的 history 最後一筆 end（day、how）、V6EX 記的 EX_<id>_REASON。 */
    try{ const F=G.flags, R=F.romance&&F.romance[id], H=(R&&R.history)||[]; let e=null; for(let i=H.length-1;i>=0;i--) if(H[i]&&H[i].ev==='end'){ e=H[i]; break; }
      const caught=F['EX_'+id+'_REASON']==='caught'||(R&&(R.status==='friend_after_catch'||R.status==='paused'))||(e&&['two_hearts','mrel','zq_zr','caught'].includes(e.how));
      if(caught||!e||e.day==null||typeof CALENDAR==='undefined'||!CALENDAR.termOf) return false;
      const T0=CALENDAR.termOf(e.day), T1=CALENDAR.termOf(G.day); if(!T1) return false;   /* 現在在寒暑假（沒有學期）＝還沒開學 */
      if(!T0) return true;                                                                 /* 在寒暑假分手：下一個學期開學（現在在學期裡）就恢復 */
      return T1.id!==T0.id&&G.day>e.day; }catch(err){ return false; } };
  /* 分手後的前任、還沒回到朋友＝不排進店裡 */
  S.exBlock=function(G,id){ if(!G||!G.flags||typeof ROM==='undefined'||!ROM.exOf||!ROM.exOf(G,id)) return false; return !S.reconciled(G,id); };
  /* 為什麼不排（null＝排）：測試、盤點表用 */
  S.why=function(G,c,p){ const id=c.id, F=G.flags||{};
    if(S.CFG.oncePerDay){ const m=S.metSlot(G,id); if(m&&m!==p.slot) return 'once'; }   /* 今天別的那一餐已經在店裡遇到他了（AA_826）*/
    if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(id,G); if(pr&&pr.here===false) return 'presence'; }   /* 不在臺北（回老家、出國、交換、畢業以後；AA_826 meal_hello.note）*/
    if(S.exBlock(G,id)) return 'ex';   /* 分手後的前任、還沒回到朋友（AA_826 meal_hello.note @ f231f0514）*/
    if(id==='heroine_03'&&!F.YT_MET_JOB) return 'unmet';   /* 語彤：一盞茶屋當同事以前不出現（AA_610；STORY.schedEnt 同一條規則——那邊會直接把她的作息拿掉，這裡先說原因）*/
    if(typeof SHOPNPC!=='undefined'&&SHOPNPC.planDay&&SHOPNPC.planDay(G,id,G.day|0)) return 'plan';   /* 那一天跟玩家有約 */
    if(p.slot==='lunch'){ const L=F.L118_LUNCH; if(L&&L.day===G.day&&Array.isArray(L.with)&&L.with.includes(id)) return 'zhe_lunch';   /* 阿哲約的午餐 */
      const I=G.l118&&G.l118.inv; if(I&&I.done===G.day) return 'invite_lunch'; }   /* 當面約的 118 巷午餐成行的那一天 */
    if(typeof L118!=='undefined'&&L118.regActive){ const rs=(L8().regulars||[]).filter(r=>r.id===id&&r.from<p.t1&&r.to>p.t0); for(const r of rs) if(L118.regActive(r,Object.assign({},G,{hour:Math.max(r.from,p.t0)+0.001}))) return 'regular'; }   /* 他熟客的時段：照舊站在那間店門口 */
    const b=S.base(c,G); if(b&&(!S.CFG.overWander||!soft(c,b))) return 'clash';
    return null; };
  /* 玩家今天在店裡遇到他了（哪一餐；沒有＝null）*/
  S.metSlot=function(G,id){ const M=G&&G.flags&&G.flags.SHOP_MEAL_MET, v=M&&typeof M==='object'?M[id]:null; return Array.isArray(v)&&v[0]===dayHour(G).day?v[1]:null; };
  /* 每 0.5 秒：玩家在店裡、這裡排進這間店吃飯的人也真的在（E.npcs 有他）＝記「今天這一餐遇到了」*/
  S.markMet=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!S.CFG.oncePerDay||!Array.isArray(E.npcs)) return 0; const t=dayHour(G); let k=0;
    if(S.yueRules().length){ for(const n of E.npcs){ const id=n&&n.charId; if(!id||!S.yueDateIs(id)) continue; let p=null; try{ p=S.yueDate(G,id); }catch(e){ p=null; } if(p&&p.zone===G.zone) S.yueDateMark(G,id); } }   /* 可昕、學姊來越好吃（照 S.yueRules 算次數）：玩家在店裡看到她＝算一次 */
    for(const slot of S.CFG.slots){ if(t.h<slot.from||t.h>=slot.to) continue; if(!S.dayOk(G,t.day)) return 0;
      for(const p of S.plan(t.day,slot.id)){ if(p.zone!==G.zone||t.h<p.t0||t.h>=p.t1||S.metSlot(G,p.id)) continue; if(!E.npcs.some(n=>n&&n.charId===p.id)) continue;
        const F=G.flags||(G.flags={}); if(!F.SHOP_MEAL_MET||typeof F.SHOP_MEAL_MET!=='object'||Array.isArray(F.SHOP_MEAL_MET)) F.SHOP_MEAL_MET={}; F.SHOP_MEAL_MET[p.id]=[t.day,slot.id]; k++; } }
    return k; };
  const entMemo=new Map();
  S.seatAt=function(zone,id,day){ const def=typeof CROWD!=='undefined'&&CROWD.SHOP_ZONES?CROWD.SHOP_ZONES[zone]:null, seats=[]; if(def) for(const u of def.units) for(const s of u.seats||[]) seats.push(s);
    if(!seats.length) return null; const s=seats[hash('shopmeal-seat|'+zone+'|'+id+'|'+day)%seats.length]; return [s.x,s.z,s.lv|0]; };
  /* 可昕來越好吃找祐廷（AA_828 第 7 節第 2 點，企劃線 1d6055568c；規則在資料 SHOP_JOBS_AA828.yueMeal.dating＝{who, slot:'dinner', termMax:2}）：
     「交往中才把可昕排進越好吃晚餐的名單（她來公館找他），一學期最多兩次；沒交往不排。」——她不在平常那一份名單裡（S.people），只有這一種：
       交往中（G.flags.dating_<她>，和 SHOPMEET.helloSet 同一個）、那一天祐廷在越好吃有班（JOBS.due，沒有被考試、颱風請掉）而且班蓋到晚餐時段（稿沒有寫哪幾天：她是來找他的＝他有班的那幾天）、
       照晚餐原本的機會（S.CFG 的 p／pEnd，亂數＝日期＋人：同一天存讀檔、進出結果一樣）、到店和離開的時間照名單同一個算法；
       這個學期已經來過兩次（G.flags.SHOP_YUE_DATE＝{人|學期:[哪幾天]}；S.yueDateMark：祐廷上班幫她點了餐、或玩家在店裡看到她＝算一次）＝不再來。
     其他照名單的人：原本有作息、那天有約、不在臺北都不排（S.why）。舊存檔沒有 SHOP_YUE_DATE＝還沒來過。*/
  /* 學姊來越好吃（AA_828 第 9 節第 1 點，企劃線 3e9cd7d9d4；規則在資料 SHOP_JOBS_AA828.yueMeal.sis＝{who, met, inTaiwan, slot:'dinner', termMax:1, datingMax:2, gapWeeks:3}）：
     「不走晚餐名單的亂數，另定：認識她（met_sis）、她人在臺灣的學期、祐廷在越好吃有蓋到晚餐的班——每學期第一次符合的那一天演一次；交往中一學期兩次（第二次隔至少三週）。」
     和可昕同一套（S.yueRules：一人一條規則；S.yueDatePlan／yueDate／yueDateMark、G.flags.SHOP_YUE_DATE），差在：
       不擲機會（沒有 chance）——符合的那一天她就來；還沒算到次數（那一段沒演到、玩家也沒在店裡看到她）＝下一個有班的日子再來，所以「每學期第一次符合的那一天」一定輪得到；
       認識她＝G.flags[met] 或 SOCIAL.metD（和 lane118.js 她的老樣子同一個判斷），不用到朋友；她人在臺灣＝STORY.presence(她).here（characters.js：2028-08-02～12-23 在美國）；
       交往中（dating_<她>）一學期 datingMax 次，第二次離上一次至少 gapWeeks 週；那一天輪到這條規則的晚餐，她不再照名單亂數去別間（S.sched）。
     舊存檔沒有 SHOP_YUE_DATE＝這個學期還沒來過。*/
  let ruleSrc=null, ruleList=[]; const ruleMemo=new Map();
  S.yueRules=function(){ const Y=(typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828&&SHOP_JOBS_AA828.yueMeal)||null; if(Y===ruleSrc) return ruleList; ruleSrc=Y; ruleMemo.clear(); const out=ruleList=[]; if(!Y) return out; const ok=d=>d&&d.who&&d.slot&&d.termMax>0;
    if(ok(Y.dating)) out.push(Object.assign({dating:true,chance:true},Y.dating)); if(ok(Y.sis)) out.push(Y.sis); return out; };
  S.yueDateCfg=function(){ const Y=typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828&&SHOP_JOBS_AA828.yueMeal, d=Y&&Y.dating; return d&&d.who&&d.slot&&d.termMax>0?d:null; };
  S.yueRule=function(id){ const R=S.yueRules(); if(!R.length||!id) return null; if(ruleMemo.has(id)) return ruleMemo.get(id); const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c) return null;
    const al=typeof JOBS!=='undefined'&&JOBS.YUE_ALIAS?JOBS.YUE_ALIAS[id]:null, N=[c.name,c.nickname,c.phoneName,al], r=R.find(d=>N.includes(d.who))||null; ruleMemo.set(id,r); return r; };
  S.yueDateIs=function(id){ return !!S.yueRule(id); };
  S.yueDateDays=function(G,id,tid){ const R=G&&G.flags&&G.flags.SHOP_YUE_DATE, v=R&&typeof R==='object'?R[id+'|'+tid]:null; return Array.isArray(v)?v:[]; };
  S.yueDateZone=function(){ if(typeof JOBS==='undefined'||!JOBS.ZONE_KEY) return null; for(const z of Object.keys(JOBS.ZONE_KEY)) if(JOBS.ZONE_KEY[z]==='yue') return z; return null; };
  /* 那一天祐廷在越好吃有班（沒有被考試、颱風請掉），而且班蓋到這一餐 */
  S.yueShift=function(G,day,slot){ if(typeof JOBS==='undefined'||!JOBS.active||!JOBS.due||!JOBS.hrs) return false; try{ if(!JOBS.active(G,'yue')||!JOBS.due(G,'yue',day)) return false; const h=JOBS.hrs('yue',day); return !!h&&h[0]<slot.to&&h[1]>slot.from; }catch(e){ return false; } };
  /* 這一餐她照規則會不會來（現在在那一餐的時段裡才算；不看她幾點到）；S.yueDate＝現在她人在店裡的那一段 */
  S.yueDatePlan=function(G,id){ const d=S.yueRule(id); if(!d||!G||!G.flags) return null; const F=G.flags, dating=!!F['dating_'+id]; if(d.dating&&!dating) return null;
    const t=dayHour(G), slot=S.CFG.slots.find(q=>q.id===d.slot); if(!slot||t.h<slot.from||t.h>=slot.to||!S.dayOk(G,t.day)) return null;
    if(d.met&&!(F[d.met]||(typeof SOCIAL!=='undefined'&&SOCIAL.metD&&SOCIAL.metD(id)))) return null;
    if(d.inTaiwan&&typeof STORY!=='undefined'&&STORY.presence){ let pr=null; try{ pr=STORY.presence(id,G); }catch(e){ pr=null; } if(pr&&pr.here===false) return null; }
    const zone=S.yueDateZone(); if(!zone||!S.yueShift(G,t.day,slot)) return null;
    const T=CALENDAR.termOf(t.day), seen=S.yueDateDays(G,id,T.id), max=dating&&d.datingMax>0?d.datingMax:d.termMax;
    if(!seen.includes(t.day)){ if(seen.length>=max) return null; if(d.gapWeeks>0&&seen.length&&t.day-Math.max.apply(null,seen)<d.gapWeeks*7) return null; }
    const r=prng(hash('shopmeal-yuedate|'+t.day+'|'+id)); if(d.chance){ const wk=CALENDAR.weekend(t.day)||CALENDAR.holiday(t.day); if(r()>=(wk?slot.pEnd:slot.p)) return null; }
    const t0=+(slot.from+r()*S.CFG.start).toFixed(3), t1=+Math.min(slot.to,t0+S.CFG.stay[0]+r()*(S.CFG.stay[1]-S.CFG.stay[0])).toFixed(3);
    if(!S.shopOpen(zone,t.day,t0,t1)) return null; return {id,zone,t0,t1,slot:slot.id,yueDate:true}; };
  S.yueDate=function(G,id){ const p=S.yueDatePlan(G,id); if(!p) return null; const t=dayHour(G); return t.h<p.t0||t.h>=p.t1?null:p; };
  S.yueDateMark=function(G,id){ if(!G||!S.yueDateIs(id)||typeof CALENDAR==='undefined') return false; const t=dayHour(G), T=CALENDAR.termOf(t.day); if(!T) return false; const F=G.flags||(G.flags={});
    if(!F.SHOP_YUE_DATE||typeof F.SHOP_YUE_DATE!=='object'||Array.isArray(F.SHOP_YUE_DATE)) F.SHOP_YUE_DATE={}; const k=id+'|'+T.id, L=Array.isArray(F.SHOP_YUE_DATE[k])?F.SHOP_YUE_DATE[k]:(F.SHOP_YUE_DATE[k]=[]); if(L.includes(t.day)) return false; L.push(t.day); return true; };
  S.sched=function(c,G){ if(guard||depth>0||!c||!c.id||!G||typeof CALENDAR==='undefined') return null;   /* depth>0＝別的模組正在算「他原本的作息」（見 S.wrapOthers）：這裡加的不算原本的 */ const yr=S.yueRule(c.id), yp=yr?S.yueDatePlan(G,c.id):null, yn=yp&&dayHour(G).h>=yp.t0&&dayHour(G).h<yp.t1?yp:null; let p=yp&&!yr.chance?yn:(S.planNow(G,c.id)||yn);
    /* 不擲機會的規則（學姊，AA_828 第 9 節第 1 點「不走晚餐名單的亂數，另定」）：輪到規則的那一餐只照規則（不照名單亂數去別間）；
       沒輪到（這學期的次數用完、還沒隔滿三週…）而祐廷那一天在越好吃有蓋到這一餐的班＝她也不照名單亂數來越好吃（次數才會是規則寫的那幾次）；祐廷沒有班的日子照名單原本的。*/
    if(p&&p!==yn&&yr&&!yr.chance&&p.zone===S.yueDateZone()){ const sl=S.CFG.slots.find(q=>q.id===p.slot); if(sl&&sl.id===yr.slot&&S.yueShift(G,dayHour(G).day,sl)) p=null; }
    if(!p) return null; if(S.why(G,c,p)) return null;
    const key=p.id+'|'+(G.day|0)+'|'+p.slot; let e=entMemo.get(key);
    if(!e){ const sa=S.seatAt(p.zone,p.id,G.day|0); if(!sa) return null; const wd=G.weekday!=null?G.weekday:wdOf(G.day);
      e={days:[wd],from:p.t0,to:p.t1,zone:p.zone,act:'eat',seatAt:sa,noPair:true,shopMeal:p.slot,note:'SHOP-LIFE-AUDIT-1112 吃飯時間在店裡（第一句在 src/shopmeet3d.js）'}; if(entMemo.size>300) entMemo.clear(); entMemo.set(key,e); }
    return e; };
  /* 祐廷在店裡上班、同學來吃飯的那一段（src/jobs3d.js S.mealBring，2026-11-12 第五輪；BB：只有旁白、店裡 3D 沒有人）：
     上班那一段的時間停在那一段開始的時候，來吃飯的人照名單可能晚幾十分鐘才到——那一段要演＝他這時候就進店。
     S.bringIn(GM,id,ent)：把他那一筆作息（ent：這一班裡他在這間店吃飯的那一筆）從現在起就算數（holds，只在記憶體、不進存檔；到 ent.to 為止、只有那一天、那一間店），
       再照平常「待在店裡補人」跑一次（STORY.refreshSchedule）：他從門口走進來、走到位子坐下（populateSchedule 原本的做法）；之後照同一筆作息留在位子上吃，時段結束照平常起身走出去。
     S.schedHold（STORY.SCHED_X 的第一個：這一段已經演出來了，他人就在這裡）。讀檔＝holds 清掉（LOADLOCKS）：照名單原本的時間。*/
  const holds=new Map();
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shoplife3d:holds']=()=>{ holds.clear(); };
  S.schedHold=function(c,G){ if(!holds.size||!c||!c.id||!G) return null; const H=holds.get(c.id); if(!H) return null; const t=dayHour(G);
    if(t.day!==H.day||t.h>=H.ent.to||t.h<H.ent.from){ if(t.day!==H.day||t.h>=H.ent.to) holds.delete(c.id); return null; } return H.ent; };
  S.bringIn=function(GM,id,ent){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!ent||!ent.zone||ent.zone!==G.zone||typeof ent.to!=='number') return null; const t=dayHour(G); if(t.h>=ent.to) return null;
    const cur=holds.get(id); if(!cur||cur.day!==t.day||cur.src!==ent) holds.set(id,{day:t.day,src:ent,ent:Object.assign({},ent,{from:Math.min(typeof ent.from==='number'?ent.from:t.h,t.h),days:[G.weekday!=null?G.weekday:wdOf(t.day)]})});
    S.installHold(); const find=()=>(E.npcs||[]).find(n=>n&&n.charId===id)||(GM.npc&&GM.npc[id])||null; let n=find();
    if(!n&&typeof STORY!=='undefined'&&STORY.refreshSchedule){ try{ STORY.refreshSchedule(GM); }catch(e){ console.warn('SHOPLIFE.bringIn',e); } n=find(); }
    if(!n) holds.delete(id);   /* 帶不進來（沒有空位…）＝不留著那一筆 */
    return n; };
  S.installHold=function(){ if(typeof STORY==='undefined'||!Array.isArray(STORY.SCHED_X)) return false; const X=STORY.SCHED_X; if(AP.indexOf.call(X,S.schedHold)===0) return true;
    const j=AP.indexOf.call(X,S.schedHold); if(j>0) X.splice(j,1); AP.unshift.call(X,S.schedHold); return true; };
  /* 這一天這一餐真的會出現的人（看得到原本的作息；給測試、盤點表）*/
  S.who=function(G,slotId){ const t=dayHour(G); if(!S.dayOk(G,t.day)) return []; const out=[]; for(const p of S.plan(t.day,slotId)){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[p.id]; if(!c) continue; const g=Object.assign({},G,{hour:(p.t0+p.t1)/2}); if(!S.why(g,c,p)) out.push(p); } return out; };

  /* 別的模組（店內偶遇 SHOPENC、新店面遇得到人 SHOPNPC……）排人以前會先問「他原本的作息是什麼」（各自擋掉自己那一筆，再叫 STORY.schedEnt）。
     這裡排在最後面，那一問會問到這裡加的「在店裡吃飯」——他們會以為他有事，AA 寫好的那一列反而不出現（優先順序倒過來）。
     所以把 STORY.SCHED_X 裡別人的函式各包一層、記「現在在別人的函式裡」（depth）：那時候這裡一律回 null。結果：別人的每一列都比這裡優先。*/
  let depth=0;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shoplife3d:depth']=()=>{ depth=0; };
  const AP=Array.prototype;
  const wrapFn=f=>{ if(typeof f!=='function'||f===S.sched||f===S.schedHold||f._shopLifeWrap) return f; const w=function(c,G){ depth++; try{ return f(c,G); } finally { depth--; } }; w._shopLifeWrap=f; return w; };
  S.wrapOthers=function(){ if(typeof STORY==='undefined'||!Array.isArray(STORY.SCHED_X)) return 0; let k=0; const X=STORY.SCHED_X;
    for(let i=0;i<X.length;i++){ const w=wrapFn(X[i]); if(w!==X[i]){ X[i]=w; k++; } }
    const j=AP.indexOf.call(X,S.sched); if(j>=0&&j!==X.length-1){ X.splice(j,1); AP.push.call(X,S.sched); }   /* 永遠排最後 */
    if(!X._shopLife){   /* 有些模組用 SCHED_X.includes(自己的函式) 判斷加過沒（guitar3d.js、aa613_3d.js，每次進店都判一次）：包起來以後還是要認得，不然會一直重複加 */
      Object.defineProperty(X,'_shopLife',{value:true,enumerable:false});
      const def=(k2,fn)=>Object.defineProperty(X,k2,{value:fn,enumerable:false,configurable:true,writable:true});
      def('indexOf',f=>{ const i=AP.indexOf.call(X,f); return i>=0?i:X.findIndex(w=>!!w&&w._shopLifeWrap===f); });
      def('includes',f=>X.indexOf(f)>=0);
      def('push',function(){ for(const f of arguments){ const w=wrapFn(f), j2=AP.indexOf.call(X,S.sched); if(j2>=0&&f!==S.sched) X.splice(j2,0,w); else AP.push.call(X,w); } return X.length; }); }   /* 之後才加的：包好、插在這裡的前面 */
    return k; };
  /* ---------- 掛上去 ---------- */
  S.tick=function(GM){ try{ S.dedupClerk(GM); S.tendSync(GM); if(GM&&GM.G) S.closeClerks(GM.G.zone,GM); S.wrapOthers(); S.markMet(GM); }catch(e){ console.warn('SHOPLIFE.tick',e); } return false; };   /* wrapOthers：之後才載入的模組加的作息也包起來 */
  S.install=function(){ if(typeof STORY==='undefined') return false;
    if(Array.isArray(STORY.SCHED_X)&&!STORY._shopLifeSched){ STORY.SCHED_X.push(S.sched); STORY._shopLifeSched=true; }
    S.wrapOthers();
    if(Array.isArray(STORY.TICKS)&&!STORY._shopLifeTick){ STORY.TICKS.push(S.tick); STORY._shopLifeTick=true; }
    if(STORY.populate&&!STORY._shopLifePop){ const p0=STORY.populate; STORY._shopLifePop=true;
      STORY.populate=function(zoneId,GM){ try{ if(GM&&GM.E) S.attachSeats(GM.E); }catch(e){ console.warn('SHOPLIFE.attachSeats',e); }
        const r=p0.apply(this,arguments);
        try{ S.placeClerk(zoneId,GM); }catch(e){ console.warn('SHOPLIFE.placeClerk',e); }
        try{ S.placeTenders(zoneId,GM); S.placeL118Tenders(zoneId,GM); S.tendSync(GM); S.closeClerks(zoneId,GM); }catch(e){ console.warn('SHOPLIFE.placeTenders',e); }
        return r; }; }
    return true; };
  S._reset=()=>{ guard=false; depth=0; planMemo.clear(); entMemo.clear(); holds.clear(); ruleSrc=null; ruleList=[]; ruleMemo.clear(); };
  S.install();
  return S;
})();
