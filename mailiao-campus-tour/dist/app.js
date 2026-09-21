import * as maplibregl from './vendor/maplibre-gl.mjs';

maplibregl.setWorkerUrl(new URL('./vendor/maplibre-gl-worker.mjs', import.meta.url).toString());

// Approximate drawing coordinates traced from the school's 115 academic-year plan.
// The four corners are tied to the OpenStreetMap school boundary.
const corners = {
  nw: [120.2507049, 23.7600158], ne: [120.2522498, 23.7600649],
  sw: [120.2512145, 23.7572909], se: [120.2527595, 23.7574038]
};
function point(x, y) {
  const u = (x - 110) / 1180;
  const v = (y - 120) / 1545;
  const top = [corners.nw[0] + u * (corners.ne[0] - corners.nw[0]), corners.nw[1] + u * (corners.ne[1] - corners.nw[1])];
  const bottom = [corners.sw[0] + u * (corners.se[0] - corners.sw[0]), corners.sw[1] + u * (corners.se[1] - corners.sw[1])];
  return [top[0] + v * (bottom[0] - top[0]), top[1] + v * (bottom[1] - top[1])];
}
const rect = (x1, y1, x2, y2) => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
const polygon = (pts) => [...pts.map(([x, y]) => point(x, y)), point(...pts[0])];
const line = (pts) => pts.map(([x, y]) => point(x, y));
const ellipse = (cx, cy, rx, ry, n = 48) => Array.from({ length: n }, (_, i) => [cx + Math.cos(2 * Math.PI * i / n) * rx, cy + Math.sin(2 * Math.PI * i / n) * ry]);
const featureCollection = (features) => ({ type: 'FeatureCollection', features });
const fillFeature = (coords, props = {}) => ({ type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [polygon(coords)] } });
const lineFeature = (coords, props = {}) => ({ type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: line(coords) } });

