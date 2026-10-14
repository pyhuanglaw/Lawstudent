// 手機「朋友」裡約不了的人寫原因（2026-10-14 使用者：「為什麼手機只能約阿哲小凱」——開局只有阿哲、阿凱有聯絡方式（data/invites.js contacts0），
// 其他人要等劇情交換聯絡方式，而且要「認識」（熟悉度 5）以上；原本約不了的人什麼都不寫）。不需要瀏覽器：
//   1. 有聯絡方式、認識以上 → 空字串（可以約）；2. 沒有聯絡方式 →「還沒有她／他的聯絡方式」；3. 有聯絡方式但還不熟 →「還不太熟，多聊幾次再約」；
//   4. 不在約的名單裡的人（教授等）→ 不寫原因；5. game3d.js 的手機朋友頁：約不了的人顯示原因。
// 用法：node tests/invite_whynot_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='),{filename:'characters.js'});
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'global.SOCIAL='),{filename:'social3d.js'});
for(const f of ['src/data/invites.js','src/invites3d.js']){ if(fs.existsSync(path.join(ROOT,f))) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const G={rel:{},flags:{},social:null,day:20,contacts:{}}; SOCIAL.bind(G);
const I=globalThis.INV;
check('INV.whyNot 存在',!!(I&&I.whyNot));
SOCIAL.rel('zhe').fam=30; SOCIAL.remember('zhe','FIRST_MET','x');
check('1. 阿哲（開局就有聯絡方式、熟）：可以約',I.whyNot(G,'zhe')==='',JSON.stringify(I.whyNot(G,'zhe')));
SOCIAL.rel('heroine_01').fam=12; SOCIAL.remember('heroine_01','FIRST_MET','x');
check('2. 以安：熟了但還沒有聯絡方式 →「還沒有她的聯絡方式」',I.whyNot(G,'heroine_01')==='還沒有她的聯絡方式',I.whyNot(G,'heroine_01'));
G.contacts.heroine_01=1; check('1. 交換了聯絡方式：可以約',I.whyNot(G,'heroine_01')==='',I.whyNot(G,'heroine_01'));
SOCIAL.rel('heroine_03').fam=2; SOCIAL.remember('heroine_03','FIRST_MET','x'); G.contacts.heroine_03=1;
check('3. 語彤：有聯絡方式但熟悉度 2 →「還不太熟，多聊幾次再約」',I.whyNot(G,'heroine_03')==='還不太熟，多聊幾次再約',I.whyNot(G,'heroine_03'));
const prof=Object.keys(CHARACTERS).find(id=>CHARACTERS[id].social_layer&&!['A','C','D','F'].includes(CHARACTERS[id].social_layer));
if(prof) check('4. 不在約的名單裡的人（'+prof+'）：不寫原因',I.whyNot(G,prof)==='',I.whyNot(G,prof));
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('5. 手機朋友頁：約不了的人顯示原因（INV.whyNot）',/canInv\?'<button class="btn pri" data-inv="'\+esc\(id\)\+'">約<\/button>':\(\(typeof INV!=='undefined'&&INV\.whyNot&&INV\.whyNot\(G,id\)\)/.test(g3));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
