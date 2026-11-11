// CC 11-11：產生 expect.json 的抽句腳本（不給遊戲用）。用法：在一個空資料夾裡，對每個 SHA 建 <sha>/ 放 git show <sha>:src/data/{ladder,heroine_arcs,feed_y1s1,feed_pg,fest_events,r2y4b_events,termend_opts,termend_lines}.js，再 node extract.js（印 JSON）。
const vm=require('vm'), fs=require('fs');
const PS='classmate_peishan';
function load(v,f,name){ const src=fs.readFileSync(v+'/'+f+'.js','utf8'); const H=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='STORY_EVENTS'?(t[k]=[]):function(){ return false; }),has:()=>true});
  const ctx=vm.createContext(Object.assign(Object.create(null),{console,Array,Object,JSON,Math,String,Number,Date,RegExp,Set,Map,Error,STORY_EVENTS:[],CALENDAR:{},module:{exports:{}}}));
  try{ vm.runInContext(src.replace(/^'use strict';/m,'').replace(new RegExp('^const '+name+'\\s*=','m'),'globalThis.'+name+'='),ctx); }catch(e){ return {err:String(e).slice(0,200)}; }
  return ctx[name]; }
const out={};
for(const v of ['f5e1ef4e8','65212b697']){ const o={};
  const L=load(v,'ladder','LADDER'); for(const T of ['Y1S2','Y2S1','Y3S1','Y3S2','Y4S1','Y4S2']){ const P=L.byTerm[T][PS], s0=P.steps[0], s7=P.steps[7], c=s7.choices[0];
    o['lad_'+T]={first:s0.lines[0], last:c.re?c.re[c.re.length-1]:c.reply, s0:s0.id, s7:s7.id, c0:c.t, s7li:!!s7.linesIf, s0li:!!s0.linesIf}; }
  const A=load(v,'heroine_arcs','HEROINE_ARCS'); const b=A.people[PS].beats; const op=b[7].opts[0]; o.arc={first:b[0].lines[0], last:op.reply?op.reply[op.reply.length-1]:null, o0:op.t, alt0:!!b[0].alt, alt7:!!b[7].alt};
  const F1=load(v,'feed_y1s1','FEED_Y1S1'), FP=load(v,'feed_pg','FEED_PG'); const p4=F1.posts.find(p=>p.id==='ps4'), p2=FP.posts.find(p=>p.id==='ps2i');
  o.feed={first:p4.say, last:p2.dm[p2.dm.length-1], t4:p4.t, t2:p2.t, pic4:p4.pic, pic2:p2.pic, say2:p2.say, dmIf2:p2.dmIf||null, st4:p4.st, st2:p2.st, dm0:p2.dm[0]};
  const FD=load(v,'fest_events','FEST_DATA'); const P=(FD.PEOPLE||FD.people||FD)[PS]; const tx=x=>typeof x==='string'?x:(x&&x.text);
  o.fest=P?{first:tx(P.fest.vday.s6[0]), last:tx(P.fest.xmas.s6[P.fest.xmas.s6.length-1]), none:tx((P.none||[])[0]), keys:Object.keys(FD).slice(0,6)}:{err:'no PS', keys:Object.keys(FD)};
  const R=load(v,'r2y4b_events','R2Y4B_EVENTS'); const ev=Array.isArray(R)?R.find(e=>e.id==='ev_peishan_open_class'):null; if(ev){ const d=ev.dialogue; const n=d.find(x=>x.text&&/^（教室後門/.test(x.text)); const m=d.filter(x=>x.speaker==='沛珊媽媽'); o.open={first:n&&n.text, last:m.length?m[m.length-1].text:null, n:d.length}; } else o.open={err:String(R&&R.err)};
  const TO=load(v,'termend_opts','TERMEND_OPTS'); let y=null; try{ const g=TO.people.gf; y=JSON.stringify(g).length; }catch(e){}
  const find=(o2,path)=>{ if(!o2||typeof o2!=='object') return null; if(o2.Y4S2&&path.includes(PS)) return o2.Y4S2; for(const k in o2){ const r=find(o2[k],path.concat(k)); if(r) return r; } return null; };
  const Y=find(TO,[]); o.tn=Y?{first:(Y.says.find(s=>!s.if)||Y.says[0]).say[0], firstDelayed:(Y.says.find(s=>s.if==='DELAYED')||{say:[null]}).say[0], last:Y.opts[0].re[Y.opts[0].re.length-1], o0:Y.opts[0].t}:null;
  const TL=load(v,'termend_lines','TERMEND_LINES'); let tbl=null; try{ const fnd=(o2)=>{ if(!o2||typeof o2!=='object') return null; if(o2[PS]&&o2[PS].table) return o2[PS].table; for(const k in o2){ const r=fnd(o2[k]); if(r) return r; } return null; }; tbl=fnd(TL); }catch(e){ tbl=String(e); }
  o.tnFallback=tbl;
  out[v]=o; }
console.log(JSON.stringify(out,null,1));
