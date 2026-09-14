import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const PORTAL_KEY='companyPortalV06';
const PRE_CLOUD_BACKUP_KEY='companyPortalV06_backup_before_cloud';

let firestore=null;
let currentUser=null;
let cloudDocExists=false;
let unsubscribeState=null;
let uploadTimer=null;
let applyingRemote=false;
let lastUploadedJson='';
let cloudStatus=null;
let cloudInitBtn=null;
let sourceClientId='';

function makeClientId(){
  try{
    if(globalThis.crypto && typeof globalThis.crypto.randomUUID==='function'){
      return globalThis.crypto.randomUUID();
    }
  }catch(e){}
  return 'portal-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
}
function getClientId(){
  try{
    let v=sessionStorage.getItem('portalCloudClientId');
    if(!v){v=makeClientId();sessionStorage.setItem('portalCloudClientId',v)}
    return v;
  }catch(e){return makeClientId()}
}
function setCloudStatus(text,kind=''){
  if(!cloudStatus)return;
  cloudStatus.textContent=text;
  cloudStatus.classList.remove('ok','warn','error');
  if(kind)cloudStatus.classList.add(kind);
}
function currentLocalJson(){
  return localStorage.getItem(PORTAL_KEY)||'';
}
function localSummary(){
  try{
    const d=JSON.parse(currentLocalJson()||'{}');
    return {
      projects:d.projects?.length||0,
      tasks:d.tasks?.length||0,
      customers:d.customers?.length||0,
      employees:d.employees?.length||0
    };
  }catch{return {projects:0,tasks:0,customers:0,employees:0}}
}
async function verifyActiveUser(user){
  const snap=await getDoc(doc(firestore,'users',user.uid));
  return snap.exists() && snap.data()?.active===true;
}
async function getCloudState(){
  const snap=await getDoc(doc(firestore,'portalData','state'));
  return snap.exists()?snap:null;
}
function installCloudJson(json){
  if(!json)return false;
  JSON.parse(json);
  localStorage.setItem(PORTAL_KEY,json);
  return true;
}
async function uploadNow(reason='save'){
  if(!currentUser || !cloudDocExists || applyingRemote)return;
  const json=currentLocalJson();
  if(!json || json===lastUploadedJson)return;
  setCloudStatus('クラウドへ保存中…','warn');
  await setDoc(doc(firestore,'portalData','state'),{
    json,
    updatedAt:serverTimestamp(),
    updatedBy:currentUser.email||currentUser.uid,
    sourceClientId,
    reason,
    schemaVersion:'2.1.3'
  });
  lastUploadedJson=json;
  setCloudStatus('クラウド同期済み','ok');
}
function scheduleUpload(reason='save'){
  if(!cloudDocExists || applyingRemote)return;
  clearTimeout(uploadTimer);
  uploadTimer=setTimeout(()=>uploadNow(reason).catch(e=>{
    console.error(e);setCloudStatus('クラウド保存失敗','error');
  }),450);
}
function startRealtime(){
  if(unsubscribeState)unsubscribeState();
  unsubscribeState=onSnapshot(doc(firestore,'portalData','state'),snap=>{
    if(!snap.exists())return;
    cloudDocExists=true;
    if(cloudInitBtn)cloudInitBtn.hidden=true;
    const data=snap.data()||{};
    const remoteJson=data.json||'';
    if(!remoteJson)return;
    if(data.sourceClientId===sourceClientId || remoteJson===currentLocalJson()){
      lastUploadedJson=remoteJson;
      setCloudStatus('クラウド同期済み','ok');
      return;
    }
    try{
      applyingRemote=true;
      installCloudJson(remoteJson);
      setCloudStatus('他端末の更新を反映中…','warn');
      setTimeout(()=>location.reload(),250);
    }catch(e){
      console.error(e);
      applyingRemote=false;
      setCloudStatus('クラウド反映失敗','error');
    }
  },err=>{
    console.error(err);
    setCloudStatus(`クラウド接続失敗${err?.code?`（${err.code}）`:''}`,'error');
  });
}
function bindInitialUpload(){
  if(!cloudInitBtn || cloudInitBtn.dataset.bound==='1')return;
  cloudInitBtn.dataset.bound='1';
  cloudInitBtn.addEventListener('click',async()=>{
    if(!currentUser)return;
    const json=currentLocalJson();
    if(!json){alert('この端末に初回登録できるポータルデータがありません。');return;}
    const s=localSummary();
    const ok=confirm(`この端末のデータを社内共通データとして初回登録します。\n\n案件 ${s.projects}件\n予定 ${s.tasks}件\n顧客 ${s.customers}件\n社員 ${s.employees}件\n\n予定が入っているPC側でだけ「OK」を押してください。`);
    if(!ok)return;
    cloudInitBtn.disabled=true;
    try{
      localStorage.setItem(PRE_CLOUD_BACKUP_KEY,JSON.stringify({savedAt:new Date().toISOString(),json}));
      setCloudStatus('初回クラウド登録中…','warn');
      await setDoc(doc(firestore,'portalData','state'),{
        json,
        updatedAt:serverTimestamp(),
        updatedBy:currentUser.email||currentUser.uid,
        sourceClientId,
        reason:'initial-pc-upload',
        schemaVersion:'2.1.3'
      });
      cloudDocExists=true;
      lastUploadedJson=json;
      cloudInitBtn.hidden=true;
      setCloudStatus('初回登録完了・クラウド同期済み','ok');
      startRealtime();
      alert('PCの現在データをクラウドへ登録しました。スマホを再読み込みしてください。');
    }catch(e){
      console.error(e);
      setCloudStatus(`初回登録失敗${e?.code?`（${e.code}）`:''}`,'error');
      cloudInitBtn.disabled=false;
    }
  });
}

