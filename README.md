# Glamouröser Kleiderschrank-Manager

Ein glamouröser Kleiderschrank-Manager mit Web-GUI im Hollywood-Stil. Benutzer
registrieren sich, legen Kleidungsstücke mit Bildern und festen Kategorien an,
durchsuchen ihre Garderobe und kombinieren Einzelteile im Outfit-Creator zu
gespeicherten Outfits – in eleganter Red-Carpet-Optik.

## Tech-Stack

- **Frontend**: React mit Vite
- **Backend**: FastAPI (Python)
- **Datenbank**: SQLite (via SQLAlchemy)
- **Authentifizierung**: JWT (Bearer Token)
- **Bildspeicherung**: lokales Upload-Verzeichnis

## Installation

Voraussetzung: Python 3.13+.

```bash
pip install -r requirements.txt
```

## Ausführen

### Entwicklung

`SECRET_KEY` wird beim Start automatisch zufällig erzeugt, wenn er nicht gesetzt
ist. Für einen stabilen Schlüssel über Neustarts hinweg einmal setzen (Kopie aus
`.env.example`):

```bash
# Linux/macOS
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"

# Windows (PowerShell)
$env:SECRET_KEY = (py -c 'import secrets; print(secrets.token_hex(32))')

uvicorn backend.main:app --port 8000
```

Die API ist danach unter `http://localhost:8000` erreichbar.

### Frontend

Das Frontend wird mit Vite gebaut und ausgeliefert (`npm run build`). Die
Backend-Origin wird über `FRONTEND_ORIGIN` (CORS) bzw. `VITE_API_URL`
(Frontend-API-Basis) konfiguriert.

## Konfiguration (Umgebungsvariablen)

| Variable | Default | Beschreibung |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./wardrobe.db` | Datenbank-URL (SQLite) |
| `UPLOAD_DIR` | `./uploads` | Lokales Verzeichnis für hochgeladene Bilder |
| `SECRET_KEY` | zufällig pro Start | Signierschlüssel für JWTs (siehe `.env.example`; wird automatisch erzeugt, falls nicht gesetzt) |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Erlaubte CORS-Origin des Frontends |
| `VITE_API_URL` | `http://localhost:8000` | Basis-URL der API für das Frontend |

## API-Endpunkte

Alle Endpunkte außer `/api/health`, `/api/auth/register` und `/api/auth/login`
benötigen einen `Authorization: Bearer <JWT>`-Header. Fehlerantworten haben die
Form `{"detail": "..."}`.

| Methode | Pfad | Beschreibung |
| --- | --- | --- |
| `GET` | `/api/health` | Health-Check → `200 {"status":"ok"}` |
| `POST` | `/api/auth/register` | Registrieren (`{username,email,password}`) → `201 {access_token,token_type}` |
| `POST` | `/api/auth/login` | Anmelden (`{username,password}`) → `200 {access_token,token_type}` |
| `GET` | `/api/auth/me` | Aktuellen Benutzer → `200 UserOut` |
| `DELETE` | `/api/auth/me` | Konto inkl. aller Daten löschen → `204` |
| `GET` | `/api/wardrobe/categories` | Kategorien → `200 ["Oberteil",...]` |
| `GET` | `/api/wardrobe/items` | Garderobe (Filter `category`, `search`) → `200 [ClothingItemOut]` |
| `POST` | `/api/wardrobe/items` | Kleidungsstück anlegen (multipart) → `201 ClothingItemOut` |
| `GET` | `/api/wardrobe/items/{id}` | Ein Kleidungsstück → `200 ClothingItemOut` |
| `PUT` | `/api/wardrobe/items/{id}` | Kleidungsstück bearbeiten (multipart) → `200 ClothingItemOut` |
| `DELETE` | `/api/wardrobe/items/{id}` | Kleidungsstück löschen → `204` |
| `GET` | `/api/wardrobe/items/{id}/image` | Bild eines Kleidungsstücks → `200 (image/jpeg|png)` |
| `GET` | `/api/outfits` | Alle Outfits → `200 [OutfitOut]` |
| `POST` | `/api/outfits` | Outfit anlegen (`{name,item_ids:[int]}`) → `201 OutfitOut` |
| `GET` | `/api/outfits/{id}` | Ein Outfit → `200 OutfitOut` |
| `PUT` | `/api/outfits/{id}` | Outfit bearbeiten (`{name,item_ids:[int]}`) → `200 OutfitOut` |
| `DELETE` | `/api/outfits/{id}` | Outfit löschen → `204` |

### Antwort-Schemata

- `UserOut`: `{id:int, username:str, email:str}`
- `ClothingItemOut`: `{id:int, name:str, category:str, description:str|null, image_url:str|null}`
- `OutfitOut`: `{id:int, name:str, items:[ClothingItemOut]}`

## Features

- Registrierung und Login mit JWT-Authentifizierung
- Garderobe: Kleidungsstücke mit Bild, Kategorie und Beschreibung anlegen, bearbeiten, löschen
- Filterung und Suche über die Garderobe
- Outfit-Creator zum Kombinieren gespeicherter Kleidungsstücke
- Red-Carpet-Optik nach `DESIGN.md`
