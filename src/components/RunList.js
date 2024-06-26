import { React, useState, useEffect } from "react";

// Redux Imports
import { useSelector } from "react-redux";

// Component Imports
import { LineGraph } from "./LineGraph";
import { ScatterPlot } from "./ScatterPlot";
import GraphGuide from "./GraphGuide";

// API Imports
import { getMachineRunList } from "../api/monocle.api";

export default function RunList() {
  const [partData, setPartData] = useState({
    machine: "WAM 136",
    startDate: new Date().valueOf(),
    selectedPart: "",
    metric: "diameter",
    order: "insp",
    measureMode: false,
    summit: "",
  });
  // Redux Store
  const partDef = useSelector(state => state.config.partDef);

  useEffect(() => {
    const setTable = response => {
      resetTableData();
      populateTableData(response);
      setPartData(prevState => {
        return {
          ...prevState,
          parts: response,
        };
      });
    };
    getMachineRunList(partData.machine, partData.startDate, setTable);
  }, [partData.machine, partData.startDate, partData.machine]);

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

  const setMachine = e => {
    setPartData(prevState => {
      return {
        ...prevState,
        selectedPart: "",
        summit: "",
        metric: "diameter",
        machine: e.target.value,
      };
    });
  };

  // Function that says for each part in data, create a <tr> inside <tbody>
  const populateTableData = async parts => {
    let tolerances = {};
    let isAngleHole = false;

    for (const part of parts) {
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
      // find better way to space elements maybe?
      newRow.style.width = "100%";
      newRow.style.cursor = "pointer";
      newTracking.style.width = "100%";
      newTracking.innerHTML =
        part.tracking +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        part.parttype +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        "&nbsp;" +
        date +
        " " +
        time;

      // append data to new row and then append to parent table
      newRow.appendChild(newTracking);
      // newRow.appendChild(newPartType);
      // newRow.appendChild(newDate);
      table.appendChild(newRow);

      // add onClick functionality
      newRow.onclick = () => {
        let rowTracking = part.tracking;
        setPartData(prevState => {
          return {
            ...prevState,
            selectedPart: rowTracking,
            summit: part.summit,
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
          startDate: Date.parse(date),
          selectedPart: "",
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

  return (
    <div className="run-list-main">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <div className="machine-info">
          <p className="display-4 lead">
            {partData.machine}
            {partData.selectedPart ? (
              <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
            ) : null}
            {partData.selectedPart}
            {partData.selectedPart ? (
              <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
            ) : null}
            {summitStringParse(partData.summit)}
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
            value={partData.machine}
            onChange={setMachine}
          >
            {/* All machines option, different query required? */}
            {/* <option value="%">All Machines</option> */}
            <option value="WAM 101">WAM 101</option>
            <option value="WAM 106">WAM 106</option>
            <option value="WAM 110">WAM 110</option>
            <option value="WAM 116">WAM 116</option>
            <option value="WAM 120">WAM 120</option>
            <option value="WAM 132">WAM 132</option>
            <option value="WAM 134">WAM 134</option>
            <option value="WAM 136">WAM 136</option>
            <option value="WAM 137">WAM 137</option>
            <option value="WAM 138">WAM 138</option>
            <option value="WAM 139">WAM 139</option>
            <option value="WAM 140">WAM 140</option>
            <option value="WAM 141">WAM 141</option>
            <option value="WAM 142">WAM 142</option>
            <option value="WAM 143">WAM 143</option>
            <option value="WAM 144">WAM 144</option>
            <option value="WAM 145">WAM 145</option>
            <option value="WAM 901">WAM 901</option>
            <option value="WAM 902">WAM 902</option>
            <option value="WAM 903">WAM 903</option>
            <option value="WAM 904">WAM 904</option>
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
        {/* Graph Guide Modal  */}
        <div className="graph-guide-modal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="rgb(50,50,50)"
            className="bi bi-question-circle display-guide"
            viewBox="0 0 16 16"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            stroke="grey"
            strokeWidth=".03"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
          </svg>
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    What does this graph mean?
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <GraphGuide />
                </div>
                <div className="modal-footer"></div>
              </div>
            </div>
          </div>
        </div>
        {/* End Graph Guide Modal */}
      </div>
      <div className="list-content" id="list-content">
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
              {/* {console.log(
                partData.parts.filter(obj => {
                  return obj.tracking === partData.selectedPart;
                })[0]
              )} */}
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
