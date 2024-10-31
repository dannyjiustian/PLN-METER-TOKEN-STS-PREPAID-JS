
# STS kWh Meter Simulation

The Demo kWh Meter V2.0 program simulates a prepaid electricity system inspired by PLN (Perusahaan Listrik Negara) in Indonesia. Users can enter a 20-digit token to activate their electricity meter, while the program provides an accessible model to understand the system's workings.

## Inspiration and References
This program builds on the foundational concepts from Mwangi Patrick's article, "Let's Demystify That 20-Digit Utility Token," and utilizes ES6 syntax for better readability. Work by Paadevelopments provided valuable code examples for similar utilities.

## Acknowledgements
Special thanks to Mwangi Patrick and Paadevelopments for sharing their knowledge and providing code examples that greatly influenced this project. Their contributions to understanding the Standard Transfer Specification (STS) framework have been invaluable.

## References Links

- [Let's Demystify That 20-Digit Utility Token - Part 1](https://mwangi-patrick.medium.com/lets-demystify-that-20-digit-utility-token-part-1-74c85eebbac4)
- [Let's Demystify That 20-Digit Utility Token - Part 2](https://medium.com/codex/lets-demystify-that-20-digit-utility-token-part-2-64ca45f4b88b)
- [Let's Demystify That 20-Digit Utility Token - Part 3](https://mwangi-patrick.medium.com/lets-demystify-that-20-digit-utility-token-part-3-d05002dbdf71)
- [STS Framework Reference](https://github.com/paadevelopments/sts_ea07_da07)

## Purpose

The code serves as a resource for understanding the Standard Transfer Specification (STS) meter system and can be expanded upon. Future enhancements may include:

- Improved token encryption
- Stability refinements
- Bug prevention measures


## Screenshots

<img width="500" alt="Start Program" src="https://github.com/user-attachments/assets/a3acb97a-ba44-47af-8c11-15da34ff0a5c">
<br>
Screenshot when the program is first run.
<br>
<br>

<img width="500" alt="image" src="https://github.com/user-attachments/assets/1749ecdf-7a0d-4939-b75e-1ff4486f72d2">
<br>
Screenshot when the program runs to create 20 digit tokens.

## Demo

https://github.com/user-attachments/assets/c3af4a9d-c03c-4271-86a7-89ea6cdf4787

## Usage Instructions

To get started, follow these steps:

**Install Dependencies**  

Begin by installing the required packages. Open your terminal and run the following command:
```bash
npm install
```
**Run the Application**

After the installation is complete, you can launch the application using this command:
```bash
npm start
```

## Information v2.0

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


## Tech Stack

**Language:** JavaScript

**Server:** NodeJS

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
