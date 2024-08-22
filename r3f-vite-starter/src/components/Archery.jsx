import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Quaternion, Box3 } from "three";
import gsap from "gsap";
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

  const handleKeyDown = (event) => {
    const bow = archerRefs.bowRef.current;
    const arrow = archerRefs.arrow1Ref.current;

    switch (event.key) {
      case " ":
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
        break;

      case "1":
        moveToPosition(
          [bow.position.x - 3, bow.position.y + 2, bow.position.z],
          new Vector3(0, 0, 0)
        );
        break;
    }
  };

  useEffect(() => {
    camera.position.set(-1, 1, -3);
    camera.layers.enable(1);

    targetRef.current.position.set(0, 0.5, 30);
    camera.lookAt(targetRef.current.position);

    const bow = archerRefs.bowRef.current;
    const arrow = archerRefs.arrow1Ref.current;

    if (bow && arrow) {
      arrow.position.copy(bow.position);
      arrow.rotation.copy(bow.rotation);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      scene.remove(arrowHelper);
    };
  }, [scene, camera]);

  useFrame((state, delta) => {
    const bow = archerRefs.bowRef.current;
    const arrow = archerRefs.arrow1Ref.current;

    if (bow && arrow && !isArrowFiredRef.current) {
      bow.rotation.set(pitch, yaw, 0);
      arrow.rotation.copy(bow.rotation);
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

  const moveToPosition = (position, targetVector, duration = 0.5) => {
    // Store the initial quaternion
    const initialQuaternion = camera.quaternion.clone();

    // Move the camera to the target position first
    gsap.to(camera.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration: duration,
      onUpdate: function () {
        // Calculate the target quaternion by making the camera look at the target
        camera.lookAt(targetVector);
        const targetQuaternion = camera.quaternion.clone();

        // Slerp between the initial and target quaternion
        camera.quaternion.slerpQuaternions(
          initialQuaternion,
          targetQuaternion,
          this.progress()
        );
      },
      onComplete: () => {
        // Ensure final orientation is correct after animation
        camera.lookAt(targetVector);
      },
    });
  };

  return (
    <>
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
