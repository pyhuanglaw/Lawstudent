// 女主角故事線、AA_720 場景的「（動作）說的話」要有名字（BB-B 11-08 12:39，P3；f01f54039 起就這樣，不是 TEXT-QUOTE 第六批造成）。
// 原本 src/arcs3d.js 的 play、src/aa720_3d.js 的 S.play 用「（ 開頭＝旁白」：沛珊「（她說完，馬上笑著說：）不好意思，我問太多了～」顯示成名字框空的旁白，
// 她說的話既沒名字也沒「」；學姊考前一晚三句「（小聲）……」也一樣。改成整句是一對（…）才是旁白（同 pool3d.js POOL.narrWhole、invites3d.js S.narrLine，第六批）。
// 檢查：
//   1 兩支的 narrWhole＝參考寫法（整句一對（））；HEROINE_ARCS、ARC_ROT、AA720 全部字串分法：和舊的「（ 開頭」只差下面這 8 句，一句不多一句不少
//   2 演出來（不需要瀏覽器，D131）：沛珊第 3 拍、可昕第 2 拍選 2 的回覆、學姊考前一晚——那幾句名字框是她、整句（…）的照舊是旁白、字一個不改
//   3 （小聲）開頭有名字以後，LIBQ.needsPrefix 不會再加一次（圖書館讀書區）
//   4 原始碼：兩支的 play 不再用 /^（/
// 修改前（9ceff6edf 的兩支 src）：1、2、4 FAIL。用法：node tests/arcs_narr_whole_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadErr=[];
const loadG=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有'); return false; } try{ const s=fs.readFileSync(p,'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); return false; } };
for(const f of ['src/data/heroine_arcs.js','src/data/arc_rot.js','src/data/decide_rules.js','src/decide3d.js','src/arcs3d.js','src/libquiet3d.js',
  'src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/data/y2b_events.js','src/y2b3d.js','src/zr_sendoff3d.js','src/y34b3d.js',
  'src/ytjob3d.js','src/sis_grad3d.js','src/psresults3d.js','src/data/feed_y1s2.js','src/data/feed_y2s1.js','src/feed3d.js','src/data/aa723.js','src/confess723_3d.js',
  'src/y2r2_3d.js','src/aa555_3d.js','src/zq_testbuild3d.js','src/data/aa720.js','src/aa720_3d.js']) loadG(f);
const P=()=>typeof AA720P!=='undefined'?AA720P:null;
const REF=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='（') d++; else if(ch==='）'){ d--; if(d===0) return i===t.length-1; } } return false; };
const OLD=t=>typeof t==='string'&&/^（/.test(t);
const PS='classmate_peishan', KX='kexin', SIS='heroine_05';
const EXPECT=['（她說完，馬上笑著說：）不好意思，我問太多了～','（她說完，馬上換上笑臉。）沒事啦～今天精神很好！','（她說完，馬上笑著揮手。）啊，我亂講的～','（她笑著揮手。）沒有啦，我亂想的～','（她皺了一下眉頭。）那件真的很醜。',
  '（小聲）明天要是又寫錯上個月就會的題目……','（小聲）算了。不會。','（小聲）謝謝你。'];
