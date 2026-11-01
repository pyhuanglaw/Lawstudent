/* ===== 人物開門（ANIM-DOOR-OPEN-1027／USER_WANTS A21「人物動作要有開門」第一、二階段；LAWWW2-C 2026-10-27）=====
   玩家按「進入／離開／走出／出門…」這種有門的出入口：先轉向門、伸右手推門（約 0.45 秒），接著照舊變黑換區域；畫面全黑以後手放下。
   - 自動門（便利商店、美國的兩家超市、機場、總圖正面）：不伸手，只轉向門口。開放式的店面（阿鳳麵店、林家乾麵）：不是門。
   - 推門那 0.45 秒玩家鎖住（busy），連按兩下只推一次（BB-C 10-27）。
   - 樓梯、電梯、「往…」的路、搭車、過馬路、回到校園／公館這種戶外的路：不是門，照舊。
   - 出入口可以自己寫 exit.door：'push'（推門）、'auto'（自動門）、'none'（不是門）蓋過上面的判斷。
   - 騎腳踏車、劇情自己呼叫 GAME.enter（不是玩家按的）：不演。
   - 手的動作用 character3d.js 的疊加姿勢 u.overlay（羽球短片加的掛勾）：只動右手臂、胸口，腳照舊。門板：模型裡單獨的門板網格會真的轉開（第二階段，見下面 swingSetup）。*/
