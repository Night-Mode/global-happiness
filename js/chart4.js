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

  const legendSvg = d3.select(legendContainer)
    .append("svg")
    .attr("id", "legend-svg")
    .attr("width", 250)
    .attr("height", 100);
    
  const data = await d3.json("data/top_6_data_countries.json");
  data.forEach(d => d.Year = +d.Year);

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

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const countries = [...new Set(data.map(d => d.Country))];
  const colorScale = d3.scaleOrdinal()
    .domain(countries)
    .range(d3.schemeCategory10.slice(0, countries.length));

  function updateChart() {
    const selectedIndicator = indicatorSelect.property("value");

    const groupedData = d3.groups(data, d => d.Country)
      .map(([country, values]) => ({
        country,
        values: values.sort((a, b) => a.Year - b.Year),
        maxValue: d3.max(values, v => v[selectedIndicator] || 0)
      }))
      .sort((a, b) => b.maxValue - a.maxValue);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[selectedIndicator]) * 1.1 || 1])
      .range([innerHeight, 0]);

    const area = d3.area()
      .x(d => xScale(d.Year))
      .y0(innerHeight)
      .y1(d => yScale(d[selectedIndicator] || 0));

    chart.selectAll(".area").remove();
    chart.selectAll(".axis").remove();
    svg.selectAll(".title").remove();
    legendContainer.innerHTML = "";

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
      
    const legendSvg = d3.select(legendContainer)
      .append("svg")
      .attr("width", 250)
      .attr("height", countries.length * 25 + 50); 

    // Add legend title separately
    legendSvg.append("text")
    .attr("x", 10)
    .attr("y", 20)
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Country Legend");

    // Add legend items in a separate group, pushed further down
    const legend = legendSvg.append("g")
    .attr("transform", `translate(10, 45)`);  // ← moved down from 30 to 45


    // Legend items
    legend.selectAll("rect")
      .data(countries)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25)
      .attr("width", 15)
      .attr("height", 20)
      .attr("fill", d => colorScale(d));

    legend.selectAll("text.label")
      .data(countries)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", 20)
      .attr("y", (d, i) => i * 25 + 15)
      .text(d => d)
      .style("font-size", "16px");
  }

  // Default selection and render
  indicatorSelect.property("value", "UnderFiveMortality");
  updateChart();
  indicatorSelect.on("change", updateChart);
}
