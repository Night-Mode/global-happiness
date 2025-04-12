import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart6() {
  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");
  const controlsContainer = document.getElementById("chart-controls");

  // Clear previous
  visualContainer.innerHTML = "";
  legendContainer.innerHTML = "";
  controlsContainer.innerHTML = "";

  const titleElement = document.getElementById("chart-title");
  if (titleElement) {
    titleElement.textContent = "Regional Variation for Contributing Happiness Factors";
  }


  // Load data
  const data = await d3.csv("data/final_merged_regions.csv", d3.autoType);

  const dimensions = [
    "Tech",
    "Education",
    "Violence",
    "Health",
    "Inequality"
  ];

  const dimensionLabels = {
    Tech: "Technology Access Level",
    Education: "Educational Attainment",
    Violence: "Violence Exposure Level",
    Health: "Healthy Life Expectancy",
    Inequality: "Income Inequality Gap"
  };
  

  // Create dropdown control
  const label = document.createElement("label");
  label.textContent = "Select Dimension: ";
  label.setAttribute("for", "dimension-select");

  const select = document.createElement("select");
  select.id = "dimension-select";
  dimensions.forEach(dim => {
    const option = document.createElement("option");
    option.value = dim;
    option.textContent = dim.replace("_Level", "");
    select.appendChild(option);
  });

  controlsContainer.appendChild(label);
  controlsContainer.appendChild(select);

  // Initial render
  let selectedDimension = select.value;
  renderBoxplot(selectedDimension);

  // Event listener
  select.addEventListener("change", () => {
    selectedDimension = select.value;
    renderBoxplot(selectedDimension);
  });

  function renderBoxplot(selectedDimension) {
    visualContainer.innerHTML = "";
    
    const rect = visualContainer.getBoundingClientRect();
    
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;

    const svg = d3
      .select(visualContainer)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group by region
    const grouped = d3.groups(data, d => d.subregion).map(([subregion, entries]) => {
      const valid = entries.filter(d => {
        const val = d[selectedDimension];
        return val != null && !isNaN(val);
      });

      const values = valid.map(d => d[selectedDimension]).sort(d3.ascending);

      const q1 = d3.quantile(values, 0.25);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;

      const nonOutliers = valid.filter(d => {
        const val = d[selectedDimension];
        return val >= lowerFence && val <= upperFence;
      });

      const outliers = valid.filter(d => {
        const val = d[selectedDimension];
        return val < lowerFence || val > upperFence;
      });

      return {
        subregion,
        q1,
        q3,
        median: d3.quantile(values, 0.5),
        min: d3.min(nonOutliers, d => d[selectedDimension]),
        max: d3.max(nonOutliers, d => d[selectedDimension]),
        outliers
      };
    });

    const x = d3
      .scaleBand()
      .domain(['Southern Europe', 'North Africa', 'South America', 'Eastern Europe', 'Australia & New Zealand', 'Western Europe', 
        'West Asia', 'South Asia', 'West Africa', 'Southern Africa', 'Central Africa', 'North America', 'Central America', 
        'Northern Europe', 'Southeast Asia', 'East Asia', 'Central Asia', 'South Africa'])
      .range([0, width])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(grouped, d => Math.min(d.min, ...d.outliers.map(o => o[selectedDimension]))),
        d3.max(grouped, d => Math.max(d.max, ...d.outliers.map(o => o[selectedDimension])))
      ])
      .nice()
      .range([height, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select(".tooltip");

    // Boxplot drawing
    grouped.forEach(d => {
      const boxWidth = x.bandwidth();
      const cx = x(d.subregion) + boxWidth / 2;

      // Box
      g.append("rect")
        .attr("x", x(d.subregion))
        .attr("y", y(d.q3))
        .attr("height", y(d.q1) - y(d.q3))
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .attr("fill", "#b2d8d8");

      // Median
      g.append("line")
        .attr("x1", x(d.subregion))
        .attr("x2", x(d.subregion) + boxWidth)
        .attr("y1", y(d.median))
        .attr("y2", y(d.median))
        .attr("stroke", "black");

      // Whiskers
      g.append("line").attr("x1", cx).attr("x2", cx).attr("y1", y(d.min)).attr("y2", y(d.q1)).attr("stroke", "black");
      g.append("line").attr("x1", cx).attr("x2", cx).attr("y1", y(d.q3)).attr("y2", y(d.max)).attr("stroke", "black");

      // Caps
      g.append("line")
        .attr("x1", cx - boxWidth * 0.25)
        .attr("x2", cx + boxWidth * 0.25)
        .attr("y1", y(d.min))
        .attr("y2", y(d.min))
        .attr("stroke", "black");

      g.append("line")
        .attr("x1", cx - boxWidth * 0.25)
        .attr("x2", cx + boxWidth * 0.25)
        .attr("y1", y(d.max))
        .attr("y2", y(d.max))
        .attr("stroke", "black");

      // Outliers
      g.selectAll(`.outlier-${d.subregion}`)
        .data(d.outliers)
        .enter()
        .append("circle")
        .attr("cx", cx)
        .attr("cy", o => y(o[selectedDimension]))
        .attr("r", 4)
        .attr("fill", "red")
        .attr("opacity", 0.7)
        .on("mouseover", function (event, o) {
          tooltip
            .style("display", "block")
            .html(`${o.Country_Name}: ${o[selectedDimension]}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
        });
    });
  }
}
