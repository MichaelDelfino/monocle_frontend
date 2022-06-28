import React from 'react';
import { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, annotationPlugin);

export default function BoxPlots({
  partData,
  side,
  metric,
  searchHandler,
  tols,
  parttype,
  isAngleHole,
}) {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    let allHoleData = [];
    let datasets = [];
    let scales = {};
    let annotations = [];

    if (metric === 'Diameter') {
      allHoleData = getDiameters(partData, side);
    }
    if (metric === 'Position') {
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
          borderColor: 'black',
          borderWidth: 0.5,
        };
        datasets.push(singleDataset);
        i++;
      }
      return datasets;
    };
    datasets = setDatasets(partData, allHoleData);
    scales = setScales(metric, parttype, isAngleHole);
    annotations = setAnnotations(tols, metric, isAngleHole);

    setGraphData({
      datasets: datasets,
      scales: scales,
      annotations: annotations,
    });
  }, [partData, side, metric]);

  const getDiameters = (data, side) => {
    let allDiametersArray = [];
    let i = 0;
    if (side === 'c-side') {
      for (const part of data) {
        let diameterArray = [];
        for (const hole in part.csidedata) {
          diameterArray.push({
            x: i + 0.5,
            y: parseFloat(part.csidedata[hole]?.cDia),
            tracking: part.tracking,
            date: part.timestamp,
          });
        }
        allDiametersArray.push(diameterArray);
        i++;
      }
    } else if (side === 'a-side') {
      for (const part of data) {
        let diameterArray = [];
        for (const hole in part.asidedata) {
          diameterArray.push({
            x: i + 0.5,
            y: parseFloat(part.asidedata[hole]?.aDia),
            tracking: part.tracking,
            date: part.timestamp,
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
    if (side === 'c-side') {
      for (const part of data) {
        let positionsArray = [];
        for (const hole in part.csidedata) {
          positionsArray.push({
            x: i + 0.5,
            y: parseFloat(part.csidedata[hole]?.cXY),
            tracking: part.tracking,
            date: part.timestamp,
          });
        }
        allPositionsArray.push(positionsArray);
        i++;
      }
    } else if (side === 'a-side') {
      for (const part of data) {
        let positionsArray = [];
        for (const hole in part.asidedata) {
          positionsArray.push({
            x: i + 0.5,
            y: parseFloat(part.asidedata[hole]?.aXY),
            tracking: part.tracking,
            date: part.timestamp,
          });
        }
        allPositionsArray.push(positionsArray);
        i++;
      }
    }
    return allPositionsArray;
  };

  const getPartColor = data => {
    let borderColor = '';
    let backgroundColor = '';

    switch (data) {
      case 0:
        borderColor = 'rgb(252, 186, 3, 1)';
        backgroundColor = 'rgb(252, 186, 3, .2)';
        break;
      case 1:
        borderColor = 'rgb(2, 117, 216, 1)';
        backgroundColor = 'rgb(2, 117, 216, .2)';
        break;
      case 2:
        borderColor = 'rgb(92, 184, 92, 1)';
        backgroundColor = 'rgb(92, 184, 92, .2)';
        break;
      case 3:
        borderColor = 'rgb(219, 112, 4, 1)';
        backgroundColor = 'rgb(219, 112, 4, .2)';
        break;
      case 4:
        borderColor = 'rgb(68, 242, 207, 1)';
        backgroundColor = 'rgb(68, 242, 207, .2)';
        break;
      case 5:
        borderColor = 'rgb(252, 3, 102, 1)';
        backgroundColor = 'rgb(252, 3, 102, .2)';
        break;
      case 6:
        borderColor = 'rgb(175, 104, 252, 1)';
        backgroundColor = 'rgb(175, 104, 252, .2)';
        break;
      case 7:
        borderColor = 'rgb(1, 0, 3, 1)';
        backgroundColor = 'rgb(1, 0, 3, .2)';
        break;
      case 8:
        borderColor = 'rgb(171, 194, 21, 1)';
        backgroundColor = 'rgb(171, 194, 21, .2)';
        break;
      default:
        break;
    }

    return borderColor;
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

  const setScales = (metric, parttype) => {
    let scales = {};
    if (metric === 'Diameter') {
      if (parttype === '369P-01') {
        scales = {
          y: {
            max: 0.023,
            min: 0.015,
            beginAtZero: true,
          },
          x: {
            beginAtZero: true,
          },
        };
      } else {
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
      }
    } else if (metric === 'Position') {
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
            max: 0.01,
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

  // TODO - refactor repeated code
  const setAnnotations = (tols, metric, isAngleHole) => {
    const annotations = [];
    if (metric === 'Diameter') {
      annotations.push(
        {
          type: 'line',
          mode: 'horizontal',
          yMin: tols[side]?.diaNom - tols[side]?.diaMin,
          yMax: tols[side]?.diaNom - tols[side]?.diaMin,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
        },
        {
          type: 'line',
          mode: 'horizontal',
          yMin: tols[side]?.diaNom + tols[side]?.diaPlus,
          yMax: tols[side]?.diaNom + tols[side]?.diaPlus,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          adjustScaleRange: true,
        }
      );
      if (isAngleHole) {
        annotations.push(
          {
            type: 'line',
            mode: 'horizontal',
            yMin: tols[side]?.diaNom - tols[side]?.diaMin + 0.0015,
            yMax: tols[side]?.diaNom - tols[side]?.diaMin + 0.0015,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
          },
          {
            type: 'line',
            mode: 'horizontal',
            yMin: tols[side]?.diaNom + tols[side]?.diaPlus + 0.0015,
            yMax: tols[side]?.diaNom + tols[side]?.diaPlus + 0.0015,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            adjustScaleRange: true,
          }
        );
      }
    } else if (metric === 'Position') {
      annotations.push(
        {
          type: 'line',
          mode: 'horizontal',
          yMin: tols[side]?.posNom - tols[side]?.posMin,
          yMax: tols[side]?.posNom - tols[side]?.posMin,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
        },
        {
          type: 'line',
          mode: 'horizontal',
          yMin: tols[side]?.posNom + tols[side]?.posPlus,
          yMax: tols[side]?.posNom + tols[side]?.posPlus,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          adjustScaleRange: true,
        }
      );
    }
    return annotations;
  };

  const getFormattedDateStringFromUnix = date => {
    // resulting format: 2022-05-23T16:46
    const origDate = new Date(parseInt(date));
    const stringDate = origDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const stringTime = origDate
      .toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace('AM', '')
      .replace('PM', '')
      .trim();

    const formattedDate = `${stringDate} ${stringTime}`;
    return formattedDate;
  };

  // Move options to a function that sets them
  return (
    <div className="boxplot">
      {graphData ? (
        <div className="boxplot">
          <Scatter
            data={graphData}
            options={{
              // event param req even thought not used*******
              onClick: (e, context) => {
                if (context.length) {
                  searchHandler(context[0]?.element.$context.raw.tracking);
                }
              },
              maintainAspectRatio: true,
              parsing: true,
              normalized: true,
              plugins: {
                annotation: {
                  annotations: graphData.annotations,
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
                  displayColors: false,
                  mode: 'nearest',
                  intersect: true,
                  enabled: true,
                  callbacks: {
                    title: context => {
                      console.log(context[0].raw);
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
                    modifierKey: 'ctrl',
                  },
                  zoom: {
                    wheel: {
                      enabled: false,
                    },
                    pinch: {
                      enabled: false,
                    },
                    mode: 'xy',
                  },
                  limits: {
                    x: { min: 'original', max: 'original' },
                    y: { min: 'original', max: 'original' },
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
