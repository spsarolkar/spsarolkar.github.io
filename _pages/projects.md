---
layout: page
title: Projects
permalink: /projects/
description: Applied machine learning, data systems, and developer tools — with project notes, source code, and demos.
nav: true
nav_order: 2
display_categories: [work, fun]
horizontal: false
---

<div class="portfolio-projects">
  {% if site.enable_project_categories and page.display_categories %}
    {% for category in page.display_categories %}
      {% assign categorized_projects = site.projects | where: "category", category %}
      {% assign sorted_projects = categorized_projects | sort: "importance" %}
      {% if sorted_projects.size > 0 %}
        <section class="project-section" id="{{ category | slugify }}" aria-labelledby="projects-{{ category | slugify }}">
          <h2 id="projects-{{ category | slugify }}">
            {% case category %}
              {% when 'work' %}Applied work
              {% when 'fun' %}Independent projects
              {% else %}{{ category | escape }}
            {% endcase %}
          </h2>
          <div class="project-grid">
            {% for project in sorted_projects %}
              {% include projects.liquid %}
            {% endfor %}
          </div>
        </section>
      {% endif %}
    {% endfor %}
  {% else %}
    {% assign sorted_projects = site.projects | sort: "importance" %}
    <div class="project-grid">
      {% for project in sorted_projects %}
        {% include projects.liquid %}
      {% endfor %}
    </div>
  {% endif %}
</div>