const places = [
  { id: 'zhishan', name: '至善樓', category: 'study', label: '行政與教學', description: '校長室、教務處、總務處、川堂及一般教室所在的主要校舍。', facts: ['1F 行政處室', '2–4F 教室'], center: [655, 1270], entry: 'zhishan', height: 15, priority: 1, footprints: [rect(315, 1192, 1000, 1265), rect(930, 1265, 1000, 1435)] },
  { id: 'qinxue', name: '勤學樓', category: 'study', label: '國中部教室', description: '一般教室、導師室、學務處及保健室分布於此。', facts: ['1F 學務處與保健室', '1–3F 教室'], center: [595, 650], entry: 'qinxue', height: 11, priority: 1, footprints: [rect(205, 610, 973, 683)] },
  { id: 'qunying', name: '群英樓', category: 'study', label: '圖書館與專科教室', description: '位於集合廣場東側；一樓設有圖書館，樓上有電腦教室與其他專科教室。', facts: ['1F 圖書館', '2–4F 專科教室'], center: [1138, 945], entry: 'qunying', height: 15, priority: 1, footprints: [rect(1015, 865, 1260, 1025)] },
  { id: 'yongqing', name: '永慶樓', category: 'study', label: '教學樓', description: '位於勤學樓東側的四層樓校舍，設有教室與體育辦公室。', facts: ['1F 體育辦公室', '1–4F 教室'], center: [1145, 655], entry: 'yongqing', height: 15, priority: 1, footprints: [rect(1030, 598, 1260, 725)] },
  { id: 'yucai', name: '育才館', category: 'study', label: '藝術與實驗教室', description: '音樂、美術、生科與理化等專科教室所在區域。', facts: ['1F 理化與烹飪', '2–3F 藝術教室'], center: [430, 965], entry: 'yucai', height: 11, priority: 2, footprints: [rect(330, 870, 535, 1070)] },
  { id: 'plaza', name: '集合廣場', category: 'life', label: '戶外集會空間', description: '位於群英樓與育才館之間，也在勤學樓與至善樓之間的開放廣場。', facts: ['中央廣場', '戶外集合'], center: [780, 960], entry: 'plaza', priority: 1, footprints: [] },
  { id: 'dunpin', name: '敦品樓', category: 'study', label: '專科與練習空間', description: '設有跆拳道練習室、科學教室及樂器室。', facts: ['跆拳道練習室', '科學教室'], center: [180, 965], entry: 'dunpin', height: 11, priority: 2, footprints: [rect(120, 875, 238, 1075)] },
  { id: 'field', name: '操場', category: 'sport', label: '田徑場', description: '校園北側的田徑操場，是體育課與校內活動的主要戶外場地。', facts: ['田徑跑道', '戶外空間'], center: [790, 423], entry: 'field', priority: 1, footprints: [] },
  { id: 'solar', name: '太陽光電球場', category: 'sport', label: '球場區', description: '操場北側的太陽光電球場；鄰近排球場與跆拳道訓練場。', facts: ['操場北側', '球場設施'], center: [635, 263], entry: 'solar', height: 6, priority: 2, footprints: [rect(390, 230, 900, 292)] },
  { id: 'pool', name: '游泳池', category: 'sport', label: '室內游泳池', description: '位於校區北端西側，緊鄰室內棒球練習場。', facts: ['北端西側', '室內設施'], center: [265, 158], entry: 'pool', height: 8, priority: 2, footprints: [rect(178, 130, 345, 185)] },
  { id: 'hall', name: '活動中心（文薈館）', category: 'life', label: '集會與活動', description: '位於校園東南側，供集會、展演與校內活動使用。', facts: ['集會活動', '東南側'], center: [1152, 1523], entry: 'hall', height: 10, priority: 1, footprints: [rect(1040, 1472, 1270, 1577)] },
  { id: 'dorm', name: '學生宿舍（新）', category: 'life', label: '住宿空間', description: '位於文薈館北側的學生宿舍。', facts: ['東南側', '住宿空間'], center: [1148, 1396], entry: 'dorm', height: 11, priority: 2, footprints: [rect(1040, 1355, 1270, 1445)] },
  { id: 'canteen', name: '餐廳', category: 'life', label: '用餐空間', description: '位於勤學樓西端，一樓為餐廳與廚房。', facts: ['勤學樓西端', '1F'], center: [165, 730], entry: 'canteen', height: 5, priority: 2, footprints: [rect(120, 700, 203, 768)] }
];
const placeMap = Object.fromEntries(places.map(p => [p.id, p]));
const categoryName = { study: '教學校舍', sport: '運動設施', life: '生活設施' };
const colors = { study: '#c57952', sport: '#52899a', life: '#9276a8' };

const graph = {
  main: [110, 1450], m1: [280, 1450], m2: [280, 1140], c: [700, 1140], n: [700, 800], plazaPath: [700, 960], plaza: [780, 960], f: [700, 550],
  fieldEast: [1000, 550], northEast: [1000, 800],
  r1: [280, 550], r2: [280, 465], rear: [110, 465], southEast: [1020, 1450], upperEast: [1020, 1140],
  zhishan: [625, 1390], qinxue: [610, 735], qunying: [1040, 1045], yongqing: [1050, 750], yucai: [545, 1015],
  dunpin: [242, 1010], field: [830, 520], solar: [650, 317], pool: [290, 195], hall: [1040, 1525],
  dorm: [1040, 1397], canteen: [206, 743], a: [625, 1450], b: [610, 800], d: [1050, 800],
  e: [700, 317], g: [290, 317], h: [280, 1010], j: [545, 800], k: [980, 1140], l: [1020, 1525],
  m: [1020, 1397], o: [206, 800], p: [280, 800]
};
const links = [
  ['main','m1'],['m1','m2'],['m2','c'],['c','plazaPath'],['plazaPath','n'],['plazaPath','plaza'],['n','northEast'],['northEast','fieldEast'],['fieldEast','f'],['f','r1'],['r1','r2'],['r2','rear'],
  ['m1','southEast'],['southEast','l'],['l','hall'],['southEast','m'],['m','dorm'],['m1','a'],['a','zhishan'],
  ['c','k'],['k','qunying'],['c','upperEast'],['upperEast','k'],['n','b'],['b','qinxue'],['n','d'],['d','yongqing'],
  ['n','j'],['j','yucai'],['m2','h'],['h','dunpin'],['n','p'],['p','h'],['p','o'],['o','canteen'],
  ['f','field'],['f','e'],['e','solar'],['e','g'],['g','pool']
];
const neighbors = Object.fromEntries(Object.keys(graph).map(k => [k, []]));
for (const [a, b] of links) {
  const weight = Math.hypot(graph[a][0] - graph[b][0], graph[a][1] - graph[b][1]);
  neighbors[a].push([b, weight]); neighbors[b].push([a, weight]);
}
function shortestPath(start, goal) {
  const dist = Object.fromEntries(Object.keys(graph).map(k => [k, Infinity]));
  const prev = {};
  const remaining = new Set(Object.keys(graph));
  dist[start] = 0;
  while (remaining.size) {
    let current = null;
    for (const node of remaining) if (current === null || dist[node] < dist[current]) current = node;
    if (current === goal || dist[current] === Infinity) break;
    remaining.delete(current);
    for (const [next, weight] of neighbors[current]) if (remaining.has(next) && dist[current] + weight < dist[next]) {
      dist[next] = dist[current] + weight; prev[next] = current;
    }
  }
  if (start !== goal && !prev[goal]) return [];
  const path = [goal];
  while (path[0] !== start) path.unshift(prev[path[0]]);
  return path.map(key => graph[key]);
}

const schoolOutline = [
  [120.2507049, 23.7600158], [120.2522498, 23.7600649], [120.2527595, 23.7574038],
  [120.2512145, 23.7572909], [120.2509838, 23.7588964], [120.2507049, 23.7600158]
];
const boundary = featureCollection([{ type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[schoolOutline] } }]);
const grounds = featureCollection([
  fillFeature(ellipse(780, 420, 395, 86), { color:'#b97c64', opacity:.95 }),
  fillFeature(ellipse(780, 420, 365, 61), { color:'#79a377', opacity:1 }),
  fillFeature(rect(545, 820, 1000, 1110), { color:'#a2b8bb', opacity:.88, placeId:'plaza' }),
  fillFeature(rect(395, 235, 895, 287), { color:'#e6a663', opacity:.78 }),
  fillFeature(rect(915, 235, 1040, 290), { color:'#8ca7a5', opacity:.8 }),
  fillFeature(rect(872, 145, 1274, 192), { color:'#84a5ae', opacity:.75 }),
  fillFeature(rect(178, 130, 345, 180), { color:'#75bbc4', opacity:.7 })
]);
const paths = featureCollection([
  lineFeature([[110,1450],[280,1450],[280,1140],[700,1140],[700,960],[700,800],[1000,800],[1000,550],[700,550],[280,550],[280,465],[110,465]]),
  lineFeature([[700,960],[780,960]]),
  lineFeature([[280,1450],[1020,1450],[1020,1525]]),
  lineFeature([[700,1140],[980,1140],[1020,1140]]),
  lineFeature([[280,800],[700,800],[1050,800]]),
  lineFeature([[700,550],[830,520]]),
  lineFeature([[700,550],[700,317],[290,317]])
]);
const buildings = featureCollection(places.flatMap((p, index) => p.footprints.map((footprint, piece) => ({
  type:'Feature', id: index * 10 + piece + 1,
  properties:{ placeId:p.id, color:colors[p.category], height:p.height, base:0 },
  geometry:{ type:'Polygon', coordinates:[polygon(footprint)] }
}))));

const $ = selector => document.querySelector(selector);
const sidebar = $('#sidebar');
const placesList = $('#places-list');
const destinationSelect = $('#destination-select');
const startSelect = $('#start-select');
const detail = $('#detail-card');
const mapElement = $('#map');
const markers = new Map();
let selectedId = null;
let activeFilter = 'all';
let satelliteMode = false;
let is3D = true;
let mapReady = false;

for (const p of places) destinationSelect.add(new Option(p.name, p.id));
$('#places-count').textContent = `${places.length} 個地點`;

function renderList() {
  placesList.replaceChildren();
  places.filter(p => activeFilter === 'all' || p.category === activeFilter).forEach((p, i) => {
    const item = document.createElement('button');
    item.type = 'button'; item.className = 'place-item' + (selectedId === p.id ? ' active' : '');
    item.dataset.category = p.category;
    item.innerHTML = `<span class="place-number">${String(i + 1).padStart(2,'0')}</span><span class="place-copy"><strong>${p.name}</strong><small>${p.label}</small></span><span class="place-arrow" aria-hidden="true">›</span>`;
    item.addEventListener('click', () => selectPlace(p.id));
    placesList.append(item);
  });
  for (const [id, marker] of markers) {
    const p = placeMap[id];
    marker.getElement().hidden = activeFilter !== 'all' && p.category !== activeFilter;
  }
}
renderList();

function routeGeoJSON(coords) {
  return featureCollection(coords.length ? [{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:line(coords) } }] : []);
}
function routeNodesGeoJSON(coords) {
  return featureCollection(coords.length ? [coords[0], coords[coords.length-1]].map((xy, i) => ({
    type:'Feature', properties:{ kind:i === 0 ? 'start' : 'end' }, geometry:{ type:'Point', coordinates:point(...xy) }
  })) : []);
}
function updateRoute() {
  if (!mapReady || !selectedId) return;
  const route = shortestPath(startSelect.value, placeMap[selectedId].entry);
  map.getSource('route').setData(routeGeoJSON(route));
  map.getSource('route-nodes').setData(routeNodesGeoJSON(route));
  $('#detail-route').firstChild.textContent = `從${startSelect.value === 'main' ? '大門' : '後門'}出發的示意路線 `;
}
function selectPlace(id, fly = true) {
  const p = placeMap[id];
  if (!p) return;
  selectedId = id;
  destinationSelect.value = id;
  $('#detail-kicker').textContent = categoryName[p.category] + ' · ' + p.label;
  $('#detail-title').textContent = p.name;
  $('#detail-description').textContent = p.description;
  $('#detail-facts').replaceChildren(...p.facts.map(f => { const span = document.createElement('span'); span.textContent = f; return span; }));
  detail.hidden = false;
  $('.view-title strong').textContent = p.name;
  renderList();
  for (const [markerId, marker] of markers) marker.getElement().classList.toggle('active', markerId === id);
  if (mapReady) {
    map.setPaintProperty('buildings-3d','fill-extrusion-color',['case',['==',['get','placeId'],id],'#f4b564',['get','color']]);
    updateRoute();
    if (fly) map.easeTo({ center:point(...p.center), zoom:Math.max(18, map.getZoom()), duration:850, essential:true, offset:window.innerWidth > 720 ? [145,0] : [0,-75] });
  }
  closeMobileMenu();
}
function clearPlace() {
  selectedId = null; detail.hidden = true; destinationSelect.value = '';
  $('.view-title strong').textContent = '校園全覽';
  if (mapReady) {
    map.getSource('route').setData(routeGeoJSON([])); map.getSource('route-nodes').setData(routeNodesGeoJSON([]));
    map.setPaintProperty('buildings-3d','fill-extrusion-color',['get','color']);
  }
  for (const marker of markers.values()) marker.getElement().classList.remove('active');
  renderList();
}

