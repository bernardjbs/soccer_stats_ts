const cron = require("node-cron");
const { exec } = require("child_process");

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

cron.schedule("00 10 * * *", () => {
  console.log("Scheduled task started...");

  const command = "npm run save";
  const maxRetries = 3;

  executeWithRetries(command, maxRetries)
    .then(() => {
      console.log("Scheduled task completed");
    })
    .catch(() => {
      console.error("Scheduled task failed");
    });
});

cron.schedule("00 14 * * *", () => {
  console.log("Scheduled task started...");

  const command = "npm run save";
  const maxRetries = 3;

  executeWithRetries(command, maxRetries)
    .then(() => {
      console.log("Scheduled task completed");
    })
    .catch(() => {
      console.error("Scheduled task failed");
    });
});

cron.schedule("00 18 * * *", () => {
  console.log("Scheduled task started...");

  const command = "npm run save";
  const maxRetries = 3;

  executeWithRetries(command, maxRetries)
    .then(() => {
      console.log("Scheduled task completed");
    })
    .catch(() => {
      console.error("Scheduled task failed");
    });
});