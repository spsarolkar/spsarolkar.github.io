---
layout: default
permalink: /blog/
title: Writing
description: Notes on data systems, machine learning, and software engineering.
nav: true
nav_order: 3
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="post writing-index">
  <header class="writing-header">
    <p class="eyebrow">Notes &amp; articles</p>
    <h1>{{ page.title }}</h1>
    <p>{{ page.description }}</p>
  </header>

  {% if site.display_tags and site.display_tags.size > 0 or site.display_categories and site.display_categories.size > 0 %}
    <nav class="writing-filters" aria-label="Writing topics">
      <ul>
        {% for tag in site.display_tags %}
          <li><a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">{{ tag | escape }}</a></li>
        {% endfor %}
        {% for category in site.display_categories %}
          <li><a href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">{{ category | escape }}</a></li>
        {% endfor %}
      </ul>
    </nav>
  {% endif %}

  {% if page.pagination.enabled %}
    {% assign postlist = paginator.posts %}
  {% else %}
    {% assign postlist = site.posts %}
  {% endif %}

  <ul class="writing-list">
    {% for post in postlist %}
      {% if post.external_source == blank %}
        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% else %}
        {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
      {% endif %}
      {% assign year = post.date | date: "%Y" %}
      <li class="writing-row">
        <article class="writing-body">
          <p class="writing-meta">
            <a href="{{ year | prepend: '/blog/' | relative_url }}"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%B %-d, %Y' }}</time></a>
            <span aria-hidden="true">&middot;</span> {{ read_time }} min read
            {% if post.external_source %}
              <span aria-hidden="true">&middot;</span> {{ post.external_source | escape }}
            {% endif %}
          </p>
          <h2 class="writing-title">
            {% if post.redirect == blank %}
              <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
            {% elsif post.redirect contains '://' %}
              <a href="{{ post.redirect }}" target="_blank" rel="noopener noreferrer">{{ post.title | escape }}</a>
            {% else %}
              <a href="{{ post.redirect | relative_url }}">{{ post.title | escape }}</a>
            {% endif %}
          </h2>
          <p class="writing-summary">
            {% if post.description %}
              {{ post.description | escape }}
            {% else %}
              {{ post.excerpt | markdownify | strip_html | normalize_whitespace | truncatewords: 36 | escape }}
            {% endif %}
          </p>
          {% if post.tags.size > 0 or post.categories.size > 0 %}
            <ul class="writing-taxonomies" aria-label="Topics">
              {% for tag in post.tags %}
                <li><a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">#{{ tag | escape }}</a></li>
              {% endfor %}
              {% for category in post.categories %}
                <li><a href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">{{ category | escape }}</a></li>
              {% endfor %}
            </ul>
          {% endif %}
        </article>
        {% if post.thumbnail %}
          <div class="writing-thumbnail">
            <img src="{{ post.thumbnail | relative_url }}" alt="" loading="lazy">
          </div>
        {% endif %}
      </li>
    {% endfor %}
  </ul>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}
</div>
