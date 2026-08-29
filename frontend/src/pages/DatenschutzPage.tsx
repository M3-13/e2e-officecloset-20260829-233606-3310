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

export default function DatenschutzPage() {
  return (
    <section className="page">
      <h1 className="page-title">Datenschutz</h1>
      <p className="page-subtitle">
        Informationen zur Verarbeitung deiner personenbezogenen Daten gemäß Art. 13 DSGVO.
      </p>

      <div style={legalStyle}>
        <h2 style={headingStyle}>Verantwortlicher</h2>
        <p>
          Red Carpet — Kleiderschrank-Manager
          <br />
          Musterstraße 12, 10115 Berlin
          <br />
          E-Mail: <a href="mailto:kontakt@red-carpet.example">kontakt@red-carpet.example</a>
        </p>

        <h2 style={headingStyle}>Welche Daten wir verarbeiten</h2>
        <p>
          Bei der Nutzung dieses Dienstes verarbeiten wir ausschließlich Daten, die du
          selbst angibst:
        </p>
        <ul>
          <li>Benutzername und E-Mail-Adresse (bei der Registrierung)</li>
          <li>
            Deine Garderobe: Kleidungsstücke mit Name, Kategorie, Beschreibung und
            hochgeladenen Bildern
          </li>
          <li>Deine angelegten Outfits</li>
        </ul>

        <h2 style={headingStyle}>Zwecke und Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung erfolgt, um dir den Dienst bereitzustellen und zu verbessern
          (Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung). Eine Weitergabe an Dritte
          findet nicht statt.
        </p>

        <h2 style={headingStyle}>Speicherung und Sicherheit</h2>
        <p>
          Deine Daten werden lokal auf unseren Systemen gespeichert. Passwörter werden
          ausschließlich als kryptografischer Hash mit Salt gespeichert und niemals im
          Klartext verarbeitet.
        </p>

        <h2 style={headingStyle}>Drittanbieter-Ressourcen</h2>
        <p>
          Dieser Dienst lädt keine Schriften, Skripte oder sonstigen Ressourcen von
          Drittanbietern. Alle Inhalte werden von unseren eigenen Servern ausgeliefert.
        </p>

        <h2 style={headingStyle}>Deine Rechte</h2>
        <p>Du hast jederzeit das Recht auf:</p>
        <ul>
          <li>Auskunft über die zu deiner Person gespeicherten Daten</li>
          <li>Berichtigung unrichtiger Daten</li>
          <li>Löschung deiner Daten („Recht auf Vergessenwerden“)</li>
          <li>Einschränkung der Verarbeitung und Datenübertragbarkeit</li>
        </ul>

        <h2 style={headingStyle}>Konto löschen</h2>
        <p>
          Du kannst dein Konto und alle zugehörigen Daten (Garderobe, Outfits und
          hochgeladene Bilder) jederzeit selbst unter „Konto“ löschen. Dabei werden deine
          Daten unwiderruflich entfernt.
        </p>
      </div>
    </section>
  );
}
