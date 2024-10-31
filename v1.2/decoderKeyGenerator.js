// decoderKeyGenerator.js

// Importing CryptoJS for DES encryption/decryption operations
import CryptoJS from "crypto-js";
// Importing fs for manipulation a file
import fs from "fs";

/**
 * Class for generating a decoder key for Standard Transfer Specification.
 * This class constructs a control block and a PAN block, performs XOR operations,
 * and uses DES encryption to generate a 64-bit decoder key.
 */
class DecoderKeyGenerator {
  constructor(
    keyType,
    supplyGroupCode,
    tariffIndex,
    keyRevisionNumber,
    decoderReferenceNumber
  ) {
    this.controlBlock = ""; // Control block to be constructed as a hex string
    this.panBlock = ""; // PAN block to be constructed as a hex string
    this.decoderKeyHex = ""; // The final generated decoder key in hex format

    // Issuer Identification Numbers
    this.IIN_1 = "0000"; // Default IIN for a 13-digit decoder reference number
    this.IIN_2 = "600727"; // Alternative IIN for an 11-digit decoder reference number

    // Initialize parameters from constructor arguments
    this.keyType = keyType; // The type of key being generated
    this.supplyGroupCode = supplyGroupCode; // The supply group code
    this.tariffIndex = tariffIndex; // The index of the tariff
    this.keyRevisionNumber = keyRevisionNumber; // The revision number of the key
    this.decoderReferenceNumber = decoderReferenceNumber; // The reference number for the decoder
  }

  /**
   * Gets the generated decoder key in hexadecimal format.
   * @return {string} - The decoder key in hex.
   */
  getDecoderKeyHex() {
    return this.decoderKeyHex; // Return the current value of the decoder key
  }

  /**
   * Builds the control block, a 16-digit hex string.
   * The control block consists of the key type, supply group code,
   * tariff index, key revision number, and fills the rest with 0xF.
   */
  buildControlBlock() {
    const builder = []; // Initialize an array to hold the components of the control block
    builder.push(this.keyType); // Add key type to the builder array
    builder.push(this.supplyGroupCode); // Add supply group code to the builder array
    builder.push(this.tariffIndex); // Add tariff index to the builder array
    builder.push(this.keyRevisionNumber); // Add key revision number to the builder array
    builder.push("F".repeat(6)); // Fill the remaining part with 'F' repeated 6 times

    this.controlBlock = builder.join(""); // Join the array elements into a single string
  }

  /**
   * Builds the PAN block based on the decoder reference number.
   * The PAN block consists of an IIN (Issuer Identification Number)
   * and the decoder reference number.
   */
  buildPanBlock() {
    const builder = []; // Initialize an array for the PAN block
    // Determine which IIN to use based on the length of the decoder reference number
    builder.push(
      this.decoderReferenceNumber.length === 11
        ? this.IIN_2.substring(1)
        : this.IIN_1
    );
    builder.push(this.decoderReferenceNumber); // Add the decoder reference number

    this.panBlock = builder.join(""); // Join the PAN block components into a single string
  }

  /**
   * Reads the vending key from a key file.
   * The vending key is expected to be in base64 format.
   * @return {Promise<CryptoJS.lib.WordArray>} - The vending key as a CryptoJS WordArray.
   */
  async getVendingKey() {
    // Read the vending key from the specified key file
    const keyData = await fs.promises.readFile("VendingKey.key", "utf-8");
    // Parse the base64 string into a CryptoJS WordArray
    return CryptoJS.enc.Base64.parse(keyData.trim());
  }

  /**
   * Performs XOR operation on two WordArrays.
   * This method takes two CryptoJS WordArrays and performs a bitwise XOR operation
   * on them, returning the resulting WordArray.
   * @param {CryptoJS.lib.WordArray} block1 - The first WordArray to XOR.
   * @param {CryptoJS.lib.WordArray} block2 - The second WordArray to XOR.
   * @return {CryptoJS.lib.WordArray} - The result of the XOR operation.
   */
  xor(block1, block2) {
    const result = CryptoJS.lib.WordArray.create(); // Create a new WordArray for the result
    const len = Math.min(block1.words.length, block2.words.length); // Get the minimum length of the two blocks

    // Perform XOR operation on each corresponding word in the blocks
    for (let i = 0; i < len; i++) {
      result.words[i] = block1.words[i] ^ block2.words[i]; // XOR operation
    }

    result.sigBytes = len * 4; // Update the number of significant bytes in the result
    return result; // Return the resulting WordArray
  }

  /**
   * DES encryption method using CryptoJS.
   * This method encrypts the provided source data using DES algorithm
   * with the provided key in ECB mode without padding.
   * @param {CryptoJS.lib.WordArray} source - The source data to encrypt.
   * @param {CryptoJS.lib.WordArray} key - The encryption key to use.
   * @return {CryptoJS.lib.WordArray} - The encrypted data as a WordArray.
   */
  encrypt(source, key) {
    // Encrypt the source data using DES algorithm with the provided key
    return CryptoJS.DES.encrypt(source, key, {
      mode: CryptoJS.mode.ECB, // Use ECB mode for encryption
      padding: CryptoJS.pad.NoPadding, // No padding for the input data
    }).ciphertext; // Return only the ciphertext part of the result
  }

  /**
   * Generates the decoder key.
   * This method orchestrates the creation of the PAN and control blocks,
   * performs XOR operations, and generates the final decoder key through
   * DES encryption and further XOR operations.
   */
  async generateDecoderKey() {
    this.buildPanBlock(); // Create the PAN block first
    this.buildControlBlock(); // Create the control block next

    // Convert the PAN and control blocks from hex strings to WordArrays
    const panBlockBytes = CryptoJS.enc.Hex.parse(this.panBlock);
    const controlBlockBytes = CryptoJS.enc.Hex.parse(this.controlBlock);
    // Perform XOR between the PAN and control blocks
    const panControlXorResult = this.xor(panBlockBytes, controlBlockBytes);

    const vendingKey = await this.getVendingKey(); // Retrieve the vending key
    // Encrypt the XOR result using the vending key
    const encryptionResult = this.encrypt(panControlXorResult, vendingKey);

    // XOR the encrypted result with the original XOR result
    const encryptedResultXor = this.xor(
      panControlXorResult,
      CryptoJS.enc.Hex.parse(encryptionResult.toString(CryptoJS.enc.Hex))
    );

    // Generate the final 64-bit decoder key by XORing the vending key with the result
    this.decoderKeyHex = CryptoJS.enc.Hex.stringify(
      this.xor(vendingKey, encryptedResultXor)
    ).toUpperCase(); // Convert to hex and store in uppercase
  }
}

export default DecoderKeyGenerator;

// // Example usage:
// const keyType = "3"; // Example key type
// const supplyGroupCode = "560983"; // Example supply group code
// const tariffIndex = "01"; // Example tariff index
// const keyRevisionNumber = "1"; // Example key revision number
// const decoderReferenceNumber = "56728389217"; // Example decoder reference number

// // Create an instance of the DecoderKeyGenerator with the specified parameters
// const decoderKeyGen = new DecoderKeyGenerator(
//   keyType,
//   supplyGroupCode,
//   tariffIndex,
//   keyRevisionNumber,
//   decoderReferenceNumber
// );
// // Generate the decoder key and log it to the console
// decoderKeyGen.generateDecoderKey().then(() => {
//   console.log(decoderKeyGen.getDecoderKeyHex()); // Output the decoder key in uppercase
// });
