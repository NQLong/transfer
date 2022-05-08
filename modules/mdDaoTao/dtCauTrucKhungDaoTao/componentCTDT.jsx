import { Tooltip } from '@mui/material';
import { getDmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmKhoiKienThucAll } from '../dmKhoiKienThuc/redux';
import { deleteDtCauTrucKhungDaoTao } from './redux';

export class ComponentCTDT extends AdminPage {
    state = { parentItems: {}, childItems: {} };
    parentRows = {};
    childRows = {};

    setVal = (items = {}) => {
        let length = 0;
        const parents = items?.parents || {};
        const childs = items?.childs || {};
        Object.keys(parents).forEach((key) => {
            const item = parents[key];
            this.addParentRow(length, item);
            length++;
            childs[key] && childs[key].forEach((cItem) => {
                this.addChildRow(cItem.id, cItem.value, key);
            });
        });
        // this.addParentRow(length);
        // this.addChildRow(0, null, length);
    }

    addParentRow = (idx, item) => {
        const id = item ? item.id : idx;
        this.parentRows[idx] = {
            id: id,
            value: null,
        };
        const newParentItems = { ...this.state.parentItems };
        // if (newParentItems[idx - 1]) {
        //     newParentItems[idx - 1] = { id: id - 1, isDeleted: false, isMinus: true };
        // }
        newParentItems[idx] = { id: id, isDeleted: false, isMinus: true };
        this.setState({
            parentItems: newParentItems
        }, () => {
            this.parentRows[idx]?.value?.value(item ? item.id : '');
        });
    }

    addChildRow = (idx, item, parentId) => {
        if (!this.childRows[parentId]) {
            this.childRows[parentId] = {};
        }
        this.childRows[parentId][idx] = {
            id: idx,
            value: null,
        };
        const newChildItems = { ...this.state.childItems };
        if (!newChildItems[parentId]) {
            newChildItems[parentId] = [{ id: idx, isDeleted: false, isMinus: false }];
        } else {
            if (newChildItems[parentId][idx - 1]) {
                newChildItems[parentId][idx - 1] = { id: idx - 1, isDeleted: false, isMinus: true };
            }
            newChildItems[parentId][idx] = { id: idx, isDeleted: false, isMinus: false };
        }
        this.setState({
            childItems: newChildItems
        }, () => {
            const ref = this.childRows[parentId];
            if (ref) {
                ref[idx]?.value?.value(item ? item.id : '');
            }
        });
    }

    // onChange = (value, parentId, idx, type) => {
    //     if (type === 'parent') {
    //         this.parentRows[idx].value.value(value);
    //     } else {
    //         this.childRows[parentId][idx].value.value(value);
    //     }
    // }

    onAddRow = (e, parentId, idx, type) => {
        e.preventDefault();
        if (type === 'parent' && !this.parentRows[idx + 1]) {
            this.addParentRow(idx + 1, null);
            // this.addChildRow(0, null, idx + 1);
        } else if (type === 'child' && !this.childRows[parentId][idx + 1]) {
            this.addChildRow(idx + 1, null, parentId);
        }
    }

    onRemoveParentRow = (idx) => {
        const nParentItems = { ...this.state.parentItems };
        nParentItems[idx].isDeleted = true;
        this.setState({
            parentItems: {
                ...nParentItems
            }
        });
    }

    onRemoveChildRow = (parentId, idx) => {
        const nChildItems = { ...this.state.childItems };
        if (idx >= 0) {
            nChildItems[parentId][idx].isDeleted = true;
        } else {  //remove all child
            if (nChildItems[parentId]) {
                const keys = Object.keys(nChildItems[parentId]);
                keys.forEach(key => {
                    nChildItems[parentId][key].isDeleted = true;
                });
            }
        }
        this.setState({
            childItems: {
                ...nChildItems
            }
        });
    }

    onRemoveRow = (e, parentId, idx, type) => {
        e.preventDefault();
        if (type === 'parent') {
            this.onRemoveParentRow(idx);
            this.onRemoveChildRow(parentId);
        } else {
            this.onRemoveChildRow(parentId, idx);
        }
    }

