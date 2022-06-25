import React from "react";
import { useState, useEffect } from "react";
import PieChart from "./PieChart";
import PartList from "./PartList";
import { LineGraph } from "./LineGraph";

// Use this component as base for modularization of "get" functions

export default function Forcast() {
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
    const getQualData = async (startDate, endDate) => {
      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?flag=stats&startDate=${startDate}&endDate=${endDate}`,
        { signal: AbortController.signal }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          segregateParts(data);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
    };

    const segregateParts = data => {
      const totalParts = data;
      let passedParts = [];
      let failedParts = [];

      for (const part of data) {
        if (part.fail) {
          failedParts.push(part);
        } else if (!part.fail) {
          passedParts.push(part);
        }
      }
      setPartData(prevState => {
        console.log(totalParts);
        return {
          ...prevState,
          totalParts: totalParts,
          passedParts: passedParts,
          failedParts: failedParts,
        };
      });
    };

    getQualData(partData.startDate, partData.endDate);

    return () => {
      abortController.abort();
    };
  }, [partData.startDate, partData.endDate]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const extractAngledHoles = (parttype, data) => {
    let angledholes = [];
    let straightholes = [];
    if (parttype === "1787P-01") {
      angledholes = data.slice(0, 35);
      straightholes = data.slice(35);
    } else if (parttype === "1565P-01") {
      angledholes = data.slice(588, 1268);
      straightholes = data.slice(0, 588);
    }

    return [straightholes, angledholes];
  };

  const getCDiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data)) {
      diameterArray.push(hole.cDia);
    }
    return diameterArray;
  };

  const getCPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data)) {
      positionArray.push(hole.cXY);
    }
    return positionArray;
  };

  const getADiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data)) {
      diameterArray.push(hole.aDia);
    }
    return diameterArray;
  };

  const getAPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data)) {
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
      {partData.totalParts ? (
        <div className="stats-combo">
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
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse369"
              role="button"
              aria-expanded="false"
              aria-controls="collapse369"
            >
              <p className="display-6 lead">369's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype === "369P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype === "369P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype === "369P-01"
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
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse1789"
              role="button"
              aria-expanded="false"
              aria-controls="collapse1789"
            >
              <p className="display-6 lead">1789's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype === "1789P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype === "1789P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype === "1789P-01"
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
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse2078"
              role="button"
              aria-expanded="false"
              aria-controls="collapse2078"
            >
              <p className="display-6 lead">2078's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype === "2078P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype === "2078P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype === "2078P-01"
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
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse1565"
              role="button"
              aria-expanded="false"
              aria-controls="collapse1565"
            >
              <p className="display-6 lead">1565's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype === "1565P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype === "1565P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype === "1565P-01"
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
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse1787"
              role="button"
              aria-expanded="false"
              aria-controls="collapse1787"
            >
              <p className="display-6 lead">1787's</p>
              <div>
                Total:{" "}
                {
                  partData.totalParts.filter(
                    part => part.parttype === "1787P-01"
                  ).length
                }
              </div>
              <div>
                Passed:{" "}
                {
                  partData.passedParts.filter(
                    part => part.parttype === "1787P-01"
                  ).length
                }
              </div>
              <div>
                Failed:{" "}
                {
                  partData.failedParts.filter(
                    part => part.parttype === "1787P-01"
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
          </div>
          <hr></hr>
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse369">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === "369P-01"
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === "369P-01"
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse1789">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === "1789P-01"
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === "1789P-01"
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse2078">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === "2078P-01"
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === "2078P-01"
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse1565">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === "1565P-01"
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === "1565P-01"
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse1787">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === "1787P-01"
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === "1787P-01"
                )}
              />
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
