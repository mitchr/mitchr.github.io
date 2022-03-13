'use strict';

function rk4(f, tSpan, y0, h) {
	let t = linspace(tSpan[0], tSpan[1], (tSpan[1] - tSpan[0]) / h + 1);
	let y = [y0];

	for (let delta = 0; delta < t.length - 1; delta++) {
		let singleStep = [];

		let k1 = scalarMult(f(t[delta], y[delta]), h);
		let k2 = scalarMult(f(t[delta] + h / 2, elementWiseAdd(y[delta], scalarDiv(k1, 2))), h);
		let k3 = scalarMult(f(t[delta] + h / 2, elementWiseAdd(y[delta], scalarDiv(k2, 2))), h);
		// t[delta+1] = t[delta] + h
		let k4 = scalarMult(f(t[delta + 1], elementWiseAdd(y[delta], k3)), h);

		for (let numFun = 0; numFun < y0.length; numFun++) {
			singleStep[numFun] = y[delta][numFun] + (k1[numFun] + 2 * k2[numFun] + 2 * k3[numFun] + k4[numFun]) / 6;
		}
		y.push(singleStep);
	}
	return [t, y];
}

// runge-kutta fehlberg taken from burden and faires
// f is the intergrating function
// 	f must be of the form f(t, z, p):matrix where p is an optional array of parameters
// y0 is an array of initial values
// hmax is the largest possible stepsize (optional)
// tolerance is the minimum tolerance necessary to proceed (optional)
function rkf45(f, tSpan, y0, p = [], hmax = 0.25, TOL = 1e-4) {
	// start at the beginning of the interval
	let t = tSpan[0];
	let allT = [t];

	// if y0 is already a matrix, then that's fine
	// otherwise, create a new matrix object
	let y = new matrix(1, 1);
	if (y0 instanceof matrix) {
		y.appendCol(y0)
	} else {
		// need to clone y0 here to prevent modification
		y = new matrix(y0.slice(0));
	}
	let h = hmax;

	// keep integrating until we reach the end of the interval
	while (t < tSpan[1]) {
		let k1 = matrix.sMult(f(t, y.row(y.n - 1).data, p), h);
		let k2 = matrix.sMult(f(t + h / 4, matrix.add(y.row(y.n - 1), matrix.sMult(k1, 1 / 4)).data, p), h);
		let k3 = matrix.sMult(f(t + 3 * h / 8, matrix.add(y.row(y.n - 1), matrix.sMult(k1, 3 / 32), matrix.sMult(k2, 9 / 32)).data, p), h);
		let k4 = matrix.sMult(f(t + 12 * h / 13, matrix.add(y.row(y.n - 1), matrix.sMult(k1, 1932 / 2197), matrix.sMult(k2, -7200 / 2197), matrix.sMult(k3, 7296 / 2197)).data, p), h);
		let k5 = matrix.sMult(f(t + h, matrix.add(y.row(y.n - 1), matrix.sMult(k1, 439 / 216), matrix.sMult(k2, -8), matrix.sMult(k3, 3680 / 513), matrix.sMult(k4, -845 / 4104)).data, p), h);
		let k6 = matrix.sMult(f(t + h / 2, matrix.add(y.row(y.n - 1), matrix.sMult(k1, -8 / 27), matrix.sMult(k2, 2), matrix.sMult(k3, -3544 / 2565), matrix.sMult(k4, 1859 / 4104), matrix.sMult(k5, -11 / 40)).data, p), h)

		// compute rk4 and rk5 for each vector
		let rk4 = matrix.add(y.row(y.n - 1), matrix.sMult(k1, 25 / 216), matrix.sMult(k3, 1408 / 2565), matrix.sMult(k4, 2197 / 4104), matrix.sMult(k5, -1 / 5));
		let rk5 = matrix.add(y.row(y.n - 1), matrix.sMult(k1, 16 / 135), matrix.sMult(k3, 6656 / 12825), matrix.sMult(k4, 28561 / 56430), matrix.sMult(k5, -9 / 50), matrix.sMult(k6, 2 / 55));

		// determine maximum error of all rk5-rk4
		let diff = matrix.add(rk5, matrix.sMult(rk4, -1));
		let diffmax = diff.data.reduce((a, b) => Math.max(a, b));

		let R = Math.abs(diffmax) / h;
		// accept rk4 approx
		if (R <= TOL) {
			y.appendRow(rk4);
			t = t + h;
			allT.push(t);
		}

		let delta = 0.84 * Math.pow(TOL / R, 1 / 4);
		if (delta <= 0.1) {
			h = 0.1 * h;
		} else if (delta >= 4) {
			h = 4 * h;
		} else {
			h = delta * h;
		}

		if (h > hmax) {
			h = hmax;
		}

		// we went over the interval, we're done
		if (t >= tSpan[1]) {
			return [new matrix(allT), y]
		} else if (t + h > tSpan[1]) {
			h = tSpan[1] - t;
		} else if (h < 1e-10) { // stepsize became incredibly small, usually because ODE is stiff
			// if the stepsize is too small, then stop execution
			throw new Error("stepsize too small");
		}
	}
	return [new matrix(allT), y];
}

