import React from 'react';
import { connect } from 'react-redux';
import { getDmQuanHuyenAll, getDmQuanHuyenPage, deleteDmQuanHuyen, createDmQuanHuyen, updateDmQuanHuyen } from './reduxQuanHuyen';
import { getDMTinhThanhPhoAll } from './reduxTinhThanhPho';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
	state = { kichHoat: 1 };

	componentDidMount() {
		$(document).ready(() => this.onShown(() => {
            !this.maQuanHuyen.value() ? this.maQuanHuyen.focus() : this.tenQuanHuyen.focus();
        }));
	}

	onShow = (item) => {
		let { maQuanHuyen, maTinhThanhPho, tenQuanHuyen, kichHoat } = item ?
			item : { maQuanHuyen: '', maTinhThanhPho: '', tenQuanHuyen: '', kichHoat: 1 };
        this.setState({ kichHoat});
        this.maQuanHuyen.value(maQuanHuyen);
        this.tenQuanHuyen.value(tenQuanHuyen);
        this.maTinhThanhPho.value(maTinhThanhPho);
        this.kichHoat.value(kichHoat ? 1 : 0);
	};

	changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

	onSubmit = (e) => {
		e.preventDefault();
		const 
			changes = {
				maQuanHuyen: this.maQuanHuyen.value(),
				maTinhThanhPho: this.maTinhThanhPho.value(),
				tenQuanHuyen: this.tenQuanHuyen.value(),
				kichHoat: this.state.kichHoat,
			};
		if (changes.maTinhThanhPho == '') {
			T.notify('Mã tỉnh thành phố bị trống!', 'danger');
			this.maTinhThanhPho.focus();
		} else if (changes.tenQuanHuyen == null) {
			T.notify('Tên quận huyện bị trống!', 'danger');
			this.tenQuanHuyen.focus();
		} else {
			this.state.maQuanHuyen ? this.props.update(this.state.maQuanHuyen, changes, this.hide) : this.props.create(changes, this.hide);
		}
	}

	render = () => {
		const readOnly = this.props.readOnly;
		return this.renderModal({
			title: this.state.ma ? 'Cập nhật Quận Huyện' : 'Tạo mới Quận Huyện',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.maQuanHuyen = e} label='Mã quận/huyện' placeholder='Mã quận huyện' maxLength={3} readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenQuanHuyen = e} label='Tên quận/huyện' placeholder='Tên quận huyện' readOnly={readOnly} required />
                <FormSelect className='col-md-12' label='Tên tỉnh thành' ref={e => this.maTinhThanhPho = e} data={this.props.tinhOptions} required /> 
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} onChange={value => this.changeKichHoat(value ? 1 : 0)} />
            </div>
		});
	}
}

class DmQuanHuyenPage extends AdminPage {
	state = { searching: false };
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

		T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmQuanHuyenPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmQuanHuyenPage();
        });
	}

	showModal = (e) => {
		e.preventDefault();
		this.modal.show();
	};

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('Xóa danh mục quận/huyện', 'Bạn có chắc bạn muốn xóa danh mục quận/huyện này?', true, isConfirm =>
			isConfirm && this.props.deleteDmQuanHuyen(item.maQuanHuyen));
	};

	render() {
		const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
			permission = this.getUserPermission('dmChucVu', ['read', 'write', 'delete']);
		const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmQuanHuyen && this.props.dmQuanHuyen.page ?
			this.props.dmQuanHuyen.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
		let table = 'Không có thông tin quận huyện!';
		if (list && list.length > 0 && this.tinhMapper) {
			table = renderTable({
				getDataSource: () => list, stickyHead: false,
				renderHead: () => (
					<tr>
							<th style={{ width: 'auto' }}>Mã</th>
							<th style={{ width: '50%' }}>Tên quận/huyện</th>
							<th style={{ width: '50%' }} nowrap='true'>Tỉnh/thành phố</th>
							<th style={{ width: 'auto' }} nowrap='true' >Kích hoạt</th>
							<th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
					</tr>
				),
				renderRow: (item, index) => (
                    <tr key={index}>
						<TableCell type='text' content={item.maQuanHuyen} />
                        <TableCell type='link' content={item.tenQuanHuyen} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={this.tinhMapper[item.maTinhThanhPho] ? this.tinhMapper[item.maTinhThanhPho] : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmChucVu(item.ma, { kichHoat: value ? 1 : 0, })} />
                        <TableCell type='buttons' content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>)
			});
		}
		return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Quận Huyện',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục Quận Huyện'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getDmQuanHuyenPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmQuanHuyen} update={this.props.updateDmQuanHuyen} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/quan-huyen/upload') : null
        });
	}
}

const mapStateToProps = state => ({ system: state.system, dmQuanHuyen: state.danhMuc.dmQuanHuyen, dmTinhThanhPho: state.danhMuc.dmTinhThanhPho });
const mapActionsToProps = { getDmQuanHuyenAll, getDmQuanHuyenPage, getDMTinhThanhPhoAll, deleteDmQuanHuyen, createDmQuanHuyen, updateDmQuanHuyen };
export default connect(mapStateToProps, mapActionsToProps)(DmQuanHuyenPage);