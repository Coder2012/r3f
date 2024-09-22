import React from "react";
import { useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { NPC } from "./NPC";
import { Floor } from "./Floor";
import * as THREE from "three";
import { Vector3 as YukaVector3 } from "yuka";
import { usePathfinding } from "../hooks/usePathfinding";
import { EnvironmentFloor } from "./EnvironmentFloor";

export const Scene = ({ navMeshUrl }) => {
  const { camera, gl } = useThree();
  const { navMeshRef, vehicleRef, entityManagerRef, timeRef, navMeshGroupRef } =
    usePathfinding(navMeshUrl);

  const handleClick = (event) => {
    if (!navMeshRef.current) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(navMeshGroupRef.current, true);
    console.log(intersects);

    if (intersects.length > 0) {
      const target = new YukaVector3().copy(intersects[0].point);

      const path = navMeshRef.current.findPath(
        vehicleRef.current.position,
        target
      );
      const followPathBehavior = vehicleRef.current.steering.behaviors[0];
      followPathBehavior.active = true;
      followPathBehavior.path.clear();

      for (const point of path) {
        followPathBehavior.path.add(point);
      }
    }
  };

  return (
    <group onPointerDown={handleClick}>
      <OrbitControls />
      <Environment preset="sunset" />

      <Floor />
      <EnvironmentFloor />
      <NPC
        vehicleRef={vehicleRef}
        entityManagerRef={entityManagerRef}
        timeRef={timeRef}
      />
    </group>
  );
};
