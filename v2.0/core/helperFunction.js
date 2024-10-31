// helperFunction.js

// Import the Buffer module for conversions to and from byte arrays
import { Buffer } from "buffer";

/**
 * Class for helper of all the funtion used.
 */
class HelperFunction {
  /**
   * Converts a binary string to a decimal number
   * @param {string} binary
   * @returns {number}
   */
  static binToDec(binary) {
    return parseInt(binary, 2);
  }

  /**
   * Converts a decimal number to a binary string with specified bits
   * @param {number} decimal
   * @param {number} numBits
   * @returns {string}
   */
  static decToBin(decimal, numBits) {
    const binary = decimal.toString(2);
    return this.getPaddedString(binary, numBits);
  }

  /**
   * Converts a binary string to a hexadecimal string.
   * Pads the binary string with leading zeros to ensure a length divisible by 4.
   * @param {string} binary - Binary string to convert.
   * @return {string} - Hexadecimal representation of the binary string.
   */
  static binToHex(binary) {
    while (binary.length % 4 !== 0) {
      binary = "0" + binary;
    }
    return binary
      .match(/.{4}/g)
      .map((bits) => parseInt(bits, 2).toString(16))
      .join("");
  }

  /**
   * Pads a binary string to the left with '0' to a specified minimum length
   * @param {string} binary
   * @param {number} minLength
   * @returns {string}
   */
  static getPaddedString(binary, minLength) {
    return binary.padStart(minLength, "0");
  }

  /**
   * Converts a hex string to a byte array
   * @param {string} hex
   * @returns {Uint8Array}
   */
  static hexToByteArray(hex) {
    return Uint8Array.from(Buffer.from(hex, "hex"));
  }

  /**
   * Converts a byte array to a hex string, assuming the array represents a 64-bit long integer
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  static byteArrayToHex(bytes) {
    const buffer = Buffer.from(bytes);
    return buffer.readBigUInt64BE().toString(16).toUpperCase();
  }

  /**
   * Converts a byte array to a hex string
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  static bytesToHex(bytes) {
    return Array.from(bytes, (byte) => {
      const hex = byte.toString(16);
      return hex.padStart(2, "0");
    }).join("");
  }

  /**
   * Converts a hexadecimal string to binary.
   * @param {string} hex - Hexadecimal string to convert.
   * @returns {string} - Binary string representation of the hex string.
   */
  static hexToBin(hex) {
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
  static hexToNumber(hex) {
    const tokenStr = BigInt(`0x${hex}`).toString();
    return tokenStr.replace(/(.{4})/g, "$1-").slice(0, -1);
  }

  /**
   * Converts a hexadecimal string to a byte array for CryptoJS.
   * @param {string} hex - Hexadecimal string to convert.
   * @returns {CryptoJS.lib.WordArray} - Byte array for CryptoJS.
   * @throws {Error} - If hex string length is not even.
   */
  static hexParseCryptoJS(hex, cryptoJS) {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }

    return cryptoJS.enc.Hex.parse(hex);
  }
}

// Export HelperFunction as the default export
export default HelperFunction;
