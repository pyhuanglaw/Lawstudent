// 打字中按「略過對話」（BB 2026-11-02，CC 在 62d98bfa5 PC 實測：第一句還在打字時按略過＝停在第一句、要再點一下）——不需要瀏覽器。
//   從 src/game3d.js 抽出 dlgAdvance 原樣執行（假的 DOM）：ADV.skip 開著時，打字中呼叫 dlgAdvance 要補完這一句「而且」接著翻（呼叫 resolve）；
//   沒開略過時照舊只補完、不翻。之後每一句 say 看到 ADV.skip 會 40 ms 自動翻（game3d.js showLine），所以第一句翻過去就會一路到選項。
// 修改前：2 FAIL。用法：node tests/adv_skip_typing_unit.js [game3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const SRC=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const m=SRC.match(/\n  function dlgAdvance\(\)\{[^\n]*\n/); check('0. 抽得到 dlgAdvance',!!m); if(!m){ console.log('FAILED'); process.exit(1); }
const mk=()=>{ const els={}; const el=id=>els[id]||(els[id]={id,style:{},textContent:'',classList:{add(){},remove(){}}});
  const ctx={$:el,D:{active:true,typing:true,full:'第一句完整的字。',resolve:null},ADV:{active:true,skip:false},E:{player:{pose:'idle'}},A3:{blip(){}},sayRestoreSoon(){},performance:{now:()=>0},resolved:0};
  ctx.D.resolve=()=>{ ctx.resolved++; }; vm.createContext(ctx); vm.runInContext(m[0]+'\nthis.dlgAdvance=dlgAdvance;',ctx); return ctx; };
{ const c=mk(); c.dlgAdvance(); check('1. 沒開略過、打字中點一下：只補完這一句、不翻（照舊）',c.resolved===0&&c.D.active&&c.$('dlgText').textContent==='第一句完整的字。'); }
{ const c=mk(); c.ADV.skip=true; c.dlgAdvance(); check('2. 開了略過、打字中按：補完這一句而且接著翻（resolve 被呼叫、對話框收起來）',c.resolved===1&&!c.D.active&&!c.D.typing,JSON.stringify({resolved:c.resolved,active:c.D.active})); }
{ const c=mk(); c.ADV.skip=true; c.ADV.active=false; c.dlgAdvance(); check('3. ADV 沒開（3D 對話）就算 skip 殘留也照舊只補完',c.resolved===0); }
{ const c=mk(); c.D.typing=false; c.dlgAdvance(); check('4. 一句已經打完：點一下照舊翻',c.resolved===1); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
