import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getPokemonInfo } from '../api/pokemonApi';
import type { Pokemon } from '../api/pokemonApi';
import { analyzeCode } from '../api/lexerApi';
import './TeamView.css';

interface PokemonTeam {
  name: string;
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
  ivs: {
    salud: number;
    ataque: number;
    defensa: number;
  };
  analyzerType: string;
  base_experience: number;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

export function TeamView() {
  const { editorText, analyzed, errors } = useApp();
  const [teams, setTeams] = useState<PokemonTeam[]>([]);
  const [pokemonData, setPokemonData] = useState<{ [key: string]: PokemonWithIVs[] }>({});
  const [bestTeams, setBestTeams] = useState<{ [key: string]: PokemonWithIVs[] }>({});
  const [showAllCards, setShowAllCards] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gridRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isOverflowing, setIsOverflowing] = useState<{ [key: string]: boolean }>({});

  const calculateIVs = (salud: number, ataque: number, defensa: number): number => {
    return ((salud + ataque + defensa) / 45) * 100;
  };

  const selectBestTeam = (pokemon: PokemonWithIVs[]): PokemonWithIVs[] => {
    // Sort all Pokémon by their total IVs
    const sortedByIVs = [...pokemon].sort((a, b) => {
      const aIV = calculateIVs(a.ivs.salud, a.ivs.ataque, a.ivs.defensa);
      const bIV = calculateIVs(b.ivs.salud, b.ivs.ataque, b.ivs.defensa);
      return bIV - aIV;
    });
    
    const selected: PokemonWithIVs[] = [];
    const usedTypes = new Set<string>();

    // First pass: Try to get one of each type with the best IVs
    for (const poke of sortedByIVs) {
      if (selected.length >= 6) break;
      if (!usedTypes.has(poke.analyzerType)) {
        selected.push(poke);
        usedTypes.add(poke.analyzerType);
      }
    }

    // Second pass: Fill remaining slots with best IV Pokémon regardless of type
    if (selected.length < 6) {
      for (const poke of sortedByIVs) {
        if (selected.length >= 6) break;
        if (!selected.includes(poke)) {
          selected.push(poke);
        }
      }
    }

    // Sort final selection by IVs again to ensure best order
    return selected.sort((a, b) => {
      const aIV = calculateIVs(a.ivs.salud, a.ivs.ataque, a.ivs.defensa);
      const bIV = calculateIVs(b.ivs.salud, b.ivs.ataque, b.ivs.defensa);
      return bIV - aIV;
    });
  };

  const scrollTeam = (teamName: string, direction: 'left' | 'right') => {
    const container = gridRefs.current[teamName];
    if (!container) return;
    const scrollAmount = 800;
    const newPosition = direction === 'left'
      ? Math.max(0, container.scrollLeft - scrollAmount)
      : container.scrollLeft + scrollAmount;
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const fetchPokemonTeams = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!analyzed) {
          console.log('Not analyzed yet');
          setError('Por favor, analiza el código primero usando el botón "Analizar"');
          return;
        }

        if (errors.length > 0) {
          console.log('Has errors:', errors);
          setError('Hay errores léxicos en el código. Por favor, corrígelos antes de ver los equipos.');
          return;
        }

        console.log('Analyzing code:', editorText);
        const { tokens } = await analyzeCode(editorText);
        console.log('Tokens received:', tokens);

