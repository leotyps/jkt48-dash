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

    // Repository configuration
    const owner = 'Valzyys';
    const repo = 'api-jkt48connect';
    const path = 'apiKeys.js';
    const branch = 'main';

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
      
      // Parse the entire file content more carefully
      // First, find the beginning of the apiKeys object
      const apiKeysStartIndex = content.indexOf('const apiKeys = {');
      
      // Then find the end of the object (the last closing brace followed by semicolon)
      const apiKeysEndIndex = content.indexOf('};', apiKeysStartIndex) + 2;
      
      if (apiKeysStartIndex === -1 || apiKeysEndIndex === 1) {
        return res.status(500).json({ error: 'Invalid apiKeys.js format' });
      }
      
      // Extract the entire apiKeys object definition
      const apiKeysBlock = content.substring(apiKeysStartIndex, apiKeysEndIndex);
      
      // Create a new entry with proper formatting
      const today = format(new Date(), 'yyyy-MM-dd');
      const newApiKeyEntry = `  "${apiKey}": {
    expiryDate: "${expiryDate}",
    remainingRequests: ${remainingRequests},
    maxRequests: ${maxRequests},
    lastAccessDate: "${today}"${premium ? ',\n    premium: true' : ''}${seller ? ',\n    seller: true' : ''}
  },`;
      
      // Check if the API key already exists using a more robust approach
      const keyPattern = new RegExp(`"${apiKey}"\\s*:\\s*\\{[\\s\\S]*?\\}`, 'g');
      const keyExists = keyPattern.test(apiKeysBlock);
      
      let updatedApiKeysBlock;
      
      if (keyExists) {
        // Replace the existing key entry with the updated one
        // This uses a more careful approach to find and replace the entire key entry
        const keyStartPattern = new RegExp(`"${apiKey}"\\s*:`);
        const keyStartMatch = apiKeysBlock.match(keyStartPattern);
        
        if (keyStartMatch && keyStartMatch.index !== undefined) {
          const keyStartIndex = keyStartMatch.index;
          const keyContentStart = apiKeysBlock.indexOf('{', keyStartIndex);
          
          // Find the matching closing brace
          let braceCount = 1;
          let keyEndIndex = keyContentStart + 1;
          
          while (braceCount > 0 && keyEndIndex < apiKeysBlock.length) {
            if (apiKeysBlock[keyEndIndex] === '{') braceCount++;
            if (apiKeysBlock[keyEndIndex] === '}') braceCount--;
            keyEndIndex++;
          }
          
          // Check if there's a comma after the closing brace
          const hasCommaAfter = apiKeysBlock[keyEndIndex] === ',';
          
          // Replace the existing entry
          updatedApiKeysBlock = 
            apiKeysBlock.substring(0, keyStartIndex) + 
            newApiKeyEntry + 
            (hasCommaAfter ? ',' : '') + 
            apiKeysBlock.substring(keyEndIndex + (hasCommaAfter ? 1 : 0));
        } else {
          return res.status(500).json({ error: 'Failed to update existing API key entry' });
        }
      } else {
        // Add new API key at the end of the object before the closing brace
        const lastBraceIndex = apiKeysBlock.lastIndexOf('}');
        
        // Check if there are any existing entries (to determine if we need a comma)
        const needsComma = apiKeysBlock.substring(apiKeysBlock.indexOf('{') + 1, lastBraceIndex).trim().length > 0;
        
        updatedApiKeysBlock = 
          apiKeysBlock.substring(0, lastBraceIndex) + 
          (needsComma ? '\n' : '\n') + 
          newApiKeyEntry + '\n' + 
          apiKeysBlock.substring(lastBraceIndex);
      }
      
      // Reconstruct the full file content
      const newContent = 
        content.substring(0, apiKeysStartIndex) + 
        updatedApiKeysBlock + 
        content.substring(apiKeysEndIndex);
      
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
  } catch (error: any) { // Type assertion for error
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
