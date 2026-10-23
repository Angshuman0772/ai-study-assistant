import supabase from "../config/supabase.js";

export async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const token = authHeader.slice(7);

  try {
    // Validate the access token with Supabase Auth.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Invalid or expired access token.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication failed:", error);

    return res.status(401).json({
      error: "Could not authenticate user.",
    });
  }
}
