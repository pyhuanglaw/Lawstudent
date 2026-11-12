"""校外約會台詞改完以後整批掃（AA 2026-11-11；BB_325、BB_326 的上限）：
  python3 docs/story_planning/tools_aa/date_scan.py <人物id> D01 D02 … [--old '保溫瓶|論文|研究室']
每個地點列：爸媽幾次（上限 2）、12 字以內的短格幾格（下限 4）、兩句一格的比例（BB_326：一半上下，太高會變固定節拍）、「今天」幾格、可能是舊設定的字（--old 自己給；不給＝沛珊那一組）。
芷若另外量（BB_330）：店裡的事（店裡、吧檯、客人、上班、圍裙、奶泡、拉花）每個地點 3 格以內、光／構圖／職業病 1 格以內、「欸」開頭 1 格以內。
可昕另外量（BB_329）：對祐廷下命令的「不准／不要」每個地點 2 格以內、外校室友 1 格以內、行程表一處（成對 2 格）以內。
語彤另外量（BB_328）：蘇姨＋秀琴姨＋我媽每個地點合計 2 格以內（同一件事的第一次＋再訪算一對）、茶屋 2 格以內、她「數東西」（幾秒、幾次、幾個）2 格以內；超過的列出來。
最後列跨地點一模一樣的句子、整批的每格句數分布、「上次」開頭、收尾講「明天」幾處（整份稿三處以內）。讀 date_system/lines（含沒動的舊格）。"""
import re,collections,subprocess,sys
a=sys.argv[1:]; old='早餐店|蛋餅|好貴|問題|不用回答|課本|太貴'
if '--old' in a: i=a.index('--old'); old=a[i+1]; a=a[:i]+a[i+2:]
who=a[0]; locs=a[1:]
out=subprocess.run(['python3','docs/story_planning/tools_aa/date_rewrite.py','list',who]+locs,capture_output=True,text=True).stdout
loc=None; D=collections.defaultdict(list)
for l in out.split('\n'):
    m=re.match(r'=== (D\d+)',l)
    if m: loc=m.group(1); continue
    m=re.match(r'\s*(\d+) (\S+)｜(.*)',l)
    if m: D[loc].append((int(m.group(1)),m.group(2),m.group(3)))
