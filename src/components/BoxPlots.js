import React from "react";
import { useState, useEffect } from "react";
import { Scatter } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function BoxPlots({ partData, side, metric, searchHandler }) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    let allHoleData = [];
    let datasets = [];
    let scales = {};

    if (metric === "Diameter") {
      allHoleData = getDiameters(partData, side);
    }
    if (metric === "Position") {
      allHoleData = getPositions(partData, side);
    }
    // const [borderColor, backgroundColor] = getPartColor(partData[0]);

    // // To handle dynamic number of parts: for part in partdata,
    // // datasets.push {label, data.partData[i].tracking}
    const setDatasets = (data, allHoleData) => {
      let datasets = [];
      let i = 0;
      for (const part of data) {
        let singleDataset = {
          label: data[i]?.tracking,
          data: generateJitter(allHoleData[i]),
          backgroundColor: getPartColor(i),
          borderColor: "black",
          borderWidth: 0.5,
        };
        datasets.push(singleDataset);
        i++;
      }
      return datasets;
    };
    datasets = setDatasets(partData, allHoleData);
    scales = setScales(metric);

    setGraphData({
      datasets: datasets,
      scales: scales,
    });
  }, [partData, side, metric]);

  const getDiameters = (data, side) => {
    let allDiametersArray = [];
    let i = 0;
    if (side === "C-Side") {
      for (const part of data) {
        let diameterArray = [];
        for (const hole in part.csidedata) {
          diameterArray.push({
            x: i + 0.5,
            y: parseFloat(part.csidedata[hole]?.cDia),
          });
        }
        allDiametersArray.push(diameterArray);
        i++;
      }
    } else if (side === "A-Side") {
      for (const part of data) {
        let diameterArray = [];
        for (const hole in part.asidedata) {
          diameterArray.push({
            x: i + 0.5,
            y: parseFloat(part.asidedata[hole]?.aDia),
          });
        }
        allDiametersArray.push(diameterArray);
        i++;
      }
    }
    return allDiametersArray;
  };

  const getPositions = (data, side) => {
    let allPositionsArray = [];
    let i = 0;
    if (side === "C-Side") {
      for (const part of data) {
        let positionsArray = [];
        for (const hole in part.csidedata) {
          positionsArray.push({
            x: i + 0.5,
            y: parseFloat(part.csidedata[hole]?.cXY),
          });
        }
        allPositionsArray.push(positionsArray);
        i++;
      }
    } else if (side === "A-Side") {
      for (const part of data) {
        let positionsArray = [];
        for (const hole in part.asidedata) {
          positionsArray.push({
            x: i + 0.5,
            y: parseFloat(part.asidedata[hole]?.aXY),
          });
        }
        allPositionsArray.push(positionsArray);
        i++;
      }
    }
    return allPositionsArray;
  };

  const getPartColor = (data) => {
    let borderColor = "";
    let backgroundColor = "";

    switch (data) {
      case 0:
        borderColor = "rgb(252, 186, 3, 1)";
        backgroundColor = "rgb(252, 186, 3, .2)";
        break;
      case 1:
        borderColor = "rgb(2, 117, 216, 1)";
        backgroundColor = "rgb(2, 117, 216, .2)";
        break;
      case 2:
        borderColor = "rgb(92, 184, 92, 1)";
        backgroundColor = "rgb(92, 184, 92, .2)";
        break;
      case 3:
        borderColor = "rgb(219, 112, 4, 1)";
        backgroundColor = "rgb(219, 112, 4, .2)";
        break;
      case 4:
        borderColor = "rgb(68, 242, 207, 1)";
        backgroundColor = "rgb(68, 242, 207, .2)";
        break;
      case 5:
        borderColor = "rgb(252, 3, 102, 1)";
        backgroundColor = "rgb(252, 3, 102, .2)";
        break;
      case 6:
        borderColor = "rgb(175, 104, 252, 1)";
        backgroundColor = "rgb(175, 104, 252, .2)";
        break;
      case 7:
        borderColor = "rgb(1, 0, 3, 1)";
        backgroundColor = "rgb(1, 0, 3, .2)";
        break;
      case 8:
        borderColor = "rgb(171, 194, 21, 1)";
        backgroundColor = "rgb(171, 194, 21, .2)";
        break;
      default:
        break;
    }

    return borderColor;
  };

  const generateJitter = (data) => {
    return data.map((data) => {
      let xJitter = Math.random() * (-0.1 - 0.1) + 0.1;
      return {
        x: data.x + xJitter,
        y: data.y,
      };
    });
  };

  const setScales = (metric) => {
    let scales = {};
    if (metric === "Diameter") {
      scales = {
        y: {
          max: 0.02,
          min: 0.014,
          beginAtZero: true,
        },
        x: {
          beginAtZero: true,
        },
      };
    } else if (metric === "Position") {
      scales = {
        y: {
          max: 0.01,
          min: 0.0,
          beginAtZero: true,
        },
        x: {
          beginAtZero: true,
        },
      };
    }
    return scales;
  };

  return (
    <div>
      {graphData ? (
        <div>
          <Scatter
            data={graphData}
            options={{
              parsing: false,
              normalized: true,
              plugins: {
                annotation: {
                  annotations: {
                    line1: {
                      type: "line",
                      yMin: 0.016,
                      yMax: 0.016,
                      borderColor: "rgb(255, 99, 132)",
                      borderWidth: 2,
                    },
                  },
                },
                legend: {
                  onClick: (e, legendItem) => {
                    const tracking = legendItem.text;
                    searchHandler(tracking);
                  },
                  labels: {
                    font: {
                      size: 20,
                    },
                  },
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (context) => {
                      console.log(context);
                      let index = context.dataIndex;
                      let label = `Hole ${
                        Object.keys(context.dataset.data)[index + 1]
                      }: ${context.raw.y}`;
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
                      enabled: false,
                    },
                    pinch: {
                      enabled: false,
                    },
                    mode: "xy",
                  },
                  limits: {
                    x: { min: "original", max: "original" },
                    y: { min: "original", max: "original" },
                  },
                },
              },
              scales: graphData.scales,
            }}
          />
        </div>
      ) : (
        <p>no data loaded</p>
      )}
    </div>
  );
}
