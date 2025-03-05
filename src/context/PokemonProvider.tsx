/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PokemonContext, { Pokemon, PokemonContextType } from "./PokemonContext";
import fetchPokemonDetails from "../utils/fetchPokemonDetails";

const LIST_LOCAL_STORAGE_NAME = "pokemonListStorage";

export const PokemonProvider: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortByField, setSortByField] = useState<string>("health-asc");
  const [offsetPage, setOffsetPage] = useState<number>(0);
  const pageLimit = 20;

  const MAX_FETCH_DATA = 10000;
  useEffect(() => {
    console.log("use effect provider");
    const fetchPokemonList = async () => {
      setLoading(true);
      try {
        setLoading(true);
        let filteredResults: Pokemon[];
        const storedDetail = localStorage.getItem(LIST_LOCAL_STORAGE_NAME);

        if (
          storedDetail &&
          storedDetail.length > 0 &&
          offsetPage === JSON.parse(storedDetail).length
        ) {
          const parsedData: Pokemon[] = JSON.parse(storedDetail);
          console.log(offsetPage, parsedData.length);
          filteredResults = parsedData;
        } else {
          console.log("masuk panggil api");

          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${
              searchQuery ? MAX_FETCH_DATA : pageLimit
            }&offset=${offsetPage}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch Pokémon.");
          }
          const data = (await response.json()) as { results: Pokemon[] };
          filteredResults = data.results;
          // Do filtering based on the query string
          localStorage.setItem(
            LIST_LOCAL_STORAGE_NAME,
            JSON.stringify(filteredResults)
          );
        }

        if (searchQuery) {
          const regex = new RegExp(searchQuery, "i"); // Case-insensitive regex
          filteredResults = filteredResults.filter((pokemon) =>
            regex.test(pokemon.name)
          );
        }

        if (sortByField) {
          const detailsMap = await Promise.all(
            filteredResults.map(async (each) => {
              const detail = await fetchPokemonDetails(each.name);
              return detail.data;
            })
          );
          const sortingKeys = sortByField.split("-");

          const sorted = detailsMap.sort((a: any, b: any) =>
            sortingKeys[1] === "asc"
              ? b[sortingKeys[0]] - a[sortingKeys[0]]
              : a[sortingKeys[0]] - b[sortingKeys[0]]
          );
          const finalList = sorted.map((each) => {
            const data: Pokemon = {
              name: each?.name || "",
              url: "",
            };
            return data;
          });
          filteredResults = finalList;
        }

        const cappedResults = filteredResults.slice(0, 20); // Cap the results to max 20 items
        setPokemonList(cappedResults);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPokemonList();
  }, [searchQuery, sortByField, setOffsetPage]);

  const value: PokemonContextType = {
    pokemonList,
    loading,
    error,
    setSearchQuery,
    setSortByField,
    sortByField,
    setOffsetPage,
  };

  return (
    <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>
  );
};
