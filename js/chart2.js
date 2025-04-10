import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart2() {
  // Select containers
  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");
  const tooltip = d3.select(".tooltip");
  

  // Clear previous content
  visualContainer.innerHTML = "";
  
  const titleElement = document.getElementById("chart-title");
  if (titleElement) {
    titleElement.textContent = "Happiness Factors";
  }

  // Append SVG to chart visual
  const rect = visualContainer.getBoundingClientRect();

  const svg = d3.select(visualContainer)
    .append("svg")
    .attr("id", "map")
    .attr("width", rect.width)
    .attr("height", rect.height);

  const legendSvg = d3.select(legendContainer)
    .append("svg")
    .attr("id", "legend-svg")
    .attr("width", 250) // Increase width if needed
    .attr("height", 100); // Initial height, will resize in createLegend

  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  const keys = [
    "Explained by: Log GDP per capita",
    "Explained by: Social support",
    "Explained by: Healthy life expectancy",
    "Explained by: Freedom to make life choices",
    "Explained by: Generosity",
    "Explained by: Perceptions of corruption"
  ];

  const geoData = await d3.json("data/merged_data_195.geojson");
  let data = geoData.features.map(d => d.properties).sort((a, b) => b["Ladder score"] - a["Ladder score"]);
  const top10 = data.slice(0, 10);
  const bottom10 = data.filter(d => d["Ladder score"] > 0).slice(-10);

  [top10, bottom10].forEach(set =>
    set.forEach(d => {
      d.total = keys.reduce((sum, key) => sum + (+d[key] || 0), 0);
      d.ladderScore = d["Ladder score"];
    })
  );

  tooltip
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
    .style("display", "none")
    .style("font", "12px Arial");

  // svg.append("text")
  //   .attr("x", width / 2)
  //   .attr("y", 20)
  //   .attr("text-anchor", "middle")
  //   .style("font", "bold 20px Arial")
  //   .text("Happiness Factors");

  function createChart(dataset, yOffset, title, sortKey = "total") {
    const sorted = [...dataset].sort((a, b) =>
      sortKey === "total" ? b.total - a.total : b[sortKey] - a[sortKey]
    );

    const stack = d3.stack().keys(keys)(sorted);
    const x = d3.scaleLinear().domain([0, d3.max(sorted, d => d.total) * 1.1]).range([margin.left, width - margin.right]);
    const y = d3.scaleBand().domain(sorted.map(d => d["ADMIN"])).range([margin.top, height - margin.bottom]).padding(0.1);
    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);

    const g = svg.append("g").attr("transform", `translate(0,${yOffset})`);

    g.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(title);

    stack.forEach(s => {
      g.append("g")
        .attr("fill", color(s.key))
        .selectAll("rect")
        .data(s)
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d.data["ADMIN"]))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip
            .style("display", "block")
            .html(`${d.data["ADMIN"]}<br>${s.key.replace(/^Explained by:\s*/, "")}: ${
              ((d[1] - d[0]) / d.data.ladderScore * 100).toFixed(0)
            }%`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style("display", "none");
        });
    });

    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }

  // function createLegend(sortKey) {
  //   const legendSvg = d3.select(legendContainer)
  //     .append("svg")
  //     .attr("width", 900)
  //     .attr("height", 100);

  //   const legend = legendSvg.append("g").attr("transform", `translate(${margin.left},10)`);
  //   const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);

  //   legend.append("text")
  //     .attr("x", 0)
  //     .attr("y", -10)
  //     .style("font", "14px Arial")
  //     .style("fill", "#666")
  //     .text("Click to sort");

  //   legend.selectAll("g")
  //     .data(["total"].concat(keys))
  //     .join("g")
  //     .attr("transform", (d, i) => `translate(${(i % 3) * 200},${Math.floor(i / 3) * 20})`)
  //     .each(function (d) {
  //       const g = d3.select(this);
  //       g.append("rect")
  //         .attr("width", 15)
  //         .attr("height", 15)
  //         .attr("fill", d === "total" ? "#ccc" : color(d))
  //         .on("click", () => update(d));
  //       g.append("text")
  //         .attr("x", 20)
  //         .attr("y", 12)
  //         .style("font", "12px Arial")
  //         .text(d === "total" ? "Total" : d.replace(/^Explained by:\s*/, ""))
  //         .call(wrap, 180)
  //         .on("click", () => update(d));
  //     });
  // }

  function createLegend(sortKey) {
    // Clear previous legend content
    legendSvg.selectAll("*").remove();
  
    const paddingTop = 20;
    const rowHeight = 24;
  
    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);
    const allKeys = ["total"].concat(keys);
    const legendHeight = paddingTop + allKeys.length * rowHeight;
  
    // Update height to fit content
    legendSvg.attr("height", legendHeight);
  
    const legend = legendSvg.append("g").attr("transform", `translate(10,${paddingTop})`);
  
    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font", "14px Arial")
      .style("fill", "#666")
      .text("Click to sort by component");
  
    const groups = legend.selectAll("g")
      .data(allKeys)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * rowHeight})`);
  
    groups.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => d === "total" ? "#ccc" : color(d))
      .style("cursor", "pointer")
      .on("click", (event, d) => update(d));
  
    groups.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font", "12px Arial")
      .style("cursor", "pointer")
      .text(d => d === "total" ? "Total" : d.replace(/^Explained by:\s*/, ""))
      .on("click", (event, d) => update(d));
  }
  
  // function wrap(text, width) {
  //   text.each(function () {
  //     const text = d3.select(this);
  //     const words = text.text().split(/\s+/).reverse();
  //     const lineHeight = 1.1;
  //     const y = text.attr("y");
  //     let line = [];
  //     let lineNumber = 0;
  //     let tspan = text.text(null).append("tspan").attr("x", 20).attr("y", y);
  //     while (words.length) {
  //       line.push(words.pop());
  //       tspan.text(line.join(" "));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [words[words.length - 1]];
  //         tspan = text.append("tspan")
  //           .attr("x", 20)
  //           .attr("y", y)
  //           .attr("dy", `${++lineNumber * lineHeight}em`)
  //           .text(line.pop());
  //       }
  //     }
  //   });
  // }

  function update(newSortKey) {
    svg.selectAll("g").remove();
    svg.select("text").remove();

    createChart(top10, 30, "Top 10 Happiest Countries", newSortKey);
    createChart(bottom10, height + 10, "Bottom 10 Happiest Countries", newSortKey);
    createLegend(newSortKey);
  }

  let sortKey = "total";
  createChart(top10, 30, "Top 10 Happiest Countries", sortKey);
  createChart(bottom10, height + 10, "Bottom 10 Happiest Countries", sortKey);
  createLegend(sortKey);
}
