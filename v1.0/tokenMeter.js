import CryptoJS from "crypto-js";

/**
 * Class for decrypting a token number using the CryptoJS library and DES algorithm.
 */
class TokenDecryptor {
  /**
   * @param {string} tokenNumber - A formatted token number (e.g., "3823-8437-4375-4099-7930").
   */
  constructor(tokenNumber) {
    this.tokenNumber = tokenNumber; // Store the token number
  }

  /**
   * Decrypts the token using the provided decoder key.
   * @param {string} decoderKey - A 64-bit binary string used as the decryption key.
   * @returns {string} - The decrypted token in binary format.
   * @throws {Error} - If the decoder key is not 64 bits long.
   */
  decryptToken(decoderKey) {
    if (decoderKey.length !== 64) {
      throw new Error("Decoder key must be a 64-bit binary string.");
    }

    // Convert decoder key from binary to a byte array
    const secretKey = this.hexToByteArray(this.binToHex(decoderKey));

    // Convert the token number to a BigInt and then to a hex string
    const bigIntTokenNumber = BigInt(this.tokenNumber.replace(/-/g, ""));
    const encryptedTokenHex = bigIntTokenNumber.toString(16).padStart(16, "0"); // Ensure it's 64 bits (16 hex digits)

    // Convert hex string to binary format
    const encryptedTokenBin = this.hexToBin(encryptedTokenHex);
    
    // Remove transposition and class bits from the binary token
    const removeTransposition = this.transpositionAndRemoveClassBits(
      this.transpositionAndRemoveClassBits(encryptedTokenBin)
    );
    
    // Convert back to hex for decryption
    const removeTranspositionHex = this.binToHex(removeTransposition);

    // Decrypt the token using DES algorithm
    const decrypted = CryptoJS.DES.decrypt(
      {
        ciphertext: CryptoJS.enc.Hex.parse(removeTranspositionHex),
      },
      secretKey,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }
    );

    // Convert decrypted data to hex and then to binary
    const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);
    const decryptedBin = this.hexToBin(decryptedHex);
    return decryptedBin; // Return the decrypted binary string
  }

  /**
   * Removes class bits from the token binary and performs transposition.
   * @param {string} tokenNumberBinary - The binary representation of the encrypted token.
   * @returns {string} - The modified binary string without class bits.
   */
  transpositionAndRemoveClassBits(tokenNumberBinary) {
    const blockBits = tokenNumberBinary.split("");
    // Transpose bits: move the first two bits to the end
    blockBits[tokenNumberBinary.length - 1 - 28] = blockBits[0];
    blockBits[tokenNumberBinary.length - 1 - 27] = blockBits[1];
    return blockBits.join("").substring(2); // Remove the first two bits (class bits)
  }

  /**
   * Extracts and logs information from the decrypted token block.
   * @param {string} decryptedTokenBlock - The decrypted binary string to extract information from.
   */
  extractTokenInfo(decryptedTokenBlock) {
    console.log(`Token subclass binary: ${decryptedTokenBlock.substring(0, 4)}`);
    console.log(`Token rnd binary: ${decryptedTokenBlock.substring(4, 8)}`);

    const tidBinary = decryptedTokenBlock.substring(8, 32);
    const minutesSinceBaseDate = this.binToDec(tidBinary);
    const baseDate = new Date("2020-01-01T00:00:00Z"); // Base date for token issue
    const issueDate = new Date(baseDate.getTime() + minutesSinceBaseDate * 60000);

    console.log(`Token tid binary: ${tidBinary}`);
    console.log(`Token Date of Issue: ${issueDate.toISOString().slice(0, 19).replace("T", " ")}`);

    const amountBinary = decryptedTokenBlock.substring(32, 48);
    const tokenAmount = this.binToDec(amountBinary) / 10.0;

    console.log(`Token amount binary: ${amountBinary}`);
    console.log(`Token amount in Kwh: ${tokenAmount.toFixed(2)}`);
    console.log(`Token crc binary: ${decryptedTokenBlock.substring(48, 64)}`);
  }

  // Helper methods

  /**
   * Converts a binary string to hexadecimal format.
   * @param {string} binary - The binary string to convert.
   * @returns {string} - The hexadecimal representation of the binary string.
   */
  binToHex(binary) {
    // Ensure binary string length is a multiple of 4
    while (binary.length % 4 !== 0) {
      binary = "0" + binary; // Pad with leading zeros
    }

    let hexString = "";

    // Convert every 4 bits to a hex digit
    for (let i = 0; i < binary.length; i += 4) {
      const fourBits = binary.substring(i, i + 4);
      const hexDigit = parseInt(fourBits, 2).toString(16);
      hexString += hexDigit;
    }

    return hexString; // Return hex string
  }

  /**
   * Converts a hexadecimal string to a byte array for CryptoJS.
   * @param {string} hex - The hexadecimal string to convert.
   * @returns {CryptoJS.lib.WordArray} - The byte array for CryptoJS.
   * @throws {Error} - If the hex string length is not even.
   */
  hexToByteArray(hex) {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }

    // Convert hex to byte array
    return CryptoJS.enc.Hex.parse(hex);
  }

  /**
   * Converts a hexadecimal string to binary format.
   * @param {string} hex - The hexadecimal string to convert.
   * @returns {string} - The binary representation of the hexadecimal string.
   */
  hexToBin(hex) {
    return hex
      .split("")
      .map((hexDigit) => parseInt(hexDigit, 16).toString(2).padStart(4, "0")) // Convert each hex digit to 4-bit binary
      .join(""); // Join all binary strings
  }

  /**
   * Converts a binary string to decimal format.
   * @param {string} binaryString - The binary string to convert.
   * @returns {number} - The decimal representation of the binary string.
   */
  binToDec(binaryString) {
    return parseInt(binaryString, 2); // Convert binary to decimal
  }
}

// Example usage
const decoderKeyBin = 
  "1001101110111110001111101011111111000001110100001010101111000101"; // 64-bit binary decoder key in hex 9BBE3EBFC1D0ABC5
const tokenNumber = "5992-7463-7470-4464-7112"; // Example token number get from token encryptor

const tokenDecryptor = new TokenDecryptor(tokenNumber);
console.log("Encrypted token as number:", tokenNumber);

// Decrypt the token using the provided decoder key
const decrypted = tokenDecryptor.decryptToken(decoderKeyBin);
tokenDecryptor.extractTokenInfo(decrypted);
