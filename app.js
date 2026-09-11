const $=id=>document.getElementById(id);
const KEY='companyPortalV06';
const seed={employees:[{id:'EMP-001',name:'社長',role:'社長',active:true,attendance:true,start:'08:00',end:'17:00',order:1},{id:'EMP-002',name:'専務',role:'専務',active:true,attendance:true,start:'08:00',end:'17:00',order:2},{id:'EMP-003',name:'山田',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:3},{id:'EMP-004',name:'佐藤',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:4},{id:'EMP-005',name:'鈴木',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:5}],vehicles:[{id:'CAR-001',name:'ハイエース①',type:'ハイエース',number:'富山100 あ 1234',active:true,note:''},{id:'CAR-002',name:'ハイエース②',type:'ハイエース',number:'富山100 あ 5678',active:true,note:''},{id:'CAR-003',name:'プロボックス',type:'プロボックス',number:'富山500 い 1111',active:true,note:''}],customers:[{id:'CUS-001',name:'○○食品株式会社',short:'○○食品',address:'富山県',contact:'田中様',phone:'',active:true},{id:'CUS-002',name:'△△食品株式会社',short:'△△食品',address:'石川県',contact:'佐々木様',phone:'',active:true}],projects:[{id:'PJ-2026-0042',customerId:'CUS-001',name:'コンベア改造',status:'受注',start:'2026-09-09',deadline:'2026-11-20',hours:120,people:2,ownerId:'EMP-003',note:'現調→設計→製作→現地工事'},{id:'PJ-2026-0048',customerId:'CUS-002',name:'洗浄機更新',status:'見積中',start:'2026-09-15',deadline:'2026-12-10',hours:240,people:3,ownerId:'EMP-002',note:'メーカー実機検証あり'}],tasks:[{id:'A',date:'2026-09-09',name:'現調',type:'現調',projectId:'PJ-2026-0042',employeeId:'EMP-001',vehicleId:'',start:'08:00',end:'10:00',status:'confirmed'},{id:'B',date:'2026-09-09',name:'社内打合せ',type:'その他',projectId:'',employeeId:'EMP-001',vehicleId:'',start:'11:00',end:'12:00',status:'pending'},{id:'C',date:'2026-09-09',name:'商談',type:'商談',projectId:'PJ-2026-0048',employeeId:'EMP-001',vehicleId:'',start:'13:00',end:'15:00',status:'confirmed'},{id:'D',date:'2026-09-09',name:'客先修理',type:'客先修理',projectId:'',employeeId:'EMP-002',vehicleId:'CAR-001',start:'08:30',end:'12:00',status:'confirmed'},{id:'E',date:'2026-09-09',name:'見積作成',type:'見積',projectId:'PJ-2026-0048',employeeId:'EMP-002',vehicleId:'',start:'13:00',end:'16:00',status:'provisional'},{id:'F',date:'2026-09-09',name:'架台組立',type:'社内製作',projectId:'PJ-2026-0042',employeeId:'EMP-003',vehicleId:'',start:'09:00',end:'12:00',status:'confirmed'}],holidays:[{id:'H1',date:'2026-09-13',type:'statutory',name:'法定休日'},{id:'H2',date:'2026-09-19',type:'company',name:'所定休日'},{id:'H3',date:'2026-09-20',type:'statutory',name:'法定休日'}],attendance:[{employeeId:'EMP-001',date:'2026-09-09',type:'出勤',work:8.5,overtime:.5,paidLeave:0},{employeeId:'EMP-002',date:'2026-09-09',type:'出勤',work:9,overtime:1,paidLeave:0},{employeeId:'EMP-003',date:'2026-09-09',type:'出勤',work:8,overtime:0,paidLeave:0},{employeeId:'EMP-004',date:'2026-09-09',type:'有休',work:0,overtime:0,paidLeave:1},{employeeId:'EMP-005',date:'2026-09-09',type:'出勤',work:8,overtime:0,paidLeave:0}],attendanceSummary:[{employeeId:'EMP-001',annualHolidays:110,holidaysTaken:71,paidLeaveTaken:3,annualWork:1450,overtime:185,agreementPct:51},{employeeId:'EMP-002',annualHolidays:110,holidaysTaken:69,paidLeaveTaken:2,annualWork:1510,overtime:218,agreementPct:61},{employeeId:'EMP-003',annualHolidays:110,holidaysTaken:75,paidLeaveTaken:4,annualWork:1420,overtime:146,agreementPct:41},{employeeId:'EMP-004',annualHolidays:110,holidaysTaken:78,paidLeaveTaken:5,annualWork:1390,overtime:98,agreementPct:27},{employeeId:'EMP-005',annualHolidays:110,holidaysTaken:80,paidLeaveTaken:3,annualWork:1370,overtime:86,agreementPct:24}]};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||JSON.parse(JSON.stringify(seed));

