import React from 'react';
import { connect } from 'react-redux';
import { getDmLoaiTaiSanCoDinhPage, createDmLoaiTaiSanCoDinh, updateDmLoaiTaiSanCoDinh, deleteDmLoaiTaiSanCoDinh } from './redux';
import { getDmDonViTinhAll } from 'modules/mdDanhMuc/dmDonViTinh/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';

class EditModal extends AdminModal {
	donViTable = [];

	componentDidMount() {
		$(document).ready(() => this.onShown(() => {
			!this.ma.value() ? this.ma.focus() : this.ten.focus();
		}));
		this.props.getDataSelect(items => {
			if (items) {
				this.donViTable = [];
				items.forEach(item => this.donViTable.push({ 'id': item.ma, 'text': item.ten }));
			}
		});
	}

	onShow = (item) => {
		let { ma, ten, maNhom, maTaiKhoan, maHieu, donViTinh } = item ? item : { ma: '', ten: '', maNhom: '', maTaiKhoan: '', maHieu: '', donViTinh: '' };

		this.setState({ ma, item });
		this.ma.value(ma);
		this.ten.value(ten);
		this.donViTinh.value(donViTinh.toString() ? donViTinh.toString() : '');
		this.maNhom.value(maNhom.toString() ? maNhom.toString() : '');
		this.maTaiKhoan.value(maTaiKhoan.toString() ? maTaiKhoan.toString() : '');
		this.maHieu.value(maHieu.toString() ? maHieu.toString() : '');
	};

	changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

	onSubmit = (e) => {
		e.preventDefault();
		const changes = {
			ma: this.ma.value(),
			ten: this.ten.value(),
			donViTinh: this.donViTinh.value(),
			maNhom: this.maNhom.value(),
			maTaiKhoan: this.maTaiKhoan.value(),
			maHieu: this.maHieu.value(),
		};

		if (!this.state.ma && !this.ma.value()) {
			T.notify('Mã không được trống!', 'danger');
			this.ma.focus();
		} else if (!changes.ten) {
			T.notify('Tên không được trống!', 'danger');
			this.ten.focus();
		} else {
			this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
		}
	};

	render = () => {
		const readOnly = this.props.readOnly;
		return this.renderModal({
			title: this.state.ma ? 'Cập nhật loại tài sản cố định' : 'Tạo mới loại tài sản cố định',
			size: 'large',
			body: <div className='row'>
				<FormTextBox type='text' className='col-12 col-md-6' ref={e => this.ma = e} label='Mã loại tài sản cố định' readOnly={this.state.ma ? true : readOnly} placeholder='Mã loại tài sản cố định' required />
				<FormTextBox type='text' className='col-12 col-md-6' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
				<FormSelect className='col-12 col-md-6' ref={e => this.donViTinh = e} label='Đơn vị tính' data={this.donViTable} />
				<FormTextBox type='text' className='col-12 col-md-6' ref={e => this.maNhom = e} label='Mã nhóm' readOnly={readOnly} placeholder='Mã nhóm' />
				<FormTextBox type='text' className='col-12 col-md-6' ref={e => this.maTaiKhoan = e} label='Mã tài khoản' readOnly={readOnly} placeholder='Mã tài khoản' />
				<FormTextBox type='text' className='col-12 col-md-6' ref={e => this.maHieu = e} label='Mã hiệu' readOnly={readOnly} placeholder='Mã hiệu' />
			</div>
		});


	}
}

class dmLoaiTaiSanCoDinhPage extends AdminPage {
	state = { searching: false };
	donViTinhMapper = {};

	componentDidMount() {
		this.props.getDmDonViTinhAll(items => {
			if (items) {
				this.donViTinhMapper = {};
				items.forEach(item => this.donViTinhMapper[item.ma] = item.ten);
			}
		});
		T.ready('/user/category', () => {
			T.onSearch = (searchText) => this.props.getDmLoaiTaiSanCoDinhPage(undefined, undefined, searchText || '');
			T.showSearchBox();
			this.props.getDmLoaiTaiSanCoDinhPage();
		});

	}

