importScripts('./matrix.js');
importScripts('./geod.js');
importScripts('./ode.js');

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
			geod = F(matrix.column(y, 0), matrix.column(y, 2));

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
