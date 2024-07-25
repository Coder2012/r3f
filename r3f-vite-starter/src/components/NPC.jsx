import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const NPC = ({ vehicleRef, entityManagerRef, timeRef }) => {
  const npcRef = useRef();

  useFrame(() => {
    if (npcRef.current) {
      const delta = timeRef.current.update().getDelta();
      entityManagerRef.current.update(delta);

      // Sync the position and orientation of the NPC with the vehicle
      const vehicle = vehicleRef.current;
      npcRef.current.position.copy(vehicle.position);
      npcRef.current.quaternion.copy(vehicle.rotation);
    }
  });

  return (
    <mesh ref={npcRef} position={[0, 0.25, 0]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};
