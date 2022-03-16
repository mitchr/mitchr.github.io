---
layout: landing
title: Mitchell Riley's Blog
permalink: /
description: A blog about programming and numerical analysis
---

<div class="list-group list-group-flush">
	{% for post in site.posts %}
		<div class="list-group-item list-group-item-action hasHover">
			<a class="noHover" href="{{post.url}}">{{post.title}}</a>
			<span class="d-block" style="color: LightSlateGray">{{post.date | date: "%B %-d, %Y"}}</span>
		</div>
	{% endfor %}
</div>
