import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { checkSinhVienNhapHoc, setSinhVienNhapHoc, createCauHinhNhapHoc, getCauHinhNhapHoc } from './redux';

class NhapHocPage extends AdminPage {
    state = { dataNhapHoc: {} }
    componentDidMount() {
        T.ready('/user/students', () => {
            this.props.getCauHinhNhapHoc(result => {
                let { item } = result;
                Object.keys(item).forEach(key => {
                    if (key == 'heDaoTao') item[key] = item[key].split(',');
                    this[key] && this[key].value(item[key]);
                });
            });
        });
    }

    checkMssv = () => {
        let mssv = this.mssv.value();
        if (mssv == '') {
            T.notify('Chưa nhập mã số sinh viên', 'danger');
            this.mssv.focus();
        } else {
            this.props.checkSinhVienNhapHoc(mssv, data => {
                let dataNhapHoc = data.dataNhapHoc;
                this.setState({ dataNhapHoc, showResult: true });
            });
        }
    }

    tuChoiNhapHoc = () => {
        T.confirm('TỪ CHỐI NHẬP HỌC', 'Bạn có chắc muốn TỪ CHỐI nhập học sinh viên này không', 'warning', true, isConfirm => {
            isConfirm && this.props.setSinhVienNhapHoc({ mssv: this.state.dataNhapHoc.mssv, thaoTac: 'D' }, () => {
                T.alert(`Từ chối nhập học ${this.state.dataNhapHoc.hoTen} vào ${T.dateToText(Date.now(), 'HH:mm dd/mm/yyyy')}`, 'success', null, 1000);
                this.checkMssv();
            });
        });
    }

    chapNhanNhapHoc = () => {
        T.confirm('CHẤP NHẬN NHẬP HỌC', 'Bạn có chắc muốn CHẤP NHẬN nhập học sinh viên này không', 'warning', true, isConfirm => {
            isConfirm && this.props.setSinhVienNhapHoc({ mssv: this.state.dataNhapHoc.mssv, thaoTac: 'A' }, () => {
                T.alert(`SV ${this.state.dataNhapHoc.hoTen} nhập học vào ${T.dateToText(Date.now(), 'HH:mm dd/mm/yyyy')}`, 'success', null, 1000);
                this.checkMssv();
            });
        });
    }

