"""CC（帳號 A）11-04：SEAT_ACT（BB 07:44；X217 SEAT-ACTIVITY-1104，31ce5f785 以後）坐著的人做什麼、桌上的小物。
  六個區域（ZONES，預設 cafe,library_hall,library,lawlib,afar,daybreak）：
   1【前置／捷徑】讀檔到溫州街 14:00（條件事件關閉）→ GAME.enter(區域)（直接進區域，不是走進去）→ 等 20 秒（路人坐下、SEATACT 配好）→ SEATACT.state()。
   2 全景：鏡頭在玩家上方 2.6 m 看坐著的人的中心（同一層）。有不同樓層的（總圖大廳二樓自習區）：【前置／捷徑】再讀檔到那一層、站在那個人旁邊。
   3 近景：挑一個人（優先 phone → laptop → notes → 其他），鏡頭在他正前方 1.5 m、高 1.25 m 看他胸口。
   4 量（每個配好的人）：
     - 桌上小物（SEATACT.groups() 的 InstancedMesh 每一個 instance）：底面 y 和正下方的桌面（往下打 raycast，不算小物自己）差多少——> +2 cm＝浮空、< −2 cm＝穿進桌子（FAIL）。
     - 滑手機（hold phone）：手機（人物底下名字有 phone 的 mesh）中心到最近的手骨 ≤ 12 cm。
     - 用筆電（laptop）：頭的前方向量 y（負＝低頭）和 hips 的前方向量 y 的差，記 INFO（BB：現在是看前方、沒有低頭）。
     - 同一張桌子（座位 1.05 m 內）的人做的事：一樣的記下來（H），SEATACT 的規則是 1.05 m 內一定不同。
     - 平板、碗盤：等 LAWWW2 的模型，只記 INFO。
  Playwright（PC GPU），不是手機實機。
用法：LW_TESTS=<wt>/tests [ZONES=cafe,afar] python3 cc_seat_act_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ZONES = [z.strip() for z in (os.environ.get('ZONES') or 'cafe,library_hall,library,lawlib,afar,daybreak,wz_teishoku@19').split(',') if z.strip()]   # 區域@時刻（BB 07:51：小路 19:00 有人吃飯）
FAILS = []
import re
BOWL = re.compile(r'bowl|soup|noodle|ramen|plate|dish|碗|盤', re.I)
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
UNAIM = "(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"
HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
MEASURE = r"""(()=>{ if(typeof SEATACT==='undefined') return {err:'no SEATACT'}; const E=GAME.E, st=SEATACT.state(), V=THREE.Vector3;
  const out={zone:st.zone, n:st.n, loaded:st.loaded, people:[], items:[], tablet:!!SEATACT.TABLET_OK};
  /* 每個人：從 E.npcs 找回人（座位座標一樣）*/
  const npcAt=(x,z)=>(E.npcs||[]).find(n=>n.seat&&Math.abs(n.seat.x-x)<0.01&&Math.abs(n.seat.z-z)<0.01);
  const bone=(o,b)=>{ try{ const v=o.userData&&o.userData.vrm, H=v&&v.humanoid; const h=H&&((H.getRawBoneNode&&H.getRawBoneNode(b))||H.getNormalizedBoneNode(b)); return h||null; }catch(e){ return null; } };   /* CC-C 11-04：遊戲的動畫驅動 raw 骨（character3d.js 用 getRawBoneNode 16 處）；原本量 normalized 骨，三個人都差 0.32 m＝量到沒動的骨頭 */
  const boneN=(o,b)=>{ try{ const v=o.userData&&o.userData.vrm; return (v&&v.humanoid&&v.humanoid.getNormalizedBoneNode(b))||null; }catch(e){ return null; } };
  const fwdY=(node)=>{ const q=node.getWorldQuaternion(new THREE.Quaternion()); const f=new V(0,0,1).applyQuaternion(q); return +f.y.toFixed(3); };
  for(const p of st.list){ const n=npcAt(p.x,p.z), o=n&&n.obj; const r={act:p.act,set:p.set,kind:p.kind,named:p.named,x:+p.x.toFixed(2),z:+p.z.toFixed(2),lv:p.lv,items:p.items,pose:p.pose,hold:p.hold,yaw:n&&n.seat?+(+(n.seat.yaw||0)).toFixed(2):null,
      px:o?+o.position.x.toFixed(2):null, pz:o?+o.position.z.toFixed(2):null};
    if(o){ const hd=bone(o,'head'), hp=bone(o,'hips'); if(hd&&hp){ r.headFwdY=fwdY(hd); r.hipsFwdY=fwdY(hp); r.headPitch=+(r.headFwdY-r.hipsFwdY).toFixed(3); }
      if(p.hold==='phone'){ let ph=null; o.traverse(q=>{ if(!ph&&q.isMesh&&/phone/i.test(q.name||'')&&q.visible!==false) ph=q; });
        if(ph){ const c=new THREE.Box3().setFromObject(ph).getCenter(new V()); let best=null; let bestN=null; for(const b of ['rightHand','leftHand']){ const h=bone(o,b); if(h){ const d=h.getWorldPosition(new V()).distanceTo(c); if(best==null||d<best.d) best={b,d:+d.toFixed(3)}; } const hn=boneN(o,b); if(hn){ const d=hn.getWorldPosition(new V()).distanceTo(c); if(bestN==null||d<bestN.d) bestN={b,d:+d.toFixed(3)}; } } r.phone={mesh:ph.name, hand:best, handNormalized:bestN}; }
        else r.phone={mesh:null}; } }
    out.people.push(r); }
  /* 桌上小物：每個 InstancedMesh 的每個 instance */
  const all=[]; E.scene.traverseVisible(o=>{ if(o.isMesh&&!o.isSprite&&!o.isInstancedMesh) all.push(o); });
  const M=new THREE.Matrix4(), B=new THREE.Box3();
  for(const g of SEATACT.groups()){ g.updateMatrixWorld(true); for(const im of g.children){ if(!im.isInstancedMesh||!im.count) continue; if(!im.geometry.boundingBox) im.geometry.computeBoundingBox();
      for(let k=0;k<im.count;k++){ im.getMatrixAt(k,M); M.premultiply(im.matrixWorld); B.copy(im.geometry.boundingBox).applyMatrix4(M); const c=B.getCenter(new V());
        if(B.isEmpty()||!isFinite(c.x)) continue; const rc=new THREE.Raycaster(new V(c.x,B.min.y+0.25,c.z),new V(0,-1,0),0,1.5); const hits=[]; for(const o of all){ try{ o.raycast(rc,hits); }catch(e){} } hits.sort((a,b)=>a.distance-b.distance);
        const h=hits[0]; const surf=h?+(B.min.y+0.25-h.distance).toFixed(3):null;
        out.items.push({name:im.name, x:+c.x.toFixed(2), z:+c.z.toFixed(2), minY:+B.min.y.toFixed(3), surf, gap:surf==null?null:+(B.min.y-surf).toFixed(3), under:h?(h.object.name||'(無名)'):null, lv:g.name||null}); } } }
  return out; })()"""


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, txt=''):
    print('INFO ' + name + (('  ' + txt) if txt else ''), flush=True)


async def measure(pg):
    return await pg.evaluate(MEASURE)


def judge(z, m):
    ppl = m.get('people') or []
    info('[%s] SEATACT：配好 %s 人、desk_props 載入 %s、平板 %s' % (z, m.get('n'), m.get('loaded'), m.get('tablet')))
    acts = {}
    for p in ppl: acts[p['act']] = acts.get(p['act'], 0) + 1
    info('[%s] 做的事分布' % z, J(acts))
    # 小物
    its = m.get('items') or []
    flo = [i for i in its if i['gap'] is not None and i['gap'] > 0.02]
    sink = [i for i in its if i['gap'] is not None and i['gap'] < -0.02]
    none = [i for i in its if i['gap'] is None]
    check('[%s] 桌上小物 %d 個：沒有浮空（> 2 cm）' % (z, len(its)), not flo, J(flo[:6]))
    check('[%s] 桌上小物：沒有穿進桌子（< −2 cm）' % z, not sink, J(sink[:6]))
    if none: info('[%s] 小物下面 1.5 m 內打不到東西 %d 個' % (z, len(none)), J(none[:4]))
    # 手機
    ph = [p for p in ppl if p.get('hold') == 'phone']
    bad = [p for p in ph if not (p.get('phone') and p['phone'].get('hand') and p['phone']['hand']['d'] <= 0.12)]
    if ph: check('[%s] 滑手機 %d 人：手機在手上（離手骨 ≤ 12 cm）' % (z, len(ph)), not bad, J([{k: p.get(k) for k in ('x', 'z', 'phone')} for p in bad[:5]]))
    else: info('[%s] 這個時段沒有人滑手機' % z)
    # 筆電
    lp = [p for p in ppl if p['act'] == 'laptop']
    for p in lp: info('[%s] 筆電 (%s, %s)：頭的前方 y %s、hips %s、差 %s（負＝低頭）' % (z, p['x'], p['z'], p.get('headFwdY'), p.get('hipsFwdY'), p.get('headPitch')))
    # 同桌同一件事
    same = []
    for i, a in enumerate(ppl):
        for b in ppl[i + 1:]:
            if a['lv'] == b['lv'] and math.hypot(a['x'] - b['x'], a['z'] - b['z']) < 1.05 and a['act'] == b['act'] and not a['named'] and not b['named'] and a['act'] != 'chat':
                same.append([a['act'], (a['x'], a['z']), (b['x'], b['z'])])
    check('[%s] 同一張桌子（1.05 m 內）的路人做的事不一樣（H）' % z, not same, J(same[:5]))
    tb = [p for p in ppl if p['act'] == 'tablet' or p.get('hold') == 'tablet']
    bw = [i for i in its if BOWL.search(i['name'] or '')]
    info('[%s] 平板（ae0095d0d 起要判；TABLET_OK＝%s）%d 人、碗盤 %d 個；浮空／穿桌照上面兩項判' % (z, m.get('tablet'), len(tb), len(bw)))


async def do_zone(pg, cdp, zh):
    z, _, hh = zh.partition('@'); hour = float(hh) if hh else 14.0
    print('== %s %s' % (z, hour), flush=True)
    print('  [前置／捷徑] 讀檔到溫州街 %s、條件事件關閉 → GAME.enter(%s)' % (hour, z), flush=True)
    await L.load_state(pg, {'zone': 'wenzhou', 'hour': hour, 'day': 9, 'weekday': 4, 'weather': 'clear', 'pos': {'x': 0, 'z': 1.6, 'yaw': 0, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(4000)
    await pg.evaluate("void GAME.enter(%s)" % J(z))
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % J(z)): break
    await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
    m = await measure(pg)
    if not check('[%s] 進到區域、有 SEATACT 資料' % z, isinstance(m, dict) and not m.get('err') and m.get('zone') == z, J({k: m.get(k) for k in ('zone', 'n', 'err')} if isinstance(m, dict) else m)): return
    ppl = m['people']
    if not ppl:
        check('[%s] 有坐著、配好的人' % z, False, '0 人'); await pg.screenshot(path=os.path.join(OUT, 'sa_%s_none.png' % z)); return
    p0 = await pg.evaluate("(()=>{ const P=GAME.E.player; return {x:P.obj.position.x, z:P.obj.position.z, lv:P.lv|0}; })()")
    lvs = {}
    for p in ppl: lvs.setdefault(p['lv'], []).append(p)
    lv = p0['lv'] if p0['lv'] in lvs else max(lvs, key=lambda k: len(lvs[k]))
    if lv != p0['lv']:
        t = lvs[lv][0]
        print('  [前置／捷徑] 坐著的人在第 %d 層：讀同一份存檔，人站到 (%s, %s) 旁邊那一層（看得到那一層的小物）' % (lv, t['x'], t['z']), flush=True)
        snap = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())"))
        snap['pos'] = {'x': t['x'] + 1.2, 'z': t['z'] + 1.2, 'yaw': 0, 'lv': lv}
        await L.load_state(pg, snap, quiet_events=True); await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        m = await measure(pg); ppl = m['people']
    judge(z, m)
    same = [p for p in ppl if p['lv'] == lv] or ppl
    cx = sum(p['x'] for p in same) / len(same); cz = sum(p['z'] for p in same) / len(same)
    pp = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.y||0,p.z]; })()")
    await pg.evaluate(HUD + '(false)')
    await pg.evaluate(AIM + '(%s,%s)' % (J([pp[0], pp[1] + 2.6, pp[2]]), J([cx, pp[1] + 0.8, cz]))); await pg.wait_for_timeout(800)
    await pg.screenshot(path=os.path.join(OUT, 'sa_%s_wide.png' % z))
    pref = {'phone': 0, 'laptop': 1, 'notes': 2, 'textbook': 3, 'book': 4, 'rest': 5}
    t = sorted(same, key=lambda p: (pref.get(p['act'], 9), p['named']))[0]
    yaw = t['yaw'] or 0; fx, fz = math.sin(yaw), math.cos(yaw)
    base_y = pp[1]
    eye = [t['x'] + fx * 1.5, base_y + 1.25, t['z'] + fz * 1.5]; look = [t['x'], base_y + 0.85, t['z']]
    await pg.evaluate(AIM + '(%s,%s)' % (J(eye), J(look))); await pg.wait_for_timeout(800)
    await pg.screenshot(path=os.path.join(OUT, 'sa_%s_close_%s.png' % (z, t['act'])))
    info('[%s] 近景：%s（%s, %s）set %s、items %s' % (z, t['act'], t['x'], t['z'], t['set'], J(t['items'])))
    bw = [i for i in (m.get('items') or []) if BOWL.search(i['name'] or '') and i['lv'] in (None, '') or BOWL.search(i['name'] or '')]
    if bw:   # BB 07:51：湯麵碗的湯面上緣在 Blender 偏暗——俯角近景
        b0 = bw[0]
        await pg.evaluate(AIM + '(%s,%s)' % (J([b0['x'] + 0.15, b0['minY'] + 0.55, b0['z'] + 0.15]), J([b0['x'], b0['minY'] + 0.03, b0['z']]))); await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(OUT, 'sa_%s_bowl_top.png' % z))
        info('[%s] 碗盤俯角近景：%s (%s, %s)' % (z, b0['name'], b0['x'], b0['z']))
    await pg.evaluate(UNAIM); await pg.evaluate(HUD + '(true)')
    json.dump(m, open(os.path.join(OUT, 'sa_%s.json' % z.replace('@', '_')), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for z in ZONES:
            try: await do_zone(pg, cdp, z)
            except Exception as e:
                check('[%s] 沒有例外（探針）' % z, False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'EXC_%s.png' % z))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
