module.exports = app => {

    app.fs.createFolder(app.path.join(app.assetPath, 'pdf'));
    const cacheDir = app.path.join(app.assetPath, 'pdf/cache');
    app.fs.createFolder(cacheDir);
    const { vanBanDi } = require('../constant');
    const jimp = require('jimp')

    app.get('/api/hcth/ky-dien-tu/van-ban-di', app.permission.orCheck('manager:write', 'rectors:login', 'developer:login'), async (req, res) => {
        try {
            //TODO: check quyền user đối với văn bản
            const { id, name, location, reason, page, x, y, signatureLevel, scale, preferSize, signType, format } = req.query;
            //get file imformation
            const vanBanDiFile = await app.model.hcthVanBanDiFile.get({ id });
            const file = await app.model.hcthFile.get({ id: vanBanDiFile.fileId });
            if (!file) throw 'Không tìm được file';
            const input = app.path.join(app.assetPath, `/congVanDi/${vanBanDiFile.vanBanDi}/${file.tenFile}`);
            const extension = app.path.extname(file.tenFile);
            const signTypeItem = vanBanDi.signType[signType];

            //TODO: count current signature

            //TODO: convert file to pdf
            if (extension != '.pdf') throw 'invalid file type';

            // prepare session folder for signing -> this would be deleted -> TODO: schedule delete these folder
            const sessionFolder = app.path.join(cacheDir, new Date().getTime().toString());
            app.fs.createFolder(sessionFolder);
            const output = app.path.join(sessionFolder, file.tenFile);

            //resize image to session folder
            const imagePath = app.path.join(app.assetPath, `/key/${req.session.user.shcc}.png`);
            const image = await jimp.read(imagePath);
            image.resize(signTypeItem.width, signTypeItem.height).write(app.path.join(sessionFolder, req.session.user.shcc + '.png'));

            const { status } = await app.pdf.signVisualPlaceholder({
                input, scale: '0', output, name, location, reason, scale: '-50',
                keystorePath: app.path.join(app.assetPath, '/pdf/p12placeholder/certificate.p12'),
                imgPath: app.path.join(sessionFolder, `${req.session.user.shcc}.png`),
            });
            if (status != 0) throw 'lỗi hệ thống';
            const outputBuffer = app.fs.readFileSync(output, 'base64');

            //TODO: validate number of signature

            //TODO: replace placeholder content with array of 0 (optional) -> make placeholder signature become invalid
            if (format) {
                return res.send({ data: outputBuffer });
            }
            res.writeHead(200, [['Content-Type', 'application/pdf'], ['Content-Disposition', 'attachment;filename=' + `${file.ten}`]]);
            res.end(Buffer.from(outputBuffer, 'base64'));
        } catch (error) {
            console.error(error);
            res.status(400).send({ error });
        }
    });

    // app.uploadHooks.add('hcthKyDienTu', (req, fields, files, params, done) =>
    //     app.permission.has(req, () => hcthKyDienTu(req, fields, files, params, done), done, 'staff:login'));

    // const hcthKyDienTu = (req, fields, files, params, done) => {
    //     if (
    //         fields.userData &&
    //         fields.userData[0] &&
    //         fields.userData[0].startsWith('hcthKyDienTu') &&
    //         files.hcthNhiemVuFile &&
    //         files.hcthNhiemVuFile.length > 0) {
    //         const
    //             srcPath = files.hcthNhiemVuFile[0].path,
    //             validUploadFileType = ['.xls', '.xlsx', '.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'],
    //             baseNamePath = app.path.extname(srcPath);
    //         if (!validUploadFileType.includes(baseNamePath.toLowerCase())) {
    //             done({ error: 'Định dạng tập tin không hợp lệ!' });
    //             app.fs.deleteFile(srcPath);
    //         } else {
    //             app.fs.createFolder(
    //                 app.path.join(app.assetPath, '/nhiemVu/' + (isNew ? '/new' : '/' + id))
    //             );
    //             app.fs.rename(srcPath, destPath, error => {
    //                 if (error) {
    //                     done && done({ error });
    //                 } else {
    //                     app.model.hcthFile.create({ ten: originalFilename, thoiGian: new Date().getTime(), loai: NHIEM_VU, ma: id === 'new' ? null : id }, (error, item) => {
    //                         done && done({ error, item });
    //                     });
    //                 }
    //             });
    //         }
    //     }
    // };
};