import React from 'react';
import { FormTabs } from 'view/component/AdminPage';

export class FormMultipleLanguage extends React.Component {
    randomId = T.randomPassword();
    state = { elements: [] };
    element = {};

    componentDidMount() {
        $(document).ready(() => {
            this.init();
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.languages && prevProps.languages.length && this.props.languages && this.props.languages.length && prevProps.languages.toString() != this.props.languages.toString()) {
            this.init();
        }
    }

    init = () => {
        let { tabRender = false, languages = ['vi', 'en'], title, gridClassName = 'col-md-12', className = '', readOnly, required, FormElement } = this.props;

        // Handle title
        if (T.isObject(title) && (title.vi || title.vn)) {
            if (title.vi && !title.vn) title.vn = title.vi;
            else if (title.vn && !title.vi) title.vi = title.vn;
        }

        // Handle readOnly
        let finalReadOnly = {};
        if (T.isObject(readOnly)) {
            if (readOnly.hasOwnProperty('vi')) readOnly.vn = readOnly.vi;
            else if (readOnly.hasOwnProperty('vn')) readOnly.vi = readOnly.vn;
            languages.forEach(code => finalReadOnly[code] = readOnly[code]);
        } else {
            languages.forEach(code => finalReadOnly[code] = readOnly);
        }
        if (finalReadOnly.hasOwnProperty('vi')) finalReadOnly.vn = finalReadOnly.vi;
        else if (finalReadOnly.hasOwnProperty('vn')) finalReadOnly.vi = finalReadOnly.vn;

        // Handle required
        let finalRequired = {};
        if (T.isObject(required)) {
            if (required.hasOwnProperty('vi')) required.vn = required.vi;
            else if (required.hasOwnProperty('vn')) required.vi = required.vn;
            languages.forEach(code => finalRequired[code] = required[code]);
        } else {
            languages.forEach(code => finalRequired[code] = required);
        }
        if (finalRequired.hasOwnProperty('vi')) finalRequired.vn = finalRequired.vi;
        else if (finalRequired.hasOwnProperty('vn')) finalRequired.vi = finalRequired.vn;

        const elements = languages.map(code => {
            const langTitle = !title || typeof title == 'string' ? `${title} (${code})` : title[code];
            let langClassName = tabRender ? '' : gridClassName;
            langClassName += ' ' + className;
            return <FormElement key={this.randomId + code} ref={e => this.element[code] = e} className={langClassName} label={langTitle} readOnly={finalReadOnly[code]} required={finalRequired[code]} />;
        });
        this.setState({ elements });
    }

    value = function (text) {
        if (arguments.length) { // Set
             if (text && T.isObject(text)) {
                 let { languages = ['vi', 'en'] } = this.props;
                 languages.forEach(code => {
                     if (this.element[code] && this.element[code].value) {
                         this.element[code].value(text[code]);
                     }
                 });
                 // eslint-disable-next-line no-empty
             } else {

             }
        } else { // Get

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
            return <div className='row' >
                {elements}
            </div>;
        }
    }
}