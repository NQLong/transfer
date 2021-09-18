import React from 'react';
import { connect } from 'react-redux';
import { getDmQuocGiaPage, deleteDmQuocGia, createDmQuocGia, updateDmQuocGia, createDmQuocGiaByUpload } from './redux';
import FileBox from 'view/component/FileBox';
import { Link } from 'react-router-dom';
import { FormTextBox, renderTable, AdminModal, TableCell, AdminPage, } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.maCode.value() ? this.maCode.focus() : this.tenQuocGia.focus();
        }));
    }
    onShow = (item) => {
        let { maCode, tenQuocGia, country, shortenName, codeAlpha, maKhuVuc, tenKhac, } = item ? item : { maCode: '', tenQuocGia: '', country: '', shortenName: '', codeAlpha: '', maKhuVuc: '', tenKhac: '', maCu: '' };
        this.setState({maCode});
        this.maCode.value(maCode);
        this.tenQuocGia.value(tenQuocGia);
        this.country.value(country);
        this.shortenName.value(shortenName ? shortenName : '');
        this.codeAlpha.value(codeAlpha ? codeAlpha : '');
        this.maKhuVuc.value(maKhuVuc ? maKhuVuc : '');
        this.tenKhac.value(tenKhac ? tenKhac : '');
    }

    onSubmit = e => {
        e.preventDefault();
        const changes = {
            maCode: this.maCode.value().toUpperCase(),
            tenQuocGia: this.tenQuocGia.value(),
            country: this.country.value(),
            shortenName: this.shortenName.value().toUpperCase(),
            codeAlpha: this.codeAlpha.value().toUpperCase(),
            maKhuVuc: this.maKhuVuc.value().toUpperCase(),
            tenKhac: this.tenKhac.value().toUpperCase(),
            maCu: '',
        };

        if (changes.maCode == '') {
            T.notify('Mã quốc gia bị trống!', 'danger');
            this.maCode.focus();
        } else if (changes.tenQuocGia == '') {
            T.notify('Tên quốc gia bị trống!', 'danger');
            this.tenQuocGia.focus();
        } else if (changes.country == '') {
            T.notify('Quốc gia bị trống!', 'danger');
            this.country.focus();
        } else {
            let dataChanges = {
                changes: changes,
                maCode: changes.maCode
            };
            this.props.dataChanges(dataChanges, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật quốc gia',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12 col-sm-4' maxLength={2} ref={e => this.maCode = e} label='Mã quốc gia' 
                    readOnly={this.state.maCode ? true : readOnly} required />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.tenQuocGia = e} label='Tên quốc gia' 
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.country = e} label='Quốc gia' 
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12 col-sm-4' maxLength={2} ref={e => this.shortenName = e} label='Tên viết tắt' 
                    readOnly={readOnly} />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.codeAlpha = e} label='Code Alpha' 
                    readOnly={readOnly}  />
                <FormTextBox type='text' className='col-12 col-sm-4' ref={e => this.maKhuVuc = e} label='Mã khu vực' 
                    readOnly={readOnly}  />
                <div className='col-md-12'>
                    <FormTextBox type='text' ref={e => this.tenKhac = e} label='Tên khác' 
                        readOnly={readOnly}  />
                    <small className='form-text text-muted'>Có thể có nhiều tên. Mỗi tên cách nhau bằng dấu phẩy (,).</small>
                </div>
            </div>
        });
    }
}

class adminUploadPage extends AdminPage {
    state = { dmQuocGia: [], isDisplay: true, displayState: 'import' };

    componentDidMount() {
        T.ready('/user/category');
    }

