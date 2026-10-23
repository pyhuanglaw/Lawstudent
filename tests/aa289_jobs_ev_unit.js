// 打工小事件（SYS-13-EV；AA_289 第 1～3 節，企劃線 3a26e94a）——不需要瀏覽器。
//   遊戲裡現在有的打工：溫州街三家（JOBS，事件在 AA_420／wzlines3d.js）、家教（JOB_TUTOR，data/events.js 的 ev_tutor_lesson 最小版）。
//   AA_289 其他種類（Café 外場、舊路書房、便利商店夜班、補習班助教、事務所工讀、研究助理）遊戲裡還沒有這些打工：不在這裡。
//   1  家教補一件「考卷的背面」（3-3）：第 6 堂以後（TUTOR_N≥5）第一次＝旁白、國中生、兩個選項各自的回答、那天晚上滷味攤明軒一句；只一次
//   2  第 5 堂以前沒有；原本第 1～3 堂的內容照舊；接一次就好（patchTutor 不重複接）
// 修改前（開發分支 HEAD）：ev_tutor_lesson 沒有這一段——FAIL。用法：node tests/aa289_jobs_ev_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/wz_jobs.js','src/jobs3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=t=>H.said.some(s=>s.t===t);
const L=()=>H.lines();
const DRAW='（學生的考卷背面畫了一個法庭，法官是一隻貓。）', MX='我的學生畫的是外星人。';
const lesson=async(n,picks)=>{ H.G.flags.TUTOR_N=n; H.said=[]; H.bgs=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev('ev_tutor_lesson')); };

(async()=>{
check('0. 載得到；ev_tutor_lesson 存在',ok&&!!ev('ev_tutor_lesson')&&typeof JOBS!=='undefined',err);

await sec(1,async()=>{ H.fresh('2026-04-14',19,'dorm',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:PG.DK('2026-03-03')});
  await lesson(5,['「差不多。」']);
  const i=H.said.findIndex(s=>s.t===DRAW);
  check('1. 第 6 堂（TUTOR_N 5）：考卷背面的貓法官（旁白）＋國中生「法官都長這樣吧？」',i>=0&&H.said[i].who==null&&H.said[i+1]&&H.said[i+1].t==='法官都長這樣吧？'&&H.said[i+1].who==='國中生',J(L()));
  check('1. 選項「差不多。」／「法官不是貓。」',H.opts.some(o=>J(o)===J(['「差不多。」','「法官不是貓。」'])),J(H.opts));
  check('1. 「差不多。」→ 國中生「我就知道。」（沒有另一條的回答）',said('我就知道。')&&!said('好無聊。')&&H.G.flags.TUTOR_DRAW_ANS==='same');
  const k=H.said.findIndex(s=>s.t===MX);
  check('1. 那天晚上滷味攤：明軒「我的學生畫的是外星人。」（背景換成滷味攤）',k>i&&/明軒/.test(H.said[k].who||'')&&/gongguan_luwei/.test(J(H.bgs)),J(L())+' '+J(H.bgs));
  check('1. 記下 TUTOR_DRAW；那一堂照樣算一堂（TUTOR_N 6）',H.G.flags.TUTOR_DRAW===H.G.day&&H.G.flags.TUTOR_N===6);
  H.G.day+=7; await lesson(6); check('1. 下一堂：不再演',!said(DRAW)&&!said(MX),J(L()));
  H.fresh('2026-04-21',19,'dorm',{JOB_TUTOR:true,TUTOR_WD:2}); await lesson(7,['「法官不是貓。」']);
  check('1. 「法官不是貓。」→「那是什麼？」「……人。」（祐廷）「好無聊。」',said('那是什麼？')&&H.said.some(s=>s.t==='……人。'&&s.who==='祐廷')&&said('好無聊。')&&!said('我就知道。')&&H.G.flags.TUTOR_DRAW_ANS==='person',J(L()));
  const a=H.said.findIndex(s=>s.t==='那是什麼？'), b=H.said.findIndex(s=>s.t==='……人。'), c=H.said.findIndex(s=>s.t==='好無聊。'); check('1. 順序：問 → 答 → 好無聊',a>=0&&b>a&&c>b); });

await sec(2,async()=>{ H.fresh('2026-03-10',19,'dorm',{JOB_TUTOR:true,TUTOR_WD:2});
  await lesson(4); check('2. 第 5 堂（TUTOR_N 4）以前：沒有',!said(DRAW)&&H.G.flags.TUTOR_DRAW==null,J(L()));
  await lesson(0); check('2. 第 1 堂照舊（國中生的問題）、沒有貓法官',said('老師，課本寫的跟我家發生的事不一樣，那要聽誰的？')&&!said(DRAW));
  await lesson(2); check('2. 第 3 堂照舊（「你不吃，我媽會以為你不喜歡她。」）',said('你不吃，我媽會以為你不喜歡她。')&&!said(DRAW));
  check('2. 只接一次（再叫 patchTutor 不重複；開頭、結尾各一段）',JOBS.patchTutor()===false&&ev('ev_tutor_lesson').dialogue.filter(l=>typeof l.call==='function').length===2);
  H.fresh('2026-04-14',19,'dorm',{}); H.G.flags.TUTOR_N=8; check('2. 沒有家教（JOB_TUTOR）＝不演',!JOBS.tutorDrawDue(H.G)); });

H.done();
})();
