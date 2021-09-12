import React from 'react';
import { connect } from 'react-redux';
import { getDmLuongDiNuocNgoaiPage, createDmLuongDiNuocNgoai, deleteDmLuongDiNuocNgoai, updateDmLuongDiNuocNgoai } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };
    modal = React.createRef();

    onShow = (item) => {
        let { ma, moTa, ghiChu, kichHoat } = item ? item : { ma: '', moTa: '', ghiChu: '', kichHoat: true };

        this.ma.value(ma);
        this.moTa.value(moTa);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat });

        $(this.modal).attr('data-id', ma).modal('show');
    };

    onSubmit = () => {
        const ma = $(this.modal).attr('data-id'),
            changes = {
                ma: this.ma.value(),
                moTa: this.moTa.value(),
                ghiChu: this.ghiChu.value(),
                kichHoat: Number(this.kichHoat.value())
            };
        if (changes.moTa == '') {
            T.notify('Mô tả Lương đi nước ngoài bị trống!', 'danger');
            this.moTa.focus();
        } else if (changes.ghiChu == '') {
            T.notify('Ghi chú Lương đi nước ngoài bị trống!', 'danger');
            this.ghiChu.focus();
        } else if (changes.ma == '') {
            T.notify('Mã Lương đi nước ngoài bị trống!', 'danger');
            this.ma.focus();
        } else {
            if (ma) {
                this.props.updateDmLuongDiNuocNgoai(ma, changes);
            } else this.props.createDmLuongDiNuocNgoai(changes);
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới lương đi nước ngoài' : 'Cập nhật lương đi nước ngoài',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã đơn vị' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class DmLuongDiNuocNgoaiPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();
    optionsDonVi = [];

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLuongDiNuocNgoai(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Lương đi nước ngoài', 'Bạn có chắc bạn muốn xóa Lương đi nước ngoài này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLuongDiNuocNgoai(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLuongDiNuocNgoai:write'),
            permission = this.getUserPermission('dmLuongDiNuocNgoai', ['write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmLuongDiNuocNgoai && this.props.dmLuongDiNuocNgoai.page ?
            this.props.dmLuongDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '50%' }}>Mô tả</th>
                    <th style={{ width: '50%' }}>Ghi chú</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='text' content={item.ghiChu} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Lương đi nước ngoài</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmLuongDiNuocNgoaiPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite} optionsDonVi={this.optionsDonVi} createDmLuongDiNuocNgoai={this.props.createDmLuongDiNuocNgoai} updateDmLuongDiNuocNgoai={this.props.updateDmLuongDiNuocNgoai} />
                    <Pagination name='pageDmLuongDiNuocNgoai' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmLuongDiNuocNgoai: state.dmLuongDiNuocNgoai });
const mapActionsToProps = { getDmLuongDiNuocNgoaiPage, createDmLuongDiNuocNgoai, deleteDmLuongDiNuocNgoai, updateDmLuongDiNuocNgoai };
export default connect(mapStateToProps, mapActionsToProps)(DmLuongDiNuocNgoaiPage);