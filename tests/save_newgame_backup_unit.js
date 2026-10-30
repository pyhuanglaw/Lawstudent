// 開新遊戲前先備份（BUG-SAVE-NEWGAME-1030，使用者 2026-10-30 04:0x：「你現在放到自動存檔 我重新開遊戲 就被第一天蓋掉了 完全讀不到」）——不需要瀏覽器。
//   以前：💾 存在自動存檔那一格；標題畫面按「從經濟系開始／從法律系開始」，第一次自動存檔就把原本的進度蓋掉，沒有任何備份。
//   現在：開新遊戲（三個按鈕）先把自動存檔、快速存檔各寫一份 fatiao3d_backup_new_<savedAt>（同一份不重寫；最多 3 份，超過刪進度最少的）；
//         選單存檔頁多一區「備份」（#saveBackups）列出全部 fatiao3d_backup*，可讀取；備份寫不進去先問玩家。
// 檢查（從 src/game3d.js 抽出 backupKeys／backupList／backupBeforeNew 原樣執行，假的 localStorage；按鈕、存檔頁看字串）：
//   1. 有自動存檔＋快速存檔：各備份一份、標籤寫明、原本的兩格不動
//   2. 再按一次（同一份存檔）：不重複備份
//   3. 最多 3 份：超過刪進度最少（day 最小）的，真正的進度留著
//   4. 備份寫不進去：問玩家（confirm），不要就不開新遊戲
//   5. 沒有存檔：不備份、照常開新遊戲
//   6. 三個開新遊戲按鈕都先 backupBeforeNew（不要就 return）再 newGameAbort
//   7. 存檔頁：#saveBackups 一區列出 backupList()，只有讀取（不動 #saveSlots 的按鈕）
// 修改前（1b9354379）：第 0 項 FAIL（抽不到）。用法：node tests/save_newgame_backup_unit.js [game3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const blk=SRC.match(/\n  const NEW_KEEP=3, KEY_NEWBK=[\s\S]*?\n  GM\.backupBeforeNew=backupBeforeNew; GM\.backupList=backupList;\n/);
check('0. 抽得到 backupKeys、backupList、backupBeforeNew',!!blk);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 假的 localStorage
function mkStore(){ const m=new Map(); return { m, full:false, get length(){ return m.size; }, key(i){ return [...m.keys()][i]; }, getItem(k){ return m.has(k)?m.get(k):null; },
  setItem(k,v){ if(this.full) throw new Error('QuotaExceededError'); m.set(k,String(v)); }, removeItem(k){ m.delete(k); } }; }
let st=mkStore(), asked=[], answer=true;
const ctx={ GM:{}, KEY_AUTO:'fatiao3d_auto', KEY_QUICK:'fatiao3d_quick', KEY_BACKUP:'fatiao3d_backup', Date, JSON,
  ls:()=>st, write:(k,o)=>{ try{ st.setItem(k,JSON.stringify(o)); return true; }catch(e){ return false; } }, read:k=>{ const t=st.getItem(k); return t?JSON.parse(t):null; },
  confirm:(q)=>{ asked.push(q); return answer; } };
