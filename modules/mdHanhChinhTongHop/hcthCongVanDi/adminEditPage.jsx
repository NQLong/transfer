import React from 'react';
import { connect } from 'react-redux';
import { 
    getHcthCongVanDiPage, 
    getHcthCongVanDiAll, 
    createHcthCongVanDi, 
    updateHcthCongVanDi, 
    deleteHcthCongVanDi, 
    getHcthCongVanDiSearchPage, 
    deleteFile, 
    getCongVanDi,
    createPhanHoi
} from './redux';

import { Link } from 'react-router-dom';
import { 
    AdminPage, 
    FormDatePicker, 
    renderTable, 
    FormRichTextBox, 
    FormSelect, 
    TableCell, 
    FormCheckbox, 
    FormFileBox, 
    FormTextBox,
    renderComment
} from 'view/component/AdminPage';
import { 
    SelectAdapter_DmDonVi,
    SelectAdapter_DmDonViFilter,
} from 'modules/mdDanhMuc/dmDonVi/redux';
import {
    SelectAdapter_DmDonViGuiCongVan
} from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import {
    SelectAdapter_DmLoaiCongVan
} from 'modules/mdDanhMuc/dmLoaiCongVan/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

const listTrangThai = {
    '1': {
        status: 'Mới',
        color: '#a86e18'
    },
    '2': {
        status: 'Chờ duyệt',
        color: '#9aa115'
    },
    '3': {
        status: 'Đã duyệt',
        color: '#438238'
    },
    '4': {
        status: 'Trả lại',
        color: '#911717'
    },
    '5': {
        status: 'Đã gửi',
        color: '#00FFFF'
    },
    '6': {
        status: 'Đã đọc',
        color: '#114d78'
    }
};
class AdminEditPage extends AdminPage {
    listFileRefs = {};

    state = {
        id: null,
        listFile: [],
        newPhanHoi: [], 
        phanHoi: [],
        noiBo: 1,
        listDonViQuanLy: [],
        // checkDonViGui: false
    };

    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/cong-van-cac-phong/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
                { shcc} = user;
                
            let listDonViQuanLy = this.props.system && this.props.system.user.staff && this.props.system.user.staff.donViQuanLy ? this.props.system.user.staff.donViQuanLy : [];
            
