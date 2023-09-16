// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from "./Form.module.css";

import { useUrlPosition } from "../hooks/useUrlPosition";
import { useCities } from "../hooks/useCities";

import Button from "./Button";
import ButtonBack from "./ButtonBack";
import Spinner from "./Spinner";
import Message from "./Message";

import { convertToEmoji } from "../helpers";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [isLoadingReverseGeocoding, setIsLoadingReverseGeocodin] =
    useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("");
  const [geocodeError, setGeocodeError] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const { lat, lng } = useUrlPosition();
  const { createCity, isLoading: isLoadingCreateCity } = useCities();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchReverseGeocoding() {
      try {
        if (!lat || !lng) return;

        setGeocodeError("");
        setIsLoadingReverseGeocodin(true);
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();

        if (!data.city)
          throw new Error(
            "There seems not to be any city on this location, plsease click somewhere else."
          );

        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setEmoji(() => convertToEmoji(data.countryCode));
      } catch (error) {
        console.error(error.message);
        setGeocodeError(error.message);
      } finally {
        setIsLoadingReverseGeocodin(false);
      }
    }

    fetchReverseGeocoding();
  }, [lat, lng]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await createCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingReverseGeocoding) return <Spinner />;

  if (!lat || !lng)
    return <Message message="Start by clicking on the map to add a city." />;

  if (geocodeError) return <Message message={geocodeError} />;

  return (
    <form
      className={`${styles.form} ${isLoadingCreateCity ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        {/* <label htmlFor="date">When did you go to {cityName}?</label>
        <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker selected={date} onChange={(date) => setDate(date)} />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <ButtonBack />
      </div>
    </form>
  );
}

export default Form;
