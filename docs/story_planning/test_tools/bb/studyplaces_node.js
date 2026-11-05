const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=process.argv[2];
global.window=global; global.self=global; const el=()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={createElementNS:el,createElement:el,getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:el(),documentElement:el()}; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''}; global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(1);
const H=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); for(const m of H.matchAll(/<script src="([^"?]+)/g)){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,m[1]),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:m[1]}); }catch(e){} }
console.warn=()=>{};
const P=INVITE_DATA.places; const st=P.filter(p=>JSON.stringify(p).includes('念書'));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
for(const p of st){ const zid=p.zone||p.id; let seats='—', ok=!!Z3.ZONES[zid]; if(ok){ try{ E.interactables=[]; E.colliders=[]; E.seats=[]; E.npcs=[]; E.lampGlows=[]; const z=Z3.ZONES[zid].build(E); seats=(E.interactables||[]).filter(q=>q&&q.seat).length; }catch(e){ seats='build err'; } }
  console.log(`${p.id}｜zone ${zid}${ok?'':'（沒有這個區域）'}｜玩家座位 ${seats}｜選項字 ${JSON.stringify(p.verbStudy||p.label||p.name||'').slice(0,40)}`); }
