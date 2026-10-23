/* ===== 手機「地點」的簡圖（UX-PHONE-MAP-1023，使用者 2026-10-23「手機上選擇要前往哪裡 可以用地圖方式顯示?」）=====
   第一版：程式畫的示意圖（SVG），不是正式美術地圖（正式的之後 BB 照 D97 向使用者要）。北朝上，和遊戲的方位一樣：
   - 校園照遊戲座標縮小（校門在西邊、法學院在北邊、總圖在東邊、宿舍在南邊）；
   - 公館在校門外（羅斯福路），座標照 zones3d.js 校園背景的換算：公館 (gx,gz) → 校園 (x=-170-gz, z=gx)；
   - 溫州街在公館北端往西北；118 巷在法學院後門外。
   地點是 PLACES.quickList()（game3d.js PLACE_LIST）的 [zone,label,spawn]；同一棟的幾個入口合成一個圖釘（霖澤館前／大廳／201 教室）。
   點圖釘＝下面列出那個圖釘的地點（每個一顆「前往」，和清單一樣用 data-place）；再點一次收起來。不在圖上的地點（美國、之後新加的）照舊只在清單裡。
   game3d.js placesHTML 呼叫 PLACEMAP.html；點圖釘的 data-pmap 在 game3d.js 接（phonePin）。
   測試：node tests/placemap_unit.js */
