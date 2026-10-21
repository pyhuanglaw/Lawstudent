"""BB（帳號 A）2026-10-21：AA372-Y1S1-FIX-1021（LAWWW 20:37，開發分支 72560881 起）法律系大一上「知道太早、重複、作廢設定」——第一部分：讀使用者存檔（9/25，第 9 天）做得到的五項＋邀約旁白的 bug。
  fair      9/30 12:00 社團博覽會：法服按鈕小字「隔週週六上午，萬才館一樓（法律服務）」，沒有「每週三 19:00–21:00」「研討室 A」
  xinci     芯慈借筆記只演一次：10/15、10/20、10/22 在霖澤館 201 各找她一次（舊版冷卻 3 天，三天都會演）
  bohan     柏翰「考古題」只演一次：10/14、10/16、10/20 在總圖閱覽室
  mingxuan  明軒「球場」只演一次：9/26、9/30、10/2 校園（朋友頁「帶我去」）
  an4       以安第 4 週：9/26（五）17:10 Café 說「這個週末我要回台中。」→ 9/27 15:00 Café 沒有她、朋友頁「回台中，不在臺北。」；對照 10/4 15:00 Café 有她；
            9/26 約她「明天」→ 旁白應該是「沈以安回台中，不在臺北。」（子代理讀碼：INV.reply 用今天的 presence，會說「這學期不在學校。」）
  ps        沛珊單數週：10/3（五）17:10 閱覽室「我要去搭客運回台中了，下禮拜見！」、9/26（五）不說；10/4 朋友頁「回台中，不在臺北。」；
            10/4 15:30 迪化街不會遇到她（舊版那天會遇到）、11/22 會遇到；10/3 約她「明天」的旁白（同一個 bug）
  rain      語彤雨天：10/13（颱風假，整天下雨）18:30 總圖門口 → 選「便利商店應該有賣。」→ 日誌「雨天在總圖門口遇到一個借傘的女生」，沒有「陳語彤」
【前置】讀使用者 9/25 存檔改日期、時間、地點；沛珊、以安的聯絡方式和熟悉度（約人要有聯絡方式；迪化街要「認識」以上）、語彤雨天的天氣，都寫在 setup。之後照玩家：走過去、按說話、手機朋友頁、約人、捷運、選項。
不是 iPhone：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。第 2、4 項（9/4 家族群組、9/4 民總「前排的女生」）要從新遊戲玩，在第二部分。
用法：LW_TESTS=<開發分支>/tests python3 aa372_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>（SCEN=fair,xinci,...）"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', '').split(',') if os.environ.get('SCEN') else None
bad = []; results = {}
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const k=()=>{ try{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push(k()+' '+(n?n+'：':'')+t); }catch(e){} return o.apply(this,arguments); };
  const ot=GAME.toast; GAME.toast=function(t){ try{ window.__LOG.push(k()+' TOAST:'+t); }catch(e){} return ot.apply(this,arguments); };
  if(GAME.caption){ const c=GAME.caption; GAME.caption=function(t){ try{ window.__LOG.push(k()+' CAPTION:'+String(t).replace(/<[^>]+>/g,'｜')); }catch(e){} return c.apply(this,arguments); }; }
  if(GAME.say){ const s=GAME.say; GAME.say=function(n,t){ try{ const nm=typeof n==='string'?n:(n&&n.name)||''; window.__LOG.push(k()+' SAY:'+nm+'｜'+(typeof t==='string'?t:'')); }catch(e){} return s.apply(this,arguments); }; } })()"""


def chk(sc, ok, what, detail=''):
    say('[%s] %s %s %s' % ('PASS' if ok else 'FAIL', sc, what, detail)); results.setdefault(sc, []).append({'ok': ok, 'what': what, 'detail': detail})
    if not ok: bad.append('%s：%s %s' % (sc, what, detail))


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()||'(空)']; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); return c[2]


async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.childNodes[0]?(b.childNodes[0].textContent||'').trim():b.textContent.trim(), full:b.textContent.trim(), hint:((b.querySelector('.hint')||{}).textContent||'').trim()}))")


async def pick(pg, cdp, start):
    return await tap_js(pg, cdp, "[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(start))


async def phone_open(pg):
    return await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()")


async def close_phone(pg, cdp):
    if await phone_open(pg): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)


