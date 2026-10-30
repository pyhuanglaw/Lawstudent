# -*- coding: utf-8 -*-
"""經濟系大一下（Y0S2）的閒聊階梯：可昕（kexin）、品妤（econ_pinyu）、唐睿（econ_tangrui）、阿勳（econ_zhengxun）、韋綸（econ_weilun）→ ladder_bb_y0s2.json。
作者：BB-B 2026-10-16（AA-B 派工 AB-20）。原稿說明：../BB_146_閒聊階梯_經濟系大一.md。格式同 ladder_bb_y0s1.json，term＝'Y0S2'。
**現在的時間線**（AA_218 第 10 節，2026-10-17 BB-C）：祐廷大一上第 7 週 2024-10-17 休學、當天和可昕交往（摩天輪），10/19 搬出宿舍；可昕 2025-02-13 休學、搬出宿舍，之後兩人在祐廷家的餐桌念書（不在博雅；2026-10-17 BB-C（照 AA_235 71d62646）），七月考試（分科測驗，不考民法總則）。經濟系四個朋友照常上課；阿勳是 10/19 以前的室友，品妤是可昕上學期的室友。
**舊時間線**（AA_154 2-3，只供對照；E26 交往、E30 休學、A3 搬出宿舍已經改到大一上）：W1 T3、E24b；W2 旁聽；W4 E24c 決定；W5 E25 告白、E26 摩天輪（3/22，交往）；W6 E27、E28、E30 休學（3/27）、R1；W7 R5；W8 R2；W9 R4＝E32 模擬考；W10 E18b 生日（4/24）；W12 R6；W14 R7 保齡球再戰；W6 A3 搬出宿舍（3/29，休學要先退宿，AA_154 A23）；W16 E34（6/2）。七月考試。
**可昕**：這學期一開始就在交往（`dating_kexin`），階梯從第 1 週起，3D 遇到就聊（沒有 context:'date'）（2026-10-17 BB-C；原本第 6 週起）。
**祐廷大一上已經休學、搬回臺北的家**（AA_218 第 10 節）：不上經濟系的課；朋友們照常上課。
**防卡關**：`if` 只放階段（可昕只放 dating_kexin）；週次放寬到第 16 週（2026-10-16 改 16 週制，AA_198）。
**不重複事件的台詞**（build 擋，見 BAN）。
2026-10-17 BB-C（BB_199，16 週制）：週次上限 17／18 一律改 16（AA_197 1-6：第 1～15 週上課、第 16 週期末，第 17 週起放假；假期不推進學期階梯，待 LAWWW 實作確認）。
用法：python3 build_ladder_bb_y0s2.py → ladder_bb_y0s2.json；--check 只檢查。"""
import json, sys, os
Y='Y0S2'
def st(npc, mn): return {'stage': {'npc': npc, 'min': mn}}
def fl(*f): return {'flags': list(f)}
def ch(t, reply, rel=None, mem=None):
    c = {'t': t, 'reply': reply}
    if rel: c['rel'] = rel
    if mem: c['mem'] = mem
    return c

KX='kexin'; PY='econ_pinyu'; TR='econ_tangrui'; XN='econ_zhengxun'; WL='econ_weilun'
D = {'_comment': __doc__, 'term': Y, 'characters': {}}
DK={'flags':['dating_kexin']}

