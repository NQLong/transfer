import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import TextInput from 'view/component/Input';
import { getDanhSachTinhTrangThietBi, createTinhTrangThietBi, deleteTinhTrangThietBi, updateTinhTrangThietBi } from './redux';

class DanhMucTinhTrangThietBi extends Component {
    modal = React.createRef();
    searchBox = React.createRef();

    state = { searching: false };

    componentDidMount() {
        T.ready(() => {
            this.searchBox.current?.getPage();
        });
    }

    create = (data) => {
        if (!data || typeof data !== 'object') {
            return;
        }
        this.props.createTinhTrangThietBi(data, (error, item) => {
            if (!error && item) {
                this.modal.current?.hide();
            }
        });
    }


    update = (ma, changes) => {
        this.props.updateTinhTrangThietBi(ma, changes, (error) => {
            if (!error) {
                this.modal.current?.hide();
            }
        })
    };

    showEditModal = (item) => {
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateTinhTrangThietBi(item.ma, { tinhTrangThietBi: item.tinhTrangThietBi, kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, ma) => {
        e.preventDefault();
        T.confirm('Tình trạng thiết bị', `Bạn có chắc bạn muốn xóa tình trạng thiết bị này?`, 'warning', true, isConfirm =>
            isConfirm && this.props.deleteTinhTrangThietBi(ma));
    }

    render() {
        const currentPermissions = this.props?.system?.user?.permissions || [];
        const permissionWrite = currentPermissions.includes('dmTinhTrangThietBi:write');
        const permissionDelete = currentPermissions.includes('dmTinhTrangThietBi:delete');

        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmTinhTrangThietBi && this.props.dmTinhTrangThietBi.page ?
            this.props.dmTinhTrangThietBi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };

        let table = 'Không có dữ liệu!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive' style={{ fontSize: '13px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                            <th style={{ width: '100%', textAlign: 'center' }} nowrap='true'>Tình trạng thiết bị</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.tinhTrangThietBi}</td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group' style={{ display: 'flex' }}>
                                        {permissionWrite &&
                                            <a className='btn btn-primary' href='#' onClick={() => item && this.showEditModal(item)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>}
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item.ma)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-lg fa-flask fa-fw' />Tình trạng thiết bị</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDanhSachTinhTrangThietBi} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;
                        Tình trạng thiết bị
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='dmTinhTrangThietBiPagination' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.getDanhSachTinhTrangThietBi} />
                    <Link to='/user/khcnda/quan-ly-phong-thi-nghiem' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite && (
                        <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={() => this.showEditModal()}>
                            <i className='fa fa-lg fa-plus' />
                        </button>)}
                    <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.create} update={this.update} />
                </div>
            </main>
        );
    }
}

class EditModal extends Component {
    modal = React.createRef();
    tinhTrangThietBi = React.createRef();
    state = { active: false }

    show = (item = {}) => {
        this.setState({ ma: item ? item.ma : '' });
        this.setState({ active: item ? item.kichHoat == '1' : false });

        if (this.state.ma != '') {
            this.tinhTrangThietBi.current.setVal(item.tinhTrangThietBi);
        }

        $(this.modal.current).find('.modal-title').html(item.ma ? 'Cập nhật tình trạng thiết bị' + item.ma : 'Tạo mới tình trạng thiết bị');
        $(this.modal.current).modal('show');
        this.tinhTrangThietBi.current.focus();
    };

    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (e) => {
        e.preventDefault();
        const data = {
            tinhTrangThietBi: this.tinhTrangThietBi.current.getVal(),
            kichHoat: this.state.active ? '1' : '0',
        };

        if (this.state.ma == undefined) {
            this.props.create(data);
        } else {
            this.props.update(this.state.ma, data);
        }
    };

    render() {
        const readOnly = !!this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='row modal-body'>
                            <div className='form-group col-lg-12'>
                                <TextInput ref={this.tinhTrangThietBi} label='Tình trạng thiết bị' placeholder='Nhập tình trạng thiết bị' disabled={readOnly} required />
                            </div>
                            <div style={{ display: 'inline-flex' }} className='form-group col-lg-12'>
                                <label htmlFor='dmTinhTrangThietBiKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmTinhTrangThietBiKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({ system: state.system, dmTinhTrangThietBi: state.dmTinhTrangThietBi });
const mapActionsToProps = { getDanhSachTinhTrangThietBi, createTinhTrangThietBi, deleteTinhTrangThietBi, updateTinhTrangThietBi };
export default connect(mapStateToProps, mapActionsToProps)(DanhMucTinhTrangThietBi);
