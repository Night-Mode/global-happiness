// Start AI

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart4() {
  // Select containers
  const visualContainer = document.getElementById("chart-visual");
  const controlsContainer = document.getElementById("chart-controls");
  const legendContainer = document.getElementById("chart-legend");

  // Clear previous content
  visualContainer.innerHTML = "";
  controlsContainer.innerHTML = "";
  legendContainer.innerHTML = "";

  // Set title
  const titleElement = document.getElementById("chart-title");
  if (titleElement) titleElement.textContent = "SDG Indicators Across Top 6 Data-Rich Countries";

  // Create or update subtitle
  let subtitleElement = document.getElementById("chart-subtitle");
  if (!subtitleElement) {
    subtitleElement = document.createElement("div");
    subtitleElement.id = "chart-subtitle";
    subtitleElement.style.cssText = "font-size:18px;font-weight:normal;margin:10px 0;text-align:center";
    document.getElementById("chart-title").after(subtitleElement);
  }

  // Create dropdown
  controlsContainer.innerHTML = `
    <div style="text-align: left; margin-bottom: 10px;">
      <label for="indicator-select">Indicator:</label>
      <select id="indicator-select"></select>
    </div>
  `;

  // End AI

  // Create SVG as done in the other charts and similar to our class:
  const rect = visualContainer.getBoundingClientRect();
  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;
  // Creating SVG element:
  const svg = d3.create("svg")
    .attr("width", rect.width)
    .attr("height", rect.height)
    .attr("viewBox", [0, 0, rect.width, rect.height])
    .attr("style", "max-width: 100%; height: auto;");
  visualContainer.appendChild(svg.node());

  // Creating group element:
  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define glow filter (AI help). This allows the user to highlight a country and see its evolution over time:
  svg.append("defs").append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%")
    .call(f => f.append("feGaussianBlur").attr("stdDeviation", 2).attr("result", "blur"))
    .call(f => f.append("feMorphology")
      .attr("operator", "dilate")
      .attr("radius", 2)
      .attr("in", "SourceGraphic")
      .attr("result", "edge"))
    .call(f => f.append("feComponentTransfer")
      .attr("in", "edge")
      .attr("result", "darkEdge")
      .call(g => g.append("feFuncR").attr("type", "linear").attr("slope", 0.6))
      .call(g => g.append("feFuncG").attr("type", "linear").attr("slope", 0.6))
      .call(g => g.append("feFuncB").attr("type", "linear").attr("slope", 0.6)))
    .call(f => f.append("feMerge")
      .call(g => g.append("feMergeNode").attr("in", "blur"))
      .call(g => g.append("feMergeNode").attr("in", "darkEdge")));

  // End AI

  // Load the data:
  const data = await d3.json("data/final_data.json");
  data.forEach(d => d.Year = +d.Year);

  // Defining the indicators:
  const indicators = [
    { key: "UnemploymentRate", label: "Unemployment Rate (%)" },
    { key: "UnderFiveMortality", label: "Under-Five Mortality (per 1,000)" },
    { key: "DrinkingWater", label: "Drinking Water Access (%)" }
  ];

  // Populating the dropdown:
  d3.select("#indicator-select")
    .selectAll("option")
    .data(indicators)
    .join("option")
    .attr("value", d => d.key)
    .text(d => d.label);

  // Beginning chart and coloring functionality as referenced by: https://observablehq.com/@d3/stacked-area-chart/2
  const countries = [...new Set(data.map(d => d.Country))];

  // Applying similar color scale as reference: 
  const colorScale = d3.scaleOrdinal()
    .domain(countries)
    .range(d3.schemeCategory10.slice(0, countries.length));

  let selectedCountry = null;

  // Some AI help to get the updating to work properly:
  function updateChart() {
    const selectedIndicator = d3.select("#indicator-select").property("value");
    const selected = indicators.find(i => i.key === selectedIndicator);
    subtitleElement.textContent = `Indicator: ${selected.label}`;

    // Processing the data based on what the selected indicator is: 
    const validData = data.filter(d => d[selectedIndicator] != null && !isNaN(d[selectedIndicator]));
    const groupedData = d3.groups(validData, d => d.Country)
      .map(([country, values]) => ({
        country,
        values: values.sort((a, b) => a.Year - b.Year),
        maxValue: d3.max(values, v => v[selectedIndicator] || 0)
      }))
      .sort((a, b) => b.maxValue - a.maxValue);

  // End AI

    // Defining the scales:
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year))
      .range([0, width]);

    const maxValue = d3.max(validData, d => d[selectedIndicator]) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0])
      // Reference: https://www.d3indepth.com/scales/
      .nice();

    // Using d3.area() as done in the reference:
    const area = d3.area()
      .x(d => xScale(d.Year))
      .y0(height)
      .y1(d => yScale(d[selectedIndicator] || 0))
      .defined(d => d[selectedIndicator] != null && !isNaN(d[selectedIndicator]));

    // Clear previous elements
    chart.selectAll(".area, .axis").remove();
    legendContainer.innerHTML = "";

    // Draw areas with some AI help to get the filling and stroke colors to work based on the country the user selects:
    chart.selectAll(".area")
      .data(groupedData)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("d", d => area(d.values))
      .attr("fill", d => selectedCountry === d.country 
        ? d3.color(colorScale(d.country)).darker(1)
        : colorScale(d.country))
      .attr("opacity", 0.5)
      .attr("stroke", d => selectedCountry === d.country 
        ? d3.color(colorScale(d.country)).darker(2)
        : d3.color(colorScale(d.country)).darker(1))
      .attr("stroke-width", d => selectedCountry === d.country ? 5 : 1)
      .style("filter", d => selectedCountry === d.country ? "url(#glow)" : null)
      .on("click", (event, d) => {
        selectedCountry = selectedCountry === d.country ? null : d.country;
        updateHighlight();
      });

      // End AI

    // The axes are inspired by the reference mentioned, but are a bit more complicated due to the dynamics and styling that 
    // is necessary. The code uses similar functions like tick size outer, call, text anchor, font size, etc.:

    // X-axis
    chart.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("fill", "black")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Year"))
      .call(g => g.selectAll("text").style("font-size", "14px"));

    // Y-axis
    chart.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text(selected.label))
      .call(g => g.selectAll("text").style("font-size", "14px"));