async def drain(pg, cdp, pref=(), secs=120):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(380); continue
        if s['choices']:
            cs = await choices(pg); t = next((c['full'] for w in pref for c in cs if c['full'].startswith(w)), None) or cs[0]['full']
            await pick(pg, cdp, t); say('   ▶ %s ／ %s' % (t[:26], [c['full'][:12] for c in cs])); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await phone_open(pg): await close_phone(pg, cdp); continue
        await pg.wait_for_timeout(700); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return


async def load(pg, run, base, key, h, zone, pos=None, js='', why='', weather=None):
    G = json.loads(json.dumps(base)); G = G.get('G', G)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); G.update({'day': d, 'hour': h, 'zone': zone, 'pos': pos, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    if weather: G['weather'] = weather
    await L.load_state(pg, G); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
    if js: await pg.evaluate("(()=>{ const G=GAME.G, D=k=>STORY.dayOfKey(k), LV=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); }; %s })()" % js)
    run.setup('[前置] %s：使用者 9/25 存檔改到 %s %.2f %s%s%s' % (why, key, h, zone, '（天氣 %s）' % weather if weather else '', '；console：' + js if js else ''))


async def lines(pg):
    return await pg.evaluate("window.__LOG||[]")


async def talk_to(pg, cdp, run, cid, name, pref=(), tries=2):
    """走到那個人旁邊，互動鈕是「和〇〇說話」才按；回傳這次新增的台詞"""
    n0 = len(await lines(pg)); said = []
    for k in range(tries):
        pos = await pg.evaluate("(id=>{ const n=(GAME.npc||{})[id]||(GAME.E.npcs||[]).find(x=>x&&x.charId===id); if(!n||!n.obj||n.obj.visible===false||n.hidden) return null; const p=n.obj.position; return [p.x,p.z]; })(%s)" % json.dumps(cid))
        if not pos: say('   %s 不在這一區' % name); return None
        await L.go_to(pg, cdp, run, pos[0], pos[1], 1.2, name, max_s=90)
        lab = ''
        for j in range(6):
            lab = await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')?b.textContent.trim():''; })()")
            if name in lab or ('說話' in lab and k > 0): break
            pos = await pg.evaluate("(id=>{ const n=(GAME.npc||{})[id]||(GAME.E.npcs||[]).find(x=>x&&x.charId===id); if(!n||!n.obj) return null; const p=n.obj.position; return [p.x,p.z]; })(%s)" % json.dumps(cid))
            if pos: await L.go_to(pg, cdp, run, pos[0], pos[1], 0.9, name, max_s=30)
            await pg.wait_for_timeout(500)
        say('   互動鈕：「%s」' % lab)
        if '說話' not in lab: continue
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); await drain(pg, cdp, pref=pref, secs=120)
        said = (await lines(pg))[n0:]
        if said: break
    say('   說了：%s' % json.dumps(said[-8:], ensure_ascii=False)); return said


async def friends_row(pg, cdp, name):
    await tap_js(pg, cdp, "document.getElementById('btnPhone')"); await pg.wait_for_timeout(800)
    await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"friends\"]')")
    r = await pg.evaluate("(nm=>{ const rows=[...document.querySelectorAll('#phoneBody .item')]; const r=rows.find(e=>(e.innerText||'').includes(nm)); if(!r) return null; return {text:r.innerText.replace(/\\n/g,'｜'), inv:!!r.querySelector('[data-inv]'), find:!!r.querySelector('[data-find]'), muted:[...r.querySelectorAll('.muted')].map(x=>x.textContent.trim())}; })(%s)" % json.dumps(name))
    return r


async def invite(pg, cdp, run, cid, when='明天'):
    """手機朋友頁「約」→ 地點選第一個（不是「算了」）→ 時間選 when 開頭的 → 回傳之後的台詞"""
    n0 = len(await lines(pg))
    if not await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"%s\"]')" % cid): return None, '沒有「約」'
    cs = await choices(pg)
    if not cs:
        for k in range(10):
            await pg.wait_for_timeout(500); cs = await choices(pg)
            if cs: break
    place = next((c['full'] for c in cs if not c['full'].startswith('算了')), None); say('   約：地點 %s' % [c['full'][:12] for c in cs])
    if not place: return None, '沒有地點'
    await pick(pg, cdp, place); await pg.wait_for_timeout(900); cs = await choices(pg); say('   約：時間 %s' % [c['full'][:12] for c in cs])
    t = next((c['full'] for c in cs if c['full'].startswith(when)), None)
    if not t: return None, '沒有「%s」的時間（%s）' % (when, [c['full'][:12] for c in cs])
    await pick(pg, cdp, t); await pg.wait_for_timeout(1200); await drain(pg, cdp, secs=60)
    return (await lines(pg))[n0:], t


