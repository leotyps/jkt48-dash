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
      
      // Process content to get apiKeys content
      const apiKeysStart = content.indexOf('const apiKeys = {');
      const apiKeysEnd = content.lastIndexOf('};');
      
      if (apiKeysStart === -1 || apiKeysEnd === -1) {
        return res.status(500).json({ error: 'Invalid apiKeys.js format' });
      }
      
      // Get apiKeys object content
      const apiKeysObjectContent = content.substring(apiKeysStart + 'const apiKeys = '.length, apiKeysEnd + 1);
      
      // Parse apiKeys object content into JavaScript object
      let apiKeysObject;
      try {
        // Convert string to object with eval (example only, consider security!)
        // In production, use a safer parser
        apiKeysObject = eval(`(${apiKeysObjectContent})`);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to parse apiKeys object' });
      }
      
      // Add or update new apiKey
      const today = format(new Date(), 'yyyy-MM-dd');
      apiKeysObject[apiKey] = {
        expiryDate: expiryDate,
        remainingRequests: remainingRequests,
        maxRequests: maxRequests,
        lastAccessDate: today,
        ...(premium && { premium: true }),
        ...(seller && { seller: true })
      };
      
      // Create new file content
      let newContent = content;
      
      // Replace old apiKeys object with the new one
      const updatedApiKeysString = JSON.stringify(apiKeysObject, null, 2)
        .replace(/"parseCustomDate\("([^"]*)"\)"/g, 'parseCustomDate("$1")')
        .replace(/"∞"/g, '"∞"')
        .replace(/"unli"/g, '"unli"')
        .replace(/"true"/g, 'true')
        .replace(/"false"/g, 'false');
      
      // Create new file content
      newContent = content.substring(0, apiKeysStart) + 
                  'const apiKeys = ' + updatedApiKeysString + 
                  content.substring(apiKeysEnd + 1);
      
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
      
      return res.status(200).json({ 
        message: 'API key updated successfully', 
        apiKey, 
        details: apiKeysObject[apiKey] 
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
