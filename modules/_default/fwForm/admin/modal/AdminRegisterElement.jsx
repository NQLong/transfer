import React from 'react';
import '../audio.scss';

export default class AdminRegisterElement extends React.Component {
    constructor(props) {
        super(props);
        this.getValue = this.getValue.bind(this);
        this.onSiteChanged = this.onSiteChanged.bind(this);
        this.setData = this.setData.bind(this);

        this.value = React.createRef();
        this.score = React.createRef();
        this.dateInput = React.createRef();
        this.state = { selectedValue: null, answer: null };
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.dateInput.current).datepicker(T.birthdayFormat);
        });
    }

    componentDidUpdate() {
        $(document).ready(() => {
            setTimeout(() => {
                $(this.value.current).val(this.props.answer);
                $(this.dateInput.current).val(this.props.answer);
                $(this.score.current).val(this.props.score);
            }, 100);
        });
    }

    componentWillUnmount() {
        this.setState({ selectedValue: null, answer: null });
    }

    onSiteChanged(e) {
        this.setState({ selectedValue: e.target.value });
    }

    setData(type, value) {
        switch (type) {
            case 'textArea': {
                $(this.value.current).val(value);
                break;
            }

            case 'choice': {
                this.setState({ selectedValue: value });
                break;
            }

            case 'multiChoice': {
                const element = this.props.element ? this.props.element : null;
                $('input[name=checkbox' + this.props.index + element.id + ']').each((index, val) => {
                    $(val).prop('checked', false);
                    if (val.value == value) {
                        $(val).prop('checked', true);
                    }
                });
                break;
            }

            case 'date': {
                $(this.dateInput.current).val(T.dateToText(new Date(), T.birthdayFormat.format));
                break;
            }

            default: {
                $(this.value.current).val(value);
                break;
            }

        }
    }

    getValue() {
        const element = this.props.element ? this.props.element : { id: '', typeName: '' };
        let defaultChoiceValue = this.props.answer ? this.props.answer : '';
        if (!this.props.answer && (element.typeName == 'choice' || element.typeName == 'multiChoice')) {
            defaultChoiceValue = element.typeValue[0];
        }
        if (element) {
            if (!element.active) {
                return defaultChoiceValue;
            } else {
                switch (element.typeName) {
                    case 'choice':
                        return this.state.selectedValue ? this.state.selectedValue : defaultChoiceValue;
                    default:
                        return $(this.value.current).val();
                }
            }
        } else {
            return null;
        }
    }
    getPoint() {
        return $(this.score.current).val() ? parseInt($(this.score.current).val()) : 0;
    }

    render() {
        const item = this.props.element ? this.props.element : {
            id: '', content: '', typeName: '', active: false, typeValue: []
        }, answer = this.props.answer ? this.props.answer : null,
            readOnly = this.props.readOnly ? this.props.readOnly : false,
            questionContent = (
                <div className=''>
                    <div className='row'>
                        <div className='col-12'>
                            <p dangerouslySetInnerHTML={{ __html: item.content }} />
                        </div>
                    </div>
                </div>
            );
        if (item.active) {
            switch (item.typeName) {
                case 'choice': {
                    return <div className='form-group'>
                        <label>{questionContent}</label>
                        {item.typeValue.map((value, index) => (
                            <div key={index} className='animated-radio-button'>
                                <label>
                                    <input type='radio' id={'radio' + item.id + index.toString()} value={value}
                                        checked={(this.state.selectedValue ? this.state.selectedValue : (answer ? answer : '')) === value}
                                        onChange={this.onSiteChanged} />
                                    <span className='label-text'>{value}</span>
                                </label>
                            </div>
                        ))}
                    </div>;
                }

                case 'textArea': {
                    return (
                        <div className='form-group'>
                            <div>Câu {this.props.index + 1}: </div>
                            <label htmlFor={(this.props.index).toString()}>{questionContent}</label>
                            <textarea className='form-control' id={(this.props.index).toString()} rows={5}
                                defaultValue={answer ? answer : ''} readOnly={readOnly} ref={this.value} />
                        </div>
                    );
                }
                default: {
                    return (
                        <div className='form-group'>
                            <div>Câu {this.props.index + 1}: </div>
                            <label htmlFor={(this.props.index).toString()}>{questionContent}</label>
                            <input type='text' className='form-control' id={(this.props.index).toString()}
                                defaultValue={answer ? answer : ''} ref={this.value} readOnly={readOnly} />
                        </div>
                    );
                }
            }
        } else {
            return null;
        }
    }
}