# ---------- 1 社團博覽會 ----------
async def s_fair(pg, cdp, run, base):
    for key in ('2025-09-30', '2025-10-01'):
        await load(pg, run, base, key, 12.0, 'campus', {'x': -13.5, 'z': 11.6}, why='fair')
        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/社團博覽會/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
        if not it: chk('fair', False, '%s 沒有「社團博覽會」互動點' % key); continue
        await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=60); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        cs = []
        for k in range(20):
            s = await L.state(pg)
            if s['choices']: cs = await choices(pg); break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        await run.shot(pg, 'fair_%s' % key[5:]); say('   %s 攤位：%s' % (key, json.dumps(cs, ensure_ascii=False)))
        fz = next((c for c in cs if c['full'].startswith('法服')), None)
        chk('fair', bool(fz) and '隔週週六上午' in fz['hint'], '%s 法服的小字「隔週週六上午…」' % key, fz['hint'] if fz else '（沒有法服）')
        allx = ' '.join(c['full'] for c in cs)
        chk('fair', '每週三 19:00' not in allx and '研討室 A' not in allx, '%s 沒有「每週三 19:00–21:00」「研討室 A」' % key)
        await pick(pg, cdp, '逛完了'); await drain(pg, cdp, secs=30)


# ---------- 3 只演一次 ----------
ONCE = {
  'xinci': ('classmate_xinci', '吳芯慈', [('2025-10-15', 9.6, 'classroom'), ('2025-10-20', 9.6, 'classroom'), ('2025-10-22', 9.6, 'classroom')], '我上週民總請假，你筆記可以借我看一下嗎？', ['「可以，給。」']),
  'bohan': ('classmate_bohan', '許柏翰', [('2025-10-14', 16.0, 'library'), ('2025-10-16', 16.0, 'library'), ('2025-10-20', 16.0, 'library')], '……我覺得我念得太少。你一天念幾小時？', []),
  'mingxuan': ('classmate_mingxuan', '江明軒', [('2025-09-26', 16.0, 'campus'), ('2025-09-30', 16.0, 'campus'), ('2025-10-02', 16.0, 'campus')], '週五練球缺人，來不來？', []),
}


async def s_once(pg, cdp, run, base, which):
    cid, name, days, line, pref = ONCE[which]; st = None; seen = []
    for i, (key, h, zone) in enumerate(days):
        if st is None: await load(pg, run, base, key, h, zone, why='%s 第 %d 次' % (which, i + 1))
        else:
            d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); st.update({'day': d, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
            await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK); run.setup('[前置] %s 第 %d 次：同一份狀態（上一次說過話以後）改到 %s %.2f %s' % (which, i + 1, key, h, zone))
        if zone == 'campus':   # 明軒在校園走動：朋友頁「帶我去」
            r = await friends_row(pg, cdp, name)
            if r and r['find']: await tap_js(pg, cdp, "document.querySelector('#phoneBody [data-find=\"%s\"]')" % cid); await pg.wait_for_timeout(1500); await drain(pg, cdp, secs=90)
            await close_phone(pg, cdp)
        said = await talk_to(pg, cdp, run, cid, name, pref=pref)
        hit = bool(said) and any(line in l for l in said); seen.append((key, said is not None, hit))
        await run.shot(pg, '%s_%d' % (which, i + 1))
        st = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())")); st = st.get('G', st)
    say('   %s：%s' % (which, seen)); done = await pg.evaluate("((GAME.G.events||{}).done||{})")
    n = sum(1 for k, ok, hit in seen if hit)
    chk(which, n == 1 and seen[0][2], '三天各找一次，「%s」只在第一次演' % line[:14], json.dumps(seen, ensure_ascii=False))


