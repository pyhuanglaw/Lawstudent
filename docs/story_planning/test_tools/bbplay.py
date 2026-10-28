"""BB-C 10-28：瀏覽器探針共用的玩家操作（pool_aafix_probe.py、kx_moot3_probe.py 用；同一個資料夾 import bbplay）。
都是 Playwright 手機橫向模擬（SwiftShader 1–4 fps），不是 iPhone。做法照 company_priv_probe.py：
  base／load／prep／jump：使用者存檔改日期時間地點＝【前置】；用遊戲的 API 改關係、旗標＝【捷徑】，改完 GAME.snapshot() 再讀一次（區域照新的狀態重建）
  talk_to：像玩家一樣走到那個人旁邊（按鈕變成「和〈他〉說話」）→ 按 → 點對話；選項照 picks（開頭符合），沒有就「就這樣」／婉拒的那一個，再沒有就第一個
  phone_*：手機按鈕 → 頁籤 → 點那一個對話 → 點回覆鍵（data-ask）；person_page：手機「朋友」→ 那個人
  captions：#caption 每一次變化（文字、看得到與否、遊戲時間）——字幕疊不疊、出了幾秒
條件事件：load(quiet=True) 用 playlib 的 quiet_events（關 EVENTS.onEnter／tick、手機自動打開）；events_on() 還原成遊戲原本的函式（HELPERS 在第一次讀檔前記下來）。"""
import json, time, copy, math
import playlib as L

J = lambda o: json.dumps(o, ensure_ascii=False)
DECLINE = ('「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」', '就這樣', '算了', '不用了', '先這樣', '沒事')

HELPERS = r"""(()=>{ if(window.__BBP) return 'again';
  const W=window.__BBP={cap:[],evo:{a:EVENTS.onEnter,b:EVENTS.tick}};
  const el=document.getElementById('caption'); if(el){ let last='', vis=false;
    const rec=()=>{ const t=(el.textContent||'').trim(), v=!el.classList.contains('hide')&&el.style.opacity!=='0';
      if(t!==last||v!==vis){ last=t; vis=v; let h=null, d=null; try{ h=+(+GAME.G.hour).toFixed(3); d=GAME.G.day; }catch(e){} W.cap.push({ms:Math.round(performance.now()),t,v,h,d}); if(W.cap.length>600) W.cap.splice(0,300); } };
    new MutationObserver(rec).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); }
  const npc=id=>{ const E=GAME.E; return (typeof HCIRCLE!=='undefined'&&HCIRCLE.npcOf?HCIRCLE.npcOf(GAME,id):null)||(GAME.npc&&GAME.npc[id])||E.npcs.find(m=>m.charId===id||m.id===id)||null; };
  const lab=()=>{ const it=document.getElementById('interact'); return (it&&!it.classList.contains('hide'))?((document.getElementById('interactLabel')||{}).textContent||''):''; };
  const F=window.__BBF={npc,lab};
  F.who=id=>{ const E=GAME.E, P=E.player.obj.position, n=npc(id); if(!n||!n.obj) return null; const h=n.obj.position;
    return {x:+h.x.toFixed(2),z:+h.z.toFixed(2),lv:n.lv|0,beh:n.beh||null,pose:n.pose||null,hidden:!!n.hidden,leaving:!!n.leaving,name:n.name||null,label:n.talkLabel||null,talk:!!n.talk,dMe:+Math.hypot(h.x-P.x,h.z-P.z).toFixed(2)}; };
  /* 他旁邊 1 m 站得住的地方（離別人遠的那一邊）*/
  F.target=function(id){ const E=GAME.E, P=E.player.obj.position, n=npc(id); if(!n||!n.obj||n.hidden) return null; const h=n.obj.position; let ax=0, az=0, k=0;
    for(const m of E.npcs){ if(m===n||!m.obj||m.hidden) continue; const q=m.obj.position; if(Math.hypot(q.x-h.x,q.z-h.z)<2.5){ ax+=q.x; az+=q.z; k++; } }
    let dx, dz; if(k){ dx=h.x-ax/k; dz=h.z-az/k; } else { dx=P.x-h.x; dz=P.z-h.z; } const len=Math.hypot(dx,dz)||1; dx/=len; dz/=len;
    let tx=h.x+dx, tz=h.z+dz; for(let i=0;i<8;i++){ const a=((i&1)?1:-1)*Math.ceil(i/2)*Math.PI/4, c=Math.cos(a), s=Math.sin(a), x=h.x+(dx*c-dz*s), z=h.z+(dx*s+dz*c); if(!E.canStand||E.canStand(x,z,0.3,n.lv|0)){ tx=x; tz=z; break; } }
    const want=n.talkLabel||('和'+n.name+'說話'), l=lab();
    return {hx:+h.x.toFixed(2),hz:+h.z.toFixed(2),tx:+tx.toFixed(2),tz:+tz.toFixed(2),want,lab:l,ok:l===want,d:+Math.hypot(P.x-h.x,P.z-h.z).toFixed(2)}; };
  /* 【前置】玩家站到 (x,z) R m 外站得住的地方 */
  F.placeNear=function(x,z,R,lv){ const E=GAME.E, P=E.player; lv=lv|0;
    for(const R2 of [R,R-2,R+2,R-4]){ if(R2<2) continue; for(let i=0;i<16;i++){ const a=i*Math.PI/8, px=x+Math.sin(a)*R2, pz=z+Math.cos(a)*R2; if(E.canStand&&!E.canStand(px,pz,0.35,lv)) continue;
      E.placeAt(P,px,pz,lv); P.path=null; return {x:+px.toFixed(2),z:+pz.toFixed(2),R:R2}; } }
    return null; };
  F.ts=function(){ const D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg');
    return {dlg:!!(D&&D.active),name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
      txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim():'',
      ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>({t:(b.textContent||'').trim(),dim:b.classList.contains('dim')||b.disabled})):[],
      busy:!!GAME.E.player.busy,depth:(D&&D.busyDepth)|0,phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),running:(typeof EVENTS!=='undefined'&&EVENTS.running)||null,
      h:+(+GAME.G.hour).toFixed(3),day:GAME.G.day,zone:GAME.G.zone,lab:lab()}; };
  F.clock=()=>({day:GAME.G.day,key:CALENDAR.dateOf(GAME.G.day).key,h:+(+GAME.G.hour).toFixed(3),zone:GAME.G.zone});
  return 'ok'; })()"""

