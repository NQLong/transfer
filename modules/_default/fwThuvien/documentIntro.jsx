import React from 'react';
import { homeGetCarousel } from 'modules/_default/fwHome/redux/reduxCarousel';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class SectionIntro extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            carousel: []
        };
        this.language = React.createRef();
    }
    componentDidMount() {
        this.props.homeGetCarousel(this.props.item.viewId, carousel => this.setState({ carousel: carousel.items }));
    }
    onClick = (link) => {
        if (link && link.includes('http')) {
            window.open(link, '_blank');
        } else if (link) {
            this.props.history.push(link);
        }
    }

    render() {
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0, }}><strong>Giới thiệu tài liệu mới</strong></h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
                    {this.state.carousel.map((item, index) =>
                        <p onClick={() => this.onClick(item.link)} key={index}>
                            <img src={item.image} style={{ margin: 10, width: '80%', cursor: 'pointer' }} />
                        </p>
                    )}
                </div>
            </section>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetCarousel };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(SectionIntro));
