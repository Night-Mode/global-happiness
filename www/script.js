

// script.js
const chartDescriptions = [
    "This is Chart 1's description.",
    "This is Chart 2's description.",
    "This is Chart 3's description.",
    "This is Chart 4's description.",
    "This is Chart 5's description.",
    "This is Chart 6's description."
  ];
  
  const chartContainer = document.getElementById("chart-container");
  const descriptionContainer = document.getElementById("description");
  const tabButtons = document.querySelectorAll(".tab");
  
  function renderChart(index) {
    // TEMP: Replace this later with Observable embeds or iframe
    chartContainer.innerHTML = `<p>[Chart ${index + 1} would be embedded here]</p>`;
    descriptionContainer.innerText = chartDescriptions[index];
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabButtons[index].classList.add("active");
  }
  
  tabButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => renderChart(idx));
  });
  
  // Load first chart on start
  renderChart(0);
  