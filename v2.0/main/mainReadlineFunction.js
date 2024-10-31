// main readline.js

/**
 * MainReadline class provides a static method to capture and validate the 11-digit serial number input.
 */
class MainReadline {
  /**
   * Prompt user for an 11-digit serial number input with validation.
   * @param {Object} rl - The readline interface for user input.
   * @param {Object} chalk - The chalk module for colored console output.
   * @returns {Promise<string>} - A promise that resolves to a validated 11-digit serial number.
   */
  static async serialNumberInput(rl, chalk) {
    let serialNumberInput;
    let isValidInput = false;

    // Loop to validate user input
    while (!isValidInput) {
      serialNumberInput = await rl.question(
        chalk.cyanBright(
          "Enter the 11-digit serial number (example: 12345678901): "
        )
      );

      if (
        serialNumberInput.length !== 11 ||
        isNaN(serialNumberInput) ||
        serialNumberInput.includes(" ")
      ) {
        console.log(
          chalk.redBright("Serial number must be 11 digits. Please try again.")
        );
      } else {
        isValidInput = true; // Input is valid
      }
    }

    return { serialNumberInput, isValidInput };
  }

  /**
   * Prompt user for a token number input with validation.
   * @param {Object} rl - The readline interface for user input.
   * @param {Object} chalk - The chalk module for colored console output.
   * @param {boolean} isValidInput - Flag indicating if the previous input was valid.
   * @returns {Promise<string>} - A promise that resolves to a validated token number.
   */
  static async tokenNumberInput(rl, chalk, isValidInput) {
    let tokenNumber; // Variable to store user input

    // Loop until a valid token number is provided
    while (!isValidInput) {
      tokenNumber = await rl.question(
        chalk.cyanBright(
          "Enter the token number (format: 1111-2222-3333-4444-5555): "
        )
      );

      // Regex to validate the token number format
      const tokenFormat = /^\d{4}-\d{4}-\d{4}-\d{4}-\d{4}$/;
      if (!tokenFormat.test(tokenNumber)) {
        console.log(
          chalk.redBright("Invalid token number format. Please try again.")
        );
      } else {
        isValidInput = true; // Valid input
      }
    }

    return { tokenNumber }; // Return the valid token number
  }
}

// Export MainReadline as the default export
export default MainReadline;
