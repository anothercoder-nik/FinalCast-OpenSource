import { renderComposition } from "../services/render.service.js";

export const startRender = async (req, res) => {
  const { sessionId, layout, inputs, duration } = req.body;

  if (!inputs || inputs.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No inputs provided"
    });
  }

  try {
    const result = await renderComposition({
      sessionId,
      layout,
      inputs,
      duration
    });

    res.json({
      success: true,
      downloadUrl: result.url,
      message: "Render complete"
    });
  } catch (err) {
    console.error("Render failed");

    res.status(500).json({
      success: false,
      message: "Render failed"
    });
  }
};
