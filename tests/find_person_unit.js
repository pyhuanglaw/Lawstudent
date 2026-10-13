// 「帶我去」找朋友（src/game3d.js 的 GM.findPerson → src/guide3d.js 的 target 支援 d.npc）——不需要瀏覽器。
// 2026-10-13 使用者試玩：「說可以找朋友，但朋友在哪啊」「其他角色他們在哪裡？在地圖上的哪裡？我也要知道啊」。
// 檢查（guide3d 真正的 target）：朋友在別的區域 → 指向往那一區的出口；在同一區、人在場 → 指到他身上（他走動，指引跟著動）；
//       他的作息換到別區 → 改指往新的那一區。修改前：target 不認得 d.npc（第 2 項失敗）。用法：node tests/find_person_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const el=()=>new Proxy({style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},getContext:()=>null,querySelectorAll:()=>[]},{get:(o,k)=>k in o?o[k]:(()=>{})});
global.window=global; global.document={getElementById:()=>el(),createElement:()=>el(),addEventListener(){}}; global.addEventListener=()=>{};
for(const f of ['src/data/places.js','src/guide3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (PLACES|GUIDE)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const pos=(x,z)=>({x,z,y:0});
const zhe={id:'zhe',charId:'zhe',obj:{position:pos(10,5)},lv:0};
let where={zone:'gongguan'};
global.STORY={whereIs:()=>where}; global.EVENTS={npcOf:id=>id==='zhe'?zhe:null};
const E={npcs:[],interactables:[{x:-126,z:0,radius:3,label:'走出校門',exit:{to:'gongguan'}},{x:86,z:0,radius:3.8,label:'進入總圖書館',exit:{to:'library_hall'}}],player:{obj:{position:pos(0,0),rotation:{y:0}},lv:0},indoor:false,pathTo:()=>null};
const GM={G:{zone:'campus',day:5,hour:15,flags:{}},E}; GUIDE.init(GM);
const d={zone:'gongguan',npc:'zhe',name:'去找阿哲'};
let t=GUIDE.target(d); check('阿哲在公館：指向校門（往公館的出口）',!!t&&t.x===-126&&t.via==='gongguan',JSON.stringify(t&&{x:t.x,z:t.z,via:t.via}));
where={zone:'campus'}; E.npcs=[zhe]; t=GUIDE.target(d); check('阿哲改在校園、人在場：指到他身上',!!t&&t.x===10&&t.z===5,JSON.stringify(t&&{x:t.x,z:t.z}));
zhe.obj.position.x=20; t=GUIDE.target(d); check('他走動了：指引跟著動',!!t&&t.x===20,JSON.stringify(t&&{x:t.x}));
where={zone:'library_hall'}; E.npcs=[]; t=GUIDE.target(d); check('他的作息換到總圖：改指向總圖門口',!!t&&t.x===86&&t.via==='library_hall',JSON.stringify(t&&{x:t.x,via:t.via}));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
