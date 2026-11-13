"""BB-B 11-01：歷史複核補拍（LAWWW-B 02:56 第 3 項，開發分支 81dd3258c）——LOBBY-CEIL-1028、CAFE-WINDOW-LIVE-1030、DORM203-LM-1030。
每個 MODE 開一個新的瀏覽器（Playwright＋SwiftShader 手機橫向 844×390；不是 iPhone），最後檢查「沒有 JS 例外」。
檢查多半只是「區域載好、鏡頭到位、看得到玩家、畫面中間純黑不超過 25%」；真正的判斷是 BB 看截圖（檔名寫清楚是哪一個鏡頭）。
  lobby  LOBBY-CEIL-1028 霖澤館一樓大廳中庭六盞吊燈（GLB 合併在 L1_frame／L1_light_panel，發光條底面 y≈6.375）。14:00、20:30 各一輪（每輪重新開頁面）：
         [前置] 讀檔到入口 → 玩家走到中庭 (0,2.2) → 手指左右滑轉鏡頭朝北＝follow_default → 手指往上拖到最低俯角（遊戲限制 0.06，玩家抬不了頭）＝follow_minpitch →
         【捷徑】劇情鏡頭從地上往上看：up_all6（六盞一起）、up_near（最近一盞）、up_near_4cm（偏 4 cm，比對閃爍）、up_top（幾乎正上方）→
         [前置] 讀檔到二樓迴廊 (0,-4)、滑鏡頭朝南＝gallery2f_follow（從上面看吊燈：原本黑色長方形就是從這裡看到的朝上那一面）。
         唯讀：L1_* 網格名稱、材質、visible、發光條朝上／朝下的三角形數、六條的中心；每張截圖算畫面裡的發光條中心亮度（輔助）。
  cafe   CAFE-WINDOW-LIVE-1030 兩點半 Café 玻璃外的 3D 溫州街（zones3d.js cafeStreetLive：群組 cafe_street、z.cafeStreet）。14:00、19:40 各一輪（每輪重新開頁面）：
         [前置] 讀檔在 Café 門口 (0,5)（＝從溫州街走進來的出生點）→ 第 1 次：滑鏡頭對著玻璃（swipe）＋【捷徑】yaw2＝π（y0～y3＝0、π/2、π、3π/2；鏡頭在玩家北邊、看南邊 z≈6.35 的店面玻璃）同俯角同距離 →
         玩家走到門口按「離開咖啡廳」→ 溫州街（截圖）→ 走到「進入兩點半 Café」按 → 第 2 次：同一個位置、同一個鏡頭再拍。
         唯讀：cafe_street 有幾個、裡面幾個網格（兩次要一樣、不能變兩份）、畫的街景（15×3.5 的平面）藏起來沒有、窗外路人幾個、5 秒內的 fps。
  dorm5  DORM203-LM-1030 祐廷五年的四人房：大一 203、舊序章的系 412、大二 312（ROOM_Y2）、大三 507（ROOM_Y3）、大四 409（ROOM_Y4）；YEARS=203,412 可以只跑幾年。每年 14:00：
         [前置] 讀檔在房門口 → b_desks（走到走道、滑鏡頭朝窗：兩排書桌）→ b_mydesk_low（走到自己書桌旁、往上拖到最低俯角，看床板底下的書桌）→
         a_bed（走道上、滑鏡頭朝自己的床）→ c_bird_player（雙指縮到最遠＋往下拖到最大俯角：玩家自己能做到最高的角度）→
         【捷徑】劇情鏡頭 c_bedtop_foot（床尾上方往床頭看）、c_bedtop_aisle（走道上方）、c_bedtop_nobedding（藏被子枕頭看床墊）；大二～大四再【捷徑】全部物件拿出來量一次＋近拍書桌。
         唯讀：四張床的床墊長（L2 要 1.90～1.96）、床尾擋板離牆多遠（要在走道那一半：≥0.40 m）、看得到的書桌組只有這一年的、物件外框重疊與頂點穿插（印出來，看截圖判斷）。
         203 另外 23:30：走道看床（開燈）→【捷徑】STORY.roomDark(GAME,1) 熄燈同一個鏡頭 → 從門口看整間（熄燈）。
  fairwalk FAIR-STAFF-LOD-1027 社團博覽會（2025-09-06（六）10:00～16:00，椰林大道 36 頂帳篷）顧攤的人照距離藏（engine3d.js n.lodLim＋clubfair3d.js STAFF_LOD：中畫質 35 m）。
         [前置] 照 fair_probe.py MODE=fair 的最小存檔（法律系大一、開學改 9/1 的新局：LAW_START_DAY、MAIN_D1；STORY.week1Start）10:36 校園：
         far（站在最東邊帳篷再往東 50 m、滑鏡頭朝西看整條大道）→ 點地面走到東端 → 按住搖桿往西走到舞台前 (-25,-1)，遊戲時間每 2.5 秒（FAIR_DT）邊走邊截圖 →
         near（站在離舞台最近、有人顧的攤位前 5 m，滑鏡頭對著攤位）→ 按住搖桿走回東端，一樣邊走邊截圖。檔名＝序號＋w（往西）／e（往東）＋玩家 x。
         唯讀：每張截圖每一個顧攤的人：離鏡頭距離、visible、在不在視錐、遠距離版本（isFar）、看得到的網格數、頭的高度；和上一張比哪些變了
         （兩張都在畫面裡、都在鏡頭 33 m（中畫質 35−2）內卻突然出現／消失＝在玩家眼前跳出來；頭的高度差 >0.15 m＝變形）；全部存 staff_log.json。
[前置]＝讀檔（存檔改日期、時間、地點、旗標）；【捷徑】＝在頁面裡直接改狀態（鏡頭、劇情鏡頭、熄燈、藏被子、顯示物件）。走路、按按鈕、滑鏡頭、雙指縮放都是 CDP 觸控。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<lobby|cafe|dorm5，可以逗號分隔> python3 audit2_probe.py '<URL>/index.html?turbo' <輸出資料夾> [使用者存檔.json]
  存檔省略＝<LW_TESTS>/repro_1020/user_save_day9.json（使用者 9/25 存檔）。輸出：<輸出資料夾>/<MODE>/NN_<鏡頭>.png
例（開發分支 81dd3258c，server 開在 lwdev81 的 8903）：
  LW_TESTS=/tmp/claude-0/-home-user-Lawstudent/773c49b9-ad25-576f-b588-101fb9f8321d/scratchpad/lwdev81/tests SHA=81dd3258c MODE=lobby python3 audit2_probe.py 'http://127.0.0.1:8903/index.html?turbo' <輸出>/audit2
  （MODE=cafe、MODE=dorm5、MODE=fairwalk 同上；MODE=lobby,cafe,dorm5,fairwalk 一次跑四個，一個跑完才開下一個瀏覽器）"""
import os, sys, json, asyncio, math, time, traceback
if len(sys.argv) < 3 or 'LW_TESTS' not in os.environ:
    print(__doc__); sys.exit(2)
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVEF = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.environ['LW_TESTS'], 'repro_1020', 'user_save_day9.json')
SAVE = json.load(open(SAVEF, encoding='utf-8')) if os.path.exists(SAVEF) else {}
SHA = os.environ.get('SHA', '?')
J = lambda o: json.dumps(o, ensure_ascii=False)
PI = math.pi
DESC = {'lobby': 'LOBBY-CEIL-1028 霖澤館中庭吊燈往上看（14:00／20:30）', 'cafe': 'CAFE-WINDOW-LIVE-1030 Café 窗外 3D 溫州街，走出去再走進來同一個鏡頭（14:00／19:40）',
        'dorm5': 'DORM203-LM-1030 五年的四人房：床墊長、床尾擋板、書桌不重疊、203 熄燈',
        'fairwalk': 'FAIR-STAFF-LOD-1027 社博顧攤的人 35 m 外不畫：沿大道走到舞台再走回來，邊走邊拍'}

