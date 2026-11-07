"""BB-B 2026-11-07：沛珊 12/29 林家乾麵重聚在 3D 的 wz_lin 演（LAWWW-B ba11c0043／3b942474b，AA723-CONFESS-PS-1107 第 2～3 部分）瀏覽器驗收。
看：
  ① 換到 wz_lin、背景是模糊的 3D（ADV.bgMode＝blur，不是 dark）
  ② 五個人的位子：沛珊坐最裡面、你坐她對面、Alison 同桌、阿哲／以安在隔壁桌（實際 NPC 在 PSSIL.staged 的位子上、坐著、看得到）
  ③ 鏡頭：第一句的時候鏡頭在店裡、這幾個人在畫面裡（截圖；另拍一張【檢查用】把 ADV 層藏起來的）
  ④ 演完回到出發的地方（同區域、位置差 < 0.6 m）、沛珊等人不留在原區域、PS_REUNION 有記
  ⑤ 換不進去（有人跟著）＝深色底、不換區域，照樣演完
[前置／捷徑] 讀使用者存檔 day46；【捷徑】撥到 18:00、清邀約；【捷徑】用 OUT.plan 排一筆同一天 18:15 的重聚
（日期照存檔那天，不撥到 2028-12-29：只看 3D 演出，不看三年後的其他劇情）；【捷徑】直接 OUT.go（不經過出遊提示）。
用法：LW_TESTS=<測試樹>/tests python3 pt1107l_pssil_lin_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
import playlib as L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
CAST = ['classmate_peishan', 'yu', 'zhe', 'heroine_01']


def state():
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['hour'] = 18.0; s['invites'] = []
    f = dict(s.get('flags') or {}); f.pop('companion', None); f.pop('PS_REUNION', None); s['flags'] = f
    s['outings'] = [o for o in (s.get('outings') or []) if o.get('id') != 'pssil_reunion']
    return s


PLAN = """(comp=>{ const G=GAME.G, P=AA723.peishan.reunion.plan; G.outings=(G.outings||[]).filter(o=>o.id!=='pssil_reunion'); delete G.flags.PS_REUNION;
  if(comp) G.flags.companion=comp; else delete G.flags.companion;
  const ok=OUT.plan(G,{id:'pssil_reunion',ev:'ev_pssil_reunion',day:G.day,h:+(G.hour+0.25).toFixed(2),late:0.5,place:PSSIL.placeOf(P.place).label,title:P.title,travel:P.travel,travelH:1/6});
  const q=OUT.get(G,'pssil_reunion'); const p=GAME.E.player.obj.position;
  window.__prev={zone:G.zone,x:+p.x.toFixed(2),z:+p.z.toFixed(2)}; window.__goDone=null; window.__goErr=null;
  if(q) OUT.go(GAME,q).then(r=>{ window.__goDone=String(r); },e=>{ window.__goErr=String(e&&e.stack||e); });
  return {ok:!!ok, q:!!q, prev:window.__prev, cast:PSSIL.castIds(G), knows:{zhe:STORY.knows('zhe',G),an:STORY.knows('heroine_01',G),ps:STORY.knows('classmate_peishan',G)}}; })(%s)"""

INFO = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, st=PSSIL.staged, out={zone:G.zone, bg:(typeof ADV!=='undefined'&&ADV.active)?ADV.bgMode:null, staged:!!st};
  const p=P.obj.position; out.me={x:+p.x.toFixed(2),z:+p.z.toFixed(2),seat:!!P.seat}; out.cam=E.camera?{x:+E.camera.position.x.toFixed(2),y:+E.camera.position.y.toFixed(2),z:+E.camera.position.z.toFixed(2)}:null;
  if(st){ out.spots=st.spots; out.spawned=st.spawned; }
  out.npcs={}; for(const id of %s){ const n=GAME.npc&&GAME.npc[id]; if(!n) continue; const o=n.obj.position; let vis=n.obj.visible; for(let a=n.obj.parent;a;a=a.parent) if(a.visible===false) vis=false;
    let inView=null; if(E.camera){ const v=new THREE.Vector3(o.x,o.y+1.1,o.z).project(E.camera); inView=v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1; }
    out.npcs[id]={x:+o.x.toFixed(2),z:+o.z.toFixed(2),pose:n.pose||null,seat:!!n.seat,vis,inView,far:!!n.isFar,pssil:!!n.pssil}; }
  if(E.camera&&st){ const v=new THREE.Vector3(p.x,p.y+1.1,p.z).project(E.camera); out.meInView=v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1; }
  out.reunion=G.flags.PS_REUNION||null; out.done=window.__goDone; out.err=window.__goErr; return out; })()""" % json.dumps(CAST)


