'use strict';

function linspace(start, end, steps = 100) {
	let X = [];
	let i = start;
	// compare against 0.001 which gives some wiggle room when comparing floats
	while (i - end < 0.001) {
		X.push(i);
		i += (end - start) / (steps - 1)
	}
	return X;
}

function f(n, theta) {
	let X = theta.slice();
	return X.map(e => Math.sqrt(Math.abs(Math.sin(n * e))));
}

document.addEventListener('DOMContentLoaded', () => {
	let theta = linspace(0, 2 * Math.PI, 4500)
	let data = [{
		r: f(2, theta),
		theta: theta,
		thetaunit: 'radians',
		type: 'scatterpolar'
	}]

	let layout = {
		autosize: true,
		showlegend: false,
		polar: {
			angularaxis: {
				thetaunit: 'radians',
			},
		},
	}

	let config = {
		displayModeBar: false,
		responsive: true,
	};

	Plotly.newPlot('plot', data, layout, config)

	// when slider is changed
	document.getElementById("slider").oninput = (e) => {
		data[0].r = f(e.target.value, theta);
		Plotly.react('plot', data, layout)

		// update 'n=' display using katex
		katex.render(`n=${e.target.value}`, document.getElementById("display"), {})
	}
})
