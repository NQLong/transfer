import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHeChuHoPage, createDmQuanHeChuHo, updateDmQuanHeChuHo, deleteDmQuanHeChuHo } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };
        
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat});

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maQuanHeChuHo = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ma == '') {
            T.notify('Mã quan hệ chủ hộ bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên quan hệ chủ hộ bị trống!', 'danger');
            this.ten.focus();
        } else {
            if (maQuanHeChuHo) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maQuanHeChuHo, changes, () => {
                    T.notify('Cập nhật quan hệ chủ hộ thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới quan hệ chủ hộ thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới quan hệ chủ hộ' : 'Cập nhật quan hệ chủ hộ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã quan hệ chủ hộ' readOnly={readOnly} placeholder='Mã quan hệ chủ hộ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên quan hệ' readOnly={readOnly} placeholder='Tên quan hệ' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmQuanHeChuHoPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Quan hệ chủ hộ', 'Bạn có chắc bạn muốn xóa quan hệ chủ hộ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmQuanHeChuHo(item.ma));
    };

    changeActive = item => this.props.updateDmQuanHeChuHo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmQuanHeChuHo:write'),
            permission = this.getUserPermission('dmQuanHeChuHo', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmQuanHeChuHo && this.props.dmQuanHeChuHo.page ?
            this.props.dmQuanHeChuHo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Quan hệ chủ hộ</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmQuanHeChuHoPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmQuanHeChuHoPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmQuanHeChuHo} update={this.props.updateDmQuanHeChuHo} />
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
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

const mapStateToProps = state => ({ system: state.system, dmQuanHeChuHo: state.dmQuanHeChuHo });
const mapActionsToProps = { getDmQuanHeChuHoPage, createDmQuanHeChuHo, updateDmQuanHeChuHo, deleteDmQuanHeChuHo };
export default connect(mapStateToProps, mapActionsToProps)(dmQuanHeChuHoPage);
