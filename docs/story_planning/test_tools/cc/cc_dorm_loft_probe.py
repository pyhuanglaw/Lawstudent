"""CC-C（帳號 C）11-04：美術截圖 B——ART-DORM-LOFT 宿舍 203 四人房（Y1S1，法律系那一年）白天、晚上各一輪（BB-C 13:54；D120 BB 判）。只截圖，不判美術。
  角度（BB-C 原文）：門口往裡、四張上舖床各從下面往上看、四張書桌坐下來的玩家視角、爬梯子上下（連拍 3 張）、洗手間門開和關、窗戶那面牆。
  做法：
    - 【前置／捷徑】讀檔到宿舍房間（法律系 stage、Y1S1 第 7 天、14:00／21:30、晴、條件事件關閉）；室友（NPC）照 cc_det.HIDE_PEOPLE_JS 藏起來（看房間，不看人）。
    - 固定鏡頭（E.cinematic）的照片：玩家也藏（cinematic 時樹幹透視不作用，上舖不會變網點）。鏡頭座標都照 DORM_ROOM（src/data/dorm_room_layout.js）算，不寫死：
        door_in＝門口 (0, 1.6, 出口 z−0.1) 往後牆窗戶看；back_to_door＝後牆窗前往門口看（洗手間隔間、門、鞋櫃）；
        bed_under_<組>＝走道上、那一組床桌的中間，眼睛 1.2 m 往床板、床欄看（從下面往上）；
        desk_eye_<組>＝那一組的椅子座位、坐著的眼睛高度 1.18 m，往書桌中心看（四組都拍；遊戲裡只有 L2 是玩家的，其他三組是室友的座位，只是借用鏡頭）；
        bath_door＝走道往洗手間的門看（門關著）；window_wall＝房間中間往後牆窗戶看。
    - desk_game_L2＝玩家真的坐在自己的書桌（GAME.sitAt＝[捷徑]，沒有走過去、沒有開選單）以後，遊戲的跟隨鏡頭（有樹幹透視＝遊戲本來的樣子）。
    - 爬梯子（L2，玩家自己的床；玩家要看得到）：
        上去＝STORY._bedFx.goToBed＋STORY.SLEEP_FULL=true【捷徑】——遊戲預設（BUG-SLEEP-CINEMATIC-1103，使用者 11-03）已經不演上床，淡出就直接在床上；
              這裡叫原本留著的完整演出（goToBedFull），只為了看梯子和爬的樣子。
        下來＝STORY._bedFx.wakeUp（醒來：躺一下、睜眼、getUp 爬下來；遊戲現在照常會演）。
        連拍：GAME.sleep 包一層，玩家的 y 到第 1、3、5 階（上去）／第 4、2、1 階（下來）時先停住演出、等畫面畫好再截圖、再放行（演出是 setTimeout 走的，不停住的話截圖會晚好幾階）。
    - 洗手間門：遊戲裡沒有開門的狀態（模型只有一扇固定的門；互動提示也寫「洗手間（門關著）」）→ 只拍關著的。
        （11-04 雲端第一輪試過把 WALL_bath_w_bdoor 藏起來看裡面：門照樣在（正式模型載入時合併過），而且那不是遊戲畫面，拿掉了）
    - 1280×720 JPEG；HUD 藏起來（坐下、爬梯子那幾張照遊戲本來的樣子，不動 HUD）。Windows＋GPU ≠ iPhone。
  參考圖：使用者 2026-10-17 01:0x 給 LAWWW2-B 的實際宿舍照片**有人入鏡、沒有放進 repo**（claude/second-ai-env-art 的 docs/art-rebuild/second_ai/test_shots/dorm_loft/README.md）；
    repo 裡最接近照片角度的是 Blender 算圖 v1_photo_like.webp（同一個資料夾，「從走道看阿凱那一組」）。
CC_02 清單 2026-11-14：（只加「等素材載完」）1✓（第 7 天照舊） 2✓（座標照 DORM_ROOM） 3n/a（不挑座位） 4n/a（不點） 5n/a（不走路） 6✓（mesh 數穩定 4 秒＋ASSETS 沒有下載中的） 7✓（lint） 8n/a（不存讀檔） 9✓（每張截圖） 10✓（捷徑都標【捷徑】） 11✓ 12✓（FAIL_SETUP：讀檔進到宿舍、有 DORM_ROOM） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests [HOURS=14,21.5] [ONLY=door_in,ladder,...] [CC_SEED=...] python3 cc_dorm_loft_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,21.5').split(',') if h.strip()]
ONLY = [s.strip() for s in (os.environ.get('ONLY') or '').split(',') if s.strip()]
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def want(key):
    return not ONLY or any(key == o or key.startswith(o) for o in ONLY)


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
AIM = """(async([e,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,150)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles}; })"""
FRAMES = """(async n=>{ const E=GAME.E, f0=E.frame; for(let i=0;i<300&&E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,100)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles, frames:E.frame-f0}; })"""
# 房間現況：配置、正式模型載好了沒、哪一年的家具、窗景
ROOM = r"""(()=>{ const E=GAME.E, z=E.zone, R=(typeof DORM_ROOM!=='undefined')?DORM_ROOM:null; if(!R) return null;
  const U={}; for(const u of R.units) U[u.id]={block:u.block, seat:u.seat, desk_center:u.desk_center, desk_top_y:u.desk_top_y, bed_top_y:u.bed_top_y, sleep:u.sleep};
  let door=null; if(z&&z.dormRoot){ const d=z.dormRoot.getObjectByName('WALL_bath_w_bdoor'); door=d?{visible:d.visible}:'沒有這個節點'; }
  return {version:R.version, room:R.room, window:R.window, bath:R.bath, units:U, player_unit:R.player_unit, glb:!!(z&&z.dormRoot), set:z&&z.dormSetKey, zone:GAME.G.zone, stage:GAME.G.stage, day:GAME.G.day, hour:GAME.G.hour, bathDoor:door}; })()"""
# 演出停在某一階：GAME.sleep 包一層（bedTween 每一小步都呼叫 GM.sleep；演出是 setTimeout 走的）
GATE = r"""(()=>{ if(window.__ccGate) return true; const G={hold:false, held:null, waiters:[], marks:[], dir:0, s0:GAME.sleep};
  G.check=()=>{ if(G.hold||!G.marks.length) return; const y=GAME.E.player.obj.position.y, m=G.marks[0]; if((G.dir>0&&y>=m)||(G.dir<0&&y<=m)){ G.marks.shift(); G.hold=true; G.held={mark:m, y:+y.toFixed(3), pose:GAME.E.player.pose}; } };
  GAME.sleep=function(ms){ return G.s0.call(this,ms).then(()=>new Promise(r=>{ G.check(); if(!G.hold) r(); else G.waiters.push(r); })); };
  G.release=()=>{ G.hold=false; G.held=null; const w=G.waiters.splice(0); for(const r of w) r(); };
  window.__ccGate=G; return true; })()"""


ASSET_PENDING_JS = r"""(()=>{ if(typeof ASSETS==='undefined'||!ASSETS.status) return {n:-1, keys:[]}; const err=new Set((ASSETS.errors||[]).map(e=>e&&(e.key||e.k||e.id)||String(e)));
  const keys=Object.keys(ASSETS.status).filter(k=>!(ASSETS.cache&&ASSETS.cache[k])&&!err.has(k)); return {n:keys.length, keys:keys.slice(0,12)}; })()"""


async def wait_assets(pg, cap=20.0, extra_ms=1000):   # 同 cc_d141_lib.wait_assets
    t0 = time.time(); r = await pg.evaluate(ASSET_PENDING_JS)
    while r['n'] > 0 and time.time() - t0 < cap:
        await pg.wait_for_timeout(250); r = await pg.evaluate(ASSET_PENDING_JS)
    await pg.wait_for_timeout(extra_ms)
    return {'waited_s': round(time.time() - t0, 2), 'pending': r['n'], 'keys': r['keys']}


async def stable(pg, cap=90):
    last = -1; st = 0; t1 = time.time()
    while time.time() - t1 < cap:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 4: break
    return last, time.time() - t1


async def shot(pg, name, e, l, meta, note):
    await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
    await pg.evaluate(cc_det.HIDE_LABELS_JS)
    ri = await pg.evaluate(AIM + '(%s)' % J([e, l]))
    await pg.wait_for_timeout(300)
    await pg.screenshot(path=os.path.join(OUT, name + '.jpg'), type='jpeg', quality=88)
    meta[name] = dict(ri, cam=e, look=l, note=note)
    print('  %s：calls %s、tris %s｜%s' % (name, ri['calls'], ri['tris'], note), flush=True)


async def ladder(pg, tag, meta, sc_marks, down):
    """上去（down=False）或下來：停在 sc_marks 的高度各截一張"""
    await pg.evaluate("(([m,d])=>{ const G=window.__ccGate; G.release(); G.marks=m.slice(); G.dir=d; })(%s)" % J([sc_marks, -1 if down else 1]))
    if down: await pg.evaluate("window.__ccLad=null; void STORY._bedFx.wakeUp(GAME, STORY.sleepSceneOf(GAME)).then(()=>{ window.__ccLad='done'; }, e=>{ window.__ccLad='err:'+e; })")   # wakeUp＝遊戲醒來的那一段（sceneBegin 藏 HUD、躺一下、getUp 爬下來）
    else: await pg.evaluate("window.__ccLad=null; STORY.SLEEP_FULL=true; void STORY._bedFx.goToBed(GAME, STORY.sleepSceneOf(GAME)).then(ok=>{ window.__ccLad='done:'+ok; }, e=>{ window.__ccLad='err:'+e; })")
    got = []; t0 = time.time()
    while len(got) < len(sc_marks) and time.time() - t0 < 60:
        h = await pg.evaluate("window.__ccGate.held")
        if h:
            fr = await pg.evaluate(FRAMES + '(4)')
            name = 'ladder_%s_%d_%s' % ('down' if down else 'up', len(got) + 1, tag)
            await pg.screenshot(path=os.path.join(OUT, name + '.jpg'), type='jpeg', quality=88)
            cam = await pg.evaluate("(()=>{ const c=GAME.E.camera.position; return [+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)]; })()")
            meta[name] = dict(fr, held=h, cam=cam, note=('爬下來（wakeUp→getUp＝遊戲照常會演）' if down else '爬上去（goToBedFull＝【捷徑】遊戲預設不演）') + '：第 %d 張，玩家 y=%s' % (len(got) + 1, h['y']))
            print('  %s：玩家 y=%s（停在 %s）、姿勢 %s、鏡頭 %s' % (name, h['y'], h['mark'], h['pose'], cam), flush=True)
            got.append(name)
            await pg.evaluate("window.__ccGate.release()")
        await pg.wait_for_timeout(60)
    await pg.evaluate("window.__ccGate.marks=[]; window.__ccGate.release()")
    t1 = time.time()
    while time.time() - t1 < 30:
        st = await pg.evaluate("window.__ccLad")
        if st: break
        await pg.wait_for_timeout(200)
    return got, await pg.evaluate("window.__ccLad")


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC ART-DORM-LOFT 宿舍 203 四人房：%s；SHA=%s；Windows＋GPU ≠ iPhone' % ('、'.join('%05.2f' % h for h in HOURS), os.environ.get('SHA', '?')), flush=True)
    meta = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
        for hour in HOURS:
            tag = '%04d' % int(round(hour * 100))
            print('  [前置／捷徑] 讀檔：宿舍房間（法律系、第 7 天）%05.2f、晴、條件事件關閉' % hour, flush=True)
            await L.load_state(pg, {'zone': 'dorm', 'stage': 'law', 'hour': hour, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.1416, 'lv': 0}}, quiet_events=True)
            n, sec = await stable(pg)
            wa = await wait_assets(pg); print('  [%s] 等素材載完：%s' % (tag, J(wa)), flush=True)   # CC-C 11-14（CC_02 乙 BG3D）：mesh 數穩定以外，再等 ASSETS 沒有還在下載的
            await L.close_panels(pg, cdp)
            R = await pg.evaluate(ROOM)
            if not check('[%s] FAIL_SETUP 檢查：讀檔進到宿舍房間、有 DORM_ROOM（場景 mesh %s、%.0f 秒穩定）' % (tag, n, sec), bool(R) and R['zone'] == 'dorm', J(R and {k: R[k] for k in ('version', 'glb', 'set', 'stage', 'day', 'hour', 'bathDoor')})): continue
            check('[%s] 正式模型 dorm_room4.glb 載好了、家具是 203（法律系大一）' % tag, R['glb'] and R['set'] == '203', 'glb=%s set=%s' % (R['glb'], R['set']))
            RM, U = R['room'], R['units']
            await pg.evaluate(HUD + '(false)')
            ex = RM['exit']; back = -RM['d'] / 2
            fixed = [('door_in', [ex[0], 1.6, ex[1] - 0.1], [0, 1.35, back], '門口往裡看（往後牆窗戶）'),
                     ('back_to_door', [0, 1.6, back + 0.7], [0, 1.25, RM['d'] / 2], '後牆窗前往門口看（洗手間隔間、門、鞋櫃）'),
                     ('window_wall', [0, 1.55, 0.6], [0, 1.65, back], '房間中間往窗戶那面牆看')]
            for uid in ('R1', 'R2', 'L1', 'L2'):
                u = U[uid]; s = 1 if u['block']['x'][0] > 0 else -1; cz = (u['block']['z'][0] + u['block']['z'][1]) / 2
                fixed.append(('bed_under_' + uid, [-s * 0.75, 1.25, round(cz + 0.9, 3)], [s * 1.45, (u['bed_top_y'] or 1.86) + 0.25, round(cz - 0.3, 3)], '%s 的上舖：站在走道對面從下面往上看（床欄、床板、梯子）' % uid))   # 11-04 雲端第一輪 0.3 m 太近，只看到床板底
            for uid in ('R1', 'R2', 'L1', 'L2'):
                u = U[uid]; st = u['seat']; dc = u['desk_center']
                fixed.append(('desk_eye_' + uid, [st['x'], 1.18, st['z']], [dc[0], (u['desk_top_y'] or 0.76) + 0.2, dc[1]], '%s 的書桌：坐著的眼睛高度往書桌看%s' % (uid, '（玩家自己的）' if uid == R['player_unit'] else '（室友的座位，只借鏡頭）')))
            bt = R['bath']; bz = (bt['door_z'][0] + bt['door_z'][1]) / 2; bx = bt['door_face_x']
            fixed.append(('bath_door', [round(bx - 1.3, 3), 1.6, round(bz - 1.1, 3)], [bx, 1.2, bz], '洗手間的門（遊戲裡門一直關著，沒有打開的狀態）'))
            for key, e, l, note in fixed:
                if want(key): await shot(pg, '%s_%s' % (key, tag), e, l, meta, note)
            await pg.evaluate("GAME.E.endCinematic&&GAME.E.endCinematic()")
            await pg.evaluate(cc_det.SHOW_PEOPLE_JS); await pg.evaluate(cc_det.HIDE_PEOPLE_JS)   # 室友再藏一次（中間有沒有新生的）
            await pg.evaluate("GAME.E.player.obj.visible=true")
            await pg.evaluate(HUD + '(true)')
            pu = U[R['player_unit'] or 'L2']
            if want('desk_game'):
                await pg.evaluate("(st=>{ const E=GAME.E; GAME.sitAt(E.player, st); })(%s)" % J(pu['seat']))
                await pg.wait_for_timeout(2500); fr = await pg.evaluate(FRAMES + '(6)')
                name = 'desk_game_%s_%s' % (R['player_unit'] or 'L2', tag)
                await pg.screenshot(path=os.path.join(OUT, name + '.jpg'), type='jpeg', quality=88)
                sat = await pg.evaluate("(()=>{ const P=GAME.E.player; return {seat:!!P.seat, pose:P.pose, pos:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)], cam:GAME.E.cam.mode}; })()")
                meta[name] = dict(fr, sat=sat, note='玩家坐在自己的書桌（GAME.sitAt＝【捷徑】）以後的跟隨鏡頭')
                check('[%s] 玩家坐在自己的書桌（L2）' % tag, sat['seat'], J(sat))
                await pg.evaluate("(()=>{ const P=GAME.E.player; if(P.seat&&GAME.standUp) GAME.standUp(P); })()"); await pg.wait_for_timeout(800)
            if want('ladder'):
                await pg.evaluate(GATE)
                ap = await pg.evaluate("(()=>{ const sc=STORY.sleepSceneOf(GAME); return sc?sc.approach:null; })()")
                if not check('[%s] STORY.sleepSceneOf 拿得到玩家那一組的梯子資料' % tag, bool(ap), J(ap)): continue
                await pg.evaluate("(a=>{ const o=GAME.E.player.obj; o.position.x=a[0]; o.position.z=a[1]; })(%s)" % J(ap)); await pg.wait_for_timeout(600)
                up, st_up = await ladder(pg, tag, meta, [0.30, 0.94, 1.58], False)
                check('[%s] 爬上去連拍 3 張' % tag, len(up) == 3, '%d 張；演出結束 %s' % (len(up), st_up))
                await pg.wait_for_timeout(800)
                dn, st_dn = await ladder(pg, tag, meta, [1.30, 0.66, 0.34], True)
                check('[%s] 爬下來連拍 3 張' % tag, len(dn) == 3, '%d 張；演出結束 %s' % (len(dn), st_dn))
                await pg.evaluate("STORY.SLEEP_FULL=false")
        await pg.evaluate("localStorage.clear()")
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'dorm_loft_shots.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('INFO 一共 %d 張；美術判定歸 BB（D120），這支只截圖' % len(meta), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
