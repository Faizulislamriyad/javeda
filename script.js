// ================================================================
// SCRIPT.JS — Everything except Quiz‑Section logic
// ================================================================

// --------------------------------------------
// 1. HELPERS
// --------------------------------------------

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAmount(range) {
  const [min, max] = range;
  const step = 500;
  const val = min + Math.random() * (max - min);
  return Math.round(val / step) * step;
}

function getXPForLevel(level) {
  if (level <= 1) return 0;
  const n = level - 1;
  return n * 100 + (10 * (n - 1) * n) / 2;
}

function getLevelFromXP(xp) {
  let level = 1;
  while (xp >= getXPForLevel(level + 1)) level++;
  return level;
}

function getXPProgress(xp) {
  const level = getLevelFromXP(xp);
  const current = getXPForLevel(level);
  const next = getXPForLevel(level + 1);
  const progress = next > current ? (xp - current) / (next - current) : 0;
  return { level, current, next, progress: Math.min(1, progress) };
}

function getRewards(diff, correct, isRevision, timerMode, timerSec, boosters) {
  if (isRevision) {
    return { points: 0, xp: 0, coins: 1, rubies: 0 };
  }

  if (timerMode) {
    const timerRules = {
      medium: {
        5: { points: 14, xp: 8, coins: 3, rubies: 1 },
        10: { points: 12, xp: 6, coins: 2, rubies: 0 },
      },
      hard: {
        5: { points: 18, xp: 12, coins: 4, rubies: 2 },
        10: { points: 16, xp: 10, coins: 3, rubies: 0 },
      },
    };
    const key = timerSec || "5";
    const rules = timerRules[diff];
    if (rules && rules[key]) {
      const r = rules[key];
      let result = correct
        ? { points: r.points, xp: r.xp, coins: r.coins, rubies: r.rubies }
        : { points: -Math.floor(r.points * 0.5), xp: 0, coins: 0, rubies: 0 };
      if (correct) {
        if (boosters && boosters.pointActive) result.points = Math.floor(result.points * 2);
        if (boosters && boosters.coinActive) result.coins = Math.floor(result.coins * 1.5);
      }
      return result;
    }
    const fallback = timerRules["medium"]["5"];
    let result = correct
      ? { points: fallback.points, xp: fallback.xp, coins: fallback.coins, rubies: fallback.rubies }
      : { points: -Math.floor(fallback.points * 0.5), xp: 0, coins: 0, rubies: 0 };
    if (correct) {
      if (boosters && boosters.pointActive) result.points = Math.floor(result.points * 2);
      if (boosters && boosters.coinActive) result.coins = Math.floor(result.coins * 1.5);
    }
    return result;
  }

  const rules = {
    easy: { points: 4, xp: 2, coins: 1, rubies: 0, penalty: 2 },
    medium: { points: 8, xp: 4, coins: 2, rubies: 0, penalty: 4 },
    hard: { points: 14, xp: 8, coins: 2, rubies: 0, penalty: 6 },
  };
  const r = rules[diff] || rules["easy"];
  let result = correct
    ? { points: r.points, xp: r.xp, coins: r.coins, rubies: r.rubies || 0 }
    : { points: -r.penalty, xp: 0, coins: 0, rubies: 0 };
  if (correct) {
    if (boosters && boosters.pointActive) result.points = Math.floor(result.points * 2);
    if (boosters && boosters.coinActive) result.coins = Math.floor(result.coins * 1.5);
  }
  return result;
}

const BENGALI_PERSON_NAMES = [
  "রহিম", "করিম", "আলম", "রিয়াদ", "সুমন", "হাসান", "রনি", "তাজিম", "ফাহিম",
  "লিমন", "জসিম", "রাফি", "শাওন", "নাঈম", "রাসেল", "সজিব", "আরিফ", "তুহিন",
  "শুভ", "নাবিল",
];

function getRandomName() {
  return pickRandom(BENGALI_PERSON_NAMES);
}

// --------------------------------------------
// 2. STATE
// --------------------------------------------

let state = {
  currentQuestion: null,
  currentTransaction: null,
  currentJournal: null,
  answered: false,
  sessionCorrect: 0,
  sessionWrong: 0,
  difficulty: "easy",
  smartMode: false,
  revisionMode: false,
  revisionQueue: [],
  autoTimer: null,
  countdown: 5,
  questionIndex: 0,
  questionList: [],
  isRevisionQuestion: false,
  currentRevisionDocId: null,
  stats: {
    totalQuestions: 0, correct: 0, wrong: 0, streak: 0, bestStreak: 0,
    xp: 0, points: 0, coins: 0, rubies: 0, hints: 0, level: 1,
    accuracyHistory: [], weakRules: {}, quizHistory: [],
    fastAnswers: 0, ruleBreakerCount: 0, focusCount: 0, smartModeCount: 0,
    earnedBadges: [], smartCategoryData: {}, effectiveDifficulty: "easy",
    hearts: 5, maxHearts: 5, lastHeartRefill: Date.now(),
    timerWrongCount: 0,
    pointBoosterActive: false, pointBoosterExpiry: 0,
    coinBoosterActive: false, coinBoosterExpiry: 0,
    noStreakBreakRemaining: 0,
    topicStats: {
      asset: { total: 0, wrong: 0 },
      liability: { total: 0, wrong: 0 },
      capital: { total: 0, wrong: 0 },
      revenue: { total: 0, wrong: 0 },
      expense: { total: 0, wrong: 0 },
      drawing: { total: 0, wrong: 0 },
    },
    timerQuestionsCompleted: 0, timer5sCompleted: 0, timer10sCompleted: 0,
    revisionCorrect: 0,
    pointBoosterUsed: 0, coinBoosterUsed: 0, streakBoosterUsed: 0,
    heartsLost: 0,
    javedaClicks: 0, dailyStreak: 0, lastActivityDate: null,
    sessionQuestions: 0, nightQuestions: 0, earlyQuestions: 0,
    heartsEmptySince: null, heartsRefillPending: false,
  },
  unsubUser: null, unsubLeaderboard: null,
  isGuest: false, guestId: null,
  questionStartTime: 0, hintUsedForQuestion: false, advancePending: false,
  statsLoaded: false, statsLoadAttempted: false, pendingSave: null,
  timerMode: false, timerSec: 5, timerInterval: null, timerRemaining: 5, timerActive: false,
  heartRefillInterval: null,
  _shownBadges: new Set(),
  _heartCountdownInterval: null,
};

// --------------------------------------------
// 3. UI HELPERS
// --------------------------------------------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// --------------------------------------------
// 4. HEART SYSTEM
// --------------------------------------------

