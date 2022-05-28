
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDanhSachMonChuongTrinhDaoTao } from '../dtChuongTrinhDaoTao/redux';
import { createDtDanhSachMonMo } from '../dtDanhSachMonMo/redux';
class MonHocCtdtModal extends AdminModal {
    state = { listMonHocChonChung: [], listMonHocChonChuyenNganh: [] }
    onShow = (item) => {
        // console.log('#####item', item);
        let { khoaSv, thongTinKhoaNganh, maDangKy } = item;
        let { maNganh, khoaDangKy } = thongTinKhoaNganh;

        this.props.getDanhSachMonChuongTrinhDaoTao(khoaSv, maNganh, value => {
            this.setState({ ...value, khoaSv, maNganh, khoaDangKy, maDangKy }, () => {
                this.state.listMonHocChung.forEach(item => {
                    if (item.isMo) {
                        let listMonHocChonChung = this.state.listMonHocChonChung;
                        listMonHocChonChung.push(item);
                        this.setState({ listMonHocChonChung });
                        ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                            this[textBox][item.maMonHoc].value(item[textBox]);
                        });
                    }
                });
                this.state.listMonHocChuyenNganh.forEach(item => {
                    item.danhSachMonChuyenNganh.forEach(monChuyenNganh => {
                        if (monChuyenNganh.isMo) {
                            let listMonHocChonChuyenNganh = this.state.listMonHocChonChuyenNganh;
                            listMonHocChonChuyenNganh.push(monChuyenNganh);
                            this.setState({ listMonHocChonChuyenNganh });
                            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                                this[textBox][monChuyenNganh.chuyenNganh][monChuyenNganh.maMonHoc].value(monChuyenNganh[textBox]);
                            });
                        }
                    });

                });
            });
        });
    }

    renderMonHocChung = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học',
        header: 'thead-light',
        stickyHead: true,
        renderHead: () => <tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '80%' }}>Môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết LT</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết TH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết <br /> /buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi <br />/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng <br /> dự kiến</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        renderRow: (item, index) => {
            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                this[textBox] = {};
            });
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={<>{item.maMonHoc} <br /> {item.tenMonHoc}</>} />
                    <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? 'x' : ''} />
                    <TableCell style={{ textAlign: 'right' }} content={item.soTietLyThuyet} />
                    <TableCell style={{ textAlign: 'right' }} content={item.soTietThucHanh} />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soLop[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soTietBuoi[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soBuoiTuan[item.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!item.isMo} />
                    } />
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                        <FormTextBox type='number' ref={e => this.soLuongDuKien[item.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={!item.isMo} />
                    } />
                    <TableCell type='checkbox' content={item.isMo} permission={{ write: true }} onChanged={(value) => {
                        list[index].isMo = !list[index].isMo;
                        this.setState({ listMonHocChung: list }, () => {
                            ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this[textBox][item.maMonHoc].value(list[index].isMo ? item[textBox] : ''));
                            let listMonHocChonChung = this.state.listMonHocChonChung;
                            if (value) {
                                listMonHocChonChung.push(item);
                            } else listMonHocChonChung = listMonHocChonChung.filter(monHoc => monHoc.maMonHoc != item.maMonHoc);
                            this.setState({ listMonHocChonChung });
                        });
                    }} />
                </tr>
            );
        }
    })

    renderMonHocChuyenNganh = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có môn học riêng các chuyên ngành',
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto' }}>Chuyên ngành</th>
            <th style={{ width: '80%' }}>Môn học</th>
            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết LT</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Số tiết TH</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số tiết <br /> /buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số buổi <br />/tuần</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số lượng <br /> dự kiến</th>
            <th style={{ width: 'auto' }}>Chọn</th>
        </tr>,
        renderRow: (item) => {
            let danhSachMonChuyenNganh = item.danhSachMonChuyenNganh || [],
                rowSpan = danhSachMonChuyenNganh.length;
            const rows = danhSachMonChuyenNganh.map((monHoc, index) => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    this[textBox][monHoc.chuyenNganh] = {};
                });
                return (
                    <tr key={item.tenChuyenNganh + index}>
                        {index == 0 && <TableCell contentClassName='multiple-lines-2' content={monHoc.tenChuyenNganh} rowSpan={rowSpan} />}
                        <TableCell content={<>{monHoc.maMonHoc} <br /> {monHoc.tenMonHoc}</>} />
                        <TableCell style={{ textAlign: 'center' }} content={monHoc.loaiMonHoc ? 'x' : ''} />
                        <TableCell style={{ textAlign: 'right' }} content={monHoc.soTietLyThuyet} />
                        <TableCell style={{ textAlign: 'right' }} content={monHoc.soTietThucHanh} />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.soLop[monHoc.chuyenNganh][monHoc.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!monHoc.isMo} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.soTietBuoi[monHoc.chuyenNganh][monHoc.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!monHoc.isMo} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.soBuoiTuan[monHoc.chuyenNganh][monHoc.maMonHoc] = e} style={{ marginBottom: '0' }} readOnly={!monHoc.isMo} />
                        } />
                        <TableCell style={{ width: 'auto', textAlign: 'center' }} content={
                            <FormTextBox type='number' ref={e => this.soLuongDuKien[monHoc.chuyenNganh][monHoc.maMonHoc] = e} style={{ marginBottom: '0', width: '100px' }} readOnly={!monHoc.isMo} />
                        } />
                        <TableCell type='checkbox' content={monHoc.isMo} permission={{ write: true }} onChanged={(value) => {
                            danhSachMonChuyenNganh[index].isMo = !danhSachMonChuyenNganh[index].isMo;
                            this.setState({ listMonHocChuyenNganh: list }, () => {
                                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => this[textBox][monHoc.chuyenNganh][monHoc.maMonHoc].value(danhSachMonChuyenNganh[index].isMo ? monHoc[textBox] : ''));
                                let listMonHocChonChuyenNganh = this.state.listMonHocChonChuyenNganh;
                                if (value) {
                                    listMonHocChonChuyenNganh.push(monHoc);
                                } else listMonHocChonChuyenNganh = listMonHocChonChuyenNganh.filter(monHocCN => monHocCN.maMonHoc != monHoc.maMonHoc);

                                this.setState({ listMonHocChonChuyenNganh });
                            });
                        }} />
                    </tr>
                );
            });
            return rows;
        }

    })

    getData = () => {
        let { listMonHocChonChung, listMonHocChonChuyenNganh } = this.state;
        console.log(listMonHocChonChung, listMonHocChonChuyenNganh);
        try {
            listMonHocChonChung.forEach(monHoc => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    if (!this[textBox][monHoc.maMonHoc].value()) {
                        this[textBox][monHoc.maMonHoc].focus();
                        throw ('Vui lòng nhập đầy đủ thông tin');
                    }
                    else monHoc[textBox] = this[textBox][monHoc.maMonHoc].value();
                });
                monHoc.khoa = this.state.khoaDangKy;
                monHoc.khoaSv = this.state.khoaSv;
                monHoc.maDangKy = this.state.maDangKy;
            });

            listMonHocChonChuyenNganh.forEach(monHoc => {
                ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => {
                    if (!this[textBox][monHoc.chuyenNganh][monHoc.maMonHoc].value()) {
                        this[textBox][monHoc.chuyenNganh][monHoc.maMonHoc].focus();
                        throw ('Vui lòng nhập đầy đủ thông tin');
                    }
                    else monHoc[textBox] = this[textBox][monHoc.chuyenNganh][monHoc.maMonHoc].value();
                });
                monHoc.khoa = this.state.khoaDangKy;
                monHoc.khoaSv = this.state.khoaSv;
                monHoc.maDangKy = this.state.maDangKy;

            });

            return [...listMonHocChonChung, ...listMonHocChonChuyenNganh];
        } catch (error) {
            T.notify(error, 'danger');
            return [];
        }
    }
    onSubmit = (e) => {
        e.preventDefault();
        let data = this.getData();
        data && data.length && this.props.createDtDanhSachMonMo(this.state.maNganh, data, () => {
            this.props.reinit();
            this.hide();
        });
        // this.setState({ listMonHocChonChung, listMonHocChonChuyenNganh }, () => console.log(this.state.listMonHocChonChung, this.state.listMonHocChonChuyenNganh));
    }

    render = () => {
        let { listMonHocChung, listMonHocChuyenNganh } = this.state;
        // console.log(this.state.listMonHocChonChung, this.state.listMonHocChonChuyenNganh);
        return this.renderModal({
            title: 'Chọn môn học từ Chương trình đào tạo',
            size: 'elarge',
            body: <div className='row'>
                <div className='form-group col-md-12'>
                    <label>Môn chung:</label>
                    {this.renderMonHocChung(listMonHocChung)}
                </div>
                <div className='form-group col-md-12'>
                    <label>Môn chuyên ngành:</label>
                    {this.renderMonHocChuyenNganh(listMonHocChuyenNganh)}
                </div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDanhSachMonChuongTrinhDaoTao, createDtDanhSachMonMo
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MonHocCtdtModal);