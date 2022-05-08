import React from 'react';
import { DefaultColors } from './Chart';
export default class Calendar extends React.Component {
    componentDidMount() {
        $(this.calendar).fullCalendar({
            timeZone: 'UTC',
            // weekNumbers: true,
            aspectRatio: 2,
            selectable: true,
            eventLimit: false,
            timeFormat: 'HH:mm',
            // defaultView: 'agendaWeek',
            dayHeaderFormat: 'dd/mm',
            displayEventTime: true,
            slotEventOverlap: false,
            navLinks: true,
            // weekNumberCalculation: 'ISO',
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },

            views: {
                month: {
                    timeFormat: 'HH:mm',
                },
                agendaWeek: {
                    columnHeaderFormat: 'ddd DD/MM',
                }
            },
            eventRender: (event) => {
                let isRenderInRanges = true, isRenderInExceptDate = true;
                if (event.ranges) {
                    let eventInRanges = event.ranges.filter(range =>
                        event.start.isBefore(range.end) && event.end.isAfter(range.start)
                    );
                    isRenderInRanges = eventInRanges.length > 0;
                }

                if (event.exceptDates && event.exceptDates.length) {
                    console.log(event.start.format('YYYY-MM-DD'), event.exceptDates.includes(event.start.format('YYYY-MM-DD')));
                    isRenderInExceptDate = !event.exceptDates.includes(event.start.format('YYYY-MM-DD'));
                }
                return isRenderInRanges && isRenderInExceptDate;
            },
            // select: (startDate, endDate) => {
            //     let start = startDate._d, end = endDate._d;
            //     if (typeof (startDate._i) == 'object') {
            //         start = new Date(startDate._i[0], startDate._i[1], startDate._i[2], startDate._i[3], startDate._i[4], startDate._i[5], startDate._i[6]);
            //         end = new Date(endDate._i[0], endDate._i[1], endDate._i[2], endDate._i[3], endDate._i[4], endDate._i[5], endDate._i[6]);

            //     }
            //     // this.editJob(null, start, end);
            // },
            // eventClick: (calEvent) => {
            //     const event = {
            //         title: calEvent.title,
            //         start: calEvent.start._d,
            //         end: calEvent.end && calEvent.end._d,
            //         id: calEvent.extendedProps.id ? calEvent.extendedProps.id : null,
            //         priority: calEvent.extendedProps.priority ? calEvent.extendedProps.priority : null,
            //         description: calEvent.extendedProps.description ? calEvent.extendedProps.description : '',
            //         component: calEvent.extendedProps.component ? calEvent.extendedProps.component : '',
            //         address: calEvent.extendedProps.address ? calEvent.extendedProps.address : ''
            //     };
            //     // this.editJob(event);
            // },
            // viewRender: (view) => {
            //     // $('td.fc-week-number a').append('<br/><i class=\'fa fa-download exportIcon\'/>');
            //     this.setState({ start: view.start._i, end: view.end._i });
            // },
        });
        this.getData(this.props.data || []);
    }

    componentDidUpdate(prevProps) {
        const prevData = prevProps.data;
        let { data = [] } = this.props;
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
            this.getData(data);
        }
    }

    getData = (data) => {
        $(this.calendar).fullCalendar('removeEvents');
        $(this.calendar).fullCalendar('addEventSource',
            data.filter(item => item.isRepeat).map(item => ({
                title: item.title,
                start: item.start,
                end: item.end,
                dow: [item.thu],
                ranges: [{
                    start: item.dateStart,
                    end: item.dateEnd
                }],
                exceptDates: item.exceptDates
            }))
        );
        $(this.calendar).fullCalendar('addEventSource',
            data.filter(item => !item.isRepeat).map(item => ({
                title: item.title,
                start: item.start,
                end: item.end,
                backgroundColor: DefaultColors.red
            }))
        );
        $(this.calendar).fullCalendar('refetchEvents');
    }

    render() {
        return (
            <div id='calendar' ref={e => this.calendar = e} style={{ padding: '20px' }}></div>
        );
    }
}