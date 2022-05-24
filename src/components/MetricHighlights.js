import React from 'react';
import { useEffect, useState } from 'react';

export const MetricHighlights = ({ partData }) => {
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    let allCDia,
      allADia,
      allCPos,
      allAPos = [];

    allCDia = getCDiameters(partData);
    allADia = getADiameters(partData);
    allCPos = getCPosition(partData);
    allAPos = getAPosition(partData);

    setTableData({
      maxCDiameter: Math.max(...allCDia),
      minCDiameter: Math.min(...allCDia),
      maxADiameter: Math.max(...allADia),
      minADiameter: Math.min(...allADia),
      maxCPosition: Math.max(...allCPos),
      minCPosition: Math.min(...allCPos),
      maxAPosition: Math.max(...allAPos),
      minAPosition: Math.min(...allAPos),
    });

    if (tableData) {
      setHighlightColors(partData, tableData);
    }
  }, [partData, tableData]);

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

  // Refactor method to reduce repeated code
  const setHighlightColors = (partData, tableData) => {
    const lights = document.querySelectorAll('.light');
    for (const el of lights) {
      el.setAttribute('fill', '#20c997');
    }

    if (
      tableData.maxCDiameter >
      partData.tolerances['c-side']['diaNom'] +
        partData.tolerances['c-side']['diaPlus']
    ) {
      const maxCDiaColor = document.querySelector('.c-max-dia-light');
      maxCDiaColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.maxADiameter >
      partData.tolerances['a-side']['diaNom'] +
        partData.tolerances['a-side']['diaPlus']
    ) {
      const maxADiaColor = document.querySelector('.a-max-dia-light');
      maxADiaColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.minCDiameter <
      partData.tolerances['c-side']['diaNom'] -
        partData.tolerances['c-side']['diaMin']
    ) {
      const minCDiaColor = document.querySelector('.c-min-dia-light');
      minCDiaColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.minADiameter <
      partData.tolerances['a-side']['diaNom'] -
        partData.tolerances['a-side']['diaMin']
    ) {
      const minADiaColor = document.querySelector('.a-min-dia-light');
      minADiaColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.maxCPosition >
      partData.tolerances['c-side']['posNom'] +
        partData.tolerances['c-side']['posPlus']
    ) {
      const maxCPosColor = document.querySelector('.c-max-pos-light');
      maxCPosColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.maxAPosition >
      partData.tolerances['a-side']['posNom'] +
        partData.tolerances['a-side']['posPlus']
    ) {
      const maxAPosColor = document.querySelector('.a-max-pos-light');
      maxAPosColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.minCPosition <
      partData.tolerances['c-side']['posNom'] -
        partData.tolerances['c-side']['posMin']
    ) {
      const minCPosColor = document.querySelector('.c-min-pos-light');
      minCPosColor.setAttribute('fill', '#f54242');
    }
    if (
      tableData.minAPosition <
      partData.tolerances['a-side']['posNom'] -
        partData.tolerances['a-side']['posMin']
    ) {
      const minAPosColor = document.querySelector('.a-min-pos-light');
      minAPosColor.setAttribute('fill', '#f54242');
    }
  };

  return (
    <div className="highlight-tables">
      <div className="c-side-highlight-table">
        <h1 className="display-5">C-Side</h1>
        <hr></hr>
        <div className="c-side-highlights">
          <div className="c-dia-highlights">
            <div className="card">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light c-max-dia-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Max Diameter</h5>
                {tableData && isFinite(tableData.maxCDiameter) ? (
                  <p className="card-text">{tableData.maxCDiameter}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
            <div className="card" aria-hidden="true">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light c-min-dia-light "
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Min Diameter</h5>
                {tableData && isFinite(tableData.minCDiameter) ? (
                  <p className="card-text">{tableData.minCDiameter}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
          </div>
          <div className="c-pos-highlights">
            <div className="card">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light c-max-pos-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Max Position</h5>
                {tableData && isFinite(tableData.maxCPosition) ? (
                  <p className="card-text">{tableData.maxCPosition}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
            <div className="card" aria-hidden="true">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light c-min-pos-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Min Position</h5>
                {tableData && isFinite(tableData.minCPosition) ? (
                  <p className="card-text">{tableData.minCPosition}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="a-side-highlight-table">
        <h1 className="display-5">A-Side</h1>
        <hr></hr>
        <div className="a-side-highlights">
          <div className="a-dia-highlights">
            <div className="card">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light a-max-dia-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Max Diameter</h5>
                {tableData && isFinite(tableData.maxADiameter) ? (
                  <p className="card-text">{tableData.maxADiameter}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
            <div className="card " aria-hidden="true">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light a-min-dia-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Min Diameter</h5>
                {tableData && isFinite(tableData.minADiameter) ? (
                  <p className="card-text">{tableData.minADiameter}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
          </div>
          <div className="a-pos-highlights">
            <div className="card">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light a-max-pos-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Max Position</h5>
                {tableData && isFinite(tableData.maxAPosition) ? (
                  <p className="card-text">{tableData.maxAPosition}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
            <div className="card " aria-hidden="true">
              <svg
                className="bd-placeholder-img card-img-top"
                width="100%"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <rect
                  className="light a-min-pos-light"
                  width="100%"
                  height="100%"
                  fill="#20c997"
                ></rect>
              </svg>
              <div className="card-body placeholder-glow">
                <h5 className="card-title">Min Position</h5>
                {tableData && isFinite(tableData.minAPosition) ? (
                  <p className="card-text">{tableData.minAPosition}</p>
                ) : (
                  <span className="card-text placeholder col-9"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
