import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
import { exec } from 'child_process';

export const executeCommand = async (command: string) => {
    //   const command = 'node saveResults.js';`
      try {
              await new Promise((resolve, reject) => {
                const scrapeDirectory = path.resolve(__dirname);
                const utilsDirectory = path.resolve(scrapeDirectory, '..', 'utils');
                console.log(`utils: ${utilsDirectory}`);
                exec(command, { cwd: utilsDirectory }, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`Error: ${error.message}`);
                    return;
                  }
                  console.log(`stdout: ${stdout}`);
                  console.error(`stderr: ${stderr}`);
                });
              });
        console.log('Command executed successfully');
      } catch (error: any) {
        console.error(`Attempt failed: ${error.message}`);
      }
  }