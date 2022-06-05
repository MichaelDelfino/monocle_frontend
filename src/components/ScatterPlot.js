import React from 'react';
import { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export const ScatterPlot = ({ partData }) => {
  const [graphData, setgraphData] = useState(null);
  useEffect(() => {
    let allCPosData,
      allAPosData = [];

    allCPosData = getCPosition(partData);
    allAPosData = getAPosition(partData);

    const [borderColor, backgroundColor] = getPartColor(partData);

    setgraphData({
      tracking: partData.tracking,
      machine: partData.machine,
      partType: partData.parttype,
      labels: Object.keys(partData.csidedata),
      datasets: [
        {
          label: 'C-Side',
          data: allCPosData,
          backgroundColor: context => {
            let index = context.dataIndex;
            let holes = Object.keys(partData.csidedata);

            return getOutTol(holes[index]).length ? 'red' : borderColor;
          },
          pointRadius: context => {
            let index = context.dataIndex;
            let holes = Object.keys(partData.csidedata);
            return getOutTol(holes[index]).length ? 5 : 3;
          },
          pointHoverRadius: context => {
            let index = context.dataIndex;
            let holes = Object.keys(partData.csidedata);
            return getOutTol(holes[index]).length ? 10 : 4;
          },
          borderColor: 'black',
          borderWidth: 0.5,
        },
        // {
        //   label: 'A-Side',
        //   data: allAPosData,
        //   backgroundColor: context => {
        //     let index = context.dataIndex;
        //     let holes = Object.keys(partData.aSideData);

        //     return getOutTol(holes[index]).length
        //       ? 'red'
        //       : 'rgb(148, 148, 148, 1)';
        //   },
        //   pointRadius: context => {
        //     let index = context.dataIndex;
        //     let holes = Object.keys(partData.aSideData);
        //     return getOutTol(holes[index]).length ? 5 : 3;
        //   },
        //   pointHoverRadius: context => {
        //     let index = context.dataIndex;
        //     let holes = Object.keys(partData.aSideData);
        //     return getOutTol(holes[index]).length ? 10 : 4;
        //   },
        //   borderColor: 'black',
        //   borderWidth: 0.5,
        // },
      ],
    });
  }, [partData]);

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
    let borderColor = '';
    let backgroundColor = '';

    if (String(data.parttype).trim() === '369P-01') {
      borderColor = 'rgb(252, 186, 3, 1)';
      backgroundColor = 'rgb(252, 186, 3, .2)';
    } else if (String(data.parttype).trim() === '1789P-01') {
      borderColor = 'rgb(2, 117, 216, 1)';
      backgroundColor = 'rgb(2, 117, 216, .2)';
    } else if (String(data.parttype).trim() === '2078P-01') {
      borderColor = 'rgb(92, 184, 92, 1)';
      backgroundColor = 'rgb(92, 184, 92, .2)';
    } else if (String(data.parttype).trim() === '1534P-01') {
      borderColor = 'rgb(219, 112, 4, 1)';
      backgroundColor = 'rgb(219, 112, 4, .2)';
    } else if (String(data.parttype).trim() === '1557P-01') {
      borderColor = 'rgb(68, 242, 207, 1)';
      backgroundColor = 'rgb(68, 242, 207, .2)';
    } else if (String(data.parttype).trim() === '2129P-01') {
      borderColor = 'rgb(252, 3, 102, 1)';
      backgroundColor = 'rgb(252, 3, 102, .2)';
    } else if (String(data.parttype).trim() === '2129P-02') {
      borderColor = 'rgb(175, 104, 252, 1)';
      backgroundColor = 'rgb(175, 104, 252, .2)';
    } else if (String(data.parttype).trim() === '2129P-03') {
      borderColor = 'rgb(1, 0, 3, 1)';
      backgroundColor = 'rgb(1, 0, 3, .2)';
    } else if (String(data.parttype).trim() === '1565P-01') {
      borderColor = 'rgb(171, 194, 21, 1)';
      backgroundColor = 'rgb(171, 194, 21, .2)';
    }

    return [borderColor, backgroundColor];
  };

  // TODO - pull tols from json file, not obj to make dynamic
  const getOutTol = hole => {
    let outTol = [];
    let cDia = partData.csidedata[hole]?.cDia;
    let aDia = partData.asidedata[hole]?.aDia;
    let cPos = partData.csidedata[hole]?.cXY;
    let aPos = partData.asidedata[hole]?.aXY;
    if (
      cDia >
        partData.tolerances['c-side']['diaNom'] +
          partData.tolerances['c-side']['diaPlus'] ||
      cDia <
        partData.tolerances['c-side']['diaNom'] -
          partData.tolerances['c-side']['diaMin']
    ) {
      outTol.push('cDia');
    }
    if (
      aDia >
        partData.tolerances['a-side']['diaNom'] +
          partData.tolerances['a-side']['diaPlus'] ||
      aDia <
        partData.tolerances['a-side']['diaNom'] -
          partData.tolerances['a-side']['diaMin']
    ) {
      outTol.push('aDia');
    }
    if (
      cPos >
        partData.tolerances['c-side']['posNom'] +
          partData.tolerances['c-side']['posPlus'] ||
      cPos <
        partData.tolerances['c-side']['posNom'] -
          partData.tolerances['c-side']['posPlus']
    ) {
      outTol.push('cPos');
    }
    if (
      aPos >
        partData.tolerances['a-side']['posNom'] +
          partData.tolerances['a-side']['posPlus'] ||
      aPos <
        partData.tolerances['a-side']['posNom'] -
          partData.tolerances['a-side']['posPlus']
    ) {
      outTol.push('aPos');
    }
    return outTol;
  };

  // Move options to a function that sets them
  return (
    <div>
      {graphData ? (
        <div>
          <Scatter
            data={graphData}
            options={{
              plugins: {
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
                      if (getOutTol(holes[index])?.includes('cDia')) {
                        label.push(
                          'C-Dia: ' + partData.csidedata[holes[index]]?.cDia
                        );
                      }
                      if (getOutTol(holes[index])?.includes('aDia')) {
                        label.push(
                          'A-Dia: ' + partData.asidedata[holes[index]]?.aDia
                        );
                      }
                      if (getOutTol(holes[index])?.includes('cPos')) {
                        label.push(
                          'C-Pos: ' + partData.csidedata[holes[index]]?.cXY
                        );
                      }
                      if (getOutTol(holes[index])?.includes('aPos')) {
                        label.push(
                          'A-Pos: ' + partData.asidedata[holes[index]]?.aXY
                        );
                      }
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
                      enabled: true,
                    },
                    pinch: {
                      enabled: true,
                    },
                    mode: 'xy',
                  },
                  limits: {
                    x: { min: 'original', max: 'original' },
                    y: { min: 'original', max: 'original' },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  position: 'center',
                },
                x: {
                  beginAtZero: true,
                  position: 'center',
                },
              },
            }}
          />
          <small>Algorithm Design: Jacob Johns</small>
        </div>
      ) : (
        <p>no data loaded</p>
      )}
    </div>
  );
};
