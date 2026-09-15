import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const VERSION = "2.2.1";
const CONFIG = window.FIREBASE_CONFIG || {};
const PORTAL_KEY = "companyPortalV06";
const BACKUP_KEY = "companyPortalV06_backup_before_cloud";

const configured =
  Boolean(CONFIG.apiKey) &&
  !String(CONFIG.apiKey).startsWith("PASTE_") &&
  Boolean(CONFIG.projectId) &&
  !String(CONFIG.projectId).startsWith("PASTE_");

let auth = null;
let db = null;
let user = null;
let unsubscribe = null;
let pushTimer = null;
let realtimeReady = false;
let initialized = false;
let redirectChecked = false;
let applyingRemote = false;
let lastUploadedJson = "";
let sourceClientId = "";
let portalLoaded = false;

const gate = document.getElementById("authGate");
const portal = document.getElementById("portalApp");
const statusEl = document.getElementById("authStatus");
const loginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const cloudStatus = document.getElementById("cloudStatus");
const cloudInitBtn = document.getElementById("cloudInitBtn");

function nowIso(){ return new Date().toISOString(); }
function status(text,isError=false){
  if(!statusEl) return;
  statusEl.textContent=text||"";
  statusEl.classList.toggle("error",!!isError);
}
function setCloudStatus(text,kind=""){
  if(!cloudStatus) return;
  cloudStatus.textContent=text;
  cloudStatus.classList.remove("ok","warn","error");
  if(kind) cloudStatus.classList.add(kind);
}
function makeClientId(){
  try{
    if(globalThis.crypto && typeof globalThis.crypto.randomUUID==="function") return globalThis.crypto.randomUUID();
  }catch(e){}
  return "portal-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10);
}
function getClientId(){
  try{
    let v=sessionStorage.getItem("portalCloudClientId");
    if(!v){ v=makeClientId(); sessionStorage.setItem("portalCloudClientId",v); }
    return v;
  }catch(e){ return makeClientId(); }
}
function stateRef(){
  if(!db || !user) throw new Error("Firestoreまたはログイン情報がありません。");
  return doc(db,"shared","portal-main");
}
function currentLocalJson(){ return localStorage.getItem(PORTAL_KEY)||""; }
function installCloudJson(json){
  if(!json) return false;
  JSON.parse(json);
  localStorage.setItem(PORTAL_KEY,json);
  return true;
}
function localSummary(){
  try{
    const d=JSON.parse(currentLocalJson()||"{}");
    return {
      projects:d.projects?.length||0,
      tasks:d.tasks?.length||0,
      customers:d.customers?.length||0,
      employees:d.employees?.length||0
    };
  }catch(e){ return {projects:0,tasks:0,customers:0,employees:0}; }
}
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src=src; s.onload=resolve; s.onerror=reject; document.body.appendChild(s);
  });
}
async function loadPortal(){
  if(portalLoaded) return;
  portalLoaded=true;
  try{ await loadScript("time-snapshot-import.js?v=1"); }catch(e){ console.warn(e); }
  await loadScript("app.js?v=2.2.1-ios-login-fallback-20260915");
}
function showPortal(){
  const loginUser=document.getElementById("loginUser");
  if(loginUser) loginUser.textContent=user?.email||user?.displayName||"ログイン中";
  gate?.classList.add("auth-hidden");
  portal?.classList.remove("auth-hidden");
  status("");
}

async function writeCloud(reason="save"){
  if(!user || !db || applyingRemote) return;
  const json=currentLocalJson();
  if(!json || json===lastUploadedJson) return;
  setCloudStatus("クラウドへ保存中…","warn");
  await setDoc(stateRef(),{
    json,
    updatedAt:serverTimestamp(),
    updatedBy:user.email||user.uid,
    sourceClientId,
    reason,
    schemaVersion:VERSION
  },{merge:false});
  lastUploadedJson=json;
  setCloudStatus("クラウド同期済み","ok");
}
function schedulePush(reason="save"){
  if(!user || !db || !realtimeReady || applyingRemote) return;
  clearTimeout(pushTimer);
  pushTimer=setTimeout(()=>{
    writeCloud(reason).catch(error=>{
      console.error(error);
      setCloudStatus("クラウド保存失敗","error");
    });
  },600);
}
function startRealtime(){
  if(unsubscribe){ unsubscribe(); unsubscribe=null; }
  realtimeReady=false;
  unsubscribe=onSnapshot(
    stateRef(),
    snap=>{
      if(!snap.exists()) return;
      const data=snap.data()||{};
      const remoteJson=data.json||"";
      if(!remoteJson) return;
      if(data.sourceClientId===sourceClientId || remoteJson===currentLocalJson()){
        lastUploadedJson=remoteJson;
        realtimeReady=true;
        setCloudStatus("クラウド同期済み","ok");
        return;
      }
      try{
        applyingRemote=true;
        installCloudJson(remoteJson);
        setCloudStatus("他端末の更新を反映中…","warn");
        setTimeout(()=>location.reload(),250);
      }catch(error){
        console.error(error);
        applyingRemote=false;
        setCloudStatus("クラウド反映失敗","error");
      }
    },
    error=>{
      console.error(error);
      setCloudStatus(`クラウド接続失敗${error?.code?`（${error.code}）`:""}`,"error");
    }
  );
  realtimeReady=true;
}

async function establishRealtime(){
  setCloudStatus("共有台帳を確認中…","warn");
  const snap=await getDoc(stateRef());

  if(!snap.exists()){
    realtimeReady=false;
    setCloudStatus("クラウド未登録","warn");
    if(cloudInitBtn) cloudInitBtn.hidden=false;
  }else{
    const cloud=snap.data()||{};
    if(cloud.json){
      installCloudJson(cloud.json);
      lastUploadedJson=cloud.json;
    }
    if(cloudInitBtn) cloudInitBtn.hidden=true;
    startRealtime();
    setCloudStatus("クラウド同期済み","ok");
  }
}

