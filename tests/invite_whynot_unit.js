// 手機「朋友」裡約不了的人寫原因＋聯絡方式（2026-10-14 使用者：「為什麼手機只能約阿哲小凱」——開局只有阿哲、阿凱有聯絡方式，
// 其他人要等劇情交換聯絡方式，而且要「認識」以上；原本約不了的人什麼都不寫）。文字照 AA_125 第 1 節的表、AA_124 1-7（企劃分支 196816e、886ff09）。
// 不需要瀏覽器：
//   1. 有聯絡方式、認識以上 → 空字串（可以約）；2. 沒有聯絡方式：認識 →「再熟一點，可以當面問她」、有點熟以後 →「可以當面問她」；
//   3. 只打過招呼（STRANGER）→「你們只打過招呼。先在學校多聊幾次。」；4. 不在約的名單裡的人（教授等）→ 不寫原因；
//   5. 開場就有聯絡方式：阿哲、阿凱、可昕、學姊（AA_124 1-7 第 3 點）；6. 已經約好了 →「你們已經約好了：週X HH:MM，地點。」（過去的不算）；
//   7. 不在學校：交換＝「她這學期在國外。」、畢業＝「他已經畢業了。」；
//   8. 地點的門檻（placeWhy）：吃飯「再熟一點」、散步「要等你們變成朋友」；兩個人單獨（吃飯、散步）任一方有伴侶 →「兩個人單獨出去不太好」——
//      只看女生、約交往的對象本人照常、Café 和總圖照常；decide 回 partner、旁白是同一句；
//   9. game3d.js 的手機朋友頁：有原因就寫原因、不出「約」按鈕；story3d.js 的聊天：有點熟以後、沒有聯絡方式才有「交換聯絡方式」，對方的一句照 INVITE_DATA.exchange。
// 用法：node tests/invite_whynot_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='),{filename:'characters.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'global.SOCIAL='),{filename:'social3d.js'});
for(const f of ['src/romance3d.js','src/data/invites.js','src/invites3d.js']){ if(fs.existsSync(path.join(ROOT,f))) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const G={rel:{},flags:{},social:null,day:20,weekday:1,hour:10,contacts:{},invites:[]}; SOCIAL.bind(G);
const I=globalThis.INV, W=(INVITE_DATA.why||{});
check('INV.whyNot 存在',!!(I&&I.whyNot));
SOCIAL.rel('zhe').fam=30; SOCIAL.remember('zhe','FIRST_MET','x');
check('1. 阿哲（開局就有聯絡方式、熟）：可以約',I.whyNot(G,'zhe')==='',JSON.stringify(I.whyNot(G,'zhe')));
SOCIAL.rel('heroine_01').fam=12; SOCIAL.remember('heroine_01','FIRST_MET','x');
check('2. 以安「認識」、還沒有聯絡方式 →「還沒有她的聯絡方式。再熟一點，可以當面問她。」',I.whyNot(G,'heroine_01')==='還沒有她的聯絡方式。再熟一點，可以當面問她。',I.whyNot(G,'heroine_01'));
SOCIAL.rel('heroine_01').fam=25;
check('2. 以安「有點熟」、還沒有聯絡方式 →「還沒有她的聯絡方式。可以當面問她。」',I.whyNot(G,'heroine_01')==='還沒有她的聯絡方式。可以當面問她。',I.whyNot(G,'heroine_01'));
G.contacts.heroine_01=1; check('1. 交換了聯絡方式：可以約',I.whyNot(G,'heroine_01')==='',I.whyNot(G,'heroine_01'));
SOCIAL.rel('heroine_03').fam=2; SOCIAL.remember('heroine_03','FIRST_MET','x'); G.contacts.heroine_03=1;
check('3. 語彤：有聯絡方式但只打過招呼（熟悉度 2）→「你們只打過招呼。先在學校多聊幾次。」',I.whyNot(G,'heroine_03')==='你們只打過招呼。先在學校多聊幾次。',I.whyNot(G,'heroine_03'));
const prof=Object.keys(CHARACTERS).find(id=>CHARACTERS[id].social_layer&&!['A','C','D','F'].includes(CHARACTERS[id].social_layer));
if(prof) check('4. 不在約的名單裡的人（'+prof+'）：不寫原因',I.whyNot(G,prof)==='',I.whyNot(G,prof));
check('5. 開場就有聯絡方式：阿哲、阿凱、可昕、學姊（AA_124 1-7 第 3 點）',['zhe','kai','kexin','heroine_05'].every(id=>I.hasContact({contacts:{}},id)),INVITE_DATA.contacts0.join(','));
SOCIAL.rel('heroine_05').fam=8; SOCIAL.remember('heroine_05','FIRST_MET','x');
check('5. 學姊「認識」：開場就有聯絡方式，手機上可以約',I.whyNot(G,'heroine_05')==='',I.whyNot(G,'heroine_05'));
// 6. 已經約好了
G.invites.push({id:'t1',who:'heroine_01',place:'cafe',zone:'cafe',day:21,h:15.5,state:'accepted',by:'player'});
const wd21=['日','一','二','三','四','五','六'][((G.weekday+1)%7)];
check('6. 已經約好了 →「你們已經約好了：週'+wd21+' 15:30，兩點半 Café。」',I.whyNot(G,'heroine_01')==='你們已經約好了：週'+wd21+' 15:30，兩點半 Café。',I.whyNot(G,'heroine_01'));
G.invites[0].day=19; check('6. 過去的約不算',I.whyNot(G,'heroine_01')==='',I.whyNot(G,'heroine_01'));
G.invites[0].state='declined'; G.invites[0].day=22; check('6. 拒絕了的不算',I.whyNot(G,'heroine_01')==='',I.whyNot(G,'heroine_01'));
// 7. 不在學校（presence 的 kind）
global.STORY={presence:(id)=>id==='heroine_01'?{here:false,kind:'absent',away:'在日本交換'}:(id==='zhe'?{here:false,kind:'after'}:{here:true}),present:(id)=>!['heroine_01','zhe'].includes(id)};
check('7. 交換 →「她這學期在國外。」',I.whyNot(G,'heroine_01')==='她這學期在國外。',I.whyNot(G,'heroine_01'));
check('7. 畢業 →「他已經畢業了。」',I.whyNot(G,'zhe')==='他已經畢業了。',I.whyNot(G,'zhe'));
delete global.STORY;
// 8. 地點的門檻
const P=id=>INVITE_DATA.places.find(p=>p.id===id);
SOCIAL.rel('heroine_02').fam=25; SOCIAL.remember('heroine_02','FIRST_MET','x'); G.contacts.heroine_02=1;
check('8. 芷若「有點熟」、單身：吃飯可以、散步「散步要等你們變成朋友。」、Café 可以',I.placeWhy(G,'heroine_02',P('noodle'))===''&&I.placeWhy(G,'heroine_02',P('wenzhou'))==='散步要等你們變成朋友。'&&I.placeWhy(G,'heroine_02',P('cafe'))==='',
  [I.placeWhy(G,'heroine_02',P('noodle')),I.placeWhy(G,'heroine_02',P('wenzhou')),I.placeWhy(G,'heroine_02',P('cafe'))].join('｜'));
SOCIAL.rel('heroine_03').fam=8;
check('8. 語彤「認識」：吃飯「再熟一點，才約得出去吃飯。」',I.placeWhy(G,'heroine_03',P('noodle'))==='再熟一點，才約得出去吃飯。',I.placeWhy(G,'heroine_03',P('noodle')));
G.flags.dating_kexin=true;
/* 2026-10-16 改（AA_128 4-5、AA_140 0-2 X2）：祐廷有伴侶，只有「她知道」才擋；2026-10-17（BB_191 第 9 節）：誰知道照各人的 knowsRel（K3 選①在場、聽朋友說、祐廷自己說），沒有固定名單 */
check('8. 祐廷和可昕交往中、芷若不知道：吃飯照常（X2：她不知道就照常約）',I.placeWhy(G,'heroine_02',P('noodle'))==='',I.placeWhy(G,'heroine_02',P('noodle')));
ROM.learn(G,'heroine_02','kexin');
check('8. 芷若知道以後：吃飯「兩個人單獨去吃飯不太好。約在 Café 或總圖吧。」、散步「……散步不太好……」（AA 2026-10-14 換句話）；Café、總圖照常',W.partnerMeal==='兩個人單獨去吃飯不太好。約在 Café 或總圖吧。'&&W.partnerWalk==='兩個人單獨去散步不太好。約在 Café 或總圖吧。'&&I.placeWhy(G,'heroine_02',P('noodle'))===W.partnerMeal&&I.placeWhy(G,'heroine_02',P('cafe'))===''&&I.placeWhy(G,'heroine_02',P('library'))==='',
  [I.placeWhy(G,'heroine_02',P('noodle')),I.placeWhy(G,'heroine_02',P('library'))].join('｜'));
const r=I.decide(G,'heroine_02','noodle',21,12+10/60);
check('8. decide 回 partner、旁白是同一句',r.res==='decline'&&r.why==='partner'&&I.reply(G,'heroine_02','noodle',r)===W.partnerMeal,JSON.stringify(r)+' '+I.reply(G,'heroine_02','noodle',r));
check('8. 語彤：可昕來過烤肉（KX_MET_NOODLE_TEAM）但她沒有知道的管道＝不擋（BB_191 9-4 #1：拿掉固定名單）；K3 選①時她在場（ROM.learn）＝擋',I.placeWhy(G,'heroine_03',P('noodle'))!==W.partnerMeal&&(G.flags.KX_MET_NOODLE_TEAM=true,I.placeWhy(G,'heroine_03',P('noodle'))!==W.partnerMeal)&&(ROM.learn(G,'heroine_03','kexin','ev_mid_autumn_bbq'),I.placeWhy(G,'heroine_03',P('noodle'))===W.partnerMeal),I.placeWhy(G,'heroine_03',P('noodle')));
check('8. 阿哲（男生）照常吃飯',I.placeWhy(G,'zhe',P('noodle'))==='',I.placeWhy(G,'zhe',P('noodle')));
G.flags.dating_kexin=false; delete G.flags.KX_MET_NOODLE_TEAM; G.flags.dating_heroine_02=true;
check('8. 約交往的對象本人照常（和芷若交往中：約芷若吃飯可以）',I.placeWhy(G,'heroine_02',P('noodle'))==='',I.placeWhy(G,'heroine_02',P('noodle')));
check('8. 和芷若交往中、語彤不知道：約語彤吃飯不會被「兩個人單獨」擋（只看熟不熟）',I.placeWhy(G,'heroine_03',P('noodle'))!==W.partnerMeal,I.placeWhy(G,'heroine_03',P('noodle')));
ROM.learn(G,'heroine_03','heroine_02');
check('8. 語彤知道以後：「兩個人單獨去吃飯不太好」',I.placeWhy(G,'heroine_03',P('noodle'))===W.partnerMeal,I.placeWhy(G,'heroine_03',P('noodle')));
G.flags.dating_heroine_02=false; SOCIAL.rel('heroine_05').fam=25;
global.STORY={inTerms:(GG,rr)=>rr.from==='Y1S1',presence:()=>({here:true}),present:()=>true};
check('8. 祐廷單身、學姊沒有伴侶（使用者 2026-10-17 P0：學姊一開始就沒有男朋友，AA_218 第 16 節、BB_122 ★ 節）：學姊吃飯不會出現「兩個人單獨去吃飯不太好」',I.placeWhy(G,'heroine_05',P('noodle'))!==W.partnerMeal,I.placeWhy(G,'heroine_05',P('noodle')));
check('8. 沛珊（大一下才有伴侶）：大一上照常（吃飯只看熟不熟）',I.partnerBlock(G,'classmate_peishan',P('noodle'))===false);
delete global.STORY;
check('8. 選地點時寫原因、選了約不到的地方先說原因再選一次（invites3d.js flow；INVITE-MENU-1030 分層以後寫在每一項的 hint、灰掉）',/const w=S\.placeWhy\(G,id,Q\); return \{t:Q\.verb,short:Q\.name,hint:w,dim:!!w,P:Q\}/.test(fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8')));
// 9. 畫面
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('9. 手機朋友頁：有原因就寫原因、不出「約」按鈕',/const why=typeof INV!=='undefined'&&INV\.whyNot\?INV\.whyNot\(G,id\):''/.test(g3)&&/const canInv=typeof INV!=='undefined'&&!why&&/.test(g3)&&/canInv\?'<button class="btn pri" data-inv="'\+esc\(id\)\+'">約<\/button>':\(why\?/.test(g3));
const s3=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), tc=s3.slice(s3.indexOf('S.offerInvite=async function'),s3.indexOf('let GM_ref=null'));   /* 2026-10-15：當面約的選單搬到 S.offerInvite（舊的 talkAn 等也用），talkCharacter 呼叫它 */
check('9. 聊天：有點熟以後、沒有聯絡方式才有「交換聯絡方式」，對方的一句照 INVITE_DATA.exchange，然後加聯絡方式',/!INV\.hasContact\(G,id\)&&SOCIAL\.STAGES\.indexOf\(SOCIAL\.stage\(id\)\)>=SOCIAL\.STAGES\.indexOf\('FAMILIAR'\)\) O\.push\(\{t:'交換聯絡方式'/.test(tc)&&/INVITE_DATA\.exchange/.test(tc)&&/INV\.addContact\(G,id\)/.test(tc));
const EX=INVITE_DATA.exchange||{};
check('9. AA 的五位都有保底的一句（AA_124 1-7 的表）：以安、語彤、Alison、柏翰、芯慈',['heroine_01','heroine_03','yu','classmate_bohan','classmate_xinci'].every(id=>Array.isArray(EX[id])&&EX[id].length&&EX[id].every(l=>l.say||l.narr)),Object.keys(EX).join(','));
check('9. 交換以後就有聯絡方式、手機上可以約',(()=>{ const g={contacts:{},msgs:[],invites:[],day:20,hour:10}; const ok=I.addContact(g,'yu'); return ok&&I.hasContact(g,'yu'); })());
{ const D0=globalThis.DATE; globalThis.DATE={canAsk:()=>({ok:true}),HEROINES:['kexin']}; const gk={stage:'law',flags:{dating_kexin:true},contacts:{},day:20,hour:10}, ge={stage:'econ',flags:{dating_kexin:true},contacts:{},day:20,hour:10}, gn={stage:'law',flags:{},contacts:{},day:20,hour:10};
  const src=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8');
  check('10. 女朋友可昕（法律系、交往中）手機可以約；校內地點照現有台詞接得上的開（INVITE-MENU-1030 D：原本只有羽球、晨跑＋「去校外…」）；經濟系那一年、沒交往不開（使用者 10-18「我還是不能聯絡女朋友啊，可昕？」）',I.canInvite(gk,'kexin')===true&&I.canInvite(ge,'kexin')===false&&I.canInvite(gn,'kexin')===false&&I.whyNot(gk,'kexin')===''&&/D\(\)\.places\.filter\(Q=>!kxGF\(G,id\)\|\|S\.kxPlaceOk\(G,Q\)\)/.test(src)); globalThis.DATE=D0; }   /* AA_417 3-2：羽球、晨跑她下山來；INVITE-MENU-1030：其他台大的地點照 AA_415 的答應句也開（tests/invite_menu_unit.js D）*/
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
