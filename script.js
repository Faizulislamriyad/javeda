// ================================================================
// 1. HELPERS (যেগুলো Firebase নির্ভর নয়)
// ================================================================

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
        if (boosters && boosters.pointActive) {
          result.points = Math.floor(result.points * 2);
        }
        if (boosters && boosters.coinActive) {
          result.coins = Math.floor(result.coins * 1.5);
        }
      }
      return result;
    }
    const fallback = timerRules["medium"]["5"];
    let result = correct
      ? {
          points: fallback.points,
          xp: fallback.xp,
          coins: fallback.coins,
          rubies: fallback.rubies,
        }
      : {
          points: -Math.floor(fallback.points * 0.5),
          xp: 0,
          coins: 0,
          rubies: 0,
        };
    if (correct) {
      if (boosters && boosters.pointActive) {
        result.points = Math.floor(result.points * 2);
      }
      if (boosters && boosters.coinActive) {
        result.coins = Math.floor(result.coins * 1.5);
      }
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
    if (boosters && boosters.pointActive) {
      result.points = Math.floor(result.points * 2);
    }
    if (boosters && boosters.coinActive) {
      result.coins = Math.floor(result.coins * 1.5);
    }
  }
  return result;
}

const BENGALI_PERSON_NAMES = [
  "রহিম",
  "করিম",
  "আলম",
  "রিয়াদ",
  "সুমন",
  "হাসান",
  "রনি",
  "তাজিম",
  "ফাহিম",
  "লিমন",
  "জসিম",
  "রাফি",
  "শাওন",
  "নাঈম",
  "রাসেল",
  "সজিব",
  "আরিফ",
  "তুহিন",
  "শুভ",
  "নাবিল",
];

function getRandomName() {
  return pickRandom(BENGALI_PERSON_NAMES);
}

// ================================================================
// 2. MASTER ACCOUNT CLASSIFICATION SYSTEM
// ================================================================

