import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from '../fwForm/redux';
import { getQuestionsList } from '../fwForm/reduxQuestion';
import { getAnswerInPage, getAnswer, updateAnswer, deleteAnswer } from '../fwForm/reduxAnswer';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { getEvent } from './redux';

import EditAnswerModal from '../fwForm/admin/modal/EditAnswerModal';
import AddAnswerModal from '../fwForm/admin/modal/AddAnswerModal';
// import ImportStudentModal from '../fwForm/admin/modal/ImportStudentModal';

class adminRegistrationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };

        this.editModal = React.createRef();
        this.addModal = React.createRef();
        this.importModal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/event/list', () => {
            const route = T.routeMatcher('/user/event/registration/:eventId'),
                eventId = route.parse(window.location.pathname).eventId;
            this.props.getEvent(eventId, data => {
                if (data.error) {
                    this.props.history.push('/user/event/list');
                } else if (data.item) {
                    data.item.form && this.props.getQuestionsList(data.item.form);
                    this.props.getAnswerInPage(eventId, data.item.form);
                    this.setState(data);
                } else {
                    this.props.history.push('/user/event/list');
                }
            });
        });
    }

    addNew = (e) => {
        this.addModal.current.show();
        e.preventDefault();
    };

    showEdit = (e, item) => {
        this.props.getAnswer(item.id, answers => {
            this.editModal.current.show(item, answers);
        });
        e.preventDefault();
    };

    getPage = (pageNumber, pageSize) => {
        const formId = this.state.item.id;
        this.props.getAnswerInPage(formId, pageNumber, pageSize);
    };

    remove = (e, id) => {
        T.confirm('Xoá câu trả lời', 'Bạn có chắc muốn xóa câu trả lời này?', 'info', isConfirm => {
            isConfirm && this.props.deleteAnswer(id, this.state.item.id, this.state.item.form);
        });
    };

    // export = (e, fileName) => {
    //     this.props.exportRegisters(this.state.item.id, fileName);
    // };

    createRow = (list, pageNumber, pageSize, readOnly) => {
        return list.map((item, index) => {
            return (
                <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap' }}>{(Math.max(pageNumber, 1) - 1) * pageSize + index + 1}</td>
                    <td style={{ whileSpace: 'nowrap' }}>
                        {!readOnly ? (
                            <a href='#' onClick={e => this.showEdit(e, item)}>{item.userAnswer}</a>
                        ) : item.userAnswer}
                    </td>
                    {/* <td style={{ whiteSpace: 'nowrap' }}>{item.startTimer ? T.dateToText(item.startTimer, 'HH:MM:ss dd/mm/yyyy') : ''}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.endTimer ? T.dateToText(item.endTimer, 'HH:MM:ss dd/mm/yyyy') : ''}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.lastSavingDate ? T.dateToText(item.lastSavingDate, 'HH:MM:ss dd/mm/yyyy') : ''}</td> */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                        {item.answeredDate ? T.dateToText(new Date(item.answeredDate).getTime() >= new Date(item.endTimer).getTime() ? item.endTimer : item.answeredDate, 'HH:MM:ss dd/mm/yyyy') :
                            (new Date().getTime() >= new Date(item.endTimer).getTime() ? T.dateToText(item.endTimer, 'HH:MM:ss dd/mm/yyyy') : 'Chưa nộp bài')
                        }
                    </td>
                    {/* <td style={{ whiteSpace: 'nowrap' }}>{item.finalScore ? item.finalScore : 'Chưa chấm điểm'}</td> */}
                    {!readOnly ? (
                        <td key='action' className='btn-group'>
                            <button type='button' className='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Chỉnh sửa câu trả lời'
                                onClick={e => this.showEdit(e, item)}>
                                <i className='fa fa-lg fa-edit' />
                            </button>
                            <button type='button' className='btn btn-danger' onClick={e => this.remove(e, item.id)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </td>
                    ) : null}
                </tr>
            );
        });
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('form:write');
        const item = this.state.item ? this.state.item : { id: '', title: '', createdDate: new Date(), maxRegisterUsers: -1 };
        const title = T.language.parse(item.title, true);
        const questions = this.props.question && this.props.question.questions ? this.props.question.questions : [];
        const { totalItem, pageSize, pageTotal, pageNumber, list } = this.props.answer && this.props.answer.page ?
            this.props.answer.page : { totalItem: 0, pageSize: 50, pageTotal: 0, pageNumber: 1, list: [] };
        const table = list && list.length > 0 ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>STT</th>
                        <th style={{ width: '40%', whileSpace: 'nowrap', verticalAlign: 'middle' }}>Email</th>
                        <th style={{ width: '60%', whileSpace: 'nowrap', textAlign: 'center' }}>Thời gian đăng ký</th>
                        {/* <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} rowSpan={2}>Điểm</th> */}
                        {!readOnly ? (
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Thao tác</th>
                        ) : null}
                    </tr>
                </thead>
                <tbody>
                    {this.createRow(list, pageNumber, pageSize, readOnly)}
                </tbody>
            </table>
        ) : <p>Không có đăng ký nào</p>;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-edit' /> Sự kiện: Danh sách đăng ký</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                </div>

                <div className='row'>
                    <div className='col-md-12'>
                        <div className='tile'>
                            {table}
                        </div>
                    </div>
                </div>

                <Pagination name='pageAnswer' style={{ marginLeft: '75px' }}
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.getPage} />

                <Link to='/user/event/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <EditAnswerModal ref={this.editModal} questions={questions} readOnly={!currentPermission.contains('form:write')} />
                <AddAnswerModal ref={this.addModal} questions={questions} eventId={item.id} readOnly={!currentPermission.contains('form:write')} />

                <Link className='btn btn-success btn-circle' style={{ position: 'fixed', bottom: '10px', right: '5px' }} to={'/user/event/edit/' + item.id}>
                    <i className='fa fa-lg fa-edit' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, question: state.reduxQuestion, answer: state.reduxAnswer, system: state.system, event: state.event });
const mapActionsToProps = { getForm, updateForm, getQuestionsList, getAnswerInPage, getAnswer, updateAnswer, deleteAnswer, getEvent };
export default connect(mapStateToProps, mapActionsToProps)(adminRegistrationPage);
