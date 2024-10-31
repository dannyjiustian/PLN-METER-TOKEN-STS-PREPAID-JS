import { Buffer } from "buffer";
import { DateTime } from "luxon";

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
  constructor() {
    this.tokenClass = 0;
    this.tokenSubClass = 3;
    this.random = 4;
    this.utilityAmount = 1321.0;
    this.issueDateTime = DateTime.now();
    this.baseDate = DateTime.fromObject({ year: 2020, month: 1, day: 1 });
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
    return this.decToBin(this.tokenClass, 2);
  }

  /**
   * Generates a 4-bit binary string representing the token subclass.
   * This binary string differentiates subcategories of the token class.
   * @return {string} - 4-bit binary string of the token subclass.
   */
  getSubclassBlock() {
    return this.decToBin(this.tokenSubClass, 4);
  }

  /**
   * Generates a 4-bit binary string for a fixed random value.
   * This adds an element of randomness to the token.
   * @return {string} - 4-bit binary string of the random value.
   */
  getRNDBlock() {
    return this.decToBin(this.random, 4);
  }

  /**
   * Calculates a 24-bit binary string for the Token Identifier (TID).
   * This represents the time difference in minutes from the base date to the issue date.
   * @return {string} - 24-bit binary string of the TID.
   */
  getTIDBlock() {
    const minutes = Math.floor(
      this.issueDateTime.diff(this.baseDate, "minutes").minutes
    );
    return this.decToBin(minutes, 24);
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
    return this.decToBin(exponent, 2) + this.decToBin(mantissa, 14);
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
    return this.decToBin(crc, 16);
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
  async getCRCBlock(initial50BitBlock) {
    let hex = this.binToHex(initial50BitBlock).padStart(14, "0");
    return this.calculateCRC16(this.hexToByteArray(hex));
  }

  /**
   * Builds the complete 64-bit token block, ready for encryption.
   * It includes all necessary binary segments (class, subclass, random, TID, amount, CRC).
   * @throws {Error} - Throws if any part of the token generation fails.
   */
  async build64BitTokenBlock() {
    const cls = this.getClassBlock();
    const subclass = this.getSubclassBlock();
    const rndBlock = this.getRNDBlock();
    const tidBlock = this.getTIDBlock();
    const amountBlock = this.getAmountBlock();
    const crcBlock = await this.getCRCBlock(
      this.buildString(cls, subclass, rndBlock, tidBlock, amountBlock)
    );
    const token64BitBlock = this.buildString(
      subclass,
      rndBlock,
      tidBlock,
      amountBlock,
      crcBlock
    );

    console.log("Token Class Binary:", cls);
    console.log("Token Subclass Binary:", subclass);
    console.log("Token RND Binary:", rndBlock);
    console.log("Token TID Binary:", tidBlock);
    console.log("Token Amount Binary:", amountBlock);
    console.log("Token CRC Binary:", crcBlock);
    console.log("64-bit Block ready for encryption:", token64BitBlock);
  }

  /**
   * Converts a decimal number to a binary string of specified length.
   * Pads the result with leading zeros if necessary.
   * @param {number} num - Decimal number to convert.
   * @param {number} bits - Number of bits for the output binary string.
   * @return {string} - Binary string with specified bit length.
   */
  decToBin(num, bits) {
    return num.toString(2).padStart(bits, "0");
  }

  /**
   * Converts a binary string to a hexadecimal string.
   * Pads the binary string with leading zeros to ensure a length divisible by 4.
   * @param {string} binary - Binary string to convert.
   * @return {string} - Hexadecimal representation of the binary string.
   */
  binToHex(binary) {
    while (binary.length % 4 !== 0) {
      binary = "0" + binary;
    }
    return binary
      .match(/.{4}/g)
      .map((bits) => parseInt(bits, 2).toString(16))
      .join("");
  }

  /**
   * Converts a hexadecimal string to a Buffer byte array.
   * Each two hexadecimal characters (1 byte) become a Buffer element.
   * @param {string} hexStr - Hexadecimal string to convert.
   * @return {Buffer} - Buffer containing byte values.
   */
  hexToByteArray(hexStr) {
    return Buffer.from(hexStr.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
  }
}

// Example usage
const tokenGenerator = new TokenGenerator();
await tokenGenerator.build64BitTokenBlock();