# ---------- 5 以安第 4 週 ----------
async def s_an4(pg, cdp, run, base):
    js = "G.contacts=G.contacts||{}; G.contacts.heroine_01=D('2025-09-05');"
    await load(pg, run, base, '2025-09-26', 17.1, 'cafe', js=js, why='an4 週五 Café（加以安的聯絡方式）')
    said = await talk_to(pg, cdp, run, 'heroine_01', '以安', tries=1) or []
    if not any('這個週末我要回台中。' in l for l in said): said += await talk_to(pg, cdp, run, 'heroine_01', '以安', tries=1) or []
    chk('an4', any('這個週末我要回台中。' in l for l in said), '9/26（五）17:10 Café：以安「這個週末我要回台中。」', json.dumps(said[-4:], ensure_ascii=False))
    r = await friends_row(pg, cdp, '沈以安'); say('   朋友頁（週五）：%s' % json.dumps(r, ensure_ascii=False))
    out, t = await invite(pg, cdp, run, 'heroine_01', '明天')
    say('   週五約她「%s」：%s' % (t, json.dumps(out, ensure_ascii=False)))
    if out is not None:
        txt = ' '.join(out)
        chk('an4', '回台中' in txt and '這學期不在學校' not in txt, '週五約「明天」：旁白說她回台中（不是「這學期不在學校」）', json.dumps(out[-2:], ensure_ascii=False))
    else: chk('an4', False, '週五約不了她', t)
    await close_phone(pg, cdp)
    await load(pg, run, base, '2025-09-27', 15.0, 'cafe', js=js, why='an4 週六 Café')
    there = await pg.evaluate("(()=>{ const n=(GAME.npc||{}).heroine_01; return !!(n&&n.obj&&n.obj.visible!==false&&!n.hidden&&GAME.G.zone==='cafe'); })()")
    r = await friends_row(pg, cdp, '沈以安'); await run.shot(pg, 'an4_sat_friends'); await close_phone(pg, cdp)
    say('   9/27 Café 有沒有她：%s；朋友頁：%s' % (there, json.dumps(r, ensure_ascii=False)))
    chk('an4', not there, '9/27（六）15:00 Café 沒有以安')
    chk('an4', bool(r) and not r['inv'] and any('回台中，不在臺北。' in m for m in r['muted'] + [r['text']]), '9/27 朋友頁：沒有「約」、寫「回台中，不在臺北。」', json.dumps(r, ensure_ascii=False))
    await load(pg, run, base, '2025-10-04', 15.0, 'cafe', js=js, why='an4 對照 10/4（六）Café')
    there = await pg.evaluate("(()=>{ const n=(GAME.npc||{}).heroine_01; return !!(n&&n.obj&&n.obj.visible!==false&&!n.hidden); })()")
    chk('an4', there, '對照：10/4（六）15:00 Café 有以安')


# ---------- 6 沛珊單數週 ----------
async def s_ps(pg, cdp, run, base):
    js = "LV('classmate_peishan',30,20,20); G.contacts=G.contacts||{}; G.contacts.classmate_peishan=D('2025-09-10');"
    for key, want in (('2025-10-03', True), ('2025-09-26', False)):
        await load(pg, run, base, key, 17.1, 'library', js=js, why='ps 週五閱覽室（沛珊認識＋聯絡方式）')
        said = await talk_to(pg, cdp, run, 'classmate_peishan', '沛珊', tries=1) or []
        if want and not any('回台中了' in l for l in said): said += await talk_to(pg, cdp, run, 'classmate_peishan', '沛珊', tries=1) or []
        hit = any('我要去搭客運回台中了，下禮拜見！' in l for l in said)
        chk('ps', hit == want, '%s（%s週）沛珊%s「我要去搭客運回台中了，下禮拜見！」' % (key, '單數' if want else '雙數', '說' if want else '不說'), json.dumps(said[-3:], ensure_ascii=False))
        if key == '2025-10-03':
            out, t = await invite(pg, cdp, run, 'classmate_peishan', '明天')
            say('   週五約她「%s」：%s' % (t, json.dumps(out, ensure_ascii=False)))
            if out is not None: chk('ps', '回台中' in ' '.join(out) and '這學期不在學校' not in ' '.join(out), '10/3（五）約「明天」：旁白說她回台中（不是「這學期不在學校」）', json.dumps(out[-2:], ensure_ascii=False))
            else: chk('ps', False, '10/3 約不了她', t)
            await close_phone(pg, cdp)
    await load(pg, run, base, '2025-10-04', 15.2, 'gongguan', {'x': 0, 'z': -30}, js=js, why='ps 10/4（六）公館', weather='clear')
    r = await friends_row(pg, cdp, '郭沛珊'); await close_phone(pg, cdp); say('   10/4 朋友頁：%s' % json.dumps(r, ensure_ascii=False))
    chk('ps', bool(r) and not r['inv'] and any('回台中' in m for m in r['muted'] + [r['text']]), '10/4（單數週末）朋友頁：沒有「約」、寫回台中', json.dumps(r, ensure_ascii=False))
    for key, want in (('2025-10-04', False), ('2025-11-22', True)):
        await load(pg, run, base, key, 15.2, 'gongguan', {'x': 0, 'z': -30}, js=js, why='ps 迪化街 %s' % key, weather='clear')
        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/捷運公館站/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
        if not it: chk('ps', False, '%s 公館沒有捷運站入口' % key); continue
        await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[2], max_s=90); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        cs = await choices(pg); say('   捷運：%s' % [c['full'][:14] for c in cs])
        if not await pick(pg, cdp, '大稻埕'):
            t = next((c['full'] for c in cs if '迪化街' in c['full'] or '大稻埕' in c['full']), None)
            if t: await pick(pg, cdp, t)
            else: chk('ps', False, '%s 捷運沒有大稻埕／迪化街' % key, json.dumps([c['full'] for c in cs], ensure_ascii=False)); continue
        await pg.wait_for_timeout(2500); await drain(pg, cdp, secs=120); lg = await lines(pg); await run.shot(pg, 'ps_dihua_%s' % key[5:])
        hit = any('她在一間舊書店門口翻繪本。' in l for l in lg)
        chk('ps', hit == want, '%s 迪化街%s遇到沛珊' % (key, '會' if want else '不會'), json.dumps([l for l in lg if '沛珊' in l or '繪本' in l][:3], ensure_ascii=False))


