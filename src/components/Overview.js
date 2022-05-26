import React from "react";
import { useState, useEffect } from "react";

export default function Overview() {
  const [partData, setPartData] = useState({
    partType: "369P-01",
    startDate: Date.now(),
  });

  useEffect(() => {
    const machines = getMachNums();
    console.log(machines);

    if (machines.length) {
      for (const mach of machines) {
        fetch(
          `http://localhost:3001/parts/?parttype=${partData.partType}&machine=${mach}&timestamp=${partData.startDate}`
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }, [partData.partType]);

  const setPartType = (e) => {
    const partType = e.target.value;
    setPartData((prevState) => {
      return { ...prevState, partType: partType };
    });
  };

  const getMachNums = async () => {
    const defFile = "./config/machDefinitions.json";
    let machArray = [];

    const response = await fetch(defFile);
    const machDef = await response.json();

    for (const mach of machDef) {
      machArray.push(mach);
    }
    return machArray;
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
    </div>
  );
}
