// main core function.js

/**
 * MainCoreFunction class provides core functions like creating a decoder key.
 */
class MainCoreFunction {
  /**
   * Creates a decoder key using VendingKey and DecoderKeyGenerator based on the serial number.
   * @param {string} serialNumberInput - The 11-digit serial number.
   * @param {Function} VendingKey - Class for generating the vending key.
   * @param {Function} DecoderKeyGenerator - Class for generating the decoder key.
   * @param {Object} HelperFunction - Helper functions including hexToBin.
   * @returns {Object} - Contains last seven digits and binary decoder key.
   */
  static createDecoderKey(
    serialNumberInput,
    VendingKey,
    DecoderKeyGenerator,
    HelperFunction
  ) {
    const vendingKey = new VendingKey(serialNumberInput).generateKey();

    let lastSevenDigits = serialNumberInput.slice(-7);
    while (parseInt(lastSevenDigits) > 1048575) {
      lastSevenDigits = lastSevenDigits.slice(1);
    }

    const decoderKeyGen = new DecoderKeyGenerator(
      vendingKey
    ).generateDecoderKey();
    const decoderKeyBin = HelperFunction.hexToBin(decoderKeyGen);

    return { lastSevenDigits, decoderKeyBin };
  }

  /**
   * Decrypts a token and extracts information based on the token number and decoder key.
   * @param {number} tokenNumber - The 20-digit token number to decrypt.
   * @param {string} decoderKeyBin - The binary decoder key for decryption.
   * @returns {Object} - Contains token amount and TID from the decrypted token.
   */
  static tokenDecryptor(tokenNumber, decoderKeyBin, TokenDecryptor) {
    const tokenDecryptor = new TokenDecryptor(tokenNumber);
    const decrypted = tokenDecryptor.decryptToken(decoderKeyBin);
    const { tokenAmount, tid } = tokenDecryptor.extractTokenInfo(decrypted);
    return { tokenAmount, tid };
  }
}

// Export MainCoreFunction as the default export
export default MainCoreFunction;
