"""CC-B（帳號 B）11-07：SKIRT_SIT_8618（BB-B 05:22；SKIRT-BENCH-CLIP-1105，使用者 11-05「路人裙子卡進椅子」）。
  8618f9d80（含 e63df85c9＝LAWWW2-B 768da51ab：8 個穿裙子的路人 npc_nf9/10/12/14/16/17/19/20 加 morph「skirt_sit」，坐下才開）vs 718b59ec7（改之前）。
  三個地方：體育館一樓大廳長椅（gym）、教室翻椅（201＝classroom）、兩點半（cafe）。每一處掃幾個時段，找「有 skirt_sit、坐著」的路人，各拍兩張：
    近（她正前方 1.8 m、眼睛高 1.2 m）、遠（7 m 外＝遠距離模型）。記 id、模型網址、座位、姿勢、sitMorphW、每個 morph 的 skirt_sit 值、近看時看得到的是哪一個網格（遠距離模型 npc_far 也要開）。
  自動檢查（每一處、每一個時段、所有有 skirt_sit 的路人）：
    ① 坐著（靜態坐姿、不是跪坐 sitFloor）＝skirt_sit 1；② 沒坐著（走路、站、上下樓梯）＝0；③ 跪坐（sitFloor）＝0。
  看圖（BB／LAWWW 判；D100a 角色美術 LAWWW）：裙子穿進椅面、從椅子穿到地上、前面鼓起來蓋住手。
  坐下／站起來那一下會不會跳：這支不錄影；改之前、之後各拍同一個人坐著的樣子，跳不跳要看電腦錄的連拍（之後再排）。
  【前置／捷徑】讀檔到那一區（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [TAG=new|old] [PLACES=gym,classroom,cafe] python3 cc_skirt_sit_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('skirt_sit', OUT); D.setup(R, OUT)
TAG = os.environ.get('TAG') or 'run'
DAY = '2025-10-15'   # 星期三
DAYS = {'gym': ['2025-10-15', '2025-10-18']}   # 體育館大廳長椅：平日找不到就再找星期六
PLACES = [x for x in (os.environ.get('PLACES') or 'gym,classroom,cafe').split(',') if x]
HOURS = {'gym': [12.2, 15.2, 17.5, 10.2, 19.0, 8.5, 11.0, 13.0, 14.0, 16.0, 18.0, 20.0], 'classroom': [10.2, 14.3, 9.2, 13.3, 16.2], 'cafe': [15.0, 20.0, 12.5, 17.0]}
SK = r"""(()=>{ const E=GAME.E, out=[], SKIRT=/npc_nf(9|10|12|14|16|17|19|20)\b/;
  (E.npcs||[]).forEach((n,ix)=>{ if(!n||!n.obj) return; let root=null, drv=null; n.obj.traverse(o=>{ const u=o.userData||{}; if(!root&&u.sitMorph) root=o; if(!drv&&u.driver) drv=o; });
    const du=drv?drv.userData:{}; const key=String(du.key||du.model||du.wantModel||''); const hasM=!!root; if(!hasM&&!SKIRT.test(key)) return;   /* 改之前沒有 sitMorph：照模型名找那 8 位 */
    const u=root?root.userData:{}; const vals=hasM?u.sitMorph.map(([o,i])=>({mesh:o.name||'', v:o.morphTargetInfluences?+(+o.morphTargetInfluences[i]).toFixed(3):null, vis:(()=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; })()})):[];
    const p=n.obj.position; out.push({id:n.id||n.crowdKey||('#'+ix), model:key||null, morph:hasM, seat:n.seat?[+n.seat.x.toFixed(2),+n.seat.z.toFixed(2),n.seat.yaw!=null?+(+n.seat.yaw).toFixed(2):null]:null,
      floor:!!(u.sitFloor||du.sitFloor), w:hasM?u.sitMorphW:null, vals, isFar:!!du.isFar, beh:n.beh||null, x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), yaw:+(n.obj.rotation.y||0).toFixed(2), lv:n.lv|0}); });
  return out; })()"""


def ok_state(n):
    vs = [v['v'] for v in n['vals'] if v['v'] is not None]
    if n['seat'] and not n['floor']: want = 1
    else: want = 0
    return want, all(abs(v - want) < 1e-3 for v in vs) if vs else False


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC SKIRT_SIT（%s）：SHA=%s（worktree 實際 %s）；PLACES=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?', PLACES), flush=True)
    rec = {'tag': TAG, 'sha': os.environ.get('SHA', '?'), 'places': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        any_morph = False
        for pl in PLACES:
            got = None; allbad = []; seen_n = 0
            for dkey, h in [(d_, h_) for d_ in DAYS.get(pl, [DAY]) for h_ in HOURS.get(pl, [14.0])]:
                tag = '[%s %s %05.2f]' % (pl, dkey, h)
                R.setup('%s 讀檔 %s %s %05.2f（出生點）' % (tag, pl, dkey, h))
                s = await D.load_zone(pg, cdp, pl, dkey, h, wait=9000)
                if s['zone'] != pl: R.note('%s 讀不進去（%s）' % (tag, J(s))); continue
                await pg.wait_for_timeout(4000)
                ns = await pg.evaluate(SK); seen_n += len(ns)
                if any(n['morph'] for n in ns): any_morph = True
                for n in ns:
                    if not n['morph']: continue
                    want, good = ok_state(n)
                    if not good: allbad.append([tag, n['id'], 'want %d' % want, n['seat'] is not None, n['floor'], [v['v'] for v in n['vals']]])
                sit = [n for n in ns if n['seat'] and not n['floor']]
                R.note('%s 有 skirt_sit 的路人 %d 位、坐著 %d 位：%s' % (tag, len(ns), len(sit), J([[n['id'], n['model'], n['seat'], n['floor'], n['isFar'], n['w'], [v['v'] for v in n['vals']]] for n in ns])))
                if sit and not got: got = (h, sit, dkey)
                if got and len(got[1]) >= 2: break
            rec['places'][pl] = {'bad': allbad}
            if TAG != 'old':
                R.check('[%s] 有 skirt_sit 的路人：坐著＝1、沒坐著／跪坐＝0（全部時段，共看了 %d 人次）' % (pl, seen_n), not allbad, J(allbad[:6]))
            if not got:
                R.note('[%s] 這幾個時段找不到坐著、有 skirt_sit 的路人（%s）' % (pl, HOURS.get(pl)))
                if TAG == 'old': R.note('[%s] 改之前的版本沒有 skirt_sit＝找不到是正常的；改之前的對照照同一個時段拍坐著的穿裙子路人' % pl)
                continue
            h, sit, dkey = got
            rec['places'][pl]['hour'] = h; rec['places'][pl]['day'] = dkey; rec['places'][pl]['shots'] = []
            q0 = await D.st(pg)
            if q0['zone'] != pl or abs(q0['hour'] - h) > 1:
                await D.load_zone(pg, cdp, pl, dkey, h, wait=9000); await pg.wait_for_timeout(4000)
            ns = {n['id']: n for n in await pg.evaluate(SK)}
            for k, n0 in enumerate(sit[:2]):
                n = ns.get(n0['id'], n0)
                fx, fz = math.sin(n['yaw']), math.cos(n['yaw'])   # 人物面向 +z（rotation.y＝yaw）
                look = [n['x'], n['y'] + 0.75, n['z']]
                for nm, dist, eh in (('near', 1.8, 1.2), ('far', 7.0, 1.6)):
                    eye = [n['x'] + fx * dist, n['y'] + eh, n['z'] + fz * dist]
                    # 遠近模型照「玩家」離她多遠切換（不是鏡頭）：先把玩家（藏起來）放到鏡頭正下方、等 1.5 秒讓 LOD 換好再拍
                    await pg.evaluate("((q)=>{ const P=GAME.E.player; P.obj.position.x=q[0]; P.obj.position.z=q[1]; })", [eye[0], eye[2]]); await pg.wait_for_timeout(1500)
                    c = await D.user_shot(pg, cdp, 'skirt_%s_%s_%d_%s' % (TAG, pl, k + 1, nm), {'eye': eye, 'look': look, 'lens': 35 if nm == 'near' else 50})
                    after = {q['id']: q for q in await pg.evaluate(SK)}.get(n['id'])
                    rec['places'][pl]['shots'].append({'name': 'skirt_%s_%s_%d_%s.png' % (TAG, pl, k + 1, nm), 'npc': n['id'], 'model': n['model'], 'seat': n['seat'], 'cam': c, 'morph': after and after['vals']})
                    R.note('[%s %s #%d %s] %s 坐 %s；skirt_sit %s' % (pl, TAG, k + 1, nm, n['id'], J(n['seat']), J(after and after['vals'])))
        if TAG != 'old': R.check('這一版有路人模型帶 skirt_sit（userData.sitMorph）', any_morph, '')
        with open(os.path.join(OUT, 'skirt_sit.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
