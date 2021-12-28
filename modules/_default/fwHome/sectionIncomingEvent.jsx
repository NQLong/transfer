import React from 'react';
import { connect } from 'react-redux';
import Countdown from 'react-countdown';
const Completionist = () => <span>You are good to go!</span>;
class sectionIncomingEvent extends React.Component {
  state = {};

  componentDidMount() {

  }
  renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return <div style={{ fontSize: '1.8vw', textAlign: 'center', fontWeight: 'bold', color: 'white' }}> <span> 0{days} ngày {hours} giờ {minutes} phút {seconds}</span> </div>;
    }
  };

  render() {
    return (
      <section className='ftco-section-2' style={{ padding: '30px 0px' }}>
        <div style={{ position: 'relative' }}>
          <img src='/img/undong.jpg' style={{ width: '100%' }} />
          <div style={{ position: 'absolute', bottom: '17%', left: '19%', background: 'linear-gradient(to right, #9EDD20 0%, #23B441 100%)', padding: 5, borderRadius: 10 }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 'bold', color: 'white' }}>Khánh thành lúc 9:30 ngày 27/12/2021</div>
            <Countdown date={1640572200000}
              renderer={this.renderer}
            />
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = () => ({});
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(sectionIncomingEvent);