# ---------- 共用 ----------
CAMINFO = r"""(()=>{ const E=GAME.E, c=E.camera.position, C=E.cam, P=E.player.obj.position, f=x=>+(+x).toFixed(2);
  return {cam:[f(c.x),f(c.y),f(c.z)], yaw:+(+C.yaw).toFixed(3), pitch:+(+C.pitch).toFixed(3), dist:f(C.dist||0), distT:f(C.distTarget||0), mode:C.mode, player:[f(P.x),f(P.y),f(P.z)], lv:E.player.lv|0, zone:GAME.G.zone, hour:f(GAME.G.hour)}; })()"""
PLAYER_VIS = r"""(()=>{ const E=GAME.E, o=E.player.obj; let v=true; for(let p=o;p;p=p.parent) if(!p.visible){ v=false; break; }
  const q=o.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1.0,0)); E.camera.updateMatrixWorld(); const n=q.clone().project(E.camera);
  return {vis:v, ndc:[+n.x.toFixed(2),+n.y.toFixed(2),+n.z.toFixed(3)], inView:v&&Math.abs(n.x)<=1&&Math.abs(n.y)<=1&&n.z<1, d:+E.camera.position.distanceTo(q).toFixed(2)}; })()"""
CANVAS_PT = "(([x,y])=>{ const e=document.elementFromPoint(x,y); return !!e&&e.id==='c'; })"
FPS = r"""new Promise(r=>{ const E=GAME.E, f0=E.frame|0, t0=performance.now(); let n=0; const step=()=>{ n++; const t=(performance.now()-t0)/1000; if(t<5) requestAnimationFrame(step);
  else { const i=E.renderer.info.render; r({raf:+(n/t).toFixed(2), update:+(((E.frame|0)-f0)/t).toFixed(2), calls:i.calls, tris:i.triangles}); } }; requestAnimationFrame(step); })"""
SET_CAM = "(([y,p,d])=>{ const C=GAME.E.cam; C.yaw=y; C.pitch=p; C.distTarget=d; C.manualT=1e9; })"


def img_stats(path):
    """畫面中間（扣掉上面 18% 的 HUD、下面 12%、左右 5%）：純黑（max(R,G,B)<10）的比例、平均亮度"""
    try:
        from PIL import Image
        im = Image.open(path).convert('RGB'); w, h = im.size
        c = im.crop((int(w * 0.05), int(h * 0.18), int(w * 0.95), int(h * 0.88))); c = c.resize((max(1, c.width // 3), max(1, c.height // 3)))
        px = list(c.getdata()); n = len(px)
        return {'black': round(sum(1 for p in px if max(p) < 10) / n, 3), 'mean': round(sum(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in px) / n, 1)}
    except Exception as e:
        return {'err': str(e)[:120]}


def px_lum(path, xy, r=2):
    try:
        from PIL import Image
        im = Image.open(path).convert('L'); x0, y0 = int(xy[0]), int(xy[1]); v = []
        for x in range(x0 - r, x0 + r + 1):
            for y in range(y0 - r, y0 + r + 1):
                if 0 <= x < im.width and 0 <= y < im.height: v.append(im.getpixel((x, y)))
        return round(sum(v) / len(v), 1) if v else None
    except Exception:
        return None


async def fresh(pg):
    """重新開頁面（同一個瀏覽器）：遊戲載完、清 localStorage、bbplay 的 helper"""
    await pg.goto(URL); ok = await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await P.init(pg)
    return ok


async def wait_js(pg, js, arg=None, max_s=120):
    t0 = time.time()
    while time.time() - t0 < max_s:
        try:
            if await (pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)): return True
        except Exception:
            pass
        await pg.wait_for_timeout(1000)
    return False


async def clear_ui(pg, cdp, run, tag):
    """手機、面板收起來；有對話就像玩家一樣點完（選項照 bbplay 的婉拒那一類）"""
    await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    s = await P.ts(pg)
    if s['dlg'] or s['ch']:
        r = await P.dialog(pg, cdp, run, max_s=60, start_s=1, idle_s=2)
        run.note('%s：途中跳出對話，點完了（%s；選了 %s）' % (tag, J(r['lines'])[:300], J(r['picked'])))


async def snap(pg, cdp, run, tag, kind='follow', want=None, dark_ok=False, phone=True):
    """截圖＋鏡頭／玩家／畫面讀數；kind＝follow（跟隨鏡頭：要看得到玩家）、cine（劇情鏡頭：要在指定位置）、free（只看畫面）。
    phone=False：按著搖桿時不碰手機（收手機那一下 touchEnd 會把搖桿也放掉）"""
    if phone: await L.phone_away(pg, cdp)
    path = await run.shot(pg, tag); st = img_stats(path)
    cam = await pg.evaluate(CAMINFO); pv = await pg.evaluate(PLAYER_VIS)
    run.note('%s：鏡頭 %s｜玩家 %s｜畫面 %s' % (tag, J(cam), J(pv), J(st)))
    if 'black' in st and not dark_ok: run.check('%s：畫面中間純黑 ≤25%%（%.1f%%）' % (tag, st['black'] * 100), st['black'] <= 0.25)
    if kind == 'follow':
        run.check('%s：跟隨鏡頭就位、看得到玩家' % tag, pv['inView'] and 0.3 <= pv['d'] <= 9.5 and cam['mode'] == 'follow', J(pv))
    elif kind == 'cine' and want:
        dd = math.dist(cam['cam'], want); run.check('%s：劇情鏡頭到指定位置（差 %.2f m）' % (tag, dd), dd <= 0.3)
    return {'path': path, 'st': st, 'cam': cam, 'pv': pv}


async def cine(pg, cdp, run, tag, pos, look, extra=None):
    await L.phone_away(pg, cdp)
    await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })", [pos, look])
    run.setup('【捷徑】劇情鏡頭 %s：鏡頭 %s 看 %s' % (tag, J(pos), J(look)))
    await pg.wait_for_timeout(2800)
    r = await (extra(tag) if extra else snap(pg, cdp, run, tag, 'cine', pos))
    await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(900)
    return r


async def walk(pg, cdp, run, x, z, label, near=0.45, lv=None):
    ok = await L.go_to(pg, cdp, run, x, z, near, label, max_s=200, lv=lv)
    await clear_ui(pg, cdp, run, label)
    run.check('走到%s（玩家點地面／搖桿）' % label, ok)
    return ok


async def face(pg, cdp, run, tx, tz, label):
    ok = await L.turn_camera_to(pg, cdp, tx, tz); await pg.wait_for_timeout(1500)
    y = await pg.evaluate("GAME.E.cam.yaw"); run.note('手指左右滑鏡頭朝%s：%s（yaw %.3f）' % (label, '轉到了' if ok else '沒轉到 ±0.15 rad 內', y))
    return ok


async def drag_pitch(pg, cdp, run, target):
    """手指上下拖鏡頭（engine3d.js：每 px 俯角 +0.005，限制 0.06～1.05；拖超過 12 px 才算）"""
    W, H = await pg.evaluate("[innerWidth, innerHeight]")
    for _ in range(4):
        cur = await pg.evaluate("GAME.E.cam.pitch")
        if abs(cur - target) < 0.03: break
        need = (target - cur) / 0.005; lim = target <= 0.07 or target >= 1.04
        dy = max(-H * 0.8, min(H * 0.8, need * 14 / 13 + (math.copysign(25, need) if lim else 0)))
        start = None
        for fx in (0.5, 0.42, 0.58):
            for fy in ((0.12, 0.2, 0.3) if dy > 0 else (0.88, 0.8, 0.7)):
                if 4 <= H * fy + dy <= H - 4 and await pg.evaluate(CANVAS_PT, [W * fx, H * fy]): start = (W * fx, H * fy); break
            if start: break
        if not start: run.note('上下拖鏡頭：找不到可以按的地方'); break
        await L.drag(pg, cdp, start[0], start[1], start[0], start[1] + dy, steps=14); await pg.wait_for_timeout(700)
    cur = await pg.evaluate("GAME.E.cam.pitch"); run.note('手指上下拖鏡頭：俯角 → %.3f（目標 %.2f）' % (cur, target))
    return cur


