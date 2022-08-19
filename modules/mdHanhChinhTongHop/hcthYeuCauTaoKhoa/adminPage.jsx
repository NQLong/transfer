import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getRequest, updateStatus } from './redux';
const { trangThaiRequest } = require('../constant');
export class YeuCauTaoKhoa extends AdminPage {

    state = { filter: {} }
    componentDidMount() {
        T.ready(this.pageConfig.ready, () => {
            this.props.getRequest();
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthYeuCauTaoKhoa && this.props.hcthYeuCauTaoKhoa.page ? this.props.hcthYeuCauTaoKhoa.page : { pageNumber: 1, pageSize: 50 };
        const pageFilter = isInitial ? {} : {};

        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    // if (!$.isEmptyObject(filter) && filter && (filter.donViNhan || filter.canBoNhan)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getRequest(pageNumber, pageSize, pageCondition, this.state.filter, done);
    }

    onAprroveRequest = (request) => {
        T.confirm('Duyệt yêu cầu này', `Bạn có chắc muốn duyệt yêu cầu tạo chữ ký của ${`${request.ho} ${request.ten}`.trim().normalizedName()}?`, true,
            isConfirm => isConfirm && this.props.updateStatus(request.id, trangThaiRequest.DA_DUYET.id));
    }

    onRefuseRequest = (request) => {
        T.confirm('Từ chối yêu cầu này', `Bạn có chắc muốn từ chối yêu cầu tạo chữ ký của ${`${request.ho} ${request.ten}`.trim().normalizedName()}?`, true,
            isConfirm => isConfirm && this.props.updateStatus(request.id, trangThaiRequest.TU_CHOI.id));
    }

    renderTable = (permissions) => renderTable({
        getDataSource: () => this.props.hcthYeuCauTaoKhoa?.page?.list,
        // header: 'theadlight',
        loadingOverlay: false,
        loadingClassName: 'd-flex justify-content-center',
        stickyHead: true,
        emptyTable: 'Chưa có yêu cầu tạo chữ ký',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Người yêu cầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày yêu cầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cập nhật bởi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            return <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.R || index} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.shcc}: ` + `${item.ho} ${item.ten}`.trim().normalizedName()} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayTao && T.dateToText(new Date(item.ngayTao), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayCapNhat && T.dateToText(new Date(item.ngayCapNhat), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shccCanBoCapNhat ? `${item.shccCanBoCapNhat}: ` + `${item.hoCanBoCapNhat} ${item.tenCanBoCapNhat}`.trim().normalizedName() : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.trangThai ? trangThaiRequest[item.trangThai]?.text : ''} />
                <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} >
                    {permissions?.write && item.trangThai === trangThaiRequest.CHO_DUYET.id && <>
                        <button className='btn btn-success' onClick={() => this.onAprroveRequest(item)}>
                            <i className='fa fa-lg fa-check' />
                        </button>
                        <button className='btn btn-danger' onClick={() => this.onRefuseRequest(item)}>
                            <i className='fa fa-lg fa-times' />
                        </button>
                    </>
                    }
                </TableCell>
            </tr>;
        }
    });

    pageConfig = {
        title: 'Yêu cầu tạo chữ ký',
        ready: '/user/hcth/yeu-cau-tao-khoa',
        icon: 'fa fa-key'
    }

    getContent = () => {
        return;
    }

    render() {
        const permissions = this.getUserPermission('hcthYeuCauTaoKhoa');
        return this.renderPage({
            title: this.pageConfig.title,
            icon: this.pageConfig.icon,
            content: <div className='tile row'>
                <div className='col-md-12'>
                    {this.renderTable(permissions)}
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthYeuCauTaoKhoa: state.hcth.hcthYeuCauTaoKhoa });
const mapActionsToProps = { getRequest, updateStatus };
export default connect(mapStateToProps, mapActionsToProps)(YeuCauTaoKhoa);