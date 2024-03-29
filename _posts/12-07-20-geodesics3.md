---
layout: post
title: "Geodesics Boogaloo"
date: 2020-12-07
description: >-
 A new approach to solving the geodesic BVP on a torus.

katex: true
scripts:
- https://cdn.plot.ly/plotly-gl3d-2.14.0.min.js
- ../../../js/matrix.js
- ../../../js/12-7-20.js
---

[Some posts back]({%post_url 01-12-20-geodesics2%}) I was trying to solve the boundary value problem associated with toroidal geodesics, and I ran into some problems. The crux of these issues what that I was trying to satisfy the default geodesic equations on the arbitrary interval $(0,1)$, when in actuality there was no mathematical basis in choosing that. The fix for this is the inclusion of a simple theorem:

**Theorem**: A geodesic has constant speed.

$\mathit{Proof.}$ Let $\gamma(t)$ be a geodesic on a surface $S$.

$$\frac{d}{dt}\lVert\gamma'\rVert^2 = \frac{d}{dt}(\gamma'\cdot\gamma') =\gamma''\cdot\gamma' + \gamma''\cdot\gamma' = 2\gamma''\cdot\gamma'$$

Since $\gamma''$ is by definition perpendicular to $S$, it is also perpendicular to the tangent vector $\gamma'$, so $\gamma''\cdot\gamma'=0$. Therefore $\frac{d}{dt}\lVert\gamma'\rVert^2 = 0$ and

$$
\begin{aligned}
\lVert\gamma'\rVert^2&=c\\
\lVert\gamma'\rVert&=\sqrt{c}
\end{aligned}
$$

for some constant $c$. $\Box$

A geodesic $\gamma(t)$ on a torus $\sigma$ is defined by

$$
\gamma(t) =\sigma(\theta(t),\phi(t)) = \begin{bmatrix}
\cos(\theta(t))(R+r\cos(\phi(t))) \\
\sin(\theta(t))(R+r\cos(\phi(t))) \\
r\sin(\phi(t)) \\
\end{bmatrix}
$$

Since any geodesic has constant speed, we might as well consider geodesics with unit-speed, meaning $\lVert\gamma'\rVert=1$. What is $\lVert\gamma'\rVert$? With some applications of the chain rule,

$$
\begin{aligned}
\lVert\gamma'\rVert^2 = (R+r\cos\theta)^2d\theta^2 + r^2d\phi^2 \\
1^2 = (R+r\cos\theta)^2d\theta^2 + r^2d\phi^2.
\end{aligned}
$$

With this new information, we can modify the standard geodesic equations.
The geodesic equations are again

$$
\begin{gathered}
\theta''=\frac{2r\sin\phi}{R+r\cos\phi}\phi'\theta' \\
\phi'' = -\frac{1}{r}\sin\phi(R+r\cos\phi)(\theta')^2.
\end{gathered}
$$

With the substitution $(\theta')^2=\frac{1-r^2d\phi^2}{(R+r\cos\phi)^2}$, the equations become

$$
\begin{gathered}
\theta''=\frac{2r\sin\phi}{R+r\cos\phi}\phi'\theta' \\
\phi'' = -\frac{\sin\phi(1-(r\phi')^2)}{r(R+r\cos\phi)}.
\end{gathered}
$$

We can describe the boundary value problem using these new equations

$$
\begin{aligned}
\text{ODEs} \qquad
&\left\{\begin{aligned}
\theta''&=\frac{2r\sin(\phi)}{R+r\cos(\phi)}\phi'\theta' \\
\phi'' &= -\frac{\sin\phi(1-(r\phi')^2)}{r(R+r\cos\phi)}
\end{aligned}\right. \\

\text{BCs} \qquad
&\left\{\begin{aligned}
\theta(0)&=\alpha_0 & \theta(b)&=\beta_0 \\
\phi(0)&=\alpha_1 & \phi(b)&=\beta_1.
\end{aligned}\right.
\end{aligned}
$$

Note that this time, a choice of $(0,1)$ makes sense because the unit-speed condition guarantees that the BVP can be satisfied on this interval. In fact, any interval $(0,b)$ will work. To justify this, we must look at the arc-length of $\gamma$, which is given by $$s=\int_{t_0}^t \lVert \gamma'(t) \rVert \, dt.$$

Since we are integrating from $0$ to $b$, and $\gamma$ has unit-speed,

$$
\begin{aligned}
s &= \int_{t_0}^t \lVert \gamma'(t) \rVert \, dt \\
s &= \int_0^b 1 \, dt \\
s &= b.
\end{aligned}
$$

The length of $\gamma$ directly depends on the length of the interval, so it is just as well that we let $b=1$.

...atleast, in theory we should be able to do that. In my testing, RKF45 could handle any BVP where $b=1$, but it becomes unstable when $b>5$ or so. This was not the case when I tested this same solution process in Julia, which has a much more sophisticated ODE solver suite. Julia actually has the ability to [on-the-fly switch what solver it is using](https://diffeq.sciml.ai/stable/solvers/ode_solve/#CompositeAlgorithm) when the step-size becomes too small. For this particular system, DifferentialEquations.jl chose a combination of <code>TSit5</code> which is an RK45 variant, and <code>Rosenbrock23</code> which is a powerful solver for stiff systems. I have included a little tester below to play around with.

<div class="container">
	<div class="row align-items-center">
	<!-- on small screens, give buffer between plot and edge of viewport -->
	<!-- on large screens, show plot and input buttons side-by-side -->
		<div class="col-10 offset-1 col-lg-6 offset-lg-0">
			<div id="plot"></div>
		</div>
		<div class="col-lg-6">
			<div class="card">
				<div class="card-body">
					<div class="row align-items-center">
						<div class="col-6">
							<div class="input-group">
								<div class="input-group-prepend">
									<span class="input-group-text">$\theta(0)=$</span>
								</div>
								<input type="text" size="1" id="alpha0" value="0" class="form-control">
							</div>
						</div>
						<div class="col-6">
							<div class="input-group">
								<div class="input-group-prepend">
									<span class="input-group-text">
										$\theta($<input type="text" size="1" id="b0" value="1" class="form-control">$)=$
									</span>
								</div>
								<input type="text" size="1" id="beta0" value="3.14" class="form-control" style="height:70px;">
							</div>
						</div>
					</div>
					<div class="row align-items-center">
						<div class="col-6">
							<div class="input-group">
								<div class="input-group-prepend">
									<span class="input-group-text">$\phi(0)=$</span>
								</div>
								<input type="text" size="1" id="alpha1" value="1.57" class="form-control">
							</div>
						</div>
						<div class="col-6">
							<div class="input-group">
								<div class="input-group-prepend">
									<span class="input-group-text">
										$\phi($<input type="text" size="1" id="b1" value="1" class="form-control">$)=$
									</span>
								</div>
								<input type="text" size="1" id="beta1" value="1.57" class="form-control" style="height:70px;">
							</div>
						</div>
					</div>
				</div>
				<div class="card-footer text-center">
					<button type="button" id="plotButton" class="btn text-white" style="background-color: LightSlateGrey;">Plot</button>
					<div id="error" class="alert alert-danger" style="display: none;"></div>
				</div>
			</div>
		</div>
	</div>
</div>
