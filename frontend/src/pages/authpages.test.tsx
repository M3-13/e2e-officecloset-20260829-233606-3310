import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage, { submitLogin } from './LoginPage';
import RegisterPage, { submitRegister } from './RegisterPage';

function renderPage(element: ReactElement): string {
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

describe('submitLogin', () => {
  it('posts credentials, stores the token, loads the user and navigates to /wardrobe', async () => {
    const apiFetch = vi
      .fn()
      .mockResolvedValue({ access_token: 'abc', token_type: 'bearer' });
    const setToken = vi.fn();
    const loadMe = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn();

    await submitLogin(
      { username: 'ada', password: 'secret' },
      { apiFetch, setToken, loadMe, navigate },
    );

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ada', password: 'secret' }),
    });
    expect(setToken).toHaveBeenCalledWith('abc');
    expect(loadMe).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/wardrobe');
  });

  it('does not store a token or navigate when the request fails', async () => {
    const apiFetch = vi.fn().mockRejectedValue(new Error('Ungültige Anmeldedaten'));
    const setToken = vi.fn();
    const loadMe = vi.fn();
    const navigate = vi.fn();

    await expect(
      submitLogin(
        { username: 'ada', password: 'wrong' },
        { apiFetch, setToken, loadMe, navigate },
      ),
    ).rejects.toThrow('Ungültige Anmeldedaten');
    expect(setToken).not.toHaveBeenCalled();
    expect(loadMe).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('submitRegister', () => {
  it('posts the registration payload, stores the token and navigates to /wardrobe', async () => {
    const apiFetch = vi
      .fn()
      .mockResolvedValue({ access_token: 'abc', token_type: 'bearer' });
    const setToken = vi.fn();
    const loadMe = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn();

    await submitRegister(
      { username: 'ada', email: 'ada@example.com', password: 'secret' },
      { apiFetch, setToken, loadMe, navigate },
    );

    expect(apiFetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ada',
        email: 'ada@example.com',
        password: 'secret',
      }),
    });
    expect(setToken).toHaveBeenCalledWith('abc');
    expect(loadMe).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/wardrobe');
  });

  it('does not store a token or navigate when the request fails', async () => {
    const apiFetch = vi
      .fn()
      .mockRejectedValue(new Error('E-Mail bereits vergeben'));
    const setToken = vi.fn();
    const loadMe = vi.fn();
    const navigate = vi.fn();

    await expect(
      submitRegister(
        { username: 'ada', email: 'ada@example.com', password: 'secret' },
        { apiFetch, setToken, loadMe, navigate },
      ),
    ).rejects.toThrow('E-Mail bereits vergeben');
    expect(setToken).not.toHaveBeenCalled();
    expect(loadMe).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
