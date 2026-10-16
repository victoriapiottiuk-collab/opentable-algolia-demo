
import { algoliasearch } from "algoliasearch";

export const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

export const INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX;