function checkHeartRefill() {
  if (!state.timerMode || state.difficulty === "easy") return;

  const s = state.stats;
  const now = Date.now();
  const refillInterval = 5 * 60 * 1000;

  if (s.hearts >= s.maxHearts) {
    s.lastHeartRefill = now;
    if (s.heartsRefillPending) {
      s.heartsRefillPending = false;
      s.heartsEmptySince = null;
      stopHeartCountdown();
      if (state.timerMode && state.difficulty !== "easy") {
        generateNextQuestionSet();
        showToast("❤️ Heart Refilled!", "Timer Mode resumed.", "fa-heart", "gain");
      }
    }
    return;
  }

  if (s.hearts === 0) {
    if (!s.heartsRefillPending) {
      s.heartsRefillPending = true;
      s.heartsEmptySince = now;
      startHeartCountdown();
      renderNoHeartsState();
    }
    const elapsed = now - s.lastHeartRefill;
    if (elapsed >= refillInterval) {
      s.hearts = 1;
      s.lastHeartRefill = now - (elapsed % refillInterval);
      s.heartsRefillPending = false;
      s.heartsEmptySince = null;
      stopHeartCountdown();
      updateHeartsDisplay();
      saveStats();
      showHeartToast(s.hearts, false);
      if (state.timerMode && state.difficulty !== "easy") {
        generateNextQuestionSet();
        showToast("❤️ Heart Refilled!", "Timer Mode resumed.", "fa-heart", "gain");
      }
    }
    return;
  }

  const elapsed = now - s.lastHeartRefill;
  if (elapsed >= refillInterval) {
    const heartsToAdd = Math.min(s.maxHearts - s.hearts, Math.floor(elapsed / refillInterval));
    if (heartsToAdd > 0) {
      s.hearts += heartsToAdd;
      s.lastHeartRefill = now - (elapsed % refillInterval);
      showHeartToast(s.hearts, false);
      updateHeartsDisplay();
      saveStats();
    } else {
      s.lastHeartRefill = now;
    }
  }
}

function startHeartCountdown() {
  stopHeartCountdown();
  state._heartCountdownInterval = setInterval(() => {
    updateHeartCountdownDisplay();
  }, 1000);
  updateHeartCountdownDisplay();
}

function stopHeartCountdown() {
  if (state._heartCountdownInterval) {
    clearInterval(state._heartCountdownInterval);
    state._heartCountdownInterval = null;
  }
}

function updateHeartCountdownDisplay() {
  const s = state.stats;
  if (!s.heartsRefillPending || s.hearts > 0) {
    if (s.hearts > 0 && s.heartsRefillPending) {
      s.heartsRefillPending = false;
      s.heartsEmptySince = null;
      stopHeartCountdown();
      if (state.timerMode && state.difficulty !== "easy") {
        generateNextQuestionSet();
        showToast("❤️ Heart Refilled!", "Timer Mode resumed.", "fa-heart", "gain");
      }
    }
    return;
  }

  const now = Date.now();
  const refillInterval = 5 * 60 * 1000;
  const elapsed = now - s.lastHeartRefill;
  const remaining = Math.max(0, refillInterval - elapsed);
  const seconds = Math.ceil(remaining / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const transactionDisplay = document.getElementById("transactionDisplay");
  const accountName = document.getElementById("accountName");
  if (transactionDisplay) transactionDisplay.innerHTML = `💔 No Hearts Left`;
  if (accountName) accountName.textContent = `Refilling in ${timeStr}`;

  const timerDisplay = document.getElementById("timerDisplay");
  const timerCountdown = document.getElementById("timerCountdown");
  if (timerDisplay && state.timerMode) {
    timerDisplay.classList.add("show");
    timerDisplay.classList.remove("warning");
    if (timerCountdown) timerCountdown.textContent = seconds;
  }
}

function renderNoHeartsState() {
  const transactionDisplay = document.getElementById("transactionDisplay");
  const accountName = document.getElementById("accountName");
  if (transactionDisplay) transactionDisplay.innerHTML = `💔 No Hearts Left`;
  if (accountName) accountName.textContent = `Refilling...`;

  document.querySelectorAll(".quiz-opt").forEach((b) => (b.disabled = true));
  const fb = document.getElementById("feedbackBox");
  if (fb) fb.classList.remove("show");

  if (state.timerMode && state.difficulty !== "easy") {
    const timerDisplay = document.getElementById("timerDisplay");
    const timerCountdown = document.getElementById("timerCountdown");
    if (timerDisplay) {
      timerDisplay.classList.add("show");
      timerDisplay.classList.remove("warning");
    }
    if (timerCountdown) timerCountdown.textContent = "0";
  }

  updateHeartsDisplay();
  updateHintButton();
}

function updateHeartsDisplay() {
  const s = state.stats;
  const inlineContainer = document.getElementById("heartsInline");
  const inlineDisplay = document.getElementById("heartsInlineDisplay");
  const inlineCount = document.getElementById("heartsInlineCount");

  if (state.timerMode && state.difficulty !== "easy") {
    inlineContainer.classList.add("show");
    let html = "";
    for (let i = 0; i < s.maxHearts; i++) {
      if (i < s.hearts) html += `<span class="heart">❤️</span>`;
      else html += `<span class="heart lost">🤍</span>`;
    }
    if (inlineDisplay) inlineDisplay.innerHTML = html;
    if (inlineCount) inlineCount.textContent = s.hearts;
  } else {
    inlineContainer.classList.remove("show");
  }
  setText("dHearts", s.hearts);
}

function loseHeart() {
  const s = state.stats;
  if (!state.timerMode || state.difficulty === "easy") return;

  s.hearts = Math.max(0, s.hearts - 1);
  s.timerWrongCount = 0;
  s.heartsLost = (s.heartsLost || 0) + 1;
  updateHeartsDisplay();
  saveStats();

  if (s.hearts <= 0) {
    s.heartsRefillPending = true;
    s.heartsEmptySince = Date.now();
    startHeartCountdown();
    renderNoHeartsState();
    showToast("💔 No Hearts Left!", "Timer Mode paused. Refilling in 5 minutes.", "fa-heart", "loss");
    stopTimer();
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) {
      timerDisplay.classList.add("show");
      timerDisplay.classList.remove("warning");
    }
  } else {
    showHeartToast(s.hearts, true);
  }
}

// --------------------------------------------
// 5. BOOSTER SYSTEM
// --------------------------------------------

function checkBoosters() {
  const s = state.stats;
  const now = Date.now();
  if (s.pointBoosterActive && s.pointBoosterExpiry < now) {
    s.pointBoosterActive = false;
    s.pointBoosterExpiry = 0;
    showToast("⏰ Point Booster Expired", "2× points boost is over.", "fa-clock", "gain");
    updateBoosterStatus();
  }
  if (s.coinBoosterActive && s.coinBoosterExpiry < now) {
    s.coinBoosterActive = false;
    s.coinBoosterExpiry = 0;
    showToast("⏰ Coin Booster Expired", "1.5× coins boost is over.", "fa-clock", "gain");
    updateBoosterStatus();
  }
  updateBoosterStatus();
}

function getBoosters() {
  const s = state.stats;
  const now = Date.now();
  return {
    pointActive: s.pointBoosterActive && s.pointBoosterExpiry > now,
    coinActive: s.coinBoosterActive && s.coinBoosterExpiry > now,
    streakActive: s.noStreakBreakRemaining > 0,
    pointRemaining: s.pointBoosterActive ? Math.max(0, Math.ceil((s.pointBoosterExpiry - now) / 1000)) : 0,
    coinRemaining: s.coinBoosterActive ? Math.max(0, Math.ceil((s.coinBoosterExpiry - now) / 1000)) : 0,
    streakRemaining: s.noStreakBreakRemaining,
  };
}

