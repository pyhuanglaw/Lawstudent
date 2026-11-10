"""CC（帳號 A）11-10：GIFT-HOLIDAY-1110「節日送禮」瀏覽器探針（LAWWW 09:47／09:49 交、BB 09:49 排）。
開發分支：新版＝509b54c2d（送 love 的「她的戀愛 +2」改成認識就算）；舊版＝fda54d616（合併 d4ea487b7 的上一個，gifthol3d.js 還沒有）。
規則照 src/gifthol3d.js 開頭的註解（AA_732 rules）與 tests/gift_holiday_unit.js：
  - 節日＝聖誕（12/24、12/25）、2/14、七夕（FEST_DATA.QIXI）、她的生日（FEST_DATA.BDAY）；當面說話（STORY.offerInvite 的選單）多「送她禮物…」→ 挑包包裡的一樣。
  - 平常日沒有「送她禮物…」。
  - 同一個節日最多送兩個人（生日不限）：第三個人的「送她禮物…」灰掉，按下去演 third 旁白。
  - 她送祐廷（AA_734）：聖誕第 4 階起（B）、2/14 七夕第 6 階或交往中；當面那天給（你沒送也給）。交往中、她那天不在臺北＝宿舍信箱的包裹（進 dorm 開頭的區域就演，S.tick→mailPlay）。
CASES（預設全跑）：xmas,valentine,qixi,birthday,normal,third,hergift,mailbox
第二輪（CC 13:1x，AA_732 d1bf75f6f＋5acf44bbc，LAWWW 8d8b475dc）：libbday（期末考前法圖小聲送禮）、counter_event／counter_order（芷若吧檯：店員事件演完／點餐選單）、sisbday_tea／sisbday_happy（學姊生日遞茶葉當天不再出送禮／選生日快樂照樣能送）——要寫 CASES 才跑
  xmas／valentine／qixi／birthday：用遊戲自己的作息（STORY.whereIs、HCIRCLE.on，暫時改 G.day／hour 掃完還原＝只讀）找「她當天在場、身邊沒有她圈子的人」的時段；
     讀檔到那裡（【前置／捷徑】）→ 站到她 7 m 外（【前置】）→ 走到她旁邊按「和她說話」→ 點對話 → 選單有「送她禮物…」（沒灰）→ 按 → 選包包裡的那一樣 → 讀反應。
     記 SOCIAL.adjust 實際收到的值（love＝{trust:3,npcRom:2}；ok＝{trust:2}）。聖誕、生日送 love，2/14、七夕送 ok。
  normal：平常日同樣找她一個人的時段說話 → 選單沒有「送她禮物…」（舊版本來就沒有＝兩版都 PASS）。
  third：
     T-A（規格：同一節第三個收禮的人）：【捷徑】G.flags.GIFTH.fest['xmas|年']＝另外兩位（＝這個聖誕已經送了兩個人）→ 她的「送她禮物…」灰掉、按下去演 third 旁白、包包不少。
     T-B（BB 09:49 的要求：旁邊真的有第三個人）：掃節日的作息找 HCIRCLE 同框列成立的時段（不用 JS 塞人），讀檔後用遊戲自己的 STORY.crowdNow／HCIRCLE.withNow 確認 3D 裡她旁邊真的有人，
          走過去說話看「送她禮物…」灰不灰。注意：AA_732 規格沒有「旁邊有人就灰掉」這條（「送她禮物…」不是 priv 選項，offerInvite 只擋 priv 與「約她去…」）——
          預設只記 INFO；THIRD_BYSTANDER=strict 才算成判定。找不到真實同框時段＝FAIL（印出掃過的候選）。
  hergift：聖誕當天找她（遊戲裡 GIFTH.herCell 成立的人），說話、選單選「就這樣」（你沒送）→ 她送你（scene＋lines），recv 多一筆。
  mailbox：交往中、節日那天她不在臺北（STORY.presence here=false）的人；存檔裡沒有就【捷徑】設 flags.dating_<她>；讀檔到校園宿舍門口 6 m 外，走進宿舍 → 包裹旁白＋卡片。
     （遊戲的做法：進 dorm 開頭的區域就自動演，不是按「看信箱」；探針另外走到「看信箱」按一次，只記 INFO。）
BB 12:39：love 那兩段（xmas、birthday）送完以後加查「包包沒有那一樣」＋手機人物頁「她喜歡」有它（她當天回送的也要在「她送的」）。third 照 AA_732（同節日第三個收禮人），旁邊有人只記 INFO、不開 strict。
存檔：tests/fixtures/user_save_day54_1110.json（以安熟悉 100、信任 51、自在 64＝第 4 階；可昕交往中）。包包【前置／捷徑】＝G.flags.GIFTH.bag（[{id,day,shop}]，等於事先在店裡買好）。
條件事件：讀檔用 quiet_events（關 EVENTS.onEnter／tick、手機自動打開）＝【前置】；送禮、她送你、信箱都不走條件事件。
候選：同一天先排不走動的（「走走」排最後）、圖書館排後面；一個候選說完話沒有出說話最後的選單（offerInvite，有「就這樣」）就換下一個，最多三個。
11-10 雲端試跑（新版 509b54c2d）看到的（遊戲行為，只記）：
  - 期末考前的圖書館（2026-06-02 學姊在法圖）說話走 src/examlib3d.js 的「（小聲）」那一套，沒有 offerInvite 選單＝她生日那天在那裡送不了（規格沒寫圖書館例外；列給 BB／LAWWW 判）。
  - 吧檯後面上班的芷若（12/24 11:00 兩點半）：說話＝點餐（talkCharacter 的 n.staff），沒有 offerInvite 選單＝她上班時送不了（探針跳過這種候選；列給 BB／LAWWW 判）。
  - 2026-12-24 語彤和黃筱涵同框（HCIRCLE c505_3_2，3D 裡 crowdNow true）：「送她禮物…」沒有灰掉（＝照 AA_732，不是 bug；BB 的「旁邊有人就灰」規格沒有）。
判定：PASS／FAIL／INFO，最後 ALL PASS 或 FAILED n。
用法：LW_TESTS=<樹>/tests TAG=new|old [CASES=xmas,third] [THIRD_BYSTANDER=strict] python3 cc_gift_holiday_probe.py <url> <out>（URL 不加 ?turbo）"""
import os, sys, json, asyncio, time, copy, subprocess, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
TAG = os.environ.get('TAG') or 'new'
FIX = 'tests/fixtures/user_save_day54_1110.json'
FIX_SHA = '509b54c2d9d7a2f1ab6f227124abeb4d30747db6'
STRICT_B = (os.environ.get('THIRD_BYSTANDER') or '').lower() == 'strict'
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
ALL = ['xmas', 'valentine', 'qixi', 'birthday', 'normal', 'third', 'hergift', 'mailbox']
ALL2 = ['libbday', 'counter_event', 'counter_order', 'sisbday_tea', 'sisbday_happy']   # 第二輪（只跑新版：CASES=libbday,counter_event,…）
CASES = [c.strip() for c in (os.environ.get('CASES') or ','.join(ALL)).split(',') if c.strip()]
PEOPLE = ['heroine_01', 'heroine_05', 'heroine_03', 'heroine_02', 'classmate_peishan', 'heroine_04', 'classmate_xinci', 'kexin']
GIVE = '送她禮物…'
MAIL_NARR = '（宿舍的信箱裡有一個包裹，寄件人寫著她的名字。）'
HOURS = [9.0 + 0.5 * i for i in range(25)]   # 09:00～21:00
OK_ZONES_FIRST = ['campus', 'cafe', 'wancai', 'linze', 'wz_teahouse', 'wenzhou', 'gongguan', 'library_hall', 'soclib', 'library', 'lawlib']   # 圖書館排後面：期末考前的圖書館說話是「（小聲）」那一套（src/examlib3d.js），不出 offerInvite 的選單（11-10 雲端試跑：學姊 6/2 在法圖）


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, s=''):
    print('INFO ' + name + (('  ' + s) if s else ''), flush=True)


class Run:   # playlib.go_to／bbplay 要的介面
    def __init__(self): self.n = 0
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, s=''): return check(n, ok, s)
    def setup(self, s): print('  [前置／捷徑] ' + s, flush=True)
    async def shot(self, pg, label):
        self.n += 1; p = os.path.join(OUT, '%s_%02d_%s.png' % (TAG, self.n, label))
        try: await pg.screenshot(path=p)
        except Exception as e: print('  screenshot failed', e)
        return p