const map = new maplibregl.Map({
  container:'map',
  style:{ version:8, sources:{}, layers:[{ id:'background', type:'background', paint:{'background-color':'#dce7e2'} }] },
  center:[120.25178,23.75860], zoom:17.3, pitch:48, bearing:-13, maxPitch:60,
  minZoom:15.6, maxZoom:20.5,
  canvasContextAttributes:{antialias:true}, attributionControl:false
});

map.on('load', () => {
  mapReady = true;
  map.addSource('satellite',{ type:'raster', tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize:256, maxzoom:17, attribution:'Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community' });
  map.addLayer({ id:'satellite-layer', type:'raster', source:'satellite', layout:{visibility:'none'}, paint:{'raster-opacity':.92} });
  map.addSource('school', {type:'geojson',data:boundary});
  map.addLayer({id:'school-ground',type:'fill',source:'school',paint:{'fill-color':'#e9eee5','fill-opacity':.95}});
  map.addSource('grounds',{type:'geojson',data:grounds});
  map.addLayer({id:'grounds-fill',type:'fill',source:'grounds',paint:{'fill-color':['get','color'],'fill-opacity':['get','opacity']}});
  map.addSource('paths',{type:'geojson',data:paths});
  map.addLayer({id:'walkways',type:'line',source:'paths',paint:{'line-color':'#fffdf5','line-width':7,'line-opacity':.94},layout:{'line-cap':'round','line-join':'round'}});
  map.addLayer({id:'walkways-inner',type:'line',source:'paths',paint:{'line-color':'#d1bd9e','line-width':2,'line-opacity':.65},layout:{'line-cap':'round','line-join':'round'}});
  map.addSource('buildings',{type:'geojson',data:buildings});
  map.addLayer({id:'building-shadow',type:'fill',source:'buildings',paint:{'fill-color':'#527071','fill-opacity':.16}});
  map.addLayer({id:'buildings-3d',type:'fill-extrusion',source:'buildings',paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':.96}});
  map.addSource('route',{type:'geojson',data:routeGeoJSON([])});
  map.addLayer({id:'route-outline',type:'line',source:'route',paint:{'line-color':'#fff','line-width':10,'line-opacity':.94},layout:{'line-cap':'round','line-join':'round'}});
  map.addLayer({id:'route-line',type:'line',source:'route',paint:{'line-color':'#ec8542','line-width':5,'line-opacity':1},layout:{'line-cap':'round','line-join':'round'}});
  map.addSource('route-nodes',{type:'geojson',data:routeNodesGeoJSON([])});
  map.addLayer({id:'route-endpoints',type:'circle',source:'route-nodes',paint:{'circle-radius':8,'circle-color':['case',['==',['get','kind'],'start'],'#1d7888','#ed8240'],'circle-stroke-color':'#fff','circle-stroke-width':3}});
  map.addLayer({id:'school-outline',type:'line',source:'school',paint:{'line-color':'#2c6973','line-width':2,'line-opacity':.65}});

  for (const p of places) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'campus-marker' + (p.priority === 2 ? ' low-priority' : '');
    el.dataset.category = p.category; el.textContent = p.name; el.setAttribute('aria-label',`查看${p.name}`);
    el.addEventListener('click', event => { event.stopPropagation(); selectPlace(p.id); });
    const marker = new maplibregl.Marker({element:el,anchor:'bottom',offset:[0,-4]}).setLngLat(point(...p.center)).addTo(map);
    markers.set(p.id,marker);
  }
  for (const [name, xy] of [['大門',[110,1450]],['後門',[110,465]]]) {
    const el = document.createElement('div'); el.className = 'campus-marker gate'; el.textContent = name;
    new maplibregl.Marker({element:el,anchor:'bottom',offset:[0,-4]}).setLngLat(point(...xy)).addTo(map);
  }
  map.on('click','buildings-3d',event => { const id = event.features?.[0]?.properties?.placeId; if (id) selectPlace(id); });
  map.on('click','grounds-fill',event => { const id = event.features?.[0]?.properties?.placeId; if (id) selectPlace(id); });
  map.on('mouseenter','buildings-3d',() => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave','buildings-3d',() => { map.getCanvas().style.cursor = ''; });
  map.on('rotate',() => { $('.compass i').style.transform = `rotate(${-map.getBearing()}deg)`; });
  renderList();
});
map.on('error', e => { console.warn('Map layer error:', e.error?.message || e); });

$('#route-button').addEventListener('click',() => { if (destinationSelect.value) selectPlace(destinationSelect.value); else destinationSelect.focus(); });
destinationSelect.addEventListener('change',() => { if (destinationSelect.value) selectPlace(destinationSelect.value); else clearPlace(); });
startSelect.addEventListener('change',updateRoute);
$('#detail-route').addEventListener('click',() => { updateRoute(); if (selectedId) map.easeTo({center:point(...placeMap[selectedId].center),zoom:Math.max(18,map.getZoom()),duration:500}); });
$('#detail-close').addEventListener('click',clearPlace);
$('.place-filters').addEventListener('click',event => {
  const button = event.target.closest('button[data-filter]'); if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(el => { const active = el === button; el.classList.toggle('active',active); el.setAttribute('aria-pressed',String(active)); });
  renderList();
});
$('#model-button').addEventListener('click',() => setSatellite(false));
$('#satellite-button').addEventListener('click',() => setSatellite(true));
function setSatellite(value) {
  satelliteMode = value;
  if (mapReady) {
    map.setLayoutProperty('satellite-layer','visibility',value ? 'visible' : 'none');
    map.setPaintProperty('school-ground','fill-opacity',value ? .13 : .95);
    map.setPaintProperty('grounds-fill','fill-opacity',value ? .24 : ['get','opacity']);
    map.setPaintProperty('walkways','line-opacity',value ? .25 : .94);
    map.setPaintProperty('walkways-inner','line-opacity',value ? .12 : .65);
    map.setPaintProperty('buildings-3d','fill-extrusion-opacity',value ? .82 : .96);
  }
  for (const [id, button] of [['model-button',$('#model-button')],['satellite-button',$('#satellite-button')]]) {
    const active = (id === 'satellite-button') === value;
    button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active));
  }
}
$('#zoom-in').addEventListener('click',() => map.zoomIn({duration:350}));
$('#zoom-out').addEventListener('click',() => map.zoomOut({duration:350}));
$('#tilt-button').addEventListener('click',() => { is3D = !is3D; map.easeTo({pitch:is3D ? 48 : 0,duration:650}); $('#tilt-button').textContent = is3D ? '3D' : '2D'; });
$('#reset-button').addEventListener('click',() => { clearPlace(); map.easeTo({center:[120.25178,23.75860],zoom:17.3,pitch:is3D ? 48 : 0,bearing:-13,duration:850}); });

const sourcesDialog = $('#sources-dialog');
$('#sources-button').addEventListener('click',() => { closeMobileMenu(); sourcesDialog.showModal(); });
$('#sources-close').addEventListener('click',() => sourcesDialog.close());
sourcesDialog.addEventListener('click',event => { if (event.target === sourcesDialog) sourcesDialog.close(); });
function closeMobileMenu() { sidebar.classList.remove('open'); $('#mobile-scrim').hidden = true; $('#menu-button').setAttribute('aria-expanded','false'); }
$('#menu-button').addEventListener('click',() => { const open = !sidebar.classList.contains('open'); sidebar.classList.toggle('open',open); $('#mobile-scrim').hidden = !open; $('#menu-button').setAttribute('aria-expanded',String(open)); });
$('#mobile-scrim').addEventListener('click',closeMobileMenu);
window.addEventListener('keydown',event => { if (event.key === 'Escape') closeMobileMenu(); });