# 'YYYY-MM-DD'、[學期, 第幾週, 星期 1–7]、或 {'from':'YYYY-MM-DD','wd':[1,3]}（那天起第一個星期幾、不是假日）
DAY_JS = """a=>{ let d; if(Array.isArray(a)) d=STORY.termDay(a[0],a[1],a[2]); else if(a&&typeof a==='object'){ d=STORY.dayOfKey(a.from); for(let i=0;i<60;i++,d++){ const w=CALENDAR.dateOf(d).wd%7; if(a.wd.includes(w)&&!(CALENDAR.holiday&&CALENDAR.holiday(d))) break; } } else d=STORY.dayOfKey(a);
  if(d==null) return null; const c=CALENDAR.dateOf(d), t=CALENDAR.termOf?CALENDAR.termOf(d):null; return {d, wd:c.wd===7?0:c.wd, key:c.key, hol:!!(CALENDAR.holiday&&CALENDAR.holiday(d)), term:t&&t.id, week:t&&t.week}; }"""
CHOICE_AT_JS = "k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]||b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }"


def clean(seen):
    """對話框逐字出現：只留每一句最後完整的那一版（[名字, 句子]）"""
    out = []
    for nm, t in seen:
        if out and out[-1][0] == nm and t.startswith(out[-1][1]): out[-1] = [nm, t]
        elif out and out[-1][0] == nm and out[-1][1].startswith(t): continue
        else: out.append([nm, t])
    return out


async def init(pg):
    return await pg.evaluate(HELPERS)


async def day_of(pg, a):
    return await pg.evaluate(DAY_JS, a)


async def settle(pg, cdp, ms=6000):
    await pg.wait_for_timeout(ms); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)


async def base(pg, save, when, hour, zone, pos=None, flags=None):
    """使用者存檔（深拷貝）改到那一天、那個時間、那一區；拿掉進行中的邀約。回傳 (存檔, 日期資訊)"""
    d = await day_of(pg, when)
    s = copy.deepcopy(save); s = s.get('G', s); s.pop('_stuck', None); s.pop('_busy', None)
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=pos)
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    if flags: s.setdefault('flags', {}).update(flags)
    return s, d


async def load(pg, cdp, st, quiet=True):
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=True); await settle(pg, cdp)


