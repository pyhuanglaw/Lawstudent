# -*- coding: utf-8 -*-
"""把 _src/<term>.py 轉成 <TERM>.json（給 LAWWW）與 ../BB_102_課堂內容_<學期>.md（給人看）。
用法：python3 docs/story_planning/syllabus/build.py y1s1
檢查：台詞與同學反應不超過 40 字、黑板每行不超過 30 字、週次不落在考試週。"""
import importlib.util, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TERM_NAMES = {'JP':'日文','Y0S1':'經濟系大一上','Y0S2':'經濟系大一下','Y1S1':'大一上','Y1S2':'大一下','Y2S1':'大二上','Y2S2':'大二下','Y3S1':'大三上','Y3S2':'大三下','Y4S1':'大四上','Y4S2':'大四下'}
WHO = {'heroine_01':'以安','heroine_02':'芷若','zhe':'阿哲','yu':'小語','classmate_xinci':'芯慈','classmate_bohan':'柏翰',
       'classmate_mingxuan':'明軒','classmate_youchen':'宥辰','classmate_peishan':'沛珊','npc_huangxh':'筱涵','kai':'阿凱',
       'heroine_03':'語彤','heroine_04':'子晴','heroine_05':'溫學姊','class':'同學',
       'kexin':'可昕','econ_weilun':'韋綸','econ_pinyu':'品妤','econ_zhengxun':'阿勳','econ_tangrui':'唐睿',
       'jp_caizhen':'采蓁','jp_liheng':'立衡','jp_yuheng':'宇恆'}
PROF = {'prof_zhou':'周教授','prof_zhang':'張教授','prof_wu':'吳教授','prof_huang':'黃教授','prof_xu':'許教授','prof_tsai':'蔡教授',
        'prof_lin':'林教授','prof_chen':'陳教授','prof_zheng':'鄭教授','prof_ye':'葉教授','prof_he':'何教授','prof_jian':'簡教授','prof_wei':'魏教授'}
BLOCK = {'am':'09:10–12:10','pm1':'13:20–15:10','pm2':'15:30–17:20'}
WD = '一二三四五六日'
EXAM_WEEKS = {8,9,17,18}

def load_bank():
    """課堂提問讀的題庫：exam_official/ 的正式題目（使用者給的，不含 superseded/）。qid → 題目。"""
    bank = {}
    root = os.path.join(HERE, '..', 'exam_official')
    for f in sorted(os.listdir(root)):
        if f.endswith('.json') and f != 'course_bank_map.json':
            with open(os.path.join(root, f), encoding='utf-8') as fh:
                for q in json.load(fh)['questions']: bank[q['id']] = q
    return bank

BANK = load_bank()