	showModal = (e) => {
		e.preventDefault();
		this.modal.show();
	}

	delete = (e, item) => {
		T.confirm('Xóa Loại tài sản cố định', `Bạn có chắc bạn muốn xóa Loại tài sản cố định ${item.ten ? `<b>${item.ten}</b>` : 'này'}?`, 'warning', true, isConfirm => {
			isConfirm && this.props.deleteDmLoaiTaiSanCoDinh(item.ma, error => {
				if (error) T.notify(error.message ? error.message : `Xoá Loại tài sản cố định ${item.ten} bị lỗi!`, 'danger');
				else T.alert(`Xoá Loại tài sản cố định ${item.ten} thành công!`, 'success', false, 800);
			});
		});
		e.preventDefault();
	}

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permission = this.getUserPermission('dmLoaiTaiSanCoDinh', ['write', 'delete']);
		let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmLoaiTaiSanCoDinh && this.props.dmLoaiTaiSanCoDinh.page ? this.props.dmLoaiTaiSanCoDinh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
		const table = !(list && list.length > 0) ? 'Không có dữ liệu Loại tài sản cố định' :
			renderTable({
				getDataSource: () => list, stickyHead: false,
				renderHead: () => (
					<tr>
						<th style={{ width: 'auto', textAlign: 'center' }}>#</th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Mã </th>
						<th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}> Tên </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Đơn vị tính </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã tài khoản </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Mã nhóm</th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Mã hiệu </th>
						<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}> Thao tác </th>
					</tr>),
				renderRow: (item, index) => (
					<tr key={index}>
						<TableCell type='text' content={(pageNumber - 1) * pageSize + index + 1} style={{ textAlign: 'right' }} />
						<TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={() => this.modal.show(item)} />
						<TableCell type='text' content={item.ten} />
						<TableCell type='text' content={this.donViTinhMapper && this.donViTinhMapper[item.donViTinh] ? this.donViTinhMapper[item.donViTinh] : ''} />
						<TableCell type='text' content={item.maTaiKhoan ? item.maTaiKhoan : ''} />
						<TableCell type='text' content={item.maNhom ? item.maNhom : ''} />
						<TableCell type='text' content={item.maHieu ? item.maHieu : ''} />
						<TableCell type='buttons' content={item} permission={permission}
							onEdit={() => this.modal.show(item)} onDelete={this.delete} />
					</tr>
				),
			});

		return this.renderPage({
			icon: 'fa fa-list-alt',
			title: 'Loại tài sản cố định',
			breadcrumb: [
				<Link key={0} to='/user/category'>Danh mục</Link>,
				'Loại tài sản cố định'
			],
			content: <>
				<div className='tile'>{table}</div>
				<Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmLoaiTaiSanCoDinhPage} />
				<EditModal ref={e => this.modal = e} permission={permission} getDataSelect={this.props.getDmDonViTinhAll}
					create={this.props.createDmLoaiTaiSanCoDinh} update={this.props.updateDmLoaiTaiSanCoDinh} permissions={currentPermissions} />
			</>,
			backRoute: '/user/category',
			onCreate: permission && permission.write ? (e) => this.showModal(e) : null
		});
	}
}

const mapStateToProps = (state) => ({ system: state.system, dmLoaiTaiSanCoDinh: state.danhMuc.dmLoaiTaiSanCoDinh, dmDonViTinh: state.danhMuc.dmDonViTinh });
const mapActionsToProps = { getDmLoaiTaiSanCoDinhPage, createDmLoaiTaiSanCoDinh, updateDmLoaiTaiSanCoDinh, deleteDmLoaiTaiSanCoDinh, getDmDonViTinhAll };
export default connect(mapStateToProps, mapActionsToProps)(dmLoaiTaiSanCoDinhPage);
