// some defaults for Plotly
let defLayout = {
	// title: "a sphere",
	autosize: true,
	// make plot take up entire div
	margin: {
		t: 0, // top margin
		l: 0, // left margin
		r: 0, // right margin
		b: 0, // bottom margin
	},

	// set scene camera
	scene: {
		camera: {
			eye: {
				x: 1.8,
				y: 1.8,
				z: 2.1,
			},
		},

		// remove drop pointer on hover
		xaxis: {showspikes: false},
		yaxis: {showspikes: false},
		zaxis: {showspikes: false},
	}
};

let defConfig = {
	displayModeBar: false,
	responsive: true,
};

// create pool of workers
let workers = [];
for (var i = 0; i < 3; i++) {
	workers[i] = new Worker('../js/geodWorker.js');
	workers[i].onmessage = handle;
}

function handle(msg) {
	let {divID, plots} = msg.data;

	// if the DOM is still loading, then add an eventListener that will fire
	// when it is ready
	if (document.readyState == 'loading') {
		document.addEventListener('DOMContentLoaded', (event) => {
			Plotly.react(divID, plots, defLayout, defConfig);
		});
	} else { // otherwise, just add the plot to the DOM right now
		Plotly.react(divID, plots, defLayout, defConfig);
	}
}

workers[0].postMessage({
	divID: "torus",
})

workers[1].postMessage({
	divID: "tpGeod",
	data: [{
		tSpan: [0, 7],
		y0: [0, 0, 0, 1],
		hmax: 0.25,
		TOL: 0.1,
	}, {
		tSpan: [0, 7],
		y0: [0, 1, 0, 0],
		hmax: 0.01,
		TOL: 0.1,
	}]
});

workers[2].postMessage({
	divID: "longWind",
	data: [{
		tSpan: [0, 2],
		y0: [0, 1, 0, 12],
		hmax: 0.01,
		TOL: 0.00001,
	}]
});
