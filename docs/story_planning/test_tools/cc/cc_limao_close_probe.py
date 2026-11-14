"""CC-B 11-14：LIMAO_CLOSE（BB-B 13:35 ③「23.75 那輪」，排在這批後面，dev 最新）。禮貌生財打烊前後三件事，只記、判定歸 BB。Windows＋GPU ≠ iPhone。
  ① 打烊後從街上進不進得去：【前置／捷徑】讀檔到 tingzhou CLOSE_H（預設 23.75），站在店門外 (27.3, 1.2)；照玩家走到門口（tingzhou_layout.js limao.door (27.3,4.75)）、按互動鍵，
     收 2.5 秒內的提示（toast、對話）、按完以後在哪一區——應該留在 tingzhou、提示寫營業時間（game3d.js PLACES.closedText）。
  ② 打烊時上師收攤：同一份讀檔，LM.masterNpc 看不看得到（hidden／visible）、LM.canTalk；桌前互動點的字（應該是「看算命桌」）；用遊戲的跟隨鏡頭在騎樓對著算命桌拍一張（不藏人）。
  ③ 營業中進店待到打烊以後：【前置／捷徑】讀檔進 tz_limao STAY_H（預設 23.35）、站在出生點，照遊戲時間走（不快轉、不改時間），每 3 秒記一次 區域、位置、站不站得住、提示，
     到遊戲時間過 23.5＋0.15 或真實 STAY_MAX 秒；被請出去＝區域變成 tingzhou，記落點、站不站得住、那時的提示。
CC_02 清單 2026-11-14：1✓（時間：營業 19:00～23:30 照 places.js／shop_hours_aa831.js；CLOSE_H 23.75、STAY_H 23.35） 2✓（門、桌、上師座位從 tingzhou_layout.js limao 讀，互動字從遊戲讀） 3n/a（不選座位、不選選單） 4n/a（不買東西） 5✓（【前置／捷徑】讀檔放位置；走到門口照玩家點地面） 6✓（讀檔等 8 秒＋等 ASSETS） 7✓（lint；JS 在 node --check 驗過） 8✓（只記不判，判定歸 BB） 9✓（每段截圖） 10✓（讀檔關事件） 11✓（SHA 40 碼、ENV 沒有「;」「|」） 12✓（FAIL_SETUP：讀檔以後在對的區域、時間對、找得到門／桌的互動點） 13✓（走到門口記點地面次數）
用法：LW_TESTS=<wt>/tests SHA=<sha> [CLOSE_H=23.75] [STAY_H=23.35] [STAY_MAX=240] [DAY=2025-10-22] python3 cc_limao_close_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
DAY = os.environ.get('DAY') or '2025-10-22'
CLOSE_H = float(os.environ.get('CLOSE_H') or 23.75)
STAY_H = float(os.environ.get('STAY_H') or 23.35)
STAY_MAX = float(os.environ.get('STAY_MAX') or 240)
R = L.Run('limao_close', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)

MSGHOOK = r"""(()=>{ window.__ccMsg=[]; if(!window.__ccMsgW){ window.__ccMsgW=true; const t0=GAME.toast; if(t0) GAME.toast=function(t){ try{ window.__ccMsg.push({k:'toast',t:String(t)}); }catch(e){} return t0.apply(this,arguments); };
  const s0=GAME.say; if(s0) GAME.say=function(w,t){ try{ window.__ccMsg.push({k:'say',w:w&&(w.name||String(w)),t:String(t)}); }catch(e){} return s0.apply(this,arguments); }; } return true; })()"""
STATE = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E.player.obj.position, f=v=>+(+v).toFixed(2); const lab=i=>String(typeof i.label==='function'?i.label():i.label||'');
  const tb=(E.interactables||[]).filter(i=>!i.hidden&&/算命/.test(lab(i))).map(i=>({label:lab(i),x:f(i.x),z:f(i.z)}));
  const dr=(E.interactables||[]).filter(i=>!i.hidden&&/禮貌生財/.test(lab(i))).map(i=>({label:lab(i),x:f(i.x),z:f(i.z),to:i.exit&&i.exit.to||null}));
  let m=null; try{ const n=LM.masterNpc; m=n&&n.obj?{hidden:!!n.hidden, visible:n.obj.visible!==false, inZone:!!(E.npcs&&E.npcs.includes(n)), x:f(n.obj.position.x), z:f(n.obj.position.z)}:null; }catch(e){ m='ERR '+e.message; }
  let ct=null; try{ ct=LM.canTalk(G,E.zone); }catch(e){ ct='ERR '+e.message; }
  let open=null; try{ open=PLACES.isOpen('tz_limao',G.hour,G.day); }catch(e){}
  return {zone:G.zone, h:f(G.hour), x:f(P.x), z:f(P.z), stand:E.canStand(P.x,P.z,0.3), interact:((document.getElementById('interact')&&!document.getElementById('interact').classList.contains('hide'))?(document.getElementById('interactLabel')||{}).textContent:'')||'',
    open, canTalk:ct, master:m, table:tb, door:dr, msgs:(window.__ccMsg||[]).slice(-6)}; })()"""


