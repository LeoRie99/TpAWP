const characterCardsContainer = document.querySelector('.character-cards');
const modal = document.getElementById('modal');
const API = 'https://rickandmortyapi.com/api/character';

// Función para obtener los datos de la API
async function getCharacters(callback) {
  try {
    let localData = localStorage.getItem('charactersData');
    
    if (localData) {
      // Si los datos están en localStorage, devolverlos desde allí
      return JSON.parse(localData);
    }

    const response = await fetch(`${API}`);
    const data = await response.json();
    
    // Almacenar los datos obtenidos en localStorage
    localStorage.setItem('charactersData', JSON.stringify(data.results));

    if (typeof callback === 'function') {
      callback(data.results);
    }

    return data.results;
  } catch (error) {
    console.error('Error al obtener los personajes:', error);
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = 'Hubo un error al obtener los personajes. Por favor, inténtalo nuevamente.';
    throw error;
  }
}

// Función para cargar los datos desde localStorage al cargar la página
function loadCharactersFromLocalStorage() {
  const localData = JSON.localStorage.getItem('charactersData');
  if (localData) {
    const characters = JSON.parse(localData);
    generateCharacterCards(characters);
  }
}
// Función para generar las tarjetas de los personajes
function generateCharacterCards(characters, isFavoriteList = false) {
  characterCardsContainer.innerHTML = '';

  characters.forEach(character => {
    const card = document.createElement('div');
    card.classList.add('character-card');
    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}">
      <h2>${character.name}</h2>
      <button data-id="${character.id}">Ver detalles</button>
      ${isFavoriteList ? `<button class="remove-favorite-button" data-id="${character.id}">Eliminar de favoritos</button>` : ''}
    `;

    card.querySelector('button').addEventListener('click', () => {
      showCharacterDetails(character);
    });

    if (isFavoriteList) {
      const removeFavoriteButton = card.querySelector('.remove-favorite-button');
      removeFavoriteButton.addEventListener('click', () => {
        eliminarDeFavoritos(character);
        generateCharacterCards(favoritos, true); // Actualiza la lista de favoritos en la página
      });
    }

    characterCardsContainer.appendChild(card);
  });
}

let favoritos = []

function agregarAFavoritos(character) {
  const existe = favoritos.some((favCharacter) => favCharacter.id === character.id);
  if (!existe) {
    favoritos.push(character);
    console.log(`Personaje ${character.name} agregado a favoritos.`);
  } else {
    console.log(`Personaje ${character.name} ya está en favoritos.`);
  }
}

// Función para mostrar los detalles del personaje en el modal
async function showCharacterDetails(character, callback) {
  modal.innerHTML = `
    <div class="loader">
      <span class="loader-text">Cargando...</span>
    </div>
  `;
  modal.classList.add('open');

  // Simular un retraso de 5 segundos
  await new Promise(resolve => setTimeout(resolve, 5000));

  modal.innerHTML = `
    <h2>${character.name}</h2>
    <img src="${character.image}" alt="${character.name}">
    <p>Especie: ${character.species}</p>
    <p>Status: ${character.status}</p>
    ${character.type ? `<p>Tipo: ${character.type}</p>` : ''}
    <p>Ubicación: ${character.location.name}</p>
    <div class="modal-buttons">
      <button class="close-button">Cerrar</button>
      <button class="favorite-button">Agregar a favoritos</button>
    </div>
  `;

  const closeButton = modal.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  const favoriteButton = modal.querySelector('.favorite-button');
  favoriteButton.addEventListener('click', () => {
    agregarAFavoritos(character);
    if (typeof callback === 'function') {
      callback(character);
    }
  });
}
// Obtener los personajes y generar las tarjetas al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const characters = await getCharacters();
    generateCharacterCards(characters);
  } catch (error) {
    console.error(error);
  }
});

// Funcionalidad para cerrar el modal
modal.addEventListener('click', (event) => {
  if (event.target === modal || event.target.classList.contains('close')) {
    modal.classList.remove('open');
  }
});

// Event listener para el enlace de "Favoritos"
// Event listener para el enlace de "Favoritos"
const favoritosLink = document.getElementById('favoritos-link');
const backButton = document.getElementById('back-to-list-button');

favoritosLink.addEventListener('click', () => {
  characterCardsContainer.innerHTML = '';
  generateCharacterCards(favoritos, true);

  // Ocultar el enlace "Favoritos" y mostrar el botón "Volver al listado"
  favoritosLink.style.display = 'none';
  backButton.style.display = 'block';
});

backButton.addEventListener('click', () => {
  // Mostrar el enlace "Favoritos" y ocultar el botón "Volver al listado"
  favoritosLink.style.display = 'block';
  backButton.style.display = 'none';

  // Obtener y mostrar todos los personajes nuevamente
  getAndShowAllCharacters();
});

// Función para obtener y mostrar todos los personajes
async function getAndShowAllCharacters() {
  try {
    const characters = await getCharacters();
    generateCharacterCards(characters);
  } catch (error) {
    console.error(error);
  }
}

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', () => {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.trim(); 
  searchCharacters(searchTerm); 
});

const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.trim();
  searchCharacters(searchTerm);
});

async function searchCharacters(searchTerm) {
  try {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = ''; // Limpiar el mensaje de error

    if (searchTerm === '') {
      const characters = await getCharacters();
      generateCharacterCards(characters);
    } else {
      const characters = await getCharacters(); // Obtener todos los personajes
      const filteredCharacters = characters.filter((character) =>
        character.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredCharacters.length === 0) {
        errorMessage.textContent = 'No se encontraron personajes con ese nombre.';
        characterCardsContainer.innerHTML = ''; // Limpiar las tarjetas si no se encuentran resultados
      } else {
        generateCharacterCards(filteredCharacters);
      }
    }
  } catch (error) {
    console.error('Error al buscar personajes:', error);
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = 'Hubo un error al buscar personajes. Por favor, inténtalo nuevamente.';
  }
}

function eliminarDeFavoritos(character) {
  const index = favoritos.findIndex((favCharacter) => favCharacter.id === character.id);
  if (index !== -1) {
    favoritos.splice(index, 1);
    console.log(`Personaje ${character.name} eliminado de favoritos.`);
  } else {
    console.log(`Personaje ${character.name} no se encuentra en favoritos.`);
  }
}