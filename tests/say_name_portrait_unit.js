// 只寫名字的說話者也顯示立繪（BB 11-02 P2：茶會的 Kevin 用 compact，看不到 11-02 接上的立繪）。
// game3d.js 的 portraitIdByName：名字或別名對到唯一一個有立繪檔的人物才用；同名兩個以上、沒有立繪檔的不猜。
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.P3={CAST:{}};
const load=f=>{ let s=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|PORTRAIT_ONLY|PORTRAIT_FILES|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
load('src/data/characters.js'); load('src/data/portrait_manifest.js');
let fails=0; const J2=JSON.stringify; const ck=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const m=g.match(/  function portraitIdByName\(n\)\{[\s\S]*?\n    return hit\.size===1\?\[\.\.\.hit\]\[0\]:null; \}\n/);
ck('game3d.js 有 portraitIdByName',!!m); if(!m){ console.log('FAIL 1'); process.exit(1); } const f=vm.runInThisContext('('+m[0].trim().replace(/^function portraitIdByName/,'function')+')');
ck('Kevin → npc_kevin',f('Kevin')==='npc_kevin',f('Kevin'));
ck('葛采蓁 → jp_caizhen',f('葛采蓁')==='jp_caizhen'); ck('采蓁（別名）→ jp_caizhen',f('采蓁')==='jp_caizhen');
for(const [n,id] of [['林采潔','pool_1'],['黃郁婷','pool_4'],['劉晏如','pool_5'],['曾靖雯','pool_7'],['葉晨希','pool_11'],['廖芸萱','pool_15'],['詹立群','pool_16'],['馬佳蓉','pool_20']]) ck(n+' → '+id,f(n)===id,f(n));
ck('立衡（別名）→ jp_liheng、宇恆 → jp_yuheng（第 110 組，BB 08:55）',f('立衡')==='jp_liheng'&&f('宇恆')==='jp_yuheng'&&f('鄒立衡')==='jp_liheng',J2([f('立衡'),f('宇恆')]));
ck('沒有立繪檔的人（以安媽媽）→ null',f('以安媽媽')===null); ck('店員 → null',f('店員')===null);
ck('沒有立繪的 pool（蔡宗霖 pool_2）→ null',f('蔡宗霖')===null);
ck('showLine 用 charId，沒有才查名字（3D 人物 who.obj 不查）',/const cid=who&&\(who\.charId\|\|\(!who\.obj&&who\.name\?portraitIdByName\(who\.name\):null\)\); if\(cid\) ADV\.speaker\(cid/.test(g));
const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
ck('茶會 KV 帶 npc_kevin',st.includes("const KV=t=>['Kevin',t,'npc_kevin'];"));
console.log(fails?'FAIL '+fails:'全部通過'); process.exit(fails?1:0);
