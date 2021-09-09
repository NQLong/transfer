import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiTaiSanCoDinhPage, createDmLoaiTaiSanCoDinh, updateDmLoaiTaiSanCoDinh, deleteDmLoaiTaiSanCoDinh } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends React.Component {
	modal = React.createRef();

	componentDidMount() {
		$(document).ready(() => {
			$(this.modal.current).on('shown.bs.modal', () => $('#dmLoaiTaiSanCoDinhMa').focus());
		});
	}

	show = (item) => {
		let { ma, ten, maNhom, maTaiKhoan, maHieu, donViTinh } = item ? item : { ma: null, ten: '', maNhom: '', maTaiKhoan: '', maHieu: '', donViTinh: '' };
		$('#dmLoaiTaiSanCoDinhMa').val(ma);
		$('#dmLoaiTaiSanCoDinhTen').val(ten);
		$('#dmLoaiTaiSanCoDinhDonViTinh').val(donViTinh ? donViTinh.toString() : '');
		$('#dmLoaiTaiSanCoDinhMaNhom').val(maNhom ? maNhom.toString() : '');
		$('#dmLoaiTaiSanCoDinhMaTaiKhoan').val(maTaiKhoan ? maTaiKhoan.toString() : '');
		$('#dmLoaiTaiSanCoDinhMaHieu').val(maHieu ? maHieu.toString() : '');
		$(this.modal.current)
			.find('.modal-title')
			.html(item ? 'Cập nhật loại tài sản cố định' : 'Tạo mới loại tài sản cố định');
		$(this.modal.current).attr('data-ma', ma).modal('show');
	};

	save = (e) => {
		e.preventDefault();
		const maLoaiTaiSanCoDinh = $(this.modal.current).attr('data-ma'),
			changes = {
				ma: $('#dmLoaiTaiSanCoDinhMa').val().trim(),
				ten: $('#dmLoaiTaiSanCoDinhTen').val().trim(),
				donViTinh: $('#dmLoaiTaiSanCoDinhDonViTinh').val().trim(),
				maNhom: $('#dmLoaiTaiSanCoDinhMaNhom').val().trim(),
				maTaiKhoan: $('#dmLoaiTaiSanCoDinhMaTaiKhoan').val().trim(),
				maHieu: $('#dmLoaiTaiSanCoDinhMaHieu').val().trim(),
			};
		if (changes.ma == '') {
			T.notify('Mã loại tài sản cố định bị trống!', 'danger');
			$('#dmLoaiTaiSanCoDinhMa').focus();
		} else if (changes.ten == '') {
			T.notify('Tên loại tài sản cố định bị trống!', 'danger');
			$('#dmLoaiTaiSanCoDinhTen').focus();
		} else {
			if (maLoaiTaiSanCoDinh) {
				this.props.update(maLoaiTaiSanCoDinh, changes, () => {
					T.notify('Cập nhật loại tài sản cố định thành công!', 'success');
				});
			} else {
				this.props.create(changes, () => {
					T.notify('Tạo mới loại tài sản cố định!', 'success');
				});
			}
			$(this.modal.current).modal('hide');
		}
	};

	render() {
		const readOnly = this.props.readOnly;
		return (
			<div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
				<form className='modal-dialog' role='document' autoComplete='off' onSubmit={this.save}>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title'></h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>
							<div className='form-group'>
								<label htmlFor='dmLoaiTaiSanCoDinhMa'>  Mã loại tài sản cố định </label>
								<input className='form-control' id='dmLoaiTaiSanCoDinhMa' placeholder='Mã loại tài sản cố định' type='text' />
							</div>
							<div className='form-group'>
								<label className='control-label' htmlFor='dmLoaiTaiSanCoDinhTen'> Tên loại tài sản cố định </label>
								<input className='form-control' type='text' placeholder='Tên loại tài sản cố định' id='dmLoaiTaiSanCoDinhTen' />
							</div>
							<div className='form-group'>
								<label htmlFor='dmLoaiTaiSanCoDinhDonViTinh'>Đơn vị tính</label>
								<input className='form-control' id='dmLoaiTaiSanCoDinhDonViTinh' placeholder='Đơn vị tính' type='text' readOnly={readOnly} />
							</div>
							<div className='form-group'>
								<label htmlFor='dmLoaiTaiSanCoDinhMaTaiKhoan'> Mã tài khoản </label>
								<input className='form-control' id='dmLoaiTaiSanCoDinhMaTaiKhoan' placeholder='Mã tài khoản' type='text' readOnly={readOnly} />
							</div>
							<div className='form-group'>
								<label htmlFor='dmLoaiTaiSanCoDinhMaNhom'> Mã nhóm tài sản cố định </label>
								<input className='form-control' id='dmLoaiTaiSanCoDinhMaNhom' placeholder='Mã nhóm tài sản cố định' type='text' readOnly={readOnly} />
							</div>
							<div className='form-group'>
								<label htmlFor='dmLoaiTaiSanCoDinhMaHieu'>Mã hiệu</label>
								<input className='form-control' id='dmLoaiTaiSanCoDinhMaHieu' placeholder='Mã hiệu' type='text' />
							</div>
						</div>
						<div className='modal-footer'>
							<button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng </button>
							{!readOnly && <button type='submit' className='btn btn-primary'> Lưu </button>}
						</div>
					</div>
				</form>
			</div>
		);
	}
}

