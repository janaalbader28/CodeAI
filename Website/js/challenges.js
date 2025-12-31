import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const challengesContainer = document.querySelector('.challenges');
const searchInput = document.getElementById('searchInput');
const levelSelect = document.getElementById('levelSelect');
const statusSelect = document.getElementById('statusSelect');

// ---------- Filters ----------
function applyFilters() {
    const challenges = document.querySelectorAll('.challenge');
    if (!challenges.length) return;

    const query = searchInput?.value.toLowerCase() || '';
    const levelFilter = levelSelect?.value || 'all';
    const statusFilter = statusSelect?.value || 'all';

    challenges.forEach(card => {
        const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        const level = card.querySelector('.diff')?.textContent.toLowerCase() || 'easy';
        const solved = card.querySelector('.completed') !== null;

        const matchSearch = title.includes(query) || desc.includes(query);
        const matchLevel = levelFilter === 'all' || level === levelFilter;
        const matchStatus =
            statusFilter === 'all' ||
            (statusFilter === 'solved' && solved) ||
            (statusFilter === 'unsolved' && !solved);

        card.style.display = (matchSearch && matchLevel && matchStatus) ? 'block' : 'none';
    });
}

if (searchInput) searchInput.addEventListener('input', applyFilters);
if (levelSelect) levelSelect.addEventListener('change', applyFilters);
if (statusSelect) statusSelect.addEventListener('change', applyFilters);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        if (challengesContainer) challengesContainer.innerHTML = '<p>Please log in to see challenges.</p>';
        return;
    }

    const uid = user.uid;

    if (challengesContainer) {
        await fetchChallenges(uid);
    }

    if (document.querySelector('.problem-panel h2')) {
        await loadChallengePage(uid);
    }
});

// ---------- Challenges ----------
async function fetchChallenges(uid) {
    try {
        const challengesCol = collection(db, 'challenges');
        const challengesSnapshot = await getDocs(challengesCol);

        const userChallengesRef = doc(db, 'userChallenges', uid);
        const userChallengesSnap = await getDoc(userChallengesRef);
        const userData = userChallengesSnap.exists() ? userChallengesSnap.data().challenges || {} : {};

        // ---------- STREAK DISPLAY ----------
        const streakEl = document.querySelector('.streak-fire');

        if (streakEl && userChallengesSnap.exists()) {
        const streak = userChallengesSnap.data().streak || 0;
        streakEl.innerHTML = `<i class="fa-solid fa-fire"></i> ${streak}`;
        }

        challengesContainer.innerHTML = '';

        challengesSnapshot.forEach(docSnap => {
            const chal = docSnap.data();
            const difficulty = String(chal.difficulty || 'easy').toLowerCase();
            const langs = Array.isArray(chal.allowedLanguages) ? chal.allowedLanguages.join(' · ') : '';
            const userProgress = userData[docSnap.id] || {};
            const solved = userProgress.solved || false;
            const usedLang = userProgress.language || '';

            const card = document.createElement('div');
            card.classList.add('challenge');

            if (solved) {
                const completedDiv = document.createElement('div');
                completedDiv.classList.add('completed');
                completedDiv.innerHTML = '<i class="fa-solid fa-check"></i>';
                card.appendChild(completedDiv);
            }

            // card.innerHTML += `
            //     <h4>${chal.title}</h4>
            //     <p>${chal.description}</p>
            //     <div class="challenge-meta">
            //         <span class="diff ${difficulty}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
            //         <span class="langs">${langs}</span>
            //     </div>
            //     <button class="solve-btn">
            //         <i class="fa-solid ${solved ? 'fa-rotate-right' : 'fa-play'}"></i>
            //         ${solved ? 'Review Solution' : 'Solve Challenge'}
            //     </button>
            // `;

            card.innerHTML += `
                <h4>${chal.title}</h4>
                <p>${chal.description}</p>
                <div class="challenge-meta">
                    <span class="diff ${difficulty}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                    <span class="langs">JavaScript</span>
                </div>
                <button class="solve-btn">
                    <i class="fa-solid ${solved ? 'fa-rotate-right' : 'fa-play'}"></i>
                    ${solved ? 'Review Solution' : 'Solve Challenge'}
                </button> 
            `;
            card.querySelector('.solve-btn').addEventListener('click', () => {
                location.href = `challenge.html?id=${docSnap.id}`;
            });

            challengesContainer.appendChild(card);
        });

        applyFilters();
        updateStats(userData, challengesSnapshot);

    } catch (error) {
        console.error("Error fetching challenges:", error);
        challengesContainer.innerHTML = '<p>Failed to load challenges. Try again later.</p>';
    }
}

