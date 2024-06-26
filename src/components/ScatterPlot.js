import { React, useState, useEffect } from "react";

// Redux Store Imports
import { useSelector } from 'react-redux'

// Chartjs Imports
import { Scatter } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export const ScatterPlot = ({ partData, measureMode, setTheta, zoom }) => {
  const [graphData, setgraphData] = useState({
    tracking: partData.tracking,
    machine: partData.machine,
    partType: partData.parttype,
    tolerances: {},
    labels: Object.keys(partData.csidedata),
    datasets: [],
    point_1: null,
    point_2: null,
  });
  // Redux Store
  const partDef = useSelector(state => state.config.partDef);

  useEffect(() => {
    if (!measureMode) {
      setgraphData(prevState => {
        return { ...prevState, point_1: null, point_2: null };
      });
    }
    const getPartTols = async currentType => {
      let allCPosData = [];
      let holePassFail = [];
      let holeWarning = [];
      let tolerances = {};
      let datasets = [];

      for (const part of partDef) {
        if (String(part.partType).trim() === String(currentType).trim()) {
          tolerances = part.tolerances;
        }
      }

      const [borderColor, backgroundColor] = getPartColor(partData);
      allCPosData = getCPosition(partData);

      // nomCPosData = getNomCPosition(partData);

      [holePassFail, holeWarning] = getOutTol(
        tolerances,
        partData.csidedata,
        partData.asidedata,
        partData.parttype
      );

      datasets = [
        {
          type: "scatter",
          label: "Actual",
          data: allCPosData,
          backgroundColor: context => {
            let index = context.dataIndex;
            let holes = Object.keys(partData.csidedata);
            if (holePassFail[holes[index]]?.length) {
              return "red";
            } else if (holeWarning[holes[index]]?.length) {
              return "rgb(252, 186, 3, 1)";
            } else {
              return "#20c997";
            }
          },
          pointRadius: context => {
            let index = context.dataIndex;
            let holes = Object.keys(partData.csidedata);
            if (holePassFail[holes[index]]?.length) {
              return 5;
            } else if (holeWarning[holes[index]]?.length) {
              return 5;
            } else {
              return 3;
            }
          },
          pointHoverRadius: context => {
            let index = context.dataIndex;
            let holes = Object.keys(partData.csidedata);
            if (holePassFail[holes[index]]?.length) {
              return 10;
            } else if (holeWarning[holes[index]]?.length) {
              return 10;
            } else {
              return 4;
            }
          },
          borderColor: "black",
          borderWidth: 0.5,
        },
      ];

      if (graphData.point_1) {
        datasets.push({
          type: "line",
          labels: ["a", "b"],
          borderColor: "rgb(32, 3, 84, 1)",
          backgroundColor: "rgb(32, 3, 84, .2)",
          data: [graphData.point_1, { x: 0, y: 0 }],
        });
      }
      if (graphData.point_2) {
        datasets.push({
          type: "line",
          labels: ["b", "c"],
          borderColor: "rgb(32, 3, 84, 1)",
          backgroundColor: "rgb(32, 3, 84, .2)",
          data: [{ x: 0, y: 0 }, graphData.point_2],
        });

        getAngleOfSeparation(
          convertRadToDeg(Math.atan2(graphData.point_1.x, graphData.point_1.y)),
          convertRadToDeg(Math.atan2(graphData.point_2.x, graphData.point_2.y))
        );
      }

      setgraphData(prevState => {
        return {
          ...prevState,
          tracking: partData.tracking,
          machine: partData.machine,
          partType: partData.parttype,
          tolerances: tolerances,
          labels: Object.keys(partData.csidedata),
          holePassFail: holePassFail,
          holeWarning: holeWarning,
          datasets: datasets,
        };
      });
    };
    getPartTols(partData.parttype);
  }, [partData, graphData.point_1, graphData.point_2, measureMode]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const getCPosition = data => {
    // data = [{
    //   x: 0.6,
    //   y: 0.3,
    // }]

    let positionArray = [];
    for (const hole of Object.values(data.csidedata)) {
      positionArray.push({
        x: hole.cX,
        y: hole.cY,
      });
    }
    return positionArray;
  };

  const getAPosition = data => {
    // data = [{
    //   x: 0.6,
    //   y: 0.3,
    // }]

    let positionArray = [];
    for (const hole of Object.values(data.asidedata)) {
      positionArray.push({
        x: hole.aX,
        y: hole.aY,
      });
    }
    return positionArray;
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
    } else if (String(data.parttype).trim() === "1787P-01") {
      borderColor = "rgb(1, 1, 1, 1)";
      backgroundColor = "rgb(1, 1, 1, .2)";
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

  const convertRadToDeg = radians => {
    const deg = (radians * 180) / Math.PI;
    return deg;
  };

  const getAngleOfSeparation = (deg_1, deg_2) => {
    let angleArray = [];
    angleArray.push(Math.round(Math.abs(deg_1 - deg_2)));
    angleArray.push(Math.round(Math.abs(angleArray[0] - 360)));
    // setgraphData(prevState => {
    //   return { ...prevState, thetaPrime: Math.min(...angleArray) };
    // });
    setTheta(Math.min(...angleArray));
    return Math.min(...angleArray);
  };

  // Move options to a function that sets them
  return (
    <div>
      {graphData ? (
        <div>
          <Scatter
            data={graphData}
            options={{
              aspectRatio: 1,
              onClick: (e, context) => {
                if (context.length && measureMode) {
                  if (!graphData.point_1) {
                    setgraphData(prevState => {
                      return {
                        ...prevState,
                        point_1: {
                          x: context[0]?.element["$context"]?.parsed.x,
                          y: context[0]?.element["$context"]?.parsed.y,
                        },
                      };
                    });
                  } else if (!graphData.point_2) {
                    setgraphData(prevState => {
                      return {
                        ...prevState,
                        point_2: {
                          x: context[0]?.element["$context"]?.parsed.x,
                          y: context[0]?.element["$context"]?.parsed.y,
                        },
                      };
                    });
                  }
                }
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    title: context => {
                      let index = context[0].dataIndex;
                      let holes = Object.keys(partData.csidedata);
                      let title = holes[index];
                      return title;
                    },
                    label: context => {
                      let label = [];
                      let index = context.dataIndex;
                      let holes = Object.keys(partData.csidedata);

                      // if hole failed for any given metric
                      if (
                        graphData.holePassFail[holes[index]]?.includes("cDia")
                      ) {
                        label.push(
                          "C-Dia: " + partData.csidedata[holes[index]]?.cDia
                        );
                      }
                      if (
                        graphData.holePassFail[holes[index]]?.includes("aDia")
                      ) {
                        label.push(
                          "A-Dia: " + partData.asidedata[holes[index]]?.aDia
                        );
                      }
                      if (
                        graphData.holePassFail[holes[index]]?.includes("cPos")
                      ) {
                        label.push(
                          "C-Pos: " + partData.csidedata[holes[index]]?.cXY
                        );
                      }
                      if (
                        graphData.holePassFail[holes[index]]?.includes("aPos")
                      ) {
                        label.push(
                          "A-Pos: " + partData.asidedata[holes[index]]?.aXY
                        );
                      }
                      // if hole within warning tolerances
                      if (
                        graphData.holeWarning[holes[index]]?.includes("cDia")
                      ) {
                        label.push(
                          "C-Dia: " + partData.csidedata[holes[index]]?.cDia
                        );
                      }
                      if (
                        graphData.holeWarning[holes[index]]?.includes("aDia")
                      ) {
                        label.push(
                          "A-Dia: " + partData.asidedata[holes[index]]?.aDia
                        );
                      }
                      if (
                        graphData.holeWarning[holes[index]]?.includes("cPos")
                      ) {
                        label.push(
                          "C-Pos: " + partData.csidedata[holes[index]]?.cXY
                        );
                      }
                      if (
                        graphData.holeWarning[holes[index]]?.includes("aPos")
                      ) {
                        label.push(
                          "A-Pos: " + partData.asidedata[holes[index]]?.aXY
                        );
                      }
                      return label;
                    },
                  },
                },
                zoom: {
                  pan: {
                    enabled: true,
                    modifierKey: "ctrl",
                  },
                  zoom: {
                    wheel: {
                      enabled: zoom,
                    },
                    pinch: {
                      enabled: true,
                    },
                    mode: "xy",
                  },
                  limits: {
                    x: { min: "original", max: "original" },
                    y: { min: "original", max: "original" },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  position: "center",
                },
                x: {
                  beginAtZero: true,
                  position: "center",
                },
              },
            }}
          />
        </div>
      ) : (
        <p>no data loaded</p>
      )}
    </div>
  );
};
