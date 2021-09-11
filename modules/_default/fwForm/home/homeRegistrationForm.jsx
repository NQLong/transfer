import './theme/icheck-material-custom.min.css';
import './theme/icheck-material.min.css';
import React from 'react';
import { connect } from 'react-redux';
import { addAnswerByUser, checkHasAnswered } from '../reduxAnswer';
import { getQuestionInPageByUser, getQuestionAllByUser } from '../reduxQuestion';
import { Link } from 'react-router-dom';

const texts = {
    vi: {
        register: 'Đăng ký form',
        notDated: 'Chưa đến ngày đăng ký',
        overDated: 'Đã quá hạn đăng ký',
        noForm: 'Không có câu hỏi nào từ form này',
        registerAction: 'Đăng ký tham gia',
        notLoggedIn: 'Bạn chưa đăng nhập!',
        askLogin: 'Đăng nhập?',
        next: 'Tiếp tục',
        hasRecorded: <p className='text-success font-weight-bold'>Đăng ký của bạn đã được ghi lại!</p>,
        hasAnswered: <p className='text-success font-weight-bold'>Bạn đã hoàn thành đăng ký!</p>,
        errorOccured: 'Đã xảy ra lỗi'
    },
    en: {
        register: 'Register form',
        notDated: 'Form not opened yet',
        overDated: 'This form is overdue',
        noForm: 'No question from this form',
        registerAction: 'Submit register',
        notLoggedIn: 'You haven\'t logged in yet!',
        askLogin: 'Login?',
        next: 'Next',
        hasRecorded: <p className='text-success font-weight-bold'>Your registration have been recorded!</p>,
        hasAnswered: <p className='text-success font-weight-bold'>You have registered for this event!</p>,
        errorOccured: 'An error occured'
    }
};

class RegisterElement extends React.Component {
    constructor(props) {
        super(props);

        this.value = React.createRef();
        this.state = { selectedValue: null };
    }

    componentDidMount() {
        $(document).ready(() => {
        });
    }

    onSelectType = (selectedItem) => {
        this.setState({ selectedValue: selectedItem.value });
    }

    onSiteChanged = (e) => {
        this.setState({ selectedValue: e.target.value }, () => {
            this.props.countAnswer();
        });
    }

    getValue = () => {
        const element = this.props.element ? this.props.element : {};
        if (element && element.active === false) {
            return '';
        } else if (element && element.typeName === 'choice') {
            return this.state.selectedValue ? this.state.selectedValue : '';
        }
        else {
            return $(this.value.current).val();
        }
    }

    setFocus = (e) => {
        $(this.value.current).focus();
        e.preventDefault();
    }

    render() {
        const item = this.props.element ? this.props.element : {
            id: '', content: '', active: 0, typeName: '', typeValue: [], rowNum: 3, speakDuration: 30
        },
            questionContent =
                <div className='row'>
                    <div className='col-xs'>
                        <p className='content-style' dangerouslySetInnerHTML={{ __html: item.content }} />
                    </div>
                </div>;
        if (item.active) {
            if (item.typeName == 'choice') {
                return <div className='form-group w-100'>
                    {questionContent}
                    {item.typeValue.map((value, index) => (
                        <div key={index} className='icheck-material-red'>
                            <input
                                className='hidden' type='radio' id={'radio' + item.id + index.toString()}
                                value={value} checked={this.state.selectedValue === value} onChange={this.onSiteChanged} />
                            <label className='entry' htmlFor={'radio' + item.id + index.toString()}>
                                <div className='circle' />
                                <div className='entry-label'>{value}</div>
                            </label>
                        </div>
                    ))}
                </div>;
            }
            else if (item.typeName === 'textArea') {
                return (
                    <div className='form-group w-100'>
                        {questionContent}
                        <textarea rows={item.rowNum} className='form-control' autoComplete='off' id={(this.props.index).toString()}
                            ref={this.value} />
                    </div>
                );
            } else {
                return (
                    <div className='form-group w-100'>
                        {questionContent}
                        <input type='text' className='form-control' autoComplete='off' id={(this.props.index).toString()}
                            ref={this.value} />
                    </div>
                );
            }
        } else return null;
    }
}

class HomeRegistrationForm extends React.Component {
    constructor(props) {
        super(props);
        this.valueList = [];
        for (let i = 0; i < 300; i++) {
            this.valueList[i] = React.createRef();
        }

        this.state = { total: 0, hasAnswered: false, thankYouPage: false, duration: 0, error: false };
    }

