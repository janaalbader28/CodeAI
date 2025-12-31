
import { auth, db } from "./firebase.js";
import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc, getDoc, setDoc, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ================= DOM =================
const values = document.querySelectorAll(".stat-value");
const totalQueriesEl = values[0];
const errorsFoundEl  = values[1];
const favoriteLangEl = values[2];
const improvementEl = values[3];
const headerMeta = document.querySelector(".header-meta");

// ================= AUTH =================
onAuthStateChanged(auth, async user => {
  if (!user) return (window.location.href = "homepage.html");
  await syncExtensionUsage(user.uid);
  await loadUserStats(user.uid);
});

// ================= EXTENSION SYNC =================
function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Monday = 0
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(),0,4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

// ================= EXTENSION SYNC =================
async function syncExtensionUsage(uid) {
  const history = await getLocalUsage();
  if (!history.length) return;

  const ref = doc(db, "users", uid, "stats", "summary");
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : {};

  const languages = { ...(current.languages || {}) };
  const errorCategories = { ...(current.errorCategories || {}) };

  // Only keep current week
  const now = new Date();
  const currentWeekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
  const weekly = {};
  weekly[currentWeekKey] = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };

  history.forEach(h => {
    // language
    if (h.language) languages[h.language] = (languages[h.language] || 0) + 1;

    // error category
    if (h.errorCategory) {
      errorCategories[h.errorCategory] =
        (errorCategories[h.errorCategory] || 0) + 1;
    }

    // weekly activity: only count if in current week
    const d = new Date(h.time);
    const weekKey = `${d.getFullYear()}-W${getWeekNumber(d)}`;
    if (weekKey === currentWeekKey) {
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      if (weekly[currentWeekKey][day] !== undefined) {
        weekly[currentWeekKey][day]++;
      }
    }
  });

  const improvement = { 
    "Code Structure & Readability": 0,
    "Error Handling & Edge Cases": 0,
    "Async & Concurrency": 0,
    "Performance & Optimization": 0,
    "Data Structures & Algorithms": 0
  };

  history.forEach(h => {
    if (h.action === "improve" && h.improvementCategory) {
      if (!improvement[h.improvementCategory]) improvement[h.improvementCategory] = 0;
      improvement[h.improvementCategory]++;
    }
  });

  await setDoc(ref, {
    totalQueries: increment(history.length),
    errorsFound: increment(history.filter(h => h.action === "errors").length),
    improvement, 
    languages,
    errorCategories,
    weeklyActivity: weekly
  }, { merge: true });

  window.postMessage({ type: "CLEAR_LOCAL_USAGE" }, "*");
}


// ================= EXTENSION BRIDGE =================
function getLocalUsage() {
  return new Promise(resolve => {
    window.postMessage({ type: "GET_LOCAL_USAGE" }, "*");
    window.addEventListener("message", function handler(e) {
      if (e.data?.type === "LOCAL_USAGE_RESPONSE") {
        window.removeEventListener("message", handler);
        resolve(e.data.history || []);
      }
    });
    setTimeout(() => resolve([]), 2000);
  });
}

// ================= READ STATS =================
async function loadUserStats(uid) {
  const snap = await getDoc(doc(db, "users", uid, "stats", "summary"));
  const s = snap.exists() ? snap.data() : {};

  // Total queries
  const totalQueries = s.totalQueries || 0;
  const errorsFound = s.errorsFound || 0;

  // Total improve requests 
  const improvementTotal = s.improvement 
    ? Object.values(s.improvement).reduce((a, b) => a + b, 0)
    : 0;

  animate(totalQueriesEl, totalQueries);
  animate(errorsFoundEl, errorsFound);

  const fav = Object.entries(s.languages || {})
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  favoriteLangEl.innerText = fav;

  animate(improvementEl, improvementTotal, true);

  headerMeta.innerText = `Based on ${totalQueries} queries`;
}

// ================= UI ANIMATION =================
function animate(el, target, positive = false) {
  let current = 0;
  const step = target > 100 ? Math.ceil(target / 100) : 1; 

  function run() {
    current += step;
    if (current > target) current = target;

    el.innerText = positive ? `+${current}` : current;

    if (current < target) {
      setTimeout(run, 50);
    }
  }

  run();
}

