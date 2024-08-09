import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Quaternion, AxesHelper } from "three";
import { Target } from "./Target";
import { Archer } from "./Archer";

export const Archery = () => {
  const { scene, camera } = useThree();
  const targetRef = useRef();

  const handleKeyDown = (event) => {

    switch (event.key) {
      case "w":

        break;
      default:
        break;
    }
  };

  const rotateAroundWorldAxis = (object, axis, angle) => {
    const quaternion = new Quaternion();
    quaternion.setFromAxisAngle(axis, angle);
    object.applyQuaternion(quaternion);

    // Update the position to maintain the orbit distance
    object.position.applyQuaternion(quaternion);
  };

  useEffect(() => {
    camera.position.set(-20, 5, 0);
    camera.layers.enable(1);

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene, camera]);

  useFrame(() => {

  });

  return (
    <>
      <OrbitControls />
      <directionalLight
        castShadow
        position={[-5, 5, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Archer />
      <Target targetRef={targetRef} />
      <mesh
        castShadow
        receiveShadow
        scale={[20, 30, 1]}
        rotation-x={-Math.PI / 2}
        position-y={-0.4}
      >
        <planeGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
};