# ───────── 杜可昕（交往中；說好一起重考；祐廷家的同一張餐桌）─────────
D['characters'][KX] = {'steps': [
 {'id':'K0b-L1','if':DK,'week':[1,16],
  'lines':['你房間那張書桌，你坐左邊，我坐右邊。','中間這一條線，是我們的國界。……橡皮擦可以出口。'],
  'choices':[ch('「飲料呢？」','飲料可以。可是你要分我一口。'),
             ch('「我想坐右邊。」','不行。右邊靠窗。……好啦，下週換。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX0B_BORDER',
  'note':'E29 同一張桌子（2026-10-17 BB-C（照 AA_235 71d62646）：＝祐廷家的餐桌，AA_224 5-1、6-2；原本寫博思小桌自習區）；不重複 R1 互相出題（2026-10-16 上下文修正：在 3D 別處遇到也聽得懂，「同一張桌子。」改「我們讀書那張桌子」）'},
 {'id':'K0b-L2','if':DK,'week':[1,16],
  'lines':['我在你的鉛筆盒上貼了一張便利貼。不要看。','看了不准笑喔。上面那隻長頸鹿，脖子畫太短了，我知道。'],
  'choices':[ch('「很可愛。」','你在笑。我說不准笑。'),
             ch('「我也畫一隻給妳。」','好。脖子要畫長一點。不然我們的長頸鹿會被笑。',rel={'comf':1})],'rel':{'comf':2},'mem':'KX0B_SHORT_NECK',
  'note':'E20 長頸鹿鑰匙圈之後；法律系大四下 K24「脖子還是很短」的伏筆（不說破）'},
 {'id':'K0b-L3','if':DK,'week':[2,16],
  'lines':['歷史我讀了三遍。','第三遍的時候，我開始跟課本講話。我問它，東南亞的歷史為什麼這麼難背。'],
  'choices':[ch('「它回妳了嗎？」','沒有。……所以我只好自己背。'),
             ch('「我陪妳讀第四遍。」','好。第四遍你考我。我被考才記得住。',rel={'comf':1})],'rel':{'comf':2,'trust':1},'mem':'KX0B_TALK_TO_BOOK',
  'note':'2026-10-17 BB-C（照 AA_235 71d62646）：她三類組，社會要從頭讀，考分科測驗、不考民總 → 改成地理（AA_224 5-1）；mem 照留'},
 {'id':'K0b-L7','if':DK,'week':[10,16],
  'lines':['讀書讀到一半，我最喜歡的是休息那五分鐘。','……因為我們會一起下樓去買飲料。五分鐘，走到巷口剛好。'],
  'choices':[ch('「今天喝什麼？」','你決定。……不要又買跟昨天一樣的。'),
             ch('「下次我買三杯。」','三杯？……一杯給你媽。好，你很會做人。')],'rel':{'comf':2},'mem':'KX0B_FIVE_MIN',
  'note':'2026-10-17 BB-C（照 AA_235 71d62646）：讀書的地方是祐廷家，品妤不在 → 第三杯給他媽媽（R1 他媽媽端水果，AA_224 6-2）'},
],'greet':None,'note':'經濟系大一下，整學期都在交往（2024-10-17 起，AA_218 第 10 節）；3D 遇到就聊；短招呼用手機池。2026-10-17 BB-C：週次改從第 1 週起（L1～L7 往前移，L8 考前一個月照舊）；台詞沒改，和新設定衝突的句子（博思的桌子、品妤「在我們房間」等）待 BB／AA 改稿。2026-10-17 BB-C（照 AA_235 71d62646）：K0b-L1、L3、L5、L7、L8 照 AA_235 2-1 改稿（祐廷家的餐桌、分科測驗）'}

# ───────── 曾品妤 ─────────
D['characters'][PY] = {'friendOnly': True, 'steps': [
 {'id':'PY0b-L3','if':st(PY,'FAMILIAR'),'week':[7,16],
  'lines':['可昕搬走以後，我的房間變得好安靜。','她的床現在堆我的東西。宿舍說暑假以後才會排人。'],
  'choices':[ch('「妳一個人住很爽吧。」','很爽。冷氣我自己決定。'),
             ch('「妳想她喔。」','沒有。她每天都傳訊息來，想也沒機會。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'PY0B_NOISY_ROOM',
  'note':'可昕 2025-02-13 休學、搬出宿舍（AA_218 第 10 節）；床位到暑假以後才排人（和阿勳 XN0b-L3 同一個做法）。mem 名稱照留'},
 {'id':'PY0b-L4','if':st(PY,'FAMILIAR'),'week':[7,16],
  'lines':['可昕說你們不去重考班，在你家讀。','我幫她算了一下，省下來的學費，夠買一台二手機車。'],
  'choices':[ch('「那我呢？」','你本來就免費，沒什麼好算的。'),
             ch('「妳也算太多了。」','習慣了啦。不算我會睡不著。')],'rel':{'fam':2},'mem':'PY0B_BEST_DEAL',
  'note':'AA_224 5-1：祐廷差四分可以免費、可昕全額 → 兩人在家讀。不寫金額'},
 {'id':'PY0b-L7','if':st(PY,'FAMILIAR'),'week':[13,16],
  'lines':['唐睿最近一直問我，計算機好不好用。','很好用啊。他已經問第五次了，是不是記性變差了？'],
  'choices':[ch('「可能是。」','我會叫他多吃魚。'),
             ch('「他可能想問別的。」','別的？……計算機還有什麼好問的。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'PY0B_FIFTH_TIME',
  'note':'T3 情人節的計算機（第 1 週）之後；沒看過 T3 的玩家也通（品妤自己說）'},
 {'id':'PY0b-L8','if':st(PY,'FRIEND'),'week':[15,16],
  'lines':['你們七月考試。我七月打工。','考完那天我會請假。不要想太多，我本來就想休一天。'],
  'choices':[ch('「謝謝。」','不用謝啦。扣的錢你們要請我吃飯。',rel={'comf':2}),
             ch('「那天我們去吃宵夜。」','好。我訂位。我知道哪一家可以坐最久。')],'rel':{'fam':2,'comf':1},'mem':'PY0B_DAY_OFF'},
],'greet':{'base':['（她在記帳 App 上打字）嗨。','這學期的微積分作業好多。','補習班這學期換了新的排課系統，很難用。','（她在手機上按計算機）等我一下，我算完這個。','今天的午餐我算過，小松最划算。'],
 'when':[{'weekday':[2, 4],'time':[17, 18],'t':'我要去打工了。櫃台不等人。'},
         {'week':[8, 9],'t':'期中考週。補習班我沒請假，算過還撐得住。'},
         {'weather':'rain','t':'下雨。今天補習班應該很多人請假。'},
         {'week':[16, 16],'t':'期末。我們考完就放暑假，你們還要撐到七月。'},
         {'weekday':[2, 4],'time':[22, 24],'t':'我剛下班。好累。'}]},
 'note':'經濟系同學、可昕上學期的室友（2026-10-17 BB-C（照 AA_235 71d62646））；朋友的話（friendOnly）'}

# ───────── 唐睿 ─────────
D['characters'][TR] = {'friendOnly': True, 'steps': [
 {'id':'TR0b-L1','if':st(TR,'ACQUAINTANCE'),
  'lines':['寒假我去演了一場兒童劇。我演一棵樹。','演到一半，一個小朋友衝上台抱住我的腳。……全場都在笑，我只能繼續當樹。'],
  'choices':[ch('「樹有說台詞嗎？」','說了，「風來了」。說完就被抱住了。'),
             ch('「你是一棵好樹。」','謝謝。……我會把這句寫在便利貼上。',rel={'comf':1})],'rel':{'fam':2},'mem':'TR0B_HUGGED_TREE'},
 {'id':'TR0b-L3','if':st(TR,'FAMILIAR'),'week':[7,16],
  'lines':['這學期經原要分組。品妤問了一圈，最後跟我一組。','她說是因為我都會準時交。'],
  'choices':[ch('「真的是這個原因？」','她說的。我沒有再問。'),
             ch('「那你要準時交。」','我已經寫好三頁大綱了。她還沒看。',rel={'trust':1})],'rel':{'fam':2,'comf':1},'mem':'TR0B_WAVED',
  'note':'E28（2/13 群組）「妳可以跟唐睿」之後；不說破他喜歡品妤。mem 名稱（WAVED）對不上，照留'},
],'greet':{'base':['（他舉起手）{name}！','（他從口袋拿出一張便利貼，貼在你的袖子上）送你一張。','嗨！我今天又被學姊抓去系辦幫忙。','今天我又記住兩個新名字。','（他拉了一下 polo 衫的領子）'],
 'when':[{'week':[8, 9],'t':'期中！我等一下還有一科，先走了，你也加油。'},
         {'weather':'rain','time':[18, 22],'t':'下雨天，劇社的人都會遲到。我先去等。'},
         {'time':[19, 22],'week':[1, 11],'t':'我要去劇社。今天排長劇，我演阿土。'},
         {'week':[16, 16],'t':'期末。你跟可昕七月才考，要加油。'},
         {'any':[{'events': ['ev_y0_e28']}, {'flags': ['Y0_LEFT']}],'t':'嗨！你今天也在讀書吧，我不吵你。'}]},
 'note':'經濟系同學、即興劇社；朋友的話（friendOnly）'}

# ───────── 盧正勳（阿勳；10/19 以前的室友：祐廷第 7 週休學、10/19 退宿搬回臺北的家，AA_218 第 10 節）─────────
D['characters'][XN] = {'friendOnly': True, 'steps': [
 # 阿勳 XN0b-L1、L3 整層替代（AA_235）
 {'id':'XN0b-L1','if':st(XN,'ACQUAINTANCE'),
  'lines':['寒假回家，我媽問你最近怎樣。','我說你休學在家，還交了女朋友。她比較在意第二個。'],
  'choices':[ch('「她說什麼？」','她說，休學在家的人，有人管比較好。'),
             ch('「幫我謝謝阿姨。」','好。她說下次寄橘子，還是有你的一份。')],'rel':{'fam':2},'mem':'XN0B_MOM_ASKED',
  'note':'寒假（1 月）還沒決定重考，只說休學在家。接 XN0-L7（橘子）'},
],'greet':{'base':['（他把耳機拿下來）有事？……沒事也可以。','宿舍的熱水又壞了。你搬走真的是對的。','經原的老師今天又拖堂。','你今天讀到第幾章了？','（他推了一下眼鏡）嗯。你來了。'],
 'when':[{'time':[0, 3],'t':'這麼晚還不睡。……我也是。'},
         {'week':[8, 9],'t':'期中。經原考完我再找你吃飯。'},
         {'weather':'rain','t':'下雨。我多帶了一把傘，你拿去。'},
         {'week':[16, 16],'t':'期末。我也要搬了，暑假先住家裡。'},
         {'any':[{'events': ['ev_y0_e24c']}, {'flags': ['Y0_LEFT']}],'t':'今天讀幾頁了？……算了，你讀完再跟我說。'}]},
 'note':'10/19 以前的室友；這學期在校園、公館遇到就聊；朋友的話（friendOnly）。2026-10-17 BB-C（照 AA_235 71d62646）：原本寫「室友到 3/29」「之後在博思、社科院遇到」；base「熱水」改成明確是他自己的宿舍；刪掉宿舍第 1～5 週「你回來了」那句（祐廷這學期不住宿舍，永遠說不到）'}

# ───────── 邱韋綸 ─────────
D['characters'][WL] = {'friendOnly': True, 'steps': [
 {'id':'WL0b-L3','if':st(WL,'FAMILIAR'),'week':[7,16],
  'lines':['你休學那天跟可昕在一起，二月又說要重考。','我一年的計畫，你半年就做完了。'],
  'choices':[ch('「你也可以。」','我可以！……我先做完第一個。是什麼來著。'),
             ch('「走啦，宵夜。」','你學我！好啦，走。',rel={'comf':1})],'rel':{'fam':2,'comf':1},'mem':'WL0B_ONE_MONTH',
  'note':'E28 告訴朋友之後（2026-10-17 BB-C（照 AA_235 71d62646）：休學和交往同一天〔10/17〕，重考是二月）'},
],'greet':{'base':['（他邊走邊吃飯糰）嗨！','（他推著腳踏車）嗨！','今天要去哪裡？我還沒想。','我肚子好餓。','（他戴著安全帽，瀏海被壓扁）嗨！'],
 'when':[{'weather':'rain','t':'下雨了！……騎腳踏車還是可以。就是會濕。'},
         {'week':[8, 9],'t':'期中！我明天考兩科，今天先不揪了。'},
         {'time':[21, 24],'any':[{'events': ['ev_y0_e28']}, {'flags': ['Y0_LEFT']}],'t':'宵夜！你們讀完再來，我先去佔位子。'},
         {'week':[16, 16],'t':'期末！七月考完，我們去淡水！'},
         {'any':[{'events': ['ev_y0_e28']}, {'flags': ['Y0_LEFT']}],'t':'今天要去哪裡？……喔你要讀書。好，那我自己去。'}]},
 'note':'經濟系同學；揪大家出門的人；朋友的話（friendOnly）'}

BAN=['大家都只問','你是第一個','熱可可','加一份濃縮','我請你','我可以問一個奇怪的問題嗎',
     '經濟效益是零','答案是零','數字有溫度','熱力學',
     '你是品妤','一個人和他的影子','所以現在你也是全系了','陪我去派出所','全系都知道',
     '我想重考法律','我不是因為你','不然要在一起嗎','抽象藝術','我是經濟系的','杜鵑花可以投票','一百天',
     '她以為是文具','花不能按','保齡球欠我一場','冷笑話會少一半','最有效率的告別','那保齡球誰陪我打',
     '經濟學不會告訴你該選什麼','考完要去哪裡','你讀這本的表情','你在窗外站很久','脖子還是很短']
BRANDS=['麥當勞','摩斯','星巴克','7-11','統一超商','全家便利','萊爾富','誠品','路易莎','50嵐','五十嵐','迷客夏','寶可夢','任天堂','Switch','iPhone','Instagram','Google','YouTube','Netflix','迪士尼']
def texts(s):
    out=list(s['lines'])+[x for li in s.get('linesIf',[])+s.get('extraIf',[]) for x in li['lines']]
    for c in s.get('choices',[]): out+= [c['t'], c['reply']]
    return out
def check(d):
    err=[]
    for cid,c in d['characters'].items():
        ids=[s['id'] for s in c['steps']]
        if len(ids)!=len(set(ids)): err.append(cid+' 層 id 重複')
        if len(ids)!=(4 if cid==KX else 4 if cid==PY else 2 if cid==TR else 1 if cid==XN else 1 if cid==WL else 8): err.append(cid+' 層數不對（可昕 K0b 只留 L1、L2、L3、L7：L4、L5、L6、L8 使用者 10-18 拿掉，AA_306）')
        if 'context' in c: err.append(cid+' 經濟系大一下不用 context（在 3D 遇到就聊）')
        for s in c['steps']:
            for l in texts(s):
                if len(l)>48: err.append(f"{s['id']} 台詞太長（{len(l)}）：{l}")
                for b in BAN+BRANDS:
                    if b in l: err.append(f"{s['id']} 禁用字樣「{b}」：{l}")
            for ch_ in s.get('choices',[]):
                if len(ch_['t'])>20: err.append(f"{s['id']} 選項超過 20 字：{ch_['t']}")
            if len(s.get('choices',[]))>2: err.append(s['id']+' 選項超過 2')
            cond=s.get('if',{})
            bad=[k for k in cond if k not in ('stage','any')]
            if cid==KX and cond!={'flags':['dating_kexin']}: err.append(s['id']+' 可昕的 if 只能是 dating_kexin')
            elif cid!=KX and bad: err.append(f"{s['id']} 的 if 只能放階段（防卡關）：{bad}")
            if 'week' in s and s['week'][1]<16: err.append(f"{s['id']} 週次沒有放寬到第 16 週（會卡關；16 週制，AA_198）")
        g=c.get('greet')
        if g and len(g['base'])!=5: err.append(cid+' 短招呼不是 5 句')
        if g:
            for w in g['when']:
                if len(w['t'])>48: err.append(f"{cid} 情境句太長：{w['t']}")
                for b in BAN+BRANDS:
                    if b in w['t']: err.append(f"{cid} 情境句禁用字樣「{b}」")
            for b in g['base']:
                if len(b)>48: err.append(f"{cid} 短招呼太長：{b}")
                for x in BAN+BRANDS:
                    if x in b: err.append(f"{cid} 短招呼禁用字樣「{x}」")
    return err
e=check(D)
if e: sys.exit('\n'.join(e))
# KX-EXPR-1018（使用者 10-18：「可昕不管什麼對話的表情都一樣」）：可昕的台詞標表情，輸出成 {'t','e'}（story3d.js ladLines 讀 l.e）；檢查過後才轉，漏標會失敗（AA-C 10-20）
KX_EXPR={'你房間那張書桌，你坐左邊，我坐右邊。': 'serious', '中間這一條線，是我們的國界。……橡皮擦可以出口。': 'teasing', '我在你的鉛筆盒上貼了一張便利貼。不要看。': 'embarrassed', '看了不准笑喔。上面那隻長頸鹿，脖子畫太短了，我知道。': 'embarrassed', '歷史我讀了三遍。': 'tired', '第三遍的時候，我開始跟課本講話。我問它，東南亞的歷史為什麼這麼難背。': 'annoyed', '讀書讀到一半，我最喜歡的是休息那五分鐘。': 'smile', '……因為我們會一起下樓去買飲料。五分鐘，走到巷口剛好。': 'smile'}
_miss=[]
for _st in D['characters'][KX]['steps']:
    for _grp in [_st]+list(_st.get('linesIf') or []):
        _new=[]
        for _l in _grp['lines']:
            if _l in KX_EXPR: _new.append({'t':_l,'e':KX_EXPR[_l]})
            else: _miss.append(_st['id']+'：'+_l); _new.append(_l)
        _grp['lines']=_new
if _miss: sys.exit('可昕沒有標表情：\n'+'\n'.join(_miss))
if '--check' not in sys.argv:
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ladder_bb_y0s2.json'),'w',encoding='utf-8') as f:
        json.dump(D,f,ensure_ascii=False,indent=1); f.write('\n')
print('ok', {k:len(v['steps']) for k,v in D['characters'].items()})