def load_fixture():
    env = os.environ.get('SAVE')
    if env and os.path.exists(env): return json.load(open(env, encoding='utf-8')), env
    lt = os.environ.get('LW_TESTS')
    if lt:
        p = os.path.join(lt, 'fixtures', os.path.basename(FIX))
        if os.path.exists(p): return json.load(open(p, encoding='utf-8')), p
        r = subprocess.run(['git', '-C', lt, 'show', FIX_SHA + ':' + FIX], capture_output=True)
        if r.returncode == 0: return json.loads(r.stdout.decode('utf-8')), 'git show %s:%s（%s 的物件）' % (FIX_SHA[:9], FIX, lt)
    here = os.path.dirname(os.path.abspath(__file__))
    r = subprocess.run(['git', '-C', here, 'show', FIX_SHA + ':' + FIX], capture_output=True)
    if r.returncode == 0: return json.loads(r.stdout.decode('utf-8')), 'git show %s:%s（探針所在的 repo）' % (FIX_SHA[:9], FIX)
    return None, None


ADJ_HOOK = """(()=>{ if(window.__ADJH) return window.__ADJ.length; window.__ADJH=1; window.__ADJ=[]; const a0=SOCIAL.adjust;
  SOCIAL.adjust=function(id,d){ try{ window.__ADJ.push({id, d:JSON.parse(JSON.stringify(d||{})), day:GAME.G.day, h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return a0.apply(this,arguments); };
  return 0; })()"""

# 遊戲自己的作息掃描（只讀：暫時改 G.day／weekday／hour，finally 還原）。mode alone＝她的圈子同框列都不成立；crowd＝至少一列成立
CAND_JS = r"""((a)=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}, out=[], seen=[];
  const hasH=typeof GIFTH!=='undefined', hasC=typeof HCIRCLE!=='undefined';
  try{ for(const k of a.keys){ const d=STORY.dayOfKey(k); if(d==null||d<a.minDay) continue; const c=CALENDAR.dateOf(d); G.day=d; G.weekday=c.wd===7?0:c.wd;
      for(const p of a.pids){ const bk=a.bday?((typeof FEST_DATA!=='undefined'&&FEST_DATA.BDAY)||{})[p]:null; if(a.bday&&!(bk&&k.slice(5)===bk)) continue;
        const hol=hasH?GIFTH.holOf(p,d):null; if(a.kind==='normal'?!!hol:(hasH&&!(hol&&hol.k===a.kind))) continue;
        let can=null; if(hasH){ G.hour=12; can=GIFTH.canGet(G,p); if(a.kind!=='normal'&&!can) continue; }
        for(const h of a.hours){ G.hour=h; const w=STORY.whereIs(GAME,p); if(!w||!w.zone) continue;
          const rows=hasC?(HCIRCLE.BY_WHO[p]||[]).filter(r=>!r.alone&&HCIRCLE.on(r,G,w.zone)).map(r=>r.id+':'+(r.with||[]).join('+')):[];
          const rec={k,d,wd:G.weekday,p,h,zone:w.zone,act:w.act||'',rows,can}; seen.push(rec);
          if(/課|考/.test(rec.act)) continue;
          if(a.mode==='alone'?rows.length===0:rows.length>0) out.push(rec); } } } } finally { Object.assign(G,keep); }
  const rank=r=>{ const i=a.zones.indexOf(r.zone); return (/走走|散步|逛/.test(r.act)?100:0)+(i<0?50:i); };   /* 在走動的排後面（11-10 試跑：以安 18:00「走走」越走越遠，追 6 輪追不到）*/
  out.sort((x,y)=>(x.d-y.d)||(rank(x)-rank(y))||(x.h-y.h));
  return {out:out.slice(0,40), seen:seen.length, sample:seen.slice(0,30)}; })"""

# 送她的禮物（GIFT_HOLIDAY 裡她 love／ok 的、店裡買得到的）
ITEMS_JS = r"""((p)=>{ if(typeof GIFT_HOLIDAY==='undefined') return null; const X=GIFT_HOLIDAY, shopOf={}; for(const s in X.shops) for(const g of X.shops[s].items) if(!shopOf[g]) shopOf[g]=s;
  const ok=g=>{ const it=X.items[g]; return it&&shopOf[g]&&!(it.only&&!it.only.includes(p))&&!/warmer/.test(g); };
  const ids=Object.keys(X.items).filter(ok); const love=ids.find(g=>(X.items[g].love||[]).includes(p)), okk=ids.find(g=>!(X.items[g].love||[]).includes(p)&&!(X.items[g].no||[]).includes(p));
  const f=g=>g?{id:g,name:X.items[g].name,shop:shopOf[g]}:null; return {love:f(love), ok:f(okk), third:X.third}; })"""

STATE_JS = r"""((p)=>{ const G=GAME.G, H=typeof GIFTH!=='undefined'?GIFTH:null, R=H?H.rec(G):null;
  return {has:!!H, bag:R?R.bag.map(b=>b.id):null, sent:R?R.sent:null, fest:R?R.fest:null, recv:R?R.recv:null, got:R?R.got:null, mail:R?R.mail:null,
    st:H?H.state(G,p):null, crowd:(typeof STORY!=='undefined'&&STORY.crowdNow)?!!STORY.crowdNow(G,p,null,GAME):null,
    withNow:(typeof HCIRCLE!=='undefined'&&HCIRCLE.withNow)?HCIRCLE.withNow(GAME,p):null, stage:(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum(p):null,
    day:G.day, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), zone:G.zone}; })"""


AHEAD_JS = r"""((q)=>{ const E=GAME.E; let best=null; for(let r=0;r<=3;r+=0.25) for(let a=0;a<360;a+=30){ const x=q.x+r*Math.sin(a*Math.PI/180), z=q.z+r*Math.cos(a*Math.PI/180); if(E.canStand&&!E.canStand(x,z,0.3,q.lv|0)) continue; return {x:+x.toFixed(2),z:+z.toFixed(2)}; } return best; })"""
RING_JS = r"""((id)=>{ const E=GAME.E, n=__BBF.npc(id); if(!n||!n.obj) return null; const h=n.obj.position, lv=n.lv|0, out=[];
  const its=E.interactables.filter(i=>!i.hidden&&((i.lv|0)===lv));
  for(const r of [0.6,0.75,0.9,1.1]) for(let k=0;k<16;k++){ const a=k*Math.PI/8, x=h.x+Math.sin(a)*r, z=h.z+Math.cos(a)*r; if(E.canStand&&!E.canStand(x,z,0.3,lv)) continue;
    let di=9; for(const i of its){ di=Math.min(di,Math.hypot(i.x-x,i.z-z)); if(i.seat) di=Math.min(di,Math.hypot(i.seat.x-x,i.seat.z-z)); }
    out.push({x:+x.toFixed(2),z:+z.toFixed(2),dh:+r.toFixed(2),di:+di.toFixed(2),sc:di-r}); }
  out.sort((p,q)=>q.sc-p.sc); return out.slice(0,6); })"""


async def hooks(pg):
    await P.init(pg); await P.say_hook(pg); await pg.evaluate(ADJ_HOOK)


async def gstate(pg, pid):
    return await pg.evaluate(STATE_JS, pid)


async def opts_now(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>({t:(b.childNodes[0]&&b.childNodes[0].textContent||b.textContent||'').trim(),full:(b.textContent||'').trim(),dim:!!(b.disabled||b.classList.contains('dim'))}))")


async def say_n(pg):
    return len(await pg.evaluate("window.__SAY||[]"))


async def adj_since(pg, n0, pid):
    return [x for x in (await pg.evaluate("window.__ADJ||[]"))[n0:] if x['id'] == pid]


def keys_for(kind, pid=None):
    ks = []
    if kind == 'xmas':
        for y in (2025, 2026, 2027): ks += ['%d-12-24' % y, '%d-12-25' % y]
    elif kind == 'vday':
        ks = ['%d-02-14' % y for y in (2026, 2027, 2028)]
    elif kind == 'qixi':
        ks = ['2026-08-19', '2027-08-08', '2028-08-26']
    elif kind == 'bday':
        bd = {'heroine_01': '09-15', 'heroine_02': '09-28', 'heroine_03': '07-09', 'heroine_04': '02-10', 'heroine_05': '06-02', 'classmate_peishan': '03-15', 'kexin': '04-24', 'classmate_xinci': '03-28'}
        for p in ([pid] if pid else PEOPLE):
            for y in (2026, 2027): ks.append('%d-%s' % (y, bd[p]))
        ks = sorted(set(ks))
    elif kind == 'normal':
        ks = ['2025-11-%02d' % d for d in (4, 5, 6, 11, 12, 13, 18, 19, 20, 25, 26, 27)]
    return ks


async def candidates(pg, kind, mode, S, pids=None, bday=False):
    keys = keys_for('bday' if bday else kind)
    r = await pg.evaluate(CAND_JS, {'keys': keys, 'pids': pids or PEOPLE, 'hours': HOURS, 'mode': mode, 'kind': 'bday' if bday else kind, 'bday': bday, 'minDay': S['day'] + 1, 'zones': OK_ZONES_FIRST})
    return r


