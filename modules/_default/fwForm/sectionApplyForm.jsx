import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { updateForm } from './redux';
import { Link } from 'react-router-dom';

class SectionApplyForm extends React.Component {
    state = {
        selectedForm: { value: '', label: '' },
        currentSearchValue: '',
        options: []
    };

    componentDidMount() {
        $(document).ready(() => {
            const handleGetData = (timeOut, done) => {
                if (this.props.formId) {
                    const url = '/api/form/item/' + this.props.formId;
                    T.get(url, ({ error, item }) => {
                        if (error) {
                            T.notify('Lấy dữ liệu form bị lỗi!', 'danger');
                            console.error('GET: ' + url + '.', data.error);
                        } else if (item) {
                            this.setState({ selectedForm: { value: item.id, label: item.title.viText(), isLocked: item.isLocked, active: item.active } });
                        }
                    }, () => T.notify('Lấy form bị lỗi!', 'danger'));
                    done && done();
                } else if (timeOut >= 2000) {
                    done && done();
                } else {
                    setTimeout(() => handleGetData(timeOut + 200, done), 100);
                }
            };
            handleGetData(0, () => {
                const url = '/api/form/page/1/30';
                T.get(url, data => {
                    if (data.error) {
                        T.notify('Lấy danh sách form bị lỗi!', 'danger');
                        console.error('GET: ' + url + '.', data.error);
                    } else {
                        const options = data.page.list.map(item => ({ value: item.id, label: item.title.viText(), isLocked: item.isLocked, active: item.active }));
                        this.setState({ options });
                    }
                }, () => T.notify('Lấy danh sách form bị lỗi!', 'danger'));
            });
        });
    }

    handleChange = (value) => {
        if (value != this.state.currentSearchValue) {
            this.setState({ currentSearchValue: value });
            const handleTimeOut = (value) => {
                setTimeout(() => {
                    if (value == this.state.currentSearchValue) {
                        const url = '/api/form/page/1/30';
                        const pageCondition = {
                            statement: 'lower(FW_FORM.TITLE) LIKE :searchText',
                            parameter: { searchText: `%${value.toLowerCase()}%` }
                        };
                        T.get(url, { pageCondition }, data => {
                            if (data.error) {
                                T.notify('Lấy danh sách form bị lỗi!', 'danger');
                            } else {
                                const options = data.page.list.map(item => ({ value: item.id, label: item.title.viText(), isLocked: item.isLocked, active: item.active }));
                                this.setState({ options });
                            }
                        }, () => T.notify('Lấy danh sách form bị lỗi!', 'danger'));
                    }
                }, 1000);
            };

            handleTimeOut(value);
        }
    };

    getValue = () => {
        return this.state.selectedForm ? this.state.selectedForm.value : null;
    };

    updateActive = (e, selectedForm) => {
        e.preventDefault();
        this.props.updateForm(selectedForm.value, { active: 1 }, () => {
            selectedForm.active = 1;
            let options = this.state.options;
            let i = 0;
            for (i; i < options.length; i++) {
                if (options[i].value == selectedForm.value) break;
            }
            options.splice(i, 1, selectedForm);
            this.setState({ selectedForm, options });
        });
    };

    updateLock = (e, selectedForm) => {
        e.preventDefault();
        this.props.updateForm(selectedForm.value, { isLocked: 0 }, () => {
            selectedForm.isLocked = 0;
            let options = this.state.options;
            let i = 0;
            for (i; i < options.length; i++) {
                if (options[i].value == selectedForm.value) break;
            }
            options.splice(i, 1, selectedForm);
            this.setState({ selectedForm, options });
        });
    };

    render() {
        const canUpdate = this.props.currentPermission && this.props.currentPermission.contains('form:write');
        return (
            <div className='tile'>
                <h3 className='tile-title'>{this.props.title}</h3>
                <div className='tile-body'>
                    <div className='form-group'>
                        <label>Lựa chọn form</label>
                        <Select placeholder='Lựa chọn form' isSearchable={true}
                            isClearable={true}
                            onInputChange={this.handleChange}
                            onChange={selectedForm => this.setState({ selectedForm })}
                            value={this.state.selectedForm}
                            options={this.state.options}
                        />
                    </div>
                    {this.state.selectedForm && this.state.selectedForm.value ? (
                        <div>
                            <div className='row'>
                                <div className='col-lg-4 col-md-6 col-12'>
                                    <label>Trạng thái kích hoạt</label>
                                </div>
                                <div className='col-lg-8 col-md-6 col-12'>
                                    {this.state.selectedForm.active ?
                                        <p className='text-success'><i>Đã kích hoạt</i></p> :
                                        <p>
                                            <span className='text-danger'>Chưa kích hoạt</span> {canUpdate ? <span>| <span className='text-muted'><small style={{ cursor: 'pointer' }} onClick={e => this.updateActive(e, this.state.selectedForm)}>Kích hoạt?</small></span></span> : ''}
                                        </p>
                                    }
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-lg-4 col-md-6 col-12'>
                                    <label>Trạng thái khóa</label>
                                </div>
                                <div className='col-lg-8 col-md-6 col-12'>
                                    {!this.state.selectedForm.isLocked ?
                                        <p className='text-success'><i>Đang mở</i></p> :
                                        <p>
                                            <span className='text-danger'>Đã khóa</span> {canUpdate ? <span>| <span className='text-muted'><small style={{ cursor: 'pointer' }} onClick={e => this.updateLock(e, this.state.selectedForm)}>Mở khóa?</small></span></span> : ''}
                                        </p>
                                    }
                                </div>
                                <div className='col-12 text-right'>
                                    <Link to={'/user/form/edit/' + this.state.selectedForm.value} className='text-primary'><i>Chỉnh sửa form</i></Link>
                                </div>
                            </div>
                        </div>
                    ) : ''}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({});
const mapActionToProps = { updateForm };
export default connect(mapStateToProps, mapActionToProps, null, { forwardRef: true })(SectionApplyForm);
