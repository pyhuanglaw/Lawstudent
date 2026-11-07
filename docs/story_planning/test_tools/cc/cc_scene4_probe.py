"""CC-B（帳號 B）11-07：BB-B 17:40 派工 4fcd3c45b（LAWWW2-B a6509d2a0 公館三間光照＋窗景＋轉角 P2／P3；README gg_new_lm_1107「還沒驗」1～4）。D120 由 BB 判。
PART＝yangyang,corner,cvs,dakou2f（預設全部）。【前置／捷徑】讀檔進店（條件事件關閉），日期 2025-10-18（週六）。固定視角用新 CAM（搬鏡頭以後重算遠近、淡出）；跟隨鏡頭＝遊戲自己的，不搬。
  yangyang（14:00、21:00）：door_out＝店裡往店門看（窗外騎樓、機車、羅斯福路）、top＝全店俯視；印接了幾張光照貼圖、窗景卡（VIEW）在不在
  corner（14:00、20:30）：ref＝camRef、door_out＝店門往外看；白天另外：跟隨鏡頭 S／W／N／E 四方向（印淡出中的牆、右牆 1.2 m 內沒跟著淡出的、畫面裡看得到的樑／冷氣／管線／店名飾板網格）、坐高腳椅、坐沙發
  cvs（14:00、21:00）：door_in＝店門往裡、counter＝結帳櫃台
  dakou2f（14:00）：玩家在二樓（樓梯頂 (5.25,−2.3)），跟隨鏡頭 → 鏡頭拉高過二樓天花板 → 拉回來；每一步印 CEIL_LIGHTS 的 visible、畫面亮度
判定＝BB。用法：LW_TESTS=<wt>/tests [PART=...] python3 cc_scene4_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
PARTS = [p_ for p_ in (os.environ.get('PART') or 'yangyang,corner,cvs,dakou2f').split(',') if p_]
R = L.Run('scene4', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'

LMINFO = r"""(()=>{ const z=GAME.E.zone; let n=0, lm=0; const maps=new Set(), views=[]; z.group.traverse(o=>{ if(/VIEW/i.test(o.name||'')) views.push({n:o.name, vis:o.visible}); if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m) continue; n++; if(m.lightMap){ lm++; maps.add(((m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src))||m.lightMap.name||'?').split('/').pop()); } } });
  return {mats:n, withLightMap:lm, maps:[...maps], views:views.slice(0,8)}; })()"""
FADE = r"""(()=>{ const E=GAME.E, z=E.zone; if(!z) return null; const op=m=>m.transparent&&m.opacity<0.99; const out={faded:[], solidNearFaded:[]}; const box=new THREE.Box3();
  const walls=(z.walls||[]).filter(w=>w&&w.isObject3D); const fadedW=[];
  for(const w of walls){ let f=false; w.traverse(o=>{ if(o.isMesh) for(const m of [].concat(o.material)) if(m&&(op(m)||m.visible===false||!o.visible)) f=true; }); if(f){ fadedW.push(w); out.faded.push(w.name||w.uuid.slice(0,6)); } }
  if(!fadedW.length) return out; const fb=fadedW.map(w=>new THREE.Box3().setFromObject(w).expandByScalar(1.2));
  z.group.traverse(o=>{ if(!o.isMesh||!o.visible) return; if(fadedW.some(w=>{ let p=o; while(p){ if(p===w) return true; p=p.parent; } return false; })) return; box.setFromObject(o); if(box.isEmpty()) return; const sz=box.getSize(new THREE.Vector3()); if(sz.x>6||sz.z>6) return;
    if(!fb.some(b=>b.containsBox(box))) return; if([].concat(o.material).some(m=>m&&op(m))) return; { let r=o; while(r&&r.parent!==z.group&&r.parent) r=r.parent; if(!/^WALL_/.test((r&&r.name)||'')&&!/^WALL_/.test(o.name||'')) return; }   /* 只算牆上的東西（WALL_ 開頭；BB-B 18:14：範圍改窄，高腳椅、門板不算）*/ let p=o, nm=[]; while(p&&p!==z.group&&nm.length<3){ if(p.name) nm.push(p.name); p=p.parent; } out.solidNearFaded.push((nm.join('<')||o.type)+' @'+box.getCenter(new THREE.Vector3()).toArray().map(v=>v.toFixed(1)).join(',')); });
  out.solidNearFaded=out.solidNearFaded.slice(0,25); return out; })()"""
OCCL = r"""(()=>{ const E=GAME.E, z=E.zone, cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)); const box=new THREE.Box3(), out=[];
  z.group.traverse(o=>{ if(!o.isMesh) return; let vis=true, p=o; while(p){ if(!p.visible){ vis=false; break; } p=p.parent; } if(!vis) return; let q=o, nm=[]; while(q&&q!==z.group&&nm.length<4){ if(q.name) nm.push(q.name); q=q.parent; } const s=nm.join('<');
    if(!/beam|BEAM|樑|aircon|AIRCON|AC_|duct|DUCT|pipe|PIPE|管|sign|SIGN|logo|LOGO|飾板|plaque|PLAQUE|track|TRACK/.test(s)) return; box.setFromObject(o); if(box.isEmpty()||!fr.intersectsBox(box)) return;
    const ms=[].concat(o.material); if(ms.every(m=>m&&m.transparent&&m.opacity<0.05)) return; out.push(s+' @'+box.getCenter(new THREE.Vector3()).toArray().map(v=>v.toFixed(1)).join(',')); });
  return out.slice(0,20); })()"""
CEIL = r"""(()=>{ const E=GAME.E, z=E.zone; const out=[]; z.group.traverse(o=>{ if(/CEIL_LIGHTS/.test(o.name||'')){ let vis=true, p=o; while(p){ if(!p.visible){ vis=false; break; } p=p.parent; } out.push({n:o.name, self:o.visible, eff:vis}); } }); return {camY:+E.camera.position.y.toFixed(2), pitch:E.cam?E.cam.pitch:null, dist:E.cam?E.cam.dist:null, ceil:out.slice(0,6)}; })()"""


async def follow(pg, name, x, z, cam_yaw, pitch=None, dist=None, move=True):
    await pg.evaluate("""(a=>{ const E=GAME.E, P=E.player.obj; if(a.move){ P.position.x=a.x; P.position.z=a.z; } if(E.cam){ E.cam.yaw=a.yaw; if(a.pitch!=null) E.cam.pitch=a.pitch; if(a.dist!=null&&E.cam.dist!=null) E.cam.dist=a.dist; } })""", {'x': x, 'z': z, 'yaw': cam_yaw, 'pitch': pitch, 'dist': dist, 'move': move})
    await pg.wait_for_timeout(2500)
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(500)
    m = await D.shot(pg, name)
    await pg.evaluate(D.HUD + '(true)')
    return m


async def enter(pg, cdp, zone, h, tag, x=None, z=None, yaw=None, lv=0):
    R.setup('%s 讀檔 %s %s %.1f（條件事件關閉）' % (tag, zone, DAY, h))
    s = await D.load_zone(pg, cdp, zone, DAY, h, x=x, z=z, yaw=yaw, lv=lv, wait=8000)
    ok = R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s))
    if ok: await pg.wait_for_timeout(3000)
    return ok


async def yangyang(pg, cdp, rec):
    for tn, h in (('1400', 14.0), ('2100', 21.0)):
        tag = '[洋洋 %s]' % tn
        if not await enter(pg, cdp, 'yangyang', h, tag): continue
        r = rec.setdefault('yangyang', {}).setdefault(tn, {})
        r['lm'] = await pg.evaluate(LMINFO); R.note('%s 光照貼圖／窗景卡：%s' % (tag, J(r['lm'])))
        r['door_out'] = await D.user_shot(pg, cdp, 'yy4_%s_door_out' % tn, {'eye': [0.6, 1.6, -1.2], 'look': [1.6, 1.3, 6.5], 'lens': 20})
        r['top'] = await D.user_shot(pg, cdp, 'yy4_%s_top' % tn, {'eye': [0.3, 7.5, 2.2], 'look': [0.0, 0.0, -0.6], 'lens': 16})


async def corner(pg, cdp, rec):
    for tn, h in (('1400', 14.0), ('2030', 20.5)):
        tag = '[轉角 %s]' % tn
        if not await enter(pg, cdp, 'corner_records', h, tag): continue
        r = rec.setdefault('corner', {}).setdefault(tn, {})
        r['lm'] = await pg.evaluate(LMINFO); R.note('%s 光照貼圖／窗景卡：%s' % (tag, J(r['lm'])))
        r['ref'] = await D.user_shot(pg, cdp, 'cr4_%s_ref' % tn, {'eye': [0.5, 1.72, 5.4], 'look': [0.3, 0.5, -0.6], 'lens': 16})
        r['door_out'] = await D.user_shot(pg, cdp, 'cr4_%s_door_out' % tn, {'eye': [0.3, 1.6, 0.6], 'look': [0.8, 1.4, 7.0], 'lens': 18})
        if tn != '1400': continue
        for nm, yw in (('S', 0.0), ('W', -math.pi / 2), ('N', math.pi), ('E', math.pi / 2)):
            await follow(pg, 'cr4_fade_%s' % nm, 0.0, 0.3, yw)
            f = await pg.evaluate(FADE); oc = await pg.evaluate(OCCL)
            R.note('%s fade_%s（鏡頭在玩家的 %s 側）：淡出中的牆 %s；那面牆 1.2 m 內沒跟著淡出 %d 個 %s；畫面裡還看得到的樑／冷氣／管線／招牌類網格 %d 個 %s' % (tag, nm, nm, J(f and f['faded']), len((f or {}).get('solidNearFaded') or []), J((f or {}).get('solidNearFaded')), len(oc), J(oc)))
            r['fade_' + nm] = {'fade': f, 'occl': oc}
        R.check('%s 鏡頭在東側（E）：右牆 1.2 m 內沒有沒跟著淡出的（黃金葛架一起淡出）' % tag, bool(r.get('fade_E', {}).get('fade')) and not r['fade_E']['fade']['solidNearFaded'], J(r.get('fade_E')))
        await D.sit_all(pg, cdp, tag, 'cr4_sit', only=[(2.95, 3.2), (-2.9, 3.05)])


async def cvs(pg, cdp, rec):
    for tn, h in (('1400', 14.0), ('2100', 21.0)):
        tag = '[便利商店 %s]' % tn
        if not await enter(pg, cdp, 'cvs', h, tag): continue
        r = rec.setdefault('cvs', {}).setdefault(tn, {})
        r['lm'] = await pg.evaluate(LMINFO); R.note('%s 光照貼圖／窗景卡：%s' % (tag, J(r['lm'])))
        r['door_in'] = await D.user_shot(pg, cdp, 'cvs4_%s_door_in' % tn, {'eye': [0.4, 1.6, 4.7], 'look': [0.0, 1.0, -4.0], 'lens': 18})
        r['counter'] = await D.user_shot(pg, cdp, 'cvs4_%s_counter' % tn, {'eye': [-0.6, 1.6, 2.8], 'look': [2.3, 1.0, 0.75], 'lens': 22})


async def dakou2f(pg, cdp, rec):
    tag = '[大口二樓 1400]'
    if not await enter(pg, cdp, 'xs_dakou', 14.0, tag, x=5.25, z=-2.3, yaw=math.pi, lv=1): return
    r = rec.setdefault('dakou2f', {})
    for nm, pitch, dist in (('follow', None, None), ('high', 1.35, 11.0), ('back', 0.45, 4.4)):
        m = await follow(pg, 'dk4_2f_%s' % nm, 0, 0, math.pi * 0.25, pitch=pitch, dist=dist, move=False)
        c = await pg.evaluate(CEIL)
        R.note('%s %s：鏡頭高 %s、pitch %s、dist %s；CEIL_LIGHTS %s；畫面亮度 %s' % (tag, nm, c['camY'], c['pitch'], c['dist'], J(c['ceil']), J(m)))
        r[nm] = {'ceil': c, 'lum': m}
    R.check('%s 有 CEIL_LIGHTS 這個節點' % tag, bool(r['follow']['ceil']['ceil']), J(r['follow']['ceil']))


async def retake(pg, cdp, rec):
    """BB-B 18:14 補拍三張"""
    r = rec.setdefault('retake', {})
    # 1 轉角高腳椅：坐下等 3 秒、跟隨鏡頭拉近（1.5 m 內）
    tag = '[補拍 轉角高腳椅]'
    if os.environ.get('RETAKE_ONLY') != 'cvs' and await enter(pg, cdp, 'corner_records', 14.0, tag):
        it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.seat&&!i.hidden&&Math.abs(i.seat.x-2.95)<0.1&&Math.abs(i.seat.z-3.2)<0.1); if(!i) return null; const ap=GAME.seatApproach?GAME.seatApproach(i):[i.x,i.z]; return {label:i.label, ap:[ap[0],ap[1]], seat:{x:i.seat.x,z:i.seat.z,y:i.seat.y==null?null:i.seat.y,lift:i.seat.lift==null?null:i.seat.lift}}; })()")
        R.note('%s 高腳椅：%s' % (tag, J(it)))
        if it:
            await L.advance_dialogs(pg, cdp, R, lambda s_: not s_['dlg'] and not s_['choices'], max_steps=20)   # 先把進門句點掉（不然點地面、點按鈕都被對話吃掉）
            await L.go_to(pg, cdp, R, it['ap'][0] - 0.8, it['ap'][1], 0.3, tag + ' 走到高腳椅附近', max_s=120)
            await L.tap_ground(pg, cdp, it['seat']['x'], it['seat']['z'])   # 照玩家點椅子本身（tapRedirect 走到 seatApproach、這一張的「坐下」優先；同 cc_d141_lib.sit_all）
            await D.settle(pg); lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
            R.note('%s 點椅子以後互動按鈕：%s' % (tag, lab))
            await L.tap(pg, cdp, '#interact')
            for _ in range(12):   # 坐下以後不選任何選項（「坐一下，看看四周」會過 20 分鐘再站起來）：等 player.seat
                await pg.wait_for_timeout(500)
                if await pg.evaluate("!!GAME.E.player.seat"): break
            await pg.wait_for_timeout(3000)   # 坐下以後 3 秒（BB-B 18:14），對話、選單照開著，不點
            info = await pg.evaluate("(()=>{ const P=GAME.E.player, u=P.obj.userData||{}, an=u.anim||{}; let hip=null; try{ const h=u.vrm.humanoid.getRawBoneNode('hips').getWorldPosition(new THREE.Vector3()); hip=+h.y.toFixed(3); }catch(e){} return {seat:P.seat?{x:P.seat.x,z:P.seat.z,y:P.seat.y==null?null:P.seat.y,lift:P.seat.lift==null?null:P.seat.lift}:null, y:+P.obj.position.y.toFixed(3), x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), pose:P.pose||null, idlePose:P.idlePose||null, hipY:hip, cur:an.cur||null}; })()")
            R.note('%s 坐下 3 秒後：%s' % (tag, J(info)))
            R.check('%s 坐著（P.seat 有、pose 含 sit）' % tag, bool(info['seat']) and 'sit' in str(info['pose'] or '') + str(info['idlePose'] or ''), J(info))
            m = await follow(pg, 'rt_corner_stool_close', 0, 0, -math.pi * 0.75, pitch=0.28, dist=1.5, move=False)
            m2 = await follow(pg, 'rt_corner_stool_side', 0, 0, -math.pi * 0.5, pitch=0.22, dist=1.5, move=False)
            r['stool'] = {'info': info, 'lum': [m, m2]}
    if os.environ.get('RETAKE_ONLY') == 'stool': return
    # 2 洋洋 17:00
    tag = '[補拍 洋洋 1700]'
    if os.environ.get('RETAKE_ONLY') != 'cvs' and await enter(pg, cdp, 'yangyang', 17.0, tag):
        r['yy1700_lm'] = await pg.evaluate(LMINFO); R.note('%s 光照貼圖／窗景卡：%s' % (tag, J(r['yy1700_lm'])))
        await D.user_shot(pg, cdp, 'rt_yy_1700_door_out', {'eye': [0.6, 1.6, -1.2], 'look': [1.6, 1.3, 6.5], 'lens': 20})
        await D.user_shot(pg, cdp, 'rt_yy_1700_top', {'eye': [0.3, 7.5, 2.2], 'look': [0.0, 0.0, -0.6], 'lens': 16})
    # 3 便利商店往外看
    for tn, h in (('1400', 14.0), ('2100', 21.0)):
        tag = '[補拍 便利商店往外 %s]' % tn
        if await enter(pg, cdp, 'cvs', h, tag):
            await D.user_shot(pg, cdp, 'rt_cvs_%s_out' % tn, {'eye': [0.4, 1.6, 4.2], 'look': [-3.2, 1.3, 5.6], 'lens': 20})


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 公館三間＋轉角 P2／P3＋大口二樓（%s）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for part in PARTS:
                try: await {'yangyang': yangyang, 'corner': corner, 'cvs': cvs, 'dakou2f': dakou2f, 'retake': retake}[part](pg, cdp, rec)
                except Exception as ex: R.check('[%s] 探針沒有例外' % part, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'scene4.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
