"""CC（帳號 A）11-11：SCOOTER4（機車配件三款）＋TX_sign（新生南路「同弦樂器」招牌）——BB 派工；新版＝開發分支 4eaf0d5e7（LAWWW2 第四包），舊版對照 0eb2a0049。
Playwright（PC GPU）≠ iPhone；畫面判定歸 BB。

對照的程式（4eaf0d5e7）：
  機車模型 assets/models/env/second_ai/scooter.glb（tools/blender/env_second/scooters_v2.py）：每款一個節點 scooter_<代號>（＋scooter_<代號>_lod1），extras 有 weight、palette。
    新的三款（scooters_v2.py ARCH 342～345 行）：S1A_W 國民通勤＋擋風鏡（extras rear_box、grab、windshield）、S1B_G 國民通勤＋腳踏板的袋子（floor_bag）、S7_R 50cc 舊款＋蓋座墊的雨衣（raincoat）。
    配件不是獨立節點，和車身合成同一個網格；分辨法＝頂點色（scooters_v2.py COL 39 行；GLB 裡是線性值）：擋風鏡 screen_c #aeb9c2、袋子 bag_r #d9584a＋bag_k #b9925e、
    雨衣 rain_y #e3c53a＋rain_b #5f8fb8；座墊 seat #1d1c1c。後箱的顏色 box #2e3033 和 S1A 本來的零件同色（S1A 就有 24 個點），分不出來＝不單獨量。
  每條街的機車：
    汀州路 src/tingzhou3d.js 103～124 行：自己照擺放規則挑款式、顏色（S.pickScooter、S.SC 18～26 行），zone.tzScList（{code,col,grp}，順序＝套件機車群組的子物件順序）；
           模型載入後 Z3.attachWzScooters(g,scG,scList,root,'tz_scooters_glb')。
    溫州街 src/zones3d.js 1242～1304 行：套件機車放進 'wz_kit_scooters'，載入後 attachWzScooters(...)＝場景物件 'wz_scooters_glb'；款式照位置雜湊＋weight 挑（zones3d.js 1393～1410 行）。
    公館   src/zones3d.js 1043～1102 行：'gg_kit_scooters' → 'gg_scooters_glb'（北側 z −32、南側 z 6.8、騎樓前 z 18.15 三排）；同樣照位置雜湊挑。
    新生南路：xinsheng_layout.js 379 行有 scooters 欄位（x −12.2 三段），但 src/xinsheng3d.js 沒有程式讀它——4eaf0d5e7 新生南路街上沒有路邊機車（這裡照樣偵測，有就量）。
    注意：溫州街、公館是照「位置雜湊 × 全部款式的 weight 總和」挑款；新版多了三款（weight 0.04＋0.05＋0.04），所以新舊版同一個位置的款式本來就會不一樣（不是錯）。
  同弦樂器：XINSHENG_LAYOUT.shops id 'tongxian'（z −12.4～−6.0、door.z −7.2）；店門互動點＝(facade.x＋0.9, door.z)＝(−15.6, −7.2) r 1.4、label「進同弦樂器（吉他行）」、
    exit.to 'xs_tongxian'（src/xinsheng3d.js 163～166 行）；出來站在 (−13.9, −7.2)（src/tongxian3d.js streetOut 20～21 行）。招牌在二樓：wz_street.py 284～287 行
    signs tongxian_sign 本地 x −2.9～0.3、y 4.9～5.8（_G 4.2＋0.7～1.6）；立面換算新生南路 z＝−9.2－本地 x → z −9.5～−6.3（CC 雲端自檢用射線格子對過：招牌材質
    wz_xs_fronts_matte 在 z −9.2～−6.0 那幾格；吉他櫥窗 tongxian_up 在 z −12.2～−9.6），二樓立面 x −13.0。

PARTS：
  STREET 每條街（ZONES，預設 tingzhou,wenzhou,gongguan,xinsheng）：【前置】讀檔到街上 → 等機車正式模型掛上 → 統計（每台款式、顏色、位置；三款配件車各幾台、在哪；
         同一排相鄰「款式＋顏色」完全一樣的對數、同款相鄰對數、同色系相鄰對數）→ 三個機位的全景、最近一排機車近拍兩張、三款配件車各近拍兩張（紅框）→ 拼一張。
         另外量一次模型本身：三款的配件頂點在哪、配件外框和車身外框、底部離地／離座墊多高、配件最低那圈往下打射線到車身的距離（浮空）、配件頂點在車身裡面的比例（穿模，近似）。
  FPS    每條街兩個點各 FPSS 秒（預設 8）requestAnimationFrame（畫質 Q，預設 medium）；記 draw call、三角形；舊版同位置也量。
  WALK   每條街搖桿沿街走一趟（照 E.pathTo 中途點推搖桿，F.joy_to）；每段記秒數、有沒有跳；walkFallbacks 0。
  TXSIGN 新生南路同弦樂器招牌：正面、斜看左右、近拍、騎樓前玩家高度一張（HOURS 每個時間一組）；每個機位朝招牌那一塊打射線格子，記第一個打到的材質（招牌＝xs_fronts*），
         看招牌前面有沒有東西擋（鐵窗 wz_vc_metal、冷氣、行道樹葉 tree_leaf）；新舊同機位。
  TXDOOR 【前置】讀檔到新生南路騎樓 → 搖桿走到「進同弦樂器」按 → xs_tongxian 站得住、推得動 → 走到「下樓」按 → 回新生南路、站在門口外面、推得動（TXN 次，預設 2）；
         再跑這條街的區域進出：溫州街巷口來回、側門到校園來回（XSZONES=0 不跑）；walkFallbacks 0。
環境變數：SHA（受測 SHA，寫進標題）、PARTS、ZONES、HOURS（預設 14）、FPSS（預設 8）、Q（畫質，預設 medium）、DAY（預設 2025-11-01）、TXN、XSZONES、LW_TESTS（受測版本的 tests/）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=STREET,FPS [ZONES=tingzhou] python cc_scoot4_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'STREET,FPS,WALK,TXSIGN,TXDOOR').split(',')
ZONES = [z for z in (os.environ.get('ZONES') or 'tingzhou,wenzhou,gongguan,xinsheng').split(',') if z]
HOURS = [float(x) for x in (os.environ.get('HOURS') or '14').split(',')]
DAY = os.environ.get('DAY') or '2025-11-01'
SHA = (os.environ.get('SHA') or '')[:9]
R = L.Run('scoot4', OUT); F.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ACC = {'S1A_W': '擋風鏡＋後箱', 'S1B_G': '腳踏板上的袋子', 'S7_R': '蓋座墊的黃雨衣'}
ZN = {'tingzhou': '汀州路', 'wenzhou': '溫州街', 'gongguan': '公館', 'xinsheng': '新生南路'}
# 每條街：全景三個機位（名稱, eye, look, lens）、街的中線（機車近拍從那一側拍：('x',0)＝x 0 那條線）、沿街走的點、FPS 的兩個點（照 WALK 的第 1、3 點）
STREETS = {
    'tingzhou': {'pano': [('北段往南', (2.5, 2.2, -37.0), (-1.0, 1.0, -15.0), 24), ('中段（巷A口）往北', (-2.5, 2.2, 4.0), (1.0, 1.0, -18.0), 24), ('南段往北', (2.5, 2.2, 37.0), (-1.0, 1.0, 15.0), 24)],
                 'axis': ('x', 0.0), 'walk': [(0.0, -36.0), (0.0, -12.0), (0.0, 12.0), (0.0, 36.0)]},
    'wenzhou': {'pano': [('西段往東', (-34.0, 2.2, 0.5), (-14.0, 1.0, -1.0), 24), ('中段往東', (-1.0, 2.2, 0.5), (18.0, 1.0, -1.5), 24), ('東段往西', (44.0, 2.2, 0.5), (24.0, 1.0, -1.5), 24)],
                'axis': ('z', 0.0), 'walk': [(-40.0, 0.0), (-15.0, 0.0), (10.0, 0.0), (35.0, 0.0), (48.0, 0.0)]},
    'gongguan': {'pano': [('騎樓前那排（西段）往東', (-60.0, 2.2, 13.0), (-40.0, 1.0, 17.0), 24), ('騎樓前那排（中段）往東', (-8.0, 2.2, 13.0), (12.0, 1.0, 17.0), 24), ('北側那排往西', (40.0, 2.2, -26.0), (20.0, 1.0, -31.0), 24)],
                 'axis': ('z', 12.0), 'walk': [(-55.0, 12.0), (-25.0, 12.0), (5.0, 12.0), (35.0, 12.0), (60.0, 12.0)]},
    'xinsheng': {'pano': [('北段往南（店面那一側）', (-4.0, 2.2, -45.0), (-12.0, 1.5, -25.0), 24), ('中段（同弦一帶）往南', (-4.0, 2.2, -15.0), (-12.0, 1.5, 5.0), 24), ('南段往北', (-4.0, 2.2, 40.0), (-12.0, 1.5, 20.0), 24)],
                 'axis': ('x', -10.0), 'walk': [(-10.0, -55.0), (-10.0, -25.0), (-10.0, 5.0), (-10.0, 35.0), (-10.0, 55.0)]},
}
TX = {'sign': {'z0': -9.5, 'z1': -6.3, 'y0': 4.9, 'y1': 5.8, 'x': -13.0}, 'door': (-15.6, -7.2), 'out': (-13.9, -7.2),
      'cams': [('正面', (-3.0, 1.7, -7.9), (-13.0, 5.2, -7.9), 28), ('斜看左（從北邊）', (-5.0, 1.7, -19.5), (-13.0, 5.2, -7.9), 30), ('斜看右（從南邊）', (-5.0, 1.7, 3.5), (-13.0, 5.2, -7.9), 30),
               ('近拍', (-9.0, 3.2, -7.9), (-13.0, 5.35, -7.9), 35), ('騎樓前玩家高度', (-8.0, 1.6, -12.5), (-13.0, 5.2, -7.9), 24)]}

ME = "(()=>{ const E=GAME.E, P=E.player, p=P.obj.position, N=E.nav; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), free:N?!!N.free(p.x,p.z):null, stand:E.canStand?!!E.canStand(p.x,p.z,0.3,P.lv|0):null, fb:GAME.walkFallbacks|0}; })()"
SNAPFREE = r"""(([x,z,r])=>{ const E=GAME.E; const ok=(a,b)=>E.canStand?E.canStand(a,b,0.33,0):(E.nav&&E.nav.free(a,b)); if(ok(x,z)) return [x,z,0]; let best=null;
  for(let rr=0.25;rr<=r+1e-6;rr+=0.25){ for(let k=0;k<24;k++){ const a=k/24*Math.PI*2, px=x+Math.cos(a)*rr, pz=z+Math.sin(a)*rr; if(ok(px,pz)){ best=[+px.toFixed(2),+pz.toFixed(2),+rr.toFixed(2)]; break; } } if(best) break; } return best; })"""
# 模型本身：三款配件的頂點（照頂點色）、外框、離地／離座墊、浮空（最低那圈往下打射線到車身）、穿模（配件頂點在車身裡的比例；三個方向打射線算交點奇偶，近似）
ACC_JS = r"""(async()=>{ let root=null; try{ const c=await ASSETS.loadOne('bldg.wz_scooter'); root=c&&c.scene; }catch(e){} if(!root) return {err:'沒有 scooter.glb'};
  root.updateMatrixWorld(true);
  const ACC={S1A_W:{name:'擋風鏡',cols:[[0.423,0.485,0.539]]}, S1B_G:{name:'腳踏板上的袋子',cols:[[0.694,0.098,0.068],[0.485,0.287,0.112]]}, S7_R:{name:'蓋座墊的雨衣',cols:[[0.768,0.558,0.042],[0.114,0.275,0.479]]}};
  const SEAT=[0.0123,0.0116,0.0116], near=(c,t,tol)=>Math.abs(c[0]-t[0])<tol&&Math.abs(c[1]-t[1])<tol&&Math.abs(c[2]-t[2])<tol, r3=v=>[+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)];
  const codes=[]; root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name||''); if(m&&!/_lod1$/.test(o.name)&&o.userData&&o.userData.weight>0) codes.push(m[1]); });   /* 只算有 weight 的款式節點（GLTFLoader 把多材質網格拆成 _1、_2 子網格，名字也是 scooter_…）*/
  const WHITE=[0.815,0.799,0.761];   /* 袋子本體（白色塑膠袋）用 helmet_w，和車身別的零件同色：照紅條紋＋牛皮紙袋的外框放大 6 cm，框裡的白色頂點算袋子 */
  const collect=(node,code)=>{ const inv=new THREE.Matrix4().copy(node.matrixWorld).invert(), M=new THREE.Matrix4(), v=new THREE.Vector3(); const out={accV:[],bodyV:[],seatV:[],accTri:[],bodyTri:[]};
    let wbox=null; if(code==='S1B_G'){ const pts=[]; node.traverse(o=>{ if(!o.isMesh) return; M.multiplyMatrices(inv,o.matrixWorld); const pa=o.geometry.attributes.position, ca=o.geometry.attributes.color; if(!ca) return;
      for(let k=0;k<pa.count;k++){ const c=[ca.getX(k),ca.getY(k),ca.getZ(k)]; if(ACC[code].cols.some(t=>near(c,t,0.006))) pts.push(v.fromBufferAttribute(pa,k).applyMatrix4(M).clone()); } }); if(pts.length) wbox=new THREE.Box3().setFromPoints(pts).expandByScalar(0.06); }
    node.traverse(o=>{ if(!o.isMesh) return; M.multiplyMatrices(inv,o.matrixWorld); const g=o.geometry, pa=g.attributes.position, ca=g.attributes.color, P=[], isA=new Uint8Array(pa.count);
      for(let k=0;k<pa.count;k++){ v.fromBufferAttribute(pa,k).applyMatrix4(M); P.push(v.clone()); const c=ca?[ca.getX(k),ca.getY(k),ca.getZ(k)]:null; const a=!!(c&&(ACC[code].cols.some(t=>near(c,t,0.006))||(wbox&&near(c,WHITE,0.006)&&wbox.containsPoint(P[k]))));
        isA[k]=a?1:0; (a?out.accV:out.bodyV).push(P[k]); if(c&&near(c,SEAT,0.0012)) out.seatV.push(P[k]); }
      const n=g.index?g.index.count:pa.count, ix=i=>g.index?g.index.getX(i):i;
      for(let i=0;i+2<n;i+=3){ const a=ix(i),b=ix(i+1),c=ix(i+2), t=[P[a],P[b],P[c]]; (isA[a]||isA[b]||isA[c]?out.accTri:out.bodyTri).push(t); } });
    return out; };
  const res={codes, acc:{}};
  for(const code of Object.keys(ACC)){ const node=root.getObjectByName('scooter_'+code); if(!node){ res.acc[code]={missing:true}; continue; }
    const C=collect(node,code); if(!C.accV.length){ res.acc[code]={name:ACC[code].name, accVerts:0}; continue; }
    const pos=new Float32Array(C.bodyTri.length*9); C.bodyTri.forEach((t,i)=>t.forEach((p,j)=>{ pos[i*9+j*3]=p.x; pos[i*9+j*3+1]=p.y; pos[i*9+j*3+2]=p.z; }));
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(pos,3)); const bm=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})); bm.updateMatrixWorld(true);
    const rc=new THREE.Raycaster(), down=new THREE.Vector3(0,-1,0);
    const aB=new THREE.Box3().setFromPoints(C.accV), bB=new THREE.Box3().setFromPoints(C.bodyV), sB=C.seatV.length?new THREE.Box3().setFromPoints(C.seatV):null;
    const gapOf=p=>{ rc.set(new THREE.Vector3(p.x,p.y+0.002,p.z),down); rc.far=5; const h=rc.intersectObject(bm,false).filter(q=>q.distance>0.0005); return Math.max(0,Math.min(h.length?h[0].distance-0.002:9,p.y)); };
    const stat=a=>{ if(!a.length) return null; const s=a.slice().sort((x,y)=>x-y); return {n:s.length,min:+s[0].toFixed(3),med:+s[Math.floor(s.length/2)].toFixed(3),max:+s[s.length-1].toFixed(3),le2cm:+(s.filter(x=>x<=0.02).length/s.length).toFixed(2)}; };
    const low=C.accV.filter(p=>p.y<aB.min.y+0.03), step=Math.max(1,Math.floor(low.length/60)), lowGaps=[]; for(let i=0;i<low.length;i+=step) lowGaps.push(gapOf(low[i]));
    let topToSeat=null; if(code==='S7_R'){ const mid=C.accV.filter(p=>Math.abs(p.z)<0.03); const g=mid.map(gapOf); topToSeat=stat(g); }
    const dirs=[new THREE.Vector3(0,1,0),new THREE.Vector3(1,0,0),new THREE.Vector3(0,0,1)]; let inside=0, tested=0; const st2=Math.max(1,Math.floor(C.accV.length/150));
    for(let i=0;i<C.accV.length;i+=st2){ const p=C.accV[i]; let odd=0; for(const d of dirs){ rc.set(p,d); rc.far=10; const ds=new Set(rc.intersectObject(bm,false).filter(q=>q.distance>0.003).map(q=>q.distance.toFixed(4))); if(ds.size%2===1) odd++; } if(odd>=2) inside++; tested++; }
    const sh=bB.clone().expandByScalar(-0.01); const inBox=C.accV.filter(p=>sh.containsPoint(p)).length;
    const lodN=root.getObjectByName('scooter_'+code+'_lod1'); const lodAcc=lodN?collect(lodN,code).accV.length:null;
    res.acc[code]={name:ACC[code].name, accVerts:C.accV.length, accTris:C.accTri.length, accBox:[r3(aB.min),r3(aB.max)], bodyBox:[r3(bB.min),r3(bB.max)], seatTop:sB?+sB.max.y.toFixed(3):null,
      accBottomAboveGround:+aB.min.y.toFixed(3), accBottomMinusSeatTop:sB?+(aB.min.y-sB.max.y).toFixed(3):null, accTopMinusSeatTop:sB?+(aB.max.y-sB.max.y).toFixed(3):null,
      lowGap:stat(lowGaps), topToSeat, insideFrac:tested?+(inside/tested).toFixed(3):null, insideTested:tested, inBodyBoxFrac:+(inBox/C.accV.length).toFixed(3), lod1AccVerts:lodAcc}; }
  return res; })()"""
# 街上每台機車：款式（汀州路照 zone.tzScList，其他照遊戲 attachWzScooters 同一套雜湊重算）、顏色、位置、車頭方向、哪一排；配件車的世界外框角點（近拍畫紅框用）
SC_JS = r"""(async a=>{ const E=GAME.E, z=E.zone||{}; let out=null; E.scene.traverse(o=>{ if(!out&&/scooters_glb$/.test(o.name||'')) out=o; });
  const kitNamed=[]; E.scene.traverse(o=>{ if(/_kit_scooters$/.test(o.name||'')) kitNamed.push(o.name+':'+o.children.filter(q=>q.isGroup).length); });
  if(!out) return {glb:false, kitNamed, tzScList:!!z.tzScList};
  /* 套件機車那一組：有名字的（wz_／gg_／l118_kit_scooters）優先；汀州路那一組沒有名字＝和正式模型同一層、藏起來、子群組數＝zone.tzScList 的台數 */
  const par=out.parent, nG=c=>c.children.filter(q=>q.isGroup).length, SLn=(z.tzScList||z.xsScList||[]).length;   /* 新生南路（1c2b6d4a3 起）：zone.xsScList、套件組 xs_kit_scooters */
  const scG=par.children.find(c=>c!==out&&c.isGroup&&/_kit_scooters$/.test(c.name||''))||par.children.find(c=>c!==out&&c.isGroup&&c.visible===false&&SLn&&nG(c)===SLn);
  let root=null; try{ const cc=await ASSETS.loadOne('bldg.wz_scooter'); root=cc&&cc.scene; }catch(e){} if(!root||!scG) return {glb:true, name:out.name, err:!root?'沒有 scooter.glb':'找不到套件機車那一組', kitNamed};
  root.updateMatrixWorld(true); const V=[]; root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name||''); if(!m||/_lod1$/.test(o.name)||!o.userData||!(o.userData.weight>0)) return; let pal=[]; try{ pal=JSON.parse(o.userData.palette||'[]'); }catch(e){}
    const inv=new THREE.Matrix4().copy(o.matrixWorld).invert(), b=new THREE.Box3(); o.traverse(q=>{ if(q.isMesh){ q.geometry.computeBoundingBox(); const bb=q.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,q.matrixWorld)); b.union(bb); } });
    V.push({code:m[1],w:+o.userData.weight,pal,box:b}); });
  const W=V.reduce((s,b)=>s+b.w,0), hash=(x,zz,k)=>{ const t=Math.sin(x*12.9898+zz*78.233+k*37.719)*43758.5453; return t-Math.floor(t); }, fix=new THREE.Matrix4().makeRotationY(-Math.PI/2);
  const fam=hex=>{ if(!hex) return null; if(typeof TZ3!=='undefined'&&TZ3.colorFam) return TZ3.colorFam(hex); const c=new THREE.Color(hex), h={}; c.getHSL(h,THREE.SRGBColorSpace); const H=h.h*360,S=h.s,Lm=h.l;
    if(Lm<0.22||(S>0.2&&H>=200&&H<=250&&Lm<0.33)) return 'dark'; if(S<0.14) return Lm>0.8?'white':'grey'; if(S<0.42&&H>=20&&H<=60&&Lm>0.6) return 'beige'; if(H<15||H>=340) return 'red'; if(H<65) return 'yellow'; if(H<170) return 'green'; return 'blue'; };
  const SL=z.tzScList||z.xsScList||null, kids=scG.children.filter(q=>q.isGroup), items=[];
  kids.forEach((o,ix)=>{ o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld); let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } }
    let col=v.pal.length?v.pal[Math.floor(hash(p.x,p.z,2)*v.pal.length)]:null, src='hash'; if(SL&&SL[ix]&&SL[ix].code){ const f=V.find(c=>c.code===SL[ix].code); if(f) v=f; col=SL[ix].col||col; src='zone'; }
    const e=o.matrixWorld.elements, fl=Math.hypot(e[8],e[10])||1, it={i:ix,x:+p.x.toFixed(2),y:+p.y.toFixed(3),z:+p.z.toFixed(2),fx:+(e[8]/fl).toFixed(3),fz:+(e[10]/fl).toFixed(3),code:v.code,col,fam:fam(col),src};
    if(SL&&SL[ix]&&SL[ix].grp) it.grp=SL[ix].grp;
    { const M4=new THREE.Matrix4().multiplyMatrices(o.matrixWorld,fix), b=v.box, c0=b.getCenter(new THREE.Vector3()).applyMatrix4(M4), ex=M4.elements, ax=[ex[0],ex[2]], az=[ex[8],ex[10]], la=Math.hypot(...ax)||1, lz=Math.hypot(...az)||1;
      it.obb={cx:+c0.x.toFixed(3), cz:+c0.z.toFixed(3), ax:[+(ax[0]/la).toFixed(4),+(ax[1]/la).toFixed(4)], az:[+(az[0]/lz).toFixed(4),+(az[1]/lz).toFixed(4)], hl:+((b.max.x-b.min.x)/2).toFixed(3), hw:+((b.max.z-b.min.z)/2).toFixed(3)};   /* 地面上的外框（車長方向 ax、車寬方向 az、半長、半寬）*/
      if(a.acc.includes(v.code)||a.allCorners){ const cs=[]; for(const dx of [b.min.x,b.max.x]) for(const dy of [b.min.y,b.max.y]) for(const dz of [b.min.z,b.max.z]){ const q=new THREE.Vector3(dx,dy,dz).applyMatrix4(M4); cs.push([+q.x.toFixed(3),+q.y.toFixed(3),+q.z.toFixed(3)]); } it.corners=cs; } }
    items.push(it); });
  /* 排：相距 1.3 m 以內的連在一起；排內照最長的方向排順序 */
  const par2=items.map((_,i)=>i), fd=i=>par2[i]===i?i:(par2[i]=fd(par2[i])); for(let i=0;i<items.length;i++) for(let j=i+1;j<items.length;j++) if(Math.hypot(items[i].x-items[j].x,items[i].z-items[j].z)<1.3) par2[fd(i)]=fd(j);
  const G={}; items.forEach((it,i)=>{ (G[fd(i)]=G[fd(i)]||[]).push(it); }); const rows=[];
  for(const k of Object.keys(G)){ const Lr=G[k]; const xs=Lr.map(q=>q.x), zs=Lr.map(q=>q.z), alongX=(Math.max(...xs)-Math.min(...xs))>=(Math.max(...zs)-Math.min(...zs)); Lr.sort((p,q)=>alongX?p.x-q.x:p.z-q.z);
    const cx=xs.reduce((s,x)=>s+x,0)/Lr.length, cz=zs.reduce((s,x)=>s+x,0)/Lr.length; let ident=0,same=0,sameFam=0,run=1,maxRun=1;
    for(let i=1;i<Lr.length;i++){ const A=Lr[i-1],B=Lr[i]; if(A.code===B.code&&A.col===B.col) ident++; if(A.code===B.code){ same++; run++; maxRun=Math.max(maxRun,run); } else run=1; if(A.fam===B.fam) sameFam++; }
    Lr.forEach(q=>{ q.row=rows.length; }); rows.push({id:rows.length,n:Lr.length,cx:+cx.toFixed(2),cz:+cz.toFixed(2),alongX,ident,same,sameFam,maxRunSameCode:Lr.length?maxRun:0,seq:Lr.map(q=>q.code+(q.col?'/'+q.col:''))}); }
  const by={}; items.forEach(q=>{ by[q.code]=(by[q.code]||0)+1; });
  const accPos={}; for(const c of a.acc) accPos[c]=items.filter(q=>q.code===c).map(q=>[q.x,q.z,'排'+q.row]);
  return {glb:true, name:out.name, kitNamed, kitName:scG.name||'(沒有名字)', n:items.length, models:V.map(v=>v.code), byCode:by, accPos, srcCount:items.reduce((o,q)=>(o[q.src]=(o[q.src]||0)+1,o),{}),
    adjIdentical:rows.reduce((s,r)=>s+r.ident,0), adjSameCode:rows.reduce((s,r)=>s+r.same,0), adjSameFam:rows.reduce((s,r)=>s+r.sameFam,0), maxRunSameCode:Math.max(0,...rows.map(r=>r.maxRunSameCode)),
    maxAbsY:Math.max(0,...items.map(q=>Math.abs(q.y))), rows, items, scPick:out.userData.scPick||null, tzScStat:z.tzScStat||null}; })"""
BOX_JS = r"""(a=>{ const E=GAME.E, cam=E.camera; const old=document.getElementById('ccbox'); if(old) old.remove(); if(!a) return null; cam.updateMatrixWorld(true);
  const xs=[], ys=[]; for(const c of a.corners){ const v=new THREE.Vector3(...c).project(cam); xs.push((v.x+1)/2*innerWidth); ys.push((1-v.y)/2*innerHeight); }
  const d=document.createElement('div'); d.id='ccbox'; const x0=Math.min(...xs), y0=Math.min(...ys); d.style.cssText='position:fixed;z-index:99999;pointer-events:none;border:3px solid #ff2020;left:'+x0+'px;top:'+y0+'px;width:'+(Math.max(...xs)-x0)+'px;height:'+(Math.max(...ys)-y0)+'px';
  const t=document.createElement('div'); t.textContent=a.label; t.style.cssText='position:absolute;left:0;top:-22px;color:#ff2020;font:bold 16px sans-serif;white-space:nowrap;text-shadow:0 0 3px #000'; d.appendChild(t); document.body.appendChild(d);
  return [Math.round(x0),Math.round(y0),Math.round(Math.max(...xs)-x0),Math.round(Math.max(...ys)-y0)]; })"""
CAP_JS = r"""(s=>{ let d=document.getElementById('cccap'); if(!s){ if(d) d.remove(); return; } if(!d){ d=document.createElement('div'); d.id='cccap'; d.style.cssText='position:fixed;left:0;top:0;right:0;z-index:99998;background:rgba(0,0,0,0.6);color:#fff;font:15px sans-serif;padding:3px 6px;pointer-events:none'; document.body.appendChild(d); } d.textContent=s; })"""
# 中央 60%（寬、高各取 20%～80%）亮度 <12 和 >245 的比例（瀏覽器 canvas 算，PC 沒有 PIL 也能跑）
LUMA_JS = r"""(async b64=>{ const im=new Image(); im.src='data:image/jpeg;base64,'+b64; await im.decode(); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0);
  const x0=Math.floor(im.width*0.2), y0=Math.floor(im.height*0.2), w=Math.floor(im.width*0.6), h=Math.floor(im.height*0.6), d=x.getImageData(x0,y0,w,h).data; let n=0,bk=0,wh=0,s=0;
  for(let i=0;i<d.length;i+=8){ const y=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; n++; s+=y; if(y<12) bk++; else if(y>245) wh++; } return {mean:+(s/n).toFixed(1), black:+(bk/n).toFixed(3), white:+(wh/n).toFixed(3)}; })"""
MONT_JS = r"""(async a=>{ const ims=await Promise.all(a.imgs.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src='data:image/jpeg;base64,'+u; })));
  const w=480, h=Math.round(480*ims[0].height/ims[0].width), C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows+30; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.fillText(a.title,8,22); ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,30+Math.floor(i/C)*h,w,h)); return k.toDataURL('image/jpeg',0.85); })"""
# 射線格子：從鏡頭打到二樓立面那一塊（招牌附近），記第一個打到的「看得到的」網格材質名稱、打到的位置
RAYGRID_JS = r"""(a=>{ const E=GAME.E, rc=new THREE.Raycaster(), eye=new THREE.Vector3(...a.eye); const P=E.player&&E.player.obj; const vis=o=>{ for(let q=o;q;q=q.parent){ if(q.visible===false) return false; if(P&&q===P) return false; } return true; };
  const mats={}, rows=[], key={}; let sign=0, signN=0; const inSign=(y,zz)=>y>=a.s.y0&&y<=a.s.y1&&zz>=a.s.z0&&zz<=a.s.z1, signHit={};
  for(let y=a.y1;y>=a.y0-1e-6;y-=a.dy){ let line=''; for(let zz=a.z0;zz<=a.z1+1e-6;zz+=a.dz){ const tgt=new THREE.Vector3(a.x,y,zz), dir=tgt.clone().sub(eye), L=dir.length(); dir.normalize(); rc.set(eye,dir); rc.far=L+2;
      const h=rc.intersectObject(E.scene,true).find(q=>q.object.isMesh&&vis(q.object)&&!(q.object.material&&!Array.isArray(q.object.material)&&q.object.material.visible===false));
      let nm=h?((Array.isArray(h.object.material)?h.object.material[h.face?h.face.materialIndex:0]:h.object.material)||{}).name||'(無名材質)':'(沒打到)'; if(h&&h.distance<L-1.2) nm+='＠前方'+(L-h.distance).toFixed(1)+'m';
      const base=nm.replace(/＠.*/,''); mats[nm]=(mats[nm]||0)+1; if(!(base in key)) key[base]=String.fromCharCode(65+Object.keys(key).length); line+=key[base];
      if(inSign(y,zz)){ signN++; signHit[nm]=(signHit[nm]||0)+1; if(/xs_fronts/.test(nm)) sign++; } } rows.push(y.toFixed(1)+' '+line); }
  return {key, rows, mats, signFrac:signN?+(sign/signN).toFixed(3):null, signN, signHit}; })"""
FPS_JS = "(ms=>new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else { const i=GAME.E.renderer.info.render; res({fps:+(n/((performance.now()-t0)/1000)).toFixed(1), calls:i.calls, tris:i.triangles}); } }; requestAnimationFrame(f); }))"


def b64(b):
    return base64.b64encode(b).decode()


async def at(pg, cdp, zone, h, x=None, z=None, why='', day=None):
    s = await D.load_zone(pg, cdp, zone, day or DAY, h, x, z, wait=8000)
    R.setup('【前置／捷徑】讀檔到 %s %s %.2f 時%s %s' % (zone, day or DAY, h, '' if x is None else ' (%.1f,%.1f)' % (x, z), why))
    return s


class Shooter:
    """一批獨立鏡頭的截圖（D.CAM：暫停、搬遊戲鏡頭、照新鏡頭重算淡出牆、NPC、行道樹；不動玩家）：1280×720、藏 HUD 和玩家、上面一條字。"""
    def __init__(self, pg, tag):
        self.pg = pg; self.tag = tag; self.imgs = []; self.files = []

    async def __aenter__(self):
        await self.pg.set_viewport_size({'width': 1280, 'height': 720}); await self.pg.wait_for_timeout(900)
        await self.pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await self.pg.evaluate(D.HUD + '(false)')
        return self

    async def shot(self, fn, label, eye, look, lens=24, box=None):
        c = await self.pg.evaluate(D.CAM, {'eye': list(eye), 'look': list(look), 'lens': lens}); await self.pg.wait_for_timeout(500)
        await self.pg.evaluate(CAP_JS, '%s｜%s｜%s' % (self.tag, label, SHA)); br = None
        if box: br = await self.pg.evaluate(BOX_JS, box)
        await self.pg.evaluate("GAME.E.render()")
        b = await self.pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=85)
        if box: await self.pg.evaluate(BOX_JS, None)
        lm = await self.pg.evaluate(LUMA_JS, b64(b)); self.imgs.append(b64(b)); self.files.append(fn)
        star = '　★大面積全黑（黑色車殼、座墊、輪胎也會算進去，看圖）' if lm['black'] > 0.15 else ('　★大面積全白' if lm['white'] > 0.15 else '')
        R.note('[截圖] %s %s：鏡頭 eye %s → look %s（lens %s、vfov %s）%s；中央 60%% 亮度 %s、全黑 %.1f%%、全白 %.1f%%%s' % (fn, label, J(c['eye']), J(c['look']), c['lens'], c['vfov'], ('；紅框 %s' % J(br)) if box else '', lm['mean'], lm['black'] * 100, lm['white'] * 100, star))
        return lm

    async def montage(self, fn, title, cols=4):
        if not self.imgs: return
        u = await self.pg.evaluate(MONT_JS, {'imgs': self.imgs, 'cols': cols, 'title': title})
        open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1])); R.note('[拼圖] %s（%d 張：%s）' % (fn, len(self.imgs), '、'.join(self.files)))

    async def __aexit__(self, *a):
        await self.pg.evaluate(CAP_JS, None); await self.pg.evaluate(D.UNCAM); await self.pg.evaluate(D.HUD + '(true)')
        await self.pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
        await self.pg.set_viewport_size({'width': 844, 'height': 390}); await self.pg.wait_for_timeout(900)


async def wait_scooters(pg, zone, max_s=30):
    """等機車正式模型掛上（場景裡 *_scooters_glb）；沒有任何套件機車（新生南路）就不等"""
    t0 = time.time(); kit = None
    while time.time() - t0 < max_s:
        q = await pg.evaluate("(()=>{ let g=null, kit=0; GAME.E.scene.traverse(o=>{ if(/scooters_glb$/.test(o.name||'')) g=o.name; if(/_kit_scooters$/.test(o.name||'')) kit++; }); return {g, kit:kit+((GAME.E.zone&&GAME.E.zone.tzScList&&GAME.E.zone.tzScList.length)?1:0)}; })()")
        if q['g']: return q['g'], round(time.time() - t0, 1)
        kit = q['kit']
        if not kit and time.time() - t0 > 6: return None, round(time.time() - t0, 1)
        await pg.wait_for_timeout(1000)
    return None, round(time.time() - t0, 1)


def toward_axis(zone, x, z):
    ax, v = STREETS[zone]['axis']
    return (v, z) if ax == 'x' else (x, v)


def unit(x, z):
    d = math.hypot(x, z) or 1.0
    return x / d, z / d


async def part_model(pg):
    res = await pg.evaluate(ACC_JS)
    if res.get('err'): R.check('[MODEL] 讀到 scooter.glb', False, res['err']); return
    R.note('[MODEL] scooter.glb 款式（%d）：%s' % (len(res['codes']), ' '.join(res['codes'])))
    for code, nm in ACC.items():
        a = res['acc'].get(code) or {}
        if a.get('missing'): R.note('[MODEL] %s（%s）：模型裡沒有這一款——舊版沒有是預期；新版沒有＝FAIL' % (code, nm)); R.check('[MODEL] %s 在 scooter.glb 裡（受測 %s；舊版 0eb2a0049 沒有是預期）' % (code, SHA or '?'), SHA.startswith('0eb2a'), ''); continue
        R.note('[MODEL] %s（%s）：%s' % (code, nm, J(a)))
        if not a.get('accVerts'): R.check('[MODEL] %s 找得到配件的頂點（照頂點色）' % code, False, J(a)); continue
        lg = a.get('lowGap') or {}
        if code in ('S1A_W', 'S1B_G'):
            R.check('[MODEL] %s %s 沒有浮空：配件最低那圈（最低 3 cm 內的頂點）往下到車身／地面的距離中位數 %s m（≤0.03；le2cm＝≤2 cm 的比例）' % (code, nm, lg.get('med')), lg.get('med') is not None and lg['med'] <= 0.03, J(lg))
        else:
            ts = a.get('topToSeat') or {}
            R.check('[MODEL] %s %s 蓋在座墊上：中線往下到座墊 %s m（0～0.08）；兩側垂下的下緣是懸空的（設計如此，不判）' % (code, nm, ts.get('med')), ts.get('med') is not None and 0 <= ts['med'] <= 0.08, J(ts))
        R.check('[MODEL] %s %s 配件頂點在車身裡面的比例 %s（<0.25；三方向射線奇偶，近似：車身零件不是封閉的殼會誤判，看近拍）' % (code, nm, a.get('insideFrac')), a.get('insideFrac') is not None and a['insideFrac'] < 0.25, '')
        R.note('[MODEL] %s 遠處簡化版（_lod1，16 m 外換）配件頂點 %s 個（0＝遠處看不到配件）' % (code, a.get('lod1AccVerts')))


async def part_street(pg, cdp):
    did_model = False
    for zone in ZONES:
        S_ = STREETS.get(zone)
        if not S_: R.note('[STREET] 不認得 %s' % zone); continue
        for h in HOURS:
            hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[STREET %s %s]' % (ZN[zone], hh)
            px, pz = S_['walk'][1]; await at(pg, cdp, zone, h, px, pz, '（%s 拍機車）' % ZN[zone])
            g, secs = await wait_scooters(pg, zone); await pg.wait_for_timeout(3000)
            R.note('%s 機車正式模型 %s（等了 %s 秒）' % (tag, g, secs))
            if not did_model and g: await part_model(pg); did_model = True
            st = await pg.evaluate(SC_JS, {'acc': list(ACC)}) if g else None
            if not g:
                kit = await pg.evaluate("(()=>{ const o=[]; GAME.E.scene.traverse(q=>{ if(/scoot/i.test(q.name||'')) o.push(q.name); }); return o.slice(0,20); })()")
                R.note('%s 這條街沒有路邊機車（場景裡名字有 scoot 的物件：%s）%s' % (tag, J(kit), '——新生南路 4eaf0d5e7 本來就沒有（xinsheng_layout.js 的 scooters 沒有程式讀）' if zone == 'xinsheng' else ''))
                if zone != 'xinsheng': R.check('%s 有機車正式模型' % tag, False, '')
            elif st.get('err'):
                R.check('%s 統計' % tag, False, J(st))
            else:
                items = st.pop('items'); rows = st.pop('rows')
                open(os.path.join(OUT, 'scoot4_%s_%s_items.json' % (zone, hh)), 'w', encoding='utf-8').write(J({'summary': st, 'rows': rows, 'items': items}))
                R.note('%s 共 %d 台（款式來源 %s；套件組 %s）；各款 %s' % (tag, st['n'], J(st['srcCount']), st['kitName'], J(st['byCode'])))
                for c, nm in ACC.items():
                    ps = st['accPos'].get(c) or []
                    if c not in st['models']: R.note('%s %s（%s）：模型裡沒有這一款（舊版沒有是預期）' % (tag, c, nm))
                    else: R.note('%s %s（%s）%d 台：%s%s' % (tag, c, nm, len(ps), J(ps), '' if ps or zone == 'tingzhou' else '（這條街照位置雜湊挑款，weight 0.04～0.05，0 台可能是運氣，不判）'))
                R.note('%s 同一排相鄰：款式＋顏色完全一樣 %d 對、同款 %d 對、同色系 %d 對；同款連續最長 %d 台；車身離地最大 %.3f m；共 %d 排' % (tag, st['adjIdentical'], st['adjSameCode'], st['adjSameFam'], st['maxRunSameCode'], st['maxAbsY'], len(rows)))
                for r in rows: R.note('%s 排 %d（中心 %.1f,%.1f；%d 台；完全一樣 %d 對、同款 %d 對）：%s' % (tag, r['id'], r['cx'], r['cz'], r['n'], r['ident'], r['same'], ' '.join(r['seq'])))
                if st.get('tzScStat'): R.note('%s 遊戲自己記的 tzScStat：%s' % (tag, J(st['tzScStat'])))
                if zone == 'tingzhou':
                    R.check('%s 汀州路相鄰沒有款式＋顏色完全一樣的（擺放規則：相鄰不同色系）' % tag, st['adjIdentical'] == 0, J(st['adjIdentical']))
                    if not SHA.startswith('0eb2a'): R.check('%s 汀州路三款配件車各至少一台' % tag, all(st['accPos'].get(c) for c in ACC), J(st['accPos']))
                R.check('%s 機車都停在地上（套件位置 y 絕對值 ≤0.02）' % tag, st['maxAbsY'] <= 0.02, J(st['maxAbsY']))
            async with Shooter(pg, '%s %s' % (ZN[zone], hh)) as sh:
                for k, (lab, eye, look, lens) in enumerate(S_['pano']):
                    free = await pg.evaluate("(([x,z])=>{ const N=GAME.E.nav; return N?!!N.free(x,z):null; })", [eye[0], eye[2]])
                    await sh.shot('scoot4_%s_%s_pano%d.jpg' % (zone, hh, k + 1), '全景 %s%s' % (lab, '' if free else '（機位不在可走格上）'), eye, look, lens)
                if g and not st.get('err'):
                    rx, rz = S_['pano'][1][1][0], S_['pano'][1][1][2]
                    row = min([r for r in rows if r['n'] >= 2] or rows, key=lambda r: math.hypot(r['cx'] - rx, r['cz'] - rz))
                    ux, uz = (1.0, 0.0) if row['alongX'] else (0.0, 1.0); tx, tz = toward_axis(zone, row['cx'], row['cz']); dx, dz = unit(tx - row['cx'], tz - row['cz'])
                    if abs(dx * ux + dz * uz) > 0.9: dx, dz = -uz, ux   # 中線和這一排平行：改往垂直方向
                    R.note('%s 最近一排＝排 %d（中心 %.1f,%.1f、%d 台）：%s' % (tag, row['id'], row['cx'], row['cz'], row['n'], ' '.join(row['seq'])))
                    for k, sg in enumerate((-1, 1)):
                        eye = (row['cx'] + dx * 3.6 + ux * sg * 2.6, 1.7, row['cz'] + dz * 3.6 + uz * sg * 2.6)
                        await sh.shot('scoot4_%s_%s_row%d.jpg' % (zone, hh, k + 1), '最近一排近拍 %d（排 %d、%d 台）' % (k + 1, row['id'], row['n']), eye, (row['cx'], 0.6, row['cz']), 24)
                    for c, nm in ACC.items():
                        cand = [q for q in items if q['code'] == c]
                        if not cand: continue
                        q = min(cand, key=lambda q: math.hypot(q['x'] - rx, q['z'] - rz)); tx, tz = toward_axis(zone, q['x'], q['z'])
                        sgn = 1 if (q['fx'] * (tx - q['x']) + q['fz'] * (tz - q['z'])) >= 0 else -1; dx, dz = q['fx'] * sgn, q['fz'] * sgn; sx, sz = -dz, dx
                        box = {'corners': q['corners'], 'label': '%s %s' % (c, nm)}
                        R.note('%s %s 近拍那一台：(%.2f,%.2f) 排 %s、顏色 %s、從%s拍' % (tag, c, q['x'], q['z'], q.get('row'), q['col'], '車頭那一側' if sgn > 0 else '車尾那一側'))
                        hd, hy, ly = (1.9, 2.7, 0.35) if c == 'S1B_G' else (3.0, 2.0, 0.55)   # 袋子在前擋板後面的踏板上：從車頭那一側高處往下看才看得到
                        await sh.shot('scoot4_%s_%s_%s_a.jpg' % (zone, hh, c), '%s %s 近拍（高）' % (c, nm), (q['x'] + dx * hd + sx * 0.7, hy, q['z'] + dz * hd + sz * 0.7), (q['x'], ly, q['z']), 26, box)
                        await sh.shot('scoot4_%s_%s_%s_b.jpg' % (zone, hh, c), '%s %s 近拍（低、斜）' % (c, nm), (q['x'] + dx * 3.2 - sx * 1.6, 1.2, q['z'] + dz * 3.2 - sz * 1.6), (q['x'], 0.6, q['z']), 26, box)
                await sh.montage('scoot4_%s_%s_all.jpg' % (zone, hh), '%s %s（%s）：全景三張、最近一排兩張、配件車近拍' % (ZN[zone], hh, SHA))


async def part_fps(pg, cdp):
    q = os.environ.get('Q') or 'medium'; secs = int(os.environ.get('FPSS') or 8)
    await pg.evaluate("(q=>{ const s=document.getElementById('setQuality'); if(s){ s.value=q; s.dispatchEvent(new Event('change')); } })", q)
    for zone in ZONES:
        S_ = STREETS.get(zone)
        if not S_: continue
        for k in (1, 3):
            if k >= len(S_['walk']): continue
            x, z = S_['walk'][k]; await at(pg, cdp, zone, HOURS[0], x, z, '（FPS 第 %d 點）' % k)
            g, _ = await wait_scooters(pg, zone); await pg.wait_for_timeout(3000)
            me = await pg.evaluate(ME); r = await pg.evaluate(FPS_JS, secs * 1000); npc = await pg.evaluate("(GAME.E.npcs||[]).length")
            R.note('[FPS %s 點%d] 畫質 %s、站 (%.1f,%.1f)（實際 %s）%d 秒：%s fps、draw call %s、三角形 %s；NPC %d；機車模型 %s（PC GPU，不是 iPhone；舊版同位置對照）' % (ZN[zone], k, q, x, z, J([me['x'], me['z']]), secs, r['fps'], r['calls'], r['tris'], npc, g))


async def part_walk(pg, cdp):
    for zone in ZONES:
        S_ = STREETS.get(zone)
        if not S_: continue
        tag = '[WALK %s]' % ZN[zone]; pts = S_['walk']
        await at(pg, cdp, zone, HOURS[0], pts[0][0], pts[0][1], '（沿街走的起點）'); await F.ready(pg, cdp, 20)
        fb0 = (await pg.evaluate(ME))['fb']; bad = []
        for (tx, tz) in pts[1:]:
            sp = await pg.evaluate(SNAPFREE, [tx, tz, 3.0])
            if not sp: R.note('%s (%.1f,%.1f) 3 m 內沒有站得住的地方，跳過' % (tag, tx, tz)); continue
            if sp[2] > 0: R.note('%s 目標 (%.1f,%.1f) 站不住，改最近站得住的 (%.2f,%.2f)（挪 %.2f m）' % (tag, tx, tz, sp[0], sp[1], sp[2]))
            r = await F.joy_to(pg, cdp, '%s → (%.1f,%.1f)' % (tag, sp[0], sp[1]), sp[0], sp[1], near=0.8, max_s=90)
            R.note('%s 搖桿到 (%.1f,%.1f)：%s、%s 秒、推 %d 次、跳 %s%s' % (tag, sp[0], sp[1], r['ok'], r['t'], r['pushes'], J(r['jumps']), ('；' + r['why']) if r.get('why') else ''))
            if not r['ok'] or r['jumps']: bad.append([sp[0], sp[1], r.get('why'), r['jumps']])
        me = await pg.evaluate(ME)
        R.check('%s 搖桿沿街走完，每一段都走到、沒有跳' % tag, not bad, J(bad))
        R.check('%s walkFallbacks 0' % tag, me['fb'] - fb0 == 0, J(me))


async def part_txsign(pg, cdp):
    s = TX['sign']
    for h in HOURS:
        hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[TXSIGN %s]' % hh
        await at(pg, cdp, 'xinsheng', h, -10.0, -2.0, '（新生南路店面那一側人行道）')
        for _ in range(20):
            if await pg.evaluate("!!GAME.E.scene.getObjectByName('xinsheng_street_glb')"): break
            await pg.wait_for_timeout(1000)
        glb = await pg.evaluate("!!GAME.E.scene.getObjectByName('xinsheng_street_glb')"); await pg.wait_for_timeout(2500)
        lay = await pg.evaluate("(()=>{ const L=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=L&&L.shops.find(s=>s.id==='tongxian'); return q?{z0:q.z0,z1:q.z1,door:q.door,fx:L.facade.x,upper:L.facade.upper}:null; })()")
        R.note('%s 新生南路正式模型 xinsheng_street_glb：%s；同弦配置 %s；招牌（照 wz_street.py 換算）z %.1f～%.1f、y %.1f～%.1f、立面 x %.1f' % (tag, glb, J(lay), s['z0'], s['z1'], s['y0'], s['y1'], s['x']))
        async with Shooter(pg, '同弦樂器招牌 %s' % hh) as sh:
            for k, (lab, eye, look, lens) in enumerate(TX['cams']):
                await sh.shot('tx_sign_%s_%d.jpg' % (hh, k + 1), lab, eye, look, lens)
                rg = await pg.evaluate(RAYGRID_JS, {'eye': list(eye), 'x': s['x'] + 0.05, 'y0': 4.4, 'y1': 6.4, 'dy': 0.2, 'z0': -13.2, 'z1': -4.0, 'dz': 0.4, 's': s})   # z −13.2～−4.0：招牌、旁邊的吉他櫥窗、兩側都進格子
                R.note('%s %s 射線格子（從鏡頭打到立面 x %.2f；第一個打到的材質；招牌範圍內打到 *xs_fronts*（招牌貼圖）的比例 %s（招牌範圍共 %s 格）：代號 %s' % (tag, lab, s['x'] + 0.05, rg['signFrac'], rg['signN'], J(rg['key'])))
                R.note('%s %s 招牌範圍內各材質：%s；整塊：%s' % (tag, lab, J(rg['signHit']), J(rg['mats'])))
                for line in rg['rows']: R.note('%s %s 　y %s（z −13.2 → −4.0，每格 0.4 m；左邊＝北）' % (tag, lab, line))
            await sh.montage('tx_sign_%s_all.jpg' % hh, '同弦樂器招牌 %s（%s）：正面、斜看左右、近拍、騎樓前' % (hh, SHA), cols=3)


async def open_day(pg):
    """同弦週一公休（places.js 45 行）：從 DAY 往後找第一個 14:00 開著的日子"""
    k = await pg.evaluate("(k=>{ let d0=null; try{ d0=(typeof STORY!=='undefined'&&STORY.dayOfKey)?STORY.dayOfKey(k):null; }catch(e){} if(d0==null) for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k){ d0=d; break; } }catch(e){ break; } } if(d0==null) return null;"
                          " for(let d=d0;d<d0+8;d++){ let ws=null; try{ ws=PLACES.windowsOf('xs_tongxian',d); }catch(e){ return {key:k,why:'沒有 PLACES.windowsOf'}; } if(ws&&ws.some(w=>w[0]<=14&&w[1]>14.5)) return {key:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd, ws}; } return {key:k,why:'八天都沒開'}; })", DAY)
    R.note('[TXDOOR] 同弦營業日：%s' % J(k))
    return (k or {}).get('key') or DAY


async def door_of(pg, pred_js):
    return await pg.evaluate("(()=>{ const f=" + pred_js + "; const i=(GAME.E.interactables||[]).find(q=>!q.hidden&&q.exit&&f(q)); return i?{x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:i.lv|0,label:i.label,to:i.exit.to}:null; })()")


async def part_txdoor(pg, cdp):
    day = await open_day(pg)
    await at(pg, cdp, 'xinsheng', 14.0, -10.5, -2.0, '（新生南路店面那一側人行道）', day=day); await F.ready(pg, cdp, 20)
    fb0 = (await pg.evaluate(ME))['fb']
    for n in range(1, int(os.environ.get('TXN') or 2) + 1):
        tag = '[TXDOOR 第%d次]' % n
        d = await door_of(pg, "q=>/同弦/.test(q.label||'')&&q.exit.to==='xs_tongxian'")
        if not R.check('%s 新生南路有「進同弦樂器」' % tag, bool(d), J(await pg.evaluate("(GAME.E.interactables||[]).filter(i=>/同弦/.test(i.label||'')).map(i=>({label:i.label,x:i.x,z:i.z,look:i.look||null}))"))): return
        R.note('%s 店門互動點 %s（程式應在 (%.1f,%.1f) r 1.4）' % (tag, J(d), TX['door'][0], TX['door'][1]))
        t0 = time.time(); s = await F.enter_door(pg, cdp, tag, d)
        if not s: return
        R.note('%s 進店 %.1f 秒（走路＋黑幕）；進來站在 %s' % (tag, time.time() - t0, J({k: s[k] for k in ('zone', 'x', 'z', 'stand', 'interact')})))
        mv = await D.pushable(pg, cdp); R.check('%s 店裡搖桿推得動（%.2f m）' % (tag, mv), mv >= 0.3, '')
        await D.shot(pg, 'tx_door_in%d' % n, judge_black=True)
        ex = await door_of(pg, "q=>q.exit.to==='xinsheng'")
        if not R.check('%s 店裡有出口回新生南路' % tag, bool(ex), ''): return
        s = await F.enter_door(pg, cdp, tag + '出店', ex)
        if not s: return
        R.check('%s 回到新生南路、站在店門外面 (%.1f,%.1f) 附近 1 m 內：%s' % (tag, TX['out'][0], TX['out'][1], J([s['x'], s['z']])), math.hypot(s['x'] - TX['out'][0], s['z'] - TX['out'][1]) <= 1.0 and s['stand'], J(s))
        mv = await D.pushable(pg, cdp); R.check('%s 出店後推得動（%.2f m）' % (tag, mv), mv >= 0.3, '')
        await D.shot(pg, 'tx_door_out%d' % n, judge_black=True)
    if os.environ.get('XSZONES', '1') != '0':
        for to, lab in (('wenzhou', '溫州街巷口'), ('campus', '側門')):
            tag = '[XSZONE %s]' % lab
            d = await door_of(pg, "q=>q.exit.to==='%s'" % to)
            if not R.check('%s 新生南路有往 %s 的出口' % (tag, to), bool(d), ''): continue
            s = await F.enter_door(pg, cdp, tag, d)
            if not s: await at(pg, cdp, 'xinsheng', 14.0, -10.5, -2.0, '（上一段沒過去，回新生南路）', day=day); continue
            await pg.wait_for_timeout(1500); back = await door_of(pg, "q=>q.exit.to==='xinsheng'")
            if not R.check('%s %s 有回新生南路的出口' % (tag, to), bool(back), ''): await at(pg, cdp, 'xinsheng', 14.0, -10.5, -2.0, '（回新生南路）', day=day); continue
            R.note('%s %s 回程出口 %s' % (tag, to, J(back)))
            s = await F.enter_door(pg, cdp, tag + '回', back)
            if s: mv = await D.pushable(pg, cdp); R.check('%s 回到新生南路推得動（%.2f m）；站在 %s' % (tag, mv, J([s['x'], s['z']])), mv >= 0.3 and s['stand'], J(s))
            else: await at(pg, cdp, 'xinsheng', 14.0, -10.5, -2.0, '（回程沒過去，回新生南路）', day=day)
    me = await pg.evaluate(ME); R.check('[TXDOOR] walkFallbacks 0', me['fb'] - fb0 == 0, J(me))


# ---------------------------------------------------------------- XSCOOT（BB 04:16：新生南路路邊機車，1c2b6d4a3＝LAWWW2 第六包 348b343a2）
XS_LAY_JS = r"""(()=>{ const L=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null; if(!L) return null; const its=(GAME.E.interactables||[]).filter(i=>!i.hidden);
  const shops=L.shops.filter(s=>s.door).map(s=>{ const it=its.filter(i=>i.x<-12&&Math.abs(i.z-s.door.z)<1.6).sort((p,q)=>Math.abs(p.z-s.door.z)-Math.abs(q.z-s.door.z))[0]||null;
    return {id:s.id, name:s.name, doorZ:s.door.z, doorW:s.door.w||2, it:it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.2,label:it.label,to:it.exit?it.exit.to:null,lv:it.lv|0}:null}; });
  return {shops, crossings:L.crossings, wl:L.wenzhouLane, ww:L.walkWest, we:L.walkEast, road:L.road, arcade:L.arcade, sc:L.scooters||null, sg:L.sideGate, spawn:GAME.E.zone&&GAME.E.zone.spawn?{x:GAME.E.zone.spawn.x,z:GAME.E.zone.spawn.z}:null,
    xsScooters:GAME.E.zone?GAME.E.zone.xsScooters:null, spotsFn:typeof XS3!=='undefined'&&!!XS3.scooterSpots}; })()"""
NAVDUMP_JS = r"""(()=>{ const E=GAME.E, N=E.nav; if(!N||!E.canStand) return null; let s=''; for(let r=0;r<N.rows;r++) for(let c=0;c<N.cols;c++){ const [x,z]=N.toWorld(c,r); s+=E.canStand(x,z,0.3,0)?'1':'0'; }
  return {cols:N.cols, rows:N.rows, cell:N.cell, ox:N.ox, oz:N.oz, bits:s, stand:(s.match(/1/g)||[]).length}; })()"""
XS_PANO = [('北段兩群往南（店面那一側）', (-6.0, 2.2, -44.0), (-12.5, 0.8, -24.0), 24), ('中段那一群往北', (-6.0, 2.2, -8.0), (-12.5, 0.8, -20.0), 24), ('南段那一群往南', (-6.0, 2.2, 28.0), (-12.5, 0.8, 42.0), 24)]


def hh_of(h):
    return '%02d%02d' % (int(h), int(round((h % 1) * 60)))


def obb_poly(o, pad=0.0):
    hl, hw = o['hl'] + pad, o['hw'] + pad; ax, az = o['ax'], o['az']
    return [(o['cx'] + sa * hl * ax[0] + sb * hw * az[0], o['cz'] + sa * hl * ax[1] + sb * hw * az[1]) for sa, sb in ((1, 1), (1, -1), (-1, -1), (-1, 1))]


def obb_dist(o, x, z):
    """點到地面外框的距離（在框裡＝0）"""
    dx, dz = x - o['cx'], z - o['cz']; u = dx * o['ax'][0] + dz * o['ax'][1]; v = dx * o['az'][0] + dz * o['az'][1]
    return math.hypot(max(0.0, abs(u) - o['hl']), max(0.0, abs(v) - o['hw']))


def poly_rect_hit(poly, x0, z0, x1, z1):
    """凸四邊形和軸向矩形有沒有交集（分離軸）；有就回傳兩者外框交集的大約範圍（x、z 長度）"""
    rect = [(x0, z0), (x1, z0), (x1, z1), (x0, z1)]; axes = [(1, 0), (0, 1)]
    for i in range(4):
        ex, ez = poly[(i + 1) % 4][0] - poly[i][0], poly[(i + 1) % 4][1] - poly[i][1]; axes.append((-ez, ex))
    for a in axes:
        p1 = [p[0] * a[0] + p[1] * a[1] for p in poly]; p2 = [p[0] * a[0] + p[1] * a[1] for p in rect]
        if max(p1) < min(p2) or max(p2) < min(p1): return None
    xs, zs = [p[0] for p in poly], [p[1] for p in poly]
    return [round(min(max(xs), x1) - max(min(xs), x0), 2), round(min(max(zs), z1) - max(min(zs), z0), 2)]


def nav_diff(a, b):
    if not a or not b or a['cols'] != b['cols'] or a['rows'] != b['rows']: return None
    out = []
    for i, (p, q) in enumerate(zip(a['bits'], b['bits'])):
        if p != q:
            c, r = i % a['cols'], i // a['cols']; out.append((round(a['ox'] + (c + 0.5) * a['cell'], 2), round(a['oz'] + (r + 0.5) * a['cell'], 2), 'lost' if q == '0' else 'gained'))
    return out


async def part_xscoot(pg, cdp):
    tag = '[XSCOOT]'
    await at(pg, cdp, 'xinsheng', HOURS[0], None, None, '（新生南路，出生在區域的出生點＝側門）')
    g, secs = await wait_scooters(pg, 'xinsheng'); await pg.wait_for_timeout(3000)
    lay = await pg.evaluate(XS_LAY_JS)
    if not R.check('%s 有 XINSHENG_LAYOUT' % tag, bool(lay), ''): return
    R.note('%s 正式機車模型 %s（等 %s 秒）；zone.xsScooters %s；XS3.scooterSpots %s；配置 scooters %s' % (tag, g, secs, lay['xsScooters'], lay['spotsFn'], J(lay['sc'])))
    R.note('%s 店門互動點：%s' % (tag, J([[q['id'], q['name'], q['it']] for q in lay['shops']])))
    R.note('%s 斑馬線 %s；溫州街巷口 %s；店面那一側人行道 %s；出生點（側門）%s' % (tag, J(lay['crossings']), J({k: lay['wl'][k] for k in ('x0', 'x1', 'z0', 'z1')}), J(lay['ww']), J(lay['spawn'])))
    items = []
    if g:
        st = await pg.evaluate(SC_JS, {'acc': list(ACC), 'allCorners': True})
        if st.get('err'): R.check('%s 機車統計' % tag, False, J(st)); return
        items = st.pop('items'); rows = st.pop('rows')
        open(os.path.join(OUT, 'xscoot_items.json'), 'w', encoding='utf-8').write(J({'summary': st, 'rows': rows, 'items': items}))
        grps = {}
        for q in items: grps.setdefault(q.get('grp') or ('排%d' % q['row']), []).append(q)
        R.note('%s 共 %d 台、%d 群（款式來源 %s）；各款 %s；各群 %s' % (tag, st['n'], len(grps), J(st['srcCount']), J(st['byCode']), J({k: [q['code'] for q in v] for k, v in grps.items()})))
        for c, nm in ACC.items(): R.note('%s %s（%s）在這條街 %d 台：%s' % (tag, c, nm, len(st['accPos'].get(c) or []), J(st['accPos'].get(c) or [])))
        R.note('%s 同一排相鄰：款式＋顏色完全一樣 %d 對、同款 %d 對、同色系 %d 對' % (tag, st['adjIdentical'], st['adjSameCode'], st['adjSameFam']))
        # 交集：店門互動點的圓、斑馬線（路面那一塊＋人行道上走到斑馬線的那一段）、溫州街巷口
        hits = []; WW, RD, WL = lay['ww'], lay['road'], lay['wl']
        for q in items:
            o = q['obb']; poly = obb_poly(o)
            for sh in lay['shops']:
                it = sh['it']
                if it:
                    dd = obb_dist(o, it['x'], it['z'])
                    if dd <= it['r']: hits.append(['店門互動點', sh['name'], [q['x'], q['z'], q['code']], '外框離互動點中心 %.2f m（半徑 %.2f）' % (dd, it['r'])])
            for c in lay['crossings']:
                h1 = poly_rect_hit(poly, RD['x0'], c['z'] - c['w'] / 2, RD['x1'], c['z'] + c['w'] / 2)
                if h1: hits.append(['斑馬線（路面）', c.get('id'), [q['x'], q['z'], q['code']], '交集約 %s m' % h1])
                h2 = poly_rect_hit(poly, WW['x0'], c['z'] - c['w'] / 2, WW['x1'], c['z'] + c['w'] / 2)
                if h2: hits.append(['斑馬線前的人行道（x %.1f～%.1f）' % (WW['x0'], WW['x1']), c.get('id'), [q['x'], q['z'], q['code']], '交集約 %s m' % h2])
            h3 = poly_rect_hit(poly, WL['x0'], WL['z0'], WW['x1'], WL['z1'])
            if h3: hits.append(['溫州街巷口（巷子到人行道邊 x %.1f～%.1f）' % (WL['x0'], WW['x1']), '', [q['x'], q['z'], q['code']], '交集約 %s m' % h3])
        for h in hits: R.note('%s 交集：%s %s × 機車 %s：%s' % (tag, h[0], h[1], J(h[2]), h[3]))
        R.check('%s 機車外框不碰店門互動點的圓、斑馬線、溫州街巷口' % tag, not hits, J(hits[:10]))
        async with Shooter(pg, '新生南路機車 %s' % hh_of(HOURS[0])) as sh:
            for k, (lab, eye, look, lens) in enumerate(XS_PANO):
                await sh.shot('xscoot_pano%d.jpg' % (k + 1), '全景 %s' % lab, eye, look, lens)
            for gk, v in sorted(grps.items(), key=lambda kv: min(q['z'] for q in kv[1])):
                cx = sum(q['x'] for q in v) / len(v); cz = sum(q['z'] for q in v) / len(v)
                await sh.shot('xscoot_%s.jpg' % gk, '群 %s（%d 台：%s）' % (gk, len(v), ' '.join(q['code'] for q in v)), (cx + 3.4, 1.8, cz - 1.8), (cx, 0.6, cz), 28)
            await sh.montage('xscoot_all.jpg', '新生南路路邊機車（%s）：全景三張、每一群近拍' % SHA, cols=4)
    else:
        R.note('%s 這一版新生南路沒有路邊機車（舊版 0eb2a0049 是 0 台，預期）' % tag)
    # 導航格：存這一版的格子（舊版那一行產生，新版那一行 OLDNAV 指過去比）；同一版拿掉機車再掃一次當基準（【捷徑】XS3.scooterSpots 換成空的）
    cur = await pg.evaluate(NAVDUMP_JS)
    fn = os.path.join(OUT, 'xs_nav_%s.json' % (SHA or 'unknown')); open(fn, 'w', encoding='utf-8').write(J(cur)); R.note('%s 這一版的 canStand 格子存在 %s（%d×%d、站得住 %d 格）' % (tag, fn, cur['cols'], cur['rows'], cur['stand']))
    bases = []
    if g and lay['spotsFn']:
        await pg.evaluate("(()=>{ window.__ccSpots=XS3.scooterSpots; XS3.scooterSpots=()=>[]; })()")
        try:
            await at(pg, cdp, 'xinsheng', HOURS[0], None, None, '【捷徑】XS3.scooterSpots 暫時換成空的（同一版、沒有機車的基準）'); await pg.wait_for_timeout(1500)
            bases.append(('同一版拿掉機車', await pg.evaluate(NAVDUMP_JS)))
        finally:
            await pg.evaluate("(()=>{ if(window.__ccSpots) XS3.scooterSpots=window.__ccSpots; })()")
    on = os.environ.get('OLDNAV')
    if on and os.path.exists(on): bases.append(('舊版檔案 ' + os.path.basename(on), json.load(open(on, encoding='utf-8'))))
    elif on: R.note('%s OLDNAV=%s 找不到檔案（舊版那一行要先跑）' % (tag, on))
    for nm, b in bases:
        df = nav_diff(b, cur)
        if df is None: R.check('%s 導航格和「%s」同尺寸' % (tag, nm), False, J({k: b.get(k) for k in ('cols', 'rows')})); continue
        far = [list(d) + [round(min([obb_dist(q['obb'], d[0], d[1]) for q in items] or [99.0]), 3)] for d in df if not any(obb_dist(q['obb'], d[0], d[1]) <= 0.35 for q in items)]   # 最後一欄＝離最近那台外框幾公尺（導航阻擋＝配置 x、z 前後 0.4 m 的方框，canStand 再加半徑 0.3：外框邊上差幾公分的會在這裡）
        R.note('%s 和「%s」比：不一樣的格子 %d 個（少了 %d、多了 %d）；不在機車外框＋0.35 m 以內的 %d 個：%s' % (tag, nm, len(df), sum(1 for d in df if d[2] == 'lost'), sum(1 for d in df if d[2] == 'gained'), len(far), J(far[:40])))
        R.check('%s 和「%s」比，不一樣的格子都在機車外框＋0.35 m 以內' % (tag, nm), not far, J(far[:20]))
    if bases and bases[0][0] == '同一版拿掉機車':
        await at(pg, cdp, 'xinsheng', HOURS[0], None, None, '（換回有機車的新生南路）'); await wait_scooters(pg, 'xinsheng'); await pg.wait_for_timeout(1500)
    # 從側門出發，搖桿走到每一間店門口（最近的先走）；互動鍵要是「進…」、按得到（進去再從店裡出口出來，接著走下一間）
    await F.ready(pg, cdp, 20); me0 = await pg.evaluate(ME); todo = [q for q in lay['shops'] if q['it']]; fbs = 0; fb0 = me0['fb']
    R.note('%s 店門巡一趟：從 %s 出發（側門出生點 %s）' % (tag, J([me0['x'], me0['z']]), J(lay['spawn'])))
    while todo:
        me = await pg.evaluate(ME); sh = min(todo, key=lambda q: math.hypot(q['it']['x'] - me['x'], q['it']['z'] - me['z'])); todo.remove(sh); it = sh['it']
        t = '%s 店門 %s' % (tag, sh['name'])
        r = await F.joy_to(pg, cdp, t, it['x'], it['z'], near=min(0.9, it['r'] * 0.5), max_s=150)
        s_ = await F.wait_btn(pg, it['label'], 5)
        R.check('%s 搖桿走到（%s 秒、推 %d 次、沒有跳），互動鍵是「%s」' % (t, r['t'], r['pushes'], it['label']), r['ok'] and not r['jumps'] and s_['interact'].startswith(it['label']), J({'end': [s_['x'], s_['z']], 'btn': s_['interact'], 'why': r.get('why'), 'jumps': r['jumps']}))
        if it['to']:
            R.check('%s 互動鍵是「進…」' % t, it['label'].startswith('進'), it['label'])
            if s_['interact'].startswith(it['label']):
                await L.tap(pg, cdp, '#interact'); z_ = await D.wait_zone(pg, cdp, it['to'], max_s=25)
                ok = z_['zone'] == it['to']; R.check('%s 按得到：進到 %s' % (t, it['to']), ok, J({k: z_[k] for k in ('zone', 'x', 'z', 'interact')}))
                if ok:
                    await pg.wait_for_timeout(1500)
                    ex = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>!q.hidden&&q.exit&&q.exit.to==='xinsheng'); return i?{x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1,lv:i.lv|0,label:i.label,to:'xinsheng'}:null; })()")
                    if ex: await F.enter_door(pg, cdp, t + ' 出店', ex)
                    me = await pg.evaluate(ME)
                    if me['zone'] != 'xinsheng':
                        R.note('%s 出不來，讀檔回新生南路店門前繼續' % t); await at(pg, cdp, 'xinsheng', HOURS[0], it['x'] + 1.7, it['z'], '（出不來，回店門外）')
        else:
            R.note('%s 這間沒有室內（互動鍵「%s」，看櫥窗）' % (t, it['label']))
        me = await pg.evaluate(ME); fbs += max(0, me['fb'] - fb0); fb0 = me['fb']
    R.check('%s 巡店門一趟 walkFallbacks 0' % tag, fbs == 0, J(me))


async def main():
    print('CC SCOOTER4／TX_sign：受測 %s；PARTS %s；ZONES %s；HOURS %s；Playwright ≠ iPhone' % (SHA, ','.join(PARTS), ','.join(ZONES), HOURS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('STREET', part_street), ('FPS', part_fps), ('WALK', part_walk), ('TXSIGN', part_txsign), ('TXDOOR', part_txdoor), ('XSCOOT', part_xscoot)):
            if part not in PARTS: continue
            t0 = time.time()
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            R.note('[%s] 用了 %.0f 秒' % (part, time.time() - t0))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
