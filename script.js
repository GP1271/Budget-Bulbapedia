genList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    // Highlight the clicked generation
    document.querySelectorAll('#gen-list li').forEach(li => li.classList.remove('active'));
    e.target.classList.add('active');

    // Get generation number from the HTML attribute
    const genId = parseInt(e.target.getAttribute('data-gen'));

    // Load that generation
    loadGeneration(genId);
  }
});
