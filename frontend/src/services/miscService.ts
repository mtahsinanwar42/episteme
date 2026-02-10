import { api } from "./api";

export const miscService = {
  getCountries: async (): Promise<{ success: boolean; data: string[] }> => {
    return api.get<{ success: boolean; data: string[] }>(
      "/reference-data/countries",
      false,
    );
  },
  getTopics: async (): Promise<{ success: boolean; data: string[] }> => {
    return api.get<{ success: boolean; data: string[] }>(
      "/reference-data/topics",
      false,
    );
  },
};
