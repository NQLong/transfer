import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { createMultiDmBoMon } from './redux';
import { FormTextBox, renderTable, AdminModal, TableCell, AdminPage, } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    constructor(props) {
        super(props);
        this.state = { index: -1 };
    }

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.ma.focus();
        }));
    }

    onShow = (index, item) => {
        let { ma, ten, tenTiengAnh, maDv, qdThanhLap, qdXoaTen, ghiChu } = item ? item : { ma: '', ten: '', tenTiengAnh: '', maDv: '', qdThanhLap: '', qdXoaTen: '', kichHoat: 0, ghiChu: '' };
        this.setState({ index });
        this.ma.value(ma);
        this.ten.value(ten);
        this.maDv.value(maDv);
        this.tenTiengAnh.value(tenTiengAnh);
        this.qdThanhLap.value(qdThanhLap ? qdThanhLap : '');
        this.qdXoaTen.value(qdXoaTen ? qdXoaTen : '');
        this.ghiChu.value(ghiChu ? ghiChu : '');
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            ten: this.ten.value(),
            tenTiengAnh: this.tenTiengAnh.value(), 
            maDv: this.maDv.value(),
            qdThanhLap: this.qdThanhLap.value(),
            qdXoaTen: this.qdXoaTen.value(),
            ghiChu: this.ghiChu.value(),
        };
        if (changes.ma == '') {
            T.notify('Mã bộ môn bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.maDv == '') {
            T.notify('Mã đơn vị bị trống!', 'danger');
            this.maDv.focus();
        } else {
            this.props.update(this.state.ma, changes, this.hide);
        }
        e.preventDefault();
    };

    render = () => {
        return this.renderModal({
            title: 'Cập nhật bộ môn',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã bộ môn' 
                    readOnly={this.props.permission && !this.props.permission.write} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên bộ môn (tiếng Việt)' 
                    readOnly={this.props.permission && !this.props.permission.write} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTiengAnh = e} label='Tên bộ môn (tiếng Anh)' 
                    readOnly={this.props.permission && !this.props.permission.write} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTiengAnh = e} label='Mã đơn vị' 
                    readOnly={this.props.permission && !this.props.permission.write} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.qdThanhLap = e} label='Quyết định thành lập' 
                    readOnly={this.props.permission && !this.props.permission.write} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.qdXoaTen = e} label='Quyết định xóa tên' 
                    readOnly={this.props.permission && !this.props.permission.write} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' 
                    readOnly={this.props.permission && !this.props.permission.write} />
            </div>
        });
    }
}

class DmBoMonImportPage extends AdminPage {
    state = { dmBoMon: [], message: '', isDisplay: true, displayState: 'import', listBoMon: [] };

    componentDidMount() {
        T.ready('/user/category');
    }

    onSuccess = (response) => {
        this.setState({
            dmBoMon: response.items,
            message: <p className='text-center' style={{ color: 'green' }}>{response.items.length} hàng được tải lên thành công</p>,
            isDisplay: false,
            displayState: 'data'
        });
    };

    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.show(index, item);
    };

    update = (index, changes, done) => {
        const dmBoMon = this.state.dmBoMon, currentValue = dmBoMon[index];
        const updateValue = Object.assign({}, currentValue, changes);
        dmBoMon.splice(index, 1, updateValue);
        this.setState({ dmBoMon });
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        const dmBoMon = this.state.dmBoMon;
        dmBoMon.splice(index, 1);
        this.setState({ dmBoMon });
    };

    save = (e) => {
        const doSave = (isOverride) => {
            const data = this.state.dmBoMon;
            this.props.createMultiDmBoMon(data, isOverride, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    this.setState({ displayState: 'import', dmBoMon: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} bộ môn thành công!`, 'success');
                    this.props.history.push('/user/dm-bo-mon');
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

    onChangeCheckBox = (e, index) => {
        let { dmBoMon } = this.state;
        dmBoMon[index].kichHoat = dmBoMon[index].kichHoat === 1 ? 0 : 1;
        this.setState({ dmBoMon });
    }

    render() {
        const { dmBoMon, displayState} = this.state,
            permission = this.getUserPermission('dmBoMon', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!';
        if (dmBoMon && dmBoMon.length > 0) {
            table = renderTable({
                getDataSource: () => dmBoMon, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã bộ môn </th>
                        <th style={{ width: '50%' }}>Tên bộ môn </th>
                        <th style={{ width: '50%' }}>Tên tiếng Anh</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã đơn vị </th>
                        <th style={{ width: 'auto' }} nowrap='true'>Quyết định thành lập </th>
                        <th style={{ width: 'auto' }} nowrap='true'>Quyết định xóa tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.ma ? item.ma : ''} onEdit={(e) => this.showEdit(e, index, item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.tenTiengAnh ? item.tenTiengAnh : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.maDv ? item.maDv : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.qdThanhLap ? item.qdThanhLap : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.qdXoaTen ? item.qdXoaTen : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission} 
                            onChanged={e => this.onChangeCheckBox(e, index)} />
                        <TableCell type='buttons' content={{ ...item, index: index }} permission={permission} 
                            onEdit={() => this.modal.show({ ...item, index: index })} onDelete={(e) => this.delete(e, index)}></TableCell>
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Import Bộ môn ',
            breadcrumb: [<Link key={0} to='/user/dm-bo-mon'>Danh mục Bộ môn</Link>, 'Import'],
            content: <>
                <FileBox postUrl='/user/upload' uploadType='DmBoMonFile' userData='DmBoMonFile' className='tile' 
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    style={{ width: '50%', margin: '0 auto', display: displayState == 'import' ? 'block' : 'none' }}
                    ajax={true} success={this.onSuccess} error={this.onError} />
                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} update={this.update} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
            onImport: displayState == 'data' ? () => this.setState({ displayState: 'import', items: null }) : null,
            onExport: displayState == 'import' ? () => T.download('/api/dm-bo-mon/download-template') : null,
            backRoute: '/user/dm-bo-mon',

        });
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = { createMultiDmBoMon };
export default connect(mapStateToProps, mapActionsToProps)(DmBoMonImportPage);