def mk_save(S, d, hour, zone, bag=None, flags=None, pos=None, ev_done=None):
    s = copy.deepcopy(S); s.pop('_stuck', None); s.pop('_busy', None)
    if ev_done:   # 第二輪：【前置／捷徑】這些事件今天已經演過（events.done +1、events.last＝今天）
        ev = s.setdefault('events', {}); dn = ev.setdefault('done', {}); ls = ev.setdefault('last', {})
        for e in ev_done: dn[e] = (dn.get(e) or 0) + 1; ls[e] = d['d']
    s.update(day=d['d'], weekday=d['wd'], hour=hour, zone=zone, pos=pos)
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') not in ('going', 'accepted')]
    f = s.setdefault('flags', {})
    if bag is not None: f['GIFTH'] = {'bag': [{'id': b['id'], 'day': d['d'] - 3, 'shop': b['shop']} for b in bag if b]}
    if flags: f.update(flags)
    return s


async def load_at(pg, cdp, run, S, rec, bag, why, flags=None, extra_gifth=None, ev_done=None):
    d = await P.day_of(pg, rec['k'])
    s = mk_save(S, d, rec['h'], rec['zone'], bag, flags, ev_done=ev_done)
    if extra_gifth: s['flags'].setdefault('GIFTH', {}).update(extra_gifth)
    await P.load(pg, cdp, s, quiet=True); await hooks(pg)
    run.setup('讀 day54 存檔（GAME.applySave、quiet_events）→ %s（星期 %s）%.2f %s；%s；包包 G.flags.GIFTH.bag＝%s%s%s' % (
        d['key'], d['wd'], rec['h'], rec['zone'], why, J([b and b['name'] for b in (bag or [])]), ('；flags ' + J(flags)) if flags else '', ('；GIFTH ' + J(extra_gifth)) if extra_gifth else '') + (('；【前置／捷徑】今天已經演過 ' + J(ev_done)) if ev_done else ''))
    return d


async def approach(pg, run, pid, tag):
    w = await P.wait_present(pg, pid, 75)
    if not w or w['hidden']:
        info('[%s] %s 不在這一區（或藏著）' % (tag, pid), J(w)); return None
    staff = await pg.evaluate("id=>{ const n=__BBF.npc(id); return n?(n.staff||null):null; }", pid)
    if staff:   # 吧檯後面的店員（兩點半的芷若）：和她說話＝點餐（story3d.js talkCharacter 的 n.staff 那一條，不走 offerInvite），也走不到吧檯後面——換下一個候選（11-10 試跑：12/24 11:00 芷若在吧檯）
        info('[%s] %s 在吧檯後面上班（staff=%s）：說話＝點餐、不出 offerInvite 選單，換下一個候選' % (tag, pid, staff)); return None
    if w['dMe'] > 9:
        await P.place_near(pg, run, w['x'], w['z'], 7.0, w['lv'], what=pid)
    return await P.who(pg, pid)


async def talk_menus(pg, cdp, run, pid, tag, policy, max_s=420):
    """像玩家：走到她旁邊（按鈕「和〈她〉說話」）→ 按 → 點對話；每一個選單交給 policy(opts, idx) 決定按哪一個（回傳 index）。
    回傳 {menus:[[{t,dim,full}]], picked:[t], said:[[名字,句子]], started}"""
    n0 = await say_n(pg); t0 = time.time(); tries = 0; menus = []; picked = []; started = False; rounds = 0
    while time.time() - t0 < max_s and tries < 3:
        g = await pg.evaluate("id=>__BBF.target(id)", pid)
        if not g: run.note('%s：%s 不在這一區' % (tag, pid)); break
        if not g['ok']:
            rounds += 1
            if rounds > 6: run.note('%s：走了 6 輪按鈕還不是「%s」（%s）' % (tag, g['want'], g['lab'])); break
            mv = None
            if rounds >= 2:
                w1 = await P.who(pg, pid); await pg.wait_for_timeout(1500); w2 = await P.who(pg, pid)
                if w1 and w2 and math.hypot(w2['x'] - w1['x'], w2['z'] - w1['z']) > 0.3: mv = (w1, w2)
            if mv:   # 她在走（和朋友一起走）：像玩家一樣繞到她前面等她走過來（追在後面追不上：11-10 試跑 T-B 語彤＋黃筱涵）
                w1, w2 = mv; dx, dz = w2['x'] - w1['x'], w2['z'] - w1['z']; ln = math.hypot(dx, dz) or 1
                ah = await pg.evaluate(AHEAD_JS, {'x': w2['x'] + dx / ln * 6, 'z': w2['z'] + dz / ln * 6, 'lv': w2['lv']})
                if ah:
                    await L.go_to(pg, cdp, run, ah['x'], ah['z'], 0.6, '%s：繞到她前面（她往 (%.1f, %.1f) 走）' % (tag, dx / ln, dz / ln), max_s=60, stop=lambda s, w=g['want']: s['interact'].startswith(w))
                    for _ in range(20):
                        if (await pg.evaluate("id=>__BBF.target(id)", pid) or {}).get('ok'): break
                        await pg.wait_for_timeout(750)
                continue
            if rounds >= 2 and g['d'] < 2.0:   # 已經在她旁邊、按鈕卻是旁邊的椅子（她坐著；遊戲：人只比 0.5 m 內的椅子優先）——像玩家一樣換個站的地方（離椅子遠、離她近）
                rings = await pg.evaluate(RING_JS, pid)
                for k_, rp in enumerate((rings or [])[:4]):
                    await L.go_to(pg, cdp, run, rp['x'], rp['z'], 0.15, '%s：換個站的地方 %d（離她 %.2f m、離最近的互動點 %.2f m）' % (tag, k_ + 1, rp['dh'], rp['di']), max_s=40, stop=lambda s, w=g['want']: s['interact'].startswith(w))
                    await pg.wait_for_timeout(700)
                    if (await pg.evaluate("id=>__BBF.target(id)", pid) or {}).get('ok'): break
                continue
            await L.go_to(pg, cdp, run, g['tx'], g['tz'], 0.55, '%s：她旁邊（第 %d 輪）' % (tag, rounds), max_s=(120 if rounds <= 2 else 25), stop=lambda s, w=g['want']: s['interact'].startswith(w))
            await pg.wait_for_timeout(500); continue
        tries += 1; m0 = len(menus)
        await L.tap(pg, cdp, '#interact')
        idle = None; st0 = time.time(); started_here = False
        while time.time() - t0 < max_s:
            q = await P.ts(pg)
            if q['phone'] and not q['ch'] and not q['dlg']: await L.phone_away(pg, cdp); continue
            if q['ch']:
                started = started_here = True; idle = None; o = await opts_now(pg); menus.append(o)
                k = await policy(o, len(menus) - 1)
                picked.append(o[k]['t'] if 0 <= k < len(o) else None); print('   [%s] 選單 %s → %s' % (tag, J([(x['t'], 'dim' if x['dim'] else '') for x in o]), picked[-1]), flush=True)
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
            if q['dlg']: started = started_here = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
            if q['busy'] or q['depth'] > 0: started = started_here = True; idle = None; await pg.wait_for_timeout(500); continue
            if not started_here:
                if time.time() - st0 > 8: break
            else:
                idle = idle or time.time()
                if time.time() - idle > 4: break
            await pg.wait_for_timeout(400)
        if not started_here: run.note('%s：按了沒有開始說話，再走近一次' % tag); continue
        if any(is_offer(m) for m in menus[m0:]): break   # 出了說話最後的選單（offerInvite：有「就這樣」）＝這次說話完整
        run.note('%s：說了話但沒有出說話最後的選單（offerInvite；可能是升階台詞、期末圖書館的小聲那一套、事件），再說一次' % tag)
    said = await P.said(pg, n0)
    run.note('%s：GAME.say %s' % (tag, J(said[-20:])))
    return {'menus': menus, 'picked': picked, 'said': said, 'started': started, 'offer': any(is_offer(m) for m in menus)}


def is_offer(m):
    return any(x['t'] == '就這樣' for x in m) or any(x['t'].startswith(GIVE) for x in m)


def find(o, pref):
    return next((i for i, x in enumerate(o) if x['t'].startswith(pref)), None)


def decline(o):
    for w in ('就這樣', '算了', '不用了', '先這樣'):
        k = find(o, w)
        if k is not None: return k
    return len(o) - 1



SECT_JS = """(()=>{ const out={}; for(const sp of document.querySelectorAll('#phoneBody span.muted')){ const t=(sp.textContent||'').trim(); if(t==='她喜歡'||t==='她送的'){ out[t]=(sp.parentElement.innerText||'').trim(); } } return out; })()"""


