// CryptoFunction.js

// Importing CryptoJS for DES encryption/decryption operations
import CryptoJS from "crypto-js";
// Importing HelperFunction to assist with hex and binary transformations,
// as CryptoJS requires inputs in specific formats for encryption/decryption
import HelperFunction from "./helperFunction.js";

/**
 * CryptoFunction class provides static methods for DES encryption and decryption.
 * DES (Data Encryption Standard) is a symmetric-key algorithm used here in ECB mode without padding.
 * ECB mode is deterministic and should be used with caution in real-world cases, as it does not use an IV (Initialization Vector).
 */
class CryptoFunction {
  /**
   * Encrypts a byte array (Buffer) using DES.
   * - Converts the tokenBlock from binary to hex to ensure compatibility with CryptoJS.
   * - Uses ECB mode with no padding, which encrypts each block independently.
   *
   * @param {Buffer} tokenBlock - The binary data to be encrypted, often representing a token or identifier.
   * @param {Buffer} secretKey - The encryption key in Buffer format; must be a valid DES key (typically 8 bytes).
   * @returns {string} - The resulting encrypted data as a hexadecimal string.
   * @throws {Error} - Throws an error if encryption fails.
   */
  static encrypt(tokenBlock, secretKey) {
    // Step 1: Convert tokenBlock to hex string format for compatibility with CryptoJS.
    const hexToken = HelperFunction.binToHex(tokenBlock);

    // Step 2: Parse hex string into a format CryptoJS can understand.
    const parsedToken = HelperFunction.hexParseCryptoJS(hexToken, CryptoJS);

    // Step 3: Perform DES encryption using CryptoJS with ECB mode and no padding.
    // ECB mode encrypts each block independently, without chaining.
    const encrypted = CryptoJS.DES.encrypt(parsedToken, secretKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding, // No padding is used, so input length must be a multiple of block size (8 bytes for DES).
    });

    // Step 4: Return the encrypted result as a hex string for easy readability and further processing.
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  }

  /**
   * Decrypts an encrypted hex string using DES.
   * - The encrypted input is parsed as a hexadecimal string and converted for decryption.
   * - Uses ECB mode and no padding to mirror the encryption method.
   *
   * @param {string} encrypted - The encrypted hex string to decrypt, previously produced by `encrypt`.
   * @param {Buffer} secretKey - The decryption key in Buffer format; must match the key used for encryption.
   * @returns {string} - The resulting decrypted data as a hexadecimal string.
   * @throws {Error} - Throws an error if decryption fails.
   */
  static decrypt(encrypted, secretKey) {
    // Step 1: Parse the encrypted hex string into a format CryptoJS can decrypt.
    const encryptedHexParsed = CryptoJS.enc.Hex.parse(encrypted);

    // Step 2: Perform DES decryption using the provided secretKey in ECB mode with no padding.
    // ECB mode decrypts each block independently.
    const decrypted = CryptoJS.DES.decrypt(
      {
        ciphertext: encryptedHexParsed, // Ciphertext expects a CryptoJS WordArray format.
      },
      secretKey,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding, // No padding is used, so the output will match the original block size.
      }
    );

    // Step 3: Return the decrypted result as a hex string for compatibility with other hexadecimal processing.
    return decrypted.toString(CryptoJS.enc.Hex);
  }
}

export default CryptoFunction;
