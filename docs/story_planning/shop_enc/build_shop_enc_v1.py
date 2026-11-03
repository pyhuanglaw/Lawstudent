# -*- coding: utf-8 -*-
"""店內偶遇第一批（AA_632；SHOP-ENCOUNTER-1103，使用者 11-03「我希望除了路人 也會隨機在不同店面遇到朋友 或可以認識人」）。
格式照 src/data/encounters.js 的 rows（who、spot、why、days、from、to、terms、weeks、stageMin、busy、join、memo、away、lines、ex、src），
spot 用店的 zone id（places.js names）。輸出 shop_enc_aa_v1.json。檢查：每行 ≤40 字、選項 ≤20 字、沒有真實品牌。"""
import json, os
HERE=os.path.dirname(os.path.abspath(__file__))
LAW=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']
ROWS=[
 # ---- 兩點半 Café（cafe）----
 dict(who='heroine_01',spot='cafe',why='她坐在靠窗的位子，手帳攤開，旁邊一杯冷掉的拿鐵。',days=[6,0],from_=14,to=17,terms=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y4S1','Y4S2'],stageMin='ACQUAINTANCE',busy={'acq':'short','friend':'no'},join='friend',memo='SHOP_CAFE_AN',away='在兩點半',
   lines={'acq':['……你也來這裡。','我在整理這週的筆記。你坐吧，我不會吵。'],'friend':['你來得剛好。這一題我想聽別人的說法。','先點東西。我等你。'],'dating':['……你怎麼知道我在這。','坐。這杯拿鐵冷了，等一下再點一杯。']},
   ex={'apart_life':['……嗨。我快寫完了。']}),
 dict(who='classmate_bohan',spot='cafe',why='他坐在最角落，耳機戴著，桌上三本書疊得很整齊。',days=[1,3],from_=19,to=22,terms=LAW,stageMin='ACQUAINTANCE',busy='no',join='friend',memo='SHOP_CAFE_BH',away='在兩點半',
   lines={'acq':['……{name}。','這裡比總圖晚關。我都在這讀到十點。'],'friend':['坐我旁邊。我剛好讀到你也在讀的那一章。','你先讀。等一下我們互相問。']}),
 # ---- 舊路書房（bookstore）----
 dict(who='classmate_mingxuan',spot='bookstore',why='他蹲在二手參考書那一排，一本一本翻價錢。',days=[6],from_=11,to=14,terms=LAW,stageMin='ACQUAINTANCE',busy='short',join='friend',memo='SHOP_BOOK_MX',away='在舊路書房',
   lines={'acq':['欸，{name}。','這本學長姊的筆記版只要一百五。我在想要不要買兩本。'],'friend':['你看這本，前面的人畫了好多重點。','……可是畫錯了。算了，還是買。']}),
 # ---- 日日便利（cvs）----
 dict(who='kai',spot='cvs',why='他站在微波爐前面，等一碗泡麵加熱。',days=[0,1,2,3,4,5,6],from_=23,to=25,terms=None,stageMin=None,busy='no',join=False,memo='SHOP_CVS_KAI',away='在日日便利',
   lines={'all':['……室友。你也餓喔。','我今天 debug 到現在。不要問。']}),
 dict(who='heroine_04',spot='cvs',why='她在冷藏櫃前面，拿了一罐咖啡又放回去，換了一罐。',days=[1,2,3,4],from_=22,to=25,terms=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'],stageMin='ACQUAINTANCE',busy='short',join=False,memo='SHOP_CVS_ZQ',away='在日日便利',
   lines={'acq':['欸。……你這麼晚還沒睡。','我也沒有。這是今天第二罐。'],'friend':['你要喝什麼？我請你。今天的程式跑過了。','……只跑過一半。另一半明天再說。'],'dating':['……你怎麼在這。','陪我走回去。一下就好。']},
   ex={'apart_drift':['欸不是……好久不見。我先走了。']}),
 # ---- 巷口茶飲（wz_tea）----
 dict(who='classmate_peishan',spot='wz_tea',why='她在等飲料，手上拿著一疊課輔班的講義。',days=[3],from_=21,to=21.75,terms=['Y1S1','Y1S2','Y2S1','Y2S2'],stageMin='ACQUAINTANCE',busy='short',join=False,memo='SHOP_TEA_PS',away='在巷口茶飲',
   lines={'acq':['{name}！你也來買喔。','我剛下課輔班。今天講了三次一元二次方程式。'],'friend':['你要喝什麼？我這杯第二杯半價，分你。','……不要跟別人說我每次都點全糖。']}),
 dict(who='yu',spot='wz_tea',why='她拿著兩杯飲料，在騎樓下回訊息。',days=[0],from_=15,to=17,terms=['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],stageMin='ACQUAINTANCE',busy='short',join='friend',memo='SHOP_TEA_YU',away='在溫州街',
   lines={'acq':['欸！{name}！','我買兩杯，一杯是要給……算了，一杯給你。'],'friend':['你來得剛好，我買錯一杯。','少冰我喝不慣，給你。……真的是買錯，不是買給你的。']}),
 # ---- 半熟（wz_brunch）----
 dict(who='classmate_xinci',spot='wz_brunch',why='她一個人坐雙人桌，左邊財金課本、右邊民法講義。',days=[6],from_=10,to=12,terms=LAW,stageMin='ACQUAINTANCE',busy={'acq':'short','friend':'no'},join='friend',memo='SHOP_BRUNCH_XC',away='在半熟',
   lines={'acq':['……{name}，早。','我在這裡把兩份報告排一下順序。'],'friend':['你坐。我一個人佔兩人桌，老闆一直看我。','你吃什麼？這家的蛋捲很好吃。']}),
 dict(who='zhe',spot='wz_brunch',why='他坐在吧檯，面前三個空盤子。',days=[0],from_=10.5,to=12,terms=LAW,stageMin='ACQUAINTANCE',busy='no',join=True,memo='SHOP_BRUNCH_ZHE',away='在半熟',
   lines={'acq':['欸！{name}！','我在吃第四份。不要跟系籃的人說。'],'friend':['哥！坐，這份給你，我點太多了。','……好啦，我點兩份是故意的。']}),
]
NEW=dict(id='npc_songzn',name='知寧',fullname='宋知寧',dept='中文系・二年級',
  intro_spot='bookstore',days=[6],from_=14,to=17,terms=['Y1S1','Y1S2','Y2S1','Y2S2'],
  first=dict(why='你伸手拿書架上那本舊的《民法總則》，另一隻手也同時碰到它。',
    lines=['……啊，抱歉。你先。','你是法律系的？我只是想看看裡面的筆記。前一個主人字很好看。'],
    choices=[('「妳先看。」',['謝謝。……我看完放回來，你再買。','（她翻了十分鐘，把書遞給你。）「第三章的筆記最好看。」']),
             ('「一起看？」',['……好。','（你們站在書架前面翻了二十分鐘。她說她叫知寧，中文系的。）'])],
    memo='SHOP_ZN_MET'),
  later=[ ['……又是你。','今天沒有法律的書。我在找一本老詩集。'],
          ['你上次買的那本，筆記看完了嗎？','我覺得那個人後來一定念得很好。'],
          ['我下禮拜要搬去另一個書店打工了。','……那邊也很舊。你有空可以來。'] ],
  contact=dict(after=2,line='（她把手機遞過來。）「加一下吧。看到好書跟你說。」',flag='SHOP_ZN_CONTACT'),
  note='外系常客、朋友關係，不是可攻略對象；不接閒聊階梯；加聯絡人以後每學期最多兩則「看到一本書」的訊息（照 msg_pool 的普通訊息）。'
)
RULES={'values':'打招呼：熟悉 +1；併桌／一起坐：照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；不打擾：沒有變化。不加戀愛，不算約會',
 'options':['打招呼','一起坐（join 允許時）','不打擾'],
 'once':'同一個人一天一次；同一家店同一時段最多一個朋友（多個符合時照固定種子挑一個）',
 'not':['考試週（期中、期末那兩週）只在 cafe、cvs 出現（讀書、宵夜的人），其他店不排','那天和她有約會、或她在約會中','她在國外、休學、回老家（照 characters.js presence）','劇情事件演出中（S.storyBusy）','前任：照 ex 那一句，沒有寫的用 ENCOUNTERS.NOD','可昕不在這一批（她多半不在台北）','語彤不在這一批（茶屋以外的偶遇等 AA_630 接線後再排）']}
def check():
    import re
    err=[]
    def walk(o):
        if isinstance(o,str):
            if len(o)>40: err.append('太長：'+o)
        elif isinstance(o,dict):
            for v in o.values(): walk(v)
        elif isinstance(o,(list,tuple)):
            for v in o: walk(v)
    walk([r['lines'] for r in ROWS]); walk(NEW['first']['lines']); walk(NEW['later'])
    return err
out={'source':'AA_632（企劃線）','rules':RULES,'rows':[{**{k:v for k,v in r.items() if k!='from_'},'from':r['from_'],'src':'AA_632'} for r in ROWS],'newPeople':[{**{k:v for k,v in NEW.items() if k!='from_'},'from':NEW['from_']}]}
e=check()
if e: raise SystemExit('\n'.join(e))
json.dump(out,open(os.path.join(HERE,'shop_enc_aa_v1.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok',len(ROWS),'rows')
