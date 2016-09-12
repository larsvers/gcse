// /Users/lars/viz/projects/gcse/gcse.css 

var log = console.log.bind(console);
var dir = console.dir.bind(console);


var vis = vis || {};
window.g = window.g || {};

// (1) load data

var data = d3.csv("data/gcse.csv", function(data){
	
	// log(data);
	dataprep(data);

});


function dataprep(data) {

	data = data;

	// (2) format data

	// nest data by Student
	var nestedData = d3.nest()
		.key(function(d) { return d.student; })
		.entries(data);

	log(nestedData);

	// split for for vis 1
	g.dataVisOne = {};
	g.dataVisOne.archie = nestedData.filter(function(el) {
		return el.key === 'Archie';
	});
	g.dataVisOne.archie = g.dataVisOne.archie[0].values;

	g.dataVisOne.sid = nestedData.filter(function(el) {
		return el.key === 'Sid';
	});
	g.dataVisOne.sid = g.dataVisOne.sid[0].values;

	// (3) measure data

	g.extentGrades = [0,8];
	g.extentPrepared = d3.extent(data, function(d) { return parseInt(d.prepared); });
	g.extentSequence = d3.extent(data, function(d) { return parseInt(d.sequence); });


	g.allGrades = [];
	g.allGrades[8] = {'gradeName': 'A *', 'gradeNumber': 8};
	g.allGrades[7] = {'gradeName': 'A', 'gradeNumber': 7};
	g.allGrades[6] = {'gradeName': 'B', 'gradeNumber': 6};
	g.allGrades[5] = {'gradeName': 'C', 'gradeNumber': 5};
	g.allGrades[4] = {'gradeName': 'D', 'gradeNumber': 4};
	g.allGrades[3] = {'gradeName': 'E', 'gradeNumber': 3};
	g.allGrades[2] = {'gradeName': 'F', 'gradeNumber': 2};
	g.allGrades[1] = {'gradeName': 'G', 'gradeNumber': 1};
	g.allGrades[0] = {'gradeName': 'U', 'gradeNumber': 0};


	// global bouncers
	g.student = 'archie';
	g.variable = 'startValue';


	vis.story.prequel();
	vis.build.init();
	vis.build.update(g.student, g.variable);

}


vis.story = (function() {

	var my = {}

	my.prequel = function() {
		
		var del = 1000;

		d3.select('#preOne')
				.transition()
				.duration(2000)
				.delay(0)
				.style('color', '#eee')

		d3.select('#preTwo')
				.transition()
				.duration(2000)
				.delay(del*3)
				.style('color', '#eee')

		d3.select('#preThree')
				.transition()
				.duration(2000)
				.delay(del*6)
				.style('color', '#eee')

		d3.select('#preFour')
				.transition()
				.duration(4000)
				.delay(del*9)
				.style('color', 'gold')


		setTimeout(function(){
			d3.select('#start').style('display', 'inherit');
		}, del*14)

	}

	return my;

})();


