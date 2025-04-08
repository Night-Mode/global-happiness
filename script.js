import { renderChart3 } from "./js/chart3.js";

const descriptions = [
  "Chart 1 description",
  "Chart 2 description",
  "Interactive scatterplot with dropdowns for x and y axes and color-coded happiness levels.",
  "Chart 4 description",
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
  if (index === 2) {
    renderChart3();
  } else {
    document.getElementById("chart-container").innerHTML = `<p>[Chart ${index + 1} will go here]</p>`;
  }
}

tabButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => renderChart(idx));
});

renderChart(0);
