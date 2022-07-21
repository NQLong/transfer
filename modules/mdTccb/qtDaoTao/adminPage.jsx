import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
	getQtDaoTaoPage, getQtDaoTaoGroupPage, updateQtDaoTao,
	deleteQtDaoTao, createQtDaoTao
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { DaoTaoModal } from './daoTaoModal';


class QtDaoTao extends AdminPage {
	checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
	state = { filter: {} };

	componentDidMount() {
		T.clearSearchBox();
		T.ready('/user/tccb', () => {
			T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
			T.showSearchBox(() => {

			});
			if (this.checked) {
				this.hienThiTheoCanBo.value(true);
				// this.props.getQtDaoTaoGroupPage();
			}
			this.changeAdvancedSearch(false, true);
		});
	}

	showModal = (e) => {
		e.preventDefault();
		this.modal.show();
	}

	changeAdvancedSearch = (isInitial = false, isReset = false) => {
		let { pageNumber, pageSize } = this.props && this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50 };
		const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
		const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
		const listDv = this.maDonVi?.value().toString() || '';
		const listShcc = this.mulCanBo?.value().toString() || '';
		const listLoaiBang = this.loaiBang?.value().toString() || '';
		const filterCookie = T.storage('pageQtDaoTao').F;
		const pageFilter = (isInitial || isReset) ? filterCookie : { listDv, fromYear, toYear, listShcc, listLoaiBang };
		this.setState({ filter: isReset ? {} : pageFilter }, () => {
			this.getPage(pageNumber, pageSize, '', () => {
				if (isInitial) {
					const filter = this.state.filter || {};
					this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
					this.fromYear?.value(filter.fromYear || '');
					this.toYear?.value(filter.toYear || '');
					this.maDonVi?.value(filter.listDv);
					this.mulCanBo?.value(filter.listShcc);
					this.loaiBang?.value(filter.listLoaiBang);
					Object.values(filterCookie).some(item => item && item != '' && item != 0) && typeof (filterCookie) !== 'string' && this.showAdvanceSearch();
				} else {
					if (isReset) {
						this.fromYear?.value('');
						this.toYear?.value('');
						this.maDonVi.value('');
						this.mulCanBo.value('');
						this.loaiBang.value('');
					}
					this.hideAdvanceSearch();

				}
			});
		});
	}

	getPage = (pageN, pageS, pageC, done) => {
		if (this.checked) this.props.getQtDaoTaoGroupPage(pageN, pageS, pageC, this.state.filter, done);
		else this.props.getQtDaoTaoPage(pageN, pageS, pageC, this.state.filter, done);
	}

	groupPage = () => {
		this.checked = !this.checked;
		T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
		this.getPage();
	}

	list = (text, i, j) => {
		if (i == 0) return [];
		let deTais = text?.split('??').map(str => <div key={i--}>{j - i}.  {str}</div>);
		return deTais;
	}

	delete = (e, item) => {
		T.confirm('Xóa quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình đào tạo này', 'warning', true, isConfirm => {
			isConfirm && this.props.deleteQtDaoTao(item.id);
		});
		e.preventDefault();
	}

	render() {
		const permission = this.getUserPermission('qtDaoTao', ['read', 'write', 'delete']);
		let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
			this.props.qtDaoTao && this.props.qtDaoTao.pageGr ?
				this.props.qtDaoTao.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
			: (this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null });
		let table = renderTable({
			emptyTable: 'Chưa có dữ liệu',
			getDataSource: () => list, stickyHead: true,
			renderHead: () => (
				<tr>
					<th style={{ width: 'auto', textAlign: 'right' }}>#</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
					<th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung đào tạo, bồi dưỡng</th>
					<th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở đào tạo, bồi dưỡng</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Minh chứng</th>
					<th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
				</tr>
			),
			renderRow: (item, index) => (
				<tr key={index}>
					<TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
					<TableCell type='link' onClick={() => this.modal.show({ item })} style={{ whiteSpace: 'nowrap' }} content={(
						<>
							<span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
							{item.shcc}
						</>
					)} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
						<>
							{item.tenChucVu ? <>{item.tenChucVu} <br /></> : ''}
							{(item.tenDonVi || '')}
						</>
					)} />
					<TableCell type='text' style={{}} content={item.chuyenNganh} />
					<TableCell type='text' style={{}} content={item.tenTruong} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenHinhThuc || ''} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
						{item.batDau && <span>Bắt đầu: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
						{item.ketThuc ? <span>Kết thúc: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span> : null}
					</>} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi || ''} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
						{item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
						{item.trinhDo && <span>Kết quả, trình độ: <span style={{ color: 'red' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
					</>} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
						item.minhChung && T.parse(item.minhChung).length ? <a href={`/api/qua-trinh/dao-tao/download${T.parse(item.minhChung)[0]}?t=${new Date().getTime()}`} target='blank'>{item.tenLoaiBangCap}</a> : <span className='text-danger'>Chưa có</span>
					} />
					<TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
						onEdit={() => this.modal.show({ item, shcc: item.shcc })} onDelete={e => this.delete(e, item)} > </TableCell>
				</tr>
			)
		});

		let groupTable = renderTable({
			emptyTable: 'Chưa có dữ liệu',
			getDataSource: () => list, stickyHead: true,
			renderHead: () => (
				<tr>
					<th style={{ width: 'auto', textAlign: 'right' }}>#</th>
					<th style={{ width: '20%', whiteSpace: 'nowrap' }}>Cán bộ</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
					<th style={{ width: '80%', whiteSpace: 'nowrap' }}>Danh sách</th>
					<th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
				</tr>),
			renderRow: (item, index) => (
				<tr key={index}>
					<TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
					<TableCell style={{ whiteSpace: 'nowrap' }} content={(
						<>
							<span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
							{item.shcc}
						</>
					)} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
						<>
							{item.tenChucVu ? <>{item.tenChucVu} <br /></> : ''}
							{(item.tenDonVi || '')}
						</>
					)} />
					<TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.list(item.danhSachChuyenNganh, item.soQuaTrinh, item.soQuaTrinh)} />
					<TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
						<Link className='btn btn-success' to={`/user/tccb/qua-trinh/dao-tao/${item.shcc}`} >
							<i className='fa fa-lg fa-compress' />
						</Link>
					</TableCell>
				</tr>)
		});

		return this.renderPage({
			icon: 'fa fa-podcast',
			title: 'Quá trình đào tạo',
			breadcrumb: [
				<Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
				'Quá trình đào tạo'
			],
			advanceSearch: <>
				<div className='row'>
					<FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian (bắt đầu)' />
					<FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian (bắt đầu)' />
					<FormSelect className='col-12 col-md-4' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} />
					<FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
					<FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.loaiBang = e} label='Loại bằng cấp' data={SelectApdater_DmBangDaoTao} allowClear={true} minimumResultsForSearch={-1} />
					<div className='col-12'>
						<div className='row justify-content-between'>
							<div className='form-group col-md-12' style={{ textAlign: 'right' }}>
								<button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
									<i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
								</button>
								<button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
									<i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
								</button>
							</div>
						</div>
					</div>
				</div>
			</>,
			content: <>
				<div className='tile'>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
						<div style={{ marginBottom: '10px' }}>Tìm thấy: <b>{totalItem}</b> kết quả.</div>
					</div>
					{this.checked ? groupTable : table}
				</div>
				<Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
					getPage={this.checked ? this.props.getQtDaoTaoGroupPage : this.props.getQtDaoTaoPage} />
				<DaoTaoModal ref={e => this.modal = e} isCanBo={false}
					create={this.props.createQtDaoTao} update={this.props.updateQtDaoTao}
				/>
			</>,
			backRoute: '/user/tccb',
			onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
			onExport: !this.checked ? (e) => {
				e.preventDefault();
				const { fromYear, toYear, listShcc, listDv, listLoaiBang } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, listLoaiBang: null };
				T.download(T.url(`/api/qua-trinh/dao-tao/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${listLoaiBang ? listLoaiBang : null}`), 'daotaoboiduong.xlsx');
			} : null
		});
	}
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.tccb.qtDaoTao });
const mapActionsToProps = {
	getQtDaoTaoPage, deleteQtDaoTao, createQtDaoTao,
	updateQtDaoTao, getQtDaoTaoGroupPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTao);