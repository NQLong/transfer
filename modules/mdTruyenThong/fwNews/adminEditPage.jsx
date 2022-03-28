import React from 'react';
import { connect } from 'react-redux';
import { updateNews, getNews, getDraftNews, checkLink, adminCheckLink, createDraftNews, updateDraftNews } from './redux';
import { getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwStorage } from 'modules/_default/fwStorage/redux';
import { Link, withRouter } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';
import { Select } from 'view/component/Input';
import { FormTextBox } from 'view/component/AdminPage';

const languageOption = [
    { value: 'vi', text: 'Tiếng Việt' },
    { value: 'en', text: 'Tiếng Anh' }
];

class NewsEditPage extends React.Component {
    constructor (props) {
        super(props);
        this.state = { item: null, displayCover: 1 };
        // this.newsLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.language = React.createRef();
        this.file = React.createRef();
        this.DonVi = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            this.getData();
            this.neNewsViTitle.focus();
            $('#neNewsCategories').select2();
            $('#neNewsStartPost').datetimepicker(T.dateFormat);
        });
    }
    componentDidUpdate() {
        $(this.DonVi.current).on('change', e => {
            let donVi = e.target.selectedOptions[0] && e.target.selectedOptions[0].value || null;
            if (donVi != this.state.donVi) this.setState({ donVi });
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/news/edit/:newsId'),
            newsId = route.parse(window.location.pathname).newsId,
            currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        this.props.getNews(newsId, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                this.props.history.goBack();
            } else if (data.item) {
                if (data.item.maDonVi == 0 && !currentPermissions.includes('news:write')) {
                    this.props.history.goBack();
                    return;
                }
                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text) }));
                $('#neNewsCategories').select2({ data: categories }).val(data.item.categories).trigger('change');
                const neNewsStartPost = $('#neNewsStartPost').datetimepicker(T.dateFormat);
                if (data.item.startPost)
                    neNewsStartPost.val(T.dateToText(data.item.startPost, 'dd/mm/yyyy HH:MM')).datetimepicker('update');
                if (data.item.link) {
                    this.neNewsLink.value(data.item.link);
                    $(this.newsLink).html(T.rootUrl + '/tin-tuc/' + data.item.link).attr('href', '/tin-tuc/' + data.item.link);
                } else {
                    $(this.newsLink).html('').attr('');
                }
                if (data.item.linkEn) {
                    this.neNewsEnLink.value(data.item.linkEn);
                    $(this.newsEnLink).html(T.rootUrl + '/article/' + data.item.linkEn).attr('href', '/article/' + data.item.link);
                } else {
                    $(this.newsEnLink).html('').attr('');
                }
                data.image = data.item.image ? data.item.image : '/image/avatar.png';
                this.imageBox.current.setData('news:' + (data.item.id ? data.item.id : 'new'), data.item.image);
                let title = T.language.parse(data.item.title, true),
                    abstract = T.language.parse(data.item.abstract, true),
                    content = T.language.parse(data.item.content, true);
                this.language.current.setVal(data.item.language);
                this.neNewsViTitle.value(title.vi);
                this.neNewsEnTitle.value(title.en);
                $('#neNewsViAbstract').val(abstract.vi); $('#neNewsEnAbstract').val(abstract.en);
                this.viEditor.current.html(content.vi); this.enEditor.current.html(content.en);
                if (data.listAttachment) this.file.current.setVal(data.listAttachment.map(item => ({ value: item.id, text: item.nameDisplay })));
                this.props.getDmDonViFaculty(items => {
                    $(this.DonVi.current).select2({
                        data: [{ id: 0, text: 'TRƯỜNG ĐẠI HỌC KHXH & NV' }, ...items.map(item => ({ id: item.ma, text: item.ten }))],
                        placeholder: 'Chọn đơn vị'
                    }).val(data.item && data.item.maDonVi
                        ? data.item.maDonVi : 0).trigger('change');
                });
                this.setState(data);
            } else {
                this.props.history.push('/user/news/list');
            }
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    }
    changeisInternal = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { isInternal: event.target.checked }) });
    }
    changeIsTranslate = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { isTranslate: event.target.checked ? 1 : 0 }) });
    }
    changeDisplayCover = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { displayCover: event.target.checked }) });
    }
    checkLink = (item) => {
        this.props.checkLink(item.id, this.neNewsLink.value().trim());
    }
    newsLinkChange = (e) => {
        if (e.target.value) {
            $(this.newsLink).html(T.rootUrl + '/tin-tuc/' + e.target.value).attr('href', '/tin-tuc/' + e.target.value);
        } else {
            $(this.newsLink).html('').attr('href', '#');
        }
    }
    newsEnLinkChange = (e) => {
        if (e.target.value) {
            $(this.newsEnLink).html(T.rootUrl + '/article/' + e.target.value).attr('href', '/article/' + e.target.value);
        } else {
            $(this.newsEnLink).html('').attr('href', '#');
        }
    }

    save = () => {
        const neNewsStartPost = $('#neNewsStartPost').val() ? T.formatDate($('#neNewsStartPost').val()).getTime() : null,
            isTranslated = this.neNewsEnTitle.value() && $('#neNewsEnAbstract').val() && this.enEditor.current.html();

        const changes = {
            categories: $('#neNewsCategories').val().length ? $('#neNewsCategories').val() : ['-1'],
            title: JSON.stringify({ vi: this.neNewsViTitle.value(), en: this.neNewsEnTitle.value() }),
            link: this.neNewsLink.value().trim(),
            linkEn: this.neNewsEnLink.value().trim(),
            active: this.state.item.active ? 1 : 0,
            isInternal: this.state.item.isInternal ? 1 : 0,
            isTranslate: this.state.item.isTranslate ? 1 : 0,
            abstract: JSON.stringify({ vi: $('#neNewsViAbstract').val(), en: $('#neNewsEnAbstract').val() }),
            content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
            attachment: this.file.current.val().toString(),
            displayCover: this.state.item.displayCover ? 1 : 0,
            maDonVi: this.state.donVi,
        };
        if (!this.state.item.isTranslate) changes.language = this.language.current.getVal() ? this.language.current.getVal() : 'vi';
        if (neNewsStartPost) changes.startPost = neNewsStartPost;
        let newDraft = {
            title: JSON.stringify({ vi: this.neNewsViTitle.value(), en: this.neNewsEnTitle.value() }),
            editorId: this.props.system.user.shcc,
            documentId: this.state.item.id,
            editorName: this.props.system.user.firstName + ' ' + this.props.system.user.lastName,
            isInternal: this.state.item.isInternal ? 1 : 0,
            documentType: 'news',
            documentJson: JSON.stringify(changes),
            isTranslated: isTranslated ? 'done' : 'ready',
            displayCover: this.state.item.displayCover ? 1 : 0,
        };
        if (this.props.system.user.permissions.includes('news:write') || this.props.system.user.permissions.includes('website:write')) {
            this.props.adminCheckLink(this.state.item.id, this.neNewsLink.value().trim(), done => {
                if (this.neNewsLink.value().trim() && done.error) {
                    T.notify('Link truyền thông không hợp lệ hoặc đã bị trùng!', 'danger');
                } else {
                    this.props.updateNews(this.state.item.id, changes, () => {
                        this.neNewsLink.value(changes.link);
                    });
                }
            });
        } else if (this.props.system.user.permissions.includes('news:tuyensinh')) {
            let labelSelected = $('#neNewsCategories').find('option:selected').text();
            if (!labelSelected.includes('TS')) {
                T.notify('Vui lòng chọn danh mục Tuyển sinh!', 'danger');
                return;
            }
            this.props.adminCheckLink(this.state.item.id, this.neNewsLink.value().trim(), done => {
                if (this.neNewsLink.value().trim() && done.error) {
                    T.notify('Link truyền thông không hợp lệ hoặc đã bị trùng!', 'danger');
                } else {
                    this.props.updateNews(this.state.item.id, changes, () => {
                        this.neNewsLink.value(changes.link);
                    });
                }
            });
        } else {
            newDraft.isDraftApproved = 1;
            this.props.createDraftNews(newDraft, () => { this.getData(); });
        }
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let readOnly = currentPermissions.contains('news:draft')
            && !currentPermissions.contains('news:write')
            && !currentPermissions.contains('website:write');
        const item = this.state.item ? this.state.item : {
            priority: 1,
            categories: [],
            title: '',
            content: '',
            image: T.url('/image/avatar.png'),
            createdDate: new Date(),
            active: false, isInternal: false,
            view: 0,
            isTranslate: 0,
            displayCover: 1
        };
        let title = T.language.parse(item.title, true), linkDefaultNews = T.rootUrl + '/news/item/' + item.id;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Bài viết: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/news/list'>Danh sách bài viết</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.neNewsViTitle = e} label='Tên bài viết' />
                                <FormTextBox ref={e => this.neNewsEnTitle = e} label='News title' />
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='NewsImage' readOnly={false} />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        {currentPermissions.includes('news:write')
                                            || currentPermissions.includes('news:tuyensinh')
                                            || currentPermissions.includes('website:write') ? <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                            <label className='control-label'>Kích hoạt:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.active} onChange={this.changeActive} disabled={readOnly} />
                                                    <span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div> : null}
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
                                        <div className='form-group row'>
                                            <label className='control-label col-12'>Lượt xem: {item.views}</label>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Danh mục bài viết</label>
                                    <select className='form-control' id='neNewsCategories' multiple={true} defaultValue={[]} disabled={readOnly}>
                                        <optgroup label='Lựa chọn danh mục' />
                                    </select>
                                </div>
                                <div className='form-group' style={{ display: 'none' }}>
                                    <label className='control-label'>Đơn vị</label>
                                    <select ref={this.DonVi} placeholder='Chọn danh mục' multiple={false} className='select2-input' disabled={readOnly}></select>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Tệp tin đính kèm</label>
                                    <Select ref={this.file} adapter={SelectAdapter_FwStorage} multiple={true} disabled={readOnly} />
                                </div>
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngôn ngữ</h3>
                            <div className='tile-body'>
                                <div className='form-group' >
                                    <label className='control-label'>Song ngữ:&nbsp;</label>
                                    <span className='toggle'>
                                        <label>
                                            <input type='checkbox' checked={item.isTranslate} onChange={this.changeIsTranslate} disabled={readOnly} />
                                            <span className='button-indecator' />
                                        </label>
                                    </span>
                                </div>
                                <div className='form-group' style={{ display: !item.isTranslate ? 'block' : 'none' }}>
                                    <Select ref={this.language} data={languageOption} hideSearchBox={true} label='Chọn ngôn ngữ hiển thị' disabled={readOnly || item.isTranslate} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                {/* <div className='form-group'>
                                    <label className='control-label'>Link mặc định</label><br />
                                </div> */}
                                <FormTextBox ref={e => this.neNewsLink = e} label='Link truyền thông' onChange={this.newsLinkChange} />
                                <FormTextBox ref={e => this.neNewsEnLink = e} label='Link truyền thông tiếng Anh(nếu có)' onChange={this.newsEnLinkChange} />
                                <div>
                                    <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank' rel="noreferrer">{linkDefaultNews}</a>
                                </div>
                                <div>
                                    <a href='#' ref={e => this.newsLink = e} style={{ fontWeight: 'bold' }} target='_blank' />
                                </div>
                                <a href='#' ref={e => this.newsEnLink = e} style={{ fontWeight: 'bold' }} target='_blank' />
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
                                    <label className='control-label'>Ngày bắt đầu đăng bài viết{readOnly && item.startPost ? ': ' + T.dateToText(item.startPost, 'dd/mm/yyyy HH:MM') : ''}</label>
                                    <input className='form-control' id='neNewsStartPost' type='text' placeholder='Ngày bắt đầu đăng bài viết' autoComplete='off' defaultValue={item.startPost}
                                        disabled={readOnly} />
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
                <button onClick={() => {
                    this.props.history.goBack();
                }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </button>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { updateNews, getNews, getDraftNews, checkLink, adminCheckLink, createDraftNews, updateDraftNews, getDmDonViFaculty };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(NewsEditPage));
