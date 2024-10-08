/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Floor(props) {
  const { nodes, materials } = useGLTF("/floor1.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.NavMesh.geometry}
        material={materials.Material}
      />
    </group>
  );
}

useGLTF.preload("/floor1.glb");
