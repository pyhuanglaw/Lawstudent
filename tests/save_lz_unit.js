// SAVE-LZ-1104（使用者 11-04 13:5x 選「加 lz-string」：重度玩家 7 份存檔約 5.9 MB，超過瀏覽器 5 MB）：存檔壓縮——不需要瀏覽器。
//   1. 舊存檔（沒有前綴的 JSON）照讀；GM.lzSave 預設 true（11-13 起），?nolzsave＝false 時平常照舊存 JSON
//   2. 空間不足：JSON 存不進去 → 改存壓縮版（LZ1: 開頭）再試一次；存得進去就算成功、saveErr 清掉；讀回來和原本一樣
//   3. GM.lzSave＝true：每次都壓；讀回來一樣；大存檔壓完明顯變小（印出比例和時間，只當參考）
//   4. 壓縮的存檔在沒有 lz-string 的地方讀＝null（不當掉）；壞掉的壓縮字串＝null
//   5. index.html 在 src/game3d.js 前面載入 lib/lz-string.js（?v= 和其他檔一樣）；GM.readSave＝read（測試、探針用）
// 修改前（67935d7f8）：1～5 都 FAIL（抽不到 encSave／decSave）。用法：node tests/save_lz_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const LZSRC=fs.readFileSync(path.join(ROOT,'lib/lz-string.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const blk=SRC.match(/\n  const isQuota=[\s\S]*?\n  GM\.autosave=autosave;\n/);
const rd=SRC.match(/\n  function read\(key\)\{[^\n]*\n  GM\.readSave=read;[^\n]*\n/);
check('0. 抽得到 isQuota…autosave（含 encSave、decSave、write）和 read／GM.readSave', !!blk&&!!rd&&/function encSave\(/.test(blk[0])&&/function decSave\(/.test(blk[0]));
const quotaErr=()=>{ const e=new Error('The quota has been exceeded.'); e.name='QuotaExceededError'; e.code=22; return e; };
function mkStore(cap){ return { m:new Map(), cap, setItem(k,v){ v=String(v); let used=0; for(const [kk,vv] of this.m) if(kk!==k) used+=kk.length+vv.length; if(used+k.length+v.length>this.cap) throw quotaErr(); this.m.set(k,v); }, getItem(k){ return this.m.has(k)?this.m.get(k):null; } }; }
function mkCtx(st,withLZ,lzSave){
  const ctx={ GM:lzSave===undefined?{}:{lzSave}, G:{day:5}, E:{player:{}}, D:{busyDepth:0}, KEY_AUTO:'fatiao3d_auto', JSON, performance:{now:()=>0}, Date:{now:()=>1e6},
    snapshot:()=>({}), toast:()=>{}, ls:()=>st };
  vm.createContext(ctx); if(withLZ) vm.runInContext(LZSRC,ctx);
  vm.runInContext(blk[0]+rd[0]+'\nthis.write=write; this.read=read;',ctx); return ctx; }
/* 像真的存檔的大物件：很多天的訊息、記憶、習慣（重複的鍵名、中文句子） */
function bigSave(n){ const s={v:2,day:n,hour:13.5,zone:'campus',flags:{},msgs:[],mem:{},habits:{}};
  for(let i=0;i<n;i++){ s.msgs.push({day:i,from:'heroine_0'+(i%5+1),text:'今天下課要不要一起去吃飯？我在法律系館A門口等你。第'+i+'天',read:true});
    s.mem['ev_'+(i%97)+'_'+i]={day:i,label:'在椰影大道遇到她'}; s.habits['seat:campus:@'+i+',0']={n:1,first:i,last:i,days:[i]}; s.flags['F_'+i]=i%3===0; }
  return s; }
if(blk&&rd){
  /* 1. 舊存檔照讀；平常存 JSON */
  { const st=mkStore(1e9); const old={v:2,day:9,zone:'dorm',note:'舊存檔'}; st.m.set('fatiao3d_slot_1',JSON.stringify(old));
    const c=mkCtx(st,true); check('1. GM.lzSave 預設 true（11-13 起每次都壓；網址加 ?nolzsave 才關）', c.GM.lzSave===true, String(c.GM.lzSave));
    check('1. 舊存檔（JSON，沒有前綴）照讀', JSON.stringify(c.read('fatiao3d_slot_1'))===JSON.stringify(old));
    const ok0=c.write('fatiao3d_auto',{day:3,a:'小存檔'}); const raw0=st.getItem('fatiao3d_auto');
    check('1. 預設：小存檔也存成 LZ1: 開頭、讀回來一樣', ok0===true&&raw0.startsWith('LZ1:')&&JSON.stringify(c.read('fatiao3d_auto'))===JSON.stringify({day:3,a:'小存檔'}), raw0.slice(0,4));
    const cf=mkCtx(st,true,false); const ok=cf.write('fatiao3d_auto',{day:3,a:'小存檔'}); const raw=st.getItem('fatiao3d_auto');
    check('1. GM.lzSave＝false（?nolzsave）、空間夠：照舊存 JSON（{ 開頭）', ok===true&&raw[0]==='{', raw.slice(0,12)); }
  /* 2. 空間不足 → 改存壓縮版 */
  { const S=bigSave(3000), J=JSON.stringify(S); const st=mkStore(Math.floor(J.length*0.6)); const c=mkCtx(st,true);
    const ok=c.write('fatiao3d_auto',S); const raw=st.getItem('fatiao3d_auto')||'';
    check('2. JSON 存不進去（上限＝JSON 的 60%）→ 改存壓縮版成功、saveErr 清掉', ok===true&&c.GM.saveErr===null&&raw.startsWith('LZ1:'), 'ok='+ok+' err='+c.GM.saveErr+' raw='+raw.slice(0,4));
    check('2. 壓縮版讀回來和原本一樣', JSON.stringify(c.read('fatiao3d_auto'))===J);
    const st2=mkStore(10); const c2=mkCtx(st2,true); const ok2=c2.write('fatiao3d_auto',S);
    check('2. 壓縮了還是存不進去：照舊回傳失敗、saveErr＝quota', ok2===false&&c2.GM.saveErr==='quota', 'ok='+ok2+' err='+c2.GM.saveErr);
    const st3=mkStore(Math.floor(J.length*0.6)); const c3=mkCtx(st3,false); const ok3=c3.write('fatiao3d_auto',S);
    check('2. 沒有 lz-string 的地方：照舊失敗、saveErr＝quota（不當掉）', ok3===false&&c3.GM.saveErr==='quota'); }
  /* 3. GM.lzSave＝true：每次都壓 */
  { const S=bigSave(6000), J=JSON.stringify(S); const st=mkStore(1e9); const c=mkCtx(st,true,true);
    const t0=Date.now(); const ok=c.write('fatiao3d_slot_2',S); const ms=Date.now()-t0; const raw=st.getItem('fatiao3d_slot_2')||'';
    const t1=Date.now(); const back=c.read('fatiao3d_slot_2'); const ms2=Date.now()-t1;
    check('3. GM.lzSave＝true：存成 LZ1: 開頭、讀回來一樣', ok===true&&raw.startsWith('LZ1:')&&JSON.stringify(back)===J);
    const ratio=raw.length/J.length;
    check('3. 大存檔壓完變小（字元數 < 原本的 40%）', ratio<0.4, 'JSON '+(J.length/1024).toFixed(0)+' K 字元 → '+(raw.length/1024).toFixed(0)+' K（'+(ratio*100).toFixed(1)+'%）；壓＋驗 '+ms+' ms、解 '+ms2+' ms（Node，只當參考）'); }
  /* 4. 讀不了的情況不當掉 */
  { const st=mkStore(1e9); const c=mkCtx(st,true,true); c.write('k',{a:1}); const raw=st.getItem('k');
    const st2=mkStore(1e9); st2.m.set('k',raw); const c2=mkCtx(st2,false);
    check('4. 壓縮的存檔在沒有 lz-string 的地方讀＝null（不當掉）', c2.read('k')===null);
    st2.m.set('bad','LZ1:'+String.fromCharCode(0x4e00,0x4e01,0x20)); const c3=mkCtx(st2,true);
    let r; try{ r=c3.read('bad'); }catch(e){ r='THROW'; } check('4. 壞掉的壓縮字串＝null（不丟例外）', r===null, String(r)); }
}
/* 5. 載入順序、測試用的 GM.readSave */
const IDX=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const iLZ=IDX.indexOf('<script src="lib/lz-string.js?v='), iGM=IDX.indexOf('<script src="src/game3d.js?v=');
const vLZ=(IDX.match(/lib\/lz-string\.js\?v=([0-9.]+)/)||[])[1], vGM=(IDX.match(/src\/game3d\.js\?v=([0-9.]+)/)||[])[1];
check('5. index.html 在 src/game3d.js 前面載入 lib/lz-string.js，?v= 一樣', iLZ>0&&iGM>iLZ&&vLZ&&vLZ===vGM, 'lz='+iLZ+' game3d='+iGM+' v='+vLZ+'/'+vGM);
check('5. GM.readSave＝read（測試、探針讀存檔用）', /\n  GM\.readSave=read;/.test(SRC));
check('5. LICENSES.md 有 lz-string', /\| lz-string 1\.5\.0（`lib\/lz-string\.js`/.test(fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8')));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