# ---------- 7 語彤雨天 ----------
async def s_rain(pg, cdp, run, base):
    await load(pg, run, base, '2025-10-13', 18.5, 'campus', {'x': 81, 'z': 9}, why='rain 10/13 颱風假 18:30 總圖門口附近', weather='rain')
    await pg.evaluate("(()=>{ try{ GAME.G.weather='rain'; if(GAME.E.setWeather) GAME.E.setWeather('rain'); }catch(e){} })()")
    await L.go_to(pg, cdp, run, 81, 3.0, 1.0, '總圖門口', max_s=60)
    t0 = time.time(); got = False
    while time.time() - t0 < 90:
        s = await L.state(pg)
        if s['dlg'] or s['choices']: got = True; break
        await pg.wait_for_timeout(800)
    await drain(pg, cdp, pref=['「便利商店應該有賣。」'], secs=180); lg = await lines(pg)
    say('   雨天那一場：%s' % json.dumps([l for l in lg if '傘' in l or '便利商店' in l][:6], ensure_ascii=False))
    chk('rain', any('便利商店應該有賣' in l for l in lg), '10/13 雨天總圖門口那一場有演、選了「便利商店應該有賣。」')
    await tap_js(pg, cdp, "document.getElementById('btnMenu')"); await pg.wait_for_timeout(1200)
    notes = await pg.evaluate("((document.getElementById('notesList')||{}).innerText||'').replace(/\\n/g,'｜')"); await run.shot(pg, 'rain_journal')
    say('   日誌：%s' % notes[:400])
    chk('rain', '雨天在總圖門口遇到一個借傘的女生' in notes and '雨天在總圖門口遇到陳語彤' not in notes, '日誌寫「雨天在總圖門口遇到一個借傘的女生」（不是陳語彤）', notes[:160])


SCENS = [('fair', s_fair), ('xinci', lambda *a: s_once(*a, 'xinci')), ('bohan', lambda *a: s_once(*a, 'bohan')), ('mingxuan', lambda *a: s_once(*a, 'mingxuan')),
         ('an4', s_an4), ('ps', s_ps), ('rain', s_rain)]


async def main():
    run = L.Run('aa372', OUT); base = json.load(open(SAVE, encoding='utf-8')); allerrs = []
    async with async_playwright() as p:
        for name, fn in SCENS:
            if SCEN and name not in SCEN: continue
            say('== %s' % name); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await asyncio.wait_for(fn(pg, cdp, run, base), 2400)
            except asyncio.TimeoutError: chk(name, False, '超過 40 分鐘沒做完')
            except Exception as e: chk(name, False, '例外 %r' % e)
            if errs: chk(name, False, 'JS 例外', json.dumps(errs[:2], ensure_ascii=False)[:200])
            try: json.dump(await lines(pg), open(os.path.join(OUT, '%s_lines.json' % name), 'w'), ensure_ascii=False, indent=0)
            except Exception: pass
            say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        json.dump({'results': results, 'bad': bad}, open(os.path.join(OUT, 'aa372.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        for k, v in results.items(): run.check('%s：%d／%d 項' % (k, sum(1 for x in v if x['ok']), len(v)), all(x['ok'] for x in v), '；'.join(x['what'] for x in v if not x['ok'])[:200])
    run.finish()
asyncio.run(main())
