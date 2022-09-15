import { SelectAdapter_DmCoSoKcbBhyt } from 'modules/mdDanhMuc/dmCoSoKcbBhyt/redux';
import { ComponentDiaDiem } from 'modules/mdDanhMuc/dmDiaDiem/componentDiaDiem';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmQuanHeGiaDinh } from 'modules/mdDanhMuc/dmQuanHeGiaDinh/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormDatePicker, FormImageBox, FormRichTextBox, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';
import { getSvBaoHiemYTe, updateSvBaoHiemYTeBhyt } from './redux';
class BaoHiemInfoModal extends AdminModal {
    state = { coBhxh: true, dataThanhVien: [] }
    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        let { dienDong, id } = item;
        this.setState({ dienDong, id }, () => {
            switch (dienDong) {
                case '0':
                    this.matTruocThe.setData(`BHYTSV_FRONT:${new Date().getFullYear()}_${id}`);
                    // this.matSauThe.setData(`BHYTSV_BACK:${new Date().getFullYear()}_${id}`);
                    break;
                default:
                    break;
            }
        });
    }

    handleSize = (value) => {
        if (value && value.toString().length > 10) {
            this.maBhxhHienTai.value(value.toString().substring(0, 10));
        }
    }

    handleSizeBhxh = (value) => {
        if (value && value.toString().length > 10) {
            this.maSoBhxh.value(value.toString().substring(0, 10));
        }
    }

    toggleCheckBhxh = (e) => {
        e.preventDefault();
        this.setState({ coBhxh: !this.state.coBhxh });
    }

    addCell = (index) => (<tr>
        <TableCell type='number' content={index + 1} />
        <TableCell content={
            <FormTextBox ref={e => this.hoTen = e} placeholder='Họ và tên' style={{ marginBottom: 0, width: '200px' }} required />
        } />
        <TableCell content={
            <FormTextBox type='number' autoFormat={false} ref={e => this.maSoBhxh = e} placeholder='Mã số BHXH' style={{ marginBottom: 0, width: '120px' }} onChange={this.handleSizeBhxh} />
        } />
        <TableCell content={
            <FormDatePicker type='date-mask' ref={e => this.ngaySinh = e} placeholder='Ngày sinh' style={{ marginBottom: 0, width: '100px' }} required />
        } />
        <TableCell content={
            <FormSelect ref={e => this.gioiTinh = e} placeholder='Giới tính' data={SelectAdapter_DmGioiTinhV2} style={{ marginBottom: 0, width: '100px' }} required />
        } />
        <TableCell content={
            <ComponentDiaDiem ref={e => this.noiCapKhaiSinh = e} placeholder='Nơi cấp khai sinh' fullDisplay noLabel />
        } />
        <TableCell content={
            <FormSelect ref={e => this.moiQuanHeChuHo = e} placeholder='Quan hệ' data={SelectAdapter_DmQuanHeGiaDinh} style={{ marginBottom: 0, width: '100px' }} required />
        } />
        <TableCell content={
            <FormTextBox type='number' autoFormat={false} ref={e => this.cccd = e} placeholder='CMND/CCCD/Hộ chiếu' style={{ marginBottom: 0, width: '200px' }} required />
        } />
        <TableCell content={
            <FormRichTextBox ref={e => this.ghiChu = e} placeholder='Ghi chú' style={{ marginBottom: 0, width: '200px' }} />
        } />
        <TableCell style={{ textAlign: 'center' }} type='buttons'>
            <button className='btn btn-success' type='button' onClick={e => e.preventDefault() || this.addThanhVien(false, index)}>
                <i className='fa fa-lg fa-check' />
            </button>
            <button className='btn btn-danger' type='button' onClick={e => e.preventDefault() || this.setState({ addIndex: null })}>
                <i className='fa fa-lg fa-trash' />
            </button>
        </TableCell>
    </tr>)

    getDataThanhVien = (indexItem) => {
        try {
            let data = {};
            const { maTinhThanhPho: maTinhNoiCapKhaiSinh, maQuanHuyen: maHuyenNoiCapKhaiSinh, maPhuongXa: maXaNoiCapKhaiSinh } = this.noiCapKhaiSinh.value(),
                { tenPhuongXa, tenQuanHuyen, tenTinhThanhPho } = this.noiCapKhaiSinh.getText();
            ['hoTen', 'maSoBhxh', 'gioiTinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach(key => {
                data[key] = getValue(this[key]);
            });
            if (!(maTinhNoiCapKhaiSinh && maHuyenNoiCapKhaiSinh && maXaNoiCapKhaiSinh)) {
                T.notify('Nơi cấp khai sinh trống!', 'danger');
                return false;
            } else if (data.maSoBhxh && data.maSoBhxh.toString().length != 10) {
                this.maSoBhxh.focus();
                T.notify('Mã số BHXH phải chứa 10 ký tự!', 'danger');
                return false;
            }
            else {
                let tenGioiTinh = this.gioiTinh.data().text,
                    tenQuanHe = this.moiQuanHeChuHo.data().text;
                data = Object.assign({}, data, { maTinhNoiCapKhaiSinh, maHuyenNoiCapKhaiSinh, maXaNoiCapKhaiSinh, tenPhuongXa, tenQuanHuyen, tenTinhThanhPho, tenGioiTinh, tenQuanHe, indexItem });
                data.ngaySinh = getValue(this.ngaySinh).getTime();
                return data;
            }
        } catch (error) {
            T.notify('Vui lòng điền đầy đủ thông tin!', 'danger');
            return false;
        }
    }

    addThanhVien = (onSubmit = false, indexItem) => {
        const data = this.getDataThanhVien(indexItem),
            currentData = this.state.dataThanhVien;
        if (data) {
            this.setState({ addIndex: null });
            if (onSubmit) {
                return [...currentData, data];
            } else {
                if (currentData.some(item => item.indexItem == indexItem)) {
                    for (let i = 0, n = currentData.length; i < n; i++) {
                        if (currentData[i].indexItem == data.indexItem) {
                            currentData.splice(i, 1, data);
                            break;
                        }
                    }
                    this.setState({ dataThanhVien: currentData }, () => {
                        ['hoTen', 'maSoBhxh', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach(key => {
                            this[key]?.value('');
                        });
                    });
                } else {
                    this.setState({ dataThanhVien: [...this.state.dataThanhVien, data] }, () => {
                        ['hoTen', 'maSoBhxh', 'gioiTinh', 'ngaySinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu'].forEach(key => {
                            this[key]?.value('');
                        });
                    });
                }
            }
        }
    }

    handleCheckBenhVien = (value) => {
        if (value.loaiDangKy == 1) {
            T.confirm('Cảnh báo', `${value.ten} không cho phép đăng ký mới. Tuy nhiên, nếu bạn muốn gia hạn thẻ cũ, xin vui lòng xác nhận.`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.setState({ isGiaHan: true }, () => {
                        this.matTruocThe.setData(`BHYTSV_FRONT:${new Date().getFullYear()}_${this.state.id}`);
                        // this.matSauThe.setData(`BHYTSV_BACK:${new Date().getFullYear()}_${this.state.id}`);
                    });
                } else {
                    this.setState({ isGiaHan: false });
                    this.benhVienDangKy.value('');
                }
            });
        } else {
            this.setState({ isGiaHan: false });
        }
    }

    elementMienDong = () => {
        return (
            <div className='row'>
                <FormTextBox type='number' autoFormat={false} label='Nhập số BHXH hiện tại' className='col-md-6' smallText='10 chữ số cuối cùng trên thẻ BHYT' onChange={this.handleSize} ref={e => this.maBhxhHienTai = e} required />

                <FormImageBox className='col-md-6' ref={e => this.matTruocThe = e} label={<>Ảnh <b>MẶT TRƯỚC</b> thẻ BHYT hiện tại</>} uploadType='BHYTSV_FRONT' />
                {/* <FormImageBox className='col-md-6' ref={e => this.matSauThe = e} label={<>Ảnh <b>MẶT SAU</b> thẻ BHYT hiện tại</>} uploadType='BHYTSV_BACK' /> */}
            </div>
        );
    }

    elementXacNhan = () => {
        return (<div className='row'>
            <FormTextBox type='number' autoFormat={false} label='Nhập số BHXH hiện tại' className='col-md-12' smallText='10 chữ số cuối cùng trên thẻ BHYT' onChange={this.handleSize} ref={e => this.maBhxhHienTai = e} required />
            <FormSelect ref={e => this.benhVienDangKy = e} label='Đăng ký nơi khám chữa bệnh ban đầu' className='col-md-12' data={SelectAdapter_DmCoSoKcbBhyt()} onChange={this.handleCheckBenhVien} required />
            <FormImageBox className='col-md-12' ref={e => this.matTruocThe = e} label={<>Ảnh <b>MẶT TRƯỚC</b> thẻ BHYT hiện tại</>} uploadType='BHYTSV_FRONT' style={{ display: this.state.isGiaHan ? '' : 'none' }} />
            {/* <FormImageBox className='col-md-6' ref={e => this.matSauThe = e} label={<>Ảnh <b>MẶT SAU</b> thẻ BHYT hiện tại</>} uploadType='BHYTSV_FRONT' style={{ display: this.state.isGiaHan ? '' : 'none' }} /> */}
        </div>);
    }

    thanhVienCell = () => this.state.dataThanhVien.map((item, index) => this.state.addIndex == item.indexItem ? this.addCell(item.indexItem) : (<tr key={index}>
        <TableCell type='number' content={index + 1} />
        <TableCell content={item.hoTen} />
        <TableCell content={item.maSoBhxh} />
        <TableCell type='date' content={parseInt(item.ngaySinh)} dateFormat='dd/mm/yyyy' />
        <TableCell content={item.tenGioiTinh} />
        <TableCell content={`${item.tenPhuongXa}, ${item.tenQuanHuyen}, ${item.tenTinhThanhPho}`} />
        <TableCell content={item.tenQuanHe} />
        <TableCell content={item.cccd} />
        <TableCell content={item.ghiChu} />
        <TableCell type='buttons' content={item} permission={{ write: true, delete: true }}
            onEdit={() => this.setState({ addIndex: item.indexItem }, () => {
                ['hoTen', 'maSoBhxh', 'gioiTinh', 'moiQuanHeChuHo', 'cccd', 'ghiChu', 'ngaySinh'].forEach(key => {
                    this[key]?.value(item[key]);
                });
                this.noiCapKhaiSinh.value(item.maTinhNoiCapKhaiSinh, item.maHuyenNoiCapKhaiSinh, item.maXaNoiCapKhaiSinh);
            })}
            onDelete={() => this.setState({ dataThanhVien: this.state.dataThanhVien.filter(item => item.indexItem != index) })} />
    </tr>))

    elementPhuLucGiaDinh = () => {
        let dataThanhVien = this.state.dataThanhVien;
        return (
            <div style={{ height: '70vh', overflow: 'scroll', margin: '0 20 0 20' }}>
                <div className='row'>
                    <FormSelect ref={e => this.benhVienDangKy = e} label='Đăng ký nơi khám chữa bệnh ban đầu' className='col-md-12' data={SelectAdapter_DmCoSoKcbBhyt(1)} required />

                    <h5 className='col-12' style={{ textAlign: 'center', marginBottom: '1rem' }}>PHỤ LỤC THÀNH VIÊN HỘ GIA ĐÌNH</h5>
                    <FormTextBox ref={e => this.hoTenChuHo = e} label='Họ và tên chủ hộ' className='col-md-6' required />
                    <FormTextBox type='phone' ref={e => this.dienThoaiChuHo = e} label='Số điện thoại chủ hộ' className='col-md-6' required />
                    <ComponentDiaDiem label='Địa chỉ chủ hộ' ref={e => this.diaChiChuHo = e} className='form-group col-md-12' requiredSoNhaDuong />
                    <div className='col-12'>Kê khai đầy đủ, chính xác các thành viên hộ gia đình:</div>
                    <div className='form-group col-12'>
                        {renderTable({
                            getDataSource: () => dataThanhVien.length ? dataThanhVien : [{}],
                            header: 'thead-light',
                            className: 'table-fix-col',
                            renderHead: () => (<tr>
                                <th style={{ width: 'auto' }}>STT</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ và tên</th>
                                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã số BHXH</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi cấp giấy khai sinh</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mối quan hệ <br /> với chủ hộ</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>CMND/CCCD/Hộ chiếu</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                            </tr>),
                            renderRow: <>
                                {dataThanhVien.length ? this.thanhVienCell() : null}
                                {(this.state.addIndex != null && this.state.addIndex == dataThanhVien.length) ? this.addCell(dataThanhVien.length) : null}
                            </>
                        })}
                    </div>
                    <div className='form-group col-md-12' style={{ textAlign: 'center', display: this.state.addIndex == null ? '' : 'none' }}>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.setState({ addIndex: dataThanhVien.length })}>
                            <i className='fa fa-sm fa-plus' /> Thêm thành viên
                        </button>
                    </div>
                </div>
            </div>);
    }

    onSubmit = () => {
        T.confirm('XÁC NHẬN', 'Bạn cam đoan những nội dung kê khai là đúng và chịu trách nhiệm trước pháp luật về những nội dung đã kê khai', 'warning', true, isConfirm => {
            if (isConfirm) {
                switch (this.state.dienDong) {
                    case '0': {
                        const data = {
                            maBhxhHienTai: getValue(this.maBhxhHienTai)
                        };
                        this.props.updateSvBaoHiemYTeBhyt(data, this.hide);
                        break;
                    }
                    case '12':
                    case '15': {
                        if (this.state.coBhxh) {
                            const data = {
                                maBhxhHienTai: getValue(this.maBhxhHienTai),
                                benhVienDangKy: getValue(this.benhVienDangKy),
                                giaHan: Number(this.state.isGiaHan),
                                coBhxh: Number(this.state.coBhxh)
                            };
                            if (data.maBhxhHienTai.toString().length != 10) {
                                this.maBhxhHienTai.focus();
                                return T.notify('Mã BHXH phải chứa 10 ký tự', 'warning');
                            }
                            this.props.updateSvBaoHiemYTeBhyt(data, this.hide);
                            break;
                        } else {
                            const data = {
                                benhVienDangKy: getValue(this.benhVienDangKy),
                            };
                            const { soNhaDuong: soNhaChuHo, maQuanHuyen: maHuyenChuHo, maPhuongXa: maXaChuHo, maTinhThanhPho: maTinhChuHo } = this.diaChiChuHo.value();
                            if (!(soNhaChuHo && maHuyenChuHo && maTinhChuHo && maXaChuHo)) {
                                T.notify('Thông tin địa chỉ chủ hộ trống!', 'danger');
                                break;
                            }
                            const dataChuHo = {
                                hoTenChuHo: getValue(this.hoTenChuHo),
                                dienThoaiChuHo: getValue(this.dienThoaiChuHo),
                                soNhaChuHo, maXaChuHo, maHuyenChuHo, maTinhChuHo,
                            };
                            let thanhVien = this.state.dataThanhVien;
                            if (!thanhVien) {
                                T.notify('Danh sách thành viên phụ lục gia đình trống!', 'danger');
                                break;
                            }
                            this.props.updateSvBaoHiemYTeBhyt({ data, dataChuHo, dataThanhVien: thanhVien, coBhxh: Number(this.state.coBhxh) }, this.hide);
                            break;
                        }
                    }

                    default:
                        T.notify('Invalid value', 'danger');
                        break;
                }
            }
        });
    }

    render = () => {
        let bodyToRender = <></>, subTitle = '';
        let { coBhxh } = this.state;
        switch (this.state.dienDong) {
            case '0':
                bodyToRender = this.elementMienDong();
                subTitle = <small>Bạn đã đăng ký diện <b>Miễn BHYT</b>, vui lòng hoàn thành các trường thông tin dưới đây.</small>;
                break;
            case '12':
            case '15':
                bodyToRender = coBhxh ? this.elementXacNhan() : this.elementPhuLucGiaDinh();
                subTitle = <small>Bạn đã đăng ký tham gia BHYT <b>{this.state.dienDong} tháng</b>. Nếu bạn <b>{this.state.coBhxh ? 'chưa có' : 'đã có'}</b> mã số BHXH vui lòng nhấp vào <a href='#' style={{ textDecoration: 'underline' }} onClick={this.toggleCheckBhxh}>ĐÂY</a> :</small>;
                break;
            default:
                break;
        }
        return this.renderModal({
            title: <>Hoàn thành thông tin BHYT <br />{subTitle}</>,
            size: 'elarge',
            body: bodyToRender,
            showCloseButton: false
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sinhVien: state.sinhVien });
const mapActionsToProps = {
    getSvBaoHiemYTe, updateSvBaoHiemYTeBhyt
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoHiemInfoModal);