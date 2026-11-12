#!/usr/bin/env python3
"""邀約回覆照階段變（D14-T9／USER_WANTS D37）：AA_415 七位女主角定稿的表格 → src/data/invite_replies.js（INVITE_REPLIES）。
**只讀 docs/handoff/story_import_allow.json 列出、status approved 的那一版**（git show <sha>:<path>，不從分支最新讀）；句子一字不改（只有寫進遊戲檔的時候，有名字說的台詞拿掉外面那一對「」：AA-B 2026-11-08，最後的 strip_quotes）。

表格（AA_415 第 1～7 節）每一列＝一筆：
  k      acc（答應：階段 1～6、交往中）／resched（改天）／decline（婉拒）
  st     可以用的階段範圍 [低, 高]（1～6＝DATE.stageNum 的六階，7＝交往中）。
         「現有」的答應句照 INVITE_DATA.people 原本的分檔（A＝認識、有點熟→[1,2]；R＝朋友以上→[3,4]；不分檔→[表上的階段,4]；first→[表上的階段,7]）；
         婉拒的「（4 以下）」「（1～2）」→ 範圍。
  tags   標籤（地點、第一次、來過、外出、開車、晚上、考試週、節日、大一、大二起）
  apart  可昕「3（分開以後）」「4（分開以後）」：分開以後才用（G.flags.EX_kexin、不在交往中）
  cond   「條件：」後面的字（程式照字面接：src/invites3d.js 的 S.REPLY_COND）；接不上的在 OFF_COND 寫原因、整列標 off
  lines  她說的話：「…」＝她說、（…）＝旁白、祐廷：「…」＝{me}
  ex     「現有」：acc／first／here／plan／rule／partnerSay（here、rule、partnerSay 照原本的程式，表上這幾列只是對照，標 off）
  band   現有答應句在 INVITE_DATA 的分檔（A／R／null）
  when   這一句本身說到的時間、星期（不寫的話會和事實矛盾；程式照這個過濾）：見 WHEN
  at     改天的時間（這一句說了「明天」「五點以後」…，改天的時間照這個算；算不到就不用這一句）：見 AT
  sec    可昕：y0（經濟系那一年，7-1）／law（法律系，7-2）
「現有」的列：跟 src/data/invites.js 的 INVITE_DATA.people 比對（答應句整組相同；rule、plan 函式裡的句子是子字串），對不上就停止（不產生）。
用法：python3 tools/invite/build_replies.py [--check 企劃線ref]（--check：分支上的 AA_415 和白名單的版本一不一樣）"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as GD

SPEC = 'docs/story_planning/AA_415_邀約回覆照階段變_七位定稿.md'
OUT = 'src/data/invite_replies.js'
ALLOW = GD.load(ROOT)
APPROVED = GD.approved_files(ALLOW, 'docs/story_planning/')
ok, why = GD.allowed(SPEC, APPROVED.get(SPEC, ''), ALLOW)
if not ok:
    sys.exit('拒絕匯入：' + why)
SHA = APPROVED[SPEC]
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', SHA, ref, '--', SPEC]).returncode == 0
    print(('一樣：' if same else f'分支上的版本和白名單（{SHA}）不同、不會匯入：') + SPEC)
    sys.exit(0)
MD = GD.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{SPEC}'], text=True))

PLACES = ['cafe', 'library', 'noodle', 'wenzhou', 'brunch', 'teahouse']
STAGE_NUM = {'交往中': 7}

# 條件接不上現有的遊戲狀態：整列保留、標 off（不出現），原因寫在這裡（回報給 LAWWW）
OFF_COND = {
    '家教的時間': '以安的家教時段不在作息表（characters.js 沒有家教的 act），程式判斷不了',
    '看電影': '外出的地點種類（date3d.js）；外出的邀約接上才用（AA_415 第 8 節）',
    '第二次外出': '外出的次數（date3d.js）；外出的邀約接上才用（AA_415 第 8 節）',
}
# 句子本身說到的時間、星期（不寫會和事實矛盾），程式照這個過濾（src/invites3d.js 的 whenOk）
#   before：約的時間早於 h；endBy：約的時間＋待多久不超過 h；from：約的時間不早於 h；wd：星期幾（0＝週日）；notPlace：不是這個地點；
#   today：約的是今天；zrShift：那天芷若有 Café 的班（作息 barista）；shiftEnd：而且約在下班（22:00）以後
WHEN = {
    '「好。我五點有家教，四點五十要走。」': {'before': 16 + 50 / 60},
    '「九點以前。我媽九點會打電話來。」': {'endBy': 21},   # AA_415 c71772fbc（11-07 語彤新背景）：原句「九點以前。我媽會等我。」
    '「九點前。我答應品妤一起吃宵夜。」': {'endBy': 21},
    '「好。研究室九點關燈。九點十分，樓下。」': {'from': 21},
    '「好。我今天十點下班。你在門口等我。」': {'today': True, 'zrShift': True, 'from': 22},
    '「好！我今天的班換掉了。」': {'today': True, 'zrShift': True},
    '「好。週六不去溫州街了。改去你說的地方。」': {'wd': [6], 'notPlace': 'wenzhou'},
    '「好。週六我本來就沒班。……整天都是你的。」': {'wd': [6]},
    '「今天我在茶屋。你來喝茶，我收完店再陪你。」': {'today': True},   # AA_627 B-029（讀稿時照 aa630_fix 換過）
}
# 改天的時間（句子說了時間）：day＝same（同一天）／tomorrow（明天）／nextweek（下週一起）；from＝不早於；wd＝星期幾；today＝約的是今天；
# exact＝就是那個時間（不是「以後」）；before＝約的時間早於（「四點下課」＝約在四點以前）
AT = {
    '「家教到七點。七點二十，可以嗎？」': {'day': 'same', 'from': 19 + 20 / 60, 'exact': True},
    '「週六我陪我媽。……週日可以。」': {'wd': 0},
    '「今天茶屋缺人。明天？」': {'today': True, 'day': 'tomorrow'},   # AA_627 B-033
    '「我在睡。下午三點以後再約。」': {'day': 'same', 'from': 15},
    '「今天不行。明天。明天不行的話後天。後天一定。」': {'today': True, 'day': 'tomorrow'},
    '「在趕作業。明天。」': {'today': True, 'day': 'tomorrow'},
    '「我在總圖。五點以後。」': {'day': 'same', 'from': 17},
    '「這週不行。下禮拜好不好？」': {'day': 'nextweek'},   # 學姊 sis31（AA_579 第 34 列：原「這週不行。不是不想。」；改天的時間照舊）
    '「讀書會。九點以後可以。」': {'day': 'same', 'from': 21},
    '「今天要寫心得。明天？」': {'today': True, 'day': 'tomorrow'},
    '「我在社科院上課，四點下課。」': {'day': 'same', 'from': 16, 'before': 16},
    '「會計作業還沒平。明天？」': {'today': True, 'day': 'tomorrow'},
    '「今天陪品妤。明天？」': {'today': True, 'day': 'tomorrow'},
    '「我在木柵大學上課。四點二十下課。」': {'day': 'same', 'from': 16 + 20 / 60, 'before': 16 + 20 / 60},
    '「讀書會。九點以後。」': {'day': 'same', 'from': 21},
    '「今天陪予樂。明天？」': {'today': True, 'day': 'tomorrow'},
}
SHORT = {'heroine_01': 'an', 'heroine_02': 'zr', 'heroine_03': 'yt', 'heroine_04': 'zq', 'heroine_05': 'sis', 'classmate_peishan': 'ps', 'kexin': 'kx'}


def die(msg):
    sys.exit('build_replies：' + msg)


def invite_data():
    """src/data/invites.js 的 INVITE_DATA.people（答應句的陣列；函式換成原始碼字串）"""
    js = r"""const fs=require('fs'),vm=require('vm');let s=fs.readFileSync(process.argv[1],'utf8').replace(/^const INVITE_DATA\s*=/m,'globalThis.INVITE_DATA=');vm.runInThisContext(s);
