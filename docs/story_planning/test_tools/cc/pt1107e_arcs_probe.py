# 【CC-B 11-07 複製自 BB-B claude/elegant-brown-fcos7n bb8c7a8d7；只改參數：runner 給 <url> <out> 時存檔資料夾用 SAVES 環境變數（預設 fixtures/user_saves_1107）】
"""BB-B 2026-11-07：女主角故事線（BB_305 第 9 節第 10 項；LAWWW-B f01f54039 src/arcs3d.js、AA_712 7a24f8ce1）瀏覽器驗收。
[前置／捷徑] 讀使用者存檔 day46，【捷徑】DAYSHIFT 天（預設 -14＝10/18，非考試週）、清掉原本的邀約。之後全部觸控：手機「朋友」→ WHO「約」→ 一類 → 地方 → 時間。
  每一輪：【捷徑】把時間撥到約好的前 10 分鐘 → 手機「今天」按「現在過去」→ 跟她走、坐下 → 對話照實點；故事線的選項優先選「講自己的事」那一個（有 tell 的）。
  一輪結束【捷徑】隔天 09:00（G.day+1）。第 2 天多約一次＝同一天第二次不演故事線。
看：① 每一天演一拍、拍數 +1、她說的 ask 句有出現；② 選的答案記在 BEATS.ans、講了自己的事記 YT_TOLD；③ 同一天第二次見面不演；④ 演的四拍不同；⑤ 沒有 JS 例外。
用法：LW_TESTS=<測試樹>/tests WHO=heroine_01 ROUNDS=4 python3 pt1107e_arcs_probe.py URL 存檔資料夾 輸出資料夾（PC 用 URL 不加 ?turbo）"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

if len(sys.argv) >= 4: URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
else: URL, OUT = sys.argv[1], sys.argv[2]; SAVES = os.environ.get('SAVES') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'user_saves_1107')   # CC-B：PC runner 只給 <url> <out>
WHO = os.environ.get('WHO', 'heroine_01')
ROUNDS = int(os.environ.get('ROUNDS', '4'))
SHIFT = int(os.environ.get('DAYSHIFT', '-14'))
PLAN = [('念書', '總圖'), ('喝咖啡', '2:30 AM'), ('念書', '總圖'), ('喝咖啡', '2:30 AM')]


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


async def close_phone(pg, cdp):
    """收起手機（手機開著 E.paused＝時間不走）：按手機裡的「收起來」；找不到才按 #btnPhone"""
    for _ in range(3):
        if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): return True
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.textContent.trim()==='收起來'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        else: await L.tap(pg, cdp, '#btnPhone')
        await pg.wait_for_timeout(700)
    return await pg.evaluate("document.getElementById('phone').classList.contains('hide')")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def choose(pg, cdp, word, exact_start=False):
    c = await pg.evaluate("((w,s)=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>s?x.textContent.trim().startsWith(w):x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim(),b.disabled||b.classList.contains('dim')]; })(%s,%s)" % (json.dumps(word), 'true' if exact_start else 'false'))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(),dim:!!(b.disabled||b.classList.contains('dim'))}))")


async def settle(pg, cdp, log, secs=40):
    for _ in range(secs * 2):
        q = await L.state(pg)
        if q['dtext'] and (not log or log[-1] != q['dtext']): log.append(q['dtext'])
        if not q['busy'] and not q['dlg'] and not q['choices']: return True
        if q['choices']:
            o = await opts(pg); log.append('選項：' + '｜'.join(x['t'] for x in o))
            pick = next((x['t'] for x in o if not x['dim'] and not any(w in x['t'] for w in ('算了', '返回', '下次再說'))), None)
            if pick is None: pick = o[0]['t']
            await choose(pg, cdp, pick, True); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False



async def beats(pg):
    return await pg.evaluate("(w=>{ const f=GAME.G.flags||{}; const r=(f.BEATS||{})[w]||null; const t={}; for(const [k,v] of Object.entries(f.YT_TOLD||{})) if(v&&v[w]!=null) t[k]=v[w]; return {r, told:t, day:GAME.G.day}; })(%s)" % json.dumps(WHO))


