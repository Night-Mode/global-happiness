import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart4() {
  // Select containers
  const visualContainer = document.getElementById("chart-visual");
  const controlsContainer = document.getElementById("chart-controls");
  const legendContainer = document.getElementById("chart-legend");

  // Create or select subtitle element
  let subtitleElement = document.getElementById("chart-subtitle");
  if (!subtitleElement) {
    subtitleElement = document.createElement("div");
    subtitleElement.id = "chart-subtitle";
    subtitleElement.style.fontSize = "18px";
    subtitleElement.style.fontWeight = "normal";
    subtitleElement.style.marginTop = "10px";
    subtitleElement.style.marginBottom = "10px";
    subtitleElement.style.textAlign = "center";
    document.getElementById("chart-title").after(subtitleElement);
  }

  // Clear previous content
  visualContainer.innerHTML = "";
  controlsContainer.innerHTML = "";
  legendContainer.innerHTML = "";

  const titleElement = document.getElementById("chart-title");
  if (titleElement) {
    titleElement.textContent = "SDG Indicators Across Top 6 Data-Rich Countries";
  }

  // Chart title + dropdown into controls section
  controlsContainer.innerHTML = `
    <div style="text-align: left; margin-bottom: 10px;">
      <label for="indicator-select">Indicator:</label>
      <select id="indicator-select"></select>
    </div>
  `;

  // Append SVG to chart visual
  const rect = visualContainer.getBoundingClientRect();

  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;
  const innerWidth = width;
  const innerHeight = height;

  const svg = d3.select(visualContainer)
    .append("svg")
    .attr("id", "map")
    .attr("width", rect.width)
    .attr("height", rect.height);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define glow filter with darker border
  const defs = svg.append("defs");
  const filter = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  // Original blur for soft glow
  filter.append("feGaussianBlur")
    .attr("stdDeviation", 2)
    .attr("result", "blur");

  // Create a darker edge
  filter.append("feMorphology")
    .attr("operator", "dilate")
    .attr("radius", 2)
    .attr("in", "SourceGraphic")
    .attr("result", "edge");

  filter.append("feComponentTransfer")
    .attr("in", "edge")
    .attr("result", "darkEdge")
    .append("feFuncR")
    .attr("type", "linear")
    .attr("slope", 0.6); // Darken red channel
  filter.select("feComponentTransfer")
    .append("feFuncG")
    .attr("type", "linear")
    .attr("slope", 0.6); // Darken green channel
  filter.select("feComponentTransfer")
    .append("feFuncB")
    .attr("type", "linear")
    .attr("slope", 0.6); // Darken blue channel

  // Merge blur and dark edge
  filter.append("feMerge")
    .append("feMergeNode")
    .attr("in", "blur");
  filter.select("feMerge")
    .append("feMergeNode")
    .attr("in", "darkEdge");

  // Load data
  const data = await d3.json("data/final_data.json");
  data.forEach(d => d.Year = +d.Year);

  const indicators = [
    { key: "UnderFiveMortality", label: "Under-Five Mortality (per 1,000)" },
    { key: "DrinkingWater", label: "Drinking Water Access (%)" },
    { key: "UnemploymentRate", label: "Unemployment Rate (%)" }
  ];

  // Populate dropdown
  const indicatorSelect = d3.select("#indicator-select");
  indicatorSelect
    .selectAll("option")
    .data(indicators)
    .enter()
    .append("option")
    .attr("value", d => d.key)
    .text(d => d.label);

  const countries = [...new Set(data.map(d => d.Country))];
  const colorScale = d3.scaleOrdinal()
    .domain(countries)
    .range(d3.schemeCategory10.slice(0, countries.length));

  let selectedCountry = null; // Track highlighted country

  function updateChart() {
    const selectedIndicator = indicatorSelect.property("value");

    const selected = indicators.find(i => i.key === selectedIndicator);
    if (subtitleElement && selected) {
      subtitleElement.textContent = `Indicator: ${selected.label}`;
    }

    // Filter out invalid data points
    const validData = data.filter(d => d[selectedIndicator] != null && !isNaN(d[selectedIndicator]));
    const groupedData = d3.groups(validData, d => d.Country)
      .map(([country, values]) => ({
        country,
        values: values.sort((a, b) => a.Year - b.Year),
        maxValue: d3.max(values, v => v[selectedIndicator] || 0)
      }))
      .sort((a, b) => b.maxValue - a.maxValue);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year))
      .range([0, innerWidth]);

    const maxValue = d3.max(validData, d => d[selectedIndicator]) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0])
      .nice();

    const area = d3.area()
      .x(d => xScale(d.Year))
      .y0(innerHeight)
      .y1(d => yScale(d[selectedIndicator] || 0))
      .defined(d => d[selectedIndicator] != null && !isNaN(d[selectedIndicator]));

    // Clear previous chart elements
    chart.selectAll(".area").remove();
    chart.selectAll(".axis").remove();
    svg.selectAll(".title").remove();
    legendContainer.innerHTML = "";

    // Draw area paths
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
      .style("filter", d => selectedCountry === d.country ? "url(#glow)" : null);

    // X-axis
    const xAxis = chart.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    xAxis.selectAll("text").style("font-size", "14px");
    
    xAxis.append("text")
      .attr("fill", "black")
      .attr("x", innerWidth / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Year");

    // Y-axis
    const yAxis = chart.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale));
    
    yAxis.selectAll("text").style("font-size", "14px");
    
    yAxis.append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text(indicators.find(i => i.key === selectedIndicator).label);

    // Legend
    const legendSvg = d3.select(legendContainer)
      .append("svg")
      .attr("width", 300)
      .attr("height", countries.length * 25 + 60);

    legendSvg.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Click to enhance the estimate for a country");

    const legend = legendSvg.append("g")
      .attr("transform", `translate(10, 50)`);

    // Legend rectangles
    const legendRects = legend.selectAll("rect")
      .data(countries)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25)
      .attr("width", 15)
      .attr("height", 20)
      .attr("fill", d => colorScale(d))
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        selectedCountry = selectedCountry === d ? null : d;
        updateHighlight();
      });

    // Legend text
    const legendText = legend.selectAll("text.label")
      .data(countries)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", 20)
      .attr("y", (d, i) => i * 25 + 15)
      .text(d => d)
      .style("font-size", "16px")
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        selectedCountry = selectedCountry === d ? null : d;
        updateHighlight();
      });
  }

  function updateHighlight() {
    chart.selectAll(".area")
      .attr("opacity", 0.5)
      .attr("fill", d => selectedCountry === d.country 
        ? d3.color(colorScale(d.country)).darker(1)
        : colorScale(d.country))
      .attr("stroke", d => selectedCountry === d.country 
        ? d3.color(colorScale(d.country)).darker(2) 
        : d3.color(colorScale(d.country)).darker(1))
      .attr("stroke-width", d => selectedCountry === d.country ? 5 : 1)
      .style("filter", d => selectedCountry === d.country ? "url(#glow)" : null);
  }

  // Default selection and render
  indicatorSelect.property("value", "UnderFiveMortality");
  updateChart();
  indicatorSelect.on("change", updateChart);
}