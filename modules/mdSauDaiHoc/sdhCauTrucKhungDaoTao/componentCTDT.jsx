import { Tooltip } from '@mui/material';
import { getDmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmKhoiKienThucAll } from 'modules/mdDaoTao/dmKhoiKienThuc/redux';
import { deleteSdhCauTrucKhungDaoTao } from './redux';

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
        const permission = this.getUserPermission(this.props.prefixPermission || 'sdhCauTrucKhungDaoTao');
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
                    ref={e => ref.value = e} data={SelectAdapter_DmKhoiKienThucAll(isParent ? null : this.parentRows[parentId].value.value())}
                    style={{ marginBottom: 0 }} className='form-group col-8' placeholder={`Chọn khối kiến thức ${isParent ? 'cha' : 'con'}`}
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
                    <React.Fragment>
                        <div className='form-group col-2'></div>
                        <div className='form-group col-10'>
                            <Tooltip title='Thêm khối kiến thức con' arrow placeholder='bottom'>
                                <button className='btn' onClick={e => e.preventDefault() || this.addChildRow(0, null, parentId)}>
                                    <i className='fa fa-lg fa-plus' /> Thêm khối kiến thức con
                                </button>
                                {/* <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || this.addChildRow(0, null, parentId)}><i className='fa fa-lg fa-plus' /></a> */}
                            </Tooltip>
                        </div>
                    </React.Fragment>
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

    onChangePosition = (e, pIndex) => {
        const parentStateTmp = { ...this.state.parentItems };
        const childStateTmp = { ...this.state.childItems };
        let pNext = pIndex;
        if (pIndex === 0) {
            pNext++;
        } else {
            pNext--;
        }
        [childStateTmp[pIndex], childStateTmp[pNext]] = [childStateTmp[pNext], childStateTmp[pIndex]];
        if (!childStateTmp[pIndex]) {
            delete childStateTmp[pIndex];
        }
        [parentStateTmp[pIndex], parentStateTmp[pNext]] = [parentStateTmp[pNext], parentStateTmp[pIndex]];
        [this.parentRows[pIndex], this.parentRows[pNext]] = [this.parentRows[pNext], this.parentRows[pIndex]];
        [this.childRows[pIndex], this.childRows[pNext]] = [this.childRows[pNext], this.childRows[pIndex]];

        const tmpCNextData = {};
        const tmpCIndexData = {};

        if (!this.childRows[pIndex]) {
            delete this.childRows[pIndex];
        } else {
            Object.keys(this.childRows[pIndex]).forEach(key => {
                const value = this.childRows[pIndex][key].value?.data();
                tmpCIndexData[key] = value;
            });
        }

        if (!this.childRows[pNext]) {
            delete this.childRows[pNext];
        } else {
            Object.keys(this.childRows[pNext]).forEach(key => {
                const value = this.childRows[pNext][key].value?.data();
                tmpCNextData[key] = value;
            });
        }

        this.setState({ parentItems: parentStateTmp, childItems: childStateTmp }, () => {
            const tmpPNextData = this.parentRows[pNext].value?.data();
            const tmpPIndexData = this.parentRows[pIndex].value?.data();

            this.parentRows[pIndex]?.value?.value(tmpPNextData);
            this.parentRows[pNext]?.value?.value(tmpPIndexData);

            if (this.childRows[pNext]) {
                Object.keys(this.childRows[pNext]).forEach(key => {
                    this.childRows[pNext][key].value?.value(tmpCNextData[key]);
                });
            }

            if (this.childRows[pIndex]) {
                Object.keys(this.childRows[pIndex]).forEach(key => {
                    this.childRows[pIndex][key].value?.value(tmpCIndexData[key]);
                });
            }

        });
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
                                <div className='form-group col-1'>
                                    <button className='btn' onClick={e => e.preventDefault() || this.onChangePosition(e, pIdx)}>
                                        <a href='#' ><i className={`fa fa-lg ${pIdx === 0 ? 'fa-level-down' : 'fa-level-up'}`} /></a>
                                    </button>
                                </div>
                                <div className='form-group col-1'>
                                    <strong style={{ textAlign: 'center', lineHeight: '35px', marginLeft: '10px' }}>{pIndex}</strong>
                                </div>
                                {this.insertTextBox(key, pIdx, 'parent')}
                                {
                                    children.map((cItem, cIdx) => {
                                        const cIsDeleted = this.state.childItems[key][cIdx].isDeleted;
                                        !cIsDeleted && cIndex++;
                                        return (
                                            !cIsDeleted &&
                                            <React.Fragment key={`${key}.${cIdx}`}>
                                                <div className="col-2"></div>
                                                <div className="col-10">
                                                    <div className='row'>
                                                        <p className='form-group col-1' style={{ textAlign: 'center', lineHeight: '35px' }}>{pIndex}.{cIndex}</p>
                                                        {this.insertTextBox(key, cIdx, 'child')}
                                                    </div>
                                                </div>
                                            </React.Fragment>
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

const mapStateToProps = state => ({ system: state.system, sdhCauTrucKhungDaoTao: state.sdh.sdhCauTrucKhungDaoTao });
const mapActionsToProps = { getDmMonHoc, deleteSdhCauTrucKhungDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentCTDT);