'use strict';

importScripts("./matrix.js");
importScripts("./ode.js");

// defines torus surface
function F(theta, phi) {
	let x = matrix.eWMult(matrix.cos(theta), matrix.sAdd(matrix.cos(phi), 2));
	let y = matrix.eWMult(matrix.sin(theta), matrix.sAdd(matrix.cos(phi), 2));
	let z = matrix.sin(phi);
	return [x.data, y.data, z.data];
}

// differential equationr representing geodesic of torus
function geodDE(t, z, p = undefined) {
	let dzdt = new Array(4);
	dzdt[0] = z[1];
	dzdt[1] = ((2 * Math.sin(z[2])) / (2 + Math.cos(z[2]))) * z[1] * z[3];
	dzdt[2] = z[3];
	dzdt[3] = -Math.sin(z[2]) * (2 + Math.cos(z[2])) * z[1] ** 2;
	return new matrix(dzdt);
}

onmessage = function (msg) {
	let data = msg.data.data;

	// for each entry in data, run rkf45 and collect result in resp
	// let plots = [torusSurf];
	let plots = [];
	for (let i = 0; i < data.length; i++) {
		let { tSpan, y0, p, hmax, TOL } = data[i];

		let [t, y] = rkf45(geodDE, tSpan, y0, p, hmax, TOL);
		let geod = F(y.col(0), y.col(2));

		let plotData = {
			type: "scatter3d",
			name: "[" + y0.toString() + "]",
			mode: "lines",
			x: geod[0],
			y: geod[1],
			z: geod[2],

			line: {
				width: 20
			}
		};

		plots.push(plotData);
	}

	// send back the divID and the newly constructed plots
	postMessage({
		divID: msg.data.divID,
		plots: plots
	});
};
