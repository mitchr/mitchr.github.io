function linspace(start, end, steps = 100) {
	let X = [];
	for (let i = start; i <= end; i+=(end-start)/(steps-1)) {
		X.push(i);
	}
	return X;
}

function meshgrid(x, y) {
	let X = [];
	let Y = [];

	for (let lenY = 0; lenY < y.length; lenY++) {
		X.push(x)
	}

	for (let lenY = 0; lenY < y.length; lenY++) {
		var row = []
		for (let i = 0; i < x.length; i++) {
			row.push(y[lenY])
		}
		Y.push(row)
	}
	return [X, Y]
}

function elementWiseAdd(x, y) {
	if (x.length != y.length) {
		return NaN;
	}

	let z = [];
	for (let i = 0; i < x.length; i++) {
		z[i] = x[i] + y[i];
	}
	return z;
}

function arrAdd(...arrs) {
	let sum = new Array(arrs[0].length).fill(0);
	for (let i = 0; i < arrs.length; i++) {
		for (let j = 0; j < arrs[i].length; j++) {
			sum[j] += arrs[i][j]
		}
	}
	return sum;
}

function scalarAdd(x, c) {
	return x.map((e) => e+c);
}

function scalarMult(x, c) {
	return x.map((e) => e*c);
}

function scalarDiv(x, c) {
	return x.map((e) => e/c);
}

class matrix {
	static sin(x) {
		let y = x.slice(0);
		y.forEach((row, i) => {
			if (row instanceof Array) {
				y[i] = row.map(Math.sin);
			} else {
				y[i] = Math.sin(row)
			}
		})
		return y;
	}

	static cos(x) {
		let y = x.slice(0);
		y.forEach((row, i) => {
			if (row instanceof Array) {
				y[i] = row.map(Math.cos);
			} else {
				y[i] = Math.cos(row)
			}
		})
		return y;
	}

	static column(x, c) {
		let col = [];
		x.forEach((row, i) => {
			col.push(row[c])
		});
		return col;
	}

	static scalarAdd(x, c) {
		let y = x.slice(0);
		y.forEach((row, i) => {
			y[i] = row.map((e) => e+c);
		})
		return y;
	}

	static scalarMult(x, c) {
		let y = x.slice(0);
		y.forEach((row, i) => {
			y[i] = row.map((e) => e*c);
		})
		return y;
	}

	static elementWiseMult(x, y) {
		// check if number of rows are the same
		if (x.length != y.length) {
			return NaN;
		}

		let Z = [];
		// iterate through each row, assuming that column lengths are the same
		for (var i = 0; i < x.length; i++) {
			// if this is really a 2d array,
			if (x[i] instanceof Array) {
				var row = []
				for (var j = 0; j < x[i].length; j++) {
					row.push(x[i][j]*y[i][j])
				}
				Z.push(row)
			} else { // we are just elementwise multiplying two 1d arrays
				return x.map((e, i) => x[i]*y[i]);
			}
		}
		return Z;
	}
}
