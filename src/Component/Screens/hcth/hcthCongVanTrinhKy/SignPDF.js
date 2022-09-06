import {
    PDFDocument,
    PDFName,
    PDFNumber,
    PDFHexString,
    PDFString,
  } from "pdf-lib";
  import { SignPdf, findByteRange, removeTrailingNewLine, SignPdfError } from "node-signpdf";
  import PDFArrayCustom from "./pdfArrayCustom";
  import forge from "node-forge";
  const signer = new SignPdf();
  
  export default class SignPDF {
    constructor(pdfFile, certFile) {
      this.pdfDoc = pdfFile;
      this.certificate = certFile;
    }
  
    /**
     * @return Promise<Buffer>
     */
    async signPDF(passphrase) {
      console.log(passphrase);
    //   let newPDF = await this._addPlaceholder();
    //   newPDF = signer.sign(newPDF, this.certificate);

      const options = {
        asn1StrictParsing: false,
        passphrase,
      }

      console.log(this.pdfDoc instanceof Buffer);
      console.log(this.certificate instanceof Buffer);

        if (!(this.pdfDoc instanceof Buffer)) {
            throw new SignPdfError(
                'PDF expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
        }
        if (!(this.certificate instanceof Buffer)) {
            throw new SignPdfError(
                'p12 certificate expected as Buffer.',
                SignPdfError.TYPE_INPUT,
            );
        }

        let pdf = this.pdfDoc
        // Find the ByteRange placeholder.
        const data = findByteRange(pdf);

        const byteRange = data.byteRanges[data.byteRanges.length - 1].map(item => parseInt(item));

        const placeholderLength = pdf.slice(byteRange[1], byteRange[2]).length - 2
        // Remove the placeholder signature
        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            pdf.slice(byteRange[2], byteRange[2] + byteRange[3]),
        ]);

        // Convert Buffer P12 to a forge implementation.
        const forgeCert = forge.util.createBuffer(this.certificate.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(forgeCert);
        const p12 = forge.pkcs12.pkcs12FromAsn1(
            p12Asn1,
            options.asn1StrictParsing,
            options.passphrase,
        );

        // Extract safe bags by type.
        // We will need all the certificates and the private key.
        const certBags = p12.getBags({
            bagType: forge.pki.oids.certBag,
        })[forge.pki.oids.certBag];
        const keyBags = p12.getBags({
            bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
        })[forge.pki.oids.pkcs8ShroudedKeyBag];

        const privateKey = keyBags[0].key;
        // Here comes the actual PKCS#7 signing.
        const p7 = forge.pkcs7.createSignedData();
        // Start off by setting the content.
        p7.content = forge.util.createBuffer(pdf.toString('binary'));

        // Then add all the certificates (-cacerts & -clcerts)
        // Keep track of the last found client certificate.
        // This will be the public key that will be bundled in the signature.
        let certificate;
        Object.keys(certBags).forEach((i) => {
            const { publicKey } = certBags[i].cert;

            p7.addCertificate(certBags[i].cert);

            // Try to find the certificate that matches the private key.
            if (privateKey.n.compareTo(publicKey.n) === 0
                && privateKey.e.compareTo(publicKey.e) === 0
            ) {
                certificate = certBags[i].cert;
            }
        });

        if (typeof certificate === 'undefined') {
            throw new SignPdfError(
                'Failed to find a certificate that matches the private key.',
                SignPdfError.TYPE_INPUT,
            );
        }

        // Add a sha256 signer. That's what Adobe.PPKLite adbe.pkcs7.detached expects.
        p7.addSigner({
            key: privateKey,
            certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data,
                }, {
                    type: forge.pki.oids.messageDigest,
                    // value will be auto-populated at signing time
                }, {
                    type: forge.pki.oids.signingTime,
                    // value can also be auto-populated at signing time
                    // We may also support passing this as an option to sign().
                    // Would be useful to match the creation time of the document for example.
                    value: new Date(),
                },
            ],
        });

        // Sign in detached mode.
        p7.sign({ detached: true });

        // Check if the PDF has a good enough placeholder to fit the signature.
        const raw = forge.asn1.toDer(p7.toAsn1()).getBytes();
        // placeholderLength represents the length of the HEXified symbols but we're
        // checking the actual lengths.
        if ((raw.length * 2) > placeholderLength) {
            throw new SignPdfError(
                `Signature exceeds placeholder length: ${raw.length * 2} > ${placeholderLength}`,
                SignPdfError.TYPE_INPUT,
            );
        }

        let signature = Buffer.from(raw, 'binary').toString('hex');
        // Store the HEXified signature. At least useful in tests.
        //this.lastSignature = signature;

        // Pad the signature with zeroes so the it is the same length as the placeholder
        signature += Buffer
            .from(String.fromCharCode(0).repeat((placeholderLength / 2) - raw.length))
            .toString('hex');

        console.log(signature.length);
        // Place it in the document.
        pdf = Buffer.concat([
            pdf.slice(0, byteRange[1]),
            Buffer.from(`<${signature}>`),
            pdf.slice(byteRange[1]),
        ]);
        
        return { pdf, signAt: Date.now() };
    }
  
    /**
     * @see https://github.com/Hopding/pdf-lib/issues/112#issuecomment-569085380
     * @returns {Promise<Buffer>}
     */
    async _addPlaceholder() {
      const loadedPdf = await PDFDocument.load(this.pdfDoc);
      const ByteRange = PDFArrayCustom.withContext(loadedPdf.context);
      const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
      const SIGNATURE_LENGTH = 3322;
      const pages = loadedPdf.getPages();
  
      ByteRange.push(PDFNumber.of(0));
      ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
      ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
      ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
  
      const signatureDict = loadedPdf.context.obj({
        Type: 'Sig',
        Filter: 'Adobe.PPKLite',
        SubFilter: 'adbe.pkcs7.detached',
        ByteRange,
        Contents: PDFHexString.of('A'.repeat(SIGNATURE_LENGTH)),
        Reason: PDFString.of('We need your signature for reasons...'),
        M: PDFString.fromDate(new Date()),
      });
  
      const signatureDictRef = loadedPdf.context.register(signatureDict);
  
      const widgetDict = loadedPdf.context.obj({
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: [0, 0, 0, 0], // Signature rect size
        V: signatureDictRef,
        T: PDFString.of('test signature'),
        F: 4,
        P: pages[0].ref,
      });
  
      const widgetDictRef = loadedPdf.context.register(widgetDict);
  
      // Add signature widget to the first page
      pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj([widgetDictRef]));
  
      loadedPdf.catalog.set(
        PDFName.of('AcroForm'),
        loadedPdf.context.obj({
          SigFlags: 3,
          Fields: [widgetDictRef],
        })
      );
  
      // Allows signatures on newer PDFs
      // @see https://github.com/Hopding/pdf-lib/issues/541
      const pdfBytes = await loadedPdf.save({ useObjectStreams: false });
  
      return SignPDF.unit8ToBuffer(pdfBytes);
    }
  
    /**
     * @param {Uint8Array} unit8
     */
    static unit8ToBuffer(unit8) {
      let buf = Buffer.alloc(unit8.byteLength);
      const view = new Uint8Array(unit8);
  
      for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
      }
      return buf;
    }
  }

  