async def arc_texts(pg):
    return await pg.evaluate("(w=>{ const T=((HEROINE_ARCS||{}).people||{})[w]; return T?T.beats.map(b=>({n:b.n, ask:(b.ask||[]).join(''), lines:b.lines||[], opts:(b.opts||[]).map(o=>({t:o.t, tell:o.tell||null, toldAlt:o.toldAlt?(typeof o.toldAlt==='string'?o.toldAlt:o.toldAlt.t):null}))})):null; })(%s)" % json.dumps(WHO))


async def meet_once(pg, cdp, run, cat, word, tag):
    """約一次、去、演完。回傳 (said, picked_options)"""
    await phone(pg, cdp, 'friends')
    if not await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % WHO): return None, None
    await pg.wait_for_timeout(1500)
    if not await choose(pg, cdp, cat): return None, None
    if not await choose(pg, cdp, word): return None, None
    o = await opts(pg)
    t = next((x for x in o if x['t'].startswith('今天') and not x['dim']), None)
    if not t:
        run.check('[%s] 今天有能選的時間' % tag, False, json.dumps(o, ensure_ascii=False)); return None, None
    await choose(pg, cdp, t['t'], True)
    log = []; await settle(pg, cdp, log, 30)
    iv = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day&&v.state!=='done').map(v=>({id:v.id,h:v.h,place:v.place})))(%s)" % json.dumps(WHO))
    if not iv:
        run.check('[%s] 約成了（%s）' % (tag, t['t']), False, json.dumps(log[-5:], ensure_ascii=False)); return None, None
    v = iv[-1]
    run.setup('[%s]【捷徑】時間撥到約好的 %.2f 前 10 分鐘' % (tag, v['h']))
    await pg.evaluate("(h=>{ GAME.G.hour=h; })(%f)" % (v['h'] - 0.17)); await pg.wait_for_timeout(1200)
    await phone(pg, cdp, 'today')
    if not await tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % v['id']):
        here = await pg.evaluate("(p=>{ const P=INV.place(p)||{}; return GAME.G.zone===P.zone; })(%s)" % json.dumps(v['place']))
        if not here:
            run.check('[%s] 手機「今天」有「現在過去」' % tag, False); return None, None
        run.setup('[%s] 人已經在約好的地方（【捷徑】隔天沒有回宿舍睡），手機不給「前往」＝照設計，直接走去找她' % tag)
        run.check('[%s] 收起手機（時間才會走）' % tag, await close_phone(pg, cdp))

    said, picked = [], []
    reopen = 0
    for _ in range(900):
        q = await L.state(pg)
        if not q['dlg'] and not q['choices'] and await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"):
            reopen += 1; said.append('【手機自己打開了（第 %d 次），照玩家會做的收起來】' % reopen)
            print('   [%s] 手機自己打開了（第 %d 次）：收起來' % (tag, reopen), flush=True)
            await close_phone(pg, cdp)
            if reopen > 5: break
            continue
        if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
        st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{st:v.state, ph:v.lead&&v.lead.ph}:null; })(%s)" % json.dumps(v['id']))
        if st and st['st'] in ('done', 'met', 'over') and not q['dlg'] and not q['busy'] and not q['choices']: break
        if q['choices']:
            o = await opts(pg); ts = [x['t'] for x in o]
            tell = await pg.evaluate("((w,ts)=>{ const T=((HEROINE_ARCS||{}).people||{})[w]; if(!T) return null; for(const b of T.beats) for(const o of b.opts||[]){ const alt=o.toldAlt?(typeof o.toldAlt==='string'?o.toldAlt:o.toldAlt.t):null; if(o.tell&&(ts.includes(o.t)||ts.includes(alt))) return ts.includes(o.t)?o.t:alt; } return null; })(%s,%s)" % (json.dumps(WHO), json.dumps(ts, ensure_ascii=False)))
            pick = tell or ts[0]
            picked.append({'opts': ts, 'pick': pick}); said.append('選項：' + '｜'.join(ts) + ' → ' + pick)
            await choose(pg, cdp, pick, True); continue
        if st and (st['ph'] == 'wait' or (st['st'] == 'accepted' and not st['ph'])):
            n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % json.dumps(WHO))
            if n: await L.go_to(pg, cdp, run, n['x'], n['z'], 1.8, '走到她旁邊', lv=n['lv']); await pg.wait_for_timeout(1000); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return said, picked


