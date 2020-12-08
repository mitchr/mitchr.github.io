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
	let thetaPrime = (thetaBeta - thetaAlpha)/(tSpan[1]-tSpan[0]);
	let phiPrime = (phiBeta - phiAlpha)/(tSpan[1]-tSpan[0]);

	function residual(u) {
		if (!(u instanceof matrix)) {
			u = new matrix(u);
		}

		[t, w] = rkf45(geod, tSpan, [thetaAlpha, u.data[0], phiAlpha, u.data[1]], p, 0.5);
		return new matrix([w.get(w.n-1, 0) - thetaBeta, w.get(w.n-1, 2) - phiBeta]);
	}

	try {
		let c = newtonSys(residual, new matrix([thetaPrime, phiPrime]).transpose());
		return rkf45(geod, tSpan, [thetaAlpha, c.data[0], phiAlpha, c.data[1]], p, 0.05);
	} catch(err) {
		throw err; // throw back up callstack
	}
}

function geod(t, z, p) {
	[r, R, L] = p;

	let dzdt = new Array(4);
	dzdt[0] = z[1];
	dzdt[1] = 2*r*Math.sin(z[2])/(R+r*Math.cos(z[2]))*z[1]*z[3];
	dzdt[2] = z[3];
	dzdt[3] = -Math.sin(z[2])*(L-(r*z[3])**2)/(r*(R+r*Math.cos(z[2])))
	return new matrix(dzdt);
}

// Newton's method of finding solution set of simultaneous
// f = function handle returning [f1;f2;...;fn]
// u = starting solution vector [u1;u2]
function newtonSys(f, u, TOL=1e-2) {
	for (let i = 0; i < 200; i++) {
		let J = jac(f, u);
		let dx = GESPP(J, matrix.sMult(f(u), -1).transpose());

		let prevU = u.clone();
		u = matrix.add(u, dx);

		if (matrix.norm(matrix.sub(u, prevU)) < TOL) {
			return u;
		}
	}
	throw new Error("Could not find root in 200 iterations of Newton-Raphson")
}

// approximate the jacobian of a system f(x_1, x_2) = [f_1(x_1, x_2), f_2(x_1, x_2)] at x
function jac(f, x, h=1e-8) {
	// compute finite difference expressions
	// du is a column vector that contains the x_1 differential for f_1 and f_2
	// dv is the same but for x_2
	let du = new matrix(2, 1, matrix.sMult(matrix.add(f([x.data[0]+h, x.data[1]]), matrix.sMult(f([x.data[0]-h, x.data[1]]), -1)), 1/(2*h)).data);
	let dv = new matrix(2, 1, matrix.sMult(matrix.add(f([x.data[0], x.data[1]+h]), matrix.sMult(f([x.data[0], x.data[1]-h]), -1)), 1/(2*h)).data);

	return new matrix(2, 2, [du.data[0], dv.data[0], du.data[1], dv.data[1]])
}

// defines torus surface
function F(theta, phi) {
	x = matrix.eWMult(matrix.cos(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	y = matrix.eWMult(matrix.sin(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	z = matrix.sin(phi);
	return [x.data, y.data, z.data];
}

self.onmessage = function(msg) {
	let {tSpan, BC, p} = msg.data.data;

	let t, y;
	try {
		[t, y] = cShoot(tSpan, BC, p);
	} catch (err) {
		// if RK45F could not solve, return the error back to the main thread
		postMessage({err: err.message});
		return;
	}

	let geod = F(y.col(0), y.col(2));

	let plotData = {
		type: 'scatter3d',
		name: '['+BC.toString()+']',
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
