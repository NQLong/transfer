import React from 'react';
import { connect } from 'react-redux';
import { PageName, createDmNguonVon, getDmNguonVonPage, updateDmNguonVon, deleteDmNguonVon } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
  modal = React.createRef();

  componentDidMount() {
    $(() =>
      setTimeout(() => {
        $(this.modal.current).on('shown.bs.modal', () => $('#dmNguonVonMaNguonVon').focus());
      }, 250)
    );
  }

  show = (item) => {
    let { ma, tenNguonVon } = item ? item : { ma: '', tenNguonVon: '' };
    $('#dmNguonVonMaNguonVon').val(ma);
    $('#dmNguonVonTenNguonVon').val(tenNguonVon);

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
        ma: $('#dmNguonVonMaNguonVon').val().trim().toUpperCase(),
        tenNguonVon: $('#dmNguonVonTenNguonVon').val().trim(),
      };

    if (changes.ma == '') {
      T.notify('Mã nguồn vốn bị trống!', 'danger');
      $('#dmNguonVonMaNguonVon').focus();
    } else if (changes.tenNguonVon == '') {
      T.notify('Tên nguồn vốn bị trống!', 'danger');
      $('#dmNguonVonTenNguonVon').focus();
    } else {
      if (ma) {
        this.props.updateDmNguonVon(ma, changes);
      } else {
        this.props.createDmNguonVon(changes);
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
              <h5 className='modal-title'>Nguồn Vốn</h5>
              <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
            <div className='modal-body'>
              <div className='form-group row'>
                <div className='col-12 col-sm-6'>
                  <label htmlFor='dmNguonVonMaNguonVon'>Mã nguồn vốn</label>
                  <input className='form-control' id='dmNguonVonMaNguonVon' type='text' placeholder='Mã nguồn vốn' readOnly={readOnly} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className='col-12 col-sm-6'>
                  <label htmlFor='dmNguonVonTenNguonVon'>Tên nguồn vốn</label>
                  <input className='form-control' id='dmNguonVonTenNguonVon' type='text' placeholder='Tên nguồn vốn' readOnly={readOnly} />
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

  delete = (e, item) => {
    e.preventDefault();
    T.confirm('Xóa danh mục nguồn vốn', 'Bạn có chắc bạn muốn xóa nguồn vốn này?', true,
      (isConfirm) => isConfirm && this.props.deleteDmNguonVon(item.ma));
  };

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permissionWrite = currentPermissions.includes('dmNguonVon:write'),
      permissionDelete = currentPermissions.includes('dmNguonVon:delete');
    const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dmNguonVon && this.props.dmNguonVon.page ? this.props.dmNguonVon.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
    let table = 'Không có dữ liệu nguồn vốn!';
    if (this.props.dmNguonVon && this.props.dmNguonVon.page && this.props.dmNguonVon.page.list && this.props.dmNguonVon.page.list.length > 0) {
      table = (
        <table className='table table-hover table-bordered'>
          <thead>
            <tr>
              <th style={{ width: 'auto' }}>Mã</th>
              <th style={{ width: '40%' }} nowrap='true'>Tên nguồn vốn</th>
              <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {this.props.dmNguonVon.page.list.map((item, index) => (
              <tr key={index}>
                <td>{item.ma}</td>
                <td><a href='#' onClick={(e) => this.edit(e, item)}>{item.tenNguonVon}</a></td>
                <td style={{ textAlign: 'center' }}>
                  <div className='btn-group'>
                    <a className='btn btn-primary' href='#' onClick={(e) => this.edit(e, item)}>
                      <i className='fa fa-lg fa-edit' />
                    </a>
                    {permissionDelete && (
                      <a className='btn btn-danger' href='#' onClick={(e) => this.delete(e, item)}>
                        <i className='fa fa-trash-o fa-lg' />
                      </a>
                    )}
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
          <h1><i className='fa fa-list-alt' /> Danh mục Nguồn Vốn</h1>
          <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmNguonVonPage} setSearching={(value) => this.setState({ searching: value })} />
          <ul className='app-breadcrumb breadcrumb'>
            <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
            <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;Nguồn Vốn
          </ul>
        </div>
        <div className='tile'>
          {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
          <EditModal ref={this.modal} readOnly={!permissionWrite} createDmNguonVon={this.props.createDmNguonVon} updateDmNguonVon={this.props.updateDmNguonVon} />
          <Pagination name={PageName} style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
            getPage={this.searchBox.current && this.searchBox.current.getPage} />
          <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
            <i className='fa fa-lg fa-reply' />
          </Link>
          {permissionWrite && (
            <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
              <i className='fa fa-lg fa-plus' />
            </button>
          )}
        </div>
      </main>
    );
  }
}

const mapStateToProps = (state) => ({ system: state.system, dmNguonVon: state.dmNguonVon });
const mapActionsToProps = { getDmNguonVonPage, createDmNguonVon, updateDmNguonVon, deleteDmNguonVon };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);
