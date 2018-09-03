/* eslint jsx-a11y/img-redundant-alt: off */
import React, { Component } from 'react';

import SketchRenderer from './SketchRenderer';

const styles = {
    backButton: {
        zIndex: 1000,
        position: 'absolute',
        right: '1rem',
        top: '1rem',
    }
}
class Sketch extends Component {
    state = {
        showTips: true,
        markerFound: false,
        opacity: 1,
        isDetectingEdge: false,
        blur: 2,
        highTreshold: 20,
        lowTreshold: 50,
        coord: {
            x: 2,
            z: 1,
        },
        rotation: 0,
        scale: {
            x: 1,
            y: 1,
        }
    };

    renderer = null;

    // shouldComponentUpdate(nextProps, state) {
    //     return !isEqual(state, this.state);
    // }

    handleBack = () => {
        setTimeout(() => {
            // We can't reset the AR.js created elements (no dispose, reset or destroy methods available)
            window.location.reload();
        }, 500);
    }

    handleTranslateChange = ({ x, z }) => this.setState({ coord: { x, z } });

    handleZoomChange = ({ x, y }) => this.setState({ scale: { x, y } });

    handleRotationChange = (rotation) => this.setState({ rotation });

    handleOpacityChange = (event, opacity) => this.setState({ opacity });

    handleDetectEdgeChange = () => this.setState({ isDetectingEdge: !this.state.isDetectingEdge });

    handleBlurChange = (event, blur) => this.setState({ blur });

    handleLowTresholdChange = (event, lowTreshold) => this.setState({ lowTreshold });

    handleHighTresholdChange = (event, highTreshold) => this.setState({ highTreshold });

    handleHideTips = () => this.setState({ showTips: false });

    handleMarkerFound = () => this.setState({ markerFound: true });

    render() {
        const {
            markerFound,
            showTips,
            opacity,
            isDetectingEdge,
            blur,
            lowTreshold,
            highTreshold,
            coord: {
                x: coordX,
                z: coordZ,
            },
            scale: {
                x: scaleX,
                y: scaleY,
            },
            rotation,
        } = this.state;

        const { image, blackImage } = this.props;

        return (
            <div>
                <SketchRenderer
                    coordX={coordX}
                    coordZ={coordZ}
                    scaleX={scaleX}
                    scaleY={scaleY}
                    rotation={rotation}
                    opacity={opacity}
                    isDetectingEdge={isDetectingEdge}
                    blur={blur}
                    lowTreshold={lowTreshold}
                    highTreshold={highTreshold}
                    image={image}
                    blackImage={blackImage}
                    onMarkerFound={this.handleMarkerFound}
                />
            </div>
        );
    }
}

export default Sketch;
