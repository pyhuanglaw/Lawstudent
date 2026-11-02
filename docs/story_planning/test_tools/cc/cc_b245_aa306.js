// CC（帳號 A）11-02 BB_245 第二批 #1：AA306-KX-LADDER-1018 經濟系閒聊階梯（Node，不開瀏覽器、不改 src/）。
// LAWWW 驗法（docs/handoff/BB245_LAWWW_REPLY_1102.md 第一節）：探針比對 LADDER.byTerm.Y0S1／Y0S2 每人層數和 AA_306 定稿。
// 定稿：docs/story_planning/AA_306_閒聊階梯逐層確認_經濟系.md 最後一版（750e72fb7，10-20「韋綸大一下 L5～L8 拿掉」＝經濟系階梯全部問完；
//   4618aed21 只是 D115 換名，層的 id 沒變）。每一列「改成」欄是「拿掉」（含 **拿掉這層**）的那一層不該在遊戲裡，其他列（照現在／改寫）要在。
// 另外套一筆 AA_306 之後的使用者決定：LAD-K0LX2-CUT-1018（使用者 10-18 14:3x 選「整段拿掉」可昕 K0-Lx2；總表 11-02 改「取消／被取代」，理由＝ladder.js 已沒有 K0-Lx2）。
// 所以期望：Y0S1 可昕 12（K0-L1～L8、Lx3、Lx5、Lx7、Lx8）、品妤 6、唐睿 4、阿勳 6、韋綸 7；Y0S2 可昕 4、品妤 4、唐睿 2、阿勳 1、韋綸 1。
// 注意：總表 tasks.json 的 next 寫「階梯最終版 93f356cc（大一下…韋綸 5）」，AA_306 定稿（750e72fb7）是韋綸大一下 1 層（WL0b-L3）——這支以 AA_306 定稿為準，總表那一句只印 INFO。
// 用法：cd <受測工作樹> && node <本檔>　（cwd＝受測版本；定稿從 git 讀 AA306_SHA，預設 750e72fb7，可用環境變數換）
// 修正 commit：1c98fbbf9（閒聊階梯改用 AA-C 定稿，含 AA_306 韋綸 Y0S2 L5～L8 拿掉、K0-Lx2 拿掉）；對照＝1c98fbbf9^（預期 FAIL：韋綸大一下 5 層、可昕大一上 13 層）。
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=process.cwd();
const AA306_SHA=process.env.AA306_SHA||'750e72fb7';
const DOC='docs/story_planning/AA_306_閒聊階梯逐層確認_經濟系.md';
let fails=0; const FL=[];
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok){ fails++; FL.push(n); } };
const info=s=>console.log('INFO '+s);
let sha='?'; try{ sha=cp.execSync('git rev-parse --short HEAD',{cwd:ROOT}).toString().trim(); }catch(e){}
console.log('cc_b245_aa306　受測 '+ROOT+'（'+sha+'）　定稿 '+AA306_SHA+':'+DOC);

/* ---- 讀遊戲的 LADDER（只載 src/data/ladder.js） ---- */
const src=fs.readFileSync(path.join(ROOT,'src/data/ladder.js'),'utf8').replace(/^const LADDER\s*=/m,'globalThis.LADDER=');
vm.runInThisContext(src,{filename:'ladder.js'});
const B=LADDER.byTerm||{};
/* ---- 讀定稿 ---- */
let md=''; try{ md=cp.execSync('git show '+AA306_SHA+':"'+DOC+'"',{cwd:ROOT,maxBuffer:1<<24}).toString(); }catch(e){ check('讀得到 AA_306 定稿',false,String(e.message).slice(0,200)); console.log('FAILED 1'); process.exit(1); }
const WHO={K0:'kexin',PY0:'econ_pinyu',TR0:'econ_tangrui',XN0:'econ_zhengxun',WL0:'econ_weilun'};
const NAME={kexin:'可昕',econ_pinyu:'品妤',econ_tangrui:'唐睿',econ_zhengxun:'阿勳',econ_weilun:'韋綸'};
const exp={Y0S1:{},Y0S2:{}};
for(const line of md.split('\n')){
  const m=/^\|\s*((K0|PY0|TR0|XN0|WL0)(b?)-(L\d|Lx\d))\b[^|]*\|[^|]*\|([^|]*)\|/.exec(line); if(!m) continue;
  const id=m[1], who=WHO[m[2]], term=m[3]?'Y0S2':'Y0S1', cut=/^\s*(\*\*)?拿掉/.test(m[5]);
  (exp[term][who]=exp[term][who]||{keep:[],cut:[]})[cut?'cut':'keep'].push(id);
}
/* AA_306 之後的使用者決定（LAD-K0LX2-CUT-1018）*/
const LATER_CUT={'K0-Lx2':'LAD-K0LX2-CUT-1018（使用者 10-18 14:3x「整段拿掉」）'};
for(const t in exp) for(const w in exp[t]){ const E=exp[t][w]; for(const id of Object.keys(LATER_CUT)) if(E.keep.includes(id)){ E.keep=E.keep.filter(x=>x!==id); E.cut.push(id); info(t+' '+NAME[w]+' '+id+'：AA_306 寫保留，照 '+LATER_CUT[id]+' 算拿掉'); } }
check('定稿解析：兩個學期各 5 個人、每人 8 層（L1～L8；可昕 Y0S1 另有 Lx1～Lx8）',
  ['Y0S1','Y0S2'].every(t=>Object.keys(WHO).every(k=>{ const E=exp[t][WHO[k]]; const n=E?E.keep.length+E.cut.length:0; return n===((t==='Y0S1'&&k==='K0')?16:8); })),
  JSON.stringify(Object.fromEntries(['Y0S1','Y0S2'].map(t=>[t,Object.fromEntries(Object.entries(exp[t]).map(([w,E])=>[NAME[w],E.keep.length+'/'+(E.keep.length+E.cut.length)]))]))));
const WANT={Y0S1:{kexin:12,econ_pinyu:6,econ_tangrui:4,econ_zhengxun:6,econ_weilun:7},Y0S2:{kexin:4,econ_pinyu:4,econ_tangrui:2,econ_zhengxun:1,econ_weilun:1}};
for(const t of ['Y0S1','Y0S2']) for(const w of Object.values(WHO)){ const E=exp[t][w]||{keep:[],cut:[]};
  check('定稿 '+t+' '+NAME[w]+' 保留 '+WANT[t][w]+' 層（和回覆文件列的數字一致）',E.keep.length===WANT[t][w],E.keep.join(',')); }
/* ---- 比對遊戲 ---- */
for(const t of ['Y0S1','Y0S2']) for(const w of Object.values(WHO)){
  const L=B[t]&&B[t][w], ids=(L&&Array.isArray(L.steps)?L.steps:[]).map(s=>s&&s.id), E=exp[t][w]||{keep:[],cut:[]};
  const miss=E.keep.filter(x=>!ids.includes(x)), extra=ids.filter(x=>!E.keep.includes(x));
  check(t+' '+NAME[w]+'：遊戲 '+ids.length+' 層＝定稿 '+E.keep.length+' 層，且層 id 一樣',!!L&&ids.length===E.keep.length&&!miss.length&&!extra.length,
    '遊戲 ['+ids.join(',')+']'+(miss.length?'　少 '+miss.join(','):'')+(extra.length?'　多 '+extra.join(','):''));
}
/* 總表那一句（只記）*/
try{ const T=JSON.parse(cp.execSync('git show origin/claude/confident-ritchie-8rwh7t:docs/handoff/tasks.json',{cwd:ROOT,maxBuffer:1<<26}).toString());
  const L=Array.isArray(T)?T:(T.tasks||[]); const t=L.find(x=>x.id==='AA306-KX-LADDER-1018');
  if(t){ const m=/韋綸\s*(\d+)\s*層?/.exec(t.next||''); info('總表 AA306-KX-LADDER-1018 next 寫韋綸大一下 '+(m?m[1]:'?')+' 層；AA_306 定稿 '+(exp.Y0S2.econ_weilun||{keep:[]}).keep.length+' 層；遊戲 '+((B.Y0S2&&B.Y0S2.econ_weilun&&B.Y0S2.econ_weilun.steps)||[]).length+' 層'); }
}catch(e){ info('讀不到總表（只記）：'+String(e.message).slice(0,120)); }
console.log(fails?('FAILED '+fails+'：'+FL.join('、')):'ALL PASS');
process.exit(fails?1:0);
