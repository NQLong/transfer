import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm, deleteFile } from '../redux';
import { getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from '../reduxQuestion';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';
import Select from 'react-select';

const AllQuestionTypes = { text: 'Văn bản', textArea: 'Đoạn văn bản', choice: 'Lựa chọn', multiChoice: 'Đa lựa chọn', date: 'Ngày tháng' };

class QuestionModal extends React.Component {
    constructor(props) {
        super(props);
        let types = Object.keys(AllQuestionTypes).map(key => ({ value: key, label: AllQuestionTypes[key] }));
        this.state = {
            questionTypes: types,
            itemID: null,
            value: [],
            active: false,
        };

        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = React.createRef();
        this.dataType = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#questionTitle').focus()), 250);
        });
    }

    show = (item) => {
        let { title, content, typeName, typeValue, active, rowNums } = item ?
            item : { title: '', content: '', typeName: 'choice', typeValue: [], active: true, rowNums: 3 };
        if (typeof typeValue === 'string')
            typeValue = JSON.parse(typeValue);
        $(this.btnSave.current).data('isNewMember', item == null);
        $('#questionTitle').val(title);
        $('#questionAnswer').val(typeValue.join('\n'));
        $('#questionArea').val(rowNums);
        this.setState({
            selectedItem: { value: typeName, label: AllQuestionTypes[typeName] },
            itemId: item ? item.id : null,
            active: active,
        });
        this.editor.current.html(content ? content : '');
        $(this.modal.current).modal('show');
    };

    hide = () => {
        $(this.modal.current).modal('hide');
    };

    changeActive = (event) => {
        this.setState({ active: event.target.checked });
    };

    onSelectType = (selectedItem) => {
        this.setState({ selectedItem });
    };

    save = (event) => {
        const itemId = this.state.itemId, btnSave = $(this.btnSave.current), isNewMember = btnSave.data('isNewMember');
        const answerString = $('#questionAnswer').val();
        let ret = (answerString ? answerString : '').split('\n');
        for (let i = 0; i < ret.length; i++) {
            if (ret[i] == '') ret.splice(i, 1);
        }

        const changes = {
            title: $('#questionTitle').val().trim(),
            content: this.editor.current.html(),
            active: this.state.active ? 1 : 0,
            typeName: this.state.selectedItem ? this.state.selectedItem.value : null,
            typeValue: JSON.stringify(ret),
            rowNums: $('#questionArea').val(),
        };

        if (changes.title == '') {
            T.notify('Tên câu hỏi bị trống', 'danger');
            $('#questionTitle').focus();
        } else if (changes.typeName == '' || !changes.typeName) {
            T.notify('Loại câu hỏi bị trống!', 'danger');
        } else if (changes.typeName == 'textArea' && !changes.rowNums) {
            T.notify('Độ rộng ô trả lời bị trống', 'danger');
            $('#questionArea').focus();
        } else {
            if (isNewMember) {
                this.props.add(changes);
                this.hide();
            } else {
                const updateChanges = changes;
                if (updateChanges.typeValue.length == 0 || updateChanges.typeValue[0] == '') updateChanges.typeValue = 'empty';
                this.props.update(itemId, updateChanges);
                this.hide();
            }
        }
        event.preventDefault();
    };

    render() {
        const select = this.state.selectedItem;
        let isChoice = select && select.value && (select.value == 'choice' || select.value == 'multiChoice');
        let isTextarea = select && select.value && (select.value == 'textArea');

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={e => this.save(e, this.state.itemId, true)}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin câu hỏi</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group row'>
                                <div className='col-12' style={{ marginBottom: '15px' }}>
                                    <div className='row'>
                                        <div className='col'>
                                            <label htmlFor='questionTitle'>Tên câu hỏi</label>
                                            <input type='text' className='form-control' id='questionTitle' />
                                        </div>
                                        <div className='col-auto'>
                                            <label>Kích hoạt</label>
                                            <div className='col-12 col-sm-12 toggle'>
                                                <label>
                                                    <input type='checkbox' checked={this.state.active} onChange={this.changeActive} /><span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col'>
                                    <label htmlFor=''>Loại câu hỏi</label>
                                    <Select options={this.state.questionTypes} onChange={this.onSelectType} value={this.state.selectedItem} />
                                </div>
                                <div className='col' style={{ display: isTextarea ? 'block' : 'none' }}>
                                    <label htmlFor=''>Độ rộng</label>
                                    <input type='number' className='form-control' id='questionArea' />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='row'>
                                    <div className='col-12'>
                                        <label htmlFor=''>Nội dung câu hỏi</label>
                                        <Editor ref={this.editor} uploadUrl='/user/upload?category=question' height={300} />
                                    </div>
                                </div>
                            </div>

                            <div className='form-group' style={{ display: isChoice ? 'block' : 'none' }}>
                                <div className='row'>
                                    <div className='col-12'>
                                        <label>Danh sách câu trả lời</label>
                                        <textarea defaultValue=''
                                            className='form-control' id='questionAnswer' style={{ width: '100%', minHeight: '100px', padding: '0 3px' }} />
                                        <small className='text-primary'>Ví dụ câu hỏi có 4 lựa chọn, điền mỗi lựa chọn vào từng dòng theo thứ tự A, B, C, D</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-success' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class FormEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: null,
            numOfRegisterUsers: 0,
        };
        this.imageBox = React.createRef();

        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.questionModal = React.createRef();
    }

    componentDidMount() {
        $('#formViTitle').focus();
        $('#formStartRegister').datetimepicker(T.dateFormat);
        $('#formStopRegister').datetimepicker(T.dateFormat);

        T.ready('/user/form/list');
        $(document).ready(() => {
            const route = T.routeMatcher('/user/form/edit/:formId'),
                formId = route.parse(window.location.pathname).formId;
            this.props.getQuestionsList(formId);
            this.props.getForm(formId, data => {
                if (data.error) {
                    this.props.history.push('/user/form/list');
                } else if (data.item) {
                    const formStartRegister = $('#formStartRegister').datetimepicker(T.dateFormat);
                    const formStopRegister = $('#formStopRegister').datetimepicker(T.dateFormat);

                    if (data.item.startRegister) formStartRegister.datetimepicker('update', new Date(data.item.startRegister));
                    if (data.item.stopRegister) formStopRegister.datetimepicker('update', new Date(data.item.stopRegister));

                    $('#formActive').prop('checked', data.item.active);
                    $('#formLock').prop('checked', data.item.isLocked);
                    this.imageBox.current.setData('form:' + data.item.id, data.item.image ? data.item.image : '/img/avatar.png');

                    let title = T.language.parse(data.item.title, true), description = data.item.description ? T.language.parse(data.item.description, true) : '';
                    $('#formHeaderTitle').html(title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(data.item.createdDate) : '');
                    $('#formViTitle').val(title.vi);
                    $('#formEnTitle').val(title.en);
                    description && this.viEditor.current.html(description.vi);
                    description && this.enEditor.current.html(description.en);

                    $('#formMaxRegisterUsers').val(data.item.maxRegisterUsers);
                    this.setState({ item: data.item });
                } else {
                    this.props.history.push('/user/form/list');
                }
            });
        });
    }

    save = () => {
        const
            startRegister = $('#formStartRegister').val(),
            stopRegister = $('#formStopRegister').val(),
            changes = {
                title: JSON.stringify({ vi: $('#formViTitle').val(), en: $('#formEnTitle').val() }),
                active: $('#formActive').is(':checked') ? 1 : 0,
                isLocked: $('#formLock').is(':checked') ? 1 : 0,
                description: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
                maxRegisterUsers: $('#formMaxRegisterUsers').val() || -1,
                startRegister: startRegister ? T.formatDate(startRegister).getTime() : 0,
                stopRegister: stopRegister ? T.formatDate(stopRegister).getTime() : 0
            };
        this.props.updateForm(this.state.item.id, changes, () => {
            T.notify('Cập nhật thông tin bảng câu hỏi thành công!', 'success');
        });
    };

    addQuestion = (data) => {
        this.props.createQuestion(this.state.item.id, data, () => {
            T.notify('Thêm câu hỏi thành công!', 'info');
        });
    };

    updateQuestion = (id, changes) => {
        this.props.updateQuestion(id, changes, this.state.item.id, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'info');
        });
    };

    swap = (e, item, isMoveUp) => {
        let questionList = this.props.question && this.props.question.questions ? this.props.question.questions : [];
        if (questionList.length == 1) {
            T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
        } else {
            this.props.swapQuestion(item.id, this.state.item.id, isMoveUp, () => {
                T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
            });
        }
        e.preventDefault();
    };

    removeQuestion = (e, item,) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title ? item.title.viText() : 'này'}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                this.props.deleteQuestion(item.id, this.state.item.id, () => {
                    T.alert('Xoá câu hỏi thành công!', 'success', false, 1000);
                });
            } else {
                T.alert('Cancelled!', 'error', false, 500);
            }
        });
        e.preventDefault();
    };

    showModal = (e, item) => {
        this.questionModal.current.show(item);
        e.preventDefault();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('form:write');
        const questionList = this.props.question && this.props.question.questions ? this.props.question.questions : [];
        const questionTable = questionList && questionList.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <th style={{ width: '100%', textAlign: 'center' }}>Câu hỏi</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Loại</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        {!readOnly ? <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {questionList.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{!readOnly ? <a href='#' onClick={e => this.showModal(e, item)}>{item.title}</a> : item.title}</td>
                            <td nowrap='true'>{AllQuestionTypes[item.typeName]}</td>
                            <td className='toggle' style={{ textAlign: 'center' }}>
                                <label>
                                    <input type='checkbox' checked={item.active === 1 ? true : false} disabled={readOnly} onChange={() => this.updateQuestion(item.id, { active: item.active === 1 ? 0 : 1 })} /><span className='button-indecator' />
                                </label>
                            </td>
                            {!readOnly ?
                                <td className='btn-group'>
                                    <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                        <i className='fa fa-lg fa-arrow-up' />
                                    </a>
                                    <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                        <i className='fa fa-lg fa-arrow-down' />
                                    </a>
                                    <button type='button' className='btn btn-primary'
                                        onClick={e => this.showModal(e, item)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                    <button type='button' className='btn btn-danger' onClick={e => this.removeQuestion(e, item, index)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </td> : null
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p>Không có câu hỏi</p>;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-edit' /> Bảng câu hỏi: Chỉnh sửa</h1>
                        <p id='formHeaderTitle' />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin bảng câu hỏi</h3>
                            <div className='tile-body'>
                                <ul className='nav nav-tabs'>
                                    <li className='nav-item'>
                                        <a className='nav-link active show' data-toggle='tab' href='#formViTab'>Việt Nam</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#formEnTab'>English</a>
                                    </li>
                                </ul>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='formViTab' className='tab-pane fade show active'>
                                        <div className='form-group'>
                                            <label className='control-label'>Tên bảng câu hỏi</label>
                                            <input className='form-control' type='text' placeholder='Tên form' id='formViTitle' readOnly={readOnly} />
                                        </div>
                                        <label className='control-label'>Mô tả bảng câu hỏi</label>
                                        <Editor ref={this.viEditor} height={200} uploadUrl='/user/upload?category=form' readOnly={readOnly} />
                                    </div>
                                    <div id='formEnTab' className='tab-pane fade'>
                                        <div className='form-group'>
                                            <label className='control-label'>Form title</label>
                                            <input className='form-control' type='text' placeholder='Form title' id='formEnTitle' readOnly={readOnly} />
                                        </div>
                                        <label className='control-label'>Form description</label>
                                        <Editor ref={this.enEditor} height={200} uploadUrl='/user/upload?category=form' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Điều khiển bảng câu hỏi</h3>
                            <div className='tile-body'>

                                <div className='row'>
                                    <div className='col-md-8'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh nền</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='FormImage' readOnly={readOnly} />
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Kích hoạt:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' id='formActive' disabled={readOnly} /><span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                        <br />
                                        <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Khóa bảng câu hỏi:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' id='formLock' disabled={readOnly} /><span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Danh sách câu hỏi</h3>
                            <div className='tile-body'>
                                {questionTable}
                            </div>
                            {!readOnly ?
                                <button type='button' className='btn btn-primary' style={{ position: 'absolute', right: '30px', top: '10px' }} onClick={e => this.showModal(e, null)}>
                                    Thêm câu hỏi
                                </button> : null
                            }
                        </div>
                    </div>
                </div>
                <button className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }} onClick={() => this.props.history.goBack()}>
                    <i className='fa fa-lg fa-reply' />
                </button>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
                <QuestionModal key={1} add={this.addQuestion} update={this.updateQuestion} ref={this.questionModal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, question: state.reduxQuestion, system: state.system });
const mapActionsToProps = {
    getForm, updateForm, deleteFile,
    getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion
};
export default connect(mapStateToProps, mapActionsToProps)(FormEditPage);
