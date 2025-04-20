// Load D3 from CDN
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main function to render Chart 6: Dual-Axis Regional Boxplot Comparison
export async function renderChart6() {

  // Select chart containers and reset contents
  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");
  const controlsContainer = document.getElementById("chart-controls");

  visualContainer.innerHTML = "";
  legendContainer.innerHTML = "";
  controlsContainer.innerHTML = "";

  // Set chart title
  const titleElement = document.getElementById("chart-title");
  if (titleElement) {
    titleElement.textContent = "Regional Comparisons for Contributing Happiness Factors";
  }

  // Load dataset containing happiness and structural indicators
  const data = await d3.csv("data/merged_boxplot_data_cleaned.csv", d3.autoType);

  // Dimensions from the World Happiness Report
  const happinessDimensions = [
    "Ladder Score",
    "Log GDP per capita",
    "Social Support",
    "Healthy Life Expectancy",
    "Personal Freedom",
    "Generosity",
    "Perceptions of Corruption",
    "Dystopia"
  ];

  // Additional structural indicators
  const additionalDimensions = ["Tech", "Education", "Violence", "Health", "Inequality"];

  // Human-readable labels for chart dropdowns and titles
  const dimensionLabels = {
    "Ladder Score": "Overall Happiness Ladder Score",
    "Log GDP per capita": "GDP per Capita (Log Scale)",
    "Social Support": "Social Support Index",
    "Healthy Life Expectancy": "Healthy Life Expectancy (Years)",
    "Personal Freedom": "Freedom to Make Life Choices",
    "Generosity": "Perceived Generosity",
    "Perceptions of Corruption": "Perceived Corruption Level",
    "Dystopia": "Dystopia + Residual",
    "Tech": "Technology Access Level (IDI Score)",
    "Education": "Educational Attainment (Learning-adjusted Years of Schooling)",
    "Violence": "Violence Exposure Level - Annual Incidents of Violent Crime",
    "Health": "Health System Security (GHSI Index)",
    "Inequality": "Income Inequality Gap (Gini Coefficient)"
  };

  // Map of subregions to broader regional groups (used for sorting and labeling)
  const regionGroups = {
    "Northern Europe": "Europe",
    "Southern Europe": "Europe",
    "Eastern Europe": "Europe",
    "Western Europe": "Europe",
    "North Africa": "Africa",
    "Central Africa": "Africa",
    "West Africa": "Africa",
    "Southern Africa": "Africa",
    "South Asia": "Asia",
    "Southeast Asia": "Asia",
    "East Asia": "Asia",
    "Central Asia": "Asia",
    "Middle East": "Asia",
    "North America": "Americas",
    "Central America": "Americas",
    "South America": "Americas",
    "Oceania": "Oceania"
  };

  // Create a labeled dropdown and append to the UI controls container
  function createDropdown(id, labelText, options, container) {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "1rem";

    const label = document.createElement("label");
    label.textContent = labelText;
    label.setAttribute("for", id);
    label.style.display = "block";

    const select = document.createElement("select");
    select.id = id;
    select.style.width = "100%";

    options.forEach(dim => {
      const option = document.createElement("option");
      option.value = dim;
      option.textContent = dimensionLabels[dim] || dim;
      select.appendChild(option);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    container.appendChild(wrapper);

    return select;
  }

  // Create the two dropdowns for dimension selection
  const selectHappiness = createDropdown("happiness-select", "Select Happiness Dimension: ", happinessDimensions, controlsContainer);
  const selectAdditional = createDropdown("additional-select", "Select Additional Dimension: ", additionalDimensions, controlsContainer);

  // Rerender the chart on dropdown change
  function updateChart() {
    const dim1 = selectHappiness.value;
    const dim2 = selectAdditional.value;
    renderBoxplot(dim1, dim2);
  }

  // Attach dropdown listeners
  selectHappiness.addEventListener("change", updateChart);
  selectAdditional.addEventListener("change", updateChart);

  // Initial render
  updateChart();

  // Core rendering logic for the dual-axis boxplot
  function renderBoxplot(dim1, dim2) {
    
    // Clear existing chart
    visualContainer.innerHTML = "";

    // Define chart area dimensions
    const rect = visualContainer.getBoundingClientRect();
    const margin = { top: 60, right: 80, bottom: 100, left: 80 };
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;

    // Create main SVG canvas
    const svg = d3.select(visualContainer)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    // Define clipping region to prevent overflow
    svg.append("defs").append("clipPath")
      .attr("id", "clip-box")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

    // Define main chart group and clipped plot area group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const plotArea = g.append("g")
      .attr("clip-path", "url(#clip-box)");

    // Sort subregions by macro region, then name
    const subregionsSorted = Object.entries(regionGroups)
      .sort((a, b) => d3.ascending(a[1], b[1]) || d3.ascending(a[0], b[0]))
      .map(d => d[0]);

    // X-scale based on subregions
    const x = d3.scaleBand()
      .domain(subregionsSorted)
      .range([0, width])
      .padding(0.2);

    // Width of each boxplot
    const boxWidth = x.bandwidth() / 2.2;

    // Begin AI Help

    // Calculate quartiles, whiskers, and filter outliers
    function calculateStats(entries, key) {
      const values = entries.map(d => d[key]).filter(v => v != null && !isNaN(v)).sort(d3.ascending);
      if (values.length === 0) return null;

      const q1 = d3.quantile(values, 0.25);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;

      const filtered = values.filter(v => v >= lowerFence && v <= upperFence);

      return {
        q1,
        q3,
        median: d3.quantile(filtered, 0.5),
        min: d3.min(filtered),
        max: d3.max(filtered),
        values: filtered,
        lowerFence,
        upperFence
      };
    }

    // Precompute statistics across all subregions for axis scaling
    const allStats1 = [];
    const allStats2 = [];

    subregionsSorted.forEach(subregion => {
      const entries = data.filter(d => d.subregion === subregion && d[dim1] != null && d[dim2] != null);
      const stats1 = calculateStats(entries, dim1);
      const stats2 = calculateStats(entries, dim2);
      if (stats1 && stats2) {
        allStats1.push(...stats1.values);
        allStats2.push(...stats2.values);
      }
    });

    // End AI Help

    // Y-axis scales (independent per dimension)
    const yLeft = d3.scaleLinear().domain(d3.extent(allStats1)).nice().range([height, 0]);
    const yRight = d3.scaleLinear().domain(d3.extent(allStats2)).nice().range([height, 0]);

     // Draw X and Y axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("font-size", "16px");

    g.append("g")
      .call(d3.axisLeft(yLeft))
      .selectAll("text")
      .style("font-size", "16px");

    g.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yRight))
      .selectAll("text")
      .style("font-size", "16px");

    // Draw each pair of boxplots per region
    subregionsSorted.forEach(subregion => {
      const entries = data.filter(d => d.subregion === subregion && d[dim1] != null && d[dim2] != null);
      const stats1 = calculateStats(entries, dim1);
      const stats2 = calculateStats(entries, dim2);
      if (!stats1 || !stats2) return;
      const cx = x(subregion);

      plotArea.append("rect")
        .attr("x", cx)
        .attr("y", yLeft(stats1.q3))
        .attr("width", boxWidth)
        .attr("height", yLeft(stats1.q1) - yLeft(stats1.q3))
        .attr("fill", "#66c2a5")
        .attr("stroke", "black");

      plotArea.append("line")
        .attr("x1", cx)
        .attr("x2", cx + boxWidth)
        .attr("y1", yLeft(stats1.median))
        .attr("y2", yLeft(stats1.median))
        .attr("stroke", "black");

      plotArea.append("rect")
        .attr("x", cx + boxWidth)
        .attr("y", yRight(stats2.q3))
        .attr("width", boxWidth)
        .attr("height", yRight(stats2.q1) - yRight(stats2.q3))
        .attr("fill", "#fc8d62")
        .attr("stroke", "black");

      plotArea.append("line")
        .attr("x1", cx + boxWidth)
        .attr("x2", cx + boxWidth * 2)
        .attr("y1", yRight(stats2.median))
        .attr("y2", yRight(stats2.median))
        .attr("stroke", "black");
    });

    // Add chart subtitle describing current dimensions
    svg.append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("fill", "#555")
      .text(`${dimensionLabels[dim1]} (🟩 Left Y) vs ${dimensionLabels[dim2]} (🟧 Right Y)`);
  }
}
