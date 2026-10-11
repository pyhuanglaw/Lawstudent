"""校園地標的正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  LAWWW 2026-10-10 23:26Z 分派的順序：①總圖書館 bldg.campus_library（campus_library.py）②傅鐘 bldg.campus_bell（campus_bell.py）③行政大樓 bldg.campus_admin（campus_hall.py --set admin）
  ④文學院 bldg.campus_arts、校史館 bldg.campus_hist（campus_hall.py --set arts／hist）。
  新的地標加進 TAGS 就好（標記、外框、匾額、效能的檢查都照 TAGS 跑）。

比較的對象＝「改之前」：同一版遊戲、開機後把 manifest 裡這些地標的 key 拿掉再進校園（套件照舊參加整區靜態合併，和這次修改之前一模一樣；
其他正式模型（霖澤館外觀、路燈腳踏車）兩邊都有，只比地標）。不用 ?nobldg：那會連路燈、腳踏車、霖澤館一起換掉，效能數字分不出是誰的。
檢查（LAWWW 23:26Z 的條件）：
  1. 校園裡有 ckTag 的只有 TAGS 這幾個，都接上正式模型、套件外觀全部藏起來；沒有標記的東西（樹、路燈、其他建築、背景）沒有多藏任何一個。
  2. 位置、尺寸、朝向照套件：正式模型的外框和套件的外框差 ≤ 1.5 m（屋簷、簷口出挑的差別）。
  3. 導航格、鏡頭碰撞方塊、互動點和「改之前」完全相同。
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
        'hist': ('bldg.campus_hist', 'campus_hist_glb', 'PLATE_FACE_HIST')}
HALLS = ['campus_library_glb', 'campus_admin_glb', 'campus_arts_glb', 'campus_hist_glb']   # campus_hall.py 做的（有窗、拱廊、門廊）
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='%s')) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
# 等所有延遲載入的模型（建築、道具、人物）都載完或失敗：「改之前」原本只等 3 秒，路燈、腳踏車等正式模型還沒載完、畫面還是合併過的套件版，
# 校門鏡頭的 draw call 偏少（2026-10-11 AI-1 整合時：同一版本「改之前」一次 297、等全部載完是 341，每次開遊戲都一樣；LAWWW2 自己的紀錄也有 297／331／341）
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
# 沒有標記的群組：數「底下有網格／sprite、但一個都看不到」的群組（＝被藏起來），正式模型和改之前必須一樣多（多了＝藏錯東西）。路燈的光暈（E.lampGlows）照時鐘開關，不算。
# 整區靜態合併把網格搬走、變成空的群組不算「藏起來」：地標有正式模型時不參加合併（dyn），別的建築和地標共用的材質可能只剩一個網格、不合併，
# 空群組的數目兩輪會差 1（2026-10-11 文學院、校史館：(2,33) 的無名系館，改之前 225 個、一般 224 個；看得到的網格兩邊都畫）
OTHERS = """(()=>{ const z=GAME.E.zone; let n=0, empty=0; const skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; };
    for(const o of z.group.children){ if(!o.isGroup||(o.userData&&o.userData.ckTag)||/_glb$/.test(o.name)) continue; n++; let has=false, vis=false; o.traverse(m=>{ if((m.isMesh||m.isSprite)&&!skip.has(m)){ has=true; if(!vis&&shown(m)) vis=true; } }); if(has&&!vis) empty++; }
    return {n, empty}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));   /* 路人、騎腳踏車的路人每次的位置不同（量測雜訊）：量的時候暫時移出場景，只比場景 */
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
# 傅鐘的夜間：地燈燈罩、柱面暖光（加法混合）、正式模型的光暈（formalGlow）、套件的光暈（藏起來的那兩個）
BELL_NIGHT = """(h=>{ const E=GAME.E, z=E.zone, root=z.group.children.find(o=>o.name==='campus_bell_glb'); if(h!=null) E.applyTime(h); const mats={};
    root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; }); const kit=z.group.children.find(o=>o.userData&&o.userData.ckTag==='bell');
    const g=z.group.children.filter(o=>o.isSprite&&o.userData.formalGlow);
    return {lens:+(mats.ck_bell_lens?mats.ck_bell_lens.emissiveIntensity:-1).toFixed(2), wash:+(mats.ck_bell_wash?mats.ck_bell_wash.emissiveIntensity:-1).toFixed(2),
      washAdditive:!!(mats.ck_bell_wash&&mats.ck_bell_wash.blending===THREE.AdditiveBlending&&!mats.ck_bell_wash.depthWrite),
      glows:g.length, glowsOn:g.filter(s=>s.visible&&s.material.opacity>0.3).length, kitSpritesOn:kit.children.filter(o=>o.isSprite&&o.visible).length, lampsOn:!!E.lampsOn}; })"""
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
         ('hist_porch', (-74.5, 1.7, -14.2), (-77, 4.6, -19.4))]   # 校史館門廊近看（圓石柱）


