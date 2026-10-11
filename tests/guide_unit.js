// 目標導航的目的地推算（src/guide3d.js 的 GUIDE.infer）：把程式裡每一句 setGoal('...') 的目標文字拿出來，印出推算的目的地，
// 並檢查使用者回報過、或主線一定要指路的幾句（2026-10-11 使用者：「第二天要跟小安去溫州街 但不知道到底在哪」）。
// 新增目標文字時，這個測試會把它列出來：沒有目的地（null＝自由行動、不指路）的要確定是故意的。
// 用法：node tests/guide_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null}; global.THREE={};
for(const f of ['src/data/places.js','src/guide3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (PLACES|GUIDE)\s*=/m,'global.$1='),{filename:f});
const goals=new Set();
for(const f of fs.readdirSync(path.join(ROOT,'src')).filter(f=>f.endsWith('.js')).map(f=>'src/'+f).concat(['src/data/events.js'])){
  const t=fs.readFileSync(path.join(ROOT,f),'utf8'); const re=/setGoal\(([^;]*?)\)\s*[;}]/g; let m; while((m=re.exec(t))){ const arg=m[1]; const sre=/'([^']*)'|"([^"]*)"/g; let q; while((q=sre.exec(arg))){ const v=q[1]!=null?q[1]:q[2]; if(v&&/[\u4e00-\u9fff]/.test(v)) goals.add(v); } } const re2=/\bgoal:\s*'([^']*)'/g; while((m=re2.exec(t))){ if(/[\u4e00-\u9fff]/.test(m[1])) goals.add(m[1]); } }   // 事件的結果（src/data/events.js 的 consequences:{goal:'…'}）也會設目標（v9.5 審查：「總圖要閉館了」「週一或週三 19:00 萬才館：吉他社」原本沒掃到）
let fails=0; const out=[];
for(const g of [...goals].sort()){ const d=GUIDE.infer(g); out.push((d?('→ '+d.zone+(d.lv?'（'+(d.lv+1)+'F）':'')+(d.label?'「'+d.label+'」':'')):'（自由行動，不指路）')+'　'+g); }
console.log(out.join('\n'));
// 一定要指路的目標（主線）
const MUST={'和小安一起走到校門，往公館・溫州街':'cafe','往溫州街（跟小安一起）':'cafe','進入 兩點半 Café':'cafe','和小安一起走到總圖書館':'library_hall','上二樓的自習區（跟小安一起）':'library_hall',
  '13:20 民法總則（霖澤館）':'classroom','進入霖澤館上課（13:20）':'classroom','上二樓，到 201 教室上課':'classroom','走出霖澤館':'campus','18:30 公館 阿鳳麵店（阿哲）':'noodle',
  '睡覺（明天 13:20 民法總則）':'dorm','吃飽了。晚上自由活動，回宿舍睡覺就到明天':'dorm',
  '總圖要閉館了':'campus','週一或週三 19:00 萬才館：吉他社':'wancai'};   // 閉館＝離開總圖（不是指進去）；「週一或週三」是時間的或，不是自由選擇（v9.5 審查）
for(const [g,z] of Object.entries(MUST)){ const d=GUIDE.infer(g); const ok=!!d&&d.zone===z; if(!ok) fails++; console.log((ok?'PASS ':'FAIL ')+g+' → '+(d?d.zone:'null')+'（應該是 '+z+'）'); if(!goals.has(g)) console.log('  注意：程式裡已經沒有這句目標（文字改過？要更新這個測試）'); }
// 自由選擇（有「或」）不指路
for(const g of ['自由的一天。去圖書館、公館，或找人聊天','今晚去公館吃點東西，或回宿舍','讀（或不讀）明天的案例，然後睡覺','下課後自由活動。去圖書館、公館，或找人聊天']){ const d=GUIDE.infer(g); const ok=d===null; if(!ok) fails++; console.log((ok?'PASS ':'FAIL ')+g+' → '+(d?d.zone:'null')+'（應該不指路）'); }
// 開放時間
const oc=[['library_hall',7.2,false],['library_hall',8,true],['library_hall',21.9,true],['library_hall',22,false],['cafe',1,true],['cafe',2.5,false],['cafe',10.9,false],['cafe',11,true],['cvs',4,true]];
for(const [z,h,want] of oc){ const ok=PLACES.isOpen(z,h)===want; if(!ok) fails++; console.log((ok?'PASS ':'FAIL ')+'開放時間 '+z+' '+h+' 點 → '+(PLACES.isOpen(z,h)?'開':'關')); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
