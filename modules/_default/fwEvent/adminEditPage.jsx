import React from 'react';
import { connect } from 'react-redux';
import { updateEvent, getEvent, getDraftEvent, checkLink, createDraftEvent, updateDraftEvent } from './redux';
import { countAnswer } from '../fwForm/reduxAnswer';
import { Link, withRouter } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';
import SelectApplyForm from '../fwForm/sectionApplyForm';
import { Select } from 'view/component/Input';

const languageOption = [
    { value: 'vi', text: 'Tiếng Việt' },
    { value: 'en', text: 'Tiếng Anh' }
]

class EventEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, numOfRegisterUsers: 0, displayCover: 1 };
        this.eventLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.table = React.createRef();
        this.formSelector = React.createRef();
        this.language = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/event/list', () => {
            this.getData();
            $('#evEventTitle').focus();
            $('#evEventCategories').select2();
            $('#evEventStartPost').datetimepicker(T.dateFormat);
            // $('#evEventStopPost').datetimepicker(T.dateFormat);
            // $('#evEventStartRegister').datetimepicker(T.dateFormat);
            // $('#evEventStopRegister').datetimepicker(T.dateFormat);
            $('#evEventStartEvent').datetimepicker(T.dateFormat);
            // $('#evEventStopEvent').datetimepicker(T.dateFormat);
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/event/edit/:eventId'),
            IdEvent = route.parse(window.location.pathname).eventId;
        this.props.getEvent(IdEvent, data => {
            if (data.error) {
                T.notify('Lấy sự kiện bị lỗi!', 'danger');
                this.props.history.push('/user/event/list');
            } else if (data.item && data.categories) {
                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text) }));
                $('#evEventCategories').select2({ data: categories }).val(data.item.categories).trigger('change');
                const evEventStartPost = $('#evEventStartPost').datetimepicker(T.dateFormat);
                // const evEventStopPost = $('#evEventStopPost').datetimepicker(T.dateFormat);
                // const evEventStartRegister = $('#evEventStartRegister').datetimepicker(T.dateFormat);
                // const evEventStopRegister = $('#evEventStopRegister').datetimepicker(T.dateFormat);
                const evEventStartEvent = $('#evEventStartEvent').datetimepicker(T.dateFormat);
                // const evEventStopEvent = $('#evEventStopEvent').datetimepicker(T.dateFormat);
                if (data.item.startPost) evEventStartPost.datetimepicker('update', new Date(data.item.startPost));
                // if (data.item.stopPost) evEventStopPost.datetimepicker('update', new Date(data.item.stopPost));
                // if (data.item.startRegister) evEventStartRegister.datetimepicker('update', new Date(data.item.startRegister));
                // if (data.item.stopRegister) evEventStopRegister.datetimepicker('update', new Date(data.item.stopRegister));
                if (data.item.startEvent) evEventStartEvent.datetimepicker('update', new Date(data.item.startEvent));
                // if (data.item.stopEvent) evEventStopEvent.datetimepicker('update', new Date(data.item.stopEvent));
                this.language.current.setVal(data.item.language);
                if (data.item.link) {
                    $(this.eventLink.current).html(T.rootUrl + '/su-kien/' + data.item.link)
                        .attr('href', '/su-kien/' + data.item.link);
                } else {
                    $(this.eventLink.current).html('').attr('href', '#');
                }

                data.image = data.item.image ? data.item.image : '/img/avatar.png';
                this.imageBox.current.setData('event:' + (data.item.id ? data.item.id : 'event'), data.image);

                $('#evEventActive').prop('checked', !!data.item.active);
                $('#evEventIsInternal').prop('checked', !!data.item.isInternal);

                let title = T.language.parse(data.item.title, true),
                    abstract = T.language.parse(data.item.abstract, true),
                    content = data.item.content ? T.language.parse(data.item.content, true) : {};

                $('#evEventViTitle').val(title.vi); $('#evEventEnTitle').val(title.en);
                $('#evEventViAbstract').val(abstract.vi); $('#evEventEnAbstract').val(abstract.en);
                this.viEditor.current.html(content.vi);
                this.enEditor.current.html(content.en);

                // $('#evSocialWorkDay').val(data.item.socialWorkDay);
                // $('#evTrainingPoint').val(data.item.trainingPoint);
                $('#evMaxRegisterUsers').val(data.item.maxRegisterUsers);
                if (!data.item.form) {
                    this.setState({ ...data, numOfRegisterUsers: 0 });
                } else {
                    this.props.countAnswer(IdEvent, data.item.form, (numOfRegisterUsers) => {
                        this.setState(Object.assign({}, data, { numOfRegisterUsers }));
                    });
                }
            } else {
                this.props.history.push('/user/event/list');
            }
        });
    }
    checkLink = (item) => {
        this.props.checkLink(item.id, $('#evEventLink').val().trim());
    }
    changeIsTranslate = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { isTranslate: event.target.checked ? 1 : 0 }) });
    }

    changeDisplayCover = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { displayCover: event.target.checked }) });
    }

    eventLinkChange = (e) => {
        if (e.target.value) {
            $(this.eventLink.current).html(T.rootUrl + '/su-kien/' + e.target.value)
                .attr('href', '/su-kien/' + e.target.value);
        } else {
            $(this.eventLink.current).html('').attr('href', '#');
        }
    }
    save = () => {
        const startPost = $('#evEventStartPost').val() ? T.formatDate($('#evEventStartPost').val()).getTime() : null,
            startEvent = $('#evEventStartEvent').val() ? T.formatDate($('#evEventStartEvent').val()).getTime() : null;

        if (!startPost)
            return $('#evEventStartPost').focus();
        else if (!startEvent)
            return $('#evEventStartEvent').focus();

        const changes = {
            categories: $('#evEventCategories').val().length ? $('#evEventCategories').val() : ['-1'],
            title: JSON.stringify({ vi: $('#evEventViTitle').val(), en: $('#evEventEnTitle').val() }),
            location: $('#evEventLocation').val(),
            link: $('#evEventLink').val().trim(),
            active: $('#evEventActive').is(':checked') ? 1 : 0,
            isInternal: $('#evEventIsInternal').is(':checked') ? 1 : 0,
            abstract: JSON.stringify({ vi: $('#evEventViAbstract').val(), en: $('#evEventEnAbstract').val() }),
            content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
            maxRegisterUsers: $('#evMaxRegisterUsers').val() || -1,
            displayCover: this.state.item.displayCover ? 1 : 0,
            isTranslate: this.state.item.isTranslate ? 1 : 0,
        };
        if (startPost) changes.startPost = startPost;
        if (startEvent) changes.startEvent = startEvent;
        if (!this.state.item.isTranslate) changes.language = this.language.current.getVal() ? this.language.current.getVal() : 'vi';

        let newDraft = {
            title: JSON.stringify({ vi: $('#evEventViTitle').val(), en: $('#evEventEnTitle').val() }),
            editorId: this.props.system.user.id,
            documentId: this.state.item.id,
            editorName: this.props.system.user.firstname,
            isInternal: this.state.item.isInternal,
            documentType: 'event',
            documentJson: JSON.stringify(changes),
        }
        if (this.props.system.user.permissions.includes('event:write') || this.props.system.user.permissions.includes('website:write')) {
            this.props.updateEvent(this.state.item.id, changes, () => {
                $('#evEventLink').val(changes.link)
            })
        }
        else {
            this.props.createDraftEvent(newDraft, result => {
                this.getData();
            });
        }
    }

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const item = this.state.item ? this.state.item : {
            id: '', priority: 1, categories: [], title: '', location: '', socialWorkDay: 0, trainingPoint: 0, displayCover: 1,
            maxRegisterUsers: -1, image: T.url('/image/avatar.png'), createdDate: new Date(), isTranslate: 1,
            startPost: '', stopPost: '', startRegister: '', stopRegister: '', startEvent: '', stopEvent: '', active: false, isInternal: false, view: 0
        };
        let readOnly = true;
        const title = T.language.parse(item.title, true),
            linkDefaultEvent = T.rootUrl + '/event/item/' + item.id;
        const route = T.routeMatcher('/user/event/edit/:eventId'),
            eventId = route.parse(window.location.pathname).eventId;
        const docMapper = {};
        if (!docMapper[eventId]) readOnly = false;
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-edit' /> Sự kiện: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/event/list'>Danh sách sự kiện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên sự kiện</label>
                                    <input className='form-control' type='text' placeholder='Tên sự kiện' id='evEventViTitle' readOnly={readOnly} defaultValue={item.title} />
                                </div>

                                <div className='form-group'>
                                    <label className='control-label'>Events title</label>
                                    <input className='form-control' type='text' placeholder='Events title' id='evEventEnTitle' readOnly={readOnly} defaultValue={title.en} />
                                </div>

                                <div className='form-group'>
                                    <label className='control-label'>Địa điểm</label>
                                    <input className='form-control' type='text' placeholder='Địa điểm' id='evEventLocation' readOnly={readOnly} defaultValue={item.location} />
                                </div>

                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='EventImage' userData='event'
                                            />
                                        </div>
                                    </div>
                                    <div className='col-md-6'>
                                        {currentPermission.includes('website:write') || currentPermission.includes('event:write') ?
                                            <div className='form-group' style={{ display: 'inline-flex', margin: 0 }}>
                                                <label className='control-label'>Kích hoạt:&nbsp;</label>
                                                <div className='toggle'>
                                                    <label>
                                                        <input type='checkbox' id='evEventActive' />
                                                        <span className='button-indecator' />
                                                    </label>
                                                </div>
                                            </div>
                                            : null}
                                        <div className='form-group'>
                                            <label className='control-label'>Tin nội bộ:&nbsp;</label>
                                            <span className='toggle'>
                                                <label>
                                                    <input type='checkbox' id='evEventIsInternal' />
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
                                    <label className='control-label'>Số lượng người đăng ký tối đa</label><br />
                                    <input className='form-control' id='evMaxRegisterUsers' type='number' placeholder='Số lượng người đăng ký tối đa' readOnly={readOnly} defaultValue={item.maxRegisterUsers}
                                        aria-describedby='evMaxRegisterUsersHelp' />
                                    <small className='form-text text-success' id='evMaxRegisterUsersHelp'>Điền -1 nếu không giới hạn số lượng người đăng ký tối đa.</small>
                                </div>
                                <div className='form-group row'>
                                    <label className='control-label col-12'>Số lượng người đăng ký tham gia: {this.state.numOfRegisterUsers}</label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Danh mục sự kiện</label>
                                    <select className='form-control' id='evEventCategories' multiple={true} defaultValue={[]} disabled={readOnly}>
                                        <optgroup label='Lựa chọn danh mục' />
                                    </select>
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
                                <div className='form-group'>
                                    <label className='control-label'>Link mặc định</label><br />
                                    <a href={linkDefaultEvent} style={{ fontWeight: 'bold' }} target='_blank'>{linkDefaultEvent}</a>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link truyền thông</label><br />
                                    <a href='#' ref={this.eventLink} style={{ fontWeight: 'bold' }} target='_blank' />
                                    <input className='form-control' id='evEventLink' type='text' placeholder='Link truyền thông' readOnly={readOnly} defaultValue={item.link} onChange={this.eventLinkChange} />
                                </div>
                            </div>
                            <div className='tile-footer'>
                                <button className='btn btn-danger' type='button' onClick={() => this.checkLink(item)}>
                                    <i className='fa fa-fw fa-lg fa-check-circle' />Kiểm tra link
                                </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Ngày tháng</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày tạo: {T.dateToText(item.createdDate)}</label>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu đăng sự kiện</label>
                                    <input className='form-control' id='evEventStartPost' type='text' autoComplete='off'
                                        placeholder='Ngày bắt đầu đăng sự kiện' defaultValue={item.startPost} disabled={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu sự kiện</label>
                                    <input className='form-control' id='evEventStartEvent' type='text' autoComplete='off'
                                        placeholder='Ngày bắt đầu sự kiện' defaultValue={item.startEvent} disabled={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <ul className='nav nav-tabs'>
                                    <li className='nav-item'>
                                        <a className='nav-link active show' data-toggle='tab' href='#jobsViTab'>Việt Nam</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#jobsEnTab'>English</a>
                                    </li>
                                </ul>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='jobsViTab' className='tab-pane fade show active'>
                                        <label className='control-label'>Tóm tắt sự kiện</label>
                                        <textarea defaultValue='' id='evEventViAbstract' placeholder='Tóm tắt sự kiện'
                                            style={{ border: 'solid 1px #eee', width: '100%', minHeight: '100px', padding: '12px' }} readOnly={readOnly} />
                                        <label className='control-label'>Nội dung sự kiện</label>
                                        <Editor ref={this.viEditor} height='400px' placeholder='Nội dung sự kiện' height={600} uploadUrl='/user/upload?category=event' readOnly={readOnly} />
                                    </div>
                                    <div id='jobsEnTab' className='tab-pane fade'>
                                        <label className='control-label'>Event abstract</label>
                                        <textarea defaultValue='' id='evEventEnAbstract' placeholder='Event abstracts' readOnly={readOnly}
                                            style={{ border: 'solid 1px #eee', width: '100%', minHeight: '100px', padding: '12px' }} />
                                        <label className='control-label'>Event content</label>
                                        <Editor ref={this.enEditor} height='400px' placeholder='Event content' height={600} uploadUrl='/user/upload?category=event' readOnly={readOnly} />
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
                <Link to={`/user/event/registration/${eventId}`} className='btn btn-warning btn-circle' style={{ position: 'fixed', bottom: 10, right: 70 }}>
                    <i className='fa fa-lg fa-list-alt' />
                </Link>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ event: state.event, system: state.system });
const mapActionsToProps = { updateEvent, getEvent, getDraftEvent, checkLink, countAnswer, createDraftEvent, updateDraftEvent };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(EventEditPage));