"""CC-C 11-12：⑭ GIFT-ALL-DRINK-SHOPS-1112（X350；BB-C 的判準）——使用者實玩時問「買飲料到底怎麼送」：三間店各買一杯「帶走送人」、當面送給三位不同的女主角。判定歸 BB；Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
受測 105d3d42c45f365136a1fe7046aed8b36c77b417（含 f8fdbb3ef1＋ba2c670798）；舊版對照 39afdff10a61922c3acef0b8b4fe2b649d9dc7ff（f8fdbb3ef1 的上一個：帝大紅茶、夜市、果茶社都還沒有「買一份帶走送人…」＝買的那幾項 FAIL 預期，D34）。
對照的程式（讀過）：src/gift3d.js（GIFT.SHOPS、GIFT.menu、GIFT.buy、GIFT.pick、GIFT.give、GIFT.talkOpts）、src/lane118.js S.order（果茶社 drink_b）、src/wzshops3d.js order364 'tea'（帝大紅茶，溫州街騎樓窗口「買一杯飲料」）、
  src/night_market3d.js NM3.serve（汀州路夜市 s01 沈三盃黑糖鮮奶，按鈕「看沈三盃黑糖鮮奶」）、src/story3d.js talkCharacter → offerInvite（STORY.TALK_OPTS：「送她○○」）；盤點表 docs/handoff/GIFT_DRINK_SHOPS_AUDIT_1112.md（#8、#16、#20）。
期望值的出處：
  價錢＝那間店自己的資料（LANE118_SHOPS drink_b.menu、WZS.AA364.tea.menu、NIGHT_MARKET.stalls.s01.items；不經過 GIFT.menu＝被測的那段）。
  她的反應＝企劃線 AA_710 定稿 86619c119（複本 fixtures/aa710_gifts_86619c119.json），照遊戲 gift3d.js S.pick 的規則挑格子：
    fav（第一次送到她最喜歡的那一樣，品名一字相同）＞ opinion（品名一字相同；gift3d.js match 是 e.n===c.n）＞ ctx（again、exam 期末週、night 晚上送早餐、winterCold 12～2 月送冰的、summerHot 6～8 月送熱的）
    ＞ yes（交往中那一格優先，不然 need≦DATE.stageNum 最高那一格；第一次送＝pool 第一組）。「（動作）＋話」拆成旁白＋她說的（gift3d.js play）。
  注意：遊戲 105d 的 src/data/gift_lines.js 是 AA_710@31c1c4e2c 匯入的，沒有 86619c119 新增的八格 opinion（yes／no／ctx 兩版一字相同，已比對）。
    所以挑到「AA_710 定稿有專屬句」的品項（可昕 百香果綠茶、沛珊 葡萄柚多多、學姊「紅茶」…）時，期望＝專屬句，遊戲會演一般句＝FAIL，判「遊戲還沒匯入定稿八格」（不是探針錯）。
CASES（每一 case：一間店 → 一位女主角；DRINK_<CASE> 可換品項）：
  L118  118 巷果茶社 → 可昕（預設 百香果綠茶）。可昕法律系那幾年沒有作息（src/data/characters.js 可昕那一段：「平常不在台大：沒有作息、不出現在 3D 校園」；daily_schedule＝[]），
        STORY.whereIs 永遠是「在木柵大學」；約好的見面她才在 3D，可是按說話＝INV.meet 那一場（story3d.js talkCharacter 先問 INV.meetable），不走 offerInvite＝沒有「送她…」。
        探針照實掃（每 2 天、8～23 點）＋讀原始碼那一句當證據，找不到＝記「未驗（可昕在 3D 當面送不到）」，不假裝送了。買的那一段照樣真的走、真的買。SUB_L118＝別的女主角 id（例 heroine_01）才另外送她。
  TEA   溫州街帝大紅茶 → 學姊 heroine_05（預設 紅茶（中））。
  NM    汀州路夜市沈三盃黑糖鮮奶 → 沛珊 classmate_peishan（預設 黑糖鮮奶）。
  每一 case：day46 存檔（大一上，法律系）→ 掃 21 天裡「店開著、她在 3D（不在上課、半小時後還在）、不是期末週」的日子，依序試前 3 個 →
    【前置／捷徑】讀檔到店那一區（遠的話讀在店門口 8 m 外）→ 搖桿／點地分段走到點餐點（互動鍵是那間店的字才算到）→ 按 → 選單照字選「買一份帶走送人…」→ 照字選那一杯 → 演完；
    → 選單「物品」分頁看「今天帶在身上的」→【前置／捷徑】同一份進度（帶著那一杯、錢）讀到她那一區、同一天稍後 → 分段走到她旁邊 → 按「和○○說話」→ 對話照字點，選「送她○○」→ 演完。
判定：
  B1 店的選單有「買一份帶走送人…」（放在最後）　B2 帶走的選單有那一杯、字＝「品名　價錢 元」、價錢＝店的資料　B3 錢少了剛好一次那個價錢（GAME.money 只叫一次 −價錢）
  B4 G.carry 多一筆 {n:品名, cat:'drink', day:今天, shop:店名}（欄位照舊 n、cat、day、shop；店名照盤點表）　B5 選單「物品」分頁列出那一杯
  G1 和她說話的選單有「送她○○」　G2 旁白「你把○○遞給…。」　G3 她的反應＝AA_710 定稿（印出用的是哪一格：fav／opinion／ctx／yes）
  G4 送完 G.carry 沒有那一杯、「物品」也沒有　G5 送的時候錢沒動　每一段：最後沒有對話框／選單、沒有 JS 例外、走路前後 walkFallbacks 不變。
CC_02 清單 2026-11-12：1✓（店的營業時間、颱風、期末週、她在 3D、半小時後還在、認識她都在掃的時候查；可昕查不到就記未驗） 2✓（店名、價錢、互動點、按鈕字全從遊戲資料讀；掃到 0 筆列每一條被排掉的次數） 3✓（候選日依序試前 3 個，每個跳過的記原因） 4✓（按互動鍵、選項前看 elementFromPoint；選單照字、hint 另外拆開；網址加 ?tapguard） 5✓（go_to 分段、到了看互動鍵的字、走不到附 pathTo／canStand） 6✓（店的時間至少留 15 分鐘、讀檔後等淡入、她的時段要半小時後還在） 7✓（probe_lint、JS 不經 Python %、.get()、前一步沒成功就跳過） 8✓（錢＝GAME.money 每一筆＋前後差；期望句子照 AA_710 定稿和 gift3d.js 的挑法） 9n/a（不判截圖，只存每一段最後一張給人看） 10✓（插進來的劇情先演完、選單照字選、遊戲內部選單照按鈕字） 11✓（兩個 SHA 都 40 碼、merge-base 確認 105d 含 ba2c670798） 12✓（每一段印「真的按了買一份帶走送人／送她○○」那一行，沒走到就 FAIL） 13✓（走路 40 秒一段、途中有對話／選單就停下來處理，記走的是哪條路）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [CASES=L118,TEA,NM] [DRINK_TEA=紅茶（中）] [SUB_L118=heroine_01] python3 cc_gift_drink_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL0, OUT = sys.argv[1], sys.argv[2]
URL = URL0 if 'tapguard' in URL0 else URL0 + ('&' if '?' in URL0 else '?') + 'tapguard'   # CC_02 乙 4：點對話框的探針加 ?tapguard（和手機一樣擋選單剛出來那一下）
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
CASES = [c.strip() for c in (os.environ.get('CASES') or 'L118,TEA,NM').split(',') if c.strip()]
R = L.Run('giftdrink_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
AA710 = json.load(open(os.path.join(HERE, 'fixtures', 'aa710_gifts_86619c119.json'), encoding='utf-8'))
GIFT_OPT = '買一份帶走送人…'   # gift3d.js S.SHOP_OPT（舊版同一個字）；頁面上有 GIFT.SHOP_OPT 就用頁面的
SHOP_NAME = {'l118': '果茶社', 'tea': '帝大紅茶', 'nm': '沈三盃黑糖鮮奶'}   # G.carry 的 shop：盤點表 #20、#8、#16（gift3d.js shopDef 的 name）
CASE_DEF = {
    'L118': {'shop': 'l118', 'zone': 'lane118', 'who': os.environ.get('SUB_L118') or 'kexin', 'drink': os.environ.get('DRINK_L118') or '百香果綠茶'},
    'TEA': {'shop': 'tea', 'zone': 'wenzhou', 'who': 'heroine_05', 'drink': os.environ.get('DRINK_TEA') or '紅茶（中）'},
    'NM': {'shop': 'nm', 'zone': 'tingzhou', 'who': 'classmate_peishan', 'drink': os.environ.get('DRINK_NM') or '黑糖鮮奶'},
}
RESULT = {'tag': TAG, 'sha': SHA, 'url': URL, 'rows': []}
STUCK_S = 60

HOOK_JS = r"""(()=>{ window.__SAY=window.__SAY||[]; window.__MON=window.__MON||[]; window.__CH=window.__CH||[]; if(GAME.__gdh) return 'already'; GAME.__gdh=1;
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ try{ window.__SAY.push([((a&&a.name)||(typeof a==='string'?a:'')), String(b==null?'':b)]); }catch(e){} return s0.apply(this,arguments); };
  const m0=GAME.money; if(typeof m0==='function') GAME.money=function(d,w){ try{ window.__MON.push([d,w||null]); }catch(e){} return m0.apply(this,arguments); };
  const c0=GAME.choose; if(typeof c0==='function') GAME.choose=function(o){ try{ window.__CH.push((o||[]).map(x=>x&&x.t)); }catch(e){} return c0.apply(this,arguments); };
  return 'hooked'; })()"""
RESET_JS = "(()=>{ window.__SAY=[]; window.__MON=[]; window.__CH=[]; return true; })()"
LOG_JS = "(()=>({say:window.__SAY||[], mon:window.__MON||[], ch:window.__CH||[]}))()"
# 選項：按鈕的主字（拆掉 .hint 那一段）、hint、灰不灰；中心點最上層是不是它（CC_02 乙 4）
OPTS_JS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return [];
  return [...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,k)=>{ const c=b.cloneNode(true); const h=c.querySelector('.hint'); const hint=h?h.textContent.trim():''; if(h) h.remove();
    return {k, t:c.textContent.trim(), hint, dim:!!(b.disabled||b.classList.contains('dim'))}; }); })()"""