const DOOR=(function(){
  const S={};
  S.AUTO_ZONES=['cvs','us_market','us_asian_market','airport_dep','airport_arr'];   /* 整個區域只有一個門、是自動門 */
  S.AUTO_PAIRS=[['campus','library_hall']];   /* 這兩個區域之間是自動門：總圖正面兩扇自動門（library_interior.py 的 L0_autodoor；總圖裡面的多媒體中心、研究小間是推門）*/
  S.OPEN_ZONES=['noodle','wz_lin'];   /* 店面整個是開的、沒有門（阿鳳麵店、溫州街林家乾麵＝wz_shopkit.py 的 A4 door='open'）：進出都不伸手。118 巷九間店的模型都是鋁框玻璃門（lane118_shops.py 的 shell），照推門 */
  S.DOOR_PAIRS=[['campus','gongtong'],['campus','putong'],['campus','boya'],['campus','gym'],['wancai','lawlib'],['library_hall','library_carrels']];   /* 互動鍵的字沒有動詞（「博雅教學館」「法律學院圖書館」「研究小間」「回 2F 自習區」）、但進出都是門（BB-C 10-27：進去不演、出來推門）*/
  S.NONE_PAIRS=[['putong','boya'],['us_outside','us_market_street']];   /* 不是門：普通↔博雅走空橋；美國社區「出門（去超市）」是走到街上 */
  S.YES=/^進|離開|走出|出門|回公寓|回宿舍|回家|回房|回萬才館大廳|回法律系館B大廳/;   /* ^進：「進入…」、118 巷「進六張犁麵舖」、溫州街「進去半熟」、美國「進圖書館」（BB-C 10-27：原本只認「進入」）*/
  S.NOT=/樓梯間|上樓|下樓|上 \d|下 \d|電梯|搭車|過馬路|^往|回到校園|回公館|校門/;   /* 「走出校門」是校門（大門口、沒有門板）。「走出去（大樓梯平台）」是萬才館二樓入口的玻璃門（從二樓的門出去到平台）：是門 */
  S.POSE={RightArm:[0,1.25,-0.08],RightForeArm:[0,0.22,0],RightHand:[0,0,-0.45],Spine1:[0.06,0.12,0]};   /* 右手往前伸到胸口高、手肘微彎、手腕往後折（手掌朝前推）、身體微微往前 */
  S.T_REACH=0.25; S.T_HOLD=0.2;   /* 秒：伸手、推著；手放下見 watch */
  S.kind=function(it,fromZone){ const x=it&&it.exit; if(!x) return null; if(typeof x.door==='string') return x.door==='none'?null:x.door;   /* 校園幾個建築入口本來就有 door:true（不是這裡的意思）：只認字串 */
    let lb=''; try{ lb=String(it.label||''); }catch(e){}
    const to=x.to, pair=L=>L.some(([a,b])=>(a===fromZone&&b===to)||(b===fromZone&&a===to));
    if(S.NOT.test(lb)||pair(S.NONE_PAIRS)||S.OPEN_ZONES.includes(to)||S.OPEN_ZONES.includes(fromZone)) return null;
    if(!S.YES.test(lb)&&!pair(S.DOOR_PAIRS)&&!pair(S.AUTO_PAIRS)) return null;
    return (S.AUTO_ZONES.includes(to)||S.AUTO_ZONES.includes(fromZone)||pair(S.AUTO_PAIRS))?'auto':'push'; };
  const raf=typeof requestAnimationFrame==='function'?requestAnimationFrame:(f=>setTimeout(()=>f(Date.now()),16));
  const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
  const sm=t=>{ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
  /* 玩家按了有門的出入口：轉向門＋推門；回傳 Promise（演完才換區域）。不是門、騎車、沒有玩家：馬上回傳 null */
  let cur=null;   /* 正在推的那一次：連按兩下（150 ms 內）回傳同一個 Promise，不推兩次（BB-C 10-27）*/
  S.open=function(GM,it){ const E=GM&&GM.E, P=E&&E.player; const G=GM&&GM.G; const k=S.kind(it,G&&G.zone);
    if(!k||!P||!P.obj||P.riding) return null;
    if(cur) return cur;
    const o=P.obj, dx=it.x-o.position.x, dz=it.z-o.position.z, turn=Math.hypot(dx,dz)>0.3, y0=o.rotation.y; let y1=turn?Math.atan2(dx,dz):y0, d=y1-y0; d=Math.atan2(Math.sin(d),Math.cos(d)); y1=y0+d;
    const u=o.userData, push=k==='push';
    const total=(push?S.T_REACH+S.T_HOLD:0.2)*1000;
    let sw=null; if(push){ try{ sw=swingSetup(E,it,P); }catch(e){ console.warn('DOOR 門板',e); sw=null; } }   /* 第二階段：找得到門板就真的轉開 */
    const busy0=P.busy; P.busy=true; P.path=null; P.target=null;   /* 推門那 0.45 秒鎖住：搖桿、點地走不動，互動鍵藏起來；演完還原（BB-C 10-27：原本可以走開，走開了還是換區域）*/
    return cur=new Promise(res=>{ const t0=now(); if(sw){ sw.t0=t0; sw.from=sw.piv.rotation.y; } const f=()=>{ const t=(now()-t0)/1000;
      if(turn) o.rotation.y=y0+d*sm(t/0.18);
      if(push&&u) u.overlay={bones:S.POSE,k:sm(t/S.T_REACH),door:true};
      if(sw) swingAt(sw);
      if(now()-t0>=total){ P.busy=busy0; cur=null; if(push) watch(GM,sw); res(k); return; } raf(f); }; raf(f); }); };
  /* ---- 第二階段（ANIM-DOOR-OPEN-1027 第二階段，LAWWW2-C 10-27）：門板真的轉開 ----
     很多室內的門板本來就是模型裡單獨的一個網格（宿舍房門 WALL_front_door、霖澤館 202／博雅 203／萬才館研討室 WALL_N_door、社科院教室 door_class_*_leaf、美國公寓 WALL_S_door…，
     0.6～1.7 m 寬、1.8～2.8 m 高、13 cm 以下厚）：推門時找出入口 2.6 m 內、大小像一片門板的網格，繞門邊（鉸鏈）往遠離玩家的方向轉 70°（跟著推門的手，0.45 秒）。
     門板後面緊貼著牆（門是貼在牆上的、沒有門洞）：不轉（轉開會看到牆）。門後面空的（隔壁是另一個區域，看出去是天空色）：門洞後面放一張暗的走廊底卡。
     找不到門板（店面、大門是整棟模型的一部分）：只有手的動作（第一階段）。換區域以後舊區域整個拆掉，不用轉回來；沒換成 4 秒後轉回來。*/
  S.LEAF_RE=/door/i; S.LEAF_NOT=/frame|metal|steel|plate|mat\b|doormat|lamp|glow|case|pull|glass|plaque|beyond|bdoor|locker|walnut/i; S.SWING=1.22; S.T_SWING=0.45;
  const V3=()=>new THREE.Vector3();
  function leafBox(o){ const ps=o.parent&&o.parent.userData&&o.parent.userData.doorSw; if(ps&&ps.o===o) return ps.bb;   /* 已經轉過一次（沒換成區域又按）：用原本的範圍 */
    if(!o.isMesh||!S.LEAF_RE.test(o.name||'')||S.LEAF_NOT.test(o.name||'')) return null; const bb=new THREE.Box3().setFromObject(o), sz=bb.getSize(V3()); const w=Math.max(sz.x,sz.z), t=Math.min(sz.x,sz.z);
    return (w>0.6&&w<1.7&&sz.y>1.8&&sz.y<2.8&&t<0.13)?bb:null; }
  S.findLeaf=function(E,it){ const root=(E&&E.zone&&E.zone.group)||(E&&E.scene); if(!root||typeof THREE==='undefined') return null; root.updateMatrixWorld(true); let best=null, bd=2.6;
    root.traverse(o=>{ const bb=leafBox(o); if(!bb) return; const c=bb.getCenter(V3()), dd=Math.hypot(c.x-it.x,c.z-it.z); if(dd<bd){ bd=dd; best={o,bb,root}; } }); return best; };
  function swingSetup(E,it,P){ const L=S.findLeaf(E,it); if(!L) return null; const {o,bb,root}=L; const ps=o.parent&&o.parent.userData&&o.parent.userData.doorSw;
    if(ps){ if(ps.card&&!ps.card.parent) root.add(ps.card); return ps; }   /* 同一扇門再推一次：用同一個鉸鏈 */
    const c=bb.getCenter(V3()), pp=P.obj.position, alongX=(bb.max.x-bb.min.x)>=(bb.max.z-bb.min.z);
    const from=new THREE.Vector3(pp.x,c.y,pp.z), dir=c.clone().sub(from).setY(0); const dist=dir.length(); if(dist<0.05) return null; dir.normalize();
    const rid=riders(root,o,bb,alongX);   /* 門上的小窗、門把、牌子、通風格柵：跟著門板轉（10-27 截圖：只轉門板，小窗和「演出中」牌子浮在半空）*/
    const rc=new THREE.Raycaster(from,dir,dist+0.03,dist+3); const hits=rc.intersectObject(root,true).filter(h=>h.object!==o&&h.object.isMesh&&!rid.includes(h.object));
    if(hits.length&&hits[0].distance<dist+0.25) return null;   /* 門板後面緊貼著牆：不轉 */
    const h=alongX?new THREE.Vector3(bb.min.x,0,c.z):new THREE.Vector3(c.x,0,bb.min.z), F=alongX?new THREE.Vector3(bb.max.x,0,c.z):new THREE.Vector3(c.x,0,bb.max.z);
    const rot=(v,a)=>{ const x=v.x-h.x, z=v.z-h.z, cs=Math.cos(a), sn=Math.sin(a); return new THREE.Vector3(h.x+x*cs+z*sn,0,h.z-x*sn+z*cs); };   /* 和 rotation.y 同方向 */
    const pf=new THREE.Vector3(pp.x,0,pp.z), sgn=rot(F,S.SWING).distanceTo(pf)>=rot(F,-S.SWING).distanceTo(pf)?1:-1;   /* 往遠離玩家的方向轉（推門）*/
    const parent=o.parent, piv=new THREE.Group(); piv.name='door_pivot'; parent.add(piv); parent.updateMatrixWorld(true); piv.position.copy(parent.worldToLocal(h.clone())); piv.updateMatrixWorld(true);
    piv.attach(o); rid.forEach(r=>piv.attach(r));
    let card=null; if(!hits.length){ card=beyondCard(bb,c,dir); root.add(card); }   /* 門後面空的：放走廊底卡 */
    const sw={piv,ang:sgn*S.SWING,o,bb,card,riders:rid,t0:0,gen:0}; piv.userData.doorSw=sw; return sw; }
  /* 門上的零件（小窗、門把、牌子、通風格柵）：門板範圍裡（厚度方向前後各放寬 12 cm＝門把、牌子凸出來的部分，寬高各放寬 4 cm）。
     整個在範圍裡的網格直接跟著轉；併在別的網格裡的（Blender 照材質合併：202 的小窗在 linze_202_props、博雅 203 的「演出中」在 WALL_N_print、宿舍門的通風格柵在 WALL_front_black）
     把三個頂點都在範圍裡的三角形切出來（splitOut），變成新的網格跟著轉——門框、牆、踢腳板的三角形比範圍長，不會被切到 */
  function riders(root,o,bb,alongX){ const out=[], list=[], ex=alongX?[0.04,0.04,0.12]:[0.12,0.04,0.04], box=new THREE.Box3(bb.min.clone().sub(new THREE.Vector3(...ex)),bb.max.clone().add(new THREE.Vector3(...ex)));
    root.traverse(m=>{ if(!m.isMesh||m===o||m.isSkinnedMesh||m.isInstancedMesh||m.name==='door_beyond_card') return; let p=m.parent; while(p&&p!==root){ if(p===o) return; p=p.parent; } list.push(m); });
    for(const m of list){ const b=new THREE.Box3().setFromObject(m); if(b.isEmpty()||!b.intersectsBox(box)) continue; if(box.containsBox(b)){ out.push(m); continue; } const r=splitOut(m,box); if(r) out.push(r); }
    return out; }
  function splitOut(m,box){ const g=m.geometry, pos=g&&g.attributes&&g.attributes.position; if(!pos||!m.parent||Array.isArray(m.material)||(g.morphAttributes&&Object.keys(g.morphAttributes).length)) return null;
    const idx=g.index, n=idx?idx.count:pos.count, v=new THREE.Vector3(), inV=new Uint8Array(pos.count); m.updateWorldMatrix(true,false);
    for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(m.matrixWorld); inV[i]=box.containsPoint(v)?1:0; }
    const keep=[], take=[]; for(let t=0;t+2<n;t+=3){ const a=idx?idx.getX(t):t, b=idx?idx.getX(t+1):t+1, c=idx?idx.getX(t+2):t+2; (inV[a]&&inV[b]&&inV[c]?take:keep).push(a,b,c); }
    if(!take.length) return null;
    const sub=L=>{ const q=new THREE.BufferGeometry(); for(const k in g.attributes) q.setAttribute(k,g.attributes[k]); q.setIndex(L); const bx=new THREE.Box3(); for(const i of L) bx.expandByPoint(v.fromBufferAttribute(pos,i));
      q.boundingBox=bx; q.boundingSphere=bx.getBoundingSphere(new THREE.Sphere()); return q; };   /* 頂點共用、只換三角形清單：原本的幾何（可能是快取共用的）不動；包圍盒只算用到的頂點（computeBoundingBox 會算全部的頂點）*/
    m.geometry=sub(keep); const r=new THREE.Mesh(sub(take),m.material); r.name=(m.name||'mesh')+'_doorpart'; r.position.copy(m.position); r.quaternion.copy(m.quaternion); r.scale.copy(m.scale);
    r.userData=Object.assign({},m.userData); r.castShadow=m.castShadow; r.receiveShadow=m.receiveShadow; r.renderOrder=m.renderOrder; r.frustumCulled=m.frustumCulled; m.parent.add(r); r.updateMatrixWorld(true); return r; }   /* 同一個材質：牆淡出時跟著淡 */
  function swingAt(sw,back){ const t=(now()-sw.t0)/1000, a0=sw.from||0; sw.piv.rotation.y=back?0:a0+(sw.ang-a0)*sm(t/S.T_SWING); }
  function beyondCard(bb,c,dir){ const sz=bb.getSize(V3()), w=Math.max(sz.x,sz.z)*1.2, h=sz.y*1.06;
    let tex=null; if(typeof document!=='undefined'&&document.createElement){ const cv=document.createElement('canvas'); cv.width=32; cv.height=64; const g=cv.getContext('2d'), gr=g.createLinearGradient(0,0,0,64);
      gr.addColorStop(0,'#3b3631'); gr.addColorStop(0.45,'#6b645b'); gr.addColorStop(0.8,'#4a443d'); gr.addColorStop(1,'#2b2724'); g.fillStyle=gr; g.fillRect(0,0,32,64); tex=new THREE.CanvasTexture(cv); if(THREE.SRGBColorSpace) tex.colorSpace=THREE.SRGBColorSpace; }   /* 沒設 sRGB 會被當成線性、看起來偏白（10-27 截圖）*/
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial(tex?{map:tex}:{color:0x4a443d})); m.name='door_beyond_card';
    m.position.set(c.x+dir.x*0.4,bb.min.y+h/2,c.z+dir.z*0.4); m.rotation.y=Math.atan2(-dir.x,-dir.z); return m; }   /* 正面朝玩家 */
  S._swingSetup=swingSetup; S._swingAt=swingAt;   /* 測試用 */
  /* 手什麼時候放下：換到新的區域（E.zone 換了）的第一格——那時候畫面還是黑的；換區域會卡住主執行緒，用計時器會晚 1～2 秒（新區域亮起來時手還伸著，10-27 瀏覽器實測）。
     沒有換成（出入口鎖著、讀取失敗）：4 秒後放下 */
  function watch(GM,sw){ const E=GM&&GM.E, z0=E&&E.zone, t0=now(), gen=sw?++sw.gen:0; const f=()=>{ const E2=GM&&GM.E; if(sw&&sw.gen!==gen) return;   /* 同一扇門又推了一次：交給新的那一次 */
    if(!E2||E2.zone!==z0||now()-t0>4000){ S.close(GM); if(sw&&E2&&E2.zone===z0){ swingAt(sw,true); if(sw.card&&sw.card.parent) sw.card.parent.remove(sw.card); } return; } if(sw) swingAt(sw); raf(f); }; raf(f); }   /* 門板繼續轉到底；沒換成：轉回來、拿掉底卡 */
  /* 手放下（只清開門自己的疊加姿勢）*/
  S.close=function(GM){ const P=GM&&GM.E&&GM.E.player, u=P&&P.obj&&P.obj.userData; if(u&&u.overlay&&u.overlay.door) u.overlay=null; };
  return S;
})();
