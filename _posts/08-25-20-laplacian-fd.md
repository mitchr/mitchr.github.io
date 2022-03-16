---
layout: post
title: "A Terrible Way to Build Coefficient Matrices for Laplacian Finite Differences"
date: 2020-08-25
description: >-
 An inelegant way to construct the laplacian finite different matrix on a rectangular grid.

katex: true
---

Suppose we have an $n \times m$ grid. The coefficient matrix for the rotated 5-point stencil is $$A = I_{m-1} \otimes (-4I_{n-1}) + D_{m-1} \otimes D_{n-1}$$ where $D_n$ is an $n \times n$ matrix with $1$s on the sub and super diagonals and $0$s everywhere else.

Normally if we have an evenly spaced grid such that $h=k$, the coefficient matrix for the standard 5-point stencil is $$A=S \otimes I_{n-1} + I_{n-1} \otimes S$$ where $S$ is an $(n-1) \times (n-1)$ toeplitz matrix with $-2$s on the main diagonal, and $1$s on the sub and super diagonals:

$$
S = \begin{pmatrix}
-2 & 1 & 0 & 0 & \cdots & 0 & 0\\
1 & -2 & 1 & 0 & \cdots & 0 & 0 \\
0 & 1 & -2 & 1 & \cdots & 0 & 0 \\
\vdots & \ddots & \ddots & \ddots & \ddots & \ddots & \vdots \\
0 & 0 & 0 & 1 & -2 & 1 & 0 \\
0 & 0 & 0 & 0 & 1 & -2 & 1 \\
0 & 0 & 0 & 0 & 0 & 1 & -2 \\
\end{pmatrix}
$$

If however $h \neq k$, the above method won't work because it will have the wrong dimensions and incorrect sparsity. To use an unequal grid spacing we can construct it like 

$$A= I_{m-1} \otimes M + D_{m-1} \otimes (\lambda I_{n-1})$$

where $\lambda = \left(\frac{h}{k} \right)^2$ and $M$ is an $(m-1) \times (m-1)$ matrix with $-(2+2\lambda)$ on the main diagonal, and $1$s on the sub and super diagonals.

$$
M = \begin{pmatrix}
-(2+2\lambda) & 1 & 0 & 0 & \cdots & 0 & 0\\
1 & -(2+2\lambda) & 1 & 0 & \cdots & 0 & 0 \\
0 & 1 & -(2+2\lambda) & 1 & \cdots & 0 & 0 \\
\vdots & \ddots & \ddots & \ddots & \ddots & \ddots & \vdots \\
0 & 0 & 0 & 1 & -(2+2\lambda) & 1 & 0 \\
0 & 0 & 0 & 0 & 1 & -(2+2\lambda) & 1 \\
0 & 0 & 0 & 0 & 0 & 1 & -(2+2\lambda) \\
\end{pmatrix}
$$