OPT_AT_JS = r"""(k=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[k]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
  const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {xy:[r.left+r.width/2,r.top+r.height/2], top:!!e&&(e===b||b.contains(e)), who:e?(e.id||e.className||e.tagName):null}; })"""
TOP_JS = r"""(s=>{ const b=document.querySelector(s); if(!b) return null; const r=b.getBoundingClientRect(); if(!r.width) return null; const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {top:!!e&&(e===b||b.contains(e)), who:e?(e.id||e.className||e.tagName):null}; })"""
ST_JS = r"""(()=>{ const G=GAME.G, P=GAME.E.player, o=P.obj.position, it=document.getElementById('interact'), ph=document.getElementById('phone');
  return {zone:G.zone, day:G.day, hour:+(+G.hour).toFixed(3), money:G.money|0, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active),
    dtext:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60), nch:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null&&!document.getElementById('choices').classList.contains('hide')).length,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):'', fb:GAME.walkFallbacks||0,
    phone:!!ph&&!ph.classList.contains('hide'), carry:(Array.isArray(G.carry)?G.carry:[]).map(c=>Object.assign({},c))}; })()"""
# 那間店的資料（不經過 GIFT）：互動點、按鈕字、菜單、店名；版本特徵
SHOP_JS = r"""(k=>{ const E=GAME.E, IT=E.interactables||[]; let it=null, menu=[], name=null, err=null;
  try{ if(k==='l118'){ const s=LANE118_SHOPS.shops.find(q=>q.id==='drink_b'); name=s.name; menu=s.menu.map(m=>[m[0],m[1]]); it=IT.find(i=>i.shop118==='drink_b'&&!i.hidden); }
    else if(k==='tea'){ const D=WZS.AA364.tea; name=D.name||D.key; menu=WZS.menu364('tea',GAME.G).map(m=>[m[0],m[1]]); it=IT.find(i=>i.wzShop==='tea'&&i.kind==='window'&&!i.hidden); }
    else if(k==='nm'){ const st=NIGHT_MARKET.stalls.s01; name=st.name; menu=st.items.map(x=>[x.name,x.price]); it=IT.find(i=>!i.hidden&&i.label==='看'+st.name); } }catch(e){ err=String(e).slice(0,200); }
  return {name, menu, err, it:it?{x:+it.x.toFixed(2), z:+it.z.toFixed(2), r:it.radius||1.4, label:it.label, lv:it.lv|0}:null, giftOpt:(typeof GIFT!=='undefined'&&GIFT.SHOP_OPT)||null, hasMenuFn:typeof GIFT!=='undefined'&&typeof GIFT.menu==='function'}; })"""
