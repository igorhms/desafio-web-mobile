import { DataSourceType } from './data-source.types';

/**
 * Tipos relacionados a opções de fontes de dados
 */

export interface DataSourceOption {
  id: DataSourceType;
  title: string;
  description: string;
  unit: string;
}

