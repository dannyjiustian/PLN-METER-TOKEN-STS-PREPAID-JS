// for debugging

import chalk from "chalk";
import readline from "readline/promises";
import fs from "fs";

import DecoderKeyGenerator from "./core/decoderKeyGenerator.js";
import HelperFunction from "./core/helperFunction.js";
import TokenEncryptor from "./core/tokenEncryptor.js";
import TokenGenerator from "./core/tokenGenerator.js";
import TokenDecryptor from "./core/tokenDecryptor.js";
import VendingKey from "./core/vendingKeyGenerate.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ASCII Art for header
const printBanner = () => {
  console.log(
    chalk.greenBright(`
########################################################################################
#                                                                                      #
#    ██╗  ██╗██╗    ██╗██╗  ██╗    ███╗   ███╗███████╗████████╗███████╗██████╗         #
#    ██║ ██╔╝██║    ██║██║  ██║    ████╗ ████║██╔════╝╚══██╔══╝██╔════╝██╔══██╗        #
#    █████╔╝ ██║ █╗ ██║███████║    ██╔████╔██║█████╗     ██║   █████╗  ██████╔╝        #
#    ██╔═██╗ ██║███╗██║██╔══██║    ██║╚██╔╝██║██╔══╝     ██║   ██╔══╝  ██╔══██╗        #
#    ██║  ██╗╚███╔███╔╝██║  ██║    ██║ ╚═╝ ██║███████╗   ██║   ███████╗██║  ██║        #
#    ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝    ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝        #
#                                                                                      #
#    ███████╗██╗███╗   ███╗██╗   ██╗██╗      █████╗ ████████╗██╗ ██████╗ ███╗   ██╗    #
#    ██╔════╝██║████╗ ████║██║   ██║██║     ██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║    #
#    ███████╗██║██╔████╔██║██║   ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║    #
#    ╚════██║██║██║╚██╔╝██║██║   ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║    #
#    ███████║██║██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║    #
#    ╚══════╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝    #
#                                                                                      #
########################################################################################
    `)
  );
};

// Fungsi untuk menghitung total dengan biaya admin
const calculateTotal = (amount) => {
  let adminFee = 0;
  if (amount === 20000 || amount === 50000) {
    adminFee = 2500;
  } else if (amount >= 100000 && amount <= 500000) {
    adminFee = 3000;
  } else if (amount === 1000000) {
    adminFee = 3500;
  }
  const totalAmount = amount + adminFee;
  return totalAmount;
};

// Fungsi untuk memformat angka sebagai mata uang Rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Fungsi untuk menghitung total kWh
const calculateKwh = (amount) => {
  const pricePerKwh = 1444; // Harga per kWh
  const kWh = Math.round((amount / pricePerKwh) * 10) / 10; // Menghitung kWh dan membulatkan ke satu angka di belakang koma
  return parseFloat(kWh.toFixed(2)); // Menghasilkan 2 angka di belakang koma
};

// Fungsi untuk mengecek apakah token sudah terpakai
const isTokenUsed = (path, serialNumber, token) => {
  if (!fs.existsSync(path)) return false; // Jika file tidak ada, token belum pernah digunakan

  const tokens = JSON.parse(fs.readFileSync(path, "utf8"));
  return tokens.some(
    (item) =>
      item.serial_number === serialNumber && item.token_used.includes(token)
  );
};

// Fungsi untuk menyimpan data
const saveTokenData = (
  path,
  serialNumber,
  token,
  generateToken = false,
  new_kWh = 0
) => {
  const tokens = fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path, "utf8"))
    : [];

  const record = tokens.find((item) => item.serial_number === serialNumber);
  if (record) {
    record.token_used.push(token);
    if (generateToken) record.last_kWh = (record.last_kWh || 0) + new_kWh; // Update last_kWh
  } else {
    const newEntry = {
      serial_number: serialNumber,
      token_used: [token],
      ...(generateToken && { last_kWh: new_kWh }), // Tambahkan last_kWh jika activeToken
    };
    tokens.push(newEntry);
  }

  fs.writeFileSync(path, JSON.stringify(tokens)); // Simpan semua data kembali ke file
  return true;
};

