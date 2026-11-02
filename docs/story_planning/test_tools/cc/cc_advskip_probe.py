"""CC（帳號 A）11-02：BUG-ADV-SKIP（P0）瀏覽器探針——ADV 對話裡的「略過對話」按得到、一路翻到下一個選項、停在選項、選完恢復一句一句。
修正：be3c6324e（src/adv3d.js #advTop 移到 body、z-index 7、非 ADV 時 display none；src/game3d.js say() 在 ADV.active&&ADV.skip 時 40ms 自動翻頁；choose() 開頭 ADV.skip=false）。
對照（修正前）：be3c6324e^＝03b2721af。預期：修正後全 PASS；修正前 a 或 b FAIL。
不是 iPhone：Playwright 手機橫向模擬（844×390，SwiftShader 1～4 fps）。不用 ?turbo。

情境（ev_rain_library_door「雨天的總圖門口」：旁白／語彤／語彤／旁白 四句 → 四個選項 →「一起走吧」那一支再四句以上）：
  【前置／捷徑】load_state 讀檔到第 8 天 18:30 校園總圖門口 (80,4)、下雨、quiet_events（條件事件關掉，避免別的事件先演）；
  【前置／捷徑】用遊戲自己的事件引擎 `void EVENTS.run(那個事件)` 開演（不等條件觸發）。
  驗證動作照玩家：CDP 觸控點 #advTop 裡文字 startswith「略過對話」的按鈕、點選項按鈕、點 #dlg。
檢查（讀遊戲狀態：ADV.active／ADV.skip／ADV.history／GAME.D.active、#choices 有沒有 hide、E.player.busy；按鈕比對 startswith）：
  0  一般非 ADV 時「略過對話」不顯示（body 沒有 adv-on 時 #advTop 的 display）——只記錄（INFO），不算 PASS／FAIL
  a  按鈕可點：按鈕中心的 elementFromPoint 是按鈕本身或它的子元素（記下實際蓋在上面的是誰）
  b  按一下以後、中間不再點，選項出現（#choices 不是 hide、有按鈕）；ADV.history 有開場四句
  c  停在選項：再等 STAY_S 秒，選項還在、ADV.history 沒增加（劇情沒前進）、ADV.skip===false
  d  選第一個選項以後：下一句出來、等 3 秒還停在同一句（ADV.history 只多 1）；點 #dlg 兩次以上每次只前進一句
  e  沒卡住：點完對話後 ADV.active false、E.player.busy false（回到可以操作）
  b 沒過（修正前）時：照玩家點 #dlg 點到選項出來，c～e 照樣量（c 的意義只剩「選項會停住」）。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] python3 cc_advskip_probe.py '<URL>/index.html' <輸出資料夾>
環境變數：STAY_S（預設 6）、B_WAIT（等選項的秒數，預設 45）
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
STAY_S = int(os.environ.get('STAY_S', '6'))
B_WAIT = int(os.environ.get('B_WAIT', '45'))
EV_ID = 'ev_rain_library_door'
OPEN_LINES = 4   # 選項前的句數（events.js 的 dialogue 前四句）
J = lambda o: json.dumps(o, ensure_ascii=False)
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
              'fundsV2': 1, 'allowanceMonth': 9}

FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(s): print('INFO ' + s, flush=True)


def setup(s): print('  [前置／捷徑] ' + s, flush=True)


ST_JS = """(()=>{ const ch=document.getElementById('choices'); const D=GAME.D||{}; const A=(typeof ADV!=='undefined')?ADV:{};
  return {adv:!!A.active, skip:A.skip===undefined?null:!!A.skip, hist:(A.history||[]).length, last:((A.history||[]).slice(-1)[0]||{}).text||'',
    dlg:!!D.active, dtext:((document.getElementById('dlgText')||{}).textContent||'').slice(0,40),
    choices:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').slice(0,24)):[],
    busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy), running:EVENTS.running||null, advOn:document.body.classList.contains('adv-on'),
    hour:+GAME.G.hour.toFixed(3)}; })()"""

BTN_JS = """(()=>{ const top=document.getElementById('advTop'); if(!top) return {exists:false};
  const b=[...top.querySelectorAll('button')].find(x=>(x.textContent||'').trim().startsWith('略過對話'));
  const cs=getComputedStyle(top); const out={exists:true, topDisplay:cs.display, topParent:top.parentElement?top.parentElement.id||top.parentElement.tagName:null, topZ:cs.zIndex, btn:!!b};
  if(!b) return out; const r=b.getBoundingClientRect(); out.rect=[+r.left.toFixed(1),+r.top.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)];
  if(!r.width||!r.height) return out; const cx=r.left+r.width/2, cy=r.top+r.height/2; out.c=[cx,cy];
  const h=document.elementFromPoint(cx,cy); out.hitOk=!!h&&(h===b||b.contains(h)); out.hit=h?(h.tagName+(h.id?'#'+h.id:'')+(h.className&&typeof h.className==='string'?'.'+h.className.split(' ').join('.'):'')+' 「'+(h.textContent||'').trim().slice(0,12)+'」'):null;
  return out; })()"""


async def st(pg): return await pg.evaluate(ST_JS)


async def tap_choice(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>(x.textContent||'').trim().startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % J(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); return True


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_advskip_probe  SHA=%s  URL=%s' % (SHA, URL), flush=True)
    rec = {'sha': SHA, 'url': URL}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        setup('load_state：第 8 天（週四）18:30 校園總圖門口 (80,4)、下雨、quiet_events（條件事件關掉）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 18.5, 'day': 8, 'weekday': 4, 'weather': 'rain', 'pos': {'x': 80, 'z': 4, 'yaw': 3.14}, 'flags': BASE_FLAGS},
                           quiet_events=True)
        await pg.wait_for_timeout(4000)
        # 0：非 ADV 時
        s0 = await st(pg); b0 = await pg.evaluate(BTN_JS)
        info('0 非 ADV（adv-on=%s、ADV.active=%s）：#advTop %s' % (s0['advOn'], s0['adv'], J(b0)))
        rec['nonadv'] = {'state': s0, 'btn': b0}
        # 開演
        ok_ev = await pg.evaluate("!!STORY_EVENTS.find(e=>e.id===%s)" % J(EV_ID))
        check('事件 %s 存在' % EV_ID, ok_ev)
        setup('void EVENTS.run(STORY_EVENTS.find(e=>e.id==="%s"))（用遊戲自己的事件引擎開演）' % EV_ID)
        await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id===%s))" % J(EV_ID))
        s = None
        for _ in range(60):
            s = await st(pg)
            if s['adv'] and s['dlg'] and s['hist'] >= 1: break
            await pg.wait_for_timeout(500)
        check('ADV 開始、第一句出現', bool(s and s['adv'] and s['dlg']), J(s))
        await pg.wait_for_timeout(800)
        await pg.screenshot(path=os.path.join(OUT, '01_adv_first_line.png'))
        s1 = await st(pg); bi = await pg.evaluate(BTN_JS)
        rec['before_skip'] = {'state': s1, 'btn': bi}
        info('按之前：ADV.history=%d 最後一句「%s」 skip=%s' % (s1['hist'], s1['last'][:20], s1['skip']))
        # a
        check('a 「略過對話」按鈕可點（中心點 elementFromPoint 是按鈕本身／子元素）', bool(bi.get('btn') and bi.get('hitOk')),
              '按鈕=%s 中心=%s 蓋在上面的=%s #advTop 父層=%s z=%s' % (bi.get('btn'), bi.get('c'), bi.get('hit'), bi.get('topParent'), bi.get('topZ')))
        # b：照玩家按（CDP 觸控按按鈕的中心點；被蓋住就會按到上面那一個）
        taps = 0
        if bi.get('c'):
            await L.touch_tap(cdp, bi['c'][0], bi['c'][1]); taps = 1
        t0 = time.time(); seen = []; sb = None
        while time.time() - t0 < B_WAIT:
            sb = await st(pg)
            if sb['dtext'] and (not seen or seen[-1] != sb['dtext']): seen.append(sb['dtext'])
            if sb['choices']: break
            await pg.wait_for_timeout(250)
        hist_txt = await pg.evaluate("(ADV.history||[]).map(h=>(h.text||'').slice(0,20))")
        rec['after_skip'] = {'state': sb, 'seen': seen, 'hist': hist_txt, 'sec': round(time.time() - t0, 1)}
        b_ok = bool(sb and sb['choices'])
        check('b 按一下、中間不再點：一路翻到選項出現（%d 秒內）' % B_WAIT, b_ok and taps == 1,
              '用了 %.1f 秒；選項=%s；ADV.history=%d；按完以後畫面上看過的句子=%s' % (time.time() - t0, sb and sb['choices'], sb and sb['hist'], J(seen)))
        if b_ok:
            check('b ADV.history 有開場 %d 句（每一句都經過，不是直接跳）' % OPEN_LINES, sb['hist'] >= OPEN_LINES, J(hist_txt))
        await pg.screenshot(path=os.path.join(OUT, '02_after_skip.png'))
        if not b_ok:
            note_taps = 0
            for _ in range(40):
                q = await st(pg)
                if q['choices']: break
                if q['dlg']: await L.tap(pg, cdp, '#dlg'); note_taps += 1
                await pg.wait_for_timeout(900)
            info('b 沒過：改照玩家點 #dlg %d 次到選項（c～e 照樣量）' % note_taps)
        # c
        c0 = await st(pg)
        await pg.wait_for_timeout(STAY_S * 1000)
        c1 = await st(pg)
        rec['stay'] = {'t0': c0, 't1': c1}
        check('c 停在選項：%d 秒後選項還在、沒有自動選' % STAY_S, bool(c0['choices']) and c1['choices'] == c0['choices'], '前=%s 後=%s' % (J(c0['choices']), J(c1['choices'])))
        check('c 停在選項：劇情沒前進（ADV.history 不變）', c1['hist'] == c0['hist'], '%d → %d' % (c0['hist'], c1['hist']))
        check('c 停在選項：ADV.skip 變回 false', c1['skip'] is False, 'ADV.skip=%s' % c1['skip'])
        await pg.screenshot(path=os.path.join(OUT, '03_choices.png'))
        # d
        h_before = c1['hist']
        picked = await tap_choice(pg, cdp, '「一起走吧')
        if not picked and c1['choices']:
            picked = await tap_choice(pg, cdp, c1['choices'][0][:3])
        check('d 選了第一個選項（「一起走吧。」）', picked)
        d1 = None
        for _ in range(40):
            d1 = await st(pg)
            if d1['dlg'] and d1['hist'] > h_before and not d1['choices']: break
            await pg.wait_for_timeout(300)
        await pg.wait_for_timeout(3000)
        d2 = await st(pg)
        rec['after_choice'] = {'d1': d1, 'd2': d2}
        check('d 選完：下一句出來、3 秒後還停在同一句（ADV.history 只多 1、對話框還開著）',
              bool(d1 and d1['dlg']) and d2['dlg'] and d2['hist'] == h_before + 1 and d2['last'] == d1['last'],
              '選前 history=%d；出來=%d「%s」；3 秒後=%d「%s」 skip=%s' % (h_before, d1 and d1['hist'], d1 and d1['last'][:16], d2['hist'], d2['last'][:16], d2['skip']))
        steps = []
        for k in range(2):
            q0 = await st(pg)
            if not q0['dlg']: break
            for _ in range(4):   # 第一下可能只是把打字效果補完
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200)
                q1 = await st(pg)
                if q1['hist'] != q0['hist'] or not q1['dlg']: break
            steps.append((q0['hist'], q1['hist'], q1['last'][:16]))
        rec['steps'] = steps
        check('d 點 #dlg：每次只前進一句（不會繼續自動略過）', len(steps) == 2 and all(b2 - a2 == 1 for a2, b2, _ in steps), J(steps))
        # e
        q = None; ntap = 0; t0 = time.time()
        while time.time() - t0 < 180:
            q = await st(pg)
            if not q['adv'] and not q['dlg'] and not q['choices'] and not q['busy']: break
            if q['choices']:
                await tap_choice(pg, cdp, q['choices'][0][:3]); ntap += 1
            elif q['dlg']:
                await L.tap(pg, cdp, '#dlg'); ntap += 1
            await pg.wait_for_timeout(900)
        await pg.wait_for_timeout(1500)
        q = await st(pg)
        rec['end'] = q
        check('e 沒卡住：點完對話後 ADV 結束、E.player.busy false', not q['adv'] and not q['busy'] and not q['dlg'], '點了 %d 下；%s' % (ntap, J(q)))
        e0 = await pg.evaluate(BTN_JS)
        info('e 結束後（非 ADV）#advTop：%s' % J(e0))
        await pg.screenshot(path=os.path.join(OUT, '04_end.png'))
        rec['errors'] = errs
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'advskip.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
