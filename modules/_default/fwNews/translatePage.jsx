import React from 'react';
import { connect } from 'react-redux';
import { getTranslateDraftNewsInPage, updateTranslateDraftNews } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class NewsWaitApprovalPage extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.getTranslateDraftNewsInPage(null, null, { isDraftApproved: 1, isTranslated: 'in progress' });
        T.ready();
    }

    changeTranslated(item) {
        T.confirm('Dịch bài viết', 'Bạn có chắc bài viết này đã dịch xong?', 'warning', true, isConfirm => isConfirm && this.props.updateTranslateDraftNews(item.id, { isTranslated: 'done' }));
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list, } = this.props.news && this.props.news.draft ?
            this.props.news.draft : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [], pageCondition: {} };
        let table = 'Không có tin tức!';
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Người soạn</th>
                            {currentPermissions.contains('news:translate') && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/news/draft/translate/edit/' + item.id} data-id={item.id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.editorName}</td>
                                {currentPermissions.contains('news:translate') &&
                                    <td>
                                        <div className='btn-group'>
                                            <Link to={'/user/news/draft/translate/edit/' + item.id} data-id={item.id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link>
                                            <a className='btn btn-primary' href='#' style={{ backgroundColor: '#FFAD33', borderColor: '#FFAD33' }} onClick={() => this.changeTranslated(item)}>
                                                <i className='fa fa-lg fa-language' />
                                            </a>
                                        </div>
                                    </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Dịch bài viết</h1>
                </div>
                <div className='tile'>
                    {table}
                    <Pagination name='pageNews' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.props.getTranslateDraftNewsInPage} />
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getTranslateDraftNewsInPage, updateTranslateDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsWaitApprovalPage);