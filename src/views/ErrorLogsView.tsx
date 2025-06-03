import React from 'react';
import { TokenTable } from '../components/TokenTable';
import { useApp } from '../context/AppContext';

export function ErrorLogsView() {
  const { errors } = useApp();

  return (
    <div className="content">
      <div className="tokens-section">
        <div className="tokens-label">Reporte de Errores Léxicos</div>
        {errors.length > 0 ? (
          <TokenTable tokens={errors} showErrors={true} />
        ) : (
          <div className="no-errors">
            No se encontraron errores léxicos en el código.
          </div>
        )}
      </div>
    </div>
  );
} 