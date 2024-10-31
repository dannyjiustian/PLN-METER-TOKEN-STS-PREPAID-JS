// tokenGenerator.js

// Importing Buffer for create a buffer data
import { Buffer } from "buffer";
// Importing HelperFunction to assist with dec, hex and binary transformations
import HelperFunction from "./helperFunction.js";

/**
 * Class demonstrating generation of token block before it proceeds to encryption.
 */
class TokenGenerator {
  /**
   * Initializes the class with default values for token parameters.
   * `tokenClass` and `tokenSubClass` are set to predefined values.
   * `random` is a fixed random number, `utilityAmount` is the monetary amount in this context.
   * `issueDateTime` is the current timestamp, and `baseDate` is set to a fixed date (2020-01-01).
   */
  constructor(tid, amount) {
    this.tokenClass = 0; // between 0 and 3 for type class
    this.tokenSubClass = 3; // between 0 and 15 for type sub class
    this.random = Math.floor(Math.random() * 4096); // between 0 and 4095 for random
    this.tid = tid; // between 0 and 1048575 for tid
    this.utilityAmount = amount; // between 0 and 1820162.4 for amount in kWh
  }

  /**
   * Determines the exponent based on the complemented amount.
   * The exponent dictates the scaling factor to be applied for the mantissa calculation.
   * @param {number} amount - The complemented monetary amount.
   * @return {number} - The exponent value (0 to 3).
   */
  getExponent(amount) {
    if (amount <= 16383) return 0;
    if (amount <= 180214) return 1;
    if (amount <= 1818524) return 2;
    return 3;
  }

  /**
   * Calculates the mantissa by adjusting the amount based on the exponent.
   * The mantissa represents the fractional part of the value after scaling by the exponent.
   * @param {number} exponent - The scaling factor exponent.
   * @param {number} amount - The complemented monetary amount.
   * @return {number} - The calculated mantissa value.
   */
  getMantissa(exponent, amount) {
    if (exponent === 0) return amount;

    let rhsSum = 0;
    for (let i = 1; i <= exponent; i++) {
      rhsSum += Math.pow(2, 14) * Math.pow(10, i - 1);
    }
    return (amount - rhsSum) / Math.pow(10, exponent);
  }

  /**
   * Generates a 2-bit binary string representing the token class.
   * This binary string is part of the final token block.
   * @return {string} - 2-bit binary string of the token class.
   */
  getClassBlock() {
    return HelperFunction.decToBin(this.tokenClass, 2);
  }

  /**
   * Generates a 4-bit binary string for a fixed random value.
   * This adds an element of randomness to the token.
   * @return {string} - 4-bit binary string of the random value.
   */
  getRNDBlock() {
    return HelperFunction.decToBin(this.random, 12);
  }

  /**
   * Calculates a 24-bit binary string for the Token Identifier (TID).
   * This represents the time difference in minutes from the base date to the issue date.
   * @return {string} - 24-bit binary string of the TID.
   */
  getTIDBlock() {
    const tid = this.tid;
    return HelperFunction.decToBin(tid, 20);
  }

  /**
   * Generates a 16-bit binary string for the amount block.
   * Combines the exponent and mantissa to represent the monetary amount.
   * @return {string} - 16-bit binary string of the amount.
   */
  getAmountBlock() {
    const complementedAmount = Math.floor(this.utilityAmount * 10);
    const exponent = this.getExponent(complementedAmount);
    const mantissa = this.getMantissa(exponent, complementedAmount);
    return (
      HelperFunction.decToBin(exponent, 2) +
      HelperFunction.decToBin(mantissa, 14)
    );
  }

  /**
   * Calculates a 16-bit CRC (Cyclic Redundancy Check) for error detection.
   * The CRC ensures integrity of the data by checking for modifications or errors.
   * @param {Buffer} datablock - The data buffer to compute CRC over.
   * @return {string} - 16-bit binary CRC result.
   */
  calculateCRC16(datablock) {
    let crc = 0xffff;
    for (const bt of datablock) {
      crc ^= bt & 0x00ff;
      for (let i = 0; i < 8; i++) {
        const bitIsOne = (crc & 1) === 1;
        crc >>= 1;
        if (bitIsOne) crc ^= 0xa001;
      }
    }
    return HelperFunction.decToBin(crc, 16);
  }

  /**
   * Concatenates multiple strings into a single binary string.
   * Useful for constructing larger binary strings from smaller parts.
   * @param {...string} vars - Binary strings to concatenate.
   * @return {string} - Concatenated binary string.
   */
  buildString(...vars) {
    return vars.join("");
  }

  /**
   * Computes the CRC for an initial 50-bit binary block and pads to 56 bits.
   * @param {string} initial50BitBlock - 50-bit binary string to compute CRC on.
   * @return {string} - 16-bit binary CRC result.
   */
  getCRCBlock(initial50BitBlock) {
    let hex = HelperFunction.binToHex(initial50BitBlock).padStart(14, "0");
    return this.calculateCRC16(HelperFunction.hexToByteArray(hex));
  }

  /**
   * Builds the complete 64-bit token block, ready for encryption.
   * It includes all necessary binary segments (class, subclass, random, TID, amount, CRC).
   * @throws {Error} - Throws if any part of the token generation fails.
   */
  build64BitTokenBlock() {
    const cls = this.getClassBlock();
    const rndBlock = this.getRNDBlock();
    const tidBlock = this.getTIDBlock();
    const amountBlock = this.getAmountBlock();
    const crcBlock = this.getCRCBlock(
      this.buildString(cls, rndBlock, tidBlock, amountBlock)
    );
    const token64BitBlock = this.buildString(
      rndBlock,
      tidBlock,
      amountBlock,
      crcBlock
    );

    return { token64BitBlock, cls };
  }
}

// Export TokenGenerator as the default export
export default TokenGenerator;