strip=lambda t: re.sub(r'（[^）]*）','',t).strip()
nsent=lambda t: len([c for c in re.split(r'[。！？]',strip(t)) if c.strip()])
allv=collections.defaultdict(list); tot=collections.Counter(); heads=collections.Counter(); up=0; tom=0
for k,v in D.items():
    hers=[(i,key,t) for i,key,t in v if not t.startswith('「') and strip(t)]
    par=[(i,t) for i,key,t in hers if re.search('我爸|我媽|爸媽',t)]
    sh=[i for i,key,t in hers if len(strip(t))<=12]
    two=sum(1 for i,key,t in hers if nsent(t)==2)
    oldh=[(i,t) for i,key,t in v if re.search(old,t)]
    today=sum(1 for i,key,t in hers if '今天' in t)
    flag=' ←' if len(par)>2 or len(sh)<4 else ''
    print(k,'爸媽',len(par),'短格',len(sh),'兩句格',f'{round(100*two/max(1,len(hers)))}%','今天',today,flag)
    if len(par)>2:
        for i,t in par: print('    ',i,t)
    for i,t in oldh: print('    舊字？',i,t)
    if who=='heroine_02':
        shop=[(i,t) for i,key,t in hers if re.search('店裡|吧檯|客人|上班|圍裙|奶泡|拉花|老闆說',t)]
        lite=[(i,t) for i,key,t in hers if re.search('光|構圖|鏡頭|職業病',t)]
        ei=[(i,t) for i,key,t in hers if strip(t).startswith('欸')]
        over=len(shop)>3 or len(lite)>1 or len(ei)>1
        print(f'    店裡的事 {len(shop)}、光／職業病 {len(lite)}、欸開頭 {len(ei)}'+(' ←' if over else ''))
        if len(shop)>3:
            for i,t in shop: print('      店',i,t)
        if len(lite)>1:
            for i,t in lite: print('      光',i,t)
    if who=='heroine_04':
        meta=[(i,t) for i,key,t in hers if re.search('地圖|關卡|路徑規劃|負載|進度條|材質|彩蛋|任務|存檔|讀取|新手教學|NPC|碰撞|穿模|載入|bug|Bug',t)]
        own=[(i,t) for i,key,t in hers if re.search('我的遊戲|我想做一關|做進遊戲|教學關',t)]
        hl=[(i,t) for i,key,t in hers if '好啦' in t]
        cmd=[(i,t) for i,key,t in hers if re.search('不准|不要動|這是命令|你不要',t)]
        sl=[(i,t) for i,key,t in hers if re.search('起床|想睡|鬧鐘|睡著',t)]
        over=len(meta)>2 or len(own)>2 or len(hl)>2 or len(cmd)>1 or len(sl)>1
        print(f'    遊戲比喻 {len(meta)}、她的遊戲 {len(own)}、好啦 {len(hl)}、命令句 {len(cmd)}、晚起想睡 {len(sl)}'+(' ←' if over else ''))
        if len(meta)>2:
            for i,t in meta: print('      比喻',i,t)
        if len(cmd)>1:
            for i,t in cmd: print('      命令',i,t)
    if who=='heroine_01':
        chk=[(i,t) for i,key,t in hers if re.search('我查過|查過了|我查了|查好',t)]
        mins=[(i,t) for i,key,t in hers if '分鐘' in t]
        plan=[(i,t) for i,key,t in hers if re.search('行程|排好|排了|沒排|順序',t)]
        law=[(i,t) for i,key,t in hers if re.search('考試|期中|期末|法條|判決|法官|法律|讀書|念書|唸書',t)]
        ok=[(i,t) for i,key,t in hers if re.match(r'(（[^）]*）)?好。',t)]
        cmd=[(i,t) for i,key,t in hers if '不准' in t]
        over=len(chk)>1 or len(mins)>2 or len(plan)>2 or len(law)>2 or len(ok)>3 or len(cmd)>1
        print(f'    我查過 {len(chk)}、分鐘 {len(mins)}、行程順序 {len(plan)}、考試法律 {len(law)}、「好。」開頭 {len(ok)}、不准 {len(cmd)}'+(' ←' if over else ''))
        for nm,lst,lim in (('查',chk,1),('分',mins,2),('排',plan,2),('法',law,2),('好',ok,3),('令',cmd,1)):
            if len(lst)>lim:
                for i,t in lst: print('      '+nm,i,t)
    if who=='kexin':
        cmd=[(i,t) for i,key,t in hers if re.search('不准|你不要|(^|[。，！？）])不要|別想',t)]
        yl=[(i,t) for i,key,t in v if '外校室友' in t]; sc=[(i,t) for i,key,t in v if '行程表' in t]
        over=len(cmd)>2 or len(yl)>1 or len(sc)>2
        print(f'    命令（不准／不要）{len(cmd)}、外校室友 {len(yl)}、行程表 {len(sc)}'+(' ←' if over else ''))
        if len(cmd)>2:
            for i,t in cmd: print('      令',i,t)
        if len(yl)>1:
            for i,t in yl: print('      外校室友',i,t)
        if len(sc)>2:
            for i,t in sc: print('      表',i,t)
    if who=='heroine_03':
        ppl=[(i,t) for i,key,t in v if re.search('蘇姨|秀琴姨|我媽|^媽媽|，媽媽說',t)]
        tea=[(i,t) for i,key,t in v if '茶屋' in t]
        num=[(i,t) for i,key,t in hers if re.search('(\\d+|[兩二三四五六七八九十百]+|半)(秒|分鐘|次|個(?!人在)|步|架|小時|遍|百個字)|數了|數到|算過|還要數',strip(t))]
        hm=[(i,t) for i,key,t in hers if strip(t).startswith('嗯')]
        msg=f'    家裡店裡的人 {len(ppl)}、茶屋 {len(tea)}、數東西 {len(num)}、嗯開頭 {len(hm)}'
        over=len(ppl)>2 or len(tea)>2 or len(num)>2 or len(hm)>1
        print(msg+(' ←' if over else ''))
        if len(ppl)>2:
            for i,t in ppl: print('      人',i,t)
        if len(tea)>2:
            for i,t in tea: print('      茶屋',i,t)
        if len(num)>2:
            for i,t in num: print('      數',i,t)
    for i,key,t in hers:
        tot[nsent(t)]+=1; up+=strip(t).startswith('上次'); tom+=('closing' in key and '明天' in t)
    for i,key,t in v: allv[t].append((k,i))
    for i,key,t in hers:
        if 'closing' in key: heads[strip(t)[:3]]+=1
for t,w in allv.items():
    if len({x[0] for x in w})>1 and not t.startswith('「') and not t.startswith('（') and len(t)>5: print('重複',t,w)
# 過夜地點（D26～D32）講到時段的句子：四個點分兩天走，只有夕陽／星星／雲海綁時段（AA_359、BB_327 第 4 節）
TIME=r'天快暗|天黑|天色|晚上|今晚|夕陽|日落|星|早上|中午|下午|傍晚|末班'
for k,v in D.items():
    if not ('D26'<=k<='D32'): continue
    for i,key,t in v:
        if t.startswith('「') or re.search('sunset|stars|cloud',key): continue
        if re.search(TIME,t): print('  過夜時段？',k,i,key.split('[')[0],t)
n=sum(tot.values())
print('道別格開頭三個字出現四次以上的（BB_327：同一個開頭留四個上下）：',{k:v for k,v in heads.items() if v>=4})
print('整批：',n,'格；每格句數',dict(sorted(tot.items())),'；兩句格',f'{round(100*tot[2]/max(1,n))}%','；「上次」開頭',up,'；收尾講明天',tom)
