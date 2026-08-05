const form = document.querySelector("#benchmark-form");
const countrySelect = document.querySelector("#country");
const platformSelect = document.querySelector("#platform");
const verticalSelect = document.querySelector("#vertical");
const monetizationSelect = document.querySelector("#monetization");
const budgetSelect = document.querySelector("#budget");
const resultEmpty = document.querySelector("#result-empty");
const resultContent = document.querySelector("#result-content");
const resultPanel = document.querySelector("#result-panel");
const kpiGrid = document.querySelector("#kpi-grid");
const dialog = document.querySelector("#lead-dialog");
const leadForm = document.querySelector("#lead-form");
const successMessage = document.querySelector("#success-message");

let benchmarkData;

async function loadData() {
  try {
    const response = await fetch("benchmarks.json");
    if (!response.ok) throw new Error("Benchmark data could not be loaded.");
    benchmarkData = await response.json();
    populateSelect(countrySelect, benchmarkData.countries);
    populateSelect(platformSelect, benchmarkData.platforms);
    populateSelect(monetizationSelect, benchmarkData.monetizationModels);
  } catch (error) {
    form.querySelector("button").disabled = true;
    document.querySelector(".form-note").textContent = "The benchmark data could not be loaded. Please refresh the page.";
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

function updateVerticalOptions() {
  const currentValue = verticalSelect.value;
  const selectedModel = monetizationSelect.value;
  verticalSelect.innerHTML = '<option value="">Select a vertical</option>';
  if (!selectedModel || !benchmarkData) {
    verticalSelect.disabled = true;
    return;
  }

  const compatibleVerticals = Object.fromEntries(
    Object.entries(benchmarkData.verticals).filter(([, vertical]) => vertical.models.includes(selectedModel))
  );
  populateSelect(verticalSelect, compatibleVerticals);
  verticalSelect.disabled = false;
  if (compatibleVerticals[currentValue]) verticalSelect.value = currentValue;
}

function renderBenchmark(countryKey, platformKey, verticalKey, monetizationKey) {
  const country = benchmarkData.countries[countryKey];
  const platform = benchmarkData.platforms[platformKey];
  const vertical = benchmarkData.verticals[verticalKey];
  const monetization = benchmarkData.monetizationModels[monetizationKey];
  const budget = benchmarkData.budgets[budgetSelect.value];

  document.querySelector("#result-title").textContent = `${vertical.label} · ${monetization.label}`;
  kpiGrid.innerHTML = "";

  vertical.metrics.forEach((metric, index) => {
    const card = document.createElement("article");
    card.className = `kpi-card${metric.highlight ? " kpi-card--featured" : ""}`;
    card.innerHTML = `
      <span class="kpi-number">${String(index + 1).padStart(2, "0")}</span>
      <p>${metric.label}</p>
      <strong>${metric.value}</strong>
      <span class="kpi-caption">${metric.caption}</span>
    `;
    kpiGrid.append(card);
  });

  document.querySelector("#recommendation-copy").textContent = `${vertical.recommendation} Scenario: ${country.label}, ${platform.label}, ${budget.label} monthly budget.`;
  resultEmpty.hidden = true;
  resultContent.hidden = false;
  resultContent.style.animation = "none";
  requestAnimationFrame(() => { resultContent.style.animation = ""; });
}

monetizationSelect.addEventListener("change", updateVerticalOptions);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !benchmarkData) return;
  renderBenchmark(countrySelect.value, platformSelect.value, verticalSelect.value, monetizationSelect.value);
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
