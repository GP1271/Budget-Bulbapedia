const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function fetchPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  const data = await res.json();

  // Fetch species info (for title/flavor)
  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  return { ...data, species: speciesData };
}

async function loadPokedex(limit = 151) {
  pokedex.innerHTML = '';
  for (let i = 1; i <= limit; i++) {
    const pokemon = await fetchPokemon(i);
    displayPokemon(pokemon);
  }
}

function displayPokemon(pokemon) {
  const card = document.createElement('div');
  card.classList.add('card');

  const title = pokemon.species.genera.find(
    g => g.language.name === "en"
  ).genus; // Example: "Mouse Pokémon"

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${capitalize(pokemon.name)}</h3>
    <p class="title">${title}</p>
    <p>ID: ${pokemon.id}</p>
    <p>Type: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
  `;
  pokedex.appendChild(card);
}

searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    card.style.display = name.includes(term) ? 'block' : 'none';
  });
});

loadPokedex();
