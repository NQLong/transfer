import React from 'react';
import { connect } from 'react-redux';
import { SelectAdapter_DmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDvWebsitePage, createDvWebsite, updateDvWebsite, deleteDvWebsite } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormSelect, getValue } from 'view/component/AdminPage';

class ItemModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => {
            this.onShown(() => this.shortname.focus());
        });
    }

    onShow = () => {
        this.shortname.value('');
        this.maDonVi.value(null);
        this.website.value('');
    }

    onSubmit = () => {
        const item = {
            shortname: getValue(this.shortname).trim(),
            website: getValue(this.website),
            maDonVi: getValue(this.maDonVi),
            kichHoat: 0
        };

        this.props.create(item);
        this.hide();
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo mới website đơn vị',
            body: <>
                <FormTextBox ref={e => this.shortname = e} label='Tên viết tắt' required />
                <FormSelect ref={e => this.maDonVi = e} data={SelectAdapter_DmDonViAll} label='Đơn vị' required />
                <FormTextBox ref={e => this.website = e} label='Website riêng' />
            </>
        });
    }
}

class adminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/website', () => {
            const permission = this.getUserPermission('website', ['manage']);
            if (permission.manage) {
                T.onSearch = searchTerm => this.props.getDvWebsitePage(undefined, undefined, searchTerm);
                T.showSearchBox();
            }
            this.props.getDvWebsitePage(undefined, undefined, undefined, page => {
                if (page.pageCondition) T.setTextSearchBox(page.pageCondition);
            });
        });
    }

    changeActive = item => this.props.updateDvWebsite(item.id, { kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa website đơn vị', 'Bạn có chắc bạn muốn xóa website đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDvWebsite(item.shortname));
    };

    render() {
        const permission = this.getUserPermission('website');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dvWebsite && this.props.dvWebsite.page ?
            this.props.dvWebsite.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'left' }}>Tên viết tắt</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Website riêng</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên đơn vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ), renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={'/user/website/edit/' + item.id} content={item.shortname} />
                    <TableCell content={<a href={item.website} target='__blank' className='text-success'>{item.website}</a>} />
                    <TableCell content={item.tenDonVi} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item, index)} />
                    <TableCell type='buttons' permission={permission} content={item} onEdit={`/user/website/edit/${item.id}`} onDelete={this.delete}>
                        <a href={`/${item.shortname}`} target='__blank' className='btn btn-success'>
                            <i className='fa fa-lg fa-chrome' style={{ margin: 'unset' }} />
                        </a>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Danh sách website đơn vị',
            icon: 'fa fa-chrome',
            breadcrumb: [
                <Link key={0} to='/user/websites'>Cấu hình</Link>,
                'Website'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <ItemModal ref={e => this.modal = e} create={this.props.createDvWebsite} />
                <Pagination name='dvWebsite' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.getDvWebsitePage} />
            </>,
            onSave: permission.write ? () => this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsite: state.dvWebsite });
const mapActionsToProps = { getDvWebsitePage, createDvWebsite, updateDvWebsite, deleteDvWebsite };
export default connect(mapStateToProps, mapActionsToProps)(adminPage);