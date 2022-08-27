import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_CongVanDi } from '../hcthCongVanDi/redux';
import { getHoSoSearchPage, createHoSo } from './redux';
import Pagination from 'view/component/Pagination';
class CreateModal extends AdminModal {
    onShow = () => {
        this.tieuDe.value('');
        this.vanBan.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            tieuDe: this.tieuDe.value(),
            vanBan: this.vanBan.value(),
        };
        if (!data.tieuDe) {
            T.notify('Tiêu đề hồ sơ bị trống', 'danger');
            this.tieuDe.focus();
        } else {
            this.props.create(data, () => {
                this.props.getPage(this.props.pageNumber, this.props.pageSize, '', () => this.hide());
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo hồ sơ',
            size: 'elarge',
            body: <div className="row">
                <FormTextBox ref={e => this.tieuDe = e} className="col-md-12" label='Tiêu đề' type='text' required />
                <FormSelect multiple={true} ref={e => this.vanBan = e} data={SelectAdapter_CongVanDi} label='Văn bản đi' className='col-md-12' />
            </div>
        });
    }
}


class HcthHoSo extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthHoSo && this.props.hcthHoSo.page ? this.props.hcthHoSo.page : { pageNumber: 1, pageSize: 50 };
        let pageFilter = isInitial ? {} : {};
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '');
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getHoSoSearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthHoSo && this.props.hcthHoSo.page ?
            this.props.hcthHoSo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        const table = renderTable({
            getDataSource: () => this.props.hcthHoSo?.page?.list,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tiêu đề</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr >;
            },
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue', fontWeight: 'bold' }} content={`${item.hoNguoiTao} ${item.tenNguoiTao}`.trim().normalizedName()} />
                        <TableCell type='link' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '300px' }} content={item.tieuDe || 'Chưa có tiêu đề'} url={`/user/ho-so/${item.id}`} />
                        <TableCell type='buttons' content='' />
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-file-text',
            title: 'Hồ sơ',
            stickyHead: true,
            content: <>
                <div className="tile">
                    {table}
                </div>,
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />,
                <CreateModal ref={e => this.createModal = e} create={this.props.createHoSo} getPage={this.getPage} {...{ pageNumber, pageSize }} />
            </>,
            backRoute: '/user',
            onCreate: (e) => {
                e.preventDefault();
                this.createModal.show(null);
            }
        });
    }

}

const mapStateToProps = state => ({ system: state.system, hcthHoSo: state.hcth.hcthHoSo });
const mapActionsToProps = { getHoSoSearchPage, createHoSo };
export default connect(mapStateToProps, mapActionsToProps)(HcthHoSo);