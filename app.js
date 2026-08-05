const form = document.querySelector("#benchmark-form");
const countrySelect = document.querySelector("#country");
const platformSelect = document.querySelector("#platform");
const verticalSelect = document.querySelector("#vertical");
const budgetInput = document.querySelector("#budget");
const resultEmpty = document.querySelector("#result-empty");
const resultContent = document.querySelector("#result-content");
const resultPanel = document.querySelector("#result-panel");
const dialog = document.querySelector("#lead-dialog");
const leadForm = document.querySelector("#lead-form");
const successMessage = document.querySelector("#success-message");

let benchmarkData;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

async function loadData() {
  try {
    const response = await fetch("benchmarks.json");
    if (!response.ok) throw new Error("Benchmark data could not be loaded.");
    benchmarkData = await response.json();
    populateSelect(countrySelect, benchmarkData.countries);
    populateSelect(platformSelect, benchmarkData.platforms);
    populateSelect(verticalSelect, benchmarkData.verticals);
  } catch (error) {
    form.querySelector("button").disabled = true;
    document.querySelector(".form-note").textContent = "Start a local web server to load the benchmark data.";
  }
}

function populateSelect(select, options) {
  Object.entries(options).forEach(([value, item]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = item.label;
    select.append(option);
  });
}

function roundVolume(value) {
  const interval = value >= 1000 ? 50 : 10;
  return Math.max(interval, Math.round(value / interval) * interval);
}

function calculateBenchmark(countryKey, platformKey, verticalKey, monthlyBudget) {
  const country = benchmarkData.countries[countryKey];
  const platform = benchmarkData.platforms[platformKey];
  const vertical = benchmarkData.verticals[verticalKey];
  const cpiFactor = country.cpiFactor * platform.cpiFactor;
  const cpi = vertical.cpi.map((value) => value * cpiFactor);

  let dailyVolume;
  let usesBudget = false;
  if (monthlyBudget >= 1000) {
    const midpointCpi = (cpi[0] + cpi[1]) / 2;
    const expected = monthlyBudget / 30 / midpointCpi;
    dailyVolume = [roundVolume(expected * 0.82), roundVolume(expected * 1.18)];
    usesBudget = true;
  } else {
    const volumeFactor = country.volumeFactor * platform.volumeFactor;
    dailyVolume = vertical.dailyVolume.map((value) => roundVolume(value * volumeFactor));
  }

  const d7Roas = vertical.d7Roas.map((value) => value + country.roasOffset + platform.roasOffset);
  return { country, platform, vertical, cpi, dailyVolume, d7Roas, usesBudget };
}

function renderBenchmark(result) {
  document.querySelector("#result-title").textContent = `${result.country.label} · ${result.platform.label} · ${result.vertical.label}`;
  document.querySelector("#cpi-value").textContent = `${money.format(result.cpi[0])}–${money.format(result.cpi[1])}`;
  document.querySelector("#volume-value").textContent = `${integer.format(result.dailyVolume[0])}–${integer.format(result.dailyVolume[1])}`;
  document.querySelector("#volume-caption").textContent = result.usesBudget ? "Installs / day at your budget" : "Estimated installs / day";
  document.querySelector("#roas-value").textContent = `${result.d7Roas[0]}–${result.d7Roas[1]}%`;
  document.querySelector("#model-value").textContent = result.vertical.model;
  document.querySelector("#model-caption").textContent = result.vertical.modelCaption;
  document.querySelector("#recommendation-copy").textContent = result.vertical.recommendation;

  resultEmpty.hidden = true;
  resultContent.hidden = false;
  resultContent.style.animation = "none";
  requestAnimationFrame(() => {
    resultContent.style.animation = "";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !benchmarkData) return;
  const result = calculateBenchmark(
    countrySelect.value,
    platformSelect.value,
    verticalSelect.value,
    Number(budgetInput.value)
  );
  renderBenchmark(result);
  if (window.innerWidth < 901) resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#unlock-button").addEventListener("click", () => dialog.showModal());
document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!leadForm.reportValidity()) return;
  leadForm.hidden = true;
  successMessage.hidden = false;
});

loadData();
