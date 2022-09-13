import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import ModalDraft from '../fwSmsTemplateDraft/ModalDraft';
import { fwSmsTemplateUpdate, fwSmsTemplateGetPage } from './redux';

class FwSmsTemplateDraftPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            T.onSearch = (searchText) => this.props.fwSmsTemplateGetPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.fwSmsTemplateGetPage();
        });
    }

    render() {
        const permission = this.getUserPermission('fwSmsTemplate');
        const permissionDraft = this.getUserPermission('fwSmsTemplateDraft');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.fwSmsTemplate && this.props.fwSmsTemplate.page ?
            this.props.fwSmsTemplate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có mẫu nào!',
            stickyHead: true,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Nội dung</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mục đích</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Người duyệt</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell style={{ whiteSpace: 'pre-wrap' }} content={item.content} />
                    <TableCell content={item.mucDich || ''} />
                    <TableCell content={item.approver} />
                    <TableCell type='buttons' permission={permission} onEdit={() => this.modalDraft.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            title: 'Template SMS',
            icon: 'fa fa-spinner',
            content: <><div className='tile'>
                {table}
            </div>
                <Pagination style={{ marginLeft: '65px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} getPage={this.props.fwSmsTemplateGetPage} />
                <ModalDraft ref={e => this.modalDraft = e} />
            </>,
            breadcrumb: [
                <Link key={0} to='/user/truyen-thong'>Truyền thông</Link>,
                'Template SMS'
            ],
            backRoute: '/user/truyen-thong',
            onCreate: permissionDraft.write ? e => e.preventDefault() || this.modalDraft.show() : null
            // onCreate: permission.write ? e => e.preventDefaut() || 
        });
    }
}
const mapStateToProps = state => ({ system: state.system, fwSmsTemplate: state.doiNgoai.fwSmsTemplate });
const mapActionsToProps = {
    fwSmsTemplateUpdate, fwSmsTemplateGetPage
};
export default connect(mapStateToProps, mapActionsToProps)(FwSmsTemplateDraftPage);