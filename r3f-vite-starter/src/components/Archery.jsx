import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Quaternion, ArrowHelper, Box3 } from "three";
import { Target } from "./Target";
import { Archer } from "./Archer";

export const Archery = ({ pitch, yaw }) => {
  const { scene, camera } = useThree();
  const targetRef = useRef();

  const archerRefs = {
    containerRef: useRef(),
    bowRef: useRef(),
    arrow1Ref: useRef(),
  };

  const velocityRef = useRef(new Vector3());
  const isArrowFiredRef = useRef(false);
  const gravityRef = useRef(new Vector3(0, -9.81, 0));

  const forwardDirectionRef = useRef(new Vector3());
  const arrowHelperRef = useRef();

  const handleKeyDown = (event) => {
    if (event.key === " ") {
      const arrow = archerRefs.arrow1Ref.current;
      const initialSpeed = 27; // Adjust this value as needed

      // Get the arrow's world quaternion
      const arrowQuaternion = new Quaternion();
      arrow.getWorldQuaternion(arrowQuaternion);

      // Set the initial velocity based on the arrow's orientation
      velocityRef.current
        .set(0, 0, 1)
        .applyQuaternion(arrowQuaternion)
        .multiplyScalar(initialSpeed);
      isArrowFiredRef.current = true;
    }
  };

  useEffect(() => {
    camera.position.set(0, 3, -3);
    camera.layers.enable(1);

    targetRef.current.position.set(0, 0.5, 30);

    const bow = archerRefs.bowRef.current;
    const arrow = archerRefs.arrow1Ref.current;

    if (bow && arrow) {
      arrow.position.copy(bow.position);
      arrow.rotation.copy(bow.rotation);
    }

    const arrowHelper = new ArrowHelper(
      new Vector3(0, 0, 1),
      bow.position,
      1,
      0xff0000
    );
    scene.add(arrowHelper);
    arrowHelperRef.current = arrowHelper;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      scene.remove(arrowHelper);
    };
  }, [scene, camera]);

  useFrame((state, delta) => {
    camera.lookAt(targetRef.current.position);

    const bow = archerRefs.bowRef.current;
    const arrow = archerRefs.arrow1Ref.current;

    if (bow && arrow && !isArrowFiredRef.current) {
      bow.rotation.set(pitch, yaw, 0);
      arrow.rotation.copy(bow.rotation);

      arrow.getWorldDirection(forwardDirectionRef.current);
      arrowHelperRef.current.setDirection(forwardDirectionRef.current);
      arrowHelperRef.current.position.copy(bow.position);
    }

    if (arrow && isArrowFiredRef.current) {
      // Apply gravity to velocity
      velocityRef.current.addScaledVector(gravityRef.current, delta);

      // Update arrow position
      arrow.position.addScaledVector(velocityRef.current, delta);

      // Calculate direction of travel
      const direction = velocityRef.current.clone().normalize();

      // Update arrow rotation to match direction of travel
      const quaternion = new Quaternion();
      quaternion.setFromUnitVectors(new Vector3(0, 0, 1), direction);
      arrow.quaternion.copy(quaternion);

      // Check for collision with target
      const arrowTipPosition = arrow.position
        .clone()
        .add(direction.clone().multiplyScalar(0.3)); // Calculate arrow tip position
      const targetBox = new Box3().setFromObject(targetRef.current);

      if (targetBox.containsPoint(arrowTipPosition)) {
        console.log("Hit!");

        // Stop the arrow
        // isArrowFiredRef.current = false;
        // velocityRef.current.set(0, 0, 0); // Stop velocity

        // Optionally, slightly embed the arrow into the target
        // arrow.position.copy(
        //   arrowTipPosition.clone().sub(direction.multiplyScalar(0.1))
        // );

        // Prevent further movement by setting the arrow to null
        archerRefs.arrow1Ref.current = null;
        camera.position.set(1, 2, 28);
      }
    }
  });

  return (
    <>
      <OrbitControls />
      <directionalLight
        castShadow
        position={[5, 15, -5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Archer {...archerRefs} />
      <Target targetRef={targetRef} />
      <mesh
        receiveShadow
        scale={[10, 100, 1]}
        rotation-x={-Math.PI / 2}
        position={[0, -0.3, 0]}
      >
        <planeGeometry />
        <meshStandardMaterial color="#628297" />
      </mesh>
    </>
  );
};
