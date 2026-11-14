// AA_814 三個優先項目劇情斷點對帳（AA-PRIO-GAP-1111；企劃線 91c6aaf9f，AA 11-11 16:14 交）——不需要瀏覽器（D131）。
// 檢查：
//   0. 稿從白名單上的那一版讀（docs/handoff/story_import_allow.json，AA_814@91c6aaf9f）；讀不到（企劃線沒 fetch）＝只跳過逐句對稿那一項
//   1. 每一句新台詞都在稿裡（一字不改）、也在該放的遊戲檔裡
//   2. 1-3：econff3d.js 的 S.KEEP 有 ev_y0_exam2；3-1：us2RepairDue 看 inUS（任何美國區域）
//   3. 2-1：vac_activities.js 沛珊 reunionHomeAfter 兩段（2026-12-17、2027-08-06）；vac3d.js 取最後一段已經到的
//   4. 2-2：gfCan 在她不能出去的那段回 'off'、說 noOff；沒有 noOff 的照 P.no
//   5. 2-3：S.rangeClash／S.clashLine：同一段時間已經答應的寫成「會撞到：…」，不重複、最多三個
//   6. 3-4、3-6：兩則私訊改成要回的（ask 有兩個選項、until）
// 用法：node tests/aa814_prio_gap_1111_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.join(__dirname,'..'); let fail=0; const J=JSON.stringify;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(info||''))); if(!ok) fail++; };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const DOC='docs/story_planning/AA_814_三個優先項目劇情斷點對帳.md', SHA='91c6aaf9f';
// 0. 白名單
const A=JSON.parse(read('docs/handoff/story_import_allow.json')); const e=A.files.find(x=>x.path===DOC);
check('0. 白名單有 AA_814@91c6aaf9f（approved）',!!e&&e.sha===SHA&&e.status==='approved',J(e));
let doc=null; try{ doc=cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+DOC],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ doc=null; }
// 1. 新台詞：稿裡有、遊戲檔裡有
const LINES=[
  // CANON-NO-ECON-1112：經濟系那一年拿掉（1-1、1-2 的六句在 events.js 的經濟系那一年（j8a、E27b））
  ['src/data/vac_activities.js','歡迎回來！我在台中，桌上的考古題疊得比你的行李還高。'],['src/data/vac_activities.js','下次放風的那個下午，你要從第一天開始講。'],
  ['src/data/vac_activities.js','我現在連台中市區都很少去耶。……等我考完，第一個要去的地方給你選。'],
  ['src/data/r2y4a_events.js','（交換生一個一個把行李推上車。你的機票是二十一號。）'],['src/data/r2y4a_events.js','（巴士開走了。你還要再待五天。）'],
  ['src/data/r2y4a_events.js','（她走遠了。你拖著行李，照手機上的地圖，走到 Linden Grove。）'],
  ['src/data/r2y4a_events.js','（巴士上，坐在前面的是一個戴圓框眼鏡的男生。車子一開，他就回頭。）'],['src/data/r2y4a_events.js','臺灣來的？你手機上的字是繁體。'],
  ['src/r2y4a3d.js','07:00 社區門口（送大家上機場巴士）'],
  ['src/r2y4a3d.js','……嗯。那天的麵，謝謝。'],['src/r2y4a3d.js','你哪有說。你只是一直在煮麵。'],['src/r2y4a3d.js','……嗯。我自己改了三次。'],
  ['src/us_life3d.js','……好。我也想那裡。'],['src/us_life3d.js','那就舊金山。……剩下的，你排。']];
