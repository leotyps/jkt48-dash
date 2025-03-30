// pages/api/edit-github-apikey.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ekstrak data dari body request
    const { 
      githubToken, 
      apiKey, 
      expiryDate = "unli", 
      remainingRequests = 250, 
      maxRequests = 250, 
      premium = false,
      seller = false
    } = req.body;

    // Validasi input
    if (!githubToken || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields: githubToken and apiKey must be provided' });
    }

    // Inisialisasi Octokit dengan token GitHub
    const octokit = new Octokit({
      auth: githubToken
    });

    // Konfigurasi repository
    const owner = 'Valzyys';
    const repo = 'api-jkt48connect';
    const path = 'apiKeys.js';
    const branch = 'main'; // atau branch lain yang sesuai

    // Ambil file dari GitHub
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    if ('content' in fileData) {
      // Decode content dari base64
      const content = Buffer.from(fileData.content, 'base64').toString();
      
      // Memproses content untuk mendapatkan konten apiKeys
      const apiKeysStart = content.indexOf('const apiKeys = {');
      const apiKeysEnd = content.lastIndexOf('};');
      
      if (apiKeysStart === -1 || apiKeysEnd === -1) {
        return res.status(500).json({ error: 'Invalid apiKeys.js format' });
      }
      
      // Mendapatkan konten apiKeys object
      const apiKeysObjectContent = content.substring(apiKeysStart + 'const apiKeys = '.length, apiKeysEnd + 1);
      
      // Parse apiKeys object content menjadi JavaScript object
      // (Ini adalah pendekatan sederhana, pendekatan yang lebih baik adalah menggunakan parser AST)
      let apiKeysObject;
      try {
        // Convert string ke object dengan eval (hanya untuk contoh, perhatikan keamanan!)
        // Dalam produksi, gunakan parser yang lebih aman
        apiKeysObject = eval(`(${apiKeysObjectContent})`);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to parse apiKeys object' });
      }
      
      // Tambahkan atau update apiKey baru
      const today = format(new Date(), 'yyyy-MM-dd');
      apiKeysObject[apiKey] = {
        expiryDate: expiryDate,
        remainingRequests: remainingRequests,
        maxRequests: maxRequests,
        lastAccessDate: today,
        ...(premium && { premium: true }),
        ...(seller && { seller: true })
      };
      
      // Membuat konten file baru
      let newContent = content;
      
      // Ganti objek apiKeys lama dengan yang baru
      const updatedApiKeysString = JSON.stringify(apiKeysObject, null, 2)
        .replace(/"parseCustomDate\("([^"]*)"\)"/g, 'parseCustomDate("$1")')
        .replace(/"∞"/g, '"∞"')
        .replace(/"unli"/g, '"unli"')
        .replace(/"true"/g, 'true')
        .replace(/"false"/g, 'false');
      
      // Membuat konten file baru
      newContent = content.substring(0, apiKeysStart) + 
                  'const apiKeys = ' + updatedApiKeysString + 
                  content.substring(apiKeysEnd + 1);
      
      // Commit perubahan ke GitHub
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Update API key: ${apiKey}`,
        content: Buffer.from(newContent).toString('base64'),
        sha: fileData.sha,
        branch
      });
      
      return res.status(200).json({ 
        message: 'API key updated successfully', 
        apiKey, 
        details: apiKeysObject[apiKey] 
      });
    } else {
      return res.status(404).json({ error: 'File not found or is a directory' });
    }
  } catch (error) {
    console.error('Error updating API key:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
