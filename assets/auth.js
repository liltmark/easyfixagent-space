// EasyFix Agent — account system (Firebase Auth, free tier).
// Runs entirely in the visitor's browser against Google's Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile, signInWithPopup,
  GoogleAuthProvider, sendPasswordResetEmail, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const cfg = window.EFA_FIREBASE_CONFIG;
let auth = null;
try { auth = getAuth(initializeApp(cfg)); } catch (e) { /* config missing */ }

const $ = (id) => document.getElementById(id);
const friendly = (code) => ({
  "auth/invalid-credential": "That email or password doesn't match. Please check and try again.",
  "auth/user-not-found": "No account exists with that email yet — create one with Sign Up.",
  "auth/wrong-password": "That password doesn't match this account.",
  "auth/email-already-in-use": "An account with this email already exists — try signing in.",
  "auth/weak-password": "Please use a stronger password (at least 6 characters).",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
  "auth/too-many-requests": "Too many attempts — please wait a little and try again.",
}[code] || "Something went wrong. Please try again.");

// Nav state on every page that includes this script
const navAuth = $("navAuth");
if (auth && navAuth) {
  onAuthStateChanged(auth, (user) => {
    if (user) { navAuth.textContent = "👤 My Account"; navAuth.setAttribute("href", "/account.html"); }
    else { navAuth.textContent = "Login"; navAuth.setAttribute("href", "/login.html"); }
  });
}

// ---- Login page ----
const siForm = $("signinForm"), suForm = $("signupForm");
if (auth && siForm && suForm) {
  const msg = $("authMsg");
  const say = (t, ok) => { if (msg) { msg.textContent = t; msg.className = "auth-msg " + (ok ? "ok" : "err"); } };
  siForm.addEventListener("submit", async (e) => {
    e.preventDefault(); say("Signing you in…", true);
    try { await signInWithEmailAndPassword(auth, $("siEmail").value.trim(), $("siPass").value); location.href = "/account.html"; }
    catch (err) { say(friendly(err.code), false); }
  });
  suForm.addEventListener("submit", async (e) => {
    e.preventDefault(); say("Creating your account…", true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, $("suEmail").value.trim(), $("suPass").value);
      const name = $("suName").value.trim(); if (name) await updateProfile(cred.user, { displayName: name });
      location.href = "/account.html";
    } catch (err) { say(friendly(err.code), false); }
  });
  const gBtn = $("googleBtn");
  if (gBtn) gBtn.addEventListener("click", async () => {
    say("Opening Google sign-in…", true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); location.href = "/account.html"; }
    catch (err) { say(friendly(err.code), false); }
  });
  const forgot = $("forgotLink");
  if (forgot) forgot.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = $("siEmail").value.trim();
    if (!email) { say("Type your email above first, then tap Forgot password.", false); return; }
    try { await sendPasswordResetEmail(auth, email); say("Password reset email sent — check your inbox.", true); }
    catch (err) { say(friendly(err.code), false); }
  });
  const tabs = document.querySelectorAll(".auth-tab");
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.remove("on")); t.classList.add("on");
    const up = t.dataset.tab === "up";
    suForm.style.display = up ? "" : "none"; siForm.style.display = up ? "none" : "";
    say("", true);
  }));
}

// ---- Account page ----
const acct = $("accountBox");
if (auth && acct) {
  onAuthStateChanged(auth, (user) => {
    if (!user) { location.href = "/login.html"; return; }
    acct.style.display = "";
    $("acctName").textContent = user.displayName || "EasyFix Agent member";
    $("acctEmail").textContent = user.email || "";
    $("acctSince").textContent = user.metadata && user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "";
    const tok = $("acctToken");
    if (tok) {
      try { tok.value = localStorage.getItem("efa_hf_token") || ""; } catch (e) {}
      $("acctTokenSave").addEventListener("click", () => {
        try { localStorage.setItem("efa_hf_token", tok.value.trim()); } catch (e) {}
        $("acctTokenNote").textContent = "✓ Saved in this browser — the Video Studio will use it automatically on this device.";
      });
    }
  });
  const out = $("signOutBtn");
  if (out) out.addEventListener("click", async () => { await signOut(auth); location.href = "/"; });
}
