import React from 'react';
import { connect } from 'react-redux';
import { getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa, createDmPhuongXaByUpload } from './reduxPhuongXa';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';

class DmPhuongXaUpLoadPage extends React.Component {
	modal = React.createRef();
	state = {
		uploadSuccess: false,
		phuongXa: [],
	};

	componentDidMount() {
		T.ready('/user/category');
	}

	onSuccess = (data) => {
		if (data.phuongXa.length > 0) {
			this.setState({
				uploadSuccess: true,
				phuongXa: data.phuongXa,
				message: <p className='text-center' style={{ color: 'green' }}>{data.phuongXa.length} danh mục phường/xã được tải lên thành công</p>
			});
		}
	};

	saveUpload = () => {
		let dataImport = this.state.phuongXa;
		if (dataImport && dataImport.length > 0) {
			this.props.createDmPhuongXaByUpload(dataImport, () => this.props.history.push('/user/danh-muc/phuong-xa'));
		}
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permissionWrite = currentPermissions.includes('dmPhuongXa:write'),
			permissionUpload = currentPermissions.includes('dmPhuongXa:upload');
		return (
			<main className='app-content'>
				<div className='app-title'>
					<h1><i className='fa fa-list-alt' /> Danh mục Phường Xã: Upload</h1>
				</div>
				<div style={{ marginTop: '2%' }} className='row tile'>
					<FileBox ref={this.fileBox} postUrl='/api/danh-muc/phuong-xa/upload' uploadType='PhuongXaFile'
						userData='phuongXaImportData' style={{ width: '100%', backgroundColor: '#fdfdfd' }}
						success={this.onSuccess} ajax={true}
					/>
					{this.state.message}
				</div>
				{permissionWrite && permissionUpload &&
					<div>
						<a href='/download/dmPhuongXa.xlsx' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
							<i className='fa fa-download' />
						</a>
						<button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.saveUpload}>
							<i className='fa fa-lg fa-save' />
						</button>
					</div>}
				<Link to='/user/danh-muc/phuong-xa' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
					<i className='fa fa-lg fa-reply' />
				</Link>
			</main>
		);
	}
}

const mapStateToProps = state => ({ system: state.system, dmPhuongXa: state.danhMuc.dmPhuongXa, dmQuanHuyen: state.danhMuc.dmQuanHuyen, dmTinhThanhPho: state.danhMuc.dmTinhThanhPho });
const mapActionsToProps = { getDmPhuongXaPage, deleteDmPhuongXa, createDmPhuongXa, updateDmPhuongXa, createDmPhuongXaByUpload };
export default connect(mapStateToProps, mapActionsToProps)(DmPhuongXaUpLoadPage);