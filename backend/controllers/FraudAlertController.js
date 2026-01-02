import FraudAlert from "../models/FraudAlert.js";

// GET /api/alerts
export const getFraudAlerts = async (req, res) => {
  try {
    const alerts = await FraudAlert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("Error fetching fraud alerts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/alerts (optional, for adding alerts manually or via detection)
export const createFraudAlert = async (req, res) => {
  try {
    const alert = new FraudAlert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    console.error("Error creating fraud alert:", err);
    res.status(400).json({ message: err.message });
  }
};