function bckwdEuler(f, t0, tf, y0, p = [], h = 0.25) {
	// if y0 is already a matrix, then that's fine
	// otherwise, create a new matrix object
	let y = new matrix(1, 1);
	if (y0 instanceof matrix) {
		y.appendCol(y0)
	} else {
		// need to clone y0 here to prevent modification
		y = new matrix(y0.slice(0));
	}

	let tSpan = [];
	tSpan.push(t0);
	let t = t0;
	while (t < tf) {
		// y_{k}
		let yk = y.row(y.n - 1).transpose()

		// let residual = (yk1) => yk1 - yk - h * f(t, yk1, p);
		let residual = (yk1) => {
			if (!(yk1 instanceof matrix)) {
				yk1 = new matrix(yk1).transpose();
			}

			return matrix.add(yk1, matrix.sMult(yk, -1), matrix.sMult(f(t, yk1.data, p), -h).transpose());
		};

		// solve for y_{k+1}
		let u = newtonSys(residual, yk);
		y.appendRow(u.transpose());
		t += h;
		tSpan.push(t);
	}

	return [tSpan, y];
}

// Newton's method of finding solution set of simultaneous
// f = function handle returning [f1;f2;...;fn]
// u = initial guess (column vector) [u1;u2]
function newtonSys(f, u, TOL = 1e-2) {
	for (let i = 0; i < 200; i++) {
		let J = jac(f, u);
		let dx = GESPP(J, matrix.sMult(f(u), -1));

		let prevU = u.clone();
		u = matrix.add(u, dx);

		if (matrix.norm(matrix.sub(u, prevU)) < TOL) {
			return u;
		}
	}
	throw new Error("Could not find root in 200 iterations of Newton-Raphson")
}

// approximate the jacobian of a system via finite differences.
// f(x_1, x_2, ..., x_n) = [f_1(x_1, ..., x_n), ..., f_n(x_1, ..., x_n)] at x
function jac(f, x, h = 1e-8) {
	// compute finite difference expressions
	// the first row contains the x_1 differential for f_1, f_2, ..., f_n,
	// and so on for the other rows
	let m = [];
	for (let i = 0; i < x.data.length; i++) {
		let term1 = constructFiniteDifferenceTerm(x.data, i, h);
		let term2 = constructFiniteDifferenceTerm(x.data, i, -h);

		let row = matrix.sMult(matrix.add(f(term1), matrix.sMult(f(term2), -1)), 1 / (2 * h));
		m.push(...row.data);
	}

	return new matrix(x.data.length, x.data.length, m).transpose();
}

function constructFiniteDifferenceTerm(x, position, h) {
	let row = [];
	for (let i = 0; i < x.length; i++) {
		if (position == i) {
			row.push(x[i] + h);
		} else {
			row.push(x[i]);
		}
	}
	return row;
}

// function F(u) {
// 	return new matrix([u[0] * u[1], u[1] * u[1], u[2] * u[1], u[3] * u[1]]);
// }

// console.log("jac", jacn(F, new matrix([1, 2, 3, 4])).to2D())

// uncomment to test compliance with Burden and Faires algorithm
// function test(t, y) {
// 	let dydt = new Array(1);
// 	dydt[0] = y - t*t + 1;
// 	return new matrix(dydt);
// }
// console.log(rkf45(test, [0, 2], [0.5], [], 0.25, 1e-5))
