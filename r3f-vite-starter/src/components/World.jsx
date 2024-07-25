import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { Track } from "./Track";
import {
  Vector3,
  Quaternion,
  Raycaster,
  ArrowHelper,
  AxesHelper,
  Euler,
} from "three";

export const World = () => {
  const { scene, camera } = useThree();
  const box = useRef();
  const track = useRef();
  const leftIndicator = useRef();
  const rightIndicator = useRef();
  const velocity = useRef(new Vector3(0, 0, 0));
  const acceleration = useRef(new Vector3(0, 0, 0.05));
  //   const direction = useRef(new Vector3(1, 0, 0));
  const leftArrowDirection = useRef(new Vector3(1, 0, 0));
  const rightArrowDirection = useRef(new Vector3(-1, 0, 0));
  const forwardArrowDirection = useRef(new Vector3(0, 0, 1));

  const leftRaycaster = useRef(new Raycaster());
  const rightRaycaster = useRef(new Raycaster());

  const leftArrowHelper = useRef();
  const rightArrowHelper = useRef();
  const forwardArrowHelper = useRef();
  const boxAxesHelper = useRef();

  const addArrowHelper = (arrowRef, direction) => {
    arrowRef.current = new ArrowHelper(
      direction.current,
      new Vector3(0, 0, 0),
      3,
      0xff0000
    );
    scene.add(arrowRef.current);
  };

  const addRaycaster = (raycaster, position, direction) => {
    raycaster.current.set(position, direction);
    raycaster.current.layers.set(1);
  };

  useEffect(() => {
    camera.position.set(-50, 35, 0);

    track.current?.layers.set(1);

    addArrowHelper(leftArrowHelper, leftArrowDirection);
    addArrowHelper(rightArrowHelper, rightArrowDirection);
    addArrowHelper(forwardArrowHelper, forwardArrowDirection);

    boxAxesHelper.current = new AxesHelper(3);
    box.current.add(boxAxesHelper.current);

    camera.layers.enable(1);
  }, [scene, camera]);

  useFrame((state, delta) => {
    if (box.current) {
      acceleration.current
        .set(0, 0, 1)
        .applyQuaternion(box.current.quaternion)
        .normalize();

      velocity.current.addScaledVector(
        acceleration.current,
        Math.max(delta, 0.02)
      );

      box.current.position.addScaledVector(velocity.current, delta);

      addRaycaster(
        leftRaycaster,
        box.current.position,
        leftArrowDirection.current
      );

      addRaycaster(
        rightRaycaster,
        box.current.position,
        rightArrowDirection.current
      );

      leftArrowHelper.current.position.copy(box.current.position);
      leftArrowHelper.current.setDirection(leftArrowDirection.current);

      rightArrowHelper.current.position.copy(box.current.position);
      rightArrowHelper.current.setDirection(rightArrowDirection.current);

      forwardArrowHelper.current.position.copy(box.current.position);
      forwardArrowHelper.current.setDirection(forwardArrowDirection.current);

      const leftIntersects = leftRaycaster.current.intersectObjects(
        scene.children,
        true
      );

      const rightIntersects = rightRaycaster.current.intersectObjects(
        scene.children,
        true
      );

      if (leftIntersects.length > 0 && rightIntersects.length > 0) {
        const leftPoint = leftIntersects[0].point;
        const rightPoint = rightIntersects[0].point;

        leftIndicator.current.position.copy(leftPoint);
        rightIndicator.current.position.copy(rightPoint);

        // Calculate the central position between the intersection points
        const centralPosition = new Vector3()
          .addVectors(leftPoint, rightPoint)
          .multiplyScalar(0.5);
        box.current.position.copy(centralPosition);

        // Calculate the forward direction vector
        const normal = leftIntersects[0].face.normal;
        const up = new Vector3(0, 1, 0);
        const forward = new Vector3().crossVectors(normal, up).normalize();

        // Rotate the cube towards the new forward direction
        const quaternion = new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          forward
        );
        box.current.quaternion.slerp(quaternion, delta * 2);

        leftArrowDirection.current
          .set(1, 0, 0)
          .applyQuaternion(box.current.quaternion)
          .normalize();

        rightArrowDirection.current
          .set(-1, 0, 0)
          .applyQuaternion(box.current.quaternion)
          .normalize();

        forwardArrowDirection.current
          .set(0, 0, 1)
          .applyQuaternion(box.current.quaternion)
          .normalize();
      }
    }
  });

  return (
    <>
      <OrbitControls />
      <directionalLight
        castShadow // Enable casting shadows
        position={[-5, 5, 5]}
        shadow-mapSize-width={1024} // Optional: Increase shadow map resolution
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <mesh castShadow receiveShadow position={[-5, 0, 0]} ref={box}>
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>
      <Track scale={[2, 2, 2]} track={track} />
      <mesh ref={leftIndicator}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="green" />
      </mesh>
      <mesh ref={rightIndicator}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
      {/* Ground */}
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
