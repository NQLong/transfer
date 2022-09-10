import { Tooltip } from '@mui/material';
import { Buffer } from 'buffer';
import { PDFDocument, rgb } from 'pdf-lib';
import React from 'react';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import { AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
// const { vanBanDi } = require('../../constant');


export default class PdfViewer extends AdminModal {

    state = { scale: 1, page: 1, pages: 0, height: 50, width: 50 }

    onShow = (props) => {
        // console.log({props});
        this.setState({ ...props }, () => {
            const url = props.url || `/api/hcth/van-ban-di/file/${props.id}`;
            T.get(url, {}, async (res) => {
                const buffer = Buffer.from(res.data, 'base64');
                this.setState({ file: buffer, outFile: buffer }, this.setBuffer);
            });
        });
    }

    setBuffer = async () => {
        const { xCoordinate, yCoordinate, pageNumber, height, width, file } = this.state;
        if (pageNumber != null) {
            const document = await PDFDocument.load(file);
            const documentPages = document.getPages();
            const page = documentPages[pageNumber - 1];
            const { height: pageHeight } = page.getSize();
            page.drawRectangle({
                x: Math.round(xCoordinate - width / 2), y: Math.round(pageHeight - height / 2 - yCoordinate),
                width, height,
                color: rgb(0.75, 0.2, 0.2), opacity: 0.5,
            });
            this.setState({ outFile: await document.save() });
        }
    }

    onHide = () => {
        this.setState({ content: null });
    }

    handleClick = (event) => {
        // console.log(event);
        // console.log(event.target.getBoundingClientRect())
        let bounds = event.target.getBoundingClientRect();
        let x = event.clientX - bounds.left;
        let y = event.clientY - bounds.top;
        this.setState({ xCoordinate: Math.round(x / this.state.scale), yCoordinate: Math.round(y / this.state.scale), pageNumber: this.state.page }, this.setBuffer);
    }

    onSubmit = () => {
        // const { xCoordinate, yCoordinate, page } = this.state;
        this.state.submit && this.state.submit({ xCoordinate: this.state.xCoordinate, yCoordinate: this.state.yCoordinate, pageNumber: this.state.pageNumber });
        this.hide();
    }


    onHide = () => {
        // this.setState
    }

    onChangePage = () => {

    }

    onChangeScale = (value) => {
        const newValue = this.state.scale + value;
        if (newValue >= 0.5 && newValue <= 3)
            this.setState({ scale: newValue });
    }


    render = () => {
        return this.renderModal({
            title: this.props.fileName,
            isShowSubmit: this.state.xCoordinate != null && this.state.yCoordinate && this.state.pageNumber && !this.state.readOnly,
            style: { zIndex: 10000 },
            size: 'elarge',
            body: this.state.file && <div className='row' style={{ width: '100%', heigth: '60vh' }}>
                <div className='col-md-12 d-flex justify-content-between' style={{}}>
                    <div className='d-flex justify-content-start' style={{ gap: 10, flex: 2 }}>
                        <Tooltip title='Thu nhỏ' arrow>
                            <button className='btn btn-info' onClick={() => this.onChangeScale(-0.25)}><i className='fa fa-lg fa-search-minus' /></button>
                        </Tooltip>
                        <Tooltip title='Phóng to' arrow>
                            <button className='btn btn-info' onClick={() => this.onChangeScale(0.25)}><i className='fa fa-lg fa-search-plus' /></button>
                        </Tooltip>
                    </div>

                    <Pagination fixedSize style={{ position: 'unset', flex: 1 }} pageNumber={this.state.page} pageSize={1} pageTotal={this.state.pages} totalItem={this.state.pages} getPage={(pageNumber) => this.setState({ page: pageNumber })} />
                </div>

                <div className='col-md-12 d-flex justify-content-center' style={{ background: 'grey', padding: 10, marginTop: 10, minHeight: '70vh', maxHeight: '70vh', overflow: 'auto' }}>
                    <div className='d-flex' style={{ height: 'fit-content', width: 'fit-content', display: 'inline-block' }} >
                        {/* <div disabled style={{ pointerEvents: 'none', cursor: 'default' }}> */}
                        <Document onLoadSuccess={(data) => !this.state.pages && this.setState({ pages: data.numPages })} file={{ data: this.state.outFile }}>
                            <Page onClick={!this.state.readOnly ? (e) => this.handleClick(e) : null} scale={this.state.scale} pageNumber={this.state.page} />
                        </Document>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        });
    }
}