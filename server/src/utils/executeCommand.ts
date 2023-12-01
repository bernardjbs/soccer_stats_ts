
import { exec } from 'child_process';

export const executeCommand = async (command: string, cwd: string) => {
    //   const command = 'node saveResults.js';`
      try {
              await new Promise((resolve, reject) => {

                console.log(`utils: ${cwd}`);
                exec(command, { cwd: cwd }, (error, stdout, stderr) => {
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