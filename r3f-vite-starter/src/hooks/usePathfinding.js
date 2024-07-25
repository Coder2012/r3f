import { useEffect, useRef } from "react";
import {
  NavMeshLoader,
  Vehicle,
  EntityManager,
  Time,
  FollowPathBehavior,
} from "yuka";

export const usePathfinding = (gltfPath) => {
  const navMeshRef = useRef();
  const vehicleRef = useRef(new Vehicle());
  const entityManagerRef = useRef(new EntityManager());
  const timeRef = useRef(new Time());

  useEffect(() => {
    const loader = new NavMeshLoader();

    loader.load(gltfPath).then((navigationMesh) => {
      navMeshRef.current = navigationMesh;
      console.log(navMeshRef.current);

      const vehicle = vehicleRef.current;
      vehicle.maxSpeed = 1.5;
      vehicle.maxForce = 10;

      const followPathBehavior = new FollowPathBehavior();
      followPathBehavior.active = false;
      vehicle.steering.add(followPathBehavior);

      entityManagerRef.current.add(vehicle);
    });
  }, [gltfPath]);

  return { navMeshRef, vehicleRef, entityManagerRef, timeRef };
};
