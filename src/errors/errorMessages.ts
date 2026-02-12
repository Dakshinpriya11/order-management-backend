export const ERROR_MESSAGES = {
  // AUTH
  AUTH_MISSING_CREDENTIALS: 'Email and password are required to login.',
  AUTH_INVALID_CREDENTIALS: 'Incorrect email or password provided.',
  AUTH_TOKEN_MISSING: 'Authentication token is missing from request headers.',
  AUTH_TOKEN_INVALID: 'Invalid or expired authentication token.',
  AUTH_INVALID_INPUT: 'Invalid input data. Please check the provided fields.', // ✅ added

  // USER
  USER_NOT_FOUND: 'The requested user does not exist.',
  USER_ALREADY_EXISTS: 'A user with this email already exists.',
  USER_FORBIDDEN: 'You do not have permission to perform this action.',

  //menu
  MENU_NOT_FOUND: "Menu item not found.",
  MENU_INVALID_INPUT: "Invalid menu input.",

} as const;
