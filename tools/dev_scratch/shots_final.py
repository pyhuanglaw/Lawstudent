import json,subprocess,sys
BASE='http://127.0.0.1:8765/build/index.html'
def state(**kw):
    base={'day':8,'weekday':1,'hour':10.5,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':-1.5708},'flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'crimpro_attended':True},'visited':{'dorm':True,'campus':True,'library':True,'cafe':True,'gongguan':True,'wenzhou':True},
          'social':{'rel':{'heroine_03':{'fam':22,'trust':10,'aff':0,'resp':0,'comf':12,'rom':0,'npcRom':0,'seen':3,'talked':2},'heroine_01':{'fam':30,'trust':15,'aff':4,'resp':0,'comf':12,'rom':0,'npcRom':0,'seen':5,'talked':4}},'mem':{'heroine_03':[{'tag':'FIRST_MET','day':3,'note':'campus'},{'tag':'SHARED_UMBRELLA','day':3,'note':'雨天總圖門口'}],'heroine_01':[{'tag':'FIRST_MET','day':2,'note':'campus'},{'tag':'CLASS_ANSWER_GOOD','day':2,'note':'民總：要約之引誘'},{'tag':'CAFE_AFTERNOON','day':2,'note':'聊了報告和為什麼念法律'}]},'reveal':{'heroine_03':'ACQUAINTANCE','heroine_01':'ACQUAINTANCE','pool_3':'RECOGNIZABLE'},'prof':{},'grad':{'interest':'CURIOUS','field':'公法','prep':0}}}
    base.update(kw)
    js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(base,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
    return js
runs=[
 ('01_day_campus', state(hour=10.5,weekday=1), [["wait",3500],["shot","x"]], (844,390)),
 ('02_dusk_gate', state(hour=17.8,weekday=1,pos={'x':-70,'z':-4,'yaw':-1.5708}), [["wait",3500],["shot","x"]], (844,390)),
 ('03_night_campus', state(hour=19.8,weekday=1,pos={'x':-100,'z':-5,'yaw':1.5708}), [["wait",3500],["shot","x"]], (844,390)),
 ('04_library', state(hour=15.0,weekday=1,zone='library',pos={'x':0,'z':6.5,'yaw':3.1416}), [["wait",3500],["shot","x"]], (844,390)),
 ('05_cafe_an', state(hour=16.6,weekday=1,zone='cafe',pos={'x':-1,'z':5,'yaw':-2.27},social={'rel':{},'mem':{},'reveal':{'heroine_01':'ACQUAINTANCE'},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}), [["wait",4000],["shot","x"]], (844,390)),
 ('06_cafe_night', state(hour=20.6,weekday=2,zone='cafe',pos={'x':0,'z':4.6,'yaw':3.1416}), [["wait",3500],["shot","x"]], (844,390)),
 ('07_classroom_law', state(hour=10.0,weekday=2,pos={'x':34,'z':-101,'yaw':3.1416}), [["wait",1500],["click","#interact"],["wait",5000],["dlg"],["wait",600],["shot","x"]], (844,390)),
 ('08_npc_unknown', state(hour=15.0,weekday=1,zone='library',pos={'x':0,'z':6.5,'yaw':3.1416}), [["wait",2500],["eval","var ids=Object.keys(GAME.npc).filter(i=>i.startsWith('pool_')); var n=GAME.npc[ids[0]]; if(n){ GAME.E.player.obj.position.set(n.obj.position.x+0.9,0,n.obj.position.z+0.9); }"],["wait",800],["click","#interact"],["wait",2500],["shot","x"]], (844,390)),
 ('09_rain_event', state(hour=19.5,weekday=1,weather='rain',pos={'x':78,'z':-52,'yaw':1.5708},social={'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}), [["wait",5000],["dlg"],["wait",300],["shot","x"]], (844,390)),
 ('10_npc_pair_dusk', state(hour=19.0,weekday=3,pos={'x':-20,'z':3,'yaw':-1.5708}), [["wait",2500],["eval","var ks=Object.keys(GAME.npc).filter(k=>GAME.npc[k].beh==='chat'||GAME.npc[k].beh==='buddy'); var n=ks.length?GAME.npc[ks[0]]:null; if(n){ const P=GAME.E.player.obj; P.position.set(n.obj.position.x+2.6,0,n.obj.position.z+2.0); P.rotation.y=Math.atan2(n.obj.position.x-P.position.x,n.obj.position.z-P.position.z); GAME.E.cam.yaw=P.rotation.y+Math.PI; }"],["wait",3000],["shot","x"]], (844,390)),
 ('11_studygroup_law', state(hour=19.0,weekday=3,pos={'x':34,'z':-99,'yaw':3.1416}), [["wait",1500],["eval","GAME.enter('wancai',undefined,{noFade:true})"],["wait",5000],["dlg"],["wait",300],["shot","x"]], (844,390)),
 ('12_grad_debate', state(hour=15.0,weekday=1,zone='library',pos={'x':0,'z':6.5,'yaw':3.1416},flags={'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'grad_reading':True,'grad_read_done':True},social={'rel':{'heroine_05':{'fam':40,'trust':20,'aff':0,'resp':10,'comf':10,'rom':0,'npcRom':0,'seen':6,'talked':5}},'mem':{'heroine_05':[{'tag':'FIRST_MET','day':2,'note':'library'},{'tag':'GRAD_SCHOOL_DISCUSSION','day':6,'note':'給你一篇文章'}]},'reveal':{'heroine_05':'ACQUAINTANCE'},'prof':{},'grad':{'interest':'PREPARING','field':'公法','prep':3}}), [["wait",2500],["eval","EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_grad_debate'))"],["wait",4000],["dlg"],["wait",300],["shot","x"]], (844,390)),
 ('13_people_menu', state(hour=11.0,weekday=1), [["wait",2000],["eval","GAME.openMenu('people')"],["wait",500],["shot","x"]], (844,390)),
 ('14_legal_menu', state(hour=11.0,weekday=1,legal={'q':{'Q001':{'state':'learned','seen':2,'correct':1,'wrong':1,'last':5},'Q003':{'state':'confused','seen':1,'correct':0,'wrong':1,'last':6},'Q010':{'state':'understood','seen':3,'correct':3,'wrong':0,'last':7}},'misc':{'BASIC_PRINCIPLES':1},'log':[]}), [["wait",2000],["eval","GAME.openMenu('legal')"],["wait",500],["shot","x"]], (844,390)),
 ('15_save_menu', state(hour=11.0,weekday=1), [["wait",2000],["eval","GAME.openMenu('save')"],["wait",500],["shot","x"]], (844,390)),
 ('16_portrait_adv', state(hour=19.5,weekday=1,weather='rain',pos={'x':78,'z':-52,'yaw':1.5708},social={'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}), [["eval","document.getElementById('rotate').classList.remove('want')"],["wait",5000],["dlg"],["wait",300],["shot","x"]], (390,844)),
]
sel=sys.argv[1:]
for name,js,acts,(w,h) in runs:
    if sel and not any(name.startswith(s) for s in sel): continue
    acts=[["wait",9000],["eval",js]]+[a if a[0]!='shot' else ["shot",name] for a in acts]
    r=subprocess.run(['timeout','300','python3','play.py',BASE+'?turbo','fin',str(w),str(h),json.dumps(acts,ensure_ascii=False)],cwd=__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','..')),capture_output=True,text=True)
    errs=[l for l in r.stdout.splitlines() if ('error' in l.lower() or 'PAGEERROR' in l) and '404' not in l and 'ERR_TUNNEL' not in l]
    print('done',name, ('ERR '+errs[0][:200]) if errs else '')