async def first_line(pg, cdp, log, secs=60):
    """等到第一句沛珊的話出來（OUT.go 字卡、轉場之後）"""
    for _ in range(secs * 2):
        q = await L.state(pg)
        if q['dlg'] and q['dtext']:
            return q
        if q['choices']:
            return q
        await pg.wait_for_timeout(500)
    return None


async def play_to_end(pg, cdp, log, secs=120):
    for _ in range(secs):
        if await pg.evaluate("window.__goDone!==null||window.__goErr!==null"):
            await pe.settle(pg, cdp, log, 20); return True
        await pe.settle(pg, cdp, log, 1)
    return False


async def one(pg, cdp, run, tag, comp):
    s0 = state()
    await L.load_state(pg, s0, quiet_phone=True); await pg.wait_for_timeout(3000); await pe.settle(pg, cdp, [], 30)
    run.setup('讀使用者存檔 day46；【捷徑】撥到 18:00、清邀約' + ('；【捷徑】flags.companion＝%s（有人跟著）' % comp if comp else ''))
    r = await pg.evaluate(PLAN % json.dumps(comp))
    run.setup('【捷徑】OUT.plan 排一筆今天 18:15 的重聚、直接 OUT.go：' + json.dumps(r, ensure_ascii=False))
    run.check(tag + ' 排得進去、開始演', r['ok'] and r['q'], json.dumps(r, ensure_ascii=False))
    log = []
    q = await first_line(pg, cdp, log)
    run.check(tag + ' 出現第一句', q is not None, json.dumps(q, ensure_ascii=False)[:300])
    await pg.wait_for_timeout(1500)
    info = await pg.evaluate(INFO)
    await run.shot(pg, tag + '_first')
    return r, info, log


