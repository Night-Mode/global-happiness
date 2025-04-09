import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function renderChart5() {
  const visualContainer = document.getElementById("chart-visual");
  const legendContainer = document.getElementById("chart-legend");

  // Clear previous content
  visualContainer.innerHTML = "";
  legendContainer.innerHTML = "";

  // Load CSV data
  const spider_data = await d3.csv("data/final_merged_regions.csv", d3.autoType);

  // Dimensions and setup

  const rect = visualContainer.getBoundingClientRect();
  const width = 300, height = 300;
  const fullWidth = width * 3;
  const fullHeight = height * 2;
  const NS = "http://www.w3.org/2000/svg";

  const dimensions = [
    { key: "Tech_Level", label: "Tech" },
    { key: "Education_Level", label: "Education" },
    { key: "Violence_Level", label: "Violence" },
    { key: "Health_Level", label: "Health" },
    { key: "Inequality_Level", label: "Inequality" }
  ];

  const angleSlice = 2 * Math.PI / dimensions.length;
  const radius = 100;
  const maxValue = 5;

  const countryAliases = {
    USA: "United States",
    Russia: "Russian Federation",
    Japan: "Japan",
    England: "United Kingdom",
    Mexico: "Mexico",
    Kenya: "Kenya"
  };

  const selectedCountries = Object.values(countryAliases);

  // Create main SVG
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", fullWidth);
  svg.setAttribute("height", fullHeight);
  svg.style.font = "10px sans-serif";

  selectedCountries.forEach((country, i) => {
    const d = spider_data.find(row => row.Country_Name === country);
    if (!d) return;

    const group = document.createElementNS(NS, "g");
    const xOffset = (i % 3) * width + width / 2;
    const yOffset = Math.floor(i / 3) * height + height / 2 + 20;
    group.setAttribute("transform", `translate(${xOffset}, ${yOffset})`);
    svg.appendChild(group);

    const scale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", 0);
    label.setAttribute("y", -radius - 30);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-weight", "bold");
    label.textContent = country;
    group.appendChild(label);

    dimensions.forEach((dim, j) => {
      const angle = j * angleSlice - Math.PI / 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", 0);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", x);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#ccc");
      group.appendChild(line);

      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", (radius + 10) * Math.cos(angle));
      text.setAttribute("y", (radius + 10) * Math.sin(angle));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("alignment-baseline", "middle");
      text.textContent = dim.label;
      group.appendChild(text);
    });

    const values = dimensions.map(dim => +d[dim.key]);
    const points = values.map((v, j) => {
      const r = scale(v);
      const angle = j * angleSlice - Math.PI / 2;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      return [x, y];
    });

    const path = document.createElementNS(NS, "path");
    const dAttr = points.map((p, j) => (j === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ") + " Z";
    path.setAttribute("d", dAttr);

    const color = getLadderColor(+d["Ladder Score"]);
    path.setAttribute("fill", color);
    path.setAttribute("fill-opacity", 0.4);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", 2);
    group.appendChild(path);
  });

  visualContainer.appendChild(svg);

  // Add ladder score legend
  const legendSvg = d3.select(legendContainer)
    .append("svg")
    .attr("width", 400)
    .attr("height", 40);

  const legendLabels = [
    { label: "6 - 8", color: "#377eb8" },
    { label: "4 – 6", color: "#4daf4a" },
    { label: "2 – 4", color: "#ffcc00" },
    { label: "0 - 2", color: "#e41a1c" }
  ];

  const legendGroup = legendSvg.append("g").attr("transform", "translate(20,10)");

  legendGroup.selectAll("rect")
    .data(legendLabels)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 100)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => d.color);

  legendGroup.selectAll("text")
    .data(legendLabels)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 100 + 24)
    .attr("y", 13)
    .text(d => d.label)
    .style("font-size", "12px");
}

function getLadderColor(score) {
  if (score >= 6) return "#377eb8";       // blue
  else if (score >= 4) return "#4daf4a";  // green
  else if (score >= 2) return "#ffcc00";  // yellow
  else return "#e41a1c";                  // red
}
