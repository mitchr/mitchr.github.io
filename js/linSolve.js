'use strict';

// gausiann elimination with partial pivoting (back susbstitution)
// A must be an nxn matrix
function GEPP(A, b) {
	A = A.clone();

	// clone b if it is a matrix, or form a new matrix if b is given as an array
	if (b instanceof matrix) {
		b = b.clone();
	} else {
		b = new matrix(b.slice(0));
	}

	for (let k = 0; k < A.n - 1; k++) {
		// find the index of the element with maximum absolute value in the kth column
		let i_k = k;
		for (let j = k; j < A.n; j++) {
			if (Math.abs(A.get(j, k)) >= Math.abs(A.get(i_k, k))) {
				i_k = j;
			}
		}

		// if there is an element below in column k with a larger pivot value, swap rows k and i_k
		if (i_k > k) {
			A.swapRows(i_k, k)
			b.swapRows(i_k, k)
		}

		// place zeros in the column containing the pivot by solving all rows below k
		// r_i -> r_i - a_ik/a_kk * r_k
		for (let i = k + 1; i < A.n; i++) {
			// save this value because A[i,k] will be set to 0 after we solve for the rows beneath
			let temp = A.get(i, k)

			A.replaceRow(i, matrix.add(A.row(i), matrix.sMult(A.row(k), -A.get(i, k) / A.get(k, k))));
			b.set(i, 0, b.get(i, 0) - temp / A.get(k, k) * b.get(k, 0));
		}
	}

	// perform back susbstitution
	b.set(b.n - 1, 0, b.get(b.n - 1, 0) / A.get(A.n - 1, A.n - 1));
	for (let i = A.n - 2; i > -1; i--) {
		sum = 0;
		for (let j = i + 1; j < A.n; j++) {
			sum += A.get(i, j) * b.get(j, 0);
		}
		b.set(i, 0, (b.get(i, 0) - sum) / A.get(i, i))
	}

	return b;
}

// gaussian elimination utilizing scaled partial pivoting
function GESPP(A, b) {
	A = A.clone();

	// clone b if it is a matrix, or form a new matrix if b is given as an array
	if (b instanceof matrix) {
		b = b.clone();
	} else {
		b = new matrix(b.slice(0));
	}

	// calculate scaling factors aka max of absolute value in each row
	let s = [];
	for (let i = 0; i < A.n; i++) {
		let max = 0;
		for (let j = 0; j < A.m; j++) {
			if (Math.abs(A.get(i, j)) > max) {
				max = Math.abs(A.get(i, j));
			}
		}
		if (max == 0) {
			console.error("system has no solution (singular matrix)");
			return NaN;
		}
		s.push(max);
	}
	s = new matrix(s.length, 1, s);

	for (let k = 0; k < A.n - 1; k++) {
		// calculate
		let p = [];
		for (let i = k; i < A.n; i++) {
			p.push(Math.abs(A.get(i, k)) / s.data[i]);
		}
		// console.log(p)

		// find smallest p_k such that p[j] > p_k
		let p_k = k;
		for (let j = 0; j < p.length; j++) {
			// console.log(j, p[j], p_k)
			if (p[j] > p_k) {
				// console.log(p_k, j, j+k)
				p_k = j + k;
				// force loop to end
				j = A.n;
			}
		}
		// console.log(`chose ${p_k}`)

		// swap rows p_k and p
		// we also swap the scaling factors here to keep everything aligned

		// console.log("before swap")
		// console.log(A.to2D())
		if (p_k > k) {
			A.swapRows(p_k, k)
			b.swapRows(p_k, k)
			s.swapRows(p_k, k)
		}
		// console.log("after swap")
		// console.log(A.to2D())
		// console.log(b.data)

		// place zeros in the column containing the pivot by solving all rows below k
		// r_i -> r_i - a_ik/a_kk * r_k
		// console.log("before solving below rows")
		// console.log(A.to2D())
		// console.log(b.data)
		for (let i = k + 1; i < A.n; i++) {
			// console.log(i)
			// save this value because A[i,k] will be set to 0 after we solve for the rows beneath
			let temp = A.get(i, k)

			// console.log(i, k, k, k)

			A.replaceRow(i, matrix.add(A.row(i), matrix.sMult(A.row(k), -A.get(i, k) / A.get(k, k))));
			b.set(i, 0, b.get(i, 0) - temp / A.get(k, k) * b.get(k, 0));
		}
		// console.log("after solving below rows")
		// console.log(A.to2D())
		// console.log(b.data)
	}

	// perform back susbstitution
	b.set(b.n - 1, 0, b.get(b.n - 1, 0) / A.get(A.n - 1, A.n - 1));
	for (let i = A.n - 2; i > -1; i--) {
		let sum = 0;
		for (let j = i + 1; j < A.n; j++) {
			sum += A.get(i, j) * b.get(j, 0);
		}
		b.set(i, 0, (b.get(i, 0) - sum) / A.get(i, i))
	}

	return b;
}
