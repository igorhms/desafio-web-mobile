/**
 * Tipos relacionados a metadados de datasets
 */

export interface DatasetMeta extends Record<string, string | number | boolean | undefined> {
  fromCache?: boolean;
  updatedAt?: string;
  [key: string]: string | number | boolean | undefined;
}

