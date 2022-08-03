const fs = require('fs');
const forge = require('node-forge');

const privateKey = fs.readFileSync('./myCA.key', 'utf-8');
const cert = fs.readFileSync('./myCA.pem', 'utf-8');
// const caKey = (forge.pki.decryptRsaPrivateKey(privateKey, 'benn1904'));
const caKey = forge.pki.decryptRsaPrivateKey(privateKey, 'benn1904');
const caCert = forge.pki.certificateFromPem(cert);
const hostKeys = forge.pki.rsa.generateKeyPair(2048);

const getCertNotBefore = () => {
    let twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
    let year = twoDaysAgo.getFullYear();
    let month = (twoDaysAgo.getMonth() + 1).toString().padStart(2, '0');
    let day = twoDaysAgo.getDate();
    return new Date(`${year}-${month}-${day} 00:00:00Z`);
}

// Get Certificate Expiration Date (Valid for 365 Days)
const getCertNotAfter = (notBefore) => {
    let ninetyDaysLater = new Date(notBefore.getTime() + 60 * 60 * 24 * 365 * 1000);
    let year = ninetyDaysLater.getFullYear();
    let month = (ninetyDaysLater.getMonth() + 1).toString().padStart(2, '0');
    let day = ninetyDaysLater.getDate();
    return new Date(`${year}-${month}-${day} 23:59:59Z`);
}

// // Get CA Expiration Date (Valid for 100 Years)
// const getCANotAfter = (notBefore) => {
//     let year = notBefore.getFullYear() + 100;
//     let month = (notBefore.getMonth() + 1).toString().padStart(2, '0');
//     let day = notBefore.getDate();
//     return new Date(`${year}-${month}-${day} 23:59:59Z`);
// }

const makeNumberPositive = (hexString) => {
    let mostSignificativeHexDigitAsInt = parseInt(hexString[0], 16);

    if (mostSignificativeHexDigitAsInt < 8) return hexString;

    mostSignificativeHexDigitAsInt -= 8
    return mostSignificativeHexDigitAsInt.toString() + hexString.substring(1)
}

// Generate a random serial number for the Certificate
const randomSerialNumber = () => {
    return makeNumberPositive(forge.util.bytesToHex(forge.random.getBytesSync(20)));
}
// Define the attributes/properties for the Host Certificate
const attributes = [{
    shortName: 'C',
    value: 'VN'
}, {
    shortName: 'ST',
    value: 'Ho Chi Minh'
}, {
    shortName: 'L',
    value: 'Quan 1'
}, {
    shortName: 'CN',
    value: '004.0001'
}];

const extensions = [{
    name: 'basicConstraints',
    cA: false
}, {
    name: 'nsCertType',
    server: true
}, {
    name: 'subjectKeyIdentifier'
}, {
    name: 'authorityKeyIdentifier',
    authorityCertIssuer: true,
    serialNumber: caCert.serialNumber
}, {
    name: 'keyUsage',
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true
}, {
    name: 'extKeyUsage',
    serverAuth: true
},
    // {
    //     name: 'subjectAltName',
    //     altNames: validDomains.map(domain => { return { type: 2, value: domain } })
    // }
];

// Create an empty Certificate
let newHostCert = forge.pki.createCertificate();

// Set the attributes for the new Host Certificate
newHostCert.publicKey = hostKeys.publicKey;
newHostCert.serialNumber = randomSerialNumber();
newHostCert.validity.notBefore = getCertNotBefore();
newHostCert.validity.notAfter = getCertNotAfter(newHostCert.validity.notBefore);
newHostCert.setSubject(attributes);
newHostCert.setIssuer(caCert.subject.attributes);
newHostCert.setExtensions(extensions);

// Sign the new Host Certificate using the CA
newHostCert.sign(caKey, forge.md.sha512.create());

// Convert to PEM format
let pemHostCert = forge.pki.certificateToPem(newHostCert);
let pemHostKey = forge.pki.privateKeyToPem(hostKeys.privateKey);


var p12Asn1 = forge.pkcs12.toPkcs12Asn1(
    hostKeys.privateKey, newHostCert, 'password',
    { algorithm: '3des' });

// base64-encode p12
var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
var p12b64 = forge.util.encode64(p12Der);

fs.writeFileSync('./test.p12', p12b64, 'base64');


console.log({ pemHostCert, pemHostKey });