            this.setState({
                id: params.id === 'new' ? null : params.id,
                shcc,
                user,
                listDonViQuanLy : listDonViQuanLy.filter(item => item.isManager).map(item => item.maDonVi)
            }, () => this.getData());
        });
    }

    renderPhanHoi = (listPhanHoi) => {
        return renderComment({
            getDataSource: () => listPhanHoi,
            emptyComment: 'Chưa có phản hồi',
            renderAvatar: (item) => <img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <><span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        if (this.phanHoi.value()) {
            const {shcc} = this.state;
            const newPhanHoi = {
                canBoGui: shcc,
                noiDung: this.phanHoi.value(),
                ngayTao: new Date().getTime(),
                key: parseInt(this.props.match.params.id),
                loai: 'DI'
            };
            this.props.createPhanHoi(newPhanHoi, () => this.getData());
        } else {
            T.notify('Nội dung phản hồi bị trống', 'danger');
            this.phanHoi.focus();
        }
    }

    getData = () => {
        if (this.state.id) {
            this.props.getCongVanDi(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { id, trichYeu, ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, donViNhanNgoai, listFile = [], danhSachPhanHoi = [], trangThai, loaiCongVan, noiBo} = data ? data :
            { id: '', trichYeu: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', donViNhanNgoai, trangThai: '', loaiCongVan: '', noiBo: 1};
        
        this.trichYeu.value(trichYeu);
        this.ngayGui.value(ngayGui);
        this.ngayKy.value(ngayKy);
        this.donViGui.value(data && data.donViGui ? data.donViGui: donViGui ? donViGui: '');
        this.loaiCongVan.value(loaiCongVan ?  parseInt(loaiCongVan) : '');
        this.phanHoi?.value('');
        
        this.setState({
            noiBo,
            trangThai,
            id, 
            donViGui, 
            donViNhan, 
        }, () => {
            this.noiBo.value(this.state.noiBo);
            this.trangThai?.value(trangThai || '');
        });

        if (donViNhan) {
            donViNhan = donViNhan.split(',');
            this.donViNhan.value(donViNhan);
        }

        if (donViNhanNgoai) {
            donViNhanNgoai = donViNhanNgoai.split(',');
            this.donViNhanNgoai.value(donViNhanNgoai);
        }

        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
            this.canBoNhan.value(canBoNhan);
        }
        
        this.soCongVan?.value(this.props.location.state.soCongVan || '');
        this.fileBox?.setData('hcthCongVanDiFile:' + (this.state.id ? this.state.id : 'new'));
        
        this.setState({ listFile, phanHoi: danhSachPhanHoi }, () => {
            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri));
        });
        this.setState({checkDonViGui: this.state.listDonViQuanLy.includes(this.state.donViGui)});
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
            this.state.id && this.props.updateHcthCongVanDi(this.state.id, { linkCongVan });
            this.setState({ listFile });
        }    
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        const { id: fileId, ten: file } = item;
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.state.id ? this.state.id : null, fileId, file, () => {
                let listFile = [...this.state.listFile];
                listFile.splice(index, 1);
                this.setState({ listFile });
            })
        );
    }

    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        this.setState({ listFile });
    }

    getValue = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    save = () => {
        const changes = {
            trichYeu: this.trichYeu.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            donViGui: this.donViGui.value(),
            donViNhan: this.state.noiBo && this.getValue(this.donViNhan) ? this.donViNhan.value().toString() : '',
            noiBo: Number(this.getValue(this.noiBo)),
            canBoNhan: this.state.noiBo && this.getValue(this.canBoNhan) ? this.canBoNhan.value().toString() : '',
            donViNhanNgoai: !this.state.noiBo && this.getValue(this.donViNhanNgoai) ? this.donViNhanNgoai.value().toString() : '',
            loaiCongVan: this.loaiCongVan.value() ? this.loaiCongVan.value().toString() : '',
            fileList: this.state.listFile || []
        };
        if (!changes.trichYeu) {
            T.notify('Trích yếu bị trống', 'danger');
            this.trichYeu.focus();
        } else if (!changes.ngayGui) {
            T.notify('Ngày gửi công văn bị trống', 'danger');
            this.ngayGui.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (!changes.loaiCongVan) {
            T.notify('Loại công văn bị trống', 'danger');
        }
        else {
            if (typeof this.trangThai !== 'undefined' && this.trangThai.value() !== '1') changes.trangThai = this.trangThai.value();
            else changes.trangThai = '1';
            if (this.state.id) {
                this.props.updateHcthCongVanDi(this.state.id, changes, this.getData);
            } else {
                // T.notify('Thêm công văn thành công!', 'success');
                this.props.createHcthCongVanDi(changes, () => this.props.history.push('/user/hcth/cong-van-cac-phong'));
            }
        }
    }

    onConfirmCvDi = () => {
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn duyệt công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const updateData = {
                            id: this.state.id,
                            donViGui: this.donViGui.value(),
                            loaiCongVan: this.loaiCongVan.value(),
                            trangThai: '3',
                            isSend: true
                };
                this.props.updateHcthCongVanDi(this.state.id, updateData, () => this.props.history.push('/user/hcth/cong-van-cac-phong'));
            }
        });
    }

    onReturnCvDi = () => {
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn trả lại công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (this.phanHoi.value()) {
                    const {shcc} = this.state;
                    const newPhanHoi = {
                        canBoGui: shcc,
                        noiDung: this.phanHoi.value(),
                        ngayTao: new Date().getTime(),
                        key: parseInt(this.props.match.params.id),
                        loai: 'DI'
                    };
                    this.props.createPhanHoi(newPhanHoi, () => {
                        this.props.updateHcthCongVanDi(this.state.id, { trangThai: '4' }, () => this.getData());
                    });
                } else {
                    T.notify('Lý do trả bị trống', 'danger');
                    this.phanHoi.focus();
                }
            
            }
        });
    }

    onReadCvDi = () => {
        T.confirm('Thông báo', 'Bạn có muốn xác nhận là đã đọc công văn này không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                //this.onCreatePhanHoi();
                this.props.updateHcthCongVanDi(this.state.id, { trangThai: '6' }, this.getData);
            }
        });
    }

    onSend = () => {
        T.confirm('Thông báo', 'Bạn có chắc chắn muốn gửi công văn này đi không ?', 'warning', true, isConfirm => {
            if (isConfirm) {
                 if (!this.state.noiBo || (this.state.noiBo && this.donViNhan.value().includes('68'))) {
                    this.props.updateHcthCongVanDi(this.state.id, { trangThai:  '2'}, () => this.props.history.push('/user/hcth/cong-van-cac-phong'));
                } else {
                    this.props.updateHcthCongVanDi(this.state.id, { trangThai: '5'}, () => this.props.history.push('/user/hcth/cong-van-cac-phong'));
                }
            }
        });
    }

    tableListFile = (data, id, permission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có file công văn nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%%' }}>Tên tập tin</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Vị trí</th>                
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const
                timeStamp = item.thoiGian,
                originalName = item.ten,
                linkFile = `/api/hcth/cong-van-cac-phong/download/${id || 'new'}/${originalName}`;
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell content={(
                        permission.write ? <FormTextBox type='text' placeholder='Nhập vị trí' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[index] = e } onChange={e => this.onViTriChange(e, index)} /> : item.viTri
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index, item)}>
                        <a className='btn btn-info' href={linkFile} download title='Tải về'>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>

                </tr>
            );
        }
    });

    render = () => {
        const permission = this.getUserPermission('hcthCongVanDi', ['read', 'write', 'delete']),
        isNew = !this.state.id, 
        presidentPermission = this.getUserPermission('president', ['login']),
        hcthStaffPermission = this.getUserPermission('hcth', ['login']);
    
        let titleText = !isNew ? 'Cập nhật' : 'Tạo mới';
        const listTrangThaiCv = Object.keys(listTrangThai).map(item => 
            ({
                id: item, 
                text: listTrangThai[item].status
            }));
        let lengthDv = this.state.listDonViQuanLy.length;

       // let readTrangThai = (this.state.trangThai == '2' || this.state.trangThai == '4' || this.state.trangThai == '5' || this.state.trangThai == '6' || this.state.trangThai == '3');
        let readPhanHoi = (this.state.trangThai == '5' || this.state.trangThai == '6' );
        //let checkDonViGui = this.state.listDonViQuanLy.includes(this.state.donViGui);
        let readTrangThai = (this.state.trangThai == '2' || this.state.trangThai == '5' || this.state.trangThai == '6' || this.state.trangThai == '3' || this.state.trangThai == '4');
        
        //let lengthDv = this.state.listDonViQuanLy.length;
        let checkDonViGui = this.state.checkDonViGui;        
        
        let read = false;
        if (!isNew) {
            if (!permission.write && (lengthDv == 0)){
                read = true;
            } else if (hcthStaffPermission.login && !checkDonViGui) {
                read = true;
            } else if (hcthStaffPermission.login && checkDonViGui && (this.state.trangThai != '1')){
                read = true;
            }
        }
        
        const readCondition = (read || readTrangThai);
        
        let checkDaDoc = true;
        if (this.state.trangThai === '5') {
            if (hcthStaffPermission.login && !this.state.donViNhan.includes('29')) {
                checkDaDoc = false;
            } else if (presidentPermission.login) {
                checkDaDoc = false;
            } else if (checkDonViGui) {
                checkDaDoc = false;
            }
        } else {
            checkDaDoc = false;
        }
        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Công văn giữa các phòng',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp </Link>,
                <Link key={1} to='/user/hcth/cong-van-cac-phong'>Công văn giữa các phòng</Link>,
                !isNew ? 'Cập nhật' : 'Tạo mới'
            ],
            content: <>
                <div className='tile'>
                    <div className='clearfix'>
                        <div className='d-flex justify-content-between'>
                            <h3 className='tile-title'>{titleText}</h3>
                            
                            { !isNew && (
                                    <div className='pr-0'>
                                        {
                                            this.state.noiBo && this.state.donViNhan && this.state.donViNhan.indexOf('68') < 0 ? 
                                             (
                                                 checkDaDoc ?
                                                 <button className='btn btn-success mr-2 form-group' type='button' onClick={this.onReadCvDi}>
                                                     Đã đọc
                                                 </button> :
 
                                                <FormSelect className='col-md-12' ref={e => this.trangThai = e} label='Trạng thái' readOnly={true} data={listTrangThaiCv} required />
                                            )
                                            : 
                                            <FormSelect className='col-md-12' ref={e => this.trangThai = e} label='Trạng thái' readOnly={true} data={listTrangThaiCv} required />
                                        }
                                    </div>                                    
                            )}
                        </div>
    
                    </div>
                    <div className='tile-body row'>
                        {
                            !isNew && this.state.trangThai == '3' && (!this.state.noiBo || (this.state.noiBo && this.state.donViNhan && this.state.donViNhan.indexOf('68') >= 0)) &&
                            <FormTextBox type='text' className='col-md-12' ref={e => this.soCongVan = e} label='Số công văn' readOnly={true}/>
                        }
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={readCondition} required readOnlyEmptyText='Chưa có ngày gửi'/>
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={readCondition} readOnlyEmptyText='Chưa có ngày ký'/>
                        <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi' readOnly={readCondition ? 1 : 0} data={SelectAdapter_DmDonViFilter(this.state.listDonViQuanLy)} required readOnlyEmptyText='Chưa có đơn vị gửi'/>
                        <FormCheckbox isSwitch className='col-md-12 form-group' ref={e => this.noiBo = e} label='Công văn nội bộ' readOnly={readCondition} onChange={value => this.setState({ noiBo: value })}></FormCheckbox>
                        {this.state.noiBo ? <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Đơn vị nhận' ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={readCondition} readOnlyEmptyText='Chưa có đơn vị nhận'/> : null}
                        {!this.state.noiBo ? <FormSelect multiple={true} className='col-md-12' label='Đơn vị nhận' placeholder='Đơn vị nhận' ref={e => this.donViNhanNgoai = e} data={SelectAdapter_DmDonViGuiCongVan} readOnly={readCondition} readOnlyEmptyText='Chưa có đơn vị nhận'/> : null}
                        {this.state.noiBo ? <FormSelect multiple={true} className='col-md-12' label='Cán bộ nhận' placeholder='Cán bộ nhận' ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={readCondition} readOnlyEmptyText='Chưa có cán bộ nhận'/> : null}
                        <FormSelect className='col-md-12' label='Loại công văn' placeholder='Chọn loại công văn' ref={e => this.loaiCongVan= e} data={SelectAdapter_DmLoaiCongVan} readOnly={readCondition} readOnlyEmptyText='Chưa có cán bộ nhận' required/> 
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={readCondition} required readOnlyEmptyText=': Chưa có trích yếu'/>
                    </div>
                    <div className='tile-body row d-flex justify-content-end'>
                        {!readTrangThai && checkDonViGui && !presidentPermission.login && <button className='btn btn-success mr-2' type='button' onClick={this.onSend}>Gửi</button>
                        }
                        {this.state.trangThai == '2' && hcthStaffPermission && hcthStaffPermission.login &&  <button className='btn btn-success mr-2' type='button' onClick={this.onConfirmCvDi}>Duyệt</button>
                        }
                    </div>
                </div>

                {  !isNew && !readPhanHoi && 
                    <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Phản hồi</h3>
                        <div className='tile-body row'>
                            <div className='col-md-12'>
                                {
                                    this.renderPhanHoi(this.state.phanHoi)
                                }
                            </div>
                            {
                                this.state.trangThai !== '4' &&
                                <>
                                    <FormRichTextBox type='text' className='col-md-12 mt-3' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
                                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <button type='submit' className='btn btn-primary mr-2' onClick={this.onCreatePhanHoi}>
                                            Thêm
                                        </button> 
                                        { this.state.trangThai == '2' && hcthStaffPermission && hcthStaffPermission.login && <button type='submit' className='btn btn-danger' onClick={this.onReturnCvDi}>
                                            Trả lại
                                        </button>}
                                        
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                    </div>}
                {
                    (!readTrangThai || (!checkDonViGui && this.state.trangThai == '1')) &&
                    <div className="tile">
                        <div className="form-group">
                            <h3 className='tile-title'>Danh sách công văn đi</h3>
                            <div className='tile-body row'>
                                <div className='form-group col-md-8'>
                                    {this.tableListFile(this.state.listFile, this.state.id, permission)}
                                </div>
                                <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDiFile' userData='hcthCongVanDiFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />
                            </div>
                        </div>
                    </div>
                }
                
            </>,
            backRoute: '/user/hcth/cong-van-cac-phong',
            onSave: (((permission && permission.write) || (lengthDv >= 1) && this.state.trangThai == '') || (hcthStaffPermission && hcthStaffPermission.login  && this.state.trangThai == '') || (checkDonViGui  && this.state.trangThai == '1')) ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = {
    getHcthCongVanDiAll,
    getHcthCongVanDiPage,
    createHcthCongVanDi,
    updateHcthCongVanDi,
    deleteHcthCongVanDi,
    getHcthCongVanDiSearchPage,
    deleteFile,
    getCongVanDi,
    createPhanHoi
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);