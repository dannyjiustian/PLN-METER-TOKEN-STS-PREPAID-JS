import CryptoJS from "crypto-js";

/**
 * Class handling encryption of a token block using CryptoJS and DES algorithm.
 */
class TokenEncryptor {
  /**
   * @param {string} tokenBlock - A 64-bit binary string (8 bytes) to be encrypted.
   * @param {string} tokenClass - Binary string used for additional context in token modification.
   */
  constructor(tokenBlock, tokenClass) {
    this.tokenBlock = tokenBlock; // The 64-bit token block to encrypt
    this.tokenClass = tokenClass; // Token class information used for specific transpositions
  }

  /**
   * Encrypts the token using DES encryption with ECB mode and no padding.
   * @param {string} decoderKey - A 64-bit binary string used as the encryption key.
   * @returns {string} - Encrypted token in hexadecimal format with transposed class bits.
   * @throws {Error} - If the decoder key or token block is not 64 bits.
   */
  encryptToken(decoderKey) {
    if (decoderKey.length !== 64) {
      throw new Error("Decoder key must be a 64-bit binary string.");
    }

    const secretKey = this.hexToByteArray(this.binToHex(decoderKey));

    if (this.tokenBlock.length !== 64) {
      throw new Error("Token block must be a 64-bit binary string.");
    }

    const encrypted = CryptoJS.DES.encrypt(
      this.hexToByteArray(this.binToHex(this.tokenBlock)),
      secretKey,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }
    );

    return this.binToHex(
      this.insertAndTranspositionClassBits(
        this.hexToBin(encrypted.ciphertext.toString(CryptoJS.enc.Hex)),
        this.tokenClass
      )
    );
  }

  /**
   * Inserts token class bits into encrypted token block and performs bit transpositions.
   * @param {string} encryptedTokenBlock - Encrypted 64-bit token block in binary.
   * @param {string} tokenClass - Binary string of class bits to be inserted.
   * @returns {string} - Modified token block with inserted and transposed class bits.
   */
  insertAndTranspositionClassBits(encryptedTokenBlock, tokenClass) {
    const withClassBits = tokenClass + encryptedTokenBlock;
    const tokenClassBits = tokenClass.split("");
    const tokenBlockBits = withClassBits.split("");

    // Transpose bits according to predefined positions
    const length = withClassBits.length;
    tokenBlockBits[length - 1 - 65] = tokenBlockBits[length - 1 - 28];
    tokenBlockBits[length - 1 - 64] = tokenBlockBits[length - 1 - 27];
    tokenBlockBits[length - 1 - 28] = tokenClassBits[0];
    tokenBlockBits[length - 1 - 27] = tokenClassBits[1];

    return tokenBlockBits.join("");
  }

  /**
   * Converts a binary string to hexadecimal format.
   * Ensures binary string length is a multiple of 4 by adding padding if necessary.
   * @param {string} binary - Binary string to convert.
   * @returns {string} - Hexadecimal representation of the binary string.
   */
  binToHex(binary) {
    while (binary.length % 4 !== 0) {
      binary = "0" + binary;
    }

    let hexString = "";
    for (let i = 0; i < binary.length; i += 4) {
      const fourBits = binary.substring(i, i + 4);
      const hexDigit = parseInt(fourBits, 2).toString(16);
      hexString += hexDigit;
    }

    return hexString;
  }

  /**
   * Converts a hexadecimal string to a byte array for CryptoJS.
   * @param {string} hex - Hexadecimal string to convert.
   * @returns {CryptoJS.lib.WordArray} - Byte array for CryptoJS.
   * @throws {Error} - If hex string length is not even.
   */
  hexToByteArray(hex) {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }

    return CryptoJS.enc.Hex.parse(hex);
  }

  /**
   * Converts a hexadecimal string to binary.
   * @param {string} hex - Hexadecimal string to convert.
   * @returns {string} - Binary string representation of the hex string.
   */
  hexToBin(hex) {
    return hex
      .split("")
      .map((hexDigit) => parseInt(hexDigit, 16).toString(2).padStart(4, "0"))
      .join("");
  }

  /**
   * Formats hex string as a number with dashes every 4 characters.
   * Useful for easier reading or transmission of the encrypted token.
   * @param {string} hex - Hexadecimal string to format.
   * @returns {string} - Formatted string with dashes.
   */
  hexToNumber(hex) {
    const tokenStr = BigInt(`0x${hex}`).toString();
    return tokenStr.replace(/(.{4})/g, "$1-").slice(0, -1);
  }
}

// Example usage
const decoderKeyBin =
  "1001101110111110001111101011111111000001110100001010101111000101"; // 64-bit binary decoder key in hex 9BBE3EBFC1D0ABC5
const tokenBlock =
  "0011010000100110110000000110100000110011100110101111010000111111"; // 64-bit binary token block get from token generator
const tokenClass = "00"; // Token class from token generator

const tokenEncryptor = new TokenEncryptor(tokenBlock, tokenClass);
console.log("Original token:", tokenEncryptor.binToHex(tokenBlock));

const encrypted = tokenEncryptor.encryptToken(decoderKeyBin);
console.log("Encrypted token in hex:", encrypted);

// Convert encrypted hex to number with dashes
const encryptedNumber = tokenEncryptor.hexToNumber(encrypted);
console.log("Encrypted token as number:", encryptedNumber);
