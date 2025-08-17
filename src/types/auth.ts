export type AuthErrorCode =
  | 'auth/email-already-in-use'
  | 'auth/invalid-credential'
  | 'auth/invalid-email'
  | 'auth/operation-not-allowed'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'unknown'