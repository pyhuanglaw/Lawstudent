// 假期空白（BB198-VACB22）第四批：AA_930 可昕大三暑假——跟她人在哪裡無關的手機那幾則（交往中）。
// 用法：node tests/vacgap_kx_y3s_unit.js
// 檢查：實習三則（7/6、7/27、8/24 21:00，兩個按鈕、回覆開到隔天 18:00、她回的照稿）、回家的晚上（6/19 起每晚 22:00，七句不重複）、8/30 開始讀國考（KX_PLAN_Y3S）；
//       沒交往＝都沒有；presence 和稿對不上的（開車旅行、重逢、七夕）沒有排。
// 修改前（dd63a41a10）：全部 FAIL。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr=''; for(const f of ['src/data/vacgap_lines.js','src/vacgap3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+(e&&e.message||e)+'　'; } }
check('0. 載得到',!loadErr,loadErr);
const X=VACGAP_LINES.kxY3S, D=H.D, T=(d,h)=>d*24+h, K=d=>CALENDAR.dateOf(d).key, wd=d=>CALENDAR.dateOf(d).wd%7;
const set=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
let LOG={};
const runTo=(key,h,step)=>{ step=step||1; const t1=T(D(key),h); let t=T(H.G.day,H.G.hour); while(t<t1-1e-9){ t=Math.min(t1,t+step); const d=Math.floor(t/24); set(d,t-d*24); STORY.phoneRules(GM); PHONE.tick(H.G); for(const m of H.G.msgs||[]) if(m.tag){ const A=LOG[m.tag]||(LOG[m.tag]=[]); if(!A.includes(m)) A.push(m); } } };
const got=tag=>LOG[tag]||[], when=tag=>{ const m=got(tag)[0]; return m?K(m.day)+' '+m.h:null; };
const start=(dating)=>{ H.fresh('2028-06-15',8,'dorm',{KX_MET:true}); LOG={}; H.FAMILIAR('kexin'); H.G.contacts={kexin:1}; if(dating) H.G.flags.dating_kexin=true; };
start(true); runTo('2028-09-01',12,3);
check('1. 實習三則：7/6、7/27、8/24 21:00，字照 AA_930 第 1 節',J([1,2,3].map(i=>when('msg_kx_intern_y3s_'+i)))===J(['2028-07-06 21','2028-07-27 21','2028-08-24 21'])&&J(got('msg_kx_intern_y3s_1').map(m=>m.text))===J(X.intern[0].ms));
{ const m=got('msg_kx_intern_y3s_2').slice(-1)[0]; check('2. 兩個按鈕、回覆開到隔天 18:00、她回的照稿',m&&m.ask&&J(m.ask.opts.map(o=>o.t))===J(['短一點比較好懂。','改到最後剩什麼？'])&&m.ask.until===T(D('2028-07-28'),18)&&m.ask.opts[1].say[0].text==='剩一句。那一句是對的'); }
{ const tags=[1,2,3,4,5,6,7].map(i=>'msg_kx_home_y3s_night_'+i); check('3. 回家的晚上：6/19～6/25 每晚 22:00 一則、七句不重複',J(tags.map(when))===J([19,20,21,22,23,24,25].map(d=>'2028-06-'+d+' 22'))&&J(tags.map(t=>got(t)[0].text))===J(X.home)&&!got('msg_kx_home_y3s_night_8').length,J(tags.map(when))); }
check('4. 8/30 21:00 開始讀國考、記 KX_PLAN_Y3S',when('msg_kx_plan_y3s')==='2028-08-30 21'&&H.G.flags.KX_PLAN_Y3S===true);
start(false); runTo('2028-09-01',12,6);
check('5. 沒交往＝都沒有',!Object.keys(LOG).some(t=>/^msg_kx_(intern|home_y3s_night|plan)/.test(t))&&!H.G.flags.KX_PLAN_Y3S);
check('6. 開車旅行、重逢、七夕沒有排（presence 整個暑假在高雄，交 LAWWW）',!STORY_EVENTS.some(e=>/^ev_kexin_(trip_summer_y3|reunion_jp|qixi_y3)$/.test(e.id)));
H.done();
