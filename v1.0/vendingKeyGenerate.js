import CryptoJS from 'crypto-js';
import { writeFileSync } from 'fs';

/**
 * Function to generate a 64-bit DES key from an 11-digit number and write it to a file.
 * @param {string} number - The 11-digit number to use as the key.
 */
const generateKey = (number) => {
    // Ensure the number is a string and has at least 11 characters
    if (typeof number !== 'string' || number.length !== 11) {
        throw new Error('The key must be an 11-digit number as a string.');
    }

    // Convert the number to a 64-bit DES key by padding or truncating as necessary
    const paddedKey = number.padEnd(16, '0').slice(0, 16); // Pad with zeros to ensure it's 16 characters long

    // Convert the padded key into a WordArray for CryptoJS
    const keyWordArray = CryptoJS.enc.Utf8.parse(paddedKey); // Use UTF-8 encoding to parse the string

    // Encode the key in Base64
    const encodedKey = CryptoJS.enc.Base64.stringify(keyWordArray); // Convert WordArray to Base64

    // Write the generated key to a file
    writeFileSync('VendingKey.key', encodedKey, 'utf8');
    console.log('Key generated and written to VendingKey.key');
};

/**
 * Main function
 */
const main = () => {
    const elevenDigitNumber = '45623123133'; // The 11-digit number to use as the key
    try {
        generateKey(elevenDigitNumber); // Pass the number to the key generation function
    } catch (error) {
        console.error('Error generating key:', error);
    }
};

// Run the main function
main();
