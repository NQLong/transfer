import React from 'react';
import { connect } from 'react-redux';
import { updateNews, getNews, getDraftNews, checkLink, adminCheckLink, createDraftNews, updateDraftNews } from './redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwStorage } from 'modules/_default/fwStorage/redux';
import { Link, withRouter } from 'react-router-dom';
import { FormTextBox, AdminPage, FormImageBox, FormCheckbox, FormSelect, FormDatePicker, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';
import { getDmNgonNguAll } from 'modules/mdDanhMuc/dmNgonNguTruyenThong/redux';

class NewsEditPage extends AdminPage {
    state = { id: null, createdDate: '', title: '', displayCover: 1, categories: [], homeLanguages: ['vi', 'en'], languageAdapter: [] };

    constructor(props) {
        super(props);
        this.language = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            this.getData(true);
        });
    }

    getData = (initial = false) => {
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

                if (initial && data.item && data.item.hasOwnProperty('maDonVi')) {
                    this.props.getDmDonVi(data.item.maDonVi, item => {
                        const homeLanguages = item && item.homeLanguage ? item.homeLanguage.split(',') : ['vi', 'en'];
                        this.props.getDmNgonNguAll('', items => {
                            const languageAdapter = items.filter(item => homeLanguages.includes(item.maCode)).map(item => ({ id: item.maCode, text: `${item.maCode}: ${item.tenNgonNgu}` }));
                            this.setState({ languageAdapter, homeLanguages }, () => {
                                this.homeLanguage.value(data.item.languages ? data.item.languages.split(',') : ['vi']);
                            });
                        });
                    });
                }

                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text, 'vi') }));
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
                this.imageBox.setData('news:' + (data.item.id ? data.item.id : 'new'), data.item.image);
                this.active.value(data.item.active);
                this.isInternal.value(data.item.isInternal);
                this.displayCover.value(data.item.displayCover);
                this.views.value(data.item.views);
                this.createdDate.value(data.item.createdDate);
                this.startPost.value(data.item.startPost);

                this.title.value(data.item.title);
                this.abstract.value(data.item.abstract);
                this.editor.value(data.item.content);

                if (data.listAttachment) this.file.value(data.listAttachment.map(item => ({ id: item.id, text: item.nameDisplay })));
                this.setState({ categories, id: data.item.id, createdDate: data.item.createdDate, title: data.item.title }, () => {
                    this.categories.value(data.item.categories || []);
                });
            } else {
                this.props.history.push('/user/news/list');
            }
        });
    }

    checkLink = () => {
        this.props.checkLink(this.state.id, this.neNewsLink.value().trim());
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
        const permissions = this.getCurrentPermissions();
        const neNewsStartPost = this.startPost.value() ? this.startPost.value().getTime() : null;
        const translatedLanguages = this.state.homeLanguages.filter(lang => lang != 'vi');
        let isTranslated = true;
        for (const lang of translatedLanguages) {
            if (!(this.title.value[lang]() && this.abstract.value[lang]() && this.editor.value[lang]())) {
                isTranslated = false;
                break;
            }
        }

        const changes = {
            categories: this.categories.value().length ? this.categories.value() : ['-1'],
            title: this.title.value(),
            link: this.neNewsLink.value().trim(),
            linkEn: this.neNewsEnLink.value().trim(),
            active: Number(this.active.value()),
            isInternal: Number(this.isInternal.value()),
            languages: this.homeLanguage.value().join(','),
            abstract: this.abstract.value(),
            content: this.editor.value(),
            attachment: this.file.value().toString(),
            displayCover: Number(this.displayCover.value()),
            startPost: this.startPost.value() ? this.startPost.value().getTime() : null
        };

        if (neNewsStartPost) changes.startPost = neNewsStartPost;
        let newDraft = {
            title: this.title.value(),
            editorId: this.props.system.user.shcc,
            documentId: this.state.id,
            editorName: this.props.system.user.firstName + ' ' + this.props.system.user.lastName,
            isInternal: Number(this.isInternal.value()),
            documentType: 'news',
            documentJson: JSON.stringify(changes),
            isTranslated: isTranslated ? 'done' : 'ready',
            displayCover: Number(this.displayCover.value())
        };

        if (permissions.includes('news:write') || permissions.includes('website:write')) {
            this.props.adminCheckLink(this.state.id, this.neNewsLink.value().trim(), done => {
                if (this.neNewsLink.value().trim() && done.error) {
                    T.notify('Link truyền thông không hợp lệ hoặc đã bị trùng!', 'danger');
                } else {
                    this.props.updateNews(this.state.id, changes);
                }
            });
        } else if (permissions.includes('news:tuyensinh')) {
            const textSelected = (this.categories.data() || []).map(item => item.text).toString();
            if (!textSelected.includes('TS')) {
                T.notify('Vui lòng chọn danh mục Tuyển sinh!', 'danger');
                return;
            }

            this.props.adminCheckLink(this.state.id, this.neNewsLink.value().trim(), done => {
                if (this.neNewsLink.value().trim() && done.error) {
                    T.notify('Link truyền thông không hợp lệ hoặc đã bị trùng!', 'danger');
                } else {
                    this.props.updateNews(this.state.id, changes);
                }
            });
        } else {
            newDraft.isDraftApproved = 1;
            this.props.createDraftNews(newDraft, () => { this.getData(); });
        }
    };

    render() {
        const currentPermissions = this.getCurrentPermissions();
        let readOnly = currentPermissions.includes('news:draft') && !currentPermissions.includes('news:write') && !currentPermissions.includes('website:write');

        let linkDefaultNews = T.rootUrl + '/news/item/' + this.state.id;
        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Bài viết: Chỉnh sửa',
            subTitle: <>Tiêu đề: <strong>{T.language.parse(this.state.title, 'vi')}</strong> - {T.dateToText(this.state.createdDate)}</>,
            breadcrumb: [<Link key={0} to='/user/news/list'>Danh sách bài viết</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormMultipleLanguage ref={e => this.title = e} title='Tiêu đề' languages={this.state.homeLanguages} FormElement={FormTextBox} />
                                <div className='row'>
                                    <FormImageBox ref={e => this.imageBox = e} className='col-md-6' postUrl='/user/upload' uploadType='NewsImage' label='Hình ảnh' />
                                    <div className='col-md-6'>
                                        <FormCheckbox ref={e => this.active = e} label='Kích hoạt' isSwitch inline={false} readOnly={!(currentPermissions.includes('news:write') || currentPermissions.includes('news:tuyensinh') || currentPermissions.includes('website:write'))} />
                                        <FormCheckbox ref={e => this.isInternal = e} label='Tin nội bộ' isSwitch inline={false} readOnly={readOnly} />
                                        <FormCheckbox ref={e => this.displayCover = e} label='Hiển thị ảnh bài viết' isSwitch inline={false} readOnly={readOnly} />
                                        <FormTextBox ref={e => this.views = e} label='Lượt xem' readOnly />
                                    </div>
                                </div>
                                <FormSelect ref={e => this.categories = e} label='Danh mục bài viết' data={this.state.categories} multiple />
                                <FormSelect ref={e => this.file = e} label='Tệp tin đính kèm' data={SelectAdapter_FwStorage} multiple readOnly={readOnly} />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.neNewsLink = e} label='Link truyền thông' onChange={this.newsLinkChange} />
                                <FormTextBox ref={e => this.neNewsEnLink = e} label='Link truyền thông tiếng Anh(nếu có)' onChange={this.newsEnLinkChange} />
                                <div>
                                    <a href={linkDefaultNews} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{linkDefaultNews}</a>
                                </div>
                                <div>
                                    <a href='#' ref={e => this.newsLink = e} style={{ fontWeight: 'bold' }} target='_blank' />
                                </div>
                                <a href='#' ref={e => this.newsEnLink = e} style={{ fontWeight: 'bold' }} target='_blank' />
                            </div>
                            {readOnly ? '' :
                                <div className='tile-footer'>
                                    <button className='btn btn-danger' type='button' onClick={() => this.checkLink()}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                    </button>
                                </div>
                            }
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <FormDatePicker type='time-mask' ref={e => this.createdDate = e} label='Ngày tạo' readOnly />
                                <FormDatePicker type='time-mask' ref={e => this.startPost = e} label='Ngày bắt đầu đăng bài viết' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngôn ngữ</h3>
                            <div className='tile-body'>
                                <FormSelect ref={e => this.homeLanguage = e} label='Ngôn ngữ truyền thông' data={this.state.languageAdapter} readOnly={readOnly} multiple />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <FormMultipleLanguage ref={e => this.abstract = e} tabRender title='Tóm tắt' languages={this.state.homeLanguages} FormElement={FormRichTextBox} />
                                <FormMultipleLanguage ref={e => this.editor = e} tabRender title='Nội dung' languages={this.state.homeLanguages} FormElement={FormEditor} formProps={{ uploadUrl: '/user/upload?category=news' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            onSave: () => this.save(),
            backRoute: () => this.props.history.goBack()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { updateNews, getNews, getDraftNews, checkLink, adminCheckLink, createDraftNews, updateDraftNews, getDmDonVi, getDmNgonNguAll };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(NewsEditPage));