def load(key):
    p = os.path.join(HERE,'_src',key+'.py')
    spec = importlib.util.spec_from_file_location('src_'+key, p)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def main(key):
    m = load(key); term = m.TERM; problems = []; recalls = []; attends = []
    def chk(text, lim, where):
        if len(text) > lim: problems.append(f'{where}：{len(text)} 字＞{lim}：{text}')
    out = {'term':term, 'exam_weeks':sorted(EXAM_WEEKS), 'courses':[], 'pools':[]}
    LEAVE = getattr(m,'LEAVE_WEEK',None)   # 經濟系大一下：休學的那一週（交接包_v0 第 0 節第 5 點）
    if LEAVE: out['leave_week']=LEAVE
    for c in m.COURSES:
        cj = {k:c[k] for k in ('id','name','kind','retake','prof','slots','room') if k in c}
        if c.get('prof_label'): cj['prof_label'] = c['prof_label']
        if c.get('choice'): cj['choice'] = c['choice']
        if c.get('note'): cj['note'] = c['note']
        cj['term'] = term; cj['syllabus'] = []; cj['special'] = []
        seen = set(); asked = {}
        for wk in c['weeks']:
            w = wk['w']; tag = f"{c['name']} 第 {w} 週"
            if w in EXAM_WEEKS: problems.append(f'{tag}：落在考試週')
            if w in seen: problems.append(f'{tag}：重複')
            seen.add(w)
            if len(wk['board']) != 3: problems.append(f'{tag}：黑板不是三行')
            for b in wk['board']: chk(b, 30, tag+' 黑板')
            chk(wk['line'], 40, tag+' 教授')
            e = {'w':w, 'tpl':wk['tpl'], 'board':wk['board'], 'line':wk['line'],
                 'react':[{'who':a,'text':t} for a,t in wk['react']]}
            if LEAVE and w>LEAVE:
                e['after_leave']=True   # 休學以後：不排進課表，只當同學在群組、走廊說起的素材
                if wk['tpl']!='A' or wk.get('obs'): problems.append(tag+'：休學以後不能有要玩家選的東西（只能是 A）')
            for a,t in wk['react']:
                chk(t, 40, tag+' 反應'); 
                if a not in WHO: problems.append(f'{tag}：未知的 who {a}')
            if wk['tpl']=='B':
                o = wk['obs']; e['obs'] = {'prompt':o['prompt'],'options':[{'text':a,'result':b} for a,b in o['options']]}
                for a,b in o['options']: chk(a,20,tag+' 選項'); chk(b,40,tag+' 結果')
                if o.get('kind')=='discuss':
                    # 討論型 B（AA_119）：三個看法＋「我想先聽別人說」→ 同學回應（全部依序）→ 教授收尾（不說誰對）；記下玩家的看法
                    e['obs']['kind']='discuss'
                    if len(o['options'])!=4: problems.append(tag+'：討論型 B 要四個選項（三個看法＋我想先聽別人說）')
                    if not 2<=len(o.get('replies',[]))<=3: problems.append(tag+'：討論型 B 的同學回應要兩到三句')
                    e['obs']['replies']=[{'who':a,'text':t} for a,t in o.get('replies',[])]
                    for a,t in o.get('replies',[]):
                        chk(t,40,tag+' 同學回應')
                        if a not in WHO: problems.append(f'{tag}：未知的 who {a}')
                    if not o.get('close'): problems.append(tag+'：討論型 B 要有教授收尾')
                    e['obs']['close']=o.get('close',''); chk(e['obs']['close'],40,tag+' 教授收尾')
                    rec=o.get('record','')
                    if not rec.startswith(f"B_{term}_{c['id']}_w{w}"): problems.append(f'{tag}：record 要是 B_{term}_{c["id"]}_w{w}')
                    e['obs']['record']=rec
                    if o.get('understand'): e['obs']['understand']=o['understand']
                    if o.get('echo'): e['obs']['echo']=o['echo']
                    if o.get('recall'):
                        # 回想（AA_119 第 3 節的回聲）：條件成立時播一句旁白；預設在 prompt 之後、選項之前，after＝某位同學回應之後
                        e['obs']['recall']=[]; whos=[a for a,_ in o.get('replies',[])]
                        for r in o['recall']:
                            keys=[k for k in ('record','attended','flag','memory','activity') if r.get(k)]
                            if len(keys)!=1: problems.append(f'{tag}：回想要剛好一個條件（record／attended／flag／memory／activity）'); continue
                            k=keys[0]; rr={k:r[k]}
                            if k=='memory':
                                mm=r[k]
                                if not (isinstance(mm,dict) and mm.get('npc') and mm.get('tag')): problems.append(f'{tag}：回想的 memory 要寫成 dict(npc=…, tag=…)'); continue
                                if mm['npc'] not in WHO: problems.append(f'{tag}：回想的 memory 人物 {mm["npc"]} 不認得')
                                rr[k]={'npc':mm['npc'],'tag':mm['tag']}
                            if k=='record':
                                if '{choice}' not in r.get('said',''): problems.append(f'{tag}：回想 {r[k]} 的 said 要有 {{choice}}')
                                if not r.get('listened'): problems.append(f'{tag}：回想 {r[k]} 少了 listened（當時選「我想先聽別人說」）')
                                for f in ('said','listened','missed'):
                                    if r.get(f): rr[f]=r[f]; chk(r[f].replace('{choice}',''),40,tag+' 回想')
                                recalls.append((tag,r[k]))
                            else:
                                if not r.get('say'): problems.append(f'{tag}：回想 {r[k]} 少了 say')
                                rr['say']=r.get('say',''); chk(rr['say'],40,tag+' 回想')
                                if k=='attended': attends.append((tag,r[k]))
                            if r.get('after'):
                                if r['after'] not in whos: problems.append(f'{tag}：回想的 after {r["after"]} 不是這一週回應的同學')
                                rr['after']=r['after']
                            e['obs']['recall'].append(rr)
                    if o.get('skip_line'):
                        a,t=o['skip_line']; e['obs']['skip_line']={'who':a,'text':t}; chk(t,50,tag+' 翹課轉述')
                        if a not in WHO: problems.append(f'{tag}：未知的 who {a}')
                    else: problems.append(tag+'：討論型 B 要有翹課的轉述（skip_line）')
            if wk['tpl']=='C':
                cl = wk['call']; e['call'] = {'options':cl['options'],'follow':cl['follow']}
                for a in cl['options']: chk(a,20,tag+' 選項')
                for a in cl['follow']: chk(a,40,tag+' 收尾')
            if wk.get('recall'):
                # 一般課（A、C、觀察型 B）的回想：條件成立時，教授那句之後多一句旁白（交接包 v2 第 12 週憲法：聽完演講的玩家）
                if (wk.get('obs') or {}).get('kind')=='discuss': problems.append(tag+'：討論型 B 的回想寫在 obs 裡')
                e['recall']=[]
                for r in wk['recall']:
                    keys=[k for k in ('attended','flag','activity') if r.get(k)]
                    if len(keys)!=1 or not r.get('say'): problems.append(f'{tag}：回想要剛好一個條件（attended／flag／activity）和 say'); continue
                    k=keys[0]; chk(r['say'],40,tag+' 回想')
                    if k=='attended': attends.append((tag,r[k]))
                    e['recall'].append({k:r[k],'say':r['say'],'after':'line'})
            if wk.get('ask'):
                # 課堂提問（AA_126 1-5 A、AA_130 §3；2026-10-14）：使用者題庫的一題，那堂課最後由教授問；一週最多一題，
                # 題目只寫 qid（從 exam_official/ 讀原文，這裡不重抄）；題目檔的 askedIn 由 exam_official/tools/sync_asked.py 從這裡同步
                qid = wk['ask']; q = BANK.get(qid)
                if not q: problems.append(f'{tag}：課堂提問 {qid} 不在 exam_official/ 的題庫')
                else:
                    if q.get('status') != 'USER_CONFIRMED': problems.append(f'{tag}：課堂提問 {qid} 不是 USER_CONFIRMED')
                    if q['term'] != term or q['course'] != c['id']: problems.append(f"{tag}：課堂提問 {qid} 是 {q['term']} {q['course']} 的題目")
                    if int(q['scopeWeek']) > w: problems.append(f"{tag}：課堂提問 {qid} 的範圍到第 {q['scopeWeek']} 週，這週還沒教到")
                    if any('課表沒有專講' in x for x in q.get('flags', []) + q.get('mapNote', [])): problems.append(f'{tag}：課堂提問 {qid} 的主題課表沒有專講，不在課堂問')
                if qid in asked: problems.append(f'{tag}：課堂提問 {qid} 已經在 {asked[qid]} 問過')
                asked[qid] = tag
                if LEAVE and w > LEAVE: problems.append(tag+'：休學以後不能有課堂提問')
                e['ask'] = {'qid': qid}
            if wk['tpl'] in 'BC' and wk['tpl']=='B' and 'obs' not in wk: problems.append(tag+'：B 沒有 obs')
            if wk.get('review'): e['review'] = wk['review']
            if wk.get('special'):
                e['special'] = True; cj['special'].append({'w':w,'ref':wk['special']['ref']})
            cj['syllabus'].append(e)
        if c.get('second'):
            cj['second_slot_lines'] = c['second']
            for t in c['second']: chk(t, 40, c['name']+' 第二格')
        cj['skip'] = c.get('skip',[])
        for t in cj['skip']: chk(t, 50, c['name']+' 翹課訊息')
        out['courses'].append(cj)
    for p in m.POOLS:
        pj = dict(p); pj['term'] = term; pj['react'] = [{'who':a,'text':t} for a,t in p['react']]
        for t in p['lines']: chk(t, 40, p['name']+' 台詞')
        out['pools'].append(pj)
    # 回想讀的紀錄、課堂要真的存在（其他學期讀已經產生的 JSON）
    terms = {term: out}
    for f in os.listdir(HERE):
        if f.endswith('.json') and f[:-5] != term:
            with open(os.path.join(HERE, f), encoding='utf-8') as fh: terms[f[:-5]] = json.load(fh)
    recs = {w['obs']['record']: w['obs'] for d in terms.values() for c in d['courses'] for w in c['syllabus'] if (w.get('obs') or {}).get('record')}
    for tag, rec in recalls:
        if rec not in recs: problems.append(f'{tag}：回想讀的紀錄 {rec} 不存在')
    for tag, a in attends:
        p = a.split(':')
        ok = len(p) == 3 and p[0] in terms and p[2].startswith('w') and p[2][1:].isdigit()
        if ok:
            c = next((c for c in terms[p[0]]['courses'] if c['id'] == p[1]), None)
            ok = bool(c) and any(w['w'] == int(p[2][1:]) for w in c['syllabus'])
        if not ok: problems.append(f'{tag}：回想讀的課堂 {a} 不存在（格式：學期:課程id:w週）')
    jp = os.path.join(HERE, term+'.json')
    with open(jp,'w',encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, indent=1)
    md = render(m, out)
    mp = os.path.join(HERE,'..',f'BB_102_課堂內容_{TERM_NAMES[term]}.md')
    with open(mp,'w',encoding='utf-8') as f: f.write(md)
    print('寫出', os.path.relpath(jp), os.path.relpath(mp))
    print('課程', len(out['courses']), '週次', sum(len(c['syllabus']) for c in out['courses']), '池', len(out['pools']))
    if problems:
        print('問題：'); [print(' -', x) for x in problems]; sys.exit(1)

