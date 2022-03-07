import React from 'react';
import { connect } from 'react-redux';
import { updateDnDoanhNghiep, getDnDoanhNghiep } from './reduxDoanhNghiep';
import { SelectAdapter_DmLinhVucKinhDoanhAll } from 'modules/mdDanhMuc/dmLinhVucKinhDoanh/redux';
import { getDnNguoiLienHeAll, updateDnNguoiLienHe, deleteDnNguoiLienHe, createDnNguoiLienHe } from './reduxNguoiLienHe';
import { SelectAdapter_Category } from 'modules/_default/fwCategory/redux';
import { SelectAdapter_DmQuocGiaAll } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_FwCompanyUser } from 'modules/_default/fwUser/redux';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { Link } from 'react-router-dom';
import { AdminModal, FormEditor, FormSelect, FormTextBox, FormImageBox, renderTable, TableCell, AdminPage, FormTabs, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditNguoiLienHeModal extends AdminModal {
    state = { doanhNghiep: null };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.dnNguoiLienHeHo.focus()));
    }

    onShow = (item) => {
        let { id, ho, ten, chucVu, email, soDienThoai, gioiTinh } = item ? item : { id: '', ho: '', ten: '', chucVu: '', email: '', soDienThoai: '', gioiTinh: '' };
        this.dnNguoiLienHeHo.value(ho || '');
        this.dnNguoiLienHeTen.value(ten || '');
        this.dnNguoiLienHeChucVu.value(chucVu || '');
        this.dnNguoiLienHeEmail.value(email || '');
        this.dnNguoiLienHeSoDienThoai.value(soDienThoai || '');
        this.gioiTinh.value(gioiTinh);
        this.data('data-id', id);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const id = this.data('data-id'),
            changes = {
                ho: this.dnNguoiLienHeHo.value()?.trim(),
                ten: this.dnNguoiLienHeTen.value()?.trim(),
                chucVu: this.dnNguoiLienHeChucVu.value()?.trim(),
                email: this.dnNguoiLienHeEmail.value()?.trim(),
                soDienThoai: this.dnNguoiLienHeSoDienThoai.value()?.trim(),
                doanhNghiepId: this.props.doanhNghiepId,
                gioiTinh: this.gioiTinh.value()
            };
        if (changes.ho == '') {
            T.notify('Họ  bị trống', 'danger');
            this.dnNguoiLienHeHo.focus();
        } else if (changes.ten == '') {
            T.notify('Tên bị trống', 'danger');
            this.dnNguoiLienHeTen.focus();
        } else if (changes.soDienThoai && /[a-zA-Z`~!@#$%^&*(){}\[\]|\\;:'"<>,.?/ ]/.test(changes.soDienThoai)) {
            T.notify('Số điện thoại chỉ có thể là số', 'danger');
            this.dnNguoiLienHeSoDienThoai.focus();
        } else if (!changes.gioiTinh) {
            T.notify('Giới tính chưa được chọn!', 'danger');
            this.gioiTinh.focus();
        } else {
            if (id) {
                this.props.updateDnNguoiLienHe(id, changes, (data) => {
                    if (data.duplicateEmail) {
                        this.dnNguoiLienHeEmail.focus();
                    } else if (!data.error) {
                        this.hide();
                        this.props.getData();
                    }
                });
            } else {
                this.props.createDnNguoiLienHe(changes, (data) => {
                    if (data.duplicateEmail) {
                        this.dnNguoiLienHeEmail.focus();
                    } else if (!data.error) {
                        this.hide();
                        this.props.getData();
                    }
                });
            }
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin người liên hệ',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox ref={e => this.dnNguoiLienHeHo = e} className='col-md-6' label='Họ' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeTen = e} className='col-md-6' label='Tên' required readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeChucVu = e} className='col-md-6' label='Chức vụ' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeEmail = e} className='col-md-6' label='Email' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnNguoiLienHeSoDienThoai = e} className='col-md-6' label='Số điện thoại' readOnly={readOnly} />
                    <FormSelect ref={e => this.gioiTinh = e} data={SelectAdapter_DmGioiTinhV2} className='col-md-6' label='Giới tính' required readOnly={readOnly} />
                </div>
        });
    }
}

class DnDoanhNghiepEditPage extends AdminPage {
    state = { id: null, kichHoat: true, doiTac: false, searching: false }

    componentDidMount() {
        T.ready('/user/ero', this.getData);
    }

    getData = () => {
        const route = T.routeMatcher('/user/ero/doanh-nghiep/edit/:doanhNghiepId'),
            doanhNghiepId = route.parse(window.location.pathname).doanhNghiepId;
        this.props.getDnDoanhNghiep(doanhNghiepId, data => {
            let {
                id = null, tenDayDu = '', tenVietTat = '', namThanhLap = '', phone = '', email = '', website = '', capDo = 1,
                diaChi = '', theManh = '', moTa = '', kichHoat = false, doiTac = false, image = '/img/avatar.jpg',
                linhVucKinhDoanh = '', quocGia = '', confirm = false, ownerEmail = '', loaiDoanhNghiep = []
            } = data;
            tenDayDu = T.language.parse(tenDayDu || '', true);
            diaChi = T.language.parse(diaChi || '', true);
            theManh = T.language.parse(theManh || '', true);
            moTa = T.language.parse(moTa || '', true);

            this.props.getDnNguoiLienHeAll({ doanhNghiepId: id });

            this.dnDoanhNghiepViTitle.value(tenDayDu.vi);
            this.dnDoanhNghiepEnTitle.value(tenDayDu.en);

            this.dnDoanhNghiepEditTenVietTat.value(tenVietTat || '');

            this.dnDoanhNghiepEditNamThanhLap.value(namThanhLap || '');
            this.dnDoanhNghiepEditSoDienThoai.value(phone || '');
            this.dnDoanhNghiepEditCapDo.value(capDo || 1);

            this.dnLoai.value((loaiDoanhNghiep || []).map(item => item.idDanhMuc));
            this.dnDoanhNghiepEditEmail.value(email || '');
            this.dnDoanhNghiepEditWebsite.value(website || '');

            this.dnDoanhNghiepViDiaChi.value(diaChi.vi);
            this.dnDoanhNghiepEnDiaChi.value(diaChi.en);

            this.dnDoanhNghiepViTheManh.value(theManh.vi);
            this.dnDoanhNghiepEnTheManh.value(theManh.en);

            this.moTaVi.value(moTa.vi);
            this.moTaEn.value(moTa.en);
            this.imageBox.setData('dnDoanhNghiep:' + (id || 'new'), image || '/img/bk.png');
            this.setState({ kichHoat, doiTac, id, confirm, ownerEmail });

            this.kichHoat.value(kichHoat);
            this.doiTac.value(doiTac);

            this.linhVucKinhDoanh.value(linhVucKinhDoanh ? linhVucKinhDoanh.split(',') : null);
            this.quocGia.value(quocGia || 'VN');
            this.ownerDnDoanhNghiep.value(ownerEmail);
        });
    }

    editNguoiLienHe = (e, item) => e.preventDefault() || this.nguoiLienHeModal.show(item);

    deleteNguoiLienHe = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa người liên hệ', 'Bạn có chắc bạn muốn xóa người liên hệ này?', true, isConfirm =>
            isConfirm && this.props.deleteDnNguoiLienHe(item.id, () => this.getData()));
    }

    save = (e) => {
        e.preventDefault();
        const id = this.state.id,
            changes = {
                tenDayDu: JSON.stringify({ vi: this.dnDoanhNghiepViTitle.value().trim(), en: this.dnDoanhNghiepEnTitle.value().trim() }),
                tenVietTat: this.dnDoanhNghiepEditTenVietTat.value().trim(),
                namThanhLap: this.dnDoanhNghiepEditNamThanhLap.value(),
                phone: this.dnDoanhNghiepEditSoDienThoai.value().trim(),
                email: this.dnDoanhNghiepEditEmail.value().trim(),
                website: this.dnDoanhNghiepEditWebsite.value().trim(),
                capDo: Number(this.dnDoanhNghiepEditCapDo.value()),
                diaChi: JSON.stringify({ vi: this.dnDoanhNghiepViDiaChi.value().trim(), en: this.dnDoanhNghiepEnDiaChi.value().trim() }),
                theManh: JSON.stringify({ vi: this.dnDoanhNghiepViTheManh.value().trim(), en: this.dnDoanhNghiepEnTheManh.value().trim() }),
                moTa: JSON.stringify({ vi: this.moTaVi.value(), en: this.moTaEn.value() }),
                kichHoat: Number(this.state.kichHoat),
                doiTac: Number(this.state.doiTac),
                linhVucKinhDoanh: this.linhVucKinhDoanh.value().toString(),
                quocGia: this.quocGia.value(),
                ownerEmail: this.ownerDnDoanhNghiep.value(),
                loaiDoanhNghiep: this.dnLoai.value()
            };
        if (changes.namThanhLap != '') changes.namThanhLap = parseInt(changes.namThanhLap);
        if (changes.loaiDoanhNghiep.length == 0) changes.loaiDoanhNghiep = 'empty';

        if (this.dnDoanhNghiepViTitle.value().trim() == '') {
            T.notify('Tên tiếng Việt trống', 'danger');
            this.dnDoanhNghiepViTitle.focus();
        } else if (this.dnDoanhNghiepEnTitle.value().trim() == '') {
            T.notify('Tên tiếng Anh trống', 'danger');
            this.dnDoanhNghiepEnTitle.focus();
        } else if (changes.tenVietTat == '') {
            T.notify('Tên viết tắt trống', 'danger');
            this.dnDoanhNghiepEditTenVietTat.focus();
        } else if (!changes.quocGia) {
            T.notify('Chưa chọn quốc gia', 'danger');
            this.quocGia.focus();
        } else if (changes.namThanhLap && changes.namThanhLap > 9999) {
            T.notify('Năm thành lập không được nhiều hơn 4 số', 'danger');
            this.dnDoanhNghiepEditNamThanhLap.focus();
        } else if (/[a-zA-Z`~!@#$%^&*(){}\[\]|\\;:'"<>,.?/ ]/.test(changes.phone)) {
            T.notify('Số điện thoại chỉ có thể là số', 'danger');
            this.dnDoanhNghiepEditSoDienThoai.focus();
        } else if (!changes.capDo || !Number.isInteger(changes.capDo) || changes.capDo > 99) {
            T.notify('Cấp độ doanh nghiệp là số nguyên dương không nhiều hơn 2 số', 'danger');
            this.dnDoanhNghiepEditCapDo.focus();
        } else {
            this.props.updateDnDoanhNghiep(id, changes);
        }
    }

    render() {
        const permission = this.getUserPermission('dnDoanhNghiep', ['write']),
            permissionNguoiLienHe = this.getUserPermission('dnNguoiLienHe', ['write', 'delete']);
        const doanhNghiep = this.props.doanhNghiep && this.props.doanhNghiep.item ? this.props.doanhNghiep.item : {};
        const table = renderTable({
            getDataSource: () => this.props.nguoiLienHe && this.props.nguoiLienHe.items ? this.props.nguoiLienHe.items : [],
            emptyTable: 'Không có người liên hệ',
            style: { paddingBottom: '30px' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Tên người liên hệ</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' onClick={e => this.editNguoiLienHe(e, item)} content={item.ho + ' ' + item.ten} />
                    <TableCell content={item.email} />
                    <TableCell content={item.soDienThoai} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.chucVu} />
                    <TableCell content={item} type='buttons' style={{ textAlign: 'center' }} permission={permissionNguoiLienHe} onEdit={this.editNguoiLienHe} onDelete={this.deleteNguoiLienHe} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: <span>Doanh nghiệp: {doanhNghiep && doanhNghiep.tenDayDu ? (<b>{doanhNghiep.tenDayDu.viText()}</b>) : ''}</span>,
            breadcrumb: [<Link to='/user/ero/doanh-nghiep' key={0}> Danh sách doanh nghiệp</Link>, 'Chỉnh sửa'],
            content:
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin chung</h3>
                        <div className='tile-body row'>
                            <div className='col-md-8'>
                                <FormTextBox ref={e => this.dnDoanhNghiepViTitle = e} label='Tên doanh nghiệp' readOnly={!permission.write} required />
                                <FormTextBox ref={e => this.dnDoanhNghiepEnTitle = e} label='Company name' readOnly={!permission.write} required />
                                <div className='row'>
                                    <div className='col-12 col-md-6'>
                                        <FormTextBox ref={e => this.dnDoanhNghiepEditTenVietTat = e} label='Tên viết tắt' readOnly={!permission.write} required />
                                    </div>
                                    <div className='col-12 col-md-6'>
                                        <FormSelect ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGiaAll} readOnly={!permission.write} required />
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4 row'>
                                <FormImageBox ref={e => this.imageBox = e} className='col-md-12' uploadType='doanhNghiepLogo' label='Hình ảnh' />
                                <FormCheckbox ref={e => this.kichHoat = e} isSwitch={true} inline={false} className='col-md-6' style={{ display: 'inline-flex', margin: 0 }} label='Kích hoạt' readOnly={!permission.write} onChange={() => this.setState({ kichHoat: !this.state.kichHoat })} />
                                <FormCheckbox ref={e => this.doiTac = e} isSwitch={true} inline={false} className='col-md-6' style={{ display: 'inline-flex', margin: 0 }} label='Đối tác' readOnly={!permission.write} onChange={() => this.setState({ doiTac: !this.state.doiTac })} />
                            </div>
                            <FormSelect ref={e => this.linhVucKinhDoanh = e} className='col-md-8' label='Lĩnh vực kinh doanh' data={SelectAdapter_DmLinhVucKinhDoanhAll} multiple={true} readOnly={!permission.write} required />
                            <FormTextBox type='year' ref={e => this.dnDoanhNghiepEditNamThanhLap = e} className='col-md-4' label='Năm thành lập' readOnly={!permission.write} />
                            <FormSelect ref={e => this.dnLoai = e} className='col-md-6' label='Loại doanh nghiệp' data={SelectAdapter_Category('doanhNghiep')} multiple readOnly={!permission.write} />
                            <FormSelect ref={e => this.ownerDnDoanhNghiep = e} className='col-md-4' label='Người đại diện' data={SelectAdapter_FwCompanyUser} readOnly={!permission.write} required />
                            <div className='col-md-2 form-group'>
                                <label>&nbsp;</label><br />
                                <button className='btn btn-success' style={{ width: '100%' }}><i className='fa fa-plus' /> Thêm mới</button>
                            </div>
                            <FormTextBox ref={e => this.dnDoanhNghiepEditSoDienThoai = e} type='phone' className='col-md-6' label='Số điện thoại' readOnly={!permission.write} />
                            <FormTextBox type='number' ref={e => this.dnDoanhNghiepEditCapDo = e} className='col-md-6' label='Cấp độ' min='1' max='99' readOnly={!permission.write} />
                            <FormTextBox ref={e => this.dnDoanhNghiepEditEmail = e} className='col-md-6' label='Email' readOnly={!permission.write} />
                            <FormTextBox ref={e => this.dnDoanhNghiepEditWebsite = e} className='col-md-6' label='Website' readOnly={!permission.write} />
                            <FormTextBox ref={e => this.dnDoanhNghiepViDiaChi = e} className='col-md-6' label='Địa chỉ' readOnly={!permission.write} />
                            <FormTextBox ref={e => this.dnDoanhNghiepEnDiaChi = e} className='col-md-6' label='Address' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.dnDoanhNghiepViTheManh = e} className='col-md-12' style={{ minHeight: 50 }} label='Thế mạnh' readOnly={!permission.write} />
                            <FormRichTextBox ref={e => this.dnDoanhNghiepEnTheManh = e} className='col-md-12' style={{ minHeight: 50 }} label='Strength' readOnly={!permission.write} />
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Mô tả doanh nghiệp</h3>
                        <div className='tile-body'>
                            <FormTabs ref={e => this.tabs = e} id='dnMoTa' tabs={[
                                {
                                    title: 'Tiếng Việt',
                                    component: <FormEditor ref={e => this.moTaVi = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={!permission.write} />
                                },
                                {
                                    title: 'Tiếng Anh',
                                    component: <FormEditor ref={e => this.moTaEn = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={!permission.write} />
                                }
                            ]} />
                        </div>
                    </div>

                    <div className='tile' style={{ position: 'relative' }}>
                        <h3 className='tile-title'>Danh sách người liên hệ doanh nghiệp</h3>
                        <div className='tile-body'>
                            {table}
                        </div>
                        {permissionNguoiLienHe.write &&
                        <div className='tile-footer text-right'>
                            <button className='btn btn-success btn-sm' type='button' onClick={(e) => this.editNguoiLienHe(e)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm người liên hệ
                            </button>
                        </div>}
                    </div>
                    <EditNguoiLienHeModal ref={e => this.nguoiLienHeModal = e} readOnly={!permissionNguoiLienHe.write} dnNguoiLienHe={this.props.nguoiLienHe} doanhNghiepId={doanhNghiep.id} createDnNguoiLienHe={this.props.createDnNguoiLienHe} updateDnNguoiLienHe={this.props.updateDnNguoiLienHe} getData={this.getData} />
                </>,
            backRoute: () => this.props.history.goBack(),
            onSave: permission.write ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, doanhNghiep: state.doiNgoai.doanhNghiep, nguoiLienHe: state.doiNgoai.nguoiLienHe, user: state.framework.user });
const mapActionsToProps = {
    getDnDoanhNghiep, updateDnDoanhNghiep,
    getDnNguoiLienHeAll, updateDnNguoiLienHe, deleteDnNguoiLienHe, createDnNguoiLienHe
};
export default connect(mapStateToProps, mapActionsToProps)(DnDoanhNghiepEditPage);