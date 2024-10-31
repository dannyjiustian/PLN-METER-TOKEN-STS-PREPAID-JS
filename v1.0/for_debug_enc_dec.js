import CryptoJS from 'crypto-js';

class TokenEncryptor {
  constructor(tokenBlock, tokenClass) {
    this.tokenBlock = tokenBlock; // This should be a binary string of 64 bits (8 bytes)
    this.tokenClass = tokenClass; // Not used in this function, but kept for context
  }

  // Encrypt function using CryptoJS
  encryptToken = (decoderKey) => {
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

    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  };

  // Decrypt function using CryptoJS, takes the encrypted token as a number
  decryptToken = (decoderKey, encryptedTokenNumber) => {
    if (decoderKey.length !== 64) {
      throw new Error("Decoder key must be a 64-bit binary string.");
    }

    const secretKey = this.hexToByteArray(this.binToHex(decoderKey));
    const encryptedTokenHex = encryptedTokenNumber.toString(16).padStart(16, "0");
    const encryptedTokenBin = this.hexToBin(encryptedTokenHex);
    const removeTransposition = this.transpositionAndRemoveClassBits(
      this.transpositionAndRemoveClassBits(encryptedTokenBin)
    );
    const removeTranspositionHex = this.binToHex(removeTransposition);

    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Hex.parse(removeTranspositionHex) },
      secretKey,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }
    );

    const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);
    return this.hexToBin(decryptedHex);
  };

  insertAndTranspositionClassBits = (encryptedTokenBlock, tokenClass) => {
    const withClassBits = tokenClass + encryptedTokenBlock;
    const tokenClassBits = tokenClass.split("");
    const tokenBlockBits = withClassBits.split("");

    const length = withClassBits.length;
    tokenBlockBits[length - 1 - 65] = tokenBlockBits[length - 1 - 28];
    tokenBlockBits[length - 1 - 64] = tokenBlockBits[length - 1 - 27];
    tokenBlockBits[length - 1 - 28] = tokenClassBits[0];
    tokenBlockBits[length - 1 - 27] = tokenClassBits[1];

    return tokenBlockBits.join("");
  };

  // Convert binary string to hexadecimal
  binToHex = (binary) => {
    while (binary.length % 4 !== 0) {
      binary = "0" + binary;
    }

    return binary.match(/.{1,4}/g)
      .map(fourBits => parseInt(fourBits, 2).toString(16))
      .join('');
  };

  // Convert hex string to byte array
  hexToByteArray = (hex) => {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string length");
    }

    return CryptoJS.enc.Hex.parse(hex);
  };

  // Convert hex string to binary
  hexToBin = (hex) =>
    hex
      .split("")
      .map(hexDigit => parseInt(hexDigit, 16).toString(2).padStart(4, "0"))
      .join("");

  // Convert hex to a number
  hexToNumber = (hex) => BigInt(`0x${hex}`);

  // Format a number with dashes every 4 digits
  formatTokenNumber = (tokenNumber) =>
    tokenNumber.toString().replace(/(.{4})/g, "$1-").slice(0, -1);

  extractTokenInfo = (decryptedTokenBlock) => {
    console.log(`Token subclass binary: ${decryptedTokenBlock.substring(0, 4)}`);
    console.log(`Token rnd binary: ${decryptedTokenBlock.substring(4, 8)}`);

    const tidBinary = decryptedTokenBlock.substring(8, 32);
    const minutesSinceBaseDate = this.binToDec(tidBinary);
    const baseDate = new Date("2020-01-01T00:00:00Z");
    const issueDate = new Date(baseDate.getTime() + minutesSinceBaseDate * 60000);

    console.log(`Token tid binary: ${tidBinary}`);
    console.log(`Token Date of Issue: ${issueDate.toISOString().slice(0, 19).replace("T", " ")}`);

    const amountBinary = decryptedTokenBlock.substring(32, 48);
    const tokenAmount = this.binToDec(amountBinary) / 10.0;

    console.log(`Token amount binary: ${amountBinary}`);
    console.log(`Token amount in Kwh: ${tokenAmount.toFixed(2)}`);
    console.log(`Token crc binary: ${decryptedTokenBlock.substring(48, 64)}`);
  };

  transpositionAndRemoveClassBits = (tokenNumberBinary) => {
    const blockBits = tokenNumberBinary.split("");
    blockBits[tokenNumberBinary.length - 1 - 28] = blockBits[0];
    blockBits[tokenNumberBinary.length - 1 - 27] = blockBits[1];
    return blockBits.join("").substring(2);
  };

  // Convert binary to decimal
  binToDec = (binaryString) => parseInt(binaryString, 2);
}

