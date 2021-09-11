import React from 'react';
import { connect } from 'react-redux';
import { PageName, getDmKhuVucPage, createDmKhuVuc, updateDmKhuVuc, deleteDmKhuVuc } from './redux';
import { getDmChauAll, SelectAdapter_DmChau } from 'modules/mdDanhMuc/dmChau/redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { Select } from 'view/component/Input';

class EditModal extends AdminModal {
    state = { kichHoat: true };
    modal = React.createRef();
    chauMapper = {};

    onShow = (item) => {

        let { ma, ten, kichHoat, territory, maChau } = item ? item : { ma: '', ten: '', kichHoat: true, territory: '', maChau: '' };
        this.ma.value(ma);
        this.ten.value(ten);
        this.territory.value(territory);
        this.kichHoat.value(kichHoat);
        this.maChau.setVal(maChau);
        this.setState({ kichHoat });
        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maKhuVuc = $(this.modal).attr('data-ma');
        const changes = {
            ma: this.ma.value().trim(),
            ten: this.ten.value().trim(),
            territory: this.territory.value().trim(),
            maChau: this.maChau.getFormVal().data,
            kichHoat: Number(this.state.kichHoat),
        };
        if (changes.ma == "") {
            T.notify('Hãy điền đầy đủ thông tin trước khi lưu!', 'danger');
            this.ma.focus();
        }
        else {
            if (maKhuVuc) this.props.update({ ma: maKhuVuc }, changes);
            else this.props.create(changes);
            $(this.modal).modal('hide');
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật' : 'Tạo mới',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.ma = e} label='Mã khu vực' readOnly={readOnly} placeholder='Mã khu vực' required />
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.ten = e} label='Tên khu vực' readOnly={readOnly} placeholder='Tên khu vực' required />
                <FormTextBox type='text' className='col-12 col-md-6' ref={e => this.territory = e} label='Tên tiếng Anh' readOnly={readOnly} placeholder='Tên tiếng Anh' required />
                <div className='col-12 col-md-6'>
                    <Select ref={e => this.maChau = e} adapter={SelectAdapter_DmChau} label='Châu' required />
                </div>
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmKhuVucAdminPage extends AdminPage {
    state = { searching: true };
    searchBox = React.createRef();
    modal = React.createRef();
    chauMapper = {};

    componentDidMount() {
        this.props.getDmChauAll(items => {
            if (items) {
                this.chauMapper = {};
                items.forEach(item => this.chauMapper[item.ma] = item.ten);
            }
        });
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Khu vực', `Bạn có chắc bạn muốn xóa khu vực ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmKhuVuc(item.ma));
    }

    changeActive = item => this.props.updateDmKhuVuc({ ma: item.ma }, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmKhuVuc:write'),
            permission = this.getUserPermission('dmKhuVuc', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmKhuVuc && this.props.dmKhuVuc.page ?
            this.props.dmKhuVuc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };
        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '50%' }} nowrap='true'>Tên khu vực</th>
                        <th style={{ width: '50%' }} nowrap='true'>Tên tiếng Anh</th>
                        <th style={{ width: 'auto' }} >Châu</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma} />
                        <TableCell type='link' content={item.ten} onClick={(e) => this.edit(e, item)} />
                        <TableCell type='text' content={item.territory} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.chauMapper && this.chauMapper[item.maChau] ? this.chauMapper[item.maChau] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>
                ),
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Khu vực</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmKhuVucPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name={PageName} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} dmChau={this.props.dmChau}
                        create={this.props.createDmKhuVuc} update={this.props.updateDmKhuVuc} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' onClick={this.edit} style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmKhuVuc: state.dmKhuVuc, dmChau: state.dmChau });
const mapActionsToProps = { getDmKhuVucPage: getDmKhuVucPage, createDmKhuVuc, updateDmKhuVuc, deleteDmKhuVuc, getDmChauAll };
export default connect(mapStateToProps, mapActionsToProps)(dmKhuVucAdminPage);
