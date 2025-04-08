// script.js
import { renderChart1 } from "./js/chart1.js";
import { renderChart2 } from "./js/chart2.js";
import { renderChart3 } from "./js/chart3.js";
import { renderChart4 } from "./js/chart4.js";

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

  // Load specific charts
  switch (index) {
    case 0:
      renderChart1();
      break;
    case 1:
      renderChart2();
      break;
    case 2:
      renderChart3();
      break;
    case 3:
      renderChart4();
      break;
    default:
      document.getElementById("chart-container").innerHTML = `<p>[Chart ${index + 1} will go here]</p>`;
  }
}

tabButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => renderChart(idx));
});

// Initial render
renderChart(0);