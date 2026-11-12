// 手機直向左上角不互相蓋住、目標那一條點了會展開（HUD-LANDSCAPE-COMPACT-1112）——不需要瀏覽器。
// 使用者 2026-11-12：「手機上玩 左上角的那幾個都快擋住一半」。BB 在 390×844 判 FAIL：#goal 換成兩三行（rect 約 [10,41,283,86]），下半截被右上角那排按鈕 #hudR（[103,72,380,116]）蓋住。
// 這支只查：index.html 的版面規則還在（直向四列、橫向那一段沒被拿掉）、src/hudchips3d.js 的展開／收回邏輯。實際的 rect 要在瀏覽器量（回報裡有 390×844、360×740、430×932 的數字）。
// 修改前 FAIL（直向沒有格線、#goal 不吃點擊、沒有 hudchips3d.js）。用法：node tests/hud_portrait_compact_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const css=html.slice(html.indexOf('<style>'),html.indexOf('</style>'));
/* 取出一個 @media 區塊（大括號配對）*/
function block(head){ const i=css.indexOf(head); if(i<0) return ''; let j=css.indexOf('{',i), d=0, k=j; for(;k<css.length;k++){ if(css[k]==='{') d++; else if(css[k]==='}'){ d--; if(!d) break; } } return css.slice(j+1,k); }
const rule=(blk,sel)=>{ const re=new RegExp('(?:^|[}\\n ])'+sel.replace(/[#.>*:()\[\]]/g,'\\$&')+'\\{([^}]*)\\}','g'); let m, out=''; while((m=re.exec(blk))) out+=m[1]+';'; return out; };
const P=block('@media (orientation:portrait){#rotate.want');
check('直向那一段還在',P.length>200,String(P.length));
{ const hud=rule(P,'#hud');
  check('直向 #hud 用格線、寬到右邊（第 2 欄留給小地圖、第 2 列 44px 留給右上角按鈕）',/display:grid/.test(hud)&&/grid-template-columns:minmax\(0,1fr\) 118px/.test(hud)&&/grid-template-rows:22px 44px/.test(hud)&&/right:max\(10px,env\(safe-area-inset-right\)\)/.test(hud),hud);
  const clock=rule(P,'#hud #clock'), nc=rule(P,'#hud #nextClass'), goal=rule(P,'#hud #goal'), guide=rule(P,'#hud #guide');
  check('時間在第 1 列、讓位給右邊的金額（--moneyW）',/grid-area:1\/1\/2\/3/.test(clock)&&/max-width:calc\(100% - var\(--moneyW,84px\) - 6px\)/.test(clock),clock);
  check('下一堂在第 2 列、讓位給右邊那排按鈕（--hudRw），最多兩行',/grid-area:2\/1\/3\/3/.test(nc)&&/max-width:calc\(100% - var\(--hudRw,200px\) - 6px\)/.test(nc)&&/-webkit-line-clamp:2/.test(nc),nc);
  check('目標在第 3 列第 1 欄（小地圖左邊）、只留一行（省略號）',/grid-area:3\/1\/4\/2/.test(goal)&&/white-space:nowrap/.test(goal)&&/text-overflow:ellipsis/.test(goal)&&/overflow:hidden/.test(goal),goal);
  check('導引在第 4 列第 1 欄、不再用絕對定位',/grid-area:4\/1\/5\/2/.test(guide)&&!/position:absolute/.test(guide),guide);
  const hudR=rule(P,'#hudR'), money=rule(P,'#hudR>.chip'), mm=rule(P,'#minimap');
  const top=s=>{ const m=/top:calc\(max\(8px,env\(safe-area-inset-top\)\) \+ (\d+)px\)/.exec(s); return m?+m[1]:null; };
  /* 第 1 列 22px＋間距 4＝26；第 2 列 44＋間距 4＝74 */
  check('右上角按鈕在第 2 列（top +26）、金額移到第 1 列右邊、小地圖從第 3 列開始（top +74）',top(hudR)===26&&/position:absolute/.test(money)&&/top:-26px/.test(money)&&/right:0/.test(money)&&top(mm)===74,JSON.stringify({hudR:top(hudR),mm:top(mm),money}));
  check('小地圖寬 112＋間距 6＝第 2 欄 118',/#minimap\{[^}]*width:112px/.test(css)); }
{ const btns=(html.match(/<div id="hudR">[\s\S]*?<div id="goPop"/)||[''])[0].match(/class="ibtn"/g)||[];
  check('右上角按鈕 4 顆（44×4＋間距 8×3＝200，--hudRw 沒量到時的預設值；加按鈕要一起改）',btns.length===4,String(btns.length)); }
const Lb=block('@media (orientation:landscape) and (max-height:500px)');
check('橫向那一段還在（目標只留一行）',/#hud #goal\{[^}]*white-space:nowrap[^}]*text-overflow:ellipsis/.test(Lb)&&/flex-wrap:wrap/.test(rule(Lb,'#hud')));
check('目標那一條吃點擊（#hud 其他不吃）',/pointer-events:auto/.test(rule(css,'#goal'))&&/pointer-events:none/.test(rule(css,'#hud')));
{ const o=rule(css,'#hud #goal.open'); check('展開（.open）＝完整幾行：不截斷、可換行',/white-space:normal/.test(o)&&/overflow:visible/.test(o)&&/-webkit-line-clamp:unset/.test(o)&&/display:block/.test(o),o); }
{ const a=html.search(/<script src="src\/hudchips3d\.js\?v=[\d.]+"><\/script>/), b=html.indexOf('<script>GAME.boot();</script>'), c=html.indexOf('src="src/shoplife3d.js');
  check('index.html 有載入 src/hudchips3d.js（在 GAME.boot 前面；排在 shoplife3d.js 前面——tests/shop_life_audit_1112_unit.js 規定它後面只能有那幾支）',a>0&&a<b&&a<c,[a,b,c].join(',')); }

/* ---- src/hudchips3d.js：假的 DOM ---- */
function el(id){ const cls=new Set(); const e={ id, ls:{}, style:{ props:{}, setProperty(k,v){ this.props[k]=v; } }, offsetWidth:0, parentNode:null,
  classList:{ add:c=>cls.add(c), remove:c=>cls.delete(c), contains:c=>cls.has(c) }, addEventListener(t,f){ (e.ls[t]=e.ls[t]||[]).push(f); }, fire(t,ev){ (e.ls[t]||[]).forEach(f=>f(ev||{stopPropagation(){ this.stopped=true; }})); } }; return e; }
const E={ goal:el('goal'), ui:el('ui'), hudR:el('hudR'), money:el('money') }; const chip=el('moneyChip'); E.money.parentNode=chip; chip.offsetWidth=62; E.hudR.offsetWidth=200;
const timers=[]; const ctx={ console, document:{ getElementById:id=>E[id]||null }, setTimeout:(f,ms)=>{ const t={f,ms,dead:false}; timers.push(t); return t; }, clearTimeout:t=>{ if(t) t.dead=true; } }; ctx.window=ctx; ctx.globalThis=ctx;
vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT,'src/hudchips3d.js'),'utf8').replace(/^const HUDCHIPS\s*=/m,'globalThis.HUDCHIPS='),ctx,{filename:'src/hudchips3d.js'});
const H=ctx.HUDCHIPS;
check('載入就綁好（有 #goal）、量到金額和按鈕的寬',!!H&&H.bound===true&&E.ui.style.props['--moneyW']==='62px'&&E.ui.style.props['--hudRw']==='200px',JSON.stringify(E.ui.style.props));
E.goal.fire('click'); check('點一下＝展開、排了 4 秒後收回',E.goal.classList.contains('open')&&timers.length===1&&timers[0].ms===4000&&!timers[0].dead,JSON.stringify(timers.map(t=>t.ms)));
E.goal.fire('click'); check('再點一下＝收回、計時取消',!E.goal.classList.contains('open')&&timers[0].dead);
E.goal.fire('click'); const t2=timers[timers.length-1]; t2.f(); check('展開以後 4 秒到＝自己收回',!E.goal.classList.contains('open'));
{ const ev={ stopped:false, stopPropagation(){ this.stopped=true; } }; E.goal.fire('pointerup',ev); check('點這一條不往下傳（劇情對話中不會順便翻下一句）',ev.stopped===true); }
chip.offsetWidth=85; H.measure(); check('金額變寬以後重量',E.ui.style.props['--moneyW']==='85px');
chip.offsetWidth=0; E.hudR.offsetWidth=0; H.measure(); check('還沒顯示（寬 0）不亂寫',E.ui.style.props['--moneyW']==='85px'&&E.ui.style.props['--hudRw']==='200px');
/* 沒有 document（其他 Node 測試整包載入時）不出錯 */
{ const c2={ console }; c2.globalThis=c2; vm.createContext(c2); let ok=true; try{ vm.runInContext(fs.readFileSync(path.join(ROOT,'src/hudchips3d.js'),'utf8').replace(/^const HUDCHIPS\s*=/m,'globalThis.HUDCHIPS='),c2); ok=c2.HUDCHIPS.toggle()===false&&c2.HUDCHIPS.measure()===null; }catch(e){ ok=false; console.log(e); } check('沒有 document 也載得起來',ok); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