// The legend is also a little tricky because it needs to highlight the selected country in the chart based on what is clicked.
// I referenced this resource that does something sort of similar: https://d3-graph-gallery.com/graph/stackedarea_template.html
    const legendSvg = d3.create("svg")
    .attr("width", 300)
    .attr("height", countries.length * 25 + 30);
    legendContainer.appendChild(legendSvg.node());
    const legend = legendSvg.append("g")
    .attr("transform", "translate(10,20)");
    legend.append("text")
    .attr("y", -5)
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Click to highlight country");
    const size = 20;
    legend.selectAll("rect")
    .data(countries)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * (size + 5))
    .attr("width", size)
    .attr("height", size)
    .attr("fill", d => colorScale(d))
    .style("cursor", "pointer")
    .on("click", (event, d) => {
        selectedCountry = selectedCountry === d ? null : d;
        updateHighlight();
    });
    legend.selectAll("text.label")
    .data(countries)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", size * 1.2)
    .attr("y", (d, i) => i * (size + 5) + size / 2)
    .attr("font-size", "14px")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("cursor", "pointer")
    .text(d => d)
    .on("click", (event, d) => {
        selectedCountry = selectedCountry === d ? null : d;
        updateHighlight();
    });
    }
// Start AI:
function updateHighlight() {
  chart.selectAll(".area")
    .attr("fill", d => selectedCountry === d.country 
      ? d3.color(colorScale(d.country)).darker(1)
      : colorScale(d.country))
    .attr("opacity", 0.5)
    .attr("stroke", d => selectedCountry === d.country 
      ? d3.color(colorScale(d.country)).darker(2)
      : d3.color(colorScale(d.country)).darker(1))
    .attr("stroke-width", d => selectedCountry === d.country ? 5 : 1)
    .style("filter", d => selectedCountry === d.country ? "url(#glow)" : null);
}

// End AI

  // Initially rendering with unemployment rate:
  d3.select("#indicator-select").property("value", "UnemploymentRate");
  updateChart();
  d3.select("#indicator-select").on("change", updateChart);
}