import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    FormDatePicker,
    FormSelect,
    FormRichTextBox,
    FormTextBox,
    renderTable,
    FormFileBox,
    FormCheckbox,
    TableCell,
    renderComment,
    AdminModal
} from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {
    getHcthGiaoNhiemVuAll,
    getHcthGiaoNhiemVuPage,
    createHcthGiaoNhiemVu,
    updateHcthGiaoNhiemVu,
    deleteHcthGiaoNhiemVu,
    getHcthGiaoNhiemVuSearchPage,
    getGiaoNhiemVu,
    createPhanHoi,
    createLienKet,
    updateLienKet,
    getLienKet,
    getPhanHoi,
    createCanBoNhanNhiemVu,
    getCanBoNhanNhiemVu,
    removeCanBoNhanNhiemVu
} from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo, SelectAdapter_FwCanBoByDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import {SelectAdapter_CongVanDen} from 'modules/mdHanhChinhTongHop/hcthCongVanDen/redux';
import {SelectAdapter_CongVanDi} from 'modules/mdHanhChinhTongHop/hcthCongVanDi/redux';

const dsDoUuTien = [
    {
        id: 1,
        text: 'Thường',
        color: 'blue'
    },
    {
        id: 2,
        text: 'Khẩn cấp',
        color: 'red'
    }
];

const loaiLienKet = {
    'CONG_VAN_DEN': {
        id: 1,
        text: 'Công văn đến',
        slug: 'cong-van-den'
    },

    'CONG_VAN_DI': {
        id: 2,
        text: 'Công văn đi',
        slug: 'cong-van-cac-phong'
    }
};
export class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        T.ready(() => this.onShown(() => {
            !this.loaiB.value() ? this.loaiB.focus() : this.keyB.focus();
        }));
    }

    onShow = (item) => {
        const { id, loaiB, keyB } = item ? item : { id: '', loaiB: '',  keyB: '' };
        this.setState({ id });
        this.loaiB?.value(loaiB);
        this.keyB?.value(keyB);
    }

    onSubmit = (e) => {
        const changes = {
            loaiA: 'NHIEM_VU',
            keyA: this.props.nhiemVuId,
            loaiB: this.loaiB.value() === '1' ? 'CONG_VAN_DEN' : 'CONG_VAN_DI',
            keyB: this.keyB.value(),
            chieu: 0
        };

        if (!changes.loaiB) {
            T.notify('Loại liên kết bị trống!', 'danger');
            this.loaiB.focus();
        } else
        if (!changes.keyB) {
            T.notify('Mã liên kết bị trống', 'danger');
            this.keyB.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : 
            this.props.create(this.props.nhiemVuId, changes, this.hide);
       }
       e.preventDefault();
    }

    render = () => {
        // const readOnly = this.props.readOnly;
        const loaiLienKetArr = Object.values(loaiLienKet);
        return this.renderModal({
            title: 'Tạo mới liên kết',
            size: 'large',
            body: <div className='row'>
                {/* Hello world */}
                <FormSelect className='col-md-4' ref={e => this.loaiB = e} onChange={value=> this.setState({loaiLienKet: value})} label='Loại liên kết' data={loaiLienKetArr} />
                {
                    this.loaiB?.value() == '1' &&
                    <FormSelect className='col-md-12' ref={e => this.keyB = e} label='Công văn đến' data={SelectAdapter_CongVanDen} />
                }
                {
                    this.loaiB?.value() == '2' &&
                    <FormSelect className='col-md-12' ref={e => this.keyB = e} label='Công văn đi' data={SelectAdapter_CongVanDi} />
                }
            </div>
        });
    }
}

class PhanHoi extends React.Component {

