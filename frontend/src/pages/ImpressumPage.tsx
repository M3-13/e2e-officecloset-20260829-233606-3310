import type { CSSProperties } from 'react';

const headingStyle: CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  fontSize: '20px',
  color: 'var(--color-accent)',
  margin: 'var(--space-5) 0 var(--space-2) 0',
};

const legalStyle: CSSProperties = {
  maxWidth: '70ch',
  marginTop: 'var(--space-4)',
};

export default function ImpressumPage() {
  return (
    <section className="page">
      <h1 className="page-title">Impressum</h1>
      <p className="page-subtitle">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz).</p>

      <div style={legalStyle}>
        <h2 style={headingStyle}>Anbieter</h2>
        <address style={{ fontStyle: 'normal', lineHeight: 1.6 }}>
          Red Carpet — Kleiderschrank-Manager
          <br />
          Musterstraße 12
          <br />
          10115 Berlin
          <br />
          Deutschland
        </address>

        <h2 style={headingStyle}>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:kontakt@red-carpet.example">kontakt@red-carpet.example</a>
          <br />
          Telefon: +49 (0)30 000 000 00
        </p>

        <h2 style={headingStyle}>Vertretungsberechtigte Personen</h2>
        <p>Max Mustermann (Geschäftsführung)</p>

        <h2 style={headingStyle}>Verantwortlich für den Inhalt</h2>
        <p>
          Max Mustermann
          <br />
          Musterstraße 12, 10115 Berlin
        </p>

        <h2 style={headingStyle}>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
          Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>

        <h2 style={headingStyle}>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
          keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der
          jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
      </div>
    </section>
  );
}
