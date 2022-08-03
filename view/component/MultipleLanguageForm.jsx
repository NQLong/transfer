import React from 'react';
import { FormTabs } from 'view/component/AdminPage';

export class FormMultipleLanguage extends React.Component {
    static defaultProps = { languages: ['vi', 'en'] }
    randomId = T.randomPassword();
    state = { elements: [] };
    element = {};
    _text = '';

    componentDidMount() {
        $(document).ready(() => {
            this.init();
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.languages && this.props.languages && this.props.languages.length && prevProps.languages.toString() != this.props.languages.toString()) {
            this.init(() => this.value(this._text));
        }
    }

    init = (done) => {
        let { tabRender = false, languages = ['vi', 'en'], title, gridClassName = 'col-md-12', className = '', readOnly, required, FormElement, formProps = {} } = this.props;

        // Handle readOnly
        let finalReadOnly = {};
        if (T.isObject(readOnly)) {
            languages.forEach(code => finalReadOnly[code] = readOnly[code]);
        } else {
            languages.forEach(code => finalReadOnly[code] = readOnly);
        }

        // Handle required
        let finalRequired = {};
        if (T.isObject(required)) {
            languages.forEach(code => finalRequired[code] = required[code]);
        } else {
            languages.forEach(code => finalRequired[code] = required);
        }

        const elements = languages.map(code => {
            const langTitle = !title || typeof title == 'string' ? `${title} (${code})` : title[code];
            let langClassName = tabRender ? '' : gridClassName;
            langClassName += ' ' + className;
            return <FormElement key={this.randomId + code} ref={e => this.element[code] = e} className={langClassName} label={tabRender ? null : langTitle} placeholder={langTitle} readOnly={finalReadOnly[code]} required={finalRequired[code]} {...formProps} />;
        });
        this.setState({ elements }, () => {
            languages.forEach(code => {
                this.value[code] = () => this.element[code] && this.element[code].value ? this.element[code].value() : null;
            });
            done && done();
        });
    }

    value = function (text) {
        let { languages = ['vi', 'en'] } = this.props;
        if (arguments.length) { // Set
            this._text = text;
            if (text && T.isObject(text)) {
                languages.forEach(code => {
                    if (this.element[code] && this.element[code].value) {
                        this.element[code].value(text[code]);
                    }
                });
            } else {
                const jsonText = T.language.parse(text, true, languages);
                languages.forEach(code => {
                    if (this.element[code] && this.element[code].value) {
                        this.element[code].value(jsonText[code] || '');
                    }
                });
            }
        } else { // Get
            const returnValue = {};
            languages.forEach(code => {
                if (this.element[code] && this.element[code].value) {
                    returnValue[code] = this.element[code].value();
                }
            });
            return JSON.stringify(returnValue);
        }
    }

    render() {
        let { tabRender = false, languages = ['vi', 'en'], title } = this.props;
        if (T.isObject(title) && (title.vi || title.vn)) {
            if (title.vi && !title.vn) title.vn = title.vi;
            else if (title.vn && !title.vi) title.vi = title.vn;
        }
        const elements = this.state.elements || [];
        if (tabRender) {
            const tabs = languages.map((code, index) => {
                const element = elements[index];
                return {
                    title: typeof title == 'string' ? `${title} (${code})` : (title[code] || ''),
                    component: element
                };
            });
            return <FormTabs tabs={tabs} />;
        } else {
            return <div className='row'>
                {elements}
            </div>;
        }
    }
}