    renderPhanHoi = (phanHoi) => {
        return renderComment({
            getDataSource: () => phanHoi,
            emptyComment: 'Chưa có phản hồi!',
            renderAvatar: (item) => <img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <>{item.chucVu ? item.chucVu + ' -' : ''} <span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }

    canPhanHoi = () => true;

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        const shcc = this.props?.system?.user?.shcc;
        const value = this.phanHoi.value();
        if (value) {
            this.props.createPhanHoi({
                key: this.props.congVan,
                canBoGui: shcc,
                noiDung: value,
                loai: 'NHIEM_VU',
                ngayTao: new Date().getTime(),
            }, () => this.props.getPhanHoi(this.props.congVan, () => { this.phanHoi.value(''); }));
        }
    }


    render() {
        const phanHoi = this.props.hcthGiaoNhiemVu?.item?.phanHoi || [];
        return (
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title' style={{ flex: 1 }}>Phản hồi</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {
                                this.renderPhanHoi(phanHoi)
                            }
                        </div>
                        <FormRichTextBox type='text' className='col-md-12 mt-2' ref={e => this.phanHoi = e} placeholder='Thêm phản hồi' />
                        <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type='submit' className='btn btn-primary' onClick={this.onCreatePhanHoi}>
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class AdminEditPage extends AdminPage {
    listFileRefs = {};
    state = {
        id: null,
        listFile: [],
        newPhanHoi: [],
        phanHoi: [],
        listCanBo: [],
        listLienKet: [],
        isNhiemVuLienPhong: 0,
        donViNhan: ''
    }

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
                linkFile = `/api/hcth/giao-nhiem-vu/download/${id || 'new'}/${originalName}`;
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

    tableLienKet = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có liên kết nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Loại liên kết</th>
                <th style={{ width: '80%', textAlign: 'center', whiteSpace: 'nowrap' }}>Trích yếu</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={loaiLienKet[item.loaiB].text} />
                    <TableCell type='text' style={{ wordBreak: 'break-all'}} content={
                        item.loaiB === 'CONG_VAN_DEN' ? item.trichYeuDen : item.trichYeuDi
                    }/>
                    <TableCell type='text' content={
                            <>
                                <Link 
                                    className="btn btn-primary"
                                    role="button"
                                    to={`/user/hcth/${loaiLienKet[item.loaiB].slug}/${item.keyB}`}
                                > 
                                    <i className="fa fa-eye"></i>
                                </Link>
                            </>
                    } />
                    
                </tr>
            );
        }
    });

    tableCanBoNhan = (data, userShcc, addEmployeeToTaskPermission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có cán bộ nào!',
        onRemoveCanBoNhan: () => {

        },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%', whiteSpace: 'nowrap'}}>Tên cán bộ</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Người tạo</th>
                { addEmployeeToTaskPermission && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th> }
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={item.canBo} />
                    <TableCell type='text' style={{ wordBreak: 'break-all', fontWeight: 'bold' }} content={item.tenNguoiTao} />
                    { addEmployeeToTaskPermission && <TableCell type='text' content={
                        item.shccNguoiTao === userShcc && <button className='btn btn-danger' onClick={e => this.onRemoveCanBoNhanNhiemVu(e, item.shcc)}><i className="fa fa-trash-o"></i></button>
                    } 
                    /> }
                </tr>
            );
        }
    });
    
    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/giao-nhiem-vu/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
                { shcc, staff } = user;
            this.setState({
                id: params.id === 'new' ? null : params.id,
                shcc,
                maDonVi: staff.maDonVi,
                user
            }, () => this.getData());
        });
    }
    // EditModal
    getData = () => {
        if (this.state.id) {
            this.props.getGiaoNhiemVu(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { id, tieuDe, noiDung, ngayTao, ngayBatDau, ngayKetThuc, donViNhan, doUuTien = 1, phanHoi = [], listFile = [], lienKet = [], isNhiemVuLienPhong, canBoNhanNhiemVu, nguoiTao } = data ? data :
            { tieuDe: '', noiDung: '', ngayTao: '', ngayBatDau: '', ngayKetThuc: '', donViNhan: '', doUuTien: 1, lienKet, isNhiemVuLienPhong: 0, canBoNhanNhiemVu: {}, nguoiTao: ''};
        
        if (ngayTao !== '') {
            this.ngayTao.value(ngayTao);
        }

        this.tieuDe.value(tieuDe || '');
        this.noiDung.value(noiDung || '');
        this.ngayBatDau.value(ngayBatDau || '');
        this.ngayKetThuc.value(ngayKetThuc || '');
        this.doUuTien.value(doUuTien);
        this.isNhiemVuLienPhong.value(isNhiemVuLienPhong);
        this.setState({
            id,
            phanHoi,
            listFile,
            lienKet,
            nguoiTao,
            isNhiemVuLienPhong,
            donViNhan
        }, () => {
            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri));
        });

        if (donViNhan && donViNhan !== '') {
            donViNhan = donViNhan.split(',');
            this.donViNhan.value(donViNhan ? donViNhan : '');
        }

        if (Object.keys(canBoNhanNhiemVu).length > 0 && !isNhiemVuLienPhong) {
            let canBoNhan = canBoNhanNhiemVu[0]?.canBoNhan?.split(',');
            this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        }
        this.fileBox?.setData('hcthGiaoNhiemVuFile:' + (this.state.id ? this.state.id : 'new'));
    };
    save = () => {
        let changes = {
            nguoiTao: this.props.system.user.shcc,
            tieuDe: this.tieuDe.value(),
            noiDung: this.noiDung.value(),
            ngayBatDau: Number(this.ngayBatDau.value()),
            ngayKetThuc: Number(this.ngayKetThuc.value()),
            doUuTien: Number(this.doUuTien.value()),
            ngayTao: Date.now(),
            fileList: this.state.listFile || [],
            isNhiemVuLienPhong: Number(this.isNhiemVuLienPhong.value()),
        };
        if (this.donViNhan && typeof this.donViNhan.value() !== 'undefined') changes.donViNhan = this.donViNhan.value().join(',');
        if (this.canBoNhan && typeof this.canBoNhan.value() !== 'undefined') changes.canBoNhan = this.canBoNhan.value().join(',');
        
        if (!changes.tieuDe) {
            T.notify('Tiêu đề nhiệm vụ bị trống', 'danger');
            this.tieuDe.focus();
        }
        else if (!changes.noiDung) {
            T.notify('Nội dung nhiệm vụ bị trống', 'danger');
            this.noiDung.focus();
        }
        else if (!changes.canBoNhan && !changes.donViNhan) {
            T.notify('Cán bộ nhận hoặc đơn vị nhận bị trống', 'danger');
            this.canBoNhan.focus();
        }
        else {
            if (this.state.id) {
                this.props.updateHcthGiaoNhiemVu(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthGiaoNhiemVu(changes, () => this.props.history.push('/user/hcth/giao-nhiem-vu'));
            }
        }
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.item);
            let linkCongVan = '[]';
            try {
                linkCongVan = JSON.stringify(listFile);
            } catch (exception) {  
                T.notify(exception, 'danger');
                return;
            }
            this.state.id && this.props.updateHcthGiaoNhiemVu(this.state.id, { linkCongVan });
            this.setState({ listFile });
        }
    }

    onViTriChange = (e, index) => {
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        setTimeout(() => this.setState({ listFile }), 500);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    onAddEmployeeToTask = () => {
        if (this.canBoNhan.value().length > 0) {
            const canBoNhanNhiemVu = this.props.hcthGiaoNhiemVu?.item?.canBoNhanNhiemVu.canBoNhan || '';
            if (this.canBoNhan.value().some(cb => canBoNhanNhiemVu.indexOf(cb) >= 0)) {
                T.notify('Cán bộ đã có trong danh sách. Vui lòng thử lại !', 'danger');
                this.canBoNhan.focus();
            } else {
                const data = {
                    nguoiTao: this.props.system.user.shcc,
                    canBoNhan: this.canBoNhan.value().join(','),
                    loai: 'NHIEM_VU',
                    key: this.state.id
                };
                this.props.createCanBoNhanNhiemVu(data, () => this.props.getCanBoNhanNhiemVu(this.state.id, () => this.canBoNhan.value(''))); 
            }
        } else {
            T.notify('Cán bộ tham gia bị trống', 'danger');
            this.canBoNhan.focus();
        }
    }
    
    onRemoveCanBoNhanNhiemVu = (e, shcc) => {
        const data = {
            shcc,
            key: this.state.id,
            loai: 'NHIEM_VU',
            nguoiTao: this.props.system.user.shcc
        };
        this.props.removeCanBoNhanNhiemVu(data, () => this.props.getCanBoNhanNhiemVu(this.state.id));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const permission = this.getUserPermission('hcthGiaoNhiemVu', ['read', 'write', 'delete']),
            presidentPermission = this.getUserPermission('president', ['login']),
            managerPermission = this.getUserPermission('manager', ['write']),
            rectorPermission = this.getUserPermission('rectors', ['login']);
        const { user } = this.props.system;
        const isNew = !this.state.id;
        const isNhiemVuLienPhong = this.state.isNhiemVuLienPhong;
        const isNguoiTaoNhiemVu = this.state.nguoiTao !== '' && user.staff.shcc === this.state.nguoiTao;
        const dsDonViQuanLi = user.staff.donViQuanLy.map(dv => dv.maDonVi).join(',');
        const readOnly = !isNew && !isNguoiTaoNhiemVu;

        const addEmployeeToTaskPermission = managerPermission.write && this.state.donViNhan && this.state.donViNhan.includes(user.staff.maDonVi);
        const canBoNhanNhiemVu = this.props.hcthGiaoNhiemVu?.item?.canBoNhanNhiemVu;
        const totalCanBoNhanObj = canBoNhanNhiemVu?.reduce((acc, ele) => {
            const listCanBoShcc = ele?.canBoNhan?.split(',');
            const listCanBoNhanObj =  ele.danhSachCanBoNhan?.split(';').map((item, idx) => ({
                canBo: item,
                tenNguoiTao: ele.tenNguoiTao,
                shcc: listCanBoShcc[idx],
                shccNguoiTao: ele.nguoiTao
            })) || [];
            return acc.concat(listCanBoNhanObj);
        }, []) || [];
        const isShowCanBoNhanLienPhong = isNhiemVuLienPhong && !isNew;
        const userShcc = user?.staff.shcc;

        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Giao nhiệm vụ',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                <Link key={1} to='/user/hcth/giao-nhiem-vu'>Danh sách nhiệm vụ</Link>,
                isNew ? 'Tạo mới' : 'Cập nhật'
            ],
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        <h3 className='tile-title'>{!this.state.id ? 'Tạo mới nhiệm vụ' : 'Cập nhật nhiệm vụ'}</h3>
                        {!isNew &&
                            <FormDatePicker type='date' ref={e => this.ngayTao = e} label='Ngày tạo' readOnly={true} style={{ width: 'auto', fontStyle: 'italic' }} />
                        }
                    </div>

                    <div className='tile-body row'>
                        <FormTextBox type="text" className="col-md-12" ref={e => this.tieuDe = e} label="Tiêu đề" readOnly={readOnly} required />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                        <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' readOnly={readOnly} readOnlyEmptyText='Chưa có' />
                        <FormDatePicker type='date' className='col-md-6' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' readOnly={readOnly} readOnlyEmptyText='Chưa có'/>
                        <FormCheckbox isSwitch className='col-md-6 form-group' ref={e => this.isNhiemVuLienPhong = e} label='Nhiệm vụ liên phòng' readOnly={!isNew} 
                        onChange={() => this.setState({ isNhiemVuLienPhong: !this.state.isNhiemVuLienPhong})}></FormCheckbox>
                        {((!isNew && this.state.donViNhan !== '') && (presidentPermission && presidentPermission.login) || (rectorPermission && rectorPermission.login) || (!isNew && isNguoiTaoNhiemVu) || (isNew && this.state.isNhiemVuLienPhong) || readOnly) ?
                            <FormSelect multiple={true} className='col-md-12' ref={e => this.donViNhan = e} label='Đơn vị nhận' data={SelectAdapter_DmDonVi} readOnly={readOnly} required={this.state.isNhiemVuLienPhong}/>
                            : null
                        }
                        { !this.state.isNhiemVuLienPhong ?
                            <FormSelect multiple={true} className='col-md-12' ref={e => this.canBoNhan = e} label='Cán bộ nhận' data={SelectAdapter_FwCanBo} readOnly={readOnly} required={!this.state.isNhiemVuLienPhong} />
                            : null
                        }  
                        <FormSelect className='col-md-6' ref={e => this.doUuTien = e} label='Độ ưu tiên' data={dsDoUuTien} readOnly={readOnly} required />
                    </div>
                </div>
                { isShowCanBoNhanLienPhong ?
                    <div className='tile'>
                        <div className='form-group'>
                            <h3 className='tile-title'>{ addEmployeeToTaskPermission ? 'Thêm cán bộ vào nhiệm vụ' : 'Danh sách cán bộ tham gia'}</h3>
                            { addEmployeeToTaskPermission &&
                                <div className='tile-body row'>
                                    <div className='col-md-4'>
                                        <FormSelect multiple={true} ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBoByDonVi(dsDonViQuanLi)}  required={!this.state.isNhiemVuLienPhong} placeholder="Chọn cán bộ tham gia"/>
                                    </div>
                                    <div className='col-md-1'>
                                        <button type='button' className='btn btn-primary' onClick={this.onAddEmployeeToTask}>
                                            <i className="fa fa-plus"></i> Thêm nhân viên
                                        </button>
                                    </div>
                                </div>
                            }
                            <div className='tile-body row'>
                                <div className="col-md-12">
                                    {this.tableCanBoNhan(totalCanBoNhanObj, userShcc, addEmployeeToTaskPermission)}
                                </div>
                            </div>
                        </div>
                    </div> : null
                }
                
                {this.state.id && <PhanHoi {...this.props} congVan={this.state.id} />}
                 <div className='tile'>
                        <div className='form-group'>
                            <div className="d-flex justify-content-between">
                                <h3 className='tile-title'>Danh sách liên kết</h3>
                            </div>
                            <div className='tile-body row'>
                                <div className="col-md-12">
                                    {this.tableLienKet(this.props.hcthGiaoNhiemVu?.item?.lienKet || [], this.state.id, permission, readOnly)}
                                </div>
                            </div>
    
                            { !readOnly &&
                                <div className="tile-body">
                                    <div className="d-flex justify-content-end">
                                        <button type='submit' className='btn btn-primary' onClick={(e) => this.showModal(e)}>
                                            Thêm
                                        </button>
                                    </div>
                                </div> 
                            }
                        </div>
                </div>

                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Danh sách tập tin</h3>
                        <div className='tile-body row'>
                            <div className={'form-group ' + (readOnly ? 'col-md-12' : 'col-md-8')}>
                                {this.tableListFile(this.state.listFile, this.state.id, permission, readOnly)}
                            </div>
                            {!readOnly && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin nhiệm vụ' postUrl='/user/upload' uploadType='hcthGiaoNhiemVuFile' userData='hcthGiaoNhiemVuFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e}
                    permission={permission}
                    create={this.props.createLienKet}
                    update={this.props.updateLienKet}
                    get={this.props.getLienKet}
                    permissions={currentPermissions}
                    nhiemVuId={this.state.id}
                />

            </>,
            backRoute: '/user/hcth/giao-nhiem-vu',
            onSave: (isNew || isNguoiTaoNhiemVu) ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthGiaoNhiemVu: state.hcth.hcthGiaoNhiemVu });
const mapActionsToProps = {
    getHcthGiaoNhiemVuAll,
    getHcthGiaoNhiemVuPage,
    createHcthGiaoNhiemVu,
    updateHcthGiaoNhiemVu,
    deleteHcthGiaoNhiemVu,
    getHcthGiaoNhiemVuSearchPage,
    getGiaoNhiemVu,
    createPhanHoi,
    getPhanHoi,
    createLienKet,
    updateLienKet,
    getLienKet,
    createCanBoNhanNhiemVu,
    getCanBoNhanNhiemVu,
    removeCanBoNhanNhiemVu
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);