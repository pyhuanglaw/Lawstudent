"""CC-C（帳號 C）11-04：SOCLIB2F（BB-C 18:2x 派工；社科圖東側館 soclib_2f，LAWWW2 第二版接進 5aff1d18e）。只截圖、只記錄，不判（判定 BB；美術比對 LAWWW2）。
  MODE=shots（SOCLIB2F_shots）：六個角度 × HOURS（預設 11:00、20:30）× 手機橫向（844×390）、直向（390×844）：
    study_n    二樓自習室：從北面玻璃門（study_n，x −0.8、z −0.8）往南看
    window     靠窗那排（東牆 x 8、二樓窗 z −0.4～10.8）：從自習室西南往東北斜看整排
    disc       討論室 2 裡面（x 0.4～4、z −11.2～−6.8）：從門口往裡看桌子、白板
    corr_2f    二樓走廊（z −6.6～−5）：洗手間兩扇門（x −6.8、−4.4）＋飲水機（−5.6, −6.48）
    lobby_1f   一樓門廳：從西牆的門（−8, −8.4）往東看
    copy_1f    影印休息區（影印機 (0.6／1.7, 2.3)、沙發 (−2.2, −2.6～−0.2)、還書車、盆栽）：從東北往西南看
    人照遊戲放（不藏），玩家藏起來、HUD 藏；固定鏡頭（停主迴圈、手動畫一幀，同 cc_ade_v2_shots_probe 的 AIM）。
  MODE=crowd（SOCLIB2F_crowd）：大一上第 10 週、第 16 週的週二，HOURS 各一張全景（study_n 那個角度＋自習室中間往北看）；
    記 renderer.info（calls、tris）、場景裡的人數（E.npcs 在 soclib_2f 的）、完整 VRM 幾個（obj.userData.driver==='vrm'）、
    替身幾個（seated_figures 的 fig_* InstancedMesh 實例，_lod1＝遠處版）、EXLIB「有人了」的位子幾個（seat.taken）。
    對照組：博思 101 上課那張（219 calls、515k tris，SITAMB ⑧ d8_d382_back）。雲端 SwiftShader 的 calls、tris、人數算數，fps 不算（D131）。
  【前置／捷徑】讀檔指定地點、日子、時間（條件事件關閉）、固定鏡頭、藏玩家——不是玩家看到的流程，只用來比畫面、數人。Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
用法：LW_TESTS=<wt>/tests MODE=shots|crowd [HOURS=11,20.5] [CC_SEED=...] [ORIENT=land,port] python3 cc_soclib2f_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
MODE = os.environ.get('MODE') or 'shots'
HOURS = [float(x) for x in (os.environ.get('HOURS') or '11,20.5').split(',') if x.strip()]
ORIENT = [x for x in (os.environ.get('ORIENT') or ('land,port' if MODE == 'shots' else 'land')).split(',') if x]
FAILS = []
Y1 = 4.2
VIEWS = [  # (名稱, 層, 站的地方（讀檔）, 鏡頭, 看的點, 垂直 FOV)
    ('study_n', 1, (-0.4, -0.2), [-0.8, Y1 + 1.6, -0.3], [3.4, Y1 + 0.9, 10.8], 55),
    ('window', 1, (3.0, 10.4), [2.6, Y1 + 1.6, 10.8], [7.6, Y1 + 1.0, 1.0], 55),
    ('disc', 1, (2.2, -7.4), [3.4, Y1 + 1.55, -7.1], [0.9, Y1 + 0.9, -10.9], 60),
    ('corr_2f', 1, (2.0, -5.8), [3.2, Y1 + 1.6, -5.7], [-7.4, Y1 + 1.1, -6.5], 55),
    ('lobby_1f', 0, (-6.4, -8.4), [-7.5, 1.6, -8.4], [6.5, 1.1, -7.2], 55),
    ('copy_1f', 0, (5.0, -3.0), [6.4, 1.65, -4.4], [-1.6, 0.9, 1.4], 55),
]
CROWD_VIEWS = [VIEWS[0], ('study_s', 1, (3.0, 10.4), [3.2, Y1 + 2.2, 10.9], [3.2, Y1 + 0.6, -0.6], 60)]


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MESHN = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
AIM = """(([e,l,h,seed,fov])=>{ const E=GAME.E, G=GAME.G, cam=E.camera; E.paused=true; window.__ccSeed&&window.__ccSeed(seed); G.hour=h; E.hour=h; if(E.applyTime) E.applyTime(h); E.time=100; E._shT=0;
  if(E.player&&E.player.obj) E.player.obj.visible=false; const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<3;i++){ E.update(1/60); cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  cam.fov=fov; cam.updateProjectionMatrix(); E._shT=0; E.render(); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, fov:cam.fov, aspect:+cam.aspect.toFixed(4)};
  cam.fov=fov0; cam.updateProjectionMatrix(); return out; })"""
RELEASE = "(()=>{ const E=GAME.E; E.paused=false; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"
COUNT = r"""(()=>{ const E=GAME.E, G=GAME.G, M=new THREE.Matrix4(); const npcs=(E.npcs||[]).filter(n=>n&&n.obj&&n.obj.visible!==false);
  const drv={}; for(const n of npcs){ const d=(n.obj.userData&&n.obj.userData.driver)||'?'; drv[d]=(drv[d]||0)+1; }
  const seated=npcs.filter(n=>n.seat||n.beh==='sit'||(n.obj.userData&&n.obj.userData.sit)).length, lv={}; for(const n of npcs){ const k=n.lv|0; lv[k]=(lv[k]||0)+1; }
  let fig0=0, fig1=0; const kinds={}; E.scene.traverse(g=>{ if(!/^seated_figures:/.test(g.name||'')) return; for(const im of g.children){ if(!im.isInstancedMesh||!im.visible||!/^fig_/.test(im.name)) continue; const c=im.count|0; if(/_lod1$/.test(im.name)) fig1+=c; else fig0+=c; kinds[im.name]=c; } });
  const seats=(E.interactables||[]).filter(i=>i&&i.seat); const taken=seats.filter(i=>i.seat.taken).length, occ=seats.filter(i=>i.seat.occupied||i.seat.npc).length;
  const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; const sl=typeof SL2P!=='undefined';
  return {zone:G.zone, date:typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:G.day, term:t&&t.id, week:t&&t.week, exam:t&&t.exam||null, hour:+G.hour, npcs:npcs.length, byDriver:drv, byLv:lv, seatedNpc:seated,
    standIn:{lod0:fig0, lod1:fig1, kinds}, seats:seats.length, taken, occupied:occ, sl2p:sl?{finalWeeks:SL2P.finalWeeks(G.day), frac:+SL2P.frac(G).toFixed(3), open:SL2P.open(G)}:null}; })()"""


async def stable(pg, cap=90):
    t0 = time.time(); last, same = -1, 0
    while time.time() - t0 < cap:
        n = await pg.evaluate(MESHN)
        if n == last: same += 1
        else: same, last = 0, n
        if same >= 4 and n > 0: break
        await pg.wait_for_timeout(1000)
    return last, time.time() - t0


async def enter(pg, cdp, day, h, lv, x, z):
    st = {'zone': 'soclib_2f', 'hour': h, 'day': day, 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': 0, 'lv': lv}}
    await pg.evaluate(RELEASE)
    await L.load_state(pg, st, quiet_events=True)
    n, sec = await stable(pg)
    await pg.wait_for_timeout(3000)   # 人（SL2P.populate、EXLIB.fill）在進區域以後才放
    await L.close_panels(pg, cdp)
    return n, sec


async def main():
    os.makedirs(OUT, exist_ok=True)
    seed = int(os.environ.get('CC_SEED') or 20261104)
    print('CC SOCLIB2F MODE=%s HOURS=%s ORIENT=%s；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (MODE, HOURS, ORIENT, os.environ.get('SHA', '?')), flush=True)
    meta = {'mode': MODE, 'shots': {}, 'crowd': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, seed)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        days = await pg.evaluate("(()=>({w10:STORY.termDayIn('Y1S1',10,2), w16:STORY.termDayIn('Y1S1',16,2), w14:STORY.termDayIn('Y1S1',14,2)}))()")
        check('拿得到日子（大一上第 10、14、16 週的週二）', all(v is not None for v in days.values()), J(days))
        if MODE == 'shots':
            day = days['w10']
            for h in HOURS:
                for orient in ORIENT:
                    await pg.set_viewport_size({'width': 844, 'height': 390} if orient == 'land' else {'width': 390, 'height': 844}); await pg.wait_for_timeout(800)
                    for k, (name, lv, (sx, sz), e, l, fov) in enumerate(VIEWS):
                        n, sec = await enter(pg, cdp, day, h, lv, sx, sz)
                        c = await pg.evaluate(COUNT)
                        if not check('[%s %s %02d%02d] 讀檔進到 soclib_2f（mesh %s、%.0f 秒穩定）' % (name, orient, int(h), int(round(h % 1 * 60)), n, sec), c['zone'] == 'soclib_2f', J({'zone': c['zone'], 'date': c['date']})):
                            continue
                        await pg.evaluate(HUD + '(false)')
                        ri = await pg.evaluate(AIM + '(%s)' % J([e, l, h, seed + k, fov]))
                        fn = 'soclib2f_%s_%s_%02d%02d.png' % (name, orient, int(h), int(round(h % 1 * 60)))
                        await pg.screenshot(path=os.path.join(OUT, fn))
                        meta['shots'][fn] = dict(ri, cam=e, look=l, lv=lv, hour=h, orient=orient, people=c['npcs'], byDriver=c['byDriver'], standIn=c['standIn'], date=c['date'])
                        print('  %s：calls %s、tris %s；人 %s（%s）、替身 %s' % (fn, ri['calls'], ri['tris'], c['npcs'], J(c['byDriver']), J({'lod0': c['standIn']['lod0'], 'lod1': c['standIn']['lod1']})), flush=True)
                        await pg.evaluate(HUD + '(true)')
        else:
            for wk in ('w10', 'w16'):
                for h in HOURS:
                    name0, lv0, (sx, sz) = CROWD_VIEWS[0][0], CROWD_VIEWS[0][1], CROWD_VIEWS[0][2]
                    n, sec = await enter(pg, cdp, days[wk], h, lv0, sx, sz)
                    c = await pg.evaluate(COUNT)
                    if not check('[crowd %s %02d%02d] 讀檔進到 soclib_2f（mesh %s、%.0f 秒穩定）' % (wk, int(h), int(round(h % 1 * 60)), n, sec), c['zone'] == 'soclib_2f', J({'zone': c['zone'], 'date': c['date']})):
                        continue
                    row = dict(c, wk=wk, shots={})
                    await pg.evaluate(HUD + '(false)')
                    for k, (name, lv, _st, e, l, fov) in enumerate(CROWD_VIEWS):
                        ri = await pg.evaluate(AIM + '(%s)' % J([e, l, h, seed + k, fov]))
                        fn = 'soclib2f_crowd_%s_%s_%02d%02d.png' % (wk, name, int(h), int(round(h % 1 * 60)))
                        await pg.screenshot(path=os.path.join(OUT, fn)); row['shots'][fn] = ri
                    await pg.evaluate(HUD + '(true)')
                    meta['crowd'].append(row)
                    s0 = list(row['shots'].values())[0]
                    print('  [crowd] %s %s（%s 第 %s 週%s）%02d:%02d：人 %d（%s；二樓 %s）、坐著 %d、替身 lod0 %d／lod1 %d、位子 %d（有人了 %d）；%s calls %s、tris %s；SL2P %s' % (
                        wk, c['date'], c['term'], c['week'], '、' + c['exam'] if c['exam'] else '', int(h), int(round(h % 1 * 60)), c['npcs'], J(c['byDriver']), c['byLv'].get('1', c['byLv'].get(1)),
                        c['seatedNpc'], c['standIn']['lod0'], c['standIn']['lod1'], c['seats'], c['taken'], CROWD_VIEWS[0][0], s0['calls'], s0['tris'], J(c['sl2p'])), flush=True)
            if meta['crowd']:
                mx = max(meta['crowd'], key=lambda r: list(r['shots'].values())[0]['tris'])
                s0 = list(mx['shots'].values())[0]
                print('INFO 最多的一張：%s %02d:%02d calls %s、tris %s——對照博思 101 上課（219 calls、515k tris）：calls %+d（%.0f%%）、tris %+.0fk（%.0f%%）' % (
                    mx['wk'], int(mx['hour']), int(round(mx['hour'] % 1 * 60)), s0['calls'], s0['tris'], s0['calls'] - 219, (s0['calls'] / 219 - 1) * 100, (s0['tris'] - 515000) / 1000, (s0['tris'] / 515000 - 1) * 100), flush=True)
        await pg.evaluate(RELEASE)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'soclib2f_%s.json' % MODE), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