const IMPORTED_CUSTOMERS=Array.isArray(window.HOKUYOU_IMPORTED_CUSTOMERS)?window.HOKUYOU_IMPORTED_CUSTOMERS:[];
function mergeImportedCustomers(){
 if(!Array.isArray(db.customers))db.customers=[];
 const byId=new Map(db.customers.map(c=>[String(c.id),c]));
 IMPORTED_CUSTOMERS.forEach(src=>{
   const id=String(src.id);
   const cur=byId.get(id);
   if(!cur){
     const n={...src};db.customers.push(n);byId.set(id,n);
   }else if(cur.source==='excel'){
     Object.assign(cur,src,{active:cur.active!==false});
   }
 });
}
mergeImportedCustomers();
db.tasks.forEach(t=>{
 if(t.name==='未記入')t.name='';
 if(t.plannedHours!=null)t.plannedHours=Math.max(.5,Math.round((+t.plannedHours||0)*2)/2);
 if(!t.helperVehicles||typeof t.helperVehicles!=='object')t.helperVehicles={};
 if(t.slotHours==null)t.slotHours=+t.plannedHours||0;
});
db.projects.forEach(p=>{
 if(!p.deliveryCustomerId)p.deliveryCustomerId=p.customerId||'';
 if(!p.billingCustomerId)p.billingCustomerId=p.deliveryCustomerId||p.customerId||'';
 p.customerId=p.deliveryCustomerId||p.customerId||'';
});


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
const deliveryCustomerId=p=>p?.deliveryCustomerId||p?.customerId||'';
const billingCustomerId=p=>p?.billingCustomerId||deliveryCustomerId(p)||'';
const deliveryCustomerName=p=>p?.deliveryTemp?.name||custName(deliveryCustomerId(p));
const billingCustomerName=p=>p?.billingTemp?.name||custName(billingCustomerId(p));
const customerAddress=id=>{const c=cust(id);return c?.address||[c?.address1,c?.address2].filter(Boolean).join(' ')||''};
const deliveryCustomerAddress=p=>p?.deliveryTemp?.address||customerAddress(deliveryCustomerId(p));
const projectAssignedHours=p=>(db.tasks||[]).filter(t=>t.projectId===p?.id).reduce((s,t)=>s+(+t.plannedHours||0),0);
const projectRemainingHours=p=>Math.max(0,(+p?.hours||0)-projectAssignedHours(p));
const taskDisplayName=t=>{
 const own=String(t?.name||'').trim();
 if(own&&own!=='未記入')return own;
 const p=proj(t?.projectId);
 if(p?.name)return p.name;
 return t?.urgent?'緊急対応':'予定';
};
const taskSiteDefault=projectId=>{
 const p=proj(projectId);
 if(!p)return '';
 const n=deliveryCustomerName(p),a=deliveryCustomerAddress(p);
 return [n,a].filter(Boolean).join(' / ');
};
const taskVehicleForEmployee=(t,employeeId)=>{
 if(!t||!employeeId)return '';
 if(employeeId===t.employeeId)return t.vehicleId||'';
 const assigned=t.helperVehicles?.[employeeId];
 if(assigned==='__MAIN__')return t.vehicleId||'';
 return assigned||'';
};
const taskVehicleLabelForEmployee=(t,employeeId)=>{
 const id=taskVehicleForEmployee(t,employeeId);
 return id?vehName(id):'';
};
const taskDeliveryName=t=>{
 const p=proj(t?.projectId);
 if(p)return deliveryCustomerName(p)||'';
 const s=String(t?.clientSite||'').trim();
 return s?s.split('/')[0].trim():'';
};
function nextCustomerCode(){
 let max=0;
 (db.customers||[]).forEach(c=>{
   const id=String(c.id||'').toUpperCase();
   if(/^[0-9A-F]{3}$/.test(id))max=Math.max(max,parseInt(id,16));
 });
 return (max+1).toString(16).toUpperCase().padStart(3,'0');
}
function customerOptions(selected=''){
 return db.customers
   .filter(c=>c.active!==false||c.id===selected)
   .sort((a,b)=>String(a.id).localeCompare(String(b.id)))
   .map(c=>`<option value="${c.id}" ${c.id===selected?'selected':''}>${c.id}　${c.name}</option>`).join('');
}
function escXml(v){
 return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function exportExcelXml(filename,sheetName,headers,rows){
 const rowXml=r=>`<Row>${r.map(v=>`<Cell><Data ss:Type="${typeof v==='number'?'Number':'String'}">${escXml(v)}</Data></Cell>`).join('')}</Row>`;
 const xml=`<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${escXml(sheetName)}"><Table>${rowXml(headers)}${rows.map(rowXml).join('')}</Table></Worksheet>
</Workbook>`;
 const blob=new Blob(['\ufeff',xml],{type:'application/vnd.ms-excel;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=filename+'.xls';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function filterCustomerSelect(inputId,selectId){
 const q=($(`${inputId}`)?.value||'').trim().toLowerCase();
 const sel=$(selectId);if(!sel)return;
 const current=sel.value;
 const list=db.customers.filter(c=>c.active!==false).filter(c=>{
   const hay=[c.id,c.name,c.kana,c.address,c.phone].join(' ').toLowerCase();
   return !q||hay.includes(q);
 }).slice(0,150);
 sel.innerHTML=list.map(c=>`<option value="${c.id}" ${c.id===current?'selected':''}>${c.id}　${c.name}</option>`).join('');
 if(current&&list.some(c=>c.id===current))sel.value=current;
}

const projectLabel=id=>{const p=proj(id);return p?`${p.id} ${deliveryCustomerName(p)||'仮顧客'} ${p.name}`:'社内'};
const statusText=s=>({confirmed:'確定',pending:'ペンディング',provisional:'仮予定'})[s]||s,statusBadge=s=>s==='confirmed'?'bc':s==='pending'?'bp':'bv';
const taskClass=t=>{
  const base=t.category==='社内案件'?'cat-internal':t.category==='その他'?'cat-other':'cat-client';
  const state=t.status==='provisional'?' is-provisional':t.status==='pending'?' is-pending':'';
  return base+state;
};
const timeNum=t=>{if(!t)return NaN;const[a,b]=t.split(':').map(Number);return a+b/60};
const snapTime30=t=>{if(!t)return '';let m=Math.round(timeNum(t)*60/30)*30;m=Math.max(0,Math.min(1410,m));return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`};
const timeOverlap=(aStart,aEnd,bStart,bEnd)=>timeNum(aStart)<timeNum(bEnd)&&timeNum(bStart)<timeNum(aEnd);
function calcEndTime(start,plannedHours){
 if(!start)return '';
 const mins=Math.round(timeNum(start)*60+(+plannedHours||0)*60);
 if(mins>1440)return '';
 const h=Math.floor(mins/60),m=mins%60;
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function taskEnd(t){return t.end||calcEndTime(t.start,(t.slotHours??t.plannedHours))}
db.tasks.forEach(t=>{
 if(t.status==='unassigned')t.status='pending';
 if(t.plannedHours==null){
  const s=timeNum(t.start),e=timeNum(t.end);
  t.plannedHours=(Number.isFinite(s)&&Number.isFinite(e)&&e>s)?Math.max(.5,Math.round((e-s)*2)/2):1;
 }
});

function normalizeClientText(v){
 return String(v||'').toLowerCase().replace(/\s+/g,'').replace(/[　,，.。・\-_/\\]/g,'');
}
function taskCustomerId(t){
 const p=proj(t.projectId);
 return deliveryCustomerId(p)||'';
}
function taskCustomerKey(t){
 const p=proj(t.projectId),id=deliveryCustomerId(p);
 if(id)return 'ID:'+id;
 const n=normalizeClientText(deliveryCustomerName(p));
 if(n)return 'NAME:'+n;
 return 'SITE:'+normalizeClientText(t.clientSite);
}
function sameClientTask(a,b){
 const ka=taskCustomerKey(a),kb=taskCustomerKey(b);
 if(ka&&kb&&ka===kb)return true;
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
function renderSummary(){const p=db.tasks.filter(t=>t.status==='pending').length,v=db.tasks.filter(t=>t.status==='provisional').length;$('summary').innerHTML=`<div class=card>進行案件<br><b>${db.projects.filter(p=>!isProjectArchived(p)).length}</b></div><div class=card>社員<br><b>${db.employees.filter(x=>x.active).length}</b></div><div class=card>車両<br><b>${db.vehicles.filter(x=>x.active).length}</b></div><div class=card>顧客<br><b>${db.customers.filter(x=>x.active).length}</b></div><div class=card>確認待ち<br><b style="color:#ef4444">${p}</b></div><div class=card>仮予定<br><b style="color:#f59e0b">${v}</b></div>`}
function renderDashboard(){const upcoming=db.projects.filter(p=>p.status!=='完了').sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,5);$('dashboard').innerHTML=`<div class=fieldtest-note><b>実機テスト版</b>：予定・勤怠・会社カレンダー・社員マスタは同じブラウザデータを参照しています。まず1週間、入力負担と見え方を確認してください。</div><div class=grid3><div class=panel><h3>予定の完成度</h3><b style="font-size:30px">${db.tasks.length?Math.round(db.tasks.filter(t=>t.status==='confirmed').length/db.tasks.length*100):100}%</b><p class=small>点滅している予定を前週までに消す。</p></div><div class=panel><h3>未確定</h3><p>ペンディング ${db.tasks.filter(t=>t.status==='pending').length}件 / 仮 ${db.tasks.filter(t=>t.status==='provisional').length}件</p></div><div class=panel><h3>共通マスタ</h3><p>社員 ${db.employees.length} / 車両 ${db.vehicles.length} / 顧客 ${db.customers.length}</p></div></div><div class=panel><h3>直近案件</h3><div class=tablewrap><table><tr><th>案件</th><th>顧客</th><th>納期</th><th>工数</th><th>主担当</th></tr>${upcoming.map(p=>`<tr><td>${p.id}<br><b>${p.name}</b></td><td>${deliveryCustomerName(p)}</td><td>${p.deadline}</td><td>${p.hours}h</td><td>${empName(p.ownerId)}</td></tr>`).join('')}</table></div></div>`}
function projectModal(p){
 const isEdit=!!p;
 const firstCustomer=db.customers.find(x=>x.active)?.id||'';
 const p0=p||{
  id:'PJ-2026-'+String(49+db.projects.length).padStart(4,'0'),
  customerId:firstCustomer,deliveryCustomerId:firstCustomer,billingCustomerId:firstCustomer,
  deliveryTemp:null,billingTemp:null,name:'',status:'受注',start:currentDay,deadline:addDays(currentDay,30),
  hours:8,people:1,ownerId:activeEmployees()[0]?.id||'',note:''
 };
 p0.deliveryCustomerId=p0.deliveryCustomerId||p0.customerId||firstCustomer;
 p0.billingCustomerId=p0.billingCustomerId||p0.deliveryCustomerId;
 const deliveryTemp=!!p0.deliveryTemp?.name;
 const billingTemp=!!p0.billingTemp?.name;
 const sameBilling=!billingTemp&&!p0.billingTemp&&p0.billingCustomerId===p0.deliveryCustomerId;

 openModal(isEdit?'案件編集':'案件追加',`
  <div class=form>
   <div><label>案件ID</label><input id=mpId value="${p0.id}"></div>
   <div><label>状態</label><select id=mpStatus>${['情報','アプローチ','商談中','見積提出','受注','施工中','検収待ち','検収済','アフター','完了'].map(x=>`<option ${x===p0.status?'selected':''}>${x}</option>`).join('')}</select></div>

   <div style="grid-column:1/-1"><label class=checkline><input type=checkbox id=mpDeliveryTemp ${deliveryTemp?'checked':''}> 納品先を仮入力する</label></div>
   <div id=deliveryMasterArea style="grid-column:1/-1;${deliveryTemp?'display:none':''}">
    <label>納品先検索</label><input id=mpDeliverySearch placeholder="コード・顧客名・住所で検索">
    <label>納品先</label><select id=mpDeliveryCustomer>${customerOptions(p0.deliveryCustomerId)}</select>
   </div>
   <div id=deliveryTempArea style="grid-column:1/-1;${deliveryTemp?'':'display:none'}">
    <label>仮の納品先名</label><input id=mpDeliveryTempName value="${p0.deliveryTemp?.name||''}" placeholder="例：○○食品 新工場">
    <label>仮の納品先住所</label><input id=mpDeliveryTempAddress value="${p0.deliveryTemp?.address||''}" placeholder="分かる範囲で入力">
   </div>

   <div style="grid-column:1/-1"><label class=checkline><input type=checkbox id=mpSameBilling ${sameBilling?'checked':''}> 支払先は納品先と同じ</label></div>
   <div id=billingChoice style="grid-column:1/-1;${sameBilling?'display:none':''}">
    <label class=checkline><input type=checkbox id=mpBillingTemp ${billingTemp?'checked':''}> 支払先を仮入力する</label>
    <div id=billingMasterArea style="${billingTemp?'display:none':''}">
     <label>支払先検索（代理店など）</label><input id=mpBillingSearch placeholder="コード・顧客名・住所で検索">
     <label>支払先</label><select id=mpBillingCustomer>${customerOptions(p0.billingCustomerId)}</select>
    </div>
    <div id=billingTempArea style="${billingTemp?'':'display:none'}">
     <label>仮の支払先名</label><input id=mpBillingTempName value="${p0.billingTemp?.name||''}" placeholder="例：△△商事">
     <label>仮の支払先住所</label><input id=mpBillingTempAddress value="${p0.billingTemp?.address||''}" placeholder="任意">
    </div>
   </div>

   <div><label>案件名</label><input id=mpName value="${p0.name}"></div>
   <div><label>施工予定日</label><input id=mpStart type=date value="${p0.start||''}"></div>
   <div><label>納期</label><input id=mpDeadline type=date value="${p0.deadline||''}"></div>
   <div><label>案件予定工数</label><input id=mpHours type=number min=0 step=.5 value="${p0.hours}"></div>
   <div><label>必要人員</label><input id=mpPeople type=number min=1 value="${p0.people}"></div>
   <div><label>主担当</label><select id=mpOwner>${activeEmployees().map(e=>`<option value="${e.id}" ${e.id===p0.ownerId?'selected':''}>${e.name}</option>`).join('')}</select></div>
   <div style="grid-column:1/-1"><label>備考</label><textarea id=mpNote>${p0.note||''}</textarea></div>
  </div>`,()=>{
   const useDeliveryTemp=$('mpDeliveryTemp').checked;
   const same=$('mpSameBilling').checked;
   const useBillingTemp=!same&&$('mpBillingTemp').checked;
   const deliveryTempObj=useDeliveryTemp?{name:$('mpDeliveryTempName').value.trim(),address:$('mpDeliveryTempAddress').value.trim()}:null;
   if(useDeliveryTemp&&!deliveryTempObj.name)return alert('仮の納品先名を入力してください');
   const delivery=useDeliveryTemp?'':$('mpDeliveryCustomer').value;
   let billing='',billingTempObj=null;
   if(same){
    billing=delivery;
    billingTempObj=deliveryTempObj?{...deliveryTempObj}:null;
   }else if(useBillingTemp){
    billingTempObj={name:$('mpBillingTempName').value.trim(),address:$('mpBillingTempAddress').value.trim()};
    if(!billingTempObj.name)return alert('仮の支払先名を入力してください');
   }else billing=$('mpBillingCustomer').value;

   const n={...p0,id:$('mpId').value.trim(),status:$('mpStatus').value,
    customerId:delivery,deliveryCustomerId:delivery,billingCustomerId:billing,
    deliveryTemp:deliveryTempObj,billingTemp:billingTempObj,
    name:$('mpName').value.trim(),start:$('mpStart').value,deadline:$('mpDeadline').value,
    hours:+$('mpHours').value||0,people:+$('mpPeople').value||1,
    ownerId:$('mpOwner').value,note:$('mpNote').value.trim()};
   if(!n.id||!n.name)return alert('案件IDと案件名は必須です');
   if(!n.deliveryCustomerId&&!n.deliveryTemp?.name)return alert('納品先を選択または仮入力してください');
   if(!n.billingCustomerId&&!n.billingTemp?.name)return alert('支払先を選択または仮入力してください');
   if(isEdit){
    const old=p.id,idx=db.projects.findIndex(x=>x.id===old);db.projects[idx]=n;
    db.tasks.forEach(t=>{if(t.projectId===old)t.projectId=n.id});
   }else{
    if(db.projects.some(x=>x.id===n.id))return alert('案件IDが重複しています');
    db.projects.push(n);
   }
   save();closeModal();renderAll();showView('projects');
  });

 $('mpDeliverySearch').oninput=()=>filterCustomerSelect('mpDeliverySearch','mpDeliveryCustomer');
 $('mpBillingSearch').oninput=()=>filterCustomerSelect('mpBillingSearch','mpBillingCustomer');
 const toggleDelivery=()=>{
  const temp=$('mpDeliveryTemp').checked;
  $('deliveryMasterArea').style.display=temp?'none':'block';
  $('deliveryTempArea').style.display=temp?'block':'none';
 };
 const toggleBilling=()=>{
  const same=$('mpSameBilling').checked;
  $('billingChoice').style.display=same?'none':'block';
  if(!same){
   const temp=$('mpBillingTemp').checked;
   $('billingMasterArea').style.display=temp?'none':'block';
   $('billingTempArea').style.display=temp?'block':'none';
  }
 };
 $('mpDeliveryTemp').onchange=toggleDelivery;
 $('mpSameBilling').onchange=toggleBilling;
 $('mpBillingTemp').onchange=toggleBilling;
}
function renderProjects(){
 const active=db.projects.filter(p=>!isProjectArchived(p));
 const archived=db.projects.filter(isProjectArchived);
 const card=p=>{
  const assigned=projectAssignedHours(p),remaining=projectRemainingHours(p);
  return `<div class=project-card>
   <h4>${p.id}　${p.name}</h4>
   <div><span class="badge bblue">${p.status}</span>${p.deliveryTemp?.name?'<span class="badge temp-badge">仮納品先</span>':''}${p.billingTemp?.name?'<span class="badge temp-badge">仮支払先</span>':''}</div>
   <div class=small>納品先：${deliveryCustomerId(p)||'仮'} ${deliveryCustomerName(p)||'-'}${deliveryCustomerAddress(p)?` / ${deliveryCustomerAddress(p)}`:''}</div>
   <div class=small>支払先：${billingCustomerId(p)||'仮'} ${billingCustomerName(p)||'-'}</div>
   <div class=small>施工予定日 ${p.start||'未定'} / 納期 ${p.deadline||'-'} / 案件工数 ${p.hours}h / 主担当 ${empName(p.ownerId)}</div>
   <div class=effort-meter><b>タスク割当 ${assigned}h</b><span>未割当 ${remaining}h</span></div>
   <div class=actions><button class=ghost data-pe="${p.id}">編集</button>${!isProjectArchived(p)?`<button class=primary data-po="${p.id}">${remaining>0?`残り${remaining}hを予定に入れる`:'＋タスク追加'}</button>`:''}<button class=danger data-pd="${p.id}">削除</button></div>
  </div>`;
 };
 $('projects').innerHTML=`<div class=panel>
  <div class=daynav><div><h3>案件台帳</h3><p class=small>案件＝仕事全体の箱。予定工数をタスクへ必要な分だけ割り当てます。</p></div>
   <div class=actions><button id=projectExcel class=ghost>Excel出力</button><button id=addProject class=primary>＋案件追加</button></div>
  </div>
  ${active.length?active.map(card).join(''):'<div class=small>進行中の案件はありません。</div>'}
 </div>
 <details class="panel archive-panel"><summary><b>検収済・アーカイブ案件</b> (${archived.length})</summary>
  <div>${archived.length?archived.map(card).join(''):'<div class=small>アーカイブはありません。</div>'}</div>
 </details>`;
 $('projectExcel').onclick=()=>{
  const rows=db.projects.map(p=>[p.id,p.status,deliveryCustomerId(p)||'仮',deliveryCustomerName(p),billingCustomerId(p)||'仮',billingCustomerName(p),
   p.name,p.start||'',p.deadline||'',+p.hours||0,projectAssignedHours(p),projectRemainingHours(p),+p.people||0,empName(p.ownerId),p.note||'']);
  exportExcelXml('案件一覧_'+new Date().toISOString().slice(0,10),'案件一覧',
   ['案件ID','ステータス','納品先コード','納品先','支払先コード','支払先','案件名','施工予定日','納期','案件予定工数h','タスク割当h','未割当h','必要人員','主担当','備考'],rows);
 };
 $('addProject').onclick=()=>projectModal(null);
 document.querySelectorAll('[data-pe]').forEach(b=>b.onclick=()=>projectModal(proj(b.dataset.pe)));
 document.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>{if(confirm('案件を削除しますか？')){db.projects=db.projects.filter(x=>x.id!==b.dataset.pd);save();renderAll();showView('projects')}});
 document.querySelectorAll('[data-po]').forEach(b=>b.onclick=()=>{
   const p=proj(b.dataset.po);currentDay=p?.start||currentDay;showView('day');renderDay();setTimeout(()=>taskModal(null,b.dataset.po),80);
 });
}
function renderYear(){const ms=[7,8,9,10,11,12];$('year').innerHTML=`<div class=grid2><div class=panel><h3>年間案件</h3><div class=tablewrap><table><tr><th>案件</th>${ms.map(m=>`<th>${m}月</th>`).join('')}<th>納期</th></tr>${db.projects.map(p=>`<tr><td><b>${p.id}</b><br>${p.name}</td>${ms.map(m=>{const active=new Date(2026,m,0)>=new Date(p.start)&&new Date(`2026-${String(m).padStart(2,'0')}-01`)<=new Date(p.deadline);return`<td>${active?`<div class="pill confirmed">${p.status}<br>${p.hours}h/${p.people}名</div>`:''}${db.tasks.filter(t=>t.projectId===p.id&&+t.date.slice(5,7)===m).map(t=>`<div class="pill ${t.status}">${t.id} ${taskDisplayName(t)}</div>`).join('')}</td>`}).join('')}<td>${p.deadline}</td></tr>`).join('')}</table></div></div><div class=panel><h3>年間労務</h3><div class=tablewrap><table><tr><th>社員</th><th>休日</th><th>有休</th><th>就労</th><th>時間外</th><th>36協定</th></tr>${db.attendanceSummary.map(x=>`<tr><td>${empName(x.employeeId)}</td><td>${x.holidaysTaken}/${x.annualHolidays}</td><td>${x.paidLeaveTaken}</td><td>${x.annualWork}h</td><td>${x.overtime}h</td><td>${x.agreementPct}%</td></tr>`).join('')}</table></div></div></div>`}
function renderQuarter(){$('quarter').innerHTML=[['Q3 7-9月',[7,8,9]],['Q4 10-12月',[10,11,12]]].map(([n,ms])=>`<div class=panel><h3>${n}</h3><div class=tablewrap><table><tr><th>案件</th><th>期間</th><th>工数</th><th>人員</th><th>主担当</th><th>未確定</th></tr>${db.projects.filter(p=>ms.some(m=>new Date(2026,m,0)>=new Date(p.start)&&new Date(`2026-${String(m).padStart(2,'0')}-01`)<=new Date(p.deadline))).map(p=>`<tr><td>${p.id}<br><b>${p.name}</b></td><td>${p.start}<br>～${p.deadline}</td><td>${p.hours}h</td><td>${p.people}名</td><td>${empName(p.ownerId)}</td><td>${db.tasks.filter(t=>t.projectId===p.id&&t.status!=='confirmed').length}</td></tr>`).join('')}</table></div></div>`).join('')}
function renderMonth(){const[y,m]=currentMonth.split('-').map(Number),last=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay();let cells='';for(let i=0;i<first;i++)cells+='<div></div>';for(let d=1;d<=last;d++){const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`,hs=db.holidays.filter(h=>h.date===date),ts=db.tasks.filter(t=>t.date===date),leave=db.attendance.filter(a=>a.date===date&&a.type!=='出勤'),cls=hs.some(h=>h.type==='statutory')?'holiday-bg holiday-statutory-cell':hs.some(h=>h.type==='company')?'company-bg holiday-company-cell':'';cells+=`<div class="daycell ${cls}" data-date="${date}"><div class=daynum>${d}</div>${hs.map(h=>`<div class="pill holiday-mark ${h.type==='statutory'?'holiday statutory-mark':'companyHoliday company-mark'}">${h.type==='statutory'?'法定休日':'所定休日'}</div>`).join('')}${leave.map(a=>`<div class="pill companyHoliday">${empName(a.employeeId)} ${a.type}</div>`).join('')}${ts.map(t=>`<div class="pill ${t.status}">${t.id} ${taskDisplayName(t)}<br>${empName(t.employeeId)}</div>`).join('')}</div>`}$('month').innerHTML=`<div class=panel><div class=daynav><button id=mPrev class=ghost>←前月</button><div class=datebox>${y}年${m}月</div><button id=mNext class=ghost>翌月→</button></div><div class=calendar-scroll><div class=calendar-head>${['日','月','火','水','木','金','土'].map(x=>`<div>${x}</div>`).join('')}</div><div class=calendar>${cells}</div></div></div>`;$('mPrev').onclick=()=>{let d=new Date(currentMonth+'-01');d.setMonth(d.getMonth()-1);currentMonth=d.toISOString().slice(0,7);renderMonth()};$('mNext').onclick=()=>{let d=new Date(currentMonth+'-01');d.setMonth(d.getMonth()+1);currentMonth=d.toISOString().slice(0,7);renderMonth()};document.querySelectorAll('[data-date]').forEach(c=>c.onclick=()=>{currentDay=c.dataset.date;showView('day');renderDay()})}
function rangeDef(){
 if(dayRange==='am')return{s:0,e:12,h:Array.from({length:12},(_,i)=>i),cols:12};
 if(dayRange==='pm')return{s:12,e:24,h:Array.from({length:12},(_,i)=>i+12),cols:12};
 return{s:0,e:24,h:Array.from({length:24},(_,i)=>i),cols:24};
 $('month').insertAdjacentHTML('beforeend',pendingMiniPanel());bindOpenPending();
}
function taskModal(t,presetProject=''){
 const edit=!!t;
 const pp=proj(presetProject);
 const remaining=pp?projectRemainingHours(pp):0;
 const t0=t||{
   id:nextTaskId(),date:pp?.start||currentDay,name:'',category:'客先案件',
   projectId:presetProject,employeeId:pp?.ownerId||activeEmployees()[0]?.id||'',
   vehicleId:'',helperVehicles:{},start:'08:30',end:'',plannedHours:remaining>0?remaining:2,slotHours:remaining>0?remaining:2,status:'confirmed',
   urgent:false,passengerIds:[],history:[],clientSite:presetProject?taskSiteDefault(presetProject):''
 };
 if(!t0.helperVehicles||typeof t0.helperVehicles!=='object')t0.helperVehicles={};
 if(t0.name==='未記入')t0.name='';
 if(!t0.clientSite&&t0.projectId&&t0.category==='客先案件')t0.clientSite=taskSiteDefault(t0.projectId);
 const cats=['客先案件','社内案件','その他'];
 const vehicleOpts=(selected='',helper=false)=>{
   let opts=helper?`<option value="__MAIN__" ${selected==='__MAIN__'?'selected':''}>主担当と同じ車両</option>`:'';
   opts+=`<option value="" ${!selected?'selected':''}>車両なし</option>`;
   opts+=db.vehicles.filter(v=>v.active||v.id===selected).map(v=>`<option value="${v.id}" ${v.id===selected?'selected':''}>${v.name}</option>`).join('');
   return opts;
 };

 openModal(edit?'タスク編集':'タスク追加',`
  <div class=task-kind>${cats.map(k=>`<button type=button class="kindbtn ${t0.category===k?'active':''}" data-kind="${k}">${k}</button>`).join('')}</div>
  <input type=hidden id=mtCategory value="${t0.category||'客先案件'}">
  <div class=form>
   <div><label>日付（ペンディングは未定可）</label><input id=mtDate type=date value="${t0.date||''}"></div>
   <div><label>ID</label><input id=mtId value="${t0.id}" readonly></div>
   <div><label>案件</label><select id=mtProject><option value="">案件なし</option>${db.projects.filter(p=>!isProjectArchived(p)||p.id===t0.projectId).map(p=>`<option value="${p.id}" ${p.id===t0.projectId?'selected':''}>${projectLabel(p.id)}</option>`).join('')}</select></div>
   <div><label>内容（空欄可）</label><input id=mtName value="${t0.name||''}" placeholder="空欄なら案件名を表示"></div>

   <div id=clientSiteWrap style="grid-column:1/-1;${(t0.category||'客先案件')==='客先案件'?'':'display:none'}">
    <label>客先 / 所在地</label>
    <div class=site-row><input id=mtClientSite value="${t0.clientSite||''}" placeholder="案件の納品先住所を自動反映。必要なら上書き可"><button type=button id=resetSite class=ghost>納品先住所に戻す</button></div>
   </div>

   <div><label>予定工数</label><input id=mtHours type=number min=.5 step=.5 value="${Math.max(.5,Math.round((+t0.plannedHours||2)*2)/2)}"> <span class=small>h</span></div>
   <div><label>予定枠（時間バー）</label><input id=mtSlotHours type=number min=.5 step=.5 value="${Math.max(.5,Math.round((+(t0.slotHours??t0.plannedHours)||2)*2)/2)}"> <span class=small>h</span></div>
   <div><label>開始</label><input id=mtStart type=time step=1800 value="${t0.start||''}"></div>
   <div><label>終了</label><input id=mtEnd type=time value="${taskEnd(t0)||''}" readonly></div>
   <div class=time-shift-controls style="grid-column:1/-1">
    <button type=button id=slotFromHours class=ghost>予定工数＝予定枠</button>
    <button type=button id=slotMinus class=ghost>枠 −30分</button>
    <button type=button id=slotPlus class=ghost>枠 ＋30分</button>
    <button type=button id=shiftMinus class=ghost>開始 −30分</button>
    <button type=button id=shiftPlus class=ghost>開始 ＋30分</button>
    <span class=small>予定工数は案件工数集計、予定枠は日フォーカスの時間バーに使います。</span>
   </div>

   <div><label>主担当</label><select id=mtEmployee>${activeEmployees().map(x=>`<option value="${x.id}" ${x.id===t0.employeeId?'selected':''}>${x.name}</option>`).join('')}</select></div>
   <div><label>主担当の車両</label><select id=mtVehicle>${vehicleOpts(t0.vehicleId,false)}</select></div>

   <div style="grid-column:1/-1"><label>補助人員</label>
    <div class=passenger-grid>${activeEmployees().filter(x=>x.id!==t0.employeeId).map(x=>`<label><input type=checkbox data-helper="${x.id}" ${(t0.passengerIds||[]).includes(x.id)?'checked':''}>${x.name}</label>`).join('')}</div>
   </div>

   <div style="grid-column:1/-1"><label>補助人員の車両</label>
    <div id=helperVehicleArea class=helper-vehicle-area></div>
    <div class=small>一緒に移動する人は「主担当と同じ車両」。別のトラック等で移動する場合は、その人の車両を指定します。</div>
   </div>

   <div><label>状態</label><select id=mtStatus>${[['confirmed','確定'],['provisional','仮予定'],['pending','ペンディング / 未割当']].map(([v,l])=>`<option value="${v}" ${v===t0.status?'selected':''}>${l}</option>`).join('')}</select></div>
   <div class=urgentbox><input id=mtUrgent type=checkbox ${t0.urgent?'checked':''}> 🔴 緊急対応</div>
  </div>
  ${edit?`<div class=history><b>変更履歴</b>${(t0.history||[]).slice().reverse().map(h=>`<div class=history-item>${h.at||''}　${h.text}</div>`).join('')||'<div class=history-item>履歴なし</div>'}</div>`:''}
 `,()=>{
   const category=$('mtCategory').value;
   const hours=Math.round((+$('mtHours').value||0)*2)/2;
   const slotHours=Math.round((+$('mtSlotHours').value||0)*2)/2;
   const rawStart=$('mtStart').value;
   const start=rawStart?snapTime30(rawStart):'';
   const helperIds=[...$('modalBody').querySelectorAll('[data-helper]:checked')].map(x=>x.dataset.helper);
   const helperVehicles={};
   helperIds.forEach(id=>{
     const el=$(`helperVeh_${id}`);
     helperVehicles[id]=el?el.value:'__MAIN__';
   });
   const n={...t0,id:t0.id,date:$('mtDate').value,name:$('mtName').value.trim(),category,type:category,
    projectId:$('mtProject').value,clientSite:category==='客先案件'?($('mtClientSite')?.value.trim()||''):'',
    employeeId:$('mtEmployee').value,vehicleId:$('mtVehicle').value,helperVehicles,start,plannedHours:hours,slotHours,
    end:calcEndTime(start,slotHours),status:$('mtStatus').value,urgent:$('mtUrgent').checked,
    passengerIds:helperIds};
   if(n.status!=='pending'&&(!n.date||!n.start))return alert('確定・仮予定は日付と開始時刻を入力してください。');
   if(n.plannedHours<=0)return alert('予定工数を入力してください。');
   if(n.slotHours<=0)return alert('予定枠を入力してください。');
   if(n.status!=='pending'&&!n.end)return alert('予定工数が24:00を超えています。');

   const conflict=findMainAssigneeConflict(n,edit?t0.id:'');
   if(conflict){
    const conflictEnd=taskEnd(conflict);
    if(sameClientTask(n,conflict)){
     const ok=confirm(`主担当「${empName(n.employeeId)}」の時間が重複しています。\n\n既存：${conflict.id} ${taskDisplayName(conflict)}　${conflict.start}～${conflictEnd}\n新規：${n.id} ${taskDisplayName(n)}　${n.start}～${n.end}\n\n同一客先と判定しました。\n同一訪問として重ねて登録しますか？`);
     if(!ok)return;
     const group=conflict.visitGroupId||nextVisitGroupId();conflict.visitGroupId=group;n.visitGroupId=group;
     conflict.history=[...(conflict.history||[]),{at:new Date().toLocaleString('ja-JP'),text:`${n.id} と同一訪問 ${group} に統合`}];
    }else return alert(`主担当「${empName(n.employeeId)}」の時間が重複しています。\n\n重複タスク：${conflict.id} ${taskDisplayName(conflict)}\n${conflict.start} ～ ${conflictEnd}\n\n客先が異なるため同時配置できません。時間をずらしてください。`);
   }
   if(edit){
    n.history=[...(t0.history||[]),{at:new Date().toLocaleString('ja-JP'),text:'タスク内容を編集'}];
    const i=db.tasks.findIndex(x=>x.id===t0.id);if(i>=0)db.tasks[i]=n;
   }else db.tasks.push(n);
   if(n.date)currentDay=n.date;
   save();closeModal();renderAll();showView('day');
  });

 const renderHelperVehicles=()=>{
   const area=$('helperVehicleArea');
   if(!area)return;
   const ids=[...$('modalBody').querySelectorAll('[data-helper]:checked')].map(x=>x.dataset.helper);
   area.innerHTML=ids.length?ids.map(id=>{
     const selected=t0.helperVehicles?.[id] ?? '__MAIN__';
     return `<div class=helper-vehicle-row><b>${empName(id)}</b><select id="helperVeh_${id}">${vehicleOpts(selected,true)}</select></div>`;
   }).join(''):'<div class=small>補助人員を選ぶと、ここに車両指定が表示されます。</div>';
 };
 $('modalBody').querySelectorAll('[data-helper]').forEach(x=>x.addEventListener('change',renderHelperVehicles));
 renderHelperVehicles();

 const setSiteFromProject=()=>{
  if($('mtCategory').value!=='客先案件')return;
  $('mtClientSite').value=taskSiteDefault($('mtProject').value);
 };
 document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{
  $('mtCategory').value=b.dataset.kind;
  document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));
  $('clientSiteWrap').style.display=b.dataset.kind==='客先案件'?'block':'none';
  if(b.dataset.kind==='客先案件'&&!$('mtClientSite').value)setSiteFromProject();
 });
 $('mtProject').onchange=()=>{
  if(!$('mtName').value.trim())$('mtName').placeholder=$('mtProject').value?`空欄なら「${proj($('mtProject').value)?.name||'案件名'}」を表示`:'案件なしなら「予定」';
  setSiteFromProject();
 };
 $('resetSite').onclick=setSiteFromProject;

 const refreshEnd=()=>{
  if($('mtStart').value)$('mtStart').value=snapTime30($('mtStart').value);
  $('mtHours').value=Math.max(.5,Math.round((+$('mtHours').value||.5)*2)/2);
  $('mtSlotHours').value=Math.max(.5,Math.round((+$('mtSlotHours').value||.5)*2)/2);
  $('mtEnd').value=calcEndTime($('mtStart').value,+$('mtSlotHours').value||0);
 };
 $('mtStart').addEventListener('change',refreshEnd);
 $('mtHours').addEventListener('change',refreshEnd);
 $('mtSlotHours').addEventListener('change',refreshEnd);
 $('slotFromHours').onclick=()=>{$('mtSlotHours').value=$('mtHours').value;refreshEnd()};
 $('slotMinus').onclick=()=>{$('mtSlotHours').value=Math.max(.5,(+$('mtSlotHours').value||.5)-.5);refreshEnd()};
 $('slotPlus').onclick=()=>{$('mtSlotHours').value=(+$('mtSlotHours').value||.5)+.5;refreshEnd()};
 const shift=mins=>{
  if(!$('mtStart').value)$('mtStart').value='08:30';
  let total=Math.round(timeNum($('mtStart').value)*60/30)*30+mins;
  total=Math.max(0,Math.min(1410,total));
  $('mtStart').value=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;refreshEnd();
 };
 $('shiftMinus').onclick=()=>shift(-30);$('shiftPlus').onclick=()=>shift(30);

 if(edit){
  const foot=$('modal').querySelector('.modalfoot'),row=document.createElement('div');row.className='task-action-row';
  row.innerHTML=`<button type=button id=postponeBtn class=postpone>日延べ</button><button type=button id=pendingBtn class=pending2>ペンディング</button><button type=button id=deleteTaskBtn class=danger2>削除</button>`;
  foot.prepend(row);
  $('postponeBtn').onclick=()=>{closeModal();postponeTask(t0)};
  $('pendingBtn').onclick=()=>{const x=db.tasks.find(a=>a.id===t0.id);x.status='pending';x.history=[...(x.history||[]),{at:new Date().toLocaleString('ja-JP'),text:'ペンディングへ移動'}];save();closeModal();renderAll();showView('pending')};
  $('deleteTaskBtn').onclick=()=>{if(confirm(`${t0.id} を削除しますか？`)){db.tasks=db.tasks.filter(a=>a.id!==t0.id);save();closeModal();renderAll();showView('day')}};
 }
}
function postponeTask(t){const urg=db.tasks.filter(x=>x.urgent&&x.id!==t.id);openModal('タスクを日延べ',`<div class=form><div><label>現在日</label><input value="${t.date}" disabled></div><div><label>移動先</label><input id=ppDate type=date value="${addDays(t.date,1)}"></div><div><label>理由</label><select id=ppReason><option>通常変更</option><option>客先都合</option><option>社内都合</option><option>前工程遅延</option><option>緊急対応による押出し</option></select></div><div><label>原因となった緊急タスク</label><select id=ppEmergency><option value="">-</option>${urg.map(x=>`<option value="${x.id}">${x.date} ${x.id} ${taskDisplayName(x)}</option>`).join('')}</select></div></div>`,()=>{const x=db.tasks.find(a=>a.id===t.id),old=x.date,n=$('ppDate').value;if(!n)return;x.date=n;x.history=[...(x.history||[]),{at:new Date().toLocaleString('ja-JP'),text:`日延べ ${old} → ${n} / ${$('ppReason').value}${$('ppEmergency').value?' / 原因 '+$('ppEmergency').value:''}`}];x.postponeReason=$('ppReason').value;x.causedByEmergencyId=$('ppEmergency').value||'';save();currentDay=n;closeModal();renderAll();showView('day')})}

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
   <td><b>${taskDisplayName(t)}</b>${t.clientSite?`<br><span class=small>${t.clientSite}</span>`:''}</td>
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

