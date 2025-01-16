exports.deleteApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const filePath = path.resolve(__dirname, "apiKeys.js");
    const apiKeys = require(filePath);

    if (!apiKeys[apiKey]) {
      return res.status(404).json({ message: "API Key tidak ditemukan." });
    }

    delete apiKeys[apiKey];

    fs.writeFileSync(filePath, `module.exports = ${JSON.stringify(apiKeys, null, 2)}`);
    res.status(200).json({ message: "API Key berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus API Key.", error });
  }
};
