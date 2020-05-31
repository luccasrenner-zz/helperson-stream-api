import Camera from './services/camera/index';

const cameraService = new Camera('#myMirror');
cameraService.askForPermision();