    componentDidMount() {
        $(document).ready(() => {
            const { eventId, formId } = this.props;
            this.props.checkHasAnswered(formId, eventId, data => {
                if (data.error) {
                    this.setState({ error: true });
                } else {
                    this.setState({ hasAnswered: data.check });
                }
            });
            if (formId) {
                this.props.getQuestionAllByUser(formId);
            }
        });
    }

    submit = (e, check = false) => {
        const { system, eventId, formId } = this.props;
        const { list } = this.props.question ? this.props.question : [];
        const language = T.language(texts);
        const userId = system.user ? system.user.email : null;
        if (userId == null) {
            T.notify(language.notLoggedIn, 'danger');
            e && e.preventDefault();
            return;
        }
        if (formId) {
            let record = [];
            let i = 0;
            for (i; i < list.length; i++) {
                const value = this.valueList[i].current.getValue();
                if ((!value || value == '') && check == true) {
                    T.notify('Xin vui lòng nhập đầy đủ câu trả lời', 'danger');
                    this.valueList[i].current.setFocus(e);
                    break;
                } else {
                    record.push({
                        questionId: list[i].id,
                        answer: value,
                    });
                }
            }
            if (i == list.length) {
                const newData = { user: userId, eventId, record, formId };
                this.props.addAnswerByUser(newData, () => {
                    this.setState({ thankYouPage: true });
                });
            }
        } else {
            const newData = { user: userId, eventId, record: [] };
            this.props.addAnswerByUser(newData, () => {
                this.setState({ thankYouPage: true });
            });
        }

        e && e.preventDefault();
    };

    render() {
        const { className, formInfo, system, formId } = this.props;
        const language = T.language(texts);
        const { list } = this.props.question ? this.props.question : { list: [] };
        const createForm = () => {

            if (!system || !system.user || !system.user.email) {
                return <p>{language.notLoggedIn} | <Link to={'/request-login?formId=' + formId} className='text-primary'><small>{language.askLogin}</small></Link></p>;
            } else if (!formId) {
                const { startRegister, stopRegister } = formInfo ? formInfo : { startRegister: null, stopRegister: null };
                const currentTime = new Date();

                if (startRegister && currentTime < new Date(startRegister)) {
                    return <p>{language.notDated}</p>;
                }
                if (stopRegister && currentTime > new Date(stopRegister)) {
                    return <p>{language.overDated}</p>;
                }
                return (
                    <>
                        <p>{language.noForm}</p>
                        <div key='submit-button' className='btn btn-large btn-primary submitRegister'>
                            <a href='#' onClick={this.submit}><span>{language.registerAction}</span></a>
                        </div>
                    </>);
            } else {
                const { startRegister, stopRegister } = formInfo ? formInfo : { startRegister: null, stopRegister: null };
                const currentTime = new Date();
                if (startRegister && currentTime < new Date(startRegister)) {
                    return <p>{language.notDated}</p>;
                }
                if (stopRegister && currentTime > new Date(stopRegister)) {
                    return <p>{language.overDated}</p>;
                }
                if (!list || list.length == 0) {
                    return <p>{language.noForm}</p>;
                }

                let form = [];
                for (let i = 0; i < list.length; i++) {
                    form.push(<RegisterElement key={i} element={list[i]} user={system.user} index={i} ref={this.valueList[i]} countAnswer={this.countAnswer} />);
                }
                form.push(
                    <div key='submit-button' className='btn btn-large btn-primary submitRegister'>
                        <a href='#' onClick={this.submit}><span>{language.registerAction}</span></a>
                    </div>
                );
                return form;
            }
        };

        return (
            <div className={className}>
                <div className='col-xs-10 col-xs-offset-1 col-md-8 col-md-offset-2'>
                    <div className='row'>
                        <div className='col-xs-12 w-100'>
                            {this.state.error ? language.errorOccured : (this.state.hasAnswered ? language.hasAnswered : (this.state.thankYouPage ? language.hasRecorded : createForm()))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ answer: state.reduxAnswer, question: state.reduxQuestion, system: state.system });
const mapActionsToProps = { addAnswerByUser, getQuestionInPageByUser, getQuestionAllByUser, checkHasAnswered };
export default connect(mapStateToProps, mapActionsToProps)(HomeRegistrationForm);
