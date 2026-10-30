"""校園地標的正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  LAWWW 2026-10-10 23:26Z 分派的順序：①總圖書館 bldg.campus_library（campus_library.py）②傅鐘 bldg.campus_bell（campus_bell.py）③行政大樓 bldg.campus_admin（campus_hall.py --set admin）
  ④文學院 bldg.campus_arts、校史館 bldg.campus_hist（campus_hall.py --set arts／hist）；⑤洞洞館 bldg.campus_pavilion（campus_pavilion.py）、社科院 bldg.campus_modern（campus_modern.py）。
  新的地標加進 TAGS 就好（標記、外框、匾額、效能的檢查都照 TAGS 跑）。

比較的對象＝「改之前」：同一版遊戲、開機後把 manifest 裡這些地標的 key 拿掉再進校園（套件照舊參加整區靜態合併，和這次修改之前一模一樣；
其他正式模型（霖澤館外觀、路燈腳踏車）兩邊都有，只比地標）。不用 ?nobldg：那會連路燈、腳踏車、霖澤館一起換掉，效能數字分不出是誰的。
檢查（LAWWW 23:26Z 的條件）：
  1. 校園裡有 ckTag 的只有 TAGS 這幾個，都接上正式模型、套件外觀全部藏起來；沒有標記的東西（樹、路燈、其他建築、背景）沒有多藏任何一個。
  2. 位置、尺寸、朝向照套件：正式模型的外框和套件的外框差 ≤ 1.5 m（屋簷、簷口出挑的差別）；同一個標記的套件物件取聯集（大一女舍 A、B、天橋）；
     共同教學館的設計差異（四樓、西側木造走廊、前庭蒲葵）照 BBOX_TOL、BBOX_REGION，蒲葵樹幹另外檢查＝導航的 GT_PALMS。
  3. 互動點和「改之前」完全相同；導航格、鏡頭碰撞方塊只准差在共同教學館宣告過的地方（大樹牆拿掉的樹、蒲葵樹幹；ck.cols 取代套件預設的方塊），其他完全相同（2026-10-14 補）。
  4. 匾額（總圖「總圖書館」、傅鐘石碑「傅鐘」、行政大樓門廊檐部「行政大樓」、文學院門廊檐部「文學院」、校史館中央拱上方「校史館」）：石材匾額，canvas 字、貼圖比例＝板面比例。
  5. 夜間：總圖、行政大樓、文學院、校史館 20:30 窗戶亮、11:00 不亮（亮燈、沒亮燈的窗同一個材質：自發光貼圖左半黑、右半燈光，UV 決定亮不亮）；傅鐘的地燈燈罩、柱面暖光、光暈 20:30 亮、11:00 不亮，套件的光暈晚上不會跑回來（藏起來的套件光暈
     會被 TK.setNight 重新打開——這一項在沒修的版本會失敗）、夜裡才進校園（模型在晚上才載入）光暈也是亮的；20:30 路燈開著，開燈數和改之前一樣。
  6. 陰影：大面（牆、屋頂、石材）投影；窗框、窗洞、玻璃、門、燈罩、暖光片不投影。
  7. 太陽：中午在南邊（校園 x 往東、−z 往北，沒有 sunYaw）。
  8. 效能：同一個鏡頭（藏起路人與騎腳踏車的路人；含陰影那一輪、含玩家）三角形 ≤ 改之前、draw call ≤ 改之前的 1.1 倍。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到校園（GAME.applySave），關掉條件事件；直接設鏡頭位置截圖與量 draw call。
用法：python3 tests/campus_glb_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'campus_glb_integration')
# ckTag → (manifest key, 正式模型的節點名稱, 匾額板面的名稱)
TAGS = {'library': ('bldg.campus_library', 'campus_library_glb', 'PLATE_FACE_LIB'),
        'bell': ('bldg.campus_bell', 'campus_bell_glb', 'PLATE_FACE_BELL'),
        'admin': ('bldg.campus_admin', 'campus_admin_glb', 'PLATE_FACE_ADMIN'),
        'arts': ('bldg.campus_arts', 'campus_arts_glb', 'PLATE_FACE_ARTS'),
        'hist': ('bldg.campus_hist', 'campus_hist_glb', 'PLATE_FACE_HIST'),
        'pavilion': ('bldg.campus_pavilion', 'campus_pavilion_glb', 'PLATE_FACE_PAV'),
        'soc': ('bldg.campus_modern', 'campus_modern_glb', 'PLATE_FACE_SOC')}
# v9.6 不放共同教學館、大一女舍的正式模型（src/assets3d.js 的說明）：manifest 有才檢查（開發分支照舊接著，那邊兩個都會檢查）
for _k, _v in (('gongtong', ('bldg.campus_gongtong', 'campus_gongtong_glb', None)), ('freshman', ('bldg.campus_freshman', 'campus_freshman_glb', None))):
    if ("'%s'" % _v[0]) in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets3d.js'), encoding='utf8').read(): TAGS[_k] = _v
# 正式模型和套件「設計上就不同」的地方（LAWWW 2026-10-13 整合時已經照模型改了鏡頭碰撞、導航；2026-10-14 LAWWW2 補進測試清單）——只有這些地方可以不同，其他照舊要完全相同：
#   （共同教學館、大一女舍沒有正式模型的版本（v9.6）：TAGS 裡沒有它們，導航格、鏡頭碰撞照舊要完全相同）
#   共同教學館（LAWWW2 55fbedb；zones3d.js 的 gtGLB）：模型照真的共同教學館——四樓（屋頂 17.69 m；套件是三樓、15.61 m）、西側 5 m 木造走廊（x 到 −15；套件到 −10.8）；
#     前庭 6 棵蒲葵（z 17–21：外框不算，另外檢查樹幹位置＝導航的 GT_PALMS；v9.7 合併材質後蒲葵和別的零件在同一個網格，用位置判斷、不用節點名稱）；大道南側大樹牆在共同前面拿掉 3 棵（skip [-2,6] → [-12,16]）；
#     鏡頭碰撞照模型（userData.ck.cols 6 個方塊，取代套件預設的 2 個）。
#   大一女舍（LAWWW2 55fbedb）：A、B 兩棟＋天橋三個套件物件都標 freshman，外框取三個的聯集（原本只取第一個＝A 棟，差 29.85 m）。
BBOX_REGION = {'gongtong': {'zmin': 21.5}}   # 外框只算這個範圍的頂點（共同教學館：前庭的蒲葵在 z 17–21，本體從 z 22.7 開始）
PALM_ZONE = (17.5, 21.0)   # 蒲葵樹幹底部（y ≤ 0.5）的 z 範圍
BBOX_TOL = {'gongtong': {0: 4.5, 4: 2.4}}   # 外框 [x0,y0,z0,x1,y1,z1] 的第幾個 → 容許差：x0 西側木造走廊（實際 4.2 m）、y1 四樓屋頂（實際 2.08 m）；其他照 1.5 m
GT_PALMS = [(-10.5, 19.2), (-6.5, 18.8), (-2.5, 19.1), (6.5, 19.0), (10.5, 18.9), (14.5, 19.2)]   # 和 zones3d.js 的 GT_PALMS 相同（模型載入後 nav.blockCircle）
GT_PALM_NAV = 0.6   # 蒲葵的導航阻擋只能在樹幹中心 0.6 m 以內（blockCircle 的半徑可以調，不綁死）；每棵樹幹中心所在的那一格一定要擋住（不然走得進樹幹）
GT_FRONT = (-12.0, 16.0, 16.5, 19.5)   # 大樹牆拿掉樹的那一段（x0, x1, z0, z1）：樹幹 z 17.5–18.5、導航半徑 0.8
HALLS = ['campus_library_glb', 'campus_admin_glb', 'campus_arts_glb', 'campus_hist_glb']   # campus_hall.py 做的（有窗、拱廊、門廊、天花板）
GLASS_ONLY = ['campus_pavilion_glb', 'campus_modern_glb']   # 玻璃和總圖同一套（ck_glass），沒有拱廊天花板
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='%s')) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
# 等所有延遲載入的模型（建築、道具、人物）都載完或失敗：「改之前」原本只等 3 秒，路燈、腳踏車等正式模型還沒載完、畫面還是合併過的套件版，
# 校門鏡頭的 draw call 偏少（2026-10-11 AI-1 整合時：同一版本「改之前」一次 297、等全部載完是 341，每次開遊戲都一樣；LAWWW2 自己的紀錄也有 297／331／341）
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
NAV_FULL = "(()=>{ const n=GAME.E.nav; return {cols:n.cols, rows:n.rows, ox:n.ox, oz:n.oz, cell:n.cell, b:Array.from(n.b,v=>v>9?'#':String(v)).join('')}; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    const gt=E.zone.group.children.find(o=>o.userData&&o.userData.ckTag==='gongtong'); let gtKit=null, gtDecl=null;
    if(gt){ const ck=gt.userData.ck, x=gt.position.x, z=gt.position.z, c=Math.cos(gt.rotation.y), sn=Math.sin(gt.rotation.y), q=Math.abs(sn)>0.5; const W=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c];
      const box=(lx,lz,bw,bd,y0,y1)=>{ const p=W(lx,lz); return [r(p[0]),r((y0+y1)/2),r(p[1]),r(q?bd:bw),r(y1-y0),r(q?bw:bd)]; };
      gtKit=[box(0,-ck.ad/2,ck.w,ck.d-ck.ad,0,ck.H)]; if(ck.ad>0) gtKit.push(box(0,ck.d/2-ck.ad/2,ck.w,ck.ad,ck.gfh-0.35,ck.H));   /* 套件預設（ckPlace 沒有 ck.cols 的時候） */
      if(ck.cols) gtDecl=ck.cols.map(a=>box(...a)); }   /* 有正式模型時 zones3d.js 照模型給的 */
    return {col, it, gtKit, gtDecl}; })()"""
