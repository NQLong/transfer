import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getNewsDonVi, getNewsByCategoryAdmin, createNews, updateNews, swapNews, deleteNews } from 'modules/mdTruyenThong/fwNews/redux';
import { getByDonVi } from 'modules/_default/_init/reduxCategory';
import Pagination from 'view/component/Pagination';
import DropDown from 'view/component/Dropdown';
class NewsPage extends React.Component {
    pickerType = React.createRef();
    state = {
        list: [],
        categoryPicker: 'Tất cả',
        searchText: '',
        typeId: 0
    }
    searchTextBox = React.createRef();

    componentDidMount() {
        T.ready('/user/websites', () => {
            this.getData();
        });
    }
    getData() {
        if (this.props.news && this.props.news.categoryPicker) {
            const { categoryPicker } = this.props.news;
            this.props.getByDonVi('news', data => {
                data.forEach(item => {
                    const language = JSON.parse(item.title);
                    if (language.en == categoryPicker) {
                        this.pickerType.current.setText(language.vi);
                    }
                });
            });
            this.props.getNewsByCategoryAdmin(categoryPicker);
        } else {
            this.props.getByDonVi('news', () => {
            });
            this.props.getNewsDonVi(null, null, {}, data => {
                this.setState({ ...data });
            });
        }
    }

    create = (e) => {
        this.props.createNews(data => this.props.history.push('/user/news/edit/' + data.item.id));
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapNews(item.id, isMoveUp, () => {
            this.getData();
        });
        e.preventDefault();
    }

    changeActive = (item) => {
        this.props.updateNews(item.id, { active: item.active ? 0 : 1 }, () => {
            this.getData();
        });
    }

    changeisInternal = (item) => this.props.updateNews(item.id, { isInternal: item.isInternal ? 0 : 1 }, () => {
        this.getData();
    });
    changePinned = (item) => this.props.updateNews(item.id, { pinned: item.pinned ? 0 : new Date().getTime() }, () => {
        this.getData();
    });

    onChangeType = (type) => {
        if (type.id == 0)
            this.props.getNewsDonVi(null, null, {}, data => {
                this.setState({ ...data, categoryPicker: type.text, typeId: type.id });
            });
        else this.props.getNewsByCategoryAdmin(type.id, 1, 25, data => {
            this.setState({ ...data, categoryPicker: type.text, typeId: type.id });
        });
    }

    search = (e, searchText) => {
        e && e.preventDefault();
        if (searchText != undefined) {
            this.searchTextBox.current.value = searchText;
        } else {
            searchText = this.searchTextBox.current.value;
        }
        this.getPage(null, null, searchText);
    }

    getPage = (pageSize, pageNumber, pageCondition) => {
        if (this.state.typeId == 0) this.props.getNewsDonVi(pageSize, pageNumber, pageCondition, data => {
            this.setState({ ...data });
        });
        else this.props.getNewsByCategoryAdmin(this.state.typeId, pageSize, pageNumber, data => {
            this.setState({ ...data });
        });
    }

    delete = (e, item) => {
        T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true,
            isConfirm => isConfirm && this.props.deleteNews(item.id, () => {
                this.getData();
            }));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.state ?
            this.state : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = <div>Không có bài viết!</div>, category = [{ id: 0, text: 'Tất cả' }];
        this.props.category.forEach(item => {
            if (item.active == true && item.type == 'news') category.push({ id: item.id, text: T.language.parse(item.title, true).vi });
        });
        if (this.state.list) {
            const { list } = this.state;
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {permissionWrite && [
                                <th key={0} style={{ width: 'auto' }} nowrap='true'>Ngày đăng bài</th>,
                                <th key={1} style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>,
                                <th key={2} style={{ width: 'auto' }} nowrap='true'>Ghim bài viết</th>,
                                <th key={3} style={{ width: 'auto' }} nowrap='true'>Tin nội bộ</th>,
                                <th key={4} style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>,
                            ]
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/news/edit/' + item.id}>{T.language.parse(item.title, true).vi}</Link>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                {permissionWrite &&
                                    <>
                                        <td>
                                            {T.dateToText(item.startPost)}
                                        </td>
                                        <td className='toggle' style={{ textAlign: 'center' }}>
                                            <label>
                                                <input type='checkbox' checked={item.active} onChange={() => permissionWrite && this.changeActive(item, index)} disabled={!permissionWrite} />
                                                <span className='button-indecator' />
                                            </label>
                                        </td>
                                        <td className='toggle' style={{ textAlign: 'center' }}>
                                            <label>
                                                <input type='checkbox' checked={item.pinned} onChange={() => this.changePinned(item, index)} disabled={!permissionWrite} />
                                                <span className='button-indecator' />
                                            </label>
                                        </td>
                                        <td className='toggle' style={{ textAlign: 'center' }}>
                                            <label>
                                                <input type='checkbox' checked={item.isInternal} onChange={() => this.changeisInternal(item, index)} disabled={!permissionWrite} />
                                                <span className='button-indecator' />
                                            </label>
                                        </td>
                                        <td>
                                            <div className='btn-group'>
                                                {/* <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                                    <i className='fa fa-lg fa-arrow-up' />
                                                </a>
                                                <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                                    <i className='fa fa-lg fa-arrow-down' />
                                                </a> */}
                                                <Link to={'/user/news/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                                    <i className='fa fa-lg fa-edit' />
                                                </Link>
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a>
                                            </div>
                                        </td>
                                    </>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài viết: Danh sách</h1>
                    <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onSubmit={this.search}>
                        <input ref={this.searchTextBox} className='app-search__input' style={{ width: '30vw' }} type='search' placeholder='Tìm kiếm' />
                        <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={this.search}>
                            <i className='fa fa-search' />
                        </a>
                    </form>
                </div>
                <div className='row tile' style={{ display: 'flex', flexDirection: 'column', }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: '20px' }}>
                        <DropDown ref={this.pickerType} className='btn btn-success' text={'Tất cả'} items={category} onSelected={this.onChangeType} />
                    </div>
                    <div>
                        {table}
                    </div>
                </div>
                <button onClick={() => {
                    this.props.history.goBack();
                }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '50px' }}>
                    <i className='fa fa-lg fa-reply' />
                </button>
                <Pagination name='pageNews'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.getPage} />
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                    onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news, category: state.category });
const mapActionsToProps = { getNewsDonVi, getNewsByCategoryAdmin, createNews, updateNews, deleteNews, getByDonVi, swapNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsPage);