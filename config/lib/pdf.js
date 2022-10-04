module.exports = app => {
    const { JavaCaller } = require('java-caller');
    const parseKeywordArguments = (props, validArguments, caller) => {
        const javaArguments = [];
        Object.keys(props).forEach(key => {
            if (validArguments.includes(key)) {
                if (props[key] != null) {
                    javaArguments.push(`--${key}`);
                    javaArguments.push(`${props[key]}`);
                }
            }
            else console.warn(key, `is not a valid keyword for ${caller}`);
        });
        return javaArguments;
    }
    app.pdf = {
        pdfSignJar: app.path.join(app.assetPath, 'jar/java-sign-utils-1.0-jar-with-dependencies.jar'),
        signVisualPlaceholder: async (props) => {
            const validArguments = ['mode', 'name', 'location', 'imgPath', 'input', 'output', 'reason', 'keystorePath', 'passphrase', 'page', 'x', 'y', 'signatureLevel', 'scale', 'preferSize'];
            const javaArguments = parseKeywordArguments({ ...props, mode: 'addSignature' }, validArguments, 'app.pdf.signVisualPlaceholder');

            const java = new JavaCaller({
                jar: app.pdf.pdfSignJar,
                rootPath: '/.'
            });
            const { status, stdout, stderr } = await java.run(javaArguments);
            return { status, stdout, stderr };
        },

        addSoVanBanForm: async (props) => {
            const validArguments = ['mode', 'input', 'output', 'page', 'x', 'y', 'fontSize', 'ttfPath', 'width'];
            const javaArguments = parseKeywordArguments({ ...props, mode: 'addSoVanBanForm' }, validArguments, 'app.pdf.addSoVanBanForm');
            console.log({ javaArguments });

            const java = new JavaCaller({
                jar: app.pdf.pdfSignJar,
                rootPath: '/.'
            });
            const { status, stdout, stderr } = await java.run(javaArguments);
            return { status, stdout, stderr };
        },

        fillSoVanBanForm: async (props) => {
            const validArguments = ['mode', 'input', 'output', 'soVanBan'];
            const javaArguments = parseKeywordArguments({ ...props, mode: 'fillSoVanBanForm' }, validArguments, 'app.pdf.fillSoVanBanForm');

            const java = new JavaCaller({
                jar: app.pdf.pdfSignJar,
                rootPath: '/.'
            });
            const { status, stdout, stderr } = await java.run(javaArguments);
            return { status, stdout, stderr };
        }
    };

};