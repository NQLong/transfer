import React from 'react';
import Init from '../../_default/_init';

export default class NewsCategoryPage extends React.Component {
    componentDidMount() {
        T.ready('/user/ocer');
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài viết: Danh mục</h1>
                </div>
                <Init.Section.SectionCategory type='news' uploadType='newsCategoryImage' />
                <button onClick={() => {
                    this.props.history.goBack();
                }} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </button>
            </main>
        );
    }
}