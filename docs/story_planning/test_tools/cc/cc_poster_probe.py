"""CC（帳號 A）11-10：南洋戲院 72 張海報（X314／MOVIE-POSTERS-ALL-1110；BB 18:42 P0 第 2 項；候選 fe5fa4a79）。Playwright（PC GPU）≠ iPhone。
對照的程式（fe5fa4a79）：src/data/nanyang_movies.js（AA_730 片單：periods 每兩個月一段、bill 兩部、id＝assets/posters/<id>.webp）、
  src/movies3d.js（S.POSTERS、S.posterUrl、S.drawPoster：片名畫在 512×768 的 (256,96)，字 64px 起、寬 >460 就縮、最小 28；
  S.decorLobby：大廳右牆兩張＝那一天那一段的 bill；S.decorHall／S.showScreen：1 廳銀幕）。
A 載入：片單的每個 id → 在 S.POSTERS 裡、fetch 200、Image 解碼成功（寬高）、S.film 有片名；全程 response 404／海報載入失敗的 console 記下來。
  片名寬度：照 drawPoster 同一個字型縮字，記最後字級；縮到 28 還 >460＝會超出。
  所有 72 張用遊戲自己的 S.drawPoster 畫（圖＋片名）拼一張 poster_all72.jpg（12×6）。
B 大廳：每一段挑那一段當中的一天（YYYY-MM-15）【前置／捷徑】讀檔到大廳 14:00 → 等兩張海報都貼上（mesh.visible）→ 拍照鏡頭對右牆兩張（不改遊戲鏡頭）；
  2025-09 以前（舊序章系所大一 Y0）是負的天數（STORY.dayOfKey 從 −420 天找），照樣讀得到。拼 poster_lobby.jpg。
C 1 廳：讀檔到 1 廳一次 →【捷徑】每一段抽一張（單數段 a、雙數段 b）MOVIES.showScreen(id) → 等貼上 → 拍銀幕。拼 poster_hall.jpg。
用法：LW_TESTS=<wt>/tests [PARTS=A,B,C] python3 cc_poster_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'A,B,C').split(',')
FROM = os.environ.get('FROM') or ''   # r2：只拍這一段以後的大廳（例 2029-05）
R = L.Run('posters', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

LOADCHK = r"""(async()=>{ const M=NANYANG_MOVIES, out=[]; const font=s=>'bold '+s+'px "Noto Serif TC","Noto Sans TC","PingFang TC","Microsoft JhengHei",serif';
  const cx=document.createElement('canvas').getContext('2d');
  for(const p of M.periods) for(const b of p.bill){ const url=MOVIES.posterUrl(b.id); const r={id:b.id, period:p.from, title:b.title, inList:MOVIES.POSTERS.includes(b.id), url, film:!!(MOVIES.film(b.id)||{}).title};
    if(url){ try{ const f=await fetch(url,{cache:'no-store'}); r.status=f.status; r.bytes=+(f.headers.get('content-length')||0); }catch(e){ r.status='ERR '+e; }
      r.img=await new Promise(res=>{ const im=new Image(); im.onload=()=>res([im.naturalWidth,im.naturalHeight]); im.onerror=()=>res(null); im.src=url; }); }
    let fs=64; cx.font=font(fs); while(fs>28&&cx.measureText(b.title).width>460){ fs-=4; cx.font=font(fs); } r.fs=fs; r.tw=Math.round(cx.measureText(b.title).width);
    out.push(r); }
  return out; })()"""
ALL72 = r"""(async()=>{ const M=NANYANG_MOVIES, ids=[]; for(const p of M.periods) for(const b of p.bill) ids.push(b);
  const W=128, H=192, C=12, rows=Math.ceil(ids.length/C), k=document.createElement('canvas'); k.width=W*C; k.height=(H+18)*rows; const g=k.getContext('2d'); g.fillStyle='#222'; g.fillRect(0,0,k.width,k.height);
  for(let i=0;i<ids.length;i++){ const b=ids[i], url=MOVIES.posterUrl(b.id); if(!url) continue;
    const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.onerror=()=>res(null); q.src=url; }); const x=(i%C)*W, y=Math.floor(i/C)*(H+18);
    if(im){ const c=MOVIES.drawPoster(im,b.title); if(c) g.drawImage(c,x,y,W,H); } else { g.fillStyle='#a00'; g.fillRect(x,y,W,H); }
    g.fillStyle='#ddd'; g.font='12px sans-serif'; g.fillText(b.id,x+4,y+H+13); }
  return k.toDataURL('image/jpeg',0.85); })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.05, 200); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
  g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,18); g.fillStyle='#fff'; g.font='13px sans-serif'; g.fillText(a.label,4,13); (window.__PS=window.__PS||{})[a.key]=(window.__PS[a.key]||[]); window.__PS[a.key].push(k.toDataURL('image/jpeg',0.85));
  if(a.full) return c.toDataURL('image/jpeg',0.85); return null; })"""
MONT = r"""(async a=>{ const L=(window.__PS||{})[a.key]||[]; if(!L.length) return null; const ims=await Promise.all(L.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; })));
  const w=ims[0].width, h=ims[0].height, C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,Math.floor(i/C)*h)); return k.toDataURL('image/jpeg',0.85); })"""
POSTS = r"""(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(o.userData&&o.userData.poster) out.push({id:o.userData.poster, vis:!!o.visible, map:!!(o.material&&o.material.map)}); }); return out; })()"""


def save_url(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def wait_posters(pg, want, secs=12):
    t0 = time.time(); ps = []
    while time.time() - t0 < secs:
        ps = await pg.evaluate(POSTS)
        if all(any(p['id'] == w and p['vis'] and p['map'] for p in ps) for w in want): return True, ps
        await pg.wait_for_timeout(300)
    return False, ps


async def main():
    print('CC 南洋海報 72 張：PARTS %s；Playwright ≠ iPhone' % ','.join(PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        bad_resp = []; cons = []
        pg.on('response', lambda r: bad_resp.append([r.status, r.url]) if (r.status >= 400 and 'poster' in r.url) else None)
        pg.on('console', lambda m: cons.append(m.text) if ('海報' in m.text or 'poster' in m.text.lower()) else None)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        await pg.wait_for_timeout(2000)
        periods = await pg.evaluate("NANYANG_MOVIES.periods.map(p=>({from:p.from,to:p.to,term:p.term,ids:p.bill.map(b=>b.id),titles:p.bill.map(b=>b.title)}))")
        R.note('片單：%d 段、%d 部' % (len(periods), sum(len(q['ids']) for q in periods)))
        try:
            if 'A' in PARTS:
                res = await pg.evaluate(LOADCHK)
                json.dump(res, open(os.path.join(OUT, 'poster_load.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                R.check('[A] 片單一共 72 部', len(res) == 72, str(len(res)))
                miss = [r for r in res if not r['inList'] or not r['url']]
                R.check('[A] 每一部都在 MOVIES.POSTERS（有海報網址）', not miss, J([r['id'] for r in miss]))
                nf = [r for r in res if r.get('status') != 200]
                R.check('[A] 每一張 fetch 200（沒有 404）', not nf, J([[r['id'], r.get('status')] for r in nf]))
                ni = [r for r in res if not r.get('img')]
                R.check('[A] 每一張圖解得開（Image onload）', not ni, J([r['id'] for r in ni]))
                sz = sorted(set(tuple(r['img']) for r in res if r.get('img'))); R.note('[A] 圖的尺寸：%s' % J(sz))
                nt = [r['id'] for r in res if not r['film']]
                R.check('[A] 每一部 MOVIES.film(id) 有片名', not nt, J(nt))
                ov = [[r['id'], r['title'], r['fs'], r['tw']] for r in res if r['tw'] > 460]
                R.check('[A] 片名縮到最小 28px 也放得下（寬 ≤ 460）', not ov, J(ov))
                R.note('[A] 片名字級：%s' % J(sorted(set(r['fs'] for r in res))))
                small = [[r['id'], r['title'], r['fs']] for r in res if r['fs'] < 44]
                if small: R.note('[A] 字比較小（<44px，要看讀不讀得清楚）：%s' % J(small))
                save_url(await pg.evaluate(ALL72), 'poster_all72.jpg')
                R.note('[A] 遊戲的 drawPoster 畫出來的 72 張（圖＋片名）：poster_all72.jpg')
            if 'B' in PARTS:
                first_ok = None
                for i, q in enumerate(periods):
                    key = q['from'] + '-15'
                    d = await pg.evaluate("(k=>{ try{ return STORY.dayOfKey(k); }catch(e){ return null; } })(%s)" % J(key))
                    if d is None:
                        R.note('[B] %s（%s）：STORY.dayOfKey 找不到這一天，大廳不拍' % (q['from'], q['term'])); continue
                    if first_ok is None: first_ok = q['from']
                    if FROM and q['from'] < FROM: continue
                    await D.load_zone(pg, cdp, 'xs_nanyang', key, 14.0, wait=5000)
                    ok, ps = await wait_posters(pg, q['ids'])
                    if not ok:   # r2：讀檔以後人在哪（r1 2029-07 起拍到的是別的地方）
                        where = await pg.evaluate("(()=>{ const G=GAME.G; return {zone:G.zone, day:G.day, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), want:%s, dlg:(document.getElementById('dlg')||{}).textContent||'', caption:(document.getElementById('caption')||{}).textContent||''}; })()" % J(key))
                        R.note('[B] %s 讀檔以後：%s' % (q['from'], J(where)))
                        await pg.screenshot(path=os.path.join(OUT, 'poster_lobby_miss_%s.jpg' % q['from']), type='jpeg', quality=70)
                    R.check('[B] %s 大廳兩張海報貼上了（%s）' % (q['from'], '、'.join(q['ids'])), ok, J(ps))
                    full = await pg.evaluate(SNAP, {'from': [1.7, 2.0, -4.07], 'at': [4.39, 2.05, -4.07], 'fov': 50, 'tw': 300, 'key': 'lobby', 'label': '%s %s' % (q['from'], '／'.join(q['titles'])), 'full': i % 12 == 6})
                    if full: save_url(full, 'poster_lobby_%s.jpg' % q['from'])
                save_url(await pg.evaluate(MONT, {'key': 'lobby', 'cols': 5}), 'poster_lobby.jpg')
                R.note('[B] 大廳每段一張拼成 poster_lobby.jpg（第一個到得了的段 %s）' % first_ok)
            if 'C' in PARTS:
                await D.load_zone(pg, cdp, 'xs_nanyang_hall', '2025-11-15', 14.0, wait=6000)
                R.setup('【前置／捷徑】讀檔到 1 廳 2025-11-15 14:00；每段抽一張用 MOVIES.showScreen(id) 換銀幕')
                for i, q in enumerate(periods):
                    fid = q['ids'][i % 2] if len(q['ids']) > 1 else q['ids'][0]
                    r0 = await pg.evaluate("(id=>MOVIES.showScreen(id))(%s)" % J(fid))
                    ok, ps = await wait_posters(pg, [fid])
                    R.check('[C] %s 1 廳銀幕貼上 %s' % (q['from'], fid), bool(r0) and ok, J(ps))
                    full = await pg.evaluate(SNAP, {'from': [0.0, 2.3, -0.8], 'at': [0.0, 3.0, -7.75], 'fov': 45, 'tw': 300, 'key': 'hall', 'label': '%s %s《%s》' % (q['from'], fid, q['titles'][i % 2] if len(q['titles']) > 1 else q['titles'][0]), 'full': i % 12 == 6})
                    if full: save_url(full, 'poster_hall_%s.jpg' % q['from'])
                save_url(await pg.evaluate(MONT, {'key': 'hall', 'cols': 6}), 'poster_hall.jpg')
                R.note('[C] 1 廳每段抽一張拼成 poster_hall.jpg')
        except Exception as e:
            R.check('沒有中斷', False, repr(e)[:300])
        R.note('海報相關的 4xx 回應：%s；console：%s' % (J(bad_resp[:10]), J(cons[:10])))
        R.check('沒有海報 404／載入失敗', not bad_resp and not any('失敗' in c for c in cons), J({'resp': bad_resp[:5], 'console': cons[:5]}))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