    handleCreateCauHinh = () => {
        try {
            const data = {
                namHoc: getValue(this.namHoc),
                khoaSinhVien: getValue(this.khoaSinhVien),
                heDaoTao: getValue(this.heDaoTao).toString(),
                thoiGianBatDau: getValue(this.thoiGianBatDau).getTime(),
                thoiGianKetThuc: getValue(this.thoiGianKetThuc).getTime(),
                ghiDe: 0
            };
            this.props.createCauHinhNhapHoc(data, result => {
                delete data.ghiDe;
                if (result.warn) {
                    if (Object.keys(data).some(key => data[key] != result.warn[key])) {
                        let { namHoc, khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = result.warn;
                        T.confirm('Bạn muốn ghi đè cấu hình nhập học?', `<div style="text-align: left;">
                        <p>Năm học: <span style="text-decoration: line-through;">${namHoc}</span> → <span style="color: red;">${data.namHoc}</span></p>
                        <p>Khoá sinh viên: <span style="text-decoration: line-through;">${khoaSinhVien}</span> → <span style="color: red;">${data.khoaSinhVien}</span> </p>
                        <p>Hệ đào tạo: <span style="text-decoration: line-through;">${heDaoTao}</span> → <span style="color: red;">${data.heDaoTao}</span> </p>
                        <p>Thời gian bắt đầu: <span style="text-decoration: line-through;">${T.dateToText(thoiGianBatDau, 'dd/mm/yyyy HH:MM')}</span> → <span style="color: red;">${T.dateToText(data.thoiGianBatDau, 'dd/mm/yyyy HH:MM')}</span> </p>
                        <p>Thời gian kết thúc: <span style="text-decoration: line-through;">${T.dateToText(thoiGianKetThuc, 'dd/mm/yyyy HH:MM')}</span> → <span style="color: red;">${T.dateToText(data.thoiGianKetThuc, 'dd/mm/yyyy HH:MM')}</span> </p>
                    </div>`, null, true, isConfirm => {
                            if (isConfirm) {
                                data.ghiDe = 1;
                                this.props.createCauHinhNhapHoc(data, result => {
                                    if (result.item) T.notify('Cập nhật cấu hình nhập học thành công', 'success');
                                });
                            }
                        });
                    } else {
                        T.notify('Không có thay đổi nào!', 'warning');
                    }
                } else if (result.item) T.notify('Cập nhật cấu hình nhập học thành công', 'success');
            });
        } catch (input) {
            if (input) {
                T.notify(`${input.props.label} không được trống`, 'danger');
                input.focus();
            }
        }
    }
    render() {
        let { dataNhapHoc, showResult } = this.state,
            { mssv, hoTen, tinhTrang, nganhHoc, congNo, ngayNhapHoc, heDaoTao, namTuyenSinh, invalid } = dataNhapHoc;
        let permission = this.getUserPermission('ctsvNhapHoc', ['adminNhapHoc', 'write']),
            readOnly = !permission.adminNhapHoc;
        return this.renderPage({
            title: 'Nhập học',
            icon: 'fa fa-bookmark',
            breadcrumb: [
                <Link key={1} to='/user/students'>Sinh viên</Link>,
                'Nhập học'
            ],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Cấu hình nhập học</h3>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormTextBox type='scholastic' className='col-md-6' ref={e => this.namHoc = e} label='Năm học' required readOnly={readOnly} />
                                <FormTextBox type='year' ref={e => this.khoaSinhVien = e} label='Khoá sinh viên' className='col-md-6' required readOnly={readOnly} />
                                <FormSelect ref={e => this.heDaoTao = e} label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple className='col-md-12' required readOnly={readOnly} />
                                <FormDatePicker type='time-mask' className='col-md-12' ref={e => this.thoiGianBatDau = e} label='Thời gian bắt đầu' required readOnly={readOnly} />
                                <FormDatePicker type='time-mask' className='col-md-12' ref={e => this.thoiGianKetThuc = e} label='Thời gian kết thúc' required readOnly={readOnly} />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: readOnly ? 'none' : '' }}>
                            <button className='btn btn-outline-success' type='button' onClick={this.handleCreateCauHinh}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Công tác nhập học</h3>
                        <FormTextBox ref={e => this.mssv = e} label='Mã số sinh viên' onKeyDown={e => {
                            if (e.keyCode == 13) this.checkMssv();
                            else if (e.keyCode == 8) this.setState({ showResult: false });
                        }} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.checkMssv} style={{ marginLeft: '10px' }}>
                                <i className='fa fa-fw fa-lg fa-search'></i>Kiểm tra
                            </button>
                        </div>
                        <div style={{ display: showResult ? '' : 'none' }} >
                            <h3 className='tile-title'>Kết quả</h3>
                            <div className='row'>
                                <span className='col-md-4'>Họ và tên:</span>
                                <b className='text-primary col-md-8'><a href={`/user/students/profile/${mssv}`} target='blank'>{hoTen}</a></b><br /><br />

                                <span className='col-md-4'>MSSV:</span>
                                <b className='col-md-8'>{mssv}</b><br /><br />

                                <span className='col-md-4'>Hệ đào tạo:</span>
                                <b className='col-md-8'>{heDaoTao}</b><br /><br />

                                <span className='col-md-4'>Khoá sinh viên:</span>
                                <b className='col-md-8'>{namTuyenSinh}</b><br /><br />

                                <span className='col-md-4'>Ngành học:</span>
                                <b className='col-md-8'>{nganhHoc}</b><br /><br />


                                <span className='col-md-4'>Học phí:</span>
                                <b className={congNo ? 'text-danger col-md-8' : 'text-success col-md-8'}>{congNo && congNo > 0 ? 'Chưa thanh toán học phí' : 'Đã thanh toán học phí'}</b><br /><br />

                                <span className='col-md-4'>Tình trạng:</span>
                                <b className={ngayNhapHoc ? 'text-success col-md-8' : 'text-secondary col-md-8'}>{tinhTrang}</b>
                            </div>
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right', display: invalid ? 'none' : '' }}>
                            {ngayNhapHoc && showResult && <button className='btn btn-outline-danger' type='button' onClick={this.tuChoiNhapHoc} >
                                <i className='fa fa-fw fa-lg fa-times' />Huỷ nhập học
                            </button>}
                            {!ngayNhapHoc && showResult && <button className='btn btn-outline-success' type='button' onClick={this.chapNhanNhapHoc} >
                                <i className='fa fa-fw fa-lg fa-save' /> Chấp nhận
                            </button>}
                        </div>
                    </div>
                </div>
            </div>,
            backRoute: '/user/students'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    checkSinhVienNhapHoc, setSinhVienNhapHoc, createCauHinhNhapHoc, getCauHinhNhapHoc
};
export default connect(mapStateToProps, mapActionsToProps)(NhapHocPage);
