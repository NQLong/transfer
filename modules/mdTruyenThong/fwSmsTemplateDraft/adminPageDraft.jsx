import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import ModalDraft from './ModalDraft';
import { fwSmsTemplateDraftUpdate, fwSmsTemplateDraftGetPage } from './redux';
class FwSmsTemplateDraftPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            T.onSearch = (searchText) => this.props.fwSmsTemplateDraftGetPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.fwSmsTemplateDraftGetPage();
        });
    }

    render() {
        const permissionDraft = this.getUserPermission('fwSmsTemplateDraft');
        const permissionTemplate = this.getUserPermission('fwSmsTemplate');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwSmsTemplateDraft && this.props.fwSmsTemplateDraft.page ?
            this.props.fwSmsTemplateDraft.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có mẫu nào!',
            stickyHead: true,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '60%' }} nowrap='true'>Nội dung đã soạn</th>
                <th style={{ width: '20%' }} nowrap='true'>Mục đích</th>
                <th style={{ width: '20%' }} nowrap='true'>Người soạn</th>
                <th style={{ width: 'auto' }} nowrap='true'>Tình trạng</th>
                <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
            </tr>,
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.content} />
                    <TableCell content={item.mucDich} />
                    <TableCell content={<>{item.email} <br /> {T.dateToText(new Date(item.lastModified), 'HH:mm:ss dd/mm/yyyy')}</>} />
                    {permissionTemplate.write && !item.approved ? <TableCell type='checkbox' permission={permissionTemplate} onChanged={value => value == true && this.props.fwSmsTemplateDraftUpdate(item.id, { approved: value })} content={item.approved} /> : <TableCell style={{ whiteSpace: 'nowrap' }} content={item.approved ? `Duyệt lúc ${T.dateToText(new Date(item.approvedTime), 'HH:mm:ss dd/mm/yyyy')}` : 'Chưa duyệt'} />}
                    <TableCell type='buttons' permission={permissionDraft} onEdit={() => this.modalDraft.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Template chờ duyệt',
            icon: 'fa fa-spinner',
            content: <><div className='tile'>
                {table}
            </div>
                <Pagination style={{ marginLeft: '65px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.fwSmsTemplateDraftGetPage} />
                <ModalDraft ref={e => this.modalDraft = e} />
            </>,
            breadcrumb: [
                <Link key={0} to='/user/truyen-thong'>Truyền thông</Link>,
                'Template chờ duyệt'
            ],
            backRoute: '/user/truyen-thong',
            onCreate: permissionDraft.write ? e => e.preventDefault() || this.modalDraft.show() : null
            // onCreate: permission.write ? e => e.preventDefaut() || 
        });
    }
}
const mapStateToProps = state => ({ system: state.system, fwSmsTemplateDraft: state.doiNgoai.fwSmsTemplateDraft });
const mapActionsToProps = {
    fwSmsTemplateDraftUpdate, fwSmsTemplateDraftGetPage
};
export default connect(mapStateToProps, mapActionsToProps)(FwSmsTemplateDraftPage);