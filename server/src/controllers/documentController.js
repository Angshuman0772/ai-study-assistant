import supabaseAdmin from "../config/supabaseServer.js";
import { processDocument } from "../services/processDocument.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function processDocumentHandler(req, res) {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: "Invalid document ID." });
  }

  const { data: doc, error } = await supabaseAdmin
    .from("documents")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Document lookup failed:", error.message);
    return res.status(500).json({ error: "Could not look up this file." });
  }

  // The admin client bypasses RLS, so ownership must be checked here.
  // Same 404 for "missing" and "not yours", so IDs can't be probed.
  if (!doc || doc.user_id !== req.user.id) {
    return res.status(404).json({ error: "Document not found." });
  }

  if (doc.status === "processing") {
    return res
      .status(409)
      .json({ error: "This file is already being processed." });
  }

  if (doc.status === "ready") {
    return res.status(200).json({ status: "ready" });
  }

  try {
    const { chunkCount } = await processDocument(id);
    return res.status(200).json({ status: "ready", chunkCount });
  } catch (err) {
    console.error("Document processing failed:", {
      documentId: id,
      message: err?.message,
    });

    return res.status(err.expose ? 422 : 500).json({
      error: err.expose
        ? err.message
        : "Could not process this file. Please try again.",
    });
  }
}
