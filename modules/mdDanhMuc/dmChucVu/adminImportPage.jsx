import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiDmChucVu } from './redux';
import { FormTextBox, FormCheckbox, renderTable, AdminModal, TableCell, AdminPage, } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { index: -1, isActive: null };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ma.focus();
        }));
    }
    onShow = (item) => {
        const { ma, ten, phuCap, kichHoat, ghiChu, index } = item || { ma: '', ten: '', phuCap: null, kichHoat: 1, ghiChu: '', index: -1 };
        this.ma?.value(ma);
        this.ten.value(ten);
        this.phuCap.value(phuCap ? phuCap : '');
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.setState({ index: index });
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = () => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            phuCap: this.phuCap.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
        };
        if (!this.ma?.value()) {
            T.notify('Mã không được trống!', 'danger');
            this.ma.focus();
        } else if (!changes.ten) {
            T.notify('Tên không được trống!', 'danger');
            this.ten.focus();
        } else {
            this.props.update(this.state.index, changes, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Cập nhật chức vụ',
        body: <div className='row'>
            <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={this.props.permission && !this.props.permission.write} />
            <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' readOnly={this.props.permission && !this.props.permission.write} />
            <FormTextBox type='number' className='col-md-12' ref={e => this.phuCap = e} label='Phụ cấp' readOnly={this.props.permission && !this.props.permission.write} step={0.01} />
            <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} onChange={value => this.changeKichHoat(value ? 1 : 0)} readOnly={this.props.permission && !this.props.permission.write} />
            <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={this.props.permission && !this.props.permission.write} />
        </div>,
    });
}

class DmChucVuImportPage extends AdminPage {
    state = { dmChucVu: [], message: '', isDisplay: true, displayState: 'import', listChucVu: [] };

    componentDidMount() {
        T.ready('/user/category');
    }

    onSuccess = (response) => {
        this.setState({
            dmChucVu: response.items,
            message: <p className='text-center' style={{ color: 'green' }}>{response.items.length} hàng được tải lên thành công</p>,
            isDisplay: false,
            displayState: 'data'
        });
    };

    edit = (e, item, index) => {
        e.preventDefault();
        this.modal.show(index, item);
    };

    update = (index, changes, done) => {
        const dmChucVu = this.state.dmChucVu, currentValue = dmChucVu[index];
        const updateValue = Object.assign({}, currentValue, changes);
        dmChucVu.splice(index, 1, updateValue);
        this.setState({ dmChucVu });
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        const dmChucVu = this.state.dmChucVu;
        dmChucVu.splice(index, 1);
        this.setState({ dmChucVu });
    };

    save = (e) => {
        const doSave = (isOverride) => {
            const data = this.state.dmChucVu;
            this.props.createMultiDmChucVu(data, isOverride, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    this.setState({ displayState: 'import', dmChucVu: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} chức vụ thành công!`, 'success');
                    this.props.history.push('/user/danh-muc/chuc-vu');
                }
            });
        };
        e.preventDefault();
        T.confirm3('Cập nhật dữ liệu', 'Bạn có muốn <b>ghi đè</b> dữ liệu đang có bằng dữ liệu mới không?<br>Nếu không rõ, hãy chọn <b>Không ghi đè</b>!', 'warning', 'Ghi đè', 'Không ghi đè', isOverride => {
            if (isOverride !== null) {
                if (isOverride)
                    T.confirm('Ghi đè dữ liệu', 'Bạn có chắc chắn muốn ghi đè dữ liệu?', 'warning', true, isConfirm => {
                        if (isConfirm) doSave('TRUE');
                    });
                else doSave('FALSE');
            }
        });
    };

    showUpload = (e) => {
        e.preventDefault();
        this.setState({ isDisplay: true });
    }

    render() {
        const { dmChucVu, displayState } = this.state,
            permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
        const table = renderTable({
            getDataSource: () => dmChucVu,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Phụ cấp</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.ma} onClick={() => this.modal.show({ ...item, index: index })} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='text' content={item.phuCap} />
                    <TableCell type='checkbox' content={item.kichHoat == 1} permission={permission} onChanged={value => this.update(index, item.kichHoat = value ? 1 : 0)} />
                    <TableCell type='text' content={item.ghiChu} />
                    <TableCell type='buttons' content={{ ...item, index: index }} permission={permission} onEdit={() => this.modal.show({ ...item, index: index })} onDelete={(e) => this.delete(e, index)}></TableCell>
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Import Chức vụ ',
            breadcrumb: [<Link key={0} to='/user/danh-muc/chuc-vu'>Danh mục Chức vụ</Link>, 'Import'],
            content: <>
                <FileBox postUrl='/user/upload' uploadType='DmChucVuFile' userData='DmChucVuFile' className='tile' accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    style={{ width: '50%', margin: '0 auto', display: displayState == 'import' ? 'block' : 'none' }}
                    ajax={true} success={this.onSuccess} error={this.onError} />
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} update={this.update} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
            onImport: displayState == 'data' ? () => this.setState({ displayState: 'import', items: null }) : null,
            onExport: displayState == 'import' ? () => T.download('/api/danh-muc/chuc-vu/download-template') : null,
            backRoute: '/user/danh-muc/chuc-vu',

        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, });
const mapActionsToProps = { createMultiDmChucVu };
export default connect(mapStateToProps, mapActionsToProps)(DmChucVuImportPage);
