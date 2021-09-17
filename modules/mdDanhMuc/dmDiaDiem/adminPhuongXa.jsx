import React from 'react';
import { connect } from 'react-redux';
import { getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa } from './reduxPhuongXa';
import { getDMTinhThanhPhoAll } from './reduxTinhThanhPho';
import { getDmQuanHuyenAll } from './reduxQuanHuyen';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
	state = { kichHoat: 1 };
	componentDidMount() {
		$(document).ready(() => this.onShown(() => {
            !this.maPhuongXa.value() ? this.maPhuongXa.focus() : this.tenPhuongXa.focus();
        }));
		// this.maTinhThanhPho.select2({ minimumResultsForSearch: -1 });
		// this.maQuanHuyen.select2({ minimumResultsForSearch: -1 });
	}

	onShow = (item) => {
		let { maPhuongXa, maQuanHuyen, maTinhThanhPho, tenPhuongXa, kichHoat } = item ? item : { maPhuongXa: '', maQuanHuyen: '', maTinhThanhPho: '', tenPhuongXa: '', kichHoat: 1 };
		this.maPhuongXa.value(maPhuongXa);
		this.tenPhuongXa.value(tenPhuongXa);
		this.maTinhThanhPho.value(maTinhThanhPho);
		this.maQuanHuyen.value(maQuanHuyen);
		this.setState({ kichHoat });
	};

	changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

	onSubmit = (e) => {
		e.preventDefault();
		const 
			changes = {
				maPhuongXa: this.maPhuongXa.value(),
				maQuanHuyen: this.maQuanHuyen.value(),
				tenPhuongXa: this.maPhuongXa.value(),
				kichHoat: this.state.kichHoat,
			};
		if (this.maPhuongXa.value() == '') {
			T.notify('Mã phường xã bị trống!', 'danger');
			this.maPhuongXa.focus();
		} else if (this.maQuanHuyen == 'Chọn quận huyện') {
			T.notify('Tên quận huyện bị trống!', 'danger');
			this.maQuanHuyen.focus();
		} else if (this.tenPhuongXa.val() == '') {
			T.notify('Tên phường xã bị trống!', 'danger');
			this.tenPhuongXa.focus();
		} else {
			this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
		}
	};

	render = () => { 
		const readOnly = this.props.readOnly;
		return this.renderModal({
			title: this.state.maPhuongXa ? 'Cập nhật phường xã' : 'Tạo mới phường xã',
			body: <div className='row'>
				<FormTextBox className='col-md-12' lable='Mã phường/xã' ref={e => this.maPhuongXa = e} readOnly={this.state.maPhuongXa ? true : readOnly} placeholder='Mã phường xã' required />
				<FormSelect className='col-md-12' label='Tên tỉnh thành' ref={e => this.maTinhThanhPho =  e} data={this.props.tinhOptions} required /> 
				<FormSelect className='col-md-12' label='Tên quận huyện' ref={e => this.maQuanHuyen = e} data={this.maTinhThanhPho ? this.props.quanHuyenOptions : []} required /> 
				<FormTextBox className='col-md-12' label='Tên phường/xã' ref={e => this.tenPhuongXa = e} readOnly={readOnly} placeholder='Tên phường xã' required />
				<FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
			</div>
		});
	}
}

class DmPhuongXaPage extends AdminPage {
	state = { searching: false };
	tinhMapper = null;
	tinhOptions = [];
	quanHuyenMapper = null;
	quanHuyenOptions = [];

	componentDidMount() {
		this.props.getDmQuanHuyenAll(items => {
			if (items) {
				const mapper = {};
				items.forEach(item => {
					mapper[item.maQuanHuyen] = item.tenQuanHuyen;
					if (item.kichHoat == 1) this.quanHuyenOptions.push({ id: item.maQuanHuyen, text: item.tenQuanHuyen, maTinhThanhPho: item.maTinhThanhPho });
				});
				this.quanHuyenMapper = mapper;
			}
		});

		this.props.getDMTinhThanhPhoAll(items => {
			if (items) {
				const mapper = {};
				items.forEach(item => {
					mapper[item.ma] = item.ten;
					if (item.kichHoat == 1) this.tinhOptions.push({ id: item.ma, text: item.ten, maQuanHuyen: item.maQuanHuyen });
				});
				this.tinhMapper = mapper;
			}
		});

		T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmPhuongXaPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmPhuongXaPage();
        });
	}

	showModal = (e) => {
		e.preventDefault();
		this.modal.show();
	};

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('Xóa danh mục phường/xã', 'Bạn có chắc bạn muốn xóa danh mục phường/xã này?', true, isConfirm =>
			isConfirm && this.props.deleteDmPhuongXa(item.maPhuongXa));
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
		const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmPhuongXa && this.props.dmPhuongXa.page ?
			this.props.dmPhuongXa.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
		let table = 'Không có thông tin phường/xã!';
		if (list && list.length > 0 && this.quanHuyenMapper) {
			table = renderTable({
				getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã phường/xã</th>
						<th style={{ width: '100%' }} nowrap='true'>Tên phường/xã</th>
						<th style={{ width: 'auto' }} nowrap='true'>Tên quận/huyện</th>
						<th style={{ width: 'auto' }} nowrap='true'>Tên tỉnh/thành phố</th>
						<th style={{ width: 'auto' }} nowrap='true' >Kích hoạt</th>
						<th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.maPhuongXa} />
                        <TableCell type='link' content={item.tenPhuongXa} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={this.quanHuyenMapper[item.maQuanHuyen] ? this.quanHuyenMapper[item.maQuanHuyen] : ''} />
                        <TableCell type='text' content={this.tinhMapper[this.quanHuyenOptions.filter(e => e.id == item.maQuanHuyen)[0].maTinhThanhPho]} />
						<TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChucVu(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
			});
		}
		return this.renderPage({
			icon: 'fa fa-list-alt',
            title: 'Danh mục Phường xã',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Phường xã'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmPhuongXaPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmPhuongXa} update={this.props.updateDmPhuongXa} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/phuong-xa/upload') : null
		});
	}
}

const mapStateToProps = state => ({ system: state.system, dmPhuongXa: state.dmPhuongXa });
const mapActionsToProps = { getDMTinhThanhPhoAll, getDmQuanHuyenAll, getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa };
export default connect(mapStateToProps, mapActionsToProps)(DmPhuongXaPage);