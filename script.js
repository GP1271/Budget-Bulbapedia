const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');
const genList = document.getElementById('gen-list');

// Capitalize function
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Fetch Pokémon + species (for title and variants)
async function fetchPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  return { ...data, species: speciesData };
}

// Display each Pokémon card
function displayPokemon(pokemon) {
  const card = document.createElement('div');
  card.classList.add('card');

  const title = pokemon.species.genera.find(g => g.language.name === "en")?.genus || "Pokémon";

  // Check for regional variant
  const variantName = pokemon.name.includes('-')
    ? `(${pokemon.name.split('-')[1].replace(/^\w/, c => c.toUpperCase())} Form)`
    : "";

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${capitalize(pokemon.species.name)} ${variantName}</h3>
    <p class="title">${title}</p>
    <p>ID: ${pokemon.id}</p>
    <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
  `;
  pokedex.appendChild(card);
}

// Load Pokémon in a range (with optional offset)
async function loadPokedex(limit, offset) {
  pokedex.innerHTML = '';
  for (let i = offset + 1; i <= offset + limit; i++) {
    try {
      const pokemon = await fetchPokemon(i);
      displayPokemon(pokemon);
    } catch (err) {
      console.warn("Error loading Pokémon", i, err);
    }
  }
}

// Sidebar click event — load specific generation
genList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    const limit = parseInt(e.target.getAttribute('data-limit'));
    const offset = parseInt(e.target.getAttribute('data-offset'));
    loadPokedex(limit, offset);
  }
});

// Search function
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    card.style.display = name.includes(term) ? 'block' : 'none';
  });
});

// Default: load Gen 1
loadPokedex(151, 0);
