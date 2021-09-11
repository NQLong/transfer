module.exports = app => {
    app.model.dmPhong.createMulti = (data, done) => {
        app.model.dmPhong.get({ ten: data.ten, toaNha: data.toaNha }, (error,) => {
            if (error) {
                if (done) done('Tạo phòng học bị lỗi!');
            } else {
                app.model.dmPhong.create(data, done);
            }
        });
    };
};