async def pinch_dist(pg, cdp, run, target):
    """雙指縮放（engine3d.js：距離＝開始的距離 × 開始兩指間距 ÷ 現在的間距；室內 2.2～6）"""
    W, H = await pg.evaluate("[innerWidth, innerHeight]")
    for _ in range(3):
        cur = await pg.evaluate("GAME.E.cam.distTarget")
        if abs(cur - target) < 0.15: break
        d0 = 180.0; d1 = max(30.0, min(W - 40.0, d0 * cur / target)); y = None
        for fy in (0.42, 0.32, 0.55):
            pts = [(W / 2 + s * d / 2, H * fy) for d in (d0, d1) for s in (-1, 1)]
            if all([await pg.evaluate(CANVAS_PT, [a, b]) for a, b in pts]): y = H * fy; break
        if y is None: run.note('雙指縮放：找不到兩指都按在畫面上的地方'); break
        tp = lambda d: [{'x': W / 2 - d / 2, 'y': y, 'id': 1}, {'x': W / 2 + d / 2, 'y': y, 'id': 2}]
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': tp(d0)})
        for i in range(1, 13):
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': tp(d0 + (d1 - d0) * i / 12)}); await pg.wait_for_timeout(50)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await pg.wait_for_timeout(800)
    cur = await pg.evaluate("GAME.E.cam.distTarget"); run.note('雙指縮放：鏡頭距離 → %.2f（目標 %.2f）' % (cur, target))
    return cur


async def load(pg, cdp, run, st, what):
    await P.load(pg, cdp, st); run.setup(what)


# ---------- lobby：LOBBY-CEIL-1028 ----------
LZ_DAY, LZ_SPOT = '2025-09-26', (0.0, 2.2)
LOBBY_INFO = r"""(()=>{ const E=GAME.E, z=E.zone, out={formal:!!(z&&z.formal), lightmapped:z&&z.formalInfo?z.formalInfo.lightmapped:null, meshes:[], strips:null};
  const eff=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; }, hex=c=>c&&c.getHexString?'#'+c.getHexString():null, r2=x=>+(+x).toFixed(2); let lp=null;
  E.scene.traverse(o=>{ if(!o.isMesh||!/^L1_(light_panel|frame|ceiling)$|pendant/i.test(o.name||'')) return; if(o.name==='L1_light_panel') lp=o; const b=new THREE.Box3().setFromObject(o);
    out.meshes.push({n:o.name, vis:o.visible, eff:eff(o), x:[r2(b.min.x),r2(b.max.x)], y:[r2(b.min.y),r2(b.max.y)], z:[r2(b.min.z),r2(b.max.z)],
      mats:[].concat(o.material).map(m=>({n:m.name, t:m.type, color:hex(m.color), emi:hex(m.emissive), ei:m.emissiveIntensity, lightMap:!!m.lightMap, map:!!m.map, side:m.side, transp:!!m.transparent, op:m.opacity, mvis:m.visible!==false}))}); });
  if(lp){ lp.updateMatrixWorld(true); const g=lp.geometry, a=g.attributes.position, ix=g.index, W=lp.matrixWorld, A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3(), e1=new THREE.Vector3(), e2=new THREE.Vector3(), n=new THREE.Vector3(), cl={}; let up=0, down=0, side=0;
    const tri=(i0,i1,i2)=>{ A.fromBufferAttribute(a,i0).applyMatrix4(W); B.fromBufferAttribute(a,i1).applyMatrix4(W); C.fromBufferAttribute(a,i2).applyMatrix4(W); const cy=(A.y+B.y+C.y)/3; if(cy<6.2||cy>6.6) return;
      n.crossVectors(e1.subVectors(B,A),e2.subVectors(C,A)).normalize(); if(n.y>0.9){ up++; return; } if(n.y>-0.9){ side++; return; } down++;
      const cx=(A.x+B.x+C.x)/3, cz=(A.z+B.z+C.z)/3, k=(cz>2.2?'S':'N')+(cx<-1.6?'W':(cx>1.6?'E':'M')), q=cl[k]||(cl[k]={x:0,y:0,z:0,n:0}); q.x+=cx; q.y+=cy; q.z+=cz; q.n++; };
    if(ix) for(let i=0;i+2<ix.count;i+=3) tri(ix.getX(i),ix.getX(i+1),ix.getX(i+2)); else for(let i=0;i+2<a.count;i+=3) tri(i,i+1,i+2);
    out.strips={up,down,side,centers:Object.keys(cl).sort().map(k=>{ const q=cl[k]; return {k,c:[+(q.x/q.n).toFixed(2),+(q.y/q.n).toFixed(3),+(q.z/q.n).toFixed(2)],tris:q.n}; })}; }
  return out; })()"""
PROJ = r"""(cs=>{ const cam=GAME.E.camera; cam.updateMatrixWorld(); return cs.map(c=>{ const v=new THREE.Vector3(c.c[0],c.c[1],c.c[2]).project(cam);
  return {k:c.k, on:v.z<1&&v.z>-1&&Math.abs(v.x)<=0.98&&Math.abs(v.y)<=0.98, px:[Math.round((v.x+1)/2*innerWidth),Math.round((1-v.y)/2*innerHeight)]}; }); })"""


async def lobby(pg, cdp, run):
    for tag, h in (('1400', 14.0), ('2030', 20.5)):
        if tag != '1400': run.check('%s：重新開頁面（這一輪的第一次進大廳）' % tag, await fresh(pg))
        st, d = await P.base(pg, SAVE, LZ_DAY, h, 'linze', pos=dict(x=6.6, z=4.0, yaw=-PI / 2, lv=0, y=0))
        await load(pg, cdp, run, st, '[前置] 使用者存檔改到 %s %.2f 霖澤館一樓入口（關條件事件、手機不自動開）' % (d['key'], h))
        run.check('%s：霖澤館正式模型掛上（zone.formal）' % tag, await wait_js(pg, "!!(GAME.G.zone==='linze'&&GAME.E.zone&&GAME.E.zone.formal)", None, 150))
        info = await pg.evaluate(LOBBY_INFO); S = info.get('strips') or {}; cs = S.get('centers') or []
        for m in info['meshes']: run.note('%s 網格 %s：visible %s（含上層 %s）y %s x %s z %s 材質 %s' % (tag, m['n'], m['vis'], m['eff'], m['y'], m['x'], m['z'], J(m['mats'])))
        run.note('%s 光照貼圖：%s；吊燈發光條（L1_light_panel 高度 6.2～6.6 m）：朝上 %s、朝下 %s、側面 %s 個三角形；中心 %s' % (tag, info.get('lightmapped'), S.get('up'), S.get('down'), S.get('side'), J(cs)))
        run.check('%s：吊燈發光條找到 6 條、沒有朝上的面（LOBBY-CEIL-1028：朝上那一面從二樓看是黑色長方形）' % tag, len(cs) == 6 and S.get('up') == 0, J(S)[:300])

        async def lshot(t, kind='follow', want=None):
            r = await snap(pg, cdp, run, t, kind, want)
            if cs:
                pr = await pg.evaluate(PROJ, cs); on = [q for q in pr if q['on']]
                run.note('%s：畫面裡的發光條 %d／6，中心 5×5 亮度 %s（輔助：<40＝那一點偏暗，可能被擋或是黑面，看截圖）' % (t, len(on), J([(q['k'], q['px'], px_lum(r['path'], q['px'])) for q in on])))
            return r
        await walk(pg, cdp, run, LZ_SPOT[0], LZ_SPOT[1], '中庭吊燈底下 (0,2.2)', near=0.6)
        await face(pg, cdp, run, 0.0, -3.0, '北（電梯、二樓迴廊）')
        await lshot('lobby_%s_follow_default' % tag)
        await drag_pitch(pg, cdp, run, 0.06)
        await lshot('lobby_%s_follow_minpitch' % tag)
        p = (await pg.evaluate(CAMINFO))['player']; eye = [p[0] - 0.9, 1.6, p[2]]
        near = min(cs, key=lambda c: math.hypot(c['c'][0] - eye[0], c['c'][2] - eye[2]))['c'] if cs else [0.0, 6.38, 0.6]
        await cine(pg, cdp, run, 'lobby_%s_up_all6' % tag, [0.0, 1.5, 6.4], [0.0, 6.3, 2.4], lambda t: lshot(t, 'cine', [0.0, 1.5, 6.4]))
        await cine(pg, cdp, run, 'lobby_%s_up_near' % tag, eye, near, lambda t: lshot(t, 'cine', eye))
        e4 = [eye[0] + 0.04, eye[1] + 0.04, eye[2] + 0.03]
        await cine(pg, cdp, run, 'lobby_%s_up_near_4cm' % tag, e4, near, lambda t: lshot(t, 'cine', e4))
        await cine(pg, cdp, run, 'lobby_%s_up_top' % tag, eye, [eye[0] + 0.3, 9.0, eye[2] - 1.2], lambda t: lshot(t, 'cine', eye))
        st2, _ = await P.base(pg, SAVE, LZ_DAY, h, 'linze', pos=dict(x=0.0, z=-4.0, yaw=0.0, lv=1, y=4.2))
        await load(pg, cdp, run, st2, '[前置] 同一份存檔讀到二樓迴廊 (0,-4) 第 1 層（從上面看吊燈）')
        await wait_js(pg, "!!(GAME.G.zone==='linze'&&GAME.E.zone&&GAME.E.zone.formal)", None, 120)
        lv = (await pg.evaluate(CAMINFO))['lv']; run.check('%s：玩家在二樓（第 1 層）' % tag, lv == 1, str(lv))
        await face(pg, cdp, run, 0.0, 6.0, '南（中庭、正面玻璃）')
        await lshot('lobby_%s_gallery2f_follow' % tag)