vis.build = (function() {

	var my = {};

	var width, height;
	var svg, circles, lines;
	var scaleY, scaleX, axisX, axisY;

	my.init = function() {

		// (4) build vis 1 - grades by subject

		// canvas
		var margin = { top: 50, right: 20, bottom: 70, left: 50 };
		width = 1000 - margin.left - margin.right;
		height = 500 - margin.top - margin.bottom;
		
		svg = d3.select('div#svgContainer')
			.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// (4b) set up the scales

		scaleX = d3.scale.ordinal().domain(g.dataVisOne.archie.map(function(el) { return el.subject; })).rangePoints([0, width], 1);

		scaleY = d3.scale.linear().domain(g.extentGrades).range([height, 0]);

		scaleZ = d3.scale.sqrt().domain(g.extentPrepared).range([3, 30]);

		scaleZCol = d3.scale.linear().domain(g.extentPrepared).range(['#ccc', 'red']);
		
		// (4c) set up the axes

		axisX = d3.svg.axis().scale(scaleX).orient('bottom');
		axisY = d3.svg.axis().scale(scaleY)
				.tickFormat(function(d) { return g.allGrades[d].gradeName; })
				.orient('left')
				.tickSize(-width);

		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(axisX);

		svg.append('g')
			.attr('class', 'y axis')
			.call(axisY);

	}

	my.update = function(student, variable) {

		// (4b) update the scales

		scaleX.domain(g.dataVisOne[student].map(function(el) { return el.subject; }));

		var n = g.dataVisOne[student].length;
		var dur = 1000; 	

		
		// (4c) update the axes

		svg.select('.x.axis')
			.transition()
			.duration(dur)
			.delay(function(d,i) { return i * dur / n })
				.call(axisX);
		
		d3.selectAll('g.x.axis > g.tick > text')
				.style('text-anchor', 'end')
				.attr('transform', 'rotate(-40)');

		// (4d) chart 

		// lines
		// -------

		// join
		lines = svg
				.selectAll('.lines')
				.data(g.dataVisOne[student], function(d) { return d.subject; });

		// enter
		lines
				.enter()
			.append('line')
				.attr('class', function(d) { return 'lines ' + student; })
				.attr('y1', scaleY(0))
				.attr('y2', scaleY(0));

		// update
		lines
			.transition()
			.duration(dur)
			.delay(function(d,i) { return i * dur / n })
				.attr('x1', function(d) { return scaleX(d.subject); })
				.attr('x2', function(d) { return scaleX(d.subject); })
				.attr('y2', function(d) { return scaleY(d[variable]); })
				.style('stroke', g.variable === 'gradeNumber' ? '#FFD700' : '#ccc');

		// exit
		lines
				.exit()
			.transition()
			.duration(dur)	
			.delay(function(d,i) { return i * dur / n })
				.style('opacity', 0)
				.remove()
			


		// circles
		// -------

		// join
		circles = svg
				.selectAll('.circles')
				.data(g.dataVisOne[student], function(d) { return d.subject; });

		// enter
		circles
				.enter()
			.append('circle')
				// .attr('class', function(d) { return 'circles ' + student + ' ' + variable; })
				.attr('class', function(d) { return 'circles ' + student; })
				.attr('cx', function(d) { return scaleX(d.subject); })
				.attr('cy', scaleY(0))
				.attr('r', 5)
				.style('fill', '#444')
			.transition()
			.duration(dur)
			.delay(function(d,i) { return i * dur / n; })
				.attr('cy', function(d) { return scaleY(d[variable]); })
				.attr('r', 5)
				.style('fill', '#ccc');

		// update
		circles
			.transition()
			.duration(dur)
			.delay(function(d,i) { return i * dur / n; })
				.attr('cx', function(d) { return scaleX(d.subject); })
				.attr('cy', function(d) { return scaleY(d[variable]); })
				.style('fill', g.variable === 'gradeNumber' ? '#FFD700' : '#ccc')
				.attr('r', function() { if(variable !== 'prepared') return 5; });

		// exit
		circles.exit()
			.transition()
			.duration(dur)
				.style('opacity', 1e-6)
				.remove();
				

		if (g.variable == 'expNumber') {

			
			avgGradeCircles = svg
					.selectAll('.avgGradeCircles')
					.data(g.dataVisOne[student].map(function(el) { return { 'avgGradeNumber': el.avgGradeNumber, 'subject': el.subject }; }))
					.enter()
				.append('circle')
					.attr('class', 'avgGradeCircles ' + student)
					.attr('cx', function(d) { return scaleX(d.subject); })
					.attr('cy', function(d) { return scaleY(d.avgGradeNumber); })
					.attr('r', '5px')
					.style('fill', '#ccc')
				.transition()
				.duration(dur)
					.style('fill', 'steelblue');

		}

	}

	return my;

})();



// interactivity
// -------------

var text = {};

text.startValuearchie = 'Archie took a total of 10 examns...';
text.startValuesid = 'Sid took 12 exams as listed above...';
text.avgGradeNumber = 'Here are all the laughable national averages for the respective subjects <span id="fontchange"> we shall keep them in the background for entertainment reasons </span>)';
text.expNumber = 'When asked, he humbly expected these grades... ';
text.gradeNumber = 'And here are the unbelievable grades he got, securing him a crystal throne on the GCSE olymp.';

d3.select('#btnArchie').classed('pressed', true);

d3.selectAll('button.story').classed('pressed', false);
d3.select('button#startValue').classed('pressed', true);


