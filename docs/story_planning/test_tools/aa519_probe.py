"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 1 項）：AA_519 配角第二批的瀏覽器情境——照玩家走過去、按「和〈他〉說話」、點對話（不是 Node）。
MODE（環境變數）：
  aunt    1-1／1-2：大一上第 2 週週二 12:30 麵店——櫃台是阿姨（hc_ayi 外觀：中年底模 char.npc_nf3＋圍裙），沒有年輕女店員；說話＝第一句「坐。……你們法律系的，都坐長桌那邊。」、
          第二次＝短句；同一天 18:20（語彤顧店，圈子表的阿姨 hc_ayi）看得到的阿姨只有一位、同一份紀錄（今天的新句已經說過＝短句）
  cafe    3-1：大一上第 2 週週二 15:30 Café（芷若不在班）——櫃台是老闆（hc_boss、男、char.npc_nm6）；說話＝大一那兩句或店名由來，第二次＝短句
  cafe27  9-3：2027-06-10（四）——芷若原本的班（EAT.cafeXt）櫃台是小婷（hc_xt、不能說話）、其他時間是老闆（說話＝大二那兩句之一）；
          待在店裡跨過班表的時間＝當場換人（等遊戲時間走過去，最多 8 分鐘）
  ty2     9-1：2026-10-19（一）21:00 宿舍 312（ROOM_Y2）——滷味之夜：旁白、遞毛巾那一句、手機、各分到一些；這一場沒有「泡麵」；記 TYPHOON_Y2_KAI
  ty3     9-1／5-3：2027-10-13（三）20:00 宿舍（ROOM_Y3、【捷徑】阿凱 FAMILIAR、TYPHOON_Y2_KAI）——豆漿之夜：兩杯熱豆漿、去年也是我、選項換豆漿；舊的泡麵句不在
  kai5    第 7 節第 6 項：【捷徑】KAI_K5＝bug（大四上 K5 選「先修 bug。」）→ 2028-11-24（五）17:05 資工系館前（醉月湖南岸長椅）走過去和阿凱說話＝「修好那天晚上……」
  tapass  第 7 節第 3 項後半：【捷徑】見過陳助教 → 2028-06-20（二）20:45 起站著等到 21:05，手機有他的「過了。」
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 aa519_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'aunt')
J = lambda o: json.dumps(o, ensure_ascii=False)
# 稿（AA_519）的字
AUNT_W1 = '坐。……你們法律系的，都坐長桌那邊。'
AUNT_SHORT = ('坐。', '老樣子？', '今天的湯比較鹹，你多喝水。')
BOSS_Y1 = ('豆子我自己烘。烘壞的那一批，我自己喝。', '芷若比我早記住客人的名字。我只記得杯子。')
BOSS_Y2 = ('拉花比賽，我贏了。……她們讓我的，我知道。', '她的班，我排給小婷。……白板上她的字，我沒擦。')
BOSS_NAME = ('兩點半？', '我以前上班，下午兩點半最想喝咖啡。……後來就不上班了。')
BOSS_SHORT = ('今天的豆子比較酸。', '坐窗邊，那裡光好。', '……嗯。')
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))

STAFF = """(kind=>{ const E=GAME.E, P=E.player.obj.position; return E.npcs.map((n,i)=>({n,i})).filter(o=>o.n&&o.n.obj&&(o.n.aa519Staff===kind||(o.n.clerk&&!o.n.aa519Staff))).map(({n,i})=>{ const h=n.obj.position, sp=n.aa519Who&&typeof HCIRCLE!=='undefined'&&HCIRCLE.specOf?HCIRCLE.specOf(n.aa519Who):null;
  return {i, kind:n.aa519Staff||null, who:n.aa519Who||null, name:n.name||'', label:n.talkLabel||null, talk:!!n.talk, clerk:!!n.clerk, hc:n.hcLabel||null, hidden:!!n.hidden, vis:n.obj.visible!==false&&!n.hidden,
    model:sp&&sp.model||null, sex:sp&&sp.sex||null, x:+h.x.toFixed(2), z:+h.z.toFixed(2), d:+Math.hypot(h.x-P.x,h.z-P.z).toFixed(2)}; }); })"""
