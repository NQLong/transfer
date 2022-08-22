import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox } from 'view/component/AdminPage';
import { deleteTccbKhungDanhGiaCanBo } from './redux';
import { SelectAdapter_DmMucXepLoaiAll } from '../../mdDanhMuc/dmMucXepLoai/redux';
export class ComponentDGCB extends AdminPage {
    state = { items: {} };
    rows = {};

    setVal = (items = {}) => {
        let length = 0;
        Object.keys(items).forEach(key => {
            const item = items[key];
            this.addRow(length, item);
            length++;
        });
    }


    addRow = (index, item) => {
        const { from, to, maMucXepLoai } = item ? item : { from: 0, to: 0, maMucXepLoai: '' };
        this.rows[index] = {
            from: null,
            to: null,
            maMucXepLoai: null,
        };
        const newItems = { ...this.state.items };
        newItems[index] = { from: 0, to: 0, maMucXepLoai: '', isDeleted: false, isMinus: true };
        this.setState({ items: newItems }, () => {
            this.rows[index]?.from?.value(Number(from));
            this.rows[index]?.to?.value(Number(to));
            this.rows[index]?.maMucXepLoai?.value(maMucXepLoai);
        });
    }

    onAddRow = (e) => {
        e.preventDefault();
        const length = Object.keys(this.state.items).length;
        this.addRow(length, null);
    }

    onRemoveRow = (e, index) => {
        e.preventDefault();
        const newItems = { ...this.state.items };
        newItems[index].isDeleted = true;
        this.setState({ items: { ...newItems } });
    }

    insertTextBox = (index) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'tccbKhungDanhGiaCanBo');
        const readOnly = !(permission.write);
        const ref = this.rows[index];
        const isDeleted = this.state.items[index].isDeleted;
        return (
            !isDeleted &&
            (<>
                    <FormTextBox type='number' min='0' className='col-md-2' ref={e => ref.from = e} placeholder='Từ' readOnly={readOnly} required />
                    <FormTextBox type='number' min='0' className='col-md-2' ref={e => ref.to = e} placeholder='Đến' readOnly={readOnly} required />
                    <FormSelect ref={e => ref.maMucXepLoai = e} placeholder='Mức xếp loại' data={SelectAdapter_DmMucXepLoaiAll} className='col-md-4' />
                    {
                        (permission.write) &&
                        <Tooltip title='Xoá' arrow >
                            <a className='btn' href='#' onClick={e => this.onRemoveRow(e, index)}><i className='fa fa-lg fa-minus' /></a>
                        </Tooltip>
                    }
            </>)
        );
    };

    getValue = () => {
        const keys = Object.keys(this.rows);
        const datas = { items: [] };
        keys.forEach((key) => {
            const isDeleted = this.state.items[key].isDeleted;
            if (isDeleted) return;
            const from = this.rows[key].from?.value() || 0;
            const to = this.rows[key].to?.value() || 0;
            const maMucXepLoai = this.rows[key].maMucXepLoai?.value() || 0;
            const item = { from, to, maMucXepLoai };
            datas.items.push(item);
        });
        return datas;
    }

    render() {
        const { items } = this.state;
        const itemsArr = Object.keys(items || {}) || [];
        return (
            <>
                {
                    itemsArr.map((key) => {
                        const isDeleted = this.state.items[key].isDeleted;
                        return !isDeleted && (
                            <div key={key} className="row p-8">
                                {this.insertTextBox(key)}
                            </div>
                        );
                    })
                }
                <div style={{ textAlign: 'right' }}>
                    <Tooltip title='Thêm mức' arrow>
                        <button className='btn btn-success' onClick={e => this.onAddRow(e)}>
                            <i className='fa fa-lg fa-plus' /> Thêm mức
                        </button>
                    </Tooltip>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, tccbKhungDanhGiaCanBo: state.danhGia.tccbKhungDanhGiaCanBo });
const mapActionsToProps = { deleteTccbKhungDanhGiaCanBo };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDGCB);