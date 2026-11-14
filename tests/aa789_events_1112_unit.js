// AA_789 事件台詞覆蓋列（X324 E 區，AA 11-11；AA-C 11-12 20:10 指出開發分支還有舊字）：src/data/events.js 補匯的回歸檢查。
// 每一列：舊字（整個字串）不能還在；新字在＝已換，新舊都不在＝那一場已經拿掉或稿上用代號（AA 說舊序章人物那幾列跳過）。
const cp=require('child_process'), fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..'), SHA='21f4cd7636';
let fails=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(x||''))); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
const q=s=>["'"+JSON.stringify(s).slice(1,-1).replace(/'/g,"\\'")+"'",'"'+JSON.stringify(s).slice(1,-1)+'"',"'"+s+"'"];
const has=s=>q(s).some(x=>src.includes(x));
let docs=0, rows=0, applied=0, gone=0; const stale=[];
for(const who of ['an','cast','minor','ps','sis','yt','zq','zr']){
  let d; try{ d=JSON.parse(cp.execSync(`git show ${SHA}:docs/story_planning/AA_789_events_${who}.json`,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(e){ continue; }
  docs++;
  for(const f of d.files||[]) for(const r of f.rows||[]){ if(f.file!=='events') continue; rows++;
    if(has(r.old)&&r.old!==r.new) stale.push(who+' '+(r.event||'')+' '+r.old.slice(0,24)); else if(has(r.new)) applied++; else gone++; } }
if(!docs){ console.log('SKIP 讀不到企劃線 '+SHA+'（淺層複本）'); process.exit(0); }
check('AA_789 八份都讀得到（'+docs+' 份、'+rows+' 列）',docs===8&&rows>0);
check('沒有一列的舊字還整句留在 events.js（已換 '+applied+'、那一場已拿掉／代號 '+gone+'）',!stale.length,JSON.stringify(stale));
check('至少 50 列已換成新字',applied>=50,String(applied));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