export async function initPortalCloud({firebaseApp,user,loadPortal,showPortal,showAuthError}){
  currentUser=user;
  sourceClientId=getClientId();
  firestore=getFirestore(firebaseApp);
  cloudStatus=document.getElementById('cloudStatus');
  cloudInitBtn=document.getElementById('cloudInitBtn');
  bindInitialUpload();

  let allowed=false;
  try{
    allowed=await verifyActiveUser(user);
  }catch(e){
    console.error('permission check failed',e);
    showAuthError(`利用権限の確認に失敗しました${e?.code?`（${e.code}）`:''}`);
    setCloudStatus('利用権限確認失敗','error');
    return false;
  }
  if(!allowed){
    showAuthError(`このGoogleアカウント（${user.email||user.uid}）はポータル利用許可されていません。`);
    setCloudStatus('利用不可','error');
    return false;
  }

  try{
    const snap=await getCloudState();
    if(snap){
      cloudDocExists=true;
      const json=snap.data()?.json||'';
      if(json){installCloudJson(json);lastUploadedJson=json}
      setCloudStatus('クラウド同期済み','ok');
      if(cloudInitBtn)cloudInitBtn.hidden=true;
    }else{
      cloudDocExists=false;
      setCloudStatus('クラウド未登録','warn');
      if(cloudInitBtn)cloudInitBtn.hidden=false;
    }
  }catch(e){
    console.error('cloud state read failed',e);
    setCloudStatus(`クラウド読込失敗${e?.code?`（${e.code}）`:''}`,'error');
    return false;
  }

  window.PortalCloudSync={
    notifyLocalSave(reason){scheduleUpload(reason)},
    async flush(){await uploadNow('manual-flush')},
    get enabled(){return cloudDocExists}
  };

  await loadPortal();
  showPortal();
  if(cloudDocExists)startRealtime();
  return true;
}

export function stopPortalCloud(){
  if(unsubscribeState)unsubscribeState();
  unsubscribeState=null;
}
