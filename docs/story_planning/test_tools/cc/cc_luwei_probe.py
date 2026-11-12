"""CC-C 11-12：公館宵夜滷味攤（EAT-EFFECT-1020，src/luwei3d.js LW3；LAWWW-C 11:22 交排 de8d72d279，範圍照 BB）。結果給 BB 判、LAWWW-C／LAWWW2-C 看位置。Playwright（PC GPU）≠ iPhone。
做法：每個時段（TIMES，預設 18.5／22.5／0.5／14）：【前置／捷徑】讀檔到 gongguan 那天那個時間（條件事件關掉、站在攤子前 5 m）→ 等模型 8 秒 →
  記 LW3.state、攤車（GLB 有沒有載到、visible、位置、轉向）、老闆（stallKeeper 的人：位置、visible、朝向、離 keeperSpot 多遠）、
  攤車外框壓到的其他東西（同區域的 mesh 外框交疊、互動點、人 2 m 內）、導航擋了幾格 → 拍遊戲鏡頭＋正面、側面、俯視三張（另一台相機、藏玩家）。
  每個時段都真的走到「看…」互動點（go_to）按：BUYS 那幾個時段照 BUYS 的順序買（BB-C 11:23：四種夾法各一次、辣度輪流、第 5 次選「老樣子」看熟客句、錢不夠一次）；
  其他時段按一次記那一句（在收、還沒推出來）。每一次記每句、每個選單（截圖）、錢前後、時間前後（應該過 5 分鐘）、LW3.lastOrder、G.eat。
CC_02 清單 2026-11-12：1✓（時段照 LAWWW-C：18:30 開、22:30 半價、0:30 在收、14:00 沒擺） 2✓（攤子、老闆照 LW3 的旗標從遊戲找，座標只用 LW3.AT 算鏡頭） 3✓（每個時段重新讀檔） 4✓（選項照序號、全部記下） 5✓（買那次 go_to 走過去按） 6✓（等模型 8 秒、一句一句點） 7✓ 8n/a（不判，給 BB） 9n/a（照片不藏人：要看老闆） 10✓（條件事件關掉） 11✓ 12✓（四個時段同樣欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [DAY=2025-10-14] [TIMES=18.5,22.5,0.5,14] [BUYS=18.5@0:0+1:1+2:2+3:0+usual+poor;22.5@1:2] python3 cc_luwei_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-10-14'
TIMES = [float(x) for x in (os.environ.get('TIMES') or '18.5,22.5,0.5,14').split(',') if x]
BUYS = {}   # 時段 → [(夾法序號或 'usual'／'poor', 辣度序號)]
for seg in (os.environ.get('BUYS') or '18.5@0:0+1:1+2:2+3:0+usual+poor;22.5@1:2').split(';'):
    if '@' not in seg: continue
    hh, lst = seg.split('@', 1); BUYS[float(hh)] = [tuple((x.split(':') + ['0'])[:2]) for x in lst.split('+') if x]
R = L.Run('luwei', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
INFO = r"""(()=>{ const E=GAME.E, G=GAME.G; if(typeof LW3==='undefined') return {noLW3:true, zone:G.zone};
  const z=E.zone, q=z&&z.lwStall, a=LW3.AT, ks=LW3.keeperSpot(), cs=LW3.custSpot(); const r2=v=>+(+v).toFixed(2);
  const out={zone:G.zone, h:r2(G.hour), day:G.day, state:LW3.state(G), half:LW3.isHalf(G), prices:LW3.prices(G), label:LW3.label(), AT:a, keeperSpot:ks, custSpot:cs,
    q:q?{shown:q.shown, hasModel:!!q.model, modelVis:q.model?q.model.visible:null, cells:q.cells?q.cells.length:0}:null};
  const K=(E.npcs||[]).filter(n=>n&&n.stallKeeper===LW3.ID);
  out.keepers=K.map(n=>({x:r2(n.obj.position.x), z:r2(n.obj.position.z), y:r2(n.obj.position.y), yaw:r2(n.obj.rotation.y), vis:n.obj.visible!==false, hidden:!!n.hidden, pose:n.pose||null, dSpot:r2(Math.hypot(n.obj.position.x-ks.x,n.obj.position.z-ks.z))}));
  out.overlap=[]; out.box=null;
  if(q&&q.model&&q.model.visible){ const B=new THREE.Box3().setFromObject(q.model); out.box={min:B.min.toArray().map(r2), max:B.max.toArray().map(r2)};
    const own=new Set(); q.model.traverse(o=>own.add(o)); const skip=new Set(); for(const n of (E.npcs||[])) if(n&&n.obj) n.obj.traverse(o=>skip.add(o)); if(E.player&&E.player.obj) E.player.obj.traverse(o=>skip.add(o));
    (z.group||E.scene).traverse(o=>{ if(!o.isMesh||own.has(o)||skip.has(o)||!o.visible) return; let p=o, vis=true; while(p){ if(p.visible===false){ vis=false; break; } p=p.parent; } if(!vis) return;
      const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const s=b.getSize(new THREE.Vector3()); if(Math.max(s.x,s.z)>25) return;   /* 地面、整條街的大 mesh 不算 */
      if(b.max.y<0.03) return; if(!b.intersectsBox(B)) return;
      const ix=Math.min(b.max.x,B.max.x)-Math.max(b.min.x,B.min.x), iz=Math.min(b.max.z,B.max.z)-Math.max(b.min.z,B.min.z);
      out.overlap.push({name:(o.name||'')+'<'+((o.parent&&o.parent.name)||'')+'>', mat:(o.material&&o.material.name)||'', ix:r2(ix), iz:r2(iz), min:b.min.toArray().map(r2), max:b.max.toArray().map(r2)}); });
    out.overlap.sort((u,v)=>v.ix*v.iz-u.ix*u.iz); out.overlap=out.overlap.slice(0,25); }
  out.inter=(E.interactables||[]).filter(i=>Math.hypot(i.x-a.x,i.z-a.z)<3).map(i=>({label:i.label, x:r2(i.x), z:r2(i.z), hidden:!!i.hidden, lw:!!i.lwStall}));
  out.people=(E.npcs||[]).filter(n=>n&&n.obj&&n.stallKeeper!==LW3.ID&&Math.hypot(n.obj.position.x-a.x,n.obj.position.z-a.z)<2.5).map(n=>({name:n.name||'', x:r2(n.obj.position.x), z:r2(n.obj.position.z), vis:n.obj.visible!==false}));
  return out; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||55, c.width/c.height, 0.05, 300); cam.position.set(...a.from); if(a.up) cam.up.set(...a.up); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player&&E.player.obj, pv=P?P.visible:null; if(P) P.visible=false; let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { if(P) P.visible=pv; } return url; })"""
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>({t:b.textContent.trim(), dim:b.disabled||b.classList.contains('dim')})), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||''}; })()"""


