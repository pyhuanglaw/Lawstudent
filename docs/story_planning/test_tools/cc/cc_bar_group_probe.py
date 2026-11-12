"""CC-C 11-12：律師讀書小組在大口漢堡二樓的三場改在 3D 演（BAR-GROUP-3D-1112，src/r2y4b3d.js S.barPlay；LAWWW-C 11:22 交排 de8d72d279，範圍照 BB）。結果給 BB 判。Playwright（PC GPU）≠ iPhone。
三場（SCENES，預設三場都跑）：
  start＝2029-02-23 21:30 ev_bar_group_start（BAR_GROUP_START three）；out＝2029-02-26（一）21:00 ev_bar_group_out（三個人的平日晚上）；three＝2029-06-23 19:00 ev_bar_group_three。
每場：【前置／捷徑】讀檔到 xs_dakou 二樓那張長桌旁（R2Y4B.barGoto 的站位，條件事件關掉）→ 設旗標（Y4_PATH bar、BAR_GROUP_KIND three、BAR_STUDY_GROUP 可昕語彤、BAR_GROUP_START three、和可昕交往；out 那場 ev_bar_group_start 記成演過）→
  在 G.outings 放一筆「到了」的出遊（和 OUT.go 到了以後一樣：state done、goto＝barGoto）→ 呼叫 R2Y4B.barPlay（遊戲到了以後呼叫的同一支）→
  每一句：遊戲鏡頭截圖＋記每個人（祐廷、可昕、語彤）的位置、朝向、姿勢、坐姿高度（腳底 y、頭頂 y）、座位、鏡頭到每個人頭部的射線被哪些 mesh 擋住；開頭、結尾各拍一張俯視（另一台相機）。
CC_02 清單 2026-11-12：1✓（日期時間照 r2y4b3d.js 排的那三場） 2✓（座位照 R2Y4B.barSeats 從遊戲找） 3✓（每場重新讀檔） 4✓（選項選第 1 個、全部記下） 5n/a（到了以後的演出，走路那段是 OUT.go，本支不測） 6✓（讀檔等 7 秒、一句一句點） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看座位） 10✓（條件事件關掉） 11✓ 12✓（三場同樣欄位） 13✓（讀檔、旗標、出遊紀錄是捷徑，標【前置／捷徑】）
另外（OLD=1，預設）：舊存檔「已排沒出發、沒有 goto」→ barUpgrade 補上；「2D 演過」站在二樓桌旁 8 秒不重演。
用法：LW_TESTS=<wt>/tests SHA=<sha> [SCENES=start,out,three] [OLD=1] python3 cc_bar_group_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
ALL = {'start': ('2029-02-23', 21.5, 'ev_bar_group_start', 'y4_bar_group_start'), 'out': ('2029-02-26', 21.0, 'ev_bar_group_out', 'y4_bar_out_cc'), 'three': ('2029-06-23', 19.0, 'ev_bar_group_three', 'y4_bar_three')}
OLDS = (os.environ.get('OLD') or '1') == '1'   # BB-C 11:23：舊存檔兩種
SCENES = [s for s in (os.environ.get('SCENES') or 'start,out,three').split(',') if s in ALL]
R = L.Run('bar_group', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PREP = r"""(a=>{ const G=GAME.G, F=G.flags; Object.assign(F,{Y4_PATH:'bar',BAR_GROUP_KIND:'three',BAR_STUDY_GROUP:['kexin','yutong'],BAR_GROUP_START:'three',dating_kexin:true});
  G.events=G.events||{}; G.events.done=G.events.done||{}; if(a.ev!=='ev_bar_group_start') G.events.done.ev_bar_group_start=1; delete G.events.done[a.ev];
  if(!Array.isArray(G.outings)) G.outings=[]; const g=R2Y4B.barGoto(); const q={id:a.qid, ev:a.ev, day:G.day, h:a.h, late:0.5, place:'大口漢堡', title:'律師讀書小組（大口漢堡）', state:'done', goto:g};
  G.outings=G.outings.filter(x=>x&&x.id!==a.qid); G.outings.push(q); window.__barQ=q;
  const P=R2Y4B.barSeats(); return {goto:g, seats:P, cast:R2Y4B.barCast(G,q), pending:!!R2Y4B.barPending(G), zone:G.zone, lv:GAME.E.player.lv|0}; })"""
PEOPLE = r"""(()=>{ const E=GAME.E, cam=E.camera, r2=v=>+(+v).toFixed(2); const ids=[['player',E.player],['kexin',GAME.npc&&GAME.npc.kexin],['heroine_03',GAME.npc&&GAME.npc.heroine_03]];
  const rc=new THREE.Raycaster(); const cp=new THREE.Vector3(); cam.getWorldPosition(cp); const out={cam:{x:r2(cp.x),y:r2(cp.y),z:r2(cp.z)}, who:[]};
  const skip=new Set(); if(E.player&&E.player.obj) E.player.obj.traverse(o=>skip.add(o));
  for(const [id,n] of ids){ if(!n||!n.obj){ out.who.push({id, missing:true}); continue; } const o=n.obj, B=new THREE.Box3().setFromObject(o), c=B.getCenter(new THREE.Vector3());
    const head=new THREE.Vector3(c.x,B.max.y-0.12,c.z), dir=head.clone().sub(cp), dist=dir.length(); dir.normalize(); rc.set(cp,dir); rc.far=dist-0.15;
    const own=new Set(); o.traverse(x=>own.add(x)); const hits=rc.intersectObjects(E.scene.children,true).filter(h=>h.object.isMesh&&h.object.visible&&!own.has(h.object)&&!(id!=='player'&&skip.has(h.object))).slice(0,3)
      .map(h=>({name:(h.object.name||'')+'<'+((h.object.parent&&h.object.parent.name)||'')+'>', d:r2(h.distance)}));
    const s=n.seat; out.who.push({id, x:r2(o.position.x), z:r2(o.position.z), y:r2(o.position.y), yaw:r2(o.rotation.y), pose:n.pose||null, sitting:!!s, seat:s?{x:r2(s.x),z:r2(s.z),yaw:s.yaw!=null?r2(s.yaw):null,lv:s.lv|0,y:s.y!=null?r2(s.y):null}:null,
      footY:r2(B.min.y), headY:r2(B.max.y), lv:n.lv|0, vis:o.visible!==false, barGroup:n.barGroup||null, blocked:hits}); }
  return out; })()"""
TOP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(50, c.width/c.height, 0.05, 300); cam.position.set(a.x, a.y+5.5, a.z+0.01); cam.up.set(0,0,-1); cam.lookAt(a.x, a.y, a.z); cam.updateMatrixWorld(true);
  const hide=[]; E.scene.traverse(o=>{ if(o.isMesh&&o.visible&&o.position&&o.getWorldPosition){ const p=o.getWorldPosition(new THREE.Vector3()); const b=new THREE.Box3().setFromObject(o); if(b.min.y>a.y+2.2&&Math.hypot(p.x-a.x,p.z-a.z)<12){ hide.push(o); o.visible=false; } } });   /* 藏天花板、屋頂（俯視看得到桌子）*/
  let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { for(const o of hide) o.visible=true; } return url; })"""
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), done:window.__barR!==undefined, r:window.__barR===undefined?null:window.__barR,
  bg:(()=>{ const b=document.getElementById('advBg')||document.getElementById('evBg'); return b?getComputedStyle(b).backgroundImage.slice(0,60)+'|'+getComputedStyle(b).opacity:null; })()}; })()"""


async def top(pg, name, seats):
    t = seats['table']; u = await pg.evaluate(TOP, {'x': t['x'], 'z': t['z'], 'y': seats['me']['y']})
    if u: open(os.path.join(OUT, name), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def scene(pg, cdp, key, res):
    day, h, ev, qid = ALL[key]; tag = '[%s %s %s]' % (key, day, h)
    await pg.goto(URL); await L.wait_loaded(pg)
    g = await pg.evaluate("(()=>typeof R2Y4B!=='undefined'&&R2Y4B.barGoto?R2Y4B.barGoto():null)()")
    if not R.check('%s 有 R2Y4B.barGoto（xs_dakou 配置）' % tag, bool(g), ''): return
    s = await D.load_zone(pg, cdp, 'xs_dakou', day, h - 0.02, x=g['x'], z=g['z'], yaw=g['yaw'], lv=1, wait=7000)
    pre = await pg.evaluate(PREP, {'ev': ev, 'qid': qid, 'h': h})
    R.setup('%s 【前置／捷徑】讀檔到 xs_dakou 二樓 %s（%s）、設旗標、G.outings 放一筆到了的出遊 %s → 呼叫 R2Y4B.barPlay' % (tag, J(g), J(s), qid))
    R.note('%s 座位 %s；這場的人 %s；barPending=%s；玩家 lv=%s' % (tag, J(pre['seats']), J(pre['cast']), pre['pending'], pre['lv']))
    if not R.check('%s 讀到 xs_dakou 二樓' % tag, pre['zone'] == 'xs_dakou' and pre['lv'] == 1, J(pre)): return
    await top(pg, 'bar_%s_top_before.jpg' % key, pre['seats'])
    h0 = await pg.evaluate("+GAME.G.hour")
    await pg.evaluate("(()=>{ window.__barR=undefined; R2Y4B.barPlay(GAME, window.__barQ).then(r=>{ window.__barR=r; }).catch(e=>{ window.__barR='ERR '+String(e).slice(0,120); }); })()")
    for j in range(8):   # BB-C 11:23：清路人、坐好那一下閃不閃（每 0.25 秒一張、2 秒）
        await pg.screenshot(path=os.path.join(OUT, 'bar_%s_stage_%02d.png' % (key, j))); await pg.wait_for_timeout(250)
    lines, steps, menus = [], [], []
    for k in range(120):
        st = await pg.evaluate(ST)
        if st['choices']:
            menus.append(st['choices']); await pg.screenshot(path=os.path.join(OUT, 'bar_%s_menu_%02d.png' % (key, len(menus))))
            lines.append('▶ ' + st['choices'][0])
            await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); if(b[0]) b[0].click(); })()"); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln:
                lines.append(ln); await pg.wait_for_timeout(400)
                n = len(lines); await pg.screenshot(path=os.path.join(OUT, 'bar_%s_line_%02d.png' % (key, n)))
                pp = await pg.evaluate(PEOPLE); steps.append({'n': n, 'line': ln, 'bg': st['bg'], 'people': pp})
                R.note('%s 第 %d 句「%s」 底=%s 鏡頭 %s；人 %s' % (tag, n, ln, st['bg'], J(pp['cam']), J(pp['who'])))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if st['done']: break
        await pg.wait_for_timeout(600)
    await pg.wait_for_timeout(1500)
    r = await pg.evaluate("window.__barR===undefined?'(還沒回來)':window.__barR")
    after = await pg.evaluate("(()=>{ const G=GAME.G, q=window.__barQ; return {zone:G.zone, h:+(+G.hour).toFixed(3), lv:GAME.E.player.lv|0, seat:!!GAME.E.player.seat, bar3d:q.bar3d, done:(G.events.done||{})[q.ev]|0, N:G.flags.BAR_GROUP_N, kx:!!(GAME.npc&&GAME.npc.kexin), yt:!!(GAME.npc&&GAME.npc.heroine_03)}; })()")
    await pg.screenshot(path=os.path.join(OUT, 'bar_%s_end.png' % key)); await top(pg, 'bar_%s_top_after.jpg' % key, pre['seats'])
    res[key] = {'pre': pre, 'lines': lines, 'menus': menus, 'steps': steps, 'r': r, 'after': after, 'h0': h0}
    R.note('%s 整段（%d 句）：%s' % (tag, len(lines), J(lines)))
    R.note('%s barPlay 回傳 %s；演完 %s（開演前 %.3f）' % (tag, J(r), J(after), h0))
    R.check('%s 演完（barPlay true、事件記成演過、還在 xs_dakou 二樓）' % tag, r is True and after['done'] >= 1 and after['zone'] == 'xs_dakou' and after['lv'] == 1, J([r, after]))
    R.check('%s 有台詞' % tag, len(lines) > 0, '')


OLD = r"""(a=>{ const G=GAME.G, F=G.flags; Object.assign(F,{Y4_PATH:'bar',BAR_GROUP_KIND:'three',BAR_STUDY_GROUP:['kexin','yutong'],BAR_GROUP_START:'three',dating_kexin:true}); G.events=G.events||{}; G.events.done=G.events.done||{};
  if(!Array.isArray(G.outings)) G.outings=[]; const out={};
  if(a.kind==='planned'){ delete G.events.done.ev_bar_group_start; const q={id:'y4_bar_group_start',ev:'ev_bar_group_start',day:G.day,h:21.5,late:0.5,place:'大口漢堡',title:'律師讀書小組（大口漢堡）',travel:'走過去約 15 分鐘',travelH:0.25,state:'planned'};
    G.outings=G.outings.filter(x=>x&&x.id!==q.id); G.outings.push(q); out.before=JSON.parse(JSON.stringify(q)); out.n=R2Y4B.barUpgrade(G); out.after=JSON.parse(JSON.stringify(q)); }
  else { G.events.done.ev_bar_group_start=1; const q={id:'y4_bar_group_start',ev:'ev_bar_group_start',day:G.day,h:21.5,place:'大口漢堡',state:'done',goto:R2Y4B.barGoto()};
    G.outings=G.outings.filter(x=>x&&x.id!==q.id); G.outings.push(q); window.__barQ=q; out.pending=!!R2Y4B.barPending(G); }
  return out; })"""


async def old_cases(pg, cdp):
    """BB-C 11:23：舊存檔「已排、還沒出發、沒有 goto」補上 goto；「2D 演過」的到二樓那張桌子旁邊不重演"""
    day = '2029-02-23'
    await pg.goto(URL); await L.wait_loaded(pg)
    g = await pg.evaluate("R2Y4B.barGoto()")
    await D.load_zone(pg, cdp, 'campus', day, 20.0, wait=5000)
    o = await pg.evaluate(OLD, {'kind': 'planned'})
    R.setup('[舊存檔 已排沒出發] 【前置／捷徑】讀檔到 campus %s 20:00、G.outings 放一筆舊格式（沒有 goto）的 ev_bar_group_start → 呼叫 R2Y4B.barUpgrade' % day)
    R.note('[舊存檔 已排沒出發] 補之前 %s；補了 %s 筆；補之後 %s' % (J(o['before']), o['n'], J(o['after'])))
    R.check('[舊存檔 已排沒出發] 補上 goto（xs_dakou 二樓）、拿掉 back', bool(o['after'].get('goto')) and o['after']['goto'].get('zone') == 'xs_dakou' and 'back' not in o['after'], J(o['after']))
    await pg.goto(URL); await L.wait_loaded(pg)
    await D.load_zone(pg, cdp, 'xs_dakou', day, 21.6, x=g['x'], z=g['z'], yaw=g['yaw'], lv=1, wait=5000)
    o = await pg.evaluate(OLD, {'kind': 'done2d'})
    R.setup('[舊存檔 2D 演過] 【前置／捷徑】讀檔到 xs_dakou 二樓長桌旁 %s 21:36、ev_bar_group_start 記成演過、出遊 done 沒有 bar3d' % day)
    t0 = await pg.evaluate("(GAME.G.events.done||{}).ev_bar_group_start|0")
    said = []
    for j in range(10):
        st = await pg.evaluate(ST)
        if st['dlg'] and (not said or said[-1] != st['t']): said.append(st['who'] + '｜' + st['t']); await pg.screenshot(path=os.path.join(OUT, 'bar_old_done2d_%02d.png' % len(said))); await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(800)
    t1 = await pg.evaluate("(GAME.G.events.done||{}).ev_bar_group_start|0")
    await pg.screenshot(path=os.path.join(OUT, 'bar_old_done2d_end.png'))
    R.note('[舊存檔 2D 演過] barPending=%s；站在桌旁 8 秒內的對話 %s；ev_bar_group_start 次數 %s → %s' % (o['pending'], J(said), t0, t1))
    R.check('[舊存檔 2D 演過] 不重演（barPending 沒有、次數沒變）', not o['pending'] and t1 == t0, J([o, said]))


async def main():
    print('CC 大口二樓讀書小組：SHA %s；SCENES %s' % (SHA or '?', SCENES), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for key in SCENES:
            try: await scene(pg, cdp, key, res)
            except Exception as e: R.check('[%s] 沒有探針例外' % key, False, str(e)[:200])
        if OLDS:
            try: await old_cases(pg, cdp)
            except Exception as e: R.check('[舊存檔] 沒有探針例外', False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'bar_group.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
