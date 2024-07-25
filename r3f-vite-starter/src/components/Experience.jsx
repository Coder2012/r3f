import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { Vector3, Quaternion, Raycaster, ArrowHelper } from "three";
import { Turret } from "./Turret";

extend({ ArrowHelper });

export const Experience = ({ isFiring }) => {
  const velocity = useRef(new Vector3(0, 0, 0));
  const gravity = useRef(new Vector3(0, -1, 0));
  const acceleration = useRef(new Vector3(0.05, 0, 0));
  const direction = useRef(new Vector3(1, 0, 0));
  const raycaster = useRef(new Raycaster());
  const arrowHelper = useRef();
  const obj = useRef();
  const indicator = useRef();
  const missile = useRef();
  const missileDirection = useRef(new Vector3(0, 0, 0));
  const cannon = useRef();
  const cannonPosition = useRef(new Vector3(0, 0, 0));
  const initialMissilePosition = useRef(new Vector3());
  const initialMissileQuaternion = useRef(new Quaternion());
  const firedMissile = useRef(false);

  const { scene, camera } = useThree();
  const { nodes } = useGLTF("turret.glb");

  useEffect(() => {
    if (obj.current) {
      obj.current.layers.set(0); // Cube on layer 0

      // Set the arrow helper to visualize the ray direction
      arrowHelper.current = new ArrowHelper(
        direction.current,
        new Vector3(0, 0, 0),
        100,
        0xff0000
      );
      scene.add(arrowHelper.current);

      // Assign walls and indicator to their respective layers
      scene.children.forEach((child) => {
        if (child.name === "northWall" || child.name === "southWall") {
          child.layers.set(1); // Walls on layer 1
        }
        if (child === indicator.current) {
          indicator.current.layers.set(2); // Indicator on layer 2
        }
      });

      // Ensure the camera renders both layer 0 and layer 1
      camera.position.set(-50, 5, 0);
      camera.layers.enable(0); // Default layer
      camera.layers.enable(1); // Walls layer
      camera.layers.enable(2); // indicator layer
    }
  }, [scene, camera]);

  useFrame((state, delta) => {
    if (obj.current) {
      velocity.current.addScaledVector(acceleration.current, delta);
      obj.current.position.addScaledVector(velocity.current, delta);

      direction.current
        .set(1, 0, 0)
        .applyQuaternion(obj.current.quaternion)
        .normalize();

      raycaster.current.set(obj.current.position, direction.current);

      arrowHelper.current.position.copy(obj.current.position);
      arrowHelper.current.setDirection(direction.current);

      // Enable the raycaster to only check layer 1 (walls)
      raycaster.current.layers.set(1);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );
      if (intersects.length > 0) {
        indicator.current.position.copy(intersects[0].point);
      }
    }
    if (missile.current) {
      if (!isFiring && !firedMissile.current) {
        // Get the direction vector from the cannon
        cannon.current.getWorldDirection(missileDirection.current);

        // Get the world position of the cannon
        cannon.current.getWorldPosition(cannonPosition.current);

        // Get the world quaternion of the cannon for rotation
        cannon.current.getWorldQuaternion(initialMissileQuaternion.current);

        // Align the projectile with the cannon position
        const offset = missileDirection.current.clone().multiplyScalar(1); // Adjust the offset as needed
        const missilePosition = cannonPosition.current.clone().add(offset);

        missile.current.position.copy(missilePosition);
        missile.current.quaternion.copy(initialMissileQuaternion.current);
      } else if (isFiring && !firedMissile.current) {
        // Capture initial state on firing
        initialMissilePosition.current.copy(missile.current.position);
        missileDirection.current.normalize(); // Ensure direction is normalized
        firedMissile.current = true;
      }

      if (firedMissile.current) {
        // Apply movement to the missile
        const speed = 0.5; // Adjust the speed as needed
        const velocity = missileDirection.current.clone().multiplyScalar(speed);
        const g = gravity.current.clone().multiplyScalar(0.3);

        missile.current.position.add(velocity);
        missile.current.position.add(g);
      }
      firedMissile.current = isFiring;
    }
  });

  return (
    <>
      <OrbitControls />
      <directionalLight
        castShadow // Enable casting shadows
        position={[5, 5, 5]}
        shadow-mapSize-width={1024} // Optional: Increase shadow map resolution
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Turret cannonRef={cannon} />
      <mesh
        ref={missile}
        castShadow
        receiveShadow
        geometry={nodes.missile.geometry}
        material={nodes.missile.material}
      />
      <mesh rotation-y={Math.PI / 4} position={[-5, 0, 0]} ref={obj}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
      {/* North Wall */}
      <mesh name="northWall" position={[0, 0, -3]} scale={[10, 1, 1]}>
        <boxGeometry />
        <meshNormalMaterial color="blue" />
      </mesh>
      {/* South Wall */}
      <mesh name="southWall" position={[0, 0, 3]} scale={[10, 1, 1]}>
        <boxGeometry />
        <meshNormalMaterial color="blue" />
      </mesh>
      {/* Ground */}
      <mesh
        castShadow
        receiveShadow
        scale={[20, 20, 1]}
        rotation-x={-Math.PI / 2}
        position-y={-0.5}
      >
        <planeGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh ref={indicator}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};
