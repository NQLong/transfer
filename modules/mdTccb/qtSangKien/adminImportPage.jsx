import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell, FormRichTextBox, CirclePageButton } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBo } from '../../mdTccb/tccbCanBo/redux';
import { createMultiQtSangKien } from './redux';

const listCapAnhHuong = [
    { id: 1, text: 'Cấp bộ' },
    { id: 2, text: 'Cấp cơ sở' }
];

class EditModal extends AdminModal {
    state = {
        index: null,
    };

    onShow = (item) => {
        let { shcc, maSo, tenSangKien, soQuyetDinh, capAnhHuong } = item && item.item ? item.item : {
            id: '', shcc: '', maSo: '', tenSangKien: '', soQuyetDinh: '', capAnhHuong: '',
        }, index = item.index;

        this.setState({
            index
        }, () => {
            this.maCanBo.value(shcc);
            this.maSo.value(maSo ? maSo : '');
            this.tenSangKien.value(tenSangKien ? tenSangKien : '');
            this.soQuyetDinh.value(soQuyetDinh ? soQuyetDinh : '');
            this.capAnhHuong.value(capAnhHuong ? capAnhHuong : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let ma = this.maCanBo.value();
        if (!ma) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.maSo.value()) {
            T.notify('Mã số sáng kiến trống', 'danger');
            this.maSo.focus();
        } else if (!this.tenSangKien.value()) {
            T.notify('Tên sáng kiến trống', 'danger');
            this.tenSangKien.focus();
        } else if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định trống', 'danger');
            this.soQuyetDinh.focus();
        } else {
            const changes = {
                shcc: ma,
                maSo: this.maSo.value(),
                tenSangKien: this.tenSangKien.value(),
                soQuyetDinh: this.soQuyetDinh.value(),
                capAnhHuong: this.capAnhHuong.value(),
            };
            this.props.update(this.state.index, changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật danh sách sáng kiến',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} />
                <FormTextBox className='col-md-6' ref={e => this.maSo = e} label='Mã số sáng kiến' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} required />
                <FormRichTextBox className='col-md-12' ref={e => this.tenSangKien = e} label='Tên sáng kiến' readOnly={readOnly} required />
                <FormSelect className='col-md-6' ref={e => this.capAnhHuong = e} label='Cấp ảnh hưởng' data={listCapAnhHuong} readOnly={readOnly} />
            </div>
        });
    }
}

class QtSangKienImportPage extends AdminPage {
    state = { qtSangKien: [], message: '', isDisplay: true, displayState: 'import' };

    componentDidMount() {
        T.ready('/user/tccb');
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.items) {
            this.setState({
                qtSangKien: response.items,
                message: `${response.items.length} hàng được tải lên thành công`,
                isDisplay: false,
                displayState: 'data'
            }, () => T.notify(this.state.message, 'success'));
        }
    };

    update = (index, changes, done) => {
        const qtSangKien = this.state.qtSangKien, currentValue = qtSangKien[index];
        const updateValue = Object.assign({}, currentValue, changes);
        qtSangKien.splice(index, 1, updateValue);
        this.setState({ qtSangKien }
        , () => T.notify('Cập nhật dữ liệu thành công', 'success'));
        done && done();
    };

    showModal = (e, index, item) => {
        e.preventDefault();
        this.modal.show({ index, item});
    }

    delete = (e, index) => {
        T.confirm('Xóa danh sách sáng kiến', 'Bạn có chắc bạn muốn xóa danh sách sáng kiến này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const qtSangKien = this.state.qtSangKien;
                qtSangKien.splice(index, 1);
                this.setState({ qtSangKien },
                () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
        });
        e.preventDefault();
    }
    
    save = (e) => {
        const doSave = () => {
            const data = this.state.qtSangKien;
            this.props.createMultiQtSangKien(data, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    this.setState({ displayState: 'import', qtSangKien: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} khen thưởng thành công!`, 'success');
                    this.props.history.push('/user/tccb/qua-trinh/sang-kien');
                }
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những sáng kiến này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };

    showUpload = (e) => {
        e.preventDefault();
        this.setState({ isDisplay: true });
    }

    cancelUpload = () => {
        this.setState({ displayState: 'import' });
    }

    render() {
        const { qtSangKien, displayState } = this.state,
        permission = this.getUserPermission('qtSangKien', ['read', 'write', 'delete']);
        let table = renderTable({
            emptyTable: 'Không có dữ liệu về sáng kiến',
            getDataSource: () => qtSangKien, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên sáng kiến</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cấp ảnh hưởng</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(item.maSo || '')} />
                    <TableCell type='text' content={(item.tenSangKien || '')} />
                    <TableCell type='text' content={(item.soQuyetDinh || '')} />
                    <TableCell type='text' content={(item.capAnhHuong == 1 ? 'Cấp bộ' : (item.capAnhHuong == 2 ? 'Cấp cơ sở' : ''))} />
                    {
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ index, item })} onDelete={this.delete}> 
                        </TableCell>
                    }
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-lightbulb-o',
            title: 'Import sáng kiến',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình sáng kiến'
            ],
            content: <>
                <div className='tile rows' style={{ textAlign: 'right',  display: displayState == 'import' ? 'block' : 'none'}}>
                    <FileBox postUrl='/user/upload' uploadType='SangKienDataFile' userData={'SangKienDataFile'} 
                            accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                            style={{ width: '80%', margin: '0 auto' }}
                            ajax={true} success={this.onSuccess} />
                        <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/qua-trinh/sang-kien/download-template')}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                        </button>
                </div>
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                    {table}
                </div>
                <EditModal ref={e => this.modal = e} permission={permission}
                         update={this.update}
                    permissions={permission}
                />
                <CirclePageButton style ={{ display: displayState == 'import' ? 'none' : 'block',  marginRight: '65px' }}
                 onClick={e => e.preventDefault() || this.cancelUpload()} className='btn-warning' type='custom' customIcon='fa fa-lg fa-refresh' tooltip='Hủy tải lên' />
            </>,
            backRoute: '/user/tccb',
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtSangKien: state.tccb.qtSangKien });
const mapActionsToProps = {
    createMultiQtSangKien
};
export default connect(mapStateToProps, mapActionsToProps)(QtSangKienImportPage);