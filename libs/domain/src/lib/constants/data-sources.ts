import { DataSourceType } from '../models';

export interface DataSourceOption {
  id: DataSourceType;
  title: string;
  description: string;
  unit: string;
}

export const DATA_SOURCE_OPTIONS: DataSourceOption[] = [
  {
    id: 'open-meteo',
    title: 'Temperatura (Open-Meteo)',
    description: 'Série horária de temperatura em São Paulo',
    unit: '°C'
  }
];


