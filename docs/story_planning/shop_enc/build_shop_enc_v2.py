# -*- coding: utf-8 -*-
"""店內偶遇第二批（AA_633；接 AA_632）。格式同 v1（src/data/encounters.js rows，spot＝店的 zone id）。輸出 shop_enc_aa_v2.json。"""
import json, os
HERE=os.path.dirname(os.path.abspath(__file__))
LAW=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']
ROWS=[
 dict(who='zhe',spot='noodle',why='他坐在不鏽鋼桌，面前一盤叉燒飯已經吃了一半。',days=[1,2,3,4,5],from_=18,to=19.5,terms=LAW,stageMin='ACQUAINTANCE',busy='no',join=True,memo='SHOP_SL_ZHE',away='在公館燒臘',
   lines={'acq':['欸，{name}！','這家燒鴨飯我一個禮拜吃三次。你坐啊。'],'friend':['哥！坐，我幫你點。燒鴨還是叉燒？','……兩個都點，我們分。']}),
 dict(who='classmate_bohan',spot='wz_print',why='他站在影印機旁邊，手上抱著一疊剛印好的講義。',days=[0,1,2,3,4,5,6],from_=19,to=21.5,terms=LAW,weeks=[7,8,15,16],stageMin='ACQUAINTANCE',busy='short',join=False,memo='SHOP_PRINT_BH',away='在影印店',examOK=True,
   lines={'acq':['……{name}。你也來印。','我印了三份。一份畫重點，一份寫，一份備用。'],'friend':['你要不要我的講義？我多印了一份。','……其實是故意多印的。']}),
 dict(who='classmate_mingxuan',spot='wz_lin',why='他坐在門口那桌，吃得很快，一邊看手錶。',days=[2,4],from_=18,to=18.75,terms=LAW,stageMin='ACQUAINTANCE',busy='short',join=False,memo='SHOP_LIN_MX',away='在林家乾麵',
   lines={'acq':['欸，{name}。','我七點半家教，先吃一碗。乾麵加一顆蛋，很快。'],'friend':['你要吃這家喔？推乾麵，湯不用點。','我要先走了。……幫我跟老闆說謝謝，他多給我一顆蛋。']}),
 dict(who='classmate_peishan',spot='wz_ice',why='她和芯慈坐在一起，中間一大盤芒果冰。',days=[6],from_=15,to=17,terms=['Y1S2','Y2S1','Y2S2'],months=[5,6,9],stageMin='ACQUAINTANCE',busy='no',join='friend',memo='SHOP_ICE_PS',away='在冰菓室',
   lines={'acq':['{name}！要不要一起吃？太大盤了。','芯慈說吃不完，可是她已經吃一半了。'],'friend':['你來得剛好，幫我們解決這盤。','……不要吃我這邊的芒果。']}),
 dict(who='heroine_05',spot='wz_teishoku',why='她一個人坐在角落，定食旁邊攤著一本原文書。',days=[1,2,3,4,5],from_=12.5,to=13.5,terms=['Y1S1','Y1S2','Y2S1','Y2S2'],stageMin='ACQUAINTANCE',busy={'acq':'short','friend':'no'},join='friend',memo='SHOP_TEI_SIS',away='在巷子裡定食',
   lines={'acq':['學弟。……你也吃這家。','今天的鯖魚很好。我快吃完了。'],'friend':['坐。我剛好讀到一段想講給人聽。','……你先吃，等一下再講。'],'dating':['你怎麼來了。','坐我對面。今天的魚分你一半。']},
   ex={'apart_talk':['學弟。……我先走了。']}),
]
SHOPKEEPER=dict(id='shop_ade',name='阿德',role='阿德影印輸出的老闆',spot='wz_print',
  lines=[ ['又期末了喔？','你們法律系每到這兩個禮拜，店裡就印不完。'],
          ['雙面還是單面？……雙面啦，比較省。'],
          ['你上次那份我還記得，第三頁印歪了。今天我幫你看一下。'],
          ['（他把印好的講義對齊，用長尾夾夾好。）「拿去。考好一點。」'] ],
  rule='在影印店「印東西」時隨機一句（每次最多一句；期中、期末那兩週出現的機率高）；不是偶遇系統，是店員招呼。')
RULES={'inherit':'照 AA_632 第 1、3 節（打招呼／一起坐／不打擾；不會遇到的情況）',
 'examOK':'examOK:true 的列（影印店）在考試週也會遇到；其他照 AA_632 只有 cafe、cvs',
 'months':'months 有寫的列只在那幾個月（冰菓室：5、6、9 月）'}
def check():
    err=[]
    def walk(o):
        if isinstance(o,str):
            if len(o)>40: err.append('太長：'+o)
        elif isinstance(o,dict):
            for v in o.values(): walk(v)
        elif isinstance(o,(list,tuple)):
            for v in o: walk(v)
    walk([r['lines'] for r in ROWS]); walk(SHOPKEEPER['lines'])
    return err
e=check()
if e: raise SystemExit('\n'.join(e))
out={'source':'AA_633（企劃線）','rules':RULES,'rows':[{**{k:v for k,v in r.items() if k!='from_'},'from':r['from_'],'src':'AA_633'} for r in ROWS],'shopkeepers':[SHOPKEEPER]}
json.dump(out,open(os.path.join(HERE,'shop_enc_aa_v2.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok',len(ROWS),'rows')
