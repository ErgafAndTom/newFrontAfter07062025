// import { useRef } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { Bvh, OrbitControls, useHelper } from '@react-three/drei'
// import { MeshBVHVisualizer } from 'three-mesh-bvh'
//
// export const Torus = (props) => {
//     const mesh = useRef()
//     const sphere = useRef()
//     useHelper(mesh, MeshBVHVisualizer)
//     useFrame((state, delta) => (mesh.current.rotation.x = mesh.current.rotation.y += delta))
//     return (
//         <mesh
//             ref={mesh}
//             {...props}
//             onPointerMove={(e) => sphere.current.position.copy(mesh.current.worldToLocal(e.point))}
//             onPointerOver={() => (sphere.current.visible = true)}
//             onPointerOut={() => (sphere.current.visible = false)}>
//             <torusKnotGeometry args={[1, 0.4, 200, 50]} />
//             <meshNormalMaterial />
//             <mesh raycast={() => null} ref={sphere} visible={false}>
//                 <sphereGeometry args={[0.2]} />
//                 <meshBasicMaterial color="orange" toneMapped={false} />
//             </mesh>
//         </mesh>
//     )
// }
