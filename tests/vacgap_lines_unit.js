// 假期空白（BB198-VACB22）逐字對稿：src/data/vacgap_lines.js（以後加的批次也放這裡）的每一句玩家看得到的字，都在 AA 的定稿裡（D137、D79：程式不自己編字）。
// 稿：企劃線 claude/magical-albattani-bk7b4n @ 7466ec8f8e 的 AA_928～AA_933、AA_935（BB_452～456 的改字已經收進稿）。讀不到稿＝FAIL（請 git fetch origin claude/magical-albattani-bk7b4n）。
// 用法：node tests/vacgap_lines_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const REF='7466ec8f8e';   /* AA_935 ①②（可昕大三暑假、大三寒那一句、沛珊改字）在這一版；原本 329ead6bd7 */
const DOCS=['AA_928_假期空白_大一寒假_阿凱明軒Kevin.md','AA_929_假期空白_第二批_考試補習交流.md','AA_930_假期空白_第三批_可昕大三暑假.md','AA_931_假期空白_第四批_過年訊息.md','AA_933_假期空白_第五批_回家回臺北訊息.md','AA_935_回LAWWW_假期空白接線七件.md'];
const git=p=>{ try{ return cp.execSync('git -c core.quotepath=false show '+REF+':"docs/story_planning/'+p+'"',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const docs=DOCS.map(git);
/* AA_942（企劃線 72ab8199aa，BB_454 照用）：可昕 2028 七夕、河堤約的那一則 */
const REF942='72ab8199aa', doc942=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show '+REF942+':"docs/story_planning/AA_942_回LAWWW_可昕2028暑假六件.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } })();
docs.push(doc942); const all=docs.join('\n');
check('0. 稿讀得到（AA_928～933、935 @ '+REF+'；AA_942 @ '+REF942+'）',docs.every(d=>d.length>1000),docs.map(d=>d.length).join(','));
const src=fs.readFileSync(path.join(ROOT,'src/data/vacgap_lines.js'),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1=');
vm.runInThisContext(src,{filename:'vacgap_lines.js'});
/* 玩家看得到的字：所有字串，扣掉日子、假期代號、'go'／'back'／'flip' */
const META=/^(\d{4}-\d\d-\d\d|Y[1-4][WS]|go|back|flip)$/;
const strs=[]; const walk=(x,k)=>{ if(typeof x==='string'){ if(!META.test(x)) strs.push([k,x]); return; } if(Array.isArray(x)) x.forEach((y,i)=>walk(y,k+'['+i+']')); else if(x&&typeof x==='object') for(const q in x){ if(q==='day'||q==='h'||q==='speaker'||q==='goto'||q==='label') continue; walk(x[q],k+'.'+q); } };
walk(VACGAP_LINES,'L');
const miss=strs.filter(([k,t])=>!all.includes(t));
check('1. 每一句都在稿裡（'+strs.length+' 句）',strs.length>150&&!miss.length,miss.slice(0,8).map(([k,t])=>k+'＝'+t).join('　'));
/* 手機一則一句：稿上用「／」分開的不能黏成一則 */
const glued=strs.filter(([k,t])=>t.includes('／'));
check('2. 沒有把「／」分開的兩則黏成一則',!glued.length,glued.map(x=>x[1]).join('　'));
/* BB 改過的那幾句用改過的版本（BB_452 P3、BB_456 P3）*/
check('3. BB 改字：阿凱「我床上的東西不要動」、方奕廷「明年這個時候，我應該在山上的工作站。」',JSON.stringify(VACGAP_LINES.home.kai[0][4])===JSON.stringify(['所以我回宜蘭了','我床上的東西不要動'])&&VACGAP_LINES.home.npc_fangyt.some(r=>r[4][0]==='學弟好。回台中了。明年這個時候，我應該在山上的工作站。'));
/* AA_935（BB_456 看過）的改字：舊字不能留 */
{ const H=VACGAP_LINES.home, row=(w,k,kind)=>(H[w]||[]).find(r=>r[0]===k&&r[1]===kind)||[];
  check('4. AA_935 ①②：可昕大三寒回臺北交往中「宿舍好冷。你那邊呢。」；沛珊大三寒、大四寒「回台南了～」「我媽說這次要我多待幾天」',JSON.stringify(row('kexin','Y3W','back')[5])===JSON.stringify(['宿舍好冷。你那邊呢。'])&&JSON.stringify(row('classmate_peishan','Y3W','back')[4])===JSON.stringify(['回台南了～'])
    &&JSON.stringify(row('classmate_peishan','Y4W','go')[4])===JSON.stringify(['回家了～','我媽說這次要我多待幾天'])&&JSON.stringify(row('classmate_peishan','Y4W','back')[4])===JSON.stringify(['回台南了～','下禮拜開學，我有一點捨不得台中'])
    &&!strs.some(([k,t])=>['中午公館，見一下也好','最後一個寒假，我媽說要我多待幾天','回臺北了～'].includes(t)&&/peishan|kexin/.test(k)||t==='中午公館，見一下也好')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