# ---------- cafe：CAFE-WINDOW-LIVE-1030 ----------
CF_DAY, CF_POS = '2025-09-26', dict(x=0.0, z=5.0, yaw=PI, lv=0, y=0)
CAFE_READY = "!!(GAME.G.zone==='cafe'&&GAME.E.zone&&GAME.E.zone.formal&&GAME.E.zone.cafeStreet&&GAME.E.zone.cafeStreet.visible)"
CAFE_ST = r"""(()=>{ const E=GAME.E, z=E.zone, sts=[]; E.scene.traverse(o=>{ if(o.name==='cafe_street') sts.push(o); });
  const st=z&&z.cafeStreet; let meshes=0; const subs=[]; if(st) st.traverse(o=>{ if(o.isMesh) meshes++; if(/^cafe_street_/.test(o.name||'')) subs.push(o.name); });
  let view=null; if(z&&z.group) z.group.traverse(o=>{ const p=o.isMesh&&o.geometry&&o.geometry.parameters; if(p&&p.width===15&&p.height===3.5&&Math.abs(o.position.z-6.55)<0.05) view={vis:o.visible, inWinParts:!!(z.winParts&&z.winParts.some(q=>q.obj===o))}; });
  let w=0, wv=0, sw=0; for(const x of E.extras) if(x.obj&&x.obj.name==='cafe_walker'){ w++; if(x.obj.visible) wv++; } E.scene.traverse(o=>{ if(o.name==='cafe_walker') sw++; });
  return {zone:GAME.G.zone, formal:!!(z&&z.formal), streetGroups:sts.length, street:!!st, streetVis:!!(st&&st.visible), meshes, subs, view, walkers:w, walkersVis:wv, sceneWalkers:sw, hour:+(+GAME.G.hour).toFixed(2)}; })()"""


async def door(pg, cdp, run, to, want, tag):
    """像玩家一樣走到往 to 的門（互動點）、看按鈕是 want 再按，等區域換過去"""
    it = await pg.evaluate("(to=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to===to); return it?[it.x,it.z,it.label]:null; })", to)
    if not it: run.note('%s：找不到往 %s 的門' % (tag, to)); return False
    s = None
    for near in (0.9, 0.4):
        await L.go_to(pg, cdp, run, it[0], it[1], near, it[2], max_s=200); await clear_ui(pg, cdp, run, it[2]); s = await L.state(pg)
        if s['interact'].startswith(want[:4]): break
    run.note('%s：按鈕「%s」（要「%s」）' % (tag, s['interact'], want))
    await L.tap(pg, cdp, '#interact')
    return await wait_js(pg, "(z=>GAME.G.zone===z)", to, 45)


async def cafe(pg, cdp, run):
    for tag, h in (('1400', 14.0), ('1940', 19 + 40 / 60)):
        if tag != '1400': run.check('%s：重新開頁面（這一輪的第 1 次真的是第一次進 Café）' % tag, await fresh(pg))
        st, d = await P.base(pg, SAVE, CF_DAY, h, 'cafe', pos=dict(CF_POS))
        await load(pg, cdp, run, st, '[前置] 使用者存檔改到 %s %.2f 兩點半 Café 門口 (0,5)（＝從溫州街走進來的出生點；關條件事件）' % (d['key'], h))
        ent = []; p0 = d0 = None
        for k in (1, 2):
            if k == 2:
                run.check('%s：走到門口按「離開咖啡廳」到溫州街' % tag, await door(pg, cdp, run, 'wenzhou', '離開咖啡廳', tag))
                await pg.wait_for_timeout(5000); await clear_ui(pg, cdp, run, '溫州街')
                await snap(pg, cdp, run, 'cafe_%s_wz_arrive' % tag)
                wz = await pg.evaluate(CAFE_ST); run.note('%s 溫州街上：cafe_street 群組 %s 個、窗外路人 %s（場景裡 %s）' % (tag, wz['streetGroups'], wz['walkers'], wz['sceneWalkers']))
                run.check('%s：出來以後場景裡沒有留下 Café 的街景／路人' % tag, wz['streetGroups'] == 0 and wz['sceneWalkers'] == 0, J(wz))
                run.check('%s：走到「進入兩點半 Café」按，回到 Café' % tag, await door(pg, cdp, run, 'cafe', '進入兩點半 Café', tag))
            ok = await wait_js(pg, CAFE_READY, None, 150)
            run.check('%s 第 %d 次進 Café：3D 溫州街掛上（zone.cafeStreet 看得到）' % (tag, k), ok)
            await pg.wait_for_timeout(3000); await clear_ui(pg, cdp, run, 'Café')
            info = await pg.evaluate(CAFE_ST); fps = await pg.evaluate(FPS)
            run.note('%s 第 %d 次：%s；5 秒 fps %s' % (tag, k, J(info), J(fps)))
            if k == 1: p0, d0 = await pg.evaluate("[GAME.E.cam.pitch, GAME.E.cam.distTarget]")
            await face(pg, cdp, run, 0.0, 7.5, '店面玻璃（南）')
            await snap(pg, cdp, run, 'cafe_%s_e%d_swipe' % (tag, k))
            await pg.evaluate(SET_CAM, [PI, p0, d0])
            run.setup('【捷徑】鏡頭 yaw2＝π（鏡頭在玩家北邊、看南邊的店面玻璃）、俯角 %.2f、距離 %.2f（進來時的預設；兩次同一個鏡頭）' % (p0, d0))
            await pg.wait_for_timeout(3500)
            r = await snap(pg, cdp, run, 'cafe_%s_e%d_yaw2' % (tag, k))
            await pg.evaluate("GAME.E.cam.manualT=0"); run.setup('【捷徑】鏡頭還給玩家（manualT＝0）')
            ent.append(dict(info=info, fps=fps, cam=r['cam']))
        (a, b) = ent; ia, ib = a['info'], b['info']
        dc = math.dist(a['cam']['cam'], b['cam']['cam']); dp = math.dist(a['cam']['player'], b['cam']['player'])
        run.check('%s：兩次同一個鏡頭（鏡頭差 %.2f m、yaw %.3f／%.3f、玩家位置差 %.2f m）' % (tag, dc, a['cam']['yaw'], b['cam']['yaw'], dp), dc <= 0.08 and dp <= 0.15 and abs(a['cam']['yaw'] - b['cam']['yaw']) < 0.01)
        run.check('%s：第 2 次進來 3D 街景還在、只有一份（cafe_street %d 個）' % (tag, ib['streetGroups']), ib['street'] and ib['streetVis'] and ib['streetGroups'] == 1)
        run.check('%s：街景網格數兩次一樣（%s／%s，沒有變兩份）' % (tag, ia['meshes'], ib['meshes']), ia['meshes'] > 0 and ia['meshes'] == ib['meshes'])
        for k, i in ((1, ia), (2, ib)):
            v = i.get('view') or {}
            run.check('%s 第 %d 次：畫的街景（平面）藏起來、不在 winParts' % (tag, k), bool(v) and not v.get('vis') and not v.get('inWinParts'), J(v))
        run.note('%s 窗外路人：第 1 次 %s（看得到 %s）、第 2 次 %s（看得到 %s）；fps 第 1 次 %s、第 2 次 %s' % (tag, ia['walkers'], ia['walkersVis'], ib['walkers'], ib['walkersVis'], J(a['fps']), J(b['fps'])))
        run.check('%s：路人數兩次一樣、場景裡沒有多出來的（%s／%s；場景 %s）' % (tag, ia['walkers'], ib['walkers'], ib['sceneWalkers']), ia['walkers'] == ib['walkers'] and ib['sceneWalkers'] == ib['walkers'])