        const teamsData: PokemonTeam[] = [];
        let currentTeam: PokemonTeam | null = null;
        let currentPokemon: { name: string; type: string; stats: { salud: number; ataque: number; defensa: number } } | null = null;
        let currentStat: 'salud' | 'ataque' | 'defensa' | null = null;

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === 'NEWLINE' || token.type === 'WHITESPACE') continue;

          if (token.type === 'RESERVED' && token.lexeme === 'Jugador' && tokens[i + 1]?.type === 'COLON' && tokens[i + 2]?.type === 'STRING') {
            if (currentTeam) {
              teamsData.push(currentTeam);
            }
            currentTeam = {
              name: tokens[i + 2].lexeme.replace(/"/g, ''),
              team: []
            };
            i += 2;
          }
          else if (token.type === 'STRING' && tokens[i + 1]?.type === 'LBRACKET' && tokens[i + 2]?.type === 'RESERVED') {
            if (currentPokemon && currentTeam) {
              currentTeam.team.push(currentPokemon);
            }
            currentPokemon = {
              name: token.lexeme.replace(/"/g, '').toLowerCase(),
              type: tokens[i + 2].lexeme.toLowerCase(),
              stats: { salud: 0, ataque: 0, defensa: 0 }
            };
            i += 2;
          }
          else if (token.type === 'RESERVED' && ['salud', 'ataque', 'defensa'].includes(token.lexeme)) {
            currentStat = token.lexeme as 'salud' | 'ataque' | 'defensa';
          }
          else if (token.type === 'NUMBER' && currentStat && currentPokemon) {
            currentPokemon.stats[currentStat] = parseInt(token.lexeme);
            currentStat = null;
          }
        }

        if (currentPokemon && currentTeam) {
          currentTeam.team.push(currentPokemon);
        }
        if (currentTeam) {
          teamsData.push(currentTeam);
        }

        console.log('Parsed teams:', teamsData);
        setTeams(teamsData);

        // Fetch Pokemon data for each team
        const teamPokemonData: { [key: string]: PokemonWithIVs[] } = {};
        const bestTeamsData: { [key: string]: PokemonWithIVs[] } = {};
        const initialShowAll: { [key: string]: boolean } = {};

        for (const team of teamsData) {
          console.log('Fetching data for team:', team.name);
          const notFound: string[] = [];
          const pokemonData = await Promise.all(
            team.team.map(async p => {
              try {
                console.log('Fetching pokemon:', p.name);
                const pokemon = await getPokemonInfo(p.name);
                return {
                  ...pokemon,
                  ivs: p.stats,
                  analyzerType: p.type
                };
              } catch (error) {
                console.error('Error fetching pokemon:', p.name, error);
                notFound.push(p.name);
                return null;
              }
            })
          );

          if (notFound.length > 0) {
            console.log('Pokemon not found:', notFound);
            alert(`No se encontró en la API: ${notFound.join(', ')}`);
          }

          const filteredPokemonData = pokemonData.filter(Boolean) as PokemonWithIVs[];
          teamPokemonData[team.name] = filteredPokemonData;
          bestTeamsData[team.name] = selectBestTeam(filteredPokemonData);
          initialShowAll[team.name] = false;
        }

        console.log('Final pokemon data:', teamPokemonData);
        setPokemonData(teamPokemonData);
        setBestTeams(bestTeamsData);
        setShowAllCards(initialShowAll);
      } catch (error) {
        console.error('Error processing teams:', error);
        setError('Error al procesar los equipos');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonTeams();
  }, [editorText, analyzed, errors]);

  // Check for overflow on mount, update, and resize
  useEffect(() => {
    const checkOverflow = () => {
      const newOverflow: { [key: string]: boolean } = {};
      teams.forEach(team => {
        const grid = gridRefs.current[team.name];
        if (grid) {
          newOverflow[team.name] = grid.scrollWidth > grid.clientWidth;
        }
      });
      setIsOverflowing(newOverflow);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [teams, showAllCards, pokemonData, bestTeams]);

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
    fairy: '#D685AD'
  };

  if (loading) return <div className="loading">Cargando equipos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="teams-container">
      {teams.map((team) => (
        <div key={team.name} id={`team-${team.name}`} className="team-section">
          <div className="team-header">
            <h2 className="team-name">{team.name}</h2>
            <div className="show-all-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showAllCards[team.name] || false}
                  onChange={(e) => setShowAllCards(prev => ({
                    ...prev,
                    [team.name]: e.target.checked
                  }))}
                />
                Mostrar todos los Pokémon
              </label>
            </div>
          </div>
          <div className="team-grid-wrapper">
            {isOverflowing[team.name] && (
              <button 
                className="scroll-button left"
                onClick={() => scrollTeam(team.name, 'left')}
                aria-label="Scroll left"
              >
                ←
              </button>
            )}
            <div
              className="team-grid"
              ref={el => { gridRefs.current[team.name] = el; }}
            >
              {(showAllCards[team.name] ? pokemonData[team.name] : bestTeams[team.name])?.map((pokemon) => (
                <div key={pokemon.name} className="pokemon-card-tcg">
                  <div className="tcg-header">
                    <span 
                      className="tcg-basic"
                      style={{ backgroundColor: typeBadgeColors[pokemon.types[0].type.name] }}
                    >
                      {pokemon.types[0].type.name.charAt(0).toUpperCase() + pokemon.types[0].type.name.slice(1)}
                    </span>
                    <span className="tcg-name">{pokemon.name}</span>
                    <span className="tcg-ps">PS {pokemon.base_experience}</span>
                    <span className="tcg-type" style={{ backgroundColor: typeBadgeColors[pokemon.types[0].type.name] }}>
                      {pokemon.types[0].type.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="tcg-image-container">
                    <img 
                      src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
                      alt={pokemon.name}
                      className="tcg-image"
                    />
                  </div>
                  <div className="tcg-attacks">
                    <div className="tcg-attack">
                      <span className="tcg-attack-cost">HP</span>
                      <span className="tcg-attack-name">Salud</span>
                      <span className="tcg-attack-damage">{pokemon.ivs.salud}</span>
                    </div>
                    <div className="tcg-attack">
                      <span className="tcg-attack-cost">ATK</span>
                      <span className="tcg-attack-name">Ataque</span>
                      <span className="tcg-attack-damage">{pokemon.ivs.ataque}</span>
                    </div>
                    <div className="tcg-attack">
                      <span className="tcg-attack-cost">DEF</span>
                      <span className="tcg-attack-name">Defensa</span>
                      <span className="tcg-attack-damage">{pokemon.ivs.defensa}</span>
                    </div>
                  </div>
                  <div className="tcg-footer">
                    <span>IV Total: {calculateIVs(pokemon.ivs.salud, pokemon.ivs.ataque, pokemon.ivs.defensa).toFixed(1)}%</span>
                    <span>Tipo: {pokemon.analyzerType}</span>
                  </div>
                </div>
              ))}
            </div>
            {isOverflowing[team.name] && (
              <button 
                className="scroll-button right"
                onClick={() => scrollTeam(team.name, 'right')}
                aria-label="Scroll right"
              >
                →
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}