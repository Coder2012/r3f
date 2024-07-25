import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Quaternion, AxesHelper } from "three";
import { Target } from "./Target";

export const Archery = () => {
  const { scene, camera } = useThree();
  const box = useRef();
  const boxAxesHelper = useRef();
  const orbitDistance = 4; // Distance from the origin for world space rotation

  const handleKeyDown = (event) => {
    if (!box.current) return;
    const rotationSpeed = 0.1;

    switch (event.key) {
      // Local space rotations
      case "w":
        box.current.rotation.x += rotationSpeed;
        break;
      case "s":
        box.current.rotation.x -= rotationSpeed;
        break;
      case "a":
        box.current.rotation.y += rotationSpeed;
        break;
      case "d":
        box.current.rotation.y -= rotationSpeed;
        break;
      case "q":
        box.current.rotation.z += rotationSpeed;
        break;
      case "e":
        box.current.rotation.z -= rotationSpeed;
        break;

      // World space rotations (orbit around the origin)
      case "ArrowUp":
        rotateAroundWorldAxis(box.current, new Vector3(1, 0, 0), rotationSpeed);
        break;
      case "ArrowDown":
        rotateAroundWorldAxis(
          box.current,
          new Vector3(1, 0, 0),
          -rotationSpeed
        );
        break;
      case "ArrowLeft":
        rotateAroundWorldAxis(box.current, new Vector3(0, 1, 0), rotationSpeed);
        break;
      case "ArrowRight":
        rotateAroundWorldAxis(
          box.current,
          new Vector3(0, 1, 0),
          -rotationSpeed
        );
        break;
      case "PageUp":
        rotateAroundWorldAxis(box.current, new Vector3(0, 0, 1), rotationSpeed);
        break;
      case "PageDown":
        rotateAroundWorldAxis(
          box.current,
          new Vector3(0, 0, 1),
          -rotationSpeed
        );
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
    camera.position.set(-50, 35, 0);

    boxAxesHelper.current = new AxesHelper(3);
    scene.add(boxAxesHelper.current);

    // Set initial position for orbit demonstration
    box.current.position.set(0, 0, orbitDistance);

    box.current.rotation.y = Math.PI / 4;

    camera.layers.enable(1);

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scene, camera]);

  useFrame(() => {
    if (box.current) {
      boxAxesHelper.current.position.copy(box.current.position);
      boxAxesHelper.current.rotation.copy(box.current.rotation);
    }
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
      <Target />
      <mesh castShadow receiveShadow ref={box}>
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>
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