const miss=LINES.filter(([f,t])=>!read(f).includes(t)).map(x=>x.join('：'));
check('1. 新台詞都在遊戲檔裡（'+LINES.length+' 句）',!miss.length,J(miss));
if(doc){ const nd=LINES.filter(([,t])=>!doc.includes(t)).map(x=>x[1]); check('1. 每一句都在稿裡、一字不改',!nd.length,J(nd)); }
else console.log('（跳過：讀不到 '+SHA+':'+DOC+'，企劃線沒 fetch）');
const old=[['src/data/r2y4a_events.js','坐在你們前面的'],['src/data/r2y4a_events.js','我聽你們講話聽出來的']].filter(([f,t])=>read(f).includes(t));
check('1. 3-5 舊句（「你們」）拿掉了',!old.length,J(old));
// 2
// CANON-NO-ECON-1112：經濟系那一年拿掉（第 2 項 1-3 econff3d.js 的 S.KEEP）
const r2=read('src/r2y4a3d.js'), m=r2.match(/S\.us2RepairDue=G=>\{[^\n]*/); check('2. 3-1：us2RepairDue 看 inUS(G)、不再只限社區三區',!!m&&/inUS\(G\)/.test(m[0])&&!/'us_outside','us_apartment','us_shared'/.test(m[0]),m&&m[0].slice(0,200));
// 3、4、5：載 vac_activities.js 和 vac3d.js 的函式（假的 STORY／CALENDAR）
const sb={console,Math,JSON,Object,Array,Set,Map,String,Number,Date,Promise};
sb.globalThis=sb; vm.createContext(sb);
const run=f=>vm.runInContext(read(f).replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),sb,{filename:f});
const KEYD={'2026-12-17':1000,'2027-08-06':1232,'2026-07-01':830,'2026-07-20':849};
sb.STORY={dayOfKey:k=>KEYD[k]!=null?KEYD[k]:null,presence:()=>({here:true})};
sb.CALENDAR={dateOf:d=>({m:Math.floor(d/31)%12+1,d:d%31+1,wd:d%7})};
let ok3=true; try{ run('src/data/vac_activities.js'); }catch(err){ ok3=false; console.log('載入 vac_activities.js 失敗：'+err.message); }
const VD=Object.values(sb).find(v=>v&&typeof v==='object'&&v.TRIP_MSG&&v.TRAVEL);
const TM=VD&&VD.TRIP_MSG, RA=TM&&TM.reunionHomeAfter&&TM.reunionHomeAfter.classmate_peishan;   /* vac3d.js：M2＝Dt().TRIP_MSG */
check('3. 2-1：沛珊 reunionHomeAfter 兩段（2026-12-17 重考期、2027-08-06 放榜後）',ok3&&Array.isArray(RA)&&RA.length===2&&RA[0].from==='2026-12-17'&&RA[1].from==='2027-08-06'&&RA[0].lines.length===2,J(RA));
const v3=read('src/vac3d.js');
check('3. 2-1：vac3d.js 取最後一段已經到的（[].concat、照 from 排序、pop）',/RA=RA0&&\[\]\.concat\(RA0\)\.filter\(e=>e&&DK\(e\.from\)!=null&&rd>=DK\(e\.from\)\)\.sort\(\(a,b\)=>DK\(a\.from\)-DK\(b\.from\)\)\.pop\(\)/.test(v3));
// 挑段的邏輯照 vac3d.js 那一行重做一次（rd＝回國那天）
const pick=rd=>[].concat(RA||[]).filter(e=>e&&KEYD[e.from]!=null&&rd>=KEYD[e.from]).sort((a,b)=>KEYD[a.from]-KEYD[b.from]).pop();
check('3. 2-1：重考期（2027-01-10 左右）回國＝考古題那段；2027-08-06 以後＝開學前才回台南；之前＝沒有（照 reunionHome）',(pick(1024)||{}).from==='2026-12-17'&&(pick(1240)||{}).from==='2027-08-06'&&pick(900)===undefined);
check('4. 2-2：gfCan 那段時間回 off；說 noOff（沒有就 P.no）',/return 'off'; \}/.test(v3)&&/r==='off'&&P\.noOff\?P\.noOff:P\.no/.test(v3));
const pe=VD&&VD.TRAVEL&&VD.TRAVEL.gf&&VD.TRAVEL.gf.classmate_peishan;
check('4. 2-2：沛珊 TRAVEL.gf 有 noOff（一句）、no 照舊',!!pe&&Array.isArray(pe.noOff)&&pe.noOff.length===1&&pe.no==='先在國內走走吧，我們還沒一起去過很多地方。',J(pe&&{no:pe.no,noOff:pe.noOff}));
// 5. clashLine：只測格式（函式本身靠 S.all／S.state，瀏覽器流程 BB 測）
const cl=v3.match(/S\.clashLine=function\(L\)\{[^\n]*\};/);
let line=null; if(cl){ const S={}; const dl=d=>'D'+d; try{ eval(cl[0]); line=S.clashLine([{title:'C12 京都',day:5},{title:'C12 京都',day:6},{title:'香港',day:7},{title:'A',day:1},{title:'B',day:2}]); }catch(err){ line='例外：'+err.message; } }
check('5. 2-3：clashLine 寫「會撞到：」、同一趟不重複、最多三個；空的＝null',line==='會撞到：C12 京都 D5、香港 D7、A D1',J(line));
check('5. 2-3：私訊、群組（兩種）、VA10（兩則）、答應的當下、T13 選日子都接了撞期提示',(v3.match(/S\.clashLine\(/g)||[]).length>=7&&/vac_clash_/.test(v3)&&/hint:cl/.test(v3),(v3.match(/S\.clashLine\(/g)||[]).length);
// 6
check('6. 3-4：10/16 報告 A 改成要回的（until 隔天 18:00、兩個選項、US2 missed 換第一句）',/ask:\{id:'us2_grade',until:T\(dA\+1,18\),opts:\[/.test(r2)&&/G\.flags\.US2==='missed'\?'……嗯。我自己改了三次。'/.test(r2));
const ul=read('src/us_life3d.js'); check('6. 3-6：12/6「你先想」改成要回的（until 12/7 21:00、兩個選項）',/ask:\{id:'usl_sis_1206',until:T\(d\+1,21\),opts:\[\{t:'舊金山？'/.test(ul));
console.log(fail?('有 '+fail+' 項失敗'):'ALL PASS'); process.exit(fail?1:0);
