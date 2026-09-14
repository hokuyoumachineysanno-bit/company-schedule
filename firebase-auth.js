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

const firebaseConfig = {
  apiKey: "AIzaSyBI1eLtxZYXdCc0Jt_siYYW0JtAi0aCKgU",
  authDomain: "portal-31d10.firebaseapp.com",
  projectId: "portal-31d10",
  storageBucket: "portal-31d10.firebasestorage.app",
  messagingSenderId: "684112341136",
  appId: "1:684112341136:web:3ade6e4459a71bb778d015",
  measurementId: "G-Q0QZ7ZZR69"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});

const gate = document.getElementById('authGate');
const portal = document.getElementById('portalApp');
const statusEl = document.getElementById('authStatus');
const loginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
let portalLoaded = false;
let cloudModule = null;

function status(text,isError=false){
  if(!statusEl)return;
  statusEl.textContent=text||'';
  statusEl.classList.toggle('error',!!isError);
}
function authErrorMessage(err){
  const c=err?.code||'';
  if(c.includes('unauthorized-domain'))return 'このURLがFirebaseの承認済みドメインに登録されていません。';
  if(c.includes('popup-closed-by-user'))return 'Googleログインが完了しませんでした。もう一度お試しください。';
  if(c.includes('popup-blocked'))return 'ログイン画面がブラウザにブロックされました。';
  if(c.includes('network-request-failed'))return 'ネットワーク接続を確認してください。';
  return `ログインに失敗しました${c?`（${c}）`:''}`;
}
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=resolve;
    s.onerror=reject;
    document.body.appendChild(s);
  });
}
async function loadPortal(){
  if(portalLoaded)return;
  portalLoaded=true;
  try{await loadScript('time-snapshot-import.js?v=1')}catch(e){console.warn('TIME helper skipped',e)}
  await loadScript('app.js?v=2.1.3-auth-split-20260914');
}
async function initCloud(user){
  status('Googleログイン済み。クラウド利用権限を確認しています…');
  try{
    if(!cloudModule){
      cloudModule = await import('./firestore-sync.js?v=2.1.3-20260914');
    }
    const result = await cloudModule.initPortalCloud({
      firebaseApp,
      user,
      loadPortal,
      showPortal: ()=>{
        document.getElementById('loginUser').textContent=user.email||user.displayName||'ログイン中';
        gate.classList.add('auth-hidden');
        portal.classList.remove('auth-hidden');
        status('');
      },
      showAuthError:(msg)=>status(msg,true)
    });
    return result;
  }catch(e){
    console.error('cloud module init failed',e);
    status(`クラウド初期化に失敗しました${e?.code?`（${e.code}）`:''}。`,true);
    loginBtn.disabled=false;
    return false;
  }
}

// IMPORTANT:
// Attach the click handler before any async persistence / redirect processing.
// This prevents mobile browsers from showing a dead login button if an async init fails.

function isMobileBrowser(){
  const ua=navigator.userAgent||'';
  if(/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  try{
    return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 900);
  }catch(e){
    return false;
  }
}

loginBtn?.addEventListener('click', async ()=>{
  loginBtn.disabled=true;
  status('Googleログインを開いています…');
  try{
    // Mobile Safari/Chrome are more reliable with full-page redirect.
    if(isMobileBrowser()){
      sessionStorage.setItem('portalLoginRedirectPending','1');
      await signInWithRedirect(auth,provider);
      return;
    }

    // Desktop keeps the popup flow.
    await signInWithPopup(auth,provider);
  }catch(e){
    console.warn('login failed',e);

    // If desktop popup is blocked, fall back to redirect.
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment'].includes(e?.code)){
      try{
        sessionStorage.setItem('portalLoginRedirectPending','1');
        await signInWithRedirect(auth,provider);
        return;
      }catch(e2){
        console.error('redirect login failed',e2);
        status(authErrorMessage(e2),true);
      }
    }else{
      status(authErrorMessage(e),true);
    }
    loginBtn.disabled=false;
  }
});

logoutBtn?.addEventListener('click',async()=>{
  try{cloudModule?.stopPortalCloud?.()}catch(e){}
  await signOut(auth);
  location.reload();
});

// Persistence failures must never prevent the login button from working.
setPersistence(auth,browserLocalPersistence).catch(e=>{
  console.warn('auth persistence setup failed',e);
});

getRedirectResult(auth).then(result=>{
  try{sessionStorage.removeItem('portalLoginRedirectPending')}catch(e){}
  if(result?.user){
    status('Googleログインに成功しました。ポータルを開いています…');
  }
}).catch(e=>{
  console.warn('redirect result failed',e);
  try{sessionStorage.removeItem('portalLoginRedirectPending')}catch(e2){}
  status(authErrorMessage(e),true);
  loginBtn.disabled=false;
});

onAuthStateChanged(auth, async user=>{
  if(!user){
    portal.classList.add('auth-hidden');
    gate.classList.remove('auth-hidden');
    loginBtn.disabled=false;
    status('ログインしてください');
    return;
  }
  loginBtn.disabled=true;
  await initCloud(user);
});