function updateBoosterStatus() {
  const bar = document.getElementById("boosterStatusBar");
  if (!bar) return;
  const b = getBoosters();
  let html = "";
  if (b.pointActive) html += `<span class="booster-badge active point">⚡ 2×P ${Math.floor(b.pointRemaining / 60)}m</span>`;
  if (b.coinActive) html += `<span class="booster-badge active coin">🪙 1.5×C ${Math.floor(b.coinRemaining / 60)}m</span>`;
  if (b.streakActive) html += `<span class="booster-badge active streak">🛡️ ${b.streakRemaining} left</span>`;
  bar.innerHTML = html;

  const pointStatus = document.getElementById("boosterPointStatus");
  const coinStatus = document.getElementById("boosterCoinStatus");
  const streakStatus = document.getElementById("boosterStreakStatus");
  if (pointStatus) {
    pointStatus.innerHTML = b.pointActive ? `<span class="booster-active-badge" style="background:var(--accent-3);color:#1a1a2e;">⚡ Active ${Math.floor(b.pointRemaining / 60)}m</span>` : "";
  }
  if (coinStatus) {
    coinStatus.innerHTML = b.coinActive ? `<span class="booster-active-badge" style="background:#d4a017;color:#fff;">🪙 Active ${Math.floor(b.coinRemaining / 60)}m</span>` : "";
  }
  if (streakStatus) {
    streakStatus.innerHTML = b.streakActive ? `<span class="booster-active-badge" style="background:var(--accent-1);color:#fff;">🛡️ ${b.streakRemaining} left</span>` : "";
  }
}

function activateBooster(type, duration, costCoins, costRubies) {
  const s = state.stats;
  if (s.coins < costCoins || s.rubies < costRubies) {
    showToast("Not Enough Resources", `Need ${costCoins}🪙 and ${costRubies}💎`, "fa-exclamation-circle", "loss");
    return false;
  }
  s.coins -= costCoins;
  s.rubies -= costRubies;
  const now = Date.now();
  if (type === "point") {
    s.pointBoosterActive = true;
    s.pointBoosterExpiry = now + duration * 1000;
    s.pointBoosterUsed = (s.pointBoosterUsed || 0) + 1;
    showToast("⚡ Point Booster Activated!", "2× points for 10 minutes.", "fa-rocket", "gain");
  } else if (type === "coin") {
    s.coinBoosterActive = true;
    s.coinBoosterExpiry = now + duration * 1000;
    s.coinBoosterUsed = (s.coinBoosterUsed || 0) + 1;
    showToast("🪙 Coin Booster Activated!", "1.5× coins for 5 minutes.", "fa-rocket", "gain");
  } else if (type === "streak") {
    s.noStreakBreakRemaining = 10;
    s.streakBoosterUsed = (s.streakBoosterUsed || 0) + 1;
    showToast("🛡️ No Streak Break Activated!", "Next 10 wrong answers won't break your streak.", "fa-rocket", "gain");
  }
  updateHeaderStats();
  updateDashboard();
  updateShopUI();
  updateBoosterStatus();
  saveStats();
  return true;
}

// --------------------------------------------
// 6. HEADER STATS
// --------------------------------------------

function updateHeaderStats() {
  const s = state.stats;
  setText("hRubies", s.rubies || 0);
  setText("hCoins", s.coins);
  setText("hXp", s.xp);
  setText("hPoints", s.points);
  const level = getLevelFromXP(s.xp);
  setText("hLevel", level);
  setText("hStreak", s.streak);
  const avatar = document.getElementById("userAvatar");
  const nameDisplay = document.getElementById("userNameDisplay");
  if (auth.currentUser) {
    if (auth.currentUser.photoURL && avatar) avatar.src = auth.currentUser.photoURL;
    if (nameDisplay) nameDisplay.textContent = auth.currentUser.displayName || "User";
  } else if (state.isGuest) {
    if (avatar) avatar.src = "https://ui-avatars.com/api/?name=Guest&background=5b4bd5&color=fff&size=36";
    if (nameDisplay) nameDisplay.textContent = "Guest";
  }
  const hintCount = document.getElementById("hintCountDisplay");
  if (hintCount) hintCount.textContent = s.hints || 0;
  updateHeartsDisplay();
  updateBoosterStatus();
  checkBoosters();
}

// --------------------------------------------
// 7. BADGES (100 total)
// --------------------------------------------

