"""CC（帳號 A）11-10：SERVICE2-LEGAL-1110（BB 11-10 08:1x 排）瀏覽器探針。
開發分支 claude/modest-rubin-2lyp7g：新版＝a883f36de（服務學習（二）改到法律服務中心：法律系館B 一樓大廳東側接待桌報到）；舊版＝bc9c1408c（它的上一個 commit；還是晨思鐘旁的集合點）。
課表（src/data/courses.js）：service_2 大二上（Y2S1）週三 pm2＝下午二 15:30～17:20（COURSES.blocks.pm2 t0 15.5、t1 17+20/60），第 4～7、10～14 週，補 15、16 週；
  開始前 30 分鐘（classes3d.js WIN0）就能報到。
出席紀錄存在 G.courses.attend.service_2（第幾次）＋ G.courses.done[那一堂的 key]（CLS.attend 的 service 分支：說第 n 句 serviceLines → 快轉到 17:20 → attend+1 → 字幕「服務學習（二）：第 n 次（n／9）。」）。
流程（真實玩家操作；不用 ?turbo、不瞬移）：
  [前置／捷徑] 法律系的最小存檔（GAME.defaults＋過了開場的旗標，同 cc_dl04b_probe 的 state_at）放到大二上第 4 週週三（2026-09-30）15:05、校園、法律系館B 一樓入口前（萬才館出來站的地方）。
  → 只讀：CLS.termCourses 有 service_2、CLS.liveDoor 現在是哪一個門（新版 wancai_lsc_desk、舊版 campus_service）、手機「今天」寫的地點
  → 走到法律系館B 一樓入口按「進入」→ 大廳裡走到東側接待桌（wancai 區域裡 door＝wancai_lsc_desk 的互動點）→ 按「法律服務中心」
  → 選「報到：服務學習（二）」→ 對話點完 → 看出席有沒有記到。
看：
  V1 手機「今天」的服務學習（二）地點寫「法律服務中心」（舊版：晨思鐘旁的服務學習集合點）
  V2 法律系館B 大廳有「法律服務中心」接待桌的互動點、走得到、按得到（舊版沒有）
  V3 按下去有「報到：服務學習（二）」的選項
  V4 選了以後第一句是 AA_735 的第一句（「你們不回答法律問題。」），字幕「服務學習（二）：第 1 次（1／9）。」
  V5 出席有記到：G.courses.attend.service_2＝1、這一堂 done；時間快轉到下課（≥ 17:20）
  V6 報到完卡住檢查（對話關、busyDepth 0、搖桿推得動）、沒有 JS 例外
判定：PASS／FAIL／INFO，最後 ALL PASS 或 FAILED n。舊版應該 FAIL 的：V1～V5。
用法：LW_TESTS=<樹>/tests python3 cc_service2_probe.py <url> <out>（PC：URL 不加 ?turbo）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CID = 'service_2'
WHEN = ['Y2S1', 4, 3]           # 大二上第 4 週週三
HOUR = 15 + 5 / 60
LINE1 = '你們不回答法律問題'
FAILS = []
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # cc_dl04b_probe.py 的 BASEF（法律系、過了開場）
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')


def check(name, ok, s=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + s) if s else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, s=''):
    print('INFO ' + name + (('  ' + s) if s else ''), flush=True)


class Run:
    def __init__(self): self.n = 0
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, s=''): return check(n, ok, s)
    def setup(self, s): print('  [前置／捷徑] ' + s, flush=True)
    async def shot(self, pg, label):
        self.n += 1; p = os.path.join(OUT, '%02d_%s.png' % (self.n, label))
        try: await pg.screenshot(path=p)
        except Exception as e: print('  screenshot failed', e)
        return p


REC_JS = """(cid=>{ const G=GAME.G, R=(typeof CLS!=='undefined'&&CLS.rec)?CLS.rec(G):(G.courses||{}); const it=(CLS.dayItems?CLS.dayItems(G):[]).find(x=>x.c&&x.c.id===cid)||null;
  return {attend:(R.attend||{})[cid]||0, key:it&&it.key, done:it?!!(R.done||{})[it.key]:null, status:it&&CLS.status?CLS.status(G,it):null, room:it&&it.room?{name:it.room.name,door:it.room.door,zone:it.room.zone||null}:null,
    t0:it&&it.t0, t1:it&&it.t1, h:+(+G.hour).toFixed(3), day:G.day, zone:G.zone,
    enrolled:CLS.termCourses?CLS.termCourses(G,'Y2S1').map(c=>c.id).includes(cid):null,
    doorNew:CLS.liveDoor?!!CLS.liveDoor(G,'wancai_lsc_desk'):null, doorOld:CLS.liveDoor?!!CLS.liveDoor(G,'campus_service'):null}; })"""
EXIT_JS = """(z=>{ const E=GAME.E, p=E.player.obj.position; const L=E.interactables.filter(i=>!i.hidden&&i.exit&&i.exit.to===z&&((i.lv|0)===0)).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.5,label:i.label,d:+Math.hypot(i.x-p.x,i.z-p.z).toFixed(2)}));
  L.sort((a,b)=>a.d-b.d); return L; })"""
DESK_JS = """(()=>{ const E=GAME.E; const it=E.interactables.find(i=>!i.hidden&&(i.door==='wancai_lsc_desk'||(i.label||'')==='法律服務中心'));
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.2,label:it.label,lv:it.lv|0}:null; })()"""
LABELS_JS = """(()=>GAME.E.interactables.filter(i=>!i.hidden&&(i.lv|0)===0).map(i=>i.label).slice(0,40))()"""


class Stop(Exception):
    pass


async def rec(pg):
    return await pg.evaluate(REC_JS, CID)


async def tap_when(pg, cdp, want, secs=8):
    t0 = time.time()
    while time.time() - t0 < secs:
        q = await P.ts(pg)
        if q['lab'].startswith(want):
            await L.tap(pg, cdp, '#interact'); return True
        await pg.wait_for_timeout(500)
    return False


async def main():
    os.makedirs(OUT, exist_ok=True); run = Run()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        try:
            await pg.goto(URL)
            if not check('遊戲載入', await L.wait_loaded(pg)): raise Stop()
            d = await P.day_of(pg, WHEN)
            info('大二上第 4 週週三', J(d))
            F = dict(BASEF)
            for k, kk in ROOMS:
                dd = (await P.day_of(pg, kk))['d']
                if dd <= d['d']: F[k] = dd
            st = {'name': '祐廷', 'energy': 100, 'money': 30000, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': F,
                  'stage': 'law', 'day': d['d'], 'weekday': d['wd'], 'hour': HOUR, 'zone': 'campus', 'pos': None, 'weather': 'clear', 'visited': {z: True for z in VISITED}}
            await P.load(pg, cdp, st, quiet=False); await P.init(pg); await P.say_hook(pg)
            sp = await pg.evaluate("(()=>{ const w=(typeof WC3!=='undefined'&&WC3.CAMPUS_1F)||null; const E=GAME.E; const ex=E.interactables.filter(i=>i.exit&&i.exit.to==='wancai'&&((i.lv|0)===0)); return {c1f:w, ex:ex.map(i=>[+i.x.toFixed(2),+i.z.toFixed(2),i.label])}; })()")
            ex = (sp.get('ex') or [])
            if ex:   # 站到入口前 3 m 站得住的地方（＝從萬才館出來站的那一帶）
                await P.place_near(pg, run, ex[0][0], ex[0][1], 4.0, 0, '法律系館B 一樓入口')
            run.setup('法律系的最小存檔（cc_dl04b_probe 的 BASEF）讀到 %s（%s 第 %s 週週三）%02d:%02d 校園；入口 %s' % (d['key'], d['term'], d['week'], int(HOUR), round(HOUR % 1 * 60), J(ex[:2])))
            await P.settle(pg, cdp, 3000)
            r0 = await rec(pg); info('讀檔後（只讀）', J(r0))
            check('前置：大二上有修服務學習（二）、今天有這一堂、現在可以報到（status open）', bool(r0['enrolled']) and r0['key'] is not None and r0['status'] == 'open', J(r0))
            info('現在的門：新版 wancai_lsc_desk %s、舊版 campus_service %s；t0 %s t1 %s' % (r0['doorNew'], r0['doorOld'], r0['t0'], r0['t1']))
            txt = await P.phone_tab(pg, cdp, 'today'); await P.phone_close(pg, cdp)
            seg = next((ln for ln in txt.splitlines() if '服務學習' in ln), '')
            info('手機「今天」', txt[:400].replace('\n', '｜'))
            check('V1 手機「今天」的服務學習（二）寫在法律服務中心', '法律服務中心' in txt, seg)
            await run.shot(pg, 'campus_start')
            # 走進法律系館B
            ex = await pg.evaluate(EXIT_JS, 'wancai')
            if not check('前置：校園有進法律系館B 一樓的入口', bool(ex), J(ex[:2])): raise Stop()
            e0 = ex[0]
            await L.go_to(pg, cdp, run, e0['x'], e0['z'], max(0.5, e0['r'] - 0.4), '法律系館B 一樓入口', max_s=300, stop=lambda s, w=e0['label']: s['interact'].startswith(w[:4]))
            tapped = await tap_when(pg, cdp, e0['label'][:4], 10)
            for _ in range(40):
                if (await P.ts(pg))['zone'] == 'wancai': break
                await pg.wait_for_timeout(500)
            r1 = await P.ts(pg)
            if not check('走到入口按「%s」進了法律系館B（wancai）' % e0['label'], tapped and r1['zone'] == 'wancai', J({'tapped': tapped, 'zone': r1['zone']})): raise Stop()
            await pg.wait_for_timeout(2500); await P.dialog(pg, cdp, run, (), max_s=60, start_s=3, tag='進門')
            desk = await pg.evaluate(DESK_JS)
            if not check('V2 法律系館B 大廳有「法律服務中心」接待桌的互動點', bool(desk), J(desk) if desk else J(await pg.evaluate(LABELS_JS))):
                await run.shot(pg, 'wancai_no_desk'); raise Stop()
            ok = await L.go_to(pg, cdp, run, desk['x'], desk['z'], max(0.4, desk['r'] - 0.5), '法律服務中心接待桌', max_s=300, lv=0, stop=lambda s: s['interact'].startswith('法律服務中心'))
            await run.shot(pg, 'desk')
            n0 = len(await pg.evaluate("window.__SAY||[]"))
            tapped = ok and await tap_when(pg, cdp, '法律服務中心', 10)
            check('V2 走到接待桌、按鈕是「法律服務中心」、按下去', bool(tapped), J(await P.ts(pg)))
            # 選「報到：服務學習（二）」
            opt = None
            for _ in range(30):
                q = await P.ts(pg)
                if q['ch']: opt = [o['t'] for o in q['ch']]; break
                if q['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(500)
            k = next((i for i, t in enumerate(opt or []) if t.startswith('報到：服務學習（二）')), None)
            if not check('V3 選單有「報到：服務學習（二）」', k is not None, J(opt)): raise Stop()
            c0 = await P.cap_n(pg)
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200)
            r = await P.dialog(pg, cdp, run, (), max_s=240, start_s=10, idle_s=5, tag='報到')
            await pg.wait_for_timeout(3000)
            said = await P.said(pg, n0); caps = P.cap_spans(await P.captions(pg, c0))
            info('GAME.say', J(said)); info('字幕', J([c[0] for c in caps]))
            first = next((t for n, t in said if t), '')
            check('V4 第一句是法律服務中心的第一句（「%s」）' % LINE1, LINE1 in first, first)
            check('V4 字幕「服務學習（二）：第 1 次（1／9）。」', any(c[0].startswith('服務學習（二）：第 1 次（1／9）') for c in caps), J([c[0] for c in caps]))
            r2 = await rec(pg); info('報到後', J(r2))
            check('V5 出席有記到：G.courses.attend.service_2＝1、這一堂 done、時間到下課（≥ 17:20）', r2['attend'] == 1 and bool(r2['done']) and r2['h'] >= 17 + 20 / 60 - 0.02, J(r2))
            await run.shot(pg, 'after_attend')
            # 卡住檢查
            moved = 0.0
            for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
                moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
                if moved >= 0.3: break
            q = await P.ts(pg)
            check('V6 報到完卡住檢查（對話關、busyDepth 0、搖桿 ≥ 0.3 m）', not q['dlg'] and not q['ch'] and q['depth'] == 0 and moved >= 0.3, J({'moved': round(moved, 2), 'q': q}))
            check('V6 沒有 JS 例外', not errs, J(errs[:3]))
        except Stop:
            pass
        except Exception as e:
            check('探針本身沒有例外', False, repr(e)[:300])
            try: await pg.screenshot(path=os.path.join(OUT, 'EXC.png'))
            except Exception: pass
        finally:
            await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:12])), flush=True)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
