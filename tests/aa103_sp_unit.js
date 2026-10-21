// AA-103-SP（AA_103 末節，AA-C 2026-10-17 定稿；法律審查 BB_182）：大三上刑訴第 15 週強制辯護——小語問、林教授兩句，在黑板之後、原本那一句之前。不需要瀏覽器。
// 修改前：syllabus 刑訴 w15 只有 special:true，三句沒有進遊戲（AA-C 10-21 清查 B 點）——第 1、2 項失敗。
// 用法：node tests/aa103_sp_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const m=src.match(/S\.SPECIAL_PRE=(\{[^\n]*\});/); let T=null; try{ T=m?eval('('+m[1]+')'):null; }catch(e){}
const L=T&&T['crimpro|15'];
check('1. 刑訴第 15 週三句照 AA_103：小語問、林教授兩句（§31：看案子不看錢；低收入戶可以自己聲請指定；其他找法扶）', !!L&&L.length===3&&L[0][0]==='yu'&&L[0][1]==='有些案子一定要有律師……那請不起的人，是國家幫他請？'&&L[1][0]==='prof'&&/最輕本刑三年以上/.test(L[1][1])&&/有錢沒錢都一樣。$/.test(L[1][1])&&L[2][0]==='prof'&&L[2][1]==='那請不起、案子又不是這種的呢？低收入戶可以自己聲請指定。其他的——去找法扶。');
const i1=src.indexOf("S.SPECIAL_PRE[c.id+'|'+it.week]"), i2=src.indexOf("+ct.line);",i1);
check('2. 課堂流程：特別週的幾句在原本那一句（ct.line）之前說', i1>0&&i2>i1&&i2-i1<400);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
