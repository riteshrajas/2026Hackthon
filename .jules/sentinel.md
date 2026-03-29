## 2024-05-25 - IDOR in Action Logging & AI Suggestions
**Vulnerability:** Found a critical Insecure Direct Object Reference (IDOR) where the application used `req.body.user_id` instead of the authenticated user's ID (`req.userAuth.user_id`) to perform sensitive actions (logging points and fetching AI suggestions).
**Learning:** Even when routes are protected by authentication middleware, we must verify that the user ID provided in the request payload matches the authenticated user to prevent users from interacting with or modifying other users' data.
**Prevention:** Always use the authenticated user's ID from the session/token (`req.userAuth.user_id`) directly, or explicitly validate that `req.body.user_id === req.userAuth.user_id` for actions tied to a specific user.
