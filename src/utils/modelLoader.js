/* globals THREE, requestAnimationFrame */
import '../utils/models/MTLLoader';
import '../utils/models/OBJLoader';
import obj from '../assets/clippy/model.obj';
import material from '../assets/clippy/material.mtl';

let loadModel = () => {
  return new Promise((resolve, reject) => {
    var loader = new THREE.MTLLoader();
    loader.setCrossOrigin(true);
    loader.load(material, function(materials) {
      loader = new THREE.OBJLoader();
      loader.setMaterials(materials);
      loader.load(obj, async function(object) {
          resolve(object);
      });
    });
  });
}

export default loadModel