'use strict';
const PLACEMAP=(function(){
  const S={};
  /* 校園座標 → 圖上座標（viewBox 0 0 360 300） */
  const CX=x=>150+(x+130)*0.8, CY=z=>60+(z+130)*0.8;
  const gg=(gx,gz)=>[CX(-170-gz),CY(gx)];   /* 公館的區域座標 */
  S.PINS=[
    {id:'linze',name:'霖澤館',x:CX(30),y:CY(-104),m:[['campus','台大校園（霖澤館前）'],['linze','霖澤館（大廳）'],['classroom','霖澤館 201 教室']]},
    {id:'wancai',name:'萬才館',x:CX(92),y:CY(-100),m:[['wancai','萬才館（大廳）'],['lawlib','法律學院圖書館']]},
    {id:'lane118',name:'118 巷',x:CX(34),y:CY(-146),m:[['lane118','118 巷']]},
    {id:'soclib',name:'社科圖',x:CX(11),y:CY(-66),m:[['soclib','社科院圖書館']]},
    {id:'boya',name:'博雅',lab:'l',x:CX(-38),y:CY(-72),m:[['campus','博雅教學館']]},
    {id:'putong',name:'普通',lab:'l',x:CX(-38),y:CY(-47),m:[['campus','普通教學館']]},
    {id:'avenue',name:'椰林大道',x:CX(-40),y:CY(6),m:[['campus','椰林大道・傅鐘']]},
    {id:'library',name:'總圖',x:CX(86),y:CY(0),m:[['library_hall','總圖書館（大廳）']]},
    {id:'gongtong',name:'共同',x:CX(2),y:CY(22),m:[['campus','共同教學館']]},
    {id:'dorm',name:'宿舍',x:CX(20),y:CY(60),m:[['dorm','宿舍']]},
    {id:'gdorm',name:'女一舍',x:CX(-93),y:CY(56),m:[['campus','大一女舍（門口）']]},
    {id:'gate',name:'校門',x:CX(-112),y:CY(0),m:[['campus','校門口']]},
    {id:'gongguan',name:'公館',x:gg(0,-15)[0],y:gg(0,-15)[1],m:[['gongguan','公館商圈']]},
    {id:'mrt',name:'捷運公館站',x:gg(-20,13)[0],y:gg(-20,13)[1],m:[['gongguan','捷運公館站']]},
    {id:'shops',name:'公館的店',x:gg(-58,21)[0],y:gg(-58,21)[1],m:[['noodle','阿鳳麵店'],['bookstore','舊路書房'],['cvs','日日便利']]},
    {id:'cafe',name:'兩點半',x:gg(-71,20)[0]-14,y:gg(-71,20)[1]-12,m:[['cafe','兩點半 Café']]},
    {id:'wenzhou',name:'溫州街',x:gg(-71,20)[0]-46,y:gg(-71,20)[1]-34,m:[['wenzhou','溫州街']]}];
  /* 區域的底（圖上座標）：校園、公館（羅斯福路那一條）、溫州街 */
  S.AREAS=[{id:'campus',name:'台大校園',x:CX(-125),y:CY(-128),w:(CX(112)-CX(-125)),h:(CY(70)-CY(-128)),lx:CX(-120),ly:CY(-120)+4,c:'#2c3a2f'},
    {id:'gongguan',name:'',x:CX(-200),y:CY(-78),w:CX(-127)-CX(-200),h:CY(12)-CY(-78),lx:CX(-200)+11,ly:(CY(-78)+CY(12))/2+8,rot:1,c:'#3a3329'},
    {id:'wenzhou',name:'',x:8,y:CY(-128)-6,w:CX(-150)-8,h:CY(-74)-CY(-128),lx:30,ly:CY(-128)+12,c:'#33302c'}];
  const key=pl=>pl[0]+'|'+pl[1];
  S.pinOf=function(pl){ return S.PINS.find(p=>p.m.some(m=>m[0]===pl[0]&&m[1]===pl[1]))||null; };
  /* 玩家在圖上的哪裡：校園、公館照座標換算；其他區域＝那個區域的圖釘；不在圖上＝null */
  S.here=function(zone,x,z){ if(zone==='campus'&&x!=null) return [CX(x),CY(z)]; if(zone==='gongguan'&&x!=null){ const p=gg(x,z); return p; }
    const zmap={linze:'linze',classroom:'linze',wancai:'wancai',lawlib:'wancai',library_hall:'library',library:'library',soclib:'soclib',dorm:'dorm',dorm_hall:'dorm',lane118:'lane118',noodle:'shops',bookstore:'shops',cvs:'shops',cafe:'cafe',wenzhou:'wenzhou',boya:'boya',putong:'putong',gongtong:'gongtong'};
    const p=S.PINS.find(q=>q.id===zmap[zone]); return p?[p.x,p.y]:null; };
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  /* places＝PLACE_LIST()；state(pl)＝game3d.js placeState（known/open/here/mins/bike）；sel＝選中的圖釘 id；here＝{zone,x,z}；hours(zone)＝營業時間字 */
  S.html=function(places,state,sel,here,hours){ const P=S.PINS.map(p=>({p,L:places.filter(pl=>p.m.some(m=>m[0]===pl[0]&&m[1]===pl[1]))})).filter(o=>o.L.length);
    if(P.length<3) return '';   /* 美國、日本：地點不在這張圖上 */
    let svg='<svg viewBox="0 26 360 206" role="img" aria-label="地點地圖" style="width:100%;height:auto;display:block;border-radius:10px;background:#1b1f27">';
    for(const a of S.AREAS) if(a.w>0) svg+='<rect x="'+a.x.toFixed(1)+'" y="'+a.y.toFixed(1)+'" width="'+a.w.toFixed(1)+'" height="'+a.h.toFixed(1)+'" rx="10" fill="'+a.c+'"/>'+(a.name?'<text x="'+a.lx.toFixed(1)+'" y="'+a.ly.toFixed(1)+'" font-size="11" fill="#9aa39a"'+(a.rot?' transform="rotate(-90 '+a.lx.toFixed(1)+' '+a.ly.toFixed(1)+')" text-anchor="middle"':'')+'>'+esc(a.name)+'</text>':'');
    svg+='<path d="M'+CX(-125).toFixed(1)+' '+CY(0).toFixed(1)+' H'+CX(80).toFixed(1)+'" stroke="#58664f" stroke-width="5" stroke-linecap="round" opacity=".7"/>';   /* 椰林大道 */
    svg+='<text x="350" y="42" font-size="11" fill="#9aa39a" text-anchor="end">北 ↑</text>';
    for(const {p,L} of P){ const st=L.map(state), known=st.some(s=>s.known), open=st.some(s=>s.known&&s.open&&!s.here), on=sel===p.id;
      const fill=on?'#7fc4c9':(open?'#e9b96a':(known?'#8a8577':'#4b4a46'));
      svg+='<g data-pmap="'+esc(p.id)+'" style="cursor:pointer"><circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="16" fill="transparent"/><circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(on?7:5.5)+'" fill="'+fill+'" stroke="#161a22" stroke-width="2"/>'+
        (p.lab==='l'?'<text x="'+(p.x-9).toFixed(1)+'" y="'+(p.y+4).toFixed(1)+'" font-size="11.5" fill="'+(known?'#f4efe6':'#8a8577')+'" text-anchor="end">':'<text x="'+p.x.toFixed(1)+'" y="'+(p.y-9).toFixed(1)+'" font-size="11.5" fill="'+(known?'#f4efe6':'#8a8577')+'" text-anchor="middle">')+esc(p.name)+'</text></g>'; }   /* 透明的大圓＝手指點得到（44px 左右）；lab 'l'＝地名寫在左邊（博雅、普通上下太近）*/
    const h=here?S.here(here.zone,here.x,here.z):null; if(h) svg+='<circle cx="'+h[0].toFixed(1)+'" cy="'+h[1].toFixed(1)+'" r="8" fill="none" stroke="#e07a6a" stroke-width="1.5" opacity=".8"/><circle cx="'+h[0].toFixed(1)+'" cy="'+h[1].toFixed(1)+'" r="3.5" fill="#e07a6a" stroke="#fff" stroke-width="1.2"/>';   /* 你在這裡：紅點（說明在圖下面，不在圖上寫字，免得蓋住旁邊的地名）*/
    svg+='</svg>';
    const dot=c=>'<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+c+';margin:0 4px 0 10px"></span>';
    let out='<div class="item">'+svg+'<div class="muted" style="margin-top:6px;font-size:12px">'+(h?dot('#e07a6a').replace('margin:0 4px 0 10px','margin:0 4px 0 0')+'你在這裡':'')+dot('#e9b96a')+'可以前往'+dot('#8a8577')+'現在不能去'+dot('#4b4a46')+'還沒去過</div><div class="muted" style="margin-top:4px">點地圖上的地方，下面會出現可以前往的地點。</div></div>';
    const S0=P.find(o=>o.p.id===sel); if(S0){ out+='<div class="item"><b>'+esc(S0.p.name)+'</b>';
      for(const pl of S0.L){ const st=state(pl), ht=hours?hours(pl[0]):'';
        out+='<div class="phrow" style="margin-top:6px"><div>'+esc(pl[1])+'<div class="muted">'+(!st.known?'還沒去過':(st.here?'你在這裡':'約 '+st.mins+' 分鐘'+(st.bike?'（騎車）':'')))+(ht?'・'+esc(ht):'')+'</div></div>'+(st.here||!st.known?'':'<button class="btn'+(st.open?' pri':'')+'" data-place="'+esc(key(pl))+'">'+(st.open?'前往':'已閉館')+'</button>')+'</div>'; }
      out+='</div>'; }
    return out; };
  return S;
})();
