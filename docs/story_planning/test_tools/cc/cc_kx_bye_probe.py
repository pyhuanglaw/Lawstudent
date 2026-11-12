"""CC-B（帳號 B）11-07：KX-MOVIE-BYE 試玩重跑（BB-B 17:02；LAWWW-B 7dae7d07a，含在 e647887c7；台詞 AA_708 e0e92919e 的 day）。
可昕一起活動的場次在 18:00 以前開始＝換 day 那幾句；晚上照舊（末班車）。預期句子直接讀遊戲裡的 ACTIVITY_SCENES（＝匯入的 AA_708），一字對照。
CASES（分號／加號分隔）：「地點,開始時,第幾場,名字」，預設：
  xs_nanyang,14,1,movie1_day     電影第 1 場下午：散場＝day.bye（「出來天還這麼亮。」「我搭下一班就好，不用趕。」）
  xs_nanyang,19.5,1,movie1_night 電影第 1 場晚上：散場＝bye（「末班車還有。好險。」）
  xs_nanyang,14,3,movie3_day     電影第 3 場下午：day.bye（「出來天還亮著。」「……我還不想回外校。」）
  cafe,14,3,cafe3_day            咖啡第 3 場下午：坐下＝day.seat（「我今天不趕車。」）
  bookstore,14,3,book3_day       書店第 3 場下午：day.bye（「時間還早。我們再看一本。」）
每一筆：【前置／捷徑】讀檔進那個地點（2025-10-18 週六、開始前 12 分鐘，條件事件關閉）→【捷徑】G.flags.ACTN[種類].kexin 撥到「下一場＝第 N 場」（N=1 就是沒約過）→
  【前置】INV.accept(G,'kexin',地點,今天,開始時)（手機約好那一步用的同一個函式）→ 遊戲照常跑：可昕到、見面、坐下、演完、散場；點對話、選項選第一個；記每一句（誰、句子）。
判定＝BB。用法：LW_TESTS=<wt>/tests [CASES=...] python3 cc_kx_bye_probe.py <url> <out>"""
import os, sys, json, asyncio, time, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('kx_bye', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
CASES = [x.split(',') for x in re.split(r'[;+]', os.environ.get('CASES') or 'xs_nanyang,14,1,movie1_day+xs_nanyang,19.5,1,movie1_night+xs_nanyang,14,3,movie3_day+cafe,14,3,cafe3_day+bookstore,14,3,book3_day') if x.strip()]
KIND = {'xs_nanyang': 'movie', 'cafe': 'cafe', 'bookstore': 'bookstore'}
JOBZONE = {'bookstore': 'books'}   # 舊路書房的打工＝頁間書屋這一區（jobs3d.js ZONE_KEY）

IV = r"""(id=>{ const iv=(GAME.G.invites||[]).find(q=>q.id===id); return iv?{state:iv.state, opened:!!iv.opened, h:iv.h}:null; })"""


async def run_scene(pg, cdp, tag, iv_id, max_s=420):
    lines = []; t0 = time.time(); last = time.time(); n_choice = 0
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.innerText.trim())")
            R.note('%s 選項 %s → 點第一個' % (tag, J(bs))); n_choice += 1
            c = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1000); last = time.time(); continue
        if s['dlg']:
            for _w in range(40):   # 對話框打字效果：等這一句打完（#dlgNext 變成 visible，game3d.js dlgTick）才記、才點；最多 10 秒
                if await pg.evaluate("(()=>{ const n=document.getElementById('dlgNext'); return !n||n.style.visibility!=='hidden'; })()"): break
                await pg.wait_for_timeout(250)
            who = await pg.evaluate("(()=>{ const e=document.getElementById('dlgName'); return e?e.innerText.trim():''; })()")
            t = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText'); return e?e.innerText.trim():''; })()") or s['dtext']
            if t:
                if lines and lines[-1][0] == who and t.startswith(lines[-1][1]): lines[-1] = [who, t]
                elif not lines or lines[-1] != [who, t]: lines.append([who, t])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); last = time.time(); continue
        iv = await pg.evaluate(IV, iv_id)
        if iv and iv['state'] in ('done', 'missed'):
            await pg.wait_for_timeout(2500)
            s2 = await L.state(pg)
            if not s2['dlg'] and not s2['choices']: break
        if time.time() - last > 90:
            R.note('%s 90 秒沒有對話、選項（約的狀態 %s）' % (tag, J(iv))); break
        await pg.wait_for_timeout(700)
    return lines


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC KX-MOVIE-BYE（可昕白天場次的句子）：SHA=%s（worktree 實際 %s）；Playwright 手機模擬 ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real, 'cases': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if not R.check('遊戲載入', ok, ''): await b.close(); return
        await pg.evaluate("localStorage.clear()")
        for place, h, k, nm in CASES:
            h = float(h); k = int(k); kind = KIND[place]; tag = '[%s]' % nm
            try:
                sc = await pg.evaluate("(a=>{ const T=ACTIVITY_SCENES.kinds[a.kind].people.kexin.scenes[String(a.k)]; return T||null; })", {'kind': kind, 'k': k})
                if not R.check('%s 稿裡有可昕 %s 第 %d 場' % (tag, kind, k), bool(sc), ''): continue
                day_ = h < 18
                exp_bye = (sc.get('day') or {}).get('bye') if day_ and (sc.get('day') or {}).get('bye') else sc.get('bye')
                exp_seat = (sc.get('day') or {}).get('seat') if day_ and (sc.get('day') or {}).get('seat') else sc.get('seat')
                night_bye = sc.get('bye'); night_seat = sc.get('seat')
                chain = os.environ.get('CHAIN') == '1' and bool(rec['cases'])
                if chain:   # BB-B 18:29：同一份存檔連著約第二場（不重新讀檔）
                    R.setup('%s 【捷徑】同一份存檔接著：時間撥到 %.2f、GAME.enter(%s)（不讀檔）' % (tag, h - 0.2, place))
                    await pg.evaluate("(a=>{ GAME.G.hour=a.h; return GAME.enter(a.z); })", {'h': h - 0.2, 'z': place})
                    await D.wait_zone(pg, cdp, place, max_s=40); await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
                    s = await D.st(pg)
                elif place in JOBZONE:   # BB-B 18:35：自己打工的店、上班時間走進去會自動開班（jobs3d.js:411），時鐘跳到下班——先在公館讀檔、看有沒有那份工，有就拿掉（不要把時鐘撥回來）
                    jk = JOBZONE[place]
                    R.setup('%s 【前置／捷徑】讀檔進公館 %s %.2f（條件事件關閉；先不進店）' % (tag, DAY, h - 0.2))
                    await D.load_zone(pg, cdp, 'gongguan', DAY, h - 0.2, wait=5000)
                    jb = await pg.evaluate("(k=>({job:JOBS.job(GAME.G,k), shiftNow:JOBS.shiftNow(GAME.G,k), hrs:JOBS.hrs(k,GAME.G.day), hour:GAME.G.hour}))", jk)
                    R.note('%s 進店前：JOBS.job(G,%s)＝%s；shiftNow＝%s；hrs＝%s；時鐘 %.2f' % (tag, jk, J(jb['job']), jb['shiftNow'], J(jb['hrs']), jb['hour']))
                    if jb['job']:
                        R.setup('%s 【捷徑】存檔有 %s 的班：拿掉（delete G.jobs.%s）——這一項測的是約會，不是打工' % (tag, jk, jk))
                        await pg.evaluate("(k=>{ delete JOBS.rec(GAME.G)[k]; })", jk)
                    lines0 = []
                    await pg.evaluate("(z=>GAME.enter(z))", place); await D.wait_zone(pg, cdp, place, max_s=40)
                    t1 = time.time()
                    while time.time() - t1 < 12:
                        st0 = await L.state(pg)
                        if st0['dlg']:
                            t_ = await pg.evaluate("(()=>{ const e=document.getElementById('dlgText'); return e?e.innerText.trim():''; })()"); lines0.append(t_); await L.tap(pg, cdp, '#dlg')
                        await pg.wait_for_timeout(700)
                    toast = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e?e.innerText.trim():''; })()")
                    hr = await pg.evaluate("GAME.G.hour")
                    R.note('%s 進店後 12 秒：時鐘 %.2f；對話 %s；toast %s' % (tag, hr, J(lines0), J(toast)))
                    R.check('%s 進店時鐘沒有跳（%.2f → %.2f）' % (tag, jb['hour'], hr), abs(hr - jb['hour']) < 0.3, J({'job': jb['job'], 'lines': lines0}))
                    s = await D.st(pg)
                else:
                    R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f（開始前 12 分鐘；條件事件關閉）' % (tag, place, DAY, h - 0.2))
                    s = await D.load_zone(pg, cdp, place, DAY, h - 0.2, wait=6000)
                flags0 = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G.flags||{}))")
                beats0 = (flags0.get('BEATS') or {}).get('kexin')
                R.note('%s 開始前 G.flags.BEATS.kexin＝%s（day %s）' % (tag, J(beats0), await pg.evaluate("GAME.G.day")))
                if not R.check('%s 進得了 %s' % (tag, place), s['zone'] == place, J(s)): continue
                R.setup('%s 【捷徑】G.flags.ACTN.%s.kexin＝下一場第 %d 場（n=%d）' % (tag, kind, k, k - 1))
                need = int(sc.get('need') or 1)
                if need > 1:
                    R.setup('%s 【捷徑】第 %d 場要第 %d 階：SOCIAL.rel(kexin) fam/trust/comf 撥到 ≥ 那一階（DATE.stageNum）' % (tag, k, need))
                    await pg.evaluate("(n=>{ const r=SOCIAL.rel('kexin'); const T={2:[20,0,0],3:[40,25,0],4:[60,45,40]}[Math.min(4,n)]||[0,0,0]; r.fam=Math.max(+r.fam||0,T[0]); r.trust=Math.max(+r.trust||0,T[1]); r.comf=Math.max(+r.comf||0,T[2]); return DATE.stageNum('kexin'); })", need)
                    R.note('%s 階段：DATE.stageNum(kexin)＝%s' % (tag, await pg.evaluate("DATE.stageNum('kexin')")))
                iv = await pg.evaluate("(a=>{ const G=GAME.G, F=G.flags||(G.flags={}); const A=F.ACTN||(F.ACTN={}); (A[a.kind]||(A[a.kind]={})).kexin={n:a.k-1,k:a.k,last:null,rot:-1};"
                                       " const iv=INV.accept(G,'kexin',a.place,G.day,a.h); return iv&&iv.id?iv.id:((G.invites||[]).slice(-1)[0]||{}).id; })", {'kind': kind, 'k': k, 'place': place, 'h': h})
                R.setup('%s 【前置】INV.accept(G,\'kexin\',\'%s\',今天,%.2f)（手機約好那一步的函式）→ id %s' % (tag, place, h, iv))
                lines = await run_scene(pg, cdp, tag, iv)
                kx = [t for w, t in lines if '可昕' in (w or '')]
                beats1 = await pg.evaluate("((GAME.G.flags||{}).BEATS||{}).kexin||null")
                beat_line = '你昨天十一點以後就沒回我。' in kx
                R.note('%s 結束後 G.flags.BEATS.kexin＝%s；這一場有沒有演「你昨天十一點以後就沒回我。」：%s' % (tag, J(beats1), beat_line))
                if os.environ.get('CHAIN') == '1' and rec['cases']:
                    prev = rec['cases'][-1]
                    R.check('%s 同一份存檔第二場：第 1 拍不再演（「你昨天十一點以後就沒回我。」不出現）' % tag, not beat_line, J({'beats_before': beats0, 'beats_after': beats1}))
                    if beat_line:
                        diff = {k: [prev.get('flags0', {}).get(k), flags0.get(k)] for k in set(list(prev.get('flags0', {}).keys()) + list(flags0.keys())) if prev.get('flags0', {}).get(k) != flags0.get(k)}
                        R.note('%s 第一場開始 → 第二場開始 flags 差異：%s' % (tag, J(diff)))
                R.note('%s 全部對話 %d 句：%s' % (tag, len(lines), J(lines)))
                ivs = await pg.evaluate(IV, iv)
                await R.shot(pg, 'kx_' + nm)
                R.check('%s 約的狀態走完（done）' % tag, bool(ivs) and ivs['state'] == 'done', J(ivs))
                if kind == 'cafe':
                    R.check('%s 坐下那幾句＝%s（%s）' % (tag, '白天 day.seat' if day_ else 'seat', J(exp_seat)), all(x in kx for x in exp_seat), J(kx))
                    if day_ and exp_seat != night_seat: R.check('%s 白天不說晚上那幾句（%s）' % (tag, J(night_seat)), not any(x in kx for x in night_seat if x not in exp_seat), J(kx))
                else:
                    R.check('%s 散場那幾句＝%s（%s）' % (tag, '白天 day.bye' if day_ else 'bye', J(exp_bye)), all(x in kx for x in exp_bye), J(kx))
                    if day_ and exp_bye != night_bye: R.check('%s 白天不說晚上那幾句（%s）' % (tag, J(night_bye)), not any(x in kx for x in night_bye if x not in exp_bye), J(kx))
                rec['cases'].append({'name': nm, 'place': place, 'h': h, 'k': k, 'lines': lines, 'iv': ivs, 'expBye': exp_bye, 'expSeat': exp_seat, 'flags0': flags0, 'beats0': beats0, 'beats1': beats1, 'beatLine': beat_line})
            except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'kx_bye.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