// ---------- Stats ----------
function updateStats(userData, challengesSnapshot) {
    const totalSolved = Object.values(userData).filter(c => c.solved).length;
    const hardSolved = Object.values(userData).filter(c => c.solved && challengesSnapshot.docs.find(d => d.id === c.id)?.data().difficulty === 'hard').length;

    const langCount = {};
    Object.values(userData).forEach(c => {
        if (c.language) langCount[c.language] = (langCount[c.language] || 0) + 1;
    });
    const favoriteLang = Object.keys(langCount).reduce((a, b) => langCount[a] > langCount[b] ? a : b, '') || '';

    const totalAttempts = Object.values(userData).reduce((sum, c) => sum + (c.attempts || 0), 0);
    const successRate = totalAttempts ? Math.round((totalSolved / totalAttempts) * 100) : 0;

    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = totalSolved;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = successRate + '%';
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = favoriteLang;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = hardSolved;
}

// ---------- Run test cases for JS ----------
function runTestCasesJS(code, testCases) {
    const results = [];
    try {
        const func = new Function(code + '; return solution;')();

        testCases.forEach((tc, index) => {
            try {
                const input = JSON.parse(tc.input);
                const expected = JSON.parse(tc.output);
                const result = func(...input);
                const passed = JSON.stringify(result) === JSON.stringify(expected);

                results.push({
                    index: index + 1,
                    passed,
                    input,
                    expected,
                    output: result
                });
            } catch (err) {
                results.push({
                    index: index + 1,
                    passed: false,
                    input: tc.input,
                    expected: tc.output,
                    output: err.toString()
                });
            }
        });
    } catch (err) {
        testCases.forEach((tc, index) => {
            results.push({
                index: index + 1,
                passed: false,
                input: tc.input,
                expected: tc.output,
                output: err.toString()
            });
        });
    }
    return results;
}

