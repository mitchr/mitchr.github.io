'use strict';

importScripts('./matrix.js');
importScripts('./ode.js');
importScripts('./linSolve.js');

// coupled shooting
// BC = [thetaAlpha, thetaBeta, phiAlpha, phiBeta]
function cShoot(tSpan, BC, p) {
	let thetaAlpha = BC[0];
	let thetaBeta = BC[1];
	let phiAlpha = BC[2];
	let phiBeta = BC[3];

	// first guess using secant approx
	let thetaPrime = (thetaBeta - thetaAlpha) / (tSpan[1] - tSpan[0]);
	let phiPrime = (phiBeta - phiAlpha) / (tSpan[1] - tSpan[0]);

	function residual(u) {
		if (!(u instanceof matrix)) {
			u = new matrix(u);
		}

		let [t, w] = rkf45(geod, tSpan, [thetaAlpha, u.data[0], phiAlpha, u.data[1]], p, 0.5);
		return new matrix([w.get(w.n - 1, 0) - thetaBeta, w.get(w.n - 1, 2) - phiBeta]);
	}

	let c = newtonSys(residual, new matrix([thetaPrime, phiPrime]).transpose());
	return rkf45(geod, tSpan, [thetaAlpha, c.data[0], phiAlpha, c.data[1]], p, 0.05);
}

function geod(t, z, p) {
	let [r, R, L] = p;

	let dzdt = new Array(4);
	dzdt[0] = z[1];
	dzdt[1] = 2 * r * Math.sin(z[2]) / (R + r * Math.cos(z[2])) * z[1] * z[3];
	dzdt[2] = z[3];
	dzdt[3] = -Math.sin(z[2]) * (L - (r * z[3]) ** 2) / (r * (R + r * Math.cos(z[2])))
	return new matrix(dzdt);
}

// defines torus surface
function F(theta, phi) {
	let x = matrix.eWMult(matrix.cos(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	let y = matrix.eWMult(matrix.sin(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	let z = matrix.sin(phi);
	return [x.data, y.data, z.data];
}

self.onmessage = function (msg) {
	let { tSpan, BC, p } = msg.data.data;

	let t, y;
	try {
		[t, y] = cShoot(tSpan, BC, p);
	} catch (err) {
		// if RK45F could not solve, return the error back to the main thread
		if (err instanceof Error) {
			err = err.message;
		}
		postMessage({ err: err });
		return;
	}

	let geod = F(y.col(0), y.col(2));

	let plotData = {
		type: 'scatter3d',
		name: '[' + BC.toString() + ']',
		mode: 'lines',
		x: geod[0],
		y: geod[1],
		z: geod[2],

		marker: {
			color: 'rgb(255, 153, 51)',
		},

		line: {
			width: 20,
		},
	};

	// send back the divID and the newly constructed plots
	postMessage({
		divID: msg.data.divID,
		geodTrace: plotData,
	});
};
