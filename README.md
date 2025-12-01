# Moodboard App (Firebase-enabled)

This is a UI-first Moodboard / Vision Calendar that stores data locally and syncs to Firestore when a user signs in with Google.

## Steps to use

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Authentication → Sign-in method → Google**.
3. Create **Firestore Database** in Native mode (not Datastore mode).
4. In **Project settings → SDK** get your Firebase config and paste it into `src/lib/firebase.js`.
5. Install deps:
   ```
   npm install
   ```
6. Run dev:
   ```
   npm run dev
   ```

## Firestore rules (recommended)
To allow each authenticated user to read/write only their own user document, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy rules in the Firebase console -> Firestore -> Rules.

## Where to view data
Open Firebase Console → Firestore Database → Collections → `users` → click a document (user UID) to see the `moods` field (map of date -> object).

## Notes
- LocalStorage is still used as a fallback and for quick access.
- No credentials are included — you must supply your Firebase config.
# mood
