// main about.js

// Importing MainHelperFunction for use s function read last kwh
import MainHelperFunction from "../mainHelperFunction.js";
// Import MainReadline for use a function serial number input
import MainReadline from "../mainReadlineFunction.js";

/**
 * MainCheckRemainingKWh class provides a static method to check the remaining kWh balance
 * based on the meter's 11-digit serial number.
 */
class MainCheckRemainingKWh {
  /**
   * Displays the remaining kWh balance for a given 11-digit meter serial number.
   * @param {Object} rl - The readline interface for user input.
   * @param {string} yearNow - The current year for copyright information.
   * @returns {Promise<void>} - A promise that resolves after displaying the remaining kWh balance.
   */
  static async checkRemainingKWh(rl, chalk, fs, yearNow) {
    const path = "./database/oldActiveToken.json";

    // Display header
    console.log(
      chalk.cyanBright(`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   Demo kWh Meter V2.0 ~ Check Remaining Token                   │
│   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│                                By Dan's ~ © ${yearNow}                                │
└─────────────────────────────────────────────────────────────────────────────────┘
      `)
    );

    // get value serial number input readline
    const { serialNumberInput } = await MainReadline.serialNumberInput(
      rl,
      chalk
    );

    // Call helper function to read the remaining kWh from JSON file
    const lastKWh = MainHelperFunction.readLastKWh(fs, path, serialNumberInput);
    if (lastKWh !== null) {
      console.log(
        chalk.cyanBright(`
─────────────────────────────────────────────
            Details Remaining kWh            
─────────────────────────────────────────────

Meter Serial Number: ${serialNumberInput}
Remaining kWh: ${lastKWh}

─────────────────────────────────────────────
        `)
      );
      await rl.question(chalk.cyanBright("Press any key to continue . . ."));
    } else {
      console.log(chalk.redBright("\nStatus: Error"));
      console.log(chalk.redBright("Message: Unable to find data."));
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    }
  }

  /**
   * Helper function to read the last kWh from a JSON file based on serial number.
   * @param {string} filePath - The path to the JSON file containing meter data.
   * @param {string} serialNumber - The 11-digit serial number for lookup.
   * @returns {number|null} - The remaining kWh balance or null if not found.
   */
  static readLastKWh(filePath, serialNumber) {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      const meterData = JSON.parse(data);

      // Retrieve kWh data by serial number, if available
      return meterData[serialNumber]
        ? meterData[serialNumber].remainingKWh
        : null;
    } catch (error) {
      console.error(chalk.redBright("Error reading data file:", error.message));
      return null;
    }
  }
}

// Export MainCheckRemainingKWh as the default export
export default MainCheckRemainingKWh;
