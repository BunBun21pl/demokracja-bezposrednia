# Demokracja Bezpośrednia — strona partii

Statyczna strona partii politycznej **Demokracja Bezpośrednia (DB)** z bazą danych
na **Firebase** (Firestore + Firebase Authentication). Hostuje ją GitHub Pages,
dane trzyma Firebase — bez własnego serwera, bez Supabase.

Strony: Aktualności (strona główna), Władze, Program, Projekty i referenda, Statut.
Administrator (pierwsze zarejestrowane konto) dodaje aktualności, władze oraz
projekty ustaw i referenda — z możliwością dołączania dokumentów **z Dysku Google**.

---

## Dlaczego Firebase

To usługa Google, więc dobrze współgra z dodawaniem treści z Dysku Google, ma
darmowy plan wystarczający dla takiej strony i działa ze stroną statyczną bez
własnego serwera. Dane klienta (apiKey itd. w `config.js`) są publiczne z założenia —
dostępu pilnują reguły bezpieczeństwa Firestore z pliku `firestore.rules`.

## Część 1. Projekt Firebase

1. Wejdź na `https://console.firebase.google.com` i utwórz projekt.
2. **Authentication** → Get started → włącz dostawcę **Email/Password**.
3. **Firestore Database** → Create database → zacznij w trybie produkcyjnym
   (reguły i tak zaraz wgramy), wybierz lokalizację (np. europejską).
4. **Reguły bezpieczeństwa**: Firestore → zakładka **Rules** → wklej całą zawartość
   pliku [`firestore.rules`](firestore.rules) → **Publish**. To one decydują, że stronę
   czyta każdy, a zapisywać może wyłącznie administrator.
5. **Dane do config.js**: Project settings (⚙) → General → „Your apps” → jeśli nie ma
   aplikacji web, kliknij ikonę `</>` i zarejestruj aplikację → skopiuj obiekt
   `firebaseConfig` i wklej jego wartości do [`config.js`](config.js).

## Część 2. Strona na GitHub Pages

1. Uzupełnij `config.js` danymi z Firebase.
2. Wgraj **całą zawartość tego folderu** do repozytorium na GitHubie.
3. **Settings → Pages → Deploy from a branch**, gałąź `main`, katalog `/`.
4. Strona ruszy pod `https://twoj-login.github.io/nazwa-repo/`.

Plik `.nojekyll` jest w paczce — nie usuwaj go.

> Dodaj swoją domenę GitHub Pages do Firebase: Authentication → Settings →
> **Authorized domains** → Add domain (np. `twoj-login.github.io`), aby logowanie
> działało z opublikowanej strony.

---

## Administrator i role

- **Pierwsze konto** zarejestrowane na stronie automatycznie przejmuje rolę
  administratora partii (zapisywaną w dokumencie `config/app`). Zarejestruj się
  jako pierwszy.
- Pozostali użytkownicy mogą się logować, ale nie mają dostępu do panelu
  administracyjnego ani prawa zapisu — pilnują tego reguły Firestore.
- Panel **Administracja** (widoczny tylko dla administratora) ma trzy zakładki:
  Aktualności, Władze oraz Projekty i referenda.

## Dodawanie treści z Dysku Google

Przy aktualnościach, władzach i projektach jest pole na **link z Dysku Google**:

1. Na Dysku Google kliknij plik → **Udostępnij** → ustaw dostęp
   **„Każdy, kto ma link”** (inaczej odwiedzający nie zobaczą pliku).
2. Skopiuj link i wklej w odpowiednie pole w panelu.

Strona sama rozpozna rodzaj pliku:
- **dokument / PDF / arkusz / prezentacja** → osadzony podgląd na stronie
  (przy projektach i referendach) plus przycisk „Otwórz w Google Drive”,
- **zdjęcie** (plik graficzny na Dysku) → wyświetlane jako grafika
  (przy aktualnościach i jako zdjęcie osoby w zakładce Władze).

Obsługiwane są linki typu `drive.google.com/file/d/…`, `docs.google.com/document/d/…`,
arkuszy i prezentacji, a także `…/open?id=…`.

## Pliki

```
index.html  wladze.html  program.html  projekty.html  statut.html  admin.html
config.js               ← dane Firebase (jedyny plik do edycji)
firestore.rules         ← reguły bezpieczeństwa (wklej w konsoli Firebase)
css/style.css
js/wspolne.js           ← Firebase, logowanie, uprawnienia, Dysk Google, UI
js/index.js  js/wladze.js  js/program.js  js/projekty.js  js/statut.js  js/admin.js
js/vendor/              ← biblioteki Firebase (lokalnie, bez CDN)
assets/                 ← logo, favicon
.nojekyll
```

Statut i program to treść stała (ze Statutu partii). Aktualności, władze oraz
projekty i referenda są zarządzane z panelu administratora i trzymane w Firestore.
