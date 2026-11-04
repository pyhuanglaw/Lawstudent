"""CC-C（帳號 C）11-04：普通教學館、博雅（遊戲：博思）教學館外觀 v2 的同角度截圖（TEACH-PTBOYA-REF-1104；BB-C 16:30；總表第 107～109 列；D136）。
  修改前＝d3828452a、修改後＝71281be8e，兩邊用同一支探針、同一組鏡頭，只截圖、不判（像不像／太像由 BB 判，D136 兩欄）。
  鏡頭：
    - 照片角度（LAWWW2-C 的 docs/art-rebuild/second_ai/wip/teach_ptboya_1104/cams.json，71281be8e；照抄在 CAMS，修改前那一版沒有這個檔）：
        pt02（putong_web_02，從球場看）、pt03（putong_web_03，正面街景）、by05（boya_web_05，斜坡綠屋頂）、by06（boya_web_06，主入口雨遮）。
        cams.json 是 Blender 的 eye／at／lens（mm，36 mm 寬感光元件，AUTO＝橫向用寬）、1280×960 → 遊戲用垂直 FOV＝2·atan(18／lens／(1280／960))：
        24 mm＝58.7°、26 mm＝54.9°、18 mm＝73.7°。停主迴圈、時刻固定、手動畫一幀（同 cc_ade_v2_shots_probe.py 的 AIM）。PNG（給 same_angle_check）。
    - 玩家平常走過去的視角（每棟兩張；BB-C 16:30）：【前置／捷徑】讀檔把玩家放在路上、朝著那棟，等跟隨鏡頭轉好，照遊戲本來的畫面（玩家在畫面裡），1280×720 JPEG。
        普通：文學院和普通中間的路，從東、西兩邊走過來看門口；博思：普通和博思中間的路往主入口看、湖邊步道往北面看。站的位置在遊戲裡用導航格找（WALK 的說明）。
    - 每張記「畫面正中打到哪一棟」（raycast，ckTag／*_glb）：照片角度被別的建築擋住時印 INFO，另外拍一張藏起擋住那棟的【捷徑】版（HIDE_ALSO：pt02 被文學院擋住）。
  每張都藏路人、騎車的路人（cc_det.HIDE_PEOPLE_JS；走過去那幾張玩家照留）、門上的出口標籤（cc_det.HIDE_LABELS_JS）、HUD。白天 14:00、晴、固定 CC_SEED。
  也記：兩棟的正式模型有沒有接上（campus_putong_glb／campus_boya_glb）、calls／tris。
  學校照片照 list.json 用 tools/ref/fetch_ref_images.py 抓到本機比，不進 repo（CC_50 第 44 條）；比對用 same_angle_check --mode campus（雲端做）。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）、固定鏡頭。Windows＋GPU ≠ iPhone。
用法：LW_TESTS=<wt>/tests [HOUR=14] [ONLY=pt02,by06_walk...] [CC_SEED=...] python3 cc_ptboya_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
HOUR = float(os.environ.get('HOUR') or 14)
ONLY = [s.strip() for s in (os.environ.get('ONLY') or '').split(',') if s.strip()]
FAILS = []
# cams.json（71281be8e）照抄；res 1280×960
CAMS = {'pt02': {'photo': 'putong_web_02', 'eye': [-38, 7, -18], 'at': [-38, 10, -58.5], 'lens': 26, 'note': '正面遠看（從球場）：照片看不到消失點，LAWWW2 手選'},
        'pt03': {'photo': 'putong_web_03', 'eye': [-17.5, 1.6, -45.5], 'at': [-40.58, 11.97, -58.37], 'lens': 24, 'note': '正面街景'},
        'by05': {'photo': 'boya_web_05', 'eye': [-14, 1.6, -116], 'at': [-30.68, 13.42, -84.45], 'lens': 24, 'note': '斜坡綠屋頂（北面）'},
        'by06': {'photo': 'boya_web_06', 'eye': [-28, 1.5, -68], 'at': [-37, 6.5, -74.5], 'lens': 18, 'note': '主入口雨遮（BB-C：雨遮上的天窗洞和照片 06 太像，這一格要特別標）；空橋和照片左右相反（LAWWW2）'}}
RES = (1280, 960)
# 走過去：(代號, 錨點 (x, z), 往外的方向 (dx, dz), 距離, 朝向的點 (x, z), 說明)——站的位置在遊戲裡找：從錨點沿方向走「距離」公尺，
#   站不住（E.nav.clear 半徑 0.4 m）就距離 ±1～4 m、方向 ±8°～24° 找最近站得住的（11-04 雲端第一輪寫死的 (−38,−36)、(−27,−40) 在文學院裡，被引擎移了 6～14 m）。
#   普通 (−38, −58.5) 34×16、門 (−38, −49.4)；文學院 (−38, −34) 40×18（北面 z≈−43；普通南面 z≈−50.5，中間的路約 7 m 寬）；博思 (−38, −83) 34×18、門 (−38, −72.8)
WALK = [('pt_walk_a', (-38, -49.4), (1, 0.3), 12, (-38, -52), '普通：文學院和普通中間的路，從東邊走過來看門口'),
        ('pt_walk_b', (-38, -49.4), (-1, 0.3), 12, (-38, -52), '普通：同一條路，從西邊走過來看門口'),
        ('by_walk_a', (-38, -72.8), (1, 0.4), 13, (-38, -76), '博思：普通和博思中間的路往主入口（雨遮）看'),
        ('by_walk_b', (-38, -92), (0.45, -1), 8, (-38, -90), '博思：湖邊步道往北面（斜坡）看')]
# 照片角度被別的建築擋住時，另外拍一張把擋住的那棟藏起來的【捷徑】版（不是遊戲畫面，只給 LAWWW2 比模型）：pt02 的鏡頭在文學院門廊前 4 m（LAWWW2 的 Blender 場景沒有文學院）
HIDE_ALSO = {'pt02': 'arts'}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def want(key):
    return not ONLY or any(key == o or key.startswith(o) for o in ONLY)


def vfov(lens, w, h):
    return round(math.degrees(2 * math.atan(18.0 / lens / (float(w) / h))), 2)


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
GLB = """(()=>{ const z=GAME.E.zone, r={}; for(const k of ['campus_putong_glb','campus_boya_glb']){ const o=z&&z.group&&z.group.getObjectByName(k); let n=0; if(o) o.traverse(q=>{ if(q.isMesh) n++; }); r[k]=o?n:null; } return r; })()"""
AIM = """(([e,l,h,seed,fov])=>{ const E=GAME.E, G=GAME.G, cam=E.camera; E.paused=true; window.__ccSeed&&window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  cam.fov=fov; cam.updateProjectionMatrix(); E._shT=0; E.render(); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, fov:cam.fov, aspect:+cam.aspect.toFixed(4)};
  cam.fov=fov0; cam.updateProjectionMatrix(); return out; })"""
FIND = """(([ax,az,dx,dz,d0])=>{ const n=GAME.E.nav; if(!n) return null; const L=Math.hypot(dx,dz); dx/=L; dz/=L;
  for(const dd of [0,1,-1,2,-2,3,-3,4,-4]) for(const ang of [0,8,-8,16,-16,24,-24]){ const a=ang*Math.PI/180, ux=dx*Math.cos(a)-dz*Math.sin(a), uz=dx*Math.sin(a)+dz*Math.cos(a), d=d0+dd; if(d<2) continue;
    const x=ax+ux*d, z=az+uz*d; if(n.clear?n.clear(x,z,0.4):n.free(x,z)) return [+x.toFixed(2),+z.toFixed(2),d,ang]; } return null; })"""
# 畫面正中打到哪一棟（往上找 userData.ckTag 或 *_glb；看不見的不算）
CENTER = """(()=>{ const E=GAME.E, rc=new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(0,0),E.camera); const vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const hits=rc.intersectObjects(E.zone.group.children,true); for(const h of hits){ if(!vis(h.object)) continue; if(h.object.material&&h.object.material.visible===false) continue; let o=h.object, tag=null, glb=null;
    for(;o;o=o.parent){ if(!glb&&/_glb$/.test(o.name||'')) glb=o.name; if(o.userData&&o.userData.ckTag){ tag=o.userData.ckTag; break; } } return {dist:+h.distance.toFixed(1), tag, glb:glb||(tag?null:''), mesh:(h.object.name||'').slice(0,40)}; } return null; })()"""
# 把某個標記的套件和正式模型都藏起來／放回來（【捷徑】）
HIDE_TAG = """(([tag,on])=>{ const z=GAME.E.zone; let n=0; z.group.traverse(o=>{ if((o.userData&&o.userData.ckTag===tag)||o.name==='campus_'+tag+'_glb'){ if(on){ if(o.userData.__ccTagHid){ o.visible=true; o.userData.__ccTagHid=false; n++; } } else if(o.visible){ o.visible=false; o.userData.__ccTagHid=true; n++; } } }); return n; })"""
FRAMES = """(async n=>{ const E=GAME.E, f0=E.frame; for(let i=0;i<300&&E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,100)); const ri=E.renderer.info.render, P=E.player.obj.position, c=E.camera.position;
  return {calls:ri.calls, tris:ri.triangles, frames:E.frame-f0, player:[+P.x.toFixed(2),+P.z.toFixed(2)], cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], mode:E.cam.mode}; })"""


async def stable(pg, cap=120):
    last = -1; st = 0; t1 = time.time()
    while time.time() - t1 < cap:
        await pg.wait_for_timeout(1000); n = await pg.evaluate(MESHN)
        if n == last: st += 1
        else: st = 0; last = n
        if st >= 5: break
    return last, time.time() - t1


async def load(pg, cdp, pos, yaw):
    await pg.evaluate("GAME.E.paused=false")
    await L.load_state(pg, {'zone': 'campus', 'hour': HOUR, 'day': 7, 'weekday': 2, 'weather': 'clear', 'pos': {'x': pos[0], 'z': pos[1], 'yaw': yaw, 'lv': 0}}, quiet_events=True)
    n, sec = await stable(pg)
    await L.close_panels(pg, cdp)
    return n, sec


async def main():
    os.makedirs(OUT, exist_ok=True)
    seed = int(os.environ.get('CC_SEED') or 20261104)
    print('CC PTBOYA 普通／博思教學館同角度截圖：%05.2f、晴；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (HOUR, os.environ.get('SHA', '?')), flush=True)
    meta = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, seed)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        keys = [k for k in CAMS if want(k)]
        if keys:
            await pg.set_viewport_size({'width': RES[0], 'height': RES[1]}); await pg.wait_for_timeout(800)
            print('  [前置／捷徑] 讀檔：校園 (−38, −40)、2025-09-23（二）%05.2f、晴、條件事件關閉；之後固定鏡頭' % HOUR, flush=True)
            n, sec = await load(pg, cdp, (-38, -40), 3.1416)
            g = await pg.evaluate(GLB)
            check('讀檔進到校園（mesh %s、%.0f 秒穩定）' % (n, sec), await pg.evaluate("GAME.G.zone==='campus'"), '')
            check('普通、博思的正式模型都接上了', all(v for v in g.values()), J(g))
            await pg.evaluate(HUD + '(false)')
            print('  藏起來的出口標籤：%d' % (await pg.evaluate(cc_det.HIDE_LABELS_JS)), flush=True)
            for k, key in enumerate(keys):
                c = CAMS[key]; fov = vfov(c['lens'], RES[0], RES[1])
                await pg.evaluate(cc_det.HIDE_PEOPLE_JS)
                ri = await pg.evaluate(AIM + '(%s)' % J([c['eye'], c['at'], HOUR, seed + k, fov]))
                fn = 'ptboya_%s_%04d.png' % (key, int(round(HOUR * 100)))
                await pg.screenshot(path=os.path.join(OUT, fn))
                ctr = await pg.evaluate(CENTER)
                meta[fn] = dict(ri, cam=c['eye'], look=c['at'], lens=c['lens'], photo=c['photo'], note=c['note'], glb=g, center=ctr)
                print('  %s：%s %d mm＝垂直 %s°（aspect %s）、calls %s、tris %s、畫面正中＝%s｜%s' % (fn, c['photo'], c['lens'], ri['fov'], ri['aspect'], ri['calls'], ri['tris'], J(ctr), c['note']), flush=True)
                want_tag = 'putong' if key.startswith('pt') else 'boya'
                bld = ctr and (ctr.get('tag') or (ctr.get('glb') or '').replace('campus_', '').replace('_glb', ''))
                if bld and bld != want_tag: print('INFO %s：畫面正中打到的是 %s（%.1f m，不是 %s）——照片的角度在遊戲裡被別的建築擋住' % (key, bld, ctr['dist'], want_tag), flush=True)
                if key in HIDE_ALSO:
                    nh = await pg.evaluate(HIDE_TAG + '(%s)' % J([HIDE_ALSO[key], False]))
                    ri2 = await pg.evaluate(AIM + '(%s)' % J([c['eye'], c['at'], HOUR, seed + k, fov]))
                    fn2 = 'ptboya_%s_hide_%s_%04d.png' % (key, HIDE_ALSO[key], int(round(HOUR * 100)))
                    await pg.screenshot(path=os.path.join(OUT, fn2)); ctr2 = await pg.evaluate(CENTER)
                    await pg.evaluate(HIDE_TAG + '(%s)' % J([HIDE_ALSO[key], True]))
                    meta[fn2] = dict(ri2, cam=c['eye'], look=c['at'], lens=c['lens'], photo=c['photo'], note='【捷徑】藏起 %s（%d 個物件）——不是遊戲畫面，只給 LAWWW2 比模型' % (HIDE_ALSO[key], nh), center=ctr2)
                    print('  %s：【捷徑】藏起 %s（%d 個物件）、畫面正中＝%s' % (fn2, HIDE_ALSO[key], nh, J(ctr2)), flush=True)
            await pg.evaluate("GAME.E.paused=false; GAME.E.endCinematic&&GAME.E.endCinematic()"); await pg.evaluate(HUD + '(true)')
        walks = [w for w in WALK if want(w[0])]
        if walks:
            await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
        found = {}
        if walks:
            if not await pg.evaluate("GAME.G&&GAME.G.zone==='campus'"):
                await load(pg, cdp, (-38, -40), 3.1416)
            for key, anc, dr, dist, tgt, note in walks:
                found[key] = await pg.evaluate(FIND + '(%s)' % J([anc[0], anc[1], dr[0], dr[1], dist]))
                print('  %s：站的位置＝%s（錨點 %s、方向 %s、距離 %s）' % (key, J(found[key]), list(anc), list(dr), dist), flush=True)
        for key, anc, dr, dist, tgt, note in walks:
            if not check('%s 找得到站得住的位置' % key, bool(found.get(key)), J(found.get(key))): continue
            pos = (found[key][0], found[key][1])
            yaw = math.atan2(tgt[0] - pos[0], tgt[1] - pos[1])
            print('  [前置／捷徑] 讀檔：校園 %s、朝 %s（yaw %.2f）' % (pos, tgt, yaw), flush=True)
            n, sec = await load(pg, cdp, pos, yaw)
            await pg.evaluate(cc_det.HIDE_PEOPLE_JS); await pg.evaluate("GAME.E.player.obj.visible=true")
            await pg.evaluate(cc_det.HIDE_LABELS_JS); await pg.evaluate(HUD + '(false)')
            await pg.wait_for_timeout(2500)
            fr = await pg.evaluate(FRAMES + '(8)')
            fn = 'ptboya_%s_%04d.jpg' % (key, int(round(HOUR * 100)))
            await pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=88)
            ctr = await pg.evaluate(CENTER)
            moved = math.hypot(fr['player'][0] - pos[0], fr['player'][1] - pos[1])
            meta[fn] = dict(fr, stand=pos, toward=tgt, yaw=round(yaw, 3), note=note, moved=round(moved, 2), center=ctr)
            print('  %s：玩家 %s（讀檔 %s，差 %.2f m）、鏡頭 %s %s、calls %s、tris %s、畫面正中＝%s｜%s' % (fn, fr['player'], list(pos), moved, fr['cam'], fr['mode'], fr['calls'], fr['tris'], J(ctr), note), flush=True)
            if moved > 0.6: print('INFO %s：讀檔的位置站不住，引擎把玩家移了 %.2f m（照移過的位置拍）' % (key, moved), flush=True)
            await pg.evaluate(HUD + '(true)')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'ptboya_shots.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('INFO 一共 %d 張；像不像／太像由 BB 判（D136），這支只截圖' % len(meta), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
