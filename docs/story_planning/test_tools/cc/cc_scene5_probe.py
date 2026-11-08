"""CC-B（帳號 B）11-07：BB-B 19:08 派工——公館燒臘（noodle）、頁間書屋（bookstore）光照（LAWWW2-B 09bbfefe2 → LAWWW-B f7444d194；測 9c0120628；對照 e647887c7 烘之前）。D120 由 BB 判。
TAG＝before｜after（同一支探針在兩個版本各跑一次，同機位）。PART＝shaola,yejian（預設兩間）。【前置／捷徑】讀檔進店（條件事件關閉），2025-10-18 週六。
每間 14:00、21:00 各拍（新 CAM，固定機位）：door＝進門第一個畫面、top＝全店俯視、seat＝坐下的位置（燒臘用餐桌、頁間書屋窗邊吧台）、out＝往門外窗外、clerk＝店員／人物站的地方
另外印：材質數、接了光照貼圖的材質數、用哪幾張、有沒有第二套 UV（uv1）的網格數、白色（貼圖沒載到）材質數、載入失敗（CHAR／ASSETS failures）。
判定＝BB（雲端只判功能：黑、空、斑；顏色等 PC）。用法：LW_TESTS=<wt>/tests TAG=after python3 cc_scene5_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
TAG = os.environ.get('TAG') or 'x'
PARTS = [p_ for p_ in (os.environ.get('PART') or 'shaola,yejian').split(',') if p_]   # 其他名字＝區域 id、自動機位
R = L.Run('scene5_' + TAG, OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
VIEWS = {
    'shaola': ('noodle', [('door', [0.0, 1.6, 6.0], [0.0, 1.0, -5.0], 18), ('top', [0.0, 8.5, 1.0], [0.0, 0.0, -0.5], 16), ('seat', [-0.6, 1.4, 3.6], [-2.1, 0.6, 1.6], 22),
                          ('out', [0.4, 1.5, 1.2], [0.0, 1.4, 8.0], 20), ('clerk', [0.0, 1.6, 0.4], [2.4, 1.2, 0.6], 24)]),
    'yejian': ('bookstore', [('door', [-4.6, 1.6, 4.4], [2.0, 1.0, -4.0], 18), ('top', [0.0, 9.0, 1.0], [0.0, 0.0, -0.5], 16), ('seat', [0.2, 1.5, 1.8], [0.2, 0.8, 4.05], 22),
                              ('out', [0.5, 1.6, 2.2], [1.0, 1.4, 8.0], 20), ('clerk', [-1.0, 1.6, 0.5], [-3.5, 1.2, -3.0], 20)]),
}
AUTO = r"""(()=>{ const E=GAME.E, z=E.zone, P=E.player.obj.position, yaw=E.player.obj.rotation.y; const box=new THREE.Box3();
  z.group.traverse(o=>{ if(o.isMesh&&o.visible){ const b=new THREE.Box3().setFromObject(o); const s=b.getSize(new THREE.Vector3()); if(s.x<40&&s.z<40) box.union(b); } });
  const c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3()); const fx=Math.sin(yaw), fz=Math.cos(yaw); const y0=+P.y||0;   /* 店在二樓（木曜日出生點 y 1.2）：機位高度都從玩家腳下算（BB-B 01:58）*/
  const V={}; const r2=v=>v.map(x=>+(+x).toFixed(2));
  const cl=(E.npcs||[]).find(n=>n&&(n.clerk||n.staff)&&n.obj); const fy=cl?+cl.obj.position.y:y0; const up=fy-y0>1;   /* 店在樓上（木曜日：出生點在樓梯口 y 1.2，店 y 3.2）：店內機位用店員那一層 */
  V.door=up?{eye:r2([c.x,fy+1.6,c.z+sz.z*0.35]), look:r2([c.x,fy+1.0,c.z-sz.z*0.4]), lens:18}:{eye:r2([P.x-fx*0.3,y0+1.6,P.z-fz*0.3]), look:r2([P.x+fx*6,y0+1.0,P.z+fz*6]), lens:18};
  V.top={eye:r2([c.x,Math.max(7,sz.y+5),c.z+0.8]), look:r2([c.x,0,c.z-0.3]), lens:16};
  const onUp=i=>(i.seat.lv|0)>=1||(i.lv|0)>=1||(i.seat.y!=null&&Math.abs(+i.seat.y-fy)<0.8); const seat=E.interactables.find(i=>i.seat&&!i.hidden&&(!up||onUp(i)))||E.interactables.find(i=>i.seat&&!i.hidden); if(seat){ const sx=seat.seat.x, sz2=seat.seat.z; const sy=seat.seat.y!=null?+seat.seat.y:(up&&onUp(seat)?fy:y0); V.seat={eye:r2([sx+(c.x-sx)*0.35+0.4,sy+1.4,sz2+(c.z-sz2)*0.35+0.4]), look:r2([sx,sy+0.6,sz2]), lens:22}; }
  if(cl){ const q=cl.obj.position; const dx=c.x-q.x, dz=c.z-q.z, d=Math.hypot(dx,dz)||1; const qy=+q.y||0; V.clerk={eye:r2([q.x+dx/d*2.2,qy+1.6,q.z+dz/d*2.2]), look:r2([q.x,qy+1.2,q.z]), lens:24}; }
  V.out=up?{eye:r2([c.x,fy+1.55,c.z-sz.z*0.2]), look:r2([c.x,fy+1.4,c.z+sz.z*0.6]), lens:20}:{eye:r2([P.x+fx*2.5,y0+1.55,P.z+fz*2.5]), look:r2([P.x-fx*6,y0+1.4,P.z-fz*6]), lens:20};
  return {bmin:r2([box.min.x,box.min.y,box.min.z]), bmax:r2([box.max.x,box.max.y,box.max.z]), spawn:r2([P.x,P.z]), y0:+y0.toFixed(2), fy:+fy.toFixed(2), up, yaw:+yaw.toFixed(2), center:r2([c.x,c.z]), size:r2([sz.x,sz.y,sz.z]), clerk:cl?r2([cl.obj.position.x,cl.obj.position.z]):null, seat:seat?r2([seat.seat.x,seat.seat.z]):null, seatLv:seat?[seat.seat.lv,seat.lv,seat.seat.y]:null, views:V}; })()"""
INFO = r"""(()=>{ const z=GAME.E.zone; let n=0, lm=0, uv1=0, white=0, meshes=0; const maps=new Set(), views=[];
  z.group.traverse(o=>{ if(/VIEW/i.test(o.name||'')) views.push({n:o.name, vis:o.visible}); if(!o.isMesh) return; meshes++; if(o.geometry&&o.geometry.attributes&&o.geometry.attributes.uv1) uv1++;
    for(const m of [].concat(o.material)){ if(!m) continue; n++; if(m.lightMap){ lm++; maps.add(((m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src))||m.lightMap.name||'?').split('/').pop()); }
      if(m.isMeshStandardMaterial&&!m.map&&m.color&&m.color.r>0.97&&m.color.g>0.97&&m.color.b>0.97) white++; } });
  const fails=(typeof CHAR!=='undefined'&&CHAR.failures)?CHAR.failures.slice(0,5):null; const af=(typeof ASSETS!=='undefined'&&ASSETS.failed)?Object.keys(ASSETS.failed).slice(0,8):null;
  return {meshes, mats:n, withLightMap:lm, maps:[...maps], uv1Meshes:uv1, whiteNoTexMats:white, views:views.slice(0,6), charFailures:fails, assetFailed:af, glb:z.formal||z.formalInfo||null}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 燒臘、頁間書屋光照（%s）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'tag': TAG, 'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for part in PARTS:
                if part in VIEWS: zone, views = VIEWS[part]
                else: zone, views = part, None   # BB-B 20:51：溫州街六間＝自動機位（照遊戲裡的出生點、店員、座位、區域範圍算）
                SLOTS = (('1400', 14.0), ('2100', 21.0))
                if os.environ.get('SLOTS'): SLOTS = tuple((a, float(b)) for a, b in (x.split(':') for x in os.environ['SLOTS'].split(',')))   # 例 SLOTS=1400:14,1750:17.8333,1930:19.5
                for tn, h in [x for x in SLOTS if not os.environ.get('HOURS') or x[0] in os.environ['HOURS'].split(',')]:
                    tag = '[%s %s %s]' % (TAG, part, tn)
                    try:
                        R.setup('%s 讀檔 %s %s %.1f（條件事件關閉）' % (tag, zone, DAY, h))
                        s = await D.load_zone(pg, cdp, zone, DAY, h, wait=9000)
                        if s['zone'] != zone:   # 讀檔進不去、停在門口：記下來，再讀一次（區分偶發和營業時間）
                            R.note('%s 第一次讀檔停在 %s（互動「%s」），再讀一次' % (tag, s['zone'], s.get('interact')))
                            s = await D.load_zone(pg, cdp, zone, DAY, h, wait=12000)
                        if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): continue
                        await pg.wait_for_timeout(3000)
                        info = await pg.evaluate(INFO); R.note('%s 材質／光照貼圖：%s' % (tag, J(info)))
                        r = rec.setdefault(part, {}).setdefault(tn, {'info': info})
                        if views is None:
                            av = await pg.evaluate(AUTO); R.note('%s 自動機位：%s' % (tag, J(av)))
                            views = [(k, v['eye'], v['look'], v['lens']) for k, v in av['views'].items()]
                            if os.environ.get('CORNERS'):   # CC-B 11-08（BB-B 11:33 新生南路九間）：房間中間 0.6 m 高，往兩個對角的牆腳看
                                c, mn, mx, fy_ = av['center'], av['bmin'], av['bmax'], av['fy']
                                views += [('corner_a', [c[0], fy_ + 0.6, c[1]], [mn[0] + 0.3, fy_ + 0.05, mn[2] + 0.3], 20.0), ('corner_b', [c[0], fy_ + 0.6, c[1]], [mx[0] - 0.3, fy_ + 0.05, mx[2] - 0.3], 20.0)]
                                for f2 in (os.environ.get('FLOOR2') or '').split(','):   # 「區域:二樓地板高」（大口 2F）
                                    if f2.startswith(zone + ':'):
                                        y2 = float(f2.split(':')[1])
                                        views += [('room_2f', [c[0], y2 + 1.6, mx[2] - 0.6], [c[0], y2 + 1.0, mn[2] + 0.5], 18.0), ('corner_2f_a', [c[0], y2 + 0.6, c[1]], [mn[0] + 0.3, y2 + 0.05, mn[2] + 0.3], 20.0), ('corner_2f_b', [c[0], y2 + 0.6, c[1]], [mx[0] - 0.3, y2 + 0.05, mx[2] - 0.3], 20.0)]
                            r['auto'] = av
                        ex = [e.split('|') for e in (os.environ.get('EXTRA') or '').split(';') if e.count('|') == 4] + [e.split('@') for e in (os.environ.get('EXTRA2') or '').split('/') if e.count('@') == 4]   # EXTRA2＝PC 佇列用（ENV 已經用 ; 和 | 分欄）：項目之間 /、欄位之間 @   # EXTRA＝part|名字|ex,ey,ez|lx,ly,lz|lens;…（加拍的固定機位，例：總圖 B1 中庭往上看）
                        xv = [(e[1], [float(v) for v in e[2].split(',')], [float(v) for v in e[3].split(',')], float(e[4])) for e in ex if e[0] == part]
                        on2 = False
                        VO = [v for v in (os.environ.get('VIEWS_ONLY') or '').split(',') if v]   # PC 一項結果截圖上限 25 MB：只拍這幾個機位（例 door,corner_a,corner_b）
                        for nm, eye, look, lens in list(views) + xv:
                            if VO and nm not in VO: continue
                            if '_2f' in nm and not on2:   # 2F 的機位：玩家要站在 2F（lv1），遊戲才會顯示 2F（玩家在 1F 時樓上藏起來；11-08 第一輪拍到的是 1F 俯視）
                                on2 = True
                                p2 = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(i=>i.seat&&((i.seat.lv|0)>=1||(i.lv|0)>=1)); return q?{x:q.x,z:q.z}:null; })()")
                                R.setup('%s 【前置／捷徑】讀檔把玩家放到 2F（lv1，2F 座位旁 %s）再拍 2F' % (tag, J(p2)))
                                if p2:
                                    s2 = await D.load_zone(pg, cdp, zone, DAY, h, x=p2['x'], z=p2['z'] + 0.6, yaw=0.0, lv=1, wait=9000); await pg.wait_for_timeout(3000)
                                    R.note('%s 2F 讀檔後：%s；玩家 lv %s' % (tag, J(s2), await pg.evaluate("GAME.E.player.lv|0")))
                                    pp = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(2), +o.z.toFixed(2)]; })()")
                                    mn_, mx_ = av['bmin'], av['bmax']; y2_ = float(next(f.split(':')[1] for f in os.environ['FLOOR2'].split(',') if f.startswith(zone + ':')))
                                    wx = mn_[0] + 0.3 if abs(pp[0] - mn_[0]) < abs(pp[0] - mx_[0]) else mx_[0] - 0.3   # BB-B 12:26：2F 牆腳改從走道（玩家站的那一點）1.4 m 高往最近的兩面牆腳看
                                    wz = mn_[2] + 0.3 if abs(pp[1] - mn_[2]) < abs(pp[1] - mx_[2]) else mx_[2] - 0.3
                                    C2 = {'corner_2f_a': ([pp[0], y2_ + 1.4, pp[1]], [wx, y2_ + 0.05, pp[1]]), 'corner_2f_b': ([pp[0], y2_ + 1.4, pp[1]], [pp[0], y2_ + 0.05, wz])}
                                    R.note('%s 2F 牆腳機位：玩家 %s；%s' % (tag, J(pp), J(C2)))
                            if nm in ('corner_2f_a', 'corner_2f_b') and on2 and 'C2' in dir():
                                eye, look = C2[nm]
                            r[nm] = await D.user_shot(pg, cdp, 's5_%s_%s_%s_%s' % (TAG, part, tn, nm), {'eye': eye, 'look': look, 'lens': lens})
                    except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'scene5_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
