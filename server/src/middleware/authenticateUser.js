import supabaseAdmin from "../config/supabaseServer.js";

// Verifies the Supabase access token sent by the client and attaches
// the verified user to req.user. Never trust a user ID from the request body.
export async function authenticateUser(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing authentication token." });
  }

  try {
    // Asks Supabase Auth to validate the token.
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Authentication check failed:", err);
    return res.status(500).json({ error: "Could not verify your session." });
  }
}
