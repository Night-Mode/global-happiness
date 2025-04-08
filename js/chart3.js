// chart3.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart3() {
  // Clear chart container
  const container = document.getElementById("chart-container");
  container.innerHTML = `
    <label for="x-axis">X-Axis:</label>
    <select id="x-axis"></select>

    <label for="y-axis">Y-Axis:</label>
    <select id="y-axis"></select>

    <div style="display: flex;">
      <svg id="scatterplot" width="800" height="500"></svg>
      <div id="legend-container">
        <svg id="legend-svg" width="150" height="250"></svg>
      </div>
    </div>
    <div class="tooltip"></div>
  `;

  const svg = d3.select("#scatterplot");
  const legendSvg = d3.select("#legend-svg");
  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const chartGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const xAxisGroup = chartGroup.append("g").attr("transform", `translate(0,${height})`);
  const yAxisGroup = chartGroup.append("g");

  const xAxisLabel = chartGroup.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px");

  const yAxisLabel = chartGroup.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px");

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

  legendSvg.selectAll("*").remove();
  legendSvg.append("text")
    .attr("x", 10)
    .attr("y", 15)
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Happiness Score");

  legendSvg.selectAll("rect")
    .data(happinessBins.slice(0, -1))
    .enter()
    .append("rect")
    .attr("x", 10)
    .attr("y", (d, i) => 30 + i * 30)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d, i) => colorScale(happinessBins[i]));

  legendSvg.selectAll("text.legend-label")
    .data(legendCategories)
    .enter()
    .append("text")
    .attr("class", "legend-label")
    .attr("x", 40)
    .attr("y", (d, i) => 45 + i * 30)
    .attr("font-size", "12px")
    .text(d => d);

  function updateChart() {
    const xAttr = xSelect.node().value;
    const yAttr = ySelect.node().value;

    xScale.domain(d3.extent(data, d => d[xAttr]));
    yScale.domain(d3.extent(data, d => d[yAttr]));

    xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale));
    yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale));
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

  xSelect.property("value", "Log GDP per capita");
  ySelect.property("value", "Healthy Life Expectancy");
  updateChart();
  xSelect.on("change", updateChart);
  ySelect.on("change", updateChart);
}