async def prep(pg, cdp, run, js, arg=None, quiet=True, label=''):
    """【捷徑】用遊戲的 API 改狀態，存成快照再讀一次"""
    r = await pg.evaluate(js, arg) if arg is not None else await pg.evaluate(js)
    run.setup('【捷徑】%s：%s' % (label or '用遊戲的 API 補前置', J(r)))
    snap = await pg.evaluate("()=>GAME.snapshot()")
    await load(pg, cdp, snap, quiet)
    return r


async def snapshot(pg):
    return await pg.evaluate("()=>GAME.snapshot()")


async def jump(pg, cdp, run, when, hour, zone=None, pos='keep', quiet=True, snap=None, note=''):
    """【前置】同一份進度（GAME.snapshot()，或給 snap）跳到另一個時間（地點）再讀；pos='keep'＝原地，None＝那一區的出生點"""
    s = copy.deepcopy(snap) if snap is not None else await snapshot(pg); d = await day_of(pg, when)
    s.update(day=d['d'], weekday=d['wd'], hour=hour)
    if zone: s['zone'] = zone
    if pos != 'keep': s['pos'] = pos
    await load(pg, cdp, s, quiet)
    run.setup('[前置] 同一份進度跳到 %s（%s 第 %s 週）%.2f 時 %s%s' % (d['key'], d['term'], d['week'], hour, s['zone'], ('；' + note) if note else ''))
    return d


async def events_on(pg):
    await pg.evaluate("(()=>{ EVENTS.onEnter=window.__BBP.evo.a; EVENTS.tick=window.__BBP.evo.b; })()")


async def ts(pg):
    return await pg.evaluate("()=>__BBF.ts()")


async def who(pg, cid):
    return await pg.evaluate("id=>__BBF.who(id)", cid)


async def clock(pg):
    return await pg.evaluate("()=>__BBF.clock()")


async def place_near(pg, run, x, z, R=7.0, lv=0, what=''):
    p = await pg.evaluate("([x,z,R,lv])=>__BBF.placeNear(x,z,R,lv)", [x, z, R, lv])
    run.setup('[前置] 站到%s %s m 外：%s' % (what or '(%.1f,%.1f)' % (x, z), p and p['R'], J(p)))
    await pg.wait_for_timeout(1500)
    return p


async def wait_present(pg, cid, max_s=90):
    """那個人在這一區、沒有藏起來（底模還沒下載完的會先藏：pool3d.js 2-1）"""
    t0 = time.time(); w = None
    while time.time() - t0 < max_s:
        w = await who(pg, cid)
        if w and not w['hidden']: return w
        await pg.wait_for_timeout(1000)
    return w


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CHOICE_AT_JS, k); await L.touch_tap(cdp, c[0], c[1])


def pick_of(opts, picks, decline=True):
    """選哪一個：picks 的開頭（照順序）→ 婉拒那一類 → 第一個沒變暗的"""
    for p in picks or ():
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'].startswith(p): return i, p
    if decline:
        for p in DECLINE:
            for i, o in enumerate(opts):
                if not o['dim'] and o['t'].startswith(p): return i, None
    for i, o in enumerate(opts):
        if not o['dim']: return i, None
    return 0, None


async def dialog(pg, cdp, run, picks=(), max_s=300, start_s=8, idle_s=4, tag='', shots=False):
    """點對話、選選項到結束（idle_s 秒沒有對話、選項、忙）；回傳 {lines:[[名字,句子]], opts:[[選項...]], picked:[...], started}"""
    t0 = time.time(); seen = []; opts = []; picked = []; started = False; idle = None; picks = list(picks or ())
    while time.time() - t0 < max_s:
        s = await ts(pg)
        if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
        if s['phone'] and not s['ch'] and not s['dlg']: await L.phone_away(pg, cdp); continue
        if s['ch']:
            started = True; idle = None; opts.append([o['t'] for o in s['ch']])
            k, p = pick_of(s['ch'], picks)
            if p is not None: picks.remove(p)
            picked.append(s['ch'][k]['t'])
            if shots: await run.shot(pg, '%s_choice%d' % (tag, len(opts)))
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['busy'] or s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(500); continue
        if not started:
            if time.time() - t0 > start_s: break
        else:
            idle = idle or time.time()
            if time.time() - idle > idle_s: break
        await pg.wait_for_timeout(400)
    r = dict(lines=clean(seen), opts=opts, picked=picked, started=started)
    if tag: run.note('%s：選項 %s；選了 %s；台詞 %s' % (tag, J(opts), J(picked), J(r['lines'])))
    return r


