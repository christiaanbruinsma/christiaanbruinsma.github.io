(() => {
  'use strict';

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const revealElements = [...document.querySelectorAll('.reveal')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const username = 'christiaanbruinsma';
  const status = document.querySelector('#projects-status');
  const cards = [...document.querySelectorAll('[data-repository]')];

  if (!cards.length || !status) return;

  const repoNames = new Set(cards.map((card) => card.dataset.repository));
  const apiUrl = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  fetch(apiUrl, {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then((response) => {
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      return response.json();
    })
    .then((repositories) => {
      const repositoryMap = new Map(
        repositories
          .filter((repo) => repo && repoNames.has(repo.name) && !repo.fork && !repo.archived)
          .map((repo) => [repo.name, repo])
      );

      cards.forEach((card) => {
        const repo = repositoryMap.get(card.dataset.repository);
        if (!repo) return;

        const links = card.querySelectorAll('a');
        links.forEach((link) => { link.href = repo.html_url; });

        const description = card.querySelector('.project-copy p');
        if (description && repo.description) description.textContent = repo.description;
      });

      status.textContent = 'Repository links and descriptions refreshed from GitHub.';
    })
    .catch(() => {
      status.textContent = 'Showing the curated local project selection.';
    });
})();
