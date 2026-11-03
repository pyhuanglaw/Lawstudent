"""CC（帳號 A）11-03：宿營（AA_608）、AA_606 名片場、可昕 8/30 高鐵那幾支探針的共用工具。
只記錄、不改劇情狀態：HOOK 包住 GAME.say／GAME.choose／GAME.titleCard／EVENTS.run／GAME.toast，呼叫原本的函式，只多記一筆（同 cc_flow_semester_probe.py 的 HOOK）。
玩家操作：CDP 觸控點對話框 #dlg、選項按鈕、手機按鈕、選單按鈕；讀檔走標題「讀取／匯入存檔」→「匯入存檔」→ 選 .json 檔 →「匯入」（玩家搬存檔的方式）。
用法：探針 import 這個檔（同一個資料夾）。"""
import os, sys, json, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L

J = lambda o: json.dumps(o, ensure_ascii=False)


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


HOOK = r"""(()=>{ if(window.__CPH) return 'again'; window.__CPH=1; window.__CP=[]; window.__CPN=0;
  const at=()=>{ try{ const G=GAME.G, F=G.flags||{}; return {d:CALENDAR.dateOf(G.day).key, day:G.day, h:+(+G.hour).toFixed(3), z:G.zone, ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null,
      camp:!!F.CAMP_Y1_ON, step:F.campStep===undefined?null:F.campStep, adv:!!(typeof ADV!=='undefined'&&ADV.active)}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); o.i=window.__CPN++; window.__CP.push(o); if(window.__CP.length>8000) window.__CP.splice(0,4000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>(x.t||x.text)||'').join('｜')}); return c0.apply(this,arguments); };
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',t:String(a||'')+' '+String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  if(typeof OUT!=='undefined'&&OUT.go){ const g0=OUT.go; OUT.go=function(GM,q){ push({k:'outgo',t:String((q&&q.id)||''),place:String((q&&q.place)||''),qh:q&&q.h}); return g0.apply(this,arguments); }; }
  return 'ok'; })()"""
TAKE = "(()=>{ const a=window.__CP||[]; window.__CP=[]; return a; })()"

TS = r"""(()=>{ const G=GAME.G, D=GAME.D, ch=document.getElementById('choices'), dl=document.getElementById('dlg'); if(!G) return null; const F=G.flags||{};
  let key=null, week=null, term=null; try{ key=CALENDAR.dateOf(G.day).key; const t=CALENDAR.termOf(G.day); if(t){ week=t.week; term=t.id; } }catch(e){}
  const met={}; try{ const M=(G.social&&G.social.mem)||{}; for(const id in M){ const m=(M[id]||[]).find(x=>x.tag==='FIRST_MET'); if(m) met[id]={day:m.day,note:m.note||''}; } }catch(e){}
  const who=D&&D.active&&D.who?{n:(D.who.name||(typeof D.who==='string'?D.who:'')),cid:D.who.charId||null}:null;
  return {dlg:!!(D&&D.active), name:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgName')||{}).textContent||'').trim():'',
    txt:(dl&&!dl.classList.contains('hide'))?((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,80):'', who,
    ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>({t:(b.textContent||'').trim(),dim:b.classList.contains('dim')||b.disabled})):[],
    busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy), depth:(D&&D.busyDepth)|0, phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),
    ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, adv:!!(typeof ADV!=='undefined'&&ADV.active),
    title:!document.getElementById('titleScreen').classList.contains('hide'), running:!!GAME.running,
    day:G.day, key, week, term, h:+(+G.hour).toFixed(3), zone:G.zone, stage:G.stage||'law',
    campOn:!!F.CAMP_Y1_ON, campStep:F.campStep===undefined?null:F.campStep, campSeqV:F.campSeqV===undefined?null:F.campSeqV, CAMP_Y1:!!F.CAMP_Y1,
    fb:GAME.walkFallbacks|0, met, frame:(GAME.E&&GAME.E.frame)|0 }; })()"""


async def ts(pg):
    return await pg.evaluate(TS)


def tval(s):
    """遊戲時鐘（天×24＋小時）"""
    return s['day'] * 24 + s['h']


CHOICE_AT = "k=>{ const b=document.querySelectorAll('#choices button'); const e=b[k]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; }"


async def tap_choice(pg, cdp, k):
    c = await pg.evaluate(CHOICE_AT, k)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


def pick_index(ch, prefer=(), skip=()):
    """prefer：依序找開頭符合的（沒變暗的）；沒有就第一個沒變暗、不是 skip 開頭的"""
    live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in prefer:
        for i in live:
            if ch[i]['t'].startswith(p): return i, 'prefer'
    cand = [i for i in live if not ch[i]['t'].startswith(tuple(skip))] if skip else live
    return (cand or live)[0], 'first'


