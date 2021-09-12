import React from 'react';
import { connect } from 'react-redux';
import { getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa } from './reduxPhuongXa';
import { getDMTinhThanhPhoAll } from './reduxTinhThanhPho';
import { getDmQuanHuyenAll } from './reduxQuanHuyen';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
	state = { kichHoat: 1 };
	modal = React.createRef();

	componentDidMount() {
		$(document).ready(() => setTimeout(() => {
			$(this.modal.current).on('shown.bs.modal', () => $('#maPhuongXa').focus());
		}, 250));
		$('#maTinhThanhPho').select2({ minimumResultsForSearch: -1 });
		$('#maQuanHuyen').select2({ minimumResultsForSearch: -1 });
	}

	show = (item) => {
		let { maPhuongXa, maQuanHuyen, tenPhuongXa, kichHoat } = item ? item : { maPhuongXa: '', maQuanHuyen: '', tenPhuongXa: '', kichHoat: 1 };
		$('#maPhuongXa').val(maPhuongXa);
		$('#tenPhuongXa').val(tenPhuongXa);

		$('#maTinhThanhPho').select2({
			placeholder: 'Chọn tỉnh thành phố',
			data: this.props.tinhOptions
		}).val(item ? this.props.quanHuyenOptions.filter(e => e.id == maQuanHuyen)[0].maTinhThanhPho : '').trigger('change');

		$('#maQuanHuyen').select2({
			placeholder: 'Chọn quận huyện',
			data: item ? this.props.quanHuyenOptions.filter(e => e.maTinhThanhPho == this.props.quanHuyenOptions.filter(e => e.id == maQuanHuyen)[0].maTinhThanhPho) : []
		}).val(maQuanHuyen).trigger('change');

		$('#maTinhThanhPho').on('select2:select', (e) => {
			let selectedData = e.params.data;
			$('#maQuanHuyen').empty();
			const quanHuyenOptionsByTinh = this.props.quanHuyenOptions.filter(item => item.maTinhThanhPho === selectedData.id);
			$('#maQuanHuyen').select2({
				placeholder: 'Chọn quận huyện',
				data: quanHuyenOptionsByTinh
			}).val('').trigger('change');
		});
		this.setState({ kichHoat });
		$(this.modal.current).attr('data-id', maPhuongXa).modal('show');
	};

	hide = () => $(this.modal.current).modal('hide');

	save = (e) => {
		e.preventDefault();
		const maPhuongXa = $(this.modal.current).attr('data-id'),
			changes = {
				maPhuongXa: $('#maPhuongXa').val(),
				maQuanHuyen: $('#maQuanHuyen').val(),
				tenPhuongXa: $('#tenPhuongXa').val(),
				kichHoat: this.state.kichHoat,
			};
		if ($('#maPhuongXa').val() == '') {
			T.notify('Mã phường xã bị trống!', 'danger');
			$('#maPhuongXa').focus();
		} else if ($('#select2-maQuanHuyen-container').text() == 'Chọn quận huyện') {
			T.notify('Tên quận huyện bị trống!', 'danger');
			$('#maQuanHuyen').focus();
		} else if ($('#tenPhuongXa').val() == '') {
			T.notify('Tên phường xã bị trống!', 'danger');
			$('#tenPhuongXa').focus();
		} else {
			if (maPhuongXa) {
				this.props.updateDmPhuongXa(maPhuongXa, changes);
			} else {
				this.props.createDmPhuongXa(changes);
			}
			$(this.modal.current).modal('hide');
		}
	};

	render() {
		const readOnly = this.props.readOnly;
		return (
			<div className='modal' role='dialog' ref={this.modal}>
				<form className='modal-dialog' role='document' onSubmit={this.save}>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title'>Thông tin danh mục Phường Xã</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>

						<div className='modal-body'>
							<div className='form-group'>
								<label htmlFor='maQuanHuyen'>Mã phường/xã</label>
								<input className='form-control' id='maPhuongXa' type='text' placeholder='Mã phường xã' maxLength={5} readOnly={readOnly} />
							</div>
							<div className='form-group'>
								<label htmlFor='maTinhThanhPho'>Tên tỉnh/thành </label>
								<select className='form-control' id='maTinhThanhPho'></select>
							</div>
							<div className='form-group'>
								<label htmlFor='maQuanHuyen'>Tên quận/huyện</label>
								<select className='form-control' id='maQuanHuyen' ></select>
							</div>
							<div className='form-group'>
								<label htmlFor='tenPhuongXa'>Tên phường/xã</label>
								<input className='form-control' id='tenPhuongXa' type='text' placeholder='Tên phường xã' readOnly={readOnly} />
							</div>
							<div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
								<label htmlFor='dmPhuongXaActive'>Kích hoạt: </label>&nbsp;&nbsp;
								<div className='toggle'>
									<label>
										<input type='checkbox' id='dmPhuongXaActive' checked={this.state.kichHoat}
											onChange={() => !readOnly && this.setState({ kichHoat: Number(!this.state.kichHoat) })} />
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
		);
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