# ---------- dorm5：DORM203-LM-1030 ----------
DOOR = dict(x=0.0, z=2.4, yaw=PI, lv=0, y=0)
YEARS = [('203', '203', '2025-09-26', 'law', {}), ('412', '412', '2024-10-16', 'econ', {}),
         ('312', '312', '2026-10-14', 'law', {'ROOM_Y2': '2026-09-06'}),
         ('507', '507', '2027-10-13', 'law', {'ROOM_Y2': '2026-09-06', 'ROOM_Y3': '2027-09-05'}),
         ('409', '409', '2028-10-11', 'law', {'ROOM_Y2': '2026-09-06', 'ROOM_Y3': '2027-09-05', 'ROOM_Y4': '2028-09-03'})]
DORM_READY = "(k=>{ const z=GAME.E.zone; return !!(GAME.G.zone==='dorm'&&z&&z.dormRoot&&z.formal&&z.dormSetKey===k&&!(z.itemsLoading>0)); })"
DORM_MEASURE = r"""(()=>{ const E=GAME.E, z=E.zone, R=DORM_ROOM, root=z&&z.dormRoot, out={key:z&&z.dormSetKey, plate:(typeof DM3!=='undefined'&&DM3.homeOf)?DM3.homeOf(GAME.G).plate:null, units:{}, groups:[], items:[], aabb:[], hits:[]};
  const eff=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; }, r3=x=>+(+x).toFixed(3), v=new THREE.Vector3();
  const boxOf=o=>{ const b=new THREE.Box3(); o.updateMatrixWorld(true); o.traverse(m=>{ if(m.isMesh&&eff(m)) b.union(new THREE.Box3().setFromObject(m)); }); return b; };
  const bj=b=>b.isEmpty()?null:[[r3(b.min.x),r3(b.min.y),r3(b.min.z)],[r3(b.max.x),r3(b.max.y),r3(b.max.z)]];
  if(root) for(const u of R.units){ const sh=root.getObjectByName('LOFT_'+u.id+'_sheet'), fr=root.getObjectByName('LOFT_'+u.id+'_frame'), o={}; out.units[u.id]=o; if(!sh) continue;
    const b=new THREE.Box3().setFromObject(sh); o.mattress={len:r3(b.max.z-b.min.z), wid:r3(b.max.x-b.min.x), top:r3(b.max.y), z:[r3(b.min.z),r3(b.max.z)], eff:eff(sh)}; if(!fr) continue;
    fr.updateMatrixWorld(true); const a=fr.geometry.attributes.position, wallX=u.side==='L'?u.block.x[0]:u.block.x[1], foot=(u.stair_u[0]+u.stair_u[1])/2>(b.min.z+b.max.z)/2, fz=foot?b.max.z:b.min.z, sg=foot?1:-1; let lo=9, hi=-9, n=0;
    for(let i=0;i<a.count;i++){ v.fromBufferAttribute(a,i).applyMatrix4(fr.matrixWorld); const dz=(v.z-fz)*sg; if(dz<-0.004||dz>0.03||v.y<b.max.y+0.05||v.y>b.max.y+0.24) continue; const d=Math.abs(v.x-wallX); n++; lo=Math.min(lo,d); hi=Math.max(hi,d); }
    o.foot={end:foot?'+z':'-z', z:r3(fz), verts:n, fromWall:n?[r3(lo),r3(hi)]:null}; }
  const GR=/^(Y(203|412|312|507|409)_[A-Z]+|ROOMMATE_KAI|NAMETAG_[A-Z]+|JACKET_CHAIR)$/, IR=/^(ITEM_|Y1_BOX_|Y2_BOXES_|FORM_STAMP|POTHOS_S\d|XUN_|BOXES_|BOOK_ECON)/, owners=[];
  if(root) root.traverse(o=>{ if(!GR.test(o.name||'')) return; const b=boxOf(o); out.groups.push({n:o.name, eff:eff(o), box:bj(b)}); if(eff(o)&&!b.isEmpty()) owners.push({n:o.name,o,b}); });
  z.group.traverse(o=>{ if(!IR.test(o.name||'')||!eff(o)) return; for(let p=o.parent;p;p=p.parent) if(IR.test(p.name||'')) return; const b=boxOf(o); if(b.isEmpty()) return; out.items.push({n:o.name, box:bj(b)}); owners.push({n:o.name,o,b,item:true}); });
  out.yearsShown=[...new Set(out.groups.filter(g=>g.eff&&/^Y\d{3}_/.test(g.n)).map(g=>g.n.slice(1,4)))];
  for(let i=0;i<owners.length;i++) for(let j=i+1;j<owners.length;j++){ const I=owners[i].b.clone().intersect(owners[j].b); if(I.isEmpty()) continue; const s=I.getSize(new THREE.Vector3()); if(s.x>0.01&&s.y>0.01&&s.z>0.01) out.aabb.push([owners[i].n,owners[j].n,[r3(s.x),r3(s.y),r3(s.z)]]); }
  const own=m=>{ for(let p=m;p;p=p.parent) if(GR.test(p.name||'')||IR.test(p.name||'')) return p.name; return m.name||'(無名)'; }, meshes=[];
  z.group.traverse(m=>{ if(m.isMesh&&eff(m)&&!/^WALL_/.test(m.name||'')&&[].concat(m.material).every(q=>q&&q.visible!==false)) meshes.push(m); });
  for(const it of owners.filter(q=>q.item)){ const S=it.b.clone().expandByScalar(-0.005); if(S.isEmpty()) continue; const cnt={};
    for(const m of meshes){ let mine=false; for(let p=m;p;p=p.parent) if(p===it.o){ mine=true; break; } if(mine||!new THREE.Box3().setFromObject(m).intersectsBox(S)) continue;
      m.updateMatrixWorld(true); const a=m.geometry.attributes.position; let k=0; for(let i=0;i<a.count;i++){ v.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld); if(S.containsPoint(v)) k++; } if(k>=3){ const n=own(m); cnt[n]=(cnt[n]||0)+k; } }
    for(const n in cnt) out.hits.push([it.n,n,cnt[n]]); }
  return out; })()"""
ALLITEMS = r"""(()=>{ const z=GAME.E.zone; if(!z.setY2Items||!z.itemGroups) return null; const ids=[]; for(const g of z.itemGroups) g.traverse(o=>{ if(/^ITEM_/.test(o.name)&&!(o.parent&&/^ITEM_/.test(o.parent.name))){ const n=o.name; ids.push(n==='ITEM_y1_ferris'?'y1_3':(n==='ITEM_y1_album'?'y1_4':n.slice(5))); } });
  z.setY2Items({shown:ids,boxes:'open'}); return ids; })()"""
