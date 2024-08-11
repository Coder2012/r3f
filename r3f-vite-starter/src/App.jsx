import React from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./components/Scene";
import { Archery } from "./components/Archery";

const App = () => {
  const pitch = -12 * (Math.PI / 180);
  const yaw = 0 * (Math.PI / 180);

  return (
    <Canvas shadows camera={{ fov: 50 }}>
      {/* <Scene navMeshUrl="/floor.glb" /> */}
      <Archery pitch={pitch} yaw={yaw} />
    </Canvas>
  );
};

export default App;
