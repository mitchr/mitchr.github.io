'use strict';

let theta = linspace(0, 2 * Math.PI, 25);
let phi = theta;
let [T, P] = matrix.meshgrid(theta, phi);

let torusSurf = {
	type: 'surface',
	// don't show contour lines on hover
	contours: {
		x: { highlight: false },
		y: { highlight: false },
		z: { highlight: false },
	},
	colorscale: "Viridis",

	showscale: false,
	hoverinfo: 'skip',

	x: matrix.eWMult(matrix.cos(T), (matrix.sAdd(matrix.cos(P), 2))).to2D(),
	y: matrix.eWMult(matrix.sin(T), (matrix.sAdd(matrix.cos(P), 2))).to2D(),
	z: matrix.sin(P).to2D(),
};

// some defaults for Plotly
let defLayout = {
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
		xaxis: { showspikes: false },
		yaxis: { showspikes: false },
		zaxis: { showspikes: false },
	},
};

let defConfig = {
	displayModeBar: false,
	responsive: true,
};

// create one new worker
let worker = new Worker('../../../../js/cshootWorker.js');

let firstPlot = true;

// handle worker response
worker.onmessage = ((msg) => {
	let errorDiv = document.getElementById("error");
	if (msg.data.err != undefined) {
		// display message of some kind
		console.error("caught exception: " + msg.data.err);
		errorDiv.innerText = msg.data.err;
		errorDiv.style.display = "block";
		return;
	} else {
		// clear a potentially existing error if the method succeeds
		errorDiv.style.display = "none";
	}
	let { divID, geodTrace } = msg.data;

	// only called when initializing the plot the first time
	if (firstPlot) {
		// if the DOM is still loading, then add an eventListener that will fire when it is ready
		if (document.readyState == "loading") {
			document.addEventListener("DOMContentLoaded", (event) => {
				Plotly.newPlot(divID, [geodTrace, torusSurf], defLayout, defConfig);
				firstPlot = false;
			});
		} else { // otherwise, just add the plot to the DOM right now
			Plotly.newPlot(divID, [geodTrace, torusSurf], defLayout, defConfig);
			firstPlot = false;
		}
	} else { // we are updating the geodesic trace
		// from the Plotly docs: "to apply an array as a value, you need to wrap it in an additional array"
		geodTrace.x = [geodTrace.x];
		geodTrace.y = [geodTrace.y];
		geodTrace.z = [geodTrace.z];
		Plotly.restyle(divID, geodTrace, [0])
	}
});

// get configuration information from text fields for plotting
window.addEventListener("DOMContentLoaded", (event) => {
	// synchronize theta(L)=phi(L)
	let b0 = document.getElementById("b0");
	let b1 = document.getElementById("b1");
	b0.onkeyup = (() => b1.value = b0.value);
	b1.onkeyup = (() => b0.value = b1.value);

	// set default plot
	worker.postMessage({
		divID: "plot",
		data: {
			tSpan: [0, 1],
			BC: [0, Math.PI, Math.PI / 2, Math.PI / 2],
			p: [1, 2, 1],
		}
	});

	document.getElementById("plotButton").onclick = (() => {
		let alpha0 = parseFloat(document.getElementById("alpha0").value);
		let alpha1 = parseFloat(document.getElementById("alpha1").value);
		let beta0 = parseFloat(document.getElementById("beta0").value);
		let beta1 = parseFloat(document.getElementById("beta1").value);

		let L = parseFloat(b0.value)

		worker.postMessage({
			divID: "plot",
			data: {
				tSpan: [0, L],
				BC: [alpha0, beta0, alpha1, beta1],
				p: [1, 2, L],
			}
		});
	});
});