BEDDING = "(v=>{ const r=GAME.E.zone.dormRoot, o=r&&r.getObjectByName('BEDDING_L2'); if(o) o.visible=v; return !!o; })"


def dorm_report(run, plate, m, tag=''):
    U = m.get('units') or {}; L2 = U.get('L2') or {}; mt = L2.get('mattress') or {}; ft = L2.get('foot') or {}; fw = ft.get('fromWall')
    run.note('%s%s 四張床：%s' % (plate, tag, J(U)))
    if not tag:
        run.check('%s：住的是 %s（門牌 %s、房間組 %s）' % (plate, plate, m.get('plate'), m.get('key')), m.get('plate') == plate and m.get('key') == plate)
        run.check('%s：祐廷（L2）床墊長 1.90～1.96 m（量到 %s）' % (plate, mt.get('len')), 1.90 <= (mt.get('len') or 0) <= 1.96, J(mt))
        run.check('%s：L2 床尾擋板只在走道那一半（擋板離牆 %s m 起；靠牆那一半是上床的開口）' % (plate, fw and fw[0]), bool(fw) and fw[0] >= 0.40 and fw[1] >= 0.8, J(ft))
        kai = any(g['n'] == 'ROOMMATE_KAI' and g['eff'] for g in m.get('groups', []))
        run.check('%s：書桌只顯示這一年的那一組（看得到的 Y???_：%s；阿凱的桌子 %s）' % (plate, m.get('yearsShown'), kai), m.get('yearsShown') == [plate] and (plate == '203' or not kai))
    run.note('%s%s 看得到的書桌組：%s' % (plate, tag, J([(g['n'], g['box']) for g in m.get('groups', []) if g['eff']])))
    run.note('%s%s 看得到的物件：%s' % (plate, tag, J(m.get('items'))))
    run.note('%s%s 外框（AABB）互相重疊 %d 對（同一張書桌上放東西本來就會碰；看截圖）：%s' % (plate, tag, len(m.get('aabb', [])), J(m.get('aabb'))))
    run.note('%s%s 頂點落在別的物件外框裡（≥3 點、外框內縮 5 mm；比外框嚴格）%d 組：%s' % (plate, tag, len(m.get('hits', [])), J(m.get('hits'))))


async def dorm_year(pg, cdp, run, plate, key, day, stage, fdays, hour=14.0):
    d = await P.day_of(pg, day); fl = {}
    for k, dk in fdays.items(): fl[k] = (await P.day_of(pg, dk))['d']
    if stage == 'econ':
        fl.update(E412_MOVEIN=True, E01_DONE=True, E01_NIGHT='unpack', E01_MORNING=True, E01_BOXES=True)
        st = {'stage': 'econ', 'zone': 'dorm', 'day': d['d'], 'weekday': d['wd'], 'hour': hour, 'money': 12000, 'pos': dict(DOOR), 'flags': fl}
        what = '[前置] 舊序章的系那一年：新存檔（GAME.defaults）stage econ、%s %.2f 宿舍房門口；旗標 %s' % (d['key'], hour, J(fl))
    else:
        st, _ = await P.base(pg, SAVE, day, hour, 'dorm', pos=dict(DOOR), flags=fl)
        what = '[前置] 使用者存檔改到 %s %.2f 宿舍房門口；旗標 %s' % (d['key'], hour, J(fl))
    await load(pg, cdp, run, st, what)
    ok = await wait_js(pg, DORM_READY, key, 150)
    run.check('%s：房間正式模型、這一年的物件都載好（dormSetKey %s）' % (plate, key), ok, J(await pg.evaluate("(()=>{ const z=GAME.E.zone; return {zone:GAME.G.zone, key:z&&z.dormSetKey, root:!!(z&&z.dormRoot), formal:!!(z&&z.formal), loading:z&&z.itemsLoading}; })()")))
    await clear_ui(pg, cdp, run, plate)
    return ok


async def dorm5(pg, cdp, run):
    want = [y for y in os.environ.get('YEARS', '').split(',') if y]
    summary = {}
    for plate, key, day, stage, fdays in YEARS:
        if want and plate not in want: continue
        await dorm_year(pg, cdp, run, plate, key, day, stage, fdays)   # 沒載完照樣拍（看到的是備用模型也是證據；上面那一項 FAIL 會寫）
        m = await pg.evaluate(DORM_MEASURE); dorm_report(run, plate, m)
        L2 = (m.get('units') or {}).get('L2') or {}
        summary[plate] = {'mattress': (L2.get('mattress') or {}).get('len'), 'footFromWall': (L2.get('foot') or {}).get('fromWall'), 'years': m.get('yearsShown'), 'aabb': len(m.get('aabb', [])), 'hits': len(m.get('hits', []))}
        T = 'dorm_%s' % plate
        await walk(pg, cdp, run, 0.0, 1.2, '走道中間 (0,1.2)')
        await face(pg, cdp, run, 0.0, -3.4, '窗（兩排書桌）')
        await snap(pg, cdp, run, T + '_b_desks')
        await walk(pg, cdp, run, -1.3, -0.2, '自己的書桌旁 (-1.3,-0.2)')
        await face(pg, cdp, run, -2.6, -0.3, '自己的書桌')
        await drag_pitch(pg, cdp, run, 0.06)
        await snap(pg, cdp, run, T + '_b_mydesk_low')
        await drag_pitch(pg, cdp, run, 0.38)
        await walk(pg, cdp, run, -0.75, 0.2, '走道、自己的床旁邊 (-0.75,0.2)')
        await face(pg, cdp, run, -2.45, 0.2, '自己的床（L2）')
        await snap(pg, cdp, run, T + '_a_bed')
        await pinch_dist(pg, cdp, run, 6.0); await drag_pitch(pg, cdp, run, 1.05)
        await snap(pg, cdp, run, T + '_c_bird_player')
        foot = ([-2.45, 2.88, 2.3], [-2.45, 1.76, -0.05])
        await cine(pg, cdp, run, T + '_c_bedtop_foot', *foot)
        await cine(pg, cdp, run, T + '_c_bedtop_aisle', [-1.0, 2.9, 0.0], [-2.55, 1.76, 0.0])
        if await pg.evaluate(BEDDING, False):
            run.setup('【捷徑】藏起 L2 的被子、枕頭（BEDDING_L2），看整張床墊')
            await cine(pg, cdp, run, T + '_c_bedtop_nobedding', *foot)
            await pg.evaluate(BEDDING, True); run.setup('【捷徑】被子、枕頭放回去')
        if plate in ('312', '507', '409'):
            ids = await pg.evaluate(ALLITEMS); run.setup('【捷徑】z.setY2Items 把這一年模型裡的物件全部拿出來（最壞情況看重疊）：%s' % J(ids))
            await pg.wait_for_timeout(1500); dorm_report(run, plate, await pg.evaluate(DORM_MEASURE), '（全部物件）')
            await cine(pg, cdp, run, T + '_allitems_desk', [-1.15, 1.5, 0.95], [-2.6, 0.95, -0.3])
        if plate == '203':   # 熄燈
            await dorm_year(pg, cdp, run, '203', '203', day, stage, fdays, hour=23.5)
            run.check('203 23:30：房間有熄燈的光照貼圖（z.lightsOff）', await wait_js(pg, "typeof GAME.E.zone.lightsOff==='function'", None, 60))
            await walk(pg, cdp, run, -0.75, 0.2, '走道、自己的床旁邊 (-0.75,0.2)')
            await face(pg, cdp, run, -2.45, 0.2, '自己的床（L2）')
            await snap(pg, cdp, run, 'dorm_203_2330_lights_on')
            k = await pg.evaluate("STORY.roomDark(GAME,1)"); run.setup('【捷徑】STORY.roomDark(GAME,1) 熄燈（k＝%s；DARK_LIGHTS %s）' % (k, await pg.evaluate("STORY.DARK_LIGHTS")))
            await pg.wait_for_timeout(3000)
            await snap(pg, cdp, run, 'dorm_203_2330_lights_off', dark_ok=True)
            await cine(pg, cdp, run, 'dorm_203_2330_lights_off_overview', [0.3, 2.6, 3.1], [0.0, 1.0, -3.2])
            await pg.evaluate("STORY.roomDark(GAME,0)"); run.setup('【捷徑】STORY.roomDark(GAME,0) 開燈')
    run.note('五年總表（L2 床墊長、床尾擋板離牆、看得到的書桌年份、外框重疊對數、頂點穿插組數）：%s' % J(summary))


