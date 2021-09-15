import React from 'react';
import { connect } from 'react-redux';
import { getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa } from './reduxPhuongXa';
import { getDMTinhThanhPhoAll } from './reduxTinhThanhPho';
import { getDmQuanHuyenAll } from './reduxQuanHuyen';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input'
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
				<FormSelect className='col-md-12' label='Tên quận huyện' ref={e => this.maQuanHuyen = e} data={this.maTinhThanhPho ? this.props.quanHuyenOptions.filter(e => e.maTinhThanhPho == this.props.quanHuyenOptions.filter(e => e.id == this.maQuanHuyen)[0].maTinhThanhPho) : []} required /> 
				<FormTextBox className='col-md-12' label='Tên phường/xã' ref={e => this.tenPhuongXa = e} readOnly={readOnly} placeholder='Tên phường xã' required />
				<FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
			</div>
		});
	}
}

class DmPhuongXaPage extends React.Component {
	state = { searching: false };
	searchBox = React.createRef();
	modal = React.createRef();
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

		T.ready('/user/category', () => this.searchBox.current.getPage());
	}

	edit = (e, item) => {
		e.preventDefault();
		this.modal.current.show(item);
	};

	changeActive = item => this.props.updateDmPhuongXa(item.maPhuongXa, { kichHoat: Number(!item.kichHoat) });

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('Xóa danh mục phường/xã', 'Bạn có chắc bạn muốn xóa danh mục phường/xã này?', true, isConfirm =>
			isConfirm && this.props.deleteDmPhuongXa(item.maPhuongXa));
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permissionWrite = currentPermissions.includes('dmPhuongXa:write'),
			permissionDelete = currentPermissions.includes('dmPhuongXa:delete'),
			permissionUpload = currentPermissions.includes('dmPhuongXa:upload');
		const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmPhuongXa && this.props.dmPhuongXa.page ?
			this.props.dmPhuongXa.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
		let table = 'Không có thông tin phường/xã!';
		if (list && list.length > 0 && this.quanHuyenMapper) {
			table = (
				<table className='table table-hover table-bordered'>
					<thead>
						<tr>
							<th style={{ width: 'auto' }} nowrap='true'>Mã phường/xã</th>
							<th style={{ width: '100%' }} nowrap='true'>Tên phường/xã</th>
							<th style={{ width: 'auto' }} nowrap='true'>Tên quận/huyện</th>
							<th style={{ width: 'auto' }} nowrap='true'>Tên tỉnh/thành phố</th>
							<th style={{ width: 'auto' }} nowrap='true' >Kích hoạt</th>
							<th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{list.map((item, index) => (
							<tr key={index}>
								<td>{item.maPhuongXa}</td>
								<td><a href='#' onClick={e => this.edit(e, item)}>{item.tenPhuongXa}</a></td>
								<td style={{ whiteSpace: 'nowrap' }}>{this.quanHuyenMapper[item.maQuanHuyen] ? this.quanHuyenMapper[item.maQuanHuyen] : ''}</td>
								<td style={{ whiteSpace: 'nowrap' }}>{this.tinhMapper[this.quanHuyenOptions.filter(e => e.id == item.maQuanHuyen)[0].maTinhThanhPho]}</td>
								<td className='toggle' style={{ textAlign: 'center' }}>
									<label>
										<input type='checkbox' checked={item.kichHoat == '1' ? true : false}
											onChange={() => permissionWrite && this.changeActive(item)} />
										<span className='button-indecator' />
									</label>
								</td>
								<td style={{ textAlign: 'center' }}>
									<div className='btn-group'>
										<a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
											<i className='fa fa-lg fa-edit' />
										</a>
										{permissionDelete &&
											<a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
												<i className='fa fa-trash-o fa-lg' />
											</a>}
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
					<h1><i className='fa fa-list-alt' /> Danh mục Phường Xã</h1>
					<AdminSearchBox ref={this.searchBox} getPage={this.props.getDmPhuongXaPage} setSearching={value => this.setState({ searching: value })} />
					<ul className='app-breadcrumb breadcrumb'>
						<Link to='/user'><i className='fa fa-home fa-lg' /></Link>
						&nbsp;/&nbsp;
						<Link to='/user/category'>Danh mục</Link>
						&nbsp;/&nbsp;Phường xã
					</ul>
				</div>
				<div className='tile'>
					{!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
					<EditModal ref={this.modal} readOnly={!permissionWrite} tinhOptions={this.tinhOptions} quanHuyenOptions={this.quanHuyenOptions}
						createDmPhuongXa={this.props.createDmPhuongXa} updateDmPhuongXa={this.props.updateDmPhuongXa} />
					<Pagination name='pageDmPhuongXa' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
						getPage={this.searchBox.current && this.searchBox.current.getPage} />
					{permissionUpload &&
						<Link to='/user/danh-muc/phuong-xa/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
							<i className='fa fa-lg fa-cloud-upload' />
						</Link>}
					{permissionWrite &&
						<button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
							<i className='fa fa-lg fa-plus' />
						</button>}
					<Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
						<i className='fa fa-lg fa-reply' />
					</Link>
				</div>
			</main>
		);
	}
}

const mapStateToProps = state => ({ system: state.system, dmPhuongXa: state.dmPhuongXa });
const mapActionsToProps = { getDMTinhThanhPhoAll, getDmQuanHuyenAll, getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa };
export default connect(mapStateToProps, mapActionsToProps)(DmPhuongXaPage);