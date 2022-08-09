import React from 'react';
import { connect } from 'react-redux';
import { getContent } from './redux/reduxContent';

class sectionContent extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.contentId) {
            this.props.getContent(this.props.contentId, data => {
                if (data && data.item) {
                    const { title, content } = data.item;
                    this.setState({ title, content });
                }
            });
        }
    }

    render() {
        // const title = T.language.parse(this.state.title);
        let content = this.state.content ? (T.language.parse(this.state.content) || '').replaceAll('<strong>', '<b style="font-weight: bold;">').replaceAll('</strong>', '</b>') : '';
        return (
            <section className=' ftco-section-2 homeContent' style={{ padding: 0 }}>
                <br />
                {/* <h4 className='mb-4 text-center'>{title}</h4> */}
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </section>
        );
    }
}

const mapStateToProps = state => ({ content: state.content, system: state.system });
const mapActionsToProps = { getContent };
export default connect(mapStateToProps, mapActionsToProps)(sectionContent);