const Tabby = "transit_materials/dataset/tabby_star.csv";
const Keppler1 = "transit_materials/dataset/keppler_22b.csv";
const Keppler2 = "transit_materials/dataset/keppler_37b.csv";

var selection = "keppler1";

d3.select("#selection").on("change", () => {
	selection = document.getElementById("selection").value;
	loadLineChart(selection === "keppler1" ? Keppler1 : Keppler2, selection);
});

var loadLineChart = (data_path) =>
	d3
		.csv(data_path, (d, i) => ({ TIME: +d.TIME, PDCSAP_FLUX: +d.PDCSAP_FLUX }))
		.then((data) => {
			drawKepplerLineChart(data);
			// for(var i = 0; i < 8; i++){
			drawTransitAnimation(data, selection);
			// }
		});

var drawKepplerLineChart = (data) => {
	var margin = { top: 60, right: 20, bottom: 30, left: 50 },
		width = 700 - margin.left - margin.right,
		height = 390 - margin.top - margin.bottom;
	// var margin = { top: 60, right: 20, bottom: 30, left: 50 },
	// 	width = 700 - margin.left - margin.right,
	// 	height = 365 - margin.top - margin.bottom;

	d3.select(".keppler").selectAll("*").remove();

	//Make an SVG Container

	var svg = d3
		.select(".keppler")
		// .append("svg")
		.attr("width", width)
		.attr("height", height);
	let x = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.TIME))
		.range([margin.left, width - margin.right]);

	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	let y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.PDCSAP_FLUX)])
		.nice()
		.range([height - margin.bottom, margin.top]);

	let xAxis = (g) =>
		g.attr("transform", `translate(0,${height - margin.bottom})`).call(
			d3
				.axisBottom(x)
				.ticks(width / 80)
				.tickSizeOuter(1)
		);

	let yAxis = (g) =>
		g
			.attr("transform", `translate(${margin.left},0)`)
			.call(d3.axisLeft(y))
			.call((g) => g.select(".domain").remove())
			.call(
				(g) =>
					g
						.select(".tick:last-of-type text")
						.clone()
						.attr("x", 3)
						.attr("text-anchor", "start")
						.attr("font-weight", "bold")
				// .text("test1")
			);

	svg
		.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width/2)
		.attr("y", height)
		.text("TIME(BKJD)");

	svg
		.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", 5)
		.attr("x", -70)
		.attr("dy", ".55em")
		.attr("transform", "rotate(-90)")
		.text("PDCSAP FLUX normalized");

	let line = d3
		.line()
		.x((d) => x(d.TIME))
		.y((d) => y(d.PDCSAP_FLUX));

	svg.append("g").call(xAxis);

	svg.append("g").call(yAxis);

	let path = svg
		.append("path")
		.attr("d", line(data))
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("fill", "none");
	var totalLength = path.node().getTotalLength();
	path
		.attr("stroke-dasharray", totalLength + " " + totalLength)
		.attr("stroke-dashoffset", totalLength)
		.transition() // Call Transition Method
		.duration(data[data.length - 1]["TIME"] * 200) // Set Duration timing (ms)
		.ease(d3.easeLinear) // Set Easing option
		.attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
	// svg.selectAll("path").remove();
	// Select and generate rectangle elements
};

var drawTransitAnimation = (data, selection) => {
	var size_factor = selection == "keppler1" ? 1 : 1.5;
	// Width and height of the SVG object
	var margin = { top: 60, right: 20, bottom: 30, left: 50 },
		width = 700 - margin.left - margin.right,
		height = 365 - margin.top - margin.bottom;

	d3.select(".transit").selectAll("*").remove();
	//Make an SVG Container
	var svgContainer = d3
		.select(".transit")
		.attr("width", width)
		.attr("height", height)
		.style("background", "url(transit_materials/sun.png) no-repeat center")
		.style("fill", "pink")
		.style("border-color", "black")
		.style("border-style", "solid")
		.style("border-width", "1px");

	var circle = svgContainer
		.append("image")
		.attr("src", width - 50)
		.attr("xlink:href", "transit_materials/planet.png")
		.attr("x", 50 / 2)
		.attr("y", 120)
		// .attr("r", 40)
		.attr("width", 75 * size_factor)
		.attr("height", 75 * size_factor);
	// Draw the Rectangle
	var moverate = (data[data.length - 1]["TIME"] * 80) / 2;
	var repeat = () => {
		circle
			.transition()
			.attr("x", width - 100)
			.duration(moverate)
			.on("end", () => {
				circle
					.transition()
					.attr("x", 50 / 2)
					.duration(moverate)
					.on("end", repeat);
			});
		// .duration((data[data.length - 1]["TIME"] * 80) / 8)
	};
	repeat();
};

var drawTabbyChart = (data) => {
	var margin = { top: 30, right: 20, bottom: 30, left: 50 },
		width = 600 - margin.left - margin.right,
		height = 340 - margin.top - margin.bottom;
	// var margin = { top: 60, right: 20, bottom: 30, left: 50 },
	// 	width = 700 - margin.left - margin.right,
	// 	height = 365 - margin.top - margin.bottom;

	d3.select(".tabby").selectAll("*").remove();

	//Make an SVG Container

	var svg = d3
		.select(".tabby")
		// .append("svg")
		.attr("width", width)
		.attr("height", height);
	let x = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.TIME))
		.range([margin.left, width - margin.right]);

	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	let y = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.PDCSAP_FLUX)])
		.nice()
		.range([height - margin.bottom, margin.top]);

	let xAxis = (g) =>
		g.attr("transform", `translate(0,${height - margin.bottom})`).call(
			d3
				.axisBottom(x)
				.ticks(width / 80)
				.tickSizeOuter(1)
		);

	let yAxis = (g) =>
		g
			.attr("transform", `translate(${margin.left},0)`)
			.call(d3.axisLeft(y))
			.call((g) => g.select(".domain").remove())
			.call(
				(g) =>
					g
						.select(".tick:last-of-type text")
						.clone()
						.attr("x", 3)
						.attr("text-anchor", "start")
						.attr("font-weight", "bold")
				// .text("test1")
			);

	svg
		.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width/2)
		.attr("y", height)
		.text("TIME(BKJD)");

	svg
		.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", 5)
		.attr("x", -70)
		.attr("dy", ".55em")
		.attr("transform", "rotate(-90)")
		.text("PDCSAP FLUX normalized");

	let line = d3
		.line()
		.x((d) => x(d.TIME))
		.y((d) => y(d.PDCSAP_FLUX));

	svg.append("g").call(xAxis);

	svg.append("g").call(yAxis);

	let path = svg
		.append("path")
		.attr("d", line(data))
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("fill", "none");
	var totalLength = path.node().getTotalLength();
	path
		.attr("stroke-dasharray", totalLength + " " + totalLength)
		.attr("stroke-dashoffset", totalLength)
		.transition() // Call Transition Method
		.duration(data[data.length - 1]["TIME"] * 200) // Set Duration timing (ms)
		.ease(d3.easeLinear) // Set Easing option
		.attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
	// svg.selectAll("path").remove();
	// Select and generate rectangle elements
};

var loadTabbyChart = (data_path) =>
	d3
		.csv(data_path, (d, i) => ({ TIME: +d.TIME, PDCSAP_FLUX: +d.PDCSAP_FLUX }))
		.then((data) => {
			drawTabbyChart(data);
		});

loadLineChart(Keppler1, selection);
loadTabbyChart(Tabby, selection);

