// script.js
import { renderChart1 } from "./js/chart1.js";
import { renderChart2 } from "./js/chart2.js";
import { renderChart3 } from "./js/chart3.js";
import { renderChart4 } from "./js/chart4.js";
import { renderChart5 } from "./js/chart5.js";
import { renderChart6 } from "./js/chart6.js";


// Descriptions for each page
const descriptions = [
  `<h3>Global Happiness Scores Overview</h3>
<p>
  The first plot in this series presents “Happiness Scores” from the 2024 World Happiness Report, based on data collected between 2005/06 - 2023. The
  ladder score specifically referenced in this report is an average over the years 2021 - 2023. 
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
  This scatterplot invites users to explore the relationships between various contributing factors from the 2024 World Happiness Report.
  By selecting any two variables—such as GDP per capita, social support, or freedom to make life choices—for the X and Y axes, users can interactively investigate how different factors may relate to one another.
</p>

<p>
  Each point on the chart represents a country and is color-coded according to its overall Happiness Ladder Score, grouped into intuitive color bins.
  This visual encoding enables users to quickly assess whether countries with similar happiness levels tend to group together when plotted against certain factor combinations.
</p>

<p>
  A key design choice in this visualization is the use of color clustering as a visual proxy for correlation.
  When countries with similar colors form clear groups on the chart, it suggests a strong relationship between the selected variables and overall happiness.
  Conversely, when the colors are scattered with no visible clustering, it may indicate that the chosen factors have little or no direct association with happiness outcomes.
</p>

<p>
  This dynamic setup empowers users to:
</p>

<ul>
  <li>Identify strong correlations where ladder score clusters align with variable patterns.</li>
  <li>Discover natural groupings of countries with similar socioeconomic profiles.</li>
  <li>Spot outliers that deviate from broader trends.</li>
  <li>Test hypotheses by changing axes to see which variables show the strongest alignment with happiness.</li>
</ul>

<p>
  Minimal preprocessing was needed, as the data was used directly from the report, keeping the visualization as close to the source as possible.
  By putting these choices in the hands of users, the chart not only reveals statistical patterns—it encourages curiosity and critical thinking about what truly drives national well-being.
</p>

  `,
  `
<h3>Comparing Additional Well-Being Dimensions Across Countries</h3>

<p>
  This radar plot enables users to explore six countries at a time—by default, three from the top 10 and three from the bottom 10
  based on overall Happiness Ladder Scores. Users may also select their own countries from a dropdown, allowing for customized comparisons across a wide range of national profiles.
</p>

<p>
  The visualization focuses on five additional well-being dimensions that were not included in the World Happiness Report but were selected based on external research and their potential relevance to national happiness and quality of life.
</p>

<p>
  Each country's radar shape is filled with a color corresponding to its Happiness Ladder Score, grouped into four bins. This color encoding allows users to:
</p>

<ul>
  <li>Spot clusters of similarly colored shapes that may indicate a correlation between strong performance in certain areas and higher happiness levels.</li>
  <li>Contrast high-scoring and low-scoring countries to identify structural drivers of happiness.</li>
  <li>Explore whether similar profiles produce different happiness outcomes, suggesting cultural or contextual nuances.</li>
</ul>

<p>
  The five supplementary dimensions displayed on the radar chart are:
</p>

<ul>
  <li><strong>Global Health Security Index</strong> - Preparedness to handle national health crises (higher scores indicate better readiness).</li>
  <li><strong>Technology Access (ICT Index)</strong> - Measures internet and digital infrastructure access (higher is better).</li>
  <li><strong>Education (Learning-Adjusted Years)</strong> - Average quality-adjusted years of schooling (higher is better).</li>
  <li><strong>Violence (Assault Rate)</strong> - Annual incidents of physical and sexual assault (lower is better; inversely scaled).</li>
  <li><strong>Income Inequality (Gini Index)</strong> - Degree of income disparity (lower is better; inversely scaled).</li>
</ul>

<p>
  Preprocessing steps were required to merge and normalize these diverse datasets:
</p>

<ul>
  <li>Standardizing country names and matching to ISO3 codes.</li>
  <li>Aggregating subnational regions into national-level data (e.g., Scotland, Wales).</li>
  <li>Selecting the most recent available year when complete time series data was unavailable.</li>
  <li>Normalizing all indicators to a 1-5 scale for consistent visual comparison across dimensions.</li>
</ul>

<p>
  This visualization helps users explore hidden patterns and hypotheses about what additional structural or social factors may influence happiness. 
  Through the combined power of radar shape and color encoding, the chart encourages comparative reasoning and visual discovery across countries and indicators not typically captured by standard happiness measures.
</p>
`,
  `<h3>Trends in Sustainable Development Indicators</h3>
<p>
  This chart integrates the World Health Organization's Sustainable Development Goals (SDG) dataset to explore demographic and economic indicators that may explain happiness scores from Charts 1 and 2. 
  It uses an interactive area chart to track under-five mortality rates, access to drinking water in schools, and unemployment rates from 2015 to 2022.
</p>
<p>
  The visualization covers six countries from the 2024 World Happiness Report: three of the happiest (e.g., Norway, Denmark, Australia) and three of the least happy (Afghanistan, Zimbabwe, Zambia), selected for their consistent data across all indicators. 
  This mix provides a balanced view, though happier countries, often in Europe, may reflect more complete reporting, introducing potential regional bias.
</p>
<p>
  The chart reveals notable trends. For instance, happier countries like Norway maintain near-universal access to drinking water (close to 100%) and low under-five mortality rates (under 5 per 1,000). 
  In contrast, less happy countries like Afghanistan show lower water access (e.g., 60-80%) and higher mortality rates. 
  Interactivity allows users to select indicators via a dropdown and highlight a country's trend by clicking its name in the legend, enhancing clarity.
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
<h3>Regional Comparisons of Happiness and Additional Factors</h3>

<p>
  This dual-axis boxplot visualization enables users to compare distributions of two variables—one from the World Happiness Report (either the overall Ladder Score or one of its contributing factors) and one from a set of additional well-being dimensions (such as inequality, violence, or health system preparedness).
</p>

<p>
  For each global subregion, two side-by-side boxplots are shown:
</p>

<ul>
  <li>The <span style="color:#66c2a5;">green boxplot (left axis)</span> represents the selected happiness-related metric.</li>
  <li>The <span style="color:#fc8d62;">orange boxplot (right axis)</span> displays one of the additional dimensions explored in the radar plot.</li>
</ul>

<p>
  By comparing the shapes, ranges, and medians of these two boxplots per region, users can visually assess:
</p>

<ul>
  <li>Regional variability: Wide boxes suggest greater spread and inequality within that region.</li>
  <li>Regional similarity: Narrow, compact boxes imply more consistent scores among countries in that region.</li>
  <li>Cross-variable relationships: Similar patterns or aligned distributions between the two dimensions may suggest potential correlation or shared underlying influences.</li>
</ul>

<p>
  This visualization supports a range of comparative reasoning tasks:
</p>

<ul>
  <li>Does the region with the highest median happiness also show high scores in health preparedness or low inequality?</li>
  <li>Do regions with wide spreads in happiness also show wide spreads in violence or education?</li>
  <li>Are there regions where the boxplot patterns for both dimensions follow a similar shape, hinting at possible relationships?</li>
</ul>

<p>
  Because the Y-axes are independent and scaled separately, the visualization preserves the integrity of the underlying distributions for each variable.
  This approach makes it easy to spot alignment, contrast, and variation within and across regions, unlocking a deeper understanding of how happiness scores and other structural factors may be related.
</p>
`
];

// AI Help - Generating and troubleshooting the dynamic tab functionality

// Create handling for tab switching
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

// End AI