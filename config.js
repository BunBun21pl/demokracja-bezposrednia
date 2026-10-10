// ============================================================
//  Demokracja Bezpośrednia — KONFIGURACJA (jedyny plik do edycji)
// ============================================================
//  Dane z konsoli Firebase: Project settings → General → „Your apps”
//  → SDK setup and configuration → Config.
//
//  Te wartości są publiczne z założenia (jak klucz anon w innych BaaS) —
//  dostępu pilnują reguły bezpieczeństwa Firestore (plik firestore.rules).
// ============================================================
window.FIREBASE_CONFIG = {
  apiKey: "TWOJ_API_KEY",
  authDomain: "TWOJ_PROJEKT.firebaseapp.com",
  projectId: "TWOJ_PROJEKT",
  storageBucket: "TWOJ_PROJEKT.appspot.com",
  messagingSenderId: "TWOJ_SENDER_ID",
  appId: "TWOJ_APP_ID"
};
