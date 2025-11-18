/**
 * Tipos relacionados a respostas de APIs externas
 */

export interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

