const form = document.querySelector("#benchmark-form");
const countrySelect = document.querySelector("#country");
const verticalSelect = document.querySelector("#vertical");
const monetizationSelect = document.querySelector("#monetization");
const monetizationField = document.querySelector("#monetization-field");
const resultEmpty = document.querySelector("#result-empty");
const resultContent = document.querySelector("#result-content");
const resultPanel = document.querySelector("#result-panel");
const kpiGrid = document.querySelector("#kpi-grid");
const leadForm = document.querySelector("#lead-form");
const successMessage = document.querySelector("#success-message");
const benchmarkCta = document.querySelector('.hero-cta[href^="#"]');

let benchmarkData;
let lastReportedHeight = 0;

function reportPageHeight() {
  if (window.parent === window) return;

  const height = Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  if (height === lastReportedHeight) return;

  lastReportedHeight = height;
  window.parent.postMessage({ type: "mapendo-benchmark-height", height }, "*");
}

function scheduleHeightReport() {
  requestAnimationFrame(() => requestAnimationFrame(reportPageHeight));
}

function forwardWheelToParent(event) {
  const isOverSelect = event.target instanceof Element && event.target.closest("select");
  if (window.parent === window || event.deltaY === 0 || isOverSelect) return;

  window.parent.postMessage(
    {
      type: "mapendo-benchmark-wheel",
      deltaY: event.deltaY,
      deltaMode: event.deltaMode
    },
    "*"
  );
}

function requestParentScroll(event) {
  if (window.parent === window) return;

  const targetSelector = benchmarkCta?.getAttribute("href");
  const target = targetSelector ? document.querySelector(targetSelector) : null;
  if (!target) return;

  event.preventDefault();
  window.parent.postMessage(
    {
      type: "mapendo-benchmark-scroll",
      offsetTop: Math.round(target.getBoundingClientRect().top + window.scrollY)
    },
    "*"
  );
}

async function loadData() {
  try {
    const response = await fetch("benchmarks.json");
    if (!response.ok) throw new Error("Benchmark data could not be loaded.");
    benchmarkData = await response.json();
    syncSelectOptions();
  } catch (error) {
    form.querySelector("button").disabled = true;
    document.querySelector(".form-note").textContent = "The benchmark data could not be loaded. Please refresh the page.";
  }
}

function setSelectOptions(select, keys, items, placeholder, selectedValue = "") {
  select.replaceChildren();

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.append(placeholderOption);

  keys.forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = items[key].label;
    select.append(option);
  });

  select.value = keys.includes(selectedValue) ? selectedValue : "";
}

function countriesForVertical(verticalKey) {
  return Object.keys(benchmarkData.countries).filter((countryKey) => benchmarkData.benchmarks[countryKey]?.[verticalKey]);
}

function verticalsForCountry(countryKey) {
  return Object.keys(benchmarkData.verticals).filter((verticalKey) => benchmarkData.benchmarks[countryKey]?.[verticalKey]);
}

function syncSelectOptions(changedField) {
  let countryKey = countrySelect.value;
  let verticalKey = verticalSelect.value;

  if (changedField === "country" && countryKey && verticalKey && !benchmarkData.benchmarks[countryKey]?.[verticalKey]) {
    verticalKey = "";
  }

  if (changedField === "vertical" && verticalKey && countryKey && !benchmarkData.benchmarks[countryKey]?.[verticalKey]) {
    countryKey = "";
  }

  const countryKeys = verticalKey ? countriesForVertical(verticalKey) : Object.keys(benchmarkData.countries);
  const verticalKeys = countryKey ? verticalsForCountry(countryKey) : Object.keys(benchmarkData.verticals);

  setSelectOptions(countrySelect, countryKeys, benchmarkData.countries, "Select a market", countryKey);
  setSelectOptions(verticalSelect, verticalKeys, benchmarkData.verticals, "Select a vertical", verticalKey);
  updateMonetizationField();
}

function updateMonetizationField() {
  const vertical = benchmarkData?.verticals[verticalSelect.value];
  const modelKey = vertical?.model;

  monetizationField.hidden = !modelKey;
  monetizationSelect.replaceChildren();

  if (!modelKey) {
    monetizationSelect.disabled = false;
    monetizationSelect.removeAttribute("aria-disabled");
    return;
  }

  const option = document.createElement("option");
  option.value = modelKey;
  option.textContent = benchmarkData.monetizationModels[modelKey].label;
  monetizationSelect.append(option);
  monetizationSelect.value = modelKey;
  monetizationSelect.disabled = true;
  monetizationSelect.setAttribute("aria-disabled", "true");
}

function resetResult() {
  resultContent.hidden = true;
  resultEmpty.hidden = false;
  scheduleHeightReport();
}

function renderBenchmark(countryKey, verticalKey) {
  const country = benchmarkData.countries[countryKey];
  const vertical = benchmarkData.verticals[verticalKey];
  const metrics = benchmarkData.benchmarks[countryKey]?.[verticalKey];

  if (!country || !vertical || !metrics) {
    resetResult();
    return;
  }

  const monetization = vertical.model ? benchmarkData.monetizationModels[vertical.model] : null;
  document.querySelector("#result-title").textContent = [country.label, vertical.label, monetization?.label]
    .filter(Boolean)
    .join(" · ");
  kpiGrid.innerHTML = "";

  metrics.forEach((metric, index) => {
    const card = document.createElement("article");
    card.className = `kpi-card${index === 0 ? " kpi-card--featured" : ""}`;
    card.innerHTML = `
      <span class="kpi-number">${String(index + 1).padStart(2, "0")}</span>
      <p>${metric.label}</p>
      <strong>${metric.value}</strong>
      <span class="kpi-caption">${metric.caption}</span>
    `;
    kpiGrid.append(card);
  });

  document.querySelector("#recommendation-copy").textContent = `Available directional benchmark for ${vertical.label} campaigns in ${country.label}.`;
  resultEmpty.hidden = true;
  resultContent.hidden = false;
  resultContent.style.animation = "none";
  requestAnimationFrame(() => { resultContent.style.animation = ""; });
  scheduleHeightReport();
}

countrySelect.addEventListener("change", () => {
  syncSelectOptions("country");
  resetResult();
});

verticalSelect.addEventListener("change", () => {
  syncSelectOptions("vertical");
  resetResult();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !benchmarkData) return;
  renderBenchmark(countrySelect.value, verticalSelect.value);
  if (window.innerWidth < 901) resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

leadForm.addEventListener("submit", () => {
  if (!leadForm.reportValidity()) return;
  window.setTimeout(() => {
    leadForm.hidden = true;
    successMessage.hidden = false;
    scheduleHeightReport();
  }, 0);
});

window.addEventListener("load", scheduleHeightReport);
window.addEventListener("resize", scheduleHeightReport);
window.addEventListener("wheel", forwardWheelToParent, { passive: true });
benchmarkCta?.addEventListener("click", requestParentScroll);

if ("ResizeObserver" in window) {
  const pageResizeObserver = new ResizeObserver(scheduleHeightReport);
  pageResizeObserver.observe(document.body);
}

loadData();
