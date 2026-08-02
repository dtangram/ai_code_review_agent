// Logs the full error (stack, message, any provider-specific fields like
// error codes or request IDs) to the server's own logs — visible via
// `heroku logs --tail` or Papertrail — without ever sending that detail to
// the client. End users should see a plain, actionable sentence; developers
// should see everything, but only in server logs, not in the HTTP response.
export const logServerError = (context: string, err: unknown): void => {
  console.error(`[${context}]`, err);
};
