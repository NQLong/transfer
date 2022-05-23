import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormCheckbox, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { CanBoNhan, History, LienKet, ListFiles, PhanHoi } from './component';
import { clearHcthNhiemVu, completeNhiemVu, closeNhiemVu, reopenNhiemVu, createCanBoNhanNhiemVu, createLienKet, createNhiemVu, createPhanHoi, deleteFile, deleteLienKet, deleteNhiemVu, getCongVanCacPhongSelector, getCongVanDenSelector, getHistory, getLienKet, getListCanBoNhanNhiemVu, getNhiemVu, getPhanHoi, removeCanBoNhanNhiemVu, searchNhiemVu, updateCanBoNhanNhiemVu, updateLienKet, updateNhiemVu } from './redux';
const { doUuTienMapper, vaiTro, trangThaiNhiemVu } = require('../constant');

// const tienDoSelector = [...Array(11).keys()].map(i => ({ id: i * 10, text: `${i * 10}%` }));

class AdminEditPage extends AdminPage {
    listFileRefs = {};
    state = { id: null, listFile: [], newPhanHoi: [], phanHoi: [], listCanBo: [], listLienKet: [], lienPhong: 0, donViNhan: [], trangThaiAdapter: [], trangThai: trangThaiNhiemVu.DONG.id }

    tableListFile = (data, id, sitePermission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có tập tin nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap' }}>Tên tập tin</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const
                timeStamp = item.thoiGian,
                originalName = item.ten,
                linkFile = `/api/hcth/nhiem-vu/download/${id || 'new'}/${originalName}`;
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell content={(
                        sitePermission.editGeneral ? <FormTextBox type='text' placeholder='Nhập ghi chú' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[item.id] = e} onChange={e => this.onViTriChange(e, item.id, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: sitePermission.delete }} onDelete={!sitePermission.delete ? null : e => this.deleteFile(e, index, item)}>
                        <a className='btn btn-info' href={linkFile} download title='Tải về'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });

    componentDidMount() {
        const { readyUrl, routeMatcherUrl } = this.getSiteSetting();
        T.ready(readyUrl, () => {
            const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
                { staff } = user;
            this.setState({
                id: params.id === 'new' ? null : params.id, maDonVi: staff.maDonVi
            }, () => this.getData());
        });
    }