d3.selectAll('button.student').on('mousedown', function() {

	d3.selectAll('button.student').classed('pressed', false);
	d3.select(this).classed('pressed', true);

	g.student = d3.select(this).html().toLowerCase();
	g.variable = 'startValue';
	
	d3.select('#text').html(text['startValue' + g.student]);

	d3.selectAll('button.story').classed('pressed', false);
	d3.select('button#startValue').classed('pressed', true);

	d3.selectAll('.circles').classed('allowTip', false);
	d3.selectAll('.circles').on('mouseover', null); // removes the .allowTip mouseover set up for the 'prepared' circles

	d3.selectAll('.avgGradeCircles')
		.transition()
		.duration(500)
			.attr('r', 5)
			.style('opacity', 0)
			.remove();

	vis.build.update(g.student, g.variable);

});


d3.selectAll('button.story').on('mousedown', function() {

	g.variable = d3.select(this).attr('id');
	
	if(g.variable === 'startValue'){

		d3.selectAll('.y.axis text').style('fill', '#444');
		d3.selectAll('.y.axis line').style('stroke', '#444');

		d3.selectAll('.circles').classed('allowTip', false);
		d3.selectAll('.circles').on('mouseover', null); // removes the .allowTip mouseover set up for the 'prepared' circles

		d3.selectAll('.avgGradeCircles')
			.transition()
			.duration(500)
				.attr('r', 5)
				.style('opacity', 0)
				.remove();

	} else if(g.variable === 'avgGradeNumber') {

		d3.selectAll('.y.axis text').transition().duration(1000).style('fill', '#eee');
		d3.selectAll('.y.axis line').transition().duration(1000).style('stroke', '#555');

	} else if(g.variable === 'expNumber' || g.variable === 'gradeNumber') {

		d3.selectAll('.y.axis text').style('fill', '#eee');
		d3.selectAll('.y.axis line').style('stroke', '#555');

	}	

	g.variable === 'startValue' ? d3.select('div#text').html(text[g.variable + g.student]) : d3.select('div#text').html(text[g.variable]);

	d3.selectAll('button.story').classed('pressed', false);
	d3.select(this).classed('pressed', true);

	vis.build.update(g.student, g.variable);
	

});


d3.selectAll('button.story#prepared').on('mousedown', function() {

	d3.selectAll('.circles:not(.avgGradeCircles)')
		.transition()
		.duration(2000)
		.ease('elastic')
			.attr('r', function(d) { return scaleZ(d.prepared); })
			.style('fill', function(d) { return scaleZCol(d.prepared); });

	d3.selectAll('.circles:not(.avgGradeCircles)')
			.classed('allowTip', true);

	d3.selectAll('.lines')
			.style('stroke', function(d) { return scaleZCol(d.prepared); });

	d3.select('div#text').html("The size of the bubbles and their redness indicate how much time he spent preparing...");

	d3.selectAll('button.story').classed('pressed', false);
	d3.select(this).classed('pressed', true);

	
	d3.selectAll('.allowTip').on('mouseover', function(d,i) {

		var tooltipText = 
			'<p class="tooltipText">Subject: ' + d.subject + '</p>\
			<p class="tooltipText">National Avg: ' + d.avgGrade + '</p>\
			<p class="tooltipText">Expected Grade: ' + d.expected + '</p>\
			<p class="tooltipText">Grade: ' + d.grade + '</p>\
			<p class="tooltipText">Prepared: ' + d.prepared + ' minutes</p>';

		d3.select('div.tooltip')
				.style('left', (d3.event.pageX + 5) + 'px')
				.style('top', (d3.event.pageY + 5) + 'px')
				.html(tooltipText)
				.style('opacity', 0)
			.transition()
				.style('opacity', .8); // build and show tooltip 

	});

	d3.selectAll('.allowTip').on('mousemove', function() {

		d3.select('div.tooltip')
				.style('left', (d3.event.pageX + 5) + 'px')
				.style('top', (d3.event.pageY + 5) + 'px');

	});

	d3.selectAll('.allowTip').on('mouseout', function() {

		d3.select('div.tooltip')
			.transition()
				.style('opacity', 0); // build and show tooltip 

	});

});


d3.select('#start').on('mousedown', function(d) {

	d3.selectAll('.prequel > div')
		.transition()
		.duration(2000)
			.style('color', '#444');

	setTimeout(function() {

		d3.select('.prequel').style('display', 'none');
		d3.select('#container').style('display', 'flex');

		d3.select('#container')
			.append('div')
				.classed('cover', true)
			.transition()
			.duration(1000)
			.style('opacity', 0);

setTimeout(function() {
			d3.select('div.cover').style('display', 'none');
		}, 1200);

	}, 2000)
		
});




	