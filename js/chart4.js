// chart2.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart4() {
  // Clear chart container
  const container = document.getElementById("chart-container");
  container.innerHTML = `
    <div id="title" style="font: bold 20px Arial, sans-serif; text-align: center; margin-bottom: 10px;">
      SDG Indicators Across Top 6 Data-Rich Countries
    </div>
    <div style="text-align: center; margin-bottom: 10px;">
      <label for="indicator-select">Indicator:</label>
      <select id="indicator-select"></select>
    </div>
    <svg id="areachart" width="800" height="500"></svg>
  `;

  // Load data
  const data = await d3.json("data/top_6_data_countries.json");
  data.forEach(d => (d.Year = +d.Year));

  // Define indicators for the dropdown
  const indicators = [
    { key: "UnderFiveMortality", label: "Under-Five Mortality (per 1,000)" },
    { key: "SecondaryEducation", label: "Secondary Education (%)" },
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

  // Set up dimensions
  const width = +d3.select("#areachart").attr("width");
  const height = +d3.select("#areachart").attr("height");
  const margin = { top: 40, right: 120, bottom: 40, left: 120 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create SVG and chart group
  const svg = d3.select("#areachart");
  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Get unique countries and set color scale
  const countries = [...new Set(data.map(d => d.Country))];
  const colorScale = d3.scaleOrdinal()
    .domain(countries)
    .range(d3.schemeCategory10.slice(0, countries.length));

  // Function to update the chart
  function updateChart() {
    const selectedIndicator = indicatorSelect.property("value");

    // Group data by country and sort by max value (descending)
    const groupedData = d3.groups(data, d => d.Country)
      .map(([country, values]) => ({
        country,
        values: values.sort((a, b) => a.Year - b.Year),
        maxValue: d3.max(values, v => v[selectedIndicator] || 0)
      }))
      .sort((a, b) => b.maxValue - a.maxValue); // Higher max values first

    // Update scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[selectedIndicator]) * 1.1 || 1])
      .range([innerHeight, 0]);

    // Define the area generator
    const area = d3.area()
      .x(d => xScale(d.Year))
      .y0(innerHeight)
      .y1(d => yScale(d[selectedIndicator] || 0));

    // Clear previous chart content
    chart.selectAll(".area").remove();
    chart.selectAll(".axis").remove();
    svg.selectAll(".title").remove();
    svg.selectAll(".legend").remove();

    // Draw areas for each country
    chart.selectAll(".area")
      .data(groupedData)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("d", d => area(d.values))
      .attr("fill", d => colorScale(d.country))
      .attr("opacity", 0.5)
      .attr("stroke", d => d3.color(colorScale(d.country)).darker(1))
      .attr("stroke-width", 1);

    // Add axes
    chart.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .append("text")
      .attr("fill", "black")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .text("Year");

    chart.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .text(indicators.find(i => i.key === selectedIndicator).label);

    // Update title
    svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text(`${indicators.find(i => i.key === selectedIndicator).label} (2015–2023)`);

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth + margin.left + 20}, 20)`);

    legend.selectAll("rect")
      .data(countries)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colorScale(d));

    legend.selectAll("text")
      .data(countries)
      .enter()
      .append("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 25 + 12)
      .text(d => d)
      .style("font-size", "12px");
  }

  // Initial render and update on change
  indicatorSelect.property("value", "UnderFiveMortality"); // Set default value
  updateChart();
  indicatorSelect.on("change", updateChart);
}