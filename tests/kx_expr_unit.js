// KX-EXPR-1018（AA_308 第 9 節）：可昕的台詞都有表情。重考期在家（retake_home，AA-C 86ffcd9a 標 71 句）、經濟系閒聊階梯（ladder_bb_y0s1／y0s2，AA-C f8a2ce92 標 32 句，白名單 49ed7e6a 已含）。
// 修改前（retake_home 匯入 93f356cc）第 1、2 項失敗：71 句都沒有表情。
// 用法：node tests/kx_expr_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
for(const [f,n] of [['src/data/retake_home.js','RETAKE_HOME'],['src/data/ladder.js','LADDER']]) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'global.'+n+'='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const EXPR=['annoyed','embarrassed','laugh','neutral','sad','serious','smile','surprised','teasing','thinking','tired'];   /* 可昕的立繪（assets/portraits/kexin/）*/
const lines=(o,pick,out=[])=>{ if(Array.isArray(o)) o.forEach(x=>lines(x,pick,out)); else if(o&&typeof o==='object'){ if(pick(o)) out.push(o); for(const k in o) lines(o[k],pick,out); } return out; };
{ const L=lines(RETAKE_HOME,o=>typeof o.t==='string'&&o.s==='kexin'), bad=L.filter(o=>!EXPR.includes(o.e));
  check('1. retake_home 來自白名單 86ffcd9a（AA-C KX-EXPR）',/86ffcd9a/.test(RETAKE_HOME.source),RETAKE_HOME.source);
  check('2. retake_home 可昕 71 句都有表情、而且是立繪有的那 11 種',L.length===71&&!bad.length,L.length+' 句，沒標或不對 '+bad.length+'：'+bad.slice(0,3).map(o=>o.t).join('｜')); }
{ const bt=LADDER.byTerm||{}, L=[]; for(const term of ['Y0S1','Y0S2']){ const k=(bt[term]||{}).kexin; if(k) lines(k,o=>o&&o.t!=null&&typeof o.t==='string'&&('e' in o||o.s==='kexin'),L); }
  const bad=L.filter(o=>!EXPR.includes(o.e));
  check('3. 經濟系閒聊階梯（Y0S1、Y0S2）可昕的台詞有表情（AA-C f8a2ce92：大一上 24 句、大一下 8 句）',L.length>=32&&!bad.length,L.length+' 句，沒標或不對 '+bad.length); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
