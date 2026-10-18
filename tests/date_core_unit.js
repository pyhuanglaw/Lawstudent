// 校外單獨約會的核心（src/date3d.js；DATE-S1／S2、SYS-02 的告白判斷）：AA_128（公館不計數；至少四次＋心願地點；出發由玩家選）、AA_126 4-1（第 6 階）、AA_215（取消故事閘門）。
// 不需要瀏覽器。用法：node tests/date_core_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (DATE_DATA|DATE|ROM)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
const REL={}; global.SOCIAL={rel:id=>REL[id]||(REL[id]={fam:0,trust:0,comf:0,rom:0,npcRom:0})};
global.CHARACTERS={heroine_03:{},heroine_01:{},heroine_05:{},kexin:{}};
for(const f of ['src/data/date_locations.js','src/romance3d.js','src/date3d.js']) load(f);
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const G={day:100,flags:{}};
check('0. 地點表 32 處、七位各有一個心願地點、互動點 128 個',Object.keys(DATE_DATA.locations).length===32&&DATE.HEROINES.every(id=>!!DATE.wishOf(id))&&Object.keys(DATE_DATA.points.points).length===128);
check('0. 舊存檔：補 dateLog／trips／groupTrips，不改已有的',(()=>{ const g={flags:{},trips:[{trip:'T0001'}]}; DATE.rec(g); return g.dateLog&&g.trips.length===1&&Array.isArray(g.groupTrips); })());
const trip=(o)=>Object.assign({trip:DATE.newTripId(G),who:'heroine_03',locs:['D13'],day:G.day,depart:'15:00',back:'19:30',transport:'mrt',fare:100,by:'player',status:'done',departed:true,spots:['D13.drink']},o||{});
// 五個條件（AA_128 1-2）
check('1. 公館（不在地點表）不計數',!DATE.counts(trip({locs:['gongguan']})).ok&&/學校周邊/.test(DATE.counts(trip({locs:['gongguan']})).why));
check('1. 一群人（who 是陣列）不計數',!DATE.counts(trip({who:['heroine_03','zhe']})).ok);
check('1. 沒有出發時間／交通 → 不計數',!DATE.counts(trip({depart:null})).ok&&!DATE.counts(trip({transport:''})).ok);
check('1. 到時間沒選出發（departed false）→ 不計數',!DATE.counts(trip({departed:false})).ok);
check('1. 沒做任何互動點、沒走完 → 不計數',!DATE.counts(trip({spots:[]})).ok&&!DATE.counts(trip({status:'cancelled'})).ok);
check('1. 五個條件都成立 → 算',DATE.counts(trip()).ok);
// complete：一趟一次、心願地點
let t1=trip({locs:['D13','D14']}); let r=DATE.complete(G,t1);
check('2. 語彤去淡水（她的心願 D13）＋漁人碼頭同一天：算一次、wish 成立',r.counted&&r.count===1&&r.wish&&DATE.log(G,'heroine_03').wish&&DATE.log(G,'heroine_03').byLoc.D13===1&&DATE.log(G,'heroine_03').byLoc.D14===1,JSON.stringify(r));
check('2. 同一趟再呼叫一次不重算',!DATE.complete(G,t1).counted&&DATE.log(G,'heroine_03').count===1);
DATE.group(G,'D13',G.day+7,['heroine_01','zhe','yu']);
check('2. 一群人去淡水：記在 groupTrips，以安的次數、心願都不變',G.groupTrips.length===1&&DATE.log(G,'heroine_01').count===0&&!DATE.log(G,'heroine_01').wish);
// 告白判斷（AA_215）
const setRel=(id,v)=>Object.assign(SOCIAL.rel(id),v);
setRel('heroine_03',{fam:60,trust:45,comf:40,npcRom:55,rom:30});
check('3. 第 6 階的數值（好朋友＋她的戀愛 55＋祐廷的戀愛 30）',DATE.stageNum('heroine_03')===6);
setRel('heroine_03',{rom:29}); check('3. 祐廷的戀愛 29 → 第 5 階',DATE.stageNum('heroine_03')===5); setRel('heroine_03',{rom:30});
check('3. 第 6 階、只有 1 次 → 不能告白（count）',DATE.canConfess(G,'heroine_03').why==='count');
check('3. 進度提示：「再多一些兩個人出去的時間」',DATE.hint(G,'heroine_03')==='再多一些兩個人出去的時間');
for(let i=0;i<3;i++){ G.day+=10; DATE.complete(G,trip({locs:['D01']})); }
check('3. 4 次（含心願）、第 6 階、她願意 → 可以告白；沒有故事閘門',DATE.canConfess(G,'heroine_03').ok,JSON.stringify(DATE.canConfess(G,'heroine_03')));
check('3. 遞減用：D01 去了 3 次',DATE.log(G,'heroine_03').byLoc.D01===3);
// 以安：4 次但沒去心願
setRel('heroine_01',{fam:60,trust:45,comf:40,npcRom:55,rom:30});
for(let i=0;i<4;i++){ G.day+=10; DATE.complete(G,trip({who:'heroine_01',locs:['D02']})); }
check('4. 以安 4 次但沒去她的心願（D07）→ 不能告白（wish）',DATE.canConfess(G,'heroine_01').why==='wish');
check('4. 進度提示：還不知道心願＝「她好像有一個很想去的地方」',DATE.hint(G,'heroine_01')==='她好像有一個很想去的地方');
DATE.knowWish(G,'heroine_01'); check('4. 知道了還沒去＝「她提過想去〔地點〕」',DATE.hint(G,'heroine_01')==='她提過想去'+DATE_DATA.locations.D07.name,DATE.hint(G,'heroine_01'));
// 她當時願意
G.flags.dating_kexin=true; ROM.learn(G,'heroine_03','kexin');
check('5. 她知道祐廷有伴侶 → 不能告白（knows）',DATE.canConfess(G,'heroine_03').why==='knows');
G.flags.dating_kexin=false; delete G.flags.knowsRel.heroine_03;
ROM.get(G,'heroine_03').status='paused'; check('5. 在等你說清楚（paused）→ 不能告白',DATE.canConfess(G,'heroine_03').why==='paused'); ROM.get(G,'heroine_03').status='none';
// 學姊暫停
setRel('heroine_05',{fam:60,trust:45,comf:40,npcRom:55,rom:30});
check('6. 學姊不再暫停（hold 拿掉）（使用者 2026-10-17 P0：學姊一開始就沒有男朋友，AA_218 第 16 節、BB_122 ★ 節）',DATE.canConfess(G,'heroine_05').why!=='hold'&&!DATE.HOLD.heroine_05,JSON.stringify(DATE.canConfess(G,'heroine_05')));
check('7. 一起去過的地方：語彤 4 次、第一次是淡水＋漁人碼頭',DATE.history(G,'heroine_03').length===4&&DATE.history(G,'heroine_03')[0].locs.join()===[DATE_DATA.locations.D13.name,DATE_DATA.locations.D14.name].join());
console.log(fails?`\nFAILED ${fails}`:'\nALL PASS'); process.exit(fails?1:0);
