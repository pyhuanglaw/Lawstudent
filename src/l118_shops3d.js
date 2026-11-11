/* 118 巷九間店的室內區域 l118_<id>（LANE118-SHOPS-1020，X66；使用者 2026-10-20「店裡可以進去 店員也在裡面 認真設計每個店面」）。
   模型與配置：LAWWW2-C（assets/models/env/second_ai/l118_<id>.glb／.layout.json → src/data/l118_shop_layouts.js，tools/lane118/gen_shop_layouts.py 產生）；
   接線照 LAWWW2-C 的測試接線（docs/art-rebuild/second_ai/patches/l118_shops_wire_test.diff），做法照 us3d.js 的 us_lawlib。店員在 story3d.js（layout 的 clerk）、點餐照舊 L118.order */
const L118S=(function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)){ if(m.userData.l118Base==null) m.userData.l118Base=m.emissiveIntensity!=null?m.emissiveIntensity:1; out.push(m); } } }); return out; }
  function setGlow(mats,k){ for(const m of mats) m.emissiveIntensity=m.userData.l118Base*k; }
  /* 門外的巷子（WALL_S_view：從 lane118_street.glb 拍的白天的圖）：晚上調暗，不用另外拍夜景（LAWWW-C 10-20 回 LAWWW2-C）*/
  function viewMats(root){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||out.includes(m)) continue; if(!/_view/i.test(o.name||'')&&!/_view$/i.test(m.name||'')) continue;
      if(!m.userData.l118View){ if(m.map&&m.emissive&&m.color){ m.emissive.setRGB(1,1,1); m.emissiveMap=m.map; m.color.setRGB(0,0,0); m.needsUpdate=true; m.userData.l118View={c:null,e:1}; }   /* 門外的照片改成自己發光、不受店裡的燈影響（BB-C 10-20：晚上 20:32 從一一八茶飲的玻璃門看出去還是白天的亮度——晚上店裡的燈開著，照亮了門外那張照片）*/
        else if(m.color) m.userData.l118View={c:m.color.clone(),e:m.emissiveIntensity!=null?m.emissiveIntensity:null}; }
      out.push(m); } }); return out; }
  const viewK=h=>{ const t=((h%24)+24)%24; if(t>=19||t<5.5) return 0.32; if(t>=17.5) return 1-0.68*(t-17.5)/1.5; if(t<6.5) return 0.32+0.68*(t-5.5); return 1; };
  function setView(mats,h){ const k=viewK(h); for(const m of mats){ const b=m.userData.l118View; if(!b) continue; if(b.c) m.color.copy(b.c).multiplyScalar(k); if(b.e!=null) m.emissiveIntensity=b.e*k; } }
  /* 兩層窗景（ART-SHOP-VIEWS-1023 第二批，LAWWW2-B 10-23；使用者「店面外看出去的景也都很假」）：W3.VIEW_LAYERS 有 'l118_<id>' 時，門外那張平面圖（WALL_S_view）換成 W3.windowMat——
     遠景（巷子對面的店）＋去背的近景（巷子裡的機車、電線桿、招牌），兩層各自照景深視差，走動時近的東西移動得比對面的店快；照片在遊戲的 118 巷裡拍（tools/shots/shop_views_layers.py），晚上換夜景照片。
     新的平面照原本那一片的位置和大小；原本那一片還在牆的淡出清單裡（鏡頭退到店外時一起淡出），只是不畫，新的平面跟著它的 visible。照片還沒載好時畫原本那張圖（photo 0） */
  /* 九間店的景深（tools/shots/shop_views_layers.py 量的中位數：遠景＝巷子對面的店、近景＝巷子裡 5.5 m 以內；寫進 tools/shots/shop_views_layers.json）。放在這裡、不改 world3d.js 的表。
     2026-11-11 L118-STREET-FIX-1111（BB_341 第 2 項：店裡往外看還是舊街景、看得到舊店名）：九間的照片在換過店、移過路燈和機車的 118 巷重拍，景深照這次量的（五湖四海的近景這次什麼都沒拍到、量不到，留原本的 5.45）*/
  if(typeof W3!=='undefined'&&W3.VIEW_LAYERS) Object.assign(W3.VIEW_LAYERS,{l118_dian:{far:8,near:5.43},l118_self:{far:8,near:5.44},l118_tea:{far:8.13,near:5.42},l118_home:{far:8,near:5.45},l118_cafe2:{far:8,near:5.46},l118_pasta:{far:8,near:5.45},l118_korea:{far:8,near:5.45},l118_omu:{far:8.13,near:5.42},l118_noodle2:{far:8,near:5.42}});
  function photoView(g0,root,id){ const key='l118_'+id; if(typeof W3==='undefined'||!W3.VIEW_LAYERS||!W3.VIEW_LAYERS[key]||!W3.windowMat) return null; let src=null; root.traverse(o=>{ if(!src&&o.isMesh&&o.name==='WALL_S_view') src=o; }); if(!src) return null;   /* 只換店門外那一片（兩側的鄰居店面卡 WALL_E_nb_view、WALL_W_nb_view 照舊）*/
    root.updateMatrixWorld(true); g0.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(src), sz=b.getSize(new THREE.Vector3()), c=g0.worldToLocal(b.getCenter(new THREE.Vector3()));
    const sm=[].concat(src.material)[0], fb=sm&&(sm.emissiveMap||sm.map)||null, m=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(sz.x,sz.z),sz.y),W3.windowMat(W3.VIEW_LAYERS[key].far));
    m.position.copy(c); m.rotation.y=sz.x>=sz.z?Math.PI:(c.x>0?-Math.PI/2:Math.PI/2); m.name='l118_window_view'; m.userData.dyn=true; m.renderOrder=-1;   /* 門外那一片在店面（+z）那一面、朝店裡（−z）*/
    Object.defineProperty(m,'visible',{configurable:true,get(){ return src.visible; },set(){}});
    for(const x of [].concat(src.material)) if(x){ x.colorWrite=false; x.depthWrite=false; }   /* 原本那一片不畫（還留在淡出清單：鏡頭在店外時它的 visible 變 false，新的平面跟著）*/
    g0.add(m); return {mesh:m,key,fb}; }
  function setPhotoView(pv,h,weather){ if(!pv) return; const night=(h<5.5||h>=19.2), rain=weather==='rain'||weather==='storm', ph=W3.viewPhoto(pv.key,night);   /* 19.4 → 19.2（LAWWW2-B 10-24 路線巡查④）：和引擎的夜晚係數 nk＝1、屋外完全天黑同一刻換夜景；原本晚 0.2 小時，冬天傍晚光線拉長後，12 月 17:35～17:58 屋外全黑、窗外還是調暗的白天照片 */
    W3.setWindowView(pv.mesh.material,pv.key,night,pv.fb,ph?W3.photoTint(h,rain):new THREE.Color(1,1,1).multiplyScalar(viewK(h)).getHex(),ph&&W3.photoFade?W3.photoFade(h):0); }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  /* 看東西的字：配置檔的 note 有字就用（例：家常菜的電視，AA_280 原句）；dev 那一欄是 LAWWW2 給開發組的話（產生的檔，不改；不會出現在遊戲裡）。
     AA_355 1-3（AA-C 2026-10-21）給了滇香小館牆上的織布；5-1（2f1aaa22）給了自取的湯（第一間＝好家自助餐、第二間＝巷口家常菜）、書架（慢讀咖啡）、
     小菜櫃（第一間＝韓食小廚、第二間＝六張犁麵舖）——「第一間、第二間」照配置檔的順序對。台詞照抄 */
  const LOOK={ dian:{ tapestry:'（牆上掛著一塊條紋織布，紅色和深藍色，顏色洗得有點淡了。）' },
    self:{ soup:'（自取的湯，今天是蘿蔔湯。鍋邊貼著「請自取，不要浪費」。）' }, home:{ soup:'（湯桶上寫著「紫菜蛋花」。湯勺掛在桶邊。）' },
    cafe2:{ books:'（書架上大多是舊漫畫，有幾套缺了第一集。）' },
    korea:{ banchan:'（小菜櫃裡有海帶、豆干、滷蛋。豆干只剩兩塊。）' }, noodle2:{ sides:'（小菜櫃的玻璃起霧了，看得到裡面的燙青菜。）' } };
  const lookText=(id,q)=>(LOOK[id]&&LOOK[id][q.id])||q.note||q.label;
  /* 互動鍵覆寫表（L118-IT-REACH-1111；BB 11-11 在使用者電腦用搖桿逐張走到每張椅子的「坐下前站的位置」按互動鍵：好幾張按出來是別張椅子、點餐或看的東西）。
     配置檔（LAWWW2 的 Blender 腳本產生，不手改）照舊；遊戲端在這裡改「按鈕在哪裡出現」，之後交給做模型的人搬回腳本，搬好以後這裡的那一格刪掉。
     遊戲怎麼選按鈕：engine3d.js E.nearestInteractable——在半徑內、「距離－prio」最小的贏（椅子 prio 0.3、點餐 0、看的東西 −0.3）。
     座位用配置的座標「x,z」對（不用序號：腳本重新產生、順序換了也對得上；座標改了這一格就不套用，tests/l118_interact_reach_1111_unit.js 會抓到）：
       i：按鈕的位置（座位本身不動，坐下照樣坐在配置的位置）；ap：坐下前站的位置（GAME.seatApproach、NPC 走過去坐也用）；r：按鈕半徑；sit：坐的位置（只有要挪座位時才寫）。
     點餐 order、看的東西 interact（照配置的 id）：x、z、r、prio。
     同一種毛病的通則：兩張並排、只能從同一頭走近的椅子（靠牆那張＋外側那張，配置給同一個走近點），原本按鈕都在椅子上——靠牆那張永遠比外側那張遠，搖桿走到哪裡都是外側那張。
       改成每張的按鈕在它自己的站位上：卡座沿著走道排開（外側那張在它那一排、靠牆那張往桌子中間 1/3：辛亥韓食、義大麵屋、奈良咖哩、迪倫）、走進桌子和櫃台之間的縫（118牛排）、
       一前一後（五湖四海：外側那張貼桌邊、靠牆那張退一步）。按鈕不在椅子上，點椅子走過去照「離點的位置最近的椅子」挑（engine3d.js tapPref 的 tq，同一張單一起改）。
     測試：node tests/l118_interact_reach_1111_unit.js（九間店每張椅子在至少一個站位上是它、點餐和看的東西各有站得到的位置、點椅子走過去按鈕是那一張）*/
  const IT_DEF={seatR:0.8};   /* 座位按鈕的預設半徑 0.7 → 0.8（BB 11-11 第 3 項：118牛排兩張、五湖四海一張，搖桿停在走近點旁邊 0.709 m，差 1 cm 出界，按鈕變成旁邊客人的「聽一句」）*/
  /* 「#n」＝BB 用的編號（配置的順序，從 1 開始）。內＝靠牆那張、外＝外側那張 */
  const L118_IT_FIX={
    /* 118牛排（第 3 版配置）：每張桌子兩條長凳、各兩張（內 x ±2.1、外 ±1.6），配置給兩張幾乎同一個走近點（走道 x ±1.05／±1.1）＝內那張永遠被外那張搶走（8 張：#1 #3 #5 #7 #10 #12 #14 #16）。
       桌子和櫃台、桌子和桌子之間有一條走得進去的縫（x 到 ±2.05）：內那張的按鈕和走近點放在縫的深處（±1.95）、外那張的按鈕放在縫口（±1.45）——往裡面走是內、縫口和走道是外 */
    dian:{ seats:{
      '-2.1,-2.06':{i:[-1.95,-1.98],ap:[-1.95,-1.98]}, '-1.6,-2.06':{i:[-1.45,-1.98]},   /* #1 內、#2 外 */
      '-2.1,-0.74':{i:[-1.95,-0.72],ap:[-1.95,-0.72]}, '-1.6,-0.74':{i:[-1.45,-0.72]},   /* #3 內、#4 外（兩張桌子之間的縫，和 #5 #6 各用一半）*/
      '-2.1,-0.26':{i:[-1.95,-0.38],ap:[-1.95,-0.38]}, '-1.6,-0.26':{i:[-1.45,-0.38]},   /* #5 內、#6 外 */
      '-2.1,1.06':{i:[-1.95,1.22],ap:[-1.95,1.22]}, '-1.6,1.06':{i:[-1.45,1.22]},   /* #7 內、#8 外 */
      '1.6,-2.06':{i:[1.45,-1.98]}, '2.1,-2.06':{i:[1.95,-1.98],ap:[1.95,-1.98]},   /* #9 外、#10 內 */
      '1.6,-0.74':{i:[1.45,-0.72]}, '2.1,-0.74':{i:[1.95,-0.72],ap:[1.95,-0.72]},   /* #11 外、#12 內 */
      '1.6,-0.26':{i:[1.45,-0.38]}, '2.1,-0.26':{i:[1.95,-0.38],ap:[1.95,-0.38]},   /* #13 外、#14 內 */
      '1.6,1.06':{i:[1.45,1.22]}, '2.1,1.06':{i:[1.95,1.22],ap:[1.95,1.22]} } },   /* #15 外、#16 內 */
    /* 辛亥韓食（第 3 版）：卡座整排擋住（x 0.3～1.3），只能從走道 x −0.05 那一條站；每個卡座四張（外南、內南、內北、外北）配置給走道上同兩個點＝內那張永遠坐不到（6 張）。
       改成四張的按鈕沿著走道排開：外那張在它那一排、內那張往桌子中間 1/3（間隔約 0.33～0.4 m）。
       小菜櫃（BB 第 4 項）：櫃子在櫃台右邊、卡座南端後面，客人走不到（最近只到 (−0.03,−2.07)）——按鈕挪到走道南端、櫃子斜前方（客人站得到的那一邊），第一個卡座的按鈕往北讓出位置 */
    tea:{ order:{prio:0.3}, interact:{ banchan:{x:-0.05,z:-2.15,r:0.4,prio:0.2} },   /* prio 0.3→0.2（BB 11-11 PC：#9 (0.55,−1.94) 四邊都坐不到——站在 #9 的走近點 (−0.05,−1.94)，小菜櫃 0.21−0.3＝−0.09、#9 按鈕 0.22−0.3＝−0.08，小菜櫃贏 1 cm；0.2 以後 #9 贏，站在小菜櫃那一點照樣是小菜櫃）*/
      seats:{
      '0.55,-1.94':{i:[-0.05,-1.72],ap:[-0.05,-1.72]}, '1.05,-1.94':{i:[-0.05,-1.39],ap:[-0.05,-1.39],r:0.8},   /* #9 外南、#10 內南 */
      '1.05,-0.74':{i:[-0.05,-1.07],ap:[-0.05,-1.07],r:0.8}, '0.55,-0.74':{i:[-0.05,-0.74]},   /* #12 內北、#11 外北 */
      '0.55,-0.22':{i:[-0.05,-0.22]}, '1.05,-0.22':{i:[-0.05,0.18],ap:[-0.05,0.18],r:0.8},   /* #5 外南、#6 內南 */
      '1.05,0.98':{i:[-0.05,0.58],ap:[-0.05,0.58],r:0.8}, '0.55,0.98':{i:[-0.05,0.98]},   /* #8 內北、#7 外北 */
      '0.55,1.5':{i:[-0.05,1.42],ap:[-0.05,1.42]}, '1.05,1.5':{i:[-0.05,1.75],ap:[-0.05,1.75],r:0.8},   /* #1 外南、#2 內南（最靠門的卡座整組往南 0.08～0.28 m、#3 半徑 0.6：不蓋住門口的「離開」）*/
      '1.05,2.7':{i:[-0.05,2.08],ap:[-0.05,2.08],r:0.8}, '0.55,2.7':{i:[-0.05,2.42],ap:[-0.05,2.42],r:0.6} } },   /* #4 內北、#3 外北 */
    /* 五湖四海：靠牆長椅（x −3.5，#1 #3 #5 #7）和隔著桌子對面的外側椅子（x −2.3，#2 #4 #6 #8）同一條線；靠牆的按鈕在椅子上（r 1.6）、走近點 (−2.0, z) 離外側那張只有 0.3 m＝外側贏（BB 第 1 項）。
       改成：外側那張的按鈕和走近點貼著桌邊 (−2.15, z)（椅子就在腳邊）、靠牆那張的按鈕和走近點在它後面一步 (−1.75, z)（中線 −1.95，兩邊各 0.2 m）。
       反過來排（靠牆那張貼桌邊）不行：點外側那張的椅子走過去，引擎照「離點的位置最近的按鈕」挑，會挑到貼在外側椅子旁邊的靠牆按鈕（engine3d.js tapPref）。
       點餐（BB 第 2 項）：(0.65, −1.65) r 0.8 蓋住 #9 #11 後面的走近點（#9 後 0.6 那一點是「點餐」；BB 雲端點椅子也一樣）——往櫃台挪到 (0.65, −2.15)、半徑 0.75，站在櫃台前（z −1.95～−1.6）照樣點得到。
       煮水餃的大鍋 (−1.4, −1.8)：靠牆那張的按鈕挪到走道以後離鍋子 0.36 m，看的東西 prio −0.3 讓位，站在鍋子正前方也是「坐下」——鍋子的 prio 改成和椅子一樣 0.3（位置不動：誰近就是誰，各留 0.18 m）*/
    home:{ order:{x:0.65,z:-2.15,r:0.75}, interact:{ dumpling_pot:{prio:0.3} },
      seats:{
      '-3.5,-1.7':{i:[-1.75,-1.7],ap:[-1.75,-1.7],r:0.8}, '-2.3,-1.7':{i:[-2.15,-1.7],ap:[-2.15,-1.7]},   /* #1 靠牆、#2 外側 */
      '-3.5,-1.1':{i:[-1.75,-1.1],ap:[-1.75,-1.1],r:0.8}, '-2.3,-1.1':{i:[-2.15,-1.1],ap:[-2.15,-1.1]},   /* #3 靠牆、#4 外側 */
      '-3.5,-0.2':{i:[-1.75,-0.2],ap:[-1.75,-0.2],r:0.8}, '-2.3,-0.2':{i:[-2.15,-0.2],ap:[-2.15,-0.2]},   /* #5 靠牆、#6 外側 */
      '-3.5,0.75':{i:[-1.75,0.75],ap:[-1.75,0.75],r:0.8}, '-2.3,0.75':{i:[-2.15,0.75],ap:[-2.15,0.75]} } },   /* #7 靠牆、#8 外側 */
    /* 義大麵屋：西牆卡座（內 x −3.42 #10 #12、外 −2.9 #11 #13）配置給走道上同一個走近點 (−2.25, z)＝內那張坐不到（BB SEATS 第二批 #10）。按鈕沿著走道排開，和辛亥韓食一樣。
       吧台高腳椅 #1～#5（BB／LAWWW 11-11 第 3 點：#2 #3 坐下後小腿打到吧台木頭邊 y≈0.83、z≈−2.25）：讀模型＝吧台前板在 z −2.25（y 0.1～1.0），椅子中心 z −1.92 只離 0.33 m；
       祐廷坐姿膝蓋在人物前面 0.384 m、高 0.83（tools/anim/sit_fit.json：knZ×H、大腿根高－knee×H），膝蓋本身就進到前板裡 5 cm——五張一樣（同一條吧台、同一個 z），坐的位置往外挪 0.12 m（膝蓋前緣離前板約 1 cm；屁股後緣多出凳面約 5～8 cm）。
       只改玩家（和用 z.seats 的人）；店裡的客人照 crowd3d.js shopDefs 坐在配置的位置，男生膝蓋在前面 0.5 m，照舊會碰到——要整個修得請 LAWWW2 把吧台椅往外挪或吧台前板往裡縮 */
    pasta:{ seats:{
      '-2.9,-0.82':{i:[-2.25,-0.82],r:0.8}, '-3.42,-0.82':{i:[-2.25,-0.44],ap:[-2.25,-0.44],r:0.8},   /* #11 外南、#10 內南 */
      '-3.42,0.32':{i:[-2.25,-0.06],ap:[-2.25,-0.06],r:0.8}, '-2.9,0.32':{i:[-2.25,0.32],r:0.8},   /* #12 內北、#13 外北 */
      '-1.4,-1.92':{sit:[-1.4,-1.8]}, '-0.75,-1.92':{sit:[-0.75,-1.8]}, '-0.1,-1.92':{sit:[-0.1,-1.8]}, '0.55,-1.92':{sit:[0.55,-1.8]}, '1.2,-1.92':{sit:[1.2,-1.8]} } },   /* 吧台 #1～#5 */
    /* 奈良咖哩：東邊三個卡座（外 x 2.28、內 2.92），每對配置給走道上同一個走近點 (1.55, z)＝內那張坐不到（6 張：#10 #12 #14 #16 #18 #20；BB SEATS 第二批 #16 #18 #20）。按鈕沿著走道排開 */
    omu:{ seats:{
      '2.28,-2.06':{i:[1.55,-2.06],r:0.8}, '2.92,-2.06':{i:[1.55,-1.62],ap:[1.55,-1.62],r:0.8},   /* #9 外南、#10 內南 */
      '2.92,-0.74':{i:[1.55,-1.18],ap:[1.55,-1.18],r:0.8}, '2.28,-0.74':{i:[1.55,-0.74],r:0.8},   /* #12 內北、#11 外北 */
      '2.28,-0.06':{i:[1.55,-0.06],r:0.8}, '2.92,-0.06':{i:[1.55,0.38],ap:[1.55,0.38],r:0.8},   /* #13 外南、#14 內南 */
      '2.92,1.26':{i:[1.55,0.82],ap:[1.55,0.82],r:0.8}, '2.28,1.26':{i:[1.55,1.26],r:0.8},   /* #16 內北、#15 外北 */
      '2.28,1.94':{i:[1.55,1.94],r:0.8}, '2.92,1.94':{i:[1.55,2.38],ap:[1.55,2.38],r:0.8},   /* #17 外南、#18 內南 */
      '2.92,3.26':{i:[1.55,2.82],ap:[1.55,2.82],r:0.8}, '2.28,3.26':{i:[1.55,3.26],r:0.8} } },   /* #20 內北、#19 外北 */
    /* 迪倫窯烤披薩：中間的四人卡座（外 x −2.2 #4 #6、內 −2.9 #3 #5）配置給走道上同一個走近點 (−1.35, z)＝內那張坐不到；外那兩張的按鈕在椅子上、半徑 1.0，
       又把旁邊兩人座 #2、#7 的走近點 (−2.15, 0.2)、(−2.15, 2.5) 吃掉（BB SEATS 第二批 #7）。四張的按鈕沿著走道 x −1.35 排開，半徑 0.8 */
    noodle2:{ seats:{
      '-2.2,0.77':{i:[-1.35,0.77],r:0.8}, '-2.9,0.77':{i:[-1.35,1.16],ap:[-1.35,1.16],r:0.8},   /* #4 外南、#3 內南 */
      '-2.9,1.93':{i:[-1.35,1.54],ap:[-1.35,1.54],r:0.8}, '-2.2,1.93':{i:[-1.35,1.93],r:0.8} } }   /* #5 內北、#6 外北 */
  };
  const fixOf=id=>L118_IT_FIX[id]||{};
  /* 店名照店家資料（src/data/lane118_shops.js；L118-SHOPS-REDO-1111，使用者 2026-11-11 九間店換店名）：室內配置檔（LAWWW2 產生，不手改）裡寫的還是配置當時的店名——
     區域名稱、「點餐（○○）」「離開○○」這些按鈕上的店名換成資料的；配置重新產生以後兩邊一樣，這裡就什麼都不換 */
  const shopName=id=>{ const s=typeof LANE118_SHOPS!=='undefined'&&Array.isArray(LANE118_SHOPS.shops)?LANE118_SHOPS.shops.find(q=>q.id===id):null; return (s&&s.name)||L118_SHOP_LAYOUTS[id].name; };
  const reName=(id,t)=>{ const a=L118_SHOP_LAYOUTS[id].name, b=shopName(id); return typeof t==='string'&&a&&a!==b?t.split(a).join(b):t; };
  function zoneFor(id){ const L=L118_SHOP_LAYOUTS[id];
    return { id:'l118_'+id, get name(){ return shopName(id)+'（118 巷）'; }, indoor:true, camDist:L.cam_dist||4.2, build(E){ const Bd=L.bounds, H=L.h||3.2;
      const W=Math.max(-Bd.x0,Bd.x1)*2+3, D=Math.max(-Bd.z0,Bd.z1)*2+3;
      const z=Z3.room(E,{w:W,d:D,h:H,windows:false,warm:true,wallColor:'#efe8dc',floorTex:W3.stoneTex('#c8bba6'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;
      const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
      for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
      nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
      plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,M('#c8bba6'),0,0,0.005); const bm=M('#b9a486'); for(const b of L.blocks){ const h=/fridge|bookshelf|kitchen/.test(b.why)?1.9:0.9; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      const lamps=[]; const cx=(Bd.x0+Bd.x1)/2; for(const zz of [Bd.z0+2.2,(Bd.z0+Bd.z1)/2,Bd.z1-2.0]){ const l=new THREE.PointLight(0xfff1dc,3,12,2); l.position.set(cx,H-0.4,zz); l.userData.on=5; l.userData.off=3.2; g0.add(l); lamps.push(l); }
      let glow=[], views=[], pview=null; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); setView(views,h); setPhotoView(pview,h,weather); };
      const IT=E.interactables; z.seats=[]; const FX=fixOf(id), FS=FX.seats||{}, FI=FX.interact||{};
      for(const s of L.seats){ const f=FS[s.x+','+s.z]||{}, at=f.sit||[s.x,s.z], ip=f.i||at; const st={x:at[0],z:at[1],yaw:s.yaw,lv:0}; if(f.ap||s.ap) st.ap=(f.ap||s.ap).slice(); if(s.lift) st.lift=s.lift;   /* f：覆寫表那一格（L118-IT-REACH-1111）*/   /* lift：吧檯高腳椅（座面 0.76 m，坐姿抬高 0.29＝座面－CHAR.SIT_TOP 0.47，SIT-HEIGHT-1104；原本 0.31＝照 0.45 算；GAME.sitAt 的 seat.lift，和 Café、定食店的吧台一樣）*/ z.seats.push(st); const study=false;   /* AA_772（L118-SHOPS-REDO-1111）：cafe2 現在是大學食堂，桌位不能讀書（原本 L118-CAFE2-STUDY-1030：慢讀咖啡的桌位可以自習；念書搬到木曜日）*/ IT.push({x:ip[0],z:ip[1],radius:f.r||s.r||IT_DEF.seatR,lv:0,prio:0.3,seat:st,label:s.label||(study?'坐下讀書':'坐下'),study}); }   /* study：慢讀咖啡（cafe2）的桌位可以自習（使用者 2026-10-30「慢讀咖啡為什麼不能念書」，L118-CAFE2-STUDY-1030；吧檯高腳椅不算）*/   /* prio：站在椅子旁邊要坐下時，「坐下」比旁邊的電視、自取的湯優先（BB-C 10-20 家常菜） */
      for(const q of L.interact){ const f=FI[q.id]||{}; IT.push({x:f.x!=null?f.x:q.x,z:f.z!=null?f.z:q.z,radius:f.r||q.r,lv:0,prio:f.prio!=null?f.prio:-0.3,label:q.label,look:lookText(id,q)}); }   /* 只是看的東西（電視、自取的湯）讓位給坐下、點餐、出口：家常菜的湯就在椅子後面（BB-C 10-20） */
      if(L.order){ const O=Object.assign({},L.order,FX.order||{}); IT.push(Object.assign({x:O.x,z:O.z,radius:O.r,lv:0,label:reName(id,L.order.label),shop118:id},O.prio!=null?{prio:O.prio}:{})); }
      for(const X of L.exits){ const so=L.street.spawn_out; IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:reName(id,X.label),exit:{to:'lane118',spawn:{x:so.x,z:so.z,yaw:so.yaw}}}); }
      z.formal=false; const key='bldg.l118_'+id; if(has(key)) ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
        glow=glowMats(root,/^GLOW_/); views=viewMats(root); pview=photoView(g0,root,id); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('118 巷店面正式模型載入失敗',id,e));
      return z; } }; }
  if(typeof L118_SHOP_LAYOUTS!=='undefined') for(const id of Object.keys(L118_SHOP_LAYOUTS)){ Z3.ZONES['l118_'+id]=zoneFor(id);
    if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.l118_'+id]={url:'assets/models/env/second_ai/l118_'+id+'.glb',type:'building',lazy:true,source:'LAWWW2-C lane118_shops.py',license:'本作'}; }
  return {viewK,zoneFor,viewMats,setView,lookText,IT_FIX:L118_IT_FIX,IT_DEF};
})();
