import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getNewsByCategoryAdmin, createNews, updateNews, swapNews, deleteNews } from 'modules/_default/fwNews/redux';
import { getTuyenSinh } from 'modules/_default/_init/reduxCategory';
import Pagination from 'view/component/Pagination';
import DropDown from 'view/component/Dropdown';
class adminNewsPage extends React.Component {
    pickerType = React.createRef();
    state = {
        list: [],
        category: [],
        categoryPicker: 'Tất cả',
        searchText: '',
        typeId: 0
    }
    searchTextBox = React.createRef();

    componentDidMount() {
        T.ready('/user/news/admission', () => {
            this.getData();
        });
    }

    getData() {
        this.props.getTuyenSinh('news', category => {
            let valueCate = category.map(item => item.id.toString());
            this.props.getNewsByCategoryAdmin(valueCate, 1, 100, data => {
                this.setState({ ...data, category, valueCate });
            });
        });
    }

    create = (e) => {
        this.props.createNews(data => this.props.history.push('/user/news/edit/' + data.item.id));
        e.preventDefault();
    }

    swap = (e, item, isMoveUp) => {
        this.props.swapNews(item.id, isMoveUp, done => {
            this.getData();
        });
        e.preventDefault();
    }

    changeActive = (item) => {
        this.props.updateNews(item.id, { active: item.active ? 0 : 1 }, done => {
            this.getData();
        });
    }

    changeisInternal = (item) => this.props.updateNews(item.id, { isInternal: item.isInternal ? 0 : 1 }, done => {
        this.getData();
    });

    onChangeType = (type) => {
        this.props.getNewsByCategoryAdmin(type.id ? type.id : this.state.valueCate, 1, 25, data => {
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
        this.props.getNewsByCategoryAdmin(this.state.typeId == 0 ? this.state.valueCate : this.state.typeId, pageSize, pageNumber, data => {
            this.setState({ ...data, categoryPicker: type.text, typeId: type.id });
        });

    }

    delete = (e, item) => {
        T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true,
            isConfirm => isConfirm && this.props.deleteNews(item.id, done => {
                this.getData();
            }));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('news:write');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.state ?
            this.state : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = <div>Không có bài viết!</div>, category = [{ id: 0, text: 'Tất cả' }];
        this.state.category.forEach(item => {
            if (item.active == true && item.type == 'news') category.push({ id: item.id, text: T.language.parse(item.title, true).vi });
        });
        const { list } = this.state;
        table = (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '70%' }}>Tiêu đề</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Ngày đăng bài</th>
                        <th key={0} style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th key={1} style={{ width: 'auto' }} nowrap='true'>Tin nội bộ</th>
                        <th key={2} style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
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
                            <td style={{ width: '10%', textAlign: 'center' }}>
                                {T.dateToText(item.startPost)}
                            </td>
                            <td className='toggle' style={{ textAlign: 'center' }}>
                                <label>
                                    <input type='checkbox' checked={item.active} onChange={() => this.changeActive(item, index)} />
                                    <span className='button-indecator' />
                                </label>
                            </td>
                            <td className='toggle' style={{ textAlign: 'center' }}>
                                <label>
                                    <input type='checkbox' checked={item.isInternal} onChange={() => this.changeisInternal(item, index)} />
                                    <span className='button-indecator' />
                                </label>
                            </td>
                            <>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/news/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {/* <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> */}
                                    </div>
                                </td>
                            </>

                        </tr>
                    ))}
                </tbody>
            </table>
        );
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài viết: Danh sách</h1>

                </div>
                <div className='row tile' style={{ display: 'flex', flexDirection: 'column', }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: '20px' }}>
                        <DropDown ref={this.pickerType} className='btn btn-success' text={'Tất cả'} items={category} onSelected={this.onChangeType} />
                    </div>
                    <div>
                        {table}
                    </div>
                </div>
                <Pagination name='pageNewsTuyenSinh'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.getPage} />
                {currentPermissions.contains('news:tuyensinh') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news, category: state.category });
const mapActionsToProps = { getNewsByCategoryAdmin, createNews, updateNews, deleteNews, getTuyenSinh, swapNews };
export default connect(mapStateToProps, mapActionsToProps)(adminNewsPage);