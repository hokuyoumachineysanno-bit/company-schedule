const $=id=>document.getElementById(id);
const KEY='companyPortalV06';
const seed={employees:[{id:'EMP-001',name:'社長',role:'社長',active:true,attendance:true,start:'08:00',end:'17:00',order:1},{id:'EMP-002',name:'専務',role:'専務',active:true,attendance:true,start:'08:00',end:'17:00',order:2},{id:'EMP-003',name:'山田',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:3},{id:'EMP-004',name:'佐藤',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:4},{id:'EMP-005',name:'鈴木',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:5}],vehicles:[{id:'CAR-001',name:'ハイエース①',type:'ハイエース',number:'富山100 あ 1234',active:true,note:''},{id:'CAR-002',name:'ハイエース②',type:'ハイエース',number:'富山100 あ 5678',active:true,note:''},{id:'CAR-003',name:'プロボックス',type:'プロボックス',number:'富山500 い 1111',active:true,note:''}],customers:[{id:'CUS-001',name:'○○食品株式会社',short:'○○食品',address:'富山県',contact:'田中様',phone:'',active:true},{id:'CUS-002',name:'△△食品株式会社',short:'△△食品',address:'石川県',contact:'佐々木様',phone:'',active:true}],projects:[{id:'PJ-2026-0042',customerId:'CUS-001',name:'コンベア改造',status:'受注',start:'2026-09-09',deadline:'2026-11-20',hours:120,people:2,ownerId:'EMP-003',note:'現調→設計→製作→現地工事'},{id:'PJ-2026-0048',customerId:'CUS-002',name:'洗浄機更新',status:'見積中',start:'2026-09-15',deadline:'2026-12-10',hours:240,people:3,ownerId:'EMP-002',note:'メーカー実機検証あり'}],tasks:[{id:'A',date:'2026-09-09',name:'現調',type:'現調',projectId:'PJ-2026-0042',employeeId:'EMP-001',vehicleId:'',start:'08:00',end:'10:00',status:'confirmed'},{id:'B',date:'2026-09-09',name:'社内打合せ',type:'その他',projectId:'',employeeId:'EMP-001',vehicleId:'',start:'11:00',end:'12:00',status:'pending'},{id:'C',date:'2026-09-09',name:'商談',type:'商談',projectId:'PJ-2026-0048',employeeId:'EMP-001',vehicleId:'',start:'13:00',end:'15:00',status:'confirmed'},{id:'D',date:'2026-09-09',name:'客先修理',type:'客先修理',projectId:'',employeeId:'EMP-002',vehicleId:'CAR-001',start:'08:30',end:'12:00',status:'confirmed'},{id:'E',date:'2026-09-09',name:'見積作成',type:'見積',projectId:'PJ-2026-0048',employeeId:'EMP-002',vehicleId:'',start:'13:00',end:'16:00',status:'provisional'},{id:'F',date:'2026-09-09',name:'架台組立',type:'社内製作',projectId:'PJ-2026-0042',employeeId:'EMP-003',vehicleId:'',start:'09:00',end:'12:00',status:'confirmed'}],holidays:[{id:'H1',date:'2026-09-13',type:'statutory',name:'法定休日'},{id:'H2',date:'2026-09-19',type:'company',name:'所定休日'},{id:'H3',date:'2026-09-20',type:'statutory',name:'法定休日'}],attendance:[{employeeId:'EMP-001',date:'2026-09-09',type:'出勤',work:8.5,overtime:.5,paidLeave:0},{employeeId:'EMP-002',date:'2026-09-09',type:'出勤',work:9,overtime:1,paidLeave:0},{employeeId:'EMP-003',date:'2026-09-09',type:'出勤',work:8,overtime:0,paidLeave:0},{employeeId:'EMP-004',date:'2026-09-09',type:'有休',work:0,overtime:0,paidLeave:1},{employeeId:'EMP-005',date:'2026-09-09',type:'出勤',work:8,overtime:0,paidLeave:0}],attendanceSummary:[{employeeId:'EMP-001',annualHolidays:110,holidaysTaken:71,paidLeaveTaken:3,annualWork:1450,overtime:185,agreementPct:51},{employeeId:'EMP-002',annualHolidays:110,holidaysTaken:69,paidLeaveTaken:2,annualWork:1510,overtime:218,agreementPct:61},{employeeId:'EMP-003',annualHolidays:110,holidaysTaken:75,paidLeaveTaken:4,annualWork:1420,overtime:146,agreementPct:41},{employeeId:'EMP-004',annualHolidays:110,holidaysTaken:78,paidLeaveTaken:5,annualWork:1390,overtime:98,agreementPct:27},{employeeId:'EMP-005',annualHolidays:110,holidaysTaken:80,paidLeaveTaken:3,annualWork:1370,overtime:86,agreementPct:24}]};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||JSON.parse(JSON.stringify(seed));

localStorage.setItem(KEY,JSON.stringify(db));db.tasks.forEach(t=>{if(t.status==='unassigned')t.status='pending';if(!Array.isArray(t.passengerIds))t.passengerIds=[];if(!t.category)t.category=(['設計','見積','社内製作','段取り','整備'].includes(t.type)?'社内案件':'客先案件');if(typeof t.urgent!=='boolean')t.urgent=false;if(!Array.isArray(t.history))t.history=[];});db.projects.forEach(p=>{const m={'引合':'情報','見積中':'商談中','進行中':'施工中','保留':'商談中','完了':'検収済'};p.status=m[p.status]||p.status;if(!Array.isArray(p.history))p.history=[];});
function applyTimeSnapshotToPortal(){
  let cache=null;
  try{
    cache=JSON.parse(localStorage.getItem('hokuyou.portal.attendance.cache.v1')||'null');
  }catch(e){
    console.warn('TIMEキャッシュ読込失敗',e);
  }
  if(!cache)return false;

  db.attendance=(cache.attendance||[]).map(x=>({...x}));
  db.companyCalendar=(cache.calendar||[]).map(x=>({...x}));
  db.timeSnapshotUpdatedAt=cache.exportedAt||null;

  // TIME暦をポータル休日表示へ変換
  if(Array.isArray(cache.calendar) && cache.calendar.length){
    db.holidays=cache.calendar
      .filter(x=>/法定休日|所定休日|会社休業日/.test(x.type||''))
      .map((x,i)=>({
        id:x.id||`TIME-CAL-${x.date}-${i}`,
        date:x.date,
        type:(x.type||'').includes('法定')?'statutory':'company',
        name:x.name||x.type
      }));
  }

  localStorage.setItem(KEY,JSON.stringify(db));
  return true;
}

window.addEventListener('hokuyou-time-snapshot-imported',()=>{
  if(applyTimeSnapshotToPortal()){
    try{renderAll()}catch(e){console.warn('TIME反映後の再描画失敗',e)}
  }
});

window.addEventListener('pageshow',()=>{
  if(applyTimeSnapshotToPortal()){
    try{renderAll()}catch(e){console.warn('pageshow再描画失敗',e)}
  }
});

applyTimeSnapshotToPortal();

