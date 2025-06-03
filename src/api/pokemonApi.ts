import axios from 'axios';

interface PokemonStats {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStats[];
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
  };
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
}

export async function getPokemonInfo(pokemonName: string): Promise<Pokemon> {
  try {
    const response = await axios.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Pokemon "${pokemonName}" no encontrado`);
      }
      throw new Error('Error al obtener la información del Pokemon');
    }
    throw error;
  }
} 