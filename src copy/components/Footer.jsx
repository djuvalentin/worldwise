import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        &copy; Copytright 2023 by WorldWise Inc.
      </p>
    </footer>
  );
}

export default Footer;
