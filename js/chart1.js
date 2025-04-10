import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart1() {
  await new Promise(resolve => setTimeout(resolve, 0)); // tiny delay to ensure DOM is ready
  
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
  if (titleElement) {
    titleElement.textContent = "Global Happiness Scores";
  }
      
  // Append SVG to chart visual
  const rect = visualContainer.getBoundingClientRect();

  const svg = d3.select(visualContainer)
    .append("svg")
    .attr("id", "map")
    .attr("width", rect.width)
    .attr("height", rect.height);

    const existingFloatingLegend = document.getElementById("map-floating-legend");
    if (existingFloatingLegend) existingFloatingLegend.remove();
    
    // Create a new floating legend div
    const floatingLegend = document.createElement("div");
    floatingLegend.id = "map-floating-legend";
    floatingLegend.style.position = "absolute";
    floatingLegend.style.bottom = "20px";
    floatingLegend.style.left = "20px";
    floatingLegend.style.background = "rgba(255, 255, 255, 0.9)";
    floatingLegend.style.padding = "0.75rem 1rem";
    floatingLegend.style.border = "1px solid #ccc";
    floatingLegend.style.borderRadius = "6px";
    floatingLegend.style.zIndex = "1000";
    floatingLegend.style.pointerEvents = "auto"; // allow interaction
    
    // Append to the chart container directly
    document.getElementById("chart-container").appendChild(floatingLegend);
    
    // Now create an SVG inside this div
    const legendSvg = d3.select(floatingLegend)
      .append("svg")
      .attr("id", "legend-svg")
      .attr("width", 300)
      .attr("height", 50);

  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  // Chart group
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Load GeoJSON
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

  // Tooltip styling (in case it's not styled yet)
  tooltip
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
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

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", (event) => chartGroup.attr("transform", event.transform));
  
  svg.call(zoom);

  // Apply default zoom transform (e.g., 1.2x)
  const defaultScale = 1.5;
  const defaultTranslate = [-(width * (defaultScale - 1)) / 2, -(height * (defaultScale - 1)) / 2];
  svg.call(zoom.transform, d3.zoomIdentity.translate(...defaultTranslate).scale(defaultScale));


  // Legend
  const legendWidth = 200;
  const legendYOffset = 18; // Space reserved for title

  const gradient = legendSvg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient");

  gradient.selectAll("stop")
    .data(d3.range(10))
    .join("stop")
    .attr("offset", d => `${(d / 9) * 100}%`)
    .attr("stop-color", d => colorScale(minScore + (maxScore - minScore) * (d / 9)));

    legendSvg.append("rect")
    .attr("x", 0)
    .attr("y", legendYOffset)
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#gradient)");

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendYOffset + 10})`) // push below gradient
    .call(d3.axisBottom(d3.scaleLinear()
      .domain([minScore, maxScore])
      .range([0, legendWidth]))
      .ticks(5)
      .tickFormat(d3.format(".2f")))
    .call(g => g.select(".domain").remove());

  legendSvg.append("text")
    .attr("x", 0)
    .attr("y", legendYOffset - 6) // a little padding above the gradient
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
    .attr("y", legendYOffset + 9)  // visually centered with the rect
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .style("dominant-baseline", "middle")
    .text("No Data");
}