// Fungsi untuk membaca last_kWh berdasarkan serial number
const readLastKWh = (path, serialNumber) => {
  if (!fs.existsSync(path)) return null;

  const tokens = JSON.parse(fs.readFileSync(path, "utf8"));
  const lastKWh =
    tokens.find((item) => item.serial_number === serialNumber)?.last_kWh ?? 0; // Gunakan optional chaining

  return lastKWh;
};

// Fungsi untuk generate token
const generateToken = async (yearNow) => {
  const path = "./database/generateToken.json";
  let elevenDigitNumber;
  let isValidInput = false;
  console.log(
    chalk.cyanBright(`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                  Demo kWh Meter V2.0 ~ Menu Generate New Token                  │
│   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│                                By Dan's ~ © ${yearNow}                                │
└─────────────────────────────────────────────────────────────────────────────────┘
    `)
  );

  while (!isValidInput) {
    elevenDigitNumber = await rl.question(
      chalk.cyanBright(
        "Enter the 11-digit serial number (example: 12345678901): "
      )
    );

    if (
      elevenDigitNumber.length !== 11 ||
      isNaN(elevenDigitNumber) ||
      elevenDigitNumber.includes(" ")
    ) {
      console.log(
        chalk.redBright("Serial number must be 11 digits. Please try again.")
      );
    } else {
      isValidInput = true; // Input is valid
    }
  }

  // Menampilkan daftar jumlah pembelian
  console.log(
    chalk.cyanBright(`
───────────────────────────────────────────────────────────────────────────────────
                              Select Purchase Amount                               
                          The price of 1 kWh is Rp 1.444                           
───────────────────────────────────────────────────────────────────────────────────
    `)
  );

  const amounts = [20000, 50000, 100000, 200000, 500000, 1000000];
  amounts.forEach((amount, index) => {
    const totalAmount = calculateTotal(amount);
    const totalKwh = calculateKwh(amount);
    console.log(
      chalk.cyanBright(
        `    [${index + 1}] ${formatRupiah(amount)} (Total: ${formatRupiah(
          totalAmount
        )}, kWh: ${totalKwh})`
      )
    );
  });
  console.log(chalk.cyanBright("    [7] Cancel Genarete Token!"));
  console.log(
    chalk.cyanBright(
      "\n───────────────────────────────────────────────────────────────────────────────────\n"
    )
  );

  const choice = await rl.question(
    chalk.cyanBright("Enter your choice (1, 2, 3, 4, 5, 6 or 7): ")
  );

  if (choice >= 1 && choice <= 6) {
    const selectedAmount = amounts[choice - 1];
    const totalAmount = calculateTotal(selectedAmount);
    const totalKwh = calculateKwh(selectedAmount);
    console.log(
      chalk.cyanBright(
        `\nNOTE:\nA purchase of ${formatRupiah(
          selectedAmount
        )} has been selected. Total amount to be paid: ${formatRupiah(
          totalAmount
        )}.\nKWh obtained: ${totalKwh}.\n`
      )
    );

    // Contoh pengisian decoder key
    const keyType = "3"; // Example key type
    const supplyGroupCode = "560983"; // Example supply group code
    const tariffIndex = "01"; // Example tariff index
    const keyRevisionNumber = "1"; // Example key revision number
    const decoderReferenceNumber = "56728389217"; // Example decoder reference number
    const vendingKey = new VendingKey(elevenDigitNumber).generateKey();

    // check panjang serial number
    let lastSevenDigits = elevenDigitNumber.slice(-7);
    while (parseInt(lastSevenDigits) > 1048575) {
      lastSevenDigits = lastSevenDigits.slice(1); // Hapus satu digit dari depan
    }

    const decoderKeyGen = new DecoderKeyGenerator(
      keyType,
      supplyGroupCode,
      tariffIndex,
      keyRevisionNumber,
      decoderReferenceNumber,
      vendingKey
    ).generateDecoderKey();

    const decoderKeyBin = HelperFunction.hexToBin(decoderKeyGen);

    let tokenAmount, tid, tokenNumber;
    do {
      // Generate a new token
      const { token64BitBlock, cls } = new TokenGenerator(
        parseInt(lastSevenDigits),
        totalKwh
      ).build64BitTokenBlock();

      const tokenEncryptor = new TokenEncryptor(token64BitBlock, cls);
      tokenNumber = HelperFunction.hexToNumber(
        tokenEncryptor.encryptToken(decoderKeyBin)
      );

      // Create an instance of TokenDecryptor with the token number
      const tokenDecryptor = new TokenDecryptor(tokenNumber);
      const decrypted = tokenDecryptor.decryptToken(decoderKeyBin);
      ({ tokenAmount, tid } = tokenDecryptor.extractTokenInfo(decrypted));
    } while (
      tokenAmount !== totalKwh ||
      tid !== parseInt(lastSevenDigits) ||
      isTokenUsed(path, elevenDigitNumber, tokenNumber)
    );
    saveTokenData(path, elevenDigitNumber, tokenNumber);
    console.log(chalk.cyanBright("20 Digits Token Number"));
    console.log(chalk.cyanBright.bold(tokenNumber));
    console.log(chalk.redBright("DON'T FORGET TO COPY THE TOKEN NUMBER\n"));
    await rl.question(chalk.cyanBright("Press any key to continue . . ."));
  } else if (choice === "7") {
    console.log(chalk.redBright("Back to the main menu."));
    await rl.question(chalk.redBright("Press any key to continue . . ."));
  } else {
    console.log(chalk.redBright("Invalid choice. Please try again."));
    await rl.question(chalk.redBright("Press any key to continue . . ."));
  }
};

