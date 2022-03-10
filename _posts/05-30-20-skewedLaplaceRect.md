---
layout: post
title: "Skewed 5-Point Stencil for Laplace Equation on a Rectangular Boundary"
date: 2020-05-30

katex: true
---

In the [last post]({%post_url 03-18-20-skewedLaplaceSquare%}) we derived the rotated 5-point stencil for the Laplace equation, though at the end we made the simplification that $h=k$ which forced us into using a square boundary. But what if we want to use a boundary that is rectangular shaped (meaning $h \neq k$)? We'll have to change our approach here a little bit. Instead of the derivation we did last time which involved Taylor approximations, we'll think that about what happens to a standard grid under a $45^{\circ}$ clockwise rotation.

$$
\begin{aligned}
u_{i, j-1} &\to u_{i-1, j-1} \\
u_{i-1, j} &\to u_{i-1, j+1} \\
u_{i+1, j} &\to u_{i+1, j-1} \\
u_{i, j+1} &\to u_{i+1, j+1} \\
\end{aligned}
$$

Now that all of our nodes have been moved to their new locations, we should think about what happens to $h$ and $k$. For calculating the new vertical distance $k'$, consider the triangle formed by the nodes $u_{i,j}, u_{i,j+1}, u_{i+1,j+1}$ (we could also consider the triangle formed by $u_{i,j}, u_{i,j-1},u_{i-1,j-1}$, but the result is the same). The hypoteneuse of this triangle is $\sqrt{h^2+k^2}$, which is also $k'$. The new horizontal distance $h'$ is found in a similar way by looking at the triangle formed by $u_{i,j}, u_{i-1, j}, u_{i-1, j+1}$ (or $u_{i,j}, u_{i+1,j}, u_{i+1, j-1}$). The hypotoneuse of this triangle is also $\sqrt{h^2+k^2}$, so $h'=k'$ under this transformation.

The equation for the standard finite difference stencil is

$$u_{i+1, j} + u_{i-1,j} + \frac{h^2}{k^2}u_{i,j+1} + \frac{h^2}{k^2}u_{i,j-1} - \left(2+2\frac{h^2}{k^2}\right)u_{i,j} = 0$$

In order to construct our finite difference equation for the rotated stencil, we just have to look at the apply our $45^{\circ}$ transformation:

$$u_{i+1, j-1} + u_{i-1,j+1} + u_{i-1,j+1} + u_{i-1,j-1} - 4u_{i,j} = 0$$

Since $h'=k'$, these drop out and we are left with the clean looking equation above that is not dependent on the step-sizes of either axis.

#### Constructing the coefficient matrix

Suppose $D_n$ is an $(n \times n)$ matrix with the form

$$\begin{bmatrix}
0 & 1 \\
1 & \ddots & \ddots \\
& \ddots & \ddots & 1\\
& & 1 & 0
\end{bmatrix}$$

with zeros everywhere except the first sub- and super-diagonals. Then we can construct the coefficient matrix $A$ by using the Kronecker product (denoted with $\otimes$) using $D_n$ and the identity matrix $I_n$:

$$A = \left(I_{m-1} \otimes -4I_{n-1}\right) + \left(D_{m-1} \otimes D_{n-1}\right)$$

There may be a more efficient way to produce this matrix quickly, but this method seemed to work well enough for all the problems I tested it on. Using this matrix, we can construct the matrix equation $Au=b$ where $b$ contains the boundary condition information. Then we can solve for the interior nodes by Gaussian elimination $u=A \backslash b$. Here's the equation for $n=m=5$:

$$
\begin{bmatrix}
-4 & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 \\
0 & -4 & 0 & 1 & 0 & 1 & 0 & 0 & 0 \\
0 & 0 & -4 & 0 & 1 & 0 & 0 & 0 & 0 \\
0 & 1 & 0 & -4 & 0 & 0 & 0 & 1 & 0 \\
1 & 0 & 1 & 0 & -4 & 0 & 1 & 0 & 1 \\
0 & 1 & 0 & 0 & 0 & -4 & 0 & 1 & 0 \\
0 & 0 & 0 & 0 & 1 & 0 & -4 & 0 & 0 \\
0 & 0 & 0 & 1 & 0 & 1 & 0 & -4 & 0 \\
0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 & -4 \\
\end{bmatrix}
\begin{bmatrix}
u_{2,2} \\
u_{3,2} \\
u_{4,2} \\
u_{2,3} \\
u_{3,3} \\
u_{4,3} \\
u_{2,4} \\
u_{3,4} \\
u_{4,4} \\
\end{bmatrix}
=
\begin{bmatrix}
- u_{1,3} - u_{3,1} - u_{1,3} \\
- u_{2,1} - u_{4,1} \\
- u_{3,1} - u_{5,1} - u_{5,3} \\
- u_{1,2} - u_{1,4} \\
0 \\
- u_{5,2} - u_{5,4} \\
- u_{1,3} - u_{1,5} - u_{3,5} \\
- u_{2,5} - u_{4,5} \\
- u_{5,3} - u_{3,5} - u_{5,5} \\
\end{bmatrix}
$$

#### Benefits and Drawbacks

<table class="table table-bordered">
	<thead>
		<tr>
			<th>Pros</th>
			<th>Cons</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<span class="list-group-item">Incorporates more information from corner nodes, which can be useful for atypical boundary shapes or for extrapolating further information beyond the scope of the boundary <sup><a href="#fn1" id="ref1">1</a></sup>.</span>
			</td>
			<td>
				<div class="list-group">
					<span class="list-group-item">Sensitive to BCs that are discontinuous on their domain (ex., suppose the BC has a discontinuity at $(0,0)$, then the rotated stencil will try to incorporate this information whereas the standard stencil can gloss over it).</span>
					<span class="list-group-item">Despite havivng the same order of accuracy as the standard stencil, $O(h^2)$, the rotated stencil gives slightly less accurate results because nodes are spaced farther apart and therefore have less information about their neighbors $\left(\sqrt{h^2+k^2}\right)$ versus just simply $h$ or $k$) <sup><a href="#fn1" id="ref1">1</a></sup>.</span>
				</div>
			</td>
		</tr>
	</tbody>
</table>

---
<sup id="fn1">1. Krishnamurti, T.N., et al. “An Introduction to Finite Differencing.” _An Introduction to Global Spectral Modeling_, 2nd ed., vol. 35, Springer, 2006, pp. 4–39. Atmospheric and Oceanographic Sciences Library.<a href="#ref1">↩</a></sup>
