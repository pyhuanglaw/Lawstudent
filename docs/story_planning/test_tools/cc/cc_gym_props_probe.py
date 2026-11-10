"""CC 健身房手上的道具近拍（GYM-FIT-PROPS-1103 第一包；LAWWW 11-10 10:4x：開發分支 9e6883d9d 接 LAWWW2 86751d821，改前＝parent 63d8f328c）。
看什麼：彎舉（啞鈴架 gym_curl）、坐姿推舉（訓練椅 gym_press）、深蹲（深蹲架 gym_squat）、划船（划船機 gym_row）——動作播放中，玩家手上的啞鈴／槓鈴／拉把有沒有拿在手上、位置對不對。
判定不在這裡：器材、道具近拍交 BB（道具美術 D120）、人物動作交 LAWWW；探針只負責走到、按、拍、量數字（距離只印 INFO）。
程式依據（f3b47894b）：src/data/gym_layout.js b1.fitness.equip（stand＝互動點、use＝用的時候人在哪裡／pose）；src/gym3d.js useEquip（按「用啞鈴／用臥推椅／用深蹲架／用划船機」
→ fitOpen → 走到 stand → fitPay → 人放到 use、pose、旁白 GM.say；旁白點掉以後站回 stand、idle）；src/character3d.js gymProps（GYM_PROP_OF：gym_curl／gym_press＝每隻手一個 gym_dumbbell，
gym_squat＝gym_barbell、gym_row＝gym_row_handle 在兩手中間；道具掛在 player.obj 底下、名字 gymProp:dd0／dd1／bar0／row0，dd0＝左手、dd1＝右手；原點＝握把中心、軸＝本地 +x）。
流程（每一個動作各一次）：
  【前置／捷徑】load_zone 讀檔到 gym_b1 出生點（DAY、HOUR：營業時間內；不是第四個星期一）、條件事件關掉；G.daily.gym 設好會員卡＋這個月的月票（不然按下去先演辦卡／買月票）。
  之後真的玩：L.go_to 點地面／搖桿從 B1 出生點走到那一台的 stand（walkFallbacks 不能加）→ 互動鍵是那一種的字、最近的互動點是那一台 → 按 #interact（中途有選項照「月票」→ 第一個）
  → 等 GY3.using() 是那一台、玩家 pose 對 → 等道具出現（lazy 載入）→ 量 6 次（每 0.3 秒）道具網格名稱、世界座標、和左右手骨（getRawBoneNode leftHand／rightHand）的距離、
  手到道具軸線的垂直距離 → 藏 HUD（含對話框）→ 遊戲鏡頭截一張＋另一台相機從左右兩側（SIDE m、兩手中點的高度）各一張＋正前方一張 → HUD 回來 → 點掉旁白 → 站回 stand、道具藏起來。
  那一種的器材全部有人用：換下一個 HOUR 重讀（也是前置）。
INFO：啞鈴離自己那隻手骨 > 0.15 m、槓鈴／拉把離兩手中點 > 0.15 m、或手到道具軸線 > 0.15 m（給人看，不判 FAIL；手骨在手腕，掌心本來就往前 5～8 cm）。
Playwright／SwiftShader 或 PC GPU ≠ iPhone。
ENV：DAY（預設 2025-09-23 星期二）、HOURS（預設 10,8.6,14.2；第一個有空位的）、ACTS（預設 curl,press,squat,row）、SIDE（預設 1.7 m）、TAG。
用法：LW_TESTS=<wt>/tests TAG=new python3 cc_gym_props_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; DAY = os.environ.get('DAY') or '2025-09-23'
HOURS = [float(v) for v in (os.environ.get('HOURS') or '10,8.6,14.2').split(',') if v]
SIDE = float(os.environ.get('SIDE') or 1.7)
# 動作 → (器材候選，照順序挑第一台有空的；互動鍵的字；pose；道具 key；道具幾個)。史密斯機也是 gym_squat，但槓是固定的模型（會兩支槓），預設不拍
ACTS = {'curl': (['db_rack_1'], '用啞鈴', 'gym_curl', 'dd', 2),
        'press': (['bench_1', 'bench_2', 'bench_3'], '用臥推椅', 'gym_press', 'dd', 2),
        'squat': (['squat_rack_1', 'squat_rack_2'], '用深蹲架', 'gym_squat', 'bar', 1),
        'row': (['rower_1', 'rower_2'], '用划船機', 'gym_row', 'row', 1),
        'smith': (['smith_1'], '用史密斯機', 'gym_squat', 'bar', 1)}
WANT = [a for a in (os.environ.get('ACTS') or 'curl,press,squat,row').split(',') if a]
R = L.Run('gym_props_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

EQ = "((id)=>{ const e=(GYM_LAYOUT.b1.fitness.equip||[]).find(q=>q.id===id); if(!e) return null; return {id:e.id, kind:e.kind, label:e.label, stand:e.stand, use:e.use, free:!!(GY3.eqFree&&GY3.eqFree(GAME.E,e))}; })"
NEAR = "(()=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return it?{label:it.label||'', eq:it.gymEquip||null}:null; })()"
PASS_JS = """(()=>{ const G=GAME.G, r=GY3.rec(G), d=CALENDAR.dateOf(G.day); r.card=r.card||G.day; r.pass=d.y+'-'+String(d.m).padStart(2,'0'); G.money=Math.max(G.money|0,2000);
  /* open＝gym3d.js fitOpen 的規則：平日 8～21:30、六 9～21:30、日 9～17:30，第四個星期一休館 */
  return {card:r.card, pass:r.pass, fit:r.fit|0, money:G.money, open:(()=>{ const h=G.hour%24, op=d.wd>=6?9:8, last=d.wd===7?17.5:21.5, m4=GY3.fourthMonday?!!GY3.fourthMonday(G):(d.wd===1&&d.d>=22&&d.d<=28); return !m4&&h>=op&&h<last; })(), wd:d.wd, key:d.key}; })()"""
USING = "(()=>{ const u=GY3.using&&GY3.using(), P=GAME.E.player; return {using:u?u.id:null, pose:P.pose, x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), y:+P.obj.position.y.toFixed(3), yaw:+P.obj.rotation.y.toFixed(3), dlg:!!(GAME.D&&GAME.D.active)}; })()"
# 道具與手骨：世界座標、距離、手到道具軸線（本地 +x）的垂直距離
PROPS = r"""(()=>{ const h=GAME.E.player.obj, u=h.userData||{}, V=THREE.Vector3; h.updateMatrixWorld(true);
  const bone=n=>{ try{ return u.vrm&&u.vrm.humanoid?u.vrm.humanoid.getRawBoneNode(n):null; }catch(e){ return null; } };
  const LH=bone('leftHand')||(u.rawGym&&u.rawGym.leftHand), RH=bone('rightHand')||(u.rawGym&&u.rawGym.rightHand);
  const lp=LH?LH.getWorldPosition(new V()):null, rp=RH?RH.getWorldPosition(new V()):null, mid=lp&&rp?lp.clone().add(rp).multiplyScalar(0.5):null;
  const r3=v=>v?[+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)]:null, d3=(a,b)=>a&&b?+a.distanceTo(b).toFixed(3):null;
  const shown=o=>{ for(let x=o;x;x=x.parent){ if(!x.visible) return false; if(x===h) return true; } return true; };
  const props=[]; h.traverse(x=>{ if(!/^gymProp:/.test(x.name||'')) return; const meshes=[]; x.traverse(m=>{ if(m.isMesh) meshes.push(m.name||'(無名網格)'); });
    const p=x.getWorldPosition(new V()), ax=new V(1,0,0).applyQuaternion(x.getWorldQuaternion(new THREE.Quaternion())).normalize();
    const perp=q=>{ if(!q) return null; const w=q.clone().sub(p); return +w.sub(ax.clone().multiplyScalar(w.dot(ax))).length().toFixed(3); };
    const along=q=>q?+q.clone().sub(p).dot(ax).toFixed(3):null;
    props.push({name:x.name, vis:shown(x), meshes, pos:r3(p), axis:r3(ax), dL:d3(p,lp), dR:d3(p,rp), dMid:d3(p,mid), perpL:perp(lp), perpR:perp(rp), alongL:along(lp), alongR:along(rp)}); });
  const GP=CHAR._gymProps||{};
  return {pose:GAME.E.player.pose, gymPose:u.gym&&u.gym.pose||null, isFar:!!u.isFar, loaded:!!GP.scene, failed:GP.failed|0, lh:r3(lp), rh:r3(rp), mid:r3(mid), props}; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov, c.width/c.height, 0.05, 200); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const keep=E.camera; E.camera=cam; try{ r.render(E.scene,cam); } finally { E.camera=keep; } return c.toDataURL('image/png'); })"""
HIDE = r"""(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick','dlg','caption','goal','btnMenu','btnRun','clock','mdbg','fps','phoneNote','notif']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; }
  for(const e of document.querySelectorAll('.notif,.phoneToast,.toast')) e.style.visibility=on?'':'hidden'; })"""


async def snap(pg, fn, frm, at, fov=50):
    u = await pg.evaluate(SNAP, {'from': frm, 'at': at, 'fov': fov}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def judge_info(act, key, m):
    """距離只印 INFO（給人看）：回傳超過 0.15 m 的說明"""
    out = []
    for p in m['props']:
        if not p['vis']: continue
        if key == 'dd':
            own = p['dL'] if p['name'].endswith('0') else p['dR']; side = '左手' if p['name'].endswith('0') else '右手'
            if own is not None and own > 0.15: out.append('%s 離%s骨 %.3f m' % (p['name'], side, own))
            pp = p['perpL'] if p['name'].endswith('0') else p['perpR']
            if pp is not None and pp > 0.15: out.append('%s：%s到啞鈴軸線 %.3f m' % (p['name'], side, pp))
        else:
            if p['dMid'] is not None and p['dMid'] > 0.15: out.append('%s 離兩手中點 %.3f m' % (p['name'], p['dMid']))
            for s, k in (('左手', 'perpL'), ('右手', 'perpR')):
                if p[k] is not None and p[k] > 0.15: out.append('%s：%s到軸線 %.3f m' % (p['name'], s, p[k]))
    return out


async def load_b1(pg, cdp, h):
    R.setup('【前置／捷徑】讀檔到 gym_b1 出生點 %s %.2f 時、條件事件關掉；G.daily.gym 設會員卡＋這個月月票、錢 ≥ 2000（不演辦卡／買月票）' % (DAY, h))
    s = await D.load_zone(pg, cdp, 'gym_b1', DAY, h, wait=9000)
    for _ in range(8):
        if not s['dlg']: break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); s = await D.st(pg)
    pas = await pg.evaluate(PASS_JS); R.note('前置後：%s；位置 %s' % (J(pas), J(s)))
    return s, pas


async def do_act(pg, cdp, act):
    cands, label, pose, key, nprop = ACTS[act]; res = {'act': act}
    eq = None; s = None
    for h in HOURS:
        s, pas = await load_b1(pg, cdp, h)
        if s['zone'] != 'gym_b1' or not pas.get('open'):
            R.note('%s %.2f 時：不在 gym_b1 或沒開（%s）' % (act, h, J(pas))); continue
        infos = [await pg.evaluate(EQ + '(%s)' % J(c)) for c in cands]
        R.note('%s %.2f 時 器材：%s' % (act, h, J(infos)))
        eq = next((e for e in infos if e and e['free']), None)
        if eq: res['hour'] = h; break
    if not R.check('%s：%s 有一台有空位（%s）' % (act, label, '／'.join(cands)), bool(eq), J({'hours': HOURS})): return res
    st = eq['stand']; fb0 = s['fb']
    ok = await L.go_to(pg, cdp, R, st['x'], st['z'], 0.35, '%s 走到 %s 的 stand (%s, %s)' % (act, eq['id'], st['x'], st['z']), max_s=300, lv=0)
    s = await D.settle(pg); near = await pg.evaluate(NEAR)
    R.check('%s：真的走到 %s 的 stand（0.45 m 內、walkFallbacks 沒加）' % (act, eq['id']), bool(ok) and math.hypot(s['x'] - st['x'], s['z'] - st['z']) < 0.45 and s['fb'] == fb0, J(s))
    if not R.check('%s：互動鍵是「%s」、最近的互動點是 %s' % (act, label, eq['id']), label in (s['interact'] or '') and bool(near) and near.get('eq') == eq['id'], J({'interact': s['interact'], 'near': near})):
        if not (near and near.get('eq') and near['eq'].split('_')[0] == eq['id'].split('_')[0]): return res
        R.note('%s：最近的是同一種的 %s，照樣按' % (act, near.get('eq')))
    await L.tap(pg, cdp, '#interact'); u = None; picked = []
    for _ in range(50):   # 最多約 25 秒：中途的選項／旁白（本來不該有，前置設了月票）照玩家點
        await pg.wait_for_timeout(500); u = await pg.evaluate(USING)
        if u['using'] and u['pose'] == pose: break
        s2 = await D.st(pg)
        if s2['choices']:
            i = next((k for k, c in enumerate(s2['choices']) if '月票' in c), 0); picked.append(s2['choices'][i])
            c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null); const e=b[i]||b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
            await L.touch_tap(cdp, c[0], c[1])
        elif s2['dlg'] and not u['using']: await L.tap(pg, cdp, '#dlg')
    if picked: R.note('%s：按下去中途有選項，選了 %s' % (act, J(picked)))
    res['use'] = u
    if not R.check('%s：按下去以後在用 %s、玩家 pose＝%s' % (act, eq['id'], pose), bool(u) and u['using'] == eq['id'] and u['pose'] == pose, J(u)): return res
    m = None
    for _ in range(20):   # 道具 lazy 載入（最多約 10 秒）
        m = await pg.evaluate(PROPS)
        if len([p for p in m['props'] if p['vis'] and ('gymProp:' + key) in p['name']]) >= nprop: break
        await pg.wait_for_timeout(500)
    samples = []
    for i in range(6):
        m = await pg.evaluate(PROPS); samples.append(m); await pg.wait_for_timeout(300)
    vis = [p for p in m['props'] if p['vis']]
    R.check('%s：手上看得到 %d 個 gymProp:%s*（道具載好 %s、遠距離版本 %s）' % (act, nprop, key, m['loaded'], m['isFar']),
            len([p for p in vis if ('gymProp:' + key) in p['name']]) == nprop and len(vis) == nprop, J({'vis': [(p['name'], p['meshes']) for p in vis], 'failed': m['failed'], 'gymPose': m['gymPose']}))
    for k, sm in enumerate(samples):
        R.note('%s 第 %d 次：手 L %s R %s；道具 %s' % (act, k + 1, J(sm['lh']), J(sm['rh']), J([{q: p[q] for q in ('name', 'vis', 'meshes', 'pos', 'dL', 'dR', 'dMid', 'perpL', 'perpR', 'alongL', 'alongR')} for p in sm['props']])))
    info = sorted(set(sum([judge_info(act, key, sm) for sm in samples], [])))
    if info: print('  INFO %s（距離 > 0.15 m，給 BB／LAWWW 看截圖判斷）：%s' % (act, '；'.join(info[:12])), flush=True)
    else: R.note('%s：道具離手（啞鈴＝自己那隻手骨；槓鈴、拉把＝兩手中點）、手到軸線都 ≤ 0.15 m' % act)
    res['props'] = samples[-1]; res['info'] = info
    # 截圖：遊戲鏡頭（藏 HUD、對話框）＋另一台相機（左右兩側 SIDE m、兩手中點的高度；正前方）
    await pg.evaluate(HIDE + '(false)'); await pg.wait_for_timeout(400)
    cam = await pg.evaluate("(()=>{ const c=GAME.E.camera.position, C=GAME.E.cam; return {cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], yaw:+(C.yaw||0).toFixed(3), dist:+(C.dist||0).toFixed(2), mode:C.mode||null}; })()")
    await D.shot(pg, 'gp_%s_%s_game' % (TAG, act)); R.note('%s 遊戲鏡頭：%s' % (act, J(cam)))
    mid = m['mid'] or [u['x'], u['y'] + 1.1, u['z']]; yaw = u['yaw']
    sx, sz = math.cos(yaw), -math.sin(yaw); fx, fz = math.sin(yaw), math.cos(yaw)
    for nm, (dx, dz) in (('sideL', (sx, sz)), ('sideR', (-sx, -sz)), ('front', (fx, fz))):
        frm = [mid[0] + dx * SIDE, mid[1], mid[2] + dz * SIDE]
        await snap(pg, 'gp_%s_%s_%s.png' % (TAG, act, nm), frm, mid); R.note('%s 另一台相機 %s：%s → 兩手中點 %s（fov 50）' % (act, nm, J([round(v, 2) for v in frm]), J(mid)))
    await pg.evaluate(HIDE + '(true)')
    # 點掉旁白 → 站回 stand、道具藏起來
    for _ in range(12):
        u2 = await pg.evaluate(USING)
        if not u2['using'] and not u2['dlg']: break
        if u2['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    await pg.wait_for_timeout(1200); u2 = await pg.evaluate(USING); m2 = await pg.evaluate(PROPS)
    R.check('%s：旁白點掉以後站回 stand、pose idle、手上的道具藏起來' % act, not u2['using'] and u2['pose'] == 'idle' and math.hypot(u2['x'] - st['x'], u2['z'] - st['z']) < 0.3 and not [p for p in m2['props'] if p['vis']],
            J({'u': u2, 'vis': [p['name'] for p in m2['props'] if p['vis']]}))
    return res


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 健身房手上的道具：worktree %s；TAG %s；%s；Playwright ≠ iPhone' % (real or '?', TAG, WANT), flush=True)
    out = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        has = await pg.evaluate("(()=>({gy3:typeof GY3!=='undefined'&&!!GY3.useEquip, layout:typeof GYM_LAYOUT!=='undefined'&&!!(GYM_LAYOUT.b1.fitness&&GYM_LAYOUT.b1.fitness.equip), props:typeof CHAR!=='undefined'&&!!CHAR._gymPropsStep, asset:typeof ASSETS!=='undefined'&&!!ASSETS.manifest['prop.gym_hand']}))()")
        R.note('這一版：%s（props／asset false＝GYM-FIT-PROPS-1103 之前的版本，道具那一項會 FAIL）' % J(has))
        if not R.check('這一版有健身器材互動（GY3.useEquip、b1.fitness.equip）', has['gy3'] and has['layout'], J(has)): await b.close(); return
        for a in WANT:
            if a not in ACTS: R.check('動作名稱 %s' % a, False, '有 %s' % list(ACTS)); continue
            try: out.append(await do_act(pg, cdp, a))
            except Exception as e: R.check('%s：沒有例外' % a, False, repr(e)[:300])
        json.dump(out, open(os.path.join(OUT, 'gym_props_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