async def main():
    run = L.Run('pt1107e', OUT)
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    s = dict(s); s['day'] = s['day'] + SHIFT; s['invites'] = []
    f = dict(s.get('flags') or {}); f.pop('BEATS', None); f.pop('YT_TOLD', None); f.pop('ARC_INVITE', None); s['flags'] = f
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46；【捷徑】day %+d、清掉原本的邀約、清掉 BEATS／YT_TOLD（從第 1 拍開始）' % SHIFT)
        await L.load_state(pg, s, quiet_phone=True); await pg.wait_for_timeout(3500); await settle(pg, cdp, [], 60)
        T = await arc_texts(pg)
        run.check('遊戲裡有 %s 的故事線（HEROINE_ARCS）' % WHO, bool(T), str(type(T)))
        if not T: return run.finish()
        st0 = await pg.evaluate("(w=>({stageNum:DATE.stageNum(w), stage:INV.stageOf(GAME.G,w)}))(%s)" % json.dumps(WHO))
        print('   關係', st0, '｜第 1～4 拍 need', [b.get('n') for b in T[:4]], flush=True)
        seen = []
        for i in range(ROUNDS):
            cat, word = PLAN[i % len(PLAN)]
            b0 = await beats(pg); k0 = (b0['r'] or {}).get('k', 1)
            said, picked = await meet_once(pg, cdp, run, cat, word, '第%d天' % (i + 1))
            b1 = await beats(pg); k1 = (b1['r'] or {}).get('k', 1)
            beat = T[k0 - 1] if k0 - 1 < len(T) else None
            asked = bool(beat) and any(beat['ask'][:8] in x for x in (said or []))
            print('   [第%d天 %s] k %s→%s ask=%s picked=%s told=%s' % (i + 1, word, k0, k1, asked, picked, b1['told']), flush=True)
            run.check('[第%d天 %s] 演了第 %d 拍（k %d→%d）、她問的那句有出現' % (i + 1, word, k0, k0, k1), said is not None and k1 == k0 + 1 and asked, json.dumps({'said': (said or [])[-14:], 'ask': beat and beat['ask']}, ensure_ascii=False))
            if k1 == k0 + 1:
                seen.append(k0)
                mem = (b1['r'] or {}).get('ans') or {}
                run.check('[第%d天] 選的答案記在 BEATS.ans（%d 筆）' % (i + 1, len(mem)), len(mem) >= len(seen), json.dumps(mem, ensure_ascii=False))
            await run.shot(pg, 'arc_day%d' % (i + 1))
            if i == 1:   # 同一天再約一次＝不演故事線
                bb = await beats(pg); kk = (bb['r'] or {}).get('k', 1)
                said2, picked2 = await meet_once(pg, cdp, run, '喝咖啡' if cat == '念書' else '念書', '2:30 AM' if cat == '念書' else '總圖', '第2天第二次')
                bb2 = await beats(pg)
                run.check('[第2天第二次] 同一天第二次見面不演故事線（k 不變）', said2 is not None and (bb2['r'] or {}).get('k', 1) == kk, json.dumps({'k': [kk, (bb2['r'] or {}).get('k')], 'said': (said2 or [])[-8:]}, ensure_ascii=False))
            run.setup('【捷徑】隔天 09:00（G.day+1）')
            await pg.evaluate("(()=>{ GAME.G.day+=1; GAME.G.hour=9; })()"); await pg.wait_for_timeout(1500); await settle(pg, cdp, [], 30)
        run.check('演的拍都不同（%s）' % seen, len(seen) == len(set(seen)) and len(seen) >= min(ROUNDS, 2), json.dumps(seen))
        bf = await beats(pg)
        run.check('講了自己的事有記 YT_TOLD（%s）' % list(bf['told'].keys()), len(bf['told']) >= 1, json.dumps(bf, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
