module.exports = app => {
    const { JavaCaller } = require('java-caller');

    app.pdf = {
        pdfSignJar: app.path.join(app.assetPath, 'jar/java-sign-utils-1.0-jar-with-dependencies.jar'),
        signVisualPlaceholder: async (props) => {
            const javaArguments = [];
            const validArguements = ['name', 'location', 'imgPath', 'input', 'output', 'reason', 'keystorePath', 'passphrase', 'page', 'x', 'y', 'signatureLevel', 'scale', 'preferSize'];
            props.mode = 'addSignature';
            Object.keys(props).forEach(key => {
                if (validArguements.includes(key)) {
                    if (props[key] != null) {
                        javaArguments.push(`--${key}`);
                        javaArguments.push(props[key]);
                    }
                }
                else console.warn(key, 'is not a valid keyword for app.pdf.signVisualPlaceholder');
            });
            const java = new JavaCaller({
                jar: app.pdf.pdfSignJar,
                rootPath: '/.'
            });
            const { status, stdout, stderr } = await java.run(javaArguments);
            return { status, stdout, stderr };
        },

        addSoVanBanForm : async (props) => {
            const javaArguments = [];
            const validArguements = ['input', 'output', 'page', 'x', 'y', 'fontSize', 'ttfPath', 'width'];
            props.mode = 'addSoVanBanForm';
            Object.keys(props).forEach(key => {
                if (validArguements.includes(key)) {
                    if (props[key] != null) {
                        javaArguments.push(`--${key}`);
                        javaArguments.push(props[key]);
                    }
                }
                else console.warn(key, 'is not a valid keyword for app.pdf.addSoVanBanForm');
            });
            const java = new JavaCaller({
                jar: app.pdf.pdfSignJar,
                rootPath: '/.'
            });
            const { status, stdout, stderr } = await java.run(javaArguments);
            return { status, stdout, stderr };
        }
    };
    
};