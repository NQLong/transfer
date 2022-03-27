import React from 'react';
import { connect } from 'react-redux';
import { updateDnDoanhNghiep, createDnDoanhNghiep, getDnDoanhNghiep } from './reduxDoanhNghiep';
import { SelectAdapter_DmLinhVucKinhDoanhAll } from 'modules/mdDanhMuc/dmLinhVucKinhDoanh/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { Link } from 'react-router-dom';
import { FormEditor, FormSelect, FormTextBox, FormImageBox, AdminPage, FormTabs, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';
import { EditModal } from 'modules/mdDanhMuc/dmLinhVucKinhDoanh/adminPage';
import { createDmLinhVucKinhDoanh } from 'modules/mdDanhMuc/dmLinhVucKinhDoanh/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiDoanhNghiep } from 'modules/mdDanhMuc/dmLoaiDoanhNghiep/redux';
import { LoaiDoanhNghiepEditModal } from 'modules/mdDanhMuc/dmLoaiDoanhNghiep/adminPage';
import { createDmLoaiDoanhNghiep } from 'modules/mdDanhMuc/dmLoaiDoanhNghiep/redux';
class DnDoanhNghiepEditPage extends AdminPage {
    state = { id: null, kichHoat: true, doiTac: false, searching: false, listLinhVuc: null, listLoaiDoanhNghiep: null }
    isNew = false;
    componentDidMount() {

        T.ready('/user/ocer', () => {
            const route = T.routeMatcher('/user/ocer/doanh-nghiep/edit/:doanhNghiepId'),
                doanhNghiepId = route.parse(window.location.pathname).doanhNghiepId;
            this.setState({ id: doanhNghiepId !== 'new' ? doanhNghiepId : null }, () => {
                this.state.id ? this.props.getDnDoanhNghiep(this.state.id, data => {
                    this.getData(data);
                }) : this.getData();
            });
        });
    }

    getData = (data = {}) => {
        let {
            id = null, tenDayDu = '', tenVietTat = '', namThanhLap = '', phone = '', email = '', website = '', capDo = 1,
            diaChi = '', theManh = '', moTa = '', kichHoat = false, doiTac = false, image = '/img/avatar.jpg',
            listLV = [], quocGia = '', donViPhuTrach = '', listLoaiDoanhNghiep = []
        } = data;
        tenDayDu = T.language.parse(tenDayDu || '', true);
        diaChi = T.language.parse(diaChi || '', true);
        theManh = T.language.parse(theManh || '', true);
        moTa = T.language.parse(moTa || '', true);

        this.donViPhuTrach.value(donViPhuTrach);
        this.dnDoanhNghiepViTitle.value(tenDayDu.vi);
        this.dnDoanhNghiepEnTitle.value(tenDayDu.en);

        this.dnDoanhNghiepEditTenVietTat.value(tenVietTat || '');

        this.dnDoanhNghiepEditNamThanhLap.value(namThanhLap || '');
        this.dnDoanhNghiepEditSoDienThoai.value(phone || '');
        this.dnDoanhNghiepEditCapDo.value(capDo || 1);
        console.log(listLoaiDoanhNghiep);
        this.dnLoai.value((listLoaiDoanhNghiep || []).map(item => item.loai));
        this.dnDoanhNghiepEditEmail.value(email || '');
        this.dnDoanhNghiepEditWebsite.value(website || '');

        this.dnDoanhNghiepViDiaChi.value(diaChi.vi);
        this.dnDoanhNghiepEnDiaChi.value(diaChi.en);

        this.dnDoanhNghiepViTheManh.value(theManh.vi);
        this.dnDoanhNghiepEnTheManh.value(theManh.en);

        this.moTaVi.value(moTa.vi);
        this.moTaEn.value(moTa.en);
        this.imageBox.setData('dnDoanhNghiep:' + (id || 'new'), image || '/img/hcmussh.png');
        this.linhVucKinhDoanh.value((listLV || []).map(item => item.linhVuc));
        this.setState({ kichHoat, doiTac, id, listLinhVuc: (listLV || []).map(item => item.linhVuc), listLoaiDoanhNghiep: (listLoaiDoanhNghiep || []).map(item => item.loai) });

        this.kichHoat.value(kichHoat);
        this.doiTac.value(doiTac);
        this.quocGia.value(quocGia || 'VN');
    }

    validate = (selector, type = null) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (type === 'phone' && /[a-zA-Z`~!@#$%^&*(){}\[\]|\\;:'"<>,.?/ ]/.test(data)) {
            T.notify('Số điện thoại chỉ có thể là số', 'danger');
            throw { selector, isNotify: false };
        } else if (type === 'level' && (!Number.isInteger(data) || data > 99)) {
            T.notify('Cấp độ doanh nghiệp là số nguyên dương không nhiều hơn 2 số', 'danger');
            this.dnDoanhNghiepEditCapDo.focus();
            throw { selector, isNotify: false };
        }
        if (data || data === 0) return data;
        if (isRequired) throw { selector, isNotify: true };
        return '';
    };

    viEnValidate = (selectorVi, selectorEn) => {
        return T.stringify({
            vi: this.validate(selectorVi),
            en: this.validate(selectorEn)
        });
    }

    onGetData = () => {
        if (!this.linhVucKinhDoanh.value().length) {
            T.notify('Lĩnh vực kinh doanh trống', 'danger');
            this.linhVucKinhDoanh.focus();
            return false;
        } else if (!this.dnLoai.value().length) {
            T.notify('Loại doanh nghiệp trống', 'danger');
            this.dnLoai.focus();
            return false;
        } else {
            try {
                let data = {
                    donViPhuTrach: this.validate(this.donViPhuTrach),
                    tenDayDu: this.viEnValidate(this.dnDoanhNghiepViTitle, this.dnDoanhNghiepEnTitle),
                    tenVietTat: this.validate(this.dnDoanhNghiepEditTenVietTat),
                    namThanhLap: this.validate(this.dnDoanhNghiepEditNamThanhLap),
                    phone: this.validate(this.dnDoanhNghiepEditSoDienThoai, 'phone'),
                    email: this.validate(this.dnDoanhNghiepEditEmail),
                    website: this.validate(this.dnDoanhNghiepEditWebsite),
                    capDo: this.validate(this.dnDoanhNghiepEditCapDo, 'level'),
                    diaChi: this.viEnValidate(this.dnDoanhNghiepViDiaChi, this.dnDoanhNghiepEnDiaChi),
                    theManh: this.viEnValidate(this.dnDoanhNghiepViTheManh, this.dnDoanhNghiepEnTheManh),
                    moTa: this.viEnValidate(this.moTaVi, this.moTaEn),
                    moTaHopTac: this.viEnValidate(this.moTaHopTacVi, this.moTaHopTacEn),
                    ketQuaHopTac: this.viEnValidate(this.ketQuaHopTacVi, this.ketQuaHopTacEn),
                    ghiChu: this.viEnValidate(this.ghiChuVi, this.ghiChuEn),
                    kichHoat: this.state.kichHoat ? 1 : 0,
                    doiTac: this.state.doiTac ? 1 : 0,
                    quocGia: this.validate(this.quocGia),
                    linhVucs: this.state.listLinhVuc || [],
                    listLoaiDoanhNghiep: this.state.listLoaiDoanhNghiep || []
                };
                return data;
            } catch (error) {
                error.selector.focus();
                error.isNotify && T.notify('<b>' + (error.selector.props.label || error.selector.props.placeholder || 'Có dữ liệu') + '</b> bị trống!', 'danger');
                return false;
            }
        }
    }

    save = (e) => {
        e.preventDefault();
        let data = this.onGetData(), id = this.state.id;
        if (data) {
            id ? this.props.updateDnDoanhNghiep(id, data) : this.props.createDnDoanhNghiep(data, result => {
                this.props.history.push(`/user/ocer/doanh-nghiep/edit/${result.id}`);
                this.setState({ id: result.id });
            });
        }

    }

    onCreateLinhVucKinhDoanh = (data) => {
        let curList = this.state.listLinhVuc;
        this.props.createDmLinhVucKinhDoanh(data, result => {
            if (!result.error) {
                curList.push(result.item.ma);
                this.setState({ listLinhVuc: curList }, () => {
                    this.linhVucKinhDoanh?.value(this.state.listLinhVuc);
                });
            }
            this.modal.hide();
        });
    }
    onCreateDmLoaiDoanhNghiep = (data) => {
        let curList = this.state.listLoaiDoanhNghiep;
        this.props.createDmLoaiDoanhNghiep(data, result => {
            if (!result.error) {
                curList.push(result.item.id);
                this.setState({ listLoaiDoanhNghiep: curList }, () => {
                    this.dnLoai?.value(this.state.listLoaiDoanhNghiep);
                });
            }
            this.modalLoaiDN.hide();
        });
    }

    changeTab = (value) => {
        this.tabs.tabClick(null, value.tabIndex);
    }

    render() {
        const permission = this.getUserPermission('dnDoanhNghiep', ['write']),
            dmLinhVucKinhDoanhPermission = this.getUserPermission('dmLinhVucKinhDoanh', ['write']),
            dmLoaiDoanhNghiepPermission = this.getUserPermission('dmLoaiDoanhNghiep', ['write']),
            readOnly = !permission.write;
        const doanhNghiep = this.props.doanhNghiep && this.props.doanhNghiep.item ? this.props.doanhNghiep.item : {};

        return this.renderPage({
            icon: 'fa fa-university',
            title: <span>Doanh nghiệp: {doanhNghiep && doanhNghiep.tenDayDu ? (<b>{doanhNghiep.tenDayDu.viText()}</b>) : 'Tạo mới'}</span>,
            breadcrumb: [
                <Link to='/user/ocer/doanh-nghiep' key={0}> Danh sách doanh nghiệp</Link>,
                doanhNghiep && doanhNghiep.tenDayDu ? 'Chỉnh sửa ' : 'Tạo mới'],
            content:
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin chung</h3>
                        <div className='tile-body row'>
                            <div className='col-md-8'>
                                <div className='row'>
                                    <FormSelect ref={e => this.donViPhuTrach = e} className='form-group col-md-12' label='Đơn vị phụ trách' data={SelectAdapter_DmDonVi} readOnly={readOnly} required />

                                </div>
                                <FormTabs ref={e => this.tabs = e} tabs={[
                                    {
                                        title: <span>Tên doanh nghiệp <span style={{ color: 'red' }}>*</span></span>,
                                        component: <FormTextBox placeholder='Tên doanh nghiệp' ref={e => this.dnDoanhNghiepViTitle = e} readOnly={readOnly} required />
                                    },
                                    {
                                        title: <span>{'Company\'s name'}</span>,
                                        component: <FormTextBox placeholder={'Company\'s name'} ref={e => this.dnDoanhNghiepEnTitle = e} readOnly={readOnly} />
                                    }
                                ]} onChange={this.changeTab} />
                                <div className='row'>
                                    <div className='col-12 col-md-6'>
                                        <FormTextBox ref={e => this.dnDoanhNghiepEditTenVietTat = e} label='Tên viết tắt / Abbreviations' readOnly={readOnly} required />
                                    </div>
                                    <div className='col-12 col-md-3'>
                                        <FormSelect ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} readOnly={readOnly} required />
                                    </div>
                                    <FormTextBox type='year' ref={e => this.dnDoanhNghiepEditNamThanhLap = e} className='col-md-3' label='Năm thành lập' readOnly={readOnly} />
                                </div>
                            </div>
                            <div className='col-md-4 row'>
                                <FormImageBox ref={e => this.imageBox = e} className='col-md-12' uploadType='doanhNghiepLogo' label='Hình ảnh' />
                                <FormCheckbox ref={e => this.kichHoat = e} isSwitch={true} className='col-md-6' style={{ display: 'inline-flex', margin: 0 }} label='Kích hoạt' readOnly={readOnly} onChange={() => this.setState({ kichHoat: !this.state.kichHoat })} />
                                <FormCheckbox ref={e => this.doiTac = e} isSwitch={true} className='col-md-6' style={{ display: 'inline-flex', margin: 0 }} label='Đối tác' readOnly={readOnly} onChange={() => this.setState({ doiTac: !this.state.doiTac })} />
                            </div>

                            <FormSelect ref={e => this.dnLoai = e} placeholder='Loại doanh nghiệp' className='col-md-6' label={<span>Loại doanh nghiệp {dmLoaiDoanhNghiepPermission.write && <span><Link to='#' onClick={() => this.modalLoaiDN.show(null)}>Nhấn vào đây để thêm loại.</Link></span>}</span>} data={SelectAdapter_DmLoaiDoanhNghiep} onChange={() => this.setState({ listLoaiDoanhNghiep: this.dnLoai.value() })} readOnly={readOnly} multiple={true} required />

                            <FormSelect ref={e => this.linhVucKinhDoanh = e} placeholder='Lĩnh vực kinh doanh' className='col-md-6' label={<span>Lĩnh vực kinh doanh {dmLinhVucKinhDoanhPermission.write && <span><Link to='#' onClick={() => this.modal.show(null)}>Nhấn vào đây để thêm lĩnh vực.</Link></span>}</span>} data={SelectAdapter_DmLinhVucKinhDoanhAll} multiple={true} onChange={() => this.setState({ listLinhVuc: this.linhVucKinhDoanh.value() })} readOnly={readOnly} required />


                            <FormTextBox ref={e => this.dnDoanhNghiepEditSoDienThoai = e} type='phone' className='col-md-5' label='Số điện thoại' readOnly={readOnly} />
                            <FormTextBox ref={e => this.dnDoanhNghiepEditEmail = e} className='col-md-5' label='Email' readOnly={readOnly} />
                            <FormTextBox type='number' ref={e => this.dnDoanhNghiepEditCapDo = e} className='col-md-2' label='Cấp độ' min='1' max='99' readOnly={readOnly} />
                            <FormTextBox ref={e => this.dnDoanhNghiepEditWebsite = e} className='col-md-12' label='Website' readOnly={readOnly} />
                            <div className='col-md-12' >
                                <FormTabs ref={e => this.tabs = e} tabs={[
                                    {
                                        title: <>Địa chỉ <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormTextBox placeholder='Địa chỉ' ref={e => this.dnDoanhNghiepViDiaChi = e} readOnly={readOnly} required />
                                    },
                                    {
                                        title: <>Addresss</>,
                                        component: <FormTextBox placeholder='Address' ref={e => this.dnDoanhNghiepEnDiaChi = e} readOnly={readOnly} />
                                    }
                                ]} onChange={this.changeTab} />
                            </div>
                            <div className='col-md-12' >
                                <FormTabs ref={e => this.tabs = e} tabs={[
                                    {
                                        title: <>Thế mạnh <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormRichTextBox placeholder='Thế mạnh' ref={e => this.dnDoanhNghiepViTheManh = e} readOnly={readOnly} required style={{ minHeight: 50 }} />
                                    },
                                    {
                                        title: <>Strengths</>,
                                        component: <FormRichTextBox placeholder='Strengths' ref={e => this.dnDoanhNghiepEnTheManh = e} readOnly={readOnly} style={{ minHeight: 50 }} />
                                    }
                                ]} onChange={this.changeTab} />
                            </div>
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Mô tả về doanh nghiệp</h3>
                        <div className='tile-body'>
                            <FormTabs ref={e => this.tabs = e} id='dnMoTa' tabs={[
                                {
                                    title: 'Tiếng Việt',
                                    component: <FormEditor placeholder='Mô tả về doanh nghiệp' ref={e => this.moTaVi = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                },
                                {
                                    title: 'Tiếng Anh',
                                    component: <FormEditor placeholder='About company' ref={e => this.moTaEn = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                }
                            ]} onChange={this.changeTab} />
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Mô tả hợp tác</h3>
                        <div className='tile-body'>
                            <FormTabs ref={e => this.tabs = e} id='dnMoTa' tabs={[
                                {
                                    title: 'Tiếng Việt',
                                    component: <FormEditor placeholder='Mô tả hợp tác' ref={e => this.moTaHopTacVi = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                },
                                {
                                    title: 'Tiếng Anh',
                                    component: <FormEditor placeholder='About the cooperation' ref={e => this.moTaHopTacEn = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                }
                            ]} onChange={this.changeTab} />
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Kết quả hợp tác</h3>
                        <div className='tile-body'>
                            <FormTabs ref={e => this.tabs = e} id='dnMoTa' tabs={[
                                {
                                    title: 'Tiếng Việt',
                                    component: <FormEditor placeholder='Kết quả hợp tác' ref={e => this.ketQuaHopTacVi = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                },
                                {
                                    title: 'Tiếng Anh',
                                    component: <FormEditor placeholder='Cooperate result' ref={e => this.ketQuaHopTacEn = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                }
                            ]} onChange={this.changeTab} />
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Ghi chú</h3>
                        <div className='tile-body'>
                            <FormTabs ref={e => this.tabs = e} id='dnMoTa' tabs={[
                                {
                                    title: 'Tiếng Việt',
                                    component: <FormEditor placeholder='Ghi chú' ref={e => this.ghiChuVi = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                },
                                {
                                    title: 'Tiếng Anh',
                                    component: <FormEditor placeholder='Note' ref={e => this.ghiChuEn = e} uploadUrl='/user/upload?category=dnDoanhNghiep' readOnly={readOnly} />
                                }
                            ]} onChange={this.changeTab} />
                        </div>
                    </div>
                    <EditModal ref={e => this.modal = e}
                        permissions={dmLinhVucKinhDoanhPermission}
                        create={this.onCreateLinhVucKinhDoanh}
                    />
                    <LoaiDoanhNghiepEditModal ref={e => this.modalLoaiDN = e}
                        create={this.onCreateDmLoaiDoanhNghiep} permissions={dmLoaiDoanhNghiepPermission} />
                </>,
            backRoute: '/user/ocer/doanh-nghiep',
            onSave: permission.write ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, doanhNghiep: state.doiNgoai.doanhNghiep });
const mapActionsToProps = {
    getDnDoanhNghiep, updateDnDoanhNghiep, createDmLinhVucKinhDoanh, createDnDoanhNghiep, createDmLoaiDoanhNghiep
};
export default connect(mapStateToProps, mapActionsToProps)(DnDoanhNghiepEditPage);