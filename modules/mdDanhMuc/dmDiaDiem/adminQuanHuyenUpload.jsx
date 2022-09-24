import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHuyenAll, getDmQuanHuyenPage, deleteDmQuanHuyen, createDmQuanHuyen, updateDmQuanHuyen, createDmQuanHuyenByUpload } from './reduxQuanHuyen';
import { getDMTinhThanhPhoAll } from './reduxTinhThanhPho';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';

class EditModal extends React.Component {
	state = { kichHoat: 1, item: {} };
	modal = React.createRef();
	editorVi = React.createRef();
	editorEn = React.createRef();

	componentDidMount() {
		$(document).ready(() => setTimeout(() => {
			$(this.modal.current).on('shown.bs.modal', () => $('#maQuanHuyen').focus());
		}, 250));
	}

	show = (item) => {
		let { maQuanHuyen, maTinhThanhPho, tenQuanHuyen, kichHoat } = item ? item : { maQuanHuyen: '', maTinhThanhPho: '', tenQuanHuyen: '', kichHoat: 1 };
		const listTinhThanhPhoModal = this.props.dmTinhThanhPho && this.props.dmTinhThanhPho.items ?
			this.props.dmTinhThanhPho.items.map(item => ({
				id: item.ma,
				text: item.ten
			})) : [];
		$('#maTinhThanhPho').select2({
			placeholder: 'Chọn tỉnh thành phố',
			data: listTinhThanhPhoModal
		}).val(maTinhThanhPho ? maTinhThanhPho : '').trigger('change');

		$('#maQuanHuyen').val(maQuanHuyen ? maQuanHuyen : '');
		$('#tenQuanHuyen').val(tenQuanHuyen ? tenQuanHuyen : '');

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
			this.props.dataChanges({ changes, maQuanHuyen });
			$(this.modal.current).modal('hide');
		}
	}

	render() {
		const readOnly = this.props.readOnly;
		let listTinhThanhPho = this.props.dmTinhThanhPho && this.props.dmTinhThanhPho.items ? this.props.dmTinhThanhPho : [];
		if (typeof listTinhThanhPho == 'object') listTinhThanhPho = Object.values(listTinhThanhPho);
		const listTinhThanhPhoOption = listTinhThanhPho.map(item => <option key={item.ma} value={item.ma}>{item.ten}</option>);

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
								<label htmlFor='maTinhThanhPho'>Tên tỉnh/thành </label>
								<select className='form-control' id='maTinhThanhPho'>{listTinhThanhPhoOption}</select>

							</div>
							<div className='form-group'>
								<label htmlFor='dmKinhPhiNuocNgoaiGhiChu'>Tên quận/huyện</label>
								<input className='form-control' id='tenQuanHuyen' type='text' placeholder='Tên quận huyện' readOnly={readOnly} />
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

class DmQuanHuyenUploadPage extends React.Component {
	modal = React.createRef();
	uploadDmQuanHuyenModal = React.createRef();
	state = { uploadSuccess: false, quanHuyen: [], allTinhThanhPho: [], errorRecords: [], numberOfQuanHuyen: '' }

	componentDidMount() {
		this.props.getDmQuanHuyenPage();
		this.props.getDMTinhThanhPhoAll();
		this.props.getDmQuanHuyenAll();
		T.ready('/user/category');
	}

	edit = (e, item) => {
		e.preventDefault();
		this.modal.current.show(item);
	};

	changeActive = item => {
		this.setState(state => {
			state.quanHuyen.forEach(data => {
				if (data.maQuanHuyen == item.maQuanHuyen) {
					data.kichHoat = Number(!data.kichHoat);
				}
			});
			return state;
		});
	};
	delete = (e, item) => {
		e.preventDefault();
		let indexDelete;
		T.confirm('Xóa danh mục quận huyện', 'Bạn có chắc bạn muốn xóa danh mục quận huyện này?', true, isConfirm =>
			isConfirm && this.setState(state => {
				state.quanHuyen.forEach((data, index) => {
					if (data.maQuanHuyen == item.maQuanHuyen) {
						indexDelete = index;
					}
				});
				state.quanHuyen.splice(indexDelete, 1);
				return state;
			}));
	};

	updateTableData = (dataEditModal) => {
		this.setState((state,) => {
			this.state.allTinhThanhPho.forEach(tinhThanhPho => {
				if (tinhThanhPho.ma == dataEditModal.changes.maTinhThanhPho) {
					dataEditModal.changes.maTinhThanhPho = tinhThanhPho.ma;
				}
			});
			state.quanHuyen.forEach(data => {
				if (data.maQuanHuyen == dataEditModal.maQuanHuyen) {
					data.maTinhThanhPho = dataEditModal.changes.maTinhThanhPho;
					data.tenQuanHuyen = dataEditModal.changes.tenQuanHuyen;
					data.kichHoat = dataEditModal.changes.kichHoat;
				}
			});
			return state;
		});
	};

	onSuccess = (data) => {
		this.setState({
			uploadSuccess: true,
			quanHuyen: data.quanHuyen,
			allTinhThanhPho: data.allTinhThanhPho,
			numberOfQuanHuyen: data.number
		});
	};

	saveUpload = () => {
		let dataImport = this.state.quanHuyen;
		if (dataImport && dataImport.length > 0) {
			this.props.createDmQuanHuyenByUpload(dataImport, () => this.props.history.push('/user/danh-muc/quan-huyen'));
		}
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permissionWrite = currentPermissions.includes('dmQuanHuyen:write'),
			permissionDelete = currentPermissions.includes('dmQuanHuyen:delete');
		// permissionUpload = currentPermissions.includes('dmQuanHuyen:upload');

		const pageNumber = 1, pageSize = 50, totalItem = this.state.numberOfPhuongXa, pageTotal = totalItem / pageSize;
		let table = null;
		let listTinhThanhPho = this.props.dmTinhThanhPho && this.props.dmTinhThanhPho.items ? this.props.dmTinhThanhPho.items : [];
		if (typeof listTinhThanhPho == 'object') listTinhThanhPho = Object.values(listTinhThanhPho);
		if (this.state.quanHuyen && this.state.quanHuyen.length > 0) {
			table = (
				<table className='table table-hover table-bordered'>
					<thead>
						<tr>
							<th style={{ width: 'auto', textAlign: 'center' }}>#</th>
							<th style={{ width: 'auto' }}>Mã</th>
							<th style={{ width: '50%' }}>Tên quận/huyện</th>
							<th style={{ width: '50%' }}>Tỉnh/thành phố</th>
							<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
							<th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						{this.state.quanHuyen.map((item, index) => (
							<tr key={index}>
								<td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
								<td>
									<a href='#' onClick={e => this.edit(e, item)}>{item.maQuanHuyen}</a>
								</td>
								<td>{item.tenQuanHuyen}</td>
								<td>{listTinhThanhPho.find(e => e.ma == item.maTinhThanhPho) ? listTinhThanhPho.find(e => e.ma == item.maTinhThanhPho).ten : ''}</td>

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
					<h1><i className='fa fa-list-alt' /> Danh mục Quận Huyện: Upload</h1>
				</div>
				<div style={{ marginTop: '2%' }} className='row tile'>
					<FileBox ref={this.fileBox} postUrl='/api/danh-muc/quan-huyen/upload' uploadType='QuanHuyenFile'
						userData='quanHuyenImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
						success={this.onSuccess} ajax={true} />
				</div>
				{table ? <div style={{ marginTop: '2%' }} className='row tile'>{table}</div> : null}
				<EditModal ref={this.modal} readOnly={!permissionWrite}
					createDmQuanHuyen={this.props.createDmQuanHuyen}
					updateDmQuanHuyen={this.props.updateDmQuanHuyen}
					dmTinhThanhPho={this.props.dmTinhThanhPho}
					postUrl='/api/danh-muc/quan-huyen/upload'
					uploadType='QuanHuyenFile'
					dataChanges={this.updateTableData}
				/>
				<Link to='/user/danh-muc/quan-huyen' className='btn btn-secondary btn-circle' style={{ position: 'fixed', left: '10px', bottom: '10px' }}>
					<i className='fa fa-lg fa-reply' />
				</Link>
				<Pagination name='pageDmQuanHuyen' style={{ marginLeft: '70px', marginBottom: '5px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
					getPage={this.props.getDmQuanHuyenPage} />

				{permissionWrite &&
					<div>
						<a href='/download/dmQuanHuyen.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
							<i className='fa fa-download' />
						</a>
						<button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.saveUpload}>
							<i className='fa fa-lg fa-save' />
						</button>
					</div>}
				<Link to='/user/danh-muc/quan-huyen' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
					<i className='fa fa-lg fa-reply' />
				</Link>
			</main>
		);
	}
}

const mapStateToProps = state => ({ system: state.system, dmQuanHuyen: state.danhMuc.dmQuanHuyen, dmTinhThanhPho: state.danhMuc.dmTinhThanhPho });
const mapActionsToProps = { getDmQuanHuyenAll, getDmQuanHuyenPage, getDMTinhThanhPhoAll, deleteDmQuanHuyen, createDmQuanHuyen, updateDmQuanHuyen, createDmQuanHuyenByUpload };
export default connect(mapStateToProps, mapActionsToProps)(DmQuanHuyenUploadPage);