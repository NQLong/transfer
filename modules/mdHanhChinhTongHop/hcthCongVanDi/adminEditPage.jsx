import { SelectAdapter_DmDonVi, SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { createDmDonViGuiCv, SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmLoaiCongVan } from 'modules/mdDanhMuc/dmLoaiCongVan/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy } from '../hcthCongVanTrinhKy/redux';
import { TaoHoSoModal, ThemVaoHoSoModal } from '../hcthHoSo/component';
import { createHoSo, updateHoSo } from '../hcthHoSo/redux';
import { ThemVaoNhiemVuModal } from '../hcthNhiemVu/component';
import { themVaoNhiemVu } from '../hcthNhiemVu/redux';
// import { FileHistoryModal } from './component';
import { LichSu, PhanHoi, VanBanDiFileV2 } from './components/index';
import { formailtyAprrove, contentAprrove, createHcthCongVanDi, createPhanHoi, deleteFile, deleteHcthCongVanDi, getCongVanDi, getFile, getHcthCongVanDiSearchPage, getHistory, getPhanHoi, ready, updateHcthCongVanDi } from './redux';

import { SelectAdapter_DmNgoaiNguV2 } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';

const { loaiCongVan, loaiLienKet, vanBanDi } = require('../constant.js');
const trangThaiCongVanDi = vanBanDi.trangThai;

const getTrangThaiColor = (trangThai) => {
    return vanBanDi.trangThai[trangThai]?.color || 'blue';
};

const getTrangThaiText = (trangThai) => {
    return vanBanDi.trangThai[trangThai]?.text;
};




class AdminEditPage extends AdminPage {
    constructor(props) {
        super(props);
        this.updateFileRef = React.createRef();
    }

    listFileRefs = {};

    state = {
        id: null,
        listFile: [],
        newPhanHoi: [],
        phanHoi: [],
        listDonViQuanLy: [],
        maDonVi: [],
        isLoading: true,
        historySortType: 'DESC',
        laySoTuDong: true
    };

    componentDidMount() {
        const hcthMenu = window.location.pathname.startsWith('/user/hcth');
        T.ready(hcthMenu ? '/user/hcth' : '/user', () => {
            const params = T.routeMatcher(hcthMenu ? '/user/hcth/van-ban-di/:id' : '/user/van-ban-di/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '', maDonVi: '' },
                { shcc, maDonVi } = user;

            let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];

            this.setState({
                id: params.id === 'new' ? null : params.id,
                isLoading: params.id === 'new' ? false : true,
                shcc,
                user,
                listDonViQuanLy: listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi),
                maDonVi: [maDonVi]
            }, () => this.getData());
        });
    }

    isManager = () => {
        const permissions = this.getCurrentPermissions(), donViQuanLy = this.getDonViQuanLy(), donVi = this.getDonVi();
        return permissions.includes('donViCongVanDi:manage') && [...donViQuanLy, donVi].includes(this.state.donViGui);
    }

    isCreator = () => {
        const permissions = this.getCurrentPermissions();
        const shcc = this.props.system.user.shcc;
        return permissions.includes('donViCongVanDi:edit') && this.state.nguoiTao == shcc;
    }

    onReady = () => {
        T.confirm('Hoàn thiện văn bản', 'Các thay đổi đối với văn bản sẽ được lưu và trạng thái văn bản sẽ được cập nhật. Bạn hãy kiểm tra lại các trường dữ liệu trước khi cập nhật văn bản!', 'warning', true, isConfirm =>
            isConfirm && this.save(() => {
                this.props.ready(this.state.id, () => window.location.reload());
            }));
    }

    onContentAprrove = () => {
        T.confirm('Kiểm tra nội dung văn bản', 'Văn bản sẽ được chuyển giao kiểm tra thể thức!', 'warning', true, isConfirm =>
            isConfirm && this.props.contentAprrove(this.state.id, () => window.location.reload())
        );
    }

    onFormalityAprrove = () => {
        T.confirm('Kiểm tra thể thức văn bản', 'Các tệp tin văn bản sẽ được ký!', 'warning', true, isConfirm =>
            isConfirm && this.props.formailtyAprrove(this.state.id, () => window.location.reload())
        );
    }

    getButtons = () => {
        // const shcc = this.props.system.user.shcc;
        const buttons = [];
        // ready button: button cho phep van ban tu nhap -> kiem tra noi dung
        if (!this.state.id) return buttons;
        if ([trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI.id, trangThaiCongVanDi.TRA_LAI_NOI_DUNG.id, trangThaiCongVanDi.TRA_LAI_THE_THUC.id].includes(this.state.trangThai)) {
            if (this.isManager() || this.isCreator())
                buttons.push({ className: 'btn-success', icon: 'fa-check', tooltip: 'Hoàn thiện', onClick: e => e.preventDefault() || this.onReady() });
        }
        if (trangThaiCongVanDi.KIEM_TRA_NOI_DUNG.id == this.state.trangThai) {
            if (this.isManager())
                buttons.push({ className: 'btn-success', icon: 'fa-check-square-o', tooltip: 'Phê duyệt nội dung', onClick: e => e.preventDefault() || this.onContentAprrove() });
        }
        if (trangThaiCongVanDi.KIEM_TRA_THE_THUC.id == this.state.trangThai) {
            if (this.getCurrentPermissions().includes('hcthCongVanDi:manage'))
                buttons.push({ className: 'btn-success', icon: 'fa-certificate', tooltip: 'Phê duyệt thể thức', onClick: e => e.preventDefault() || this.onFormalityAprrove() });
        }
        return buttons;
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/van-ban-di/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/van-ban-di'>Danh sách văn bản đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/van-ban-di'
            };
        else
            return {
                routeMatcherUrl: '/user/van-ban-di/:id',
                readyUrl: '/user',
                breadcrumb: [
                    // <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/van-ban-di'>Danh sách văn bản đi</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/van-ban-di'
            };
    }


    getData = () => {
        if (this.state.id) {
            const queryParams = new URLSearchParams(window.location.search);
            const nhiemVu = queryParams.get('nhiemVu');
            const context = { historySortType: this.state.historySortType };
            if (nhiemVu) context.nhiemVu = nhiemVu;
            this.setState({ isLoading: false });
            this.props.getCongVanDi(Number(this.state.id), context, (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        if (!data) {
            this.danhSachVanBan.setFiles([]);
        } else {

            let { trichYeu, nguoiTao = '', ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, listFile = [], danhSachPhanHoi = [], trangThai, loaiCongVan, loaiVanBan, history = [], soDi, laySoTuDong = true, soCongVan = '', ngoaiNgu, banLuu, files = [] } = data ? data :
                { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai: '', trangThai: '', loaiVanBan: '', loaiCongVan: 'TRUONG', soDi: '', ngoaiNgu: '10', banLuu: '29' };
            console.log({ files });
            this.danhSachVanBan.setFiles(files);
            this.trichYeu.value(trichYeu);
            this.ngayGui.value(ngayGui);
            this.ngayKy.value(ngayKy);
            this.donViGui.value(donViGui);

            this.banLuu.value(banLuu);

            this.loaiVanBan.value(loaiVanBan);
            this.phanHoi?.value('');
            laySoTuDong = Boolean(laySoTuDong);
            this.setState({
                soDi, nguoiTao, trangThai, donViGui, donViNhan, loaiCongVan, history, laySoTuDong, soCongVan, checkDonViGui: this.state.listDonViQuanLy.includes(donViGui), listFile, phanHoi: danhSachPhanHoi
            }, () => {
                this.loaiCongVan.value(loaiCongVan);
                this.trangThai?.value(trangThai || '');
                this.laySoTuDong?.value(this.state.laySoTuDong);
                this.soCongVan?.value(soCongVan);
                // listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri) || '');
            });
            this.donViNhan.value(donViNhan);

            this.donViNhanNgoai.value(donViNhanNgoai ? donViNhanNgoai : '');

            this.canBoNhan.value(canBoNhan ? canBoNhan : '');

            this.ngoaiNgu.value(ngoaiNgu);
        }
    }


    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        setTimeout(() => this.setState({ listFile }), 500);
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValidatedData = () => {
        const changes = {
            trichYeu: this.trichYeu.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            loaiCongVan: this.loaiCongVan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value(),
            canBoNhan: this.canBoNhan.value(),
            donViNhanNgoai: this.donViNhanNgoai.value(),
            loaiVanBan: this.loaiVanBan.value() ? this.loaiVanBan.value().toString() : '',
            laySoTuDong: Number(this.laySoTuDong?.value()),
            soCongVan: this.soCongVan?.value() || null,
            trangThai: this.state.trangThai,
            banLuu: this.banLuu.value(),
            ngoaiNgu: this.ngoaiNgu.value() || null,
            files: this.danhSachVanBan.getFiles()
        };

        if (changes.loaiCongVan == loaiCongVan.TRUONG.id) changes.laySoTuDong = 1;
        if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.loaiCongVan) {
            T.notify('Loại văn bản bị trống', 'danger');
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
            this.trichYeu.focus();
        } else if (!changes.soCongVan && !changes.laySoTuDong) {
            T.notify('Số văn bản trống', 'danger');
            this.soCongVan?.focus();
        } else if (!changes.banLuu.includes('29')) {
            T.notify('Bản lưu phải có phòng HCTH', 'danger');
            changes.banLuu.push('29');
            this.banLuu.value(changes.banLuu);
        }
        else return changes;
        return null;
    }

    save = (done) => {
        const changes = this.getValidatedData();
        if (changes) {
            if (!this.state.trangThai) changes.trangThai = trangThaiCongVanDi.NHAP.id;
            if (this.state.id) {
                this.props.updateHcthCongVanDi(this.state.id, changes, () => (done && done()) || this.getData());
            } else {
                changes.ngayTao = new Date().getTime();
                this.props.createHcthCongVanDi(changes, () => (window.location.pathname.startsWith('/user/hcth') ? this.props.history.push('/user/hcth/van-ban-di') : this.props.history.push('/user/van-ban-di')));
            }
        }
    }

    onCreateDonViNhanNgoai = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({ error, item }) => {
            if (!error) {
                const { id } = item;
                this.donViGui?.value(id);
                done && done({ error, item });
            }
            this.donViGuiNhanModal.hide();
        });
    }


    checkNotDonVi = () => {
        return this.state.id && ((this.state.listDonViQuanLy.length != 0 && !this.state.checkDonViGui) || (this.state.listDonViQuanLy.length == 0 && (this.state.maDonVi != this.state.donViGui)));
    }

    canReadComment = () => {
        return this.state.id && (this.state.trangThai != trangThaiCongVanDi.NHAP.id);
    }

    canReadOnly = () => {
        if (!this.state.id) return false;
        if ([trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI.id, trangThaiCongVanDi.TRA_LAI_NOI_DUNG.id, trangThaiCongVanDi.TRA_LAI_THE_THUC.id].includes(this.state.trangThai))
            return !(this.isManager() || this.isCreator());
        return true;
    }

    canSave = () => {
        if ([trangThaiCongVanDi.NHAP.id, trangThaiCongVanDi.TRA_LAI.id, trangThaiCongVanDi.TRA_LAI_NOI_DUNG.id, trangThaiCongVanDi.TRA_LAI_THE_THUC.id].includes(this.state.trangThai))
            return (this.isManager() || this.isCreator());
        return false;
    }

    onChangeHistorySort = (e) => {
        e.preventDefault();
        const current = this.state.historySortType,
            next = current == 'DESC' ? 'ASC' : 'DESC';
        this.setState({ historySortType: next }, () => this.props.getHistory(this.state.id, { historySortType: this.state.historySortType }));
    }


    render = () => {
        const
            isNew = !this.state.id,
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            { breadcrumb, backRoute } = this.getSiteSetting();

        const titleText = !isNew ? 'Văn bản đi' : 'Tạo mới';

        const lengthDv = this.state.listDonViQuanLy.length;

        // const soCongVan = this.props.hcthCongVanDi?.item?.soCongVan;
        const loaiCongVanArr = Object.values(loaiCongVan);

        const loading = (
            <div className='overlay tile' style={{ minHeight: '120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h4 className='l-text'>Đang tải...</h4>
            </div>);

        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Văn bản đi',
            breadcrumb,
            content: this.state.isLoading ? loading : (<>
                <div className='tile'>
                    <div className='clearfix'>
                        <div className='d-flex justify-content-between'>
                            <h3 className='tile-title'>{titleText}</h3>
                        </div>

                    </div>
                    <div className='tile-body row'>
                        {/* {ref readOnly label className style} */}
                        {this.state.loaiCongVan != loaiCongVan.TRUONG.id && <FormCheckbox ref={e => this.laySoTuDong = e} readOnly={this.canReadOnly()} className='col-md-12' label='Lấy số tự động' onChange={value => this.setState({ laySoTuDong: value })} isSwitch />}
                        {/* {
                            (!this.state.laySoTuDong || (this.canSeeNumber() && soCongVan)) &&
                            <FormTextBox ref={e => this.soCongVan = e} readOnly={this.canReadOnly() || this.state.laySoTuDong} className='col-md-12' label='Số văn bản' required={!this.state.laySoTuDong} />
                        } */}
                        <FormDatePicker ref={e => this.ngayGui = e} readOnly={this.canReadOnly()} label='Ngày gửi' className='col-md-6' type='date-mask' readOnlyEmptyText='Chưa có ngày gửi' />
                        <FormDatePicker ref={e => this.ngayKy = e} readOnly={this.canReadOnly()} label='Ngày ký' className='col-md-6' type='date-mask' readOnlyEmptyText='Chưa có ngày ký' />
                        {this.state.id && <span className='form-group col-md-12'>Trạng thái: <b style={{ color: this.state.trangThai ? getTrangThaiColor(this.state.trangThai) : 'blue' }}>{getTrangThaiText(this.state.trangThai)}</b></span>}

                        <FormSelect ref={e => this.donViGui = e} readOnly={this.canReadOnly()} label='Đơn vị gửi' placeholder='Chọn đơn vị gửi' className='col-md-12' data={SelectAdapter_DmDonViFilter(lengthDv != 0 ? this.state.listDonViQuanLy : this.state.maDonVi)} required readOnlyEmptyText='Chưa có đơn vị gửi' />
                        <FormSelect ref={e => this.loaiCongVan = e} readOnly={this.canReadOnly()} disabled={this.state.id && this.state.trangThai != trangThaiCongVanDi.NHAP.id} label='Cấp văn bản' placeholder='Chọn cấp văn bản' className='col-md-6' data={loaiCongVanArr} readOnlyEmptyText='Chưa có loại văn bản' required />
                        <FormSelect className='col-md-6' allowClear={true} label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có loại văn bản' />
                        <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Chọn đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label={(<span onClick={(e) => e.stopPropagation()}>
                            <span style={{ marginRight: '2px' }}>Đơn vị nhận bên ngoài</span>
                            {!this.canReadOnly() && <>
                                (
                                <Link to='#' onClick={() => this.donViGuiNhanModal.show(null)}>Nhấn vào đây để thêm</Link>
                                ) </>
                            }
                        </span>)} placeholder='Chọn đơn vị nhận bên ngoài' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có đơn vị nhận' />
                        <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có cán bộ nhận' />

                        <FormSelect multiple={true} className='col-md-12' label='Bản lưu' placeholder='Chọn bản lưu' ref={e => this.banLuu = e} data={SelectAdapter_DmDonVi} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có bản lưu' />

                        <FormSelect className='col-md-12' label='Ngôn ngữ' placeholder='Chọn ngôn ngữ' ref={e => this.ngoaiNgu = e} readOnly={this.canReadOnly()} readOnlyEmptyText='Chưa có ngôn ngữ' data={SelectAdapter_DmNgoaiNguV2} />

                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={this.canReadOnly()} required readOnlyEmptyText='Chưa có trích yếu' />
                        {/* {TODO} */}
                        {this.state.id && <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <button type='submit' className='btn btn-success mr-2' onClick={e => { e.preventDefault(); this.taoHoSoModal.show(); }}>
                                <i className='fa fa-plus'></i>Tạo hồ sơ
                            </button>
                            <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoHoSoModal.show(); }}>
                                <i className='fa fa-arrow-up'></i>Thêm vào hồ sơ
                            </button>

                            <button type='submit' className='btn btn-primary mr-2' onClick={e => { e.preventDefault(); this.themVaoNhiemVuModal.show(); }} >
                                <i className='fa fa-arrow-up'></i>Thêm vào nhiệm vụ
                            </button>
                        </div>}
                    </div>
                </div>
                {this.canReadComment() && <PhanHoi id={this.state.id} trangThai={this.state.trangThai} donViGui={this.state.donViGui} isManager={this.isManager()} />}
                <VanBanDiFileV2 ref={e => this.danhSachVanBan = e} getFile={this.props.getFile} id={this.state.id} />
                {this.state.id && <LichSu onChangeSort={this.onChangeHistorySort} historySortType={this.state.historySortType} />}

                <EditModal ref={e => this.donViGuiNhanModal = e} permissions={dmDonViGuiCvPermission} create={this.onCreateDonViNhanNgoai} />
                <TaoHoSoModal ref={e => this.taoHoSoModal = e} create={this.props.createHoSo} />
                <ThemVaoHoSoModal ref={e => this.themVaoHoSoModal = e} add={this.props.updateHoSo} vanBanId={this.state.id} />
                <ThemVaoNhiemVuModal ref={e => this.themVaoNhiemVuModal = e} vanBanId={this.state.id} add={this.props.themVaoNhiemVu} loaiVanBan={loaiLienKet.VAN_BAN_DI.id} />
                {/* <FileHistoryModal ref={e => this.historyFileMoal = e} data={groupListFile} fileId={this.state.updateFileId} isShowSubmit={false} /> */}
            </>),
            backRoute,
            onSave: this.canSave() && this.save,
            buttons: this.getButtons(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = { formailtyAprrove, contentAprrove, getFile, createHcthCongVanDi, updateHcthCongVanDi, deleteHcthCongVanDi, getHcthCongVanDiSearchPage, deleteFile, getCongVanDi, createPhanHoi, getHistory, getPhanHoi, createDmDonViGuiCv, createCongVanTrinhKy, deleteCongVanTrinhKy, updateCongVanTrinhKy, createHoSo, updateHoSo, themVaoNhiemVu, ready };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);