async def person_page(pg, cdp, run, pid, tag):
    """BB 12:39：送完 love 以後，手機 → 朋友 → 她的「資料」（GIFTH.personHTML 的「她喜歡」「她送的」）。照玩家點；回傳 (有沒有打開, 區塊文字)"""
    for _ in range(20):   # 等對話、選單都收掉（她可能接著回送）
        busy = await pg.evaluate("(()=>!!(GAME.D&&GAME.D.active)||!!document.querySelector('#choices:not(.hide) button'))()")
        if not busy: break
        if await pg.evaluate("!!(GAME.D&&GAME.D.active)"): await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    if not await pg.evaluate("(()=>{ const e=document.getElementById('phone'); return !!(e&&e.offsetParent!==null&&!e.classList.contains('hide')); })()"): return False, {'err': '手機沒打開'}
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]'); await pg.wait_for_timeout(1200)
    sel = '#phoneBody [data-person="%s"]' % pid
    if not await pg.evaluate("(s=>!!document.querySelector(s))", sel): return False, {'err': '朋友清單沒有 %s 的「資料」' % pid}
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    found = await pg.evaluate(SECT_JS); await run.shot(pg, '%s_person' % tag)
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(900)
    return True, found

async def holiday_case(pg, cdp, run, S, name, kind, cat, errs):
    print('== %s（%s；送 %s 類）' % (name, kind, cat), flush=True)
    c = await candidates(pg, kind, 'alone', S, bday=(kind == 'bday'))
    info('[%s] 作息掃描（只讀）：掃了 %d 筆、她一個人的候選 %d 筆' % (name, c['seen'], len(c['out'])), J([(x['k'], x['p'], x['h'], x['zone'], x['act']) for x in c['out'][:12]]))
    if not check('[%s] 前置：找到她當天在場、身邊沒有她圈子的人的時段' % name, bool(c['out']), J(c['sample'][:10])): return
    tried = 0; used = set(); tries_log = []
    for rec in c['out']:
        if (rec['k'], rec['p'], rec['zone']) in used: continue
        used.add((rec['k'], rec['p'], rec['zone'])); tried += 1
        if tried > 3: break
        pid = rec['p']; it = await pg.evaluate(ITEMS_JS, pid)
        bag = [it['love'], it['ok']] if it else [{'id': 'g_law_book', 'name': '（舊版沒有 GIFT_HOLIDAY）', 'shop': 'xs_shanlan'}]
        give = (it or {}).get(cat)
        await load_at(pg, cdp, run, S, rec, bag, '%s 那時候照作息在這一區（%s），HCIRCLE 同框列都不成立' % (pid, rec['act']))
        w = await approach(pg, run, pid, name)
        if not w: continue
        g0 = await gstate(pg, pid)
        info('[%s] 讀檔後' % name, J({k: g0[k] for k in ('key', 'h', 'zone', 'crowd', 'withNow', 'stage', 'bag', 'st')}))
        if g0['crowd']:
            info('[%s] 3D 裡她旁邊有人（STORY.crowdNow），換下一個候選' % name, J(g0['withNow'])); continue
        check('[%s] 前置：%s %s %.2f 她在 %s、身邊沒有別人（STORY.crowdNow false）' % (name, g0['key'], pid, g0['h'], g0['zone']), g0['crowd'] is False or g0['crowd'] is None, J(g0['withNow']))
        a0 = len(await pg.evaluate("window.__ADJ||[]")); h0 = g0['h']; shots = {}
        state = {'gave_menu': False, 'item_menu': None}

        async def pol(o, i):
            k = find(o, GIVE)
            if k is not None and not state['gave_menu']:
                state['gave_menu'] = True; shots['menu'] = await run.shot(pg, '%s_menu' % name); state['give_opt'] = o[k]; return k
            if state['gave_menu'] and state['item_menu'] is None and give and find(o, give['name']) is not None:
                state['item_menu'] = o; shots['items'] = await run.shot(pg, '%s_items' % name); return find(o, give['name'])
            return decline(o)
        r = await talk_menus(pg, cdp, run, pid, '[%s] 和 %s 說話' % (name, pid), pol)
        g1 = await gstate(pg, pid); adj = await adj_since(pg, a0, pid)
        await run.shot(pg, '%s_after' % name)
        allm = [[x['t'] for x in m] for m in r['menus']]
        gopt = state.get('give_opt')
        if not r['offer'] and not gopt:
            tries_log.append([rec['k'], pid, rec['h'], rec['zone'], r['said'][-3:]])
            info('[%s] 這個候選沒有出說話最後的選單（走不到她旁邊、或那裡說話不走 offerInvite），換下一個' % name, J(tries_log[-1])); continue
        if not check('[%s] 說話的選單有「%s」、沒有灰掉（%s，%s %s）' % (name, GIVE, pid, g0['key'], kind), bool(gopt) and not gopt['dim'], J({'選單': allm, 'opt': gopt})):
            if not r['menus']: info('[%s] 這次說話沒有出任何選單' % name)
            check('[%s] 沒有 JS 例外' % name, not errs, J(errs[:3])); return
        im = state['item_menu']
        check('[%s] 按下去出包包裡的禮物（有「%s」）' % (name, give and give['name']), bool(im), J(allm))
        key = '%s|%s|%s' % (pid, kind, g0['key'][:4])
        sent = (g1['sent'] or {}).get(key)
        handed = [x for x in r['said'] if x[1].startswith('你把' + (give['name'] if give else '???'))]
        check('[%s] 送出去：GIFTH.sent[%s]＝%s、包包少一樣（%s → %s）、旁白「你把%s遞給…」' % (name, key, give and give['id'], len(g0['bag'] or []), len(g1['bag'] or []), give and give['name']),
              bool(give) and sent == give['id'] and len(g1['bag'] or []) == len(g0['bag'] or []) - 1 and bool(handed), J({'sent': g1['sent'], 'bag': g1['bag'], 'handed': handed}))
        exp = {'trust': 3, 'npcRom': 2} if cat == 'love' else {'trust': 2}
        got = [x['d'] for x in adj]
        info('[%s] SOCIAL.adjust(%s) 實際收到' % (name, pid), J(adj))
        check('[%s] 好感：SOCIAL.adjust(%s, %s)（%s 類；她第 %s 階%s）' % (name, pid, J(exp), cat, g0['stage'], '，love 的戀愛 +2 認識就算＝509b54c2d' if cat == 'love' else ''), exp in got, J(got))
        if cat == 'love' and give:   # BB 12:39：送完 love 以後，人物頁有記錄、包包少了那一樣
            check('[%s] 包包裡沒有剛送出去的「%s」（%s）' % (name, give['name'], give['id']), give['id'] not in (g1['bag'] or []), J(g1['bag']))
            okp, found = await person_page(pg, cdp, run, pid, name)
            info('[%s] 人物頁（手機 → 朋友 → 資料）的區塊' % name, J(found))
            check('[%s] 人物頁「她喜歡」有剛送的 love「%s」' % (name, give['name']), okp and give['name'] in (found.get('她喜歡') or ''), J(found))
            gl = [x for x in (g1['recv'] or []) if x['pid'] == pid and x.get('k') == kind]
            if gl: check('[%s] 她當天回送的「%s」也在人物頁「她送的」' % (name, gl[-1]['item']), okp and gl[-1]['item'] in (found.get('她送的') or ''), J(found))
        info('[%s] 遊戲時間 %.2f → %.2f（送禮不扣時段：不 GM.advance）' % (name, h0, g1['h']))
        check('[%s] 沒有 JS 例外' % name, not errs, J(errs[:3]))
        return
    check('[%s] 說話的選單有「%s」（三個候選都沒有說到話、或沒有出說話最後的選單）' % (name, GIVE), False, J(tries_log))


async def normal_case(pg, cdp, run, S, errs):
    name = 'normal'; print('== normal（平常日沒有「送她禮物…」）', flush=True)
    c = await candidates(pg, 'normal', 'alone', S, pids=PEOPLE[:5])
    info('[normal] 候選', J([(x['k'], x['p'], x['h'], x['zone'], x['act']) for x in c['out'][:10]]))
    if not check('[normal] 前置：找到平常日她一個人的時段', bool(c['out']), J(c['sample'][:10])): return
    used = set(); n = 0
    for rec in c['out']:
        if (rec['p'], rec['zone']) in used: continue
        used.add((rec['p'], rec['zone'])); n += 1
        if n > 3: break
        pid = rec['p']; it = await pg.evaluate(ITEMS_JS, pid)
        bag = [it['love'], it['ok']] if it else []
        await load_at(pg, cdp, run, S, rec, bag, '平常日 %s 照作息在這一區（%s）；包包有禮物（＝買了先放著）' % (pid, rec['act']))
        if not await approach(pg, run, pid, name): continue
        g0 = await gstate(pg, pid)
        if g0['crowd']: info('[normal] 她旁邊有人，換下一個', J(g0['withNow'])); continue
        seen = {'shot': False}

        async def pol(o, i):
            if not seen['shot']: seen['shot'] = True; await run.shot(pg, 'normal_menu')
            return decline(o)
        r = await talk_menus(pg, cdp, run, pid, '[normal] 和 %s 說話' % pid, pol)
        allm = [[x['t'] for x in m] for m in r['menus']]
        info('[normal] %s %s %.2f 的選單' % (g0['key'], pid, g0['h']), J(allm))
        if not r['offer']: info('[normal] 沒有出說話最後的選單，換下一個', J(r['said'][-3:])); continue
        check('[normal] 說到話、出了說話最後的選單（%s %s）' % (g0['key'], pid), r['started'] and r['offer'], J(r['said'][-4:]))
        check('[normal] 平常日（%s）當面說話沒有「%s」（舊版本來就沒有＝兩版都 PASS）' % (g0['key'], GIVE), not any(x.startswith(GIVE) for m in allm for x in m), J(allm))
        check('[normal] 沒有 JS 例外', not errs, J(errs[:3]))
        return
    check('[normal] 前置：三個候選都找得到她一個人', False)


