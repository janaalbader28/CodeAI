import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  auth.onAuthStateChanged(async user => {
    if (!user) return;

    const snap = await getDoc(
      doc(db, "users", user.uid, "stats", "summary")
    );
    if (!snap.exists()) return;

    const stats = snap.data();

    renderLanguageChart(stats.languages || {});
    renderErrorChart(stats.errorCategories || {});
    renderWeeklyChart(stats.weeklyActivity || {});
    renderImproveChart(stats.improvement || {});
  });

});

/* ================= LANGUAGE DONUT ================= */

function renderLanguageChart(languages) {
  const ctx = document.getElementById("languageChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(languages),
      datasets: [{
        data: Object.values(languages),
        backgroundColor: [
          "#38bdf8",
          "#22c55e",
          "#facc15",
          "#a855f7",
          "#fb7185"
        ],
        borderWidth: 0
      }]
    },
    options: {
      cutout: "65%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#e5e7eb",
            usePointStyle: true
          }
        }
      }
    }
  });
}

/* ================= ERROR TYPES ================= */

function renderErrorChart(errors) {
  const ctx = document.getElementById("errorChart");
  if (!ctx) return;

  const labels = ["syntax", "runtime", "oop", "array", "logic"];
  const values = labels.map(l => errors[l] || 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.map(l => l.toUpperCase()),
      datasets: [{
        data: values,
        backgroundColor: "#38bdf8",
        borderRadius: 6,
        barThickness: 10
      }]
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(148,163,184,0.08)" }
        },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { display: false }
        }
      }
    }
  });
}


/* ================= WEEKLY ACTIVITY ================= */
function renderWeeklyChart(weeklyAllWeeks) {
  const ctx = document.getElementById("weeklyChart");
  if (!ctx) return;

  const weekKeys = Object.keys(weeklyAllWeeks).sort(); // sorted ascending
  const latestWeekKey = weekKeys.pop();
  const weekly = weeklyAllWeeks[latestWeekKey] || {};

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map(d => weekly[d] || 0);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: days,
      datasets: [{
        label: `Total Queries (${latestWeekKey})`,
        data,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e5e7eb", usePointStyle: true } }
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#94a3b8", stepSize: 1 }, grid: { color: "rgba(148,163,184,0.08)" } }
      }
    }
  });
}

/* ================= AREAS TO IMPROVE ================= */

function renderImproveChart(improvement) {
  const ctx = document.getElementById("improveChart");
  if (!ctx) return;

  const labels = [
  "Code Structure & Readability",
  "Error Handling & Edge Cases",
  "Async & Concurrency",
  "Performance & Optimization",
  "Data Structures & Algorithms"
  ];

  const values = labels.map(l => improvement[l] || 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: "#38bdf8",
        borderRadius: 6,
        barThickness: 8
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: {
            color: "rgba(148,163,184,0.08)",
            drawBorder: false
          }
        },
        y: {
          ticks: { color: "#e5e7eb" },
          grid: { display: false }
        }
      }
    }
  });
}
