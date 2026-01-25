import { REFERENCE_FILES, TOPICS_CONFIG, COUNTRIES_CONFIG, } from "../utils/constants.js";
import { ensureDirSync, resolveInDir, readLinesIfExists, writeLines, getPublicAssetsDiskDir, } from "../utils/file.js";
import { getJson, getText } from "../helpers/http.js";

export function createRefDataService({ }) {
  async function getTopics() {
    const assetsDir = getPublicAssetsDiskDir();
    ensureDirSync(assetsDir);

    const topicsPath = resolveInDir(assetsDir, REFERENCE_FILES.TOPICS);
    const existing = readLinesIfExists(topicsPath);

    if (existing.length) {
      return existing;
    }

    const extracted = await extractTopicsFromApi();
    return writeLines(topicsPath, extracted);
  }

  async function getCountries() {
    const assetsDir = getPublicAssetsDiskDir();
    ensureDirSync(assetsDir);

    const countriesPath = resolveInDir(assetsDir, REFERENCE_FILES.COUNTRIES);
    const existing = readLinesIfExists(countriesPath);

    if (existing.length) {
      return existing;
    }

    const extracted = await extractCountriesFromApi();
    return writeLines(countriesPath, extracted);
  }

  async function refreshTopics() {
    const assetsDir = getPublicAssetsDiskDir();
    ensureDirSync(assetsDir);

    const topicsPath = resolveInDir(assetsDir, REFERENCE_FILES.TOPICS);
    const extracted = await extractTopicsFromApi();
    return writeLines(topicsPath, extracted);
  }

  async function refreshCountries() {
    const assetsDir = getPublicAssetsDiskDir();
    ensureDirSync(assetsDir);

    const countriesPath = resolveInDir(assetsDir, REFERENCE_FILES.COUNTRIES);
    const extracted = await extractCountriesFromApi();
    return writeLines(countriesPath, extracted);
  }

  function buildTopicsUrl(page) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(TOPICS_CONFIG.PER_PAGE),
    });

    return `${TOPICS_CONFIG.URL}?${params.toString()}`;
  }

  async function extractTopicsFromApi() {
    const topics = [];

    for (let page = TOPICS_CONFIG.START_PAGE; page <= TOPICS_CONFIG.END_PAGE; page++) {
      const url = buildTopicsUrl(page);
      const data = await getJson(url);

      const results = Array.isArray(data?.results) ? data.results : [];
      for (const item of results) {
        if (item?.display_name) topics.push(item.display_name);
      }
    }

    return topics;
  }

  async function extractCountriesFromApi() {
    const text = await getText(COUNTRIES_CONFIG.URL);

    return text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return {
    getTopics,
    getCountries,
    refreshTopics,
    refreshCountries,
  }
}