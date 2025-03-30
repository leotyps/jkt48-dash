import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from '@octokit/rest';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Support for both GET and POST methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract data from body request for POST or query params for GET
    const data = req.method === 'POST' ? req.body : req.query;
    
    // Log the request type and data (sanitized)
    console.log(`Processing ${req.method} request`);
    console.log('Request includes apiKey:', data.apiKey ? 'Yes' : 'No');
    console.log('Request includes githubToken:', data.githubToken ? 'Yes (hidden)' : 'No');
    
    const { 
      githubToken, 
      apiKey, 
      expiryDate = "unli", 
      remainingRequests = 250, 
      maxRequests = 250, 
      premium = false,
      seller = false
    } = data;

    // Validate input
    if (!githubToken || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields: githubToken and apiKey must be provided' });
    }

    // Initialize Octokit with GitHub token
    // Ensure the token is properly formatted
    const formattedToken = githubToken.trim();
    console.log('Using GitHub token (first few chars):', formattedToken.substring(0, 5) + '...');
    
    const octokit = new Octokit({
      auth: formattedToken,
      request: {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    });

    // Repository configuration - use master branch instead of main
    const owner = 'Valzyys';
    const repo = 'api-jkt48connect';
    const path = 'apiKeys.js';
    const branch = 'master'; // Changed from 'main' to 'master'

    // Get file from GitHub
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    if ('content' in fileData) {
      // Decode content from base64
      const content = Buffer.from(fileData.content, 'base64').toString();
      
      // Instead of trying to parse the JS directly, we'll use regex to find and update the apiKeys object
      const apiKeysMatch = content.match(/const apiKeys = \{([\s\S]*?)\};/);
      
      if (!apiKeysMatch) {
        return res.status(500).json({ error: 'Invalid apiKeys.js format' });
      }
      
      // Manually parse the existing apiKeys object structure
      const apiKeysContent = apiKeysMatch[0];
      
      // Create a new entry for the apiKey
      const today = format(new Date(), 'yyyy-MM-dd');
      const newApiKeyEntry = `  "${apiKey}": {
    expiryDate: "${expiryDate}",
    remainingRequests: ${remainingRequests},
    maxRequests: ${maxRequests},
    lastAccessDate: "${today}"${premium ? ',\n    premium: true' : ''}${seller ? ',\n    seller: true' : ''}
  }`;
      
      // Check if the API key already exists
      const existingApiKeyRegex = new RegExp(`"${apiKey}"\\s*:\\s*\\{[\\s\\S]*?\\}`, 'g');
      let newContent;
      
      if (existingApiKeyRegex.test(apiKeysContent)) {
        // Update existing API key
        newContent = content.replace(existingApiKeyRegex, newApiKeyEntry);
      } else {
        // Add new API key at the end of the object before the closing brace
        const lastBraceIndex = apiKeysContent.lastIndexOf('}');
        newContent = content.substring(0, lastBraceIndex) + 
                    (lastBraceIndex > 0 && content[lastBraceIndex-1] !== '{' ? ',\n' : '') + 
                    newApiKeyEntry + 
                    content.substring(lastBraceIndex);
      }
      
      // Commit changes to GitHub
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Update API key: ${apiKey}`,
        content: Buffer.from(newContent).toString('base64'),
        sha: fileData.sha,
        branch
      });
      
      // Create a simple representation of the API key for the response
      const apiKeyDetails = {
        expiryDate,
        remainingRequests,
        maxRequests,
        lastAccessDate: today,
        ...(premium && { premium: true }),
        ...(seller && { seller: true })
      };
      
      return res.status(200).json({ 
        message: 'API key updated successfully', 
        apiKey, 
        details: apiKeyDetails 
      });
    } else {
      return res.status(404).json({ error: 'File not found or is a directory' });
    }
  }   catch (error: any) { // Type assertion for error
    console.error('Error updating API key:', error);
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error';
    const statusCode = error.status || 500;
    
    // Check for specific GitHub API errors
    if (errorMessage.includes('Bad credentials')) {
      return res.status(401).json({ 
        error: 'GitHub Authentication Failed', 
        details: 'The GitHub token provided is invalid or has expired. Please check your token and try again.',
        originalError: errorMessage
      });
    }
    
    return res.status(statusCode).json({ 
      error: 'Error Processing Request', 
      details: errorMessage,
      hint: 'Make sure your GitHub token has the necessary permissions to access and update repositories.'
    });
  }
}
