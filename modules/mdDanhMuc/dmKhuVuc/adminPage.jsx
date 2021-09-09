import React from 'react';
import { connect } from 'react-redux';
import { PageName, getDmKhuVucPage, createDmKhuVuc, updateDmKhuVuc, deleteDmKhuVuc } from './redux';
import { getDmChauAll } from 'modules/mdDanhMuc/dmChau/redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    state = { ma: null, saving: false, isUpdate: false };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('hidden.bs.modal', () => this.setState({ ma: null, isUpdate: false }));
        });
        $('#inputmaChau').select2({
            ajax: {
                url: '/api/danh-muc/chau/page/1/20',
                data: params => ({ condition: params.term }),
                processResults: data => ({ results: data && data.page && data.page.list ? data.page.list.map(item => ({ id: item.ma, text: `${item.ma}: ${item.ten}` })) : [] })
            },
            dropdownParent: $('#inputmaChau').parent().parent(),
            placeholder: 'Chọn mã châu'
        });
    }

    show = (item) => {
        if (item) this.setState({
            ma: item && item.ma ? item.ma : null,
            isUpdate: true
        });
        else {
            item = {};
            this.setState({ ma: null, isUpdate: false });
        }
        $('#inputma').val(item.ma ? item.ma : null);
        $('#inputten').val(item.ten ? item.ten : null);
        $('#inputterritory').val(item.territory ? item.territory : null);
        if (item.maChau) {
            $.ajax({
                type: 'GET',
                url: '/api/danh-muc/chau/item/' + item.maChau
            }).then(function (data) {
                let option = new Option(`${data.item.ma}: ${data.item.ten}`, data.item.ma, true, true);
                $('#inputmaChau').append(option).trigger('change');
                $('#inputmaChau').trigger({
                    type: 'select2:select',
                    params: {
                        data: data
                    }
                });
            });
        } else {
            $('#inputmaChau').val('').trigger('change.select2');
        }
        $('#inputkichHoat').prop('checked', item.kichHoat ? true : false);
        $(this.modal.current).modal('show');
        $('input[auto-focus]').focus();
    };

    save = (e) => {
        e.preventDefault();
        const changes = {
            ma: $('#inputma').val().trim(),
            ten: $('#inputten').val().trim(),
            territory: $('#inputterritory').val().trim(),
            maChau: $('#inputmaChau').val() ? $('#inputmaChau').val().trim() : '',
            kichHoat: $('#inputkichHoat')[0].checked ? 1 : 0
        };
        if (!Object.values(changes).reduce((x, y) => x || y) || !changes['ma']) {
            T.notify('Hãy điền đầy đủ thông tin trước khi lưu!', 'danger');
            return;
        }
        this.setState({ saving: true });
        if (this.state.isUpdate) {
            this.props.update({ ma: this.state.ma }, changes, item => {
                $(this.modal.current).modal('hide');
                this.setState({ saving: false });
            });
        } else {
            this.props.create(changes, item => {
                $(this.modal.current).modal('hide');
                this.setState({ saving: false });
            });
        }
    };

    render() {
        const readOnly = this.props.readOnly ? true : false;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{this.state.isUpdate ? 'Cập nhật' : 'Tạo mới'} khu vực</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='inputma'>Mã khu vực</label>
                                <input className='form-control' id='inputma' placeholder='Mã khu vực' type='text' auto-focus='' maxLength={3} readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='inputten'>Tên khu vực</label>
                                <input className='form-control' id='inputten' placeholder='Tên khu vực' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='inputterritory'>Tên tiếng Anh</label>
                                <input className='form-control' id='inputterritory' placeholder='Tên tiếng Anh' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group col-12 col-md-6'>
                                <label htmlFor='inputmaChau'>Châu</label>
                                <select className='form-control' id='inputmaChau' readOnly={readOnly}></select>
                            </div>
                            <div className='form-group col-12 col-md-6' style={{ display: 'inline-flex', width: '100%' }}>
                                <label htmlFor='inputkichHoat'>Kích hoạt</label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='inputkichHoat' disabled={readOnly} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary' onClick={this.save} disabled={this.state.saving}>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
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
            permissionDelete = currentPermissions.includes('dmKhuVuc:delete'),
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
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Khu vực
                    </ul>
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