function bindInitialUpload(){
  if(!cloudInitBtn || cloudInitBtn.dataset.bound==="1") return;
  cloudInitBtn.dataset.bound="1";
  cloudInitBtn.addEventListener("click",async()=>{
    if(!user) return;
    const json=currentLocalJson();
    if(!json){ alert("この端末に初回登録できるポータルデータがありません。"); return; }
    const s=localSummary();
    const ok=confirm(`この端末のデータを社内共通データとして初回登録します。\n\n案件 ${s.projects}件\n予定 ${s.tasks}件\n顧客 ${s.customers}件\n社員 ${s.employees}件\n\n予定が入っているPC側でだけ「OK」を押してください。`);
    if(!ok) return;
    cloudInitBtn.disabled=true;
    try{
      localStorage.setItem(BACKUP_KEY,JSON.stringify({savedAt:nowIso(),json}));
      await setDoc(stateRef(),{
        json,
        updatedAt:serverTimestamp(),
        updatedBy:user.email||user.uid,
        sourceClientId,
        reason:"initial-pc-upload",
        schemaVersion:VERSION
      },{merge:false});
      lastUploadedJson=json;
      cloudInitBtn.hidden=true;
      startRealtime();
      setCloudStatus("初回登録完了・クラウド同期済み","ok");
      alert("PCの現在データをクラウドへ登録しました。スマホを再読み込みしてください。");
    }catch(error){
      console.error(error);
      setCloudStatus(`初回登録失敗${error?.code?`（${error.code}）`:""}`,"error");
      cloudInitBtn.disabled=false;
    }
  });
}

/* ここから認証部分は、スマホで実働している TIME v8.5 と同じ流れ */
async function googleSignIn(){
  if(!configured){
    status("Firebase未設定です。",true);
    return;
  }
  if(!auth){
    status("認証準備中です。数秒後にもう一度押してください。",true);
    return;
  }

  const provider=new GoogleAuthProvider();
  provider.setCustomParameters({prompt:"select_account"});
  status("Googleアカウントを確認しています…");

  try{
    // TIMEと同じ：スマホでもまずポップアップ。
    await signInWithPopup(auth,provider);
  }catch(error){
    const redirectCodes=[
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/popup-closed-by-user",
      "auth/operation-not-supported-in-this-environment",
      "auth/web-storage-unsupported"
    ];
    if(redirectCodes.includes(error.code)){
      sessionStorage.setItem("portalGoogleRedirectPending",nowIso());
      status("スマホのログイン画面から戻っています…");
      await signInWithRedirect(auth,provider);
      return;
    }
    throw error;
  }
}

async function processAccount(account){
  user=account;
  status("認証済み。共有台帳へ接続しています…");
  try{
    await establishRealtime();
  }catch(error){
    console.error(error);
    setCloudStatus(`同期エラー${error?.code?`（${error.code}）`:""}`,"error");
    // 認証成功後はFirestoreエラーで閉じ込めず、ローカル版を開く。
  }

  window.PortalCloudSync={
    notifyLocalSave(reason){ schedulePush(reason); },
    async flush(){ await writeCloud("manual-flush"); },
    get enabled(){ return realtimeReady; }
  };

  await loadPortal();
  showPortal();
}

async function init(){
  if(!configured){
    initialized=true;
    status("Firebase未設定です。",true);
    return;
  }
  try{
    const app=initializeApp(CONFIG);
    auth=getAuth(app);
    db=getFirestore(app);
    sourceClientId=getClientId();
    bindInitialUpload();

    await setPersistence(auth,browserLocalPersistence);

    onAuthStateChanged(auth,account=>{
      if(!account){
        user=null;
        realtimeReady=false;
        if(unsubscribe){ unsubscribe(); unsubscribe=null; }
        portal?.classList.add("auth-hidden");
        gate?.classList.remove("auth-hidden");
        if(loginBtn) loginBtn.disabled=false;
        status("ログインしてください");
        return;
      }
      sessionStorage.removeItem("portalGoogleRedirectPending");
      processAccount(account);
    });

    try{
      const result=await getRedirectResult(auth);
      redirectChecked=true;
      if(result?.user){
        sessionStorage.removeItem("portalGoogleRedirectPending");
        await processAccount(result.user);
      }
    }catch(error){
      redirectChecked=true;
      console.error(error);
      status(`${error.code||"Firebase"}: ${error.message}`,true);
    }

    initialized=true;
  }catch(error){
    initialized=true;
    console.error(error);
    status(`Firebase初期化エラー: ${error.message}`,true);
  }
}

loginBtn?.addEventListener("click",()=>{
  googleSignIn().catch(error=>{
    console.error(error);
    const messages={
      "auth/popup-closed-by-user":"Googleログイン画面が閉じられました。もう一度試してください。",
      "auth/unauthorized-domain":"このGitHub PagesドメインがFirebaseで承認されていません。",
      "auth/too-many-requests":"ログイン試行が多すぎます。しばらく待ってください。"
    };
    status(messages[error.code]||`${error.code||"Firebase"}: ${error.message}`,true);
    if(loginBtn) loginBtn.disabled=false;
  });
});

logoutBtn?.addEventListener("click",async()=>{
  if(unsubscribe){ unsubscribe(); unsubscribe=null; }
  if(auth) await signOut(auth);
  location.reload();
});

window.addEventListener("online",()=>{
  if(user){
    establishRealtime().catch(error=>{
      console.error(error);
      setCloudStatus("再接続失敗","error");
    });
  }
});
window.addEventListener("offline",()=>setCloudStatus("オフライン","warn"));

init();