// Fungsi untuk aktivasi token
const activateToken = async (yearNow) => {
  const path = "./database/oldActiveToken.json";
  let elevenDigitNumber, tokenNumber;
  let isValidInput = false;
  console.log(
    chalk.cyanBright(`
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                        Demo kWh Meter V2.0 ~ Menu Active New Token                        │
│   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│                                     By Dan's ~ © ${yearNow}                                     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
    `)
  );

  while (!isValidInput) {
    elevenDigitNumber = await rl.question(
      chalk.cyanBright(
        "Enter the 11-digit serial number (example: 12345678901): "
      )
    );

    if (
      elevenDigitNumber.length !== 11 ||
      isNaN(elevenDigitNumber) ||
      elevenDigitNumber.includes(" ")
    ) {
      console.log(
        chalk.redBright("Serial number must be 11 digits. Please try again.")
      );
    } else {
      isValidInput = true; // Input is valid
    }
  }

  isValidInput = false;

  // Entering the token number in the desired format
  while (!isValidInput) {
    tokenNumber = await rl.question(
      chalk.cyanBright(
        "Enter the token number (format: 1111-2222-3333-4444-5555): "
      )
    );

    // Regex to validate the token number format
    const tokenFormat = /^\d{4}-\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!tokenFormat.test(tokenNumber)) {
      console.log(
        chalk.redBright("Invalid token number format. Please try again.")
      );
    } else {
      isValidInput = true; // Valid input
    }
  }

  // Contoh pengisian decoder key
  const keyType = "3"; // Example key type
  const supplyGroupCode = "560983"; // Example supply group code
  const tariffIndex = "01"; // Example tariff index
  const keyRevisionNumber = "1"; // Example key revision number
  const decoderReferenceNumber = "56728389217"; // Example decoder reference number
  const vendingKey = new VendingKey(elevenDigitNumber).generateKey();

  const decoderKeyGen = new DecoderKeyGenerator(
    keyType,
    supplyGroupCode,
    tariffIndex,
    keyRevisionNumber,
    decoderReferenceNumber,
    vendingKey
  ).generateDecoderKey();

  const decoderKeyBin = HelperFunction.hexToBin(decoderKeyGen);

  // check panjang serial number
  let lastSevenDigits = elevenDigitNumber.slice(-7);
  while (parseInt(lastSevenDigits) > 1048575) {
    lastSevenDigits = lastSevenDigits.slice(1); // Hapus satu digit dari depan
  }

  // Create an instance of TokenDecryptor with the token number
  const tokenDecryptor = new TokenDecryptor(tokenNumber);
  const decrypted = tokenDecryptor.decryptToken(decoderKeyBin);
  const { tokenAmount, tid } = tokenDecryptor.extractTokenInfo(decrypted);

  if (tid === parseInt(lastSevenDigits)) {
    if (!isTokenUsed(path, elevenDigitNumber, tokenNumber)) {
      console.log(
        chalk.cyanBright(`
─────────────────────────────────────────────────────────────────────────────────────────────
                                   Summary Active New Token                                  
─────────────────────────────────────────────────────────────────────────────────────────────
        `)
      );
      saveTokenData(path, elevenDigitNumber, tokenNumber, true, tokenAmount);
      console.log(chalk.cyanBright("Status: Success"));
      console.log(
        chalk.cyanBright(
          "Message: Token successfully applied, and kWh balance increases."
        )
      );
      console.log(chalk.cyanBright("Amount kWh:", tokenAmount));
      const lastKWh = readLastKWh(path, elevenDigitNumber);
      if (lastKWh !== null) {
        console.log(chalk.cyanBright("Remaining kWh:", lastKWh));

        console.log(
          chalk.cyanBright(
            "\n─────────────────────────────────────────────────────────────────────────────────────────────"
          )
        );
        await rl.question(
          chalk.cyanBright("\nPress any key to continue . . .")
        );
      } else {
        console.log(chalk.redBright("\nStatus: Error"));
        console.log(chalk.redBright("Message: Unable to find data."));
        await rl.question(chalk.redBright("Press any key to continue . . ."));
      }
    } else {
      console.log(chalk.redBright("\nStatus: Already Used"));
      console.log(chalk.redBright("Message: Token was used previously."));
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    }
  } else {
    console.log(chalk.redBright("\nStatus: Error"));
    console.log(chalk.redBright("Message: Incorrect serial number or token."));
    await rl.question(chalk.redBright("Press any key to continue . . ."));
  }
};

