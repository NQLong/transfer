import React from 'react';
import { connect } from 'react-redux';
import { PageName, createDmDonViTinh, getDmDonViTinhPage, updateDmDonViTinh, deleteDmDonViTinh } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
  modal = React.createRef();

  componentDidMount() {
    $(document).ready(() =>
      setTimeout(() => {
        $(this.modal.current).on('shown.bs.modal', () => $('#dmdvtMaDonViTinh').focus());
      }, 250)
    );
  }

  show = (item) => {
    let { ma, ten, maCu } = item ? item : { ma: '', ten: '', maCu: '' };
    $('#dmdvtMaDonViTinh').val(ma);
    $('#dmdvtTenDonViTinh').val(ten);
    $(this.modal.current).attr('data-id', ma).modal('show');
  };

  hide = () => $(this.modal.current).modal('hide');

  save = (e) => {
    e.preventDefault();
    const ma = $(this.modal.current).attr('data-id'),
      changes = {
        ma: $('#dmdvtMaDonViTinh').val().trim().toUpperCase(),
        ten: $('#dmdvtTenDonViTinh').val().trim(),
        maCu: '',
      };

    if (changes.ma == '') {
      T.notify('Mã đơn vị tính bị trống!', 'danger');
      $('#dmdvtMaDonViTinh').focus();
    } else if (changes.ten == '') {
      T.notify('Tên đơn vị tính bị trống!', 'danger');
      $('#dmdvtTenDonViTinh').focus();
    } else {
      if (ma) {
        this.props.updateDmDonViTinh(ma, changes);
      } else {
        this.props.createDmDonViTinh(changes);
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
              <h5 className='modal-title'>Đơn vị tính</h5>
              <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                <span aria-hidden='true'>&times;</span>
              </button>
            </div>
            <div className='modal-body'>
              <div className='form-group row'>
                <div className='col-12 col-sm-6'>
                  <label htmlFor='dmdvtMaDonViTinh'>Mã đơn vị tính</label>
                  <input className='form-control' id='dmdvtMaDonViTinh' type='text' placeholder='Mã đơn vị tính' style={{ textTransform: 'uppercase' }} />
                </div>
                <div className='col-12 col-sm-6'>
                  <label htmlFor='dmdvtTenDonViTinh'>Tên đơn vị tính</label>
                  <input className='form-control' id='dmdvtTenDonViTinh' type='text' placeholder='Tên đơn vị tính' />
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

class dmDonViTinhAdminPage extends AdminPage {
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
    T.confirm('Xóa danh mục đơn vị tính', 'Bạn có chắc bạn muốn xóa đơn vị tính này?', true, (isConfirm) =>
      isConfirm && this.props.deleteDmDonViTinh(item.ma));
  };

  render() {
    const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
      permissionWrite = currentPermissions.includes('dmDonViTinh:write'),
      permissionDelete = currentPermissions.includes('dmDonViTinh:delete'),
      permission = this.getUserPermission('dmDonViTinh', ['write', 'delete']);
    const { pageNumber, pageSize, pageTotal, totalItem, list } = 
      this.props.dmDonViTinh && this.props.dmDonViTinh.page ? 
      this.props.dmDonViTinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: []  };
    let table = 'Không có dữ liệu đơn vị tính!';
    if (list && list.length > 0) {
      table = renderTable({
        getDataSource: () => list, stickyHead: false,
        renderHead: () => (
          <tr>
            <th style={{ width: 'auto' }}>Mã</th>
            <th style={{ width: '100%' }} nowrap='true'>Tên</th>
            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
          </tr>),
        renderRow: (item, index) => (
          <tr key={index}>
            <TableCell type='text' content={item.ma} />
            <TableCell type='link' content={item.ten} onClick={(e) => this.edit(e, item)} />
            <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}/>
          </tr>
        ),
      })
    }

    return (
      <main className='app-content'>
        <div className='app-title'>
          <h1><i className='fa fa-list-alt' /> Danh mục Đơn vị tính</h1>
          <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmDonViTinhPage} setSearching={(value) => this.setState({ searching: value })} />
          <ul className='app-breadcrumb breadcrumb'>
            <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
            <Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;Đơn vị tính
          </ul>
        </div>
        <div className='tile'>
          {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
          <EditModal ref={this.modal} readOnly={!permissionWrite}
            createDmDonViTinh={this.props.createDmDonViTinh} updateDmDonViTinh={this.props.updateDmDonViTinh} />
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

const mapStateToProps = (state) => ({ system: state.system, dmDonViTinh: state.dmDonViTinh });
const mapActionsToProps = { getDmDonViTinhPage, createDmDonViTinh, updateDmDonViTinh, deleteDmDonViTinh };
export default connect(mapStateToProps, mapActionsToProps)(dmDonViTinhAdminPage);
