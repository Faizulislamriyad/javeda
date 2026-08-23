// ================================================================
// FIREBASE CONFIG & INIT
// ================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCvEyo8iJg-sGb5MVINjTR_q3ANMPeTd0o",
  authDomain: "javeda-21ddd.firebaseapp.com",
  projectId: "javeda-21ddd",
  storageBucket: "javeda-21ddd.firebasestorage.app",
  messagingSenderId: "72745884521",
  appId: "1:72745884521:web:cd6c4818b97cc4ec8dbbf8",
  measurementId: "G-J4Y1WJBL6K",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ================================================================
// MAINTENANCE PAUSE DETECTION
// ================================================================

(function () {
  const overlay = document.getElementById("maintenanceOverlay");
  const countdownEl = document.getElementById("maintenanceCountdown");
  let countdownInterval = null;

  function showMaintenance(until) {
    if (overlay) {
      overlay.classList.add("active");
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden";
      startCountdown(until);
    }
  }

  function hideMaintenance() {
    if (overlay) {
      overlay.classList.remove("active");
      overlay.style.display = "none";
      document.body.style.overflow = "";
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    }
  }

  function startCountdown(until) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      const remaining = Math.max(0, until - Date.now());
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        hideMaintenance();
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      if (countdownEl) {
        countdownEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
    }, 1000);
  }

  try {
    db.collection("config")
      .doc("pause")
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (
              data.paused &&
              data.pausedUntil &&
              data.pausedUntil > Date.now()
            ) {
              showMaintenance(data.pausedUntil);
            } else {
              hideMaintenance();
              if (
                data.paused &&
                data.pausedUntil &&
                data.pausedUntil <= Date.now()
              ) {
                db.collection("config").doc("pause").set(
                  {
                    paused: false,
                    pausedUntil: null,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  },
                  { merge: true },
                );
              }
            }
          } else {
            hideMaintenance();
          }
        },
        (error) => {
          console.error("Maintenance listener error:", error);
        },
      );
  } catch (e) {
    console.warn("Maintenance feature requires Firebase initialization.");
  }
})();

// ================================================================
// GUEST HELPERS
// ================================================================

function isGuestUid(uid) {
  return uid && uid.startsWith("guest_");
}

function getGuestRevisionKey(guestId) {
  return `guest_revision_${guestId}`;
}

function loadGuestRevisions(guestId) {
  try {
    const raw = localStorage.getItem(getGuestRevisionKey(guestId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestRevisions(guestId, data) {
  try {
    localStorage.setItem(getGuestRevisionKey(guestId), JSON.stringify(data));
  } catch (e) {}
}

// ================================================================
// FIRESTORE HELPERS
// ================================================================

const USERS_COLLECTION = "users";
const REVISION_COLLECTION = "revisionQuestions";

async function saveUserStats(uid, data) {
  if (isGuestUid(uid) || !auth.currentUser) {
    const guestId = localStorage.getItem("guest_id") || "guest";
    try {
      localStorage.setItem("guest_stats_" + guestId, JSON.stringify(data));
    } catch (e) {}
    return false;
  }
  const email = auth.currentUser.email;
  if (!email) return false;
  try {
    const docId = email.replace(/[.#$\/\[\]]/g, "_");
    await db
      .collection(USERS_COLLECTION)
      .doc(docId)
      .set(
        {
          email,
          displayName: auth.currentUser.displayName || "User",
          photoURL: auth.currentUser.photoURL || "",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          ...data,
        },
        { merge: true },
      );
    return true;
  } catch (e) {
    console.error("Save error:", e);
    return false;
  }
}

async function saveRevisionQuestion(qData, tData, journal) {
  const guestId = localStorage.getItem("guest_id");
  if (!auth.currentUser && guestId) {
    const revisions = loadGuestRevisions(guestId);
    revisions.push({
      id: "rev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      question: {
        accountName: qData.accountName,
        accountType: qData.accountType,
        effect: qData.effect,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation,
        ruleText: qData.ruleText,
      },
      transaction: {
        display: tData.description,
        account: qData.accountName,
        accountType: qData.accountType,
        effect: qData.effect,
        amount: tData.amount || 0,
      },
      displayText: tData.description,
      accountDisplay: qData.accountName,
      questionAccount: qData.accountName,
      questionType: qData.accountType,
      questionEffect: qData.effect,
      pattern: {
        type: qData.accountType,
        effect: qData.effect,
        account: qData.accountName,
        category: qData.accountType,
      },
      journal: journal.map((j) => ({
        account: j.account,
        type: j.type,
        side: j.side,
        amount: j.amount,
      })),
    });
    saveGuestRevisions(guestId, revisions);
    return true;
  }
  try {
    const email = auth.currentUser ? auth.currentUser.email : null;
    if (!email) return false;
    const docId = email.replace(/[.#$\/\[\]]/g, "_");
    await db.collection(REVISION_COLLECTION).add({
      userId: docId,
      email: email,
      timestamp: Date.now(),
      question: {
        accountName: qData.accountName,
        accountType: qData.accountType,
        effect: qData.effect,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation,
        ruleText: qData.ruleText,
      },
      transaction: {
        display: tData.description,
        account: qData.accountName,
        accountType: qData.accountType,
        effect: qData.effect,
        amount: tData.amount || 0,
      },
      displayText: tData.description,
      accountDisplay: qData.accountName,
      questionAccount: qData.accountName,
      questionType: qData.accountType,
      questionEffect: qData.effect,
      pattern: {
        type: qData.accountType,
        effect: qData.effect,
        account: qData.accountName,
        category: qData.accountType,
      },
      journal: journal.map((j) => ({
        account: j.account,
        type: j.type,
        side: j.side,
        amount: j.amount,
      })),
    });
    return true;
  } catch (e) {
    console.error("Save revision error:", e);
    return false;
  }
}

async function fetchRevisionQuestions() {
  const guestId = localStorage.getItem("guest_id");
  if (!auth.currentUser && guestId) {
    const data = loadGuestRevisions(guestId);
    return data.map((d) => ({ ...d, id: d.id || "rev_" + Date.now() }));
  }
  try {
    const email = auth.currentUser ? auth.currentUser.email : null;
    if (!email) return [];
    const docId = email.replace(/[.#$\/\[\]]/g, "_");
    const s = await db
      .collection(REVISION_COLLECTION)
      .where("userId", "==", docId)
      .get();
    const docs = [];
    s.forEach((d) => docs.push({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return docs;
  } catch (e) {
    return [];
  }
}

async function deleteRevisionQuestion(id) {
  const guestId = localStorage.getItem("guest_id");
  if (!auth.currentUser && guestId) {
    let revisions = loadGuestRevisions(guestId);
    revisions = revisions.filter((d) => d.id !== id);
    saveGuestRevisions(guestId, revisions);
    return true;
  }
  try {
    await db.collection(REVISION_COLLECTION).doc(id).delete();
    return true;
  } catch (e) {
    return false;
  }
}

async function getRevisionCount() {
  const guestId = localStorage.getItem("guest_id");
  if (!auth.currentUser && guestId) return loadGuestRevisions(guestId).length;
  try {
    const email = auth.currentUser ? auth.currentUser.email : null;
    if (!email) return 0;
    const docId = email.replace(/[.#$\/\[\]]/g, "_");
    const s = await db
      .collection(REVISION_COLLECTION)
      .where("userId", "==", docId)
      .get();
    return s.size;
  } catch (e) {
    return 0;
  }
}

// ================================================================
// SAVE STATS (used by app.js)
// ================================================================

// This function will be called from app.js; it references the global `state` object.
function saveStats() {
  const s = state.stats;
  if (state.isGuest) {
    try {
      localStorage.setItem("guest_stats_" + state.guestId, JSON.stringify(s));
    } catch (e) {}
  } else if (auth.currentUser && state.statsLoaded) {
    saveUserStats(auth.currentUser.uid, s);
  } else if (auth.currentUser && !state.statsLoaded) {
    state.pendingSave = { uid: auth.currentUser.uid, stats: { ...s } };
    setTimeout(async () => {
      if (state.statsLoaded && state.pendingSave) {
        await saveUserStats(state.pendingSave.uid, state.pendingSave.stats);
        state.pendingSave = null;
      }
    }, 1500);
  }
}

// ================================================================
// TOAST NOTIFICATIONS (used globally)
// ================================================================

function showToast(title, desc, icon, type) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className =
    "toast" +
    (type === "badge" ? " badge-toast" : "") +
    (type === "hint" ? " hint-toast" : "");
  const iconClass =
    type === "gain"
      ? "gain"
      : type === "loss"
        ? "loss"
        : type === "badge"
          ? ""
          : type === "hint"
            ? "coin"
            : "xp-gain";
  toast.innerHTML = `<div class="toast-icon ${iconClass}"><i class="fas ${icon}"></i></div><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-desc">${desc}</div></div><button class="toast-close"><i class="fas fa-times"></i></button>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  toast
    .querySelector(".toast-close")
    .addEventListener("click", () => dismissToast(toast));
  const timeout = setTimeout(() => dismissToast(toast), 3500);
  toast._timeout = timeout;
  const toasts = container.querySelectorAll(".toast");
  if (toasts.length > 4) dismissToast(toasts[0]);
}

function dismissToast(toast) {
  if (toast._dismissed) return;
  toast._dismissed = true;
  if (toast._timeout) {
    clearTimeout(toast._timeout);
    toast._timeout = null;
  }
  toast.classList.remove("show");
  toast.classList.add("hide");
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 400);
}

function showBadgeToast(badge) {
  showToast(
    `Badge Unlocked: ${badge.name}`,
    badge.icon + " " + badge.name,
    "fa-award",
    "badge",
  );
}

function showCoinToast(coins) {
  if (coins > 0)
    showToast(
      "Coins Earned!",
      `+${coins} <i class="fas fa-coins" style="color:#d4a017;"></i>`,
      "fa-coins",
      "hint",
    );
}

function showRubyToast(rubies) {
  if (rubies > 0)
    showToast(
      "Ruby Earned!",
      `+${rubies} <i class="fas fa-gem" style="color:var(--ruby-color);"></i>`,
      "fa-gem",
      "gain",
    );
}

function showHeartToast(hearts, lost) {
  if (lost) {
    showToast(
      "💔 Heart Lost!",
      `${hearts} hearts remaining.`,
      "fa-heart",
      "loss",
    );
  } else {
    showToast(
      "❤️ Heart Refilled!",
      `${hearts} hearts available.`,
      "fa-heart",
      "gain",
    );
  }
}

// ================================================================
// USER DATA LISTENER
// ================================================================

function setupUserDataListener(uid) {
  if (state.unsubUser) {
    state.unsubUser();
    state.unsubUser = null;
  }
  if (isGuestUid(uid)) return;

  const email = auth.currentUser ? auth.currentUser.email : null;
  if (!email) return;
  const docId = email.replace(/[.#$\/\[\]]/g, "_");

  state.unsubUser = db
    .collection(USERS_COLLECTION)
    .doc(docId)
    .onSnapshot(
      (doc) => {
        state.statsLoaded = true;
        state.statsLoadAttempted = true;

        if (doc.exists) {
          const data = doc.data();
          state.stats = {
            totalQuestions: data.totalQuestions || 0,
            correct: data.correct || 0,
            wrong: data.wrong || 0,
            streak: data.streak || 0,
            bestStreak: data.bestStreak || 0,
            xp: data.xp || 0,
            points: data.points || 0,
            coins: data.coins || 0,
            rubies: data.rubies || 0,
            hints: data.hints || 0,
            level: data.level || 1,
            accuracyHistory: data.accuracyHistory || [],
            weakRules: data.weakRules || {},
            quizHistory: data.quizHistory || [],
            fastAnswers: data.fastAnswers || 0,
            ruleBreakerCount: data.ruleBreakerCount || 0,
            focusCount: data.focusCount || 0,
            smartModeCount: data.smartModeCount || 0,
            earnedBadges: data.earnedBadges || [],
            smartCategoryData: data.smartCategoryData || {},
            effectiveDifficulty: data.effectiveDifficulty || "easy",
            hearts: data.hearts !== undefined ? data.hearts : 5,
            maxHearts: data.maxHearts || 5,
            lastHeartRefill: data.lastHeartRefill || Date.now(),
            timerWrongCount: data.timerWrongCount || 0,
            pointBoosterActive: data.pointBoosterActive || false,
            pointBoosterExpiry: data.pointBoosterExpiry || 0,
            coinBoosterActive: data.coinBoosterActive || false,
            coinBoosterExpiry: data.coinBoosterExpiry || 0,
            noStreakBreakRemaining: data.noStreakBreakRemaining || 0,
            topicStats: data.topicStats || {
              asset: { total: 0, wrong: 0 },
              liability: { total: 0, wrong: 0 },
              capital: { total: 0, wrong: 0 },
              revenue: { total: 0, wrong: 0 },
              expense: { total: 0, wrong: 0 },
              drawing: { total: 0, wrong: 0 },
            },
            timerQuestionsCompleted: data.timerQuestionsCompleted || 0,
            timer5sCompleted: data.timer5sCompleted || 0,
            timer10sCompleted: data.timer10sCompleted || 0,
            revisionCorrect: data.revisionCorrect || 0,
            pointBoosterUsed: data.pointBoosterUsed || 0,
            coinBoosterUsed: data.coinBoosterUsed || 0,
            streakBoosterUsed: data.streakBoosterUsed || 0,
            heartsLost: data.heartsLost || 0,
            _heartRefillDone: false,
            javedaClicks: data.javedaClicks || 0,
            dailyStreak: data.dailyStreak || 0,
            lastActivityDate: data.lastActivityDate || null,
            sessionQuestions: data.sessionQuestions || 0,
            nightQuestions: data.nightQuestions || 0,
            earlyQuestions: data.earlyQuestions || 0,
          };
          state.stats.level = getLevelFromXP(state.stats.xp);

          for (const id of state.stats.earnedBadges || []) {
            state._shownBadges.add(id);
          }

          if (state.smartMode && state.stats.smartCategoryData) {
            SMART_TRACKER.categoryCounts = state.stats.smartCategoryData;
            SMART_TRACKER.baseMode = state.difficulty;
            SMART_TRACKER.smartDifficulty =
              state.stats.effectiveDifficulty || state.difficulty;
          }

          if (state.pendingSave) {
            const ps = state.pendingSave;
            Object.assign(state.stats, ps.stats);
            state.stats.level = getLevelFromXP(state.stats.xp);
            saveUserStats(ps.uid, state.stats);
            state.pendingSave = null;
          }
        } else {
          if (!state.stats.topicStats) {
            state.stats.topicStats = {
              asset: { total: 0, wrong: 0 },
              liability: { total: 0, wrong: 0 },
              capital: { total: 0, wrong: 0 },
              revenue: { total: 0, wrong: 0 },
              expense: { total: 0, wrong: 0 },
              drawing: { total: 0, wrong: 0 },
            };
          }
          state.stats._heartRefillDone = false;
          state.stats.javedaClicks = state.stats.javedaClicks || 0;
          state.stats.dailyStreak = state.stats.dailyStreak || 0;
          state.stats.lastActivityDate = state.stats.lastActivityDate || null;
          state.stats.sessionQuestions = state.stats.sessionQuestions || 0;
          state.stats.nightQuestions = state.stats.nightQuestions || 0;
          state.stats.earlyQuestions = state.stats.earlyQuestions || 0;
        }

        state.stats._heartRefillDone = false;
        // checkHeartRefill is defined in app.js, so we call it globally
        if (typeof checkHeartRefill === "function") {
          checkHeartRefill();
        }

        // UI updates will be handled by app.js via global functions
        if (typeof updateHeaderStats === "function") updateHeaderStats();
        if (typeof updateDashboard === "function") updateDashboard();
        if (typeof updateBadges === "function") updateBadges();
        if (typeof updateWeakTopics === "function") updateWeakTopics();
        if (typeof updateQuizProgress === "function") updateQuizProgress();
        if (typeof updateShopUI === "function") updateShopUI();
        if (typeof updateHintButton === "function") updateHintButton();
        if (typeof renderLeaderboard === "function") renderLeaderboard();
        if (typeof updateHeartsDisplay === "function") updateHeartsDisplay();
        if (typeof updateBoosterStatus === "function") updateBoosterStatus();
      },
      (error) => {
        console.error("User data error:", error);
        state.statsLoaded = true;
        state.statsLoadAttempted = true;
      },
    );
}

// ================================================================
// LEADERBOARD LISTENER
// ================================================================

let leaderboardData = [];
let leaderboardSortKey = "xp";

function setupLeaderboardListener() {
  // Guest check: if guest, we still render but data empty.
  if (state.isGuest) {
    if (typeof renderLeaderboard === "function") renderLeaderboard();
    return;
  }

  if (state.unsubLeaderboard) {
    state.unsubLeaderboard();
    state.unsubLeaderboard = null;
  }
  state.unsubLeaderboard = db
    .collection(USERS_COLLECTION)
    .orderBy("xp", "desc")
    .limit(200)
    .onSnapshot(
      (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const email = data.email || doc.id;
          if (isGuestUid(email)) return;
          const total = (data.correct || 0) + (data.wrong || 0);
          const acc =
            total > 0 ? Math.round(((data.correct || 0) / total) * 100) : 0;
          const badges = (data.earnedBadges || []).length;
          users.push({
            id: doc.id,
            email: email,
            name: data.displayName || "User",
            xp: data.xp || 0,
            points: data.points || 0,
            accuracy: acc,
            photoURL: data.photoURL || "",
            badges: badges,
            isUser: false,
          });
        });
        leaderboardData = users;
        if (typeof renderLeaderboard === "function") renderLeaderboard();
      },
      (error) => {
        console.error("Leaderboard error:", error);
      },
    );
}

// ================================================================
// LOGIN OVERLAY & AUTH HANDLING
// ================================================================

function showLogin() {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.classList.remove("hidden");
  const header = document.getElementById("appHeader");
  const nav = document.getElementById("navTabs");
  const panels = document.querySelectorAll(".section-panel");
  if (header) header.style.opacity = "0.3";
  if (nav) nav.style.opacity = "0.3";
  panels.forEach((el) => (el.style.opacity = "0.3"));
}

function hideLogin() {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.classList.add("hidden");
  const header = document.getElementById("appHeader");
  const nav = document.getElementById("navTabs");
  const panels = document.querySelectorAll(".section-panel");
  if (header) header.style.opacity = "1";
  if (nav) nav.style.opacity = "1";
  panels.forEach((el) => (el.style.opacity = "1"));
}

function handleAuthState(user) {
  if (user) {
    state.isGuest = false;
    hideLogin();
    if (!isGuestUid(user.uid)) {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) {
        try {
          const saved = localStorage.getItem("guest_stats_" + guestId);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (!state.statsLoaded) {
              state.stats = { ...state.stats, ...parsed };
              if (!state.stats.topicStats) {
                state.stats.topicStats = {
                  asset: { total: 0, wrong: 0 },
                  liability: { total: 0, wrong: 0 },
                  capital: { total: 0, wrong: 0 },
                  revenue: { total: 0, wrong: 0 },
                  expense: { total: 0, wrong: 0 },
                  drawing: { total: 0, wrong: 0 },
                };
              }
              state.stats.level = getLevelFromXP(state.stats.xp);
              state.stats._heartRefillDone = false;
              for (const id of state.stats.earnedBadges || []) {
                state._shownBadges.add(id);
              }
              state.stats.javedaClicks = state.stats.javedaClicks || 0;
              state.stats.dailyStreak = state.stats.dailyStreak || 0;
              state.stats.lastActivityDate =
                state.stats.lastActivityDate || null;
              state.stats.sessionQuestions = state.stats.sessionQuestions || 0;
              state.stats.nightQuestions = state.stats.nightQuestions || 0;
              state.stats.earlyQuestions = state.stats.earlyQuestions || 0;
            }
          }
        } catch (e) {}
      }
      setupUserDataListener(user.uid);
    }
    // updateRevisionBadges is in app.js
    if (typeof updateRevisionBadges === "function") updateRevisionBadges();
    setupLeaderboardListener();
    if (typeof loadRevisionList === "function") loadRevisionList();
    if (typeof generateNextQuestionSet === "function") generateNextQuestionSet();
    const avatar = document.getElementById("userAvatar");
    const nameDisplay = document.getElementById("userNameDisplay");
    if (user.photoURL && avatar) avatar.src = user.photoURL;
    if (nameDisplay) nameDisplay.textContent = user.displayName || "User";
    setTimeout(() => {
      if (state.statsLoaded) {
        showToast(
          "Welcome!",
          `Signed in as ${user.displayName || "User"}`,
          "fa-smile",
          "gain",
        );
      }
    }, 600);
  } else {
    const guestId = localStorage.getItem("guest_id");
    if (guestId && state.isGuest) {
      hideLogin();
      try {
        const saved = localStorage.getItem("guest_stats_" + guestId);
        if (saved) {
          const parsed = JSON.parse(saved);
          state.stats = { ...state.stats, ...parsed };
          if (!state.stats.topicStats) {
            state.stats.topicStats = {
              asset: { total: 0, wrong: 0 },
              liability: { total: 0, wrong: 0 },
              capital: { total: 0, wrong: 0 },
              revenue: { total: 0, wrong: 0 },
              expense: { total: 0, wrong: 0 },
              drawing: { total: 0, wrong: 0 },
            };
          }
          state.stats.level = getLevelFromXP(state.stats.xp);
          state.stats._heartRefillDone = false;
          state.statsLoaded = true;
          for (const id of state.stats.earnedBadges || []) {
            state._shownBadges.add(id);
          }
          state.stats.javedaClicks = state.stats.javedaClicks || 0;
          state.stats.dailyStreak = state.stats.dailyStreak || 0;
          state.stats.lastActivityDate = state.stats.lastActivityDate || null;
          state.stats.sessionQuestions = state.stats.sessionQuestions || 0;
          state.stats.nightQuestions = state.stats.nightQuestions || 0;
          state.stats.earlyQuestions = state.stats.earlyQuestions || 0;
          if (typeof checkHeartRefill === "function") checkHeartRefill();
          if (typeof updateHeaderStats === "function") updateHeaderStats();
          if (typeof updateDashboard === "function") updateDashboard();
          if (typeof updateBadges === "function") updateBadges();
          if (typeof updateWeakTopics === "function") updateWeakTopics();
          if (typeof updateQuizProgress === "function") updateQuizProgress();
          if (typeof updateShopUI === "function") updateShopUI();
          if (typeof updateHintButton === "function") updateHintButton();
          if (typeof renderLeaderboard === "function") renderLeaderboard();
        }
      } catch (e) {}
      setupLeaderboardListener();
      if (typeof loadRevisionList === "function") loadRevisionList();
      if (typeof generateNextQuestionSet === "function") generateNextQuestionSet();
    } else {
      showLogin();
      if (state.unsubUser) {
        state.unsubUser();
        state.unsubUser = null;
      }
      if (state.unsubLeaderboard) {
        state.unsubLeaderboard();
        state.unsubLeaderboard = null;
      }
    }
  }
}