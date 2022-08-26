import React, { useState, useEffect } from "react";
import { LineGraph } from "./LineGraph";
import { ScatterPlot } from "./ScatterPlot";

export default function SummitList() {
  const [partData, setPartData] = useState({
    summit: "Summit_1",
    startDate: new Date().valueOf(),
    selectedPart: "",
    machine: "",
    metric: "diameter",
    order: "insp",
    measureMode: false,
    tableMode: "parts",
  });

  useEffect(() => {
    const abortController = new AbortController();

    const getParts = async () => {
      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?summit=${partData.summit}&timestamp=${partData.startDate}&flag=list-sum`,
        {
          signal: abortController.signal,
        }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          setPartData(prevState => {
            return { ...prevState, parts: data };
          });
          resetTableData();
          populateTableData(data);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
    };
    const refreshTopPart = async () => {
      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?summit=${
          partData.summit
        }&timestamp=${new Date().valueOf()}&flag=list-sum`,
        {
          signal: abortController.signal,
        }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          setPartData(prevState => {
            return {
              ...prevState,
              parts: data,
            };
          });

          // Populate table with only first part of fetch results,
          // Should limit at server level only fetching most recent part
          populateFirstRow(data);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
    };
    getParts();
    const refreshTimeout = setInterval(() => {
      refreshTopPart();
    }, 10000);

    return () => {
      clearInterval(refreshTimeout);
      abortController.abort();
    };
  }, [partData.summit, partData.startDate]);

  const getFormattedDateStringFromUnix = date => {
    // resulting format:
    const origDate = new Date(date);
    const stringDate = origDate.toLocaleDateString("en-US", {
      month: "numeric",
      day: "2-digit",
      year: "numeric",
    });
    const stringTime = origDate.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
    return [stringDate, stringTime];
  };

  const getFormattedDateStringFromUnixForSelector = date => {
    // resulting format: 2022-05-23T16:46
    const origDate = new Date(date);
    const stringDate = origDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const stringTime = origDate
      .toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace("AM", "")
      .replace("PM", "")
      .trim();
    const splitDate = stringDate.split("/");
    const splitTime = stringTime.split(":");
    const formattedDate = `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}T${splitTime[0]}:${splitTime[1]}`;
    return formattedDate;
  };

  const changeMetric = e => {
    const metric = e.target.value;
    setPartData(prevState => {
      return { ...prevState, metric: metric };
    });
  };

  const changeOrder = e => {
    const order = e.target.value;
    setPartData(prevState => {
      return { ...prevState, order: order };
    });
  };

  const setSummit = e => {
    setPartData(prevState => {
      return {
        ...prevState,
        selectedPart: "",
        machine: "",
        summit: e.target.value,
      };
    });
  };

  // Function that says for each part in data, create a <tr> inside <tbody>
  const populateTableData = async parts => {
    for (const part of parts) {
      // fetch tolerances before anything
      const defFile = "./config/partDefinitions.json";
      let tolerances = {};
      let isAngleHole = false;

      const response = await fetch(defFile);
      const partDef = await response.json();

      for (const def of partDef) {
        if (String(def.partType).trim() === String(part.parttype).trim()) {
          tolerances = def.tolerances;
          isAngleHole = def.textFileSpecs.isAngleHole;
        }
      }

      // assemble html elements
      // get table parent to append children to
      const table = document.querySelector("#table-body");
      // create new row and data elements
      const newRow = document.createElement("tr");
      const newTracking = document.createElement("td");
      const newPartType = document.createElement("td");
      const newDate = document.createElement("td");

      const [date, time] = getFormattedDateStringFromUnix(
        parseInt(part.timestamp)
      );

      // set fail boolean
      let fail = false;
      let warn = false;
      // get out of tolerance metrics for each hole
      const [outTol, warnTol] = getOutTol(
        tolerances,
        part.csidedata,
        part.asidedata,
        part.parttype
      );
      // if there is a metric out of tol, fail = true
      Object.values(outTol).forEach(arr => {
        if (arr.length) {
          fail = true;
        }
      });
      // if there is a warning tolerance flag
      Object.values(warnTol).forEach(arr => {
        if (arr.length) {
          warn = true;
        }
      });

      // Get green/red color depending on fail status
      if (fail) {
        newRow.style.backgroundColor = "rgb(235, 14, 14, .2)";
        newRow.style.borderColor = "rgb(235, 14, 14, 1)";
      } else if (warn) {
        newRow.style.backgroundColor = "rgb(252, 186, 3, .2)";
        newRow.style.borderColor = "rgb(252, 186, 3, 1)";
      } else {
        newRow.style.backgroundColor = "rgb(7, 237, 30, .2)";
        newRow.style.borderColor = "rgb(7, 237, 30, 1)";
      }

      // give new row some values and styling
      newRow.style.width = "100%";
      newRow.style.cursor = "pointer";
      newTracking.textContent = part.tracking;
      newPartType.textContent = part.parttype;
      newDate.textContent = date + " " + time;

      // append data to new row and then append to parent table
      newRow.appendChild(newTracking);
      newRow.appendChild(newPartType);
      newRow.appendChild(newDate);
      table.appendChild(newRow);

      // add onClick functionality
      newRow.onclick = () => {
        let rowTracking = newRow.firstChild.textContent;
        setPartData(prevState => {
          return {
            ...prevState,
            selectedPart: rowTracking,
            machine: part.machine,
          };
        });
      };
    }
  };

  // Function that says for each part in data, create a <tr> inside <tbody>
  const populateFirstRow = async parts => {
    const part = parts[0];

    // fetch tolerances before anything
    const defFile = "./config/partDefinitions.json";
    let tolerances = {};
    let isAngleHole = false;

    const response = await fetch(defFile);
    const partDef = await response.json();

    for (const def of partDef) {
      if (String(def.partType).trim() === String(part.parttype).trim()) {
        tolerances = def.tolerances;
        isAngleHole = def.textFileSpecs.isAngleHole;
      }
    }

    // assemble html elements
    // get table parent to append children to
    const table = document.querySelector("#table-body");
    // create new row and data elements
    const newRow = document.createElement("tr");
    const newTracking = document.createElement("td");
    const newPartType = document.createElement("td");
    const newDate = document.createElement("td");

    const [date, time] = getFormattedDateStringFromUnix(
      parseInt(part.timestamp)
    );

    // set fail boolean
    let fail = false;
    let warn = false;
    // get out of tolerance metrics for each hole
    const [outTol, warnTol] = getOutTol(
      tolerances,
      part.csidedata,
      part.asidedata,
      part.parttype
    );
    // if there is a metric out of tol, fail = true
    Object.values(outTol).forEach(arr => {
      if (arr.length) {
        fail = true;
      }
    });
    // if there is a warning tolerance flag
    Object.values(warnTol).forEach(arr => {
      if (arr.length) {
        warn = true;
      }
    });

    // Get green/red color depending on fail status
    if (fail) {
      newRow.style.backgroundColor = "rgb(235, 14, 14, .2)";
      newRow.style.borderColor = "rgb(235, 14, 14, 1)";
    } else if (warn) {
      newRow.style.backgroundColor = "rgb(252, 186, 3, .2)";
      newRow.style.borderColor = "rgb(252, 186, 3, 1)";
    } else {
      newRow.style.backgroundColor = "rgb(7, 237, 30, .2)";
      newRow.style.borderColor = "rgb(7, 237, 30, 1)";
    }

    // give new row some values and styling
    newRow.style.width = "100%";
    newRow.style.cursor = "pointer";
    newTracking.textContent = part.tracking;
    newPartType.textContent = part.parttype;
    newDate.textContent = date + " " + time;

    // if data is the same, eg: if no new part has crossed summit
    // then break out and dont update table
    // can probably just check date since that should never be the same
    if (table.firstChild.lastChild.textContent == newDate.textContent) {
      return;
    } else {
      // append data to new row and then append to parent table
      newRow.appendChild(newTracking);
      newRow.appendChild(newPartType);
      newRow.appendChild(newDate);

      // append new row to top of table
      table.insertBefore(newRow, table.firstChild);
      table.removeChild(table.lastChild);

      // add onClick functionality
      newRow.onclick = () => {
        let rowTracking = newRow.firstChild.textContent;
        setPartData(prevState => {
          return {
            ...prevState,
            selectedPart: rowTracking,
            machine: part.machine,
          };
        });
      };
    }
  };

  const resetTableData = () => {
    const table = document.querySelector("#table-body");
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  };

  const setMeasureMode = () => {
    let newMode = false;
    if (partData.measureMode === false) {
      setTheta(null);
      newMode = true;
      console.log("measuring...choose two points");
    } else {
      setTheta(null);
      console.log("measuring off...");
    }
    setPartData(prevState => {
      return { ...prevState, measureMode: newMode };
    });
  };

  const setTheta = theta => {
    setPartData(prevState => {
      return { ...prevState, theta: theta };
    });
  };

  const getPartColor = data => {
    let borderColor = "";
    let backgroundColor = "";

    if (String(data.parttype).trim() === "369P-01") {
      borderColor = "rgb(252, 186, 3, 1)";
      backgroundColor = "rgb(252, 186, 3, .2)";
    } else if (String(data.parttype).trim() === "1789P-01") {
      borderColor = "rgb(2, 117, 216, 1)";
      backgroundColor = "rgb(2, 117, 216, .2)";
    } else if (String(data.parttype).trim() === "2078P-01") {
      borderColor = "rgb(92, 184, 92, 1)";
      backgroundColor = "rgb(92, 184, 92, .2)";
    } else if (String(data.parttype).trim() === "1534P-01") {
      borderColor = "rgb(219, 112, 4, 1)";
      backgroundColor = "rgb(219, 112, 4, .2)";
    } else if (String(data.parttype).trim() === "1557P-01") {
      borderColor = "rgb(68, 242, 207, 1)";
      backgroundColor = "rgb(68, 242, 207, .2)";
    } else if (String(data.parttype).trim() === "2129P-01") {
      borderColor = "rgb(252, 3, 102, 1)";
      backgroundColor = "rgb(252, 3, 102, .2)";
    } else if (String(data.parttype).trim() === "2129P-02") {
      borderColor = "rgb(175, 104, 252, 1)";
      backgroundColor = "rgb(175, 104, 252, .2)";
    } else if (String(data.parttype).trim() === "2129P-03") {
      borderColor = "rgb(1, 0, 3, 1)";
      backgroundColor = "rgb(1, 0, 3, .2)";
    } else if (String(data.parttype).trim() === "1565P-01") {
      borderColor = "rgb(171, 194, 21, 1)";
      backgroundColor = "rgb(171, 194, 21, .2)";
    }

    return [borderColor, backgroundColor];
  };

  const getOutTol = (tolerances, csidedata, asidedata, parttype) => {
    let outTol = {};
    let warnTol = {};
    let count = 0;

    for (const hole of Object.keys(csidedata)) {
      let holeFails = [];
      let holeWarn = [];
      // hole metrics
      let cDia = csidedata[hole]?.cDia;
      let aDia = asidedata[hole]?.aDia;
      let cPos = csidedata[hole]?.cXY;
      let aPos = asidedata[hole]?.aXY;

      // fix for angle hole scatter tols
      // TODO - better to use angle hole start/end and isAngleHole instead
      if (
        (parttype === "1787P-01" && count < 35) ||
        (parttype === "1565P-01" && count > 587) ||
        (parttype === "109" && count > 196)
      ) {
        if (Object.keys(tolerances).length) {
          if (
            cDia >
              tolerances["c-side"]["angled_diaNom"] +
                tolerances["c-side"]["angled_diaPlus"] ||
            cDia <
              tolerances["c-side"]["angled_diaNom"] -
                tolerances["c-side"]["angled_diaMin"]
          ) {
            holeFails.push("cDia");
          }
          if (
            aDia >
              tolerances["a-side"]["angled_diaNom"] +
                tolerances["a-side"]["angled_diaPlus"] ||
            aDia <
              tolerances["a-side"]["angled_diaNom"] -
                tolerances["a-side"]["angled_diaMin"]
          ) {
            holeFails.push("aDia");
          }
          if (
            cPos >
              tolerances["c-side"]["angled_posNom"] +
                tolerances["c-side"]["angled_posPlus"] ||
            cPos <
              tolerances["c-side"]["angled_posNom"] -
                tolerances["c-side"]["angled_posMin"]
          ) {
            holeFails.push("cPos");
          }
          if (
            aPos >
              tolerances["a-side"]["angled_posNom"] +
                tolerances["a-side"]["angled_posPlus"] ||
            aPos <
              tolerances["a-side"]["angled_posNom"] -
                tolerances["a-side"]["angled_posMin"]
          ) {
            holeFails.push("aPos");
          }
        }
        // Straight hole tolerance cases
      } else {
        if (Object.keys(tolerances).length) {
          if (
            cDia >
              tolerances["c-side"]["diaNom"] +
                tolerances["c-side"]["diaPlus"] ||
            cDia <
              tolerances["c-side"]["diaNom"] - tolerances["c-side"]["diaMin"]
          ) {
            holeFails.push("cDia");
          }
          if (
            cDia >
              tolerances["c-side"]["diaNom"] - tolerances["c-side"]["diaMin"] &&
            cDia < tolerances["c-side"]["diaMin_warn"]
          ) {
            holeWarn.push("cDia");
          }
          if (
            cDia <
              tolerances["c-side"]["diaNom"] +
                tolerances["c-side"]["diaPlus"] &&
            cDia > tolerances["c-side"]["diaMax_warn"]
          ) {
            holeWarn.push("cDia");
          }
          if (
            aDia >
              tolerances["a-side"]["diaNom"] +
                tolerances["a-side"]["diaPlus"] ||
            aDia <
              tolerances["a-side"]["diaNom"] - tolerances["a-side"]["diaMin"]
          ) {
            holeFails.push("aDia");
          }
          if (
            aDia >
              tolerances["a-side"]["diaNom"] - tolerances["a-side"]["diaMin"] &&
            aDia < tolerances["a-side"]["diaMin_warn"]
          ) {
            holeWarn.push("aDia");
          }
          if (
            aDia <
              tolerances["a-side"]["diaNom"] +
                tolerances["a-side"]["diaPlus"] &&
            aDia > tolerances["a-side"]["diaMax_warn"]
          ) {
            holeWarn.push("aDia");
          }
          if (
            cPos >
              tolerances["c-side"]["posNom"] +
                tolerances["c-side"]["posPlus"] ||
            cPos <
              tolerances["c-side"]["posNom"] - tolerances["c-side"]["posMin"]
          ) {
            holeFails.push("cPos");
          }
          if (
            cPos > tolerances["c-side"]["pos_warn"] &&
            cPos <
              tolerances["c-side"]["posNom"] + tolerances["c-side"]["posPlus"]
          ) {
            holeWarn.push("cPos");
          }
          if (
            aPos >
              tolerances["a-side"]["posNom"] +
                tolerances["a-side"]["posPlus"] ||
            aPos <
              tolerances["a-side"]["posNom"] - tolerances["a-side"]["posMin"]
          ) {
            holeFails.push("aPos");
          }
          if (
            aPos > tolerances["a-side"]["pos_warn"] &&
            aPos <
              tolerances["a-side"]["posNom"] + tolerances["a-side"]["posPlus"]
          ) {
            holeWarn.push("aPos");
          }
        }
      }
      outTol[hole] = holeFails;
      warnTol[hole] = holeWarn;
      count++;
    }
    return [outTol, warnTol];
  };

  const setStartDate = e => {
    if (!e.target.value.length) {
      const date = new Date(1982, 4, 1).valueOf();
      setPartData(prevState => {
        return { ...prevState, selectedPart: "", startDate: date, machine: "" };
      });
    } else {
      const date = e.target.value;
      setPartData(prevState => {
        return {
          ...prevState,
          selectedPart: "",
          startDate: Date.parse(date),
          machine: "",
        };
      });
    }
  };

  const summitStringParse = summit => {
    if (summit === "Summit_1") {
      return "Summit 1";
    } else if (summit === "Summit_2") {
      return "Summit 2";
    } else if (summit === "Summit_3") {
      return "Summit 3";
    }
  };

  const partDetailsToggle = () => {
    if (partData.tableMode === "parts") {
      const tableMode = "details";
      setPartData(prevState => {
        return {
          ...prevState,
          tableMode: tableMode,
        };
      });
    } else if (partData.tableMode === "details") {
      const tableMode = "parts";
      setPartData(prevState => {
        return {
          ...prevState,
          tableMode: tableMode,
        };
      });
    }
  };

  return (
    <div className="run-list-main">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <div className="machine-info">
          <p className="display-4 lead">
            {summitStringParse(partData.summit)}
            {partData.selectedPart ? (
              <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
            ) : (
              <p></p>
            )}
            {partData.selectedPart}
            {partData.machine ? (
              <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
            ) : (
              <p></p>
            )}
            {partData.machine}
          </p>
        </div>
      </div>
      <div className="list-params">
        <div className="mach-select">
          <select
            name="parttype-select"
            id="form-select"
            className="form-select mb-3"
            aria-label=".form-select example"
            value={partData.summit}
            onChange={setSummit}
          >
            {/* All machines option, different query required? */}
            {/* <option value="%">All Machines</option> */}
            <option value="Summit_1">Summit 1</option>
            <option value="Summit_2">Summit 2</option>
            <option value="Summit_3">Summit 3</option>
          </select>
        </div>
        <div className="overview-date-input">
          <input
            id="form-select"
            className="form-control"
            name="overview-date"
            type="datetime-local"
            defaultValue={getFormattedDateStringFromUnixForSelector(
              partData.startDate
            )}
            onChange={setStartDate}
          />
        </div>
        {partData.selectedPart.length ? (
          <button onClick={partDetailsToggle}>details</button>
        ) : (
          <div></div>
        )}
      </div>
      <div className="list-content" id="list-content">
        {partData.tableMode === "parts" ? (
          <div
            className="table-responsive run-list-table flip-wrapper"
            id="table-responsive"
          >
            <div className="flip-inner">
              <table className="table table-hover flip-front">
                <thead>
                  <tr className="table-headers">
                    <th scope="col">Tracking</th>
                    <th scope="col">Part Type</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody id="table-body"></tbody>
              </table>
              {/* <div className="flip-back"> backside</div> */}
            </div>
          </div>
        ) : (
          <div
            className="table-responsive run-list-table flip-wrapper"
            id="table-responsive"
          >
            <div className="flip-inner">
              <table className="table table-hover flip-front">
                <thead>
                  <tr className="detail-headers">
                    <th scope="col">{partData.selectedPart}</th>
                  </tr>
                </thead>
                <tbody id="table-body"></tbody>
              </table>
              {/* <div className="flip-back"> backside</div> */}
            </div>
          </div>
        )}

        {partData.selectedPart.length ? (
          <div className="run-list-charts">
            <div className="run-line">
              {" "}
              <div
                className="list-linegraph-params linegraph-params"
                id="list-linegraph-params"
              >
                <select
                  id="form-select"
                  className="form-select form-select mb-3"
                  aria-label=".form-select example"
                  onChange={changeMetric}
                  value={partData.metric}
                >
                  <option value="diameter">Diameter</option>
                  <option value="position">Position</option>
                </select>
                <select
                  id="form-select"
                  className="form-select form-select mb-3"
                  aria-label=".form-select example"
                  onChange={changeOrder}
                  value={partData.order}
                >
                  <option value="insp">Inspection Order</option>
                  <option value="drill">Drill Order</option>
                </select>
              </div>
              <LineGraph
                className="line-graph"
                partData={
                  partData.parts.filter(obj => {
                    return obj.tracking === partData.selectedPart;
                  })[0]
                }
                metric={partData.metric}
                order={partData.order}
                zoom={false}
              />
            </div>
            <div className="run-scatter">
              <ScatterPlot
                className="scatter-graph"
                partData={
                  partData.parts.filter(obj => {
                    return obj.tracking === partData.selectedPart;
                  })[0]
                }
                measureMode={partData.measureMode}
                setTheta={setTheta}
                zoom={false}
              />
            </div>
          </div>
        ) : (
          <div className="lead graph-placeholder">
            {" "}
            Select a part from the table to view
          </div>
        )}
      </div>
    </div>
  );
}
