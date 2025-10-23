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
      <h3>${pokemon.displayName || `${capitalize(pokemon.species.name)} ${variantName}`}</h3>
      <p class="title">${title}</p>
      <p>ID: ${pokemon.id}</p>
      <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
    `;
    pokedex.appendChild(card);
  }

  async function loadGeneration(genId) {
  pokedex.innerHTML = 'Loading...';

  const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}/`);
  const data = await res.json();

  // 1️⃣ Fetch all species info in parallel
  const speciesWithDex = await Promise.all(
    data.pokemon_species.map(async (species) => {
      const res = await fetch(species.url);
      const speciesData = await res.json();

      // Get National Dex number
      const nationalDex = speciesData.pokedex_numbers.find(
        (p) => p.pokedex.name === 'national'
      )?.entry_number || 99999;

      return {
        name: species.name,
        dex: nationalDex,
        varieties: speciesData.varieties, // important: holds regional forms
      };
    })
  );

  // 2️⃣ Sort by National Dex number
  speciesWithDex.sort((a, b) => a.dex - b.dex);

  pokedex.innerHTML = '';

  // 3️⃣ Prepare all variant fetches
  const allVariantPromises = [];
  for (const species of speciesWithDex) {
    for (const variant of species.varieties) {
      allVariantPromises.push(fetchPokemonVariant(species, variant));
    }
  }

  // 4️⃣ Fetch and display all variants in order
  const allPokemon = await Promise.all(allVariantPromises);
  allPokemon
    .filter(Boolean)
    .forEach((pokemon) => displayPokemon(pokemon));
}

  async function fetchPokemonVariant(species, variant) {
  try {
    const res = await fetch(variant.pokemon.url);
    const pokemon = await res.json();

    // Detect regional form from name
    let displayName = capitalize(species.name);
    if (variant.pokemon.name.includes('-')) {
      const formName = variant.pokemon.name.split('-')[1];
      const regionNames = {
        alola: 'Alolan',
        galar: 'Galarian',
        hisui: 'Hisuian',
        paldea: 'Paldean',
      };
      const region = regionNames[formName] || capitalize(formName);
      displayName += ` (${region})`;
    }

    // Attach display name
    pokemon.displayName = displayName;
    return pokemon;
  } catch (err) {
    console.warn('Variant fetch error:', variant.pokemon.name, err);
    return null;
  }
}

  genList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      document.querySelectorAll('#gen-list li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');

      const genId = parseInt(e.target.getAttribute('data-gen'));
      loadGeneration(genId);
    }
  });

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = name.includes(term) ? 'block' : 'none';
    });
  });

  loadGeneration(1);
});