# 沒有標記的群組：數「底下有網格／sprite、但一個都看不到」的群組（＝被藏起來），正式模型和改之前必須一樣多（多了＝藏錯東西）。路燈的光暈（E.lampGlows）照時鐘開關，不算。
# 整區靜態合併把網格搬走、變成空的群組不算「藏起來」：地標有正式模型時不參加合併（dyn），別的建築和地標共用的材質可能只剩一個網格、不合併，
# 空群組的數目兩輪會差 1（2026-10-11 文學院、校史館：(2,33) 的無名系館，改之前 225 個、一般 224 個；看得到的網格兩邊都畫）
OTHERS = """(()=>{ const z=GAME.E.zone; let n=0, empty=0; const skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; };
    for(const o of z.group.children){ if(!o.isGroup||(o.userData&&o.userData.ckTag)||/_glb$/.test(o.name)) continue; n++; let has=false, vis=false; o.traverse(m=>{ if((m.isMesh||m.isSprite)&&!skip.has(m)){ has=true; if(!vis&&shown(m)) vis=true; } }); if(has&&!vis) empty++; }
    return {n, empty}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));   /* 路人、騎腳踏車的路人每次的位置不同（量測雜訊）：量的時候暫時移出場景，只比場景 */
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
# 傅鐘的夜間：地燈燈罩、柱面暖光（加法混合）、正式模型的光暈（campus_bell_glb_glows：合成一個網格）、套件的光暈（藏起來的那兩個）
BELL_NIGHT = """(h=>{ const E=GAME.E, z=E.zone, root=z.group.children.find(o=>o.name==='campus_bell_glb'); if(h!=null) E.applyTime(h); const mats={};
    root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; }); const kit=z.group.children.find(o=>o.userData&&o.userData.ckTag==='bell');
    const b=z.group.children.find(o=>o.name==='campus_bell_glb_glows'), k=b?b.material.emissiveIntensity:0, g=b?b.userData.glowBatch.items:[];   /* 正式模型的光暈合成一個網格（LAWWW2-C 2026-10-21）：每個光暈的亮度＝白天、晚上的值照夜間程度內插 */
    return {lens:+(mats.ck_bell_lens?mats.ck_bell_lens.emissiveIntensity:-1).toFixed(2), wash:+(mats.ck_bell_wash?mats.ck_bell_wash.emissiveIntensity:-1).toFixed(2),
      washAdditive:!!(mats.ck_bell_wash&&mats.ck_bell_wash.blending===THREE.AdditiveBlending&&!mats.ck_bell_wash.depthWrite),
      glows:g.length, glowsOn:b&&b.visible?g.filter(i=>i.day*(1-k)+i.night*k>0.3).length:0, kitSpritesOn:kit.children.filter(o=>o.isSprite&&o.visible).length, lampsOn:!!E.lampsOn}; })"""
# 校園座標：x 往東、−z 往北；椰林大道 z=0（校門 x=−124、總圖 x=100，正面朝西：門廊前緣 x≈82.8、一樓拱廊 x 87–90）；傅鐘在 (−38,16.5)，石碑朝北
VIEWS = [('gate_avenue', (-110, 1.7, 0.5), (100, 8, 0)),     # 進校門往東看椰林大道盡頭的總圖（玩家最常看到的角度；傅鐘在右邊）
         ('avenue', (38, 1.7, 0.5), (100, 10, 0)),            # 大道後段
         ('plaza', (68, 1.7, 13), (96, 8, -3)),               # 總圖前廣場，斜看正面
         ('porch', (78, 1.7, 5.5), (88, 5.5, -1)),            # 門廊近看
         ('arcade', (88.6, 1.6, -22), (88.6, 2.4, 10)),       # 一樓拱廊裡
         ('bell_avenue', (-38, 1.7, 4), (-38, 3.0, 16.5)),    # 從大道看傅鐘（石碑那一面）
         ('bell_close', (-35.6, 1.6, 12.4), (-38, 2.8, 16.5)),  # 傅鐘近看（斜前方）
         ('admin_front', (-30, 1.7, 14), (-38, 6, 28)),       # 行政大樓：傅鐘廣場東側斜看正面（門廊、拱廊、陽台欄杆）
         ('admin_arcade', (-58.6, 1.6, 26.4), (-20, 2.4, 26.4)),   # 行政大樓一樓拱廊裡往東
         ('arts_front', (-30, 1.7, -12), (-38, 6, -28)),      # 文學院：從椰林大道北側斜看正面（門廊、山牆、拱廊）
         ('arts_arcade', (-56.6, 1.6, -26.3), (-20, 2.4, -26.3)),   # 文學院一樓拱廊裡往東
         ('hist_front', (-69, 1.7, -8), (-77, 6, -24)),       # 校史館：從椰林大道北側斜看正面
         ('hist_porch', (-74.5, 1.7, -14.2), (-77, 4.6, -19.4)),   # 校史館門廊近看（圓石柱）
         ('pav_front', (-94, 1.7, -12), (-104, 6, -30)),      # 洞洞館：從椰林大道北側斜看（鏤空牆、一樓柱廊）
         ('pav_close', (-100.5, 1.7, -18.5), (-104, 6.5, -23)),   # 洞洞館近看（往上看鏤空牆）
         ('soc_front', (78, 1.7, -60), (110, 8, -70)),        # 社科院：法學院那邊斜看正面（帶狀長窗）
         ('soc_lobby', (92.5, 1.7, -65), (99.5, 3, -70))]     # 社科院玻璃大廳、入口雨遮近看


async def check(pg, run, formal):
    run.setup('讀檔到椰影大道 (74,2) 17:30，關掉條件事件' + ('' if formal else '；進校園前先把 manifest 裡地標的 key 拿掉（＝改之前）'))
    if not formal: await pg.evaluate("(()=>{ for(const k of %s) delete ASSETS.manifest[k]; })()" % json.dumps([v[0] for v in TAGS.values()]))
    # 建校園之前也要等：開機預載的街道道具（路燈、腳踏車）在「建校園的那一刻」有沒有載好，決定那一輪用正式模型還是合併過的套件（W3.lampPost()／W3.bike() 是同步建立的），
    # 之後再等也換不回來。2026-10-11 行政大樓那一輪：「改之前」建的時候還沒載好（套件版、draw call 297）、「一般」已經載好（358），比的不是同一種路燈
    await pg.evaluate(SETTLED)
    await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
    # 凍結遊戲時鐘在 17:30（玩家 busy 時時鐘不走）：17:30 剛好是路燈開關的門檻（時段表的值＝0.5，> 0.5 才開），引擎每 5 格才套用一次時段，
    # 時鐘在跑的話量的那一刻路燈可能開也可能關——22 盞路燈的光暈＋地面光圈＝44 次 draw call（2026-10-11：「改之前」連量兩次都是 341，
    # 整合測試裡同一個鏡頭卻是 297；之前 297／331／341 的另一半原因）。凍結後兩輪都是「路燈剛好還沒開」的同一個狀態
    await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")
    # AI-1 的霖澤館、萬才館外觀（兩輪都有）也是非同步載入：先等它們接好再數「沒有標記的群組」，不然兩輪接好的時間不同，數字會差
    await pg.evaluate("(async()=>{ const ks=['bldg.linze_exterior','bldg.wancai_exterior'].filter(k=>ASSETS.manifest[k]); await Promise.all(ks.map(k=>ASSETS.loadOne(k).catch(()=>null))); await new Promise(r=>setTimeout(r,1500)); })()")
    if formal:
        for tag, (key, glb, _) in TAGS.items(): run.check('%s 的正式模型接上（%s）' % (tag, glb), await pg.evaluate(WAIT_FORMAL % glb))
    else:
        await pg.wait_for_timeout(3000)
        # 只看這個測試換掉的地標（TAGS）：別的正式模型兩輪都有（開發分支的醉月湖 campus_lake_glb 不是套件換模型，2026-10-14）
        run.check('改之前：沒有載入正式模型', not await pg.evaluate("(names=>GAME.E.zone.group.children.some(o=>names.includes(o.name)))(%s)" % json.dumps([v[1] for v in TAGS.values()])))
    run.check(('一般' if formal else '改之前') + '：所有延遲載入的模型都載完（量 draw call 之前）', (await pg.evaluate(SETTLED)) >= 0)
    await pg.wait_for_timeout(1500)
    street = await pg.evaluate("(()=>{ let n=0; GAME.E.zone.group.traverse(o=>{ if(o.userData&&o.userData.formal==='prop.street') n++; }); return n; })()")
    run.check(('一般' if formal else '改之前') + '：校園的路燈、腳踏車、長椅是街道道具的正式模型（建校園之前就載好；兩輪才是同一種）', street > 0, json.dumps(street))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const bs=z.group.children.filter(o=>o.userData&&o.userData.ckTag); const per={};
        for(const b of bs) per[b.userData.ckTag]={formal:!!b.userData.formal, dyn:!!b.userData.dyn, kitVisible:b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length, kitMeshes:b.children.filter(o=>o.isMesh||o.isSprite).length};
        return per; })()""")
    deferred = sorted(set(info) - set(TAGS))   # 有標記、但這一版沒有正式模型的（v9.6：共同教學館、大一女舍——src/assets3d.js 的說明）
    run.check('有 ckTag 的套件建築＝%s%s' % (', '.join(sorted(TAGS)), ('（先不放正式模型：' + ', '.join(deferred) + '）') if deferred else ''),
              sorted(set(info) & set(TAGS)) == sorted(TAGS) and set(deferred) <= {'gongtong', 'freshman'}, json.dumps(info))
    if deferred: run.check('先不放正式模型的：套件外觀照舊（沒有接正式模型、照舊參加整區靜態合併）', all(not info[t]['formal'] and not info[t]['dyn'] for t in deferred), json.dumps({t: info[t] for t in deferred}))
    if formal:
        run.check('都接上正式模型（userData.formal）、不參加整區靜態合併（dyn）', all(info[t]['formal'] and info[t]['dyn'] for t in TAGS if t in info), json.dumps(info))
        run.check('套件外觀全部藏起來', all(info[t]['kitVisible'] == 0 and info[t]['kitMeshes'] > 0 for t in TAGS if t in info), json.dumps(info))
    else:
        run.check('改之前：套件照舊參加整區靜態合併（不是 dyn、沒有接正式模型）', all(not v['dyn'] and not v['formal'] for v in info.values()), json.dumps(info))
    others = await pg.evaluate(OTHERS)
    lamps = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(20.5); const on=E.lampGlows.filter(l=>l.visible).length, n=E.lampGlows.length; E.applyTime(17.5); return {on, n}; })()""")
    run.check(('一般' if formal else '改之前') + '：20:30 路燈都開著', lamps['n'] > 0 and lamps['on'] == lamps['n'], json.dumps(lamps))
    if formal:
        for tag, (key, glb, plate) in TAGS.items():
            g = await pg.evaluate("""(([tag,glbName,reg])=>{ const z=GAME.E.zone; const kits=z.group.children.filter(o=>o.userData&&o.userData.ckTag===tag), kit=kits[0], glb=z.group.children.find(o=>o.name===glbName);   /* 同一個標記可能有好幾個部分（大一女舍 A、B、天橋）：外框要全部算（2026-10-14：原本只拿第一個）*/
                z.group.updateMatrixWorld(true); const r=b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>Math.round(v*100)/100);
                const bk=new THREE.Box3(), bg=new THREE.Box3(); for(const k of kits) k.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); bk.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
                let skipped=0; const v=new THREE.Vector3();
                glb.traverse(o=>{ if(!o.isMesh) return; if(!reg){ o.geometry.computeBoundingBox(); bg.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); return; }
                  const p=o.geometry.attributes.position; for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld); if(v.z<reg.zmin){ skipped++; continue; } bg.expandByPoint(v); } });   /* 只算 reg 範圍的頂點（v9.7 合併材質後不能用節點名稱） */
                return {kit:r(bk), glb:r(bg), kits:kits.length, skipped}; })""" + "(%s)" % json.dumps([tag, glb, BBOX_REGION.get(tag)]))
            tol = [BBOX_TOL.get(tag, {}).get(i, 1.5) for i in range(6)]
            dd = [abs(a - b) for a, b in zip(g['kit'], g['glb'])]
            run.check('%s：位置、尺寸、朝向照套件（外框 x、y、z 的最小最大值差 ≤ 1.5 m%s）' % (tag, '；宣告過的設計差異另計，見 BBOX_TOL／BBOX_REGION' if tag in BBOX_TOL or tag in BBOX_REGION else ''),
                      all(x <= t for x, t in zip(dd, tol)) and (g['skipped'] > 0) == (tag in BBOX_REGION), json.dumps(g) + ' 差 %s 容許 %s' % ([round(x, 2) for x in dd], tol))
            if plate is None: continue   # 沒有匾額的（共同教學館、大一女舍）
            pl = await pg.evaluate("""(glbName=>{ const root=GAME.E.zone.group.children.find(o=>o.name===glbName); const at=root.getObjectByName('wz_plates_atlas'); if(!at) return null;
                const m=at.material.map, img=m&&m.image, it=at.userData.atlas.items; return {visible:at.visible, canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), n:it.length, names:it.map(i=>i.name), ratio:it.map(i=>+((i.w/i.h)/i.board).toFixed(3))}; })""" + "(%s)" % json.dumps(glb))
            run.check('%s：匾額 %s 是 canvas 字（石材匾額）、貼圖比例＝板面比例（±8%%）' % (tag, plate), bool(pl) and pl['visible'] and pl['canvas'] and pl['names'] == [plate] and all(0.92 < r < 1.08 for r in pl['ratio']), json.dumps(pl))
        if 'gongtong' in TAGS:   # 前庭蒲葵：樹幹底部（y ≤ 0.5 m 的頂點）一群一群的中心＝GT_PALMS（導航擋住的地方），沒有別的樹幹
            palms = await pg.evaluate("""(([pts,zr])=>{ const root=GAME.E.zone.group.children.find(o=>o.name==='campus_gongtong_glb'); if(!root) return null; root.updateMatrixWorld(true);
                const v=new THREE.Vector3(); const acc=pts.map(()=>[0,0,0]); let stray=0, low=0;
                root.traverse(o=>{ if(!o.isMesh) return; const p=o.geometry.attributes.position;   /* 前庭地面附近（y ≤ 0.5、z 在 zr 範圍）的頂點＝樹幹底部（v9.7 合併材質後樹幹和別的零件在同一個網格） */
                  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld); if(v.y>0.5||v.z<zr[0]||v.z>zr[1]) continue; low++; let best=-1, bd=1e9; pts.forEach((q,k)=>{ const d=Math.hypot(v.x-q[0],v.z-q[1]); if(d<bd){ bd=d; best=k; } });
                    if(bd>0.6){ stray++; continue; } acc[best][0]+=v.x; acc[best][1]+=v.z; acc[best][2]++; } });
                return {low, stray, palms:acc.map((a,k)=>a[2]?{n:a[2], off:+Math.hypot(a[0]/a[2]-pts[k][0],a[1]/a[2]-pts[k][1]).toFixed(3)}:{n:0, off:null})}; })""" + "(%s)" % json.dumps([GT_PALMS, PALM_ZONE]))
            run.check('共同教學館：模型裡 6 棵蒲葵的樹幹就在導航擋住的地方（GT_PALMS；樹幹底部的中心差 ≤ 0.15 m、沒有別的樹幹）',
                      bool(palms) and palms['stray'] == 0 and all(q['n'] >= 3 and q['off'] is not None and q['off'] <= 0.15 for q in palms['palms']), json.dumps(palms))
        shadow = await pg.evaluate("""(()=>{ const out={}; for(const o of GAME.E.zone.group.children) if(/^campus_.*_glb$/.test(o.name)) o.traverse(m=>{ if(m.isMesh) out[m.material.name]=m.castShadow; }); return out; })()""")
        tri = await pg.evaluate("""(()=>{ const out={}; for(const o of GAME.E.zone.group.children) if(/^campus_.*_glb$/.test(o.name)){ let t=0,c=0; o.traverse(m=>{ if(!m.isMesh) return; const g=m.geometry; const n=(g.index?g.index.count:g.attributes.position.count)/3; t+=n; if(m.castShadow) c+=n; }); out[o.name]={tris:t, castTris:c}; } return out; })()""")
        run.note('正式模型的三角形（全部／會投影的）：' + json.dumps(tri))
        run.check('陰影：大面（牆、屋頂、石材）投影；窗框、窗洞、玻璃、深色木作（窗框、門）、拱廊天花板、勒腳、地燈燈罩、柱面暖光片不投影',
                  all(shadow.get(k) for k in ('ck_wall', 'ck_roof', 'ck_trim', 'ck_bell_stone', 'ck_bell_roof', 'ck_pav_conc', 'ck_pav_screen', 'ck_soc_wall')) and not any(shadow.get(k) for k in ('ck_trim_win', 'ck_glass', 'ck_frame', 'ck_ceiling', 'ck_stone_base', 'ck_bell_lens', 'ck_bell_wash', 'ck_pav_dark', 'ck_soc_metal')), json.dumps(shadow))
        for hall in HALLS:   # 亮燈的窗、沒亮燈的窗是同一個材質 ck_glass（2026-10-11）：自發光貼圖左半黑、右半燈光，每扇窗的 UV 決定亮不亮
            night = await pg.evaluate("""(name=>{ const E=GAME.E, root=E.zone.group.children.find(o=>o.name===name); const mats={}; let glass=null;
                root.traverse(o=>{ if(o.isMesh){ mats[o.material.name]=o.material; if(o.material.name==='ck_glass') glass=o; } });
                const read=()=>({glass:+(mats.ck_glass?mats.ck_glass.emissiveIntensity:-1).toFixed(2), ceil:+(mats.ck_ceiling?mats.ck_ceiling.emissiveIntensity:-1).toFixed(2)});
                E.applyTime(11); const day=read(); E.applyTime(20.5); const n2030=read(); E.applyTime(17.5);
                const m=mats.ck_glass, t=m&&m.emissiveMap, img=t&&t.image; let left=-1, right=-1, grad=0;
                if(img){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const x=c.getContext('2d'); x.drawImage(img,0,0); const d=x.getImageData(0,0,c.width,c.height).data;
                  left=0; right=0; for(let j=0;j<c.height;j++) for(let i=0;i<c.width;i++){ const k=(j*c.width+i)*4, v=Math.max(d[k],d[k+1],d[k+2]); if(i<c.width/4) left=Math.max(left,v); else if(i>=3*c.width/4) right=Math.max(right,v); }   /* 取樣點附近（u=0.125、0.875）：交界兩側有 WebP 壓縮的漣漪，不看 */
                  const top=(r)=>{ const k=(r*c.width+c.width-1)*4; return d[k]+d[k+1]+d[k+2]; }; grad=top(0)-top(c.height-1); }
                let lit=0, dark=0, bad=0; if(glass){ const uv=glass.geometry.attributes.uv; if(uv) for(let i=0;i<uv.count;i++){ const u=uv.getX(i); if(Math.abs(u-0.875)<0.01) lit++; else if(Math.abs(u-0.125)<0.01) dark++; else bad++; } else bad=-1; }
                return {day, n2030, map:!!t, mip:t?t.generateMipmaps:null, minLinear:t?t.minFilter===THREE.LinearFilter:null, tex:img?[img.width,img.height]:null, leftMax:left, rightMax:right, grad, uv:{lit, dark, bad},
                  oldLitMat:!!mats.ck_glass_lit}; })""" + "(%s)" % json.dumps(hall))
            nm = hall[len('campus_'):-len('_glb')]
            run.check('%s 的窗：同一個玻璃材質；20:30 發光、11:00 不發光；自發光貼圖左邊全黑（沒亮燈的窗取樣的地方）、右邊是由上往下漸暗的燈光；每扇窗的 UV 不是亮就是暗（約七成亮燈）；貼圖不用 mipmap（遠處不會混色）' % nm,
                      night['map'] and not night['oldLitMat'] and night['n2030']['glass'] > 0.5 and night['day']['glass'] < 0.05 and night['leftMax'] <= 3 and night['rightMax'] > 150 and night['grad'] != 0
                      and night['uv']['bad'] == 0 and 0.55 < night['uv']['lit'] / max(1, night['uv']['lit'] + night['uv']['dark']) < 0.85 and night['mip'] is False and night['minLinear'], json.dumps(night))
            run.check('%s 的拱廊、門廊、屋簷底下的天花板：晚上比白天暗（白天的補光是陽光的反射；總圖第一版晚上反而更亮，沒有燈的拱廊整片發亮）' % nm, 0 <= night['n2030']['ceil'] < night['day']['ceil'], json.dumps(night))
        for hall in GLASS_ONLY:   # 亮燈的窗、沒亮燈的窗是同一個材質 ck_glass（2026-10-11）：自發光貼圖左半黑、右半燈光，每扇窗的 UV 決定亮不亮
            night = await pg.evaluate("""(name=>{ const E=GAME.E, root=E.zone.group.children.find(o=>o.name===name); const mats={}; let glass=null;
                root.traverse(o=>{ if(o.isMesh){ mats[o.material.name]=o.material; if(o.material.name==='ck_glass') glass=o; } });
                const read=()=>({glass:+(mats.ck_glass?mats.ck_glass.emissiveIntensity:-1).toFixed(2), ceil:+(mats.ck_ceiling?mats.ck_ceiling.emissiveIntensity:-1).toFixed(2)});
                E.applyTime(11); const day=read(); E.applyTime(20.5); const n2030=read(); E.applyTime(17.5);
                const m=mats.ck_glass, t=m&&m.emissiveMap, img=t&&t.image; let left=-1, right=-1, grad=0;
                if(img){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const x=c.getContext('2d'); x.drawImage(img,0,0); const d=x.getImageData(0,0,c.width,c.height).data;
                  left=0; right=0; for(let j=0;j<c.height;j++) for(let i=0;i<c.width;i++){ const k=(j*c.width+i)*4, v=Math.max(d[k],d[k+1],d[k+2]); if(i<c.width/4) left=Math.max(left,v); else if(i>=3*c.width/4) right=Math.max(right,v); }   /* 取樣點附近（u=0.125、0.875）：交界兩側有 WebP 壓縮的漣漪，不看 */
                  const top=(r)=>{ const k=(r*c.width+c.width-1)*4; return d[k]+d[k+1]+d[k+2]; }; grad=top(0)-top(c.height-1); }
                let lit=0, dark=0, bad=0; if(glass){ const uv=glass.geometry.attributes.uv; if(uv) for(let i=0;i<uv.count;i++){ const u=uv.getX(i); if(Math.abs(u-0.875)<0.01) lit++; else if(Math.abs(u-0.125)<0.01) dark++; else bad++; } else bad=-1; }
                return {day, n2030, map:!!t, mip:t?t.generateMipmaps:null, minLinear:t?t.minFilter===THREE.LinearFilter:null, tex:img?[img.width,img.height]:null, leftMax:left, rightMax:right, grad, uv:{lit, dark, bad},
                  oldLitMat:!!mats.ck_glass_lit}; })""" + "(%s)" % json.dumps(hall))
            nm = hall[len('campus_'):-len('_glb')]
            run.check('%s 的窗：同一個玻璃材質；20:30 發光、11:00 不發光；自發光貼圖左邊全黑（沒亮燈的窗取樣的地方）、右邊是由上往下漸暗的燈光；每扇窗的 UV 不是亮就是暗（約七成亮燈）；貼圖不用 mipmap（遠處不會混色）' % nm,
                      night['map'] and not night['oldLitMat'] and night['n2030']['glass'] > 0.5 and night['day']['glass'] < 0.05 and night['leftMax'] <= 3 and night['rightMax'] > 150 and night['grad'] != 0
                      and night['uv']['bad'] == 0 and 0.55 < night['uv']['lit'] / max(1, night['uv']['lit'] + night['uv']['dark']) < 0.85 and night['mip'] is False and night['minLinear'], json.dumps(night))
        pv = await pg.evaluate("""(()=>{ const E=GAME.E, root=E.zone.group.children.find(o=>o.name==='campus_pavilion_glb'); const m={}, cast={}; root.traverse(o=>{ if(o.isMesh){ m[o.material.name]=o.material; cast[o.material.name]=o.castShadow; } });
            const sc=m.ck_pav_screen, dk=m.ck_pav_dark; const read=()=>+(dk?dk.emissiveIntensity:-1).toFixed(2);
            E.applyTime(11); const day=read(); E.applyTime(20.5); const night=read(); E.applyTime(17.5);
            return {screen:sc?{alphaTest:sc.alphaTest, transparent:sc.transparent, map:!!sc.map, cast:cast.ck_pav_screen, doubleSide:sc.side===THREE.DoubleSide}:null,
              dark:dk?{day, night, map:!!dk.emissiveMap, mip:dk.emissiveMap?dk.emissiveMap.generateMipmaps:null, cast:cast.ck_pav_dark}:null}; })()""")
        run.check('圓窗館的鏤空牆：貼圖透明度挖洞（alphaTest、不是半透明）、兩面都畫、會投影（陽光從洞裡穿過，影子一點一點）', bool(pv['screen']) and pv['screen']['alphaTest'] > 0.3 and not pv['screen']['transparent'] and pv['screen']['map'] and pv['screen']['cast'] and pv['screen']['doubleSide'], json.dumps(pv))
        run.check('圓窗館鏤空牆後面的房間：20:30 從洞裡透出暖光、11:00 不發光（自發光貼圖、不用 mipmap、不投影）', bool(pv['dark']) and pv['dark']['night'] > 0.5 and pv['dark']['day'] < 0.05 and pv['dark']['map'] and pv['dark']['mip'] is False and not pv['dark']['cast'], json.dumps(pv))
        bd = await pg.evaluate(BELL_NIGHT + '(11)'); bn = await pg.evaluate(BELL_NIGHT + '(20.5)'); await pg.evaluate('GAME.E.applyTime(17.5)')
        run.check('晨思鐘的地燈燈罩、柱面暖光：20:30 發光、11:00 不發光；暖光片是加法混合（白天看不到）',
                  bn['lens'] > 1.0 and bd['lens'] < 0.05 and bn['wash'] > 0.5 and bd['wash'] < 0.05 and bn['washAdditive'], json.dumps({'11:00': bd, '20:30': bn}))
        run.check('晨思鐘的光暈：兩個（GLOW_* 空節點），20:30 亮、11:00 不亮', bn['glows'] == 2 and bn['glowsOn'] == 2 and bd['glowsOn'] == 0, json.dumps({'11:00': bd, '20:30': bn}))
        run.check('晨思鐘：藏起來的套件光暈晚上不會跑回來（TK.setNight 會重設 visible）', bn['kitSpritesOn'] == 0 and bd['kitSpritesOn'] == 0, json.dumps({'11:00': bd, '20:30': bn}))
        neg2 = await pg.evaluate("""(()=>{ const E=GAME.E, kit=E.zone.group.children.find(o=>o.userData&&o.userData.ckTag==='bell'); const sp=kit.children.filter(o=>o.isSprite);
            const saved=sp.map(s=>[s.userData.nightO,s.userData.dayO]); sp.forEach(s=>{ s.userData.nightO=0.55; s.userData.dayO=0; });   /* 模擬沒修的版本：藏起來的套件光暈還是照時段開關 */
            E.applyTime(11); E.applyTime(20.5); const n=sp.filter(s=>s.visible).length; sp.forEach((s,i)=>{ s.userData.nightO=saved[i][0]; s.userData.dayO=saved[i][1]; }); E.applyTime(11); E.applyTime(17.5); return n; })()""")
        run.check('（自我檢查）套件光暈照舊開關的話（沒修的版本），晚上會被數到', neg2 > 0, json.dumps(neg2))
        neg3 = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const skip=new Set(GAME.E.lampGlows||[]); const vis=o=>{ const out=[]; o.traverse(m=>{ if((m.isMesh||m.isSprite)&&m.visible&&!skip.has(m)) out.push(m); }); return out; };
            const g=z.group.children.find(o=>o.isGroup&&o.visible&&!(o.userData&&o.userData.ckTag)&&!/_glb$/.test(o.name)&&vis(o).length); if(!g) return null;
            const ms=vis(g); ms.forEach(m=>m.visible=false); const r=%s; ms.forEach(m=>m.visible=true); return r; })()""" % OTHERS.strip())
        run.check('（自我檢查）故意把一個沒有標記的群組藏起來時，「被藏起來的群組」會多一個', bool(neg3) and neg3['empty'] == others['empty'] + 1, json.dumps([others, neg3]))
        neg = await pg.evaluate("""(()=>{ const b=GAME.E.zone.group.children.find(o=>o.userData&&o.userData.ckTag==='library'); const m=b.children.find(o=>o.isMesh); m.visible=true;
            const n=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; m.visible=false; return n; })()""")
        run.check('（自我檢查）故意打開一個套件網格時，會被數到', neg > 0, json.dumps(neg))
    # 太陽方位角（羅盤：0 北、90 東、180 南）：校園 x＝東、−z＝北 → 方位角＝atan2(x, −z)。12:00 的時段表是 150°（南偏東），判定正南 ±45°
    sun = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(12); const d=E.sun.position.clone().sub(E.player.obj.position); let az=Math.atan2(d.x,-d.z)*180/Math.PI; if(az<0) az+=360;
        const out={azimuth:+az.toFixed(1), sunYaw:E.zone.def&&E.zone.def.sunYaw||0}; E.applyTime(17.5); return out; })()""")
    run.check('中午太陽在南邊（方位角在正南 ±45° 內）', 135 <= sun['azimuth'] <= 225, json.dumps(sun))
    draws = {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        await run.shot(pg, name + '_' + ('formal' if formal else 'before'))
    await pg.evaluate("GAME.E.endCinematic()")
    run.note(('一般網址' if formal else '改之前') + '：同一個鏡頭（藏起路人）的 draw call／三角形 ' + json.dumps(draws))
    res = (await pg.evaluate(NAV_HASH), await pg.evaluate(STATE), others, draws, lamps, street, await pg.evaluate(NAV_FULL))
    if formal:   # 夜裡才進校園：模型在路燈已經開著的時候才載入，光暈要直接是亮的（校園的夜間只在路燈開關時切換）
        await PL.load_state(pg, {'zone': 'campus', 'hour': 20.5, 'pos': {'x': -38, 'z': 6, 'yaw': 3.1416}}, quiet_events=True)
        ok = await pg.evaluate(WAIT_FORMAL % 'campus_bell_glb'); bl = await pg.evaluate(BELL_NIGHT + '(null)')
        run.check('夜裡（20:30）才進校園：晨思鐘模型載入後光暈、地燈直接是亮的', ok and bl['lampsOn'] and bl['glowsOn'] == 2 and bl['lens'] > 1.0 and bl['kitSpritesOn'] == 0, json.dumps(bl))
        await run.shot(pg, 'bell_night_2030')
    return res


def nav_diff(nb, nf, gt=True):
    """導航格：改之前（nb）和一般網址（nf）只准差在共同教學館前面——一般網址才擋住的格子都在蒲葵樹幹旁（GT_PALMS 0.6 m 以內）、
    一般網址才走得到的格子都在大樹牆拿掉樹的那一段（GT_FRONT）、每棵蒲葵樹幹中心所在的那一格擋住；其他地方完全相同"""
    if any(nb[k] != nf[k] for k in ('cols', 'rows', 'ox', 'oz', 'cell')): return False, {'grid': [[nb[k], nf[k]] for k in ('cols', 'rows', 'ox', 'oz', 'cell')]}
    if not gt:   # 這一版沒有共同教學館的正式模型（v9.6）：完全相同
        d = [i for i, (a, b) in enumerate(zip(nb['b'], nf['b'])) if a != b]; C, cell, ox, oz = nf['cols'], nf['cell'], nf['ox'], nf['oz']
        return not d, {'blocked': [nb['b'].count('1'), nf['b'].count('1')], 'diff': len(d), 'first': [(round(ox + (i % C + 0.5) * cell, 2), round(oz + (i // C + 0.5) * cell, 2)) for i in d[:5]]}
    C, cell, ox, oz = nf['cols'], nf['cell'], nf['ox'], nf['oz']
    W = lambda i: (ox + (i % C + 0.5) * cell, oz + (i // C + 0.5) * cell)
    in_palm = lambda p: any((p[0] - px) ** 2 + (p[1] - pz) ** 2 <= GT_PALM_NAV ** 2 for px, pz in GT_PALMS)
    in_front = lambda p: GT_FRONT[0] <= p[0] <= GT_FRONT[1] and GT_FRONT[2] <= p[1] <= GT_FRONT[3]
    diff = [i for i, (a, b) in enumerate(zip(nb['b'], nf['b'])) if a != b]
    added = [i for i in diff if (nb['b'][i], nf['b'][i]) == ('0', '1')]; freed = [i for i in diff if (nb['b'][i], nf['b'][i]) == ('1', '0')]
    odd = [i for i in diff if i not in set(added) | set(freed)]
    bad_add = [W(i) for i in added if not in_palm(W(i))]; bad_free = [W(i) for i in freed if not in_front(W(i))]
    own = [nf['b'][int((pz - oz) // cell) * C + int((px - ox) // cell)] == '1' for px, pz in GT_PALMS]   # 樹幹中心所在的那一格（2026-10-14 RC7：(6.5,19.0) 剛好在四格的交角，半徑 0.35 一格都沒擋到）
    near = [sum(1 for i in added if (W(i)[0] - px) ** 2 + (W(i)[1] - pz) ** 2 <= GT_PALM_NAV ** 2) for px, pz in GT_PALMS]
    ok = not odd and not bad_add and not bad_free and len(freed) > 0 and all(own)
    return ok, {'blocked': [nb['b'].count('1'), nf['b'].count('1')], 'added_palm_cells': len(added), 'freed_tree_cells': len(freed), 'palm_own_cell_blocked': own, 'palm_added_cells': near,
                'bad_added': [tuple(round(v, 2) for v in p) for p in bad_add[:5]], 'bad_freed': [tuple(round(v, 2) for v in p) for p in bad_free[:5]], 'odd': odd[:5]}


def col_diff(sb, sf, gt=True):
    """鏡頭碰撞：一般網址＝改之前 − 共同教學館套件預設的方塊 ＋ 照模型宣告的方塊（zones3d.js 的 gongtong.userData.ck.cols）；其他完全相同"""
    from collections import Counter
    cb, cf = Counter(map(tuple, sb['col'])), Counter(map(tuple, sf['col']))
    if not gt: return cb == cf, {'before': sum(cb.values()), 'formal': sum(cf.values()), 'missing': [list(k) for k in (cb - cf)][:5], 'extra': [list(k) for k in (cf - cb)][:5]}   # 沒有共同的正式模型：完全相同
    kit, decl = Counter(map(tuple, sb['gtKit'] or [])), Counter(map(tuple, sf['gtDecl'] or []))
    exp = cb - kit + decl
    ok = bool(kit) and bool(decl) and all(cb[k] >= v for k, v in kit.items()) and sb['gtDecl'] is None and cf == exp
    return ok, {'before': sum(cb.values()), 'formal': sum(cf.values()), 'gongtong_kit_default': sum(kit.values()), 'gongtong_declared': sum(decl.values()),
                'missing': [list(k) for k in (exp - cf)][:5], 'extra': [list(k) for k in (cf - exp)][:5]}


async def main():
    run = PL.Run('campus_glb_integration', OUT)
    res = {}
    async with async_playwright() as p:
        for formal in (True, False):
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(URL); run.check(('一般網址' if formal else '改之前') + '：遊戲載入', await PL.wait_loaded(pg))
            res[formal] = await check(pg, run, formal)
            run.check(('一般網址' if formal else '改之前') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
    gt = 'gongtong' in TAGS   # 有共同教學館的正式模型（開發分支）：只准宣告過的差異；沒有（v9.6）：完全相同
    ok, det = nav_diff(res[False][6], res[True][6], gt)
    run.check('導航格：' + ('正式模型和改之前只差在共同教學館前面（大樹牆拿掉 3 棵的樹幹、6 棵蒲葵的樹幹），其他完全相同' if gt else '正式模型和改之前完全相同'), ok, json.dumps(det) + ' hash ' + json.dumps([res[True][0], res[False][0]]))
    nf2 = dict(res[True][6]); far = next(i for i, v in enumerate(nf2['b']) if v == '0' and not (GT_FRONT[0] - 3 <= nf2['ox'] + (i % nf2['cols'] + 0.5) * nf2['cell'] <= GT_FRONT[1] + 3 and GT_FRONT[2] - 3 <= nf2['oz'] + (i // nf2['cols'] + 0.5) * nf2['cell'] <= GT_FRONT[3] + 3))
    nf2['b'] = nf2['b'][:far] + '1' + nf2['b'][far + 1:]
    run.check('（自我檢查）共同教學館前面以外多擋一格時，導航格的檢查會失敗', not nav_diff(res[False][6], nf2, gt)[0], json.dumps(nav_diff(res[False][6], nf2, gt)[1]))
    ok, det = col_diff(res[False][1], res[True][1], gt)
    run.check('鏡頭碰撞方塊：' + ('正式模型＝改之前 − 共同教學館套件預設的方塊 ＋ 照模型宣告的方塊（ck.cols），其他完全相同' if gt else '完全相同'), ok, json.dumps(det))
    sf2 = dict(res[True][1]); sf2['col'] = [c for c in sf2['col'] if not (-16 <= c[0] <= 17 and 17 <= c[2] <= 41)][1:] + [c for c in sf2['col'] if -16 <= c[0] <= 17 and 17 <= c[2] <= 41]
    run.check('（自我檢查）少一個共同教學館以外的鏡頭碰撞方塊時，檢查會失敗', not col_diff(res[False][1], sf2, gt)[0], json.dumps(col_diff(res[False][1], sf2, gt)[1]))
    run.check('互動點（位置、半徑、名稱）：完全相同', res[True][1]['it'] == res[False][1]['it'], '%d vs %d 個' % (len(res[True][1]['it']), len(res[False][1]['it'])))
    run.check('沒有標記的群組（樹、路燈、其他建築、背景…）沒有多藏任何一個', res[True][2] == res[False][2], json.dumps([res[True][2], res[False][2]]))
    run.check('20:30 開著的路燈數和改之前一樣', res[True][4] == res[False][4], json.dumps([res[True][4], res[False][4]]))
    run.check('兩輪的街道道具正式模型一樣多（效能比的是同一種路燈、腳踏車）', res[True][5] == res[False][5], json.dumps([res[True][5], res[False][5]]))
    f, n = res[True][3], res[False][3]
    run.check('效能：每個鏡頭的三角形 ≤ 改之前、draw call ≤ 改之前的 1.1 倍（含陰影那一輪、含玩家；LAWWW 23:26Z 的條件）',
              all(f[k]['tris'] <= n[k]['tris'] and f[k]['calls'] <= 1.1 * n[k]['calls'] for k in f),
              json.dumps({k: {'calls': [n[k]['calls'], f[k]['calls'], round(f[k]['calls'] / n[k]['calls'], 3)], 'tris': [n[k]['tris'], f[k]['tris'], round(f[k]['tris'] / n[k]['tris'], 3)]} for k in f}))
    sys.exit(run.finish())


asyncio.run(main())
