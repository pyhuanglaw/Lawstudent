// N6 舊存檔相容（CC，2026-11-02）——不需要瀏覽器、不改遊戲、不讀任何使用者存檔。
// 需要同一個資料夾的 n56_loadall.js。輸出另存在腳本旁邊的 n6_out.md（不要 commit）。不讀 tests/repro_*/user_save_*.json（使用者本人的存檔）。
// 用法：node n6_save_compat.js <repo 根目錄>   （repo 要是 git checkout：用 git show 取 v9.5 a4f2760、v9.4.2 dfd2618 的 defaults() 做舊存檔）
// 做法：照 index.html 載入 src/（game3d.js 與 3D 繪圖模組除外），再從 src/game3d.js 原樣抽出 SAVE_VER、defaults、validate、migrate、
//   MEET_EVENTS、relabelFirstMet、firstMetMigrate（localStorage 換成記憶體），照 applySave 的順序跑：validate → migrate(深拷貝) → firstMetMigrate → SOCIAL.bind/EVENTS.bind/LEGAL.bind，
//   接著叫讀檔後第一次會碰到的懶補預設：STUDY.rec（G.study）、CLS.rec（G.courses、rollSince）、CLS.rollWeeks（G.courses.roll）、FD.migrate 再跑一次（冪等），再 migrate 一次看結果一樣（冪等）。
//   舊存檔來源：tests/save_compat_v95.py 的 STATES（v9.5 格式：第 3／9／23 天、湖邊）＋ git 上 v9.5、v9.4.2 的 defaults()＋v1（v7 時代：social/events/legal 沒有）＋
//   兩份人工的「中期舊存檔」（D118 之前：有 courses.attend 但沒有 roll/rollSince/study；BUG-Y4S2-NOFINAL 之前：FAIL_DELAY_COURSES 誤判）。
const fs=require('fs'), path=require('path'), cp=require('child_process'), ROOT=path.resolve(process.argv[2]||'.');
const L=require(path.join(__dirname,"n56_loadall.js"))(ROOT);
const out=[]; const log=s=>{ out.push(s); console.log(s); };
const GSRC=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
// Z3.ZONES：zones3d.js 載不進 Node（three.js shader），用原始碼裡登記的區域名稱
const zn=new Set(); { const m=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8').match(/const ZONES=\{([^}]*)\}/); if(m) m[1].split(',').forEach(k=>zn.add(k.trim()));
  for(const f of fs.readdirSync(path.join(ROOT,'src'))) if(/\.js$/.test(f)) for(const x of fs.readFileSync(path.join(ROOT,'src',f),'utf8').matchAll(/ZONES\.(\w+)\s*=/g)) zn.add(x[1]); }
