const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const router = express.Router();

app.use(cors({ origin: "*" }));

// Endpoint untuk menambahkan saldo via team_id & amount (opsional: phone_number)
router.get("/", async (req, res) => {
  const { team_id, amount, phone_number } = req.query;

  // Validasi input
  if (!team_id || !amount) {
    return res.status(400).json({
      message: "Parameter 'team_id' dan 'amount' wajib diisi.",
    });
  }

  try {
    let url = `https://backend.jkt48connect.my.id/api/auth/add-saldo?team_id=${team_id}&amount=${amount}`;
    if (phone_number) {
      url += `&phone_number=${phone_number}`;
    }

    const response = await axios.get(url);
    const data = response.data;

    res.json(data);
  } catch (error) {
    console.error("Gagal menambahkan saldo:", error.message);
    res.status(500).json({
      message: "Gagal memproses permintaan.",
      error: error.message,
    });
  }
});

module.exports = router;