async def snaps(pg, tag, info):
    a = info['AT']; x, z = a['x'], a['z']
    views = (('front', [x, 1.6, z + 4.2], [x, 1.0, z]), ('side', [x + 4.5, 1.8, z + 1.5], [x, 1.0, z]), ('side2', [x - 4.5, 1.8, z + 1.5], [x, 1.0, z]), ('top', [x, 9.0, z + 0.01], [x, 0, z]))   # side2：LAWWW-C 12:37「20:00 兩側」
    for nm, frm, at in views:
        u = await pg.evaluate(SNAP, {'from': frm, 'at': at, 'up': [0, 0, -1] if nm == 'top' else None})
        if u: open(os.path.join(OUT, 'lw_%s_%s.jpg' % (tag, nm)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def buy(pg, cdp, tag, info, res, pick='0', spice='0', walk=True):
    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.lwStall); return i?{x:i.x,z:i.z,label:i.label,hidden:!!i.hidden}:null; })()")
    if not R.check('%s 找得到滷味攤互動點' % tag, bool(it), ''): return
    if walk: await L.go_to(pg, cdp, R, it['x'], it['z'], 0.7, it['label'], max_s=90)
    if pick == 'poor': await pg.evaluate("(()=>{ GAME.G.money=10; })()"); R.setup('%s 【捷徑】錢改成 10 元（看錢不夠那一句）' % tag)
    st = await pg.evaluate(ST); R.note('%s 互動鍵「%s」（互動點 %s）' % (tag, st['interact'], J(it)))
    m0 = await pg.evaluate("GAME.G.money|0"); h0 = await pg.evaluate("+GAME.G.hour")
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    lines, menus = [], []
    for k in range(80):
        st = await pg.evaluate(ST)
        if st['choices']:
            menus.append(st['choices']); await pg.screenshot(path=os.path.join(OUT, 'lw_buy_%s_menu_%02d.png' % (res['_k'], len(menus))))
            ts = [c['t'] for c in st['choices']]
            if len(menus) == 1: i = next((n for n, t_ in enumerate(ts) if t_.startswith('老樣子')), 0) if pick == 'usual' else (0 if pick == 'poor' else int(pick))   # 選單字是「老樣子＋上次的夾法＋辣度」（LUWEI_72fc：全等比對選錯）
            else: i = int(spice) if len(menus) == 2 else 0
            if pick == 'usual' and len(menus) == 1 and not any(t_.startswith('老樣子') for t_ in ts): R.note('%s 選單沒有「老樣子」：%s' % (tag, J(ts)))
            i = min(i, len(st['choices']) - 1)   # lint-ok：照份量序號選，只是夾在範圍內
            lines.append('▶ ' + st['choices'][i]['t'])
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(800); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln:
                lines.append(ln); await pg.screenshot(path=os.path.join(OUT, 'lw_buy_%s_line_%02d.png' % (res['_k'], len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy']: break
        await pg.wait_for_timeout(600)
    m1 = await pg.evaluate("GAME.G.money|0"); h1 = await pg.evaluate("+GAME.G.hour")
    lo = await pg.evaluate("(()=>({last:LW3.lastOrder||null, eat:GAME.G.eat?{n:GAME.G.eat.n, last:GAME.G.eat.last, lwSpice:GAME.G.eat.lwSpice, first:GAME.G.eat.first}:null}))()")
    await pg.screenshot(path=os.path.join(OUT, 'lw_buy_%s_end.png' % res['_k']))
    res.setdefault('buys', []).append({'tag': tag, 'pick': pick, 'spice': spice, 'lines': lines, 'menus': menus, 'money': [m0, m1], 'hour': [h0, h1], 'order': lo})
    R.note('%s 整段（%d 句、%d 個選單）：%s' % (tag, len(lines), len(menus), J(lines)))
    R.note('%s 選單：%s' % (tag, J(menus)))
    R.note('%s 錢 %s → %s（差 %s）；時間 %.3f → %.3f（過 %.1f 分鐘）；%s' % (tag, m0, m1, m1 - m0, h0, h1, (h1 - h0) * 60, J(lo)))
    if pick == 'poor': R.check('%s 錢不夠：沒扣錢' % tag, m1 == m0, '')
    elif info.get('state') == 'open': R.check('%s 買得到（錢有扣、時間有過）' % tag, m1 < m0 and h1 > h0, '')


async def main():
    print('CC 滷味攤：SHA %s；%s；TIMES %s；BUYS %s' % (SHA or '?', DAY, TIMES, BUYS), flush=True)
    res = {'sha': SHA, 'times': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        AT = await pg.evaluate("typeof LW3!=='undefined'?LW3.AT:null")
        if not R.check('有 LW3（src/luwei3d.js）', bool(AT), ''): await b.close(); sys.exit(1)
        for h in TIMES:
            tag = '[%s %05.2f]' % (DAY, h); ft = ('%05.2f' % h).replace('.', '')
            s = await D.load_zone(pg, cdp, 'gongguan', DAY, h, x=AT['x'], z=AT['z'] + 5.0, yaw=3.14159, wait=8000)
            R.setup('%s 【前置／捷徑】讀檔到 gongguan %s %.2f、站攤子前 5 m（條件事件關掉）' % (tag, DAY, h))
            if not R.check('%s 讀到 gongguan' % tag, s['zone'] == 'gongguan', J(s)): continue
            info = await pg.evaluate(INFO); res['times'][str(h)] = info
            await pg.screenshot(path=os.path.join(OUT, 'lw_%s_game.png' % ft)); await snaps(pg, ft, info)
            R.note('%s 狀態 %s（半價 %s、價錢 %s、按鈕「%s」）；攤車 %s；老闆 %s' % (tag, info.get('state'), info.get('half'), J(info.get('prices')), info.get('label'), J(info.get('q')), J(info.get('keepers'))))
            R.note('%s 攤車外框 %s；壓到的 mesh（前 25，交疊 ix×iz m）%s' % (tag, J(info.get('box')), J(info.get('overlap'))))
            R.note('%s 3 m 內互動點 %s；2.5 m 內其他人 %s' % (tag, J(info.get('inter')), J(info.get('people'))))
            pres = info.get('state') in ('open', 'closing')
            q = info.get('q') or {}
            R.check('%s 攤車在不在跟狀態一致（%s）' % (tag, info.get('state')), bool(q.get('modelVis')) == pres if q.get('hasModel') else not pres, J(q))
            R.check('%s 老闆在不在跟狀態一致' % tag, any(k['vis'] and not k['hidden'] for k in info.get('keepers') or []) == pres, J(info.get('keepers')))
            plan = next((v for k2, v in BUYS.items() if abs(k2 - h) < 1e-6), None) or [('0', '0')]
            for j, (pk, sp) in enumerate(plan):
                res['_k'] = '%s_%d_%s' % (ft, j, pk)
                await buy(pg, cdp, '%s 第 %d 次（%s／辣度 %s）' % (tag, j + 1, pk, sp), info, res, pk, sp, walk=(j == 0))
                await pg.wait_for_timeout(800)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'luwei.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
