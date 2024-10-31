// tokenMeter.js

// Importing CryptoJS for DES encryption/decryption operations
import CryptoJS from "crypto-js";
// Importing HelperFunction to assist with hex and binary transformations
import HelperFunction from "./helperFunction.js";
// Importing CryptoFunction to assist with encryption and decryption
import CryptoFunction from "./cryptoFunction.js";

/**
 * TokenDecryptor class
 * - Responsible for decrypting a token number using DES encryption and extracting information from it.
 */
class TokenDecryptor {
  /**
   * Initializes the TokenDecryptor with a formatted token number.
   * @param {string} tokenNumber - A formatted token number (e.g., "3823-8437-4375-4099-7930").
   */
  constructor(tokenNumber) {
    // Store the token number as a property for processing within methods
    this.tokenNumber = tokenNumber;
  }

  /**
   * Decrypts the token using DES with the provided decoder key.
   * - Converts the token and key from binary to formats compatible with DES.
   * @param {string} decoderKey - A 64-bit binary string used as the decryption key.
   * @returns {string} - The decrypted token as a binary string.
   * @throws {Error} - Throws an error if the decoder key length is not 64 bits.
   */
  decryptToken(decoderKey) {
    // Ensure the decoder key length is exactly 64 bits, as required for DES
    if (decoderKey.length !== 64) {
      throw new Error("Decoder key must be a 64-bit binary string.");
    }

    // Step 1: Convert decoder key from binary to a format compatible with CryptoJS
    const secretKey = HelperFunction.hexParseCryptoJS(
      HelperFunction.binToHex(decoderKey),
      CryptoJS
    );

    // Step 2: Remove dashes from tokenNumber and convert to a BigInt for transformation
    const bigIntTokenNumber = BigInt(this.tokenNumber.replace(/-/g, ""));
    const encryptedTokenHex = bigIntTokenNumber.toString(16).padStart(16, "0");

    // Step 3: Convert hex string to binary to prepare for decryption transformations
    const encryptedTokenBin = HelperFunction.hexToBin(encryptedTokenHex);

    // Step 4: Apply transformations to the binary token to remove transposition and class bits
    const removeTransposition = this.transpositionAndRemoveClassBits(
      this.transpositionAndRemoveClassBits(encryptedTokenBin)
    );

    // Step 5: Convert the transformed binary token back to hex for DES decryption
    const removeTranspositionHex = HelperFunction.binToHex(removeTransposition);

    // Step 6: Decrypt the token using the DES algorithm
    const decrypted = CryptoFunction.decrypt(removeTranspositionHex, secretKey);

    // Step 7: Return the decrypted data in binary format for further processing
    return HelperFunction.hexToBin(decrypted);
  }

  /**
   * Transforms the binary token by removing class bits and performing a custom transposition.
   * @param {string} tokenNumberBinary - The binary representation of the encrypted token.
   * @returns {string} - The modified binary string without class bits.
   */
  transpositionAndRemoveClassBits(tokenNumberBinary) {
    // Step 1: Convert the binary string to an array to allow manipulation of individual bits
    const blockBits = tokenNumberBinary.split("");

    // Step 2: Transpose bits - here we move the first two bits to the end positions
    blockBits[tokenNumberBinary.length - 1 - 28] = blockBits[0];
    blockBits[tokenNumberBinary.length - 1 - 27] = blockBits[1];

    // Step 3: Remove the first two bits (representing class bits) and return the modified binary string
    return blockBits.join("").substring(2);
  }

  /**
   * Extracts and logs relevant information from the decrypted token block.
   * - Parses specific sections of the binary string for information like date, amount, and checksum.
   * @param {string} decryptedTokenBlock - The decrypted binary string to extract information from.
   */
  extractTokenInfo(decryptedTokenBlock) {
    // Extract random bits (12) used for token identification or other purposes
    console.log(`Token rnd binary: ${decryptedTokenBlock.substring(0, 12)}`);

    // Extract the token id from bits 12-32
    const tidBinary = decryptedTokenBlock.substring(12, 32);
    console.log(`Token tid binary: ${tidBinary}`);
    console.log(`Token tid number: ${HelperFunction.binToDec(tidBinary)}`);

    // Extract token amount (bits 32-48) and convert to kilowatt-hours (Kwh)
    const amountBinary = decryptedTokenBlock.substring(32, 48);
    const tokenAmount = HelperFunction.binToDec(amountBinary) / 10.0;
    console.log(`Token amount binary: ${amountBinary}`);
    console.log(`Token amount in Kwh: ${tokenAmount.toFixed(2)}`);

    // Extract and display the checksum or CRC (bits 48-64)
    console.log(`Token crc binary: ${decryptedTokenBlock.substring(48, 64)}`);
  }
}

export default TokenDecryptor;

// // Example usage
// const decoderKeyBin =
//   "1001101110111110001111101011111111000001110100001010101111000101"; // 64-bit binary decoder key
// const tokenNumber = "3299-2781-0707-8900-4812"; // Example token number from token encryptor

// console.log("Encrypted token as number:", tokenNumber);

// // Create an instance of TokenDecryptor with the token number
// const tokenDecryptor = new TokenDecryptor(tokenNumber);
// // Decrypt the token using the provided decoder key
// const decrypted = tokenDecryptor.decryptToken(decoderKeyBin);

// // Extract and log token information from the decrypted result
// tokenDecryptor.extractTokenInfo(decrypted);
