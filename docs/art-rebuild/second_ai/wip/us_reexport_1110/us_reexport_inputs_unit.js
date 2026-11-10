// 開發分支能重新做出美國公寓、C 棟 208 的 GLB（LAWWW2-REEXPORT-US-1027，LAWWW2 帳號 A 11-10）——不需要瀏覽器、不跑 Blender（D131）。
// 重做的指令：bash tools/blender/env_second/lightbake/rebuild_us_rooms.sh apartment|shared（bake_us.sh → 只有公寓切門板 glb_split_node.py → glb_partition_at.py）。
// 11-10 在開發分支 3f3d48325 用低取樣試過：公寓、208 的節點、網格、材質、三角形、extras 和部署中的逐一相同（docs/art-rebuild/second_ai/wip/us_reexport_1110/README.md）。
// 這支檢查重做要用的東西都在 repo 裡（不在的話腳本會失敗，或像衛浴道具組那樣悄悄換成簡單版）：
//   1 us_apartment.py 用到的 Poly Haven 貼圖（L.pbr 的第二個參數）都在（tools/blender/textures/<id>／tools/blender/env_second/textures/<id>，有 _diff）
//   2 家具道具組都在：aa_support 的 us_living／us_kitchen／us_bath_props.glb、bb_support 的 us_bedroom_props.glb
//   3 兩份配置在：src/data/us_apartment_layout.js（US_APARTMENT_LAYOUT）、us_shared_layout.js（US_SHARED_LAYOUT）
//   4 工具都在：bake_us.sh、bake_room.py、glb_split_node.py、glb_partition_at.py、rebuild_us_rooms.sh；rebuild 對公寓切門板（WALL_bath_n_door、x 3.1、WALL_bath_n_door_e）、兩間都跑 partition
//   5 部署中的公寓 GLB 和重做的結果一樣：有 WALL_bath_n_door_e、door213 是自己一個節點（us_apartment.py 不把它併進 usa_door）
// 修改前（開發分支 3f3d48325）：1（concrete_floor_painted 不在）、4（glb_split_node.py、rebuild 不在）、5 的腳本那一半 FAIL。用法：node tests/us_reexport_inputs_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), R=p=>path.join(ROOT,p), ex=p=>fs.existsSync(R(p));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const PY='tools/blender/env_second/us_apartment.py', src=ex(PY)?fs.readFileSync(R(PY),'utf8'):'';
const ids=[...new Set([...src.matchAll(/L\.pbr\([^,]+,\s*'([a-z0-9_]+)'/g)].map(m=>m[1]))];
const texOK=id=>['tools/blender/textures/','tools/blender/env_second/textures/'].some(d=>ex(d+id)&&fs.readdirSync(R(d+id)).some(f=>/_diff/.test(f)));
const miss=ids.filter(id=>!texOK(id));
check('1 us_apartment.py 用到的 Poly Haven 貼圖都在', ids.length>0&&!miss.length, `${ids.length} 種；不在的 ${JSON.stringify(miss)}`);
const props=['assets/models/env/second_ai/aa_support/us_living_props.glb','assets/models/env/second_ai/aa_support/us_kitchen_props.glb','assets/models/env/second_ai/aa_support/us_bath_props.glb','assets/models/env/second_ai/bb_support/us_bedroom_props.glb'];
check('2 家具道具組都在（衛浴那一組沒有的話腳本會悄悄換成簡單版）', props.every(ex)&&props.every(p=>src.includes(p.replace('assets/models/env/second_ai/',''))), JSON.stringify(props.filter(p=>!ex(p))));
const lays=[['src/data/us_apartment_layout.js','US_APARTMENT_LAYOUT'],['src/data/us_shared_layout.js','US_SHARED_LAYOUT']];
check('3 兩份配置在（腳本照 const 名字讀）', lays.every(([f,c])=>ex(f)&&fs.readFileSync(R(f),'utf8').includes('const '+c+'=')), JSON.stringify(lays.filter(([f])=>!ex(f)).map(q=>q[0])));
const LB='tools/blender/env_second/lightbake/', tools=['bake_us.sh','bake_room.py','glb_split_node.py','glb_partition_at.py','rebuild_us_rooms.sh'].map(f=>LB+f), rb=ex(LB+'rebuild_us_rooms.sh')?fs.readFileSync(R(LB+'rebuild_us_rooms.sh'),'utf8'):'';
const rbOK=/bake_us\.sh/.test(rb)&&/glb_split_node\.py[^\n]*--node WALL_bath_n_door --axis x --cut 3\.1 --name WALL_bath_n_door_e/.test(rb)&&/glb_partition_at\.py/.test(rb)&&/apartment\) NAME=us_apartment/.test(rb)&&/shared\) NAME=us_shared/.test(rb);
check('4 工具都在；rebuild 對公寓切門板、兩間都跑 partition', tools.every(ex)&&rbOK, `不在的 ${JSON.stringify(tools.filter(f=>!ex(f)))}；rebuild ${rbOK?'對':'不對或沒有'}`);
const g=fs.readFileSync(R('assets/models/env/second_ai/us_apartment.glb')), J=JSON.parse(g.slice(20,20+g.readUInt32LE(12)).toString('utf8')), names=new Set(J.nodes.map(n=>n.name));
const doorSep=/ob\.name == 'door213'/.test(src);
check('5 部署中的公寓有 WALL_bath_n_door_e、door213 自己一個節點；腳本也是這樣做（不併進 usa_door）', names.has('WALL_bath_n_door_e')&&names.has('door213')&&doorSep, `GLB：切門板 ${names.has('WALL_bath_n_door_e')}、door213 ${names.has('door213')}；腳本 door213 分開 ${doorSep}`);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
