import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import React, { useEffect, useState } from "react";

Chart.register(...registerables, zoomPlugin);

export const LineGraph = ({ partData, metric }) => {
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    let allCData,
      allAData = [];

    if (metric === "diameter") {
      allCData = getCDiameters(partData);
      allAData = getADiameters(partData);
    } else {
      allCData = getCPosition(partData);
      allAData = getAPosition(partData);
    }

    const [borderColor, backgroundColor] = getPartColor(partData);

    setGraphData({
      tracking: partData.tracking,
      machine: partData.machine,
      partType: partData.parttype,
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
  }, [partData, metric]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const getCDiameters = (data) => {
    let diameterArray = [];
    for (const hole of Object.values(data.csidedata)) {
      diameterArray.push(hole.cDia);
    }
    return diameterArray;
  };

  const getCPosition = (data) => {
    let positionArray = [];
    for (const hole of Object.values(data.csidedata)) {
      positionArray.push(hole.cXY);
    }
    return positionArray;
  };

  const getADiameters = (data) => {
    let diameterArray = [];
    for (const hole of Object.values(data.asidedata)) {
      diameterArray.push(hole.aDia);
    }
    return diameterArray;
  };

  const getAPosition = (data) => {
    let positionArray = [];
    for (const hole of Object.values(data.asidedata)) {
      positionArray.push(hole.aXY);
    }
    return positionArray;
  };

  const getPartColor = (data) => {
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

  // Move options to a function that sets them
  return (
    <div>
      {graphData ? (
        <Line
          data={graphData}
          options={{
            plugins: {
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (context) => {
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