async def talk_to(pg, cdp, run, cid, tag, picks=(), max_s=480):
    """像玩家一樣走到他旁邊（他可能在走動：每一輪重新看他在哪），按鈕變成「和〈他〉說話」再按，點完對話；按了沒反應就再走近一次（最多三次）"""
    t0 = time.time(); n = 0; tries = 0
    while time.time() - t0 < max_s and tries < 3:
        g = await pg.evaluate("id=>__BBF.target(id)", cid)
        if not g: run.note('%s：%s 不在這一區（或藏著）' % (tag, cid)); return None
        if not g['ok']:
            n += 1
            await L.go_to(pg, cdp, run, g['tx'], g['tz'], 0.55, '%s：他旁邊（第 %d 輪）' % (tag, n), max_s=120, stop=lambda s, w=g['want']: s['interact'].startswith(w))
            await pg.wait_for_timeout(500); continue
        tries += 1
        await L.tap(pg, cdp, '#interact')
        r = await dialog(pg, cdp, run, picks, max_s=max(60, max_s - (time.time() - t0)), tag=tag)
        if not r['started']: run.note('%s：按了「%s」沒有開始說話，再走近一次' % (tag, g['want'])); continue
        r['label'] = g['want']; return r
    run.note('%s：%d 秒內沒有和 %s 說到話' % (tag, time.time() - t0, cid)); return None


async def wait_hour(pg, cdp, h, max_s=600, day=None):
    """站著等到遊戲時間 h（同一天；day 給了＝那一天）；途中手機自己跳出來就收起來。回傳是否等到"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        c = await clock(pg)
        if (day is None or c['day'] >= day) and (c['h'] >= h or (day is not None and c['day'] > day)): return True
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(2000)
    return False


# ---------- 手機 ----------
async def phone_tab(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(800)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")


async def tap_all(pg, cdp, sel):
    n = await pg.evaluate("s=>document.querySelectorAll(s).length", sel)
    for i in range(n):
        c = await pg.evaluate("([s,i])=>{ const e=document.querySelectorAll(s)[i]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }", [sel, i])
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(400)
    return n


async def phone_thread(pg, cdp, th, open_folds=True):
    """手機「訊息」→（在別的對話裡就先「‹ 訊息」）→ 點那一個對話；回傳 {ok, text, asks:[回覆鍵], list}"""
    lst = await phone_tab(pg, cdp, 'msg')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-thback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-thback]'); await pg.wait_for_timeout(700)
        lst = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    sel = '#phoneBody [data-th="%s"]' % th
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel): return dict(ok=False, text='', asks=[], list=lst)
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(900)
    if open_folds: await tap_all(pg, cdp, '#phoneBody details:not([open]) > summary')
    text = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>({t:(b.textContent||'').trim(),id:b.dataset.ask,dis:b.disabled}))")
    return dict(ok=True, text=text, asks=asks, list=lst)


async def phone_answer(pg, cdp, th, label):
    """在那一個對話裡點開頭是 label 的回覆鍵；回傳點完以後的對話文字（None＝沒有那個鍵）"""
    t = await phone_thread(pg, cdp, th, open_folds=False)
    if not t['ok']: return None
    k = next((i for i, a in enumerate(t['asks']) if a['t'].startswith(label) and not a['dis']), None)
    if k is None: return None
    c = await pg.evaluate("k=>{ const e=document.querySelectorAll('#phoneBody [data-ask]')[k]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }", k)
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")


async def person_page(pg, cdp, cid):
    """手機「朋友」→ 那個人（data-person）；回傳人物頁的文字（None＝朋友清單裡沒有他）"""
    await phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-person="%s"]' % cid
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel): return None
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(900)
    return await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")


async def phone_close(pg, cdp):
    await L.close_panels(pg, cdp)


async def captions(pg, since=0):
    return await pg.evaluate("n=>window.__BBP.cap.slice(n)", since)


async def cap_n(pg):
    return await pg.evaluate("window.__BBP.cap.length")


def cap_spans(log):
    """#caption 的變化紀錄 → 每一句字幕 [文字, 出現 ms, 結束 ms（下一個變化；最後一句＝None）, 遊戲時間]"""
    out = []
    for i, e in enumerate(log):
        if e['v'] and e['t']:
            end = next((f['ms'] for f in log[i + 1:] if f['t'] != e['t'] or not f['v']), None)
            if out and out[-1][0] == e['t'] and out[-1][2] is None: continue
            out.append([e['t'], e['ms'], end, e['h']])
    return out