async def phone_unblock(pg, cdp):
    """手機自己打開（要回覆的訊息）：按第一個回覆鍵，再收起來；回傳按了哪個回覆"""
    asks = []
    try:
        must = await pg.evaluate("(()=>{ try{ return !!(PHONE.mustOpen&&PHONE.mustOpen(GAME.G)); }catch(e){ return false; } })()")
        if must:
            if not await pg.evaluate("!!document.querySelector('#phoneBody [data-ask]')") and await pg.evaluate("!!document.querySelector('#phoneBody [data-th]')"):
                await L.tap(pg, cdp, '#phoneBody [data-th]'); await pg.wait_for_timeout(800)
            asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>(b.textContent||'').trim())")
            if asks: await L.tap(pg, cdp, '#phoneBody [data-ask]'); await pg.wait_for_timeout(1200)
    except Exception:
        pass
    await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
    return asks


async def step(pg, cdp, s, picks, prefer=(), skip=()):
    """像玩家一樣處理畫面上的一件事：選項（prefer／第一個）、對話框（點一下）、手機（回覆、收起來）。有做事回 True"""
    if s['ch']:
        k, why = pick_index(s['ch'], prefer, skip)
        picks.append({'d': s['key'], 'h': hm(s['h']), 'opts': [o['t'][:30] for o in s['ch']], 'pick': s['ch'][k]['t'][:40], 'why': why})
        await tap_choice(pg, cdp, k); await pg.wait_for_timeout(800); return True
    if s['phone'] and not s['dlg']:
        a = await phone_unblock(pg, cdp)
        if a: picks.append({'d': s['key'], 'h': hm(s['h']), 'opts': a, 'pick': a[0], 'why': 'phone-reply'})
        return True
    if s['dlg']:
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); return True
    return False


def is_free(s):
    return bool(s) and not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone'] and not s['title'] and not s['ev']


async def new_game_law(pg, cdp, run):
    """標題畫面按「從法律系開始」（#btnNewLaw）"""
    ok = await L.tap(pg, cdp, '#btnNewLaw')
    for _ in range(240):
        if await pg.evaluate("!!(GAME.G&&document.getElementById('titleScreen').classList.contains('hide'))"): break
        await pg.wait_for_timeout(500)
    await pg.evaluate(HOOK)
    return ok


async def import_save(pg, cdp, run, path):
    """標題畫面「讀取／匯入存檔」→「匯入存檔」→ 選 .json 檔 →「匯入」（玩家把存檔檔案搬進來的方式；匯入前遊戲自己會備份）。回傳讀進來沒有"""
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
    if not await L.tap(pg, cdp, '#btnImport'):
        run.note('找不到「匯入存檔」按鈕'); return False
    await pg.wait_for_timeout(800)
    await pg.set_input_files('#importFile', path); await pg.wait_for_timeout(1500)
    n = await pg.evaluate("(document.getElementById('importText')||{}).value.length|0")
    run.note('匯入檔 %s：讀進文字框 %d 字' % (path, n))
    await L.tap(pg, cdp, '#btnImportGo')
    for _ in range(240):
        if await pg.evaluate("!!(GAME.G&&GAME.running&&document.getElementById('titleScreen').classList.contains('hide'))"): break
        await pg.wait_for_timeout(500)
    msg = await pg.evaluate("(document.getElementById('importMsg')||{}).textContent||''")
    run.note('匯入訊息：%s' % msg)
    await pg.evaluate(HOOK)
    # 讀檔後選單可能還開著：像玩家一樣收起來
    await L.close_panels(pg, cdp)
    return await pg.evaluate("!!(GAME.G&&GAME.running)")


async def save_auto(pg):
    """瀏覽器裡的自動存檔（fatiao3d_auto）＝玩家關掉分頁時留下來的進度"""
    raw = await pg.evaluate("localStorage.getItem('fatiao3d_auto')")
    return json.loads(raw) if raw else None


# ---- 名單：照程式（CHARACTERS／PORTRAIT_ONLY）決定 ----
ROSTER = r"""(allow=>{ const out={}; const add=(id,c)=>{ if(!c) return; const ns=[c.name,c.fullname].concat(c.alias||[]).filter(Boolean); out[id]=ns; };
  if(typeof CHARACTERS!=='undefined') for(const k in CHARACTERS) add(k,CHARACTERS[k]); if(typeof PORTRAIT_ONLY!=='undefined') for(const k in PORTRAIT_ONLY) add(k,PORTRAIT_ONLY[k]);
  const nm={}; for(const id of ['heroine_01','heroine_05','yu','classmate_mingxuan','classmate_bohan','kai','kexin']) nm[id]=(typeof SOCIAL!=='undefined'&&SOCIAL.npcName)?SOCIAL.npcName(id):null;
  return {ids:out, npcName:nm, allow}; })"""


def classify(rec, roster, allow_ids, allow_names, extra_bad=('Kevin', '凱文')):
    """一句台詞的說話者是不是「不該出現的人」：charId 在名單裡但不在 allow_ids；或名字對到別人的名字；或 Kevin／凱文"""
    cid, n = rec.get('cid'), (rec.get('n') or '').strip()
    if cid and cid in roster and cid not in allow_ids and cid != 'player': return cid
    if not n or n in allow_names: return None
    if n.startswith(extra_bad): return 'npc_kevin'
    for id_, names in roster.items():
        if id_ in allow_ids: continue
        if any(n == x or n.startswith(x + '（') for x in names if x): return id_
    return None
