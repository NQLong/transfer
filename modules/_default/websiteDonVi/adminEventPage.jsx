import React from 'react';
import { connect } from 'react-redux';
import { getEventInPage, getEventDonVi, createEvent, updateEvent, deleteEvent } from 'modules/mdTruyenThong/fwEvent/redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class EventPage extends AdminPage {
    state = { searchText: '', maDonVi: '' };

    componentDidMount() {
        T.ready('/user/website', () => {
            const params = T.routeMatcher('/user/event-donvi/:maDonVi').parse(window.location.pathname);
            this.setState({ maDonVi: params.maDonVi }, () => {
                this.props.getEventDonVi(null, null, { maDonVi: this.state.maDonVi, searchText: '' });
                T.onSearch = searchText => this.setState({ searchText }, () => this.props.getEventDonVi(undefined, undefined, { maDonVi: this.state.maDonVi, searchText }));
                T.showSearchBox();
            });
        });
    }

    getPage = (pageNumber, pageSize) => {
        this.props.getEventDonVi(pageNumber, pageSize, { maDonVi: this.state.maDonVi, searchText: this.state.searchText });
    }

    create = (e) => {
        this.props.createEvent(data => this.props.history.push('/user/event/edit/' + data.item.id));
        e.preventDefault();
    }

    changeActive = (item) => this.props.updateEvent(item.id, { active: item.active ? 0 : 1 }, () => this.props.getEventDonVi())

    changeIsInternal = (item) => this.props.updateEvent(item.id, { isInternal: item.isInternal ? 0 : 1 }, () => this.props.getEventDonVi())

    delete = (e, item) => {
        T.confirm('Sự kiện', 'Bạn có chắc bạn muốn xóa sự kiện này?', 'warning', true, isConfirm => isConfirm && this.props.deleteEvent(item.id, () => this.props.getEventDonVi()));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('website');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.event && this.props.event.page ? this.props.event.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có bài viết!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tin nội bộ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={'/user/event/edit/' + item.id} content={T.language.parse(item.title, 'vi')} />
                    <TableCell type='image' content={item.image} />
                    <TableCell type='checkbox' content={item.active} onChanged={() => this.changeActive(item)} permission={permission} />
                    <TableCell type='checkbox' content={item.isInternal} onChanged={() => this.changeIsInternal(item)} permission={permission} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/event/edit/' + item.id} onDelete={this.delete}>
                        <Link to={'/user/event/registration/' + item.id} data-id={item.id} className='btn btn-warning'>
                            <i className='fa fa-lg fa-list-alt' />
                        </Link>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Sự kiện: Danh sách',
            icon: 'fa fa-star',
            content: <>
                <div className='tile'>{table}</div>
                <Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                {permission.write ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ event: state.event, system: state.system });
const mapActionsToProps = { getEventInPage, getEventDonVi, createEvent, updateEvent, deleteEvent };
export default connect(mapStateToProps, mapActionsToProps)(EventPage);