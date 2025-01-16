import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Tambahkan token GitHub sebagai variabel lingkungan
});

const REPO_OWNER = "Apalahdek";
const REPO_NAME = "api-jkt48connect";
const FILE_PATH = "apiKeys.js"; // Path file yang akan dimodifikasi

export default async function saveApiKey(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { apiKey, expiryDate, limit, seller } = req.body;

    if (!apiKey || !expiryDate || !limit) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    try {
      // Fetch the current file content
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
      });

      const fileContent = Buffer.from(
        fileData.content,
        fileData.encoding
      ).toString("utf-8");

      // Parse the current API keys
      const updatedContent = modifyApiKeys(
        fileContent,
        apiKey,
        expiryDate,
        limit,
        seller
      );

      // Commit the updated file back to the repository
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: FILE_PATH,
        message: `Update API key: ${apiKey}`,
        content: Buffer.from(updatedContent).toString("base64"),
        sha: fileData.sha,
      });

      res.status(200).json({ message: "API Key successfully saved." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to save API Key." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}

function modifyApiKeys(
  fileContent: string,
  apiKey: string,
  expiryDate: string,
  limit: number,
  seller: boolean
): string {
  const apiKeysRegex = /const apiKeys = {([\s\S]*?)}/;
  const match = fileContent.match(apiKeysRegex);

  if (!match) {
    throw new Error("Invalid apiKeys.js format.");
  }

  const apiKeysContent = match[1].trim();
  const apiKeysObject = eval(`({${apiKeysContent}})`);

  apiKeysObject[apiKey] = {
    expiryDate,
    remainingRequests: limit,
    maxRequests: limit,
    lastAccessDate: new Date().toISOString().slice(0, 10),
    seller,
  };

  const updatedApiKeys = JSON.stringify(apiKeysObject, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"/g, "'");

  return fileContent.replace(apiKeysRegex, `const apiKeys = {\n${updatedApiKeys}\n}`);
}