    insertTextBox = (parentId, idx, type) => {
        const permission = this.getUserPermission(this.props.prefixPermission || 'dtCauTrucKhungDaoTao');
        const readOnly = !(permission.write);
        const isParent = type === 'parent';
        if (!isParent && !this.childRows[parentId]) {
            this.childRows[parentId] = {};
        }
        const ref = isParent ? this.parentRows[idx] : this.childRows[parentId][idx];
        const isDeleted = isParent ? this.state.parentItems[idx].isDeleted : this.state.childItems[parentId][idx].isDeleted;
        const isMinus = isParent ? this.state.parentItems[idx].isMinus : this.state.childItems[parentId][idx].isMinus;
        return (
            !isDeleted &&
            (<>
                <FormSelect
                    ref={e => ref.value = e} data={SelectAdapter_DmKhoiKienThucAll}
                    style={{ marginBottom: 0 }} className='form-group col-9' placeholder={`Chọn khối kiến thức ${isParent ? 'cha' : 'con'}`}
                    readOnly={readOnly}
                />
                <div className='form-group col-2'>
                    {
                        (permission.write) && isMinus ?
                            <Tooltip title='Xoá khối kiến thức' arrow >
                                <a className='btn' href='#' onClick={e => e.preventDefault() || this.onRemoveRow(e, parentId, idx, type)}><i className='fa fa-lg fa-minus' /></a>
                            </Tooltip> :
                            !isParent &&
                            <Tooltip title='Thêm khối kiến thức con' arrow >
                                <a className='btn' href='#' onClick={e => e.preventDefault() || this.onAddRow(e, parentId, idx, type)}><i className='fa fa-lg fa-plus' /></a>
                            </Tooltip>
                    }
                </div>
                {isParent && !this.childRows[parentId] &&
                    <div className='form-group col-12'>
                        <Tooltip title='Thêm khối kiến thức con' arrow placeholder='bottom' style={{ marginLeft: 70 }}>
                            <button className='btn' onClick={e => e.preventDefault() || this.addChildRow(0, null, parentId)}>
                                <i className='fa fa-lg fa-plus' /> Thêm khối kiến thức con
                            </button>
                            {/* <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || this.addChildRow(0, null, parentId)}><i className='fa fa-lg fa-plus' /></a> */}
                        </Tooltip>
                    </div>
                }
            </>)
        );
    };

    getValue = () => {
        const parentKeys = Object.keys(this.parentRows);
        const datas = { parents: [], childrens: {} };
        parentKeys.forEach((pKey) => {
            const pId = datas.parents.length;
            const pIsDeleted = this.state.parentItems[pKey].isDeleted;
            if (pIsDeleted) return;
            const { id, text } = this.parentRows[pKey].value?.data() || { id: null, text: '' };
            if (!id) return;
            const item = {
                id: pId,
                value: { id, text },
            };
            datas.parents.push(item);
            if (!pIsDeleted && this.childRows[pKey]) {
                const childRow = Object.values(this.childRows[pKey]);
                childRow.forEach((cItem) => {
                    const cIsDeleted = this.state.childItems[pKey][cItem.id].isDeleted;
                    if (cIsDeleted) return;
                    const { id, text } = cItem?.value?.data() || { id: null, text: '' };
                    if (!id) return;
                    const item = {
                        id: (datas.childrens[pId] || []).length,
                        value: { id, text },
                    };
                    if (!datas.childrens[pId]) { datas.childrens[pId] = []; }
                    id && datas.childrens[pId].push(item);
                });
            }
        });
        return datas;
    }

    convertObjToArr = () => {
        return Object.values(this.state.datas) || [];
    }


    render() {
        const { parentItems: parents, childItems: childs } = this.state;
        const parentsArr = Object.keys(parents || {}) || [];
        let pIndex = 0;
        let cIndex = 0;
        return (
            <>
                {
                    parentsArr.map((key, pIdx) => {
                        const children = childs[key] || [];
                        const pIsDeleted = this.state.parentItems[pIdx].isDeleted;
                        if (!pIsDeleted) {
                            pIndex++;
                            cIndex = 0;
                        }
                        return (
                            !pIsDeleted &&
                            <div key={key} className="row">
                                <strong className='form-group col-1' style={{ textAlign: 'center', lineHeight: '35px' }}>{pIndex}</strong>
                                {this.insertTextBox(key, pIdx, 'parent')}
                                {
                                    children.map((cItem, cIdx) => {
                                        const cIsDeleted = this.state.childItems[key][cIdx].isDeleted;
                                        !cIsDeleted && cIndex++;
                                        return (
                                            !cIsDeleted &&
                                            <div key={`${key}.${cIdx}`} style={{ marginLeft: '30px' }} className="col-12">
                                                <div className='row'>
                                                    <p className='form-group col-1' style={{ textAlign: 'center', lineHeight: '35px' }}>{pIndex}.{cIndex}</p>
                                                    {this.insertTextBox(key, cIdx, 'child')}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        );
                    })
                }
                {/* <button onClick={this.getValue}>Get Data</button> */}
                <div style={{ textAlign: 'left' }}>
                    <Tooltip title='Thêm khối kiến thức cha' arrow>
                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.onAddRow(e, parentsArr[parentsArr.length - 1]?.id, parentsArr.length - 1, 'parent')}>
                            <i className='fa fa-lg fa-plus' /> Thêm khối kiến thức
                        </button>
                    </Tooltip>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtCauTrucKhungDaoTao: state.daoTao.dtCauTrucKhungDaoTao });
const mapActionsToProps = { getDmMonHoc, deleteDtCauTrucKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCTDT);