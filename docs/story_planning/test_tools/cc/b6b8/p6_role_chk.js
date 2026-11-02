const MODE='uniform';
const rngOf=s=>{ let a=s>>>0||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const TERMS={Y1S1:['const_1','crim_gen1','civ_general'],Y1S2:['const_2','crim_gen2','oblig_gen1'],Y2S1:['admin_law','crim_spec','property','oblig_gen2'],Y2S2:['oblig_spec','family_law','admin_remedy'],
  Y3S1:['civpro_1','crimpro','company_law'],Y3S2:['civpro_2','insurance'],Y4S1:['enforcement','legal_ethics']};
const GE=[['Y1S1','ge_film_y1s1'],['Y1S2','ge_y1s2'],['Y2S1','ge_y2s1'],['Y2S2','ge_y2s2']];
const PARTNERS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan'];
function gen(seed){ const r=rngOf(seed*2654435761+(MODE==='uniform'?7:0)); const U=MODE==='uniform';
  const nrm=()=>{ let s=0; for(let i=0;i<6;i++) s+=r(); return (s-3)/Math.sqrt(0.5); };   // ~N(0,1)
  const pick=(arr,w)=>{ if(U||!w) return arr[Math.floor(r()*arr.length)]; let x=r()*w.reduce((a,b)=>a+b,0); for(let i=0;i<arr.length;i++){ x-=w[i]; if(x<0) return arr[i]; } return arr[arr.length-1]; };
  const bin=(n,p)=>{ let k=0; for(let i=0;i<n;i++) if(r()<p) k++; return k; };
  const ui=(a,b)=>a+Math.floor(r()*(b-a+1));
  const P={}; P.abil=U?r()*5:Math.max(0,Math.min(5,3+0.9*nrm()));
  P.finals={}; for(const t in TERMS) for(const c of TERMS[t]) P.finals[t+':'+c+':final']=U?ui(0,5):bin(5,P.abil/5);
  P.study=U?ui(0,1500):Math.max(0,Math.round(300+150*nrm()));
  P.lawclub=U?r()<0.5:r()<0.55; P.sat=P.lawclub?(U?ui(0,30):Math.min(15,bin(10,0.35)+(r()<0.1?ui(3,8):0))):0; P.fafu=P.lawclub&&r()<(U?0.5:0.4)?ui(0,6):null;
  P.grp=U?ui(0,12):(r()<0.45?0:Math.min(10,1+bin(8,0.3)));
  P.ge=GE.map(([t,c])=>[t,c,U?pick(['及格','不及格',null]):(r()<0.7?(r()<0.92?'及格':'不及格'):null)]);
  P.vac={}; for(const [id,p] of [['C16',.12],['C09',.08],['C02',.15],['C10',.1],['C08',.08],['C11',.06],['C12',.06]]) P.vac[id]=U?(r()<0.5?1:0):(r()<p?1:0);
  P.gradTalk=U?ui(0,3):(r()<0.3?ui(1,2):0); P.gradRead=r()<(U?0.5:0.25); P.zq=U?ui(0,2):(r()<0.3?ui(1,2):0); P.ytLease=r()<(U?0.5:0.2);
  P.route=pick(['TW','JP','US'],[80,10,10]); P.fd=P.route==='TW'&&r()<(U?0.5:0.05);
  P.y4=pick(['bar','grad','other'],[55,30,15]);
  P.grad=null; if(P.y4==='grad'||(U&&r()<0.3)) P.grad=pick(['push','exam','fail'],[25,35,40]);
  P.reg=P.y4==='bar'?'yes':pick(['yes','no','missed'],[60,30,10]);
  P.exam={}; P.skip=[]; for(let y=2029;y<=2033;y++){ P.exam[y]=U?ui(0,20):Math.max(0,Math.min(20,bin(20,Math.min(0.95,0.3+0.11*P.abil+0.03*(y-2029))))); if(r()<(U?0.15:0.05)) P.skip.push('exam_'+y); }
  if(!U&&r()<0.03) P.exam[2029]=0;
  P.judge={}; for(let y=2029;y<=2033;y++) P.judge[y]=U?ui(0,10):bin(10,Math.min(0.95,0.2+0.11*P.abil+0.04*(y-2029)));
  P.retake=r()<(U?0.5:0.6); P.lateReg={}; for(let y=2030;y<=2033;y++) P.lateReg[y]=r()<(U?0.5:0.75); P.role=r()<0.5?'judge':'pros';
  P.zqContract=r()<(U?0.5:0.25)?pick(['lawyer','legal_aid','honest']):null; P.zqFriend=r()<(U?0.5:0.4);
  P.partner=U?pick([null].concat(PARTNERS)):(r()<0.5?null:pick(PARTNERS));
  return P; }
for(const s of [35,53,78,167,195]) console.log(s,gen(s).role);
