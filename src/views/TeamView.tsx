import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPokemonInfo } from '../api/pokemonApi';
import type { Pokemon } from '../api/pokemonApi';
import { lexer } from '../lexer';

interface PokemonTeam {
  team: Array<{
    name: string;
  }>;
}

export function TeamView() {
  const { editorText } = useApp();
  const [pokemonTeam, setPokemonTeam] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemonTeam = async () => {
      try {
        setLoading(true);
        setError(null);

        const { tokens, errors } = lexer(editorText);
        if (errors.length > 0) {
          setError('Hay errores léxicos en el código. Por favor, corrígelos antes de ver el equipo.');
          return;
        }

        const teamData: PokemonTeam = {
          team: []
        };

        // Paso 1: Encontrar la llave de apertura del equipo
        const startIndex = tokens.findIndex(t => t.type === 'LBRACE');
        if (startIndex === -1) {
          setError('No se encontró la estructura del equipo');
          return;
        }

        // Paso 2: Buscar los Pokémon DESPUÉS de la llave de apertura
        for (let i = startIndex + 1; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === 'STRING' && tokens[i + 1]?.type === 'LBRACKET') {
            const pokemonName = token.lexeme.replace(/"/g, '').toLowerCase();
            teamData.team.push({ name: pokemonName });
          }
        }

        console.log('Objeto teamData antes de la búsqueda:', teamData);

        if (teamData.team.length === 0) {
          setError('No se encontraron Pokémon en el equipo');
          return;
        }

        console.log('Equipo encontrado:', teamData);

        const pokemonData = await Promise.all(
          teamData.team.map(p => getPokemonInfo(p.name))
        );

        setPokemonTeam(pokemonData);
      } catch (err) {
        setError('Error al cargar el equipo de Pokémon');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonTeam();
  }, [editorText]);

  if (loading) {
    return <div className="loading">Cargando equipo...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="team-container">
      <h2 className="trainer-title">Equipo Pokémon</h2>
      <div className="team-grid">
        {pokemonTeam.map(pokemon => {
          // Seleccionar imagen
          const image = pokemon.sprites.front_shiny || pokemon.sprites.front_default;
          // PS
          const ps = pokemon.stats[0]?.base_stat;
          // Seleccionar 2 ataques aleatorios de los primeros 10 movimientos
          const moves = pokemon.moves.slice(0, 10);
          const randomMoves = moves
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(m => m.move.name);
          return (
            <div key={pokemon.id} className="pokemon-card-tcg">
              <div className="tcg-header">
                <span className="tcg-basic">BÁSICO</span>
                <span className="tcg-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                <span className="tcg-ps">PS {ps}</span>
                <span className="tcg-type">★</span>
              </div>
              <div className="tcg-image-container">
                <img src={image} alt={pokemon.name} className="tcg-image" />
              </div>
              <div className="tcg-attacks">
                {randomMoves.map((move, idx) => (
                  <div key={move} className="tcg-attack">
                    <span className="tcg-attack-cost">⚪⚪</span>
                    <span className="tcg-attack-name">{move.charAt(0).toUpperCase() + move.slice(1)}</span>
                    <span className="tcg-attack-damage">{idx === 0 ? 30 : 20}</span>
                  </div>
                ))}
              </div>
              <div className="tcg-footer">
                <span className="tcg-weakness">Debilidad: +20</span>
                <span className="tcg-retreat">Retirada: ⚪⚪</span>
              </div>
              <div className="tcg-description">
                <small>Descripción: {pokemon.name} es un Pokémon de tipo {pokemon.types.map(t => t.type.name).join(', ')}.</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}