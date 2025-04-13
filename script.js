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
  `
    <h3>Exploring Relationships Between Happiness Factors</h3>
    <p>
      This scatterplot allows users to dynamically explore relationships between different variables from the 2024 World Happiness Report. 
      Users can select any two contributing factors—such as GDP per capita, social support, or freedom to make life choices—to assign to the X and Y axes.
    </p>
    <p>
      Each point represents a country and is color-coded according to its overall Happiness Ladder Score. 
      This color gradient helps identify whether clusters of high or low happiness align with particular combinations of variables.
    </p>
    <p>
      Minimal preprocessing was required for this visualization, as the values were used directly from the dataset. 
      The interactive nature of the chart allows users to experiment with different factor combinations and uncover potential patterns, such as:
    </p>
    <ul>
      <li>Strong correlations between two variables</li>
      <li>Clusters of countries with similar scores</li>
      <li>Outliers or weak associations that may indicate a lower impact on happiness</li>
    </ul>
    <p>
      By comparing axes that do or do not lead to visible clustering by color, users can also infer whether certain factors had a stronger or weaker influence 
      on the reported happiness scores. If no clear pattern emerges, that combination may not have contributed significantly to the overall score.
    </p>
  `,
  "World map visualizing global happiness scores with zoom and tooltip.",
  `
<h3>Comparing Additional Well-Being Dimensions Across Countries</h3>
<p>
  This radar plot allows users to select and compare up to six countries across five dimensions that are 
  not included in the World Happiness Report. These additional indicators—drawn from external 
  global datasets—offer a broader perspective on factors that may influence a nation’s well-being.
</p>
<p>
  Each country’s shape is filled with a color corresponding to its overall Happiness Ladder Score. This helps users 
  visually assess whether high or low happiness levels appear to correlate with strengths or weaknesses across these 
  supplementary dimensions.
</p>
<p>
  Significant preprocessing was required to build this visualization. Each dimension came from a separate data source, 
  which required:
</p>
<ul>
  <li>Standardizing country names and mapping each country to its ISO3 code.</li>
  <li>Consolidating subnational data (e.g., Scotland, Wales) into a national value.</li>
  <li>Using the most recent year available when time series data was incomplete.</li>
  <li>Normalizing and binning all scores into a 1-5 scale to enable visual comparison.</li>
</ul>
<p>
  The five dimensions shown on the radar chart are:
</p>
<ul>
  <li><strong>Global Health Security Index</strong> - Preparedness to respond to health crises. Higher scores are better.</li>
  <li><strong>Technology Access (ICT Index)</strong> - Measures digital access and connectivity. Higher scores are better.</li>
  <li><strong>Education (Learning-Adjusted Years)</strong> - Average years of quality schooling. Higher scores are better.</li>
  <li><strong>Violence (Assault Rate)</strong> - Incidence of physical and sexual assaults. Lower scores are better (inversely scaled).</li>
  <li><strong>Income Inequality (Gini Index)</strong> - Degree of income disparity. Lower scores are better (inversely scaled).</li>
</ul>
<p>
  This chart is useful for discovering how countries compare in areas beyond the core happiness factors and identifying 
  possible contributors to national well-being that are not explicitly included in the World Happiness Report.
</p>
`
,
`
<h3>Box Plot: Regional Distributions of Well-Being Dimensions</h3>
<p>
  This box plot visualization uses the same five dimensions from the radar plot—drawn from external data sources not included in the World Happiness Report. 
  Instead of focusing on individual countries, this chart highlights regional variations in each dimension.
</p>
<p>
  By grouping countries into broader world regions, the box plot allows users to compare how indicators such as education, technology access, public safety, 
  health preparedness, and income inequality vary across different parts of the world. The visual layout makes it easy to:
</p>
<ul>
  <li>Understand the distribution and spread of scores within each region</li>
  <li>Identify regional medians and interquartile ranges</li>
  <li>Spot outliers that stand out from the rest of the region</li>
</ul>
<p>
  This chart is especially useful for identifying regions that are performing exceptionally well or poorly in a given category, and for drawing 
  attention to countries that deviate significantly from their peers. It complements the radar chart by shifting focus from individual profiles 
  to regional trends and disparities.
</p>
`
];


const tabButtons = document.querySelectorAll(".tab");
const descriptionContainer = document.getElementById("description");

function renderChart(index) {
  const home = document.getElementById("home-container");
  const chart = document.getElementById("chart-container");

  // Set active tab styling
  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabButtons[index].classList.add("active");

  if (index === 0) {
    // Show home, hide chart
    home.style.display = "block";
    chart.style.display = "none";
    descriptionContainer.innerText = "";
  } else {
    // Show chart, hide home
    home.style.display = "none";
    chart.style.display = "flex";
    descriptionContainer.innerHTML = descriptions[index - 1];
    setupChartContainer();

    switch (index) {
      case 1: renderChart1(); break;
      case 2: renderChart2(); break;
      case 3: renderChart3(); break;
      case 4: renderChart4(); break;
      case 5: renderChart5(); break;
      case 6: renderChart6(); break;
    }
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
    <div id="chart-content">
      <div id="chart-title">[Chart Title Goes Here]</div>
      <div id="chart-visual"></div>
    </div>
  `;
}

// Initial render
renderChart(0);