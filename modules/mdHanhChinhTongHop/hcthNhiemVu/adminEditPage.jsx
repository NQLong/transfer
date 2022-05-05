import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormDatePicker, FormSelect, FormRichTextBox, FormTextBox, renderTable, FormFileBox, FormCheckbox, TableCell, renderComment, AdminModal } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { deleteLienKet, createNhiemVu, updateNhiemVu, deleteNhiemVu, searchNhiemVu, getNhiemVu, createPhanHoi, createLienKet, updateLienKet, getLienKet, getPhanHoi, createCanBoNhanNhiemVu, getListCanBoNhanNhiemVu, removeCanBoNhanNhiemVu, getCongVanDenSelector, getCongVanCacPhongSelector } from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { CanBoNhan, PhanHoi, LienKet } from './component';
const { doUuTienMapper, vaiTro, trangThaiNhiemVu } = require('../constant');

const tienDoSelector = [...Array(11).keys()].map(i => ({ id: i * 10, text: `${i * 10}%` }));

class AdminEditPage extends AdminPage {
    listFileRefs = {};
    state = { id: null, listFile: [], newPhanHoi: [], phanHoi: [], listCanBo: [], listLienKet: [], lienPhong: 0, donViNhan: '', trangThaiAdapter: [], trangThai: trangThaiNhiemVu.MOI.id }

