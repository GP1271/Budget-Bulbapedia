document.addEventListener("DOMContentLoaded", () => {
  const pokedex = document.getElementById("pokedex");
  const genList = document.getElementById("gen-list");
  const searchInput = document.getElementById("search");

  function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  async function fetchPokemonVariant(species, variant) {
  try {
    // Fetch Pokémon data
    const res = await fetch(variant.pokemon.url);
    const pokemon = await res.json();

    // Fetch its species data (important for display)
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();
    pokemon.species = speciesData;

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

    pokemon.displayName = displayName;
    return pokemon;
  } catch (err) {
    console.warn('Variant fetch error:', variant.pokemon.name, err);
    return null;
  }
}

  function displayPokemon(pokemon) {
    const card = document.createElement("div");
    card.classList.add("card");

    const genus =
      pokemon.species?.genera?.find((g) => g.language.name === "en")?.genus ||
      "Pokémon";

    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h3>${pokemon.displayName || capitalize(pokemon.name)}</h3>
      <p class="title">${genus}</p>
      <p>ID: ${pokemon.id}</p>
      <p>Type: ${pokemon.types.map((t) => capitalize(t.type.name)).join(", ")}</p>
    `;
    pokedex.appendChild(card);
  }

  async function loadGeneration(genId) {
    pokedex.innerHTML = "<p>Loading Pokédex...</p>";

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}/`);
      const data = await res.json();

      // Fetch each species to get national dex number + varieties
      const speciesWithData = await Promise.all(
        data.pokemon_species.map(async (species) => {
          const sRes = await fetch(species.url);
          const sData = await sRes.json();
          const nationalDex =
            sData.pokedex_numbers?.find(
              (p) => p.pokedex.name === "national"
            )?.entry_number || 99999;

          return {
            name: sData.name,
            dex: nationalDex,
            varieties: sData.varieties,
            speciesData: sData,
          };
        })
      );

      // Sort species properly
      speciesWithData.sort((a, b) => a.dex - b.dex);

      pokedex.innerHTML = "";

      // Fetch all forms
      for (const species of speciesWithData) {
        for (const variant of species.varieties) {
          const pokemon = await fetchPokemonVariant(species, variant);
          if (pokemon) {
            pokemon.species = species.speciesData;
            displayPokemon(pokemon);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load generation:", err);
      pokedex.innerHTML = "<p>Failed to load Pokédex. Try again.</p>";
    }
  }

  // Sidebar generation switching
  genList.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      document
        .querySelectorAll("#gen-list li")
        .forEach((li) => li.classList.remove("active"));
      e.target.classList.add("active");

      const genId = parseInt(e.target.getAttribute("data-gen"));
      loadGeneration(genId);
    }
  });

  // Search bar
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll(".card").forEach((card) => {
      const name = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = name.includes(term) ? "block" : "none";
    });
  });

  // Default to Gen 1
  loadGeneration(1);
});
