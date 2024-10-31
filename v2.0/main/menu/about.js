// main about.js

/**
 * MainAbout class provides a static method to display the about section with detailed program information.
 */
class MainAbout {
  /**
   * Displays the about information, explaining program features, inspiration, references, and acknowledgments.
   * @param {Object} rl - The readline interface for handling user input.
   * @param {Object} chalk - The chalk library instance for colored text formatting.
   * @param {string} yearNow - The current year, used for displaying copyright information.
   * @returns {Promise<void>} - A promise that resolves after the user confirms to exit the about section.
   */
  static async about(rl, chalk, yearNow) {
    // Display the about menu with formatted output
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
│   token. The program is intended as a base simulation and can be further                        │
│   expanded by developers. Future enhancements could include improved token encryption,          │
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
    console.clear(); // Clear the console screen after user input
  }
}

// Export MainAbout as the default export
export default MainAbout;
