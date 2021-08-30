import React from 'react';
import { connect } from 'react-redux';
import { getUnitDraftNews, checkLink, updateUnitDraftNews, createUnitDraftNews } from './redux';
import { getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwStorage } from 'modules/_default/fwStorage/redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';
import { Select } from 'view/component/Input';

class UnitNewsEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, draft: true, draftId: '', displayCover: 1 };
        this.newsLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.file = React.createRef();
        this.DonVi = React.createRef();

    }
    componentDidMount() {
        T.ready('/user/news/unit/list', () => {
            this.getData();
            $('#neNewsViTitle').focus();
            $('#neNewsCategories').select2();
            $('#neNewsStartPost').datetimepicker(T.dateFormat);
        });
    }
    componentDidUpdate() {
        $(this.DonVi.current).on('change', e => {
            let donVi = e.target.selectedOptions[0] && e.target.selectedOptions[0].value || null
            if (donVi != this.state.donVi) this.setState({ donVi });
        });
    }
    getData = () => {
        const route = T.routeMatcher('/user/news/unit/edit/:newsId'),
            IdNews = route.parse(window.location.pathname).newsId;
        this.setState({ draftId: IdNews });
        this.props.getUnitDraftNews(IdNews, data => {
            if (data.error) {
                T.notify('Lấy bản nháp tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/news/unit/list');
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
                this.props.getDmDonViFaculty(items => {
                    $(this.DonVi.current).select2({
                        data: [{ id: 0, text: 'TRƯỜNG ĐẠI HỌC KHXH & NV' }, ...items.map(item => ({ id: item.ma, text: item.ten }))]
                        ,
                        placeholder: 'Chọn đơn vị'
                    }).val(data.item && data.item.maDonVi
                        ? data.item.maDonVi : 0).trigger('change');
                });
                data.image = data.item.image ? data.item.image : '/image/avatar.png';
                this.imageBox.current.setData('draftNews:' + (data.item.id ? data.item.id : 'new'));
                let title = T.language.parse(data.item.title, true),
                    abstract = T.language.parse(contentNews.abstract, true),
                    content = T.language.parse(contentNews.content, true);
                $('#neNewsViTitle').val(title.vi); $('#neNewsEnTitle').val(title.en);
                $('#neNewsViAbstract').val(abstract.vi); $('#neNewsEnAbstract').val(abstract.en);
                this.viEditor.current.html(content.vi); this.enEditor.current.html(content.en);
                if (data.item && data.item.listAttachment) this.file.current.setVal(data.item.listAttachment.map(item => ({ value: item.id, text: item.nameDisplay })));
                this.setState({ ...data, displayCover: contentNews.displayCover });

            } else {
                this.props.history.push('/user/news/unit/list');
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
    changeDisplayCover = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { displayCover: event.target.checked }) });
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
            attachment = this.file.current.val(),
            changes = {
                categories: $('#neNewsCategories').val().length ? $('#neNewsCategories').val() : ['-1'],
                title: JSON.stringify({ vi: $('#neNewsViTitle').val(), en: $('#neNewsEnTitle').val() }),
                link: $('#neNewsLink').val().trim(),
                abstract: JSON.stringify({ vi: $('#neNewsViAbstract').val(), en: $('#neNewsEnAbstract').val() }),
                content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
                attachment: attachment.filter((value, index) => attachment.indexOf(value) === index).toString(),
                displayCover: this.state.item.displayCover ? 1 : 0,
                maDonVi: this.state.donVi,


            };
        if (neNewsStartPost) changes.startPost = T.formatDate(neNewsStartPost).getTime();
        let newDraft = {
            title: JSON.stringify({ vi: $('#neNewsViTitle').val(), en: $('#neNewsEnTitle').val() }),
            documentType: 'news',
            isInternal: this.state.item.isInternal ? 1 : 0,
            documentJson: JSON.stringify(changes),
            lastModified: new Date().getTime(),
            displayCover: this.state.item.displayCover ? 1 : 0,
            maDonVi: this.state.donVi,

        }

        if ($('#neNewsEnTitle').val() && $('#neNewsEnAbstract').val() && $('#neNewsEnAbstract').val()) {
            newDraft.isTranslated = 'done';
        }
        this.props.updateUnitDraftNews(this.state.item.id, newDraft, result => {
        });
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const isAdmin = currentPermissions.includes('unit:write') && currentPermissions.includes('news:write')
        const readOnly = !currentPermissions.includes('unit:write') && !isAdmin;
        const item = this.state.item ? this.state.item : {
            priority: 1, categories: [], title: '', content: '', image: T.url('/image/avatar.png'),
            createdDate: new Date().getTime(), active: false, isInternal: false, view: 0, displayCover: 1
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
                        <h1><i className='fa fa-file' /> Chi tiết tin tức đơn vị</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/news/unit/list'>Danh sách bài viết đơn vị</Link>
                        &nbsp;/&nbsp;Chi tiết
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên bài viết</label>
                                    <input className='form-control' type='text' placeholder='Tên bài viết' id='neNewsViTitle' defaultValue={title.vi} readOnly={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>News title</label>
                                    <input className='form-control' type='text' placeholder='News title' id='neNewsEnTitle' defaultValue={title.en} readOnly={readOnly} />
                                </div>

                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='NewsDraftImage' image={this.state.image} readOnly={readOnly} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Tin nội bộ:&nbsp;</label>
                                            <span className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.isInternal} onChange={this.changeisInternal} disabled={readOnly} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </span>
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label'>Hiện thị ảnh bài viết:&nbsp;</label>
                                            <span className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.displayCover} onChange={this.changeDisplayCover} disabled={readOnly} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </span>
                                        </div>
                                    </div>

                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Danh mục bài viết</label>
                                    <select className='form-control' id='neNewsCategories' multiple={true} defaultValue={[]} disabled={readOnly}>
                                        <optgroup label='Lựa chọn danh mục' />
                                    </select>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Đơn vị</label>
                                    <select ref={this.DonVi} placeholder='Chọn danh mục' multiple={false} className='select2-input' disabled={readOnly}></select>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Tệp tin đính kèm</label>
                                    <Select ref={this.file} adapter={SelectAdapter_FwStorage} multiple={true} />
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
                                    <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank'>{linkDefaultNews}</a>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link truyền thông</label><br />
                                    <a href='#' ref={this.newsLink} style={{ fontWeight: 'bold' }} target='_blank' />
                                    <input className='form-control' id='neNewsLink' type='text' placeholder='Link truyền thông' defaultValue={item.link} readOnly={readOnly}
                                        onChange={this.newsLinkChange} />
                                </div>
                            </div>
                            {readOnly ? '' :
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.checkLink(item)}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                </button>
                                </div>
                            }
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày tạo: {T.dateToText(item.createdDate)}</label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu đăng bài viết</label>
                                    <input className='form-control' id='neNewsStartPost' type='text' placeholder='Ngày bắt đầu đăng bài viết' defaultValue={item.startPost}
                                        autoComplete='off' disabled={readOnly} />
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
                                        <textarea defaultValue='' className='form-control' id='neNewsViAbstract' placeholder='Tóm tắt bài viết' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>Nội dung bài viết</label>
                                        <Editor ref={this.viEditor} height='400px' placeholder='Nội dung bài biết' uploadUrl='/user/upload?category=news' readOnly={readOnly} />
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
                <Link to={'/user/news/unit/list'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {!readOnly ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button> : null
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getUnitDraftNews, checkLink, updateUnitDraftNews, createUnitDraftNews, getDmDonViFaculty };
export default connect(mapStateToProps, mapActionsToProps)(UnitNewsEditPage);
