# Demo kWh Meter V2.0

## About

The **Demo kWh Meter V2.0** program simulates a prepaid electricity system inspired by PLN (Perusahaan Listrik Negara) in Indonesia. Users can enter a 20-digit token to activate their electricity meter, while the program provides an accessible model to understand the system's workings.

### What's New?

- Enhanced, interactive user experience
- Separated functions for token generation & activation
- Feature added to check remaining kWh
- Organized functions into dedicated folders
- Improved command line display

### Inspiration and References

This program builds on the foundational concepts from Mwangi Patrick's article, "Let's Demystify That 20-Digit Utility Token," and utilizes ES6 syntax for better readability. Work by Paadevelopments provided valuable code examples for similar utilities.

### Purpose

The code serves as a resource for understanding the Standard Transfer Specification (STS) meter system and can be expanded upon. Future enhancements may include:

- Improved token encryption
- Stability refinements
- Bug prevention measures

### Code Repository

All code is available on my GitHub: [dannyjiustian](https://github.com/dannyjiustian)

### Acknowledgments

Special thanks to Mwangi Patrick and Paadevelopments for their invaluable contributions to this project and the STS framework.

### References

- [Let's Demystify That 20-Digit Utility Token - Part 1](https://mwangi-patrick.medium.com/lets-demystify-that-20-digit-utility-token-part-1-74c85eebbac4)
- [Let's Demystify That 20-Digit Utility Token - Part 2](https://medium.com/codex/lets-demystify-that-20-digit-utility-token-part-2-64ca45f4b88b)
- [Let's Demystify That 20-Digit Utility Token - Part 3](https://mwangi-patrick.medium.com/lets-demystify-that-20-digit-utility-token-part-3-d05002dbdf71)
- [STS Framework Reference](https://github.com/paadevelopments/sts_ea07_da07)

© 2024 Dan's

---

## Versions

### v2.0

#### New Features

- Enhanced, interactive user experience
- Separated functions for token generation & activation
- Feature added to check remaining kWh
- Organized functions into dedicated folders
- Improved command line display

#### Note

To use this version, run `npm install` in the v2.0 folder.

---

### v1.2

#### New Features

- Changed the value of the token generator related to meter token decryption.

#### Note

Run `npm install` in the v1.2 folder.

---

### v1.1

#### New Features

- Optimized code by breaking down several functions.
- Run all functions within a single file.

#### Note

Run `npm install` in the v1.1 folder.

---

### v1.0

#### Initial Features

- Porting code from Java to JavaScript.

#### Note

Run `npm install` in the v1.0 folder.

---

### Help Center V2.0

#### Usage Instructions

1. **Generate New Token**

   - **Description**: Generate a 20-digit token to increase your meter's kWh balance.
   - **Instructions**:
     - Enter the 11-digit numeric meter serial number (only numbers).
     - Choose the token purchase amount (Options: 1-6).
     - Exit by choosing option 7.
     - **Example**: Selecting option [1] Rp 20.000 (Total: Rp 22.500 kWh: 13.9).
   - **Outcome**: A 20-digit token will be displayed in the format: `1111-2222-3333-4444-5555`.

2. **Activate New Token**

   - **Description**: Apply a previously generated token to add kWh to your meter.
   - **Instructions**:
     - Enter the 11-digit meter serial number.
     - Enter the 20-digit token.
     - **Outcomes**:
       - Success: Token successfully applied.
       - Error: Incorrect serial number or token.
       - Already Used: Token was used previously.

3. **Check Remaining kWh**

   - **Description**: View the current kWh balance on your meter.
   - **Instructions**:
     - Enter the 11-digit meter serial number.
     - The system will display the remaining kWh.

4. **Help**

   - **Description**: Provides detailed usage instructions for each menu option.

5. **About**

   - **Description**: Displays program details and acknowledgments.

6. **Exit**
   - **Description**: Exits the program.

### Note

This program requires Node.js version 20 or above. Ensure you have run `npm install` to install all necessary libraries.

© 2024 Dan's