# ---------- fairwalk：FAIR-STAFF-LOD-1027 ----------
FAIR_DT = float(os.environ.get('FAIR_DT', '2.5'))   # 遊戲時間幾秒拍一張
Y1F = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True}   # 同 fair_probe.py
FAIRSTAT = r"""(()=>{ const E=GAME.E, st=E.npcs.filter(n=>n&&n.fairStaff), cr=E.npcs.filter(n=>n&&n.fairCrowd);
  return {q:E.q&&E.q.level, lim:(CLUBFAIR.STAFF_LOD||{})[E.q&&E.q.level], staff:st.length, staffVis:st.filter(n=>n.obj&&n.obj.visible).length, crowd:cr.length, open:CLUBFAIR.open(GAME.G),
    tents:typeof CLUB_FAIR_EXPO!=='undefined'?CLUB_FAIR_EXPO.tents.length:0, h:+(+GAME.G.hour).toFixed(2)}; })()"""
STAFF = r"""(()=>{ const E=GAME.E, cam=E.camera, c=cam.position, P=E.player.obj.position, lev=E.q&&E.q.level, lim=(CLUBFAIR.STAFF_LOD||{})[lev]||null, out=[];
  cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)), sp=new THREE.Sphere(new THREE.Vector3(),1.3), hv=new THREE.Vector3();
  for(const n of E.npcs){ if(!n||!n.fairStaff||!n.obj) continue; const o=n.obj, u=o.userData||{}, p=o.position; let nm=0, nv=0;
    o.traverse(m=>{ if(!m.isMesh) return; nm++; for(let q=m;q&&q!==o;q=q.parent) if(!q.visible) return; nv++; });   /* 看得到的網格：不算整個人的 visible（那是 LOD／視錐），看遠近版本有沒有換 */
    let hy=null; try{ const H=u.vrm&&u.vrm.humanoid, b=H&&H.getRawBoneNode?H.getRawBoneNode('head'):null; if(b) hy=+(b.getWorldPosition(hv).y-p.y).toFixed(2); }catch(e){}
    sp.center.set(p.x,p.y+0.9,p.z);
    out.push({id:n.fairStaff, cd:+Math.hypot(c.x-p.x,c.z-p.z).toFixed(1), pd:+Math.hypot(P.x-p.x,P.z-p.z).toFixed(1), vis:o.visible!==false, inFr:fr.intersectsSphere(sp), far:!!u.isFar, farLOD:!!u.farLOD, meshes:nm, visMeshes:nv, headY:hy, hidden:!!n.hidden}); }
  out.sort((a,b)=>a.cd-b.cd);
  return {q:lev, lim, cam:[+c.x.toFixed(1),+c.y.toFixed(1),+c.z.toFixed(1)], px:+P.x.toFixed(2), pz:+P.z.toFixed(2), t:+(+E.time).toFixed(2), h:+(+GAME.G.hour).toFixed(2), staff:out}; })()"""
NEAR_BOOTH = r"""(([sx,sz])=>{ const T=CLUB_FAIR_EXPO.tents, has=new Set(GAME.E.npcs.filter(n=>n&&n.fairStaff).map(n=>n.fairStaff)); let best=null, bd=1e9;
  for(const t of T){ if(t.kind==='bg'||!has.has(t.id)) continue; const d=Math.hypot(t.x-sx,t.z-sz); if(d<bd){ bd=d; best=t; } }
  return best?{id:best.id, label:best.label, x:best.x, z:best.z, ry:best.ry, sx:+(best.x+5*Math.sin(best.ry)).toFixed(2), sz:+(best.z+5*Math.cos(best.ry)).toFixed(2)}:null; })"""


def staff_diff(prev, cur, lim):
    """和上一張比：畫／沒畫、遠距離版本、看得到的網格數、頭的高度。回傳 (變化, 可疑：兩張都在視錐裡、兩張都在鏡頭 lim−2 m 內卻跳出來／消失，或頭高跳 >0.15 m)"""
    A = {s['id']: s for s in (prev or {}).get('staff', [])}; ch, bad = [], []
    for s in cur['staff']:
        a = A.get(s['id'])
        if not a: continue
        d = []
        if a['vis'] != s['vis']: d.append('%s→%s' % ('畫' if a['vis'] else '沒畫', '畫' if s['vis'] else '沒畫'))
        if a['far'] != s['far']: d.append('遠距離版本 %s→%s' % (a['far'], s['far']))
        if a['visMeshes'] != s['visMeshes']: d.append('看得到的網格 %s→%s' % (a['visMeshes'], s['visMeshes']))
        if a['vis'] and s['vis'] and a['headY'] is not None and s['headY'] is not None and abs(a['headY'] - s['headY']) > 0.15: d.append('頭高 %s→%s' % (a['headY'], s['headY']))
        if not d: continue
        ch.append('%s（鏡頭 %.1f→%.1f m、視錐 %s→%s）：%s' % (s['id'], a['cd'], s['cd'], a['inFr'], s['inFr'], '、'.join(d)))
        if (a['vis'] != s['vis'] and a['inFr'] and s['inFr'] and max(a['cd'], s['cd']) < (lim or 35) - 2) or any(x.startswith('頭高') for x in d): bad.append(ch[-1])
    return ch, bad


async def staff_shot(pg, cdp, run, tag, acc, phone=True):
    r = await snap(pg, cdp, run, tag, phone=phone)
    cur = await pg.evaluate(STAFF); cur['tag'] = tag; cur['png'] = os.path.basename(r['path']); lim = cur['lim'] or 35
    vis = [s for s in cur['staff'] if s['vis']]
    run.note('%s：玩家 (%.1f,%.1f)、遊戲 %.1f 秒｜顧攤的人 %d、畫出來 %d、在視錐裡 %d、鏡頭 %s m 內 %d｜畫出來最遠 %s m' % (tag, cur['px'], cur['pz'], cur['t'], len(cur['staff']), len(vis),
             sum(1 for s in cur['staff'] if s['inFr']), lim, sum(1 for s in cur['staff'] if s['cd'] <= lim), max([s['cd'] for s in vis] or [None])))
    run.note('%s 每一個 [攤位, 鏡頭距離, 畫, 視錐, 遠距離版本, 看得到的網格, 頭高]：%s' % (tag, J([[s['id'], s['cd'], int(s['vis']), int(s['inFr']), int(s['far']), s['visMeshes'], s['headY']] for s in cur['staff']])))
    ch, bad = staff_diff(acc['prev'], cur, lim)
    if acc['prev']: run.note('%s 和上一張比：%s' % (tag, J(ch) if ch else '沒有變化'))
    for b in bad: run.note('  ⚠ %s：%s' % (tag, b))
    acc['over'] += [(tag, s['id'], s['cd']) for s in vis if s['cd'] > lim + 1.0]; acc['bad'] += [(tag, b) for b in bad]; acc['drawn'] += len(vis)
    acc['logs'].append(cur); acc['prev'] = cur
    return cur