async def main():
    print('CC LIMAO_CLOSE：SHA %s；%s；CLOSE_H %s；STAY_H %s；Windows＋GPU ≠ iPhone' % (SHA or '?', DAY, CLOSE_H, STAY_H), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        # ① ②
        s = await D.load_zone(pg, cdp, 'tingzhou', DAY, CLOSE_H, x=27.3, z=1.2, yaw=0.0, wait=8000)
        R.setup('【前置／捷徑】讀檔到 tingzhou %s %.2f 時、站在禮貌生財門外 (27.3, 1.2)' % (DAY, CLOSE_H))
        await D.wait_assets(pg, 20.0, 1500); await pg.evaluate(MSGHOOK)
        s0 = await pg.evaluate(STATE); res['closed0'] = s0
        if R.check('FAIL_SETUP 檢查：在 tingzhou、%.2f 時、這時候 PLACES 說沒開、找得到禮貌生財的門' % CLOSE_H, s0['zone'] == 'tingzhou' and s0['open'] is False and bool(s0['door']), J(s0)):
            R.note('② 打烊時：上師 %s；canTalk %s；桌前互動 %s' % (J(s0['master']), s0['canTalk'], J(s0['table'])))
            R.check('② 打烊時上師收攤（看不到）', isinstance(s0['master'], dict) and (s0['master']['hidden'] or not s0['master']['visible']) or s0['master'] is None, J(s0['master']))
            R.check('② 打烊時桌前的字是「看算命桌」（不是「算命桌」能聊天）', any(t['label'].startswith('看') for t in s0['table']) and not s0['canTalk'], J([s0['table'], s0['canTalk']]))
            # 跟隨鏡頭：站騎樓、背對街、看算命桌
            await pg.evaluate("(()=>{ const P=GAME.E.player.obj; P.position.set(27.0,P.position.y,2.2); P.rotation.y=Math.atan2(28.9-27.0,4.3-2.2); const C=GAME.E.cam; C.yaw=Math.atan2(27.0-28.9,2.2-4.3); C.manualT=30; })()")
            await pg.wait_for_timeout(2500); await D.shot(pg, 'closed_table_follow', judge_black=False)
            dr = s0['door'][0]
            await L.go_to(pg, cdp, R, dr['x'], dr['z'] - 0.6, 0.6, '① 走到禮貌生財門口', max_s=60, stop=lambda q: '禮貌生財' in (q.get('interact') or ''))
            q = await D.st(pg); R.note('① 門口互動鍵：%s' % q.get('interact'))
            await pg.evaluate("window.__ccMsg=[]")
            seen_ = []
            if '禮貌生財' in (q.get('interact') or ''):
                await L.tap(pg, cdp, '#interact')
                for _ in range(10):   # 按了以後 2.5 秒內畫面上出現的字（對話框、字幕、提示）：GAME.say／toast 之外的也收（「看…」是旁白）
                    await pg.wait_for_timeout(250)
                    t_ = await pg.evaluate("(()=>{ const g=id=>{ const e=document.getElementById(id); return e&&e.offsetParent!==null?(e.textContent||'').trim():''; }; return [g('dlgText'),g('caption'),g('toast')].filter(Boolean); })()")
                    for x_ in t_:
                        if x_ not in seen_: seen_.append(x_)
            await D.shot(pg, 'closed_door_after', judge_black=False)
            s1 = await pg.evaluate(STATE); s1['screen'] = seen_; res['closed1'] = s1
            for _ in range(6):
                if not (await D.st(pg)).get('dlg'): break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600)
            R.note('① 按了門以後：%s' % J(s1))
            R.check('① 打烊後進不去（還在 tingzhou）', s1['zone'] == 'tingzhou', s1['zone'])
            txt = ' '.join([m_['t'] for m_ in s1['msgs']] + s1['screen'])
            R.note('① 門口的鍵是「%s」（「看…」＝打烊了只能看）；按了以後畫面上的字：%s' % (q.get('interact'), J(s1['screen'])))
            R.check('① 有提示，寫了營業時間（19:00／23:30 或「營業」字樣）', bool(txt) and ('19' in txt or '營業' in txt or '23:30' in txt), txt[:200])
        # ③
        s = await D.load_zone(pg, cdp, 'tz_limao', DAY, STAY_H, wait=8000)
        R.setup('【前置／捷徑】讀檔進 tz_limao %s %.2f 時（區域出生點），之後照遊戲時間走、不快轉' % (DAY, STAY_H))
        await pg.evaluate(MSGHOOK); await D.wait_assets(pg, 20.0, 1000)
        a0 = await pg.evaluate(STATE); res['stay0'] = a0
        if R.check('FAIL_SETUP 檢查：讀檔以後在 tz_limao、%.2f 時、店開著' % STAY_H, a0['zone'] == 'tz_limao' and a0['open'] is True, J(a0)):
            trace = []; t0 = time.time(); out_at = None
            while time.time() - t0 < STAY_MAX:
                a = await pg.evaluate(STATE); trace.append({k: a[k] for k in ('zone', 'h', 'x', 'z', 'stand', 'interact')})
                if a['zone'] != 'tz_limao' and out_at is None:
                    out_at = a; await pg.wait_for_timeout(1500); await D.shot(pg, 'stay_kicked_out', judge_black=False)
                if (await D.st(pg)).get('dlg'): await L.tap(pg, cdp, '#dlg')
                if a['h'] >= 23.65 or (out_at and time.time() - t0 > 10): break
                await pg.wait_for_timeout(3000)
            a9 = await pg.evaluate(STATE); res['stay'] = {'trace': trace, 'out': out_at, 'end': a9}
            R.note('③ 待在店裡：%d 筆，開始 %.2f 時、結束 %.2f 時；%s' % (len(trace), a0['h'], a9['h'], J(trace[-4:])))
            R.note('③ 提示：%s' % J(a9['msgs']))
            if a9['h'] < 23.52 and not out_at:
                R.check('FAIL_SETUP 檢查：③ 遊戲時間走過 23:30（%.2f）' % a9['h'], False, '真實 %d 秒內遊戲時間沒走到打烊——加大 STAY_MAX 或 STAY_H 往後' % STAY_MAX)
            elif out_at:
                R.check('③ 被請出去：落點站得住', bool(out_at['stand']), J(out_at))
                R.note('③ 被請出去的時間 %.2f、區域 %s、位置 (%.2f, %.2f)' % (out_at['h'], out_at['zone'], out_at['x'], out_at['z']))
            else:
                R.note('③ 過了打烊（%.2f）還在店裡、沒被請出去——交 BB 判（規格是要請出去還是可以待著）' % a9['h'])
                await D.shot(pg, 'stay_after_close', judge_black=False)
        open(os.path.join(OUT, 'limao_close.json'), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
