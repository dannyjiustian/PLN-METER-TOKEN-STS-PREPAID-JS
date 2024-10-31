// main help.js

/**
 * MainHelp class provides a static method to display the help menu with usage instructions.
 */
class MainHelp {
  /**
   * Display the help menu with detailed instructions for using the application.
   * @param {Object} rl - The readline interface for user input.
   * @param {string} yearNow - The current year for copyright information.
   * @returns {Promise<void>} - A promise that resolves when the user presses a key to continue.
   */
  static async help(rl, chalk, yearNow) {
    // Display the help menu with formatted output
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

    // Prompt user to press any key to continue
    await rl.question(chalk.whiteBright("Press any key to continue . . ."));
    console.clear(); // Clear the console screen after user input
  }
}

// Export MainHelp as the default export
export default MainHelp;
