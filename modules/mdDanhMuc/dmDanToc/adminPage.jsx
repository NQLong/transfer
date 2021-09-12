import React from 'react';
import { connect } from 'react-redux';
import { getDmDanTocPage, createDmDanToc, updateDmDanToc, deleteDmDanToc } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true };

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);

        this.setState({ kichHoat });

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    hide = () => $(this.modal).modal('hide');

    onSubmit = () => {
        const maDanToc = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        if (changes.ma == '') {
            T.notify('Mã dân tộc bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên dân tộc bị trống!', 'danger');
            this.ten.focus();
        } else {
            if (maDanToc) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maDanToc, changes, () => {
                    T.notify('Cập nhật dân tộc thành công!', 'success');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới dân tộc thành công!', 'success');
                });
            }
            $(this.modal).modal('hide');
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma == '' ? 'Cập nhật dân tộc' : 'Tạo mới dân tộc',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã dân tộc' readOnly={readOnly} placeholder='Mã dân tộc' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên dân tộc' placeholder='Tên dân tộc' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmDanTocAdminPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmDanTocPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Dân tộc', 'Bạn có chắc bạn muốn xóa dân tộc này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmDanToc(item.ma));
    };

    changeActive = item => this.props.updateDmDanToc(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDanToc:write'),
            permission = this.getUserPermission('dmDanToc', ['write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDanToc && this.props.dmDanToc.page ?
            this.props.dmDanToc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.ma} onClick={e => this.edit(e, item)} style={{ textAlign: 'center' }} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                </tr>
            )

        });

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Dân tộc</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmDanTocPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmDanTocPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        create={this.props.createDmDanToc} update={this.props.updateDmDanToc} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite &&
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmDanToc: state.dmDanToc });
const mapActionsToProps = { getDmDanTocPage, createDmDanToc, updateDmDanToc, deleteDmDanToc };
export default connect(mapStateToProps, mapActionsToProps)(dmDanTocAdminPage);