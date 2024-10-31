// main tokenGenerator,js

// Class to generate decoder keys for token encryption/decryption
import DecoderKeyGenerator from "../../core/decoderKeyGenerator.js";
// Utility functions for common operations (e.g., calculations, formatting)
import HelperFunction from "../../core/helperFunction.js";
// Class to handle token encryption
import TokenEncryptor from "../../core/tokenEncryptor.js";
// Class to generate the structure of the token
import TokenGenerator from "../../core/tokenGenerator.js";
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
 * MainTokenGenerator class handles the process of generating a new token for the kWh meter.
 * It manages user input for serial numbers and purchase amounts, generates the token,
 * and validates the generated token against predefined criteria.
 */
class MainTokenGenerator {
  /**
   * Asynchronously generates a token based on the user's selected purchase amount.
   * This method interacts with the readline interface for user input, displays options,
   * validates the inputs, and creates the token.
   *
   * @param {Object} rl - The readline interface for capturing user input.
   * @param {Object} chalk - The chalk module for adding colors to console output.
   * @param {Object} fs - The filesystem module for reading and writing data files.
   * @param {string} yearNow - The current year for copyright purposes.
   * @returns {Promise<void>} - A promise that resolves after token generation is complete.
   */
  static async tokenGenerator(rl, chalk, fs, yearNow) {
    const path = "./database/generateToken.json";

    // Display header for the token generation menu
    console.log(
      chalk.cyanBright(`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                  Demo kWh Meter V2.0 ~ Menu Generate New Token                  │
│   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│                                By Dan's ~ © ${yearNow}                                │
└─────────────────────────────────────────────────────────────────────────────────┘
      `)
    );

    // Prompt the user to input their 11-digit serial number
    const { serialNumberInput } = await MainReadline.serialNumberInput(
      rl,
      chalk
    );

    // Display the options for purchase amounts
    console.log(
      chalk.cyanBright(`
───────────────────────────────────────────────────────────────────────────────────
                              Select Purchase Amount                               
                          The price of 1 kWh is Rp 1.444                           
───────────────────────────────────────────────────────────────────────────────────
      `)
    );

    // Define available purchase amounts
    const amounts = [20000, 50000, 100000, 200000, 500000, 1000000];
    // Display each amount with its corresponding total and kWh values
    amounts.forEach((amount, index) => {
      const totalAmount = MainHelperFunction.calculateTotal(amount);
      const totalKwh = MainHelperFunction.calculateKwh(amount);
      console.log(
        chalk.cyanBright(
          `    [${index + 1}] ${MainHelperFunction.formatRupiah(
            amount
          )} (Total: ${MainHelperFunction.formatRupiah(
            totalAmount
          )}, kWh: ${totalKwh})`
        )
      );
    });

    // Option for the user to cancel the token generation
    console.log(chalk.cyanBright("    [7] Cancel Generate Token!"));
    console.log(
      chalk.cyanBright(
        "\n───────────────────────────────────────────────────────────────────────────────────\n"
      )
    );

    // Get the user's choice of purchase amount
    const choice = await rl.question(
      chalk.cyanBright("Enter your choice (1, 2, 3, 4, 5, 6 or 7): ")
    );

    // Validate the user's choice
    if (choice >= 1 && choice <= 6) {
      const selectedAmount = amounts[choice - 1];
      const totalAmount = MainHelperFunction.calculateTotal(selectedAmount);
      const totalKwh = MainHelperFunction.calculateKwh(selectedAmount);

      // Confirm the user's selection
      console.log(
        chalk.cyanBright(
          `\nNOTE:\nA purchase of ${MainHelperFunction.formatRupiah(
            selectedAmount
          )} has been selected. Total amount to be paid: ${MainHelperFunction.formatRupiah(
            totalAmount
          )}.\nKWh obtained: ${totalKwh}.\n`
        )
      );

      // Generate the decoder key needed for token generation
      const { lastSevenDigits, decoderKeyBin } =
        MainCoreFunction.createDecoderKey(
          serialNumberInput,
          VendingKey,
          DecoderKeyGenerator,
          HelperFunction
        );

      let tokenAmount, tid, tokenNumber;
      do {
        // Build the token's 64-bit block
        const { token64BitBlock, cls } = new TokenGenerator(
          parseInt(lastSevenDigits),
          totalKwh
        ).build64BitTokenBlock();

        // Encrypt the token using the decoder key
        const tokenEncryptor = new TokenEncryptor(token64BitBlock, cls);
        tokenNumber = HelperFunction.hexToNumber(
          tokenEncryptor.encryptToken(decoderKeyBin)
        );

        // Decrypt the token and extract relevant information
        ({ tokenAmount, tid } = MainCoreFunction.tokenDecryptor(
          tokenNumber,
          decoderKeyBin,
          TokenDecryptor
        ));
      } while (
        // Validate that the token amount and TID match expectations and that the token is not already used
        tokenAmount !== totalKwh ||
        tid !== parseInt(lastSevenDigits) ||
        MainHelperFunction.isTokenUsed(fs, path, serialNumberInput, tokenNumber)
      );

      // Save the generated token data to the JSON file
      MainHelperFunction.saveTokenData(
        fs,
        path,
        serialNumberInput,
        tokenNumber
      );

      // Display the generated token number to the user
      console.log(chalk.cyanBright("20 Digits Token Number"));
      console.log(chalk.cyanBright.bold(tokenNumber));
      console.log(chalk.redBright("DON'T FORGET TO COPY THE TOKEN NUMBER\n"));
      await rl.question(chalk.cyanBright("Press any key to continue . . ."));
    } else if (choice === "7") {
      // Handle the cancel action
      console.log(chalk.redBright("Back to the main menu."));
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    } else {
      // Handle invalid choice scenario
      console.log(chalk.redBright("Invalid choice. Please try again."));
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    }
  }
}

// Export MainTokenGenerator as the default export
export default MainTokenGenerator;
