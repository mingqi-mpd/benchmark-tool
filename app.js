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

let benchmarkData;

async function loadData() {
  try {
    const response = await fetch("benchmarks.json");
    if (!response.ok) throw new Error("Benchmark data could not be loaded.");
    benchmarkData = await response.json();
    populateSelect(countrySelect, benchmarkData.countries);
    populateSelect(verticalSelect, benchmarkData.verticals);
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

function updateMonetizationField() {
  const verticalKey = verticalSelect.value;
  const isGame = verticalKey.startsWith("games-");
  monetizationField.hidden = !isGame;
  monetizationSelect.required = isGame;
  monetizationSelect.innerHTML = '<option value="">Select a model</option>';

  if (!isGame || !benchmarkData) {
    monetizationSelect.value = "";
    return;
  }

  const allowedModels = benchmarkData.verticals[verticalKey].models;
  const options = Object.fromEntries(
    Object.entries(benchmarkData.monetizationModels).filter(([key]) => allowedModels.includes(key))
  );
  populateSelect(monetizationSelect, options);
}

function renderBenchmark(countryKey, verticalKey, monetizationKey) {
  const country = benchmarkData.countries[countryKey];
  const vertical = benchmarkData.verticals[verticalKey];
  const monetization = monetizationKey ? benchmarkData.monetizationModels[monetizationKey] : null;

  document.querySelector("#result-title").textContent = [country.label, vertical.label, monetization?.label]
    .filter(Boolean)
    .join(" · ");
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

  document.querySelector("#recommendation-copy").textContent = `${vertical.recommendation} Scenario: ${country.label}.`;
  resultEmpty.hidden = true;
  resultContent.hidden = false;
  resultContent.style.animation = "none";
  requestAnimationFrame(() => { resultContent.style.animation = ""; });
}

verticalSelect.addEventListener("change", updateMonetizationField);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !benchmarkData) return;
  renderBenchmark(countrySelect.value, verticalSelect.value, monetizationSelect.value);
  if (window.innerWidth < 901) resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!leadForm.reportValidity()) return;
  leadForm.hidden = true;
  document.querySelector(".inline-lead .privacy-note").hidden = true;
  successMessage.hidden = false;
});

loadData();
