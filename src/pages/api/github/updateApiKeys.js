const fs = require("fs");
const path = require("path");

exports.updateApiKeys = async (req, res) => {
  try {
    const { apiKey, expiryDate, limit, maxRequests, remainingRequests } = req.body;
    const filePath = path.resolve(__dirname, "apiKeys.js");
    const apiKeys = require(filePath);

    apiKeys[apiKey] = {
      expiryDate,
      maxRequests: Number(maxRequests),
      remainingRequests: Number(remainingRequests),
      lastAccessDate: new Date().toISOString(),
    };

    fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(apiKeys, null, 2)}`);
    res.status(200).json({ message: "API Key berhasil ditambahkan." });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui API Key.", error });
  }
};
