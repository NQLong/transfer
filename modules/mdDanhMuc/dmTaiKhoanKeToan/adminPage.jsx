import React from 'react';
import { connect } from 'react-redux';
import { PageName, createDmTaiKhoanKeToan, getDmTaiKhoanKeToanPage, updateDmTaiKhoanKeToan, deleteDmTaiKhoanKeToan } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
  state = { active: true }
  modal = React.createRef();

  componentDidMount() {
    $(() =>
      setTimeout(() => {
        $(this.modal.current).on('shown.bs.modal', () => $('#dmtkktMaTaiKhoanKeToan').focus());
      }, 250)
    );
  }

  show = (item) => {
    let { ma, tenTaiKhoan, kichHoat } = item ? item : { ma: '', tenTaiKhoan: '', kichHoat: 0 };
    $('#dmtkktMaTaiKhoanKeToan').val(ma);
    $('#dmtkktTenTaiKhoanKeToan').val(tenTaiKhoan);
    this.setState({ active: kichHoat == 1 });

    let thisModal = $(this.modal.current).attr('data-id', ma);
    thisModal.modal('show');
    $(window).one('keyup', (event) => {
      if (event.keyUp === 27) {
        thisModal.modal('hide');
      }
    });
  };

  hide = () => $(this.modal.current).modal('hide');

  save = (e) => {
    e.preventDefault();
    const ma = $(this.modal.current).attr('data-id'),
      changes = {
        ma: $('#dmtkktMaTaiKhoanKeToan').val().trim().toUpperCase(),
        tenTaiKhoan: $('#dmtkktTenTaiKhoanKeToan').val().trim(),
        kichHoat: this.state.active ? '1' : '0',
      };

    if (changes.ma == '') {
      T.notify('Mã tài khoản bị trống!', 'danger');
      $('#dmtkktMaTaiKhoanKeToan').focus();
    } else if (changes.tenTaiKhoanKeToan == '') {
      T.notify('Tên tài khoản bị trống!', 'danger');
      $('#dmtkktTenTaiKhoanKeToan').focus();
    } else {
      if (ma) {
        this.props.updateDmTaiKhoanKeToan(ma, changes);
      } else {
        this.props.createDmTaiKhoanKeToan(changes);
      }
      $(this.modal.current).modal('hide');
    }
  };

  render() {
    const readOnly = this.props.readOnly;
    return (
      <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
        <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Tài khoản kế toán</h5>
              <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
            <div className='modal-body'>
              <div className='form-group row'>
                <div className='col-12 col-sm-6'>
                  <label htmlFor='dmtkktMaTaiKhoanKeToan'>Mã tài khoản</label>
                  <input className='form-control' id='dmtkktMaTaiKhoanKeToan' type='text' placeholder='Mã tài khoản' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className='col-12 col-sm-6'>
                  <label htmlFor='dmtkktTenTaiKhoanKeToan'>Tên tài khoản</label>
                  <input className='form-control' id='dmtkktTenTaiKhoanKeToan' type='text' placeholder='Tên tài khoản' readOnly={readOnly} />
                </div>
              </div>
              <div className='form-group row'>
                <div className='col-12'>
                  <label htmlFor='dmtkktKichHoat'>Kích hoạt: </label>
                  &nbsp;&nbsp;
                  <div className='toggle'>
                    <label>
                      <input type='checkbox' id='dmtkktKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                      <span className='button-indecator' />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
              {!readOnly && (
                <button type='submit' className='btn btn-primary'>Lưu</button>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

class AdminPage extends React.Component {
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

  changeActive = (item) =>
    this.props.updateDmTaiKhoanKeToan(item.ma, { ma: item.ma, kichHoat: item.kichHoat == 1 ? 0 : 1 });

  delete = (e, item) => {
    e.preventDefault();
    T.confirm('Xóa danh mục tài khoản kế toán', 'Bạn có chắc bạn muốn xóa tài khoản này?', true,
      (isConfirm) => isConfirm && this.props.deleteDmTaiKhoanKeToan(item.ma));
  };

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permissionWrite = currentPermissions.includes('dmTaiKhoanKeToan:write'),
      permissionDelete = currentPermissions.includes('dmTaiKhoanKeToan:delete');
    const { pageNumber, pageSize, pageTotal, totalItem } =
      this.props.dmTaiKhoanKeToan && this.props.dmTaiKhoanKeToan.page ? this.props.dmTaiKhoanKeToan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
    let table = 'Không có dữ liệu tài khoản!';
    if (this.props.dmTaiKhoanKeToan && this.props.dmTaiKhoanKeToan.page && this.props.dmTaiKhoanKeToan.page.list && this.props.dmTaiKhoanKeToan.page.list.length > 0) {
      table = (
        <table className='table table-hover table-bordered'>
          <thead>
            <tr>
              <th style={{ width: 'auto' }}>Mã</th>
              <th style={{ width: '40%' }} nowrap='true'>Tên tài khoản</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Kích hoạt</th>
              <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {this.props.dmTaiKhoanKeToan.page.list.map((item, index) => (
              <tr key={index}>
                <td>{item.ma}</td>
                <td><a href='#' onClick={(e) => this.edit(e, item)}>{item.tenTaiKhoan}</a></td>
                <td className='toggle' style={{ textAlign: 'center' }}>
                  <label>
                    <input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
                    <span className='button-indecator' />
                  </label>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className='btn-group'>
                    <a className='btn btn-primary' href='#' onClick={(e) => this.edit(e, item)}>
                      <i className='fa fa-lg fa-edit' />
                    </a>
                    {permissionDelete && (
                      <a className='btn btn-danger' href='#' onClick={(e) => this.delete(e, item)}>
                        <i className='fa fa-trash-o fa-lg' />
                      </a>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <main className='app-content'>
        <div className='app-title'>
          <h1>
            <i className='fa fa-list-alt' /> Danh mục Tài Khoản Kế Toán
          </h1>
          <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmTaiKhoanKeToanPage} setSearching={(value) => this.setState({ searching: value })} />
          <ul className='app-breadcrumb breadcrumb'>
            <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
            <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;Tài Khoản Kế Toán
          </ul>
        </div>
        <div className='tile'>
          {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
          <EditModal ref={this.modal} readOnly={!permissionWrite} createDmTaiKhoanKeToan={this.props.createDmTaiKhoanKeToan} updateDmTaiKhoanKeToan={this.props.updateDmTaiKhoanKeToan} />
          <Pagination name={PageName} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
            getPage={this.searchBox.current && this.searchBox.current.getPage} />
          <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
            <i className='fa fa-lg fa-reply' />
          </Link>
          {permissionWrite && (
            <Link to='/user/danh-muc/tai-khoan-ke-toan/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
              <i className='fa fa-lg fa-cloud-upload' />
            </Link>)}
          {permissionWrite && (
            <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
              <i className='fa fa-lg fa-plus' />
            </button>)}
        </div>
      </main>
    );
  }
}

const mapStateToProps = (state) => ({ system: state.system, dmTaiKhoanKeToan: state.dmTaiKhoanKeToan });
const mapActionsToProps = { getDmTaiKhoanKeToanPage, createDmTaiKhoanKeToan, updateDmTaiKhoanKeToan, deleteDmTaiKhoanKeToan };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