let dayBarDrag=null;
function minutesToTime(total){
 total=Math.max(0,Math.min(1430,Math.round(total/30)*30));
 return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
function dayBarRangeText(startMin,hours){
 const endMin=startMin+Math.round(hours*60);
 const end=endMin>=1440?'24:00':minutesToTime(endMin);
 return `${minutesToTime(startMin)}–${end}　${hours.toFixed(1)}h`;
}
function showDragTip(text,x,y){
 let tip=document.getElementById('dayDragTip');
 if(!tip){tip=document.createElement('div');tip.id='dayDragTip';tip.className='day-drag-tip';document.body.appendChild(tip)}
 tip.textContent=text;tip.style.left=`${x+12}px`;tip.style.top=`${y-38}px`;tip.style.display='block';
}
function hideDragTip(){const t=document.getElementById('dayDragTip');if(t)t.style.display='none'}
function bindDayBarInteractions(){
 document.querySelectorAll('[data-bar]').forEach(el=>{
  let pressTimer=null,startPoint=null,suppressClick=false;
  const begin=(ev,mode)=>{
   const task=db.tasks.find(t=>t.id===el.dataset.bar);
   if(!task||task.status==='pending'||!task.start)return;
   const gantt=el.closest('.gantt'); if(!gantt)return;
   const rect=gantt.getBoundingClientRect();
   const startMin=Math.round(timeNum(task.start)*60/30)*30;
   const slotHours=+(task.slotHours??task.plannedHours)||.5;
   dayBarDrag={el,task,mode,rect,startX:ev.clientX,startMin,slotHours,newStartMin:startMin,newSlotHours:slotHours,moved:false};
   el.classList.add('dragging');document.body.classList.add('bar-drag-active');
   try{el.setPointerCapture(ev.pointerId)}catch(e){}
   showDragTip(dayBarRangeText(startMin,slotHours),ev.clientX,ev.clientY);
  };
  el.addEventListener('pointerdown',ev=>{
   if(ev.button!=null&&ev.button!==0)return;
   const handle=ev.target.closest('.bar-resize-handle');
   startPoint={x:ev.clientX,y:ev.clientY}; suppressClick=false;
   if(handle){ev.preventDefault();ev.stopPropagation();begin(ev,'resize');suppressClick=true}
   else if(ev.pointerType==='mouse'){ev.preventDefault();begin(ev,'move')}
   else pressTimer=setTimeout(()=>{begin(ev,'move');suppressClick=true},450);
  });
  el.addEventListener('pointermove',ev=>{
   if(pressTimer&&startPoint&&(Math.abs(ev.clientX-startPoint.x)>8||Math.abs(ev.clientY-startPoint.y)>8)){clearTimeout(pressTimer);pressTimer=null}
   const d=dayBarDrag;if(!d||d.el!==el)return;
   ev.preventDefault();
   const deltaMin=Math.round((((ev.clientX-d.startX)/d.rect.width)*1440)/30)*30;
   if(d.mode==='move'){
    const duration=Math.round(d.slotHours*60);
    d.newStartMin=Math.max(0,Math.min(1440-duration,d.startMin+deltaMin));
    d.el.style.left=`${d.newStartMin/1440*100}%`;
   }else{
    let dur=Math.max(30,Math.round(d.slotHours*60)+deltaMin);
    dur=Math.min(1440-d.startMin,dur);
    d.newSlotHours=dur/60;d.el.style.width=`${dur/1440*100}%`;
   }
   if(Math.abs(deltaMin)>=30){d.moved=true;suppressClick=true}
   showDragTip(dayBarRangeText(d.newStartMin,d.newSlotHours),ev.clientX,ev.clientY);
  });
  el.addEventListener('pointerup',ev=>{
   if(pressTimer){clearTimeout(pressTimer);pressTimer=null}
   const d=dayBarDrag;
   if(!d||d.el!==el){if(!suppressClick)taskModal(db.tasks.find(t=>t.id===el.dataset.bar));return}
   ev.preventDefault();ev.stopPropagation();
   d.el.classList.remove('dragging');document.body.classList.remove('bar-drag-active');hideDragTip();dayBarDrag=null;
   if(!d.moved){if(d.mode!=='resize')taskModal(d.task);else renderDay();return}
   const oldStart=d.task.start,oldSlot=+(d.task.slotHours??d.task.plannedHours)||.5;
   const newStart=minutesToTime(d.newStartMin),newSlot=Math.max(.5,Math.round(d.newSlotHours*2)/2);
   const candidate={...d.task,start:newStart,slotHours:newSlot,end:calcEndTime(newStart,newSlot)};
   const conflict=findMainAssigneeConflict(candidate,d.task.id);
   if(conflict&&!sameClientTask(candidate,conflict)){
    alert(`時間を変更できません。\n主担当「${empName(candidate.employeeId)}」の ${conflict.id} ${taskDisplayName(conflict)} と重複します。`);
    renderDay();return;
   }
   if(conflict&&sameClientTask(candidate,conflict)){
    if(!confirm(`変更後の時間が ${conflict.id} ${taskDisplayName(conflict)} と重複します。\n同一客先として重ねますか？`)){renderDay();return}
    const group=conflict.visitGroupId||nextVisitGroupId();conflict.visitGroupId=group;d.task.visitGroupId=group;
   }
   d.task.start=newStart;d.task.slotHours=newSlot;d.task.end=calcEndTime(newStart,newSlot);
   d.task.history=[...(d.task.history||[]),{at:new Date().toLocaleString('ja-JP'),text:d.mode==='move'?`時間バー移動 ${oldStart} → ${newStart}`:`予定枠変更 ${oldSlot}h → ${newSlot}h`}];
   save();renderAll();showView('day');
  });
  el.addEventListener('pointercancel',()=>{
   if(pressTimer){clearTimeout(pressTimer);pressTimer=null}
   if(dayBarDrag?.el===el){dayBarDrag=null;el.classList.remove('dragging');document.body.classList.remove('bar-drag-active');hideDragTip();renderDay()}
  });
 });
}

function renderPending(){
 $('pending').innerHTML=`<div class=panel>
  <div class=daynav><div><h3>ペンディング / 未割当一覧</h3><p class=small>日程未確定でも予定工数だけ保持できます。</p></div>
   <div class=actions><button id=pendingExcel class=ghost>Excel出力</button><button id=pendingAdd class=primary>＋タスク</button></div>
  </div>
  ${pendingListHtml()}
 </div>`;
 $('pendingExcel').onclick=()=>{
  const rows=pendingTasks().map(t=>{
   const p=proj(t.projectId);
   return [t.id,t.category||'',taskDisplayName(t),t.projectId||'',deliveryCustomerId(p),deliveryCustomerName(p),
    billingCustomerId(p),billingCustomerName(p),t.clientSite||'',+t.plannedHours||0,+(t.slotHours??t.plannedHours)||0,empName(t.employeeId),
    t.date||'未定',t.start||'未定',statusText(t.status)];
  });
  exportExcelXml('ペンディング一覧_'+new Date().toISOString().slice(0,10),'ペンディング一覧',
   ['タスクID','区分','内容','案件ID','納品先コード','納品先','支払先コード','支払先','客先/所在地','予定工数h','予定枠h','主担当','日付','開始','状態'],rows);
 };
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
   const rowVehicle=taskVehicleLabelForEmployee(t,e.id);
   bars+=`<div class="bar ${taskClass(t)} ${t.urgent?'urgent':''} task-click${stackClass}" data-bar="${t.id}" data-team-count="${teamCount}" style="left:${l}%;width:${w}%">${t.urgent?'🔴 ':''}${isHelp?'↳補助 ':''}${t.id} ${taskDisplayName(t)}${rowVehicle?` ｜🚚 ${rowVehicle}`:''}${teamCount>1?` · ${teamCount}人`:''}<span class="bar-resize-handle" title="予定枠を伸縮"></span></div>`;
  });

  const cars=[...new Set(my.map(t=>taskVehicleLabelForEmployee(t,e.id)).filter(Boolean))].join(', ');
  const att=attendanceFor(e.id,currentDay);
  const attText=att?(att.type==='出勤'?`勤怠 ${att.work||0}h${att.overtime?` / 残業 ${att.overtime}h`:''}`:`${att.type}`):'勤怠未入力';

  const firstTask=earliestTaskForEmployee(e.id,ts);
  rows+=`<div class="grow staff-row"><div class=who><div class=ename>${e.name}</div><div class=car>${cars||'車両 -'}</div><div class=small>${attText}</div>${firstTask?`<div class=sort-hint>先頭 ${firstTask.start} ${firstTask.id}</div>`:''}</div><div class=track style="--hours:${rd.cols}">${timeBands(rd.s,rd.e)}${bars}</div></div>`;
 });

 const urg=allTs.filter(t=>t.urgent);
 $('day').innerHTML=`<div class=panel>
  <div class=daynav><button id=dPrev class=ghost>←前日</button><div class=datebox>${dateLabel(currentDay)}</div><button id=dNext class=ghost>翌日→</button></div>
  ${hs.map(h=>`<div class="banner ${h.type==='statutory'?'stat':'company'}">${h.name}</div>`).join('')}
  ${urg.length?`<div class=banner style="background:#fff1f2;color:#991b1b">🔴 緊急 ${urg.length}件：${urg.map(x=>`${x.id} ${taskDisplayName(x)}${taskDeliveryName(x)?`【${taskDeliveryName(x)}】`:''}`).join(' / ')}</div>`:''}

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
  <p class=small>1目盛＝1時間。青＝客先、緑＝社内、黄＝その他。点線＋点滅＝仮予定。赤＝緊急。</p>
 </div>

 ${pendingMiniPanel('ペンディング / 未割当')}

 <div class=panel><h3>この日のタスク</h3><div class=tablewrap><table>
  <tr><th>ID</th><th>時間</th><th>区分</th><th>内容</th><th>客先/所在地</th><th>案件</th><th>担当/車両</th><th>補助/車両</th><th>状態</th><th></th></tr>
  ${allTs.map(t=>`<tr>
   <td>${t.urgent?'<span class=urgent-badge>緊急</span><br>':''}${t.id}</td>
   <td>${t.start}-${t.end}</td>
   <td>${t.category||t.type}</td>
   <td>${taskDisplayName(t)}</td>
   <td>${t.category==='客先案件'?(t.clientSite||'-'):'-'}</td>
   <td>${projectLabel(t.projectId)}</td>
   <td>${empName(t.employeeId)}${taskVehicleLabelForEmployee(t,t.employeeId)?`<br><span class=small>🚚 ${taskVehicleLabelForEmployee(t,t.employeeId)}</span>`:''}</td>
   <td>${(t.passengerIds||[]).map(id=>`${empName(id)}${taskVehicleLabelForEmployee(t,id)?` <span class=small>🚚 ${taskVehicleLabelForEmployee(t,id)}</span>`:''}`).join('<br>')||'-'}</td>
   <td><span class="badge ${statusBadge(t.status)} ${t.status}">${statusText(t.status)}</span></td>
   <td><button class=ghost data-te="${t.id}">編集</button> <button class=danger data-td="${t.id}">削除</button></td>
  </tr>`).join('')}
 </table></div></div>`;

 $('dPrev').onclick=()=>{currentDay=addDays(currentDay,-1);syncMonthToDay();renderDay()};
 $('dNext').onclick=()=>{currentDay=addDays(currentDay,1);syncMonthToDay();renderDay()};
 $('openAttendance').onclick=()=>{renderAttendance();showView('attendance')};
 $('addTask').onclick=()=>taskModal(null);
 document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{dayRange=b.dataset.range;renderDay()});
 document.querySelectorAll('[data-te]').forEach(b=>b.onclick=()=>taskModal(db.tasks.find(t=>t.id===b.dataset.te)));
 bindDayBarInteractions();
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
function masterModal(type,x){
 const edit=!!x;
 if(type==='employees'){
  const r=x||{id:'EMP-'+String(db.employees.length+1).padStart(3,'0'),name:'',role:'社員',active:true,attendance:true,start:'08:00',end:'17:00',order:db.employees.length+1};
  openModal(edit?'社員編集':'社員追加',`<div class=form><div><label>社員ID</label><input id=mmId value="${r.id}"></div><div><label>氏名</label><input id=mmName value="${r.name}"></div><div><label>役職</label><input id=mmRole value="${r.role}"></div><div><label>表示順</label><input id=mmOrder type=number value="${r.order}"></div><div><label>標準開始</label><input id=mmStart type=time value="${r.start}"></div><div><label>標準終了</label><input id=mmEnd type=time value="${r.end}"></div></div>`,()=>{
   const n={...r,id:$('mmId').value.trim(),name:$('mmName').value.trim(),role:$('mmRole').value.trim(),order:+$('mmOrder').value||99,start:$('mmStart').value,end:$('mmEnd').value};
   if(edit){const old=r.id;db.employees[db.employees.findIndex(a=>a.id===old)]=n;db.tasks.forEach(t=>{if(t.employeeId===old)t.employeeId=n.id});db.projects.forEach(p=>{if(p.ownerId===old)p.ownerId=n.id})}else db.employees.push(n);
   save();closeModal();renderAll();showView('masters');
  });
 }else if(type==='vehicles'){
  const r=x||{id:'CAR-'+String(db.vehicles.length+1).padStart(3,'0'),name:'',type:'',number:'',active:true,note:''};
  openModal(edit?'車両編集':'車両追加',`<div class=form><div><label>車両ID</label><input id=mmId value="${r.id}"></div><div><label>呼称</label><input id=mmName value="${r.name}"></div><div><label>車種</label><input id=mmType value="${r.type}"></div><div><label>ナンバー</label><input id=mmNumber value="${r.number}"></div><div><label>備考</label><textarea id=mmNote>${r.note||''}</textarea></div></div>`,()=>{
   const n={...r,id:$('mmId').value.trim(),name:$('mmName').value.trim(),type:$('mmType').value.trim(),number:$('mmNumber').value.trim(),note:$('mmNote').value.trim()};
   if(edit){const old=r.id;db.vehicles[db.vehicles.findIndex(a=>a.id===old)]=n;db.tasks.forEach(t=>{if(t.vehicleId===old)t.vehicleId=n.id})}else db.vehicles.push(n);
   save();closeModal();renderAll();showView('masters');
  });
 }else{
  const r=x||{id:nextCustomerCode(),name:'',kana:'',postal:'',address1:'',address2:'',address:'',contact:'',phone:'',fax:'',short:'',active:true,source:'portal'};
  openModal(edit?'顧客編集':'顧客追加',`<div class=form>
   <div><label>顧客コード</label><input id=mmId value="${r.id}" readonly></div>
   <div><label>納入先名</label><input id=mmName value="${r.name||''}"></div>
   <div><label>フリガナ</label><input id=mmKana value="${r.kana||''}"></div>
   <div><label>郵便番号</label><input id=mmPostal value="${r.postal||''}"></div>
   <div><label>住所1</label><input id=mmAddress1 value="${r.address1||r.address||''}"></div>
   <div><label>住所2</label><input id=mmAddress2 value="${r.address2||''}"></div>
   <div><label>TEL</label><input id=mmPhone value="${r.phone||''}"></div>
   <div><label>FAX</label><input id=mmFax value="${r.fax||''}"></div>
   <div><label>担当者</label><input id=mmContact value="${r.contact||''}"></div>
  </div>`,()=>{
   const address1=$('mmAddress1').value.trim(),address2=$('mmAddress2').value.trim();
   const n={...r,id:r.id,name:$('mmName').value.trim(),short:$('mmName').value.trim(),kana:$('mmKana').value.trim(),
    postal:$('mmPostal').value.trim(),address1,address2,address:[address1,address2].filter(Boolean).join(' '),
    contact:$('mmContact').value.trim(),phone:$('mmPhone').value.trim(),fax:$('mmFax').value.trim(),source:r.source||'portal'};
   if(!n.name)return alert('納入先名を入力してください');
   if(edit){
    const old=r.id;db.customers[db.customers.findIndex(a=>a.id===old)]=n;
    db.projects.forEach(p=>{
     if(p.customerId===old)p.customerId=n.id;
     if(p.deliveryCustomerId===old)p.deliveryCustomerId=n.id;
     if(p.billingCustomerId===old)p.billingCustomerId=n.id;
    });
   }else{
    if(db.customers.some(c=>c.id===n.id))return alert('顧客コードが重複しています');
    db.customers.push(n);
   }
   save();closeModal();renderAll();showView('masters');
  });
 }
}
function renderMasters(){
 const isCustomers=masterType==='customers';
 let list=masterType==='employees'?db.employees:masterType==='vehicles'?db.vehicles:db.customers;
 const q=(window.__customerSearch||'').trim().toLowerCase();
 if(isCustomers&&q){
  list=list.filter(c=>[c.id,c.name,c.kana,c.postal,c.address,c.phone].join(' ').toLowerCase().includes(q));
 }
 const total=list.length;
 const visible=isCustomers?list.slice(0,150):list;

 $('masters').innerHTML=`<div class=panel>
  <div class=master-tabs><button class="master-tab ${masterType==='employees'?'active':''}" data-mt=employees>社員</button><button class="master-tab ${masterType==='vehicles'?'active':''}" data-mt=vehicles>車両</button><button class="master-tab ${masterType==='customers'?'active':''}" data-mt=customers>顧客</button></div>
  <div class=daynav><h3>${masterType==='employees'?'社員':masterType==='vehicles'?'車両':'顧客'}マスタ</h3>
   <div class=actions>${isCustomers?'<button id=customerExcel class=ghost>Excel出力</button>':''}<button id=mAdd class=primary>＋追加</button></div>
  </div>
  ${isCustomers?`<div class=master-search><input id=customerSearch placeholder="顧客コード・名称・フリガナ・住所・TELで検索" value="${window.__customerSearch||''}"><span class=small>${total}件${total>150?'（先頭150件表示）':''}</span></div>`:''}
  ${visible.map(x=>`<div class=master-card><h4>${x.id} ${taskDisplayName(x)} ${x.active?'':'[無効]'}</h4>
   <div class=small>${masterType==='employees'?`${x.role} / ${x.start}-${x.end}`:masterType==='vehicles'?`${x.type} / ${x.number}`:`${x.kana||''} / ${x.postal||''} ${x.address||''} / TEL ${x.phone||'-'} / FAX ${x.fax||'-'}`}</div>
   <div class=actions><button class=ghost data-me="${x.id}">編集</button><button class=ghost data-ma="${x.id}">${x.active?'無効化':'有効化'}</button></div>
  </div>`).join('')}
 </div>`;

 document.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>{masterType=b.dataset.mt;window.__customerSearch='';renderMasters()});
 $('mAdd').onclick=()=>masterModal(masterType,null);
 if(isCustomers){
  $('customerSearch').oninput=e=>{window.__customerSearch=e.target.value;renderMasters();setTimeout(()=>$('customerSearch')?.focus(),0)};
  $('customerExcel').onclick=()=>{
   const rows=db.customers.map(c=>[c.id,c.name,c.kana||'',c.postal||'',c.address1||'',c.address2||'',c.phone||'',c.fax||'',c.contact||'',c.source||'portal',c.active!==false?'有効':'無効']);
   exportExcelXml('顧客マスタ_'+new Date().toISOString().slice(0,10),'顧客マスタ',
    ['顧客コード','納入先名','フリガナ','郵便番号','住所1','住所2','TEL','FAX','担当者','登録元','状態'],rows);
  };
 }
 document.querySelectorAll('[data-me]').forEach(b=>b.onclick=()=>masterModal(masterType,(masterType==='employees'?emp:masterType==='vehicles'?veh:cust)(b.dataset.me)));
 document.querySelectorAll('[data-ma]').forEach(b=>b.onclick=()=>{const x=(masterType==='employees'?emp:masterType==='vehicles'?veh:cust)(b.dataset.ma);x.active=!x.active;save();renderAll();showView('masters')});
}
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
