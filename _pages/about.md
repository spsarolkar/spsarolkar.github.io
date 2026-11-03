---
layout: about
title: Sunil Sarolkar — AI & Solutions Architecture
permalink: /
description: Principal Solution Architect with 16+ years in enterprise engineering, financial services, GenAI and data platforms. Selected work, technical writing and professional experience.
---

<section class="profile-hero" aria-labelledby="profile-title">
  <div class="hero-copy">
    <p class="eyebrow">Sunil Sarolkar · Solutions Architect</p>
    <h1 id="profile-title">AI architecture for complex systems.</h1>
    <p class="hero-lead">I connect enterprise AI, data engineering and financial-services expertise to turn complex business problems into practical systems.</p>
    <p class="hero-detail">16+ years across banking, capital markets and insurance. Currently a Principal Solution Architect, Customer Facing, via Zensar Technologies.</p>
    <div class="hero-actions"><a class="button button-primary" href="{{ '/cv/' | relative_url }}">Explore my experience <span aria-hidden="true">↗</span></a><a class="text-link" href="#contact">Get in touch <span aria-hidden="true">→</span></a></div>
  </div>
  <figure class="profile-portrait"><picture><source type="image/webp" srcset="{{ '/assets/img/prof_pic-480.webp' | relative_url }} 480w, {{ '/assets/img/prof_pic-800.webp' | relative_url }} 800w" sizes="(max-width: 767px) 440px, 300px"><img src="{{ '/assets/img/prof_pic.png' | relative_url }}" alt="Sunil Sarolkar trekking in the mountains" width="1258" height="1076" fetchpriority="high"></picture><figcaption>Pune, India <span aria-hidden="true">·</span> Build. Learn. Simplify.</figcaption></figure>
</section>

<section class="home-section" aria-labelledby="focus-title">
  <div class="section-heading"><div><p class="eyebrow">Where I focus</p><h2 id="focus-title">From architecture to implementation.</h2></div><a class="text-link" href="{{ '/cv/' | relative_url }}#Core%20Competencies">Full expertise <span aria-hidden="true">→</span></a></div>
  <div class="focus-grid">
    <section><span class="section-number" aria-hidden="true">01</span><h3>Applied AI</h3><p>Agentic workflows, retrieval and search, model evaluation, and the engineering that connects them to enterprise data.</p></section>
    <section><span class="section-number" aria-hidden="true">02</span><h3>Enterprise systems</h3><p>Distributed platforms, event-driven integration and phased modernisation, built around real operational constraints.</p></section>
    <section><span class="section-number" aria-hidden="true">03</span><h3>Financial services</h3><p>Capital markets, regulatory reporting, cashflow and insurance, with a focus on traceable decisions and reliable data.</p></section>
  </div>
</section>

<section class="home-section" aria-labelledby="selected-title">
  <div class="section-heading"><div><p class="eyebrow">Selected public work</p><h2 id="selected-title">Ideas made tangible.</h2></div><a class="text-link" href="{{ '/projects/' | relative_url }}">All projects <span aria-hidden="true">→</span></a></div>
  <div class="selected-work-grid">
    <article><p class="project-category">Machine learning / Data</p><h3><a href="{{ '/projects/1_project/' | relative_url }}">StructFormer</a></h3><p>A Transformer-based experiment in generating corrective SQL from structured validation errors.</p><a class="text-link" href="{{ '/projects/1_project/' | relative_url }}">Explore the project <span aria-hidden="true">→</span></a></article>
    <article><p class="project-category">Computer vision / Accessibility</p><h3><a href="{{ '/projects/2_project/' | relative_url }}">Indian Sign Language</a></h3><p>Pose estimation and sequence modelling explored through the IISc capstone and its web demo.</p><a class="text-link" href="{{ '/projects/2_project/' | relative_url }}">Explore the project <span aria-hidden="true">→</span></a></article>
    <article><p class="project-category">Learning / Web application</p><h3><a href="{{ '/projects/6_project/' | relative_url }}">ML Engineer practice app</a></h3><p>A static practice application with timed sessions, topic selection and answer review.</p><a class="text-link" href="{{ '/projects/6_project/' | relative_url }}">Explore the project <span aria-hidden="true">→</span></a></article>
  </div>
</section>

<section class="home-section" aria-labelledby="writing-title">
  <div class="section-heading"><div><p class="eyebrow">From the notebook</p><h2 id="writing-title">Writing about the work.</h2></div><a class="text-link" href="{{ '/blog/' | relative_url }}">All articles <span aria-hidden="true">→</span></a></div>
  <ul class="recent-writing">{% for post in site.posts limit:3 %}<li><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%b %Y' }}</time><h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3><span aria-hidden="true">↗</span></li>{% endfor %}</ul>
</section>

<section class="home-section" aria-labelledby="learning-title">
  <div class="section-heading"><div><p class="eyebrow">Continuous learning</p><h2 id="learning-title">Credentials with a record.</h2></div><a class="text-link" href="{{ '/cv/' | relative_url }}#Certifications%20%26%20Badges">All learning & badges <span aria-hidden="true">→</span></a></div>
  {% include certifications.liquid %}
  <p class="learning-note">PG Certification in Computational Data Science, IISc Bangalore · Google Cloud certifications · Professional development at Deutsche Bank.</p>
</section>

<section class="home-section contact-section" id="contact" aria-labelledby="contact-title"><p class="eyebrow">Let’s connect</p><h2 id="contact-title">A conversation starts with a problem.</h2><p>For architecture discussions, professional opportunities or a shared engineering interest.</p><div class="hero-actions"><a class="button button-primary" href="mailto:sunil.sarolkar@gmail.com">Email Sunil <span aria-hidden="true">↗</span></a><a class="text-link" href="https://www.linkedin.com/in/sunil-sarolkar-451b2023/">Connect on LinkedIn ↗</a></div><p class="personal-note">Beyond work: trekking, reading, swimming and astrophysics. More experiments live in my <a href="https://sunilsarolkar.in/">personal lab ↗</a>.</p></section>
