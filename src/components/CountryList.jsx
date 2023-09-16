import styles from "./CountryList.module.css";

// import PropTypes from "prop-types";
import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import Message from "./Message";
import { useCities } from "../hooks/useCities";

function CountryList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;

  if (!cities.length)
    return (
      <Message message="Add your first city by clicking on a country on the map" />
    );

  const countries = cities.reduce((arr, city) => {
    const { country, emoji } = city;

    if (!arr.length) return [{ country, emoji }];
    if (arr.map((country) => country.country).includes(country))
      return [...arr];
    else return [...arr, { country, emoji }];
  }, []);

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem key={country.country} country={country} />
      ))}
    </ul>
  );
}

// CountryList.propTypes = {
//   cities: PropTypes.array,
//   isLoading: PropTypes.bool,
// };

export default CountryList;
