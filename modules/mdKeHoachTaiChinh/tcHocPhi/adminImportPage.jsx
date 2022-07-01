import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { uploadDsHocPhi } from './redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';

class EditModal extends AdminModal {
    state = { index: '' };

    componentDidMount() {
    }

    onShow = (item) => {
        const { mssv, soTien, namHoc, hocKy, hoTenSinhVien } = item ? item.item : { mssv: '', soTien: '', congNo: '' };
        const index = item?.index;

        this.setState({ index }, () => {
            this.mssv.value(mssv || '');
            this.soTien.value(soTien || 0);
            this.namHoc.value(namHoc || 0);
            this.hocKy.value(hocKy || 0);
            this.hoTenSinhVien.value(hoTenSinhVien || 0);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { index } = this.state;
        const nHocPhi = this.soTien.value();
        this.props.update(index, nHocPhi, this.hide);
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật dữ liệu học phí',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.namHoc = e} type='text' label='Năm học' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.hocKy = e} type='text' label='Học kỳ' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.mssv = e} type='text' label='MSSV' readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.hoTenSinhVien = e} type='text' label='Họ và tên' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.soTien = e} type='number' label='Học phí (vnđ)' readOnly={readOnly} />
            </div>
        });
    }
}

class TcHocPhiImportPage extends AdminPage {
    state = { hocPhiAll: [], duplicateDatas: [], message: '', displayState: 'import', isDisplay: true };

    componentDidMount() {
        T.ready('/user/finance');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else if (response.items) {
            this.setState({
                hocPhiAll: response.items,
                duplicateDatas: response.duplicateDatas,
                message: `${response.items.length} hàng được tải lên thành công`,
                isDisplay: false,
                displayState: 'data'
            }, () => {
                const { message, duplicateDatas } = this.state;
                T.notify(message, 'success');
                duplicateDatas.length && T.notify(`${duplicateDatas.length} hàng trùng dữ liệu học phí`, 'danger');
            });
        }
    };

    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.show({ index, item });
    };

    update = (index, nHocPhi, done) => {
        const { hocPhiAll } = this.state;
        const tmpHocPhi = [...hocPhiAll];
        const currentValue = tmpHocPhi[index];
        currentValue['soTien'] = nHocPhi;
        this.setState({ hocPhiAll: tmpHocPhi }, () => T.notify('Cập nhật dữ liệu thành công', 'success'));
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa dữ liệu học phí này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const hocPhiAll = this.state.hocPhiAll;
                hocPhiAll.splice(index, 1);
                this.setState({ hocPhiAll }, () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
        });
    };

    save = (e) => {
        const doSave = () => {
            const data = this.state.hocPhiAll;
            this.props.uploadDsHocPhi(data, (error, data) => {
                if (error) {
                    T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                } else {
                    this.setState({ displayState: 'import', hocPhiAll: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} học phí thành công!`, 'success');
                    this.props.history.push('/user/finance/hoc-phi');
                }
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những dữ liệu này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };

    render() {
        const { hocPhiAll, displayState, duplicateDatas } = this.state,
            permission = this.getUserPermission('tcHocPhi', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!';
        if (hocPhiAll && hocPhiAll.length > 0) {
            table = renderTable({
                getDataSource: () => hocPhiAll, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Học kỳ</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MSSV</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Họ và tên</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại phí</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'right' }}>Tổng phí (vnđ)</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.namHoc} - HK${item.hocKy}`} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.mssv} url={`/user/finance/hoc-phi/${item.mssv}`} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item?.hoTenSinhVien} url={`/user/finance/hoc-phi/${item.mssv}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item?.tenLoaiPhi} />
                        <td type='text' style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                            {item?.curFee &&
                                (<span style={{ textDecoration: 'line-through', display: 'inline-block' }}>
                                    {`${item.curFee.toString().numberWithCommas()}`}
                                </span>)
                            }
                            {item?.curFee && ' -> '}
                            {(item?.soTien?.toString() || '').numberWithCommas()}
                        </td>
                        <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ index, item })} onDelete={(e) => this.delete(e, index)}
                        />
                    </tr>)
            });
        }
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Import dữ liệu học phí',
            breadcrumb: [<Link key={0} to='/user/finance/hoc-phi'>Học phí</Link>, 'Import'],
            content: <>
                <div className='tile rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>
                    <FileBox postUrl='/user/upload' uploadType='TcHocPhiData' userData={'TcHocPhiData'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} />
                    <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/finance/hoc-phi/download-template')}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                    </button>
                </div>
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                    <p>MSSV trùng dữ liệu: {duplicateDatas.join(', ')}</p>
                    {table}
                </div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} update={this.update} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { uploadDsHocPhi };
export default connect(mapStateToProps, mapActionsToProps)(TcHocPhiImportPage);