import React from 'react';
import { connect } from 'react-redux';
import { getNewsDonVi, getNewsByCategoryAdmin, createNews, updateNews, swapNews, deleteNews } from 'modules/mdTruyenThong/fwNews/redux';
import { getByDonVi } from 'modules/_default/_init/reduxCategory';
import Pagination from 'view/component/Pagination';
import DropDown from 'view/component/Dropdown';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class NewsPage extends AdminPage {
    state = { list: [], categoryPicker: 'Tất cả', searchText: '', typeId: 0, maDonVi: '' };

    componentDidMount() {
        T.ready('/user/website', () => {
            const params = T.routeMatcher('/user/news-donvi/:maDonVi').parse(window.location.pathname);
            this.setState({ maDonVi: params.maDonVi }, () => {
                this.props.getByDonVi('news', params.maDonVi, data => {
                    const categoryPicker = this.props.news && this.props.news.categoryPicker;
                    if (categoryPicker) {
                        data.forEach(item => {
                            const language = JSON.parse(item.title);
                            if (language.en == categoryPicker) {
                                this.pickerType.setText(language.vi);
                            }
                        });
                    }
                });
                T.onSearch = searchText => this.setState({ searchText }, () => this.getPage(undefined, undefined, { maDonVi: this.state.maDonVi, searchText }));
                T.showSearchBox();
                this.getData();
            });
        });
    }

    getData = () => {
        if (this.props.news && this.props.news.categoryPicker) {
            const { categoryPicker } = this.props.news;
            this.props.getNewsByCategoryAdmin(categoryPicker);
        } else {
            this.props.getNewsDonVi(null, null, { maDonVi: this.state.maDonVi, searchText: this.state.searchText }, data => {
                this.setState({ ...data });
            });
        }
    }

    create = (e) => {
        const permissionManage = this.getUserPermission('website', ['manage']).manage;
        this.props.createNews(permissionManage ? this.state.maDonVi : null, data => this.props.history.push('/user/news/edit/' + data.item.id));
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapNews(item.id, isMoveUp, () => {
            this.getData();
        });
        e.preventDefault();
    }

    changeActive = (item) => this.props.updateNews(item.id, { active: item.active ? 0 : 1 }, () => this.getData());
    changePinned = (item) => this.props.updateNews(item.id, { pinned: item.pinned ? 0 : new Date().getTime() }, () => this.getData());
    changeIsInternal = (item) => this.props.updateNews(item.id, { isInternal: item.isInternal ? 0 : 1 }, () => this.getData());

    onChangeType = (type) => {
        if (type.id == 0) {
            this.props.getNewsDonVi(null, null, { searchText: this.state.searchText, maDonVi: this.state.maDonVi }, data => {
                this.setState({ ...data, categoryPicker: type.text, typeId: type.id });
            });
        }
        else {
            this.props.getNewsByCategoryAdmin(type.id, 1, 25, data => {
                this.setState({ ...data, categoryPicker: type.text, typeId: type.id });
            });
        }
    }

    getPage = (pageSize, pageNumber, pageCondition) => {
        if (this.state.typeId == 0) {
            this.props.getNewsDonVi(pageSize, pageNumber, pageCondition, data => {
                this.setState({ ...data });
            });
        } else {
            this.props.getNewsByCategoryAdmin(this.state.typeId, pageSize, pageNumber, data => {
                this.setState({ ...data });
            });
        }
    }

    delete = (e, item) => {
        T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true, isConfirm => isConfirm && this.props.deleteNews(item.id, () => this.getData()));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('website');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.state ? this.state : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let category = [{ id: 0, text: 'Tất cả' }];
        this.props.category.forEach(item => {
            if (item.active == true && item.type == 'news') category.push({ id: item.id, text: T.language.parse(item.title, true).vi });
        });

        const table = renderTable({
            getDataSource: () => this.state.list,
            emptyTable: 'Không có bài viết!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                    {permission.write && [
                        <th key={0} style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày đăng bài</th>,
                        <th key={1} style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>,
                        <th key={2} style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghim bài viết</th>,
                        <th key={3} style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tin nội bộ</th>,
                        <th key={4} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    ]}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={'/user/news/edit/' + item.id} content={T.language.parse(item.title, 'vi')} />
                    <TableCell type='image' content={item.image} />
                    {permission.write && <>
                        <TableCell type='date' content={item.startPost} />
                        <TableCell type='checkbox' content={item.active} onChanged={() => this.changeActive(item)} permission={permission} />
                        <TableCell type='checkbox' content={item.pinned} onChanged={() => this.changePinned(item)} permission={permission} />
                        <TableCell type='checkbox' content={item.isInternal} onChanged={() => this.changeIsInternal(item)} permission={permission} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/news/edit/' + item.id} onDelete={this.delete} />
                    </>}
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Bài viết: Danh sách',
            content: <>
                <div className='row tile' style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: '20px' }}>
                        <DropDown ref={e => this.pickerType = e} className='btn btn-success' text={'Tất cả'} items={category} onSelected={this.onChangeType} />
                    </div>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '65px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
            </>,
            backRoute: () => this.props.history.goBack(),
            onCreate: permission.write ? (e) => this.create(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news, category: state.category });
const mapActionsToProps = { getNewsDonVi, getNewsByCategoryAdmin, createNews, updateNews, deleteNews, getByDonVi, swapNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsPage);