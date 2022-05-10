// eslint-disable-next-line no-unused-vars
module.exports = app => {
    // app.model.dmNgayLe.foo = () => { };

    app.model.dmNgayLe.getAllNgayLeTrongNam = (nam) => new Promise(resolve => {
        app.model.dmNgayLe.getAll({
            statement: 'ngay >= :startDateOfYear and ngay <= :endDateOfYear',
            parameter: {
                startDateOfYear: new Date(nam, 0, 1).setHours(0, 0, 0, 1),
                endDateOfYear: new Date(nam, 11, 31).setHours(23, 59, 59, 999)
            }
        }, (error, listNgayLe) => {
            console.log('##Error Ngày lễ:', error);
            console.log('##Ngày lễ', listNgayLe);
            if (!error) resolve(listNgayLe);
            else resolve({ error: 'Lấy danh sách ngày lễ trong năm lỗi' });
        });
    });
};
