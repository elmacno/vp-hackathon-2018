/* eslint jsx-a11y/img-redundant-alt: off */
/* globals THREE, requestAnimationFrame */
import React, { Component } from 'react';
import initializeRenderer from './utils/initializeRenderer';
import { initializeArToolkit, getMarker } from './utils/arToolkit';
import loadModel from './utils/modelLoader';

//import SketchRenderer from './SketchRenderer';
const { Camera, PerspectiveCamera, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Texture, AmbientLight } = THREE;

class Marker {
  constructor(scene, arToolkitContext, pattern, modelName) {
    this.scene = scene;
    this.pattern = pattern;
    this.modelName = modelName;
    
    this.markerRoot = new Group();
    this.scene.add(this.markerRoot);
    this.marker = getMarker(arToolkitContext, this.markerRoot, this.pattern);
    this.marker.addEventListener('markerFound', this.handleMarkerFound);
    this.markerRoot.add(new AmbientLight(0xaaaaaa))
  }

  setupModel = async () => {
    this.model = await loadModel(this.modelName);
    this.markerRoot.add(this.model);
    this.model.rotation.x = - Math.PI / 2; // -90°
    this.model.rotation.y = - Math.PI / 2; // -90°
  }

  handleMarkerFound = () => {

  }
}


const styles = {
  backButton: {
    zIndex: 1000,
    position: 'absolute',
    right: '1rem',
    top: '1rem',
  }
}
class Sketch extends Component {
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
    const camera = new PerspectiveCamera( 70, this.canvas.clientWidth / this.canvas.clientHeight, 1, 10000 );
    scene.add(camera);

    const onRenderFcts = [];
    const arToolkitContext = initializeArToolkit(renderer, camera, onRenderFcts);
    this.clippy = new Marker(scene, arToolkitContext, 'rcp', 'clippy');
    await this.clippy.setupModel();
    
    // render the scene
    onRenderFcts.push(function(){
        camera.lookAt( scene.position );
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

  render() {
    return (
      <canvas id="root" ref={this.storeRef} />
    );
  }
}

export default Sketch;
