// script.js
import { renderChart1 } from "./js/chart1.js";
import { renderChart2 } from "./js/chart2.js";
import { renderChart3 } from "./js/chart3.js";
import { renderChart4 } from "./js/chart4.js";
import { renderChart5 } from "./js/chart5.js";
import { renderChart6 } from "./js/chart6.js";

const descriptions = [
  "Stacked bar chart showing happiness factors for top 10 and bottom 10 countries with interactive sorting.",
  "Area chart displaying SDG indicators across top 6 data-rich countries with indicator selection.",
  "Interactive scatterplot with dropdowns for x and y axes and color-coded happiness levels.",
  "World map visualizing global happiness scores with zoom and tooltip.",
  "Chart 5 description",
  "Chart 6 description"
];

const tabButtons = document.querySelectorAll(".tab");
const descriptionContainer = document.getElementById("description");

function renderChart(index) {
  descriptionContainer.innerText = descriptions[index];
  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabButtons[index].classList.add("active");

  setupChartContainer(); 

  // Load specific charts
  switch (index) {
    case 1:
      renderChart1();
      break;
    case 2:
      renderChart2();
      break;
    case 3:
      renderChart3();
      break;
    case 4:
      renderChart4();
      break;
    case 5:
      renderChart5();
      break;
    case 6:
      renderChart6();
      break;
    default:
      document.getElementById("chart-visual").innerHTML = `<p>[Chart ${index + 1} will go here] - chart-visual</p>`;
  }
}

tabButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => renderChart(idx));
});

function setupChartContainer() {
  const chartContainer = document.getElementById("chart-container");
  chartContainer.innerHTML = `
    <div id="chart-ui">
      <div id="chart-legend"></div>
      <div id="chart-controls"></div>
    </div>
    <div id="chart-visual"></div>
  `;
}


// Initial render
renderChart(0);