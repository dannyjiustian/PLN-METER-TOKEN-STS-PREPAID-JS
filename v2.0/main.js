// Importing necessary modules and classes for the kWh meter application

// chalk: A library for styling console output with colors and formatting, enhancing the user interface.
import chalk from "chalk";
// readline: A module that provides an interface for reading data from a readable stream (stdin) in a promise-based manner, enabling asynchronous user input.
import readline from "readline/promises";
// fs: The file system module used for file operations, such as reading and writing data to files.
import fs from "fs";

// MainHelp: Module that provides the help functionality, showing the user how to use the application.
import MainHelp from "./main/menu/help.js";
// MainAbout: Module that provides information about the application, such as its version and authorship.
import MainAbout from "./main/menu/about.js";
// MainCheckRemainingKWh: Module for checking the remaining kWh balance associated with a serial number.
import MainCheckRemainingKWh from "./main/menu/checkRemainingKWh.js";
// MainTokenGenerator: Module that handles the generation of a new token for the kWh meter.
import MainTokenGenerator from "./main/menu/tokenGenerator.js";
// MainTokenActivation: Module that manages the activation of the token, increasing the kWh balance for the meter.
import MainTokenActivation from "./main/menu/tokenActivation.js";

// Create an interface for reading user input and output
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

// Function to display the menu options
const showMenu = async () => {
  console.clear(); // Clear the console for a fresh display
  const yearNow = new Date().getFullYear(); // Get the current year for the footer
  printBanner(); // Print the ASCII banner

  let detectFirstStart = true; // Flag to detect the first start of the menu
  while (true) {
    if (detectFirstStart) {
      // Display introductory information for the first menu display
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
│                      SELECT OPTION                      │
│   ───────────────────────────────────────────────────   │
│     [1] Generate New Token (Output 20 Digit Number)     │
│     [2] New Token Activation (kWh Increased)            │
│     [3] Check Remaining kWh                             │
│   ───────────────────────────────────────────────────   │
│     [4] Help           [5] About           [6] Exit     │
│   ───────────────────────────────────────────────────   │
│                    By Dan's ~ © ${yearNow}                    │
└─────────────────────────────────────────────────────────┘
        `)
      );
    } else {
      // Display the standard menu options for subsequent displays
      console.clear();
      console.log(
        chalk.cyanBright(`
┌─────────────────────────────────────────────────────────┐
│                   Demo kWh Meter V2.0                   │
│                                                         │
│                      SELECT OPTION                      │
│   ───────────────────────────────────────────────────   │
│     [1] Generate New Token (Output 20 Digit Number)     │
│     [2] New Token Activation (kWh Increased)            │
│     [3] Check Remaining kWh                             │
│   ───────────────────────────────────────────────────   │
│     [4] Help           [5] About           [6] Exit     │
│   ───────────────────────────────────────────────────   │
│                    By Dan's ~ © ${yearNow}                    │
└─────────────────────────────────────────────────────────┘
        `)
      );
    }

    // Prompt the user for their menu choice
    const choice = await rl.question(
      chalk.cyanBright("Enter your choice (1, 2, 3, 4, 5, or 6): ")
    );
    detectFirstStart = false; // Reset the flag after the first start

    // Clear the console for the next step based on user's choice
    if (["1", "2", "3", "4", "5"].includes(choice)) console.clear();

    // Handle user choices
    if (choice === "1") {
      await MainTokenGenerator.tokenGenerator(rl, chalk, fs, yearNow);
    } else if (choice === "2") {
      await MainTokenActivation.tokenActivation(rl, chalk, fs, yearNow);
    } else if (choice === "3") {
      await MainCheckRemainingKWh.checkRemainingKWh(rl, chalk, fs, yearNow);
    } else if (choice === "4") {
      await MainHelp.help(rl, chalk, yearNow);
    } else if (choice === "5") {
      await MainAbout.about(rl, chalk, yearNow);
    } else if (choice === "6") {
      // Exit the program
      console.log(chalk.redBright("Exiting program. Thank you!\n"));
      break; // Exit the loop and program
    } else {
      // Handle invalid choice
      console.log(chalk.redBright("Invalid choice. Please try again."));
      await rl.question(chalk.redBright("Press any key to continue . . ."));
    }
  }

  rl.close(); // Close the readline interface after finishing
};

// Start the application by displaying the menu
showMenu();