# 他旁邊 1 m 站得住、離別人遠的那一邊（同 bbplay F.target；用 E.npcs 的位置找，店員沒有 charId）
TARGET = """(i=>{ const E=GAME.E, P=E.player.obj.position, n=E.npcs[i]; if(!n||!n.obj||n.hidden) return null; const h=n.obj.position; let dx=P.x-h.x, dz=P.z-h.z; const len=Math.hypot(dx,dz)||1; dx/=len; dz/=len;
  let tx=h.x+dx, tz=h.z+dz; for(let k=0;k<12;k++){ const a=((k&1)?1:-1)*Math.ceil(k/2)*Math.PI/6, c=Math.cos(a), s=Math.sin(a); for(const r of [1.0,1.4,0.8]){ const x=h.x+(dx*c-dz*s)*r, z=h.z+(dx*s+dz*c)*r; if(!E.canStand||E.canStand(x,z,0.3,n.lv|0)){ tx=x; tz=z; k=99; break; } } }
  const it=document.getElementById('interact'), l=(it&&!it.classList.contains('hide'))?((document.getElementById('interactLabel')||{}).textContent||''):'';
  return {tx:+tx.toFixed(2),tz:+tz.toFixed(2),want:n.talkLabel||('和'+n.name+'說話'),lab:l,d:+Math.hypot(P.x-h.x,P.z-h.z).toFixed(2)}; })"""


async def talk_staff(pg, cdp, run, i, tag, picks=()):
    """像玩家一樣走到那位店員旁邊，按鈕變成「和〈他〉說話」再按，點完對話"""
    for k in range(3):
        g = await pg.evaluate(TARGET, i)
        if not g: run.note('%s：那位不在（或藏著）' % tag); return None
        if g['lab'] != g['want']:
            await L.go_to(pg, cdp, run, g['tx'], g['tz'], 0.5, '%s：他旁邊（第 %d 輪）' % (tag, k + 1), max_s=150, stop=lambda s, w=g['want']: s['interact'].startswith(w))
            await pg.wait_for_timeout(600); g = await pg.evaluate(TARGET, i)
            if not g or g['lab'] != g['want']: run.note('%s：按鈕是「%s」（要「%s」）、離他 %s m' % (tag, g and g['lab'], g and g['want'], g and g['d'])); continue
        await L.tap(pg, cdp, '#interact')
        r = await P.dialog(pg, cdp, run, picks, max_s=120, tag=tag)
        if r['started']: r['label'] = g['want']; return r
        run.note('%s：按了沒有開始說話，再走一次' % tag)
    return None


def said(r, who=None):
    return [t for nm, t in (r or {}).get('lines', []) if who is None or nm == who]


async def rooms(pg, key):
    d = await pg.evaluate("STORY.dayOfKey(%s)" % J(key)); fl = {}
    for k, kk in ROOMS:
        dd = await pg.evaluate("STORY.dayOfKey(%s)" % J(kk))
        if dd <= d: fl[k] = dd
    if 'ROOM_Y4' in fl: fl.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
    if 'ROOM_Y3' in fl: fl.update({'ROOM_Y3_ITEMS': [], 'ROOM_Y3_DISCARD': None})
    return fl


async def wait_event(pg, cdp, ev, max_s=300):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['running'] == ev or (s['dlg'] and await pg.evaluate("(id=>!!(EVENTS.running===id))(%s)" % J(ev))): return True
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp)
        await pg.wait_for_timeout(1500)
    return False


