const DEFAULT_PRICE_TABLE = {
  base: {
    bg_illust: { price: 30000, weeks: 4 },
    standing: { price: 15000, weeks: 4 },
    live2d_model: { price: 40000, weeks: 8 },
    loop_animation: { price: 15000, weeks: 4 }
  },
  usageType: { personal: 1, video_streaming: 1.3, commercial: 1.5 },
  multipliers: {
    // 背景あり1枚絵
    render_bg: { price: 1.3, weeks: 1.3 },
    render_char: { price: 1, weeks: 1 },
    size_bust: { price: 0.8, weeks: 0.8 },
    size_full: { price: 1, weeks: 1 },
    // 立ち絵
    standing_keyvisual: { price: 1, weeks: 1 },
    standing_char_design: { price: 1, weeks: 1 },
    standing_char_new: { price: 1.2, weeks: 1.2 },
    standing_char_diff: { price: 1, weeks: 1 },
    three_yes: { price: 1.5, weeks: 1.5 },
    three_no: { price: 1, weeks: 1 },
    // Live2Dモデル
    live2d_char_design: { price: 1.1, weeks: 1.1 },
    live2d_parts_draft: { price: 1, weeks: 1 },
    live2d_modeling: { price: 2, weeks: 2 },
    parts_30: { price: 1, weeks: 1 },
    parts_50: { price: 1.5, weeks: 1.5 },
    parts_100: { price: 2, weeks: 2 },
    parts_over_100: { price: 2.5, weeks: 2.5 },
    // ループアニメーション
    loop_waiting: { price: 1.3, weeks: 1.3 },
    loop_asset: { price: 1, weeks: 1 },
    loop_asset_mic: { price: 1, weeks: 1 },
    loop_asset_other: { price: 1, weeks: 1 }
  },
  additions: {
    live2dDiffEach: { price: 2000, weeks: 1 },
    loopDiffEach: { price: 2000, weeks: 1 }
  },
  options: {
    noPortfolio: { price: 1.3, weeks: 1.3 },
    rushOrder: { price: 1.3, weeks: 0.7 }
  }
};

let PRICE_TABLE = DEFAULT_PRICE_TABLE;
const PRICES_JSON_URL = "./prices.json";

const GOOGLE_FORM_URL = "https://forms.gle/Uaienez6aJw63dor7";

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
      { key: "standing_keyvisual", label: "Vtuber向けキービジュアル" },
      {
        key: "standing_char_design",
        label: "キャラデザ",
        children: [
          {
            key: "standing_char_new",
            label: "新規デザイン",
            children: [
              { key: "three_yes", label: "3面図要: 必要" },
              { key: "three_no", label: "3面図要: 不要" }
            ]
          },
          {
            key: "standing_char_diff",
            label: "差分（新衣装など）",
            children: [
              { key: "three_yes", label: "3面図要: 必要" },
              { key: "three_no", label: "3面図要: 不要" }
            ]
          }
        ]
      }
    ]
  },
  {
    key: "live2d_model",
    label: "Live2Dモデル",
    live2dFlow: true
  },
  {
    key: "loop_animation",
    label: "ループアニメーション",
    children: [
      { key: "loop_waiting", label: "待機画面" },
      {
        key: "loop_asset",
        label: "アセット",
        children: [
          { key: "loop_asset_mic", label: "マイク", showLoopDiff: true },
          { key: "loop_asset_other", label: "その他アクセサリーなど", showLoopDiff: true }
        ]
      }
    ]
  }
];

const levelIds = ["requestLevel1", "requestLevel2", "requestLevel3", "requestLevel4", "requestLevel5"];
const rowIds = ["requestLevel2Row", "requestLevel3Row", "requestLevel4Row", "requestLevel5Row"];
const selects = levelIds.map((id) => document.getElementById(id));
const rows = rowIds.map((id) => document.getElementById(id));

const live2dChecksRow = document.getElementById("live2dChecksRow");
const partsCountRow = document.getElementById("partsCountRow");
const diffRow = document.getElementById("diffRow");
const estimateTotal = document.getElementById("estimateTotal");
const estimateDelivery = document.getElementById("estimateDelivery");
const breakdownList = document.getElementById("breakdownList");
const inquiryBody = document.getElementById("inquiryBody");
const copyButton = document.getElementById("copyButton");
const copyStatus = document.getElementById("copyStatus");
const googleFormLink = document.getElementById("googleFormLink");
const confirmWarning = document.getElementById("confirmWarning");
const requestLevel2Label = document.getElementById("requestLevel2Label");
const requestLevel3Label = document.getElementById("requestLevel3Label");
const requestLevel4Label = document.getElementById("requestLevel4Label");
const requestLevel5Label = document.getElementById("requestLevel5Label");
const freeMemo = document.getElementById("freeMemo");