const ALL_BADGES = [
  { id: "n1", icon: "👑", name: "Leaderboard XP King" },
  { id: "n2", icon: "🏅", name: "Leaderboard Points Pro" },
  { id: "n3", icon: "🎯", name: "Leaderboard Accuracy Ace" },
  { id: "n4", icon: "🏆", name: "Leaderboard Badge Collector" },
  { id: "n5", icon: "📚", name: "Javeda Explorer" },
  { id: "n6", icon: "📖", name: "Javeda Scholar" },
  { id: "n7", icon: "💡", name: "Hint Hoarder" },
  { id: "n8", icon: "💡", name: "Hint Master" },
  { id: "n9", icon: "📅", name: "Perfect Week" },
  { id: "n10", icon: "📅", name: "Monthly Mentor" },
  { id: "n11", icon: "⚡", name: "Quick Learner" },
  { id: "n12", icon: "🏃", name: "Marathon Runner" },
  { id: "n13", icon: "🌙", name: "Night Owl" },
  { id: "n14", icon: "🌅", name: "Early Bird" },
  { id: "n15", icon: "🔄", name: "Revision King" },
  { id: "n16", icon: "🔄", name: "Revision Master" },
  { id: "n17", icon: "⏱️", name: "Timer Survivor" },
  { id: "n18", icon: "⏱️", name: "Timer Legend" },
  { id: "n19", icon: "🧠", name: "Smart Learner" },
  { id: "n20", icon: "🧠", name: "Smart Guru" },
  { id: "n21", icon: "💰", name: "Coin Millionaire" },
  { id: "n22", icon: "💎", name: "Ruby Baron" },
  { id: "n23", icon: "🛡️", name: "Streak Protector" },
  { id: "n24", icon: "⚡", name: "Point Booster Fan" },
  { id: "n25", icon: "🪙", name: "Coin Booster Fan" },
  { id: "n26", icon: "📊", name: "Accountant Pro" },
  { id: "n27", icon: "🏅", name: "Ultimate Journal Master" },
  { id: "n28", icon: "👑", name: "Journal Legend" },
  { id: "b3", icon: "💳", name: "Debit Starter" },
  { id: "b4", icon: "💳", name: "Credit Starter" },
  { id: "b5", icon: "🔥", name: "Warmed Up" },
  { id: "b7", icon: "📓", name: "Journal Rookie" },
  { id: "b8", icon: "🗺️", name: "Accounting Explorer" },
  { id: "b9", icon: "📊", name: "Ledger Learner" },
  { id: "b10", icon: "⚖️", name: "Trial Balance Maker" },
  { id: "b11", icon: "👨‍💼", name: "Entry Master" },
  { id: "b13", icon: "🧠", name: "Sharp Mind" },
  { id: "b14", icon: "🎯", name: "Precision Player" },
  { id: "b16", icon: "💎", name: "Flawless Brain" },
  { id: "b17", icon: "🛡️", name: "Zero Error Zone" },
  { id: "b18", icon: "🔥", name: "Streak 5x" },
  { id: "b19", icon: "🔥", name: "Streak 10x" },
  { id: "b20", icon: "🔥", name: "Streak 25x" },
  { id: "b21", icon: "🔥", name: "Streak 50x" },
  { id: "b22", icon: "👑", name: "Streak King" },
  { id: "b23", icon: "🏦", name: "Asset Expert" },
  { id: "b24", icon: "📉", name: "Liability Genius" },
  { id: "b25", icon: "💰", name: "Capital Controller" },
  { id: "b26", icon: "📈", name: "Revenue Master" },
  { id: "b27", icon: "💸", name: "Expense Specialist" },
  { id: "b28", icon: "✏️", name: "Drawing Handler" },
  { id: "b29", icon: "🔧", name: "Rule Breaker" },
  { id: "b30", icon: "⚖️", name: "Balance Thinker" },
  { id: "b31", icon: "⚡", name: "Fast Decision" },
  { id: "b32", icon: "💪", name: "No Hesitation" },
  { id: "b33", icon: "📝", name: "First Entry" },
  { id: "b34", icon: "🌟", name: "Perfect Quiz" },
  { id: "b35", icon: "🏅", name: "100 Questions" },
  { id: "b36", icon: "🥈", name: "500 Questions" },
  { id: "b37", icon: "🥇", name: "1000 Questions" },
  { id: "b38", icon: "🏆", name: "Accounting Pro" },
  { id: "b39", icon: "🏆", name: "Debit-Credit Champ" },
  { id: "b40", icon: "👼", name: "Journal God" },
  { id: "b42", icon: "🧠", name: "Financial Brain" },
  { id: "b43", icon: "🔍", name: "Error Hunter" },
  { id: "b44", icon: "🎯", name: "Focus Mode" },
  { id: "b46", icon: "💡", name: "Smart Thinker" },
  { id: "b50", icon: "👑", name: "Ultimate Accountant" },
  { id: "b51", icon: "🏆", name: "Top 10 Leaderboard" },
  { id: "b55", icon: "⏱️", name: "Timer Novice" },
  { id: "b56", icon: "⏱️", name: "Timer Adept" },
  { id: "b57", icon: "⏱️", name: "Timer Master" },
  { id: "b58", icon: "⏱️", name: "Speed Demon (5s)" },
  { id: "b59", icon: "⏱️", name: "Quick Thinker (10s)" },
  { id: "b63", icon: "📚", name: "2000 Questions" },
  { id: "b70", icon: "💎", name: "Ruby Tycoon (500)" },
  { id: "b71", icon: "🪙", name: "Coin Collector (1000)" },
  { id: "b72", icon: "🪙", name: "Coin Hoarder (5000)" },
  { id: "b73", icon: "🪙", name: "Coin Tycoon (10000)" },
  { id: "b74", icon: "⬆️", name: "Level 20" },
  { id: "b75", icon: "⬆️", name: "Level 50" },
  { id: "b76", icon: "⬆️", name: "Level 100" },
  { id: "b77", icon: "🧠", name: "Smart User (100)" },
  { id: "b78", icon: "🧠", name: "Smart Master (500)" },
  { id: "b79", icon: "🔄", name: "Revise 50" },
  { id: "b80", icon: "🔄", name: "Revise 100" },
  { id: "b81", icon: "⚡", name: "Point Booster x10" },
  { id: "b82", icon: "🪙", name: "Coin Booster x10" },
  { id: "b83", icon: "🛡️", name: "Streak Protector x10" },
  { id: "b85", icon: "❤️", name: "Heart Collector (full 5)" },
  { id: "b86", icon: "🏅", name: "All Rounder" },
  { id: "b87", icon: "⭐", name: "5-Star Performer" },
  { id: "b88", icon: "🎖️", name: "Dedicated Scholar" },
  { id: "b93", icon: "🤝", name: "Collaborator" },
  { id: "b94", icon: "🎓", name: "Scholar" },
  { id: "b95", icon: "📈", name: "Rising Star" },
  { id: "b96", icon: "🌟", name: "Shining Star" },
  { id: "b97", icon: "✨", name: "Legendary" },
  { id: "b98", icon: "👑", name: "Royal Accountant" },
  { id: "b99", icon: "💼", name: "Finance Pro" },
];

