#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { readConfig } = require('./config');


const generateHtaccess = () => {
  console.log("Generating...")
  const config = readConfig();
  console.log('Config:', config);
  function parseSlug(inputString) {
    return inputString.replace(/\[(.*?)\]/g, '([^/]+)');
  }
  // Define the folder path you want to scan
  const folderPath = config.buildPath;
  
  // console.log("folder", folderPath)
  // Function to recursively list HTML files
  function listHtmlFiles(dir, fileList) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        listHtmlFiles(filePath, fileList);
      } else if (path.extname(filePath) === '.html') {
        fileList.push(path.relative(config.buildPath, filePath));
      }
    }
  }

  // Create an empty array to store file paths
  const htmlFiles = [];

  // Call the recursive function to list HTML files
  listHtmlFiles(folderPath, htmlFiles);

  // Convert the file list to JSON string
  const jsonData = JSON.stringify(htmlFiles, null, 2); // Pretty-print for readability



  let htaccess = `<IfModule mod_rewrite.c>\n   RewriteEngine On\n
  RewriteBase / \n`;

  // Generate the rewrite rules
  JSON.parse(jsonData).forEach((path) => {
    if (!config.include404 &&  path.includes("404")) {
    return
  }
  const parsedSlug = parseSlug(path)
  const parts = parsedSlug.split('/');
  const folder = parts.slice(0, -1).join('/');
  const rule = `RewriteRule ^${folder}/$ ${path} [L]\n`;
  htaccess += `    #${folder}\n`;
  htaccess += `    ${rule}`;
});

htaccess += `    RewriteCond %{REQUEST_FILENAME} !-f \n
RewriteCond %{REQUEST_FILENAME} !-d \n
RewriteRule ^(.*)$ /404/404.html [L] \n</IfModule>`;

// Write the rules to .htaccess file

fs.writeFileSync(path.join(config.outputPath,'.htaccess'), htaccess);

console.log('Successfully generated .htaccess file');
}

generateHtaccess()