async def third_case(pg, cdp, run, S, errs):
    print('== third', flush=True)
    # ---- T-A：規格（同一節第三個收禮的人）
    c = await candidates(pg, 'xmas', 'alone', S)
    info('[third T-A] 聖誕她一個人的候選', J([(x['k'], x['p'], x['h'], x['zone']) for x in c['out'][:10]]))
    done = False
    if check('[third T-A] 前置：找到聖誕她一個人的時段', bool(c['out']), J(c['sample'][:8])):
        used = set(); n = 0
        for rec in c['out']:
            if (rec['k'], rec['p'], rec['zone']) in used: continue
            used.add((rec['k'], rec['p'], rec['zone'])); n += 1
            if n > 3: break
            pid = rec['p']; it = await pg.evaluate(ITEMS_JS, pid)
            bag = [it['love'], it['ok']] if it else []
            others = [p for p in PEOPLE[:5] if p != pid][:2]
            fest = {'fest': {'xmas|%s' % rec['k'][:4]: others}}
            await load_at(pg, cdp, run, S, rec, bag, '%s 那時候在這一區；【捷徑】這個聖誕已經送了兩個人' % pid, extra_gifth=fest)
            if not await approach(pg, run, pid, 'third'): continue
            g0 = await gstate(pg, pid)
            if g0['crowd']: info('[third T-A] 她旁邊有人，換下一個', J(g0['withNow'])); continue
            n0 = await say_n(pg); state = {'opt': None}

            async def pol(o, i):
                k = find(o, GIVE)
                if k is not None and state['opt'] is None:
                    state['opt'] = o[k]; await run.shot(pg, 'third_A_dim'); return k   # 灰掉的也按（玩家會按按看）
                return decline(o)
            r = await talk_menus(pg, cdp, run, pid, '[third T-A] 和 %s 說話' % pid, pol)
            g1 = await gstate(pg, pid); said = await P.said(pg, n0)
            o = state['opt']
            if not r['offer'] and not o: info('[third T-A] 沒有出說話最後的選單，換下一個', J(said[-3:])); continue
            check('[third T-A] 這個聖誕已經送了兩個人（%s）：%s 的「%s」灰掉、提示「這個節日已經送了兩個人」' % (J(others), pid, GIVE), bool(o) and o['dim'] and '已經送了兩個人' in o['full'], J(o))
            th = (it or {}).get('third') or []
            check('[third T-A] 按下去演 third 旁白（%s 其中一句）、沒有送出、包包不變' % J(th),
                  bool(o) and any(x[1] in th for x in said) and not any(k.startswith(pid + '|xmas') for k in (g1['sent'] or {})) and (g1['bag'] == g0['bag']), J({'said': said[-6:], 'sent': g1['sent'], 'bag': [g0['bag'], g1['bag']]}))
            await run.shot(pg, 'third_A_after')
            done = True; break
        if not done: check('[third T-A] 「%s」灰掉（三個候選都沒有出說話最後的選單）' % GIVE, False)
    # ---- T-B：BB 要求的「旁邊真的有第三個人」
    seen_all = []; found = None; crowd_ok = []; tries = 0
    for kind in ('xmas', 'vday', 'qixi', 'bday'):
        cc = await candidates(pg, kind, 'crowd', S, bday=(kind == 'bday'))
        seen_all += [(kind, x['k'], x['p'], x['h'], x['zone'], x['rows']) for x in cc['out'][:8]]
        used = set(); n = 0
        for rec in cc['out']:
            if (rec['k'], rec['p'], rec['zone']) in used: continue
            used.add((rec['k'], rec['p'], rec['zone'])); n += 1
            if n > 2 or tries >= 4: break
            tries += 1
            pid = rec['p']; it = await pg.evaluate(ITEMS_JS, pid)
            bag = [it['love'], it['ok']] if it else []
            await load_at(pg, cdp, run, S, rec, bag, '%s 那時候和圈子的人同框（HCIRCLE %s；遊戲自己生的人，不是 JS 塞的）' % (pid, J(rec['rows'])))
            if not await approach(pg, run, pid, 'third-B'): continue
            await pg.wait_for_timeout(3000); g0 = await gstate(pg, pid)
            info('[third T-B] 讀檔後 3D：crowdNow %s withNow %s' % (g0['crowd'], J(g0['withNow'])))
            if not g0['crowd']: continue
            crowd_ok.append([g0['key'], pid, g0['h'], g0['zone'], g0['withNow']])
            state = {'opt': None}

            async def polb(o, i):
                k = find(o, GIVE)
                if k is not None and state['opt'] is None: state['opt'] = o[k]; await run.shot(pg, 'third_B_menu')
                return decline(o)
            r = await talk_menus(pg, cdp, run, pid, '[third T-B] 和 %s 說話（旁邊 %s）' % (pid, J(g0['withNow'])), polb)
            g1 = await gstate(pg, pid)
            if not r['offer'] and not state['opt']:
                info('[third T-B] 沒有說到話／沒有出說話最後的選單（她和朋友在走動，追不上），換下一個', J(r['said'][-3:])); continue
            found = (kind, rec, g0, g1, r, state['opt']); break
        if found: break
    info('[third T-B] 掃過的同框候選（前 8 筆／節）', J(seen_all))
    if not check('[third T-B] 前置：找到節日裡她旁邊真的有她圈子的人的時段（作息掃描＋3D 的 STORY.crowdNow 都成立）', bool(crowd_ok), J(seen_all[:20])):
        check('[third] 沒有 JS 例外', not errs, J(errs[:3])); return
    if not check('[third T-B] 前置：在那個時段走到她旁邊說到話、出了說話最後的選單（3D 裡同框成立的 %s）' % J(crowd_ok), bool(found), J(crowd_ok)):
        check('[third] 沒有 JS 例外', not errs, J(errs[:3])); return
    kind, rec, g0, g1, r, o = found
    allm = [[x['t'] for x in m] for m in r['menus']]
    info('[third T-B] %s %s %.2f %s，旁邊 %s（說完話時 %s）：選單 %s；「%s」＝%s' % (g0['key'], rec['p'], g0['h'], g0['zone'], J(g0['withNow']), J(g1['withNow']), J(allm), GIVE, J(o)))
    msg = '[third T-B] 旁邊有第三個人（%s %s 旁邊 %s）時「%s」灰掉（BB 的定義；AA_732 規格沒有這條）' % (g0['key'], rec['p'], J(g0['withNow']), GIVE)
    if STRICT_B: check(msg, bool(o) and o['dim'], J(o))
    else: info(msg + '（THIRD_BYSTANDER=strict 才判定）：' + ('灰掉' if (o and o['dim']) else ('沒有灰掉' if o else '選單沒有這一項')), J(o))
    check('[third] 沒有 JS 例外', not errs, J(errs[:3]))


HERCELL_JS = r"""((a)=>{ if(typeof GIFTH==='undefined') return null; const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}, out=[];
  try{ for(const k of a.keys){ const d=STORY.dayOfKey(k); if(d==null||d<a.minDay) continue; const c=CALENDAR.dateOf(d); G.day=d; G.weekday=c.wd===7?0:c.wd; G.hour=12;
      for(const p of a.pids){ const h=GIFTH.holOf(p,d); if(!h||!GIFTH.HER_K.includes(h.k)) continue; const cell=GIFTH.herCell(G,p,h.k,h.y,d); if(!cell) continue;
        const pr=STORY.presence(p,G); out.push({k,p,hk:h.k,y:h.y,band:cell.band,here:!(pr&&pr.here===false),kind:pr&&pr.kind||null,away:pr&&pr.away||null,dating:!!(G.flags['dating_'+p]||(((G.flags.romance||{})[p]||{}).status==='dating'))}); } } } finally { Object.assign(G,keep); }
  return out; })"""


