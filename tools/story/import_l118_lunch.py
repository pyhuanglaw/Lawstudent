#!/usr/bin/env python3
"""L118-LUNCH-INVITE-1111（使用者 X339：118 巷課後午餐邀約）：把 AA 的午餐稿匯進 src/data/l118_lunch.js（L118_LUNCH_DATA）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_771_l118_lunch.json
白名單沒有這一筆（或不是 approved）＝停下來說明，不產生檔；遊戲那邊沒有資料檔＝整個系統不開（src/l118_lunch3d.js）。

**台詞、選項、旁白一字照稿**（只過 import_guard.read_fix 的換名；換到了會印出來）。這支工具只多做三件事：
1. 核對 id：人物（src/data/characters.js，不認得＝停下來）、店（src/data/lane118_shops.js，不在現在的資料裡＝只提醒：遊戲會跳過那間店）。稿上寫錯的 id 在 IDMAP 對照（現在是空的：AA_771 的 id 全部對得上）。
2. 每一組 special 的 cond（文字條件）拆成遊戲看得懂的 when（下面「cond 怎麼讀」）；讀不懂的子句放進 when.unknown ＝ 那一組遊戲不會播，匯入時印出來。
3. _meta.rules 的第一條（店的規則）對到 shopRules（不當午餐的店、只有某些人會選的店；SHOP_RULES 認得舊九間店和重新設計以後的兩個版本）寫進資料檔；
   其他條和 RULES_KNOWN 不一樣＝停下來（規則是寫在 src/l118_lunch3d.js 的 RULES 裡的，稿的規則改了程式要跟著看）；看過以後加 --rules-ok 再匯。
AA 往後加 lunch／special 的 id（不改舊 id）可以直接重跑；舊 id 不見了只印提醒（存檔裡記的是 id）。

---- 資料格式（AA 照這個寫；遊戲 src/l118_lunch3d.js 讀同一份）----
{
 "_meta":   {…}                                    給人看的（by、date、note、rules[]、open[]）；rules 見上面第 3 點
 "who":     { "<人物 id>": { "name":"以安", "weight":1.0, "prefs":{ "<店 id>":權重, … }, "note":"…" } }
              會發起、會同行的人（要和祐廷同堂）。weight＝當發起人的權重倍率（沒寫＝1）。prefs＝他會選的店。
 "options": { "accept":"…", "decline":"…", "skip":"…" }   邀約的選項字。skip＝「快速略過」那一顆的字；沒寫＝遊戲不提供快速略過。
 "invite":  { "<人物 id>": { "lines":["…{店名}…", …], "declineReply":["…", …] } }     declineReply 輪著用（婉拒那個人的第幾次）
 "window":  { "from":11.5, "to":12.5 }             可省略（工具補 11:30～12:30）：那一堂上午課的下課時間落在這裡面才判定
 "lunch":   [ { "id":"L-an-1", "who":["<人物 id>", …], "shop":["<店 id>", …]（可省略＝哪一間都可以）, "n":3（可省略）, "lines":[["<說話的人>","字"], …] } ]
              who 的人都在這一桌才抽（一到三位）。n＝含玩家的人數要剛好是這個數才抽。說話的人："player"＝祐廷、null＝旁白、who 裡的人物 id。
 "special": [ { "id":"S-…", "kind":"talk"|"meet", "who":[…], "bonus":{"<人物 id>":1}, "first":true, "shop":[…]（可省略）, "cond":"文字條件", "lines":[…] } ]
              talk＝同桌的人多講一件事（who＝同桌的那個人）；meet＝遇到別人（who＝遇到的人，可以是空的；說話的人可以直接寫路人的稱呼，例「助教」）。
              first:true＝還沒看過的那一次不能被快速略過。bonus 沒寫＝who 的人各 +1。
 "arrive":  { "<店 id>":"到店的旁白" }              沒寫的店＝不說
 "leave":   ["吃完的旁白", …]                       輪流
 "skipLine":"快速略過的那一行"                       沒寫＝不說
 "noMoney": { "narr":"旁白", "player":"錢不夠時的選項字", "reply":"發起人回的一句" }
}
句子裡可以用：{店名} {name}（玩家的名字）{發起人} {同行}（同行的人，頓號隔開）{品名} {金額}。其他大括號＝停下來。

---- cond 怎麼讀（用「；」「，」隔開的子句；全形括號裡的字是註解）----
  ○○在這一餐／○○是這一餐的發起人或同行 → inParty        剛認識／普通同學／熟悉朋友／非常要好 以上 → minTier 1～4（看 who 的人）
  大一下以後 → termFrom                                    大一、大二上…… → terms
  認識○○ → knows                                          她（他、○○）在臺北、在學校的學期 → present        她（他、○○）在臺北 → reachable
  不和 AA_311 H1 同一天 → notH                              有 YT_MET_JOB → flags            平日 → weekday       學期中 → inTerm
  第 9 週以後 → weekFrom                                    走出巷子時經過○○（店名，或括號裡寫店 id）→ at:'leave'＋shopOpen:[那間店]      不指名哪一位老師 →（不是條件）
  其他 → when.unknown（遊戲不播那一組）

用法：python3 tools/story/import_l118_lunch.py [--check] [--rules-ok] [--path docs/story_planning/別的檔名.json]
測試：node tests/l118_lunch_unit.js"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_771_l118_lunch.json'
OUT = 'src/data/l118_lunch.js'
TOP = {'_meta', 'who', 'options', 'invite', 'lunch', 'special', 'arrive', 'leave', 'skipLine', 'noMoney', 'window'}
PLACE = {'店名', 'name', '發起人', '同行', '品名', '金額'}
IDMAP = {}   # 稿上的 id → 遊戲的 id（AA_771：kai、zhe、yu、classmate_youchen 都和 characters.js 一樣，不用換）
NAME2ID = {'以安': 'heroine_01', '芷若': 'heroine_02', '語彤': 'heroine_03', '子晴': 'heroine_04', '學姊': 'heroine_05', '阿哲': 'zhe', 'Alison': 'yu',
           '柏翰': 'classmate_bohan', '芯慈': 'classmate_xinci', '明軒': 'classmate_mingxuan', '宥辰': 'classmate_youchen', '沛珊': 'classmate_peishan',
           '阿凱': 'kai', '可昕': 'kexin'}
TIER = {'剛認識': 1, '普通同學': 2, '熟悉朋友': 3, '非常要好': 4}
YEAR = {'一': 1, '二': 2, '三': 3, '四': 4}
# 遊戲照這幾條做（src/l118_lunch3d.js 的 RULES）；稿的 _meta.rules 和這裡不一樣＝先看程式要不要改
# 第一條（店的規則）兩個版本都認得，對到遊戲用的 shopRules（寫進資料檔；遊戲 src/l118_lunch3d.js 的 S.shopRules 讀）：
#   noLunch＝不當午餐的店 id；onlyFor＝{店 id: [只有這些人會選]}
SHOP_RULES = {
    '店：一一八茶飲不當午餐（只在 L-yu-3 被提到）；慢讀咖啡只有以安會選。選到的店那天沒開就照權重換下一間。':
        {'noLunch': ['tea'], 'onlyFor': {'cafe2': ['heroine_01']}},                      # AA_771 v1、v2（舊九間店）
    '店：九間餐廳都可以當午餐；兩間外帶飲料店（drink_a 手搖飲、drink_b 鮮果茶）不當午餐，只在 L-yu-3、S-meet-ziqing 被提到。選到的店那天沒開就照權重換下一間。':
        {'noLunch': ['drink_a', 'drink_b'], 'onlyFor': {}},                              # AA_771 v3（九間店重新設計，X338）
    '店：九間餐廳都可以當午餐；兩間外帶飲料店（drink_a 喝不喝咖啡、drink_b 果茶社）不當午餐，只在 L-yu-3、S-meet-ziqing 被提到。選到的店那天沒開就照權重換下一間。':
        {'noLunch': ['drink_a', 'drink_b'], 'onlyFor': {}},                              # AA_771 最終版（企劃線 1669b3ae0：兩間飲料店的店名使用者定了）
}
RULES_KNOWN = [
    '週一阿哲手機揪午餐（AA_280 第 4 節）照舊：那天答應了就不再當面邀；沒答應或他沒揪，照常判定。',
    'AA_280 第 3 節的熟客、AA_311 H1～H9 照舊；同一天已經演過那一位的 H 事件，偶遇就不要再抽到同一個人。',
    '柏翰和沛珊大一下交往、大二上分開：大二上那一學期不要把兩個人排進同一桌（其他學期可以）。',
    '好感：八個人都照規格 +2（熟悉度）。和玩家交往中的人（以安、沛珊）也是 +2 熟悉度，不加戀愛的數值——午餐不是約會。偶遇的人 +1；特殊對話（kind: talk）相關的人再 +1。',
    'lunch 的 shop 欄＝這一組只在那幾間店播；沒有 shop 的哪一間都可以。who 有兩三個人的組＝那幾個人都在這一桌時才抽。',
    'special 大約兩成：kind talk＝同桌的人多講一件自己的事；kind meet＝遇到別人。first:true＝第一次不能被快速略過。cond 是給程式看的條件，用文字寫。',
    'n 欄（BB_331 C5）＝含玩家在內的人數要剛好等於這個數才抽（G-zhe-yu-mx n=4、G-yu-ps n=3）。',
    '午餐邀約只在中午十二點前後下課的上午課之後觸發（BB_331 C4；柏翰的鐘點句都假設十二點多）。',
    'declineReply 每人三句，輪著用（連續婉拒不會一直看到同一句）。',
]
# AA_771 最終版（1669b3ae0）多的一條：遊戲已經這樣做（src/l118_lunch3d.js：資料的 options.skip 有字、看過一次才出現，放在答應和婉拒中間）。有沒有這一條都認得
RULES_OPTIONAL = ['options.skip（LAWWW 11-11）：看過一次的普通午餐才出現，放在答應和婉拒中間；選了就不演對話，只出 skipLine。']
# 「十二點前後下課」的時間窗（鐘點）：那一堂的下課時間落在這裡面才判定。稿的最上層寫了 window＝照稿；沒寫＝用這個（LAWWW 2026-11-11：11:30～12:30）
WINDOW = {'from': 11.5, 'to': 12.5}
CHANGED, WARN = [], []
SHOP_NAME = {}   # 店名 → 店 id（現在的 lane118_shops.js；cond「走出巷子時經過○○」用）


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_l118_lunch：' + m)


def txt(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    for m in re.findall(r'\{([^{}]*)\}', x):
        if m not in PLACE:
            die(f'{where}：不認得的 {{{m}}}（可以用的：{"、".join(sorted(PLACE))}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def txts(a, where):
    if not isinstance(a, list) or not a:
        die(f'{where}：要是陣列、至少一句')
    return [txt(x, f'{where}[{i}]') for i, x in enumerate(a)]


def known_ids():
    src = open(os.path.join(ROOT, 'src/data/characters.js'), encoding='utf-8').read()
    chars = set(re.findall(r"^  ([A-Za-z_0-9]+):\{ id:'\1'", src, re.M))
    s = open(os.path.join(ROOT, 'src/data/lane118_shops.js'), encoding='utf-8').read()
    s = s[s.index('{', s.index('LANE118_SHOPS')):s.rindex('}') + 1]
    shops = [x['id'] for x in json.loads(s)['shops']]
    SHOP_NAME.clear()
    SHOP_NAME.update({x['name']: x['id'] for x in json.loads(s)['shops']})
    if len(chars) < 20 or len(shops) < 5:
        die('讀不到 characters.js／lane118_shops.js 的 id（檔案格式改了？）')
    return chars, shops


def cid(x, chars, where):
    y = IDMAP.get(x, x)
    if y not in chars:
        die(f'{where}：不認得的人物 id「{x}」（src/data/characters.js 沒有；要對照就加進這支工具的 IDMAP）')
    return y


def shop_ok(s, shops, where):
    """店 id 不在現在的 lane118_shops.js：只提醒（店的資料之後會重匯；遊戲遇到沒有的店會跳過，不報錯）"""
    if not isinstance(s, str) or not re.fullmatch(r'[a-z][a-z0-9_]*', s):
        die(f'{where}：店 id 要是小寫英數（{json.dumps(s, ensure_ascii=False)}）')
    if s not in shops:
        WARN.append(f'{where}：店 id「{s}」不在現在的 src/data/lane118_shops.js（遊戲會跳過這間；店的資料重匯以後再跑一次 --check）')


def shop_list(a, shops, where):
    if not isinstance(a, list) or not a:
        die(f'{where}：shop 要是陣列、至少一間（不限店就不要寫這一欄）')
    for s in a:
        shop_ok(s, shops, where)
    return list(a)


def lines(a, allowed, chars, where, free=False):
    """[[說話的人, 字], …]。allowed＝這一組的人物；free＝可以直接寫路人的稱呼（special）"""
    if not isinstance(a, list) or not a:
        die(f'{where}：lines 至少一句')
    out = []
    for i, row in enumerate(a):
        w = f'{where}[{i}]'
        if not isinstance(row, list) or len(row) != 2:
            die(f'{w}：要是 [說話的人, 字]')
        who, t = row
        if who is not None and who != 'player':
            if not isinstance(who, str) or not who:
                die(f'{w}：說話的人要是 "player"、null、人物 id 或路人的稱呼')
            m = IDMAP.get(who, who)
            if m in allowed:
                who = m
            elif m in chars or re.fullmatch(r'[a-z_0-9]+', who):
                die(f'{w}：「{who}」不在這一組的 who 裡')
            elif not free:
                die(f'{w}：lunch 的說話人只能是 "player"、null、who 裡的人（「{who}」）')
        out.append([who, txt(t, w)])
    return out


def strip_note(s):
    return re.sub(r'（[^（）]*）', '', s).strip()


def clauses(text):
    """用「；」「，」切子句；全形括號裡面的不切"""
    out, cur, dep = [], '', 0
    for ch in text:
        if ch == '（':
            dep += 1
        elif ch == '）':
            dep = max(0, dep - 1)
        if dep == 0 and ch in '；，;':
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return out


def cond(text, who, where):
    """文字條件 → when。讀不懂的子句進 unknown（遊戲不播這一組）"""
    W = {}
    if text is None:
        return W
    if not isinstance(text, str):
        die(f'{where}：cond 要是字')
    ref = who[0] if who else None

    def person(nm):
        nm = nm.strip()
        if nm in ('她', '他'):
            return ref
        return NAME2ID.get(nm)

    for raw in clauses(text):
        c = strip_note(raw)
        if not c:
            continue
        m = re.fullmatch(r'(.+?)(?:是這一餐的發起人或同行|在這一餐)', c)
        if m and person(m.group(1)):
            W.setdefault('inParty', []).append(person(m.group(1)))
            continue
        m = re.fullmatch(r'(剛認識|普通同學|熟悉朋友|非常要好)以上', c)
        if m:
            W['minTier'] = TIER[m.group(1)]
            continue
        m = re.fullmatch(r'大([一二三四])([上下])以後', c)
        if m:
            W['termFrom'] = 'Y%dS%d' % (YEAR[m.group(1)], 1 if m.group(2) == '上' else 2)
            continue
        m = re.fullmatch(r'大([一二三四])([上下])?', c)
        if m:
            y = YEAR[m.group(1)]
            W['terms'] = ['Y%dS%d' % (y, 1 if m.group(2) == '上' else 2)] if m.group(2) else ['Y%dS1' % y, 'Y%dS2' % y]
            continue
        m = re.fullmatch(r'認識(.+)', c)
        if m and person(m.group(1)):
            W.setdefault('knows', []).append(person(m.group(1)))
            continue
        m = re.fullmatch(r'(.+?)在臺北、在學校的學期', c)
        if m and person(m.group(1)):
            W.setdefault('present', []).append(person(m.group(1)))
            continue
        m = re.fullmatch(r'(.+?)在臺北', c)
        if m and person(m.group(1)):
            W.setdefault('reachable', []).append(person(m.group(1)))
            continue
        m = re.fullmatch(r'不和 ?AA_311 ?(H\d[a-z]?) ?同一天', c)
        if m:
            W.setdefault('notH', []).append(m.group(1))
            continue
        m = re.fullmatch(r'有 ?([A-Za-z][A-Za-z0-9_]*)', c)
        if m:
            W.setdefault('flags', []).append(m.group(1))
            continue
        if c == '平日':
            W['weekday'] = True
            continue
        if c == '學期中':
            W['inTerm'] = True
            continue
        m = re.fullmatch(r'第 ?(\d+) ?週以後', c)
        if m:
            W['weekFrom'] = int(m.group(1))
            continue
        m = re.fullmatch(r'走出巷子時經過(.+)', c)
        if m:
            # 經過的那間店要開著：括號裡先寫店 id（例「（drink_b；任何一間店吃完都可以播）」）就用它，沒有就照店名找
            n = re.search(r'（([a-z][a-z0-9_]*)[；，;）]', raw)
            sid = n.group(1) if n else SHOP_NAME.get(m.group(1).strip())
            W['at'] = 'leave'
            if sid:
                W['shopOpen'] = [sid]
            else:
                WARN.append(f'{where}：「{raw.strip()}」找不到是哪一間店（括號裡寫店 id，或用 lane118_shops.js 的店名）＝不看那間店有沒有開')
            continue
        if c == '不指名哪一位老師':
            continue
        W.setdefault('unknown', []).append(raw.strip())
        WARN.append(f'{where}：讀不懂的條件「{raw.strip()}」＝遊戲不會播這一組（先改這支工具的 cond()、src/l118_lunch3d.js 的 whenOk）')
    return W


def build(d):
    chars, shops = known_ids()
    if set(d) - TOP:
        die(f'最上層不認得的欄位 {sorted(set(d) - TOP)}')
    for k in ('who', 'options', 'invite', 'lunch'):
        if k not in d:
            die(f'少了 {k}')
    out = {'_meta': d.get('_meta', {})}
    win = d.get('window', WINDOW)
    if not isinstance(win, dict) or set(win) != {'from', 'to'} or any(isinstance(win[k], bool) or not isinstance(win[k], (int, float)) for k in win) or not (0 <= win['from'] < win['to'] <= 24):
        die('window：要是 {"from": 鐘點, "to": 鐘點}（例 11.5、12.5）')
    out['window'] = {'from': win['from'], 'to': win['to']}
    # who
    who = {}
    for k, e in d['who'].items():
        w = f'who.{k}'
        i = cid(k, chars, w)
        if set(e) - {'name', 'weight', 'prefs', 'note'}:
            die(f'{w}：不認得的欄位 {sorted(set(e) - {"name", "weight", "prefs", "note"})}')
        if not isinstance(e.get('prefs'), dict) or not e['prefs']:
            die(f'{w}.prefs：至少一間店')
        for s, n in e['prefs'].items():
            shop_ok(s, shops, w + '.prefs')
            if isinstance(n, bool) or not isinstance(n, (int, float)) or n <= 0:
                die(f'{w}.prefs.{s}：權重要是正的數字')
        wt = e.get('weight', 1)
        if isinstance(wt, bool) or not isinstance(wt, (int, float)) or wt <= 0:
            die(f'{w}.weight：要是正的數字')
        r = {'name': txt(e.get('name'), w + '.name'), 'weight': wt, 'prefs': dict(e['prefs'])}
        if 'note' in e:
            r['note'] = e['note']
        who[i] = r
    out['who'] = who
    # options
    o = d['options']
    if set(o) - {'accept', 'decline', 'skip'} or 'accept' not in o or 'decline' not in o:
        die('options：要有 accept、decline（skip 可以沒有＝不提供快速略過），不能有別的')
    out['options'] = {k: txt(o[k], 'options.' + k) for k in ('accept', 'decline', 'skip') if k in o}
    if 'skip' not in o:
        WARN.append('options.skip 沒有寫＝遊戲不提供「快速略過」那一顆（規格第十節要有；請 AA 補選項的字）')
    # invite
    inv = {}
    for k, e in d['invite'].items():
        w = f'invite.{k}'
        i = cid(k, chars, w)
        if i not in who:
            die(f'{w}：這個人不在 who 裡')
        if set(e) - {'lines', 'declineReply'}:
            die(f'{w}：不認得的欄位')
        r = {'lines': txts(e.get('lines'), w + '.lines')}
        if 'declineReply' in e:
            r['declineReply'] = txts(e['declineReply'], w + '.declineReply')
        inv[i] = r
    for i in who:
        if i not in inv:
            WARN.append(f'who.{i} 沒有 invite 的句子＝他不會當發起人（可以同行）')
    out['invite'] = inv
    # lunch
    ids, L = set(), []
    for n, e in enumerate(d['lunch']):
        w = f'lunch[{n}]（{e.get("id")}）'
        if set(e) - {'id', 'who', 'lines', 'shop', 'n'}:
            die(f'{w}：不認得的欄位 {sorted(set(e) - {"id", "who", "lines", "shop", "n"})}')
        if not isinstance(e.get('id'), str) or not e['id'] or e['id'] in ids:
            die(f'{w}：id 沒寫或重複')
        ids.add(e['id'])
        if not isinstance(e.get('who'), list) or not (1 <= len(e['who']) <= 3):
            die(f'{w}：who 要一到三位')
        ws = [cid(x, chars, w + '.who') for x in e['who']]
        for x in ws:
            if x not in who:
                die(f'{w}：{x} 不在 who 裡（不會同行的人不能寫進 lunch）')
        r = {'id': e['id'], 'who': ws}
        if 'shop' in e:
            r['shop'] = shop_list(e['shop'], shops, w)
        if 'n' in e:
            if isinstance(e['n'], bool) or not isinstance(e['n'], int) or not (len(ws) + 1 <= e['n'] <= 4):
                die(f'{w}：n（含玩家的人數）要是整數，至少 who 的人數＋1、最多 4')
            r['n'] = e['n']
        r['lines'] = lines(e.get('lines'), set(ws), chars, w + '.lines')
        L.append(r)
    if not L:
        die('lunch：至少一組')
    out['lunch'] = L
    for i in inv:
        if not any(g['who'] == [i] and 'shop' not in g and 'n' not in g for g in L):
            WARN.append(f'{i} 沒有「只有他一個人、不限店」的 lunch 組：有些組合會找不到句子（那一次就不邀）')
    # special
    S = []
    for n, e in enumerate(d.get('special', [])):
        w = f'special[{n}]（{e.get("id")}）'
        KS = {'id', 'kind', 'who', 'lines', 'bonus', 'first', 'shop', 'cond'}
        if set(e) - KS:
            die(f'{w}：不認得的欄位 {sorted(set(e) - KS)}')
        if not isinstance(e.get('id'), str) or not e['id'] or e['id'] in ids:
            die(f'{w}：id 沒寫或重複（lunch、special 的 id 不能一樣）')
        ids.add(e['id'])
        if e.get('kind') not in ('talk', 'meet'):
            die(f'{w}：kind 要是 talk 或 meet')
        if not isinstance(e.get('who'), list):
            die(f'{w}：who 要是陣列（meet 可以是空的）')
        ws = [cid(x, chars, w + '.who') for x in e['who']]
        if e['kind'] == 'talk':
            if not ws:
                die(f'{w}：talk 的 who 至少一位')
            for x in ws:
                if x not in who:
                    die(f'{w}：talk 的 {x} 不在 who 裡（同桌的人才能 talk）')
        r = {'id': e['id'], 'kind': e['kind'], 'who': ws}
        if 'bonus' in e:
            if not isinstance(e['bonus'], dict):
                die(f'{w}：bonus 要是 {{人物 id: 數字}}')
            b = {}
            for k, v in e['bonus'].items():
                if isinstance(v, bool) or not isinstance(v, int) or v < 0:
                    die(f'{w}.bonus.{k}：要是 0 以上的整數')
                b[cid(k, chars, w + '.bonus')] = v
            r['bonus'] = b
        if 'first' in e:
            if not isinstance(e['first'], bool):
                die(f'{w}：first 要是 true／false')
            r['first'] = e['first']
        if 'shop' in e:
            r['shop'] = shop_list(e['shop'], shops, w)
        if 'cond' in e:
            r['cond'] = e['cond']
        r['when'] = cond(e.get('cond'), ws, w)
        r['lines'] = lines(e.get('lines'), set(ws), chars, w + '.lines', free=True)
        S.append(r)
    out['special'] = S
    # arrive／leave／skipLine／noMoney
    A = d.get('arrive', {})
    if not isinstance(A, dict):
        die('arrive：要是 {店 id: 一句}')
    for s in A:
        shop_ok(s, shops, 'arrive')
    out['arrive'] = {s: txt(A[s], 'arrive.' + s) for s in A}
    out['leave'] = txts(d['leave'], 'leave') if d.get('leave') else []
    if 'skipLine' in d:
        out['skipLine'] = txt(d['skipLine'], 'skipLine')
    if 'noMoney' in d:
        N = d['noMoney']
        if not isinstance(N, dict) or set(N) - {'narr', 'player', 'reply'}:
            die('noMoney：只能有 narr、player、reply')
        out['noMoney'] = {k: txt(N[k], 'noMoney.' + k) for k in ('narr', 'player', 'reply') if k in N}
    return out


def rules_ok(rules):
    return isinstance(rules, list) and len(rules) >= 1 and rules[0] in SHOP_RULES and rules[1:] in (RULES_KNOWN, RULES_KNOWN + RULES_OPTIONAL)


def old_ids(p):
    if not os.path.exists(p):
        return set()
    return set(re.findall(r'^   "id": "([^"]+)"', open(p, encoding='utf-8').read(), re.M))


def main():
    path = PATH
    if '--path' in sys.argv:
        path = sys.argv[sys.argv.index('--path') + 1]
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits:
        die(f'{path}：不在匯入白名單（{IG.ALLOW}）。AA 交稿、LAWWW 在白名單加一筆（path、sha、status: approved、approvedBy）以後再跑；'
            f'沒有 {OUT} 的時候遊戲的午餐邀約整個不開，不會用假的句子。這一次沒有產生檔。')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(path, sha, allow)
    if not ok:
        die(why)
    src = json.loads(git('show', f'{sha}:{path}'))
    rules = (src.get('_meta') or {}).get('rules')
    data = {'src': f'{path}@{sha}'}
    data.update(build(src))
    if isinstance(rules, list) and rules and rules[0] in SHOP_RULES:
        data['shopRules'] = SHOP_RULES[rules[0]]
    js = ('/* 自動產生：tools/story/import_l118_lunch.py（' + data['src'] + '）。不要手改，改企劃稿再重新匯入。\n'
          '   118 巷課後午餐邀約（L118-LUNCH-INVITE-1111，使用者 X339）的台詞、選項、旁白：一字照 AA 的稿；special 的 when 是工具從 cond（文字條件）拆出來的。\n'
          '   格式說明在匯入工具的檔頭；怎麼演：src/l118_lunch3d.js */\n'
          "'use strict';\nconst L118_LUNCH_DATA=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=L118_LUNCH_DATA;\n")
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（RC2-PORT-DEV-1114：785 列）：源稿不動、寫檔前照 docs/handoff/AA_959_overlay.json 換；順序 AA959.layer 先、B5.fix 後
    js = _AA959.layer(js, os.path.basename(OUT))
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', why)
        return
    if not rules_ok(rules) and '--rules-ok' not in sys.argv:
        die('稿的 _meta.rules 和這支工具記的（SHOP_RULES 的第一條＋RULES_KNOWN）不一樣：規則是寫在 src/l118_lunch3d.js 的 RULES 裡的，先看程式要不要跟著改、'
            '更新這支工具；確定不用改就加 --rules-ok 再跑（第一條不認得的話，店的規則用遊戲裡預設的 S.RULES）。這一次沒有產生檔。')
    gone = old_ids(p) - {e['id'] for e in data['lunch']} - {e['id'] for e in data['special']}
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, f'發起／同行 {len(data["who"])} 人、lunch {len(data["lunch"])} 組、special {len(data["special"])} 組；{why}')
    for c in CHANGED:
        print('  換名（import_guard.read_fix）', c)
    for c in WARN:
        print('  注意', c)
    if gone:
        print('  注意 上一版有、這一版沒有的 id（存檔裡記過的會留著，不影響遊戲）：', '、'.join(sorted(gone)))


if __name__ == '__main__':
    main()
