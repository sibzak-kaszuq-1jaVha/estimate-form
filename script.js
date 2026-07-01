let PRICE_TABLE = null;
let priceTableLoadError = "";
const PRICES_JSON_URL = "./prices.json";
const SCHEDULE_CONFIG_URL = "./schedule-config.json";
let scheduleConfig = { startDate: "" };

const GOOGLE_FORM_URL = "https://forms.gle/Uaienez6aJw63dor7";
const LIVE2D_CAMPAIGN = {
  enabled: true,
  priceMultiplier: 0.4,
  hideHighLevelOptions: true
};
const LIVE2D_DEFAULT_ALL_CHECKED = true;
const DEFAULT_TOP_CATEGORY_KEY = "loop_animation";
let lastTopCategoryKey = "";

const REQUEST_TREE = [
  {
    key: "bg_illust",
    label: "背景あり1枚絵",
    children: [
      {
        key: "render_bg",
        label: "背景重視",
        children: [
          { key: "size_bust", label: "バストアップ" },
          { key: "size_full", label: "全身" }
        ]
      },
      {
        key: "render_char",
        label: "キャラ重視",
        children: [
          { key: "size_bust", label: "バストアップ" },
          { key: "size_full", label: "全身" }
        ]
      }
    ]
  },
  {
    key: "standing",
    label: "立ち絵",
    children: [
      {
        key: "standing_keyvisual",
        label: "Vtuber向けキービジュアル",
        children: [
          {
            key: "standing_char_new",
            label: "新規デザイン",
            children: [
              { key: "three_yes", label: "必要" },
              { key: "three_no", label: "不要" }
            ]
          },
          {
            key: "standing_char_diff",
            label: "差分（新衣装など）",
            children: [
              { key: "three_yes", label: "必要" },
              { key: "three_no", label: "不要" }
            ]
          }
        ]
      },
      {
        key: "standing_char_design",
        label: "キャラデザ",
        children: [
          {
            key: "standing_char_new",
            label: "新規デザイン",
            children: [
              { key: "three_yes", label: "必要" },
              { key: "three_no", label: "不要" }
            ]
          },
          {
            key: "standing_char_diff",
            label: "差分（新衣装など）",
            children: [
              { key: "three_yes", label: "必要" },
              { key: "three_no", label: "不要" }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "live2d_model",
    label: "Live2Dモデル"
  },
  {
    key: "loop_animation",
    label: "ループアニメーション",
    children: [
      { key: "loop_waiting", label: "待機画面" },
      { key: "loop_asset_mic", label: "マイクアセット", showLoopDiff: true },
      { key: "loop_asset_other", label: "その他 アクセサリー等アセット", showLoopDiff: true }
    ]
  }
];

const levelIds = ["requestLevel1", "requestLevel2", "requestLevel3", "requestLevel4", "requestLevel5"];
const rowIds = ["requestLevel2Row", "requestLevel3Row", "requestLevel4Row", "requestLevel5Row"];
const selects = levelIds.map((id) => document.getElementById(id));
const rows = rowIds.map((id) => document.getElementById(id));

const live2dChecksRow = document.getElementById("live2dChecksRow");
const partsCountRow = document.getElementById("partsCountRow");
const loopRichnessRow = document.getElementById("loopRichnessRow");
const loopTrackingRow = document.getElementById("loopTrackingRow");
const diffRow = document.getElementById("diffRow");
const estimateTotal = document.getElementById("estimateTotal");
const estimateDelivery = document.getElementById("estimateDelivery");
const estimateStartDate = document.getElementById("estimateStartDate");
const estimateDueDate = document.getElementById("estimateDueDate");
const breakdownList = document.getElementById("breakdownList");
const inquiryBody = document.getElementById("inquiryBody");
const copyButton = document.getElementById("copyButton");
const copyStatus = document.getElementById("copyStatus");
const googleFormLink = document.getElementById("googleFormLink");
const confirmWarning = document.getElementById("confirmWarning");
const live2dLimitedBanner = document.getElementById("live2dLimitedBanner");
const live2dLimitedNote = document.getElementById("live2dLimitedNote");
const bgIllustReference = document.getElementById("bgIllustReference");
const requestLevel2Label = document.getElementById("requestLevel2Label");
const requestLevel3Label = document.getElementById("requestLevel3Label");
const requestLevel4Label = document.getElementById("requestLevel4Label");
const requestLevel5Label = document.getElementById("requestLevel5Label");
const freeMemo = document.getElementById("freeMemo");
const paymentMethod = document.getElementById("paymentMethod");
const paymentNoticeRow = document.getElementById("paymentNoticeRow");
const confirmDepositPolicy = document.getElementById("confirmDepositPolicy");
const partsCountChoice = document.getElementById("partsCountChoice");

const LEVEL_LABELS_BY_CATEGORY = {
  bg_illust: ["描き込み重視", "サイズ、範囲", "追加詳細", "最終詳細"],
  standing: ["依頼内容", "目的", "三面図要否", "最終詳細"],
  live2d_model: ["依頼内容", "目的", "差分数", "最終詳細"],
  loop_animation: ["依頼内容", "目的", "差分数", "最終詳細"]
};
const DEFAULT_SELECTIONS_BY_CATEGORY = {
  bg_illust: ["render_char", "size_full"],
  standing: ["standing_keyvisual", "standing_char_new", "three_no"],
  loop_animation: ["loop_asset_mic"]
};

function yen(v) {
  return `¥${Math.round(v).toLocaleString("ja-JP")}`;
}

function getInt(id) {
  const raw = Number.parseInt(document.getElementById(id).value, 10);
  return Number.isNaN(raw) || raw < 0 ? 0 : raw;
}

function weeksToLabel(weeks) {
  const rounded = Math.max(1, Math.round(weeks));
  const months = Math.floor(rounded / 4);
  const rest = rounded % 4;
  if (months > 0 && rest > 0) return `${months}ヶ月 + ${rest}週間`;
  if (months > 0) return `${months}ヶ月`;
  return `${rest}週間`;
}

function parseDateInput(value) {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateWithYear(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateWithoutYear(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateRange(startDate, endDate) {
  const startLabel = formatDateWithYear(startDate);
  const endLabel =
    startDate.getFullYear() === endDate.getFullYear()
      ? formatDateWithoutYear(endDate)
      : formatDateWithYear(endDate);
  return `${startLabel}~${endLabel}ごろ`;
}

function getScheduleRange(estimateWeeks) {
  const startDate = parseDateInput(scheduleConfig.startDate);
  if (!startDate) {
    return { startLabel: "-", dueLabel: "-" };
  }
  const startRangeEnd = addDays(startDate, 6);
  const deliveryDays = Math.max(1, Math.round(estimateWeeks || 0)) * 7;
  const dueRangeStart = addDays(startDate, deliveryDays);
  const dueRangeEnd = addDays(startRangeEnd, deliveryDays);
  return {
    startLabel: formatDateRange(startDate, startRangeEnd),
    dueLabel: formatDateRange(dueRangeStart, dueRangeEnd)
  };
}

function fillSelect(selectEl, nodes) {
  selectEl.textContent = "";
  nodes.forEach((node) => {
    const op = document.createElement("option");
    op.value = node.key;
    op.textContent = node.label;
    selectEl.appendChild(op);
  });
}

function findNodeByKey(nodes, key) {
  return nodes.find((n) => n.key === key) || null;
}

function getPath() {
  const path = [];
  let nodes = REQUEST_TREE;
  for (let i = 0; i < selects.length; i += 1) {
    const key = selects[i].value;
    if (!key) break;
    const node = findNodeByKey(nodes, key);
    if (!node) break;
    path.push(node);
    nodes = node.children || [];
  }
  return path;
}

function hideFrom(rowStartIndex) {
  for (let i = rowStartIndex; i < rows.length; i += 1) {
    rows[i].classList.add("hidden");
    fillSelect(selects[i + 1], []);
  }
}

function childrenAtLevel(levelIndex) {
  let nodes = REQUEST_TREE;
  for (let i = 0; i < levelIndex; i += 1) {
    const key = selects[i].value;
    if (!key) return [];
    const node = findNodeByKey(nodes, key);
    if (!node) return [];
    nodes = node.children || [];
  }
  return nodes;
}

function refreshHierarchyFrom(changedSelectIndex) {
  hideFrom(changedSelectIndex);
  for (let level = changedSelectIndex + 1; level < selects.length; level += 1) {
    const nodes = childrenAtLevel(level);
    if (!nodes.length) break;
    const rowIndex = level - 1;
    rows[rowIndex].classList.remove("hidden");
    fillSelect(selects[level], nodes);
    if (!selects[level].value) break;
  }
}

function applyCategoryDefaults() {
  const topKey = selects[0].value;
  const defaults = DEFAULT_SELECTIONS_BY_CATEGORY[topKey];
  if (!defaults || !defaults.length) return;
  for (let i = 0; i < defaults.length; i += 1) {
    const levelIndex = i + 1;
    const selectEl = selects[levelIndex];
    const rowEl = rows[levelIndex - 1];
    if (!selectEl || (rowEl && rowEl.classList.contains("hidden"))) break;
    const targetValue = defaults[i];
    const hasTarget = Array.from(selectEl.options).some((option) => option.value === targetValue);
    if (!hasTarget) break;
    selectEl.value = targetValue;
    refreshHierarchyFrom(levelIndex);
  }
}

function updateLevelLabels() {
  const topKey = selects[0].value;
  const labels = LEVEL_LABELS_BY_CATEGORY[topKey] || ["依頼内容", "依頼詳細", "追加詳細", "最終詳細"];
  requestLevel2Label.textContent = labels[0];
  requestLevel3Label.textContent = labels[1];
  requestLevel4Label.textContent = labels[2];
  requestLevel5Label.textContent = labels[3];
}

function updateSpecialRows(path) {
  const topKey = path[0]?.key || "";
  const isLive2D = topKey === "live2d_model";
  const isLoopAnimation = topKey === "loop_animation";
  const enteredLive2D = isLive2D && lastTopCategoryKey !== "live2d_model";
  bgIllustReference.classList.toggle("hidden", topKey !== "bg_illust");
  live2dChecksRow.classList.toggle("hidden", !isLive2D);
  live2dLimitedBanner.classList.toggle("hidden", !(isLive2D && LIVE2D_CAMPAIGN.enabled));
  loopRichnessRow.classList.toggle("hidden", !isLoopAnimation);
  loopTrackingRow.classList.toggle("hidden", !isLoopAnimation);

  if (enteredLive2D && LIVE2D_DEFAULT_ALL_CHECKED) {
    document.getElementById("live2dCharDesign").checked = true;
    document.getElementById("live2dPartsDraft").checked = true;
    document.getElementById("live2dModeling").checked = true;
  }

  const anyLive2dChecked =
    document.getElementById("live2dCharDesign").checked ||
    document.getElementById("live2dPartsDraft").checked ||
    document.getElementById("live2dModeling").checked;
  partsCountRow.classList.toggle("hidden", !(isLive2D && anyLive2dChecked));

  const showLoopDiff = path.some((n) => n.showLoopDiff);
  const showLive2dDiff = isLive2D && anyLive2dChecked && !partsCountRow.classList.contains("hidden");
  const showDiff = showLoopDiff || showLive2dDiff;
  diffRow.classList.toggle("hidden", !showDiff);

  if (!isLive2D) {
    document.getElementById("live2dCharDesign").checked = false;
    document.getElementById("live2dPartsDraft").checked = false;
    document.getElementById("live2dModeling").checked = false;
    document.getElementById("partsCountChoice").value = "parts_30";
  }
  if (!isLoopAnimation) {
    document.getElementById("loopRichness").value = "loop_richness_mid";
    document.getElementById("loopTracking").value = "loop_tracking_no";
  }
  if (!showDiff) document.getElementById("diffCount").value = "0";
  lastTopCategoryKey = topKey;
}

function addLine(lines, label, value) {
  lines.push({ label, value });
}

function multiply(rule) {
  return rule || { price: 1, weeks: 1 };
}

function buildEstimate() {
  const path = getPath();
  updateSpecialRows(path);

  if (!PRICE_TABLE) {
    return {
      total: 0,
      weeks: 0,
      lines: [{ label: "料金表", value: priceTableLoadError || "prices.jsonを読み込めません" }],
      hasPriceTable: false
    };
  }

  const topKey = path[0]?.key;
  const base = PRICE_TABLE.base[topKey];
  if (!base) {
    return { total: 0, weeks: 0, lines: [] };
  }

  let price = base.price;
  let weeks = base.weeks;
  const lines = [];
  const levelLabels = LEVEL_LABELS_BY_CATEGORY[topKey] || ["依頼内容", "依頼詳細", "追加詳細", "最終詳細"];
  addLine(lines, "依頼カテゴリ", path[0].label);

  path.forEach((node, index) => {
    if (index === 0) return;
    const rule = multiply(PRICE_TABLE.multipliers[node.key]);
    price *= rule.price;
    weeks *= rule.weeks;
    const levelName = levelLabels[index - 1] || `階層${index + 1}`;
    addLine(lines, levelName, `${node.label}（料金×${rule.price} / 納期×${rule.weeks}）`);
  });

  if (!live2dChecksRow.classList.contains("hidden")) {
    if (document.getElementById("live2dCharDesign").checked) {
      const r = multiply(PRICE_TABLE.multipliers.live2d_char_design);
      price *= r.price;
      weeks *= r.weeks;
      addLine(lines, "依頼内容: キャラデザ", `料金×${r.price} / 納期×${r.weeks}`);
    }
    if (document.getElementById("live2dPartsDraft").checked) {
      const r = multiply(PRICE_TABLE.multipliers.live2d_parts_draft);
      price *= r.price;
      weeks *= r.weeks;
      addLine(lines, "依頼内容: パーツ分け原画", `料金×${r.price} / 納期×${r.weeks}`);
    }
    if (document.getElementById("live2dModeling").checked) {
      const r = multiply(PRICE_TABLE.multipliers.live2d_modeling);
      price *= r.price;
      weeks *= r.weeks;
      addLine(lines, "依頼内容: モデリング", `料金×${r.price} / 納期×${r.weeks}`);
    }
    if (!partsCountRow.classList.contains("hidden")) {
      const pKey = document.getElementById("partsCountChoice").value;
      const pRule = multiply(PRICE_TABLE.multipliers[pKey]);
      const pLabel = document.getElementById("partsCountChoice").selectedOptions[0].textContent;
      price *= pRule.price;
      weeks *= pRule.weeks;
      addLine(lines, "目的", `稼働レベル: ${pLabel}（料金×${pRule.price} / 納期×${pRule.weeks}）`);
    }
  }

  if (!loopRichnessRow.classList.contains("hidden")) {
    const richnessKey = document.getElementById("loopRichness").value;
    const richnessRule = multiply(PRICE_TABLE.multipliers[richnessKey]);
    const richnessLabel = document.getElementById("loopRichness").selectedOptions[0].textContent;
    price *= richnessRule.price;
    weeks *= richnessRule.weeks;
    addLine(lines, `リッチさ: ${richnessLabel}`, `料金×${richnessRule.price} / 納期×${richnessRule.weeks}`);
  }

  if (!loopTrackingRow.classList.contains("hidden")) {
    const trackingKey = document.getElementById("loopTracking").value;
    const trackingRule = multiply(PRICE_TABLE.multipliers[trackingKey]);
    const trackingLabel = document.getElementById("loopTracking").selectedOptions[0].textContent;
    price *= trackingRule.price;
    weeks *= trackingRule.weeks;
    addLine(lines, `Live2Dトラッキング: ${trackingLabel}`, `料金×${trackingRule.price} / 納期×${trackingRule.weeks}`);
  }

  if (!diffRow.classList.contains("hidden")) {
    const diff = getInt("diffCount");
    if (diff > 0) {
      const isLoop = path.some((n) => n.showLoopDiff);
      const add = isLoop ? PRICE_TABLE.additions.loopDiffEach : PRICE_TABLE.additions.live2dDiffEach;
      price += add.price * diff;
      weeks += add.weeks * diff;
      addLine(lines, `差分数 ${diff}`, `料金+${yen(add.price)}×${diff} / 納期+${add.weeks}週間×${diff}`);
    }
  }

  const usageType = document.getElementById("usageType").value;
  const usageMul = multiply({ price: PRICE_TABLE.usageType[usageType], weeks: 1 });
  price *= usageMul.price;
  addLine(lines, "使用用途", `${document.getElementById("usageType").selectedOptions[0].textContent}（料金×${usageMul.price}）`);

  if (document.getElementById("noPortfolio").checked) {
    const r = multiply(PRICE_TABLE.options.noPortfolio);
    price *= r.price;
    weeks *= r.weeks;
    addLine(lines, "追加条件", `実績公開不可（料金×${r.price} / 納期×${r.weeks}）`);
  }
  if (document.getElementById("rushOrder").checked) {
    const r = multiply(PRICE_TABLE.options.rushOrder);
    price *= r.price;
    weeks *= r.weeks;
    addLine(lines, "追加条件", `短納期希望（料金×${r.price} / 納期×${r.weeks}）`);
  }

  if (topKey === "live2d_model" && LIVE2D_CAMPAIGN.enabled) {
    price *= LIVE2D_CAMPAIGN.priceMultiplier;
    addLine(lines, "特別価格", `料金×${LIVE2D_CAMPAIGN.priceMultiplier}（60%OFF）`);
  }

  return { total: price, weeks, lines, hasPriceTable: true };
}

function getCheckedConfirmations() {
  const items = [];
  if (document.getElementById("confirmNoAiUse").checked) items.push("AI学習への利用は禁止です");
  if (document.getElementById("confirmNoRedistribute").checked) items.push("二次配布・改変は禁止です");
  if (document.getElementById("confirmAllAgesUse").checked) items.push("成人向け・R18・NSFW・性的表現を主目的とする用途には使用しません");
  if (document.getElementById("confirmRevisionFee").checked) items.push("過度な修正や制作後半での大幅修正は追加料金の可能性があります");
  if (document.getElementById("confirmEstimateNotFinal").checked) items.push("見積もりは確定ではありません");
  return items;
}

function allConfirmationsChecked() {
  const needDepositCheck =
    paymentMethod.value === "bank_transfer" || paymentMethod.value === "paypal";
  return (
    document.getElementById("confirmNoAiUse").checked &&
    document.getElementById("confirmNoRedistribute").checked &&
    document.getElementById("confirmAllAgesUse").checked &&
    document.getElementById("confirmRevisionFee").checked &&
    document.getElementById("confirmEstimateNotFinal").checked &&
    (!needDepositCheck || confirmDepositPolicy.checked)
  );
}

function renderBreakdown(lines) {
  breakdownList.textContent = "";
  lines.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.label}: ${item.value}`;
    breakdownList.appendChild(li);
  });
}

function updateAll() {
  updateLevelLabels();
  const estimate = buildEstimate();
  const isLive2D = selects[0].value === "live2d_model";
  const confirmations = getCheckedConfirmations();
  const needDepositCheck =
    paymentMethod.value === "bank_transfer" || paymentMethod.value === "paypal";
  paymentNoticeRow.classList.toggle("hidden", !needDepositCheck);
  if (!needDepositCheck) confirmDepositPolicy.checked = false;
  const canOpenGoogleForm = estimate.hasPriceTable !== false && allConfirmationsChecked();
  const scheduleRange = getScheduleRange(estimate.weeks);
  estimateTotal.textContent = estimate.hasPriceTable === false ? "料金表を読み込めません" : yen(estimate.total);
  estimateDelivery.textContent = `概算納期: ${estimate.weeks ? weeksToLabel(estimate.weeks) : "-"}`;
  estimateStartDate.textContent = `着手予定日: ${scheduleRange.startLabel}`;
  estimateDueDate.textContent = `納品予定日: ${scheduleRange.dueLabel}`;
  renderBreakdown(estimate.lines);
  live2dLimitedNote.classList.toggle("hidden", !(isLive2D && LIVE2D_CAMPAIGN.enabled));
  googleFormLink.classList.toggle("hidden", !canOpenGoogleForm);
  confirmWarning.classList.toggle("hidden", canOpenGoogleForm);
  inquiryBody.value = [
    "【概算内容】",
    "",
    ...estimate.lines.map((line) => `- ${line.label}: ${line.value}`),
    "",
    "【自由記述】",
    freeMemo.value.trim() || "なし",
    "",
    "【ご希望のお支払い方法】",
    paymentMethod.selectedOptions[0]?.textContent || "未選択",
    "",
    "【着手金条件の確認】",
    needDepositCheck ? (confirmDepositPolicy.checked ? "確認済み" : "未確認") : "対象外（アズカリ・つなぐ）",
    "",
    "【確認済み項目】",
    ...(confirmations.length ? confirmations.map((item) => `- ${item}`) : ["- なし"]),
    "",
    `概算合計: ${estimate.hasPriceTable === false ? "料金表を読み込めません" : yen(estimate.total)}`,
    `概算納期: ${estimate.weeks ? weeksToLabel(estimate.weeks) : "-"}`,
    `着手予定日: ${scheduleRange.startLabel}`,
    `納品予定日: ${scheduleRange.dueLabel}`,
    "※ この金額は概算です。",
    "※ 着手予定日・納品予定日は目安です。",
    "※ 送信のみでは依頼確定になりません。"
  ].join("\n");
}

selects.forEach((selectEl, idx) => {
  selectEl.addEventListener("change", () => {
    refreshHierarchyFrom(idx);
    if (idx === 0) applyCategoryDefaults();
    updateAll();
  });
});

[
  "live2dCharDesign",
  "live2dPartsDraft",
  "live2dModeling",
  "partsCountChoice",
  "usageType",
  "loopRichness",
  "loopTracking",
  "paymentMethod",
  "confirmDepositPolicy",
  "diffCount",
  "noPortfolio",
  "rushOrder",
  "confirmNoAiUse",
  "confirmNoRedistribute",
  "confirmAllAgesUse",
  "confirmRevisionFee",
  "confirmEstimateNotFinal",
  "freeMemo"
].forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", updateAll);
  el.addEventListener("change", updateAll);
});

copyButton.addEventListener("click", async () => {
  copyStatus.textContent = "";
  try {
    await navigator.clipboard.writeText(inquiryBody.value);
    copyStatus.textContent = "コピーしました。";
  } catch (error) {
    copyStatus.textContent = "コピーに失敗しました。手動でコピーしてください。";
  }
});

async function loadPriceTable() {
  try {
    const response = await fetch(PRICES_JSON_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.base || !data.usageType || !data.multipliers || !data.additions || !data.options) {
      throw new Error("prices.json の必要な項目が足りません");
    }
    PRICE_TABLE = data;
    priceTableLoadError = "";
  } catch (error) {
    console.warn("prices.json の読み込みに失敗しました。", error);
    PRICE_TABLE = null;
    priceTableLoadError = "prices.jsonを読み込めません。公開ページ、またはローカルサーバーで確認してください。";
  }
}

async function loadScheduleConfig() {
  try {
    const response = await fetch(SCHEDULE_CONFIG_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    scheduleConfig = {
      startDate: typeof data.startDate === "string" ? data.startDate : ""
    };
  } catch (error) {
    console.warn("schedule-config.json の読み込みに失敗したため、日付表示を空にします。", error);
    scheduleConfig = { startDate: "" };
  }
}

async function init() {
  await loadPriceTable();
  await loadScheduleConfig();
  googleFormLink.href = GOOGLE_FORM_URL;
  fillSelect(selects[0], REQUEST_TREE);
  if (REQUEST_TREE.some((node) => node.key === DEFAULT_TOP_CATEGORY_KEY)) {
    selects[0].value = DEFAULT_TOP_CATEGORY_KEY;
  }
  refreshHierarchyFrom(0);
  applyCategoryDefaults();
  document.getElementById("loopRichness").value = "loop_richness_mid";
  document.getElementById("loopTracking").value = "loop_tracking_no";
  live2dChecksRow.classList.add("hidden");
  partsCountRow.classList.add("hidden");
  diffRow.classList.add("hidden");
  if (LIVE2D_CAMPAIGN.hideHighLevelOptions) {
    ["parts_100", "parts_over_100"].forEach((value) => {
      const option = partsCountChoice.querySelector(`option[value="${value}"]`);
      if (option) option.remove();
    });
  }
  updateAll();
}

init();
