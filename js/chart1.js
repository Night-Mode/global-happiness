// chart.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart1() {
  // Clear chart container
  const container = document.getElementById("chart-container");
  container.innerHTML = `
    <div style="display: flex;">
      <svg id="map" width="960" height="600"></svg>
      <div id="legend-container">
        <svg id="legend-svg" width="250" height="100"></svg>
      </div>
    </div>
    <div class="tooltip"></div>
  `;

  const svg = d3.select("#map");
  const legendSvg = d3.select("#legend-svg");
  const margin = { top: 50, right: 60, bottom: 30, left: 50 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  // Create chart group with margins
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add title
  svg.append("text")
    .attr("x", +svg.attr("width") / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font", "bold 20px Arial, sans-serif")
    .text("Global Happiness Scores");

  // Load GeoJSON data (assumes file is in the same directory)
  const geoData = await d3.json("data/merged_data_195.geojson");
  const projection = d3.geoMercator().fitSize([width, height], geoData);
  const path = d3.geoPath().projection(projection);

  // Color scale
  const ladderScores = geoData.features
    .map(d => d.properties["Ladder score"])
    .filter(d => d > 0);
  const [minScore, maxScore] = d3.extent(ladderScores);
  const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([minScore, maxScore]);

  // Tooltip
  const tooltip = d3.select(".tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("display", "none");

  // Draw map
  chartGroup.selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => d.properties["Ladder score"] > 0 ? colorScale(d.properties["Ladder score"]) : "#ccc")
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      const name = d.properties["ADMIN"] || d.properties["Country name"] || "Unknown";
      const score = d.properties["Ladder score"] > 0 ? d.properties["Ladder score"].toFixed(2) : "No Data Available";
      tooltip.style("display", "block")
        .html(`${name}<br>Happiness: ${score}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", function () {
      tooltip.style("display", "none");
    });

  // Zoom functionality
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => chartGroup.attr("transform", event.transform));
  svg.call(zoom);

  // Legend
  const legendWidth = 200;
  legendSvg.selectAll("*").remove();
  legendSvg.attr("transform", `translate(10, 10)`);

  const gradient = legendSvg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient");
  gradient.selectAll("stop")
    .data(d3.range(10))
    .join("stop")
    .attr("offset", d => `${(d / 9) * 100}%`)
    .attr("stop-color", d => colorScale(minScore + (maxScore - minScore) * (d / 9)));

  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#gradient)");

  legendSvg.append("g")
    .attr("transform", `translate(0, 10)`)
    .call(d3.axisBottom(d3.scaleLinear()
      .domain([minScore, maxScore])
      .range([0, legendWidth]))
      .ticks(5)
      .tickFormat(d3.format(".2f")))
    .call(g => g.select(".domain").remove());

  legendSvg.append("text")
    .attr("x", -10)
    .attr("y", 5)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text("Happiness Score");

  legendSvg.append("rect")
    .attr("x", legendWidth + 10)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 10)
    .style("fill", "#ccc");

  legendSvg.append("text")
    .attr("x", legendWidth + 35)
    .attr("y", 5)
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .text("No Data");
}