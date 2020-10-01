function linspace(start, end, steps = 100) {
	let X = [];
	let i = start;
	// compare against 0.001 which gives some wiggle room when comparing floats
	while(i - end < 0.001) {
		X.push(i);
		i += (end-start)/(steps-1)
	}
	return X;
}

// uses row major order
class matrix {
	// there are 2 possible formats for the arguments:
	// 	matrix(data)
	// 		promotes an array to a 1x(data.length) matrix
	// 	matrix(n, m)
	// 		creates an nxm matrix with an empty data array
	// 	matrix(n, m, data)
	// 		create an nxm matrix with the array data
	constructor(...args) {
		// we were given an array
		if (args.length == 1) {
			this.n = 1;
			this.m = args[0].length;
			this.data = args[0];
		} else if (args.length > 1) {
			[this.n, this.m, this.data] = args;
			//  if we were given just the dimension arguments, initialize data to an empty array
			if (this.data == undefined) {
				this.data = [];
			}
		} else {
			console.error("cannot create empty matrix object");
			return NaN;
		}
	}

	get(i, j) {
		return this.data[i*this.m + j];
	}

	set(i, j, e) {
		this.data[i*this.m + j] = e;
	}

	clone() {
		return new matrix(this.n, this.m, this.data.slice(0));
	}

	diag() {
		let diag = [];
		for (let i = 0; i < this.n; i++) {
			diag.push(this.get(i, i));
		}
		return diag;
	}

	// there's gotta be a faster algorithm for this
	transpose() {
		let B = new matrix(this.m, this.n, new Array(this.data.length))
		for (let i = 0; i < this.n; i++) {
			for (let j = 0; j < this.m; j++) {
				B.set(j, i, this.get(i, j));
			}
		}
		return B;
	}

	// return this.data(r, :)
	row(r) {
		if (r >= this.n) {
			console.error("cannot replacerow, no row " + r)
		}
		let row = [];
		for (let i = 0; i < this.m; i++) {
			row.push(this.get(r, i))
		}
		return new matrix(row);
		// can do this faster using array slicing, but I need to think about the correct syntax
		// the commented code below doesn't work correctly for small matrices (like a 2x1 for example)
		// return new matrix(1, this.m, this.data.slice(this.n*r, this.n*r + this.m));
	}

	// append row r
	appendRow(r) {
		// this and r should have the same number of columns
		if (this.m != r.m) {
			console.error("cannot append row, dimension error");
			return;
		}

		// append elements of r to this.data
		this.data.push.apply(this.data, r.data);
		this.n++;
	}

	// replace row r with the data in d
	replaceRow(r, d) {
		if (r >= this.n) {
			console.error("cannot replacerow, no row " + r)
			return
		}
		// this and d should have the same number of columns
		if (this.m != d.m) {
			console.error("cannot replaceRow, dimension error");
			return;
		}

		for (let i = 0; i < this.m; i++) {
			this.set(r, i, d.data[i])
		}
	}

	// return column this.data(:, c)
	col(c) {
		if (c >= this.m) {
			return NaN;
		}

		let col = [];
		for(let i = 0; i < this.n; i++) {
			col.push(this.get(i, c))
		}

		return new matrix(this.n, 1, col);
	}

	appendCol(c) {
		if (this.n != c.n) {
			console.error("cannot append column, dimension error")
		}

		let writePtr = this.m;
		let i = 0;
		while (writePtr < (this.data.length + c.data.length)) {
			this.data.splice(writePtr, 0, c.data[i]);
			// we need to add 1 here because when we splice, we are adding a new
			// element which is one more element to traverse over
			writePtr += this.m + 1;
			i++;
		}

		this.m++;
	}

	replaceCol(c, d) {
		if (this.n != d.n) {
			console.error("cannot replaceCol, dimension error")
		}

		for(let i = 0; i < this.n; i++) {
			this.set(i, c, d.data[i])
		}
	}

	to2D() {
		let A = [];
		// allocate enough rows to reconstruct the matrix
		for (let i = 0; i < this.n; i++) {
			A.push([]);
		}

		for (let k = 0; k < this.data.length; k++) {
			let i = Math.floor(k/this.m);
			let j = k % this.m;
			A[i][j] = this.data[k];
		}
		return A;
	}

	// flatten a 2D array into a row-major ordered matrix object
	flatten() {

	}

	static linspace(start, end, steps = 100) {
		let X = [];
		for (let i = start; i <= end; i+=(end-start)/(steps-1)) {
			X.push(i);
		}
		return new matrix(X);
	}

	static meshgrid(x, y) {
		let X = [];
		let Y = [];

		// convert x and y to matrices if they are arrays
		if (x instanceof Array) {
			x = new matrix(x);
		}
		if (y instanceof Array) {
			y = new matrix(y);
		}

		for (let i = 0; i < y.m; i++) {
			X.push.apply(X, x.data)
		}

		let row = new Array(x.m);
		for (let i = 0; i < y.m; i++) {
			row.fill(y.data[i]);
			Y.push.apply(Y, row)
		}
		return [new matrix(y.m, x.m, X), new matrix(y.m, x.m, Y)]
	}

	// apply function f to every element of data
	map(f) {
		return new matrix(this.n, this.m, A.data.map(f))
	}

	static sin(A) {
		return new matrix(A.n, A.m, A.data.map(Math.sin));
	}

	static cos(A) {
		return new matrix(A.n, A.m, A.data.map(Math.cos));
	}

	// scalar add
	static sAdd(x, c) {
		return new matrix(x.n, x.m, x.data.map(e => e + c));
	}

	// scalar multiplication
	static sMult(x, c) {
		return new matrix(x.n, x.m, x.data.map(e => e * c));
	}

	// element wise add
	// all matrices must have same dimension
	static add(...A) {
		let S = A[0].clone();
		for (let i = 1; i < A.length; i++) {
			if (A[i].n != S.n && A[i].m != S.m) {
				console.error("cannot add matrices of differing dimension")
				return NaN
			}
			S.data = S.data.map((e, j) => e + A[i].data[j])
		}
		return S;
	}

	static sub(...A) {
		let S = A[0].clone();
		for (let i = 1; i < A.length; i++) {
			if (A[i].n != S.n && A[i].m != S.m) {
				console.error("cannot add matrices of differing dimension")
				return NaN
			}
			S.data = S.data.map((e, j) => e - A[i].data[j])
		}
		return S;
	}

	static multiply(A, B) {
		let C = new matrix(A.n, B.m);
		for (let i = 0; i < A.n; i++) {
			for (let j = 0; j < B.m; j++) {
				let sum = 0;
				for (let k = 0; k < B.m; k++) {
					sum += A.get(i, k) * B.get(k, j);
				}
				C.set(i, j, sum);
			}
		}
		return C;
	}

	// element wise multiplication
	static eWMult(...A) {
		let S = A[0].clone();
		for (let i = 1; i < A.length; i++) {
			if (A[i].n != S.n && A[i].m != S.m) {
				console.error("cannot element-wise multiply matrices of differing dimension")
				return NaN;
			}
			S.data = S.data.map((e, j) => e * A[i].data[j])
		}
		return S;
	}
}
