// main helperFunction.js

/**
 * Class for generating a decoder key for Standard Transfer Specification.
 * This class constructs a control block and a PAN block, performs XOR operations,
 * and uses DES encryption to generate a 64-bit decoder key.
 */
class MainHelperFunction {
  /**
   * Calculate the total amount including admin fees.
   * @param {number} amount - The original amount before fees.
   * @returns {number} - The total amount including any applicable admin fees.
   */
  static calculateTotal(amount) {
    const adminFee = MainHelperFunction.getAdminFee(amount); // Retrieve the applicable admin fee based on the amount
    return amount + adminFee; // Total amount is the original amount plus the calculated admin fee
  }

  /**
   * Determine the admin fee based on the given amount.
   * @param {number} amount - The original amount to check for admin fee.
   * @returns {number} - The applicable admin fee.
   */
  static getAdminFee(amount) {
    if (amount === 20000 || amount === 50000) {
      return 2500; // Fixed fee for amounts of 20,000 or 50,000
    } else if (amount >= 100000 && amount <= 500000) {
      return 3000; // Fee for amounts between 100,000 and 500,000
    } else if (amount === 1000000) {
      return 3500; // Fixed fee for the maximum amount of 1,000,000
    }
    return 0; // No fee for other amounts
  }

  /**
   * Format a number as Indonesian Rupiah currency.
   * @param {number} amount - The amount to format as currency.
   * @returns {string} - The formatted currency string in Rupiah.
   */
  static formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", // Specifies that the number will be formatted as currency
      currency: "IDR", // Specifies the currency code for Indonesian Rupiah
      minimumFractionDigits: 0, // No decimal places for currency formatting
      maximumFractionDigits: 0, // No decimal places for currency formatting
    }).format(amount); // Return the formatted amount as a currency string
  }

  /**
   * Calculate total kWh based on the amount paid.
   * @param {number} amount - The amount paid to determine kWh.
   * @returns {number} - The total kWh calculated from the amount.
   */
  static calculateKwh(amount) {
    const pricePerKwh = 1444; // Harga per kWh
    const kWh = Math.round((amount / pricePerKwh) * 10) / 10; // Menghitung kWh dan membulatkan ke satu angka di belakang koma
    return parseFloat(kWh.toFixed(2)); // Menghasilkan 2 angka di belakang koma
  }

  /**
   * Check if a token has already been used for a specific serial number.
   * @param {string} path - The file path where tokens are stored.
   * @param {string} serialNumber - The serial number to check against.
   * @param {string} token - The token to verify usage.
   * @returns {boolean} - Returns true if the token has been used; otherwise, false.
   */
  static isTokenUsed(fs, path, serialNumber, token) {
    if (!fs.existsSync(path)) return false; // If the file doesn't exist, the token hasn't been used

    const tokens = JSON.parse(fs.readFileSync(path, "utf8")); // Read the existing tokens from the file
    // Check if the specified token has been used for the given serial number
    return tokens.some(
      (item) =>
        item.serial_number === serialNumber && item.token_used.includes(token)
    );
  }

  /**
   * Save token usage data to the specified path.
   * @param {string} path - The file path where token data will be stored.
   * @param {string} serialNumber - The serial number associated with the token.
   * @param {string} token - The token to save.
   * @param {boolean} generateToken - Flag to indicate if a new token is generated.
   * @param {number} new_kWh - The new kWh value to update, if applicable.
   * @returns {boolean} - Returns true if the save operation was successful.
   */
  static saveTokenData(
    fs,
    path,
    serialNumber,
    token,
    generateToken = false,
    new_kWh = 0
  ) {
    // Load existing tokens or initialize an empty array
    const tokens = fs.existsSync(path)
      ? JSON.parse(fs.readFileSync(path, "utf8"))
      : [];

    const record = tokens.find((item) => item.serial_number === serialNumber); // Find an existing record for the serial number

    if (record) {
      record.token_used.push(token); // Add the new token to the existing record
      if (generateToken) {
        record.last_kWh = (record.last_kWh || 0) + new_kWh; // Update last_kWh if generating a new token
      }
    } else {
      // Create a new entry if no existing record was found
      const newEntry = {
        serial_number: serialNumber,
        token_used: [token], // Start with the current token in the token_used array
        ...(generateToken && { last_kWh: new_kWh }), // Include last_kWh if generating a token
      };
      tokens.push(newEntry); // Add the new entry to the tokens array
    }

    fs.writeFileSync(path, JSON.stringify(tokens)); // Save all tokens back to the file
    return true; // Indicate a successful save operation
  }

  /**
   * Read the last kWh based on the serial number.
   * @param {string} path - The file path where token data is stored.
   * @param {string} serialNumber - The serial number to check for last kWh.
   * @returns {number|null} - Returns the last kWh for the serial number or 0 if not found.
   */
  static readLastKWh(fs, path, serialNumber) {
    if (!fs.existsSync(path)) return null; // Return null if the file doesn't exist

    const tokens = JSON.parse(fs.readFileSync(path, "utf8")); // Read token data from the file
    // Return the last_kWh for the specified serial number or 0 if not found
    return (
      tokens.find((item) => item.serial_number === serialNumber)?.last_kWh ?? 0
    );
  }
}

export default MainHelperFunction;
