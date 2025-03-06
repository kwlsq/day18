import { useCallback, useEffect, useState } from "react";
import Card from "../../components/Card";
import Header from "../../components/Header";
import MobileWrapper from "../../components/MobileWrapper";
import usePokemonList from "../../hooks/usePokemonList";

const ListPage: React.FC = () => {
  const [singleDisplayed, setSingleDisplayed] = useState(false);
  const {
    pokemonList,
    loading,
    error,
    setOffsetPage,
    setSortByField,
    sortByField,
  } = usePokemonList();

  const handleDisplay = useCallback(() => {
    setSingleDisplayed(!singleDisplayed);
  }, [singleDisplayed]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortByField(event.target.value);
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100 // Trigger when 100px from bottom
    ) {
      console.log("call api");
      setOffsetPage(pokemonList.length + 10);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup
  }, []);

  pokemonList.sort();

  if (error) return <div>Something is wrong :(</div>;
  return (
    <MobileWrapper>
      <Header withSearch />
      <div className="flex ">
        <select
          id="sort"
          value={sortByField}
          onChange={handleSortChange}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700"
        >
          <option value="health-asc">Hp: High to Low</option>
          <option value="health-desc">Hp: Low to High</option>
          <option value="attack-asc">Attack: High to Low</option>
          <option value="attack-desc">Attack: Low to High</option>
          <option value="defense-asc">Defense: High to Low</option>
          <option value="defense-desc">Defense: Low to High</option>
        </select>
      </div>
      <div className="flex text-[#ffff]">
        <button disabled={singleDisplayed} onClick={handleDisplay}>
          single
        </button>
        <button disabled={!singleDisplayed} onClick={handleDisplay}>
          multi
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div
          style={{
            gridTemplateColumns: singleDisplayed ? "1fr" : "repeat(2, 1fr)",
          }}
          className={`px-5 py-4 grid gap-5`}
        >
          {pokemonList.map((each, index) => (
            <Card key={index} name={each.name} />
          ))}
        </div>
      )}
    </MobileWrapper>
  );
};

export default ListPage;