    tableListFile = (data, id, permission, readOnly) => renderTable({
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
                        permission.write && !readOnly ? <FormTextBox type='text' placeholder='Nhập ghi chú' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[index] = e} onChange={e => this.onViTriChange(e, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={readOnly ? null : e => this.deleteFile(e, index, item)}>
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

        let { tieuDe, noiDung, ngayTao, ngayBatDau, ngayKetThuc, donViNhan, doUuTien, phanHoi = [], listFile = [], lienKet = [], lienPhong = 0, canBoNhan = [], nguoiTao, trangThai = trangThaiNhiemVu.MOI.id, tienDo = 0 } = data ? data :
            { tieuDe: '', noiDung: '', ngayTao: '', ngayBatDau: '', ngayKetThuc: '', donViNhan: [], doUuTien: doUuTienMapper.NORMAL.id, lienKet, lienPhong: 0, canBoNhanNhiemVu: {}, nguoiTao: '' };

        this.ngayTao?.value(ngayTao || '');
        this.tieuDe.value(tieuDe || '');
        this.noiDung.value(noiDung || '');
        this.ngayBatDau.value(ngayBatDau || '');
        this.ngayKetThuc.value(ngayKetThuc || '');
        this.doUuTien.value(doUuTien || '');
        this.lienPhong.value(lienPhong);
        this.trangThai.value(trangThai);



        const trangThaiValue = trangThaiNhiemVu[trangThai].value;
        const trangThaiAdapter = Object.keys(trangThaiNhiemVu).filter(key => trangThaiNhiemVu[key].value >= trangThaiValue).map(key => ({ id: trangThaiNhiemVu[key].id, text: trangThaiNhiemVu[key].text }));
        console.log(trangThaiAdapter);
        const isCreator = this.state.id ? this.props.hcthNhiemVu?.item?.nguoiTao == this.props.system?.user?.shcc : true;
        const isManager = canBoNhan.some(item => item.vaiTro == vaiTro.MANAGER.id && item.shccCanBoNhan == this.props.system?.user?.shcc);
        this.setState({ phanHoi, listFile, lienKet, nguoiTao, lienPhong, donViNhan, doUuTien, isCreator, isManager, trangThai, trangThaiAdapter }, () => {
            if (donViNhan.length > 0) {
                if (lienPhong)
                    this.listDonViNhan.value(donViNhan.map(item => item.donViNhan));
                else
                    this.donViNhan.value(donViNhan[0].donViNhan);
            }
            this.tienDo?.value(tienDo);

            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri));
        });

        this.fileBox?.setData('hcthNhiemVuFile:' + (this.state.id ? this.state.id : 'new'));
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
            canBoNhan: this.state.id ? (this.props.hcthNhiemVu?.item?.canBoNhan || []).map(item => item.id) : null,
            trangThai: this.trangThai?.value(),
            tienDo: this.tienDo?.value() || 0
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
                this.props.createNhiemVu(changes, () => this.props.history.push('/user/hcth/nhiem-vu'));
            }
        }
    }

    getTrangThaiAdapter = (current) => {
        const currentValue = trangThaiNhiemVu[current].value;
        return Object.keys(trangThaiNhiemVu).filter(key => trangThaiNhiemVu[key].value >= currentValue).map(key => ({ id: trangThaiNhiemVu[key].id, text: trangThaiNhiemVu[key].text }));
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.item);
            this.setState({ listFile });
        }
    }

    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        setTimeout(() => this.setState({ listFile }), 500);
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
                    this.state.id ? 'Tạo mới' : 'Cập nhật'
                ],
                backRoute: '/user/hcth/nhiem-vu'
            }
        else
            return {
                routeMatcherUrl: '/user/nhiem-vu/:id',
                readyUrl: '/user',
                breadcrumb: [
                    <Link key={0} to='/user/'>Trang cá nhân</Link>,
                    <Link key={1} to='/user/nhiem-vu'>Danh sách nhiệm vụ</Link>,
                    this.state.id ? 'Tạo mới' : 'Cập nhật'
                ],
                backRoute: '/user/nhiem-vu'
            }
    }

    getSitePermission = () => {
        const userPermission = this.getCurrentPermissions();
        //permission to edit general information like tieuDe, noiDung, file, lienKet, ...  
        const allPermission = this.state.isCreator || userPermission.some(item => ['hcth:manage', 'rectors:login'].includes(item));
        return {
            editGeneral: allPermission || this.state.isManager,
            editFile: allPermission || this.state.isManager,
            editLienKet: allPermission || this.state.isManager,
            editTrangThai: allPermission || this.state.isManager,
            deleteLienKet: allPermission,
            deleteFile: allPermission,
            editDonViNhan: allPermission,
            deleteStaff: allPermission,
        };
    }





    render() {
        const
            permission = this.getUserPermission('hcthGiaoNhiemVu', ['read', 'write', 'delete']),
            isNew = !this.state.id,
            sitePermission = this.getSitePermission(),
            siteSetting = this.getSiteSetting(),
            readOnly=false;

        const trangThaiValue = trangThaiNhiemVu[this.state.trangThai]?.value;
        const trangThaiAdapter = this.state.trangThai ? Object.keys(trangThaiNhiemVu).filter(key => trangThaiNhiemVu[key].value >= trangThaiValue).map(key => ({ id: trangThaiNhiemVu[key].id, text: trangThaiNhiemVu[key].text })) : [];


        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Giao nhiệm vụ',
            breadcrumb: siteSetting.breadcrumb,
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        <h3 className='tile-title'>{!this.state.id ? 'Tạo mới nhiệm vụ' : 'Cập nhật nhiệm vụ'}</h3>
                    </div>

                    <div className='tile-body row'>
                        <FormTextBox type="text" className="col-md-12" ref={e => this.tieuDe = e} label="Tiêu đề" required readOnly={!sitePermission.editGeneral} />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={!sitePermission.editGeneral} required />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' readOnly={!sitePermission.editGeneral} readOnlyEmptyText='Chưa có' />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' readOnly={!sitePermission.editGeneral} readOnlyEmptyText='Chưa có' />
                        <FormCheckbox isSwitch className='form-group col-md-12' ref={e => this.lienPhong = e} label='Nhiệm vụ liên phòng' readOnly={!isNew} onChange={(value) => this.setState({ lienPhong: value })} />
                        {this.state.lienPhong == 1 && <FormSelect multiple={true} className='col-md-12' ref={e => this.listDonViNhan = e} label='Đơn vị nhận' data={this.getDonViAdapater()} readOnly={readOnly} />}
                        {this.state.lienPhong == 0 && <FormSelect multiple={false} className='col-md-12' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={this.getDonViAdapater()} readOnly={readOnly} />}
                        <FormSelect className='col-md-12' ref={e => this.doUuTien = e} label='Độ ưu tiên' data={Object.keys(doUuTienMapper).map(key => ({ id: key, text: doUuTienMapper[key].text }))} readOnly={readOnly} required />
                        {this.state.id && this.state.trangThai && (<>
                            <FormSelect className='col-md-8' ref={e => this.trangThai = e} data={trangThaiAdapter} label='Tình trạng nhiêm vụ' />
                            {this.state.trangThai != trangThaiNhiemVu.MOI.id && <FormSelect className='col-md-4' ref={e => this.tienDo = e} label='Tiến độ nhiệm vụ' data={tienDoSelector} />}
                        </>)
                        }
                    </div>
                </div>
                <CanBoNhan {...this.props} sitePermission={sitePermission} isManager={this.state.isManager} isCreator={this.state.isCreator} lienPhong={this.state.lienPhong} nhiemVuId={this.state.id} create={this.props.createCanBoNhanNhiemVu} getList={this.props.getListCanBoNhanNhiemVu} />
                {this.state.id && <PhanHoi {...this.props} target={this.state.id} />}
                {this.state.id && <LienKet {...this.props} target={this.state.id} data={this.props.hcthNhiemVu?.cvdPage?.list} />}

                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Danh sách tập tin</h3>
                        <div className='tile-body row'>
                            <div className={'form-group ' + (readOnly ? 'col-md-12' : 'col-md-8')}>
                                {this.tableListFile(this.state.listFile, this.state.id, permission, readOnly)}
                            </div>
                            {!readOnly && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin nhiệm vụ' postUrl='/user/upload' uploadType='hcthNhiemVuFile' userData='hcthNhiemVuFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                        </div>
                    </div>
                </div>
            </>,
            backRoute: siteSetting.backRoute,
            onSave: this.save
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthNhiemVu: state.hcth.hcthNhiemVu });
const mapActionsToProps = { deleteLienKet, getCongVanCacPhongSelector, createNhiemVu, updateNhiemVu, deleteNhiemVu, searchNhiemVu, getNhiemVu, createPhanHoi, getPhanHoi, createLienKet, updateLienKet, getLienKet, createCanBoNhanNhiemVu, getListCanBoNhanNhiemVu, removeCanBoNhanNhiemVu, getCongVanDenSelector };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);