// ---------- Challenge Detail ----------
async function loadChallengePage(uid) {
    const titleEl = document.querySelector('.problem-panel h2');
    if (!titleEl) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    try {
        const docRef = doc(db, 'challenges', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        const chal = docSnap.data();

        const difficultyEl = document.querySelector('.problem-panel .tag.easy');
        const tagsEl = document.querySelector('.problem-panel .tag:not(.easy)');
        const descEl = document.querySelector('.problem-desc');
        const sampleInputEl = document.querySelector('.example-box code');
        const sampleOutputEl = document.querySelectorAll('.example-box code')[1];
        const langSelect = document.querySelector('.lang-select');
        const submitBtn = document.querySelector('.submit-btn');

        titleEl.textContent = chal.title || '';
        difficultyEl.textContent = chal.difficulty ? chal.difficulty.charAt(0).toUpperCase() + chal.difficulty.slice(1) : 'Easy';
        tagsEl.textContent = chal.tags || '';
        descEl.textContent = chal.description || '';

        if (chal.samples) {
            sampleInputEl.textContent = chal.samples.input || '';
            sampleOutputEl.textContent = chal.samples.output || '';
        }

        if (langSelect && Array.isArray(chal.allowedLanguages)) {
            langSelect.innerHTML = '';
            chal.allowedLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.toLowerCase();
                option.textContent = lang;
                langSelect.appendChild(option);
            });
        }

        const userChallengesRef = doc(db, 'userChallenges', uid);
        const userChallengesSnap = await getDoc(userChallengesRef);
        const userData = userChallengesSnap.exists() ? userChallengesSnap.data().challenges || {} : {};
        const userProgress = userData[id] || {};
        if (userProgress.solved && userProgress.lastCode) {
            editor.setValue(userProgress.lastCode);}

        if (submitBtn) {
            submitBtn.innerHTML = userProgress.solved 
                ? `<i class="fa-solid fa-rotate-right"></i> Review Solution` 
                : `<i class="fa-solid fa-play"></i> Submit Solution`;
        }

        if (langSelect && userProgress.language) langSelect.value = userProgress.language.toLowerCase();

        // ---------- Submit ----------

        if (submitBtn) {
        submitBtn.onclick = async () => {
            const code = editor.getValue();
            const lang = langSelect.value;
            const uid = auth.currentUser?.uid;
            if (!uid) return alert('Please log in.');

            if (lang.toLowerCase() !== 'javascript') {
                alert('Only JavaScript is supported in this demo.');
                return;
            }

            const testCases = chal.testCases || [];
            const results = runTestCasesJS(code, testCases);
            const allPassed = results.every(r => r.passed);

            // Save progress
            const userRef = doc(db, 'userChallenges', uid);
            const userSnap = await getDoc(userRef);
            let userData = userSnap.exists() ? userSnap.data().challenges || {} : {};
            // userData[id] = {
            //     attempts: (userData[id]?.attempts || 0) + 1,
            //     difficulty: chal.difficulty || 'easy',
            //     language: lang,
            //     lastCode: allPassed ? code : userData[id]?.lastCode || '', 
            //     solved: allPassed,
            //     solvedAt: allPassed ? new Date() : null,
            //     testCases
            // };
            // await setDoc(userRef, { challenges: userData });

const today = new Date();
const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

let streak = userSnap.exists() ? userSnap.data().streak || 0 : 0;
let lastSolvedDate = userSnap.exists() ? userSnap.data().lastSolvedDate || null : null;
let lastStreakKey = userSnap.exists() ? userSnap.data().lastStreakKey || null : null;

const currentStreakKey = `${id}|${lang}|${todayStr}`;

if (allPassed) {
  if (lastStreakKey !== currentStreakKey) {

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastSolvedDate === yesterdayStr) {
      streak += 1; // continue streak
    } else {
      streak = 1; // reset streak
    }

    lastSolvedDate = todayStr;
    lastStreakKey = currentStreakKey;
  }
}


// ---- SAVE CHALLENGE PROGRESS ----
userData[id] = {
  attempts: (userData[id]?.attempts || 0) + 1,
  difficulty: chal.difficulty || 'easy',
  language: lang,
  lastCode: allPassed ? code : userData[id]?.lastCode || '', 
  solved: allPassed,
  solvedAt: allPassed ? new Date() : null,
  testCases
};

await setDoc(userRef, {
  challenges: userData,
  streak,
  lastSolvedDate,
  lastStreakKey
});

            submitBtn.innerHTML = allPassed
                ? '<i class="fa-solid fa-rotate-right"></i> Review Solution'
                : '<i class="fa-solid fa-play"></i> Submit Solution';

            const existingResult = document.querySelector('.challenge-result');
            if (existingResult) existingResult.remove(); 

            const resultDiv = document.createElement('div');
            resultDiv.className = `challenge-result ${allPassed ? 'challenge-success' : 'challenge-failure'}`;
            resultDiv.innerHTML = allPassed
                ? `🎉 <h3>Congratulations!</h3> <p>You solved the challenge!</p>`
                : `<h3>Oops! Some test cases failed 😢</h3>
                <p>Check your code and try again.</p>`;

            if (!allPassed) {
                const details = document.createElement('pre');
                details.textContent = results
                    .map(r => `Test Case ${r.index}: ${r.passed ? '✅ Passed' : '❌ Failed'}`)
                    .join('\n');
                resultDiv.appendChild(details);
            }
            document.body.appendChild(resultDiv);
            setTimeout(() => {
                    resultDiv.remove();
                }, 3000);
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        };
    }
    } catch (error) {
        console.error("Error loading challenge:", error);
    }
}
