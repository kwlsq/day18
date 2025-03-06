import { useEffect, useState } from "react";
import searchIcon from "../../assets/search.png";
import { useDebouncedCallback } from "use-debounce";
import usePokemonList from "../../hooks/usePokemonList";
import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  search: Yup.string().min(3, "Enter at least 3 characters"),
});

const SearchField: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { setSearchQuery: setSearchQueryGlobal } = usePokemonList();

  // Wait for 1 second before updating search query
  const debounced = useDebouncedCallback(
    (value) => {
      setSearchQuery(value);
      setSearchQueryGlobal(value);
    },
    1000 // delay in ms (1s)
  );

  useEffect(() => {
    console.log(searchQuery);
  }, [searchQuery]);

  return (
    <div>
      {editing ? (
        <Formik
          initialValues={{ search: "" }}
          validationSchema={validationSchema}
          onSubmit={(values) => debounced(values.search)}
        >
          {({ values, errors, handleChange, handleBlur }) => (
            <form>
              <input
                name="search"
                value={values.search}
                onChange={(e) => {
                  handleChange(e);
                  debounced(e.target.value); // Debounced search
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  setEditing(false);
                }}
                className="px-4 py-[6px] text-sm rounded-xl border"
                type="text"
                placeholder="Search..."
              />
              {errors.search && <div className="text-red-500 text-sm">{errors.search}</div>}
            </form>
          )}
        </Formik>
      ) : (
        <img
          onClick={() => setEditing(true)}
          src={searchIcon}
          alt="pokemon logo"
          className="w-6 h-5 object-contain cursor-pointer"
        />
      )}
    </div>
  );
};

export default SearchField;
