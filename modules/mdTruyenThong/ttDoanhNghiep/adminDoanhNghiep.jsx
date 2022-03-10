import React from 'react';
import { connect } from 'react-redux';
import { deleteDnDoanhNghiep, createDnDoanhNghiep, updateDnDoanhNghiep, getDnDoanhNghiepPage, getDnDoanhNghiep, approveDnDoanhNghiep } from './reduxDoanhNghiep';
import { SelectAdapter_DmLinhVucKinhDoanhAll } from 'modules/mdDanhMuc/dmLinhVucKinhDoanh/redux';
import { SelectAdapter_DmQuocGiaAll } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { getDnKyKetAll } from 'modules/mdDoiNgoai/dnKyKet/reduxKyKet';
import { getDnTiepDoanAll } from 'modules/mdDoiNgoai/dnTiepDoan/reduxTiepDoan';
import { SelectAdapter_FwCompanyUser } from 'modules/_default/fwUser/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox, renderTable, TableCell, AdminPage, FormImageBox, FormEditor } from 'view/component/AdminPage';

export class AddModal extends AdminModal {
    state = { kichHoat: false, doiTac: false, loading: false };

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal).modal({ backdrop: 'static', keyboard: false, show: false });
            this.onShown(() => this.dnDoanhNghiepTenTiengViet.focus());
        }, 250));
    }

    onShow = () => {
        this.dnDoanhNghiepTenTiengViet.value('');
        this.dnDoanhNghiepTenTiengAnh.value('');
        this.dnDoanhNghiepTenVietTat.value('');
        this.dnDoanhNghiepNamThanhLap.value('');
        this.dnDoanhNghiepSoDienThoai.value('');
        this.dnDoanhNghiepCapDo.value('1');

        this.dnDoanhNghiepEmail.value('');
        this.dnDoanhNghiepWebsite.value('');

        this.dnDoanhNghiepViDiaChi.value('');
        this.dnDoanhNghiepEnDiaChi.value('');

        this.dnDoanhNghiepViTheManh.value('');
        this.dnDoanhNghiepEnTheManh.value('');
        this.ownerDnDoanhNghiep.value('');

        this.setState({ kichHoat: 0, doiTac: 0, ownerEmail: '' });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const newData = {
            tenDayDu: JSON.stringify({ vi: this.dnDoanhNghiepTenTiengViet.value().trim(), en: this.dnDoanhNghiepTenTiengAnh.value().trim() }),
            tenVietTat: this.dnDoanhNghiepTenVietTat.value().trim(),
            linhVucKinhDoanh: this.linhVucKinhDoanh.value().toString(),
            quocGia: this.quocGia.value(),
            kichHoat: Number(this.state.kichHoat),
            doiTac: Number(this.state.doiTac),
            namThanhLap: this.dnDoanhNghiepNamThanhLap.value(),
            phone: this.dnDoanhNghiepSoDienThoai.value().trim(),
            email: this.dnDoanhNghiepEmail.value().trim(),
            website: this.dnDoanhNghiepWebsite.value().trim(),
            capDo: Number(this.dnDoanhNghiepCapDo.value()),
            diaChi: JSON.stringify({ vi: this.dnDoanhNghiepViDiaChi.value().trim(), en: this.dnDoanhNghiepEnDiaChi.value().trim() }),
            theManh: JSON.stringify({ vi: this.dnDoanhNghiepViTheManh.value().trim(), en: this.dnDoanhNghiepEnTheManh.value().trim() }),
            ownerEmail: this.ownerDnDoanhNghiep.value(),
        };
        if (newData.namThanhLap != '') newData.namThanhLap = parseInt(newData.namThanhLap);
        if (this.dnDoanhNghiepTenTiengViet.value().trim() == '') {
            T.notify('Tên tiếng Việt trống', 'danger');
            this.dnDoanhNghiepTenTiengViet.focus();
        } else if (/[a-zA-Z`~!@#$%^&*(){}\[\]|\\;:'"<>,.?/ ]/.test(newData.phone)) {
            T.notify('Số điện thoại chỉ có thể là số', 'danger');
            this.dnDoanhNghiepSoDienThoai.focus();
        } else if (newData.namThanhLap > 9999) {
            T.notify('Năm thành lập không được nhiều hơn 4 số', 'danger');
            this.dnDoanhNghiepNamThanhLap.focus();
        } else if (!Number.isInteger(newData.capDo) || newData.capDo > 99) {
            T.notify('Cấp độ doanh nghiệp là số nguyên dương không nhiều hơn 2 số', 'danger');
            this.dnDoanhNghiepCapDo.focus();
        } else {
            if (newData.tenVietTat == '') delete newData.tenVietTat;
            if (newData.email == '') delete newData.email;
            if (newData.linhVucKinhDoanh == '') delete newData.linhVucKinhDoanh;
            if (newData.namThanhLap == '') delete newData.namThanhLap;
            if (newData.ownerEmail == '') delete newData.ownerEmail;
            if (newData.phone == '') delete newData.phone;
            if (newData.quocGia == null) delete newData.quocGia;
            if (newData.website == '') delete newData.website;
            this.setState({ loading: true });
            this.props.createDnDoanhNghiep(newData, (data) => {
                if (!data.duplicateShortName) {
                    this.setState({ loading: false });
                    if (this.props.saveDoanhNghiepField) {
                        this.props.saveDoanhNghiepField(data.item.id);
                    }
                    this.hide();
                } else {
                    this.setState({ loading: false });
                    this.dnDoanhNghiepTenVietTat.focus();
                }
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin doanh nghiệp',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox ref={e => this.dnDoanhNghiepTenTiengViet = e} className='col-md-6' label='Tên tiếng Việt' readOnly={readOnly} required />
                    <FormTextBox ref={e => this.dnDoanhNghiepTenTiengAnh = e} className='col-md-6' label='Tên tiếng Anh' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepTenVietTat = e} className='col-md-6' label='Tên viết tắt' readOnly={readOnly} />
                    <FormSelect ref={e => this.quocGia = e} className='col-md-6' data={SelectAdapter_DmQuocGiaAll} label='Quốc gia' readOnly={readOnly} />
                    <FormSelect ref={e => this.linhVucKinhDoanh = e} className='col-md-6' readOnly={readOnly} data={SelectAdapter_DmLinhVucKinhDoanhAll} label='Lĩnh vực kinh doanh' multiple />
                    <FormTextBox ref={e => this.dnDoanhNghiepNamThanhLap = e} type='number' className='col-md-6' max='9999' label='Năm thành lập' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepSoDienThoai = e} className='col-md-6' label='Số điện thoại' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepCapDo = e} className='col-md-6' type='number' min='1' max='99' step='1' label='Cấp độ doanh nghiệp' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepEmail = e} className='col-md-6' label='Email' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepWebsite = e} className='col-md-6' label='Website' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepViDiaChi = e} className='col-md-12' label='Địa chỉ' readOnly={readOnly} />
                    <FormTextBox ref={e => this.dnDoanhNghiepEnDiaChi = e} className='col-md-12' label='Address' readOnly={readOnly} />
                    <FormRichTextBox ref={e => this.dnDoanhNghiepViTheManh = e} className='col-md-12' style={{ minHeight: 50 }} label='Thế mạnh' readOnly={readOnly} />
                    <FormRichTextBox ref={e => this.dnDoanhNghiepEnTheManh = e} className='col-md-12' style={{ minHeight: 50 }} label='Strength' readOnly={readOnly} />
                    <FormSelect ref={e => this.ownerDnDoanhNghiep = e} className='col-md-4' data={SelectAdapter_FwCompanyUser} label='Người quản lý' readOnly={readOnly} />
                    <FormCheckbox isSwitch={true} inline={false} className='col-md-4' label='Kích hoạt' onChange={(state) => !readOnly && this.setState({ kichHoat: state })} />
                    <FormCheckbox isSwitch={true} inline={false} className='col-md-4' label='Đối tác' onChange={(state) => !readOnly && this.setState({ doiTac: state })} />
                </div>,
        });
    }
}

class CompareModal extends AdminModal {
    state = { dnDoanhNghiep: null, confirm: -1, image: '/img/avatar.jpg' }

    onShow = (itemId) => {
        this.props.getDnDoanhNghiep(itemId, data => {
            this.setState({ dnDoanhNghiep: data, confirm: data.confirm, image: data.image }, () => {

                if (data.confirm != 1) {
                    let {
                        id = null, tenDayDu = '', tenVietTat = '', namThanhLap = '', phone = '', email = '',
                        diaChi = '', theManh = '', moTa = '', website = '',
                        linhVucKinhDoanh = '', quocGia = '', image = '/img/avatar.jpg',

                        tenDayDuTemp, tenVietTatTemp, namThanhLapTemp, phoneTemp, emailTemp,
                        diaChiTemp, theManhTemp, moTaTemp, websiteTemp,
                        linhVucKinhDoanhTemp, quocGiaTemp, imageTemp
                    } = data;

                    if (!tenDayDuTemp) tenDayDuTemp = tenDayDu;
                    if (!tenVietTatTemp) tenVietTatTemp = tenVietTat;
                    if (!namThanhLapTemp) namThanhLapTemp = namThanhLap;
                    if (!phoneTemp) phoneTemp = phone;
                    if (!emailTemp) emailTemp = email;
                    if (!diaChiTemp) diaChiTemp = diaChi;
                    if (!theManhTemp) theManhTemp = theManh;
                    if (!moTaTemp) moTaTemp = moTa;
                    if (!linhVucKinhDoanhTemp) linhVucKinhDoanhTemp = linhVucKinhDoanh;
                    if (!quocGiaTemp) quocGiaTemp = quocGia;
                    if (!websiteTemp) websiteTemp = website;

                    tenDayDu = T.language.parse(tenDayDu || '', true);
                    diaChi = T.language.parse(diaChi || '', true);
                    theManh = T.language.parse(theManh || '', true);
                    moTa = T.language.parse(moTa || '', true);

                    tenDayDuTemp = T.language.parse(tenDayDuTemp || '', true);
                    diaChiTemp = T.language.parse(diaChiTemp || '', true);
                    theManhTemp = T.language.parse(theManhTemp || '', true);
                    moTaTemp = T.language.parse(moTaTemp || '', true);


                    this.dnDoanhNghiepTenVietTat.value(tenVietTatTemp);
                    this.dnDoanhNghiepTenVietTatText.value(tenVietTat);

                    this.dnDoanhNghiepTenDayDu.value(tenDayDuTemp.vi);
                    this.dnDoanhNghiepTenDayDuText.value(tenDayDu.vi);

                    this.dnDoanhNghiepFullName.value(tenDayDuTemp.en);
                    this.dnDoanhNghiepFullNameText.value(tenDayDu.en);

                    this.dnDoanhNghiepDiaChi.value(diaChiTemp.vi);
                    this.dnDoanhNghiepDiaChiText.value(diaChi.vi);

                    this.dnDoanhNghiepAddress.value(diaChiTemp.en);
                    this.dnDoanhNghiepAddressText.value(diaChi.en);

                    this.dnDoanhNghiepSoDienThoai.value(phoneTemp);
                    this.dnDoanhNghiepSoDienThoaiText.value(phone);

                    this.dnDoanhNghiepEmail.value(emailTemp);
                    this.dnDoanhNghiepEmailText.value(email);

                    this.dnDoanhNghiepTheManh.value(theManhTemp.vi);
                    this.dnDoanhNghiepTheManhText.value(theManh.vi);

                    this.dnDoanhNghiepStrength.value(theManhTemp.en);
                    this.dnDoanhNghiepStrengthText.value(theManh.en);

                    this.dnDoanhNghiepMoTa.html(moTaTemp.vi);
                    this.dnDoanhNghiepDescribe.html(moTaTemp.en);

                    this.dnDoanhNghiepMoTaText.html(moTa.vi);
                    this.dnDoanhNghiepDescribeText.html(moTa.en);

                    this.dnDoanhNghiepNamThanhLap.value(namThanhLapTemp);
                    this.dnDoanhNghiepNamThanhLapText.value(namThanhLap);

                    this.dnDoanhNghiepWebsite.value(websiteTemp);
                    this.dnDoanhNghiepWebsiteText.value(website);

                    this.logoBox.imageBox.setData('dnDoanhNghiep:' + id, image || '/img/avatar.jpg');
                    this.imageBox.imageBox.setData('dnDoanhNghiepTemp:' + id, imageTemp || '/img/avatar.jpg');

                    this.dnDoanhNghiepLinhVuc.value(linhVucKinhDoanhTemp ? linhVucKinhDoanhTemp.split(',') : []);
                    this.dnDoanhNghiepLinhVucText.value(linhVucKinhDoanh ? linhVucKinhDoanh.split(',') : []);
                    this.dnDoanhNghiepQuocGia.value(quocGiaTemp);
                    this.dnDoanhNghiepQuocGiaText.value(quocGia);
                }
            });

        });
    }

    approveDraft = (e, status) => {
        e.preventDefault();
        const dnDoanhNghiep = this.state.dnDoanhNghiep;
        if (dnDoanhNghiep.id) {
            T.confirm('Duyệt doanh nghiệp', `Bạn có chắc muốn ${status ? 'chấp nhận' : 'từ chối'} duyệt sự thay đổi thông tin này từ phía doanh nghiệp?`, 'info', isConfirm => {
                isConfirm && this.props.approveDnDoanhNghiep(dnDoanhNghiep.id, status, () => {
                    this.hide();
                });
            });
        } else {
            T.notify('Mã doanh nghiệp không hợp lệ', 'danger');
        }
    }

    render = () => {
        const dnDoanhNghiep = this.state.dnDoanhNghiep, { confirm } = this.state;
        return this.renderModal({
            title: 'Xét duyệt thông tin doanh nghiệp',
            size: 'extra-large',
            body:
                <>
                    {dnDoanhNghiep && !confirm ? (
                        <React.Fragment>
                            <div className='row'>
                                <div className='col-md-6'>
                                    <h4>Chỉnh sửa mới</h4>
                                    <div className='row'>
                                        <div className='col-md-8'>
                                            <FormTextBox ref={e => this.dnDoanhNghiepTenDayDu = e} label='Tên tiếng Việt' required readOnly />
                                            <FormTextBox ref={e => this.dnDoanhNghiepFullName = e} label='Tên tiếng Anh' readOnly />
                                            <FormTextBox ref={e => this.dnDoanhNghiepTenVietTat = e} label='Tên viết tắt' readOnly />
                                            <FormSelect ref={e => this.dnDoanhNghiepQuocGia = e} data={SelectAdapter_DmQuocGiaAll} label='Quốc gia' readOnly />
                                            <FormTextBox ref={e => this.dnDoanhNghiepNamThanhLap = e} label='Năm thành lập' readOnly />
                                        </div>
                                        <FormImageBox ref={e => this.imageBox = e} className='col-md-4' style={{ width: '100%' }} alt='Temporary Logo' readOnly />
                                    </div>
                                </div>

                                <div className='col-md-6'>
                                    <h4>Thông tin hiện tại</h4>
                                    <div className='row'>
                                        <div className='col-md-8'>
                                            <FormTextBox ref={e => this.dnDoanhNghiepTenDayDuText = e} label='Tên tiếng Việt' required readOnly />
                                            <FormTextBox ref={e => this.dnDoanhNghiepFullNameText = e} label='Tên tiếng Anh' readOnly />
                                            <FormTextBox ref={e => this.dnDoanhNghiepTenVietTatText = e} label='Tên viết tắt' readOnly />
                                            <FormSelect ref={e => this.dnDoanhNghiepQuocGiaText = e} data={SelectAdapter_DmQuocGiaAll} label='Quốc gia' readOnly />
                                            <FormTextBox ref={e => this.dnDoanhNghiepNamThanhLapText = e} label='Năm thành lập' readOnly />
                                        </div>
                                        <FormImageBox ref={e => this.logoBox = e} className='col-md-4' style={{ width: '100%' }} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className='row mt-2'>
                                <FormSelect ref={e => this.dnDoanhNghiepLinhVuc = e} data={SelectAdapter_DmLinhVucKinhDoanhAll} label='Lĩnh vực kinh doanh' className='col-md-6' multiple={true} readOnly />
                                <FormSelect ref={e => this.dnDoanhNghiepLinhVucText = e} data={SelectAdapter_DmLinhVucKinhDoanhAll} label='Lĩnh vực kinh doanh' className='col-md-6' multiple={true} readOnly />
                            </div>

                            <div className='row'>
                                <div className='col-md-6'>
                                    <FormTextBox ref={e => this.dnDoanhNghiepEmail = e} label='Email' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepWebsite = e} label='Website' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepSoDienThoai = e} label='Số điện thoại' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepDiaChi = e} label='Địa chỉ' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepAddress = e} label='Address' readOnly />
                                </div>

                                <div className='col-md-6'>
                                    <FormTextBox ref={e => this.dnDoanhNghiepEmailText = e} label='Email' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepWebsiteText = e} label='Website' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepSoDienThoaiText = e} label='Số điện thoại' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepDiaChiText = e} label='Địa chỉ' readOnly />
                                    <FormTextBox ref={e => this.dnDoanhNghiepAddressText = e} label='Address' readOnly />
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-md-6'>
                                    <FormRichTextBox ref={e => this.dnDoanhNghiepTheManh = e} label='Thế mạnh' readOnly />
                                    <FormRichTextBox ref={e => this.dnDoanhNghiepStrength = e} label='Strength' readOnly />
                                </div>

                                <div className='col-md-6'>
                                    <FormRichTextBox ref={e => this.dnDoanhNghiepTheManhText = e} label='Thế mạnh' readOnly />
                                    <FormRichTextBox ref={e => this.dnDoanhNghiepStrengthText = e} label='Strength' readOnly />
                                </div>
                            </div>

                            <div className='row mt-2'>
                                <div className='col-md-6'>
                                    <FormEditor ref={e => this.dnDoanhNghiepMoTa = e} label='Mô tả' readOnly />
                                </div>

                                <div className='col-md-6'>
                                    <FormEditor ref={e => this.dnDoanhNghiepMoTaText = e} label='Mô tả' readOnly />
                                </div>
                            </div>

                            <div className='row mt-2'>
                                <div className='col-md-6'>
                                    <FormEditor ref={e => this.dnDoanhNghiepDescribe = e} label='Description' readOnly />
                                </div>

                                <div className='col-md-6'>
                                    <FormEditor ref={e => this.dnDoanhNghiepDescribeText = e} label='Description' readOnly />
                                </div>
                            </div>
                        </React.Fragment>
                    ) : <p>Không có chỉnh sửa mới</p>
                    }
                </>,
            buttons:
                <>
                    <button type='button' className='btn btn-danger' onClick={(e) => this.approveDraft(e, false)}>Từ chối</button>
                    <button type='button' className='btn btn-success' onClick={(e) => this.approveDraft(e, true)}>Duyệt</button>
                </>
        });
    }
}

class DoanhNghiepAdminPage extends AdminPage {
    state = { linhVucKinhDoanh: [], quocGia: [] }

    componentDidMount() {
        T.ready('/user/ero', () => {
            T.onSearch = (searchText) => this.props.getDnDoanhNghiepPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDnDoanhNghiepPage(undefined, undefined, undefined, page => {
                T.setTextSearchBox(page.pageCondition || '');
            });
        });
    }

    add = (e) => e.preventDefault() || this.modal.show();

    changeDoiTac = item => this.props.updateDnDoanhNghiep(item.id, { doiTac: Number(!item.doiTac) });
    changeActive = item => this.props.updateDnDoanhNghiep(item.id, { kichHoat: Number(!item.kichHoat) });

    delete = (e, item) => {
        e.preventDefault();
        this.props.getDnKyKetAll({ doanhNghiepId: item.id }, (kyKetItems) => {
            this.props.getDnTiepDoanAll({ donViTiep: item.id }, (tiepDoanItems) => {
                let listKyKet = '';
                if (kyKetItems && kyKetItems.length != 0) {
                    kyKetItems.map(item => {
                        listKyKet += `${T.language.parse(item.tieuDe || '', true).vi}, `;
                    });
                    listKyKet = listKyKet.slice(0, listKyKet.length - 2);
                }
                let listTiepDoan = '';
                if (tiepDoanItems && tiepDoanItems.length != 0) {
                    tiepDoanItems.map(item => {
                        listTiepDoan += `${item.ten}, `;
                    });
                    listTiepDoan = listTiepDoan.slice(0, listTiepDoan.length - 2);
                }
                let message = '';
                if (listKyKet != '') {
                    message += 'Doanh nghiệp liên quan đến ký kết: <strong>' + listKyKet + '</strong>.</br>';
                }
                if (listTiepDoan != '') {
                    message += 'Doanh nghiệp liên quan đến tiếp đoàn: <strong>' + listTiepDoan + '</strong>.</br>';
                }
                message += 'Bạn có chắc bạn muốn xóa doanh nghiệp này?';
                T.confirm('Xóa doanh nghiệp', message, true, isConfirm => isConfirm && this.props.deleteDnDoanhNghiep(item.id));
            });
        });

    }

    showCompareModal = (e, item) => e.preventDefault() || this.compareModal.show(item.id);

    render() {
        const permission = this.getUserPermission('dnDoanhNghiep', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dnDoanhNghiep && this.props.dnDoanhNghiep.page ?
            this.props.dnDoanhNghiep.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có doanh nghiệp!',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '70%' }}>Tên doanh nghiệp</th>
                    <th style={{ width: '30%' }}>Tên viết tắt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Quốc gia</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đối tác</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={'/user/ero/doanh-nghiep/edit/' + item.id} style={{ color: item.confirm == 0 ? 'red' : '' }} content={`${(item.tenDayDu || '').viText()} ${!item.confirm ? '*' : ''}`} />
                    <TableCell content={item.tenVietTat} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenQuocGia} />
                    <TableCell type='image' content={item.image || '/img/bk.png'} />
                    <TableCell type='checkbox' content={item.doiTac} permission={permission} onChanged={() => this.changeDoiTac(item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item)} />
                    <TableCell content={item} type='buttons' style={{ textAlign: 'center' }} permission={permission} onEdit={'/user/ero/doanh-nghiep/edit/' + item.id} onDelete={this.delete}>
                        {permission.write && !item.confirm &&
                            <button className='btn btn-success' onClick={e => this.showCompareModal(e, item)}><i className='fa fa-lg fa-list-alt' /></button>
                        }
                    </TableCell>
                </tr>
            ),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Doanh nghiệp',
            breadcrumbs: [<Link to='/user/ero' key={0}>Quan hệ đối ngoại</Link>, 'Doanh Nghiệp',],
            content:
                <>
                    <div className='tile'>{table}</div>
                    <Pagination name='pageDnDoanhNghiep' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.getDnDoanhNghiepPage} />
                    <AddModal ref={e => this.modal = e} readOnly={!permission.write} createDnDoanhNghiep={this.props.createDnDoanhNghiep} dmQuocGia={this.props.dmQuocGia} dmLinhVucKinhDoanh={this.props.dmLinhVucKinhDoanh} />
                    <CompareModal ref={e => this.compareModal = e} getDnDoanhNghiep={this.props.getDnDoanhNghiep} dmQuocGia={this.props.dmQuocGia} dmLinhVucKinhDoanh={this.props.dmLinhVucKinhDoanh} approveDnDoanhNghiep={this.props.approveDnDoanhNghiep} />
                </>,
            backRoute: '/user/ero',
            onCreate: permission.write ? this.add : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dnDoanhNghiep: state.doiNgoai.doanhNghiep, dmQuocGia: state.danhMuc.dmQuocGia, dmLinhVucKinhDoanh: state.danhMuc.dmLinhVucKinhDoanh });
const mapActionsToProps = { deleteDnDoanhNghiep, createDnDoanhNghiep, updateDnDoanhNghiep, getDnDoanhNghiepPage, getDnDoanhNghiep, approveDnDoanhNghiep, getDnKyKetAll, getDnTiepDoanAll };
export default connect(mapStateToProps, mapActionsToProps)(DoanhNghiepAdminPage);