function checkBadges(stats) {
  const earned = [];
  const total = stats.correct + stats.wrong;
  const acc = total > 0 ? stats.correct / total : 0;
  const accPct = Math.round(acc * 100);
  const typeCounts = { asset: 0, liability: 0, capital: 0, revenue: 0, expense: 0, drawing: 0 };
  if (stats.quizHistory) {
    for (const h of stats.quizHistory) {
      if (h.userAnswer === h.correctAnswer) {
        if (typeCounts[h.type] !== undefined) typeCounts[h.type]++;
      }
    }
  }

  if (stats.correct >= 1 && stats.quizHistory && stats.quizHistory.some(h => h.correctAnswer === "debit" && h.userAnswer === "debit")) earned.push("b3");
  if (stats.correct >= 1 && stats.quizHistory && stats.quizHistory.some(h => h.correctAnswer === "credit" && h.userAnswer === "credit")) earned.push("b4");
  if (stats.correct >= 5) earned.push("b5");
  if (stats.correct >= 10) earned.push("b7");
  if (stats.correct >= 25) earned.push("b8");
  if (stats.correct >= 50) earned.push("b9");
  if (stats.correct >= 100) earned.push("b10");
  if (stats.correct >= 200) earned.push("b11");
  if (accPct >= 80 && total >= 10) earned.push("b13");
  if (accPct >= 90 && total >= 20) earned.push("b14");
  if (stats.bestStreak >= 20) earned.push("b16");
  if (stats.wrong === 0 && total >= 50) earned.push("b17");
  if (stats.bestStreak >= 5) earned.push("b18");
  if (stats.bestStreak >= 10) earned.push("b19");
  if (stats.bestStreak >= 25) earned.push("b20");
  if (stats.bestStreak >= 50) earned.push("b21");
  if (stats.bestStreak >= 100) earned.push("b22");
  if (typeCounts.asset >= 10) earned.push("b23");
  if (typeCounts.liability >= 10) earned.push("b24");
  if (typeCounts.capital >= 10) earned.push("b25");
  if (typeCounts.revenue >= 10) earned.push("b26");
  if (typeCounts.expense >= 10) earned.push("b27");
  if (typeCounts.drawing >= 5) earned.push("b28");
  if (stats.ruleBreakerCount && stats.ruleBreakerCount >= 1) earned.push("b29");
  if (stats.correct >= 15) earned.push("b30");
  if (stats.fastAnswers && stats.fastAnswers >= 1) earned.push("b31");
  if (stats.fastAnswers && stats.fastAnswers >= 10) earned.push("b32");
  if (stats.correct >= 1) earned.push("b33");
  if (stats.correct >= 10 && stats.wrong === 0 && total >= 10) earned.push("b34");
  if (total >= 100) earned.push("b35");
  if (total >= 500) earned.push("b36");
  if (total >= 1000) earned.push("b37");
  if (stats.level >= 10) earned.push("b38");
  if (stats.correct >= 500) earned.push("b39");
  if (stats.correct >= 1000) earned.push("b40");
  if (accPct >= 95 && total >= 100) earned.push("b42");
  if (stats.wrong > 0 && stats.wrong / total < 0.1 && total >= 20) earned.push("b43");
  if (stats.focusCount && stats.focusCount >= 20) earned.push("b44");
  if (stats.smartModeCount && stats.smartModeCount >= 50) earned.push("b46");
  if (stats.correct >= 5000) earned.push("b50");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 10) earned.push("b55");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 50) earned.push("b56");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 100) earned.push("b57");
  if (stats.timer5sCompleted && stats.timer5sCompleted >= 50) earned.push("b58");
  if (stats.timer10sCompleted && stats.timer10sCompleted >= 50) earned.push("b59");
  if (total >= 2000) earned.push("b63");
  if (stats.rubies >= 500) earned.push("b70");
  if (stats.coins >= 1000) earned.push("b71");
  if (stats.coins >= 5000) earned.push("b72");
  if (stats.coins >= 10000) earned.push("b73");
  if (stats.level >= 20) earned.push("b74");
  if (stats.level >= 50) earned.push("b75");
  if (stats.level >= 100) earned.push("b76");
  if (stats.smartModeCount && stats.smartModeCount >= 100) earned.push("b77");
  if (stats.smartModeCount && stats.smartModeCount >= 500) earned.push("b78");
  if (stats.revisionCorrect && stats.revisionCorrect >= 50) earned.push("b79");
  if (stats.revisionCorrect && stats.revisionCorrect >= 100) earned.push("b80");
  if (stats.pointBoosterUsed && stats.pointBoosterUsed >= 10) earned.push("b81");
  if (stats.coinBoosterUsed && stats.coinBoosterUsed >= 10) earned.push("b82");
  if (stats.streakBoosterUsed && stats.streakBoosterUsed >= 10) earned.push("b83");
  if (stats.hearts === stats.maxHearts) earned.push("b85");
  if (accPct >= 80 && total >= 200 && stats.bestStreak >= 50) earned.push("b86");
  if (accPct >= 90 && total >= 500 && stats.bestStreak >= 100) earned.push("b87");
  if (total >= 1000 && stats.correct / total >= 0.7) earned.push("b88");
  if (stats.quizHistory && stats.quizHistory.length >= 100) earned.push("b93");
  if (stats.level >= 15 && accPct >= 75) earned.push("b94");
  if (stats.correct >= 1000 && accPct >= 80) earned.push("b95");
  if (stats.correct >= 2000) earned.push("b96");
  if (total >= 5000) earned.push("b97");
  if (stats.correct >= 5000) earned.push("b98");
  if (stats.coins >= 5000 && stats.rubies >= 200) earned.push("b99");

  if (stats.javedaClicks && stats.javedaClicks >= 1) earned.push("n5");
  if (stats.javedaClicks && stats.javedaClicks >= 5) earned.push("n6");
  if (stats.hints && stats.hints >= 100) earned.push("n7");
  if (stats.hints && stats.hints >= 500) earned.push("n8");
  if (stats.dailyStreak && stats.dailyStreak >= 7) earned.push("n9");
  if (stats.dailyStreak && stats.dailyStreak >= 30) earned.push("n10");
  if (stats.fastAnswers && stats.fastAnswers >= 100) earned.push("n11");
  if (stats.sessionQuestions && stats.sessionQuestions >= 50) earned.push("n12");
  if (stats.nightQuestions && stats.nightQuestions >= 20) earned.push("n13");
  if (stats.earlyQuestions && stats.earlyQuestions >= 20) earned.push("n14");
  if (stats.revisionCorrect && stats.revisionCorrect >= 50) earned.push("n15");
  if (stats.revisionCorrect && stats.revisionCorrect >= 200) earned.push("n16");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 50 && stats.heartsLost === 0) earned.push("n17");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 200) earned.push("n18");
  if (stats.smartModeCount && stats.smartModeCount >= 100) earned.push("n19");
  if (stats.smartModeCount && stats.smartModeCount >= 500) earned.push("n20");
  if (stats.coins >= 10000) earned.push("n21");
  if (stats.rubies >= 200) earned.push("n22");
  if (stats.streakBoosterUsed && stats.streakBoosterUsed >= 10) earned.push("n23");
  if (stats.pointBoosterUsed && stats.pointBoosterUsed >= 10) earned.push("n24");
  if (stats.coinBoosterUsed && stats.coinBoosterUsed >= 10) earned.push("n25");
  const allCategories = ["asset", "liability", "capital", "revenue", "expense", "drawing"];
  let all50 = true;
  for (const cat of allCategories) {
    if ((typeCounts[cat] || 0) < 50) { all50 = false; break; }
  }
  if (all50) earned.push("n26");
  const totalBadges = (stats.earnedBadges || []).length;
  if (totalBadges >= 50) earned.push("n27");
  if (totalBadges >= 75) earned.push("n28");

  return [...new Set(earned)];
}

// --------------------------------------------
// 8. DASHBOARD
// --------------------------------------------

function updateDashboard() {
  const s = state.stats;
  const total = s.correct + s.wrong;
  const acc = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  setText("dTotal", total);
  setText("dCorrect", s.correct);
  setText("dWrong", s.wrong);
  setText("dAccuracy", acc + "%");
  setText("dCoins", s.coins);
  setText("dRubies", s.rubies || 0);
  setText("dHearts", s.hearts || 0);
  setText("dPoints", s.points);
  setText("dXp", s.xp);
  const level = getLevelFromXP(s.xp);
  setText("dLevel", level);
  setText("dStreak", s.streak);
  setText("dHints", s.hints || 0);

  const progress = getXPProgress(s.xp);
  const pct = Math.min(100, progress.progress * 100);
  const fill = document.getElementById("xpBarFill");
  if (fill) fill.style.width = pct + "%";
  setText("xpProgressText", `${s.xp} / ${progress.next} XP`);

  updateShopUI();
}

function updateBadges() {
  const s = state.stats;
  const earnedIds = s.earnedBadges || [];
  const grid = document.getElementById("badgesGrid");
  if (!grid) return;
  grid.innerHTML = "";
  let unlocked = 0;
  for (const badge of ALL_BADGES) {
    const unlockedBadge = earnedIds.includes(badge.id);
    if (unlockedBadge) unlocked++;
    const el = document.createElement("div");
    el.className = "badge-item" + (unlockedBadge ? "" : " locked");
    el.innerHTML = `<div class="b-icon ${unlockedBadge ? "unlocked" : "locked"}">${badge.icon}</div><div class="b-info"><div class="b-name">${badge.name}</div></div>`;
    grid.appendChild(el);
  }
  setText("badgeCount", `${unlocked} / 100`);
}

