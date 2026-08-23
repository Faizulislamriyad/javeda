// ================================================================
// QUIZ.JS — All Quiz‑Section Logic
// ================================================================

// --------------------------------------------
// 1. ACCOUNT CLASSIFICATION SYSTEM
// --------------------------------------------

const ACCOUNT_CLASSIFICATIONS = {
  Cash: { category: "asset", bengali: "নগদান", rule: "increase=debit,decrease=credit" },
  Bank: { category: "asset", bengali: "ব্যাংক", rule: "increase=debit,decrease=credit" },
  "Accounts Receivable": { category: "asset", bengali: "দেনাদার", rule: "increase=debit,decrease=credit" },
  Inventory: { category: "asset", bengali: "মাল", rule: "increase=debit,decrease=credit" },
  Furniture: { category: "asset", bengali: "আসবাবপত্র", rule: "increase=debit,decrease=credit" },
  Equipment: { category: "asset", bengali: "যন্ত্রপাতি", rule: "increase=debit,decrease=credit" },
  Computer: { category: "asset", bengali: "কম্পিউটার", rule: "increase=debit,decrease=credit" },
  "Office Supplies": { category: "asset", bengali: "অফিস সরঞ্জাম", rule: "increase=debit,decrease=credit" },
  "Prepaid Rent": { category: "asset", bengali: "অগ্রিম ভাড়া", rule: "increase=debit,decrease=credit" },
  "Prepaid Insurance": { category: "asset", bengali: "অগ্রিম বিমা খরচ", rule: "increase=debit,decrease=credit" },
  "Prepaid Expense": { category: "asset", bengali: "অগ্রিম খরচ", rule: "increase=debit,decrease=credit" },
  "Accumulated Depreciation": { category: "asset", bengali: "সঞ্চিত অবচয়", rule: "increase=credit,decrease=debit" },
  Building: { category: "asset", bengali: "ভবন", rule: "increase=debit,decrease=credit" },
  Land: { category: "asset", bengali: "জমি", rule: "increase=debit,decrease=credit" },
  Creditors: { category: "liability", bengali: "পাওনাদার", rule: "increase=credit,decrease=debit" },
  "Bank Loan": { category: "liability", bengali: "ব্যাংক ঋণ", rule: "increase=credit,decrease=debit" },
  "Salary Payable": { category: "liability", bengali: "বকেয়া বেতন", rule: "increase=credit,decrease=debit" },
  "Rent Payable": { category: "liability", bengali: "বকেয়া ভাড়া", rule: "increase=credit,decrease=debit" },
  "Interest Payable": { category: "liability", bengali: "প্রদেয় সুদ", rule: "increase=credit,decrease=debit" },
  Loan: { category: "liability", bengali: "ঋণ", rule: "increase=credit,decrease=debit" },
  Debentures: { category: "liability", bengali: "ঋণপত্র", rule: "increase=credit,decrease=debit" },
  Capital: { category: "capital", bengali: "মূলধন", rule: "increase=credit,decrease=debit" },
  Drawings: { category: "drawing", bengali: "উত্তোলন", rule: "increase=debit,decrease=credit" },
  "Sales Revenue": { category: "revenue", bengali: "বিক্রয়", rule: "increase=credit,decrease=debit" },
  "Service Revenue": { category: "revenue", bengali: "সেবা আয়", rule: "increase=credit,decrease=debit" },
  "Commission Revenue": { category: "revenue", bengali: "কমিশন আয়", rule: "increase=credit,decrease=debit" },
  "Rent Revenue": { category: "revenue", bengali: "ভাড়া আয়", rule: "increase=credit,decrease=debit" },
  "Interest Revenue": { category: "revenue", bengali: "সুদ প্রাপ্তি", rule: "increase=credit,decrease=debit" },
  "Discount Received": { category: "revenue", bengali: "বাট্টা পাওয়া", rule: "increase=credit,decrease=debit" },
  "Accrued Revenue": { category: "revenue", bengali: "অর্জিত আয়", rule: "increase=credit,decrease=debit" },
  Salary: { category: "expense", bengali: "বেতন", rule: "increase=debit,decrease=credit" },
  Rent: { category: "expense", bengali: "ভাড়া", rule: "increase=debit,decrease=credit" },
  Advertisement: { category: "expense", bengali: "বিজ্ঞাপন খরচ", rule: "increase=debit,decrease=credit" },
  Insurance: { category: "expense", bengali: "বীমা খরচ", rule: "increase=debit,decrease=credit" },
  Transport: { category: "expense", bengali: "পরিবহন খরচ", rule: "increase=debit,decrease=credit" },
  "Office Expenses": { category: "expense", bengali: "অফিস খরচ", rule: "increase=debit,decrease=credit" },
  "Electricity Bill": { category: "expense", bengali: "বিদ্যুৎ বিল", rule: "increase=debit,decrease=credit" },
  "Depreciation Expense": { category: "expense", bengali: "অবচয় খরচ", rule: "increase=debit,decrease=credit" },
  "Bad Debts": { category: "expense", bengali: "কুঋণ", rule: "increase=debit,decrease=credit" },
  "Bank Charges": { category: "expense", bengali: "ব্যাংক চার্জ", rule: "increase=debit,decrease=credit" },
  "Interest Expense": { category: "expense", bengali: "সুদ খরচ", rule: "increase=debit,decrease=credit" },
  "Income Tax": { category: "expense", bengali: "আয়কর", rule: "increase=debit,decrease=credit" },
  Donation: { category: "expense", bengali: "দান খরচ", rule: "increase=debit,decrease=credit" },
  "Commission Expense": { category: "expense", bengali: "কমিশন খরচ", rule: "increase=debit,decrease=credit" },
  Repairs: { category: "expense", bengali: "মেরামত খরচ", rule: "increase=debit,decrease=credit" },
  "Discount Allowed": { category: "expense", bengali: "বাট্টা প্রদান", rule: "increase=debit,decrease=credit" },
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

// --------------------------------------------
// 2. TEMPLATE DEFINITIONS
// --------------------------------------------

const TEMPLATE_DEFINITIONS = {
  asset_purchase: {
    category: "asset", difficulty: "easy",
    patterns: ["নগদে {asset} ক্রয় করা হয়েছে", "{asset} নগদে ক্রয় করা হয়েছে"],
    assetPool: ["Computer", "Mobile", "Book", "Furniture", "Table", "Chair"],
    journal: [{ account: "{asset}", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: false, amountRange: null,
  },
  expense_pay: {
    category: "expense", difficulty: "easy",
    patterns: ["নগদে {expense} পরিশোধ করা হয়েছে", "{expense} নগদে পরিশোধ"],
    expensePool: ["Electricity Bill", "Rent", "Transport", "Salary", "Insurance"],
    journal: [{ account: "{expense}", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: false, amountRange: null,
  },
  capital_invest: {
    category: "capital", difficulty: "easy",
    patterns: ["মালিক নগদ বিনিয়োগ করেছেন", "মালিক ব্যবসায়ে নগদ বিনিয়োগ করেছেন"],
    journal: [{ account: "Cash", side: "debit" }, { account: "Capital", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: false, amountRange: null,
  },
  revenue_sale: {
    category: "revenue", difficulty: "easy",
    patterns: ["নগদে {item} বিক্রয় করা হয়েছে", "{item} নগদে বিক্রয়"],
    itemPool: ["পণ্য", "মাল", "সেবা", "Book", "Pen"],
    journal: [{ account: "Cash", side: "debit" }, { account: "Sales Revenue", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: false, amountRange: null,
  },
  liability_pay: {
    category: "liability", difficulty: "easy",
    patterns: ["{liability} পরিশোধ করা হয়েছে", "{liability} নগদে পরিশোধ"],
    liabilityPool: ["Creditors", "Rent Payable", "Salary Payable"],
    journal: [{ account: "{liability}", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: false, amountRange: null,
  },
  drawings: {
    category: "drawing", difficulty: "easy",
    patterns: ["মালিক নগদ উত্তোলন করেছেন", "মালিক ব্যক্তিগত প্রয়োজনে নগদ উত্তোলন"],
    journal: [{ account: "Drawings", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: false, amountRange: null,
  },
  medium_asset_purchase: {
    category: "asset", difficulty: "medium",
    patterns: ["নগদে {amount} টাকায় {asset} ক্রয় করা হয়েছে", "{amount} টাকায় {asset} নগদে ক্রয়"],
    assetPool: ["Computer", "Mobile", "Furniture", "Equipment", "Laptop", "Table", "Chair"],
    journal: [{ account: "{asset}", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [3000, 80000],
  },
  medium_expense_pay: {
    category: "expense", difficulty: "medium",
    patterns: ["নগদে {expense} বাবদ {amount} টাকা পরিশোধ", "{expense} বাবদ {amount} টাকা নগদে প্রদান"],
    expensePool: ["Rent", "Transport", "Advertisement", "Salary", "Insurance", "Repairs", "Internet Bill"],
    journal: [{ account: "{expense}", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [1000, 50000],
  },
  medium_revenue_sale: {
    category: "revenue", difficulty: "medium",
    patterns: ["নগদে {amount} টাকায় {item} বিক্রয়", "{amount} টাকায় {item} নগদে বিক্রয়"],
    itemPool: ["পণ্য", "মাল", "সেবা", "Mobile", "Furniture", "Computer", "Book", "Table", "Chair"],
    journal: [{ account: "Cash", side: "debit" }, { account: "Sales Revenue", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [3000, 90000],
  },
  medium_bank_deposit: {
    category: "asset", difficulty: "medium",
    patterns: ["ব্যাংকে {amount} টাকা জমা দেওয়া হয়েছে", "{amount} টাকা ব্যাংকে জমা"],
    journal: [{ account: "Bank", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [5000, 50000],
  },
  medium_bank_withdrawal: {
    category: "asset", difficulty: "medium",
    patterns: ["ব্যাংক থেকে {amount} টাকা উত্তোলন", "{amount} টাকা ব্যাংক থেকে উত্তোলন"],
    journal: [{ account: "Cash", side: "debit" }, { account: "Bank", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [3000, 40000],
  },
  medium_credit_sale: {
    category: "revenue", difficulty: "medium",
    patterns: ["{name} এর নিকট {amount} টাকার {item} বিক্রয়", "{amount} টাকার {item} {name} এর নিকট বিক্রয়"],
    itemPool: ["পণ্য", "Mobile", "Computer", "Book", "Furniture", "TV", "Table"],
    journal: [{ account: "Accounts Receivable", side: "debit" }, { account: "Sales Revenue", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [10000, 90000], useName: true,
  },
  medium_credit_purchase: {
    category: "liability", difficulty: "medium",
    patterns: ["{name} এর নিকট হতে {amount} টাকার {item} ক্রয়", "{name} থেকে {amount} টাকায় {item} কেনা"],
    itemPool: ["মাল", "পণ্য", "পণ্যদ্রব্য", "Equipment", "Office Supplies", "Book", "Mobile"],
    journal: [{ account: "Inventory", side: "debit" }, { account: "Creditors", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [10000, 100000], useName: true,
  },
  medium_drawing: {
    category: "drawing", difficulty: "medium",
    patterns: ["মালিক {amount} টাকা উত্তোলন করেছেন", "{amount} টাকা উত্তোলন"],
    journal: [{ account: "Drawings", side: "debit" }, { account: "Cash", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [3000, 30000],
  },
  medium_capital_invest: {
    category: "capital", difficulty: "medium",
    patterns: ["মালিক {amount} টাকা নগদ বিনিয়োগ করেছেন", "{amount} টাকা নগদ বিনিয়োগ"],
    journal: [{ account: "Cash", side: "debit" }, { account: "Capital", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [10000, 100000],
  },
  depreciation: {
    category: "expense", difficulty: "hard",
    patterns: ["{asset} এর উপর {amount} টাকা অবচয় ধার্য", "{asset} এর অবচয় {amount} টাকা ধার্য"],
    assetPool: ["Table", "Equipment", "Computer", "Building", "Vehicle"],
    journal: [{ account: "Depreciation Expense", side: "debit" }, { account: "Accumulated Depreciation", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [2000, 30000],
  },
  bad_debts: {
    category: "expense", difficulty: "hard",
    patterns: ["{name} এর নিকট {amount} টাকা অনাদায়ী দেনা ধার্য", "{name} এর কাছ থেকে {amount} টাকা পাওয়া যাবে না"],
    journal: [{ account: "Bad Debts", side: "debit" }, { account: "Accounts Receivable", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [1000, 10000], useName: true,
  },
  prepaid_rent: {
    category: "asset", difficulty: "hard",
    patterns: ["অগ্রিম ভাড়া বাবদ {amount} টাকা সমন্বয়", "{amount} টাকা অগ্রিম ভাড়ার সমন্বয়"],
    journal: [{ account: "Rent", side: "debit" }, { account: "Prepaid Rent", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [5000, 40000],
  },
  accrued_revenue: {
    category: "revenue", difficulty: "hard",
    patterns: ["অর্জিত আয় বাবদ {amount} টাকা সমন্বয়", "{amount} টাকা অর্জিত কিন্তু অপ্রাপ্ত আয়"],
    journal: [{ account: "Accounts Receivable", side: "debit" }, { account: "Accrued Revenue", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [10000, 70000],
  },
  loan_received: {
    category: "liability", difficulty: "hard",
    patterns: ["{name} এর কাছ থেকে {amount} টাকা ঋণ গ্রহণ", "{name} থেকে {amount} টাকা ঋণ নেওয়া"],
    journal: [{ account: "Cash", side: "debit" }, { account: "Loan", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [10000, 100000], useName: true,
  },
  salary_payable_adj: {
    category: "liability", difficulty: "hard",
    patterns: ["বকেয়া বেতন {amount} টাকা সমন্বয়", "{amount} টাকা বকেয়া বেতন হিসাবে ধার্য"],
    journal: [{ account: "Salary", side: "debit" }, { account: "Salary Payable", side: "credit" }],
    primaryAccountIndex: 1, hasAmount: true, amountRange: [8000, 50000],
  },
  interest_expense_adj: {
    category: "expense", difficulty: "hard",
    patterns: ["ব্যাংক ঋণের {amount} টাকা সুদ বকেয়া সমন্বয়", "{amount} টাকা সুদ খরচ বকেয়া ধার্য"],
    journal: [{ account: "Interest Expense", side: "debit" }, { account: "Interest Payable", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [2000, 15000],
  },
  drawings_goods_adj: {
    category: "drawing", difficulty: "hard",
    patterns: ["মালিক {amount} টাকার পণ্য উত্তোলন করেছেন", "{amount} টাকা মূল্যের পণ্য উত্তোলন"],
    journal: [{ account: "Drawings", side: "debit" }, { account: "Inventory", side: "credit" }],
    primaryAccountIndex: 0, hasAmount: true, amountRange: [5000, 25000],
  },
};

// --------------------------------------------
// 3. TEMPLATE SELECTION (Diversity)
// --------------------------------------------

let recentCategories = [];
const MAX_RECENT_CATEGORIES = 15;

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

function getCategoryWeight(category, smartBias) {
  const baseWeight = smartBias && smartBias[category] ? smartBias[category] : 1;
  const recentCount = recentCategories.filter((c) => c === category).length;
  let penalty = 1;
  if (recentCount >= 3) penalty = 0.2;
  else if (recentCount >= 2) penalty = 0.4;
  else if (recentCount >= 1) penalty = 0.7;
  if (recentCategories.length > 0 && recentCategories[recentCategories.length - 1] === category) {
    penalty *= 0.3;
  }
  return Math.max(0.1, baseWeight * penalty);
}

function pickTemplateWithDiversity(mode, smartBias) {
  const available = getAvailableTemplates(mode);
  if (available.length === 0) {
    const fallback = Object.entries(TEMPLATE_DEFINITIONS).find(([k, d]) => d.difficulty === mode);
    if (fallback) {
      const [key, def] = fallback;
      return { key, def, hasAmount: mode !== "easy" ? def.hasAmount || false : false, amountRange: mode !== "easy" ? def.amountRange || null : null };
    }
    const assetDef = TEMPLATE_DEFINITIONS.asset_purchase;
    return { key: "asset_purchase", def: assetDef, hasAmount: false, amountRange: null };
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

// --------------------------------------------
// 4. TRANSACTION GENERATOR
// --------------------------------------------

function generateTransactionFromTemplate(templateInfo, mode) {
  const def = templateInfo.def;
  const hasAmount = templateInfo.hasAmount && mode !== "easy";
  const amountRange = templateInfo.amountRange;
  let amount = 0;
  if (hasAmount && amountRange) amount = getAmount(amountRange);
  const pattern = pickRandom(def.patterns);
  let asset = "", expense = "", liability = "", item = "";
  let name = "";
  const useName = def.useName || false;
  if (useName) name = getRandomName();
  if (def.assetPool) asset = pickRandom(def.assetPool);
  if (def.expensePool) expense = pickRandom(def.expensePool);
  if (def.liabilityPool) liability = pickRandom(def.liabilityPool);
  if (def.itemPool) item = pickRandom(def.itemPool);
  let desc = pattern;
  if (asset) desc = desc.replace(/{asset}/g, getBengaliName(asset) || asset);
  if (expense) desc = desc.replace(/{expense}/g, getBengaliName(expense) || expense);
  if (liability) desc = desc.replace(/{liability}/g, getBengaliName(liability) || liability);
  if (item) desc = desc.replace(/{item}/g, getBengaliName(item) || item);
  if (name) desc = desc.replace(/{name}/g, name);
  if (hasAmount && amount) desc = desc.replace(/{amount}/g, amount.toLocaleString());
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
  const primaryIdx = def.primaryAccountIndex !== undefined ? def.primaryAccountIndex : 0;
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

// --------------------------------------------
// 5. SMART TRACKER
// --------------------------------------------

const SMART_TRACKER = {
  categoryCounts: {},
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  baseMode: "easy",
  smartDifficulty: "easy",
  isSmartMode: false,
  lastModeChange: 0,

  update(category, isCorrect, mode) {
    if (!this.categoryCounts[category]) this.categoryCounts[category] = { total: 0, correct: 0 };
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
    const cats = ["asset", "liability", "capital", "revenue", "expense", "drawing"];
    for (const cat of cats) {
      if (this.categoryCounts[cat] && this.categoryCounts[cat].total > 0) {
        const acc = this.categoryCounts[cat].correct / this.categoryCounts[cat].total;
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

// --------------------------------------------
// 6. QUIZ UI HELPERS
// --------------------------------------------

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
  const modeInfo = { easy: "সরল লেনদেন", medium: "বাস্তব লেনদেন", hard: "উন্নত লেনদেন" };
  label.textContent = modeInfo[mode] || "সরল লেনদেন";
}

function showModeChangeToast(newMode) {
  const modeNames = { easy: "Easy", medium: "Medium", hard: "Hard" };
  const modeDesc = { easy: "সরল লেনদেন", medium: "বাস্তব লেনদেন", hard: "উন্নত লেনদেন" };
  showToast(`🔄 Smart Mode: ${modeNames[newMode]}`, `Level switched to ${modeNames[newMode]} — ${modeDesc[newMode]}`, "fa-arrow-right", "gain");
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
  const disabled = state.revisionMode || state.timerMode || (state.timerMode && state.difficulty !== "easy" && state.stats.hearts <= 0);
  if (hints > 0 && !disabled) {
    hintBtn.disabled = false;
    hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Use Hint <span class="hint-count">${hints}</span>`;
  } else {
    hintBtn.disabled = true;
    hintBtn.innerHTML = disabled ? `<i class="fas fa-lightbulb"></i> Not Available` : `<i class="fas fa-lightbulb"></i> No Hints`;
  }
  const hintCountDisplay = document.getElementById("hintCountDisplay");
  if (hintCountDisplay) hintCountDisplay.textContent = hints;
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
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
      if (t.classList.contains("active")) dot.style.background = "var(--accent-1)";
      else dot.style.background = "var(--text-muted)";
    }
  });
}

// --------------------------------------------
// 7. TIMER
// --------------------------------------------

function startTimer() {
  stopTimer();
  if (!state.timerMode || state.difficulty === "easy" || state.stats.hearts <= 0) return;
  state.timerActive = true;
  state.timerRemaining = state.timerSec;
  const timerCountdown = document.getElementById("timerCountdown");
  const timerDisplay = document.getElementById("timerDisplay");

  state.timerInterval = setInterval(() => {
    state.timerRemaining -= 0.5;
    if (timerCountdown) timerCountdown.textContent = Math.ceil(state.timerRemaining);
    if (timerDisplay && state.timerRemaining <= 2) timerDisplay.classList.add("warning");
    else if (timerDisplay) timerDisplay.classList.remove("warning");
    if (state.timerRemaining <= 0) {
      stopTimer();
      if (!state.answered && state.stats.hearts > 0) {
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
  if (timerDisplay) timerDisplay.classList.remove("warning");
}

function handleTimerTimeout() {
  if (state.answered) return;
  state.answered = true;
  state.userAnswer = "timeout";

  const q = state.currentQuestion;
  const s = state.stats;

  if (state.timerMode && state.difficulty !== "easy") {
    loseHeart();
    if (s.hearts <= 0) return;
  }

  s.wrong++;
  const boosters = getBoosters();
  if (boosters.streakActive) {
    s.noStreakBreakRemaining--;
    showToast("🛡️ Streak Protected!", `${s.noStreakBreakRemaining} protections left.`, "fa-shield", "gain");
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
    type: q.accountType, effect: q.effect, account: q.accountName,
    userAnswer: "timeout", correctAnswer: q.correctAnswer,
    ruleKey: `${q.accountType}.${q.effect}`, timestamp: Date.now(),
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

// --------------------------------------------
// 8. FEEDBACK
// --------------------------------------------

function showFeedback(isCorrect, q, journal, trans) {
  const box = document.getElementById("feedbackBox");
  if (!box) return;

  const isTimeout = state.userAnswer === "timeout";
  const isCorrectFinal = isCorrect && !isTimeout;
  const isWrongFinal = !isCorrect || isTimeout;

  box.className = "feedback-box show " + (isCorrectFinal ? "correct" : "wrong");

  const icon = document.getElementById("fbIcon");
  if (icon) icon.className = "fas " + (isCorrectFinal ? "fa-check-circle" : isTimeout ? "fa-hourglass-end" : "fa-times-circle");

  const resultEl = document.getElementById("fbResult");
  if (resultEl) {
    if (isTimeout) {
      resultEl.textContent = "⏱ Time's Up!";
      resultEl.className = "fb-result wrong-text";
    } else {
      resultEl.textContent = isCorrectFinal ? "Correct!" : "Wrong!";
      resultEl.className = "fb-result " + (isCorrectFinal ? "correct-text" : "wrong-text");
    }
  }

  const accountForQuestion = trans.primaryAccount || q.accountName;
  const entry = journal.find((j) => j.account === accountForQuestion);

  let explanation = "", ruleText = "";
  const detailEl = document.getElementById("fbDetail");
  const ruleBox = document.getElementById("fbRuleBox");

  if (entry) {
    const info = getAccountInfo(entry.account);
    const category = info ? info.category : "Account";
    const label = ACCOUNT_RULES[category] ? ACCOUNT_RULES[category].label : category;
    const side = entry.side === "debit" ? "ডেবিট" : "ক্রেডিট";
    const sideLabel = entry.side === "debit" ? "Debit" : "Credit";
    const bnName = getBengaliName(entry.account) || entry.account;
    const amtStr = trans && trans.amount && trans.hasAmount ? ` ${trans.amount.toLocaleString()} টাকা` : "";
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
      explanation = isCorrectFinal ? q.explanation || "সঠিক উত্তর!" : `সঠিক উত্তর ছিল <strong>${correctAns}</strong>।\n${q.explanation || "Review the accounting rules."}`;
    }
    ruleText = q.ruleText || "Check the rule.";
  }

  if (detailEl) detailEl.innerHTML = explanation;
  if (ruleBox) ruleBox.innerHTML = `<strong>Rule:</strong> ${ruleText}`;

  $$(".quiz-opt").forEach((b) => {
    b.disabled = true;
    if (b.dataset.answer === q.correctAnswer) b.classList.add("show-correct");
    if (b.dataset.answer === q.correctAnswer && isCorrectFinal) b.classList.add("correct");
    if (b.dataset.answer !== q.correctAnswer && !isCorrectFinal && b.dataset.answer === state.userAnswer) b.classList.add("wrong");
    if (b.dataset.answer === q.correctAnswer && !isCorrectFinal) b.classList.add("show-correct");
    if (isTimeout && b.dataset.answer === q.correctAnswer) b.classList.add("show-correct");
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

// --------------------------------------------
// 9. ADVANCE QUESTION
// --------------------------------------------

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
    state.advancePending = false;
    generateNextQuestionSet();
  }
}

// --------------------------------------------
// 10. GENERATE NEXT QUESTION
// --------------------------------------------

function generateNextQuestionSet() {
  stopTimer();

  const mode = state.difficulty;

  if (state.timerMode && state.difficulty !== "easy" && state.stats.hearts <= 0) {
    renderNoHeartsState();
    return;
  }

  if (state.revisionMode) {
    if (state.revisionQueue.length > 0) {
      const revData = state.revisionQueue.shift();
      const docId = revData.docId;
      const qData = revData.question;
      const transData = revData.transaction;
      const journalData = revData.journal || [];

      let transaction = {
        description: transData.display || transData.description || "Transaction",
        amount: transData.amount || 0,
        hasAmount: transData.amount > 0,
        journal: journalData,
        category: qData.accountType || "asset",
        primaryAccount: qData.accountName || (journalData[0] ? journalData[0].account : ""),
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
      showToast("Revision Complete", "All revision questions answered!", "fa-check-circle", "gain");
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
    if (indicator) indicator.textContent = `Adaptive: ${effectiveMode.toUpperCase()}`;
    updateDifficultyButtons(effectiveMode);
    updateSmartBadge(effectiveMode);
    state.difficulty = effectiveMode;
  }

  const templateInfo = pickTemplateWithDiversity(effectiveMode, smartBias);
  const transaction = generateTransactionFromTemplate(templateInfo, effectiveMode);

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
  if (categoryType === "asset" || categoryType === "expense" || categoryType === "drawing") {
    effect = isDebit ? "increase" : "decrease";
  } else if (categoryType === "liability" || categoryType === "capital" || categoryType === "revenue") {
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

// --------------------------------------------
// 11. RENDER QUESTION
// --------------------------------------------

function renderQuestion() {
  const q = state.currentQuestion;
  const transactionDisplay = document.getElementById("transactionDisplay");
  const accountName = document.getElementById("accountName");

  if (state.timerMode && state.difficulty !== "easy" && state.stats.hearts <= 0) {
    renderNoHeartsState();
    return;
  }

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

  if (state.timerMode && state.difficulty !== "easy") {
    checkHeartRefill();
    if (state.stats.hearts > 0) {
      const timerDisplay = document.getElementById("timerDisplay");
      const timerCountdown = document.getElementById("timerCountdown");
      if (timerDisplay) {
        timerDisplay.classList.add("show");
        timerDisplay.classList.remove("warning");
      }
      if (timerCountdown) timerCountdown.textContent = state.timerSec;
      state.timerRemaining = state.timerSec;
      startTimer();
    } else {
      renderNoHeartsState();
      return;
    }
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
    if (state.smartMode) btn.classList.add("diff-toggle-disabled");
    else btn.classList.remove("diff-toggle-disabled");
    if (state.timerMode && btn.dataset.diff === "easy") btn.classList.add("diff-toggle-disabled");
    else if (state.timerMode) btn.classList.remove("diff-toggle-disabled");
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

// --------------------------------------------
// 12. HANDLE ANSWER
// --------------------------------------------

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

  if (isTimerMode && s.hearts <= 0) {
    renderNoHeartsState();
    return;
  }

  const boosters = getBoosters();

  const rewards = getRewards(
    state.difficulty,
    isCorrect,
    isRevision,
    isTimerMode,
    state.timerSec,
    boosters
  );

  const elapsed = (Date.now() - state.questionStartTime) / 1000;
  if (elapsed <= 3) s.fastAnswers = (s.fastAnswers || 0) + 1;
  s.sessionQuestions = (s.sessionQuestions || 0) + 1;

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) s.nightQuestions = (s.nightQuestions || 0) + 1;
  if (hour >= 6 && hour < 9) s.earlyQuestions = (s.earlyQuestions || 0) + 1;

  const today = new Date().toDateString();
  if (s.lastActivityDate !== today) {
    if (s.lastActivityDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (s.lastActivityDate === yesterday.toDateString()) s.dailyStreak = (s.dailyStreak || 0) + 1;
      else s.dailyStreak = 1;
    } else s.dailyStreak = 1;
    s.lastActivityDate = today;
  }

  let pointsChanged = 0, xpChanged = 0, coinsChanged = 0, rubiesChanged = 0;

  const topicType = q.accountType || "asset";
  if (s.topicStats && s.topicStats[topicType]) {
    s.topicStats[topicType].total++;
    if (!isCorrect) s.topicStats[topicType].wrong++;
  }

  if (isTimerMode && !isCorrect) {
    s.timerWrongCount = (s.timerWrongCount || 0) + 1;
    if (s.timerWrongCount >= 3) {
      loseHeart();
      s.timerWrongCount = 0;
      if (s.hearts <= 0) return;
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
      if (last && last.userAnswer !== last.correctAnswer) s.ruleBreakerCount = (s.ruleBreakerCount || 0) + 1;
    }
    if (coinsChanged > 0) showCoinToast(coinsChanged);
    if (rubiesChanged > 0) showRubyToast(rubiesChanged);

    if (isTimerMode) {
      s.timerQuestionsCompleted = (s.timerQuestionsCompleted || 0) + 1;
      if (state.timerSec === 5) s.timer5sCompleted = (s.timer5sCompleted || 0) + 1;
      else if (state.timerSec === 10) s.timer10sCompleted = (s.timer10sCompleted || 0) + 1;
    }
  } else {
    s.wrong++;
    if (boosters.streakActive) {
      s.noStreakBreakRemaining--;
      showToast("🛡️ Streak Protected!", `${s.noStreakBreakRemaining} protections left.`, "fa-shield", "gain");
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
      await saveRevisionQuestion(q, state.currentTransaction, state.currentJournal);
      await updateRevisionBadges();
    }
  }

  s.totalQuestions++;
  if (s.points < 0) s.points = 0;

  const newLevel = getLevelFromXP(s.xp);
  const oldLevel = s.level || 1;
  s.level = newLevel;
  if (newLevel > oldLevel) {
    setTimeout(() => showToast("Level Up!", `You are now Level ${newLevel}`, "fa-trophy", "gain"), 300);
  }

  s.quizHistory.push({
    type: q.accountType, effect: q.effect, account: q.accountName,
    userAnswer: answer, correctAnswer: q.correctAnswer,
    ruleKey: `${q.accountType}.${q.effect}`, timestamp: Date.now(),
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
  for (const id of earnedIds) state._shownBadges.add(id);

  s.focusCount = (s.focusCount || 0) + 1;

  saveStats();

  updateHeaderStats();
  updateQuizProgress();

  let toastTitle = isCorrect ? "Correct!" : "Wrong!";
  let toastIcon = isCorrect ? "fa-check-circle" : "fa-times-circle";
  let toastType = isCorrect ? "gain" : "loss";
  let descParts = [];
  if (pointsChanged > 0) descParts.push(`<span class="highlight-gain">+${pointsChanged} pts</span>`);
  else if (pointsChanged < 0) descParts.push(`<span class="highlight-loss">${pointsChanged} pts</span>`);
  if (xpChanged > 0) descParts.push(`<span class="highlight-gain">+${xpChanged} XP</span>`);
  if (coinsChanged > 0) descParts.push(`<span class="highlight-coin">+${coinsChanged} 🪙</span>`);
  if (rubiesChanged > 0) descParts.push(`<span class="highlight-ruby">+${rubiesChanged} 💎</span>`);
  const desc = descParts.length > 0 ? descParts.join(" · ") : isCorrect ? "Good job!" : "Keep practicing!";
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

// --------------------------------------------
// 13. HINT
// --------------------------------------------

function useHint() {
  if (state.answered || !state.currentQuestion) {
    showToast("Hint Not Available", "Answer the current question first.", "fa-exclamation-circle", "loss");
    return;
  }
  if (state.revisionMode || state.timerMode || (state.timerMode && state.difficulty !== "easy" && state.stats.hearts <= 0)) {
    showToast("Hint Disabled", "Hints are not available in Revision, Timer Mode, or when no hearts.", "fa-exclamation-circle", "loss");
    return;
  }
  if (state.stats.hints <= 0) {
    showToast("No Hints", "You have no hints. Buy more in the Shop!", "fa-exclamation-circle", "loss");
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

// --------------------------------------------
// 14. SETUP QUIZ EVENT LISTENERS
// --------------------------------------------

function setupQuizEventListeners() {
  // Difficulty buttons
  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (state.smartMode) {
        showToast("Smart Mode Active", "Difficulty is auto-adjusted in Smart Mode.", "fa-brain", "gain");
        return;
      }
      if (state.timerMode && this.dataset.diff === "easy") {
        showToast("Timer Mode", "Timer Mode only supports Medium and Hard.", "fa-hourglass-half", "gain");
        return;
      }
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("active"));
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

  // Answer buttons
  document.querySelectorAll(".quiz-opt").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (state.answered) return;
      handleAnswer(this.dataset.answer);
    });
  });

  // Hint button
  document.getElementById("hintBtn").addEventListener("click", useHint);

  // Next button fallback
  document.getElementById("nextBtnFallback").addEventListener("click", function () {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
    this.classList.remove("show");
    const autoNext = document.getElementById("autoNextIndicator");
    if (autoNext) autoNext.classList.remove("show");
    advanceQuestion();
  });

  // Smart Mode toggle
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }

    state.smartMode = !state.smartMode;
    this.classList.toggle("active");
    const dot = this.querySelector(".toggle-dot");
    if (dot) dot.style.background = state.smartMode ? "var(--accent-1)" : "var(--text-muted)";
    SMART_TRACKER.isSmartMode = state.smartMode;

    if (state.smartMode) {
      SMART_TRACKER.baseMode = state.difficulty;
      SMART_TRACKER.smartDifficulty = state.difficulty;
      if (state.stats.smartCategoryData) SMART_TRACKER.categoryCounts = state.stats.smartCategoryData;
      if (state.stats.effectiveDifficulty) SMART_TRACKER.smartDifficulty = state.stats.effectiveDifficulty;
      state.stats.smartModeCount = (state.stats.smartModeCount || 0) + 1;
      showToast("Smart Mode On", "Adaptive learning activated. Difficulty auto-adjusts based on performance.", "fa-brain", "gain");
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
      showToast("Smart Mode Off", "Switched to manual difficulty control.", "fa-brain", "gain");
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

  // Revision Mode toggle
  document.getElementById("revisionToggle").addEventListener("click", async function () {
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
    }

    const count = await getRevisionCount();
    if (count === 0) {
      showToast("No Revision", "No wrong answers to revise.", "fa-info-circle", "gain");
      return;
    }
    state.revisionMode = !state.revisionMode;
    this.classList.toggle("active");
    const dot = this.querySelector(".toggle-dot");
    if (dot) dot.style.background = state.revisionMode ? "var(--accent-1)" : "var(--text-muted)";
    if (state.revisionMode) {
      await loadRevisionQueue();
      if (state.revisionQueue.length === 0) {
        state.revisionMode = false;
        this.classList.remove("active");
        if (dot) dot.style.background = "var(--text-muted)";
        showToast("No Revision", "No revision questions available.", "fa-info-circle", "gain");
        return;
      }
      showToast("Revision Mode On", `${state.revisionQueue.length} questions to revise.`, "fa-rotate-left", "gain");
    } else {
      state.revisionQueue = [];
      state.isRevisionQuestion = false;
      state.currentRevisionDocId = null;
      showToast("Revision Mode Off", "Switched to regular mode.", "fa-info-circle", "gain");
    }
    updateModeToggles();
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
    generateNextQuestionSet();
  });

  // Timer Mode toggle
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
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("diff-toggle-disabled"));
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
      showToast("Timer Mode", "Timer Mode requires Medium or Hard difficulty. Switching to Medium.", "fa-hourglass-half", "gain");
      state.difficulty = "medium";
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("active"));
      document.querySelector(".diff-btn.medium").classList.add("active");
      SMART_TRACKER.baseMode = "medium";
      SMART_TRACKER.smartDifficulty = "medium";
      updateDiffModeLabel("medium");
    }

    state.timerMode = !state.timerMode;
    this.classList.toggle("active");
    const dot = this.querySelector(".toggle-dot");
    if (dot) dot.style.background = state.timerMode ? "var(--accent-1)" : "var(--text-muted)";

    if (state.timerMode) {
      state.stats.timerWrongCount = 0;
      document.getElementById("timerOptions").classList.add("show");
      showToast("Timer Mode On", `⏱ ${state.timerSec}s per question. Medium & Hard only.`, "fa-hourglass-half", "gain");
      document.querySelectorAll(".diff-btn").forEach((b) => {
        if (b.dataset.diff === "easy") b.classList.add("diff-toggle-disabled");
        else b.classList.remove("diff-toggle-disabled");
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
      if (state.stats.hearts <= 0) {
        renderNoHeartsState();
        startHeartCountdown();
      } else {
        generateNextQuestionSet();
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
      stopHeartCountdown();
      state.stats.heartsRefillPending = false;
      state.stats.heartsEmptySince = null;
      showToast("Timer Mode Off", "Timer disabled.", "fa-hourglass-half", "gain");
      generateNextQuestionSet();
    }
    updateModeToggles();
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
  });

  // Timer options
  document.querySelectorAll(".timer-opt").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (!state.timerMode) {
        showToast("Timer Mode Off", "Enable Timer Mode first.", "fa-hourglass-half", "gain");
        return;
      }
      document.querySelectorAll(".timer-opt").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      state.timerSec = parseInt(this.dataset.timer);
      const timerBadge = document.getElementById("timerBadge");
      if (timerBadge) timerBadge.textContent = `⏱ ${state.timerSec}s`;
      showToast("Timer Set", `${state.timerSec} seconds per question.`, "fa-clock", "gain");
      if (state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
      generateNextQuestionSet();
    });
  });
}