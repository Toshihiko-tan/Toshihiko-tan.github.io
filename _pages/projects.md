---
layout: page
title: Projects
permalink: /projects/
description: Selected projects with summaries and links.
nav: true
nav_order: 3
---

<div class="projects">
  {% assign sorted_projects = site.projects | sort: "year" | reverse %}

{% for project in sorted_projects %}

<div class="pub-list-item">
{% if project.thumbnail %}
<div class="pub-thumbnail">
<img src="{{ project.thumbnail | relative_url }}" alt="thumbnail for {{ project.title }}">
</div>
{% endif %}

      <div class="pub-details">
        <h3 class="pub-title">
          {{ project.title }}
        </h3>

        <p class="pub-authors">
          {{ project.authors }}
        </p>

        <p class="pub-venue">
          {{ project.venue }}, {{ project.year }}
        </p>

        {% if project.summary %}
          <p class="pub-summary">
            {{ project.summary }}
          </p>
        {% endif %}

        {% if project.link %}
          <p>
            <a href="{{ project.link }}" target="_blank" class="btn btn-sm btn-outline-primary">
              View Project
            </a>
          </p>
        {% endif %}
      </div>
    </div>
    <hr>

{% endfor %}

</div>