function updateWeakTopics() {
  const s = state.stats;
  const container = document.getElementById("weakTopics");
  if (!container) return;

  const topicLabels = { asset: "Asset", liability: "Liability", capital: "Capital", revenue: "Revenue", expense: "Expense", drawing: "Drawing" };
  const topicEmojis = { asset: "🏦", liability: "📉", capital: "💰", revenue: "📈", expense: "💸", drawing: "✏️" };

  const topics = s.topicStats || {};
  const entries = Object.entries(topics)
    .filter(([key, data]) => data.total > 0)
    .map(([key, data]) => {
      const pct = data.total > 0 ? Math.round((data.wrong / data.total) * 100) : 0;
      return { key, label: topicLabels[key] || key, emoji: topicEmojis[key] || "📊", total: data.total, wrong: data.wrong, pct };
    })
    .sort((a, b) => b.pct - a.pct);

  if (entries.length === 0) {
    container.innerHTML = '<div style="padding:8px 0;color:var(--accent-2);"><i class="fas fa-check-circle"></i> No weak topics yet. Keep going!</div>';
    return;
  }

  container.innerHTML = entries.map((entry) => {
    const pct = entry.pct;
    let cls = "low";
    if (pct > 60) cls = "high";
    else if (pct > 30) cls = "medium";
    const barPct = Math.min(100, pct);
    return `<div class="weak-topic-item">
                    <span class="topic-name">${entry.emoji} ${entry.label}</span>
                    <div class="topic-bar-wrap">
                        <div class="topic-bar-fill ${cls}" style="width:${barPct}%;"></div>
                    </div>
                    <span class="topic-pct ${cls}">${pct}%</span>
                </div>`;
  }).join("");
}

// --------------------------------------------
// 9. REVISION
// --------------------------------------------

async function updateRevisionBadges() {
  const count = await getRevisionCount();
  const badgeEl = document.getElementById("revCountBadge");
  const toggleBadge = document.getElementById("revToggleCount");
  if (badgeEl) {
    badgeEl.textContent = count;
    badgeEl.className = "rev-count" + (count === 0 ? " zero" : "");
  }
  if (toggleBadge) {
    toggleBadge.textContent = count;
    toggleBadge.className = "rev-count" + (count === 0 ? " zero" : "");
  }
  if (count === 0 && state.revisionMode) {
    state.revisionMode = false;
    state.isRevisionQuestion = false;
    state.currentRevisionDocId = null;
    const revToggle = document.getElementById("revisionToggle");
    if (revToggle) {
      revToggle.classList.remove("active");
      const dot = revToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
    }
    state.revisionQueue = [];
    showToast("Revision Mode Off", "No revision questions left.", "fa-info-circle", "gain");
  }
}

async function loadRevisionList() {
  const container = document.getElementById("revisionList");
  if (!container) return;
  try {
    const docs = await fetchRevisionQuestions();
    if (docs.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle" style="color:var(--accent-2);"></i><h3>No mistakes yet!</h3><p>Keep up the great work!</p></div>`;
      return;
    }
    container.innerHTML = docs.map((doc) => {
      const displayText = doc.displayText || "Transaction";
      const accountName = doc.accountDisplay || doc.questionAccount || "Account";
      const bnName = getBengaliName(accountName) || accountName;
      const time = new Date(doc.timestamp).toLocaleString();
      return `<div class="revision-item"><div><strong>"${displayText}"</strong><span class="meta">${bnName} হিসাব · ${time}</span></div><span class="badge-wrong">Wrong</span></div>`;
    }).join("");
  } catch (e) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle" style="color:var(--accent-4);"></i><h3>Error loading revision data</h3></div>`;
  }
}

async function loadRevisionQueue() {
  try {
    const docs = await fetchRevisionQuestions();
    state.revisionQueue = [];
    for (const doc of docs) {
      const qData = doc.question || {};
      const transData = doc.transaction || {};
      const journalData = doc.journal || [];
      if (!qData.accountName || !qData.accountType) {
        const pattern = doc.pattern || {};
        qData.accountName = qData.accountName || pattern.account || "Account";
        qData.accountType = qData.accountType || pattern.type || "asset";
        qData.effect = qData.effect || pattern.effect || "increase";
        qData.correctAnswer = qData.correctAnswer || "debit";
        qData.explanation = qData.explanation || "Review this transaction.";
        qData.ruleText = qData.ruleText || "Review the rule.";
      }
      state.revisionQueue.push({
        docId: doc.id,
        question: qData,
        transaction: transData,
        journal: journalData,
        displayText: doc.displayText || "Transaction",
        accountDisplay: doc.accountDisplay || qData.accountName,
      });
    }
    return state.revisionQueue.length;
  } catch (e) {
    state.revisionQueue = [];
    return 0;
  }
}

// --------------------------------------------
// 10. SHOP
// --------------------------------------------

function buyHint(hints, price, rubiesBonus) {
  const s = state.stats;
  if (s.coins < price) {
    showToast("Not Enough Coins", `Need ${price} coins. You have ${s.coins}.`, "fa-coins", "loss");
    return;
  }
  if (s.rubies < (rubiesBonus || 0)) {
    showToast("Not Enough Rubies", `Need ${rubiesBonus} rubies. You have ${s.rubies}.`, "fa-gem", "loss");
    return;
  }
  s.coins -= price;
  s.rubies = (s.rubies || 0) - (rubiesBonus || 0);
  s.hints = (s.hints || 0) + hints;
  updateHeaderStats();
  updateDashboard();
  updateShopUI();
  updateHintButton();
  showToast("Hints Purchased!", `${hints} hints added${rubiesBonus ? ` (${rubiesBonus} rubies spent)` : ""}.`, "fa-coins", "hint");
  saveStats();
}

function buyCoins(coins, rubiesCost) {
  const s = state.stats;
  if (s.rubies < rubiesCost) {
    showToast("Not Enough Rubies", `Need ${rubiesCost} rubies. You have ${s.rubies}.`, "fa-gem", "loss");
    return;
  }
  s.rubies -= rubiesCost;
  s.coins += coins;
  updateHeaderStats();
  updateDashboard();
  updateShopUI();
  showToast("Coins Purchased!", `+${coins} coins for ${rubiesCost} rubies.`, "fa-coins", "gain");
  saveStats();
}

function updateShopUI() {
  const s = state.stats;
  setText("shopCoins", s.coins);
  setText("shopRubies", s.rubies || 0);
  setText("shopHints", s.hints || 0);
  document.querySelectorAll(".shop-item .item-buy").forEach((btn) => {
    const type = btn.dataset.type;
    if (type === "hint") {
      const price = parseInt(btn.dataset.price);
      const rubiesNeeded = parseInt(btn.dataset.rubies) || 0;
      btn.disabled = s.coins < price || s.rubies < rubiesNeeded;
    } else if (type === "buycoins") {
      const rubiesNeeded = parseInt(btn.dataset.rubies);
      btn.disabled = s.rubies < rubiesNeeded;
    } else if (type === "booster") {
      const priceCoins = parseInt(btn.dataset.priceCoins) || 0;
      const priceRubies = parseInt(btn.dataset.priceRubies) || 0;
      btn.disabled = s.coins < priceCoins || s.rubies < priceRubies;
    }
  });
  updateBoosterStatus();
}

