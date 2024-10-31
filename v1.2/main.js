import DecoderKeyGenerator from "./decoderKeyGenerator.js";
import HelperFunction from "./helperFunction.js";
import TokenEncryptor from "./tokenEncryptor.js";
import TokenGenerator from "./tokenGenerator.js";
import TokenDecryptor from "./tokenMeter.js";
import VendingKey from "./vendingKeyGenerate.js";

console.log(
  "======= THIS FUNCTION FOR GENERATE VENDING KEY AND DECODE KEY ======="
);
// create a vending key file from 11 digit serial number
const elevenDigitNumber = "45623123133";
new VendingKey(elevenDigitNumber).generateKey();

// create a decodeKey from vending key in the hex format
const keyType = "3"; // Example key type
const supplyGroupCode = "560983"; // Example supply group code
const tariffIndex = "01"; // Example tariff index
const keyRevisionNumber = "1"; // Example key revision number
const decoderReferenceNumber = "56728389217"; // Example decoder reference number

// Create an instance of the DecoderKeyGenerator with the specified parameters
const decoderKeyGen = new DecoderKeyGenerator(
  keyType,
  supplyGroupCode,
  tariffIndex,
  keyRevisionNumber,
  decoderReferenceNumber
);

// Generate the decoder key and log it to the console
await decoderKeyGen.generateDecoderKey(); // Wait for the key generation to complete
const decoderKeyHex = decoderKeyGen.getDecoderKeyHex(); // Get the key in uppercase
console.log("Decoder Key in Hex:", decoderKeyHex); // Log the key

// using helper foe convert the hex to bin
const decoderKeyBin = HelperFunction.hexToBin(decoderKeyHex);
console.log("Decoder Key in Bin:", decoderKeyBin);

console.log("\n\n");

console.log("======= PROCESS GENERATE NEW TOKEN, ENCRYPT, DECRYPT =======");

// generate new token
const tokenGenerator = new TokenGenerator();
const tokenBuild = await tokenGenerator.build64BitTokenBlock();

console.log("\n");

// preparation for create a decode key
const decodeKeyFixedHex = "9BBE3EBFC1D0ABC5";
console.log("Decoder Key in Hex:", decodeKeyFixedHex); // Log the key

// using helper for convert the hex to bin
const decoderKeyFixedBin = HelperFunction.hexToBin(decodeKeyFixedHex);
console.log("Decoder Key in Bin:", decoderKeyFixedBin);

// prepartion data for encryption and decryption
const tokenBlock = tokenBuild.token64BitBlock;
const tokenClass = tokenBuild.cls;

// start encryption

console.log("\n");

// Initialize TokenEncryptor with the token block and token class
const tokenEncryptor = new TokenEncryptor(tokenBlock, tokenClass);

// Display original token in hexadecimal format for comparison
console.log("Original token:", HelperFunction.binToHex(tokenBlock));

// Encrypt the token and output the encrypted result in hexadecimal format
const encrypted = tokenEncryptor.encryptToken(decoderKeyBin);
console.log("Encrypted token in hex:", encrypted);

// Convert encrypted hex string to formatted number with dashes for readability
const encryptedNumber = HelperFunction.hexToNumber(encrypted);
console.log("Encrypted token as number:", encryptedNumber);

// start decryption

console.log("\n");

console.log("Encrypted token as number:", encryptedNumber);

// Create an instance of TokenDecryptor with the token number
const tokenDecryptor = new TokenDecryptor(encryptedNumber);
// Decrypt the token using the provided decoder key
const decrypted = tokenDecryptor.decryptToken(decoderKeyBin);

// Extract and log token information from the decrypted result
tokenDecryptor.extractTokenInfo(decrypted);
