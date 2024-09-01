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
  const gravityRef = useRef(new Vector3(0, -9.81, 0));
  const arrowFiredRef = useRef(false);
  const arrowHitRef = useRef(false);

  let bow;
  let arrow;
  let target;
  const velocity = velocityRef.current;
  const gravity = gravityRef.current;
  let hasArrowFired = arrowFiredRef.current;
  let hasArrowHit = arrowHitRef.current;

  const handleKeyDown = (event) => {
    switch (event.key) {
      case " ":
        const initialSpeed = 27; // Adjust this value as needed

        // Get the arrow's world quaternion
        const arrowQuaternion = new Quaternion();
        arrow.getWorldQuaternion(arrowQuaternion);

        // Set the initial velocity based on the arrow's orientation
        velocity
          .set(0, 0, 1)
          .applyQuaternion(arrowQuaternion)
          .multiplyScalar(initialSpeed);
        hasArrowFired = true;
        break;

      case "1":
        console.log(bow.position)
        moveToPosition(
          [bow.position.x - 3, bow.position.y + 2, bow.position.z],
          new Vector3(0, 0, 0)
        );
        break;
      
      case "r":
        reset();
        break;
    }
  };

  const reset = () => {
    hasArrowFired = false;
    hasArrowHit = false;
    velocity.set(0, 0, 0);
    arrow.position.copy(bow.position);
    arrow.rotation.copy(bow.rotation);

    resetCamera();
  }

  const resetCamera = () => {
    camera.position.set(-1, 1, -3);
    camera.lookAt(target.position);
  }

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

  useEffect(() => {
    console.log('useEffect')
    bow = archerRefs.bowRef.current;
    arrow = archerRefs.arrow1Ref.current;
    target = targetRef.current;

    target.position.set(0, 0.5, 30);
    resetCamera();

    if (bow && arrow) {
      arrow.position.copy(bow.position);
      arrow.rotation.copy(bow.rotation);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      console.log('unmounted')
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scene, camera, pitch]);

  useFrame((state, delta) => {
    const scaledDelta = delta * .8;

    if (bow && arrow && !hasArrowFired) {
      bow.rotation.set(pitch, yaw, 0);
      arrow.rotation.copy(bow.rotation);
    }

    if (arrow && !hasArrowHit && hasArrowFired) {
      // Apply gravity to velocity
      velocity.addScaledVector(gravity, scaledDelta);

      // Update arrow position
      arrow.position.addScaledVector(velocity, scaledDelta);

      // Calculate direction of travel
      const direction = velocity.clone().normalize();

      // Update arrow rotation to match direction of travel
      const quaternion = new Quaternion();
      quaternion.setFromUnitVectors(new Vector3(0, 0, 1), direction);
      arrow.quaternion.copy(quaternion);

      // Check for collision with target
      const arrowTipPosition = arrow.position
        .clone()
        .add(direction.clone().multiplyScalar(0.3)); // Calculate arrow tip position
      const targetBox = new Box3().setFromObject(target);

      if (targetBox.containsPoint(arrowTipPosition)) {
        console.log("Hit!");

        hasArrowHit = true;
        velocity.set(0, 0, 0);

        moveToPosition(
          [target.position.x - 3, target.position.y + 2, target.position.z - 1],
          target.position
        );
      }

      if(arrow.position.z > target.position.z){
        console.log('arrow past target')
        reset();
      }
    }
  });

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