// --------------------------------------------
// 11. LEADERBOARD
// --------------------------------------------
// NOTE: leaderboardData and leaderboardSortKey are declared in firebase.js.
// We use them here without redeclaring.

function renderLeaderboard() {
  const tbody = document.getElementById("lbBody");
  const empty = document.getElementById("lbEmpty");
  if (!tbody || !empty) return;

  if (state.isGuest) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    empty.innerHTML = `
            <i class="fas fa-lock" style="font-size:48px;color:var(--accent-1);"></i>
            <h3>Log in to View the Leaderboard</h3>
            <p>Sign in with Google to see rankings and compete with others.</p>
        `;
    return;
  }

  const currentEmail = auth.currentUser ? auth.currentUser.email : null;

  let filtered = leaderboardData.filter((u) => !isGuestUid(u.id) && u.email);
  let sorted = [...filtered];
  if (leaderboardSortKey === "xp") sorted.sort((a, b) => b.xp - a.xp);
  else if (leaderboardSortKey === "points") sorted.sort((a, b) => b.points - a.points);
  else if (leaderboardSortKey === "accuracy") sorted.sort((a, b) => b.accuracy - a.accuracy);
  else if (leaderboardSortKey === "badges") sorted.sort((a, b) => (b.badges || 0) - (a.badges || 0));

  const seen = new Set();
  const unique = [];
  for (const u of sorted) {
    if (!seen.has(u.email)) {
      seen.add(u.email);
      unique.push(u);
    }
  }
  sorted = unique;

  if (currentEmail) {
    const userIdx = sorted.findIndex((u) => u.email === currentEmail);
    if (userIdx !== -1) {
      const total = state.stats.correct + state.stats.wrong;
      const acc = total > 0 ? Math.round((state.stats.correct / total) * 100) : 0;
      sorted[userIdx] = {
        ...sorted[userIdx],
        xp: state.stats.xp || 0,
        points: state.stats.points || 0,
        accuracy: acc,
        badges: (state.stats.earnedBadges || []).length,
        email: sorted[userIdx].email,
        name: sorted[userIdx].name,
        photoURL: sorted[userIdx].photoURL,
        isUser: true,
      };
    } else {
      const total = state.stats.correct + state.stats.wrong;
      const acc = total > 0 ? Math.round((state.stats.correct / total) * 100) : 0;
      const userObj = {
        email: currentEmail,
        name: auth.currentUser ? auth.currentUser.displayName || "User" : "User",
        photoURL: auth.currentUser ? auth.currentUser.photoURL || "" : "",
        xp: state.stats.xp || 0,
        points: state.stats.points || 0,
        accuracy: acc,
        badges: (state.stats.earnedBadges || []).length,
        isUser: true,
      };
      if (state.stats.totalQuestions > 0 || state.stats.xp > 0) {
        sorted.push(userObj);
        if (leaderboardSortKey === "xp") sorted.sort((a, b) => b.xp - a.xp);
        else if (leaderboardSortKey === "points") sorted.sort((a, b) => b.points - a.points);
        else if (leaderboardSortKey === "accuracy") sorted.sort((a, b) => b.accuracy - a.accuracy);
        else if (leaderboardSortKey === "badges") sorted.sort((a, b) => (b.badges || 0) - (a.badges || 0));
      }
    }
  }

  if (sorted.length === 0) {
    if (empty) empty.style.display = "block";
    tbody.innerHTML = "";
    return;
  }
  if (empty) empty.style.display = "none";

  tbody.innerHTML = sorted.map((e, i) => {
    const rank = i + 1;
    let rc = "lb-rank";
    if (rank === 1) rc += " gold";
    else if (rank === 2) rc += " silver";
    else if (rank === 3) rc += " bronze";

    const isUser = e.email === currentEmail;
    const rowClass = isUser ? ' class="lb-user-row"' : "";

    const avatar = e.photoURL ? `<img src="${e.photoURL}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:6px;" />` : "";

    const displayName = isUser ? (auth.currentUser ? auth.currentUser.displayName || "User" : "User") : e.name;

    return `<tr${rowClass}>
                    <td><span class="${rc}">#${rank}</span></td>
                    <td>${avatar}${displayName} ${isUser ? '<i class="fas fa-star" style="color:var(--accent-3);font-size:12px;margin-left:4px;"></i>' : ""}</td>
                    <td>${e.xp}</td>
                    <td>${e.points}</td>
                    <td>${e.accuracy}%</td>
                    <td>${e.badges || 0}</td>
                </tr>`;
  }).join("");

  if (currentEmail) {
    const s = state.stats;
    const prevBadges = new Set(s.earnedBadges || []);
    let newBadges = [];

    const userRank = sorted.findIndex((e) => e.email === currentEmail) + 1;
    if (userRank > 0 && userRank <= 3) {
      if (leaderboardSortKey === "xp") newBadges.push("n1");
      else if (leaderboardSortKey === "points") newBadges.push("n2");
      else if (leaderboardSortKey === "accuracy") newBadges.push("n3");
      else if (leaderboardSortKey === "badges") newBadges.push("n4");
    }
    if (userRank > 0 && userRank <= 10) newBadges.push("b51");

    newBadges = newBadges.filter((id) => !prevBadges.has(id) && !state._shownBadges.has(id));

    if (newBadges.length > 0) {
      s.earnedBadges = [...prevBadges, ...newBadges];
      for (const id of newBadges) {
        state._shownBadges.add(id);
        const badge = ALL_BADGES.find((b) => b.id === id);
        if (badge) {
          setTimeout(() => showBadgeToast(badge), 300);
        }
      }
      saveStats();
      updateBadges();
    }
  }
}

// --------------------------------------------
// 12. NAVIGATION
// --------------------------------------------

function navigateTo(section) {
  document.querySelectorAll(".section-panel").forEach((el) => el.classList.remove("active"));
  const target = document.getElementById("section-" + section);
  if (target) target.classList.add("active");
  document.querySelectorAll(".nav-tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.section === section);
  });
  if (section === "dashboard") {
    updateDashboard();
    updateBadges();
    updateWeakTopics();
  }
  if (section === "shop") updateShopUI();
  if (section === "revision") loadRevisionList();
  if (section === "leaderboard") renderLeaderboard();
}

// --------------------------------------------
// 13. INIT
// --------------------------------------------

