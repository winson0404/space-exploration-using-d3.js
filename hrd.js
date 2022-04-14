// set the dimensions and margins of the graph
var margin = {top: 60, right: 30, bottom: 70, left: 100},
    width = 700 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg_hrd = d3.select("#hrd_dataviz")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

	var tooltip = d3.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style("transform", "translate(" + margin.left + "px," + margin.top + "px)")
		.classed('hide', true);
console.log("abc")
//Read the data
d3.csv("/Data/gaia-hrd-dr2-200pc.csv").then( function(data) {
	console.log("Hi")

  	// Add X axis
  	const x = d3.scaleLinear()
    	.domain([-3, 6])
    	.range([ 0, width ]);
	svg_hrd.append("g")
    	.attr("transform", `translate(0, ${height})`)
		.style("font", "16px times")
    	.call(d3.axisBottom(x))
    	.attr("opacity", "1")
	svg_hrd.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width/2 + 110)
		.attr("y", height+margin.top)
		.style("fill", "black")
		.text("Bp - Rp (Blue photons - Red photons)");

  	// Add Y axis
  	const y = d3.scaleLinear()
    	.domain([20, -6])
    	.range([ height, 0]);
	svg_hrd.append("g")
		.style("font", "13px times")
		.call(d3.axisLeft(y));
	svg_hrd.append("text")
    	.attr("class", "y label")
    	.attr("text-anchor", "end")
    	.attr("y", -75)
    	.attr("dy", ".75em")
    	.attr("transform", "rotate(-90)")
		.attr("x", 60 - (height / 2))
		.attr("y", 50 - margin.left)
		.style("fill", "black")
    	.text("Absolute Magnitude (Mg)");

	// add sequential color
	var myColor = d3.scaleSequential()
		.domain(d3.extent(data, d => d.bp_rp))
		.interpolator(d3.interpolatePuOr);

  	// Add dots
  	var scatter = svg_hrd.append("g")
    	.selectAll("dot")
    	.data(data)
    	.enter()
    	.append("circle")
      		.attr("cx", function (d) { return x(d.bp_rp); } )
      		.attr("cy", function (d) { return y(d.mg); } )
      		.attr("r", 3.0)
      		.attr("fill", function(d) { return myColor(d.bp_rp)})
			  .on('mouseover', d => {
				div
				  .html(d.bp_rp + '<br/>' + d.mg)
				  .style('opacity', 0.9)
				  .style('left', d3.event.pageX + 'px')
				  .style('top', d3.event.pageY - 28 + 'px');
			  })
			  .on('mouseout', () => {
				div
				  .transition()
				  .duration(500)
				  .style('opacity', 0);
			  });

	// Add title
	svg_hrd.append("text")
        .attr("x",  (width / 2))             
        .attr("y", -(margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
		.style("fill", "black")
        .style("text-decoration", "underline")  
        .text("Hertzsprung-Russell Diagram (HR-Diagram)");

	svg_hrd
		.append("line")
		  .attr("x1", x(-3) )
		  .attr("x2", x(6) )
		  .attr("y1", y(0))
		  .attr("y2", y(0))
		  .attr("stroke", "black")
		  .attr("stroke-dasharray", "4")

	svg_hrd
		.append("line")
			.attr("x1", x(0) )
			.attr("x2", x(0) )
			.attr("y1", y(-6))
			.attr("y2", y(20))
			.attr("stroke", "black")
			.attr("stroke-dasharray", "4")

	// Add brush element
	svg_hrd.call(d3.brush()
		.extent([[0,0], [width, height] ] )
		.on("start brush", updateChart)
		)

	function updateChart() {
		// get a new scale
		extent = d3.event.selection
		scatter.classed("selected", function(d) { return isBrushed(extent, x(d.bp_rp), y(d.mg))})
	}

	function isBrushed(brush_coords, cx, cy) {
		var x0 = brush_coords[0][0],
			x1 = brush_coords[1][0],
			y0 = brush_coords[0][1],
			y1 = brush_coords[1][1];
   		return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
	}
	
})