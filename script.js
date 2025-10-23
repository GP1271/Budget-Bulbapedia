document.addEventListener('DOMContentLoaded', () => {
  const pokedex = document.getElementById('pokedex');
  const genList = document.getElementById('gen-list');
  const searchInput = document.getElementById('search');

  function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  async function fetchPokemonBySpecies(name) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    return { ...data, species: speciesData };
  }

  function displayPokemon(pokemon) {
    const card = document.createElement('div');
    card.classList.add('card');

    const title = pokemon.species.genera.find(g => g.language.name === 'en')?.genus || 'Pokémon';

    const variantName = pokemon.name.includes('-')
      ? `(${pokemon.name.split('-')[1].replace(/^\w/, c => c.toUpperCase())} Form)`
      : '';

    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h3>${capitalize(pokemon.species.name)} ${variantName}</h3>
      <p class="title">${title}</p>
      <p>ID: ${pokemon.id}</p>
      <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
    `;
    pokedex.appendChild(card);
  }

  async function loadGeneration(genId) {
    pokedex.innerHTML = '';
    const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}/`);
    const data = await res.json();

    // data.pokemon_species is an array of species names
    for (const species of data.pokemon_species) {
      try {
        const pokemon = await fetchPokemonBySpecies(species.name);
        displayPokemon(pokemon);
      } catch (err) {
        console.warn('Error loading', species.name, err);
      }
    }
  }

  // Sidebar click
  genList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      document.querySelectorAll('#gen-list li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');

      const genId = parseInt(e.target.getAttribute('data-gen'));
      loadGeneration(genId);
    }
  });

  // Search filter
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = name.includes(term) ? 'block' : 'none';
    });
  });

  // Default: load Gen 1
  loadGeneration(1);
});
