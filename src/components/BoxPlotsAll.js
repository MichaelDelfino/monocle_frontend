import { React, useState, useEffect } from "react";

// Chartjs Imports
import { Scatter } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
Chart.register(...registerables, annotationPlugin);

export default function BoxPlotsAll({
  data,
  side,
  metric,
  machHandler,
  searchHandler,
  partType,
  tols,
  isAngleHole,
  startDate,
  groupNum,
}) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    setGraphData(null);
    if (data.length) {
      let allHoleData = [];
      let datasets = [];
      let scales = {};
      let annotations = [];
      let groupedMachines = [];

      getMachineGroups(data, groupedMachines);

      if (metric === "Diameter") {
        allHoleData = getDiameters(groupedMachines[groupNum], side);
      }
      if (metric === "Position") {
        allHoleData = getPositions(groupedMachines[groupNum], side);
      }
      // const [borderColor, backgroundColor] = getPartColor(partData[0]);

      // // To handle dynamic number of parts: for part in partdata,
      // // datasets.push {label, data.partData[i].tracking}
      const setDatasets = (data, allHoleData) => {
        let datasets = [];
        let i = 0;
        for (const machine of data) {
          let singleDataset = {
            label: machine[0]?.machine,
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
      datasets = setDatasets(groupedMachines[groupNum], allHoleData);
      scales = setScales(metric, partType);
      annotations = setAnnotations(tols, metric, isAngleHole);

      setGraphData({
        datasets: datasets,
        scales: scales,
        annotations: annotations,
        groupedMachines: groupedMachines,
      });
    }
  }, [data, side, metric, groupNum]);

  const getDiameters = (data, side) => {
    let allDiametersArray = [];
    let diameterArray = [];
    let i = 0.5;
    for (const machine of data) {
      if (side === "c-side") {
        diameterArray = [];
        for (const part of machine) {
          for (const hole in part.csidedata) {
            diameterArray.push({
              x: i,
              y: parseFloat(part.csidedata[hole]?.cDia),
              tracking: part.tracking,
              date: part.timestamp,
            });
          }
          i++;
        }
        allDiametersArray.push(diameterArray);
      } else if (side === "a-side") {
        diameterArray = [];
        for (const part of machine) {
          for (const hole in part.asidedata) {
            diameterArray.push({
              x: i,
              y: parseFloat(part.asidedata[hole]?.aDia),
              tracking: part.tracking,
              date: part.timestamp,
            });
          }
          i++;
        }
        allDiametersArray.push(diameterArray);
      }
    }
    return allDiametersArray;
  };

  const getPositions = (data, side) => {
    let allPositionsArray = [];
    let positionArray = [];
    let i = 0.5;
    for (const machine of data) {
      if (side === "c-side") {
        positionArray = [];
        for (const part of machine) {
          for (const hole in part.csidedata) {
            positionArray.push({
              x: i,
              y: parseFloat(part.csidedata[hole]?.cXY),
              tracking: part.tracking,
              date: part.timestamp,
            });
          }
          i++;
        }
        allPositionsArray.push(positionArray);
      } else if (side === "a-side") {
        positionArray = [];
        for (const part of machine) {
          for (const hole in part.asidedata) {
            positionArray.push({
              x: i,
              y: parseFloat(part.asidedata[hole]?.aXY),
              tracking: part.tracking,
              date: part.timestamp,
            });
          }
          i++;
        }
        allPositionsArray.push(positionArray);
      }
    }
    return allPositionsArray;
  };

  const getPartColor = data => {
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
      case 9:
        borderColor = "rgb(247, 87, 87, 1)";
        backgroundColor = "rgb(247, 87, 87, .2)";
        break;
      case 10:
        borderColor = "rgb(0, 199, 143, 1)";
        backgroundColor = "rgb(0, 199, 143, .2)";
        break;
      case 11:
        borderColor = "rgb(117, 2, 2, 1)";
        backgroundColor = "rgb(117, 2, 2, .2)";
        break;
      case 12:
        borderColor = "rgb(77, 191, 159, 1)";
        backgroundColor = "rgb(77, 191, 159, .2)";
        break;
      case 13:
        borderColor = "rgb(88, 54, 224, 1)";
        backgroundColor = "rgb(88, 54, 224, .2)";
        break;
      default:
        break;
    }

    return borderColor;
  };

  const getRandomColor = () => {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = (num >> 8) & 255;
    var b = num & 255;
    return "rgb(" + r + ", " + g + ", " + b + ")";
  };

  const generateJitter = data => {
    return data.map(data => {
      let xJitter = Math.random() * (-0.1 - 0.1) + 0.1;
      return {
        x: data.x + xJitter,
        y: data.y,
        tracking: data.tracking,
        date: data.date,
      };
    });
  };

  // TODO - refactor repeated code
  const setAnnotations = (tols, metric, isAngleHole) => {
    const annotations = [];
    if (metric === "Diameter") {
      annotations.push(
        {
          type: "line",
          mode: "horizontal",
          yMin: tols[side]?.diaNom - tols[side]?.diaMin,
          yMax: tols[side]?.diaNom - tols[side]?.diaMin,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgb(255, 99, 132)",
          borderWidth: 2,
        },
        {
          type: "line",
          mode: "horizontal",
          yMin: tols[side]?.diaNom + tols[side]?.diaPlus,
          yMax: tols[side]?.diaNom + tols[side]?.diaPlus,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgb(255, 99, 132)",
          borderWidth: 2,
          adjustScaleRange: true,
        }
      );
      if (isAngleHole) {
        annotations.push(
          {
            type: "line",
            mode: "horizontal",
            yMin: tols[side]?.diaNom - tols[side]?.diaMin + 0.0015,
            yMax: tols[side]?.diaNom - tols[side]?.diaMin + 0.0015,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgb(75, 192, 192)",
            borderWidth: 2,
          },
          {
            type: "line",
            mode: "horizontal",
            yMin: tols[side]?.diaNom + tols[side]?.diaPlus + 0.0015,
            yMax: tols[side]?.diaNom + tols[side]?.diaPlus + 0.0015,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgb(75, 192, 192)",
            borderWidth: 2,
            adjustScaleRange: true,
          }
        );
      }
    } else if (metric === "Position") {
      annotations.push(
        {
          mode: "horizontal",
          yMin: tols[side]?.posNom - tols[side]?.posMin,
          yMax: tols[side]?.posNom - tols[side]?.posMin,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgb(255, 99, 132)",
          borderWidth: 2,
        },
        {
          type: "line",
          mode: "horizontal",
          yMin: tols[side]?.posNom + tols[side]?.posPlus,
          yMax: tols[side]?.posNom + tols[side]?.posPlus,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgb(255, 99, 132)",
          borderWidth: 2,
          adjustScaleRange: true,
        }
      );
    }
    return annotations;
  };

  const setScales = (metric, parttype) => {
    let scales = {};
    if (metric === "Diameter") {
      if (parttype === "369P-01") {
        scales = {
          y: {
            max: 0.022,
            min: 0.017,
            beginAtZero: true,
          },
          x: {
            beginAtZero: true,
          },
        };
      } else {
        scales = {
          y: {
            max: 0.0195,
            min: 0.015,
            beginAtZero: true,
          },
          x: {
            beginAtZero: true,
          },
        };
      }
    } else if (metric === "Position") {
      if (isAngleHole) {
        scales = {
          y: {
            max: 0.02,
            min: 0.0,
            beginAtZero: true,
          },
          x: {
            beginAtZero: true,
          },
        };
      } else {
        scales = {
          y: {
            max: 0.015,
            min: 0.0,
            beginAtZero: true,
          },
          x: {
            beginAtZero: true,
          },
        };
      }
    }
    return scales;
  };

  const getMachineGroups = (machines, groupedMachines) => {
    if (machines.length > 6) {
      groupedMachines.push(machines.slice(0, 6));
      getMachineGroups(machines.slice(6), groupedMachines);
    } else {
      groupedMachines.push(machines);
    }
  };

  const getFormattedDateStringFromUnix = date => {
    // resulting format: 2022-05-23T16:46
    const origDate = new Date(parseInt(date));
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

    const formattedDate = `${stringDate} ${stringTime}`;
    return formattedDate;
  };

  // Move options to a function that sets them
  return (
    <div className="boxplot-all">
      {graphData ? (
        <div className="boxplot-all">
          <Scatter
            data={graphData}
            width={"100%"}
            options={{
              // event param req even thought not used*******
              onClick: (e, context) => {
                if (context.length) {
                  searchHandler(context[0]?.element.$context.raw.tracking);
                }
              },
              maintainAspectRatio: false,
              animation: false,
              normalized: true,
              plugins: {
                annotation: {
                  annotations: graphData.annotations,
                },
                legend: {
                  // event param req even thought not used*******
                  onClick: (e, legendItem) => {
                    const tracking = legendItem.text;
                    const parttype = data[0][0].parttype;

                    machHandler(tracking, parttype, side, metric, startDate);
                  },
                  labels: {
                    font: {
                      size: 20,
                    },
                  },
                },
                tooltip: {
                  displayColors: false,
                  mode: "nearest",
                  intersect: true,
                  enabled: true,
                  callbacks: {
                    title: context => {
                      const title = `${context[0].raw.tracking}`;
                      return title;
                    },
                    label: context => {
                      const label = `${getFormattedDateStringFromUnix(
                        context.raw.date
                      )}`;
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
        <div className="loading-spinners">
          <div className="spinner-grow text-primary" role="status">
            <span className="sr-only">L</span>
          </div>
          <div className="spinner-grow text-secondary" role="status">
            <span className="sr-only">o</span>
          </div>
          <div className="spinner-grow text-success" role="status">
            <span className="sr-only">a</span>
          </div>
          <div className="spinner-grow text-danger" role="status">
            <span className="sr-only">d</span>
          </div>
          <div className="spinner-grow text-warning" role="status">
            <span className="sr-only">i</span>
          </div>
          <div className="spinner-grow text-info" role="status">
            <span className="sr-only">n</span>
          </div>
          <div className="spinner-grow text-dark" role="status">
            <span className="sr-only">g</span>
          </div>
        </div>
      )}
    </div>
  );
}