const LEVEL_LABELS_BY_CATEGORY = {
  bg_illust: ["描き込み重視", "サイズ、範囲", "追加詳細", "最終詳細"],
  standing: ["依頼内容", "目的", "三面図要否", "最終詳細"],
  live2d_model: ["依頼内容", "可動域", "差分数", "最終詳細"],
  loop_animation: ["用途", "欲しい物", "差分数", "最終詳細"]
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

function fillSelect(selectEl, nodes, placeholder) {
  selectEl.textContent = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  selectEl.appendChild(first);
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
    fillSelect(selects[i + 1], [], "先に上の項目を選んでください");
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
    fillSelect(selects[level], nodes, "選択してください");
    if (!selects[level].value) break;
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
  live2dChecksRow.classList.toggle("hidden", !isLive2D);

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
  if (!showDiff) document.getElementById("diffCount").value = "0";
}

function addLine(lines, label, value) {
  lines.push({ label, value });
}

function multiply(rule) {
  return rule || { price: 1, weeks: 1 };
}

const LEVEL_NAMES = ["依頼カテゴリ", "依頼内容", "目的", "三面図要否", "詳細"];

function buildEstimate() {
  const path = getPath();
  updateSpecialRows(path);

  const topKey = path[0]?.key;
  const base = PRICE_TABLE.base[topKey];
  if (!base) {
    return { total: 0, weeks: 0, lines: [] };
  }

  let price = base.price;
  let weeks = base.weeks;
  const lines = [];
  addLine(lines, `基本料金（${path[0].label}）`, yen(base.price));
  addLine(lines, `基本納期（${path[0].label}）`, weeksToLabel(base.weeks));

  path.forEach((node, index) => {
    if (index === 0) return;
    const rule = multiply(PRICE_TABLE.multipliers[node.key]);
    price *= rule.price;
    weeks *= rule.weeks;
    const levelName = LEVEL_NAMES[index] || `階層${index + 1}`;
    addLine(lines, `${levelName}: ${node.label}`, `料金×${rule.price} / 納期×${rule.weeks}`);
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
      addLine(lines, `目的: ${pLabel}`, `料金×${pRule.price} / 納期×${pRule.weeks}`);
    }
  }

  const usageType = document.getElementById("usageType").value;
  const usageMul = multiply({ price: PRICE_TABLE.usageType[usageType], weeks: 1 });
  price *= usageMul.price;
  addLine(lines, `使用用途: ${document.getElementById("usageType").selectedOptions[0].textContent}`, `料金×${usageMul.price}`);

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

  if (document.getElementById("noPortfolio").checked) {
    const r = multiply(PRICE_TABLE.options.noPortfolio);
    price *= r.price;
    weeks *= r.weeks;
    addLine(lines, "追加条件: 実績公開不可", `料金×${r.price} / 納期×${r.weeks}`);
  }
  if (document.getElementById("rushOrder").checked) {
    const r = multiply(PRICE_TABLE.options.rushOrder);
    price *= r.price;
    weeks *= r.weeks;
    addLine(lines, "追加条件: 短納期希望", `料金×${r.price} / 納期×${r.weeks}`);
  }

  return { total: price, weeks, lines };
}

function getCheckedConfirmations() {
  const items = [];
  if (document.getElementById("confirmNoAiUse").checked) items.push("AI学習への利用は禁止です");
  if (document.getElementById("confirmNoRedistribute").checked) items.push("二次配布・改変は禁止です");
  if (document.getElementById("confirmRevisionFee").checked) items.push("過度な修正や制作後半での大幅修正は追加料金の可能性があります");
  if (document.getElementById("confirmEstimateNotFinal").checked) items.push("見積もりは確定ではありません");
  return items;
}

function allConfirmationsChecked() {
  return (
    document.getElementById("confirmNoAiUse").checked &&
    document.getElementById("confirmNoRedistribute").checked &&
    document.getElementById("confirmRevisionFee").checked &&
    document.getElementById("confirmEstimateNotFinal").checked
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
  const confirmations = getCheckedConfirmations();
  const canOpenGoogleForm = allConfirmationsChecked();
  estimateTotal.textContent = yen(estimate.total);
  estimateDelivery.textContent = `概算納期: ${estimate.weeks ? weeksToLabel(estimate.weeks) : "-"}`;
  renderBreakdown(estimate.lines);
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
    "【確認済み項目】",
    ...(confirmations.length ? confirmations.map((item) => `- ${item}`) : ["- なし"]),
    "",
    `概算合計: ${yen(estimate.total)}`,
    `概算納期: ${estimate.weeks ? weeksToLabel(estimate.weeks) : "-"}`,
    "※ この金額は概算です。",
    "※ 送信のみでは依頼確定になりません。"
  ].join("\n");
}

selects.forEach((selectEl, idx) => {
  selectEl.addEventListener("change", () => {
    refreshHierarchyFrom(idx);
    updateAll();
  });
});

[
  "live2dCharDesign",
  "live2dPartsDraft",
  "live2dModeling",
  "partsCountChoice",
  "usageType",
  "diffCount",
  "noPortfolio",
  "rushOrder",
  "confirmNoAiUse",
  "confirmNoRedistribute",
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
    PRICE_TABLE = data;
  } catch (error) {
    console.warn("prices.json の読み込みに失敗したため、既定の料金表を使います。", error);
    PRICE_TABLE = DEFAULT_PRICE_TABLE;
  }
}

async function init() {
  await loadPriceTable();
  googleFormLink.href = GOOGLE_FORM_URL;
  fillSelect(selects[0], REQUEST_TREE, "選択してください");
  hideFrom(0);
  live2dChecksRow.classList.add("hidden");
  partsCountRow.classList.add("hidden");
  diffRow.classList.add("hidden");
  updateAll();
}

init();
