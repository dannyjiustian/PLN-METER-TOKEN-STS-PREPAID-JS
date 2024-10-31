// vendingKeyGenerate.js

// Importing CryptoJS for DES encryption/decryption operations
import CryptoJS from "crypto-js";
// Importing fs for writing the generated key to a file
import { writeFileSync } from "fs";

class VendingKey {
  constructor(serialNumber) {
    this.serialNumber = serialNumber;
  }
  /**
   * Function to generate a 64-bit DES key from an 11-digit serial number and write it to a file.
   * @param {string} serialNumber - An 11-digit serial number as a string, used to create the DES key.
   */
  generateKey() {
    // Validate the input: Ensure it's a string of exactly 11 characters
    if (
      typeof this.serialNumber !== "string" ||
      this.serialNumber.length !== 11
    ) {
      throw new Error("The key must be an 11-digit serialNumber as a string.");
    }

    // Generate a 16-character (64-bit) DES key by padding the serial number with zeros as needed
    const paddedKey = this.serialNumber.padEnd(16, "0").slice(0, 16); // Pad or truncate to 16 characters

    // Convert the padded key to a CryptoJS-compatible WordArray using UTF-8 encoding
    const keyWordArray = CryptoJS.enc.Utf8.parse(paddedKey);

    // Encode the WordArray key as a Base64 string, which is commonly used for key storage
    const encodedKey = CryptoJS.enc.Base64.stringify(keyWordArray);

    // Write the encoded key to a file named "VendingKey.key" in UTF-8 encoding
    writeFileSync("VendingKey.key", encodedKey, "utf8");
    console.log("Key generated and written to VendingKey.key");
  }
}

export default VendingKey;

// /**
//  * Main function that initiates key generation.
//  */
// const main = () => {
//     const elevenDigitNumber = '45623123133';  // The 11-digit input for the DES key
//     try {
//         new VendingKey(elevenDigitNumber).generateKey();  // Generate and store the key
//     } catch (error) {
//         console.error('Error generating key:', error);  // Catch and log any errors
//     }
// };

// // Execute the main function
// main();