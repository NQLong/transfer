import React from 'react';
import { connect } from 'react-redux';
import { getDmNguonKinhPhiTrongNuocPage, deleteDmNguonKinhPhiTrongNuoc, createDmNguonKinhPhiTrongNuoc, updateDmNguonKinhPhiTrongNuoc } from './redux';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };
    modal = React.createRef();

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: null, moTa: '', kichHoat: 1 };
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);

        this.setState({kichHoat});

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maNguonKinhPhiTrongNuoc = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value().trim(),
                moTa: this.moTa.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ma == '') {
            T.notify('Mã bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả bị trống!', 'danger');
            this.moTa.focus();
        } else {
            if (maNguonKinhPhiTrongNuoc) {
                this.props.updateDmNguonKinhPhiTrongNuoc(maNguonKinhPhiTrongNuoc, changes);
            } else {
                this.props.createDmNguonKinhPhiTrongNuoc(changes);
            }
            $(this.modal).modal('hide');
        }
    };


    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật kinh phí trong nước' : 'Tạo mới kinh phí trong nước',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã ' readOnly={readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class DmNguonKinhPhiTrongNuocPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => {
        this.props.updateDmNguonKinhPhiTrongNuoc(item.ma, { kichHoat: Number(!item.kichHoat) });
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa nguồn kinh phí trong nước!', 'Bạn có chắc bạn muốn xóa Nguồn kinh phí trong nước này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNguonKinhPhiTrongNuoc(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNguonKinhPhiTrongNuoc:write'),
            permission = this.getUserPermission('dmNguonKinhPhiTrongNuoc', ['write', 'delete']);

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNguonKinhPhiTrongNuoc && this.props.dmNguonKinhPhiTrongNuoc.page ?
            this.props.dmNguonKinhPhiTrongNuoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Mô tả</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Kinh phí trong nước</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmNguonKinhPhiTrongNuocPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='pageDmNguonKinhPhiTrongNuoc' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />
                </div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmNguonKinhPhiTrongNuoc={this.props.dmNguonKinhPhiTrongNuoc}
                    createDmNguonKinhPhiTrongNuoc={this.props.createDmNguonKinhPhiTrongNuoc} updateDmNguonKinhPhiTrongNuoc={this.props.updateDmNguonKinhPhiTrongNuoc} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNguonKinhPhiTrongNuoc: state.dmNguonKinhPhiTrongNuoc });
const mapActionsToProps = { getDmNguonKinhPhiTrongNuocPage, deleteDmNguonKinhPhiTrongNuoc, createDmNguonKinhPhiTrongNuoc, updateDmNguonKinhPhiTrongNuoc };
export default connect(mapStateToProps, mapActionsToProps)(DmNguonKinhPhiTrongNuocPage);