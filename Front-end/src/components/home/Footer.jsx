import { Container } from "react-bootstrap";
import { Globe, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import "./Footer.css";
import { useTranslation } from "react-i18next";
import Logo from "../logo/LogoDark"; // Import Logo component

const Footer = () => {
  const { t } = useTranslation("footer");

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="site-footer">
      <div className="footer-wave-container">
        <svg
          className="footer-wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L120,80C240,96,480,128,720,128C960,128,1200,96,1320,80L1440,64L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
            fill="#171717"
          ></path>
        </svg>
      </div>

      <div className="footer-content">
        <Container>
          <div className="footer-brand mb-5">
            <Link to="/" className="footer-logo" style={{ textDecoration: 'none' }}>
              <Logo size="medium" variant="horizontal" theme="dark" />
            </Link>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <Link to="/terms" className="footer-link">
                {t("termsOfService")}
              </Link>
              <Link to="/privacy" className="footer-link">
                {t("privacyPolicy")}
              </Link>
              <Link to="/contact" className="footer-link">
                {t("contactUs")}
              </Link>
            </div>

            <div className="footer-copyright">
              <p>{t("copyright")}</p>
            </div>

            <div className="footer-actions">
              <button className="footer-action-btn" aria-label="Language">
                <Globe size={18} />
              </button>
              <button className="footer-action-btn" onClick={scrollToTop} aria-label="Scroll to top">
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;