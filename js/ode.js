function rk4(f, tSpan, y0, h) {
	let t = linspace(tSpan[0], tSpan[1], (tSpan[1]-tSpan[0])/h+1);
	let y = [y0];

	for (let delta = 0; delta < t.length-1; delta++) {
		let singleStep = [];

		let k1 = scalarMult(f(t[delta], y[delta]), h);
		let k2 = scalarMult(f(t[delta] + h/2, elementWiseAdd(y[delta], scalarDiv(k1, 2))), h);
		let k3 = scalarMult(f(t[delta] + h/2, elementWiseAdd(y[delta], scalarDiv(k2, 2))), h);
		// t[delta+1] = t[delta] + h
		let k4 = scalarMult(f(t[delta+1], elementWiseAdd(y[delta], k3)), h);

		for (let numFun = 0; numFun < y0.length; numFun++) {
			singleStep[numFun] = y[delta][numFun] + (k1[numFun] + 2*k2[numFun] + 2*k3[numFun] + k4[numFun])/6;
		}
		y.push(singleStep);
	}
	return [t, y];
}

// runge-kutta fehlberg
function rkf45(f, tSpan, y0, hmax, TOL) {
	// start at the beginning of the interval
	let t = tSpan[0];
	let allT = [t];
	let y = [y0];
	let h = hmax;

	// keep integrating until we reach the end of the interval
	while(t < tSpan[1]) {
		let k1 = scalarMult(f(t, y[y.length-1]), h);
		let k2 = scalarMult(f(t + h/4, arrAdd(y[y.length-1], scalarMult(k1, 1/4))), h);
		let k3 = scalarMult(f(t + 3*h/8, arrAdd(y[y.length-1], scalarMult(k1, 3/32), scalarMult(k2, 9/32))), h);
		let k4 = scalarMult(f(t + 12*h/13, arrAdd(y[y.length-1], scalarMult(k1, 1932/2197), scalarMult(k2, -7200/2197), scalarMult(k3, 7296/2197))), h);
		let k5 = scalarMult(f(t + h, arrAdd(y[y.length-1], scalarMult(k1, 439/216), scalarMult(k2, -8), scalarMult(k3, 3680/513), scalarMult(k4, -845/4104))), h);
		let k6 = scalarMult(f(t + h/2, arrAdd(y[y.length-1], scalarMult(k1, -8/27), scalarMult(k2, 2), scalarMult(k3, -3544/2565), scalarMult(k4, 1859/4104), scalarMult(k5, -11/40))), h)

		// compute rk4 and rk5 for each vector
		let rk4 = arrAdd(y[y.length-1], scalarMult(k1, 25/216), scalarMult(k3, 1408/2565), scalarMult(k4, 2197/4104), scalarMult(k5, -1/5));
		let rk5 = arrAdd(y[y.length-1], scalarMult(k1, 16/135), scalarMult(k3, 6656/12825), scalarMult(k4, 28561/56430), scalarMult(k5,-9/50), scalarMult(k6, 2/55));

		// determine maximum error of all rk5-rk4
		let diff = arrAdd(rk5, scalarMult(rk4, -1));
		let diffmax = diff.reduce((a,b) => {
			return Math.max(a, b);
		})

		let R = Math.abs(diffmax)/h;
		// accept rk4 approx
		if (R <= TOL) {
			y.push(rk4);
			t = t + h;
			allT.push(t);
		}

		let delta = 0.84*Math.pow(TOL/R, 1/4);
		if (delta <= 0.1) {
			h = 0.1*h;
		} else if (delta >= 4) {
			h = 4*h;
		} else {
			h = delta*h;
		}

		if (h > hmax) {
			h = hmax;
		}

		// we went over the interval, we're done
		if (t >= tSpan[1]) {
			return [allT, y]
		} else if (t + h > tSpan[1]) {
			h = tSpan[1] - t;
		}
	}
	return [allT, y];
}

// uncomment to test compliance with Burden and Faires algorithm
// function test(t, y) {
// 	let dydt = new Array(1);
// 	dydt[0] = y - t*t + 1;
// 	return dydt;
// }
// console.log(rkf45(test, [0, 2], [0.5], 0.25, Math.pow(10, -5)))
