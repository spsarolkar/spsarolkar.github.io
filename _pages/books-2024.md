---
layout: page
title: Reading in 2024
permalink: /books/2024/
---
<ul>{% for book in site.books %}{% assign started_year = book.started | date: '%Y' %}{% if started_year == '2024' %}<li><a href="{{ book.url | relative_url }}">{{ book.title }}</a></li>{% endif %}{% endfor %}</ul>
<p><a href="{{ '/books/' | relative_url }}">All reading →</a></p>
