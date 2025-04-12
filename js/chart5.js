import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart5() {
  const spider_data = await d3.csv("data/final_merged_regions.csv", d3.autoType);

  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");

  // Clear existing content
  visualContainer.innerHTML = "";
  legendContainer.innerHTML = "";

  const titleElement = document.getElementById("chart-title");
  if (titleElement) {
    titleElement.textContent = "Structural Drivers of Happiness: A Cross-Country Radar Comparison";
  }

  const controlsContainer = document.getElementById("chart-controls");
  controlsContainer.innerHTML = `
    <label for="country-select"><strong>Select up to 6 Countries:</strong></label>
    <select id="country-select" multiple size="10" style="width: 100%;"></select>
    <p style="font-size: 16px;">
      <em>Hold control to select multiple countries.</em>
    </p>
  `;

  const select = document.getElementById("country-select");
  const allCountries = [...new Set(spider_data.map(d => d.Country_Name))].sort();

  // Populate dropdown options
  allCountries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });

  // Pick 6 random default countries
  function getRandomCountries(arr, n = 6) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  function renderRadarCharts(selectedCountries) {
    visualContainer.innerHTML = "";

    const containerWidth = visualContainer.clientWidth;
    const containerHeight = visualContainer.clientHeight;
    const plotWidth = 375;
    const plotHeight = 250;

    const svg = d3.select(visualContainer)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    const dimensions = [
      { key: "Education_Level", label: "Education" },
      { key: "Tech_Level", label: "Tech" },
      { key: "Violence_Level", label: "Violence" },
      { key: "Health_Level", label: "Health" },
      { key: "Inequality_Level", label: "Inequality" }
    ];

    const angleSlice = (2 * Math.PI) / dimensions.length;
    const radius = 75;
    const maxValue = 5;

    selectedCountries.forEach((country, i) => {
      const d = spider_data.find(row => row.Country_Name === country);
      if (!d) return;

      const group = svg.append("g")
        .attr("transform", `translate(${(i % 3) * plotWidth + plotWidth / 2}, ${Math.floor(i / 3) * plotHeight + plotHeight / 2 + 20})`);

      const scale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

      group.append("text")
        .attr("x", 0)
        .attr("y", -radius - 40)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .style("font-size", "18px")
        .text(country);

      dimensions.forEach((dim, j) => {
        const angle = j * angleSlice - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        group.append("line")
          .attr("x1", 0).attr("y1", 0)
          .attr("x2", x).attr("y2", y)
          .attr("stroke", "#ccc");
      });

      dimensions.forEach((dim, j) => {
        const angle = j * angleSlice - Math.PI / 2;
        const labelOffset = dim.label === "Violence" ? radius + 25 : radius + 15;
        const x = labelOffset * Math.cos(angle);
        const y = labelOffset * Math.sin(angle);

        let anchor;
        if (angle > -Math.PI / 4 && angle < Math.PI / 4) anchor = "start";
        else if (angle > (3 * Math.PI) / 4 || angle < -(3 * Math.PI) / 4) anchor = "end";
        else anchor = "middle";

        let baseline;
        if (angle < -Math.PI / 2 || angle > Math.PI / 2) baseline = "hanging";
        else if (angle > -Math.PI / 2 && angle < Math.PI / 2) baseline = "baseline";
        else baseline = "middle";

        group.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", anchor)
          .attr("alignment-baseline", baseline)
          .text(dim.label);
      });

      const values = dimensions.map(dim => +d[dim.key]);
      const points = values.map((v, j) => {
        const r = scale(v);
        const angle = j * angleSlice - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      group.append("path")
        .attr("d", d3.line()(points.concat([points[0]])))
        .attr("fill", getLadderColor(+d["Ladder Score"]))
        .attr("fill-opacity", 0.4)
        .attr("stroke", getLadderColor(+d["Ladder Score"]))
        .attr("stroke-width", 2);
    });
  }

  // Initial draw
  const defaultCountries = getRandomCountries(allCountries);
  defaultCountries.forEach(country => {
    [...select.options].forEach(opt => {
      if (opt.value === country) opt.selected = true;
    });
  });
  renderRadarCharts(defaultCountries);

  // Redraw when selection changes
  select.addEventListener("change", () => {
    const selected = Array.from(select.selectedOptions).map(opt => opt.value).slice(0, 6);
    renderRadarCharts(selected);
  });

  // Legend
  const legendSvg = d3.select("#chart-legend")
    .append("svg")
    .attr("width", 250)
    .attr("height", 175);

  const legendLabels = [
    { label: "6 - 8", color: "#377eb8" },
    { label: "4 - 6", color: "#4daf4a" },
    { label: "2 - 4", color: "#ffcc00" },
    { label: "0 - 2", color: "#e41a1c" }
  ];

  const legendGroup = legendSvg.append("g").attr("transform", "translate(10,20)");

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
    .attr("y", 13)
    .attr("font-size", "16px")
    .text(d => d.label);

  function getLadderColor(score) {
    if (score >= 6) return "#377eb8";
    if (score >= 4) return "#4daf4a";
    if (score >= 2) return "#ffcc00";
    return "#e41a1c";
  }
}
