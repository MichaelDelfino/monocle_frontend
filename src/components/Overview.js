import React from "react";
import { useState, useEffect } from "react";
import BoxPlotsAll from "./BoxPlotsAll";

export default function Overview({ machHandler }) {
  const [partData, setPartData] = useState({
    partType: "369P-01",
    startDate: Date.now(),
    machineData: [],
  });

  useEffect(() => {
    setPartData((prevState) => {
      return { ...prevState, machineData: [] };
    });
    const getMachinesData = async () => {
      const defFile = "./config/machDefinitions.json";
      let fetchArray = [];

      const response = await fetch(defFile);
      const machines = await response.json();

      for (const mach of machines) {
        fetchArray.push(
          `http://localhost:3001/parts/?parttype=${partData.partType}&machine=${mach}&timestamp=${partData.startDate}`
        );
      }
      let requests = fetchArray.map((url) => fetch(url));

      Promise.all(requests)
        .then((responses) => Promise.all(responses.map((r) => r.json())))
        .then((jsonObjects) => {
          let validMachines = [];
          for (const obj of jsonObjects) {
            if (obj.length) {
              validMachines.push(obj);
            }
          }
          setPartData({
            partType: partData.partType,
            startDate: partData.startDate,
            machineData: validMachines,
          });
        });
    };

    getMachinesData();
  }, [partData.partType, partData.startDate]);

  const setPartType = (e) => {
    const partType = e.target.value;
    setPartData((prevState) => {
      return { ...prevState, partType: partType };
    });
  };

  return (
    <div className="OverviewDisplay">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <h1 className="display-4 machine-display-title">
          Overview<span className="blue-period">.</span>
        </h1>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p className="lead"></p>
        <hr className="my-4" />
        <p className="lead"></p>
      </div>
      <select
        className="form-select form-select-lg mb-3"
        aria-label=".form-select-lg example"
        onChange={setPartType}
      >
        <option value="369P-01">369P-01</option>
        <option value="1789P-01">1789P-01</option>
        <option value="2078P-01">2078P-01</option>
      </select>
      {partData ? (
        <div>
          <BoxPlotsAll
            data={partData.machineData}
            side={"C-Side"}
            metric={"Diameter"}
            machHandler={machHandler}
          />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
