import React from 'react';
import { connect } from 'react-redux';
import { getDraftEvent, checkLink, createDraftEvent, updateDraftEvent } from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';
import SelectApplyForm from '../fwForm/sectionApplyForm';

class DraftEventEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, numOfRegisterUsers: 0, draft: false, draftId: '' };
        this.eventLink = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.table = React.createRef();
        this.formSelector = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/event/draft', () => {
            this.getData();
            $('#evEventTitle').focus();
            $('#evEventCategories').select2();
            $('#evEventStartPost').datetimepicker(T.dateFormat);
            $('#evEventStopPost').datetimepicker(T.dateFormat);
            $('#evEventStartRegister').datetimepicker(T.dateFormat);
            $('#evEventStopRegister').datetimepicker(T.dateFormat);
            $('#evEventStartEvent').datetimepicker(T.dateFormat);
            $('#evEventStopEvent').datetimepicker(T.dateFormat);
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/event/draft/edit/:eventId'),
            IdEvent = route.parse(window.location.pathname).eventId;
        this.setState({ draftId: IdEvent });
        this.props.getDraftEvent(IdEvent, data => {
            if (data.error) {
                T.notify('Lấy bản nháp sự kiện bị lỗi!', 'danger');
                this.props.history.push('/user/event/draft');
            } else if (data.categories && data.item) {
                const contentEvent = JSON.parse(data.item.documentJson);
                let categories = data.categories.map(item => ({ id: item.id, text: T.language.parse(item.text) }));
                $('#evEventCategories').select2({ data: categories }).val(contentEvent.categories).trigger('change');

                const evEventStartPost = $('#evEventStartPost').datetimepicker(T.dateFormat);
                const evEventStopPost = $('#evEventStopPost').datetimepicker(T.dateFormat);
                const evEventStartRegister = $('#evEventStartRegister').datetimepicker(T.dateFormat);
                const evEventStopRegister = $('#evEventStopRegister').datetimepicker(T.dateFormat);
                const evEventStartEvent = $('#evEventStartEvent').datetimepicker(T.dateFormat);
                const evEventStopEvent = $('#evEventStopEvent').datetimepicker(T.dateFormat);
                if (contentEvent.startPost) evEventStartPost.datetimepicker('update', new Date(contentEvent.startPost));
                if (contentEvent.stopPost) evEventStopPost.datetimepicker('update', new Date(contentEvent.stopPost));
                if (contentEvent.startRegister) evEventStartRegister.datetimepicker('update', new Date(contentEvent.startRegister));
                if (contentEvent.stopRegister) evEventStopRegister.datetimepicker('update', new Date(contentEvent.stopRegister));
                if (contentEvent.startEvent) evEventStartEvent.datetimepicker('update', new Date(contentEvent.startEvent));
                if (contentEvent.stopEvent) evEventStopEvent.datetimepicker('update', new Date(contentEvent.stopEvent));
                if (contentEvent.link) {
                    $(this.eventLink.current).html(T.rootUrl + '/su-kien/' + contentEvent.link).attr('href', '/su-kien/' + contentEvent.link);
                } else {
                    $(this.eventLink.current).html('').attr('href', '#');
                }
                data.image = data.item.image ? data.item.image : '/image/avatar.png';
                data.location = contentEvent.location ? contentEvent.location : '';
                this.imageBox.current.setData('event:' + (data.item.id ? data.item.id : 'new'), data.image);

                let title = T.language.parse(data.item.title, true),
                    abstract = T.language.parse(contentEvent.abstract, true),
                    content = T.language.parse(contentEvent.content, true);

                $('#evEventViTitle').val(title.vi); $('#evEventEnTitle').val(title.en);
                $('#evEventViAbstract').val(abstract.vi); $('#evEventEnAbstract').val(abstract.en);
                $('#evEventLocation').val(contentEvent.location);
                this.viEditor.current.html(content.vi); this.enEditor.current.html(content.en);
                $('#evMaxRegisterUsers').val(contentEvent.maxRegisterUsers);
                $('#evTrainingPoint').val(contentEvent.trainingPoint);
                $('#evSocialWorkDay').val(contentEvent.socialWorkDay);
                this.setState(data);
            } else {
                this.props.history.push('/user/event/draft');
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
        this.props.checkLink(item.id, $('#evEventLink').val().trim());
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
            stopPost = $('#evEventStopPost').val() ? T.formatDate($('#evEventStopPost').val()).getTime() : null,
            startRegister = $('#evEventStartRegister').val() ? T.formatDate($('#evEventStartRegister').val()).getTime() : null,
            stopRegister = $('#evEventStopRegister').val() ? T.formatDate($('#evEventStopRegister').val()).getTime() : null,
            startEvent = $('#evEventStartEvent').val() ? T.formatDate($('#evEventStartEvent').val()).getTime() : null,
            stopEvent = $('#evEventStopEvent').val() ? T.formatDate($('#evEventStopEvent').val()).getTime() : null;

        if (!startPost)
            return $('#evEventStartPost').focus();
        // else if (!startRegister)
        //     return $('#evEventStartRegister').focus();
        else if (!startEvent)
            return $('#evEventStartEvent').focus();

        if (!stopEvent) {
            if (stopPost) {
                if (startPost > stopPost) {
                    T.notify('Thời gian bắt đầu đăng bài phải trước thời gian dừng đăng bài', 'info');
                    $('#evEventStartPost').focus();
                    return;
                }
                if (startRegister > stopPost) {
                    T.notify('Thời gian bắt đầu đăng ký phải trước thời gian dừng đăng bài', 'info');
                    $('#evEventStartRegister').focus();
                    return;
                }
            }
            if (stopRegister) {
                if (startRegister > stopRegister) {
                    T.notify('Thời gian bắt đầu đăng ký phải trước thời gian dừng đăng ký', 'info');
                    $('#evEventStartRegister').focus();
                    return;
                }
            }
        } else {
            if (startPost > stopPost) {
                T.notify('Thời gian bắt đầu đăng bài phải trước thời gian dừng đăng bài', 'info');
                $('#evEventStartPost').focus();
                return;
            }
            if (startRegister > stopRegister) {
                T.notify('Thời gian bắt đầu đăng ký phải trước thời gian dừng đăng ký', 'info');
                $('#evEventStartRegister').focus();
                return;
            }
            if (startEvent > stopEvent) {
                T.notify('Thời gian bắt đầu sự kiện phải trước thời gian kết thúc sự kiện', 'info');
                $('#evEventStartEvent').focus();
                return;
            }
            if (startRegister > stopEvent) {
                T.notify('Thời gian bắt đầu đăng ký phải trước thời gian kết thúc sự kiện', 'info');
                $('#evEventStartRegister').focus();
                return;
            }
            if (startPost > stopEvent) {
                T.notify('Thời gian bắt đầu đăng bài phải trước thời gian kết thúc sự kiện', 'info');
                $('#evEventStartPost').focus();
                return;
            }
            if (stopRegister > stopPost) {
                T.notify('Thời gian dừng đăng ký phải trước thời gian kết thúc đăng bài', 'info');
                $('#evEventStartPost').focus();
                return;
            }
        }
        const changes = {
            categories: $('#evEventCategories').val().length ? $('#evEventCategories').val() : ['-1'],
            title: JSON.stringify({ vi: $('#evEventViTitle').val(), en: $('#evEventEnTitle').val() }),
            location: $('#evEventLocation').val(),
            link: $('#evEventLink').val().trim(),
            abstract: JSON.stringify({ vi: $('#evEventViAbstract').val(), en: $('#evEventEnAbstract').val() }),
            content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
            maxRegisterUsers: $('#evMaxRegisterUsers').val(),
            trainingPoint: $('#evTrainingPoint').val(),
            socialWorkDay: $('#evSocialWorkDay').val(),
            form: this.formSelector.current.getValue()
        };
        if (startPost) changes.startPost = startPost;
        if (stopPost) changes.stopPost = stopPost;
        if (startRegister) changes.startRegister = startRegister;
        if (stopRegister) changes.stopRegister = stopRegister;
        if (startEvent) changes.startEvent = startEvent;
        if (stopEvent) changes.stopEvent = stopEvent;
        let newDraft = {
            title: JSON.stringify({ vi: $('#evEventViTitle').val(), en: $('#evEventEnTitle').val() }),
            editorId: this.props.system.user.shcc,
            editorName: 'Tester',
            documentType: 'event',
            isInternal: this.state.item.isInternal ? 1 : 0,
            documentJson: JSON.stringify(changes),
            lastModified: new Date().getTime(),
        };
        if (this.props.system.user.permissions.includes('event:write')) {
            delete newDraft.editorId; delete newDraft.editorName;
        }
        this.props.updateDraftEvent(this.state.draftId, newDraft, () => { });
    }

    render() {
        // const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = false;
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const item = this.state.item ? this.state.item : {
            id: '', priority: 1, categories: [], title: '', location: '',
            maxRegisterUsers: -1, image: T.url('/image/avatar.png'), createdDate: new Date().getTime(),
            startPost: '', stopPost: '', startRegister: '', stopRegister: '', startEvent: '', stopEvent: '', active: false, isInternal: false, views: 0
        };
        const title = T.language.parse(item.title, true),
            linkDefaultEvent = T.rootUrl + '/event/item/' + item.id;
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
                                    <div className='col-md-6 form-group'>
                                        <label className='control-label'>Hình ảnh</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='EventDraftImage' readOnly={readOnly} />
                                    </div>
                                    <div className='col-md-6 form-group'>
                                        <label className='control-label'>Tin nội bộ:&nbsp;</label>
                                        <span className='toggle'>
                                            <label>
                                                <input type='checkbox' checked={item.isInternal} onChange={this.changeisInternal} disabled={readOnly} />
                                                <span className='button-indecator' />
                                            </label>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Số lượng người đăng ký tối đa</label><br />
                                    <input className='form-control' id='evMaxRegisterUsers' type='number' placeholder='Số lượng người đăng ký tối đa' readOnly={readOnly} defaultValue={item.maxRegisterUsers}
                                        aria-describedby='evMaxRegisterUsersHelp' />
                                    <small className='form-text text-success' id='evMaxRegisterUsersHelp'>Điền -1 nếu không giới hạn số lượng người đăng ký tối đa.</small>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Số lượng người đăng ký tham gia: {this.state.numOfRegisterUsers}</label>
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
                            <h3 className='tile-title'>Hoạt động sinh viên</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Điểm rèn luyện</label>
                                    <input className='form-control' type='number' placeholder='Điểm rèn luyện' id='evTrainingPoint' defaultValue={item.trainingPoint} disabled={readOnly} />
                                    <label className='control-label'>Ngày công tác xã hội</label>
                                    <input className='form-control' type='number' placeholder='Ngày công tác xã hội' id='evSocialWorkDay' defaultValue={item.socialWorkDay} step='0.5' disabled={readOnly} />
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
                                    <a href={linkDefaultEvent} style={{ fontWeight: 'bold' }} target='_blank' rel="noreferrer">{linkDefaultEvent}</a>
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
                                    <input className='form-control' id='evEventStartPost' type='text' placeholder='Ngày bắt đầu đăng sự kiện' autoComplete='off'
                                        disabled={readOnly} defaultValue={item.startPost} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày kết thúc đăng sự kiện</label>
                                    <input className='form-control' id='evEventStopPost' type='text' placeholder='Ngày kết thúc đăng sự kiện' autoComplete='off'
                                        disabled={readOnly} defaultValue={item.stopPost} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu đăng ký tham gia sự kiện</label>
                                    <input className='form-control' id='evEventStartRegister' type='text' placeholder='Ngày bắt đầu đăng ký tham gia sự kiện' autoComplete='off'
                                        disabled={readOnly} defaultValue={item.startRegister} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày kết thúc đăng ký tham gia sự kiện</label>
                                    <input className='form-control' id='evEventStopRegister' type='text' placeholder='Ngày kết thúc đăng ký tham gia sự kiện' autoComplete='off'
                                        disabled={readOnly} defaultValue={item.stopRegister} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày bắt đầu sự kiện</label>
                                    <input className='form-control' id='evEventStartEvent' type='text' placeholder='Ngày bắt đầu sự kiện' autoComplete='off'
                                        disabled={readOnly} defaultValue={item.startEvent} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Ngày kết thúc sự kiện</label>
                                    <input className='form-control' id='evEventStopEvent' type='text' placeholder='Ngày kết thúc sự kiện' autoComplete='off'
                                        disabled={readOnly} defaultValue={item.stopEvent} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <SelectApplyForm ref={this.formSelector} formId={item.form} title='Chọn bảng câu hỏi' currentPermission={currentPermissions} />
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
                                        <textarea defaultValue='' className='form-control' id='evEventViAbstract' placeholder='Tóm tắt sự kiện' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>Nội dung sự kiện</label>
                                        <Editor ref={this.viEditor} placeholder='Nội dung sự kiện' height={600} uploadUrl='/user/upload?category=event' readOnly={readOnly} />
                                    </div>
                                    <div id='jobsEnTab' className='tab-pane fade'>
                                        <label className='control-label'>Event abstract</label>
                                        <textarea defaultValue='' className='form-control' id='evEventEnAbstract' placeholder='Event abstracts' readOnly={readOnly}
                                            style={{ minHeight: '100px', marginBottom: '12px' }} />
                                        <label className='control-label'>Event content</label>
                                        <Editor ref={this.enEditor} placeholder='Event content' height={600} uploadUrl='/user/upload?category=event' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to={'/user/event/draft'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
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
const mapActionsToProps = { getDraftEvent, checkLink, createDraftEvent, updateDraftEvent };
export default connect(mapStateToProps, mapActionsToProps)(DraftEventEditPage);
