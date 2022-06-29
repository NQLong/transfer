import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, renderTable, TableCell } from 'view/component/AdminPage';
import { getNotificationInPage, readNotification, deleteNotification } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';

const UrlItem = (props) => {
    const link = props.link || '#';
    if (link == '#') {
        return (
            <a href='#' className='' onClick={e => e.preventDefault() || (props.onClick && props.onClick(e))}>
                {props.children}
            </a>
        );
    } else if (link.startsWith('http')) {
        return (
            <a href={link} className='' target='_blank' rel='noreferrer' onClick={(e) => props.onClick && props.onClick(e)}>
                {props.children}
            </a>
        );
    } else {
        return (
            <Link to={link} className='' onClick={(e) => props.onClick && props.onClick(e)}>
                {props.children}
            </Link>
        );
    }
};

class UserPage extends AdminPage {
    componentDidMount() {
        T.ready('/user', () => {
            this.selectAll.value(true);
            this.unread.value(true);
            this.read.value(true);
            this.getPage();
        });
    }

    getPage = (pageNumber, pageSize) => {
        const unread = this.unread.value();
        const read = this.read.value();
        let readCondition = undefined;
        if (!unread || !read) {
            readCondition = unread ? '0' : '1';
            if (!unread && !read) {
                readCondition = '2';
            }
        }
        this.props.getNotificationInPage(pageNumber, pageSize, readCondition);
    }

    readNotify = (id, action) => {
        this.props.readNotification(id, action, () => this.props.getNotificationInPage(1, 10, 0));
    }

    handleClickButton = (e, button, notiId) => {
        e.preventDefault();
        let { method, url, body, text } = button;
        if (url) {
            if (!method) method = 'get';
            method = method.toLowerCase();
            // Redirect to another page
            if (method == 'get' && !url.startsWith('/api')) {
                this.readNotify(notiId);
                // External link
                if (url.startsWith('http')) {
                    window.open(url, '_blank');
                } else if (!url.startsWith('/user')) {
                    // Homepage
                    document.location.pathname = url;
                } else {
                    this.props.history.push(url);
                }
            } else {
                // Handle request
                T[method](url, body || {}, (data) => {
                    if (data) {
                        if (data.error) {
                            T.notify(data.error.message || 'Thao tác bị lỗi!', 'danger');
                        } else {
                            T.notify(data.success && data.success.message ? data.success.message : 'Thao tác thành công!', 'success');
                            this.readNotify(notiId, 'Đã ' + text.toLowerCase());
                        }
                    }
                }, () => T.notify('Thao tác bị lỗi!', 'danger'));
            }
        }
    }

    delete = (e, id) => {
        e.preventDefault();
        T.confirm('Xóa thông báo', 'Bạn có chắc muốn xóa thông báo này', 'info', isConfirm => {
            isConfirm && this.props.deleteNotification(id);
        });
    }

    onSelectAll = (value) => {
        this.unread.value(value);
        this.read.value(value);
        setTimeout(() => this.getPage(), 50);
    }

    onSelect = () => {
        const unread = this.unread.value();
        const read = this.read.value();
        this.selectAll.value(unread && read);
        setTimeout(() => this.getPage(), 50);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.notification && this.props.notification.page ?
            this.props.notification.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true, emptyTable: 'Không có thông báo!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} colSpan={2} nowrap='true'>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let buttons;
                try {
                    if (item.buttonLink) {
                        buttons = JSON.parse(item.buttonLink);
                    } else {
                        buttons = [];
                    }
                } catch (e) {
                    console.error(e);
                    buttons = [];
                }
                if (buttons.length) item.targetLink = '#';
                return (
                    <tr key={index} style={{ backgroundColor: item.read == 1 ? 'rgba(0, 0, 0, 0.05)' : '' }}>
                        <TableCell type='number' style={{ verticalAlign: 'middle' }} content={index + 1} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', borderRight: 'none' }} content={<>
                            <span className='fa-stack fa-2x'>
                                <i className='fa fa-circle fa-stack-2x' style={{ color: item.iconColor }} />
                                <i className={`fa ${item.icon} fa-stack-1x fa-inverse`} />
                            </span><br />
                            <p className='app-notification__meta'>{T.dateToText(item.sendTime)}</p>
                        </>} />
                        <TableCell type='text' className='no-alignment' style={{ width: '100%', borderLeft: 'none' }} content={<>
                            <UrlItem link={item.targetLink} onClick={e => buttons.length == 0 ? this.readNotify(item.id) : e.preventDefault()}>
                                <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.title}</p>
                            </UrlItem>
                            <p className='app-notification__meta'>{item.subTitle}</p>
                            {item.action ? <p className='app-notification__meta text-primary'>{item.action}</p> : <>
                                {buttons.length ? (
                                    <div className='row'>
                                        {buttons.map((button, index) => (
                                            <div key={index} className='col-auto' style={{ padding: '0 5px' }}>
                                                <button key={index} className={`btn btn-${button.type} btn-sm`} onClick={(e) => this.handleClickButton(e, button, item.id)}>{button.text}</button>
                                            </div>
                                        ))}
                                    </div>
                                ) : ''}
                            </>}
                        </>} />
                        <TableCell type='buttons' permission={{ delete: true }} onDelete={(e) => this.delete(e, item.id)} />
                    </tr>
                );
            }
        });
        return this.renderPage({
            icon: 'fa fa-bell-o',
            title: 'Thông báo',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Thông báo'
            ],
            header: <>
                <FormCheckbox ref={e => this.selectAll = e} label='Tất cả thông báo' style={{ padding: '0 5px' }} onChange={this.onSelectAll} />
                <FormCheckbox ref={e => this.unread = e} label='Chưa đọc' style={{ padding: '0 5px' }} onChange={this.onSelect} />
                <FormCheckbox ref={e => this.read = e} label='Đã đọc' style={{ padding: '0 5px' }} onChange={this.onSelect} />
            </>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={(pageNumber, pageSize) => this.getPage(pageNumber, pageSize)} />
            </>,
            backRoute: '/user'
        });
    }
}

const mapStateToProps = state => ({ notification: state.notification });
const mapActionToProps = { getNotificationInPage, readNotification, deleteNotification };
export default connect(mapStateToProps, mapActionToProps)(UserPage);