async def main():
    run = L.Run('pt1107l_pssil_lin', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        # ---- 在 3D 演 ----
        r, info, log = await one(pg, cdp, run, 'A', None)
        prev = r['prev']
        print('[INFO-A]', json.dumps(info, ensure_ascii=False))
        run.check('① 換到 wz_lin、背景模糊的 3D（bgMode＝blur）', info['zone'] == 'wz_lin' and info['staged'] and info['bg'] == 'blur', json.dumps({k: info.get(k) for k in ('zone', 'bg', 'staged')}))
        sp = info.get('spots') or {}
        seats = {c['id']: c.get('seat') for c in sp.get('cast', [])}
        me = sp.get('me')
        bad = []
        for cid in info.get('spawned') or []:
            n = info['npcs'].get(cid); s = seats.get(cid)
            if not n: bad.append(cid + ' 不在'); continue
            if s and (abs(n['x'] - s['x']) > 0.6 or abs(n['z'] - s['z']) > 0.6): bad.append('%s 不在位子上 %s vs %s' % (cid, (n['x'], n['z']), (s['x'], s['z'])))
            if s and n['pose'] != 'sit': bad.append('%s 姿勢 %s' % (cid, n['pose']))
            if not n['vis']: bad.append(cid + ' 看不到（visible false）')
        run.check('② 出場的人都坐在 PSSIL 排的位子上、坐著、看得到（%s）' % '、'.join(info.get('spawned') or []), not bad and len(info.get('spawned') or []) >= 2, '｜'.join(bad) or json.dumps(info['npcs'], ensure_ascii=False))
        ps = seats.get('classmate_peishan'); yu = seats.get('yu')
        run.check('② 沛珊和 Alison 同一桌、你也在那一桌、在她對面', bool(ps and yu and me and ps['table'] == yu['table'] == me['table'] and abs(me['x'] - ps['x']) < 0.05), json.dumps({'ps': ps, 'yu': yu, 'me': me}))
        others = [c for c in sp.get('cast', []) if c['id'] in ('zhe', 'heroine_01')]
        run.check('② 阿哲／以安（認識、在臺灣才在）坐隔壁桌', all(c.get('seat') and c['seat']['table'] != (ps or {}).get('table') for c in others), json.dumps(others) + ' cast=' + json.dumps(r['cast']))
        run.check('② 你坐在你的位子上', info['me']['seat'] and me and abs(info['me']['x'] - me['x']) < 0.6 and abs(info['me']['z'] - me['z']) < 0.6, json.dumps({'me': info['me'], 'spot': me}))
        inview = {k: v['inView'] for k, v in info['npcs'].items() if k in (info.get('spawned') or [])}
        run.check('③ 第一句時鏡頭看得到沛珊（投影在畫面裡）', bool(inview.get('classmate_peishan')), json.dumps(inview) + ' me=' + str(info.get('meInView')) + ' cam=' + json.dumps(info.get('cam')))
        # 【檢查用】把 ADV 層藏起來拍一張，看五個人坐的樣子
        await pg.evaluate("(()=>{ window.__advVis=ADV.root.style.visibility; ADV.root.style.visibility='hidden'; const d=document.getElementById('dlg'); if(d){ window.__dlgVis=d.style.visibility; d.style.visibility='hidden'; } })()")
        await pg.wait_for_timeout(700)
        run.setup('【檢查用】截圖時把 ADV 層和對話框藏起來（只為了看座位，玩家看到的是模糊的那一張）')
        await run.shot(pg, 'A_noadv')
        await pg.evaluate("(()=>{ ADV.root.style.visibility=window.__advVis||''; const d=document.getElementById('dlg'); if(d) d.style.visibility=window.__dlgVis||''; })()")
        ok = await play_to_end(pg, cdp, log)
        await pg.wait_for_timeout(2500)
        end = await pg.evaluate(INFO)
        print('[END-A]', json.dumps(end, ensure_ascii=False))
        print('[LOG-A]', json.dumps(log, ensure_ascii=False)[:3000])
        await run.shot(pg, 'A_end')
        run.check('④ 演完（OUT.go 回傳）', ok and end['done'] == 'true' and not end['err'], json.dumps({'done': end['done'], 'err': end['err']}))
        run.check('④ 回到出發的地方（%s）' % prev['zone'], end['zone'] == prev['zone'] and abs(end['me']['x'] - prev['x']) < 0.6 and abs(end['me']['z'] - prev['z']) < 0.6, json.dumps({'prev': prev, 'now': end['me'], 'zone': end['zone']}))
        left = [k for k, v in end['npcs'].items() if v.get('pssil')]
        run.check('④ 演出用的人沒有留在原區域、PSSIL.staged 清掉', not left and not end['staged'], json.dumps(left))
        run.check('④ PS_REUNION 有記', end['reunion'] is not None, json.dumps(end['reunion']))
        # ---- 換不進去：有人跟著 ----
        r2, info2, log2 = await one(pg, cdp, run, 'B', 'heroine_01')
        print('[INFO-B]', json.dumps(info2, ensure_ascii=False))
        run.check('⑤ 有人跟著：不換區域、深色底', info2['zone'] == r2['prev']['zone'] and not info2['staged'] and info2['bg'] == 'dark', json.dumps({k: info2.get(k) for k in ('zone', 'bg', 'staged')}))
        ok2 = await play_to_end(pg, cdp, log2)
        end2 = await pg.evaluate(INFO)
        run.check('⑤ 照樣演完、記 PS_REUNION', ok2 and end2['done'] == 'true' and end2['reunion'] is not None, json.dumps({'done': end2['done'], 'err': end2['err'], 're': end2['reunion']}))
        run.check('⑤ 兩次台詞一樣多（3D／2D 同一份稿）', abs(len(log) - len(log2)) <= 2, '%d vs %d' % (len(log), len(log2)))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
