import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHuyenAll, getDmQuanHuyenPage, deleteDmQuanHuyen, createDmQuanHuyen, updateDmQuanHuyen } from './reduxQuanHuyen';
import { getDMTinhThanhPhoAll } from './reduxTinhThanhPho';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
	state = { kichHoat: 1 };
	modal = React.createRef();

	componentDidMount() {
		$(document).ready(() => setTimeout(() => {
			$(this.modal.current).on('shown.bs.modal', () => $('#maQuanHuyen').focus());
		}, 250));
	}

	show = (item) => {
		let { maQuanHuyen, maTinhThanhPho, tenQuanHuyen, kichHoat } = item ?
			item : { maQuanHuyen: '', maTinhThanhPho: '', tenQuanHuyen: '', kichHoat: 1 };
		$('#maQuanHuyen').val(maQuanHuyen ? maQuanHuyen : '');
		$('#tenQuanHuyen').val(tenQuanHuyen ? tenQuanHuyen : '');
		$('#maTinhThanhPho')
			.select2({ placeholder: 'Chọn tỉnh thành phố', data: this.props.tinhOptions })
			.val(maTinhThanhPho ? maTinhThanhPho : '')
			.trigger('change');
		this.setState({ kichHoat });

		$(this.modal.current).attr('data-id', maQuanHuyen).modal('show');
	};

	hide = () => $(this.modal.current).modal('hide');

	save = (e) => {
		e.preventDefault();
		const maQuanHuyen = $(this.modal.current).attr('data-id'),
			changes = {
				maQuanHuyen: $('#maQuanHuyen').val(),
				maTinhThanhPho: $('#maTinhThanhPho').val(),
				tenQuanHuyen: $('#tenQuanHuyen').val(),
				kichHoat: this.state.kichHoat,
			};
		if (changes.maTinhThanhPho == '') {
			T.notify('Mã tỉnh thành phố bị trống!', 'danger');
			$('#maTinhThanhPho').focus();
		} else if (changes.tenQuanHuyen == null) {
			T.notify('Tên quận huyện bị trống!', 'danger');
			$('#tenQuanHuyen').focus();
		} else {
			if (maQuanHuyen) {
				this.props.updateDmQuanHuyen(maQuanHuyen, changes);
			} else {
				this.props.createDmQuanHuyen(changes);
			}
			$(this.modal.current).modal('hide');
		}
	}

	render() {
		const readOnly = this.props.readOnly;
		return (
			<div className='modal' role='dialog' ref={this.modal}>
				<form className='modal-dialog' role='document' onSubmit={this.save}>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title'>Thông tin danh mục Quận Huyện</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>
							<div className='form-group'>
								<label htmlFor='maQuanHuyen'>Mã quận/huyện</label>
								<input className='form-control' id='maQuanHuyen' type='text' placeholder='Mã quận huyện' maxLength={3} readOnly={readOnly} />
							</div>
							<div className='form-group'>
								<label htmlFor='dmKinhPhiNuocNgoaiGhiChu'>Tên quận/huyện</label>
								<input className='form-control' id='tenQuanHuyen' type='text' placeholder='Tên quận huyện' readOnly={readOnly} />
							</div>
							<div className='form-group'>
								<label htmlFor='maTinhThanhPho'>Tên tỉnh/thành </label>
								<select className='form-control' id='maTinhThanhPho'></select>
							</div>
							<div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
								<label htmlFor='dmQuanHuyenActive'>Kích hoạt: </label>&nbsp;&nbsp;
								<div className='toggle'>
									<label>
										<input type='checkbox' id='dmQuanHuyenActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: Number(!this.state.kichHoat) })} />
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

class DmQuanHuyenPage extends React.Component {
	state = { searching: false };
	searchBox = React.createRef();
	modal = React.createRef();
	tinhMapper = null;
	tinhOptions = [];

	componentDidMount() {
		this.props.getDMTinhThanhPhoAll(items => {
			if (items) {
				const mapper = {};
				items.forEach(item => {
					mapper[item.ma] = item.ten;
					if (item.kichHoat == 1) this.tinhOptions.push({ id: item.ma, text: item.ten });
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

	changeActive = item => this.props.updateDmQuanHuyen(item.maQuanHuyen, { kichHoat: Number(!item.kichHoat) });

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('Xóa danh mục quận/huyện', 'Bạn có chắc bạn muốn xóa danh mục quận/huyện này?', true, isConfirm =>
			isConfirm && this.props.deleteDmQuanHuyen(item.maQuanHuyen));
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permissionWrite = currentPermissions.includes('dmQuanHuyen:write'),
			permissionDelete = currentPermissions.includes('dmQuanHuyen:delete'),
			permissionUpload = currentPermissions.includes('dmQuanHuyen:upload');
		const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmQuanHuyen && this.props.dmQuanHuyen.page ?
			this.props.dmQuanHuyen.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
		let table = 'Không có thông tin quận huyện!';
		if (list && list.length > 0 && this.tinhMapper) {
			table = (
				<table className='table table-hover table-bordered'>
					<thead>
						<tr>
							<th style={{ width: 'auto' }}>Mã</th>
							<th style={{ width: '50%' }}>Tên quận/huyện</th>
							<th style={{ width: '50%' }} nowrap='true'>Tỉnh/thành phố</th>
							<th style={{ width: 'auto' }} nowrap='true' >Kích hoạt</th>
							<th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{list.map((item, index) => (
							<tr key={index}>
								<td style={{ whiteSpace: 'nowrap' }}>{item.maQuanHuyen}</td>
								<td><a href='#' onClick={e => this.edit(e, item)}>{item.tenQuanHuyen}</a></td>
								<td style={{ whiteSpace: 'nowrap' }}>{this.tinhMapper[item.maTinhThanhPho] ? this.tinhMapper[item.maTinhThanhPho] : ''}</td>

								<td className='toggle' style={{ textAlign: 'center' }}>
									<label>
										<input type='checkbox' checked={item.kichHoat == '1' ? true : false} onChange={() => permissionWrite && this.changeActive(item)} />
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
					<h1><i className='fa fa-list-alt' /> Danh mục Quận Huyện</h1>
					<AdminSearchBox ref={this.searchBox} getPage={this.props.getDmQuanHuyenPage} setSearching={value => this.setState({ searching: value })} />
					<ul className='app-breadcrumb breadcrumb'>
						<Link to='/user'><i className='fa fa-home fa-lg' /></Link>
						&nbsp;/&nbsp;
						<Link to='/user/category'>Danh mục</Link>
						&nbsp;/&nbsp;Quận huyện
					</ul>
				</div>
				<div className='tile'>
					{!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
					<EditModal ref={this.modal} readOnly={!permissionWrite} tinhOptions={this.tinhOptions}
						createDmQuanHuyen={this.props.createDmQuanHuyen} updateDmQuanHuyen={this.props.updateDmQuanHuyen} />
					<Pagination name='pageDmQuanHuyen' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
						getPage={this.searchBox.current && this.searchBox.current.getPage} />
					{permissionUpload &&
						<Link to='/user/danh-muc/quan-huyen/upload' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
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

const mapStateToProps = state => ({ system: state.system, dmQuanHuyen: state.dmQuanHuyen, dmTinhThanhPho: state.dmTinhThanhPho });
const mapActionsToProps = { getDmQuanHuyenAll, getDmQuanHuyenPage, getDMTinhThanhPhoAll, deleteDmQuanHuyen, createDmQuanHuyen, updateDmQuanHuyen };
export default connect(mapStateToProps, mapActionsToProps)(DmQuanHuyenPage);