async def joy_leg(pg, cdp, run, tx, tz, leg, acc, max_s=480):
    """先滑鏡頭朝目標；按住搖桿不放（每 0.2 秒照鏡頭方向修正推的方向）走到 (tx,tz)，遊戲時間每 FAIR_DT 秒截一張（手還按著，人在走）"""
    await face(pg, cdp, run, tx, tz, '（%.0f,%.0f）' % (tx, tz))
    acc['prev'] = None   # 每一段的第一張不和上一段比（中間鏡頭轉過、人換過位置）
    jx, jy = await L.center_of(pg, '#joy')
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    t0 = time.time(); k = 0; last = None; best = 1e9; best_t = time.time(); ok = False
    try:
        while time.time() - t0 < max_s:
            s = await L.state(pg); d = math.hypot(tx - s['x'], tz - s['z'])
            if d < 1.5: ok = True; break
            if d < best - 0.3: best, best_t = d, time.time()
            if time.time() - best_t > 30: run.note('%s：30 秒沒有前進 %s' % (leg, J(s))); break
            y = s['camYaw']; fx, fz = -math.sin(y), -math.cos(y); ux, uz = (tx - s['x']) / d, (tz - s['z']) / d
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + 40 * (ux * -fz + uz * fx), 'y': jy - 40 * (ux * fx + uz * fz)}]})
            gt = await pg.evaluate("+GAME.E.time")
            if last is None or gt - last >= FAIR_DT:
                last = gt; k += 1; await staff_shot(pg, cdp, run, 'fair_walk_%s%02d_x%.1f' % (leg, k, s['x']), acc, phone=False)
            await pg.wait_for_timeout(200)
    finally:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    await pg.wait_for_timeout(800)
    if not ok:
        run.note('%s：搖桿沒走到，改點地面走完' % leg); ok = await L.go_to(pg, cdp, run, tx, tz, 1.5, '(%.0f,%.0f)' % (tx, tz), max_s=240)
    run.check('按住搖桿走到 (%.0f,%.0f)（邊走邊拍 %d 張）' % (tx, tz, k), ok)
    return ok


async def fair_load(pg, cdp, run, pos, h, why):
    dk = await pg.evaluate("(()=>({d:STORY.dayOfKey('2025-09-06'), law0:STORY.dayOfKey('2025-08-29'), m1:(STORY.MAIN_D1_NEW!=null?STORY.MAIN_D1_NEW:STORY.dayOfKey('2025-09-03'))}))()")
    F = dict(Y1F, LAW_START_DAY=dk['law0'], MAIN_D1=dk['m1'])
    wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })", dk['d'])
    st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk['d'], 'weekday': wd, 'hour': h, 'energy': 100, 'money': 22000, 'zone': 'campus', 'pos': pos, 'weather': 'clear', 'flags': F,
          'events': {'done': {}, 'last': {}, 'count': 0}}
    await load(pg, cdp, run, st, '[前置] %s：照 fair_probe.py MODE=fair 的最小存檔（法律系大一，開學改 9/1 的新局：LAW_START_DAY %s、MAIN_D1 %s）2025-09-06 %.2f 校園 pos %s；關條件事件、手機不自動開'
               % (why, dk['law0'], dk['m1'], h, J(pos)))
    run.check('前置：開學改 9/1 的新局（STORY.week1Start）、社博開著（CLUBFAIR.open）', await pg.evaluate("!!(STORY.week1Start&&STORY.week1Start(GAME.G))&&!!CLUBFAIR.open(GAME.G)"))
    ok = await wait_js(pg, "GAME.G.zone==='campus'&&GAME.E.npcs.some(n=>n&&n.fairStaff)", None, 90); await pg.wait_for_timeout(3000)
    fs = await pg.evaluate(FAIRSTAT); run.note('社博狀態 %s' % J(fs))
    run.check('顧攤的人放好了（%s 個；畫質 %s、%s m 外不畫）' % (fs['staff'], fs['q'], fs['lim']), ok and fs['staff'] > 0)


async def fairwalk(pg, cdp, run):
    X = await pg.evaluate("(()=>({maxX:Math.max(...CLUB_FAIR_EXPO.tents.map(t=>t.x)), stage:CLUB_FAIR.STAGE}))()")
    east, stage = (round(X['maxX'] + 4, 1), 0.0), (-25.0, -1.0); far = (round(X['maxX'] + 50, 1), 0.0)
    run.note('帳篷最東 x=%s、舞台 %s；far 站 %s、東端 %s、舞台前 %s' % (X['maxX'], J(X['stage']), far, east, stage))
    acc = {'prev': None, 'logs': [], 'over': [], 'bad': [], 'drawn': 0}
    await fair_load(pg, cdp, run, dict(x=far[0], z=far[1], yaw=-PI / 2, lv=0, y=0), 10.6, 'fairwalk：10:36 站在最東邊帳篷再往東 50 m')
    await face(pg, cdp, run, stage[0], 0.0, '西（整條大道）')
    await staff_shot(pg, cdp, run, 'fair_far_x%.1f' % (await pg.evaluate(CAMINFO))['player'][0], acc)
    acc['prev'] = None
    await walk(pg, cdp, run, east[0], east[1], '大道東端 (%.0f,0)（點地面）' % east[0], near=1.2)
    await joy_leg(pg, cdp, run, stage[0], stage[1], 'w', acc)
    b = await pg.evaluate(NEAR_BOOTH, list(stage)); run.note('離舞台最近、有人顧的攤位：%s' % J(b))
    if b:
        await walk(pg, cdp, run, b['sx'], b['sz'], '%s 攤位前 5 m' % b['label'], near=0.6)
        await face(pg, cdp, run, b['x'], b['z'], '%s 攤位' % b['label'])
        acc['prev'] = None
        cur = await staff_shot(pg, cdp, run, 'fair_near_%s' % b['id'], acc)
        me = next((s for s in cur['staff'] if s['id'] == b['id']), None)
        run.check('near：%s 顧攤的人有畫出來（鏡頭 %s m）' % (b['label'], me and me['cd']), bool(me) and me['vis'], J(me))
    await joy_leg(pg, cdp, run, east[0], east[1], 'e', acc)
    json.dump(acc['logs'], open(os.path.join(run.outdir, 'staff_log.json'), 'w'), ensure_ascii=False, indent=0)
    run.note('每一張的顧攤的人讀數存在 %s' % os.path.join(run.outdir, 'staff_log.json'))
    lim = (acc['logs'][-1]['lim'] if acc['logs'] else None) or 35
    run.check('LOD 有作用：每一張都沒有畫到鏡頭 %s m 外的顧攤的人（容許 1 m：人在走）' % lim, not acc['over'], J(acc['over'][:12]))
    run.check('走的途中有畫出顧攤的人（不是全部藏起來；累計 %d 人次）' % acc['drawn'], acc['drawn'] > 0)
    run.check('沒有在鏡頭 %d m 內、畫面裡突然出現／消失，也沒有頭高跳動（變形）' % (lim - 2), not acc['bad'], J(acc['bad'][:12]))


FUNCS = {'lobby': lobby, 'cafe': cafe, 'dorm5': dorm5, 'fairwalk': fairwalk}


async def main():
    modes = [m.strip() for m in os.environ.get('MODE', 'lobby').split(',') if m.strip()]
    bad = [m for m in modes if m not in FUNCS]
    if bad: print('不認得的 MODE：%s（可以用 %s）' % (bad, '、'.join(FUNCS))); sys.exit(2)
    if not SAVE: print('！找不到存檔 %s：用 GAME.defaults 的新存檔（法律系）' % SAVEF, flush=True)
    rc = 0; res = []
    async with async_playwright() as p:
        for m in modes:
            out = os.path.join(OUT, m); run = L.Run('audit2_' + m, out)
            print('==== MODE %s：%s｜SHA %s｜%s ====' % (m, DESC[m], SHA, URL), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
            try:
                run.check('遊戲載入', await fresh(pg))
                await FUNCS[m](pg, cdp, run)
            except Exception as e:
                traceback.print_exc(); run.check('%s 跑完' % m, False, str(e)[:300])
            run.check('沒有 JS 例外', not errs, J(errs[:3]))
            print('SHA', SHA, 'MODE', m, flush=True)
            try: await b.close()
            except Exception: pass
            r = run.finish(); rc |= r; res.append((m, r, list(run.fails), out))
    print('==== audit2 總結（SHA %s）====' % SHA)
    for m, r, fails, out in res:
        print('  %s：%s｜%s｜截圖 %s' % (m, 'ALL PASS' if not r else 'FAILED %d 項：%s' % (len(fails), '、'.join(fails)[:400]), DESC[m], out))
    sys.exit(rc)
asyncio.run(main())
