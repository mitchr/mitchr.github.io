let theta = linspace(0, 2*Math.PI, 40);
let phi = linspace(0, 2*Math.PI, 40);
let [T, P] = matrix.meshgrid(theta, phi);

function F(theta, phi) {
	x = matrix.eWMult(matrix.cos(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	y = matrix.eWMult(matrix.sin(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	z = matrix.sin(phi);
	return [x.data, y.data, z.data]
}

function geodDE(t, z) {
	let dzdt = new Array(4);
	dzdt[0] = z[1];
	dzdt[1] = 2*Math.sin(z[2])/(2+Math.cos(z[2]))*z[1]*z[3];
	dzdt[2] = z[3];
	dzdt[3] = -Math.sin(z[2])*(2+Math.cos(z[2]))*(z[1]**2);
	return new matrix(dzdt)
}

torusSurf = {
	type: 'surface',
	// don't show contour lines on hover
	contours: {
		x: {highlight: false},
		y: {highlight: false},
		z: {highlight: false},
	},
	colorscale: "Viridis",

	showscale: false,
	hoverinfo: 'skip',

	x: matrix.eWMult(matrix.cos(T), (matrix.sAdd(matrix.cos(P), 2))).to2D(),
	y: matrix.eWMult(matrix.sin(T), (matrix.sAdd(matrix.cos(P), 2))).to2D(),
	z: matrix.sin(P).to2D(),
}

let defLayout = {
	// title: "a sphere",
	autosize: true,
	// remove drop pointer on hover
	scene: {
		xaxis: {showspikes: false},
		yaxis: {showspikes: false},
		zaxis: {showspikes: false},
	}
};

let defConfig = {
	displayModeBar: false,
	responsive: true,
};
