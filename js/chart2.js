// Start AI:

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart2() {
  // Select containers
  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");
  const tooltip = d3.select(".tooltip");

  // Clear previous content
  visualContainer.innerHTML = "";
  legendContainer.innerHTML = "";
  const titleElement = document.getElementById("chart-title");
  if (titleElement) titleElement.textContent = "Happiness Factors";
// End AI

  // Create SVG Element:
  const rect = visualContainer.getBoundingClientRect();
  const svg = d3.select(visualContainer)
    .append("svg")
    .attr("width", rect.width)
    .attr("height", rect.height);

  // Create legend SVG:
  const legendSvg = d3.select(legendContainer)
    .append("svg")
    .attr("width", 300)
    .attr("height", 250);

  // Set margins as done in previous projects:
  const margin = { top: 40, right: 100, bottom: 70, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  // Define keys based on the report components:
  const keys = [
    "Explained by: Log GDP per capita",
    "Explained by: Social support",
    "Explained by: Healthy life expectancy",
    "Explained by: Freedom to make life choices",
    "Explained by: Generosity",
    "Explained by: Perceptions of corruption"
  ];
  // Had to fix this Congo label:
  const aliases = { "Democratic Republic of the Congo": "DR Congo" };

  // Load the data:
  const geoData = await d3.json("data/merged_data_195.geojson");
  let data = geoData.features.map(d => d.properties).sort((a, b) => b["Ladder score"] - a["Ladder score"]);
  
  // Filtering to get the top and bottom ten countries in terms of ladder score: 
  const top10 = data.slice(0, 10);
  const bottom10 = data.filter(d => d["Ladder score"] > 0).slice(-10);

  // Start AI
  [top10, bottom10].forEach(set =>
    set.forEach(d => {
      d.total = keys.reduce((sum, key) => sum + (+d[key] || 0), 0);
      d.ladderScore = d["Ladder score"];
    })
  );

  // End AI

  // Creating a tooltip similar to the first chart (inspired from this reference: https://d3-graph-gallery.com/graph/interactivity_tooltip.html):
  tooltip.style({
    position: "absolute",
    background: "#fff",
    padding: "5px",
    "border-radius": "4px",
    "box-shadow": "0 2px 5px rgba(0,0,0,0.2)",
    display: "none",
    font: "12px Arial"
  });

  // Shared y-domain:
  const yDomainMax = d3.max(top10.concat(bottom10), d => d.total) * 1.1;

  // Create stacked bar chart, inspired from this reference: https://observablehq.com/@d3/stacked-bar-chart/2
  function createChart(dataset, xOffset, title, sortKey = "total") {
    const sorted = [...dataset].sort((a, b) =>
      sortKey === "total" ? b.total - a.total : b[sortKey] - a[sortKey]
    );
    // Using d3.stack() and using keys() argument:
    const stack = d3.stack().keys(keys)(sorted);
    const chartWidth = width / 2 - 20;
    
    // Creating based on reference functionality:
    const x = d3.scaleBand()
      .domain(sorted.map(d => d["ADMIN"]))
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, yDomainMax])
      .range([height, 0]);


    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);

    const g = svg.append("g").attr("transform", `translate(${xOffset},${margin.top})`);

    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text(title);

    // This was inspired by the reference,
    // but also some AI help to get the cool mouseover functionality and sorting, 
    // which was a bit tricky to implement:
    stack.forEach(s => {
      g.append("g")
        .attr("fill", color(s.key))
        .selectAll("rect")
        .data(s)
        .join("rect")
        .attr("x", d => x(d.data["ADMIN"]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(`${d.data["ADMIN"]}<br>${s.key.replace(/^Explained by:\s*/, "")}: ${
              ((d[1] - d[0]) / d.data.ladderScore * 100).toFixed(0)
            }%`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", event => 
          tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 10}px`)
        )
        .on("mouseout", () => tooltip.style("display", "none"));
    });

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .text(d => aliases[d] || d)
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end")
      .style("font-size", "14px");

    g.append("g")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .selectAll("text")
      .style("font-size", "14px");
  }


  // Create legend function with sorting capabilities:
  function createLegend(sortKey) {
    legendSvg.selectAll("*").remove();
    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);
    const allKeys = ["total"].concat(keys);

    const g = legendSvg.append("g").attr("transform", "translate(10,30)");
    g.append("text")
      .attr("y", -10)
      .style("font", "18px Arial")
      .style("fill", "#666")
      .text("Click to sort by a component");

    g.selectAll("g")
      .data(allKeys)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * 24})`)
      .call(g => g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => d === "total" ? "#ccc" : color(d))
        .style("cursor", "pointer")
        .on("click", (event, d) => update(d)))
      .call(g => g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font", "16px Arial")
        .style("cursor", "pointer")
        .text(d => d === "total" ? "Total" : d.replace(/^Explained by:\s*/, ""))
        .on("click", (event, d) => update(d)));
  }

  // Update function
  function update(newSortKey) {
    svg.selectAll("g").remove();
    createChart(top10, margin.left, "Top 10 Happiest Countries", newSortKey);
    createChart(bottom10, width / 2 + margin.left + 40, "Bottom 10 Happiest Countries", newSortKey);
    createLegend(newSortKey);
  }

  // End help

  // Initial rendering in terms of the "total" category:
  let sortKey = "total";
  createChart(top10, margin.left, "Top 10 Happiest Countries", sortKey);
  createChart(bottom10, width / 2 + margin.left + 40, "Bottom 10 Happiest Countries", sortKey);
  createLegend(sortKey);
}