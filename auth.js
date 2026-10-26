
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
  const session = await getCurrentSession();

  if (!session) {
    window.location.replace("student-login.html?mode=login");
    return null;
  }

  return session;
}

// Sign out the current user
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign-out failed:", error.message);
    throw error;
  }

  window.location.replace("student-login.html?mode=login");
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