// Fungsi untuk check last kWh
const lastKWhCheck = async (yearNow) => {
  const path = "./database/oldActiveToken.json";
  let elevenDigitNumber;
  let isValidInput = false;
  console.log(
    chalk.cyanBright(`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   Demo kWh Meter V2.0 ~ Check Remaining Token                   │
│   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│                                By Dan's ~ © ${yearNow}                                │
└─────────────────────────────────────────────────────────────────────────────────┘
    `)
  );

  while (!isValidInput) {
    elevenDigitNumber = await rl.question(
      chalk.cyanBright(
        "Enter the 11-digit serial number (example: 12345678901): "
      )
    );

    if (
      elevenDigitNumber.length !== 11 ||
      isNaN(elevenDigitNumber) ||
      elevenDigitNumber.includes(" ")
    ) {
      console.log(
        chalk.redBright("Serial number must be 11 digits. Please try again.")
      );
    } else {
      isValidInput = true; // Input is valid
    }
  }

  const lastKWh = readLastKWh(path, elevenDigitNumber);
  if (lastKWh !== null) {
    console.log(
      chalk.cyanBright(`
─────────────────────────────────────────────
            Details Remaining kWh            
─────────────────────────────────────────────

Meter Serial Number: ${elevenDigitNumber}
Remaining kWh: ${lastKWh}

─────────────────────────────────────────────
      `)
    );
    await rl.question(chalk.cyanBright("Press any key to continue . . ."));
  } else {
    console.log(chalk.redBright("\nStatus: Error"));
    console.log(chalk.redBright("Message: Unable to find data."));
    await rl.question(chalk.redBright("Press any key to continue . . ."));
  }
};

