"""CC（帳號 A）11-03：舊序章同學、邵鈞同框那一場的立繪（BB 16:27；LAWWW f110787dd BUG-ADV-NOPORTRAIT-DIM-1103 改了 yule_portrait 第 4 項的期望）。
  原本：邵鈞（沒有立繪）說話＝佔一框 compact、只暗另一邊；現在：沒有立繪就不佔框、台上的人都變暗。期望改了就要看畫面。
  場景：src/y2r2_3d.js ev_kexin_film_night「系上的電影夜」（大二上 12/11（五）19:00 外校大學系上的小教室）：
    舊序章同學「破冰。每個人講一樣，你包包裡最沒用的東西。」→ 選「去年的考古題。」→ 邵鈞「……這個我有興趣。」→ 旁白 → 舊序章同學「外系的，一個都沒少。」→ 可昕。
  【前置／捷徑】讀檔到 2026-12-11 18:50 校園、旗標 YL_IMPRESSION=funny（舊序章同學開場那一句）、ENC_D13_KX 沒有（可昕介紹邵鈞那一句）；
    用遊戲自己的事件引擎 void EVENTS.run(那個事件) 開演（不等出遊的邀約）——只為了看 ADV 的立繪，不是玩家流程。
  每一句記下：說話的人（#dlgName）、兩個框（ADV.slots 的 charId、DOM 的 show／dim／off／有沒有圖）。
  檢查：
    ① 演到邵鈞那一句、舊序章同學那幾句
    ② 邵鈞說話時：沒有一框是邵鈞（不佔框）、台上有圖的框都 .dim；
    ③ 舊序章同學說話時：舊序章同學那一框亮（沒有 .dim）、其他有圖的框 .dim
    ④ 整場沒有空框：show 的框都有圖（不是 compact 的空殼）
    ⑤ 立繪不跳來跳去：同一個人一上台就一直在同一框（左／右不換），中途沒有被擠下去又上來
    截圖：邵鈞那一句、舊序章同學（破冰）那一句，橫向、直向各一張。
用法：LW_TESTS=<wt>/tests SHA=<sha> python3 cc_yule_shao_adv_probe.py <url> <out>
exit 0＝ALL PASS；1＝有 FAIL。Playwright 手機模擬，不是 iPhone 實機。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
EV_ID = 'ev_kexin_film_night'
PICK = '「去年的考古題。」'
J = lambda o: json.dumps(o, ensure_ascii=False)
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
              'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'YL_IMPRESSION': 'funny'}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


SLOTS = """(()=>{ const A=ADV; return ['left','right'].map(s=>{ const box=s==='left'?A.L:A.R, o=A.slots&&A.slots[s];
  return {s, id:o?o.charId:null, show:box.classList.contains('show'), dim:box.classList.contains('dim'), off:box.classList.contains('off'), img:!!box.querySelector('img'), compact:!!(o&&o.compact)}; }); })()"""
ST = """(()=>{ const ch=document.getElementById('choices'), D=GAME.D||{};
  return {dlg:!!D.active, name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').slice(0,30),
    choices:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[], running:EVENTS.running||null, adv:!!ADV.active}; })()"""


async def main():
    os.makedirs(OUT, exist_ok=True); lines = []; shots = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        d = await pg.evaluate("STORY.dayOfKey('2026-12-11')"); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)
        print('  [前置／捷徑] 讀檔：2026-12-11（day %s、週%s）18:50 校園；YL_IMPRESSION=funny；關掉條件事件' % (d, wd), flush=True)
        await L.load_state(pg, {'zone': 'campus', 'hour': 18.83, 'day': d, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE_FLAGS}, quiet_events=True)
        await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
        ok = await pg.evaluate("!!STORY_EVENTS.find(e=>e.id===%s)" % J(EV_ID))
        check('事件 %s 在 STORY_EVENTS 裡' % EV_ID, ok)
        print('  [前置／捷徑] void EVENTS.run(STORY_EVENTS.find(e=>e.id==="%s"))' % EV_ID, flush=True)
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id===%s))" % J(EV_ID))
        t0 = time.time(); last = None; started = False
        while time.time() - t0 < 300:
            s = await pg.evaluate(ST)
            if s['adv'] or s['dlg']: started = True
            if started and not s['running'] and not s['dlg'] and not s['choices']: break
            if s['choices']:
                i = next((k for k, x in enumerate(s['choices']) if x.startswith(PICK)), 0)
                print('  選項 %s → 「%s」' % (J(s['choices']), s['choices'][i]), flush=True)
                await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); await pg.wait_for_timeout(1500); continue
            if s['dlg']:
                sig = (s['name'], s['text'])
                if sig != last:
                    await pg.wait_for_timeout(900)   # 立繪換框、變暗有 0.3 秒的 transition
                    sl = await pg.evaluate(SLOTS); lines.append({'name': s['name'], 'text': s['text'], 'slots': sl}); last = sig
                    key = 'shao' if s['name'] == '邵鈞' else ('yule' if s['name'] == '舊序章同學' and s['text'].startswith('破冰') else None)
                    if key and key not in shots:
                        await pg.screenshot(path=os.path.join(OUT, '%s_land.png' % key))
                        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(2000)
                        await pg.screenshot(path=os.path.join(OUT, '%s_port.png' % key)); shots[key] = {'land': sl, 'port': await pg.evaluate(SLOTS)}
                        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(2000)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            await pg.wait_for_timeout(600)
        with open(os.path.join(OUT, 'lines.json'), 'w', encoding='utf-8') as f: json.dump({'lines': lines, 'shots': shots}, f, ensure_ascii=False, indent=1)
        for l in lines: print('  %-6s %-30s %s' % (l['name'] or '（旁白）', l['text'], J([(x['s'], x['id'], 'show' if x['show'] else '-', 'dim' if x['dim'] else '', 'img' if x['img'] else 'noimg') for x in l['slots']])), flush=True)
        shao = [l for l in lines if l['name'] == '邵鈞']; yule = [l for l in lines if l['name'] == '舊序章同學']
        check('① 演到邵鈞那一句、舊序章同學那幾句', bool(shao) and len(yule) >= 2, J({'shao': len(shao), 'yule': len(yule)}))
        for tag, sl in [('句子', l['slots']) for l in shao] + [('截圖 ' + o, shots['shao'][o]) for o in ('land', 'port') if 'shao' in shots]:
            on = [x for x in sl if x['show'] and x['img']]
            check('② 邵鈞說話（%s）：不佔框、台上有圖的框都變暗' % tag, not any(x['id'] == '邵鈞' for x in sl) and all(x['dim'] for x in on), J(sl))
        for tag, sl in [('「%s」' % l['text'][:10], l['slots']) for l in yule] + [('截圖 ' + o, shots['yule'][o]) for o in ('land', 'port') if 'yule' in shots]:
            me = [x for x in sl if x['id'] == 'yule' and x['show']]; oth = [x for x in sl if x['id'] != 'yule' and x['show'] and x['img']]
            check('③ 舊序章同學說話（%s）：她那一框亮、其他有圖的框變暗' % tag, len(me) == 1 and not me[0]['dim'] and me[0]['img'] and all(x['dim'] for x in oth), J(sl))
        empty = [(l['name'], l['text'], x) for l in lines for x in l['slots'] if x['show'] and not x['img']]
        check('④ 整場沒有空框（show 的框都有圖）', not empty, J(empty[:4]))
        where = {}; jumps = []
        for l in lines:
            ids = {x['id']: x['s'] for x in l['slots'] if x['id'] and x['show']}
            for cid, s in ids.items():
                if cid in where and where[cid][0] != s: jumps.append({'id': cid, 'from': where[cid], 'to': s, 'at': l['text']})
                where[cid] = (s, l['text'])
        gone = []
        seen_ids = set()
        for l in lines:
            now = {x['id'] for x in l['slots'] if x['id'] and x['show']}
            for cid in seen_ids - now: gone.append({'id': cid, 'at': l['text']})
            seen_ids |= now
        check('⑤ 立繪不跳來跳去：同一個人一直在同一框、上台以後沒有被擠下去', not jumps and not gone, J({'jumps': jumps[:4], 'gone': gone[:4]}))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS[:6])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
