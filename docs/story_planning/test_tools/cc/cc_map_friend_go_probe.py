"""CC（帳號 A）11-03：MAP-FRIEND-GO-1103 第二步（LAWWW f157d0ff6；使用者 23:0x「不需要再有帶我去這個功能不管是手機裡的還是地圖上的都不需要我要直接過去」
  「沒辦法客觀上讓我真的能走路到達的就不要有直接過去也不需要有帶我去」）。BB 23:0x 的驗收條件：
  ① 手機「朋友」頁、大地圖 👥 頁都沒有「帶我去」
  ② 走得到的人（GAME.friendGoInfo 有值、沒有 why）每一行都有「直接過去」
  ③ 同一區的人：按「直接過去」→ 轉場以後站在他旁邊（≈1.1 m，≤ 2 m），遊戲時間照距離加（d/1.3 m/s，至少 1 分鐘，±1 分鐘）
  ④ 別區的人：按「直接過去」→ 快速前往以後站在他旁邊（≤ 2 m），遊戲時間有加（> 0）
  ⑤ 走不到的人（國外、老家、舊序章離校退宿…：whereIs.away 或 friendGoInfo.why）：沒有「直接過去」按鈕、也不顯示「不能直接過去：…」的原因——至少驗一個
  【前置／捷徑】讀檔到校園（認識開場的人；條件事件關閉），試幾個時段找到「同一區有人」「別區有人」；⑤ 另外讀檔到寒假（2026-01-28）找回老家的人。
  怎麼按：大地圖＝點右上角小地圖（#minimap）→ 👥（#bmWho）→ 那一行的「直接過去」；手機＝#btnPhone →「朋友」→「直接過去」。
  截圖：M_people、P_friends、到了以後各一張（同區、別區）、寒假的手機朋友頁。修正前（bf6dbda44）① 應該 FAIL（還有「帶我去」）。
用法：LW_TESTS=<wt>/tests [CASES=M,P,U] python3 cc_map_friend_go_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'M,P,U').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
SLOTS = [(8, 4, 14.0), (8, 4, 17.5), (9, 5, 12.3), (10, 6, 15.0), (7, 3, 19.0), (11, 0, 16.0), (14, 3, 10.5), (16, 5, 13.0)]
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


# 每個人：能不能直接過去、同一區嗎、走不到的原因
WHO = """(()=>{ const G=GAME.G, out=[]; for(const id of Object.keys(CHARACTERS||{})){ let w=null; try{ w=STORY.whereIs&&STORY.whereIs(GAME,id); }catch(e){}
  let g=null; try{ g=GAME.friendGoInfo&&GAME.friendGoInfo(id); }catch(e){} const nm=(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((CHARACTERS[id]||{}).name||id);
  const met=!!(G.flags&&G.flags['met_'+id])||(typeof SOCIAL!=='undefined'&&SOCIAL.known&&SOCIAL.known(id))||(!!(CHARACTERS[id]||{}).name&&nm===(CHARACTERS[id]||{}).name);   /* 認識＝顯示的是他的名字（不是「不認識的女生」這類描述）；MAP_fix2 第一次 PC：met_ 旗標判斷不到沈以安、阿哲 */
  if(!w&&!g) continue; out.push({id, nm, met:!!met, zone:w&&w.zone||null, away:w&&w.away||null, here:!!(w&&w.zone===G.zone&&!w.away), npc:!!(GAME.npc&&GAME.npc[id]), go:g?(g.why?'why:'+g.why:(g.here?'here':'mins:'+g.mins)):null}); }
  return {zone:G.zone, hour:G.hour, people:out}; })()"""
SCAN = """(()=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}, out=[];
  const ids=Object.keys(CHARACTERS||{}).filter(id=>(G.flags&&G.flags['met_'+id])||(typeof SOCIAL!=='undefined'&&SOCIAL.known&&SOCIAL.known(id))||((CHARACTERS[id]||{}).name&&typeof SOCIAL!=='undefined'&&SOCIAL.displayName&&SOCIAL.displayName(id)===CHARACTERS[id].name));
  try{ for(let d=4; d<=60 && out.length<12; d++){ const c=CALENDAR.dateOf(d); if(!c) continue; const wd=c.wd%7;
      for(const hr of [9.5,11,12.5,14,15.5,17,18.5,20]){ G.day=d; G.hour=hr; G.weekday=wd; let n=0, zs=[];
        for(const id of ids){ let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){} if(w&&w.zone&&!w.away){ n++; zs.push(id+'@'+w.zone); } }
        if(n) out.push([d,wd,hr,n,zs.slice(0,6)]); } } }
  finally{ G.day=keep.day; G.hour=keep.hour; G.weekday=keep.weekday; }
  return {ids, out}; })()"""
ROWS_MAP = """(()=>{ const el=document.getElementById('bmPeople'); if(!el) return null; return {html:el.innerText, rows:[...el.querySelectorAll('.row2')].map(r=>({text:(r.innerText||'').trim().slice(0,90), fgo:r.querySelector('[data-fgo]')?r.querySelector('[data-fgo]').dataset.fgo:null, btns:[...r.querySelectorAll('button')].map(b=>(b.textContent||'').trim())}))}; })()"""
ROWS_PHONE = """(()=>{ const el=document.getElementById('phoneBody'); if(!el) return null; return {html:el.innerText, rows:[...el.querySelectorAll('.phrow')].map(r=>({text:(r.innerText||'').trim().slice(0,90), id:(r.querySelector('[data-person]')||{dataset:{}}).dataset.person||null, fgo:r.querySelector('[data-fgo]')?r.querySelector('[data-fgo]').dataset.fgo:null, btns:[...r.querySelectorAll('button')].map(b=>(b.textContent||'').trim())}))}; })()"""
NEAR = """(id=>{ const G=GAME.G, E=GAME.E, p=E.player.obj.position, n=GAME.npc&&GAME.npc[id], np=n&&n.obj?n.obj.position:null;
  return {zone:G.zone, hour:+(+G.hour).toFixed(4), day:G.day, x:+p.x.toFixed(2), z:+p.z.toFixed(2), d:np?+Math.hypot(np.x-p.x,np.z-p.z).toFixed(2):null, busy:!!E.player.busy, map:!document.getElementById('bigmap').classList.contains('hide'), phone:!!(document.getElementById('phone')&&!document.getElementById('phone').classList.contains('hide'))}; })(%s)"""


async def load(pg, cdp, st, why):
    print('  [前置／捷徑] 讀檔：%s（%s）' % (why, J({k: st[k] for k in ('zone', 'day', 'weekday', 'hour')})), flush=True)
    await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)


async def open_map(pg, cdp):
    await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(1500)
    if await pg.evaluate("document.getElementById('bmPeople').classList.contains('hide')"):
        await L.tap(pg, cdp, '#bmWho'); await pg.wait_for_timeout(1200)
    return await pg.evaluate(ROWS_MAP)


async def open_phone(pg, cdp):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1500)
    return await pg.evaluate(ROWS_PHONE)


def no_find(tag, r):
    bad = [x['text'][:30] for x in (r or {}).get('rows', []) if any('帶我去' in t for t in x['btns'])]
    check('%s ① 沒有「帶我去」' % tag, r is not None and '帶我去' not in (r.get('html') or '') and not bad, J(bad[:4]))


def need_go(tag, r, who, by_name):
    """② 走得到的人（go 是 here／mins）在這一頁有那一行的話，那一行要有「直接過去」"""
    want = [p for p in who['people'] if p['go'] and not p['go'].startswith('why')]
    miss = []
    for p in want:
        rows = [x for x in r['rows'] if (x.get('id') == p['id']) or (by_name and x['text'].startswith(p['nm']))]
        if rows and not any(x['fgo'] == p['id'] for x in rows): miss.append([p['nm'], rows[0]['btns']])
    seen = [p['nm'] for p in want if any((x.get('id') == p['id']) or (by_name and x['text'].startswith(p['nm'])) for x in r['rows'])]
    check('%s ② 走得到的人那一行都有「直接過去」（這一頁有 %d 位走得到）' % (tag, len(seen)), bool(seen) and not miss, J({'miss': miss, 'seen': seen}))


async def press_and_check(pg, cdp, tag, sel, p):
    a = await pg.evaluate(NEAR % J(p['id']))
    await pg.evaluate("(s=>{ const b=document.querySelector(s); b&&b.scrollIntoView({block:'center'}); })(%s)" % J(sel))
    await L.tap(pg, cdp, sel)
    t0 = time.time(); w = None
    while time.time() - t0 < 90:
        await pg.wait_for_timeout(1500); w = await pg.evaluate(NEAR % J(p['id']))
        if not w['busy'] and w['d'] is not None and w['d'] <= 2.0 and (p['here'] or w['zone'] != a['zone']): break
    await pg.wait_for_timeout(1500); w = await pg.evaluate(NEAR % J(p['id']))
    await pg.screenshot(path=os.path.join(OUT, '%s_arrived_%s.png' % (tag, 'here' if p['here'] else 'other')))
    dh = ((w['day'] - a['day']) * 24 + (w['hour'] - a['hour'])) * 60
    print('  %s 按「直接過去」%s（%s）：前 %s → 後 %s；遊戲時間 +%.1f 分鐘' % (tag, p['nm'], '同一區' if p['here'] else '別區 ' + str(p['zone']), J(a), J(w), dh), flush=True)
    return a, w, dh


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as pw:
        b, ctx, pg, cdp, errs = await L.launch(pw, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        here_st = other_st = None; here_p = other_p = None
        await load(pg, cdp, {'zone': 'campus', 'hour': 14.0, 'day': 8, 'weekday': 4, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': 30, 'z': 30, 'yaw': 0}}, '先讀一個存檔，在瀏覽器裡掃時段（只算 whereIs，不動存檔；算完改回原本的日期時間）')
        sc = await pg.evaluate(SCAN)
        print('  認識的人：%s；有行程的時段（天, 週幾, 時, 人數, 誰@哪）：%s' % (J(sc['ids']), J(sc['out'])), flush=True)
        slots = [(d, wd, hr) for d, wd, hr, n, zs in sc['out']] + SLOTS
        for (day, wd, hour) in slots:
            st = {'zone': 'campus', 'hour': hour, 'day': day, 'weekday': wd, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': 30, 'z': 30, 'yaw': 0}}
            await load(pg, cdp, st, '校園第 %d 天找人' % day)
            who = await pg.evaluate(WHO)
            print('  人：%s' % J([[p['nm'], p['zone'], p['go']] for p in who['people'] if p['go']]), flush=True)
            h = next((p for p in who['people'] if p['met'] and p['go'] == 'here' and p['npc']), None)
            o = next((p for p in who['people'] if p['met'] and p['go'] and p['go'].startswith('mins')), None)
            if h and not here_st: here_st, here_p = st, h
            if o and not other_st: other_st, other_p = st, o
            if here_st and other_st: break
        check('前置：找到「同一區、走得到」的人', bool(here_p), J(here_p))
        check('前置：找到「別區、走得到」的人', bool(other_p), J(other_p))
        if 'M' in CASES:
            print('== M 大地圖', flush=True)
            for kind, st, p in (('other', other_st, other_p), ('here', here_st, here_p)):
                if not st: continue
                await load(pg, cdp, st, '大地圖：%s' % kind)
                who = await pg.evaluate(WHO); r = await open_map(pg, cdp)
                await pg.screenshot(path=os.path.join(OUT, 'M_people_%s.png' % kind))
                print('  👥：%s' % J(r and r['rows']), flush=True)
                no_find('M（%s）' % kind, r); need_go('M（%s）' % kind, r, who, True)
                if r and any(x['fgo'] == p['id'] for x in r['rows']):
                    a, w, dh = await press_and_check(pg, cdp, 'M', '#bmPeople [data-fgo="%s"]' % p['id'], p)
                    check('M（%s）：按下去以後大地圖關掉' % kind, not w['map'], J(w))
                    if kind == 'here':
                        check('M ③ 同一區：轉場後站在他旁邊（≤ 2 m，≈1.1 m）、沒換區', w['zone'] == a['zone'] and w['d'] is not None and w['d'] <= 2.0, J(w))
                        check('M ③ 同一區：遊戲時間有照距離加（≥ 1 分鐘）', dh >= 0.9, '%.1f 分鐘' % dh)
                    else:
                        check('M ④ 別區：快速前往以後站在他旁邊（≤ 2 m）', w['zone'] == p['zone'] and w['d'] is not None and w['d'] <= 2.0, J(w))
                        check('M ④ 別區：遊戲時間有加（> 0）', dh > 0.5, '%.1f 分鐘' % dh)
                else:
                    check('M（%s）：%s 那一行有「直接過去」可以按' % (kind, p['nm']), False, J(r and r['rows']))
        if 'P' in CASES:
            print('== P 手機朋友頁', flush=True)
            for kind, st, p in (('here', here_st, here_p), ('other', other_st, other_p)):
                if not st: continue
                await load(pg, cdp, st, '手機：%s' % kind)
                who = await pg.evaluate(WHO); r = await open_phone(pg, cdp)
                await pg.screenshot(path=os.path.join(OUT, 'P_friends_%s.png' % kind))
                print('  朋友頁：%s' % J(r and r['rows']), flush=True)
                no_find('P（%s）' % kind, r); need_go('P（%s）' % kind, r, who, False)
                if r and any(x['fgo'] == p['id'] for x in r['rows']):
                    a, w, dh = await press_and_check(pg, cdp, 'P', '#phoneBody [data-fgo="%s"]' % p['id'], p)
                    if kind == 'here':
                        check('P ③ 同一區：站在他旁邊（≤ 2 m）、時間有加（≥ 1 分鐘）', w['zone'] == a['zone'] and w['d'] is not None and w['d'] <= 2.0 and dh >= 0.9, J({'w': w, 'dh': dh}))
                    else:
                        check('P ④ 別區：站在他旁邊（≤ 2 m）、時間有加', w['zone'] == p['zone'] and w['d'] is not None and w['d'] <= 2.0 and dh > 0.5, J({'w': w, 'dh': dh}))
                else:
                    check('P（%s）：%s 那一行有「直接過去」可以按' % (kind, p['nm']), False, J(r and r['rows']))
        if 'U' in CASES:
            print('== U 走不到的人（寒假）', flush=True)
            day = await pg.evaluate("STORY.dayOfKey('2026-01-28')"); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day)
            await load(pg, cdp, {'zone': 'campus', 'hour': 14.0, 'day': day, 'weekday': wd, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': 30, 'z': 30, 'yaw': 0}}, '寒假 2026-01-28')
            who = await pg.evaluate(WHO); r = await open_phone(pg, cdp)
            await pg.screenshot(path=os.path.join(OUT, 'U_phone_winter.png'))
            away = [p for p in who['people'] if p['away'] or (p['go'] or '').startswith('why')]
            print('  走不到的人：%s；朋友頁：%s' % (J([[p['nm'], p['away'], p['go']] for p in away]), J(r and r['rows'])), flush=True)
            shown = [p for p in away if any(x.get('id') == p['id'] for x in (r or {}).get('rows', []))]
            bad = [[p['nm'], x['btns']] for p in shown for x in r['rows'] if x.get('id') == p['id'] and x['fgo']]
            check('U ⑤ 前置：朋友頁上至少有一位走不到的人', bool(shown), J([p['nm'] for p in away]))
            check('U ⑤ 走不到的人沒有「直接過去」', bool(shown) and not bad, J(bad))
            check('U ⑤ 頁面上不顯示「不能直接過去：…」', r is not None and '不能直接過去' not in (r.get('html') or ''), '')
            no_find('U', r)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:8])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