def recall_md(r):
    pos = '（教授那句之後）' if r.get('after')=='line' else (f"（{WHO.get(r['after'], r['after'])}的回應之後）" if r.get('after') else '（選項前）')
    if r.get('record'):
        return (f"讀 `{r['record']}`{pos}：選了看法→{r['said']}／先聽別人說→{r['listened']}／沒有紀錄→"
                + (r['missed'] if r.get('missed') else '（不加）'))
    if r.get('memory'):
        m = r['memory']
        return f"{WHO.get(m['npc'], m['npc'])}記得 `{m['tag']}`（人物記憶）{pos}→{r['say']}"
    k = next(k for k in ('attended', 'flag', 'activity') if r.get(k))
    lab = {'attended': '去過', 'flag': '有旗標', 'activity': '聽過活動'}[k]
    return f"{lab} `{r[k]}`{pos}→{r['say']}"

def render(m, out):
    term = out['term']; L = []
    L.append(f"> **正式開發內容（使用者 2026-10-13：課表是正式開發工作，BB 依 `AA_103` 八學期課表寫普通課堂內容，AA 負責課程連續性，LAWWW 整合）。** 作者：BB。")
    L.append(f"> 機器可讀版本：`syllabus/{term}.json`（欄位照 `AA_104` 第 1 節的 `syllabus`）；原始資料 `syllabus/_src/`，用 `python3 docs/story_planning/syllabus/build.py <學期>` 重新產生。**本檔是產生出來的，要改內容請改 `_src` 再重建。**")
    L.append("> 法律內容：只寫基本、通說或明文的內容；有爭議的地方讓同學各說各的、教授不給單一答案；標 `需法律審查` 的列出要查的點。遊戲對話不講判決字號；待核實的案號一律不用。")
    L.append("> 主要人物：以安、芷若在普通課堂只有日常的一句（以安的話偏公法與制度）；**不推進任何感情線**；主要人物的特殊事件依目前安排暫緩實作，未開放前那一週用普通內容。")
    L.append("")
    L.append(f"# BB_102　課堂內容：{TERM_NAMES[term]}")
    L.append("")
    L.append("## 0. 怎麼用")
    L.append("")
    L.append("- 每門課每週一筆：**黑板三行＋教授一句＋同學反應**（A 類大多沒有同學發言，有的話一句）。模板：**A** 一句開場、一個例子、下課（沒有選項）；**B** 觀察（不影響數值的小選擇，選了只顯示一行結果）；**B（討論）** 有爭點的互動課（`AA_119`）：教授問一題 → 玩家選三個看法之一或「我想先聽別人說」→ 兩三個同學依序回應 → 教授收尾、不說誰對，記下玩家的看法（有些週有**回想**：照玩家之前的看法、去過的課、旗標、人物記憶或聽過的演講，在選項前或某位同學之後多一句旁白；A、C 類和觀察型 B 也可以有回想，放在教授那句之後）；**C** 被點到，但沒有對錯（三個立場都接同一個收尾）。")
    if term=='Y0S1':
        L.append("- 第 8～9、17～18 週考試，不上課。經濟系那一年從第 1 週開始（E01～E05、P1、B1 都在第 1～2 週），不是法律系的「第 3 週週三」。")
    elif term=='Y0S2':
        L.append(f"- 第 8～9、17～18 週考試，不上課；從第 1 週開始。**第 {out.get('leave_week')} 週辦休學**：之後經濟系的課不排進課表，第 {out.get('leave_week',0)+1} 週以後的內容（標「休學後」）只當同學在群組、走廊說起的素材，沒有要玩家選的東西；法學緒論休學後不上，之後的週不放進遊戲（交接包_v0 第 0 節第 5 點）。")
    else:
        L.append("- 第 8～9、17～18 週考試，不上課；遊戲第一天是第 3 週週三，第 1～2 週只是資料。")
    if any(e.get('ask') for c in out['courses'] for e in c['syllabus']): L.append("- **課堂提問**（`ask`；2026-10-14 起，`AA_126` 1-5 A、`AA_130` §3）：使用者題庫的一題，一週最多一題，排在真的教到那個主題的週。那堂課最後（A：教授那句之後；B：觀察或討論收尾之後；C：點名收尾之後）：旁白「（下課前，教授在黑板角落寫了一題。）」→ 題幹＋四個選項（使用者原文，用 `qid` 從 `exam_official/` 讀，這裡不重抄）→ 玩家選 → 「答案是（X）。」（題目有解析才顯示解析；AI 不補寫）→ 這學期這門課第一次問的時候，教授加一句「期末考，會考這樣的題目。」。不計分、不影響成績；沒去上課不演，期末考一樣算課堂題（優先抽）。")
    L.append("- **翹課**：不扣任何東西；那門課的「翹課訊息」可以在當天晚上出現一則（群組一行）。")
    L.append("- 標「特殊事件」的週：有完整事件時用事件；事件還沒做或暫緩時，用這裡的普通內容。")
    L.append("")
    for c in out['courses']:
        src = next(x for x in m.COURSES if x['id']==c['id'])
        prof = PROF.get(c.get('prof'), c.get('prof_label',''))
        slot = '、'.join(f"週{WD[s['wd']-1]} {BLOCK[s['block']]}" for s in c['slots'])
        L.append(f"## {c['name']}（`{c['id']}`）｜{prof}｜{slot}｜{c['room']}")
        L.append("")
        L.append(f"- 教授的聲音：{src.get('voice','')}")
        if src.get('note'): L.append(f"- 注意：{src['note']}")
        if src.get('choice'): L.append(f"- 選修二選一（`{src['choice']['group']}`）：" + '／'.join('`'+x+'`' for x in src['choice']['options']) + '；開學前的「選課結果」事件決定，沒選就用第一個')
        L.append("")
        L.append("| 週 | 模板 | 黑板 | 教授 | 同學反應 | 需法律審查 |")
        L.append("|---|---|---|---|---|---|")
        for e in c['syllabus']:
            b = '<br>'.join(e['board'])
            extra = ''
            if e['tpl']=='B' and e['obs'].get('kind')=='discuss':
                ob=e['obs']
                extra = ('<br>**討論**：'+ob['prompt']+'<br>'+'／'.join(f"「{o['text']}」→{o['result']}" for o in ob['options'])
                         +'<br>**同學**：'+' '.join(f"{WHO.get(x['who'],x['who'])}「{x['text']}」" for x in ob['replies'])
                         +'<br>**收尾**：「'+ob['close']+'」<br>**記錄**：`'+ob['record']+'`'
                         +('（理解：'+'、'.join(ob['understand'])+'）' if ob.get('understand') else '')
                         +('<br>**回想**：'+'；'.join(recall_md(r) for r in ob['recall']) if ob.get('recall') else '')
                         +('<br>**回聲**：'+ob['echo'] if ob.get('echo') else '')
                         +('<br>**翹課**：'+WHO.get(ob['skip_line']['who'],ob['skip_line']['who'])+'「'+ob['skip_line']['text']+'」' if ob.get('skip_line') else ''))
            elif e['tpl']=='B': extra = '<br>**觀察**：'+e['obs']['prompt']+' '+'／'.join(f"「{o['text']}」→{o['result']}" for o in e['obs']['options'])
            if e['tpl']=='C': extra = '<br>**選項**：'+'／'.join('「'+o+'」' for o in e['call']['options'])+'<br>**收尾**：'+' '.join('「'+x+'」' for x in e['call']['follow'])
            if e.get('recall'): extra += '<br>**回想**：'+'；'.join(recall_md(r) for r in e['recall'])
            if e.get('ask'):
                q = BANK.get(e['ask']['qid'], {})
                extra += f"<br>**課堂提問**：`{e['ask']['qid']}`（{q.get('core') or q.get('difficulty','')}；答案 {q.get('answer','')}）"
            r = '<br>'.join(f"{WHO.get(x['who'],x['who'])}：「{x['text']}」" for x in e['react'])
            sp = '（特殊事件週）' if e.get('special') else ''
            tl = e['tpl'] + ('（休學後：群組、走廊）' if e.get('after_leave') else '')
            L.append(f"| {e['w']}{sp} | {tl} | {b} | 「{e['line']}」{extra} | {r} | {e.get('review','')} |")
        L.append("")
        if c['special']:
            L.append("- 特殊事件：" + '；'.join(f"第 {s['w']} 週＝{s['ref']}" for s in c['special']))
        if c['skip']:
            L.append("- 翹課訊息：" + '／'.join(c['skip']))
        if c.get('second_slot_lines'):
            L.append("- 一週第二格（短片段，隨機一句）：" + '／'.join('「'+x+'」' for x in c['second_slot_lines']))
        L.append("")
    L.append("## 共同課程（一句台詞的池子，每週隨機一句）")
    L.append("")
    for p in out['pools']:
        slot = '、'.join(f"週{WD[s['wd']-1]} {BLOCK[s['block']]}" for s in p['slots'])
        L.append(f"### {p['name']}（`{p['id']}`）｜{p['prof_label']}｜{slot}｜{p['room']}")
        L.append("")
        L.append("- 老師：" + '／'.join('「'+x+'」' for x in p['lines']))
        L.append("- 同學：" + '／'.join(f"{WHO.get(x['who'],x['who'])}「{x['text']}」" for x in p['react']))
        L.append("")
    return '\n'.join(L)+'\n'

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv)>1 else 'y1s1')
