import React, { useState, useEffect } from "react";

export default function RunList() {
  const [partData, setPartData] = useState({
    parts: [],
    machine: "WAM 136",
    startDate: new Date(),
    tols: {},
    isAngleHole: false,
  });

  useEffect(() => {
    const abortController = new AbortController();

    const getParts = async currentType => {
      const defFile = "./config/partDefinitions.json";
      let tolerances = {};
      let isAngleHole = false;

      const response = await fetch(defFile);
      const partDef = await response.json();

      for (const part of partDef) {
        if (String(part.partType).trim() === String(currentType).trim()) {
          tolerances = part.tolerances;
          isAngleHole = part.textFileSpecs.isAngleHole;
        }
      }

      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?machine=${partData.machine}&timestamp=${partData.startDate}&flag=list`,
        {
          signal: abortController.signal,
        }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
    };
    getParts();

    return () => {
      abortController.abort();
    };
  }, []);

  return <div></div>;
}