// Fungsi untuk bantuan cara menggunaan
const help = async (yearNow) => {
  console.log(
    chalk.whiteBright(`
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        Help Center V2.0                                          │
│   ───────────────────────────────────────────────────────────────────────────────────────────    │
│                                                                                                  │
│   [1] Generate New Token                                                                         │
│       - Description: Generate a 20-digit token to increase your meter's kWh balance.             │
│       - Instructions:                                                                            │
│           1. Enter the 11-digit numeric meter serial number. (Note: Serial number must only      │
│              contain numbers, no letters.)                                                       │
│           2. Choose the token purchase amount (Options: 1-6, where each choice corresponds       │
│               to a kWh value).                                                                   │
│           3. To exit the token generation menu, choose option 7.                                 │
│           4. Example: Selecting option [1] Rp 20.000 (Total: Rp 22.500 kWh: 13.9).               │
│       - Outcome: After processing, a 20-digit token will be displayed in this format:            │
│         1111-2222-3333-4444-5555                                                                 │
│                                                                                                  │
│   [2] Activate New Token                                                                         │
│       - Description: Apply a previously generated 20-digit token to add kWh to your meter.       │
│         Tokens should be generated first using the "Generate New Token" option.                  │
│       - Instructions:                                                                            │
│           1. Enter the 11-digit numeric meter serial number. (Note: Serial number must           │
│              only contain numbers, no letters.)                                                  │
│           2. Enter the 20-digit token received from the "Generate New Token" function.           │
│           3. The activation process has three outcomes:                                          │
│              - Success: Token successfully applied, and kWh balance increases.                   │
│              - Error: Incorrect serial number or token.                                          │
│              - Already Used: Token was used previously.                                          │
│                                                                                                  │
│   [3] Check Remaining kWh                                                                        │
│       - Description: View the current kWh balance on your meter.                                 │
│       - Instructions:                                                                            │
│           1. Enter the 11-digit numeric meter serial number. (Note: Serial number must only      │
│              contain numbers, no letters.)                                                       │
│           2. The system will display the remaining kWh for the specified meter.                  │
│                                                                                                  │
│   [4] Help                                                                                       │
│       - Description: Provides detailed instructions and guidance on using each menu option       │
│         within the system.                                                                       │
│                                                                                                  │
│   [5] About                                                                                      │
│       - Description: Displays program details, version information, and acknowledgments to       │
│         referenced works.                                                                        │
│                                                                                                  │
│   [6] Exit                                                                                       │
│       - Description: Exits the program and returns to the command line.                          │
│                                                                                                  │
│   ────────────────────────────────────────────────────────────────────────────────────────────   │
│                                                                                                  │
│   Note: This program requires Node.js version 20 or above. Ensure you have run                   │
│   'npm install' to install all necessary libraries for this application.                         │
│                                                                                                  │
│   ────────────────────────────────────────────────────────────────────────────────────────────   │
│                                        By Dan's ~ © ${yearNow}                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
    `)
  );

  await rl.question(chalk.whiteBright("Press any key to continue . . ."));
  console.clear();
};

// Fungsi untuk mengetahui informasi program
const about = async (yearNow) => {
  console.log(
    chalk.whiteBright(`
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Demo kWh Meter V2.0                                       │
│   ───────────────────────────────────────────────────────────────────────────────────────────   │
│   What's New?                                                                                   │
│   1. Enhanced, interactive user experience                                                      │
│   2. Separated functions for token generation & activation                                      │
│   3. Feature added to check remaining kWh                                                       │
│   4. Organized functions into dedicated folders                                                 │
│   5. Improved command line display                                                              │
│   ───────────────────────────────────────────────────────────────────────────────────────────   │
│                                                                                                 │
│   This program is inspired by the prepaid electricity system used by PLN (Perusahaan            │
│   Listrik Negara) in Indonesia, which allows users to enter a 20-digit token into their         │
│   meter to activate electricity access. The kWh unit displayed simulates the real  system       │
│   used by PLN, providing an accessible model for understanding this system's inner workings.    │
│                                                                                                 │
│   Built on foundational concepts from Mwangi Patrick's "Let's Demystify That 20-Digit           │
│   Utility Token" article, which included a full Java code implementation, this                  │
│   JavaScript-based version uses ES6 syntax for improved readability and functionality.          │
│   Work by Paadevelopments also served as a vital reference, offering code examples for          │
│   similar utilities.                                                                            │
│                                                                                                 │
│   I hope this code serves as a helpful resource for those interested in understanding how       │
│   the Standard Transfer Specification (STS) meter system operates to produce a 20-digit         │
│   token. The program is intended as a is intended as a base simulation and can be further       │
│   expanded by developers. Future enhancements could include improvedtoken encryption,           │
│   stability refinements, and critical bug prevention, making the application more robust        │
│   and versatile.                                                                                │
│                                                                                                 │
│   All code is available on my GitHub:                                                           │
│   https://github.com/dannyjiustian                                                              │
│                                                                                                 │
│   Special thanks to both Mwangi Patrick and Paadevelopments for their invaluable                │
│   contributions, as well as for establishing the Standard Transfer Specification (STS) as       │
│   a reliable framework for reference.                                                           │
│                                                                                                 │
│   References:                                                                                   │
│     - https://mwangi-patrick.medium.com/lets-demystify-that-20-digit-utility-token-part-        │
│       1-74c85eebbac4                                                                            │
│     - https://medium.com/codex/lets-demystify-that-20-digit-utility-token-part-2-               │
│       64ca45f4b88b                                                                              │
│     - https://mwangi-patrick.medium.com/lets-demystify-that-20-digit-utility-token-part-        │
│       3-d05002dbdf71                                                                            │
│     - https://github.com/paadevelopments/sts_ea07_da07                                          │
│                                                                                                 │
│   ───────────────────────────────────────────────────────────────────────────────────────────   │
│                                        By Dan's ~ © ${yearNow}                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
    `)
  );

  await rl.question(chalk.whiteBright("Press any key to continue . . ."));
  console.clear();
};

