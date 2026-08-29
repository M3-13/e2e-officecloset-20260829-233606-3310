VERDICT: BUGS_FOUND

Ich kann die beigefügten Screenshots nicht sehen; ich beurteile anhand des Textberichts.

**Bug**

- **Titel:** Primärer Benutzer-Flow (Registrierung/Login) erzeugt im echten Browser keine Session
- **Symptom:** Der Kern-Flow des Produkts funktioniert nicht: Nach Absenden der Registrierung antwortet der Server mit 409, der anschließende Login mit 401; es wird keine Session etabliert. Damit sind Garderobe und Outfits für den Benutzer unerreichbar. AC-01 („Ein neuer Benutzer kann sich registrieren und wird anschließend angemeldet; ein erneuter Login mit denselben Daten funktioniert.“) ist auf der laufenden Web-App nicht erfüllt.
- **Repro:** Playwright-Smoke gegen das gebaute Frontend (`frontend/dist` auf Port 5173) bei laufendem Backend auf Port 8000: `/register`-Formular ausfüllen und absenden, danach `/login`-Formular ausfüllen und absenden.
- **Evidence:**
  - `[account-probe] POST /api/auth/register -> 409`
  - `[account-probe] POST /api/auth/login -> 401`
  - `[account-probe] session after sign-up + sign-in: NONE`
  - `Error: the primary user flow does not work: signing up and signing in produced no session, and the server answered: POST /api/auth/register -> 409 POST /api/auth/login -> 401`
- **Suspected file(s):** Nicht eindeutig lokalisiert. Die beiden Endpunkte werden von `backend/auth.py` bedient; die isolierten Backend-Tests mit frischer Test-DB laufen grün. Da beide Auth-Endpunkte im Echtbetrieb des Browsers gleichförmig scheitern, liegt die gemeinsame Ursache vermutlich in der Anfrage-/Datenstrecke des Frontends (`frontend/src/api/client.ts`, `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/RegisterPage.tsx`) oder in einer persistenten, bereits befüllten `wardrobe.db`, gegen die der Smoke mit kollidierenden Daten läuft.
- **Severity:** high