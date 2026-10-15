# Poke Team Builder — Analizador léxico (LFP)

Práctica 1 de Lenguajes Formales y de Programación (USAC, vacaciones de junio 2025).

**Demo en vivo:** https://ferjoo.github.io/LFP_practica1/

Analizador léxico para un lenguaje propio (`.pklfp`) que describe equipos Pokémon por jugador. Escribe o carga un archivo en el editor y la aplicación:

- Resalta la sintaxis en tiempo real.
- Genera la tabla de tokens y el reporte de errores léxicos.
- Arma el equipo de cada jugador con datos y sprites de la [PokeAPI](https://pokeapi.co/).

## Tecnologías

React 19, TypeScript y Vite. El analizador léxico corre completamente en el navegador (`src/lexer/lexer.ts`). La carpeta `server/` conserva la versión original en Express, donde el análisis se hacía en un backend.

## Desarrollo local

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Cada push a `master` publica el sitio en GitHub Pages mediante `.github/workflows/deploy.yml`.

Más detalle en `Manual Tecnico.pdf` y `Manual de Usuario.pdf`.
