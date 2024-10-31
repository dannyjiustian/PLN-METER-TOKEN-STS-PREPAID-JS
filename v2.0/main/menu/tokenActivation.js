// main tokenActivation.js

// Class to generate decoder keys for token encryption/decryption
import DecoderKeyGenerator from "../../core/decoderKeyGenerator.js";
// Utility functions for common operations (e.g., calculations, formatting)
import HelperFunction from "../../core/helperFunction.js";
// Class to handle token decryption and extraction of information
import TokenDecryptor from "../../core/tokenDecryptor.js";
// Class to generate unique vending keys for token processing
import VendingKey from "../../core/vendingKeyGenerate.js";
// Provides helper functions for the application
import MainHelperFunction from "../mainHelperFunction.js";
// Manages user input through command line
import MainReadline from "../mainReadlineFunction.js";
// Contains core functions essential for token generation
import MainCoreFunction from "../mainCoreFunction.js";

/**
 * MainTokenActivation class handles the process of activating a new token for the kWh meter.
 * It manages user inputs for serial numbers and token numbers, generates the decoder key,
 * decrypts the token, and validates the token against predefined criteria.
 */
class MainTokenActivation {
  /**
   * Asynchronous function to activate a token.
   * @param {Object} rl - The readline interface for user input.
   * @param {Object} chalk - The chalk module for colored console output.
   * @param {Object} fs - The file system module for file operations.
   * @param {number} yearNow - The current year to display in the menu header.
   */
  static async tokenActivation(rl, chalk, fs, yearNow) {
    const path = "./database/oldActiveToken.json"; // Path to the JSON file that stores active tokens

    // Display the menu header with year
    console.log(
      chalk.cyanBright(`
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                      Demo kWh Meter V2.0 ~ Menu New Token Activation                      │
│   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│                                     By Dan's ~ © ${yearNow}                                     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
      `)
    );

    // Prompt the user to input their 11-digit serial number
    let { serialNumberInput, isValidInput } =
      await MainReadline.serialNumberInput(rl, chalk);

    isValidInput = false; // Reset the validity flag for the token number input

    // Prompt the user to input their token number
    const { tokenNumber } = await MainReadline.tokenNumberInput(
      rl,
      chalk,
      isValidInput
    );

    // Generate the decoder key required for token generation
    const { lastSevenDigits, decoderKeyBin } =
      MainCoreFunction.createDecoderKey(
        serialNumberInput, // Serial number input
        VendingKey, // Class to generate vending key
        DecoderKeyGenerator, // Class to generate the decoder key
        HelperFunction // Helper functions for various tasks
      );

    // Decrypt the token using the generated decoder key
    const { tokenAmount, tid } = MainCoreFunction.tokenDecryptor(
      tokenNumber, // User-provided token number
      decoderKeyBin, // Binary decoder key
      TokenDecryptor // Class responsible for token decryption
    );

    // Validate token ID against the last seven digits of the serial number
    if (tid === parseInt(lastSevenDigits)) {
      // Check if the token has already been used
      if (
        !MainHelperFunction.isTokenUsed(
          fs,
          path,
          serialNumberInput,
          tokenNumber
        )
      ) {
        console.log(
          chalk.cyanBright(`
─────────────────────────────────────────────────────────────────────────────────────────────
                                Summary New Token Activation                                 
─────────────────────────────────────────────────────────────────────────────────────────────
        `)
        );

        // Save the token data to the JSON file
        MainHelperFunction.saveTokenData(
          fs,
          path,
          serialNumberInput,
          tokenNumber,
          true, // Indicates that the token is active
          tokenAmount // Amount of kWh being activated
        );

        // Display success messages
        console.log(chalk.cyanBright("Status: Success"));
        console.log(
          chalk.cyanBright(
            "Message: Token successfully applied, and kWh balance increases."
          )
        );
        console.log(chalk.cyanBright("Amount kWh:", tokenAmount));

        // Read the last kWh balance from the file
        const lastKWh = MainHelperFunction.readLastKWh(
          fs,
          path,
          serialNumberInput
        );

        // If the last kWh balance is found, display it
        if (lastKWh !== null) {
          console.log(chalk.cyanBright("Remaining kWh:", lastKWh));
          console.log(
            chalk.cyanBright(
              "\n─────────────────────────────────────────────────────────────────────────────────────────────"
            )
          );
          // Wait for user confirmation to continue
          await rl.question(
            chalk.cyanBright("\nPress any key to continue . . .")
          );
        } else {
          // If no kWh data is found, display an error message
          console.log(chalk.redBright("\nStatus: Error"));
          console.log(chalk.redBright("Message: Unable to find data."));
          await rl.question(chalk.redBright("Press any key to continue . . ."));
        }
      } else {
        // If the token has already been used, inform the user
        console.log(chalk.redBright("\nStatus: Already Used"));
        console.log(chalk.redBright("Message: Token was used previously."));
        await rl.question(chalk.redBright("Press any key to continue . . ."));
      }
    } else {
      // If the token ID does not match, inform the user of an error
      console.log(chalk.redBright("\nStatus: Error"));
      console.log(
        chalk.redBright("Message: Incorrect serial number or token.")
      );
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    }
  }
}

// Export MainTokenActivation as the default export
export default MainTokenActivation;
