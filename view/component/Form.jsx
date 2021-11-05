import { AdminPage } from 'view/component/AdminPage';

export class QTForm extends AdminPage {
    getFormVal = () => {
        const formValue = this.getVal();
        let formEntries = Object.entries(formValue);
        const errorEntry = formEntries.find(field => field[1].error);
        if (errorEntry) {
            // const fieldName = errorEntry[0];
            const error = errorEntry[1].error;
            let message = '';
            if (error.message) message = error.message;
            else if (error.required) message = 'Hãy điền vào trường này';
            else if (error.max) message = 'Hãy điền số hợp lệ';
            else if (error.min) message = 'Hãy điền số hợp lệ';
            else if (error.float) message = 'Hãy điền số nguyên';
            if (error.input.setCustomValidity && error.input.reportValidity) {
                error.input.setCustomValidity(message);
                error.input.reportValidity();
            }
            return { error };
        }
        formEntries = formEntries.filter(item => item && item[1] && item[1].data !== null && !Number.isNaN(item[1].data) && !item[1].disabled).map(item => [item[0], typeof(item[1].data) == 'string' ? item[1].data.trim() : item[1].data]);
        const data = Object.fromEntries(formEntries);
        return { data };
    };

    getFullFormVal = () => {
        const formValue = this.getVal();
        let formEntries = Object.entries(formValue);
        const errorEntry = formEntries.find(field => field[1].error);
        if (errorEntry) {
            // const fieldName = errorEntry[0];
            const error = errorEntry[1].error;
            let message = '';
            if (error.message) message = error.message;
            else if (error.required) message = 'Hãy điền vào trường này';
            else if (error.max) message = 'Hãy điền số hợp lệ';
            else if (error.min) message = 'Hãy điền số hợp lệ';
            else if (error.float) message = 'Hãy điền số nguyên';
            if (error.input.setCustomValidity && error.input.reportValidity) {
                error.input.setCustomValidity(message);
                error.input.reportValidity();
            }
            return { error };
        }
        formEntries = formEntries.filter(item => item && item[1] && item[1].data !== null && !Number.isNaN(item[1].data)).map(item => [item[0], item[1].data]);
        const data = Object.fromEntries(formEntries);
        return { data };
    };
}