async def hergift_case(pg, cdp, run, S, errs):
    name = 'hergift'; print('== hergift（她送祐廷，AA_734）', flush=True)
    hc = await pg.evaluate(HERCELL_JS, {'keys': keys_for('xmas') + keys_for('vday') + keys_for('qixi'), 'pids': PEOPLE, 'minDay': S['day'] + 1})
    info('[hergift] GIFTH.herCell 成立的（人、節日；只讀）', J(hc))
    if not check('[hergift] 前置：存檔裡有她會送祐廷禮物的節日（GIFTH.herCell）', bool(hc), '舊版沒有 GIFTH' if hc is None else ''): return
    pids = sorted(set(x['p'] for x in hc if x['here']), key=PEOPLE.index)
    for kind in ('xmas', 'vday', 'qixi'):
        ks = [x for x in hc if x['hk'] == kind and x['here']]
        if not ks: continue
        c = await candidates(pg, kind, 'alone', S, pids=[x for x in pids if any(y['p'] == x and y['hk'] == kind for y in ks)])
        okc = [x for x in c['out'] if any(y['k'][:4] == x['k'][:4] and y['p'] == x['p'] for y in ks)]
        info('[hergift] %s 她一個人的候選' % kind, J([(x['k'], x['p'], x['h'], x['zone']) for x in okc[:8]]))
        used = set(); n = 0
        for rec in okc:
            if (rec['k'], rec['p'], rec['zone']) in used: continue
            used.add((rec['k'], rec['p'], rec['zone'])); n += 1
            if n > 3: break
            pid = rec['p']
            await load_at(pg, cdp, run, S, rec, [], '%s 那時候在這一區；包包空的（你沒有準備）' % pid)
            if not await approach(pg, run, pid, name): continue
            g0 = await gstate(pg, pid)
            if g0['crowd']: info('[hergift] 她旁邊有人，換下一個', J(g0['withNow'])); continue
            due = await pg.evaluate("(p=>{ const d=GIFTH.herDue(GAME.G,p); return d?{k:d.k,y:d.y,band:d.band,late:d.late,scene:GIFTH.text(GAME.G,d.cell.scene),lines:d.cell.lines.map(t=>GIFTH.text(GAME.G,t)),item:d.cell.item}:null; })", pid)
            info('[hergift] 說話前 GIFTH.herDue(%s)' % pid, J(due))
            if not due: continue
            r = await talk_menus(pg, cdp, run, pid, '[hergift] 和 %s 說話（不送）' % pid, lambda o, i: asyncio.sleep(0, decline(o)))
            g1 = await gstate(pg, pid); await run.shot(pg, 'hergift_after')
            if not r['offer'] and not r['said']: info('[hergift] 沒有說到話，換下一個'); continue
            txt = [x[1] for x in r['said']]
            body = [t for t in due['lines'] if not t.startswith('（')]
            hit = [t for t in body if any(t in s or s in t for s in txt)]
            rv = [x for x in (g1['recv'] or []) if x['pid'] == pid and x['k'] == due['k']]
            check('[hergift] %s %s 說完話（你沒送），她送你：演出她那一格（band %s）的台詞 %s' % (g0['key'], pid, due['band'], J(body)), bool(body) and len(hit) == len(body), J({'said': r['said'][-14:]}))
            check('[hergift] 收到的記下來（GIFTH.recv 有 %s 的「%s」、got[%s|%s|%s]）' % (pid, due['item'], pid, due['k'], due['y']), bool(rv) and rv[-1]['item'] == due['item'] and bool((g1['got'] or {}).get('%s|%s|%s' % (pid, due['k'], due['y']))), J({'recv': rv, 'got': g1['got']}))
            check('[hergift] 沒有 JS 例外', not errs, J(errs[:3]))
            return
    check('[hergift] 前置：找到她會送、當天在場一個人的時段', False, J(hc[:10]))


async def walk_into(pg, cdp, run, to_re, tag):
    exs = await pg.evaluate("((re)=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden&&new RegExp(re).test(i.exit.to||'')).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,r:i.radius||1,to:i.exit.to})))", to_re)
    info('[%s] 通往 %s 的出口' % (tag, to_re), J(exs))
    if not exs: return None, exs
    ex = exs[0]
    await P.place_near(pg, run, ex['x'], ex['z'], 6.0, ex['lv'], what='「%s」' % ex['label'])
    await L.go_to(pg, cdp, run, ex['x'], ex['z'], 0.6, '[%s] 走到「%s」' % (tag, ex['label']), max_s=150, lv=ex['lv'], stop=lambda s, l=ex['label']: s['interact'].startswith(l))
    for _ in range(10):
        s = await L.state(pg)
        if s['interact'].startswith(ex['label']): break
        await pg.wait_for_timeout(500)
    await L.tap(pg, cdp, '#interact')
    return ex, exs


async def mailbox_case(pg, cdp, run, S, errs):
    name = 'mailbox'; print('== mailbox（交往中、她不在臺北＝宿舍信箱包裹）', flush=True)
    keys = keys_for('xmas') + keys_for('vday') + keys_for('qixi')
    hc = await pg.evaluate(HERCELL_JS, {'keys': keys, 'pids': PEOPLE, 'minDay': S['day'] + 1})
    if not check('[mailbox] 前置：遊戲有 GIFTH（她送祐廷）', hc is not None, '舊版沒有 GIFTH'): return
    nat = [x for x in hc if x['dating'] and not x['here']]
    info('[mailbox] 存檔裡交往中的人在節日的狀態（只讀）', J([x for x in hc if x['dating']]))
    flags = None; rec = None
    if nat: rec = nat[0]; why = '存檔裡本來就交往中的 %s，%s 那天不在臺北（%s）' % (rec['p'], rec['k'], rec['away'] or rec['kind'])
    else:
        # 【捷徑】設 dating_<她>：找節日那天不在臺北的女主角（STORY.presence here=false），交往中＝聖誕第一年 D
        aw = await pg.evaluate(r"""((a)=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday}, out=[]; try{ for(const k of a.keys){ const d=STORY.dayOfKey(k); if(d==null||d<a.minDay) continue; const c=CALENDAR.dateOf(d); G.day=d; G.weekday=c.wd===7?0:c.wd; G.hour=12;
            for(const p of a.pids){ const h=GIFTH.holOf(p,d); if(!h||!GIFTH.HER_K.includes(h.k)) continue; const pr=STORY.presence(p,G); if(pr&&pr.here===false) out.push({k,p,hk:h.k,y:h.y,away:pr.away||pr.kind||''}); } } } finally { Object.assign(G,keep); } return out; })""",
                               {'keys': keys, 'pids': PEOPLE[:6], 'minDay': S['day'] + 1})
        info('[mailbox] 節日那天不在臺北的人（只讀）', J(aw))
        if not check('[mailbox] 前置：找到節日那天她不在臺北（STORY.presence here=false）的人', bool(aw), J(hc[:6])): return
        rec = aw[0]; flags = {'dating_' + rec['p']: True}
        why = '【捷徑】flags.dating_%s=true（存檔裡交往中的人節日都在臺北）；%s 那天她不在臺北（%s）' % (rec['p'], rec['k'], rec['away'])
    lrec = {'k': rec['k'], 'h': 10.0, 'zone': 'campus'}
    await load_at(pg, cdp, run, S, lrec, [], why, flags=flags)
    await pg.wait_for_timeout(2500)
    g0 = await gstate(pg, rec['p'])
    info('[mailbox] 讀檔後（還在校園）', J({k: g0[k] for k in ('key', 'h', 'zone', 'mail', 'got')}))
    n0 = await say_n(pg)
    ex, exs = await walk_into(pg, cdp, run, '^dorm', name)
    if not check('[mailbox] 校園有走進宿舍的門', bool(ex), J(exs)): return
    t0 = time.time(); said = []
    while time.time() - t0 < 120:
        q = await P.ts(pg)
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if q['ch']: o = await opts_now(pg); await P.tap_choice(pg, cdp, decline(o)); await pg.wait_for_timeout(900); continue
        said = await P.said(pg, n0)
        if any(x[1] == MAIL_NARR for x in said) and not q['busy'] and q['depth'] == 0 and time.time() - t0 > 10: break
        await pg.wait_for_timeout(600)
    said = await P.said(pg, n0); g1 = await gstate(pg, rec['p']); await run.shot(pg, 'mailbox_after')
    info('[mailbox] 進宿舍以後 GAME.say', J(said[-12:]))
    key = '%s|%s|%s' % (rec['p'], rec['hk'], rec['y'])
    m = (g1['mail'] or {}).get(key)
    check('[mailbox] 走進宿舍（%s）演包裹旁白「%s」' % (g1['zone'], MAIL_NARR), g1['zone'].startswith('dorm') and any(x[1] == MAIL_NARR for x in said), J(said[-8:]))
    cards = [x[1] for x in said if x[1].startswith('（卡片上寫著：')]
    check('[mailbox] 卡片（「（卡片上寫著：「…」）」至少一句）、mail[%s].played、recv 記 mail' % key,
          bool(cards) and bool(m and m.get('played')) and any(x['pid'] == rec['p'] and x.get('mail') for x in (g1['recv'] or [])), J({'cards': cards, 'mail': g1['mail'], 'recv': g1['recv']}))
    # 另外按「看信箱」（只記）
    it = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>i.label==='看信箱'&&!i.hidden); return i?{x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0}:null; })()")
    if it:
        n1 = await say_n(pg)
        await L.go_to(pg, cdp, run, it['x'], it['z'], 0.6, '[mailbox] 走到「看信箱」', max_s=120, lv=it['lv'], stop=lambda s: s['interact'].startswith('看信箱'))
        s = await L.state(pg)
        if s['interact'].startswith('看信箱'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
            for _ in range(10):
                q = await P.ts(pg)
                if not q['dlg']: break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600)
        info('[mailbox] 按「看信箱」的旁白（只記；包裹是進宿舍就演）', J(await P.said(pg, n1)))
        await run.shot(pg, 'mailbox_look')
    else: info('[mailbox] 這一區（%s）沒有「看信箱」' % g1['zone'])
    check('[mailbox] 沒有 JS 例外', not errs, J(errs[:3]))



