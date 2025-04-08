// chart1.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart2() {
  // Clear chart container
  const container = document.getElementById("chart-container");
  container.innerHTML = `
    <svg id="barchart" width="900" height="700"></svg>
    <div class="tooltip"></div>
  `;

  const svg = d3.select("#barchart");
  const margin = { top: 40, right: 70, bottom: 50, left: 150 };
  const width = +svg.attr("width");
  const height = 300; // Height for each chart
  const keys = [
    "Explained by: Log GDP per capita",
    "Explained by: Social support",
    "Explained by: Healthy life expectancy",
    "Explained by: Freedom to make life choices",
    "Explained by: Generosity",
    "Explained by: Perceptions of corruption"
  ];

  // Load GeoJSON data
  const geoData = await d3.json("data/merged_data_195.geojson");
  let data = geoData.features
    .map(d => d.properties)
    .sort((a, b) => b["Ladder score"] - a["Ladder score"]);
  const top10 = data.slice(0, 10);
  const bottom10 = data.filter(d => d["Ladder score"] > 0).slice(-10);

  // Calculate total for each country
  [top10, bottom10].forEach(set =>
    set.forEach(d => {
      d.total = keys.reduce((sum, key) => sum + (+d[key] || 0), 0);
      d.ladderScore = d["Ladder score"];
    })
  );

  // Tooltip
  const tooltip = d3.select(".tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("display", "none")
    .style("font", "12px Arial");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font", "bold 20px Arial")
    .text("Happiness Factors");

  // Chart creation function
  function createChart(dataset, yOffset, title, sortKey = "total") {
    const sorted = [...dataset].sort((a, b) =>
      sortKey === "total" ? b.total - a.total : b[sortKey] - a[sortKey]
    );
    const stack = d3.stack().keys(keys)(sorted);
    const x = d3.scaleLinear()
      .domain([0, d3.max(sorted, d => d.total) * 1.1])
      .range([margin.left, width - margin.right]);
    const y = d3.scaleBand()
      .domain(sorted.map(d => d["ADMIN"]))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeTableau10);

    const g = svg.append("g")
      .attr("transform", `translate(0,${yOffset})`);

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
            .html(
              `${d.data["ADMIN"]}<br>${s.key.replace(/^Explained by:\s*/, "")}: ${
                (d[1] - d[0]) / d.data.ladderScore * 100 | 0
              }%`
            )
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

  // Legend with wrapping
  function createLegend(sortKey) {
    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left},${height * 2 + 40})`);
    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);

    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font", "14px Arial")
      .style("fill", "#666")
      .text("Click to sort");

    legend.selectAll("g")
      .data(["total"].concat(keys))
      .join("g")
      .attr("transform", (d, i) => `translate(${(i % 3) * 200},${Math.floor(i / 3) * 20})`)
      .each(function (d) {
        const g = d3.select(this);
        g.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", d === "total" ? "#ccc" : color(d))
          .on("click", () => update(d));
        g.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .style("font", "12px Arial")
          .text(d === "total" ? "Total" : d.replace(/^Explained by:\s*/, ""))
          .call(wrap, 180)
          .on("click", () => update(d));
      });
  }

  // Wrap function for legend text
  function wrap(text, width) {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      const lineHeight = 1.1;
      const y = text.attr("y");
      let line = [];
      let lineNumber = 0;
      let tspan = text.text(null).append("tspan").attr("x", 20).attr("y", y);
      while (words.length) {
        line.push(words.pop());
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [words[words.length - 1]];
          tspan = text
            .append("tspan")
            .attr("x", 20)
            .attr("y", y)
            .attr("dy", `${++lineNumber * lineHeight}em`)
            .text(line.pop());
        }
      }
    });
  }

  // Update function
  function update(newSortKey) {
    svg.selectAll("g").remove();
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font", "bold 20px Arial")
      .text("Happiness Factors");
    createChart(top10, 30, "Top 10 Happiest Countries", newSortKey);
    createChart(bottom10, height + 10, "Bottom 10 Happiest Countries", newSortKey);
    createLegend(newSortKey);
  }

  // Initial render
  let sortKey = "total";
  createChart(top10, 30, "Top 10 Happiest Countries", sortKey);
  createChart(bottom10, height + 10, "Bottom 10 Happiest Countries", sortKey);
  createLegend(sortKey);
}