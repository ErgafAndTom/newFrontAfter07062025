import React from 'react';
// import { Canvas, useFrame } from "@react-three/fiber"
// import {
//     useGLTF,
//     ContactShadows,
//     Environment,
//     OrbitControls,
//     Bvh,
//     ArcballControls,
//     TrackballControls, PointerLockControls, PresentationControls, PerspectiveCamera
// } from "@react-three/drei"
// import {MyMugModel} from "./MyMugModel";

const ThreeScene = ({photo}) => {
    // const { enabled } = useControls({ enabled: true })

    // const gltf = useLoader(ColladaLoader, modelPath);
    // const loaderModel = new ColladaLoader();
    // loaderModel.load(modelPath, (collada) => {
    //     const mesh = collada.scene;
    //     scene.add(mesh);
    // });

    // const loader = new THREE.TextureLoader();
    // const texture = loader.load( 'resources/images/wall.jpg' );
    // texture.colorSpace = THREE.SRGBColorSpace;

    // const material = new THREE.MeshBasicMaterial({
    //     color: 0xFF8844,
    //     map: texture,
    // });

    return (
        // <Canvas shadows camera-position-z={40} camera-far={100} style={{ height: `25vw`, width: `25vw`}}>
        //     {/*<color attach="background" args={['#ffffff']} />*/}
        //     <ambientLight intensity={1.7}  />
        //     <spotLight position={[15, -5, 11]} angle={0.15} penumbra={1} intensity={444} />
        //     <directionalLight intenysity={1} position={[10, 10, 5]} />
        //     {/*<directionalLight intenysity={1} position={[5, 10, 5]} />*/}
        //
        //     {/*/!*<OrbitControls/>*!/*/}
        //     {/*<PresentationControls*/}
        //     {/*    enabled={true} // the controls can be disabled by setting this to false*/}
        //     {/*    global={false}*/}
        //     {/*    cursor={true}*/}
        //     {/*    polar={[-1, Math.PI / 2]}*/}
        //     {/*>*/}
        //     {/*    <MyMugModel  />*/}
        //     {/*</PresentationControls>*/}
        //
        //     <PerspectiveCamera
        //         makeDefault
        //         position={[0, 0, 10]} // Положення камери
        //     />
        //     <OrbitControls
        //         enableRotate
        //         enableZoom
        //     />
        //     <Suspense fallback={null}>
        //         <MyMugModel/>
        //     </Suspense>
        //
        // </Canvas>

        <div></div>

        // <Canvas camera-position-z={40}  camera-far={100} style={{ height: `50vw`}}>
        //     {/*<color attach="background" args={['#202025']} />*/}
        //     {/*<Perf position="bottom-right" style={{ margin: 10 }} />*/}
        //
        //     <ambientLight intensity={0.5} />
        //     <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        //
        //     {/*<Bvh firstHitOnly enabled={enabled}>*/}
        //     {/*    <Rays>*/}
        //     {/*        /!*<Torus />*!/*/}
        //     {/*        /!*<torusGeometry args={[1.29, .06, .16, 62]} />*!/*/}
        //     {/*        /!*<cylinderGeometry args={[1.27, 1, 2.4, 64, 12, true]} />*!/*/}
        //     {/*        /!*<sphereGeometry args={[3, 20, 30]} />*!/*/}
        //     {/*    </Rays>*/}
        //     {/*    /!*<cylinderGeometry args={[1.27, 1, 2.4, 64, 12, true]} />*!/*/}
        //     {/*</Bvh>*/}
        //     <OrbitControls />
        //     <MyMugModel />
        //     {/*<OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} enableZoom={false} enablePan={false} />*/}
        //     {/*<Picker />*/}
        // </Canvas>

        // <Canvas camera={{ position: [0, 0, 5] }} style={{ height: `50vw`}}>
        //     <ambientLight intensity={0.5} />
        //     <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        //     <OrbitControls />
        //
        //     <MyMugModel />
        // </Canvas>
    );
};

export default ThreeScene;