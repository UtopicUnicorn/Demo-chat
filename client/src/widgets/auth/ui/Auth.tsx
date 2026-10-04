import { ChangeEvent, useState } from "react";
import styles from "./Auth.module.css";
import { useNavigate } from "react-router-dom";
import { PHONE_STORAGE_KEY } from "@/shared/constants";

export default function AuthWithPhone() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  function login(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPhoneNumber = phoneNumber.trim();
    if (!trimmedPhoneNumber) {
      return;
    }
    localStorage.setItem(PHONE_STORAGE_KEY, trimmedPhoneNumber);
    navigate("/chats", { replace: true });
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;

    const filteredValue = rawValue.replace(/(?!^\+)[^\d]/g, "");

    setPhoneNumber(filteredValue);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Вход в чат</h1>

      <form className={styles.phoneForm} onSubmit={login}>
        <label className={styles.fieldLabel} htmlFor="phone-number">
          Введите номер телефона
        </label>
        <input
          className={styles.input}
          id="phone-number"
          type="tel"
          placeholder="+79999999999"
          value={phoneNumber}
          onChange={handleInputChange}
        ></input>
        <button className={styles.sendButton} type={"submit"} disabled={!phoneNumber.trim()}>
          Отправить
        </button>
      </form>
    </div>
  );
}
