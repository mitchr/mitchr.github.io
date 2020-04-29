let theta = linspace(0, 2*Math.PI);
let phi = linspace(0, 2*Math.PI);
let [T, P] = meshgrid(theta, phi);

function F(theta, phi) {
	x = matrix.elementWiseMult(matrix.cos(theta), (scalarAdd(matrix.cos(phi), 2)));
	y = matrix.elementWiseMult(matrix.sin(theta), (scalarAdd(matrix.cos(phi), 2)));
	z = matrix.sin(phi);
	return [x, y, z]
}

function geodDE(t, z) {
	let dzdt = new Array(4);
	dzdt[0] = z[1];
	dzdt[1] = 2*Math.sin(z[2])/(2+Math.cos(z[2]))*z[1]*z[3];
	dzdt[2] = z[3];
	dzdt[3] = -Math.sin(z[2])*(2+Math.cos(z[2]))*(z[1]**2);
	return dzdt
}

let torusSurf = {
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

	x: matrix.elementWiseMult(matrix.cos(T), (matrix.scalarAdd(matrix.cos(P), 2))),
	y: matrix.elementWiseMult(matrix.sin(T), (matrix.scalarAdd(matrix.cos(P), 2))),
	z: matrix.sin(P),
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