# ---------------- 第二輪（AA_732 d1bf75f6f＋5acf44bbc；LAWWW 13:02 ④、BB 12:40）----------------
LIB_Z = ('lawlib', 'library', 'library_hall', 'soclib')
CNARR = '（她把東西收到吧檯下面。）'
QUIET = '（小聲）'


async def hername(pg, pid):
    return await pg.evaluate("(id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id)", pid)


def give_pol(state, give, run, pg, name):
    async def pol(o, i):
        k = find(o, GIVE)
        if k is not None and not state.get('gave_menu'):
            state['gave_menu'] = True; state['give_opt'] = o[k]; state['menu_all'] = [x['t'] for x in o]; await run.shot(pg, '%s_menu' % name); return k
        if state.get('gave_menu') and state.get('item_menu') is None and give and find(o, give['name']) is not None:
            state['item_menu'] = o; return find(o, give['name'])
        return decline(o)
    return pol


async def libbday_case(pg, cdp, run, S, errs):
    """② 期末考前在法圖（讀書區小聲那一套，examlib3d.js → GIFTH.libTalk）遇到生日的學姊：有「送她禮物…」、送了以後她的第一句前面是「（小聲）」"""
    name = 'libbday'; pid = 'heroine_05'; print('== %s（法圖期末考前、學姊生日）' % name, flush=True)
    c = await candidates(pg, 'bday', 'alone', S, pids=[pid], bday=True)
    cand = [x for x in c['out'] if x['zone'] in LIB_Z]
    info('[%s] 她生日那天在圖書館的時段' % name, J([(x['k'], x['h'], x['zone'], x['act']) for x in cand[:10]]))
    if not check('[%s] 前置：找到她生日那天在圖書館讀書區的時段' % name, bool(cand), J([(x['k'], x['h'], x['zone'], x['act']) for x in c['out'][:10]])): return
    tried = 0
    for rec in cand:
        tried += 1
        if tried > 3: break
        it = await pg.evaluate(ITEMS_JS, pid); bag = [it['love'], it['ok']] if it else []; give = (it or {}).get('love')
        y = rec['k'][:4]; ev = 'ev_sis_bday_y1' if y == '2026' else 'ev_sis_bday_y2'; fl = 'SIS_BDAY_Y1' if y == '2026' else 'SIS_BDAY_Y2'
        await load_at(pg, cdp, run, S, rec, bag, '學姊生日 %s 那時候照作息在 %s（%s）；生日原本的事件已經演過、選「生日快樂」（%s＝there：不算送過，照樣能送；只測法圖小聲送禮）' % (rec['k'], rec['zone'], rec['act'], fl),
                      flags={fl: 'there'}, ev_done=[ev, 'ev_sis_bday_date_y1' if y == '2026' else 'ev_sis_bday_date_y2'])
        exl = await pg.evaluate("(()=>{ const E=typeof EXLIB!=='undefined'?EXLIB:null; if(!E) return null; const o={}; for(const k of Object.keys(E)) if(typeof E[k]!=='function') o[k]=E[k]; let on=null; try{ on=E.on?E.on(GAME.G):(E.active?E.active(GAME.G):null); }catch(e){} return {on, keys:Object.keys(E).slice(0,20)}; })()")
        info('[%s] EXLIB（期末考前圖書館那一套）' % name, J(exl))
        w = await approach(pg, run, pid, name)
        if not w: continue
        g0 = await gstate(pg, pid); hn = await hername(pg, pid); state = {}
        r = await talk_menus(pg, cdp, run, pid, '[%s] 和學姊說話（法圖）' % name, give_pol(state, give, run, pg, name))
        if not r['started']: info('[%s] 沒說到話，換下一個時段' % name); continue
        g1 = await gstate(pg, pid); await run.shot(pg, '%s_after' % name)
        allm = [[x['t'] for x in m] for m in r['menus']]
        info('[%s] 選單' % name, J(allm))
        lib_style = any(m and all(x['t'] in (GIVE, '就這樣') or x['t'].startswith(GIVE) for x in m) for m in r['menus'])
        info('[%s] 走的是小聲那一套（選單只有「送她禮物…／就這樣」，沒有「約她去…」）＝%s' % (name, lib_style))
        gopt = state.get('give_opt')
        check('[%s] %s %s 法圖：選單有「%s」、沒有灰掉' % (name, g0['key'], g0['zone'], GIVE), bool(gopt) and not gopt['dim'], J(allm))
        key = '%s|bday|%s' % (pid, y)
        check('[%s] 送出去：GIFTH.sent[%s]＝%s、包包少一樣' % (name, key, give and give['id']), bool(give) and (g1['sent'] or {}).get(key) == (give and give['id']) and len(g1['bag'] or []) == len(g0['bag'] or []) - 1, J({'sent': g1['sent'], 'bag': g1['bag']}))
        said = r['said']; hi = next((i for i, x in enumerate(said) if x[1].startswith('你把')), None)
        first = next((x[1] for x in said[hi + 1:] if x[0] == hn), None) if hi is not None else None
        info('[%s] 遞出去以後她的第一句' % name, J(first))
        check('[%s] 遞出去以後她的第一句前面是「%s」' % (name, QUIET), bool(first) and first.startswith(QUIET), J(said[(hi or 0):(hi or 0) + 6]))
        check('[%s] 沒有 JS 例外' % name, not errs, J(errs[:3])); return
    check('[%s] 三個時段都沒說到話' % name, False, '')


