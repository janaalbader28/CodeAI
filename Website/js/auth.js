
import { auth, provider, db } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const googleBtn = document.querySelector(".google-btn");
const overlay = document.getElementById("loginOverlay");

// Google login
googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    await ensureUserDocument(result.user);
    window.location.href = "analysis.html";
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
});

// Auto-check login
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await ensureUserDocument(user);
    overlay.classList.remove("active");
  }
});

async function ensureUserDocument(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create user profile + stats
    await setDoc(userRef, {
      profile: {
        name: user.displayName || "",
        email: user.email || "",
        createdAt: serverTimestamp()
      }
    });

    await setDoc(doc(db, "users", user.uid, "stats", "summary"), {
      totalQueries: 0,
      errorsFound: 0,
      successRate: 0,
      improvement: 0,
      languageUsage: {},
      weeklyActivity: {}
    });

    console.log(" New user created in Firestore");
  }
}
