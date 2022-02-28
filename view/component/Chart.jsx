import React from 'react';

export const DefaultColors = {
    blue: '#007bff',
    red: '#dc3545',
    orange: 'rgb(255, 159, 64)',
    green: '#28a745',
    yellow: '#ffc107',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

function deepEqual(x, y) {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
        (Object.keys(x).length === Object.keys(y).length) &&
        Object.keys(x).reduce(function (isEqual, key) {
            return isEqual && deepEqual(x[key], y[key]);
        }, true) : (x === y);
}
export class ChartBase extends React.Component {
    canvas = React.createRef();

    // static dataToConfig = (data, backgroundColor) => ({});
    static dataToConfig = () => ({});

    componentDidMount() {
        this.chart = new window.Chart(this.canvas.current, this.constructor.dataToConfig(this.props.data, this.props.color));
    }

    componentDidUpdate(prevProps) {
        const prevConfig = this.constructor.dataToConfig(prevProps.data, prevProps.color);
        const config = this.constructor.dataToConfig(this.props.data, this.props.color);

        // if (!_.isEqual(prevConfig, config)) {
        if (!deepEqual(prevConfig, config)) {
            this.chart.data = config.data;
            this.chart.update();
        }
    }

    render = () => <canvas ref={this.canvas} />;
}

export class DoughnutChart extends ChartBase {
    static dataToConfig = (data, backgroundColor = Object.values(DefaultColors)) => {
        //#region explain
        // data = [{ value: 20, title: 'nam'}, {value: 12, title: 'nu'}];
        // =>
        // config = {
        //     ...,
        //     data: {
        //         datasets: [{
        //             data: [20, 12],
        //             backgroundColor: [...]
        //         }],
        //         label: ['nam', 'nu']
        //     }
        // }
        //#endregion explain

        if (!data || !data.map) data = [];
        const dataValue = data.map(item => item.value);
        const dataLabels = data.map(item => item.title);
        return {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: dataValue,
                    backgroundColor,
                }],
                labels: dataLabels
            },
            options: {
                responsive: true
            }
        };
    }
}

// export class PieChart extends ChartBase {
//     static dataToConfig = (data, backgroundColor = Object.values(DefaultColors)) => {
//         //#region explain
//         // data = [{ value: 20, title: 'nam'}, {value: 12, title: 'nu'}];
//         // =>
//         // config = {
//         //     ...,
//         //     data: {
//         //         datasets: [{
//         //             data: [20, 12],
//         //             backgroundColor: [...]
//         //         }],
//         //         label: ['nam', 'nu']
//         //     }
//         // }
//         //#endregion explain

//         if (!data || !data.map) data = [];
//         const dataValue = data.map(item => item.value);
//         const dataLabels = data.map(item => item.title);
//         return {
//             type: 'pie',
//             data: {
//                 datasets: [{
//                     data: dataValue,
//                     backgroundColor,
//                 }],
//                 labels: dataLabels
//             },
//             options: {
//                 responsive: true
//             }
//         }
//     }
// }

export class LineChart extends ChartBase {
    // static dataToConfig = (data, backgroundColor = Object.values(DefaultColors)) => {
    static dataToConfig = (data) => {
        //#region explain
        // data = [{ x: Date.newDate(-10), y: 10}, { x: Date.newDate(-9), y: 15}, { x: Date.newDate(-5), y: 20}, { x: new Date(), y: 5}];
        // =>
        // config = {
        //     ...,
        //     data: {
        //         datasets: [{
        //             data: [
        //                 { x: Date.newDate(-10), y: 10 },
        //                 { x: Date.newDate(-9), y: 15 },
        //                 { x: Date.newDate(-5), y: 20 },
        //                 { x: new Date(), y: 5 },
        //             ],
        //             backgroundColor: [...]
        //         }],
        //     }
        // }
        //#endregion explain
        const dataLabels = data.map(item => item.x || item.t);
        // let timeFormat = 'MM/DD/YYYY HH:mm';
        if (!data || !data.map) data = [];
        return {
            type: 'line',
            data: {
                datasets: [{
                    data,
                    // backgroundColor,
                    label: 'Hồ sơ',
                    backgroundColor: Chart.helpers.color(DefaultColors.red).alpha(0.5).rgbString(),
                    borderColor: DefaultColors.red,
                    fill: false,
                }],
                labels: dataLabels
            },
            options: {
                responsive: true,
                title: {
                    text: 'Chart.js Time Scale'
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            round: 'day',
                            tooltipFormat: 'll HH:mm'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'value'
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
            }

        };
    }
}
export class BarChart extends ChartBase {

    static dataToConfig = (data) => {
        //#region explain
        // data = [{ value: 20, title: 'nam'}, {value: 12, title: 'nu'}];
        // =>
        // config = {
        //     ...,
        //     data: {
        //         datasets: [{
        //             data: [20, 12],
        //             backgroundColor: [...]
        //         }],
        //         label: ['nam', 'nu']
        //     }
        // }
        //#endregion explain
        // if (!data || !data.map) data = [];
        if (!data) data = {};
        // const dataValue = data.data.value.map(item => item);
        const dataLabels = data.data.labels.map(item => item);

        return {
            type: 'bar',
            data: {
                ticks: {
                    align: 'bottom'
                },
                datasets: data.data.datasets,
                labels: dataLabels
            },
            options: {
                aspectRatio: 2,
                responsive: true,
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: data.xTitle,
                        },

                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: data.yTitle,
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
            }
        };
    }
}