/* globals THREE, requestAnimationFrame */
import '../utils/models/MTLLoader';
import '../utils/models/OBJLoader';

let loadModel = (model) => {
  let obj = require(`../assets/${model}/model.obj`);
  let material = require(`../assets/${model}/materials.mtl`);

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