    showEdit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        let indexDelete;
        T.confirm('Xóa danh mục quốc gia', 'Bạn có chắc bạn muốn xóa quốc gia này?', true, isConfirm =>
            isConfirm && this.setState(state => {
                state.dmQuocGia.forEach((data, index) => {
                    if (data.maCode == item.maCode) {
                        indexDelete = index;
                    }
                });
                state.dmQuocGia.splice(indexDelete, 1);
                return state;
            }));
    }

    updateTableData = (dataEditModal, done) => {
        this.setState((state, ) => {
            state.dmQuocGia.forEach(data => {
                if (data.maCode == dataEditModal.changes.maCode) {
                    data.tenQuocGia = dataEditModal.changes.tenQuocGia;
                    data.country = dataEditModal.changes.country;
                    data.shortenName = dataEditModal.changes.shortenName;
                    data.codeAlpha = dataEditModal.changes.codeAlpha;
                    data.maKhuVuc = dataEditModal.changes.maKhuVuc;
                    data.tenKhac = dataEditModal.changes.tenKhac;
                }
            });
            return state;
        });
        done && done();
    }

    onSuccess = (data) => {
        this.setState({ 
            dmQuocGia: data.dmQuocGia,
            isDisplay: false,
            displayState: 'data'
        });
    }

    save = () => {
        let dataImport = this.state.dmQuocGia;
        if (dataImport && dataImport.length > 0) {
            this.props.createDmQuocGiaByUpload(dataImport, () => {
                T.notify('Cập nhật thành công!', 'success');
                this.props.history.push('/user/danh-muc/quoc-gia');
            });
        }
    }

    render() {
        const { dmQuocGia, displayState} = this.state,
            permission = this.getUserPermission('dmQuocGia', ['read', 'write', 'delete']);
        let table = null;
        if (dmQuocGia && dmQuocGia.length > 0) {
            table = renderTable({
                getDataSource: () => dmQuocGia, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }} nowrap='true'>Tên quốc gia</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Code alpha</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Tên viết tắt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã khu vực</th>
                        <th style={{ width: '50%' }}>Tên khác</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right'}} content={index + 1} />
                        <TableCell type='text' content={item.maCode ? item.maCode : ''} />
                        <TableCell type='link' content={<b>{item.tenQuocGia} {item.country ? `(${item.country})` : ''}</b>}
                            onClick = {() => this.modal.show(item)} />
                        <TableCell type='number' content={item.codeAlpha ? item.codeAlpha : ''} />
                        <TableCell type='text' content={item.shortenName ? item.shortenName : ''} />
                        <TableCell type='text' content={item.maKhuVuc ? item.maKhuVuc : ''} />
                        <TableCell type='text' content={item.tenKhac && item.tenKhac.length > 0 ? item.tenKhac.toString().replaceAll(',', ', ') : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} 
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Import Quốc gia ',
            breadcrumb: [<Link key={0} to='/user/dm-bo-mon'>Danh mục Quốc gia</Link>, 'Import'],
            content: <>
                <FileBox postUrl='/api/danh-muc/quoc-gia/upload' uploadType='DmQuocGiaFile' userData='dmQuocGiaImportData' className='tile' 
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    style={{ width: '50%', margin: '0 auto', display: displayState == 'import' ? 'block' : 'none' }}
                    ajax={true} success={this.onSuccess} error={this.onError} />
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>{table}</div>
                <EditModal dataChanges={this.updateTableData} ref={e => this.modal = e} permission={permission} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
            onImport: displayState == 'data' ? () => this.setState({ displayState: 'import', items: null }) : null,
            onExport: displayState == 'import' ? () => T.download('/download/template/QuocGia.xlsx') : null,
            backRoute: '/user/danh-muc/quoc-gia/',
        });
        // return (
        //     <main className='app-content'>
        //         <div className='app-title'>
        //             <h1><i className='fa fa-list-alt' /> Danh mục Quốc gia: Upload</h1>
        //         </div>
        //         <div style={{ marginTop: '2%' }} className='row tile'>
        //             <FileBox ref={this.fileBox} postUrl='/api/danh-muc/quoc-gia/upload' uploadType='DmQuocGiaFile' userData='dmQuocGiaImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
        //                 success={this.onSuccess} ajax={true} />
        //         </div>

        //         {table ? <div style={{ marginTop: '2%' }} className='row tile'>{table}</div> : null}
        //         <EditModal dataChanges={this.updateTableData} ref={this.modal} readOnly={!permissionWrite} />
        //         <Link to='/user/danh-muc/quoc-gia/' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
        //             <i className='fa fa-lg fa-reply' />
        //         </Link>
        //         {permissionWrite && (
        //             <React.Fragment>
        //                 <a href='/download/template/QuocGia.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
        //                     <i className='fa fa-download' />
        //                 </a>
        //                 <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
        //                     <i className='fa fa-lg fa-save' />
        //                 </button>
        //             </React.Fragment>)}
        //     </main>
        // );
    }
}

const mapStateToProps = state => ({ system: state.system, categoryRoom: state.categoryRoom, categoryBuilding: state.categoryBuilding });
const mapActionsToProps = { getDmQuocGiaPage, deleteDmQuocGia, createDmQuocGia, updateDmQuocGia, createDmQuocGiaByUpload };
export default connect(mapStateToProps, mapActionsToProps)(adminUploadPage);