async def counter_case(pg, cdp, run, S, errs, path):
    """③ 節日當天芷若在吧檯上班：path=event＝今天第一次說話（「兩點半的店員」演完接「送她禮物…」）；path=order＝今天的店員事件已經演過（直接點餐選單裡有「送她禮物…」）。送了以後旁白「（她把東西收到吧檯下面。）」"""
    name = 'counter_' + path; pid = 'heroine_02'; print('== %s（芷若在吧檯，%s）' % (name, '店員事件演完' if path == 'event' else '點餐選單'), flush=True)
    cand = []
    for kind in ('xmas', 'vday', 'qixi'):
        c = await candidates(pg, kind, 'alone', S, pids=[pid])
        cand += [dict(x, kind=kind) for x in c['out'] if x['zone'] == 'cafe']
    info('[%s] 節日她在 Café 的時段' % name, J([(x['k'], x['h'], x['act']) for x in cand[:10]]))
    if not check('[%s] 前置：找到節日她在 Café 的時段' % name, bool(cand), ''): return
    tried = 0
    for rec in cand:
        tried += 1
        if tried > 4: break
        it = await pg.evaluate(ITEMS_JS, pid); bag = [it['love'], it['ok']] if it else []; give = (it or {}).get('love')
        await load_at(pg, cdp, run, S, rec, bag, '%s 芷若照作息在 Café（%s）' % (rec['k'], rec['act']), ev_done=(['ev_cafe_barista_zhiruo'] if path == 'order' else None))
        w = await P.wait_present(pg, pid, 75)
        staff = await pg.evaluate("id=>{ const n=__BBF.npc(id); return n?(n.staff||null):null; }", pid)
        if not w or w['hidden'] or staff != 'cafe': info('[%s] 她不在吧檯（staff=%s）' % (name, staff), J(w)); continue
        if w['dMe'] > 9: await P.place_near(pg, run, w['x'], w['z'], 7.0, w['lv'], what=pid)
        # r2（CC 14:2x）：r1 talk_menus 想走到她旁邊 (−3.5, −5.1)＝吧檯後面走不到＝TEST_BUG；店員 2.2 m 內就比點餐點優先（engine3d.js nearestInteractable），站吧檯前 (−2.5, −3.3) 離她 1.85 m
        await L.go_to(pg, cdp, run, -2.5, -3.3, 0.35, '[%s] 走到吧檯前（點餐點）' % name, max_s=90)
        await pg.wait_for_timeout(1000)
        lab = await pg.evaluate("(()=>{ const ib=document.getElementById('interact'); return ib&&ib.offsetParent!==null?(ib.innerText||'').trim():''; })()")
        info('[%s] 站在吧檯前，互動按鈕' % name, J(lab))
        g0 = await gstate(pg, pid); state = {}
        r = await talk_menus(pg, cdp, run, pid, '[%s] 和吧檯的芷若說話' % name, give_pol(state, give, run, pg, name))
        if not r['started']: info('[%s] 沒說到話，換下一個時段' % name); continue
        g1 = await gstate(pg, pid); await run.shot(pg, '%s_after' % name)
        allm = [[x['t'] for x in m] for m in r['menus']]; said = r['said']
        info('[%s] 選單' % name, J(allm))
        gopt = state.get('give_opt'); menu_all = state.get('menu_all') or []
        if path == 'order': info('[%s] 有「送她禮物…」的那個選單是點餐選單（有飲料、價錢）＝%s' % (name, any('元' in t for t in menu_all)), J(menu_all))
        else: info('[%s] 有「送她禮物…」的那個選單＝店員事件演完以後問的（%s）' % (name, J(menu_all)))
        check('[%s] %s 吧檯的芷若：選單有「%s」、沒有灰掉' % (name, g0['key'], GIVE), bool(gopt) and not gopt['dim'], J(allm))
        kk = rec['kind'] if rec['kind'] != 'vday' else 'vday'; key = '%s|%s|%s' % (pid, kk, rec['k'][:4])
        sent = (g1['sent'] or {}).get(key)
        check('[%s] 送得出去：GIFTH.sent[%s]＝%s、包包少一樣' % (name, key, give and give['id']), bool(give) and sent == give['id'] and len(g1['bag'] or []) == len(g0['bag'] or []) - 1, J({'sent': g1['sent'], 'bag': g1['bag']}))
        check('[%s] 送完旁白「%s」' % (name, CNARR), any(x[1] == CNARR for x in said), J(said[-8:]))
        check('[%s] 沒有 JS 例外' % name, not errs, J(errs[:3])); return
    check('[%s] 四個時段都沒在吧檯說到話' % name, False, '')


async def sisbday_case(pg, cdp, run, S, errs, pick):
    """④ 學姊生日（2026-06-02 Café 19:00～22:00）原本的事件：pick=tea＝遞茶葉 → 當天不再出「送她禮物…」；pick=happy＝「生日快樂」（沒給東西）→ 當天照樣能送（AA_732 5acf44bbc）"""
    name = 'sisbday_' + pick; pid = 'heroine_05'; print('== %s（學姊生日原本的事件，選%s）' % (name, '遞茶葉' if pick == 'tea' else '生日快樂'), flush=True)
    c = await candidates(pg, 'bday', 'alone', S, pids=[pid], bday=True)
    cand = [x for x in c['out'] if x['k'] == '2026-06-02' and x['zone'] == 'cafe' and x['h'] >= 19]
    if not check('[%s] 前置：2026-06-02 19 點以後她在 Café' % name, bool(cand), J([(x['k'], x['h'], x['zone']) for x in c['out'][:10]])): return
    want = '（遞給她一包茶葉）' if pick == 'tea' else '「生日快樂。」'
    for rec in cand[:3]:
        it = await pg.evaluate(ITEMS_JS, pid); bag = [it['love'], it['ok']] if it else []
        await load_at(pg, cdp, run, S, rec, bag, '學姊生日 2026-06-02 %.2f 她在 Café（%s）' % (rec['h'], rec['act']))
        w = await approach(pg, run, pid, name)
        if not w: continue
        st = {'picked': None, 'give_after': []}

        async def pol(o, i):
            k = find(o, want)
            if k is not None and st['picked'] is None: st['picked'] = o[k]['t']; await run.shot(pg, '%s_event' % name); return k
            if find(o, GIVE) is not None: st['give_after'].append({'menu': [x['t'] for x in o], 'after_pick': st['picked'] is not None})
            return decline(o)
        r1 = await talk_menus(pg, cdp, run, pid, '[%s] 第一次說話（生日事件）' % name, pol)
        if st['picked'] is None: info('[%s] 這次說話沒出生日事件的選單，換時段' % name, J([[x['t'] for x in m] for m in r1['menus']])); continue
        flag = await pg.evaluate("(()=>GAME.G.flags.SIS_BDAY_Y1||null)()")
        check('[%s] 生日事件演了，選「%s」，SIS_BDAY_Y1＝%s' % (name, want, flag), flag == ('tea' if pick == 'tea' else 'there'), J(flag))
        await pg.wait_for_timeout(1500)
        r2 = await talk_menus(pg, cdp, run, pid, '[%s] 同一天再說一次話' % name, pol)
        allm = [[x['t'] for x in m] for m in r1['menus'] + r2['menus']]
        info('[%s] 兩次說話的選單' % name, J(allm))
        after = [x for x in st['give_after'] if x['after_pick']]
        if pick == 'tea':
            check('[%s] 遞過茶葉以後，同一天說話都沒有「%s」' % (name, GIVE), not after and bool(r2['started']), J({'give_after': after, 'r2_started': r2['started']}))
            g1 = await gstate(pg, pid)
            check('[%s] 記成那一年的生日禮物（GIFTH.sent[heroine_05|bday|2026]＝sis_bday_tea）' % name, (g1['sent'] or {}).get('heroine_05|bday|2026') == 'sis_bday_tea', J(g1['sent']))
        else:
            check('[%s] 選「生日快樂」（沒給東西），同一天說話照樣有「%s」' % (name, GIVE), bool(after), J({'give_after': st['give_after'], 'menus': allm}))
        check('[%s] 沒有 JS 例外' % name, not errs, J(errs[:3])); return
    check('[%s] 三個時段都沒演到生日事件' % name, False, '')

async def main():
    os.makedirs(OUT, exist_ok=True); run = Run()
    S, src = load_fixture()
    if not check('找到 day54 存檔', S is not None, src or '（SAVE、LW_TESTS/fixtures、git show 都沒有）'):
        print('FAILED %d' % len(FAILS), flush=True); return 1
    S = S.get('G', S); info('day54 來源', '%s；day %s %s %.2f；TAG=%s；CASES=%s' % (src, S.get('day'), S.get('zone'), S.get('hour') or 0, TAG, J(CASES)))
    plan = [('xmas', lambda pg, cdp, e: holiday_case(pg, cdp, run, S, 'xmas', 'xmas', 'love', e)),
            ('valentine', lambda pg, cdp, e: holiday_case(pg, cdp, run, S, 'valentine', 'vday', 'ok', e)),
            ('qixi', lambda pg, cdp, e: holiday_case(pg, cdp, run, S, 'qixi', 'qixi', 'ok', e)),
            ('birthday', lambda pg, cdp, e: holiday_case(pg, cdp, run, S, 'birthday', 'bday', 'love', e)),
            ('normal', lambda pg, cdp, e: normal_case(pg, cdp, run, S, e)),
            ('third', lambda pg, cdp, e: third_case(pg, cdp, run, S, e)),
            ('hergift', lambda pg, cdp, e: hergift_case(pg, cdp, run, S, e)),
            ('mailbox', lambda pg, cdp, e: mailbox_case(pg, cdp, run, S, e)),
            ('libbday', lambda pg, cdp, e: libbday_case(pg, cdp, run, S, e)),
            ('counter_event', lambda pg, cdp, e: counter_case(pg, cdp, run, S, e, 'event')),
            ('counter_order', lambda pg, cdp, e: counter_case(pg, cdp, run, S, e, 'order')),
            ('sisbday_tea', lambda pg, cdp, e: sisbday_case(pg, cdp, run, S, e, 'tea')),
            ('sisbday_happy', lambda pg, cdp, e: sisbday_case(pg, cdp, run, S, e, 'happy'))]
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        try:
            await pg.goto(URL)
            if check('遊戲載入', await L.wait_loaded(pg)):
                await P.load(pg, cdp, mk_save(S, {'d': S['day'], 'wd': S.get('weekday', 0)}, S.get('hour') or 12, S.get('zone') or 'campus'), quiet=True); await hooks(pg)
                for name, fn in plan:
                    if name not in CASES: continue
                    errs.clear(); t0 = time.time()
                    try: await fn(pg, cdp, errs)
                    except Exception as e:
                        check('[%s] 探針本身沒有例外' % name, False, repr(e)[:300])
                        try: await pg.screenshot(path=os.path.join(OUT, '%s_EXC_%s.png' % (TAG, name)))
                        except Exception: pass
                    info('[%s] 花了 %d 秒' % (name, time.time() - t0))
        finally:
            await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:12])), flush=True)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
