"""CC-C 11-12：PHONE-GO-PROMPT-1111（BB-C 03:56 ⑦；LAWWW 42a854dee9，BB 11-11 V25_L118_C5）。判定歸 BB；Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
BB 的判準：畫面上開著「直接過去／自己走過去」時開手機按「前往」＝手機收起來、選單還在、有提示先選完；平常（沒有選單時）按前往照舊出發。
對照的程式（src/game3d.js 手機「今天」[data-invgo] 的 onclick）：closePhone() → 有選單（#choices 沒有 hide）且 player.busy＝toast「先選完畫面上的選項」、不呼叫 INV.goNow；
  沒有選單＝INV.goNow（src/invites3d.js：時間撥到該出發、GM.quickGo 到約好的那一區）。
  「直接過去／自己走過去」＝INV.goPrompt：約好的時間前 30 分鐘到後 15 分鐘、人不在那一區、空下來時問一次（S.goDue）。
受測：LAWWW 正式 SHA（含 42a854dee9）；舊版 42a854dee9 的上一個（修改前 tests/phone_go_prompt_1111_unit.js 1、2、3 FAIL）。
CASES：
  PROMPT  【前置／捷徑】day46 存檔、約好的時間前 40 分鐘讀檔、INV.accept 一筆和以安的約（別的區域、沒有固定時段、不帶路的地點）→ 等遊戲自己跳「直接過去／自己走過去」
          → 開手機 → 「今天」→ 按那一筆的「前往」→ 判：手機收起來、選單還在（同樣兩個選項）、提示「先選完畫面上的選項」、區域和時間沒變 → 照字選「自己走過去」收尾。
  NORMAL  同一筆約、約好的時間前 90 分鐘讀檔（還沒到 goPrompt 的時間）→ 開手機 →「今天」→ 按「前往」→ 判：手機收起來、到約好的那一區（照舊出發）。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4✓ 5n/a（不走路：只按手機和選單） 6✓ 7✓ 8✓ 9n/a（只存最後一張畫面，不判截圖） 10✓ 11✓ 12✓ 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [CASES=PROMPT,NORMAL] [WHO=heroine_01] python3 cc_phone_go_prompt_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
CASES = [c.strip() for c in (os.environ.get('CASES') or 'PROMPT,NORMAL').split(',') if c.strip()]
WHO = os.environ.get('WHO') or 'heroine_01'
R = L.Run('phonego_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
TOAST_HOOK = r"""(()=>{ if(window.__ccToastObs) return 1; window.__ccToasts=[]; const el=document.getElementById('toast'); if(!el) return 0;
  window.__ccToastObs=new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&!el.classList.contains('hide')) window.__ccToasts.push(t); }); window.__ccToastObs.observe(el,{childList:true,characterData:true,subtree:true,attributes:true}); return 1; })()"""
# 挑地點：可以約她的（照手機會出現的 S.show／neverAt）、不在現在這一區、沒有固定時段（when／times）、不帶路（sitAt.lead）、那一區真的存在；INV.accept 成一筆（【前置／捷徑】）
SET_JS = r"""(a=>{ const G=GAME.G; G.invites=[]; G.contacts=G.contacts||{}; if(G.contacts[a.who]==null) G.contacts[a.who]=1;
  const PLS=(typeof INVITE_DATA!=='undefined'&&INVITE_DATA.places)||[]; const why=[];
  for(const P of PLS){ if(!P.zone||P.zone===G.zone||!(Z3.ZONES&&Z3.ZONES[P.zone])){ continue; } if(P.when||P.times||P.timesBy||(P.sitAt&&P.sitAt.lead)) continue;
    if(P.show&&!P.show(G,a.who)) continue; if(INV.neverAt&&INV.neverAt(a.who,P)) continue;
    const iv=INV.accept(G,a.who,P.id,G.day,a.h); if(!iv){ why.push(P.id+' accept null'); continue; }
    let can=null; try{ can=INV.canGo?!!INV.canGo(G,iv):null; }catch(e){ can='ERR '+e; } if(can===false){ G.invites=[]; why.push(P.id+' canGo false'); continue; }
    return {iv:{id:iv.id, who:iv.who, place:iv.place, zone:iv.zone, day:iv.day, h:iv.h, state:iv.state}, pname:P.name, here:G.zone, hour:+(+G.hour).toFixed(2)}; }
  return {err:'沒有合用的地點', why:why.slice(0,6), n:PLS.length}; })"""
ST_JS = r"""(()=>{ const ch=document.getElementById('choices'), ph=document.getElementById('phone');
  return {zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(3), phone:!!ph&&!ph.classList.contains('hide'), choices:!!ch&&!ch.classList.contains('hide')?[...ch.querySelectorAll('button')].map(b=>b.textContent.trim()):null,
    busy:!!GAME.E.player.busy, iv:(GAME.G.invites||[]).map(v=>({id:v.id, state:v.state, h:v.h, zone:v.zone})), toasts:(window.__ccToasts||[]).slice(-4)}; })()"""


async def load(pg, cdp, h, tag, why):
    s = json.load(open(SAVE, encoding='utf-8')); s = dict(s.get('G', s)); s['hour'] = h; s['invites'] = []
    await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3500)
    await L.close_panels(pg, cdp); await pg.evaluate(TOAST_HOOK)
    R.setup('%s 【前置／捷徑】day46 存檔、%.2f 點讀檔（%s）' % (tag, h, why))


async def open_today_go(pg, cdp, tag, ivid):
    """像玩家：按手機鍵 → 「今天」分頁 → 那一筆的「前往」（按之前看最上面是不是那顆鈕）"""
    if not (await pg.evaluate(ST_JS))['phone']:
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    ok_tab = await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(900)
    sel = '#phoneBody [data-invgo="%s"]' % ivid
    info = await pg.evaluate("(s=>{ const b=document.querySelector(s); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {txt:b.textContent.trim(), top:!!t&&(t===b||b.contains(t)), r:[r.left,r.top,r.width,r.height]}; })", sel)
    R.note('%s 手機「今天」：分頁 %s；「前往」鈕 %s' % (tag, ok_tab, J(info)))
    if not info: return None
    await pg.wait_for_timeout(400); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    return info


async def case_prompt(pg, cdp, errs):
    tag = '[PROMPT]'; e0 = len(errs)
    await load(pg, cdp, 13.33, tag, '約好的時間 14:00 前 40 分鐘，還沒到 goPrompt 的時間')
    s = await pg.evaluate(SET_JS, {'who': WHO, 'h': 14.0}); R.note('%s 約：%s' % (tag, J(s)))
    if not R.check('%s 前置：INV.accept 一筆別的區域的約（%s）' % (tag, WHO), not s.get('err'), J(s)): return
    R.setup('%s 【前置／捷徑】INV.accept：和 %s 約在 %s（%s 區）今天 14:00（現在在 %s）' % (tag, WHO, s['pname'], s['iv']['zone'], s['here']))
    t0 = time.time(); q = None
    while time.time() - t0 < 240:   # 遊戲時間走到 13:30（iv.h−0.5）＋空下來，INV.goPrompt 自己跳；途中有對話就點掉（CC_02 乙 10）
        q = await pg.evaluate(ST_JS)
        if q['choices'] and any(c.startswith('直接過去') for c in q['choices']): break
        if q['choices']: R.note('%s 等提示途中先出現別的選單 %s：選第一個' % (tag, J(q['choices']))); await L.tap(pg, cdp, '#choices button:nth-child(1)')
        elif await pg.evaluate("!!(GAME.D&&GAME.D.active)"): await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    if not R.check('%s 遊戲自己跳出「直接過去／自己走過去」（%.2f 點）' % (tag, q['hour']), bool(q['choices']) and any(c.startswith('直接過去') for c in q['choices']), J(q)): return
    ch0 = q['choices']; z0, h0 = q['zone'], q['hour']; await pg.evaluate("(()=>{ window.__ccToasts=[]; })()")
    info = await open_today_go(pg, cdp, tag, s['iv']['id'])
    if not R.check('%s 手機「今天」有那一筆的「前往」鈕' % tag, bool(info), ''): return
    await pg.wait_for_timeout(1500); q2 = await pg.evaluate(ST_JS)
    R.note('%s 按完：%s' % (tag, J(q2)))
    R.check('%s ① 手機收起來了' % tag, not q2['phone'], J(q2))
    R.check('%s ② 選單還在、同樣兩個選項' % tag, q2['choices'] == ch0, J({'before': ch0, 'after': q2['choices']}))
    R.check('%s ③ 提示「先選完畫面上的選項」' % tag, any('先選完畫面上的選項' in t for t in q2['toasts']), J(q2['toasts']))
    R.check('%s ④ 沒有出發：區域、時間沒變（%s %.2f → %s %.2f）' % (tag, z0, h0, q2['zone'], q2['hour']), q2['zone'] == z0 and q2['hour'] - h0 < 0.2, '')
    if q2['choices']:
        k = next((i for i, c in enumerate(q2['choices']) if c.startswith('自己走過去')), None)
        if k is not None: await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(1500)
    q3 = await pg.evaluate(ST_JS); R.check('%s 照字選「自己走過去」以後選單收掉、人能動' % tag, not q3['choices'] and not q3['busy'], J(q3))
    R.check('%s 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    try: await pg.screenshot(path=os.path.join(OUT, 'phonego_%s_prompt.jpg' % TAG), type='jpeg', quality=70)
    except Exception: pass


async def case_normal(pg, cdp, errs):
    tag = '[NORMAL]'; e0 = len(errs)
    await load(pg, cdp, 12.5, tag, '約好的時間 14:00 前 90 分鐘，goPrompt 還不會跳')
    s = await pg.evaluate(SET_JS, {'who': WHO, 'h': 14.0}); R.note('%s 約：%s' % (tag, J(s)))
    if not R.check('%s 前置：INV.accept 一筆別的區域的約（%s）' % (tag, WHO), not s.get('err'), J(s)): return
    R.setup('%s 【前置／捷徑】INV.accept：和 %s 約在 %s（%s 區）今天 14:00（現在在 %s）' % (tag, WHO, s['pname'], s['iv']['zone'], s['here']))
    q = await pg.evaluate(ST_JS)
    if not R.check('%s 按之前沒有選單開著' % tag, not q['choices'], J(q)): return
    info = await open_today_go(pg, cdp, tag, s['iv']['id'])
    if not R.check('%s 手機「今天」有那一筆的「前往」鈕' % tag, bool(info), ''): return
    q1 = await pg.evaluate(ST_JS); R.check('%s ① 按了手機就收起來' % tag, not q1['phone'], J(q1))
    t0 = time.time(); q2 = q1
    while time.time() - t0 < 90:   # INV.goNow：時間撥到該出發（CLS.skipTo）→ GM.quickGo；途中有對話就點掉
        q2 = await pg.evaluate(ST_JS)
        if q2['zone'] == s['iv']['zone'] and not q2['busy']: break
        if q2['choices']: R.note('%s 出發途中有選單 %s：停下來記，不判' % (tag, J(q2['choices']))); break
        if await pg.evaluate("!!(GAME.D&&GAME.D.active)"): await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    R.note('%s 按完：%s' % (tag, J(q2)))
    R.check('%s ② 照舊出發：到了約好的那一區 %s（%s 點）' % (tag, s['iv']['zone'], q2['hour']), q2['zone'] == s['iv']['zone'], J(q2))
    R.check('%s 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    try: await pg.screenshot(path=os.path.join(OUT, 'phonego_%s_normal.jpg' % TAG), type='jpeg', quality=70)
    except Exception: pass


async def main():
    print('CC PHONE-GO-PROMPT：TAG %s；SHA %s；CASES %s；WHO %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(CASES), WHO), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        F = {'PROMPT': case_prompt, 'NORMAL': case_normal}
        for c in CASES:
            if c not in F: R.check('[%s] 認得這個 case' % c, False, J(list(F))); continue
            try: await F[c](pg, cdp, errs)
            except Exception as e: R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
