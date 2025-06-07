import React, {useRef} from 'react';
// import modelPath from "./modells/uploads_files_1855137_coffee_mug_1.3ds";
// import {useLoader} from "react-three-fiber";
// import {TDSLoader} from 'three/addons/loaders/TDSLoader';

export const MyMugModel = ({photo}) => {
    const group = useRef();
    // const mugModel = useLoader(TDSLoader, modelPath);

    // const loader = new THREE.TextureLoader();
    // // const texture = loader.load( texturePath );
    // loader.load(texturePath, (texture) => {
    //     const material = new THREE.MeshBasicMaterial({
    //         map: texture,
    //     });
    //     mugModel.traverse((child) => {
    //         if (child instanceof THREE.Mesh) {
    //             child.material = material;
    //
    //         }
    //     });
    // });

    // mugModel.scale.set(28, 28, 28);
    // mugModel.position.set(0, 0, -0.6);
    // mugModel.rotation.set(-0.9, 0, 0);


    return (
        <mesh ref={group}>
            {/*<primitive object={mugModel} />*/}
        </mesh>
    );
}