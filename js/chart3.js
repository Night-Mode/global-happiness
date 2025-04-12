// chart3.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart3() {
  // Clear chart sections
  const visualContainer = document.getElementById("chart-visual");
  const controlsContainer = document.getElementById("chart-controls");
  const legendContainer = document.getElementById("chart-legend");

  visualContainer.innerHTML = "";
  controlsContainer.innerHTML = "";
  legendContainer.innerHTML = "";

  const titleElement = document.getElementById("chart-title");
  if (titleElement) {
    titleElement.textContent = "Exploring Correlates of Global Happiness";
  }

  // Create dropdowns with helpful instruction
  controlsContainer.innerHTML = `
    <p style="margin-bottom: 0.5rem; font-size: 16px;">
      <em>Select variables for the X and Y axes to explore relationships with happiness scores.</em>
    </p>
    <label for="x-axis"><strong>X-Axis:</strong></label>
    <select id="x-axis" style="width: 100%; margin-bottom: 1rem;"></select>

    <label for="y-axis"><strong>Y-Axis:</strong></label>
    <select id="y-axis" style="width: 100%;"></select>
  `;

  const rect = visualContainer.getBoundingClientRect();

  const svg = d3.select(visualContainer)
    .append("svg")
    .attr("id", "scatterplot")
    .attr("width", rect.width)
    .attr("height", rect.height);

  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxisGroup = chartGroup.append("g")
    .attr("transform", `translate(0,${height})`);

  const yAxisGroup = chartGroup.append("g");

  const xAxisLabel = chartGroup.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px");

  const yAxisLabel = chartGroup.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "18px");

  const tooltip = d3.select(".tooltip");

  const data = await d3.csv("data/scatterplot.csv", d3.autoType);
  const numericalColumns = Object.keys(data[0]).filter(d => d !== "Country" && d !== "Ladder Score");

  const xSelect = d3.select("#x-axis");
  const ySelect = d3.select("#y-axis");

  numericalColumns.forEach(dim => {
    xSelect.append("option").text(dim).attr("value", dim);
    ySelect.append("option").text(dim).attr("value", dim);
  });

  let xScale = d3.scaleLinear().range([0, width]);
  let yScale = d3.scaleLinear().range([height, 0]);

  const happinessBins = [0, 2, 4, 6, 8];
  const colorScale = d3.scaleThreshold()
    .domain(happinessBins.slice(1))
    .range(["#e41a1c", "#ffcc00", "#4daf4a", "#377eb8"]);

  const legendCategories = ["0-2", "2-4", "4-6", "6-8"];

// Build legend
const legendSvg = d3.select(legendContainer)
  .append("svg")
  .attr("width", 250)
  .attr("height", 175); // Match radar legend height

const legendLabels = [
  { label: "6 - 8", color: "#377eb8" },
  { label: "4 - 6", color: "#4daf4a" },
  { label: "2 - 4", color: "#ffcc00" },
  { label: "0 - 2", color: "#e41a1c" }
];

const legendGroup = legendSvg.append("g").attr("transform", "translate(10,20)");

// Add title
legendGroup.append("text")
  .attr("x", 0)
  .attr("y", 10)
  .attr("font-size", "18px")
  .attr("font-weight", "bold")
  .text("Country Happiness Score");

const legendItemHeight = 30;
const items = legendGroup.selectAll(".legend-item")
  .data(legendLabels)
  .enter()
  .append("g")
  .attr("class", "legend-item")
  .attr("transform", (d, i) => `translate(0, ${i * legendItemHeight + 35})`);

items.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 18)
  .attr("height", 18)
  .attr("fill", d => d.color);

items.append("text")
  .attr("x", 24)
  .attr("y", 15)
  .attr("font-size", "16px")
  .text(d => d.label);


function updateChart() {
  const xAttr = xSelect.node().value;
  const yAttr = ySelect.node().value;

  xScale.domain(d3.extent(data, d => d[xAttr]));
  yScale.domain(d3.extent(data, d => d[yAttr]));

  xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale))
  .selectAll("text")
  .style("font-size", "14px");
  yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale))
  .selectAll("text")
  .style("font-size", "14px"); ;
  xAxisLabel.text(xAttr);
  yAxisLabel.text(yAttr);

  const circles = chartGroup.selectAll("circle").data(data);

  circles.enter()
    .append("circle")
    .attr("r", 8)
    .merge(circles)
    .transition()
    .duration(500)
    .attr("cx", d => xScale(d[xAttr]))
    .attr("cy", d => yScale(d[yAttr]))
    .attr("fill", d => colorScale(d["Ladder Score"]));

  svg.selectAll("circle")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 12);
      tooltip.style("display", "block")
        .html(`<strong>${d["Country"]}</strong><br>${xAttr}: ${d[xAttr]}<br>${yAttr}: ${d[yAttr]}<br>Happiness Score: ${d["Ladder Score"]}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(200).attr("r", 8);
      tooltip.style("display", "none");
    });

  circles.exit().remove();
  }

  // Set default selection and update
  xSelect.property("value", "Log GDP per capita");
  ySelect.property("value", "Healthy Life Expectancy");
  updateChart();
  xSelect.on("change", updateChart);
  ySelect.on("change", updateChart);
}
