/* globals THREE */
const { Color, WebGLRenderer } = THREE;

export default (canvas) => {
    const renderer = new WebGLRenderer({ alpha: true, canvas, antialias: true, powerPreference: 'high-performance' });

    renderer.setClearColor(new Color('lightgrey'), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';

    return renderer;
};
