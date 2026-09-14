import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBI1eLtxZYXdCc0Jt_siYYW0JtAi0aCKgU",
  authDomain: "portal-31d10.firebaseapp.com",
  projectId: "portal-31d10",
  storageBucket: "portal-31d10.firebasestorage.app",
  messagingSenderId: "684112341136",
  appId: "1:684112341136:web:3ade6e4459a71bb778d015",
  measurementId: "G-Q0QZ7ZZR69"
};

const PORTAL_KEY='companyPortalV06';
const PRE_CLOUD_BACKUP_KEY='companyPortalV06_backup_before_cloud';
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const firestore=getFirestore(app);
const provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});

const gate=document.getElementById('authGate');
const portal=document.getElementById('portalApp');
const statusEl=document.getElementById('authStatus');
const loginBtn=document.getElementById('googleLoginBtn');
const cloudStatus=document.getElementById('cloudStatus');
const cloudInitBtn=document.getElementById('cloudInitBtn');
let portalLoaded=false;
let currentUser=null;
let cloudDocExists=false;
let unsubscribeState=null;
let uploadTimer=null;
let applyingRemote=false;
let lastUploadedJson='';
function makeClientId(){
  try{
    if(globalThis.crypto && typeof globalThis.crypto.randomUUID==='function'){
      return globalThis.crypto.randomUUID();
    }
  }catch(e){}
  return 'portal-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
}
let clientId='';
try{
  clientId=sessionStorage.getItem('portalCloudClientId')||makeClientId();
  sessionStorage.setItem('portalCloudClientId',clientId);
}catch(e){
  console.warn('sessionStorage unavailable; using temporary client id',e);
  clientId=makeClientId();
}

function status(text,isError=false){
  statusEl.textContent=text||'';
  statusEl.classList.toggle('error',!!isError);
}
function setCloudStatus(text,kind=''){
  if(!cloudStatus)return;
  cloudStatus.textContent=text;
  cloudStatus.classList.remove('ok','warn','error');
  if(kind)cloudStatus.classList.add(kind);
}
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);
  });
}
async function loadPortal(){
  if(portalLoaded)return;
  portalLoaded=true;
  try{await loadScript('time-snapshot-import.js?v=1')}catch(e){console.warn('TIME snapshot helper load skipped',e)}
  await loadScript('app.js?v=2.1.1-sync-20260914');
}
function authErrorMessage(err){
  const c=err?.code||'';
  if(c.includes('unauthorized-domain'))return 'このURLがFirebaseの承認済みドメインに登録されていません。';
  if(c.includes('popup-closed-by-user'))return 'ログイン画面が閉じられました。もう一度お試しください。';
  if(c.includes('network-request-failed'))return 'ネットワーク接続を確認してください。';
  if(c.includes('permission-denied'))return 'このGoogleアカウントにはポータル利用権限がありません。';
  return `ログインまたは同期に失敗しました${c?`（${c}）`:''}`;
}
function currentLocalJson(){
  return localStorage.getItem(PORTAL_KEY)||'';
}
function localSummary(){
  try{
    const d=JSON.parse(currentLocalJson()||'{}');
    return {projects:d.projects?.length||0,tasks:d.tasks?.length||0,customers:d.customers?.length||0,employees:d.employees?.length||0};
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
  try{JSON.parse(json)}catch(e){throw new Error('クラウドデータのJSONが壊れています。')}
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
    sourceClientId:clientId,
    reason,
    schemaVersion:'2.1.1'
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
    cloudInitBtn.hidden=true;
    const data=snap.data()||{};
    const remoteJson=data.json||'';
    if(!remoteJson)return;
    if(data.sourceClientId===clientId){
      lastUploadedJson=remoteJson;
      setCloudStatus('クラウド同期済み','ok');
      return;
    }
    const localJson=currentLocalJson();
    if(remoteJson===localJson){
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
      console.error(e);applyingRemote=false;setCloudStatus('クラウド反映失敗','error');
    }
  },err=>{
    console.error(err);setCloudStatus('クラウド接続失敗','error');
  });
}

window.PortalCloudSync={
  notifyLocalSave(reason){scheduleUpload(reason)},
  async flush(){await uploadNow('manual-flush')},
  get enabled(){return cloudDocExists}
};