# 掃：從 d0 起 days 天、各時段——店開著（照遊戲自己的判斷）、她在 3D、半小時後還在、不是期末週。只算，掃完放回去
SCAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}; const why={typhoon:0,exam:0,away:0,cls:0,leave:0,shopClosed:0,earlyForShop:0,unmet:0}; const out=[];
  const open=(k,d,h)=>{ G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7;
    if(k==='l118') return typeof L118!=='undefined'&&L118.isOpen('drink_b',G);
    if(k==='tea') return typeof WZS!=='undefined'&&WZS.isOpen364('tea',G);
    if(k==='nm'){ const o=NIGHT_MARKET.stalls.s01.open; let ty=false; try{ ty=!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)); }catch(e){} return !ty&&h>=o.from&&h<o.to; } return false; };
  const hs0={l118:10.75,tea:10.25,nm:17.25}[a.shop];
  try{ for(let d=a.d0; d<a.d0+a.days&&out.length<a.max; d++){ let ty=false; try{ ty=!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)); }catch(e){} if(ty){ why.typhoon++; continue; }
      const t=CALENDAR.termOf?CALENDAR.termOf(d):null; if(t&&t.exam==='final'){ why.exam++; continue; }
      if(a.who==='kexin'&&!a.findHer){ if(open(a.shop,d,14.0)) out.push({d, dkey:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd%7, hs:14.0, hh:null, zone:null}); else why.shopClosed++; continue; }
      for(const hh of a.hours){ G.day=d; G.hour=hh; G.weekday=CALENDAR.dateOf(d).wd%7; G.zone=keep.zone; let w=null; try{ w=STORY.whereIs(GAME,a.who); }catch(e){}
        if(!w||!w.zone||w.away){ why.away++; continue; } if(w.zone==='classroom'||/上課|上班/.test(w.act||'')){ why.cls++; continue; }
        G.hour=hh+0.5; let w2=null; try{ w2=STORY.whereIs(GAME,a.who); }catch(e){} if(!w2||w2.zone!==w.zone){ why.leave++; continue; }
        const hs=Math.max(hs0, hh-0.75); if(hs>hh-0.25){ why.earlyForShop++; continue; } if(!open(a.shop,d,hs)||!open(a.shop,d,hs+0.25)){ why.shopClosed++; continue; }
        out.push({d, dkey:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd%7, hs, hh, zone:w.zone, act:w.act||''}); break; } } }
  finally{ Object.assign(G,keep); }
  return {slots:out, why}; })"""
NPC_JS = r"""(id=>{ const E=GAME.E, AL={heroine_01:'an',heroine_05:'sis'};
  let n=(E.npcs||[]).find(q=>q&&q.charId===id&&q.talk&&!q.hidden&&q.obj)||null; if(!n&&GAME.npc&&GAME.npc[id]&&GAME.npc[id].talk) n=GAME.npc[id];
  if(!n&&GAME.npc&&AL[id]&&GAME.npc[AL[id]]&&GAME.npc[AL[id]].talk) n=GAME.npc[AL[id]]; if(!n||!n.obj) return null; const p=n.obj.position;
  return {x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:n.lv|0, label:n.talkLabel||null, name:n.name||''}; })"""
HER_JS = r"""(id=>{ const G=GAME.G, f=G.flags||{}, R=f.romance||{}, g=f.GIFT||{}; let st=null; try{ st=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):null; }catch(e){}
  const t=CALENDAR.termOf?CALENDAR.termOf(G.day):null; return {stage:st, dating:f['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'), month:CALENDAR.dateOf(G.day).m, exam:!!(t&&t.exam==='final'), hour:+G.hour,
    name:G.name||'祐廷', display:(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):null, gfav:(g.fav||{})[id]==null?null:g.fav[id], gday:(g.day||{})[id+'|drink']==null?null:g.day[id+'|drink'],
    glast:(g.last||{})[id+'|drink']||null, gn:(g.n||{})[id]|0, gpool:Object.keys(g.pool||{}).filter(k=>k.indexOf(id+'|drink')===0), itemNames:(typeof GIFT!=='undefined'&&GIFT.ITEMS)?GIFT.ITEMS.map(x=>x.n):[]}; })"""
# 可昕：掃她在 3D 的時段（每 step 天、8～23 點）；原始碼那一句當證據
KX_JS = r"""(async a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}; let n=0, hit=[], away={}, err=null; const c=CHARACTERS.kexin||{};
  try{ for(let d=a.d0; d<a.d1; d+=a.step){ for(let h=8; h<=23; h++){ G.day=d; G.hour=h+0.1; G.weekday=CALENDAR.dateOf(d).wd%7; let w=null; try{ w=STORY.whereIs(GAME,'kexin'); }catch(e){ err=String(e).slice(0,120); } n++;
        if(w&&w.zone){ if(hit.length<5) hit.push([CALENDAR.dateOf(d).key,h,w.zone,w.act||'']); } else { const k=(w&&w.away)||'null'; away[k]=(away[k]|0)+1; } } } }
  finally{ Object.assign(G,keep); }
  let src=null; try{ const t=await (await fetch('src/data/characters.js')).text(); const i=t.indexOf('平常不在台大'); src=i>=0?t.slice(Math.max(0,i-40),i+60):null; }catch(e){ src='讀不到：'+e; }
  return {n, hit, away, err, sched:Array.isArray(c.daily_schedule)?c.daily_schedule.length:null, src, npcNow:!!(GAME.npc&&GAME.npc.kexin)}; })"""
BAG_TXT_JS = "(()=>{ const e=document.getElementById('itemsList'); return e?e.innerText:null; })()"
SNAP_JS = "(()=>JSON.parse(JSON.stringify(GAME.G)))()"


def base_state():
    s = json.load(open(SAVE, encoding='utf-8')); return dict(s.get('G', s))


def split_line(t, name):
    """gift3d.js play：{name} 換名字；「（動作）話」拆成旁白＋她說的；整句（…）＝旁白"""
    s = t.replace('{name}', name)
    if s.startswith('（') and '）' in s:
        k = s.index('）')
        if k < len(s) - 1: return [s[:k + 1], s[k + 1:]]
    return [s]


def name_temp(n):
    return 'cold' if '冰' in n else ('hot' if '熱' in n else None)   # 盤點表第 4 節：品名有「冰」「熱」字才算；S.ITEMS 同名的另外照它（這三杯都不同名，探針會檢查）


def expect_line(who, cup, h):
    """照 gift3d.js S.pick 的順序在 AA_710 定稿裡挑：回傳 (哪一格, [句子], 說明)"""
    E = (AA710.get(who) or {}).get('drink') or {}
    if not E: return None, [], 'AA_710 沒有 %s 的飲料格' % who
    fav = E.get('fav') or {}
    if fav.get('item') == cup and h.get('gfav') is None: return 'fav', fav.get('lines') or [], 'fav 品名相同、第一次'
    for o in E.get('opinion') or []:
        if o.get('item') == cup: return 'opinion', o.get('lines') or [], 'opinion「%s」品名一字相同（AA_710 定稿 86619c119）' % o.get('item')
    ctx = E.get('ctx') or {}; t = name_temp(cup); m = h.get('month') or 0
    on = {'again': bool(h.get('glast')) and (h['glast'].get('d') == h.get('day', -9) - 1) and h['glast'].get('n') == cup, 'exam': bool(h.get('exam')), 'night': False,
          'winterCold': (m == 12 or 1 <= m <= 2) and t == 'cold', 'summerHot': 6 <= m <= 8 and t == 'hot'}
    for k in ('again', 'exam', 'night', 'winterCold', 'summerHot'):
        if on[k] and ctx.get(k): return 'ctx.' + k, ctx[k][0], 'ctx %s 成立' % k
    yes = E.get('yes') or []; st = h.get('stage') or 1; cells = []
    if h.get('dating'): cells += [y for y in yes if y.get('dating')]
    cells += sorted([y for y in yes if not y.get('dating') and st >= (y.get('need') or 0)], key=lambda y: -(y.get('need') or 0))
    if not cells: cells = [next((y for y in yes if not y.get('dating')), yes[0] if yes else {})]
    c = cells[0]; pool = c.get('pool') or [c.get('lines') or []]
    return ('yes.dating' if c.get('dating') else 'yes.need%s' % c.get('need')), pool[0], '沒有 fav／opinion／ctx 對到 → yes（%s，階段 %s；第一次送＝第一組）' % ('交往中' if c.get('dating') else 'need %s' % c.get('need'), st)


async def opts(pg):
    return await pg.evaluate(OPTS_JS)


async def tap_opt(pg, cdp, k, tag, what):
    c = await pg.evaluate(OPT_AT_JS, k)
    if not c: return False
    if not c['top']: R.note('%s 選項「%s」中心最上層是 %s，不是那顆鈕（照按，記下來）' % (tag, what, c['who']))
    await L.touch_tap(cdp, c['xy'][0], c['xy'][1]); await pg.wait_for_timeout(1100); return True


async def settle(pg, cdp, tag, secs=40):
    """讀檔以後先有的劇情：點完（選項照字，避開「約」「算了」以外先選第一個能選的），記下來"""
    log = []
    for _ in range(secs * 2):
        q = await pg.evaluate(ST_JS)
        if q['phone']: await L.close_panels(pg, cdp); continue
        if not q['busy'] and not q['dlg'] and not q['nch']: break
        if q['nch']:
            o = await opts(pg); log.append('選項：' + '｜'.join(x['t'] for x in o))
            k = next((x['k'] for x in o if not x['dim'] and not x['t'].startswith('約')), o[0]['k'] if o else 0)
            await tap_opt(pg, cdp, k, tag, '插進來的選單'); continue
        if q['dlg']:
            if not log or log[-1] != q['dtext']: log.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    if log: R.note('%s 讀檔以後先有的劇情（照字點完，不算）：%s' % (tag, J(log[-8:])))
    return log


async def load(pg, cdp, st, tag, why):
    await L.load_state(pg, st, quiet_phone=True)
    await pg.wait_for_timeout(6000)   # 讀檔淡入（CC_02 乙 6）
    await L.close_panels(pg, cdp); await settle(pg, cdp, tag)
    await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS)
    R.setup('%s %s' % (tag, why))
    return await pg.evaluate(ST_JS)


async def walk_to(pg, cdp, tag, tx, tz, lv, ok_label, what, max_seg=8):
    """分段走（每段 ≤40 秒、途中有對話／選單就停下來處理，CC_02 乙 13）；到了＝互動鍵是 ok_label(字) 為真。回傳 (到了沒, 路線紀錄)"""
    path = []; fb0 = (await pg.evaluate(ST_JS))['fb']
    for k in range(max_seg):
        q = await pg.evaluate(ST_JS)
        if ok_label(q['interact']): return True, path, fb0
        if q['dlg'] or q['nch'] or q['busy']:
            path.append('第 %d 段前有對話／選單（%s）：先演完' % (k + 1, q['dtext'] or q['nch'])); await settle(pg, cdp, tag, 30); continue
        near = 0.9 if k < 4 else 0.5
        await L.go_to(pg, cdp, R, tx, tz, near, '%s %s（第 %d 段）' % (tag, what, k + 1), max_s=40, lv=lv, stop=lambda s: bool(s['dlg'] or s['choices']))
        await pg.wait_for_timeout(700); q = await pg.evaluate(ST_JS)
        path.append('第 %d 段後 (%.2f, %.2f) 離目標 %.2f m、互動鍵「%s」' % (k + 1, q['x'], q['z'], math.hypot(tx - q['x'], tz - q['z']), q['interact']))
        if ok_label(q['interact']): return True, path, fb0
        if math.hypot(tx - q['x'], tz - q['z']) < 1.2 and k >= 2:   # 很近了互動鍵還不是：輕推一下（接近目標推輕、推短，CC_02 乙 5）
            yaw = await pg.evaluate("GAME.E.cam.yaw"); fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx; d = max(math.hypot(tx - q['x'], tz - q['z']), 0.01)
            ux, uz = (tx - q['x']) / d, (tz - q['z']) / d
            await L.joystick(pg, cdp, int(22 * (ux * rx + uz * rz)), int(-22 * (ux * fx + uz * fz)), 300); await pg.wait_for_timeout(600)
    diag = await pg.evaluate("(([x,z,lv])=>{ const E=GAME.E, o=E.player.obj.position; let p=null; try{ p=E.pathTo?E.pathTo(o.x,o.z,E.player.lv|0,x,z,lv):null; }catch(e){} return {path:p?p.length:null, standTarget:E.canStand?E.canStand(x,z,0.3,lv):null, standMe:E.canStand?E.canStand(o.x,o.z,0.3,E.player.lv|0):null}; })", [tx, tz, lv])
    R.note('%s 走不到「%s」：%s；pathTo／canStand %s' % (tag, what, J(path), J(diag)))
    try: await pg.screenshot(path=os.path.join(OUT, 'giftdrink_%s_walkfail_%d.jpg' % (TAG, int(time.time()))), type='jpeg', quality=70)
    except Exception: pass
    return False, path, fb0


async def tap_interact(pg, cdp, tag):
    t = await pg.evaluate(TOP_JS, '#interact')
    if t and not t['top']: R.note('%s 互動鍵中心最上層是 %s（照按，記下來）' % (tag, t['who']))
    await L.tap(pg, cdp, '#interact')


async def bag_text(pg, cdp, tag):
    """像玩家一樣：右上選單 → 「物品」分頁 → 讀 → 返回遊戲"""
    if not await L.tap(pg, cdp, '#btnMenu'): return None
    await pg.wait_for_timeout(900)
    if not await L.tap(pg, cdp, '#menu .tabs button[data-tab="items"]'): R.note('%s 選單沒有「物品」分頁' % tag)
    await pg.wait_for_timeout(700); t = await pg.evaluate(BAG_TXT_JS)
    await L.tap(pg, cdp, '#btnClose'); await pg.wait_for_timeout(700); await L.close_panels(pg, cdp)
    return t


async def buy(pg, cdp, tag, shop, cup, price, gopt):
    """按了互動鍵以後：店的選單照字選「買一份帶走送人…」→ 照字選那一杯 → 演完。回傳紀錄"""
    t0 = time.time(); last = time.time(); sig = None; phase = 'shop'; menus = []; inserted = []; idle = 0; stuck = False
    while time.time() - t0 < 150:
        q = await pg.evaluate(ST_JS); s = (q['dtext'], q['nch'], q['busy'], q['dlg'], phase)
        if s != sig: sig = s; last = time.time()
        elif time.time() - last > STUCK_S: stuck = True; R.note('%s %d 秒沒有進展：%s' % (tag, STUCK_S, J(q))); break
        if q['phone']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); ts = [x['t'] for x in o]; menus.append({'phase': phase, 'opts': ts, 'hints': [x['hint'] for x in o]})
            if phase == 'shop':
                k = next((x['k'] for x in o if x['t'] == gopt), None)
                if k is not None: await tap_opt(pg, cdp, k, tag, gopt); phase = 'pick'; R.note('%s 店的選單 %s：按了「%s」' % (tag, J(ts), gopt)); continue
                if any(x['t'] in ('不用了', '算了') for x in o) and any(x['t'].endswith(' 元') for x in o):
                    R.note('%s 店的選單 %s 沒有「%s」：按「不用了／算了」' % (tag, J(ts), gopt)); k = next(x['k'] for x in o if x['t'] in ('不用了', '算了'))
                    await tap_opt(pg, cdp, k, tag, '不用了'); phase = 'nogift'; continue
                inserted.append(ts); k = next((x['k'] for x in o if not x['dim'] and not x['t'].startswith('約')), o[0]['k'])
                R.note('%s 店的選單前插進來的選單 %s：照字選「%s」' % (tag, J(ts), o[[x['k'] for x in o].index(k)]['t'])); await tap_opt(pg, cdp, k, tag, '插進來的'); continue
            if phase == 'pick':
                want = '%s　%d 元' % (cup, price); k = next((x['k'] for x in o if x['t'] == want), None)
                if k is not None: await tap_opt(pg, cdp, k, tag, want); phase = 'opt'; R.note('%s 帶走的選單 %s：按了「%s」' % (tag, J(ts), want)); continue
                R.note('%s 帶走的選單 %s 沒有「%s」：按「算了」' % (tag, J(ts), want)); k = next((x['k'] for x in o if x['t'] == '算了'), o[-1]['k'])
                await tap_opt(pg, cdp, k, tag, '算了'); phase = 'nocup'; continue
            if phase == 'opt':   # 和 S.ITEMS 同名的再選一次（這三杯都不是；有的話選第一個，記下來）
                R.note('%s 買完又一個選單 %s：選第一個（記下來）' % (tag, J(ts))); await tap_opt(pg, cdp, o[0]['k'], tag, ts[0]); continue
            inserted.append(ts); await tap_opt(pg, cdp, o[0]['k'], tag, ts[0]); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
        if not q['busy'] and phase != 'shop': idle += 1
        else: idle = 0
        if idle >= 3: break
        await pg.wait_for_timeout(500)
    lg = await pg.evaluate(LOG_JS); q1 = await pg.evaluate(ST_JS)
    return {'phase': phase, 'menus': menus, 'inserted': inserted, 'stuck': stuck, 'say': lg['say'], 'mon': lg['mon'], 'end': q1, 'secs': round(time.time() - t0, 1)}


async def talk_give(pg, cdp, tag, cup, pron):
    """按了「和她說話」以後：對話照字點；有「送她○○」就按（記選單）；其他選單：「就這樣」只在已經送了、或這個選單沒有送她的時候按；其他照字選第一個能選的（不約）"""
    t0 = time.time(); last = time.time(); sig = None; gave = False; menus = []; idle = 0; stuck = False; mark = None; want = '送' + pron + cup
    while time.time() - t0 < 200:
        q = await pg.evaluate(ST_JS); s = (q['dtext'], q['nch'], q['busy'], q['dlg'])
        if s != sig: sig = s; last = time.time()
        elif time.time() - last > STUCK_S: stuck = True; R.note('%s %d 秒沒有進展：%s' % (tag, STUCK_S, J(q))); break
        if q['phone']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); ts = [x['t'] for x in o]; menus.append(ts)
            k = next((x['k'] for x in o if x['t'] == want), None)
            if k is not None and not gave:
                mark = len((await pg.evaluate(LOG_JS))['say']); mon0 = (await pg.evaluate(ST_JS))['money']
                await tap_opt(pg, cdp, k, tag, want); gave = True; R.note('%s 和她說話的選單 %s：按了「%s」' % (tag, J(ts), want)); menus[-1] = {'opts': ts, 'mon0': mon0}; continue
            k = next((x['k'] for x in o if x['t'] == '就這樣'), None)
            if k is None: k = next((x['k'] for x in o if not x['dim'] and not x['t'].startswith('約') and not x['t'].startswith('送')), o[0]['k'])
            await tap_opt(pg, cdp, k, tag, o[[x['k'] for x in o].index(k)]['t']); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); idle = 0; continue
        if not q['busy']: idle += 1
        else: idle = 0
        if idle >= 3: break
        await pg.wait_for_timeout(500)
    lg = await pg.evaluate(LOG_JS); q1 = await pg.evaluate(ST_JS)
    return {'gave': gave, 'menus': menus, 'mark': mark, 'stuck': stuck, 'say': lg['say'], 'mon': lg['mon'], 'end': q1, 'secs': round(time.time() - t0, 1)}


async def go_shop(pg, cdp, tag, cd, slot, errs):
    """店：讀檔、走、買、看物品。回傳 (row 片段, 買到的那一筆 carry) 或 (row, None)"""
    st = base_state(); st.update({'day': slot['d'], 'hour': slot['hs'], 'weekday': slot['wd'], 'zone': cd['zone'], 'pos': None, 'invites': [], 'carry': []})
    q = await load(pg, cdp, st, tag, '讀檔：day46 存檔 → %s（第 %d 天）%.2f 點、%s 的出生點；清邀約、手上沒帶東西' % (slot['dkey'], slot['d'], slot['hs'], cd['zone']))
    sd = await pg.evaluate(SHOP_JS, cd['shop']); R.note('%s 店的資料：%s' % (tag, J(sd)))
    row = {'shop_data': sd, 'load': q}
    if not R.check('%s 前置：讀到那間店的資料、互動點（%s）' % (tag, SHOP_NAME[cd['shop']]), bool(sd.get('it')) and bool(sd.get('menu')), J(sd)): return row, None
    price = next((p for n, p in sd['menu'] if n == cd['drink']), None)
    if not R.check('%s 前置：「%s」在店自己的菜單上（價錢 %s 元）' % (tag, cd['drink'], price), price is not None, J(sd['menu'])): return row, None
    it = sd['it']; gopt = sd.get('giftOpt') or GIFT_OPT
    if math.hypot(it['x'] - q['x'], it['z'] - q['z']) > 14:   # 太遠：讀在路線上離店 8 m 的地方（【前置／捷徑】，省 SwiftShader 的時間）
        p8 = await pg.evaluate("(([x,z,lv])=>{ const E=GAME.E, o=E.player.obj.position; const p=E.pathTo?E.pathTo(o.x,o.z,E.player.lv|0,x,z,lv):null; if(!p||!p.length) return null; const pts=[[o.x,o.z]].concat(p.map(q=>[q[0],q[1]]));"
                               " let acc=0; for(let i=pts.length-1;i>0;i--){ const a=pts[i-1], b=pts[i], L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(acc+L>=8){ const f=(8-acc)/L; const X=b[0]+(a[0]-b[0])*f, Z=b[1]+(a[1]-b[1])*f; if(!E.canStand||E.canStand(X,Z,0.3,lv)) return [+X.toFixed(2),+Z.toFixed(2),Math.atan2(-(x-X),-(z-Z))]; } acc+=L; } return null; })", [it['x'], it['z'], it['lv']])
        if p8:
            st['pos'] = {'x': p8[0], 'z': p8[1], 'yaw': p8[2], 'lv': it['lv']}
            q = await load(pg, cdp, st, tag, '店離出生點太遠：同一天同一時間讀在路線上離店 8 m 的 (%.2f, %.2f)' % (p8[0], p8[1]))
            sd2 = await pg.evaluate(SHOP_JS, cd['shop']); it = sd2.get('it') or it
    lab = it['label']; ok, path, fb0 = await walk_to(pg, cdp, tag, it['x'], it['z'], it['lv'], lambda s: s == lab[:30], '走到「%s」' % lab)
    fb1 = (await pg.evaluate(ST_JS))['fb']; row['walk_shop'] = path
    R.check('%s 走到店的點餐點、互動鍵是「%s」' % (tag, lab), ok, J(path[-2:]))
    R.check('%s 走到店：walkFallbacks 不變（%s → %s）' % (tag, fb0, fb1), fb0 == fb1, '')
    if not ok: return row, None
    q0 = await pg.evaluate(ST_JS); await pg.evaluate(RESET_JS); e0 = len(errs)
    await tap_interact(pg, cdp, tag)
    b = await buy(pg, cdp, tag, cd['shop'], cd['drink'], price, gopt); row['buy'] = b
    R.note('%s 店裡說的 %s；GAME.money %s；選單 %s' % (tag, J(b['say'][-6:]), J(b['mon']), J(b['menus'][:3])))
    shop_menu = next((m for m in b['menus'] if m['phase'] == 'shop' and any(t.endswith(' 元') for t in m['opts'])), None)
    R.check('%s B1 店的選單有「%s」（真的按了）' % (tag, gopt), b['phase'] in ('pick', 'opt', 'nocup'), J(shop_menu))
    if shop_menu and gopt in shop_menu['opts']: R.check('%s B1 「%s」放在店的選單最後（盤點表：原本的選項位置不動）' % (tag, gopt), shop_menu['opts'][-1] == gopt, J(shop_menu['opts']))
    if b['phase'] not in ('pick', 'opt', 'nocup'):
        R.note('%s 前一步沒成功（沒有「%s」），B2～B5、送她都跳過' % (tag, gopt)); row['skip'] = 'nogift'; return row, None
    pick_menu = next((m for m in b['menus'] if m['phase'] == 'pick'), None)
    want = '%s　%d 元' % (cd['drink'], price)
    R.check('%s B2 帶走的選單有「%s」（價錢＝店的資料 %d 元）' % (tag, want, price), bool(pick_menu) and want in pick_menu['opts'], J(pick_menu))
    if pick_menu:
        bad = [t for t in pick_menu['opts'] if t != '算了' and not any(t == '%s　%d 元' % (n, p) for n, p in sd['menu'])]
        R.check('%s B2 帶走的選單每一樣都是店菜單上的「品名　價錢 元」（%d 樣）' % (tag, len(pick_menu['opts']) - 1), not bad, J(bad))
    q1 = b['end']; mon = [m for m in b['mon'] if isinstance(m[0], (int, float)) and m[0] != 0]
    R.check('%s B3 錢少了剛好 %d（%d → %d），GAME.money 只叫一次 −%d' % (tag, price, q0['money'], q1['money'], price), q0['money'] - q1['money'] == price and len(mon) == 1 and mon[0][0] == -price, J(b['mon']))
    new = [c for c in q1['carry'] if c not in q0['carry']]
    c = next((x for x in new if x.get('n') == cd['drink']), None)
    R.check('%s B4 G.carry 多一筆 %s（欄位 n、cat、day、shop；店名「%s」）' % (tag, cd['drink'], SHOP_NAME[cd['shop']]),
            bool(c) and sorted(c.keys()) == ['cat', 'day', 'n', 'shop'] and c.get('cat') == 'drink' and c.get('day') == q1['day'] and c.get('shop') == SHOP_NAME[cd['shop']], J(new))
    R.check('%s B4 旁白「你買了%s，帶在身上。」' % (tag, cd['drink']), any(s[1] == '你買了%s，帶在身上。' % cd['drink'] for s in b['say']), J(b['say'][-4:]))
    R.check('%s 買完：最後沒有對話框、選單開著；沒有 JS 例外；沒有 %d 秒沒進展' % (tag, STUCK_S), not q1['dlg'] and not q1['nch'] and len(errs) == e0 and not b['stuck'], J({'end': {k: q1[k] for k in ('dlg', 'nch', 'busy')}, 'errs': errs[e0:][:2]}))
    bt = await bag_text(pg, cdp, tag); row['bag_after_buy'] = bt
    R.check('%s B5 選單「物品」分頁「今天帶在身上的」列出 %s' % (tag, cd['drink']), bool(bt) and '今天帶在身上的' in bt and ('· ' + cd['drink']) in bt, J((bt or '')[-200:]))
    try: await pg.screenshot(path=os.path.join(OUT, 'giftdrink_%s_%s_bought.jpg' % (TAG, cd['shop'])), type='jpeg', quality=70)
    except Exception: pass
    return row, c


async def go_her(pg, cdp, tag, cd, slot, cup, errs, row):
    who = cd['who']; snap = await pg.evaluate(SNAP_JS)
    st = copy.deepcopy(snap); st.update({'hour': slot['hh'] + 0.05, 'zone': slot['zone'], 'pos': None})
    q = await load(pg, cdp, st, tag, '同一份進度（錢、帶著的 %s）讀到 %s %.2f 點、%s（她的作息：%s）' % (cup['n'], slot['dkey'], slot['hh'] + 0.05, slot['zone'], slot.get('act')))
    if not R.check('%s 前置：讀過去以後手上還帶著 %s' % (tag, cup['n']), any(c.get('n') == cup['n'] for c in q['carry']), J(q['carry'])): return False
    n = None
    for _ in range(30):
        n = await pg.evaluate(NPC_JS, who)
        if n: break
        await pg.wait_for_timeout(500)
    if not n: R.note('%s 這個時段 %s 不在畫面上（STORY.whereIs 說在 %s）：換下一個候選' % (tag, who, slot['zone'])); return None
    lab_ok = lambda s: bool(s) and '說話' in s and (not n['name'] or n['name'][:2] in s)
    ok = False; path = []; fb0 = q['fb']
    for k in range(3):   # 她會走動：每次重讀她的位置
        n = await pg.evaluate(NPC_JS, who) or n
        ok, p, _ = await walk_to(pg, cdp, tag, n['x'], n['z'], n['lv'], lab_ok, '走到 %s 旁邊（第 %d 次）' % (n['name'] or who, k + 1), max_seg=4); path += p
        if ok: break
    fb1 = (await pg.evaluate(ST_JS))['fb']; row['walk_her'] = path
    R.check('%s 走到她旁邊、互動鍵是「和…說話」' % tag, ok, J({'npc': n, 'path': path[-2:]}))
    R.check('%s 走到她：walkFallbacks 不變（%s → %s）' % (tag, fb0, fb1), fb0 == fb1, '')
    if not ok: return False
    pron = '他' if who in ('zhe', 'kai') else '她'   # gift3d.js S.pron：女主角都是 f
    for attempt in range(2):   # 第一次可能是升階的門檻台詞那一場（talkSis relUp 直接收場、不走 offerInvite）：沒看到「送她…」再說一次
        h = await pg.evaluate(HER_JS, who); h['day'] = q['day']; e0 = len(errs); await pg.evaluate(RESET_JS)
        await tap_interact(pg, cdp, tag); g = await talk_give(pg, cdp, tag, cup['n'], pron)
        if g['gave'] or attempt == 1: break
        R.note('%s 第 %d 次說話沒有「送%s%s」（選單 %s）：再說一次' % (tag, attempt + 1, pron, cup['n'], J(g['menus'])))
        lab = (await pg.evaluate(ST_JS))['interact']
        if not lab_ok(lab): ok2, _, _ = await walk_to(pg, cdp, tag, n['x'], n['z'], n['lv'], lab_ok, '再走到她旁邊', max_seg=3)
    row['talk'] = g; row['her'] = h
    R.check('%s G1 和她說話的選單有「送%s%s」（真的按了）' % (tag, pron, cup['n']), g['gave'], J(g['menus'][-3:]))
    if not g['gave']: R.note('%s 前一步沒成功，G2～G5 跳過' % tag); return False
    said = g['say'][g['mark'] or 0:]
    i = next((k for k, s in enumerate(said) if s[1].startswith('你把%s遞給' % cup['n']) and s[1].endswith('。')), None)
    R.check('%s G2 旁白「你把%s遞給…。」' % (tag, cup['n']), i is not None, J(said[:3]))
    kind, lines, why = expect_line(who, cup['n'], h)
    exp = [p for t in lines for p in split_line(t, h.get('name') or '祐廷')]
    got = [s[1] for s in said[(i + 1 if i is not None else 0):][:len(exp)]]
    R.note('%s 她的狀態（期望的輸入）%s；AA_710 定稿挑到 %s：%s；期望 %s；遊戲演的 %s' % (tag, J({k2: h.get(k2) for k2 in ('stage', 'dating', 'month', 'exam', 'gfav', 'gn', 'gpool', 'display')}), kind, why, J(exp), J([s[1] for s in said[(i + 1 if i is not None else 0):][:6]])))
    if cup['n'] in (h.get('itemNames') or []): R.note('%s 注意：%s 和 GIFT.ITEMS 同名（冷熱照 S.ITEMS），ctx 的冷熱是照品名算的' % (tag, cup['n']))
    R.check('%s G3 她的反應＝AA_710 定稿（%s）' % (tag, kind), bool(exp) and got == exp, J({'want': exp, 'got': got}))
    if kind == 'opinion' and got != exp: R.note('%s G3 FAIL 的來源：105d 的 src/data/gift_lines.js 是 AA_710@31c1c4e2c 匯入的，沒有 86619c119 新增的 opinion「%s」＝遊戲還沒匯入定稿（不是探針錯）' % (tag, cup['n']))
    q1 = g['end']
    R.check('%s G4 送完 G.carry 沒有 %s' % (tag, cup['n']), not any(c.get('n') == cup['n'] for c in q1['carry']), J(q1['carry']))
    mon = [m for m in g['mon'] if isinstance(m[0], (int, float)) and m[0] != 0]
    m0 = next((m.get('mon0') for m in g['menus'] if isinstance(m, dict)), None)
    R.check('%s G5 送的時候錢沒動（%s → %s；GAME.money 沒有呼叫）' % (tag, m0, q1['money']), m0 == q1['money'] and not mon, J(g['mon']))
    R.check('%s 送完：最後沒有對話框、選單開著；沒有 JS 例外；沒有 %d 秒沒進展' % (tag, STUCK_S), not q1['dlg'] and not q1['nch'] and len(errs) == e0 and not g['stuck'], J({'end': {k: q1[k] for k in ('dlg', 'nch', 'busy')}, 'errs': errs[e0:][:2]}))
    bt = await bag_text(pg, cdp, tag); row['bag_after_give'] = bt
    R.check('%s G4 選單「物品」不再列 %s' % (tag, cup['n']), bt is not None and ('· ' + cup['n']) not in bt, J((bt or '')[-200:]))
    try: await pg.screenshot(path=os.path.join(OUT, 'giftdrink_%s_%s_given.jpg' % (TAG, cd['shop'])), type='jpeg', quality=70)
    except Exception: pass
    return True


async def run_case(pg, cdp, cname, errs):
    cd = CASE_DEF[cname]; tag = '[%s %s→%s %s]' % (cname, SHOP_NAME[cd['shop']], cd['who'], cd['drink']); b0 = base_state()
    row = {'case': cname, 'def': cd}; RESULT['rows'].append(row)
    await load(pg, cdp, dict(b0, hour=10.0, invites=[], pos=None), tag, 'day46 存檔 10:00、清邀約（掃日子用）')
    if cd['who'] == 'kexin':
        kx = await pg.evaluate(KX_JS, {'d0': b0['day'], 'd1': b0['day'] + 1400, 'step': 2}); row['kexin_scan'] = kx
        R.note('%s 可昕在 3D 的時段：掃 %d 格（每 2 天、8～23 點）、在 3D 的 %d 格 %s；不在的說法 %s；作息筆數 %s；原始碼：%s；現在畫面上有她：%s' % (tag, kx['n'], len(kx['hit']), J(kx['hit']), J(kx['away']), kx['sched'], J(kx['src']), kx['npcNow']))
    sc = await pg.evaluate(SCAN_JS, {'shop': cd['shop'], 'who': cd['who'], 'd0': b0['day'], 'days': 21, 'max': 3, 'hours': [10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21], 'findHer': cd['who'] != 'kexin'})
    R.note('%s 掃到的日子：%s；被排掉的 %s' % (tag, J(sc['slots']), J(sc['why'])))
    if not R.check('%s 前置：21 天內找得到「店開著%s、不是期末週」的日子' % (tag, '' if cd['who'] == 'kexin' else '、她在 3D、半小時後還在'), bool(sc['slots']), J(sc['why'])): return
    for j, slot in enumerate(sc['slots']):
        t2 = '%s 候選 %d（%s）' % (tag, j + 1, slot['dkey']); row.setdefault('tries', []).append(slot)
        part, cup = await go_shop(pg, cdp, t2, cd, slot, errs); row.update(part)
        if not cup: return
        if cd['who'] == 'kexin':
            R.note('對照／觀察 %s 可昕：遊戲沒有她在 3D 可以說話、走 offerInvite 的時段（上面的掃描＋原始碼那一句）＝當面送「未驗」（照設計做不到，不假裝送了）；買的那一段照實判' % t2)
            row['give'] = '未驗：可昕在 3D 當面送不到'; return
        r = await go_her(pg, cdp, t2, cd, slot, cup, errs, row)
        if r is None and j < len(sc['slots']) - 1: continue   # 她不在畫面上：換下一個候選日（CC_02 乙 3）
        if r is None: R.check('%s 前置：候選日她都在 3D 出現' % tag, False, J(sc['slots']))
        return


async def main():
    print('CC 送飲料三間店：TAG %s；SHA %s；CASES %s；%s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(CASES), J({c: CASE_DEF[c] for c in CASES if c in CASE_DEF})), flush=True)
    R.setup('網址加 ?tapguard（webdriver 下才啟用選單防連點，CC_02 乙 4）：%s' % URL)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        ver = await pg.evaluate("(()=>({menuFn:typeof GIFT!=='undefined'&&typeof GIFT.menu==='function', shops:typeof GIFT!=='undefined'&&GIFT.SHOPS?Object.keys(GIFT.SHOPS):null, linesSrc:(typeof GIFT_LINES!=='undefined'&&GIFT_LINES.src)||null}))()")
        R.note('版本特徵：%s（新版要有 GIFT.menu／GIFT.SHOPS；舊版 39afdff10a 沒有）' % J(ver)); RESULT['ver'] = ver
        await pg.evaluate(HOOK_JS)
        for c in CASES:
            if c not in CASE_DEF: R.check('[%s] 認得這個 case' % c, False, J(list(CASE_DEF))); continue
            try: await run_case(pg, cdp, c, errs)
            except Exception as e: R.check('[%s] 沒有中斷' % c, False, repr(e)[:300])
            open(os.path.join(OUT, 'giftdrink_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    RESULT['fails'] = R.fails; open(os.path.join(OUT, 'giftdrink_%s.json' % TAG), 'w', encoding='utf-8').write(J(RESULT))
    unv = [r['case'] for r in RESULT['rows'] if isinstance(r.get('give'), str)]
    if unv: print('未驗（對照／觀察，不算 PASS）：%s 的當面送' % '、'.join(unv), flush=True)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
