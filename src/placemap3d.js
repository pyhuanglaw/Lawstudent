/* ===== 手機「地點」的簡圖（UX-PHONE-MAP-1023，使用者 2026-10-23「手機上選擇要前往哪裡 可以用地圖方式顯示?」）=====
   程式畫的示意圖（SVG），不是正式美術地圖（正式的之後 BB 照 D97 向使用者要）。北朝上，方位和遊戲一樣（校門在西邊、法學院在北邊、總圖在東邊、宿舍在南邊；
   公館在校門外、溫州街在公館北端往西北、118 巷在法學院後門外），但位置是示意的：為了手指點得到，圖釘拉開排、太近的地方合成一個。
   - 地點是 PLACES.quickList()（game3d.js PLACE_LIST）的 [zone,label,spawn]；同一棟、同一區的幾個地點合成一個圖釘（霖澤館前／大廳／201 教室；博雅、普通；公館的店；溫州街和兩點半）。
   - 點地圖：整張圖都是點擊範圍，選離手指最近的圖釘（S.pick；BB-B 10-23：圖釘的透明圓在 390 寬的手機上只有 27 px、相鄰的重疊會點錯）；
     選中的圖釘變藍，下面列出那裡的地點（每個一顆「前往」，和清單一樣用 data-place）；再點一次收起來。
   - 你在這裡：所在地點那個圖釘外面一圈紅色（校園照座標找最近的圖釘）。
   - 不在圖上的地點（美國、日本、之後新加的）照舊只在清單裡。
   game3d.js placesHTML 呼叫 PLACEMAP.html；svg 的 data-pmapsvg 點擊在 game3d.js 接（phonePin）。
   測試：node tests/placemap_unit.js */