    // EditModal
    getData = () => {
        if (this.state.id) {
            this.props.getNhiemVu(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {

        let { tieuDe, noiDung, ngayTao, ngayBatDau, ngayKetThuc, donViNhan, doUuTien, phanHoi = [], listFile = [], lienKet = [], lienPhong = 0, canBoNhan = [], nguoiTao, trangThai = trangThaiNhiemVu.MO.id } = data ? data :
            { tieuDe: '', noiDung: '', ngayTao: '', ngayBatDau: '', ngayKetThuc: '', donViNhan: [], doUuTien: doUuTienMapper.NORMAL.id, lienKet, lienPhong: 0, canBoNhanNhiemVu: {}, nguoiTao: '' };

        this.ngayTao?.value(ngayTao || '');
        this.nguoiTao?.value(nguoiTao || '');
        this.tieuDe.value(tieuDe || '');
        this.noiDung.value(noiDung || '');
        this.ngayBatDau.value(ngayBatDau || '');
        this.ngayKetThuc.value(ngayKetThuc || '');
        this.doUuTien.value(doUuTien || '');
        this.lienPhong.value(lienPhong);
        if (!this.state.id) {
            this.props.clearHcthNhiemVu();
        }

        const isCreator = this.state.id ? this.props.hcthNhiemVu?.item?.nguoiTao == this.props.system?.user?.shcc : true;
        const isManager = canBoNhan.some(item => item.vaiTro == vaiTro.MANAGER.id && item.shccCanBoNhan == this.props.system?.user?.shcc);
        this.setState({ phanHoi, listFile, lienKet, nguoiTao, lienPhong, donViNhan, doUuTien, isCreator, isManager, trangThai }, () => {
            this.trangThai?.value(trangThai || '');

            if (donViNhan.length > 0) {
                if (lienPhong)
                    this.listDonViNhan.value(donViNhan.map(item => item.donViNhan));
                else
                    this.donViNhan.value(donViNhan[0].donViNhan);
            }
            // this.tienDo?.value(tienDo);
            // this.trangThai?.value(trangThai);

            listFile.map((item) => this.listFileRefs[item.id]?.value(item.viTri || ''));
            this.fileBox?.setData('hcthNhiemVuFile:' + (this.state.id ? this.state.id : 'new'));
        });

    };

    save = () => {
        let changes = {
            nguoiTao: this.props.system.user.shcc,
            tieuDe: this.tieuDe.value(),
            noiDung: this.noiDung.value(),
            ngayBatDau: Number(this.ngayBatDau.value()),
            ngayKetThuc: Number(this.ngayKetThuc.value()),
            doUuTien: this.doUuTien.value(),
            ngayTao: Date.now(),
            fileList: this.state.listFile || [],
            lienPhong: Number(this.lienPhong.value()),
            donViNhan: this.state.lienPhong ? this.listDonViNhan?.value() : (this.donViNhan?.value() ? [this.donViNhan?.value()] : []),
            canBoNhan: (this.props.hcthNhiemVu?.item?.canBoNhan || []).map(item => item.id)
            // trangThai: this.trangThai?.value(),
            // tienDo: this.tienDo?.value() || 0
        };

        if (!changes.tieuDe) {
            T.notify('Tiêu đề nhiệm vụ bị trống', 'danger');
            this.tieuDe.focus();
        }
        else if (!changes.noiDung) {
            T.notify('Nội dung nhiệm vụ bị trống', 'danger');
            this.noiDung.focus();
        }
        else {
            if (this.state.id) {
                this.props.updateNhiemVu(this.state.id, changes, this.getData);
            } else {
                this.props.createNhiemVu(changes, () => this.props.history.push(this.getSiteSetting().backRoute));
            }
        }
    }

    getTrangThaiAdapter = (current) => {
        const currentValue = trangThaiNhiemVu[current].value;
        return Object.keys(trangThaiNhiemVu).filter(key => trangThaiNhiemVu[key].value >= currentValue).map(key => ({ id: trangThaiNhiemVu[key].id, text: trangThaiNhiemVu[key].text }));
    }

    getDonViAdapater = () => {
        const currentPermissions = this.getCurrentPermissions();
        if (currentPermissions.some(item => ['hcth:manage', 'rectors:login'].includes(item)) || this.state.lienPhong)
            return SelectAdapter_DmDonVi;
        else return SelectAdapter_DmDonVi;
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/nhiem-vu/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/nhiem-vu'>Danh sách nhiệm vụ</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/hcth/nhiem-vu'
            };
        else
            return {
                routeMatcherUrl: '/user/nhiem-vu/:id',
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    <Link key={1} to='/user/nhiem-vu'>Danh sách nhiệm vụ</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: '/user/nhiem-vu'
            };
    }

    getSitePermission = () => {
        //permission to edit general information like tieuDe, noiDung, file, lienKet, ...  
        const userPermission = this.getCurrentPermissions(),
            primePermission = userPermission.some(item => ['hcth:manage', 'rectors:login'].includes(item)),
            canBoNhan = this.props.hcthNhiemVu?.item?.canBoNhan || [],
            shcc = this.props.system.user?.shcc;
        return {
            primePermission,
            isParticipant: this.state.id && canBoNhan.some(item => item.shccCanBoNhan === shcc),
            editGeneral: (this.state.trangThai !== trangThaiNhiemVu.DONG.id) && (this.state.isCreator || this.state.isManage),
            editTrangThai: primePermission || this.state.isCreator || this.state.isManager,
            delete: (this.state.trangThai !== trangThaiNhiemVu.DONG.id) && (this.state.isCreator || this.state.isManager),
        };
    }

    onComplete = () => {
        T.confirm('Hoàn thành nhiệm vụ', 'Hệ thống sẽ ghi nhận bạn đã hoàn thành phần nhiệm vụ.', true,
            isConfirm => isConfirm && this.props.completeNhiemVu(this.state.id)
        );
    }

    onClose = () => {
        T.confirm('Đóng nhiệm vụ', 'Bạn có chắc chắn muốn đóng nhiệm vụ này lại không ?', true,
            isConfirm => isConfirm && this.props.closeNhiemVu(this.state.id, this.props.hcthNhiemVu?.item?.canBoNhan || [], this.state.nguoiTao, this.getData)
        );
    }

    onReopen = () => {
        T.confirm('Mở lại nhiệm vụ', 'Bạn có chắc chắn muốn mở lại nhiệm vụ này không ?', true,
            isConfirm => isConfirm && this.props.reopenNhiemVu(this.state.id, this.props.hcthNhiemVu?.item?.canBoNhan || [], this.state.nguoiTao, this.getData)
        );
    }

    render() {
        const
            isNew = !this.state.id,
            sitePermission = this.getSitePermission(),
            siteSetting = this.getSiteSetting(),
            buttons = [];
        console.log(this.state);
        const isShowCloseTaskBtn = !sitePermission.isParticipant && sitePermission.editTrangThai && this.state.id && this.state.trangThai !== trangThaiNhiemVu.DONG.id;
        const isShowReopenTaskBtn = !sitePermission.isParticipant && sitePermission.editTrangThai && this.state.id && this.state.trangThai === trangThaiNhiemVu.DONG.id;
        if (sitePermission.isParticipant && this.state.trangThai !== trangThaiNhiemVu.DONG.id)
            buttons.push({ icon: 'fa-check', onClick: this.onComplete, className: 'btn-success' });
        if (isShowCloseTaskBtn)
            buttons.push({ icon: 'fa-lock', onClick: this.onClose, className: 'btn-danger' });
        if (isShowReopenTaskBtn)
            buttons.push({ icon: 'fa-unlock', onClick: this.onReopen, className: 'btn-success' });
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Nhiệm vụ',
            breadcrumb: siteSetting.breadcrumb,
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        <h3 className='tile-title'>{!this.state.id ? 'Tạo mới nhiệm vụ' : 'Cập nhật nhiệm vụ'}</h3>
                    </div>

                    <div className='tile-body row'>
                        <FormTextBox type='text' className='col-md-12' ref={e => this.tieuDe = e} label='Tiêu đề' required readOnly={!sitePermission.editGeneral} />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={!sitePermission.editGeneral} required />
                        {this.state.id && <div className='form-group col-md-12'>Trạng thái nhiệm vụ: <span style={{ color: trangThaiNhiemVu[this.state.trangThai].color, fontWeight: 'bold' }}>{trangThaiNhiemVu[this.state.trangThai].text}</span></div>}
                        {this.state.id && <>
                            <FormSelect className='col-md-6' ref={(e => this.nguoiTao = e)} label='Người tạo' data={SelectAdapter_FwCanBo} readOnly={true} />
                            <FormDatePicker type='date-mask' className='col-md-6' ref={(e => this.ngayTao = e)} label='Người tạo' readOnly={true} />
                        </>}
                        <FormCheckbox isSwitch className='form-group col-md-12' ref={e => this.lienPhong = e} label='Nhiệm vụ liên phòng' readOnly={!isNew} onChange={(value) => this.setState({ lienPhong: value })} />
                        {this.state.lienPhong == 1 && <FormSelect multiple={true} className='col-md-12' ref={e => this.listDonViNhan = e} label='Đơn vị nhận' data={this.getDonViAdapater()} readOnly={!sitePermission.editGeneral} />}
                        {this.state.lienPhong == 0 && ((isNew && sitePermission.primePermission) || this.state.donViNhan.length > 0) && <FormSelect multiple={false} className='col-md-12' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={this.getDonViAdapater()} readOnly={!sitePermission.editGeneral} />}
                        <FormSelect className='col-md-12' ref={e => this.doUuTien = e} label='Độ ưu tiên' data={Object.keys(doUuTienMapper).map(key => ({ id: key, text: doUuTienMapper[key].text }))} readOnly={!sitePermission.editGeneral} required />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' readOnly={!sitePermission.editGeneral} readOnlyEmptyText='Chưa có' />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' readOnly={!sitePermission.editGeneral} readOnlyEmptyText='Chưa có' />

                    </div>
                </div>
                <CanBoNhan {...this.props} sitePermission={sitePermission} isManager={this.state.isManager} isCreator={this.state.isCreator} lienPhong={this.state.lienPhong} target={this.state.id} create={this.props.createCanBoNhanNhiemVu} getList={this.props.getListCanBoNhanNhiemVu} trangThai={this.state.trangThai} />
                {this.state.id && <PhanHoi {...this.props} target={this.state.id} sitePermission={sitePermission} trangThai={this.state.trangThai} />}
                {this.state.id && <LienKet {...this.props} sitePermission={sitePermission} target={this.state.id} data={this.props.hcthNhiemVu?.cvdPage?.list} />}

                <ListFiles {...this.props} files={this.state.listFile} id={this.state.id} sitePermission={sitePermission} updateListFile={(newList) => this.setState({ listFile: newList })} />

                {this.state.id && <History {...this.props} data={this.props.hcthNhiemVu?.item?.history} />}
            </>,
            backRoute: siteSetting.backRoute,
            onSave: sitePermission.editGeneral && this.save,
            buttons
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { completeNhiemVu, reopenNhiemVu, closeNhiemVu, getHistory, clearHcthNhiemVu, updateCanBoNhanNhiemVu, deleteFile, deleteLienKet, getCongVanCacPhongSelector, createNhiemVu, updateNhiemVu, deleteNhiemVu, searchNhiemVu, getNhiemVu, createPhanHoi, getPhanHoi, createLienKet, updateLienKet, getLienKet, createCanBoNhanNhiemVu, getListCanBoNhanNhiemVu, removeCanBoNhanNhiemVu, getCongVanDenSelector };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);