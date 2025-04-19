// Start AI:

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart1() {
  // Select containers
  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");
  const tooltip = d3.select(".tooltip");
  const uiContainer = document.getElementById("chart-ui");
  if (uiContainer) uiContainer.style.display = "none";

  // Clear previous content
  visualContainer.innerHTML = "";
  legendContainer.innerHTML = "";
  const titleElement = document.getElementById("chart-title");
  if (titleElement) titleElement.textContent = "Global Happiness Scores";

  // End AI

  // Create SVG element:
  const rect = visualContainer.getBoundingClientRect();
  const svg = d3.select(visualContainer)
    .append("svg")
    .attr("id", "map")
    .attr("width", rect.width)
    .attr("height", rect.height);

  // Create "floating" legend (AI help on this because I had a lot of issues with getting the legend in the right spot):
  const existingFloatingLegend = document.getElementById("map-floating-legend");
  if (existingFloatingLegend) existingFloatingLegend.remove();
  const floatingLegend = document.createElement("div");
  floatingLegend.id = "map-floating-legend";
  Object.assign(floatingLegend.style, {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    background: "rgba(255, 255, 255, 0.9)",
    padding: "0.75rem 1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    zIndex: "1000",
    pointerEvents: "auto"
  });
  document.getElementById("chart-container").appendChild(floatingLegend);


  const legendSvg = d3.select(floatingLegend)
    .append("svg")
    .attr("id", "legend-svg")
    .attr("width", 300)
    .attr("height", 50);

  // End help

  // Set margins and dimensions as done in previous assignments:
  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  // Create group element:
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Load the data:
  const geoData = await d3.json("data/merged_data_195.geojson");
  const projection = d3.geoMercator().fitSize([width, height], geoData);
  const path = d3.geoPath().projection(projection);

  // Create threshold color scale- as done similarly in this reference: https://d3-graph-gallery.com/graph/choropleth_basic.html
  const ladderScores = geoData.features
    .map(d => d.properties["Ladder score"])
    .filter(d => d > 0);
  const [minScore, maxScore] = d3.extent(ladderScores);
  const scoreDomain = d3.range(minScore, maxScore, (maxScore - minScore) / 6); 
  const colorScale = d3.scaleThreshold()
    .domain(scoreDomain)
    .range(d3.schemeYlOrRd[7]); // Creating intervals based on the range of the happiness scores

  // Creating tooltip inspired by this reference: https://d3-graph-gallery.com/graph/interactivity_tooltip.html:
  tooltip.style({
    position: "absolute",
    background: "#fff",
    padding: "5px",
    "border-radius": "4px",
    "box-shadow": "0 2px 5px rgba(0,0,0,0.2)",
    display: "none"
  });

  // Drawing map with the help of the reference defined above.
  chartGroup.selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => d.properties["Ladder score"] > 0 ? colorScale(d.properties["Ladder score"]) : "#ccc")
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    // Creating mouseover functionality with some AI help to get the cool accessibility factor! 
    .on("mouseover", (event, d) => {
      const name = d.properties["ADMIN"] || d.properties["Country name"] || "Unknown";
      const score = d.properties["Ladder score"] > 0 ? d.properties["Ladder score"].toFixed(2) : "No Data Available";
      tooltip.style("display", "block")
        .html(`${name}<br>Happiness: ${score}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  // End help

  // Zoom and centering as done in the in-class activity!:
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => chartGroup.attr("transform", event.transform));
  svg.call(zoom);

  // Centering the map within the bounds so the user can't zoom out too much. 
  const bounds = path.bounds(geoData);
  const mapCenterX = (bounds[0][0] + bounds[1][0]) / 2;
  const mapCenterY = (bounds[0][1] + bounds[1][1]) / 2;
  const defaultScale = 1.5;
  const translateX = width / 2 - mapCenterX * defaultScale + margin.left;
  const translateY = height / 2 - mapCenterY * defaultScale + margin.top;
  svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(defaultScale));

  // Legend help again to get the correct sizing and labeling: 
  const legendWidth = 200;
  const legendYOffset = 18;
  const legendBins = colorScale.range();

  // Draw legend rectangles
  legendSvg.selectAll("rect.legend")
    .data(legendBins)
    .join("rect")
    .attr("class", "legend")
    .attr("x", (d, i) => (legendWidth / legendBins.length) * i)
    .attr("y", legendYOffset)
    .attr("width", legendWidth / legendBins.length)
    .attr("height", 10)
    .style("fill", d => d);

  // Legend axis
  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendYOffset + 10})`)
    .call(d3.axisBottom(d3.scaleLinear()
      .domain([minScore, maxScore])
      .range([0, legendWidth]))
      .ticks(5)
      .tickFormat(d3.format(".2f")))
    .call(g => g.select(".domain").remove());

  // Legend labels
  legendSvg.append("text")
    .attr("x", 0)
    .attr("y", legendYOffset - 6)
    .text("Happiness Ladder Score")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("fill", "#333");

  legendSvg.append("rect")
    .attr("x", legendWidth + 10)
    .attr("y", legendYOffset)
    .attr("width", 20)
    .attr("height", 10)
    .style("fill", "#ccc");

  legendSvg.append("text")
    .attr("x", legendWidth + 35)
    .attr("y", legendYOffset + 9)
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .style("dominant-baseline", "middle")
    .text("No Data");
}

// End legend help. 