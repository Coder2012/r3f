import React from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./components/Scene";

const App = () => {
  return (
    <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
      <Scene navMeshUrl="/floor.glb" />
    </Canvas>
  );
};

export default App;
