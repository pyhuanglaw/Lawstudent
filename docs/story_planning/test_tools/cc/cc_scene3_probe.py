"""CC-B（帳號 B）11-07：BB-B 15:51 派工 e66781d1f 三處場景截圖（D120 由 BB 判）——轉角唱片 corner_records、洋洋鹹酥雞 yangyang。（霖澤 5F 用 cc_linze_lm_probe。）
PART＝corner｜yangyang（預設兩個都跑）。每一處：【前置／捷徑】讀檔進店（條件事件關閉），日期 DAY（預設 2025-10-18 週六）。
corner（12:00、20:30）：
  ref＝配置的 camRef（店門內側往裡、16 mm）；door＝門的兩側（店裡往門看）；top＝遊戲跟隨鏡頭拉到俯角 1.25（看天花板管線、從上面看）；
  fade_N／E／S／W＝玩家站店中間、遊戲跟隨鏡頭轉四個方向（不搬鏡頭；牆淡出照遊戲本身），每一張印「淡出中的牆」和那一面牆 1.2 m 內、沒有一起變透明的網格；
  sit_stool、sit_sofa＝走到試聽高腳椅、沙發坐下拍（白天那一輪；sit_all，走不走得到 BB 自己測，這裡只看坐姿）。
yangyang（19:00、23:30）：door＝進門往裡；counter＝櫃台（老闆、臨騎樓的炸物櫃）；top＝俯視全店（新 CAM 從 7.5 m 高往下）；
  t4_south＝桌 4 南側兩張椅子近照；window＝窗外（GLB 沒有 view card，照拍）；另外印店裡每個 NPC：坐著的在不在座位上、站著的那一點站不站得住（店員 clerk 不算）。
路人遠近版本照新 CAM（搬鏡頭以後重算）。判定＝BB（D120）。用法：LW_TESTS=<wt>/tests PART=corner python3 cc_scene3_probe.py <url> <out>"""
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
PARTS = [p_ for p_ in (os.environ.get('PART') or 'corner,yangyang').split(',') if p_]
R = L.Run('scene3_' + '_'.join(PARTS), OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'

FADE = r"""(()=>{ const E=GAME.E, z=E.zone; if(!z) return null; const op=m=>m.transparent&&m.opacity<0.99; const out={faded:[], solidNearFaded:[]}; const box=new THREE.Box3();
  const walls=(z.walls||[]).filter(w=>w&&w.isObject3D); const fadedW=[];
  for(const w of walls){ let f=false; w.traverse(o=>{ if(o.isMesh) for(const m of [].concat(o.material)) if(m&&(op(m)||m.visible===false||!o.visible)) f=true; }); if(f){ fadedW.push(w); out.faded.push(w.name||w.uuid.slice(0,6)); } }
  if(!fadedW.length) return out; const fb=fadedW.map(w=>new THREE.Box3().setFromObject(w).expandByScalar(1.2));
  z.group.traverse(o=>{ if(!o.isMesh||!o.visible) return; if(fadedW.some(w=>{ let p=o; while(p){ if(p===w) return true; p=p.parent; } return false; })) return; box.setFromObject(o); if(box.isEmpty()) return; const sz=box.getSize(new THREE.Vector3()); if(sz.x>6||sz.z>6) return;   /* 地板、天花板、整間合併的大網格不算 */
    if(!fb.some(b=>b.containsBox(box))) return; const ms=[].concat(o.material); if(ms.some(m=>m&&op(m))) return; let p=o, nm=[]; while(p&&p!==z.group&&nm.length<3){ if(p.name) nm.push(p.name); p=p.parent; } out.solidNearFaded.push((nm.join('<')||o.type)+' @'+box.getCenter(new THREE.Vector3()).toArray().map(v=>v.toFixed(1)).join(',')); });
  out.solidNearFaded=out.solidNearFaded.slice(0,25); return out; })()"""

PEOPLE = r"""(()=>{ const E=GAME.E, out=[]; for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o) continue; const p=o.position, lv=n.lv||0; const sitting=!!n.seat||/sit/.test(n.pose||'');
  out.push({id:n.name||n.id||null, x:+p.x.toFixed(2), z:+p.z.toFixed(2), pose:n.pose, clerk:!!(n.clerk||n.staff), seat:n.seat?{x:+n.seat.x.toFixed(2),z:+n.seat.z.toFixed(2),d:+Math.hypot(n.seat.x-p.x,n.seat.z-p.z).toFixed(2)}:null, stand:sitting?null:(E.canStand?!!E.canStand(p.x,p.z,0.2,lv):null)}); } return out; })()"""


async def follow(pg, name, x, z, cam_yaw, pitch=None, dist=None):
    """遊戲自己的跟隨鏡頭：玩家站 (x,z)、鏡頭在玩家的 (sin yaw, cos yaw) 那一側；pitch／dist 照給的（不暫停、不搬鏡頭）"""
    await pg.evaluate("""(a=>{ const E=GAME.E, P=E.player.obj; P.position.x=a.x; P.position.z=a.z; if(E.cam){ E.cam.yaw=a.yaw; if(a.pitch!=null) E.cam.pitch=a.pitch; if(a.dist!=null&&E.cam.dist!=null) E.cam.dist=a.dist; } })""", {'x': x, 'z': z, 'yaw': cam_yaw, 'pitch': pitch, 'dist': dist})
    await pg.wait_for_timeout(2500)
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(500)
    m = await D.shot(pg, name)
    await pg.evaluate(D.HUD + '(true)')
    return m


async def corner(pg, cdp, rec):
    for tn, h in (('noon', 12.0), ('night', 20.5)):
        tag = '[corner %s]' % tn
        R.setup('%s 讀檔 corner_records %s %.1f（條件事件關閉）' % (tag, DAY, h))
        s = await D.load_zone(pg, cdp, 'corner_records', DAY, h, wait=8000)
        if not R.check('%s 進得了 corner_records' % tag, s['zone'] == 'corner_records', J(s)): continue
        await pg.wait_for_timeout(2500)
        r = rec.setdefault('corner', {}).setdefault(tn, {})
        r['ref'] = await D.user_shot(pg, cdp, 'corner_%s_ref' % tn, {'eye': [0.5, 1.72, 5.4], 'look': [0.3, 0.5, -0.6], 'lens': 16})
        r['door'] = await D.user_shot(pg, cdp, 'corner_%s_door' % tn, {'eye': [-0.6, 1.6, 0.8], 'look': [1.63, 1.3, 5.75], 'lens': 18})
        r['top'] = await follow(pg, 'corner_%s_top' % tn, 0.0, 0.3, 0.0, pitch=1.25)
        if tn == 'noon':
            for nm, yw in (('S', 0.0), ('W', -math.pi / 2), ('N', math.pi), ('E', math.pi / 2)):
                await follow(pg, 'corner_fade_%s' % nm, 0.0, 0.3, yw)
                f = await pg.evaluate(FADE)
                R.note('%s fade_%s（鏡頭在玩家的 %s 側）：淡出中的牆 %s；那面牆 1.2 m 內沒有一起淡出的網格 %d 個：%s' % (tag, nm, nm, J(f and f['faded']), len((f or {}).get('solidNearFaded') or []), J((f or {}).get('solidNearFaded'))))
                r['fade_' + nm] = f
            await D.sit_all(pg, cdp, tag, 'corner_sit', only=[(2.95, 3.2), (-2.9, 3.05)])   # 試聽高腳椅（靠門那張）、沙發（配置 seats）
        R.note('%s 拍完：%s' % (tag, J({k: (v if not isinstance(v, dict) or 'faded' not in v else '…') for k, v in r.items()})))


async def yangyang(pg, cdp, rec):
    for tn, h in (('1900', 19.0), ('2330', 23.5)):
        tag = '[yangyang %s]' % tn
        R.setup('%s 讀檔 yangyang %s %.1f（條件事件關閉）' % (tag, DAY, h))
        s = await D.load_zone(pg, cdp, 'yangyang', DAY, h, wait=8000)
        if not R.check('%s 進得了 yangyang' % tag, s['zone'] == 'yangyang', J(s)): continue
        await pg.wait_for_timeout(5000)
        r = rec.setdefault('yangyang', {}).setdefault(tn, {})
        r['door'] = await D.user_shot(pg, cdp, 'yy_%s_door' % tn, {'eye': [1.2, 1.6, 4.9], 'look': [0.0, 1.0, -4.0], 'lens': 18})
        r['counter'] = await D.user_shot(pg, cdp, 'yy_%s_counter' % tn, {'eye': [0.8, 1.6, 1.6], 'look': [-2.3, 1.2, 4.8], 'lens': 20})
        r['top'] = await D.user_shot(pg, cdp, 'yy_%s_top' % tn, {'eye': [0.3, 7.5, 2.2], 'look': [0.0, 0.0, -0.6], 'lens': 16})
        r['t4_south'] = await D.user_shot(pg, cdp, 'yy_%s_t4south' % tn, {'eye': [-2.9, 1.35, -1.9], 'look': [-2.9, 0.5, -3.8], 'lens': 24})
        r['window'] = await D.user_shot(pg, cdp, 'yy_%s_window' % tn, {'eye': [0.9, 1.5, 2.4], 'look': [2.7, 1.4, 5.5], 'lens': 20})
        ppl = await pg.evaluate(PEOPLE)
        bad = [p_ for p_ in ppl if not p_['clerk'] and ((p_['seat'] and p_['seat']['d'] > 0.15) or p_['stand'] is False)]
        R.note('%s 店裡 %d 人（坐著 %d、店員 %d）：%s' % (tag, len(ppl), sum(1 for p_ in ppl if p_['seat']), sum(1 for p_ in ppl if p_['clerk']), J(ppl)))
        R.check('%s 客人坐在座位上（0.15 m）、站著的站得住（店員不算）' % tag, not bad, J(bad))
        r['people'] = ppl


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 三處場景（%s）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (PARTS, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for part in PARTS:
                try: await {'corner': corner, 'yangyang': yangyang}[part](pg, cdp, rec)
                except Exception as ex: R.check('[%s] 探針沒有例外' % part, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'scene3.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
