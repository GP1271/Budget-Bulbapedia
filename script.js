const pokedex = document.getElementById('pokedex');
const searchInput = document.getElementById('search');

async function fetchPokemon(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  const res = await fetch(url);
  return res.json();
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
  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h3>${pokemon.name}</h3>
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
