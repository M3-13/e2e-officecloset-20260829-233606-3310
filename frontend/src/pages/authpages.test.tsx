import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

function renderPage(element: React.ReactElement): string {
  return renderToString(
    <AuthProvider>
      <MemoryRouter>{element}</MemoryRouter>
    </AuthProvider>,
  );
}

describe('LoginPage', () => {
  it('renders the login form with a link to registration', () => {
    const html = renderPage(<LoginPage />);

    expect(html).toContain('Anmelden');
    expect(html).toContain('Benutzername');
    expect(html).toContain('Passwort');
    expect(html).toContain('href="/register"');
  });
});

describe('RegisterPage', () => {
  it('renders the registration form with a link to login', () => {
    const html = renderPage(<RegisterPage />);

    expect(html).toContain('Registrieren');
    expect(html).toContain('Benutzername');
    expect(html).toContain('E-Mail');
    expect(html).toContain('Passwort');
    expect(html).toContain('href="/login"');
  });
});