vm.createContext(ctx);
vm.runInContext(blk[0]+'\nthis.backupKeys=backupKeys; this.backupList=backupList; this.backupBeforeNew=backupBeforeNew;',ctx);
const put=(k,o)=>st.setItem(k,JSON.stringify(o)), get=k=>JSON.parse(st.getItem(k)||'null'), newKeys=()=>[...st.m.keys()].filter(k=>k.startsWith('fatiao3d_backup_new_')).sort();
// 1.
put('fatiao3d_auto',{day:120,hour:14.5,name:'祐廷',zone:'campus',savedAt:1000}); put('fatiao3d_quick',{day:119,hour:9,name:'祐廷',zone:'dorm',savedAt:900});
let r=ctx.backupBeforeNew();
check('1. 有自動存檔＋快速存檔：各備份一份（fatiao3d_backup_new_<savedAt>）、標籤寫明、原本兩格不動',r===true&&newKeys().length===2&&get('fatiao3d_backup_new_1000').day===120&&/自動存檔（開新遊戲前）/.test(get('fatiao3d_backup_new_1000').backupLabel)&&/快速存檔（開新遊戲前）/.test(get('fatiao3d_backup_new_900').backupLabel)&&get('fatiao3d_auto').day===120&&get('fatiao3d_quick').day===119,JSON.stringify(newKeys()));
// 2.
r=ctx.backupBeforeNew();
check('2. 同一份存檔再按一次：不重複備份',r===true&&newKeys().length===2,JSON.stringify(newKeys()));
// 3. 開新遊戲以後玩了一下（第一天），連按幾次開新遊戲
put('fatiao3d_quick',{day:1,savedAt:2000}); st.removeItem('fatiao3d_quick');
for(const [d,t] of [[1,3000],[1,4000],[2,5000]]){ put('fatiao3d_auto',{day:d,hour:21,savedAt:t}); ctx.backupBeforeNew(); }
const kept=newKeys().map(k=>get(k).day);
check('3. 最多 3 份：連按開新遊戲擠掉的是進度最少的，day 120 那一份留著',newKeys().length===3&&kept.includes(120)&&kept.includes(119)&&kept.includes(2),JSON.stringify(newKeys().map(k=>[k.slice(21),get(k).day])));
// 4.
st.full=true; put; asked=[]; answer=false; st.full=false; put('fatiao3d_auto',{day:200,savedAt:9000}); st.full=true;
r=ctx.backupBeforeNew();
check('4. 備份寫不進去：先問玩家；選不要＝不開新遊戲',r===false&&asked.length===1&&/沒辦法備份/.test(asked[0]),JSON.stringify(asked));
answer=true; asked=[]; r=ctx.backupBeforeNew(); st.full=false;
check('4. 選要＝照樣開新遊戲',r===true&&asked.length===1);
// 5.
st=mkStore(); asked=[]; r=ctx.backupBeforeNew();
check('5. 沒有存檔：不備份、不問、照常開新遊戲',r===true&&st.m.size===0&&asked.length===0);
// backupList
st=mkStore(); put('fatiao3d_backup',{day:50,savedAt:100}); put('fatiao3d_backup_y0end',{day:-3,savedAt:50,backupLabel:'經濟系那一年的最後一天'}); put('fatiao3d_backup_new_300',{day:80,savedAt:300}); put('fatiao3d_backup_x',{bad:1}); put('fatiao3d_auto',{day:1,savedAt:999});
const BL=ctx.backupList().map(([k])=>k);
check('5. backupList：全部 fatiao3d_backup*（不含自動存檔、壞掉的），新的在上面',JSON.stringify(BL)===JSON.stringify(['fatiao3d_backup_new_300','fatiao3d_backup','fatiao3d_backup_y0end']),JSON.stringify(BL));
// 6.
const btns=['btnNew','btnNewLaw','btnNewEcon'].map(id=>new RegExp("\\$\\('"+id+"'\\)\\.onclick=async\\(\\)=>\\{ A3\\.start\\(\\); await waitChars\\(\\); if\\(!backupBeforeNew\\(\\)\\) return; if\\(G\\) newGameAbort\\(\\);").test(SRC));
check('6. 三個開新遊戲按鈕都先 backupBeforeNew（不要就 return）再 newGameAbort',btns.every(Boolean),JSON.stringify(btns));
// 7.
check('7. 存檔頁：#saveBackups 一區列出 backupList()，只有讀取（mk 的 onSave 是 null）',/bx\.id='saveBackups'/.test(SRC)&&/const L=backupList\(\);/.test(SRC)&&/mk\('備份：'\+[^;]*,b,null,\(\)=>loadFrom\(b\),bx\)/.test(SRC));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
