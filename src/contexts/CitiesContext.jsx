import { createContext, useCallback, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { wait } from "../helpers";

const CitiesContext = createContext();

// const BASE_URL = "http://localhost:9000";

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("Unknown action type");
  }
}

// ///////////// LOCAL STORAGE VERSION  //////////////

function CitiesProvider({ children }) {
  const [storedCities, setStoredCities] = useLocalStorageState("cities");

  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(reducer, {
    ...initialState,
    cities: storedCities,
  });

  // update local storage

  useEffect(() => {
    setStoredCities(cities);
  }, [cities, setStoredCities]);

  // create city
  async function createCity(newCity) {
    dispatch({ type: "loading" });
    await wait(0.5);
    dispatch({
      type: "city/created",
      payload: { ...newCity, id: crypto.randomUUID() },
    });
  }

  // load city

  const getCity = useCallback(
    async function (id) {
      if (currentCity.id === id) return;

      dispatch({ type: "loading" });
      await wait(0.5);

      const city = cities.find((city) => city.id === id);

      dispatch({ type: "city/loaded", payload: city });
    },
    [currentCity.id, cities]
  );

  // delete city

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    await wait(0.2);
    dispatch({ type: "city/deleted", payload: id });
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        currentCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

/////////////// JSON - SERVER VERSION ///////////////
// function CitiesProvider({ children }) {

// const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
//   reducer,
//   initialState
// );

// fetch data

// useEffect(() => {
//   async function fetchCities() {
//     try {
//       dispatch({ type: "loading" });
//       const res = await fetch(`${BASE_URL}/cities`);
//       if (!res) throw new Error("Failed to fetch");
//       const data = await res.json();
//       dispatch({ type: "cities/loaded", payload: data });
//     } catch (err) {
//       dispatch({ type: "rejected", payload: err.message });
//     }
//   }
//   fetchCities();
// }, []);

// create city

// async function createCity(newCity) {
//   dispatch({ type: "loading" });
//   try {
//     const res = await fetch(`${BASE_URL}/cities`, {
//       method: "POST",
//       body: JSON.stringify(newCity),
//       headers: { "Content-Type": "application/json" },
//     });
//     const data = await res.json();

//     dispatch({ type: "city/created", payload: data });
//   } catch (error) {
//     dispatch({ type: "rejected", payload: "Failed to create city" });
//   }
// }

// get city

// const getCity = useCallback(
//   async function (id) {
//     if (currentCity.id === Number(id)) return;

//     dispatch({ type: "loading" });
//     try {
//       const res = await fetch(`${BASE_URL}/cities/${id}`);
//       if (!res) throw new Error("Failed to fetch");
//       const data = await res.json();

//       dispatch({ type: "city/loaded", payload: data });
//     } catch (err) {
//       dispatch({ type: "rejected", payload: err.message });
//     }
//   },
//   [currentCity.id]
// );

// delete city

// async function deleteCity(id) {
//   dispatch({ type: "loading" });
//   try {
//     await fetch(`${BASE_URL}/cities/${id}`, {
//       method: "DELETE",
//     });

//     dispatch({ type: "city/deleted", payload: id });
//   } catch (error) {
//     dispatch({ type: "rejected", payload: "Failed to delete city" });
//   }
// }

//   return (
//     <CitiesContext.Provider
//       value={{
//         cities,
//         isLoading,
//         getCity,
//         currentCity,
//         createCity,
//         deleteCity,
//       }}
//     >
//       {children}
//     </CitiesContext.Provider>
//   );
// }

CitiesProvider.propTypes = {
  children: PropTypes.node,
};

export { CitiesProvider, CitiesContext };
