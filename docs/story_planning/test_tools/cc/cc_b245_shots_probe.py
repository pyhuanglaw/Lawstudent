"""CC（帳號 A）11-02 BB_245 第二批 #2、#3 的瀏覽器截圖（給 LAWWW／BB 看；Node 探針是 cc_b245_peishan.js、cc_b245_swing.js）。
LAWWW 驗法（docs/handoff/BB245_LAWWW_REPLY_1102.md 第一節）：
  BUG-05：撞不撞路人紅衣由 LAWWW 看截圖（D128）——這裡只截圖＋記她實際載到哪個模型，不判斷像不像路人。
  BUG-SWING-SEAT：瀏覽器 20:00 後盪鞦韆截圖。
SUBS（預設 peishan,swing）：
  peishan 【前置／捷徑】load_state（quiet_events、met_classmate_peishan）校園，法律系大一上（CALENDAR.termDays('Y1S1')）第 2 週的星期二 14:00——
          她的作息：Y1S1 週二、四 13:20～15:10 在文學院前的長椅（哲學概論旁聽，(-23.95,-12.6)），玩家站在旁邊 (-20.5,-12.6)。
          等作息把她放出來（GAME.E.npcs 有 charId classmate_peishan）；60 秒還沒有＝【捷徑】GAME.spawnCharacter 放在作息的位置（標示）。
          記：她身上的模型 key、driver、url（找 userData.key）；check：key＝char.classmate_peishan、不是備用人物。
          截圖：遊戲鏡頭（直接截）、E.cinematic 正面近一點、拉遠一點（連路人一起）。
  swing   【前置／捷徑】load_state（quiet_events）溫州街第 DAY 天 20:30，站在鞦韆前面（zones3d.js 的 ap：座位 x、鞦韆 z−1.4）。
          等 #interact（「盪鞦韆」；晚上公園有人時最近的可能是「打招呼」：換鞦韆 B 前面、再不行改下雨（公園沒人）重讀）→ 手指點 → 玩家走過去坐上鞦韆（wzpark3d.js sitHere）＋一句旁白 → 旁白還在時：check 玩家位置＝座位（< 0.05 m）、pose sit；
          截圖：遊戲鏡頭、側面（E.cinematic）。點完旁白。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [SUBS=peishan,swing] [DAY=7 WEEKDAY=2] python3 cc_b245_shots_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, asyncio, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_b245_common as C
from cc_b245_common import L, J, check, info, setup
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?'); DAY = int(os.environ.get('DAY', '7')); WD = int(os.environ.get('WEEKDAY', '2'))
SUBS = [x.strip() for x in os.environ.get('SUBS', 'peishan,swing').split(',') if x.strip()]
CAM = "((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)"
MODEL = """(id=>{ const n=GAME.E.npcs.find(k=>k.charId===id); if(!n) return null; let k=null, d=null; n.obj.traverse(x=>{ if(x.userData&&x.userData.key&&!k){ k=x.userData.key; d=x.userData.driver||null; } });
  const m=k&&ASSETS.manifest[k]; const o=n.obj.position; return {key:k, driver:d, url:m?m.url:null, x:+o.x.toFixed(2), z:+o.z.toFixed(2), yaw:+n.obj.rotation.y.toFixed(2), pose:n.pose}; })(%s)"""


REACH_JS = """(()=>{ const E=GAME.E; return E.interactables.filter(it=>it.park==='swing').map(it=>{ let best=null, at=null;
  for(let x=it.x-2; x<=it.x+2; x+=0.05) for(let z=it.z-2; z<=it.z+2; z+=0.05){ if(E.canStand&&!E.canStand(x,z,0.32,0)) continue; const d=Math.hypot(x-it.x,z-it.z); if(best===null||d<best){ best=d; at=[+x.toFixed(2),+z.toFixed(2)]; } }
  return {label:it.label, x:it.x, z:it.z, radius:it.radius||1.8, min:best===null?null:+best.toFixed(3), at, ap:it.seat&&it.seat.ap||null, hasCanStand:!!E.canStand}; }); })()"""


async def cam(pg, p, l):
    await pg.evaluate(CAM % (J(p), J(l)))


async def sub_peishan(pg, cdp):
    d = await pg.evaluate("""(()=>{ const r=CALENDAR.termDays('Y1S1'); for(let d=r.from+7; d<r.from+21; d++){ const w=CALENDAR.dateOf(d).wd; if(w===2) return {d, key:CALENDAR.dateOf(d).key}; } return null; })()""")
    info('大一上第 2 週的星期二：' + J(d))
    if not check('peishan 前置：找得到大一上第 2 週的星期二', bool(d)): return
    await C.load(pg, C.st('campus', 14.0, -20.5, -12.6, -1.57, day=d['d'], weekday=2, flags={'met_classmate_peishan': True}, extra={'stage': 'law'}),
                 '校園 %s（週二）14:00，站在文學院前長椅旁 (-20.5,-12.6)' % d['key'])
    m = None
    for _ in range(120):
        m = await pg.evaluate(MODEL % J('classmate_peishan'))
        if m and m['key']: break
        await pg.wait_for_timeout(500)
    if not (m and m['key']):
        setup('作息 60 秒內沒有放出沛珊：GAME.spawnCharacter 放在作息的位置 (-23.95,-12.6)')
        await pg.evaluate("(()=>{ const n=GAME.spawnCharacter('classmate_peishan',-23.95,-12.6,{yaw:-Math.PI/2}); if(n){ n.greet=false; } })()")
        for _ in range(120):
            m = await pg.evaluate(MODEL % J('classmate_peishan'))
            if m and m['key']: break
            await pg.wait_for_timeout(500)
    info('沛珊：' + J(m))
    check('peishan 她載到的模型 key＝char.classmate_peishan（url …/bl_classmate_peishan.vrm）、不是備用人物',
          bool(m and m['key'] == 'char.classmate_peishan' and (m['url'] or '').endswith('bl_classmate_peishan.vrm')), J(m))
    await pg.wait_for_timeout(2000)
    await pg.screenshot(path=os.path.join(OUT, 'peishan_game.png'))
    if m:
        x, z, yw = m['x'], m['z'], m['yaw']; fx, fz = math.sin(yw), math.cos(yw)
        await cam(pg, [x + fx * 2.6, 1.5, z + fz * 2.6], [x, 1.0, z]); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'peishan_front.png'))
        await cam(pg, [x + fx * 7 + fz * 3, 3.0, z + fz * 7 - fx * 3], [x, 1.0, z]); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'peishan_wide.png'))
        ex = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; return GAME.E.npcs.filter(n=>n.isExtra).map(n=>{ let k=null; n.obj.traverse(x=>{ if(x.userData&&x.userData.key&&!k) k=x.userData.key; }); return k; }).reduce((a,k)=>{ a[k]=(a[k]||0)+1; return a; },{}); })()")
        info('同一個畫面裡路人用的模型（key：人數）：' + J(ex))


async def sub_swing(pg, cdp):
    # 晚上公園有路人（AA_283）：站在鞦韆前面時最近的互動點可能是「打招呼」。依序試：鞦韆 A 前面、鞦韆 B 前面（晴）、鞦韆 A 前面（下雨＝公園沒有人）；
    # #interact 不是「盪鞦韆」就不點、換下一個（照玩家：換個位置站）
    lab = ''
    for wx, wz, wea in ((31.7, 23.4, 'sunny'), (33.5, 23.4, 'sunny'), (31.7, 23.4, 'rain')):
        await C.load(pg, C.st('wenzhou', 20.5, wx, wz, 0.0, day=DAY, weekday=WD, extra={'weather': wea}),
                     '溫州街第 %d 天 20:30（%s），站在鞦韆前面 (%.1f, %.1f)（zones3d.js 的 ap：座位 x、鞦韆 z−1.4）' % (DAY, wea, wx, wz))
        t = ''
        for _ in range(50):
            t = await C.interact_label(pg)
            if t: break
            await pg.wait_for_timeout(400)
        info('站好以後 #interact：「%s」' % t)
        if t.startswith('盪鞦韆'):
            await L.tap(pg, cdp, '#interact'); lab = t; break
    sw = await pg.evaluate("(()=>{ const L=WZ_PARK_LAYOUT, g=L.items.find(i=>i.kind==='swings'); return {g:{x:g.x,z:g.z}, seats:L.seats.filter(s=>s.kind==='swing')}; })()")
    info('鞦韆 layout：' + J(sw))
    # 11-03 補：站得到的地方按不按得到「盪鞦韆」（讀遊戲狀態：E.interactables 的 park:'swing' 互動點、radius；導航格上人物（半徑 0.32 m）站得住的點每 5 cm 掃一次）
    reach = await pg.evaluate(REACH_JS)
    info('鞦韆互動點和最近站得住的點：' + J(reach))
    for r in reach:
        check('swing 站得到的地方按得到「%s」（%.1f, %.1f）：最近站得住的點離互動點 < radius' % (r['label'], r['x'], r['z']), r['min'] is not None and r['min'] < r['radius'],
              '最近 %s m（%s）、radius %s、seat.ap %s' % (r['min'], J(r['at']), r['radius'], J(r['ap'])))
    info('點了 #interact：「%s」' % lab)
    check('swing 前置：#interact 是「盪鞦韆」（文字 startswith）', lab.startswith('盪鞦韆'), lab)
    s = None
    for _ in range(120):
        s = await pg.evaluate("(()=>{ const P=GAME.E.player, o=P.obj.position; return {x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), pose:P.pose, dlg:!!(GAME.D&&GAME.D.active), hour:+GAME.G.hour.toFixed(2)}; })()")
        if s['dlg']: break
        await pg.wait_for_timeout(500)
    info('坐上鞦韆、旁白出現時：' + J(s))
    near = min((math.hypot(s['x'] - q['x'], s['z'] - q['z']), q) for q in sw['seats']) if s else (99, None)
    check('swing 旁白出現時玩家坐在鞦韆座位上（< 0.05 m）、pose sit', bool(s and s['dlg'] and near[0] < 0.05 and s['pose'] == 'sit'), '離最近座位 %.3f m；%s' % (near[0], J(s)))
    await pg.screenshot(path=os.path.join(OUT, 'swing_game.png'))
    if s:
        await cam(pg, [s['x'] + 2.6, 1.3, s['z'] + 0.2], [s['x'], 0.7, s['z']]); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'swing_side.png'))
        await cam(pg, [s['x'] + 0.3, 1.5, s['z'] - 3.0], [s['x'], 0.8, s['z']]); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'swing_front.png'))
    await C.dismiss_dialogs(pg, cdp)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_b245_shots_probe  SHA=%s  URL=%s  SUBS=%s' % (SHA, URL, ','.join(SUBS)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.set_default_timeout(180000)
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        for k in SUBS:
            try:
                await (sub_peishan if k == 'peishan' else sub_swing)(pg, cdp)
            except Exception as e:
                check('%s 執行' % k, False, '例外：%r' % e)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    return C.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