// Example usage
const decoderKeyBin = "1001101111001000000010010110001100011110000111001100110111000101";
const tokenBlock = "0011101000100110110000000101000100111011000001100111111011101001";

const tokenEncryptor = new TokenEncryptor(tokenBlock, "00");
const encrypted = tokenEncryptor.encryptToken(decoderKeyBin);
console.log(tokenEncryptor.binToHex(tokenBlock));
console.log("Encrypted token in hex:", encrypted);

const encryptedBin = tokenEncryptor.hexToBin(encrypted);
console.log(encryptedBin);

const transposition = tokenEncryptor.insertAndTranspositionClassBits(
  encryptedBin,
  "00"
);
console.log(transposition);

const transpositionHex = tokenEncryptor.binToHex(transposition);
console.log(transpositionHex);

const encryptedNumber = tokenEncryptor.hexToNumber(transpositionHex);
console.log("Encrypted token as number:", tokenEncryptor.formatTokenNumber(encryptedNumber.toString()));

const decrypted = tokenEncryptor.decryptToken(decoderKeyBin, encryptedNumber);
console.log("Decrypted token in binary:", decrypted);

console.log("\n\n");

tokenEncryptor.extractTokenInfo(decrypted);


// const encryptedTokenBlock = "1100011000110100010101101110100001111001000010101100100100010100";
// const tokenClass = "00";

// function insertAndTranspositionClassBits(encryptedTokenBlock, tokenClass) {
//     const withClassBits = tokenClass + encryptedTokenBlock; // Concatenate tokenClass and encryptedTokenBlock
//     const tokenClassBits = tokenClass.split(""); // Split tokenClass into bits
//     const tokenBlockBits = withClassBits.split(""); // Split the concatenated string into bits

//     // Calculate indices for transposition
//     const length = withClassBits.length;
//     tokenBlockBits[length - 1 - 65] = tokenBlockBits[length - 1 - 28]; // Move bit from index length-28 to length-65
//     tokenBlockBits[length - 1 - 64] = tokenBlockBits[length - 1 - 27]; // Move bit from index length-27 to length-64
//     tokenBlockBits[length - 1 - 28] = tokenClassBits[0]; // Insert first class bit at index length-28
//     tokenBlockBits[length - 1 - 27] = tokenClassBits[1]; // Insert second class bit at index length-27

//     return tokenBlockBits.join(""); // Join the bits back into a string and return
// }

// function transpositionAndRemoveClassBits(tokenNumberBinary) {
//     const blockBits = tokenNumberBinary.split("");
//     blockBits[tokenNumberBinary.length - 1 - 28] = blockBits[0];
//     blockBits[tokenNumberBinary.length - 1 - 27] = blockBits[1];
//     return blockBits.join("").substring(2); // Remove the first two bits (class bits)
// }

// // Insert and Transpose Class Bits
// const newToken = insertAndTranspositionClassBits(encryptedTokenBlock, tokenClass);
// console.log("New Token with Class Bits:", newToken);

// // Transpose and Remove Class Bits
// const finalToken = transpositionAndRemoveClassBits(newToken);
// console.log("Final Token after Removal:", finalToken);

// function binaryToHex(binaryString) {
//     // Pastikan panjang string biner adalah kelipatan 4
//     // Jika tidak, tambahkan padding nol di depan
//     while (binaryString.length % 4 !== 0) {
//         binaryString = '0' + binaryString;
//     }

//     let hexString = '';

//     // Loop melalui string biner 4 bit sekaligus
//     for (let i = 0; i < binaryString.length; i += 4) {
//         // Ambil 4 bit
//         const fourBits = binaryString.substring(i, i + 4);
//         // Konversi 4 bit ke desimal, kemudian ke hexadecimal
//         const hexDigit = parseInt(fourBits, 2).toString(16).toUpperCase();
//         hexString += hexDigit;
//     }

//     return hexString;
// }

// // Contoh penggunaan
// const binaryInput = '1100011000110100010101101110100001111001000010101100100100010100';
// const hexOutput = binaryToHex(binaryInput);
