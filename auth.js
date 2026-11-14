
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// SAINTIG EXAMS — Supabase Authentication
const SUPABASE_URL = "https://scuiswponnqyrbqjypkx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_3fT0c2Ggy8sYKINoMkMpkA_Qlaj5oZq";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Get the current signed-in user's session
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Unable to retrieve session:", error.message);
    return null;
  }

  return data.session;
}

// Protect pages that require student sign-in
export async function requireStudentSession() {
  // Verify the user's identity with Supabase Auth.
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    await supabase.auth.signOut();

    window.location.replace(
      "student-login.html?mode=login"
    );

    return null;
  }

  // Retrieve the current session after verification.
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    await supabase.auth.signOut();

    window.location.replace(
      "student-login.html?mode=login"
    );

    return null;
  }

  return sessionData.session;
}

// Sign out the current user
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign-out failed:", error.message);
    throw error;
  }

  window.location.replace(
    "student-login.html?mode=login"
  );
}

// Register a student and save their full name
export async function registerStudent(email, password, fullName) {
  if (!fullName || !fullName.trim()) {
    throw new Error("Please enter your full name.");
  }

  return await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim()
      }
    }
  });
}

// Sign in a student
export async function signInStudent(email, password) {
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });
}

// Request a password reset
export async function requestPasswordReset(email) {
  return await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo:
        window.location.origin +
        window.location.pathname.replace(
          /[^/]*$/,
          "student-login.html"
        ) +
        "?mode=reset"
    }
  );
}

/* ---- Signed-out / suspended account handling ---- */
(function () {
  if (window.__saintigGuard) return;
  window.__saintigGuard = true;

  let manual = false, shown = false;
  const origSignOut = supabase.auth.signOut.bind(supabase.auth);
  supabase.auth.signOut = (...a) => { manual = true; return origSignOut(...a); };

  function loginPage() {
    const p = location.pathname.toLowerCase();
    if (p.includes("school") || p.includes("register-examination")) return "school-login.html?mode=login";
    if (/admin|registered-users|paid-subscribers|settings-security|archived-records|countries|education-levels|subjects\.html|question-bank\.html|register-exam\.html|results-reports|visitor-analytics|ai-question/.test(p)) return "admin-login.html";
    return "student-login.html?mode=login";
  }

  function ended() {
    if (shown || manual || /login/.test(location.pathname.toLowerCase())) return;
    shown = true;
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;inset:0;z-index:99999;background:#000a;display:flex;align-items:center;justify-content:center;padding:20px";
    box.innerHTML = '<div style="background:#fff;color:#263449;max-width:420px;border-radius:12px;padding:24px;text-align:center;font:17px/1.5 Arial,sans-serif"><b style="font-size:20px">You have been signed out</b><p style="margin:10px 0 0">Your session has ended or your account has been suspended. Please contact the administrator if you think this is a mistake.</p></div>';
    document.body.appendChild(box);
    setTimeout(() => location.replace(loginPage()), 4000);
  }

  supabase.auth.onAuthStateChange(e => { if (e === "SIGNED_OUT") ended(); });

  async function check() {
    if (shown || manual || document.visibilityState === "hidden") return;
    const { data } = await supabase.auth.getSession();
    if (!data || !data.session) return;
    const { data: st } = await supabase.rpc("my_access_status");
    let stop = !!(st && st.blocked);
    if (!stop) {
      const { error } = await supabase.auth.getUser();
      stop = !!(error && (error.status === 401 || error.status === 403));
    }
    if (stop) {
      try { await origSignOut({ scope: "local" }); } catch (e) {}
      ended();
    }
  }

  setTimeout(check, 3000);
  setInterval(check, 15000);
  document.addEventListener("visibilitychange", check);
})();
