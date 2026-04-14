import { useCallback, useEffect, useState } from "react";

import { httpGetPlanets } from "./requests";

function usePlanets() {
  const [planets, savePlanets] = useState([]);

  const getPlanets = useCallback(async () => {
    const data = await httpGetPlanets();
    // Server returns the array directly; support both shapes
    savePlanets(Array.isArray(data) ? data : (data?.planets ?? []));

   //savePlanets(data);
  }, []);

  useEffect(() => {
    getPlanets();
  }, [getPlanets]);

  return planets;
}

export default usePlanets;
