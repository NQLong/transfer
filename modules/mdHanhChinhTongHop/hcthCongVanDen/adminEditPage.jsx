import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    FormDatePicker,
    renderTable,
    FormTextBox,
    FormSelect,
    TableCell,
    FormRichTextBox,
    FormFileBox
} from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {
    getHcthCongVanDenAll,
    getHcthCongVanDenPage,
    createHcthCongVanDen,
    updateHcthCongVanDen,
    deleteHcthCongVanDen,
    getHcthCongVanDenSearchPage,
    deleteFile,
    getCongVanDen
} from './redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { createDmDonViGuiCv } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';

class AdminEditPage extends AdminPage {
    state = {
        id: null,
        listFile: []
    }

    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/cong-van-den/:id').parse(window.location.pathname);
            this.setState({ id: params.id === 'new' ? null : params.id }, () => this.getData());
        });
    }

    getData = () => {
        const isCreate = !this.state.id;
        if (!isCreate) {
            this.props.getCongVanDen(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData(null);
    }

    setData = (data) => {
        let { ngayCongVan, ngayNhan, ngayHetHan, soCongVan, donViGui, donViNhan, canBoNhan, noiDung, chiDao, linkCongVan } = data ? data :
            { ngayCongVan: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', donViGui: '', donViNhan: '', canBoNhan: '', noiDung: '', chiDao: '', linkCongVan: '' };
        if (donViNhan) {
            donViNhan = donViNhan.split(',');
        }
        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
        }
        this.ngayCongVan.value(ngayCongVan || '');
        this.ngayNhan.value(ngayNhan || '');
        this.ngayHetHan.value(ngayHetHan || '');
        this.soCongVan.value(soCongVan ? soCongVan : '');
        this.donViGui.value(donViGui || '');
        this.donViNhan.value(donViNhan ? donViNhan : '');
        this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        this.noiDung.value(noiDung || '');
        this.chiDao.value(chiDao || '');
        if (linkCongVan && linkCongVan.length > 0) {
            linkCongVan = JSON.parse(linkCongVan);
            this.setState({ listFile: linkCongVan });
        }
        this.fileBox.setData('hcthCongVanDenFile:' + (this.state.id ? this.state.id : 'new'));
    }

    onSuccess = (response) => {
        if (response.data) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.data);
            if (this.state.id) this.props.updateHcthCongVanDen(this.state.id, { linkCongVan: JSON.stringify(listFile) }, () => { this.setState({ listFile }); });
            else this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.state.id ? this.state.id : null, index, item, () => {
                let listFile = [...this.state.listFile];
                listFile.splice(index, 1);
                this.setState({ listFile });
            }));
    }


    tableListFile = (data, id, permission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có file công văn nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%' }}>Tên tập tin</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const
                timeStamp = parseInt(item.split('/')[2].substring(0, 13)),
                originalName = item.split('/')[2].substring(14);
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={'/api/hcth/cong-van-den/download' + item} download>{originalName}</a>
                    </>
                    } />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')}></TableCell>
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index, item)}>
                        <a className='btn btn-info' href={`/api/hcth/cong-van-den/download${item}`} download>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });

    save = () => {
        const changes = {
            ngayCongVan: Number(this.ngayCongVan.value()),
            ngayNhan: Number(this.ngayNhan.value()),
            ngayHetHan: Number(this.ngayHetHan.value()),
            soCongVan: this.soCongVan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value().toString() || null,
            canBoNhan: this.canBoNhan.value().toString() || null,
            noiDung: this.noiDung.value(),
            chiDao: this.chiDao.value(),
            linkCongVan: this.state.listFile ? JSON.stringify(this.state.listFile) : '[]',
        };
        if (!changes.ngayCongVan) {
            T.notify('Ngày công văn bị trống', 'danger');
            this.ngayCongVan.focus();
        } else if (!changes.ngayNhan) {
            T.notify('Ngày nhận công văn bị trống', 'danger');
            this.ngayNhan.focus();
        } else if (!changes.donViGui || (Array.isArray(changes.donViGui) && changes.donViGui.length === 0)) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.maDonViGuiCV.focus();
        } else if (!changes.noiDung) {
            T.notify('Nội dung công văn bị trống', 'danger');
            this.noiDung.focus();
        } else if (changes.ngayNhan < changes.ngayCongVan) {
            T.notify('Ngày nhận công văn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        } else if (changes.ngayHetHan && changes.ngayHetHan < changes.ngayCongVan) {
            T.notify('Ngày công văn hết hạn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        }
        else {
            if (this.state.id) {
                this.props.updateHcthCongVanDen(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthCongVanDen(changes, () => this.props.history.push('/user/hcth/cong-van-den'));
            }
        }
    }

    onCreateDonviGui = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({error, item}) => {
            if (!error) {
                const { id } = item;
                this.donViGui?.value(id);
                done && done({error, item});
            }
            this.modal.hide();
        });
    }

    render() {
        const permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']);
        const donViguiPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']);
        const readOnly = !permission.write;
        const isNew = !this.state.id;
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đến',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>hành chính tổng </Link>,
                <Link key={1} to='/user/hcth/cong-van-den'>Công văn đến</Link>,
                isNew ? 'Tạo mới' : 'Cập nhật'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới công văn đến' : 'Cập nhật công văn đến'}</h3>
                    <div className='tile-body row'>
                        <FormTextBox type='text' className='col-md-12' ref={e => this.soCongVan = e} label='Mã số CV' readOnly={readOnly} />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayCongVan = e} label='Ngày CV' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' readOnly={readOnly} />
                        <div className='col-md-12' style={{paddingTop: 0}}>
                            <span>Chưa có <b>Đơn vị gửi công văn</b>? <Link to='#' onClick={() => this.modal.show(null)}>Tạo mới</Link></span>
                        </div>
                        <FormSelect className='col-md-12' ref={e => this.donViGui = e} label={'Đơn vị gửi công văn'} data={SelectAdapter_DmDonViGuiCongVan} readOnly={readOnly} required />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                        <FormSelect multiple={true} className='col-md-6' ref={e => this.donViNhan = e} label='Đơn vi nhận công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                        <FormSelect multiple={true} className='col-md-6' ref={e => this.canBoNhan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label='Chỉ đạo' readOnly={readOnly} />
                    </div>
                </div>
                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Danh sách công văn</h3>
                        <div className='tile-body row'>
                            <div className='form-group col-md-8'>
                                {this.tableListFile(this.state.listFile, this.state.id, permission)}
                            </div>
                            <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDenFile' userData='hcthCongVanDenFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e}
                    permissions={donViguiPermission}
                    create={this.onCreateDonviGui}
                />

            </>,
            backRoute: '/user/hcth/cong-van-den',
            onSave: permission && permission.write ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcth: state.hcth.hcthCongVanDen });
const mapActionsToProps = {
    getHcthCongVanDenAll,
    getHcthCongVanDenPage,
    createHcthCongVanDen,
    updateHcthCongVanDen,
    deleteHcthCongVanDen,
    getHcthCongVanDenSearchPage,
    getCongVanDen,
    deleteFile,
    createDmDonViGuiCv
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);