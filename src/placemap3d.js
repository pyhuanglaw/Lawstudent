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
    {id:'wancai',name:'法律系館B',x:324,y:82,lab:'t',cx:92,cz:-100,m:[['wancai','法律系館B（大廳）'],['lawlib','法律學院圖書館']]},
    {id:'soclib',name:'社科圖',x:268,y:132,lab:'r',cx:11,cz:-66,m:[['soclib','社科院圖書館']]},
    {id:'boya',name:'博思・普通',x:206,y:112,lab:'t',cx:-38,cz:-60,m:[['campus','博思教學館'],['campus','普通教學館']]},
    {id:'avenue',name:'椰影大道',x:220,y:172,lab:'t',cx:-40,cz:6,m:[['campus','椰影大道・晨思鐘']]},
    {id:'gate',name:'校門',x:162,y:172,lab:'t',cx:-112,cz:0,m:[['campus','校門口']]},
    {id:'library',name:'總圖',x:330,y:172,lab:'t',cx:86,cz:0,m:[['library_hall','總圖書館（大廳）']]},
    {id:'gongtong',name:'共同',x:262,y:206,lab:'b',cx:2,cz:22,m:[['campus','共同教學館']]},
    {id:'gdorm',name:'女一舍',x:182,y:228,lab:'r',cx:-93,cz:56,m:[['campus','大一女舍（門口）']]},
    {id:'dorm',name:'宿舍・體育館',x:318,y:228,lab:'b',cx:47,cz:60,m:[['dorm','宿舍'],['gym','新體育館（大廳）']]},   /* 新體育館（門口 x 74、z 59）在男宿東邊，圖上放不下另一顆圖釘（至少相隔 52）：和宿舍同一顆（同 博雅・普通）*/
    {id:'gongguan',name:'公館',x:100,y:172,lab:'t',m:[['gongguan','公館商圈'],['gongguan','捷運公館站'],['noodle','阿鳳麵店'],['bookstore','舊路書房'],['cvs','日日便利']]},
    {id:'wenzhou',name:'溫州街',x:66,y:82,lab:'t',m:[['wenzhou','溫州街'],['cafe','兩點半 Café']]}];
  /* 區域的底：校園、公館（羅斯福路那一條）、溫州街 */
  S.AREAS=[{id:'campus',name:'首都帝大校園',x:146,y:52,w:208,h:200,lx:154,ly:68,c:'#2c3a2f'},
    {id:'gongguan',name:'',x:74,y:126,w:62,h:96,c:'#3a3329'},
    {id:'wenzhou',name:'',x:14,y:56,w:122,h:56,c:'#33302c'}];
  const key=pl=>pl[0]+'|'+pl[1];
  const inPin=(p,pl)=>p.m.some(m=>m[0]===pl[0]&&m[1]===pl[1]);
  S.pinOf=function(pl){ return S.PINS.find(p=>inPin(p,pl))||null; };
  /* 玩家在哪個圖釘：校園照座標找最近的；其他區域＝那一區的圖釘；不在圖上＝null */
  S.ZONE_PIN={linze:'linze',classroom:'linze',wancai:'wancai',lawlib:'wancai',library_hall:'library',library:'library',library_b1:'library',library_carrels:'library',library_stacks:'library',soclib:'soclib',dorm:'dorm',dorm_hall:'dorm',lane118:'lane118',gym:'dorm',gym_b1:'dorm',gym_arena:'dorm',
    gongguan:'gongguan',noodle:'gongguan',bookstore:'gongguan',cvs:'gongguan',cafe:'wenzhou',wenzhou:'wenzhou',boya:'boya',putong:'boya',gongtong:'gongtong'};
  S.hereId=function(zone,x,z){ if(zone==='campus'&&x!=null){ let b=null, bd=1e9; for(const p of S.PINS){ if(p.cx==null) continue; const d=Math.hypot(p.cx-x,p.cz-z); if(d<bd){ bd=d; b=p.id; } } return b; }
    return S.ZONE_PIN[zone]||null; };
  /* 點地圖的位置（圖上座標）→ 最近的圖釘（只算畫出來的那些；60 以內） */
  S.pick=function(x,y,ids){ let b=null, bd=60; for(const p of S.PINS){ if(ids&&!ids.includes(p.id)) continue; const d=Math.hypot(p.x-x,p.y-y); if(d<bd){ bd=d; b=p.id; } } return b; };
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
      for(const pl of S0.L){ const st=state(pl), ht=hours?hours(pl[0]):'';
        out+='<div class="phrow" style="margin-top:6px"><div>'+esc(pl[1])+'<div class="muted">'+(!st.known?'還沒去過':(st.here?'你在這裡':'約 '+st.mins+' 分鐘'+(st.bike?'（騎車）':'')))+(ht?'・'+esc(ht):'')+'</div></div>'+(st.here||!st.known?'':'<button class="btn'+(st.open?' pri':'')+'" data-place="'+esc(key(pl))+'">'+(st.open?'前往':'已閉館')+'</button>')+'</div>'; }
      out+='</div>'; }
    return out; };
  return S;
})();
