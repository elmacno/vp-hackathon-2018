/* globals THREE, requestAnimationFrame */
import React, { Component } from 'react';
import initializeRenderer from './utils/initializeRenderer';
import { initializeArToolkit, getMarker } from './utils/arToolkit';
import detectEdge from './utils/detectEdge';
import loadModel from './utils/modelLoader';

export const sketchRendererFactory = ({ THREE, initializeArToolkit, initializeRenderer, getMarker, requestAnimationFrame, detectEdge }) => {
    const { Camera, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Texture, AmbientLight } = THREE;

    return class SketchRenderer extends Component {
        async componentDidMount() {
            const {
                opacity,
                coordX,
                coordZ,
                scaleX,
                scaleY,
                rotation,
                onMarkerFound,
            } = this.props;

            const renderer = this.renderer = initializeRenderer(this.canvas);

            const scene = new Scene();
            const camera = new Camera();
            scene.add(camera);

            const markerRoot = new Group();
            scene.add(markerRoot);
            const onRenderFcts = [];
            const arToolkitContext = initializeArToolkit(renderer, camera, onRenderFcts);
            const marker = getMarker(arToolkitContext, markerRoot);

            marker.addEventListener('markerFound', onMarkerFound);

            this.clippy = await loadModel();
            markerRoot.add(this.clippy);

            this.clippy.rotation.x = - Math.PI / 2; // -90°
            this.clippy.rotation.y = - Math.PI / 2; // -90°
            this.clippy.rotation.z = rotation;
            this.clippy.scale.x = scaleX;
            this.clippy.scale.y = scaleY;

            // Initialize lighting...
            var ambientLight = new AmbientLight(0xaaaaaa);
            markerRoot.add(ambientLight);

            // render the scene
            onRenderFcts.push(function(){
                renderer.render(scene, camera);
            });

            // run the rendering loop
            var lastTimeMsec = null;

            function animate(nowMsec) {
                // keep looping
                requestAnimationFrame(animate);
                // measure time
                lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
                const deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
                lastTimeMsec = nowMsec;
                // call each update function
                onRenderFcts.forEach(onRenderFct => {
                    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
                });
            }
            requestAnimationFrame(animate);
        }

        componentWillUnmount() {
            this.renderer.dispose();
        }

        storeRef = node => {
            this.canvas = node;
        }

        componentDidUpdate() {
            const { coordX, coordZ, scaleX, scaleY, rotation } = this.props;
            this.clippy.scale.x = scaleX;
            this.clippy.scale.y = scaleY;
            this.clippy.rotation.z = rotation;
            this.clippy.needsUpdate = true;         
        }

        render() {
            return (
                <canvas id="root" ref={this.storeRef} />
            );
        }
    }
};

export default sketchRendererFactory({
    THREE,
    initializeArToolkit,
    getMarker,
    initializeRenderer,
    requestAnimationFrame: requestAnimationFrame,
    detectEdge,
});
