import React from 'react';
import Init from '../_init/index';

export default class StorageCategoryPage extends React.Component {
    componentDidMount() {
        T.ready();
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài viết: Danh mục</h1>
                </div>
                <Init.Section.SectionCategory type='document' uploadType='documentCategoryImage' />
                <button onClick={() => {
                    this.props.history.goBack();
                }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </button>
            </main>
        );
    }
}