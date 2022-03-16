import React from 'react';
import { connect } from 'react-redux';
import { getTranslateDraftNews, checkLink, updateTranslateDraftNews } from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';

class DraftNewsEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, draft: true, draftId: '' };
        this.newsLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/news/draft/translate', () => {
            this.getData();
            $('#neNewsViTitle').focus();
            $('#neNewsCategories').select2();
            $('#neNewsStartPost').datetimepicker(T.dateFormat);
        });
    }

    changeTranslated = (draftId) => {
        T.confirm('Dịch bài viết', 'Bạn có chắc bài viết này đã dịch xong?', 'warning', true,
            isConfirm => isConfirm && this.props.updateTranslateDraftNews(draftId, { isTranslated: 'done' }, () => {
                this.props.history.push('/user/news/draft/translate');
            }));
    }

    getData = () => {
        const route = T.routeMatcher('/user/news/draft/translate/edit/:newsId'),
            IdNews = route.parse(window.location.pathname).newsId;
        this.setState({ draftId: IdNews });
        this.props.getTranslateDraftNews(IdNews, data => {
            if (data.error) {
                T.notify('Lấy bản nháp tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/news/draft/translate');
            } else if (data.categories && data.item) {
                const contentNews = JSON.parse(data.item.documentJson);
                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text) }));
                $('#neNewsCategories').select2({ data: categories }).val(contentNews.categories).trigger('change');
                const neNewsStartPost = $('#neNewsStartPost').datetimepicker(T.dateFormat);
                if (contentNews.startPost)
                    neNewsStartPost.val(T.dateToText(contentNews.startPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (contentNews.link) {
                    $(this.newsLink.current).html(T.rootUrl + '/tin-tuc/' + contentNews.link).attr('href', '/tin-tuc/' + contentNews.link);
                } else {
                    $(this.newsLink.current).html('').attr('');
                }
                data.image = data.item.image ? data.item.image : '/image/avatar.png';
                this.imageBox.current.setData('draftNews:' + (data.item.id ? data.item.id : 'new'));
                let title = T.language.parse(data.item.title, true),
                    abstract = T.language.parse(contentNews.abstract, true),
                    content = T.language.parse(contentNews.content, true);
                $('#neNewsViTitle').val(title.vi); $('#neNewsEnTitle').val(title.en);
                $('#neNewsViAbstract').val(abstract.vi); $('#neNewsEnAbstract').val(abstract.en);
                this.viEditor.current.html(content.vi); this.enEditor.current.html(content.en);
                this.setState(data);
            } else {
                this.props.history.push('/user/news/draft/translate');
            }
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    }
    changeisInternal = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { isInternal: event.target.checked }) });
    }
    checkLink = (item) => {
        this.props.checkLink(item.id, $('#neNewsLink').val().trim());
    }
    newsLinkChange = (e) => {
        if (e.target.value) {
            $(this.newsLink.current).html(T.rootUrl + '/tin-tuc/' + e.target.value).attr('href', '/tin-tuc/' + e.target.value);
        } else {
            $(this.newsLink.current).html('').attr('href', '#');
        }
    }
    save = () => {
        const neNewsStartPost = $('#neNewsStartPost').val(),
            changes = {
                categories: $('#neNewsCategories').val().length ? $('#neNewsCategories').val() : ['-1'],
                title: JSON.stringify({ vi: $('#neNewsViTitle').val(), en: $('#neNewsEnTitle').val() }),
                link: $('#neNewsLink').val().trim(),
                abstract: JSON.stringify({ vi: $('#neNewsViAbstract').val(), en: $('#neNewsEnAbstract').val() }),
                content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
            };
        if (neNewsStartPost) changes.startPost = T.formatDate(neNewsStartPost).getTime();
        let newDraft = {
            title: JSON.stringify({ vi: $('#neNewsViTitle').val(), en: $('#neNewsEnTitle').val() }),
            documentType: 'news',
            isInternal: this.state.item.isInternal ? 1 : 0,
            documentJson: JSON.stringify(changes),
            lastModified: new Date().getTime(),
            isDraftApproved: 1,
            isUnitApproved: 1,
        };
        this.props.updateTranslateDraftNews(this.state.draftId, newDraft, () => { });

    }

    render() {
        const readOnly = false;
        const item = this.state.item ? this.state.item : {
            priority: 1, categories: [], title: '', content: '', image: T.url('/image/avatar.png'),
            lastModified: new Date().getTime(), active: false, isInternal: false, view: 0
        };
        let title = T.language.parse(item.title, true),
            linkDefaultNews = T.rootUrl + '/news/item/' + item.id;

        const categories = this.props.news && this.props.news.categories ? this.props.news.categories : [];
        let userCategories = '';
        (this.state.item && this.state.item.categories ? this.state.item.categories : []).forEach(id => {
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].id == id) {
                    userCategories += ', ' + T.language.parse(categories[i].text);
                    break;
                }
            }
        });
        if (userCategories.length > 2) userCategories = userCategories.substring(2);

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Dịch bài viết: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.lastModified) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/news/draft/translate'>Danh sách bài viết dịch</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên bài viết</label>
                                    <input className='form-control' type='text' placeholder='Tên bài viết' id='neNewsViTitle' defaultValue={title.vi} readOnly={true} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>News title</label>
                                    <input className='form-control' type='text' placeholder='News title' id='neNewsEnTitle' defaultValue={title.en} readOnly={readOnly} />
                                </div>

                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='NewsDraftImage' image={this.state.image} readOnly={true} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Tin nội bộ:&nbsp;</label>
                                            <span className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.isInternal} onChange={this.changeisInternal} disabled={true} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </span>
                                        </div>
                                    </div>

                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Danh mục bài viết</label>
                                    <select className='form-control' id='neNewsCategories' multiple={true} defaultValue={[]} disabled={true}>
                                        <optgroup label='Lựa chọn danh mục' />
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Link mặc định</label><br />
                                    <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank' rel="noreferrer">{linkDefaultNews}</a>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link truyền thông</label><br />
                                    <a href='#' ref={this.newsLink} style={{ fontWeight: 'bold' }} target='_blank' />
                                    <input className='form-control' id='neNewsLink' type='text' placeholder='Link truyền thông' defaultValue={item.link} readOnly={true}
                                        onChange={this.newsLinkChange} />
                                </div>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày tạo: {T.dateToText(item.lastModified)}</label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu đăng bài viết</label>
                                    <input className='form-control' id='neNewsStartPost' type='text' placeholder='Ngày bắt đầu đăng bài viết' defaultValue={item.startPost}
                                        disabled={true} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <ul className='nav nav-tabs'>
                                    <li className='nav-item'>
                                        <a className='nav-link active show' data-toggle='tab' href='#newsViTab'>Việt Nam</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#newsEnTab'>English</a>
                                    </li>
                                </ul>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='newsViTab' className='tab-pane fade show active'>
                                        <label className='control-label'>Tóm tắt bài viết</label>
                                        <textarea defaultValue='' className='form-control' id='neNewsViAbstract' placeholder='Tóm tắt bài viết' readOnly={true}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>Nội dung bài viết</label>
                                        <Editor ref={this.viEditor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=news' readOnly={true} />
                                    </div>
                                    <div id='newsEnTab' className='tab-pane fade'>
                                        <label className='control-label'>News abstract</label>
                                        <textarea defaultValue='' className='form-control' id='neNewsEnAbstract' placeholder='News abstracts' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>News content</label>
                                        <Editor ref={this.enEditor} height='400px' placeholder='News content' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to={'/user/news/draft/translate'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {readOnly ? '' :
                    <>
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '66px', bottom: '10px' }} onClick={this.save}>
                            <i className='fa fa-lg fa-save' />
                        </button>
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px', backgroundColor: '#FFAD33', borderColor: '#FFAD33' }} onClick={() => this.changeTranslated(this.state.draftId)}>
                            <i className='fa fa-lg fa-language' />
                        </button>
                    </>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getTranslateDraftNews, checkLink, updateTranslateDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(DraftNewsEditPage);
