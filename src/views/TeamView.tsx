import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getPokemonInfo } from '../api/pokemonApi';
import type { Pokemon } from '../api/pokemonApi';
import { analyzeCode } from '../api/lexerApi';
import './TeamView.css';

interface PokemonTeam {
  team: Array<{
    name: string;
    type: string;
    stats: {
      salud: number;
      ataque: number;
      defensa: number;
    };
  }>;
}

interface PokemonWithIVs extends Pokemon {
  ivs: number;
  analyzerType: string;
}

export function TeamView() {
  const { editorText, analyzed, errors } = useApp();
  const [pokemonTeam, setPokemonTeam] = useState<PokemonWithIVs[]>([]);
  const [allPokemon, setAllPokemon] = useState<PokemonWithIVs[]>([]);
  const [showAllCards, setShowAllCards] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateIVs = (salud: number, ataque: number, defensa: number): number => {
    return ((salud + ataque + defensa) / 45) * 100;
  };

  const selectBestTeam = (pokemon: PokemonWithIVs[]): PokemonWithIVs[] => {
    const sortedByIVs = [...pokemon].sort((a, b) => b.ivs - a.ivs);
    
    const selected: PokemonWithIVs[] = [];
    const usedTypes = new Set<string>();

    for (const poke of sortedByIVs) {
      if (selected.length >= 6) break;
      if (!usedTypes.has(poke.analyzerType)) {
        selected.push(poke);
        usedTypes.add(poke.analyzerType);
      }
    }

    if (selected.length < 6) {
      for (const poke of sortedByIVs) {
        if (selected.length >= 6) break;
        if (!selected.includes(poke) && !usedTypes.has(poke.analyzerType)) {
          selected.push(poke);
          usedTypes.add(poke.analyzerType);
        }
      }
    }

    return selected;
  };

  useEffect(() => {
    const fetchPokemonTeam = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!analyzed) {
          setError('Por favor, analiza el código primero usando el botón "Analizar"');
          return;
        }

        if (errors.length > 0) {
          setError('Hay errores léxicos en el código. Por favor, corrígelos antes de ver el equipo.');
          return;
        }

        const { tokens } = await analyzeCode(editorText);
        console.log(tokens);
        const teamData: PokemonTeam = {
          team: []
        };

        const startIndex = tokens.findIndex(t => t.type === 'LBRACE');
        if (startIndex === -1) {
          setError('No se encontró la estructura del equipo');
          return;
        }

        let currentPokemon: { name: string; type: string; stats: { salud: number; ataque: number; defensa: number } } | null = null;
        let currentStat: 'salud' | 'ataque' | 'defensa' | null = null;

        for (let i = startIndex + 1; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === 'NEWLINE' || token.type === 'WHITESPACE') continue;
          if (token.type === 'STRING' && tokens[i + 1]?.type === 'LBRACKET' && tokens[i + 2]?.type === 'IDENTIFIER') {
            if (currentPokemon) {
              teamData.team.push(currentPokemon);
            }
            currentPokemon = {
              name: token.lexeme.replace(/"/g, '').toLowerCase(),
              type: tokens[i + 2].lexeme.toLowerCase(),
              stats: { salud: 0, ataque: 0, defensa: 0 }
            };
          } else if (token.type === 'IDENTIFIER' && ['salud', 'ataque', 'defensa'].includes(token.lexeme)) {
            currentStat = token.lexeme as 'salud' | 'ataque' | 'defensa';
          } else if (token.type === 'NUMBER' && currentStat && currentPokemon) {
            currentPokemon.stats[currentStat] = parseInt(token.lexeme);
            currentStat = null;
          }
        }

        if (currentPokemon) {
          teamData.team.push(currentPokemon);
        }

        if (teamData.team.length === 0) {
          setError('No se encontraron Pokémon en el equipo');
          return;
        }

        const notFound: string[] = [];
        const pokemonData = await Promise.all(
          teamData.team.map(async p => {
            try {
              const pokemon = await getPokemonInfo(p.name);
              const ivs = calculateIVs(p.stats.salud, p.stats.ataque, p.stats.defensa);
              return {
                ...pokemon,
                ivs,
                analyzerType: p.type
              };
            } catch {
              notFound.push(p.name);
              return null;
            }
          })
        );

        if (notFound.length > 0) {
          alert(`No se encontró en la API: ${notFound.join(', ')}`);
        }

        const filteredPokemonData = pokemonData.filter(Boolean) as PokemonWithIVs[];

        setAllPokemon(filteredPokemonData);

        const bestTeam = selectBestTeam(filteredPokemonData);
        setPokemonTeam(bestTeam);
      } catch (err) {
        setError('Error al cargar el equipo de Pokémon');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonTeam();
  }, [editorText, analyzed, errors]);

  if (loading) {
    return <div className="loading">Cargando equipo...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="team-container">
      <div className="team-header">
        <h2 className="trainer-title">Equipo Pokémon</h2>
        <div className="show-all-toggle">
          <label>
            <input
              type="checkbox"
              checked={showAllCards}
              onChange={(e) => setShowAllCards(e.target.checked)}
            />
            Mostrar todos los Pokémon
          </label>
        </div>
      </div>
      <div className="team-grid">
        {(showAllCards ? allPokemon : pokemonTeam).map(pokemon => {
          const image = pokemon.sprites.front_shiny || pokemon.sprites.front_default;
          const ps = pokemon.stats[0]?.base_stat;
          const moves = pokemon.moves.slice(0, 10);
          const randomMoves = moves
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .map(m => m.move.name);

          const typeBadgeColors: { [key: string]: string } = {
            normal: '#A8A77A',
            fire: '#EE8130',
            water: '#6390F0',
            electric: '#F7D02C',
            grass: '#7AC74C',
            ice: '#96D9D6',
            fighting: '#C22E28',
            poison: '#A33EA1',
            ground: '#E2BF65',
            flying: '#A98FF3',
            psychic: '#F95587',
            bug: '#A6B91A',
            rock: '#B6A136',
            ghost: '#735797',
            dragon: '#6F35FC',
            dark: '#705746',
            steel: '#B7B7CE',
            fairy: '#D685AD',
          };
          const badgeType = pokemon.types[0]?.type.name || 'normal';
          const badgeColor = typeBadgeColors[badgeType] || '#A8A77A';

          const typeColors: { [key: string]: string } = {
            normal: '#E0E0E0',
            fire: '#FF944D',
            water: '#4DC3FF',
            electric: '#FFE066',
            grass: '#6DFF6D',
            ice: '#6DE3FF',
            fighting: '#C68642',
            poison: '#C86DFF',
            ground: '#FFD36D',
            flying: '#A6D1FF',
            psychic: '#FF6DCB',
            bug: '#B6FF6D',
            rock: '#E2C290',
            ghost: '#A89CFF',
            dragon: '#6D9CFF',
            dark: '#A6A6A6',
            steel: '#B8E0E6',
            fairy: '#FFB6E6',
          };
          const mainType = pokemon.types[0]?.type.name || 'normal';
          const cardBg = typeColors[mainType] || '#f8f8f8';
          
          function hexToRgba(hex: string, alpha: number) {
            const h = hex.replace('#', '');
            const bigint = parseInt(h, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r},${g},${b},${alpha})`;
          }
          const softBg = hexToRgba(cardBg, 0.45);

          return (
            <div key={pokemon.id} className="pokemon-card-tcg" style={{ background: `radial-gradient(circle at 60% 40%, #fff8 0%, transparent 70%), ${cardBg}` }}>
              <div className="tcg-header" style={{ background: softBg }}>
                <span className="tcg-basic" style={{ background: badgeColor, color: '#fff', border: '1.5px solid #fff', textShadow: '0 1px 2px #0006' }}>
                  {badgeType.charAt(0).toUpperCase() + badgeType.slice(1)}
                </span>
                <span className="tcg-name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                <span className="tcg-ps">PS {ps}</span>
                <span className="tcg-type">★</span>
              </div>
              <div className="tcg-image-container" style={{ background: softBg }}>
                <img src={image} alt={pokemon.name} className="tcg-image" />
              </div>
              <div className="tcg-attacks" style={{ background: softBg }}>
                {randomMoves.map((move, idx) => (
                  <div key={move} className="tcg-attack">
                    <span className="tcg-attack-cost">⚪⚪</span>
                    <span className="tcg-attack-name">{move.charAt(0).toUpperCase() + move.slice(1)}</span>
                    <span className="tcg-attack-damage">{idx === 0 ? 30 : 20}</span>
                  </div>
                ))}
              </div>
              <div className="tcg-footer" style={{ background: softBg }}>
                <span className="tcg-weakness">Debilidad: +20</span>
                <span className="tcg-retreat">Retirada: ⚪⚪</span>
              </div>
              <div className="tcg-description" style={{ background: softBg }}>
                <small>Descripción: {pokemon.name} es un Pokémon de tipo {pokemon.types.map(t => t.type.name).join(', ')}.</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}