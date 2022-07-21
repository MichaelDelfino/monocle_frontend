import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import React, { useEffect, useState } from "react";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables, zoomPlugin, annotationPlugin);

export const LineGraph = ({ partData, metric, order }) => {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const getPartTols = async currentType => {
      let scales = {};
      let annotations = [];
      let drillOrder = [];
      let euclidMachs = [];
      let isEuclid = false;

      // define part def file, drill order file, and euclid machs file
      const defFile = "./config/partDefinitions.json";
      const orderFile = "./config/drillOrder.json";
      const euclidList = "./config/euclidMachs.json";

      let tolerances = {};
      let isAngleHole = false;

      // fetch part definitions
      const response = await fetch(defFile);
      const partDef = await response.json();

      // fetch drill order
      const orderResponse = await fetch(orderFile);
      const orderDef = await orderResponse.json();

      // fetch euclid machs
      const euclidResponse = await fetch(euclidList);
      const euclidDef = await euclidResponse.json();

      if (euclidDef.includes(partData.machine)) {
        isEuclid = true;
      }

      // pull correct info from both part def file and drill order file
      // based on part type
      for (const part of partDef) {
        if (String(part.partType).trim() === String(currentType).trim()) {
          tolerances = part.tolerances;
          isAngleHole = part.textFileSpecs.isAngleHole;
        }
      }

      for (const part of orderDef) {
        if (
          String(part.partType).trim() === String(currentType).trim() &&
          part.isEuclid === isEuclid
        ) {
          drillOrder = part.drillOrder;
        }
      }

      let allCData,
        allAData = [];

      if (metric === "diameter") {
        allCData = getCDiameters(partData, order, drillOrder);
        allAData = getADiameters(partData, order, drillOrder);
      } else {
        allCData = getCPosition(partData, order, drillOrder);
        allAData = getAPosition(partData, order, drillOrder);
      }

      const [borderColor, backgroundColor] = getPartColor(partData);
      annotations = setAnnotations(
        tolerances,
        metric,
        isAngleHole,
        borderColor
      );
      scales = setScales(metric, partData.parttype);

      setGraphData({
        tracking: partData.tracking,
        machine: partData.machine,
        partType: partData.parttype,
        tolerances: tolerances,
        isAngleHole: isAngleHole,
        annotations: annotations,
        scales: scales,
        labels: Object.keys(partData.csidedata),
        metric: metric,
        datasets: [
          {
            label: "C-Side",
            data: allCData,
            fill: false,
            borderColor: borderColor,
            backgroundColor: backgroundColor,
          },
          {
            label: "A-Side",
            data: allAData,
            fill: false,
            borderColor: "rgb(148, 148, 148, 1)",
            backgroundColor: "rgb(148, 148, 148, .2)",
          },
        ],
      });
    };
    getPartTols(partData.parttype);
  }, [partData, metric, order]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const getCDiameters = (data, order, drillOrder) => {
    let diameterArray = [];
    if (order === "insp") {
      for (const hole of Object.values(data.csidedata)) {
        diameterArray.push(hole.cDia);
      }
      return diameterArray;
    } else if (order === "drill") {
      for (const hole of drillOrder) {
        diameterArray.push(data.csidedata[hole]?.cDia);
      }
      return diameterArray;
    }
  };

  const getCPosition = (data, order, drillOrder) => {
    let positionArray = [];
    if (order === "insp") {
      for (const hole of Object.values(data.csidedata)) {
        positionArray.push(hole.cXY);
      }
      console.log(positionArray);
      return positionArray;
    } else if (order === "drill") {
      for (const hole of drillOrder) {
        positionArray.push(data.csidedata[hole]?.cXY);
      }
      return positionArray;
    }
  };

  const getADiameters = (data, order, drillOrder) => {
    let diameterArray = [];
    if (order === "insp") {
      for (const hole of Object.values(data.asidedata)) {
        diameterArray.push(hole.aDia);
      }
      return diameterArray;
    } else if (order === "drill") {
      for (const hole of drillOrder) {
        diameterArray.push(data.asidedata[hole]?.aDia);
      }
      return diameterArray;
    }
  };

  const getAPosition = (data, order, drillOrder) => {
    let positionArray = [];
    if (order === "insp") {
      for (const hole of Object.values(data.asidedata)) {
        positionArray.push(hole.aXY);
      }
      console.log(positionArray);
      return positionArray;
    } else if (order === "drill") {
      for (const hole of drillOrder) {
        positionArray.push(data.asidedata[hole]?.aXY);
      }
      return positionArray;
    }
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

  // TODO - refactor repeated code
  const setAnnotations = (tols, metric, isAngleHole, borderColor) => {
    console.log(tols);
    const annotations = [];
    if (metric === "diameter") {
      annotations.push(
        {
          type: "line",
          mode: "horizontal",
          yMin: tols["c-side"]?.diaNom - tols["c-side"]?.diaMin,
          yMax: tols["c-side"]?.diaNom - tols["c-side"]?.diaMin,
          borderColor: borderColor,
          borderWidth: 2,
        },
        {
          type: "line",
          mode: "horizontal",
          yMin: tols["c-side"]?.diaNom + tols["c-side"]?.diaPlus,
          yMax: tols["c-side"]?.diaNom + tols["c-side"]?.diaPlus,
          borderColor: borderColor,
          borderWidth: 2,
          adjustScaleRange: true,
        },
        {
          type: "line",
          mode: "horizontal",
          yMin: tols["a-side"]?.diaNom - tols["a-side"]?.diaMin,
          yMax: tols["a-side"]?.diaNom - tols["a-side"]?.diaMin,
          borderColor: "rgb(148, 148, 148, 1)",
          borderWidth: 2,
        },
        {
          type: "line",
          mode: "horizontal",
          yMin: tols["a-side"]?.diaNom + tols["a-side"]?.diaPlus,
          yMax: tols["a-side"]?.diaNom + tols["a-side"]?.diaPlus,
          borderColor: "rgb(148, 148, 148, 1)",
          borderWidth: 2,
          adjustScaleRange: true,
        }
      );
      // if (isAngleHole) {
      //   annotations.push(
      //     {
      //       type: 'line',
      //       mode: 'horizontal',
      //       yMin: tols[side]?.diaNom - tols[side]?.diaMin + 0.0015,
      //       yMax: tols[side]?.diaNom - tols[side]?.diaMin + 0.0015,
      //       borderColor: 'rgb(75, 192, 192)',
      //       backgroundColor: 'rgb(75, 192, 192)',
      //       borderWidth: 2,
      //     },
      //     {
      //       type: 'line',
      //       mode: 'horizontal',
      //       yMin: tols[side]?.diaNom + tols[side]?.diaPlus + 0.0015,
      //       yMax: tols[side]?.diaNom + tols[side]?.diaPlus + 0.0015,
      //       borderColor: 'rgb(75, 192, 192)',
      //       backgroundColor: 'rgb(75, 192, 192)',
      //       borderWidth: 2,
      //       adjustScaleRange: true,
      //     }
      //   );
      // }
    } else if (metric === "position") {
      annotations.push(
        {
          mode: "horizontal",
          yMin: tols["c-side"]?.posNom - tols["c-side"]?.posMin,
          yMax: tols["c-side"]?.posNom - tols["c-side"]?.posMin,
          borderColor: borderColor,
          borderWidth: 2,
        },
        {
          type: "line",
          mode: "horizontal",
          yMin: tols["c-side"]?.posNom + tols["c-side"]?.posPlus,
          yMax: tols["c-side"]?.posNom + tols["c-side"]?.posPlus,
          borderColor: borderColor,
          borderWidth: 2,
          adjustScaleRange: true,
        }
      );
    }
    return annotations;
  };

  const setScales = (metric, parttype) => {
    let scales = {};
    if (metric === "diameter") {
      if (parttype === "369P-01") {
        scales = {
          y: {
            max: 0.024,
            min: 0.016,
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
    } else if (metric === "position") {
      if (graphData.isAngleHole) {
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

  // Move options to a function that sets them
  return (
    <div>
      {graphData ? (
        <Line
          data={graphData}
          options={{
            maintainAspectRatio: true,
            scales: graphData.scales,
            plugins: {
              annotation: {
                annotations: graphData.annotations,
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: context => {
                    let label = context.dataset.label + ": " + context.raw;
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
                    enabled: true,
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
          }}
        />
      ) : (
        <p>no data loaded</p>
      )}
    </div>
  );
};
