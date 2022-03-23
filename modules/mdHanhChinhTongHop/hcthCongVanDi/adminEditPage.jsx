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
    getCongVanDi
} from './redux';
// import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { 
    AdminPage, 
    AdminModal, 
    FormDatePicker, 
    renderTable, 
    FormRichTextBox, 
    FormSelect, 
    TableCell, 
    FormCheckbox, 
    FormFileBox
} from 'view/component/AdminPage';
import T from 'view/js/common';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class AdminEditPage extends AdminPage {
    state = {
        id: null, 
        isDonVi: 0, 
        isCanBo: 0,
        listFile: []
    };
    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/cong-van-di/:id').parse(window.location.pathname);
            this.setState({ params }, () => this.getData());
        });
    }

    getData = () => {
        const id = this.state.params?.id;
        const isCreate = id === 'new';
        if (!isCreate) {
            this.props.getCongVanDi(Number(this.state.params.id), (item) => this.setData(item));
        }
        else this.setData(null);
    }

    setData = (data) => {
        let { id, noiDung, ngayGui, ngayKy, donViGui, donViNhan, canBoNhan, isDonVi, isCanBo, linkCongVan } = data ? data : 
        { id: '', noiDung: '', ngayGui: '', ngayKy: '', donViGui: '', donViNhan: '', canBoNhan: '', isDonVi: 0, isCanBo: 0, linkCongVan: '[]'};
        this.setState({id, isDonVi, isCanBo});
        // console.log(item);
        this.setState({
            isDonVi: isDonVi == 1 | isDonVi == '1',
            isCanBo: isCanBo == 1 | isCanBo == '1',
            listFile: (linkCongVan && linkCongVan.length > 0) ? JSON.parse(linkCongVan) : []
        }, () => {
            this.noiDung.value(noiDung);
            this.ngayGui.value(ngayGui);
            this.ngayKy.value(ngayKy);
            this.donViGui.value(donViGui);
            // console.log("state don vi: " + donViNhan);
            // console.log("state can bo: " + canBoNhan);
            this.isDonVi.value(this.state.isDonVi);
            this.isCanBo.value(this.state.isCanBo);
            if (this.state.isDonVi) {
                $('#isdv').show();
                if (donViNhan) {
                    donViNhan = donViNhan.split(',');
                    this.donViNhan.value(donViNhan);
                }
            } else {
                $('#isdv').hide();
                this.donViNhan.value('');
            }
            
            if (this.state.isCanBo) {
                $('#iscb').show();
                if (canBoNhan) {
                    canBoNhan = canBoNhan.split(',');
                    this.canBoNhan.value(canBoNhan);
                } 
                // else this.canBoNhan.value('');
            } else {
                $('#iscb').hide();
                this.canBoNhan.value('');
            }
            this.fileBox.setData('hcthCongVanDiFile:' + (this.state.id ? this.state.id: 'new'));
        });
    }

    onSuccess = (response) => {
        if (response.data) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.data);
            if (this.state.id) this.props.updateHcthCongVanDi(this.state.params.id, { linkCongVan: JSON.stringify(listFile) }, () => { this.setState({ listFile }); });
            else this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.state.id, index, item, () => {
                let listFile = [...this.state.listFile];
                listFile.splice(index, 1);
                this.setState({ listFile });
            }));
    }

    save = () => {
        const changes = {
            noiDung: this.noiDung.value(),
            ngayGui: Number(this.ngayGui.value()),
            ngayKy: Number(this.ngayKy.value()),
            donViGui: this.donViGui.value(),
            donViNhan: this.state.isDonVi ? this.donViNhan.value().toString() : null,
            canBoNhan: this.state.isCanBo ? this.canBoNhan.value().toString() : null,
            isDonVi: this.state.isDonVi ? 1 : 0,
            isCanBo: this.state.isCanBo ? 1 : 0,
            linkCongVan: this.state.listFile ? JSON.stringify(this.state.listFile) : '[]'
        };
        console.log(changes);
        // console.log("don vi " + this.state.isDonVi);
        // console.log("can bo " + this.state.isCanBo);
        if (!changes.noiDung) {
            T.notify('Nội dung bị trống', 'danger');
            this.noiDung.focus();
        } else if (!changes.ngayGui) {
            T.notify('Ngày gửi công văn bị trống', 'danger');
            this.ngayGui.focus();
        } else if (!changes.ngayKy) {
            T.notify('Ngày ký công văn bị trống', 'danger');
            this.ngayKy.focus();
        } else if (!changes.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else if (changes.isDonVi == 1 && !changes.donViNhan) {
            T.notify('Đơn vị nhận bị trống', 'danger');
            this.donViNhan.focus();
        } else if (changes.isCanBo == 1 && !changes.canBoNhan) {
            T.notify('Cán bộ nhận bị trống', 'danger');
            this.canBoNhan.focus();
        } else {
            if (this.state.id) {
                this.props.update(this.state.id, changes, this.hide);
            } else {
                this.props.createHcthCongVanDi(changes, () => this.props.history.push('/user/hcth/cong-van-di'));
            }        
        }
    }

    tableListFile = (data, id, permission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có file công văn nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '100%' }}>Tên tập tin</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày upload</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                    <a href={'/api/hcth/cong-van-di/download' + item.substring(1)} download>{item.substring(24)}</a>
                </>
                } />
                <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(item.substring(10, 23)), 'dd/mm/yyyy HH:MM')}></TableCell>
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index, item)}>
                    <a className='btn btn-info' href={`/api/hcth/cong-van-di/download${item}`} download>
                        <i className='fa fa-lg fa-download' />
                    </a>
                </TableCell>
            </tr>
        )
    });

    render = () => {
        const permission = {
            write: true,
            delete: true
        };
        const readOnly = this.props.readOnly;
        return this.renderPage({
            icon: 'fa fa-caret-square-o-right',
            title: 'Công văn đi',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp </Link>,
                <Link key={1} to='/user/hcth/cong-van-di'>Công văn đi</Link>,
                this.state.id ? 'Cập nhật' : 'Tạo mới'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới công văn đi' : 'Cập nhật công văn đi'}</h3>
                    <div className='tile-body row'>
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayGui = e} label='Ngày gửi' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayKy = e} label='Ngày ký' readOnly={readOnly} required />
                        <FormSelect className='col-md-12' ref={e => this.donViGui = e} label='Đơn vị gửi công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} required />
                        <div className='col-md-12'>
                            <div className='row'>
                                <FormCheckbox isSwitch ref={e => this.isDonVi = e} className='col-md-12 formCheckDv' label='Đơn vị nhận' onChange={value => { value ? $('#isdv').show() : $('#isdv').hide(); this.setState({ isDonVi: value });}} />
                                <div className='col-md-12' id='isdv'><FormSelect multiple={true} ref={e => this.donViNhan = e} data={SelectAdapter_DmDonVi} readOnly={readOnly} required={this.state.isDonVi} /></div>
                            </div>
                        </div>                    
                        <div className='col-md-12'>
                            <div className='row'>
                                <FormCheckbox isSwitch ref={e => this.isCanBo = e} className='col-md-12 formCheckCb' label='Cán bộ nhận' onChange={value => { value ? $('#iscb').show() : $('#iscb').hide(); this.setState({ isCanBo: value});}} />
                                <div className='col-md-12' id='iscb'><FormSelect multiple={true} ref={e => this.canBoNhan = e} data={SelectAdapter_FwCanBo} readOnly={readOnly} required={this.state.isCanBo} /></div>
                            </div>
                        </div>                    
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                    </div>
                </div>
                <div className="tile">
                    <div className="form-group">
                        <h3 className='tile-title'>Danh sách công văn</h3>
                        <div className='tile-body row'>
                            <div className='form-group col-md-8'>
                                {this.tableListFile(this.state.listFile, this.state.id, permission)}
                            </div>
                            <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDiFile' userData='hcthCongVanDiFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/hcth/cong-van-di',
            onSave: permission && permission.write ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi});
const mapActionsToProps = { 
    getHcthCongVanDiAll, 
    getHcthCongVanDiPage, 
    createHcthCongVanDi, 
    updateHcthCongVanDi, 
    deleteHcthCongVanDi, 
    getHcthCongVanDiSearchPage,
    deleteFile,
    getCongVanDi
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);