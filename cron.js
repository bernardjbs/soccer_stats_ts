const cron = require("node-cron");
const { exec } = require("child_process");

// Function to execute the command with retries
const executeWithRetries = async (command, retries) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`Attempt ${attempt} - Running command: ${command}`);
    try {
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            reject(error);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          resolve(stdout);
        });
      });
      console.log("Command executed successfully");
      break; // Exit the loop if successful
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log("Retrying...");
      } else {
        console.error(`Maximum retries reached`);
      }
    }
  }
};

// Schedule the task to run every day at 15:12 (3:12 PM)
cron.schedule("00 08 * * *", () => {
  console.log("Scheduled task started...");

  const command = "npm run scrape";
  const maxRetries = 3;

  executeWithRetries(command, maxRetries)
    .then(() => {
      console.log("Scheduled task completed");
    })
    .catch(() => {
      console.error("Scheduled task failed");
    });
});
