"""BB（帳號 A）2026-10-22：RELEASE-9106-TEST（LAWWW 12:04 派）第 7～12 項的畫面測試——LAWWW2 的美術修正。
美術過不過由使用者判（角色美術由 LAWWW 驗收，D100）；BB 這裡只看「說好要改掉的東西是不是真的不見了、有沒有弄壞別的」，同一個腳本在修改前（v9.10.5 候選 9c74f08d）也跑一次對照。
  CEIL     第 7 項 天花板（cf82803b 第二版、4d3a305d 第四版、249ae526 118 巷九間店）：201、男宿門廳、霖澤館 2F、萬才館 2F、118 巷九間店——
           預設鏡頭一張；照玩家「兩指捏合」拉到最遠、單指往下拖到最陡一張（量畫面白色的比例：整片白＝FAIL）；再單指往上拖到最平一張（看燈板、燈箱還在不在）
  SKIRT    第 8 項 沛珊長裙上下樓梯（2181fe4d）：霖澤館樓梯，沛珊從樓梯下走到二樓再走回來，每秒一張（不用 ?turbo，人真的走）
  SHELTER  第 9 項 美國校園候車亭（4d3a305d）：找屋頂（usu_shelter_roof）的位置，站旁邊一張、擋住鏡頭時網點透空一張
  NM3      第 10 項 男宿路人 nm3 耳上短髮（eece763b）：男宿門廳近拍（正面、側面、背面）
  GG       第 11 項 公館 15:00 人行道那排斜亮條（465c9554）：南側騎樓外的人行道，三個位置、兩個方向
  LOD      第 12 項 遠距離路人低面數（91c5c7ea）：椰林大道 15:00 兩個位置，每 0.25 秒記每個路人的距離與遠近版本 40 秒（同一個人 2 秒內換兩次以上＝閃）；
           遠近和距離對不對（28 m 內一定是原本的、30 m 外是遠距離版本）；draw call、三角形和 ?nofar 比；同一個位置 now／nofar 各一張
【前置／捷徑】讀使用者 9/25 存檔（quiet_events）；GAME.enter 進區域、設時間、搬玩家、藏玩家（拍人物時）、生出沛珊／nm3（GM.spawnCharacter／GM.spawnNPC）。
鏡頭的「最遠、最陡」用真的觸控手勢（CDP 兩指、單指）。Playwright 手機橫向 844×390、SwiftShader，不是 iPhone。
用法：LW_TESTS=<那一版>/tests SCEN=CEIL,LOD,... python3 v6art_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>   （SKIRT 自己把 ?turbo 拿掉）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = [s for s in os.environ.get('SCEN', '').split(',') if s] or ['CEIL', 'SHELTER', 'NM3', 'GG', 'LOD', 'SKIRT']
TAG = os.environ.get('TAG', 'v6')
def say(*a): print(' '.join(str(x) for x in a), flush=True)
def J(x, n=400): return json.dumps(x, ensure_ascii=False)[:n]

CAM = "(()=>{ const C=GAME.E.cam, k=GAME.E.camera; return {dist:+(+C.distTarget).toFixed(2), pitch:+(+C.pitch).toFixed(3), yaw:+(+C.yaw).toFixed(2), camY:+k.position.y.toFixed(2), indoor:!!GAME.E.indoor, zone:GAME.G.zone, lv:GAME.E.player.lv|0, h:+(+GAME.G.hour).toFixed(2)}; })()"
DRAW = "(()=>{ const E=GAME.E, R=E.renderer; E.render(); return {calls:R.info.render.calls, tris:R.info.render.triangles}; })()"


def white_frac(path):
    im = Image.open(path).convert('RGB'); w, h = im.size; im = im.resize((w // 4, h // 4)); px = list(im.getdata())
    return round(sum(1 for r, g, b in px if r > 232 and g > 232 and b > 232) / len(px), 3)


async def page(p, url=None):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(url or URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base)
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000)
    return b, pg, cdp, errs


async def calm(pg, cdp):
    for _ in range(3):
        n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
        if not (n or shut): break
        await pg.wait_for_timeout(1200)


async def enter(pg, cdp, zone, spawn, hour, wait=18000):
    await pg.evaluate("(async([z,s,h])=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z, s||undefined); })(%s)" % json.dumps([zone, spawn, hour]))
    await pg.wait_for_timeout(wait); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % hour); await calm(pg, cdp); await pg.wait_for_timeout(3000)


async def pinch_in(pg, cdp, cx=470, cy=210):
    """兩指從 300 px 捏到 60 px（拉遠）"""
    a0, b0, a1, b1 = cx - 150, cx + 150, cx - 30, cx + 30
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': a0, 'y': cy, 'id': 1}, {'x': b0, 'y': cy, 'id': 2}]})
    for i in range(1, 11):
        t = i / 10
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': a0 + (a1 - a0) * t, 'y': cy, 'id': 1}, {'x': b0 + (b1 - b0) * t, 'y': cy, 'id': 2}]}); await pg.wait_for_timeout(60)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await pg.wait_for_timeout(500)


async def drag_v(pg, cdp, down=True, n=2, cx=470):
    # BB-B 10-23：往下拖原本從 y=90 起手，201 教室俯角完全沒變（往上拖從 y=330 起手就有變）＝起手點落在畫面上方的 UI 上；改從畫面中段起手，並記下起手點是什麼元素
    for _ in range(n):
        y0, y1 = (130, 375) if down else (330, 90)
        el = await pg.evaluate("(([x,y])=>{ const e=document.elementFromPoint(x,y); return e?(e.id||e.tagName)+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''):null; })(%s)" % json.dumps([cx, y0]))
        DRAG_AT.append(el)
        await L.drag(pg, cdp, cx, y0, cx, y1, steps=12); await pg.wait_for_timeout(400)
DRAG_AT = []


async def hide_hud(pg, on=True):
    await pg.evaluate("(on=>{ for(const id of ['joy','minimap','hud','topbar','btnPhone','interact']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'hidden':''; } })(%s)" % ('true' if on else 'false'))


# ---------------------------------------------------------------- 第 7 項 天花板
CEILS = [('classroom', None, '201 階梯教室'), ('dorm_hall', None, '男宿門廳'), ('linze', {'x': -2.0, 'z': -6.0, 'lv': 1, 'yaw': 0}, '霖澤館 2F（201 門口）'),
         ('wancai', {'x': 0.0, 'z': -4.2, 'lv': 1, 'yaw': 0}, '萬才館 2F 北側走廊')] + [('l118_' + k, None, '118 巷 ' + k) for k in ('cafe2', 'dian', 'home', 'korea', 'noodle2', 'omu', 'pasta', 'self', 'tea')]


async def s_ceil(p, run, out):
    b, pg, cdp, errs = await page(p); res = out.setdefault('CEIL', {})
    run.setup('[捷徑] 讀 9/25 存檔；每一間 GAME.enter（13:00），霖澤館、萬才館直接放在二樓')
    try:
        for zone, spawn, name in CEILS:
            r = res.setdefault(zone, {'name': name})
            try:
                await enter(pg, cdp, zone, spawn, 13.0)
                z = await pg.evaluate("GAME.G.zone"); r['in'] = z
                if z != zone: run.check('%s：進得去（%s）' % (name, zone), False, z); continue
                r['def'] = await pg.evaluate(CAM); p0 = await run.shot(pg, '%s_%s_def' % (TAG, zone)); r['def']['white'] = white_frac(p0)
                await pinch_in(pg, cdp); await drag_v(pg, cdp, down=True); await pg.wait_for_timeout(2500)
                r['far'] = await pg.evaluate(CAM); r['far']['dragAt'] = DRAG_AT[-2:]; p1 = await run.shot(pg, '%s_%s_far' % (TAG, zone)); r['far']['white'] = white_frac(p1)
                await drag_v(pg, cdp, down=False, n=3); await pg.wait_for_timeout(2500)
                r['flat'] = await pg.evaluate(CAM); p2 = await run.shot(pg, '%s_%s_flat' % (TAG, zone)); r['flat']['white'] = white_frac(p2)
                say('   %s %s：預設 %s｜最遠最陡 %s｜最遠最平 %s' % (TAG, name, J(r['def'], 200), J(r['far'], 200), J(r['flat'], 200)))
                gest = r['far']['dist'] >= (6 if r['far']['indoor'] else 11) - 0.05 and r['far']['pitch'] >= 1.0
                run.check('%s：兩指拉到最遠、往下拖到最陡（距離 %.2f、俯角 %.2f）' % (name, r['far']['dist'], r['far']['pitch']), gest, J(r['far']))
                run.check('%s：最遠最陡不是整片白（白色 %.0f%%）' % (name, r['far']['white'] * 100), r['far']['white'] < 0.5, J(r['far']))
            except Exception as e:
                r['err'] = str(e)[:300]; run.check('%s：拍完' % name, False, str(e)[:300])
            json.dump(out, open(os.path.join(OUT, 'v6art.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('天花板：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


# ---------------------------------------------------------------- 第 8 項 沛珊長裙上下樓梯
async def s_skirt(p, run, out):
    url = URL.replace('?turbo&', '?').replace('?turbo', '').replace('&turbo', '')
    b, pg, cdp, errs = await page(p, url); res = out.setdefault('SKIRT', {})
    run.setup('[捷徑] 讀 9/25 存檔；不用 ?turbo（人真的走）；GAME.enter 霖澤館 13:00，玩家放在二樓樓梯口、藏起來；GM.spawnCharacter 生出沛珊在樓梯下，GAME.walkTo 叫她走上二樓再走下來')
    try:
        await enter(pg, cdp, 'linze', {'x': -6.6, 'z': -4.6, 'lv': 1, 'yaw': 0}, 13.0, wait=25000)
        ok = await pg.evaluate("""(()=>{ const GM=GAME, E=GM.E; E.player.obj.visible=false; const n=GM.spawnCharacter('classmate_peishan',-6.6,6.4,{lv:0}); if(!n) return null;
          window.__PS=n; return {id:n.id, at:[n.obj.position.x,n.obj.position.z,n.lv|0]}; })()""")
        res['spawn'] = ok; say('   %s 沛珊：%s' % (TAG, J(ok)))
        if not ok: run.check('沛珊：生得出來', False, ''); return
        await pg.wait_for_timeout(15000)   # 等她的 VRM
        model = await pg.evaluate("(()=>{ const u=window.__PS.obj.userData; return {model:u.wantModel||null, vrm:!!u.vrm}; })()"); res['model'] = model
        await hide_hud(pg, True)
        for leg, tgt, lv in (('up', [-6.6, -4.0], 1), ('down', [-6.6, 6.4], 0)):
            # 鏡頭：她的前方（上樓時從樓上往下看她、下樓時從樓下往上看她），斜 35°
            await pg.evaluate("(([t,lv])=>{ window.__PSDONE=false; GAME.walkTo(window.__PS,t[0],t[1],{lv}).then(v=>{ window.__PSDONE=true; }); })(%s)" % json.dumps([tgt, lv]))
            frames = []
            for i in range(45):
                st = await pg.evaluate("""(up=>{ const n=window.__PS, o=n.obj, E=GAME.E, C=E.cam, k=E.camera; const p=o.position;
                  const yaw=up?0.6:Math.PI+0.6; E.cinematic(new THREE.Vector3(p.x+Math.sin(yaw)*2.6, p.y+1.25, p.z+Math.cos(yaw)*2.6), new THREE.Vector3(p.x,p.y+0.75,p.z)); E.snapCinematic();
                  return {x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, done:!!window.__PSDONE}; })(%s)""" % ('true' if leg == 'up' else 'false'))
                pth = await run.shot(pg, '%s_skirt_%s_%02d' % (TAG, leg, i)); frames.append(st)
                if st['done']: break
                await pg.wait_for_timeout(700)
            res[leg] = frames; say('   %s 沛珊 %s：%d 張，最後 %s' % (TAG, leg, len(frames), J(frames[-1])))
            run.check('沛珊 %s：走完（%s）' % ('上樓' if leg == 'up' else '下樓', J(frames[-1])), frames[-1]['done'] and frames[-1]['lv'] == lv, J(frames[-3:]))
        run.check('沛珊：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


# ---------------------------------------------------------------- 第 9 項 美國校園候車亭
SHELTER_AT = """(()=>{ const box=new THREE.Box3(), b=new THREE.Box3(); let n=0; GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; const ms=[].concat(o.material); if(ms.some(m=>m&&/usu_shelter_roof/.test(m.name||''))){ b.setFromObject(o); box.union(b); n++; } });
  if(!n) return null; const c=box.getCenter(new THREE.Vector3()), s=box.getSize(new THREE.Vector3()); return {n, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], s:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}; })()"""
ROOF = """(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)) if(m&&/usu_shelter_roof/.test(m.name||'')&&!out.some(x=>x.name===m.name)) out.push({name:m.name, color:m.color?m.color.getHexString():null, metal:m.metalness, rough:m.roughness, seeThrough:!!(m.userData&&m.userData.seeThrough)}); }); return out; })()"""


async def s_shelter(p, run, out):
    b, pg, cdp, errs = await page(p); res = out.setdefault('SHELTER', {})
    run.setup('[捷徑] 讀 9/25 存檔；GAME.enter 美國校園 13:00；玩家搬到候車亭旁邊')
    try:
        await enter(pg, cdp, 'us_campus', None, 13.0, wait=25000)
        at = await pg.evaluate(SHELTER_AT); res['at'] = at; res['roof'] = await pg.evaluate(ROOF); say('   %s 候車亭：%s 屋頂材質 %s' % (TAG, J(at), J(res['roof'])))
        run.check('候車亭：美國校園裡有候車亭屋頂（usu_shelter_roof）', bool(at), J(at))
        if not at: return
        cx, cz = at['c'][0], at['c'][2]
        for k, (dx, dz, yaw) in enumerate(((3.5, 0, 1.5708), (0, 3.5, 0.0), (-3.5, 0, -1.5708))):
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y; GAME.E.cam.yaw=y+Math.PI; GAME.E.cam.manualT=0; })(%s)" % json.dumps([cx + dx, cz + dz, yaw]))
            await pg.wait_for_timeout(3500); await run.shot(pg, '%s_shelter_%d' % (TAG, k))
        # 擋住鏡頭：玩家站在屋頂正下方、鏡頭拉遠壓低，屋頂在玩家和鏡頭中間
        await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.obj.position.set(x,P.obj.position.y,z); const C=GAME.E.cam; C.distTarget=11; C.pitch=0.9; C.manualT=60; })(%s)" % json.dumps([cx, cz]))
        await pg.wait_for_timeout(3500); await run.shot(pg, '%s_shelter_under' % TAG)
        run.check('候車亭：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


# ---------------------------------------------------------------- 第 10 項 男宿路人 nm3
async def s_nm3(p, run, out):
    b, pg, cdp, errs = await page(p); res = out.setdefault('NM3', {})
    run.setup('[捷徑] 讀 9/25 存檔；GAME.enter 男宿門廳 13:00；GM.spawnNPC 生一個 nm3 底模的路人站在玩家前面；鏡頭近拍（正面、側面、背面）')
    try:
        await enter(pg, cdp, 'dorm_hall', None, 13.0)
        r = await pg.evaluate("""(()=>{ const GM=GAME, P=GM.E.player.obj; const x=P.position.x+Math.sin(P.rotation.y)*1.6, z=P.position.z+Math.cos(P.rotation.y)*1.6;
          const n=GM.spawnNPC('nm3_test',{id:'nm3_test',model:'char.npc_nm3',name:'路人'},x,z,{yaw:P.rotation.y+Math.PI}); window.__NM=n; return n?{at:[+x.toFixed(2),+z.toFixed(2)]}:null; })()""")
        res['spawn'] = r
        if not r: run.check('nm3：生得出來', False, ''); return
        await pg.wait_for_timeout(15000)
        res['model'] = await pg.evaluate("(()=>{ const u=window.__NM.obj.userData; return {want:u.wantModel||null, vrm:!!u.vrm}; })()")
        await pg.evaluate("GAME.E.player.obj.visible=false"); await hide_hud(pg, True)
        for k, a in enumerate((0.0, 1.5708, 3.1416, 0.6)):
            await pg.evaluate("""(a=>{ const n=window.__NM, o=n.obj, E=GAME.E, k=E.camera; const p=o.position, yaw=o.rotation.y+a;
              E.cinematic(new THREE.Vector3(p.x+Math.sin(yaw)*1.0, p.y+1.62, p.z+Math.cos(yaw)*1.0), new THREE.Vector3(p.x,p.y+1.55,p.z)); E.snapCinematic(); })(%s)""" % a)
            await pg.wait_for_timeout(2500); await run.shot(pg, '%s_nm3_%d' % (TAG, k))
        say('   %s nm3：%s' % (TAG, J(res)))
        run.check('nm3：模型是 char.npc_nm3 的 VRM', bool(res['model'].get('vrm')), J(res['model']))
        run.check('nm3：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


# ---------------------------------------------------------------- 第 11 項 公館 15:00 人行道
GG_SPOTS = [(-20, 17.2, 1.5708), (10, 17.2, 1.5708), (40, 17.2, -1.5708)]


async def s_gg(p, run, out):
    b, pg, cdp, errs = await page(p); res = out.setdefault('GG', {})
    run.setup('[捷徑] 讀 9/25 存檔；GAME.enter 公館 15:00；玩家搬到南側騎樓外的人行道（z 17.2）三個位置')
    try:
        await enter(pg, cdp, 'gongguan', {'x': -20, 'z': 17.2}, 15.0, wait=25000)
        for k, (x, z, yaw) in enumerate(GG_SPOTS):
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y; GAME.E.cam.yaw=y+Math.PI; GAME.E.cam.manualT=0; GAME.G.hour=15; GAME.E.hour=15; })(%s)" % json.dumps([x, z, yaw]))
            await pg.wait_for_timeout(4000); await run.shot(pg, '%s_gg_%d_along' % (TAG, k))
            await pg.evaluate("(()=>{ const C=GAME.E.cam; C.distTarget=11; C.pitch=1.0; C.manualT=60; })()"); await pg.wait_for_timeout(3000); await run.shot(pg, '%s_gg_%d_top' % (TAG, k))
            res[str(k)] = await pg.evaluate(CAM)
        run.check('公館：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


# ---------------------------------------------------------------- 第 12 項 遠距離路人
LOD_SPOTS = {'avenue_mid': (-40, 0, 1.5708), 'avenue_gate': (-104, 0, 1.5708)}
SAMPLE = """(()=>{ const E=GAME.E, cam=E.camera, C=CHAR; const out=[];   /* BB-B 10-23：路人沒有 n.id（全部是 null＝不同的人被當成同一個，「閃」算錯）→ 用 obj.uuid */
  for(const n of E.npcs){ if(!n.isExtra||!n.obj) continue; const o=n.obj, u=o.userData||{}; const d=Math.hypot(cam.position.x-o.position.x,cam.position.z-o.position.z); out.push([n.id||n.charId||o.uuid, +d.toFixed(1), !!u.isFar, !!u.farLOD, o.visible!==false]); }
  for(const x of E.extras){ const rd=x.rider; if(!rd||!x.obj) continue; const u=rd.userData||{}; const d=Math.hypot(cam.position.x-x.obj.position.x,cam.position.z-x.obj.position.z); out.push(['ride:'+(x.id||x.obj.uuid), +d.toFixed(1), !!u.isFar, !!u.farLOD, x.obj.visible!==false]); }
  return {t:performance.now(), rows:out, has:!!C.setFar, off:!!C.farOff}; })()"""


async def lod_page(p, run, res, url, label):
    b, pg, cdp, errs = await page(p, url)
    try:
        await enter(pg, cdp, 'campus', None, 15.0, wait=15000)
        wm = await pg.evaluate("""(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms)); const t0=performance.now();
          for(;;){ const P=CHAR.anonPool, cur=(P&&P.cur)||[]; const ok=cur.every(k=>ASSETS.has(k)); if(ok||performance.now()-t0>90000) return {ok,cur:cur.length,sec:Math.round((performance.now()-t0)/1000)}; await wait(1000); if(GAME.upgradeModels) GAME.upgradeModels(); } })()""")
        res[label] = {'models': wm}
        for name, (x, z, yaw) in LOD_SPOTS.items():
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y; GAME.E.cam.yaw=y+Math.PI; GAME.E.cam.manualT=0; GAME.G.hour=15; GAME.E.hour=15; })(%s)" % json.dumps([x, z, yaw]))
            await pg.wait_for_timeout(6000)
            draws = []
            for _ in range(4): draws.append(await pg.evaluate(DRAW)); await pg.wait_for_timeout(700)
            await run.shot(pg, '%s_lod_%s_%s' % (TAG, name, label))
            samples = []
            if label == 'now':
                t0 = time.time()
                while time.time() - t0 < 40:
                    samples.append(await pg.evaluate(SAMPLE)); await pg.wait_for_timeout(250)
            res[label][name] = {'draws': draws, 'samples': samples}
            say('   %s LOD %s %s：draw %s；取樣 %d 次' % (TAG, label, name, J(draws, 300), len(samples)))
        return errs
    finally:
        await b.close()


def lod_judge(run, res):
    now = res.get('now', {}); off = res.get('nofar', {})
    for name in LOD_SPOTS:
        S = (now.get(name) or {}).get('samples') or []
        if not S: run.check('LOD %s：有取樣' % name, False, ''); continue
        has = S[0]['has']; hist = {}; bad_state = []
        for s in S:
            for nid, d, far, lod, vis in s['rows']:
                h = hist.setdefault(nid, []); h.append((s['t'], d, far, lod, vis))
                if lod and far and d < 28 - 0.6: bad_state.append([nid, d, 'far 但在 28 m 內'])
                if lod and (not far) and d > 30 + 0.6: bad_state.append([nid, d, '原本的但在 30 m 外'])
        flips = []; flaps = []
        for nid, h in hist.items():
            ts = [h[i][0] for i in range(1, len(h)) if h[i][2] != h[i - 1][2]]
            for i in range(1, len(h)):
                if h[i][2] != h[i - 1][2]: flips.append([nid, round(h[i][1], 1), 'far' if h[i][2] else 'near'])
            for i in range(2, len(ts)):
                if ts[i] - ts[i - 2] < 2000: flaps.append([nid, len(ts)])
        nlod = sum(1 for h in hist.values() if any(x[3] for x in h)); nall = len(hist)
        res.setdefault('judge', {})[name] = {'npcs': nall, 'withLOD': nlod, 'flips': flips[:40], 'flaps': flaps[:20], 'bad': bad_state[:20]}
        say('   LOD %s：路人 %d 個（有遠距離版本 %d）；換過 %d 次；閃 %d；距離不對 %d' % (name, nall, nlod, len(flips), len(flaps), len(bad_state)))
        run.check('LOD %s：有遠距離版本（CHAR.setFar）、路人有接上' % name, has and nlod > 0, J(res['judge'][name], 300))
        run.check('LOD %s：同一個人 2 秒內沒有來回換兩次以上（不閃）' % name, not flaps, J(flaps[:6]))
        run.check('LOD %s：28 m 內一定是原本的模型、30 m 外是遠距離版本' % name, not bad_state, J(bad_state[:6]))
        dn = [d['calls'] for d in (now.get(name) or {}).get('draws', [])]; dof = [d['calls'] for d in (off.get(name) or {}).get('draws', [])]
        tn = [d['tris'] for d in (now.get(name) or {}).get('draws', [])]; tof = [d['tris'] for d in (off.get(name) or {}).get('draws', [])]
        if dn and dof:
            run.note('LOD %s：draw call now %s／?nofar %s；三角形 now %s／?nofar %s（路人會走動，數字只看量級）' % (name, dn, dof, tn, tof))


async def s_lod(p, run, out):
    res = out.setdefault('LOD', {})
    run.setup('[捷徑] 讀 9/25 存檔；GAME.enter 校園 15:00；玩家搬到椰林大道兩個位置（LAWWW2 crowd_lod_audit 同一組）；同樣的步驟用 ?nofar 再開一次')
    e1 = await lod_page(p, run, res, None, 'now')
    nofar = URL + ('&' if '?' in URL else '?') + 'nofar'
    e2 = await lod_page(p, run, res, nofar, 'nofar')
    lod_judge(run, res)
    run.check('LOD：沒有 JS 例外', not (e1 or e2), J((e1 or []) + (e2 or []), 300))


FN = {'CEIL': s_ceil, 'SKIRT': s_skirt, 'SHELTER': s_shelter, 'NM3': s_nm3, 'GG': s_gg, 'LOD': s_lod}


async def main():
    run = L.Run('v6art', OUT); out = {}
    async with async_playwright() as p:
        for sid in ['CEIL', 'SHELTER', 'NM3', 'GG', 'LOD', 'SKIRT']:
            if sid not in SCEN: continue
            say('== %s（%s）' % (sid, TAG)); t0 = time.time()
            try: await FN[sid](p, run, out)
            except Exception as e: say('   ! 例外', e); run.check('%s：跑完' % sid, False, str(e)[:300])
            say('   （%s 用了 %.0f 秒）' % (sid, time.time() - t0))
            json.dump(out, open(os.path.join(OUT, 'v6art.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()

asyncio.run(main())
