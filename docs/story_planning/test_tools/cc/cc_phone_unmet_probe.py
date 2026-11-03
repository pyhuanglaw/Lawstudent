"""CC（帳號 A）11-03：BUG-PHONE-UNMET-THREAD-1103 探針（使用者 11-03 實玩：「還不認識以安的時候 訊息就出現 不認識的人 一格 超白癡」；BB 判 P1）。
不是 iPhone：Playwright 手機模擬（橫向 844×390、is_mobile、CDP 觸控；SwiftShader 1～4 fps）。

讀碼看到的規則（0f66c4215）：
  手機訊息存在 G.msgs（陣列，最多 200 則；src/phone3d.js:2-6 註解）：每則 {day,h,who,text,th,from,name,tag,...}；th＝'p:人物 id'（一對一）／'g:群組 id'（群組）／沒有＝who 的一對一或 'sys'。
  寫入 G.msgs 的函式：
    PHONE.post（src/phone3d.js:48）、PHONE.postAt（:49）→ 內部 put（:44-46，照時間插進去）；PHONE.tick（:54-58）送出 PHONE.at（:53）排定的那一批，也是呼叫 PHONE.post／postAt；
    PHONE.answer（:72-78）回覆也走 PHONE.post；INV.msg（src/invites3d.js:28，直接 push，例：INV.addContact :34「加了…的聯絡方式」）、INV.msgAt（:30-31）。
    G.phone.groups 由 PHONE.join（src/phone3d.js:28）加。
  訊息頁怎麼列：src/game3d.js:718-724 msgHTML＝上面 contactsHTML（:716-717，MSG.contactRows src/msg3d.js:159-165，「傳訊息給」按鈕 data-th／灰的 data-noct）
    ＋下面 PHONE.threads（src/phone3d.js:78-82）的 .chatRow[data-th]；名字＝PHONE.title → nm（:17-20）→ SOCIAL.displayName（src/social3d.js:91：D 層沒見過＝「不認識的女生」）。
  相遇怎麼判斷：SOCIAL.metD（src/social3d.js:96：FIRST_MET 記憶，或舊旗標 met_<id>／LEGACY_MET）；SOCIAL.meet（:97）記 FIRST_MET。
    可是 MSG.contactRows 用的「認識」是 msg3d.js:52 met＝SOCIAL.stage(id)!=='STRANGER'（熟悉 fam≥5，social3d.js:44）或 knownIds 有她（game3d.js:460），
    hasContact（msg3d.js:53 → invites3d.js:33）把 INVITE_DATA.contacts0（src/data/invites.js:25：zhe、kai、kexin、heroine_05）也算有聯絡方式——這兩條都不看 metD，探針一起記。
範圍（BB 08:46 更正）：位置是「訊息頁上面的聯絡人列」（game3d.js:716-717 contactsHTML → MSG.contactRows msg3d.js:159-165）。
  BB 讀碼的原因：contactRows 用 msg3d.js:52 met＝SOCIAL.stage(id)!=='STRANGER' 決定列不列，名字卻走 SOCIAL.metD（social3d.js:91/96）——
  stage 離開 STRANGER（熟悉 fam≥5，social3d.js:44）而 metD 還沒成立時，列出一格 gray（disabled、opacity .5）的「不認識的女生」。探針只驗證。
探針做的事（只記錄、不改行為）：
  1. 開學前每天（空下來時）照玩家打開手機「訊息」分頁（CDP 觸控），記聯絡人列每一格：名字、gray（data-noct）、opacity、disabled、data 屬性；有可疑的格子就截圖，
     並記當下 SOCIAL.stage(id)、SOCIAL.metD(id)、fam、有沒有聯絡方式。
  2. 包住 SOCIAL.adjust／activity／meet／remember：五位女主角的 stage 一變就記（前後 stage、metD、fam、EVENTS.running、呼叫來源 stack 前 6 行）＝找出把 stage 推離 STRANGER 的事件。
  3. 附帶：包住 PHONE.post／postAt／at／join、INV.msg／msgAt（G.msgs 的寫入，phone3d.js:44-58、invites3d.js:28-31），相遇前寫進她的訊息只列出來、不算 FAIL。
流程：照玩家從標題點「從法律系開始」（START=econ 改點「從經濟系開始」），名字用預設；對話點過去、選項選第一個（睡覺選單例外：選「睡到明天早上」類，才過得了夜）；
  空下來 21:00 前：手機「今天」有「直接去上課」就按，沒有就按時間最早的「跳過時間」（不一次跳整天：早→中午→下午→傍晚→晚上都經過）；
  21:00 以後：手機「地點」快速前往宿舍（照樣花遊戲時間）、走到床邊按「睡覺」。不改旗標、不撥時間、不用 GAME.advance。
  網址建議加 ?turbo（測試加速：走位瞬間、dt 上限；條件事件 EVENTS.tick、PHONE.tick、劇情照常跑，不會漏時段）和 ?lowres。
  一路玩到開學那一天（END_KEY，預設 2025-09-01）看過一次聯絡人列為止。
判斷：聯絡人列出現名字「不認識…」、名字空白、或沒見過（metD=false）的女主角卻列出來（含 gray）→ FAIL；見過、沒有聯絡方式的 gray 照設計，不算。
用法：LW_TESTS=<wt>/tests SHA=<sha> [START=law|econ] [END_KEY=2025-09-01] [MAX_MIN=85] python3 cc_phone_unmet_probe.py '<URL>/index.html?turbo&lowres' <輸出資料夾>
每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, asyncio, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
START = os.environ.get('START', 'law')
END_KEY = os.environ.get('END_KEY', '2025-09-01')   # 開學那一天（src/data/calendar.js:21 Y1S1 start）
MAX_MIN = float(os.environ.get('MAX_MIN', '85'))
J = lambda o: json.dumps(o, ensure_ascii=False)
HER = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05']
SLEEP_PREF = ('睡到明天早上', '先睡。明天再拆。', '睡覺', '直接睡')

HOOK = r"""(()=>{ if(window.__PU) return 'again'; const W=window.__PU={w:[],at:{},first:null,errs:[]}; const HER=%s;
  const metOf=()=>{ const o={}; for(const id of HER){ try{ o[id]=!!SOCIAL.metD(id); }catch(e){ o[id]=null; } } return o; };
  const stk=()=>String(new Error().stack||'').split('\n').slice(2,8).map(l=>{ const m=l.match(/(src\/[^?:)]+)(?:\?[^:)]*)?:(\d+)/)||l.match(/([\w.]+\.js)(?:\?[^:)]*)?:(\d+)/); const fn=(l.match(/at\s+([^\s(]+)\s*\(/)||[])[1]||''; return (fn?fn+' ':'')+(m?m[1]+':'+m[2]:l.trim().slice(0,80)); });
  const clk=()=>{ try{ const G=GAME.G; return {day:G.day,key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(2),zone:G.zone,ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null}; }catch(e){ return {}; } };
  const shown=m=>{ try{ return PHONE.who(m); }catch(e){ return null; } }, title=th=>{ try{ return PHONE.title(GAME.G,th); }catch(e){ return null; } };
  const rec=(fn,it,extra)=>{ it=it||{}; const th=it.th||(it.who?'p:'+it.who:'sys'); const o=Object.assign({fn,th,from:it.from||null,who:it.who||null,text:String(it.text==null?'':it.text).slice(0,40),tag:it.tag||null,
      met:metOf(),stack:stk(),shown:shown(it),title:title(th)},clk(),extra||{}); if(it.tag&&W.at[it.tag]) o.atStack=W.at[it.tag]; W.w.push(o); if(W.w.length>4000) W.w.splice(0,1000); return o; };
  const p0=PHONE.post; PHONE.post=function(G,it){ rec('PHONE.post',it); return p0.apply(this,arguments); };
  const p1=PHONE.postAt; PHONE.postAt=function(G,it,day,h){ rec('PHONE.postAt',it,{atDay:day,atH:h}); return p1.apply(this,arguments); };
  const a0=PHONE.at; PHONE.at=function(G,day,h,items,tag){ const r=a0.apply(this,arguments); if(r){ const L=[].concat(items||[]); const s={stack:stk(),c:clk(),day,h,met:metOf()}; if(tag) W.at[tag]=s;
      for(const it of L){ const th=it&&(it.th||(it.who?'p:'+it.who:'sys')); if(th&&/heroine_0/.test(th+' '+(it.from||'')+' '+(it.who||''))) W.w.push(Object.assign({fn:'PHONE.at(排定)',th,from:it.from||null,who:it.who||null,text:String(it.text||'').slice(0,40),tag:tag||null,atDay:day,atH:h,met:metOf(),stack:s.stack},clk())); } } return r; };
  const j0=PHONE.join; PHONE.join=function(G,gid,name){ const had=PHONE.inGroup(G,gid); const r=j0.apply(this,arguments); if(!had) W.w.push(Object.assign({fn:'PHONE.join',th:'g:'+gid,text:String(name||''),met:metOf(),stack:stk()},clk())); return r; };
  if(typeof INV!=='undefined'){ const m0=INV.msg; INV.msg=function(G,who,text,iv){ rec('INV.msg',{who,text}); return m0.apply(this,arguments); };
    const m1=INV.msgAt; if(m1) INV.msgAt=function(G,who,text,day,h){ rec('INV.msgAt',{who,text},{atDay:day,atH:h}); return m1.apply(this,arguments); }; }
  W.st=[]; const stOf=id=>{ try{ return SOCIAL.stage(id); }catch(e){ return null; } };
  const wrapS=name=>{ const f0=SOCIAL[name]; if(typeof f0!=='function') return; SOCIAL[name]=function(id){ const pre=HER.includes(id)?stOf(id):null; const r=f0.apply(this,arguments);
    if(HER.includes(id)){ const post=stOf(id); if(pre!==post) W.st.push(Object.assign({fn:'SOCIAL.'+name,id,args:JSON.stringify([].slice.call(arguments,1)).slice(0,120),pre,post,metD:!!SOCIAL.metD(id),fam:SOCIAL.rel(id).fam|0,stack:stk()},clk())); } return r; }; };
  wrapS('adjust'); wrapS('activity'); wrapS('meet'); wrapS('remember');
  return 'ok'; })()""" % J(HER)

# 不開 UI：照 game3d.js msgHTML 的資料來源算列表（PHONE.threads＋MSG.contactRows），加群組裡女主角的訊息顯示成什麼
SCAN_JS = r"""(()=>{ const G=GAME.G; if(!G||!GAME.running) return null; const HER=%s, met={}, rel={}; for(const id of HER){ met[id]=!!SOCIAL.metD(id); const r=SOCIAL.rel(id); rel[id]={st:SOCIAL.stage(id),fam:r.fam|0,ct:!!(typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,id))}; }
  let rows=[], cts=[]; try{ rows=PHONE.threads(G,{sys:true}).map(t=>({th:t.th,title:t.title})); }catch(e){}
  try{ if(typeof MSG!=='undefined'&&MSG.contactRows) cts=MSG.contactRows(G,GAME.knownIds?GAME.knownIds():[]).map(r=>({th:r.th,id:r.id,gray:r.gray,title:PHONE.title(G,r.th),why:r.why||''})); }catch(e){}
  const grp=(G.msgs||[]).filter(m=>{ const th=PHONE.th(m); return th.startsWith('g:')&&HER.includes(m.from); }).map(m=>({th:PHONE.th(m),from:m.from,shown:PHONE.who(m),text:String(m.text||'').slice(0,40),day:m.day,h:m.h,tag:m.tag||null}));
  return {day:G.day,key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(2),zone:G.zone,met,rel,rows,cts,grp}; })()""" % J(HER)

# 手機裡「選人」的面板：訊息頁上面的「傳訊息給」聯絡人（.ctList button，game3d.js:716-717）、訊息列表（.chatRow，:722-723）、
# 「朋友」頁每一列（.item.phrow：直接過去／帶我去／資料／訊息／約，:666-675）。每一格記名字、頭像、透明度、data 屬性
CELLS_JS = r"""(sel=>{ const B=document.getElementById('phoneBody'); if(!B) return [];
  const op=e=>{ let o=1; for(let x=e;x&&x!==B.parentNode;x=x.parentElement){ const cs=getComputedStyle(x); o*=+cs.opacity; if(cs.visibility==='hidden'||cs.display==='none') return 0; } return +o.toFixed(2); };
  return [...B.querySelectorAll(sel)].map(e=>{ const r=e.getBoundingClientRect(); const dat={}; for(const k in e.dataset) dat[k]=e.dataset[k];
    e.querySelectorAll('[data-fgo],[data-find],[data-person],[data-msg],[data-inv]').forEach(c=>{ for(const k in c.dataset) dat[k]=c.dataset[k]; });
    let nm=''; const bnm=e.querySelector('.chatMid b'); if(bnm) nm=bnm.textContent; else if(e.matches('.phrow')){ const d=e.firstElementChild; nm=d&&d.childNodes[0]?d.childNodes[0].textContent:''; } else nm=e.childNodes[0]?e.childNodes[0].textContent:'';
    const av=e.querySelector('.chatAv'), img=e.querySelector('img'); let avatar=null; if(img) avatar='img:'+img.getAttribute('src'); else if(av){ const bg=getComputedStyle(av).backgroundImage; avatar=bg&&bg!=='none'?'bg:'+bg.slice(0,90):('字:'+av.textContent.trim()); }
    return {name:(nm||'').trim(),text:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,70),avatar,opacity:op(e),disabled:!!e.disabled,gray:e.hasAttribute('data-noct'),w:Math.round(r.width),h:Math.round(r.height),data:dat}; }); })"""

NEXT_HOP = """(()=>{ const G=GAME.G, E=GAME.E, z=G.zone, its=E.interactables||[];
  const pick=f=>{ const it=its.find(f); return it?{x:it.x,z:it.z,r:it.radius||1.5,label:it.label||'',lv:it.lv===undefined?null:it.lv}:null; };
  if(z==='dorm') return pick(i=>(i.label||'').startsWith('睡覺'));
  if(z==='dorm_hall') return pick(i=>i.exit&&i.exit.to==='dorm');
  if(z==='campus') return pick(i=>i.exit&&i.exit.to==='dorm_hall');
  return pick(i=>i.exit&&i.exit.to==='campus')||pick(i=>/^(走出|離開)/.test(i.label||'')); })()"""


def unk(s): return isinstance(s, str) and s.startswith('不認識')


def her_of(th, frm=None, who=None):
    for id_ in HER:
        if (th and id_ in th) or frm == id_ or who == id_: return id_
    return None


async def pick_choice(pg, cdp):
    """選項：睡覺選單選「睡到明天早上」類（才過得了夜），其他一律第一個沒變暗的。回傳 [x,y,選的,全部]"""
    c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)&&!x.disabled); if(e) break; } e=e||bs.find(x=>!x.disabled&&!x.classList.contains('dim'))||bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30),bs.map(b=>b.textContent.trim().slice(0,16))]; })(%s)" % J(list(SLEEP_PREF)))
    if c: await L.touch_tap(cdp, c[0], c[1])
    return c


async def skip_time(pg, cdp):
    """手機「今天」：有「直接去上課」就按；沒有就按時間最早的「跳過時間」（不一次跳整天）。回傳按了哪一個（沒有就 None）"""
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(700)
    g = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-go]')].filter(b=>!/缺席/.test(b.textContent)); if(!bs.length) return null; const e=bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
    if g:
        await L.touch_tap(cdp, g[0], g[1]); await pg.wait_for_timeout(1500)
        return '去上課：' + g[2]
    c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')].sort((a,b)=>+a.dataset.skip-+b.dataset.skip); if(!bs.length) return null; const e=bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })()")
    if c:
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        return c[2]
    await L.close_panels(pg, cdp)
    return None


async def quick_go(pg, cdp, key):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(800)
    c = await pg.evaluate("(k=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place===k); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,k]; })(%s)" % J(key))
    if c:
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        return c[2]
    await L.close_panels(pg, cdp)
    return None


async def open_tab(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)
    for _ in range(2):   # 在某個對話／某人的資料頁裡：先返回列表
        bk = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-thback],#phoneBody [data-personback]'); return e?(e.dataset.thback!==undefined?'#phoneBody [data-thback]':'#phoneBody [data-personback]'):null; })()")
        if not bk: break
        await L.tap(pg, cdp, bk); await pg.wait_for_timeout(700)


def bad_cell(c, panel):
    """違規的格子：名字「不認識…」、名字空白、整格透明（opacity<0.9／隱藏）、訊息列表那一列沒有頭像。回傳原因或 ''"""
    why = []
    if unk(c['name']): why.append('名字「%s」' % c['name'])
    if not c['name']: why.append('名字空白')
    if c['opacity'] < 0.9 or c['disabled']: why.append('透明／灰（opacity %s%s）' % (c['opacity'], '、disabled' if c['disabled'] else ''))
    if panel == 'msg_rows' and not c['avatar']: why.append('沒有頭像')
    return '、'.join(why)


async def pickers(pg, cdp, run, tag, met):
    """照玩家打開手機每一個「選人」的面板，記每一格；有可疑的格子就截圖。回傳 {panel: [cells]}, bad[]"""
    out = {}; bad = []
    for tab, panels in (('msg', (('msg_contacts', '.ctList button'),)),):
        await open_tab(pg, cdp, tab)
        shot = None
        for pn, sel in panels:
            cells = await pg.evaluate(CELLS_JS, sel); out[pn] = cells
            for c in cells:
                w = bad_cell(c, pn)
                pid = c['data'].get('th', '').replace('p:', '') or c['data'].get('noct') or c['data'].get('person') or ''
                if c['gray'] and pid in met and not met[pid]: w = (w + '、' if w else '') + '沒見過（metD=false）卻列出來'
                if not w: continue
                if '透明' in w and not unk(c['name']) and c['name'] and met.get(pid, True) and len(w.split('、')) == 1:
                    run.note('%s %s：「%s」灰著——見過、還沒有聯絡方式（msg3d.js:155 照設計），不算' % (tag, pn, c['name'])); continue
                if shot is None:
                    await pg.evaluate("(t=>{ const B=document.getElementById('phoneBody'); const e=[...B.querySelectorAll('.ctList button,.chatRow,.item.phrow')].find(b=>b.textContent.trim().replace(/\\s+/g,' ').startsWith(t.slice(0,12))); if(e) e.scrollIntoView({block:'center'}); })(%s)" % J(c['text']))
                    await pg.wait_for_timeout(500); shot = await run.shot(pg, 'picker_%s_%s' % (tab, tag))
                bad.append(dict(c, panel=pn, why=w, at=tag, shot=shot, pid=pid))
    await L.close_panels(pg, cdp)
    return out, bad


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('cc_phone_unmet', OUT)
    print('cc_phone_unmet_probe  SHA=%s  URL=%s  START=%s  END_KEY=%s' % (SHA, URL, START, END_KEY), flush=True)
    if 'turbo' in URL: run.setup('網址有 ?turbo（測試加速：走位瞬間、dt 上限）。EVENTS.tick、PHONE.tick、劇情照常跑；時間仍一格一格走，不會因此漏掉時段的事件')
    picks = []; ui_log = []; done_p = set(); cur_met = {}; scans_first = {}; days = []; t_start = time.time()
    async with async_playwright() as p:
        for att in range(3):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.set_default_timeout(180000)
            try:
                await pg.goto(URL); loaded = await L.wait_loaded(pg, 300); break
            except Exception as e:
                print('  [開頁失敗 第 %d 次] %s' % (att + 1, str(e).splitlines()[0][:200]), flush=True); loaded = False
                await b.close()
        try:
            if not run.check('遊戲載入', loaded): raise SystemExit
            await pg.evaluate("localStorage.clear()")
            run.check('包住寫入函式（PHONE.post/postAt/at/join、INV.msg/msgAt）', (await pg.evaluate(HOOK)) == 'ok')
            btn = '#btnNewLaw' if START == 'law' else '#btnNew'
            run.note('照玩家點標題「%s」（名字預設）' % btn)
            await L.tap(pg, cdp, btn)
            for _ in range(240):
                if await pg.evaluate("!!GAME.G&&GAME.running"): break
                await pg.wait_for_timeout(500)
            day0 = None; last_key = None; last_sig = None; stuck_t = time.time(); recover = 0; free_since = None; skip_fail = None
            end_reason = None; met_at = None; last_scan = 0
            while time.time() - t_start < MAX_MIN * 60:
                if not await pg.evaluate("!!GAME.G&&GAME.running"):
                    await pg.wait_for_timeout(800); continue
                if time.time() - last_scan > 5:
                    last_scan = time.time()
                    sc = await pg.evaluate(SCAN_JS)
                    if sc:
                        if day0 is None: day0 = sc['day']; run.note('開局 %s %.2f %s' % (sc['key'], sc['h'], sc['zone']))
                        for r in sc['rows'] + sc['cts']:
                            if unk(r['title']) and ('row:' + r['th']) not in scans_first:
                                scans_first['row:' + r['th']] = dict(r, at=[sc['key'], sc['h'], sc['zone']], rel=sc['rel'], met=sc['met'])
                                run.note('（不開 UI 的掃描）第一次出現「%s」列：%s' % (r['title'], J(scans_first['row:' + r['th']])))
                        for g in sc['grp']:
                            if unk(g['shown']) and ('grp:' + g['th'] + g['from']) not in scans_first:
                                scans_first['grp:' + g['th'] + g['from']] = dict(g, at=[sc['key'], sc['h']], met=sc['met'])
                        if sc['met']['heroine_01'] and not met_at:
                            met_at = [sc['key'], sc['h'], sc['zone']]; run.note('和以安相遇（SOCIAL.metD）：%s' % J(met_at))
                        if sc['key'] != last_key:
                            last_key = sc['key']; days.append(sc['key']); run.note('== %s %.2f %s  rel=%s' % (sc['key'], sc['h'], sc['zone'], J(sc['rel'])))
                        cur_met = sc['met']
                        if sc['key'] >= END_KEY and any(k[0] >= END_KEY for k in done_p): end_reason = 'school'
                s = await L.state(pg)
                free = not s['dlg'] and not s['choices'] and not s['busy']
                if end_reason and free: break
                sig = (s['dtext'], s['choices'], s['zone'], round(s['x'], 1), round(s['z'], 1), s['hour'])
                if sig != last_sig: last_sig = sig; stuck_t = time.time()
                elif time.time() - stuck_t > 240:
                    run.note('超過 4 分鐘沒有進展：' + J(s)); await run.shot(pg, 'stuck_%d' % recover)
                    recover += 1
                    if recover > 3: break
                    await L.close_panels(pg, cdp); stuck_t = time.time(); continue
                if s['choices'] and s.get('paused'):
                    if await L.close_panels(pg, cdp): continue
                if s['choices']:
                    free_since = None
                    c = await pick_choice(pg, cdp)
                    if c: picks.append([last_key, s['hour'], c[2], c[3]]); print('   ▶', c[2], '／', c[3], flush=True)
                    await pg.wait_for_timeout(900); continue
                if s['dlg']:
                    free_since = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                if s['busy'] or await pg.evaluate("!!document.querySelector('#fade.on')"):
                    free_since = None; await pg.wait_for_timeout(800); continue
                if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
                    await L.phone_away(pg, cdp); continue
                if free_since is None: free_since = time.time()
                if time.time() - free_since < 7:
                    await pg.wait_for_timeout(800); continue
                free_since = None
                per = (last_key, '')
                if last_key and per not in done_p:   # 這個時段還沒看過：照玩家打開每一個選人的面板
                    done_p.add(per); tag = '%s%s_%02d' % (per[0][5:], per[1], int(s['hour']))
                    cells, bad = await pickers(pg, cdp, run, tag, cur_met)
                    ui_log.append((tag, {'cells': cells, 'bad': bad, 'met': dict(cur_met)}))
                    run.note('選人面板 %s（%s %.2f %s）：%s' % (tag, last_key, s['hour'], s['zone'], J({k: [[c['name'], c['avatar'] and c['avatar'][:3], c['opacity']] for c in v] for k, v in cells.items()})))
                    if bad:
                        sst = await pg.evaluate("ids=>ids.map(id=>({id,stage:SOCIAL.stage(id),metD:!!SOCIAL.metD(id),fam:SOCIAL.rel(id).fam|0,trust:SOCIAL.rel(id).trust|0,contact:!!INV.hasContact(GAME.G,id)}))", list({r['pid'] for r in bad if r['pid']}))
                        for r in bad: r['now'] = next((x for x in sst if x['id'] == r['pid']), None)
                        run.note('  可疑的格子：%s' % J(bad))
                    continue
                if s['hour'] < 21 and skip_fail != (last_key, int(s['hour'])):
                    lab = await skip_time(pg, cdp)
                    if lab: print('   跳過時間：', lab, flush=True); await pg.wait_for_timeout(1500); continue
                    skip_fail = (last_key, int(s['hour']))
                if s['zone'] != 'dorm':
                    lab = await quick_go(pg, cdp, 'dorm|宿舍')
                    if lab: print('   快速前往：', lab, flush=True); await pg.wait_for_timeout(2500); continue
                hop = await pg.evaluate(NEXT_HOP)
                if not hop:
                    await pg.wait_for_timeout(1500); continue
                ok = await L.go_to(pg, cdp, run, hop['x'], hop['z'], max(0.5, hop['r'] * 0.7), hop['label'], max_s=300, lv=hop['lv'], stop=lambda st: st['dlg'] or st['choices'] > 0)
                s = await L.state(pg)
                if ok and not s['dlg'] and not s['choices'] and s['interact']:
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            await run.shot(pg, 'end')
            run.note('選項（都選第一個；睡覺選單例外）：%s' % J(picks)[:3000])
            W = await pg.evaluate("window.__PU.w")
            run.note('寫入紀錄 %d 筆；過了的日子 %s' % (len(W), J(days)))
            json.dump({'writes': W, 'ui': [[k, v] for k, v in ui_log], 'scan_first': scans_first, 'picks': picks, 'days': days, 'met_at': met_at}, open(os.path.join(OUT, 'unmet_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            run.check('從新局一路玩到開學那一天（%s，%s）' % (END_KEY, end_reason or '時間到'), bool(end_reason), J({'days': days[-3:], 'met_at': met_at, 'min': round((time.time() - t_start) / 60, 1)}))
            allbad = [r for k, u in ui_log if u for r in u['bad']]
            NAMES = {'msg_contacts': '訊息頁上面的「傳訊息給」聯絡人列'}
            ST = await pg.evaluate("window.__PU.st")
            json.dump(ST, open(os.path.join(OUT, 'stage_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            for id_ in HER:
                off = next((x for x in ST if x['id'] == id_ and x['pre'] == 'STRANGER' and x['post'] != 'STRANGER' and not x['metD']), None)
                if off: run.note('[來源] %s 在相遇前 stage 離開 STRANGER：%s' % (id_, J(off)))
            for pn, nm in NAMES.items():
                bb = [r for r in allbad if r['panel'] == pn]
                run.check('選人面板 %s：開學前每個時段，沒有「不認識的…」、空白、透明（沒見過的人）、沒頭像的格子' % nm, not bb,
                          ('第一格 %s；共 %d 格次' % (J(bb[0]), len(bb))) if bb else '看了 %d 次' % len(ui_log))
            # 每位女主角：相遇前選人面板不能有她（格子的 data-th／data-noct／data-person＝她）
            for id_ in HER:
                bb = [r for r in allbad if r['pid'] == id_ or id_ in J(r['data'])]
                run.check('%s：相遇前（SOCIAL.metD）訊息頁聯絡人列沒有她的格子' % id_, not bb, ('第一格 %s' % J(bb[0])) if bb else '')
            # 附帶資訊：相遇前寫進 G.msgs 的她的訊息（不算 FAIL）
            for id_ in HER:
                ws = [w for w in W if w['fn'] != 'PHONE.join' and her_of(w.get('th'), None, w.get('who')) == id_ and w['met'].get(id_) is False]
                if ws: run.note('[附帶] %s 相遇前寫入 %d 筆，第一筆：%s' % (id_, len(ws), J(ws[0])))
            for k, r in scans_first.items(): run.note('[附帶] 不開 UI 的掃描第一次看到：%s %s' % (k, J(r)))
            run.check('沒有 JS 例外（pageerror）', not errs, '; '.join(errs[:5]))
        except SystemExit:
            pass
        except Exception:
            run.check('探針流程沒有例外', False, traceback.format_exc()[-1500:])
        finally:
            await b.close()
    n = len(run.fails)
    print('用時 %d 秒' % (time.time() - t_start))
    print('ALL PASS' if n == 0 else 'FAILED %d' % n, flush=True)
    sys.exit(0 if n == 0 else 1)


asyncio.run(main())
