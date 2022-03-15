import React from 'react';
import { connect } from 'react-redux';
import { updateAnswer } from '../../reduxAnswer';
import AdminRegisterElement from './AdminRegisterElement';

class EditAnswerModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();

        this.valueList = [];
        for (let i = 0; i < 300; i++) {
            this.valueList[i] = React.createRef();
        }

        this.state = { item: null };
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('hidden.bs.modal', () => {
                this.setState({ item: null });
            });
        });
    }

    show = (item, answers) => {
        this.setState({ item: { ...item, record: answers } });
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).modal('show'), 250);
        });
    };

    hide = () => {
        $(this.modal.current).modal('hide');
    };

    save = (e, item) => {
        const questionList = this.props.questions ? this.props.questions : [];
        let record = this.state.item.record;
        let i = 0;
        if (i == questionList.length) {
            const changes = { record };
            this.props.updateAnswer(item.id, changes, () => {
                T.notify('Thay đổi câu trả lời thành công!', 'success');
                this.hide();
            });
        } else {
            T.notify('Chỉnh sửa đăng ký tham gia bị lỗi!', 'danger');
        }
        e.preventDefault();
    };

    render() {
        if (this.state.item) {
            const item = this.state.item;
            const questionList = this.props.questions ? this.props.questions : [];
            let readOnly = this.props.readOnly;
            const createForm = (record) => {
                let answers = {};
                record.map(item => answers[item.questionId] = { answer: item.answer });
                if (!questionList || questionList.length == 0) {
                    readOnly = true;
                    return <p>Đã đăng ký</p>;
                }
                let form = [];
                for (let i = 0; i < questionList.length; i++) {
                    form.push(<AdminRegisterElement key={item.id + i} ref={this.valueList[i]} element={questionList[i]} index={i}
                        answer={answers[questionList[i].id].answer} score={answers[questionList[i].id].score} readOnly={true} />);
                }

                return form;
            };

            return (
                <div className='modal' tabIndex='-1' role='dialog' data-backdrop='static' ref={this.modal}>
                    <form className='modal-dialog' style={{ maxWidth: '40%' }} role='document'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Chi tiết đăng ký</h5>
                                <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                    <span aria-hidden='true'>&times;</span>
                                </button>
                            </div>
                            <div className='modal-body'>
                                <div className=''>
                                    {createForm(item && item.record ? item.record : [])}
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                                {!readOnly ? <button type='button' className='btn btn-success' onClick={e => this.save(e, item)}>Lưu</button> : ''}
                            </div>
                        </div>
                    </form>
                </div>
            );
        } else {
            return null;
        }

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateAnswer };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(EditAnswerModal);