function init() {
  // Auth state from firebase.js is already set up

  // Login handlers
  document.getElementById("loginBtn").addEventListener("click", async function () {
    const btn = this, loader = document.getElementById("loginLoader");
    btn.style.display = "none";
    loader.style.display = "flex";
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    } catch (error) {
      showToast("Login Failed", error.message || "Please try again.", "fa-exclamation-circle", "loss");
      btn.style.display = "flex";
      loader.style.display = "none";
    }
  });

  document.getElementById("skipLoginBtn").addEventListener("click", function () {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      localStorage.setItem("guest_id", guestId);
    }
    state.isGuest = true;
    state.guestId = guestId;
    state.statsLoaded = true;
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
        for (const id of state.stats.earnedBadges || []) state._shownBadges.add(id);
        state.stats.javedaClicks = state.stats.javedaClicks || 0;
        state.stats.dailyStreak = state.stats.dailyStreak || 0;
        state.stats.lastActivityDate = state.stats.lastActivityDate || null;
        state.stats.sessionQuestions = state.stats.sessionQuestions || 0;
        state.stats.nightQuestions = state.stats.nightQuestions || 0;
        state.stats.earlyQuestions = state.stats.earlyQuestions || 0;
      }
    } catch (e) { }
    checkHeartRefill();
    updateHeaderStats();
    updateDashboard();
    updateBadges();
    updateWeakTopics();
    updateQuizProgress();
    updateShopUI();
    updateHintButton();
    setupLeaderboardListener();
    loadRevisionList();
    generateNextQuestionSet();
    const avatar = document.getElementById("userAvatar");
    const nameDisplay = document.getElementById("userNameDisplay");
    if (avatar) avatar.src = "https://ui-avatars.com/api/?name=Guest&background=5b4bd5&color=fff&size=36";
    if (nameDisplay) nameDisplay.textContent = "Guest";
    showToast("Guest Mode", "Your progress is saved locally.", "fa-user", "gain");
  });

  // User dropdown
  const userInfo = document.getElementById("userInfo");
  if (userInfo) {
    userInfo.addEventListener("click", function (e) {
      e.stopPropagation();
      const dropdown = document.getElementById("userDropdown");
      if (dropdown) dropdown.classList.toggle("show");
    });
  }
  document.addEventListener("click", function () {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) dropdown.classList.remove("show");
  });

  document.getElementById("logoutBtn").addEventListener("click", async function () {
    try {
      await auth.signOut();
      const dropdown = document.getElementById("userDropdown");
      if (dropdown) dropdown.classList.remove("show");
      state.isGuest = false;
      localStorage.removeItem("guest_id");
      showToast("Signed Out", "You have been signed out.", "fa-sign-out-alt", "gain");
    } catch (e) {
      console.error("Logout error:", e);
    }
  });

  // Learn Javeda
  document.getElementById("learnJavedaBtn").addEventListener("click", function (e) {
    const s = state.stats;
    s.javedaClicks = (s.javedaClicks || 0) + 1;
    const earnedIds = checkBadges(s);
    const prevBadges = new Set(s.earnedBadges || []);
    const newBadges = earnedIds.filter((id) => !prevBadges.has(id));
    if (newBadges.length > 0) {
      s.earnedBadges = [...prevBadges, ...newBadges];
      for (const id of newBadges) {
        const badge = ALL_BADGES.find((b) => b.id === id);
        if (badge && !state._shownBadges.has(id)) {
          state._shownBadges.add(id);
          setTimeout(() => showBadgeToast(badge), 300);
        }
      }
      updateBadges();
      saveStats();
    }
  });

  // Navigation tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      navigateTo(this.dataset.section);
    });
  });

  // Shop items
  document.querySelectorAll(".shop-item .item-buy").forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.dataset.type;
      if (type === "hint") {
        const hints = parseInt(this.dataset.hints);
        const price = parseInt(this.dataset.price);
        const rubies = parseInt(this.dataset.rubies) || 0;
        buyHint(hints, price, rubies);
      } else if (type === "buycoins") {
        const coins = parseInt(this.dataset.coins);
        const rubies = parseInt(this.dataset.rubies);
        buyCoins(coins, rubies);
      } else if (type === "booster") {
        const booster = this.dataset.booster;
        const priceCoins = parseInt(this.dataset.priceCoins) || 0;
        const priceRubies = parseInt(this.dataset.priceRubies) || 0;
        let duration = 0;
        if (booster === "point") duration = 600;
        else if (booster === "coin") duration = 300;
        else if (booster === "streak") duration = 0;
        activateBooster(booster, duration, priceCoins, priceRubies);
      }
    });
  });

  // Revision mode button (from revision tab)
  document.getElementById("revisionModeBtn").addEventListener("click", async function () {
    const count = await getRevisionCount();
    if (count === 0) {
      showToast("No Revision", "No wrong answers to revise.", "fa-info-circle", "gain");
      return;
    }
    if (!state.revisionMode) {
      document.getElementById("revisionToggle").click();
    } else {
      await loadRevisionQueue();
      if (state.revisionQueue.length === 0) {
        state.revisionMode = false;
        const revToggle = document.getElementById("revisionToggle");
        if (revToggle) {
          revToggle.classList.remove("active");
          const dot = revToggle.querySelector(".toggle-dot");
          if (dot) dot.style.background = "var(--text-muted)";
        }
        showToast("No Revision", "No revision questions available.", "fa-info-circle", "gain");
      } else {
        showToast("Revision Reloaded", `${state.revisionQueue.length} questions to revise.`, "fa-rotate-left", "gain");
      }
      if (state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
      generateNextQuestionSet();
    }
    navigateTo("quiz");
  });

  // Refresh revision
  document.getElementById("refreshRevisionBtn").addEventListener("click", function () {
    loadRevisionList();
    updateRevisionBadges();
    showToast("Refreshed", "Revision list updated.", "fa-sync", "gain");
  });

  // Leaderboard filters
  document.querySelectorAll(".lb-filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".lb-filter-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      leaderboardSortKey = this.dataset.lb;
      renderLeaderboard();
    });
  });

  // Setup quiz-specific event listeners (from quiz.js)
  setupQuizEventListeners();

  // Periodic checks
  setInterval(() => {
    if (state.stats.hearts < state.stats.maxHearts && state.timerMode && state.difficulty !== "easy") {
      checkHeartRefill();
    }
    checkBoosters();
    updateHeartsDisplay();
    updateBoosterStatus();
    if (state.stats.hearts <= 0 && state.stats.heartsRefillPending && state.timerMode && state.difficulty !== "easy") {
      updateHeartCountdownDisplay();
    }
  }, 60000);

  if (state.stats.hearts <= 0 && state.stats.heartsRefillPending && state.timerMode && state.difficulty !== "easy") {
    startHeartCountdown();
  }

  if (state.smartMode) {
    const smartToggle = document.getElementById("smartToggle");
    if (smartToggle) {
      smartToggle.classList.add("active");
      const dot = smartToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--accent-1)";
    }
    SMART_TRACKER.isSmartMode = true;
    SMART_TRACKER.baseMode = state.difficulty;
    SMART_TRACKER.smartDifficulty = state.difficulty;
    const indicator = document.getElementById("smartLevelIndicator");
    if (indicator) indicator.style.display = "inline-block";
    document.querySelectorAll(".diff-btn").forEach((b) => b.classList.add("diff-toggle-disabled"));
    updateSmartBadge(state.difficulty);
  }

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

  if (state.timerMode && state.difficulty !== "easy") checkHeartRefill();

  updateDiffModeLabel(state.difficulty);
  updateModeToggles();
  updateHeartsDisplay();
  updateBoosterStatus();

  console.log("📘 Version : 6.0.0 - Split into quiz.js + script.js (fixed duplicate declarations)");
  console.log("✅ Developed By - Faizul Islam Riyad");
}

// DOM ready — start the app
document.addEventListener("DOMContentLoaded", init);