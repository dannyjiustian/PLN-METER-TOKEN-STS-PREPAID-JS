How to demo for v1.0:
1. npm install
2. node vendingKeyGenerate.js
nb on vendingKeyGenerate has params to fill with 11 digit serial number [numeric only]

3. node decoderKeyGenerator.js
nb the decoderKeyGenerator has params that you can change as needed. it will return a hexadecimal format

4. node tokenGenerator.js
nb the tokenGenerator has params that you can change to suit your needs. it will return a binary format

5. node tokenEncryptor.js
nb in tokenEncryptor change the decoderKey with the result of decoderKeyGenerator, but change the format from hexadecimal to 64 bit binary and change the tokenBlock with 64 binary tokens from tokenGenerator and change the tokenClass by using the token class from tokenGenerator too

6. node tokenMeter.js
nb on tokenMeter change decoderKey with the result of decoderKeyGenerator, but change the format from hexadecimal to 64 bit binary and change tokenNumber with the output of tokenEncrypto