"""CC-B（帳號 B）11-07：BB-B 03:50 派工——LAWWW2-B 345574e2d 兩包的遊戲內截圖（D131：要 PC GPU）。
  PARTS（預設全部）：
    moku     MOKU_WINVIEW：木曜日（wz_mokuyobi）窗景卡（網格名有 mok_window_view／VIEW）從店裡往外看，白天 14:00、晚上 21:00 各一張；
             記下卡用的貼圖網址（改好的版本應該是 mokuyobi_view_day／night.webp，改之前是手繪樹 mok_view）。BB 看圖判。
    flicker  DAKOU_FLICKER（WINDOW-FLICKER-1107）：大口漢堡（xs_dakou）晚上 21:00，對著西側窗（NIGHT_WEST）同一個鏡頭連拍 10 張、每張隔 0.3 秒；
             鏡頭每張橫移 1 cm（z-fighting 要鏡頭動才會跳；靜止的鏡頭兩張圖的勝負固定）。算張與張之間窗景卡那一塊的平均像素差。
             另外直接數：看得到的夜景卡有沒有兩張疊在同一個平面（中心差 < 5 cm、法向相同）。
             改之前（abf4dbbd5）當對照：應該有疊、差值大；改好的應該沒疊、差值接近 0（只剩 1 cm 的視差）。
  【前置／捷徑】讀檔到店裡出生點（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [PARTS=moku,flicker] [EXPECT=fixed|before] python3 cc_winview_1107_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('winview_1107', OUT); D.setup(R, OUT)
DAY = '2025-10-18'
PARTS = [x for x in (os.environ.get('PARTS') or 'moku,flicker').split(',') if x]
EXPECT = os.environ.get('EXPECT', '').strip()   # fixed：改好的版本（沒有疊的夜景卡才 PASS）；before：改之前的對照（只記錄）；空＝只記錄
CARDS = r"""((re)=>{ const z=GAME.E.zone, out=[]; if(!z||!z.group) return out; const rx=new RegExp(re,'i'); z.group.traverse(o=>{ if(!o.isMesh||!rx.test(o.name||'')) return; let vis=true; for(let p=o;p;p=p.parent) if(p.visible===false){ vis=false; break; }
  o.updateWorldMatrix(true,false); const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); const m=[].concat(o.material)[0], map=m&&m.map;
  out.push({name:o.name, vis, c:[+c.x.toFixed(3),+c.y.toFixed(3),+c.z.toFixed(3)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)], lv:(o.userData&&o.userData.dkLv!=null)?o.userData.dkLv:null,
    url:(map&&map.userData&&map.userData.url)||(map&&map.image&&(map.image.currentSrc||map.image.src)||'').slice(-70)||null}); }); return out; })"""
DIFF = r"""(async (a)=>{ const load=s=>new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src='data:image/png;base64,'+s; });
  const [A,B]=await Promise.all([load(a.a),load(a.b)]); const w=A.width,h=A.height, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d');
  g.drawImage(A,0,0); const da=g.getImageData(0,0,w,h).data; g.clearRect(0,0,w,h); g.drawImage(B,0,0); const db=g.getImageData(0,0,w,h).data;
  const [x0,y0,x1,y1]=a.box.map((v,k)=>Math.round(v*(k%2?h:w))); let s=0,n=0,big=0; for(let y=y0;y<y1;y+=2) for(let x=x0;x<x1;x+=2){ const k=(y*w+x)*4; const d=(Math.abs(da[k]-db[k])+Math.abs(da[k+1]-db[k+1])+Math.abs(da[k+2]-db[k+2]))/3; s+=d; n++; if(d>40) big++; }
  return {mean:+(s/Math.max(n,1)).toFixed(2), bigFrac:+(big/Math.max(n,1)).toFixed(4), n}; })"""


def coplanar(cards):
    """看得到的兩張卡：薄的那一軸同一個座標（差 < 5 cm）、另外兩軸的範圍有重疊＝疊在同一個平面（一樓、二樓的卡高度不同，中心不一樣，但重疊的那一段會 z-fighting）"""
    v = [c for c in cards if c['vis']]; pairs = []
    for i in range(len(v)):
        for j in range(i + 1, len(v)):
            a, b = v[i], v[j]; ta = min(range(3), key=lambda k: a['size'][k]); tb = min(range(3), key=lambda k: b['size'][k])
            if ta != tb or abs(a['c'][ta] - b['c'][ta]) >= 0.05: continue
            ov = [min(a['c'][k] + a['size'][k] / 2, b['c'][k] + b['size'][k] / 2) - max(a['c'][k] - a['size'][k] / 2, b['c'][k] - b['size'][k] / 2) for k in range(3) if k != ta]
            if all(o > 0.01 for o in ov): pairs.append([a['name'], b['name'], [round(o, 2) for o in ov]])
    return pairs


async def clear_ui(pg, cdp):
    for _ in range(24):
        q = await D.st(pg)
        if not q['dlg'] and not q['choices']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        elif q['choices']: await L.tap(pg, cdp, '#choices button:last-child')
        await pg.wait_for_timeout(500)


def inward_eye(card, spawn, dist, y=None):
    c, s = card['c'], card['size']
    if s[0] < s[2]: d = 1 if spawn[0] > c[0] else -1; return [c[0] + d * dist, y if y is not None else c[1], c[2]]
    d = 1 if spawn[1] > c[2] else -1; return [c[0], y if y is not None else c[1], c[2] + d * dist]


async def part_moku(pg, cdp):
    for tn, h in (('day', 14.0), ('night', 21.0)):
        tag = '[moku %s]' % tn
        R.setup('%s 讀檔木曜日 %s %05.2f（店裡出生點）' % (tag, DAY, h))
        s = await D.load_zone(pg, cdp, 'wz_mokuyobi', DAY, h, wait=8000)
        if not R.check('%s 讀到木曜日' % tag, s['zone'] == 'wz_mokuyobi', J(s)): continue
        await clear_ui(pg, cdp)
        cards = await pg.evaluate(CARDS, 'mok_window_view|_VIEW')
        R.note('%s 窗景卡：%s' % (tag, J(cards)))
        card = next((c for c in cards if 'mok_window_view' in c['name'] and c['vis']), None) or next((c for c in cards if c['vis']), None)
        if not R.check('%s 找得到看得見的窗景卡（mok_window_view）' % tag, bool(card), J(cards)): continue
        sp = await pg.evaluate("(()=>{ const z=GAME.E.zone, s=z.spawn||{x:0,z:0}; return [s.x,s.z]; })()")
        R.note('%s 用的貼圖：%s（改好的應該是 mokuyobi_view_%s.webp）' % (tag, card['url'], tn))
        for k, dist in enumerate((4.0, 6.5)):
            await D.user_shot(pg, cdp, 'moku_winview_%s_%d' % (tn, k), {'eye': inward_eye(card, sp, dist, card['c'][1] - 0.3), 'look': card['c'], 'lens': 22})
        if EXPECT == 'fixed':
            R.check('%s 窗景卡換成溫州街照片（mokuyobi_view_%s）' % (tag, tn), bool(card['url']) and ('mokuyobi_view_' + tn) in card['url'], card['url'])


STAND2 = r"""((lv)=>{ const E=GAME.E; let best=null; for(let x=-6;x<=6;x+=0.5) for(let z=-6;z<=8;z+=0.5){ if(!E.canStand(x,z,0.3,lv)) continue; const d=Math.hypot(x,z-2); if(!best||d<best.d) best={x,z,d}; } return best; })"""


async def burst(pg, cdp, tag, card, sp, name):
    eye0 = inward_eye(card, sp, 4.0, card['c'][1]); thin = 'x' if card['size'][0] < card['size'][2] else 'z'
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.HUD + '(false)')
    shots = []
    for i in range(10):
        eye = list(eye0); eye[2 if thin == 'x' else 0] += 0.01 * i   # 沿著卡橫移 1 cm
        look = list(card['c']); look[2 if thin == 'x' else 0] += 0.01 * i
        await pg.evaluate(D.CAM, {'eye': eye, 'look': look, 'lens': 24}); await pg.evaluate("GAME.E.render()")
        b = await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (name, i))); shots.append(base64.b64encode(b).decode())
        await pg.wait_for_timeout(300)
    await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    box = [0.3, 0.25, 0.7, 0.75]   # 畫面中間（鏡頭對著卡的中心、離 4 m）
    ds = [await pg.evaluate(DIFF, {'a': shots[i], 'b': shots[i + 1], 'box': box}) for i in range(9)]
    mx = max(d['mean'] for d in ds); avg = sum(d['mean'] for d in ds) / len(ds)
    R.note('%s %s 連拍 10 張（鏡頭每張橫移 1 cm、隔 0.3 秒）張與張的差（畫面中間，0～255）：最大 %.2f、平均 %.2f、像素差 >40 的比例最大 %.4f；%s_00～09.png' % (tag, card['name'], mx, avg, max(d['bigFrac'] for d in ds), name))
    return {'card': card['name'], 'c': card['c'], 'diffs': ds, 'max': mx, 'avg': avg}


async def part_flicker(pg, cdp):
    out = []
    for lv in (0, 1):
        tag = '[flicker 21:00 %s]' % ('一樓' if lv == 0 else '二樓')
        R.setup('%s 讀檔大口漢堡 %s 21:00（%s）' % (tag, DAY, '店裡出生點' if lv == 0 else '二樓站得住、離店中間最近的一點'))
        s = await D.load_zone(pg, cdp, 'xs_dakou', DAY, 21.0, wait=8000)
        if not R.check('%s 讀到大口' % tag, s['zone'] == 'xs_dakou', J(s)): return
        if lv == 1:
            p2 = await pg.evaluate(STAND2, 1)
            if not R.check('%s 二樓有站得住的地方' % tag, bool(p2), J(p2)): continue
            s = await D.load_zone(pg, cdp, 'xs_dakou', DAY, 21.0, x=p2['x'], z=p2['z'], lv=1, wait=8000)
            if not R.check('%s 人在二樓（lv 1）' % tag, s['lv'] == 1, J(s)): continue
        await clear_ui(pg, cdp); await pg.wait_for_timeout(1500)
        cards = await pg.evaluate(CARDS, 'NIGHT_')
        R.note('%s 夜景卡（玩家第 %s 層）：%s' % (tag, s['lv'], J(cards)))
        pairs = coplanar(cards)
        R.note('%s 看得到、疊在同一個平面的夜景卡：%s' % (tag, J(pairs)))
        if EXPECT == 'fixed': R.check('%s 看得到的夜景卡沒有兩張疊在同一個平面' % tag, not pairs, J(pairs))
        vis = [c for c in cards if c['vis']]
        if not vis: R.note('%s 沒有看得到的夜景卡（正面是視差窗景的話正常），不拍連拍' % tag); continue
        sp = [s['x'], s['z']]
        seen = set()
        for c in vis:
            if c['name'] in seen: continue
            seen.add(c['name'])
            out.append(dict(await burst(pg, cdp, tag, c, sp, 'dakou_flicker_lv%d_%s' % (lv, c['name'].lower())), lv=lv, coplanar=pairs))
    with open(os.path.join(OUT, 'dakou_flicker_diff.json'), 'w', encoding='utf-8') as f:
        json.dump({'expect': EXPECT, 'bursts': out}, f, ensure_ascii=False, indent=1)


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC WINVIEW_1107（木曜日窗景、大口窗外閃）：SHA=%s（worktree 實際 %s）；PARTS=%s；EXPECT=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', PARTS, EXPECT or '-'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        have = await pg.evaluate("Object.keys(Z3.ZONES)")
        for nm, zone, fn in (('moku', 'wz_mokuyobi', part_moku), ('flicker', 'xs_dakou', part_flicker)):
            if nm not in PARTS: continue
            if not R.check('[%s] 這一版有 %s（Z3.ZONES）' % (nm, zone), zone in have): continue
            print('== %s' % nm, flush=True)
            try: await fn(pg, cdp)
            except Exception as ex: R.check('[%s] 探針沒有例外' % nm, False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
