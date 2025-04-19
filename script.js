// script.js
import { renderChart1 } from "./js/chart1.js";
import { renderChart2 } from "./js/chart2.js";
import { renderChart3 } from "./js/chart3.js";
import { renderChart4 } from "./js/chart4.js";
import { renderChart5 } from "./js/chart5.js";
import { renderChart6 } from "./js/chart6.js";

const descriptions = [
  `<h3>Global Happiness Scores Overview</h3>
<p>
  The first plot in this series presents “Happiness Scores” from the 2024 World Happiness Report, based on data collected between 2005/06 - 2023. 
  These scores, also known as ladder scores, originate from the Gallup World Poll, which includes survey questions related to individual life evaluations.
</p>
<p>
  The dataset covers 143 countries and incorporates metrics such as social support, generosity, and perceptions of corruption, which are explored in detail in subsequent charts. 
  Here, the scores are visualized using a D3 choropleth map, created by merging World Happiness Report data with a GeoJSON resource to obtain geospatial coordinates (Open Data Commons Public Domain).
</p>
<p>
  To enhance accessibility, the chart includes zoom functionality and hover labels displaying country names and their corresponding scores. 
  Key insights reveal that countries in North America and Europe generally report higher happiness scores compared to those in Africa and Asia. 
  However, some countries lacked data, which may affect regional comparisons—these gaps are clearly labeled in the visualization.
  <br> <br> The report also compares current scores to those from 2006-2010, providing deeper insights into population aggregates. 
  Key insights mentioned within the World Health Report from this comparison include:
</p>
<ul>
  <li>Happiness inequality persists in all continents except Europe.</li>
  <li>Social interaction is a key predictor of happiness.</li>
  <li>Females report a higher prevalence of negative emotions across all regions (World Happiness Report).</li>
</ul>
<p>
  Overall, this introductory chart offers a broad overview of global happiness levels, serving as a meaningful entry point into the deeper analyses that follow.
</p>`,

  `<h3>Key Factors Behind Happiness Scores</h3>
<p>
  The second chart in this series builds on the initial analysis by visualizing the six key explanatory variables behind happiness scores. 
  It uses a stacked bar chart to display data for the ten happiest and ten least happy countries, as reported in the 2024 World Happiness Report.
</p>
<p>
  Inspired by the original report, this version enhances user engagement with interactivity, including sorting by specific variables and hover features that show exact percentages for each country and variable. 
  These additions improve accessibility and allow for deeper exploration of the data.
</p>
<p>
  The visualization reveals that many of the happiest countries, such as Norway, Finland, and Switzerland, are in Europe, reinforcing trends observed in Chart 1. 
  GDP per capita emerges as a major factor, highlighting the role of economic prosperity in well-being. Additional insights from this include:
</p>
<ul>
  <li>Social support and healthy life expectancy are stronger predictors of happiness than generosity or perceptions of corruption.</li>
  <li>Interactivity allows users to see the proportion explained by a certain variable and its impact within a certain country.</li>
</ul>
<p>
  This type of visualization is particularly valuable for data scientists, aiding in the selection of relevant features for machine learning models aimed at predicting or explaining happiness outcomes. 
  By examining which attributes most benefit different countries, users gain deeper insights into global well-being patterns.
</p>`,

  `<h3>Exploring Relationships Between Happiness Factors</h3>
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
`,
  `<h3>Trends in Sustainable Development Indicators</h3>
<p>
  This chart integrates the World Health Organization’s Sustainable Development Goals (SDG) dataset to explore demographic and economic indicators that may explain happiness scores from Charts 1 and 2. 
  It uses an interactive area chart to track under-five mortality rates, access to drinking water in schools, and unemployment rates from 2015 to 2023.
</p>
<p>
  The visualization covers six countries from the 2024 World Happiness Report: three of the happiest (e.g., Norway, Denmark, Australia) and three of the least happy (Afghanistan, Zimbabwe, Zambia), selected for their consistent data across all indicators. 
  This mix provides a balanced view, though happier countries, often in Europe, may reflect more complete reporting, introducing potential regional bias.
</p>
<p>
  The chart reveals notable trends. For instance, happier countries like Norway maintain near-universal access to drinking water (close to 100%) and low under-five mortality rates (under 5 per 1,000). 
  In contrast, less happy countries like Afghanistan show lower water access (e.g., 60–80%) and higher mortality rates. 
  Interactivity allows users to select indicators via a dropdown and highlight a country’s trend by clicking its name in the legend, enhancing clarity.
</p>
<p>Important definitions for indicators as mentioned in the SDG report:</p>
<ul>
  <li>Under-five mortality rate: Number of deaths per 1,000 live births for children under age five.</li>
  <li>Access to drinking water: Percentage of schools with access to improved drinking water sources in a given year.</li>
  <li>Unemployment rate: Share of the labor force not currently employed but actively seeking work.</li>
  <li>Labor force: Total of all people who are either employed or unemployed (and seeking work).</li>
</ul>
<p>
  Building on the choropleth and stacked bar charts, this area chart illustrates how key well-being indicators evolve over time, offering insights into factors influencing happiness across diverse nations.
</p>`,
`
<h3>Regional Distributions of Well-Being Dimensions</h3>
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
      case 4: renderChart5(); break;
      case 5: renderChart4(); break;
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