async def check(pg, run, formal):
    run.setup('讀檔到椰林大道 (74,2) 17:30，關掉條件事件' + ('' if formal else '；進校園前先把 manifest 裡地標的 key 拿掉（＝改之前）'))
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
        run.check('改之前：沒有載入正式模型', not await pg.evaluate("GAME.E.zone.group.children.some(o=>/^campus_.*_glb$/.test(o.name))"))
    run.check(('一般' if formal else '改之前') + '：所有延遲載入的模型都載完（量 draw call 之前）', (await pg.evaluate(SETTLED)) >= 0)
    await pg.wait_for_timeout(1500)
    street = await pg.evaluate("(()=>{ let n=0; GAME.E.zone.group.traverse(o=>{ if(o.userData&&o.userData.formal==='prop.street') n++; }); return n; })()")
    run.check(('一般' if formal else '改之前') + '：校園的路燈、腳踏車、長椅是街道道具的正式模型（建校園之前就載好；兩輪才是同一種）', street > 0, json.dumps(street))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const bs=z.group.children.filter(o=>o.userData&&o.userData.ckTag); const per={};
        for(const b of bs) per[b.userData.ckTag]={formal:!!b.userData.formal, dyn:!!b.userData.dyn, kitVisible:b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length, kitMeshes:b.children.filter(o=>o.isMesh||o.isSprite).length};
        return per; })()""")
    run.check('有 ckTag 的套件建築＝%s' % ', '.join(sorted(TAGS)), sorted(info) == sorted(TAGS), json.dumps(info))
    if formal:
        run.check('都接上正式模型（userData.formal）、不參加整區靜態合併（dyn）', all(v['formal'] and v['dyn'] for v in info.values()), json.dumps(info))
        run.check('套件外觀全部藏起來', all(v['kitVisible'] == 0 and v['kitMeshes'] > 0 for v in info.values()), json.dumps(info))
    else:
        run.check('改之前：套件照舊參加整區靜態合併（不是 dyn、沒有接正式模型）', all(not v['dyn'] and not v['formal'] for v in info.values()), json.dumps(info))
    others = await pg.evaluate(OTHERS)
    lamps = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(20.5); const on=E.lampGlows.filter(l=>l.visible).length, n=E.lampGlows.length; E.applyTime(17.5); return {on, n}; })()""")
    run.check(('一般' if formal else '改之前') + '：20:30 路燈都開著', lamps['n'] > 0 and lamps['on'] == lamps['n'], json.dumps(lamps))
    if formal:
        for tag, (key, glb, plate) in TAGS.items():
            g = await pg.evaluate("""(([tag,glbName])=>{ const z=GAME.E.zone; const kit=z.group.children.find(o=>o.userData&&o.userData.ckTag===tag), glb=z.group.children.find(o=>o.name===glbName);
                z.group.updateMatrixWorld(true); const r=b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>Math.round(v*100)/100);
                const bk=new THREE.Box3(), bg=new THREE.Box3(); kit.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); bk.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
                glb.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); bg.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
                return {kit:r(bk), glb:r(bg)}; })""" + "(%s)" % json.dumps([tag, glb]))
            d = max(abs(a - b) for a, b in zip(g['kit'], g['glb']))
            run.check('%s：位置、尺寸、朝向照套件（外框 x、y、z 的最小最大值差 ≤ 1.5 m）' % tag, d <= 1.5, json.dumps(g) + ' 最大差 %.2f m' % d)
            pl = await pg.evaluate("""(glbName=>{ const root=GAME.E.zone.group.children.find(o=>o.name===glbName); const at=root.getObjectByName('wz_plates_atlas'); if(!at) return null;
                const m=at.material.map, img=m&&m.image, it=at.userData.atlas.items; return {visible:at.visible, canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), n:it.length, names:it.map(i=>i.name), ratio:it.map(i=>+((i.w/i.h)/i.board).toFixed(3))}; })""" + "(%s)" % json.dumps(glb))
            run.check('%s：匾額 %s 是 canvas 字（石材匾額）、貼圖比例＝板面比例（±8%%）' % (tag, plate), bool(pl) and pl['visible'] and pl['canvas'] and pl['names'] == [plate] and all(0.92 < r < 1.08 for r in pl['ratio']), json.dumps(pl))
        shadow = await pg.evaluate("""(()=>{ const out={}; for(const o of GAME.E.zone.group.children) if(/^campus_.*_glb$/.test(o.name)) o.traverse(m=>{ if(m.isMesh) out[m.material.name]=m.castShadow; }); return out; })()""")
        tri = await pg.evaluate("""(()=>{ const out={}; for(const o of GAME.E.zone.group.children) if(/^campus_.*_glb$/.test(o.name)){ let t=0,c=0; o.traverse(m=>{ if(!m.isMesh) return; const g=m.geometry; const n=(g.index?g.index.count:g.attributes.position.count)/3; t+=n; if(m.castShadow) c+=n; }); out[o.name]={tris:t, castTris:c}; } return out; })()""")
        run.note('正式模型的三角形（全部／會投影的）：' + json.dumps(tri))
        run.check('陰影：大面（牆、屋頂、石材）投影；窗框、窗洞、玻璃、深色木作（窗框、門）、拱廊天花板、勒腳、地燈燈罩、柱面暖光片不投影',
                  all(shadow.get(k) for k in ('ck_wall', 'ck_roof', 'ck_trim', 'ck_bell_stone', 'ck_bell_roof')) and not any(shadow.get(k) for k in ('ck_trim_win', 'ck_glass', 'ck_frame', 'ck_ceiling', 'ck_stone_base', 'ck_bell_lens', 'ck_bell_wash')), json.dumps(shadow))
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
        bd = await pg.evaluate(BELL_NIGHT + '(11)'); bn = await pg.evaluate(BELL_NIGHT + '(20.5)'); await pg.evaluate('GAME.E.applyTime(17.5)')
        run.check('傅鐘的地燈燈罩、柱面暖光：20:30 發光、11:00 不發光；暖光片是加法混合（白天看不到）',
                  bn['lens'] > 1.0 and bd['lens'] < 0.05 and bn['wash'] > 0.5 and bd['wash'] < 0.05 and bn['washAdditive'], json.dumps({'11:00': bd, '20:30': bn}))
        run.check('傅鐘的光暈：兩個（GLOW_* 空節點），20:30 亮、11:00 不亮', bn['glows'] == 2 and bn['glowsOn'] == 2 and bd['glowsOn'] == 0, json.dumps({'11:00': bd, '20:30': bn}))
        run.check('傅鐘：藏起來的套件光暈晚上不會跑回來（TK.setNight 會重設 visible）', bn['kitSpritesOn'] == 0 and bd['kitSpritesOn'] == 0, json.dumps({'11:00': bd, '20:30': bn}))
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
    res = (await pg.evaluate(NAV_HASH), await pg.evaluate(STATE), others, draws, lamps, street)
    if formal:   # 夜裡才進校園：模型在路燈已經開著的時候才載入，光暈要直接是亮的（校園的夜間只在路燈開關時切換）
        await PL.load_state(pg, {'zone': 'campus', 'hour': 20.5, 'pos': {'x': -38, 'z': 6, 'yaw': 3.1416}}, quiet_events=True)
        ok = await pg.evaluate(WAIT_FORMAL % 'campus_bell_glb'); bl = await pg.evaluate(BELL_NIGHT + '(null)')
        run.check('夜裡（20:30）才進校園：傅鐘模型載入後光暈、地燈直接是亮的', ok and bl['lampsOn'] and bl['glowsOn'] == 2 and bl['lens'] > 1.0 and bl['kitSpritesOn'] == 0, json.dumps(bl))
        await run.shot(pg, 'bell_night_2030')
    return res


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
    run.check('導航格：正式模型和改之前完全相同', res[True][0] == res[False][0], json.dumps([res[True][0], res[False][0]]))
    run.check('鏡頭碰撞方塊：完全相同', res[True][1]['col'] == res[False][1]['col'], '%d vs %d 個' % (len(res[True][1]['col']), len(res[False][1]['col'])))
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
