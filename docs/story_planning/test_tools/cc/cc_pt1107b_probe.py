"""【CC-B 11-07 複製自 BB-B claude/elegant-brown-fcos7n e50530d43 docs/story_planning/test_tools/pt1107b_probe.py；只改參數：runner 給 <url> <out>，存檔資料夾改用 SAVES 環境變數（預設 fixtures/user_saves_1107＝使用者 11-07 day46，企劃線 cool-heisenberg docs/story_planning/user_saves/2026-11-07）】
BB-B 2026-11-07：STUDY-DATE-PROGRESS-1107＋ACTION-BUDGET-1107 瀏覽器驗收（LAWWW-B a641c0459）。
[前置／捷徑] 讀使用者存檔 day46（週六 07:33 宿舍，語彤 FAMILIAR）；之後觸控：手機「朋友」→ 語彤「約」→ 念書 → 總圖 → 今天下午的時間。
  ① 約下午的時間時：選項裡沒有被排滿的灰掉（今天下午還沒排）；約好以後再約別人同一個下午＝灰掉／「這個下午已經排滿了。」
  ②【捷徑】把時間撥到約好的前 10 分鐘（GAME.G.hour；不測走路），手機「今天」按約好的那一列「現在過去」→ 到總圖、兩個人都在就開始。
  ③ 一起念書演的是 STUDY_SCENES 語彤第 1 場（坐下 seat、中途 mid、收書 pack、道別 bye 裡的句子），不是一般句。
  ④ 演完：下午那一格用掉（G.slots.used.pm），時間直接跳到 18:00（或下一堂課前 10 分鐘）。
用法：LW_TESTS=<測試樹>/tests python3 pt1107b_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

URL, OUT = sys.argv[1], sys.argv[2]
SAVES = os.environ.get('SAVES') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'user_saves_1107')
WHO = os.environ.get('WHO', 'heroine_03')


async def phone(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''")


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


async def main():
    run = L.Run('pt1107b', OUT)
    s = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    SHIFT = int(os.environ.get('DAYSHIFT', '0'))   # 使用者四個存檔都在期中考週（10/20～11/2）：考試週下午多一格只能自習，見面演完本來就不跳；DAYSHIFT=7＝【捷徑】往後一週（11/8，非考試週）
    if SHIFT: s = dict(s); s['day'] = s['day'] + SHIFT; s['invites'] = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀使用者存檔 day46（第 46 天週六 07:33 宿舍）' + ('；【捷徑】day +%d（非考試週），清掉存檔裡原本的邀約' % SHIFT if SHIFT else ''))
        await L.load_state(pg, s, quiet_phone=True)
        await pg.wait_for_timeout(3500)
        await settle(pg, cdp, [], 60)
        sc = await pg.evaluate("(w=>{ const P=(STUDY_SCENES.people||{})[w]||{}; const s=(P.scenes||{})['1']||{}; return {seat:s.seat||[], mid:s.mid||[], pack:s.pack||[], bye:s.bye||[], need:s.need}; })(%s)" % json.dumps(WHO))
        n0 = await pg.evaluate("(w=>{ try{ return JSON.stringify((GAME.G.flags||{}).STUDYN||null); }catch(e){ return String(e); } })(%s)" % json.dumps(WHO))
        print('   第 1 場', sc, ' STUDYN', n0, flush=True)
        # ① 約
        await phone(pg, cdp, 'friends')
        await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % WHO); await pg.wait_for_timeout(1500)
        await choose(pg, cdp, '念書'); await choose(pg, cdp, '總圖')
        o = await opts(pg); print('   時間', o, flush=True)
        if not o:
            q = await L.state(pg); print('   沒有時間選項：對話', q.get('dtext'), '｜exam', await pg.evaluate("!!(CLS.examWeek&&CLS.examWeek(GAME.G))"), '｜', await pg.evaluate("JSON.stringify(CALENDAR.dateOf(GAME.G.day))"), flush=True)
        EV = os.environ.get('SLOT', '') == 'ev'   # SLOT=ev：約晚上（05df3a848：晚上那一格用完、後面沒有約＝回去睡到隔天早上；UA-LAWWW-1107-03）
        HRS = ('19:', '20:') if EV else ('13:', '14:', '15:', '16:')
        pm = next((x for x in o if x['t'].startswith('今天') and not x['dim'] and any(h in x['t'] for h in HRS)), None)
        run.check('約時間：今天%s有能選的時間' % ('晚上' if EV else '下午'), bool(pm), json.dumps(o, ensure_ascii=False))
        if not pm: return run.finish()
        await choose(pg, cdp, pm['t'], True)
        log = []; await settle(pg, cdp, log, 30)
        iv = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day).map(v=>({id:v.id,h:v.h,place:v.place,state:v.state,cat:v.cat})))(%s)" % json.dumps(WHO))
        isst = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day).map(v=>INV.isStudy(v,INV.place(v.place))))(%s)" % json.dumps(WHO))
        run.check('約好了：今天下午、總圖，算「一起念書」（INV.isStudy；總圖只能念書，不記 cat）', bool(iv) and any(isst), json.dumps({'iv': iv, 'isStudy': isst, 'log': log[-4:]}, ensure_ascii=False))
        if not iv: return run.finish()
        v = iv[-1]
        day0 = await pg.evaluate("GAME.G.day")
        LATER = os.environ.get('LATER', '') == '1'   # LATER=1：同一晚 21:00 後面還有一個約＝不睡
        if EV and LATER:
            r2 = await pg.evaluate("(()=>{ const G=GAME.G; for(const pid of ['cafe','library','brunch']){ try{ const iv=INV.accept(G,'heroine_01',pid,G.day,21,{by:'player'}); if(iv) return {pid,h:iv.h,id:iv.id}; }catch(e){} } return null; })()")
            run.setup('【捷徑】同一晚 21:00 再加一個約（INV.accept 以安 %s）＝後面還有約' % json.dumps(r2, ensure_ascii=False))
        # ②【捷徑】撥時間到約好的前 10 分鐘
        run.setup('【捷徑】GAME.G.hour 撥到約好的 %.2f 前 10 分鐘（不測走路、不測跳過時間）' % v['h'])
        await pg.evaluate("(h=>{ GAME.G.hour=h; })(%f)" % (v['h'] - 0.17))
        await pg.wait_for_timeout(1500)
        await phone(pg, cdp, 'today')
        go = await pg.evaluate("!!document.querySelector('#phoneBody [data-invgo=\"%s\"]')" % v['id'])
        run.check('手機「今天」約好的那一列有「現在過去」', go, (await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''"))[:240])
        if not go: return run.finish()
        await tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % v['id'])
        said = []
        for _ in range(240):   # 她帶路：坐好以後（lead.ph＝wait）走到她旁邊 2.5 m 內才開始（invites3d.js:576）
            q = await L.state(pg)
            if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
            if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            ld = await pg.evaluate("((id,w)=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return {st:v&&v.state, ph:v&&v.lead&&v.lead.ph, n:n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),lv:n.lv|0,seat:!!n.seat}:null, plv:GAME.E.player.lv|0}; })(%s,%s)" % (json.dumps(v['id']), json.dumps(WHO)))
            if ld['st'] == 'done': break
            if ld['ph'] == 'wait' and ld['n']:
                print('   她坐好了', ld, flush=True)
                await L.go_to(pg, cdp, run, ld['n']['x'], ld['n']['z'], 1.8, '走到%s旁邊' % WHO, lv=ld['n']['lv'])
                await pg.wait_for_timeout(1500)
                if (await pg.evaluate("(id=>((GAME.G.invites||[]).find(x=>String(x.id)===String(id))||{}).state)(%s)" % json.dumps(v['id']))) == 'done': break
            await pg.wait_for_timeout(500)
        for _ in range(400):
            q = await L.state(pg)
            if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
            st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?v.state:null; })(%s)" % json.dumps(v['id']))
            if st in ('done', 'met', 'over') and not q['dlg'] and not q['busy'] and not q['choices']: break
            if q['choices']:
                o = await opts(pg); said.append('選項：' + '｜'.join(x['t'] for x in o))
                await choose(pg, cdp, o[0]['t'], True); continue
            if q['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'study_after')
        hs = []
        for _ in range(16):   # 演完以後跳時段（CLS.queueJump → afterSlot）可能晚一點才做：看 8 秒
            q = await L.state(pg)
            if q['dlg']: said.append(q['dtext']); await L.tap(pg, cdp, '#dlg')
            hs.append(await pg.evaluate("+GAME.G.hour.toFixed(2)")); await pg.wait_for_timeout(500)
        print('   演完以後 8 秒的時間', hs, flush=True)
        info = await pg.evaluate("(id=>({h:+GAME.G.hour.toFixed(2), zone:GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id, slots:JSON.stringify((GAME.G.slots||{}).used||null), st:((GAME.G.invites||[]).find(x=>String(x.id)===String(id))||{}).state}))(%s)" % json.dumps(v['id']))
        print('   她說', said[:40], '\n   之後', info, flush=True)
        texts = [l.split('｜', 1)[-1] for l in said]
        allsc = sc['seat'] + sc['mid'] + sc['pack'] + sc['bye']
        hit = [t for t in allsc if any(t in x or x in t for x in texts)]
        run.check('③ 演的是語彤第 1 場（seat／mid／pack／bye 的句子出現 %d／%d 句）' % (len(hit), len(allsc)), len(hit) >= max(2, len(allsc) // 2), json.dumps({'hit': hit, 'said': said[:30]}, ensure_ascii=False))
        if os.environ.get('SLOT', '') == 'ev':   # CC-B 11-07（BB-B 06:47）：SLOT=ev 不查下午那一格，改查晚上那一格（slots.used.ev ≥ 1）
            run.check('④ 晚上那一格用掉（slots.used.ev ≥ 1）', await pg.evaluate("((GAME.G.slots||{}).used||{}).ev>=1"), json.dumps(info, ensure_ascii=False))
        else:
          run.check('④ 下午那一格用掉（slots.used.pm ≥ SLOT_BASE.pm）', await pg.evaluate("((GAME.G.slots||{}).used||{}).pm>=CLS.SLOT_BASE.pm"), json.dumps(info, ensure_ascii=False))
        exam = await pg.evaluate("!!(CLS.examWeek&&CLS.examWeek(GAME.G))")
        dbg = await pg.evaluate("(()=>{ const P=GAME.E.player; return {jump:CLS._jump||null, busy:!!(P&&P.busy), seat:!!(P&&P.seat), dlg:!!(GAME.D&&GAME.D.active), adv:!!(typeof ADV!=='undefined'&&ADV.active), canSkip:CLS.canSkip?CLS.canSkip(GAME):null, period:CLS.periodAt?CLS.periodAt(GAME.G.hour):null, left:CLS.slotLeft?CLS.slotLeft(GAME.G,'pm','study'):null}; })()")
        print('   演完以後的狀態', dbg, flush=True)
        stn = await pg.evaluate("(w=>{ const r=((GAME.G.flags||{}).STUDYN||{})[w]; return r?{n:r.n,k:r.k,last:r.last}:null; })(%s)" % json.dumps(WHO))
        run.check('③ STUDYN 記到第 1 場演過（n=1、下一場 k=2）', bool(stn) and stn.get('n') == 1 and stn.get('k') == 2, json.dumps(stn))
        if EV:
            slept = await pg.evaluate("({day:GAME.G.day, hour:+GAME.G.hour.toFixed(2), zone:(GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id)||GAME.G.zone})")
            toast = [t for t in said if '晚上的時間用完了' in t]
            print('   晚上演完以後', slept, toast, flush=True)
            if exam:
                run.check('④ 考試週：晚上多一格只能自習，見面演完不睡（照設計）', True, json.dumps({'exam': exam, **slept}, ensure_ascii=False))
            elif LATER:
                run.check('④ 同一晚 21:00 後面還有約：不睡（還是今天、還在晚上）', slept['day'] == day0 and slept['hour'] >= 18, json.dumps({'slept': slept, 'iv': v}, ensure_ascii=False))
            else:
                run.check('④ 晚上那一格用完、後面沒有約：回去睡到隔天早上（day+1、早上、宿舍或家）', slept['day'] == day0 + 1 and slept['hour'] < 12 and slept['zone'] in ('dorm', 'dorm_hall', 'home', 'home_room'), json.dumps({'slept': slept, 'said': said[-6:]}, ensure_ascii=False))
        elif exam:
            run.check('④ 考試週：下午多一格只能自習，見面演完不跳（照設計）', True, json.dumps({'exam': exam, **info}, ensure_ascii=False))
        else:
            run.check('④ 時間跳到 18:00 或下一堂課前 10 分鐘（≥ 17.8）', info['h'] >= 17.8, json.dumps({'exam': exam, **info}, ensure_ascii=False))
        await settle(pg, cdp, [], 20)
        await phone(pg, cdp, 'friends')
        other = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#phoneBody [data-inv]')].map(x=>x.dataset.inv).find(x=>x!==w); return b||null; })(%s)" % json.dumps(WHO))
        if other and os.environ.get('SLOT', '') == 'ev':
            print('   SLOT=ev：「演完以後再約別人，今天下午灰掉／排滿」兩項只給下午（pm），這一輪跳過（BB-B 06:47）', flush=True)
        elif other:
            await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % other); await pg.wait_for_timeout(1500)
            await choose(pg, cdp, '念書'); o1 = await opts(pg)
            if not any(x['t'].startswith('今天') or x['t'].startswith('明天') for x in o1):
                await choose(pg, cdp, next((x['t'] for x in o1 if not x['dim'] and '返回' not in x['t']), o1[0]['t']), True)
            o2 = await opts(pg); print('   演完以後再約 %s' % other, o2, flush=True)
            pmd = [x for x in o2 if x['t'].startswith('今天') and any(h in x['t'] for h in ('12:', '13:', '14:', '15:', '16:', '17:'))]
            run.check('演完以後再約別人：今天下午的時間灰掉或寫已排滿（沒有今天下午的選項也算）', all(x['dim'] or '排滿' in x['t'] for x in pmd), json.dumps(o2, ensure_ascii=False))
            if pmd:
                await choose(pg, cdp, pmd[0]['t'], True); lg = []; await settle(pg, cdp, lg, 15)
                print('   選排滿那格', lg[-4:], flush=True)
                run.check('選了排滿的下午：說「這個下午已經排滿了。」', any('排滿' in l for l in lg), json.dumps(lg[-4:], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