'use strict';
const PLACEMAP=(function(){
  const S={};
  S.VB=[0,0,360,262];   /* viewBox；手機（390 寬）上約 302 px＝每單位 0.84 px：圖釘中心至少相隔 52（44 px）*/
  /* 圖釘：x,y＝圖上座標；lab＝地名寫在哪一邊（t 上、b 下、l 左、r 右）；cx,cz＝校園裡的實際座標（找「你在這裡」用）；m＝[zone,label] */
  S.PINS=[
    {id:'lane118',name:'118 巷',x:290,y:24,lab:'r',m:[['lane118','118 巷']]},
    {id:'linze',name:'法律系館A',x:270,y:78,lab:'l',cx:30,cz:-104,m:[['campus','首都帝大校園（法律系館A前）'],['linze','法律系館A（大廳）'],['classroom','法律系館A 201 教室']]},
    {id:'wancai',name:'法律系館B',x:326,y:94,lab:'l',cx:88.94,cz:-84.41,m:[['wancai','法律系館B（大廳）'],['lawlib','法律學院圖書館']]},
    {id:'soclib',name:'社科圖',x:268,y:132,lab:'r',cx:11,cz:-66,m:[['soclib','社科院圖書館']]},
    {id:'boya',name:'博思・普通',x:206,y:112,lab:'t',cx:-38,cz:-60,m:[['campus','博思教學館'],['campus','普通教學館']]},
    {id:'avenue',name:'椰影大道',x:220,y:172,lab:'t',cx:-40,cz:6,m:[['campus','椰影大道・晨思鐘']]},
    {id:'gate',name:'校門',x:162,y:172,lab:'t',cx:-112,cz:0,m:[['campus','校門口']]},
    {id:'library',name:'總圖',x:330,y:172,lab:'t',cx:86,cz:0,m:[['library_hall','總圖書館（大廳）']]},
    {id:'gongtong',name:'共同',x:262,y:206,lab:'b',cx:2,cz:22,m:[['campus','共同教學館']]},
    {id:'gdorm',name:'女一舍',x:182,y:228,lab:'r',cx:-93,cz:56,m:[['campus','大一女舍（門口）']]},
    {id:'dorm',name:'宿舍',x:318,y:228,lab:'b',cx:47,cz:60,m:[['dorm','宿舍']]},
    {id:'gym',name:'體育館',x:190,y:59,lab:'l',cx:-75,cz:-125,m:[['gym','新體育館（大廳）']]},   /* XS-GATE-NORTH-1105（使用者 11-05「體育館…改到新月台法學院中間」）：北牆邊、望月台東邊（門口 x −75、z −125）；原本和宿舍同一顆圖釘 */   /* 新體育館（門口 x 74、z 59）在男宿東邊，圖上放不下另一顆圖釘（至少相隔 52）：和宿舍同一顆（同 博雅・普通）*/
    {id:'gongguan',name:'公館',x:100,y:172,lab:'t',m:[['gongguan','公館商圈'],['gongguan','捷運公館站'],['noodle','公館燒臘'],['bookstore','頁間書屋'],['cvs','日和便利店'],['aoki','青木茶室'],['afar','afar café'],['daybreak','Daybreak'],['yangyang','洋洋鹹酥雞'],['corner_records','轉角唱片'],['bikeshop','慢輪單車'],['gg_antai','安泰藥局'],['gg_xianguo','汀州鮮果'],['gg_rongendian','榮恩典文具社'],['flower_notes','花序 Flower Notes']]},
    {id:'wenzhou',name:'溫州街',x:66,y:82,lab:'t',m:[['wenzhou','溫州街'],['cafe','2:30 AM'],['wz_mokuyobi','木曜日'],['wz_offbeat','日常失速'],['wz_teahouse','一盞'],['wz_brunch','SUNNY SIDE'],['wz_print','阿德影印輸出'],['wz_lin','林家乾麵'],['wz_teishoku','小路'],['wenzhou','帝大紅茶'],['wenzhou','夏日冰菓室'],['wenzhou','溫州書屋']]},   /* 溫州街每一家店（WZ-QUICKTRAVEL-1110，使用者 11-10「地圖上的馬上過去要改」）*/
    /* 汀州路（TINGZHOU-SHOPS-MOVE-1110，使用者 11-10 X321「同步更新地圖標記」；「公館商圈往南新增汀州路商圈」＝圖上放在公館下面）：街＋使用者指定名字的八間店（名字照 src/data/tingzhou_layout.js，tests/tingzhou_places_1110_unit.js 對） */
    {id:'tingzhou',name:'汀州路',x:104,y:240,lab:'l',m:[['tingzhou','汀州路'],['tingzhou','泰米村食'],['tingzhou','洗樂洗衣坊'],['tingzhou','印得好'],['tingzhou','溫特寶邸'],['tingzhou','汀州聯通'],['tingzhou','東南大聯商行'],['tingzhou','客居雲南'],['tingzhou','越好吃小館'],['tz_limao','禮貌生財']]},
    /* 新生南路（XS-PHONEMAP-1105；XS-GATE-NORTH-1105 改）：校園北牆外西段（側門開在北牆、往北出去），往下接溫州街。地名寫在左邊 */
    {id:'xinsheng',name:'新生南路',x:138,y:44,lab:'l',m:[['xinsheng','新生南路'],['xs_shanlan','山嵐書店'],['xs_nanyang','南洋戲院'],['xs_dakou','大口漢堡'],['xs_tongxian','同弦樂器'],['xs_dabu','大步球鞋'],['xs_haopai','好拍運動'],['xs_xsports','新生運動廣場']]}];
  /* 區域的底：校園、公館（羅斯福路那一條）、溫州街 */
  S.AREAS=[{id:'campus',name:'首都帝大校園',x:146,y:52,w:208,h:200,lx:154,ly:68,c:'#2c3a2f'},
    {id:'gongguan',name:'',x:74,y:126,w:62,h:96,c:'#3a3329'},
    {id:'tingzhou',name:'',x:74,y:226,w:62,h:28,c:'#37312b'},   /* 汀州路：公館的南邊（接在公館那一塊下面）*/
    {id:'wenzhou',name:'',x:14,y:56,w:122,h:56,c:'#33302c'},
    {id:'xinsheng',name:'',x:137,y:40,w:8,h:72,c:'#3a3633'},{id:'xinsheng_n',name:'',x:137,y:40,w:69,h:8,c:'#3a3633'}];   /* 新生南路（XS-GATE-NORTH-1105）：校園北牆外西段（側門往北出去）＋往下接溫州街；不再沿著公館那一側 */
  const key=pl=>pl[0]+'|'+pl[1];
  const inPin=(p,pl)=>p.m.some(m=>m[0]===pl[0]&&m[1]===pl[1]);
  S.pinOf=function(pl){ return S.PINS.find(p=>inPin(p,pl))||null; };
  /* 玩家在哪個圖釘：校園照座標找最近的；其他區域＝那一區的圖釘；不在圖上＝null */
  S.ZONE_PIN={linze:'linze',classroom:'linze',wancai:'wancai',lawlib:'wancai',library_hall:'library',library:'library',library_b1:'library',library_carrels:'library',library_stacks:'library',soclib:'soclib',soclib_2f:'soclib',dorm:'dorm',dorm_hall:'dorm',lane118:'lane118',gym:'gym',gym_b1:'gym',gym_arena:'gym',
    gongguan:'gongguan',noodle:'gongguan',bookstore:'gongguan',bikeshop:'gongguan',aoki:'gongguan',afar:'gongguan',daybreak:'gongguan',yangyang:'gongguan',corner_records:'gongguan',cvs:'gongguan',cafe:'wenzhou',wz_mokuyobi:'wenzhou',wz_offbeat:'wenzhou',wz_teahouse:'wenzhou',wz_brunch:'wenzhou',wz_print:'wenzhou',wz_lin:'wenzhou',wz_teishoku:'wenzhou',wenzhou:'wenzhou',boya:'boya',putong:'boya',gongtong:'gongtong',
    gg_antai:'gongguan',gg_xianguo:'gongguan',gg_rongendian:'gongguan',flower_notes:'gongguan',tz_limao:'tingzhou',
    tingzhou:'tingzhou',xinsheng:'xinsheng',xs_shanlan:'xinsheng',xs_nanyang:'xinsheng',xs_nanyang_hall:'xinsheng',xs_dakou:'xinsheng',xs_tongxian:'xinsheng',xs_dabu:'xinsheng',xs_haopai:'xinsheng',xs_xsports:'xinsheng'};
  S.hereId=function(zone,x,z){ if(zone==='campus'&&x!=null){ let b=null, bd=1e9; for(const p of S.PINS){ if(p.cx==null) continue; const d=Math.hypot(p.cx-x,p.cz-z); if(d<bd){ bd=d; b=p.id; } } return b; }
    return S.ZONE_PIN[zone]||(typeof PLACES!=='undefined'&&PLACES.base?S.ZONE_PIN[PLACES.base(zone)]:null)||null; };   /* 沒寫的店、樓層：照那一棟、那一條街（PLACES.base：wz_→溫州街、xs_→新生南路）*/
  /* 點地圖的位置（圖上座標）→ 最近的圖釘（只算畫出來的那些；60 以內） */
  S.pick=function(x,y,ids){ let b=null, bd=60; for(const p of S.PINS){ if(ids&&!ids.includes(p.id)) continue; const d=Math.hypot(p.x-x,p.y-y); if(d<bd){ bd=d; b=p.id; } } return b; };
  /* ===== 快速前往的清單分地區（QUICK-TRAVEL-AREAS-1105，使用者 11-05 07:3x「手機可以快速前往的選項很亂 依照地區區分 點那個地區會出現那個地區的店面可以選 分類階層要整潔好區分」）=====
     第一層只有地區（首都帝大校園、公館、溫州街、新生南路、118 巷），點了展開那一區的建築、店（每個照舊一顆 data-place 的「前往」；沒去過的寫「還沒去過」、沒有按鈕；關著的寫「已閉館」），
     再點一次收起來；一次只開一區；預設開你所在的那一區。地區照圖釘算：圖釘在哪一塊底色（S.AREAS）上就是哪一區，不在任何一塊上的（118 巷）自己一區；地區名照 PLACES.names。
     不在圖釘上的地點（之後新加、還沒放上地圖的）照舊排在最後、不分區。測試：node tests/quick_travel_areas_unit.js */
  S.GROUPS=['campus','gongguan','tingzhou','wenzhou','xinsheng','lane118'];   /* 地區的順序 */
  S.areaOfPin=function(p){ if(!p) return null; const a=S.AREAS.find(q=>p.x>=q.x&&p.x<=q.x+q.w&&p.y>=q.y&&p.y<=q.y+q.h); return a?a.id:p.id; };
  S.areaOf=function(pl){ return S.areaOfPin(S.pinOf(pl)); };
  S.areaName=function(id){ const a=S.AREAS.find(q=>q.id===id); return (typeof PLACES!=='undefined'&&PLACES.names&&PLACES.names[id])||(a&&a.name)||id; };
  /* 你所在的地區（預設展開）：照「你在這裡」的圖釘 */
  S.hereArea=function(here){ if(!here) return null; const id=S.hereId(here.zone,here.x,here.z); return id?S.areaOfPin(S.PINS.find(p=>p.id===id)):null; };
  S.row=function(pl,st,ht){ return '<div class="item phrow"><div>'+esc(pl[1])+'<div class="muted">'+(!st.known?'還沒去過':(st.here?'你在這裡':'約 '+st.mins+' 分鐘'+(st.bike?'（騎車）':'')))+(ht?'・'+esc(ht):'')+'</div></div>'+(st.here||!st.known?'':'<button class="btn'+(st.open?' pri':'')+'" data-place="'+esc(key(pl))+'">'+(st.open?'前往':'已閉館')+'</button>')+'</div>'; };   /* 和 game3d.js 原本的清單同一個樣子；已閉館的按鈕按了說幾點開 */
  /* places＝PLACE_LIST()；open＝展開的地區 id（undefined＝你所在的那一區；''／null＝全部收起來）；回傳 '' ＝不分區（美國、日本：照舊平鋪）*/
  S.listHTML=function(places,state,open,here,hours){ const P=S.PINS.filter(p=>places.some(pl=>inPin(p,pl))); if(P.length<3) return '';
    if(open===undefined) open=S.hereArea(here);
    const G={}, rest=[]; for(const pl of places){ const a=S.areaOf(pl); if(a) (G[a]=G[a]||[]).push(pl); else rest.push(pl); }
    const ids=S.GROUPS.filter(id=>G[id]).concat(Object.keys(G).filter(id=>!S.GROUPS.includes(id)));
    let out=''; for(const id of ids){ const L=G[id], on=open===id;
      out+='<div class="item" data-parea-box="'+esc(id)+'"><button class="btn'+(on?' pri':'')+'" data-parea="'+esc(id)+'" aria-expanded="'+on+'" style="width:100%;min-height:44px;display:flex;justify-content:space-between;align-items:center"><span>'+esc(S.areaName(id))+'（'+L.length+'）</span><span aria-hidden="true">'+(on?'▾':'▸')+'</span></button>';
      if(on) for(const pl of L) out+=S.row(pl,state(pl),hours?hours(pl[3]||pl[0]):'');
      out+='</div>'; }
    for(const pl of rest) out+=S.row(pl,state(pl),hours?hours(pl[3]||pl[0]):'');
    return out; };
  /* 點了地區：同一區再點一次＝收起來（''），別的區＝換那一區 */
  S.toggleArea=function(cur,id,here){ const c=cur===undefined?S.hereArea(here):cur; return c===id?'':id; };
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  const FS=13;   /* 地名的字（手機上約 11～12 px）*/
  const label=(p,known)=>{ const f=known?'#f4efe6':'#8a8577', a={t:[p.x,p.y-11,'middle'],b:[p.x,p.y+21,'middle'],l:[p.x-11,p.y+5,'end'],r:[p.x+11,p.y+5,'start']}[p.lab||'t'];
    return '<text x="'+a[0]+'" y="'+a[1]+'" font-size="'+FS+'" fill="'+f+'" text-anchor="'+a[2]+'">'+esc(p.name)+'</text>'; };
  /* places＝PLACE_LIST()；state(pl)＝game3d.js placeState（known/open/here/mins/bike）；sel＝選中的圖釘 id；here＝{zone,x,z}；hours(zone)＝營業時間字 */
  S.html=function(places,state,sel,here,hours){ const P=S.PINS.map(p=>({p,L:places.filter(pl=>inPin(p,pl))})).filter(o=>o.L.length);
    if(P.length<3) return '';   /* 美國、日本：地點不在這張圖上 */
    const hid=here?S.hereId(here.zone,here.x,here.z):null;
    let svg='<svg data-pmapsvg="'+esc(P.map(o=>o.p.id).join(','))+'" viewBox="'+S.VB.join(' ')+'" role="img" aria-label="地點地圖" style="width:100%;height:auto;display:block;border-radius:10px;background:#1b1f27;cursor:pointer;touch-action:manipulation">';
    for(const a of S.AREAS) svg+='<rect x="'+a.x+'" y="'+a.y+'" width="'+a.w+'" height="'+a.h+'" rx="10" fill="'+a.c+'"/>'+(a.name?'<text x="'+a.lx+'" y="'+a.ly+'" font-size="12" fill="#9aa39a">'+esc(a.name)+'</text>':'');
    svg+='<path d="M150 172 H322" stroke="#58664f" stroke-width="6" stroke-linecap="round" opacity=".7"/>';   /* 椰林大道 */
    svg+='<text x="18" y="24" font-size="12" fill="#9aa39a">北 ↑</text>';
    for(const {p,L} of P){ const st=L.map(state), known=st.some(s=>s.known), open=st.some(s=>s.known&&s.open&&(!s.here||st.length===1)), on=sel===p.id;   /* 人就在這裡、圖釘只有這一個地點：照「可以前往」的顏色（紅圈表示你在這裡），不是灰色（BB-B 10-23）*/
      const fill=on?'#7fc4c9':(open?'#e9b96a':(known?'#8a8577':'#4b4a46'));
      if(p.id===hid) svg+='<circle cx="'+p.x+'" cy="'+p.y+'" r="11" fill="none" stroke="#e07a6a" stroke-width="2.5"/>';
      svg+='<g data-pmap="'+esc(p.id)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(on?8:6.5)+'" fill="'+fill+'" stroke="#161a22" stroke-width="2"/>'+label(p,known)+'</g>'; }
    svg+='</svg>';
    const dot=(c,ring)=>'<span style="display:inline-block;width:10px;height:10px;border-radius:50%;'+(ring?'border:2px solid '+c+';box-sizing:border-box':'background:'+c)+';margin:0 4px 0 10px;vertical-align:-1px"></span>';
    let out='<div class="item">'+svg+'<div class="muted" style="margin-top:6px;font-size:12px">'+(hid?dot('#e07a6a',true).replace('margin:0 4px 0 10px','margin:0 4px 0 0')+'你在這裡':'')+dot('#e9b96a')+'可以前往'+dot('#8a8577')+'現在不能去</div><div class="muted" style="margin-top:4px">點地圖上的地方，下面會出現可以前往的地點。</div></div>';
    const S0=P.find(o=>o.p.id===sel); if(S0){ out+='<div class="item"><b>'+esc(S0.p.name)+'</b>';
      for(const pl of S0.L){ const st=state(pl), ht=hours?hours(pl[3]||pl[0]):'';
        out+='<div class="phrow" style="margin-top:6px"><div>'+esc(pl[1])+'<div class="muted">'+(!st.known?'還沒去過':(st.here?'你在這裡':'約 '+st.mins+' 分鐘'+(st.bike?'（騎車）':'')))+(ht?'・'+esc(ht):'')+'</div></div>'+(st.here||!st.known?'':'<button class="btn'+(st.open?' pri':'')+'" data-place="'+esc(key(pl))+'">'+(st.open?'前往':'已閉館')+'</button>')+'</div>'; }
      out+='</div>'; }
    return out; };
  return S;
})();