global.Z3={ZONES:Object.fromEntries([...zn].filter(Boolean).map(k=>[k,{name:k}]))};
const grab=(re,name)=>{ const m=GSRC.match(re); if(!m) throw new Error('抽不到 '+name); return m[0]; };
const code=[grab(/const SAVE_VER=\d+;/,'SAVE_VER'),'const KEY_BACKUP="fatiao3d_backup"; const __st={}; const read=k=>__st[k]||null; const write=(k,o)=>{ __st[k]=JSON.parse(JSON.stringify(o)); return true; };',
  grab(/function defaults\(name\)\{[^\n]*\n/,'defaults'),grab(/function validate\(s\)\{[^\n]*\n/,'validate'),grab(/function migrate\(s\)\{[\s\S]*?\n    s\.v=SAVE_VER; return s; \}\n/,'migrate'),
  grab(/const MEET_EVENTS=[^\n]*\n/,'MEET_EVENTS'),grab(/function relabelFirstMet\(s\)\{[\s\S]*?so\.fm120=true; return out; \}\n/,'relabelFirstMet'),grab(/function firstMetMigrate\(s,raw\)\{[\s\S]*?return s2; \}\n/,'firstMetMigrate'),
  'globalThis.__SV={SAVE_VER,defaults,validate,migrate,firstMetMigrate,store:__st};'].join('\n');
require('vm').runInThisContext('(function(){ const GM={}; let G=null; '+code+' })();',{filename:'game3d.js（抽出）'});
const SV=global.__SV;
const GMst={get G(){ return SV._G; },E:{player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}},say:async()=>{},choose:async()=>0,advance(){},memo(){},autosave(){},toast(){}};
const oldDefaults=sha=>{ try{ const s=cp.execSync('git -C '+JSON.stringify(ROOT)+' show '+sha+':src/game3d.js',{encoding:'utf8',maxBuffer:64<<20}); const ver=+s.match(/const SAVE_VER=(\d+)/)[1]; const f=s.match(/function defaults\(name\)\{[^\n]*\n/)[0].split('\n')[0];
  const body=f.slice(0,f.lastIndexOf('}')+1); return new Function('SAVE_VER',body+'; return defaults;')(ver); }catch(e){ log('（取不到 '+sha+'：'+e.message.split('\n')[0]+'）'); return null; } };
const d95=oldDefaults('a4f2760'), d942=oldDefaults('dfd2618');
const FLAGS12={introDone:true,campusIntro:true,readCase:'full',classDone:true,afternoonDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
const snap=(d,o)=>Object.assign(d('舊版玩家'),{pos:{x:0,z:0,yaw:0},savedAt:1760000000000},o||{});
const SAVES=[];
if(d95){ SAVES.push(['v9.5 新遊戲（第 1 天晚上）',snap(d95)]);
  SAVES.push(['v9.5 slot1 第 3 天上午校園',snap(d95,{zone:'campus',day:3,weekday:5,hour:10.5,pos:{x:-38,z:6,yaw:0},flags:FLAGS12,rel:{an:22,zhe:19,sis:5,kai:10,yu:5},money:19300})]);
  SAVES.push(['v9.5 slot2 第 9 天公館',snap(d95,{zone:'gongguan',day:9,weekday:4,hour:12.4,pos:null,flags:FLAGS12,rel:{an:25,zhe:24,sis:9,kai:14,yu:8},money:16850})]);
  SAVES.push(['v9.5 slot3 第 23 天 Café',snap(d95,{zone:'cafe',day:23,weekday:4,hour:20.2,pos:null,flags:FLAGS12,rel:{an:30,zhe:28,sis:12,kai:18,yu:11},money:9400})]);
  SAVES.push(['v9.5 lake 第 5 天湖邊（星期記錯 0）',snap(d95,{zone:'campus',day:5,weekday:0,hour:16,pos:{x:-30,z:-53.5,yaw:3.14},flags:FLAGS12,rel:{an:22,zhe:19,sis:5,kai:10,yu:5},money:18000})]); }
if(d942) SAVES.push(['v9.4.2 新遊戲',snap(d942)]);
if(d942){ const s=snap(d942,{day:2,hour:9,zone:'campus',flags:{introDone:true}}); s.v=1; delete s.social; delete s.events; delete s.legal; delete s.cg; SAVES.push(['v1（v7 時代格式：沒有 social/events/legal/cg）',s]); }
{ const cur=SV.defaults('中期玩家'); const day=STORY.termDay('Y1S2',6,3); Object.assign(cur,{day,hour:14,zone:'campus',pos:{x:0,z:0,yaw:0},savedAt:1761000000000,stats:{steps:100,classes:30,study:12},
    courses:{done:{},attend:{civ_general:5,const_law:4},prep:{},electives:{},grades:{Y1S1:{civ_general:'通過'}},note:{},disc:{},ask:{},late:{},abs:{}}}); delete cur.study; SAVES.push(['人工：D118 之前的大一下中期（courses 沒有 roll/rollSince、沒有 G.study）',cur]); }
for(const [cid,lab] of [['maritime','大四下考五題的課：應該救回'],['enforcement','不是大四下的課：應該照舊延畢']]){ const cur=SV.defaults('延畢誤判'); const day=STORY.dayOfKey('2029-06-20'); Object.assign(cur,{day,hour:10,zone:'dorm',pos:{x:0,z:0,yaw:0},savedAt:1762000000000,flags:Object.assign(cur.flags,{FAIL_DELAY:true,FAIL_DELAY_COURSES:[cid],BAR_REG:false}),courses:{exam:{},grades:{Y4S2:{[cid]:'缺考（不及格）'}}}}); delete cur.study; SAVES.push(['人工：BUG-Y4S2-NOFINAL 之前的延畢誤判 '+cid+'（'+lab+'）',cur]); }
if(0){ const cur=SV.defaults('延畢誤判'); const day=STORY.dayOfKey('2029-06-20'); Object.assign(cur,{day,hour:10,zone:'dorm',pos:{x:0,z:0,yaw:0},savedAt:1762000000000,flags:Object.assign(cur.flags,{FAIL_DELAY:true,FAIL_DELAY_COURSES:['enforcement'],BAR_REG:false}),courses:{exam:{},grades:{Y4S2:{enforcement:'缺考（不及格）'}}}}); delete cur.study; SAVES.push(['人工：BUG-Y4S2-NOFINAL 之前的延畢誤判（FAIL_DELAY_COURSES）',cur]); }
{ const s=snap(d95||SV.defaults); s.zone='no_such_zone'; SAVES.push(['壞檔：未知地點（validate 應該擋）',s]); }
{ const s=snap(d95||SV.defaults); s.v=99; SAVES.push(['壞檔：較新版本 v99（validate 應該擋）',s]); }
const diff=(a,b,p)=>{ p=p||''; const ks=new Set([...Object.keys(a||{}),...Object.keys(b||{})]); const o=[]; for(const k of ks){ const x=a&&a[k], y=b&&b[k]; if(JSON.stringify(x)===JSON.stringify(y)) continue; if(x&&y&&typeof x==='object'&&typeof y==='object') o.push(diff(x,y,p+k+'.')); else o.push(p+k+' '+JSON.stringify(x)+'→'+JSON.stringify(y)); } return o.filter(Boolean).join('、'); };
const keysNew=Object.keys(SV.defaults('x'));
log('載入 '+L.loaded.length+'/'+L.files.length+' 支 src；Z3.ZONES 取原始碼登記的 '+Object.keys(Z3.ZONES).length+' 個區域');
log('\n| 舊存檔 | validate | migrate 例外 | 新欄位缺預設 | weekday | G.study | courses.rollSince | courses.roll | FD 欄位 | migrate 冪等 | console.warn |');
log('|---|---|---|---|---|---|---|---|---|---|---|');
const warns=[]; const ow=console.warn; console.warn=(...a)=>{ warns.push(a.map(String).join(' ').slice(0,160)); };
for(const [name,raw] of SAVES){ warns.length=0; const row=[name]; const err=SV.validate(raw); row.push(err?'擋下：'+err:'OK'); if(err){ log('| '+row.join(' | ')+' | — | — | — | — | — | — | — | — | — |'); continue; }
  let s, ex='無';
  try{ s=SV.migrate(JSON.parse(JSON.stringify(raw))); s=SV.firstMetMigrate(s,raw); SV._G=s; SOCIAL.bind(s); EVENTS.bind(GMst); if(LEGAL.bind) LEGAL.bind(s,GMst); if(!s.cg) s.cg={unlocked:[]}; }catch(e){ ex=String(e.message).slice(0,100); }
  row.push(ex); if(!s){ log('| '+row.join(' | ')+' |'); continue; }
  const miss=keysNew.filter(k=>s[k]===undefined||s[k]===null).filter(k=>!['pos','social','events','legal'].includes(k)); row.push(miss.length?miss.join(','):'無');
  const wd=CALENDAR.dateOf(s.day).wd%7; row.push(raw.weekday+'→'+s.weekday+(s.weekday===wd?'（對）':'（錯，應 '+wd+'）'));
  let st='', cr='', rl='';
  try{ const before=s.study===undefined?'沒有':'有'; const r=STUDY.rec(s); st=before+'→'+(r&&r.v===1&&r.bf===1&&r.u&&Array.isArray(r.miss)?'補上 v1/bf1（u '+Object.keys(r.u).length+' 張）':'異常 '+JSON.stringify(r).slice(0,60)); }catch(e){ st='例外 '+e.message.slice(0,60); }
  try{ const R=CLS.rec(s); cr=String(R.rollSince)+(R.rollSince===s.day?'（＝讀檔那天）':''); const T=CALENDAR.termOf(s.day); let n=0; if(T&&CLS.termCourses){ for(const c of CLS.termCourses(s,T.id)){ if(CLS.attCourse&&CLS.attCourse(c)){ CLS.rollWeeks(s,c,T.id); n++; } } }
    rl=(T?T.id:'學期外')+'：看出席的課 '+n+' 門，roll '+Object.keys(R.roll||{}).length+' 筆'; }catch(e){ cr='例外 '+e.message.slice(0,80); }
  let fd=''; try{ const F=s.flags; fd=['FAIL_DELAY','FAIL_DELAY_COURSES','FD_RESCUE_NOFINAL','FAIL_DELAY_V','FD_MAKEUP'].filter(k=>F[k]!==undefined).map(k=>k+'='+JSON.stringify(F[k])).join(' ')||'（無，新遊戲預設也沒有）'; const s2=JSON.parse(JSON.stringify(s)); FD.migrate(s2); if(JSON.stringify(s2.flags)!==JSON.stringify(s.flags)) fd+='；FD.migrate 第二次又改＝不冪等'; }catch(e){ fd='例外 '+e.message.slice(0,80); }
  row.push(st,cr,rl,fd);
  let idem=''; try{ const a=JSON.parse(JSON.stringify(s)); const b=SV.migrate(JSON.parse(JSON.stringify(a))); const strip=o=>{ const c=JSON.parse(JSON.stringify(o)); return c; }; const A=JSON.stringify(strip(a)), B=JSON.stringify(strip(b)); idem=A===B?'是':'否：'+diff(JSON.parse(A),JSON.parse(B)); }catch(e){ idem='例外 '+e.message.slice(0,60); }
  row.push(idem, warns.length?warns.slice(0,2).join('；').replace(/\|/g,'/'):'無');
  log('| '+row.join(' | ')+' |'); }
console.warn=ow;
fs.writeFileSync(path.join(__dirname,'n6_out.md'),out.join('\n'));
