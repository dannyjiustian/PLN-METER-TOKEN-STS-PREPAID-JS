// tokenEncryptor.js

// Importing CryptoJS for DES encryption/decryption operations
import CryptoJS from "crypto-js";
// Importing HelperFunction to assist with hex and binary transformations
import HelperFunction from "./helperFunction.js";
// Importing CryptoFunction to assist with encryption and decryption
import CryptoFunction from "./cryptoFunction.js";

/**
 * TokenEncryptor Class
 * - Manages encryption of a token block using DES in ECB mode and custom bit transposition.
 */
class TokenEncryptor {
  /**
   * Initializes the TokenEncryptor with the token block and token class.
   * @param {string} tokenBlock - A 64-bit binary string (8 bytes) representing the token to be encrypted.
   * @param {string} tokenClass - Binary string representing class bits for additional context in encryption.
   */
  constructor(tokenBlock, tokenClass) {
    this.tokenBlock = tokenBlock; // The 64-bit binary token block
    this.tokenClass = tokenClass; // The token class binary string (e.g., "00")
  }

  /**
   * Encrypts the token using DES encryption in ECB mode with no padding.
   * - Checks if the decoder key and token block meet DES requirements (64 bits).
   * - Uses custom bit insertion and transposition with class bits.
   * @param {string} decoderKey - A 64-bit binary string used as the encryption key.
   * @returns {string} - Encrypted token as a hexadecimal string with transposed class bits.
   * @throws {Error} - Throws an error if decoderKey or tokenBlock is not 64 bits.
   */
  encryptToken(decoderKey) {
    // Ensure decoder key is 64 bits (necessary for DES encryption)
    if (decoderKey.length !== 64) {
      throw new Error("Decoder key must be a 64-bit binary string.");
    }

    // Convert decoder key to hex for compatibility with CryptoJS
    const secretKey = HelperFunction.hexParseCryptoJS(
      HelperFunction.binToHex(decoderKey),
      CryptoJS
    );

    // Ensure the token block is 64 bits (required for DES)
    if (this.tokenBlock.length !== 64) {
      throw new Error("Token block must be a 64-bit binary string.");
    }

    // Encrypt the token block using DES
    const encrypted = CryptoFunction.encrypt(this.tokenBlock, secretKey);

    // Insert class bits into the encrypted binary token block and perform transposition
    return HelperFunction.binToHex(
      this.insertAndTranspositionClassBits(
        HelperFunction.hexToBin(encrypted),
        this.tokenClass
      )
    );
  }

  /**
   * Inserts class bits and performs specific bit transpositions on the encrypted token block.
   * - This step customizes the encrypted block by embedding token class bits.
   * @param {string} encryptedTokenBlock - 64-bit binary string of the encrypted token.
   * @param {string} tokenClass - Binary string representing class bits.
   * @returns {string} - Modified binary string with inserted and transposed class bits.
   */
  insertAndTranspositionClassBits(encryptedTokenBlock, tokenClass) {
    // Prepend the class bits to the start of the encrypted token block
    const withClassBits = tokenClass + encryptedTokenBlock;

    // Split into individual bits for manipulation
    const tokenClassBits = tokenClass.split("");
    const tokenBlockBits = withClassBits.split("");

    // Calculate the length to use in bit transpositions
    const length = withClassBits.length;

    // Perform transpositions by swapping positions of specific bits
    tokenBlockBits[length - 1 - 65] = tokenBlockBits[length - 1 - 28];
    tokenBlockBits[length - 1 - 64] = tokenBlockBits[length - 1 - 27];
    tokenBlockBits[length - 1 - 28] = tokenClassBits[0];
    tokenBlockBits[length - 1 - 27] = tokenClassBits[1];

    // Return the final binary string after inserting class bits and applying transpositions
    return tokenBlockBits.join("");
  }
}

export default TokenEncryptor;

// // Example Usage

// // Define a 64-bit binary decoder key for DES encryption
// const decoderKeyBin =
//   "1001101110111110001111101011111111000001110100001010101111000101"; // Hex: 9BBE3EBFC1D0ABC5

// // Define a 64-bit binary token block to encrypt
// const tokenBlock =
//   "0011010000100110110000100110111000110011100110100100110111011110"; // Example from token generator

// // Define token class for custom bit modifications
// const tokenClass = "00"; // Typically used to add contextual information to the token

// // Initialize TokenEncryptor with the token block and token class
// const tokenEncryptor = new TokenEncryptor(tokenBlock, tokenClass);

// // Display original token in hexadecimal format for comparison
// console.log("Original token:", HelperFunction.binToHex(tokenBlock));

// // Encrypt the token and output the encrypted result in hexadecimal format
// const encrypted = tokenEncryptor.encryptToken(decoderKeyBin);
// console.log("Encrypted token in hex:", encrypted);

// // Convert encrypted hex string to formatted number with dashes for readability
// const encryptedNumber = HelperFunction.hexToNumber(encrypted);
// console.log("Encrypted token as number:", encryptedNumber);