async def main():
    run = L.Run('aa519_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)

        if MODE == 'aunt':
            st, d = await P.base(pg, SAVE, ['Y1S1', 2, 2], 12.5, 'noodle'); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（大一上第 %s 週週二）12:30 麵店' % (d['key'], d['week']))
            await pg.wait_for_timeout(4000); S = await pg.evaluate(STAFF, 'noodle'); run.note('店裡的店員：%s' % J(S))
            vis = [s for s in S if s['vis']]; a = [s for s in vis if s['who'] == 'hc_ayi']
            run.check('1-1 櫃台是阿姨（hc_ayi、名字「阿姨」、中年底模 char.npc_nf3）', len(a) == 1 and a[0]['name'] == '阿姨' and a[0]['model'] == 'char.npc_nf3', J(vis))
            run.check('1-1 沒有別的店員（舊的年輕女店員 clerk(...,40) 不在）', len(vis) == 1, J(vis))
            await run.shot(pg, 'aunt_noon')
            if a:
                r1 = await talk_staff(pg, cdp, run, a[0]['i'], 'aunt_1'); await run.shot(pg, 'aunt_talk1')
                run.check('1-2 按鈕是「和阿姨說話」', bool(r1) and r1.get('label') == '和阿姨說話', J(r1 and r1.get('label')))
                run.check('1-2 第一次＝大一上第 1～6 週那一句「%s」（說話的是阿姨）' % AUNT_W1, AUNT_W1 in said(r1, '阿姨'), J(r1 and r1['lines']))
                r2 = await talk_staff(pg, cdp, run, a[0]['i'], 'aunt_2')
                run.check('1-2 同一天第二次＝短句（坐。／老樣子？／今天的湯比較鹹）', any(t in AUNT_SHORT for t in said(r2, '阿姨')), J(r2 and r2['lines']))
            await P.jump(pg, cdp, run, ['Y1S1', 2, 2], 18.35, zone='noodle', pos=None, note='同一份進度（剛才跟阿姨說過話）；語彤週二 17:30～20:30 顧店')
            await pg.wait_for_timeout(5000); S2 = await pg.evaluate(STAFF, 'noodle'); yt = await P.who(pg, 'heroine_03'); run.note('18:20 店員：%s；語彤 %s' % (J(S2), J(yt)))
            v2 = [s for s in S2 if s['vis']]
            run.check('8-1／1-1 語彤顧店的時段：看得到的阿姨只有一位（櫃台那位和圈子表那位不同時出現）', len([s for s in v2 if s['who'] == 'hc_ayi']) == 1, J(v2))
            a2 = [s for s in v2 if s['who'] == 'hc_ayi']
            if a2:
                r3 = await talk_staff(pg, cdp, run, a2[0]['i'], 'aunt_3'); await run.shot(pg, 'aunt_evening')
                run.check('1-1 同一個人、同一份紀錄：今天的新句說過了＝這一次是短句', bool(r3) and any(t in AUNT_SHORT for t in said(r3, '阿姨')) and AUNT_W1 not in said(r3), J(r3 and r3['lines']))

        elif MODE == 'cafe':
            st, d = await P.base(pg, SAVE, ['Y1S1', 2, 2], 15.5, 'cafe'); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（大一上第 %s 週週二）15:30 Café' % (d['key'], d['week']))
            await pg.wait_for_timeout(4000); S = await pg.evaluate(STAFF, 'cafe'); zr = await P.who(pg, 'heroine_02'); run.note('店員：%s；芷若 %s' % (J(S), J(zr)))
            vis = [s for s in S if s['vis']]; bo = [s for s in vis if s['who'] == 'hc_boss']
            run.check('3-1 芷若不在班：櫃台是老闆（hc_boss、男、char.npc_nm6、名字「老闆」）', len(bo) == 1 and bo[0]['name'] == '老闆' and bo[0]['sex'] == 'm' and bo[0]['model'] == 'char.npc_nm6', J(vis))
            run.check('3-1 沒有年輕女店員（clerk(...,44) 不在）', not [s for s in vis if s['clerk'] and not s['who']], J(vis))
            await run.shot(pg, 'cafe_boss')
            if bo:
                r1 = await talk_staff(pg, cdp, run, bo[0]['i'], 'boss_1'); await run.shot(pg, 'boss_talk1')
                t1 = said(r1, '老闆')
                run.check('3-1 第一次＝大一那兩句之一，或店名由來（點餐第 3 次以後）', any(t in BOSS_Y1 or t in BOSS_NAME for t in t1), J(r1 and r1['lines']))
                r2 = await talk_staff(pg, cdp, run, bo[0]['i'], 'boss_2')
                run.check('3-1 同一天第二次＝短句', any(t in BOSS_SHORT for t in said(r2, '老闆')), J(r2 and r2['lines']))

        elif MODE == 'cafe27':
            key = '2027-06-10'; fl = await rooms(pg, key)
            slot = await pg.evaluate("""(k=>{ const d=STORY.dayOfKey(k), o=[]; for(let h=11;h<26.5;h+=0.25){ const G=Object.assign({},GAME.G,{day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7}); o.push([h,!!EAT.cafeXt(G)]); } return o; })(%s)""" % J(key))
            xt = [h for h, v in slot if v]; bs = [h for h, v in slot if not v and 13 <= h <= 18]
            run.note('%s EAT.cafeXt：小婷站櫃台的時間 %s' % (key, J(xt)))
            run.check('前置：那一天有芷若原本的班（小婷站櫃台的時間）', bool(xt), J(slot))
            if xt:
                hx = xt[1] if len(xt) > 1 else xt[0]
                st, d = await P.base(pg, SAVE, key, hx, 'cafe', flags=fl); await P.load(pg, cdp, st)
                run.setup('[前置] 使用者存檔 → %s %.2f Café（芷若原本的班）；ROOM 旗標 %s' % (key, hx, J(fl)))
                await pg.wait_for_timeout(4000); S = await pg.evaluate(STAFF, 'cafe'); vis = [s for s in S if s['vis']]; run.note('店員：%s' % J(S))
                x1 = [s for s in vis if s['clerk'] and s['who'] == 'hc_xt']
                run.check('9-3 芷若原本的班：櫃台是小婷（hc_xt、名字「小婷」、不能說話）', len(x1) == 1 and x1[0]['name'] == '小婷' and not x1[0]['talk'], J(vis))
                run.check('9-3 那時候櫃台不是老闆', not [s for s in vis if s['clerk'] and s['who'] == 'hc_boss'], J(vis))
                await run.shot(pg, 'cafe27_xt')
            if bs:
                hb = bs[len(bs) // 2]
                st, d = await P.base(pg, SAVE, key, hb, 'cafe', flags=fl); await P.load(pg, cdp, st)
                run.setup('[前置] 使用者存檔 → %s %.2f Café（不是芷若的班）' % (key, hb))
                await pg.wait_for_timeout(4000); S = await pg.evaluate(STAFF, 'cafe'); vis = [s for s in S if s['vis']]; run.note('店員：%s' % J(S))
                bo = [s for s in vis if s['clerk'] and s['who'] == 'hc_boss']
                run.check('9-3 其他時間：櫃台是老闆', len(bo) == 1 and bo[0]['name'] == '老闆', J(vis))
                await run.shot(pg, 'cafe27_boss')
                if bo:
                    r1 = await talk_staff(pg, cdp, run, bo[0]['i'], 'boss27')
                    run.check('3-1 大二的老闆＝「拉花比賽……」或「她的班，我排給小婷……」（6/4 芷若走以後）', any(t in BOSS_Y2 for t in said(r1, '老闆')), J(r1 and r1['lines']))
            # 待在店裡跨過班表的時間：小婷接班那一刻之前 6 分鐘進店，站著等
            if xt:
                h0 = xt[0]; st, d = await P.base(pg, SAVE, key, h0 - 0.1, 'cafe', flags=fl); await P.load(pg, cdp, st, quiet=True)
                run.setup('[前置] %s %.2f Café（小婷 %.2f 接班之前 6 分鐘），站著等' % (key, h0 - 0.1, h0))
                b0 = [s for s in await pg.evaluate(STAFF, 'cafe') if s['vis'] and s['clerk']]
                ok = await P.wait_hour(pg, cdp, h0 + 0.05, max_s=480)
                await pg.wait_for_timeout(3000); b1 = [s for s in await pg.evaluate(STAFF, 'cafe') if s['vis'] and s['clerk']]
                run.note('接班前 %s → 接班後 %s（等到了 %s，%s）' % (J([s['who'] for s in b0]), J([s['who'] for s in b1]), ok, J(await P.clock(pg))))
                if ok:
                    run.check('9-3 待在店裡跨過班表：櫃台當場換成小婷', [s['who'] for s in b0] == ['hc_boss'] and [s['who'] for s in b1] == ['hc_xt'], J({'前': b0, '後': b1}))
                    await run.shot(pg, 'cafe27_switch')
                else: run.note('NOT_TESTED 9-3 當場換人：8 分鐘內遊戲時間沒有走到 %.2f' % (h0 + 0.05))

        elif MODE in ('ty2', 'ty3'):
            key, h, ev = ('2026-10-19', 20.9, 'ev_y2_typhoon_kai') if MODE == 'ty2' else ('2027-10-13', 19.9, 'ev_typhoon_y3_noodle')
            fl = await rooms(pg, key)
            if MODE == 'ty3': fl['TYPHOON_Y2_KAI'] = await pg.evaluate("STORY.dayOfKey('2026-10-19')")
            st, d = await P.base(pg, SAVE, key, h, 'dorm', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s %.2f 宿舍；旗標 %s%s' % (key, h, J(fl), '（TYPHOON_Y2_KAI＝【捷徑】大二颱風那晚他有來）' if MODE == 'ty3' else ''))
            if MODE == 'ty3':
                await P.prep(pg, cdp, run, """(()=>{ const r=SOCIAL.rel('kai'); r.fam=Math.max(r.fam||0,25); const G=GAME.G, so=G.social||(G.social={}), U=so.relUp||(so.relUp={}); if((U.kai|0)<2) U.kai=2; return {stage:SOCIAL.stage?SOCIAL.stage('kai'):null, typhoon:!!CALENDAR.typhoon(G.day), weather:G.weather}; })()""", label='阿凱至少 FAMILIAR')
            pre = await pg.evaluate("""(id=>{ const e=STORY_EVENTS.find(x=>x&&x.id===id)||{}; const G=GAME.G; return {title:e.title, done:!!(G.events&&G.events.done&&G.events.done[id]), typhoon:!!CALENDAR.typhoon(G.day), room:G.flags.ROOM_Y2, h:+G.hour.toFixed(2), zone:G.zone, n0:(G.msgs||[]).length}; })(%s)""" % J(ev))
            run.note('前置：%s' % J(pre))
            run.check('9-1 標題＝%s' % ('滷味之夜' if MODE == 'ty2' else '豆漿之夜'), pre['title'] == ('滷味之夜' if MODE == 'ty2' else '豆漿之夜'), J(pre['title']))
            await P.events_on(pg)
            got = await wait_event(pg, cdp, ev, max_s=420)
            run.check('事件 %s 照玩家站在宿舍就開始' % ev, got, J(await P.ts(pg)))
            r = await P.dialog(pg, cdp, run, ['（遞毛巾）', '喝掉阿凱的豆漿', '「一人一杯。」'], max_s=300, tag=MODE, shots=True) if got else {'lines': [], 'opts': []}
            post = await pg.evaluate("""(([id,n0])=>{ const G=GAME.G; return {done:!!(G.events&&G.events.done&&G.events.done[id]), flag:G.flags.TYPHOON_Y2_KAI==null?null:G.flags.TYPHOON_Y2_KAI, msgs:(G.msgs||[]).slice(n0).map(m=>m.text)}; })(%s)""" % J([ev, pre['n0']]))
            txt = said(r) + post['msgs']; opts = [o for os_ in r.get('opts', []) for o in os_]
            run.note('事件後：%s' % J(post)); await run.shot(pg, MODE + '_end')
            if MODE == 'ty2':
                for w in ('手上這次是一袋滷味', '先擦頭啦，滷味又不會跑。', '各分到一些'):
                    run.check('9-1 大二有「%s」' % w, any(w in t for t in txt), J(txt))
                run.check('9-1 手機那一則＝「下雨又怎樣 滷味我都買了」', any('下雨又怎樣 滷味我都買了' in t for t in txt), J(txt))
                run.check('9-1 這一場沒有「泡麵」', not [t for t in txt if '泡麵' in t], J([t for t in txt if '泡麵' in t]))
                run.check('5-3 記 TYPHOON_Y2_KAI（大三「去年也是我」讀它）', post['flag'] is not None, J(post['flag']))
            else:
                run.check('5-3 大三「手上兩杯熱豆漿。……泡麵，他說他不想再吃了。」', any('手上兩杯熱豆漿' in t and '他說他不想再吃了' in t for t in txt), J(txt))
                run.check('5-3 大二颱風那晚有來＝「去年也是我。」', any('去年也是我' in t for t in txt), J(txt))
                run.check('9-1 舊的泡麵句不在（舉起泡麵、吃掉阿凱的泡麵、拆了第一包、一人一包）', not [t for t in txt + opts if any(w in t for w in ('舉起泡麵', '吃掉阿凱的泡麵', '拆了第一包', '一人一包'))], J(txt + opts))
                run.check('9-1 大三選了豆漿那一支（「這是不可抗力嗎？」或「兩杯。颱風天。」）', any(w in t for t in txt for w in ('這是不可抗力嗎？', '兩杯。颱風天。')), J({'opts': r.get('opts'), 'picked': r.get('picked')}))
            run.check('事件演完（events.done）', post['done'], J(post))

        elif MODE == 'kai5':
            key = '2028-11-24'; fl = await rooms(pg, key); fl['KAI_K5'] = 'bug'
            st, d = await P.base(pg, SAVE, key, 17.08, 'campus', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（大四上）17:05 校園；【捷徑】KAI_K5＝bug（K5 選「先修 bug。」）；%s' % (key, J(fl)))
            await P.place_near(pg, run, -29, -99.96, R=9, what='資工系館前（醉月湖南岸長椅）')
            kw = await P.wait_present(pg, 'kai', 60); run.note('阿凱：%s' % J(kw))
            run.check('5-1 週五 17:00～18:00 阿凱在資工系館前（離長椅 2 m 內）', bool(kw) and not kw['hidden'] and abs(kw['x'] + 29) < 2 and abs(kw['z'] + 99.96) < 2, J(kw))
            r = await P.talk_to(pg, cdp, run, 'kai', 'kai5', max_s=300); await run.shot(pg, 'kai5')
            run.check('第 7 節第 6 項：K5 選「先修 bug。」＝「你說先修 bug。……修好那天晚上，我睡了十個小時。」', any('修好那天晚上，我睡了十個小時' in t for t in said(r)), J(r and r['lines']))

        elif MODE == 'tapass':
            key = '2028-06-20'; fl = await rooms(pg, key)
            st, d = await P.base(pg, SAVE, key, 20.75, 'dorm', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → %s（二）20:45 宿舍' % key)
            await P.prep(pg, cdp, run, "(()=>{ if(!SOCIAL.has('npc_ta_chen','FIRST_MET')) SOCIAL.meet('npc_ta_chen','classroom'); return SOCIAL.has('npc_ta_chen','FIRST_MET'); })()", label='見過陳助教')
            ok = await P.wait_hour(pg, cdp, 21.08, max_s=540)
            m = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m.from==='npc_ta_chen').map(m=>({t:m.text,d:m.day,h:m.h==null?null:+(+m.h).toFixed(2)})))()")
            run.note('等到 21:05：%s；陳助教的訊息 %s' % (ok, J(m)))
            run.check('2-3 2028-06-20 21:00 收到陳助教「過了。」', ok and any(x['t'] == '過了。' for x in m), J(m))
            await run.shot(pg, 'tapass')

        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
