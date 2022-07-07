---
layout: landing
title: Mitchell Riley's Blog
permalink: /
description: A blog about programming and numerical analysis
---

<div class="list-group list-group-flush">
	{% for post in site.posts %}
		<a class="list-group-item list-group-item-action" href="{{post.url}}">
			{{post.title}}
			<span id="date">{{post.date | date: "%B %-d, %Y"}}</span>
		</a>
	{% endfor %}
</div>
