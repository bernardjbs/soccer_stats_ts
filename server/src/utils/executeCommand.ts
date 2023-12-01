
import { exec } from 'child_process';

export const executeCommand = async (command: string, cwd: string) => {
  try {
    await new Promise<void>((resolve, reject) => {
      exec(command, { cwd: cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          reject(error);
          return;
        }

        // Console log the output
        console.log(`${stdout}`); 

        if (stderr)
        console.error(`stderr: ${stderr}`);

        resolve();
      });
    });
    console.log('Command executed successfully');
  } catch (error: any) {
    console.error(`Attempt failed: ${error.message}`);
  }
};