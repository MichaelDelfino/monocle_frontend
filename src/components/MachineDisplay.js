import React, { useEffect, useState } from "react";
import BoxPlots from "./BoxPlots";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function MachineDisplay() {
  const [partData, setPartData] = useState({
    parts: [],
    machine: "WAM 142",
    numOfParts: 5,
    metric: "Diameter",
    side: "C-Side",
    startDate: Date.parse("2022-01-01"),
  });

  useEffect(() => {
    fetch(
      `http://localhost:3001/parts/?machine=${partData.machine}&num=${partData.numOfParts}&timestamp=${partData.startDate}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPartData({
          parts: data,
          machine: partData.machine,
          numOfParts: partData.numOfParts,
          metric: partData.metric,
          side: partData.side,
          startDate: partData.startDate,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [
    partData.machine,
    partData.numOfParts,
    partData.metric,
    partData.side,
    partData.startDate,
  ]);

  const setMachine = (e) => {
    setPartData((prevState) => {
      return { ...prevState, machine: e.target.value };
    });
  };

  const setNumOfParts = (e) => {
    setPartData((prevState) => {
      return { ...prevState, numOfParts: e.target.value };
    });
  };

  const setSide = (side) => {
    setPartData((prevState) => {
      return { ...prevState, side: side };
    });
  };

  const setMetric = (metric) => {
    setPartData((prevState) => {
      return { ...prevState, metric: metric };
    });
  };

  const setStartDate = (e) => {
    setPartData((prevState) => {
      return { ...prevState, startDate: Date.parse(e.target.value) };
    });
  };

  const getPartColor = (partType) => {
    let borderColor = "";
    let backgroundColor = "";

    if (String(partType).trim() === "369P-01") {
      borderColor = "rgb(252, 186, 3, 1)";
      backgroundColor = "rgb(252, 186, 3, .2)";
    } else if (String(partType).trim() === "1789P-01") {
      borderColor = "rgb(2, 117, 216, 1)";
      backgroundColor = "rgb(2, 117, 216, .2)";
    } else if (String(partType).trim() === "2078P-01") {
      borderColor = "rgb(92, 184, 92, 1)";
      backgroundColor = "rgb(92, 184, 92, .2)";
    } else if (String(partType).trim() === "1534P-01") {
      borderColor = "rgb(219, 112, 4, 1)";
      backgroundColor = "rgb(219, 112, 4, .2)";
    } else if (String(partType).trim() === "1557P-01") {
      borderColor = "rgb(68, 242, 207, 1)";
      backgroundColor = "rgb(68, 242, 207, .2)";
    } else if (String(partType).trim() === "2129P-01") {
      borderColor = "rgb(252, 3, 102, 1)";
      backgroundColor = "rgb(252, 3, 102, .2)";
    } else if (String(partType).trim() === "2129P-02") {
      borderColor = "rgb(175, 104, 252, 1)";
      backgroundColor = "rgb(175, 104, 252, .2)";
    } else if (String(partType).trim() === "2129P-03") {
      borderColor = "rgb(1, 0, 3, 1)";
      backgroundColor = "rgb(1, 0, 3, .2)";
    } else if (String(partType).trim() === "1565P-01") {
      borderColor = "rgb(171, 194, 21, 1)";
      backgroundColor = "rgb(171, 194, 21, .2)";
    }

    return [borderColor, backgroundColor];
  };

  const getTodayString = (data) => {};

  return (
    <div className="MachineDisplay">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <h1 className="display-4 machine-display-title">
          Machine Display<span className="blue-period">.</span>
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
      {partData ? (
        <div className="machine-content">
          <div className="dropdown-and-title">
            <div className="machine-info">
              <p className="display-4 lead">
                {partData.machine}
                <span style={{ color: getPartColor("369P-01") }}>|</span>
              </p>
              <p className="display-4 lead">
                {partData.side}
                <span style={{ color: getPartColor("369P-01") }}>|</span>
              </p>
              <p className="display-4 lead">{partData.metric} </p>
            </div>
          </div>
          <div className="boxplots-and-buttons">
            <div className="machine-dropdown-and-date">
              <div className="machine-dropdown">
                <select
                  className="form-select form-select-lg mb-3"
                  aria-label=".form-select-lg example"
                  value={partData.machine}
                  onChange={setMachine}
                >
                  {/* All machines option, different query required? */}
                  {/* <option value="%">All Machines</option> */}
                  <option value="WAM 101">WAM 101</option>
                  <option value="WAM 116">WAM 106</option>
                  <option value="WAM 110">WAM 110</option>
                  <option value="WAM 116">WAM 116</option>
                  <option value="WAM 136">WAM 136</option>
                  <option value="WAM 137">WAM 137</option>
                  <option value="WAM 138">WAM 138</option>
                  <option value="WAM 139">WAM 139</option>
                  <option value="WAM 140">WAM 140</option>
                  <option value="WAM 142">WAM 142</option>
                  <option value="WAM 143">WAM 143</option>
                  <option value="WAM 144">WAM 144</option>
                  <option value="WAM 145">WAM 145</option>
                  <option value="WAM 901">WAM 901</option>
                  <option value="WAM 902">WAM 902</option>
                  <option value="WAM 903">WAM 903</option>
                  <option value="WAM 951">WAM 951</option>
                </select>
              </div>
              {/* default to todays date */}
              <div className="date-picker">
                <input
                  type="date"
                  defaultValue="2022-01-01"
                  onChange={setStartDate}
                />
              </div>
            </div>
            <div className="boxplots">
              <BoxPlots
                partData={partData.parts}
                side={partData.side}
                metric={partData.metric}
              />
            </div>
            <div className="machine-metric-toggles">
              <div className="side-buttons">
                <button
                  className="btn btn-outline-primary"
                  onClick={setSide.bind(null, "C-Side")}
                >
                  c-side
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={setSide.bind(null, "A-Side")}
                >
                  a-side
                </button>
              </div>
              <div className="metric-buttons">
                <button
                  className="btn btn-outline-primary"
                  onClick={setMetric.bind(null, "Diameter")}
                >
                  diameter
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={setMetric.bind(null, "Position")}
                >
                  position
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