const ACCOUNT_CLASSIFICATIONS = {
  Cash: {
    category: "asset",
    bengali: "নগদান",
    rule: "increase=debit,decrease=credit",
  },
  Bank: {
    category: "asset",
    bengali: "ব্যাংক",
    rule: "increase=debit,decrease=credit",
  },
  "Accounts Receivable": {
    category: "asset",
    bengali: "দেনাদার",
    rule: "increase=debit,decrease=credit",
  },
  Inventory: {
    category: "asset",
    bengali: "মাল",
    rule: "increase=debit,decrease=credit",
  },
  Furniture: {
    category: "asset",
    bengali: "আসবাবপত্র",
    rule: "increase=debit,decrease=credit",
  },
  Equipment: {
    category: "asset",
    bengali: "যন্ত্রপাতি",
    rule: "increase=debit,decrease=credit",
  },
  Computer: {
    category: "asset",
    bengali: "কম্পিউটার",
    rule: "increase=debit,decrease=credit",
  },
  "Office Supplies": {
    category: "asset",
    bengali: "অফিস সরঞ্জাম",
    rule: "increase=debit,decrease=credit",
  },
  "Prepaid Rent": {
    category: "asset",
    bengali: "অগ্রিম ভাড়া",
    rule: "increase=debit,decrease=credit",
  },
  "Prepaid Insurance": {
    category: "asset",
    bengali: "অগ্রিম বিমা খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Prepaid Expense": {
    category: "asset",
    bengali: "অগ্রিম খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Accumulated Depreciation": {
    category: "asset",
    bengali: "সঞ্চিত অবচয়",
    rule: "increase=credit,decrease=debit",
  },
  Building: {
    category: "asset",
    bengali: "ভবন",
    rule: "increase=debit,decrease=credit",
  },
  Land: {
    category: "asset",
    bengali: "জমি",
    rule: "increase=debit,decrease=credit",
  },
  Creditors: {
    category: "liability",
    bengali: "পাওনাদার",
    rule: "increase=credit,decrease=debit",
  },
  "Bank Loan": {
    category: "liability",
    bengali: "ব্যাংক ঋণ",
    rule: "increase=credit,decrease=debit",
  },
  "Salary Payable": {
    category: "liability",
    bengali: "বকেয়া বেতন",
    rule: "increase=credit,decrease=debit",
  },
  "Rent Payable": {
    category: "liability",
    bengali: "বকেয়া ভাড়া",
    rule: "increase=credit,decrease=debit",
  },
  "Interest Payable": {
    category: "liability",
    bengali: "প্রদেয় সুদ",
    rule: "increase=credit,decrease=debit",
  },
  Loan: {
    category: "liability",
    bengali: "ঋণ",
    rule: "increase=credit,decrease=debit",
  },
  Debentures: {
    category: "liability",
    bengali: "ঋণপত্র",
    rule: "increase=credit,decrease=debit",
  },
  Capital: {
    category: "capital",
    bengali: "মূলধন",
    rule: "increase=credit,decrease=debit",
  },
  Drawings: {
    category: "drawing",
    bengali: "উত্তোলন",
    rule: "increase=debit,decrease=credit",
  },
  "Sales Revenue": {
    category: "revenue",
    bengali: "বিক্রয়",
    rule: "increase=credit,decrease=debit",
  },
  "Service Revenue": {
    category: "revenue",
    bengali: "সেবা আয়",
    rule: "increase=credit,decrease=debit",
  },
  "Commission Revenue": {
    category: "revenue",
    bengali: "কমিশন আয়",
    rule: "increase=credit,decrease=debit",
  },
  "Rent Revenue": {
    category: "revenue",
    bengali: "ভাড়া আয়",
    rule: "increase=credit,decrease=debit",
  },
  "Interest Revenue": {
    category: "revenue",
    bengali: "সুদ প্রাপ্তি",
    rule: "increase=credit,decrease=debit",
  },
  "Discount Received": {
    category: "revenue",
    bengali: "বাট্টা পাওয়া",
    rule: "increase=credit,decrease=debit",
  },
  "Accrued Revenue": {
    category: "revenue",
    bengali: "অর্জিত আয়",
    rule: "increase=credit,decrease=debit",
  },
  Salary: {
    category: "expense",
    bengali: "বেতন",
    rule: "increase=debit,decrease=credit",
  },
  Rent: {
    category: "expense",
    bengali: "ভাড়া",
    rule: "increase=debit,decrease=credit",
  },
  Advertisement: {
    category: "expense",
    bengali: "বিজ্ঞাপন খরচ",
    rule: "increase=debit,decrease=credit",
  },
  Insurance: {
    category: "expense",
    bengali: "বীমা খরচ",
    rule: "increase=debit,decrease=credit",
  },
  Transport: {
    category: "expense",
    bengali: "পরিবহন খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Office Expenses": {
    category: "expense",
    bengali: "অফিস খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Electricity Bill": {
    category: "expense",
    bengali: "বিদ্যুৎ বিল",
    rule: "increase=debit,decrease=credit",
  },
  "Depreciation Expense": {
    category: "expense",
    bengali: "অবচয় খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Bad Debts": {
    category: "expense",
    bengali: "কুঋণ",
    rule: "increase=debit,decrease=credit",
  },
  "Bank Charges": {
    category: "expense",
    bengali: "ব্যাংক চার্জ",
    rule: "increase=debit,decrease=credit",
  },
  "Interest Expense": {
    category: "expense",
    bengali: "সুদ খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Income Tax": {
    category: "expense",
    bengali: "আয়কর",
    rule: "increase=debit,decrease=credit",
  },
  Donation: {
    category: "expense",
    bengali: "দান খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Commission Expense": {
    category: "expense",
    bengali: "কমিশন খরচ",
    rule: "increase=debit,decrease=credit",
  },
  Repairs: {
    category: "expense",
    bengali: "মেরামত খরচ",
    rule: "increase=debit,decrease=credit",
  },
  "Discount Allowed": {
    category: "expense",
    bengali: "বাট্টা প্রদান",
    rule: "increase=debit,decrease=credit",
  },
};

function getAccountInfo(accountName) {
  return ACCOUNT_CLASSIFICATIONS[accountName] || null;
}

function getBengaliName(accountName) {
  const info = getAccountInfo(accountName);
  return info ? info.bengali : accountName;
}

function getAccountCategory(accountName) {
  const info = getAccountInfo(accountName);
  return info ? info.category : null;
}

const ACCOUNT_RULES = {
  asset: { increase: "debit", decrease: "credit", label: "Asset" },
  liability: { increase: "credit", decrease: "debit", label: "Liability" },
  capital: { increase: "credit", decrease: "debit", label: "Capital" },
  revenue: { increase: "credit", decrease: "debit", label: "Revenue" },
  expense: { increase: "debit", decrease: "credit", label: "Expense" },
  drawing: { increase: "debit", decrease: "credit", label: "Drawing" },
};

const BENGALI_NAMES = {};
for (const [key, val] of Object.entries(ACCOUNT_CLASSIFICATIONS)) {
  BENGALI_NAMES[key] = val.bengali;
}
BENGALI_NAMES["Sales"] = "বিক্রয়";
BENGALI_NAMES["Purchases"] = "ক্রয়";
BENGALI_NAMES["Debtor"] = "দেনাদার";
BENGALI_NAMES["Creditor"] = "পাওনাদার";

// ================================================================
// 3. TEMPLATE DEFINITIONS
// ================================================================

const TEMPLATE_DEFINITIONS = {
  asset_purchase: {
    category: "asset",
    difficulty: "easy",
    patterns: ["নগদে {asset} ক্রয় করা হয়েছে", "{asset} নগদে ক্রয় করা হয়েছে"],
    assetPool: ["Computer", "Mobile", "Book", "Furniture", "Table", "Chair"],
    journal: [
      { account: "{asset}", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: false,
    amountRange: null,
  },
  expense_pay: {
    category: "expense",
    difficulty: "easy",
    patterns: ["নগদে {expense} পরিশোধ করা হয়েছে", "{expense} নগদে পরিশোধ"],
    expensePool: [
      "Electricity Bill",
      "Rent",
      "Transport",
      "Salary",
      "Insurance",
    ],
    journal: [
      { account: "{expense}", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: false,
    amountRange: null,
  },
  capital_invest: {
    category: "capital",
    difficulty: "easy",
    patterns: ["মালিক নগদ বিনিয়োগ করেছেন", "মালিক ব্যবসায়ে নগদ বিনিয়োগ করেছেন"],
    journal: [
      { account: "Cash", side: "debit" },
      { account: "Capital", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: false,
    amountRange: null,
  },
  revenue_sale: {
    category: "revenue",
    difficulty: "easy",
    patterns: ["নগদে {item} বিক্রয় করা হয়েছে", "{item} নগদে বিক্রয়"],
    itemPool: ["পণ্য", "মাল", "সেবা", "Book", "Pen"],
    journal: [
      { account: "Cash", side: "debit" },
      { account: "Sales Revenue", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: false,
    amountRange: null,
  },
  liability_pay: {
    category: "liability",
    difficulty: "easy",
    patterns: ["{liability} পরিশোধ করা হয়েছে", "{liability} নগদে পরিশোধ"],
    liabilityPool: ["Creditors", "Rent Payable", "Salary Payable"],
    journal: [
      { account: "{liability}", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: false,
    amountRange: null,
  },
  drawings: {
    category: "drawing",
    difficulty: "easy",
    patterns: [
      "মালিক নগদ উত্তোলন করেছেন",
      "মালিক ব্যক্তিগত প্রয়োজনে নগদ উত্তোলন",
    ],
    journal: [
      { account: "Drawings", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: false,
    amountRange: null,
  },
  medium_asset_purchase: {
    category: "asset",
    difficulty: "medium",
    patterns: [
      "নগদে {amount} টাকায় {asset} ক্রয় করা হয়েছে",
      "{amount} টাকায় {asset} নগদে ক্রয়",
    ],
    assetPool: [
      "Computer",
      "Mobile",
      "Furniture",
      "Equipment",
      "Laptop",
      "Table",
      "Chair",
    ],
    journal: [
      { account: "{asset}", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [3000, 80000],
  },
  medium_expense_pay: {
    category: "expense",
    difficulty: "medium",
    patterns: [
      "নগদে {expense} বাবদ {amount} টাকা পরিশোধ",
      "{expense} বাবদ {amount} টাকা নগদে প্রদান",
    ],
    expensePool: [
      "Rent",
      "Transport",
      "Advertisement",
      "Salary",
      "Insurance",
      "Repairs",
      "Internet Bill",
    ],
    journal: [
      { account: "{expense}", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [1000, 50000],
  },
  medium_revenue_sale: {
    category: "revenue",
    difficulty: "medium",
    patterns: [
      "নগদে {amount} টাকায় {item} বিক্রয়",
      "{amount} টাকায় {item} নগদে বিক্রয়",
    ],
    itemPool: [
      "পণ্য",
      "মাল",
      "সেবা",
      "Mobile",
      "Furniture",
      "Computer",
      "Book",
      "Table",
      "Chair",
    ],
    journal: [
      { account: "Cash", side: "debit" },
      { account: "Sales Revenue", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [3000, 90000],
  },
  medium_bank_deposit: {
    category: "asset",
    difficulty: "medium",
    patterns: [
      "ব্যাংকে {amount} টাকা জমা দেওয়া হয়েছে",
      "{amount} টাকা ব্যাংকে জমা",
    ],
    journal: [
      { account: "Bank", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [5000, 50000],
  },
  medium_bank_withdrawal: {
    category: "asset",
    difficulty: "medium",
    patterns: [
      "ব্যাংক থেকে {amount} টাকা উত্তোলন",
      "{amount} টাকা ব্যাংক থেকে উত্তোলন",
    ],
    journal: [
      { account: "Cash", side: "debit" },
      { account: "Bank", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [3000, 40000],
  },
  medium_credit_sale: {
    category: "revenue",
    difficulty: "medium",
    patterns: [
      "{name} এর নিকট {amount} টাকার {item} বিক্রয়",
      "{amount} টাকার {item} {name} এর নিকট বিক্রয়",
    ],
    itemPool: [
      "পণ্য",
      "Mobile",
      "Computer",
      "Book",
      "Furniture",
      "TV",
      "Table",
    ],
    journal: [
      { account: "Accounts Receivable", side: "debit" },
      { account: "Sales Revenue", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [10000, 90000],
    useName: true,
  },
  medium_credit_purchase: {
    category: "liability",
    difficulty: "medium",
    patterns: [
      "{name} এর নিকট হতে {amount} টাকার {item} ক্রয়",
      "{name} থেকে {amount} টাকায় {item} কেনা",
    ],
    itemPool: [
      "মাল",
      "পণ্য",
      "পণ্যদ্রব্য",
      "Equipment",
      "Office Supplies",
      "Book",
      "Mobile",
    ],
    journal: [
      { account: "Inventory", side: "debit" },
      { account: "Creditors", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [10000, 100000],
    useName: true,
  },
  medium_drawing: {
    category: "drawing",
    difficulty: "medium",
    patterns: ["মালিক {amount} টাকা উত্তোলন করেছেন", "{amount} টাকা উত্তোলন"],
    journal: [
      { account: "Drawings", side: "debit" },
      { account: "Cash", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [3000, 30000],
  },
  medium_capital_invest: {
    category: "capital",
    difficulty: "medium",
    patterns: [
      "মালিক {amount} টাকা নগদ বিনিয়োগ করেছেন",
      "{amount} টাকা নগদ বিনিয়োগ",
    ],
    journal: [
      { account: "Cash", side: "debit" },
      { account: "Capital", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [10000, 100000],
  },
  depreciation: {
    category: "expense",
    difficulty: "hard",
    patterns: [
      "{asset} এর উপর {amount} টাকা অবচয় ধার্য",
      "{asset} এর অবচয় {amount} টাকা ধার্য",
    ],
    assetPool: ["Table", "Equipment", "Computer", "Building", "Vehicle"],
    journal: [
      { account: "Depreciation Expense", side: "debit" },
      { account: "Accumulated Depreciation", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [2000, 30000],
  },
  bad_debts: {
    category: "expense",
    difficulty: "hard",
    patterns: [
      "{name} এর নিকট {amount} টাকা অনাদায়ী দেনা ধার্য",
      "{name} এর কাছ থেকে {amount} টাকা পাওয়া যাবে না",
    ],
    journal: [
      { account: "Bad Debts", side: "debit" },
      { account: "Accounts Receivable", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [1000, 10000],
    useName: true,
  },
  prepaid_rent: {
    category: "asset",
    difficulty: "hard",
    patterns: [
      "অগ্রিম ভাড়া বাবদ {amount} টাকা সমন্বয়",
      "{amount} টাকা অগ্রিম ভাড়ার সমন্বয়",
    ],
    journal: [
      { account: "Rent", side: "debit" },
      { account: "Prepaid Rent", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [5000, 40000],
  },
  accrued_revenue: {
    category: "revenue",
    difficulty: "hard",
    patterns: [
      "অর্জিত আয় বাবদ {amount} টাকা সমন্বয়",
      "{amount} টাকা অর্জিত কিন্তু অপ্রাপ্ত আয়",
    ],
    journal: [
      { account: "Accounts Receivable", side: "debit" },
      { account: "Accrued Revenue", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [10000, 70000],
  },
  loan_received: {
    category: "liability",
    difficulty: "hard",
    patterns: [
      "{name} এর কাছ থেকে {amount} টাকা ঋণ গ্রহণ",
      "{name} থেকে {amount} টাকা ঋণ নেওয়া",
    ],
    journal: [
      { account: "Cash", side: "debit" },
      { account: "Loan", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [10000, 100000],
    useName: true,
  },
  salary_payable_adj: {
    category: "liability",
    difficulty: "hard",
    patterns: [
      "বকেয়া বেতন {amount} টাকা সমন্বয়",
      "{amount} টাকা বকেয়া বেতন হিসাবে ধার্য",
    ],
    journal: [
      { account: "Salary", side: "debit" },
      { account: "Salary Payable", side: "credit" },
    ],
    primaryAccountIndex: 1,
    hasAmount: true,
    amountRange: [8000, 50000],
  },
  interest_expense_adj: {
    category: "expense",
    difficulty: "hard",
    patterns: [
      "ব্যাংক ঋণের {amount} টাকা সুদ বকেয়া সমন্বয়",
      "{amount} টাকা সুদ খরচ বকেয়া ধার্য",
    ],
    journal: [
      { account: "Interest Expense", side: "debit" },
      { account: "Interest Payable", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [2000, 15000],
  },
  drawings_goods_adj: {
    category: "drawing",
    difficulty: "hard",
    patterns: [
      "মালিক {amount} টাকার পণ্য উত্তোলন করেছেন",
      "{amount} টাকা মূল্যের পণ্য উত্তোলন",
    ],
    journal: [
      { account: "Drawings", side: "debit" },
      { account: "Inventory", side: "credit" },
    ],
    primaryAccountIndex: 0,
    hasAmount: true,
    amountRange: [5000, 25000],
  },
};

// ================================================================
// 4. DIFFICULTY FILTERING & DIVERSITY
// ================================================================

function getAvailableTemplates(mode) {
  const allTemplates = Object.entries(TEMPLATE_DEFINITIONS);
  let available = [];
  for (const [key, def] of allTemplates) {
    if (def.difficulty !== mode) continue;
    available.push({
      key,
      def,
      hasAmount: mode !== "easy" ? def.hasAmount || false : false,
      amountRange: mode !== "easy" ? def.amountRange || null : null,
    });
  }
  return available;
}

let recentCategories = [];
const MAX_RECENT_CATEGORIES = 15;

function getCategoryWeight(category, smartBias) {
  const baseWeight = smartBias && smartBias[category] ? smartBias[category] : 1;
  const recentCount = recentCategories.filter((c) => c === category).length;
  let penalty = 1;
  if (recentCount >= 3) penalty = 0.2;
  else if (recentCount >= 2) penalty = 0.4;
  else if (recentCount >= 1) penalty = 0.7;
  if (
    recentCategories.length > 0 &&
    recentCategories[recentCategories.length - 1] === category
  ) {
    penalty *= 0.3;
  }
  return Math.max(0.1, baseWeight * penalty);
}

function pickTemplateWithDiversity(mode, smartBias) {
  const available = getAvailableTemplates(mode);
  if (available.length === 0) {
    const fallback = Object.entries(TEMPLATE_DEFINITIONS).find(
      ([k, d]) => d.difficulty === mode,
    );
    if (fallback) {
      const [key, def] = fallback;
      return {
        key,
        def,
        hasAmount: mode !== "easy" ? def.hasAmount || false : false,
        amountRange: mode !== "easy" ? def.amountRange || null : null,
      };
    }
    const assetDef = TEMPLATE_DEFINITIONS.asset_purchase;
    return {
      key: "asset_purchase",
      def: assetDef,
      hasAmount: false,
      amountRange: null,
    };
  }
  const weighted = available.map((item) => {
    const category = item.def.category;
    const weight = getCategoryWeight(category, smartBias);
    return { ...item, weight };
  });
  weighted.sort((a, b) => b.weight - a.weight);
  const topCandidates = weighted.slice(0, Math.min(5, weighted.length));
  const selected = pickRandom(topCandidates);
  const category = selected.def.category;
  recentCategories.push(category);
  if (recentCategories.length > MAX_RECENT_CATEGORIES) recentCategories.shift();
  return {
    key: selected.key,
    def: selected.def,
    hasAmount: selected.hasAmount,
    amountRange: selected.amountRange,
  };
}

// ================================================================
// 5. TRANSACTION GENERATOR
// ================================================================

function generateTransactionFromTemplate(templateInfo, mode) {
  const def = templateInfo.def;
  const hasAmount = templateInfo.hasAmount && mode !== "easy";
  const amountRange = templateInfo.amountRange;
  let amount = 0;
  if (hasAmount && amountRange) amount = getAmount(amountRange);
  const pattern = pickRandom(def.patterns);
  let asset = "",
    expense = "",
    liability = "",
    item = "";
  let name = "";
  const useName = def.useName || false;
  if (useName) name = getRandomName();
  if (def.assetPool) asset = pickRandom(def.assetPool);
  if (def.expensePool) expense = pickRandom(def.expensePool);
  if (def.liabilityPool) liability = pickRandom(def.liabilityPool);
  if (def.itemPool) item = pickRandom(def.itemPool);
  let desc = pattern;
  if (asset) desc = desc.replace(/{asset}/g, getBengaliName(asset) || asset);
  if (expense)
    desc = desc.replace(/{expense}/g, getBengaliName(expense) || expense);
  if (liability)
    desc = desc.replace(/{liability}/g, getBengaliName(liability) || liability);
  if (item) desc = desc.replace(/{item}/g, getBengaliName(item) || item);
  if (name) desc = desc.replace(/{name}/g, name);
  if (hasAmount && amount)
    desc = desc.replace(/{amount}/g, amount.toLocaleString());
  else {
    desc = desc.replace(/\s*{amount}\s*/g, " ");
    desc = desc.replace(/\s+/g, " ");
  }
  const journal = def.journal.map((entry) => {
    let acc = entry.account;
    if (acc === "{asset}" && asset) acc = asset;
    else if (acc === "{expense}" && expense) acc = expense;
    else if (acc === "{liability}" && liability) acc = liability;
    else if (acc === "{item}" && item) acc = item;
    const info = getAccountInfo(acc);
    return {
      account: acc,
      side: entry.side,
      amount: hasAmount ? amount : 0,
      type: info ? info.category : "asset",
    };
  });
  const primaryIdx =
    def.primaryAccountIndex !== undefined ? def.primaryAccountIndex : 0;
  const primaryEntry = journal[primaryIdx] || journal[0];
  const primaryAccount = primaryEntry.account;
  const primaryInfo = getAccountInfo(primaryAccount);
  const primaryType = primaryInfo ? primaryInfo.category : def.category;
  desc = desc.replace(/\s+/g, " ").trim();
  return {
    templateId: templateInfo.key,
    description: desc,
    category: def.category,
    amount: amount,
    hasAmount: hasAmount,
    journal: journal,
    primaryAccount: primaryAccount,
    primaryType: primaryType,
    primarySide: primaryEntry.side,
    personName: name || null,
  };
}

// ================================================================
// 6. SMART TRACKER
// ================================================================

const SMART_TRACKER = {
  categoryCounts: {},
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  baseMode: "easy",
  smartDifficulty: "easy",
  isSmartMode: false,
  lastModeChange: 0,
  update(category, isCorrect, mode) {
    if (!this.categoryCounts[category])
      this.categoryCounts[category] = { total: 0, correct: 0 };
    this.categoryCounts[category].total++;
    if (isCorrect) this.categoryCounts[category].correct++;
    if (isCorrect) {
      this.consecutiveCorrect++;
      this.consecutiveWrong = 0;
    } else {
      this.consecutiveWrong++;
      this.consecutiveCorrect = 0;
    }
    this.baseMode = mode;
    if (this.isSmartMode) this._adjustDifficulty();
  },
  _adjustDifficulty() {
    const modes = ["easy", "medium", "hard"];
    const currentIdx = modes.indexOf(this.smartDifficulty);
    if (currentIdx === -1) return;
    let newMode = this.smartDifficulty;
    let changed = false;
    if (this.consecutiveCorrect >= 5) {
      const nextIdx = Math.min(currentIdx + 1, modes.length - 1);
      if (nextIdx !== currentIdx) {
        newMode = modes[nextIdx];
        this.consecutiveCorrect = 0;
        changed = true;
      }
    }
    if (this.consecutiveWrong >= 3) {
      const prevIdx = Math.max(currentIdx - 1, 0);
      if (prevIdx !== currentIdx) {
        newMode = modes[prevIdx];
        this.consecutiveWrong = 0;
        changed = true;
      }
    }
    if (changed && newMode !== this.smartDifficulty) {
      this.smartDifficulty = newMode;
      state.difficulty = newMode;
      updateDifficultyButtons(newMode);
      showModeChangeToast(newMode);
      updateSmartBadge(newMode);
      updateDiffModeLabel(newMode);
    }
    if (!this.smartDifficulty) this.smartDifficulty = this.baseMode;
  },
  getBiases() {
    const biases = {};
    const cats = [
      "asset",
      "liability",
      "capital",
      "revenue",
      "expense",
      "drawing",
    ];
    for (const cat of cats) {
      if (this.categoryCounts[cat] && this.categoryCounts[cat].total > 0) {
        const acc =
          this.categoryCounts[cat].correct / this.categoryCounts[cat].total;
        biases[cat] = Math.max(0.5, 1 - acc + 0.3);
      } else biases[cat] = 1;
    }
    const sum = Object.values(biases).reduce((a, b) => a + b, 0);
    for (const cat in biases) biases[cat] = (biases[cat] / sum) * 100;
    return biases;
  },
  getEffectiveMode() {
    if (!this.isSmartMode) return this.baseMode;
    return this.smartDifficulty;
  },
  reset() {
    this.categoryCounts = {};
    this.consecutiveCorrect = 0;
    this.consecutiveWrong = 0;
    this.smartDifficulty = this.baseMode;
  },
};

function updateDifficultyButtons(mode) {
  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.diff === mode) btn.classList.add("active");
  });
}

function updateSmartBadge(mode) {
  const badge = document.getElementById("smartDiffBadge");
  if (!badge) return;
  const modeNames = { easy: "Easy", medium: "Medium", hard: "Hard" };
  badge.textContent = modeNames[mode] || "Adaptive";
  badge.className = "smart-diff-indicator " + mode;
  badge.style.display = "inline-block";
}

function updateDiffModeLabel(mode) {
  const label = document.getElementById("diffModeText");
  if (!label) return;
  const modeInfo = {
    easy: "সরল লেনদেন",
    medium: "বাস্তব লেনদেন",
    hard: "উন্নত লেনদেন",
  };
  label.textContent = modeInfo[mode] || "সরল লেনদেন";
}

function showModeChangeToast(newMode) {
  const modeNames = { easy: "Easy", medium: "Medium", hard: "Hard" };
  const modeDesc = {
    easy: "সরল লেনদেন",
    medium: "বাস্তব লেনদেন",
    hard: "উন্নত লেনদেন",
  };
  showToast(
    `🔄 Smart Mode: ${modeNames[newMode]}`,
    `Level switched to ${modeNames[newMode]} — ${modeDesc[newMode]}`,
    "fa-arrow-right",
    "gain",
  );
}

// ================================================================
// 7. BADGES (TOTAL 100)
// ================================================================

const ALL_BADGES = [
  // === REPLACED 28 BADGES (NEW ONES) ===
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

  // === KEPT BADGES (72) ===
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

console.assert(ALL_BADGES.length === 100, "Badges count should be 100");

function checkBadges(stats) {
  const earned = [];
  const total = stats.correct + stats.wrong;
  const acc = total > 0 ? stats.correct / total : 0;
  const accPct = Math.round(acc * 100);
  const typeCounts = {
    asset: 0,
    liability: 0,
    capital: 0,
    revenue: 0,
    expense: 0,
    drawing: 0,
  };
  if (stats.quizHistory) {
    for (const h of stats.quizHistory) {
      if (h.userAnswer === h.correctAnswer) {
        if (typeCounts[h.type] !== undefined) typeCounts[h.type]++;
      }
    }
  }

  // Existing kept badges
  if (
    stats.correct >= 1 &&
    stats.quizHistory &&
    stats.quizHistory.some(
      (h) => h.correctAnswer === "debit" && h.userAnswer === "debit",
    )
  )
    earned.push("b3");
  if (
    stats.correct >= 1 &&
    stats.quizHistory &&
    stats.quizHistory.some(
      (h) => h.correctAnswer === "credit" && h.userAnswer === "credit",
    )
  )
    earned.push("b4");
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
  if (stats.correct >= 10 && stats.wrong === 0 && total >= 10)
    earned.push("b34");
  if (total >= 100) earned.push("b35");
  if (total >= 500) earned.push("b36");
  if (total >= 1000) earned.push("b37");
  if (stats.level >= 10) earned.push("b38");
  if (stats.correct >= 500) earned.push("b39");
  if (stats.correct >= 1000) earned.push("b40");
  if (accPct >= 95 && total >= 100) earned.push("b42");
  if (stats.wrong > 0 && stats.wrong / total < 0.1 && total >= 20)
    earned.push("b43");
  if (stats.focusCount && stats.focusCount >= 20) earned.push("b44");
  if (stats.smartModeCount && stats.smartModeCount >= 50) earned.push("b46");
  if (stats.correct >= 5000) earned.push("b50");

  // Timer badges
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 10)
    earned.push("b55");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 50)
    earned.push("b56");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 100)
    earned.push("b57");
  if (stats.timer5sCompleted && stats.timer5sCompleted >= 50)
    earned.push("b58");
  if (stats.timer10sCompleted && stats.timer10sCompleted >= 50)
    earned.push("b59");

  // Other kept badges
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
  if (stats.pointBoosterUsed && stats.pointBoosterUsed >= 10)
    earned.push("b81");
  if (stats.coinBoosterUsed && stats.coinBoosterUsed >= 10) earned.push("b82");
  if (stats.streakBoosterUsed && stats.streakBoosterUsed >= 10)
    earned.push("b83");
  if (stats.hearts === stats.maxHearts) earned.push("b85");
  if (accPct >= 80 && total >= 200 && stats.bestStreak >= 50)
    earned.push("b86");
  if (accPct >= 90 && total >= 500 && stats.bestStreak >= 100)
    earned.push("b87");
  if (total >= 1000 && stats.correct / total >= 0.7) earned.push("b88");
  if (stats.quizHistory && stats.quizHistory.length >= 100) earned.push("b93");
  if (stats.level >= 15 && accPct >= 75) earned.push("b94");
  if (stats.correct >= 1000 && accPct >= 80) earned.push("b95");
  if (stats.correct >= 2000) earned.push("b96");
  if (total >= 5000) earned.push("b97");
  if (stats.correct >= 5000) earned.push("b98");
  if (stats.coins >= 5000 && stats.rubies >= 200) earned.push("b99");

  // New badges
  if (stats.javedaClicks && stats.javedaClicks >= 1) earned.push("n5");
  if (stats.javedaClicks && stats.javedaClicks >= 5) earned.push("n6");
  if (stats.hints && stats.hints >= 100) earned.push("n7");
  if (stats.hints && stats.hints >= 500) earned.push("n8");
  if (stats.dailyStreak && stats.dailyStreak >= 7) earned.push("n9");
  if (stats.dailyStreak && stats.dailyStreak >= 30) earned.push("n10");
  if (stats.fastAnswers && stats.fastAnswers >= 100) earned.push("n11");
  if (stats.sessionQuestions && stats.sessionQuestions >= 50)
    earned.push("n12");
  if (stats.nightQuestions && stats.nightQuestions >= 20) earned.push("n13");
  if (stats.earlyQuestions && stats.earlyQuestions >= 20) earned.push("n14");
  if (stats.revisionCorrect && stats.revisionCorrect >= 50) earned.push("n15");
  if (stats.revisionCorrect && stats.revisionCorrect >= 200) earned.push("n16");
  if (
    stats.timerQuestionsCompleted &&
    stats.timerQuestionsCompleted >= 50 &&
    stats.heartsLost === 0
  )
    earned.push("n17");
  if (stats.timerQuestionsCompleted && stats.timerQuestionsCompleted >= 200)
    earned.push("n18");
  if (stats.smartModeCount && stats.smartModeCount >= 100) earned.push("n19");
  if (stats.smartModeCount && stats.smartModeCount >= 500) earned.push("n20");
  if (stats.coins >= 10000) earned.push("n21");
  if (stats.rubies >= 200) earned.push("n22");
  if (stats.streakBoosterUsed && stats.streakBoosterUsed >= 10)
    earned.push("n23");
  if (stats.pointBoosterUsed && stats.pointBoosterUsed >= 10)
    earned.push("n24");
  if (stats.coinBoosterUsed && stats.coinBoosterUsed >= 10) earned.push("n25");
  const allCategories = [
    "asset",
    "liability",
    "capital",
    "revenue",
    "expense",
    "drawing",
  ];
  let all50 = true;
  for (const cat of allCategories) {
    if ((typeCounts[cat] || 0) < 50) {
      all50 = false;
      break;
    }
  }
  if (all50) earned.push("n26");
  const totalBadges = (stats.earnedBadges || []).length;
  if (totalBadges >= 50) earned.push("n27");
  if (totalBadges >= 75) earned.push("n28");

  return [...new Set(earned)];
}

// ================================================================
// 8. STATE
// ================================================================

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
    totalQuestions: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    xp: 0,
    points: 0,
    coins: 0,
    rubies: 0,
    hints: 0,
    level: 1,
    accuracyHistory: [],
    weakRules: {},
    quizHistory: [],
    fastAnswers: 0,
    ruleBreakerCount: 0,
    focusCount: 0,
    smartModeCount: 0,
    earnedBadges: [],
    smartCategoryData: {},
    effectiveDifficulty: "easy",
    hearts: 5,
    maxHearts: 5,
    lastHeartRefill: Date.now(),
    timerWrongCount: 0,
    pointBoosterActive: false,
    pointBoosterExpiry: 0,
    coinBoosterActive: false,
    coinBoosterExpiry: 0,
    noStreakBreakRemaining: 0,
    topicStats: {
      asset: { total: 0, wrong: 0 },
      liability: { total: 0, wrong: 0 },
      capital: { total: 0, wrong: 0 },
      revenue: { total: 0, wrong: 0 },
      expense: { total: 0, wrong: 0 },
      drawing: { total: 0, wrong: 0 },
    },
    timerQuestionsCompleted: 0,
    timer5sCompleted: 0,
    timer10sCompleted: 0,
    revisionCorrect: 0,
    pointBoosterUsed: 0,
    coinBoosterUsed: 0,
    streakBoosterUsed: 0,
    heartsLost: 0,
    _heartRefillDone: false,
    javedaClicks: 0,
    dailyStreak: 0,
    lastActivityDate: null,
    sessionQuestions: 0,
    nightQuestions: 0,
    earlyQuestions: 0,
  },
  unsubUser: null,
  unsubLeaderboard: null,
  isGuest: false,
  guestId: null,
  questionStartTime: 0,
  hintUsedForQuestion: false,
  advancePending: false,
  statsLoaded: false,
  statsLoadAttempted: false,
  pendingSave: null,
  timerMode: false,
  timerSec: 5,
  timerInterval: null,
  timerRemaining: 5,
  timerActive: false,
  heartRefillInterval: null,
  _shownBadges: new Set(),
};

// ================================================================
// 9. UI HELPERS
// ================================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ================================================================
// 10. HEART SYSTEM
// ================================================================

function checkHeartRefill() {
  const s = state.stats;
  if (s._heartRefillDone) return;
  const now = Date.now();
  const refillInterval = 15 * 60 * 1000;
  const elapsed = now - s.lastHeartRefill;
  if (s.hearts >= s.maxHearts) {
    s.lastHeartRefill = now;
    s._heartRefillDone = true;
    return;
  }
  if (elapsed >= refillInterval) {
    const heartsToAdd = Math.min(
      s.maxHearts - s.hearts,
      Math.floor(elapsed / refillInterval),
    );
    if (heartsToAdd > 0) {
      s.hearts += heartsToAdd;
      s.lastHeartRefill = now - (elapsed % refillInterval);
      showHeartToast(s.hearts, false);
      updateHeartsDisplay();
      saveStats();
    }
  }
  s._heartRefillDone = true;
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
      if (i < s.hearts) {
        html += `<span class="heart">❤️</span>`;
      } else {
        html += `<span class="heart lost">🤍</span>`;
      }
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
  if (s.hearts <= 0) {
    state.timerMode = false;
    const toggle = document.getElementById("timerToggle");
    if (toggle) {
      toggle.classList.remove("active");
      const dot = toggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
    }
    document.getElementById("timerOptions").classList.remove("show");
    document.getElementById("timerBadge").style.display = "none";
    document.getElementById("heartsInline").classList.remove("show");
    stopTimer();
    showToast(
      "💔 No Hearts Left!",
      "Timer Mode disabled. Hearts will refill over time.",
      "fa-heart",
      "loss",
    );
    document.querySelectorAll(".diff-btn").forEach((b) => {
      b.classList.remove("diff-toggle-disabled");
      if (state.smartMode) b.classList.add("diff-toggle-disabled");
    });
    generateNextQuestionSet();
    return;
  }
  s.hearts = Math.max(0, s.hearts - 1);
  s.timerWrongCount = 0;
  s.heartsLost = (s.heartsLost || 0) + 1;
  s._heartRefillDone = false;
  updateHeartsDisplay();
  showHeartToast(s.hearts, true);
  saveStats();
  if (s.hearts <= 0) {
    state.timerMode = false;
    const toggle = document.getElementById("timerToggle");
    if (toggle) {
      toggle.classList.remove("active");
      const dot = toggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
    }
    document.getElementById("timerOptions").classList.remove("show");
    document.getElementById("timerBadge").style.display = "none";
    document.getElementById("heartsInline").classList.remove("show");
    stopTimer();
    showToast(
      "💔 No Hearts Left!",
      "Timer Mode disabled. Hearts will refill over time.",
      "fa-heart",
      "loss",
    );
    document.querySelectorAll(".diff-btn").forEach((b) => {
      b.classList.remove("diff-toggle-disabled");
      if (state.smartMode) b.classList.add("diff-toggle-disabled");
    });
    generateNextQuestionSet();
  }
}

// ================================================================
// 11. BOOSTER SYSTEM
// ================================================================

function checkBoosters() {
  const s = state.stats;
  const now = Date.now();
  if (s.pointBoosterActive && s.pointBoosterExpiry < now) {
    s.pointBoosterActive = false;
    s.pointBoosterExpiry = 0;
    showToast(
      "⏰ Point Booster Expired",
      "2× points boost is over.",
      "fa-clock",
      "gain",
    );
    updateBoosterStatus();
  }
  if (s.coinBoosterActive && s.coinBoosterExpiry < now) {
    s.coinBoosterActive = false;
    s.coinBoosterExpiry = 0;
    showToast(
      "⏰ Coin Booster Expired",
      "1.5× coins boost is over.",
      "fa-clock",
      "gain",
    );
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
    pointRemaining: s.pointBoosterActive
      ? Math.max(0, Math.ceil((s.pointBoosterExpiry - now) / 1000))
      : 0,
    coinRemaining: s.coinBoosterActive
      ? Math.max(0, Math.ceil((s.coinBoosterExpiry - now) / 1000))
      : 0,
    streakRemaining: s.noStreakBreakRemaining,
  };
}

function updateBoosterStatus() {
  const bar = document.getElementById("boosterStatusBar");
  if (!bar) return;
  const b = getBoosters();
  let html = "";
  if (b.pointActive) {
    html += `<span class="booster-badge active point">⚡ 2×P ${Math.floor(b.pointRemaining / 60)}m</span>`;
  }
  if (b.coinActive) {
    html += `<span class="booster-badge active coin">🪙 1.5×C ${Math.floor(b.coinRemaining / 60)}m</span>`;
  }
  if (b.streakActive) {
    html += `<span class="booster-badge active streak">🛡️ ${b.streakRemaining} left</span>`;
  }
  bar.innerHTML = html;

  const pointStatus = document.getElementById("boosterPointStatus");
  const coinStatus = document.getElementById("boosterCoinStatus");
  const streakStatus = document.getElementById("boosterStreakStatus");
  if (pointStatus) {
    pointStatus.innerHTML = b.pointActive
      ? `<span class="booster-active-badge" style="background:var(--accent-3);color:#1a1a2e;">⚡ Active ${Math.floor(b.pointRemaining / 60)}m</span>`
      : "";
  }
  if (coinStatus) {
    coinStatus.innerHTML = b.coinActive
      ? `<span class="booster-active-badge" style="background:#d4a017;color:#fff;">🪙 Active ${Math.floor(b.coinRemaining / 60)}m</span>`
      : "";
  }
  if (streakStatus) {
    streakStatus.innerHTML = b.streakActive
      ? `<span class="booster-active-badge" style="background:var(--accent-1);color:#fff;">🛡️ ${b.streakRemaining} left</span>`
      : "";
  }
}

function activateBooster(type, duration, costCoins, costRubies) {
  const s = state.stats;
  if (s.coins < costCoins || s.rubies < costRubies) {
    showToast(
      "Not Enough Resources",
      `Need ${costCoins}🪙 and ${costRubies}💎`,
      "fa-exclamation-circle",
      "loss",
    );
    return false;
  }
  s.coins -= costCoins;
  s.rubies -= costRubies;
  const now = Date.now();
  if (type === "point") {
    s.pointBoosterActive = true;
    s.pointBoosterExpiry = now + duration * 1000;
    s.pointBoosterUsed = (s.pointBoosterUsed || 0) + 1;
    showToast(
      "⚡ Point Booster Activated!",
      "2× points for 10 minutes.",
      "fa-rocket",
      "gain",
    );
  } else if (type === "coin") {
    s.coinBoosterActive = true;
    s.coinBoosterExpiry = now + duration * 1000;
    s.coinBoosterUsed = (s.coinBoosterUsed || 0) + 1;
    showToast(
      "🪙 Coin Booster Activated!",
      "1.5× coins for 5 minutes.",
      "fa-rocket",
      "gain",
    );
  } else if (type === "streak") {
    s.noStreakBreakRemaining = 10;
    s.streakBoosterUsed = (s.streakBoosterUsed || 0) + 1;
    showToast(
      "🛡️ No Streak Break Activated!",
      "Next 10 wrong answers won't break your streak.",
      "fa-rocket",
      "gain",
    );
  }
  updateHeaderStats();
  updateDashboard();
  updateShopUI();
  updateBoosterStatus();
  saveStats();
  return true;
}

// ================================================================
// 12. RENDER FUNCTIONS (UI updates)
// ================================================================

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
    if (auth.currentUser.photoURL && avatar)
      avatar.src = auth.currentUser.photoURL;
    if (nameDisplay)
      nameDisplay.textContent = auth.currentUser.displayName || "User";
  } else if (state.isGuest) {
    if (avatar)
      avatar.src =
        "https://ui-avatars.com/api/?name=Guest&background=5b4bd5&color=fff&size=36";
    if (nameDisplay) nameDisplay.textContent = "Guest";
  }
  const hintCount = document.getElementById("hintCountDisplay");
  if (hintCount) hintCount.textContent = s.hints || 0;
  updateHeartsDisplay();
  updateBoosterStatus();
  checkBoosters();
}

function updateQuizProgress() {
  const s = state.stats;
  setText("qCorr2", s.correct);
  setText("qWron2", s.wrong);
  const total = s.correct + s.wrong;
  const acc = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  setText("qAcc2", acc + "%");
  setText("qStreak2", s.streak);
  setText("qBestStreak2", s.bestStreak);
}

function updateHintButton() {
  const hintBtn = document.getElementById("hintBtn");
  if (!hintBtn) return;
  const hints = state.stats.hints || 0;
  const disabled = state.revisionMode || state.timerMode;
  if (hints > 0 && !disabled) {
    hintBtn.disabled = false;
    hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Use Hint <span class="hint-count">${hints}</span>`;
  } else {
    hintBtn.disabled = true;
    hintBtn.innerHTML = disabled
      ? `<i class="fas fa-lightbulb"></i> Not Available`
      : `<i class="fas fa-lightbulb"></i> No Hints`;
  }
  const hintCountDisplay = document.getElementById("hintCountDisplay");
  if (hintCountDisplay) hintCountDisplay.textContent = hints;
}

function renderQuestion() {
  const q = state.currentQuestion;
  const transactionDisplay = document.getElementById("transactionDisplay");
  const accountName = document.getElementById("accountName");
  if (!q) {
    if (transactionDisplay) transactionDisplay.textContent = "Loading...";
    if (accountName) accountName.textContent = "—";
    $$(".quiz-opt").forEach((b) => (b.disabled = true));
    const fb = document.getElementById("feedbackBox");
    if (fb) fb.classList.remove("show");
    const autoNext = document.getElementById("autoNextIndicator");
    if (autoNext) autoNext.classList.remove("show");
    const nextBtn = document.getElementById("nextBtnFallback");
    if (nextBtn) nextBtn.classList.remove("show");
    updateHintButton();
    return;
  }

  const trans = state.currentTransaction;
  let displayText = trans ? trans.description : "";
  if (transactionDisplay) transactionDisplay.innerHTML = `"${displayText}"`;

  const accountForQuestion = trans.primaryAccount || q.accountName;
  const bnName = getBengaliName(accountForQuestion) || accountForQuestion;
  if (accountName) accountName.textContent = bnName + " হিসাব";

  $$(".quiz-opt").forEach((b) => {
    b.disabled = false;
    b.className = "quiz-opt " + b.dataset.answer;
  });
  const fb = document.getElementById("feedbackBox");
  if (fb) fb.classList.remove("show");
  const autoNext = document.getElementById("autoNextIndicator");
  if (autoNext) autoNext.classList.remove("show");
  const nextBtn = document.getElementById("nextBtnFallback");
  if (nextBtn) nextBtn.classList.remove("show");
  state.answered = false;
  state.countdown = 5;
  state.questionStartTime = Date.now();
  state.hintUsedForQuestion = false;
  state.advancePending = false;

  if (!state.stats._heartRefillDone) {
    checkHeartRefill();
  }

  if (state.timerMode && state.difficulty !== "easy") {
    const timerDisplay = document.getElementById("timerDisplay");
    const timerCountdown = document.getElementById("timerCountdown");
    if (timerDisplay) {
      timerDisplay.classList.add("show");
      timerDisplay.classList.remove("warning");
    }
    if (timerCountdown) {
      timerCountdown.textContent = state.timerSec;
    }
    state.timerRemaining = state.timerSec;
    startTimer();
  } else {
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) timerDisplay.classList.remove("show");
    stopTimer();
  }

  updateHintButton();

  const indicator = document.getElementById("smartLevelIndicator");
  if (indicator) {
    if (state.smartMode) {
      indicator.style.display = "inline-block";
      const eff = SMART_TRACKER.getEffectiveMode();
      indicator.textContent = `Adaptive: ${eff.toUpperCase()}`;
      updateSmartBadge(eff);
    } else {
      indicator.style.display = "none";
      document.getElementById("smartDiffBadge").style.display = "none";
    }
  }

  updateDiffModeLabel(state.difficulty);
  updateModeToggles();

  const diffBtns = document.querySelectorAll(".diff-btn");
  diffBtns.forEach((btn) => {
    if (state.smartMode) {
      btn.classList.add("diff-toggle-disabled");
    } else {
      btn.classList.remove("diff-toggle-disabled");
    }
    if (state.timerMode && btn.dataset.diff === "easy") {
      btn.classList.add("diff-toggle-disabled");
    } else if (state.timerMode) {
      btn.classList.remove("diff-toggle-disabled");
    }
  });

  const timerBadge = document.getElementById("timerBadge");
  if (timerBadge) {
    if (state.timerMode && state.difficulty !== "easy") {
      timerBadge.style.display = "inline-block";
      timerBadge.textContent = `⏱ ${state.timerSec}s`;
      timerBadge.className = "timer-badge ruby";
    } else {
      timerBadge.style.display = "none";
    }
  }

  updateHeartsDisplay();
  updateQuizProgress();
  if (state.autoTimer) {
    clearInterval(state.autoTimer);
    state.autoTimer = null;
  }
}

function updateModeToggles() {
  const smartToggle = document.getElementById("smartToggle");
  const revToggle = document.getElementById("revisionToggle");
  const timerToggle = document.getElementById("timerToggle");
  const hintBtn = document.getElementById("hintBtn");

  if (state.smartMode) {
    revToggle.classList.add("disabled-mode");
    timerToggle.classList.add("disabled-mode");
    if (state.revisionMode) {
      state.revisionMode = false;
      revToggle.classList.remove("active");
      const dot = revToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
      state.revisionQueue = [];
      state.isRevisionQuestion = false;
      state.currentRevisionDocId = null;
    }
    if (state.timerMode) {
      state.timerMode = false;
      timerToggle.classList.remove("active");
      const dot = timerToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
      document.getElementById("timerOptions").classList.remove("show");
      document.getElementById("timerBadge").style.display = "none";
      document.getElementById("heartsInline").classList.remove("show");
      stopTimer();
      document
        .querySelectorAll(".diff-btn")
        .forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }
    smartToggle.classList.remove("disabled-mode");
    updateHintButton();
  } else {
    smartToggle.classList.remove("disabled-mode");
  }

  if (state.revisionMode) {
    smartToggle.classList.add("disabled-mode");
    timerToggle.classList.add("disabled-mode");
    if (state.smartMode) {
      state.smartMode = false;
      smartToggle.classList.remove("active");
      const dot = smartToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
      SMART_TRACKER.isSmartMode = false;
      document.getElementById("smartDiffBadge").style.display = "none";
      document.getElementById("smartLevelIndicator").style.display = "none";
      document
        .querySelectorAll(".diff-btn")
        .forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }
    if (state.timerMode) {
      state.timerMode = false;
      timerToggle.classList.remove("active");
      const dot = timerToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
      document.getElementById("timerOptions").classList.remove("show");
      document.getElementById("timerBadge").style.display = "none";
      document.getElementById("heartsInline").classList.remove("show");
      stopTimer();
      document
        .querySelectorAll(".diff-btn")
        .forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }
    revToggle.classList.remove("disabled-mode");
    if (hintBtn) hintBtn.disabled = true;
  } else {
    revToggle.classList.remove("disabled-mode");
    if (!state.timerMode) updateHintButton();
  }

  if (state.timerMode) {
    smartToggle.classList.add("disabled-mode");
    revToggle.classList.add("disabled-mode");
    if (state.smartMode) {
      state.smartMode = false;
      smartToggle.classList.remove("active");
      const dot = smartToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
      SMART_TRACKER.isSmartMode = false;
      document.getElementById("smartDiffBadge").style.display = "none";
      document.getElementById("smartLevelIndicator").style.display = "none";
      document
        .querySelectorAll(".diff-btn")
        .forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }
    if (state.revisionMode) {
      state.revisionMode = false;
      revToggle.classList.remove("active");
      const dot = revToggle.querySelector(".toggle-dot");
      if (dot) dot.style.background = "var(--text-muted)";
      state.revisionQueue = [];
      state.isRevisionQuestion = false;
      state.currentRevisionDocId = null;
    }
    timerToggle.classList.remove("disabled-mode");
    if (hintBtn) hintBtn.disabled = true;
    updateHeartsDisplay();
  } else {
    timerToggle.classList.remove("disabled-mode");
    if (!state.revisionMode) updateHintButton();
  }

  document.querySelectorAll(".mode-toggle").forEach((t) => {
    const dot = t.querySelector(".toggle-dot");
    if (dot) {
      if (t.classList.contains("active")) {
        dot.style.background = "var(--accent-1)";
      } else {
        dot.style.background = "var(--text-muted)";
      }
    }
  });
}

function startTimer() {
  stopTimer();
  if (!state.timerMode || state.difficulty === "easy") return;
  state.timerActive = true;
  state.timerRemaining = state.timerSec;
  const timerCountdown = document.getElementById("timerCountdown");
  const timerDisplay = document.getElementById("timerDisplay");

  state.timerInterval = setInterval(() => {
    state.timerRemaining -= 0.5;
    if (timerCountdown) {
      timerCountdown.textContent = Math.ceil(state.timerRemaining);
    }
    if (timerDisplay && state.timerRemaining <= 2) {
      timerDisplay.classList.add("warning");
    } else if (timerDisplay) {
      timerDisplay.classList.remove("warning");
    }
    if (state.timerRemaining <= 0) {
      stopTimer();
      if (!state.answered) {
        if (timerDisplay) timerDisplay.classList.remove("show");
        handleTimerTimeout();
      }
    }
  }, 500);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timerActive = false;
  const timerDisplay = document.getElementById("timerDisplay");
  if (timerDisplay) {
    timerDisplay.classList.remove("warning");
  }
}

function handleTimerTimeout() {
  if (state.answered) return;
  state.answered = true;
  state.userAnswer = "timeout";

  const q = state.currentQuestion;
  const s = state.stats;

  if (state.timerMode && state.difficulty !== "easy") {
    loseHeart();
  }

  s.wrong++;

  const boosters = getBoosters();
  if (boosters.streakActive) {
    s.noStreakBreakRemaining--;
    showToast(
      "🛡️ Streak Protected!",
      `${s.noStreakBreakRemaining} protections left.`,
      "fa-shield",
      "gain",
    );
    if (s.noStreakBreakRemaining <= 0) {
      s.noStreakBreakRemaining = 0;
      updateBoosterStatus();
    }
  } else {
    s.streak = 0;
  }

  const key = `${q.accountType}.${q.effect}`;
  s.weakRules[key] = (s.weakRules[key] || 0) + 1;

  if (s.topicStats && s.topicStats[q.accountType]) {
    s.topicStats[q.accountType].total++;
    s.topicStats[q.accountType].wrong++;
  }

  s.totalQuestions++;
  s.quizHistory.push({
    type: q.accountType,
    effect: q.effect,
    account: q.accountName,
    userAnswer: "timeout",
    correctAnswer: q.correctAnswer,
    ruleKey: `${q.accountType}.${q.effect}`,
    timestamp: Date.now(),
  });
  if (s.quizHistory.length > 200) s.quizHistory.shift();

  const total = s.correct + s.wrong;
  const acc = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  s.accuracyHistory.push(acc);
  if (s.accuracyHistory.length > 7) s.accuracyHistory.shift();

  state.userAnswer = "timeout";
  showFeedback(false, q, state.currentJournal, state.currentTransaction);

  updateHeaderStats();
  updateQuizProgress();
  updateDashboard();
  updateBadges();
  updateWeakTopics();
  saveStats();

  if (state.autoTimer) clearTimeout(state.autoTimer);
  state.autoTimer = setTimeout(() => {
    state.autoTimer = null;
    advanceQuestion();
  }, 1500);
}

function showFeedback(isCorrect, q, journal, trans) {
  const box = document.getElementById("feedbackBox");
  if (!box) return;

  const isTimeout = state.userAnswer === "timeout";
  const isCorrectFinal = isCorrect && !isTimeout;
  const isWrongFinal = !isCorrect || isTimeout;

  box.className = "feedback-box show " + (isCorrectFinal ? "correct" : "wrong");

  const icon = document.getElementById("fbIcon");
  if (icon)
    icon.className =
      "fas " +
      (isCorrectFinal
        ? "fa-check-circle"
        : isTimeout
          ? "fa-hourglass-end"
          : "fa-times-circle");

  const resultEl = document.getElementById("fbResult");
  if (resultEl) {
    if (isTimeout) {
      resultEl.textContent = "⏱ Time's Up!";
      resultEl.className = "fb-result wrong-text";
    } else {
      resultEl.textContent = isCorrectFinal ? "Correct!" : "Wrong!";
      resultEl.className =
        "fb-result " + (isCorrectFinal ? "correct-text" : "wrong-text");
    }
  }

  const accountForQuestion = trans.primaryAccount || q.accountName;
  const entry = journal.find((j) => j.account === accountForQuestion);

  let explanation = "",
    ruleText = "";
  const detailEl = document.getElementById("fbDetail");
  const ruleBox = document.getElementById("fbRuleBox");

  if (entry) {
    const info = getAccountInfo(entry.account);
    const category = info ? info.category : "Account";
    const label = ACCOUNT_RULES[category]
      ? ACCOUNT_RULES[category].label
      : category;
    const side = entry.side === "debit" ? "ডেবিট" : "ক্রেডিট";
    const sideLabel = entry.side === "debit" ? "Debit" : "Credit";
    const bnName = getBengaliName(entry.account) || entry.account;
    const amtStr =
      trans && trans.amount && trans.hasAmount
        ? ` ${trans.amount.toLocaleString()} টাকা`
        : "";
    const correctAns = q.correctAnswer === "debit" ? "Debit" : "Credit";

    if (isTimeout) {
      explanation = `সময় শেষ! সঠিক উত্তর ছিল <strong>${correctAns}</strong>।\n${bnName}${amtStr} একটি ${label}। ${label} ${side} হয়েছে, তাই ${bnName} হিসাব ${sideLabel} হবে।`;
    } else if (!isCorrectFinal) {
      explanation = `সঠিক উত্তর ছিল <strong>${correctAns}</strong>।\n${bnName}${amtStr} একটি ${label}। ${label} ${side} হয়েছে, তাই ${bnName} হিসাব ${sideLabel} হবে।`;
    } else {
      explanation = `${bnName}${amtStr} একটি ${label}। ${label} ${side} হয়েছে, তাই ${bnName} হিসাব ${sideLabel} হবে।`;
    }
    ruleText = `${label} ${side} = ${sideLabel}`;
  } else {
    const correctAns = q.correctAnswer === "debit" ? "Debit" : "Credit";
    if (isTimeout) {
      explanation = `সময় শেষ! সঠিক উত্তর ছিল <strong>${correctAns}</strong>।\n${q.explanation || "Review the accounting rules."}`;
    } else {
      explanation = isCorrectFinal
        ? q.explanation || "সঠিক উত্তর!"
        : `সঠিক উত্তর ছিল <strong>${correctAns}</strong>।\n${q.explanation || "Review the accounting rules."}`;
    }
    ruleText = q.ruleText || "Check the rule.";
  }

  if (detailEl) detailEl.innerHTML = explanation;
  if (ruleBox) ruleBox.innerHTML = `<strong>Rule:</strong> ${ruleText}`;

  $$(".quiz-opt").forEach((b) => {
    b.disabled = true;
    if (b.dataset.answer === q.correctAnswer) {
      b.classList.add("show-correct");
    }
    if (b.dataset.answer === q.correctAnswer && isCorrectFinal) {
      b.classList.add("correct");
    }
    if (
      b.dataset.answer !== q.correctAnswer &&
      !isCorrectFinal &&
      b.dataset.answer === state.userAnswer
    ) {
      b.classList.add("wrong");
    }
    if (b.dataset.answer === q.correctAnswer && !isCorrectFinal) {
      b.classList.add("show-correct");
    }
    if (isTimeout && b.dataset.answer === q.correctAnswer) {
      b.classList.add("show-correct");
    }
  });

  updateHintButton();

  if (state.autoTimer) {
    clearTimeout(state.autoTimer);
    state.autoTimer = null;
  }

  if (isCorrectFinal) {
    state.autoTimer = setTimeout(() => {
      state.autoTimer = null;
      advanceQuestion();
    }, 500);
    const autoNext = document.getElementById("autoNextIndicator");
    if (autoNext) autoNext.classList.remove("show");
    const nextBtn = document.getElementById("nextBtnFallback");
    if (nextBtn) nextBtn.classList.remove("show");
  } else {
    state.countdown = 5;
    const countdownEl = document.getElementById("countdownNum");
    if (countdownEl) countdownEl.textContent = "5";
    const autoNext = document.getElementById("autoNextIndicator");
    if (autoNext) autoNext.classList.add("show");
    const nextBtn = document.getElementById("nextBtnFallback");
    if (nextBtn) nextBtn.classList.remove("show");

    state.autoTimer = setInterval(() => {
      state.countdown -= 0.5;
      if (state.countdown <= 0) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
        if (countdownEl) countdownEl.textContent = "0";
        if (autoNext) autoNext.classList.remove("show");
        advanceQuestion();
      } else {
        if (countdownEl) countdownEl.textContent = Math.ceil(state.countdown);
      }
    }, 500);
  }
}

function advanceQuestion() {
  if (state.advancePending) return;
  state.advancePending = true;
  stopTimer();

  state.questionIndex++;
  if (state.questionIndex < state.questionList.length) {
    state.currentQuestion = state.questionList[state.questionIndex];
    state.advancePending = false;
    renderQuestion();
  } else {
    const trans = state.currentTransaction;
    state.advancePending = false;
    generateNextQuestionSet();
  }
}

// ================================================================
// 13. QUESTION GENERATOR
// ================================================================

function generateNextQuestionSet() {
  stopTimer();

  const mode = state.difficulty;

  if (state.revisionMode) {
    if (state.revisionQueue.length > 0) {
      const revData = state.revisionQueue.shift();
      const docId = revData.docId;
      const qData = revData.question;
      const transData = revData.transaction;
      const journalData = revData.journal || [];

      let transaction = {
        description:
          transData.display || transData.description || "Transaction",
        amount: transData.amount || 0,
        hasAmount: transData.amount > 0,
        journal: journalData,
        category: qData.accountType || "asset",
        primaryAccount:
          qData.accountName || (journalData[0] ? journalData[0].account : ""),
      };

      const question = {
        accountName: qData.accountName,
        accountType: qData.accountType,
        effect: qData.effect || "increase",
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation,
        ruleText: qData.ruleText,
        _revisionDocId: docId,
      };

      state.currentQuestion = question;
      state.currentTransaction = transaction;
      state.currentJournal = journalData;
      state.isRevisionQuestion = true;
      state.currentRevisionDocId = docId;
      updateRevisionBadges();
      renderQuestion();
      return;
    } else {
      state.revisionMode = false;
      state.isRevisionQuestion = false;
      state.currentRevisionDocId = null;
      const revToggle = document.getElementById("revisionToggle");
      if (revToggle) {
        revToggle.classList.remove("active");
        const dot = revToggle.querySelector(".toggle-dot");
        if (dot) dot.style.background = "var(--text-muted)";
      }
      showToast(
        "Revision Complete",
        "All revision questions answered!",
        "fa-check-circle",
        "gain",
      );
      updateRevisionBadges();
    }
  }

  state.isRevisionQuestion = false;
  state.currentRevisionDocId = null;

  let smartBias = null;
  let effectiveMode = mode;

  if (state.smartMode) {
    smartBias = SMART_TRACKER.getBiases();
    effectiveMode = SMART_TRACKER.getEffectiveMode();
    state.stats.effectiveDifficulty = effectiveMode;
    const indicator = document.getElementById("smartLevelIndicator");
    if (indicator)
      indicator.textContent = `Adaptive: ${effectiveMode.toUpperCase()}`;
    updateDifficultyButtons(effectiveMode);
    updateSmartBadge(effectiveMode);
    state.difficulty = effectiveMode;
  }

  const templateInfo = pickTemplateWithDiversity(effectiveMode, smartBias);
  const transaction = generateTransactionFromTemplate(
    templateInfo,
    effectiveMode,
  );

  const journal = transaction.journal;
  const primaryAccount = transaction.primaryAccount;
  const primarySide = transaction.primarySide;

  const primaryEntry = journal.find((j) => j.account === primaryAccount);
  if (!primaryEntry) {
    const fallback = journal[0];
    if (fallback) {
      transaction.primaryAccount = fallback.account;
      transaction.primarySide = fallback.side;
    }
  }

  const accountName = transaction.primaryAccount;
  const info = getAccountInfo(accountName);
  const categoryType = info ? info.category : "asset";

  const isDebit = transaction.primarySide === "debit";
  let effect;
  if (
    categoryType === "asset" ||
    categoryType === "expense" ||
    categoryType === "drawing"
  ) {
    effect = isDebit ? "increase" : "decrease";
  } else if (
    categoryType === "liability" ||
    categoryType === "capital" ||
    categoryType === "revenue"
  ) {
    effect = isDebit ? "decrease" : "increase";
  } else {
    effect = isDebit ? "increase" : "decrease";
  }

  const rule = ACCOUNT_RULES[categoryType];
  const correctAnswer = rule ? rule[effect] : "debit";
  const answerLabel = correctAnswer === "debit" ? "Debit" : "Credit";

  const bnName = getBengaliName(accountName) || accountName;
  const label = rule ? rule.label : "Account";
  const effectLabel = effect === "increase" ? "increases" : "decreases";
  const explanation = `"${bnName}" is an ${label}. When ${label} ${effectLabel}, it is ${answerLabel}.`;
  const ruleText = `${label} ${effectLabel} = ${answerLabel}`;

  const question = {
    accountName: accountName,
    accountType: categoryType,
    effect: effect,
    correctAnswer: correctAnswer,
    explanation: explanation,
    ruleText: ruleText,
  };

  state.currentQuestion = question;
  state.currentTransaction = transaction;
  state.currentJournal = journal;
  renderQuestion();
}

// ================================================================
// 14. ANSWER HANDLING
// ================================================================

async function handleAnswer(answer) {
  if (state.answered || !state.currentQuestion) return;
  state.answered = true;
  state.userAnswer = answer;

  stopTimer();
  const timerDisplay = document.getElementById("timerDisplay");
  if (timerDisplay) timerDisplay.classList.remove("show");

  const q = state.currentQuestion;
  const s = state.stats;
  const isCorrect = answer === q.correctAnswer;
  const isRevision = state.isRevisionQuestion && state.currentRevisionDocId;
  const isTimerMode = state.timerMode && state.difficulty !== "easy";

  const boosters = getBoosters();

  const rewards = getRewards(
    state.difficulty,
    isCorrect,
    isRevision,
    isTimerMode,
    state.timerSec,
    boosters,
  );

  const elapsed = (Date.now() - state.questionStartTime) / 1000;
  if (elapsed <= 3) s.fastAnswers = (s.fastAnswers || 0) + 1;
  s.sessionQuestions = (s.sessionQuestions || 0) + 1;

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) {
    s.nightQuestions = (s.nightQuestions || 0) + 1;
  }
  if (hour >= 6 && hour < 9) {
    s.earlyQuestions = (s.earlyQuestions || 0) + 1;
  }

  const today = new Date().toDateString();
  if (s.lastActivityDate !== today) {
    if (s.lastActivityDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (s.lastActivityDate === yesterday.toDateString()) {
        s.dailyStreak = (s.dailyStreak || 0) + 1;
      } else {
        s.dailyStreak = 1;
      }
    } else {
      s.dailyStreak = 1;
    }
    s.lastActivityDate = today;
  }

  let pointsChanged = 0,
    xpChanged = 0,
    coinsChanged = 0,
    rubiesChanged = 0;

  const topicType = q.accountType || "asset";
  if (s.topicStats && s.topicStats[topicType]) {
    s.topicStats[topicType].total++;
    if (!isCorrect) {
      s.topicStats[topicType].wrong++;
    }
  }

  if (isTimerMode && !isCorrect) {
    s.timerWrongCount = (s.timerWrongCount || 0) + 1;
    if (s.timerWrongCount >= 3) {
      loseHeart();
      s.timerWrongCount = 0;
    }
  }

  if (isCorrect) {
    s.correct++;
    s.streak++;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    s.points += rewards.points;
    s.xp += rewards.xp;
    s.coins += rewards.coins;
    s.rubies = (s.rubies || 0) + (rewards.rubies || 0);
    pointsChanged = rewards.points;
    xpChanged = rewards.xp;
    coinsChanged = rewards.coins;
    rubiesChanged = rewards.rubies || 0;

    if (isRevision) {
      s.revisionCorrect = (s.revisionCorrect || 0) + 1;
      await deleteRevisionQuestion(state.currentRevisionDocId);
      await updateRevisionBadges();
    }
    if (s.quizHistory && s.quizHistory.length > 0) {
      const last = s.quizHistory[s.quizHistory.length - 1];
      if (last && last.userAnswer !== last.correctAnswer)
        s.ruleBreakerCount = (s.ruleBreakerCount || 0) + 1;
    }
    if (coinsChanged > 0) showCoinToast(coinsChanged);
    if (rubiesChanged > 0) showRubyToast(rubiesChanged);

    if (isTimerMode) {
      s.timerQuestionsCompleted = (s.timerQuestionsCompleted || 0) + 1;
      if (state.timerSec === 5) {
        s.timer5sCompleted = (s.timer5sCompleted || 0) + 1;
      } else if (state.timerSec === 10) {
        s.timer10sCompleted = (s.timer10sCompleted || 0) + 1;
      }
    }
  } else {
    s.wrong++;
    if (boosters.streakActive) {
      s.noStreakBreakRemaining--;
      showToast(
        "🛡️ Streak Protected!",
        `${s.noStreakBreakRemaining} protections left.`,
        "fa-shield",
        "gain",
      );
      if (s.noStreakBreakRemaining <= 0) {
        s.noStreakBreakRemaining = 0;
        updateBoosterStatus();
      }
    } else {
      s.streak = 0;
    }
    const penalty = Math.abs(rewards.points) || 2;
    s.points = Math.max(0, s.points - Math.floor(penalty * 0.5));
    pointsChanged = -Math.floor(penalty * 0.5);
    const key = `${q.accountType}.${q.effect}`;
    s.weakRules[key] = (s.weakRules[key] || 0) + 1;
    if (!state.isRevisionQuestion && !isTimerMode) {
      await saveRevisionQuestion(
        q,
        state.currentTransaction,
        state.currentJournal,
      );
      await updateRevisionBadges();
    }
  }

  s.totalQuestions++;
  if (s.points < 0) s.points = 0;

  const newLevel = getLevelFromXP(s.xp);
  const oldLevel = s.level || 1;
  s.level = newLevel;
  if (newLevel > oldLevel) {
    setTimeout(
      () =>
        showToast(
          "Level Up!",
          `You are now Level ${newLevel}`,
          "fa-trophy",
          "gain",
        ),
      300,
    );
  }

  s.quizHistory.push({
    type: q.accountType,
    effect: q.effect,
    account: q.accountName,
    userAnswer: answer,
    correctAnswer: q.correctAnswer,
    ruleKey: `${q.accountType}.${q.effect}`,
    timestamp: Date.now(),
  });
  if (s.quizHistory.length > 200) s.quizHistory.shift();

  const total = s.correct + s.wrong;
  const acc = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  s.accuracyHistory.push(acc);
  if (s.accuracyHistory.length > 7) s.accuracyHistory.shift();

  if (state.smartMode) {
    SMART_TRACKER.update(q.accountType, isCorrect, state.difficulty);
    s.smartCategoryData = SMART_TRACKER.categoryCounts;
    s.effectiveDifficulty = SMART_TRACKER.getEffectiveMode();
  }

  const earnedIds = checkBadges(s);
  s.earnedBadges = earnedIds;

  const newBadges = earnedIds.filter((id) => !state._shownBadges.has(id));
  for (const id of newBadges) {
    const badge = ALL_BADGES.find((b) => b.id === id);
    if (badge) {
      state._shownBadges.add(id);
      setTimeout(() => showBadgeToast(badge), 400);
    }
  }
  for (const id of earnedIds) {
    state._shownBadges.add(id);
  }

  s.focusCount = (s.focusCount || 0) + 1;

  saveStats();

  updateHeaderStats();
  updateQuizProgress();

  let toastTitle = isCorrect ? "Correct!" : "Wrong!";
  let toastIcon = isCorrect ? "fa-check-circle" : "fa-times-circle";
  let toastType = isCorrect ? "gain" : "loss";
  let descParts = [];
  if (pointsChanged > 0)
    descParts.push(`<span class="highlight-gain">+${pointsChanged} pts</span>`);
  else if (pointsChanged < 0)
    descParts.push(`<span class="highlight-loss">${pointsChanged} pts</span>`);
  if (xpChanged > 0)
    descParts.push(`<span class="highlight-gain">+${xpChanged} XP</span>`);
  if (coinsChanged > 0)
    descParts.push(`<span class="highlight-coin">+${coinsChanged} 🪙</span>`);
  if (rubiesChanged > 0)
    descParts.push(`<span class="highlight-ruby">+${rubiesChanged} 💎</span>`);
  const desc =
    descParts.length > 0
      ? descParts.join(" · ")
      : isCorrect
        ? "Good job!"
        : "Keep practicing!";
  showToast(toastTitle, desc, toastIcon, toastType);

  if (isRevision && isCorrect) {
    state.isRevisionQuestion = false;
    state.currentRevisionDocId = null;
  }

  showFeedback(isCorrect, q, state.currentJournal, state.currentTransaction);
  updateDashboard();
  updateBadges();
  updateWeakTopics();
  updateBoosterStatus();

  renderLeaderboard();
}

// ================================================================
// 15. HINT SYSTEM
// ================================================================

function useHint() {
  if (state.answered || !state.currentQuestion) {
    showToast(
      "Hint Not Available",
      "Answer the current question first.",
      "fa-exclamation-circle",
      "loss",
    );
    return;
  }
  if (state.revisionMode || state.timerMode) {
    showToast(
      "Hint Disabled",
      "Hints are not available in Revision or Timer Mode.",
      "fa-exclamation-circle",
      "loss",
    );
    return;
  }
  if (state.stats.hints <= 0) {
    showToast(
      "No Hints",
      "You have no hints. Buy more in the Shop!",
      "fa-exclamation-circle",
      "loss",
    );
    return;
  }
  state.stats.hints--;
  state.hintUsedForQuestion = true;
  updateHeaderStats();
  updateDashboard();
  updateHintButton();

  const q = state.currentQuestion;
  const ruleText = q.ruleText || "Check the rule.";
  showToast("Hint Revealed", `Rule: ${ruleText}`, "fa-lightbulb", "hint");
  saveStats();
}

// ================================================================
// 16. SHOP
// ================================================================

function buyHint(hints, price, rubiesBonus) {
  const s = state.stats;
  if (s.coins < price) {
    showToast(
      "Not Enough Coins",
      `Need ${price} coins. You have ${s.coins}.`,
      "fa-coins",
      "loss",
    );
    return;
  }
  if (s.rubies < (rubiesBonus || 0)) {
    showToast(
      "Not Enough Rubies",
      `Need ${rubiesBonus} rubies. You have ${s.rubies}.`,
      "fa-gem",
      "loss",
    );
    return;
  }
  s.coins -= price;
  s.rubies = (s.rubies || 0) - (rubiesBonus || 0);
  s.hints = (s.hints || 0) + hints;
  updateHeaderStats();
  updateDashboard();
  updateShopUI();
  updateHintButton();
  showToast(
    "Hints Purchased!",
    `${hints} hints added${rubiesBonus ? ` (${rubiesBonus} rubies spent)` : ""}.`,
    "fa-coins",
    "hint",
  );
  saveStats();
}

function buyCoins(coins, rubiesCost) {
  const s = state.stats;
  if (s.rubies < rubiesCost) {
    showToast(
      "Not Enough Rubies",
      `Need ${rubiesCost} rubies. You have ${s.rubies}.`,
      "fa-gem",
      "loss",
    );
    return;
  }
  s.rubies -= rubiesCost;
  s.coins += coins;
  updateHeaderStats();
  updateDashboard();
  updateShopUI();
  showToast(
    "Coins Purchased!",
    `+${coins} coins for ${rubiesCost} rubies.`,
    "fa-coins",
    "gain",
  );
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

// ================================================================
// 17. DASHBOARD
// ================================================================

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

  const topicLabels = {
    asset: "Asset",
    liability: "Liability",
    capital: "Capital",
    revenue: "Revenue",
    expense: "Expense",
    drawing: "Drawing",
  };
  const topicEmojis = {
    asset: "🏦",
    liability: "📉",
    capital: "💰",
    revenue: "📈",
    expense: "💸",
    drawing: "✏️",
  };

  const topics = s.topicStats || {};
  const entries = Object.entries(topics)
    .filter(([key, data]) => data.total > 0)
    .map(([key, data]) => {
      const pct =
        data.total > 0 ? Math.round((data.wrong / data.total) * 100) : 0;
      return {
        key,
        label: topicLabels[key] || key,
        emoji: topicEmojis[key] || "📊",
        total: data.total,
        wrong: data.wrong,
        pct,
      };
    })
    .sort((a, b) => b.pct - a.pct);

  if (entries.length === 0) {
    container.innerHTML =
      '<div style="padding:8px 0;color:var(--accent-2);"><i class="fas fa-check-circle"></i> No weak topics yet. Keep going!</div>';
    return;
  }

  container.innerHTML = entries
    .map((entry) => {
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
    })
    .join("");
}

// ================================================================
// 18. REVISION
// ================================================================

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
    showToast(
      "Revision Mode Off",
      "No revision questions left.",
      "fa-info-circle",
      "gain",
    );
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
    container.innerHTML = docs
      .map((doc) => {
        const displayText = doc.displayText || "Transaction";
        const accountName =
          doc.accountDisplay || doc.questionAccount || "Account";
        const bnName = getBengaliName(accountName) || accountName;
        const time = new Date(doc.timestamp).toLocaleString();
        return `<div class="revision-item"><div><strong>"${displayText}"</strong><span class="meta">${bnName} হিসাব · ${time}</span></div><span class="badge-wrong">Wrong</span></div>`;
      })
      .join("");
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

// ================================================================
// 19. LEADERBOARD (Render only)
// ================================================================

function renderLeaderboard() {
  const tbody = document.getElementById("lbBody");
  const empty = document.getElementById("lbEmpty");
  if (!tbody || !empty) return;

  // --- GUEST CHECK ---
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
  else if (leaderboardSortKey === "points")
    sorted.sort((a, b) => b.points - a.points);
  else if (leaderboardSortKey === "accuracy")
    sorted.sort((a, b) => b.accuracy - a.accuracy);
  else if (leaderboardSortKey === "badges")
    sorted.sort((a, b) => (b.badges || 0) - (a.badges || 0));

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
      const acc =
        total > 0 ? Math.round((state.stats.correct / total) * 100) : 0;
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
      const acc =
        total > 0 ? Math.round((state.stats.correct / total) * 100) : 0;
      const userObj = {
        email: currentEmail,
        name: auth.currentUser
          ? auth.currentUser.displayName || "User"
          : "User",
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
        else if (leaderboardSortKey === "points")
          sorted.sort((a, b) => b.points - a.points);
        else if (leaderboardSortKey === "accuracy")
          sorted.sort((a, b) => b.accuracy - a.accuracy);
        else if (leaderboardSortKey === "badges")
          sorted.sort((a, b) => (b.badges || 0) - (a.badges || 0));
      }
    }
  }

  if (sorted.length === 0) {
    if (empty) empty.style.display = "block";
    tbody.innerHTML = "";
    return;
  }
  if (empty) empty.style.display = "none";

  tbody.innerHTML = sorted
    .map((e, i) => {
      const rank = i + 1;
      let rc = "lb-rank";
      if (rank === 1) rc += " gold";
      else if (rank === 2) rc += " silver";
      else if (rank === 3) rc += " bronze";

      const isUser = e.email === currentEmail;
      const rowClass = isUser ? ' class="lb-user-row"' : "";

      const avatar = e.photoURL
        ? `<img src="${e.photoURL}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:6px;" />`
        : "";

      const displayName = isUser
        ? auth.currentUser
          ? auth.currentUser.displayName || "User"
          : "User"
        : e.name;

      return `<tr${rowClass}>
                    <td><span class="${rc}">#${rank}</span></td>
                    <td>${avatar}${displayName} ${isUser ? '<i class="fas fa-star" style="color:var(--accent-3);font-size:12px;margin-left:4px;"></i>' : ""}</td>
                    <td>${e.xp}</td>
                    <td>${e.points}</td>
                    <td>${e.accuracy}%</td>
                    <td>${e.badges || 0}</td>
                </tr>`;
    })
    .join("");

  // Award top 3 badges (n1–n4)
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

    newBadges = newBadges.filter((id) => !prevBadges.has(id));
    if (newBadges.length > 0) {
      s.earnedBadges = [...prevBadges, ...newBadges];
      for (const id of newBadges) {
        const badge = ALL_BADGES.find((b) => b.id === id);
        if (badge) {
          if (!state._shownBadges.has(id)) {
            state._shownBadges.add(id);
            setTimeout(() => showBadgeToast(badge), 300);
          }
        }
      }
      saveStats();
      updateBadges();
    }
  }
}

// ================================================================
// 20. NAVIGATION
// ================================================================

function navigateTo(section) {
  $$(".section-panel").forEach((el) => el.classList.remove("active"));
  const target = document.getElementById("section-" + section);
  if (target) target.classList.add("active");
  $$(".nav-tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.section === section);
  });
  if (section === "dashboard") {
    updateDashboard();
    updateBadges();
    updateWeakTopics();
  }
  if (section === "shop") {
    updateShopUI();
  }
  if (section === "revision") loadRevisionList();
  if (section === "leaderboard") renderLeaderboard();
}

// ================================================================
// 21. INIT (all event listeners)
// ================================================================

function init() {
  auth.onAuthStateChanged(handleAuthState);

  document
    .getElementById("loginBtn")
    .addEventListener("click", async function () {
      const btn = this,
        loader = document.getElementById("loginLoader");
      btn.style.display = "none";
      loader.style.display = "flex";
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
      } catch (error) {
        showToast(
          "Login Failed",
          error.message || "Please try again.",
          "fa-exclamation-circle",
          "loss",
        );
        btn.style.display = "flex";
        loader.style.display = "none";
      }
    });

  document
    .getElementById("skipLoginBtn")
    .addEventListener("click", function () {
      let guestId = localStorage.getItem("guest_id");
      if (!guestId) {
        guestId =
          "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
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
          state.stats._heartRefillDone = false;
          for (const id of state.stats.earnedBadges || []) {
            state._shownBadges.add(id);
          }
          state.stats.javedaClicks = state.stats.javedaClicks || 0;
          state.stats.dailyStreak = state.stats.dailyStreak || 0;
          state.stats.lastActivityDate = state.stats.lastActivityDate || null;
          state.stats.sessionQuestions = state.stats.sessionQuestions || 0;
          state.stats.nightQuestions = state.stats.nightQuestions || 0;
          state.stats.earlyQuestions = state.stats.earlyQuestions || 0;
        }
      } catch (e) {}
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
      if (avatar)
        avatar.src =
          "https://ui-avatars.com/api/?name=Guest&background=5b4bd5&color=fff&size=36";
      if (nameDisplay) nameDisplay.textContent = "Guest";
      showToast(
        "Guest Mode",
        "Your progress is saved locally.",
        "fa-user",
        "gain",
      );
    });

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

  document
    .getElementById("logoutBtn")
    .addEventListener("click", async function () {
      try {
        await auth.signOut();
        const dropdown = document.getElementById("userDropdown");
        if (dropdown) dropdown.classList.remove("show");
        state.isGuest = false;
        localStorage.removeItem("guest_id");
        showToast(
          "Signed Out",
          "You have been signed out.",
          "fa-sign-out-alt",
          "gain",
        );
      } catch (e) {
        console.error("Logout error:", e);
      }
    });

  document
    .getElementById("learnJavedaBtn")
    .addEventListener("click", function (e) {
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

  $$(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (state.smartMode) {
        showToast(
          "Smart Mode Active",
          "Difficulty is auto-adjusted in Smart Mode.",
          "fa-brain",
          "gain",
        );
        return;
      }
      if (state.timerMode && this.dataset.diff === "easy") {
        showToast(
          "Timer Mode",
          "Timer Mode only supports Medium and Hard.",
          "fa-hourglass-half",
          "gain",
        );
        return;
      }
      $$(".diff-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      state.difficulty = this.dataset.diff;
      SMART_TRACKER.baseMode = state.difficulty;
      SMART_TRACKER.smartDifficulty = state.difficulty;
      if (state.smartMode) {
        SMART_TRACKER.reset();
        SMART_TRACKER.baseMode = state.difficulty;
        SMART_TRACKER.smartDifficulty = state.difficulty;
      }
      if (state.revisionMode) loadRevisionQueue();
      if (state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
      updateDiffModeLabel(state.difficulty);
      generateNextQuestionSet();
    });
  });

  $$(".quiz-opt").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (state.answered) return;
      handleAnswer(this.dataset.answer);
    });
  });

  document.getElementById("hintBtn").addEventListener("click", useHint);

  document
    .getElementById("nextBtnFallback")
    .addEventListener("click", function () {
      if (state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
      this.classList.remove("show");
      const autoNext = document.getElementById("autoNextIndicator");
      if (autoNext) autoNext.classList.remove("show");
      advanceQuestion();
    });

  $$(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      navigateTo(this.dataset.section);
    });
  });

  document.getElementById("smartToggle").addEventListener("click", function () {
    if (state.revisionMode) {
      state.revisionMode = false;
      const revToggle = document.getElementById("revisionToggle");
      if (revToggle) {
        revToggle.classList.remove("active");
        const dot = revToggle.querySelector(".toggle-dot");
        if (dot) dot.style.background = "var(--text-muted)";
      }
      state.revisionQueue = [];
      state.isRevisionQuestion = false;
      state.currentRevisionDocId = null;
    }
    if (state.timerMode) {
      state.timerMode = false;
      const timerToggle = document.getElementById("timerToggle");
      if (timerToggle) {
        timerToggle.classList.remove("active");
        const dot = timerToggle.querySelector(".toggle-dot");
        if (dot) dot.style.background = "var(--text-muted)";
      }
      document.getElementById("timerOptions").classList.remove("show");
      document.getElementById("timerBadge").style.display = "none";
      document.getElementById("heartsInline").classList.remove("show");
      stopTimer();
      document
        .querySelectorAll(".diff-btn")
        .forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }

    state.smartMode = !state.smartMode;
    this.classList.toggle("active");
    const dot = this.querySelector(".toggle-dot");
    if (dot)
      dot.style.background = state.smartMode
        ? "var(--accent-1)"
        : "var(--text-muted)";
    SMART_TRACKER.isSmartMode = state.smartMode;

    if (state.smartMode) {
      SMART_TRACKER.baseMode = state.difficulty;
      SMART_TRACKER.smartDifficulty = state.difficulty;
      if (state.stats.smartCategoryData)
        SMART_TRACKER.categoryCounts = state.stats.smartCategoryData;
      if (state.stats.effectiveDifficulty)
        SMART_TRACKER.smartDifficulty = state.stats.effectiveDifficulty;
      state.stats.smartModeCount = (state.stats.smartModeCount || 0) + 1;
      showToast(
        "Smart Mode On",
        "Adaptive learning activated. Difficulty auto-adjusts based on performance.",
        "fa-brain",
        "gain",
      );
      const indicator = document.getElementById("smartLevelIndicator");
      if (indicator) indicator.style.display = "inline-block";
      const diffBtns = document.querySelectorAll(".diff-btn");
      diffBtns.forEach((b) => b.classList.add("diff-toggle-disabled"));
      const eff = SMART_TRACKER.getEffectiveMode();
      updateDifficultyButtons(eff);
      updateSmartBadge(eff);
      updateDiffModeLabel(eff);
    } else {
      SMART_TRACKER.reset();
      SMART_TRACKER.baseMode = state.difficulty;
      SMART_TRACKER.smartDifficulty = state.difficulty;
      const indicator = document.getElementById("smartLevelIndicator");
      if (indicator) indicator.style.display = "none";
      document.getElementById("smartDiffBadge").style.display = "none";
      showToast(
        "Smart Mode Off",
        "Switched to manual difficulty control.",
        "fa-brain",
        "gain",
      );
      const diffBtns = document.querySelectorAll(".diff-btn");
      diffBtns.forEach((b) => b.classList.remove("diff-toggle-disabled"));
      updateDiffModeLabel(state.difficulty);
    }
    updateModeToggles();
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
    generateNextQuestionSet();
  });

  document
    .getElementById("revisionToggle")
    .addEventListener("click", async function () {
      if (state.smartMode) {
        state.smartMode = false;
        const smartToggle = document.getElementById("smartToggle");
        if (smartToggle) {
          smartToggle.classList.remove("active");
          const dot = smartToggle.querySelector(".toggle-dot");
          if (dot) dot.style.background = "var(--text-muted)";
        }
        SMART_TRACKER.isSmartMode = false;
        document.getElementById("smartDiffBadge").style.display = "none";
        document.getElementById("smartLevelIndicator").style.display = "none";
        document
          .querySelectorAll(".diff-btn")
          .forEach((b) => b.classList.remove("diff-toggle-disabled"));
      }
      if (state.timerMode) {
        state.timerMode = false;
        const timerToggle = document.getElementById("timerToggle");
        if (timerToggle) {
          timerToggle.classList.remove("active");
          const dot = timerToggle.querySelector(".toggle-dot");
          if (dot) dot.style.background = "var(--text-muted)";
        }
        document.getElementById("timerOptions").classList.remove("show");
        document.getElementById("timerBadge").style.display = "none";
        document.getElementById("heartsInline").classList.remove("show");
        stopTimer();
        document
          .querySelectorAll(".diff-btn")
          .forEach((b) => b.classList.remove("diff-toggle-disabled"));
      }

      const count = await getRevisionCount();
      if (count === 0) {
        showToast(
          "No Revision",
          "No wrong answers to revise.",
          "fa-info-circle",
          "gain",
        );
        return;
      }
      state.revisionMode = !state.revisionMode;
      this.classList.toggle("active");
      const dot = this.querySelector(".toggle-dot");
      if (dot)
        dot.style.background = state.revisionMode
          ? "var(--accent-1)"
          : "var(--text-muted)";
      if (state.revisionMode) {
        await loadRevisionQueue();
        if (state.revisionQueue.length === 0) {
          state.revisionMode = false;
          this.classList.remove("active");
          if (dot) dot.style.background = "var(--text-muted)";
          showToast(
            "No Revision",
            "No revision questions available.",
            "fa-info-circle",
            "gain",
          );
          return;
        }
        showToast(
          "Revision Mode On",
          `${state.revisionQueue.length} questions to revise.`,
          "fa-rotate-left",
          "gain",
        );
      } else {
        state.revisionQueue = [];
        state.isRevisionQuestion = false;
        state.currentRevisionDocId = null;
        showToast(
          "Revision Mode Off",
          "Switched to regular mode.",
          "fa-info-circle",
          "gain",
        );
      }
      updateModeToggles();
      if (state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
      generateNextQuestionSet();
    });

  document.getElementById("timerToggle").addEventListener("click", function () {
    if (state.smartMode) {
      state.smartMode = false;
      const smartToggle = document.getElementById("smartToggle");
      if (smartToggle) {
        smartToggle.classList.remove("active");
        const dot = smartToggle.querySelector(".toggle-dot");
        if (dot) dot.style.background = "var(--text-muted)";
      }
      SMART_TRACKER.isSmartMode = false;
      document.getElementById("smartDiffBadge").style.display = "none";
      document.getElementById("smartLevelIndicator").style.display = "none";
      document
        .querySelectorAll(".diff-btn")
        .forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }
    if (state.revisionMode) {
      state.revisionMode = false;
      const revToggle = document.getElementById("revisionToggle");
      if (revToggle) {
        revToggle.classList.remove("active");
        const dot = revToggle.querySelector(".toggle-dot");
        if (dot) dot.style.background = "var(--text-muted)";
      }
      state.revisionQueue = [];
      state.isRevisionQuestion = false;
      state.currentRevisionDocId = null;
    }

    if (state.difficulty === "easy" && !state.timerMode) {
      showToast(
        "Timer Mode",
        "Timer Mode requires Medium or Hard difficulty. Switching to Medium.",
        "fa-hourglass-half",
        "gain",
      );
      state.difficulty = "medium";
      $$(".diff-btn").forEach((b) => b.classList.remove("active"));
      document.querySelector(".diff-btn.medium").classList.add("active");
      SMART_TRACKER.baseMode = "medium";
      SMART_TRACKER.smartDifficulty = "medium";
      updateDiffModeLabel("medium");
    }

    state.timerMode = !state.timerMode;
    this.classList.toggle("active");
    const dot = this.querySelector(".toggle-dot");
    if (dot)
      dot.style.background = state.timerMode
        ? "var(--accent-1)"
        : "var(--text-muted)";

    if (state.timerMode) {
      state.stats.hearts = state.stats.maxHearts;
      state.stats.timerWrongCount = 0;
      state.stats.lastHeartRefill = Date.now();
      state.stats._heartRefillDone = false;
      document.getElementById("timerOptions").classList.add("show");
      showToast(
        "Timer Mode On",
        `⏱ ${state.timerSec}s per question. Medium & Hard only.`,
        "fa-hourglass-half",
        "gain",
      );
      document.querySelectorAll(".diff-btn").forEach((b) => {
        if (b.dataset.diff === "easy") {
          b.classList.add("diff-toggle-disabled");
        } else {
          b.classList.remove("diff-toggle-disabled");
        }
      });
      const activeDiff = document.querySelector(".diff-btn.active");
      if (activeDiff && activeDiff.dataset.diff === "easy") {
        document.querySelector(".diff-btn.medium").click();
      }
      const timerBadge = document.getElementById("timerBadge");
      if (timerBadge) {
        timerBadge.style.display = "inline-block";
        timerBadge.textContent = `⏱ ${state.timerSec}s`;
        timerBadge.className = "timer-badge ruby";
      }
      updateHeartsDisplay();
    } else {
      document.getElementById("timerOptions").classList.remove("show");
      document.querySelectorAll(".diff-btn").forEach((b) => {
        b.classList.remove("diff-toggle-disabled");
        if (state.smartMode) b.classList.add("diff-toggle-disabled");
      });
      const timerBadge = document.getElementById("timerBadge");
      if (timerBadge) timerBadge.style.display = "none";
      document.getElementById("heartsInline").classList.remove("show");
      stopTimer();
      showToast(
        "Timer Mode Off",
        "Timer disabled.",
        "fa-hourglass-half",
        "gain",
      );
    }
    updateModeToggles();
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
    generateNextQuestionSet();
  });

  document.querySelectorAll(".timer-opt").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (!state.timerMode) {
        showToast(
          "Timer Mode Off",
          "Enable Timer Mode first.",
          "fa-hourglass-half",
          "gain",
        );
        return;
      }
      document
        .querySelectorAll(".timer-opt")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      state.timerSec = parseInt(this.dataset.timer);
      const timerBadge = document.getElementById("timerBadge");
      if (timerBadge) {
        timerBadge.textContent = `⏱ ${state.timerSec}s`;
      }
      showToast(
        "Timer Set",
        `${state.timerSec} seconds per question.`,
        "fa-clock",
        "gain",
      );
      if (state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
      generateNextQuestionSet();
    });
  });

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

  document
    .getElementById("revisionModeBtn")
    .addEventListener("click", async function () {
      const count = await getRevisionCount();
      if (count === 0) {
        showToast(
          "No Revision",
          "No wrong answers to revise.",
          "fa-info-circle",
          "gain",
        );
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
          showToast(
            "No Revision",
            "No revision questions available.",
            "fa-info-circle",
            "gain",
          );
        } else {
          showToast(
            "Revision Reloaded",
            `${state.revisionQueue.length} questions to revise.`,
            "fa-rotate-left",
            "gain",
          );
        }
        if (state.autoTimer) {
          clearInterval(state.autoTimer);
          state.autoTimer = null;
        }
        generateNextQuestionSet();
      }
      navigateTo("quiz");
    });

  document
    .getElementById("refreshRevisionBtn")
    .addEventListener("click", function () {
      loadRevisionList();
      updateRevisionBadges();
      showToast("Refreshed", "Revision list updated.", "fa-sync", "gain");
    });

  $$(".lb-filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      $$(".lb-filter-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      leaderboardSortKey = this.dataset.lb;
      renderLeaderboard();
    });
  });

  setInterval(() => {
    if (state.stats.hearts < state.stats.maxHearts) {
      state.stats._heartRefillDone = false;
      checkHeartRefill();
    }
    checkBoosters();
    updateHeartsDisplay();
    updateBoosterStatus();
  }, 60000);

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
    const diffBtns = document.querySelectorAll(".diff-btn");
    diffBtns.forEach((b) => b.classList.add("diff-toggle-disabled"));
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

  state.stats._heartRefillDone = false;
  checkHeartRefill();

  updateDiffModeLabel(state.difficulty);
  updateModeToggles();
  updateHeartsDisplay();
  updateBoosterStatus();

  console.log(
    "📘 Version : 6.0.0 - New 28 badges with new logic (Leaderboard, Javeda, hints, streaks, etc.)",
  );
  console.log("✅ Developed By - Faizul Islam Riyad");
}

document.addEventListener("DOMContentLoaded", init);