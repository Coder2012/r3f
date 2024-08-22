import React from "react";
import { Canvas } from "@react-three/fiber";
import { Archery } from "./components/Archery";
import { Controls } from "./components/Controls";

const App = () => {
  // const pitch = -13 * (Math.PI / 180);
  const yaw = 0 * (Math.PI / 180);
  const [angle, setAngle] = React.useState(0);

  return (
    <>
      <Controls onChange={(angle) => setAngle(-angle * (Math.PI / 180))} />
      <Canvas shadows camera={{ fov: 50 }}>
        <Archery pitch={angle} yaw={yaw} />
      </Canvas>
    </>
  );
};

export default App;