class dmLoaiTaiSanCoDinhPage extends React.Component {
	state = { searching: false };
	searchBox = React.createRef();
	modal = React.createRef();
	componentDidMount() {
		T.ready('/user/category', () => this.searchBox.current.getPage());
	}

	getPage = (pageNumber, pageSize, pageCondition) => {
		this.setState({ searching: true });
		this.props.getDmLoaiTaiSanCoDinhPage(pageNumber, pageSize, pageCondition, (page) => {
			this.setState({ searching: false });
		});
	};

	edit = (e, item) => {
		e.preventDefault();
		this.modal.current.show(item);
	};

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('Loại tài sản cố định', 'Bạn có chắc bạn muốn xóa loại tài sản cố định này?', 'warning', true,
			(isConfirm) => isConfirm && this.props.deleteDmLoaiTaiSanCoDinh(item.ma));
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permissionWrite = currentPermissions.includes('dmLoaiTaiSanCoDinh:write'),
			permissionDelete = currentPermissions.includes('dmLoaiTaiSanCoDinh:delete'),
			permission = this.getUserPermission('dmLoaiTaiSanCoDinh', ['write', 'delete']);
		let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLoaiTaiSanCoDinh && this.props.dmLoaiTaiSanCoDinh.page ? this.props.dmLoaiTaiSanCoDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
		let table = 'Không có dữ liệu!';
		if (list && list.length > 0) {
			table = renderTable({
				getDataSource: () => list, stickyHead: false,
				renderHead: () => (
					<tr>
						<th style={{ width: 'auto', textAlign: 'center' }}>#</th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Mã </th>
						<th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}> Tên </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Đơn vị tính </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>	Mã tài khoản </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>	Mã nhóm	</th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Mã hiệu </th>
						<th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'> Thao tác </th>
					</tr>),
				renderRow: (item, index) => (
					<tr key={index}>
						<TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
						<TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={(e) => this.edit(e, item)} />
						<TableCell type='text' content={item.ten} />
						<TableCell type='text' content={item.donViTinh ? item.donViTinh : ''} />
						<TableCell type='text' content={item.maTaiKhoan ? item.maTaiKhoan : ''} />
						<TableCell type='text' content={item.maNhom ? item.maNhom : ''} />
						<TableCell type='text' content={item.maHieu ? item.maHieu : ''} />
						<TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
						<TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
					</tr>
				),
			});
		}

		return (
			<main className='app-content'>
				<div className='app-title'>
					<h1>
						<i className='fa fa-list-alt' /> Danh mục Loại tài sản cố định
					</h1>
					<AdminSearchBox ref={this.searchBox} getPage={this.props.getDmLoaiTaiSanCoDinhPage} setSearching={(value) => this.setState({ searching: value })} />
					<ul className='app-breadcrumb breadcrumb'>
						<Link to='/user'> <i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
						<Link to='/user/category'>Danh mục</Link>&nbsp;/&nbsp;
						Loại tài sản cố định
					</ul>
				</div>
				<div className='tile'>
					{!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
					<Pagination name='dmLuongCoSoPage' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.getPage} />
					<EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmLoaiTaiSanCoDinh} update={this.props.updateDmLoaiTaiSanCoDinh} />
					{permissionWrite && (
						<button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
							<i className='fa fa-lg fa-plus' />
						</button>)}
					<Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
						<i className='fa fa-lg fa-reply' />
					</Link>
				</div>
			</main>
		);
	}
}

const mapStateToProps = (state) => ({ system: state.system, dmLoaiTaiSanCoDinh: state.dmLoaiTaiSanCoDinh });
const mapActionsToProps = { getDmLoaiTaiSanCoDinhPage, createDmLoaiTaiSanCoDinh, updateDmLoaiTaiSanCoDinh, deleteDmLoaiTaiSanCoDinh };
export default connect(mapStateToProps, mapActionsToProps)(dmLoaiTaiSanCoDinhPage);