const strs=[]; const walk=o=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object') Object.values(o).forEach(walk); else if(typeof o==='string') strs.push(o); };
(async()=>{
  check('0. 載入',!loadErr.length&&typeof ARCS!=='undefined'&&!!P(),J(loadErr));
  if(typeof ARCS==='undefined'||!P()){ H.done(); return; }
  walk(HEROINE_ARCS); walk(typeof ARC_ROT!=='undefined'?ARC_ROT:null); walk(AA720.data);
  /* 1 分法 */
  const fa=typeof ARCS.narrWhole==='function'?ARCS.narrWhole:()=>null, fb=typeof P().narrWhole==='function'?P().narrWhole:()=>null;
  const bad1=strs.filter(t=>fa(t)!==REF(t)), bad2=strs.filter(t=>fb(t)!==REF(t));
  check('1. ARCS.narrWhole＝整句一對（）（全部 '+strs.length+' 句）',typeof ARCS.narrWhole==='function'&&!bad1.length,J(bad1.slice(0,3)));
  check('1. AA720P.narrWhole＝整句一對（）',typeof P().narrWhole==='function'&&!bad2.length,J(bad2.slice(0,3)));
  if(typeof POOL!=='undefined'&&POOL.narrWhole) check('1. 和 POOL.narrWhole 一樣',strs.every(t=>POOL.narrWhole(t)===REF(t)));
  /* 演的時候會走到 play 的、舊的寫法分錯的：（ 開頭但不是整句一對（），而且不是傳訊息的時間（「（19:00）算了。」走手機、TIMED 先濾掉）、不是企劃說明 */
  const diff=[...new Set(strs.filter(t=>OLD(t)&&!REF(t)))];
  const played=diff.filter(t=>EXPECT.includes(t)), other=diff.filter(t=>!EXPECT.includes(t));
  check('1. 舊寫法分錯的正好是這 8 句（沛珊四、可昕一、學姊考前一晚三）',J([...played].sort())===J([...EXPECT].sort()),J(played));
  check('1. 其他（ 開頭、不是整句一對（）的只剩不演的（手機時間、企劃說明）',other.every(t=>/^（\d{1,2}:\d{2}）/.test(t)||/AA_\d+/.test(t)),J(other));
  /* 2 演出來 */
  const G=H.fresh('2026-10-05',15,'dorm',{});
  const beats=id=>HEROINE_ARCS.people[id].beats;
  { H.said=[]; H.picks=[0]; const b=beats(PS)[2]; await ARCS.play(GM,{name:'沛珊',charId:PS},PS,b);
    const s=H.said.find(x=>x.t==='（她說完，馬上換上笑臉。）沒事啦～今天精神很好！');
    check('2. 沛珊第 3 拍「（她說完，馬上換上笑臉。）沒事啦～……」名字框＝沛珊、字沒改',!!s&&s.who==='沛珊',J(H.said.slice(0,5)));
    const nr=H.said.filter(x=>REF(x.t)); check('2. 同一拍整句（…）的照舊是旁白',nr.length>0&&nr.every(x=>x.who===null),J(nr.slice(0,3))); }
  { H.said=[]; H.picks=[1]; const b=beats(KX)[1]; await ARCS.play(GM,{name:'可昕',charId:KX},KX,b);
    const s=H.said.find(x=>x.t==='（她皺了一下眉頭。）那件真的很醜。'); check('2. 可昕第 2 拍選 2「（她皺了一下眉頭。）那件真的很醜。」名字框＝可昕',!!s&&s.who==='可昕',J(H.said)); }
  { H.said=[]; const sc=AA720.data.events.ev_sis_last_night.scene; await P().play(GM,SIS,sc);
    const sm=H.said.filter(x=>/^（小聲）/.test(x.t)); const nm=P().herObj(SIS).name;
    check('2. 學姊考前一晚三句（小聲）名字框＝學姊（'+nm+'）',sm.length===3&&sm.every(x=>x.who===nm),J(sm));
    const nr=H.said.filter(x=>REF(x.t)); check('2. 那一場整句（…）的七句照舊是旁白',nr.length===7&&nr.every(x=>x.who===null),J(nr.length));
    check('2. 逐字和稿一樣、句數一樣',J(H.said.map(x=>x.t))===J(sc.map(t=>String(t).replace(/\{name\}/g,G.name||'祐廷')))); }
  /* 3 LIBQ */
  check('3. （小聲）開頭有名字以後，讀書區不會再加一次（LIBQ.needsPrefix false）',typeof LIBQ!=='undefined'&&EXPECT.slice(5).every(t=>LIBQ.needsPrefix(t)===false));
  /* 4 原始碼 */
  const a=fs.readFileSync(path.join(H.ROOT,'src/arcs3d.js'),'utf8'), b=fs.readFileSync(path.join(H.ROOT,'src/aa720_3d.js'),'utf8');
  const pa=(a.match(/const play=async\(GM,who,lines\)=>\{[^\n]*/)||[''])[0], pb=(b.match(/S\.play=async function\(GM,her,L\)\{[^\n]*/)||[''])[0];
  check('4. arcs3d.js play 用 S.narrWhole、不再用 /^（/',!!pa&&/S\.narrWhole\(s\)/.test(pa)&&!/\/\^（\//.test(pa),pa.slice(0,160));
  check('4. aa720_3d.js S.play 用 S.narrWhole、不再用 /^（/',!!pb&&/S\.narrWhole\(s\)/.test(pb)&&!/\/\^（\//.test(pb),pb.slice(0,160));
  H.done();
})();
