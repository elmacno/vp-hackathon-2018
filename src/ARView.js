/* eslint jsx-a11y/img-redundant-alt: off */
/* globals THREE, requestAnimationFrame */
import React, { Component } from 'react';
import initializeRenderer from './utils/initializeRenderer';
import { initializeArToolkit, getMarker } from './utils/arToolkit';
import loadModel from './utils/modelLoader';
import './ARView.css';

//import SketchRenderer from './SketchRenderer';
const { Camera, PerspectiveCamera, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Texture, AmbientLight } = THREE;

class Marker {
  constructor(scene, arToolkitContext, pattern, modelName, callback) {
    this.scene = scene;
    this.pattern = pattern;
    this.modelName = modelName;
    this.markerCallback = callback;

    this.markerRoot = new Group();
    this.scene.add(this.markerRoot);
    this.marker = getMarker(arToolkitContext, this.markerRoot, this.pattern);
    this.marker.addEventListener('markerFound', this.handleMarkerFound);
    this.markerRoot.add(new AmbientLight(0xaaaaaa))
  }

  setupModel = async () => {
    this.model = await loadModel(this.modelName);
    this.markerRoot.add(this.model);
    this.model.rotation.y = Math.PI; // -90°
    this.model.scale.x = 2; // -90°
    this.model.scale.y = 2; // -90°
    this.model.scale.z = 2; // -90°
  }

  handleMarkerFound = () => {
    this.markerCallback(this.pattern);
  }
}

class Sketch extends Component {
  state = {
    displayMenu: false,
    markerName: ''
  }

  actions = {
    rcp: [{
      link: 'mailto:macarena.ordiz@endava.com&subject=Reservar%20cochera',
      image: '',
      title: 'Reservar una cochera'
    },
    {
      link: 'mailto:macarena.ordiz@endava.com&subject=Empanadas%20por%20favor!',
      image: '',
      title: 'Pedir empanadas'
    },
    {
      link: 'mailto:macarena.ordiz@endava.com&subject=Empanadas%20por%20favor!',
      image: '',
      title: 'Travel Policy'
    },
    {
      link: 'mailto:macarena.ordiz@endava.com&subject=Empanadas%20por%20favor!',
      image: '',
      title: 'Visa'
    }],
    hr: [{
      link: 'mailto:macarena.ordiz@endava.com&subject=Empanadas%20por%20favor!',
      image: '',
      title: 'Pedir empanadas'
    }]
  }

  handleMarkerFound = (name) => {
    this.setState({
      displayMenu: true,
      markerName: name
    })
  }

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
    this.duck = new Marker(scene, arToolkitContext, 'rcp', 'duck', this.handleMarkerFound);
    this.computer = new Marker(scene, arToolkitContext, 'hr', 'computer', this.handleMarkerFound);
    await this.duck.setupModel();
    await this.computer.setupModel();

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
    const { displayMenu, markerName } = this.state;
    const actions = this.actions[markerName] || [];
    return (
      <div className="container">
        <canvas style={{flex:1}} id="root" ref={this.storeRef} />
        <div id="menu" style={{height: displayMenu ? '25%': 0}}>
          {
            actions.map((action) => {
              return (
                <span className="action">
                  <a href={action.link}><h2>{action.title}</h2></a>
                </span>
            )})
          }
        </div>
      </div>
    );
  }
}

export default Sketch;
