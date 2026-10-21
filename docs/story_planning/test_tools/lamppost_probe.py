"""BB（帳號 A）2026-10-21：BUG-NAV-LAMPPOST-1021（LAWWW2 5f03d748 → 開發分支 ae968ffb）路燈燈柱擋得住人＋椰林大道、傅鐘兩側新路燈的路面光圈；
ART-ECON-3D-GAP-1021 第一批（f858b47c）榕樹氣根（校園、公館）——畫面只記看到什麼（READY_FOR_ART_REVIEW，建築、場景只有使用者能標 ART_APPROVED）。
【前置】讀使用者 9/25 存檔，改到各區域 20:30（quiet_events：不演劇情、手機不自己打開）。【捷徑】把玩家放到燈柱旁 1.6 m（另一側也站得住的方向）。
之後照玩家：用手指滑畫面把鏡頭轉到「往燈柱看」、按住搖桿往前推 2.6 秒——每一幀記玩家的位置，算離燈柱中心最近多少（< 0.4 m＝身體穿過燈桿：燈桿半徑約 0.08＋人物 0.32）。
燈柱是哪幾盞：讀檔前把 W3.lampPost 包一層記下來（不改遊戲），只挑附近有地方站的。舊版對照：同一版只把 zones3d.js、wz_park_layout.js 照 ae968ffb 反向套回去（scratchpad abserve.py）。
光圈：20:30 椰林大道路燈的路面光圈（半徑 6.5 的圓）看得到幾個、13:00 看得到幾個；劇情鏡頭從大道上方、傅鐘前各拍一張（只動鏡頭）。
榕樹：讀檔前把 TK.tree 包一層記下樹種（榕樹＝sp 'banyan' 或 dark ≤ 0.75），白天 13:00 從 8 m 外、1.6 m 高拍樹幹和氣根（只動鏡頭）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 lamppost_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json> [標籤 old|now]（ONLY=lamp｜look 只跑一部分）"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
TAG = sys.argv[4] if len(sys.argv) > 4 else 'now'
ONLY = os.environ.get('ONLY', '')
def say(*a): print(' '.join(str(x) for x in a), flush=True)

WRAP = """(()=>{ if(window.__LW) return; window.__LW=1; window.__LAMPS=[]; window.__TREES=[];
  const lp=W3.lampPost; W3.lampPost=function(){ const l=lp.apply(this,arguments); try{ window.__LAMPS.push(l); }catch(e){} return l; };
  if(typeof TK!=='undefined'&&TK.tree){ const tr=TK.tree; TK.tree=function(h,seed,o){ const t=tr.apply(this,arguments); try{ const dk=(o&&o.dark)||1; window.__TREES.push({t, sp:(o&&o.sp)||(dk<=0.75?'banyan':'camphor'), h}); }catch(e){} return t; }; } })()"""
LAMPS = """(()=>{ const E=GAME.E, v=new THREE.Vector3(), out=[]; const seen=new Set();
  for(const l of (window.__LAMPS||[])){ let root=l; while(root.parent) root=root.parent; if(root!==E.scene) continue; l.getWorldPosition(v); const x=+v.x.toFixed(2), z=+v.z.toFixed(2), k=x+','+z; if(seen.has(k)) continue; seen.add(k);
    let best=null; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2, c=Math.cos(a), s=Math.sin(a); if(E.canStand(x-c*1.6,z-s*1.6,0.32,0)&&E.canStand(x+c*1.6,z+s*1.6,0.32,0)&&E.canStand(x-c*0.8,z-s*0.8,0.32,0)){ best=a; break; } }
    if(best!=null) out.push({x,z,a:+best.toFixed(3)}); }
  return out; })()"""
REC_ON = "(()=>{ window.__POS=[]; window.__REC=1; const f=()=>{ const p=GAME.E.player.obj.position; window.__POS.push([p.x,p.z]); if(window.__REC) requestAnimationFrame(f); }; f(); })()"
REC_OFF = "(()=>{ window.__REC=0; return window.__POS||[]; })()"


async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))


async def load(p, base, zone, h):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()"); await pg.evaluate(WRAP)
    st = json.loads(json.dumps(base)); G = st.get('G', st); G.update({'hour': h, 'zone': zone, 'pos': None})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(8000)
    return b, pg, cdp, errs


async def push_test(pg, cdp, run, zone, lp, k):
    x, z, a = lp['x'], lp['z'], lp['a']; c, s = math.cos(a), math.sin(a)
    at = await put(pg, x - c * 1.6, z - s * 1.6); await pg.wait_for_timeout(600)
    await L.turn_camera_to(pg, cdp, x + c * 4, z + s * 4)
    await pg.evaluate(REC_ON); await L.joystick(pg, cdp, 0, -55, 2600); await pg.wait_for_timeout(400); pos = await pg.evaluate(REC_OFF)
    if not pos: return {'lamp': [x, z], 'err': '沒有記到位置'}
    dmin = min(math.hypot(px - x, pz - z) for px, pz in pos); fx, fz = pos[-1]
    along = (fx - x) * c + (fz - z) * s; moved = math.hypot(fx - pos[0][0], fz - pos[0][1])
    r = {'lamp': [x, z], 'from': at, 'end': [round(fx, 2), round(fz, 2)], 'dmin': round(dmin, 2), 'along': round(along, 2), 'moved': round(moved, 2), 'frames': len(pos)}
    if k < 2: await run.shot(pg, '%s_%s_push%d' % (TAG, zone, k))
    return r


async def lamps(p, base, run):
    out = {}
    for zone, cap in (('campus', 10), ('gongguan', 5), ('lane118', 4), ('wenzhou', 5)):
        b, pg, cdp, errs = await load(p, base, zone, 20.5); run.setup('[前置] %s %s 20:30（quiet_events）；[捷徑] 玩家放到燈柱旁 1.6 m' % (TAG, zone))
        L0 = await pg.evaluate(LAMPS)
        if zone == 'campus':   # 椰林大道（z=±11）先挑，傅鐘兩側新的兩盞一定要
            pri = [l for l in L0 if abs(abs(l['z']) - 11) < 0.05 and (abs(l['x'] + 46.25) < 0.05 or abs(l['x'] + 31.25) < 0.05)]
            pri += [l for l in L0 if abs(abs(l['z']) - 11) < 0.05 and l not in pri]
            L0 = pri + [l for l in L0 if l not in pri]
        say('   %s：有地方站的燈柱 %d 盞：%s' % (zone, len(L0), json.dumps([[l['x'], l['z']] for l in L0[:14]])))
        res = []
        for k, lp in enumerate(L0[:cap]):
            try: r = await push_test(pg, cdp, run, zone, lp, k)
            except Exception as e: r = {'lamp': [lp['x'], lp['z']], 'err': str(e)[:120]}
            res.append(r); say('     %s' % json.dumps(r, ensure_ascii=False))
        out[zone] = {'lamps': L0, 'push': res, 'errs': errs[:3]}
        thr = [r for r in res if 'dmin' in r and r['dmin'] < 0.4]
        run.check('%s %s：燈柱 %d 盞，搖桿直推最近都 ≥ 0.4 m（沒有穿過燈桿）' % (TAG, zone, len([r for r in res if 'dmin' in r])), bool(res) and not thr and not errs,
                  json.dumps({'穿過': thr[:4], 'errs': errs[:2]}, ensure_ascii=False)[:300])
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
        json.dump(out, open(os.path.join(OUT, 'lamppost_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    return out


POOLS = """(()=>{ const E=GAME.E, eff=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; }; const v=new THREE.Vector3();
  const rp=(E.lampGlows||[]).filter(o=>o.isMesh&&o.geometry&&o.geometry.parameters&&Math.abs((o.geometry.parameters.radius||0)-6.5)<0.01);
  return {road:rp.length, roadVisible:rp.filter(eff).length, at:rp.filter(eff).slice(0,20).map(o=>{ o.getWorldPosition(v); return [+v.x.toFixed(1),+v.z.toFixed(1)]; }), h:+(+GAME.G.hour).toFixed(2)}; })()"""


async def cine(pg, run, tag, pos, look):
    await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, look]))
    await pg.wait_for_timeout(3000); await run.shot(pg, tag); await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(500)


async def looks(p, base, run):
    out = {}
    for h in (20.5, 13.0):
        b, pg, cdp, errs = await load(p, base, 'campus', h); run.setup('[前置] %s campus %.2f（quiet_events）；劇情鏡頭只動鏡頭' % (TAG, h))
        pl = await pg.evaluate(POOLS); out['pools_%s' % h] = pl; say('   campus %.2f 大道路面光圈：%s' % (h, json.dumps(pl, ensure_ascii=False)))
        hh = '%02d%02d' % (int(h), int(round((h % 1) * 60)))
        await cine(pg, run, '%s_avenue_above_%s' % (TAG, hh), [-80, 9, -4], [-30, 0, 0])
        await cine(pg, run, '%s_avenue_eye_%s' % (TAG, hh), [-62, 1.7, -2], [-30, 1.2, 1])
        await cine(pg, run, '%s_bell_front_%s' % (TAG, hh), [-38.5, 2.2, -2], [-38.5, 2.0, 14])
        if h == 13.0:
            for zone in ('campus', 'gongguan'):
                if zone != 'campus':
                    try: await asyncio.wait_for(b.close(), 30)
                    except Exception: pass
                    b, pg, cdp, errs = await load(p, base, zone, 13.0); run.setup('[前置] %s %s 13:00（quiet_events）' % (TAG, zone))
                tr = await pg.evaluate("(()=>{ const v=new THREE.Vector3(); return (window.__TREES||[]).filter(r=>{ let p=r.t; while(p&&p.parent) p=p.parent; return p===GAME.E.scene; }).map(r=>{ r.t.getWorldPosition(v); return {sp:r.sp, h:r.h, x:+v.x.toFixed(1), z:+v.z.toFixed(1)}; }); })()")
                ban = [t for t in tr if t['sp'] == 'banyan']; say('   %s 樹 %d 棵，榕樹 %d 棵：%s' % (zone, len(tr), len(ban), json.dumps(ban[:8], ensure_ascii=False)))
                out['trees_%s' % zone] = {'n': len(tr), 'banyan': ban}
                for k, t in enumerate(ban[:3]):
                    pp = await pg.evaluate("GAME.E.player.obj.position.toArray()")
                    dx, dz = pp[0] - t['x'], pp[2] - t['z']; n = math.hypot(dx, dz) or 1; dx, dz = dx / n, dz / n
                    await cine(pg, run, '%s_banyan_%s_%d' % (TAG, zone, k), [t['x'] + dx * 8, 1.6, t['z'] + dz * 8], [t['x'], 2.2, t['z']])
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    run.check('%s 椰林大道路面光圈：晚上看得到、白天看不到' % TAG, out.get('pools_20.5', {}).get('roadVisible', 0) > 0 and out.get('pools_13.0', {}).get('roadVisible', 1) == 0,
              json.dumps({k: {kk: v.get(kk) for kk in ('road', 'roadVisible')} for k, v in out.items() if k.startswith('pools')}, ensure_ascii=False))
    json.dump(out, open(os.path.join(OUT, 'looks_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    return out


async def main():
    run = L.Run('lamppost_' + TAG, OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        if not ONLY or 'lamp' in ONLY: await lamps(p, base, run)
        if not ONLY or 'look' in ONLY: await looks(p, base, run)
    run.finish()
asyncio.run(main())