const P=INVITE_DATA.people,out={};for(const id in P){const p=P[id],o={};for(const k of ['acc','first','here','plan','partnerSay']){ if(!p[k]) continue; o[k]={}; for(const pl in p[k]){ const v=p[k][pl]; o[k][pl]=typeof v==='function'?{fn:String(v)}:v; } } if(p.rule) o.rule=String(p.rule); out[id]=o;}
process.stdout.write(JSON.stringify(out));"""
    return json.loads(subprocess.check_output(['node', '-e', js, os.path.join(ROOT, 'src/data/invites.js')], text=True))


def split_top(s, sep):
    """sep 只在「」（）外面分"""
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch in '「（『':
            depth += 1
        elif ch in '」）』':
            depth -= 1
        if ch == sep and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    parts.append(cur)
    return parts


def segments(s):
    """「…」＝她說、（…）＝旁白、祐廷：「…」＝{me}；其他字（空白）略過"""
    out, i, n = [], 0, len(s)
    while i < n:
        me = s.startswith('祐廷：', i)
        if me:
            i += 3
        ch = s[i] if i < n else ''
        if ch in '「（':
            close = '」' if ch == '「' else '）'
            depth, j = 0, i
            while j < n:
                if s[j] == ch:
                    depth += 1
                elif s[j] == close:
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            if j >= n:
                die('括號沒有關：' + s)
            seg = s[i:j + 1]
            out.append({'me': seg} if me else seg)
            i = j + 1
        else:
            if me:
                die('祐廷：後面不是「」：' + s)
            i += 1
    return out


def alt_head(a):
    """「／」後面的一段：開頭的 `標籤` 或「交往中」"""
    tags, dating = [], False
    a = a.strip()
    while True:
        m = re.match(r'`([^`]+)`', a)
        if m:
            tags.append(m.group(1)); a = a[m.end():].lstrip(); continue
        if a.startswith('交往中'):
            dating = True; a = a[3:].lstrip(); continue
        break
    return tags, dating, a


def parse_tags(cell):
    """標籤欄 → (tags, cond, 階段上下限)"""
    cell = cell.strip()
    lim = None
    m = re.search(r'（(\d)\s*以下）$', cell)
    if m:
        lim = [1, int(m.group(1))]; cell = cell[:m.start()].strip()
    m = re.search(r'（(\d)～(\d)）$', cell)
    if m:
        lim = [int(m.group(1)), int(m.group(2))]; cell = cell[:m.start()].strip()
    cond = None
    if '條件：' in cell:
        k = cell.index('條件：'); cond = cell[k + 3:].strip().replace('`', ''); cell = cell[:k]
    tags = re.findall(r'`([^`]+)`', cell)
    return tags, cond, lim


def sections(md):
    """[(人物 id, 小節 sec, 表格的列)]"""
    out, who, sec = [], None, None
    for ln in md.splitlines():
        m = re.match(r'^## \d+\. .*（(\w+)[，）]', ln)
        if m:
            who, sec = m.group(1), None; continue
        if re.match(r'^## ', ln):
            who = None; continue
        m = re.match(r'^### 7-(\d)\.', ln)
        if m and who == 'kexin':
            sec = 'y0' if m.group(1) == '1' else 'law'; continue
        if who and ln.startswith('|'):
            cells = [c.strip() for c in ln.strip().strip('|').split('|')]
            if cells[0] in ('階段', '表上寫') or set(''.join(cells)) <= set('-: '):
                continue
            out.append((who, sec, cells))
    return out


DATA = invite_data()
# 2026-11-11（X324 D 區）：invites.js 已經照覆蓋層換過字（tools/invite/apply_overlay.py；AA_783、AA_784 file invites 的列）——「現有」的比對照 AA_415 稿上的舊字，
# 那幾格先換回 old 再比（表上的字＝old；invite_replies.js 的字最後一步照 AA_783 file invite_replies 的列換成新字，見檔案最後 overlay_replies）
import overlay_rows as OV
OV_INV = OV.rows(ROOT, 'invites', ALLOW)
for _x in OV_INV:
    _t = OV.parse(_x['at'])
    if _t[0] == 'people' and OV.get(DATA, _t[1:]) == _x['new']:
        OV.put(DATA, _t[1:], _x['old'])
import ps755 as PS755   # tools/story/ps755.py（AA_755_peishan_feed_misc.json；白名單沒有那份稿＝空表、不換）
PS755_MAP = PS755.sentence_map(PS755.load(ROOT, ALLOW), 'invites.js')


unq = GD.unq   # 外面整句一對「」拿掉（「A」「B」這種好幾段的不動）：有名字的台詞不加「」（AA-B 2026-11-08 00:21），稿上照舊有


def same(a, b):
    """兩組台詞一樣（不看外面的「」）"""
    return isinstance(a, list) and isinstance(b, list) and [unq(x) for x in a] == [unq(x) for x in b]


# CANON-NO-ECON-1112 第四批（AA_891 第 2 節，企劃線 c51906860）：可昕那幾列的新字（canon891 用；invites.js 那一格已經照 AA_894 換成同一句新字的「現有」列，find_existing 也認）
CANON891_NEW = {'kx1': '總圖？好。上課你都坐我後面，這次換你坐前面。', 'kx3': '吃飯？人多一點的話，好。', 'kx7': '好。我帶民總，你帶刑總。交換痛苦。',
                'kx8': '九點前。我答應室友一起吃宵夜。', 'kx12': '只有我們兩個？……好。我室友問的話，我說實話。', 'kx17': '我下午有選修，四點下課。',
                'kx18': '報告還沒寫完。明天？', 'kx19': '今天陪我室友。明天？', 'kx20': '好。幾點？我先把這一章念完。', 'kx21': 'Café？好。我要坐你平常坐的那張。',
                'kx22': '總圖？好。我睡著的話，叫醒我。', 'kx23': '公館燒臘？好。我要點你每次都點的那盤。', 'kx25': 'SUNNY SIDE？好。那家要排，我早一點出門。',
                'kx30': '好。這次不要再遲到。', 'kx32': '好。我室友問我為什麼答應。我說，因為是 Café。', 'kx34': '好。不要問我為什麼又答應。',
                'kx35': '好。九點我要回宿舍。……九點半。'}


def find_existing(who, pid_tags, lines, via, raw):
    """「現有」的列對到 INVITE_DATA：回傳 (ex, band)；對不上就停止"""
    p = DATA.get(who) or {}
    places = [t for t in pid_tags if t in PLACES]
    pid = places[0] if places else None
    flat = [x if isinstance(x, str) else x['me'] for x in lines]
    if via in ('rule', 'plan', 'here', 'partnerSay'):
        src = json.dumps(p, ensure_ascii=False)
        for q in re.findall(r'「((?:[^「」]|「[^「」]*」)*)」', raw):
            q = re.sub(r'(……|等)$', '', q)
            if q and q.replace('"', '\\"') not in src and q not in src:
                die(f'{who}：現有（{via}）的「{q}」在 INVITE_DATA 找不到')
        return via, None
    if pid and same((p.get('first') or {}).get(pid), flat):
        return 'first', None
    acc = (p.get('acc') or {}).get(pid)
    if isinstance(acc, list) and same(acc, flat):
        return 'acc', None
    if isinstance(acc, dict):
        for b in ('A', 'R'):
            if same(acc.get(b), flat):
                return 'acc', b
    if who == 'kexin' and isinstance(acc, dict) and len(flat) == 1:   # AA_891 kx25／AA_894：invites.js 可昕那一格已經是新字（AA_415 表上是舊字），最後 canon891 換成同一句
        for b in ('A', 'R'):
            v = acc.get(b)
            if isinstance(v, list) and len(v) == 1 and v[0] in CANON891_NEW.values():
                return 'acc', b
    die(f'{who}：現有的 {flat} 在 INVITE_DATA.people.{who} 的 acc／first（{pid}）找不到')


rows_out = {}
counts = {}
DROP_IDS = {'kx36', 'kx38'}
for who, sec, cells in sections(MD):
    if len(cells) != 4:
        die(f'{who}：表格欄數不是 4：{cells}')
    stage, tagcell, say, src = cells
    if who == PS755.PS and unq(say) in PS755_MAP:   # 2026-11-11（X327 沛珊重寫）：AA_755 other 的 invites.js 那幾句（AA_415 的「現有」列是同一句）→ 新句；invites.js 已經照同一份稿換了，下面「現有」的比對才對得上
        say = '「' + PS755_MAP[unq(say)] + '」'
    src = src.replace('`', '')
    n = counts[who] = counts.get(who, 0) + 1
    tags, cond, lim = parse_tags(tagcell)
    via, apart = None, False
    m = re.match(r'現有(?:（(\w+)）)?(?:；.*)?$', src)   # 來源欄「現有（rule）；改天；…」：分號後面是企劃說明（AA_415 an10，企劃線 bd39a1883 把說明從台詞格移到這一欄）
    if m:
        via = m.group(1) or 'acc'
    if stage == '改天':
        k, st = 'resched', lim or [1, 7]
    elif stage == '婉拒':
        k, st = 'decline', lim or [1, 7]
    else:
        k = 'acc'
        m = re.match(r'^(\d)(\+)?(?:（分開以後）)?$', stage)
        if stage in STAGE_NUM:
            s0 = STAGE_NUM[stage]; st = [s0, s0]
        elif m:
            s0 = int(m.group(1)); st = [s0, 6 if m.group(2) else s0]
            apart = '分開以後' in stage
        else:
            die(f'{who}：看不懂的階段：{stage}')
    alts = split_top(say, '／')
    split = via in (None, 'acc') and len(alts) > 1 and all(alt_head(a)[0] or alt_head(a)[1] for a in alts[1:])
    parts = alts if split else [say]
    for j, a in enumerate(parts):
        t2, dating, body = alt_head(a) if j else ([], False, a)
        lines = segments(body if split else (alts[0] if via in ('plan', 'rule') else say))
        # 企劃說明混進台詞格（例：AA_415 an10「（改天；祐廷那句…刪，AA_576 第 11 列）」，BB 2026-11-02 09:09）：寫到企劃檔編號的括號句不是台詞，不匯入（off 拿掉也不會播出來）
        notes = [x for x in lines if isinstance(x, str) and re.search(r'AA_\d+|BB_\d+', x)]
        if notes:
            print(f'略過企劃說明（不是台詞）：{who} 第 {n} 列：' + '、'.join(notes))
            lines = [x for x in lines if x not in notes]
        if not lines:
            die(f'{who}：沒有台詞：{cells}')
        row = {'id': f'{SHORT[who]}{n}' + ('abcdefg'[j] if split and j else ''), 'n': n, 'k': k, 'stage': stage, 'st': list(st), 'tags': tags + t2, 'cond': cond,
               'lines': lines, 'say': say, 'src': src}
        if dating:
            row['st'] = [7, 7]
        if sec:
            row['sec'] = sec
        if apart:
            row['apart'] = True
        if via:
            ex, band = find_existing(who, row['tags'], lines, via, say)
            row['ex'] = ex
            if band:
                row['band'] = band
            if ex in ('here', 'rule', 'partnerSay'):
                row['off'] = f'現有（{ex}）：照 INVITE_DATA.people.{who}.{ex} 原本的程式'
            elif ex == 'acc' and k == 'acc' and row['st'] != [7, 7]:
                row['st'] = [1, 2] if band == 'A' else ([3, 4] if band == 'R' else [st[0], 4])
            elif ex == 'first':
                row['st'] = [st[0], 7]
        if cond in OFF_COND:
            row['off'] = OFF_COND[cond]
        first = lines[0] if isinstance(lines[0], str) else lines[0]['me']
        if first in WHEN:
            row['when'] = WHEN.pop(first)
        if first in AT:
            if k != 'resched':
                die(f'{who}：AT 只給改天的句子：{first}')
            row['at'] = AT.pop(first)
        if row['id'] in DROP_IDS:   # CANON-NO-ECON-1112 第三批（AA_891 第 2 節：可昕 kx36、kx38 拿掉，和 kx17、kx19 重複）
            continue
        rows_out.setdefault(who, []).append(row)
if WHEN or AT:
    die('WHEN／AT 有對不到的句子：' + json.dumps(list(WHEN) + list(AT), ensure_ascii=False))

js = ['/* 自動產生：python3 tools/invite/build_replies.py（不要手改；改 AA_415 或白名單以後重跑）。',
      f'   來源：{SPEC} @ {SHA}（docs/handoff/story_import_allow.json，D14-T9／USER_WANTS D37）。句子一字不改。',
      '   每一筆：id、n（表上第幾列）、k（acc 答應／resched 改天／decline 婉拒）、stage（表上寫的）、st（可以用的階段 [低,高]，7＝交往中）、tags、cond（條件，src/invites3d.js S.REPLY_COND）、',
      '   lines（她說的話、（…）旁白、{me}祐廷說的；有名字說的外面不加「」，AA-B 11-08）、say（表上原文，照舊有「」）、src（來源）、ex（現有：acc／first／here／plan／rule／partnerSay）、band（現有答應句的 A／R）、',
      '   when（句子說到的時間星期）、at（改天的時間）、sec（可昕 y0／law）、apart（可昕分開以後）、off（不出現的原因）。選句：src/invites3d.js 的 S.replyPick（AA_415 第 0-3 節）。*/',
      'const INVITE_REPLIES={' + f'"src":{json.dumps(SPEC, ensure_ascii=False)},"sha":"{SHA}","task":"D14-T9",' + '"people":{']
ppl = list(rows_out)
for i, who in enumerate(ppl):
    js.append(f' {json.dumps(who)}:[')
    rs = rows_out[who]
    for j, r in enumerate(rs):
        js.append('  ' + json.dumps(r, ensure_ascii=False, separators=(',', ':')) + (',' if j < len(rs) - 1 else ''))
    js.append(' ]' + (',' if i < len(ppl) - 1 else ''))
js.append('}};')
_TEXT = '\n'.join(js) + '\n'   # 2026-11-11：不再先寫中間版（GHA 4 支同時跑時，別支測試的 git status 會看到還帶「」的中間版＝v1_inv_wording2 第 5 項偶爾紅）；換句、拿掉「」都在記憶體做完，最後一次原子寫入
tot = {w: (counts[w], len(rows_out[w]), sum(1 for r in rows_out[w] if r.get('off'))) for w in ppl}
print(f'{OUT}：' + '、'.join(f'{w} {a} 列（{b} 筆，off {c}）' for w, (a, b, c) in tot.items()))
# AA_630／AA_627 表 B（語彤台詞改寫，YT-REWRITE-1103）：寫完再照白名單上的逐句表換一次（整句相同才換；tools/story/aa630.py）
import sys as _sys, os as _os
_R0 = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))); _sys.path.insert(0, _os.path.join(_R0, 'tools', 'story'))
import aa630 as _aa630, import_guard as _ig
_TEXT = _aa630.patch_text(_aa630.load(_R0, _ig.load(_R0), _ig), OUT, _TEXT)


def strip_quotes(path, text):
    """有名字說的台詞拿掉外面那一對「」（AA-B 2026-11-08 00:21／01:09，TEXT-QUOTE-UNIFY-1108）：lines 裡她說的（字串）、祐廷說的（{me}）；
    旁白（（…）開頭、整句不是一對「」）、say（表上原文）、其他欄位照舊。放在最後（AA_630 換句以後）：WHEN／AT、「現有」的比對、AA_630 都照稿上有「」的原句做，結果跟以前一樣，
    只差外面的「」（tests/invites_quote_unit.js 第 6 項逐列比 c79414b00 的舊檔）。src/invites3d.js 播的時候照 S.narrLine 分旁白（拿掉以後沒有一句變成（ 開頭）"""
    out, n = [], 0
    for ln in text.split('\n'):
        m = re.match(r'^  (\{.*\})(,?)$', ln)
        if m:
            r = json.loads(m.group(1))
            new = [unq(x) if isinstance(x, str) else (dict(x, me=unq(x['me'])) if isinstance(x, dict) and isinstance(x.get('me'), str) else x) for x in r['lines']]
            n += sum(1 for a, b in zip(r['lines'], new) if a != b)
            r['lines'] = new
            ln = '  ' + json.dumps(r, ensure_ascii=False, separators=(',', ':')) + m.group(2)
        out.append(ln)
    print(f'{path}：有名字說的 {n} 句拿掉外面的「」')
    return '\n'.join(out)


def overlay_replies(path, text):
    """X324 D 區覆蓋層（白名單 overlay:true 的稿裡 file 是 invite_replies 的列；AA_783…；tools/story/overlay_rows.py）——放在最後
    （AA_627／AA_630、PS755、拿掉「」以後；稿的 old＝遊戲現在的字）：at＝<列 id>.lines[i]，那一列要是 who 的、那一格（她說的字串或 {me}）要剛好等於 old 才換，對不到就停。
    換過的列多一格 ov＝稿的來源（[path@sha]；tests/invites_quote_unit.js 這些列改比稿）；say（表上原文）不動。
    換完：同一個人的 lines 不能再有這幾句舊句；invites.js 那邊換了的句子（file invites 的列），這個人的 lines 也不能再有舊句（兩邊同句都要換到）。
    同一句別人也說（例：第 5 階「……只有我們？」語彤照留）＝不在稿上，照留、印出來。"""
    R = OV.rows(ROOT, 'invite_replies', ALLOW)
    if not R and not OV_INV:
        return text
    L = text.split('\n')
    idx, who = {}, None
    for i, ln in enumerate(L):
        m = re.match(r'^ "(\w+)":\[$', ln)
        if m:
            who = m.group(1); continue
        m = re.match(r'^  (\{.*\})(,?)$', ln)
        if m:
            r = json.loads(m.group(1))
            if r['id'] in idx:
                die(f'invite_replies.js 有兩列 id {r["id"]}')
            idx[r['id']] = [i, r, who, m.group(2)]
    txt = lambda x: x if isinstance(x, str) else (x.get('me') if isinstance(x, dict) else None)
    for x in R:
        w = f'{x["src"]} {x["who"]} {x["at"]}'
        ms = re.fullmatch(r'(\w+)\.say', x['at'])   # 2026-11-11（AA_783@60c08798a，AA_794 搬來）：表上原文 say 也可以換（整格等於 old 才換）
        if ms:
            if ms.group(1) not in idx:
                die(f'{w}：invite_replies.js 沒有 {ms.group(1)} 這一列')
            i, r, w2, comma = idx[ms.group(1)]
            if w2 != x['who']:
                die(f'{w}：{ms.group(1)} 是 {w2} 的列，不是 {x["who"]}')
            if r.get('say') != x['old']:
                die(f'{w}：say 現在是 {json.dumps(r.get("say"), ensure_ascii=False)}，不是稿的 old「{x["old"]}」（對不到，不猜）')
            r['say'] = x['new']
            if x['src'] not in r.setdefault('ov', []):
                r['ov'].append(x['src'])
            continue
        m = re.fullmatch(r'(\w+)\.lines\[(\d+)\]', x['at'])
        if not m:
            die(f'{w}：at 要寫 <列 id>.lines[i] 或 <列 id>.say')
        if m.group(1) not in idx:
            die(f'{w}：invite_replies.js 沒有 {m.group(1)} 這一列')
        i, r, w2, comma = idx[m.group(1)]
        k = int(m.group(2))
        if w2 != x['who']:
            die(f'{w}：{m.group(1)} 是 {w2} 的列，不是 {x["who"]}')
        if k >= len(r['lines']) or txt(r['lines'][k]) != x['old']:
            die(f'{w}：那一格現在是 {json.dumps(r["lines"][k] if k < len(r["lines"]) else None, ensure_ascii=False)}，不是稿的 old「{x["old"]}」（對不到，不猜）')
        if isinstance(r['lines'][k], str):
            r['lines'][k] = x['new']
        else:
            r['lines'][k] = dict(r['lines'][k], me=x['new'])
        if x['src'] not in r.setdefault('ov', []):
            r['ov'].append(x['src'])
    left = []
    for x in R + OV_INV:
        mine = [(rid, k) for rid, (i, r, w2, c) in idx.items() if w2 == x['who'] for k, t in enumerate(r['lines']) if txt(t) == x['old']]
        if mine:
            left.append(f'{x["who"]}：「{x["old"]}」還在 {mine}（{x["src"]} {x["at"]}）')
        other = [(w2, rid) for rid, (i, r, w2, c) in idx.items() if w2 != x['who'] and any(txt(t) == x['old'] for t in r['lines'])]
        if other and x in R:
            print(f'同一句別人也說（不在稿上，照留）：「{x["old"]}」{other}')
    if left:
        die('覆蓋層換完，同一個人還有舊句（invites.js 換了、invite_replies.js 沒換，或同一句兩列只換一列）：\n' + '\n'.join(left))
    for rid, (i, r, w2, comma) in idx.items():
        L[i] = '  ' + json.dumps(r, ensure_ascii=False, separators=(',', ':')) + comma
    if R:
        print(f'{path}：覆蓋層 {len(R)} 格（{"、".join(OV.sources(ROOT, "invite_replies", ALLOW))}）')
    return '\n'.join(L)


def canon891(path, text):
    """CANON-NO-ECON-1112 第四批（AA_891 第 2 節，企劃線 c51906860 定稿 BB_426）：可昕的邀約回覆——kx1～kx19 從 y0 搬進 law（她現在從認識開始，階段 1～6），
    表上那幾列的字照換（lines 只有一句的列整句換；say 跟著換成「」包起來的同一句）；kx25b 只換 say。放在覆蓋層之後（舊的覆蓋層是 AA_783，不再重匯）。"""
    NEW = CANON891_NEW
    SAY_ONLY = {'kx25b': '「好啊，我先查一下菜單。」'}
    MOVE = {'kx%d' % i for i in range(1, 20)}
    L = text.split('\n'); who = None; seen = set()
    for i, ln in enumerate(L):
        m = re.match(r'^ "(\w+)":\[$', ln)
        if m:
            who = m.group(1); continue
        m = re.match(r'^  (\{.*\})(,?)$', ln)
        if not m or who != 'kexin':
            continue
        r = json.loads(m.group(1)); rid = r['id']
        if rid in NEW:
            if len(r['lines']) != 1 or not isinstance(r['lines'][0], str):
                die(f'AA_891：{rid} 不是只有一句（{r["lines"]}），不猜')
            r['lines'] = [NEW[rid]]; r['say'] = '「' + NEW[rid] + '」'; seen.add(rid)
        if rid in SAY_ONLY:
            r['say'] = SAY_ONLY[rid]; seen.add(rid)
        if rid in MOVE:
            if r.get('sec') != 'y0':
                die(f'AA_891：{rid} 的 sec 不是 y0（{r.get("sec")}）')
            r['sec'] = 'law'; seen.add(rid)
        L[i] = '  ' + json.dumps(r, ensure_ascii=False, separators=(',', ':')) + m.group(2)
    miss = (set(NEW) | set(SAY_ONLY) | MOVE) - seen
    if miss:
        die('AA_891：對不到的列 ' + '、'.join(sorted(miss)))
    print(f'{path}：AA_891 可昕 {len(NEW)} 列換字、kx1～kx19 搬進 law')
    return '\n'.join(L)


_TEXT = strip_quotes(OUT, _TEXT)
_TEXT = overlay_replies(OUT, _TEXT)
_TEXT = canon891(OUT, _TEXT)
_p = os.path.join(ROOT, OUT)
if not os.path.exists(_p) or open(_p, encoding='utf-8').read() != _TEXT:
    _tmp = _p + '.tmp%d' % os.getpid()
    open(_tmp, 'w', encoding='utf-8').write(_TEXT)
    os.replace(_tmp, _p)
