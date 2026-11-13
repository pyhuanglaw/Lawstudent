// 可昕的心願「手機關掉的一天」（AA_921 第 1 節、BB_448；CANON-NO-ECON-1112 第五批）：心願事件進行中手機不響，結束後照原本的時間補送
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,d)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||d==null?'':'　'+d)); if(!ok) fails++; };
const story=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
check('1. story3d 的手機 tick 在 WISH.quietNow 的時候不送（執行期旗標，不進存檔）',/if\(typeof PHONE!=='undefined'&&!\(typeof WISH!=='undefined'&&WISH\.quietNow\)\)\{ try\{ S\.phoneRules\(GM\); PHONE\.tick\(/.test(story));
global.window=global; global.STORY={PHONE_RULES:[]};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/wish3d.js'),'utf8').replace(/^const WISH=/m,'globalThis.WISH='),{filename:'wish3d.js'});
(async()=>{
  let during=null; WISH.scene0=async(GM)=>{ during=WISH.quietNow; return {counted:true}; };
  const G={flags:{}}; const r=await WISH.scene({G},null,{who:'kexin'});
  check('2. 可昕的心願：事件進行中 quietNow、結束後關掉；存檔旗標沒動',during===true&&WISH.quietNow===false&&Object.keys(G.flags).length===0&&r.counted===true,JSON.stringify({during,flags:G.flags}));
  during=null; const G2={flags:{}}; await WISH.scene({G:G2},null,{who:'heroine_01'});
  check('3. 其他人的心願不關手機',during===false);
  WISH.scene0=async()=>{ throw new Error('x'); }; const G3={flags:{}}; let threw=false; try{ await WISH.scene({G:G3},null,{who:'kexin'}); }catch(e){ threw=true; }
  check('4. 事件中途出錯也會關掉 quietNow（不會讓手機永遠不響）',threw&&WISH.quietNow===false);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
