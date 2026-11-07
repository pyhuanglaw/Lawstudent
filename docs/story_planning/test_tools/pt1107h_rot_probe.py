"""BB-B 2026-11-07：故事線不演的那幾次，見面中途說「她最近的事」（AA_717 輪換句，LAWWW-B src/arcs3d.js ARCS.rotPick、src/data/arc_rot.js）瀏覽器驗收。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -14）、清邀約、清 ARCINV；【捷徑】WHO 的故事線拍完了（BEATS k=99）、
  一起念書第 N 場也演完了（STUDYN k=99：念書的輪換句和 AA_717 輪流）；ANS＝她記得你選過的（逗號分開，例 PL_WANT）。
  每一輪約念書（手機觸控 → 前往或走去找她 → 演完）；輪和輪之間【捷徑】隔天早上 9 點。最後一輪（FINAL=1）【捷徑】跳到期末考那一週。
看：① 見面前用遊戲自己的 ARCS.rotPick 算這一次該說哪一則，演完畫面／ADV 紀錄裡真的出現那幾句；
  ② BEATS[WHO].rot 記住（最多 3 個、這一次的在最後）、rotSrc 記對（arc＝說了 AA_717、act＝輪到念書自己的輪換句）；
  ③ 連續幾次不重複（最近 3 次用過的不挑）；④ 期末那一週優先說 when:final 的；⑤ 沒有 JS 例外。
用法：LW_TESTS=<測試樹>/tests WHO=heroine_01 ROUNDS=3 FINAL=1 python3 pt1107h_rot_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pt1107e_arcs_probe.py'))
pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WHO = os.environ.get('WHO', 'heroine_01'); pe.WHO = WHO
ROUNDS = int(os.environ.get('ROUNDS', '3'))
FINAL = os.environ.get('FINAL', '1') == '1'
SHIFT = int(os.environ.get('DAYSHIFT', '-14'))
ANS = [x for x in os.environ.get('ANS', '').split(',') if x]
DBG = os.environ.get('DBG', '0') == '1'
SAMPLER = """(w=>{ window.__ivdbg=[]; clearInterval(window.__ivT); window.__ivT=setInterval(()=>{ try{ const G=GAME.G, E=GAME.E; const iv=(G.invites||[]).filter(v=>v.who===w&&v.day===G.day).slice(-1)[0]; if(!iv) return;
  const n=(E.npcs||[]).find(q=>q.id===w||q.charId===w); const L=iv.lead||null; const her=L&&L.her&&INV.seatObj?INV.seatObj(E,L.her):null; const pp=E.player.obj.position;
  window.__ivdbg.push({h:+G.hour.toFixed(2), st:iv.state, ph:L&&L.ph, her:her?{x:+her.x.toFixed(2),z:+her.z.toFixed(2),lv:her.lv|0}:(L&&L.her!=null?String(L.her):null),
    nSeat:n&&n.seat?{x:+n.seat.x.toFixed(2),z:+n.seat.z.toFixed(2)}:null, nPos:n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),lv:n.lv|0}:null, ivLead:n?n._ivLead:null, beh:n&&n.beh, frozen:n&&!!n.frozen,
    p:{x:+pp.x.toFixed(2),z:+pp.z.toFixed(2),lv:E.player.lv|0}, pSeat:!!E.player.seat, busy:!!E.player.busy, free:INV.sceneFree?INV.sceneFree(GAME):null, zone:G.zone, ivZone:iv.zone});
  if(window.__ivdbg.length>400) window.__ivdbg.splice(3,1); }catch(e){ window.__ivdbg.push({err:String(e)}); } },2000); })(%s)"""


def core(t):
    return (t or '').replace('（小聲）', '').strip('（）「」 ')[:9]


async def predict(pg):
    """見面前：照 invites3d.js 的順序算這一次的 SN、ARC、RT（不改狀態）"""
    return await pg.evaluate("""(w=>{ const G=GAME.G; const SNx=(typeof STUDYN!=='undefined')?STUDYN.pick(G,w):null, SN=SNx&&!SNx.generic?SNx:null;
      const ARC=ARCS.pick(G,w,{kind:'study',quiet:true});
      const RT=!ARC&&!(SN&&SN.k)?ARCS.rotPick(G,w,{alt:!!(SN&&SN.rot!=null)}):null;
      const r=ARCS.rec(G,w); const L=(ARC_ROT.rot||{})[w]||[];
      const ok=L.map((x,i)=>({i,t:ARCS.rotTier(G,w,x),when:x.when||null,if:x.if||null,beat:x.beat,life:x.life})).filter(c=>c.t>=0);
      return {day:G.day, date:CALENDAR.dateOf(G.day), term:CALENDAR.termOf?CALENDAR.termOf(G.day):null, life:ARCS.lifeStage(G,w),
        SN:SN?{k:SN.k||null,rot:SN.rot,mid:(SN.mid||[]).slice(0,2)}:null, ARC:ARC?{n:ARC.n}:null,
        RT:RT?{rot:RT.rot,np:RT.np||null,tier:RT.tier,lines:RT.lines}:null, used:(r.rot||[]).slice(), rotSrc:r.rotSrc||null, ok}; })(%s)""" % json.dumps(WHO))


async def main():
    run = L.Run('pt1107h', OUT)
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + SHIFT; s['invites'] = []
    f = dict(s.get('flags') or {})
    for x in ('ARCINV', 'ARC_INVITE', 'DECIDE', 'DECIDE_SAY'): f.pop(x, None)
    B = dict(f.get('BEATS') or {}); B[WHO] = {'k': 99, 'last': None, 'ans': {a: {'opt': 0, 'day': s['day'] - 3} for a in ANS}, 'missed': [], 'rot': []}; f['BEATS'] = B
    SN = dict(f.get('STUDYN') or {}); SN[WHO] = {'n': 6, 'k': 99, 'last': None, 'rot': -1}; f['STUDYN'] = SN
    s['flags'] = f
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46；【捷徑】day %+d、清邀約、清 ARCINV／DECIDE；【捷徑】%s 故事線拍完（k=99）、念書第 N 場演完（STUDYN k=99）；ans %s' % (SHIFT, WHO, ANS))
        await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3500); await pe.settle(pg, cdp, [], 60)
        has = await pg.evaluate("(w=>typeof ARC_ROT!=='undefined'&&!!(ARC_ROT.rot||{})[w]&&typeof ARCS!=='undefined'&&!!ARCS.rotPick)(%s)" % json.dumps(WHO))
        run.check('這一版有 AA_717 輪換句（ARC_ROT.rot.%s、ARCS.rotPick）' % WHO, has)
        if not has: await b.close(); return run.finish()
        said_rots = []
        n = ROUNDS + (1 if FINAL else 0)
        for i in range(n):
            tag = '第%d次' % (i + 1)
            if i > 0:
                if FINAL and i == n - 1:
                    d = await pg.evaluate("(()=>{ for(let d=GAME.G.day+1; d<GAME.G.day+200; d++){ const T=CALENDAR.termOf(d); const wd=CALENDAR.dateOf(d).wd; if(T&&T.exam==='final'&&wd!==6&&wd!==7) return d; } return null; })()")
                    run.setup('[%s]【捷徑】跳到期末考那一週（第 %s 天）早上 9 點' % (tag, d))
                    if d is None: run.check('[%s] 找得到期末考那一週' % tag, False); break
                    await pg.evaluate("(d=>{ GAME.G.day=d; GAME.G.hour=9; })(%d)" % d)
                else:
                    run.setup('[%s]【捷徑】隔天早上 9 點' % tag)
                    await pg.evaluate("(()=>{ GAME.G.day+=1; GAME.G.hour=9; })()")
                await pg.wait_for_timeout(1500); await pe.settle(pg, cdp, [], 40)
            pr = await predict(pg)
            print('   [%s] 預測' % tag, json.dumps(pr, ensure_ascii=False)[:900], flush=True)
            await pg.evaluate("(()=>{ if(typeof ADV!=='undefined'&&Array.isArray(ADV.history)) ADV.history.length=0; })()")
            if DBG:   # 見面卡住時看帶路的狀態（BUG 候選：她被帶路但沒坐在 L.her、走到旁邊也不開演）
                await pg.evaluate(SAMPLER % json.dumps(WHO))
            said, picked = await pe.meet_once(pg, cdp, run, '念書', '總圖', tag)
            if DBG:
                dbg = await pg.evaluate("(()=>{ clearInterval(window.__ivT); return (window.__ivdbg||[]); })()")
                print('   [%s] DBG 帶路取樣 %d 筆（前 3、後 8）' % (tag, len(dbg)), json.dumps(dbg[:3] + dbg[-8:], ensure_ascii=False)[:3000], flush=True)
            hist = await pg.evaluate("(typeof ADV!=='undefined'&&Array.isArray(ADV.history))?ADV.history.map(x=>(x.name||'')+'｜'+x.text):[]")
            allt = (said or []) + hist
            r2 = await pg.evaluate("(w=>{ const r=ARCS.rec(GAME.G,w); return {rot:(r.rot||[]).slice(), rotSrc:r.rotSrc||null, k:r.k, last:r.last}; })(%s)" % json.dumps(WHO))
            run.check('[%s] 見面演完' % tag, said is not None, json.dumps((said or [])[-6:], ensure_ascii=False))
            if said is None: break
            RT = pr['RT']
            if RT:
                lines = RT['lines'] or []
                miss = [t for t in lines if core(t) and not any(core(t) in x for x in allt)]
                run.check('[%s] ① 說了 AA_717 第 %s 則（tier %s）：%s' % (tag, RT['rot'], RT['tier'], ' / '.join(lines)), not miss, json.dumps({'miss': miss, 'hist': hist[-14:]}, ensure_ascii=False))
                if RT.get('np'):
                    run.check('[%s] ② 沒排成那一次的 noPlan 記了（rotSrc arc）' % tag, r2['rotSrc'] == 'arc', json.dumps(r2))
                else:
                    run.check('[%s] ② BEATS.rot 最後一個＝%s、最多 3 個、rotSrc arc' % (tag, RT['rot']), bool(r2['rot']) and r2['rot'][-1] == RT['rot'] and len(r2['rot']) <= 3 and r2['rotSrc'] == 'arc', json.dumps(r2))
                    said_rots.append(RT['rot'])
            else:
                sn = pr['SN'] or {}
                mid = sn.get('mid') or []
                run.check('[%s] ① 這次輪到念書自己的輪換句（AA_717 沒挑，SN rot %s）' % (tag, sn.get('rot')), bool(sn) and sn.get('rot') is not None and (not mid or any(core(mid[0]) in x for x in allt)), json.dumps({'pr': pr, 'hist': hist[-12:]}, ensure_ascii=False)[:900])
                run.check('[%s] ② rotSrc 記 act（下一次換 AA_717）' % tag, r2['rotSrc'] == 'act', json.dumps(r2))
            if FINAL and i == n - 1:
                fin = [c['i'] for c in pr['ok'] if c['when'] == 'final']
                run.check('[%s] ④ 期末那一週：說的是 when:final 那幾則（%s）' % (tag, fin), bool(fin) and bool(RT) and RT['rot'] in fin and RT['tier'] == 2, json.dumps({'RT': RT, 'term': pr['term']}, ensure_ascii=False))
        plain = said_rots[:-1] if FINAL else said_rots
        run.check('③ 連續幾次說的都不一樣（%s）' % said_rots, len(set(plain)) == len(plain), json.dumps(said_rots))
        await run.shot(pg, 'rot_after')
        run.check('⑤ 沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
