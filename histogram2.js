// set the dimensions and margins of the graph
var margin1 = {top: 60, right: 30, bottom: 70, left: 100},
    width1 = 700 - margin.left - margin.right,
    height1 = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg2 = d3.select("#svg2")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv("/Data/gaia-hrd-dr2-200pc.csv").then( function(data) {

	// add sequential color
	var myColor = d3.scaleSequential()
		.domain(d3.extent(data, d => d.mg))
		.interpolator(d3.interpolatePuOr);

	// X axis: scale and draw:
	var x = d3.scaleLinear()
		.domain([-6, 20])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
		.range([0, width1]);
	svg2.append("g")
		.attr("transform", "translate(0," + height1 + ")")
		.call(d3.axisBottom(x));
	svg2.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", width1/2 + 50)
		.attr("y", height1+margin1.top)
		.style("fill", "black")
		.text("Mg Bin Values");
  
	// Y axis: initialization
	var y = d3.scaleLinear()
		.range([height1, 0]);
	var yAxis = svg2.append("g")
	svg2.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", -75)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.attr("x", 40 - (height1 / 2))
		.attr("y", 30 - margin1.left)
		.style("fill", "black")
		.text("Count");

	svg2.append("text")
        .attr("x",  (width1 / 2))             
        .attr("y", 10-(margin1.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
		.style("fill", "black")
        .style("text-decoration", "underline")  
        .text("Distribution of Absolute Magnitudes (Mg)");
  
	// A function that builds the graph for a specific value of bin
	function updated(nBin) {
		
		// set the parameters for the histogram
	  var histogram = d3.histogram()
		  .value(function(d) { return d.mg; })   // I need to give the vector of value
		  .domain(x.domain())  // then the domain of the graphic
		  .thresholds(x.ticks(nBin)); // then the numbers of bins
  
	  // And apply this function to data to get the bins
	  var bins = histogram(data);
	  console.log(bins);
  
	  // Y axis: update now that we know the domain
	  y.domain([0, d3.max(bins, function(d) {console.log(d.length); return d.length; })]);   // d3.hist has to be called before the Y axis obviously
	  yAxis
		  .transition()
		  .duration(1000)
		  .call(d3.axisLeft(y));
  
	  // Join the rect with the bins data
	  var u = svg2.selectAll("rect")
	  .data(bins)
  
	  // Manage the existing bars and eventually the new ones:
	  u
		  .enter()
		  .append("rect") // Add a new rect for each new elements
		  .merge(u) // get the already existing elements as well
		  .transition() // and apply changes to all of them
		  .duration(1000)
			.attr("x", 1)
			.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
			.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
			.attr("height", function(d) { return height1 - y(d.length); })
			.attr("fill", "#FFC300" )
  
  
	  // If less bar in the new histogram, I delete the ones not in use anymore
	  u
		  .exit()
		  .remove()
	  }
  
  
	// Initialize with 20 bins
	updated(20)
	
  
	// Listen to the button -> update if user change it
	d3.select("#nBin2").on("input", function() {
	  updated(+this.value);
	});
})
