import React from 'react';
import { connect } from 'react-redux';
import { updateEvent, getEvent, getDraftEvent, checkLink, createDraftEvent, updateDraftEvent } from './redux';
import { countAnswer } from '../../_default/fwForm/reduxAnswer';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmNgonNguAll } from 'modules/mdDanhMuc/dmNgonNguTruyenThong/redux';
import { Link, withRouter } from 'react-router-dom';
import { FormTextBox, AdminPage, FormImageBox, FormCheckbox, FormSelect, FormDatePicker, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';

class EventEditPage extends AdminPage {
    state = { id: null, createdDate: '', title: '', numOfRegisterUsers: 0, displayCover: 1, categories: [], homeLanguages: ['vi', 'en'], languageAdapter: [] };

    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            this.getData(true);
        });
    }

    getData = (initial = false) => {
        const route = T.routeMatcher('/user/event/edit/:eventId'),
            eventId = route.parse(window.location.pathname).eventId,
            currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        this.props.getEvent(eventId, data => {
            if (data.error) {
                T.notify('Lấy sự kiện bị lỗi!', 'danger');
                this.props.history.goBack();
            } else if (data.item) {
                if (data.item.maDonVi == 0 && !currentPermissions.includes('event:write')) {
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

                let categories = (data.categories || []).map(item => ({ id: item.id, text: T.language.parse(item.text, 'vi') }));
                this.location.value(data.item.location || '');
                data.image = data.item.image ? data.item.image : '/img/avatar.png';
                this.imageBox.setData('event:' + (data.item.id ? data.item.id : 'event'), data.item.image);
                this.active.value(data.item.active);
                this.isInternal.value(data.item.isInternal);
                this.displayCover.value(data.item.displayCover);
                this.views.value(data.item.views || '');
                this.maxRegisterUsers.value(data.item.maxRegisterUsers);
                this.createdDate.value(data.item.createdDate);
                this.startPost.value(data.item.startPost);
                this.startEvent.value(data.item.startEvent);

                if (data.item.link) {
                    this.neEventLink.value(data.item.link || '');
                    $(this.eventLink).html(T.rootUrl + '/su-kien/' + data.item.link).attr('href', '/su-kien/' + data.item.link);
                } else {
                    $(this.eventLink).html('').attr('href', '#');
                }

                this.title.value(data.item.title || '');
                this.abstract.value(data.item.abstract || '');
                this.editor.value(data.item.content || '');

                this.setState({ categories, id: data.item.id, createdDate: data.item.createdDate, title: data.item.title }, () => {
                    this.categories.value(data.item.categories || []);
                    if (data.item.form) {
                        this.props.countAnswer(eventId, data.item.form, (numOfRegisterUsers) => {
                            this.setState({ numOfRegisterUsers });
                        });
                    }
                });
            } else {
                this.props.history.push('/user/event/list');
            }
        });
    }

    checkLink = () => {
        this.props.checkLink(this.state.id, this.neEventLink.value());
    }

    changeDisplayCover = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { displayCover: event.target.checked }) });
    }

    eventLinkChange = (e) => {
        if (e.target.value) {
            $(this.eventLink).html(T.rootUrl + '/su-kien/' + e.target.value)
                .attr('href', '/su-kien/' + e.target.value);
        } else {
            $(this.eventLink).html('').attr('href', '#');
        }
    }

    save = () => {
        const permissions = this.getCurrentPermissions();
        const startPost = this.startPost.value() ? this.startPost.value().getTime() : null,
            startEvent = this.startEvent.value() ? this.startEvent.value().getTime() : null;

        if (!startPost) {
            T.notify('Ngày bắt đầu bị trống!', 'danger');
            return this.startPost.focus();
        }

        if (!startEvent) {
            T.notify('Ngày bắt đầu sự kiện bị trống!', 'danger');
            return this.startEvent.focus();
        }

        const changes = {
            categories: this.categories.value().length ? this.categories.value() : ['-1'],
            title: this.title.value(),
            location: this.location.value(),
            link: this.neEventLink.value(),
            active: Number(this.active.value()),
            isInternal: Number(this.isInternal.value()),
            languages: this.homeLanguage.value().join(','),
            abstract: this.abstract.value(),
            content: this.editor.value(),
            maxRegisterUsers: this.maxRegisterUsers.value() || -1,
            displayCover: Number(this.displayCover.value()),
            startPost, startEvent
        };

        let newDraft = {
            title: this.title.value(),
            editorId: this.props.system.user.shcc,
            documentId: this.state.id,
            editorName: this.props.system.user.firstName + ' ' + this.props.system.user.lastName,
            isInternal: Number(this.isInternal.value()),
            documentType: 'event',
            documentJson: JSON.stringify(changes),
        };

        if (permissions.includes('event:write') || permissions.includes('website:write')) {
            this.props.updateEvent(this.state.id, changes);
        }
        else {
            this.props.createDraftEvent(newDraft, () => {
                this.getData();
            });
        }
    }

    render() {
        const currentPermission = this.getCurrentPermissions();
        let readOnly = true;
        const linkDefaultEvent = T.rootUrl + '/event/item/' + this.state.id;
        const route = T.routeMatcher('/user/event/edit/:eventId'),
            eventId = route.parse(window.location.pathname).eventId;
        const docMapper = {};
        if (!docMapper[eventId]) readOnly = false;

        return this.renderPage({
            icon: 'fa fa-edit',
            title: 'Sự kiện: Chỉnh sửa',
            subTitle: <>Tiêu đề: <strong>{T.language.parse(this.state.title, 'vi')}</strong> - {T.dateToText(this.state.createdDate)}</>,
            breadcrumb: [<Link key={0} to='/user/event/list'>Danh sách sự kiện</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormMultipleLanguage ref={e => this.title = e} title='Tên sự kiện' languages={this.state.homeLanguages} FormElement={FormTextBox} readOnly={readOnly} />
                                <FormTextBox ref={e => this.location = e} label='Địa điểm' readOnly={readOnly} />
                                <div className='row'>
                                    <FormImageBox ref={e => this.imageBox = e} className='col-md-6' postUrl='/user/upload' uploadType='EventImage' label='Hình ảnh' />
                                    <div className='col-md-6'>
                                        <FormCheckbox ref={e => this.active = e} label='Kích hoạt' isSwitch inline={false} readOnly={!(currentPermission.includes('event:write') || currentPermission.includes('website:write'))} />
                                        <FormCheckbox ref={e => this.isInternal = e} label='Tin nội bộ' isSwitch inline={false} readOnly={readOnly} />
                                        <FormCheckbox ref={e => this.displayCover = e} label='Hiển thị ảnh bài viết' isSwitch inline={false} readOnly={readOnly} />
                                        <FormTextBox ref={e => this.views = e} label='Lượt xem' readOnly />
                                    </div>
                                </div>
                                <FormTextBox ref={e => this.maxRegisterUsers = e} label='Số lượng người đăng ký tối đa' smallText='Điền -1 nếu không giới hạn số lượng người đăng ký tối đa.' readOnly={readOnly} />

                                <div className='form-group'>
                                    <label className='control-label'>Số lượng người đăng ký tham gia: {this.state.numOfRegisterUsers}</label>
                                </div>

                                <FormSelect ref={e => this.categories = e} label='Danh mục bài viết' data={this.state.categories} readOnly={readOnly} multiple />
                            </div>
                        </div>
                        <div className='tile'>
                            <h3 className='tile-title'>Ngôn ngữ</h3>
                            <div className='tile-body'>
                                <FormSelect ref={e => this.homeLanguage = e} label='Ngôn ngữ truyền thông' data={this.state.languageAdapter} readOnly={readOnly} multiple />
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Link</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.neEventLink = e} label='Link truyền thông' onChange={this.eventLinkChange} />
                                <div>
                                    <a href='#' ref={e => this.eventLink = e} style={{ fontWeight: 'bold' }} target='_blank' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link mặc định</label><br />
                                    <a href={linkDefaultEvent} style={{ fontWeight: 'bold' }} target='_blank' rel="noreferrer">{linkDefaultEvent}</a>
                                </div>
                            </div>
                            <div className='tile-footer'>
                                <button className='btn btn-danger' type='button' onClick={() => this.checkLink()}>
                                    <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <FormDatePicker type='time-mask' ref={e => this.createdDate = e} label='Ngày tạo' readOnly />
                                <FormDatePicker type='time-mask' ref={e => this.startPost = e} label='Ngày bắt đầu đăng sự kiện' readOnly={readOnly} />
                                <FormDatePicker type='time-mask' ref={e => this.startEvent = e} label='Ngày bắt đầu sự kiện' readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <FormMultipleLanguage ref={e => this.abstract = e} tabRender title='Tóm tắt' languages={this.state.homeLanguages} FormElement={FormRichTextBox} />
                                <FormMultipleLanguage ref={e => this.editor = e} tabRender title='Nội dung' languages={this.state.homeLanguages} FormElement={FormEditor} formProps={{ uploadUrl: '/user/upload?category=event' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <Link to={`/user/event/registration/${eventId}`} className='btn btn-warning btn-circle' style={{ position: 'fixed', bottom: 10, right: 70 }}>
                    <i className='fa fa-lg fa-list-alt' />
                </Link>
            </>,
            backRoute: () => this.props.history.goBack(),
            onSave: !readOnly ?  () => this.save() : null
        });
    }
}

const mapStateToProps = state => ({ event: state.event, system: state.system });
const mapActionsToProps = { updateEvent, getEvent, getDraftEvent, checkLink, countAnswer, createDraftEvent, updateDraftEvent, getDmDonVi, getDmNgonNguAll };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(EventEditPage));