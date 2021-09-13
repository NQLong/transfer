import React from 'react';
import { connect } from 'react-redux';
import { getDmChiBoPage, createDmChiBo, updateDmChiBo, deleteDmChiBo } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: true };

        this.setState({ kichHoat });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    hide = () => $(this.modal).modal('hide');

    onSubmit = () => {
        const maChiBo = $(this.modal).attr('data-ma'),
            changes = {
                ten: this.ten.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ten == '') {
            T.notify('Tên bị trống!', 'danger');
            this.ma.focus();
        } else {
            if (maChiBo) {
                this.props.update(maChiBo, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal).modal('hide');
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật thông tin' : 'Tạo mới thông tin',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã danh mục' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên chi bộ' placeholder='Tên chi bộ' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmChiBoPage extends AdminPage {
    modal = React.createRef();
    state = { searching: false };
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmChiBoPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
            isConfirm && this.props.deleteDmChiBo(item.ma));
    };

    changeActive = item => this.props.updateDmChiBo(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmChiBo:write');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dmChiBo && this.props.dmChiBo.page ?
            this.props.dmChiBo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='number' content={item.ma} style={{ textAlign: 'center' }} />
                    <TableCell type='link' content={item.ten} onClick={e => this.edit(e, item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permissionWrite} onEdit={this.edit}/>
                </tr>
            )
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Chi bộ</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmChiBoPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                <Pagination name={dmChiBoPage} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDmChiBoPage} />
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmChiBo} update={this.props.updateDmChiBo} />
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

const mapStateToProps = state => ({ system: state.system, dmChiBo: state.dmChiBo });
const mapActionsToProps = { getDmChiBoPage, createDmChiBo, updateDmChiBo, deleteDmChiBo };
export default connect(mapStateToProps, mapActionsToProps)(dmChiBoPage);
