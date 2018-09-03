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
  constructor(scene, arToolkitContext, legend, pattern, modelName, callback) {
    this.scene = scene;
    this.legend = legend;
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
    this.model.scale.x = 2;
    this.model.scale.y = 2;
    this.model.scale.z = 2;


    this.textMeshes = [];
    let loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json', (font) => {
      let geometry = new THREE.TextGeometry(this.legend, {
        font: font
      });
      let material = new THREE.MeshPhongMaterial( 
        { color: 0x030303, specular: 0xffffff }
      );

      geometry.computeBoundingBox();
      let halfWidth = (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
      let mesh = new THREE.Mesh(geometry, material);
      
      mesh.rotation.x = - Math.PI / 4;
      mesh.rotation.z = 0;
      mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.0015;
      mesh.position.x = - halfWidth * 0.0015;
      mesh.position.y = -0.5;
      mesh.position.z = 0;
      this.textMeshes.push(mesh);
      this.markerRoot.add(mesh);
    });
  }

  update = (delta) => {
  }

  handleMarkerFound = () => {
    this.markerCallback(this.pattern);
  }
}

class Sketch extends Component {
  state = {
    displayMenu: true,
    markerName: 'rcp'
  }

  names = {
    rcp: "Macarena",
    hr: "Daniela"
  }

  actions = {
    rcp: [{
      link: 'mailto:macarena.ordiz@endava.com?subject=Reservar%20cochera',
      image: 'fa fa-car',
      title: 'Reservar una cochera'
    },
    {
      link: 'mailto:macarena.ordiz@endava.com?subject=Empanadas%20por%20favor!',
      image: 'fas fa-utensils',
      title: 'Pedir empanadas'
    },
    {
      link: 'mailto:macarena.ordiz@endava.com?subject=Empanadas%20por%20favor!',
      image: 'fas fa-plane-departure',
      title: 'Travel Policy'
    },
    {
      link: 'mailto:macarena.ordiz@endava.com?subject=Empanadas%20por%20favor!',
      image: 'fas fa-globe-americas',
      title: 'Visa'
    }],
    hr: [{
      link: 'mailto:daniela.martin@endava.com?subject=Recibos%20de%20sueldo',
      image: 'fas fa-dollar-sign',
      title: 'Recibos de sueldo'
    },
    {
      link: 'mailto:daniela.martin@endava.com?subject=Agregar%20familiar%20OSDE',
      image: 'fas fa-notes-medical',
      title: 'Agregar Familiar OSDE'
    },{
      link: 'mailto:daniela.martin@endava.com?subject=Licencia',
      image: 'fas fa-bed',
      title: 'Licencias'
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
    this.duck = new Marker(scene, arToolkitContext, 'Recepción', 'rcp', 'duck', this.handleMarkerFound);
    this.computer = new Marker(scene, arToolkitContext, 'Recursos Humanos', 'hr', 'computer', this.handleMarkerFound);
    await this.duck.setupModel();
    await this.computer.setupModel();

    // render the scene
    onRenderFcts.push((delta) => {
        this.duck.update(delta);
        this.computer.update(delta);
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
    const name = this.names[markerName] || "";
    return (
      <div className="container">
        <canvas style={{flex:1}} id="root" ref={this.storeRef} />
        <div id="menu" style={{height: displayMenu ? '30%': 0}}>
          <div className="exit">
            <span className="button">
              <i onClick={() => this.setState({displayMenu: false})} className="fa fa-times" />
            </span>
          </div>
          <h3>Hola!! Soy {name}, en que te puedo ayudar?</h3>
          <div className="action-container">
            {
              actions.map((action) => {
                return (
                  <a className="action" href={action.link}>
                    <i className={ 'fa-3x ' + action.image}></i>
                    <span >{action.title}</span>
                  </a>
              )})
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Sketch;
