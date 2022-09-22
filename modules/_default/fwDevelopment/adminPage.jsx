import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import SectionAdminPage from './adminPageSupport/SectionAdminPage';
import SectionAdminModal from './adminPageSupport/SectionAdminModal';
import SectionTableCell from './adminPageSupport/SectionTableCell';
import SectionRenderTable from './adminPageSupport/SectionRenderTable';
import SectionFormTabs from './adminPageSupport/SectionFormTabs';

export default class AdminPageWiki extends AdminPage {
    state = { currentPage: T.debug ? 'AdminPage' : 'AdminPage' };

    componentDidMount() {
        T.ready('/user/settings');
    }

    changePage = pageName => this.state.currentPage != pageName && this.setState({ currentPage: pageName });

    render() {
        const currentPage = this.state.currentPage;
        let renderItem = null;
        switch (currentPage) {
            case 'AdminPage': {
                renderItem = <SectionAdminPage />;
                break;
            }
            case 'AdminModal': {
                renderItem = <SectionAdminModal />;
                break;
            }
            case 'TableCell': {
                renderItem = <SectionTableCell />;
                break;
            }
            case 'renderTable': {
                renderItem = <SectionRenderTable />;
                break;
            }
            case 'FormTabs': {
                renderItem = <SectionFormTabs />;
                break;
            }
            default:
                break;
        }

        return this.renderPage({
            icon: 'fa fa-code',
            title: <span>AdminPage Wiki <sup className='text-primary'>version 1.0.2</sup></span>,
            content: <div className='row'>
                <div className='col-md-10 p-0'>
                    {renderItem}
                </div>
                <div className='col-md-2' style={{ padding: 0 }}>
                    <div style={{ position: 'sticky', top: '75px' }}>
                        <ul style={{ listStyleType: 'none' }}>
                            {['AdminPage', 'AdminModal', 'TableCell', 'renderTable', 'FormTabs'].map((pageName, index) => (
                                <li key={index}><a href='#' className={currentPage == pageName ? 'text-primary' : 'text-muted'} onClick={e => e.preventDefault() || this.changePage(pageName)}>{pageName}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        });
    }
}