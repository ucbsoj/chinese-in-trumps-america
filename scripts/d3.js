async function draw() {
  const chartElement = document.getElementById("chart");
  chartElement.innerHTML = "";
  d3.select("#tooltip").style("display", "none");

  const dataset = await d3.csv("edit-data/data.csv");

  const parseDate = d3.timeParse("%Y-%m");
  dataset.forEach((d) => {
    d.date = parseDate(d.date);
    d.number = +d.number;
  });

  const containerWidth = document.getElementById("d3-container").clientWidth;
  const isMobile = containerWidth <= 680;

  let dimensions = isMobile
    ? {
        width: Math.min(600, containerWidth),
        height: Math.min(800, containerWidth * 1.2),
        margins: 40,
      }
    : {
        width: Math.min(1000, containerWidth),
        height: Math.min(500, containerWidth * 0.5),
        margins: 50,
      };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2;
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const ctr = svg
    .append("g")
    .attr("transform", `translate(${dimensions.margins}, ${dimensions.margins})`);

  const tooltip = d3.select("#tooltip");
  const tooltipDot = ctr
    .append("circle")
    .attr("r", 5)
    .attr("fill", "#fc8781")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .style("opacity", 0)
    .style("pointer-events", "none");

  // Scales
  let xScale, yScale;
  if (isMobile) {
    xScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.number)])
      .range([0, dimensions.ctrWidth])
      .nice();

    const yExtent = d3.extent(dataset, (d) => d.date);
    yExtent[1] = d3.timeMonth.offset(yExtent[1], 1);

    yScale = d3.scaleTime().domain(yExtent).range([0, dimensions.ctrHeight]);
  } else {
    yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d.number)])
      .range([dimensions.ctrHeight, 0])
      .nice();

    const xExtent = d3.extent(dataset, (d) => d.date);
    xExtent[1] = d3.timeMonth.offset(xExtent[1], 1);

    xScale = d3.scaleTime().domain(xExtent).range([0, dimensions.ctrWidth]);
  }

  // Bars
  const bars = ctr
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("fill", "#F28C48")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  if (isMobile) {
    const barHeight = (dimensions.ctrHeight / dataset.length) * 0.8;

    bars
      .attr("x", 0)
      .attr("y", (d) => yScale(d.date) - barHeight / 2)
      .attr("height", barHeight)
      .attr("width", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 10)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => xScale(d.number));
  } else {
    const barWidth = (dimensions.ctrWidth / dataset.length) * 0.8;

    bars
      .attr("x", (d) => xScale(d.date) - barWidth / 2)
      .attr("y", dimensions.ctrHeight)
      .attr("width", barWidth)
      .attr("height", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 10)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => yScale(d.number))
      .attr("height", (d) => dimensions.ctrHeight - yScale(d.number));
  }

  // Tooltip events
  bars
    .on("mousemove", function (event, d) {
      const [x, y] = d3.pointer(event);

      tooltipDot
        .attr("cx", isMobile ? xScale(d.number) : xScale(d.date))
        .attr("cy", isMobile ? yScale(d.date) : yScale(d.number))
        .style("opacity", 1);

      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .style("display", "block").html(`
          <div><strong>${d3.format(",")(d.number)}</strong></div>
          <div>${d3.timeFormat("%B %Y")(d.date)}</div>
        `);
    })
    .on("mouseleave", function () {
      tooltipDot.style("opacity", 0);
      tooltip.style("display", "none");
    });

  // Axes
  if (isMobile) {
    ctr
      .append("g")
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%b %Y")))
      .style("font-family", "Arial, sans-serif");

    ctr
      .append("g")
      .call(d3.axisBottom(xScale).ticks(5))
      .attr("transform", `translate(0, ${dimensions.ctrHeight})`)
      .style("font-family", "Arial, sans-serif");
  } else {
    ctr.append("g").call(d3.axisLeft(yScale).ticks(6)).style("font-family", "Arial, sans-serif");

    ctr
      .append("g")
      .call(d3.axisBottom(xScale))
      .attr("transform", `translate(0, ${dimensions.ctrHeight})`)
      .style("font-family", "Arial, sans-serif");
  }
}

draw();
window.addEventListener("resize", draw);
