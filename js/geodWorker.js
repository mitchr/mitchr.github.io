importScripts('./matrix.js');
importScripts('./ode.js');

let theta = linspace(0, 2*Math.PI, 40);
let phi = linspace(0, 2*Math.PI, 40);
let [T, P] = matrix.meshgrid(theta, phi);

// defines torus surface
function F(theta, phi) {
	x = matrix.eWMult(matrix.cos(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	y = matrix.eWMult(matrix.sin(theta), (matrix.sAdd(matrix.cos(phi), 2)));
	z = matrix.sin(phi);
	return [x.data, y.data, z.data]
}

// differential equationr representing geodesic of torus
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

onmessage = function(msg) {
	let data = msg.data.data;

	// if there is no data, just plot the torus by itself
	if (data == undefined) {
		// console.log(data)
		postMessage({
			divID: msg.data.divID,
			plots: [torusSurf],
		})
	} else {
		// for each entry in data, run rkf45 and collect result in resp
		let plots = [torusSurf];
		for (let i = 0; i < data.length; i++) {
			let {tSpan, y0, hmax, TOL} = data[i];

			[t, y] = rkf45(geodDE, tSpan, y0, hmax, TOL)
			geod = F(y.col(0), y.col(2));

			var plotData = {
				type: 'scatter3d',
				name: '['+y0.toString()+']',
				mode: 'lines',
				x: geod[0],
				y: geod[1],
				z: geod[2],

				line: {
					width: 20,
				},
			};

			plots.push(plotData);
		}

		// send back the divID and the newly constructed plots
		postMessage({
			divID: msg.data.divID,
			plots: plots,
		})
	}
}