let currentDay='2026-09-09',currentMonth='2026-09',masterType='employees',dayRange='all';
const save=()=>{localStorage.setItem(KEY,JSON.stringify(db));};
const emp=id=>db.employees.find(x=>x.id===id),veh=id=>db.vehicles.find(x=>x.id===id),cust=id=>db.customers.find(x=>x.id===id),proj=id=>db.projects.find(x=>x.id===id);
const isProjectArchived=p=>['検収済','アフター','完了'].includes(p?.status);
const activeProjects=()=>db.projects.filter(p=>!isProjectArchived(p));
const archivedProjects=()=>db.projects.filter(isProjectArchived);

const empName=id=>emp(id)?.name||'未割当',vehName=id=>veh(id)?.name||'-',custName=id=>cust(id)?.name||'',activeEmployees=()=>db.employees.filter(x=>x.active).sort((a,b)=>a.order-b.order);
const projectLabel=id=>{const p=proj(id);return p?`${p.id} ${cust(p.customerId)?.short||custName(p.customerId)} ${p.name}`:'社内'};
const statusText=s=>({confirmed:'確定',pending:'ペンディング',provisional:'仮予定'})[s]||s,statusBadge=s=>s==='confirmed'?'bc':s==='pending'?'bp':'bv';
const taskClass=t=>{
  const base=t.category==='社内案件'?'cat-internal':t.category==='その他'?'cat-other':'cat-client';
  const state=t.status==='provisional'?' is-provisional':t.status==='pending'?' is-pending':'';
  return base+state;
};
const timeNum=t=>{const[a,b]=t.split(':').map(Number);return a+b/60};
const timeOverlap=(aStart,aEnd,bStart,bEnd)=>timeNum(aStart)<timeNum(bEnd)&&timeNum(bStart)<timeNum(aEnd);
function calcEndTime(start,plannedHours){
 if(!start)return '';
 const mins=Math.round(timeNum(start)*60+(+plannedHours||0)*60);
 if(mins>1440)return '';
 const h=Math.floor(mins/60),m=mins%60;
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function taskEnd(t){return t.end||calcEndTime(t.start,t.plannedHours)}
db.tasks.forEach(t=>{
 if(t.status==='unassigned')t.status='pending';
 if(t.plannedHours==null){
  const s=timeNum(t.start),e=timeNum(t.end);
  t.plannedHours=(Number.isFinite(s)&&Number.isFinite(e)&&e>s)?Math.max(.25,Math.round((e-s)*4)/4):1;
 }
});

function normalizeClientText(v){
 return String(v||'').toLowerCase().replace(/\s+/g,'').replace(/[　,，.。・\-_/\\]/g,'');
}
function taskCustomerId(t){
 const p=proj(t.projectId);
 return p?.customerId||'';
}
function sameClientTask(a,b){
 const ca=taskCustomerId(a),cb=taskCustomerId(b);
 if(ca&&cb)return ca===cb;
 const sa=normalizeClientText(a.clientSite),sb=normalizeClientText(b.clientSite);
 return !!sa&&!!sb&&(sa===sb||sa.includes(sb)||sb.includes(sa));
}
function nextVisitGroupId(){
 let max=0;
 (db.tasks||[]).forEach(t=>{
  const m=String(t.visitGroupId||'').match(/^V(\d+)$/);
  if(m)max=Math.max(max,+m[1]);
 });
 return 'V'+String(max+1).padStart(3,'0');
}
function findMainAssigneeConflict(candidate,editingId=''){
 if(candidate.status==='pending'||!candidate.date||!candidate.start||!candidate.end)return null;
 return (db.tasks||[]).find(t=>
   t.id!==editingId &&
   t.status==='confirmed' &&
   t.date===candidate.date &&
   t.employeeId===candidate.employeeId &&
   t.start && (t.end||calcEndTime?.(t.start,t.plannedHours)) &&
   timeOverlap(candidate.start,candidate.end,t.start,(t.end||calcEndTime?.(t.start,t.plannedHours)))
 );
}

const taskHours=t=>Math.max(0,timeNum(t.end)-timeNum(t.start));
const participants=t=>t.type==='移動'?[t.employeeId,...(t.passengerIds||[])].filter((x,i,a)=>x&&a.indexOf(x)===i):[t.employeeId];
const travelStats=items=>{const travel=items.filter(t=>t.type==='移動'),work=items.filter(t=>t.type!=='移動');const travelPerson=travel.reduce((s,t)=>s+taskHours(t)*participants(t).length,0),vehicleHours=travel.reduce((s,t)=>s+taskHours(t),0),workHours=work.reduce((s,t)=>s+taskHours(t),0),total=travelPerson+workHours;return{travelPerson,vehicleHours,workHours,total,ratio:total?travelPerson/total*100:0}};
const fmtH=n=>`${Math.round(n*10)/10}h`;
const parseYMD=date=>{const[y,m,d]=date.split('-').map(Number);return{y,m,d}};
const ymd=(y,m,d)=>`${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const addDays=(date,n)=>{const p=parseYMD(date),dt=new Date(Date.UTC(p.y,p.m-1,p.d+n));return ymd(dt.getUTCFullYear(),dt.getUTCMonth()+1,dt.getUTCDate())};
const dateLabel=date=>{const p=parseYMD(date),dt=new Date(Date.UTC(p.y,p.m-1,p.d)),w=['日','月','火','水','木','金','土'][dt.getUTCDay()];return`${p.y}年${p.m}月${p.d}日（${w}）`};
const syncMonthToDay=()=>{currentMonth=currentDay.slice(0,7)};
const holidayFor=date=>db.holidays.filter(h=>h.date===date);
const attendanceFor=(employeeId,date)=>db.attendance.find(a=>a.employeeId===employeeId&&a.date===date);
const nextTaskId=()=>{
  let max=0;
  (db.tasks||[]).forEach(t=>{
    const m=String(t.id||'').match(/^T(\d+)$/i);
    if(m)max=Math.max(max,+m[1]);
  });
  return 'T'+String(max+1).padStart(3,'0');
};
const timeOptions=s=>{let o='';for(let h=0;h<24;h++)for(let m of [0,30]){const t=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');o+=`<option ${t===s?'selected':''}>${t}</option>`}return o};
const timeBands=(start,end)=>{const span=end-start,defs=[[0,5,'deep'],[5,8.5,'early'],[8.5,17.5,'normal'],[17.5,22,'night'],[22,24,'deep']];return defs.map(([a,b,c])=>{const x=Math.max(a,start),y=Math.min(b,end);if(y<=x)return'';return`<div class="timeband ${c}" style="left:${(x-start)/span*100}%;width:${(y-x)/span*100}%"></div>`}).join('')};
function showView(name){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===name));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('hidden',x.id!==name))}
let modalSaveHandler=null;function openModal(title,html,onSave){$('modalTitle').textContent=title;$('modalBody').innerHTML=html;$('modal').classList.remove('hidden');modalSaveHandler=onSave;setTimeout(()=>$('modalBody').querySelector('input,select,textarea')?.focus(),40)}function closeModal(){$('modal').classList.add('hidden');modalSaveHandler=null}document.querySelectorAll('[data-modal-close]').forEach(x=>x.onclick=closeModal);$('modalCancel').onclick=closeModal;$('modalSave').onclick=()=>modalSaveHandler&&modalSaveHandler();
function renderSummary(){const p=db.tasks.filter(t=>t.status==='pending').length,v=db.tasks.filter(t=>t.status==='provisional').length;$('summary').innerHTML=`<div class=card>進行案件<br><b>${db.projects.filter(p=>p.status!=='完了').length}</b></div><div class=card>社員<br><b>${db.employees.filter(x=>x.active).length}</b></div><div class=card>車両<br><b>${db.vehicles.filter(x=>x.active).length}</b></div><div class=card>顧客<br><b>${db.customers.filter(x=>x.active).length}</b></div><div class=card>確認待ち<br><b style="color:#ef4444">${p}</b></div><div class=card>仮予定<br><b style="color:#f59e0b">${v}</b></div>`}
function renderDashboard(){const upcoming=db.projects.filter(p=>p.status!=='完了').sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5);$('dashboard').innerHTML=`<div class=fieldtest-note><b>実機テスト版</b>：予定・勤怠・会社カレンダー・社員マスタは同じブラウザデータを参照しています。まず1週間、入力負担と見え方を確認してください。</div><div class=grid3><div class=panel><h3>予定の完成度</h3><b style="font-size:30px">${db.tasks.length?Math.round(db.tasks.filter(t=>t.status==='confirmed').length/db.tasks.length*100):100}%</b><p class=small>点滅している予定を前週までに消す。</p></div><div class=panel><h3>未確定</h3><p>ペンディング ${db.tasks.filter(t=>t.status==='pending').length}件 / 仮 ${db.tasks.filter(t=>t.status==='provisional').length}件</p></div><div class=panel><h3>共通マスタ</h3><p>社員 ${db.employees.length} / 車両 ${db.vehicles.length} / 顧客 ${db.customers.length}</p></div></div><div class=panel><h3>直近案件</h3><div class=tablewrap><table><tr><th>案件</th><th>顧客</th><th>納期</th><th>工数</th><th>主担当</th></tr>${upcoming.map(p=>`<tr><td>${p.id}<br><b>${p.name}</b></td><td>${custName(p.customerId)}</td><td>${p.deadline}</td><td>${p.hours}h</td><td>${empName(p.ownerId)}</td></tr>`).join('')}</table></div></div>`}
function projectModal(p){const isEdit=!!p,p0=p||{id:'PJ-2026-'+String(49+db.projects.length).padStart(4,'0'),customerId:db.customers.find(x=>x.active)?.id||'',name:'',status:'受注',start:currentDay,deadline:addDays(currentDay,30),hours:80,people:2,ownerId:activeEmployees()[0]?.id||'',note:''};openModal(isEdit?'案件編集':'案件追加',`<div class=form><div><label>案件ID</label><input id=mpId value="${p0.id}"></div><div><label>状態</label><select id=mpStatus>${['情報','アプローチ','商談中','見積提出','受注','施工中','検収待ち','検収済','アフター','完了'].map(x=>`<option ${x===p0.status?'selected':''}>${x}</option>`).join('')}</select></div><div><label>顧客</label><select id=mpCustomer>${db.customers.filter(x=>x.active||x.id===p0.customerId).map(x=>`<option value="${x.id}" ${x.id===p0.customerId?'selected':''}>${x.name}</option>`).join('')}</select></div><div><label>案件名</label><input id=mpName value="${p0.name}"></div><div><label>施工予定日</label><input id=mpStart type=date value="${p0.start}"></div><div><label>納期</label><input id=mpDeadline type=date value="${p0.deadline}"></div><div><label>予定工数</label><input id=mpHours type=number value="${p0.hours}"></div><div><label>必要人員</label><input id=mpPeople type=number value="${p0.people}"></div><div><label>主担当</label><select id=mpOwner>${activeEmployees().map(e=>`<option value="${e.id}" ${e.id===p0.ownerId?'selected':''}>${e.name}</option>`).join('')}</select></div><div><label>備考</label><textarea id=mpNote>${p0.note||''}</textarea></div></div>`,()=>{const n={id:$('mpId').value.trim(),status:$('mpStatus').value,customerId:$('mpCustomer').value,name:$('mpName').value.trim(),start:$('mpStart').value,deadline:$('mpDeadline').value,hours:+$('mpHours').value||0,people:+$('mpPeople').value||1,ownerId:$('mpOwner').value,note:$('mpNote').value.trim()};if(!n.id||!n.name)return alert('案件IDと案件名は必須です');if(isEdit){const old=p.id,idx=db.projects.findIndex(x=>x.id===old);db.projects[idx]=n;db.tasks.forEach(t=>{if(t.projectId===old)t.projectId=n.id})}else{if(db.projects.some(x=>x.id===n.id))return alert('案件IDが重複しています');db.projects.push(n)}save();closeModal();renderAll();showView('projects')})}
function renderProjects(){$('projects').innerHTML=`<div class=panel><div class=daynav><h3>案件台帳</h3><button id=addProject class=primary>＋案件追加</button></div>${db.projects.map(p=>`<div class=project-card><h4>${p.id}　${custName(p.customerId)}</h4><div><b>${p.name}</b> <span class="badge bblue">${p.status}</span></div><div class=small>${p.start} ～ ${p.deadline} / ${p.hours}h / ${p.people}名 / 主担当 ${empName(p.ownerId)}</div><div class=actions><button class=ghost data-pe="${p.id}">編集</button><button class=ghost data-po="${p.id}">この案件で予定</button><button class=danger data-pd="${p.id}">削除</button></div></div>`).join('')}</div>`;$('addProject').onclick=()=>projectModal(null);document.querySelectorAll('[data-pe]').forEach(b=>b.onclick=()=>projectModal(proj(b.dataset.pe)));document.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>{if(confirm('案件を削除しますか？')){db.projects=db.projects.filter(x=>x.id!==b.dataset.pd);save();renderAll();showView('projects')}});document.querySelectorAll('[data-po]').forEach(b=>b.onclick=()=>{currentDay=proj(b.dataset.po)?.start||currentDay;showView('day');renderDay();setTimeout(()=>taskModal(null,b.dataset.po),80)})}
function renderYear(){const ms=[7,8,9,10,11,12];$('year').innerHTML=`<div class=grid2><div class=panel><h3>年間案件</h3><div class=tablewrap><table><tr><th>案件</th>${ms.map(m=>`<th>${m}月</th>`).join('')}<th>納期</th></tr>${db.projects.map(p=>`<tr><td><b>${p.id}</b><br>${p.name}</td>${ms.map(m=>{const active=new Date(2026,m,0)>=new Date(p.start)&&new Date(`2026-${String(m).padStart(2,'0')}-01`)<=new Date(p.deadline);return`<td>${active?`<div class="pill confirmed">${p.status}<br>${p.hours}h/${p.people}名</div>`:''}${db.tasks.filter(t=>t.projectId===p.id&&+t.date.slice(5,7)===m).map(t=>`<div class="pill ${t.status}">${t.id} ${t.name}</div>`).join('')}</td>`}).join('')}<td>${p.deadline}</td></tr>`).join('')}</table></div></div><div class=panel><h3>年間労務</h3><div class=tablewrap><table><tr><th>社員</th><th>休日</th><th>有休</th><th>就労</th><th>時間外</th><th>36協定</th></tr>${db.attendanceSummary.map(x=>`<tr><td>${empName(x.employeeId)}</td><td>${x.holidaysTaken}/${x.annualHolidays}</td><td>${x.paidLeaveTaken}</td><td>${x.annualWork}h</td><td>${x.overtime}h</td><td>${x.agreementPct}%</td></tr>`).join('')}</table></div></div></div>`}
function renderQuarter(){$('quarter').innerHTML=[['Q3 7-9月',[7,8,9]],['Q4 10-12月',[10,11,12]]].map(([n,ms])=>`<div class=panel><h3>${n}</h3><div class=tablewrap><table><tr><th>案件</th><th>期間</th><th>工数</th><th>人員</th><th>主担当</th><th>未確定</th></tr>${db.projects.filter(p=>ms.some(m=>new Date(2026,m,0)>=new Date(p.start)&&new Date(`2026-${String(m).padStart(2,'0')}-01`)<=new Date(p.deadline))).map(p=>`<tr><td>${p.id}<br><b>${p.name}</b></td><td>${p.start}<br>～${p.deadline}</td><td>${p.hours}h</td><td>${p.people}名</td><td>${empName(p.ownerId)}</td><td>${db.tasks.filter(t=>t.projectId===p.id&&t.status!=='confirmed').length}</td></tr>`).join('')}</table></div></div>`).join('')}
function renderMonth(){const[y,m]=currentMonth.split('-').map(Number),last=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();let cells='';for(let i=0;i<first;i++)cells+='<div></div>';for(let d=1;d<=last;d++){const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,hs=db.holidays.filter(h=>h.date===date),ts=db.tasks.filter(t=>t.date===date),leave=db.attendance.filter(a=>a.date===date&&a.type!=='出勤'),cls=hs.some(h=>h.type==='statutory')?'holiday-bg holiday-statutory-cell':hs.some(h=>h.type==='company')?'company-bg holiday-company-cell':'';cells+=`<div class="daycell ${cls}" data-date="${date}"><div class=daynum>${d}</div>${hs.map(h=>`<div class="pill holiday-mark ${h.type==='statutory'?'holiday statutory-mark':'companyHoliday company-mark'}">${h.type==='statutory'?'法定休日':'所定休日'}</div>`).join('')}${leave.map(a=>`<div class="pill companyHoliday">${empName(a.employeeId)} ${a.type}</div>`).join('')}${ts.map(t=>`<div class="pill ${t.status}">${t.id} ${t.name}<br>${empName(t.employeeId)}</div>`).join('')}</div>`}$('month').innerHTML=`<div class=panel><div class=daynav><button id=mPrev class=ghost>←前月</button><div class=datebox>${y}年${m}月</div><button id=mNext class=ghost>翌月→</button></div><div class=calendar-scroll><div class=calendar-head>${['日','月','火','水','木','金','土'].map(x=>`<div>${x}</div>`).join('')}</div><div class=calendar>${cells}</div></div></div>`;$('mPrev').onclick=()=>{let d=new Date(currentMonth+'-01');d.setMonth(d.getMonth()-1);currentMonth=d.toISOString().slice(0,7);renderMonth()};$('mNext').onclick=()=>{let d=new Date(currentMonth+'-01');d.setMonth(d.getMonth()+1);currentMonth=d.toISOString().slice(0,7);renderMonth()};document.querySelectorAll('[data-date]').forEach(c=>c.onclick=()=>{currentDay=c.dataset.date;showView('day');renderDay()})}
function rangeDef(){
 if(dayRange==='am')return{s:0,e:12,h:Array.from({length:12},(_,i)=>i),cols:12};
 if(dayRange==='pm')return{s:12,e:24,h:Array.from({length:12},(_,i)=>i+12),cols:12};
 return{s:0,e:24,h:Array.from({length:24},(_,i)=>i),cols:24};
 $('month').insertAdjacentHTML('beforeend',pendingMiniPanel());bindOpenPending();
}
function taskModal(t,presetProject=''){
 const edit=!!t;
 const t0=t||{
   id:nextTaskId(),date:currentDay,name:'',category:'客先案件',
   projectId:presetProject,employeeId:activeEmployees()[0]?.id||'',
   vehicleId:'',start:'08:30',end:'17:30',status:'confirmed',
   urgent:false,passengerIds:[],history:[],clientSite:''
 };
 const cats=['客先案件','社内案件','その他'];

 openModal(edit?'タスク編集':'タスク追加',`
  <div class=task-kind>
   ${cats.map(k=>`<button type=button class="kindbtn ${t0.category===k?'active':''}" data-kind="${k}">${k}</button>`).join('')}
  </div>
  <input type=hidden id=mtCategory value="${t0.category||'客先案件'}">

  <div class=form>
   <div><label>日付（ペンディングは未定可）</label><input id=mtDate type=date value="${t0.date}"></div>
   <div><label>ID</label><input id=mtId value="${t0.id}" readonly></div>

   <div><label>案件</label>
    <select id=mtProject>
     <option value="">案件なし</option>
     ${db.projects.filter(p=>p.status!=='完了'||p.id===t0.projectId).map(p=>`<option value="${p.id}" ${p.id===t0.projectId?'selected':''}>${projectLabel(p.id)}</option>`).join('')}
    </select>
   </div>

   <div><label>内容</label><input id=mtName value="${t0.name||''}" placeholder="例：客先修理、据付工事、見積作成"></div>

   <div id=clientSiteWrap style="grid-column:1/-1;${(t0.category||'客先案件')==='客先案件'?'':'display:none'}">
    <label>客先名 / 所在地</label>
    <input id=mtClientSite value="${t0.clientSite||''}" placeholder="例：○○食品 富山工場 / 富山市○○">
   </div>

   <div><label>予定工数</label><input id=mtHours type=number min=.25 step=.25 value="${t0.plannedHours||2}"> <span class=small>h</span></div>
   <div><label>開始</label><input id=mtStart type=time step=900 value="${t0.start||''}"></div>
   <div><label>終了</label><input id=mtEnd type=time value="${taskEnd(t0)||''}" readonly></div>
   <div class="time-shift-controls" style="grid-column:1/-1">
    <button type=button id=shiftMinus class=ghost>−30分</button>
    <button type=button id=shiftPlus class=ghost>＋30分</button>
    <span class=small>スマホではこのボタンで配置を微調整できます。</span>
   </div>

   <div><label>主担当</label>
    <select id=mtEmployee>
     ${activeEmployees().map(x=>`<option value="${x.id}" ${x.id===t0.employeeId?'selected':''}>${x.name}</option>`).join('')}
    </select>
   </div>

   <div><label>車両</label>
    <select id=mtVehicle>
     <option value="">-</option>
     ${db.vehicles.filter(v=>v.active||v.id===t0.vehicleId).map(v=>`<option value="${v.id}" ${v.id===t0.vehicleId?'selected':''}>${v.name}</option>`).join('')}
    </select>
   </div>

   <div style="grid-column:1/-1"><label>補助</label>
    <div class=passenger-grid>
     ${activeEmployees().filter(x=>x.id!==t0.employeeId).map(x=>`<label><input type=checkbox data-helper="${x.id}" ${(t0.passengerIds||[]).includes(x.id)?'checked':''}>${x.name}</label>`).join('')}
    </div>
   </div>

   <div><label>状態</label>
    <select id=mtStatus>
     ${[
       ['confirmed','確定'],
       ['provisional','仮予定'],
       ['pending','ペンディング / 未割当']
     ].map(([v,l])=>`<option value="${v}" ${v===t0.status?'selected':''}>${l}</option>`).join('')}
    </select>
   </div>

   <div class=urgentbox>
    <input id=mtUrgent type=checkbox ${t0.urgent?'checked':''}> 🔴 緊急対応
   </div>
  </div>

  ${edit?`<div class=history>
    <b>変更履歴</b>
    ${(t0.history||[]).slice().reverse().map(h=>`<div class=history-item>${h.at||''}　${h.text}</div>`).join('')||'<div class=history-item>履歴なし</div>'}
  </div>`:''}
 `,()=>{
   const category=$('mtCategory').value;
   const n={
     ...t0,
     id:t0.id,
     date:$('mtDate').value,
     name:$('mtName').value.trim()||'未記入',
     category,
     type:category,
     projectId:$('mtProject').value,
     clientSite:category==='客先案件'?($('mtClientSite')?.value.trim()||''):'',
     employeeId:$('mtEmployee').value,
     vehicleId:$('mtVehicle').value,
     start:$('mtStart').value,
     plannedHours:+$('mtHours').value||0,
     end:calcEndTime($('mtStart').value,+$('mtHours').value||0),
     status:$('mtStatus').value,
     urgent:$('mtUrgent').checked,
     passengerIds:[...$('modalBody').querySelectorAll('[data-helper]:checked')].map(x=>x.dataset.helper)
   };

   if(n.status!=='pending'&&(!n.date||!n.start)){
     alert('確定・仮予定は日付と開始時刻を入力してください。');return;
   }
   if(n.plannedHours<=0){alert('予定工数を入力してください。');return;}
   if(n.status!=='pending'&&!n.end){alert('予定工数が24:00を超えています。');return;}

   const conflict=findMainAssigneeConflict(n,edit?t0.id:'');
   if(conflict){
     const conflictEnd=conflict.end||(typeof calcEndTime==='function'?calcEndTime(conflict.start,conflict.plannedHours):'');
     if(sameClientTask(n,conflict)){
       const ok=confirm(
         `主担当「${empName(n.employeeId)}」の時間が重複しています。\n\n`+
         `既存：${conflict.id} ${conflict.name}　${conflict.start}～${conflictEnd}\n`+
         `新規：${n.id} ${n.name}　${n.start}～${n.end}\n\n`+
         `同一客先と判定しました。\n同一訪問として重ねて登録しますか？`
       );
       if(!ok)return;
       const group=conflict.visitGroupId||nextVisitGroupId();
       conflict.visitGroupId=group;
       n.visitGroupId=group;
       conflict.history=[...(conflict.history||[]),{
         at:new Date().toLocaleString('ja-JP'),
         text:`${n.id} と同一訪問 ${group} に統合`
       }];
     }else{
       alert(
         `主担当「${empName(n.employeeId)}」の時間が重複しています。\n\n`+
         `重複タスク：${conflict.id} ${conflict.name}\n`+
         `${conflict.start} ～ ${conflictEnd}\n\n`+
         `客先が異なるため同時配置できません。時間をずらしてください。`
       );
       return;
     }
   }

   if(edit){
     n.history=[...(t0.history||[]),{
       at:new Date().toLocaleString('ja-JP'),
       text:'タスク内容を編集'
     }];
     const idx=db.tasks.findIndex(x=>x.id===t0.id);
     if(idx>=0)db.tasks[idx]=n;
   }else{
     db.tasks.push(n);
   }

   currentDay=n.date;
   save();
   closeModal();
   renderAll();
   showView('day');
 });

 document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{
   $('mtCategory').value=b.dataset.kind;
   document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));
   const wrap=$('clientSiteWrap');
   if(wrap)wrap.style.display=b.dataset.kind==='客先案件'?'block':'none';
 });

 const refreshEnd=()=>{if($('mtEnd'))$('mtEnd').value=calcEndTime($('mtStart').value,+$('mtHours').value||0)};
 $('mtStart')?.addEventListener('input',refreshEnd);$('mtHours')?.addEventListener('input',refreshEnd);
 const shift=mins=>{
  if(!$('mtStart').value)$('mtStart').value='08:30';
  let total=Math.round(timeNum($('mtStart').value)*60)+mins;
  total=Math.max(0,Math.min(1430,total));
  $('mtStart').value=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  refreshEnd();
 };
 if($('shiftMinus'))$('shiftMinus').onclick=()=>shift(-30);
 if($('shiftPlus'))$('shiftPlus').onclick=()=>shift(30);

 if(edit){
   const foot=$('modal').querySelector('.modalfoot');
   const row=document.createElement('div');
   row.className='task-action-row';
   row.innerHTML=`
    <button type=button id=postponeBtn class=postpone>日延べ</button>
    <button type=button id=pendingBtn class=pending2>ペンディング</button>
    <button type=button id=deleteTaskBtn class=danger2>削除</button>
   `;
   foot.prepend(row);

   $('postponeBtn').onclick=()=>postponeTask(t0);

   $('pendingBtn').onclick=()=>{
     const x=db.tasks.find(a=>a.id===t0.id);
     if(!x)return;
     x.status='pending';
     x.history=[...(x.history||[]),{
       at:new Date().toLocaleString('ja-JP'),
       text:'ペンディングへ変更'
     }];
     save();
     closeModal();
     renderAll();
     showView('day');
   };

   $('deleteTaskBtn').onclick=()=>{
     if(!confirm(`タスク ${t0.id}「${t0.name}」を削除しますか？`))return;
     db.tasks=db.tasks.filter(a=>a.id!==t0.id);
     save();
     closeModal();
     renderAll();
     showView('day');
   };
 }
}
function postponeTask(t){const urg=db.tasks.filter(x=>x.urgent&&x.id!==t.id);openModal('タスクを日延べ',`<div class=form><div><label>現在日</label><input value="${t.date}" disabled></div><div><label>移動先</label><input id=ppDate type=date value="${addDays(t.date,1)}"></div><div><label>理由</label><select id=ppReason><option>通常変更</option><option>客先都合</option><option>社内都合</option><option>前工程遅延</option><option>緊急対応による押出し</option></select></div><div><label>原因となった緊急タスク</label><select id=ppEmergency><option value="">-</option>${urg.map(x=>`<option value="${x.id}">${x.date} ${x.id} ${x.name}</option>`).join('')}</select></div></div>`,()=>{const x=db.tasks.find(a=>a.id===t.id),old=x.date,n=$('ppDate').value;if(!n)return;x.date=n;x.history=[...(x.history||[]),{at:new Date().toLocaleString('ja-JP'),text:`日延べ ${old} → ${n} / ${$('ppReason').value}${$('ppEmergency').value?' / 原因 '+$('ppEmergency').value:''}`}];x.postponeReason=$('ppReason').value;x.causedByEmergencyId=$('ppEmergency').value||'';save();currentDay=n;closeModal();renderAll();showView('day')})}

function pendingTasks(){
 return (db.tasks||[]).filter(t=>t.status==='pending').sort((a,b)=>
   (a.date||'9999-99-99').localeCompare(b.date||'9999-99-99') ||
   String(a.id).localeCompare(String(b.id))
 );
}
function pendingListHtml(limit=999){
 const rows=pendingTasks().slice(0,limit);
 if(!rows.length)return '<div class=small>ペンディングはありません。</div>';
 return `<div class=tablewrap><table>
  <tr><th>ID</th><th>内容</th><th>区分</th><th>案件</th><th>主担当</th><th>元予定日</th><th></th></tr>
  ${rows.map(t=>`<tr>
   <td>${t.id}</td>
   <td><b>${t.name}</b>${t.clientSite?`<br><span class=small>${t.clientSite}</span>`:''}</td>
   <td>${t.category||'-'}</td>
   <td>${projectLabel(t.projectId)}</td>
   <td>${empName(t.employeeId)}</td>
   <td>${t.date||'-'} ${t.start||''}</td>
   <td><button class=ghost data-pending-edit="${t.id}">編集</button></td>
  </tr>`).join('')}
 </table></div>`;
}
function bindPendingButtons(){
 document.querySelectorAll('[data-pending-edit]').forEach(b=>b.onclick=()=>{
   const t=db.tasks.find(x=>x.id===b.dataset.pendingEdit);
   if(t)taskModal(t);
 });
}
function pendingMiniPanel(title='ペンディング / 未割当'){
 const count=pendingTasks().length;
 return `<div class="panel pending-panel">
   <div class=daynav><h3>${title} <span class="pending-count">${count}</span></h3>
   <button class=ghost data-open-pending>一覧を見る</button></div>
   ${pendingListHtml(4)}
  </div>`;
}
function bindOpenPending(){
 document.querySelectorAll('[data-open-pending]').forEach(b=>b.onclick=()=>showView('pending'));
 bindPendingButtons();
}
function renderPending(){
 $('pending').innerHTML=`<div class=panel>
  <div class=daynav><div><h3>ペンディング / 未割当一覧</h3><p class=small>受注・対応対象だが、まだ日程へはめ込めていないタスクをここへ集約します。</p></div>
  <button id=pendingAdd class=primary>＋タスク</button></div>
  ${pendingListHtml()}
 </div>`;
 $('pendingAdd').onclick=()=>taskModal(null);
 bindPendingButtons();
}


function taskParticipants(t){
 return [t.employeeId,...(t.passengerIds||[])].filter(Boolean);
}
function earliestTaskForEmployee(employeeId,tasks){
 return tasks
  .filter(t=>t.status!=='pending'&&t.start&&taskParticipants(t).includes(employeeId))
  .sort((a,b)=>timeNum(a.start)-timeNum(b.start)||String(a.id).localeCompare(String(b.id)))[0]||null;
}
function orderedDayEmployees(tasks){
 const all=activeEmployees();
 const president=all.find(e=>e.role==='社長'||e.name==='社長');
 const director=all.find(e=>e.role==='専務'||e.name==='専務');
 const fixedIds=new Set([president?.id,director?.id].filter(Boolean));
 const movable=all.filter(e=>!fixedIds.has(e.id));

 // その日の最初の案件でグループ化。
 // 同じ最初のタスクに入る社員は必ず上下に並ぶ。
 movable.sort((a,b)=>{
   const ta=earliestTaskForEmployee(a.id,tasks);
   const tb=earliestTaskForEmployee(b.id,tasks);
   const sa=ta?timeNum(ta.start):999;
   const sb=tb?timeNum(tb.start):999;
   if(sa!==sb)return sa-sb;
   const ga=ta?(ta.visitGroupId||ta.projectId||ta.id):'ZZZ';
   const gb=tb?(tb.visitGroupId||tb.projectId||tb.id):'ZZZ';
   if(ga!==gb)return String(ga).localeCompare(String(gb));
   return (a.order||999)-(b.order||999);
 });

 // 下から2番目=社長、最下段=専務
 if(president)movable.push(president);
 if(director)movable.push(director);
 return movable;
}
function stackClassForTask(t,employeeId,orderedIds){
 const participantIds=taskParticipants(t).filter(id=>orderedIds.includes(id));
 if(participantIds.length<=1)return '';
 const positions=participantIds.map(id=>orderedIds.indexOf(id)).sort((a,b)=>a-b);
 const current=orderedIds.indexOf(employeeId);
 const idx=positions.indexOf(current);
 if(idx<0)return '';
 // 連続していない場合は通常表示
 for(let i=1;i<positions.length;i++)if(positions[i]!==positions[i-1]+1)return '';
 if(idx===0)return ' team-stack-top';
 if(idx===positions.length-1)return ' team-stack-bottom';
 return ' team-stack-middle';
}

function renderDay(){
 const allTs=db.tasks.filter(t=>t.date===currentDay);
 const ts=allTs.filter(t=>t.status!=='pending');
 const hs=db.holidays.filter(h=>h.date===currentDay),rd=rangeDef(),span=rd.e-rd.s;
 let rows=`<div class="grow head"><div class=who>氏名 / 車両</div><div class=track style="--hours:${rd.cols}">${timeBands(rd.s,rd.e)}${rd.h.map(h=>`<div class=hour>${h}</div>`).join('')}</div></div>`;

 const orderedEmployees=orderedDayEmployees(ts);
 const orderedIds=orderedEmployees.map(e=>e.id);
 orderedEmployees.forEach(e=>{
  const a=db.attendance.find(x=>x.employeeId===e.id&&x.date===currentDay);
  let bars='';
  if(a&&a.type!=='出勤')bars+=`<div class="bar leave" style="left:0;width:100%">${a.type}</div>`;

  const my=ts.filter(t=>t.employeeId===e.id||(t.passengerIds||[]).includes(e.id));
  my.forEach(t=>{
   let st=Math.max(timeNum(t.start),rd.s),en=Math.min(timeNum(t.end),rd.e);
   if(en<=rd.s||st>=rd.e)return;
   const l=(st-rd.s)/span*100,w=(en-st)/span*100,isHelp=(t.passengerIds||[]).includes(e.id);
   const stackClass=stackClassForTask(t,e.id,orderedIds);
   const teamCount=taskParticipants(t).length;
   bars+=`<div class="bar ${taskClass(t)} ${t.urgent?'urgent':''} task-click${stackClass}" data-bar="${t.id}" data-team-count="${teamCount}" style="left:${l}%;width:${w}%">${t.urgent?'🔴 ':''}${isHelp?'↳補助 ':''}${t.id} ${t.name}${teamCount>1?` · ${teamCount}人`:''}</div>`;
  });

  const cars=[...new Set(my.filter(t=>t.vehicleId).map(t=>vehName(t.vehicleId)))].join(', ');
  const att=attendanceFor(e.id,currentDay);
  const attText=att?(att.type==='出勤'?`勤怠 ${att.work||0}h${att.overtime?` / 残業 ${att.overtime}h`:''}`:`${att.type}`):'勤怠未入力';

  const firstTask=earliestTaskForEmployee(e.id,ts);
  rows+=`<div class="grow staff-row"><div class=who><div class=ename>${e.name}</div><div class=car>${cars||'車両 -'}</div><div class=small>${attText}</div>${firstTask?`<div class=sort-hint>先頭 ${firstTask.start} ${firstTask.id}</div>`:''}</div><div class=track style="--hours:${rd.cols}">${timeBands(rd.s,rd.e)}${bars}</div></div>`;
 });

 const urg=allTs.filter(t=>t.urgent);
 $('day').innerHTML=`<div class=panel>
  <div class=daynav><button id=dPrev class=ghost>←前日</button><div class=datebox>${dateLabel(currentDay)}</div><button id=dNext class=ghost>翌日→</button></div>
  ${hs.map(h=>`<div class="banner ${h.type==='statutory'?'stat':'company'}">${h.name}</div>`).join('')}
  ${urg.length?`<div class=banner style="background:#fff1f2;color:#991b1b">🔴 緊急 ${urg.length}件：${urg.map(x=>`${x.id} ${x.name}`).join(' / ')}</div>`:''}

  <div class=timelegend>
   <span class=l-deep>深夜 0–5 / 22–24</span>
   <span class=l-early>早朝 5–8:30</span>
   <span class=l-normal>基準 8:30–17:30</span>
   <span class=l-night>夜間 17:30–22</span>
  </div>

  <div class=toolbar>
   <div class=seg>
    <button data-range=all class="${dayRange==='all'?'active':''}">終日 0–24</button>
    <button data-range=am class="${dayRange==='am'?'active':''}">午前 0–12</button>
    <button data-range=pm class="${dayRange==='pm'?'active':''}">午後 12–24</button>
   </div>
   <div class=actions><button id=openAttendance class=ghost>この日の勤怠</button><button id=addTask class=primary>＋タスク</button></div>
  </div>

  <div class="day-gantt" data-range="${dayRange}"><div class=gantt-inner>${rows}</div></div>
  <p class=small>1目盛＝1時間。青＝客先、緑＝社内、黄＝その他。点線＋点滅＝仮予定。赤枠＝緊急。</p>
 </div>

 ${pendingMiniPanel('ペンディング / 未割当')}

 <div class=panel><h3>この日のタスク</h3><div class=tablewrap><table>
  <tr><th>ID</th><th>時間</th><th>区分</th><th>内容</th><th>客先/所在地</th><th>案件</th><th>担当</th><th>補助</th><th>状態</th><th></th></tr>
  ${allTs.map(t=>`<tr>
   <td>${t.urgent?'<span class=urgent-badge>緊急</span><br>':''}${t.id}</td>
   <td>${t.start}-${t.end}</td>
   <td>${t.category||t.type}</td>
   <td>${t.name}</td>
   <td>${t.category==='客先案件'?(t.clientSite||'-'):'-'}</td>
   <td>${projectLabel(t.projectId)}</td>
   <td>${empName(t.employeeId)}</td>
   <td>${(t.passengerIds||[]).map(empName).join('、')||'-'}</td>
   <td><span class="badge ${statusBadge(t.status)} ${t.status}">${statusText(t.status)}</span></td>
   <td><button class=ghost data-te="${t.id}">編集</button> <button class=danger data-td="${t.id}">削除</button></td>
  </tr>`).join('')}
 </table></div></div>`;

 $('dPrev').onclick=()=>{currentDay=addDays(currentDay,-1);syncMonthToDay();renderDay()};
 $('dNext').onclick=()=>{currentDay=addDays(currentDay,1);syncMonthToDay();renderDay()};
 $('openAttendance').onclick=()=>{renderAttendance();showView('attendance')};
 $('addTask').onclick=()=>taskModal(null);
 document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{dayRange=b.dataset.range;renderDay()});
 document.querySelectorAll('[data-te],[data-bar]').forEach(b=>b.onclick=()=>taskModal(db.tasks.find(t=>t.id===(b.dataset.te||b.dataset.bar))));
 document.querySelectorAll('[data-td]').forEach(b=>b.onclick=()=>{
   const t=db.tasks.find(x=>x.id===b.dataset.td);if(!t)return;
   if(!confirm(`タスク ${t.id}「${t.name}」を削除しますか？`))return;
   db.tasks=db.tasks.filter(x=>x.id!==t.id);save();renderAll();showView('day');
 });
 bindOpenPending();
}function renderAttendance(){
 const daily=(db.attendance||[]).filter(a=>a.date===currentDay);
 const updated=db.timeSnapshotUpdatedAt?new Date(db.timeSnapshotUpdatedAt).toLocaleString('ja-JP'):'未取得';
 const rows=activeEmployees().map(e=>{
   const a=daily.find(x=>x.employeeId===e.id);
   const elapsed=a?.elapsedMinutes==null?'-':(a.elapsedMinutes/60).toFixed(2)+'h';
   return `<tr>
    <td><b>${e.name}</b><br><span class=small>${e.id}</span></td>
    <td>${a?.type||'未入力'}</td>
    <td>${a?.start||'-'} ～ ${a?.end||'-'}</td>
    <td>${a?.out||'-'} / ${a?.back||'-'}</td>
    <td>${elapsed}</td>
    <td>${a?.note||''}</td>
   </tr>`;
 }).join('');

 $('attendance').innerHTML=`
 <div class="banner info">
  勤怠はTIMEからの参照専用です。編集はTIMEで行います。<br>
  <span class=small>TIME最終取込：${updated}</span>
 </div>
 <div class=panel>
  <div class=daynav>
   <button id=aPrev class=ghost>←前日</button>
   <div class=datebox>${dateLabel(currentDay)}</div>
   <button id=aNext class=ghost>翌日→</button>
  </div>
  <div class=tablewrap>
   <table>
    <tr><th>社員</th><th>区分</th><th>出退勤</th><th>外出/戻り</th><th>経過</th><th>備考</th></tr>
    ${rows}
   </table>
  </div>
 </div>
 <div class=panel>
  <h3>TIMEから格納した暦</h3>
  <p class=small>法定休日・所定休日・勤務日の情報はTIMEスナップショットを正として参照します。</p>
 </div>`;

 $('aPrev').onclick=()=>{currentDay=addDays(currentDay,-1);syncMonthToDay();renderAttendance()};
 $('aNext').onclick=()=>{currentDay=addDays(currentDay,1);syncMonthToDay();renderAttendance()};
}
function masterModal(type,x){const edit=!!x;if(type==='employees'){const r=x||{id:'EMP-'+String(db.employees.length+1).padStart(3,'0'),name:'',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:db.employees.length+1};openModal(edit?'社員編集':'社員追加',`<div class=form><div><label>社員ID</label><input id=mmId value="${r.id}"></div><div><label>氏名</label><input id=mmName value="${r.name}"></div><div><label>役職</label><input id=mmRole value="${r.role}"></div><div><label>表示順</label><input id=mmOrder type=number value="${r.order}"></div><div><label>標準開始</label><input id=mmStart type=time value="${r.start}"></div><div><label>標準終了</label><input id=mmEnd type=time value="${r.end}"></div></div>`,()=>{const n={...r,id:$('mmId').value.trim(),name:$('mmName').value.trim(),role:$('mmRole').value.trim(),order:+$('mmOrder').value||99,start:$('mmStart').value,end:$('mmEnd').value};if(edit){const old=r.id;db.employees[db.employees.findIndex(a=>a.id===old)]=n;db.tasks.forEach(t=>{if(t.employeeId===old)t.employeeId=n.id});db.projects.forEach(p=>{if(p.ownerId===old)p.ownerId=n.id})}else db.employees.push(n);save();closeModal();renderAll();showView('masters')})}else if(type==='vehicles'){const r=x||{id:'CAR-'+String(db.vehicles.length+1).padStart(3,'0'),name:'',type:'',number:'',active:true,note:''};openModal(edit?'車両編集':'車両追加',`<div class=form><div><label>車両ID</label><input id=mmId value="${r.id}"></div><div><label>呼称</label><input id=mmName value="${r.name}"></div><div><label>車種</label><input id=mmType value="${r.type}"></div><div><label>ナンバー</label><input id=mmNumber value="${r.number}"></div><div><label>備考</label><textarea id=mmNote>${r.note||''}</textarea></div></div>`,()=>{const n={...r,id:$('mmId').value.trim(),name:$('mmName').value.trim(),type:$('mmType').value.trim(),number:$('mmNumber').value.trim(),note:$('mmNote').value.trim()};if(edit){const old=r.id;db.vehicles[db.vehicles.findIndex(a=>a.id===old)]=n;db.tasks.forEach(t=>{if(t.vehicleId===old)t.vehicleId=n.id})}else db.vehicles.push(n);save();closeModal();renderAll();showView('masters')})}else{const r=x||{id:'CUS-'+String(db.customers.length+1).padStart(3,'0'),name:'',short:'',address:'',contact:'',phone:'',active:true};openModal(edit?'顧客編集':'顧客追加',`<div class=form><div><label>顧客ID</label><input id=mmId value="${r.id}"></div><div><label>会社名</label><input id=mmName value="${r.name}"></div><div><label>略称</label><input id=mmShort value="${r.short}"></div><div><label>所在地</label><input id=mmAddress value="${r.address}"></div><div><label>担当者</label><input id=mmContact value="${r.contact}"></div><div><label>電話</label><input id=mmPhone value="${r.phone||''}"></div></div>`,()=>{const n={...r,id:$('mmId').value.trim(),name:$('mmName').value.trim(),short:$('mmShort').value.trim(),address:$('mmAddress').value.trim(),contact:$('mmContact').value.trim(),phone:$('mmPhone').value.trim()};if(edit){const old=r.id;db.customers[db.customers.findIndex(a=>a.id===old)]=n;db.projects.forEach(p=>{if(p.customerId===old)p.customerId=n.id})}else db.customers.push(n);save();closeModal();renderAll();showView('masters')})}}
function renderMasters(){const list=masterType==='employees'?db.employees:masterType==='vehicles'?db.vehicles:db.customers;$('masters').innerHTML=`<div class=panel><div class=master-tabs><button class="master-tab ${masterType==='employees'?'active':''}" data-mt=employees>社員</button><button class="master-tab ${masterType==='vehicles'?'active':''}" data-mt=vehicles>車両</button><button class="master-tab ${masterType==='customers'?'active':''}" data-mt=customers>顧客</button></div><div class=daynav><h3>${masterType==='employees'?'社員':masterType==='vehicles'?'車両':'顧客'}マスタ</h3><button id=mAdd class=primary>＋追加</button></div>${list.map(x=>`<div class=master-card><h4>${x.id} ${x.name} ${x.active?'':'[無効]'}</h4><div class=small>${masterType==='employees'?`${x.role} / ${x.start}-${x.end}`:masterType==='vehicles'?`${x.type} / ${x.number}`:`${x.short} / ${x.address} / ${x.contact}`}</div><div class=actions><button class=ghost data-me="${x.id}">編集</button><button class=ghost data-ma="${x.id}">${x.active?'無効化':'有効化'}</button></div></div>`).join('')}</div>`;document.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>{masterType=b.dataset.mt;renderMasters()});$('mAdd').onclick=()=>masterModal(masterType,null);document.querySelectorAll('[data-me]').forEach(b=>b.onclick=()=>masterModal(masterType,(masterType==='employees'?emp:masterType==='vehicles'?veh:cust)(b.dataset.me)));document.querySelectorAll('[data-ma]').forEach(b=>b.onclick=()=>{const x=(masterType==='employees'?emp:masterType==='vehicles'?veh:cust)(b.dataset.ma);x.active=!x.active;save();renderAll();showView('masters')})}
function holidayModal(h){
 const r=h||{id:'H'+Date.now(),date:currentDay,type:'company',name:'所定休日'};
 openModal(h?'休日編集':'休日追加',`<div class=form>
  <div><label>日付</label><input id=mhDate type=date value="${r.date}"></div>
  <div><label>区分</label><select id=mhType>
   <option value=company ${r.type==='company'?'selected':''}>所定休日</option>
   <option value=statutory ${r.type==='statutory'?'selected':''}>法定休日</option>
  </select></div>
 </div>`,()=>{
  const type=$('mhType').value;
  const n={id:r.id,date:$('mhDate').value,type,name:type==='statutory'?'法定休日':'所定休日'};
  if(h)db.holidays[db.holidays.findIndex(x=>x.id===h.id)]=n;else db.holidays.push(n);
  save();closeModal();renderAll();showView('holidays')
 })
}
function renderHolidays(){$('holidays').innerHTML=`<div class=panel><div class=daynav><h3>会社カレンダー</h3><button id=hAdd class=primary>＋休日追加</button></div><div class=tablewrap><table><tr><th>日付</th><th>区分</th><th>名称</th><th></th></tr>${db.holidays.sort((a,b)=>a.date.localeCompare(b.date)).map(h=>`<tr><td>${h.date}</td><td>${h.type==='statutory'?'法定休日':'所定休日'}</td><td>${h.name}</td><td><button class=ghost data-he="${h.id}">編集</button> <button class=ghost data-hd="${h.id}">削除</button></td></tr>`).join('')}</table></div></div>`;$('hAdd').onclick=()=>holidayModal(null);document.querySelectorAll('[data-he]').forEach(b=>b.onclick=()=>holidayModal(db.holidays.find(h=>h.id===b.dataset.he)));document.querySelectorAll('[data-hd]').forEach(b=>b.onclick=()=>{db.holidays=db.holidays.filter(h=>h.id!==b.dataset.hd);save();renderAll();showView('holidays')})}
function renderBackup(){$('backup').innerHTML=`<div class=grid2><div class=panel><h3>バックアップ</h3><p><button id=exportBtn class=primary>JSONを書き出す</button></p></div><div class=panel><h3>復元</h3><input id=importFile class=fileinput type=file accept=".json,application/json"><p><button id=importBtn class=primary>復元</button></p></div></div>`;$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='company_portal_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(u)};$('importBtn').onclick=()=>{const f=$('importFile').files[0];if(!f)return alert('ファイルを選択');const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(confirm('現在のデータを上書きしますか？')){db=x;save();renderAll();showView('dashboard')}}catch(e){alert('読込失敗')}};r.readAsText(f)}}
function renderAll(){renderSummary();renderDashboard();renderProjects();renderYear();renderQuarter();renderMonth();renderDay();renderAttendance();renderPending();renderMasters();renderHolidays();renderBackup()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));$('resetBtn').onclick=()=>{if(confirm('初期データへ戻しますか？')){localStorage.removeItem(KEY);db=JSON.parse(JSON.stringify(seed));db.tasks.forEach(t=>{t.passengerIds=[];t.travelKind='';t.category=(['設計','見積','社内製作','段取り','整備'].includes(t.type)?'社内案件':'客先案件');t.urgent=false;t.history=[]});save();renderAll();showView('dashboard')}};renderAll();
const requestedPortalView=PORTAL_PARAMS.get('view');
if(requestedPortalView&&document.getElementById(requestedPortalView))showView(requestedPortalView);
window.addEventListener('pageshow',()=>{
  
});