cloudInitBtn?.addEventListener('click',async()=>{
  if(!currentUser)return;
  const json=currentLocalJson();
  if(!json){alert('この端末に初回登録できるポータルデータがありません。');return;}
  const s=localSummary();
  const ok=confirm(`この端末のデータを社内共通データとして初回登録します。\n\n案件 ${s.projects}件\n予定 ${s.tasks}件\n顧客 ${s.customers}件\n社員 ${s.employees}件\n\nPC側の現在データを正として登録する場合だけ「OK」を押してください。`);
  if(!ok)return;
  cloudInitBtn.disabled=true;
  try{
    // Preserve an untouched local backup before first cloud registration.
    localStorage.setItem(PRE_CLOUD_BACKUP_KEY,JSON.stringify({savedAt:new Date().toISOString(),json}));
    setCloudStatus('初回クラウド登録中…','warn');
    await setDoc(doc(firestore,'portalData','state'),{
      json,
      updatedAt:serverTimestamp(),
      updatedBy:currentUser.email||currentUser.uid,
      sourceClientId:clientId,
      reason:'initial-pc-upload',
      schemaVersion:'2.1.1'
    });
    cloudDocExists=true;
    lastUploadedJson=json;
    cloudInitBtn.hidden=true;
    setCloudStatus('初回登録完了・クラウド同期済み','ok');
    startRealtime();
    alert('PCの現在データをクラウドへ登録しました。\nこのあとスマホでポータルを再読み込みすると同じ予定が表示されます。');
  }catch(e){
    console.error(e);setCloudStatus('初回登録失敗','error');cloudInitBtn.disabled=false;
    alert('初回クラウド登録に失敗しました。Firestoreルールと通信状態を確認してください。');
  }
});

await setPersistence(auth,browserLocalPersistence);
try{await getRedirectResult(auth)}catch(e){console.warn(e);status(authErrorMessage(e),true)}


loginBtn.addEventListener('click',async()=>{
  loginBtn.disabled=true;status('Googleログインを開いています…');
  try{
    // v2.1.0cでPC・スマホ双方で動作確認済みの方式を優先。
    await signInWithPopup(auth,provider);
  }catch(e){
    console.warn('popup login failed',e);
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e?.code)){
      await signInWithRedirect(auth,provider);
      return;
    }
    status(authErrorMessage(e),true);
    loginBtn.disabled=false;
  }
});

document.getElementById('logoutBtn').addEventListener('click',async()=>{
  if(unsubscribeState)unsubscribeState();
  await signOut(auth);
  location.reload();
});

onAuthStateChanged(auth,async user=>{
  if(!user){
    currentUser=null;
    portal.classList.add('auth-hidden');gate.classList.remove('auth-hidden');
    loginBtn.disabled=false;status('ログインしてください');return;
  }

  currentUser=user;
  status(`Googleログイン済み：${user.email||user.displayName||'アカウント'} / 利用権限を確認しています…`);

  try{
    const allowed=await verifyActiveUser(user);
    if(!allowed){
      await signOut(auth);
      status(`このGoogleアカウント（${user.email||user.uid}）はポータル利用許可されていません。`,true);
      loginBtn.disabled=false;
      return;
    }
  }catch(e){
    console.error('user permission check failed',e);
    status(`利用権限の確認に失敗しました${e?.code?`（${e.code}）`:''}。ページを再読み込みしてください。`,true);
    setCloudStatus('利用権限確認失敗','error');
    loginBtn.disabled=false;
    return;
  }

  // Once the user is approved, do not trap them behind the login screen
  // just because Firestore synchronization is temporarily unavailable.
  try{
    const cloudSnap=await getCloudState();
    if(cloudSnap){
      cloudDocExists=true;
      const json=cloudSnap.data()?.json||'';
      if(json){
        installCloudJson(json);
        lastUploadedJson=json;
      }
      setCloudStatus('クラウド同期済み','ok');
      cloudInitBtn.hidden=true;
    }else{
      cloudDocExists=false;
      setCloudStatus('クラウド未登録','warn');
      cloudInitBtn.hidden=false;
    }
  }catch(e){
    console.error('cloud state read failed',e);
    cloudDocExists=false;
    setCloudStatus(`クラウド接続失敗${e?.code?`（${e.code}）`:''}`,'error');
    cloudInitBtn.hidden=true;
  }

  try{
    await loadPortal();
    document.getElementById('loginUser').textContent=user.email||user.displayName||'ログイン中';
    gate.classList.add('auth-hidden');
    portal.classList.remove('auth-hidden');
    status('');
    if(cloudDocExists)startRealtime();
  }catch(e){
    console.error(e);
    status('ポータルの読み込みに失敗しました。ページを再読み込みしてください。',true);
  }
});
