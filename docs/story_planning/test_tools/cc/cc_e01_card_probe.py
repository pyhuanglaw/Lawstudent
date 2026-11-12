"""CC-B（帳號 B）11-08：BUG-Y0-E01-UNDER-CARD-1108 驗收（LAWWW-B 5292ead4d：newGameEcon fade → enter('dorm') 加 y0Gate，進房間才開 E01）。判定＝BB。
照 tests/flow_v0_start.py 的開法：標題「新遊戲」（舊序章系所開局）→ 點對話、選第一個 → E01 → 9/2 早上舊序章同學那一句。RUNS 次（預設 3），每次重開瀏覽器。
讀遊戲前就包 GAME.say：每一句出來的「那一刻」同步記 #fade 有沒有 on、#title3 opacity、G.zone、E.zone id、手機開著沒；E01 第一句另外截圖。
字卡那段（第一句以前）每 200 ms 看手機有沒有自己跳出來。fade_block＝對話框開著、#fade 不透明且擋點擊，連續 3 次（同 flow_v0_to1017）。
用法：LW_TESTS=<wt>/tests [RUNS=3] python3 cc_e01_card_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
RUNS = int(os.environ.get('RUNS') or 3)
R = L.Run('e01_card', OUT); D.setup(R, OUT)
FIRST = '開學前一天，晚上九點。男生宿舍四樓，四一二。'
HOOK = r"""(()=>{ if(window.__ccE01) return; window.__ccE01=1; window.__said=[]; window.__phoneSeen=[];
  const snap=()=>{ const f=document.getElementById('fade'), t=document.getElementById('title3'), ph=document.getElementById('phone'); let zid=null; try{ const z=GAME.E&&GAME.E.zone; zid=z?(z.id||(z.def&&z.def.id)||null):null; }catch(e){}
    return {fadeOn:!!(f&&f.classList.contains('on')), fadeOp:f?+getComputedStyle(f).opacity:null, fadePE:f?getComputedStyle(f).pointerEvents:null, t3:t?+getComputedStyle(t).opacity:null, t3txt:t?(t.innerText||'').trim().slice(0,30):null,
      gz:GAME.G?GAME.G.zone:null, ez:zid, phone:!!(ph&&!ph.classList.contains('hide')), h:GAME.G?+(+GAME.G.hour).toFixed(2):null, ms:Math.round(performance.now())}; };
  window.__ccSnap=snap;
  const wrap=()=>{ if(typeof GAME==='undefined'||!GAME.say||GAME.say.__cc) return false; const o=GAME.say; const w=function(who,t){ try{ const e=Object.assign({who:who?(typeof who==='string'?who:(who.name||'')):'', t:String(t||'')},snap()), L=window.__said, p=L[L.length-1]; if(!(p&&p.t===e.t&&Math.abs(p.ms-e.ms)<5)){ L.push(e); setTimeout(()=>{ try{ const f=document.getElementById('fade'); e.fadeOp500=f?+getComputedStyle(f).opacity:null; e.fadeOn500=!!(f&&f.classList.contains('on')); }catch(_){} },500); } }catch(e){}   /* BB-B 05:45：第一句後 500 ms 的 fade opacity（0＝淡出完成）*/   /* 遊戲之後又包了一層 GAME.say（例 LIBQ）時這裡會包兩層：同一句同一刻只記一次 */ return o.apply(this,arguments); }; w.__cc=1; GAME.say=w; return true; };
  const iv=setInterval(()=>{ wrap(); try{ const ph=document.getElementById('phone'); if(ph&&!ph.classList.contains('hide')&&typeof GAME!=='undefined'&&GAME.G&&GAME.G.flags&&!GAME.G.flags.E01_DONE&&!(window.__said||[]).some(x=>x.t.indexOf('開學前一天')===0)) window.__phoneSeen.push(snap()); }catch(e){} }, 50); })()"""


async def one(p, k, rec):
    tag = '[第 %d 次]' % k
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.add_init_script(HOOK)
        await pg.goto(URL)
        if not R.check('%s 遊戲載入' % tag, await L.wait_loaded(pg), ''): return
        await pg.evaluate("localStorage.clear()"); await pg.evaluate(HOOK)
        await L.tap(pg, cdp, '#btnNew')
        t0 = time.time(); shot1 = False; fade_run = 0; fade_block = 0; log = []
        while time.time() - t0 < 900:
            said = await pg.evaluate("window.__said||[]")
            if not shot1 and any(x['t'] == FIRST for x in said): shot1 = True; await R.shot(pg, 'e01_first_%d' % k)
            done = await pg.evaluate("(()=>{ try{ const G=GAME.G; return !!(G&&G.flags&&G.flags.E01_MORNING)&&!GAME.D.active&&!GAME.E.player.busy&&!document.querySelector('#choices button'); }catch(e){ return false; } })()")
            if done: break
            s = await L.state(pg)
            if s['choices']:
                c = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })()")
                if c: log.append('▶' + c[2]); await L.touch_tap(cdp, c[0], c[1])
            elif s['dlg']:
                if await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!f&&getComputedStyle(f).opacity>0.5&&getComputedStyle(f).pointerEvents!=='none'; })()"):
                    fade_run += 1
                    if fade_run == 3: fade_block += 1; R.note('%s 黑幕蓋住對話（連續 3 次點不到）：%s' % (tag, s['dtext'][:40])); await R.shot(pg, 'fade_block_%d_%d' % (k, fade_block))
                else: fade_run = 0
                await L.tap(pg, cdp, '#dlg')
            elif s.get('paused') and await L.phone_away(pg, cdp): log.append('［手機收起來］')
            else:
                if await pg.evaluate("(()=>{ try{ return GAME.G.zone==='dorm'&&!!GAME.G.flags.E01_DONE&&!GAME.D.active&&!GAME.E.player.busy; }catch(e){ return false; } })()"):   # 選了「再拆一箱」停在 9/1 晚上：走到床邊睡
                    bed = await L.find_it(pg, '睡覺')
                    if bed and await L.go_to(pg, cdp, R, bed['x'], bed['z'], bed['r'] * 0.8, '%s 床' % tag): await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); log.append('［走到床邊睡覺］')
            await pg.wait_for_timeout(500)
        said = await pg.evaluate("window.__said||[]"); ph = await pg.evaluate("window.__phoneSeen||[]")
        st = await pg.evaluate("(()=>{ const G=GAME.G; return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone, morning:!!G.flags.E01_MORNING, done:!!G.flags.E01_DONE, fb:GAME.walkFallbacks||0}; })()")
        first = [x for x in said if x['t'] == FIRST]
        i0 = said.index(first[0]) if first else -1
        e01 = said[i0:i0 + 4] if i0 >= 0 else []
        R.note('%s E01 第一句那一刻：%s' % (tag, J(first[:2])))
        R.note('%s E01 前四句：%s' % (tag, J([[x['who'], x['t'], x['fadeOn'], x['t3'], x['ez']] for x in e01])))
        R.note('%s 第一句以前說過的：%s' % (tag, J([[x['who'], x['t'][:30], x['fadeOn'], x['t3']] for x in said[:max(0, i0)]])))
        R.note('%s 字卡那段手機自己跳出來：%d 次 %s；結束 %s；選項 %s' % (tag, len(ph), J(ph[:3]), J(st), J([x for x in log if x.startswith('▶')])))
        x = first[0] if first else {}
        R.check('%s 第一句出來時 #fade 沒有 on、字卡 opacity 0、在 dorm' % tag, bool(first) and not x['fadeOn'] and (x['t3'] in (0, None)) and x['gz'] == 'dorm', J(x))
        R.check('%s 第一句後 500 ms #fade opacity 0（淡出完成）' % tag, bool(first) and first[0].get('fadeOp500') == 0, J({k: x.get(k) for k in ('fadeOp', 'fadeOp500', 'fadeOn500')}))
        R.check('%s 第一句只出現一次（沒有重演）' % tag, len(first) == 1, str(len(first)))
        R.check('%s fade_block＝0' % tag, fade_block == 0, str(fade_block))
        R.check('%s 睡到 9/2、舊序章同學那一句（E01_MORNING）' % tag, st['morning'] and st['key'] >= '2024-09-02', J(st))
        R.check('%s 字卡那段手機沒有自己跳出來' % tag, not ph, J(ph[:2]))
        R.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3]))
        rec.append({'k': k, 'said': said[:60], 'phone': ph[:5], 'end': st, 'fade_block': fade_block, 'log': log})
    except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
    finally: await b.close()


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC E01 字卡驗收：worktree %s；RUNS=%d；Playwright ≠ iPhone' % (real or '?', RUNS), flush=True)
    rec = []
    async with async_playwright() as p:
        for k in range(1, RUNS + 1): await one(p, k, rec)
    json.dump(rec, open(os.path.join(OUT, 'e01_card.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
