import React from "react";
import { useState, useEffect } from "react";
import PieChart from "./PieChart";

// Use this component as base for modularization of "get" functions

export default function QualStats() {
  const [partData, setPartData] = useState({
    startDate: Date.now(),
    endDate: Date.now() - 86400000,
    totalParts: [],
    passedParts: [],
    failedParts: [],
    period: "Today",
  });

  useEffect(() => {
    const abortController = new AbortController();

    // Modularize other components' fetches like so
    const getWeekData = async (startDate, endDate) => {
      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?flag=stats&startDate=${startDate}&endDate=${endDate}`,
        { signal: AbortController.signal }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          console.log(data);
          calcPassFail(data);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
    };

    const calcPassFail = async data => {
      const totalParts = data;

      let allCDia,
        allADia,
        allCPos,
        allAPos = [];

      let passedParts = [];
      let failedParts = [];

      let tolerances = {};

      for (const part of data) {
        const defFile = "./config/partDefinitions.json";
        const response = await fetch(defFile);
        const partDef = await response.json();

        for (const def of partDef) {
          if (String(def.partType).trim() === String(part.parttype).trim()) {
            tolerances = def.tolerances;
          }
        }
        allCDia = getCDiameters(part);
        allADia = getADiameters(part);
        allCPos = getCPosition(part);
        allAPos = getAPosition(part);

        if (
          Math.max(...allCDia) >
            tolerances["c-side"]["diaNom"] + tolerances["c-side"]["diaPlus"] ||
          Math.min(...allCDia) <
            tolerances["c-side"]["diaNom"] - tolerances["c-side"]["diaMin"] ||
          Math.max(...allADia) >
            tolerances["a-side"]["diaNom"] + tolerances["a-side"]["diaPlus"] ||
          Math.min(...allADia) <
            tolerances["a-side"]["diaNom"] - tolerances["a-side"]["diaMin"] ||
          Math.max(...allCPos) >
            tolerances["c-side"]["posNom"] + tolerances["c-side"]["posPlus"] ||
          Math.min(...allCPos) <
            tolerances["c-side"]["posNom"] - tolerances["c-side"]["posMin"] ||
          Math.max(...allAPos) >
            tolerances["a-side"]["posNom"] + tolerances["a-side"]["posPlus"] ||
          Math.min(...allAPos) <
            tolerances["a-side"]["posNom"] - tolerances["a-side"]["posMin"]
        ) {
          failedParts.push(part);
        } else {
          passedParts.push(part);
        }
      }
      console.log(totalParts, passedParts, failedParts);
      setPartData(prevState => {
        return {
          ...prevState,
          totalParts: totalParts,
          passedParts: passedParts,
          failedParts: failedParts,
        };
      });
    };

    getWeekData(partData.startDate, partData.endDate);

    return () => {
      abortController.abort();
    };
  }, [partData.startDate, partData.endDate]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const getCDiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data.csidedata)) {
      diameterArray.push(hole.cDia);
    }
    return diameterArray;
  };

  const getCPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data.csidedata)) {
      positionArray.push(hole.cXY);
    }
    return positionArray;
  };

  const getADiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data.asidedata)) {
      diameterArray.push(hole.aDia);
    }
    return diameterArray;
  };

  const getAPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data.asidedata)) {
      positionArray.push(hole.aXY);
    }
    return positionArray;
  };

  const setPeriod = e => {
    const period = e.target.value;
    let timeOffset = 0;
    if (partData.period === "Today") {
      timeOffset = 604800000;
    } else {
      timeOffset = 86400000;
    }
    setPartData(prevState => {
      return {
        ...prevState,
        endDate: Date.now() - timeOffset,
        period: period,
      };
    });
  };

  return (
    <div className="Stats-Display">
      <div id="stats-title" className="jumbotron stats-jumbotron">
        <div className="stats-info">
          <p className="display-4 lead">
            Quality Statistics
            <span style={{ color: "rgb(39, 97, 204)" }}></span>
          </p>
        </div>
      </div>
      <select onChange={setPeriod} defaultValue={partData.period}>
        <option value="This Week">this week</option>
        <option value="Today">today</option>
      </select>
      {/* Conditionally render each part type's stats based on data within time period */}
      {/* Need to try to make the part types dynamic, adding a new part type will require hard coding a new section */}
      <div className="stats-time-period display-5 lead">{partData.period}</div>
      {partData.totalParts.length ? (
        <div className="stats-totals">
          <div className="totals-column">
            <p className="display-6 lead">Totals</p>
            <div>Total: {partData.totalParts.length}</div>
            <div>Passed: {partData.passedParts.length}</div>
            <div>Failed: {partData.failedParts.length}</div>
            <div>
              <PieChart
                passedParts={partData.passedParts}
                failedParts={partData.failedParts}
              />
            </div>
          </div>
          {partData.totalParts.filter(part => part.parttype === "369P-01")
            .length ? (
            <div className="parttype-column">
              <p className="display-6 lead">369's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(part => part.parttype == "369P-01")
                    .length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype == "369P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype == "369P-01"
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === "369P-01"
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === "369P-01"
                  )}
                />
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.filter(part => part.parttype === "1789P-01")
            .length ? (
            <div className="parttype-column">
              <p className="display-6 lead">1789's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype == "1789P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype == "1789P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype == "1789P-01"
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === "1789P-01"
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === "1789P-01"
                  )}
                />
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.filter(part => part.parttype === "2078P-01")
            .length ? (
            <div className="parttype-column">
              <p className="display-6 lead">2078's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype == "2078P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype == "2078P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype == "2078P-01"
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === "2078P-01"
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === "2078P-01"
                  )}
                />
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.filter(part => part.parttype === "1565P-01")
            .length ? (
            <div className="parttype-column">
              <p className="display-6 lead">1565's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype == "1565P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype == "1565P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype == "1565P-01"
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === "1565P-01"
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === "1565P-01"
                  )}
                />
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.filter(part => part.parttype === "1787P-01")
            .length ? (
            <div className="parttype-column">
              <p className="display-6 lead">1787's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype == "1787P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype == "1787P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype == "1787P-01"
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === "1787P-01"
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === "1787P-01"
                  )}
                />
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