// Menampilkan pilihan
const showMenu = async () => {
  console.clear();
  const yearNow = new Date().getFullYear();
  printBanner();
  let detectFirstStart = true;
  while (true) {
    if (detectFirstStart) {
      console.log(
        chalk.cyanBright(`
┌─────────────────────────────────────────────────────────┐
│                   Demo kWh Meter V2.0                   │
│   ───────────────────────────────────────────────────   │
│   What's New?                                           │
│   1. Make it more interactive.                          │
│   2. Separate generate and activation functions         │
│   3. Added function to check remaining kWh              │
│   4. Separate program functions into main folders       │
│   5. Create an attractive command display               │
│   ───────────────────────────────────────────────────   │
│                                                         │
│                                                         │
│                      SELECT OPTION                      │
│   ───────────────────────────────────────────────────   │
│     [1] Generate New Token (Output 20 Digit Number)     │
│     [2] Active New Token (kWh Increased)                │
│     [3] Check Remaining kWh                             │
│   ───────────────────────────────────────────────────   │
│     [4] Help           [5] About           [6] Exit     │
│   ───────────────────────────────────────────────────   │
│                    By Dan's ~ © ${yearNow}                    │
└─────────────────────────────────────────────────────────┘
        `)
      );
    } else {
      console.clear();
      console.log(
        chalk.cyanBright(`
┌─────────────────────────────────────────────────────────┐
│                   Demo kWh Meter V2.0                   │
│                                                         │
│                      SELECT OPTION                      │
│   ───────────────────────────────────────────────────   │
│     [1] Generate New Token (Output 20 Digit Number)     │
│     [2] Active New Token (kWh Increased)                │
│     [3] Check Remaining kWh                             │
│   ───────────────────────────────────────────────────   │
│     [4] Help           [5] About           [6] Exit     │
│   ───────────────────────────────────────────────────   │
│                    By Dan's ~ © ${yearNow}                    │
└─────────────────────────────────────────────────────────┘
        `)
      );
    }

    const choice = await rl.question(
      chalk.cyanBright("Enter your choice (1, 2, 3, 4, 5, or 6): ")
    );
    detectFirstStart = false;

    if (["1", "2", "3", "4", "5"].includes(choice)) console.clear();

    if (choice === "1") {
      await generateToken(yearNow);
    } else if (choice === "2") {
      await activateToken(yearNow);
    } else if (choice === "3") {
      await lastKWhCheck(yearNow);
    } else if (choice === "4") {
      await help(yearNow);
    } else if (choice === "5") {
      await about(yearNow);
    } else if (choice === "6") {
      console.log(chalk.redBright("Exiting program. Thank you!\n"));
      break; // Keluar dari loop dan program
    } else {
      console.log(chalk.redBright("Invalid choice. Please try again."));
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    }
  }

  rl.close(); // Menutup interface setelah selesai
};

// Memulai aplikasi
showMenu();
