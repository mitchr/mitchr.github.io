'use strict';

const template = document.createElement('template');

template.innerHTML = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
<link rel="stylesheet" href="../style/overall.css">

<nav class="navbar navbar-expand w-100 mb-2" style="background-color: darkslategray;">
<div class="container">
	<a class="navbar-brand text-white">Mitchell Riley</a>
	<ul class="navbar-nav">
		<li class="nav-item"><a href="./index.html" class="btn btn-outline-secondary text-white d-block">Posts</a></li>
		<li class="nav-item ms-2"><a href="./about.html" class="btn btn-outline-secondary text-white d-block">About</a></li>
	</ul>
</div>
</nav>`;

class SiteNavigator extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).appendChild(template.content);
	}

	connectedCallback() {
		let isPost = this.getAttribute("ispost");
		if (isPost === "true") {
			let links = this.shadowRoot.querySelectorAll(".btn")
			links.forEach(element => {
				let url = new URL(element.href);
				let newHref = "../" + url.pathname.split("/").pop();
				element.href = newHref;
			});
		}
	}
}

customElements.define("site-navigator", SiteNavigator)
